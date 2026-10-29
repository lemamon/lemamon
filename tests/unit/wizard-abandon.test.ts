/**
 * wizard_abandon / wizard_return (backlog B051): saída da página com o wizard
 * começado e não enviado, sem valor de resposta, com o gatilho (pagehide ou
 * aba oculta). Aba oculta que volta a ficar visível (troca de app no celular)
 * gera wizard_return e rearma a vigilância; depois do envio (ou da ida para o
 * WhatsApp), nada.
 */
import { describe, expect, it, vi } from "vitest";

import { abandonParams, watchAbandon, type AbandonState } from "@/islands/wizard/abandon";

type Listener = (event: Event) => void;

class FakeTarget {
  private listeners = new Map<string, Set<Listener>>();
  visibilityState: DocumentVisibilityState = "visible";
  addEventListener(type: string, listener: Listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)?.add(listener);
  }
  removeEventListener(type: string, listener: Listener) {
    this.listeners.get(type)?.delete(listener);
  }
  dispatch(type: string, init: Record<string, unknown> = {}) {
    const event = Object.assign(new Event(type), init);
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

function setup(state: AbandonState) {
  const win = new FakeTarget();
  const doc = new FakeTarget();
  const send = vi.fn();
  const sendReturn = vi.fn();
  const current = { ...state };
  const watcher = watchAbandon(() => current, {
    target: win as unknown as Window,
    doc: doc as unknown as Document,
    now: () => 61_000,
    send,
    sendReturn,
  });
  const hide = () => {
    doc.visibilityState = "hidden";
    doc.dispatch("visibilitychange");
  };
  const show = () => {
    doc.visibilityState = "visible";
    doc.dispatch("visibilitychange");
  };
  return { win, doc, send, sendReturn, current, watcher, hide, show };
}

const step2: AbandonState = { view: 2, questionId: "build_type", started: true, visitStartedAt: 1_000, done: false };

describe("wizard_abandon", () => {
  it("no passo 2, um pagehide gera um único evento com a última etapa, o tempo nesta visita e o gatilho", () => {
    const { win, send, sendReturn, hide } = setup(step2);
    win.dispatch("pagehide");
    hide();
    win.dispatch("pagehide");
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ last_step: 2, question_id: "build_type", time_in_wizard_ms: 60_000, trigger: "pagehide" });
    expect(sendReturn).not.toHaveBeenCalled();
  });

  it("aba oculta (mobile, sem pagehide) também conta, com trigger hidden", () => {
    const { send, hide } = setup({ ...step2, view: "contato", questionId: undefined });
    hide();
    expect(send).toHaveBeenCalledWith({ last_step: "contato", time_in_wizard_ms: 60_000, trigger: "hidden" });
  });

  it("aba oculta e o pagehide do fechamento logo depois: um evento só", () => {
    const { win, send, hide } = setup(step2);
    hide();
    win.dispatch("pagehide");
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]).toMatchObject({ trigger: "hidden" });
  });

  it("hidden → visible → envio confirmado: 1 wizard_abandon(hidden) + 1 wizard_return, nenhum abandono depois do envio", () => {
    const { win, send, sendReturn, current, hide, show } = setup({ ...step2, view: "contato", questionId: undefined });
    // Na tela de contato, a pessoa troca de app para buscar o e-mail e volta.
    hide();
    show();
    // Termina o preenchimento e envia: lead_submitted, navegação para o pós-envio.
    current.done = true;
    hide();
    win.dispatch("pagehide");
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ last_step: "contato", time_in_wizard_ms: 60_000, trigger: "hidden" });
    expect(sendReturn).toHaveBeenCalledTimes(1);
    expect(sendReturn).toHaveBeenCalledWith({ last_step: "contato" });
  });

  it("hidden na P2 → visible → avanço até a P4 → pagehide: 2º wizard_abandon com last_step 4 e trigger pagehide", () => {
    const { win, send, sendReturn, current, hide, show } = setup(step2);
    hide();
    show();
    current.view = 4;
    current.questionId = "deadline";
    win.dispatch("pagehide");
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]?.[0]).toMatchObject({ last_step: 2, trigger: "hidden" });
    expect(send.mock.calls[1]?.[0]).toEqual({ last_step: 4, question_id: "deadline", time_in_wizard_ms: 60_000, trigger: "pagehide" });
    expect(sendReturn).toHaveBeenCalledTimes(1);
    expect(sendReturn).toHaveBeenCalledWith({ last_step: 2 });
  });

  it("pagehide é definitivo: voltar a ficar visível não rearma (só a mesma página do bfcache rearma)", () => {
    const { win, send, sendReturn, hide, show } = setup(step2);
    win.dispatch("pagehide", { persisted: true });
    hide();
    show();
    expect(sendReturn).not.toHaveBeenCalled();
    // Botão Voltar devolve a mesma página (bfcache): retorno e nova vigilância.
    win.dispatch("pageshow", { persisted: true });
    expect(sendReturn).toHaveBeenCalledWith({ last_step: 2 });
    win.dispatch("pagehide");
    expect(send).toHaveBeenCalledTimes(2);
    // pageshow de um carregamento normal (persisted false) não gera retorno.
    win.dispatch("pageshow", { persisted: false });
    expect(sendReturn).toHaveBeenCalledTimes(1);
  });

  it("depois do envio (lead_submitted / navegação para o pós-envio), nada é enviado", () => {
    const { win, send, current } = setup(step2);
    current.done = true;
    win.dispatch("pagehide");
    expect(send).not.toHaveBeenCalled();
  });

  it("na entrada (sem começar ou de volta à intro), não é abandono do wizard", () => {
    expect(abandonParams({ ...step2, started: false }, 2_000)).toBeNull();
    expect(abandonParams({ ...step2, view: "intro" }, 2_000)).toBeNull();
  });

  it("ida para o WhatsApp não é abandono nem retorno; voltando à aba, a vigilância volta", () => {
    const { win, send, sendReturn, watcher, hide, show } = setup(step2);
    watcher.markHandoff();
    hide();
    expect(send).not.toHaveBeenCalled();
    show();
    expect(sendReturn).not.toHaveBeenCalled();
    win.dispatch("pagehide");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("os parâmetros nunca levam resposta: só tela, id da pergunta, tempo e gatilho", () => {
    const params = abandonParams(step2, 61_000, "hidden");
    expect(Object.keys(params ?? {}).sort()).toEqual(["last_step", "question_id", "time_in_wizard_ms", "trigger"]);
  });

  it("stop() remove os listeners", () => {
    const { win, send, sendReturn, watcher, hide, show } = setup(step2);
    watcher.stop();
    win.dispatch("pagehide");
    hide();
    show();
    win.dispatch("pageshow", { persisted: true });
    expect(send).not.toHaveBeenCalled();
    expect(sendReturn).not.toHaveBeenCalled();
  });
});
