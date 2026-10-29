/**
 * ============================================================================
 *  sustentacao.ts — FORMATO DA SUSTENTAÇÃO (BLUEPRINT §4 e §6.5 sustentacao > format).
 *  O DADO MORA EM dados/dono.json › sustentacao. VAZIO POR PADRÃO.
 * ============================================================================
 *
 * PARA O DONO — o que preencher em dados/dono.json (cada campo POR IDIOMA, até 300 caracteres)
 *   inclui       o que a sustentação inclui (correções, atualizações, melhorias...).
 *   contratacao  como ela é contratada (ex.: contrato mensal com escopo combinado).
 *   canais       por onde o cliente pede e acompanha (ex.: WhatsApp e e-mail).
 *   urgencias    opcional: como erros urgentes são tratados. Só preencha se for
 *                uma promessa que vale para todo cliente; sem ele, o rótulo nem aparece.
 *
 * O QUE LIBERA (features.hasSupportFormat — exige inclui + contratacao + canais
 *   nos 3 idiomas)
 *   - Seção "Formato e contratação" em /servicos/sustentacao.
 *   Sem SLA, horas ou monitoramento no site enquanto você não escrever aqui.
 *   Dado parcial (faltou um campo obrigatório ou um idioma) = a seção some inteira.
 *
 * O QUE QUEBRA O BUILD: texto com {placeholder}/[CONFIRMAR]/TODO, valor em
 *   dinheiro (o valor mensal, se publicado, vai em precos) ou acima do limite.
 */

import { sustentacao as sustentacaoJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";
import type { Localized } from "./types";

export interface Sustentacao {
  inclui: Localized | null;
  contratacao: Localized | null;
  canais: Localized | null;
  urgencias: Localized | null;
}

/** Ordem de exibição e rótulo (services.support.format.fields.<rótulo>). urgencias é opcional. */
export const SUPPORT_FIELDS = [
  ["inclui", "includes"],
  ["contratacao", "how_hired"],
  ["canais", "channels"],
  ["urgencias", "urgent"],
] as const satisfies readonly (readonly [keyof Sustentacao, string])[];

/** Campos que ligam a seção (os três obrigatórios). */
export const SUPPORT_REQUIRED_FIELDS = ["inclui", "contratacao", "canais"] as const satisfies readonly (keyof Sustentacao)[];

/** Como está em dados/dono.json (sem a camada fictícia). */
export const sustentacaoReal: Sustentacao = sustentacaoJson as unknown as Sustentacao;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const sustentacao: Sustentacao = comCamadaFicticia("sustentacao", sustentacaoReal);
