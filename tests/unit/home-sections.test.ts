/**
 * Home: numeração e divisórias dos capítulos (B216), eventos de leitura
 * (B118 pricing_view, B327 scroll_depth) e número + unidade sem quebra.
 * Dono: home.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";

import { homeSectionPlan, type HomeSectionFeatures } from "@/components/home/home-sections";
import CtaFinal from "@/components/shared/CtaFinal.astro";
import { crossedThresholds, isSectionSeen, scrollDepthKey, scrollDepthPercent } from "@/components/shared/section-events";
import { noBreakSegments, separatorSegments } from "@/components/shared/typography";
import HomeHero from "@/components/home/HomeHero.astro";
import SectionHeader from "@/components/ui/SectionHeader.astro";
import { t } from "@/i18n";
import HomeView from "@/views/HomeView.astro";

const none: HomeSectionFeatures = {
  hasLogos: false,
  hasTestimonials: false,
  hasCases: false,
  pricingLines: [],
  hasTeam: false,
  hasProfiles: false,
};
const everything: HomeSectionFeatures = {
  hasLogos: true,
  hasTestimonials: true,
  hasCases: true,
  pricingLines: ["desenvolvimento.sistemas"],
  hasTeam: true,
  hasProfiles: true,
};

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe("homeSectionPlan (B216)", () => {
  const numbered = (plan: ReturnType<typeof homeSectionPlan>) =>
    Object.entries(plan)
      .filter(([, slot]) => slot.index !== undefined)
      .map(([key, slot]) => [key, slot.index]);

  it("sem dado do dono: capítulos 1..6, sem buraco", () => {
    expect(numbered(homeSectionPlan(none))).toEqual([
      ["problem", 1],
      ["risks", 2],
      ["method", 3],
      ["services", 4],
      ["faq", 5],
      ["cta_final", 6],
    ]);
  });

  it("com perfis (produção hoje): 'Confira' entra como 5, com divisória (vizinha canvas dos serviços)", () => {
    const plan = homeSectionPlan({ ...none, hasProfiles: true });
    expect(plan.trust_profiles).toEqual({ visible: true, index: 5, divider: true });
    expect(plan.faq.index).toBe(6);
    expect(plan.cta_final.index).toBe(7);
  });

  it("tudo ligado: 10 capítulos em ordem; depoimento, logos e faixas fora da numeração", () => {
    const plan = homeSectionPlan(everything);
    expect(numbered(plan).map(([, index]) => index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const key of ["hero", "commitments", "logos", "testimonial"] as const) expect(plan[key].index).toBeUndefined();
    // serviços depois do depoimento (canvas/canvas) e cases depois de serviços ganham a linha
    expect(plan.services.divider).toBe(true);
    expect(plan.cases.divider).toBe(true);
    // investimento (sutil) depois de cases (canvas): sem linha; riscos sempre com linha
    expect(plan.investment.divider).toBe(false);
    expect(plan.risks.divider).toBe(true);
    // logos colado na faixa de compromissos (que já tem as próprias linhas)
    expect(plan.logos.divider).toBe(false);
  });

  it("seção invisível não conta nem quebra a divisória da vizinha", () => {
    const plan = homeSectionPlan({ ...none, hasTeam: true, hasProfiles: true });
    expect(plan.cases).toEqual({ visible: false, divider: false });
    expect(plan.team.divider).toBe(true); // depois de serviços (canvas)
    expect(plan.trust_profiles.divider).toBe(true); // depois do time (canvas)
  });

  it("SectionHeader: '02 /' na eyebrow, decorativo; sem eyebrow, sem número", async () => {
    const html = await container.renderToString(SectionHeader, { props: { title: "T", eyebrow: "Serviços", index: 2 } });
    expect(html).toMatch(/<span class="eyebrow__index"[^>]*aria-hidden="true"[^>]*>02 \/<\/span>\s*Serviços/);
    const bare = await container.renderToString(SectionHeader, { props: { title: "T", index: 2 } });
    expect(bare).not.toContain("eyebrow");
  });

  it("Home renderizada: capítulos com eyebrow saem numerados em ordem crescente", async () => {
    const html = await container.renderToString(HomeView, { props: { locale: "pt" } });
    const indexes = [...html.matchAll(/class="eyebrow__index"[^>]*>(\d{2}) \//g)].map((match) => Number(match[1]));
    expect(indexes.length).toBeGreaterThanOrEqual(3);
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
    expect(new Set(indexes).size).toBe(indexes.length);
    expect(indexes[0]).toBe(1);
  });
});

describe("eventos de leitura (B118, B327)", () => {
  it("pricing_view: metade da seção, ou metade da tela quando a seção é mais alta que ela", () => {
    expect(isSectionSeen(150, 300, 800)).toBe(true);
    expect(isSectionSeen(149, 300, 800)).toBe(false);
    // seção de 1400px numa tela de 640: basta ocupar 320px da tela
    expect(isSectionSeen(320, 1400, 640)).toBe(true);
    expect(isSectionSeen(300, 1400, 640)).toBe(false);
    expect(isSectionSeen(0, 0, 640)).toBe(false);
  });

  it("scroll_depth: % do <main> que já passou pelo fim da tela", () => {
    expect(scrollDepthPercent(0, 4000, 1000)).toBe(25);
    expect(scrollDepthPercent(-1000, 4000, 1000)).toBe(50);
    expect(scrollDepthPercent(-3000, 4000, 1000)).toBe(100);
    expect(scrollDepthPercent(0, 0, 1000)).toBe(0);
  });

  it("scroll_depth: cada limiar sai uma vez, em ordem, só os pendentes", () => {
    expect(crossedThresholds(80, [25, 50, 75, 90])).toEqual([25, 50, 75]);
    expect(crossedThresholds(95, [90, 25])).toEqual([25, 90]);
    expect(crossedThresholds(10, [25, 50])).toEqual([]);
    expect(scrollDepthKey("/en/", 50)).toBe("lemamon:scroll:/en/:50");
  });
});

describe("número + unidade não quebra (painel ux_writer / native_en)", () => {
  it("separa os pares '2 semanas', '45 minutos' e '45-minute'", () => {
    const keep = (text: string) => noBreakSegments(text).filter((s) => s.keep).map((s) => s.text);
    expect(keep("Software funcionando a cada 2 semanas.")).toEqual(["2 semanas"]);
    expect(keep("Start with a 45-minute conversation")).toEqual(["45-minute"]);
    expect(keep("Gratuito · 45 minutos · devolutiva")).toEqual(["45 minutos"]);
    expect(noBreakSegments("Sem número aqui")).toEqual([{ text: "Sem número aqui", keep: false }]);
    expect(noBreakSegments("a 2 semanas b").map((s) => s.text).join("")).toBe("a 2 semanas b");
  });

  it("CTA final em inglês: '45-minute' num span sem quebra, no título e no passo 2", async () => {
    const html = await container.renderToString(CtaFinal, {
      props: { locale: "en", origem: "home-final", title: t("en", "home.cta_final.title"), whatsappMessage: "x", showHowItWorks: true },
    });
    const title = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(html)?.[1] ?? "";
    expect(title).toMatch(/<span class="no-break"[^>]*>45-minute<\/span>/);
    expect(html.split("How it works")[1]).toMatch(/<span class="no-break"[^>]*>45-minute<\/span>/);
  });
});

describe("eyebrow do hero: a quebra cai ANTES do '·' (painel ux_writer, quote._notes.entry_placement)", () => {
  it("separatorSegments: '· trecho' fica inteiro; o espaço antes do '·' é o ponto de quebra", () => {
    expect(separatorSegments("For SMBs and startups · São Paulo, Brazil")).toEqual([
      { text: "For SMBs and startups", keep: false },
      { text: " ", keep: false },
      { text: "· São Paulo, Brazil", keep: true },
    ]);
    // Texto sem separador: igual ao noBreakSegments (número + unidade continua protegido).
    expect(separatorSegments("Software a cada 2 semanas")).toEqual(noBreakSegments("Software a cada 2 semanas"));
    // Vários separadores: cada "· x" é um bloco; o texto visível não muda.
    const many = separatorSegments("Gratuito · 45 minutos · devolutiva por escrito");
    expect(many.filter((s) => s.keep).map((s) => s.text)).toEqual(["· 45 minutos", "· devolutiva por escrito"]);
    expect(many.map((s) => s.text).join("")).toBe("Gratuito · 45 minutos · devolutiva por escrito");
  });

  it("HomeHero nos 3 idiomas: o texto da eyebrow é UM item flex e a localidade vai com o '·' num span sem quebra", async () => {
    for (const locale of ["pt", "en", "es"] as const) {
      const html = await container.renderToString(HomeHero, { props: { locale, whatsappMessage: "x" } });
      const eyebrow = /<p class="eyebrow"[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? "";
      const [audience = "", place = ""] = t(locale, "home.hero.eyebrow").split(" · ");
      // Um único filho direto (o <span>), para o marcador ::before e o texto serem 2 itens flex.
      expect(eyebrow.trim(), locale).toMatch(/^<span[^>]*>[\s\S]*<\/span>$/);
      expect(eyebrow, locale).toContain(audience);
      expect(eyebrow, locale).toMatch(new RegExp(`<span class="no-break"[^>]*>· ${place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span>`));
      expect(eyebrow, locale).not.toMatch(/·\s*<\/span>/); // o "·" nunca termina um trecho
    }
  });
});
