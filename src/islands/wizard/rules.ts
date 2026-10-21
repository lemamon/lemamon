/**
 * Regras da tela de resumo "Este é o seu ponto de partida" — BLUEPRINT §7.4,
 * refinadas pelas notas do copy (i18n quote._notes.topics, factors, pricing,
 * variants_live, summary_chips). Dono: conversion. Funções PURAS.
 *
 * Onde as notas do i18n detalham a ordem (topic_pain, topic_deadline logo
 * depois, topic_success para completar, factor_automation, factor_scope_live),
 * vale a nota: ela é a versão escrita e aprovada do copy, e as chaves só
 * existem nela. Nunca há prazo estimado nem valor calculado.
 */

import type { PriceLineId } from "../../config/precos";
import type { RulesCopy } from "./copy";
import {
  activePains,
  answerOf,
  hasDeadlineWindow,
  isDeadlineUrgent,
  isLive,
  needsDecider,
  optionIds,
  questionForStep,
  STEP_NUMBERS,
  type Answers,
  type BuildType,
  type ModelFlags,
  type QuestionId,
  type StepNumber,
} from "./model";

export interface SummaryContext {
  /** confirmacoes.semDescoberta (variantes "skip"). */
  semDescoberta: boolean;
  /** confirmacoes.valoresNoDiagnostico. */
  valoresNoDiagnostico: boolean;
  /** Linhas COMPLETAS de precos.ts (features.pricingLines). */
  pricingLines: readonly PriceLineId[];
}

/* ------------------------------------------------------------------ *
 * (b) etapa realçada
 * ------------------------------------------------------------------ */

export type EmphasisKey = keyof RulesCopy["summary"]["emphasis"];

export function highlightedStage(answers: Answers): "discovery" | "support" {
  return isLive(answers) ? "support" : "discovery";
}

export function emphasisKey(answers: Answers, ctx: Pick<SummaryContext, "semDescoberta">): EmphasisKey {
  if (isLive(answers)) return "live_system";
  if (answers.stage === "scope_defined") {
    return ctx.semDescoberta ? "discovery_scope_defined_skip_variant" : "discovery_scope_defined";
  }
  return "discovery_default";
}

/* ------------------------------------------------------------------ *
 * (e) bloco "E o preço?"
 * ------------------------------------------------------------------ */

export type PriceBlock =
  | { kind: "live"; second: "price_empty_live_2" | "price_empty_live_2_with_values" }
  | { kind: "ranges"; lines: PriceLineId[]; note: "price_note" | "price_note_skip_variant" }
  | { kind: "empty"; first: "price_empty" | "price_empty_skip_variant" };

const DEV_LINE: Record<Exclude<BuildType, "not_sure">, PriceLineId> = {
  ops_system: "desenvolvimento.sistemas",
  client_platform: "desenvolvimento.sistemas",
  mobile_app: "desenvolvimento.aplicativos",
  integration: "desenvolvimento.integracoes",
  automation: "desenvolvimento.integracoes",
  mvp: "desenvolvimento.mvp",
};

/**
 * Linha de desenvolvimento da P2: só quando TODOS os tipos marcados caem na
 * mesma linha; not_sure ou linhas diferentes → nenhuma (só a da Descoberta).
 */
export function developmentLine(types: readonly BuildType[] | undefined): PriceLineId | null {
  if (!types || types.length === 0 || types.includes("not_sure")) return null;
  const lines = new Set(types.map((type) => DEV_LINE[type as Exclude<BuildType, "not_sure">]));
  return lines.size === 1 ? ([...lines][0] ?? null) : null;
}

export function priceBlock(answers: Answers, ctx: SummaryContext): PriceBlock {
  if (isLive(answers)) {
    return { kind: "live", second: ctx.valoresNoDiagnostico ? "price_empty_live_2_with_values" : "price_empty_live_2" };
  }
  const skip = answers.stage === "scope_defined" && ctx.semDescoberta;
  const wanted: PriceLineId[] = ["descoberta"];
  const dev = developmentLine(answers.build_type);
  if (dev) wanted.push(dev);
  const lines = wanted.filter((id) => ctx.pricingLines.includes(id));
  if (lines.length > 0) return { kind: "ranges", lines, note: skip ? "price_note_skip_variant" : "price_note" };
  return { kind: "empty", first: skip ? "price_empty_skip_variant" : "price_empty" };
}

/* ------------------------------------------------------------------ *
 * (c) "No diagnóstico, a gente vai aprofundar" — 2 a 4 tópicos
 * ------------------------------------------------------------------ */

export type TopicId = keyof RulesCopy["summary"]["topics"];

