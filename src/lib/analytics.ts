/**
 * Analytics (dono: conversion) — eventos GA4 de BLUEPRINT §7.11, tipados, a
 * conversão do Google Ads (§10.2), o aviso de falha ao New Relic (backlog B272)
 * e a captura de atribuição (§7.1: utm_*, gclid, referrer, página de entrada).
 * SEGURO PARA O CLIENTE: não importa i18n nem astro:*.
 *
 * - track() vira no-op sem PUBLIC_GA4_ID ou sem window.gtag (preview, local,
 *   adblock). Em dev, todo evento sai no console com o prefixo [analytics].
 * - track() manda o evento SÓ para o GA4 (send_to = GA4_ID, backlog B052): a
 *   mesma tag gtag também tem o Google Ads configurado, e sem send_to o evento
 *   (com faixa de orçamento, prazo e papel no lead_submitted) iria para os dois
 *   destinos. A Política diz que só o Google Analytics recebe as respostas. A
 *   conversão do Ads sai só por reportAdsConversion(), com o send_to dela.
 * - Falha sem rede (B340): trackWhenOnline() guarda o evento numa fila curta
 *   do sessionStorage e só o envia quando a conexão volta (o gtag.js não
 *   reenvia um hit perdido offline). flushPendingEvents() esvazia a fila.
 * - Regra de privacidade (i18n quote._notes.privacy): nenhum evento anterior a
 *   lead_submitted leva valor de resposta do wizard. Os tipos abaixo garantem
 *   isso: wizard_step/skip/edit/blocked/abandon/return e os eventos de campo só levam
 *   o número/id da pergunta ou o NOME do campo, nunca o que foi marcado ou
 *   digitado.
 */

import { GA4_ID, GOOGLE_ADS } from "../config/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Snippet de conversão "Solicitar cotação" carregado pelo shell (Analytics.astro). */
    gtag_report_conversion?: (url?: string) => boolean | void;
    /** Agente do New Relic Browser (carregado pelo shell só em produção). */
    newrelic?: {
      addPageAction?: (name: string, attributes?: Record<string, unknown>) => void;
      noticeError?: (error: Error, attributes?: Record<string, unknown>) => void;
    };
  }
}

/** Parâmetros de cada evento (BLUEPRINT §7.11). */
export interface EventParams {
  cta_click: { cta_id: string; origem: string };
  whatsapp_click: { source: string };
  email_copy: { source: string };
  profile_click: { profile: "github" | "linkedin" | "medium" };
  /**
   * Intro do wizard exibida (backlog B330): uma vez por carregamento, só sem
   * ?etapa=. entry_source = entrySource() (atribuição, não resposta).
   */
  wizard_view: { entry_source: string; has_draft: boolean };
  /**
   * origem = ?origem= do CTA que trouxe ao wizard; entry_source = entrySource().
   * No máximo uma vez por carregamento de página (backlog B331).
   */
  wizard_start: { origem?: string; entry_source: string };
  /** "Começar de novo" do banner de retomada: não conta como novo início (B331). */
  wizard_restart: Record<string, never>;
  wizard_resume: Record<string, never>;
  wizard_step: { step: number | "resumo" | "contato"; question_id: string };
  /** "Continuar" sem seleção numa pergunta obrigatória (B335). */
  wizard_blocked: { step: number; question_id: string };
  /**
   * Saída da página com o wizard começado e não enviado (B051), com transport
   * beacon. Sem nenhum valor de resposta. trigger: "pagehide" (a página foi
   * descarregada) ou "hidden" (aba/app oculto, que pode voltar). Um por saída:
   * depois de um wizard_return, a próxima saída gera outro.
   */
  wizard_abandon: {
    last_step: number | "resumo" | "contato";
    question_id?: string;
    time_in_wizard_ms: number;
    trigger: "pagehide" | "hidden";
  };
  /**
   * A pessoa voltou à MESMA página depois de um wizard_abandon (aba visível de
   * novo, ou a página devolvida pelo bfcache), B051. Só a tela, nunca resposta.
   */
  wizard_return: { last_step: number | "resumo" | "contato" };
  /** Falha de render da ilha (error boundary, B234). view = tela em que falhou. */
  wizard_render_error: { view: string };
  wizard_back: Record<string, never>;
  wizard_skip: { question_id: string };
  wizard_answer_edit: { question_id: string };
  wizard_summary_view: Record<string, never>;
  wizard_reach_form: Record<string, never>;
  /** Campo preenchido e deixado (B337): só o NOME do campo, nunca o valor. */
  form_field_complete: { form: "briefing" | "contato"; field_name: string };
  /** Erro de validação exibido (B338): campo e tipo do erro, nunca o valor. */
  form_validation_error: { form: "briefing" | "contato"; field_name: string; error: "required" | "invalid" };
  /**
   * Tentativa de envio, antes do fetch (B339). event_id = código do pedido
   * (LEM-AAAAMMDD-XXXX): o mesmo nas novas tentativas, no lead_submitted, no
   * lead_failed, no campo protocol do Netlify e no transaction_id do Ads.
   */
  lead_attempt: { event_id: string; form: "briefing" };
  /**
   * time_to_convert_s: segundos do "Começar" ao envio confirmado (B050).
   * pain: ids da P3 (pain ou system_pain), nunca texto livre.
   */
  lead_submitted: {
    score: string;
    stage: string;
    build_type: string;
    deadline: string;
    budget: string;
    role: string;
    pain: string;
    event_id?: string;
    time_to_convert_s?: number;
  };
  /** form: qual formulário falhou ("briefing" do wizard ou "contato"). */
  lead_failed: { reason: string; attempts: number; form?: "briefing" | "contato"; event_id?: string };
  /**
   * /orcamento/enviado exibido depois de um envio REAL (B341), uma vez por
   * pedido (um reload não repete). event_id = o mesmo do lead_attempt e do
   * lead_submitted. Robô descartado e envio de teste do preview não disparam.
   */
  lead_success_view: { event_id: string };
  schedule_click: Record<string, never>;
  summary_copy: Record<string, never>;
  contact_submitted: { subject: string };
  page_not_found: { path: string };
  /** Troca de idioma pelo seletor (backlog B329). Só os códigos pt/en/es. */
  language_change: { from_lang: string; to_lang: string };
}

