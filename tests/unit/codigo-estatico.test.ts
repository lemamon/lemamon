/**
 * Guarda estática mínima do código de src/ (dono: shell), enquanto o ESLint
 * não entra (backlog B251: pede dependências novas): roda no `yarn test`, logo
 * na CI (.github/workflows/ci.yml). O astro check em modo strict cobre os tipos.
 *  - nada de console.log/info/debug que vá ao ar (só console.error/warn; o
 *    console.debug protegido por import.meta.env.DEV na mesma linha é permitido);
 *  - nada de `debugger`, `@ts-ignore` ou `@ts-nocheck`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return /\.(ts|tsx|astro|mjs|js)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe("código de src/ sem resto de depuração", () => {
  it("sem console.log/info/debug fora de import.meta.env.DEV, sem debugger e sem @ts-ignore", () => {
    const problems: string[] = [];
    for (const file of files(join(ROOT, "src"))) {
      const rel = relative(ROOT, file);
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          const code = line.replace(/\/\/.*$/, "");
          if (/\bconsole\.(log|info|debug|trace|table)\s*\(/.test(code) && !/import\.meta\.env\.DEV/.test(code)) {
            problems.push(`${rel}:${index + 1}: ${line.trim()}`);
          }
          if (/^\s*debugger\s*;?\s*$/.test(code)) problems.push(`${rel}:${index + 1}: debugger`);
          if (/@ts-(ignore|nocheck)\b/.test(line)) problems.push(`${rel}:${index + 1}: ${line.trim()}`);
        });
    }
    expect(problems).toEqual([]);
  });
});
