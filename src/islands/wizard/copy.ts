/**
 * Formato dos textos que a ilha recebe por props (dono: conversion).
 *
 * Só TIPOS: `import type` some no build, então o JSON do i18n nunca entra no
 * bundle da ilha (CONTRACT §10). Quem monta o objeto é o servidor
 * (views/QuoteView.astro, com getSection), e o tipo garante que as chaves
 * existem: se o i18n mudar, o astro check acusa aqui.
 */

import type { Messages } from "../../i18n";

type Quote = Messages["quote"];
type Shared = Messages["shared"];

export interface WizardCopy {
  progress: Quote["progress"];
  nav: Quote["nav"];
  validation: Quote["validation"];
  steps: Quote["steps"];
  summary: Quote["summary"];
  contactForm: Quote["contact_form"];
  error: Quote["error"];
  whatsapp: Quote["whatsapp_messages"];
  resumeBanner: Quote["entry"]["resume_banner"];
  /** quote.entry.context_service, com {servico_frase} ainda por interpolar. */
  contextService: string;
  /** quote.entry.context_case, com {case} ainda por interpolar. */
  contextCase: string;
  /** quote.sent.protocol_label. */
  protocolLabel: string;
  /** quote.sent.summary.channel_line ("Canal preferido: {canal}"), para "Seus contatos" do pós-envio. */
  sentChannelLine: string;
  /**
   * Bloco de cases do mesmo tipo no resumo (backlog B379): título com 2+ e com
   * 1 card (quote.summary.cases_title / cases_title_one) e shared.cta.read_case,
   * a indicação visual dentro do link do card.
   */
  summaryCases: { title: string; titleOne: string; readCase: string };
  /**
   * Linha do método compacta do resumo (auditoria F02): nome e tag de cada
   * etapa (shared.method_timeline.stages) e o selo da etapa 1
   * (shared.method_timeline.next_step_badge). As 4 etapas completas continuam
   * vindo pelo slot do MethodTimeline, dentro de um <details>.
   */
  method: { stages: Shared["method_timeline"]["stages"]; nextStep: string };
  /** shared.terms: só o termo explicado no resumo, escopo priorizado (i18n quote._notes.terms; sem protótipo desde a D44). */
  terms: Pick<Shared["terms"], "prioritized_scope">;
  investment: Pick<Shared["investment"], "row_labels" | "unit_project" | "unit_month">;
  clipboard: Shared["clipboard"];
  /** shared.forms.email_suggestion: "Você quis dizer {email}?" + "Corrigir" (achado F07). */
  emailSuggestion: Shared["forms"]["email_suggestion"];
  /** shared.lgpd.privacy_link_label (texto do link {politica}). */
  privacyLinkLabel: string;
  /** Rótulos de acessibilidade próprios do wizard (quote.a11y). */
  a11y: Quote["a11y"];
  /** shared.a11y.loading. */
  loading: string;
  /** shared.a11y.opens_new_tab (links de WhatsApp abrem em aba nova). */
  opensNewTab: string;
  /**
   * quote.render_error.{title,text}: tela de falha de render (error boundary,
   * backlog B234). "" enquanto as chaves não existirem no i18n: o fallback
   * continua com os canais (WhatsApp, e-mail, recomeçar, início).
   */
  renderError: { title: string; text: string };
  /** shared.cta.back_home. */
  backHome: string;
  /** shared.cta.whatsapp. */
  whatsappCta: string;
  /**
   * Aviso do envio de teste em deploy preview (backlog B277), ou "" (sem a
   * chave, ou fora de preview). Nunca aparece em produção.
   */
  previewNotice: string;
}

/** Os textos de que as regras puras (rules.ts, messages.ts) precisam. */
export type RulesCopy = Pick<WizardCopy, "steps" | "summary" | "whatsapp" | "contactForm">;