export type EventName = keyof EventParams;

export function isAnalyticsEnabled(): boolean {
  return GA4_ID !== "" && typeof window !== "undefined" && typeof window.gtag === "function";
}

export interface TrackOptions {
  /**
   * transport_type "beacon": o hit sai mesmo com a página sendo fechada
   * (wizard_abandon no pagehide).
   */
  beacon?: boolean;
}

export function track<K extends EventName>(name: K, params: EventParams[K], options: TrackOptions = {}): void {
  if (import.meta.env.DEV) console.debug(`[analytics] ${name}`, params);
  if (!isAnalyticsEnabled()) return;
  const extra: Record<string, string> = { send_to: GA4_ID };
  if (options.beacon) extra.transport_type = "beacon";
  window.gtag?.("event", name, { ...params, ...extra });
}

/**
 * Registra cada chave uma vez só (por página). Para eventos de campo
 * (form_field_complete, form_validation_error), que não podem repetir a cada
 * blur.
 */
export function createOnce(): (key: string) => boolean {
  const seen = new Set<string>();
  return (key) => {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}

/** Espera máxima pela confirmação do hit de conversão antes de sair da página. */
export const ADS_CONVERSION_WAIT_MS = 1_200;

/**
 * Conversão "Solicitar cotação" do Google Ads (BLUEPRINT §7.6, §10.2): chamada
 * SÓ no sucesso confirmado do envio do wizard. No-op sem a tag carregada (o
 * shell só carrega em produção: preview nunca converte).
 *
 * É o mesmo evento do snippet gtag_report_conversion (send_to de GOOGLE_ADS),
 * mas com event_callback próprio: a página navega para /orcamento/enviado logo
 * depois, e sem esperar o hit a conversão se perde. A Promise resolve no
 * callback ou em ADS_CONVERSION_WAIT_MS, o que vier primeiro. Sem gtag, mas com
 * o snippet antigo, usa o snippet (sem URL: quem navega é a ilha).
 * transactionId (o código do pedido) deixa o Ads deduplicar a conversão.
 */
export function reportAdsConversion(waitMs: number = ADS_CONVERSION_WAIT_MS, transactionId?: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (typeof window.gtag !== "function") {
    if (typeof window.gtag_report_conversion === "function") {
      try {
        window.gtag_report_conversion();
      } catch {
        // Medição nunca derruba o fluxo do lead.
      }
    }
    return Promise.resolve();
  }
  const gtag = window.gtag;
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, waitMs);
    try {
      // transaction_id = código do pedido: o Ads deduplica a conversão (B339).
      const params: Record<string, unknown> = { send_to: GOOGLE_ADS.conversionSendTo, event_callback: finish };
      if (transactionId) params.transaction_id = transactionId;
      gtag("event", "conversion", params);
    } catch {
      finish();
    }
  });
}

