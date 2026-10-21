/**
 * Banco central de FAQ (i18n `faq`) — helpers do componente Faq. Dono: home.
 *
 * BLUEPRINT §5.6 e faq._notes. A página decide QUAIS perguntas e em que
 * ordem; estes helpers decidem a VARIANTE de texto de cada uma (pelas flags
 * do build) e se uma condicional aparece. Só o que volta daqui é visível, e o
 * <Faq> emite o FAQPage JSON-LD exatamente com essa lista.
 *
 *   const features = await getFeatures();
 *   const items = composeFaq(locale, {
 *     bank: ["how_much", "how_long", ...],
 *     conditional: ["scope_change", "code_ownership", ...],
 *     features,
 *     pricingHref: "#investimento",   // só se o bloco de faixas existir NESTA página
 *   });
 *
 * Seguro para testes (vitest): importa só o i18n e configs puros.
 */

import type { Features } from "@/config/features";
import { confirmacoes as defaultConfirmacoes, type Confirmacoes } from "@/config/confirmacoes";
import { empresa } from "@/config/empresa";
import { hasText, t, tDynamic, type Locale, type Messages } from "@/i18n";

export interface FaqLink {
  href: string;
  text: string;
}

/**
 * Trecho da resposta que vira link, sem mudar o texto (ex.: "diagnóstico
 * gratuito" → /orcamento?servico=…&origem=…-faq, services._notes.faq_links).
 * Se `phrase` não estiver na resposta, ela sai inteira, sem link.
 */
export interface FaqInlineLink {
  phrase: string;
  href: string;
  /** Atributos extras do <a> (data-track, data-origem…). */
  attrs?: Readonly<Record<string, string>>;
}

export interface FaqItem {
  id: string;
  question: string;
  /** Resposta em texto puro. */
  answer: string;
  /** Link opcional no fim da resposta (ex.: sufixo das faixas com hasPricing). */
  link?: FaqLink;
  /** Link no meio da resposta, no lugar do trecho `phrase`. */
  inlineLink?: FaqInlineLink;
  /** De onde veio: banco, condicional ou pergunta própria da página (teto de 9). */
  source?: "bank" | "conditional" | "page";
}

export type FaqBankKey = keyof Messages["faq"]["items"];
export type FaqConditionalKey = keyof Messages["faq"]["conditional"];

/** Teto do site: no máximo 9 perguntas visíveis por página (faq._notes.faq_ceiling). */
export const FAQ_MAX = 9;

type BankFeatures = Pick<Features, "hasPricing"> & Partial<Pick<Features, "confirm">>;
/** hasWhatsapp é opcional: sem ela, a resposta do NDA cita o WhatsApp (variante padrão). */
type ConditionalFeatures = Pick<Features, "confirm" | "hasCompanyData"> & Partial<Pick<Features, "hasWhatsapp">>;

export interface BankOptions {
  /**
   * Âncora (ou URL) do bloco de faixas DESTA página. Com hasPricing, as
   * perguntas que têm `answer_with_pricing_suffix` (how_much) ganham o sufixo
   * como link (faq._notes.how_much). Sem esta opção o sufixo não aparece, para
   * nunca apontar para âncora inexistente.
   */
  pricingHref?: string;
  /**
   * Rascunho aprovado de "De quem é o código?" (confirmacoes.codigoProprietario).
   * Padrão: o do config. Só testes injetam outro valor.
   */
  codeOwnership?: Confirmacoes["codigoProprietario"];
}

/**
 * Itens do banco (faq.items), na ordem pedida, já na variante do build
 * (faq._notes): com hasPricing usa question_with_pricing/answer_with_pricing
 * quando existem; sem hasPricing usa answer_without_pricing quando existe.
 * Com o código do cliente aprovado no rascunho answer_draft ("é da sua
 * empresa, por contrato"), answer_with_code_ownership substitui a resposta
 * quando existe (faq._notes.wont_stall, auditoria F42). Com answer_draft_alt
 * (transferência conforme os pagamentos), a resposta fica a padrão.
 */
