/**
 * Smoke E2E da fundação: cada rota "always" abre com 1 H1 e sem erro de console.
 * O caminho do dinheiro (wizard → envio → pós-envio, falha → WhatsApp) é do
 * agente conversion (04-tecnico §8, specs 1–4).
 */
import { expect, test } from "./support/consent";

import { isRouteLive, routeDef, staticRouteEntries } from "../../src/config/routes";

const pages = staticRouteEntries().filter(({ key }) => isRouteLive(key, {}) && !routeDef(key).error);

/**
 * Contra um deploy (E2E_NETLIFY_URL, inclusive o job diário em produção,
 * .github/workflows/e2e-producao.yml), as tags de medição são bloqueadas: o
 * robô nunca vira sessão no GA4, visita no Ads nem sessão no New Relic.
 */
const TRACKERS =
  /^https:\/\/([^/]+\.)?(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|googleadservices\.com|doubleclick\.net|nr-data\.net|newrelic\.com)\/|\/scripts\/newrelic\.js(\?|$)/;

test.beforeEach(async ({ page }) => {
  if (process.env.E2E_NETLIFY_URL) await page.route(TRACKERS, (route) => route.abort());
});

for (const { key, locale, path } of pages) {
  test(`${locale} ${key} (${path})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

// O `astro preview` serve só o 404.html da raiz para qualquer caminho
// inexistente; a 404 POR IDIOMA (/en/* → /en/404.html) é regra do netlify.toml
// e é conferida contra o deploy em redirects.spec.ts (E2E_NETLIFY_URL).
test("404: status 404 e a página de erro de cada idioma no idioma certo", async ({ page }) => {
  const response = await page.goto("/en/nao-existe");
  expect(response?.status()).toBe(404);
  for (const [path, lang] of [["/404", "pt-BR"], ["/en/404", "en"], ["/es/404", "es"]] as const) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});
