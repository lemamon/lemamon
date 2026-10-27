/**
 * Modelo da Política de Privacidade (dono: shell) — BLUEPRINT §6.13 e as notas
 * do i18n: _notes.privacy_structure (ordem), _notes.privacy_conditionals
 * (variantes) e _notes.launch_blockers. Puro: recebe o copy e as decisões e
 * devolve blocos prontos; PrivacyView.astro só desenha.
 *
 * Ordem de cada seção: title (H2) · body · items (<ul>, na ordem das chaves) ·
 * demais parágrafos na ordem das chaves · closing. Chaves *_link_label não são
 * parágrafos. Uma variante (_with_*, _individual) SUBSTITUI a chave base e nunca
 * aparece junto. Texto com {placeholder} sem valor NÃO renderiza (dado parcial
 * não renderiza); seção sem nenhum bloco some, inclusive do sumário.
 */

import type { ProvedorEmail } from "@/config/privacidade";
import type { Messages } from "@/i18n";

export type Segment = { text: string; href?: string; external?: boolean };
export type Block = { kind: "p"; segments: Segment[] } | { kind: "ul"; items: Segment[][] };
export interface PrivacySection {
  id: string;
  title: string;
  blocks: Block[];
}

/** Ferramentas ativas e decisões jurídicas que escolhem as variantes. */
export interface PrivacyFlags {
  /** GA4 configurado (PUBLIC_GA4_ID). */
  ga4: boolean;
  /** Tag do Google Ads no layout (premissa do lançamento, §10.2). */
  googleAds: boolean;
  /** Agente do New Relic no layout. */
  newRelic: boolean;
  /** baseAnuncios = "consentimento" (aviso de cookies). */
  consent: boolean;
  remarketing: boolean;
  /** Encarregado indicado (controller.dpo). */
  dpo: boolean;
  /** Controlador PJ (razão social + CNPJ) — senão, pessoa responsável. */
  companyData: boolean;
  /** Mecanismo de transferência internacional preenchido. */
  mechanism: boolean;
  /** Fornecedor do e-mail da Lemamon (processors.items.email / email_with_workspace / email_with_microsoft_365). */
  emailProvider: ProvedorEmail;
  /** Classificação define a forma de atendimento (*_with_routing). */
  routing: boolean;
  /** "Não vendemos dados pessoais." confirmado pelo dono e pelo advogado. */
  noSale: boolean;
  /**
   * Pixels opcionais publicados (B346/B347; config/privacidade.ts activePixels):
   * LinkedIn Insight Tag e Meta Pixel. Desligados (o padrão), os itens deles
   * (navigation_data.items.linkedin_insight / meta_pixel, processors.items.linkedin /
   * meta_pixel, retention.items.linkedin_insight / meta_pixel) nunca renderizam.
   */
  linkedinInsight?: boolean;
  metaPixel?: boolean;
  /**
   * A data de atualização aparece no topo (privacidade.atualizadaEm preenchida).
   * Sem ela, contact.body não promete "a data no topo" (auditoria SEO S03-14);
   * com ela, contact.body_with_date. Ausente = sem data.
   */
  dated?: boolean;
}

export type PrivacyVars = Partial<Record<string, string>>;

/**
 * Links interpolados (privacy_conditionals). {preferencias_de_cookies} só
 * aparece com o aviso de cookies (controls_with_consent, baseAnuncios =
 * "consentimento"): é um link interno que src/scripts/consent.ts intercepta
 * para reabrir o aviso (B344).
 */
export const PRIVACY_LINKS = {
  desativar_google_analytics: { href: "https://tools.google.com/dlpage/gaoptout", labelKey: "ga_optout_link_label", external: true },
  configuracoes_de_anuncios: { href: "https://myadcenter.google.com/", labelKey: "ads_settings_link_label", external: true },
  preferencias_de_cookies: { href: "#preferencias-de-cookies", labelKey: "cookie_preferences_link_label", external: false },
} as const;

type Sections = Messages["privacy"]["sections"];
type SectionId = keyof Sections;

/** Item de processors que descreve o e-mail da Lemamon, por fornecedor. */
const EMAIL_ITEM: Record<ProvedorEmail, string> = {
  gmail: "email",
  google_workspace: "email_with_workspace",
  microsoft_365: "email_with_microsoft_365",
};

/**
 * Qual chave renderizar no lugar de cada chave base (null = não renderiza).
 * Chaves que não aparecem aqui renderizam sempre (se os placeholders tiverem valor).
 */
