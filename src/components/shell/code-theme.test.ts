/**
 * Blocos de código de MDX (blog e cases) com a paleta da marca — backlog B218.
 * O astro.config.mjs usa o tema "css-variables" do Shiki (o mdx() herda): o
 * HTML sai com var(--astro-code-*) em vez das cores inline do "github-dark"
 * (que venciam o CSS), e cada variável usada existe em tokens.css §6c.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import config from "../../../astro.config.mjs";

describe("tema dos blocos de código (B218)", () => {
  it("markdown.shikiConfig.theme = css-variables no astro.config", () => {
    expect(config.markdown?.shikiConfig?.theme).toBe("css-variables");
  });

  it("o HTML usa os tokens --astro-code-* de tokens.css, sem cor inline", async () => {
    const { createShikiHighlighter } = await import("@astrojs/internal-helpers/shiki");
    const highlighter = await createShikiHighlighter({ theme: config.markdown?.shikiConfig?.theme });
    const html = await highlighter.codeToHtml('const answer: number = 42; // ok\nexport function f() { return "x"; }', "ts");
    expect(html).toMatch(/<pre class="astro-code css-variables"/);
    expect(html).toContain("var(--astro-code-token-keyword)");
    expect(html).not.toMatch(/#[0-9a-f]{6}/i);
    const tokens = readFileSync(join(process.cwd(), "src", "styles", "tokens.css"), "utf8");
    const used = new Set([...html.matchAll(/var\((--astro-code-[a-z-]+)\)/g)].map((match) => match[1]));
    for (const name of used) expect(tokens, name).toMatch(new RegExp(`${name}:`));
  });
});
