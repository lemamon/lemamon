/**
 * /contato (BLUEPRINT §6.9) e layout em tela pequena (§2.8, §11) — integrador.
 *
 *  - /contato: validação no envio com foco no 1º campo inválido; envio com o
 *    POST do Netlify interceptado (200) → "Mensagem recebida." na mesma página,
 *    payload do form `contato`; falha → painel de erro com os dados mantidos.
 *  - 320px: nenhuma página "always" com rolagem horizontal (WhatsApp ligado).
 *  - 360×640: H1, CTA primário e WhatsApp do hero da Home acima da dobra com o
 *    navegador no idioma da página; com o aviso de idioma, H1 e CTA primário.
 */
import { devices, expect, test, type Page } from "@playwright/test";

import { isRouteLive, routeDef, staticRouteEntries } from "../../src/config/routes";
import { FORM_FIELDS } from "../../src/lib/forms";

import { COPY, stubNetlify, waitMinFill } from "./support/wizard";

test.describe("/contato", () => {
  test("valida, envia (200) e confirma na página com o payload do form contato", async ({ page }) => {
    const netlify = await stubNetlify(page, 200);
    const c = COPY.pt.contact.form;
    await page.goto("/contato?origem=e2e-contato");
    const startedAt = Date.now();
    const form = page.locator("form[data-contact-form]");

    await form.getByRole("button", { name: c.submit, exact: true }).click();
    await expect(form.getByRole("textbox", { name: c.fields.name.label, exact: true })).toBeFocused();
    await expect(form).toContainText(c.fields.name.error_required);
    expect(netlify.bodies).toHaveLength(0);

    await form.getByRole("textbox", { name: c.fields.name.label, exact: true }).fill("Bruno Teste");
    await form.getByRole("textbox", { name: c.fields.email.label, exact: true }).fill("bruno.teste@example.com");
    await form.locator('input[name="subject"][value="partnership"]').check();
    await form.getByRole("textbox", { name: c.fields.message.label, exact: true }).fill("Mensagem de teste automatizado.");
    await waitMinFill(page, startedAt);
    await form.getByRole("button", { name: c.submit, exact: true }).click();

    const success = page.locator("[data-contact-success]");
    await expect(success).toHaveAttribute("data-visible", "true");
    await expect(success).toBeFocused();
    await expect(success).toContainText(c.success_title);

    expect(netlify.bodies).toHaveLength(1);
    const body = netlify.bodies[0]!;
    expect(body.get("form-name")).toBe("contato");
    for (const key of body.keys()) expect([...FORM_FIELDS.contato, "form-name"]).toContain(key);
    expect(body.get("subject")).toBe("partnership");
    expect(body.get("lang")).toBe("pt");
    expect(body.get("origin")).toBe("e2e-contato");
  });

  test("falha de envio: painel de erro e os dados continuam no formulário (es)", async ({ page }) => {
    const netlify = await stubNetlify(page, 500);
    const c = COPY.es.contact.form;
    await page.goto("/es/contacto");
    const startedAt = Date.now();
    const form = page.locator("form[data-contact-form]");
    await form.getByRole("textbox", { name: c.fields.name.label, exact: true }).fill("Carla Prueba");
    await form.getByRole("textbox", { name: c.fields.email.label, exact: true }).fill("carla.prueba@example.com");
    await form.locator('input[name="subject"][value="other"]').check();
    await form.getByRole("textbox", { name: c.fields.message.label, exact: true }).fill("Mensaje de prueba.");
    await waitMinFill(page, startedAt);
    await form.getByRole("button", { name: c.submit, exact: true }).click();

    const error = form.locator("[data-contact-error]");
    await expect(error).toBeVisible({ timeout: 15_000 });
    await expect(error).toBeFocused();
    expect(netlify.bodies).toHaveLength(3);
    await expect(form.getByRole("textbox", { name: c.fields.message.label, exact: true })).toHaveValue("Mensaje de prueba.");
  });

  test("es: telefone sem + não ganha a máscara brasileira e é inválido; com + vai como digitado", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "regra de validação: um projeto basta");
    const netlify = await stubNetlify(page, 200);
    const c = COPY.es.contact.form;
    await page.goto("/es/contacto");
    const startedAt = Date.now();
    const form = page.locator("form[data-contact-form]");
    await form.getByRole("textbox", { name: c.fields.name.label, exact: true }).fill("Carla Prueba");
    await form.getByRole("textbox", { name: c.fields.email.label, exact: true }).fill("carla.prueba@example.com");
    await form.locator('input[name="subject"][value="other"]').check();
    await form.getByRole("textbox", { name: c.fields.message.label, exact: true }).fill("Mensaje de prueba.");
    const phone = form.locator('input[name="phone"]');
    // Celular de Buenos Aires sem o código do país: antes virava "(11) 2345-6789".
    await phone.fill("1123456789");
    await expect(phone).toHaveValue("1123456789");
    await waitMinFill(page, startedAt);
    await form.getByRole("button", { name: c.submit, exact: true }).click();
    await expect(phone).toBeFocused();
    await expect(phone).toHaveAttribute("aria-invalid", "true");
    await expect(form).toContainText(c.fields.phone.error_invalid);
    expect(netlify.bodies).toHaveLength(0);

    await phone.fill("+54 9 11 2345 6789");
    await form.getByRole("button", { name: c.submit, exact: true }).click();
    await expect(page.locator("[data-contact-success]")).toHaveAttribute("data-visible", "true");
    expect(netlify.bodies).toHaveLength(1);
    expect(netlify.bodies[0]?.get("phone")).toBe("+54 9 11 2345 6789");
  });

  test("en: o erro do telefone dá um exemplo de fora do Brasil e o número dos EUA com + passa (F16)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "regra de validação: um projeto basta");
    const netlify = await stubNetlify(page, 200);
    const c = COPY.en.contact.form;
    expect(c.fields.phone.error_invalid).not.toContain("+55");
    expect(c.fields.phone.error_invalid).toBe(COPY.en.shared.errors.invalid_phone);
    await page.goto("/en/contact");
    const startedAt = Date.now();
    const form = page.locator("form[data-contact-form]");
    await form.getByRole("textbox", { name: c.fields.name.label, exact: true }).fill("Jane Test");
    await form.getByRole("textbox", { name: c.fields.email.label, exact: true }).fill("jane.test@example.com");
    await form.locator('input[name="subject"][value="other"]').check();
    await form.getByRole("textbox", { name: c.fields.message.label, exact: true }).fill("Test message.");
    const phone = form.locator('input[name="phone"]');
    await phone.fill("415 555 0134");
    await waitMinFill(page, startedAt);
    await form.getByRole("button", { name: c.submit, exact: true }).click();
    await expect(phone).toHaveAttribute("aria-invalid", "true");
    await expect(form).toContainText(c.fields.phone.error_invalid);
    expect(netlify.bodies).toHaveLength(0);

    await phone.fill("+1 415 555 0134");
    await form.getByRole("button", { name: c.submit, exact: true }).click();
    await expect(page.locator("[data-contact-success]")).toHaveAttribute("data-visible", "true");
    expect(netlify.bodies[0]?.get("phone")).toBe("+1 415 555 0134");
  });
});

