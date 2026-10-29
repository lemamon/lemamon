/**
 * WhatsApp flutuante (BLUEPRINT §8.3) — dono: shell. Sai de cena quando o
 * rodapé entra na tela: o rodapé já tem o próprio botão de WhatsApp, e o
 * flutuante cobriria o seletor de idioma no canto inferior direito.
 */

const float = document.querySelector<HTMLElement>("[data-whatsapp-float]");
const footer = document.querySelector("[data-sticky-hide]");

if (float && footer && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    float.dataset.state = entry?.isIntersecting ? "hidden" : "visible";
  }).observe(footer);
}
