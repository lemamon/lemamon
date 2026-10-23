/**
 * CTAs do chrome levam a mesma atribuição dos CTAs do conteúdo (dono: shell) —
 * backlog B166; BLUEPRINT §7.1 e §8.6.
 *
 * Numa página de serviço, a barra fixa, o header, o menu e o rodapé apontam
 * para /orcamento?servico={slug}&origem={slug}-{barra|header|menu|footer}, como
 * o hero e o CTA final. Sem isso, o mesmo botão "Pedir diagnóstico gratuito"
 * abria o wizard em dois estados: pré-marcado pelo conteúdo, vazio pela barra
 * (que é o CTA à vista na maior parte da rolagem no mobile). Na Sprint de
 * Descoberta os quatro levam ?entrada=descoberta.
 *
 * Roda contra o build (playwright.config.ts) ou um deploy/dev server
 * (E2E_NETLIFY_URL).
 *
 * Também a atribuição da auditoria de conversão: "Ref.: G-…" nos links de
 * WhatsApp depois de clique pago (F34), aba nova que adota o toque de campanha
 * de outra aba aberta (F26) e o modo ?debug_analytics=1 (F82).
 */
import { expect, test, type Page } from "./support/consent";

import { quoteHref, SERVICE_KEYS, SERVICE_PARAM, SERVICE_ROUTE, urlFor, type QuoteAttribution } from "../../src/config/routes";
import { LOCALES, type Locale } from "../../src/i18n/locales";

import { COPY, continueStep, expectStep, start, wizardRoot } from "./support/wizard";

/** Os 4 CTAs do chrome, pelo sufixo do ?origem= que o Base.astro dá a cada um. */
const CHROME = {
  barra: "[data-sticky-bar] a",
  header: "[data-site-header] a",
  menu: "#menu-drawer a",
  footer: "footer.site-footer a",
} as const;

async function chromeHrefs(page: Page, prefix: string): Promise<Record<keyof typeof CHROME, string | null>> {
  const entries = await Promise.all(
    (Object.keys(CHROME) as (keyof typeof CHROME)[]).map(async (slot) => {
      const link = page.locator(`${CHROME[slot]}[data-cta-id="diagnosis"][data-origem="${prefix}-${slot}"]`);
      await expect(link, `${slot} (${prefix}-${slot})`).toHaveCount(1);
      return [slot, await link.getAttribute("href")] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<keyof typeof CHROME, string | null>;
}

function expected(locale: Locale, prefix: string, attribution: Omit<QuoteAttribution, "origem">) {
  return Object.fromEntries(
    (Object.keys(CHROME) as (keyof typeof CHROME)[]).map((slot) => [slot, quoteHref(locale, { ...attribution, origem: `${prefix}-${slot}` })]),
  );
}

test.describe("hrefs dos CTAs do chrome", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "o HTML é o mesmo nos dois projetos");
  });

  for (const locale of LOCALES) {
    test(`páginas de serviço (${locale}): barra, header, menu e rodapé com ?servico=`, async ({ page }) => {
      for (const service of SERVICE_KEYS) {
        const param = SERVICE_PARAM[service];
        await page.goto(urlFor(SERVICE_ROUTE[service], locale));
        const hrefs = await chromeHrefs(page, param);
        expect(hrefs, `${locale} ${service}`).toEqual(expected(locale, param, { servico: service }));
        // Formato do critério: servico vem antes de origem.
        expect(hrefs.barra).toContain(`?servico=${param}&origem=${param}-barra`);
      }
    });
  }

  test("Sprint de Descoberta: os 4 levam ?entrada=descoberta; Home só a origem", async ({ page }) => {
    await page.goto(urlFor("discovery_sprint", "pt"));
    expect(await chromeHrefs(page, "descoberta")).toEqual(expected("pt", "descoberta", { entrada: "descoberta" }));
    await page.goto(urlFor("home", "pt"));
    expect(await chromeHrefs(page, "home")).toEqual(expected("pt", "home", {}));
  });
});

/** Rola até a barra fixa aparecer (ela some com o hero, outro CTA de diagnóstico ou o rodapé na tela). */
async function revealStickyBar(page: Page): Promise<void> {
  // Contra o `astro dev` (E2E_NETLIFY_URL local), a barra de ferramentas do dev
  // fica por cima do pé da tela e intercepta o toque. No build ela não existe.
  await page.addStyleTag({ content: "astro-dev-toolbar { display: none !important; }" });
  const bar = page.locator("[data-sticky-bar]");
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 600; y < height; y += 300) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    try {
      await expect(bar).toHaveAttribute("data-state", "visible", { timeout: 600 });
      return;
    } catch {
      // segue rolando
    }
  }
  throw new Error("a barra fixa não apareceu em nenhuma posição de rolagem");
}

