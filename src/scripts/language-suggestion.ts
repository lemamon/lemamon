/**
 * Fechar o aviso de idioma (LanguageSuggestion.astro) — dono: shell. A escolha
 * vale para as próximas páginas: o script inline do <head> lê a mesma chave e
 * não grava mais <html data-lang-suggest>.
 *
 * Na entrada do wizard (auditoria F31), trocar de idioma pelo aviso ou pelo
 * seletor do rodapé mínimo mantém a query da URL (?servico=, ?origem=, ?ref=,
 * UTMs e ids de clique), menos o passo (?etapa=): a pré-marcação e a
 * atribuição da visita seguem para o outro idioma.
 */

import { LANG_SUGGEST_DISMISSED_KEY } from "./storage-keys";

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const link = target?.closest<HTMLAnchorElement>("a[data-to-lang]");
  if (link && document.body.dataset.layout === "wizard") {
    const query = new URLSearchParams(window.location.search);
    query.delete("etapa");
    const url = new URL(link.href);
    url.search = query.toString();
    link.href = url.href;
  }
  const button = target?.closest("[data-lang-suggest-dismiss]");
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
