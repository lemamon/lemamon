/**
 * Mapa central de rotas — BLUEPRINT §3.1 e §9. ÚNICA fonte de slugs do site.
 *
 * Alimenta: links internos, seletor de idioma, canonical, hreflang, sitemap e a
 * verificação de rotas pós-build (astro.config.mjs). Por isso este arquivo NÃO
 * importa nada de runtime do Astro (`astro:*`), JSON de copy nem aliases `@/`:
 * ele também é carregado pelo astro.config.mjs.
 *
 * POLÍTICA DE URL (única, ver docs/arquitetura/CONTRACT.md §2):
 *   - build.format = "preserve" e trailingSlash = "ignore" (astro.config.mjs);
 *   - raízes de idioma terminam em "/": "/", "/en/", "/es/" (arquivos index.html);
 *   - todas as outras páginas NÃO têm barra final nem ".html": "/como-trabalhamos",
 *     "/en/how-we-work" (arquivos <slug>.html);
 *   - todo link interno, canonical, hreflang e entrada de sitemap sai de urlFor()
 *     / canonicalUrl() / alternates(). Nunca escreva um caminho à mão.
 */

import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type Locale } from "../i18n/locales";

export const SITE_URL = "https://lemamon.dev";

/** Flags de features.ts que liberam páginas inteiras (BLUEPRINT §4). */
export type FeatureGate = "hasCases" | "hasTeam" | "hasPosts";

export const SERVICE_KEYS = ["web_systems", "mobile_apps", "integrations", "mvp", "support"] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

export interface RouteDef {
  /** Caminho por idioma. ":slug" marca parâmetro. Idioma ausente = a página não existe nele. */
  readonly paths: Readonly<Partial<Record<Locale, string>>>;
  /** Chave de copy da página (BLUEPRINT §3.1, coluna "Chave de copy"). */
  readonly copy: string;
  /** Subchave de `meta` no i18n com title/description. */
  readonly meta: string;
  /** Caminho i18n do único H1, conferido depois do build. null = o H1 vem do conteúdo (case, post). */
  readonly h1: string | null;
  /** when_data: a página só é gerada com a flag ligada (e some do menu, footer, sitemap e hreflang). */
  readonly gate?: FeatureGate;
  /** noindex + fora do sitemap. */
  readonly noindex?: boolean;
  /** Layout: "wizard" = header/footer mínimos (BLUEPRINT §8.4). */
  readonly layout?: "default" | "wizard";
  /** Página de erro: sem canonical nem hreflang. */
  readonly error?: boolean;
}

