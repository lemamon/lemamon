/**
 * Modelo do wizard — BLUEPRINT §7.1–§7.3 (N fixo em 6, ids estáveis,
 * pré-marcação, ordem de opções, multisseleção, acesso direto a um passo).
 */
import { describe, expect, it } from "vitest";

import { getSection } from "@/i18n";
import {
  allowedScreen,
  answerOf,
  answersToRecord,
  blocksEntryClick,
  budgetSetFor,
  casesForAnswers,
  CONTACT_ENTRY_LOCK_MS,
  ENTRY_CLICK_LOCK_MS,
  firstIncompleteStep,
  hasDeadlineWindow,
  hasPrefill,
  isAnswered,
  isDeadlineUrgent,
  optionIds,
  previousScreen,
  PROGRESS_STEPS,
  progressValue,
  questionForStep,
  recordToAnswers,
  SERVICE_PREFILL,
  servicesFromAnswers,
  setAnswer,
  STEP_NUMBERS,
  toggleOption,
  TOTAL_QUESTIONS,
  type Answers,
} from "@/islands/wizard/model";

const noTiers = { hasBudgetTiers: false, hasMonthlyTiers: false };
const tiers = { hasBudgetTiers: true, hasMonthlyTiers: true };

const complete: Answers = {
  stage: "problem_unclear",
  build_type: ["ops_system"],
  deadline: "within_3_months",
  budget: "approved",
  budget_set: "no_numbers",
  role: "i_decide",
};

describe("perguntas", () => {
  it("N é sempre 6: a P1 só troca o texto/conjunto da P3, nunca pula pergunta", () => {
    expect(TOTAL_QUESTIONS).toBe(6);
    expect(STEP_NUMBERS.map((step) => questionForStep(step, { stage: "product_idea" }))).toEqual([
      "stage",
      "build_type",
      "pain",
      "deadline",
      "budget",
      "role",
    ]);
    expect(questionForStep(3, { stage: "maintain_live_system" })).toBe("system_pain");
    expect(questionForStep(3, { stage: "evolve_live_system" })).toBe("system_pain");
  });

  it("todo id de opção tem texto no i18n (nos 3 idiomas)", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      const steps = getSection(locale, "quote.steps");
      expect(Object.keys(steps.stage.options).sort()).toEqual([...optionIds("stage", {}, noTiers)].sort());
      expect(Object.keys(steps.build_type.options).sort()).toEqual([...optionIds("build_type", {}, noTiers)].sort());
      expect(Object.keys(steps.pain.options).sort()).toEqual([...optionIds("pain", {}, noTiers)].sort());
      expect(Object.keys(steps.system_pain.options).sort()).toEqual([...optionIds("system_pain", {}, noTiers)].sort());
      expect(Object.keys(steps.deadline.options).sort()).toEqual([...optionIds("deadline", {}, noTiers)].sort());
      expect(Object.keys(steps.budget.options_no_numbers_mode).sort()).toEqual([...optionIds("budget", {}, noTiers)].sort());
      expect(Object.keys(steps.role.options).sort()).toEqual([...optionIds("role", {}, noTiers)].sort());
    }
  });

  it("ordem por P1 (i18n quote._notes.pain_order); not_sure sempre por último", () => {
    expect(optionIds("build_type", { stage: "product_idea" }, noTiers).slice(0, 3)).toEqual(["mvp", "client_platform", "mobile_app"]);
    expect(optionIds("build_type", { stage: "product_idea" }, noTiers).at(-1)).toBe("not_sure");
    expect(optionIds("pain", { stage: "scope_defined" }, noTiers).slice(0, 2)).toEqual(["new_product", "customer_channel"]);
    expect(optionIds("pain", { stage: "problem_unclear" }, noTiers)[0]).toBe("manual_process");
  });

  it("P5 sem números enquanto qualificacao.ts estiver vazio; com faixas, tier_1…4 + saídas dignas", () => {
    expect(budgetSetFor({}, noTiers)).toBe("no_numbers");
    expect(optionIds("budget", {}, noTiers)).toEqual(["approved", "being_defined", "not_considered", "prefer_to_discuss"]);
    expect(optionIds("budget", {}, tiers)).toEqual(["tier_1", "tier_2", "tier_3", "tier_4", "not_sure", "prefer_to_discuss"]);
    expect(budgetSetFor({ stage: "maintain_live_system" }, tiers)).toBe("monthly");
    expect(budgetSetFor({ stage: "maintain_live_system" }, { hasBudgetTiers: true, hasMonthlyTiers: false })).toBe("tiers");
  });

  it("a resposta da P5 deixa de valer se o conjunto mudar (troca de P1)", () => {
    const answered = setAnswer({ stage: "maintain_live_system" }, "budget", "tier_2", tiers);
    expect(answered.budget_set).toBe("monthly");
    expect(answerOf("budget", answered, tiers)).toBe("tier_2");
    const changed = { ...answered, stage: "product_idea" as const };
    expect(answerOf("budget", changed, tiers)).toBeUndefined();
    expect(isAnswered("budget", changed, tiers)).toBe(false);
  });
});

