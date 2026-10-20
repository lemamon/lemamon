/**
 * WhatsApp (dono: conversion) — montagem de link wa.me e das mensagens
 * compostas no cliente (resumo e falha do wizard, BLUEPRINT §7.7).
 * SEGURO PARA O CLIENTE: não importa i18n. Os TEXTOS chegam prontos (props da
 * ilha ou data-* de um .astro); aqui só se monta e interpola.
 *
 * - Sem PUBLIC_WHATSAPP_NUMBER válido, hasWhatsapp() = false e whatsappHref()
 *   devolve null: todo botão de WhatsApp some (§7.7), sem link morto.
 * - Mensagens com texto livre do visitante (nome, empresa, data travante) abrem
 *   por JS no clique (openWhatsapp) e o href renderizado NÃO leva o ?text=
 *   (critério de aceite de i18n quote._notes.whatsapp: o GA4 mede o link_url
 *   de cliques externos, e o texto não pode chegar lá).
 */

import { hasWhatsappNumber, WHATSAPP_NUMBER } from "../config/site";

export function hasWhatsapp(): boolean {
  return hasWhatsappNumber(WHATSAPP_NUMBER);
}

/** https://wa.me/<número>?text=<mensagem>, ou null sem número. */
export function whatsappHref(message?: string): string | null {
  if (!hasWhatsapp()) return null;
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Abre o WhatsApp com a mensagem numa aba nova, no clique. Devolve false se não
 * houver número (quem chama não deveria nem ter mostrado o botão).
 */
export function openWhatsapp(message: string, target: Pick<Window, "open"> = window): boolean {
  const href = whatsappHref(message);
  if (!href) return false;
  target.open(href, "_blank", "noopener");
  return true;
}

/**
 * Interpola {placeholder} no cliente sem importar o i18n (que levaria o JSON
 * inteiro para o bundle). Igual ao interpolate() do i18n: placeholder sem valor
 * lança erro, para um texto com "{nome}" cru nunca ir ao ar.
 */
export function fillTemplate(template: string, vars: Readonly<Record<string, string | number>> = {}): string {
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_whole, name: string) => {
    const value = vars[name];
    if (value === undefined || value === null || value === "") {
      throw new Error(`[whatsapp] placeholder {${name}} sem valor`);
    }
    return String(value);
  });
}

export interface ComposedMessage {
  intro: string;
  /** Linhas logo abaixo da saudação (ex.: nome e empresa na mensagem de falha). */
  head?: string[];
  /** Uma linha por resposta. */
  lines: string[];
  /** "Código do pedido: LEM-…" (sem código, a linha não existe). */
  ref?: string;
  closing?: string;
}

/** Blocos separados por linha em branco; linhas vazias somem. */
export function composeMessage({ intro, head = [], lines, ref, closing }: ComposedMessage): string {
  const blocks = [[intro, ...head], lines, ref ? [ref] : [], closing ? [closing] : []]
    .map((block) => block.filter((line) => line && line.trim() !== "").join("\n"))
    .filter((block) => block !== "");
  return blocks.join("\n\n");
}
