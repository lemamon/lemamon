/**
 * ============================================================================
 *  confirmacoes.ts — CONFIRMAÇÕES DO DONO (BLUEPRINT §4 e §14).
 *  O DADO MORA EM dados/dono.json › confirmacoes.
 *  Decidido pelo dono: escopoMudanca = true (FAQ "E se eu mudar o escopo?").
 * ============================================================================
 *
 * PARA O DONO — o que preencher (em dados/dono.json, não aqui)
 *   Cada item é uma promessa que o site só faz depois que você confirmar que ela
 *   vale para TODO cliente. Marque `true` (ou escreva o texto aprovado) só quando
 *   for verdade. A flag correspondente fica em features.confirm.<item>.
 *
 *   Sim/não (boolean):
 *     escopoMudanca           FAQ "E se eu mudar o escopo no meio?" (prioridade nº 1, §14)
 *     notaFiscal              FAQ "Vocês emitem nota fiscal?"
 *     outrasCidades           FAQ "Atendem fora de São Paulo?" (afeta en/es)
 *     nda                     FAQ "Vocês assinam NDA?" (+ texto do card de e-mail em /contato)
 *     sistemaTerceiros        FAQ "Cuidam de sistema feito por outra empresa?"
 *     semDescoberta           FAQ "Dá para pular a Descoberta?"
 *     duracaoDescoberta       FAQ "Quanto dura a Descoberta?"
 *     planoDoCliente          FAQ "O plano da Descoberta é meu se eu não seguir?"
 *     descobertaAbatida       FAQ "O valor da Descoberta é abatido?" (só abatimento integral)
 *     descobertaUnicoCusto    frase "é o único valor que você assume"
 *     migracaoDados           FAQ "Vocês migram os dados da planilha/sistema atual?"
 *     ligacao                 opção "Ligação" no canal de contato do wizard
 *     valoresNoDiagnostico    variante do resumo do wizard que fala de valores no diagnóstico
 *     timeDoCliente           variantes que citam a equipe do cliente
 *     scoreDRecebeDiagnostico todo pedido fora de perfil também recebe os 45 min e a devolutiva
 *                             (trava do score D de qualificacao.ts)
 *   Escolha de rascunho:
 *     codigoProprietario      false | "answer_draft" | "answer_draft_alt" (qual resposta do FAQ
 *                             "De quem é o código?" você aprovou; só uma é publicada)
 *   Texto aprovado (POR IDIOMA; liga só com os 3 idiomas preenchidos):
 *     devolutivaConteudo      o que vem na devolutiva ({conteudo_da_devolutiva})
 *     formatoDiagnostico      { formato, participantes } dos 45 minutos (vídeo/telefone/presencial
 *                             e quem conduz, só o papel)
 *     pagamento               condições de pagamento ({condicoes_pagamento}), sem valores
 *
 * O QUE QUEBRA O BUILD: tipo errado, texto com {placeholder}/[CONFIRMAR]/TODO ou
 * com valor em dinheiro (dinheiro só em dados/dono.json › precos e qualificacao).
 */

import { confirmacoes as confirmacoesJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";
import type { Localized } from "./types";

export interface Confirmacoes {
  /** faq.conditional.scope_change + régua de /quanto-custa. */
  escopoMudanca: boolean;
  /** faq.conditional.code_ownership: qual rascunho o dono aprovou (só um é publicado). */
  codigoProprietario: false | "answer_draft" | "answer_draft_alt";
  /** faq.conditional.invoice. */
  notaFiscal: boolean;
  /** faq.conditional.other_cities. */
  outrasCidades: boolean;
  /** faq.conditional.nda. */
  nda: boolean;
  /** faq.conditional.third_party_system. */
  sistemaTerceiros: boolean;
  /** faq.conditional.skip_discovery. */
  semDescoberta: boolean;
  /** faq.conditional.discovery_duration (answer_draft). */
  duracaoDescoberta: boolean;
  /** faq.conditional.discovery_plan_ownership. */
  planoDoCliente: boolean;
  /** faq.conditional.discovery_credit + sufixos de custo (só abatimento integral). */
  descobertaAbatida: boolean;
  /** "É o único valor que você assume" (faq._notes.single_value). */
  descobertaUnicoCusto: boolean;
  /** faq.conditional.data_migration. */
  migracaoDados: boolean;
  /** Opção "Ligação" no canal de contato do wizard. */
  ligacao: boolean;
  /** quote.summary.price_empty_live_2_with_values. */
  valoresNoDiagnostico: boolean;
  /** Variantes que citam a equipe do cliente (ver i18n). */
  timeDoCliente: boolean;
  /** Trava do score D: todo pedido fora de perfil também recebe os 45 minutos e a devolutiva. */
  scoreDRecebeDiagnostico: boolean;
  /** {conteudo_da_devolutiva} em shared.terms.written_feedback_with_content. */
  devolutivaConteudo: Localized | null;
  /** {formato_diagnostico} e {participantes_diagnostico}. */
  formatoDiagnostico: { formato: Localized; participantes: Localized } | null;
  /** {condicoes_pagamento} em faq.conditional.payment_terms. */
  pagamento: Localized | null;
}

/** Como está em dados/dono.json (sem a camada fictícia). */
export const confirmacoesReais: Confirmacoes = confirmacoesJson as unknown as Confirmacoes;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const confirmacoes: Confirmacoes = comCamadaFicticia("confirmacoes", confirmacoesReais);
