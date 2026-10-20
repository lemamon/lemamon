/**
 * lib/analytics.ts — track() tipado e no-op sem GA4, conversão do Ads só com a
 * tag e com espera pelo hit, PageAction no New Relic e captura de atribuição
 * (BLUEPRINT §7.1, §7.11, §10.2; backlog B018, B272).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

type Analytics = typeof import("@/lib/analytics");

async function load(env: Record<string, string> = {}): Promise<Analytics> {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("@/lib/analytics");
}

function fakeWindow(extra: Record<string, unknown> = {}) {
  const win = { location: { pathname: "/", search: "", host: "lemamon.dev" }, ...extra };
  vi.stubGlobal("window", win);
  return win as unknown as Window;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("track()", () => {
  it("no-op sem PUBLIC_GA4_ID, mesmo com gtag carregado (tag do Ads)", async () => {
    const gtag = vi.fn();
    fakeWindow({ gtag });
    const { track } = await load({ PUBLIC_GA4_ID: "" });
    track("wizard_start", { entry_source: "direct" });
    expect(gtag).not.toHaveBeenCalled();
  });

  it("com GA4 e gtag, envia o evento com os parâmetros SÓ para o GA4 (send_to, B052)", async () => {
    const gtag = vi.fn();
    fakeWindow({ gtag });
    const { track } = await load({ PUBLIC_GA4_ID: "G-TESTE" });
    track("wizard_step", { step: 2, question_id: "build_type" });
    expect(gtag).toHaveBeenCalledWith("event", "wizard_step", { step: 2, question_id: "build_type", send_to: "G-TESTE" });
    track("lead_submitted", {
      score: "A",
      stage: "problem_unclear",
      build_type: "ops_system",
      deadline: "asap",
      budget: "tier_2",
      role: "i_decide",
      pain: "manual_process",
    });
    const [, , params] = gtag.mock.calls.at(-1) ?? [];
    expect((params as { send_to?: string }).send_to).toBe("G-TESTE");
    // O Ads nunca recebe o evento enriquecido por track().
    const { GOOGLE_ADS } = await import("@/config/site");
    for (const call of gtag.mock.calls) expect(JSON.stringify(call)).not.toContain(GOOGLE_ADS.id);
  });

  it("beacon: transport_type para o hit sair com a página fechando (wizard_abandon)", async () => {
    const gtag = vi.fn();
    fakeWindow({ gtag });
    const { track } = await load({ PUBLIC_GA4_ID: "G-TESTE" });
    track("wizard_abandon", { last_step: 2, question_id: "build_type", time_in_wizard_ms: 1_000, trigger: "pagehide" }, { beacon: true });
    expect(gtag).toHaveBeenCalledWith("event", "wizard_abandon", {
      last_step: 2,
      question_id: "build_type",
      time_in_wizard_ms: 1_000,
      trigger: "pagehide",
      send_to: "G-TESTE",
      transport_type: "beacon",
    });
  });

  it("sem window (SSR): não lança", async () => {
    const { track } = await load({ PUBLIC_GA4_ID: "G-TESTE" });
    expect(() => track("summary_copy", {})).not.toThrow();
  });
});

describe("reportAdsConversion()", () => {
  it("sem tag do Ads: resolve na hora, sem nada a enviar", async () => {
    fakeWindow();
    const { reportAdsConversion } = await load();
    await expect(reportAdsConversion()).resolves.toBeUndefined();
  });

  it("com gtag: envia a conversão do send_to configurado e espera o callback", async () => {
    const gtag = vi.fn((_cmd: string, _name: string, params: { event_callback?: () => void }) => params.event_callback?.());
    fakeWindow({ gtag });
    const { reportAdsConversion } = await load();
    const { GOOGLE_ADS } = await import("@/config/site");
    await reportAdsConversion(5_000);
    expect(gtag).toHaveBeenCalledWith("event", "conversion", expect.objectContaining({ send_to: GOOGLE_ADS.conversionSendTo }));
  });

  it("transaction_id = código do pedido (deduplicação da conversão, B339)", async () => {
    const gtag = vi.fn((_cmd: string, _name: string, params: { event_callback?: () => void }) => params.event_callback?.());
    fakeWindow({ gtag });
    const { reportAdsConversion } = await load();
    await reportAdsConversion(5_000, "LEM-20261020-ABCD");
    expect(gtag).toHaveBeenCalledWith("event", "conversion", expect.objectContaining({ transaction_id: "LEM-20261020-ABCD" }));
  });

  it("callback que nunca chega: resolve no tempo máximo (a navegação não trava)", async () => {
    vi.useFakeTimers();
    fakeWindow({ gtag: vi.fn() });
    const { reportAdsConversion } = await load();
    const done = vi.fn();
    void reportAdsConversion(1_000).then(done);
    await vi.advanceTimersByTimeAsync(999);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("só o snippet antigo gtag_report_conversion: usa o snippet", async () => {
    const snippet = vi.fn();
    fakeWindow({ gtag_report_conversion: snippet });
    const { reportAdsConversion } = await load();
    await reportAdsConversion();
    expect(snippet).toHaveBeenCalledOnce();
  });
});

describe("reportError()", () => {
  it("vira PageAction no New Relic; sem agente, no-op", async () => {
    const addPageAction = vi.fn();
    fakeWindow({ newrelic: { addPageAction } });
    const { reportError } = await load();
    reportError("lead_failed", { reason: "network", attempts: 3 });
    expect(addPageAction).toHaveBeenCalledWith("lead_failed", { reason: "network", attempts: 3 });
    fakeWindow();
    expect(() => reportError("lead_failed")).not.toThrow();
  });

  it("também vira noticeError (alerta NRQL do playbook 06 §7)", async () => {
    const noticeError = vi.fn();
    fakeWindow({ newrelic: { addPageAction: vi.fn(), noticeError } });
    const { reportError } = await load();
    reportError("lead_failed", { reason: "timeout", attempts: 3, form: "briefing" });
    expect(noticeError).toHaveBeenCalledOnce();
    const [error, attributes] = noticeError.mock.calls[0] ?? [];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("lead_failed");
    expect(attributes).toEqual({ reason: "timeout", attempts: 3, form: "briefing" });
  });
});

describe("createOnce()", () => {
  it("cada chave passa uma vez só", async () => {
    const { createOnce } = await load();
    const once = createOnce();
    expect(once("complete:name")).toBe(true);
    expect(once("complete:name")).toBe(false);
    expect(once("error:email:invalid")).toBe(true);
  });
});

describe("entrySource() (wizard_view, wizard_start)", () => {
  it("?origem= do CTA, senão utm_source (URL ou sessão), senão host do referrer externo, senão direct", async () => {
    const { entrySource } = await load();
    const base = { search: "", referrer: "", host: "lemamon.dev", sessionTouch: null };
    expect(entrySource({ ...base, search: "?origem=home-hero&utm_source=google" })).toBe("home-hero");
    expect(entrySource({ ...base, search: "?utm_source=google" })).toBe("google");
    expect(
      entrySource({
        ...base,
        sessionTouch: { landing: "/", referrer: "", utm: { utm_source: "linkedin" }, gclid: "", at: 1 },
      }),
    ).toBe("linkedin");
    expect(entrySource({ ...base, referrer: "https://www.google.com/search?q=x" })).toBe("www.google.com");
    expect(entrySource({ ...base, referrer: "https://lemamon.dev/servicos" })).toBe("direct");
    expect(entrySource(base)).toBe("direct");
  });
});

describe("atribuição", () => {
  class MemoryStorage {
    map = new Map<string, string>();
    getItem(key: string) {
      return this.map.get(key) ?? null;
    }
    setItem(key: string, value: string) {
      this.map.set(key, value);
    }
  }

  it("lê utm_* e gclid; referrer só de fora do site", async () => {
    const { readCampaign, externalReferrer } = await load();
    expect(readCampaign("?utm_source=google&utm_campaign=x&gclid=abc&outro=1")).toEqual({
      utm: { utm_source: "google", utm_campaign: "x" },
      gclid: "abc",
    });
    expect(externalReferrer("https://www.google.com/search?q=x", "lemamon.dev")).toBe("https://www.google.com/search");
    expect(externalReferrer("https://lemamon.dev/servicos", "lemamon.dev")).toBe("");
    expect(externalReferrer("", "lemamon.dev")).toBe("");
  });

  it("primeiro toque da sessão fica; toque com campanha nova substitui", async () => {
    const { rememberLanding, readSessionTouch } = await load();
    const storage = new MemoryStorage() as unknown as Storage;
    rememberLanding({ pathname: "/", search: "?utm_source=teste&gclid=abc", host: "lemamon.dev" }, "https://google.com/", storage, 1);
    rememberLanding({ pathname: "/servicos", search: "", host: "lemamon.dev" }, "https://lemamon.dev/", storage, 2);
    expect(readSessionTouch(storage)).toMatchObject({
      landing: "/?utm_source=teste&gclid=abc",
      referrer: "https://google.com/",
      gclid: "abc",
      utm: { utm_source: "teste" },
    });
    rememberLanding({ pathname: "/quanto-custa", search: "?utm_source=linkedin", host: "lemamon.dev" }, "", storage, 3);
    expect(readSessionTouch(storage)).toMatchObject({ landing: "/quanto-custa?utm_source=linkedin", gclid: "" });
  });
});

describe("falha que sobrevive ao modo offline (B340)", () => {
  class MemoryStorage {
    map = new Map<string, string>();
    getItem(key: string) {
      return this.map.get(key) ?? null;
    }
    setItem(key: string, value: string) {
      this.map.set(key, value);
    }
    removeItem(key: string) {
      this.map.delete(key);
    }
  }

  /** window com addEventListener/dispatchEvent de verdade (o "online" é um evento). */
  function eventWindow(extra: Record<string, unknown> = {}) {
    const target = new EventTarget();
    Object.assign(target, { location: { pathname: "/", search: "", host: "lemamon.dev" }, ...extra });
    vi.stubGlobal("window", target);
    return target;
  }

  function setOnline(onLine: boolean) {
    vi.stubGlobal("navigator", { onLine });
  }

  const failed = { reason: "network", attempts: 3, form: "briefing" as const, event_id: "LEM-20261020-ABCD" };
  const nr = { reason: "network", attempts: 3, status: 0, form: "briefing", event_id: "LEM-20261020-ABCD" };

  it("offline: não chama o gtag nem o New Relic; o 'online' manda o lead_failed exatamente uma vez", async () => {
    const gtag = vi.fn();
    const addPageAction = vi.fn();
    const win = eventWindow({ gtag, newrelic: { addPageAction, noticeError: vi.fn() } });
    setOnline(false);
    const storage = new MemoryStorage() as unknown as Storage;
    const probe = vi.fn(async () => true);
    const { trackWhenOnline, PENDING_EVENTS_KEY } = await load({ PUBLIC_GA4_ID: "G-TESTE" });

    expect(trackWhenOnline("lead_failed", failed, nr, { storage, probe })).toBe("queued");
    expect(gtag).not.toHaveBeenCalled();
    expect(addPageAction).not.toHaveBeenCalled();
    // A fila só guarda o que o evento já leva: nada de dado pessoal.
    expect(JSON.parse(storage.getItem(PENDING_EVENTS_KEY) ?? "[]")).toEqual([{ name: "lead_failed", params: failed, nr }]);

    setOnline(true);
    win.dispatchEvent(new Event("online"));
    await vi.waitFor(() => expect(gtag).toHaveBeenCalledTimes(1));
    expect(gtag).toHaveBeenCalledWith("event", "lead_failed", { ...failed, send_to: "G-TESTE", transport_type: "beacon" });
    expect(addPageAction).toHaveBeenCalledWith("lead_failed", nr);
    expect(storage.getItem(PENDING_EVENTS_KEY)).toBeNull();

    win.dispatchEvent(new Event("online"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("lead_attempt offline também espera (a tentativa e a falha chegam juntas, com o mesmo event_id)", async () => {
    const gtag = vi.fn();
    eventWindow({ gtag });
    setOnline(false);
    const storage = new MemoryStorage() as unknown as Storage;
    const { trackWhenOnline, flushPendingEvents } = await load({ PUBLIC_GA4_ID: "G-TESTE" });
    trackWhenOnline("lead_attempt", { event_id: "LEM-20261020-ABCD", form: "briefing" }, undefined, { storage });
    trackWhenOnline("lead_failed", failed, nr, { storage });
    expect(gtag).not.toHaveBeenCalled();
    setOnline(true);
    expect(await flushPendingEvents({ storage, reachable: true })).toBe(2);
    expect(gtag.mock.calls.map((call) => call[1])).toEqual(["lead_attempt", "lead_failed"]);
  });

  it("item pendente de outra página sai uma vez só no próximo início", async () => {
    const gtag = vi.fn();
    eventWindow({ gtag });
    setOnline(true);
    const storage = new MemoryStorage() as unknown as Storage;
    const { flushPendingEvents, PENDING_EVENTS_KEY } = await load({ PUBLIC_GA4_ID: "G-TESTE" });
    storage.setItem(PENDING_EVENTS_KEY, JSON.stringify([{ name: "lead_failed", params: failed, nr }]));
    const probe = vi.fn(async () => true);
    expect(await flushPendingEvents({ storage, probe })).toBe(1);
    expect(await flushPendingEvents({ storage, probe })).toBe(0);
    expect(gtag).toHaveBeenCalledOnce();
  });

  it("'online' mas o site não responde: fica na fila e tenta de novo depois", async () => {
    vi.useFakeTimers();
    const gtag = vi.fn();
    eventWindow({ gtag });
    setOnline(true);
    const storage = new MemoryStorage() as unknown as Storage;
    let reachable = false;
    const probe = vi.fn(async () => reachable);
    const { trackWhenOnline, PENDING_RETRY_MS } = await load({ PUBLIC_GA4_ID: "G-TESTE" });
    expect(trackWhenOnline("lead_failed", failed, nr, { storage, probe })).toBe("queued");
    await vi.advanceTimersByTimeAsync(0);
    expect(gtag).not.toHaveBeenCalled();
    reachable = true;
    await vi.advanceTimersByTimeAsync(PENDING_RETRY_MS);
    expect(gtag).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("online e falha de servidor/timeout: sai na hora, como antes", async () => {
    const gtag = vi.fn();
    const addPageAction = vi.fn();
    eventWindow({ gtag, newrelic: { addPageAction } });
    setOnline(true);
    const storage = new MemoryStorage() as unknown as Storage;
    const { trackWhenOnline, PENDING_EVENTS_KEY } = await load({ PUBLIC_GA4_ID: "G-TESTE" });
    expect(trackWhenOnline("lead_failed", { ...failed, reason: "server" }, { ...nr, reason: "server" }, { storage })).toBe("sent");
    expect(gtag).toHaveBeenCalledWith("event", "lead_failed", { ...failed, reason: "server", send_to: "G-TESTE" });
    expect(addPageAction).toHaveBeenCalledOnce();
    expect(storage.getItem(PENDING_EVENTS_KEY)).toBeNull();
  });
});
