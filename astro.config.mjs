// @ts-check
/**
 * Astro — site estático da Lemamon (dono: shell). Ver docs/arquitetura/CONTRACT.md.
 *
 * POLÍTICA DE URL (única):
 *   build.format "preserve" + trailingSlash "ignore".
 *   - src/pages/en/index.astro → dist/en/index.html → URL canônica "/en/"
 *   - src/pages/contato.astro  → dist/contato.html  → URL canônica "/contato"
 *   Raízes de idioma terminam em "/"; o resto nunca tem barra final nem ".html".
 *   O Netlify serve x.html em "/x" e dir/index.html em "/dir/" e redireciona a
 *   outra variante. Canonical, hreflang, sitemap e links internos saem de
 *   src/config/routes.ts (urlFor/canonicalUrl/alternates), nunca de string solta.
 *   "ignore" mantém o dev server aceitando as duas variantes, como o Netlify.
 *
 * DADOS DO DONO: dados/dono.json (src/config/dono.ts). dadosFicticios() liga a
 * camada fictícia (dados/dono.ficticio.json) só com PUBLIC_DADOS_FICTICIOS=true
 * fora de produção e confere o dist/ depois do build (ver docs/playbooks/00).
 */
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import { alternates, isNoindexPath, matchRoute, normalizePath, SITE_URL } from "./src/config/routes.ts";
import csp from "./src/integrations/csp.ts";
import dadosFicticios from "./src/integrations/dados-ficticios.ts";
import mapasDeConteudo from "./src/integrations/mapas-de-conteudo.ts";
import verifyBuild from "./src/integrations/verify-build.ts";
import wizardCss from "./src/integrations/wizard-css.ts";

/**
 * CSS abaixo deste tamanho (bytes, minificado) vai INLINE no <head> em vez de
 * virar um <link> que bloqueia a pintura (backlog B094). O padrão do Vite/Astro
 * é 4096 e deixava de fora, por poucas centenas de bytes, folhas que quase
 * toda página baixa (SectionHeader ≈ 4,5 kB, a da Sprint ≈ 4,9 kB): cada uma
 * custava um pedido a mais no caminho crítico e ~1 KiB gzip num arquivo
 * separado, comprimido sozinho. Inline, comprimem junto com o resto do HTML.
 * Folha maior (Base, HomeView, MethodTimeline…) continua em /_astro/ com cache
 * imutável. O teto do HTML (25 KiB gzip, verify-build) segura o efeito colateral.
 * Só CSS: para o resto (scripts, imagens, fontes) a função devolve undefined e
 * vale o padrão de 4096.
 */
const CSS_INLINE_LIMIT = 5 * 1024;

export default defineConfig({
  site: SITE_URL,
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "preserve",
  },
  vite: {
    build: {
      assetsInlineLimit: (filePath, content) => (filePath.endsWith(".css") ? content.length < CSS_INLINE_LIMIT : undefined),
    },
  },
  // Blocos ``` de MDX (blog e cases; o mdx() herda): tema "css-variables" do
  // Shiki, com a paleta da marca nos tokens --astro-code-* (tokens.css §6c).
  // Sem isso o Astro usa "github-dark", com cores inline que vencem o CSS (B218).
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
  integrations: [
    dadosFicticios(),
    // Dev: refaz .astro/content-*.mjs depois que outro build os sobrescreve.
    mapasDeConteudo(),
    react(),
    mdx(),
    sitemap({
      // Fora do sitemap: 404, /orcamento/enviado e equivalentes (noindex em routes.ts).
      // Páginas when_data sem dado nem são geradas, então não entram.
      filter: (page) => !isNoindexPath(new URL(page).pathname),
      serialize: (item) => {
        const pathname = normalizePath(new URL(item.url).pathname);
        const match = matchRoute(pathname);
        const links = match ? alternates(match.key, match.params) : [];
        return {
          ...item,
          url: new URL(pathname, SITE_URL).href,
          links: links.map((link) => ({ lang: link.hreflang, url: link.href })),
        };
      },
    }),
    // Antes do verify-build (que mede o resultado): as páginas do wizard linkam
    // uma versão do Base.*.css sem as regras do chrome do site (B094).
    wizardCss(),
    verifyBuild(),
    // Depois das conferências: grava dist/_headers com a CSP e os hashes dos scripts inline (B254).
    csp(),
  ],
});
