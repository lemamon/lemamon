/**
 * Rascunho do wizard no localStorage e resumo do envio no sessionStorage —
 * BLUEPRINT §7.1 (dono: conversion). SEGURO PARA O CLIENTE.
 *
 * Contrato entre a ilha (grava/lê) e o script inline global do shell (troca o
 * CTA para "Continuar meu pedido" e APAGA rascunho vencido em qualquer página —
 * i18n _notes.ttl). O script inline recebe DRAFT_KEY e DRAFT_TTL_MS por
 * define:vars, nunca por string repetida. Campos que o shell lê: savedAt e step.
 *
 * Privacidade (i18n quote._notes.resume_banner): o rascunho guarda SÓ as
 * respostas das 6 perguntas, o passo, a atribuição, o idioma, o código do pedido
 * e o timestamp. Nome, e-mail, telefone, empresa e "Mais detalhes" nunca vão
 * para o localStorage; o que /orcamento/enviado precisa deles vai só no resumo
 * do envio, no sessionStorage (some quando a aba fecha).
 *
 * Todo acesso a storage é try/catch: sem storage (aba anônima, cota, bloqueio),
 * o fluxo funciona e só não retoma.
 */

/** Chave do rascunho. Mudar a versão invalida rascunhos antigos. */
export const DRAFT_KEY = "lemamon:orcamento:v2";

/** 30 dias (o texto de privacy.sections.data_collected.draft_ttl depende disso). */
export const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type DraftStep = 1 | 2 | 3 | 4 | 5 | 6 | "resumo" | "contato";

export const DRAFT_STEPS: readonly DraftStep[] = [1, 2, 3, 4, 5, 6, "resumo", "contato"];

export interface Draft {
  v: 2;
  /** Date.now() da última gravação. */
  savedAt: number;
  /** Date.now() do "Começar" (tempo mínimo de preenchimento). */
  startedAt?: number;
  step: DraftStep;
  lang: "pt" | "en" | "es";
  /** Respostas por id estável (§7.3): string (única/texto) ou string[] (múltipla). */
  answers: Record<string, string | string[]>;
  /** utm_*, gclid, referrer, página de entrada, origem, servico, ref, entrada. */
  attribution: Record<string, string>;
  /** LEM-AAAAMMDD-XXXX, gerado ao abrir o resumo (i18n quote._notes.protocol). */
  protocol?: string;
}

/** Folga para relógio adiantado: savedAt mais de 1 dia no futuro é rascunho adulterado. */
export const DRAFT_FUTURE_SKEW_MS = 24 * 60 * 60 * 1000;

/**
 * Vencido, ou com data impossível (no futuro além da folga, ou fora do que um
 * Date aceita): um savedAt adulterado derrubava o banner de retomada com
 * "Invalid time value" e deixava o "Começar" morto (backlog B234).
 */
export function isDraftExpired(draft: Pick<Draft, "savedAt">, now = Date.now()): boolean {
  return (
    !Number.isFinite(draft.savedAt) ||
    draft.savedAt <= 0 ||
    draft.savedAt - now > DRAFT_FUTURE_SKEW_MS ||
    now - draft.savedAt > DRAFT_TTL_MS
  );
}

/** "?etapa=" → passo; qualquer outro valor → null. */
export function parseStep(value: string | null | undefined): DraftStep | null {
  if (value === "resumo" || value === "contato") return value;
  if (value && /^[1-6]$/.test(value)) return Number(value) as DraftStep;
  return null;
}

function isRecordOfStrings(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

function isAnswers(value: unknown): value is Draft["answers"] {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (item) => typeof item === "string" || (Array.isArray(item) && item.every((entry) => typeof entry === "string")),
    )
  );
}

/** JSON do storage → rascunho válido, ou null (formato errado, versão velha, vencido). */
export function parseDraft(raw: string | null | undefined, now = Date.now()): Draft | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const draft = data as Partial<Draft>;
  if (draft.v !== 2 || typeof draft.savedAt !== "number" || isDraftExpired({ savedAt: draft.savedAt }, now)) return null;
  const step = typeof draft.step === "number" ? parseStep(String(draft.step)) : parseStep(draft.step);
  if (!step) return null;
  if (draft.lang !== "pt" && draft.lang !== "en" && draft.lang !== "es") return null;
  if (!isAnswers(draft.answers) || !isRecordOfStrings(draft.attribution)) return null;
  return {
    v: 2,
    savedAt: draft.savedAt,
    startedAt:
      typeof draft.startedAt === "number" && Number.isFinite(draft.startedAt) && draft.startedAt > 0 && draft.startedAt <= now + DRAFT_FUTURE_SKEW_MS
        ? draft.startedAt
        : undefined,
    step,
    lang: draft.lang,
    answers: draft.answers,
    attribution: draft.attribution,
    protocol: typeof draft.protocol === "string" ? draft.protocol : undefined,
  };
}

