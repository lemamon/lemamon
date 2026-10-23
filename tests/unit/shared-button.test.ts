/**
 * Button (ui/Button.astro, 03-ui §3.4.2, backlog B209). Dono: home.
 *  - <a> com href, <button> sem href; nunca <button> dentro de <a>;
 *  - tamanho sm declara o piso de 44px abaixo de 768px (alvo de toque);
 *  - disabled: <button disabled>; no link, sem href + aria-disabled + fora do tab;
 *  - loading: data-loading + aria-busy (+ aria-disabled), sem trocar o rótulo.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

import Button from "@/components/ui/Button.astro";

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const render = (props: Record<string, unknown>, label = "Enviar") =>
  container.renderToString(Button as any, { props, slots: { default: label } });
const openTag = (html: string, tag: "a" | "button") => new RegExp(`<${tag}\\b[^>]*>`).exec(html)?.[0] ?? "";

describe("Button — variantes, tamanhos e elemento", () => {
  it("<a> com href e <button> sem href, nunca um dentro do outro", async () => {
    const link = await render({ href: "/orcamento", variant: "primary", size: "lg" });
    expect(openTag(link, "a")).toMatch(/href="\/orcamento"/);
    expect(link).not.toMatch(/<button\b/);
    const button = await render({ variant: "secondary", size: "sm", type: "submit" });
    expect(openTag(button, "button")).toMatch(/type="submit"/);
    expect(button).not.toMatch(/<a\b/);
  });

  it("repassa variante, tamanho e data-* (medição)", async () => {
    const html = await render({ href: "/x", variant: "whatsapp", size: "sm", "data-track": "whatsapp_click" });
    const tag = openTag(html, "a");
    expect(tag).toMatch(/data-variant="whatsapp"/);
    expect(tag).toMatch(/data-size="sm"/);
    expect(tag).toMatch(/data-track="whatsapp_click"/);
  });

  it("o CSS dá a todo tamanho no mínimo 44px (--target-min) abaixo de 768px", () => {
    const css = readFileSync(new URL("../../src/components/ui/Button.astro", import.meta.url), "utf8");
    expect(css).toMatch(/@media \(max-width: 767\.98px\)\s*\{[^}]*\.btn\[data-size="sm"\]\s*\{\s*min-block-size: var\(--target-min\);/);
  });
});

describe("Button — estados", () => {
  it("disabled no <button>: atributo nativo", async () => {
    const tag = openTag(await render({ disabled: true }), "button");
    expect(tag).toMatch(/\sdisabled(\s|>|=)/);
    expect(tag).not.toMatch(/aria-busy/);
  });

  it("disabled no link: sem href, aria-disabled, role=link e fora da ordem de tab", async () => {
    const tag = openTag(await render({ href: "/orcamento", disabled: true }), "a");
    expect(tag).not.toMatch(/href=/);
    expect(tag).toMatch(/aria-disabled="true"/);
    expect(tag).toMatch(/role="link"/);
    expect(tag).toMatch(/tabindex="-1"/);
  });

  it("loading: data-loading, aria-busy e aria-disabled, com o rótulo mantido (largura estável)", async () => {
    const html = await render({ type: "submit", loading: true }, "Enviar pedido");
    const tag = openTag(html, "button");
    expect(tag).toMatch(/data-loading="true"/);
    expect(tag).toMatch(/aria-busy="true"/);
    expect(tag).toMatch(/aria-disabled="true"/);
    expect(tag).not.toMatch(/\sdisabled(\s|>|=)/);
    expect(html).toContain("Enviar pedido");
  });

  it("padrão: nenhum atributo de estado", async () => {
    const tag = openTag(await render({}), "button");
    expect(tag).not.toMatch(/disabled|aria-busy|data-loading/);
  });
});

/* ------------------------------------------------------------------ *
 * Desabilitado em cores sólidas (B155): nada de opacity; texto ≥ 4.5:1.
 * ------------------------------------------------------------------ */

const SRC = (path: string) => readFileSync(new URL(`../../src/${path}`, import.meta.url), "utf8");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Regra CSS do componente cujo seletor começa por `.btn:disabled`. */
function disabledRule(): string {
  const css = stripComments(SRC("components/ui/Button.astro"));
  const match = /\.btn:disabled,\s*\.btn\[aria-disabled="true"\]:not\(\[data-loading="true"\]\)\s*\{([^}]*)\}/.exec(css);
  expect(match, "regra .btn:disabled").not.toBeNull();
  return match?.[1] ?? "";
}

/** Declarações de cada bloco de topo de tokens.css (fora de @media), por seletor. */
function tokenBlocks(): Map<string, Record<string, string>> {
  const css = stripComments(SRC("styles/tokens.css")).replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const blocks = new Map<string, Record<string, string>>();
  for (const [, selector = "", body = ""] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const key = selector.trim();
    const decls = blocks.get(key) ?? {};
    for (const [, name = "", value = ""] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) decls[name] = value.trim();
    blocks.set(key, decls);
  }
  return blocks;
}

/** Valor final (hex) de um token num contexto (lista de seletores aplicados em ordem). */
function resolveToken(name: string, context: string[]): string {
  const blocks = tokenBlocks();
  const scope: Record<string, string> = {};
  for (const selector of context) Object.assign(scope, blocks.get(selector) ?? {});
  let value = scope[name] ?? "";
  for (let depth = 0; depth < 10 && value.startsWith("var("); depth++) value = scope[/var\((--[a-z0-9-]+)\)/.exec(value)?.[1] ?? ""] ?? "";
  return value;
}

function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (bl ?? 0);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

describe("Button — desabilitado sem opacity (B155)", () => {
  it("a regra de disabled não usa opacity e troca as cores pelos tokens sólidos", () => {
    const rule = disabledRule();
    expect(rule).not.toMatch(/opacity/);
    expect(rule).toMatch(/--btn-bg:\s*var\(--color-bg-muted\)/);
    expect(rule).toMatch(/--btn-border:\s*var\(--color-border-default\)/);
    expect(rule).toMatch(/--btn-fg:\s*var\(--color-text-disabled\)/);
    expect(stripComments(SRC("components/ui/Button.astro"))).not.toMatch(/opacity\s*:/);
  });

  it("texto desabilitado ≥ 4.5:1 sobre o fundo desabilitado no claro, no escuro e em inverse", () => {
    const contexts: Record<string, string[]> = {
      claro: [":root"],
      "claro, inverse": [":root", '[data-surface="inverse"]'],
      escuro: [":root", ':root[data-theme="dark"]'],
      "escuro, inverse": [":root", ':root[data-theme="dark"]', '[data-surface="inverse"]', ':root[data-theme="dark"] [data-surface="inverse"]'],
    };
    for (const [label, context] of Object.entries(contexts)) {
      const fg = resolveToken("--color-text-disabled", context);
      const bg = resolveToken("--color-bg-muted", context);
      expect(fg, `${label}: --color-text-disabled`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(bg, `${label}: --color-bg-muted`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(contrast(fg, bg), `${label}: ${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("<Button disabled> e <Button href disabled> continuam sem estilo inline de opacidade", async () => {
    for (const props of [{ disabled: true }, { href: "/orcamento", disabled: true }]) {
      const html = await render(props);
      expect(html).not.toMatch(/opacity/);
    }
  });
});
