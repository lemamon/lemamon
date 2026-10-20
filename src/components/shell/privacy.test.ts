import { describe, expect, it } from "vitest";

import { activePixels, OPTIONAL_TOOL_VARS, OPTIONAL_TOOLS, privacidade, privacyLaunchBlockers, type Privacidade } from "@/config/privacidade";
import { getSection, LOCALES, type Messages } from "@/i18n";

import { buildPrivacy, missingPixelCopy, PIXEL_POLICY_ITEMS, segmentsOf, type PrivacyFlags, type PrivacySection, type PrivacyVars } from "./privacy";

const FULL_VARS: PrivacyVars = {
  email: "contato@exemplo.com",
  razao_social: "Exemplo Ltda",
  cnpj: "11.222.333/0001-81",
  nome_do_responsavel: "Fulana",
  nome_do_encarregado: "Beltrana",
  email_do_encarregado: "dpo@exemplo.com",
  mecanismo_transferencia: "cláusulas-padrão",
  prazo_retencao_pedidos: "12 meses",
  prazo_ga4: "14 meses",
  prazo_google_ads: "90 dias",
  prazo_conversoes_google_ads: "90 dias",
  prazo_new_relic: "8 dias",
  prazo_logs_hospedagem: "6 meses",
};

const BASE: PrivacyFlags = {
  ga4: true,
  googleAds: true,
  newRelic: true,
  consent: false,
  remarketing: false,
  dpo: false,
  companyData: true,
  mechanism: false,
  emailWorkspace: false,
  routing: false,
  noSale: false,
};

const textOf = (sections: PrivacySection[]) =>
  sections
    .flatMap((section) => [
      section.title,
      ...section.blocks.flatMap((block) =>
        block.kind === "p" ? block.segments.map((s) => s.text) : block.items.flatMap((item) => item.map((s) => s.text)),
      ),
    ])
    .join("\n");

