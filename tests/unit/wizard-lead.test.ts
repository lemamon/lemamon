/**
 * Envio do wizard — payload do form `briefing` (BLUEPRINT §7.10), atribuição
 * (§7.1), validação do contato (§7.5), mensagens de WhatsApp (§7.7) e o resumo
 * do pós-envio (§7.8).
 */
import { describe, expect, it } from "vitest";

import { getSection, t } from "@/i18n";
import { FORM_FIELDS } from "@/lib/forms";
import { fillTemplate } from "@/lib/whatsapp";
import { CONSENT_ACCEPTED, CONSENT_DECLINED, CONSENT_KEY } from "@/scripts/storage-keys";
import type { RulesCopy } from "@/islands/wizard/copy";
import {
  answersPayload,
  buildAttribution,
  buildBriefingFields,
  buildSentSummary,
  firstName,
  gclidAllowed,
  withoutAdClickIds,
  leadEventParams,
  phoneRequired,
  validateContact,
  type ContactValues,
} from "@/islands/wizard/lead";
import { failureCopyText, failureWhatsappMessage, readableSummary, summaryWhatsappMessage } from "@/islands/wizard/messages";
import type { Answers } from "@/islands/wizard/model";
import { answerChips, type ChipContext } from "@/islands/wizard/rules";

const quote = getSection("pt", "quote");
const copy: RulesCopy = {
  steps: quote.steps,
  summary: quote.summary,
  whatsapp: quote.whatsapp_messages,
  contactForm: quote.contact_form,
};
const flags = { hasBudgetTiers: false, hasMonthlyTiers: false };
const chipCtx: ChipContext = { ...flags, tierLabel: () => undefined };

const answers: Answers = {
  stage: "problem_unclear",
  build_type: ["ops_system", "integration"],
  pain: [],
  deadline: "within_3_months",
  deadline_reason: "Antes da safra",
  budget: "approved",
  budget_set: "no_numbers",
  role: "i_decide",
};
const contact: ContactValues = {
  name: "  Ana Maria Souza ",
  email: "ana@empresa.com",
  channel: "whatsapp",
  phone: "48999998888",
  company: "Empresa X",
  details: "Hoje tudo é planilha.",
  bot: "",
};
const chips = answerChips(answers, copy, chipCtx);

