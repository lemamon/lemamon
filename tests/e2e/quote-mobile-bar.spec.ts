/**
 * Wizard no celular e em tela pequena (dono: conversion) — backlog B161, B165,
 * B193 e B270; BLUEPRINT §7.2, §7.4(f), §7.5, §11.
 *
 *  - Barra fixa: o primário ocupa ≥ 65% da largura útil, com 48px (uma linha),
 *    em todas as telas, a 320 e 375px, nos 3 idiomas. "Corrigir respostas"
 *    (resumo) não disputa a barra; a P3 não tem mais "Pular" (F22).
 *  - Resumo com um token sem quebra na data travante não alarga a página.
 *  - Tab até a última opção da P2: a opção focada não fica atrás da barra.
 *  - Telefone inválido no envio (toque no celular, clique no desktop): nenhum
 *    POST, a URL fica no contato, o foco vai para o telefone e a mensagem fica
 *    entre o header e a barra fixa.
 *  - Desktop (auditoria F04): a barra gruda no rodapé e o Continuar das P2–P5
 *    fica na tela a 1366×657 e 1280×800.
 *  - Erro e aviso na barra (F05): "Escolha uma opção" e "Você já marcou 3"
 *    aparecem na nota da barra, à vista; o contador da P3 fica no topo.
 *  - Duplo clique e toque duplo (F06, F21): o 2º clique logo depois da troca de
 *    tela não marca opção, não pula a P3 e não pinta erros no contato; envio
 *    sem nenhum campo tocado só leva ao "Nome".
 *  - Teclado aberto (F16): a barra some, mas a altura medida fica, para o
 *    campo trazido à tela não acabar atrás dela quando o teclado fecha.
 *
 * As telas abrem direto por ?etapa= com um rascunho gravado antes do load.
 */
import { readdirSync } from "node:fs";

import { expect, test, type Page } from "./support/consent";

import dono from "../../dados/dono.json" with { type: "json" };
import { COPY, DRAFT_KEY, expectStep, stubNetlify, waitEntryLock, wizardRoot } from "./support/wizard";

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

async function openWithDraft(page: Page, locale: Locale, step: number | "resumo" | "contato", answers: object = FULL) {
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

const primaryMetrics = (page: Page) =>
  page.evaluate(() => {
    const bar = document.querySelector<HTMLElement>("[data-wizard-actions]");
    // O primário fica no grupo (com a nota abaixo dele); "Voltar" é filho direto da barra.
    const button = bar?.querySelector<HTMLElement>(":scope > div > button");
    const r = button?.getBoundingClientRect();
    const gutter = bar ? parseFloat(getComputedStyle(bar).paddingLeft) : 0;
    const cw = document.documentElement.clientWidth;
    return {
      ratio: r ? r.width / (cw - 2 * gutter) : 0,
      height: Math.round(r?.height ?? 0),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: cw,
      labels: [...(bar?.querySelectorAll("button") ?? [])].filter((b) => b.offsetParent).map((b) => b.textContent?.trim()),
    };
  });

test.describe("barra fixa do mobile (B165, B161)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "medidas de tela pequena: só no projeto mobile");
  });

  for (const width of [320, 375]) {
    for (const locale of ["pt", "en", "es"] as const) {
      test(`${locale} ${width}px: primário ≥ 65% e numa linha em todas as telas`, async ({ page }) => {
        await page.setViewportSize({ width, height: 720 });
        const q = COPY[locale].quote;
        for (const step of [1, 2, 3, 4, 5, 6, "resumo", "contato"] as const) {
          await openWithDraft(page, locale, step);
          const m = await primaryMetrics(page);
          expect(m.ratio, `${step}: largura`).toBeGreaterThanOrEqual(0.65);
          expect(m.height, `${step}: uma linha (48px)`).toBe(48);
          expect(m.scrollWidth, `${step}: sem rolagem lateral`).toBe(m.clientWidth);
          // P3 sem o "Pular" solto (F22): Continuar sem marcar vale como pular.
          if (step === 3) expect(await page.locator("[data-wizard-root] form > button").count(), "3: sem 'Pular'").toBe(0);
          if (step === "resumo") expect(m.labels).toEqual([q.summary.primary]);
          if (step === "contato") expect(m.labels).toEqual([q.contact_form.submit]);
        }
      });
    }
  }

  test("data travante com URL longa não alarga o resumo a 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openWithDraft(page, "pt", "resumo", {
      ...FULL,
      deadline_reason: "Edital em www.prefeitura.florianopolis.sc.gov.br/licitacoes/2026",
    });
    await page.addStyleTag({ content: "html,body{overflow-x:visible !important}" });
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      iw: window.innerWidth,
    }));
    expect(m.sw).toBe(m.cw);
    expect(m.iw).toBe(320);
  });

  test("valores longos na linha 'Para:' do resumo não alargam a página a 320px (F02)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await openWithDraft(page, "es", "resumo", {
      ...FULL,
      stage: "maintain_live_system",
      build_type: ["ops_system", "client_platform", "integration"],
      system_pain: ["errors_instability"],
      deadline: "asap",
      budget: "not_sure",
    });
    await expect(page.locator("[data-wizard-for-line]")).toBeVisible();
    await page.addStyleTag({ content: "html,body{overflow-x:visible !important}" });
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(m.sw).toBe(m.cw);
  });

  test("Tab até a última opção da P2: a opção focada fica acima da barra (B193)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openWithDraft(page, "pt", 2, { stage: "problem_unclear" });
    const last = wizardRoot(page).locator('input[name="build_type"]').last();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      if (await last.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(last).toBeFocused();
    const { labelBottom, barTop } = await page.evaluate(() => ({
      labelBottom: document.activeElement?.closest("label")?.getBoundingClientRect().bottom ?? Infinity,
      barTop: document.querySelector("[data-wizard-actions]")?.getBoundingClientRect().top ?? 0,
    }));
    expect(labelBottom).toBeLessThanOrEqual(barTop);
  });
});

