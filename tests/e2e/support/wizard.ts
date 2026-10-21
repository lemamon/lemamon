/**
 * Apoio dos E2E do wizard (integrador). Não é spec (o Playwright só roda
 * *.spec.ts). Textos vêm do i18n: nada de copy escrita à mão nos testes.
 */
import { expect, type Page, type Route } from "@playwright/test";

import dono from "../../../dados/dono.json" with { type: "json" };
import en from "../../../src/i18n/en.json" with { type: "json" };
import es from "../../../src/i18n/es.json" with { type: "json" };
import pt from "../../../src/i18n/pt.json" with { type: "json" };
import type { Locale } from "../../../src/i18n/locales";
import { CONTACT_ENTRY_LOCK_MS, ENTRY_CLICK_LOCK_MS } from "../../../src/islands/wizard/model";
import { MIN_FILL_MS, phoneNeedsCountryCode } from "../../../src/lib/forms";

export const COPY = { pt, en, es } as const satisfies Record<Locale, typeof pt>;

/** Rótulo de uma faixa da P5, como está em dados/dono.json › qualificacao (decisão do dono). */
export function tierLabel(locale: Locale, id: string): string {
  const tier = dono.qualificacao.faixas.find((item) => item.id === id);
  if (!tier) throw new Error(`faixa ${id} não existe em dados/dono.json › qualificacao.faixas`);
  return tier.rotulo[locale];
}

/** Número de teste do build de E2E (playwright.config.ts). */
export const E2E_WHATSAPP_NUMBER = "5548900000000";

export const DRAFT_KEY = "lemamon:orcamento:v2";
export const PROTOCOL_RE = /^LEM-\d{8}-[A-Z0-9]{4}$/;

/**
 * Uma resposta por pergunta, nesta ordem (§7.3). A P5 está no modo COM faixas
 * (dados/dono.json › qualificacao, decisão do dono): tier_2 é a 1ª faixa a
 * partir do corte de MQL.
 */
export interface Path {
  stage: string;
  build_type: string[];
  pain: string[];
  deadline: string;
  budget: string;
  role: string;
}

export const DEFAULT_PATH: Path = {
  stage: "problem_unclear",
  build_type: ["ops_system"],
  pain: ["manual_process"],
  deadline: "within_3_months",
  budget: "tier_2",
  role: "i_decide",
};

export const wizardRoot = (page: Page) => page.locator("[data-wizard-root]");

/**
 * Trava de entrada de tela (F06/F21): um clique de ponteiro logo depois de
 * trocar de tela é tratado como o 2º de um duplo clique e ignorado. O E2E
 * clica rápido como um robô: depois de cada troca de tela, espera a janela.
 */
export async function waitEntryLock(page: Page, screen: "question" | "contato" = "question"): Promise<void> {
  await page.waitForTimeout((screen === "contato" ? CONTACT_ENTRY_LOCK_MS : ENTRY_CLICK_LOCK_MS) + 50);
}

/** A pergunta N está na tela (e a trava de entrada já passou: o próximo clique conta). */
export async function expectStep(page: Page, n: number): Promise<void> {
  await expect(page.locator("[data-wizard-progress] [role='progressbar']")).toHaveAttribute("aria-valuenow", String(n));
  await waitEntryLock(page);
}

export async function start(page: Page): Promise<number> {
  await page.locator("[data-wizard-start]").first().click();
  await expectStep(page, 1);
  return Date.now();
}

export async function continueStep(page: Page, locale: Locale, last = false): Promise<void> {
  const nav = COPY[locale].quote.nav;
  await wizardRoot(page)
    .getByRole("button", { name: last ? nav.continue_to_summary : nav.continue, exact: true })
    .click();
}