describe("payload do briefing", () => {
  const fields = buildBriefingFields({
    answers,
    flags,
    chips,
    contact,
    score: "A",
    protocol: "LEM-20261019-ABCD",
    lang: "pt",
    attribution: { utm_source: "google", gclid: "g-123", origem: "home-hero", landing: "/" },
  });

  it("só campos declarados no form estático (o Netlify descarta o resto)", () => {
    for (const key of Object.keys(fields)) expect(FORM_FIELDS.briefing).toContain(key);
  });

  it("assunto da notificação = [score] protocolo, sem dado pessoal", () => {
    expect(fields.subject).toBe("[A] LEM-20261019-ABCD");
    expect(fields.subject).not.toContain("Ana");
  });

  it("contato limpo, telefone com máscara, canal pelo id", () => {
    expect(fields).toMatchObject({
      name: "Ana Maria Souza",
      email: "ana@empresa.com",
      phone: "(48) 99999-8888",
      channel: "whatsapp",
      company: "Empresa X",
      details: "Hoje tudo é planilha.",
      score: "A",
      protocol: "LEM-20261019-ABCD",
      lang: "pt",
      "bot-field": "",
    });
  });

  it("answers em JSON com ids estáveis (inclui deadline_reason) e gclid em campo próprio", () => {
    expect(JSON.parse(fields.answers ?? "")).toEqual({
      stage: "problem_unclear",
      build_type: ["ops_system", "integration"],
      pain: [],
      deadline: "within_3_months",
      deadline_reason: "Antes da safra",
      budget: "approved",
      budget_mode: "no_numbers",
      role: "i_decide",
    });
    expect(fields.gclid).toBe("g-123");
    expect(JSON.parse(fields.attribution ?? "")).toEqual({ utm_source: "google", origem: "home-hero", landing: "/" });
  });

  it("summary legível para a notificação do comercial", () => {
    expect(fields.summary).toContain(`${quote.steps.deadline.reason_short_label}: Antes da safra`);
    expect(fields.summary).not.toContain(quote.summary.skipped_answer);
    expect(readableSummary(chips).split("\n")).toHaveLength(6);
  });

  it("P3 de sistema no ar vai como system_pain", () => {
    expect(answersPayload({ stage: "maintain_live_system", system_pain: ["ongoing_care"] }, flags)).toMatchObject({
      system_pain: ["ongoing_care"],
    });
  });

  it("lead_submitted leva só ids, nunca texto livre", () => {
    expect(leadEventParams(answers, flags, "B")).toEqual({
      score: "B",
      stage: "problem_unclear",
      build_type: "ops_system,integration",
      deadline: "within_3_months",
      budget: "approved",
      role: "i_decide",
      pain: "",
    });
  });

  it("lead_submitted: P3 por ids, duração em segundos e event_id; nunca deadline_reason (B050, B339)", () => {
    const withPain: Answers = {
      ...answers,
      pain: ["manual_process", "late_numbers"],
      deadline_reason: "Edital em www.prefeitura.florianopolis.sc.gov.br/licitacoes/2026",
    };
    const params = leadEventParams(withPain, flags, "A", { eventId: "LEM-20261020-ABCD", startedAt: 1_000, now: 126_400 });
    expect(params).toMatchObject({ pain: "manual_process,late_numbers", event_id: "LEM-20261020-ABCD", time_to_convert_s: 125 });
    expect(Number.isInteger(params.time_to_convert_s)).toBe(true);
    expect(JSON.stringify(params)).not.toContain("prefeitura");
    // Sistema no ar: a P3 ativa é system_pain.
    expect(leadEventParams({ stage: "maintain_live_system", system_pain: ["ongoing_care"] }, flags, "B").pain).toBe("ongoing_care");
  });

  it("time_to_convert_s some sem início válido (futuro, mais de 30 dias ou ausente)", () => {
    expect(leadEventParams(answers, flags, "B", { startedAt: 2_000, now: 1_000 })).not.toHaveProperty("time_to_convert_s");
    expect(leadEventParams(answers, flags, "B", { startedAt: 0, now: 31 * 24 * 3600 * 1000 })).not.toHaveProperty("time_to_convert_s");
    expect(leadEventParams(answers, flags, "B", { now: 1_000 })).not.toHaveProperty("time_to_convert_s");
  });
});

describe("atribuição", () => {
  it("URL do wizard ganha do toque da sessão; sem ?etapa=", () => {
    const attribution = buildAttribution({
      pathname: "/orcamento",
      search: "?servico=mvp&origem=mvp-hero&etapa=2&utm_source=linkedin",
      host: "lemamon.dev",
      referrer: "https://lemamon.dev/servicos/mvp",
      sessionTouch: { landing: "/?gclid=abc", referrer: "https://www.google.com/", utm: { utm_source: "google" }, gclid: "abc", at: 1 },
    });
    expect(attribution).toEqual({
      utm_source: "linkedin",
      gclid: "abc",
      origem: "mvp-hero",
      servico: "mvp",
      referrer: "https://www.google.com/",
      landing: "/?gclid=abc",
      entry_page: "/orcamento",
    });
  });

  it("sem toque da sessão: página de entrada = o próprio wizard; referrer interno não conta", () => {
    expect(
      buildAttribution({ pathname: "/en/quote", search: "?entrada=descoberta", host: "lemamon.dev", referrer: "https://lemamon.dev/en/", sessionTouch: null }),
    ).toEqual({ entrada: "descoberta", landing: "/en/quote?entrada=descoberta", entry_page: "/en/quote" });
  });
});

