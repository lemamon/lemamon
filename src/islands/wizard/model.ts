/**
 * Modelo do wizard — BLUEPRINT §7.1–§7.3 e i18n quote._notes (dono: conversion).
 * Funções PURAS (sem DOM, sem storage), exercitadas pelos testes wizard-*.
 *
 * - 6 perguntas, N fixo (§7.2): as variações são só de texto ou de conjunto de
 *   opções (P2, P3, P5), nunca pulam uma pergunta.
 * - Ids estáveis em inglês snake_case (§7.3). O texto vem do i18n.
 * - Faixas de orçamento (tier_1…tier_4) só existem no bundle da ilha
 *   (config/qualificacao.ts); aqui só os ids.
 */

import type { ServiceKey } from "../../config/routes";

export const TOTAL_QUESTIONS = 6;

export const STAGES = [
  "problem_unclear",
  "product_idea",
  "scope_defined",
  "evolve_live_system",
  "maintain_live_system",
] as const;
export type Stage = (typeof STAGES)[number];

export const LIVE_STAGES: readonly Stage[] = ["evolve_live_system", "maintain_live_system"];

export const BUILD_TYPES = [
  "ops_system",
  "client_platform",
  "mobile_app",
  "integration",
  "automation",
  "mvp",
  "not_sure",
] as const;
export type BuildType = (typeof BUILD_TYPES)[number];

export const PAINS = [
  "manual_process",
  "double_entry",
  "disconnected_tools",
  "off_the_shelf_misfit",
  "late_numbers",
  "customer_channel",
  "new_product",
  "other",
] as const;
export type Pain = (typeof PAINS)[number];

export const SYSTEM_PAINS = ["errors_instability", "new_features", "hard_to_maintain", "ongoing_care", "other"] as const;
export type SystemPain = (typeof SYSTEM_PAINS)[number];

export const DEADLINES = ["asap", "within_3_months", "between_3_and_6_months", "over_6_months", "not_defined"] as const;
export type Deadline = (typeof DEADLINES)[number];

export const TIER_IDS = ["tier_1", "tier_2", "tier_3", "tier_4"] as const;
export type TierOption = (typeof TIER_IDS)[number];
export const BUDGET_TIER_EXTRAS = ["not_sure", "prefer_to_discuss"] as const;
export const BUDGET_NO_NUMBERS = ["approved", "being_defined", "not_considered", "prefer_to_discuss"] as const;

export const ROLES = ["i_decide", "decide_with_partners", "recommend_to_decider", "researching", "not_defined"] as const;
export type Role = (typeof ROLES)[number];

/** Conjunto de opções da P5 (§7.3): faixas, faixas mensais ou sem números. */
export type BudgetSet = "tiers" | "monthly" | "no_numbers";

export type QuestionId = "stage" | "build_type" | "pain" | "system_pain" | "deadline" | "budget" | "role";
export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;
export const STEP_NUMBERS: readonly StepNumber[] = [1, 2, 3, 4, 5, 6];

export interface Answers {
  stage?: Stage;
  build_type?: BuildType[];
  pain?: Pain[];
  system_pain?: SystemPain[];
  deadline?: Deadline;
  /** Campo opcional da P4: "Existe alguma data que trava isso?". */
  deadline_reason?: string;
  budget?: string;
  /** Conjunto em que a P5 foi respondida; se o conjunto atual mudar, a resposta deixa de valer. */
  budget_set?: BudgetSet;
  role?: Role;
}

export interface ModelFlags {
  hasBudgetTiers: boolean;
  hasMonthlyTiers: boolean;
}

export const MULTI_QUESTIONS: ReadonlySet<QuestionId> = new Set(["build_type", "pain", "system_pain"]);
export const OPTIONAL_QUESTIONS: ReadonlySet<QuestionId> = new Set(["pain", "system_pain"]);
/** "Ainda não sei" é exclusiva (§7.2). */
export const EXCLUSIVE_OPTION: Partial<Record<QuestionId, string>> = { build_type: "not_sure" };
/** P3: "até 3" (§7.2). */
export const MAX_SELECTION: Partial<Record<QuestionId, number>> = { pain: 3, system_pain: 3 };

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

