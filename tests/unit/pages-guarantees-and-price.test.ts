/**
 * Auditoria de conversão, Pacote B (preço, prazo e garantias à vista) e as
 * decisões D31 e D44 do dono, no build com o dado real (dono: pages e home).
 *
 *  - F01/F42/F37/F41: o código do cliente na faixa de compromissos, nos riscos,
 *    em /como-trabalhamos e na régua de /quanto-custa; o NDA no hero do MVP;
 *    "Sem compromisso" na microcopy sob o CTA.
 *  - F08/F12: /quanto-custa e o MVP respondem preço e prazo pela afirmativa, e
 *    o hero do MVP leva às duas primeiras perguntas do FAQ.
 *  - F15: integrações respondem NDA e acesso aos dados perto do topo.
 *  - F14: perfis em linha em /contato (e na Home abaixo de 768px, em CSS).
 *  - D31: a linha da Home e o FAQ "outras cidades ou fora do Brasil".
 *  - D44 (21/10/2026, revoga a D42): a Sprint de Descoberta é gratuita, só
 *    quando o diagnóstico mostra que é necessária, sem protótipo e sem duração
 *    publicada.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { anchorFor, anchorId, ANCHORS, urlFor, type RouteKey } from "@/config/routes";
import { t, tDynamic, type Locale } from "@/i18n";
import { fileForPath, textOf } from "@/integrations/verify-build";

const LOCALES: Locale[] = ["pt", "en", "es"];
const page = (route: RouteKey, locale: Locale) => {
  const { semFicticio } = inject("buildsDosDados");
  const html = readFileSync(join(semFicticio.outDir, fileForPath(urlFor(route, locale))), "utf8");
  return html.slice(html.indexOf("<main"), html.indexOf("</main>"));
};
/** Trecho de uma <section id="…"> até a próxima <section. */
function section(html: string, id: string): string {
  const open = html.match(new RegExp(`<section[^>]*\\bid="${id}"[^>]*>`));
  if (!open || open.index === undefined) return "";
  const next = html.indexOf("<section", open.index + open[0].length);
  return html.slice(open.index, next > 0 ? next : undefined);
}
/** Ids das perguntas do FAQ da página (a seção tem o id no idioma: #perguntas, #faq, #preguntas). */
const faqIds = (html: string, locale: Locale) =>
  [...section(html, anchorId(ANCHORS.faq, locale)).matchAll(/data-faq-id="([^"]+)"/g)].map((match) => match[1]);

describe("Garantias à vista (F01, F41, F42, F37)", () => {
  it("Home: o 4º compromisso é o código; o risco 'fornecedor que some' cita o código; o par dos orçamentos linka a régua", () => {
    for (const locale of LOCALES) {
      const html = page("home", locale);
      const text = textOf(html);
      expect(text, locale).toContain(t(locale, "shared.commitments.items.code_owned"));
      expect(text, locale).not.toContain(t(locale, "shared.commitments.items.after_launch"));
      expect(text, locale).toContain(t(locale, "home.risks.pairs.vendor_disappears.answer_with_code_ownership"));
      expect(section(html, "riscos"), locale).toContain(`href="${anchorFor("pricing", locale, ANCHORS.howToCompare)}"`);
      expect(text, locale).toContain(t(locale, "shared.cta.microcopy_diagnosis"));
      expect(faqIds(html, locale).indexOf("code_ownership"), locale).toBe(2);
    }
  });

  it("/como-trabalhamos: 4º card e linha 'Código'; wont_stall cita o código", () => {
    for (const locale of LOCALES) {
      const html = page("how_we_work", locale);
      expect(section(html, "combinado").match(/data-id="[a-z_]+"/g), locale).toEqual([
        'data-id="scope_price"',
        'data-id="every_two_weeks"',
        'data-id="you_decide"',
        'data-id="code_owned"',
      ]);
      expect(textOf(section(html, "comparacao")), locale).toContain(t(locale, "how_we_work.comparison.rows.code.with"));
      expect(textOf(section(html, anchorId(ANCHORS.faq, locale))), locale).toContain(t(locale, "faq.items.wont_stall.answer_with_code_ownership"));
    }
  });

  it("/quanto-custa: a régua tem 7 perguntas, a última sobre o código", () => {
    for (const locale of LOCALES) {
      const html = section(page("pricing", locale), anchorId(ANCHORS.howToCompare, locale));
      const ids = [...html.matchAll(/<li[^>]*data-id="([a-z_]+)"/g)].map((match) => match[1]);
      expect(ids, locale).toHaveLength(7);
      expect(ids.at(-1), locale).toBe("code_ownership");
      expect(textOf(html), locale).toContain(t(locale, "pricing.how_to_compare.questions.code_ownership.lemamon_with_code_ownership"));
    }
  });
});

