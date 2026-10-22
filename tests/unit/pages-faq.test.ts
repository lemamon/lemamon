/**
 * FAQ das páginas do agente pages (src/components/services/kit/faq-compose.ts).
 * Dono: pages. A ordem e o teto seguem as notas faq_composition do i18n; as
 * regras de variante e de flag são do home (components/shared/faq.ts).
 */
import { describe, expect, it } from "vitest";

import { HWW_FAQ, HWW_FAQ_NEVER_REMOVED, HWW_FAQ_REMOVAL } from "@/components/how-we-work/hww-faq";
import { orderedFaq, type FaqEntry } from "@/components/services/kit/faq-compose";
import { SERVICE_FAQ, SERVICE_FAQ_MAX, SERVICE_FAQ_NEVER_REMOVED, SERVICE_FAQ_REMOVAL } from "@/components/services/kit/service-faq";
import { capFaq, FAQ_MAX, splitInlineLink, type FaqItem } from "@/components/shared/faq";
import { empresa } from "@/config/empresa";
import { computeFeatures, type Features } from "@/config/features";
import { SERVICE_KEYS, type ServiceKey } from "@/config/routes";
import { t } from "@/i18n";

import { baseSources, realSources } from "../fixtures/features";

function features(confirm: Partial<Features["confirm"]> = {}): Features {
  const base = computeFeatures(baseSources());
  return { ...base, confirm: { ...base.confirm, ...confirm } };
}

// A MESMA lista que src/views/ServiceView.astro usa (kit/service-faq.ts).
const WEB_SYSTEMS = SERVICE_FAQ.web_systems;
const REMOVAL = SERVICE_FAQ_REMOVAL;
const ids = (items: readonly FaqItem[]) => items.map((item) => item.id);

describe("orderedFaq — páginas de serviço", () => {
  it("sem flags: só perguntas próprias e do banco, na ordem declarada", () => {
    const items = orderedFaq("pt", WEB_SYSTEMS, features(), { service: "web_systems", removalOrder: REMOVAL.web_systems });
    expect(items.map((item) => item.id)).toEqual([
      "custom_vs_ready",
      "need_tech_knowledge",
      "start_with_part",
      "price",
      "pay_before_development",
      "how_long_system",
      "wont_stall",
      "how_follow_progress",
    ]);
    expect(items.every((item) => item.question.length > 0 && item.answer.length > 0)).toBe(true);
  });

  it("condicionais entram intercaladas; o teto de 11 (S03-10) tira invoice → skip_discovery e as perguntas próprias ficam; o NDA fica (F01)", () => {
    const on = features({ migracaoDados: true, escopoMudanca: true, semDescoberta: true, nda: true, notaFiscal: true });
    const items = orderedFaq("pt", WEB_SYSTEMS, on, { service: "web_systems", removalOrder: REMOVAL.web_systems, max: SERVICE_FAQ_MAX });
    expect(items).toHaveLength(SERVICE_FAQ_MAX);
    expect(items.map((item) => item.id)).toEqual([
      "custom_vs_ready",
      "need_tech_knowledge",
      "start_with_part",
      "data_migration",
      "price",
      "pay_before_development",
      "how_long_system",
      "wont_stall",
      "scope_change",
      "how_follow_progress",
      "nda",
    ]);
    // A ordem declarada continua valendo abaixo de 11: no teto de 9 do site, saem também need_tech_knowledge e start_with_part.
    const atNine = orderedFaq("pt", WEB_SYSTEMS, on, { service: "web_systems", removalOrder: REMOVAL.web_systems, max: FAQ_MAX });
    expect(atNine).toHaveLength(9);
    expect(atNine.map((item) => item.id)).toEqual([
      "custom_vs_ready",
      "data_migration",
      "price",
      "pay_before_development",
      "how_long_system",
      "wont_stall",
      "scope_change",
      "how_follow_progress",
      "nda",
    ]);
  });

  it("link das faixas só na pergunta de preço e só quando a página o passa", () => {
    const link = { href: "#investimento", text: "Ver as faixas" };
    const items = orderedFaq("en", WEB_SYSTEMS, features(), { service: "web_systems", ownLinks: { price: link } });
    expect(items.find((item) => item.id === "price")?.link).toEqual(link);
    expect(items.filter((item) => item.link)).toHaveLength(1);
    const plain = orderedFaq("en", WEB_SYSTEMS, features(), { service: "web_systems" });
    expect(plain.some((item) => item.link)).toBe(false);
  });

  it("D44: pay_before_development ('Pago alguma coisa antes do desenvolvimento?') no lugar de why_discovery_paid, sem sufixo de abatimento", () => {
    const entries: FaqEntry[] = [{ bank: "pay_before_development" }];
    for (const locale of ["pt", "en", "es"] as const) {
      const item = orderedFaq(locale, entries, features({ duracaoDescoberta: true }))[0];
      expect(item?.question, locale).toBe(t(locale, "faq.items.pay_before_development.question"));
      expect(item?.answer, locale).toBe(t(locale, "faq.items.pay_before_development.answer"));
    }
    for (const service of SERVICE_KEYS) {
      const declared = SERVICE_FAQ[service].map((entry) => ("bank" in entry ? entry.bank : "cond" in entry ? entry.cond : entry.own));
      expect(declared, service).not.toContain("why_discovery_paid");
      expect(declared, service).not.toContain("discovery_credit");
      expect(declared.includes("pay_before_development"), service).toBe(service !== "support");
    }
  });

  it("pergunta própria inexistente não vira item vazio; sem serviço, own é ignorada", () => {
    expect(orderedFaq("es", [{ own: "nao_existe" }], features(), { service: "mvp" })).toEqual([]);
    expect(orderedFaq("es", [{ own: "price" }], features())).toEqual([]);
  });
});