describe("validação do contato (§7.5)", () => {
  it("nome e e-mail obrigatórios; e-mail com formato", () => {
    expect(validateContact({ ...contact, name: " ", email: "" })).toEqual({ name: "error_required", email: "error_required" });
    expect(validateContact({ ...contact, email: "ana@" })).toEqual({ email: "error_invalid" });
  });

  it("telefone obrigatório só se o canal exigir; preenchido, precisa ser válido", () => {
    expect(phoneRequired("whatsapp")).toBe(true);
    expect(phoneRequired("phone_call")).toBe(true);
    expect(phoneRequired("email")).toBe(false);
    expect(validateContact({ ...contact, phone: "" })).toEqual({ phone: "error_required" });
    expect(validateContact({ ...contact, channel: "email", phone: "" })).toEqual({});
    expect(validateContact({ ...contact, channel: "email", phone: "9999" })).toEqual({ phone: "error_invalid" });
  });

  it("telefone internacional com + e código do país (público de /en e /es)", () => {
    expect(validateContact({ ...contact, phone: "+1 415 555 0100" })).toEqual({});
    expect(validateContact({ ...contact, phone: "+44 7911 123456" })).toEqual({});
    expect(validateContact({ ...contact, phone: "+1 202 555 0123" })).toEqual({});
    expect(validateContact({ ...contact, phone: "+1 415" })).toEqual({ phone: "error_invalid" });
    expect(validateContact({ ...contact, phone: "99999-9999" })).toEqual({ phone: "error_invalid" });
  });

  it("em /en e /es o telefone sem + é inválido (nunca vira número brasileiro)", () => {
    for (const locale of ["en", "es"] as const) {
      expect(validateContact({ ...contact, phone: "5512345678" }, locale)).toEqual({ phone: "error_invalid" });
      expect(validateContact({ ...contact, phone: "1123456789" }, locale)).toEqual({ phone: "error_invalid" });
      expect(validateContact({ ...contact, phone: "+52 55 1234 5678" }, locale)).toEqual({});
      expect(validateContact({ ...contact, phone: "+55 48 99999-8888" }, locale)).toEqual({});
    }
    expect(validateContact({ ...contact, phone: "5512345678" }, "pt")).toEqual({});
  });

  it("em /es o número com + vai ao briefing como digitado, sem a máscara BR", () => {
    const es = buildBriefingFields({
      answers,
      flags,
      chips,
      contact: { ...contact, phone: "+52 55 1234 5678 " },
      score: "B",
      protocol: "LEM-20261019-ABCD",
      lang: "es",
      attribution: {},
    });
    expect(es.phone).toBe("+52 55 1234 5678");
  });
});

describe("mensagens de WhatsApp (§7.7)", () => {
  it("resumo: saudação, respostas, código e fechamento; pergunta pulada não gera linha", () => {
    const message = summaryWhatsappMessage(chips, copy.whatsapp, "LEM-20261019-ABCD");
    expect(message.startsWith(quote.whatsapp_messages.summary_intro)).toBe(true);
    expect(message).toContain(`*${quote.steps.stage.short_label}:*`);
    expect(message).not.toContain(quote.steps.pain.short_label);
    expect(message).toContain("Código do pedido: LEM-20261019-ABCD");
    expect(message.endsWith(quote.whatsapp_messages.summary_closing)).toBe(true);
  });

  it("falha: nome e empresa, sem e-mail, telefone, canal nem 'Mais detalhes'", () => {
    const message = failureWhatsappMessage(chips, copy.whatsapp, contact, "LEM-20261019-ABCD");
    expect(message).toContain("*Nome:* Ana Maria Souza");
    expect(message).toContain("*Empresa:* Empresa X");
    expect(message).not.toContain("ana@empresa.com");
    expect(message).not.toContain("99999");
    expect(message).not.toContain("planilha");
  });

  it("'Copiar minhas respostas' (e-mail) leva os detalhes", () => {
    expect(failureCopyText(chips, copy, contact, "LEM-1")).toContain("Hoje tudo é planilha.");
  });
});

