/**
 * Aprimoramento do formulário de /contato (BLUEPRINT §6.9) — dono: conversion.
 * Vanilla. Sem este script o form continua funcionando (POST nativo para o
 * Netlify, validação nativa). Com ele: validação no blur e no envio, mensagem
 * por campo, máscara de telefone, envio por fetch (timeout, 3 tentativas,
 * honeypot, tempo mínimo) e confirmação/erro na mesma página, com os dados
 * preservados. Mensagens vêm do HTML (data-*), nunca hardcoded.
 *
 * Medição sem valor digitado: form_field_complete (campo preenchido e deixado,
 * B337) e form_validation_error (erro exibido, B338), uma vez por campo/tipo.
 * Telefone: em pt, BR com DDD (máscara) ou internacional com "+"; em /en e /es,
 * só com "+" e o código do país, sem a máscara BR (lib/forms formatPhone).
 * Deploy preview (data-preview-submit, B277): sem POST e sem contact_submitted.
 * Falha sem rede (B340): lead_failed espera a conexão voltar (trackWhenOnline)
 * em vez de se perder junto com o hit do GA4.
 */

import { createOnce, flushPendingEvents, track, trackWhenOnline } from "@/lib/analytics";
import {
  formatPhone,
  HONEYPOT_FIELD,
  isFilled,
  isValidEmail,
  isValidPhone,
  previewSubmitActive,
  submitNetlifyForm,
  type FormFields,
  type PhoneLocale,
} from "@/lib/forms";

type FieldName = "name" | "email" | "phone" | "subject" | "message";
const ORDER: FieldName[] = ["name", "email", "phone", "subject", "message"];

/** Idioma do formulário (campo oculto `lang`); qualquer outro valor vale como pt. */
export function phoneLocaleOf(lang: string | null | undefined): PhoneLocale {
  return lang === "en" || lang === "es" ? lang : "pt";
}

/** Mensagem de erro de um campo ("" = válido). Pura, para os testes. */
export function contactFieldError(
  name: FieldName,
  value: string,
  messages: { required?: string; invalid?: string },
  locale: PhoneLocale = "pt",
): string {
  const filled = isFilled(value);
  switch (name) {
    case "name":
    case "subject":
    case "message":
      return filled ? "" : (messages.required ?? "");
    case "email":
      if (!filled) return messages.required ?? "";
      return isValidEmail(value) ? "" : (messages.invalid ?? "");
    case "phone":
      return !filled || isValidPhone(value, locale) ? "" : (messages.invalid ?? "");
  }
}

/** Origem do contato: ?origem= do link que trouxe, senão a página anterior do site, senão o site de fora. */
export function contactOrigin(search: string, referrer: string, host: string): string {
  const origem = new URLSearchParams(search).get("origem");
  if (origem) return origem.slice(0, 120);
  try {
    const url = new URL(referrer);
    return (url.host === host ? url.pathname : url.origin).slice(0, 200);
  } catch {
    return "";
  }
}