export function bankItems(
  locale: Locale,
  keys: readonly FaqBankKey[],
  features: BankFeatures,
  options: BankOptions = {},
): FaqItem[] {
  return keys.map((key) => {
    const base = `faq.items.${key}`;
    const pick = (field: "question" | "answer") => {
      const withPricing = `${base}.${field}_with_pricing`;
      const withoutPricing = `${base}.${field}_without_pricing`;
      if (features.hasPricing && hasText(locale, withPricing)) return tDynamic(locale, withPricing);
      if (!features.hasPricing && hasText(locale, withoutPricing)) return tDynamic(locale, withoutPricing);
      return tDynamic(locale, `${base}.${field}`);
    };
    let answer = pick("answer");
    const withCode = `${base}.answer_with_code_ownership`;
    const codeChoice = options.codeOwnership ?? defaultConfirmacoes.codigoProprietario;
    if (features.confirm?.codigoProprietario && codeChoice === "answer_draft" && hasText(locale, withCode)) {
      answer = tDynamic(locale, withCode);
    }
    const item: FaqItem = { id: key, question: pick("question"), answer, source: "bank" };
    const suffixKey = `${base}.answer_with_pricing_suffix`;
    if (features.hasPricing && options.pricingHref && hasText(locale, suffixKey)) {
      item.link = { href: options.pricingHref, text: tDynamic(locale, suffixKey) };
    }
    return item;
  });
}

export interface ConditionalSources {
  confirmacoes: Confirmacoes;
}

const DEFAULT_SOURCES: ConditionalSources = { confirmacoes: defaultConfirmacoes };

/**
 * Condicionais de texto fixo: flag de confirmacoes.ts → question + answer_draft.
 * discovery_duration (D44, 21/10/2026, revoga a D42): só o answer_draft, sem
 * número ("a necessidade e a duração são definidas com você no diagnóstico");
 * a duração da Descoberta não é publicada (faq._notes.discovery_duration).
 */
const DRAFT_FLAG = {
  scope_change: "escopoMudanca",
  third_party_system: "sistemaTerceiros",
  skip_discovery: "semDescoberta",
  discovery_duration: "duracaoDescoberta",
  discovery_plan_ownership: "planoDoCliente",
  data_migration: "migracaoDados",
} as const satisfies Partial<Record<FaqConditionalKey, keyof Features["confirm"]>>;

function conditionalItem(
  locale: Locale,
  key: FaqConditionalKey,
  features: ConditionalFeatures,
  sources: ConditionalSources,
): FaqItem | null {
  const base = `faq.conditional.${key}`;
  const make = (questionField: string, answerField: string, vars?: Record<string, string>): FaqItem => ({
    id: key,
    question: tDynamic(locale, `${base}.${questionField}`),
    answer: tDynamic(locale, `${base}.${answerField}`, vars),
    source: "conditional",
  });
  const { confirm } = features;
  const c = sources.confirmacoes;

  switch (key) {
    case "code_ownership": {
      // O dono aprova UM dos dois rascunhos; só ele é publicado.
      const choice = c.codigoProprietario;
      return confirm.codigoProprietario && choice ? make("question", choice) : null;
    }
    case "invoice":
      if (!confirm.notaFiscal) return null;
      return features.hasCompanyData
        ? make("question_with_company_data", "answer_with_company_data")
        : make("question", "answer_draft");
    case "other_cities":
      // D31: com atendeExterior, UMA pergunta com a variante "…ou de fora do
      // Brasil?" (nunca duas perguntas). atendeExterior exige outrasCidades.
      if (!confirm.outrasCidades) return null;
      return confirm.atendeExterior ? make("question_with_abroad", "answer_with_abroad") : make("question", "answer_draft");
    case "diagnosis_format": {
      const format = c.formatoDiagnostico;
      if (!confirm.formatoDiagnostico || !format) return null;
      return make("question", "answer_with_format", {
        formato_diagnostico: format.formato[locale],
        participantes_diagnostico: format.participantes[locale],
      });
    }
    case "nda": {
      // O e-mail vem de empresa.ts (nunca escrito no copy); sem WhatsApp no
      // ambiente, a variante cita só o e-mail (nenhum canal fora da tela).
      if (!confirm.nda) return null;
      const field = features.hasWhatsapp === false ? "answer_draft_no_whatsapp" : "answer_draft";
      return make("question", field, { email: empresa.email });
    }
    case "payment_terms": {
      const terms = c.pagamento?.[locale]?.trim();
      return confirm.pagamento && terms ? make("question", "answer_with_terms", { condicoes_pagamento: terms }) : null;
    }
    default: {
      const flag = DRAFT_FLAG[key as keyof typeof DRAFT_FLAG];
      return flag && confirm[flag] ? make("question", "answer_draft") : null;
    }
  }
}