export function isLive(answers: Answers): boolean {
  return Boolean(answers.stage && LIVE_STAGES.includes(answers.stage));
}

/** Pergunta exibida num passo (o passo 3 depende da P1). */
export function questionForStep(step: StepNumber, answers: Answers): QuestionId {
  switch (step) {
    case 1:
      return "stage";
    case 2:
      return "build_type";
    case 3:
      return isLive(answers) ? "system_pain" : "pain";
    case 4:
      return "deadline";
    case 5:
      return "budget";
    case 6:
      return "role";
  }
}

export function stepForQuestion(question: QuestionId): StepNumber {
  const map: Record<QuestionId, StepNumber> = {
    stage: 1,
    build_type: 2,
    pain: 3,
    system_pain: 3,
    deadline: 4,
    budget: 5,
    role: 6,
  };
  return map[question];
}

/** P5: com P1 = maintain_live_system e faixas mensais, as mensais; com faixas, as faixas; senão, sem números. */
export function budgetSetFor(answers: Answers, flags: ModelFlags): BudgetSet {
  if (answers.stage === "maintain_live_system" && flags.hasMonthlyTiers) return "monthly";
  if (flags.hasBudgetTiers) return "tiers";
  return "no_numbers";
}

/** Ids das opções, na ordem de exibição (i18n quote._notes.pain_order). */
export function optionIds(question: QuestionId, answers: Answers, flags: ModelFlags): string[] {
  switch (question) {
    case "stage":
      return [...STAGES];
    case "build_type":
      if (answers.stage === "product_idea") {
        const first: BuildType[] = ["mvp", "client_platform", "mobile_app"];
        return [...first, ...BUILD_TYPES.filter((id) => !first.includes(id))];
      }
      return [...BUILD_TYPES];
    case "pain":
      if (answers.stage === "product_idea" || answers.stage === "scope_defined") {
        const first: Pain[] = ["new_product", "customer_channel"];
        return [...first, ...PAINS.filter((id) => !first.includes(id))];
      }
      return [...PAINS];
    case "system_pain":
      return [...SYSTEM_PAINS];
    case "deadline":
      return [...DEADLINES];
    case "budget":
      return budgetSetFor(answers, flags) === "no_numbers"
        ? [...BUDGET_NO_NUMBERS]
        : [...TIER_IDS, ...BUDGET_TIER_EXTRAS];
    case "role":
      return [...ROLES];
  }
}

/** Resposta atual de uma pergunta (a P5 só vale no conjunto em que foi respondida). */
export function answerOf(question: QuestionId, answers: Answers, flags: ModelFlags): string | string[] | undefined {
  if (question === "budget") {
    if (!answers.budget || answers.budget_set !== budgetSetFor(answers, flags)) return undefined;
    return optionIds("budget", answers, flags).includes(answers.budget) ? answers.budget : undefined;
  }
  return answers[question];
}

export function isAnswered(question: QuestionId, answers: Answers, flags: ModelFlags): boolean {
  const value = answerOf(question, answers, flags);
  return Array.isArray(value) ? value.length > 0 : typeof value === "string" && value !== "";
}

export function isOptional(question: QuestionId): boolean {
  return OPTIONAL_QUESTIONS.has(question);
}

/** Primeira pergunta obrigatória sem resposta; null = todas respondidas (o resumo pode abrir). */
export function firstIncompleteStep(answers: Answers, flags: ModelFlags): StepNumber | null {
  for (const step of STEP_NUMBERS) {
    const question = questionForStep(step, answers);
    if (!isOptional(question) && !isAnswered(question, answers, flags)) return step;
  }
  return null;
}

export type Screen = StepNumber | "resumo" | "contato";

/**
 * Acesso direto a um passo (?etapa=): só se as obrigatórias anteriores estão
 * respondidas; senão, devolve a primeira pendente (backlog B135).
 */
