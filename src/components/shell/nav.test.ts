import { describe, expect, it } from "vitest";

import { LOCALES } from "@/i18n";

import { companyLinks, discoveryLink, isServicesRoute, mainLinks, navRouteFor, serviceLinks } from "./nav";

const OFF = { hasCases: false, hasTeam: false, hasPosts: false };
const ON = { hasCases: true, hasTeam: true, hasPosts: true };

describe("navegação (BLUEPRINT §8.1, §8.5)", () => {
  it("5 serviços na ordem do menu, nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      expect(serviceLinks(locale).map((link) => link.route)).toEqual([
        "service_web_systems",
        "service_mobile_apps",
        "service_integrations",
        "service_mvp",
        "service_support",
      ]);
    }
    expect(discoveryLink("pt").href).toBe("/sprint-de-descoberta");
  });

  it("when_data: Cases e Sobre só entram com a flag (sem item para página inexistente)", () => {
    expect(mainLinks("pt", OFF).map((link) => link.route)).toEqual(["how_we_work", "pricing", "contact"]);
    expect(mainLinks("es", ON).map((link) => link.route)).toEqual(["how_we_work", "pricing", "cases_hub", "about", "contact"]);
  });

  it("rodapé: Blog só em pt-BR e só com hasPosts, antes de Contato", () => {
    expect(companyLinks("pt", OFF).map((link) => link.route)).toEqual(["how_we_work", "pricing", "contact"]);
    expect(companyLinks("pt", ON).map((link) => link.route)).toEqual(["how_we_work", "pricing", "cases_hub", "about", "blog_hub", "contact"]);
    expect(companyLinks("en", ON).map((link) => link.route)).not.toContain("blog_hub");
  });

  it("nenhum link aponta para '/' como placeholder", () => {
    for (const locale of LOCALES) {
      for (const link of [...serviceLinks(locale), ...companyLinks(locale, ON)]) {
        expect(["/", "/en/", "/es/", "#", ""]).not.toContain(link.href);
      }
    }
  });

  it("item ativo: serviços acendem 'Serviços'; case e post acendem a página-mãe", () => {
    expect(isServicesRoute("service_mvp")).toBe(true);
    expect(isServicesRoute("discovery_sprint")).toBe(true);
    expect(isServicesRoute("pricing")).toBe(false);
    expect(navRouteFor("case")).toBe("cases_hub");
    expect(navRouteFor("blog_post")).toBe("blog_hub");
  });
});
