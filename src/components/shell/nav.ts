/**
 * Itens de navegação compartilhados por Header, MobileDrawer e Footer
 * (BLUEPRINT §8.1, §8.5). Dono: shell.
 *
 * when_data: Cases, Sobre e Blog só entram com a flag de features.ts (a mesma
 * que decide se a página é gerada), então nenhum item leva a página inexistente.
 */

import type { Features } from "@/config/features";
import { hasLocale, SERVICE_KEYS, SERVICE_ROUTE, urlFor, type RouteKey } from "@/config/routes";
import { hasText, t, tDynamic, type Locale } from "@/i18n";

export interface NavLink {
  route: RouteKey;
  href: string;
  label: string;
}

/** Os 5 serviços, na ordem do menu. */
export function serviceLinks(locale: Locale): NavLink[] {
  return SERVICE_KEYS.map((key) => ({
    route: SERVICE_ROUTE[key],
    href: urlFor(SERVICE_ROUTE[key], locale),
    label: t(locale, `shared.header.services_menu.${key}`),
  }));
}

/** "Antes de construir: Sprint de Descoberta" (menu) — o footer usa o rótulo curto. */
export function discoveryLink(locale: Locale, variant: "menu" | "footer" = "menu"): NavLink {
  return {
    route: "discovery_sprint",
    href: urlFor("discovery_sprint", locale),
    label:
      variant === "menu"
        ? t(locale, "shared.header.services_menu.discovery_label")
        : t(locale, "shared.footer.links.discovery_sprint"),
  };
}

/** "Todos os serviços" → hub. */
export function servicesHubLink(locale: Locale): NavLink {
  return { route: "services_hub", href: urlFor("services_hub", locale), label: t(locale, "shared.header.services_menu.all_services") };
}

/** Itens principais depois de "Serviços": Como trabalhamos, Quanto custa, Cases*, Sobre*, Contato. */
export function mainLinks(locale: Locale, features: Pick<Features, "hasCases" | "hasTeam">): NavLink[] {
  const links: NavLink[] = [
    { route: "how_we_work", href: urlFor("how_we_work", locale), label: t(locale, "shared.header.nav.how_we_work") },
    { route: "pricing", href: urlFor("pricing", locale), label: t(locale, "shared.header.nav.pricing") },
  ];
  if (features.hasCases) links.push({ route: "cases_hub", href: urlFor("cases_hub", locale), label: t(locale, "shared.header.nav.cases") });
  if (features.hasTeam) links.push({ route: "about", href: urlFor("about", locale), label: t(locale, "shared.header.nav.about") });
  links.push({ route: "contact", href: urlFor("contact", locale), label: t(locale, "shared.header.nav.contact") });
  return links;
}

/** Coluna "Lemamon" do footer: Como trabalhamos · Quanto custa · Cases* · Sobre* · Blog* · Contato. */
export function companyLinks(locale: Locale, features: Pick<Features, "hasCases" | "hasTeam" | "hasPosts">): NavLink[] {
  const links = mainLinks(locale, features).map((link) => ({
    ...link,
    label: t(locale, `shared.footer.links.${FOOTER_LABEL[link.route] ?? "contact"}`),
  }));
  const blog = blogLink(locale, features);
  if (blog) links.splice(links.length - 1, 0, blog);
  return links;
}

const FOOTER_LABEL: Partial<Record<RouteKey, "how_we_work" | "pricing" | "cases" | "about" | "contact">> = {
  how_we_work: "how_we_work",
  pricing: "pricing",
  cases_hub: "cases",
  about: "about",
  contact: "contact",
};

/** Blog só existe em pt-BR e só com hasPosts. */
export function blogLink(locale: Locale, features: Pick<Features, "hasPosts">): NavLink | null {
  if (!features.hasPosts || !hasLocale("blog_hub", locale)) return null;
  return { route: "blog_hub", href: urlFor("blog_hub", locale), label: t(locale, "shared.footer.links.blog") };
}

/** Rotas que acendem o item "Serviços" (hub, 5 serviços e a Sprint de Descoberta). */
export function isServicesRoute(route: RouteKey): boolean {
  return route === "services_hub" || route === "discovery_sprint" || Object.values(SERVICE_ROUTE).includes(route);
}

/** Rota "pai" para o aria-current de páginas filhas (case → Cases, post → Blog). */
export function navRouteFor(route: RouteKey): RouteKey {
  if (route === "case") return "cases_hub";
  if (route === "blog_post") return "blog_hub";
  return route;
}

/**
 * Rótulo CURTO do CTA primário, só para os botões que dividem a linha com o
 * ícone de WhatsApp (barra fixa e rodapé do drawer; o header usa sempre o
 * rótulo completo, B167). O ResumeLabel só o mostra quando nem o rótulo
 * completo em 14px cabe no botão. Sempre com verbo (BLUEPRINT §8.6):
 * shared.cta.primary_short ("Pedir diagnóstico") ou, com agenda online,
 * shared.cta.primary_schedule_short ("Agendar diagnóstico"); o teste
 * tests/unit/i18n.test.ts confere que o curto começa com o verbo do completo.
 * undefined = fica o rótulo longo: enquanto a chave da agenda não existir no
 * i18n, nunca se mostra "Pedir" num CTA que agenda.
 */
export function primaryCtaShortLabel(locale: Locale, features: Pick<Features, "hasAgenda">): string | undefined {
  const key = features.hasAgenda ? "shared.cta.primary_schedule_short" : "shared.cta.primary_short";
  return hasText(locale, key) ? tDynamic(locale, key) : undefined;
}
