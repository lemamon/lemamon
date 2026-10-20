/**
 * Loader de copy tipado. TODO texto visível do site vem daqui (src/i18n/*.json).
 *
 * - O tipo é derivado de pt.json; en.json e es.json têm paridade garantida por
 *   scripts/check-i18n.mjs (yarn i18n:check).
 * - Chaves que começam com "_" são notas internas: somem do tipo e do runtime.
 * - t(locale, "a.b.c", vars) devolve texto; a chave é checada pelo TypeScript.
 * - getSection(locale, "home.hero") devolve o objeto (ou array) inteiro.
 *
 * Uso em .astro:  t(locale, "home.hero.title")
 * Uso em ilha React: receba os textos já resolvidos por props (getSection) e
 * interpole no cliente com interpolate(). Nunca importe o JSON inteiro na ilha.
 */

import en from "./en.json";
import es from "./es.json";
import pt from "./pt.json";
import type { Locale } from "./locales";

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, isLocale, type Locale, type LocaleMeta } from "./locales";

/* ------------------------------------------------------------------ *
 * Tipos derivados do JSON
 * ------------------------------------------------------------------ */

/** Remove as chaves de nota ("_...") em qualquer profundidade. */
export type StripNotes<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? StripNotes<U>[]
    : T extends object
      ? { [K in keyof T as K extends `_${string}` ? never : K]: StripNotes<T[K]> }
      : T;

/** Árvore de copy sem notas. */
export type Messages = StripNotes<typeof pt>;

/** Caminhos "a.b.c" que terminam em texto (não atravessa arrays: use getSection). */
export type LeafPath<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends readonly unknown[]
          ? never
          : `${K}.${LeafPath<T[K]>}`;
    }[keyof T & string]
  : never;

/** Caminhos "a.b" que terminam em objeto ou array. */
export type NodePath<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? never
        : T[K] extends readonly unknown[]
          ? K
          : K | `${K}.${NodePath<T[K]>}`;
    }[keyof T & string]
  : never;

/** Tipo do valor em um caminho "a.b.c". */
export type PathValue<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? PathValue<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type TextKey = LeafPath<Messages>;
export type SectionKey = NodePath<Messages>;
export type Vars = Readonly<Record<string, string | number>>;

/* ------------------------------------------------------------------ *
 * Runtime
 * ------------------------------------------------------------------ */

const RAW: Record<Locale, unknown> = { pt, en, es };
const cache = new Map<Locale, Messages>();

function stripNotes(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(stripNotes);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith("_")) out[key] = stripNotes(value);
    }
    return out;
  }
  return node;
}

/** Árvore inteira de um idioma, sem notas (memoizada). */
export function messages(locale: Locale): Messages {
  let tree = cache.get(locale);
  if (!tree) {
    const raw = RAW[locale];
    if (!raw) throw new Error(`[i18n] idioma desconhecido: ${String(locale)}`);
    tree = stripNotes(raw) as Messages;
    cache.set(locale, tree);
  }
  return tree;
}

function lookup(locale: Locale, path: string): unknown {
  if (path.split(".").some((segment) => segment.startsWith("_"))) {
    throw new Error(`[i18n] "${path}" é nota interna (prefixo "_") e não pode ser renderizada`);
  }
  let node: unknown = messages(locale);
  for (const segment of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return node;
}

const PLACEHOLDER = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/** Nomes dos placeholders de um texto: "Olá, {nome}" → ["nome"]. */
export function placeholders(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map((match) => match[1] as string);
}

/**
 * Troca {placeholder} por vars. Lança erro se faltar variável: um texto com
 * "{nome}" cru nunca vai ao ar (BLUEPRINT §4: dado parcial não renderiza).
 * Pode ser usado no cliente (ilha/script) com textos vindos de getSection/tRaw.
 */
export function interpolate(template: string, vars: Vars = {}): string {
  return template.replace(PLACEHOLDER, (_whole, name: string) => {
    const value = vars[name];
    if (value === undefined || value === null || value === "") {
      throw new Error(`[i18n] placeholder {${name}} sem valor em "${template.slice(0, 60)}…"`);
    }
    return String(value);
  });
}

/** Texto de uma chave, com interpolação. A chave é checada pelo TypeScript. */
export function t(locale: Locale, key: TextKey, vars?: Vars): string {
  const value = lookup(locale, key);
  if (typeof value !== "string") throw new Error(`[i18n] chave sem texto: ${locale}:${key}`);
  return interpolate(value, vars);
}

/** Texto cru, SEM interpolar (para interpolar no cliente). */
export function tRaw(locale: Locale, key: TextKey): string {
  const value = lookup(locale, key);
  if (typeof value !== "string") throw new Error(`[i18n] chave sem texto: ${locale}:${key}`);
  return value;
}

/** Objeto ou array inteiro de uma seção, sem notas, tipado pelo caminho. */
export function getSection<K extends SectionKey>(locale: Locale, key: K): PathValue<Messages, K> {
  const value = lookup(locale, key);
  if (value === undefined || value === null || typeof value !== "object") {
    throw new Error(`[i18n] seção inexistente: ${locale}:${key}`);
  }
  return value as PathValue<Messages, K>;
}

/** Verificação dinâmica (para caminhos montados em runtime, ex. "services." + chave). */
export function hasText(locale: Locale, key: string): boolean {
  return typeof lookup(locale, key) === "string";
}

/** Igual a t(), para caminhos montados em runtime. Prefira t() sempre que a chave for literal. */
export function tDynamic(locale: Locale, key: string, vars?: Vars): string {
  const value = lookup(locale, key);
  if (typeof value !== "string") throw new Error(`[i18n] chave sem texto: ${locale}:${key}`);
  return interpolate(value, vars);
}
