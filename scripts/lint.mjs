/**
 * Lint de código (backlog B251, B276) — dono: shell. `yarn lint`.
 *
 * Por que um script e não o ESLint: o ESLint 9 + typescript-eslint +
 * jsx-a11y + react-hooks pedem 8 devDependencies novas, e o yarn.lock só muda
 * com `yarn install` (a CI instala congelado). Este lint usa só o TypeScript
 * que o projeto já tem e aplica as TRÊS regras que o 04-tecnico §8 pede, com a
 * mesma semântica das regras do ESLint:
 *
 *   no-unnecessary-type-assertion  (@typescript-eslint, com tipo) — em todo .ts
 *       e .tsx do tsconfig: `x as T` quando x JÁ é do tipo T, e `x!` quando x
 *       já não pode ser null/undefined. Fica de fora, como no
 *       typescript-eslint: `as const`, cast para tipo literal e tipo que o
 *       checker não resolveu (import de .astro em .ts).
 *   no-console  { allow: ["error", "warn"] } — em src/ (o que vai ao ar),
 *       .ts, .tsx, .mjs, .js e o frontmatter e os <script> dos .astro; também
 *       `debugger` (no-debugger). Exceção: chamada dentro de
 *       `if (import.meta.env.DEV)` ou `import.meta.env.DEV && …` (o Vite
 *       remove no build). Testes (*.test.ts) e scripts de linha de comando
 *       (scripts/, netlify/functions/) imprimem por natureza e ficam de fora.
 *   jsx-a11y/alt-text — nas ilhas React (src/islands/**\/*.tsx): <img> sem
 *       alt, <area> sem alt/aria-label e <input type="image"> sem alt. Nas
 *       páginas .astro quem confere é o verify-build (critério 9), no HTML
 *       publicado, inclusive o que vem do Markdown.
 *
 * Saída: `arquivo:linha:coluna  regra  mensagem`; código 1 se houver problema.
 *   node scripts/lint.mjs              projeto inteiro
 *   node scripts/lint.mjs a.ts b.astro só esses arquivos
 *   node scripts/lint.mjs --staged     só os arquivos em stage (pre-commit:
 *                                      .githooks/pre-commit, ativado no
 *                                      `yarn install` por scripts/git-hooks.mjs)
 *
 * Fora do escopo por enquanto (pedem o ESLint de verdade): react-hooks
 * (rules-of-hooks, exhaustive-deps) e a formatação (Prettier). Quando as
 * devDependencies entrarem, este arquivo vira o eslint.config.js com as
 * mesmas três regras e o `yarn lint` passa a chamar o eslint.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import ts from "typescript";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const RULES = {
  assertion: "no-unnecessary-type-assertion",
  console: "no-console",
  debugger: "no-debugger",
  alt: "jsx-a11y/alt-text",
};

/**
 * Pendências conhecidas em arquivos de OUTROS donos (CONTRACT §12: o shell não
 * edita), pedidas no retorno do shell em que o lint entrou (B251). Saem como
 * aviso, não derrubam o lint; qualquer problema NOVO derruba. Cada entrada
 * casa pelo arquivo, pela regra e pelo trecho de código (não pela linha, que
 * muda). Quando o dono corrigir, o lint avisa que a entrada sobrou: apague-a.
 */
export const PENDING = [
  { file: "src/components/contact/contact-form.ts", rule: RULES.assertion, code: "control(first) as HTMLElement | null", owner: "conversion" },
  { file: "src/components/shared/faq.ts", rule: RULES.assertion, code: "key as keyof typeof DRAFT_FLAG", owner: "home" },
  { file: "src/config/dono.ts", rule: RULES.assertion, code: "secoesFicticias as Readonly<Record<string, unknown>>", owner: "gated" },
  {
    file: "src/islands/wizard/model.ts",
    rule: RULES.assertion,
    code: "list(record.build_type).filter((id) => includes(BUILD_TYPES, id)) as BuildType[]",
    owner: "conversion",
  },
  { file: "src/islands/wizard/model.ts", rule: RULES.assertion, code: "list(record.pain).filter((id) => includes(PAINS, id)).slice(0, 3) as Pain[]", owner: "conversion" },
  {
    file: "src/islands/wizard/model.ts",
    rule: RULES.assertion,
    code: "list(record.system_pain).filter((id) => includes(SYSTEM_PAINS, id)).slice(0, 3) as SystemPain[]",
    owner: "conversion",
  },
];

