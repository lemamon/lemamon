import { describe, expect, it } from "vitest";

import {
  alternates,
  canonicalUrl,
  isNoindexPath,
  isRouteLive,
  localeFromPath,
  matchRoute,
  normalizePath,
  quoteHref,
  ROUTE_KEYS,
  routeLocales,
  serviceFromParam,
  SERVICE_KEYS,
  SERVICE_PARAM,
  staticRouteEntries,
  urlFor,
} from "@/config/routes";

describe("política de URL", () => {
  it("raízes de idioma com barra, o resto sem barra nem .html", () => {
    expect(urlFor("home", "pt")).toBe("/");
    expect(urlFor("home", "en")).toBe("/en/");
    expect(urlFor("how_we_work", "es")).toBe("/es/como-trabajamos");
    expect(urlFor("service_support", "en")).toBe("/en/services/support-and-evolution");
    for (const { path } of staticRouteEntries()) {
      expect(path.endsWith(".html")).toBe(false);
      if (!["/", "/en/", "/es/"].includes(path)) expect(path.endsWith("/")).toBe(false);
    }
  });

  it("normaliza qualquer variante para a forma canônica", () => {
    expect(normalizePath("/en")).toBe("/en/");
    expect(normalizePath("/en/index.html")).toBe("/en/");
    expect(normalizePath("/contato/")).toBe("/contato");
    expect(normalizePath("/contato.html?x=1#y")).toBe("/contato");
    expect(normalizePath("https://lemamon.dev/es/")).toBe("/es/");
  });

  it("matchRoute é o inverso de urlFor em toda rota estática", () => {
    for (const { key, locale, path } of staticRouteEntries()) {
      expect(matchRoute(path)).toEqual({ key, locale, params: {} });
    }
    expect(matchRoute("/en/cases/foo")).toEqual({ key: "case", locale: "en", params: { slug: "foo" } });
    expect(matchRoute("/nao-existe")).toBeNull();
  });

  it("blog só existe em pt-BR e urlFor acusa idioma inexistente", () => {
    expect(routeLocales("blog_hub")).toEqual(["pt"]);
    expect(() => urlFor("blog_hub", "en")).toThrow();
  });

  it("slugs são únicos", () => {
    const paths = staticRouteEntries().map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("canonical e hreflang", () => {
  it("canonical absoluto; 404 sem canonical", () => {
    expect(canonicalUrl("pricing", "es", undefined)).toBe("https://lemamon.dev/es/cuanto-cuesta");
    expect(canonicalUrl("not_found", "pt")).toBeNull();
  });

  it("pares recíprocos pt-BR/en/es + x-default → pt-BR", () => {
    expect(alternates("how_we_work")).toEqual([
      { hreflang: "pt-BR", href: "https://lemamon.dev/como-trabalhamos" },
      { hreflang: "en", href: "https://lemamon.dev/en/how-we-work" },
      { hreflang: "es", href: "https://lemamon.dev/es/como-trabajamos" },
      { hreflang: "x-default", href: "https://lemamon.dev/como-trabalhamos" },
    ]);
  });

  it("sem pares para página de um idioma só (blog) e para a 404", () => {
    expect(alternates("blog_hub")).toEqual([]);
    expect(alternates("not_found")).toEqual([]);
  });

  it("idioma pelo caminho", () => {
    expect(localeFromPath("/en/quote")).toBe("en");
    expect(localeFromPath("/es/")).toBe("es");
    expect(localeFromPath("/orcamento")).toBe("pt");
    expect(localeFromPath("/english")).toBe("pt");
  });
});

describe("sitemap e gates", () => {
  it("noindex: 404 e pós-envio nos 3 idiomas", () => {
    expect(isNoindexPath("/404.html")).toBe(true);
    expect(isNoindexPath("/en/404.html")).toBe(true);
    expect(isNoindexPath("/orcamento/enviado")).toBe(true);
    expect(isNoindexPath("/es/cotizacion/enviada")).toBe(true);
    expect(isNoindexPath("/orcamento")).toBe(false);
  });

  it("rota when_data só vive com a flag", () => {
    expect(isRouteLive("cases_hub", {})).toBe(false);
    expect(isRouteLive("cases_hub", { hasCases: true })).toBe(true);
    expect(isRouteLive("home", {})).toBe(true);
    const gated = ROUTE_KEYS.filter((key) => !isRouteLive(key, {}));
    expect(gated.sort()).toEqual(["about", "blog_hub", "blog_post", "case", "cases_hub"]);
  });
});

describe("links do wizard", () => {
  it("?servico= estável nos 3 idiomas, na ordem do BLUEPRINT", () => {
    expect(quoteHref("en", { servico: "mobile_apps", origem: "mobile-apps-hero" })).toBe(
      "/en/quote?servico=aplicativos&origem=mobile-apps-hero",
    );
    expect(quoteHref("pt", { entrada: "descoberta", origem: "descoberta-hero" })).toBe(
      "/orcamento?entrada=descoberta&origem=descoberta-hero",
    );
    expect(quoteHref("es")).toBe("/es/cotizacion");
    for (const key of SERVICE_KEYS) expect(serviceFromParam(SERVICE_PARAM[key])).toBe(key);
  });
});
