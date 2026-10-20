/**
 * Termos explicados (BLUEPRINT §5.9) — helpers de components/shared/terms.ts. Dono: home.
 * O rótulo vem da própria explicação do i18n, então a 1ª menção é achada nos
 * 3 idiomas sem chave nova; na Home, os 4 termos de §5.9 têm 1ª menção.
 */
import { describe, expect, it } from "vitest";

import {
  findTerm,
  glueTermPunctuation,
  planFirstMentions,
  splitTerms,
  termLabel,
  type GluedSegment,
  type TermId,
} from "@/components/shared/terms";
import { getSection, t, type Locale } from "@/i18n";

const LOCALES: Locale[] = ["pt", "en", "es"];
const HOME_TERMS: TermId[] = ["mvp", "written_feedback", "prioritized_scope", "prototype"];

describe("termLabel", () => {
  it("pega o termo antes dos dois-pontos e tira o parêntese", () => {
    expect(termLabel("MVP (produto mínimo viável): a menor versão")).toBe("MVP");
    expect(termLabel("Escopo priorizado: a lista")).toBe("Escopo priorizado");
  });

  it("todo termo de shared.terms tem rótulo nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      for (const term of ["prototype", "prioritized_scope", "mvp", "api", "discovery_sprint", "support", "written_feedback"] as const) {
        expect(termLabel(t(locale, `shared.terms.${term}`)).length).toBeGreaterThan(1);
      }
    }
  });
});

describe("findTerm / splitTerms", () => {
  it("casa sem diferenciar maiúsculas e estende até o fim da palavra", () => {
    expect(findTerm("Sistemas e MVPs.", "mvp", "MVP")).toEqual({ term: "mvp", start: 11, end: 15 });
    expect(findTerm("o Protótipo", "prototype", "protótipo")?.start).toBe(2);
    expect(findTerm("superMVP", "mvp", "MVP")).toBeNull();
  });

  it("marca só a 1ª menção e preserva o texto", () => {
    const text = "Veja o protótipo. O protótipo de novo.";
    const segments = splitTerms(text, [{ term: "prototype", label: "Protótipo" }]);
    expect(segments.map((segment) => segment.value).join("")).toBe(text);
    expect(segments.filter((segment) => segment.kind === "term")).toHaveLength(1);
  });
});

describe("glueTermPunctuation (B001: o ponto não cai sozinho na linha de baixo)", () => {
  const rebuild = (segments: GluedSegment[]) =>
    segments.map((segment) => (segment.kind === "term" ? segment.before + segment.value + segment.after : segment.value)).join("");

  it("cola a pontuação que fecha e a que abre, e preserva o texto", () => {
    const text = "Sistemas, apps, integrações e MVPs. Você aprova (MVP) e ¿MVP?";
    const glued = glueTermPunctuation(splitTerms(text, [{ term: "mvp", label: "MVP" }]));
    expect(rebuild(glued)).toBe(text);
    const term = glued.find((segment) => segment.kind === "term");
    expect(term).toMatchObject({ value: "MVPs", before: "", after: "." });
    expect(glued.at(-1)).toEqual({ kind: "text", value: " Você aprova (MVP) e ¿MVP?" });
  });

  it("termo entre parênteses leva os dois lados; texto vazio some", () => {
    const glued = glueTermPunctuation(splitTerms("(MVP)", [{ term: "mvp", label: "MVP" }]));
    expect(glued).toEqual([{ kind: "term", term: "mvp", value: "MVP", before: "(", after: ")" }]);
  });

  it("sem pontuação vizinha, nada muda", () => {
    const glued = glueTermPunctuation(splitTerms("um MVP pronto", [{ term: "mvp", label: "MVP" }]));
    expect(glued.find((segment) => segment.kind === "term")).toMatchObject({ before: "", after: "" });
  });

  it("hero da Home: o termo seguido de pontuação leva a pontuação junto, nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      const text = t(locale, "home.hero.subtitle");
      const glued = glueTermPunctuation(
        splitTerms(text, [{ term: "mvp", label: termLabel(t(locale, "shared.terms.mvp")) }]),
      );
      expect(rebuild(glued), locale).toBe(text);
      for (const [i, segment] of glued.entries()) {
        const next = glued[i + 1];
        if (segment.kind === "term" && next?.kind === "text") expect(next.value, locale).not.toMatch(/^[.,;:!?)]/);
      }
    }
  });
});

describe("Home: 1ª menção dos termos de §5.9", () => {
  it("os 4 termos têm 1ª menção nos textos da Home, em cada idioma", () => {
    for (const locale of LOCALES) {
      const risks = getSection(locale, "home.risks.pairs");
      const method = getSection(locale, "home.method.stages");
      const plan = planFirstMentions(
        [
          ["hero.subtitle", t(locale, "home.hero.subtitle")],
          ["hero.micro", t(locale, "shared.cta.microcopy_diagnosis")],
          ...Object.entries(risks).map(([id, pair]) => [`risks.${id}`, pair.answer] as const),
          ...Object.entries(method).map(([id, stage]) => [`method.${id}`, stage.text] as const),
        ],
        HOME_TERMS.map((term) => ({ term, label: termLabel(t(locale, `shared.terms.${term}`)) })),
      );
      const planned = Object.values(plan).flat().sort();
      expect(planned, locale).toEqual([...HOME_TERMS].sort());
      expect(plan["hero.subtitle"], locale).toContain("mvp");
    }
  });
});
