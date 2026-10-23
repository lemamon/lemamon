/**
 * Wizard — retomada de rascunho e pré-marcação (BLUEPRINT §7.1) — integrador.
 *
 *  (c) Respostas gravadas a cada passo; fora do wizard o CTA vira "Continuar
 *      meu pedido" e leva ao passo salvo; em /orcamento a faixa "Você começou
 *      um pedido em…" retoma com as respostas intactas.
 *  (d) ?servico= pré-marca a P2 (e sustentacao a P1 = maintain_live_system),
 *      com a linha de contexto; ?entrada=descoberta não pré-marca nada.
 */
import { expect, test } from "./support/consent";

import { COPY, DRAFT_KEY, continueStep, expectStep, start, wizardRoot } from "./support/wizard";

test.describe("(c) retomada do rascunho", () => {
  test("sai no meio, o site oferece 'Continuar meu pedido' e a retomada mantém as respostas", async ({ page, isMobile }) => {
    const q = COPY.pt.quote;
    await page.goto("/orcamento");
    await start(page);
    const root = wizardRoot(page);
    await root.locator('input[name="stage"][value="scope_defined"]').check();
    await continueStep(page, "pt");
    await expectStep(page, 2);
    await root.locator('input[name="build_type"][value="mobile_app"]').check();
    await root.locator('input[name="build_type"][value="integration"]').check();
    await continueStep(page, "pt");
    await expectStep(page, 3);

    const draft = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), DRAFT_KEY);
    expect(draft).toMatchObject({ step: 3, lang: "pt", answers: { stage: "scope_defined", build_type: ["mobile_app", "integration"] } });

    // Fora do wizard: o CTA de diagnóstico vira "Continuar meu pedido" (sem flash, pelo script do <head>).
    await page.goto("/como-trabalhamos");
    await expect(page.locator("html")).toHaveAttribute("data-draft-step", "3");
    if (!isMobile) {
      const cta = page.locator(".site-header__cta");
      await expect(cta).toHaveAttribute("href", "/orcamento?etapa=3");
      await expect(cta.locator(".resume-label__resume")).toHaveText(COPY.pt.shared.cta.continue_order);
    }

    // Entrada do wizard sem ?etapa=: faixa de retomada acima do H1.
    await page.goto("/orcamento");
    const banner = page.getByRole("status").filter({ hasText: q.entry.resume_banner.continue });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: q.entry.resume_banner.continue, exact: true }).click();
    await expectStep(page, 3);
    await root.getByRole("button", { name: q.nav.back, exact: true }).click();
    await expectStep(page, 2);
    await expect(root.locator('input[name="build_type"][value="mobile_app"]')).toBeChecked();
    await expect(root.locator('input[name="build_type"][value="integration"]')).toBeChecked();
    await root.getByRole("button", { name: q.nav.back, exact: true }).click();
    await expectStep(page, 1);
    await expect(root.locator('input[name="stage"][value="scope_defined"]')).toBeChecked();
  });

  test("'Começar de novo' apaga as respostas salvas", async ({ page }) => {
    const q = COPY.es.quote;
    await page.goto("/es/cotizacion");
    await start(page);
    await wizardRoot(page).locator('input[name="stage"][value="product_idea"]').check();
    await continueStep(page, "es");
    await expectStep(page, 2);
    await page.goto("/es/cotizacion");
    await page.getByRole("button", { name: q.entry.resume_banner.restart, exact: true }).click();
    await expectStep(page, 1);
    await expect(wizardRoot(page).locator('input[name="stage"]:checked')).toHaveCount(0);
  });
});

test.describe("(d) pré-marcação por ?servico=", () => {
  test("?servico=aplicativos marca 'Aplicativo' na P2 e mostra a linha de contexto", async ({ page }) => {
    const q = COPY.pt.quote;
    await page.goto("/orcamento?servico=aplicativos&origem=aplicativos-hero");
    await expect(page.locator("[data-wizard-context]")).toContainText(q.entry.context_service.split("{")[0]!.trim());
    await start(page);
    const root = wizardRoot(page);
    await expect(root.locator('input[name="stage"]:checked')).toHaveCount(0);
    await root.locator('input[name="stage"][value="product_idea"]').check();
    await continueStep(page, "pt");
    await expectStep(page, 2);
    await expect(root.locator('input[name="build_type"][value="mobile_app"]')).toBeChecked();
    await expect(root.locator('input[name="build_type"]:checked')).toHaveCount(1);
  });

  test("?servico=sistemas-web marca só o sistema da operação e a linha cita a opção (en, F28)", async ({ page }) => {
    await page.goto("/en/quote?servico=sistemas-web&origem=sistemas-web-final");
    const q = COPY.en.quote;
    await expect(page.locator("[data-wizard-context]")).toContainText(`“${q.steps.build_type.options_short.ops_system}”`);
    await start(page);
    const root = wizardRoot(page);
    await root.locator('input[name="stage"][value="problem_unclear"]').check();
    await continueStep(page, "en");
    await expectStep(page, 2);
    await expect(root.locator('input[name="build_type"][value="ops_system"]')).toBeChecked();
    await expect(root.locator('input[name="build_type"]:checked')).toHaveCount(1);
  });

  test("?servico=sustentacao marca a P1 = maintain_live_system (es)", async ({ page }) => {
    await page.goto("/es/cotizacion?servico=sustentacao&origem=sustentacao-hero");
    await start(page);
    await expect(wizardRoot(page).locator('input[name="stage"][value="maintain_live_system"]')).toBeChecked();
  });

  test("?entrada=descoberta não pré-marca nada (só atribuição)", async ({ page }) => {
    await page.goto("/orcamento?entrada=descoberta&origem=descoberta-hero");
    await start(page);
    const root = wizardRoot(page);
    await expect(root.locator("input:checked")).toHaveCount(0);
    await root.locator('input[name="stage"][value="problem_unclear"]').check();
    await continueStep(page, "pt");
    await expectStep(page, 2);
    await expect(root.locator('input[name="build_type"]:checked')).toHaveCount(0);
  });
});