export function initContactForm(form: HTMLFormElement): void {
  const startedAt = Date.now();
  // Falha guardada offline numa página anterior desta aba (B340).
  void flushPendingEvents();
  form.noValidate = true;
  const section = form.closest("section") ?? document;
  const success = section.querySelector<HTMLElement>("[data-contact-success]");
  const errorPanel = form.querySelector<HTMLElement>("[data-contact-error]");
  const status = form.querySelector<HTMLElement>("[data-contact-status]");
  const origin = form.querySelector<HTMLInputElement>("[data-contact-origin]");
  const locale = phoneLocaleOf(form.querySelector<HTMLInputElement>('input[name="lang"]')?.value);
  if (origin) origin.value = contactOrigin(window.location.search, document.referrer, window.location.host);

  const touched = new Set<FieldName>();
  const once = createOnce();
  const preview = previewSubmitActive(form.hasAttribute("data-preview-submit"));
  let sending = false;

  const control = (name: FieldName) =>
    name === "subject"
      ? form.querySelector<HTMLElement>('[data-group="subject"]')
      : form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);

  const valueOf = (name: FieldName): string => {
    if (name === "subject") return form.querySelector<HTMLInputElement>('input[name="subject"]:checked')?.value ?? "";
    return form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)?.value ?? "";
  };

  const check = (name: FieldName, show: boolean): string => {
    const element = control(name);
    const value = valueOf(name);
    const message = contactFieldError(
      name,
      value,
      { required: element?.dataset.required, invalid: element?.dataset.invalid },
      locale,
    );
    if (show && message) {
      const error = isFilled(value) ? "invalid" : "required";
      if (once(`error:${name}:${error}`)) track("form_validation_error", { form: "contato", field_name: name, error });
    }
    if (show) {
      const slot = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
      if (slot) slot.textContent = message;
      const targets =
        name === "subject" ? [...form.querySelectorAll<HTMLInputElement>('input[name="subject"]')] : element ? [element] : [];
      for (const target of targets) {
        if (message) target.setAttribute("aria-invalid", "true");
        else target.removeAttribute("aria-invalid");
      }
    }
    return message;
  };

  for (const name of ORDER) {
    if (name === "subject") {
      form.querySelectorAll('input[name="subject"]').forEach((radio) =>
        radio.addEventListener("change", () => {
          touched.add("subject");
          check("subject", true);
          if (once("complete:subject")) track("form_field_complete", { form: "contato", field_name: "subject" });
        }),
      );
      continue;
    }
    const element = control(name);
    element?.addEventListener("blur", () => {
      touched.add(name);
      check(name, true);
      if (isFilled(valueOf(name)) && once(`complete:${name}`)) {
        track("form_field_complete", { form: "contato", field_name: name });
      }
    });
    element?.addEventListener("input", () => {
      if (touched.has(name)) check(name, true);
    });
  }

  // O mousedown no "Enviar" tiraria o foco do campo; o blur mostra a mensagem de
  // erro, o botão desce e o clique cai fora dele (o envio não acontecia). Sem
  // trocar o foco no mousedown, o clique chega ao botão; o teclado não muda.
  form.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((button) =>
    button.addEventListener("mousedown", (event) => event.preventDefault()),
  );

  const phone = form.querySelector<HTMLInputElement>('[name="phone"]');
  phone?.addEventListener("input", () => {
    phone.value = formatPhone(phone.value, locale);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;

    const invalid = ORDER.filter((name) => check(name, true) !== "");
    ORDER.forEach((name) => touched.add(name));
    if (invalid.length > 0) {
      const first = invalid[0] as FieldName;
      const target =
        first === "subject" ? form.querySelector<HTMLInputElement>('input[name="subject"]') : (control(first) as HTMLElement | null);
      target?.focus();
      return;
    }

    sending = true;
    if (status) status.textContent = form.dataset.sending ?? "";
    const data = new FormData(form);
    const fields: FormFields<"contato"> = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: formatPhone(String(data.get("phone") ?? ""), locale).trim(),
      subject: valueOf("subject"),
      message: String(data.get("message") ?? "").trim(),
      lang: String(data.get("lang") ?? ""),
      origin: String(data.get("origin") ?? ""),
      [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? ""),
    };
    const result = await submitNetlifyForm("contato", fields, { startedAt, preview });
    sending = false;
    if (status) status.textContent = "";

    if (result.ok || result.reason === "spam") {
      if (result.ok && !result.preview) {
        track("contact_submitted", { subject: fields.subject ?? "" });
        // O POST passou: a conexão está provada, e uma falha guardada offline sai agora.
        void flushPendingEvents({ reachable: true });
      }
      if (success) {
        const text = success.querySelector<HTMLElement>("[data-contact-success-text]");
        if (text && fields.phone && text.dataset.withPhone) text.textContent = text.dataset.withPhone;
        const project = success.querySelector<HTMLElement>("[data-contact-success-project]");
        if (project) project.hidden = !(fields.subject === "new_project" || fields.subject === "existing_system");
        success.dataset.visible = "true";
        success.focus();
      }
      return;
    }

    if (errorPanel) {
      errorPanel.hidden = false;
      errorPanel.focus();
      if (status) status.textContent = errorPanel.querySelector("h3")?.textContent ?? "";
    }
    trackWhenOnline(
      "lead_failed",
      { reason: result.reason, attempts: result.attempts, form: "contato" },
      { reason: result.reason, attempts: result.attempts, status: result.status ?? 0, form: "contato" },
    );
  });
}
