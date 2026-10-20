/**
 * Navegação (BLUEPRINT §8.1, §8.5, §9, §11) — integrador.
 *
 *  (e) Drawer mobile só com teclado: abre com Enter no "Menu", o foco entra no
 *      drawer, Tab e Shift+Tab ficam presos nele, Esc fecha e devolve o foco.
 *  (f) Seletor de idioma leva à página EQUIVALENTE (slug localizado, mesmo H1
 *      do i18n) e, na 404, à Home do idioma.
 */
import { expect, test } from "@playwright/test";

import { SERVICE_KEYS, SERVICE_ROUTE, urlFor } from "../../src/config/routes";

import { COPY } from "./support/wizard";

test.describe("(e) drawer mobile com teclado", () => {
  test("Enter abre, foco preso nos dois sentidos, Esc fecha e devolve o foco ao 'Menu'", async ({ page, isMobile }) => {
    test.skip(!isMobile, "o drawer só existe abaixo de 1024px");
    await page.goto("/servicos");
    const toggle = page.locator("button[data-drawer-open]");
    const dialog = page.locator("dialog[data-drawer]");
    const inDrawer = () => page.evaluate(() => Boolean(document.activeElement?.closest("dialog[data-drawer]")));

    // Chega ao "Menu" só com Tab (skip link → logo → Menu).
    for (let i = 0; i < 6 && !(await toggle.evaluate((el) => el === document.activeElement)); i += 1) {
      await page.keyboard.press("Tab");
    }
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toHaveAttribute("open", "");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await inDrawer()).toBe(true);

    // Os 5 serviços sem submenu, CTA e seletor de idioma estão no drawer (§8.1).
    for (const service of SERVICE_KEYS) {
      await expect(dialog.locator(`a[href="${urlFor(SERVICE_ROUTE[service], "pt")}"]`)).toHaveText(
        COPY.pt.shared.header.services_menu[service],
      );
    }
    await expect(dialog.locator('a[data-cta-id="diagnosis"]')).toHaveCount(1);
    await expect(dialog.locator(".language-selector a")).toHaveCount(3);

    for (let i = 0; i < 25; i += 1) {
      await page.keyboard.press("Tab");
      expect(await inDrawer()).toBe(true);
    }
    for (let i = 0; i < 25; i += 1) {
      await page.keyboard.press("Shift+Tab");
      expect(await inDrawer()).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).not.toHaveAttribute("open", "");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("(f) seletor de idioma", () => {
  test("serviço pt → en → es pelo rodapé, com slug localizado e H1 do idioma", async ({ page }) => {
    await page.goto(urlFor("service_mobile_apps", "pt"));
    const footer = page.locator("footer .language-selector");

    await footer.locator('a[hreflang="en"]').click();
    await expect(page).toHaveURL(new RegExp(`${urlFor("service_mobile_apps", "en")}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText(COPY.en.services.mobile_apps.h1);

    await page.locator('footer .language-selector a[hreflang="es"]').click();
    await expect(page).toHaveURL(new RegExp(`${urlFor("service_mobile_apps", "es")}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("h1")).toHaveText(COPY.es.services.mobile_apps.h1);

    // O idioma atual é marcado e continua apontando para a própria página.
    await expect(page.locator('footer .language-selector a[aria-current="true"]')).toHaveAttribute("hreflang", "es");
  });

  test("header (desktop) leva da Sprint de Descoberta à equivalente", async ({ page, isMobile }) => {
    test.skip(isMobile, "o seletor compacto do header é só desktop");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(urlFor("discovery_sprint", "es"));
    await page.locator('header .language-selector a[hreflang="pt-BR"]').click();
    await expect(page).toHaveURL(new RegExp(`${urlFor("discovery_sprint", "pt")}$`));
    await expect(page.locator("h1")).toHaveText(COPY.pt.discovery_sprint.hero.title);
  });

  test("na 404, o seletor leva à Home de cada idioma", async ({ page }) => {
    await page.goto("/pagina-que-nao-existe");
    const footer = page.locator("footer .language-selector");
    await expect(footer.locator('a[hreflang="en"]')).toHaveAttribute("href", urlFor("home", "en"));
    await expect(footer.locator('a[hreflang="es"]')).toHaveAttribute("href", urlFor("home", "es"));
  });
});

test.describe("header desktop sem quebra de linha (§8.1)", () => {
  test("de 1024 a 1440px o header fica na altura do token (seletor e WhatsApp numa linha)", async ({ page, isMobile }) => {
    test.skip(isMobile, "faixa desktop");
    for (const width of [1024, 1100, 1279, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const locale of ["pt", "en", "es"] as const) {
        await page.goto(urlFor("how_we_work", locale));
        const header = page.locator("[data-site-header]");
        const height = (await header.boundingBox())?.height ?? 0;
        const token = await page.evaluate(() =>
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16),
        );
        expect(height, `${locale} @${width}px`).toBeLessThanOrEqual(token + 1);
        const selector = header.locator(".language-selector");
        if (await selector.isVisible()) {
          const box = (await selector.boundingBox())!;
          const links = await selector.locator("a").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
          expect(new Set(links.map((top) => Math.round(top))).size, `seletor numa linha ${locale} @${width}px`).toBe(1);
          expect(box.height).toBeLessThan(token);
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${locale} @${width}px`).toBeLessThanOrEqual(0);
      }
    }
  });
});
