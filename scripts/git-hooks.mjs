#!/usr/bin/env node
/**
 * Liga os hooks de git do projeto (backlog B251) — dono: shell. Roda sozinho no
 * `yarn install` (script "prepare" do package.json), como o husky faria:
 * aponta core.hooksPath deste repositório para .githooks/, onde está o
 * pre-commit que roda `node scripts/lint.mjs --staged`.
 *
 * Nunca derruba o install: fora de um repositório git, sem o binário do git,
 * na CI (CI) ou no Netlify (NETLIFY), ou com LEMAMON_HOOKS=0, não faz nada.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOOKS = ".githooks";

function main() {
  const env = process.env;
  if (env.CI || env.NETLIFY || env.LEMAMON_HOOKS === "0") return;
  if (!existsSync(join(ROOT, ".git")) || !existsSync(join(ROOT, HOOKS, "pre-commit"))) return;
  try {
    const current = execFileSync("git", ["config", "--local", "--get", "core.hooksPath"], { cwd: ROOT, encoding: "utf8" }).trim();
    if (current === HOOKS) return;
  } catch {
    // Sem core.hooksPath ainda (git config sai com 1): segue para gravar.
  }
  try {
    execFileSync("git", ["config", "--local", "core.hooksPath", HOOKS], { cwd: ROOT, stdio: "ignore" });
    console.log(`git-hooks: core.hooksPath = ${HOOKS} (pre-commit roda o lint nos arquivos em stage)`);
  } catch {
    console.warn("git-hooks: não deu para ligar os hooks (git indisponível?); o lint continua no `yarn lint` e na CI");
  }
}

main();
