/**
 * Retomada global do pedido — BLUEPRINT §7.1 e §8.6. Dono: shell.
 *
 * O rótulo "Continuar meu pedido" já foi trocado por CSS antes da pintura
 * (src/scripts/head-inline.ts grava <html data-draft-step>). Aqui só o destino
 * muda: os CTAs [data-resume-cta] passam a levar ao último passo salvo
 * (/orcamento?etapa=N no idioma da página, data-resume-href), e o evento de
 * clique passa a se chamar cta_click {cta_id: "resume"}.
 */

const step = document.documentElement.dataset.draftStep;

if (step) {
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[data-resume-cta][data-resume-href]")) {
    const url = new URL(link.dataset.resumeHref ?? "", window.location.origin);
    url.searchParams.set("etapa", step);
    link.href = `${url.pathname}${url.search}`;
    link.dataset.ctaId = "resume";
  }
}
