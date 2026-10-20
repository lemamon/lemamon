import { describe, expect, it } from "vitest";

import { getSection, interpolate, LOCALES, messages, placeholders, t, tDynamic, tRaw } from "@/i18n";

describe("i18n loader", () => {
  it("devolve texto tipado nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      expect(t(locale, "shared.cta.primary").length).toBeGreaterThan(0);
    }
    expect(t("pt", "shared.cta.primary")).toBe("Pedir diagnóstico gratuito");
  });

  it("interpola {placeholder}", () => {
    expect(t("pt", "shared.footer.copyright", { ano: 2026 })).toBe("© 2026 Lemamon");
    expect(interpolate("Olá, {nome}", { nome: "Ana" })).toBe("Olá, Ana");
    expect(placeholders("{a} e {b}")).toEqual(["a", "b"]);
  });

  it("nunca deixa {placeholder} cru ir ao ar", () => {
    expect(() => t("pt", "shared.footer.copyright")).toThrow(/ano/);
    expect(() => interpolate("{x}", { x: "" })).toThrow();
    expect(tRaw("pt", "shared.footer.copyright")).toContain("{ano}");
  });

  it("remove as notas internas (_*) do runtime", () => {
    const tree = messages("pt") as unknown as Record<string, unknown>;
    expect(tree).not.toHaveProperty("_notes");
    const hero = getSection("pt", "about.hero") as unknown as Record<string, unknown>;
    expect(Object.keys(hero).some((key) => key.startsWith("_"))).toBe(false);
    expect(() => tDynamic("pt", "_notes.readme")).toThrow(/nota interna/);
  });

  it("getSection devolve objetos e arrays inteiros", () => {
    const stages = getSection("en", "shared.method_timeline.stages");
    expect(Object.keys(stages)).toEqual(["diagnosis", "discovery", "development", "support"]);
    expect(Array.isArray(getSection("es", "services.web_systems.signals"))).toBe(true);
  });

  it("acusa chave inexistente", () => {
    expect(() => tDynamic("pt", "nao.existe")).toThrow(/chave sem texto/);
  });
});

/**
 * Paridade e conferências de scripts/check-i18n.mjs dentro do `yarn test`
 * (backlog B295): faltar uma subchave em en/es (inclusive dentro de seções
 * passadas inteiras por getSection, como a copy da ilha do wizard) derruba o
 * teste, não só o `yarn i18n:check` manual. O `yarn build` roda o mesmo script
 * antes do astro check.
 */
describe("i18n: paridade e repetições (scripts/check-i18n.mjs)", () => {
  it("pt, en e es com as mesmas chaves, placeholders e grupos SAME", async () => {
    const { checkI18n } = await import("../../scripts/check-i18n.mjs");
    const { errors } = checkI18n();
    expect(errors).toEqual([]);
  });

  it("acusa subchave faltando num idioma", async () => {
    const { checkI18n } = await import("../../scripts/check-i18n.mjs");
    const base = { a: { b: "texto", c: "outro" } };
    const { errors } = checkI18n({ data: { pt: base, en: base, es: { a: { b: "texto" } } }, same: [], pending: [] });
    expect(errors.join("\n")).toMatch(/paridade: "a\.c" ausente em es/);
  });

  it("frase repetida em pt só passa com decisão (SAME) ou pendência registrada (PENDING) — B290", async () => {
    const { checkI18n } = await import("../../scripts/check-i18n.mjs");
    const frase = "Uma frase longa o bastante para contar como repetição";
    const tree = { x: { y: frase }, z: frase };
    const data = { pt: tree, en: tree, es: tree };
    expect(checkI18n({ data, same: [], pending: [] }).errors.join("\n")).toMatch(/repetição: pt: a mesma frase em x\.y = z/);
    expect(checkI18n({ data, same: [["x.y", "z"]], pending: [] }).errors).toEqual([]);
    const pending = checkI18n({ data, same: [], pending: [["x.y", "z"]] });
    expect(pending.errors).toEqual([]);
    expect(pending.warnings.join("\n")).toMatch(/aguardando consolidação/);
  });
});

/**
 * Checklist de copy (BLUEPRINT §12; docs/playbooks/12-canais-indicacao-linkedin-conteudo.md
 * §7) como teste, backlog B302: nenhum texto do i18n usa palavra proibida,
 * superlativo ou rótulo de CTA genérico ("Saiba mais", "Conheça mais", "Fale
 * conosco" e equivalentes en/es, decisão do dono), e nenhum título/H1 tem emoji.
 * Vale para toda chave nova ou alterada. A parte que não dá para automatizar
 * (tom, teste da negação) está no .github/pull_request_template.md.
 * "melhor" como advérbio ("aproveitar melhor") passa; "o/a melhor" não.
 * "referência" fica fora (é usada no sentido de faixa de preço).
 */
