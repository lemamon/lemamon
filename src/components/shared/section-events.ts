/**
 * Eventos de leitura de página (dono: home). SEGURO PARA O CLIENTE: só
 * importa lib/analytics (sem i18n, sem astro:*). Chamado pelos <script> do
 * Investment.astro (pricing_view) e das views de entrada (Home, serviços,
 * hub de serviços, como trabalhamos, Sprint de Descoberta e quanto custa:
 * scroll_depth e faq_open; auditoria de conversão F84, para ler o funil antes
 * de ligar o Ads). Fora do /contato (o JS dele, com o aviso de cookies e os
 * pixels, fica perto do teto de 12 KiB do verify-build) e do /orcamento (o
 * wizard tem o funil próprio e está no teto da ilha).
 *
 * - pricing_view {origem} (B118): a seção de investimento ficou visível,
 *   uma vez por página. Só existe com hasPricing (a seção só renderiza com
 *   preço publicado), então sem precos não há evento.
 * - scroll_depth {percent, page_path} (B327): o fim da tela passou de 25,
 *   50, 75 e 90% da altura do <main>, uma vez por SESSÃO por limiar
 *   (sessionStorage `lemamon:scroll:{path}:{percent}`). A medição aprimorada
 *   do GA4 só registra 90%.
 * - faq_open {faq_id, page_path} (F84): a pessoa abriu uma pergunta do FAQ
 *   (clique ou teclado no <summary> de um details[data-faq-id] fechado), uma
 *   vez por pergunta por carregamento. A 1ª pergunta, que já vem aberta, e a
 *   abertura para impressão (print.ts) não contam: só o clique conta.
 *
 * Os dois nomes entram em EventParams (lib/analytics.ts, dono: conversion) e
 * em BLUEPRINT §7.11. Até lá, `send` chama o mesmo track() sem a checagem de
 * nome do TypeScript; os parâmetros continuam tipados aqui.
 */
import { track } from "@/lib/analytics";

export const SCROLL_DEPTH_PERCENTS = [25, 50, 75, 90] as const;
export type ScrollDepthPercent = (typeof SCROLL_DEPTH_PERCENTS)[number];

export interface SectionEventParams {
  pricing_view: { origem: string };
  scroll_depth: { percent: ScrollDepthPercent; page_path: string };
  faq_open: { faq_id: string; page_path: string };
}

function send<K extends keyof SectionEventParams>(name: K, params: SectionEventParams[K]): void {
  (track as unknown as (name: string, params: SectionEventParams[K]) => void)(name, params);
}

/* ---------------------------------------------------------------- *
 * pricing_view
 * ---------------------------------------------------------------- */

/**
 * "Visível" = metade da seção na tela, ou, se ela for mais alta que a tela
 * (várias linhas no mobile), metade da tela ocupada por ela. Com threshold
 * fixo de 0.5 uma seção de 2+ telas nunca dispararia.
 */
export function isSectionSeen(visibleHeight: number, targetHeight: number, viewportHeight: number): boolean {
  if (targetHeight <= 0 || viewportHeight <= 0) return false;
  return visibleHeight >= Math.min(targetHeight, viewportHeight) * 0.5;
}

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

/** Observa os [data-pricing-view] da página; envia UM pricing_view e para. */
export function observePricingView(root: ParentNode = document): void {
  const targets = [...root.querySelectorAll<HTMLElement>("[data-pricing-view]")];
  if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;
  let sent = false;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (sent || !entry.isIntersecting) continue;
        const viewport = entry.rootBounds?.height ?? window.innerHeight;
        if (!isSectionSeen(entry.intersectionRect.height, entry.boundingClientRect.height, viewport)) continue;
        sent = true;
        observer.disconnect();
        send("pricing_view", { origem: (entry.target as HTMLElement).dataset.pricingView ?? "" });
      }
    },
    { threshold: THRESHOLDS },
  );
  for (const target of targets) observer.observe(target);
}

/* ---------------------------------------------------------------- *
 * scroll_depth
 * ---------------------------------------------------------------- */

/** Quanto do <main> já passou pelo fim da tela, em % (pode passar de 100). */
export function scrollDepthPercent(mainTop: number, mainHeight: number, viewportHeight: number): number {
  if (mainHeight <= 0) return 0;
  return ((viewportHeight - mainTop) / mainHeight) * 100;
}

/** Limiares cruzados agora e ainda não enviados. */
export function crossedThresholds(depth: number, pending: Iterable<ScrollDepthPercent>): ScrollDepthPercent[] {
  return [...pending].filter((percent) => depth >= percent).sort((a, b) => a - b);
}

export const scrollDepthKey = (path: string, percent: ScrollDepthPercent): string =>
  `lemamon:scroll:${path}:${percent}`;

function readFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string): void {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* sem storage (aba privada, bloqueio): conta só nesta carga da página */
  }
}

/**
 * Mede a rolagem do <main>: equivalente a sentinelas em 25/50/75/90% da
 * altura dele, mas recalculado a cada quadro de rolagem (acompanha o FAQ
 * abrindo e imagens carregando). Desliga sozinho quando os 4 saíram.
 */
export function initScrollDepth(): void {
  const main = document.querySelector("main");
  if (!main) return;
  const path = window.location.pathname;
  const pending = new Set<ScrollDepthPercent>(
    SCROLL_DEPTH_PERCENTS.filter((percent) => !readFlag(scrollDepthKey(path, percent))),
  );
  if (pending.size === 0) return;

  let frame = 0;
  const stop = () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
  const check = () => {
    frame = 0;
    const rect = main.getBoundingClientRect();
    const depth = scrollDepthPercent(rect.top, rect.height, window.innerHeight);
    for (const percent of crossedThresholds(depth, pending)) {
      pending.delete(percent);
      writeFlag(scrollDepthKey(path, percent));
      send("scroll_depth", { percent, page_path: path });
    }
    if (pending.size === 0) stop();
  };
  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(check);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  schedule();
}

/* ---------------------------------------------------------------- *
 * faq_open
 * ---------------------------------------------------------------- */

/**
 * Mede a abertura de cada pergunta do FAQ (F84). No clique do <summary> o
 * details ainda está no estado anterior (o toggle é a ação padrão, depois do
 * evento): só conta quem estava fechado. Enter e Espaço no summary também
 * disparam click.
 */
export function observeFaqOpen(root: Document = document): void {
  const seen = new Set<string>();
  root.addEventListener("click", (event) => {
    const summary = event.target instanceof Element ? event.target.closest("summary") : null;
    const details = summary?.parentElement;
    if (!(details instanceof HTMLDetailsElement) || details.open) return;
    const id = details.dataset.faqId;
    if (!id || seen.has(id)) return;
    seen.add(id);
    send("faq_open", { faq_id: id, page_path: window.location.pathname });
  });
}
