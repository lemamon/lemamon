/**
 * Dados de SEO por rota (dono: shell) — BLUEPRINT §10.3. SÓ SERVIDOR (usa i18n).
 *
 * - Imagem de compartilhamento 1200×630 por página e idioma (ogImageFor):
 *   cartão próprio nas páginas que têm `og_image_headline` no i18n, padrão do
 *   idioma nas demais. Os JPEGs são gerados por scripts/build-og-image.sh
 *   (mesma lista de páginas que OG_PAGE_HEADLINE) em public/assets/img/og/.
 * - JSON-LD por chave de rota (routeJsonLd): WebSite (Home, o mesmo nó nos 3
 *   idiomas), Organization + ProfessionalService (Home, Sobre), Person (Sobre,
 *   uma por pessoa do time que atua em projetos) e Service (serviços, Sprint de
 *   Descoberta). FAQPage é do componente Faq; BreadcrumbList, do Breadcrumb;
 *   Article, da view do post (publisher e isPartOf por @id).
 *   Nenhum dado inventado: sem nota, sem telefone, sem founder; areaServed e
 *   idiomas só com as flags da D31 (confirmacoes.outrasCidades/atendeExterior,
 *   auditoria SEO S02-3); razão social, CNPJ e ano de fundação só com
 *   empresa.ts preenchido; Person só com hasTeam (pessoa real em dados/dono.json).
 */

import { empresa, formatCnpj } from "@/config/empresa";
import { PROFILE_IDS, perfis, type Perfil, type ProfileId } from "@/config/perfis";
import { absoluteUrl, canonicalUrl, SERVICE_KEYS, SERVICE_ROUTE, SITE_URL, urlFor, type RouteKey, type ServiceKey } from "@/config/routes";
import { ADDRESS, SITE_NAME } from "@/config/site";
import { LOCALE_META, LOCALES, t, tDynamic, type Locale, type TextKey } from "@/i18n";

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

/**
 * <meta name="robots"> das páginas indexáveis (auditoria SEO S01-10): libera a
 * prévia grande das imagens (Google Imagens, Discover). Com a camada fictícia,
 * vale ROBOTS_FICTICIO (camada-ficticia.ts) em todas as páginas.
 */
export const ROBOTS_INDEX = "index, follow, max-image-preview:large";
/** Páginas noindex/erro de routes.ts (404, pedido enviado). */
export const ROBOTS_NOINDEX = "noindex, follow";

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

/**
 * sameAs: só os perfis com `publicar: true` em dados/dono.json › perfis
 * (BLUEPRINT §1.5 e §6.1; auditoria SEO S02-1). Perfil que o dono despublica
 * sai também do JSON-LD, não só da Home.
 */
export function sameAs(source: Record<ProfileId, Perfil> = perfis): string[] {
  return PROFILE_IDS.filter((id) => source[id].publicar).map((id) => source[id].url);
}

/** Flags de features.ts que o JSON-LD consulta (when_data: dado parcial não entra). */
export interface SeoFlags {
  hasCompanyData: boolean;
  /** features.confirm.outrasCidades (D31): atende a distância empresas de outras cidades do Brasil. */
  outrasCidades?: boolean;
  /** features.confirm.atendeExterior (D31; features.ts já exige outrasCidades): atende empresas de qualquer país. */
  atendeExterior?: boolean;
}

/** Idiomas do site, no formato de <html lang> ("pt-BR", "en", "es"). */
export const SITE_LANGUAGES: readonly string[] = LOCALES.map((locale) => LOCALE_META[locale].htmlLang);

/**
 * Pessoa do time em /sobre (auditoria SEO S03-1, S05-2), já no idioma da
 * página. Só quem atua em projetos (hasTeam); o SEO.astro monta a lista a
 * partir de dados/dono.json › time.
 */
export interface PersonInput {
  /** id da pessoa em dados/dono.json › time (slug). */
  id: string;
  nome: string;
  /** Papel no idioma da página (time[].papel). */
  papel: string;
  /** Foto já processada (caminho ou URL absoluta). */
  image?: string;
  /** Perfis pessoais (time[].linkedin e time[].github). */
  sameAs?: readonly string[];
}

/**
 * @id da pessoa: a URL de /sobre em pt + "#<id>", igual nos 3 idiomas (um @id
 * é uma entidade só).
 */
export function personId(id: string): string {
  return `${absoluteUrl(urlFor("about", "pt"))}#${id}`;
}

