/**
 * Wizard: polimento da auditoria de conversão (dono: conversion), seção (c)
 * "Polimento — baixos" de docs/arquitetura/AUDITORIA-CONVERSAO.md.
 *
 *  - F25: "Começar" tocado antes da hidratação ganha o spinner na hora
 *    (data-loading, aria-busy, aria-disabled); a ilha limpa ao montar.
 *  - F31: com o navegador em inglês, a entrada mostra o aviso de idioma, que
 *    some no modo foco; trocar de idioma mantém a query menos o ?etapa=; o
 *    rodapé mínimo tem o seletor.
 *  - F22: a P3 não tem "Pular"; o helper diz que Continuar sem marcar vale.
 *  - F27: o "Dúvidas? WhatsApp" do header diz a pergunta; no resumo, o href
 *    dos links leva só o texto fixo e o clique do header abre com as respostas.
 *  - F29: "Alterar" a P1 para sistema no ar leva à nova P3 (vazia) antes do resumo.
 *  - F30: na P4, marcar um prazo traz o campo da data à tela (celular); o
 *    exemplo de produto aparece só para produto/MVP.
 *  - F45: quem recomenda a quem decide lê o motivo para enviar sob o CTA.
 */
import { expect, test, type Page } from "@playwright/test";

import { captureWindowOpen, COPY, DRAFT_KEY, expectStep, start, waitEntryLock, wizardRoot } from "./support/wizard";

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
} as Record<string, string | string[]>;

async function openWithDraft(page: Page, locale: Locale, step: number | "resumo" | "contato", answers = FULL): Promise<void> {
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
  await waitEntryLock(page);
}

const textOf = (href: string | null) => new URL(href ?? "").searchParams.get("text");

test.describe("entrada (F25, F31)", () => {
  test("F25: toque antes da hidratação mostra o spinner e a ilha limpa ao montar", async ({ page }) => {
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(/\/_astro\/Wizard\.[^/]+\.js$/, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto("/orcamento", { waitUntil: "domcontentloaded" });
    const button = page.locator("[data-wizard-start]").first();
    await button.click();
    await expect(button).toHaveAttribute("data-loading", "true");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    release();
    await expectStep(page, 1);
    await expect(page.locator("[data-wizard-start][data-loading]")).toHaveCount(0);
  });

  test("F31: aviso de idioma na entrada, fora do modo foco; a troca mantém a query", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale: "en-US", baseURL });
    const page = await context.newPage();
    await page.goto("/orcamento?servico=aplicativos&origem=e2e-f31&utm_source=teste");
    const suggestion = page.locator('.lang-suggest[data-lang-target="en"]');
    await expect(suggestion).toBeVisible();
    await expect(page.locator("[data-wizard-footer] nav a[hreflang]")).toHaveCount(3);
    await suggestion.getByRole("link").click();
    await expect(page).toHaveURL(/\/en\/quote\?servico=aplicativos&origem=e2e-f31&utm_source=teste$/);
    // De volta ao pt, já no modo foco: o aviso some.
    await page.goto("/orcamento?servico=aplicativos");
    await start(page);
    await expect(suggestion).toBeHidden();
    await context.close();
  });
});

