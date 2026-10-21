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
 *  - Entrada com ?servico= (auditoria F03): "Começar as 6 perguntas" acima da
 *    dobra a 360×640 e 390×664, com o navegador no idioma da página; a linha
 *    de contexto vem depois do botão. Com o navegador em outro idioma, o aviso
 *    de idioma (F31) vem primeiro: aviso e H1 na 1ª tela, como na Home.
 *  - Resumo na ordem da auditoria F02: linha "Para:", fatores (na 1ª tela),
 *    pauta, preço, o próximo passo (nota do prazo e, no desktop, o CTA), os
 *    chips e o método compacto (as 4 etapas num <details> fechado). Com
 *    "nos próximos 3 meses" (F09), fator, pauta e nota próprios.
 *  - /es e /en: telefone sem "+" é inválido e não ganha a máscara brasileira;
 *    os exemplos são de fora do Brasil e o número internacional passa (F16).
 *  - Progresso anunciado no resumo e no contato (B012): a região role=status
 *    da ilha leva o rótulo do progresso ("Resumo", "Último passo: seu
 *    contato") junto com o título, e não só o título. A barra conta 8 passos
 *    (F21): o resumo é o 7º e o contato fica abaixo de 8.
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
    // No lugar da prova do QuoteProof: logo antes da promessa ("você vê o resumo…").
    inner.querySelector(".entry__promise")?.before(proof);
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

test.describe("entrada com ?servico=: 'Começar' acima da dobra no celular (F03)", () => {
  const sizes = [
    { width: 360, height: 640 },
    { width: 390, height: 664 },
  ];
  const BROWSER_LOCALE: Record<Locale, string> = { pt: "pt-BR", en: "en-US", es: "es-419" };
  for (const locale of ["pt", "en", "es"] as const) {
    test.describe(locale, () => {
      // Quem chega pelo anúncio lê o idioma da página: sem o aviso "também disponível em…" (F31).
      test.use({ locale: BROWSER_LOCALE[locale] });
      test(`${locale}: botão na 1ª tela e a linha de contexto depois dele`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== "mobile", "dobra do celular: só no projeto mobile");
        const q = COPY[locale].quote;
        for (const size of sizes) {
          await page.setViewportSize(size);
          for (const servico of ["aplicativos", "integracoes"]) {
            await page.goto(`${PATH[locale]}?servico=${servico}&origem=${servico}-hero`);
            const context = page.locator("[data-wizard-context]");
            await expect(context).toContainText(q.entry.context_service.split("{")[0]!.trim());
            const start = page.locator("[data-wizard-start]").first();
            const box = await start.boundingBox();
            expect(box, `${size.width}×${size.height} ${servico}`).not.toBeNull();
            expect(box!.y + box!.height, `${size.width}×${size.height} ${servico}: botão inteiro na 1ª tela`).toBeLessThanOrEqual(size.height);
            // A linha de contexto vem depois do botão (e do WhatsApp), nunca antes.
            expect(((await context.boundingBox())?.y ?? 0) > box!.y).toBe(true);
          }
        }
      });
    });
  }

  // Navegador em outro idioma (F31): o aviso de idioma vem antes de tudo, como na
  // Home (§2.8): aviso e H1 na 1ª tela; o "Começar" pode descer para a 2ª.
  test.describe("navegador em outro idioma", () => {
    test.use({ locale: "en-US" });
    test("pt a 360×640: aviso de idioma e H1 na 1ª tela", async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "mobile", "dobra do celular: só no projeto mobile");
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto(`${PATH.pt}?servico=aplicativos&origem=aplicativos-hero`);
      const suggestion = page.locator('.lang-suggest[data-lang-target="en"]');
      await expect(suggestion).toBeVisible();
      for (const target of [suggestion, page.locator("h1")]) {
        const box = await target.boundingBox();
        expect((box?.y ?? Number.POSITIVE_INFINITY) + (box?.height ?? 0)).toBeLessThanOrEqual(640);
      }
    });
  });
});

