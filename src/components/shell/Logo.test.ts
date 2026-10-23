/**
 * Logo (B221, B094): a marca em produção continua o símbolo {L} + "Lemamon"; o
 * wordmark "lemamon.dev" é PROTÓTIPO da decisão D34 (playbook 15), mora em
 * Wordmark.astro e nenhum arquivo do site o importa — então o CSS dele (e o
 * @keyframes do cursor) não chega ao bundle global.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Logo from "./Logo.astro";
import Wordmark from "./Wordmark.astro";

async function render(component: typeof Logo | typeof Wordmark, props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(component, { props: { locale: "pt", ...props } });
}

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(astro|ts|tsx|mdx?)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });

describe("Logo.astro", () => {
  it("símbolo {L} + nome, sem nada do wordmark", async () => {
    const html = await render(Logo, {});
    expect(html).toContain('class="logo__mark"');
    expect(html).toContain("Lemamon");
    expect(html).not.toContain("wordmark");
    const source = readFileSync(join(process.cwd(), "src", "components", "shell", "Logo.astro"), "utf8");
    // Nada do protótipo no CSS que vai a toda página.
    expect(source).not.toMatch(/\.wordmark|@keyframes/);
  });
});

describe("Wordmark.astro (protótipo da D34)", () => {
  it("'lemamon' + '.dev' do domínio, decorativo, cursor só quando pedido", async () => {
    const html = await render(Wordmark, { surface: "dark" });
    expect(html).toMatch(/class="wordmark[^"]*"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*class="wordmark/);
    expect(html).toMatch(/wordmark__name[^>]*>lemamon</);
    expect(html).toMatch(/wordmark__tld[^>]*>\.dev</);
    expect(html).not.toContain("wordmark__cursor");
    expect(await render(Wordmark, { cursor: true })).toContain("wordmark__cursor");
  });

  it("nenhum arquivo do site importa o wordmark antes da D34 (o CSS dele não vai ao ar)", () => {
    const users = sourceFiles(join(process.cwd(), "src"))
      .filter((file) => !file.endsWith("Wordmark.astro"))
      .filter((file) => /(?:from|import)\s*["'][^"']*Wordmark(?:\.astro)?["']|variant=["']wordmark["']/.test(readFileSync(file, "utf8")));
    expect(users).toEqual([]);
  });
});
