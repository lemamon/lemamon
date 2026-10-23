/**
 * Páginas de avaliação: polimento da auditoria de conversão (dono: pages/home).
 *
 *  - F46: na impressão (beforeprint), o CTA final volta aos tokens claros, os
 *    FAQs abrem e aparece "Diagnóstico gratuito: lemamon.dev/orcamento"; no
 *    afterprint, tudo volta.
 *  - F47: em /como-trabalhamos a partir de 1024px, o índice das 4 etapas ocupa
 *    a coluna da direita do hero, na 1ª tela.
 */
import { expect, test } from "./support/consent";

import { COPY } from "./support/wizard";

test.describe("impressão (F46)", () => {
  test("beforeprint prepara o papel; afterprint desfaz", async ({ page }) => {
    await page.goto("/como-trabalhamos");
    const cta = page.locator("#cta-final");
    const line = cta.locator("[data-print-only]");
    await expect(cta).toHaveAttribute("data-surface", "inverse");
    await expect(line).toBeHidden();
    const closed = await page.locator("details[data-faq-id]:not([open])").count();
    expect(closed).toBeGreaterThan(0);

    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    await expect(cta).not.toHaveAttribute("data-surface", "inverse");
    await expect(line).toBeVisible();
    await expect(line).toHaveText(COPY.pt.shared.cta_final.print_line.replace("{url}", "lemamon.dev/orcamento"));
    await expect(page.locator("details[data-faq-id]:not([open])")).toHaveCount(0);

    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    await expect(cta).toHaveAttribute("data-surface", "inverse");
    await expect(line).toBeHidden();
    await expect(page.locator("details[data-faq-id]:not([open])")).toHaveCount(closed);
  });
});

test.describe("/como-trabalhamos (F47)", () => {
  test("a partir de 1024px, o índice das etapas fica na coluna da direita do hero", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "layout de notebook");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/como-trabalhamos");
    const index = page.locator('.page-hero .stage-index[data-variant="chips"]');
    await expect(index).toBeVisible();
    const box = await index.boundingBox();
    expect(box?.x ?? 0).toBeGreaterThan(640);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(800);
    await expect(index.locator("a")).toHaveCount(4);
    // Abaixo de 1024px, os chips continuam embaixo do texto.
    await page.setViewportSize({ width: 800, height: 900 });
    const chips = await index.boundingBox();
    expect(chips?.x ?? 999).toBeLessThan(100);
  });
});
