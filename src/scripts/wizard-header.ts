/**
 * Header do wizard (/orcamento*) — BLUEPRINT §8.4. Dono: shell.
 *
 * A ilha do wizard desenha "Pergunta N de 6" no alvo [data-wizard-progress]
 * quando entra no modo foco (contrato com o agente conversion). Este script só
 * acompanha esse alvo:
 *  - com conteúdo (modo foco), o logo passa a se chamar "Lemamon, voltar à
 *    página inicial" (shared.focus_header.logo_label_saved);
 *  - com rascunho gravado no navegador, o logo ganha aria-describedby com
 *    "Suas respostas ficam salvas neste navegador." (logo_saved_hint), que só
 *    pode existir quando o storage funciona (i18n _notes.focus_header).
 */

import { DRAFT_KEY } from "@/lib/draft";

function hasDraft(): boolean {
  try {
    return window.localStorage.getItem(DRAFT_KEY) !== null;
  } catch {
    return false;
  }
}

function setupWizardHeader(): void {
  const header = document.querySelector<HTMLElement>("[data-wizard-header]");
  const progress = header?.querySelector<HTMLElement>("[data-wizard-progress]");
  const logo = header?.querySelector<HTMLAnchorElement>("[data-wizard-logo]");
  const hint = header?.querySelector<HTMLElement>("[data-wizard-logo-hint]");
  if (!header || !progress || !logo) return;

  const defaultLabel = logo.getAttribute("aria-label") ?? "";
  const focusLabel = logo.dataset.focusLabel ?? defaultLabel;

  const sync = () => {
    const focusMode = progress.childElementCount > 0 || (progress.textContent ?? "").trim() !== "";
    header.dataset.mode = focusMode ? "focus" : "entry";
    logo.setAttribute("aria-label", focusMode ? focusLabel : defaultLabel);
    if (focusMode && hint && hasDraft()) logo.setAttribute("aria-describedby", hint.id);
    else logo.removeAttribute("aria-describedby");
  };

  new MutationObserver(sync).observe(progress, { childList: true, subtree: true, characterData: true });
  sync();
}

setupWizardHeader();
