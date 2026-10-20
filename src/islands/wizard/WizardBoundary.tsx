/**
 * Error boundary da ilha do wizard (backlog B234). Dono: conversion.
 *
 * Se o render do wizard falhar, a pessoa não pode cair numa página em branco
 * (o modo foco esconde a casca estática) nem num "Começar" morto. O fallback:
 *  - tira o modo foco (a casca com o H1, o FAQ e o "depois de enviar" volta);
 *  - mostra acolhimento, WhatsApp (sem texto livre na mensagem), o e-mail com
 *    "Copiar", "Começar de novo" (apaga o rascunho e recarrega sem ?etapa=) e
 *    "Voltar ao início";
 *  - registra a falha: wizard_render_error no GA4 e no New Relic (PageAction +
 *    noticeError), só com a tela em que falhou, nunca dado da pessoa.
 * Enquanto o fallback está na tela, os botões "Começar" da casca fazem o mesmo
 * que "Começar de novo".
 *
 * Os textos chegam prontos por props (a ilha não importa o i18n).
 */
import { Component, createRef, type ErrorInfo, type ReactNode } from "react";

import { reportError, track } from "../../lib/analytics";
import { clearDraft } from "../../lib/draft";
import { hasWhatsapp, whatsappHref } from "../../lib/whatsapp";
import styles from "./Wizard.module.css";

export interface RenderErrorCopy {
  /** quote.render_error.title ("" enquanto a chave não existir). */
  title: string;
  /** quote.render_error.text ("" enquanto a chave não existir). */
  text: string;
  /** quote.entry.resume_banner.restart ("Começar de novo"). */
  restart: string;
  /** shared.cta.back_home. */
  home: string;
  /** shared.cta.whatsapp. */
  whatsapp: string;
  /** quote.whatsapp_messages.wizard_question (sem texto livre: pode ir no href). */
  whatsappMessage: string;
  copy: string;
  copied: string;
  /** shared.clipboard.copy_email_aria, já com o e-mail. */
  copyEmailAria: string;
  opensNewTab: string;
}

interface Props {
  children: ReactNode;
  copy: RenderErrorCopy;
  email: string;
  homeUrl: string;
  /** features.hasWhatsapp (o número ainda é conferido no cliente). */
  whatsappEnabled: boolean;
}

interface State {
  failed: boolean;
  copied: boolean;
}

/** URL atual sem ?etapa= (recarregar volta para a entrada). */
function entryUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("etapa");
  return `${url.pathname}${url.search}`;
}

export class WizardBoundary extends Component<Props, State> {
  override state: State = { failed: false, copied: false };

  private panelRef = createRef<HTMLDivElement>();

  private startListener: ((event: MouseEvent) => void) | null = null;

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    let view = "intro";
    try {
      view = (new URLSearchParams(window.location.search).get("etapa") ?? "intro").slice(0, 20);
    } catch {
      // sem location: fica "intro"
    }
    track("wizard_render_error", { view });
    reportError("wizard_render_error", { view, error: error?.name ?? "Error" });
  }

  /**
   * Falha já no primeiro render do cliente (o boundary monta direto no
   * fallback): sem isto, o modo foco posto pelo script do <head> (?etapa=)
   * continuava escondendo a casca.
   */
  override componentDidMount(): void {
    if (this.state.failed) this.showFallback();
  }

  override componentDidUpdate(_props: Props, previous: State): void {
    if (this.state.failed && !previous.failed) this.showFallback();
  }

  private showFallback(): void {
    if (this.startListener) return;
    // A casca estática volta (H1, FAQ, "depois de enviar") e a barra/progresso saem.
    delete document.documentElement.dataset.wizardMode;
    document.documentElement.style.removeProperty("--wizard-bar-height");
    // Sem o banner de retomada (a ilha caiu): o espaço reservado para ele some (B238).
    const resume = document.querySelector<HTMLElement>("[data-wizard-resume]");
    if (resume) resume.dataset.state = "closed";
    this.startListener = (event: MouseEvent) => {
      const trigger = (event.target as Element | null)?.closest?.("[data-wizard-start]");
      if (!trigger) return;
      event.preventDefault();
      this.restart();
    };
    document.addEventListener("click", this.startListener);
    const panel = this.panelRef.current;
    panel?.scrollIntoView({ block: "start" });
    panel?.focus({ preventScroll: true });
  }

  override componentWillUnmount(): void {
    if (this.startListener) document.removeEventListener("click", this.startListener);
  }

  private restart = (): void => {
    clearDraft();
    window.location.assign(entryUrl());
  };

  private copyEmail = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(this.props.email);
      this.setState({ copied: true });
      track("email_copy", { source: "wizard_render_error" });
    } catch {
      // Sem clipboard: o e-mail continua visível e selecionável.
    }
  };

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    const { copy, email, homeUrl, whatsappEnabled } = this.props;
    const wa = whatsappEnabled && hasWhatsapp() ? whatsappHref(copy.whatsappMessage) : null;
    return (
      <div className={styles.renderError} ref={this.panelRef} tabIndex={-1} data-nr-block="" data-wizard-render-error="">
        {copy.title && <h2 className={styles.title}>{copy.title}</h2>}
        {copy.text && <p className={styles.lead}>{copy.text}</p>}
        <div className={styles.errorActions}>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener"
              className={styles.whatsapp}
              // Dentro da ilha o listener delegado do shell não conta o clique: conta aqui.
              onClick={() => track("whatsapp_click", { source: "wizard_render_error" })}
            >
              {copy.whatsapp}
              <span className="sr-only"> {copy.opensNewTab}</span>
            </a>
          )}
          <button type="button" className={styles.secondary} onClick={this.restart}>
            {copy.restart}
          </button>
          <a href={homeUrl} className={styles.secondary}>
            {copy.home}
          </a>
        </div>
        <p className={styles.emailLine}>
          <span className={styles.email}>{email}</span>{" "}
          <button type="button" className={styles.linkButton} aria-label={copy.copyEmailAria} onClick={this.copyEmail}>
            {this.state.copied ? copy.copied : copy.copy}
          </button>
        </p>
      </div>
    );
  }
}
