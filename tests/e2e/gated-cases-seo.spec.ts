/**
 * E2E da página de case (dono: gated) — auditoria de SEO:
 *  - S01-3: slug da URL por idioma (slugUrl); canonical, hreflang e seletor de
 *    idioma com o slug de cada idioma; o slug pt em /en/cases/ não existe; o
 *    sitemap lista o case sem xhtml:link; o ?ref= continua sendo a chave (pt);
 *  - S02-10 · S03-15 · S03-2: breadcrumb e BreadcrumbList com o nome do projeto;
 *  - S03-4 · S06-9: ficha com link para o serviço e para as etapas do método.
 * Roda com os cases REAIS de src/content/cases (sem eles, pula).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { anchorFor, ANCHORS, SERVICE_ROUTE, urlFor, type ServiceKey } from "../../src/config/routes";
import type { Locale } from "../../src/i18n/locales";
import { camposDoSitemap } from "../../src/integrations/sitemap-cases";

const DIR = "src/content/cases";
const KEY = existsSync(`${DIR}/pt`) ? readdirSync(`${DIR}/pt`).find((file) => /\.mdx?$/.test(file))?.replace(/\.mdx?$/, "") : undefined;

function frontmatter(locale: Locale) {
  const text = readFileSync(`${DIR}/${locale}/${KEY}.mdx`, "utf8");
  const seoTitle = /^seoTitle: "(.*)"$/m.exec(text)?.[1];
  const servicos = JSON.parse(/^servicos: (\[.*\])$/m.exec(text)?.[1] ?? "[]") as ServiceKey[];
  return { ...camposDoSitemap(text), seoTitle, servicos };
}

test.describe("página de case: slug por idioma, breadcrumb e ficha (auditoria de SEO)", () => {
  test.skip(!KEY, "sem cases reais no repositório");

  test("en: URL com slugUrl, canonical e hreflang recíprocos, seletor de idioma e ?ref= com a chave", async ({ page }) => {
    const key = KEY as string;
    const slugs = { pt: key, en: frontmatter("en").slugUrl ?? key, es: frontmatter("es").slugUrl ?? key };
    const path = urlFor("case", "en", { slug: slugs.en });
    expect(slugs.en, "o case em inglês tem slug próprio").not.toBe(key);

    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://lemamon.dev${path}`);
    const hreflang = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
      Object.fromEntries(links.map((link) => [link.getAttribute("hreflang"), link.getAttribute("href")])),
    );
    expect(hreflang).toEqual({
      "pt-BR": `https://lemamon.dev${urlFor("case", "pt", { slug: slugs.pt })}`,
      en: `https://lemamon.dev${path}`,
      es: `https://lemamon.dev${urlFor("case", "es", { slug: slugs.es })}`,
      "x-default": `https://lemamon.dev${urlFor("case", "pt", { slug: slugs.pt })}`,
    });

    // Seletor de idioma do rodapé: cada idioma no slug dele.
    const footer = page.locator("footer .language-selector");
    await expect(footer.locator('a[lang="pt-BR"]')).toHaveAttribute("href", urlFor("case", "pt", { slug: slugs.pt }));
    await expect(footer.locator('a[lang="es"]')).toHaveAttribute("href", urlFor("case", "es", { slug: slugs.es }));

    // O CTA final leva a chave do case (pt) no ?ref=, não o slug da URL.
    await expect(page.locator(`#cta-final a[href*="ref=${key}"]`).first()).toBeAttached();

    // Com o slug pt, a URL em inglês não existe mais.
    const old = await page.goto(urlFor("case", "en", { slug: key }));
    expect(old?.status()).toBe(404);
  });

  test("breadcrumb e BreadcrumbList com o nome do projeto; ficha com link para serviço e etapas", async ({ page, isMobile }) => {
    const key = KEY as string;
    for (const locale of ["pt", "es"] as const) {
      const data = frontmatter(locale);
      await page.goto(urlFor("case", locale, { slug: data.slugUrl ?? key }));
      const name = data.seoTitle as string;
      if (!isMobile) await expect(page.locator('nav.breadcrumb [aria-current="page"]')).toHaveText(name);
      const crumbs = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
        nodes.map((node) => JSON.parse(node.textContent ?? "{}")).find((node) => node["@type"] === "BreadcrumbList"),
      );
      expect(crumbs.itemListElement.at(-1)).toEqual({ "@type": "ListItem", position: 3, name });

      const sheet = page.locator(".case-hero__sheet");
      for (const service of data.servicos) {
        await expect(sheet.locator(`a[href="${urlFor(SERVICE_ROUTE[service], locale)}"]`)).toHaveCount(1);
      }
      await expect(sheet.locator(`a[href="${urlFor("discovery_sprint", locale)}"]`)).toHaveCount(1);
      await expect(sheet.locator(`a[href="${anchorFor("how_we_work", locale, ANCHORS.stage.development)}"]`)).toHaveCount(1);
      if (isMobile) {
        // Alvo de toque de 44px na altura (faixa de padding), sem mudar a linha.
        const heights = await sheet.locator(".field-list__links a").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
        expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("sitemap: o case em cada idioma, com o slug do idioma e sem xhtml:link", async ({ request }) => {
    const key = KEY as string;
    const xml = await (await request.get("/sitemap-0.xml")).text();
    for (const locale of ["pt", "en", "es"] as const) {
      const url = `https://lemamon.dev${urlFor("case", locale, { slug: frontmatter(locale).slugUrl ?? key })}`;
      const entry = new RegExp(`<url><loc>${url.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}</loc>([\\s\\S]*?)</url>`).exec(xml);
      expect(entry, url).not.toBeNull();
      expect(entry?.[1], url).not.toContain("xhtml:link");
    }
  });
});