/** Organization + ProfessionalService (Home e Sobre). Em Sobre, `people` liga cada Person por @id. */
export function organizationNode(locale: Locale, flags: SeoFlags, people: readonly PersonInput[] = []): JsonLdNode {
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
  };
  // D31 (auditoria SEO S02-3, S05-4): com o exterior, o mundo todo, nos 3
  // idiomas do site; só com outras cidades, o Brasil. Sem flag, nada (o
  // endereço já diz São Paulo). Sem telefone: o build usa o número de teste.
  if (flags.atendeExterior) {
    node.areaServed = "Worldwide";
    node.knowsLanguage = [...SITE_LANGUAGES];
    node.contactPoint = {
      "@type": "ContactPoint",
      contactType: "sales",
      email: empresa.email,
      url: absoluteUrl(urlFor("contact", locale)),
      availableLanguage: [...SITE_LANGUAGES],
    };
  } else if (flags.outrasCidades) {
    node.areaServed = { "@type": "Country", name: "BR" };
  }
  const profiles = sameAs();
  if (profiles.length) node.sameAs = profiles;
  if (flags.hasCompanyData) {
    node.legalName = empresa.razaoSocial.trim();
    node.taxID = formatCnpj(empresa.cnpj);
  }
  if (empresa.anoFundacao) node.foundingDate = String(empresa.anoFundacao);
  // Sem founder: nenhum campo de dados/dono.json diz quem fundou a empresa.
  if (people.length) node.employee = people.map((person) => ({ "@id": personId(person.id) }));
  return node;
}

/** Autor do post (posts/<slug>.mdx › autor). */
export interface ArticleAuthorInput {
  nome: string;
  /** Perfil público do autor (LinkedIn, GitHub...). */
  link: string;
  papelTecnico: string;
}

/** Pessoa de /sobre que pode assinar um post (dados/dono.json › time, só com hasTeam). */
export interface TeamAuthorCandidate {
  id: string;
  nome: string;
  linkedin?: string | undefined;
  github?: string | undefined;
}

const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase("pt-BR") === b.trim().toLocaleLowerCase("pt-BR");

/**
 * author do Article (auditoria SEO): quando o autor é uma pessoa do time (mesmo
 * nome, ou o link do post é o LinkedIn/GitHub dela), leva o @id do Person de
 * /sobre, para o grafo ter uma entidade só por pessoa. Sem time (sem /sobre),
 * fica o Person solto.
 */
export function articleAuthorNode(autor: ArticleAuthorInput, team: readonly TeamAuthorCandidate[] = []): JsonLdNode {
  const member = team.find((person) => sameName(person.nome, autor.nome) || [person.linkedin, person.github].includes(autor.link));
  return {
    "@type": "Person",
    ...(member ? { "@id": personId(member.id) } : {}),
    name: autor.nome,
    url: autor.link,
    jobTitle: autor.papelTecnico,
  };
}

/** Person de /sobre, ligada à Organization por @id. */
export function personNode(person: PersonInput): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "Person",
    "@id": personId(person.id),
    name: person.nome,
    jobTitle: person.papel,
  };
  if (person.image) node.image = absoluteUrl(person.image);
  if (person.sameAs?.length) node.sameAs = [...person.sameAs];
  node.worksFor = { "@id": ORGANIZATION_ID };
  return node;
}

/**
 * WebSite (Home), ligado à Organization. O MESMO nó nas 3 Homes (S02-7): um
 * @id é uma entidade só, então url é a raiz e inLanguage lista os 3 idiomas.
 */
export function websiteNode(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: absoluteUrl(urlFor("home", "pt")),
    inLanguage: [...SITE_LANGUAGES],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Referência embutida à Organization (provider do Service, publisher do
 * Article): o @id liga ao nó da Home e o tipo, o nome e a url resolvem a
 * entidade sozinhos fora da página da Home.
 */
export function organizationRef(): JsonLdNode {
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
    provider: organizationRef(),
  };
}

/**
 * Nós JSON-LD que o SEO.astro emite para a rota (o resto vem dos componentes).
 * `people`: só em Sobre (Person por pessoa + employee na Organization).
 */
export function routeJsonLd(
  route: RouteKey,
  locale: Locale,
  description: string,
  flags: SeoFlags,
  people: readonly PersonInput[] = [],
): JsonLdNode[] {
  if (route === "home") return [websiteNode(), organizationNode(locale, flags)];
  if (route === "about") return [organizationNode(locale, flags, people), ...people.map(personNode)];
  const service = serviceNode(route, locale, description);
  return service ? [service] : [];
}

/** Envelope @graph com @context, ou null quando não há nada a emitir. */
export function graph(nodes: JsonLdNode[]): JsonLdNode | null {
  return nodes.length ? { "@context": "https://schema.org", "@graph": nodes } : null;
}