test.describe("toque na barra fixa abre o wizard pré-marcado (375px)", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "barra fixa só abaixo de 768px");
  });

  test("/servicos/sustentacao: P1 = 'Já tenho um sistema no ar e preciso de quem cuide dele'", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(urlFor("service_support", "pt"));
    await revealStickyBar(page);
    await page.locator('[data-sticky-bar] a[data-cta-id="diagnosis"]').click();
    await expect(page).toHaveURL(/\/orcamento\?servico=sustentacao&origem=sustentacao-barra$/);
    await expect(page.locator("[data-wizard-context]")).toContainText(COPY.pt.quote.entry.context_service.split("{")[0]!.trim());
    await start(page);
    await expect(wizardRoot(page).locator('input[name="stage"][value="maintain_live_system"]')).toBeChecked();
  });

  test("/en/services/mobile-apps: P2 com 'Aplicativo' marcado", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(urlFor("service_mobile_apps", "en"));
    await revealStickyBar(page);
    await page.locator('[data-sticky-bar] a[data-cta-id="diagnosis"]').click();
    await expect(page).toHaveURL(/\/en\/quote\?servico=aplicativos&origem=aplicativos-barra$/);
    await expect(page.locator("[data-wizard-context]")).toContainText(COPY.en.quote.entry.context_service.split("{")[0]!.trim());
    await start(page);
    const root = wizardRoot(page);
    await root.locator('input[name="stage"][value="product_idea"]').check();
    await continueStep(page, "en");
    await expectStep(page, 2);
    await expect(root.locator('input[name="build_type"][value="mobile_app"]')).toBeChecked();
  });
});

test.describe("atribuição da campanha (auditoria de conversão)", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "regra de script: um projeto basta");
  });

  const TOUCH_KEY = "lemamon:atribuicao:v1";

  /** Texto (?text=) de cada link de WhatsApp com mensagem, fora o "Algum dado errado?" (data-campaign-ref="off"). */
  async function whatsappTexts(page: Page): Promise<string[]> {
    const hrefs = await page
      .locator('a[href^="https://wa.me/"][href*="text="]:not([data-campaign-ref="off"])')
      .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    return hrefs.map((href) => new URL(href).searchParams.get("text") ?? "");
  }

  test("F34: depois de clique pago, todo WhatsApp com texto termina em 'Ref.: G-…', nunca com o gclid", async ({ page }) => {
    await page.goto("/servicos/mvp?utm_source=google&utm_medium=cpc&utm_campaign=mvp-sp&gclid=TESTE-E2E-GCLID");
    let texts = await whatsappTexts(page);
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) {
      expect(text).toMatch(/\n\nRef\.: G-mvp-sp$/);
      expect(text).not.toContain("TESTE-E2E-GCLID");
    }
    // O toque segue na aba: outra página, sem parâmetro, também leva.
    await page.goto("/quanto-custa");
    texts = await whatsappTexts(page);
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(text).toMatch(/\n\nRef\.: G-mvp-sp$/);
  });

  test("F34: visita orgânica ou de outra rede não ganha referência", async ({ page }) => {
    await page.goto("/quanto-custa?utm_source=linkedin&utm_medium=social&utm_campaign=post");
    const texts = await whatsappTexts(page);
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(text).not.toContain("Ref.:");
  });

  test("F26: aba nova adota o toque de campanha de outra aba aberta do site", async ({ context }) => {
    const paid = await context.newPage();
    await paid.goto("/servicos/sistemas-web?utm_source=google&utm_medium=cpc&utm_campaign=sistemas&gclid=TESTE-E2E-ABA");
    // Cmd+clique: aba nova, sem o sessionStorage da outra.
    const fresh = await context.newPage();
    await fresh.goto("/orcamento?origem=sistemas-web-hero");
    await expect.poll(() => fresh.evaluate((key) => sessionStorage.getItem(key) ?? "", TOUCH_KEY)).toContain("TESTE-E2E-ABA");
    await expect(fresh.locator("a[data-wizard-help]")).toHaveAttribute("href", /Ref\.%3A%20G-sistemas/);
    // Fechadas as abas com campanha, a aba nova não tem de onde adotar: a origem vive só enquanto alguma aba vive.
    await paid.close();
    await fresh.close();
    const lonely = await context.newPage();
    await lonely.goto("/contato");
    await lonely.waitForTimeout(300);
    expect(await lonely.evaluate((key) => sessionStorage.getItem(key) ?? "", TOUCH_KEY)).not.toContain("TESTE-E2E-ABA");
  });

  test("F82: ?debug_analytics=1 escreve os eventos no console, sem enviar, e vale na aba", async ({ page }) => {
    const lines: string[] = [];
    page.on("console", (message) => lines.push(message.text()));
    await page.goto("/?debug_analytics=1");
    await page.locator('main a[data-origem="home-hero"]').first().click();
    await expect(page).toHaveURL(/\/orcamento\?origem=home-hero$/);
    await expect.poll(() => lines.some((line) => line.includes("[analytics:debug] cta_click"))).toBe(true);
    await expect.poll(() => lines.some((line) => line.includes("[analytics:debug] wizard_view"))).toBe(true);
  });
});
