/**
 * E2E (Playwright) — caminho do dinheiro (04-tecnico §8) e chrome do site.
 * Roda contra o build estático servido pelo `astro preview`. Instale o
 * browser uma vez com `yarn playwright install chromium`.
 *
 * O build de E2E é separado (dist-e2e/) e liga o WhatsApp com um número de
 * TESTE (E2E_WHATSAPP_NUMBER, nunca o real), para os fluxos de WhatsApp
 * (resumo, falha de envio, pós-envio) existirem na tela. A camada de dados
 * fictícios fica DESLIGADA (PUBLIC_DADOS_FICTICIOS=false): o E2E testa o site
 * com o dados/dono.json real. O dist/ de produção continua sendo só o do `yarn build`.
 *
 * `--ignore-lock` deixa o `astro preview` em primeiro plano (o Astro 7 vai
 * para segundo plano sozinho quando detecta um agente, e o Playwright precisa
 * do processo vivo para encerrá-lo no fim).
 *
 * Redirects do netlify.toml (/projects → /orcamento etc.) não existem no
 * `astro preview`: ficam em tests/e2e/redirects.spec.ts, que só roda contra um
 * deploy (E2E_NETLIFY_URL=https://deploy-preview-N--lemamon.netlify.app).
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
/** Número de teste (formato válido 55 + DDD + 9 dígitos), nunca o real. */
export const E2E_WHATSAPP_NUMBER = "5548900000000";
const NETLIFY_URL = process.env.E2E_NETLIFY_URL;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: NETLIFY_URL ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: NETLIFY_URL
    ? undefined
    : {
        command: `yarn -s astro build --outDir dist-e2e && yarn -s astro preview --outDir dist-e2e --port ${PORT} --ignore-lock`,
        url: `http://localhost:${PORT}/`,
        env: {
          PUBLIC_WHATSAPP_NUMBER: E2E_WHATSAPP_NUMBER,
          PUBLIC_GA4_ID: "",
          // Sempre o dado real do dados/dono.json, mesmo com a camada fictícia
          // ligada no .env.local (a variável do processo vence o arquivo).
          PUBLIC_DADOS_FICTICIOS: "false",
          COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
        },
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});