export const ROUTES = {
  home: {
    paths: { pt: "/", en: "/en/", es: "/es/" },
    copy: "home",
    meta: "home",
    h1: "home.hero.title",
  },
  how_we_work: {
    paths: { pt: "/como-trabalhamos", en: "/en/how-we-work", es: "/es/como-trabajamos" },
    copy: "how_we_work",
    meta: "how_we_work",
    h1: "how_we_work.hero.title",
  },
  discovery_sprint: {
    paths: { pt: "/sprint-de-descoberta", en: "/en/discovery-sprint", es: "/es/sprint-de-descubrimiento" },
    copy: "discovery_sprint",
    meta: "discovery_sprint",
    h1: "discovery_sprint.hero.title",
  },
  services_hub: {
    paths: { pt: "/servicos", en: "/en/services", es: "/es/servicios" },
    copy: "services.hub",
    meta: "services_hub",
    h1: "services.hub.hero.title",
  },
  service_web_systems: {
    paths: { pt: "/servicos/sistemas-web", en: "/en/services/web-systems", es: "/es/servicios/sistemas-web" },
    copy: "services.web_systems",
    meta: "services_web_systems",
    h1: "services.web_systems.h1",
  },
  service_mobile_apps: {
    paths: { pt: "/servicos/aplicativos", en: "/en/services/mobile-apps", es: "/es/servicios/aplicaciones" },
    copy: "services.mobile_apps",
    meta: "services_mobile_apps",
    h1: "services.mobile_apps.h1",
  },
  service_integrations: {
    paths: { pt: "/servicos/integracoes", en: "/en/services/integrations", es: "/es/servicios/integraciones" },
    copy: "services.integrations",
    meta: "services_integrations",
    h1: "services.integrations.h1",
  },
  service_mvp: {
    paths: { pt: "/servicos/mvp", en: "/en/services/mvp", es: "/es/servicios/mvp" },
    copy: "services.mvp",
    meta: "services_mvp",
    h1: "services.mvp.h1",
  },
  service_support: {
    paths: {
      pt: "/servicos/sustentacao",
      en: "/en/services/support-and-evolution",
      es: "/es/servicios/soporte-y-evolucion",
    },
    copy: "services.support",
    meta: "services_support",
    h1: "services.support.h1",
  },
  pricing: {
    paths: { pt: "/quanto-custa", en: "/en/pricing", es: "/es/cuanto-cuesta" },
    copy: "pricing",
    meta: "pricing",
    h1: "pricing.hero.title",
  },
  quote: {
    paths: { pt: "/orcamento", en: "/en/quote", es: "/es/cotizacion" },
    copy: "quote",
    meta: "quote",
    h1: "quote.entry.title",
    layout: "wizard",
  },
  quote_sent: {
    paths: { pt: "/orcamento/enviado", en: "/en/quote/sent", es: "/es/cotizacion/enviada" },
    copy: "quote.sent",
    meta: "quote_sent",
    h1: "quote.sent.title_generic",
    layout: "wizard",
    noindex: true,
  },
  contact: {
    paths: { pt: "/contato", en: "/en/contact", es: "/es/contacto" },
    copy: "contact",
    meta: "contact",
    h1: "contact.hero.title",
  },
  privacy: {
    paths: { pt: "/privacidade", en: "/en/privacy", es: "/es/privacidad" },
    copy: "privacy",
    meta: "privacy",
    h1: "privacy.title",
  },
  not_found: {
    paths: { pt: "/404", en: "/en/404", es: "/es/404" },
    copy: "shared.not_found",
    meta: "not_found",
    h1: "shared.not_found.title",
    noindex: true,
    error: true,
  },
  cases_hub: {
    paths: { pt: "/cases", en: "/en/cases", es: "/es/casos" },
    copy: "cases.hub",
    meta: "cases_hub",
    h1: "cases.hub.title",
    gate: "hasCases",
  },
  case: {
    paths: { pt: "/cases/:slug", en: "/en/cases/:slug", es: "/es/casos/:slug" },
    copy: "cases.case",
    meta: "case_template",
    h1: null,
    gate: "hasCases",
  },
  about: {
    paths: { pt: "/sobre", en: "/en/about", es: "/es/nosotros" },
    copy: "about",
    meta: "about",
    h1: "about.hero.title",
    gate: "hasTeam",
  },
  blog_hub: {
    paths: { pt: "/blog" },
    copy: "blog.hub",
    meta: "blog_hub",
    h1: "blog.hub.title",
    gate: "hasPosts",
  },
  blog_post: {
    paths: { pt: "/blog/:slug" },
    copy: "blog.post",
    meta: "blog_post_template",
    h1: null,
    gate: "hasPosts",
  },
} as const satisfies Record<string, RouteDef>;

export type RouteKey = keyof typeof ROUTES;
export type RouteParams = Readonly<Record<string, string>>;

export const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

/** Página de cada serviço (template /servicos/[slug], BLUEPRINT §6.5). */
export const SERVICE_ROUTE: Record<ServiceKey, RouteKey> = {
  web_systems: "service_web_systems",
  mobile_apps: "service_mobile_apps",
  integrations: "service_integrations",
  mvp: "service_mvp",
  support: "service_support",
};

/**
 * Valor ESTÁVEL de `?servico=` (BLUEPRINT §7.1). Igual nos 3 idiomas, porque é
 * atribuição e pré-marcação do wizard, não texto: /en/quote?servico=aplicativos.
 */
export const SERVICE_PARAM: Record<ServiceKey, string> = {
  web_systems: "sistemas-web",
  mobile_apps: "aplicativos",
  integrations: "integracoes",
  mvp: "mvp",
  support: "sustentacao",
};

/**
 * Âncoras estáveis entre páginas (iguais nos 3 idiomas, como os nomes de
 * parâmetro). Quem linka para uma seção de outra página usa daqui.
 */
