/**
 * Design tokens (src/styles/tokens.css, 03-ui §3.3). Dono: home.
 *  - todo var(--x) sem fallback usado em src/ existe (token, propriedade local
 *    do componente ou definida por script): tirar token sem uso não pode
 *    deixar estilo apontando para o nada;
 *  - nenhum token de tokens.css fica sem uso (B256: o arquivo vai no CSS de
 *    TODA página; as cores do tema de código, --astro-code-*, são usadas pelo
 *    HTML que o Shiki gera e contam como uso);
 *  - nenhum font-size literal fora de tokens.css (B181): todo tamanho vem da
 *    escala (var(--text-*)), ou é `inherit`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const TOKENS = join(SRC, "styles", "tokens.css");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(astro|css|ts|tsx|mjs)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, "");
const files = sourceFiles(SRC).map((path) => ({ path, rel: relative(ROOT, path), code: stripComments(readFileSync(path, "utf8")) }));
const tokensCss = stripComments(readFileSync(TOKENS, "utf8"));

/** Nomes definidos: declaração `--x:` (CSS, style inline) ou string "--x" (setProperty, objetos de estilo). */
const defined = new Set<string>();
for (const { code } of files) {
  for (const match of code.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) defined.add(match[1] ?? "");
  for (const match of code.matchAll(/["'`](--[a-zA-Z0-9-]+)["'`]/g)) defined.add(match[1] ?? "");
}

describe("tokens.css — todo var() aponta para algo que existe", () => {
  it("nenhum var(--x) sem fallback em src/ fica sem definição", () => {
    const missing: string[] = [];
    for (const { rel, code } of files) {
      for (const match of code.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*([,)])/g)) {
        if (match[2] === ",") continue; // com fallback: indefinido é previsto
        if (!defined.has(match[1] ?? "")) missing.push(`${rel}: ${match[1]}`);
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });
});

describe("tokens.css — só token em uso (B256)", () => {
  it("todo token de tokens.css é usado em src/ (direto ou por outro token em uso)", () => {
    const names = [...new Set([...tokensCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1] ?? ""))];
    const others = files.filter(({ path }) => path !== TOKENS).map(({ code }) => code).join("\n");
    const usedIn = (name: string, code: string) => new RegExp(`var\\(\\s*${name}\\s*[,)]`).test(code) || code.includes(`"${name}"`);
    const used = new Set(names.filter((name) => name.startsWith("--astro-code-") || usedIn(name, others)));
    // Fecho: um token em uso torna usados os tokens que ele referencia.
    const bodies = new Map<string, string[]>();
    for (const match of tokensCss.matchAll(/(--[a-z0-9-]+)\s*:([^;]+);/g)) {
      bodies.set(match[1] ?? "", [...(bodies.get(match[1] ?? "") ?? []), match[2] ?? ""]);
    }
    for (let changed = true; changed; ) {
      changed = false;
      for (const name of [...used]) {
        for (const body of bodies.get(name) ?? []) {
          for (const ref of body.matchAll(/var\((--[a-z0-9-]+)/g)) {
            if (!used.has(ref[1] ?? "")) {
              used.add(ref[1] ?? "");
              changed = true;
            }
          }
        }
      }
    }
    expect(names.filter((name) => !used.has(name)), "token sem uso: tire de tokens.css (ou use)").toEqual([]);
  });
});

describe("tipografia — nenhum font-size literal fora de tokens.css (B181)", () => {
  it("todo font-size de src/ é var(--text-*) (ou outro token) ou inherit", () => {
    const literals: string[] = [];
    for (const { rel, path, code } of files) {
      if (path === TOKENS) continue;
      for (const match of code.matchAll(/font-size\s*:\s*([^;}"'\n]+)/g)) {
        const value = (match[1] ?? "").trim();
        if (/^var\(--/.test(value) || value === "inherit") continue;
        literals.push(`${rel}: font-size: ${value}`);
      }
    }
    expect(literals).toEqual([]);
  });

  it("os blocos de código usam os tokens da escala (--text-code = degrau de 14px, com a altura de linha do mesmo degrau)", () => {
    expect(tokensCss).toMatch(/--text-code:\s*var\(--text-sm\);/);
    expect(tokensCss).toMatch(/--leading-code:\s*var\(--leading-sm\);/);
    const code = stripComments(readFileSync(join(SRC, "styles", "code.css"), "utf8"));
    expect(code).toMatch(/pre\.astro-code\s*\{[^}]*font-size:\s*var\(--text-code\);[^}]*line-height:\s*var\(--leading-code\);/);
    // O painel de código não vai no pacote de toda página (B256).
    expect(stripComments(readFileSync(join(SRC, "styles", "global.css"), "utf8"))).not.toMatch(/pre\.astro-code/);
  });
});