describe("i18n: copy sem termos proibidos (B302)", () => {
  const BANNED: Record<(typeof LOCALES)[number], RegExp> = {
    pt: /(soluções|inovaç|inovador|transformação digital|incrível|realmente|verdadeiramente|completamente|de ponta|\blíder|excelência|extraordinári|poderos|\b(o|a|os|as) melhor(es)?\b|saiba mais|conheça mais|fale conosco)/i,
    en: /\b(solutions|innovation|innovative|digital transformation|amazing|cutting-edge|leader|world-class|best-in-class|learn more|contact us)\b/i,
    es: /(soluciones|innovación|innovador|transformación digital|increíble|\blíder|realmente|de vanguardia|más información|conoce más|contáctanos)/i,
  };
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

  function strings(node: unknown, path = ""): [string, string][] {
    if (typeof node === "string") return [[path, node]];
    if (Array.isArray(node)) return node.flatMap((value, index) => strings(value, `${path}[${index}]`));
    if (node && typeof node === "object") {
      return Object.entries(node).flatMap(([key, value]) => (key.startsWith("_") ? [] : strings(value, path ? `${path}.${key}` : key)));
    }
    return [];
  }

  for (const locale of LOCALES) {
    it(`${locale}: nenhuma palavra proibida nem emoji em título`, () => {
      const all = strings(messages(locale));
      expect(all.length).toBeGreaterThan(1000);
      const banned = all.filter(([, text]) => BANNED[locale].test(text)).map(([path, text]) => `${path}: ${text}`);
      expect(banned).toEqual([]);
      const emoji = all.filter(([path, text]) => /(title|h1)$/.test(path) && EMOJI.test(text)).map(([path]) => path);
      expect(emoji).toEqual([]);
    });
  }

  it("a regra pega o que precisa pegar", () => {
    expect(BANNED.pt.test("Soluções sob medida")).toBe(true);
    expect(BANNED.pt.test("A melhor equipe")).toBe(true);
    expect(BANNED.pt.test("para aproveitar melhor os 45 minutos")).toBe(false);
    expect(BANNED.en.test("Innovative solutions")).toBe(true);
    expect(BANNED.es.test("Somos líderes")).toBe(true);
    // Rótulos de CTA genéricos, proibidos pela decisão do dono (B302).
    expect(BANNED.pt.test("Saiba mais")).toBe(true);
    expect(BANNED.pt.test("Conheça mais sobre a Lemamon")).toBe(true);
    expect(BANNED.pt.test("Fale conosco")).toBe(true);
    expect(BANNED.en.test("Learn more")).toBe(true);
    expect(BANNED.en.test("Contact us")).toBe(true);
    expect(BANNED.es.test("Más información")).toBe(true);
    expect(BANNED.es.test("Conoce más")).toBe(true);
    expect(BANNED.es.test("Contáctanos")).toBe(true);
    expect(BANNED.pt.test("Fale com a gente")).toBe(false);
    expect(BANNED.en.test("Contact")).toBe(false);
  });
});

/**
 * B167, BLUEPRINT §8.6: todo CTA primário usa o mesmo texto. O rótulo curto só
 * aparece na barra fixa e no rodapé do drawer quando nem o completo em 14px
 * cabe (ResumeLabel), e mesmo assim começa com o MESMO verbo do completo: nunca
 * "Diagnóstico gratuito" / "Free assessment", sem verbo, ao lado de "Pedir
 * diagnóstico gratuito". O header não usa rótulo curto em largura nenhuma.
 */
describe("i18n: rótulo curto do CTA primário com o verbo do completo (B167)", () => {
  const firstWord = (text: string) => text.trim().split(/\s+/)[0]?.toLowerCase();
  for (const locale of LOCALES) {
    it(`${locale}: primary_short e primary_schedule_short começam como primary e primary_schedule`, () => {
      const pairs = [
        ["shared.cta.primary", "shared.cta.primary_short"],
        ["shared.cta.primary_schedule", "shared.cta.primary_schedule_short"],
      ] as const;
      for (const [full, short] of pairs) {
        const fullText = tDynamic(locale, full);
        const shortText = tDynamic(locale, short);
        expect(firstWord(shortText), `${locale} ${short} = "${shortText}"`).toBe(firstWord(fullText));
        expect(shortText.length, `${locale} ${short} é mais curto que ${full}`).toBeLessThan(fullText.length);
      }
    });
  }
});
