/**
 * CSS do wizard sem o chrome do site (backlog B094) — dono: shell.
 *
 * Problema: o Astro junta no /_astro/Base.*.css o <style> de TODO componente
 * que o layout importa, renderize ele ou não. O Base.astro importa o chrome do
 * site (Header, MobileDrawer, Footer, StickyBar, WhatsAppFloat, ThemeToggle,
 * LanguageSelector, LanguageSuggestion, ResumeLabel), e as 6 páginas com
 * layout "wizard" (/orcamento, /orcamento/enviado e as versões en/es) baixavam
 * ≈ 24 kB brutos (3 KiB gzip) de regras que nunca desenham.
 *
 * Por que aqui e não separando o layout: separar o chrome num layout/arquivo
 * próprio vira DUAS folhas em toda página do site (núcleo + chrome), cada uma
 * comprimida sozinha: medido, +0,35 KiB gzip na Home, que já está no limite da
 * meta de 15 KiB. Esta integração deixa as 39 páginas do site exatamente como
 * estão (uma folha, em cache entre elas) e dá às páginas do wizard uma versão
 * da mesma folha SEM as regras que não podem casar com nada nelas.
 *
 * Como, depois do `astro build` (antes do verify-build, que mede o resultado):
 *   1. acha as páginas do wizard pelo <body data-layout="wizard"> (o Base.astro
 *      escreve o layout que src/config/routes.ts dá à rota);
 *   2. junta os escopos (data-astro-cid-…) que aparecem no HTML delas;
 *   3. para cada folha /_astro/*.css que elas linkam, tira os seletores que
 *      EXIGEM um escopo ausente de todas essas páginas. Um seletor como
 *      `.site-footer[data-astro-cid-hlzmzfsb]` só casa com um elemento que tem
 *      esse atributo; se nenhum HTML do wizard tem, a regra é peso morto (a
 *      ilha React não gera atributo de escopo do Astro). Escopo dentro de
 *      parênteses (:not(), :is(), :where(), :has()) fica: ali a ausência pode
 *      casar;
 *   4. se a economia passar de MIN_SAVING_GZ, grava a versão podada ao lado da
 *      original (/_astro/<nome>.wizard-<hash>.css, cache imutável como o resto
 *      de /_astro/) e troca o <link> só nas páginas do wizard.
 * Em `astro dev` nada muda (não há Base.*.css; o Vite injeta por componente).
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import type { AstroIntegration } from "astro";

/** Economia mínima (bytes gzip) para valer uma folha a mais no cache. */
export const MIN_SAVING_GZ = 512;

const WIZARD_BODY = /<body\b[^>]*\bdata-layout=["']?wizard\b/i;
const CID = /data-astro-cid-([a-z0-9]+)/gi;

/** A página usa o layout "wizard" (Base.astro: <body data-layout>). */
export function isWizardPage(html: string): boolean {
  return WIZARD_BODY.test(html);
}

/** Escopos do Astro presentes na marcação (fora dos <style>, que só citam escopos). */
export function cidsInMarkup(html: string): Set<string> {
  const markup = html.replace(/<style\b[\s\S]*?<\/style>/gi, " ");
  return new Set([...markup.matchAll(CID)].map((match) => (match[1] ?? "").toLowerCase()));
}

/** Índice do caractere que fecha o bloco/grupo aberto em `open` (respeita strings). */
function closing(css: string, open: number, openChar: string, closeChar: string): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    const char = css[i];
    if (char === '"' || char === "'") {
      i = endOfString(css, i);
      continue;
    }
    if (char === "\\") {
      i++;
      continue;
    }
    if (char === openChar) depth++;
    else if (char === closeChar && --depth === 0) return i;
  }
  return css.length - 1;
}

function endOfString(css: string, start: number): number {
  const quote = css[start];
  for (let i = start + 1; i < css.length; i++) {
    if (css[i] === "\\") i++;
    else if (css[i] === quote) return i;
  }
  return css.length - 1;
}

/** Primeiro `{` ou `;` no nível 0 a partir de `from` (fora de strings e parênteses). */
function nextBoundary(css: string, from: number): number {
  for (let i = from; i < css.length; i++) {
    const char = css[i];
    if (char === '"' || char === "'") i = endOfString(css, i);
    else if (char === "\\") i++;
    else if (char === "(") i = closing(css, i, "(", ")");
    else if (char === "{" || char === ";") return i;
  }
  return -1;
}

/** Divide uma lista de seletores nas vírgulas de nível 0. */
export function splitSelectors(prelude: string): string[] {
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < prelude.length; i++) {
    const char = prelude[i];
    if (char === '"' || char === "'") i = endOfString(prelude, i);
    else if (char === "\\") i++;
    else if (char === "(" || char === "[") i = closing(prelude, i, char, char === "(" ? ")" : "]");
    else if (char === ",") {
      out.push(prelude.slice(start, i));
      start = i + 1;
    }
  }
  out.push(prelude.slice(start));
  return out;
}

/** O seletor exige (fora de parênteses) um escopo da lista? */
export function requiresCid(selector: string, absent: Set<string>): boolean {
  let flat = "";
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === "(") {
      i = closing(selector, i, "(", ")");
      flat += "()";
    } else if (char === '"' || char === "'") {
      const end = endOfString(selector, i);
      flat += selector.slice(i, end + 1);
      i = end;
    } else flat += char;
  }
  for (const match of flat.matchAll(/\[data-astro-cid-([a-z0-9]+)(?:=[^\]]*)?\]/gi)) {
    if (absent.has((match[1] ?? "").toLowerCase())) return true;
  }
  return false;
}

