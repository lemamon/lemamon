/**
 * Abandono do wizard — eventos wizard_abandon e wizard_return (backlog B051).
 * Dono: conversion.
 *
 * wizard_abandon sai quando a pessoa deixa a página (pagehide, ou a aba fica
 * oculta no mobile, onde o pagehide nem sempre chega) com o wizard começado e
 * não enviado, com transport beacon. Só a tela, o id da pergunta, o tempo
 * nesta visita e o gatilho (trigger: "pagehide" | "hidden"): NUNCA valor de
 * resposta (i18n quote._notes.privacy).
 *
 * Aba oculta não é saída definitiva: no celular, trocar de app na tela de
 * contato para buscar e-mail ou telefone é comum. Por isso, quando o evento
 * veio de "hidden" e a página volta a ficar visível, a vigilância se rearma e
 * sai wizard_return {last_step} (a mesma tela, sem resposta). Quem volta e
 * envia fica com abandono + retorno + lead_submitted; quem volta e sai de
 * verdade numa tela posterior gera um 2º wizard_abandon com essa tela. O
 * pagehide continua definitivo, a não ser que o navegador devolva a MESMA
 * página do bfcache (pageshow com persisted: botão Voltar depois de abrir um
 * case, por exemplo): aí também sai wizard_return e a vigilância se rearma.
 * Na exploração do GA4, "Abandono do wizard" exclui as sessões com
 * lead_submitted (playbook 06 §6).
 *
 * Não conta como abandono: envio confirmado (inclusive robô descartado), a
 * navegação para o pós-envio e a ida para o WhatsApp (handoff: a pessoa trocou
 * de canal, não desistiu). Voltando do WhatsApp para a aba, a vigilância volta.
 */

import { track, type EventParams } from "../../lib/analytics";

export type AbandonView = number | "resumo" | "contato" | "intro";

export type AbandonTrigger = EventParams["wizard_abandon"]["trigger"];

export interface AbandonState {
  /** Tela atual; "intro" = entrada (fora do modo foco), não é abandono do wizard. */
  view: AbandonView;
  /** Id da pergunta da tela (só nas perguntas). */
  questionId?: string;
  /** A pessoa já começou (Começar, retomada ou ?etapa= na URL). */
  started: boolean;
  /** Date.now() do início NESTA visita (a retomada de um rascunho não soma os dias parados). */
  visitStartedAt?: number;
  /** Envio confirmado ou navegação para o pós-envio. */
  done: boolean;
}

/** Parâmetros do evento, ou null quando a saída não é abandono. Pura. */
export function abandonParams(
  state: AbandonState,
  now: number,
  trigger: AbandonTrigger = "pagehide",
): EventParams["wizard_abandon"] | null {
  if (!state.started || state.done || state.view === "intro") return null;
  const params: EventParams["wizard_abandon"] = {
    last_step: state.view,
    time_in_wizard_ms: typeof state.visitStartedAt === "number" ? Math.max(0, now - state.visitStartedAt) : 0,
    trigger,
  };
  if (typeof state.view === "number" && state.questionId) params.question_id = state.questionId;
  return params;
}

export interface AbandonWatcher {
  /** Remove os listeners. */
  stop: () => void;
  /** A pessoa foi para o WhatsApp: a próxima saída não é abandono (até ela voltar à aba). */
  markHandoff: () => void;
}

export interface WatchOptions {
  target?: Pick<Window, "addEventListener" | "removeEventListener">;
  doc?: Pick<Document, "addEventListener" | "removeEventListener" | "visibilityState">;
  now?: () => number;
  send?: (params: EventParams["wizard_abandon"]) => void;
  sendReturn?: (params: EventParams["wizard_return"]) => void;
}

export function watchAbandon(getState: () => AbandonState, options: WatchOptions = {}): AbandonWatcher {
  const target = options.target ?? window;
  const doc = options.doc ?? document;
  const now = options.now ?? Date.now;
  const send = options.send ?? ((params) => track("wizard_abandon", params, { beacon: true }));
  const sendReturn = options.sendReturn ?? ((params) => track("wizard_return", params));
  /** O abandono já enviado nesta página (null = vigiando). */
  let sent: EventParams["wizard_abandon"] | null = null;
  let handoff = false;

  const fire = (trigger: AbandonTrigger) => {
    if (sent || handoff) return;
    const params = abandonParams(getState(), now(), trigger);
    if (!params) return;
    sent = params;
    send(params);
  };
  /** A pessoa voltou à mesma página depois de um abandono enviado: retorno e nova vigilância. */
  const rearm = () => {
    if (!sent) return;
    const { last_step } = sent;
    sent = null;
    sendReturn({ last_step });
  };

  const onPageHide = () => fire("pagehide");
  const onPageShow = (event: Event) => {
    if ((event as PageTransitionEvent).persisted === true) rearm();
  };
  const onVisibility = () => {
    if (doc.visibilityState === "hidden") {
      fire("hidden");
      return;
    }
    handoff = false;
    // Só a aba oculta se desfaz ao voltar; o pagehide é definitivo (exceto bfcache, acima).
    if (sent?.trigger === "hidden") rearm();
  };

  target.addEventListener("pagehide", onPageHide);
  target.addEventListener("pageshow", onPageShow);
  doc.addEventListener("visibilitychange", onVisibility);
  return {
    stop: () => {
      target.removeEventListener("pagehide", onPageHide);
      target.removeEventListener("pageshow", onPageShow);
      doc.removeEventListener("visibilitychange", onVisibility);
    },
    markHandoff: () => {
      handoff = true;
    },
  };
}
