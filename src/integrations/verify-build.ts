/**
 * Integração de build (dono: shell): depois do `astro build`, confere que
 *  1. toda rota "always" de src/config/routes.ts existe nos 3 idiomas;
 *  2. cada página gerada tem exatamente 1 <h1>, e o texto dele é o do i18n;
 *  3. página when_data gerada num idioma existe nos outros idiomas dela
 *     (hreflang recíproco; a flag vale para os 3 idiomas ao mesmo tempo);
 *  4. formulários fora do session replay do New Relic (i18n
 *     _notes.privacy_conditionals, launch blocker 7): toda ilha React
 *     (<astro-island>, o wizard) leva data-nr-block, e todo <form> visível
 *     também (o NREUM.init de public/scripts/newrelic.js já bloqueia "form";
 *     o atributo é a segunda garantia, independente da configuração do agente);
 *  5. nenhum placeholder do i18n sem interpolar ("{email}", "{politica}"…) no
 *     texto visível, nos atributos lidos ou no JSON-LD de nenhuma página;
 *  6. ORÇAMENTO DE PESO (backlog B097), por página, em gzip (nível 9, cada
 *     arquivo comprimido sozinho, como o navegador recebe):
 *       CSS (arquivos linkados + os <style> inline, estes comprimidos juntos,
 *         como chegam no HTML) ≤ 15 KiB, a meta do B094, contado SEM as
 *         folhas que só existem por dado do dono: as when_data
 *         (<style data-rendered-style>, RenderedStyle.astro: cases,
 *         depoimento, logos, time, investimento) e a do aviso de cookies
 *         (<style data-owner-style>, só com privacidade.baseAnuncios =
 *         "consentimento"). Com elas, ≤ 17 KiB (cssGzOwnerData), folga
 *         TEMPORÁRIA: a Home de dist-ficticio/ (o site com todos os dados do
 *         dono) mede 16,2 KiB, o aviso de cookies soma ≈ 0,35 KiB, e o pedido
 *         para caber em 15 KiB está com home/gated. Quando couber,
 *         cssGzOwnerData = cssGz. Medido em 20/out/2026, depois do wizard-css
 *         (B094; as 6 páginas do wizard linkam o Base.*.css sem o chrome do
 *         site): dist ≤ 14,99 KiB (Home: só 10 bytes de folga, qualquer CSS
 *         novo na Home precisa sair de outro lugar); wizard 12,1 KiB (era
 *         15,1); dist-ficticio ≤ 14,99 KiB sem e 16,18 KiB com as folhas
 *         when_data (Home); produção com o aviso de cookies: Home 15,3 KiB
 *         com ele;
 *       JS (scripts /_astro + ilha + imports estáticos seguidos + inline)
 *         ≤ 12 KiB em toda página e ≤ 102 KiB SÓ nas rotas da ilha do wizard
 *         (ISLAND_ROUTES: "quote" de src/config/routes.ts, /orcamento,
 *         /en/quote, /es/cotizacion). O limite vem da ROTA, não da presença de
 *         <astro-island>: uma ilha nova na Home ficaria com 12 KiB (B097).
 *         Era 10 KiB; subiu em 20/out/2026 quando o build de produção com o
 *         aviso de cookies (baseAnuncios = "consentimento", B344: +1,5 KiB) e
 *         os pixels (B346/B347) passou a ser gerado de verdade, com a fila
 *         offline dos eventos de falha (B340: +0,8 KiB em toda página).
 *         Medido: /contato 9,9 KiB sem o aviso e 11,6 KiB com o aviso e os
 *         dois pixels (com ou sem PUBLIC_GA4_ID); Home 7,5 / 9,4 KiB.
 *         Carregar os pixels por import() dinâmico NÃO reduz: o helper de
 *         preload do Vite entra no grafo estático (/contato iria a 12,0 KiB).
 *         Continua bem abaixo da meta do 04-tecnico (JS de entrada < 30 kB).
 *         Wizard: era 100 KiB; 101 KiB desde 21/out/2026 (auditoria de
 *         conversão, achados F07, F11, F26, F34, F81 e F82: sugestão de
 *         e-mail, atribuição do /contato, toque de campanha entre abas,
 *         "Ref.: G-…" no WhatsApp, gbraid/wbraid e ?debug_analytics=1). Medido
 *         na rota do wizard: dist 92,6 → 94,6 KiB; dist-ficticio 98,3 →
 *         100,3 KiB. 102 KiB desde o merge dos pacotes A e C (resumo
 *         reordenado, trava de entrada e progresso de 8 passos do F02/F06/F21
 *         somados à atribuição): dist-ficticio 101,3 KiB. O caminho para
 *         descer de novo é o F53 (Preact). Nas
 *         outras páginas, +1,0 KiB (Home 7,5 → 8,5); o /contato ficou MAIS
 *         leve (9,6 → 8,8 KiB): o aprimoramento do formulário carrega no
 *         ocioso ou no 1º toque (ContactForm.astro);
 *       HTML ≤ 25 KiB;
 *     O que conta (B097, rodada do revisor cético): TODO CSS e TODO JS do
 *     mesmo site que a página baixa, de qualquer pasta (não só /_astro: um
 *     <script src="/scripts/x.js"> de public/ conta igual), resolvidos contra
 *     o endereço da página: <link rel=stylesheet>, <link rel=preload
 *     as=style>, @import dentro do CSS; <script src>, <link rel=modulepreload>,
 *     <link rel=preload as=script>, os atributos da ilha e os import/import()
 *     dos scripts inline, seguindo os imports estáticos. Exceção POR NOME,
 *     com teto próprio (OWN_BUDGET_FILES): /scripts/newrelic.js (o agente do
 *     New Relic, só em produção, defer) ≤ 30 KiB gzip; qualquer outro arquivo
 *     de public/scripts entra no JS da página;
 *     e por arquivo, em TODO o dist (não só _astro): nenhum .js acima de 250
 *     KiB brutos, nenhuma .woff2 acima de 30 KiB. Linha de base (out/2026,
 *     dist sem a camada): CSS até 14,99 KiB; JS fora do wizard até 9,9 KiB
 *     (/contato); wizard 92,1 KiB; maior .js 209 KiB brutos; HTML até 19,3 KiB
 *     (dist-ficticio: até 24,1 KiB); fontes de 12,1 e 12,4 KiB; newrelic.js
 *     72 KiB brutos, 21,7 KiB gzip;
 *  6b. ILHA REACT SÓ NO WIZARD (CONTRACT §10, BLUEPRINT §0.4): <astro-island>
 *     em qualquer página fora de ISLAND_ROUTES derruba o build (B097);
 *  6c. NENHUM CSS OU JS DE TERCEIRO fora da lista explícita
 *     (THIRD_PARTY_ALLOWLIST): <link rel=stylesheet>, <link rel=preload
 *     as=style|script>, <link rel=modulepreload>, <script src> e @import de
 *     outra origem (http:, https:, //) derrubam o
 *     build, porque o peso deles não aparece no orçamento (o antd.min.css de
 *     um CDN voltaria em silêncio; B094/B097). A lista hoje tem só o gtag.js
 *     (www.googletagmanager.com/gtag/js, o mesmo GOOGLE.script de csp.ts), e
 *     só no build de PRODUÇÃO (CONTEXT=production): em preview e local ele
 *     também derruba o build (nenhum preview carrega terceiros, B277);
 *  7. nenhum <script> inline CLÁSSICO (sem type=module, sem JSON) acima de
 *     1 KiB: ele é síncrono e bloqueia a pintura (backlog B104). Exceção
 *     única e explícita: o runtime de ilha que o próprio Astro embute nas
 *     páginas com <astro-island> (≈ 4,9 kB, do framework);
 *  8. só no build de PRODUÇÃO do Netlify (CONTEXT=production): o WhatsApp
 *     existe com número válido (55 + DDD + número) e nunca é o número de TESTE
 *     do E2E (backlog B007; playbook 00 §A1 promete que o build falha);
 *  9. toda <img> publicada tem o atributo alt (alt="" para imagem decorativa):
 *     a regra jsx-a11y/alt-text do lint (backlog B251) aplicada ao HTML que vai
 *     ao ar, inclusive o que vem do Markdown dos posts e cases.
 * Qualquer falha derruba o build: rota faltando nunca chega ao Netlify. Como o
 * Netlify roda `yarn build` também nos deploy previews, o preview do PR fica
 * vermelho quando um limite estoura.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import type { AstroIntegration } from "astro";

import { routeDef, staticRouteEntries, type RouteKey } from "../config/routes";
import { tDynamic } from "../i18n/index";

/** Caminho da política de URL → arquivo em dist (build.format "preserve"). */
export function fileForPath(path: string): string {
  if (path === "/") return "index.html";
  if (path.endsWith("/")) return `${path.slice(1)}index.html`;
  return `${path.slice(1)}.html`;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
      if (code.startsWith("#x") || code.startsWith("#X")) return String.fromCodePoint(parseInt(code.slice(2), 16));
      if (code.startsWith("#")) return String.fromCodePoint(Number(code.slice(1)));
      return ENTITIES[code.toLowerCase()] ?? whole;
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function h1sOf(html: string): string[] {
  return [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => textOf(match[1] ?? ""));
}

function htmlFiles(root: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

/** Problemas de privacidade do replay num HTML (critério 4). */
export function replayProblems(html: string): string[] {
  const problems: string[] = [];
  const island = /<astro-island\b[\s\S]*?<\/astro-island>/gi;
  for (const match of html.matchAll(island)) {
    if (!/\bdata-nr-block\b/.test(match[0])) problems.push("<astro-island> sem data-nr-block (fica no replay do New Relic)");
  }
  // Formulários dentro da ilha já estão cobertos pela raiz dela.
  for (const match of html.replace(island, "").matchAll(/<form\b[^>]*>/gi)) {
    const tag = match[0];
    if (/\shidden(\s|=|>|\/)/i.test(tag)) continue;
    if (!/\bdata-nr-block\b/.test(tag)) problems.push(`formulário sem data-nr-block: ${tag.slice(0, 80)}`);
  }
  return problems;
}

/** Placeholder do i18n que ficou sem interpolar ({email}, {politica}, {n}…). */
const PLACEHOLDER = /\{[a-z_]+\}/g;

/** Atributos que o visitante (ou o buscador) lê. */
const VISIBLE_ATTRIBUTES = /\s(?:alt|title|aria-label|aria-description|placeholder|content)="([^"]*)"/gi;

