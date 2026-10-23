/**
 * Auditoria SEO (docs/arquitetura/AUDITORIA-SEO.md, 22/10/2026), parte copy e
 * on-page: titles e descriptions de (d), a frase de entidade, os FAQs que a
 * busca por IA cita, os termos de SERP em en e as âncoras internas, no i18n e
 * no build com o dado real (dono: pages e home). Cada bloco cita a chave.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { anchorId, ANCHORS, urlFor, type RouteKey } from "@/config/routes";
import { getSection, t, tDynamic, type Locale } from "@/i18n";
import { fileForPath, textOf } from "@/integrations/verify-build";

const LOCALES: Locale[] = ["pt", "en", "es"];
const BRAND = " | Lemamon.dev";

/** HTML inteiro da página no build com o dado real (sem a camada fictícia). */
function built(route: RouteKey, locale: Locale): string {
  const { semFicticio } = inject("buildsDosDados");
  return readFileSync(join(semFicticio.outDir, fileForPath(urlFor(route, locale))), "utf8");
}
const main = (html: string) => html.slice(html.indexOf("<main"), html.indexOf("</main>"));
/** Trecho de uma <section id="…"> até a próxima <section. `id` é o id pt; o publicado sai no idioma (anchorId, S01-8). */
function section(html: string, id: string, locale: Locale): string {
  const open = html.match(new RegExp(`<section[^>]*\\bid="${anchorId(id, locale)}"[^>]*>`));
  if (!open || open.index === undefined) return "";
  const next = html.indexOf("<section", open.index + open[0].length);
  return html.slice(open.index, next > 0 ? next : undefined);
}
const titleOf = (html: string) => textOf(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
const descriptionOf = (html: string) => textOf(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
const faqIds = (html: string, locale: Locale) => [...section(html, ANCHORS.faq, locale).matchAll(/data-faq-id="([^"]+)"/g)].map((match) => match[1]);
/** Perguntas do FAQPage JSON-LD da página. */
function faqPageQuestions(html: string): string[] {
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1] ?? "null"));
  const faq = blocks.find((block) => block?.["@type"] === "FAQPage");
  return (faq?.mainEntity ?? []).map((entry: { name: string }) => entry.name);
}

describe("Titles e descriptions de (d)", () => {
  it("S06-6: sistemas web com 'web' e aplicativos no plural (pt), sem mudar o H1", () => {
    expect(t("pt", "meta.services_web_systems.title")).toBe(`Desenvolvimento de sistemas web para empresas${BRAND}`);
    expect(t("pt", "meta.services_web_systems.description")).toMatch(/^Desenvolvimento de sistemas web sob medida para empresas/);
    expect(t("pt", "meta.services_mobile_apps.title")).toBe(`Desenvolvimento de aplicativos sob medida${BRAND}`);
    expect(t("pt", "meta.services_mobile_apps.description")).toMatch(/^Desenvolvimento de aplicativos sob medida para empresas/);
    expect(titleOf(built("service_web_systems", "pt"))).toBe(t("pt", "meta.services_web_systems.title"));
    expect(titleOf(built("service_mobile_apps", "pt"))).toBe(t("pt", "meta.services_mobile_apps.title"));
  });

  it("S06-8: o title de contato termina na marca e não leva a praça (a Home é a dona do cluster local)", () => {
    const expected = { pt: "Contato", en: "Contact", es: "Contacto" } as const;
    for (const locale of LOCALES) {
      const title = t(locale, "meta.contact.title");
      expect(title, locale).toBe(`${expected[locale]}${BRAND}`);
      expect(title, locale).not.toMatch(/São Paulo/);
      expect(titleOf(built("contact", locale)), locale).toBe(title);
    }
    expect(t("pt", "meta.contact.description").length).toBeLessThanOrEqual(155);
  });

  it("S06-11: a description do wizard não repete o title e começa pelas 6 perguntas", () => {
    const start = { pt: /^Responda 6 perguntas/, en: /^Answer 6 questions/, es: /^Responde 6 preguntas/ } as const;
    for (const locale of LOCALES) {
      const description = t(locale, "meta.quote.description");
      expect(description, locale).toMatch(start[locale]);
      expect(description, locale).not.toContain(t(locale, "meta.quote.title").replace(BRAND, "").split(":")[0] ?? "");
      expect(descriptionOf(built("quote", locale)), locale).toBe(description);
    }
  });

  it("S06-12: a description do hub de cases nomeia os setores e não promete resultado nem número", () => {
    for (const locale of LOCALES) {
      const description = t(locale, "meta.cases_hub.description");
      expect(description, locale).not.toMatch(/resultado|result/i);
      expect(description, locale).not.toMatch(/\d/);
    }
    expect(t("pt", "meta.cases_hub.description")).toMatch(/indústria, varejo, educação, saúde e setor público/);
  });

  it("Sprint (S06-7, D44): a description diz que a Descoberta só acontece quando o diagnóstico mostra que é preciso", () => {
    const whenNeeded = {
      pt: /quando o diagnóstico mostra que é preciso\.$/,
      en: /when the assessment shows it's needed\.$/,
      es: /si el diagnóstico muestra que hace falta\.$/,
    } as const;
    for (const locale of LOCALES) {
      expect(t(locale, "meta.discovery_sprint.description"), locale).toMatch(whenNeeded[locale]);
      expect(t(locale, "meta.discovery_sprint.description").length, locale).toBeLessThanOrEqual(155);
    }
  });

  it("D37: o title da Home não muda (decisão do dono)", () => {
    expect(t("pt", "meta.home.title")).toBe("Desenvolvimento de software sob medida, São Paulo | Lemamon.dev");
  });
});

