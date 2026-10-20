/**
 * Wizard: modo foco, ação do resumo no desktop e telefone por idioma (dono:
 * conversion) — backlog B140, painel comercial e native_es.
 *
 *  - Modo foco (B140): depois de "Começar", nada da entrada aparece além do H1
 *    oculto, INCLUSIVE um filho de .entry__inner que vem de outro componente (a
 *    prova do QuoteProof tem outro data-astro-cid; a regra escopada não o
 *    pegava e o depoimento ficava acima das perguntas e duas vezes no
 *    contato). O E2E roda com o dado real, sem depoimento: o caso é provado
 *    com um elemento de outro escopo injetado no lugar da prova. Com prova
 *    real, conta exatamente 1 no contato (a do slot contactProof).
 *  - 375×812: a legend da P1 fica acima de 200px.
 *  - Resumo no desktop: a ação (primário + nota + WhatsApp) aparece logo
 *    abaixo de "Suas respostas", acima da dobra de quem rola pouco; o bloco do
 *    fim continua. No mobile ela não existe (a barra fixa já leva o primário).
 *  - /es e /en: telefone sem "+" é inválido e não ganha a máscara brasileira.
 *  - Progresso anunciado no resumo e no contato (B012): a região role=status
 *    da ilha leva o rótulo do progresso ("Resumo", "Último passo: seu
 *    contato") junto com o título, e não só o título.
 *  - Cases do mesmo tipo no resumo (B379): com a camada fictícia (2 cases:
 *    fretes = web_systems + mobile_apps; vistorias = mobile_apps +
 *    integrations), o caminho ops_system mostra 1 card (o de fretes) entre "O
 *    que influencia" e "E o preço?", o caminho mvp não mostra nada, e o clique
 *    leva ao case na mesma aba com cta_click {cta_id: case, origem:
 *    wizard_result}. No build do E2E (dado real, sem cases hoje) o resumo não
 *    muda. Para rodar com a camada: um `astro dev` com PUBLIC_DADOS_FICTICIOS=true
 *    numa porta própria e E2E_NETLIFY_URL=http://localhost:<porta>. O evento
 *    só é conferido onde o track() escreve no console (dev); no build sem GA4
 *    ele é no-op.
 */
import { existsSync, readdirSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

import { COPY, DRAFT_KEY, stubNetlify, waitMinFill, wizardRoot } from "./support/wizard";

type Locale = "pt" | "en" | "es";
const PATH: Record<Locale, string> = { pt: "/orcamento", en: "/en/quote", es: "/es/cotizacion" };

const FULL = {
  stage: "problem_unclear",
  build_type: ["ops_system"],
  pain: ["manual_process"],
  deadline: "within_3_months",
  budget: "tier_2",
  budget_set: "tiers",
  role: "i_decide",
};

async function openWithDraft(page: Page, locale: Locale, step: number | "resumo" | "contato", answers: typeof FULL = FULL) {
  const draft = { v: 2, savedAt: Date.now(), startedAt: Date.now() - 60_000, step, lang: locale, answers, attribution: {} };
  await page.addInitScript(
    ([key, value]) => {
      try {
        if (!sessionStorage.getItem("__seeded")) {
          localStorage.setItem(key, value);
          sessionStorage.setItem("__seeded", "1");
        }
      } catch {
        // sem storage: o teste falha adiante, com mensagem clara
      }
    },
    [DRAFT_KEY, JSON.stringify(draft)] as const,
  );
  await page.goto(`${PATH[locale]}?etapa=${step}`);
  await expect(page.locator("[data-wizard-actions]")).toBeVisible();
}

/** Um filho de .entry__inner com OUTRO escopo do Astro, no lugar da prova (como o QuoteProof). */
async function injectForeignProof(page: Page): Promise<void> {
  await page.evaluate(() => {
    const inner = document.querySelector("#quote-title")?.parentElement;
    if (!inner) throw new Error(".entry__inner não encontrado");
    const proof = document.createElement("div");
    proof.setAttribute("data-quote-proof", "e2e-foreign");
    proof.setAttribute("data-astro-cid-e2eproof", "");
    proof.textContent = "Prova de outro componente";
    proof.style.minHeight = "200px";
    inner.querySelector("[data-wizard-context]")?.before(proof);
  });
}

const proofCount = (page: Page) =>
  page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>("[data-quote-proof]")].filter(
        (element) => element.offsetParent !== null && element.getBoundingClientRect().height > 0,
      ).length,
  );