export function summaryTopics(answers: Answers, ctx: SummaryContext): TopicId[] {
  const types = answers.build_type ?? [];
  const has = (type: BuildType) => types.includes(type);
  const live = isLive(answers);
  const productIdea = answers.stage === "product_idea";
  const topics: TopicId[] = [];

  if (live) topics.push("topic_live_system");
  const pains = answers.pain ?? [];
  if (!live && pains.length > 0) {
    topics.push(productIdea || pains.includes("new_product") ? "topic_pain_product_variant" : "topic_pain");
  }
  // Também com "nos próximos 3 meses" (F09): o caminho mais comum entra na pauta.
  if (hasDeadlineWindow(answers)) topics.push("topic_deadline");
  if (has("integration")) topics.push("topic_integration");
  if (has("mobile_app")) topics.push("topic_app");
  if (has("ops_system") || has("client_platform")) {
    if (!productIdea) topics.push("topic_process");
    else if (!has("mobile_app")) topics.push("topic_process_product_variant");
  }
  if (has("mvp") && !live) topics.push("topic_mvp");
  if (has("automation")) topics.push("topic_automation");
  if (has("not_sure")) topics.push("topic_not_sure");
  const budgetOpen = answers.budget === "not_sure" || answers.budget === "not_considered" || answers.budget === "prefer_to_discuss";
  if (budgetOpen && priceBlock(answers, ctx).kind === "ranges") topics.push("topic_budget");
  if (needsDecider(answers)) topics.push("topic_decider");

  const picked = topics.slice(0, 4);
  if (picked.length < 2) picked.push("topic_success");
  return picked;
}

/* ------------------------------------------------------------------ *
 * (d) "O que influencia prazo e preço no seu caso" — até 3 fatores
 *
 * A entrada promete "veja na hora o que influencia prazo e preço no seu caso":
 * com um fator só (caminho comum: ops_system + 3 meses), a promessa parecia
 * maior que a entrega. Com menos de 2, factor_default ("O que entra primeiro e
 * o que pode esperar") completa, como topic_success completa os tópicos.
 * ------------------------------------------------------------------ */

export type FactorId = keyof RulesCopy["summary"]["factors"];

export function summaryFactors(answers: Answers, ctx: Pick<SummaryContext, "semDescoberta">): FactorId[] {
  const types = answers.build_type ?? [];
  const has = (type: BuildType) => types.includes(type);
  const live = isLive(answers);
  const factors: FactorId[] = [];

  if (has("mobile_app")) factors.push("factor_app");
  if (has("integration")) factors.push("factor_integration");
  if (has("automation")) factors.push("factor_automation");
  // mvp diz a fase do produto, não é outro tipo de software: mvp + 1 tipo = uma frente.
  const fronts = types.filter((type) => type !== "mvp" && type !== "not_sure").length;
  if (fronts >= 2 && !live) {
    factors.push(answers.stage === "scope_defined" && ctx.semDescoberta ? "factor_multi_skip_variant" : "factor_multi");
  }
  if (isDeadlineUrgent(answers)) factors.push("factor_deadline");
  else if (hasDeadlineWindow(answers)) factors.push("factor_deadline_window");
  if (!live && (has("ops_system") || has("client_platform") || has("mvp"))) factors.push("factor_scope");
  if (live) factors.push("factor_scope_live");

  const picked = factors.slice(0, 3);
  if (picked.length < 2) picked.push("factor_default");
  return picked;
}

/**
 * Nota logo acima do CTA do fim do resumo: deadline_note com urgência ou data
 * marcada; deadline_note_window com "nos próximos 3 meses" (F09); nada nos
 * outros prazos. O bloco de preço não muda com o prazo.
 */
export function deadlineNote(answers: Answers): "deadline_note" | "deadline_note_window" | null {
  if (isDeadlineUrgent(answers)) return "deadline_note";
  return hasDeadlineWindow(answers) ? "deadline_note_window" : null;
}

/* ------------------------------------------------------------------ *
 * (a) "Suas respostas" — chips (e as linhas do WhatsApp e do resumo copiado)
 * ------------------------------------------------------------------ */

export interface AnswerChip {
  step: StepNumber;
  question: QuestionId | "deadline_reason";
  label: string;
  /** Texto do chip; "" = pergunta opcional pulada (skipped). */
  value: string;
  /** Cada opção marcada, sem o separador (a linha "Para:" do resumo junta o tipo com vírgula, F02). */
  parts?: readonly string[];
  skipped: boolean;
}

export interface ChipContext extends ModelFlags {
  /** Rótulo de cada faixa (qualificacao.ts, no idioma da página). */
  tierLabel: (set: "tiers" | "monthly", id: string) => string | undefined;
}

type OptionMap = Readonly<Record<string, string>>;