/**
 * Falha no funil vai também para o New Relic, para o alerta existir mesmo sem
 * GA4 (backlog B107, B272; playbook 06 §7): PageAction com o nome do evento
 * (NRQL `FROM PageAction WHERE actionName = 'lead_failed'`) e noticeError,
 * que entra em JS errors com os mesmos atributos. No-op sem o agente.
 * Os atributos nunca levam dado pessoal (motivo, tentativas, status, form).
 */
export function reportError(name: string, attributes: Record<string, string | number | boolean> = {}): void {
  if (import.meta.env.DEV) console.debug(`[monitor] ${name}`, attributes);
  if (typeof window === "undefined") return;
  try {
    window.newrelic?.addPageAction?.(name, attributes);
    window.newrelic?.noticeError?.(new Error(name), attributes);
  } catch {
    // Monitoramento nunca derruba o fluxo do lead.
  }
}

/* ------------------------------------------------------------------ *
 * Eventos de falha que sobrevivem ao modo offline (backlog B340)
 * ------------------------------------------------------------------ *
 * Celular sem sinal é a falha de envio mais comum, e é justamente quando o
 * hit do gtag.js (e o harvest do New Relic) também se perde: o gtag não
 * reenvia um hit que falhou. Então, se a pessoa está offline no momento do
 * evento (navigator.onLine === false), ou se o envio falhou por rede, o
 * evento NÃO sai na hora: vai para uma fila curta no sessionStorage e sai
 * quando a conexão volta ("online" + uma requisição de teste ao próprio
 * site), ou na próxima página da mesma aba, ou logo depois de um envio que
 * deu certo (a conexão está provada). A fila só guarda o que o próprio
 * evento já leva (motivo, tentativas, form, event_id, status): nunca dado
 * pessoal nem resposta do wizard.
 */

/** sessionStorage: eventos de falha à espera da conexão. */
export const PENDING_EVENTS_KEY = "lemamon:eventos-pendentes:v1";

/** No máximo 5 na fila (os mais novos ficam). */
export const MAX_PENDING_EVENTS = 5;

/** Espera entre as novas tentativas de esvaziar a fila quando a conexão parece ok mas não responde. */
export const PENDING_RETRY_MS = 10_000;

/** Tentativas com o navegador "online" sem resposta do site, antes de esperar a próxima página. */
export const PENDING_MAX_RETRIES = 6;

type Primitive = string | number | boolean;

interface PendingEvent {
  name: EventName;
  params: Record<string, Primitive>;
  /** Atributos do New Relic (reportError); ausente = o evento não vai ao New Relic. */
  nr?: Record<string, Primitive>;
}

function isPrimitiveRecord(value: unknown): value is Record<string, Primitive> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => item === undefined || ["string", "number", "boolean"].includes(typeof item))
  );
}

/** Tira as chaves undefined (o JSON da fila não as guarda). */
function definedOnly(record: Record<string, Primitive | undefined>): Record<string, Primitive> {
  return Object.fromEntries(Object.entries(record).filter(([, item]) => item !== undefined)) as Record<string, Primitive>;
}

function readPending(storage: Storage | null): PendingEvent[] {
  try {
    const raw = storage?.getItem(PENDING_EVENTS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (item): item is PendingEvent =>
          typeof item?.name === "string" && isPrimitiveRecord(item.params) && (item.nr === undefined || isPrimitiveRecord(item.nr)),
      )
      .slice(-MAX_PENDING_EVENTS);
  } catch {
    return [];
  }
}

function writePending(storage: Storage | null, items: PendingEvent[]): boolean {
  try {
    if (!storage) return false;
    if (items.length === 0) storage.removeItem(PENDING_EVENTS_KEY);
    else storage.setItem(PENDING_EVENTS_KEY, JSON.stringify(items.slice(-MAX_PENDING_EVENTS)));
    return true;
  } catch {
    return false;
  }
}

/** O navegador diz que está sem rede. */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * O site responde? Uma requisição pequena ao próprio domínio (connect-src
 * 'self'), sem cache. O evento "online" chega às vezes antes da rede de fato.
 */