test.describe("telefone inválido no envio (B270)", () => {
  const sizes = [
    { width: 375, height: 667 },
    { width: 375, height: 812 },
  ];

  for (const size of sizes) {
    test(`toque a ${size.width}×${size.height}: 0 POST, foco no telefone e mensagem visível`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "mobile", "toque: só no projeto mobile");
      await page.setViewportSize(size);
      await checkInvalidPhone(page, "tap");
    });
  }

  test("clique de mouse no desktop: 0 POST e foco no telefone", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "mouse: só no projeto desktop");
    await checkInvalidPhone(page, "click");
  });
});

async function checkInvalidPhone(page: Page, how: "tap" | "click") {
  const netlify = await stubNetlify(page, 200);
  await openWithDraft(page, "pt", "contato");
  const root = wizardRoot(page);
  const f = COPY.pt.quote.contact_form.fields;
  await root.getByRole("textbox", { name: f.name.label, exact: true }).fill("Ana Teste");
  await root.getByRole("textbox", { name: f.email.label, exact: true }).fill("ana.teste@example.com");
  await root.locator('input[name="phone"]').fill("99999-9999");
  const submit = root.getByRole("button", { name: COPY.pt.quote.contact_form.submit, exact: true });
  if (how === "tap") await submit.tap();
  else await submit.click();

  const phone = root.locator('input[name="phone"]');
  await expect(phone).toBeFocused();
  await expect(phone).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(/etapa=contato/);
  expect(netlify.bodies).toHaveLength(0);
  // A rolagem até o bloco do campo pode ser suave (scroll-behavior): espera assentar.
  const box = () =>
    page.evaluate(() => {
      const error = document.querySelector('[id$="-phone-error"]')?.getBoundingClientRect();
      const bar = document.querySelector<HTMLElement>("[data-wizard-actions]");
      const pinned = bar && ["fixed", "sticky"].includes(getComputedStyle(bar).position);
      const barTop = bar && pinned ? Math.min(bar.getBoundingClientRect().top, window.innerHeight) : window.innerHeight;
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const top = error?.top ?? -1;
      const bottom = error?.bottom ?? Infinity;
      return bottom <= barTop && top >= headerBottom;
    });
  await expect.poll(box, { message: "mensagem de erro entre o header e a barra fixa" }).toBe(true);
}

test.describe("when_data com o dado real (B140, B149)", () => {
  test("sem depoimento/logos e sem cases: nada de prova vazia nem link para /cases", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "conteúdo estático: um projeto basta");
    // O E2E roda sem a camada fictícia (playwright.config.ts): vale o dados/dono.json real.
    // Quando o dono mandar depoimento, logos ou cases, este caso deixa de se aplicar.
    const hasProof = dono.depoimentos.length > 0 || dono.logos.length >= 4;
    const hasCases = ["pt", "en", "es"].some((lang) => {
      try {
        return readdirSync(new URL(`../../src/content/cases/${lang}/`, import.meta.url)).some((file) => /\.mdx?$/.test(file));
      } catch {
        return false;
      }
    });
    test.skip(hasProof || hasCases, "já há prova real: a ausência não se aplica");
    await page.goto(PATH.pt);
    await expect(page.locator("[data-quote-proof]")).toHaveCount(0);
    await page.goto("/orcamento/enviado");
    await expect(page.locator('main a[href="/cases"], main a[href^="/cases/"]')).toHaveCount(0);
  });
});

