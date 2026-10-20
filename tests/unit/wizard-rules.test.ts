/**
 * Resumo "Este é o seu ponto de partida" — BLUEPRINT §7.4 com as notas do copy
 * (i18n quote._notes.topics, factors, pricing, summary_chips). Sem prazo
 * estimado nem valor calculado; bloco de preço só com faixa preenchida.
 */
import { describe, expect, it } from "vitest";

import { getSection } from "@/i18n";
import type { RulesCopy } from "@/islands/wizard/copy";
import type { Answers } from "@/islands/wizard/model";
import {
  answerChips,
  answeredChips,
  developmentLine,
  emphasisKey,
  highlightedStage,
  joinAnnouncement,
  priceBlock,
  summaryFactors,
  summaryTopics,
  type ChipContext,
} from "@/islands/wizard/rules";

const quote = getSection("pt", "quote");
const copy: RulesCopy = {
  steps: quote.steps,
  summary: quote.summary,
  whatsapp: quote.whatsapp_messages,
  contactForm: quote.contact_form,
};
const noPricing = { semDescoberta: false, valoresNoDiagnostico: false, pricingLines: [] as const };
const chipCtx: ChipContext = { hasBudgetTiers: false, hasMonthlyTiers: false, tierLabel: () => undefined };

describe("etapa realçada e ênfase", () => {
  it("Descoberta para quem vai construir; sustentação para sistema no ar", () => {
    expect(highlightedStage({ stage: "product_idea" })).toBe("discovery");
    expect(highlightedStage({ stage: "maintain_live_system" })).toBe("support");
    expect(emphasisKey({ stage: "problem_unclear" }, noPricing)).toBe("discovery_default");
    expect(emphasisKey({ stage: "scope_defined" }, noPricing)).toBe("discovery_scope_defined");
    expect(emphasisKey({ stage: "scope_defined" }, { semDescoberta: true })).toBe("discovery_scope_defined_skip_variant");
    expect(emphasisKey({ stage: "evolve_live_system" }, noPricing)).toBe("live_system");
  });
});

describe("tópicos (2 a 4, por prioridade)", () => {
  it("sistema no ar + integração + quem decide", () => {
    const answers: Answers = { stage: "evolve_live_system", build_type: ["integration"], role: "recommend_to_decider" };
    expect(summaryTopics(answers, noPricing)).toEqual(["topic_live_system", "topic_integration", "topic_decider"]);
  });

  it("data travante sobe para logo depois da dor e nunca sai dos 4", () => {
    const answers: Answers = {
      stage: "problem_unclear",
      build_type: ["ops_system", "mobile_app", "integration", "automation"],
      pain: ["manual_process"],
      deadline_reason: "Feira de maio",
      role: "researching",
    };
    const topics = summaryTopics(answers, noPricing);
    expect(topics).toHaveLength(4);
    expect(topics.slice(0, 2)).toEqual(["topic_pain", "topic_deadline"]);
  });

  it("variantes de produto e topic_process omitido quando topic_app já aparece", () => {
    const answers: Answers = { stage: "product_idea", build_type: ["client_platform", "mobile_app"], pain: ["late_numbers"] };
    expect(summaryTopics(answers, noPricing)).toEqual(["topic_pain_product_variant", "topic_app"]);
    expect(summaryTopics({ stage: "product_idea", build_type: ["client_platform"] }, noPricing)).toEqual([
      "topic_process_product_variant",
      "topic_success",
    ]);
  });

  it("menos de 2: completa com topic_success; 'Ainda não sei' vira topic_not_sure", () => {
    expect(summaryTopics({ stage: "problem_unclear", build_type: ["not_sure"] }, noPricing)).toEqual(["topic_not_sure", "topic_success"]);
  });

  it("topic_budget só quando o bloco de preço mostra faixas", () => {
    const answers: Answers = { stage: "problem_unclear", build_type: ["mvp"], budget: "not_considered" };
    expect(summaryTopics(answers, noPricing)).not.toContain("topic_budget");
    expect(summaryTopics(answers, { ...noPricing, pricingLines: ["descoberta"] })).toContain("topic_budget");
  });
});

describe("fatores (até 3; com menos de 2, factor_default completa)", () => {
  it("app, integração, várias frentes (mvp não conta como frente)", () => {
    expect(summaryFactors({ stage: "scope_defined", build_type: ["mobile_app", "integration"] }, noPricing)).toEqual([
      "factor_app",
      "factor_integration",
      "factor_multi",
    ]);
    expect(summaryFactors({ stage: "product_idea", build_type: ["mvp", "client_platform"] }, noPricing)).toEqual([
      "factor_scope",
      "factor_default",
    ]);
  });

  it("caminhos comuns nunca entregam um fator só (a promessa da entrada é 'o que influencia')", () => {
    expect(summaryFactors({ stage: "problem_unclear", build_type: ["ops_system"], deadline: "within_3_months" }, noPricing)).toEqual([
      "factor_scope",
      "factor_default",
    ]);
    expect(
      summaryFactors({ stage: "scope_defined", build_type: ["client_platform"], deadline: "between_3_and_6_months" }, noPricing),
    ).toEqual(["factor_scope", "factor_default"]);
    // Com dois fatores próprios, o genérico não entra.
    expect(summaryFactors({ stage: "problem_unclear", build_type: ["ops_system"], deadline: "asap" }, noPricing)).toEqual([
      "factor_deadline",
      "factor_scope",
    ]);
  });

  it("variante skip e fator de sistema no ar; sem nada, factor_default", () => {
    expect(summaryFactors({ stage: "scope_defined", build_type: ["ops_system", "automation"] }, { semDescoberta: true })).toContain(
      "factor_multi_skip_variant",
    );
    expect(summaryFactors({ stage: "maintain_live_system", build_type: ["ops_system"] }, noPricing)).toEqual([
      "factor_scope_live",
      "factor_default",
    ]);
    expect(summaryFactors({ stage: "problem_unclear", build_type: ["not_sure"] }, noPricing)).toEqual(["factor_default"]);
  });
});

