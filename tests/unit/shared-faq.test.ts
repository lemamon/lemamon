/**
 * FAQ (BLUEPRINT §5.6, faq._notes) — helpers de components/shared/faq.ts. Dono: home.
 *  - a variante de cada pergunta segue as flags do build;
 *  - condicional só aparece com a flag do dono (e na variante certa);
 *  - o teto de 9 tira primeiro o banco, do fim para o começo;
 *  - o link de faixas só existe com hasPricing E âncora na página;
 *  - nenhum texto com {placeholder} cru.
 */
import { describe, expect, it } from "vitest";

import {
  answerText,
  bankItems,
  capFaq,
  composeFaq,
  conditionalItems,
  FAQ_MAX,
  splitInlineLink,
  type FaqBankKey,
  type FaqConditionalKey,
  type FaqItem,
} from "@/components/shared/faq";
import { empresa } from "@/config/empresa";
import { computeFeatures } from "@/config/features";
import { t, type Locale } from "@/i18n";

import { baseSources } from "../fixtures/features";
import { completeConfirmacoes, completeDescoberta, completeEmpresa, completePrecos } from "../fixtures/owner-data";

const LOCALES: Locale[] = ["pt", "en", "es"];
const HOME_BANK: FaqBankKey[] = [
  "how_much",
  "how_long",
  "why_discovery_paid",
  "diagnosis_commitment",
  "need_tech_knowledge",
  "how_follow_progress",
  "after_launch",
];
const HOME_CONDITIONAL: FaqConditionalKey[] = ["scope_change", "code_ownership", "invoice", "other_cities", "nda"];
const ALL_CONDITIONAL: FaqConditionalKey[] = [
  "diagnosis_format",
  "scope_change",
  "code_ownership",
  "invoice",
  "payment_terms",
  "other_cities",
  "nda",
  "third_party_system",
  "skip_discovery",
  "discovery_duration",
  "discovery_plan_ownership",
  "discovery_credit",
  "data_migration",
];

const empty = computeFeatures(baseSources());
const owner = { confirmacoes: completeConfirmacoes(), descoberta: completeDescoberta() };
const full = computeFeatures(
  baseSources({ ...owner, precos: completePrecos(), empresa: completeEmpresa() }),
);
const ids = (items: FaqItem[]) => items.map((item) => item.id);

describe("bankItems", () => {
  it("devolve as perguntas na ordem pedida, com texto nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      const items = bankItems(locale, HOME_BANK, empty);
      expect(ids(items)).toEqual(HOME_BANK);
      for (const item of items) {
        expect(item.question.trim()).not.toBe("");
        expect(item.answer.trim()).not.toBe("");
        expect(item.link).toBeUndefined();
      }
    }
  });

  it("escolhe a variante pelo hasPricing (no_price_table / reference_before_talking)", () => {
    const off = bankItems("pt", ["no_price_table", "reference_before_talking"], empty);
    const on = bankItems("pt", ["no_price_table", "reference_before_talking"], full);
    expect(off[0]?.question).toBe(t("pt", "faq.items.no_price_table.question"));
    expect(on[0]?.question).toBe(t("pt", "faq.items.no_price_table.question_with_pricing"));
    expect(off[1]?.answer).toBe(t("pt", "faq.items.reference_before_talking.answer_without_pricing"));
    expect(on[1]?.answer).toBe(t("pt", "faq.items.reference_before_talking.answer_with_pricing"));
  });

  it("sufixo de faixas vira link só com hasPricing e âncora da página", () => {
    expect(bankItems("pt", ["how_much"], empty, { pricingHref: "#investimento" })[0]?.link).toBeUndefined();
    expect(bankItems("pt", ["how_much"], full)[0]?.link).toBeUndefined();
    const item = bankItems("pt", ["how_much"], full, { pricingHref: "#investimento" })[0];
    expect(item?.link).toEqual({ href: "#investimento", text: t("pt", "faq.items.how_much.answer_with_pricing_suffix") });
    expect(answerText(item as FaqItem)).toContain(t("pt", "faq.items.how_much.answer_with_pricing_suffix"));
  });

  it("abatimento da Descoberta só com a flag e só quando a página pede", () => {
    const base = t("pt", "faq.items.why_discovery_paid.answer");
    const suffix = t("pt", "faq.conditional.discovery_credit.cost_suffix");
    expect(bankItems("pt", ["why_discovery_paid"], full)[0]?.answer).toBe(base);
    expect(bankItems("pt", ["why_discovery_paid"], empty, { discoveryCreditSuffix: true })[0]?.answer).toBe(base);
    expect(bankItems("pt", ["why_discovery_paid"], full, { discoveryCreditSuffix: true })[0]?.answer).toBe(`${base} ${suffix}`);
  });
});

