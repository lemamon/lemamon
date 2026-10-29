/**
 * Barra de ação fixa (mobile < 768px) — BLUEPRINT §8.2, backlog B213. Dono: shell.
 *
 * Aparece quando o CTA do hero sai da tela por cima. O CTA do hero é o
 * [data-hero-cta] ou, sem ele, o primeiro CTA de diagnóstico do MESMO bloco do
 * H1 (a <section>/<header> que contém o H1). Sem CTA no hero (Sobre, cases,
 * blog, Política), a âncora é o próprio H1: a barra aparece assim que o H1 sai
 * da tela, e não só depois do CTA final, no fim da página. Some:
 *  - enquanto o CTA do hero está visível ou ainda não foi alcançado;
 *  - quando outro CTA de diagnóstico do <main>, um formulário visível ou um
 *    bloco [data-sticky-hide] (o rodapé) entra na tela, para nunca haver dois
 *    CTAs disputando o polegar;
 *  - com o teclado virtual aberto (campo de texto focado).
 * IntersectionObserver, sem listener de scroll. Sem JS, a barra nunca aparece.
 */

import { NAV_QUERIES } from "@/styles/breakpoints";

const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]';

const DIAGNOSIS_CTA = '[data-track="cta_click"][data-cta-id="diagnosis"]';

/** CTA do hero (ou o H1, se o hero não tem CTA): o que precisa sair da tela para a barra aparecer. */
export function heroAnchor(main: Element): HTMLElement | null {
  const explicit = main.querySelector<HTMLElement>("[data-hero-cta]");
  if (explicit) return explicit;
  const h1 = main.querySelector<HTMLElement>("h1");
  if (!h1) return main.querySelector<HTMLElement>(DIAGNOSIS_CTA);
  const hero = h1.closest("section, header, [data-hero]");
  const heroCta = hero && main.contains(hero) ? hero.querySelector<HTMLElement>(DIAGNOSIS_CTA) : null;
  return heroCta ?? h1;
}

function setupStickyBar(): void {
  const bar = document.querySelector<HTMLElement>("[data-sticky-bar]");
  if (!bar || !("IntersectionObserver" in window)) return;
  const main = document.querySelector("main");
  const anchor = main ? heroAnchor(main) : null;
  if (!anchor) return;

  let pastAnchor = false;
  let blockers = 0;
  let typing = false;
  const visibleBlockers = new Set<Element>();

  const render = () => {
    const show = pastAnchor && blockers === 0 && !typing;
    bar.dataset.state = show ? "visible" : "hidden";
  };

  new IntersectionObserver(([entry]) => {
    if (!entry) return;
    // Passou do CTA = ele saiu da tela pelo TOPO (não "ainda não chegou").
    pastAnchor = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    render();
  }).observe(anchor);

  const hideZones = [
    ...document.querySelectorAll(`main ${DIAGNOSIS_CTA}, main form:not([hidden]), [data-sticky-hide]`),
  ];
  if (hideZones.length) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleBlockers.add(entry.target);
        else visibleBlockers.delete(entry.target);
      }
      blockers = visibleBlockers.size;
      render();
    });
    for (const zone of hideZones) observer.observe(zone);
  }

  const mobile = window.matchMedia(NAV_QUERIES.mobile);
  document.addEventListener("focusin", (event) => {
    if (!mobile.matches) return;
    if (event.target instanceof Element && event.target.matches(TEXT_INPUT)) {
      typing = true;
      render();
    }
  });
  document.addEventListener("focusout", () => {
    if (!typing) return;
    typing = false;
    render();
  });

  render();
}

setupStickyBar();
