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
 */
import { expect, test, type Page } from "@playwright/test";

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
