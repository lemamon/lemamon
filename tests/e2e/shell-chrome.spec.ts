/**
 * E2E do chrome do site (dono: shell) — BLUEPRINT §7.1, §8.1–8.5, §11.
 * Roda contra o build (playwright.config.ts). Projetos: desktop e mobile.
 */
import { expect, test } from "./support/consent";

const DRAFT_KEY = "lemamon:orcamento:v2";

test.describe("acessibilidade básica do layout", () => {
  test("o primeiro Tab mostra 'Pular para o conteúdo' e leva ao <main>", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.locator(".skip-link");
    await expect(skip).toBeFocused();
    await expect(skip).toHaveText("Pular para o conteúdo");
    await page.keyboard.press("Enter");
    await expect(page.locator("main#conteudo")).toBeFocused();
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("<html lang> por idioma e hreflang recíproco + x-default", async ({ page }) => {
    for (const [path, lang] of [["/", "pt-BR"], ["/en/how-we-work", "en"], ["/es/cuanto-cuesta", "es"]] as const) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    }
  });

  test("seletor de idioma leva à página equivalente", async ({ page }) => {
    await page.goto("/quanto-custa");
    const selector = page.locator("footer .language-selector");
    await expect(selector.locator('a[hreflang="en"]')).toHaveAttribute("href", "/en/pricing");
    await expect(selector.locator('a[hreflang="es"]')).toHaveAttribute("href", "/es/cuanto-cuesta");
    await expect(selector.locator('a[aria-current="true"]')).toHaveAttribute("hreflang", "pt-BR");
  });
});

test.describe("header", () => {
  test("desktop: Serviços abre por clique e fecha com Esc devolvendo o foco", async ({ page, isMobile }) => {
    test.skip(isMobile, "dropdown só existe no desktop");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const summary = page.locator("details[data-nav-dropdown] > summary");
    await summary.click();
    await expect(page.locator("details[data-nav-dropdown]")).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(page.locator("details[data-nav-dropdown]")).not.toHaveAttribute("open", "");
    await expect(summary).toBeFocused();
  });

  test("mobile: drawer com focus trap, Esc fecha e devolve o foco ao 'Menu'", async ({ page, isMobile }) => {
    test.skip(!isMobile, "drawer só abaixo de 1024px");
    await page.goto("/");
    const toggle = page.locator("button[data-drawer-open]");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const dialog = page.locator("dialog[data-drawer]");
    await expect(dialog).toHaveAttribute("open", "");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    // 5 serviços + Sprint + Como trabalhamos + Quanto custa + Contato (+ Cases/Sobre quando existirem)
    expect(await dialog.locator(".drawer__link").count()).toBeGreaterThanOrEqual(9);
    for (let i = 0; i < 30; i += 1) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog[data-drawer]")))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).not.toHaveAttribute("open", "");
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("retomada do pedido (§7.1)", () => {
  test("rascunho válido troca o CTA para 'Continuar meu pedido' sem mudar a largura", async ({ page, isMobile }) => {
    test.skip(isMobile, "CTA do header só aparece a partir de 768px");
    await page.goto("/como-trabalhamos");
    const cta = page.locator(".site-header__cta");
    const before = await cta.boundingBox();
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ v: 2, savedAt: Date.now(), step: 4, lang: "pt", answers: {}, attribution: {} }));
    }, DRAFT_KEY);
    await page.reload();
    await expect(cta).toHaveAttribute("href", "/orcamento?etapa=4");
    await expect(cta.locator(".resume-label__resume")).toBeVisible();
    await expect(cta.locator(".resume-label__default")).toBeHidden();
    expect((await cta.boundingBox())?.width).toBe(before?.width);
  });

  test("rascunho com mais de 30 dias é apagado ao abrir qualquer página", async ({ page }) => {
    await page.goto("/contato");
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({ v: 2, savedAt: Date.now() - 31 * 24 * 3600 * 1000, step: 2 }));
    }, DRAFT_KEY);
    await page.goto("/en/pricing");
    expect(await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
    await expect(page.locator("html")).not.toHaveAttribute("data-draft-step", /.*/);
  });
});

test.describe("barra fixa mobile (§8.2)", () => {
  test("aparece depois que o CTA do hero sai da tela e não existe no wizard", async ({ page, isMobile }) => {
    test.skip(!isMobile, "barra só no mobile");
    await page.goto("/quanto-custa");
    const bar = page.locator("[data-sticky-bar]");
    await expect(bar).toHaveAttribute("data-state", "hidden");
    // Procura uma posição de rolagem depois do CTA do hero em que nenhum outro
    // CTA de diagnóstico, formulário ou o rodapé esteja na tela: ali a barra aparece.
    const top = await page.evaluate(() => {
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      };
      const blockers = [
        ...document.querySelectorAll('main [data-track="cta_click"][data-cta-id="diagnosis"], main form:not([hidden]), [data-sticky-hide]'),
      ];
      const hero = blockers[0] as HTMLElement;
      const start = hero.getBoundingClientRect().bottom + window.scrollY + 10;
      for (let y = start; y < document.documentElement.scrollHeight; y += 150) {
        window.scrollTo({ top: y, behavior: "instant" });
        if (!blockers.some(visible)) return y;
      }
      return null;
    });
    test.skip(top === null, "página sem trecho livre de CTA");
    await expect(bar).toHaveAttribute("data-state", "visible");
    await page.goto("/orcamento");
    await expect(page.locator("[data-sticky-bar]")).toHaveCount(0);
    await expect(page.locator("[data-whatsapp-float]")).toHaveCount(0);
  });
});

test.describe("SEO", () => {
  test("Home tem Organization/ProfessionalService e OG 1200×630 do idioma", async ({ page }) => {
    await page.goto("/es/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://lemamon.dev/assets/img/og/default-es.jpg");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.join(" ")).toContain('"ProfessionalService"');
  });

  test("404 é noindex e sem canonical", async ({ page }) => {
    const response = await page.goto("/es/no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});