/** At-rules cujo corpo é uma lista de regras (podada recursivamente). O resto (keyframes, font-face…) fica inteiro. */
const GROUPING_AT_RULES = new Set(["media", "supports", "container", "layer", "document"]);

/**
 * Tira de um CSS (minificado ou não) os seletores que exigem um escopo de
 * `absent`; regra sem seletor restante e at-rule de agrupamento vazia saem.
 */
export function pruneCss(css: string, absent: Set<string>): string {
  if (!absent.size) return css;
  let out = "";
  let i = 0;
  while (i < css.length) {
    const boundary = nextBoundary(css, i);
    if (boundary === -1) {
      out += css.slice(i);
      break;
    }
    const prelude = css.slice(i, boundary);
    if (css[boundary] === ";") {
      out += css.slice(i, boundary + 1);
      i = boundary + 1;
      continue;
    }
    const end = closing(css, boundary, "{", "}");
    const body = css.slice(boundary + 1, end);
    const trimmed = prelude.trim();
    if (trimmed.startsWith("@")) {
      const name = (trimmed.match(/^@([\w-]+)/)?.[1] ?? "").toLowerCase();
      if (GROUPING_AT_RULES.has(name)) {
        const inner = pruneCss(body, absent);
        if (inner.trim()) out += `${prelude}{${inner}}`;
      } else {
        out += `${prelude}{${body}}`;
      }
    } else {
      const kept = splitSelectors(prelude).filter((selector) => !requiresCid(selector, absent));
      if (kept.length) out += `${kept.join(",")}{${body}}`;
    }
    i = end + 1;
  }
  return out;
}

/** Escopos citados nos seletores de uma folha. */
export function cidsInCss(css: string): Set<string> {
  return new Set([...css.matchAll(CID)].map((match) => (match[1] ?? "").toLowerCase()));
}

const gz = (data: string): number => gzipSync(data, { level: 9 }).length;

function htmlFiles(root: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

const STYLESHEET_HREF = /<link\b[^>]*\brel=["']?stylesheet["']?[^>]*>/gi;
const hrefOf = (tag: string): string | undefined => tag.match(/\bhref=["']?([^"'\s>]+)/i)?.[1];

export interface WizardCssReport {
  pages: string[];
  sheets: { href: string; variant: string; savedGz: number }[];
}

/**
 * Gera as folhas podadas do wizard em `distDir` e troca os <link> das páginas
 * do wizard. Idempotente: rodar de novo sobre um dist já tratado não muda nada.
 */
export function writeWizardCss(distDir: string): WizardCssReport {
  const pages = htmlFiles(distDir)
    .map((full) => ({ full, html: readFileSync(full, "utf8") }))
    .filter((page) => isWizardPage(page.html));
  const report: WizardCssReport = { pages: pages.map((page) => relative(distDir, page.full).split(sep).join("/")), sheets: [] };
  if (!pages.length) return report;

  const used = new Set<string>();
  for (const page of pages) for (const cid of cidsInMarkup(page.html)) used.add(cid);

  const hrefs = new Set<string>();
  for (const page of pages) {
    for (const match of page.html.matchAll(STYLESHEET_HREF)) {
      const href = hrefOf(match[0]);
      if (href?.startsWith("/_astro/") && href.endsWith(".css") && !/\.wizard-[a-z0-9]+\.css$/.test(href)) hrefs.add(href);
    }
  }

  const replacements = new Map<string, string>();
  for (const href of hrefs) {
    const file = join(distDir, href.slice(1));
    if (!existsSync(file)) continue;
    const css = readFileSync(file, "utf8");
    const absent = new Set([...cidsInCss(css)].filter((cid) => !used.has(cid)));
    const pruned = pruneCss(css, absent);
    const savedGz = gz(css) - gz(pruned);
    if (savedGz < MIN_SAVING_GZ) continue;
    const hash = createHash("sha256").update(pruned).digest("hex").slice(0, 8);
    const variant = href.replace(/\.css$/, `.wizard-${hash}.css`);
    writeFileSync(join(distDir, variant.slice(1)), pruned);
    replacements.set(href, variant);
    report.sheets.push({ href, variant, savedGz });
  }

  if (replacements.size) {
    for (const page of pages) {
      const html = page.html.replace(STYLESHEET_HREF, (tag) => {
        const href = hrefOf(tag);
        const variant = href ? replacements.get(href) : undefined;
        return variant && href ? tag.replace(href, variant) : tag;
      });
      if (html !== page.html) writeFileSync(page.full, html);
    }
  }
  return report;
}

export default function wizardCss(): AstroIntegration {
  return {
    name: "lemamon:wizard-css",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const report = writeWizardCss(fileURLToPath(dir));
        for (const sheet of report.sheets) {
          logger.info(`${sheet.variant}: ${sheet.href} sem o chrome do site, -${(sheet.savedGz / 1024).toFixed(1)} KiB gzip em ${report.pages.length} página(s) do wizard`);
        }
      },
    },
  };
}
