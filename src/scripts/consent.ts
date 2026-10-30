/**
 * Aviso de cookies com Consent Mode v2 (backlog B344) — dono: shell. Só existe
 * na página quando dados/dono.json › privacidade.baseAnuncios = "consentimento"
 * (ConsentBanner.astro); o consent default denied já foi emitido pelo snippet
 * do gtag no <head> (src/scripts/gtag-inline.ts), antes de qualquer config.
 *
 *  - Sem escolha salva: mostra o aviso (não modal; [hidden] até aqui, então sem
 *    JS ele nunca aparece e tudo fica denied).
 *  - "Aceitar": consent update granted (ad_storage, ad_user_data,
 *    analytics_storage; ad_personalization só com remarketing) e carrega o New
 *    Relic (só em produção: data-nr-src) e os pixels opcionais configurados
 *    (LinkedIn Insight Tag, Meta Pixel: data-linkedin-partner-id /
 *    data-meta-pixel-id, só em produção; B346/B347; ./pixels.ts). Nada disso
 *    carrega antes do aceite nem depois da recusa. "Recusar": update denied E apaga os
 *    cookies de medição e de anúncio que um aceite anterior deixou (_ga*,
 *    _gid, _gat*, _gcl_*; dos pixels, _fbp, _fbc, li_fat_id, li_giant, ln_or),
 *    no host e em cada domínio pai (o GA4 e o Ads gravam
 *    em .lemamon.dev), mais a sessão do New Relic (NRBA*) no storage: retirar o
 *    consentimento não deixa cookie de anúncio para trás (a Política promete
 *    que dá para retirá-lo quando quiser). Com a recusa salva, a limpeza se
 *    repete a cada página. A escolha vale em todas as páginas (localStorage
 *    CONSENT_KEY).
 *  - "Preferências de cookies" (rodapé, [data-consent-open]) e o link
 *    {preferencias_de_cookies} da Política (#preferencias-de-cookies) reabrem o
 *    aviso com o foco no primeiro botão.
 *  - Enquanto o aviso está aberto, <html data-consent-open> e a variável
 *    --consent-height reservam o espaço dele no fim da página (nada fica
 *    escondido atrás dele) e a barra fixa e o WhatsApp flutuante saem de cena.
 * Tudo em try/catch: sem storage, o aviso aparece a cada página e nada quebra.
 */

import { loadLinkedInInsight, loadMetaPixel, PIXEL_COOKIE, revokeMetaPixel } from "./pixels";
import { CONSENT_ACCEPTED, CONSENT_DECLINED, CONSENT_KEY } from "./storage-keys";

type Gtag = (...args: unknown[]) => void;
type Choice = typeof CONSENT_ACCEPTED | typeof CONSENT_DECLINED;

const DENIED = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" };

export const PREFERENCES_HASH = "#preferencias-de-cookies";

/** Cookies que o gtag (GA4 e Google Ads) grava com o consentimento. */
export const TRACKING_COOKIE = /^(_ga|_ga_.+|_gid|_gat.*|_gcl_au|_gcl_aw|_gcl_dc|_gcl_gb|_gcl_gs|_gcl_ag)$/;

/** Prefixo das chaves de sessão do New Relic (browser agent) em local/sessionStorage. */
const NEW_RELIC_STORAGE_PREFIX = "NRBA";

/**
 * Domínios em que um cookie de medição pode estar: o próprio host (cookie
 * host-only) e cada sufixo com pelo menos 2 rótulos ("www.lemamon.dev" →
 * ".www.lemamon.dev", ".lemamon.dev"). IP e "localhost" só no host.
 */
export function cookieDomains(hostname: string): string[] {
  const domains = [""];
  if (/^\d+(\.\d+){3}$/.test(hostname) || hostname.includes(":")) return domains;
  const labels = hostname.split(".").filter(Boolean);
  for (let i = 0; i <= labels.length - 2; i++) domains.push(`; domain=.${labels.slice(i).join(".")}`);
  return domains;
}

