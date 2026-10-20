/**
 * Montagem do envio do wizard — BLUEPRINT §7.1, §7.5, §7.6 e §7.10 (dono:
 * conversion). PURA: atribuição, validação do contato, payload do form
 * `briefing` e o resumo que /orcamento/enviado lê do sessionStorage.
 */

import { externalReferrer, QUOTE_PARAM_KEYS, readCampaign, UTM_KEYS, type EventParams, type Touch } from "../../lib/analytics";
import type { ContactChannel, SentSummary } from "../../lib/draft";
import {
  briefingSubject,
  formatPhone,
  HONEYPOT_FIELD,
  isFilled,
  isValidEmail,
  isValidPhone,
  type FormFields,
  type PhoneLocale,
} from "../../lib/forms";
import { CONSENT_ACCEPTED, CONSENT_KEY } from "../../scripts/storage-keys";
import { fillTemplate } from "../../lib/whatsapp";
import type { RulesCopy } from "./copy";
import { readableSummary } from "./messages";
import {
  activePains,
  answerOf,
  isDeadlineUrgent,
  isLive,
  servicesFromAnswers,
  type Answers,
  type ModelFlags,
} from "./model";
import { answeredChips, type AnswerChip } from "./rules";
import type { LeadScore } from "./score";

/* ------------------------------------------------------------------ *
 * Atribuição (§7.1)
 * ------------------------------------------------------------------ */

export interface AttributionInput {
  /** location.pathname + search da página do wizard, sem o ?etapa=. */
  pathname: string;
  search: string;
  host: string;
  /** document.referrer. */
  referrer: string;
  /** Toque da sessão gravado pelo script global do shell (rememberLanding). */
  sessionTouch: Touch | null;
}

/**
 * utm_*, gclid, referrer, página de entrada e os parâmetros do CTA (origem,
 * servico, ref, entrada). O que está na URL do wizard ganha do toque da sessão.
 */
export function buildAttribution({ pathname, search, host, referrer, sessionTouch }: AttributionInput): Record<string, string> {
  const params = new URLSearchParams(search);
  params.delete("etapa");
  const campaign = readCampaign(params.toString());
  const attribution: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = campaign.utm[key] ?? sessionTouch?.utm[key];
    if (value) attribution[key] = value;
  }
  const gclid = campaign.gclid || sessionTouch?.gclid || "";
  if (gclid) attribution.gclid = gclid;
  for (const key of QUOTE_PARAM_KEYS) {
    const value = (params.get(key) ?? "").trim().slice(0, 120);
    if (value) attribution[key] = value;
  }
  const ref = sessionTouch?.referrer || externalReferrer(referrer, host);
  if (ref) attribution.referrer = ref;
  const query = params.toString();
  attribution.landing = sessionTouch?.landing || `${pathname}${query ? `?${query}` : ""}`;
  attribution.entry_page = pathname;
  return attribution;
}

/* ------------------------------------------------------------------ *
 * gclid e o modo consentimento (backlog B342)
 * ------------------------------------------------------------------ */

/** Ids de clique de anúncio do Google que podem vir na URL de entrada. */
export const AD_CLICK_PARAMS = ["gclid", "gbraid", "wbraid"] as const;

/**
 * O gclid pode ir no envio? Com privacidade.baseAnuncios = "legitimo_interesse"
 * (consentRequired = false), sim. Com "consentimento", só se a pessoa ACEITOU
 * no aviso de cookies (localStorage CONSENT_KEY = "aceito"): recusou, ou nunca
 * respondeu, o pedido sai sem gclid, e o comercial não tem o que importar no
 * Google Ads (playbook 07 §4.4). A Política promete exatamente isso
 * (legal_basis.items.ads_measurement_with_consent). Sem storage: não.
 */
export function gclidAllowed(consentRequired: boolean, storage: Pick<Storage, "getItem"> | null): boolean {
  if (!consentRequired) return true;
  try {
    return storage?.getItem(CONSENT_KEY) === CONSENT_ACCEPTED;
  } catch {
    return false;
  }
}

