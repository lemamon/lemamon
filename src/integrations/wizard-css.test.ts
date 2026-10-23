import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { cidsInMarkup, isWizardPage, pruneCss, requiresCid, splitSelectors, writeWizardCss } from "./wizard-css";

const absent = new Set(["foot0001"]);

describe("wizard-css: poda de seletores que exigem escopo ausente (B094)", () => {
  it("tira a regra do escopo ausente e mantém o resto", () => {
    const css = ".btn[data-astro-cid-btn00001]{color:red}.site-footer[data-astro-cid-foot0001]{padding:0}body{margin:0}";
    expect(pruneCss(css, absent)).toBe(".btn[data-astro-cid-btn00001]{color:red}body{margin:0}");
  });

  it("numa lista de seletores, tira só os que exigem o escopo", () => {
    const css = ".a[data-astro-cid-foot0001] .b,.c{color:red}";
    expect(pruneCss(css, absent)).toBe(".c{color:red}");
    expect(splitSelectors('.a,[title="x,y"],:is(.b,.c)')).toEqual([".a", '[title="x,y"]', ":is(.b,.c)"]);
  });

  it("@media vazio sai; @keyframes e @font-face ficam inteiros", () => {
    const css =
      "@media (width>=1024px){.site-footer__grid[data-astro-cid-foot0001]{display:grid}}" +
      "@media print{.x{display:none}.site-footer[data-astro-cid-foot0001]{display:none}}" +
      "@keyframes drawer-in{0%{transform:translate(100%)}}";
    expect(pruneCss(css, absent)).toBe("@media print{.x{display:none}}@keyframes drawer-in{0%{transform:translate(100%)}}");
  });

  it("escopo dentro de :not()/:is()/:has() não conta (a ausência pode casar)", () => {
    expect(requiresCid(".x:not([data-astro-cid-foot0001])", absent)).toBe(false);
    expect(requiresCid("body:has(.y[data-astro-cid-foot0001])", absent)).toBe(false);
    expect(requiresCid(".y[data-astro-cid-foot0001]:hover", absent)).toBe(true);
    expect(requiresCid('.y[data-astro-cid-foot0001="true"]', absent)).toBe(true);
  });

  it("chaves dentro de strings não quebram a leitura", () => {
    const css = '.a[data-astro-cid-foot0001]:before{content:"}{"}.b:before{content:"·" / ""}';
    expect(pruneCss(css, absent)).toBe('.b:before{content:"·" / ""}');
  });

  it("acha as páginas do wizard e os escopos da marcação (fora dos <style>)", () => {
    expect(isWizardPage('<body data-route="quote" data-layout="wizard">')).toBe(true);
    expect(isWizardPage('<body data-route="home" data-layout="default">')).toBe(false);
    const html = '<style>.z[data-astro-cid-zzzzzzzz]{}</style><a data-astro-cid-aaaaaaaa class="x" data-astro-cid-bbbbbbbb="true">';
    expect([...cidsInMarkup(html)].sort()).toEqual(["aaaaaaaa", "bbbbbbbb"]);
  });
});

describe("wizard-css: build (writeWizardCss)", () => {
  let dir = "";
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  // Regras de rodapé grandes o bastante para passar de MIN_SAVING_GZ.
  const footerRules = Array.from(
    { length: 120 },
    (_, i) => `.site-footer__item-${i}[data-astro-cid-foot0001]{margin-block-start:var(--space-${i % 12});padding-inline:${i}px}`,
  ).join("");
  const base = `body{margin:0}.btn[data-astro-cid-btn00001]{color:red}${footerRules}`;
  const head = '<link rel="stylesheet" href="/_astro/Base.ABC.css">';

  function setup() {
    dir = mkdtempSync(join(tmpdir(), "wizard-css-"));
    mkdirSync(join(dir, "_astro"));
    writeFileSync(join(dir, "_astro", "Base.ABC.css"), base);
    writeFileSync(
      join(dir, "index.html"),
      `<html><head>${head}</head><body data-layout="default"><a class="btn" data-astro-cid-btn00001></a><footer data-astro-cid-foot0001></footer></body></html>`,
    );
    writeFileSync(
      join(dir, "orcamento.html"),
      `<html><head>${head}</head><body data-layout="wizard"><button class="btn" data-astro-cid-btn00001></button></body></html>`,
    );
  }

  it("a página do wizard linka a versão sem o rodapé; a do site continua igual", () => {
    setup();
    const report = writeWizardCss(dir);
    expect(report.pages).toEqual(["orcamento.html"]);
    expect(report.sheets).toHaveLength(1);
    const variant = report.sheets[0]?.variant ?? "";
    expect(variant).toMatch(/^\/_astro\/Base\.ABC\.wizard-[0-9a-f]{8}\.css$/);
    const pruned = readFileSync(join(dir, variant.slice(1)), "utf8");
    expect(pruned).toBe("body{margin:0}.btn[data-astro-cid-btn00001]{color:red}");
    expect(readFileSync(join(dir, "orcamento.html"), "utf8")).toContain(`href="${variant}"`);
    expect(readFileSync(join(dir, "index.html"), "utf8")).toContain('href="/_astro/Base.ABC.css"');
    expect(readFileSync(join(dir, "_astro", "Base.ABC.css"), "utf8")).toBe(base);

    // Idempotente: rodar de novo não gera outra folha nem troca o link.
    expect(writeWizardCss(dir).sheets).toEqual([]);
    expect(readdirSync(join(dir, "_astro"))).toHaveLength(2);
  });

  it("economia pequena não gera folha nova (cache compartilhado vale mais)", () => {
    dir = mkdtempSync(join(tmpdir(), "wizard-css-"));
    mkdirSync(join(dir, "_astro"));
    writeFileSync(join(dir, "_astro", "Base.ABC.css"), "body{margin:0}.site-footer[data-astro-cid-foot0001]{padding:0}");
    writeFileSync(join(dir, "orcamento.html"), `<html><head>${head}</head><body data-layout="wizard"></body></html>`);
    expect(writeWizardCss(dir).sheets).toEqual([]);
    expect(readFileSync(join(dir, "orcamento.html"), "utf8")).toContain('href="/_astro/Base.ABC.css"');
  });
});