export const ANCHORS = {
  /** Seção do método na Home (BLUEPRINT §6.1 #6). */
  homeMethod: "como-trabalhamos",
  /** Etapas em /como-trabalhamos (BLUEPRINT §6.2); a linha do método linka para elas. */
  stage: {
    diagnosis: "diagnostico",
    discovery: "descoberta",
    development: "desenvolvimento",
    support: "sustentacao",
  },
  /** Bloco "Investimento" (§5.4) em qualquer página; em /quanto-custa, as faixas do topo. */
  investment: "investimento",
  /** FAQ da página. */
  faq: "perguntas",
  /** "Como a gente constrói" em /como-trabalhamos (when_data hasEngineering, §6.2 #12). */
  engineering: "como-construimos",
  /** "Como ela acontece" na Sprint de Descoberta (when_data hasDiscoveryFormat, §6.3 #6). */
  discoveryFormat: "como-acontece",
  /** "Como funciona a sustentação" em /servicos/sustentacao (when_data hasSupportFormat, §6.5). */
  supportFormat: "formato",
  /** Cases relacionados nas páginas de serviço (when_data, §6.5 #7). */
  relatedCases: "cases-relacionados",
  /** "O método na prática" em /como-trabalhamos (when_data, §6.2 #11). */
  methodProof: "na-pratica",
} as const;

/**
 * URL curta do método por idioma, usada no texto de "Copiar resumo" do
 * pós-envio (i18n quote._notes.sent_copy). O netlify.toml redireciona (301)
 * cada uma para a página do método com utm_source=resumo_copiado e
 * utm_medium=compartilhamento; tests/unit/routes.test.ts confere o par.
 */
export const METHOD_SHORT_PATH: Readonly<Record<Locale, string>> = {
  pt: "/metodo",
  en: "/en/method",
  es: "/es/metodo",
};

/** Query de atribuição que o redirect da URL curta do método acrescenta. */
export const METHOD_SHORT_UTM = "utm_source=resumo_copiado&utm_medium=compartilhamento";

export type StageId = keyof typeof ANCHORS.stage;

export function serviceFromParam(value: string | null | undefined): ServiceKey | null {
  if (!value) return null;
  const hit = SERVICE_KEYS.find((key) => SERVICE_PARAM[key] === value);
  return hit ?? null;
}

export function routeDef(key: RouteKey): RouteDef {
  return ROUTES[key];
}

export function hasLocale(key: RouteKey, locale: Locale): boolean {
  return Boolean(routeDef(key).paths[locale]);
}

/** Idiomas em que a rota existe, na ordem de LOCALES. */
export function routeLocales(key: RouteKey): Locale[] {
  return LOCALES.filter((locale) => hasLocale(key, locale));
}

function fillParams(pattern: string, params: RouteParams | undefined, key: RouteKey): string {
  return pattern.replace(/:([a-z_]+)/g, (_, name: string) => {
    const value = params?.[name];
    if (!value) throw new Error(`[routes] "${key}" precisa do parâmetro "${name}"`);
    return encodeURIComponent(value);
  });
}

/**
 * Caminho interno de uma página, já na política de URL. Use em TODO href interno.
 * Lança erro se a página não existir no idioma (ex.: blog em en), para o build
 * acusar o link quebrado em vez de publicá-lo.
 */
export function urlFor(key: RouteKey, locale: Locale = DEFAULT_LOCALE, params?: RouteParams): string {
  const pattern = routeDef(key).paths[locale];
  if (!pattern) throw new Error(`[routes] "${key}" não existe no idioma "${locale}"`);
  return fillParams(pattern, params, key);
}

