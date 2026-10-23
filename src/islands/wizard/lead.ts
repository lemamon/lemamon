/**
 * Montagem do envio do wizard — BLUEPRINT §7.1, §7.5, §7.6 e §7.10 (dono:
 * conversion). PURA: atribuição, validação do contato, payload do form
 * `briefing` e o resumo que /orcamento/enviado lê do sessionStorage. Só um
 * padrão lê o navegador: o toque da sessão no envio (BriefingInput.sessionTouch).
 */

import { readSessionTouch, type EventParams, type Touch } from "../../lib/analytics";
import { adoptCampaign, attributionFields } from "../../lib/attribution";
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
 * Atribuição (§7.1) e gclid no modo consentimento (B342)
 * ------------------------------------------------------------------ *
 * Moveram para lib/attribution.ts (o /contato usa as mesmas regras, achado
 * F11). Reexportadas aqui para quem já importava do lead.
 */
export {
  AD_CLICK_PARAMS,
  buildAttribution,
  gclidAllowed,
  withoutAdClickIds,
  type AttributionInput,
} from "../../lib/attribution";

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
  /**
   * Toque da sessão NO ENVIO (F26). A atribuição da ilha é montada ao abrir a
   * página; se ela não tem campanha e, depois disso, esta aba adotou o toque
   * de campanha de outra aba aberta (BroadcastChannel), o pedido sai com essa
   * campanha (lib/attribution adoptCampaign). Padrão: readSessionTouch().
   */
  sessionTouch?: Touch | null;
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
  const sessionTouch = input.sessionTouch === undefined ? readSessionTouch() : input.sessionTouch;
  const { attribution, gclid } = attributionFields(adoptCampaign(input.attribution, sessionTouch), input.gclidAllowed !== false);
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
    attribution,
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
  const phone = isFilled(contact.phone) ? formatPhone(contact.phone, input.lang).trim() : "";
  const contacts = [contact.name.trim(), contact.email.trim(), phone, contact.company.trim(), channelLine].filter(
    (item) => item !== "",
  );
  return {
    v: 1,
    protocol: input.protocol,
    lang: input.lang,
    firstName: firstName(contact.name),
    channel: contact.channel,
    // O pós-envio confirma o contato pelo canal escolhido (F10): o e-mail no
    // canal E-mail; o número no WhatsApp e na Ligação (obrigatório nos dois).
    channelContact: contact.channel === "email" ? contact.email.trim() : phone,
    role: input.answers.role ?? "",
    deadlineUrgent: isDeadlineUrgent(input.answers),
    services: servicesFromAnswers(input.answers),
    lines: answeredChips(input.chips).map((chip) => ({ label: chip.label, value: chip.value })),
    contacts,
    measured: input.measured === true,
  };
}
