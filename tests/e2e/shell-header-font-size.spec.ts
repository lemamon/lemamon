/**
 * Header com a fonte do navegador ampliada (dono: shell) — F13 da
 * AUDITORIA-CONVERSAO. Com o "Tamanho da fonte" do Chrome em Grande (20px) ou
 * Muito grande (24px), o header de desktop (media queries em px) transbordava:
 * 151px de rolagem lateral em 1024@20, 293px em 1280@24, CTA fora da tela.
 * As @media do header, do drawer, da barra fixa e do WhatsApp flutuante agora
 * são em `em` (1em de @media = fonte padrão do navegador), e NAV_QUERIES
 * (src/styles/breakpoints.ts) também: com fonte maior, a janela cai no layout
 * de tela mais estreita (48em/64em/79.999em = 768/1024/1280px × fonte ÷ 16).
 *
 * Page.setFontSizes (CDP) é o mesmo mecanismo do ajuste do Chrome; ele vale
 * para as navegações seguintes da mesma página. Com 16px, este spec repete as
 * larguras de notebook (1280, 1366, 1440) que o shell-header-cta.spec.ts não
 * cobre. Roda contra o build (playwright.config.ts) ou um deploy (E2E_NETLIFY_URL).
 */
import { expect, test, type Page } from "@playwright/test";

const HOMES = [
  ["pt", "/"],
  ["en", "/en/"],
  ["es", "/es/"],
] as const;
const WIDTHS = [1024, 1280, 1366, 1440] as const;
const FONTS = [16, 20, 24] as const;

type Layout = "mobile" | "tablet" | "desktop";

/** Layout que as @media em em dão para a largura e a fonte (BLUEPRINT §8.1). */
const expectedLayout = (width: number, font: number): Layout => (width < 48 * font ? "mobile" : width < 64 * font ? "tablet" : "desktop");

/** "Tamanho da fonte" do Chrome: Grande = 20px, Muito grande = 24px (monoespaçada 4px menor). */
async function setBrowserFontSize(page: Page, standard: number): Promise<void> {
  if (standard === 16) return;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Page.setFontSizes", { fontSizes: { standard, fixed: standard - 4 } });
}

/**
 * Rolagem lateral (scrollWidth − clientWidth) da página e da página sem o
 * rodapé. O rodapé tem @media em px (fora do F13, ver o test.fixme no fim):
 * com 24px, a coluna de contato vaza 30–61px entre 1024 e ~1200px.
 */
async function overflow(page: Page): Promise<{ page: number; withoutFooter: number }> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const total = root.scrollWidth - root.clientWidth;
    const footer = document.querySelector<HTMLElement>("footer.site-footer");
    if (!footer) return { page: total, withoutFooter: total };
    footer.style.display = "none";
    const withoutFooter = root.scrollWidth - root.clientWidth;
    footer.style.display = "";
    return { page: total, withoutFooter };
  });
}

const footerKnownIssue = (width: number, font: number) => font === 24 && width < 1280;