describe("Preço e prazo pela afirmativa (F08, F12)", () => {
  it("/quanto-custa: o lead e a meta description não abrem por 'Depende'", () => {
    for (const locale of LOCALES) {
      expect(t(locale, "pricing.hero.lead"), locale).not.toMatch(/^(Depende|It depends)/);
      expect(t(locale, "meta.pricing.description"), locale).not.toMatch(/^(Depende|It depends)/);
      expect(textOf(page("pricing", locale)), locale).toContain(t(locale, "pricing.hero.lead"));
    }
  });

  it("MVP: preço e prazo são as 2 primeiras perguntas; o hero linka para elas e diz 'NDA se você pedir'", () => {
    for (const locale of LOCALES) {
      const html = page("service_mvp", locale);
      expect(faqIds(html, locale).slice(0, 2), locale).toEqual(["price", "how_long_mvp"]);
      const hero = html.slice(0, html.indexOf("</section>"));
      expect(hero, locale).toMatch(
        new RegExp(`href="#${anchorId(ANCHORS.faq, locale)}"[^>]*data-track="cta_click"[^>]*data-cta-id="price_faq"[^>]*data-origem="mvp-hero-preco"`),
      );
      expect(textOf(hero), locale).toContain(t(locale, "services.mvp.hero_price_link"));
      expect(textOf(hero), locale).toContain(`${t(locale, "shared.cta.microcopy_diagnosis")} · ${t(locale, "services.mvp.hero_nda_note")}`);
      // O link de preço vem depois do CTA (nunca entre o subtítulo e o botão).
      expect(hero.indexOf("mvp-hero-preco"), locale).toBeGreaterThan(hero.indexOf("origem=mvp-hero"));
      expect(faqIds(html, locale), locale).toContain("nda");
    }
  });
});

describe("Integrações respondem NDA e acesso aos dados (F15)", () => {
  it("data_access perto do topo, com a pergunta do NDA; sem o condicional nda repetido nem how_follow_progress", () => {
    for (const locale of LOCALES) {
      const html = page("service_integrations", locale);
      const ids = faqIds(html, locale);
      expect(ids.indexOf("data_access"), locale).toBeLessThanOrEqual(2);
      expect(ids, locale).not.toContain("nda");
      expect(ids, locale).not.toContain("how_follow_progress");
      expect(textOf(section(html, anchorId(ANCHORS.faq, locale))), locale).toContain(t(locale, "services.integrations.faq.data_access.question_with_nda"));
    }
  });
});

describe("D31: atende empresas de qualquer país", () => {
  it("Home: a linha no eyebrow e a pergunta 'outras cidades ou fora do Brasil' (uma só)", () => {
    for (const locale of LOCALES) {
      const html = page("home", locale);
      const text = textOf(html);
      expect(text, locale).toContain(t(locale, "home.hero.eyebrow_with_abroad"));
      expect(faqIds(html, locale).filter((id) => id === "other_cities"), locale).toHaveLength(1);
      expect(text, locale).toContain(t(locale, "faq.conditional.other_cities.question_with_abroad"));
      expect(text, locale).not.toContain(t(locale, "faq.conditional.other_cities.question"));
    }
  });

  it("o /orcamento continua com o eyebrow sem o exterior (SAME com o OG)", () => {
    for (const locale of LOCALES) {
      expect(textOf(page("quote", locale)), locale).not.toContain(t(locale, "home.hero.eyebrow_with_abroad"));
    }
  });
});