describe("multisseleção", () => {
  const order = optionIds("build_type", {}, noTiers);

  it("'Ainda não sei' é exclusiva nos dois sentidos", () => {
    expect(toggleOption("build_type", ["ops_system", "mvp"], "not_sure", true, order).next).toEqual(["not_sure"]);
    expect(toggleOption("build_type", ["not_sure"], "mvp", true, order).next).toEqual(["mvp"]);
  });

  it("P3 tem limite de 3", () => {
    const painOrder = optionIds("pain", {}, noTiers);
    const three = ["manual_process", "double_entry", "late_numbers"];
    expect(toggleOption("pain", three, "other", true, painOrder)).toEqual({ next: three, blocked: "max" });
    expect(toggleOption("pain", three, "double_entry", false, painOrder).next).toEqual(["manual_process", "late_numbers"]);
  });

  it("mantém a ordem de exibição", () => {
    expect(toggleOption("build_type", ["mvp"], "ops_system", true, order).next).toEqual(["ops_system", "mvp"]);
  });
});

describe("navegação e acesso direto (?etapa=)", () => {
  it("passo sem as respostas anteriores vai para a primeira pendente; P3 opcional não trava", () => {
    expect(firstIncompleteStep({}, noTiers)).toBe(1);
    expect(allowedScreen(4, { stage: "product_idea" }, noTiers)).toBe(2);
    expect(allowedScreen("resumo", { stage: "product_idea", build_type: ["mvp"] }, noTiers)).toBe(4);
    expect(firstIncompleteStep(complete, noTiers)).toBeNull();
    expect(allowedScreen("contato", complete, noTiers)).toBe("contato");
    expect(allowedScreen(2, complete, noTiers)).toBe(2);
  });

  it("voltar: contato → resumo → 6; 1 → entrada", () => {
    expect(previousScreen("contato")).toBe("resumo");
    expect(previousScreen("resumo")).toBe(6);
    expect(previousScreen(3)).toBe(2);
    expect(previousScreen(1)).toBeNull();
  });
});

describe("prazo no resumo × prazo do lead (F09)", () => {
  it("hasDeadlineWindow: urgência, data marcada ou 3 meses; isDeadlineUrgent continua sem os 3 meses", () => {
    expect(hasDeadlineWindow({ deadline: "within_3_months" })).toBe(true);
    expect(isDeadlineUrgent({ deadline: "within_3_months" })).toBe(false);
    expect(hasDeadlineWindow({ deadline: "asap" })).toBe(true);
    expect(hasDeadlineWindow({ deadline: "over_6_months", deadline_reason: "Feira de maio" })).toBe(true);
    expect(hasDeadlineWindow({ deadline: "between_3_and_6_months" })).toBe(false);
    expect(hasDeadlineWindow({ deadline: "not_defined", deadline_reason: "   " })).toBe(false);
    expect(hasDeadlineWindow({})).toBe(false);
  });
});

describe("barra de progresso sobre 8 passos (F21)", () => {
  it("P6 = 75%, resumo ≈ 87%, contato ≈ 95%; 100% só depois do envio", () => {
    expect(PROGRESS_STEPS).toBe(8);
    const pct = (screen: Parameters<typeof progressValue>[0]) => Math.round((progressValue(screen) / PROGRESS_STEPS) * 100);
    expect(STEP_NUMBERS.map((step) => progressValue(step))).toEqual([1, 2, 3, 4, 5, 6]);
    expect(pct(6)).toBe(75);
    expect(pct("resumo")).toBe(88);
    expect(pct("contato")).toBe(95);
    expect(progressValue("contato")).toBeLessThan(PROGRESS_STEPS);
  });
});

