/**
 * Breakpoints espelhados de tokens.css (dono: home), para scripts vanilla e a
 * ilha React (matchMedia). Em CSS, use os valores literais em @media.
 *
 * A escala é em px (de 16px de fonte), mas as media queries do chrome (header,
 * drawer, barra fixa, WhatsApp flutuante) e as daqui saem em `em`: em @media, 1em
 * é a fonte padrão do NAVEGADOR (não a do <html>), então quem aumenta o "Tamanho
 * da fonte" do Chrome para 20 ou 24px recebe o layout de uma tela mais estreita,
 * em vez de um header desktop que transborda (F13, AUDITORIA-CONVERSAO). Com a
 * fonte padrão de 16px, 48em = 768px, 64em = 1024px etc.: nada muda. O par
 * max-width é o valor menos 0,001em (767.98px → 47.999em), como no CSS.
 */
export const BREAKPOINTS = {
  xs: 380,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Fonte padrão do navegador em que a escala de px foi desenhada. */
const BASE_FONT_PX = 16;

/** 768 → "48em"; com `below`, o limite logo abaixo: 768 → "47.999em". */
export function em(px: number, below = false): string {
  const value = px / BASE_FONT_PX - (below ? 0.001 : 0);
  return `${Number(value.toFixed(3))}em`;
}

/** "(min-width: 48em)" etc. */
export function minWidth(breakpoint: Breakpoint): string {
  return `(min-width: ${em(BREAKPOINTS[breakpoint])})`;
}

/** Navegação (BLUEPRINT §8.1): mobile < md ≤ tablet < lg ≤ desktop. */
export const NAV_QUERIES = {
  mobile: `(max-width: ${em(BREAKPOINTS.md, true)})`,
  tablet: `${minWidth("md")} and (max-width: ${em(BREAKPOINTS.lg, true)})`,
  desktop: minWidth("lg"),
} as const;
