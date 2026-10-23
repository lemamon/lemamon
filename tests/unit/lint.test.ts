/**
 * Lint de código (scripts/lint.mjs; backlog B251, B276) — dono: shell.
 * As três regras do 04-tecnico §8 (no-unnecessary-type-assertion, no-console,
 * jsx-a11y/alt-text), o pre-commit e o passo da CI.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { lint, PENDING, RULES, splitPending, syntaxProblems } from "../../scripts/lint.mjs";

const rules = (problems: { rule: string }[]) => problems.map((problem) => problem.rule);

describe("lint: no-console e no-debugger em src/", () => {
  it("console.log/info/debug reprova; console.error e console.warn passam", () => {
    const code = 'console.log("a");\nconsole.info("b");\nconsole.error("c");\nconsole.warn("d");\nconsole["debug"]("e");\n';
    const problems = syntaxProblems("src/lib/x.ts", code);
    expect(problems.map((p) => `${p.line}:${p.rule}`)).toEqual(["1:no-console", "2:no-console", "5:no-console"]);
  });

  it("depuração dentro de import.meta.env.DEV passa; com a condição negada, não", () => {
    expect(syntaxProblems("src/lib/x.ts", "if (import.meta.env.DEV) console.debug(1);\nimport.meta.env.DEV && console.log(2);\n")).toEqual([]);
    expect(rules(syntaxProblems("src/lib/x.ts", "if (!import.meta.env.DEV) console.log(1);\n"))).toEqual([RULES.console]);
    expect(rules(syntaxProblems("src/lib/x.ts", "if (import.meta.env.DEV) {} else { console.log(1); }\n"))).toEqual([RULES.console]);
  });

  it("debugger reprova", () => {
    expect(rules(syntaxProblems("src/lib/x.ts", "export function f() {\n  debugger;\n}\n"))).toEqual([RULES.debugger]);
  });

  it(".astro: frontmatter e <script> entram, JSON-LD não; a linha é a do arquivo", () => {
    const astro = '---\nconst a = 1;\nconsole.log(a);\n---\n<p>{a}</p>\n<script type="application/ld+json">{"console.log": 1}</script>\n<script>\n  console.info("x");\n</script>\n';
    expect(syntaxProblems("src/components/x.astro", astro).map((p) => `${p.line}:${p.rule}`)).toEqual(["3:no-console", "8:no-console"]);
  });

  it("testes e scripts de linha de comando ficam de fora", () => {
    expect(syntaxProblems("src/lib/x.test.ts", 'console.log("a");')).toEqual([]);
    expect(syntaxProblems("scripts/check-i18n.mjs", 'console.log("a");')).toEqual([]);
    expect(syntaxProblems("netlify/functions/csp-report.mjs", 'console.log("a");')).toEqual([]);
  });
});

describe("lint: jsx-a11y/alt-text nas ilhas", () => {
  it("<img> sem alt reprova; alt vazio passa; <input type=image> e <area> também", () => {
    expect(rules(syntaxProblems("src/islands/wizard/X.tsx", 'export const X = () => <img src="/a.png" />;'))).toEqual([RULES.alt]);
    expect(syntaxProblems("src/islands/wizard/X.tsx", 'export const X = () => <img src="/a.png" alt="" />;')).toEqual([]);
    expect(rules(syntaxProblems("src/islands/wizard/X.tsx", 'export const X = () => <input type="image" src="/a.png" />;'))).toEqual([RULES.alt]);
    expect(rules(syntaxProblems("src/islands/wizard/X.tsx", 'export const X = () => <map><area href="/a" /></map>;'))).toEqual([RULES.alt]);
  });
});

describe("lint: no-unnecessary-type-assertion (com tipo)", () => {
  const root = mkdtempSync(join(tmpdir(), "lint-tipos-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  const write = (rel: string, text: string) => {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  };
  write(
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: { strict: true, noUncheckedIndexedAccess: true, target: "ES2022", module: "ESNext", moduleResolution: "Bundler", noEmit: true, skipLibCheck: true },
      include: ["src/**/*"],
    }),
  );

  it("`x as string` sobre uma string e `n!` sobre um number reprovam", () => {
    write("src/a.ts", "const s: string = String(1);\nexport const y = s as string;\nconst n: number = Number(s);\nexport const m = n!;\n");
    const problems = lint({ root, files: ["src/a.ts"] });
    expect(problems.map((p) => `${p.line}:${p.rule}`)).toEqual(["2:no-unnecessary-type-assertion", "4:no-unnecessary-type-assertion"]);
  });

  it("asserção que muda o tipo, as const, literal e índice com noUncheckedIndexedAccess passam", () => {
    write(
      "src/b.ts",
      [
        "const u: unknown = JSON.parse('1');",
        "export const a = u as string;",
        "export const b = ['x'] as const;",
        "export const c = 'a' as string;",
        "const list: string[] = [];",
        "export const d = list[0]!;",
        "export const e = (document.body as HTMLElement | null)!;",
        "export function f<T>(value: T) { return value!; }",
        "",
      ].join("\n"),
    );
    expect(lint({ root, files: ["src/b.ts"] })).toEqual([]);
  });
});

describe("lint: pendências de outros donos (PENDING)", () => {
  it("separa pendência conhecida, problema novo e pendência que já foi corrigida", () => {
    const pending = [
      { file: "src/a.ts", rule: RULES.assertion, code: "x as  string", owner: "home" },
      { file: "src/b.ts", rule: RULES.assertion, code: "y as number", owner: "gated" },
    ];
    const problems = [
      { file: "src/a.ts", line: 1, col: 1, rule: RULES.assertion, message: "", code: "x as string" },
      { file: "src/a.ts", line: 2, col: 1, rule: RULES.assertion, message: "", code: "z as string" },
    ];
    const { fresh, known, stale } = splitPending(problems, pending);
    expect(known.map((p) => p.line)).toEqual([1]);
    expect(fresh.map((p) => p.line)).toEqual([2]);
    expect(stale.map((entry) => entry.file)).toEqual(["src/b.ts"]);
  });

  it("toda pendência é de arquivo existente de OUTRO dono", () => {
    for (const entry of PENDING) {
      expect(statSync(entry.file).isFile(), entry.file).toBe(true);
      expect(entry.owner).not.toBe("shell");
    }
  });

  it("o projeto passa no lint (fora as pendências pedidas aos donos)", () => {
    const { fresh } = splitPending(lint());
    expect(fresh.map((p) => `${p.file}:${p.line} ${p.rule} ${p.message}`)).toEqual([]);
  }, 60_000);
});

describe("lint: yarn lint, pre-commit e CI (B251, B276)", () => {
  it("package.json tem lint e prepare (liga o .githooks no yarn install)", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { scripts: Record<string, string> };
    expect(pkg.scripts.lint).toBe("node scripts/lint.mjs");
    expect(pkg.scripts.prepare).toBe("node scripts/git-hooks.mjs");
  });

  it("o pre-commit é executável e roda o lint nos arquivos em stage", () => {
    const hook = ".githooks/pre-commit";
    expect(statSync(hook).mode & 0o111).not.toBe(0);
    expect(readFileSync(hook, "utf8")).toMatch(/^exec node scripts\/lint\.mjs --staged$/m);
    expect(readFileSync("scripts/git-hooks.mjs", "utf8")).toContain('"core.hooksPath", HOOKS');
  });

  it("a CI roda o lint entre a paridade do i18n e o astro check", () => {
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    const order = ["yarn i18n:check", "yarn lint", "yarn run check", "yarn test"].map((step) => ci.indexOf(`run: ${step}`));
    expect(order.every((index) => index > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});