function chooser(flags: PrivacyFlags): Record<string, (key: string) => string | null> {
  const pick = (cond: boolean, variant: string, base: string) => (cond ? variant : base);
  // "Mostrar anúncios da Lemamon a quem já visitou o site" vale para o remarketing
  // do Google Ads e para os pixels (uso só de remarketing, playbook 12 §9).
  const anyRemarketing = flags.remarketing || Boolean(flags.linkedinInsight) || Boolean(flags.metaPixel);
  return {
    controller: (key) => {
      if (key === "body") return flags.companyData ? "body" : "body_individual";
      if (key === "body_individual") return null; // tratado em "body"
      if (key === "dpo") return flags.dpo ? "dpo" : null;
      return key;
    },
    navigation_data: (key) => {
      switch (key) {
        case "ga4":
          return flags.ga4 ? key : null;
        case "google_ads":
          return flags.googleAds ? pick(flags.remarketing, "google_ads_with_remarketing", "google_ads") : null;
        case "google_ads_with_remarketing":
          return null;
        case "new_relic":
          return flags.newRelic ? key : null;
        case "linkedin_insight":
          return flags.linkedinInsight ? key : null;
        case "meta_pixel":
          return flags.metaPixel ? key : null;
        case "controls":
          return pick(flags.consent, "controls_with_consent", "controls");
        case "controls_with_consent":
          return null;
        case "controls_ga_optout":
          return flags.ga4 ? key : null;
        case "controls_opposition":
          return flags.googleAds && !flags.consent ? key : null;
        case "controls_google_account":
          return flags.googleAds ? key : null;
        default:
          return key;
      }
    },
    purposes: (key) => {
      switch (key) {
        case "service_order":
          return pick(flags.routing, "service_order_with_routing", "service_order");
        case "service_order_with_routing":
          return null;
        case "attribution":
          return flags.googleAds ? key : null;
        case "remarketing":
          return anyRemarketing ? key : null;
        case "closing":
          return flags.noSale ? key : null;
        default:
          return key;
      }
    },
    legal_basis: (key) => {
      switch (key) {
        case "new_relic":
          return flags.newRelic ? key : null;
        case "ads_measurement":
          return flags.googleAds ? pick(flags.consent, "ads_measurement_with_consent", "ads_measurement") : null;
        case "ads_measurement_with_consent":
          return null;
        case "remarketing":
          return anyRemarketing ? key : null;
        default:
          return key;
      }
    },
    // Capítulo de cookies (G13): com o aviso de cookies (consent), os cookies de
    // medição e de anúncio só rodam depois do aceite (measurement_with_consent
    // substitui measurement). Sem o aviso, o texto base só fala em bloquear no navegador.
    cookies: (key) => {
      switch (key) {
        case "measurement":
          return flags.consent ? "measurement_with_consent" : "measurement";
        case "measurement_with_consent":
          return null;
        default:
          return key;
      }
    },
    processors: (key) => {
      switch (key) {
        case "google_analytics":
          return flags.ga4 ? key : null;
        case "google_ads":
          return flags.googleAds ? key : null;
        case "email":
          return EMAIL_ITEM[flags.emailProvider];
        case "email_with_workspace":
        case "email_with_microsoft_365":
          return null;
        case "new_relic":
          return flags.newRelic ? key : null;
        case "linkedin":
          return flags.linkedinInsight ? key : null;
        case "meta_pixel":
          return flags.metaPixel ? key : null;
        case "closing":
          return pick(flags.mechanism, "closing_with_mechanism", "closing");
        case "closing_with_mechanism":
          return null;
        default:
          return key;
      }
    },
    retention: (key) => {
      switch (key) {
        case "navigation_ga4":
          return flags.ga4 ? key : null;
        case "navigation_google_ads":
        case "google_ads_conversions":
          return flags.googleAds ? key : null;
        case "navigation_new_relic":
          return flags.newRelic ? key : null;
        case "linkedin_insight":
          return flags.linkedinInsight ? key : null;
        case "meta_pixel":
          return flags.metaPixel ? key : null;
        default:
          return key;
      }
    },
    contact: (key) => {
      if (key === "body") return pick(Boolean(flags.dated), "body_with_date", "body");
      if (key === "body_with_date") return null; // tratado em "body"
      return key;
    },
    rights: (key) => {
      switch (key) {
        case "consent_deletion":
        case "consent_refusal_info":
          return flags.consent ? key : null;
        case "automated_review":
          return pick(flags.routing, "automated_review_with_routing", "automated_review");
        case "automated_review_with_routing":
          return null;
        default:
          return key;
      }
    },
  };
}

/**
 * Itens da Política que cada pixel opcional exige (B346/B347). Pixel publicado
 * sem eles = o site carregaria uma ferramenta que a Política não cita: o build
 * de produção cai (PrivacyView.astro, missingPixelCopy).
 */
