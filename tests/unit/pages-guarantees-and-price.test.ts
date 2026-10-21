/**
 * Auditoria de conversão, Pacote B (preço, prazo e garantias à vista) e as
 * decisões D31 e D42 do dono, no build com o dado real (dono: pages e home).
 *
 *  - F01/F42/F37/F41: o código do cliente na faixa de compromissos, nos riscos,
 *    em /como-trabalhamos e na régua de /quanto-custa; o NDA no hero do MVP;
 *    "Sem compromisso" na microcopy sob o CTA.
 *  - F08/F12: /quanto-custa e o MVP respondem preço e prazo pela afirmativa, e
 *    o hero do MVP leva às duas primeiras perguntas do FAQ.
 *  - F15: integrações respondem NDA e acesso aos dados perto do topo.
 *  - F14: perfis em linha em /contato (e na Home abaixo de 768px, em CSS).
 *  - D31: a linha da Home e o FAQ "outras cidades ou fora do Brasil".
 *  - D42/F58: a duração típica da Descoberta (sempre "combinada antes").
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { descoberta } from "@/config/descoberta";
import { ANCHORS, urlFor, type RouteKey } from "@/config/routes";
import { t, type Locale } from "@/i18n";
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
const faqIds = (html: string) => [...section(html, ANCHORS.faq).matchAll(/data-faq-id="([^"]+)"/g)].map((match) => match[1]);
const duration = (locale: Locale) => descoberta.duracao?.[locale] ?? "";

describe("Garantias à vista (F01, F41, F42, F37)", () => {
  it("Home: o 4º compromisso é o código; o risco 'fornecedor que some' cita o código; o par dos orçamentos linka a régua", () => {
    for (const locale of LOCALES) {
      const html = page("home", locale);
      const text = textOf(html);
      expect(text, locale).toContain(t(locale, "shared.commitments.items.code_owned"));
      expect(text, locale).not.toContain(t(locale, "shared.commitments.items.after_launch"));
      expect(text, locale).toContain(t(locale, "home.risks.pairs.vendor_disappears.answer_with_code_ownership"));
      expect(section(html, "riscos"), locale).toContain(`href="${urlFor("pricing", locale)}#como-comparar"`);
      expect(text, locale).toContain(t(locale, "shared.cta.microcopy_diagnosis"));
      expect(faqIds(html).indexOf("code_ownership"), locale).toBe(2);
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
      expect(textOf(section(html, ANCHORS.faq)), locale).toContain(t(locale, "faq.items.wont_stall.answer_with_code_ownership"));
    }
  });

  it("/quanto-custa: a régua tem 7 perguntas, a última sobre o código", () => {
    for (const locale of LOCALES) {
      const html = section(page("pricing", locale), "como-comparar");
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
      expect(faqIds(html).slice(0, 2), locale).toEqual(["price", "how_long_mvp"]);
      const hero = html.slice(0, html.indexOf("</section>"));
      expect(hero, locale).toMatch(/href="#perguntas"[^>]*data-track="cta_click"[^>]*data-cta-id="price_faq"[^>]*data-origem="mvp-hero-preco"/);
      expect(textOf(hero), locale).toContain(t(locale, "services.mvp.hero_price_link"));
      expect(textOf(hero), locale).toContain(`${t(locale, "shared.cta.microcopy_diagnosis")} · ${t(locale, "services.mvp.hero_nda_note")}`);
      // O link de preço vem depois do CTA (nunca entre o subtítulo e o botão).
      expect(hero.indexOf("mvp-hero-preco"), locale).toBeGreaterThan(hero.indexOf("origem=mvp-hero"));
      expect(faqIds(html), locale).toContain("nda");
    }
  });
});

describe("Integrações respondem NDA e acesso aos dados (F15)", () => {
  it("data_access perto do topo, com a pergunta do NDA; sem o condicional nda repetido nem how_follow_progress", () => {
    for (const locale of LOCALES) {
      const html = page("service_integrations", locale);
      const ids = faqIds(html);
      expect(ids.indexOf("data_access"), locale).toBeLessThanOrEqual(2);
      expect(ids, locale).not.toContain("nda");
      expect(ids, locale).not.toContain("how_follow_progress");
      expect(textOf(section(html, ANCHORS.faq)), locale).toContain(t(locale, "services.integrations.faq.data_access.question_with_nda"));
    }
  });
});

describe("D31: atende empresas de qualquer país", () => {
  it("Home: a linha no eyebrow e a pergunta 'outras cidades ou fora do Brasil' (uma só)", () => {
    for (const locale of LOCALES) {
      const html = page("home", locale);
      const text = textOf(html);
      expect(text, locale).toContain(t(locale, "home.hero.eyebrow_with_abroad"));
      expect(faqIds(html).filter((id) => id === "other_cities"), locale).toHaveLength(1);
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

describe("D42 / F58: duração típica da Descoberta, sempre combinada antes", () => {
  it("/sprint-de-descoberta: hero e FAQ ('quanto dura?' logo depois de 'quanto custa?')", () => {
    for (const locale of LOCALES) {
      const html = page("discovery_sprint", locale);
      const text = textOf(html);
      expect(text, locale).toContain(t(locale, "discovery_sprint.hero.microcopy_with_duration", { duracao_descoberta: duration(locale) }));
      expect(faqIds(html).slice(0, 2), locale).toEqual(["discovery_cost", "discovery_duration"]);
      expect(text, locale).toContain(t(locale, "faq.conditional.discovery_duration.answer_with_duration", { duracao_descoberta: duration(locale) }));
      // Só a duração: "Como a Descoberta acontece" continua desligada (formato, participantes e ritmo vazios).
      expect(html, locale).not.toContain(`id="${ANCHORS.discoveryFormat}"`);
    }
  });

  it("linha do método (Home) e etapa 2 em /como-trabalhamos: a tag longa ganha a duração", () => {
    for (const locale of LOCALES) {
      const tag = t(locale, "shared.method_timeline.stages.discovery.tag_long_with_duration", { duracao_descoberta: duration(locale) });
      expect(textOf(section(page("home", locale), "como-trabalhamos")), locale).toContain(tag);
      expect(textOf(section(page("how_we_work", locale), ANCHORS.stage.discovery)), locale).toContain(tag);
    }
  });

  it("MVP: o FAQ responde quanto dura a Descoberta", () => {
    for (const locale of LOCALES) expect(faqIds(page("service_mvp", locale)), locale).toContain("discovery_duration");
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
