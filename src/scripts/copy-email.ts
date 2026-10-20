/**
 * "Copiar" do e-mail (CopyEmail.astro) — BLUEPRINT §5.5, §8.1, §8.5. Dono: shell.
 * Um listener delegado para todos os botões [data-copy] da página.
 *
 * - Sucesso: o botão mostra "Copiado" por alguns segundos (os dois rótulos
 *   ocupam a mesma célula, sem mudar a largura) e a região aria-live do próprio
 *   componente anuncia "E-mail copiado"; evento email_copy {source}.
 * - Sem a API de clipboard (contexto inseguro, permissão negada): seleciona o
 *   endereço para a pessoa copiar e anuncia a instrução (data-failed-label).
 */

import { track } from "@/lib/analytics";

const RESET_MS = 2500;
const timers = new WeakMap<HTMLElement, number>();

function selectAddress(root: HTMLElement): void {
  const address = root.querySelector("[data-copy-address]");
  const selection = window.getSelection();
  if (!address || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(address);
  selection.removeAllRanges();
  selection.addRange(range);
}

function announce(status: HTMLElement | null, text: string): void {
  if (!status) return;
  // Esvaziar antes garante o anúncio em cliques repetidos.
  status.textContent = "";
  window.setTimeout(() => {
    status.textContent = text;
  }, 50);
}

document.addEventListener("click", async (event) => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-copy]") : null;
  if (!button) return;
  const root = button.closest<HTMLElement>("[data-copy-email]") ?? button.parentElement;
  if (!root) return;
  const status = root.querySelector<HTMLElement>("[data-copy-status]");
  const text = button.dataset.copy ?? "";

  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    selectAddress(root);
    announce(status, button.dataset.failedLabel ?? "");
    return;
  }

  announce(status, button.dataset.copiedLabel ?? "");
  root.dataset.copied = "true";
  window.clearTimeout(timers.get(root));
  timers.set(
    root,
    window.setTimeout(() => {
      delete root.dataset.copied;
    }, RESET_MS),
  );
  track("email_copy", { source: button.dataset.source ?? "" });
});
