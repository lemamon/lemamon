/**
 * Primitivos de UI nas seções do gated (dono: gated). Guarda estática, sem
 * build:
 *  - B218: o painel de código (src/styles/code.css: barra de janela, mono
 *    14px, respiro, raio) é importado pelas duas páginas que renderizam MDX,
 *    PostArticle e CaseArticle, e por NENHUM outro arquivo (B256: página sem
 *    MDX não carrega `pre.astro-code`). A camada fictícia tem um bloco ``` num
 *    post, para o caminho ser exercitado em dev e no build fictício;
 *  - B214: nenhuma seção do gated desenha o próprio cartão (borda de 1px +
 *    --radius-lg + padding/fundo; o raio fica só em imagem e vídeo) nem o
 *    próprio "texto + seta" (é o <ArrowLink>); os cartões usam <Card>;
 *  - B385: os valores de métrica do case (antes → depois) usam a mono com
 *    algarismos tabulares, como o .case-card__delta do CaseCard.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const CODE_CSS_IMPORT = /^import\s+["']@\/styles\/code\.css["'];?\s*$/m;

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(astro|ts|tsx|mjs|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, "");
/** Regras CSS do(s) <style> de um .astro: seletor → corpo (sem @media aninhado). */
function cssRules(source: string): Array<{ selector: string; body: string }> {
  const css = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => stripComments(match[1] ?? "")).join("\n");
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selector: (match[1] ?? "").trim(), body: match[2] ?? "" }));
}

/** Área do gated com CSS de seção (CONTRACT §11). */
const GATED_FILES = [
  ...readdirSync(join(SRC, "components", "gated"))
    .filter((name) => name.endsWith(".astro"))
    .map((name) => `src/components/gated/${name}`),
  "src/views/AboutView.astro",
  "src/views/BlogHubView.astro",
  "src/views/BlogPostView.astro",
  "src/views/CaseView.astro",
  "src/views/CasesHubView.astro",
];

describe("painel de código dos blocos ``` (B218, B256)", () => {
  it("PostArticle e CaseArticle importam @/styles/code.css", () => {
    for (const rel of ["src/components/gated/PostArticle.astro", "src/components/gated/CaseArticle.astro"]) {
      const frontmatter = read(rel).split(/^---$/m)[1] ?? "";
      expect(frontmatter, rel).toMatch(CODE_CSS_IMPORT);
    }
  });

  it("nenhum outro arquivo de src/ importa code.css (página sem MDX não carrega pre.astro-code)", () => {
    const importers = files(SRC)
      .filter((path) => CODE_CSS_IMPORT.test(readFileSync(path, "utf8")))
      .map((path) => relative(ROOT, path))
      .sort();
    expect(importers).toEqual(["src/components/gated/CaseArticle.astro", "src/components/gated/PostArticle.astro"]);
  });

  it("code.css traz respiro, raio, mono e a barra de janela de pre.astro-code", () => {
    const css = stripComments(read("src/styles/code.css"));
    const pre = css.match(/pre\.astro-code\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(pre).toMatch(/padding:\s*var\(--space-10\)/);
    expect(pre).toMatch(/border-radius:\s*var\(--radius-lg\)/);
    expect(pre).toMatch(/font-family:\s*var\(--font-mono\)/);
    expect(pre).toMatch(/font-size:\s*var\(--text-code\)/);
    expect(css).toMatch(/pre\.astro-code::before\s*\{[^}]*content:\s*""/);
  });

  it("a camada fictícia tem um bloco ```ts num post (exercita o painel em dev e no build fictício)", () => {
    expect(read("dados/ficticio/posts/exemplo-integrar-sistemas.mdx")).toMatch(/^```ts\n[\s\S]+?\n```$/m);
  });
});

describe("seções do gated usam os primitivos de UI (B214)", () => {
  it("nenhum cartão próprio: --radius-lg só em imagem e vídeo", () => {
    const problems: string[] = [];
    for (const rel of GATED_FILES) {
      for (const { selector, body } of cssRules(read(rel))) {
        if (!/--radius-lg/.test(body)) continue;
        if (/\b(img|video)\b/.test(selector)) continue;
        problems.push(`${rel}: ${selector}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("nenhum 'texto + seta' desenhado à mão: a seta vem do <ArrowLink>", () => {
    const problems = GATED_FILES.filter((rel) => /<Icon\s+name="arrow-right"/.test(read(rel)));
    expect(problems).toEqual([]);
  });

  it("os cartões do gated são <Card> (post, prova do método, resultado do case, crenças do Sobre)", () => {
    expect(read("src/components/gated/PostCard.astro")).toMatch(/<Card\s+as="a"[^>]*\binteractive\b[^>]*class="post-card"/);
    expect(read("src/components/gated/MethodProof.astro")).toMatch(/<Card\s+as="article"[^>]*class="proof-case"/);
    expect(read("src/components/gated/CaseArticle.astro")).toMatch(/<Card\s+as="li"[^>]*class="case-result"/);
    expect(read("src/views/AboutView.astro")).toMatch(/<Card\s+as="li"[^>]*class="belief"/);
  });
});

describe("valores de métrica do case na mono (B385)", () => {
  it(".case-result__values dd e .case-result__after: --font-mono + tabular-nums", () => {
    const rules = cssRules(read("src/components/gated/CaseArticle.astro"));
    for (const selector of [".case-result__values dd", ".case-result__after"]) {
      const body = rules.find((rule) => rule.selector === selector)?.body ?? "";
      expect(body, selector).toMatch(/font-family:\s*var\(--font-mono\)/);
      expect(body, selector).toMatch(/font-variant-numeric:\s*tabular-nums/);
    }
    const dt = rules.find((rule) => rule.selector === ".case-result__values dt")?.body ?? "";
    expect(dt).toMatch(/line-height:\s*var\(--leading-xs\)/);
  });
});