test.describe("resumo: o que é do visitante primeiro (F02, F09)", () => {
  for (const locale of ["pt", "en", "es"] as const) {
    test(`${locale}: Para → fatores → pauta → preço → próximo passo → respostas → método`, async ({ page }, testInfo) => {
      const q = COPY[locale].quote;
      const s = q.summary;
      await openWithDraft(page, locale, "resumo");
      const root = wizardRoot(page);
      const top = async (name: string) =>
        (await root.getByRole("heading", { level: 3, name, exact: true }).boundingBox())?.y ?? Number.NaN;
      const factors = await top(s.weighs_title);
      const topics = await top(s.deep_dive_title);
      const price = await top(s.price_title);
      const answers = await top(s.told_us_title);
      const path = await top(s.path_title);
      // Medido antes de abrir o <details> (a página rola com ele).
      const early = page.locator("[data-wizard-early-actions]");
      const earlyTop = (await early.boundingBox())?.y ?? Number.NaN;
      expect(factors).toBeLessThan(topics);
      expect(topics).toBeLessThan(price);
      expect(price).toBeLessThan(answers);
      expect(answers).toBeLessThan(path);
      // Os fatores começam na 1ª tela (antes: 2.237 px no desktop, 2.353 no Pixel 7).
      const viewport = page.viewportSize()!;
      expect(factors).toBeLessThan(viewport.height * 0.75);

      // "Para: tipo · prazo · faixa · Revisar respostas" logo abaixo da intro.
      const forLine = page.locator("[data-wizard-for-line]");
      await expect(forLine).toContainText(s.for_line.split("{")[0]!.trim());
      await expect(forLine).toContainText(q.steps.deadline.options.within_3_months);
      await expect(forLine.getByRole("button", { name: s.fix_answers, exact: true })).toBeVisible();

      // Prazo de 3 meses (F09): fator, pauta e nota próprios.
      await expect(root).toContainText(s.factors.factor_deadline_window);
      await expect(root).toContainText(s.topics.topic_deadline);
      await expect(root).toContainText(s.deadline_note_window);
      // D44: sem faixa publicada, o bloco de preço diz que Diagnóstico e Descoberta são gratuitos
      // e que a primeira etapa paga é o desenvolvimento, com preço fechado antes.
      await expect(root).toContainText(s.price_empty_2);

      // Chips abertos (nunca num <details> fechado); o método completo, sim, recolhido.
      await expect(root.getByRole("button", { name: s.edit_aria_label.replace("{rotulo}", q.steps.deadline.short_label) })).toBeVisible();
      const details = root.locator("details");
      await expect(details).toHaveCount(1);
      await expect(details).not.toHaveAttribute("open", /.*/);
      await expect(details.locator("summary")).toContainText(s.path_all_stages);
      // A etapa realçada, com a tag "Gratuita · se for necessária" (D44), fica à vista fora do <details>.
      const highlighted = root.locator('[aria-current="step"]').first();
      await expect(highlighted).toBeVisible();
      await expect(highlighted).toContainText(COPY[locale].shared.method_timeline.stages.discovery.tag);
      await details.locator("summary").click();
      await expect(details.locator("ol")).toBeVisible();

      if (testInfo.project.name !== "desktop") {
        // Mobile: a barra fixa já mostra o primário; o CTA do meio não existe para ninguém.
        await expect(early).toBeHidden();
        return;
      }
      // Desktop: o CTA logo depois do preço, antes das respostas; o do fim continua.
      await expect(early).toBeVisible();
      await expect(early.getByRole("link", { name: s.primary, exact: true })).toBeVisible();
      await expect(early).toContainText(s.below_primary);
      expect(earlyTop).toBeGreaterThan(price);
      expect(earlyTop).toBeLessThan(answers);
      await expect(page.locator("[data-wizard-actions]").getByRole("button", { name: s.primary, exact: true })).toHaveCount(1);
      await early.getByRole("link", { name: s.primary, exact: true }).click();
      await expect(page).toHaveURL(/etapa=contato/);
      await expect(wizardRoot(page).getByRole("heading", { level: 2, name: q.contact_form.title })).toBeVisible();
    });
  }

  test("sistema no ar: a etapa realçada é a sustentação; prazo de 3 a 6 meses não ganha nota", async ({ page }) => {
    const q = COPY.pt.quote;
    await openWithDraft(page, "pt", "resumo", {
      ...FULL,
      stage: "maintain_live_system",
      deadline: "between_3_and_6_months",
    });
    const root = wizardRoot(page);
    await expect(root.getByRole("heading", { level: 3, name: q.summary.path_title_live_variant, exact: true })).toBeVisible();
    await expect(root.locator('[aria-current="step"]').first()).toContainText(COPY.pt.shared.method_timeline.stages.support.name);
    await expect(root).not.toContainText(q.summary.deadline_note_window);
    await expect(root).not.toContainText(q.summary.deadline_note);
    await expect(root).not.toContainText(q.summary.factors.factor_deadline_window);
  });
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

  for (const [locale, local, international] of [
    ["en", "415 555 0134", "+1 415 555 0134"],
    ["es", "300 123 4567", "+57 300 123 4567"],
  ] as const) {
    test(`${locale}: exemplo de fora do Brasil, erro que ensina e número internacional aceito (F16)`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop", "regra de validação: um projeto basta");
      const netlify = await stubNetlify(page, 200);
      await openWithDraft(page, locale, "contato");
      const root = wizardRoot(page);
      const q = COPY[locale].quote.contact_form;
      const phone = root.locator('input[name="phone"]');
      await expect(phone).toHaveAttribute("placeholder", q.fields.phone.placeholder);
      expect(q.fields.phone.placeholder).not.toContain("+55");
      expect(q.fields.phone.error_invalid).not.toContain("+55");
      await root.getByRole("textbox", { name: q.fields.name.label, exact: true }).fill("Carla Prueba");
      await root.getByRole("textbox", { name: q.fields.email.label, exact: true }).fill("carla.prueba@example.com");
      await phone.fill(local);
      await root.getByRole("button", { name: q.submit, exact: true }).click();
      await expect(phone).toHaveAttribute("aria-invalid", "true");
      await expect(root).toContainText(q.fields.phone.error_invalid);
      expect(netlify.bodies).toHaveLength(0);
      await phone.fill(international);
      await expect(phone).toHaveValue(international);
      await expect(phone).not.toHaveAttribute("aria-invalid", "true");
    });
  }
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
      // A barra conta 8 passos (F21): o resumo é o 7º, com o mesmo texto.
      const bar = page.locator("[data-wizard-progress] [role='progressbar']");
      await expect(bar).toHaveAttribute("aria-valuetext", q.progress.summary_label);
      await expect(bar).toHaveAttribute("aria-valuemax", "8");
      await expect(bar).toHaveAttribute("aria-valuenow", "7");
      await wizardRoot(page).getByRole("button", { name: q.summary.primary, exact: true }).click();
      await expect(page).toHaveURL(/etapa=contato/);
      await expect(status).toContainText(q.progress.contact_label);
      await expect(status).toContainText(q.contact_form.title);
      // Contato perto do fim, sem chegar a 100%: o envio é que completa.
      const now = Number(await bar.getAttribute("aria-valuenow"));
      expect(now).toBeGreaterThan(7);
      expect(now).toBeLessThan(8);
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
