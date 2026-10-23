/**
 * Caminho do dinheiro (04-tecnico §8; BLUEPRINT §7) — integrador.
 *
 *  (a) Home → CTA do hero → wizard (6 perguntas) → resumo → contato → envio
 *      com o POST do Netlify interceptado (200) → /orcamento/enviado com o
 *      código do pedido, o nome e o payload do form `briefing` conferido.
 *      O pós-envio confirma o contato pelo canal e leva o código ao WhatsApp
 *      ("Algum dado errado?", "Mandar oi", topo), achado F10; no contato, a
 *      sugestão de e-mail corrige "gmail.con" (F07).
 *  (b) Envio falhando (500 nas 3 tentativas) → tela de erro com as respostas
 *      salvas, "Enviar pelo WhatsApp" abrindo o wa.me com o resumo (o href
 *      não leva o texto) e "Tentar de novo" concluindo o envio.
 *
 * O build de E2E liga o WhatsApp com número de teste (playwright.config.ts).
 */
import { expect, test } from "./support/consent";

import { FORM_FIELDS } from "../../src/lib/forms";

import {
  answerAll,
  captureWindowOpen,
  CONTACT,
  COPY,
  DEFAULT_PATH,
  DRAFT_KEY,
  E2E_WHATSAPP_NUMBER,
  expectStep,
  fillContact,
  PROTOCOL_RE,
  start,
  stubNetlify,
  submit,
  tierLabel,
  waitMinFill,
  wizardRoot,
} from "./support/wizard";

test.describe("(a) caminho do dinheiro", () => {
  test("Home → CTA → 6 perguntas → resumo → contato → envio → /orcamento/enviado com protocolo", async ({ page }) => {
    const netlify = await stubNetlify(page, 200);
    const q = COPY.pt.quote;

    await page.goto("/");
    await page.locator('main a[data-origem="home-hero"]').first().click();
    await expect(page).toHaveURL(/\/orcamento\?origem=home-hero$/);
    await expect(page.locator("h1")).toHaveText(q.entry.title);

    const startedAt = await start(page);
    await expect(page).toHaveURL(/etapa=1/);

    // Sem seleção, "Continuar" não avança: erro inline e foco na primeira opção (§7.2).
    await wizardRoot(page).getByRole("button", { name: q.nav.continue, exact: true }).click();
    await expectStep(page, 1);
    await expect(wizardRoot(page).locator('input[name="stage"]').first()).toBeFocused();
    await expect(wizardRoot(page).locator('input[name="stage"]').first()).toHaveAttribute("aria-invalid", "true");

    await answerAll(page, "pt");
    await expect(page).toHaveURL(/etapa=resumo/);
    // Resumo sem preço calculado nem prazo estimado (§7.4). O único valor em
    // dinheiro na tela é a RESPOSTA da pessoa na P5 (o chip com a faixa que ela
    // escolheu, dados/dono.json › qualificacao): fora dele, nenhum R$.
    const escolhida = tierLabel("pt", DEFAULT_PATH.budget);
    await expect(wizardRoot(page)).toContainText(escolhida);
    const resumo = ((await wizardRoot(page).textContent()) ?? "").replaceAll(escolhida, "");
    expect(resumo).not.toMatch(/R\$|US\$|€/);

    await fillContact(page, "pt");
    await waitMinFill(page, startedAt);
    await submit(page, "pt");

    await expect(page).toHaveURL(/\/orcamento\/enviado$/);
    await expect(page.locator("h1")).toHaveText(q.sent.title_with_name.replace("{nome}", "Ana"));
    const protocol = (await page.locator("[data-sent-protocol-value]").textContent())?.trim() ?? "";
    expect(protocol).toMatch(PROTOCOL_RE);
    await expect(page.locator("[data-sent-protocol]")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    // Payload do briefing (§7.10): nomes estáveis, código igual ao da tela, atribuição do CTA.
    expect(netlify.bodies).toHaveLength(1);
    const body = netlify.bodies[0]!;
    expect(body.get("form-name")).toBe("briefing");
    for (const key of body.keys()) expect([...FORM_FIELDS.briefing, "form-name"]).toContain(key);
    expect(body.get("protocol")).toBe(protocol);
    expect(body.get("subject")).toMatch(new RegExp(`^\\[[ABCD]\\] ${protocol}$`));
    expect(body.get("name")).toBe(CONTACT.name);
    expect(body.get("email")).toBe(CONTACT.email);
    expect(body.get("phone")).toBe("(48) 99999-8888");
    expect(body.get("lang")).toBe("pt");
    expect(body.get("bot-field")).toBe("");
    expect(JSON.parse(body.get("answers") ?? "{}")).toMatchObject({
      stage: "problem_unclear",
      build_type: ["ops_system"],
      deadline: "within_3_months",
      budget: "tier_2",
      role: "i_decide",
    });
    expect(JSON.parse(body.get("attribution") ?? "{}")).toMatchObject({ origem: "home-hero" });

    // Rascunho apagado só depois do sucesso.
    expect(await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
    // WhatsApp do pós-envio com o código do pedido na mensagem.
    const waNow = page.locator('a[href^="https://wa.me/"]').filter({ hasText: q.sent.whatsapp_now.button });
    await expect(waNow).toHaveAttribute("href", new RegExp(encodeURIComponent(protocol)));
    await expect(page.locator("[data-sent-whatsapp-support]")).toHaveText(q.sent.whatsapp_now.support);

    // F10: o 2º passo confirma o WhatsApp deixado; "Algum dado errado?" leva o código.
    const step = page.locator("[data-sent-contact]");
    await expect(step.locator("strong")).toHaveText("(48) 99999-8888");
    await expect(step).toHaveText(q.sent.steps.contact_by_channel.whatsapp.replace("{contato}", "(48) 99999-8888"));
    const fix = page.locator("[data-sent-fix]");
    await expect(fix).toBeVisible();
    await expect(fix).toContainText(q.sent.wrong_contact.text);
    const fixText = new URL((await fix.getByRole("link").getAttribute("href")) ?? "").searchParams.get("text");
    expect(fixText).toBe(`${q.whatsapp_messages.wrong_contact.replace("{protocolo}", protocol)} `);
    // O "Dúvidas? WhatsApp" do topo também leva o código.
    await expect(page.locator("a[data-wizard-help]")).toHaveAttribute("href", new RegExp(encodeURIComponent(protocol)));
    // O número da Lemamon nunca vira texto da página (BLUEPRINT §1.5).
    expect(await page.locator("main").textContent()).not.toContain(E2E_WHATSAPP_NUMBER);
  });

  test("F10 no celular: o 'Mandar oi no WhatsApp' cabe na 1ª tela do iPhone 13 (390×664)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "medida do celular");
    await stubNetlify(page, 200);
    const q = COPY.pt.quote;
    await page.setViewportSize({ width: 390, height: 664 });
    await page.goto("/orcamento?origem=e2e-dobra");
    const startedAt = await start(page);
    await answerAll(page, "pt");
    await fillContact(page, "pt");
    await waitMinFill(page, startedAt);
    await submit(page, "pt");
    await expect(page).toHaveURL(/\/orcamento\/enviado$/);
    await page.evaluate(() => window.scrollTo(0, 0));
    const button = page.locator('a[href^="https://wa.me/"]').filter({ hasText: q.sent.whatsapp_now.button });
    const box = await button.boundingBox();
    expect(box && box.y + box.height).toBeLessThanOrEqual(664);
  });

  test("F07: no contato do wizard, e-mail com erro de digitação ganha sugestão; 'Corrigir' corrige", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "regra de interface: um projeto basta");
    const netlify = await stubNetlify(page, 200);
    const q = COPY.pt.quote;
    const s = COPY.pt.shared.forms.email_suggestion;
    await page.goto("/orcamento?origem=e2e-email");
    const startedAt = await start(page);
    await answerAll(page, "pt");
    await fillContact(page, "pt", { ...CONTACT, email: "ana.teste@gmail.con" });
    const root = wizardRoot(page);
    const email = root.getByRole("textbox", { name: q.contact_form.fields.email.label, exact: true });
    await email.blur();
    const suggestion = root.getByText(s.text.replace("{email}", "ana.teste@gmail.com"), { exact: true });
    await expect(suggestion).toBeVisible();
    await expect(email).not.toHaveAttribute("aria-invalid", "true");
    await root.getByRole("button", { name: s.fix, exact: true }).click();
    await expect(email).toHaveValue("ana.teste@gmail.com");
    await expect(suggestion).toHaveCount(0);
    await waitMinFill(page, startedAt);
    await submit(page, "pt");
    await expect(page).toHaveURL(/\/orcamento\/enviado$/);
    expect(netlify.bodies[0]?.get("email")).toBe("ana.teste@gmail.com");
  });
});

