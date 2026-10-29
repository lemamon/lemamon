/**
 * Header (BLUEPRINT §8.1) — dono: shell. Melhorias progressivas; sem JS o
 * header continua navegável (o <details> abre e fecha sozinho).
 *
 * 1. Dropdown "Serviços" em <details>: abre por clique/teclado (nativo, nunca
 *    por hover), fecha com Esc (devolvendo o foco ao <summary>), com clique fora
 *    e quando o foco sai do painel.
 * 2. Estado "rolado": depois de 80px, o header ganha sombra e desfoque
 *    (03-ui §3.5.5; backlog B224). Um sentinela + IntersectionObserver, sem
 *    listener de scroll.
 */

function setupDropdowns(): void {
  const dropdowns = [...document.querySelectorAll<HTMLDetailsElement>("details[data-nav-dropdown]")];
  if (!dropdowns.length) return;

  const close = (details: HTMLDetailsElement, focusSummary = false) => {
    if (!details.open) return;
    details.open = false;
    if (focusSummary) details.querySelector<HTMLElement>("summary")?.focus();
  };

  for (const details of dropdowns) {
    details.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && details.open) {
        event.preventDefault();
        close(details, true);
      }
    });
    details.addEventListener("focusout", (event) => {
      // Só fecha quando o foco vai para OUTRO elemento fora do painel (Tab).
      // relatedTarget nulo acontece no Safari ao clicar num link do próprio
      // painel (ele não foca links no clique): fechar ali engoliria o clique.
      // Clique fora é tratado pelo listener do document.
      const next = event.relatedTarget;
      if (!(next instanceof Node) || details.contains(next)) return;
      close(details);
    });
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      for (const other of dropdowns) if (other !== details) close(other);
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    for (const details of dropdowns) {
      if (target instanceof Node && details.contains(target)) continue;
      close(details);
    }
  });
}

function setupScrolledState(): void {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const sentinel = document.querySelector<HTMLElement>("[data-scroll-sentinel]");
  if (!header || !sentinel || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(([entry]) => {
    header.dataset.scrolled = entry && !entry.isIntersecting ? "true" : "false";
  }).observe(sentinel);
}

setupDropdowns();
setupScrolledState();
