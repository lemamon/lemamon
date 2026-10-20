/**
 * Classificação interna A/B/C/D — BLUEPRINT §7.9. Nunca exibida; vai no campo
 * `score`. prefer_to_discuss é neutro; recommend_to_decider não cai em C;
 * D só com faixas e com a trava ligada.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { qualificacao } from "@/config/qualificacao";
import type { Answers } from "@/islands/wizard/model";
import { classifyLead, isBudgetOk, isDeadlineOk, scoreConfigFrom } from "@/islands/wizard/score";

const noTiers = { corteMql: null, scoreDAtivo: false };
const withTiers = { corteMql: "tier_2" as const, scoreDAtivo: true };

const lead = (answers: Answers) => answers;

describe("modo sem números (padrão)", () => {
  it("A: orçamento aprovado + prazo OK + decide (sozinho ou com sócios)", () => {
    expect(classifyLead(lead({ budget: "approved", deadline: "asap", role: "i_decide" }), noTiers)).toBe("A");
    expect(classifyLead(lead({ budget: "approved", deadline: "between_3_and_6_months", role: "decide_with_partners" }), noTiers)).toBe("A");
  });

  it("recommend_to_decider não vira C: com orçamento e prazo OK é B", () => {
    expect(classifyLead(lead({ budget: "approved", deadline: "within_3_months", role: "recommend_to_decider" }), noTiers)).toBe("B");
  });

  it("B: being_defined ou prazo OK com decisor acessível; prefer_to_discuss não penaliza", () => {
    expect(classifyLead(lead({ budget: "being_defined", deadline: "within_3_months", role: "i_decide" }), noTiers)).toBe("B");
    expect(classifyLead(lead({ budget: "prefer_to_discuss", deadline: "asap", role: "i_decide" }), noTiers)).toBe("B");
  });

  it("C: orçamento em aberto, prazo longe/indefinido ou quem decide indefinido", () => {
    expect(classifyLead(lead({ budget: "not_considered", deadline: "asap", role: "i_decide" }), noTiers)).toBe("C");
    expect(classifyLead(lead({ budget: "approved", deadline: "over_6_months", role: "i_decide" }), noTiers)).toBe("C");
    expect(classifyLead(lead({ budget: "approved", deadline: "not_defined", role: "i_decide" }), noTiers)).toBe("C");
    expect(classifyLead(lead({ budget: "approved", deadline: "asap", role: "researching" }), noTiers)).toBe("C");
    expect(classifyLead(lead({ budget: "approved", deadline: "asap", role: "not_defined" }), noTiers)).toBe("C");
  });

  it("D não existe sem faixas", () => {
    expect(classifyLead(lead({ budget: "approved", build_type: ["mvp", "client_platform"], deadline: "asap", role: "i_decide" }), noTiers)).toBe("A");
  });
});

describe("modo com faixas", () => {
  it("corte de MQL: faixa ≥ corte conta como orçamento OK", () => {
    expect(isBudgetOk({ budget: "tier_1" }, withTiers)).toBe(false);
    expect(isBudgetOk({ budget: "tier_2" }, withTiers)).toBe(true);
    expect(isBudgetOk({ budget: "tier_4" }, withTiers)).toBe(true);
    expect(isBudgetOk({ budget: "tier_4" }, noTiers)).toBe(false);
    expect(classifyLead(lead({ budget: "tier_3", deadline: "within_3_months", role: "i_decide" }), withTiers)).toBe("A");
  });

  it("not_sure é C; tier abaixo do corte com prazo OK é B", () => {
    expect(classifyLead(lead({ budget: "not_sure", deadline: "asap", role: "i_decide" }), withTiers)).toBe("C");
    expect(classifyLead(lead({ budget: "tier_1", build_type: ["ops_system"], deadline: "asap", role: "i_decide" }), withTiers)).toBe("B");
  });

  it("D: tier_1 com 3+ tipos, ou com mvp + client_platform — só com a trava ligada", () => {
    const big = lead({ budget: "tier_1", build_type: ["ops_system", "mobile_app", "integration"], deadline: "asap", role: "i_decide" });
    expect(classifyLead(big, withTiers)).toBe("D");
    expect(classifyLead(lead({ ...big, build_type: ["mvp", "client_platform"] }), withTiers)).toBe("D");
    expect(classifyLead(big, { ...withTiers, scoreDAtivo: false })).toBe("B");
    expect(classifyLead(lead({ ...big, budget: "tier_2" }), withTiers)).toBe("A");
  });
});

describe("faixas mensais (P1 = maintain_live_system, backlog B042)", () => {
  const cfg = { corteMql: "tier_2" as const, corteMqlMensal: "tier_3" as const, scoreDAtivo: true };
  const monthly = (budget: string): Answers => ({
    stage: "maintain_live_system",
    budget,
    budget_set: "monthly",
    deadline: "asap",
    role: "i_decide",
  });

  it("a faixa mensal se compara com o corte MENSAL, não com o de projeto", () => {
    expect(classifyLead(monthly("tier_2"), cfg)).toBe("B");
    expect(classifyLead(monthly("tier_3"), cfg)).toBe("A");
    expect(isBudgetOk({ budget: "tier_2", budget_set: "monthly" }, cfg)).toBe(false);
    expect(isBudgetOk({ budget: "tier_2", budget_set: "tiers" }, cfg)).toBe(true);
  });

  it("sem corte mensal, faixa mensal nunca é 'orçamento OK'", () => {
    expect(isBudgetOk({ budget: "tier_4", budget_set: "monthly" }, { corteMql: "tier_2" })).toBe(false);
    expect(classifyLead(monthly("tier_4"), { corteMql: "tier_2", scoreDAtivo: false })).toBe("B");
  });

  it("a regra D (faixa do projeto) não vale para o conjunto mensal", () => {
    const big = { ...monthly("tier_1"), build_type: ["ops_system", "mobile_app", "integration"] } as Answers;
    expect(classifyLead(big, cfg)).not.toBe("D");
    expect(classifyLead({ ...big, budget_set: "tiers" }, cfg)).toBe("D");
  });

  it("o modo com faixas de projeto continua igual", () => {
    expect(classifyLead(lead({ budget: "tier_3", budget_set: "tiers", deadline: "within_3_months", role: "i_decide" }), cfg)).toBe("A");
    expect(classifyLead(lead({ budget: "tier_1", budget_set: "tiers", build_type: ["ops_system"], deadline: "asap", role: "i_decide" }), cfg)).toBe(
      "B",
    );
  });
});

describe("scoreConfigFrom: a ligação entre a qualificação do dono e o score (B042)", () => {
  const sustentacao: Answers = {
    stage: "maintain_live_system",
    budget_set: "monthly",
    budget: "tier_3",
    deadline: "asap",
    role: "i_decide",
  };

  it("repassa o corte mensal: faixa mensal acima do corte, prazo asap e i_decide dá A", () => {
    const config = scoreConfigFrom({ corteMql: "tier_2", corteMqlMensal: "tier_3", scoreD: { ativo: false } });
    expect(config).toEqual({ corteMql: "tier_2", corteMqlMensal: "tier_3", scoreDAtivo: false });
    expect(classifyLead(sustentacao, config)).toBe("A");
  });

  it("sem corte mensal no dono, corteMqlMensal vira null (a faixa mensal não conta como orçamento OK)", () => {
    const config = scoreConfigFrom({ corteMql: "tier_2", scoreD: { ativo: true } });
    expect(config).toEqual({ corteMql: "tier_2", corteMqlMensal: null, scoreDAtivo: true });
    expect(classifyLead(sustentacao, config)).toBe("B");
  });

  it("aceita a qualificação real (dados/dono.json + camada) sem perder campo", () => {
    expect(scoreConfigFrom(qualificacao)).toEqual({
      corteMql: qualificacao.corteMql,
      corteMqlMensal: qualificacao.corteMqlMensal ?? null,
      scoreDAtivo: qualificacao.scoreD.ativo,
    });
  });

  it("o envio do Wizard classifica com scoreConfigFrom(qualificacao), não com um objeto escrito à mão", () => {
    const source = readFileSync(fileURLToPath(new URL("../../src/islands/wizard/Wizard.tsx", import.meta.url)), "utf8");
    const calls = source.match(/classifyLead\([^;]*\)/g) ?? [];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call).toContain("scoreConfigFrom(qualificacao)");
  });
});

describe("prazo", () => {
  it("prazo OK = até 6 meses", () => {
    expect(isDeadlineOk({ deadline: "asap" })).toBe(true);
    expect(isDeadlineOk({ deadline: "between_3_and_6_months" })).toBe(true);
    expect(isDeadlineOk({ deadline: "over_6_months" })).toBe(false);
    expect(isDeadlineOk({})).toBe(false);
  });
});
