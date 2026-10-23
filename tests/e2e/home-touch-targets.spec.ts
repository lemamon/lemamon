/**
 * Home e componentes compartilhados (dono: home) — alvos de toque da linha do
 * método (B084, BLUEPRINT §11), valores de métrica na mono (B385) e textos de
 * destaque sem palavra sozinha na última linha (painel de design).
 * Roda contra o build (playwright.config.ts) ou um deploy (E2E_NETLIFY_URL).
 */
import { expect, test, type Page } from "./support/consent";

/** Rotas com a linha do método linkada (variantes compact e full), nos 3 idiomas. */
const METHOD_ROUTES = [
  "/",
  "/como-trabalhamos",
  "/servicos",
  "/servicos/sistemas-web",
  "/servicos/aplicativos",
  "/servicos/integracoes",
  "/servicos/mvp",
  "/servicos/sustentacao",
  "/sprint-de-descoberta",
  "/en/",
  "/en/how-we-work",
  "/es/",
  "/es/como-trabajamos",
];

test.describe("linha do método: nome da etapa é alvo de toque ≥ 44×44 (B084)", () => {
  test("375px com toque: todo .mt__name a mede ≥ 44×44 e recebe o toque na borda", async ({ page, isMobile }) => {
    test.skip(!isMobile, "medida no mobile (toque)");
    await page.setViewportSize({ width: 375, height: 812 });
    let measured = 0;
    for (const path of METHOD_ROUTES) {
      await page.goto(path);
      const links = page.locator(".mt__name a");
      const total = await links.count();
      for (let i = 0; i < total; i++) {
        const link = links.nth(i);
        if (!(await link.isVisible())) continue;
        const result = await link.evaluate((el) => {
          // No meio da tela: longe do header fixo e da barra fixa do mobile.
          el.scrollIntoView({ block: "center", behavior: "instant" });
          const box = el.getBoundingClientRect();
          // A faixa extra (padding) é clicável: a etiqueta logo abaixo não a cobre.
          const hits = (y: number) => {
            const hit = document.elementFromPoint(box.left + Math.min(16, box.width / 2), y);
            return Boolean(hit && (hit === el || el.contains(hit)));
          };
          return {
            text: (el.textContent ?? "").trim(),
            width: Math.round(box.width),
            height: Math.round(box.height),
            edges: hits(box.top + 2) && hits(box.bottom - 2),
          };
        });
        expect(result.width, `${path} ${result.text}`).toBeGreaterThanOrEqual(44);
        expect(result.height, `${path} ${result.text}`).toBeGreaterThanOrEqual(44);
        expect(result.edges, `${path} ${result.text}: borda do alvo coberta`).toBe(true);
        measured++;
      }
    }
    expect(measured).toBeGreaterThanOrEqual(METHOD_ROUTES.length * 3);
  });

  test("o alvo maior não move o layout: a etiqueta fica onde ficaria com o link em linha", async ({ page }) => {
    for (const path of ["/", "/servicos/mvp", "/en/how-we-work"]) {
      await page.goto(path);
      const tops = () =>
        page.locator(".mt__stage .mt__tag").evaluateAll((tags) => tags.map((tag) => Math.round(tag.getBoundingClientRect().top + window.scrollY)));
      const withTarget = await tops();
      await page.addStyleTag({ content: ".mt__name a{display:inline!important;padding-block:0!important;margin-block:0!important}" });
      expect(await tops(), path).toEqual(withTarget);
    }
  });
});

test.describe("valores de métrica na mono (B385)", () => {
  test("card de case: antes → depois em var(--font-mono), com tabular-nums", async ({ page }) => {
    let checked = 0;
    for (const path of ["/", "/cases", "/en/cases", "/es/casos"]) {
      const response = await page.goto(path);
      if (!response || response.status() !== 200) continue;
      const fonts = await page
        .locator(".case-card__delta, .case-card__delta strong")
        .evaluateAll((els) => els.map((el) => [getComputedStyle(el).fontFamily, getComputedStyle(el).fontVariantNumeric]));
      for (const [family, numeric] of fonts) {
        expect(family, path).toMatch(/^ui-monospace/);
        expect(numeric, path).toContain("tabular-nums");
      }
      checked += fonts.length;
    }
    // Sem case com métrica publicado (dado real ainda vazio), não há o que medir.
    test.skip(checked === 0, "nenhum case com métrica antes → depois no ar");
  });
});

/** Destaques curtos da Home cujas quebras são controladas por text-wrap. */
const HIGHLIGHTS = [".risk__fear-text", ".risk__answer-text", ".faq__question", ".profile__text", ".commitments__list li > span:last-child"];

async function singleWordLastLines(page: Page): Promise<string[]> {
  return page.evaluate((selectors) => {
    const found: string[] = [];
    for (const el of document.querySelectorAll(selectors.join(","))) {
      if (!el.getClientRects().length) continue;
      const words: { word: string; bottom: number }[] = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (node.parentElement?.closest(".sr-only, [popover]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const match of (node.textContent ?? "").matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(node, match.index ?? 0);
          range.setEnd(node, (match.index ?? 0) + match[0].length);
          const rect = range.getClientRects()[0];
          if (rect) words.push({ word: match[0], bottom: rect.bottom });
        }
      }
      const lines: string[][] = [];
      let current: string[] = [];
      let lastBottom = Number.NaN;
      for (const { word, bottom } of words) {
        if (Math.abs(bottom - lastBottom) >= 4 || !current.length) {
          current = [];
          lines.push(current);
        }
        current.push(word);
        lastBottom = bottom;
      }
      const [lonely] = current;
      if (lines.length >= 2 && current.length === 1 && lonely && lonely.length > 1) {
        found.push(`${(el.textContent ?? "").trim().slice(0, 60)}… / ${lonely}`);
      }
    }
    return found;
  }, HIGHLIGHTS);
}

test.describe("Home: destaques sem palavra sozinha na última linha (painel de design)", () => {
  for (const width of [375, 1280]) {
    test(`${width}px: riscos, FAQ, perfis e compromissos nos 3 idiomas`, async ({ page, isMobile }) => {
      test.skip(isMobile !== width < 768, "cada largura roda no seu projeto");
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/en/", "/es/"]) {
        await page.goto(path);
        expect(await singleWordLastLines(page), `${path} a ${width}px`).toEqual([]);
      }
    });
  }
});