describe("orderedFaq — páginas do método", () => {
  it("/como-trabalhamos sem flags: os 5 do banco, wont_stall logo depois de how_long (how_we_work._notes.faq_composition)", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      const items = orderedFaq(locale, HWW_FAQ, features(), { removalOrder: HWW_FAQ_REMOVAL });
      expect(items.map((item) => item.id), locale).toEqual([
        "pay_before_development",
        "how_long",
        "wont_stall",
        "diagnosis_commitment",
        "need_tech_knowledge",
      ]);
      expect(items.find((item) => item.id === "wont_stall")?.question, locale).toBe(t(locale, "faq.items.wont_stall.question"));
    }
  });

  it("/como-trabalhamos com todas as flags (14 itens): o teto deixa 9 e nunca tira wont_stall", () => {
    // Pior caso, independente dos dados do dono: um item por entrada declarada.
    const ids = HWW_FAQ.map((entry) => ("bank" in entry ? entry.bank : "cond" in entry ? entry.cond : entry.own));
    expect(ids).toHaveLength(14);
    const all: FaqItem[] = ids.map((id) => ({ id, question: id, answer: id, source: "bank" }));
    const capped = capFaq(all, { removalOrder: HWW_FAQ_REMOVAL }).map((item) => item.id);
    expect(capped).toEqual([
      "pay_before_development",
      "how_long",
      "wont_stall",
      "diagnosis_format",
      "scope_change",
      "code_ownership",
      "skip_discovery",
      "other_cities",
      "payment_terms",
    ]);
    for (const id of HWW_FAQ_NEVER_REMOVED) expect(capped, id).toContain(id);
  });

  it("/como-trabalhamos com os dados de hoje: other_cities logo depois do nda, na variante do exterior; sai need_tech_knowledge (S05-7)", () => {
    const real = computeFeatures(realSources());
    for (const locale of ["pt", "en", "es"] as const) {
      const items = orderedFaq(locale, HWW_FAQ, real, { removalOrder: HWW_FAQ_REMOVAL });
      expect(ids(items), locale).toEqual([
        "pay_before_development",
        "how_long",
        "wont_stall",
        "diagnosis_commitment",
        "scope_change",
        "code_ownership",
        "discovery_duration",
        "nda",
        "other_cities",
      ]);
      const cities = items.find((item) => item.id === "other_cities");
      expect(cities?.question, locale).toBe(t(locale, "faq.conditional.other_cities.question_with_abroad"));
      expect(cities?.answer, locale).toBe(t(locale, "faq.conditional.other_cities.answer_with_abroad"));
    }
  });

  it("os 3 idiomas devolvem o mesmo conjunto de perguntas", () => {
    const ids = (locale: "pt" | "en" | "es") =>
      orderedFaq(locale, WEB_SYSTEMS, features({ escopoMudanca: true }), { service: "web_systems" }).map((item) => item.id);
    expect(ids("en")).toEqual(ids("pt"));
    expect(ids("es")).toEqual(ids("pt"));
  });
});