describe("Política de Privacidade: montagem", () => {
  it("frase com placeholder sem valor não renderiza", () => {
    expect(segmentsOf("Prazo: {prazo_ga4}.", {}, {})).toBeNull();
    expect(segmentsOf("Prazo: {prazo_ga4}.", { prazo_ga4: "14 meses" }, {})).toEqual([
      { text: "Prazo: " },
      { text: "14 meses" },
      { text: "." },
    ]);
  });

  it("com tudo preenchido, nenhum {placeholder} cru vai ao ar, nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      const text = textOf(buildPrivacy(getSection(locale, "privacy.sections"), FULL_VARS, BASE));
      expect(text).not.toMatch(/\{[a-z_]+\}/);
    }
  });

  it("variante substitui a base e nunca aparece junto (consentimento, remarketing, workspace)", () => {
    const sections = getSection("pt", "privacy.sections");
    const base = textOf(buildPrivacy(sections, FULL_VARS, BASE));
    expect(base).toContain(sections.legal_basis.items.ads_measurement);
    expect(base).toContain(sections.navigation_data.controls);
    expect(base).not.toContain(sections.navigation_data.items.google_ads_with_remarketing);
    expect(base).toContain(sections.processors.items.email);
    expect(base).not.toContain(sections.processors.items.email_with_workspace);

    const consent = textOf(
      buildPrivacy(sections, FULL_VARS, { ...BASE, consent: true, remarketing: true, emailWorkspace: true }),
    );
    expect(consent).not.toContain(sections.legal_basis.items.ads_measurement);
    expect(consent).toContain(sections.navigation_data.items.google_ads_with_remarketing.slice(0, 60));
    expect(consent).not.toContain(sections.navigation_data.items.google_ads);
    expect(consent).toContain(sections.processors.items.email_with_workspace);
    expect(consent).not.toContain(sections.navigation_data.controls_opposition.slice(0, 40));
    // Com o aviso de cookies (B344), {preferencias_de_cookies} vira o link interno que reabre o aviso.
    expect(consent).toContain(sections.navigation_data.controls_with_consent.slice(0, 40));
    expect(consent).not.toContain(sections.navigation_data.controls.slice(0, 40));
    const links = buildPrivacy(sections, FULL_VARS, { ...BASE, consent: true })
      .flatMap((section) => section.blocks)
      .flatMap((block) => (block.kind === "p" ? block.segments : block.items.flat()))
      .filter((segment) => segment.href === "#preferencias-de-cookies");
    expect(links).toEqual([{ text: sections.navigation_data.cookie_preferences_link_label, href: "#preferencias-de-cookies", external: false }]);
  });

  it("ferramenta inativa sai da lista (GA4 sem PUBLIC_GA4_ID)", () => {
    const sections = getSection("pt", "privacy.sections");
    const text = textOf(buildPrivacy(sections, FULL_VARS, { ...BASE, ga4: false }));
    expect(text).not.toContain(sections.navigation_data.items.ga4.slice(0, 40));
    expect(text).not.toContain(sections.processors.items.google_analytics);
    expect(text).not.toContain("{desativar_google_analytics}");
  });

  it("controlador: PJ, pessoa responsável ou nada (sem frase pela metade)", () => {
    const sections = getSection("pt", "privacy.sections");
    const pj = buildPrivacy(sections, FULL_VARS, BASE).find((s) => s.id === "controller");
    expect(textOf(pj ? [pj] : [])).toContain("Exemplo Ltda");
    const person = buildPrivacy(sections, FULL_VARS, { ...BASE, companyData: false }).find((s) => s.id === "controller");
    expect(textOf(person ? [person] : [])).toContain("Fulana");
    const none = buildPrivacy(sections, { email: "x@y.z" }, { ...BASE, companyData: false });
    expect(none.find((s) => s.id === "controller")).toBeUndefined();
  });

  it("'Não vendemos dados pessoais.' só com a dupla confirmação", () => {
    const sections = getSection("pt", "privacy.sections");
    expect(textOf(buildPrivacy(sections, FULL_VARS, BASE))).not.toContain(sections.purposes.closing);
    expect(textOf(buildPrivacy(sections, FULL_VARS, { ...BASE, noSale: true }))).toContain(sections.purposes.closing);
  });

  it("'Dados de navegação' em draft_measurement é link para a seção", () => {
    for (const locale of LOCALES) {
      const sections = getSection(locale, "privacy.sections");
      const data = buildPrivacy(sections, FULL_VARS, BASE).find((s) => s.id === "data_collected");
      const links = data?.blocks.flatMap((b) => (b.kind === "p" ? b.segments.filter((s) => s.href) : []));
      expect(links).toContainEqual({ text: sections.navigation_data.title, href: "#navigation_data" });
    }
  });
});

describe("trava de lançamento da Política", () => {
  it("o config vazio do repositório lista o que falta", () => {
    const blockers = privacyLaunchBlockers(privacidade);
    expect(blockers.length).toBeGreaterThan(0);
    expect(blockers.join(" ")).toMatch(/baseAnuncios/);
  });

  it("consentimento não trava mais (o aviso de cookies com Consent Mode existe, B344); remarketing ainda exige consentimento", () => {
    const filled: Privacidade = {
      ...privacidade,
      baseAnuncios: "consentimento",
      encarregado: "pequeno_porte",
      prazos: Object.fromEntries(Object.keys(privacidade.prazos).map((k) => [k, { pt: "1", en: "1", es: "1" }])) as Privacidade["prazos"],
      atualizadaEm: "2026-10-19",
    };
    const blockers = privacyLaunchBlockers(filled).join(" ");
    expect(blockers).not.toMatch(/Consent Mode|baseAnuncios/);
    expect(privacyLaunchBlockers({ ...filled, baseAnuncios: "legitimo_interesse", remarketing: true }).join(" ")).toMatch(
      /remarketing exige baseAnuncios = 'consentimento'/,
    );
  });
});