test.describe("tela pequena", () => {
  const pages = staticRouteEntries().filter(({ key }) => isRouteLive(key, {}) && !routeDef(key).error);

  test("320px: nenhuma página com rolagem horizontal", async ({ page, isMobile }) => {
    test.skip(!isMobile, "uma vez só, no projeto mobile");
    await page.setViewportSize({ width: 320, height: 640 });
    for (const { path } of pages) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("360×640: H1, 'Pedir diagnóstico gratuito' e WhatsApp do hero acima da dobra", async ({ browser, isMobile, baseURL }) => {
    test.skip(!isMobile, "medida do mobile");
    const fold = 640;
    const bottom = async (page: Page, selector: string) => {
      const box = await page.locator(selector).first().boundingBox();
      return box ? box.y + box.height : Number.POSITIVE_INFINITY;
    };
    for (const [path, browserLocale] of [["/", "pt-BR"], ["/en/", "en-US"], ["/es/", "es-419"]] as const) {
      // Navegador no idioma da página: sem o aviso de idioma, cabem as duas portas (§6.1 #1).
      const context = await browser.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: fold }, locale: browserLocale, baseURL });
      const page = await context.newPage();
      await page.goto(path);
      expect(await bottom(page, "h1"), `${path} H1`).toBeLessThanOrEqual(fold);
      expect(await bottom(page, 'main a[data-origem="home-hero"]'), `${path} CTA`).toBeLessThanOrEqual(fold);
      expect(await bottom(page, 'main a[data-track="whatsapp_click"]'), `${path} WhatsApp`).toBeLessThanOrEqual(fold);
      await context.close();
    }
    // Com o aviso "também disponível em…" (navegador em outro idioma), o mínimo do §2.8 continua: H1 e CTA primário.
    const other = await browser.newContext({ ...devices["Pixel 7"], viewport: { width: 360, height: fold }, locale: "en-US", baseURL });
    const page = await other.newPage();
    await page.goto("/es/");
    await expect(page.locator("html")).toHaveAttribute("data-lang-suggest", "en");
    expect(await bottom(page, "h1")).toBeLessThanOrEqual(fold);
    expect(await bottom(page, 'main a[data-origem="home-hero"]')).toBeLessThanOrEqual(fold);
    await other.close();
  });
});
