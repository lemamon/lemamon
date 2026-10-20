/**
 * CSS de componente when_data só na página que o RENDERIZA (B256), embutido
 * no HTML para comprimir junto com o resto da página (B094) —
 * components/ui/RenderedStyle.astro. Dono: home.
 *
 *  - o <style data-rendered-style> sai uma vez por página (registro em
 *    Astro.locals), antes da 1ª instância;
 *  - no build de produção sem dado do dono (globalSetup: dist-sem-ficticio), a
 *    Home não carrega NADA do CSS de case, badge, depoimento, time, logos e
 *    investimento — nem embutido, nem como <link>, nem dentro do pacote;
 *  - no build com a camada fictícia (dist-com-ficticio), a Home renderiza
 *    essas seções e cada folha entra UMA vez, já processada (minificada, sem
 *    comentário), e nenhuma delas vira arquivo separado em /_astro/.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, inject, it } from "vitest";

import Badge from "@/components/ui/Badge.astro";
import RenderedStyle from "@/components/ui/RenderedStyle.astro";

import type {} from "./support/builds-dos-dados";

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

/** Folhas carregadas só ao renderizar, e um seletor exclusivo de cada uma. */
const RENDERED = {
  CaseCard: ".case-card__media",
  Badge: '.badge[data-variant="solid"]',
  TestimonialCard: ".testimonial__quote",
  TeamCard: ".team-card__links",
  LogoWall: ".logo-wall",
  Investment: ".inv__row",
} as const;

describe("RenderedStyle — um <style> por página", () => {
  it("a 1ª instância emite o <style>; a 2ª, na MESMA página (mesmo Astro.locals), não", async () => {
    const locals = {};
    const first = await container.renderToString(RenderedStyle, { props: { css: ".x{color:red}", name: "X" }, locals });
    const second = await container.renderToString(RenderedStyle, { props: { css: ".x{color:red}", name: "X" }, locals });
    const other = await container.renderToString(RenderedStyle, { props: { css: ".y{color:red}", name: "Y" }, locals });
    expect(first).toBe('<style data-rendered-style="X">.x{color:red}</style>');
    expect(second).toBe("");
    expect(other).toContain('data-rendered-style="Y"');
  });

  it("outra página (outro Astro.locals) recebe o <style> de novo", async () => {
    const a = await container.renderToString(RenderedStyle, { props: { css: ".x{}", name: "X" }, locals: {} });
    const b = await container.renderToString(RenderedStyle, { props: { css: ".x{}", name: "X" }, locals: {} });
    expect(a).toContain("<style");
    expect(b).toContain("<style");
  });

  it("CSS vazio (sem pipeline de CSS, como no Vitest) não gera <style> vazio", async () => {
    expect(await container.renderToString(RenderedStyle, { props: { css: "", name: "X" }, locals: {} })).toBe("");
    // O Badge continua renderizando; o <style> dele só existe com o CSS do build (ver abaixo).
    const html = await container.renderToString(Badge, { props: { variant: "solid" }, slots: { default: "Sistemas web" } });
    expect(html).toMatch(/<span class="badge" data-variant="solid">Sistemas web<\/span>/);
    expect(html).not.toMatch(/<style[^>]*><\/style>/);
  });
});

describe("RenderedStyle — nos builds reais (globalSetup)", () => {
  const { semFicticio, comFicticio } = inject("buildsDosDados");

  /** CSS que a página carrega: <link> (arquivo) + <style> inline. */
  function pageCss(outDir: string, page: string) {
    const html = readFileSync(join(outDir, page), "utf8");
    const links = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(\/[^"]+)"/g)].map((m) => m[1] ?? "");
    const css = links.map((href) => readFileSync(join(outDir, href), "utf8")).join("\n");
    const inline = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? "").join("\n");
    return { html, links, all: `${css}\n${inline}` };
  }
  const minifiedSelector = (selector: string) => selector.replace(/"/g, "");

  it("produção sem dado do dono: a Home não carrega CSS de seção que não renderiza", () => {
    expect(semFicticio.status, semFicticio.saida.slice(-2000)).toBe(0);
    for (const page of ["index.html", "en/index.html", "es/index.html"]) {
      const { links, all } = pageCss(semFicticio.outDir, page);
      for (const [name, selector] of Object.entries(RENDERED)) {
        expect(links.some((href) => href.includes(`/${name}.`)), `${page}: <link> de ${name}`).toBe(false);
        expect(all.includes(minifiedSelector(selector)), `${page}: regra ${selector} no pacote`).toBe(false);
      }
    }
  });

  it("com a camada fictícia: cada folha entra UMA vez, embutida e minificada, antes da seção", () => {
    expect(comFicticio.status, comFicticio.saida.slice(-2000)).toBe(0);
    const { html, links } = pageCss(comFicticio.outDir, "index.html");
    for (const [name, selector] of Object.entries(RENDERED)) {
      expect(links.some((href) => href.includes(`/${name}.`)), `${name}: sem <link> separado`).toBe(false);
      const blocks = [...html.matchAll(new RegExp(`<style data-rendered-style="${name}">([\\s\\S]*?)</style>`, "g"))];
      expect(blocks, `${name}: um <style>`).toHaveLength(1);
      const css = blocks[0]?.[1] ?? "";
      expect(css, `${name}: processado (sem comentário)`).not.toMatch(/\/\*/);
      expect(css, `${name}: contém ${selector}`).toContain(minifiedSelector(selector));
    }
    // O <style> fica no <body>, antes da 1ª instância de cada componente.
    const body = html.slice(html.indexOf("<body"));
    const at = body.indexOf('data-rendered-style="CaseCard"');
    expect(at, "<style> do CaseCard no <body>").toBeGreaterThan(0);
    expect(at).toBeLessThan(body.indexOf("case-card__media"));
  });
});