export async function siteReachable(timeoutMs = 5_000): Promise<boolean> {
  if (typeof fetch !== "function") return false;
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
  try {
    const response = await fetch(`/favicon.svg?online=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller?.signal,
    });
    return response.status > 0;
  } catch {
    return false;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export interface FlushOptions {
  /** A conexão já está provada (um envio acabou de dar certo): sem requisição de teste. */
  reachable?: boolean;
  /** Para testes. Padrão: siteReachable(). */
  probe?: () => Promise<boolean>;
  /** Para testes. Padrão: sessionStorage. */
  storage?: Storage | null;
}

let onlineArmed = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let retries = 0;
let flushing: Promise<number> | null = null;

function armOnline(options: FlushOptions): void {
  if (onlineArmed || typeof window === "undefined" || typeof window.addEventListener !== "function") return;
  onlineArmed = true;
  window.addEventListener(
    "online",
    () => {
      onlineArmed = false;
      retries = 0;
      void flushPendingEvents({ ...options, reachable: false });
    },
    { once: true },
  );
}

function scheduleRetry(options: FlushOptions): void {
  if (retryTimer !== undefined || retries >= PENDING_MAX_RETRIES) return;
  retries += 1;
  retryTimer = setTimeout(() => {
    retryTimer = undefined;
    void flushPendingEvents({ ...options, reachable: false });
  }, PENDING_RETRY_MS);
}

/**
 * Envia a fila de eventos pendentes (GA4 com transport beacon + New Relic) e a
 * apaga. Offline: espera o "online". "Online" sem resposta do site: tenta de
 * novo daqui a PENDING_RETRY_MS (até PENDING_MAX_RETRIES vezes nesta página).
 * Chamar no início de cada página (o shell liga no script global) e depois de
 * um envio que deu certo. Devolve quantos eventos saíram.
 */
export function flushPendingEvents(options: FlushOptions = {}): Promise<number> {
  if (flushing) return flushing;
  const run = async (): Promise<number> => {
    const storage = options.storage === undefined ? sessionStore() : options.storage;
    if (readPending(storage).length === 0) return 0;
    if (isOffline()) {
      armOnline(options);
      return 0;
    }
    if (!options.reachable && !(await (options.probe ?? siteReachable)())) {
      if (isOffline()) armOnline(options);
      else scheduleRetry(options);
      return 0;
    }
    // Lê de novo: a fila pode ter mudado durante a requisição de teste.
    const items = readPending(storage);
    if (!writePending(storage, [])) return 0;
    for (const item of items) {
      track(item.name, item.params as never, { beacon: true });
      if (item.nr) reportError(item.name, item.nr);
    }
    retries = 0;
    return items.length;
  };
  flushing = run().finally(() => {
    flushing = null;
  });
  return flushing;
}

/**
 * track() (+ reportError() quando `nr` vem) que sobrevive ao modo offline
 * (B340). Sai na hora se a pessoa está online e o evento não é uma falha de
 * rede; senão vai para a fila e sai quando a conexão voltar. Sem storage (aba
 * anônima bloqueada), sai na hora: melhor tentar que perder em silêncio.
 * Devolve "sent" ou "queued".
 */
export function trackWhenOnline<K extends EventName>(
  name: K,
  params: EventParams[K],
  nr?: Record<string, Primitive>,
  options: Pick<FlushOptions, "probe" | "storage"> = {},
): "sent" | "queued" {
  const reason = (params as { reason?: unknown }).reason;
  const defer = isOffline() || reason === "network";
  const storage = options.storage === undefined ? sessionStore() : options.storage;
  if (defer && isPrimitiveRecord(params)) {
    const item: PendingEvent = { name, params: definedOnly(params), ...(nr ? { nr: definedOnly(nr) } : {}) };
    const queued = writePending(storage, [...readPending(storage), item]);
    if (queued) {
      if (isOffline()) armOnline(options);
      else void flushPendingEvents(options);
      return "queued";
    }
  }
  track(name, params);
  if (nr) reportError(name, nr);
  return "sent";
}

/** Só para testes: zera o estado do módulo (listener "online", novas tentativas). */
export function resetPendingEventsForTests(): void {
  onlineArmed = false;
  retries = 0;
  if (retryTimer !== undefined) clearTimeout(retryTimer);
  retryTimer = undefined;
  flushing = null;
}

/* ------------------------------------------------------------------ *
 * Atribuição (BLUEPRINT §7.1 e §7.10, backlog B018)
 * ------------------------------------------------------------------ */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Parâmetros do CTA que levou ao wizard (não variam por idioma, CONTRACT §2). */
export const QUOTE_PARAM_KEYS = ["origem", "servico", "ref", "entrada"] as const;

/** Toque da sessão: como a pessoa chegou ao site. Sem dado pessoal. */
export interface Touch {
  /** Caminho + query da primeira página vista na sessão (ou do toque com campanha). */
  landing: string;
  /** document.referrer externo ("" se direto ou interno). */
  referrer: string;
  utm: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  gclid: string;
  /** Date.now() do registro. */
  at: number;
}

/** Chave de sessionStorage do toque da sessão (vive só enquanto a aba vive). */
export const ATTRIBUTION_SESSION_KEY = "lemamon:atribuicao:v1";

const MAX_PARAM_LENGTH = 200;

function clip(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, MAX_PARAM_LENGTH);
}

/** Referrer só se vier de outro site (navegação interna não é origem). */
export function externalReferrer(referrer: string, currentHost: string): string {
  if (!referrer) return "";
  try {
    const url = new URL(referrer);
    return url.host === currentHost ? "" : `${url.origin}${url.pathname}`;
  } catch {
    return "";
  }
}

/** Lê utm_* e gclid de uma query string. */
export function readCampaign(search: string): Pick<Touch, "utm" | "gclid"> {
  const params = new URLSearchParams(search);
  const utm: Touch["utm"] = {};
  for (const key of UTM_KEYS) {
    const value = clip(params.get(key));
    if (value) utm[key] = value;
  }
  return { utm, gclid: clip(params.get("gclid")) };
}

export function hasCampaign(touch: Pick<Touch, "utm" | "gclid">): boolean {
  return touch.gclid !== "" || Object.keys(touch.utm).length > 0;
}

function sessionStore(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function readSessionTouch(storage: Storage | null = sessionStore()): Touch | null {
  try {
    const raw = storage?.getItem(ATTRIBUTION_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Touch>;
    if (typeof data.landing !== "string" || typeof data.at !== "number") return null;
    return {
      landing: data.landing,
      referrer: typeof data.referrer === "string" ? data.referrer : "",
      utm: data.utm && typeof data.utm === "object" ? data.utm : {},
      gclid: typeof data.gclid === "string" ? data.gclid : "",
      at: data.at,
    };
  } catch {
    return null;
  }
}

/**
 * Registra o toque da sessão. Chamar em TODA página (o shell liga no script
 * global): grava a primeira página da sessão e troca pelo toque mais recente
 * que traga campanha (utm/gclid), para o anúncio clicado não se perder.
 */
export function rememberLanding(
  location: Pick<Location, "pathname" | "search" | "host"> | undefined = typeof window !== "undefined"
    ? window.location
    : undefined,
  referrer: string = typeof document !== "undefined" ? document.referrer : "",
  storage: Storage | null = sessionStore(),
  now: number = Date.now(),
): Touch | null {
  if (!location) return null;
  const campaign = readCampaign(location.search);
  const current = readSessionTouch(storage);
  if (current && !hasCampaign(campaign)) return current;
  const touch: Touch = {
    landing: clip(`${location.pathname}${location.search}`),
    referrer: externalReferrer(referrer, location.host),
    ...campaign,
    at: now,
  };
  try {
    storage?.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(touch));
  } catch {
    // Sem storage: a atribuição sai só da URL do wizard.
  }
  return touch;
}

/**
 * De onde a pessoa chegou ao wizard (wizard_view e wizard_start, B330/B331):
 * o primeiro disponível entre ?origem= (o CTA do site), utm_source da URL,
 * utm_source do toque da sessão, host do referrer externo e "direct". É
 * atribuição, nunca resposta do wizard.
 */
export function entrySource(input: {
  search: string;
  referrer: string;
  host: string;
  sessionTouch: Touch | null;
}): string {
  const params = new URLSearchParams(input.search);
  const origem = clip(params.get("origem")).slice(0, 120);
  if (origem) return origem;
  const utm = readCampaign(input.search).utm.utm_source ?? input.sessionTouch?.utm.utm_source;
  if (utm) return utm;
  const referrer = input.sessionTouch?.referrer || externalReferrer(input.referrer, input.host);
  if (referrer) {
    try {
      return new URL(referrer).host;
    } catch {
      // referrer inválido: cai no "direct"
    }
  }
  return "direct";
}