/**
 * Condicionais (faq.conditional) na ordem pedida: só as liberadas pelas
 * flags do dono, cada uma na variante certa. Sem flag, a pergunta não existe
 * (nem no HTML, nem no JSON-LD).
 */
export function conditionalItems(
  locale: Locale,
  keys: readonly FaqConditionalKey[],
  features: ConditionalFeatures,
  sources: ConditionalSources = DEFAULT_SOURCES,
): FaqItem[] {
  return keys
    .map((key) => conditionalItem(locale, key, features, sources))
    .filter((item): item is FaqItem => item !== null);
}

export interface CapOptions {
  max?: number;
  /**
   * Ordem de remoção declarada pela página (faq_composition), por id. Sem ela:
   * saem os itens do banco, do último para o primeiro; depois os da página;
   * as condicionais ficam (faq._notes.faq_ceiling).
   */
  removalOrder?: readonly string[];
}

/** Aplica o teto de perguntas visíveis. */
export function capFaq(items: readonly FaqItem[], { max = FAQ_MAX, removalOrder }: CapOptions = {}): FaqItem[] {
  const list = [...items];
  if (list.length <= max) return list;
  const order =
    removalOrder ??
    [
      ...list.filter((item) => item.source === "bank").reverse(),
      ...list.filter((item) => item.source === "page").reverse(),
    ].map((item) => item.id);
  for (const id of order) {
    if (list.length <= max) break;
    const index = list.findIndex((item) => item.id === id);
    if (index >= 0) list.splice(index, 1);
  }
  return list;
}

export interface ComposeOptions extends BankOptions, CapOptions {
  features: BankFeatures & ConditionalFeatures;
  /** Perguntas do banco, na ordem da página. */
  bank?: readonly FaqBankKey[];
  /** Condicionais, na ordem da página (entram depois do banco). */
  conditional?: readonly FaqConditionalKey[];
  /** Perguntas próprias da página, já resolvidas (entram antes do banco). */
  page?: readonly FaqItem[];
  sources?: ConditionalSources;
}

/** Página própria + banco + condicionais, com variantes e teto aplicados. */
export function composeFaq(locale: Locale, options: ComposeOptions): FaqItem[] {
  const { features, bank = [], conditional = [], page = [], sources, max, removalOrder } = options;
  const codeOwnership = options.codeOwnership ?? sources?.confirmacoes.codigoProprietario;
  const items = [
    ...page.map((item) => ({ ...item, source: item.source ?? ("page" as const) })),
    ...bankItems(locale, bank, features, { ...options, codeOwnership }),
    ...conditionalItems(locale, conditional, features, sources),
  ];
  return capFaq(items, { max, removalOrder });
}

/** Divide a resposta em antes/trecho/depois do link interno (null = sem link). */
export function splitInlineLink(item: FaqItem): { before: string; phrase: string; after: string } | null {
  const link = item.inlineLink;
  if (!link?.phrase || !link.href) return null;
  const at = item.answer.indexOf(link.phrase);
  if (at < 0) return null;
  return {
    before: item.answer.slice(0, at),
    phrase: link.phrase,
    after: item.answer.slice(at + link.phrase.length),
  };
}

/** Texto da resposta como vai ao JSON-LD (inclui o texto do link, se houver). */
export function answerText(item: FaqItem): string {
  return item.link ? `${item.answer} ${item.link.text}` : item.answer;
}

/** Título padrão quando a página não tem o seu. */
export function defaultFaqTitle(locale: Locale): string {
  return t(locale, "home.faq.title");
}
