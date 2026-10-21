/**
 * /contato e e-mail: polimento da auditoria de conversão (dono: conversion).
 *
 *  - F39: âncora "Prefere escrever? Ir para o formulário" no hero; por onde a
 *    resposta vem, logo abaixo do título do formulário; razão social e CNPJ
 *    na linha de localização (com hasCompanyData); perfis numa linha a 320px.
 *  - F49: no toque, o e-mail vira mailto: com assunto; com mouse, continua só
 *    texto. O "·" do rodapé do wizard some abaixo de 640px.
 */
import { expect, test } from "@playwright/test";

import dono from "../../dados/dono.json" with { type: "json" };
import { COPY } from "./support/wizard";

/** O dado real (o E2E roda sem a camada fictícia): razão social e CNPJ só com os dois preenchidos. */
const empresa = dono.empresa;

test.describe("/contato (F39)", () => {
  test("âncora para o formulário, linha de resposta, CNPJ perto do formulário", async ({ page }) => {
    const c = COPY.pt.contact;
    await page.goto("/contato");
    const link = page.locator(".contact-hero").getByRole("link", { name: c.hero.form_link });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/#formulario$/);
    await expect(page.locator("#contact-form-title")).toBeInViewport();
    await expect(page.locator(".contact-form__reply")).toHaveText(c.form.reply_line);
    if (empresa.razaoSocial.trim() && empresa.cnpj.trim()) {
      await expect(page.locator(".contact-channels__location")).toContainText(empresa.razaoSocial.trim());
      await expect(page.locator(".contact-channels__location")).toContainText("CNPJ");
    }
  });

  test("perfis numa linha só a 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/contato");
    const tops = await page
      .locator(".contact-channels__profiles li")
      .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().top)));
    expect(tops.length).toBeGreaterThan(0);
    expect(new Set(tops).size).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
});

test.describe("e-mail (F49)", () => {
  test("no toque, mailto: com assunto; com mouse, só texto", async ({ page }, testInfo) => {
    await page.goto("/contato");
    const links = page.locator('[data-copy-address] a[href^="mailto:"]');
    if (testInfo.project.name === "mobile") {
      await expect(links.first()).toHaveAttribute(
        "href",
        `mailto:${empresa.email}?subject=${encodeURIComponent(COPY.pt.shared.clipboard.mailto_subject)}`,
      );
    } else {
      await expect(page.locator("[data-copy-address]").first()).toHaveText(empresa.email);
      await expect(links).toHaveCount(0);
    }
  });

  test("rodapé do wizard: sem '·' pendurado abaixo de 640px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await page.goto("/orcamento");
    await expect(page.locator(".wizard-footer__sep")).toBeHidden();
    await page.setViewportSize({ width: 800, height: 760 });
    await expect(page.locator(".wizard-footer__sep")).toBeVisible();
  });
});