describe("ferramentas opcionais (agenda, CRM, e-mail, automação, chat da equipe)", () => {
  const TOOL_ITEMS = ["scheduling", "crm", "email_tool", "automation", "team_chat"] as const;
  const toolVars: PrivacyVars = Object.fromEntries(
    OPTIONAL_TOOLS.flatMap((tool) => [
      [OPTIONAL_TOOL_VARS[tool].fornecedor, `Fornecedor-${tool}`],
      [OPTIONAL_TOOL_VARS[tool].prazo, `prazo-${tool}`],
    ]),
  );

  it("inativas por padrão: nenhum item delas na Política, nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      const sections = getSection(locale, "privacy.sections");
      const text = textOf(buildPrivacy(sections, FULL_VARS, BASE));
      for (const item of TOOL_ITEMS) {
        const template = sections.processors.items[item];
        expect(text).not.toContain(template.slice(template.indexOf(":") + 1, template.indexOf(":") + 20).trim());
      }
      expect(text).not.toMatch(/\{fornecedor_|\{prazo_(agenda|crm|email|automacao|chat)\}/);
    }
  });

  it("declaradas com fornecedor e prazo: entram em operadores e retenção", () => {
    for (const locale of LOCALES) {
      const text = textOf(buildPrivacy(getSection(locale, "privacy.sections"), { ...FULL_VARS, ...toolVars }, BASE));
      for (const tool of OPTIONAL_TOOLS) {
        expect(text.split(`Fornecedor-${tool}`).length - 1, `${locale} ${tool}`).toBe(2);
        expect(text).toContain(`prazo-${tool}`);
      }
    }
  });

  it("trava: ferramenta declarada sem prazo, e agenda ligada sem declarar", () => {
    const partial: Privacidade = {
      ...privacidade,
      ferramentas: { ...privacidade.ferramentas, crm: { fornecedor: "HubSpot", prazo: null } },
    };
    expect(privacyLaunchBlockers(partial).join(" ")).toMatch(/ferramentas\.crm\.prazo/);
    expect(privacyLaunchBlockers(privacidade, { hasAgenda: true }).join(" ")).toMatch(/ferramentas\.agenda/);
    const declared: Privacidade = {
      ...privacidade,
      ferramentas: { ...privacidade.ferramentas, agenda: { fornecedor: "Calendly", prazo: { pt: "1", en: "1", es: "1" } } },
    };
    expect(privacyLaunchBlockers(declared, { hasAgenda: true }).join(" ")).not.toMatch(/ferramentas\.agenda/);
  });
});

