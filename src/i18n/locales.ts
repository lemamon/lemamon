/**
 * Idiomas do site (BLUEPRINT §9). Arquivo sem dependências de runtime: é
 * importado pelo astro.config.mjs (via src/config/routes.ts), então não pode
 * importar JSON de copy, `astro:*` nem aliases `@/`.
 */

export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";

export interface LocaleMeta {
  /** Valor de <html lang>. */
  htmlLang: string;
  /** Valor de hreflang nos <link rel="alternate"> e no sitemap. */
  hreflang: string;
  /** Valor de og:locale. */
  ogLocale: string;
  /** Prefixo de URL. pt-BR fica na raiz. */
  prefix: "" | "/en" | "/es";
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  pt: { htmlLang: "pt-BR", hreflang: "pt-BR", ogLocale: "pt_BR", prefix: "" },
  en: { htmlLang: "en", hreflang: "en", ogLocale: "en_US", prefix: "/en" },
  es: { htmlLang: "es", hreflang: "es", ogLocale: "es_LA", prefix: "/es" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
