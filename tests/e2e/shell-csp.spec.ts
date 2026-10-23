/**
 * CSP sem violações (backlog B254) — dono: shell.
 *
 * A CSP vem do dist/_headers que src/integrations/csp.ts gera no build (hash
 * de cada script inline, sem 'unsafe-inline' em script-src), em Report-Only; o
 * navegador dispara `securitypolicyviolation` também nesse modo, então este
 * teste é o critério para PROMOVER o header a Content-Security-Policy
 * (CSP_ENFORCE = true em csp.ts): rodar contra o deploy de PRODUÇÃO (as tags de
 * medição só carregam com CONTEXT=production), com GA4, Google Ads, New Relic e
 * os formulários ativos, e ter 0 violações. No deploy preview ele já valida a
 * política sem as tags (hashes dos scripts do site e da ilha do wizard):
 *
 *   E2E_NETLIFY_URL=https://lemamon.dev yarn test:e2e shell-csp --project=desktop
 *
 * No deploy preview, o Netlify injeta a barra de colaboração
 * (/.netlify/scripts/cdp, que abre um iframe de app.netlify.com): as violações
 * que vêm dela são ignoradas, porque ela não existe em produção.
 *
 * Não envia nada: abre as páginas, começa o wizard e para antes do envio.
 * Sem E2E_NETLIFY_URL, é pulado (o astro preview não manda os headers).
 */
import { expect, test } from "./support/consent";

const NETLIFY = process.env.E2E_NETLIFY_URL;

test.describe("CSP: nenhuma violação (B254)", () => {
  test.skip(!NETLIFY, "precisa de E2E_NETLIFY_URL (deploy); o astro preview não manda o dist/_headers");

  for (const path of ["/", "/como-trabalhamos", "/orcamento", "/contato", "/en/", "/es/"]) {
    test(`${path} sem violação de CSP`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { __csp: string[] }).__csp = [];
        document.addEventListener("securitypolicyviolation", (event) => {
          (window as unknown as { __csp: string[] }).__csp.push(`${event.violatedDirective} ${event.blockedURI} ${event.sourceFile}:${event.lineNumber}`);
        });
      });
      await page.goto(path, { waitUntil: "networkidle" });
      const start = page.locator("[data-wizard-start]").first();
      if (await start.isVisible().catch(() => false)) {
        await start.click();
        await page.waitForLoadState("networkidle");
      }
      const violations = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
      expect(violations.filter((violation) => !violation.includes("/.netlify/scripts/"))).toEqual([]);
    });
  }
});