test.describe("(b) envio falhando", () => {
  test("erro mantém as respostas, WhatsApp abre com o resumo e 'Tentar de novo' conclui", async ({ page }) => {
    const opened = await captureWindowOpen(page);
    const netlify = await stubNetlify(page, 500);
    const q = COPY.en.quote;

    await page.goto("/en/quote?origem=e2e-failure");
    const startedAt = await start(page);
    await answerAll(page, "en");
    await fillContact(page, "en");
    await waitMinFill(page, startedAt);
    await submit(page, "en");

    const panel = wizardRoot(page).locator('[tabindex="-1"]').filter({ hasText: q.error.title });
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await expect(panel).toBeFocused();
    expect(netlify.bodies).toHaveLength(3);
    await expect(page).toHaveURL(/etapa=contato/);
    await expect(wizardRoot(page).getByRole("textbox", { name: q.contact_form.fields.name.label, exact: true })).toHaveValue(
      CONTACT.name,
    );
    const protocol = (await panel.locator("strong").first().textContent())?.trim() ?? "";
    expect(protocol).toMatch(PROTOCOL_RE);

    // O href não leva o texto (GA4 mede link_url); o clique abre o wa.me com o resumo.
    const wa = panel.getByRole("link", { name: q.error.whatsapp });
    await expect(wa).toHaveAttribute("href", `https://wa.me/${E2E_WHATSAPP_NUMBER}`);
    await wa.click();
    const [url] = await opened();
    expect(url).toMatch(new RegExp(`^https://wa\\.me/${E2E_WHATSAPP_NUMBER}\\?text=`));
    const text = new URL(url ?? "").searchParams.get("text") ?? "";
    expect(text).toContain(q.whatsapp_messages.failure_intro);
    expect(text).toContain(CONTACT.name);
    expect(text).toContain(protocol);
    const buildType = [q.steps.build_type.options_short.ops_system, q.steps.build_type.options.ops_system];
    expect(buildType.some((label) => text.includes(label))).toBe(true);
    expect(text).toContain(q.whatsapp_messages.failure_closing);

    // A rede volta: "Try again" envia o mesmo pedido (mesmo código) e segue para o pós-envio.
    netlify.setStatus(200);
    await panel.getByRole("button", { name: q.error.retry, exact: true }).click();
    await expect(page).toHaveURL(/\/en\/quote\/sent$/);
    await expect(page.locator("[data-sent-protocol-value]")).toHaveText(protocol);
    expect(netlify.bodies.at(-1)?.get("protocol")).toBe(protocol);
  });
});