function localStore(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function sessionStore(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

/** Rascunho válido; um rascunho vencido ou corrompido é APAGADO ao ser encontrado. */
export function readDraft(storage: Storage | null = localStore(), now = Date.now()): Draft | null {
  try {
    const raw = storage?.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = parseDraft(raw, now);
    if (!draft) storage?.removeItem(DRAFT_KEY);
    return draft;
  } catch {
    return null;
  }
}

/** Grava o rascunho. Devolve false se o storage não aceitou (o fluxo segue). */
export function writeDraft(
  draft: Omit<Draft, "v" | "savedAt">,
  storage: Storage | null = localStore(),
  now = Date.now(),
): boolean {
  if (!storage) return false;
  try {
    const value: Draft = { v: 2, savedAt: now, ...draft };
    storage.setItem(DRAFT_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Apaga o rascunho. Chamar SÓ depois do sucesso confirmado do envio (§7.1) ou no "Começar de novo". */
export function clearDraft(storage: Storage | null = localStore()): void {
  try {
    storage?.removeItem(DRAFT_KEY);
  } catch {
    // Nada a limpar.
  }
}

/* ------------------------------------------------------------------ *
 * Resumo do envio para /orcamento/enviado (sessionStorage)
 * ------------------------------------------------------------------ */

export const SENT_SUMMARY_KEY = "lemamon:orcamento:enviado:v1";

export type ContactChannel = "whatsapp" | "email" | "phone_call";

export interface SentLine {
  /** Rótulo curto da pergunta (steps.*.short_label). */
  label: string;
  /** Resposta curta, já no idioma do envio. */
  value: string;
}

export interface SentSummary {
  v: 1;
  protocol: string;
  lang: "pt" | "en" | "es";
  /** Só o primeiro nome (i18n quote._notes.h1). */
  firstName: string;
  channel: ContactChannel;
  /** P6 (destaque de "quem decide" no "Para aproveitar"). */
  role: string;
  /** P4 = asap ou data travante preenchida. */
  deadlineUrgent: boolean;
  /** Serviços (chaves de routes.ts) do tipo marcado na P2, para os cases do "Enquanto isso". */
  services: string[];
  /** Respostas em linhas curtas (mesma montagem do WhatsApp). */
  lines: SentLine[];
  /** Nome, e-mail, telefone, empresa, canal: valores já formatados. */
  contacts: string[];
  /**
   * Envio real, medido (lead_submitted saiu). false no robô descartado em
   * silêncio e no envio de teste do deploy preview: a página abre igual, mas
   * sem lead_success_view (backlog B341).
   */
  measured: boolean;
}

/** Prefixo da marca "pós-envio já medido" por pedido (lead_success_view uma vez por código). */
export const SENT_VIEWED_KEY_PREFIX = "lemamon:orcamento:enviado:visto:";

export function parseSentSummary(raw: string | null | undefined): SentSummary | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<SentSummary>;
    if (data.v !== 1 || typeof data.protocol !== "string" || typeof data.firstName !== "string") return null;
    if (data.channel !== "whatsapp" && data.channel !== "email" && data.channel !== "phone_call") return null;
    if (!Array.isArray(data.lines) || !Array.isArray(data.contacts)) return null;
    return {
      v: 1,
      protocol: data.protocol,
      lang: data.lang === "en" || data.lang === "es" ? data.lang : "pt",
      firstName: data.firstName,
      channel: data.channel,
      role: typeof data.role === "string" ? data.role : "",
      deadlineUrgent: data.deadlineUrgent === true,
      services: Array.isArray(data.services) ? data.services.filter((item) => typeof item === "string") : [],
      lines: data.lines.filter(
        (line): line is SentLine => typeof line?.label === "string" && typeof line?.value === "string",
      ),
      contacts: data.contacts.filter((item): item is string => typeof item === "string" && item.trim() !== ""),
      measured: data.measured === true,
    };
  } catch {
    return null;
  }
}

export function writeSentSummary(summary: SentSummary, storage: Storage | null = sessionStore()): boolean {
  try {
    storage?.setItem(SENT_SUMMARY_KEY, JSON.stringify(summary));
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function readSentSummary(storage: Storage | null = sessionStore()): SentSummary | null {
  try {
    return parseSentSummary(storage?.getItem(SENT_SUMMARY_KEY));
  } catch {
    return null;
  }
}
