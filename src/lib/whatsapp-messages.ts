/**
 * Mensagens pré-preenchidas de WhatsApp por contexto — BLUEPRINT §7.7 e i18n
 * shared._notes.whatsapp (dono: conversion). SÓ SERVIDOR (.astro): importa o i18n.
 * A ilha recebe as mensagens já resolvidas por props.
 */

import { SERVICE_KEYS, type ServiceKey } from "../config/routes";
import { t, tDynamic, type Locale } from "../i18n";

/**
 * Botão flutuante, header, CTA final. Sem rótulo (Home, 404, Política) usa
 * message_home; com rótulo usa message_page com o nome curto da página (o
 * rótulo do menu ou do breadcrumb, nunca o title nem a URL).
 */
export function pageMessage(locale: Locale, pageLabel?: string): string {
  return pageLabel
    ? t(locale, "shared.whatsapp.message_page", { pagina: pageLabel })
    : t(locale, "shared.whatsapp.message_home");
}

/** Página de serviço: {servico_frase} (i18n _notes.whatsapp / localization_es). */
export function serviceMessage(locale: Locale, service: ServiceKey): string {
  if (!SERVICE_KEYS.includes(service)) throw new Error(`serviço desconhecido: ${service}`);
  const phraseKey = locale === "es" ? "page_name_in_sentence" : "name_in_sentence";
  return t(locale, "shared.whatsapp.message_service", {
    servico_frase: tDynamic(locale, `services.${service}.${phraseKey}`),
  });
}

/** Página de case. */
export function caseMessage(locale: Locale, caseName: string): string {
  return t(locale, "shared.whatsapp.message_case", { case: caseName });
}

/** /contato. */
export function contactMessage(locale: Locale): string {
  return t(locale, "shared.whatsapp.message_contact");
}

/**
 * /orcamento antes de "Começar": o link "Prefere conversar direto?" da entrada
 * e o "Dúvidas? WhatsApp" do header (i18n quote._notes.whatsapp).
 */
export function quoteEntryMessage(locale: Locale): string {
  return t(locale, "quote.whatsapp_messages.entry_direct");
}

/** /orcamento em modo foco: o "Dúvidas? WhatsApp" do header. */
export function wizardQuestionMessage(locale: Locale): string {
  return t(locale, "quote.whatsapp_messages.wizard_question");
}

/**
 * "Já fez o diagnóstico e a Descoberta ficou definida?" (faixa depois do hero e
 * CTA final da Sprint, discovery_sprint._notes.already_diagnosed): quem já fez
 * o diagnóstico combina o início, sem passar pelo wizard de novo.
 */
export function discoveryStartMessage(locale: Locale): string {
  return t(locale, "quote.whatsapp_messages.discovery_start");
}

/** /orcamento/enviado sem storage (com storage, o script troca pela versão com o código). */
export function postSubmitGenericMessage(locale: Locale): string {
  return t(locale, "quote.whatsapp_messages.post_submit_generic");
}
