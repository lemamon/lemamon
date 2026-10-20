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
 * primeira página vista, o referrer externo, os utm_ e o gclid ficam no
 * sessionStorage, e o wizard os envia no campo "attribution" mesmo quando a
 * pessoa entrou pela Home e só depois foi ao /orcamento.
 */

import { rememberLanding, track, type EventParams } from "@/lib/analytics";

try {
  rememberLanding();
} catch {
  // Atribuição nunca quebra a página.
}

const PROFILES: readonly EventParams["profile_click"]["profile"][] = ["github", "linkedin", "medium"];

function isProfile(value: string | undefined): value is EventParams["profile_click"]["profile"] {
  return PROFILES.includes(value as EventParams["profile_click"]["profile"]);
}

function handle(event: MouseEvent): void {
  if (event.type === "auxclick" && event.button !== 1) return;
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
