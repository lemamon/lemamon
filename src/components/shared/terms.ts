/**
 * Termos explicados (BLUEPRINT §5.9) — helpers puros de <Term> e <TermText>.
 * Dono: home. Sem dependência de runtime: seguro para testes.
 */

/** Chaves de shared.terms (exceto a variante written_feedback_with_content). */
export type TermId = "prioritized_scope" | "mvp" | "api" | "discovery_sprint" | "support" | "written_feedback";

/**
 * Rótulo do termo a partir da própria explicação do i18n, que sempre começa
 * por "Termo: explicação" (ex.: "MVP (produto mínimo viável): …" → "MVP").
 * Assim o rótulo segue o idioma sem chave nova.
 */
export function termLabel(explanation: string): string {
  const head = explanation.split(":")[0] ?? explanation;
  return head.replace(/\s*\(.*\)\s*$/, "").trim();
}

export interface TermMatch {
  term: TermId;
  start: number;
  end: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Primeira ocorrência do rótulo no texto, sem diferenciar maiúsculas e
 * estendida até o fim da palavra ("MVP" casa "MVPs"). null se não achar.
 */
export function findTerm(text: string, term: TermId, label: string): TermMatch | null {
  if (!label) return null;
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(label)}[\\p{L}]*`, "iu");
  const hit = re.exec(text);
  return hit ? { term, start: hit.index, end: hit.index + hit[0].length } : null;
}

export type Segment = { kind: "text"; value: string } | { kind: "term"; term: TermId; value: string };

/** Quebra o texto em trechos, marcando a 1ª menção de cada termo (sem sobreposição). */
export function splitTerms(text: string, wanted: ReadonlyArray<{ term: TermId; label: string }>): Segment[] {
  const matches = wanted
    .map(({ term, label }) => findTerm(text, term, label))
    .filter((match): match is TermMatch => match !== null)
    .sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue; // sobreposição: fica a primeira
    if (match.start > cursor) segments.push({ kind: "text", value: text.slice(cursor, match.start) });
    segments.push({ kind: "term", term: match.term, value: text.slice(match.start, match.end) });
    cursor = match.end;
  }
  if (cursor < text.length) segments.push({ kind: "text", value: text.slice(cursor) });
  return segments;
}

/** Trecho de texto ou termo com a pontuação que fica colada nele (B001). */
export type GluedSegment =
  | { kind: "text"; value: string }
  | { kind: "term"; term: TermId; value: string; before: string; after: string };

/** Pontuação que fecha ("MVPs." "API," "(MVP)") e que abre ("(MVP" "¿MVP"). */
const CLOSING_PUNCT = /^[.,;:!?…)\]}»”’"'%]+/u;
const OPENING_PUNCT = /[(\[{«“‘"'¿¡]+$/u;

/**
 * Cola no termo a pontuação vizinha (B001). O termo vira <button> (toggletip),
 * que o navegador diagrama como caixa atômica: entre ela e o "." seguinte há
 * oportunidade de quebra, e o ponto cairia sozinho no começo da linha de
 * baixo ("…e MVPs / . Você aprova…", hero da Home em 360px). <TermText> põe o
 * termo e essa pontuação num span .no-break; o nome acessível do botão não
 * muda (a pontuação fica fora dele). Texto preservado: before + value + after
 * reconstroem o original.
 */
export function glueTermPunctuation(segments: readonly Segment[]): GluedSegment[] {
  const out: GluedSegment[] = segments.map((segment) =>
    segment.kind === "term" ? { ...segment, before: "", after: "" } : { ...segment },
  );
  out.forEach((segment, i) => {
    if (segment.kind !== "term") return;
    const prev = out[i - 1];
    const next = out[i + 1];
    const opening = prev?.kind === "text" ? OPENING_PUNCT.exec(prev.value)?.[0] : undefined;
    if (prev?.kind === "text" && opening) {
      segment.before = opening;
      prev.value = prev.value.slice(0, -opening.length);
    }
    const closing = next?.kind === "text" ? CLOSING_PUNCT.exec(next.value)?.[0] : undefined;
    if (next?.kind === "text" && closing) {
      segment.after = closing;
      next.value = next.value.slice(closing.length);
    }
  });
  return out.filter((segment) => segment.kind === "term" || segment.value !== "");
}

/**
 * Primeira menção de cada termo numa página (§5.9): percorre os textos na
 * ordem em que aparecem e devolve, por posição (`slot`), os termos que devem
 * virar toggletip ali. Um termo que não aparece em nenhum texto fica de fora.
 */
export function planFirstMentions(
  candidates: ReadonlyArray<readonly [slot: string, text: string]>,
  wanted: ReadonlyArray<{ term: TermId; label: string }>,
): Record<string, TermId[]> {
  const plan: Record<string, TermId[]> = {};
  for (const { term, label } of wanted) {
    const hit = candidates.find(([, text]) => findTerm(text, term, label) !== null);
    if (hit) (plan[hit[0]] ??= []).push(term);
  }
  return plan;
}
