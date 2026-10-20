/**
 * Termo explicado + pontuação (B001) — dono: home. O termo do toggletip é um
 * <button> (caixa atômica): sem cuidado, o "." depois de "MVPs" caía sozinho
 * no começo da linha seguinte no subtítulo do hero (pt, 360px). <TermText>
 * cola a pontuação no termo (glueTermPunctuation + .no-break).
 * Roda contra o build (playwright.config.ts) ou um deploy (E2E_NETLIFY_URL).
 */
import { expect, test, type Page } from "@playwright/test";

const WIDTHS = [320, 360, 375, 390, 414];
const HOMES = ["/", "/en/", "/es/"];

interface Glue {
  term: string;
  next: string;
  termTop: number;
  nextTop: number;
}

/** Todo .term-tip seguido de pontuação: topo do termo × topo do 1º caractere seguinte. */
async function termsBeforePunctuation(page: Page, scope = "main"): Promise<Glue[]> {
  return page.locator(scope).evaluate((root) => {
    const out: Glue[] = [];
    for (const tip of root.querySelectorAll<HTMLElement>(".term-tip")) {
      const next = tip.nextSibling;
      if (!(next instanceof Text) || !/^[.,;:!?)]/.test(next.data)) continue;
      const button = tip.querySelector("button");
      if (!button) continue;
      const range = document.createRange();
      range.setStart(next, 0);
      range.setEnd(next, 1);
      out.push({
        term: (button.textContent ?? "").trim(),
        next: next.data.slice(0, 1),
        termTop: button.getBoundingClientRect().top,
        nextTop: range.getBoundingClientRect().top,
      });
    }
    return out;
  });
}

test.describe("termo explicado não se separa da pontuação (B001)", () => {
  test("hero da Home em 360×640: o ponto depois do termo fica na mesma linha", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");
    const glued = await termsBeforePunctuation(page, "#inicio");
    expect(glued.length, "o subtítulo do hero tem termo seguido de pontuação").toBeGreaterThan(0);
    for (const item of glued) {
      expect(Math.abs(item.nextTop - item.termTop), `"${item.term}" + "${item.next}"`).toBeLessThanOrEqual(4);
    }
  });

  test("Home nos 3 idiomas, de 320 a 414px: nenhum termo deixa a pontuação na linha de baixo", async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of HOMES) {
        await page.goto(path);
        for (const item of await termsBeforePunctuation(page)) {
          expect(Math.abs(item.nextTop - item.termTop), `${path} ${width}px "${item.term}" + "${item.next}"`).toBeLessThanOrEqual(4);
        }
      }
    }
  });
});
