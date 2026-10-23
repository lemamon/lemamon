/**
 * Regras tipográficas de exibição (dono: home). Seguro para testes e cliente.
 *
 * Número e unidade não se separam no fim da linha: "2 semanas", "45 minutos",
 * "45-minute", "2-week". A quebra "45- / minute" ou "2 / semanas" lê como
 * descuido, principalmente em título. A Motiva Sans não tem U+2011 (hífen
 * inseparável) nem U+2060, então o par vai num span com white-space: nowrap
 * (classe global .no-break) em vez de trocar caracteres.
 *
 * Separador " · " (eyebrow "Para PMEs e startups · São Paulo, SP"): se a
 * frase não couber numa linha, a quebra cai ANTES do "·", nunca depois
 * (quote._notes.entry_placement). O "·" vai junto com o trecho seguinte, sem
 * quebra dentro dele: "For SMBs and startups / · São Paulo, Brazil", e não
 * "For SMBs and startups · / São Paulo, Brazil".
 *
 * Só para o texto VISÍVEL: JSON-LD, meta e atributos recebem o texto original.
 */

/** Número seguido de espaço ou hífen e de uma palavra (em qualquer idioma). */
const NUMBER_UNIT = /\d+(?:[.,]\d+)?[  -]\p{L}+/gu;

export interface NoBreakSegment {
  text: string;
  /** true = o trecho não quebra (número + unidade). */
  keep: boolean;
}

/** Divide o texto em trechos livres e trechos "número + unidade" inseparáveis. */
export function noBreakSegments(text: string): NoBreakSegment[] {
  const segments: NoBreakSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(NUMBER_UNIT)) {
    const at = match.index ?? 0;
    if (at > last) segments.push({ text: text.slice(last, at), keep: false });
    segments.push({ text: match[0], keep: true });
    last = at + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), keep: false });
  return segments;
}

/** " · " com qualquer espaço em volta (inclusive NBSP). */
const SEPARATOR = /\s+·\s+/u;

/**
 * Divide no separador " · ": o 1º trecho fica livre (quebra normal) e cada
 * trecho seguinte, já com o "· " na frente, não quebra por dentro. O espaço
 * ANTES do "·" fica livre: é ali que a linha quebra. Os pares número +
 * unidade do 1º trecho continuam protegidos (noBreakSegments).
 */
export function separatorSegments(text: string): NoBreakSegment[] {
  const [first = "", ...rest] = text.split(SEPARATOR);
  if (rest.length === 0) return noBreakSegments(text);
  const segments = noBreakSegments(first);
  for (const part of rest) {
    segments.push({ text: " ", keep: false });
    segments.push({ text: `· ${part}`, keep: true });
  }
  return segments;
}
