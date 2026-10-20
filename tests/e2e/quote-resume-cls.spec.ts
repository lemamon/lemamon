/**
 * Retomada sem layout shift (dono: conversion) — backlog B238.
 *
 * Quem volta com um rascunho (o "Continuar meu pedido" leva a ?etapa=N) via a
 * página pular duas vezes: o banner de retomada nascia na hidratação e
 * empurrava o H1 ~300px para baixo (/orcamento), e, com ?etapa=, o SSR só
 * mostrava "Carregando…" com o rodapé logo abaixo, que a pergunta empurrava
 * depois (CLS 0,17–0,28 medido no Pixel 7). Agora a casca reserva o espaço do
 * banner antes da pintura (html[data-draft-step] + cópia invisível do banner
 * no QuoteEntry) e a área do wizard ocupa a tela no modo foco desde o SSR.
 *
 * Mede a soma dos layout-shift sem input recente, do carregamento até a ilha
 * pronta (+ uma folga), com um rascunho válido gravado antes da página.
 */
import { expect, test } from "@playwright/test";

import { DRAFT_KEY } from "./support/wizard";

const FULL = {
  stage: "problem_unclear",
  build_type: ["ops_system"],
  pain: ["manual_process"],
  deadline: "within_3_months",
  budget: "tier_2",
  budget_set: "tiers",
  role: "i_decide",
};

const CASES: { path: string; lang: "pt" | "en" | "es" }[] = [
  { path: "/orcamento", lang: "pt" },
  { path: "/orcamento?etapa=3", lang: "pt" },
  { path: "/en/quote?etapa=3", lang: "en" },
  { path: "/es/cotizacion", lang: "es" },
];

/** Teto do critério de aceite (bom = 0,1 no Core Web Vitals; aqui bem abaixo). */
const MAX_CLS = 0.02;

for (const { path, lang } of CASES) {
  test(`${path} com rascunho: CLS ≤ ${MAX_CLS} até a ilha ficar pronta`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "medido no celular, onde o salto aparecia");
    const draft = { v: 2, savedAt: Date.now(), startedAt: Date.now() - 60_000, step: 3, lang, answers: FULL, attribution: {} };
    await page.addInitScript(
      ([key, value]) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // sem storage: o teste falha adiante (sem banner/retomada)
        }
        const w = window as unknown as { __cls: number };
        w.__cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!entry.hadRecentInput) w.__cls += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      },
      [DRAFT_KEY, JSON.stringify(draft)] as const,
    );
    await page.goto(path);
    await page.waitForFunction(() => (window as unknown as { __lemamonWizardReady?: boolean }).__lemamonWizardReady === true);
    if (path.includes("etapa=")) await expect(page.locator("[data-wizard-actions]")).toBeVisible();
    else await expect(page.locator("[data-wizard-resume] [role='status']")).toBeVisible();
    await page.waitForTimeout(1_000);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThanOrEqual(MAX_CLS);
  });
}
