import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ROUTE_KEYS, routeLocales, SERVICE_KEYS, SERVICE_ROUTE, urlFor } from "@/config/routes";
import { LOCALES } from "@/i18n";

import { OG_PAGE_HEADLINE, ogImageFile, ogImageFor, personId, ROBOTS_INDEX, routeJsonLd, WEBSITE_ID, type PersonInput } from "./seo";

const ROOT = process.cwd();

describe("imagem de compartilhamento (og:image)", () => {
  it("toda rota, em todo idioma dela, aponta para um JPEG 1200×630 que existe em public/", () => {
    for (const route of ROUTE_KEYS) {
      for (const locale of routeLocales(route)) {
        const image = ogImageFor(route, locale);
        expect(image.width).toBe(1200);
        expect(image.height).toBe(630);
        expect(image.alt.length).toBeGreaterThan(10);
        expect(existsSync(join(ROOT, "public", image.src)), `${route} ${locale}: ${image.src}`).toBe(true);
      }
    }
  });

  it("há um cartão padrão por idioma e um por página com og_image_headline", () => {
    for (const locale of LOCALES) {
      expect(existsSync(join(ROOT, "public", ogImageFile("default", locale)))).toBe(true);
      for (const route of Object.keys(OG_PAGE_HEADLINE)) {
        expect(ogImageFor(route as never, locale).src).toBe(`/${ogImageFile(route as never, locale)}`);
      }
    }
  });

  it("a lista de páginas do gerador (scripts/build-og-image.sh) é a mesma do SEO", () => {
    const script = readFileSync(join(ROOT, "scripts", "build-og-image.sh"), "utf8");
    const block = script.slice(script.indexOf("const PAGES = {"), script.indexOf("};", script.indexOf("const PAGES = {")));
    const pages = Object.fromEntries([...block.matchAll(/(\w+): "([\w.]+)"/g)].map((m) => [m[1], m[2]]));
    expect(pages).toEqual(OG_PAGE_HEADLINE);
  });

  it("o cartão antigo ('Squad dedicado') não existe mais", () => {
    expect(existsSync(join(ROOT, "public", "assets", "img", "og-image.jpg"))).toBe(false);
    expect(readFileSync(join(ROOT, "public", "assets", "img", "og-image.svg"), "utf8")).not.toMatch(/squad/i);
  });
});

