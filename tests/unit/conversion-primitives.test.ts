/**
 * Primitivos de UI e grade nas páginas de conversão (dono: conversion). Guarda
 * estática, sem build, como tests/unit/gates-primitives.test.ts faz no gated.
 *
 *  - B214: /contato, /orcamento e /orcamento/enviado não desenham o próprio
 *    cartão (borda de 1px + --radius-md/lg/xl) nem o próprio "texto + seta":
 *    os cartões são <Card> e a seta vem do <ArrowLink>. Ficam de fora os
 *    controles de formulário e os botões (campo, opção de rádio, "Copiar
 *    resumo"), os avisos de estado (confirmação e erro do formulário, com a
 *    cor do estado e a borda de 4px no início) e a pílula do código do pedido;
 *    nenhum deles é cartão de conteúdo.
 *  - B222: as grades de seção dessas páginas usam a calha do token
 *    (var(--grid-gap): 16px no mobile, 24px no desktop) e só composições da
 *    lista (12, 6+6, 4+4+4…), nunca auto-fit/auto-fill.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, "");

/** Regras CSS do(s) <style> de um .astro: seletor → corpo (sem @media aninhado). */
function cssRules(source: string): Array<{ selector: string; body: string }> {
  const css = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => stripComments(match[1] ?? "")).join("\n");
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] ?? "").trim().split("\n").pop()?.trim() ?? "",
    body: match[2] ?? "",
  }));
}

const dir = (rel: string) =>
  readdirSync(join(ROOT, rel))
    .filter((name) => name.endsWith(".astro"))
    .map((name) => `${rel}/${name}`);

/** Área de conversão com CSS de seção (CONTRACT §11, tabela de ownership). */
const CONVERSION_FILES = [
  ...dir("src/components/contact"),
  ...dir("src/components/quote"),
  ...dir("src/components/quote-sent"),
  "src/views/ContactView.astro",
  "src/views/QuoteView.astro",
  "src/views/QuoteSentView.astro",
];

/** Controles, botões, avisos de estado e a pílula do código: não são cartões. */
const NOT_A_CARD = [
  /\b(input|textarea|select|button)\b/,
  /\.choice\b/,
  /__button\b/,
  /^\.contact-form__(error|success)$/,
  /^\.sent-confirmation__protocol$/,
];

describe("páginas de conversão usam os primitivos de UI (B214)", () => {
  it("nenhum cartão próprio: borda de 1px + --radius-md/lg/xl só em controle, botão ou aviso de estado", () => {
    const problems: string[] = [];
    for (const rel of CONVERSION_FILES) {
      for (const { selector, body } of cssRules(read(rel))) {
        if (!/border(-[a-z-]+)?:\s*1px solid/.test(body)) continue;
        if (!/border-radius:\s*var\(--radius-(md|lg|xl)\)/.test(body)) continue;
        if (NOT_A_CARD.some((pattern) => pattern.test(selector))) continue;
        problems.push(`${rel}: ${selector}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("nenhum 'texto + seta' desenhado à mão: a seta vem do <ArrowLink>", () => {
    const problems = CONVERSION_FILES.filter((rel) => /<Icon\s+name="arrow-right"/.test(read(rel)));
    expect(problems).toEqual([]);
  });

  it("nenhuma divisória própria (border-block de 1px numa raiz de bloco): é o <Divider> ou o <Section divider>", () => {
    const problems: string[] = [];
    for (const rel of ["src/components/quote-sent/SentMeanwhile.astro", "src/components/contact/ContactChannels.astro"]) {
      for (const { selector, body } of cssRules(read(rel))) {
        if (/border-block-(start|end):\s*1px solid/.test(body)) problems.push(`${rel}: ${selector}`);
      }
    }
    expect(problems).toEqual([]);
    expect(read("src/components/quote-sent/SentMeanwhile.astro")).toMatch(/<Divider\b/);
  });

  it("os cartões da conversão são <Card> (canais e perfis do /contato, resumo do pedido, aviso sem JS)", () => {
    const channels = read("src/components/contact/ContactChannels.astro");
    expect(channels).toMatch(/<Card\s+as="li"[^>]*class="channel channel--featured"/);
    expect(channels.match(/<Card\s+as="li"[^>]*class="channel"/g)?.length).toBe(2);
    expect(channels).toMatch(/<Card\s+as="a"\s+interactive[^>]*class="profile"/);
    expect(read("src/components/quote-sent/SentSummary.astro")).toMatch(/<Card\s+padding="none">\s*<details/);
    expect(read("src/views/QuoteView.astro")).toMatch(/<noscript>\s*<Card\s+surface="subtle"[^>]*class="quote-noscript"/);
  });

  it("os links de texto (dicas do assunto, confirmação, 'Ver como trabalhamos', 'Enquanto isso') são <ArrowLink>", () => {
    expect(stripComments(read("src/components/contact/ContactForm.astro")).match(/<ArrowLink\b/g)?.length).toBe(3);
    expect(read("src/components/quote/QuoteAfterSend.astro")).toMatch(/<ArrowLink\s+href=\{urlFor\("how_we_work", locale\)\}/);
    expect(stripComments(read("src/components/quote-sent/SentMeanwhile.astro")).match(/<ArrowLink\b/g)?.length).toBe(4);
  });
});

describe("grades de seção da conversão (B222)", () => {
  const SECTION_GRIDS: Array<[string, string]> = [
    ["src/components/contact/ContactChannels.astro", ".contact-channels__grid"],
    ["src/components/contact/ContactChannels.astro", ".contact-channels__profiles"],
    ["src/components/quote/QuoteAfterSend.astro", ".after-send__steps"],
    ["src/components/quote-sent/SentConfirmation.astro", ".sent-confirmation__steps"],
    ["src/components/quote-sent/SentMeanwhile.astro", ".sent-meanwhile__case-list"],
  ];

  it.each(SECTION_GRIDS)("%s %s usa a calha do token (gap: var(--grid-gap))", (rel, selector) => {
    const rule = cssRules(read(rel)).find((r) => r.selector === selector && /display:\s*grid/.test(r.body));
    expect(rule?.body, `${rel} ${selector}`).toMatch(/(^|[\s;])gap:\s*var\(--grid-gap\)/);
  });

  it("nenhuma grade de conversão usa auto-fit/auto-fill (as colunas são composições da lista)", () => {
    const problems = CONVERSION_FILES.filter((rel) => /repeat\(\s*auto-(fit|fill)/.test(stripComments(read(rel))));
    expect(problems).toEqual([]);
  });

  it("canais do /contato: 1 coluna abaixo de 1024px; 4+4+4 com WhatsApp e 6+6 sem", () => {
    const source = read("src/components/contact/ContactChannels.astro");
    const css = stripComments([...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n"));
    const desktop = css.match(/@media \(min-width: 1024px\) \{([\s\S]*?)\n {2}\}/)?.[1] ?? "";
    expect(desktop).toMatch(/\.contact-channels__grid \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
    expect(desktop).toMatch(/\.contact-channels__grid\[data-count="2"\] \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
    expect(css).not.toMatch(/@media \(min-width: 768px\) \{\s*\.contact-channels__grid/);
    expect(source).toMatch(/data-count=\{String\(channelCount\)\}/);
  });
});
