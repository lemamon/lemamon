/**
 * lib/forms.ts — envio ao Netlify Forms (timeout, retry com backoff, honeypot,
 * tempo mínimo), validação de campos e protocolo (BLUEPRINT §7.5, §7.6, §7.10).
 */
import { describe, expect, it, vi } from "vitest";

import {
  encodeForm,
  FORM_FIELDS,
  formatPhone,
  formatPhoneBR,
  generateProtocol,
  isInternationalPhone,
  isValidEmail,
  isValidPhone,
  isValidPhoneBR,
  isValidProtocol,
  MIN_FILL_MS,
  phoneDigits,
  phoneNeedsCountryCode,
  PROTOCOL_ALPHABET,
  submitNetlifyForm,
  SUBMIT_MAX_ATTEMPTS,
} from "@/lib/forms";

const okResponse = (status = 200) => ({ ok: status >= 200 && status < 300, status }) as Response;
const noSleep = () => Promise.resolve();

describe("encodeForm", () => {
  it("leva o form-name e só os campos do schema", () => {
    const body = new URLSearchParams(
      encodeForm("contato", { name: "Ana", email: "ana@x.com", ...({ intruso: "x" } as object) }),
    );
    expect(body.get("form-name")).toBe("contato");
    expect(body.get("name")).toBe("Ana");
    expect(body.get("intruso")).toBeNull();
  });

  it("os campos não variam por idioma e incluem o honeypot", () => {
    expect(FORM_FIELDS.briefing).toContain("bot-field");
    expect(FORM_FIELDS.contato).toContain("bot-field");
    expect(FORM_FIELDS.briefing).toEqual(
      expect.arrayContaining(["answers", "summary", "score", "protocol", "lang", "attribution", "gclid"]),
    );
  });
});

