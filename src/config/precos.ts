/**
 * ============================================================================
 *  precos.ts — FAIXAS DE INVESTIMENTO (BLUEPRINT §4 e §5.4).
 *  O DADO MORA EM dados/dono.json › precos. VAZIO POR PADRÃO (decisão do dono:
 *  nenhum valor publicado; as seções de investimento só aparecem quando ele preencher).
 * ============================================================================
 *
 * PARA O DONO — o que preencher (em dados/dono.json, não aqui)
 *   Uma linha por item, cada uma com:
 *     faixa    texto da faixa, POR IDIOMA, já com a moeda que você escolher
 *              (exemplos no docs/playbooks/00-DADOS-DO-DONO.md).
 *     unidade  "projeto" (Descoberta e desenvolvimento) ou "mes" (sustentação).
 *     fatores  "o que move o valor": de 1 a 3 itens curtos POR IDIOMA.
 *   Itens: descoberta · desenvolvimento.{sistemas, aplicativos, integracoes, mvp} · sustentacao.
 *   Deixe `null` o item que não quer publicar.
 *
 * O QUE LIBERA (features.hasPricing + features.pricingLines)
 *   - Seção "Investimento" na Home, Como trabalhamos, Sprint de Descoberta,
 *     serviços, hub de serviços e no topo de Quanto custa (cada página mostra só
 *     as linhas dela).
 *   - Variantes "com faixas" do FAQ "Quanto custa?" e do resumo do wizard.
 *   Linha incompleta (faltou um idioma, faixa vazia, nenhum fator) NÃO aparece,
 *   e a seção inteira some (título e âncora incluídos) se nenhuma linha estiver completa.
 *
 * O QUE QUEBRA O BUILD (src/config/validate.ts)
 *   unidade errada (sustentação tem de ser "mes"; o resto, "projeto"), mais de 3
 *   fatores, texto com {placeholder}/[CONFIRMAR]/TODO.
 *
 * REGRA: dados/dono.json › precos e › qualificacao são os ÚNICOS lugares do
 * site onde um valor em dinheiro pode existir (teste tests/unit/no-money.test.ts).
 * Nenhum arquivo de src/ tem valor, nem em comentário.
 */

import { precos as precosJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";
import type { Localized } from "./types";

export type PriceUnit = "projeto" | "mes";

export interface PriceLine {
  /** Faixa em texto, por idioma, já com a moeda escolhida pelo dono. */
  faixa: Localized;
  /** "projeto" → shared.investment.unit_project; "mes" → shared.investment.unit_month. */
  unidade: PriceUnit;
  /** "O que move o valor": de 1 a 3 itens por idioma. */
  fatores: Localized<string[]>;
}

export interface Precos {
  descoberta: PriceLine | null;
  desenvolvimento: {
    sistemas: PriceLine | null;
    aplicativos: PriceLine | null;
    integracoes: PriceLine | null;
    mvp: PriceLine | null;
  };
  /** Mensal (unidade "mes"). */
  sustentacao: PriceLine | null;
}

export const PRICE_LINE_IDS = [
  "descoberta",
  "desenvolvimento.sistemas",
  "desenvolvimento.aplicativos",
  "desenvolvimento.integracoes",
  "desenvolvimento.mvp",
  "sustentacao",
] as const;
export type PriceLineId = (typeof PRICE_LINE_IDS)[number];

/** Rótulo de cada linha: shared.investment.row_labels.<valor>. */
export const PRICE_LINE_LABEL: Record<PriceLineId, "discovery" | "development_web_systems" | "development_mobile_apps" | "development_integrations" | "development_mvp" | "support"> = {
  descoberta: "discovery",
  "desenvolvimento.sistemas": "development_web_systems",
  "desenvolvimento.aplicativos": "development_mobile_apps",
  "desenvolvimento.integracoes": "development_integrations",
  "desenvolvimento.mvp": "development_mvp",
  sustentacao: "support",
};

/** Unidade obrigatória de cada linha (validada no build). */
export const PRICE_LINE_UNIT: Record<PriceLineId, PriceUnit> = {
  descoberta: "projeto",
  "desenvolvimento.sistemas": "projeto",
  "desenvolvimento.aplicativos": "projeto",
  "desenvolvimento.integracoes": "projeto",
  "desenvolvimento.mvp": "projeto",
  sustentacao: "mes",
};

/** Linha de desenvolvimento (ou sustentação) de cada página de serviço (§6.5 `investment`). */
export const SERVICE_PRICE_LINE = {
  web_systems: "desenvolvimento.sistemas",
  mobile_apps: "desenvolvimento.aplicativos",
  integrations: "desenvolvimento.integracoes",
  mvp: "desenvolvimento.mvp",
  support: "sustentacao",
} as const satisfies Record<"web_systems" | "mobile_apps" | "integrations" | "mvp" | "support", PriceLineId>;

export function getPriceLine(source: Precos, id: PriceLineId): PriceLine | null {
  switch (id) {
    case "descoberta":
      return source.descoberta;
    case "sustentacao":
      return source.sustentacao;
    case "desenvolvimento.sistemas":
      return source.desenvolvimento.sistemas;
    case "desenvolvimento.aplicativos":
      return source.desenvolvimento.aplicativos;
    case "desenvolvimento.integracoes":
      return source.desenvolvimento.integracoes;
    case "desenvolvimento.mvp":
      return source.desenvolvimento.mvp;
  }
}

/** Como está em dados/dono.json (sem a camada fictícia). */
export const precosReais: Precos = precosJson as unknown as Precos;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const precos: Precos = comCamadaFicticia("precos", precosReais);