test.describe("perguntas e resumo (F22, F27, F29, F30, F45)", () => {
  test("F22: P3 sem 'Pular'; o helper diz que Continuar sem marcar vale", async ({ page }) => {
    const q = COPY.pt.quote;
    await openWithDraft(page, "pt", 3, { ...FULL, pain: [] });
    await expect(wizardRoot(page).getByText(q.steps.pain.helper)).toBeVisible();
    await expect(wizardRoot(page).locator("form > button")).toHaveCount(0);
    await wizardRoot(page).getByRole("button", { name: q.nav.continue, exact: true }).click();
    await expectStep(page, 4);
  });

  test("F27: header diz a pergunta; no resumo, href com texto fixo e o header abre com as respostas", async ({ page }) => {
    const q = COPY.pt.quote;
    const opened = await captureWindowOpen(page);
    await openWithDraft(page, "pt", 4);
    const help = page.locator("a[data-wizard-help]");
    await expect
      .poll(async () => textOf(await help.getAttribute("href")))
      .toBe(q.whatsapp_messages.wizard_question_step.replace("{n}", "4").replace("{total}", "6").replace("{tema}", q.steps.deadline.short_label));

    await page.goto(`${PATH.pt}?etapa=resumo`);
    await expect(wizardRoot(page).getByRole("heading", { level: 2, name: q.summary.title })).toBeVisible();
    const links = wizardRoot(page).locator('a[href^="https://wa.me/"]');
    expect(await links.count()).toBeGreaterThan(0);
    for (const href of await links.evaluateAll((list) => list.map((link) => link.getAttribute("href")))) {
      expect(textOf(href)).toBe(q.whatsapp_messages.summary_link);
    }
    await expect.poll(async () => textOf(await help.getAttribute("href"))).toBe(q.whatsapp_messages.summary_link);
    await help.click();
    await expect.poll(async () => (await opened()).length).toBe(1);
    const message = textOf((await opened())[0] ?? "") ?? "";
    expect(message).toContain(q.whatsapp_messages.summary_intro);
    expect(message).toContain(q.steps.build_type.options_short.ops_system);
  });

  test("F29: trocar a P1 para sistema no ar pelo resumo pergunta a nova P3 antes de voltar", async ({ page }) => {
    const q = COPY.pt.quote;
    await openWithDraft(page, "pt", "resumo");
    const root = wizardRoot(page);
    await root.getByRole("button", { name: q.summary.edit_aria_label.replace("{rotulo}", q.steps.stage.short_label) }).click();
    await expectStep(page, 1);
    await root.locator('input[name="stage"][value="evolve_live_system"]').check();
    await root.getByRole("button", { name: q.nav.continue_to_summary, exact: true }).click();
    await expectStep(page, 3);
    await expect(root.getByRole("heading", { level: 2, name: q.steps.system_pain.question })).toBeVisible();
    await root.getByRole("button", { name: q.nav.continue_to_summary, exact: true }).click();
    await expect(root.getByRole("heading", { level: 2, name: q.summary.title })).toBeVisible();
  });

  test("F30: no celular, marcar um prazo traz o campo da data à tela; exemplo de produto só para produto", async ({ page }) => {
    const q = COPY.pt.quote;
    await page.setViewportSize({ width: 390, height: 664 });
    await openWithDraft(page, "pt", 4, { ...FULL, deadline: "" });
    const reason = wizardRoot(page).getByRole("textbox", { name: q.steps.deadline.reason_label });
    await expect(reason).toHaveAttribute("placeholder", q.steps.deadline.reason_placeholder);
    await wizardRoot(page).locator('input[name="deadline"][value="within_3_months"]').check();
    const bar = await page.locator("[data-wizard-actions]").boundingBox();
    await expect
      .poll(async () => {
        const box = await reason.boundingBox();
        return box ? box.y + box.height : Number.POSITIVE_INFINITY;
      })
      .toBeLessThanOrEqual((bar?.y ?? 0) + 1);
    await expect(reason).not.toBeFocused();
  });

  test("F30: o exemplo de captação aparece só para produto ou MVP", async ({ page }) => {
    const q = COPY.pt.quote;
    await openWithDraft(page, "pt", 4, { ...FULL, stage: "product_idea", build_type: ["mvp"], deadline: "" });
    await expect(wizardRoot(page).getByRole("textbox", { name: q.steps.deadline.reason_label })).toHaveAttribute(
      "placeholder",
      q.steps.deadline.reason_placeholder_product_variant,
    );
  });

  test("F45: quem recomenda a quem decide lê o motivo para enviar", async ({ page }) => {
    const q = COPY.pt.quote;
    await openWithDraft(page, "pt", "resumo", { ...FULL, role: "recommend_to_decider" });
    // No celular o CTA do topo some (a barra fixa leva o primário): vale a nota que está à vista.
    await expect(wizardRoot(page).getByText(q.summary.below_primary_share).filter({ visible: true }).first()).toBeVisible();
    await expect(wizardRoot(page).getByText(q.summary.below_primary, { exact: true })).toHaveCount(0);
  });
});
