/**
 * FAQ das páginas do agente pages, em ORDEM INTERCALADA (dono: pages).
 *
 * O home é dono das regras de variante e de condicional (components/shared/faq.ts:
 * bankItems, conditionalItems, capFaq). Este módulo só monta a sequência que
 * cada página declara nas notas do i18n (how_we_work/discovery_sprint/pricing/
 * services._notes.faq_composition), em que perguntas do banco, condicionais e
 * perguntas próprias do serviço aparecem misturadas — coisa que o composeFaq
 * do home (página → banco → condicionais) não expressa. Nenhuma regra de
 * variante ou de flag é reimplementada aqui.
 *
 * Só servidor: importa o i18n inteiro.
 */

import {
  bankItems,
  capFaq,
  conditionalItems,
  type FaqBankKey,
  type FaqConditionalKey,
  type FaqInlineLink,
  type FaqItem,
  type FaqLink,
} from "@/components/shared/faq";
import { confirmacoes } from "@/config/confirmacoes";
import { empresa } from "@/config/empresa";
import type { Features } from "@/config/features";
import type { ServiceKey } from "@/config/routes";
import { hasText, tDynamic, type Locale } from "@/i18n";

export type FaqEntry =
  | { bank: FaqBankKey }
  | { cond: FaqConditionalKey }
  /** Pergunta própria do serviço: services.{service}.faq.{own}. */
  | { own: string };

export type FaqFeatures = Pick<Features, "hasPricing" | "hasDiscoveryFormat" | "hasCompanyData" | "confirm"> &
  Partial<Pick<Features, "hasWhatsapp">>;

export interface OrderedFaqOptions {
  /** Serviço dono das perguntas `{ own }`. */
  service?: ServiceKey;
  /** Ordem de remoção acima do teto de 9 (ids), como declarada na nota da página. */
  removalOrder?: readonly string[];
  /** Âncora das faixas DESTA página (só quando o bloco existe nela): sufixo-link do banco. */
  pricingHref?: string;
  /** Sufixo do abatimento em why_discovery_paid (só páginas de serviço). */
  discoveryCreditSuffix?: boolean;
  /** Link no fim de uma pergunta própria (ex.: price → #investimento), por id. */
  ownLinks?: Readonly<Record<string, FaqLink | undefined>>;
  /**
   * Trecho de uma resposta própria que vira link, por id (ex.: "diagnóstico
   * gratuito" → /orcamento?servico=…&origem=…-faq, services._notes.faq_links).
   */
  ownInlineLinks?: Readonly<Record<string, FaqInlineLink | undefined>>;
}

/**
 * Pergunta própria do serviço. Variantes, pela ordem:
 *  - com confirmacoes.nda e a chave `question_with_nda`: pergunta e resposta
 *    que incluem o NDA (integrations.faq.data_access, auditoria F15); sem
 *    WhatsApp no ambiente, `answer_with_nda_no_whatsapp`. {email} vem de
 *    empresa.ts, como no faq.conditional.nda. Sem a flag, a pergunta e a
 *    resposta padrão não falam de NDA;
 *  - mvp.faq.wont_stall troca para answer_with_code_ownership com
 *    confirmacoes.codigoProprietario (services._notes.pending_owner, item 2).
 */
function ownItem(
  locale: Locale,
  service: ServiceKey,
  key: string,
  features: FaqFeatures,
  link: FaqLink | undefined,
  inlineLink?: FaqInlineLink,
): FaqItem | null {
  const base = `services.${service}.faq.${key}`;
  if (!hasText(locale, `${base}.question`)) return null;
  const withNda = features.confirm.nda && hasText(locale, `${base}.question_with_nda`);
  const withCode = `${base}.answer_with_code_ownership`;
  let question = tDynamic(locale, `${base}.question`);
  let answer =
    features.confirm.codigoProprietario && confirmacoes.codigoProprietario && hasText(locale, withCode)
      ? tDynamic(locale, withCode)
      : tDynamic(locale, `${base}.answer`);
  if (withNda) {
    const noWhatsapp = `${base}.answer_with_nda_no_whatsapp`;
    question = tDynamic(locale, `${base}.question_with_nda`);
    answer = tDynamic(locale, features.hasWhatsapp === false && hasText(locale, noWhatsapp) ? noWhatsapp : `${base}.answer_with_nda`, {
      email: empresa.email,
    });
  }
  return {
    id: key,
    question,
    answer,
    source: "page",
    ...(link ? { link } : {}),
    ...(inlineLink ? { inlineLink } : {}),
  };
}

/** Lista final, na ordem declarada, só com o que está visível, com o teto aplicado. */
export function orderedFaq(
  locale: Locale,
  entries: readonly FaqEntry[],
  features: FaqFeatures,
  options: OrderedFaqOptions = {},
): FaqItem[] {
  const { service, removalOrder, pricingHref, discoveryCreditSuffix, ownLinks = {}, ownInlineLinks = {} } = options;
  const items = entries.flatMap((entry): FaqItem[] => {
    if ("bank" in entry) return bankItems(locale, [entry.bank], features, { pricingHref, discoveryCreditSuffix });
    if ("cond" in entry) return conditionalItems(locale, [entry.cond], features);
    if (!service) return [];
    const item = ownItem(locale, service, entry.own, features, ownLinks[entry.own], ownInlineLinks[entry.own]);
    return item ? [item] : [];
  });
  return capFaq(items, { removalOrder });
}
