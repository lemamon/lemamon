/**
 * Impressão e PDF das páginas com CTA final (auditoria de conversão F46) —
 * dono: home. Quem avalia a Lemamon costuma imprimir ou salvar em PDF a página
 * para levar a quem decide; medido em PDF real, o título do CTA final saía em
 * #ababab (2,3:1) e 7 de 8 respostas do FAQ ficavam de fora.
 *
 * Sem CSS de impressão novo (a Home está no limite do orçamento de CSS do
 * verify-build): no `beforeprint`, as seções escuras ([data-surface="inverse"])
 * e o tema escuro voltam aos tokens claros, os FAQs fechados
 * (details[data-faq-id]) abrem e as linhas [data-print-only] (o endereço do
 * diagnóstico gratuito, no CtaFinal) aparecem; no `afterprint`, tudo volta
 * como estava. A tela nunca muda fora da impressão. Carregado pelo script do
 * Header (toda página fora do wizard), sem <script> próprio.
 */

const restore: (() => void)[] = [];

export function preparePrint(doc: Document = document): void {
  const root = doc.documentElement;
  if (root.dataset.theme === "dark") {
    delete root.dataset.theme;
    restore.push(() => (root.dataset.theme = "dark"));
  }
  for (const section of doc.querySelectorAll<HTMLElement>('[data-surface="inverse"]')) {
    section.removeAttribute("data-surface");
    restore.push(() => section.setAttribute("data-surface", "inverse"));
  }
  for (const details of doc.querySelectorAll<HTMLDetailsElement>("details[data-faq-id]:not([open])")) {
    details.open = true;
    restore.push(() => (details.open = false));
  }
  for (const line of doc.querySelectorAll<HTMLElement>("[data-print-only][hidden]")) {
    line.hidden = false;
    restore.push(() => (line.hidden = true));
  }
}

export function restoreAfterPrint(): void {
  while (restore.length > 0) restore.pop()?.();
}

window.addEventListener("beforeprint", () => preparePrint());
window.addEventListener("afterprint", restoreAfterPrint);
