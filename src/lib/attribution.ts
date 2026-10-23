/**
 * Atribuição dos pedidos (dono: conversion) — BLUEPRINT §7.1 e §7.10.
 * SEGURO PARA O CLIENTE: não importa i18n, astro:* nem config pesado.
 *
 * Fonte única para o wizard (islands/wizard/lead.ts, que reexporta o que já
 * exportava) e para o formulário de /contato (contact-form.ts), achado F11 da
 * auditoria de conversão: os dois mandam `attribution` e `gclid` com as mesmas
 * regras.
 *
 * - buildAttribution: utm_*, ids de clique de anúncio do Google (gclid e,
 *   desde o F81, gbraid e wbraid, os cliques de iPhone), referrer, página de
 *   entrada e os parâmetros do CTA (origem, servico, ref, entrada). Sem gclid
 *   na URL, no toque da sessão e sem gbraid/wbraid, o gclid vem do cookie
 *   `_gcl_aw` do Google Ads (F26, playbook 07 §7).
 * - adoptCampaign: o toque de campanha que outra aba passou a esta (F26,
 *   lib/analytics shareCampaignTouch) entra no pedido que ainda não tinha campanha.
 * - Modo consentimento (B342): gclidAllowed / withoutAdClickIds. As mesmas
 *   regras valem para os três ids de clique.
 *
 * O que roda em TODA página (toque entre abas e "Ref.: G-…" no WhatsApp) fica
 * em lib/analytics.ts: assim as páginas sem formulário não baixam isto.
 */

import { AD_CLICK_KEYS, externalReferrer, hasCampaign, QUOTE_PARAM_KEYS, readCampaign, UTM_KEYS, type Touch } from "./analytics";
import { CONSENT_ACCEPTED, CONSENT_KEY } from "../scripts/storage-keys";

/* ------------------------------------------------------------------ *
 * Atribuição de um envio (§7.1)
 * ------------------------------------------------------------------ */

export interface AttributionInput {
  /** location.pathname + search da página do formulário, sem o ?etapa=. */
  pathname: string;
  search: string;
  host: string;
  /** document.referrer. */
  referrer: string;
  /** Toque da sessão gravado pelo script global do shell (rememberLanding). */
  sessionTouch: Touch | null;
  /**
   * document.cookie, só para o fallback do `_gcl_aw` (F26). Padrão: o cookie
   * da página no navegador; "" fora dele.
   */
  cookie?: string;
}

function documentCookie(): string {
  try {
    return typeof document !== "undefined" ? document.cookie : "";
  } catch {
    return "";
  }
}

/**
 * gclid do cookie de primeira parte `_gcl_aw` que o Google Ads grava com o
 * último clique ("GCL.<timestamp>.<gclid>"), ou "". O gclid só tem letras,
 * números, "_" e "-".
 */
export function gclidFromCookie(cookie: string): string {
  return /(?:^|;\s*)_gcl_aw=GCL\.\d+\.([\w-]{1,200})(?:;|$)/.exec(cookie)?.[1] ?? "";
}

/**
 * utm_*, gclid/gbraid/wbraid, referrer, página de entrada e os parâmetros do
 * CTA (origem, servico, ref, entrada). O que está na URL do formulário ganha
 * do toque da sessão; o cookie `_gcl_aw` só entra quando nenhum id de clique
 * veio da URL nem do toque (playbook 07 §7).
 */
export function buildAttribution({
  pathname,
  search,
  host,
  referrer,
  sessionTouch,
  cookie = documentCookie(),
}: AttributionInput): Record<string, string> {
  const params = new URLSearchParams(search);
  params.delete("etapa");
  const campaign = readCampaign(params.toString());
  const attribution: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = campaign.utm[key] ?? sessionTouch?.utm[key];
    if (value) attribution[key] = value;
  }
  for (const key of AD_CLICK_KEYS) {
    const value = campaign[key] || sessionTouch?.[key] || "";
    if (value) attribution[key] = value;
  }
  if (!AD_CLICK_KEYS.some((key) => attribution[key])) {
    const fromCookie = gclidFromCookie(cookie);
    if (fromCookie) attribution.gclid = fromCookie;
  }
  for (const key of QUOTE_PARAM_KEYS) {
    const value = (params.get(key) ?? "").trim().slice(0, 120);
    if (value) attribution[key] = value;
  }
  const ref = sessionTouch?.referrer || externalReferrer(referrer, host);
  if (ref) attribution.referrer = ref;
  const query = params.toString();
  attribution.landing = sessionTouch?.landing || `${pathname}${query ? `?${query}` : ""}`;
  attribution.entry_page = pathname;
  return attribution;
}