/**
 * Placeholders "{…}" no que é publicado de um HTML (critério 5): texto visível,
 * atributos lidos (alt, title, aria-label, placeholder, meta content) e JSON-LD.
 * Fica de fora o que não é texto publicado: <script> comum (o código), <style>,
 * <template>, <pre>/<code> e os props das ilhas (<astro-island props>, onde os
 * textos com {n} são interpolados no cliente).
 */
export function placeholderProblems(html: string): string[] {
  const jsonLd = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1] ?? "");
  const markup = html
    .replace(/<(script|style|template|pre|code)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<astro-island\b[^>]*>/gi, "<astro-island>");
  const attributes = [...markup.matchAll(VISIBLE_ATTRIBUTES)].map((m) => m[1] ?? "");
  const found = new Set<string>();
  for (const source of [textOf(markup), ...attributes.map((value) => textOf(value)), ...jsonLd]) {
    for (const match of source.matchAll(PLACEHOLDER)) found.add(match[0]);
  }
  return [...found].map((placeholder) => `placeholder do i18n sem interpolar: "${placeholder}" (texto visível ou JSON-LD)`);
}

const KIB = 1024;

/** Limites do critério 6 (bytes). Mudar um limite = registrar no CONTRACT com a nova linha de base. */
export const WEIGHT_BUDGET = {
  /** CSS da página sem as folhas que dependem de dado do dono (meta do B094). */
  cssGz: 15 * KIB,
  /** CSS da página com as folhas when_data e a do aviso de cookies. Temporário: baixar para cssGz (pedido a home/gated). */
  cssGzOwnerData: 17 * KIB,
  jsGz: 12 * KIB,
  jsGzIsland: 102 * KIB,
  htmlGz: 25 * KIB,
  jsFileRaw: 250 * KIB,
  font: 30 * KIB,
} as const;