/** console.* permitidos em src/ (o mesmo allow do no-console pedido no B251). */
const ALLOWED_CONSOLE = new Set(["error", "warn"]);

const IGNORED_DIRS = /^(node_modules|dist[^/]*|\.astro|test-results|playwright-report|coverage|legacy|public)\//;

const posix = (path) => path.split(sep).join("/");

/** Onde cada regra vale (caminho relativo à raiz, com "/"). */
export const scope = {
  assertion: (rel) => /\.(ts|tsx)$/.test(rel) && !rel.endsWith(".d.ts") && !IGNORED_DIRS.test(rel),
  console: (rel) => rel.startsWith("src/") && /\.(ts|tsx|mjs|js|astro)$/.test(rel) && !/\.test\.(ts|tsx)$/.test(rel),
  alt: (rel) => rel.startsWith("src/islands/") && rel.endsWith(".tsx"),
};

function isErrorType(type) {
  return (type.flags & ts.TypeFlags.Any) !== 0 && type.intrinsicName === "error";
}

/** O tipo pode ser null/undefined? Na dúvida (any, unknown, genérico), sim: nada de falso positivo. */
function couldBeNullish(type) {
  const parts = type.isUnion() ? type.types : [type];
  const maybe =
    ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Instantiable;
  return parts.some((part) => (part.flags & maybe) !== 0);
}

const isLiteral = (type) => type.isLiteral() || (type.flags & (ts.TypeFlags.BooleanLiteral | ts.TypeFlags.EnumLiteral)) !== 0;

const isConstAssertion = (typeNode) =>
  ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName) && typeNode.typeName.text === "const";

