/**
 * Script do /orcamento/enviado (BLUEPRINT §7.8) — dono: conversion.
 * Vanilla, sem i18n: os textos já estão no HTML (data-*). Lê o resumo do envio
 * no sessionStorage (lib/draft.ts) e personaliza a página; sem storage, a
 * versão genérica estática continua valendo.
 *
 * Medição: lead_success_view {event_id} quando a página abre depois de um
 * envio real (backlog B341), uma vez por pedido. O page_view desta URL segue
 * sendo a conversão por URL (§10.2); o evento acrescenta o event_id que liga a
 * visualização ao lead_attempt/lead_submitted do mesmo pedido.
 *
 * Achado F10 da auditoria de conversão: o 2º passo confirma o contato do canal
 * escolhido (SentSummary.channelContact, em negrito), "Algum dado errado?"
 * abre o WhatsApp com o código do pedido, o apoio do "Mandar oi" aparece e o
 * "Dúvidas? WhatsApp" do topo também passa a levar o código.
 */

import { flushPendingEvents, track } from "@/lib/analytics";
import { readSentSummary, SENT_VIEWED_KEY_PREFIX, type SentSummary } from "@/lib/draft";
import { fillTemplate, whatsappHref } from "@/lib/whatsapp";

const DECIDER_ROLES = new Set(["recommend_to_decider", "researching", "not_defined"]);
/**
 * Quem decide junto com outros: o "Resumo do seu pedido" já abre, porque o
 * "Copiar resumo" (para repassar a quem participa da decisão) fica lá dentro.
 */
export const SHARE_SUMMARY_ROLES: ReadonlySet<string> = new Set(["decide_with_partners", "recommend_to_decider"]);

function setText(element: Element | null, text: string): void {
  if (element) element.textContent = text;
}

/** Texto de "Copiar resumo": cabeçalho, respostas (mesma montagem do WhatsApp) e rodapé. */
export function summaryCopyText(summary: Pick<SentSummary, "protocol" | "lines">, header: string, line: string, footer: string): string {
  const lines = summary.lines.map((item) => fillTemplate(line, { rotulo: item.label, resposta: item.value }));
  return [fillTemplate(header, { protocolo: summary.protocol }), lines.join("\n"), footer].filter(Boolean).join("\n\n");
}

/**
 * "A gente fala com você pelo WhatsApp {contato}…": troca o texto do passo pelo
 * do canal, com o contato em negrito. Sem o contato (resumo antigo) e com
 * {contato} no texto, fica o texto genérico. Devolve true quando o contato
 * apareceu.
 */
function showChannelContact(root: Document, element: HTMLElement, template: string, value: string): boolean {
  const marker = "{contato}";
  if (!template.includes(marker)) {
    setText(element, template);
    return false;
  }
  if (!value) return false;
  const [before = "", after = ""] = template.split(marker);
  const strong = root.createElement("strong");
  strong.textContent = value;
  element.replaceChildren(before, strong, after);
  return true;
}

