/**
 * ============================================================================
 *  descoberta.ts — FORMATO DA SPRINT DE DESCOBERTA (BLUEPRINT §4 e §6.3).
 *  O DADO MORA EM dados/dono.json › descoberta. VAZIO POR PADRÃO.
 * ============================================================================
 *
 * PARA O DONO — o que preencher em dados/dono.json (cada campo POR IDIOMA, 1–2 frases, até 300 caracteres)
 *   formato        como a Descoberta é organizada (ex.: encontros remotos e uma
 *                  apresentação do plano no fim).
 *   participantes  quem participa, do seu lado e do lado do cliente (só papéis).
 *   ritmo          a cadência dos encontros.
 *   duracao        quanto tempo ela leva.
 *   naoInclui      O QUE A DESCOBERTA NÃO INCLUI (opcional): 1 a 5 itens curtos POR
 *                  IDIOMA, até 120 caracteres cada (ex.: o desenvolvimento em si, a
 *                  hospedagem). null = o bloco não aparece.
 *
 * O QUE LIBERA (features.hasDiscoveryFormat — exige OS 4 campos nos 3 idiomas)
 *   - Seção "Como a Descoberta acontece" em /sprint-de-descoberta.
 *   - A resposta do FAQ "Quanto dura?" que usa a duração.
 *   Faltou 1 campo ou 1 idioma = dado parcial: a seção inteira some (título e
 *   âncora incluídos). Não existe "em breve".
 *   features.hasDiscoveryExclusions (naoInclui com ≥ 1 item nos 3 idiomas):
 *   - Bloco "O que a Descoberta não inclui" em /sprint-de-descoberta, logo
 *     depois de "O que você recebe", com o mesmo destaque (B354). Lista vazia
 *     ou faltando num idioma = o bloco some inteiro.
 *
 * O QUE QUEBRA O BUILD: texto com {placeholder}/[CONFIRMAR]/TODO, valor em
 *   dinheiro (o valor da Descoberta, se publicado, vai em precos) ou acima do limite.
 */

import { descoberta as descobertaJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";
import type { Localized } from "./types";

export interface Descoberta {
  formato: Localized | null;
  participantes: Localized | null;
  ritmo: Localized | null;
  duracao: Localized | null;
  /** O que a Descoberta NÃO inclui (1 a 5 itens por idioma). Opcional: ausente = null. */
  naoInclui?: Localized<string[]> | null;
}

/** Ordem de exibição e rótulo (discovery_sprint.how_it_happens.fields.<rótulo>). */
export const DISCOVERY_FIELDS = [
  ["formato", "format"],
  ["participantes", "participants"],
  ["ritmo", "rhythm"],
  ["duracao", "duration"],
] as const satisfies readonly (readonly [keyof Descoberta, string])[];

/** Como está em dados/dono.json (sem a camada fictícia). */
export const descobertaReal: Descoberta = descobertaJson as unknown as Descoberta;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const descoberta: Descoberta = comCamadaFicticia("descoberta", descobertaReal);