describe("Frase de entidade e FAQ citável (S05-1, S07-5, S05-7, S03-12)", () => {
  const CATEGORY = {
    pt: "A Lemamon.dev é uma empresa de desenvolvimento de software sob medida de São Paulo, SP,",
    en: "Lemamon.dev is a custom software development company based in São Paulo",
    es: "Lemamon.dev es una empresa de desarrollo de software a medida de",
  } as const;

  it("a 1ª frase das duas respostas de other_cities nomeia a categoria", () => {
    for (const locale of LOCALES) {
      for (const field of ["answer_draft", "answer_with_abroad"] as const) {
        const answer = tDynamic(locale, `faq.conditional.other_cities.${field}`);
        expect(answer.split(". ")[1] ?? "", `${locale} ${field}`).toContain(CATEGORY[locale]);
      }
    }
  });

  it("/como-trabalhamos: a pergunta do exterior no HTML e no FAQPage, com a frase de entidade; a Home continua com ela", () => {
    for (const locale of LOCALES) {
      const question = t(locale, "faq.conditional.other_cities.question_with_abroad");
      for (const route of ["how_we_work", "home"] as const) {
        const html = built(route, locale);
        expect(faqIds(main(html), locale), `${locale} ${route}`).toContain("other_cities");
        expect(faqPageQuestions(html), `${locale} ${route}`).toContain(question);
        expect(textOf(main(html)), `${locale} ${route}`).toContain(CATEGORY[locale]);
      }
      expect(faqIds(main(built("how_we_work", locale)), locale), locale).toHaveLength(9);
    }
  });
});