describe("trava de entrada de tela (F06, F21)", () => {
  it("2º clique de ponteiro logo depois da troca de tela é travado; o teclado (detail 0) nunca", () => {
    expect(blocksEntryClick(1, 130, 2)).toBe(true);
    expect(blocksEntryClick(2, 150, 3)).toBe(true);
    expect(blocksEntryClick(0, 50, 2)).toBe(false);
    expect(blocksEntryClick(1, ENTRY_CLICK_LOCK_MS, 2)).toBe(false);
    expect(blocksEntryClick(1, ENTRY_CLICK_LOCK_MS + 200, "resumo")).toBe(false);
  });

  it("no contato a janela é maior (toque duplo lento no CTA do resumo, que fica no mesmo lugar do envio)", () => {
    expect(CONTACT_ENTRY_LOCK_MS).toBeGreaterThan(ENTRY_CLICK_LOCK_MS);
    expect(blocksEntryClick(1, 300, "contato")).toBe(true);
    expect(blocksEntryClick(1, CONTACT_ENTRY_LOCK_MS - 1, "contato")).toBe(true);
    expect(blocksEntryClick(1, CONTACT_ENTRY_LOCK_MS, "contato")).toBe(false);
  });

  it("sem troca de tela por ação da pessoa (carga com ?etapa=), nada é travado", () => {
    expect(blocksEntryClick(1, Number.POSITIVE_INFINITY, 1)).toBe(false);
    expect(blocksEntryClick(1, -5, 1)).toBe(false);
  });
});

describe("pré-marcação e serviços", () => {
  it("?servico= marca a P2 (sustentação marca a P1)", () => {
    expect(SERVICE_PREFILL.web_systems).toEqual({ build_type: ["ops_system", "client_platform"] });
    expect(SERVICE_PREFILL.mobile_apps).toEqual({ build_type: ["mobile_app"] });
    expect(SERVICE_PREFILL.integrations).toEqual({ build_type: ["integration", "automation"] });
    expect(SERVICE_PREFILL.mvp).toEqual({ build_type: ["mvp"] });
    expect(SERVICE_PREFILL.support).toEqual({ stage: "maintain_live_system" });
  });

  it("hasPrefill: com rascunho, a linha de contexto só vale se a marcação estiver nas respostas (B166)", () => {
    expect(hasPrefill({ stage: "product_idea", build_type: ["mobile_app"] }, SERVICE_PREFILL.web_systems)).toBe(false);
    expect(hasPrefill({ build_type: ["ops_system", "client_platform", "mvp"] }, SERVICE_PREFILL.web_systems)).toBe(true);
    expect(hasPrefill({ stage: "maintain_live_system" }, SERVICE_PREFILL.support)).toBe(true);
    expect(hasPrefill({ stage: "product_idea" }, SERVICE_PREFILL.support)).toBe(false);
    expect(hasPrefill({}, {})).toBe(true);
  });

  it("serviços a partir das respostas (cases do pós-envio)", () => {
    expect(servicesFromAnswers({ build_type: ["client_platform", "automation"] })).toEqual(["web_systems", "integrations"]);
    expect(servicesFromAnswers({ stage: "evolve_live_system", build_type: ["mobile_app"] })).toEqual(["support", "mobile_apps"]);
  });

  describe("cases do mesmo tipo no resumo (B379)", () => {
    // Os 2 cases da camada fictícia (dados/ficticio/cases), na ordem do hub.
    const cases = {
      "exemplo-sistema-de-fretes": { name: "Transportadora", services: ["web_systems", "mobile_apps"] as const },
      "exemplo-app-de-vistorias": { name: "Agronegócio", services: ["mobile_apps", "integrations"] as const },
    };

    it("sistema de operação (web_systems): só o case de fretes", () => {
      expect(casesForAnswers(cases, { build_type: ["ops_system"] }).map(([slug]) => slug)).toEqual(["exemplo-sistema-de-fretes"]);
    });

    it("mvp: nenhum case compatível, nada (o bloco some, nunca um case qualquer)", () => {
      expect(casesForAnswers(cases, { build_type: ["mvp"] })).toEqual([]);
      expect(casesForAnswers(cases, {})).toEqual([]);
    });

    it("no máximo 2, na ordem do hub", () => {
      const three = { ...cases, "terceiro-app": { name: "Outro", services: ["mobile_apps"] as const } };
      expect(casesForAnswers(three, { build_type: ["mobile_app"] }).map(([slug]) => slug)).toEqual([
        "exemplo-sistema-de-fretes",
        "exemplo-app-de-vistorias",
      ]);
    });

    it("sem cases publicados (produção hoje), nada", () => {
      expect(casesForAnswers({}, { build_type: ["ops_system"] })).toEqual([]);
    });
  });
});

describe("rascunho", () => {
  it("ida e volta, descartando ids desconhecidos", () => {
    const record = answersToRecord({ ...complete, pain: ["manual_process"] });
    expect(recordToAnswers(record)).toEqual({ ...complete, pain: ["manual_process"] });
    expect(recordToAnswers({ stage: "hack", build_type: ["mvp", "evil"], role: "ceo" })).toEqual({ build_type: ["mvp"] });
  });
});
