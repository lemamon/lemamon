/**
 * Headers de segurança e cache do netlify.toml (BLUEPRINT §10.1; backlog B233,
 * B236) — dono: shell.
 *
 * O `astro preview` não executa o netlify.toml: localmente, o TEXTO do toml é
 * conferido por src/components/shell/shell-assets.test.ts (yarn test). Aqui se
 * confere o que o Netlify SERVE, contra um deploy:
 *
 *   E2E_NETLIFY_URL=https://deploy-preview-N--<site>.netlify.app yarn test:e2e shell-headers redirects
 *
 * Depois do PRIMEIRO deploy de produção (liberado quando o dono preencher a
 * privacidade e a empresa em dados/dono.json, CONTRACT §15.2), o mesmo comando
 * com E2E_NETLIFY_URL=https://lemamon.dev é a prova do critério de aceite
 * "headers nas respostas de produção" (B233) e "assets com hash imutáveis em
 * produção" (B236). O job diário .github/workflows/e2e-producao.yml roda este
 * arquivo contra produção.
 *
 * Sem a variável, todos os testes são pulados (aparecem como skipped).
 */
import { expect, test, type APIRequestContext } from "./support/consent";

const NETLIFY = process.env.E2E_NETLIFY_URL;

/** Só requisições HTTP: um projeto basta (o desktop). */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "headers não dependem do aparelho");
});

async function headersOf(request: APIRequestContext, path: string): Promise<Record<string, string>> {
  const response = await request.get(path, { maxRedirects: 0 });
  expect(response.status(), path).toBeLessThan(500);
  return response.headers();
}

test.describe("headers de segurança (B233)", () => {
  test.skip(!NETLIFY, "precisa de E2E_NETLIFY_URL (deploy); o astro preview não executa o netlify.toml");

  for (const path of ["/", "/orcamento", "/en/", "/404-inexistente"]) {
    test(`${path} responde com os headers do netlify.toml`, async ({ request }) => {
      const headers = await headersOf(request, path);
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["permissions-policy"]).toContain("camera=()");
      expect(headers["strict-transport-security"]).toContain("max-age=31536000");
      expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
      // CSP do dist/_headers gerado no build (src/integrations/csp.ts; B254):
      // Report-Only até a promoção, depois o header efetivo. Uma política só,
      // sem 'unsafe-inline' em script-src e com o hash dos scripts inline.
      const csp = headers["content-security-policy"] ?? headers["content-security-policy-report-only"];
      expect(csp, "Content-Security-Policy(-Report-Only)").toBeTruthy();
      expect(csp).toContain("frame-ancestors 'none'");
      const scriptSrc = csp?.split(";").find((part) => part.trim().startsWith("script-src")) ?? "";
      expect(scriptSrc).not.toContain("'unsafe-inline'");
      expect(scriptSrc).toMatch(/'sha256-[A-Za-z0-9+/=]{44}'/);
      expect(csp?.split(",").length, "um header de CSP só (não duas políticas)").toBe(1);
    });
  }
});

test.describe("/llms.txt fora do índice (auditoria SEO S05-10)", () => {
  test.skip(!NETLIFY, "precisa de E2E_NETLIFY_URL (deploy); o astro preview não executa o netlify.toml");

  test("/llms.txt responde 200 em text/plain com X-Robots-Tag noindex", async ({ request }) => {
    const response = await request.get("/llms.txt", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toContain("text/plain");
    expect(response.headers()["x-robots-tag"] ?? "").toContain("noindex");
  });
});

test.describe("cache dos assets (B236)", () => {
  test.skip(!NETLIFY, "precisa de E2E_NETLIFY_URL (deploy); o astro preview não executa o netlify.toml");

  test("assets com hash em /_astro/ são imutáveis por 1 ano; HTML e arquivos sem hash não", async ({ request }) => {
    const home = await request.get("/");
    expect(home.status()).toBe(200);
    const html = await home.text();
    const css = html.match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
    const js = html.match(/src="(\/_astro\/[^"]+\.js)"/)?.[1];
    const font = html.match(/<link[^>]*rel="preload"[^>]*href="(\/_astro\/[^"]+\.woff2)"/)?.[1] ?? html.match(/href="(\/_astro\/[^"]+\.woff2)"/)?.[1];
    for (const [label, asset] of [["css", css], ["js", js], ["woff2", font]] as const) {
      expect(asset, `${label} com hash referenciado pela Home`).toBeTruthy();
      const response = await request.get(asset as string);
      expect(response.status(), asset).toBe(200);
      const cache = response.headers()["cache-control"] ?? "";
      expect(cache, asset).toContain("max-age=31536000");
      expect(cache, asset).toContain("immutable");
    }

    // Vídeo e legendas do depoimento (/_midia/, nome com hash do conteúdo):
    // só existem quando o dono publica o vídeo; aí também são imutáveis.
    const midia = [...new Set([...html.matchAll(/(?:src|href)="(\/_midia\/[^"]+)"/g)].map((m) => m[1] as string))];
    for (const asset of midia) {
      const response = await request.get(asset, { headers: { range: "bytes=0-0" } });
      expect(response.status(), asset).toBeLessThan(300);
      const cache = response.headers()["cache-control"] ?? "";
      expect(cache, asset).toContain("max-age=31536000");
      expect(cache, asset).toContain("immutable");
    }

    // Arquivo sem hash não pode ficar preso em cache (deploy novo vale na hora).
    expect(home.headers()["cache-control"] ?? "").not.toContain("immutable");
    const og = await request.get("/assets/img/og/default-pt.jpg");
    expect(og.status()).toBe(200);
    expect(og.headers()["cache-control"] ?? "").not.toContain("immutable");
  });
});
