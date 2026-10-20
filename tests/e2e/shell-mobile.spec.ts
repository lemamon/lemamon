/**
 * Chrome no mobile e no zoom (dono: shell) — backlog B075, B084, B213 e o
 * painel de design (barra fixa ancorada no hero, CTA fixo no drawer).
 * Roda contra o build (playwright.config.ts) ou um deploy (E2E_NETLIFY_URL).
 */
import { expect, test, type Page } from "@playwright/test";

const DRAWER_SIZES = [
  [375, 667],
  [390, 664],
  [320, 568],
] as const;

test.describe("drawer: CTA fixo no pé, visível sem rolar", () => {
  for (const [width, height] of DRAWER_SIZES) {
    test(`${width}×${height}: 'Pedir diagnóstico' e WhatsApp à vista assim que o menu abre`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "drawer em tela cheia só no mobile");
      await page.setViewportSize({ width, height });
      for (const path of ["/", "/en/", "/es/"]) {
        await page.goto(path);
        await page.locator("button[data-drawer-open]").click();
        const dialog = page.locator("dialog[data-drawer]");
        await expect(dialog).toHaveAttribute("open", "");
        const cta = dialog.locator('a[data-cta-id="diagnosis"]');
        await expect(cta).toBeInViewport({ ratio: 1 });
        const box = (await cta.boundingBox())!;
        expect(box.y + box.height, path).toBeLessThanOrEqual(height);
        expect(await cta.getAttribute("href"), path).toMatch(/origem=home-menu/);
        // O rótulo do CTA fica numa linha só.
        const lines = await cta.evaluate((el) => {
          const label = [...el.querySelectorAll(".resume-label__default, .resume-label__default > *")].find(
            (node) => getComputedStyle(node).display !== "none" && node.children.length === 0,
          ) as HTMLElement | undefined;
          const target = label ?? (el as HTMLElement);
          return Math.round(target.getBoundingClientRect().height / (parseFloat(getComputedStyle(target).lineHeight) || 19));
        });
        expect(lines, path).toBe(1);
        await page.keyboard.press("Escape");
      }
    });
  }
});

async function tabUntilObscured(page: Page, tabs: number): Promise<string[]> {
  const obscured: string[] = [];
  for (let i = 0; i < tabs; i += 1) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(400);
    const result = await page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>("[data-sticky-bar]");
      const el = document.activeElement as HTMLElement | null;
      if (!bar || bar.dataset.state !== "visible" || getComputedStyle(bar).display === "none") return null;
      if (!el || el === document.body || bar.contains(el)) return null;
      const b = bar.getBoundingClientRect();
      const e = el.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(e.bottom, b.bottom) - Math.max(e.top, b.top));
      return { name: (el.textContent ?? "").trim().slice(0, 40), fraction: e.height ? overlap / e.height : 0 };
    });
    if (result && result.fraction > 0.5) obscured.push(`${result.name} (${Math.round(result.fraction * 100)}%)`);
  }
  return obscured;
}

test.describe("foco por teclado nunca embaixo da barra fixa (WCAG 2.4.11)", () => {
  test("640×400 (zoom de 200% num notebook): nenhum foco > 50% coberto", async ({ page, isMobile }) => {
    test.skip(isMobile, "teclado físico: projeto desktop");
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 640, height: 400 });
    // Sem o scroll suave: a medida sai depois que o foco terminou de rolar a página.
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of ["/servicos/sistemas-web", "/es/servicios/aplicaciones", "/en/pricing"]) {
      await page.goto(path);
      expect(await tabUntilObscured(page, 60), path).toEqual([]);
    }
  });
});

test.describe("barra fixa ancorada no hero", () => {
  test("página sem CTA no hero: a barra aparece quando o H1 sai da tela", async ({ page, isMobile }) => {
    test.skip(!isMobile, "barra fixa só abaixo de 768px");
    await page.goto("/privacidade");
    const bar = page.locator("[data-sticky-bar]");
    await expect(bar).toHaveAttribute("data-state", "hidden");
    await page.evaluate(() => {
      const h1 = document.querySelector("main h1")!;
      window.scrollTo(0, h1.getBoundingClientRect().bottom + window.scrollY + 200);
    });
    await expect(bar).toHaveAttribute("data-state", "visible");
  });

  test("Home: escondida enquanto o CTA do hero está na tela", async ({ page, isMobile }) => {
    test.skip(!isMobile, "barra fixa só abaixo de 768px");
    await page.goto("/");
    const bar = page.locator("[data-sticky-bar]");
    await page.locator('main [data-origem="home-hero"]').first().scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute("data-state", "hidden");
  });
});

test.describe("alvos de toque ≥ 44×44 no chrome (B084)", () => {
  test("375px: header, breadcrumb e rodapé", async ({ page, isMobile }) => {
    test.skip(!isMobile, "medida no mobile");
    await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ["/servicos/mvp", "/sprint-de-descoberta"]) {
      await page.goto(path);
      const small = await page.evaluate(() => {
        const targets = document.querySelectorAll("[data-site-header] a, [data-site-header] button, nav.breadcrumb a, footer .language-selector a, footer .site-footer__col ul a");
        return [...targets]
          .filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden")
          .map((el) => ({ text: (el.textContent ?? "").trim(), box: el.getBoundingClientRect() }))
          .filter(({ box }) => box.width > 0 && (Math.round(box.width) < 44 || Math.round(box.height) < 44))
          .map(({ text, box }) => `${text} ${Math.round(box.width)}×${Math.round(box.height)}`);
      });
      expect(small, path).toEqual([]);
    }
  });

  test("1024px e 1280px com toque: PT · EN · ES do header com 44×44", async ({ browser, isMobile }) => {
    test.skip(isMobile, "header de desktop");
    let measured = 0;
    for (const width of [1024, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 800 }, hasTouch: true });
      const page = await context.newPage();
      await page.goto("/como-trabalhamos");
      // Com Cases e Sobre no menu, 1024–1279px tira o seletor do header (fica no rodapé).
      const sizes = await page.locator("header .language-selector a").evaluateAll((links) =>
        links
          .filter((link) => link.getClientRects().length > 0)
          .map((link) => [Math.round(link.getBoundingClientRect().width), Math.round(link.getBoundingClientRect().height)]),
      );
      for (const [w, h] of sizes) {
        expect(w, `${width}px`).toBeGreaterThanOrEqual(44);
        expect(h, `${width}px`).toBeGreaterThanOrEqual(44);
      }
      measured += sizes.length;
      await context.close();
    }
    expect(measured).toBeGreaterThanOrEqual(3);
  });
});

test.describe("idioma: nome acessível e evento (B076, B329)", () => {
  test("header de /en/ a 1440px: o link 'PT' se chama 'PT, Português' (WCAG 2.5.3)", async ({ page, isMobile }) => {
    test.skip(isMobile, "seletor compacto só no header de desktop");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/");
    const header = page.locator("[data-site-header]");
    await expect(header.getByRole("link", { name: /^PT\b.*Português/ })).toHaveCount(1);
    await expect(header.getByRole("link", { name: /^EN\b.*English/ })).toHaveCount(1);
    await expect(header.getByRole("link", { name: /^ES\b.*Español/ })).toHaveCount(1);
  });

  test("o aviso de idioma emite language_change como o seletor", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/");
    const link = page.locator('.lang-suggest[data-lang-target="en"] a');
    await expect(link).toHaveAttribute("data-track", "language_change");
    await expect(link).toHaveAttribute("data-from-lang", "pt");
    await expect(link).toHaveAttribute("data-to-lang", "en");
    await context.close();
  });
});
