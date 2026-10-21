/**
 * Netlify Forms (dono: conversion) — BLUEPRINT §7.6 e §7.10. SEGURO PARA O CLIENTE:
 * não importa i18n, astro:* nem config pesado.
 *
 * - Os nomes dos campos são contrato com o painel do Netlify e NÃO variam por
 *   idioma. A declaração estática (<form hidden data-netlify>) usa estas mesmas
 *   listas (components/quote/NetlifyForms.astro), e o teste de contrato confere
 *   que nada sai de sincronia (o Netlify descarta campo não declarado).
 * - submitNetlifyForm: timeout de 12 s por tentativa, 3 tentativas com backoff,
 *   honeypot e tempo mínimo de preenchimento. Rede/timeout/5xx repetem; 4xx não.
 *   Repetir depois de um timeout pode duplicar um envio que chegou: para este
 *   funil, lead duplicado custa muito menos que lead perdido (decisão da Onda 1).
 * - Validação de campo (e-mail, telefone BR com DDD ou internacional com +,
 *   máscara) e o protocolo
 *   LEM-AAAAMMDD-XXXX gerado no cliente (não há sequência sem backend, §15.3).
 * - suggestEmail (achado F07): "Você quis dizer joao@gmail.com?" para erro de
 *   digitação no domínio, sem bloquear o envio.
 */

export const FORM_NAMES = { briefing: "briefing", contato: "contato" } as const;
export type FormName = keyof typeof FORM_NAMES;

export const HONEYPOT_FIELD = "bot-field";

/**
 * `subject` do briefing: assunto do e-mail de notificação do Netlify Forms
 * ("[A] LEM-20261019-AB12": score + protocolo, sem dado pessoal e sem texto de
 * idioma), para a triagem por SLA na caixa do comercial (playbook 03/04). O
 * Netlify usa o campo chamado `subject` como assunto da notificação; a
 * declaração estática leva data-remove-prefix (sem o "[Netlify]" na frente).
 * No `contato`, `topic` é o assunto escolhido pela pessoa (id estável) e
 * `subject` é o assunto do e-mail, legível (contactSubject): o Netlify usa o
 * campo `subject` do formulário mesmo com assunto configurado no painel.
 */
export const FORM_FIELDS = {
  briefing: [
    "name",
    "email",
    "phone",
    "channel",
    "company",
    "details",
    "answers",
    "summary",
    "score",
    "protocol",
    "subject",
    "lang",
    "attribution",
    "gclid",
    HONEYPOT_FIELD,
  ],
  // attribution e gclid: as mesmas regras do briefing (lib/attribution), achado F11.
  contato: ["name", "email", "phone", "topic", "subject", "message", "lang", "origin", "attribution", "gclid", HONEYPOT_FIELD],
} as const satisfies Record<FormName, readonly string[]>;

export type FormFieldName<F extends FormName> = (typeof FORM_FIELDS)[F][number];

/**
 * Assunto da notificação do contato: "[Contato] Projeto novo", com o rótulo
 * do assunto em pt (quem lê é a equipe) e o idioma da página quando não é pt
 * ("[Contato · en] Parceria"); sem dado pessoal. Sem assunto escolhido (envio
 * sem JS), vai o genérico.
 */
export function contactSubject(lang: string, topicLabel = "Mensagem pelo site"): string {
  return `[Contato${lang && lang !== "pt" ? ` · ${lang}` : ""}] ${topicLabel}`;
}

/** Assunto da notificação do briefing: "[score] protocolo" (ver FORM_FIELDS). */
export function briefingSubject(score: string, protocol: string): string {
  return `[${score}] ${protocol}`;
}
export type FormFields<F extends FormName> = Partial<Record<FormFieldName<F>, string>>;

/* ------------------------------------------------------------------ *
 * Envio
 * ------------------------------------------------------------------ */