describe("orderedFaq — 'diagnóstico gratuito' vira link no meio da resposta (services._notes.faq_links)", () => {
  const LINKED: [ServiceKey, string][] = [
    ["web_systems", "custom_vs_ready"],
    ["mobile_apps", "app_or_web"],
    ["integrations", "integrate_or_replace"],
    ["integrations", "integrate_existing"],
  ];

  it("o trecho existe na resposta nos 3 idiomas e o texto não muda", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      const phrase = t(locale, "services.template.faq_diagnosis_link_phrase");
      for (const [service, id] of LINKED) {
        const inlineLink = { phrase, href: `/x?servico=${service}&origem=${service}-faq` };
        const [item] = orderedFaq(locale, [{ own: id }], features(), { service, ownInlineLinks: { [id]: inlineLink } });
        expect(item?.inlineLink).toEqual(inlineLink);
        const parts = item ? splitInlineLink(item) : null;
        expect(parts, `${locale} ${service}.${id}`).not.toBeNull();
        expect(`${parts?.before}${parts?.phrase}${parts?.after}`).toBe(item?.answer);
      }
    }
  });
});

describe("'O projeto vai parar no meio?' nas páginas de projeto da PME (faq._notes.wont_stall, painel de design)", () => {
  const PME: [ServiceKey, string][] = [
    ["web_systems", "how_long_system"],
    ["mobile_apps", "how_long_app"],
    ["integrations", "how_long_integration"],
  ];
  // Estado aprovado pelo dono: scope_change publicado (decisão 5).
  const approved = () => features({ escopoMudanca: true });

  for (const locale of ["pt", "en", "es"] as const) {
    it(`${locale}: wont_stall do banco logo depois do how_long_*, e cada FAQ fica com 9`, () => {
      for (const [service, howLong] of PME) {
        const items = orderedFaq(locale, SERVICE_FAQ[service], approved(), { service, removalOrder: REMOVAL[service], max: SERVICE_FAQ_MAX });
        const ids = items.map((item) => item.id);
        expect(ids[ids.indexOf(howLong) + 1], `${locale} ${service}`).toBe("wont_stall");
        const item = items.find((entry) => entry.id === "wont_stall");
        expect(item?.source, `${locale} ${service}`).toBe("bank");
        expect(item?.question).toBe(t(locale, "faq.items.wont_stall.question"));
        expect(item?.answer).toBe(t(locale, "faq.items.wont_stall.answer"));
        expect(items, `${locale} ${service}`).toHaveLength(9);
      }
    });
  }

  it("o MVP continua com a pergunta própria (services.mvp.faq.wont_stall), não a do banco", () => {
    const items = orderedFaq("pt", SERVICE_FAQ.mvp, features(), { service: "mvp", removalOrder: REMOVAL.mvp });
    const item = items.find((entry) => entry.id === "wont_stall");
    expect(item?.source).toBe("page");
    expect(item?.question).toBe(t("pt", "services.mvp.faq.wont_stall.question"));
  });

  it("sustentação não tem wont_stall (não é projeto) e abre por how_it_starts", () => {
    const items = orderedFaq("pt", SERVICE_FAQ.support, features(), { service: "support", removalOrder: REMOVAL.support });
    expect(items.map((item) => item.id)).not.toContain("wont_stall");
    expect(items[0]?.id).toBe("how_it_starts");
  });
});

