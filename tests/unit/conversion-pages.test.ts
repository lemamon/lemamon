// @vitest-environment jsdom
/**
 * Scripts de /contato e /orcamento/enviado — partes puras e a personalização
 * do pós-envio a partir do resumo no sessionStorage (BLUEPRINT §6.9, §7.8).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { contactFieldError, contactOrigin, phoneLocaleOf } from "@/components/contact/contact-form";
import { personalize, summaryCopyText } from "@/components/quote-sent/sent-page";
import type { SentSummary } from "@/lib/draft";

describe("/contato", () => {
  const messages = { required: "obrigatório", invalid: "inválido" };

  it("validação por campo", () => {
    expect(contactFieldError("name", " ", messages)).toBe("obrigatório");
    expect(contactFieldError("email", "", messages)).toBe("obrigatório");
    expect(contactFieldError("email", "ana@", messages)).toBe("inválido");
    expect(contactFieldError("email", "ana@x.com", messages)).toBe("");
    expect(contactFieldError("phone", "", messages)).toBe("");
    expect(contactFieldError("phone", "99999-9999", messages)).toBe("inválido");
    expect(contactFieldError("phone", "(48) 3333-4444", messages)).toBe("");
    expect(contactFieldError("phone", "+1 415 555 0100", messages)).toBe("");
    expect(contactFieldError("phone", "+44 7911 123456", messages)).toBe("");
    expect(contactFieldError("subject", "", messages)).toBe("obrigatório");
    expect(contactFieldError("message", "Oi", messages)).toBe("");
  });

  it("telefone em /es e /en: sem + e código do país é inválido (nunca vira número brasileiro)", () => {
    expect(phoneLocaleOf("es")).toBe("es");
    expect(phoneLocaleOf("en")).toBe("en");
    expect(phoneLocaleOf("")).toBe("pt");
    expect(contactFieldError("phone", "5512345678", messages, "es")).toBe("inválido");
    expect(contactFieldError("phone", "1123456789", messages, "es")).toBe("inválido");
    expect(contactFieldError("phone", "+52 55 1234 5678", messages, "es")).toBe("");
    expect(contactFieldError("phone", "+54 9 11 2345 6789", messages, "en")).toBe("");
    expect(contactFieldError("phone", "", messages, "es")).toBe("");
    expect(contactFieldError("phone", "5512345678", messages, "pt")).toBe("");
  });

  it("origem: ?origem=, senão a página anterior do site, senão o site de fora", () => {
    expect(contactOrigin("?origem=footer", "", "lemamon.dev")).toBe("footer");
    expect(contactOrigin("", "https://lemamon.dev/servicos/mvp", "lemamon.dev")).toBe("/servicos/mvp");
    expect(contactOrigin("", "https://www.google.com/search?q=x", "lemamon.dev")).toBe("https://www.google.com");
    expect(contactOrigin("", "", "lemamon.dev")).toBe("");
  });
});

describe("/orcamento/enviado", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const summary: SentSummary = {
    v: 1,
    protocol: "LEM-20261019-ABCD",
    lang: "pt",
    firstName: "Ana",
    channel: "email",
    channelContact: "",
    role: "researching",
    deadlineUrgent: true,
    services: ["mobile_apps"],
    lines: [
      { label: "Momento", value: "Ideia de produto" },
      { label: "Prazo", value: "Nos próximos 3 meses" },
    ],
    contacts: ["Ana Souza", "ana@x.com"],
    measured: true,
  };

  it("texto de 'Copiar resumo': cabeçalho com código, respostas, rodapé", () => {
    expect(summaryCopyText(summary, "Pedido {protocolo}", "*{rotulo}:* {resposta}", "Como funciona: https://x")).toBe(
      "Pedido LEM-20261019-ABCD\n\n*Momento:* Ideia de produto\n*Prazo:* Nos próximos 3 meses\n\nComo funciona: https://x",
    );
  });

  it("personaliza H1, código, canal, 'quem decide', prazo, resumo e cases do serviço", () => {
    document.body.innerHTML = `
      <h1 data-sent-title data-template="Pedido recebido, {nome}.">Pedido recebido.</h1>
      <p data-sent-protocol hidden><strong data-sent-protocol-value></strong></p>
      <span data-sent-contact data-whatsapp="pelo WhatsApp" data-email="por e-mail">genérico</span>
      <li data-sent-decider></li>
      <li data-sent-deadline hidden></li>
      <section data-sent-summary hidden>
        <strong data-sent-summary-protocol></strong>
        <dl data-sent-summary-lines></dl>
        <ul data-sent-summary-contacts></ul>
      </section>
      <div data-sent-cases hidden>
        <h3 data-sent-cases-title data-one="Um projeto" data-many="Projetos">Projetos</h3>
        <li data-case-services="web_systems" hidden></li>
        <li data-case-services="mobile_apps mvp" hidden></li>
      </div>`;
    personalize(document, summary);
    expect(document.querySelector("h1")?.textContent).toBe("Pedido recebido, Ana.");
    expect(document.querySelector<HTMLElement>("[data-sent-protocol]")?.hidden).toBe(false);
    expect(document.querySelector("[data-sent-protocol-value]")?.textContent).toBe("LEM-20261019-ABCD");
    expect(document.querySelector("[data-sent-contact]")?.textContent).toBe("por e-mail");
    expect(document.querySelector<HTMLElement>("[data-sent-decider]")?.dataset.highlight).toBe("true");
    expect(document.querySelector<HTMLElement>("[data-sent-deadline]")?.hidden).toBe(false);
    expect(document.querySelectorAll("[data-sent-summary-lines] dt")).toHaveLength(2);
    expect(document.querySelectorAll("[data-sent-summary-contacts] li")).toHaveLength(2);
    expect(document.querySelector<HTMLElement>("[data-sent-summary]")?.hidden).toBe(false);
    const cards = [...document.querySelectorAll<HTMLElement>("[data-case-services]")];
    expect(cards.map((card) => card.hidden)).toEqual([true, false]);
    expect(document.querySelector("[data-sent-cases-title]")?.textContent).toBe("Um projeto");
    expect(document.querySelector<HTMLElement>("[data-sent-cases]")?.hidden).toBe(false);
  });

  it("F10: confirma o contato pelo canal, 'Algum dado errado?' com o código e o topo com o código", async () => {
    // Os links com o código só existem com número de WhatsApp: o número de
    // TESTE do E2E, sem depender do .env.local (o CI não tem nenhum).
    vi.resetModules();
    vi.stubEnv("PUBLIC_WHATSAPP_NUMBER", "5548900000000");
    const { personalize } = await import("@/components/quote-sent/sent-page");
    document.body.innerHTML = `
      <header><a data-wizard-help href="https://wa.me/5548900000000?text=gen%C3%A9rico">Dúvidas?</a></header>
      <span data-sent-contact data-whatsapp="A gente fala com você pelo WhatsApp {contato} para marcar." data-email="A gente escreve para {contato}.">genérico</span>
      <p data-sent-fix hidden>Algum dado errado? <a data-sent-fix-whatsapp href="https://wa.me/5548900000000" data-template="Olá! O contato do meu pedido {protocolo} saiu errado. O certo é:">Mande o certo</a></p>
      <a data-sent-whatsapp href="https://wa.me/5548900000000?text=gen" data-template="Olá! Pedido {protocolo}.">Mandar oi</a>
      <p data-sent-whatsapp-support hidden>A mensagem já leva o código.</p>`;
    personalize(document, { ...summary, channel: "whatsapp", channelContact: "(48) 99999-8888" });
    const step = document.querySelector("[data-sent-contact]");
    expect(step?.textContent).toBe("A gente fala com você pelo WhatsApp (48) 99999-8888 para marcar.");
    expect(step?.querySelector("strong")?.textContent).toBe("(48) 99999-8888");
    const fix = document.querySelector<HTMLElement>("[data-sent-fix]");
    expect(fix?.hidden).toBe(false);
    const fixText = new URL(document.querySelector<HTMLAnchorElement>("[data-sent-fix-whatsapp]")?.href ?? "").searchParams.get("text");
    expect(fixText).toBe("Olá! O contato do meu pedido LEM-20261019-ABCD saiu errado. O certo é: ");
    const sayHi = document.querySelector<HTMLAnchorElement>("[data-sent-whatsapp]")?.href ?? "";
    expect(new URL(sayHi).searchParams.get("text")).toBe("Olá! Pedido LEM-20261019-ABCD.");
    expect(document.querySelector<HTMLElement>("[data-sent-whatsapp-support]")?.hidden).toBe(false);
    // O "Dúvidas? WhatsApp" do topo também leva o código.
    expect(document.querySelector<HTMLAnchorElement>("[data-wizard-help]")?.href).toBe(sayHi);
    // O número da Lemamon nunca vira texto da página.
    expect(document.body.textContent).not.toContain("5548900000000");
  });

  it("F10: resumo antigo, sem o contato, fica com o texto genérico e sem 'Algum dado errado?'", () => {
    document.body.innerHTML = `
      <span data-sent-contact data-email="A gente escreve para {contato}.">A gente fala com você para marcar.</span>
      <p data-sent-fix hidden>Algum dado errado?</p>`;
    personalize(document, { ...summary, channel: "email", channelContact: "" });
    expect(document.querySelector("[data-sent-contact]")?.textContent).toBe("A gente fala com você para marcar.");
    expect(document.querySelector<HTMLElement>("[data-sent-fix]")?.hidden).toBe(true);
  });

  it("'Resumo do seu pedido' abre sozinho para quem decide com outros (o 'Copiar resumo' fica lá dentro)", () => {
    const page = () => {
      document.body.innerHTML = `
        <div data-sent-summary hidden>
          <details data-sent-summary-details>
            <summary>Resumo do seu pedido</summary>
            <strong data-sent-summary-protocol></strong>
            <dl data-sent-summary-lines></dl>
            <ul data-sent-summary-contacts></ul>
          </details>
        </div>`;
      return document.querySelector<HTMLDetailsElement>("[data-sent-summary-details]");
    };
    for (const role of ["decide_with_partners", "recommend_to_decider"]) {
      const details = page();
      personalize(document, { ...summary, role });
      expect(details?.open, role).toBe(true);
      expect(document.querySelector<HTMLElement>("[data-sent-summary]")?.hidden).toBe(false);
    }
    for (const role of ["i_decide", "researching", "not_defined", ""]) {
      const details = page();
      personalize(document, { ...summary, role });
      expect(details?.open, role).toBe(false);
    }
  });
});

describe("/orcamento/enviado — clique nos cases do serviço (B379)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("clique e clique do meio num card geram cta_click {cta_id: case, origem: enviado-cases}", async () => {
    vi.stubEnv("PUBLIC_GA4_ID", "G-TESTE");
    vi.resetModules();
    const { bindCaseClicks } = await import("@/components/quote-sent/sent-page");
    const gtag = vi.fn();
    vi.stubGlobal("gtag", gtag);
    document.body.innerHTML = `
      <div data-sent-cases>
        <li data-case-services="web_systems"><a href="/cases/x" data-case-link>Case X</a></li>
        <p>fora de link</p>
      </div>`;
    bindCaseClicks(document);
    const link = document.querySelector<HTMLAnchorElement>("[data-case-link]");
    link?.addEventListener("click", (event) => event.preventDefault());
    link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    link?.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, button: 1 }));
    document.querySelector("p")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const calls = gtag.mock.calls.filter(([, name]) => name === "cta_click");
    expect(calls).toHaveLength(2);
    expect(calls[0]?.[2]).toMatchObject({ cta_id: "case", origem: "enviado-cases" });
  });
});

describe("/orcamento/enviado — lead_success_view (B341)", () => {
  const base: SentSummary = {
    v: 1,
    protocol: "LEM-20261020-K7QZ",
    lang: "pt",
    firstName: "Ana",
    channel: "email",
    channelContact: "ana@x.com",
    role: "i_decide",
    deadlineUrgent: false,
    services: ["web_systems"],
    lines: [{ label: "Momento", value: "Ideia de produto" }],
    contacts: ["Ana Souza", "ana@x.com"],
    measured: true,
  };

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
  });

  async function setup() {
    vi.stubEnv("PUBLIC_GA4_ID", "G-TESTE");
    vi.resetModules();
    const gtag = vi.fn();
    vi.stubGlobal("gtag", gtag);
    const mod = await import("@/components/quote-sent/sent-page");
    const draft = await import("@/lib/draft");
    const views = () => gtag.mock.calls.filter(([, name]) => name === "lead_success_view");
    return { ...mod, ...draft, views };
  }

  it("envio real: dispara uma vez, com event_id = código do pedido (o mesmo do lead_submitted)", async () => {
    const { initSentPage, writeSentSummary, views } = await setup();
    document.body.innerHTML = `<h1 data-sent-title tabindex="-1">Pedido recebido.</h1>`;
    writeSentSummary(base);
    initSentPage(document);
    expect(views()).toHaveLength(1);
    expect(views()[0]?.[2]).toMatchObject({ event_id: "LEM-20261020-K7QZ", send_to: "G-TESTE" });
  });

  it("reload (initSentPage de novo, mesma aba) não dispara outra vez; outro pedido dispara", async () => {
    const { initSentPage, writeSentSummary, views } = await setup();
    document.body.innerHTML = `<h1 data-sent-title tabindex="-1">Pedido recebido.</h1>`;
    writeSentSummary(base);
    initSentPage(document);
    initSentPage(document);
    expect(views()).toHaveLength(1);
    writeSentSummary({ ...base, protocol: "LEM-20261020-M3XP" });
    initSentPage(document);
    expect(views()).toHaveLength(2);
    expect(views()[1]?.[2]).toMatchObject({ event_id: "LEM-20261020-M3XP" });
  });

  it("sem resumo (versão genérica), robô descartado ou envio de teste do preview (measured false): nada", async () => {
    const { initSentPage, trackSuccessView, writeSentSummary, views } = await setup();
    document.body.innerHTML = `<h1 data-sent-title tabindex="-1">Pedido recebido.</h1>`;
    initSentPage(document);
    expect(views()).toHaveLength(0);
    writeSentSummary({ ...base, measured: false });
    initSentPage(document);
    expect(views()).toHaveLength(0);
    expect(trackSuccessView(null)).toBe(false);
    // Sem storage não mede (melhor perder um evento que contar o pedido duas vezes).
    expect(trackSuccessView(base, null)).toBe(false);
    expect(views()).toHaveLength(0);
  });

  it("o evento não leva nada além do event_id (nem nome, nem e-mail, nem resposta)", async () => {
    const { trackSuccessView, views } = await setup();
    expect(trackSuccessView(base)).toBe(true);
    const params = views()[0]?.[2] as Record<string, unknown>;
    expect(Object.keys(params).sort()).toEqual(["event_id", "send_to"]);
    expect(JSON.stringify(params)).not.toMatch(/Ana|ana@x\.com|Ideia/);
  });
});