export function allowedScreen(requested: Screen, answers: Answers, flags: ModelFlags): Screen {
  const pending = firstIncompleteStep(answers, flags);
  if (pending === null) return requested;
  if (requested === "resumo" || requested === "contato") return pending;
  return requested <= pending ? requested : pending;
}

/** Passo anterior para o "Voltar" (null = sair do modo foco, voltar à entrada). */
export function previousScreen(screen: Screen): Screen | null {
  if (screen === "contato") return "resumo";
  if (screen === "resumo") return 6;
  return screen === 1 ? null : ((screen - 1) as StepNumber);
}

export interface ToggleResult {
  next: string[];
  /** "max" = tentou passar do limite (mostra validation.max_three). */
  blocked: "max" | null;
}

/** Multisseleção com opção exclusiva e limite (§7.2). */
export function toggleOption(
  question: QuestionId,
  current: readonly string[],
  id: string,
  checked: boolean,
  order: readonly string[],
): ToggleResult {
  const exclusive = EXCLUSIVE_OPTION[question];
  const max = MAX_SELECTION[question];
  const sort = (list: string[]) => order.filter((item) => list.includes(item));
  if (!checked) return { next: current.filter((item) => item !== id), blocked: null };
  if (exclusive && id === exclusive) return { next: [id], blocked: null };
  const base = current.filter((item) => item !== exclusive && item !== id);
  if (max !== undefined && base.length >= max) return { next: [...current], blocked: "max" };
  return { next: sort([...base, id]), blocked: null };
}

/** Grava a resposta de uma pergunta (a P5 registra em qual conjunto foi respondida). */
export function setAnswer(answers: Answers, question: QuestionId, value: string | string[], flags: ModelFlags): Answers {
  const next: Answers = { ...answers };
  switch (question) {
    case "stage":
      if (includes(STAGES, value)) next.stage = value;
      break;
    case "build_type":
      if (Array.isArray(value)) next.build_type = value.filter((item): item is BuildType => includes(BUILD_TYPES, item));
      break;
    case "pain":
      if (Array.isArray(value)) next.pain = value.filter((item): item is Pain => includes(PAINS, item));
      break;
    case "system_pain":
      if (Array.isArray(value))
        next.system_pain = value.filter((item): item is SystemPain => includes(SYSTEM_PAINS, item));
      break;
    case "deadline":
      if (includes(DEADLINES, value)) next.deadline = value;
      break;
    case "budget":
      if (typeof value === "string") {
        next.budget = value;
        next.budget_set = budgetSetFor(answers, flags);
      }
      break;
    case "role":
      if (includes(ROLES, value)) next.role = value;
      break;
  }
  return next;
}

/** Respostas da P3 ativa (pain ou system_pain). */
export function activePains(answers: Answers): string[] {
  return (isLive(answers) ? answers.system_pain : answers.pain) ?? [];
}

/** P4 = asap ou data travante preenchida. */
export function isDeadlineUrgent(answers: Answers): boolean {
  return answers.deadline === "asap" || Boolean(answers.deadline_reason && answers.deadline_reason.trim() !== "");
}

/** P6 que pede "traga quem decide" (§7.3, §7.8). */
export function needsDecider(answers: Answers): boolean {
  return answers.role === "recommend_to_decider" || answers.role === "researching" || answers.role === "not_defined";
}

/* ------------------------------------------------------------------ *
 * Pré-marcação (§7.1)
 * ------------------------------------------------------------------ */

/** ?servico= → P2 (ou P1 = maintain_live_system em sustentação). */
export const SERVICE_PREFILL: Record<ServiceKey, Partial<Answers>> = {
  web_systems: { build_type: ["ops_system", "client_platform"] },
  mobile_apps: { build_type: ["mobile_app"] },
  integrations: { build_type: ["integration", "automation"] },
  mvp: { build_type: ["mvp"] },
  support: { stage: "maintain_live_system" },
};

/** Passo em que a pré-marcação aparece (a linha de contexto vai no topo dele). */
export function prefillStep(service: ServiceKey): StepNumber {
  return service === "support" ? 1 : 2;
}