export const PIXEL_POLICY_ITEMS = {
  linkedin: [
    ["navigation_data", "linkedin_insight"],
    ["processors", "linkedin"],
    ["retention", "linkedin_insight"],
  ],
  meta: [
    ["navigation_data", "meta_pixel"],
    ["processors", "meta_pixel"],
    ["retention", "meta_pixel"],
  ],
} as const satisfies Record<string, readonly (readonly [string, string])[]>;

/** Caminhos privacy.sections.<seção>.items.<item> que faltam no copy para o pixel. */
export function missingPixelCopy(sections: Sections, pixel: keyof typeof PIXEL_POLICY_ITEMS): string[] {
  const all = sections as unknown as Record<string, { items?: Record<string, unknown> } | undefined>;
  return PIXEL_POLICY_ITEMS[pixel]
    .filter(([section, item]) => typeof all[section]?.items?.[item] !== "string")
    .map(([section, item]) => `privacy.sections.${section}.items.${item}`);
}

const PLACEHOLDER = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/**
 * Texto → segmentos, com links nos placeholders de PRIVACY_LINKS. null se
 * algum placeholder não tiver valor (a frase inteira some).
 */
export function segmentsOf(template: string, vars: PrivacyVars, linkLabels: Partial<Record<string, string>>): Segment[] | null {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of template.matchAll(PLACEHOLDER)) {
    const name = match[1] as string;
    const start = match.index ?? 0;
    if (start > last) segments.push({ text: template.slice(last, start) });
    const link = PRIVACY_LINKS[name as keyof typeof PRIVACY_LINKS];
    if (link) {
      const label = linkLabels[link.labelKey];
      if (!label) return null;
      segments.push({ text: label, href: link.href, external: link.external });
    } else {
      const value = vars[name];
      if (value === undefined || value.trim() === "") return null;
      segments.push({ text: value });
    }
    last = start + match[0].length;
  }
  if (last < template.length) segments.push({ text: template.slice(last) });
  return segments;
}

/** Transforma a primeira ocorrência de `phrase` em link interno (âncora). */
function linkPhrase(segments: Segment[], phrase: string, href: string): Segment[] {
  const out: Segment[] = [];
  let done = false;
  for (const segment of segments) {
    const at = done || segment.href ? -1 : segment.text.indexOf(phrase);
    if (at < 0) {
      out.push(segment);
      continue;
    }
    if (at > 0) out.push({ text: segment.text.slice(0, at) });
    out.push({ text: phrase, href });
    if (at + phrase.length < segment.text.length) out.push({ text: segment.text.slice(at + phrase.length) });
    done = true;
  }
  return out;
}

const STRUCTURAL = new Set(["title", "body", "items", "closing"]);

/** Seções prontas para desenhar, na ordem do i18n. */
export function buildPrivacy(sections: Sections, vars: PrivacyVars, flags: PrivacyFlags): PrivacySection[] {
  const choose = chooser(flags);
  const result: PrivacySection[] = [];

  for (const id of Object.keys(sections) as SectionId[]) {
    const section = sections[id] as unknown as Record<string, unknown>;
    const resolve = choose[id] ?? ((key: string) => key);
    const linkLabels = Object.fromEntries(
      Object.entries(section).filter(([key, value]) => key.endsWith("_link_label") && typeof value === "string"),
    ) as Record<string, string>;
    const blocks: Block[] = [];

    const paragraph = (key: string) => {
      const chosen = resolve(key);
      if (!chosen) return;
      const text = section[chosen];
      if (typeof text !== "string") return;
      let segments = segmentsOf(text, vars, linkLabels);
      if (!segments) return;
      // "Dados de navegação" em data_collected.draft_measurement é link para a seção (privacy_structure).
      if (id === "data_collected" && chosen === "draft_measurement") {
        segments = linkPhrase(segments, sections.navigation_data.title, "#navigation_data");
      }
      blocks.push({ kind: "p", segments });
    };

    paragraph("body");

    const items = section.items as Record<string, string> | undefined;
    if (items) {
      const list: Segment[][] = [];
      for (const key of Object.keys(items)) {
        // A chave de uma variante resolve para null; ela só entra no lugar da base.
        const chosen = resolve(key);
        const text = chosen ? items[chosen] : undefined;
        if (typeof text !== "string") continue;
        const segments = segmentsOf(text, vars, linkLabels);
        if (segments) list.push(segments);
      }
      if (list.length) blocks.push({ kind: "ul", items: list });
    }

    for (const key of Object.keys(section)) {
      if (STRUCTURAL.has(key) || key.endsWith("_link_label")) continue;
      if (key === "body_individual") continue;
      paragraph(key);
    }

    paragraph("closing");

    if (blocks.length) result.push({ id, title: String(section.title), blocks });
  }
  return result;
}