test.describe("modo foco esconde a entrada inteira (B140)", () => {
  test("depois de 'Começar', nenhum filho da entrada aparece, nem o de outro componente", async ({ page }) => {
    await page.goto(PATH.pt);
    await injectForeignProof(page);
    await expect(page.locator('[data-quote-proof="e2e-foreign"]')).toBeVisible();
    await page.locator("[data-wizard-start]").first().click();
    await expect(page.locator("html")).toHaveAttribute("data-wizard-mode", "focus");
    await expect(page.locator('[data-quote-proof="e2e-foreign"]')).toBeHidden();
    for (const proof of await page.locator('[data-quote-proof="entry"]').all()) await expect(proof).toBeHidden();
    const intro = await page.locator("[data-wizard-intro]").boundingBox();
    expect(intro?.height ?? 0, "a casca estática não ocupa espaço no modo foco").toBeLessThanOrEqual(1);
    // O H1 continua no DOM para leitor de tela.
    await expect(page.locator("h1#quote-title")).toHaveCount(1);
  });

  test("375×812: a legend da P1 fica acima de 200px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PATH.pt);
    await injectForeignProof(page);
    await page.locator("[data-wizard-start]").first().click();
    const legend = wizardRoot(page).locator("legend").first();
    await expect(legend).toBeVisible();
    const box = await legend.boundingBox();
    expect(box?.y ?? Infinity).toBeLessThan(200);
  });

  test("contato e erro de envio: no máximo 1 prova visível (a do slot, abaixo do envio)", async ({ page }) => {
    await stubNetlify(page, 500);
    const startedAt = Date.now();
    await openWithDraft(page, "pt", "contato");
    const expected = (await page.locator('[data-quote-proof="contact"]').count()) > 0 ? 1 : 0;
    expect(await proofCount(page)).toBe(expected);
    const root = wizardRoot(page);
    const f = COPY.pt.quote.contact_form.fields;
    await root.getByRole("textbox", { name: f.name.label, exact: true }).fill("Ana Teste");
    await root.getByRole("textbox", { name: f.email.label, exact: true }).fill("ana.teste@example.com");
    await root.locator('input[name="phone"]').fill("48999998888");
    await waitMinFill(page, startedAt);
    await root.getByRole("button", { name: COPY.pt.quote.contact_form.submit, exact: true }).click();
    const panel = root.locator('[tabindex="-1"]').filter({ hasText: COPY.pt.quote.error.title });
    await expect(panel).toBeVisible({ timeout: 15_000 });
    expect(await proofCount(page)).toBe(expected);
  });
});

