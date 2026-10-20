/**
 * Drawer de navegação (< 1024px) — BLUEPRINT §8.1, backlog B205. Dono: shell.
 *
 * <dialog> nativo aberto com showModal(): o resto da página fica inerte, o
 * leitor de tela anuncia um diálogo modal e Esc dispara "cancel". Por cima disso:
 *  - focus trap explícito (Tab/Shift+Tab circulam dentro do drawer);
 *  - fecha com Esc, com o botão "Fechar menu", com clique no fundo e ao seguir
 *    um link interno;
 *  - devolve o foco ao botão "Menu" e mantém aria-expanded em dia;
 *  - fecha sozinho se a janela passar para o layout desktop (≥ 1024px).
 */

import { NAV_QUERIES } from "@/styles/breakpoints";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const isVisible = (el: Element) => el.getClientRects().length > 0;

function setupDrawer(): void {
  const dialog = document.querySelector<HTMLDialogElement>("dialog[data-drawer]");
  const toggles = [...document.querySelectorAll<HTMLButtonElement>("[data-drawer-open]")];
  if (!dialog || !toggles.length || typeof dialog.showModal !== "function") return;

  let opener: HTMLElement | null = null;

  const setExpanded = (value: boolean) => {
    for (const toggle of toggles) toggle.setAttribute("aria-expanded", String(value));
  };

  const focusables = () =>
    [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => isVisible(el) || el === document.activeElement);

  const open = (trigger: HTMLElement) => {
    if (dialog.open) return;
    opener = trigger;
    dialog.showModal();
    setExpanded(true);
    dialog.querySelector<HTMLElement>("[data-drawer-close]")?.focus();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  for (const toggle of toggles) {
    toggle.addEventListener("click", () => open(toggle));
  }

  dialog.addEventListener("close", () => {
    setExpanded(false);
    const target = opener && isVisible(opener) ? opener : toggles.find(isVisible);
    target?.focus();
    opener = null;
  });

  dialog.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    // Clique no fundo (fora do painel): o alvo é o próprio <dialog>.
    if (target === dialog) {
      close();
      return;
    }
    if (target?.closest("[data-drawer-close]")) {
      close();
      return;
    }
    const link = target?.closest<HTMLAnchorElement>("a[href]");
    if (link && link.target !== "_blank") close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const desktop = window.matchMedia(NAV_QUERIES.desktop);
  desktop.addEventListener("change", (event) => {
    if (event.matches) close();
  });
}

setupDrawer();
