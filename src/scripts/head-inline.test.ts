/**
 * Critério de aceite de i18n _notes.ttl: com um rascunho de mais de 30 dias no
 * localStorage, abrir QUALQUER página (o script vai no <head> de todas, via
 * Base.astro) apaga o rascunho. Executa a mesma string que vai ao ar.
 */
import { describe, expect, it } from "vitest";

import { DRAFT_KEY, DRAFT_TTL_MS } from "@/lib/draft";

import { headInlineScript, LANG_SUGGEST_DISMISSED_KEY, THEME_KEY } from "./head-inline";

interface RunOptions {
  throwOnAccess?: boolean;
  pageLang?: string;
  languages?: string[];
  dismissed?: boolean;
  /** Tema salvo no botão de tema ("dark" | "light"). */
  theme?: string;
  /** prefers-color-scheme: dark do sistema; null = navegador sem matchMedia. */
  systemDark?: boolean | null;
}

function run(
  stored: string | null,
  { throwOnAccess = false, pageLang = "pt-BR", languages = ["pt-BR"], dismissed = false, theme, systemDark = false }: RunOptions = {},
) {
  const data = new Map<string, string>();
  if (stored !== null) data.set(DRAFT_KEY, stored);
  if (dismissed) data.set(LANG_SUGGEST_DISMISSED_KEY, "1");
  if (theme !== undefined) data.set(THEME_KEY, theme);
  const attributes = new Map<string, string>();
  const toAttr = (prop: string | symbol) => `data-${String(prop).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
  // <html>: lang e dataset como no DOM (dataset.draftStep ↔ data-draft-step).
  const root = {
    className: "",
    lang: pageLang,
    dataset: new Proxy({} as Record<string, string>, {
      set: (_, prop, value) => (attributes.set(toAttr(prop), String(value)), true),
      get: (_, prop) => attributes.get(toAttr(prop)),
    }),
  };
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => void data.delete(key),
  };
  const window: Record<string, unknown> = { navigator: { languages, language: languages[0] } };
  if (systemDark !== null) {
    window.matchMedia = (query: string) => ({ matches: query.replace(/\s/g, "") === "(prefers-color-scheme:dark)" && systemDark });
  }
  Object.defineProperty(window, "localStorage", {
    get: () => {
      if (throwOnAccess) throw new Error("SecurityError");
      return storage;
    },
  });
  new Function("window", "document", headInlineScript())(window, { documentElement: root });
  return { data, attributes, root };
}

const draft = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({ v: 2, savedAt: Date.now() - 1000, step: 3, lang: "pt", answers: {}, attribution: {}, ...overrides });

describe("script inline do <head>: retomada e TTL do rascunho", () => {
  it("marca <html class='js'> sempre", () => {
    expect(run(null).root.className).toBe("js");
  });

  it("apaga o rascunho vencido (> 30 dias) em qualquer página", () => {
    const { data, attributes } = run(draft({ savedAt: Date.now() - DRAFT_TTL_MS - 60_000 }));
    expect(data.has(DRAFT_KEY)).toBe(false);
    expect(attributes.has("data-draft-step")).toBe(false);
  });

  it("apaga o rascunho sem data válida", () => {
    const { data } = run(draft({ savedAt: "ontem" }));
    expect(data.has(DRAFT_KEY)).toBe(false);
  });

  it("rascunho válido: marca o passo para os CTAs virarem 'Continuar meu pedido'", () => {
    const { data, attributes } = run(draft({ step: "resumo" }));
    expect(data.has(DRAFT_KEY)).toBe(true);
    expect(attributes.get("data-draft-step")).toBe("resumo");
    expect(run(draft({ step: 5 })).attributes.get("data-draft-step")).toBe("5");
    expect(run(draft({ step: "inexistente" })).attributes.get("data-draft-step")).toBe("1");
  });

  it("ignora versão desconhecida e JSON quebrado sem lançar erro", () => {
    expect(run(draft({ v: 1 })).attributes.has("data-draft-step")).toBe(false);
    expect(run("{quebrado").attributes.has("data-draft-step")).toBe(false);
  });

  it("sem storage (modo privado bloqueado), não quebra a página", () => {
    expect(() => run(draft(), { throwOnAccess: true })).not.toThrow();
    expect(run(draft(), { throwOnAccess: true }).root.className).toBe("js");
  });
});

describe("script inline do <head>: aviso de idioma (§9)", () => {
  it("navegador sem o idioma da página e com outro do site: sugere, sem redirecionar", () => {
    expect(run(null, { pageLang: "pt-BR", languages: ["en-US", "en"] }).attributes.get("data-lang-suggest")).toBe("en");
    expect(run(null, { pageLang: "en", languages: ["fr-FR", "es-419"] }).attributes.get("data-lang-suggest")).toBe("es");
  });

  it("idioma da página entre os do navegador, idioma que o site não tem ou aviso fechado: nada", () => {
    expect(run(null, { pageLang: "pt-BR", languages: ["en-US", "en-BR", "pt-BR"] }).attributes.has("data-lang-suggest")).toBe(false);
    expect(run(null, { pageLang: "pt-BR", languages: ["pt-PT"] }).attributes.has("data-lang-suggest")).toBe(false);
    expect(run(null, { pageLang: "pt-BR", languages: ["fr-FR"] }).attributes.has("data-lang-suggest")).toBe(false);
    expect(run(null, { pageLang: "pt-BR", languages: ["en"], dismissed: true }).attributes.has("data-lang-suggest")).toBe(false);
  });
});

describe("script inline do <head>: tema sem piscar (B208)", () => {
  it("sem escolha salva: segue o sistema", () => {
    expect(run(null, { systemDark: true }).attributes.get("data-theme")).toBe("dark");
    expect(run(null, { systemDark: false }).attributes.has("data-theme")).toBe(false);
  });

  it("a escolha salva vence o sistema, nos dois sentidos", () => {
    expect(run(null, { theme: "dark", systemDark: false }).attributes.get("data-theme")).toBe("dark");
    expect(run(null, { theme: "light", systemDark: true }).attributes.has("data-theme")).toBe(false);
  });

  it("valor salvo desconhecido = sem escolha", () => {
    expect(run(null, { theme: "sepia", systemDark: true }).attributes.get("data-theme")).toBe("dark");
  });

  it("sem storage ou sem matchMedia: não quebra o resto do script", () => {
    const blocked = run(draft(), { throwOnAccess: true, systemDark: true });
    expect(blocked.attributes.get("data-theme")).toBe("dark");
    expect(blocked.root.className).toBe("js");
    const old = run(draft({ step: 2 }), { systemDark: null, pageLang: "pt-BR", languages: ["en"] });
    expect(old.attributes.has("data-theme")).toBe(false);
    expect(old.attributes.get("data-draft-step")).toBe("2");
    expect(old.attributes.get("data-lang-suggest")).toBe("en");
  });
});

describe("script inline do <head>: peso (B104)", () => {
  it("vai ao ar com no máximo 1 KiB (síncrono, em toda página)", () => {
    const code = headInlineScript();
    expect(Buffer.byteLength(code)).toBeLessThanOrEqual(1024);
    expect(code).not.toMatch(/__[A-Z]+__/);
  });
});
