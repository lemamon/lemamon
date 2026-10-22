// @vitest-environment jsdom
/**
 * "Copiar" do e-mail (copy-email.ts) — auditoria de conversão F49: no toque, o
 * endereço vira link mailto: com assunto; com mouse, continua só texto (o HTML
 * publicado nunca tem mailto, B145).
 */
import { describe, expect, it } from "vitest";

import { linkAddresses } from "./copy-email";

const markup = `<span data-copy-email><span data-copy-address data-mailto-subject="Contato pelo site da Lemamon.dev">comercial@lemamon.dev</span><button data-copy="comercial@lemamon.dev">Copiar</button></span>`;

describe("e-mail clicável só no toque (F49)", () => {
  it("toque: o endereço vira mailto: com o assunto codificado, uma vez só", () => {
    document.body.innerHTML = markup;
    linkAddresses(document, true);
    linkAddresses(document, true);
    const links = document.querySelectorAll<HTMLAnchorElement>("[data-copy-address] a");
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("href")).toBe("mailto:comercial@lemamon.dev?subject=Contato%20pelo%20site%20da%20Lemamon.dev");
    expect(links[0]?.textContent).toBe("comercial@lemamon.dev");
  });

  it("mouse: nada muda (texto selecionável, sem mailto)", () => {
    document.body.innerHTML = markup;
    linkAddresses(document, false);
    expect(document.body.innerHTML).not.toContain("mailto:");
  });
});