/** Timeout de cada tentativa (§7.6). */
export const SUBMIT_TIMEOUT_MS = 12_000;
/** Tentativas no total (§7.6). */
export const SUBMIT_MAX_ATTEMPTS = 3;
/** Espera antes da 2ª tentativa; dobra a cada uma (600 ms, 1,2 s). */
export const SUBMIT_RETRY_BASE_MS = 600;
/** Envio mais rápido que isso desde que o formulário apareceu é robô (backlog B269). */
export const MIN_FILL_MS = 3_000;
/** O anúncio "ainda enviando" entra depois disto (i18n quote._notes.sending). */
export const SLOW_SUBMIT_MS = 8_000;

export type SubmitFailureReason = "network" | "timeout" | "server" | "rejected" | "spam";

export type SubmitResult =
  | { ok: true; attempts: number; /** Envio de teste num deploy preview: nada foi enviado (B277). */ preview?: boolean }
  | { ok: false; reason: SubmitFailureReason; attempts: number; status?: number };

export interface SubmitOptions {
  /** Para testes. Padrão: fetch global. */
  fetchImpl?: typeof fetch;
  /** Para testes. Padrão: setTimeout. */
  sleep?: (ms: number) => Promise<void>;
  /** Date.now() de quando o formulário apareceu (tempo mínimo de preenchimento). */
  startedAt?: number;
  now?: () => number;
  timeoutMs?: number;
  maxAttempts?: number;
  retryBaseMs?: number;
  minFillMs?: number;
  /** O Netlify intercepta POST em qualquer caminho; "/" é o padrão documentado. */
  endpoint?: string;
  /**
   * Deploy preview / branch deploy do Netlify (backlog B277): não chama a rede e
   * devolve { ok: true, attempts: 0, preview: true }. O Netlify Forms aceita
   * envios de preview no MESMO form de produção (e dispara a notificação ao
   * comercial); com isto, revisar o site por URL de preview não vira lead.
   * Local e E2E (sem CONTEXT) continuam fazendo POST. Quem chama decide com
   * previewSubmitActive().
   */
  preview?: boolean;
}

/** Contextos de deploy do Netlify em que o envio é de teste (backlog B277). */
export const PREVIEW_SUBMIT_CONTEXTS: readonly string[] = ["deploy-preview", "branch-deploy"];

/**
 * O build é de deploy preview / branch deploy? (CONTEXT do Netlify, lido no
 * servidor por config/site.ts deployContext()). Local, E2E (sem CONTEXT) e
 * produção enviam de verdade. Regra única para o wizard e o /contato.
 */
export function isPreviewSubmitContext(context: string): boolean {
  return PREVIEW_SUBMIT_CONTEXTS.includes(context);
}

/**
 * Liga o POST real num build de preview, SÓ para um E2E que intercepta o POST
 * (page.route): o stub do Netlify Forms do E2E grava esta marca com
 * addInitScript antes de carregar a página. Sem a marca, todo navegador
 * (gente revisando, Playwright, sonda automatizada) faz envio de teste.
 */
export const REAL_SUBMIT_FLAG = "__lemamonRealSubmit";

/**
 * O envio de teste do deploy preview vale para QUALQUER navegador (backlog
 * B277): um navegador automatizado sem o stub do E2E também criaria lead no
 * form de produção. Só a marca explícita REAL_SUBMIT_FLAG (posta pelo E2E que
 * intercepta o POST) leva ao caminho real, para o caminho do dinheiro
 * continuar testável contra a URL do preview (B259).
 */
export function previewSubmitActive(
  preview: boolean,
  scope: Record<string, unknown> | undefined = globalThis as unknown as Record<string, unknown>,
): boolean {
  return preview && scope?.[REAL_SUBMIT_FLAG] !== true;
}

/** Corpo application/x-www-form-urlencoded com o form-name do Netlify. Só campos do schema. */
export function encodeForm<F extends FormName>(form: F, fields: FormFields<F>): string {
  const body = new URLSearchParams({ "form-name": FORM_NAMES[form] });
  const allowed = new Set<string>(FORM_FIELDS[form]);
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.has(key) && typeof value === "string") body.set(key, value);
  }
  return body.toString();
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isAbort(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { name?: string }).name === "AbortError";
}

