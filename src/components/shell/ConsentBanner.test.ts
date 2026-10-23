/**
 * Aviso de cookies (B344): só existe com baseAnuncios = "consentimento"; nasce
 * escondido (o script decide), com as duas escolhas do mesmo tipo, link para a
 * Política e o New Relic só em produção (data-nr-src).
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { afterEach, describe, expect, it, vi } from "vitest";

type Pixels = import("@/config/privacidade").Privacidade["pixels"];

async function render(
  baseAnuncios: "legitimo_interesse" | "consentimento" | null,
  production = false,
  placement?: "fixed" | "inline",
  pixels?: Pixels,
  { remarketing = false, ga4Id = "G-TESTE123", route }: { remarketing?: boolean; ga4Id?: string; route?: import("@/config/routes").RouteKey } = {},
) {
  vi.resetModules();
  vi.doMock("@/config/privacidade", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/config/privacidade")>();
    return { ...actual, privacidade: { ...actual.privacidade, baseAnuncios, remarketing, pixels } };
  });
  vi.doMock("@/config/site", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/config/site")>();
    return { ...actual, GA4_ID: ga4Id, isProductionDeploy: () => production };
  });
  // Os textos shared.consent.* entram no i18n pelo redator; aqui o teste usa a própria chave.
  vi.doMock("@/i18n", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/i18n")>();
    return {
      ...actual,
      tDynamic: (locale: Parameters<typeof actual.tDynamic>[0], key: string, vars?: Parameters<typeof actual.tDynamic>[2]) =>
        key.startsWith("shared.consent.") ? `[${key}]` : actual.tDynamic(locale, key, vars),
    };
  });
  const { default: ConsentBanner } = await import("./ConsentBanner.astro");
  const container = await AstroContainer.create();
  return container.renderToString(ConsentBanner, { props: { locale: "pt", placement, route } });
}

afterEach(() => {
  vi.doUnmock("@/config/privacidade");
  vi.doUnmock("@/config/site");
  vi.doUnmock("@/i18n");
});

describe("ConsentBanner.astro", () => {
  it("sem consentimento (vazio ou legítimo interesse): não renderiza nada", async () => {
    expect(await render(null)).not.toContain("data-consent-banner");
    expect(await render("legitimo_interesse")).not.toContain("data-consent-banner");
  });

  it("com consentimento: região escondida até o script decidir, Recusar e Aceitar do mesmo tipo, link para a Política", async () => {
    const html = await render("consentimento");
    expect(html).toMatch(/<div[^>]*role="region"[^>]*data-consent-banner[^>]*hidden/);
    expect(html).toContain('data-consent-choice="decline"');
    expect(html).toContain('data-consent-choice="accept"');
    expect(html.match(/class="consent__button[^"]*"/g)).toHaveLength(2);
    expect(html).toContain('href="/privacidade"');
    expect(html).toContain("[shared.consent.title]");
    // Fora de produção não há New Relic para carregar.
    expect(html).not.toContain("data-nr-src");
  });

  it("em produção o New Relic é carregado só pelo aceite (data-nr-src); no wizard fica no fluxo", async () => {
    expect(await render("consentimento", true)).toContain('data-nr-src="/scripts/newrelic.js"');
    expect(await render("consentimento", false, "inline")).toContain('data-placement="inline"');
  });

  it("pixels opcionais (B346/B347): atributo só em produção, com consentimento e ID; nenhum por padrão", async () => {
    const prazo = { pt: "180 dias", en: "180 days", es: "180 días" };
    const pixels: Pixels = { linkedin: { id: "1234567", prazo }, meta: { id: "123456789012345", prazo } };
    const withIds = await render("consentimento", true, undefined, pixels);
    expect(withIds).toContain('data-linkedin-partner-id="1234567"');
    expect(withIds).toContain('data-meta-pixel-id="123456789012345"');
    // Fora de produção (preview, local, camada fictícia): nada.
    expect(await render("consentimento", false, undefined, pixels)).not.toMatch(/data-(linkedin-partner-id|meta-pixel-id)/);
    // Sem ID (o dado de hoje): nada.
    expect(await render("consentimento", true)).not.toMatch(/data-(linkedin-partner-id|meta-pixel-id)/);
    // ID inválido: nada.
    expect(await render("consentimento", true, undefined, { linkedin: { id: "abc", prazo } })).not.toContain("data-linkedin-partner-id");
  });

  it("o texto diz o que o aceite libera: GA4 só quando existe, remarketing só quando ligado (B348)", async () => {
    const text = (html: string) => html.match(/\[shared\.consent\.(text[a-z_0-9]*)\]/g) ?? [];
    expect(text(await render("consentimento"))).toEqual(["[shared.consent.text]"]);
    expect(text(await render("consentimento", false, undefined, undefined, { ga4Id: "" }))).toEqual(["[shared.consent.text_no_ga4]"]);
    expect(text(await render("consentimento", false, undefined, undefined, { remarketing: true }))).toEqual([
      "[shared.consent.text_with_remarketing]",
    ]);
    expect(text(await render("consentimento", false, undefined, undefined, { remarketing: true, ga4Id: "" }))).toEqual([
      "[shared.consent.text_no_ga4_with_remarketing]",
    ]);
  });

  it("o aviso cita os pixels publicados (B346/B347): ambos, só LinkedIn, só Meta; sem ID ou fora de produção, nenhum", async () => {
    const prazo = { pt: "180 dias", en: "180 days", es: "180 días" };
    const linkedin = { id: "1234567", prazo };
    const meta = { id: "123456789012345", prazo };
    const pixelText = (html: string) => html.match(/\[shared\.consent\.text_pixels_[a-z]+\]/g) ?? [];
    expect(pixelText(await render("consentimento", true, undefined, { linkedin, meta }))).toEqual(["[shared.consent.text_pixels_both]"]);
    expect(pixelText(await render("consentimento", true, undefined, { linkedin }))).toEqual(["[shared.consent.text_pixels_linkedin]"]);
    expect(pixelText(await render("consentimento", true, undefined, { meta }))).toEqual(["[shared.consent.text_pixels_meta]"]);
    // Sem ID, fora de produção ou com ID inválido: o texto não promete pixel nenhum.
    expect(pixelText(await render("consentimento", true))).toEqual([]);
    expect(pixelText(await render("consentimento", false, undefined, { linkedin, meta }))).toEqual([]);
    expect(pixelText(await render("consentimento", true, undefined, { linkedin: { id: "abc", prazo } }))).toEqual([]);
    // A frase vem depois do texto principal, no mesmo parágrafo, antes do link da Política.
    expect(await render("consentimento", true, undefined, { linkedin, meta })).toMatch(
      /\[shared\.consent\.text\] \[shared\.consent\.text_pixels_both\] <a href="\/privacidade"/,
    );
  });

  it("Meta Pixel fora das páginas com formulário (B347): wizard, pós-envio e contato sem data-meta-pixel-id", async () => {
    const prazo = { pt: "180 dias", en: "180 days", es: "180 días" };
    const pixels: Pixels = { linkedin: { id: "1234567", prazo }, meta: { id: "123456789012345", prazo } };
    for (const route of ["quote", "quote_sent", "contact"] as const) {
      const html = await render("consentimento", true, route === "contact" ? undefined : "inline", pixels, { route });
      expect(html, route).not.toContain("data-meta-pixel-id");
      expect(html, route).toContain('data-linkedin-partner-id="1234567"');
      // O aceite vale para o site todo: o texto continua citando a Meta.
      expect(html, route).toContain("[shared.consent.text_pixels_both]");
    }
    expect(await render("consentimento", true, undefined, pixels, { route: "home" })).toContain('data-meta-pixel-id="123456789012345"');
  });
});
