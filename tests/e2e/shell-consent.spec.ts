/**
 * Aviso de cookies com Consent Mode v2 (backlog B344) — dono: shell.
 *
 * Só existe com dados/dono.json › privacidade.baseAnuncios = "consentimento"
 * (decisão D05 do dono). Sem isso, o aviso não vai à página e estes testes são
 * PULADOS (aparecem como skipped). As verificações do dataLayer e dos cookies
 * só fazem sentido com as tags de produção (CONTEXT=production): contra um
 * deploy de produção, rode com
 *   E2E_NETLIFY_URL=https://lemamon.dev yarn test:e2e shell-consent --project=desktop
 * A lógica também é coberta sem navegador por src/scripts/consent.test.ts,
 * src/scripts/gtag-inline.test.ts e src/components/shell/ConsentBanner.test.ts.
 */
import { expect, test, type Page } from "@playwright/test";

const banner = (page: Page) => page.locator("[data-consent-banner]");

test.describe("aviso de cookies (Consent Mode v2)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    test.skip((await banner(page).count()) === 0, "aviso de cookies desligado (baseAnuncios ≠ 'consentimento')");
  });

  test("sem clique: consent default denied e nenhum cookie de anúncio ou de Analytics", async ({ page, context }) => {
    await expect(banner(page)).toBeVisible();
    const hasGtag = await page.evaluate(() => typeof (window as unknown as { gtag?: unknown }).gtag === "function");
    if (hasGtag) {
      const consentDefault = await page.evaluate(() =>
        ((window as unknown as { dataLayer?: IArguments[] }).dataLayer ?? [])
          .map((args) => Array.from(args))
          .find((args) => args[0] === "consent" && args[1] === "default"),
      );
      expect(consentDefault?.[2]).toMatchObject({ ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied" });
    }
    const names = (await context.cookies()).map((cookie) => cookie.name);
    expect(names.filter((name) => /^(_ga|_gcl_au|_gcl_aw)/.test(name))).toEqual([]);
  });

  test("Recusar persiste ao navegar; 'Preferências de cookies' reabre o aviso", async ({ page }) => {
    await banner(page).locator('[data-consent-choice="decline"]').click();
    await expect(banner(page)).toBeHidden();
    await page.goto("/como-trabalhamos");
    await expect(banner(page)).toBeHidden();
    await page.locator("footer [data-consent-open]").click();
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).locator("[data-consent-choice]").first()).toBeFocused();
  });

  test("retirar o consentimento apaga os cookies de medição e de anúncio (Aceitar → Preferências → Recusar)", async ({ page, context }) => {
    await banner(page).locator('[data-consent-choice="accept"]').click();
    await expect(banner(page)).toBeHidden();
    // Sem as tags de produção ninguém grava _ga/_gcl_*: planta os cookies como o
    // gtag faria (host-only e no domínio pai), para a recusa ter o que apagar.
    const { hostname } = new URL(page.url());
    const parent = hostname.split(".").slice(-2).join(".");
    const planted = ["_ga", "_ga_TEST12345", "_gcl_au"].map((name) => ({ name, value: "1", domain: hostname, path: "/" }));
    if (parent.includes(".") && !/^\d+(\.\d+){3}$/.test(hostname)) planted.push({ name: "_gcl_aw", value: "1", domain: `.${parent}`, path: "/" });
    await context.addCookies(planted);
    await page.goto("/como-trabalhamos");
    await page.locator("footer [data-consent-open]").click();
    await banner(page).locator('[data-consent-choice="decline"]').click();
    await page.goto("/contato");
    await expect(banner(page)).toBeHidden();
    const names = (await context.cookies()).map((cookie) => cookie.name);
    expect(names.filter((name) => /^(_ga|_gcl_)/.test(name))).toEqual([]);
  });

  test("Aceitar manda consent update granted (com as tags de produção)", async ({ page }) => {
    const hasGtag = await page.evaluate(() => typeof (window as unknown as { gtag?: unknown }).gtag === "function");
    test.skip(!hasGtag, "sem as tags de produção (CONTEXT=production) não há dataLayer para conferir");
    await banner(page).locator('[data-consent-choice="accept"]').click();
    const update = await page.evaluate(() =>
      ((window as unknown as { dataLayer?: IArguments[] }).dataLayer ?? [])
        .map((args) => Array.from(args))
        .find((args) => args[0] === "consent" && args[1] === "update"),
    );
    expect(update?.[2]).toMatchObject({ ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted" });
  });
});
