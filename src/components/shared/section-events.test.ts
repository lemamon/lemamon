// @vitest-environment jsdom
/**
 * faq_open (auditoria de conversão F84): clique no <summary> de um FAQ
 * fechado mede a pergunta uma vez por carregamento; o que já vem aberto e o
 * que não é FAQ não contam.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const track = vi.fn();
vi.mock("@/lib/analytics", () => ({ track }));

afterEach(() => track.mockClear());

describe("faq_open (F84)", () => {
  it("só pergunta fechada do FAQ, uma vez por id", async () => {
    const { observeFaqOpen } = await import("./section-events");
    document.body.innerHTML = `
      <details data-faq-id="nda" id="nda"><summary id="s-nda">NDA?</summary><p>Sim.</p></details>
      <details data-faq-id="price" open><summary id="s-price">Preço?</summary><p>…</p></details>
      <details class="nav-dropdown"><summary id="s-nav">Serviços</summary></details>`;
    observeFaqOpen();
    const click = (id: string) => document.getElementById(id)?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    click("s-nda");
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("faq_open", { faq_id: "nda", page_path: window.location.pathname });

    // Fechar e abrir de novo não repete; a já aberta e o dropdown do menu não contam.
    (document.getElementById("nda") as HTMLDetailsElement).open = false;
    click("s-nda");
    click("s-price");
    click("s-nav");
    expect(track).toHaveBeenCalledTimes(1);
  });
});
