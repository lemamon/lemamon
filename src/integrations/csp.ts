/**
 * Content-Security-Policy GERADA NO BUILD (backlog B254) — dono: shell.
 *
 * Por que no build e não escrita à mão no netlify.toml: a política só fica
 * sem 'unsafe-inline' em script-src se listar o 'sha256-…' de CADA script
 * inline que vai ao ar, e o texto de alguns deles depende do build (o snippet
 * do gtag muda com PUBLIC_GA4_ID e com privacidade.baseAnuncios; o runtime de
 * ilha muda com a versão do Astro; os <script type="module"> pequenos mudam a
 * cada edição). Hash escrito à mão envelhece em silêncio e derruba a medição.
 * Aqui, depois do `astro build`, a integração:
 *   1. lê todo HTML de dist/ e calcula o sha256 de cada <script> inline
 *      executável (clássico ou module; JSON e JSON-LD não executam e ficam de
 *      fora);
 *   2. recusa (derruba o build) atributo on*="…" e href="javascript:…", que
 *      nenhum hash libera;
 *   3. monta a política (cspPolicy) e grava dist/_headers, que o Netlify
 *      aplica junto com os [[headers]] do netlify.toml. A CSP mora SÓ aqui:
 *      o netlify.toml não tem mais nenhuma (duas políticas valeriam as duas).
 *
 * Modo: Report-Only até a promoção (CONTRACT §11): o shell troca CSP_ENFORCE
 * para true depois de tests/e2e/shell-csp.spec.ts passar com 0 violação
 * contra PRODUÇÃO (E2E_NETLIFY_URL=https://lemamon.dev; GA4, Google Ads e New
 * Relic só carregam lá). O evento securitypolicyviolation dispara também em
 * Report-Only, então o mesmo spec valida a política exata que vai valer.
 * upgrade-insecure-requests só entra com a política efetiva (em Report-Only o
 * navegador ignora a diretiva e avisa no console).
 *
 * Relatórios (B254): a política leva report-uri e report-to, e o _headers o
 * Reporting-Endpoints, apontando para a Netlify Function
 * netlify/functions/csp-report.mjs (CSP_REPORT_PATH), que registra cada
 * violação nos logs da função. A variável de build CSP_REPORT_URI (URL https
 * de um coletor externo, ex.: report-uri.com) troca o destino. É assim que a
 * semana sem violações em produção, com GA4, Ads e New Relic carregados, fica
 * observável antes da promoção.
 *
 * Pixels opcionais (LinkedIn Insight Tag, Meta Pixel; backlog B346/B347): os
 * domínios deles só entram na política quando o build publica o ID (atributos
 * data-linkedin-partner-id / data-meta-pixel-id do aviso de cookies, que só
 * existem em produção, com baseAnuncios = "consentimento" e o ID preenchido).
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { PIXEL_ATTRIBUTES } from "../scripts/pixels";

/** false = Content-Security-Policy-Report-Only; true = Content-Security-Policy (promoção, B254). */
export const CSP_ENFORCE = false;

/** Arquivo de headers do Netlify na raiz do publish dir. */
export const HEADERS_FILE = "_headers";

/** Coletor padrão dos relatórios de violação: a Netlify Function netlify/functions/csp-report.mjs (B254). */
export const CSP_REPORT_PATH = "/.netlify/functions/csp-report";

/** Nome do endpoint no Reporting-Endpoints (report-to). */
export const CSP_REPORT_GROUP = "csp";

/**
 * Para onde vão os relatórios: CSP_REPORT_URI (variável de build, URL https
 * de um coletor externo) ou a função do próprio site. Valor inválido derruba
 * o build: relatório perdido em silêncio esconderia a violação que se quer ver.
 */
export function cspReportUri(env: Record<string, string | undefined> = process.env): string {
  const custom = env.CSP_REPORT_URI?.trim();
  if (!custom) return CSP_REPORT_PATH;
  let url: URL;
  try {
    url = new URL(custom);
  } catch {
    throw new Error(`csp: CSP_REPORT_URI inválida ("${custom}"): use a URL https completa do coletor`);
  }
  if (url.protocol !== "https:") throw new Error(`csp: CSP_REPORT_URI precisa ser https ("${custom}")`);
  return url.href;
}