test.describe("resumo: ação logo abaixo de 'Suas respostas' no desktop (painel comercial)", () => {
  for (const locale of ["pt", "en", "es"] as const) {
    test(`${locale}: primário + nota no topo do resumo, sem perder o bloco do fim`, async ({ page }, testInfo) => {
      const q = COPY[locale].quote;
      await openWithDraft(page, locale, "resumo");
      const early = page.locator("[data-wizard-early-actions]");
      if (testInfo.project.name !== "desktop") {
        // Mobile: a barra fixa já mostra o primário; o bloco não existe para ninguém.
        await expect(early).toBeHidden();
        return;
      }
      await expect(early).toBeVisible();
      await expect(early.getByRole("link", { name: q.summary.primary, exact: true })).toBeVisible();
      await expect(early).toContainText(q.summary.below_primary);
      // Logo abaixo das respostas: antes do bloco "O caminho…" e perto da dobra.
      const earlyTop = (await early.boundingBox())?.y ?? Infinity;
      const pathTitle = wizardRoot(page).getByRole("heading", { level: 3 }).nth(1);
      expect(earlyTop).toBeLessThan((await pathTitle.boundingBox())?.y ?? 0);
      expect(earlyTop).toBeLessThan(1000);
      // O bloco do fim continua (o primário da barra).
      await expect(page.locator("[data-wizard-actions]").getByRole("button", { name: q.summary.primary, exact: true })).toHaveCount(1);
      await early.getByRole("link", { name: q.summary.primary, exact: true }).click();
      await expect(page).toHaveURL(/etapa=contato/);
      await expect(wizardRoot(page).getByRole("heading", { level: 2, name: q.contact_form.title })).toBeVisible();
    });
  }
});

test.describe("telefone em /es e /en: sem + e código do país é inválido (native_es)", () => {
  test("es: celular do México sem + não vira (55) … e o envio não acontece", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "regra de validação: um projeto basta");
    const netlify = await stubNetlify(page, 200);
    await openWithDraft(page, "es", "contato");
    const root = wizardRoot(page);
    const q = COPY.es.quote.contact_form;
    await root.getByRole("textbox", { name: q.fields.name.label, exact: true }).fill("Carla Prueba");
    await root.getByRole("textbox", { name: q.fields.email.label, exact: true }).fill("carla.prueba@example.com");
    const phone = root.locator('input[name="phone"]');
    await phone.fill("5512345678");
    await expect(phone).toHaveValue("5512345678");
    await root.getByRole("button", { name: q.submit, exact: true }).click();
    await expect(phone).toBeFocused();
    await expect(phone).toHaveAttribute("aria-invalid", "true");
    await expect(root).toContainText(q.fields.phone.error_invalid);
    expect(netlify.bodies).toHaveLength(0);
    await phone.fill("+52 55 1234 5678");
    await expect(phone).toHaveValue("+52 55 1234 5678");
    await expect(phone).not.toHaveAttribute("aria-invalid", "true");
  });
});

test.describe("progresso anunciado no resumo e no contato (B012)", () => {
  for (const locale of ["pt", "en", "es"] as const) {
    test(`${locale}: role=status leva o rótulo do progresso`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "anúncio do leitor de tela: um projeto basta");
      const q = COPY[locale].quote;
      const status = wizardRoot(page).locator('[role="status"]').first();
      await openWithDraft(page, locale, "resumo");
      await expect(status).toContainText(q.progress.summary_label);
      await expect(status).toContainText(q.summary.title);
      // A barra de progresso continua cheia e com o mesmo texto.
      await expect(page.locator("[data-wizard-progress] [role='progressbar']")).toHaveAttribute("aria-valuetext", q.progress.summary_label);
      await wizardRoot(page).getByRole("button", { name: q.summary.primary, exact: true }).click();
      await expect(page).toHaveURL(/etapa=contato/);
      await expect(status).toContainText(q.progress.contact_label);
      await expect(status).toContainText(q.contact_form.title);
    });
  }
});

/* ------------------------------------------------------------------ *
 * Cases do mesmo tipo no resumo (B379)
 * ------------------------------------------------------------------ */

const EVENTS_KEY = "__e2e_analytics";

interface RecordedEvent {
  name: string;
  params: Record<string, unknown>;
}

/**
 * Guarda os eventos do track() (no dev, console.debug "[analytics] nome",
 * params) no sessionStorage, que sobrevive à navegação na mesma aba. No build
 * (sem DEV), a lista fica vazia.
 */
