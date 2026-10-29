/**
 * Listener delegado ÚNICO para os atributos de medição (CONTRACT.md §8). Dono: shell.
 *
 *   data-track="cta_click" data-cta-id data-origem   → cta_click {cta_id, origem}
 *   data-track="whatsapp_click" data-source          → whatsapp_click {source}
 *   data-track="profile_click" data-profile          → profile_click {profile}
 *   data-track="language_change" data-from-lang data-to-lang → language_change (B329)
 *
 * email_copy é disparado por src/scripts/copy-email.ts. Dentro de <astro-island>
 * (o wizard) nada é contado aqui: a ilha chama track() direto, e contar de novo
 * duplicaria o evento. track() é no-op sem GA4 (preview, local, adblock).
 *
 * Também registra o toque da sessão (rememberLanding, backlog B018): a
 * primeira página vista, o referrer externo, os utm_, o gclid e o gbraid/wbraid
 * (F81) ficam no sessionStorage, e o wizard e o /contato os enviam no campo
 * "attribution" mesmo quando a pessoa entrou pela Home e só depois foi ao
 * formulário. E, da auditoria de conversão:
 *  - F26: aba nova sem campanha adota o toque de campanha de outra aba do site
 *    aberta (BroadcastChannel, lib/analytics shareCampaignTouch). O canal
 *    fecha no pagehide (bfcache) e reabre no pageshow.
 *  - F34: com toque de campanha paga do Google, todo link wa.me com ?text=
 *    ganha a linha "Ref.: G-{campanha}" ao carregar e, de novo, no toque/clique
 *    (cobre o href trocado depois por outro script, como o do pós-envio).
 *    Link sem texto fica igual (a ilha abre a mensagem por JS, lib/whatsapp),
 *    e o link com data-campaign-ref="off" também.
 *  - F82: ?debug_analytics=1 liga o modo de conferência (lib/analytics): nada
 *    sai da aba, tudo vai para o console. Também desliga a coleta automática
 *    do GA4 (ga-disable-<id>) nas páginas seguintes da mesma aba.
 */

import { GA4_ID } from "@/config/site";
import {
  analyticsDebugEnabled,
  currentCampaignRef,
  rememberLanding,
  shareCampaignTouch,
  track,
  whatsappHrefWithRef,
  type EventParams,
} from "@/lib/analytics";

try {
  // Modo de conferência (F82): a coleta automática do GA4 também para nesta página.
  if (GA4_ID && analyticsDebugEnabled()) (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = true;
} catch {
  // Medição nunca quebra a página.
}

try {
  rememberLanding();
} catch {
  // Atribuição nunca quebra a página.
}

const WA_LINK = 'a[href^="https://wa.me/"]';

/**
 * Põe a referência da campanha (F34) no ?text= de um link wa.me. Fica de fora
 * o link com data-campaign-ref="off": a mensagem dele termina num ponto em que
 * a pessoa completa o texto ("O certo é:", do "Algum dado errado?" do pós-envio).
 */
function applyCampaignRef(anchor: HTMLAnchorElement, ref = currentCampaignRef()): void {
  if (!ref || anchor.dataset.campaignRef === "off") return;
  const href = whatsappHrefWithRef(anchor.href, ref);
  if (href !== anchor.href) anchor.href = href;
}

function applyCampaignRefToAll(): void {
  try {
    const ref = currentCampaignRef();
    if (!ref) return;
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>(WA_LINK)) applyCampaignRef(anchor, ref);
  } catch {
    // Atribuição nunca quebra a página.
  }
}

let closeChannel: (() => void) | null = null;

function openChannel(): void {
  try {
    closeChannel = shareCampaignTouch({ onAdopt: applyCampaignRefToAll });
  } catch {
    closeChannel = null;
  }
}

openChannel();
applyCampaignRefToAll();
window.addEventListener("pagehide", () => {
  closeChannel?.();
  closeChannel = null;
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted && !closeChannel) openChannel();
});

/** Toque ou clique num link wa.me (o Enter do teclado vira clique): confere a referência antes de o navegador usar o href. */
function refreshRef(event: Event): void {
  const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>(WA_LINK) : null;
  if (!target) return;
  try {
    applyCampaignRef(target);
  } catch {
    // Atribuição nunca quebra a página.
  }
}

document.addEventListener("pointerdown", refreshRef, { capture: true });

const PROFILES: readonly EventParams["profile_click"]["profile"][] = ["github", "linkedin", "medium"];

function isProfile(value: string | undefined): value is EventParams["profile_click"]["profile"] {
  return PROFILES.includes(value as EventParams["profile_click"]["profile"]);
}

function handle(event: MouseEvent): void {
  if (event.type === "auxclick" && event.button !== 1) return;
  refreshRef(event);
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track]") : null;
  if (!target || target.closest("astro-island")) return;
  const data = target.dataset;
  switch (data.track) {
    case "cta_click":
      track("cta_click", { cta_id: data.ctaId ?? "", origem: data.origem ?? "" });
      break;
    case "whatsapp_click":
      track("whatsapp_click", { source: data.source ?? "" });
      break;
    case "profile_click":
      if (isProfile(data.profile)) track("profile_click", { profile: data.profile });
      break;
    case "language_change":
      if (data.fromLang && data.toLang && data.fromLang !== data.toLang) {
        track("language_change", { from_lang: data.fromLang, to_lang: data.toLang });
      }
      break;
  }
}

document.addEventListener("click", handle, { capture: true });
// Clique do meio (abrir em nova aba) também conta.
document.addEventListener("auxclick", handle, { capture: true });
