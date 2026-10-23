/**
 * Constantes do site e leitura do ambiente (dono: shell). Seguro para o cliente.
 *
 * Variáveis públicas (Netlify > Site configuration > Environment variables):
 *   PUBLIC_WHATSAPP_NUMBER  só dígitos, ex. 5511999999999. Vazio = nenhum botão de WhatsApp.
 *   PUBLIC_GA4_ID           G-XXXXXXXXXX. Vazio = nenhum evento GA4.
 * As antigas VITE_* não existem mais.
 *
 * O Netlify define CONTEXT (production | deploy-preview | branch-deploy) no
 * build. Tags de medição de produção (Google Ads, New Relic) só carregam com
 * CONTEXT = production, para preview nunca gerar conversão (backlog B277).
 */

export { SITE_URL } from "./routes";

export const SITE_NAME = "Lemamon.dev";

/**
 * Cor do navegador (<meta name="theme-color"> e manifest.json): é a ink-800 de
 * src/styles/tokens.css. Meta tag e manifest não leem CSS custom property,
 * então o valor literal mora aqui e no public/manifest.json (o teste
 * shell-assets confere que os dois batem).
 */
export const THEME_COLOR = "#18216d";

/**
 * Endereço no nível de cidade (BLUEPRINT §1.5): fato confirmado, usado só em
 * dado estruturado (JSON-LD). O texto visível vem do i18n.
 */
export const ADDRESS = {
  locality: "São Paulo",
  region: "SP",
  country: "BR",
} as const;

/** Script do New Relic Browser (public/scripts/newrelic.js), injetado depois do load só em produção (Analytics.astro, F56). */
export const NEW_RELIC_SCRIPT = "/scripts/newrelic.js";

/** Dígitos do WhatsApp de destino. */
export const WHATSAPP_NUMBER: string = (import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

/** Número brasileiro completo: 55 + DDD + número (12 ou 13 dígitos). */
export function hasWhatsappNumber(number: string = WHATSAPP_NUMBER): boolean {
  return /^55\d{10,11}$/.test(number);
}

/** Measurement ID do GA4. */
export const GA4_ID: string = (import.meta.env.PUBLIC_GA4_ID ?? "").trim();

/** Contexto de deploy do Netlify; "local" fora do Netlify. Só faz sentido no build (servidor). */
export function deployContext(): string {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.CONTEXT ?? "local";
}

/** true só no build de produção do Netlify. */
export function isProductionDeploy(): boolean {
  return import.meta.env.PROD && deployContext() === "production";
}

/**
 * Google Ads (conversão "Solicitar cotação", BLUEPRINT §1.6 e §10.2). IDs
 * públicos, herdados do index.html do app React antigo (removido na Onda 2).
 * Disparo por evento no sucesso do envio.
 */
export const GOOGLE_ADS = {
  id: "AW-16881353870",
  conversionSendTo: "AW-16881353870/cEi0CLmh9Z8aEI6J1PE-",
} as const;
