/**
 * Snippet INLINE e síncrono do gtag (Google Ads + GA4) no <head> — dono:
 * shell. Só vai ao ar no build de PRODUÇÃO (src/components/shell/Analytics.astro).
 * É uma string pronta, compacta (≤ 1 KiB, critério 7 do verify-build), e o
 * teste (gtag-inline.test.ts) a executa como vai ao ar.
 *
 * Com consent = true (dados/dono.json › privacidade.baseAnuncios =
 * "consentimento", backlog B344), ANTES de gtag("js") e de qualquer config:
 *   consent default = denied em ad_storage, ad_user_data, ad_personalization e
 *   analytics_storage (wait_for_update 500) e ads_data_redaction ligado
 *   (url_passthrough NÃO: sujava todo link com ?_gl=…, D50); e, na mesma ordem síncrona, a escolha salva
 *   ("aceito" em localStorage CONSENT_KEY) vira consent update granted. Sem
 *   escolha ou com "recusado", tudo fica denied (o aviso de cookies,
 *   ConsentBanner.astro + consent.ts, pergunta).
 * Personalização de anúncios e Google Signals: só com remarketing E
 * consentimento (personalization = true); senão, false (o que a Política
 * descreve sem remarketing).
 * gtag_report_conversion(url?) é a conversão "Solicitar cotação" chamada pela
 * ilha no sucesso do envio.
 */

import { CONSENT_ACCEPTED, CONSENT_KEY } from "./storage-keys";

export interface GtagInlineOptions {
  adsId: string;
  sendTo: string;
  /** Vazio = sem GA4. */
  ga4Id: string;
  /** Consent Mode v2 com aviso de cookies (baseAnuncios = "consentimento"). */
  consent: boolean;
  /** Remarketing/personalização ligados (só vale com consent). */
  personalization: boolean;
}

/** Sinais concedidos quando a pessoa aceita (ad_personalization só com remarketing). */
export function grantedSignals(personalization: boolean): Record<string, "granted"> {
  return {
    ad_storage: "granted",
    ad_user_data: "granted",
    analytics_storage: "granted",
    ...(personalization ? { ad_personalization: "granted" as const } : {}),
  };
}

export const DENIED_SIGNALS = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

export function gtagInlineScript({ adsId, sendTo, ga4Id, consent, personalization }: GtagInlineOptions): string {
  const q = (value: unknown) => JSON.stringify(value);
  const personalize = consent && personalization;
  return [
    "window.dataLayer=window.dataLayer||[];var gtag=window.gtag=function(){window.dataLayer.push(arguments)};",
    consent
      ? `gtag("consent","default",${q({ ...DENIED_SIGNALS, wait_for_update: 500 })});` +
        // ads_data_redaction (redige o identificador de anúncio sem consentimento) sim; url_passthrough
        // NÃO (D50): ele decora todo link interno com ?_gl=…*_up*… (gclid/_ga pela URL enquanto o cookie
        // está negado), sujando a navegação. A atribuição do lead não depende disso — o site guarda
        // gclid/gbraid/wbraid no sessionStorage na chegada e os leva ao CRM; sem ele, as URLs ficam limpas.
        'gtag("set","ads_data_redaction",true);' +
        `try{if(localStorage.getItem(${q(CONSENT_KEY)})===${q(CONSENT_ACCEPTED)})gtag("consent","update",${q(grantedSignals(personalize))})}catch(e){}`
      : "",
    'gtag("js",new Date());',
    `gtag("set","allow_ad_personalization_signals",${personalize});gtag("set","allow_google_signals",${personalize});`,
    `gtag("config",${q(adsId)});`,
    ga4Id ? `gtag("config",${q(ga4Id)});` : "",
    `window.gtag_report_conversion=function(u){gtag("event","conversion",{send_to:${q(sendTo)},event_callback:function(){if(typeof u!=="undefined")window.location=u}});return false};`,
  ].join("");
}