describe("bloco 'E o preço?'", () => {
  it("sem faixa preenchida: price_empty (nenhum número)", () => {
    expect(priceBlock({ stage: "problem_unclear", build_type: ["mvp"] }, noPricing)).toEqual({ kind: "empty", first: "price_empty" });
    expect(priceBlock({ stage: "scope_defined" }, { ...noPricing, semDescoberta: true })).toEqual({
      kind: "empty",
      first: "price_empty_skip_variant",
    });
  });

  it("com faixas: Descoberta + a linha do tipo, lado a lado, nunca somadas", () => {
    const ctx = { ...noPricing, pricingLines: ["descoberta", "desenvolvimento.aplicativos"] as const };
    expect(priceBlock({ stage: "product_idea", build_type: ["mobile_app"] }, { ...ctx, pricingLines: [...ctx.pricingLines] })).toEqual({
      kind: "ranges",
      lines: ["descoberta", "desenvolvimento.aplicativos"],
      note: "price_note",
    });
  });

  it("várias frentes ou 'Ainda não sei': só a da Descoberta", () => {
    expect(developmentLine(["mvp", "client_platform"])).toBeNull();
    expect(developmentLine(["integration", "automation"])).toBe("desenvolvimento.integracoes");
    expect(developmentLine(["not_sure"])).toBeNull();
    const ctx = { ...noPricing, pricingLines: ["descoberta", "desenvolvimento.sistemas"] as never[] };
    expect(priceBlock({ stage: "problem_unclear", build_type: ["ops_system", "mobile_app"] }, ctx)).toMatchObject({ lines: ["descoberta"] });
  });

  it("sistema no ar: sempre o texto 'live', com ou sem faixas", () => {
    expect(priceBlock({ stage: "maintain_live_system" }, { ...noPricing, pricingLines: ["sustentacao"] })).toEqual({
      kind: "live",
      second: "price_empty_live_2",
    });
    expect(priceBlock({ stage: "evolve_live_system" }, { ...noPricing, valoresNoDiagnostico: true })).toEqual({
      kind: "live",
      second: "price_empty_live_2_with_values",
    });
  });
});

describe("chips 'Suas respostas'", () => {
  it("rótulo curto + opção curta; data travante vira chip próprio; P3 pulada aparece como não respondida", () => {
    const answers: Answers = {
      stage: "product_idea",
      build_type: ["mobile_app", "mvp"],
      pain: [],
      deadline: "asap",
      deadline_reason: "Feira de maio",
      budget: "approved",
      budget_set: "no_numbers",
      role: "i_decide",
    };
    const chips = answerChips(answers, copy, chipCtx);
    expect(chips.map((chip) => chip.label)).toEqual([
      quote.steps.stage.short_label,
      quote.steps.build_type.short_label,
      quote.steps.pain.short_label,
      quote.steps.deadline.short_label,
      quote.steps.deadline.reason_short_label,
      quote.steps.budget.short_label,
      quote.steps.role.short_label,
    ]);
    expect(chips[1]?.value).toBe(`${quote.steps.build_type.options_short.mvp} · ${quote.steps.build_type.options_short.mobile_app}`);
    expect(chips[2]).toMatchObject({ skipped: true, value: quote.summary.skipped_answer });
    expect(chips[4]?.value).toBe("Feira de maio");
    expect(answeredChips(chips)).toHaveLength(6);
  });

  it("variante 'no ar' troca só os rótulos de mvp e not_sure", () => {
    const chips = answerChips({ stage: "evolve_live_system", build_type: ["not_sure"] }, copy, chipCtx);
    expect(chips[1]?.value).toBe(quote.steps.build_type.options_short_live_variant.not_sure);
  });

  it("faixas vêm de qualificacao.ts (tierLabel), não do copy", () => {
    const ctx: ChipContext = { hasBudgetTiers: true, hasMonthlyTiers: false, tierLabel: (_set, id) => `faixa ${id}` };
    const chips = answerChips({ stage: "problem_unclear", budget: "tier_3", budget_set: "tiers" }, copy, ctx);
    expect(chips.find((chip) => chip.question === "budget")?.value).toBe("faixa tier_3");
  });
});

describe("anúncio do progresso no resumo e no contato (B012)", () => {
  for (const locale of ["pt", "en", "es"] as const) {
    it(`${locale}: o rótulo do progresso vem antes do título da tela`, () => {
      const q = getSection(locale, "quote");
      const summary = joinAnnouncement(q.progress.summary_label, q.summary.title);
      const contact = joinAnnouncement(q.progress.contact_label, q.contact_form.title);
      expect(summary.startsWith(q.progress.summary_label)).toBe(true);
      expect(summary).toContain(q.summary.title);
      expect(contact.startsWith(q.progress.contact_label)).toBe(true);
      expect(contact).toContain(q.contact_form.title);
    });
  }

  it("ponto entre rótulo e título, sem pontuação dobrada", () => {
    expect(joinAnnouncement("Resumo", "Este é o seu ponto de partida")).toBe("Resumo. Este é o seu ponto de partida");
    expect(joinAnnouncement("Último passo:", "seu contato")).toBe("Último passo: seu contato");
    expect(joinAnnouncement("", "Título")).toBe("Título");
  });
});