/**
 * Envia para o Netlify Forms. Nunca lança: devolve um resultado tipado, para a
 * interface separar erro de rede de recusa (backlog B270).
 *
 * Honeypot preenchido ou envio rápido demais: { ok: false, reason: "spam" } SEM
 * chamar a rede. Quem chama trata como sucesso silencioso (sem conversão).
 */
export async function submitNetlifyForm<F extends FormName>(
  form: F,
  fields: FormFields<F>,
  options: SubmitOptions = {},
): Promise<SubmitResult> {
  const {
    fetchImpl = globalThis.fetch?.bind(globalThis),
    sleep = defaultSleep,
    now = Date.now,
    startedAt,
    timeoutMs = SUBMIT_TIMEOUT_MS,
    maxAttempts = SUBMIT_MAX_ATTEMPTS,
    retryBaseMs = SUBMIT_RETRY_BASE_MS,
    minFillMs = MIN_FILL_MS,
    endpoint = "/",
    preview = false,
  } = options;

  const honeypot = (fields as Record<string, string | undefined>)[HONEYPOT_FIELD];
  if (honeypot && honeypot.trim() !== "") return { ok: false, reason: "spam", attempts: 0 };
  if (typeof startedAt === "number" && now() - startedAt < minFillMs) return { ok: false, reason: "spam", attempts: 0 };
  if (preview) return { ok: true, attempts: 0, preview: true };
  if (!fetchImpl) return { ok: false, reason: "network", attempts: 0 };

  const body = encodeForm(form, fields);
  let last: SubmitResult = { ok: false, reason: "network", attempts: 0 };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => controller?.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller?.signal,
      });
      if (response.ok) return { ok: true, attempts: attempt };
      // 4xx: o pedido em si está errado; repetir não resolve.
      if (response.status < 500) return { ok: false, reason: "rejected", attempts: attempt, status: response.status };
      last = { ok: false, reason: "server", attempts: attempt, status: response.status };
    } catch (error) {
      last = { ok: false, reason: isAbort(error) ? "timeout" : "network", attempts: attempt };
    } finally {
      clearTimeout(timer);
    }
    if (attempt < maxAttempts) await sleep(retryBaseMs * 2 ** (attempt - 1));
  }
  return last;
}

/* ------------------------------------------------------------------ *
 * Validação de campos
 * ------------------------------------------------------------------ */

export function isFilled(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * nome@exemplo.com (o critério da Onda 1, sem espaços) e, desde o F07, sem
 * ".." em lugar nenhum, sem ponto no começo ou no fim do nome e do domínio e
 * sem final de 1 letra ("joao@empresa.c").
 */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.includes("..")) return false;
  const [local = "", domain = ""] = email.split("@");
  if ([local, domain].some((part) => part.startsWith(".") || part.endsWith("."))) return false;
  return (domain.split(".").pop() ?? "").length >= 2;
}

/* ------------------------------------------------------------------ *
 * Sugestão de e-mail (achado F07)
 * ------------------------------------------------------------------ */

/**
 * Domínios de e-mail pessoal mais comuns no Brasil. Um domínio desta lista
 * NUNCA recebe sugestão: "uol.com.br" e "bol.com.br" estão a 1 letra de
 * distância e os dois existem.
 */
export const COMMON_EMAIL_DOMAINS: readonly string[] =
  "gmail.com hotmail.com hotmail.com.br outlook.com outlook.com.br live.com yahoo.com yahoo.com.br icloud.com uol.com.br bol.com.br terra.com.br ig.com.br".split(
    " ",
  );

/**
 * Só estes nomes da lista recebem correção por semelhança (1 letra trocada,
 * faltando, sobrando ou 2 vizinhas invertidas, sempre com a 1ª letra igual):
 * são os mais digitados e longos o bastante para a correção não pegar o
 * domínio de outra empresa. A 1ª letra igual deixa de fora domínios reais a 1
 * letra de distância ("mail.com", "email.com", "ymail.com" × gmail; "cloud.com"
 * × icloud; "wahoo.com" × yahoo). Os curtos (uol, bol, ig, live, terra) só
 * ganham a correção do final.
 */
const FUZZY_EMAIL_NAMES = ["gmail", "hotmail", "outlook", "yahoo", "icloud"];