/** Tira um parâmetro de clique de anúncio de um caminho com query ("/?gclid=x&utm_source=y" → "/?utm_source=y"). */
function stripAdClickParams(path: string): string {
  const index = path.indexOf("?");
  if (index < 0) return path;
  const params = new URLSearchParams(path.slice(index + 1));
  for (const key of AD_CLICK_PARAMS) params.delete(key);
  const query = params.toString();
  return `${path.slice(0, index)}${query ? `?${query}` : ""}`;
}

/** Atribuição sem nenhum id de clique de anúncio: nem o campo gclid, nem dentro da página de entrada. */
export function withoutAdClickIds(attribution: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attribution)) {
    if ((AD_CLICK_PARAMS as readonly string[]).includes(key)) continue;
    result[key] = key === "landing" || key === "entry_page" ? stripAdClickParams(value) : value;
  }
  return result;
}

/* ------------------------------------------------------------------ *
 * Contato (§7.5)
 * ------------------------------------------------------------------ */

export interface ContactValues {
  name: string;
  email: string;
  channel: ContactChannel;
  phone: string;
  company: string;
  details: string;
  /** Honeypot (bot-field). */
  bot: string;
}

export type ContactField = "name" | "email" | "channel" | "phone";

export type ContactErrorKey = "error_required" | "error_invalid";

export type ContactErrors = Partial<Record<ContactField, ContactErrorKey>>;

/** Telefone obrigatório só se o canal exigir (WhatsApp ou Ligação). */
export function phoneRequired(channel: ContactChannel): boolean {
  return channel === "whatsapp" || channel === "phone_call";
}

/**
 * Validação do passo de contato. `locale`: em /en e /es o telefone só vale com
 * "+" e o código do país (lib/forms phoneNeedsCountryCode).
 */
export function validateContact(values: ContactValues, locale: PhoneLocale = "pt"): ContactErrors {
  const errors: ContactErrors = {};
  if (!isFilled(values.name)) errors.name = "error_required";
  if (!isFilled(values.email)) errors.email = "error_required";
  else if (!isValidEmail(values.email)) errors.email = "error_invalid";
  if (!values.channel) errors.channel = "error_required";
  if (!isFilled(values.phone)) {
    if (phoneRequired(values.channel)) errors.phone = "error_required";
  } else if (!isValidPhone(values.phone, locale)) {
    errors.phone = "error_invalid";
  }
  return errors;
}

/* ------------------------------------------------------------------ *
 * Payload do form `briefing` (§7.10)
 * ------------------------------------------------------------------ */

export interface BriefingInput {
  answers: Answers;
  flags: ModelFlags;
  chips: readonly AnswerChip[];
  contact: ContactValues;
  score: LeadScore;
  protocol: string;
  lang: "pt" | "en" | "es";
  attribution: Record<string, string>;
  /**
   * gclidAllowed() no momento do envio (B342). false: o pedido sai sem gclid
   * (campo vazio) e sem id de clique na atribuição. Padrão: true.
   */
  gclidAllowed?: boolean;
}

/** Respostas por id estável (o JSON do campo `answers`), incluindo deadline_reason. */
export function answersPayload(answers: Answers, flags: ModelFlags): Record<string, string | string[]> {
  const payload: Record<string, string | string[]> = {};
  if (answers.stage) payload.stage = answers.stage;
  if (answers.build_type?.length) payload.build_type = answers.build_type;
  payload[isLive(answers) ? "system_pain" : "pain"] = activePains(answers);
  if (answers.deadline) payload.deadline = answers.deadline;
  if (answers.deadline_reason?.trim()) payload.deadline_reason = answers.deadline_reason.trim();
  const budget = answerOf("budget", answers, flags);
  if (typeof budget === "string") {
    payload.budget = budget;
    if (answers.budget_set) payload.budget_mode = answers.budget_set;
  }
  if (answers.role) payload.role = answers.role;
  return payload;
}

export function buildBriefingFields(input: BriefingInput): FormFields<"briefing"> {
  const { contact } = input;
  const phone = isFilled(contact.phone) ? formatPhone(contact.phone, input.lang).trim() : "";
  const source = input.gclidAllowed === false ? withoutAdClickIds(input.attribution) : input.attribution;
  const { gclid = "", ...attribution } = source;
  return {
    name: contact.name.trim(),
    email: contact.email.trim(),
    phone,
    channel: contact.channel,
    company: contact.company.trim(),
    details: contact.details.trim(),
    answers: JSON.stringify(answersPayload(input.answers, input.flags)),
    summary: readableSummary(input.chips),
    score: input.score,
    protocol: input.protocol,
    subject: briefingSubject(input.score, input.protocol),
    lang: input.lang,
    attribution: JSON.stringify(attribution),
    gclid,
    [HONEYPOT_FIELD]: contact.bot,
  };
}

