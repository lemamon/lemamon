/**
 * Caminho do dinheiro SEGURO PARA PRODUÇÃO (dono: shell) — backlog B240.
 *
 * Roda no E2E diário contra https://lemamon.dev (.github/workflows/e2e-producao.yml)
 * e em todo PR contra o build local (só no projeto desktop). Confere as duas
 * metades do critério de 04-tecnico §8 que o smoke não cobre:
 *  (a) /orcamento → 6 perguntas → resumo → contato → envio → /orcamento/enviado
 *      com o código do pedido;
 *  (b) envio falhando (500) → tela de erro → "Enviar pelo WhatsApp" abre o
 *      wa.me do número publicado com o resumo do pedido.
 *
 * Nada vira dado real:
 *  - GA4, Google Ads e New Relic são abortados (mesma regex do smoke.spec.ts):
 *    0 sessão, 0 evento, 0 conversão;
 *  - o POST do Netlify Forms é interceptado por stubNetlify() e nunca sai do
 *    navegador: 0 lead. Qualquer outro POST para o site é abortado e reprova o
 *    teste (se o envio mudar de endpoint, o teste avisa em vez de criar lead);
 *  - window.open é capturado: o WhatsApp nunca abre.
 * O número do WhatsApp é LIDO da página (link do header do wizard), não fixo:
 * em produção ele é o real, no build de E2E é o de teste.
 */
import { expect, test, type Page } from "./support/consent";

import {
  answerAll,
  captureWindowOpen,
  CONTACT,
  COPY,
  fillContact,
  PROTOCOL_RE,
  start,
  stubNetlify,
  submit,
  waitMinFill,
  wizardRoot,
} from "./support/wizard";

/** Tags de medição: nunca carregam neste teste (igual a smoke.spec.ts). */
const TRACKERS =
  /^https:\/\/([^/]+\.)?(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|googleadservices\.com|doubleclick\.net|nr-data\.net|newrelic\.com)\/|\/scripts\/newrelic\.js(\?|$)/;

const WA_NUMBER = /^https:\/\/wa\.me\/(55\d{10,11})(?:\?|$)/;

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "um projeto basta: o mobile já roda o caminho do dinheiro do integrador");
});

/**
 * Bloqueia medição e guarda todo POST para o site que não seja o do Netlify
 * Forms (que o stubNetlify atende). O Playwright roda as rotas na ordem
 * inversa do registro: o stub (registrado depois) atende o POST para "/".
 */
async function lockDown(page: Page): Promise<{ strayPosts: string[] }> {
  const strayPosts: string[] = [];
  await page.route(TRACKERS, (route) => route.abort());
  await page.route(
    (url) => url.pathname !== "/",
    (route) => {
      const request = route.request();
      const sameSite = new URL(request.url()).origin === new URL(page.url() || request.url()).origin;
      if (request.method() === "POST" && sameSite) {
        strayPosts.push(request.url());
        return route.abort();
      }
      return route.fallback();
    },
  );
  return { strayPosts };
}

/** Número publicado: o do link de WhatsApp do header do wizard (§8.4). */
async function publishedNumber(page: Page): Promise<string> {
  const href = (await page.locator('header a[href^="https://wa.me/"]').first().getAttribute("href")) ?? "";
  const number = href.match(WA_NUMBER)?.[1] ?? process.env.E2E_WHATSAPP_NUMBER ?? "";
  expect(number, "número do WhatsApp publicado (header do wizard)").toMatch(/^55\d{10,11}$/);
  return number;
}

test("(a) envio do pedido chega a /orcamento/enviado com o código, sem lead real", async ({ page }) => {
  const guard = await lockDown(page);
  const netlify = await stubNetlify(page, 200);
  const q = COPY.pt.quote;

  await page.goto("/orcamento?origem=e2e-producao");
  const startedAt = await start(page);
  await answerAll(page, "pt");
  await fillContact(page, "pt");
  await waitMinFill(page, startedAt);
  await submit(page, "pt");

  await expect(page).toHaveURL(/\/orcamento\/enviado$/);
  await expect(page.locator("h1")).toHaveText(q.sent.title_with_name.replace("{nome}", CONTACT.name.split(" ")[0] ?? ""));
  const protocol = (await page.locator("[data-sent-protocol-value]").textContent())?.trim() ?? "";
  expect(protocol).toMatch(PROTOCOL_RE);

  expect(netlify.bodies).toHaveLength(1);
  expect(netlify.bodies[0]?.get("form-name")).toBe("briefing");
  expect(netlify.bodies[0]?.get("protocol")).toBe(protocol);
  expect(guard.strayPosts).toEqual([]);
});

test("(b) envio falhando: o WhatsApp de fallback abre o número publicado com o resumo", async ({ page }) => {
  const guard = await lockDown(page);
  const opened = await captureWindowOpen(page);
  const netlify = await stubNetlify(page, 500);
  const q = COPY.pt.quote;

  await page.goto("/orcamento?origem=e2e-producao");
  const number = await publishedNumber(page);
  const startedAt = await start(page);
  await answerAll(page, "pt");
  await fillContact(page, "pt");
  await waitMinFill(page, startedAt);
  await submit(page, "pt");

  const panel = wizardRoot(page).locator('[tabindex="-1"]').filter({ hasText: q.error.title });
  await expect(panel).toBeVisible({ timeout: 15_000 });
  expect(netlify.bodies).toHaveLength(3);
  const protocol = (await panel.locator("strong").first().textContent())?.trim() ?? "";
  expect(protocol).toMatch(PROTOCOL_RE);

  const wa = panel.getByRole("link", { name: q.error.whatsapp });
  await expect(wa).toHaveAttribute("href", `https://wa.me/${number}`);
  await wa.click();
  const [url] = await opened();
  expect(url).toMatch(new RegExp(`^https://wa\\.me/${number}\\?text=`));
  const text = new URL(url ?? "").searchParams.get("text") ?? "";
  expect(text).toContain(q.whatsapp_messages.failure_intro);
  expect(text).toContain(protocol);
  expect(guard.strayPosts).toEqual([]);
});