/**
 * Toque de campanha que chegou DEPOIS de a atribuição ser montada (F26: adotado
 * de outra aba pelo BroadcastChannel). Só preenche uma atribuição SEM campanha:
 * a campanha que o pedido já tinha nunca é trocada nem misturada com outra.
 */
export function adoptCampaign(attribution: Record<string, string>, touch: Touch | null): Record<string, string> {
  if (!touch || !hasCampaign(touch) || [...UTM_KEYS, ...AD_CLICK_KEYS].some((key) => attribution[key])) return attribution;
  const adopted: Record<string, string> = { ...attribution };
  for (const key of UTM_KEYS) {
    const value = touch.utm[key];
    if (value) adopted[key] = value;
  }
  for (const key of AD_CLICK_KEYS) {
    const value = touch[key];
    if (value) adopted[key] = value;
  }
  if (touch.referrer) adopted.referrer = touch.referrer;
  if (touch.landing) adopted.landing = touch.landing;
  return adopted;
}

/* ------------------------------------------------------------------ *
 * gclid e o modo consentimento (backlog B342)
 * ------------------------------------------------------------------ */

/** Ids de clique de anúncio do Google que podem vir na URL de entrada. */
export const AD_CLICK_PARAMS = AD_CLICK_KEYS;

/**
 * O gclid (e o gbraid/wbraid) pode ir no envio? Com privacidade.baseAnuncios =
 * "legitimo_interesse" (consentRequired = false), sim. Com "consentimento",
 * só se a pessoa ACEITOU no aviso de cookies (localStorage CONSENT_KEY =
 * "aceito"): recusou, ou nunca respondeu, o pedido sai sem id de clique, e o
 * comercial não tem o que importar no Google Ads (playbook 07 §4.4). A
 * Política promete exatamente isso (legal_basis.items.ads_measurement_with_consent).
 * Sem storage: não.
 */
export function gclidAllowed(consentRequired: boolean, storage: Pick<Storage, "getItem"> | null): boolean {
  if (!consentRequired) return true;
  try {
    return storage?.getItem(CONSENT_KEY) === CONSENT_ACCEPTED;
  } catch {
    return false;
  }
}

/** Tira os ids de clique de anúncio de um caminho com query ("/?gclid=x&utm_source=y" → "/?utm_source=y"). */
function stripAdClickParams(path: string): string {
  const index = path.indexOf("?");
  if (index < 0) return path;
  const params = new URLSearchParams(path.slice(index + 1));
  for (const key of AD_CLICK_PARAMS) params.delete(key);
  const query = params.toString();
  return `${path.slice(0, index)}${query ? `?${query}` : ""}`;
}

/** Atribuição sem nenhum id de clique de anúncio: nem os campos, nem dentro da página de entrada. */
export function withoutAdClickIds(attribution: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attribution)) {
    if ((AD_CLICK_PARAMS as readonly string[]).includes(key)) continue;
    result[key] = key === "landing" || key === "entry_page" ? stripAdClickParams(value) : value;
  }
  return result;
}

/**
 * Os dois campos do Netlify Forms: `attribution` (JSON, com gbraid/wbraid quando
 * houver) e `gclid` (campo próprio, o que a importação offline usa). Sem
 * permissão (gclidAllowed = false), nenhum id de clique vai em nenhum dos dois.
 */
export function attributionFields(
  attribution: Record<string, string>,
  allowed = true,
): { attribution: string; gclid: string } {
  const source = allowed ? attribution : withoutAdClickIds(attribution);
  const { gclid = "", ...rest } = source;
  return { attribution: JSON.stringify(rest), gclid };
}