/** Teto do time_to_convert_s: acima disso o startedAt é de outro dia/rascunho velho e não mede nada. */
export const MAX_TIME_TO_CONVERT_MS = 30 * 24 * 60 * 60 * 1000;

/** Segundos do "Começar" ao envio (B050); undefined sem início válido. */
export function timeToConvertSeconds(startedAt: number | undefined, now: number): number | undefined {
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) return undefined;
  const elapsed = now - startedAt;
  if (elapsed < 0 || elapsed > MAX_TIME_TO_CONVERT_MS) return undefined;
  return Math.round(elapsed / 1000);
}

export interface LeadEventOptions {
  /** Código do pedido: event_id comum a lead_attempt, lead_submitted e lead_failed (B339). */
  eventId?: string;
  /** Date.now() do "Começar". */
  startedAt?: number;
  now?: number;
}

/**
 * Parâmetros do lead_submitted (§7.11): ids, nunca texto livre. Também a P3
 * (`pain`, ids de pain ou system_pain; nunca deadline_reason) e a duração
 * (`time_to_convert_s`, backlog B050). A Política autoriza as respostas de
 * múltipla escolha no GA4 só no envio, e é aqui que elas vão.
 */
export function leadEventParams(
  answers: Answers,
  flags: ModelFlags,
  score: LeadScore,
  options: LeadEventOptions = {},
): EventParams["lead_submitted"] {
  const budget = answerOf("budget", answers, flags);
  const params: EventParams["lead_submitted"] = {
    score,
    stage: answers.stage ?? "",
    build_type: (answers.build_type ?? []).join(","),
    deadline: answers.deadline ?? "",
    budget: typeof budget === "string" ? budget : "",
    role: answers.role ?? "",
    pain: activePains(answers).join(",").slice(0, 100),
  };
  if (options.eventId) params.event_id = options.eventId;
  const seconds = timeToConvertSeconds(options.startedAt, options.now ?? Date.now());
  if (seconds !== undefined) params.time_to_convert_s = seconds;
  return params;
}

/* ------------------------------------------------------------------ *
 * Resumo para /orcamento/enviado (sessionStorage, §7.1)
 * ------------------------------------------------------------------ */

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function buildSentSummary(
  input: Pick<BriefingInput, "answers" | "chips" | "contact" | "protocol" | "lang"> & {
    /** Envio real e medido (lead_submitted saiu): só então o pós-envio dispara lead_success_view (B341). */
    measured?: boolean;
  },
  copy: Pick<RulesCopy, "contactForm"> & {
    /**
     * quote.sent.summary.channel_line ("Canal preferido: {canal}"): a linha do
     * canal em "Seus contatos" leva rótulo; o nome do canal solto parecia
     * duplicata do e-mail (painel de design, Marcos). Sem o template, o nome.
     */
    sentChannelLine?: string;
  },
): SentSummary {
  const { contact } = input;
  const channelName = copy.contactForm.fields.channel.options[contact.channel];
  const channelLine = copy.sentChannelLine ? fillTemplate(copy.sentChannelLine, { canal: channelName }) : channelName;
  const contacts = [
    contact.name.trim(),
    contact.email.trim(),
    isFilled(contact.phone) ? formatPhone(contact.phone, input.lang).trim() : "",
    contact.company.trim(),
    channelLine,
  ].filter((item) => item !== "");
  return {
    v: 1,
    protocol: input.protocol,
    lang: input.lang,
    firstName: firstName(contact.name),
    channel: contact.channel,
    role: input.answers.role ?? "",
    deadlineUrgent: isDeadlineUrgent(input.answers),
    services: servicesFromAnswers(input.answers),
    lines: answeredChips(input.chips).map((chip) => ({ label: chip.label, value: chip.value })),
    contacts,
    measured: input.measured === true,
  };
}