/** Âncora dentro de uma página: urlFor + "#id". */
export function anchorFor(key: RouteKey, locale: Locale, id: string, params?: RouteParams): string {
  return `${urlFor(key, locale, params)}#${id}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

/** URL canônica absoluta. null para páginas de erro (404 não tem canonical). */
export function canonicalUrl(key: RouteKey, locale: Locale, params?: RouteParams): string | null {
  if (routeDef(key).error) return null;
  return absoluteUrl(urlFor(key, locale, params));
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * Pares hreflang recíprocos (BLUEPRINT §9): pt-BR, en, es + x-default → pt-BR.
 * Só inclui idiomas em que a página existe; com menos de 2 idiomas (blog) ou em
 * página de erro, devolve [] (hreflang de uma versão só não serve para nada).
 *
 * `params` pode ser uma função por idioma (slug localizado); devolver null tira
 * aquele idioma dos pares.
 */
export function alternates(
  key: RouteKey,
  params?: RouteParams | ((locale: Locale) => RouteParams | null),
): Alternate[] {
  const def = routeDef(key);
  if (def.error) return [];
  const entries: { locale: Locale; href: string }[] = [];
  for (const locale of routeLocales(key)) {
    const localeParams = typeof params === "function" ? params(locale) : params;
    if (typeof params === "function" && localeParams === null) continue;
    entries.push({ locale, href: absoluteUrl(urlFor(key, locale, localeParams ?? undefined)) });
  }
  if (entries.length < 2) return [];
  const list: Alternate[] = entries.map(({ locale, href }) => ({ hreflang: LOCALE_META[locale].hreflang, href }));
  const fallback = entries.find((entry) => entry.locale === DEFAULT_LOCALE);
  if (fallback) list.push({ hreflang: "x-default", href: fallback.href });
  return list;
}

/** Idioma de um caminho: "/en/..." → en, "/es/..." → es, resto → pt. */
export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1] ?? "";
  for (const locale of LOCALES) {
    if (LOCALE_META[locale].prefix === `/${segment}`) return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Normaliza qualquer variante para a forma canônica da política:
 * "/en" → "/en/", "/en/index.html" → "/en/", "/contato/" → "/contato",
 * "/contato.html" → "/contato". Remove query e hash.
 */
export function normalizePath(input: string): string {
  let path = input.split(/[?#]/)[0] || "/";
  if (/^https?:\/\//.test(path)) path = new URL(path).pathname;
  path = path.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  if (!path.startsWith("/")) path = `/${path}`;
  const localeRoots = LOCALES.map((locale) => LOCALE_META[locale].prefix).filter(Boolean);
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (trimmed === "" || trimmed === "/") return "/";
  if (localeRoots.includes(trimmed as LocaleMetaPrefix)) return `${trimmed}/`;
  return trimmed;
}
type LocaleMetaPrefix = (typeof LOCALE_META)[Locale]["prefix"];

export interface RouteMatch {
  key: RouteKey;
  locale: Locale;
  params: RouteParams;
}

function patternToRegExp(pattern: string): { re: RegExp; names: string[] } {
  const names: string[] = [];
  const source = pattern
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        names.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { re: new RegExp(`^${source}$`), names };
}

/** Rota de um caminho (qualquer variante de barra/.html). null se não for página conhecida. */
export function matchRoute(pathname: string): RouteMatch | null {
  const path = normalizePath(pathname);
  for (const key of ROUTE_KEYS) {
    for (const locale of routeLocales(key)) {
      const pattern = routeDef(key).paths[locale] as string;
      const { re, names } = patternToRegExp(pattern);
      const hit = re.exec(path);
      if (!hit) continue;
      const params: Record<string, string> = {};
      names.forEach((name, index) => {
        params[name] = decodeURIComponent(hit[index + 1] ?? "");
      });
      return { key, locale, params };
    }
  }
  return null;
}

/** true se o caminho é noindex/erro e deve ficar fora do sitemap (404, /orcamento/enviado...). */
export function isNoindexPath(pathname: string): boolean {
  const match = matchRoute(pathname);
  if (!match) return false;
  const def = routeDef(match.key);
  return Boolean(def.noindex || def.error);
}

/** when_data: a rota vai ao ar com as flags atuais? (flags vêm de features.ts) */
export function isRouteLive(key: RouteKey, flags: Partial<Record<FeatureGate, boolean>>): boolean {
  const gate = routeDef(key).gate;
  return !gate || flags[gate] === true;
}

/** Caminhos estáticos (sem parâmetro) de todas as rotas, por idioma. */
export function staticRouteEntries(): { key: RouteKey; locale: Locale; path: string }[] {
  const list: { key: RouteKey; locale: Locale; path: string }[] = [];
  for (const key of ROUTE_KEYS) {
    for (const locale of routeLocales(key)) {
      const path = routeDef(key).paths[locale] as string;
      if (!path.includes(":")) list.push({ key, locale, path });
    }
  }
  return list;
}

export interface QuoteAttribution {
  /** Página e seção do CTA clicado: "home-hero", "web-systems-final"... (BLUEPRINT §8.6). */
  origem?: string;
  /** Pré-marca a P2 (ou a P1 = maintain_live_system em "support"). */
  servico?: ServiceKey;
  /** Entrada pela Sprint de Descoberta. */
  entrada?: "descoberta";
  /** Slug do case de origem. */
  ref?: string;
}

/**
 * Link para o wizard com a atribuição na query (BLUEPRINT §7.1). Os nomes dos
 * parâmetros (origem, servico, entrada, ref) não mudam por idioma.
 */
export function quoteHref(locale: Locale, attribution: QuoteAttribution = {}): string {
  const query = new URLSearchParams();
  if (attribution.ref) query.set("ref", attribution.ref);
  if (attribution.servico) query.set("servico", SERVICE_PARAM[attribution.servico]);
  if (attribution.entrada) query.set("entrada", attribution.entrada);
  if (attribution.origem) query.set("origem", attribution.origem);
  const search = query.toString();
  return search ? `${urlFor("quote", locale)}?${search}` : urlFor("quote", locale);
}