async function recordAnalytics(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    const original = console.debug.bind(console);
    console.debug = (...args: unknown[]) => {
      const [label, params] = args;
      if (typeof label === "string" && label.startsWith("[analytics] ")) {
        try {
          const list = JSON.parse(sessionStorage.getItem(key) ?? "[]") as unknown[];
          list.push({ name: label.slice("[analytics] ".length), params: params ?? {} });
          sessionStorage.setItem(key, JSON.stringify(list));
        } catch {
          // sem storage: o evento não é conferido
        }
      }
      original(...args);
    };
  }, EVENTS_KEY);
}

const readEvents = (page: Page): Promise<RecordedEvent[]> =>
  page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? "[]") as RecordedEvent[], EVENTS_KEY);

/** A página está com a camada de dados fictícios (faixa "Dados fictícios — não publicar"). */
const isFictitious = async (page: Page) => (await page.locator("[data-dados-ficticios]").count()) > 0;

/** Cases reais no repositório (src/content/cases/pt): sem eles, o build do E2E não tem cases. */
function realCaseFiles(): number {
  const dir = "src/content/cases/pt";
  return existsSync(dir) ? readdirSync(dir).filter((file) => /\.mdx?$/.test(file)).length : 0;
}

test.describe("resumo: cases do mesmo tipo que o pedido (B379)", () => {
  test("ops_system: 1 card (fretes) antes de 'E o preço?', e o clique leva ao case com cta_click wizard_result", async ({ page }) => {
    const q = COPY.pt.quote;
    await recordAnalytics(page);
    await openWithDraft(page, "pt", "resumo");
    const root = wizardRoot(page);
    await expect(root.getByRole("heading", { level: 2, name: q.summary.title })).toBeVisible();
    const block = page.locator("[data-wizard-summary-cases]");

    if (!(await isFictitious(page))) {
      test.skip(realCaseFiles() > 0, "com cases reais, a escolha é coberta por casesForAnswers (wizard-model.test.ts)");
      // Build sem cases (produção hoje): o resumo não muda.
      await expect(block).toHaveCount(0);
      return;
    }

    await expect(block).toBeVisible();
    const cards = block.getByRole("link");
    await expect(cards).toHaveCount(1);
    // Título no singular com 1 card (quote.summary.cases_title_one, ou o do pós-envio até a chave existir).
    const titleOne = (q.summary as Record<string, unknown>).cases_title_one ?? q.sent.meanwhile.cases_title_one;
    await expect(block.getByRole("heading", { level: 3 })).toHaveText(String(titleOne));
    const card = cards.first();
    await expect(card).toContainText("Sistema de fretes");
    await expect(card).toContainText(COPY.pt.shared.cta.read_case);
    await expect(card).toHaveAttribute("href", "/cases/exemplo-sistema-de-fretes");
    await expect(card).not.toHaveAttribute("target", /.+/);

    // Entre "O que influencia prazo e preço" e "E o preço?".
    const top = async (name: string) => (await root.getByRole("heading", { level: 3, name, exact: true }).boundingBox())?.y ?? NaN;
    const blockTop = (await block.boundingBox())?.y ?? NaN;
    expect(blockTop).toBeGreaterThan(await top(q.summary.weighs_title));
    expect(blockTop).toBeLessThan(await top(q.summary.price_title));

    const devLog = (await readEvents(page)).some((event) => event.name === "wizard_summary_view");
    await card.click();
    await expect(page).toHaveURL(/\/cases\/exemplo-sistema-de-fretes\/?$/);
    if (devLog) {
      expect(await readEvents(page)).toContainEqual({ name: "cta_click", params: { cta_id: "case", origem: "wizard_result" } });
    }
  });

  test("mvp: sem case compatível, nem título nem bloco", async ({ page }) => {
    await openWithDraft(page, "pt", "resumo", { ...FULL, build_type: ["mvp"] });
    const q = COPY.pt.quote;
    await expect(wizardRoot(page).getByRole("heading", { level: 3, name: q.summary.price_title, exact: true })).toBeVisible();
    await expect(page.locator("[data-wizard-summary-cases]")).toHaveCount(0);
  });
});