/** a e b diferem por 1 letra trocada, faltando, sobrando, ou por 2 vizinhas invertidas? */
function oneEditApart(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (a[i] === b[i]) i += 1;
  if (a.length > b.length) return a.slice(i + 1) === b.slice(i);
  if (a.length < b.length) return a.slice(i) === b.slice(i + 1);
  return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
}

/**
 * Sugestão para um e-mail com erro de digitação, ou null (achado F07). Não
 * bloqueia nada: quem chama mostra "Você quis dizer …? [Corrigir]".
 *
 * - Domínio da lista (COMMON_EMAIL_DOMAINS): nunca sugere outro domínio.
 * - Pontos: ".." vira "." e sai o ponto no começo ou no fim do nome e do domínio.
 * - Final: ".con/.cpm/.vom/.comm/.om" → ".com"; ".com.bt/.com.vr/.combr" → ".com.br"
 *   (em qualquer domínio, inclusive de empresa: só o final muda).
 * - "gmail.com.br" (não existe) → "gmail.com".
 * - Nome da lista com 1 letra errada, faltando, sobrando ou invertida
 *   ("gmial", "hotmal", "outlok"), com a 1ª letra certa, só para gmail,
 *   hotmail, outlook, yahoo e icloud, com ".com" ou ".com.br" que exista na lista.
 * O nome antes do "@" fica como a pessoa digitou (só os pontos mudam); o
 * domínio volta em minúsculas.
 */
export function suggestEmail(value: string): string | null {
  const email = value.trim();
  const parts = email.split("@");
  if (/\s/.test(email) || parts.length !== 2) return null;
  const clean = (part: string) => part.replace(/\.{2,}/g, ".").replace(/^\.+|\.+$/g, "");
  const local = clean(parts[0] as string);
  let domain = clean((parts[1] as string).toLowerCase());
  if (!local || !domain.includes(".")) return null;
  if (!COMMON_EMAIL_DOMAINS.includes(domain)) {
    domain = domain
      .replace(/\.(?:con|cpm|vom|comm|om)(\.br)?$/, (_end, br: string | undefined) => `.com${br ?? ""}`)
      .replace(/\.(?:com\.bt|com\.vr|combr)$/, ".com.br");
    if (domain === "gmail.com.br") domain = "gmail.com";
    const [, name = "", suffix = ""] = /^([^.]+)(\.com(?:\.br)?)$/.exec(domain) ?? [];
    const close = FUZZY_EMAIL_NAMES.find(
      (candidate) => candidate[0] === name[0] && oneEditApart(name, candidate) && COMMON_EMAIL_DOMAINS.includes(candidate + suffix),
    );
    if (close) domain = close + suffix;
  }
  const suggestion = `${local}@${domain}`;
  // Só maiúsculas no domínio ("Joao@Gmail.com") não é erro: sem sugestão.
  return suggestion.toLowerCase() !== email.toLowerCase() && isValidEmail(suggestion) ? suggestion : null;
}

/** Só os dígitos do telefone, sem o 55 do país quando vier junto (12 ou 13 dígitos). */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 12 && digits.startsWith("55") ? digits.slice(2) : digits;
}

/**
 * Número de fora do Brasil: começa com "+" e o código do país não é 55 (ou é
 * +55 ainda incompleto, sendo digitado). Público natural de /en e /es; a
 * máscara BR nunca reescreve esse número.
 */
export function isInternationalPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) return false;
  const digits = trimmed.replace(/\D/g, "");
  return !(digits.startsWith("55") && digits.length >= 12);
}

/** Telefone brasileiro com DDD: 10 (fixo) ou 11 (celular) dígitos, DDD válido. */
export function isValidPhoneBR(value: string): boolean {
  const digits = phoneDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  if (digits[0] === "0" || digits[1] === "0") return false;
  return digits.length === 10 || digits[2] === "9";
}

/** Idioma da página onde o telefone é digitado (a regra muda fora do pt). */
export type PhoneLocale = "pt" | "en" | "es";

