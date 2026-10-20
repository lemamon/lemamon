/**
 * Breakpoints espelhados de tokens.css (dono: home), para scripts vanilla e a
 * ilha React (matchMedia). Em CSS, use os valores literais em @media.
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

/** "(min-width: 768px)" etc. */
export function minWidth(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
}

/** Navegação (BLUEPRINT §8.1): mobile < md ≤ tablet < lg ≤ desktop. */
export const NAV_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.md - 0.02}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 0.02}px)`,
  desktop: minWidth("lg"),
} as const;