describe("conditionalItems", () => {
  it("sem flag do dono, nenhuma condicional existe", () => {
    for (const locale of LOCALES) expect(conditionalItems(locale, ALL_CONDITIONAL, empty)).toEqual([]);
  });

  it("com as flags, todas aparecem, sem placeholder cru", () => {
    for (const locale of LOCALES) {
      const items = conditionalItems(locale, ALL_CONDITIONAL, full, owner);
      expect(ids(items)).toEqual(ALL_CONDITIONAL);
      for (const item of items) expect(`${item.question} ${item.answer}`).not.toMatch(/\{[a-z_]+\}/);
    }
  });

  it("code_ownership publica só o rascunho aprovado", () => {
    const alt = { ...owner, confirmacoes: { ...owner.confirmacoes, codigoProprietario: "answer_draft_alt" as const } };
    const altFeatures = computeFeatures(baseSources(alt));
    expect(conditionalItems("pt", ["code_ownership"], full, owner)[0]?.answer).toBe(t("pt", "faq.conditional.code_ownership.answer_draft"));
    expect(conditionalItems("pt", ["code_ownership"], altFeatures, alt)[0]?.answer).toBe(
      t("pt", "faq.conditional.code_ownership.answer_draft_alt"),
    );
  });

  it("invoice troca de variante com os dados da empresa", () => {
    const noCompany = computeFeatures(baseSources(owner));
    expect(conditionalItems("pt", ["invoice"], noCompany, owner)[0]?.question).toBe(t("pt", "faq.conditional.invoice.question"));
    expect(conditionalItems("pt", ["invoice"], full, owner)[0]?.question).toBe(
      t("pt", "faq.conditional.invoice.question_with_company_data"),
    );
  });

  it("nda: e-mail vem de empresa.ts e, sem WhatsApp, a variante cita só o e-mail", () => {
    for (const locale of LOCALES) {
      const withWhatsapp = conditionalItems(locale, ["nda"], { ...full, hasWhatsapp: true }, owner)[0];
      const withoutWhatsapp = conditionalItems(locale, ["nda"], { ...full, hasWhatsapp: false }, owner)[0];
      expect(withWhatsapp?.answer).toBe(t(locale, "faq.conditional.nda.answer_draft", { email: empresa.email }));
      expect(withoutWhatsapp?.answer).toBe(t(locale, "faq.conditional.nda.answer_draft_no_whatsapp", { email: empresa.email }));
      expect(withoutWhatsapp?.answer).not.toMatch(/whatsapp/i);
      expect(withWhatsapp?.answer).toContain(empresa.email);
    }
  });

  it("discovery_duration: formato completo > confirmação > nada", () => {
    const withFormat = conditionalItems("pt", ["discovery_duration"], full, owner)[0];
    expect(withFormat?.answer).toContain(owner.descoberta.duracao?.pt);
    const onlyFlag = computeFeatures(baseSources({ confirmacoes: owner.confirmacoes }));
    expect(conditionalItems("pt", ["discovery_duration"], onlyFlag, { ...owner, descoberta: baseSources().descoberta })[0]?.answer).toBe(
      t("pt", "faq.conditional.discovery_duration.answer_draft"),
    );
  });
});

describe("composeFaq e teto de 9", () => {
  it("Home sem dado: as 7 do banco, na ordem do BLUEPRINT §6.1 #13", () => {
    for (const locale of LOCALES) {
      const items = composeFaq(locale, { features: empty, bank: HOME_BANK, conditional: HOME_CONDITIONAL });
      expect(ids(items)).toEqual(HOME_BANK);
    }
  });

  it("Home com todas as flags: 12 candidatas → 9, saem as últimas do banco; condicionais ficam", () => {
    const items = composeFaq("pt", {
      features: full,
      bank: HOME_BANK,
      conditional: HOME_CONDITIONAL,
      sources: owner,
      pricingHref: "#investimento",
    });
    expect(items).toHaveLength(FAQ_MAX);
    expect(ids(items)).toEqual([
      "how_much",
      "how_long",
      "why_discovery_paid",
      "diagnosis_commitment",
      ...HOME_CONDITIONAL,
    ]);
    expect(items[0]?.link?.href).toBe("#investimento");
  });

  it("ordem de remoção declarada pela página vence a padrão", () => {
    const items: FaqItem[] = Array.from({ length: 11 }, (_, index) => ({
      id: `q${index}`,
      question: "q",
      answer: "a",
      source: index < 5 ? "bank" : "conditional",
    }));
    expect(ids(capFaq(items, { removalOrder: ["q7", "q0"] }))).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q8", "q9", "q10"]);
    expect(ids(capFaq(items))).toEqual(["q0", "q1", "q2", "q5", "q6", "q7", "q8", "q9", "q10"]);
  });
});

describe("splitInlineLink (link no meio da resposta)", () => {
  const item: FaqItem = { id: "x", question: "Q?", answer: "Antes. O diagnóstico gratuito ajuda a decidir.", source: "page" };

  it("divide no trecho sem mudar o texto; JSON-LD continua com a resposta inteira", () => {
    const withLink = { ...item, inlineLink: { phrase: "diagnóstico gratuito", href: "/orcamento?origem=x-faq" } };
    const parts = splitInlineLink(withLink);
    expect(parts).toEqual({ before: "Antes. O ", phrase: "diagnóstico gratuito", after: " ajuda a decidir." });
    expect(`${parts?.before}${parts?.phrase}${parts?.after}`).toBe(item.answer);
    expect(answerText(withLink)).toBe(item.answer);
  });

  it("trecho ausente ou sem href: sem link (degrada sem quebrar)", () => {
    expect(splitInlineLink(item)).toBeNull();
    expect(splitInlineLink({ ...item, inlineLink: { phrase: "free assessment", href: "/x" } })).toBeNull();
    expect(splitInlineLink({ ...item, inlineLink: { phrase: "diagnóstico gratuito", href: "" } })).toBeNull();
  });
});
