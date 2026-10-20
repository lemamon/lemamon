/**
 * ============================================================================
 *  qualificacao.ts — FAIXAS DE ORÇAMENTO DO WIZARD (BLUEPRINT §7.3 P5 e §7.9).
 *  O DADO MORA EM dados/dono.json › qualificacao. SEPARADO de precos.
 *  Decidido pelo dono: moeda BRL nos 3 idiomas, as 4 faixas que estão no
 *  dono.json ("ainda não sei" é a opção fixa not_sure do i18n) e corte de MQL a
 *  partir da 2ª faixa (tier_2). Faixas mensais vazias.
 * ============================================================================
 *
 * PARA O DONO — o que preencher (em dados/dono.json, não aqui)
 *   moeda          código da moeda das faixas (ex.: "BRL"). Obrigatório com faixas.
 *   faixas         EXATAMENTE 4 (tier_1 … tier_4, da menor para a maior), cada uma
 *                  com o rótulo POR IDIOMA, já com a moeda.
 *   corteMql       a menor faixa que conta como "orçamento OK" (lead A/MQL).
 *   faixasMensais  opcional: 4 faixas mensais para quem quer só manter/evoluir um
 *                  sistema (P1 = maintain_live_system), mais o corteMqlMensal.
 *   scoreD.ativo   liga o score D (fora de perfil). Só com a confirmação
 *                  confirmacoes.scoreDRecebeDiagnostico (senão o build falha).
 *
 * O QUE LIBERA
 *   hasBudgetTiers   (moeda + 4 faixas completas nos 3 idiomas + corteMql):
 *                    a P5 do wizard pergunta pela faixa. Sem isso, a P5 usa a
 *                    versão sem números (approved, being_defined, not_considered,
 *                    prefer_to_discuss). Dado parcial = versão sem números.
 *   hasMonthlyTiers  (hasBudgetTiers + 4 faixas mensais completas + corteMqlMensal):
 *                    variante mensal da P5.
 *
 * PRIVACIDADE DO VALOR: as faixas só existem DENTRO da ilha React (bundle do
 * cliente), fora do HTML indexável. NUNCA passe as faixas por props de uma ilha
 * nem as renderize em .astro. Este arquivo não pode importar nada pesado: ele vai
 * para o bundle do cliente. Por isso ele importa SÓ a seção `qualificacao` do
 * JSON (import nomeado): o resto do dono.json não entra no bundle.
 *
 * O QUE QUEBRA O BUILD (src/config/validate.ts)
 *   número de faixas diferente de 0 ou 4, ids fora de ordem, corte que não é uma
 *   das faixas, faixas sem moeda, score D sem a confirmação do dono.
 */

import { qualificacao as qualificacaoJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";
import type { Localized } from "./types";

export type TierId = "tier_1" | "tier_2" | "tier_3" | "tier_4";

export interface BudgetTier {
  id: TierId;
  /** Rótulo da opção, por idioma, com a moeda decidida pelo dono. Não é copy de i18n. */
  rotulo: Localized;
}

export interface Qualificacao {
  /** Moeda das faixas (ex.: "BRL"). Obrigatória com faixas; o rótulo já traz o texto final. */
  moeda: string;
  /** P5, modo com faixas: exatamente 4 (tier_1…tier_4, em ordem crescente) ou nenhuma. */
  faixas: BudgetTier[];
  /** P5 quando P1 = maintain_live_system: exatamente 4 ou nenhuma. */
  faixasMensais: BudgetTier[];
  /** Menor faixa que conta como "orçamento OK" (corte de MQL). null = sem modo com faixas. */
  corteMql: TierId | null;
  /** Corte de MQL das faixas mensais. Sem ele, as faixas mensais não ligam. */
  corteMqlMensal?: TierId | null;
  /**
   * Score D (fora de perfil, §7.9). Ligar exige confirmacoes.scoreDRecebeDiagnostico:
   * sem ela o build falha (i18n shared _notes.cta_final).
   */
  scoreD: { ativo: boolean };
}

/** Como está em dados/dono.json (sem a camada fictícia). */
export const qualificacaoReal: Qualificacao = qualificacaoJson as unknown as Qualificacao;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const qualificacao: Qualificacao = comCamadaFicticia("qualificacao", qualificacaoReal);