/** Atributos que o aviso de cookies publica quando o pixel está configurado (ConsentBanner.astro). */
export { PIXEL_ATTRIBUTES };

/**
 * Google Ads + GA4 (gtag.js), conferido com o guia oficial "Use a Content
 * Security Policy" (developers.google.com/tag-platform/security/guides/csp, em
 * 20/out/2026): tabelas "Google Analytics 4 com recursos de Ads" e "Google Ads
 * Conversion, Remarketing e Conversion Linker" somadas. O guia pede
 * *.google.<TLD> um a um (não existe curinga à direita do host): entra o .com.br
 * do público principal; o relatório da semana de observação (report-uri, B254)
 * mostra se outro TLD aparece (visitante de es/en) antes da promoção.
 */
const GOOGLE = {
  script: [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://googleads.g.doubleclick.net",
    "https://www.googleadservices.com",
    "https://www.google.com",
  ],
  // pagead2.googlesyndication.com: para onde o Google Ads manda o /ccm/collect,
  // inclusive com o consentimento negado (B344, achado do revisor).
  connect: [
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://*.doubleclick.net",
    "https://*.google.com",
    "https://*.google.com.br",
    "https://www.googleadservices.com",
    "https://pagead2.googlesyndication.com",
  ],
  img: [
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https://*.doubleclick.net",
    "https://*.google.com",
    "https://*.google.com.br",
    "https://www.googleadservices.com",
    "https://pagead2.googlesyndication.com",
  ],
  frame: ["https://td.doubleclick.net", "https://www.googletagmanager.com"],
};

/** New Relic: o loader é /scripts/newrelic.js ('self'); os chunks e o envio, daqui. */
const NEW_RELIC = { script: ["https://js-agent.newrelic.com"], connect: ["https://bam.nr-data.net"] };

/** LinkedIn Insight Tag (só com o partner ID publicado). */
const LINKEDIN = { script: ["https://snap.licdn.com"], connect: ["https://px.ads.linkedin.com"], img: ["https://px.ads.linkedin.com"] };

/** Meta Pixel (só com o pixel ID publicado). */
const META = { script: ["https://connect.facebook.net"], connect: ["https://www.facebook.com"], img: ["https://www.facebook.com"] };

export interface CspOptions {
  /** Hashes 'sha256-…' (sem aspas) dos scripts inline publicados. */
  hashes: string[];
  enforce?: boolean;
  linkedin?: boolean;
  meta?: boolean;
  /** Destino dos relatórios (report-uri e o endpoint de report-to); "" = sem relatório. */
  reportUri?: string;
}

/** A política, numa linha (diretivas separadas por "; "). */
export function cspPolicy({ hashes, enforce = CSP_ENFORCE, linkedin = false, meta = false, reportUri = "" }: CspOptions): string {
  const extra = [linkedin ? LINKEDIN : null, meta ? META : null].filter((value): value is typeof LINKEDIN => value !== null);
  const sorted = [...new Set(hashes)].sort().map((hash) => `'sha256-${hash}'`);
  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    ["script-src", ["'self'", ...sorted, ...GOOGLE.script, ...NEW_RELIC.script, ...extra.flatMap((item) => item.script)]],
    ["connect-src", ["'self'", ...GOOGLE.connect, ...NEW_RELIC.connect, ...extra.flatMap((item) => item.connect)]],
    ["img-src", ["'self'", "data:", ...GOOGLE.img, ...extra.flatMap((item) => item.img)]],
    // style="" nos componentes e <style> inline do Astro: estilo inline não executa código.
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["font-src", ["'self'"]],
    ["worker-src", ["'self'", "blob:"]],
    ["frame-src", GOOGLE.frame],
    ["form-action", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["object-src", ["'none'"]],
    ["frame-ancestors", ["'none'"]],
  ];
  const parts = directives.map(([name, values]) => `${name} ${values.join(" ")}`);
  if (enforce) parts.push("upgrade-insecure-requests");
  // report-uri (todos os navegadores) e report-to (Reporting API; Chrome ignora report-uri quando há report-to).
  if (reportUri) parts.push(`report-uri ${reportUri}`, `report-to ${CSP_REPORT_GROUP}`);
  return parts.join("; ");
}