/**
 * Arquivos do próprio site FORA do orçamento por página, cada um com teto
 * próprio em gzip (critério 6). Exceção por NOME: qualquer outro arquivo de
 * public/scripts conta no JS da página. O caminho é o NEW_RELIC_SCRIPT de
 * src/config/site.ts (tests/unit/verify-build.test.ts confere).
 */
export const OWN_BUDGET_FILES: Readonly<Record<string, number>> = {
  /** Agente do New Relic Browser: só em produção, com defer (Analytics.astro). Hoje 21,7 KiB gzip. */
  "/scripts/newrelic.js": 30 * KIB,
};

/**
 * CSS/JS de OUTRA origem que pode ir no HTML publicado (critério 6c). Cada
 * entrada precisa de motivo; o resto derruba o build. productionOnly: só no
 * build de produção (CONTEXT=production); em preview e local, é falha.
 */
export const THIRD_PARTY_ALLOWLIST: readonly { origin: string; pathPrefix: string; productionOnly: boolean; why: string }[] = [
  {
    origin: "https://www.googletagmanager.com",
    pathPrefix: "/gtag/js",
    productionOnly: true,
    why: "gtag.js do Google Ads e do GA4 (Analytics.astro; GOOGLE.script de src/integrations/csp.ts)",
  },
];