/** Regra no-unnecessary-type-assertion num arquivo do programa. */
function assertionProblems(sf, checker) {
  const out = [];
  const visit = (node) => {
    if (ts.isNonNullExpression(node)) {
      const type = checker.getTypeAtLocation(node.expression);
      if (!isErrorType(type) && !couldBeNullish(type)) {
        out.push({ node, rule: RULES.assertion, message: `"!" desnecessário: a expressão já é ${checker.typeToString(type)}, sem null/undefined` });
      }
    } else if ((ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) && !isConstAssertion(node.type)) {
      const cast = checker.getTypeAtLocation(node);
      const uncast = checker.getTypeAtLocation(node.expression);
      if (cast === uncast && !isErrorType(cast) && !isLiteral(cast)) {
        out.push({ node, rule: RULES.assertion, message: `asserção desnecessária: a expressão já é ${checker.typeToString(cast)}` });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

const DEV_GUARD = /^import\.meta\.env\.DEV(?:&&|$)/;

/** Regras no-console e no-debugger num trecho de código (arquivo ou bloco de .astro). */
function consoleProblems(sf) {
  const out = [];
  const isDev = (expr) => DEV_GUARD.test(expr.getText(sf).replace(/\s+/g, ""));
  const visit = (node, guarded) => {
    if (ts.isDebuggerStatement(node)) out.push({ node, rule: RULES.debugger, message: "debugger esquecido" });
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      let method = null;
      if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === "console") {
        method = callee.name.text;
      } else if (
        ts.isElementAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === "console" &&
        ts.isStringLiteralLike(callee.argumentExpression)
      ) {
        method = callee.argumentExpression.text;
      }
      if (method !== null && !ALLOWED_CONSOLE.has(method) && !guarded) {
        out.push({ node, rule: RULES.console, message: `console.${method} vai ao ar (só console.error e console.warn; depuração: dentro de if (import.meta.env.DEV))` });
      }
    }
    if (ts.isIfStatement(node) && isDev(node.expression)) {
      visit(node.expression, guarded);
      visit(node.thenStatement, true);
      if (node.elseStatement) visit(node.elseStatement, guarded);
      return;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && isDev(node.left)) {
      visit(node.left, guarded);
      visit(node.right, true);
      return;
    }
    ts.forEachChild(node, (child) => visit(child, guarded));
  };
  visit(sf, false);
  return out;
}

/** Regra jsx-a11y/alt-text num .tsx. */
function altProblems(sf) {
  const out = [];
  const visit = (node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tag = node.tagName.getText(sf);
      const attrs = node.attributes.properties;
      const attr = (name) => attrs.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === name);
      const has = (name) => attr(name) !== undefined;
      const typeAttr = attr("type");
      const isImageInput =
        tag === "input" && typeAttr?.initializer !== undefined && ts.isStringLiteral(typeAttr.initializer) && typeAttr.initializer.text === "image";
      if (tag === "img" && !has("alt")) out.push({ node, rule: RULES.alt, message: '<img> sem alt (use alt="" se for decorativa)' });
      if (tag === "area" && !has("alt") && !has("aria-label") && !has("aria-labelledby")) out.push({ node, rule: RULES.alt, message: "<area> sem alt" });
      if (isImageInput && !has("alt") && !has("aria-label") && !has("aria-labelledby")) out.push({ node, rule: RULES.alt, message: '<input type="image"> sem alt' });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/** Trechos de código de um .astro: frontmatter e <script> (menos JSON e set:html), com o deslocamento no arquivo. */
export function astroBlocks(text) {
  const blocks = [];
  let template = text;
  let templateStart = 0;
  const front = /^\s*---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (front) {
    blocks.push({ code: front[1] ?? "", start: front.index + front[0].indexOf(front[1] ?? "") });
    templateStart = front.index + front[0].length;
    template = text.slice(templateStart);
  }
  for (const match of template.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1] ?? "";
    if (/\btype\s*=\s*["']?application\/(ld\+)?json/i.test(attrs) || /\bset:html\b/.test(attrs)) continue;
    const body = match[2] ?? "";
    blocks.push({ code: body, start: templateStart + (match.index ?? 0) + match[0].indexOf(">") + 1 });
  }
  return blocks;
}

function lineCol(text, offset) {
  const before = text.slice(0, offset);
  const line = before.split("\n").length;
  return { line, col: offset - before.lastIndexOf("\n") };
}

/** Problemas de no-console/no-debugger (e alt-text nas ilhas) num arquivo, só com a sintaxe. */
export function syntaxProblems(rel, text) {
  const problems = [];
  const report = (list, fileText, offset, sf) => {
    for (const { node, rule, message } of list) {
      const { line, col } = lineCol(fileText, offset + node.getStart(sf));
      problems.push({ file: rel, line, col, rule, message, code: node.getText(sf) });
    }
  };
  if (rel.endsWith(".astro")) {
    if (!scope.console(rel)) return problems;
    for (const block of astroBlocks(text)) {
      const sf = ts.createSourceFile(`${rel}.ts`, block.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      report(consoleProblems(sf), text, block.start, sf);
    }
    return problems;
  }
  const kind = rel.endsWith(".tsx") ? ts.ScriptKind.TSX : rel.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, kind);
  if (scope.console(rel)) report(consoleProblems(sf), text, 0, sf);
  if (scope.alt(rel)) report(altProblems(sf), text, 0, sf);
  return problems;
}

/**
 * Problemas de no-unnecessary-type-assertion de um programa, só nos arquivos pedidos (relativos à raiz).
 * @param {import("typescript").Program} program
 * @param {string} root
 * @param {Set<string> | null} [wanted]
 */
export function typeProblems(program, root, wanted = null) {
  const checker = program.getTypeChecker();
  const problems = [];
  for (const sf of program.getSourceFiles()) {
    const rel = posix(relative(root, sf.fileName));
    if (rel.startsWith("..") || !scope.assertion(rel) || (wanted && !wanted.has(rel))) continue;
    for (const { node, rule, message } of assertionProblems(sf, checker)) {
      const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      problems.push({ file: rel, line: line + 1, col: character + 1, rule, message, code: node.getText(sf) });
    }
  }
  return problems;
}

/** Programa do TypeScript a partir do tsconfig.json da raiz. */
export function projectProgram(root = ROOT) {
  const host = {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    },
  };
  const parsed = ts.getParsedCommandLineOfConfigFile(join(root, "tsconfig.json"), { noEmit: true }, host);
  if (!parsed) throw new Error("lint: tsconfig.json ilegível");
  return ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
}

/** Arquivos do projeto que o lint olha (relativos à raiz), pelo git: versionados e novos, menos os ignorados. */
function projectFiles(root) {
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" });
  return out.split("\0").filter((rel) => rel && existsSync(join(root, rel)));
}

function stagedFiles(root) {
  const out = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"], { cwd: root, encoding: "utf8" });
  return out.split("\0").filter(Boolean);
}

/**
 * Lint completo. files = null: o projeto inteiro.
 * @param {{ root?: string; files?: string[] | null }} [options]
 */
export function lint({ root = ROOT, files = null } = {}) {
  const list = (files ?? projectFiles(root)).map((rel) => posix(rel)).filter((rel) => !IGNORED_DIRS.test(rel));
  const problems = [];
  for (const rel of list) {
    if (!scope.console(rel) && !scope.alt(rel)) continue;
    problems.push(...syntaxProblems(rel, readFileSync(join(root, rel), "utf8")));
  }
  const typed = list.filter((rel) => scope.assertion(rel));
  if (typed.length) problems.push(...typeProblems(projectProgram(root), root, files ? new Set(typed) : null));
  return problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col);
}

const squash = (code) => code.replace(/\s+/g, " ").trim();

/**
 * Separa os problemas em pendências conhecidas (PENDING) e novos; devolve também as entradas que sobraram.
 * @param {{ file: string; line: number; col: number; rule: string; message: string; code?: string }[]} problems
 * @param {{ file: string; rule: string; code: string; owner: string }[]} [pending]
 * @param {string[] | null} [files]
 */
export function splitPending(problems, pending = PENDING, files = null) {
  const used = new Set();
  const fresh = [];
  const known = [];
  for (const problem of problems) {
    const index = pending.findIndex(
      (entry, i) => !used.has(i) && entry.file === problem.file && entry.rule === problem.rule && squash(entry.code) === squash(problem.code ?? ""),
    );
    if (index === -1) fresh.push(problem);
    else {
      used.add(index);
      known.push({ ...problem, owner: pending[index].owner });
    }
  }
  const stale = pending.filter((entry, i) => !used.has(i) && (!files || files.includes(entry.file)));
  return { fresh, known, stale };
}

function main(argv) {
  const staged = argv.includes("--staged");
  const args = argv.filter((arg) => !arg.startsWith("--"));
  const files = staged ? stagedFiles(ROOT) : args.length ? args.map((arg) => posix(relative(ROOT, resolve(arg)))) : null;
  if (files && files.length === 0) return 0;
  const { fresh: problems, known, stale } = splitPending(lint({ files }), PENDING, files);
  for (const p of known) console.warn(`${p.file}:${p.line}:${p.col}  ${p.rule}  pendente (pedido ao dono "${p.owner}"): ${p.message}`);
  for (const entry of stale) console.warn(`lint: a pendência ${entry.file} "${entry.code}" já foi corrigida: apague-a de PENDING (scripts/lint.mjs)`);
  for (const p of problems) console.error(`${p.file}:${p.line}:${p.col}  ${p.rule}  ${p.message}`);
  if (problems.length) {
    console.error(`\nlint: ${problems.length} problema(s)${staged ? " nos arquivos em stage (commit bloqueado; corrija ou, em emergência, git commit --no-verify)" : ""}`);
    return 1;
  }
  console.log(`lint: ok (${Object.values(RULES).join(", ")})`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = main(process.argv.slice(2));
}