describe("Teto de 11 (SERVICE_FAQ_MAX, auditoria SEO S03-10) nas 5 páginas de serviço, no pior caso (todas as entradas visíveis)", () => {
  // Pior caso: toda condicional ligada e com texto. Algumas dependem de texto
  // escolhido pelo dono (ex.: code_ownership), que o orderedFaq lê do
  // confirmacoes real; por isso o teto é provado direto no capFaq, com um item
  // por entrada declarada, na ordem da página.
  const entryId = (entry: FaqEntry) => ("bank" in entry ? entry.bank : "cond" in entry ? entry.cond : entry.own);
  const worstCase = (service: ServiceKey): FaqItem[] =>
    SERVICE_FAQ[service].map((entry) => ({ id: entryId(entry), question: "q", answer: "a", source: "page" as const }));

  for (const service of SERVICE_KEYS) {
    it(`${service}: no máximo 11, e as objeções que nunca saem continuam lá`, () => {
      const all = worstCase(service);
      const kept = capFaq(all, { removalOrder: REMOVAL[service], max: SERVICE_FAQ_MAX });
      expect(kept.length, service).toBeLessThanOrEqual(SERVICE_FAQ_MAX);
      const ids = new Set(kept.map((item) => item.id));
      for (const id of SERVICE_FAQ_NEVER_REMOVED) {
        if (all.some((item) => item.id === id)) expect(ids.has(id), `${service}: ${id}`).toBe(true);
      }
    });
  }

  it("aplicativos: no pior caso só invoice sai; code_ownership, nda e a pergunta própria store_publishing ficam", () => {
    const kept = capFaq(worstCase("mobile_apps"), { removalOrder: REMOVAL.mobile_apps, max: SERVICE_FAQ_MAX }).map((item) => item.id);
    expect(kept).toContain("code_ownership");
    expect(kept).toContain("nda");
    expect(kept).toContain("store_publishing");
    expect(kept).not.toContain("invoice");
  });

  it("o teto de 11 vale só nas páginas de serviço: o resto do site continua em 9", () => {
    expect(SERVICE_FAQ_MAX).toBe(11);
    expect(FAQ_MAX).toBe(9);
  });

  it("toda entrada declarada existe no i18n (nenhuma pergunta some em silêncio)", () => {
    const ownIds = (entries: readonly FaqEntry[]) => entries.flatMap((entry) => ("own" in entry ? [entry.own] : []));
    for (const service of SERVICE_KEYS) {
      for (const own of ownIds(SERVICE_FAQ[service])) {
        for (const locale of ["pt", "en", "es"] as const) {
          expect(orderedFaq(locale, [{ own }], features(), { service }), `${locale} ${service}.${own}`).toHaveLength(1);
        }
      }
    }
  });
});

