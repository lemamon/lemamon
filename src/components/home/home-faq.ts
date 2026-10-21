/**
 * FAQ da Home (BLUEPRINT §6.1 #13) — composição. Dono: home.
 *
 * Banco + condicionais liberadas pelo dono, exibidos na ordem de
 * HOME_FAQ_ORDER, com o teto de 9 (faq._notes.faq_ceiling). "O código fica
 * com a minha empresa?" vem em 3º, logo depois de preço e prazo (auditoria de
 * conversão F01: a garantia já confirmada não fica no fim do acordeão). Com
 * todas as condicionais ligadas são 12; saem, nesta ordem (B039, F01):
 *   1. invoice ............ NF já é respondida em /quanto-custa
 *   2. how_follow_progress  a etapa 3 do método, na própria Home, responde
 *   3. diagnosis_commitment a microcopy sob o CTA do hero já diz "Sem
 *                           compromisso · 45 minutos · devolutiva por escrito"
 *   4. nda ................ (reserva) NDA já é respondido em /contato
 * Assim "E depois que o sistema entra no ar?" (a objeção "vocês somem
 * depois?"), "Preciso entender de tecnologia?" e, com os dados de hoje
 * (D31), "outras cidades ou fora do Brasil" e o NDA ficam na Home.
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

/** Ordem de exibição (ids): banco e condicionais intercalados (F01: código em 3º). */
export const HOME_FAQ_ORDER = [
  "how_much",
  "how_long",
  "code_ownership",
  "why_discovery_paid",
  "diagnosis_commitment",
  "need_tech_knowledge",
  "how_follow_progress",
  "after_launch",
  "scope_change",
  "invoice",
  "other_cities",
  "nda",
] as const satisfies readonly (FaqBankKey | FaqConditionalKey)[];

/** Ordem de remoção quando passa do teto (faq_composition da Home). */
export const HOME_FAQ_REMOVAL_ORDER = ["invoice", "how_follow_progress", "diagnosis_commitment", "nda"] as const;

export interface HomeFaqOptions {
  features: ComposeOptions["features"];
  /** Âncora do bloco de faixas, só quando ele existe na Home (hasPricing). */
  pricingHref?: string;
  /** Só testes: confirmacoes/descoberta injetadas (tests/fixtures/). */
  sources?: ConditionalSources;
}

const position = (id: string) => (HOME_FAQ_ORDER as readonly string[]).indexOf(id);

/** Perguntas visíveis da Home, já com variantes, condicionais e teto, na ordem de HOME_FAQ_ORDER. */
export function homeFaqItems(locale: Locale, { features, pricingHref, sources }: HomeFaqOptions): FaqItem[] {
  // O teto tira pela ordem de remoção declarada (independe da posição); depois, a ordem de exibição.
  return composeFaq(locale, {
    features,
    bank: HOME_FAQ_BANK,
    conditional: HOME_FAQ_CONDITIONAL,
    removalOrder: HOME_FAQ_REMOVAL_ORDER,
    pricingHref,
    sources,
  }).sort((a, b) => position(a.id) - position(b.id));
}