export const cspHeaderName = (enforce = CSP_ENFORCE) => (enforce ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only");

const isData = (attrs: string) => /\btype\s*=\s*["']?(application\/(ld\+)?json|text\/(plain|template)|importmap|speculationrules)/i.test(attrs);

/** sha256 (base64) de cada <script> inline executável de um HTML. */
export function inlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";
    if (/\bsrc\s*=/i.test(attrs) || isData(attrs)) continue;
    hashes.push(createHash("sha256").update(body, "utf8").digest("base64"));
  }
  return hashes;
}

/** O que uma política só com hashes bloquearia e nenhum hash libera: on*="…" e javascript:. */
export function cspInlineProblems(html: string): string[] {
  const markup = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ");
  const problems: string[] = [];
  for (const match of markup.matchAll(/<[a-z][a-z0-9-]*\b[^>]*?\s(on[a-z]+)\s*=/gi)) {
    problems.push(`atributo ${match[1]}="…" (handler inline; a CSP sem 'unsafe-inline' bloqueia: use addEventListener num <script>)`);
  }
  if (/\s(?:href|src|action)\s*=\s*["']?\s*javascript:/i.test(markup)) problems.push('URL "javascript:" (a CSP sem \'unsafe-inline\' bloqueia)');
  return problems;
}

/** Conteúdo do dist/_headers. reportUri: o endpoint do report-to (header Reporting-Endpoints). */
export function headersFile(policy: string, enforce = CSP_ENFORCE, reportUri = ""): string {
  return [
    "# Gerado no build por src/integrations/csp.ts (backlog B254). Não edite: os",
    "# hashes saem dos scripts inline deste build. Os demais headers estão no netlify.toml.",
    "/*",
    `  ${cspHeaderName(enforce)}: ${policy}`,
    ...(reportUri ? [`  Reporting-Endpoints: ${CSP_REPORT_GROUP}="${reportUri}"`] : []),
    "",
  ].join("\n");
}

function htmlFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const full = join(root, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}

/** Lê o dist e devolve a política e os problemas (puro em relação ao disco: só lê). */
export function cspForDist(
  distDir: string,
  enforce = CSP_ENFORCE,
  reportUri = cspReportUri(),
): { policy: string; hashes: string[]; problems: string[]; reportUri: string } {
  const hashes = new Set<string>();
  const problems: string[] = [];
  let linkedin = false;
  let meta = false;
  for (const full of htmlFiles(distDir)) {
    const file = relative(distDir, full).split(sep).join("/");
    const html = readFileSync(full, "utf8");
    for (const hash of inlineScriptHashes(html)) hashes.add(hash);
    for (const problem of cspInlineProblems(html)) problems.push(`${file}: ${problem}`);
    linkedin ||= html.includes(`${PIXEL_ATTRIBUTES.linkedin}=`);
    meta ||= html.includes(`${PIXEL_ATTRIBUTES.meta}=`);
  }
  const sorted = [...hashes].sort();
  return { policy: cspPolicy({ hashes: sorted, enforce, linkedin, meta, reportUri }), hashes: sorted, problems, reportUri };
}

export default function csp(): AstroIntegration {
  return {
    name: "lemamon:csp",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const { policy, hashes, problems, reportUri } = cspForDist(distDir);
        if (problems.length) {
          throw new Error(`csp: ${problems.length} problema(s)\n - ${problems.join("\n - ")}`);
        }
        writeFileSync(join(distDir, HEADERS_FILE), headersFile(policy, CSP_ENFORCE, reportUri));
        logger.info(
          `${HEADERS_FILE}: ${cspHeaderName()} com ${hashes.length} hash(es) de script inline, sem 'unsafe-inline' em script-src; relatórios em ${reportUri}`,
        );
      },
    },
  };
}
