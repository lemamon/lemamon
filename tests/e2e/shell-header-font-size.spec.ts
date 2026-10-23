/**
 * Header com a fonte do navegador ampliada (dono: shell) — F13 da
 * AUDITORIA-CONVERSAO. Com o "Tamanho da fonte" do Chrome em Grande (20px) ou
 * Muito grande (24px), o header de desktop (media queries em px) transbordava:
 * 151px de rolagem lateral em 1024@20, 293px em 1280@24, CTA fora da tela.
 * As @media do header, do drawer, da barra fixa, do WhatsApp flutuante e do
 * rodapé agora são em `em` (1em de @media = fonte padrão do navegador), e
 * NAV_QUERIES (src/styles/breakpoints.ts) também: com fonte maior, a janela cai
 * no layout de tela mais estreita (48em/64em/79.999em = 768/1024/1280px ×
 * fonte ÷ 16). O rodapé (40em/64em/80em) vazava até 90px a 1024–1280px @ 24px
 * pela coluna de contato (botões sem quebra de linha).
 *
 * Rode também contra o build com a camada fictícia (agenda, Cases e Sobre:
 * rótulos mais longos e o header data-crowded), que é o pior caso de largura.
 *
 * Page.setFontSizes (CDP) é o mesmo mecanismo do ajuste do Chrome; ele vale
 * para as navegações seguintes da mesma página. Com 16px, este spec repete as
 * larguras de notebook (1280, 1366, 1440) que o shell-header-cta.spec.ts não
 * cobre. Roda contra o build (playwright.config.ts) ou um deploy (E2E_NETLIFY_URL).
 */
import { expect, test, type Page } from "./support/consent";

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

/** Rolagem lateral da página inteira, rodapé incluído (scrollWidth − clientWidth). */
async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

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
          expect(await overflow(page), `${where}: rolagem lateral`).toBeLessThanOrEqual(0);
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
        expect(await overflow(page), `${path}: rolagem lateral`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test.describe("drawer com a fonte do navegador em 24px (F13)", () => {
  test("CTA fixo do drawer inteiro na tela (numa linha no desktop)", async ({ page, isMobile }) => {
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
        // No celular com 24px, o rótulo com agenda ("Agenda tu diagnóstico") pode
        // quebrar em 2 linhas dentro do botão: melhor que vazar. Com 16px,
        // shell-mobile.spec.ts exige uma linha.
        if (!isMobile) expect(lines, `${where}: rótulo numa linha`).toBe(1);
        expect(await dialog.evaluate((el) => el.scrollWidth - el.clientWidth), `${where}: sem rolagem lateral no drawer`).toBeLessThanOrEqual(0);
        await page.keyboard.press("Escape");
        await expect(dialog, where).not.toHaveAttribute("open", "");
      }
    }
  });
});

test.describe("rodapé com a fonte do navegador em 16, 20 e 24px (F13)", () => {
  // As larguras em que a coluna de contato vazava com @media em px (1024–1280px),
  // mais as bordas das faixas em em: 64em = 1280px @ 20 e 1536px @ 24; 80em =
  // 1600px @ 20 e 1920px @ 24. Com 16px, as bordas de sempre (40/64/80em).
  const CASES = [
    [16, [640, 1023, 1024, 1279, 1280]],
    [20, [1024, 1100, 1200, 1279, 1280, 1600]],
    [24, [1024, 1100, 1152, 1200, 1280, 1535, 1536, 1920]],
  ] as const;
  for (const [font, widths] of CASES) {
    test(`${font}px: sem rolagem lateral e botões de contato numa linha`, async ({ page, isMobile }) => {
      test.skip(isMobile, "larguras de notebook: projeto desktop");
      await setBrowserFontSize(page, font);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 800 });
        for (const [, path] of HOMES) {
          await page.goto(path);
          const where = `${path} @ ${width}px, fonte ${font}px`;
          expect(await overflow(page), `${where}: rolagem lateral`).toBeLessThanOrEqual(0);
          const buttons = await page.locator(".site-footer__actions > *").evaluateAll((items) =>
            items.map((item) => {
              const box = item.getBoundingClientRect();
              const column = item.closest(".site-footer__contact")!.getBoundingClientRect();
              const line = parseFloat(getComputedStyle(item).lineHeight) || 1;
              const text = [...item.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim());
              const range = document.createRange();
              if (text) range.selectNodeContents(text);
              // Altura do texto do rótulo (não a do botão, que tem altura mínima) ÷ entrelinha.
              const lines = text ? Math.round(range.getBoundingClientRect().height / line) : 0;
              return { label: (item.textContent ?? "").trim().slice(0, 40), inside: box.right <= column.right + 0.5, lines };
            }),
          );
          expect(buttons.length, where).toBeGreaterThanOrEqual(1);
          for (const button of buttons) {
            expect(button.inside, `${where}: "${button.label}" dentro da coluna de contato`).toBe(true);
            expect(button.lines, `${where}: "${button.label}" numa linha`).toBe(1);
          }
        }
      }
    });
  }
});
