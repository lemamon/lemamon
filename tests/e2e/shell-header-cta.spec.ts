/**
 * CTA primário do header com UM texto só (dono: shell) — backlog B167,
 * BLUEPRINT §8.6. De 1024 a 1279px (desktop estreito, ao lado do hero) o
 * header usava o rótulo curto ("Diagnóstico gratuito", sem verbo) enquanto o
 * hero dizia "Pedir diagnóstico gratuito". Agora o header compacta o
 * espaçamento e mantém o rótulo completo: shared.cta.primary ou, com agenda
 * online, shared.cta.primary_schedule, o mesmo do hero.
 * Roda contra o build (playwright.config.ts) ou um deploy (E2E_NETLIFY_URL).
 */
import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const HOMES = [
  ["pt", "/"],
  ["en", "/en/"],
  ["es", "/es/"],
] as const;
const WIDTHS = [1024, 1100, 1279] as const;

type CtaLabels = { primary: string; primary_schedule: string };
const ctaLabels = (locale: string): CtaLabels =>
  (JSON.parse(readFileSync(`src/i18n/${locale}.json`, "utf8")) as { shared: { cta: CtaLabels } }).shared.cta;

test.describe("header: rótulo completo do CTA primário em 1024–1279px (B167)", () => {
  for (const width of WIDTHS) {
    test(`${width}px: pt, en e es com o mesmo texto do hero, sem rolagem horizontal`, async ({ page, isMobile }) => {
      test.skip(isMobile, "o CTA do header nessas larguras é o do desktop");
      await page.setViewportSize({ width, height: 800 });
      for (const [locale, path] of HOMES) {
        const labels = ctaLabels(locale);
        await page.goto(path);
        const cta = page.locator("a.site-header__cta");
        await expect(cta).toBeVisible();
        const text = (await cta.innerText()).trim();
        expect([labels.primary, labels.primary_schedule], `${path} @ ${width}px`).toContain(text);
        const hero = page.locator('main a[data-cta-id="diagnosis"][data-origem="home-hero"]');
        expect(text, `${path} @ ${width}px: header = hero`).toBe((await hero.innerText()).trim());

        const layout = await page.evaluate(() => {
          const root = document.documentElement;
          const header = document.querySelector<HTMLElement>(".site-header")!;
          const link = document.querySelector<HTMLElement>("a.site-header__cta")!;
          const label = [...link.querySelectorAll<HTMLElement>(".resume-label__default")].find((node) => getComputedStyle(node).visibility !== "hidden")!;
          const navItems = [...document.querySelectorAll<HTMLElement>(".site-header__nav .nav-list > li")].filter(
            (item) => getComputedStyle(item).display !== "none",
          );
          const actions = document.querySelector<HTMLElement>(".site-header__actions")!;
          const headerHeight = parseFloat(getComputedStyle(header).getPropertyValue("--header-height")) * parseFloat(getComputedStyle(root).fontSize);
          const lineHeight = parseFloat(getComputedStyle(label).lineHeight);
          return {
            overflow: root.scrollWidth - root.clientWidth,
            headerHeight: header.getBoundingClientRect().height,
            maxHeaderHeight: headerHeight + 1, // + a borda inferior de 1px
            ctaRight: link.getBoundingClientRect().right,
            viewport: root.clientWidth,
            labelLines: Math.round(label.getBoundingClientRect().height / lineHeight),
            navRight: Math.max(...navItems.map((item) => item.getBoundingClientRect().right)),
            actionsLeft: actions.getBoundingClientRect().left,
          };
        });
        const where = `${path} @ ${width}px`;
        expect(layout.overflow, `${where}: rolagem horizontal`).toBeLessThanOrEqual(0);
        expect(layout.headerHeight, `${where}: altura do header`).toBeLessThanOrEqual(layout.maxHeaderHeight);
        expect(layout.ctaRight, `${where}: CTA dentro da tela`).toBeLessThanOrEqual(layout.viewport);
        expect(layout.labelLines, `${where}: rótulo numa linha`).toBe(1);
        expect(layout.navRight, `${where}: menu não encosta nas ações`).toBeLessThanOrEqual(layout.actionsLeft);
      }
    });
  }
});