export function personalize(root: Document, summary: SentSummary): void {
  // H1 "Pedido recebido, {nome}." (só o primeiro nome).
  const title = root.querySelector<HTMLElement>("[data-sent-title]");
  if (title?.dataset.template && summary.firstName) {
    setText(title, fillTemplate(title.dataset.template, { nome: summary.firstName }));
  }

  // Código do pedido.
  const protocol = root.querySelector<HTMLElement>("[data-sent-protocol]");
  if (protocol) {
    setText(protocol.querySelector("[data-sent-protocol-value]"), summary.protocol);
    protocol.hidden = false;
  }

  // 2º passo pelo canal escolhido, com o contato deixado (F10).
  const contact = root.querySelector<HTMLElement>("[data-sent-contact]");
  const byChannel = contact?.dataset[summary.channel];
  const confirmed = contact && byChannel ? showChannelContact(root, contact, byChannel, summary.channelContact) : false;

  // "Algum dado errado?" (F10): só quando o contato aparece no passo.
  const fix = root.querySelector<HTMLElement>("[data-sent-fix]");
  if (fix && confirmed) {
    const fixLink = fix.querySelector<HTMLAnchorElement>("[data-sent-fix-whatsapp]");
    if (fixLink?.dataset.template) {
      // O espaço final deixa o cursor pronto para a pessoa escrever o contato certo.
      const href = whatsappHref(`${fillTemplate(fixLink.dataset.template, { protocolo: summary.protocol })} `);
      if (href) fixLink.href = href;
    }
    fix.hidden = false;
  }

  // WhatsApp com o código do pedido (botão "Mandar oi" e o "Dúvidas? WhatsApp" do topo).
  const whatsapp = root.querySelector<HTMLAnchorElement>("[data-sent-whatsapp]");
  if (whatsapp?.dataset.template) {
    const href = whatsappHref(fillTemplate(whatsapp.dataset.template, { protocolo: summary.protocol }));
    if (href) {
      whatsapp.href = href;
      const support = root.querySelector<HTMLElement>("[data-sent-whatsapp-support]");
      if (support) support.hidden = false;
      const help = root.querySelector<HTMLAnchorElement>("a[data-wizard-help]");
      if (help) help.href = href;
    }
  }

  // E-mail com o código (sem WhatsApp e sem agenda).
  const emailGeneric = root.querySelector<HTMLElement>('[data-sent-email="generic"]');
  const emailWithCode = root.querySelector<HTMLElement>('[data-sent-email="with-code"]');
  if (emailGeneric && emailWithCode) {
    emailWithCode.hidden = false;
    emailGeneric.hidden = true;
  }

  // "Para aproveitar os 45 minutos".
  const decider = root.querySelector<HTMLElement>("[data-sent-decider]");
  if (decider && DECIDER_ROLES.has(summary.role)) decider.dataset.highlight = "true";
  const deadline = root.querySelector<HTMLElement>("[data-sent-deadline]");
  if (deadline && summary.deadlineUrgent) deadline.hidden = false;

  // Resumo do pedido.
  const section = root.querySelector<HTMLElement>("[data-sent-summary]");
  if (section) {
    setText(section.querySelector("[data-sent-summary-protocol]"), summary.protocol);
    const list = section.querySelector("[data-sent-summary-lines]");
    if (list) {
      list.replaceChildren(
        ...summary.lines.flatMap((item) => {
          const dt = root.createElement("dt");
          dt.textContent = item.label;
          const dd = root.createElement("dd");
          dd.textContent = item.value;
          return [dt, dd];
        }),
      );
    }
    const contacts = section.querySelector("[data-sent-summary-contacts]");
    if (contacts) {
      contacts.replaceChildren(
        ...summary.contacts.map((value) => {
          const li = root.createElement("li");
          li.textContent = value;
          return li;
        }),
      );
    }
    const details = section.querySelector<HTMLDetailsElement>("[data-sent-summary-details]");
    if (details && SHARE_SUMMARY_ROLES.has(summary.role)) details.open = true;
    section.hidden = false;
  }

  // Até 2 cases do serviço marcado na P2 (when_data).
  const cases = root.querySelector<HTMLElement>("[data-sent-cases]");
  if (cases) {
    const matches = [...cases.querySelectorAll<HTMLElement>("[data-case-services]")]
      .filter((item) => (item.dataset.caseServices ?? "").split(" ").some((service) => summary.services.includes(service)))
      .slice(0, 2);
    matches.forEach((item) => {
      item.hidden = false;
    });
    const casesTitle = cases.querySelector<HTMLElement>("[data-sent-cases-title]");
    const label = matches.length === 1 ? casesTitle?.dataset.one : casesTitle?.dataset.many;
    if (casesTitle && label) setText(casesTitle, label);
    cases.hidden = matches.length === 0;
  }
}

/**
 * Clique (ou clique do meio, nova aba) num card de case do "Enquanto isso":
 * cta_click com a origem do resultado do wizard (backlog B379).
 */
export function bindCaseClicks(root: Document): void {
  const cases = root.querySelector<HTMLElement>("[data-sent-cases]");
  if (!cases) return;
  const onClick = (event: MouseEvent) => {
    if (event.type === "auxclick" && event.button !== 1) return;
    if (!(event.target as Element | null)?.closest?.("a[href]")) return;
    track("cta_click", { cta_id: "case", origem: "enviado-cases" });
  };
  cases.addEventListener("click", onClick);
  cases.addEventListener("auxclick", onClick);
}

function bindEvents(root: Document, summary: SentSummary | null): void {
  root.querySelector("[data-sent-schedule]")?.addEventListener("click", () => track("schedule_click", {}));
  bindCaseClicks(root);

  const copyButton = root.querySelector<HTMLButtonElement>("[data-sent-copy]");
  if (copyButton && summary) {
    copyButton.addEventListener("click", async () => {
      const { header = "", line = "", footer = "", copied = "" } = copyButton.dataset;
      try {
        await navigator.clipboard.writeText(summaryCopyText(summary, header, line, footer));
        setText(root.querySelector("[data-sent-copy-status]"), copied);
        track("summary_copy", {});
      } catch {
        // Sem permissão de clipboard: o resumo continua visível e selecionável.
      }
    });
  }
}

function sessionStore(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

/**
 * lead_success_view {event_id = código do pedido} (backlog B341). Só com o
 * resumo de um envio real (measured): sem resumo (versão genérica, aba nova),
 * robô descartado ou envio de teste do preview, nada sai. Uma vez por pedido:
 * a marca no sessionStorage segura o reload e o voltar/avançar. Sem storage,
 * não mede (melhor perder um evento que contar o mesmo pedido duas vezes).
 * Devolve true quando o evento saiu.
 */
export function trackSuccessView(summary: SentSummary | null, storage: Storage | null = sessionStore()): boolean {
  if (!summary?.measured || !summary.protocol || !storage) return false;
  const key = `${SENT_VIEWED_KEY_PREFIX}${summary.protocol}`;
  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, "1");
  } catch {
    return false;
  }
  track("lead_success_view", { event_id: summary.protocol });
  return true;
}

export function initSentPage(root: Document = document): void {
  // Falha do wizard guardada offline antes do envio que deu certo (B340).
  void flushPendingEvents();
  const summary = readSentSummary();
  if (summary) personalize(root, summary);
  trackSuccessView(summary);
  bindEvents(root, summary);
  // O foco vai para o H1 ao carregar (§7.8), para o leitor de tela anunciar a confirmação.
  root.querySelector<HTMLElement>("[data-sent-title]")?.focus({ preventScroll: true });
}
