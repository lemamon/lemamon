/**
 * Classificação interna do lead — BLUEPRINT §7.9 (dono: conversion). PURA.
 * NUNCA exibida e sem tela de recusa: vai só no campo oculto `score` do form
 * `briefing`, no evento lead_submitted e na notificação do Netlify.
 *
 * Parâmetros editáveis vêm de config/qualificacao.ts (corte de MQL, corte das
 * faixas mensais e a trava do score D). Sem faixas (padrão), "orçamento OK" =
 * `approved` e o D não existe (ele depende de tier_1). `prefer_to_discuss` é
 * neutro; `recommend_to_decider` não cai automaticamente em C. MQL = A.
 *
 * Faixas MENSAIS (P1 = maintain_live_system com hasMonthlyTiers, backlog B042):
 * a P5 grava tier_1…tier_4 do conjunto mensal (budget_set = "monthly"), que se
 * comparam com corteMqlMensal, nunca com o corte das faixas de projeto. A regra
 * D (§7.9 fala da faixa do PROJETO) não vale para o conjunto mensal.
 */

import type { Qualificacao, TierId } from "../../config/qualificacao";
import { TIER_IDS, type Answers } from "./model";

export type LeadScore = "A" | "B" | "C" | "D";

export interface ScoreConfig {
  /** Menor faixa que conta como "orçamento OK" (qualificacao.corteMql). */
  corteMql: TierId | null;
  /** Menor faixa MENSAL que conta como "orçamento OK" (qualificacao.corteMqlMensal). */
  corteMqlMensal?: TierId | null;
  /** qualificacao.scoreD.ativo (só liga com confirmacoes.scoreDRecebeDiagnostico, validado no build). */
  scoreDAtivo: boolean;
}

/**
 * A configuração do score a partir de config/qualificacao (dados/dono.json).
 * Único ponto que liga a qualificação ao classifyLead (o Wizard usa esta
 * função): sem ela, o corte MENSAL ficava de fora e nenhum lead de sustentação
 * chegava a A com as faixas mensais ligadas (backlog B042).
 */
export function scoreConfigFrom(q: Pick<Qualificacao, "corteMql" | "corteMqlMensal" | "scoreD">): ScoreConfig {
  return {
    corteMql: q.corteMql,
    corteMqlMensal: q.corteMqlMensal ?? null,
    scoreDAtivo: q.scoreD.ativo,
  };
}

const DEADLINE_OK = new Set(["asap", "within_3_months", "between_3_and_6_months"]);
const DECIDER_ACCESSIBLE = new Set(["i_decide", "decide_with_partners", "recommend_to_decider"]);
const DECIDER_TOP = new Set(["i_decide", "decide_with_partners"]);

const tierRank = (id: string | undefined): number => (id ? (TIER_IDS as readonly string[]).indexOf(id) : -1);

export function isBudgetOk(
  answers: Pick<Answers, "budget" | "budget_set">,
  config: Pick<ScoreConfig, "corteMql" | "corteMqlMensal">,
): boolean {
  const budget = answers.budget;
  if (budget === "approved") return true;
  const rank = tierRank(budget);
  const corte = answers.budget_set === "monthly" ? (config.corteMqlMensal ?? null) : config.corteMql;
  return rank >= 0 && corte !== null && rank >= tierRank(corte);
}

export function isDeadlineOk(answers: Pick<Answers, "deadline">): boolean {
  return Boolean(answers.deadline && DEADLINE_OK.has(answers.deadline));
}

export function classifyLead(answers: Answers, config: ScoreConfig): LeadScore {
  const types = answers.build_type ?? [];
  const budgetOk = isBudgetOk(answers, config);
  const deadlineOk = isDeadlineOk(answers);
  const role = answers.role ?? "";

  // D: fora de perfil (tier_1 com escopo grande). Resposta honesta e rápida, nunca silêncio.
  if (
    config.scoreDAtivo &&
    answers.budget_set !== "monthly" &&
    answers.budget === "tier_1" &&
    (types.length >= 3 || (types.includes("mvp") && types.includes("client_platform")))
  ) {
    return "D";
  }
  if (budgetOk && deadlineOk && DECIDER_TOP.has(role)) return "A";
  if (
    answers.budget === "not_sure" ||
    answers.budget === "not_considered" ||
    answers.deadline === "over_6_months" ||
    answers.deadline === "not_defined" ||
    role === "researching" ||
    role === "not_defined"
  ) {
    return "C";
  }
  if ((budgetOk || deadlineOk || answers.budget === "being_defined") && DECIDER_ACCESSIBLE.has(role)) return "B";
  return "C";
}
