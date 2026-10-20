/**
 * Chaves de storage dos scripts do shell, num módulo à parte (dono: shell).
 * Scripts do cliente importam DAQUI, e não de head-inline.ts: importar de lá
 * levaria a string inteira do script do <head> para o bundle de cada página.
 */

/** localStorage: "1" = a pessoa fechou o aviso de idioma. */
export const LANG_SUGGEST_DISMISSED_KEY = "lemamon:aviso-idioma:fechado";

/**
 * localStorage: escolha do aviso de cookies ("aceito" | "recusado"), só quando
 * dados/dono.json › privacidade.baseAnuncios = "consentimento" (backlog B344).
 * Lida pelo snippet do gtag no <head> (src/scripts/gtag-inline.ts) e por
 * src/scripts/consent.ts.
 */
export const CONSENT_KEY = "lemamon:consentimento:v1";
export const CONSENT_ACCEPTED = "aceito";
export const CONSENT_DECLINED = "recusado";

/**
 * localStorage: tema escolhido no botão de tema ("dark" | "light"; backlog
 * B208). Sem escolha salva, vale o do sistema (prefers-color-scheme). Lida pelo
 * script inline do <head> (head-inline.ts), antes da 1ª pintura, e gravada por
 * src/scripts/theme.ts.
 */
export const THEME_KEY = "lemamon-theme";
export const THEME_DARK = "dark";
export const THEME_LIGHT = "light";
