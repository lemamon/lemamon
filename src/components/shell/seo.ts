/**
 * Dados de SEO por rota (dono: shell) — BLUEPRINT §10.3. SÓ SERVIDOR (usa i18n).
 *
 * - Imagem de compartilhamento 1200×630 por página e idioma (ogImageFor):
 *   cartão próprio nas páginas que têm `og_image_headline` no i18n, padrão do
 *   idioma nas demais. Os JPEGs são gerados por scripts/build-og-image.sh
 *   (mesma lista de páginas que OG_PAGE_HEADLINE) em public/assets/img/og/.
 * - JSON-LD por chave de rota (routeJsonLd): Organization + ProfessionalService
 *   (Home, Sobre), Service (serviços, Sprint de Descoberta). FAQPage é do
 *   componente Faq; BreadcrumbList, do Breadcrumb; Article, da view do post.
 *   Nenhum dado inventado: sem areaServed, sem nota, sem telefone; razão
 *   social, CNPJ e ano de fundação só com empresa.ts preenchido.
 */

import { empresa, formatCnpj } from "@/config/empresa";
import { PROFILE_IDS, perfis } from "@/config/perfis";
import { absoluteUrl, canonicalUrl, SERVICE_KEYS, SERVICE_ROUTE, SITE_URL, urlFor, type RouteKey, type ServiceKey } from "@/config/routes";
import { ADDRESS, SITE_NAME } from "@/config/site";
import { LOCALE_META, t, tDynamic, type Locale, type TextKey } from "@/i18n";

export interface OgImage {
  /** Caminho em public/ ou URL absoluta. */
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

/** Páginas com cartão próprio → chave i18n da headline do cartão. Manter igual a PAGES em scripts/build-og-image.sh. */
export const OG_PAGE_HEADLINE: Partial<Record<RouteKey, TextKey>> = {
  how_we_work: "how_we_work.og_image_headline",
  discovery_sprint: "discovery_sprint.og_image_headline",
  pricing: "pricing.og_image_headline",
  service_web_systems: "services.web_systems.og_image_headline",
  service_mobile_apps: "services.mobile_apps.og_image_headline",
  service_integrations: "services.integrations.og_image_headline",
  service_mvp: "services.mvp.og_image_headline",
  service_support: "services.support.og_image_headline",
};

export const OG_DIR = "/assets/img/og";

/** Arquivo do cartão em public/ (sem a barra inicial: "assets/img/og/pricing-en.jpg"). */
export function ogImageFile(route: RouteKey | "default", locale: Locale): string {
  return `${OG_DIR.slice(1)}/${route}-${locale}.jpg`;
}

/** Imagem de compartilhamento da página (1200×630, JPEG). */
export function ogImageFor(route: RouteKey, locale: Locale): Required<OgImage> {
  const headlineKey = OG_PAGE_HEADLINE[route];
  if (headlineKey) {
    return {
      src: `/${ogImageFile(route, locale)}`,
      // i18n services._notes.og_image: og:image:alt = og_image_headline + " — Lemamon".
      alt: `${t(locale, headlineKey)} — ${t(locale, "meta.site_name")}`,
      width: 1200,
      height: 630,
    };
  }
  return {
    src: `/${ogImageFile("default", locale)}`,
    alt: t(locale, "meta.default_og_image_alt"),
    width: 1200,
    height: 630,
  };
}

/* ------------------------------------------------------------------ *
 * JSON-LD
 * ------------------------------------------------------------------ */

export type JsonLdNode = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Ícone quadrado da marca (public/icon-512.png), usado como logo da Organization. */
export const LOGO_PATH = "/icon-512.png";

/** sameAs: os 3 perfis confirmados (BLUEPRINT §1.5 e §6.1; decisão aberta no CONTRACT §15.1). */
export function sameAs(): string[] {
  return PROFILE_IDS.map((id) => perfis[id].url);
}

/** Flags de features.ts que o JSON-LD consulta (when_data: dado parcial não entra). */
export interface SeoFlags {
  hasCompanyData: boolean;
}

/** Organization + ProfessionalService (Home e Sobre). */
export function organizationNode(locale: Locale, flags: SeoFlags): JsonLdNode {
  const node: JsonLdNode = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl(urlFor("home", "pt")),
    logo: absoluteUrl(LOGO_PATH),
    image: absoluteUrl(ogImageFor("home", locale).src),
    description: t(locale, "meta.organization_description"),
    email: empresa.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.country,
    },
    sameAs: sameAs(),
  };
  if (flags.hasCompanyData) {
    node.legalName = empresa.razaoSocial.trim();
    node.taxID = formatCnpj(empresa.cnpj);
  }
  if (empresa.anoFundacao) node.foundingDate = String(empresa.anoFundacao);
  return node;
}

/** WebSite (Home), ligado à Organization. */
export function websiteNode(locale: Locale): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: absoluteUrl(urlFor("home", locale)),
    inLanguage: LOCALE_META[locale].htmlLang,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Referência embutida ao provedor (o @id sozinho não resolve fora da página da Home). */
function providerRef(): JsonLdNode {
  return { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: absoluteUrl(urlFor("home", "pt")) };
}

const SERVICE_BY_ROUTE = Object.fromEntries(SERVICE_KEYS.map((key) => [SERVICE_ROUTE[key], key])) as Partial<
  Record<RouteKey, ServiceKey>
>;

/** Service (5 serviços + Sprint de Descoberta). */
export function serviceNode(route: RouteKey, locale: Locale, description: string): JsonLdNode | null {
  const service = SERVICE_BY_ROUTE[route];
  let name: string | null = null;
  let serviceType: string | null = null;
  if (service) {
    name = tDynamic(locale, `services.${service}.h1`);
    serviceType = tDynamic(locale, `services.${service}.name`);
  } else if (route === "discovery_sprint") {
    name = t(locale, "shared.breadcrumb.discovery_sprint");
    serviceType = name;
  }
  if (!name) return null;
  return {
    "@type": "Service",
    name,
    serviceType,
    description,
    url: canonicalUrl(route, locale),
    provider: providerRef(),
  };
}

/** Nós JSON-LD que o SEO.astro emite para a rota (o resto vem dos componentes). */
export function routeJsonLd(route: RouteKey, locale: Locale, description: string, flags: SeoFlags): JsonLdNode[] {
  if (route === "home") return [websiteNode(locale), organizationNode(locale, flags)];
  if (route === "about") return [organizationNode(locale, flags)];
  const service = serviceNode(route, locale, description);
  return service ? [service] : [];
}

/** Envelope @graph com @context, ou null quando não há nada a emitir. */
export function graph(nodes: JsonLdNode[]): JsonLdNode | null {
  return nodes.length ? { "@context": "https://schema.org", "@graph": nodes } : null;
}