describe("submitNetlifyForm", () => {
  it("sucesso na primeira tentativa: POST url-encoded para /", async () => {
    const fetchImpl = vi.fn(async () => okResponse());
    const result = await submitNetlifyForm("contato", { name: "Ana" }, { fetchImpl, sleep: noSleep });
    expect(result).toEqual({ ok: true, attempts: 1 });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });

  it("5xx repete com backoff (600 ms, 1,2 s) e devolve server depois de 3 tentativas", async () => {
    const fetchImpl = vi.fn(async () => okResponse(503));
    const sleep = vi.fn((_ms: number) => Promise.resolve());
    const result = await submitNetlifyForm("briefing", { name: "Ana" }, { fetchImpl, sleep });
    expect(fetchImpl).toHaveBeenCalledTimes(SUBMIT_MAX_ATTEMPTS);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([600, 1200]);
    expect(result).toEqual({ ok: false, reason: "server", attempts: 3, status: 503 });
  });

  it("falha de rede seguida de sucesso: conta as tentativas", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(okResponse());
    const result = await submitNetlifyForm("briefing", {}, { fetchImpl, sleep: noSleep });
    expect(result).toEqual({ ok: true, attempts: 2 });
  });

  it("4xx não repete (o pedido em si está errado)", async () => {
    const fetchImpl = vi.fn(async () => okResponse(404));
    const result = await submitNetlifyForm("briefing", {}, { fetchImpl, sleep: noSleep });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, reason: "rejected", attempts: 1, status: 404 });
  });

  it("timeout aborta a tentativa e vira reason=timeout", async () => {
    const fetchImpl = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
        }),
    );
    const result = await submitNetlifyForm("briefing", {}, { fetchImpl, sleep: noSleep, timeoutMs: 5, maxAttempts: 2 });
    expect(result).toEqual({ ok: false, reason: "timeout", attempts: 2 });
  });

  it("honeypot preenchido: descarta em silêncio, sem rede", async () => {
    const fetchImpl = vi.fn(async () => okResponse());
    const result = await submitNetlifyForm("briefing", { "bot-field": "http://spam" }, { fetchImpl });
    expect(result).toEqual({ ok: false, reason: "spam", attempts: 0 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("envio mais rápido que o tempo mínimo é robô; depois dele, passa", async () => {
    const fetchImpl = vi.fn(async () => okResponse());
    const fast = await submitNetlifyForm("contato", { name: "Ana" }, { fetchImpl, startedAt: 1_000, now: () => 1_000 + MIN_FILL_MS - 1 });
    expect(fast.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
    const human = await submitNetlifyForm("contato", { name: "Ana" }, { fetchImpl, startedAt: 1_000, now: () => 1_000 + MIN_FILL_MS });
    expect(human).toEqual({ ok: true, attempts: 1 });
  });
});

describe("validação", () => {
  it("e-mail", () => {
    expect(isValidEmail("ana@empresa.com")).toBe(true);
    expect(isValidEmail(" ana@empresa.com.br ")).toBe(true);
    expect(isValidEmail("ana@")).toBe(false);
    expect(isValidEmail("ana empresa.com")).toBe(false);
  });

  it("telefone BR com DDD (10 ou 11 dígitos), aceita +55", () => {
    expect(isValidPhoneBR("(48) 99999-8888")).toBe(true);
    expect(isValidPhoneBR("4833334444")).toBe(true);
    expect(isValidPhoneBR("+55 48 99999-8888")).toBe(true);
    expect(isValidPhoneBR("99999-9999")).toBe(false);
    expect(isValidPhoneBR("(48) 89999-8888")).toBe(false);
    expect(isValidPhoneBR("(08) 99999-8888")).toBe(false);
    expect(phoneDigits("+55 (48) 99999-8888")).toBe("48999998888");
  });

  it("máscara progressiva sem bloquear colagem", () => {
    expect(formatPhoneBR("48999998888")).toBe("(48) 99999-8888");
    expect(formatPhoneBR("4833334444")).toBe("(48) 3333-4444");
    expect(formatPhoneBR("+55 48 99999 8888")).toBe("(48) 99999-8888");
    expect(formatPhoneBR("489")).toBe("(48) 9");
    expect(formatPhoneBR("4")).toBe("(4");
    expect(formatPhoneBR("")).toBe("");
  });
});

describe("telefone internacional (/en e /es)", () => {
  it("com + e código do país diferente de 55: sem máscara BR", () => {
    expect(isInternationalPhone("+1 415 555 0100")).toBe(true);
    expect(isInternationalPhone("+55 48 99999 8888")).toBe(false);
    expect(isInternationalPhone("48999998888")).toBe(false);
    expect(formatPhoneBR("+1 415 555 0100")).toBe("+1 415 555 0100");
    expect(formatPhoneBR("+44 7911 123456")).toBe("+44 7911 123456");
    expect(formatPhoneBR("+1 (415) 555-0100")).toBe("+1 (415) 555-0100");
    expect(formatPhoneBR("+")).toBe("+");
    // +55 completo continua com a máscara BR (colar do celular).
    expect(formatPhoneBR("+55 48 99999 8888")).toBe("(48) 99999-8888");
  });

  it("válido com 8 a 15 dígitos (E.164); +55 segue a regra BR", () => {
    expect(isValidPhone("+1 202 555 0123")).toBe(true);
    expect(isValidPhone("+44 7911 123456")).toBe(true);
    expect(isValidPhone("+1 415")).toBe(false);
    expect(isValidPhone("+1 4155550100 12345")).toBe(false);
    expect(isValidPhone("+55 48 9999")).toBe(false);
    expect(isValidPhone("+55 48 99999-8888")).toBe(true);
    expect(isValidPhone("(48) 99999-8888")).toBe(true);
    expect(isValidPhone("99999-9999")).toBe(false);
  });
});

describe("telefone por idioma: em /en e /es, só com + e código do país", () => {
  it("pt mantém a regra brasileira (com e sem +55) e o internacional com +", () => {
    expect(phoneNeedsCountryCode("pt")).toBe(false);
    expect(isValidPhone("(48) 99999-8888", "pt")).toBe(true);
    expect(isValidPhone("5512345678", "pt")).toBe(true);
    expect(isValidPhone("+52 55 1234 5678", "pt")).toBe(true);
    expect(formatPhone("48999998888", "pt")).toBe("(48) 99999-8888");
  });

  it("es/en: celular do México ou de Buenos Aires sem + é inválido e não vira (55) …", () => {
    for (const locale of ["en", "es"] as const) {
      expect(phoneNeedsCountryCode(locale)).toBe(true);
      // Cidade do México e Buenos Aires digitados sem o código do país.
      expect(formatPhone("5512345678", locale)).toBe("5512345678");
      expect(isValidPhone("5512345678", locale)).toBe(false);
      expect(formatPhone("1123456789", locale)).toBe("1123456789");
      expect(isValidPhone("1123456789", locale)).toBe(false);
      // Brasileiro sem + também precisa do código do país fora do pt.
      expect(isValidPhone("(48) 99999-8888", locale)).toBe(false);
    }
  });

  it("es/en: com + e código do país vale, sem máscara BR; +55 completo segue a regra BR", () => {
    for (const locale of ["en", "es"] as const) {
      expect(formatPhone("+52 55 1234 5678", locale)).toBe("+52 55 1234 5678");
      expect(isValidPhone("+52 55 1234 5678", locale)).toBe(true);
      expect(isValidPhone("+54 9 11 2345 6789", locale)).toBe(true);
      expect(isValidPhone("+1 415 555 0100", locale)).toBe(true);
      expect(formatPhone("+55 48 99999-8888", locale)).toBe("+55 48 99999-8888");
      expect(isValidPhone("+55 48 99999-8888", locale)).toBe(true);
      expect(isValidPhone("+55 12345678", locale)).toBe(false);
    }
  });

  it("a limpeza mantém o + e o espaço digitado depois do código do país", () => {
    expect(formatPhone("+52 ", "es")).toBe("+52 ");
    expect(formatPhone("  +1  (415) abc 555", "en")).toBe("+1 (415) 555");
    expect(formatPhoneBR("+1 ")).toBe("+1 ");
    expect(formatPhone("", "es")).toBe("");
  });
});

describe("envio de teste em deploy preview (B277)", () => {
  it("preview não chama a rede e conta como sucesso de teste", async () => {
    const fetchImpl = vi.fn();
    const result = await submitNetlifyForm("briefing", { name: "Ana" }, { fetchImpl, preview: true });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, attempts: 0, preview: true });
  });

  it("só deploy-preview e branch-deploy são envio de teste; local, E2E e produção enviam", async () => {
    const { isPreviewSubmitContext } = await import("@/lib/forms");
    expect(isPreviewSubmitContext("deploy-preview")).toBe(true);
    expect(isPreviewSubmitContext("branch-deploy")).toBe(true);
    expect(isPreviewSubmitContext("production")).toBe(false);
    expect(isPreviewSubmitContext("local")).toBe(false);
    expect(isPreviewSubmitContext("")).toBe(false);
  });

  it("navegador automatizado sem o stub do E2E também faz envio de teste; só a marca explícita do E2E envia", async () => {
    const { previewSubmitActive, REAL_SUBMIT_FLAG } = await import("@/lib/forms");
    // Playwright/sonda sem a marca (navigator.webdriver não muda nada): teste.
    expect(previewSubmitActive(true, {})).toBe(true);
    expect(previewSubmitActive(true, { webdriver: true })).toBe(true);
    // E2E que intercepta o POST (addInitScript com a marca): caminho real.
    expect(previewSubmitActive(true, { [REAL_SUBMIT_FLAG]: true })).toBe(false);
    // Valor que não é exatamente true não liga o envio real.
    expect(previewSubmitActive(true, { [REAL_SUBMIT_FLAG]: "true" })).toBe(true);
    // Fora do preview, sempre real.
    expect(previewSubmitActive(false, {})).toBe(false);
  });

  it("robô continua descartado antes do preview", async () => {
    const fetchImpl = vi.fn();
    const result = await submitNetlifyForm("briefing", { name: "Ana", "bot-field": "x" }, { fetchImpl, preview: true });
    expect(result).toMatchObject({ ok: false, reason: "spam" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("protocolo LEM-AAAAMMDD-XXXX", () => {
  it("formato, data local e alfabeto sem caracteres ambíguos", () => {
    const code = generateProtocol(new Date(2026, 9, 9, 23, 59), () => [0, 1, 2, 31]);
    expect(code).toBe(`LEM-20261009-ABC${PROTOCOL_ALPHABET[31]}`);
    expect(isValidProtocol(code)).toBe(true);
    expect(PROTOCOL_ALPHABET).not.toMatch(/[01IO]/);
  });

  it("sufixo aleatório (crypto) varia", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateProtocol(new Date(2026, 0, 1))));
    expect(codes.size).toBeGreaterThan(45);
    for (const code of codes) expect(isValidProtocol(code)).toBe(true);
  });
});
