/**
 * Mensagens de WhatsApp e textos copiados do wizard — BLUEPRINT §7.7 e i18n
 * quote._notes.whatsapp (dono: conversion). PURAS.
 *
 * Montagem: intro · (falha: nome e, se houver, empresa) · uma linha por
 * pergunta respondida (*rótulo:* resposta, várias unidas pelo separador) · data
 * travante, se houver · "Código do pedido" · fechamento. Pergunta pulada não
 * gera linha. A mensagem de falha NÃO leva "Mais detalhes", e-mail, canal nem
 * telefone (limite de tamanho da URL do wa.me).
 */

import { composeMessage, fillTemplate } from "../../lib/whatsapp";
import type { RulesCopy } from "./copy";
import { answeredChips, type AnswerChip } from "./rules";

type WhatsappCopy = RulesCopy["whatsapp"];

export function answerLines(chips: readonly AnswerChip[], copy: WhatsappCopy): string[] {
  return answeredChips(chips).map((chip) => fillTemplate(copy.answer_line, { rotulo: chip.label, resposta: chip.value }));
}

/** "Prefiro falar no WhatsApp" do resumo. */
export function summaryWhatsappMessage(chips: readonly AnswerChip[], copy: WhatsappCopy, protocol?: string): string {
  return composeMessage({
    intro: copy.summary_intro,
    lines: answerLines(chips, copy),
    ref: protocol ? fillTemplate(copy.ref_line_summary, { protocolo: protocol }) : undefined,
    closing: copy.summary_closing,
  });
}

export interface FailureContact {
  name: string;
  company: string;
}

function contactHead(contact: FailureContact, copy: WhatsappCopy): string[] {
  const head: string[] = [];
  if (contact.name.trim()) head.push(fillTemplate(copy.name_line, { nome: contact.name.trim() }));
  if (contact.company.trim()) head.push(fillTemplate(copy.company_line, { empresa: contact.company.trim() }));
  return head;
}

/** "Enviar pelo WhatsApp" da tela de erro (§7.6). */
export function failureWhatsappMessage(
  chips: readonly AnswerChip[],
  copy: WhatsappCopy,
  contact: FailureContact,
  protocol?: string,
): string {
  return composeMessage({
    intro: copy.failure_intro,
    head: contactHead(contact, copy),
    lines: answerLines(chips, copy),
    ref: protocol ? fillTemplate(copy.ref_line, { protocolo: protocol }) : undefined,
    closing: copy.failure_closing,
  });
}

/**
 * "Copiar minhas respostas" da tela de erro (para mandar por e-mail): a mesma
 * montagem da falha, e aqui cabe também o "Mais detalhes" (não há limite de URL).
 */
export function failureCopyText(
  chips: readonly AnswerChip[],
  copy: RulesCopy,
  contact: FailureContact & { details: string },
  protocol?: string,
): string {
  const lines = answerLines(chips, copy.whatsapp);
  if (contact.details.trim()) {
    lines.push(
      fillTemplate(copy.whatsapp.answer_line, {
        rotulo: copy.contactForm.fields.details.label,
        resposta: contact.details.trim(),
      }),
    );
  }
  return composeMessage({
    intro: copy.whatsapp.failure_intro,
    head: contactHead(contact, copy.whatsapp),
    lines,
    ref: protocol ? fillTemplate(copy.whatsapp.ref_line, { protocolo: protocol }) : undefined,
    closing: copy.whatsapp.failure_closing,
  });
}

/** Campo `summary` do briefing: texto legível para a notificação do comercial. */
export function readableSummary(chips: readonly AnswerChip[]): string {
  return answeredChips(chips)
    .map((chip) => `${chip.label}: ${chip.value}`)
    .join("\n");
}