/**
 * Em /en e /es o número só vale com "+" e o código do país: sem o "+", um
 * celular da Cidade do México ("5512345678") ou de Buenos Aires
 * ("1123456789") passaria pela regra brasileira como "(55) 1234-5678" e o lead
 * sairia com um WhatsApp +55 errado, sem aviso. A mensagem error_invalid
 * desses idiomas já pede o código do país.
 */
export function phoneNeedsCountryCode(locale: PhoneLocale): boolean {
  return locale !== "pt";
}

/**
 * Telefone válido para o envio: brasileiro com DDD, ou internacional com "+",
 * código do país e de 8 a 15 dígitos no total (E.164). Em /en e /es, sem "+"
 * é inválido (phoneNeedsCountryCode); "+55 …" segue a regra brasileira.
 */
export function isValidPhone(value: string, locale: PhoneLocale = "pt"): boolean {
  if (isInternationalPhone(value)) {
    const digits = value.replace(/\D/g, "");
    return !digits.startsWith("55") && digits.length >= 8 && digits.length <= 15;
  }
  if (phoneNeedsCountryCode(locale) && !value.trim().startsWith("+")) return false;
  return isValidPhoneBR(value);
}

/** Só caracteres de telefone, com o "+" inicial preservado; nunca reescreve os dígitos. */
function cleanPhone(value: string): string {
  const start = value.trimStart();
  const plus = start.startsWith("+");
  const rest = (plus ? start.slice(1) : start).replace(/[^\d\s().-]/g, "").replace(/\s{2,}/g, " ");
  return `${plus ? "+" : ""}${rest}`.slice(0, 24);
}

/**
 * Máscara BR progressiva: "48999998888" → "(48) 99999-8888"; aceita colar
 * "+55 48 ..." (backlog B144). Mais de 11 dígitos: devolve só os dígitos, para
 * nunca esconder o que a pessoa digitou. Número internacional ("+1 415…"):
 * sem máscara, só limpa caracteres que não são de telefone.
 */
export function formatPhoneBR(value: string): string {
  // trimStart (não trim): o espaço digitado entre o código do país e o número
  // não some enquanto a pessoa digita ("+1 " continua "+1 ").
  if (isInternationalPhone(value)) return cleanPhone(value);
  const digits = phoneDigits(value);
  if (digits.length === 0) return "";
  if (digits.length > 11) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (digits.length <= 2) return `(${ddd}`;
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const split = digits.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/**
 * Máscara do campo de telefone pelo idioma da página: em pt, a máscara BR
 * (formatPhoneBR); em /en e /es, nunca a máscara BR (o número sem "+" não é
 * tratado como brasileiro), só a limpeza de caracteres, com o "+" preservado.
 */
export function formatPhone(value: string, locale: PhoneLocale = "pt"): string {
  return phoneNeedsCountryCode(locale) ? cleanPhone(value) : formatPhoneBR(value);
}

/* ------------------------------------------------------------------ *
 * Protocolo
 * ------------------------------------------------------------------ */

/** Sem 0/O e 1/I, para ditar o código por telefone sem erro. */
export const PROTOCOL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const PROTOCOL_PATTERN = /^LEM-\d{8}-[A-HJ-NP-Z2-9]{4}$/;

function randomIndexes(count: number, size: number): number[] {
  const cryptoApi = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoApi?.getRandomValues) {
    const buffer = new Uint32Array(count);
    cryptoApi.getRandomValues(buffer);
    return Array.from(buffer, (n) => n % size);
  }
  return Array.from({ length: count }, () => Math.floor(Math.random() * size));
}

/**
 * Código do pedido "LEM-AAAAMMDD-XXXX" (BLUEPRINT §7.6), data local do
 * visitante. `random` existe para os testes.
 */
export function generateProtocol(
  date: Date = new Date(),
  random: (count: number, size: number) => number[] = randomIndexes,
): string {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = random(4, PROTOCOL_ALPHABET.length)
    .map((index) => PROTOCOL_ALPHABET[index % PROTOCOL_ALPHABET.length])
    .join("");
  return `LEM-${y}${m}${d}-${suffix}`;
}

export function isValidProtocol(value: unknown): value is string {
  return typeof value === "string" && PROTOCOL_PATTERN.test(value);
}
