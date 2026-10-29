/**
 * Contrato com o Netlify Forms (BLUEPRINT §7.10; backlog B380, B381): as
 * declarações estáticas no HTML gerado têm EXATAMENTE os campos que a ilha e o
 * script enviam (o Netlify descarta campo não declarado), nos 3 idiomas, e o
 * formulário de /contato funciona sem JS (POST, data-netlify, honeypot, action).
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import ContactForm from "@/components/contact/ContactForm.astro";
import NetlifyForms from "@/components/quote/NetlifyForms.astro";
import { urlFor } from "@/config/routes";
import { FORM_FIELDS } from "@/lib/forms";

function formsIn(html: string): Map<string, { attrs: string; fields: string[] }> {
  const forms = new Map<string, { attrs: string; fields: string[] }>();
  for (const match of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)) {
    const attrs = match[1] ?? "";
    const name = /\bname="([^"]+)"/.exec(attrs)?.[1];
    if (!name) continue;
    const fields = [...(match[2] ?? "").matchAll(/<(?:input|textarea|select)\b[^>]*\bname="([^"]+)"/g)]
      .map((field) => field[1] as string)
      .filter((field) => field !== "form-name");
    forms.set(name, { attrs, fields: [...new Set(fields)] });
  }
  return forms;
}

describe("declaração estática (NetlifyForms.astro)", () => {
  it("briefing e contato, ocultos, com data-netlify, honeypot e os campos de lib/forms", async () => {
    const container = await AstroContainer.create();
    const forms = formsIn(await container.renderToString(NetlifyForms));
    for (const name of ["briefing", "contato"] as const) {
      const form = forms.get(name);
      expect(form, name).toBeDefined();
      expect(form?.attrs).toMatch(/data-netlify="true"/);
      expect(form?.attrs).toMatch(/netlify-honeypot="bot-field"/);
      expect(form?.attrs).toMatch(/\bhidden\b/);
      expect(form?.fields.sort()).toEqual([...FORM_FIELDS[name]].sort());
    }
  });
});

describe("formulário real de /contato", () => {
  it.each(["pt", "en", "es"] as const)("%s: POST nativo, campos iguais ao envio por JS, action para a confirmação", async (locale) => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, { props: { locale } });
    const form = formsIn(html).get("contato");
    expect(form).toBeDefined();
    expect(form?.attrs).toMatch(/method="POST"/);
    expect(form?.attrs).toMatch(/data-netlify="true"/);
    expect(form?.attrs).toMatch(/netlify-honeypot="bot-field"/);
    expect(form?.attrs).toMatch(/data-nr-block/);
    expect(form?.attrs).toContain(`action="${urlFor("contact", locale)}#mensagem-enviada"`);
    expect(form?.fields.sort()).toEqual([...FORM_FIELDS.contato].sort());
    expect(html).toContain('id="mensagem-enviada"');
    expect(html).toMatch(/name="name"[^>]*required|required[^>]*name="name"/);
  });
});
