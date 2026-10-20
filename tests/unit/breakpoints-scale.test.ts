/**
 * Uma escala só de breakpoints (backlog B079; CONTRACT §9): todo @media com
 * largura em src/ usa um valor de src/styles/breakpoints.ts (xs 380 · sm 640 ·
 * md 768 · lg 1024 · xl 1280 · 2xl 1536), em min-width, ou o mesmo valor menos
 * 0,02px em max-width (767.98px). Largura em em/rem num @media também reprova:
 * a escala é em px. Container queries (@container) ficam fora: medem o
 * componente, não a tela. Dono: shell.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { BREAKPOINTS } from "@/styles/breakpoints";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/**
 * Violações conhecidas, com dono e pedido feito (não podem crescer). Entrada que
 * já não viola é ignorada, então corrigir não quebra o teste.
 */
const PENDENTES: Record<string, string> = {};

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return /\.(astro|css)$/.test(name) ? [full] : [];
  });
}

const allowed = new Set<number>(Object.values(BREAKPOINTS).flatMap((value) => [value, Number((value - 0.02).toFixed(2))]));

/** Larguras de @media de um arquivo: { valor, unidade, linha }. */
function mediaWidths(source: string): { value: number; unit: string; line: number }[] {
  const out: { value: number; unit: string; line: number }[] = [];
  for (const media of source.matchAll(/@media\b([^{]*)\{/g)) {
    const line = source.slice(0, media.index ?? 0).split("\n").length;
    for (const width of (media[1] ?? "").matchAll(/(?:min|max)-width\s*:\s*([0-9.]+)\s*([a-z%]*)/gi)) {
      out.push({ value: Number(width[1]), unit: (width[2] ?? "").toLowerCase(), line });
    }
  }
  return out;
}

describe("escala única de breakpoints (B079)", () => {
  it("todo @media de src/**/*.{astro,css} usa a escala de breakpoints.ts", () => {
    const problems: string[] = [];
    let total = 0;
    for (const file of files(SRC)) {
      const rel = relative(ROOT, file).split("\\").join("/");
      for (const { value, unit, line } of mediaWidths(readFileSync(file, "utf8"))) {
        total++;
        if (unit === "px" && allowed.has(value)) continue;
        if (PENDENTES[`${rel}:${value}`]) continue;
        problems.push(`${rel}:${line}: ${value}${unit} fora da escala (${[...allowed].sort((a, b) => a - b).join(", ")} px)`);
      }
    }
    expect(total).toBeGreaterThan(50);
    expect(problems).toEqual([]);
  });

  it("acha largura fora da escala, em px ou em rem", () => {
    const widths = mediaWidths("@media (min-width: 768px) and (max-width: 479.98px) {} @media (min-width: 40rem) {} @container (min-width: 33px) {}");
    expect(widths.map((w) => `${w.value}${w.unit}`)).toEqual(["768px", "479.98px", "40rem"]);
  });
});