describe("resumo para /orcamento/enviado", () => {
  it("primeiro nome, canal, contatos formatados, serviços e urgência", () => {
    const summary = buildSentSummary({ answers, chips, contact, protocol: "LEM-1", lang: "pt" }, copy);
    expect(firstName(contact.name)).toBe("Ana");
    expect(summary).toMatchObject({
      v: 1,
      firstName: "Ana",
      channel: "whatsapp",
      protocol: "LEM-1",
      role: "i_decide",
      deadlineUrgent: true,
      services: ["web_systems", "integrations"],
    });
    expect(summary.contacts).toEqual(["Ana Maria Souza", "ana@empresa.com", "(48) 99999-8888", "Empresa X", t("pt", "quote.contact_form.fields.channel.options.whatsapp")]);
    expect(summary.lines).toHaveLength(6);
  });

  it("measured: só o envio real marca o resumo como medido (lead_success_view, B341)", () => {
    expect(buildSentSummary({ answers, chips, contact, protocol: "LEM-1", lang: "pt" }, copy).measured).toBe(false);
    expect(buildSentSummary({ answers, chips, contact, protocol: "LEM-1", lang: "pt", measured: false }, copy).measured).toBe(false);
    expect(buildSentSummary({ answers, chips, contact, protocol: "LEM-1", lang: "pt", measured: true }, copy).measured).toBe(true);
  });
});

describe("linha do canal em 'Seus contatos' (painel de design: rótulo, não a palavra solta)", () => {
  for (const locale of ["pt", "en", "es"] as const) {
    it(`${locale}: o canal sai pelo template quote.sent.summary.channel_line`, () => {
      const q = getSection(locale, "quote");
      const localeCopy = { contactForm: q.contact_form, sentChannelLine: q.sent.summary.channel_line };
      const summary = buildSentSummary({ answers, chips, contact: { ...contact, channel: "email" }, protocol: "LEM-1", lang: locale }, localeCopy);
      const expected = fillTemplate(q.sent.summary.channel_line, { canal: q.contact_form.fields.channel.options.email });
      expect(summary.contacts.at(-1)).toBe(expected);
      expect(expected).not.toBe(q.contact_form.fields.channel.options.email);
      expect(expected).not.toContain("{canal}");
    });
  }
});

describe("gclid e o modo consentimento (B342)", () => {
  const storage = (value: string | null) => ({ getItem: (key: string) => (key === CONSENT_KEY ? value : null) });
  const attribution = {
    utm_source: "google",
    gclid: "TESTE-GCLID-123",
    landing: "/?gclid=TESTE-GCLID-123&utm_source=google",
    entry_page: "/orcamento",
  };
  const fieldsWith = (allowed: boolean) =>
    buildBriefingFields({ answers, flags, chips, contact, score: "A", protocol: "LEM-1", lang: "pt", attribution, gclidAllowed: allowed });

  it("consentimento + 'aceito' leva o gclid", () => {
    expect(gclidAllowed(true, storage(CONSENT_ACCEPTED))).toBe(true);
    expect(fieldsWith(true).gclid).toBe("TESTE-GCLID-123");
  });

  it("consentimento + 'recusado' sai vazio, inclusive dentro da página de entrada", () => {
    expect(gclidAllowed(true, storage(CONSENT_DECLINED))).toBe(false);
    const fields = fieldsWith(false);
    expect(fields.gclid).toBe("");
    expect(fields.attribution).not.toContain("TESTE-GCLID-123");
    expect(JSON.parse(fields.attribution ?? "{}")).toMatchObject({ utm_source: "google", landing: "/?utm_source=google" });
  });

  it("consentimento sem escolha (ou sem storage) sai vazio", () => {
    expect(gclidAllowed(true, storage(null))).toBe(false);
    expect(gclidAllowed(true, null)).toBe(false);
    expect(
      gclidAllowed(true, {
        getItem: () => {
          throw new Error("bloqueado");
        },
      }),
    ).toBe(false);
  });

  it("legítimo interesse leva o gclid (comportamento de antes)", () => {
    expect(gclidAllowed(false, storage(null))).toBe(true);
    expect(gclidAllowed(false, storage(CONSENT_DECLINED))).toBe(true);
    const fields = buildBriefingFields({ answers, flags, chips, contact, score: "A", protocol: "LEM-1", lang: "pt", attribution });
    expect(fields.gclid).toBe("TESTE-GCLID-123");
  });

  it("withoutAdClickIds tira gclid/gbraid/wbraid do campo e da query da página de entrada", () => {
    expect(withoutAdClickIds({ gbraid: "x", landing: "/servicos?wbraid=y&gclid=z", referrer: "https://www.google.com/" })).toEqual({
      landing: "/servicos",
      referrer: "https://www.google.com/",
    });
  });
});