describe("Garantias e preço à vista nas páginas de serviço (auditoria de conversão F01, F12, F15)", () => {
  it("integrações: data_access perto do topo; com NDA, a pergunta e a resposta citam o NDA e o e-mail do config", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      const on = orderedFaq(locale, SERVICE_FAQ.integrations, { ...features({ nda: true }), hasWhatsapp: true }, { service: "integrations" });
      const item = on.find((entry) => entry.id === "data_access");
      expect(ids(on).indexOf("data_access"), locale).toBe(2);
      expect(item?.question).toBe(t(locale, "services.integrations.faq.data_access.question_with_nda"));
      expect(item?.answer).toBe(t(locale, "services.integrations.faq.data_access.answer_with_nda", { email: empresa.email }));
      expect(ids(on), locale).not.toContain("nda");
      expect(ids(on), locale).not.toContain("how_follow_progress");
      // Sem WhatsApp no ambiente, a variante cita só o e-mail.
      const noWhatsapp = orderedFaq(locale, SERVICE_FAQ.integrations, { ...features({ nda: true }), hasWhatsapp: false }, { service: "integrations" });
      const plainEmail = noWhatsapp.find((entry) => entry.id === "data_access")?.answer ?? "";
      expect(plainEmail).toBe(t(locale, "services.integrations.faq.data_access.answer_with_nda_no_whatsapp", { email: empresa.email }));
      expect(plainEmail).not.toMatch(/whatsapp/i);
      // Sem a flag nda: a pergunta só sobre os dados, sem afirmar NDA.
      const off = orderedFaq(locale, SERVICE_FAQ.integrations, features(), { service: "integrations" }).find((entry) => entry.id === "data_access");
      expect(off?.question).toBe(t(locale, "services.integrations.faq.data_access.question"));
      expect(`${off?.question} ${off?.answer}`).not.toMatch(/NDA/);
    }
  });

  it("MVP: preço e prazo nas duas primeiras perguntas; o NDA logo depois do código", () => {
    const on = features({ codigoProprietario: true, nda: true, escopoMudanca: true });
    for (const locale of ["pt", "en", "es"] as const) {
      const list = ids(orderedFaq(locale, SERVICE_FAQ.mvp, on, { service: "mvp", removalOrder: REMOVAL.mvp }));
      expect(list.slice(0, 2), locale).toEqual(["price", "how_long_mvp"]);
      expect(list[list.indexOf("code_ownership") + 1], locale).toBe("nda");
    }
  });

  it("dados de hoje (dados/dono.json, 22/10/2026): o que cada página de serviço mostra, sem cortar pergunta própria (S03-10)", () => {
    const real = computeFeatures(realSources());
    const visible = (service: ServiceKey) =>
      ids(orderedFaq("pt", SERVICE_FAQ[service], real, { service, removalOrder: REMOVAL[service], max: SERVICE_FAQ_MAX }));
    expect(visible("web_systems")).toEqual([
      "custom_vs_ready",
      "need_tech_knowledge",
      "start_with_part",
      "price",
      "pay_before_development",
      "how_long_system",
      "wont_stall",
      "scope_change",
      "how_follow_progress",
      "code_ownership",
      "nda",
    ]);
    expect(visible("mobile_apps")).toEqual([
      "app_or_web",
      "ios_android",
      "store_publishing",
      "price",
      "pay_before_development",
      "how_long_app",
      "wont_stall",
      "scope_change",
      "how_follow_progress",
      "code_ownership",
      "nda",
    ]);
    expect(visible("integrations")).toEqual([
      "integrate_existing",
      "need_tech_knowledge",
      "data_access",
      "integrate_or_replace",
      "price",
      "pay_before_development",
      "how_long_integration",
      "wont_stall",
      "scope_change",
      "code_ownership",
    ]);
    expect(visible("mvp")).toEqual([
      "price",
      "how_long_mvp",
      "pay_before_development",
      "discovery_duration",
      "wont_stall",
      "code_ownership",
      "nda",
      "scope_change",
      "what_goes_in",
      "after_mvp",
      "what_is_mvp",
    ]);
    // Sustentação responde NDA e propriedade do código logo depois do preço (S03-6).
    expect(visible("support")).toEqual(["how_it_starts", "support_vs_evolution", "price", "nda", "code_ownership"]);
  });

  it("prazos e preço do MVP abrem pela afirmativa (F08): sem 'não chuta prazo' nem 'Depende' na 1ª palavra", () => {
    const keys = [
      "services.web_systems.faq.how_long_system.answer",
      "services.mobile_apps.faq.how_long_app.answer",
      "services.integrations.faq.how_long_integration.answer",
      "services.mvp.faq.how_long_mvp.answer",
      "services.mvp.faq.price.answer",
    ] as const;
    for (const locale of ["pt", "en", "es"] as const) {
      for (const key of keys) {
        const text = t(locale, key);
        expect(text, `${locale} ${key}`).not.toMatch(/^(Depende|It depends|Depende)/);
        expect(text, `${locale} ${key}`).not.toMatch(/não chuta prazo|don't guess at timelines|no damos plazos a ciegas/);
      }
    }
  });
});
