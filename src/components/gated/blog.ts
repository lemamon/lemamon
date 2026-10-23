/**
 * Utilitários do blog (só pt-BR, dono: gated).
 *
 * Datas: o frontmatter (AAAA-MM-DD) vira meia-noite UTC; formatar em UTC evita
 * mostrar o dia anterior no fuso de Brasília.
 */

const FORMAT = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "12 de março de 2026". */
export function formatPostDate(date: Date): string {
  return FORMAT.format(date);
}

/** "2026-03-12" (atributo datetime e JSON-LD). */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Chave em Astro.locals com o texto e a origem do <CtaMeio /> do post em renderização. */
export const POST_MID_CTA_LOCAL = "lemamonPostMidCta";

export interface PostMidCtaContext {
  text: string;
  origem: string;
}