/**
 * Rotas que podem ter ilha React (CONTRACT §10: "a única ilha React é o
 * wizard"). Só elas ganham o limite de JS jsGzIsland; <astro-island> em
 * qualquer outra página derruba o build (critério 6b, B097).
 */
export const ISLAND_ROUTES: readonly RouteKey[] = ["quote"];

/** Arquivos de dist/ das rotas com ilha permitida (os 3 idiomas). */
export function islandFiles(): Set<string> {
  return new Set(
    staticRouteEntries()
      .filter((entry) => ISLAND_ROUTES.includes(entry.key))
      .map((entry) => fileForPath(entry.path)),
  );
}

/** Critério 7: script inline clássico (síncrono) acima disso derruba o build. */
export const INLINE_SCRIPT_MAX = 1024;

/** Número de WhatsApp de TESTE (E2E e builds de teste). Igual a E2E_WHATSAPP_NUMBER do playwright.config.ts. */
export const TEST_WHATSAPP_NUMBER = "5548900000000";

const gz = (data: Buffer | string): number => gzipSync(data, { level: 9 }).length;
const kib = (bytes: number): string => `${(bytes / KIB).toFixed(1)} KiB`;

/** Lê um asset publicado pelo caminho da URL ("/_astro/x.js"); null se não existir. */
export type ReadAsset = (urlPath: string) => Buffer | null;

const STATIC_IMPORT = /(?:\bimport|\bfrom)\s*["'](\.{0,2}\/[^"']+\.js)["']/g;

/** Grafo de JS de uma entrada: ela e os imports estáticos, recursivamente (caminhos de URL). */
function jsGraph(entry: string, readAsset: ReadAsset, seen: Set<string>): void {
  if (seen.has(entry)) return;
  const code = readAsset(entry);
  if (!code) return;
  seen.add(entry);
  for (const match of code.toString("utf8").matchAll(STATIC_IMPORT)) {
    const spec = match[1] ?? "";
    jsGraph(spec.startsWith("/") ? spec : new URL(spec, `https://x${entry}`).pathname, readAsset, seen);
  }
}

interface ScriptTag {
  attrs: string;
  body: string;
}

function scriptTags(html: string): ScriptTag[] {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((m) => ({ attrs: m[1] ?? "", body: m[2] ?? "" }));
}