test.describe("desktop: Continuar à vista nas P2–P5 (F04)", () => {
  for (const size of [
    { width: 1366, height: 657 },
    { width: 1280, height: 800 },
  ]) {
    for (const locale of ["pt", "en", "es"] as const) {
      test(`${locale} ${size.width}×${size.height}: a barra gruda no rodapé`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== "desktop", "desktop: só no projeto desktop");
        await page.setViewportSize(size);
        for (const step of [2, 3, 4, 5] as const) {
          await openWithDraft(page, locale, step);
          const button = page.locator("[data-wizard-actions]").getByRole("button", { name: COPY[locale].quote.nav.continue, exact: true });
          const box = await button.boundingBox();
          expect(box!.y + box!.height, `P${step}`).toBeLessThanOrEqual(size.height);
        }
      });
    }
  }
});

test.describe("celular: erro e aviso na barra fixa, contador no topo (F05)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "barra fixa: só no projeto mobile");
  });

  for (const size of [
    { width: 390, height: 664 },
    { width: 360, height: 640 },
  ]) {
    test(`${size.width}×${size.height}: "Escolha uma opção" na barra, à vista`, async ({ page }) => {
      await page.setViewportSize(size);
      const q = COPY.pt.quote;
      await openWithDraft(page, "pt", 1, {});
      await page.locator("[data-wizard-actions]").getByRole("button", { name: q.nav.continue, exact: true }).tap();
      const error = page.locator('[data-wizard-bar-note][data-tone="error"]');
      await expect(error).toHaveText(q.validation.select_one);
      const errorBox = await error.boundingBox();
      expect(errorBox!.y + errorBox!.height).toBeLessThanOrEqual(size.height);
      await expect(wizardRoot(page).locator('input[name="stage"]').first()).toHaveAttribute("aria-invalid", "true");
      // O leitor de tela ouve o erro pela região role=status, uma vez.
      await expect(wizardRoot(page).locator('[role="status"]').first()).toHaveText(q.validation.select_one);
    });

    test(`${size.width}×${size.height}: "Você já marcou 3" na barra e o contador no topo`, async ({ page }) => {
      await page.setViewportSize(size);
      const q = COPY.pt.quote;
      await openWithDraft(page, "pt", 3, {
        stage: "problem_unclear",
        build_type: ["ops_system"],
        pain: ["manual_process", "double_entry", "disconnected_tools"],
      });
      const counter = wizardRoot(page).getByText(q.nav.selected_count_of_max.replace("{n}", "3"), { exact: true });
      const firstOption = wizardRoot(page).locator('input[name="pain"]').first().locator("xpath=ancestor::label");
      expect((await counter.boundingBox())!.y).toBeLessThan((await firstOption.boundingBox())!.y);
      await wizardRoot(page).locator('input[name="pain"][value="late_numbers"]').tap({ force: true });
      const notice = page.locator('[data-wizard-bar-note][data-tone="notice"]');
      await expect(notice).toHaveText(q.validation.max_three);
      const noticeBox = await notice.boundingBox();
      expect(noticeBox!.y + noticeBox!.height).toBeLessThanOrEqual(size.height);
      await expect(wizardRoot(page).locator('input[name="pain"]:checked')).toHaveCount(3);
    });
  }
});

/** Dois cliques de mouse no mesmo ponto, com `gap` ms entre eles (o duplo clique de quem não é técnico). */
async function doubleClickAt(page: Page, x: number, y: number, gap: number) {
  await page.mouse.click(x, y);
  await page.waitForTimeout(gap);
  await page.mouse.click(x, y);
}

/** Dois toques no mesmo ponto, com `gap` ms entre eles. */
async function doubleTapAt(page: Page, x: number, y: number, gap: number) {
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(gap);
  await page.touchscreen.tap(x, y);
}

