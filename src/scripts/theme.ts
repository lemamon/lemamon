/**
 * Botão de tema (backlog B208) — dono: shell. O tema da 1ª pintura já foi
 * decidido pelo script inline do <head> (head-inline.ts: escolha salva ou
 * prefers-color-scheme); aqui só ficam a troca manual e a sincronia:
 *
 *  - cada [data-theme-toggle] (rodapé e menu) é um botão com aria-pressed =
 *    "true" quando o tema escuro está ligado; o clique alterna
 *    <html data-theme="dark">, grava a escolha em localStorage["lemamon-theme"]
 *    ("dark" | "light") e atualiza todos os botões da página;
 *  - sem escolha salva, a página acompanha o sistema se ele mudar de tema com a
 *    página aberta;
 *  - outra aba mudou o tema (evento storage): esta acompanha.
 * Tudo em try/catch: sem storage, a troca vale só para a página aberta.
 */

import { THEME_DARK, THEME_KEY, THEME_LIGHT } from "./storage-keys";

type Theme = typeof THEME_DARK | typeof THEME_LIGHT;

const root = document.documentElement;
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

function savedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === THEME_DARK || value === THEME_LIGHT ? value : null;
  } catch {
    return null;
  }
}

function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Sem storage: a escolha vale só para esta página.
  }
}

export function currentTheme(): Theme {
  return root.dataset.theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;
}

export function applyTheme(theme: Theme): void {
  if (theme === THEME_DARK) root.dataset.theme = THEME_DARK;
  else delete root.dataset.theme;
  for (const button of document.querySelectorAll<HTMLElement>("[data-theme-toggle]")) {
    button.setAttribute("aria-pressed", String(theme === THEME_DARK));
  }
}

function setupTheme(): void {
  applyTheme(currentTheme());

  document.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest("[data-theme-toggle]");
    if (!button) return;
    const next: Theme = currentTheme() === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    applyTheme(next);
    saveTheme(next);
  });

  try {
    window.matchMedia(SYSTEM_DARK).addEventListener("change", (event) => {
      if (!savedTheme()) applyTheme(event.matches ? THEME_DARK : THEME_LIGHT);
    });
  } catch {
    // Navegador sem matchMedia: fica o tema da 1ª pintura.
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== THEME_KEY) return;
    const theme = savedTheme();
    if (theme) applyTheme(theme);
  });
}

setupTheme();