describe("JSON-LD por rota (BLUEPRINT §10.3)", () => {
  const flags = { hasCompanyData: false };

  it("Home: WebSite + Organization/ProfessionalService, sem dado inventado", () => {
    const nodes = routeJsonLd("home", "pt", "desc", flags);
    expect(nodes.map((node) => node["@type"])).toEqual(["WebSite", ["Organization", "ProfessionalService"]]);
    const org = nodes[1] as Record<string, unknown>;
    expect(org.sameAs).toEqual([
      "https://github.com/lemamon-dev",
      "https://www.linkedin.com/in/lemamon-dev",
      "https://medium.com/@lemamon.dev",
    ]);
    expect(org).not.toHaveProperty("areaServed");
    expect(org).not.toHaveProperty("aggregateRating");
    expect(org).not.toHaveProperty("telephone");
    expect(org).not.toHaveProperty("legalName");
    expect(org).not.toHaveProperty("taxID");
    expect(org.address).toMatchObject({ addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" });
  });

  it("razão social e CNPJ só com hasCompanyData", () => {
    const [, org] = routeJsonLd("home", "pt", "desc", { hasCompanyData: true });
    expect(org).toHaveProperty("legalName");
    expect(org).toHaveProperty("taxID");
  });

  it("D31 (S02-3, S05-4): com atendeExterior, mundo todo e os 3 idiomas; só outras cidades, o Brasil; sem flag, nada", () => {
    for (const locale of LOCALES) {
      const [, abroad] = routeJsonLd("home", locale, "desc", { ...flags, outrasCidades: true, atendeExterior: true });
      expect(abroad?.areaServed, locale).toBe("Worldwide");
      expect(abroad?.knowsLanguage, locale).toEqual(["pt-BR", "en", "es"]);
      expect(abroad?.contactPoint, locale).toMatchObject({
        "@type": "ContactPoint",
        contactType: "sales",
        email: "comercial@lemamon.dev",
        url: `https://lemamon.dev${urlFor("contact", locale)}`,
        availableLanguage: ["pt-BR", "en", "es"],
      });
      expect(abroad?.contactPoint, locale).not.toHaveProperty("telephone");
      expect(abroad, locale).not.toHaveProperty("telephone");
    }
    const [, brazil] = routeJsonLd("home", "pt", "desc", { ...flags, outrasCidades: true, atendeExterior: false });
    expect(brazil?.areaServed).toEqual({ "@type": "Country", name: "BR" });
    expect(brazil).not.toHaveProperty("knowsLanguage");
    expect(brazil).not.toHaveProperty("contactPoint");
    const [, none] = routeJsonLd("home", "pt", "desc", flags);
    expect(none).not.toHaveProperty("areaServed");
    expect(none).not.toHaveProperty("knowsLanguage");
  });

  it("WebSite (S02-7): o MESMO nó nas 3 Homes, na raiz e com os 3 idiomas", () => {
    const nodes = LOCALES.map((locale) => routeJsonLd("home", locale, "desc", flags)[0]);
    expect(nodes[0]).toEqual({
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "Lemamon.dev",
      url: "https://lemamon.dev/",
      inLanguage: ["pt-BR", "en", "es"],
      publisher: { "@id": "https://lemamon.dev/#organization" },
    });
    expect(nodes[1]).toEqual(nodes[0]);
    expect(nodes[2]).toEqual(nodes[0]);
  });

  it("Sobre (S03-1, S05-2): sem time, só a Organization; com time, uma Person por pessoa, ligada por @id", () => {
    const [alone] = routeJsonLd("about", "pt", "desc", flags);
    expect(alone).not.toHaveProperty("employee");
    expect(alone).not.toHaveProperty("founder");

    const people: PersonInput[] = [
      { id: "pessoa-a", nome: "Pessoa de Teste A", papel: "Desenvolvedora", image: "/_astro/a.webp", sameAs: ["https://www.linkedin.com/in/teste-a"] },
      { id: "pessoa-b", nome: "Pessoa de Teste B", papel: "Developer" },
    ];
    const [org, ...persons] = routeJsonLd("about", "en", "desc", flags, people);
    expect(org?.employee).toEqual([{ "@id": "https://lemamon.dev/sobre#pessoa-a" }, { "@id": "https://lemamon.dev/sobre#pessoa-b" }]);
    expect(org).not.toHaveProperty("founder");
    expect(persons).toEqual([
      {
        "@type": "Person",
        "@id": personId("pessoa-a"),
        name: "Pessoa de Teste A",
        jobTitle: "Desenvolvedora",
        image: "https://lemamon.dev/_astro/a.webp",
        sameAs: ["https://www.linkedin.com/in/teste-a"],
        worksFor: { "@id": "https://lemamon.dev/#organization" },
      },
      {
        "@type": "Person",
        "@id": personId("pessoa-b"),
        name: "Pessoa de Teste B",
        jobTitle: "Developer",
        worksFor: { "@id": "https://lemamon.dev/#organization" },
      },
    ]);
    // O @id da pessoa é o mesmo nos 3 idiomas (a URL pt de /sobre).
    expect(personId("pessoa-a")).toBe(`https://lemamon.dev${urlFor("about", "pt")}#pessoa-a`);
    // Person só em Sobre: na Home a lista é ignorada.
    expect(routeJsonLd("home", "pt", "desc", flags, people).map((node) => node["@type"])).toEqual(["WebSite", ["Organization", "ProfessionalService"]]);
  });

  it("Service nos 5 serviços e na Sprint de Descoberta; nada nas demais", () => {
    for (const key of SERVICE_KEYS) {
      for (const locale of LOCALES) {
        const [node] = routeJsonLd(SERVICE_ROUTE[key], locale, "desc", flags);
        expect(node?.["@type"]).toBe("Service");
        expect(node?.provider).toMatchObject({ "@type": "Organization", name: "Lemamon.dev" });
      }
    }
    expect(routeJsonLd("discovery_sprint", "es", "desc", flags)[0]?.name).toBe("Sprint de Descubrimiento");
    expect(routeJsonLd("pricing", "pt", "desc", flags)).toEqual([]);
    expect(routeJsonLd("not_found", "pt", "desc", flags)).toEqual([]);
    expect(routeJsonLd("about", "en", "desc", flags)).toHaveLength(1);
  });
});

describe("SEO.astro: título do cartão de compartilhamento (ogTitle)", () => {
  async function head(props: Record<string, unknown>) {
    const { experimental_AstroContainer: AstroContainer } = await import("astro/container");
    const { default: SEO } = await import("./SEO.astro");
    const container = await AstroContainer.create();
    return container.renderToString(SEO, {
      props: { locale: "pt", route: "home", title: "Título para o Google | Lemamon", description: "Descrição.", ...props },
    });
  }
  const meta = (html: string, attr: string) => html.match(new RegExp(`<meta ${attr} content="([^"]*)"`))?.[1];

  it("sem ogTitle, og:title e twitter:title repetem o <title>", async () => {
    const html = await head({});
    expect(html).toContain("<title>Título para o Google | Lemamon</title>");
    expect(meta(html, 'property="og:title"')).toBe("Título para o Google | Lemamon");
    expect(meta(html, 'name="twitter:title"')).toBe("Título para o Google | Lemamon");
  });

  it("com ogTitle (post e case: o H1 inteiro), o cartão usa ele e o <title> não muda", async () => {
    const h1 = "Quando a planilha deixa de dar conta da operação e vira o gargalo da empresa";
    const html = await head({ title: "Quando a planilha deixa de dar conta da… | Lemamon", ogTitle: h1 });
    expect(html).toContain("<title>Quando a planilha deixa de dar conta da… | Lemamon</title>");
    expect(meta(html, 'property="og:title"')).toBe(h1);
    expect(meta(html, 'name="twitter:title"')).toBe(h1);
    // Vazio cai no title (nunca um cartão sem título).
    expect(meta(await head({ ogTitle: "  " }), 'property="og:title"')).toBe("Título para o Google | Lemamon");
  });

  it("robots (S01-10): página indexável libera a prévia grande de imagem; 404 fica noindex, follow", async () => {
    expect(meta(await head({}), 'name="robots"')).toBe(ROBOTS_INDEX);
    expect(ROBOTS_INDEX).toBe("index, follow, max-image-preview:large");
    expect(meta(await head({ route: "not_found" }), 'name="robots"')).toBe("noindex, follow");
    expect(meta(await head({ route: "quote_sent" }), 'name="robots"')).toBe("noindex, follow");
  });

  it("Home com o dado real (D31 ligada em dados/dono.json): Organization com areaServed e os 3 idiomas", async () => {
    const html = await head({});
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
      ([, json]) => JSON.parse(json ?? "{}") as { "@graph"?: Record<string, unknown>[] },
    );
    const org = blocks.flatMap((block) => block["@graph"] ?? []).find((node) => node["@id"] === "https://lemamon.dev/#organization");
    expect(org?.areaServed).toBe("Worldwide");
    expect(org?.knowsLanguage).toEqual(["pt-BR", "en", "es"]);
  });
});