/** Responde as 6 perguntas e chega ao resumo. */
export async function answerAll(page: Page, locale: Locale, path: Path = DEFAULT_PATH): Promise<void> {
  const root = wizardRoot(page);
  await root.locator(`input[name="stage"][value="${path.stage}"]`).check();
  await continueStep(page, locale);
  await expectStep(page, 2);
  for (const id of path.build_type) await root.locator(`input[name="build_type"][value="${id}"]`).check();
  await continueStep(page, locale);
  await expectStep(page, 3);
  for (const id of path.pain) await root.locator(`input[value="${id}"]`).check();
  await continueStep(page, locale);
  await expectStep(page, 4);
  await root.locator(`input[name="deadline"][value="${path.deadline}"]`).check();
  await continueStep(page, locale);
  await expectStep(page, 5);
  await root.locator(`input[name="budget"][value="${path.budget}"]`).check();
  await continueStep(page, locale);
  await expectStep(page, 6);
  await root.locator(`input[name="role"][value="${path.role}"]`).check();
  await continueStep(page, locale, true);
  await expect(root.getByRole("heading", { level: 2, name: COPY[locale].quote.summary.title })).toBeVisible();
  await waitEntryLock(page);
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export const CONTACT: Contact = { name: "Ana Teste", email: "ana.teste@example.com", phone: "48999998888" };

/**
 * O telefone no formato que o idioma aceita: em /en e /es o número só vale com
 * "+" e o código do país (lib/forms phoneNeedsCountryCode), então o mesmo
 * celular de teste vai como "+55 48999998888".
 */
export function phoneFor(locale: Locale, contact: Contact = CONTACT): string {
  const phone = contact.phone.trim();
  return phoneNeedsCountryCode(locale) && !phone.startsWith("+") ? `+55 ${phone}` : phone;
}

/** Resumo → contato → preenche (sem enviar). */
export async function fillContact(page: Page, locale: Locale, contact: Contact = CONTACT): Promise<void> {
  const root = wizardRoot(page);
  const q = COPY[locale].quote;
  await root.getByRole("button", { name: q.summary.primary, exact: true }).click();
  await expect(root.getByRole("heading", { level: 2, name: q.contact_form.title })).toBeVisible();
  await waitEntryLock(page, "contato");
  await root.getByRole("textbox", { name: q.contact_form.fields.name.label, exact: true }).fill(contact.name);
  await root.getByRole("textbox", { name: q.contact_form.fields.email.label, exact: true }).fill(contact.email);
  await root.locator('input[name="phone"]').fill(phoneFor(locale, contact));
}

/** O form só aceita envio depois de MIN_FILL_MS desde o "Começar" (honeypot de tempo, B269). */
export async function waitMinFill(page: Page, startedAt: number): Promise<void> {
  const left = MIN_FILL_MS + 300 - (Date.now() - startedAt);
  if (left > 0) await page.waitForTimeout(left);
}

export async function submit(page: Page, locale: Locale): Promise<void> {
  await wizardRoot(page)
    .getByRole("button", { name: COPY[locale].quote.contact_form.submit, exact: true })
    .click();
}

export interface NetlifyStub {
  bodies: URLSearchParams[];
  setStatus: (status: number) => void;
}

/**
 * Intercepta o POST do Netlify Forms (o `astro preview` não tem Netlify).
 * Só o POST para "/" é atendido aqui; navegação GET passa direto.
 */
export async function stubNetlify(page: Page, status = 200): Promise<NetlifyStub> {
  const bodies: URLSearchParams[] = [];
  let current = status;
  await page.route(
    (url) => url.pathname === "/",
    async (route: Route) => {
      const request = route.request();
      if (request.method() !== "POST") return route.continue();
      bodies.push(new URLSearchParams(request.postData() ?? ""));
      return route.fulfill({ status: current, contentType: "text/html", body: current < 400 ? "ok" : "erro" });
    },
  );
  return { bodies, setStatus: (next) => (current = next) };
}

/** Guarda as URLs abertas por window.open (o WhatsApp com texto livre abre por JS, §10.3). */
export async function captureWindowOpen(page: Page): Promise<() => Promise<string[]>> {
  await page.addInitScript(() => {
    const opened: string[] = [];
    (window as unknown as { __opened: string[] }).__opened = opened;
    window.open = ((url?: string | URL) => {
      opened.push(String(url ?? ""));
      return null;
    }) as typeof window.open;
  });
  return () => page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
}