/** Apaga os cookies de medição/anúncio e a sessão do New Relic (recusa, B344). */
export function purgeTrackingData(): void {
  try {
    const names = document.cookie
      .split(";")
      .map((part) => part.split("=")[0]?.trim() ?? "")
      .filter((name) => TRACKING_COOKIE.test(name) || PIXEL_COOKIE.test(name));
    const domains = cookieDomains(window.location.hostname);
    for (const name of new Set(names)) {
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
      }
    }
  } catch {
    // Cookies bloqueados: não há o que apagar.
  }
  for (const area of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[area];
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(NEW_RELIC_STORAGE_PREFIX)) keys.push(key);
      }
      for (const key of keys) storage.removeItem(key);
    } catch {
      // Sem storage: nada guardado.
    }
  }
}

function readChoice(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Sem storage: a escolha vale só para esta página.
  }
}

function setupConsent(): void {
  const banner = document.querySelector<HTMLElement>("[data-consent-banner]");
  if (!banner) return;
  const root = document.documentElement;
  const nrSrc = banner.dataset.nrSrc;
  // Pixels opcionais (B346/B347): o atributo só existe em produção, com o ID e consentimento.
  const linkedinPartnerId = banner.dataset.linkedinPartnerId;
  const metaPixelId = banner.dataset.metaPixelId;
  const personalization = banner.dataset.personalization === "true";
  const fixed = banner.dataset.placement === "fixed";

  const gtag = (...args: unknown[]) => (window as unknown as { gtag?: Gtag }).gtag?.(...args);

  const loadNewRelic = () => {
    if (!nrSrc || document.querySelector(`script[src="${nrSrc}"]`)) return;
    const script = document.createElement("script");
    script.src = nrSrc;
    script.defer = true;
    document.head.append(script);
  };

  /** Tudo o que só carrega com o aceite: New Relic e os pixels configurados. */
  const loadAccepted = () => {
    loadNewRelic();
    if (linkedinPartnerId) loadLinkedInInsight(linkedinPartnerId);
    if (metaPixelId) loadMetaPixel(metaPixelId);
  };

  const reserveSpace = () => {
    if (fixed) root.style.setProperty("--consent-height", `${banner.offsetHeight}px`);
  };

  const show = (focus: boolean) => {
    banner.hidden = false;
    root.setAttribute("data-consent-open", "");
    reserveSpace();
    if (focus) banner.querySelector<HTMLElement>("[data-consent-choice]")?.focus();
  };

  const hide = () => {
    banner.hidden = true;
    root.removeAttribute("data-consent-open");
    root.style.removeProperty("--consent-height");
  };

  const apply = (choice: Choice) => {
    if (choice === CONSENT_ACCEPTED) {
      gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        analytics_storage: "granted",
        ...(personalization ? { ad_personalization: "granted" } : {}),
      });
      loadAccepted();
    } else {
      gtag("consent", "update", DENIED);
      revokeMetaPixel();
      purgeTrackingData();
    }
  };

  const saved = readChoice();
  if (saved === CONSENT_ACCEPTED) loadAccepted();
  if (saved === CONSENT_DECLINED) purgeTrackingData();
  if (saved !== CONSENT_ACCEPTED && saved !== CONSENT_DECLINED) show(false);

  banner.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>("[data-consent-choice]");
    if (!button) return;
    const choice: Choice = button.dataset.consentChoice === "accept" ? CONSENT_ACCEPTED : CONSENT_DECLINED;
    saveChoice(choice);
    apply(choice);
    hide();
  });

  document.addEventListener("click", (event) => {
    const opener = (event.target as Element | null)?.closest(`[data-consent-open], a[href="${PREFERENCES_HASH}"]`);
    // O <html> (root) carrega data-consent-open como ESTADO (aviso aberto), não é
    // gatilho: com o aviso aberto, closest() subiria até ele em QUALQUER clique e
    // barraria todos os links. Só o botão do rodapé e o link da Política reabrem.
    if (!opener || opener === root) return;
    event.preventDefault();
    show(true);
  });

  if (fixed && "ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (!banner.hidden) reserveSpace();
    }).observe(banner);
  }
}

setupConsent();