/** Rótulo curto de uma opção (options_short, ou o rótulo completo nas perguntas sem options_short). */
export function optionLabel(
  question: QuestionId,
  id: string,
  answers: Answers,
  copy: RulesCopy,
  ctx: ChipContext,
  short = true,
): string {
  const steps = copy.steps;
  const live = isLive(answers);
  const pick = (full: OptionMap, brief?: OptionMap) => (short && brief?.[id]) || full[id] || id;
  switch (question) {
    case "stage":
      return pick(steps.stage.options, steps.stage.options_short);
    case "build_type": {
      const full: OptionMap = live ? { ...steps.build_type.options, ...steps.build_type.options_live_variant } : steps.build_type.options;
      const brief: OptionMap = live
        ? { ...steps.build_type.options_short, ...steps.build_type.options_short_live_variant }
        : steps.build_type.options_short;
      return pick(full, brief);
    }
    case "pain":
      return pick(steps.pain.options, steps.pain.options_short);
    case "system_pain":
      return pick(steps.system_pain.options, steps.system_pain.options_short);
    case "deadline":
      return pick(steps.deadline.options);
    case "budget": {
      if (id.startsWith("tier_")) {
        const set = answers.budget_set === "monthly" ? "monthly" : "tiers";
        return ctx.tierLabel(set, id) ?? id;
      }
      const map: OptionMap =
        answers.budget_set === "no_numbers" ? steps.budget.options_no_numbers_mode : steps.budget.options_tiers_mode;
      return pick(map);
    }
    case "role":
      return pick(steps.role.options);
  }
}

export function answerChips(answers: Answers, copy: RulesCopy, ctx: ChipContext): AnswerChip[] {
  const chips: AnswerChip[] = [];
  const separator = copy.whatsapp.answer_separator;
  for (const step of STEP_NUMBERS) {
    const question = questionForStep(step, answers);
    const value = answerOf(question, answers, ctx);
    const ids = Array.isArray(value) ? value : value ? [value] : [];
    const order = optionIds(question, answers, ctx);
    const sorted = order.filter((id) => ids.includes(id));
    const label = copy.steps[question].short_label;
    if (sorted.length === 0) {
      if (question === "pain" || question === "system_pain") {
        chips.push({ step, question, label, value: copy.summary.skipped_answer, skipped: true });
      }
      continue;
    }
    const parts = sorted.map((id) => optionLabel(question, id, answers, copy, ctx));
    chips.push({ step, question, label, value: parts.join(separator), parts, skipped: false });
    if (question === "deadline" && answers.deadline_reason && answers.deadline_reason.trim() !== "") {
      chips.push({
        step,
        question: "deadline_reason",
        label: copy.steps.deadline.reason_short_label,
        value: answers.deadline_reason.trim(),
        skipped: false,
      });
    }
  }
  return chips;
}

/** Perguntas da linha "Para: …" do topo do resumo (F02), nesta ordem: tipo, prazo e faixa. */
const FOR_LINE_QUESTIONS: readonly AnswerChip["question"][] = ["build_type", "deadline", "budget"];

/**
 * Valores da linha "Para: {tipo} · {prazo} · {faixa}" no topo do resumo
 * (auditoria F02): o eco compacto das respostas que mais mexem em prazo e
 * preço, com os mesmos textos dos chips. Vários tipos na P2 vão com vírgula,
 * para não se confundirem com o " · " entre os grupos. Os chips completos
 * (com "Alterar") ficam mais abaixo.
 */
export function forLineParts(chips: readonly AnswerChip[]): string[] {
  return FOR_LINE_QUESTIONS.flatMap((question) =>
    chips
      .filter((chip) => chip.question === question && !chip.skipped)
      .map((chip) => (chip.parts ?? [chip.value]).join(", ")),
  );
}

/** Linhas de resposta sem as perguntas puladas (mensagens e texto copiado, i18n quote._notes.whatsapp). */
export function answeredChips(chips: readonly AnswerChip[]): AnswerChip[] {
  return chips.filter((chip) => !chip.skipped);
}

/** P3 ativa tem resposta? (usado no texto da P3 e nos testes) */
export function hasPainAnswers(answers: Answers): boolean {
  return activePains(answers).length > 0;
}

/**
 * Anúncio do resumo e do contato (backlog B012): o rótulo do progresso antes
 * do título da tela, para o leitor de tela ouvir em que ponto está ("Resumo.
 * Este é o seu ponto de partida", "Último passo: seu contato. Como a gente
 * fala com você?"). As perguntas seguem com "Pergunta N de 6: …".
 */
export function joinAnnouncement(progress: string, title: string): string {
  const label = progress.trim();
  if (!label) return title;
  return /[.!?:…]$/.test(label) ? `${label} ${title}` : `${label}. ${title}`;
}