describe("FAQs de serviço (S03-7, S07-9, S03-6, S03-10)", () => {
  const DEFINITION = { pt: "produto mínimo viável", en: "minimum viable product", es: "producto mínimo viable" } as const;

  it("/servicos/mvp define MVP em what_goes_in, e what_is_mvp não repete a definição", () => {
    for (const locale of LOCALES) {
      expect(t(locale, "services.mvp.faq.what_goes_in.answer"), locale).toContain(DEFINITION[locale]);
      expect(t(locale, "services.mvp.faq.what_is_mvp.answer"), locale).not.toContain(DEFINITION[locale]);
      const html = built("service_mvp", locale);
      expect(textOf(section(main(html), ANCHORS.faq, locale)), locale).toContain(t(locale, "services.mvp.faq.what_goes_in.answer"));
      expect(faqIds(main(html), locale), locale).toContain("what_is_mvp");
    }
  });

  it("sustentação responde NDA e propriedade do código no HTML e no FAQPage", () => {
    for (const locale of LOCALES) {
      const html = built("service_support", locale);
      expect(faqIds(main(html), locale), locale).toEqual(["how_it_starts", "support_vs_evolution", "price", "nda", "code_ownership"]);
      expect(faqPageQuestions(html), locale).toContain(t(locale, "faq.conditional.nda.question"));
      expect(faqPageQuestions(html), locale).toContain(t(locale, "faq.conditional.code_ownership.question"));
    }
  });

  it("o teto de 11 devolve as perguntas próprias às páginas de serviço; o resto do site fica em 9", () => {
    const own: [RouteKey, string][] = [
      ["service_web_systems", "start_with_part"],
      ["service_mobile_apps", "store_publishing"],
      ["service_integrations", "need_tech_knowledge"],
      ["service_mvp", "after_mvp"],
    ];
    for (const locale of LOCALES) {
      for (const [route, id] of own) expect(faqIds(main(built(route, locale)), locale), `${locale} ${route}`).toContain(id);
      expect(faqIds(main(built("home", locale)), locale).length, locale).toBeLessThanOrEqual(9);
    }
  });
});

describe("Preço e prazo pela afirmativa (S05-5)", () => {
  it("how_much e how_long não abrem por 'Depende'; how_much não repete a Descoberta gratuita (revisão da D44)", () => {
    const discovery = { pt: /Descoberta|gratuit/, en: /Discovery|free/i, es: /Descubrimiento|gratuit/ } as const;
    for (const locale of LOCALES) {
      for (const key of ["faq.items.how_much.answer", "faq.items.how_long.answer"] as const) {
        expect(t(locale, key), `${locale} ${key}`).not.toMatch(/^(Depende|It depends)/);
      }
      expect(t(locale, "faq.items.how_much.answer"), locale).not.toMatch(discovery[locale]);
    }
  });

  it("'os 7 fatores' em factors.intro e na meta description batem com a lista de fatores", () => {
    for (const locale of LOCALES) {
      const count = String(Object.keys(getSection(locale, "pricing.factors.items")).length);
      expect(t(locale, "pricing.factors.intro"), locale).toContain(` ${count} `);
      expect(t(locale, "meta.pricing.description"), locale).toContain(` ${count} `);
    }
  });
});

describe("Termos da SERP em inglês (S07-8, S03-8)", () => {
  it("'time and materials' em /en/how-we-work e /en/pricing", () => {
    expect(t("en", "pricing.how_to_compare.questions.fixed_or_hourly.question")).toBe("Is the price fixed, or time and materials (billed by the hour)?");
    expect(textOf(main(built("how_we_work", "en")))).toContain("time and materials");
    expect(textOf(section(main(built("pricing", "en")), "como-comparar", "en"))).toContain("time and materials");
  });

  it("'discovery phase' em /en/discovery-sprint, sem tirar o 'free' da Descoberta", () => {
    const text = t("en", "discovery_sprint.why_start_here.text");
    expect(text).toContain("product discovery or a discovery phase");
    expect(text).toMatch(/Discovery Sprint \([^)]*\) is free/);
    expect(textOf(main(built("discovery_sprint", "en")))).toContain(text);
  });

  it("a Sprint aponta para a prova: link para /cases depois de 'O que você recebe', sem dizer que foi gratuita", () => {
    for (const locale of LOCALES) {
      const deliverables = section(main(built("discovery_sprint", locale)), "entregaveis", locale);
      const label = t(locale, "discovery_sprint.deliverables.cases_link");
      expect(deliverables, locale).toContain(`href="${urlFor("cases_hub", locale)}"`);
      expect(textOf(deliverables), locale).toContain(label);
      expect(label, locale).not.toMatch(/gratuit|free/i);
      // D45 §4: os cases não tiveram o plano com prazo e preço do método atual; o rótulo diz só o escopo definido antes.
      expect(label, locale).not.toMatch(/prazo|preço|price|timeline|plazo|precio|Descoberta|Discovery|Descubrimiento/i);
    }
  });
});

