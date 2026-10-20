/**
 * lib/whatsapp.ts e lib/whatsapp-messages.ts — número de PUBLIC_WHATSAPP_NUMBER,
 * nenhum link sem número, mensagens por página (BLUEPRINT §7.7).
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { t } from "@/i18n";
import { contactMessage, postSubmitGenericMessage, quoteEntryMessage, serviceMessage, wizardQuestionMessage } from "@/lib/whatsapp-messages";

async function load(number: string) {
  vi.resetModules();
  vi.stubEnv("PUBLIC_WHATSAPP_NUMBER", number);
  return import("@/lib/whatsapp");
}

afterEach(() => vi.unstubAllEnvs());

describe("whatsappHref", () => {
  it("sem número válido: null (todo botão de WhatsApp some)", async () => {
    for (const number of ["", "48999999999", "abc"]) {
      const lib = await load(number);
      expect(lib.hasWhatsapp()).toBe(false);
      expect(lib.whatsappHref("Olá")).toBeNull();
    }
  });

  it("com número: wa.me com a mensagem codificada; só dígitos", async () => {
    const lib = await load("+55 (48) 99999-9999");
    expect(lib.whatsappHref()).toBe("https://wa.me/5548999999999");
    expect(lib.whatsappHref("Olá! Código: LEM-1 & mais")).toBe(
      `https://wa.me/5548999999999?text=${encodeURIComponent("Olá! Código: LEM-1 & mais")}`,
    );
  });

  it("openWhatsapp abre em aba nova com noopener; sem número, não abre", async () => {
    const open = vi.fn();
    const lib = await load("5548999999999");
    expect(lib.openWhatsapp("Oi", { open })).toBe(true);
    expect(open).toHaveBeenCalledWith(expect.stringContaining("?text=Oi"), "_blank", "noopener");
    const off = await load("");
    expect(off.openWhatsapp("Oi", { open })).toBe(false);
  });
});

describe("fillTemplate e composeMessage", () => {
  it("interpola e recusa placeholder vazio", async () => {
    const { fillTemplate } = await load("");
    expect(fillTemplate("Pedido {protocolo}", { protocolo: "LEM-1" })).toBe("Pedido LEM-1");
    expect(() => fillTemplate("Olá, {nome}", { nome: "" })).toThrow();
  });

  it("blocos separados por linha em branco, sem linhas vazias", async () => {
    const { composeMessage } = await load("");
    expect(composeMessage({ intro: "Olá!", head: ["*Nome:* Ana", ""], lines: ["a", "b"], ref: "Código: X", closing: "Tchau" })).toBe(
      "Olá!\n*Nome:* Ana\n\na\nb\n\nCódigo: X\n\nTchau",
    );
    expect(composeMessage({ intro: "Olá!", lines: [] })).toBe("Olá!");
  });
});

describe("mensagens por página (servidor)", () => {
  it("usa o i18n de cada contexto, nos 3 idiomas", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      expect(quoteEntryMessage(locale)).toBe(t(locale, "quote.whatsapp_messages.entry_direct"));
      expect(wizardQuestionMessage(locale)).toBe(t(locale, "quote.whatsapp_messages.wizard_question"));
      expect(postSubmitGenericMessage(locale)).toBe(t(locale, "quote.whatsapp_messages.post_submit_generic"));
      expect(contactMessage(locale)).toBe(t(locale, "shared.whatsapp.message_contact"));
      expect(serviceMessage(locale, "mvp")).not.toMatch(/\{/);
    }
  });
});
