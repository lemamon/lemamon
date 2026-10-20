/**
 * ============================================================================
 *  agenda.ts — AGENDA ONLINE (BLUEPRINT §4, §7.8 e §8.6).
 *  O DADO MORA EM dados/dono.json › agenda. VAZIO POR PADRÃO.
 * ============================================================================
 *
 * PARA O DONO — o que preencher (em dados/dono.json, não aqui)
 *   url  o link público da sua agenda de diagnósticos (Cal.com, Calendly,
 *        Google Agenda...), começando com https://. Deixe "" se não houver.
 *
 * O QUE LIBERA (features.hasAgenda)
 *   - No pós-envio do wizard, "Quer adiantar? Escolha um horário agora" vira o
 *     CTA primário (link externo).
 *   - O passo "a gente fala com você" do "Como funciona" ganha a variante
 *     "você escolhe o horário" e o rótulo "Agendar diagnóstico gratuito" passa a
 *     valer onde a escolha de horário acontece na mesma sessão.
 *   Sem URL, nada disso aparece: "Agendar" sem agenda quebra a promessa.
 *   Ligar a agenda exige declarar a ferramenta na Política (privacidade.ferramentas.agenda).
 *
 * O QUE QUEBRA O BUILD: URL que não é https válida.
 */

import { agenda as agendaJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";

export interface Agenda {
  /** Link externo da agenda (https). Vazio = sem agenda. */
  url: string;
}

/** Como está em dados/dono.json (sem a camada fictícia). */
export const agendaReal: Agenda = agendaJson as unknown as Agenda;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const agenda: Agenda = comCamadaFicticia("agenda", agendaReal);
