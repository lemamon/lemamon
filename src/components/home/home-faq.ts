/**
 * FAQ da Home (BLUEPRINT §6.1 #13) — composição. Dono: home.
 *
 * Banco nesta ordem + condicionais liberadas pelo dono, com o teto de 9
 * (faq._notes.faq_ceiling). Com todas as condicionais ligadas são 12; saem,
 * nesta ordem (B039):
 *   1. invoice ............ NF já é respondida em /quanto-custa
 *   2. nda ................ NDA já é respondido em /contato
 *   3. how_follow_progress  a etapa 3 do método, na própria Home, responde
 *   4. diagnosis_commitment (reserva, se a página ganhar mais perguntas)
 * Assim "E depois que o sistema entra no ar?" (a objeção "vocês somem
 * depois?") e "Preciso entender de tecnologia?" ficam sempre na Home.
 *
 * Seguro para testes (vitest): só o i18n e configs puros, via ../shared/faq.
 */
import {
  composeFaq,
  type ConditionalSources,
  type FaqBankKey,
  type FaqConditionalKey,
  type FaqItem,
  type ComposeOptions,
} from "@/components/shared/faq";
import type { Locale } from "@/i18n";

export const HOME_FAQ_BANK = [
  "how_much",
  "how_long",
  "why_discovery_paid",
  "diagnosis_commitment",
  "need_tech_knowledge",
  "how_follow_progress",
  "after_launch",
] as const satisfies readonly FaqBankKey[];

export const HOME_FAQ_CONDITIONAL = [
  "scope_change",
  "code_ownership",
  "invoice",
  "other_cities",
  "nda",
] as const satisfies readonly FaqConditionalKey[];

/** Ordem de remoção quando passa do teto (faq_composition da Home). */
export const HOME_FAQ_REMOVAL_ORDER = ["invoice", "nda", "how_follow_progress", "diagnosis_commitment"] as const;

export interface HomeFaqOptions {
  features: ComposeOptions["features"];
  /** Âncora do bloco de faixas, só quando ele existe na Home (hasPricing). */
  pricingHref?: string;
  /** Só testes: confirmacoes/descoberta injetadas (tests/fixtures/). */
  sources?: ConditionalSources;
}

/** Perguntas visíveis da Home, já com variantes, condicionais e teto. */
export function homeFaqItems(locale: Locale, { features, pricingHref, sources }: HomeFaqOptions): FaqItem[] {
  return composeFaq(locale, {
    features,
    bank: HOME_FAQ_BANK,
    conditional: HOME_FAQ_CONDITIONAL,
    removalOrder: HOME_FAQ_REMOVAL_ORDER,
    pricingHref,
    sources,
  });
}