describe("Integrações: API, webhook, sistema sem API e IoT (S07-10)", () => {
  it("o 1º exemplo cita API, webhook e troca de arquivos; há um exemplo de sensores e equipamentos; nenhuma plataforma pelo nome", () => {
    const sensors = { pt: /Sensores e equipamentos/, en: /Sensors and equipment/, es: /Sensores y equipos/ } as const;
    for (const locale of LOCALES) {
      const examples = getSection(locale, "services.integrations.examples");
      expect(examples[0]?.text, locale).toMatch(/\bAPI\b/);
      expect(examples[0]?.text, locale).toMatch(/webhook/);
      expect(examples.some((example) => sensors[locale].test(example.title)), locale).toBe(true);
      expect(examples.length, locale).toBeLessThanOrEqual(7);
      const all = examples.map((example) => `${example.title} ${example.text}`).join(" ");
      expect(all, locale).not.toMatch(/Shopify|SAP|TOTVS|Bling|Tiny|Mercado Livre|Salesforce|HubSpot|VTEX|Omie|Stripe/);
    }
  });

  it("o exemplo de sensores linka o case de contagem de produção, no slug do idioma", () => {
    const slugs = {
      pt: "controle-de-producao-com-contagem-automatica",
      en: "production-control-with-automatic-counting",
      es: "control-de-produccion-con-conteo-automatico",
    } as const;
    for (const locale of LOCALES) {
      const phrase = t(locale, "services.integrations.examples_case_phrase");
      expect(getSection(locale, "services.integrations.examples")[6]?.text, locale).toContain(phrase);
      const examples = section(main(built("service_integrations", locale)), "exemplos", locale);
      expect(examples, locale).toMatch(new RegExp(`<a href="${urlFor("case", locale, { slug: slugs[locale] })}"[^>]*>${phrase}</a>`));
    }
  });

  it("a 1ª menção de 'API' na página vira o toggletip do termo (§5.9)", () => {
    for (const locale of LOCALES) {
      const examples = section(main(built("service_integrations", locale)), "exemplos", locale);
      expect(examples, locale).toMatch(/popovertarget="[^"]+"[^>]*>API</);
    }
  });
});

describe("Âncoras internas (S06-10)", () => {
  it("os links para /como-trabalhamos e /quanto-custa levam a keyword da página de destino", () => {
    for (const locale of LOCALES) {
      const html = main(built("service_web_systems", locale));
      const howWeWork = t(locale, "shared.cta.see_how_we_work");
      const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => [match[1], textOf(match[2] ?? "")]);
      expect(links, locale).toContainEqual([urlFor("how_we_work", locale), howWeWork]);
      expect(links, locale).toContainEqual([urlFor("pricing", locale), t(locale, "services.template.price_factors_link")]);
    }
    expect(t("pt", "shared.cta.see_how_we_work")).toBe("Ver como funciona o desenvolvimento com preço fechado");
    expect(t("pt", "services.template.price_factors_link")).toMatch(/^Quanto custa um software sob medida/);
  });

  it("sustentação e hub /servicos: o link para /como-trabalhamos usa o rótulo curto, sem 'preço fechado'", () => {
    for (const locale of LOCALES) {
      for (const route of ["service_support", "services_hub"] as const) {
        const html = main(built(route, locale));
        const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => [match[1], textOf(match[2] ?? "")]);
        expect(links, `${route} ${locale}`).toContainEqual([urlFor("how_we_work", locale), t(locale, "shared.cta.see_how_we_work_short")]);
        expect(textOf(html), `${route} ${locale}`).not.toContain(t(locale, "shared.cta.see_how_we_work"));
      }
    }
  });

  it("o link do cartão do plano, na própria Home, fica com o rótulo curto", () => {
    for (const locale of LOCALES) {
      const hero = section(main(built("home", locale)), "inicio", locale);
      expect(textOf(hero), locale).toContain(t(locale, "home.hero.plan_link"));
      expect(textOf(hero), locale).not.toContain(t(locale, "shared.cta.see_how_we_work"));
    }
  });
});
