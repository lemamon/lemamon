/**
 * Páginas when_data (BLUEPRINT §6.10–6.12): com o dado real do repositório
 * (coleções vazias), getStaticPaths não gera NENHUMA rota — sem HTML, sem
 * sitemap, sem hreflang. O integrador confere de novo no dist/ (gates-no-fixtures).
 */
import { describe, expect, it } from "vitest";

const pages = {
  "pages/[gated].astro (pt: /cases, /sobre, /blog)": () => import("@/pages/[gated].astro"),
  "pages/en/[gated].astro (/en/cases, /en/about)": () => import("@/pages/en/[gated].astro"),
  "pages/es/[gated].astro (/es/casos, /es/nosotros)": () => import("@/pages/es/[gated].astro"),
  "pages/cases/[slug].astro": () => import("@/pages/cases/[slug].astro"),
  "pages/en/cases/[slug].astro": () => import("@/pages/en/cases/[slug].astro"),
  "pages/es/casos/[slug].astro": () => import("@/pages/es/casos/[slug].astro"),
  "pages/blog/[slug].astro": () => import("@/pages/blog/[slug].astro"),
};

describe("sem dado, nenhuma página when_data é gerada", () => {
  it.each(Object.entries(pages))("%s", async (_name, load) => {
    const mod = (await load()) as { getStaticPaths: () => Promise<unknown[]> };
    expect(await mod.getStaticPaths()).toEqual([]);
  });
});