describe("D44: Sprint de Descoberta gratuita, só quando necessária, sem protótipo e sem duração publicada", () => {
  const TYPICAL_DURATION = { pt: "em geral 1 semana", en: "usually 1 week", es: "en general 1 semana" } as const;

  it("/sprint-de-descoberta: hero sem duração; FAQ abre por 'Quanto custa?' (Nada) e 'Toda empresa precisa?'; sem investimento", () => {
    for (const locale of LOCALES) {
      const html = page("discovery_sprint", locale);
      const text = textOf(html);
      expect(text, locale).toContain(t(locale, "discovery_sprint.hero.microcopy"));
      expect(faqIds(html, locale), locale).toEqual(["discovery_cost", "when_discovery", "discovery_duration", "obliged_to_continue", "need_scope_ready"]);
      expect(text, locale).toContain(t(locale, "faq.items.discovery_cost.answer"));
      expect(text, locale).toContain(t(locale, "faq.conditional.discovery_duration.answer_draft"));
      expect(html, locale).not.toContain(`id="${anchorId(ANCHORS.investment, locale)}"`);
      // Sem formato publicado, "Como a Descoberta acontece" continua desligada.
      expect(html, locale).not.toContain(`id="${anchorId(ANCHORS.discoveryFormat, locale)}"`);
      // 3 entregas, sem protótipo.
      expect(section(html, "entregaveis").match(/<li data-id="/g) ?? [], locale).toHaveLength(3);
    }
  });

  it("linha do método (Home) e etapa 2 em /como-trabalhamos: tag 'gratuita, se for necessária', sem duração", () => {
    for (const locale of LOCALES) {
      const tag = t(locale, "shared.method_timeline.stages.discovery.tag");
      const home = textOf(section(page("home", locale), anchorId(ANCHORS.homeMethod, locale)));
      const stage = textOf(section(page("how_we_work", locale), anchorId(ANCHORS.stage.discovery, locale)));
      expect(home, locale).toContain(tag);
      expect(stage, locale).toContain(tag);
      for (const text of [home, stage]) expect(text, locale).not.toContain(TYPICAL_DURATION[locale]);
    }
  });

  it("nenhuma página publica a duração típica nem a Descoberta paga", () => {
    const routes: RouteKey[] = ["home", "how_we_work", "discovery_sprint", "pricing", "service_mvp", "service_web_systems", "quote"];
    const paid = { pt: /Paga ·|etapa paga, com valor|Descoberta é paga/, en: /Paid ·|paid stage, at a price|Discovery Sprint is paid/, es: /Con costo acordado|tiene un costo acordado/ } as const;
    for (const locale of LOCALES) {
      for (const route of routes) {
        const text = textOf(page(route, locale));
        expect(text, `${locale} ${route}`).not.toContain(TYPICAL_DURATION[locale]);
        expect(text, `${locale} ${route}`).not.toMatch(paid[locale]);
      }
    }
  });

  it("revisão da D44: a Descoberta não aparece como certa nem repetida no FAQ vizinho", () => {
    const discovery = { pt: /Descoberta/, en: /Discovery/, es: /Descubrimiento|Sprint/ } as const;
    const priceAnswers = [
      "faq.items.how_much.answer",
      "faq.items.free_estimate.answer",
      ...["web_systems", "mobile_apps", "integrations", "mvp"].map((service) => `services.${service}.faq.price.answer`),
    ];
    for (const locale of LOCALES) {
      // "Diagnóstico e Descoberta gratuitos" fica só em pay_before_development, que nunca sai pelo teto
      // e vem ao lado dessas respostas na Home, em /quanto-custa e nas 4 páginas de projeto.
      for (const key of priceAnswers) expect(tDynamic(locale, key), `${locale} ${key}`).not.toMatch(discovery[locale]);
      // A tabela de /sprint-de-descoberta compara com orçar sem entender o problema, não com "sem Descoberta":
      // quem não precisa da Descoberta também recebe escopo, prazo e preço fechados (when_discovery).
      const col = t(locale, "discovery_sprint.why_start_here.col_without");
      expect(col, locale).not.toMatch(discovery[locale]);
      expect(textOf(section(page("discovery_sprint", locale), "por-que-comecar-aqui")), locale).toContain(col);
      // /como-trabalhamos: a frase-síntese do hero e a meta description ressalvam a Descoberta.
      const whenNeeded = { pt: /(quando|se) necessária/, en: /when needed/, es: /si hace falta/ } as const;
      expect(t(locale, "how_we_work.hero.subtitle"), locale).toMatch(whenNeeded[locale]);
      expect(t(locale, "meta.how_we_work.description"), locale).toMatch(whenNeeded[locale]);
    }
  });

  it("MVP: o FAQ responde quanto dura a Descoberta, sem número", () => {
    for (const locale of LOCALES) {
      const html = page("service_mvp", locale);
      expect(faqIds(html, locale), locale).toContain("discovery_duration");
      expect(textOf(html), locale).toContain(t(locale, "faq.conditional.discovery_duration.answer_draft"));
    }
  });
});

describe("Perfis sem destaque enquanto vazios (F14)", () => {
  it("/contato: perfis numa linha de links depois dos cards de canal, sem cards de perfil", () => {
    for (const locale of LOCALES) {
      const html = section(page("contact", locale), "canais");
      expect(html, locale).not.toMatch(/class="[^"]*\bprofile\b/);
      expect(html.match(/data-track="profile_click"/g), locale).toHaveLength(3);
      expect(textOf(html), locale).toContain(t(locale, "contact.channels.profiles_line"));
      expect(html.indexOf("profile_click"), locale).toBeGreaterThan(html.lastIndexOf("channel__title"));
    }
  });
});
