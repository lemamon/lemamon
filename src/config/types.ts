/**
 * Tipos e checagens de preenchimento compartilhados pelos configs.
 * Sem dependências de runtime: pode ser importado por ilhas React.
 */

import { LOCALES, type Locale } from "../i18n/locales";

/** Um valor por idioma. Todo texto de config que aparece na página é Localized. */
export type Localized<T = string> = Record<Locale, T>;

/** Texto preenchido nos 3 idiomas (dado parcial não renderiza — BLUEPRINT §4). */
export function isFilledText(value: Localized | null | undefined): value is Localized {
  return Boolean(value) && LOCALES.every((locale) => typeof value?.[locale] === "string" && value[locale].trim() !== "");
}

/** Lista preenchida nos 3 idiomas, com pelo menos `min` itens não vazios em cada um. */
export function isFilledList(value: Localized<string[]> | null | undefined, min = 1): value is Localized<string[]> {
  return (
    Boolean(value) &&
    LOCALES.every((locale) => {
      const list = value?.[locale];
      return Array.isArray(list) && list.length >= min && list.every((item) => typeof item === "string" && item.trim() !== "");
    })
  );
}