const center = async (page: Page, selector: string) => {
  const box = (await page.locator(selector).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

const draftAnswers = (page: Page) =>
  page.evaluate((key) => (JSON.parse(localStorage.getItem(key) ?? "{}") as { answers?: Record<string, unknown> }).answers ?? {}, DRAFT_KEY);

test.describe("duplo clique e toque duplo (F06, F21)", () => {
  test("desktop: 2 cliques a 130 ms no Continuar da P1 não marcam nada na P2", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "mouse: só no projeto desktop");
    await openWithDraft(page, "pt", 1, {});
    const root = wizardRoot(page);
    await root.locator('input[name="stage"][value="problem_unclear"]').check();
    const { x, y } = await center(page, "[data-wizard-actions] button[type=submit]");
    await doubleClickAt(page, x, y, 130);
    await expectStep(page, 2);
    await expect(root.locator('input[name="build_type"]:checked')).toHaveCount(0);
    await expect(root.locator('input[aria-invalid="true"]')).toHaveCount(0);
    expect((await draftAnswers(page)).build_type).toBeUndefined();
  });

  test("celular: 2 toques a 150 ms no Continuar da P2 vão para a P3, sem pular", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "toque: só no projeto mobile");
    await openWithDraft(page, "pt", 2, { stage: "problem_unclear", build_type: ["ops_system"] });
    const { x, y } = await center(page, "[data-wizard-actions] button[type=submit]");
    await doubleTapAt(page, x, y, 150);
    await expectStep(page, 3);
    await expect(page).toHaveURL(/etapa=3/);
    // Sem a trava, o 2º toque caía no Continuar da P3 (opcional) e ia para a P4.
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/etapa=3/);
  });

  for (const gap of [80, 300]) {
    test(`celular: toque duplo a ${gap} ms no CTA do resumo abre o contato sem erros`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "mobile", "toque: só no projeto mobile");
      const q = COPY.pt.quote;
      await openWithDraft(page, "pt", "resumo");
      const { x, y } = await center(page, "[data-wizard-actions] button");
      await doubleTapAt(page, x, y, gap);
      const root = wizardRoot(page);
      await expect(root.getByRole("heading", { level: 2, name: q.contact_form.title })).toBeVisible();
      await page.waitForTimeout(200);
      await expect(root.locator('[aria-invalid="true"]')).toHaveCount(0);
      await expect(root).not.toContainText(q.contact_form.fields.name.error_required);
    });
  }

  test("envio sem nenhum campo tocado só leva ao Nome, sem pintar erros", async ({ page }) => {
    const q = COPY.pt.quote;
    const netlify = await stubNetlify(page, 200);
    await openWithDraft(page, "pt", "resumo");
    const root = wizardRoot(page);
    await root.getByRole("button", { name: q.summary.primary, exact: true }).click();
    await expect(root.getByRole("heading", { level: 2, name: q.contact_form.title })).toBeVisible();
    await waitEntryLock(page, "contato");
    await root.getByRole("button", { name: q.contact_form.submit, exact: true }).click();
    await expect(root.getByRole("textbox", { name: q.contact_form.fields.name.label, exact: true })).toBeFocused();
    await expect(root.locator('[aria-invalid="true"]')).toHaveCount(0);
    expect(netlify.bodies).toHaveLength(0);
    // Com algo digitado, o envio valida como sempre.
    await root.getByRole("textbox", { name: q.contact_form.fields.name.label, exact: true }).fill("Ana Teste");
    await root.getByRole("button", { name: q.contact_form.submit, exact: true }).click();
    await expect(root.getByRole("textbox", { name: q.contact_form.fields.email.label, exact: true })).toHaveAttribute("aria-invalid", "true");
    expect(netlify.bodies).toHaveLength(0);
  });
});

test.describe("teclado aberto no contato (F16)", () => {
  test("a barra some, mas a altura medida (scroll-padding) fica", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "teclado virtual: só no projeto mobile");
    await openWithDraft(page, "pt", "contato");
    const barHeight = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--wizard-bar-height").trim());
    const before = await barHeight();
    expect(parseInt(before, 10)).toBeGreaterThan(40);
    // Simula o teclado virtual: o visualViewport encolhe 300 px.
    await page.evaluate(() => {
      const viewport = window.visualViewport!;
      Object.defineProperty(viewport, "height", { configurable: true, get: () => window.innerHeight - 300 });
      viewport.dispatchEvent(new Event("resize"));
    });
    await expect(page.locator("[data-wizard-actions]")).toHaveAttribute("data-keyboard", "open");
    await expect(page.locator("[data-wizard-actions]")).toBeHidden();
    await page.waitForTimeout(200);
    expect(await barHeight()).toBe(before);
  });
});