describe("pixels opcionais (B346 LinkedIn Insight Tag, B347 Meta Pixel)", () => {
  const consentFilled: Privacidade = {
    ...privacidade,
    baseAnuncios: "consentimento",
    encarregado: "pequeno_porte",
    prazos: Object.fromEntries(Object.keys(privacidade.prazos).map((k) => [k, { pt: "1", en: "1", es: "1" }])) as Privacidade["prazos"],
    atualizadaEm: "2026-10-19",
  };
  const prazo = { pt: "180 dias", en: "180 days", es: "180 días" };

  it("desligados por padrão: dados/dono.json não tem ID, nada fica ativo", () => {
    expect(activePixels(privacidade)).toEqual({ linkedin: "", meta: "" });
    expect(activePixels(consentFilled)).toEqual({ linkedin: "", meta: "" });
  });

  it("ID só vale com consentimento e só com dígitos", () => {
    const withIds = { ...consentFilled, pixels: { linkedin: { id: "1234567", prazo }, meta: { id: "123456789012345", prazo } } };
    expect(activePixels(withIds)).toEqual({ linkedin: "1234567", meta: "123456789012345" });
    expect(activePixels({ ...withIds, baseAnuncios: "legitimo_interesse" })).toEqual({ linkedin: "", meta: "" });
    expect(activePixels({ ...withIds, baseAnuncios: null })).toEqual({ linkedin: "", meta: "" });
    expect(activePixels({ ...withIds, pixels: { linkedin: { id: "12a4", prazo } } })).toEqual({ linkedin: "", meta: "" });
  });

  it("trava de lançamento: ID sem consentimento, ID inválido e ID sem prazo", () => {
    expect(privacyLaunchBlockers(consentFilled).join(" ")).not.toMatch(/pixels/);
    const noConsent = { ...consentFilled, baseAnuncios: "legitimo_interesse" as const, pixels: { linkedin: { id: "1234567", prazo } } };
    expect(privacyLaunchBlockers(noConsent).join(" ")).toMatch(/pixels\.linkedin exige baseAnuncios = 'consentimento'/);
    expect(privacyLaunchBlockers({ ...consentFilled, pixels: { meta: { id: "abc", prazo } } }).join(" ")).toMatch(/pixels\.meta\.id/);
    expect(privacyLaunchBlockers({ ...consentFilled, pixels: { meta: { id: "123456789012345", prazo: null } } }).join(" ")).toMatch(/pixels\.meta\.prazo/);
    expect(privacyLaunchBlockers({ ...consentFilled, pixels: { linkedin: { id: "1234567", prazo }, meta: null } }).join(" ")).not.toMatch(/pixels/);
  });

  // Os itens do copy ainda não existem (pedido ao redator); o seletor já decide por eles.
  const withPixelCopy = (locale: (typeof LOCALES)[number]) => {
    const sections = structuredClone(getSection(locale, "privacy.sections")) as unknown as Record<string, { items: Record<string, string> }>;
    for (const [section, item] of [...PIXEL_POLICY_ITEMS.linkedin, ...PIXEL_POLICY_ITEMS.meta]) {
      sections[section]!.items[item] = `PIXEL ${section}.${item} {${item.startsWith("meta") ? "prazo_meta_pixel" : "prazo_linkedin_insight"}}`;
    }
    return sections as unknown as Messages["privacy"]["sections"];
  };

  it("itens da Política só com o pixel publicado; desligado, nenhum renderiza", () => {
    const vars = { ...FULL_VARS, prazo_linkedin_insight: "180 dias", prazo_meta_pixel: "90 dias" };
    for (const locale of LOCALES) {
      const sections = withPixelCopy(locale);
      expect(textOf(buildPrivacy(sections, vars, BASE))).not.toContain("PIXEL ");
      const linkedinOnly = textOf(buildPrivacy(sections, vars, { ...BASE, consent: true, linkedinInsight: true }));
      expect(linkedinOnly.match(/PIXEL \S+linkedin/g)).toHaveLength(3);
      expect(linkedinOnly).not.toContain("meta_pixel");
      const both = textOf(buildPrivacy(sections, vars, { ...BASE, consent: true, linkedinInsight: true, metaPixel: true }));
      expect(both.match(/PIXEL /g)).toHaveLength(6);
      // Pixel = remarketing (12 §9): a finalidade e a base legal de remarketing entram junto.
      const remarketingPurpose = sections.purposes.items.remarketing;
      expect(textOf(buildPrivacy(sections, vars, { ...BASE, consent: true }))).not.toContain(remarketingPurpose);
      expect(linkedinOnly).toContain(remarketingPurpose);
      expect(linkedinOnly).toContain(sections.legal_basis.items.remarketing.split(":")[0]);
    }
  });

  it("missingPixelCopy aponta os itens que faltam (o build de produção cai com pixel publicado sem eles)", () => {
    const without = structuredClone(withPixelCopy("pt")) as unknown as Record<string, { items: Record<string, string> }>;
    delete without.processors!.items.linkedin;
    expect(missingPixelCopy(without as unknown as Messages["privacy"]["sections"], "linkedin")).toEqual(["privacy.sections.processors.items.linkedin"]);
    expect(missingPixelCopy(withPixelCopy("pt"), "linkedin")).toEqual([]);
    expect(missingPixelCopy(withPixelCopy("pt"), "meta")).toEqual([]);
  });
});
