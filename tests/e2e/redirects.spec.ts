/**
 * (g) Redirects e 404 por idioma do netlify.toml (BLUEPRINT §10.1) — integrador.
 *
 * NÃO são testáveis no `astro preview`: as regras vivem no netlify.toml, que só
 * o Netlify executa. Localmente, a ordem/status/destino de cada regra é
 * conferida por src/components/shell/shell-assets.test.ts (yarn test). Aqui,
 * o comportamento real é conferido contra um deploy:
 *
 *   E2E_NETLIFY_URL=https://deploy-preview-123--<site>.netlify.app yarn test:e2e redirects
 *
 * Sem a variável, todos os testes deste arquivo são pulados (e listados como
 * skipped no relatório, para ninguém achar que passaram).
 */
import { expect, test } from "@playwright/test";

const NETLIFY = process.env.E2E_NETLIFY_URL;

test.describe("(g) redirects do Netlify", () => {
  test.skip(!NETLIFY, "precisa de E2E_NETLIFY_URL (deploy preview); o astro preview não executa o netlify.toml");

  const RULES: [from: string, to: string, status: number][] = [
    ["/projects", "/orcamento", 301],
    ["/projects/qualquer-coisa", "/orcamento", 301],
    ["/diagnostico", "/orcamento", 301],
    ["/metodo", "/como-trabalhamos?utm_source=resumo_copiado&utm_medium=compartilhamento", 301],
    ["/en/method", "/en/how-we-work?utm_source=resumo_copiado&utm_medium=compartilhamento", 301],
    ["/es/metodo", "/es/como-trabajamos?utm_source=resumo_copiado&utm_medium=compartilhamento", 301],
    ["/lemamon", "/", 301],
    ["/home", "/", 301],
    ["/post/1", "/", 301],
    ["/?lng=en", "/en/", 301],
    ["/?lng=es", "/es/", 301],
    ["/blog", "/", 302],
  ];

  for (const [from, to, status] of RULES) {
    test(`${from} → ${to} (${status})`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(status);
      const location = new URL(response.headers().location ?? "", NETLIFY);
      expect(`${location.pathname}${location.search}`).toBe(to);
    });
  }

  test("/projects repassa gclid e utm para /orcamento (conversão do Ads)", async ({ request }) => {
    const response = await request.get("/projects?gclid=e2e-123&utm_source=google", { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    const location = new URL(response.headers().location ?? "", NETLIFY);
    expect(location.pathname).toBe("/orcamento");
    expect(location.searchParams.get("gclid")).toBe("e2e-123");
    expect(location.searchParams.get("utm_source")).toBe("google");
  });

  for (const [path, lang] of [
    ["/en/nao-existe", "en"],
    ["/es/no-existe", "es"],
    ["/nao-existe", "pt-BR"],
  ] as const) {
    test(`404 no idioma: ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
    });
  }

  test("sem catch-all de SPA: rota inexistente não devolve a Home com 200", async ({ request }) => {
    const response = await request.get("/qualquer/rota/inexistente");
    expect(response.status()).toBe(404);
  });
});