const isModule = (attrs: string) => /\btype=["']?module\b/i.test(attrs);
const isData = (attrs: string) => /\btype=["']?(application\/(ld\+)?json|text\/(plain|template))/i.test(attrs);
const isAstroIslandRuntime = (body: string) => /customElements[\s\S]*astro-island/.test(body);

/** <style> que só existe por dado do dono: when_data (RenderedStyle.astro) e o aviso de cookies (Base.astro). */
const OWNER_DATA_STYLE = /\bdata-(?:rendered-style|owner-style)\b/i;

/** Origem fictícia para resolver URL relativa contra o endereço da página. */
const SELF_ORIGIN = "https://self.invalid";

/** Um endereço do HTML: do próprio site (path) ou de outra origem (url); null = não é baixado (data:, mailto:…). */
export type ResolvedRef = { self: true; path: string } | { self: false; url: URL };

/** Resolve src/href contra a página ("en/index.html" → /en/index.html), como o navegador. */
export function resolveRef(ref: string, page = "index.html"): ResolvedRef | null {
  let url: URL;
  try {
    url = new URL(ref.trim(), `${SELF_ORIGIN}/${page}`);
  } catch {
    return null;
  }
  if (url.origin === SELF_ORIGIN) return { self: true, path: decodeURIComponent(url.pathname) };
  return url.protocol === "https:" || url.protocol === "http:" ? { self: false, url } : null;
}

/** Atributos de uma tag (nomes em minúsculas). */
function attrsOf(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const body = tag.replace(/^<[a-z0-9-]+/i, "").replace(/\/?>$/, "");
  for (const m of body.matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[(m[1] ?? "").toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return out;
}

const relOf = (attrs: Record<string, string>) => (attrs.rel ?? "").toLowerCase().split(/\s+/);

/** O que um <link> baixa e conta no orçamento: "css", "js" ou null (ícone, manifest, preconnect, fonte…). */
function linkKind(attrs: Record<string, string>): "css" | "js" | null {
  const rel = relOf(attrs);
  const as = (attrs.as ?? "").toLowerCase();
  if (rel.includes("stylesheet") || (rel.includes("preload") && as === "style")) return "css";
  if (rel.includes("modulepreload") || (rel.includes("preload") && as === "script")) return "js";
  return null;
}

/** Endereços de @import num CSS. */
function cssImports(css: string): string[] {
  return [...css.matchAll(/@import\s+(?:url\(\s*)?["']?([^"')\s;]+)/gi)].map((m) => m[1] ?? "");
}

/** Imports de um script inline: estáticos e import() com string literal. */
function inlineImports(code: string): string[] {
  return [...code.matchAll(/(?:\bimport|\bfrom)\s*\(?\s*["']([^"']+\.m?js(?:\?[^"']*)?)["']/g)].map((m) => m[1] ?? "");
}

/**
 * Peso de uma página (critério 6), em bytes gzip. cssGzCore = CSS sem as
 * folhas que dependem de dado do dono. `page` é o arquivo em dist
 * ("en/index.html"), para resolver endereço relativo.
 */
export function pageWeight(
  html: string,
  readAsset: ReadAsset,
  page = "index.html",
): { cssGz: number; cssGzCore: number; jsGz: number; htmlGz: number; island: boolean } {
  const selfPath = (ref: string | undefined, base = page): string | null => {
    const resolved = ref ? resolveRef(ref, base) : null;
    return resolved?.self ? resolved.path : null;
  };

  // CSS: <link rel=stylesheet>, <link rel=preload as=style> e o @import de cada um (sem contar o mesmo arquivo 2 vezes).
  const cssFiles = new Set<string>();
  const addCss = (path: string | null): void => {
    if (!path || cssFiles.has(path)) return;
    const code = readAsset(path);
    if (!code) return;
    cssFiles.add(path);
    for (const ref of cssImports(code.toString("utf8"))) addCss(selfPath(ref, path.replace(/^\/+/, "")));
  };
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attrsOf(m[0]));
  for (const attrs of links) if (linkKind(attrs) === "css") addCss(selfPath(attrs.href));
  const styles = [...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi)].map((m) => ({ attrs: m[1] ?? "", css: m[2] ?? "" }));
  for (const style of styles) for (const ref of cssImports(style.css)) addCss(selfPath(ref));
  const linkedGz = [...cssFiles].reduce((sum, path) => sum + gz(readAsset(path) ?? Buffer.alloc(0)), 0);
  const inlineGz = (list: { css: string }[]) => (list.length ? gz(list.map((style) => style.css).join("\n")) : 0);
  const cssGz = linkedGz + inlineGz(styles);
  const cssGzCore = linkedGz + inlineGz(styles.filter((style) => !OWNER_DATA_STYLE.test(style.attrs)));

  // JS: todo <script src> do site, modulepreload/preload as=script, os atributos da ilha e os imports dos inline.
  const entries: (string | null)[] = [];
  const scripts = scriptTags(html);
  for (const tag of scripts) {
    const attrs = attrsOf(`<script ${tag.attrs}>`);
    if (attrs.src) entries.push(selfPath(attrs.src));
  }
  for (const attrs of links) if (linkKind(attrs) === "js") entries.push(selfPath(attrs.href));
  for (const m of html.matchAll(/\b(?:component-url|renderer-url|before-hydration-url)=["']?([^"'\s>]+)/gi)) entries.push(selfPath(m[1]));
  const inline = scripts.filter((tag) => !/\bsrc=/i.test(tag.attrs) && !isData(tag.attrs));
  for (const tag of inline) for (const ref of inlineImports(tag.body)) entries.push(selfPath(ref));

  const graph = new Set<string>();
  for (const entry of entries) {
    if (entry && !(entry in OWN_BUDGET_FILES)) jsGraph(entry, readAsset, graph);
  }
  const jsGz = [...graph].reduce((sum, path) => sum + gz(readAsset(path) ?? Buffer.alloc(0)), 0) + inline.reduce((sum, tag) => sum + gz(tag.body), 0);

  return { cssGz, cssGzCore, jsGz, htmlGz: gz(html), island: /<astro-island\b/i.test(html) };
}

/**
 * Critério 6c: CSS e JS de outra origem fora de THIRD_PARTY_ALLOWLIST (ou da
 * lista, mas fora de produção). Olha <script src>, <link rel=stylesheet>,
 * <link rel=preload as=style|script>, <link rel=modulepreload> e o @import
 * dos <style> e das folhas do site.
 */
export function thirdPartyProblems(html: string, readAsset: ReadAsset, { production = false, page = "index.html" } = {}): string[] {
  const refs: { ref: string; where: string; base: string }[] = [];
  for (const tag of scriptTags(html)) {
    const src = attrsOf(`<script ${tag.attrs}>`).src;
    if (src) refs.push({ ref: src, where: "<script src>", base: page });
  }
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attrsOf(m[0]));
  for (const attrs of links) {
    if (attrs.href && linkKind(attrs)) refs.push({ ref: attrs.href, where: `<link rel="${attrs.rel}">`, base: page });
  }
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const ref of cssImports(m[1] ?? "")) refs.push({ ref, where: "@import num <style>", base: page });
  }
  for (const attrs of links) {
    if (linkKind(attrs) !== "css" || !attrs.href) continue;
    const resolved = resolveRef(attrs.href, page);
    const code = resolved?.self ? readAsset(resolved.path) : null;
    if (!code || !resolved?.self) continue;
    for (const ref of cssImports(code.toString("utf8"))) refs.push({ ref, where: `@import em ${resolved.path}`, base: resolved.path.replace(/^\/+/, "") });
  }

  const problems: string[] = [];
  for (const { ref, where, base } of refs) {
    const resolved = resolveRef(ref, base);
    if (!resolved || resolved.self) continue;
    const allowed = THIRD_PARTY_ALLOWLIST.find(
      (entry) => resolved.url.origin === entry.origin && resolved.url.pathname.startsWith(entry.pathPrefix),
    );
    if (!allowed) {
      problems.push(
        `CSS/JS de terceiro fora da lista (THIRD_PARTY_ALLOWLIST; o peso dele não entra no orçamento): ${where} ${resolved.url.href.slice(0, 120)}`,
      );
    } else if (allowed.productionOnly && !production) {
      problems.push(`terceiro só permitido em produção (CONTEXT=production; preview e local não carregam terceiros, B277): ${where} ${resolved.url.href.slice(0, 120)}`);
    }
  }
  return problems;
}

/** Critério 6: teto próprio dos arquivos fora do orçamento por página (OWN_BUDGET_FILES). */
export function ownBudgetProblems(readAsset: ReadAsset): string[] {
  const problems: string[] = [];
  for (const [path, max] of Object.entries(OWN_BUDGET_FILES)) {
    const code = readAsset(path);
    if (code && gz(code) > max) problems.push(`${path.slice(1)}: orçamento de peso: ${kib(gz(code))} gzip > ${kib(max)} (teto próprio, OWN_BUDGET_FILES)`);
  }
  return problems;
}

/**
 * Critério 6 numa página. islandAllowed = a página é de ISLAND_ROUTES (só ela
 * tem o limite de JS da ilha; ver islandFiles()).
 */
export function weightProblems(html: string, readAsset: ReadAsset, islandAllowed = false, page = "index.html"): string[] {
  const weight = pageWeight(html, readAsset, page);
  const problems: string[] = [];
  const jsMax = islandAllowed ? WEIGHT_BUDGET.jsGzIsland : WEIGHT_BUDGET.jsGz;
  if (weight.cssGzCore > WEIGHT_BUDGET.cssGz) {
    problems.push(`orçamento de peso: CSS ${kib(weight.cssGzCore)} gzip > ${kib(WEIGHT_BUDGET.cssGz)} (sem as folhas de dado do dono)`);
  }
  if (weight.cssGz > WEIGHT_BUDGET.cssGzOwnerData) {
    problems.push(`orçamento de peso: CSS ${kib(weight.cssGz)} gzip > ${kib(WEIGHT_BUDGET.cssGzOwnerData)} (com as folhas when_data e o aviso de cookies)`);
  }
  if (weight.jsGz > jsMax) {
    problems.push(`orçamento de peso: JS ${kib(weight.jsGz)} gzip > ${kib(jsMax)} (${islandAllowed ? "página do wizard" : "página sem ilha permitida"})`);
  }
  if (weight.htmlGz > WEIGHT_BUDGET.htmlGz) problems.push(`orçamento de peso: HTML ${kib(weight.htmlGz)} gzip > ${kib(WEIGHT_BUDGET.htmlGz)}`);
  return problems;
}

/** Critério 6b: ilha React fora das rotas permitidas (CONTRACT §10). */
export function islandProblems(html: string, islandAllowed: boolean): string[] {
  if (islandAllowed) return [];
  return [...html.matchAll(/<astro-island\b[^>]*>/gi)].map((match) => {
    const component = match[0].match(/\bcomponent-url=["']?([^"'\s>]+)/i)?.[1] ?? "?";
    return `ilha React fora do wizard (CONTRACT §10: a única ilha é o wizard, rotas ${ISLAND_ROUTES.join(", ")}): ${component}`;
  });
}

/** Critério 6 por arquivo, em TODO o dist (não só _astro): .js/.mjs e fontes. */
export function assetProblems(files: { path: string; size: number }[]): string[] {
  const problems: string[] = [];
  for (const { path, size } of files) {
    if (/\.m?js$/.test(path) && size > WEIGHT_BUDGET.jsFileRaw) {
      problems.push(`${path}: orçamento de peso: arquivo JS com ${kib(size)} brutos > ${kib(WEIGHT_BUDGET.jsFileRaw)}`);
    }
    if (path.endsWith(".woff2") && size > WEIGHT_BUDGET.font) {
      problems.push(`${path}: orçamento de peso: fonte com ${kib(size)} > ${kib(WEIGHT_BUDGET.font)}`);
    }
  }
  return problems;
}

/** Critério 7: scripts inline clássicos acima de INLINE_SCRIPT_MAX (exceto o runtime de ilha do Astro). */
export function inlineScriptProblems(html: string): string[] {
  const problems: string[] = [];
  for (const tag of scriptTags(html)) {
    if (/\bsrc=/i.test(tag.attrs) || isModule(tag.attrs) || isData(tag.attrs)) continue;
    const size = Buffer.byteLength(tag.body);
    if (size <= INLINE_SCRIPT_MAX) continue;
    // Exceção única: o runtime que o Astro embute junto de <astro-island> (framework, não nosso código).
    if (isAstroIslandRuntime(tag.body) && /<astro-island\b/i.test(html)) continue;
    problems.push(
      `script inline síncrono com ${size} B > ${INLINE_SCRIPT_MAX} B (bloqueia a pintura; mova para /_astro com <script> do Astro ou compacte): ${tag.body.trim().slice(0, 60)}`,
    );
  }
  return problems;
}

/** Critério 9: <img> sem alt (o leitor de tela lê o nome do arquivo). */
export function altProblems(html: string): string[] {
  const markup = html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ");
  return [...markup.matchAll(/<img\b[^>]*>/gi)]
    .filter((match) => !/\salt\s*=/i.test(match[0]))
    .map((match) => `<img> sem alt (use alt="" se for decorativa): ${match[0].slice(0, 80)}`);
}

/**
 * Critério 8 (só CONTEXT=production): a Home publicada tem o WhatsApp com
 * número válido e nenhum HTML leva o número de TESTE. Lê o resultado do build
 * (o que vai ao ar), não a variável: pega também número sem o 55, que
 * hasWhatsappNumber() rejeita e faz os botões sumirem em silêncio.
 * allowTestNumber só para os builds de TESTE que simulam produção
 * (LEMAMON_TESTE_PRODUCAO_SIMULADA=1, definido pelo vitest.config.ts).
 */
export function whatsappLaunchProblems({
  context,
  homeHtml,
  htmlWithTestNumber = [],
  allowTestNumber = false,
}: {
  context: string | undefined;
  homeHtml: string | null;
  htmlWithTestNumber?: string[];
  allowTestNumber?: boolean;
}): string[] {
  if (context !== "production") return [];
  const problems: string[] = [];
  const numbers = [...(homeHtml ?? "").matchAll(/https:\/\/wa\.me\/(\d+)/g)].map((m) => m[1] ?? "");
  if (!numbers.some((number) => /^55\d{10,11}$/.test(number))) {
    problems.push(
      "PUBLIC_WHATSAPP_NUMBER ausente ou inválido: precisa ser 55 + DDD + número, só dígitos (playbook 00 §A1). Sem ele, o site vai ao ar sem nenhum botão de WhatsApp",
    );
  }
  if (!allowTestNumber && htmlWithTestNumber.length) {
    problems.push(
      `PUBLIC_WHATSAPP_NUMBER é o número de TESTE ${TEST_WHATSAPP_NUMBER} (E2E), que não pode ir ao ar: cadastre o número comercial no painel do Netlify (playbook 00 §A1). Páginas: ${htmlWithTestNumber.slice(0, 3).join(", ")}`,
    );
  }
  return problems;
}

function allFiles(root: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isDirectory()) out.push(...allFiles(full));
    else out.push(full);
  }
  return out;
}

export function verifyDist(distDir: string, env: Record<string, string | undefined> = process.env): string[] {
  const problems: string[] = [];
  const expected = new Map<string, string>();
  const gatedPresence = new Map<string, { present: string[]; missing: string[] }>();

  for (const { key, locale, path } of staticRouteEntries()) {
    const def = routeDef(key);
    const file = fileForPath(path);
    const exists = existsSync(join(distDir, file));
    if (def.gate) {
      const entry = gatedPresence.get(key) ?? { present: [], missing: [] };
      (exists ? entry.present : entry.missing).push(file);
      gatedPresence.set(key, entry);
    }
    if (!exists) {
      if (!def.gate) problems.push(`rota ausente: ${key} (${locale}) → ${file}`);
      continue;
    }
    if (def.h1) expected.set(file, tDynamic(locale, def.h1));
  }

  for (const [key, { present, missing }] of gatedPresence) {
    if (present.length && missing.length) {
      problems.push(`when_data "${key}" gerada só em parte dos idiomas: falta ${missing.join(", ")}`);
    }
  }

  const readAsset: ReadAsset = (urlPath) => {
    const full = join(distDir, decodeURIComponent(urlPath.split(/[?#]/)[0] ?? "").replace(/^\/+/, ""));
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full) : null;
  };
  const withTestNumber: string[] = [];
  const allowedIslands = islandFiles();

  for (const full of htmlFiles(distDir)) {
    const file = relative(distDir, full).split(sep).join("/");
    const html = readFileSync(full, "utf8");
    const islandAllowed = allowedIslands.has(file);
    for (const problem of replayProblems(html)) problems.push(`${file}: ${problem}`);
    for (const problem of placeholderProblems(html)) problems.push(`${file}: ${problem}`);
    for (const problem of islandProblems(html, islandAllowed)) problems.push(`${file}: ${problem}`);
    for (const problem of weightProblems(html, readAsset, islandAllowed, file)) problems.push(`${file}: ${problem}`);
    for (const problem of thirdPartyProblems(html, readAsset, { production: env.CONTEXT === "production", page: file })) problems.push(`${file}: ${problem}`);
    for (const problem of inlineScriptProblems(html)) problems.push(`${file}: ${problem}`);
    for (const problem of altProblems(html)) problems.push(`${file}: ${problem}`);
    if (html.includes(`wa.me/${TEST_WHATSAPP_NUMBER}`)) withTestNumber.push(file);
    const h1s = h1sOf(html);
    if (h1s.length !== 1) {
      problems.push(`${file}: ${h1s.length} <h1> (precisa de exatamente 1)`);
      continue;
    }
    const want = expected.get(file);
    if (want !== undefined && h1s[0] !== textOf(want)) {
      problems.push(`${file}: H1 "${h1s[0]}" ≠ i18n "${textOf(want)}"`);
    }
  }

  const files = allFiles(distDir).map((full) => ({ path: relative(distDir, full).split(sep).join("/"), size: statSync(full).size }));
  problems.push(...assetProblems(files));
  problems.push(...ownBudgetProblems(readAsset));

  const home = join(distDir, "index.html");
  problems.push(
    ...whatsappLaunchProblems({
      context: env.CONTEXT,
      homeHtml: existsSync(home) ? readFileSync(home, "utf8") : null,
      htmlWithTestNumber: withTestNumber,
      allowTestNumber: env.LEMAMON_TESTE_PRODUCAO_SIMULADA === "1",
    }),
  );
  return problems;
}

export default function verifyBuild(): AstroIntegration {
  return {
    name: "lemamon:verify-build",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const problems = verifyDist(fileURLToPath(dir));
        if (problems.length) {
          throw new Error(`verify-build: ${problems.length} problema(s)\n - ${problems.join("\n - ")}`);
        }
        logger.info(
          "rotas e H1 conferidos com src/config/routes.ts e src/i18n; placeholders, ilha só no wizard, orçamento de peso (todo CSS/JS do site), terceiros só da lista, scripts inline e alt das imagens também",
        );
      },
    },
  };
}
