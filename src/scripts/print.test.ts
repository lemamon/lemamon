// @vitest-environment jsdom
/**
 * Impressão (print.ts, auditoria F46): seções escuras e tema escuro voltam aos
 * tokens claros, FAQs fechados abrem e a linha do diagnóstico aparece; depois
 * da impressão, tudo volta como estava.
 */
import { describe, expect, it } from "vitest";

import { preparePrint, restoreAfterPrint } from "./print";

describe("impressão (F46)", () => {
  it("beforeprint prepara o papel e afterprint desfaz", () => {
    document.documentElement.dataset.theme = "dark";
    document.body.innerHTML = `
      <section data-surface="inverse" id="cta"><p data-print-only hidden id="line">Diagnóstico gratuito: lemamon.dev/orcamento</p></section>
      <details data-faq-id="a" open id="a"></details>
      <details data-faq-id="b" id="b"></details>
      <details class="nav-dropdown" id="nav"></details>`;
    const $ = (id: string) => document.getElementById(id) as HTMLElement;

    preparePrint();
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect($("cta").hasAttribute("data-surface")).toBe(false);
    expect(($("b") as HTMLDetailsElement).open).toBe(true);
    expect(($("nav") as HTMLDetailsElement).open).toBe(false);
    expect($("line").hidden).toBe(false);

    restoreAfterPrint();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect($("cta").getAttribute("data-surface")).toBe("inverse");
    expect(($("a") as HTMLDetailsElement).open).toBe(true);
    expect(($("b") as HTMLDetailsElement).open).toBe(false);
    expect($("line").hidden).toBe(true);
  });

  it("os eventos do navegador chamam as duas fases", () => {
    document.body.innerHTML = `<details data-faq-id="c" id="c"></details>`;
    window.dispatchEvent(new Event("beforeprint"));
    expect((document.getElementById("c") as HTMLDetailsElement).open).toBe(true);
    window.dispatchEvent(new Event("afterprint"));
    expect((document.getElementById("c") as HTMLDetailsElement).open).toBe(false);
  });
});
