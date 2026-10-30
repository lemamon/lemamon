/**
 * Medição (BLUEPRINT §10.2–10.3; backlog B104, B277): Google Ads, GA4 e New
 * Relic só no build de produção; nada de terceiros em preview/local.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { afterEach, describe, expect, it, vi } from "vitest";

async function render(production: boolean, ga4 = "", baseAnuncios: "legitimo_interesse" | "consentimento" | null = null, remarketing = false) {
  vi.resetModules();
  vi.doMock("@/config/site", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/config/site")>();
    return { ...actual, GA4_ID: ga4, isProductionDeploy: () => production };
  });
  vi.doMock("@/config/privacidade", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/config/privacidade")>();
    return { ...actual, privacidade: { ...actual.privacidade, baseAnuncios, remarketing } };
  });
  const { default: Analytics } = await import("./Analytics.astro");
  const container = await AstroContainer.create();
  return container.renderToString(Analytics);
}

afterEach(() => {
  vi.doUnmock("@/config/site");
  vi.doUnmock("@/config/privacidade");
});

describe("Analytics.astro", () => {
  it("fora de produção não carrega gtag, Ads nem New Relic", async () => {
    const html = await render(false);
    expect(html).not.toContain("googletagmanager.com/gtag/js");
    expect(html).not.toContain("gtag_report_conversion");
    expect(html).not.toContain("/scripts/newrelic.js");
  });

  it("em produção: tag do Ads no <head>, conversão global e personalização desligada", async () => {
    const html = await render(true);
    expect(html).toContain("https://www.googletagmanager.com/gtag/js?id=AW-16881353870");
    expect(html).toContain("window.gtag_report_conversion");
    expect(html).toContain("AW-16881353870/cEi0CLmh9Z8aEI6J1PE-");
    expect(html).toContain('gtag("set","allow_ad_personalization_signals",false)');
    expect(html).toContain('gtag("set","allow_google_signals",false)');
    // Sem consentimento (legítimo interesse): nenhum consent default; New Relic
    // injetado depois do load, no ocioso, e nunca como <script src> no <head> (F56).
    expect(html).not.toContain('gtag("consent"');
    expect(html).not.toMatch(/<script[^>]*src="\/scripts\/newrelic\.js"/);
    const loader = /<script>([^<]*\/scripts\/newrelic\.js[^<]*)<\/script>/.exec(html)?.[1] ?? "";
    expect(loader).toMatch(/^addEventListener\("load",function\(\)\{\(window\.requestIdleCallback\|\|setTimeout\)/);
    expect(Buffer.byteLength(loader)).toBeLessThan(1024);
  });

  it("GA4 só com PUBLIC_GA4_ID", async () => {
    expect(await render(true, "")).not.toMatch(/G-[A-Z0-9]{4,}/);
    const html = await render(true, "G-TEST123");
    expect(html).toContain("G-TEST123");
  });
});

describe("Analytics.astro com Consent Mode v2 (B344)", () => {
  it("consent default denied ANTES do gtag('js') e de qualquer config; New Relic só depois do aceite", async () => {
    const html = await render(true, "G-TEST123", "consentimento");
    const consentAt = html.indexOf('gtag("consent","default"');
    expect(consentAt).toBeGreaterThan(-1);
    expect(consentAt).toBeLessThan(html.indexOf('gtag("js"'));
    expect(consentAt).toBeLessThan(html.indexOf('gtag("config"'));
    expect(html).toMatch(/"ad_storage":"denied","ad_user_data":"denied","ad_personalization":"denied","analytics_storage":"denied","wait_for_update":500/);
    expect(html).toContain('gtag("set","ads_data_redaction",true)');
    // url_passthrough NÃO: ele decorava todo link interno com ?_gl=… (D50).
    expect(html).not.toContain("url_passthrough");
    // O agente do New Relic não vai no <head>: src/scripts/consent.ts o injeta depois do "Aceitar".
    expect(html).not.toContain("/scripts/newrelic.js");
    // Sem remarketing, personalização continua desligada mesmo com consentimento.
    expect(html).toContain('gtag("set","allow_ad_personalization_signals",false)');
  });

  it("personalização só com remarketing E consentimento", async () => {
    expect(await render(true, "", "consentimento", true)).toContain('gtag("set","allow_ad_personalization_signals",true)');
    expect(await render(true, "", "legitimo_interesse", true)).toContain('gtag("set","allow_ad_personalization_signals",false)');
  });
});
