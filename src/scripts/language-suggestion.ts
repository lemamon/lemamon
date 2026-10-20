/**
 * Fechar o aviso de idioma (LanguageSuggestion.astro) — dono: shell. A escolha
 * vale para as próximas páginas: o script inline do <head> lê a mesma chave e
 * não grava mais <html data-lang-suggest>.
 */

import { LANG_SUGGEST_DISMISSED_KEY } from "./storage-keys";

document.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("[data-lang-suggest-dismiss]") : null;
  if (!button) return;
  document.documentElement.removeAttribute("data-lang-suggest");
  try {
    window.localStorage.setItem(LANG_SUGGEST_DISMISSED_KEY, "1");
  } catch {
    // Sem storage: o aviso some nesta página e volta na próxima.
  }
  // O foco estava no botão que sumiu: devolve ao início do conteúdo do header.
  document.querySelector<HTMLElement>(".skip-link")?.focus();
});