/**
 * As respostas já têm a pré-marcação do serviço? (backlog B166) Com rascunho
 * salvo, o ?servico= novo não sobrescreve as respostas; a linha de contexto
 * ("já deixamos marcado…") só pode aparecer se a marcação estiver lá de fato.
 */
export function hasPrefill(answers: Answers, prefill: Partial<Answers>): boolean {
  if (prefill.stage !== undefined && answers.stage !== prefill.stage) return false;
  if (prefill.build_type && !prefill.build_type.every((type) => answers.build_type?.includes(type))) return false;
  return true;
}

/** Serviços (rotas) do que foi marcado: cases do "Enquanto isso" e serviço no CRM. */
export function servicesFromAnswers(answers: Answers): ServiceKey[] {
  const set = new Set<ServiceKey>();
  if (isLive(answers)) set.add("support");
  for (const type of answers.build_type ?? []) {
    if (type === "ops_system" || type === "client_platform") set.add("web_systems");
    if (type === "mobile_app") set.add("mobile_apps");
    if (type === "integration" || type === "automation") set.add("integrations");
    if (type === "mvp") set.add("mvp");
  }
  return [...set];
}

/** Máximo de cases do mesmo tipo no resumo (backlog B379, como no pós-envio §7.8). */
export const SUMMARY_CASES_LIMIT = 2;

/**
 * Cases publicados do mesmo tipo que o pedido (resumo, backlog B379): os que
 * têm algum serviço de servicesFromAnswers, na ordem em que chegaram (a ordem
 * do hub), no máximo `limit`. Sem nenhum compatível, [] (o bloco some, nunca
 * um case qualquer). Pura.
 */
export function casesForAnswers<T extends { services: readonly ServiceKey[] }>(
  cases: Readonly<Record<string, T>>,
  answers: Answers,
  limit: number = SUMMARY_CASES_LIMIT,
): [slug: string, item: T][] {
  const wanted = servicesFromAnswers(answers);
  if (wanted.length === 0) return [];
  return Object.entries(cases)
    .filter(([, item]) => item.services.some((service) => wanted.includes(service)))
    .slice(0, limit);
}

/* ------------------------------------------------------------------ *
 * (De)serialização para o rascunho
 * ------------------------------------------------------------------ */

export function answersToRecord(answers: Answers): Record<string, string | string[]> {
  const record: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (typeof value === "string" ? value !== "" : Array.isArray(value)) record[key] = value as string | string[];
  }
  return record;
}

/** Rascunho → respostas, descartando ids desconhecidos (rascunho de versão antiga ou adulterado). */
export function recordToAnswers(record: Record<string, string | string[]>): Answers {
  const list = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
  const answers: Answers = {};
  if (includes(STAGES, record.stage)) answers.stage = record.stage;
  if (Array.isArray(record.build_type)) answers.build_type = list(record.build_type).filter((id) => includes(BUILD_TYPES, id)) as BuildType[];
  if (Array.isArray(record.pain)) answers.pain = list(record.pain).filter((id) => includes(PAINS, id)).slice(0, 3) as Pain[];
  if (Array.isArray(record.system_pain))
    answers.system_pain = list(record.system_pain).filter((id) => includes(SYSTEM_PAINS, id)).slice(0, 3) as SystemPain[];
  if (includes(DEADLINES, record.deadline)) answers.deadline = record.deadline;
  if (typeof record.deadline_reason === "string") answers.deadline_reason = record.deadline_reason.slice(0, 300);
  if (typeof record.budget === "string" && ([...TIER_IDS, ...BUDGET_TIER_EXTRAS, ...BUDGET_NO_NUMBERS] as string[]).includes(record.budget))
    answers.budget = record.budget;
  if (record.budget_set === "tiers" || record.budget_set === "monthly" || record.budget_set === "no_numbers")
    answers.budget_set = record.budget_set;
  if (includes(ROLES, record.role)) answers.role = record.role;
  return answers;
}
