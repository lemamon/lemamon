/**
 * Bloco "Investimento" (BLUEPRINT §5.4) COM dado — precos.ts substituído por
 * um config de teste (os valores são marcadores, não preços). Dono: home.
 *  - só as linhas pedidas E completas renderizam;
 *  - linhas fixas "Diagnóstico: gratuito" e "Sprint de Descoberta: gratuita, se
 *    for necessária" (D44: a Descoberta não tem faixa), nota, link com
 *    ?origem={pagina}-investimento;
 *  - intro/nota da página substituem as compartilhadas;
 *  - sem "plano recomendado" nem destaque de card.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/config/precos", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/config/precos")>();
  const line = (label: string, unidade: "projeto" | "mes") => ({
    faixa: { pt: `FAIXA-${label}-pt`, en: `FAIXA-${label}-en`, es: `FAIXA-${label}-es` },
    unidade,
    fatores: { pt: [`FATOR-${label}-1`, `FATOR-${label}-2`], en: [`FATOR-${label}-1`], es: [`FATOR-${label}-1`] },
  });
  return {
    ...original,
    precos: {
      desenvolvimento: { sistemas: line("SIS", "projeto"), aplicativos: null, integracoes: null, mvp: null },
      sustentacao: line("SUS", "mes"),
    },
  };
});

const { default: Investment } = await import("@/components/shared/Investment.astro");
const { PRICE_LINE_IDS } = await import("@/config/precos");
const { t } = await import("@/i18n");

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});
const render = (props: Record<string, unknown>) => container.renderToString(Investment, { props });

describe("Investment com precos.ts preenchido", () => {
  it("todas as linhas pedidas: só as completas, com unidade, fatores e link de origem", async () => {
    const html = (await render({ locale: "pt", lines: PRICE_LINE_IDS, origem: "home" })).replace(/&amp;/g, "&");
    expect(html).toContain('id="investimento"');
    expect(html).toContain(t("pt", "shared.investment.title"));
    expect(html).toContain(t("pt", "shared.investment.diagnosis_line"));
    expect(html).toContain(t("pt", "shared.investment.discovery_line"));
    expect(html).toContain(t("pt", "shared.investment.note"));
    expect(html.match(/data-line="/g)).toHaveLength(2);
    expect(html).toContain("FAIXA-SIS-pt");
    expect(html).toContain("FATOR-SIS-2");
    expect(html).toContain(t("pt", "shared.investment.unit_month"));
    expect(html).toMatch(/href="\/orcamento\?origem=home-investimento"/);
    expect(html).not.toContain("FAIXA-SIS-en");
  });

  it("página filtra as linhas; intro e nota próprias substituem as compartilhadas", async () => {
    const html = await render({
      locale: "es",
      lines: ["sustentacao"],
      origem: "sustentacao",
      intro: "INTRO-PAGINA",
      note: "NOTA-PAGINA",
      entrada: "descoberta",
      discoveryLine: false,
    });
    expect(html.match(/data-line="/g)).toHaveLength(1);
    expect(html).toContain("INTRO-PAGINA");
    expect(html).toContain("NOTA-PAGINA");
    expect(html).not.toContain(t("es", "shared.investment.note"));
    expect(html).toContain("FAIXA-SUS-es");
    // Na sustentação, a linha da Descoberta gratuita não sai.
    expect(html).not.toContain(t("es", "shared.investment.discovery_line"));
  });

  it("linhas pedidas todas vazias: nada", async () => {
    const html = await render({ locale: "pt", lines: ["desenvolvimento.mvp"], origem: "mvp" });
    expect(html.trim()).toBe("");
  });
});
