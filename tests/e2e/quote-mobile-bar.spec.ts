/**
 * Wizard no celular e em tela pequena (dono: conversion) — backlog B161, B165,
 * B193 e B270; BLUEPRINT §7.2, §7.4(f), §7.5, §11.
 *
 *  - Barra fixa: o primário ocupa ≥ 65% da largura útil, com 48px (uma linha),
 *    em todas as telas, a 320 e 375px, nos 3 idiomas. "Pular" (P3) e
 *    "Corrigir respostas" (resumo) não disputam a barra.
 *  - Resumo com um token sem quebra na data travante não alarga a página.
 *  - Tab até a última opção da P2: a opção focada não fica atrás da barra.
 *  - Telefone inválido no envio (toque no celular, clique no desktop): nenhum
 *    POST, a URL fica no contato, o foco vai para o telefone e a mensagem fica
 *    entre o header e a barra fixa.
 *
 * As telas abrem direto por ?etapa= com um rascunho gravado antes do load.
 */
import { readdirSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

import dono from "../../dados/dono.json" with { type: "json" };
import { COPY, DRAFT_KEY, stubNetlify, wizardRoot } from "./support/wizard";

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
          if (step === 3) expect(m.labels).not.toContain(q.nav.skip);
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
      const barTop = bar && getComputedStyle(bar).position === "fixed" ? bar.getBoundingClientRect().top : window.innerHeight;
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