test.describe("header com a fonte do navegador em 16, 20 e 24px (F13)", () => {
  for (const font of FONTS) {
    for (const width of WIDTHS) {
      const layout = expectedLayout(width, font);
      test(`${width}px @ ${font}px (${layout}): sem rolagem lateral, CTA inteiro na tela`, async ({ page, isMobile }) => {
        test.skip(isMobile, "larguras de notebook: projeto desktop");
        await page.setViewportSize({ width, height: 800 });
        await setBrowserFontSize(page, font);
        for (const [, path] of HOMES) {
          await page.goto(path);
          const where = `${path} @ ${width}px, fonte ${font}px`;
          const m = await page.evaluate(() => {
            const root = document.documentElement;
            const shown = (el: Element | null): el is HTMLElement =>
              !!el && getComputedStyle(el).display !== "none" && el.getClientRects().length > 0;
            const header = document.querySelector<HTMLElement>(".site-header")!;
            const cta = document.querySelector<HTMLElement>("a.site-header__cta");
            const menu = [...document.querySelectorAll<HTMLElement>(".site-header .menu-toggle")].find(shown) ?? null;
            const label = cta ? [...cta.querySelectorAll<HTMLElement>(".resume-label__default")].find((n) => getComputedStyle(n).visibility !== "hidden") : undefined;
            const navItems = [...document.querySelectorAll<HTMLElement>(".site-header__nav .nav-list > li")].filter(shown);
            const actions = document.querySelector<HTMLElement>(".site-header__actions")!;
            const bar = document.querySelector<HTMLElement>("[data-sticky-bar]");
            const float = document.querySelector<HTMLElement>("[data-whatsapp-float]");
            const headerHeight = parseFloat(getComputedStyle(header).getPropertyValue("--header-height")) * parseFloat(getComputedStyle(root).fontSize);
            return {
              layout: shown(document.querySelector(".nav-dropdown")) ? "desktop" : shown(document.querySelector(".site-header__nav")) ? "tablet" : "mobile",
              viewport: root.clientWidth,
              headerHeight: header.getBoundingClientRect().height,
              maxHeaderHeight: headerHeight + 1, // + a borda inferior de 1px
              cta: shown(cta) ? { left: cta.getBoundingClientRect().left, right: cta.getBoundingClientRect().right } : null,
              labelLines: label ? Math.round(label.getBoundingClientRect().height / parseFloat(getComputedStyle(label).lineHeight)) : 0,
              menuRight: menu ? menu.getBoundingClientRect().right : null,
              navRight: navItems.length ? Math.max(...navItems.map((item) => item.getBoundingClientRect().right)) : 0,
              actionsLeft: actions.getBoundingClientRect().left,
              bar: bar ? getComputedStyle(bar).display : null,
              float: float ? getComputedStyle(float).display : null,
            };
          });

          expect(m.layout, `${where}: layout`).toBe(layout);
          const scroll = await overflow(page);
          expect(scroll.withoutFooter, `${where}: rolagem lateral (sem o rodapé)`).toBeLessThanOrEqual(0);
          if (!footerKnownIssue(width, font)) expect(scroll.page, `${where}: rolagem lateral`).toBeLessThanOrEqual(0);
          expect(m.headerHeight, `${where}: altura do header`).toBeLessThanOrEqual(m.maxHeaderHeight);

          if (layout === "mobile") {
            // Header só com logo e Menu; o CTA vem da barra fixa, que agora existe nessa largura.
            expect(m.cta, `${where}: CTA do header some no layout mobile`).toBeNull();
            expect(m.menuRight, `${where}: botão Menu na tela`).not.toBeNull();
            expect(m.menuRight!, `${where}: botão Menu na tela`).toBeLessThanOrEqual(m.viewport);
            expect(m.bar, `${where}: barra fixa ligada`).not.toBe("none");
            expect(m.float, `${where}: sem WhatsApp flutuante por cima da barra`).toBe("none");
            continue;
          }

          expect(m.cta, `${where}: CTA do header visível`).not.toBeNull();
          expect(m.cta!.left, `${where}: CTA começa na tela`).toBeGreaterThanOrEqual(0);
          expect(m.cta!.right, `${where}: CTA termina na tela`).toBeLessThanOrEqual(m.viewport);
          expect(m.labelLines, `${where}: rótulo do CTA numa linha`).toBe(1);
          expect(m.navRight, `${where}: menu não encosta nas ações`).toBeLessThanOrEqual(m.actionsLeft);
          if (m.bar !== null) expect(m.bar, `${where}: barra fixa só no layout mobile`).toBe("none");
          if (layout === "tablet") expect(m.menuRight, `${where}: botão Menu no tablet`).not.toBeNull();
        }
      });
    }
  }

  test("1024px @ 24px: a barra fixa aparece quando o CTA do hero sai da tela", async ({ page, isMobile }) => {
    test.skip(isMobile, "janela de notebook: projeto desktop");
    await page.setViewportSize({ width: 1024, height: 800 });
    await setBrowserFontSize(page, 24);
    for (const [, path] of HOMES) {
      await page.goto(path);
      const bar = page.locator("[data-sticky-bar]");
      await expect(bar, path).toHaveAttribute("data-state", "hidden");
      await page.evaluate(() => {
        const hero = document.querySelector('main a[data-cta-id="diagnosis"][data-origem="home-hero"]')!;
        window.scrollTo(0, hero.getBoundingClientRect().bottom + window.scrollY + 300);
      });
      await expect(bar, path).toHaveAttribute("data-state", "visible");
      await expect(bar.locator('a[data-cta-id="diagnosis"]'), path).toBeInViewport({ ratio: 1 });
    }
  });

  // O dropdown só existe no layout desktop: ≥ 64em = 1280px com 20px e 1536px com 24px.
  for (const [font, width] of [
    [20, 1280],
    [24, 1536],
  ] as const) {
    test(`dropdown de Serviços inteiro a ${width}px @ ${font}px (sem overflow: hidden no menu)`, async ({ page, isMobile }) => {
      test.skip(isMobile, "dropdown só no header de desktop");
      await page.setViewportSize({ width, height: 800 });
      await setBrowserFontSize(page, font);
      for (const [, path] of HOMES) {
        await page.goto(path);
        await page.locator("details[data-nav-dropdown] > summary").click();
        const panel = page.locator(".nav-dropdown__panel");
        await expect(panel, path).toBeVisible();
        const result = await panel.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const links = [...el.querySelectorAll<HTMLElement>("a")];
          const hidden = links
            .filter((link) => {
              const b = link.getBoundingClientRect();
              const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
              return !(hit && link.contains(hit));
            })
            .map((link) => link.textContent?.trim());
          return { links: links.length, hidden, right: box.right, bottom: box.bottom, viewport: document.documentElement.clientWidth, height: innerHeight };
        });
        expect(result.links, path).toBeGreaterThanOrEqual(5);
        expect(result.hidden, `${path}: links cortados ou cobertos`).toEqual([]);
        expect(result.right, path).toBeLessThanOrEqual(result.viewport);
        expect(result.bottom, path).toBeLessThanOrEqual(result.height);
        expect((await overflow(page)).page, `${path}: rolagem lateral`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test.describe("drawer com a fonte do navegador em 24px (F13)", () => {
  test("CTA fixo do drawer inteiro na tela, numa linha", async ({ page, isMobile }) => {
    // Desktop: 1024px @ 24px (layout mobile, drawer em tela cheia) e 1280px @ 24px (tablet, painel lateral).
    const sizes = isMobile ? [null] : [{ width: 1024, height: 800 }, { width: 1280, height: 800 }];
    await setBrowserFontSize(page, 24);
    for (const size of sizes) {
      if (size) await page.setViewportSize(size);
      for (const [, path] of HOMES) {
        await page.goto(path);
        const where = `${path} @ ${size ? `${size.width}px` : "celular"}`;
        await page.locator("button[data-drawer-open]").click();
        const dialog = page.locator("dialog[data-drawer]");
        await expect(dialog, where).toHaveAttribute("open", "");
        const cta = dialog.locator('a[data-cta-id="diagnosis"]');
        await expect(cta, where).toBeInViewport({ ratio: 1 });
        const lines = await cta.evaluate((el) => {
          const label = [...el.querySelectorAll<HTMLElement>(".resume-label__default, .resume-label__default > *")].find(
            (node) => getComputedStyle(node).display !== "none" && node.children.length === 0,
          );
          const target = label ?? (el as HTMLElement);
          return Math.round(target.getBoundingClientRect().height / (parseFloat(getComputedStyle(target).lineHeight) || 29));
        });
        expect(lines, `${where}: rótulo numa linha`).toBe(1);
        expect(await dialog.evaluate((el) => el.scrollWidth - el.clientWidth), `${where}: sem rolagem lateral no drawer`).toBeLessThanOrEqual(0);
        await page.keyboard.press("Escape");
        await expect(dialog, where).not.toHaveAttribute("open", "");
      }
    }
  });
});

// Pendência fora do F13 (que trata header, drawer, seletor e breakpoints.ts):
// o rodapé (Footer.astro) ainda tem @media em px; com 24px, a coluna de contato
// (botões em nowrap) vaza 30px (pt), 39px (en) e 61px (es) a 1024px, até ~1200px.
// Some quando o rodapé (e o resto do site) passar para em.
test.fixme("rodapé sem rolagem lateral a 1024–1200px @ 24px", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await setBrowserFontSize(page, 24);
  for (const [, path] of HOMES) {
    await page.goto(path);
    expect((await overflow(page)).page, path).toBeLessThanOrEqual(0);
  }
});
