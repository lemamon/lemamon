/**
 * /llms.txt (auditoria SEO S05-10) — src/components/shell/llms.ts e
 * src/pages/[llms].txt.ts. Dono: shell.
 *
 *  - gerado do i18n e das flags: nome, resumo, método, o que é cobrado e
 *    quando, atendimento fora de São Paulo (só com a D31), contato e as
 *    páginas principais nos 3 idiomas, todas com URL absoluta;
 *  - página when_data só com a flag; description sem WhatsApp sem número;
 *  - nada que envelheça (ano, data, contagem) nem preço;
 *  - o build sem a camada fictícia publica o arquivo; o build COM a camada não.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { buildLlmsTxt, LLMS_PAGES } from "@/components/shell/llms";
import { computeFeatures } from "@/config/features";
import { absoluteUrl, urlFor } from "@/config/routes";
import { t, type Locale } from "@/i18n";

import { baseSources, realSources } from "../fixtures/features";

const LOCALES: Locale[] = ["pt", "en", "es"];
const real = computeFeatures(realSources({ env: { whatsappNumber: "5548900000000", ga4Id: "" } }));

describe("/llms.txt: conteúdo", () => {
  const text = buildLlmsTxt(real);

  it("H1 com o nome, citação com o resumo e uma seção por idioma", () => {
    expect(text.startsWith(`# Lemamon.dev\n\n> ${t("pt", "meta.organization_description")}\n`)).toBe(true);
    for (const locale of LOCALES) {
      expect(text, locale).toContain(`\n## ${t(locale, `shared.language.${locale}` as never)}\n`);
      expect(text, locale).toContain(t(locale, "meta.organization_description"));
      expect(text, locale).toContain(t(locale, "home.hero.title"));
      expect(text, locale).toContain(t(locale, "faq.items.pay_before_development.answer"));
      expect(text, locale).toContain(`${absoluteUrl(urlFor("contact", locale))}`);
    }
    expect(text).toContain("comercial@lemamon.dev");
  });

  it("D31 ligada no dado real: a resposta de outras cidades e do exterior; sem a flag, nada", () => {
    for (const locale of LOCALES) {
      expect(text, locale).toContain(t(locale, "faq.conditional.other_cities.answer_with_abroad"));
    }
    const none = buildLlmsTxt(computeFeatures(baseSources()));
    for (const locale of LOCALES) {
      expect(none, locale).not.toContain(t(locale, "faq.conditional.other_cities.answer_with_abroad"));
      expect(none, locale).not.toContain(t(locale, "faq.conditional.other_cities.answer_draft"));
    }
  });

  it("as páginas principais nos 3 idiomas, com URL absoluta; as when_data só com a flag", () => {
    for (const locale of LOCALES) {
      for (const route of ["home", "how_we_work", "discovery_sprint", "services_hub", "service_mvp", "pricing", "contact", "quote"] as const) {
        expect(text, `${locale} ${route}`).toContain(`](${absoluteUrl(urlFor(route, locale))}): `);
      }
    }
    expect(LLMS_PAGES).not.toContain("quote_sent");
    expect(LLMS_PAGES).not.toContain("not_found");
    // Sem time, sem cases e sem posts (dado de teste): Sobre, Cases e Blog ficam de fora.
    expect(text).not.toContain(absoluteUrl(urlFor("about", "pt")));
    expect(text).not.toContain(absoluteUrl(urlFor("blog_hub", "pt")));
    expect(text).not.toContain(absoluteUrl(urlFor("cases_hub", "pt")));
    const withCases = buildLlmsTxt({ ...real, hasCases: true });
    for (const locale of LOCALES) expect(withCases, locale).toContain(absoluteUrl(urlFor("cases_hub", locale)));
  });

  it("description sem WhatsApp quando não há número (a mesma variante da página)", () => {
    const noWhatsapp = buildLlmsTxt({ ...real, hasWhatsapp: false });
    for (const locale of LOCALES) {
      expect(noWhatsapp, locale).toContain(t(locale, "meta.contact.description_no_whatsapp"));
      expect(noWhatsapp, locale).not.toContain(t(locale, "meta.contact.description"));
    }
  });

  it("nada que envelheça nem preço: sem ano, data, contagem de projetos ou valor", () => {
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(text).not.toMatch(/\d{1,2}\/\d{1,2}/);
    expect(text).not.toMatch(/R\$|US\$|€/);
    expect(text).not.toMatch(/\bhoje\b|\btoday\b|\bhoy\b/i);
  });
});

describe("/llms.txt: build", () => {
  it("o build sem a camada fictícia publica /llms.txt com o texto das flags do build", () => {
    const { semFicticio } = inject("buildsDosDados");
    const file = join(semFicticio.outDir, "llms.txt");
    expect(existsSync(file)).toBe(true);
    const published = readFileSync(file, "utf8");
    expect(published.startsWith("# Lemamon.dev\n")).toBe(true);
    expect(published).toContain(t("en", "meta.organization_description"));
    // Arquivo de texto não entra no sitemap.
    expect(readFileSync(join(semFicticio.outDir, "sitemap-0.xml"), "utf8")).not.toContain("llms.txt");
  });

  it("com a camada fictícia o arquivo não existe (nunca gerar com dado fictício)", () => {
    const { comFicticio } = inject("buildsDosDados");
    expect(existsSync(join(comFicticio.outDir, "index.html"))).toBe(true);
    expect(existsSync(join(comFicticio.outDir, "llms.txt"))).toBe(false);
  });
});
