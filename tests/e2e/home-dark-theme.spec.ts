/**
 * Tema escuro na Home (B208) — dono: home (tokens.css §2b). O shell liga o
 * tema antes do 1º paint (head-inline: prefers-color-scheme ou a escolha
 * salva) e o botão do rodapé; aqui se confere o que é da Home: com o sistema
 * no escuro, a página já abre escura e todo texto das seções da Home mantém
 * contraste AA sobre o fundo efetivo (também nas superfícies inverse e nos
 * cartões), nos 3 idiomas. Mesmo teste no claro, como linha de base.
 * Roda contra o build (playwright.config.ts) ou um deploy (E2E_NETLIFY_URL).
 */
import { expect, test } from "./support/consent";

interface Low {
  text: string;
  ratio: number;
  min: number;
}

/** Texto visível de main com contraste abaixo de AA (4.5:1; 3:1 em texto grande). */
const lowContrast = (): Low[] => {
  type Rgba = [number, number, number, number];
  const parse = (value: string): Rgba | null => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = (m[1] ?? "").split(/[\s,/]+/).filter(Boolean).map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
  };
  const over = (top: Rgba, bottom: Rgba): Rgba => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    const mix = (i: number) => (top[i]! * top[3] + bottom[i]! * bottom[3] * (1 - top[3])) / a;
    return [mix(0), mix(1), mix(2), a];
  };
  const background = (el: Element): Rgba => {
    let color: Rgba = [0, 0, 0, 0];
    for (let node: Element | null = el; node; node = node.parentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg[3] > 0) color = color[3] === 0 ? bg : over(color, bg);
      if (color[3] >= 1) return color;
    }
    return over(color, [255, 255, 255, 1]);
  };
  const lum = ([r, g, b]: Rgba) => {
    const c = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
  };
  const out: Low[] = [];
  const selector = "main h1, main h2, main h3, main p, main li, main a, main summary, main dt, main dd, main blockquote";
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    const own = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 1);
    if (!own) continue;
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (box.width === 0 || box.height === 0 || style.visibility === "hidden" || el.closest("[aria-hidden='true'], [hidden], .sr-only, [data-ficticio]")) continue;
    const fg = parse(style.color);
    if (!fg) continue;
    const bg = background(el);
    const text = over(fg, bg);
    const [l1, l2] = [lum(text), lum(bg)].sort((a, b) => b - a) as [number, number];
    const ratio = (l1 + 0.05) / (l2 + 0.05);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 600);
    const min = large ? 3 : 4.5;
    if (ratio < min - 0.05) out.push({ text: (el.textContent ?? "").trim().slice(0, 60), ratio: Math.round(ratio * 100) / 100, min });
  }
  return out;
};

for (const colorScheme of ["dark", "light"] as const) {
  test.describe(`Home no tema ${colorScheme === "dark" ? "escuro" : "claro"} (B208)`, () => {
    test.use({ colorScheme });

    for (const path of ["/", "/en/", "/es/"]) {
      test(`${path}: abre no tema do sistema e o texto das seções tem contraste AA`, async ({ page }) => {
        await page.goto(path);
        const theme = await page.evaluate(() => ({
          attr: document.documentElement.dataset.theme ?? "",
          scheme: getComputedStyle(document.documentElement).colorScheme,
          body: getComputedStyle(document.body).backgroundColor,
        }));
        if (colorScheme === "dark") {
          expect(theme.attr).toBe("dark");
          expect(theme.scheme).toContain("dark");
          expect(theme.body).toBe("rgb(10, 15, 43)"); // ink-950
        } else {
          expect(theme.attr).not.toBe("dark");
          expect(theme.body).toBe("rgb(255, 255, 255)");
        }
        expect(await page.evaluate(lowContrast)).toEqual([]);
      });
    }
  });
}
