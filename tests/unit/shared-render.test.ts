/**
 * Componentes compartilhados de BLUEPRINT §5 e a Home (Container API do Astro).
 * Dono: home. Com o dado REAL do repositório (dados/dono.json: sem preço, com os
 * 3 perfis publicados por decisão do dono):
 *  - linha do método: <ol> de 4 etapas, âncoras para /como-trabalhamos#{id},
 *    selo na etapa 1, tags em texto, realce com aria-current="step";
 *  - FAQ: <details> nativo (1ª aberta) e FAQPage só com os itens recebidos;
 *  - Investimento: nada (when_data, sem preço publicado);
 *  - perfis e "Confira antes de conversar": os 3 perfis publicados;
 *  - CTA final: origem, e-mail com "Copiar", sem mailto;
 *  - Home nos 3 idiomas: 1 H1 = i18n, sem stub, sem {placeholder}, todo CTA de
 *    diagnóstico com ?origem=, só a seção when_data dos perfis, sem valor monetário.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";

import HomeTrustProfiles from "@/components/home/HomeTrustProfiles.astro";
import Commitments from "@/components/shared/Commitments.astro";
import CtaFinal from "@/components/shared/CtaFinal.astro";
import DecisionPoints from "@/components/shared/DecisionPoints.astro";
import Faq from "@/components/shared/Faq.astro";
import type { FaqItem } from "@/components/shared/faq";
import Investment from "@/components/shared/Investment.astro";
import MethodTimeline from "@/components/shared/MethodTimeline.astro";
import Profiles from "@/components/shared/Profiles.astro";
import Term from "@/components/shared/Term.astro";
import { empresa } from "@/config/empresa";
import { PRICE_LINE_IDS } from "@/config/precos";
import { t, type Locale } from "@/i18n";
import HomeView from "@/views/HomeView.astro";

const LOCALES: Locale[] = ["pt", "en", "es"];
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const render = (component: any, props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(component, { props, slots });
const count = (html: string, re: RegExp) => html.match(re)?.length ?? 0;
const decode = (value: string) => value.replace(/&amp;/g, "&");

describe("MethodTimeline (§5.1)", () => {
  it("compact: <ol> com 4 etapas, âncoras para /como-trabalhamos#id, selo e tags", async () => {
    for (const locale of LOCALES) {
      const html = await render(MethodTimeline, { locale, variant: "compact" });
      expect(count(html, /<ol\b/g)).toBe(1);
      expect(count(html, /<li\b/g)).toBe(4);
      expect(html).toContain(t(locale, "shared.method_timeline.start_here_badge"));
      expect(html).toContain(t(locale, "shared.method_timeline.stages.discovery.tag"));
      expect(html).not.toContain(t(locale, "shared.method_timeline.you_get_label"));
      const prefix = locale === "pt" ? "/como-trabalhamos" : locale === "en" ? "/en/how-we-work" : "/es/como-trabajamos";
      for (const id of ["diagnostico", "descoberta", "desenvolvimento", "sustentacao"]) {
        expect(html).toContain(`href="${prefix}#${id}"`);
      }
    }
  });

  it("full: 'Você recebe' e a mesma tag; links locais e 'none'", async () => {
    const full = await render(MethodTimeline, { locale: "pt", variant: "full", linkStages: false });
    expect(full).toContain(t("pt", "shared.method_timeline.you_get_label"));
    expect(full).toContain(t("pt", "shared.method_timeline.stages.discovery.tag"));
    expect(full).toContain('href="#diagnostico"');
    const none = await render(MethodTimeline, { locale: "pt", variant: "compact", links: "none" });
    expect(none).not.toMatch(/<a\b/);
  });

  it("D44: a tag da Descoberta é a mesma nas 3 variantes, gratuita e sem duração nem protótipo", async () => {
    for (const locale of LOCALES) {
      const tag = t(locale, "shared.method_timeline.stages.discovery.tag");
      for (const variant of ["compact", "full", "highlight"] as const) {
        const html = decode(await render(MethodTimeline, { locale, variant, highlight: "discovery" }));
        expect(html, `${locale} ${variant}`).toContain(tag);
        expect(html, `${locale} ${variant}`).not.toMatch(/1 (semana|week)|prot[óo]tip|prototype/i);
      }
    }
    expect(t("pt", "shared.method_timeline.stages.discovery.tag")).toBe("Gratuita · se for necessária");
  });

  it("highlight: uma etapa com aria-current=step e o selo 'Próximo passo'", async () => {
    const html = await render(MethodTimeline, { locale: "pt", variant: "highlight", highlight: "discovery", badge: "next_step" });
    expect(count(html, /aria-current="step"/g)).toBe(1);
    expect(html).toMatch(/data-stage="discovery"[^>]*aria-current="step"/);
    expect(html).toContain(t("pt", "shared.method_timeline.next_step_badge"));
  });
});

describe("Faq (§5.6)", () => {
  const items: FaqItem[] = [
    { id: "a", question: "Pergunta A?", answer: "Resposta A." },
    { id: "b", question: "Pergunta B?", answer: "Resposta B.", link: { href: "#investimento", text: "Ver faixas" } },
  ];

  it("<details> nativo, a 1ª aberta, e FAQPage só com os itens visíveis", async () => {
    const html = await render(Faq, { locale: "pt", title: "Perguntas", items });
    expect(count(html, /<details\b/g)).toBe(2);
    expect(html).toMatch(/<details[^>]*open/);
    expect(count(html, /<details[^>]*\bopen\b/g)).toBe(1);
    const ld = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html);
    const data = JSON.parse(ld?.[1] ?? "{}") as { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity.map((entry) => entry.name)).toEqual(["Pergunta A?", "Pergunta B?"]);
    expect(data.mainEntity[1]?.acceptedAnswer.text).toBe("Resposta B. Ver faixas");
    expect(html).toContain('href="#investimento"');
  });

  it("sem itens: nem seção, nem título, nem JSON-LD", async () => {
    const html = await render(Faq, { locale: "pt", title: "Perguntas", items: [] });
    expect(html.trim()).toBe("");
  });
});

describe("when_data com o dado real (dados/dono.json)", () => {
  it("Investimento não gera nada (nenhum preço publicado)", async () => {
    for (const locale of LOCALES) {
      expect((await render(Investment, { locale, lines: PRICE_LINE_IDS, origem: "home" })).trim()).toBe("");
    }
  });

  it("perfis publicados pelo dono (GitHub, LinkedIn, Medium) em cards, inline e em 'Confira antes de conversar'", async () => {
    const urls = ["https://github.com/lemamon-dev", "https://www.linkedin.com/in/lemamon-dev", "https://medium.com/@lemamon.dev"];
    for (const locale of LOCALES) {
      const cards = await render(Profiles, { locale });
      const inline = await render(Profiles, { locale, variant: "inline" });
      const trust = await render(HomeTrustProfiles, { locale });
      for (const html of [cards, inline, trust]) {
        expect(count(html, /data-track="profile_click"/g), locale).toBe(3);
        for (const url of urls) expect(html, `${locale} ${url}`).toContain(`href="${url}"`);
      }
      expect(trust).toContain('id="confira"');
      expect(trust).toContain(t(locale, "home.trust_profiles.title"));
      // F14: os perfis são uma linha de links (sem cards) e a frase de apoio é a prova de existência (razão social · CNPJ).
      expect(trust).toMatch(/class="profiles-inline\b/);
      expect(trust).not.toMatch(/class="[^"]*\bprofile\b/);
      expect(decode(trust)).toContain(
        t(locale, "home.trust_profiles.text_with_company", { razao_social: empresa.razaoSocial, cnpj: empresa.cnpj }),
      );
    }
    // F70: em en/es, o CNPJ vem explicado.
    expect(decode(await render(HomeTrustProfiles, { locale: "en" }))).toContain(`Brazilian company registration (CNPJ) ${empresa.cnpj}`);
    expect(decode(await render(HomeTrustProfiles, { locale: "es" }))).toContain(`Registro de empresa en Brasil (CNPJ) ${empresa.cnpj}`);
  });
});

describe("Compromissos, decisão, CTA final e termos", () => {
  it("compromissos: 4 itens sem título, com selo e aria-label", async () => {
    const html = await render(Commitments, { locale: "pt" });
    expect(count(html, /<li\b/g)).toBe(4);
    // F01: com o código do cliente aprovado (answer_draft), o 4º item é o código, não a sustentação.
    expect(html).toContain('data-id="code_owned"');
    expect(html).toContain(t("pt", "shared.commitments.items.code_owned"));
    expect(html).not.toContain(t("pt", "shared.commitments.items.after_launch"));
    expect(html).not.toMatch(/<h[1-6]\b/);
    expect(html).toContain(t("pt", "shared.commitments.location_seal"));
    expect(html).toContain(`aria-label="${t("pt", "shared.commitments.aria_label")}"`);
  });

  it("compromissos: `items` filtra (sustentação = só after_launch + selo)", async () => {
    const html = await render(Commitments, { locale: "en", items: ["after_launch"] });
    expect(count(html, /<li\b/g)).toBe(1);
    expect(html).toContain(t("en", "shared.commitments.items.after_launch"));
    expect(html).not.toContain(t("en", "shared.commitments.items.every_two_weeks"));
    expect(html).toContain(t("en", "shared.commitments.location_seal"));
  });

  it("compromissos: variante compacta é uma lista só, sem <section> nem contêiner", async () => {
    const html = await render(Commitments, { locale: "es", variant: "compact" });
    expect(html).not.toMatch(/<section\b/);
    expect(html).not.toContain("container");
    expect(count(html, /<li\b/g)).toBe(5);
    expect(html).toContain(`aria-label="${t("es", "shared.commitments.aria_label")}"`);
  });

  it("onde você decide: título, intro e os 2 pontos", async () => {
    const html = await render(DecisionPoints, { locale: "es", markers: true });
    expect(html).toContain(t("es", "shared.decision_points.intro"));
    expect(count(html, /<li\b/g)).toBe(2);
  });

  it("CTA final: origem, e-mail copiável, sem mailto, 'Como funciona' em 3 passos", async () => {
    for (const locale of LOCALES) {
      const html = decode(await render(CtaFinal, { locale, origem: "home-final", whatsappMessage: "x", showHowItWorks: true }));
      expect(html).toMatch(/href="[^"]*\?origem=home-final"/);
      expect(html).not.toContain("mailto:");
      expect(html).toContain("data-copy=");
      expect(html).toContain(t(locale, "shared.cta.microcopy_no_commitment"));
      expect(count(html.split(t(locale, "shared.cta_final.how_it_works_title"))[1] ?? "", /<li\b/g)).toBe(3);
    }
  });

  it("termo: nota por padrão; toggletip nativo (popover) com o modo tip", async () => {
    const note = await render(Term, { locale: "pt", term: "prioritized_scope" });
    expect(note).toContain(t("pt", "shared.terms.prioritized_scope"));
    expect(note).not.toContain("popover");
    const tip = await render(Term, { locale: "pt", term: "mvp", mode: "tip" }, { default: "MVPs" });
    expect(tip).toMatch(/<button[^>]*popovertarget="([^"]+)"/);
    const id = /popovertarget="([^"]+)"/.exec(tip)?.[1];
    expect(tip).toContain(`id="${id}" popover="auto"`);
    expect(tip).toContain(t("pt", "shared.terms.mvp"));
    expect(tip).toContain("MVPs");
  });
});

describe("Home (§6.1) nos 3 idiomas", () => {
  it("1 H1 = i18n, sem stub nem placeholder, CTAs com origem, só os perfis de when_data e sem dinheiro", async () => {
    for (const locale of LOCALES) {
      const html = decode(await render(HomeView, { locale }));
      const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
      const h1 = [...main.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)];
      expect(h1, locale).toHaveLength(1);
      expect(h1[0]?.[1]?.replace(/<[^>]+>/g, "").trim()).toBe(t(locale, "home.hero.title"));
      expect(main).not.toContain("data-stub");
      expect(main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "")).not.toMatch(/\{[a-z_]+\}/);
      for (const id of ["inicio", "problema", "riscos", "como-trabalhamos", "servicos", "confira", "perguntas", "cta-final"]) {
        expect(main, `${locale} #${id}`).toContain(`id="${id}"`);
      }
      for (const id of ["logos", "depoimento", "cases", "investimento", "time"]) {
        expect(main, `${locale} #${id}`).not.toContain(`id="${id}"`);
      }
      const diagnosis = [...main.matchAll(/<a\b[^>]*data-cta-id="diagnosis"[^>]*>/g)].map((match) => match[0]);
      expect(diagnosis.length).toBeGreaterThanOrEqual(5);
      for (const tag of diagnosis) expect(tag, locale).toMatch(/href="[^"]*\?(?:[^"]*&)?origem=home-[a-z-]+"/);
      expect(main).not.toMatch(/(R\$|US\$|€)\s?\d/);
    }
  });
});
