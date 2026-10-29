/**
 * E2E das páginas do agente pages (dono: pages): Como trabalhamos, Sprint de
 * Descoberta, Quanto custa, Serviços (hub + 5) nos 3 idiomas.
 * Invariantes do BLUEPRINT §6.2–§6.6, §7.1, §8.6, §8.7 e §11 que não dependem
 * do visual dos componentes compartilhados.
 */
import { readFileSync } from "node:fs";

import { expect, test } from "./support/consent";

import { quoteHref, SERVICE_KEYS, SERVICE_PARAM, SERVICE_ROUTE, urlFor, type RouteKey } from "../../src/config/routes";
import type { Locale } from "../../src/i18n/locales";

const LOCALES: Locale[] = ["pt", "en", "es"];

/** Copy lido do JSON por fs (routes.ts já evita importar JSON no Playwright). */
function copy(locale: Locale, key: string): string {
  const messages = JSON.parse(readFileSync(new URL(`../../src/i18n/${locale}.json`, import.meta.url), "utf8"));
  return key.split(".").reduce((node, part) => node[part], messages) as string;
}
const PAGES: RouteKey[] = ["how_we_work", "discovery_sprint", "pricing", "services_hub", ...SERVICE_KEYS.map((key) => SERVICE_ROUTE[key])];

for (const locale of LOCALES) {
  for (const key of PAGES) {
    const path = urlFor(key, locale);

    test(`${locale} ${key}: 1 H1, sem scroll horizontal, nenhum valor monetário`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(/(R\$|US\$|€|£)\s?\d/);
      expect(errors).toEqual([]);
    });
  }

  test(`${locale}: Descoberta e serviços têm breadcrumb (BreadcrumbList)`, async ({ page }) => {
    for (const key of ["discovery_sprint", ...SERVICE_KEYS.map((service) => SERVICE_ROUTE[service])] as RouteKey[]) {
      await page.goto(urlFor(key, locale));
      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(jsonLd.some((block) => block.includes("BreadcrumbList")), key).toBe(true);
    }
  });

  test(`${locale}: CTAs de serviço levam ?servico= e ?origem= (§7.1)`, async ({ page }) => {
    for (const service of SERVICE_KEYS) {
      await page.goto(urlFor(SERVICE_ROUTE[service], locale));
      const origem = `${SERVICE_PARAM[service]}-hero`;
      await expect(page.locator(`main a[data-origem="${origem}"]`).first()).toHaveAttribute(
        "href",
        quoteHref(locale, { servico: service, origem }),
      );
      const final = page.locator(`main a[data-origem="${SERVICE_PARAM[service]}-final"]`).first();
      await expect(final).toHaveAttribute("href", quoteHref(locale, { servico: service, origem: `${SERVICE_PARAM[service]}-final` }));
    }
  });

  test(`${locale}: CTAs da Descoberta levam ?entrada=descoberta`, async ({ page }) => {
    await page.goto(urlFor("discovery_sprint", locale));
    await expect(page.locator('main a[data-origem="descoberta-hero"]').first()).toHaveAttribute(
      "href",
      quoteHref(locale, { entrada: "descoberta", origem: "descoberta-hero" }),
    );
  });

  test(`${locale}: tabelas comparativas são tabelas acessíveis`, async ({ page }) => {
    for (const key of ["how_we_work", "discovery_sprint"] as RouteKey[]) {
      await page.goto(urlFor(key, locale));
      const table = page.locator("main table").first();
      await expect(table.locator("caption")).toHaveCount(1);
      await expect(table.locator('th[scope="col"]')).toHaveCount(3);
      expect(await table.locator('th[scope="row"]').count()).toBeGreaterThanOrEqual(4);
      await expect(table.getByRole("rowheader").first()).toBeVisible();
    }
  });

  test(`${locale}: sem engenharia, Como trabalhamos não tem a linha do GitHub no conteúdo (B134, painel de design)`, async ({ page }) => {
    await page.goto(urlFor("how_we_work", locale));
    const main = page.locator("main");
    const text = await main.innerText();
    const phrase = copy(locale, "how_we_work.engineering.profiles_fallback_link_phrase");
    expect(text.split(phrase).length - 1).toBe(0);
    await expect(main.locator('a[data-profile="github"]')).toHaveCount(0);
    await expect(page.locator('footer a[data-profile="github"]')).toHaveCount(1);
  });

  test(`${locale}: perfis no CTA final dos serviços são a linha terciária, legíveis no fundo escuro`, async ({ page }) => {
    for (const service of SERVICE_KEYS) {
      await page.goto(urlFor(SERVICE_ROUTE[service], locale));
      const cta = page.locator("#cta-final");
      await expect(cta.locator(".profile")).toHaveCount(0);
      const links = cta.locator(".profiles-inline a");
      await expect(links).toHaveCount(3);
      // Ícone e texto herdam a cor de link da superfície escura (âmbar), nunca o azul da marca.
      const colors = await links.evaluateAll((items) =>
        items.map((item) => [getComputedStyle(item).color, getComputedStyle(item.querySelector("svg")!).color]),
      );
      for (const [text, icon] of colors) {
        expect(icon).toBe(text);
        expect(icon).not.toBe("rgb(24, 33, 109)");
      }
    }
  });

  test(`${locale}: CTA de "Por onde começa" (sustentação) cabe em 1 linha a 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(urlFor(SERVICE_ROUTE.support, locale));
    const button = page.locator('#por-onde-comeca a[data-cta-id="diagnosis"]');
    const lines = await button.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
    });
    expect(lines).toBe(1);
  });
}
