import { describe, expect, it } from "vitest";

import { CONFIG_SOURCES, CONFIG_SOURCES_REAIS, computeFeatures, publishedCases } from "@/config/features";
import { configIssues } from "@/config/validate";

import { baseSources, realSources, text } from "../fixtures/features";

describe("features — estado do repositório (dados/dono.json)", () => {
  it("configs do repositório são válidos", () => {
    expect(configIssues(CONFIG_SOURCES)).toEqual([]);
    expect(configIssues(CONFIG_SOURCES_REAIS)).toEqual([]);
  });

  it("nos testes a camada fictícia está desligada: o site usa só o dono.json", () => {
    expect(CONFIG_SOURCES).toEqual(CONFIG_SOURCES_REAIS);
  });

  it("só as decisões do dono ligam flags: faixas da P5, perfis, empresa (razão social + CNPJ), escopo, código do cliente, NDA, outras cidades e exterior (D31) e o FAQ da duração da Descoberta, sem número (D44)", () => {
    const features = computeFeatures(realSources());
    const on = Object.entries(features).filter(([key, value]) => key.startsWith("has") && value === true);
    expect(on.map(([key]) => key).sort()).toEqual(["hasBudgetTiers", "hasCompanyData", "hasProfiles"]);
    expect(features.profiles).toEqual({ github: true, linkedin: true, medium: true });
    expect(features.pricingLines).toEqual([]);
    expect(Object.entries(features.confirm).filter(([, value]) => value).map(([key]) => key).sort()).toEqual([
      "atendeExterior",
      "codigoProprietario",
      "duracaoDescoberta",
      "escopoMudanca",
      "nda",
      "outrasCidades",
    ]);
  });

  it("vazio (baseSources): toda flag when_data desligada", () => {
    const features = computeFeatures(baseSources());
    const flags = Object.entries(features).filter(([key, value]) => key.startsWith("has") && typeof value === "boolean");
    expect(flags.filter(([, value]) => value)).toEqual([]);
    expect(features.pricingLines).toEqual([]);
    expect(Object.values(features.confirm).some(Boolean)).toBe(false);
  });
});

describe("features — gates ligam e desligam", () => {
  it("hasPricing: linha completa liga; parcial não renderiza", () => {
    const sources = baseSources();
    sources.precos.desenvolvimento.sistemas = { faixa: text("X"), unidade: "projeto", fatores: { pt: ["a"], en: ["a"], es: ["a"] } };
    expect(computeFeatures(sources)).toMatchObject({ hasPricing: true, pricingLines: ["desenvolvimento.sistemas"] });

    sources.precos.desenvolvimento.sistemas = { faixa: { pt: "X", en: "", es: "X" }, unidade: "projeto", fatores: { pt: ["a"], en: ["a"], es: ["a"] } };
    expect(computeFeatures(sources).hasPricing).toBe(false);
  });

  it("hasCases: ≥ 2 cases publicados nos 3 idiomas", () => {
    const entry = (id: string, publicado = true) => ({ id, publicado, servicos: ["mvp"] as const });
    const one = ["pt", "en", "es"].map((locale) => entry(`${locale}/a`));
    const two = [...one, ...["pt", "en", "es"].map((locale) => entry(`${locale}/b`))];
    expect(computeFeatures(baseSources({ content: { ...baseSources().content, cases: one } })).hasCases).toBe(false);
    const on = computeFeatures(baseSources({ content: { ...baseSources().content, cases: two } }));
    expect(on.hasCases).toBe(true);
    expect(on.casesByService.mvp).toBe(2);
    // falta o en de "b": não conta
    expect(publishedCases(two.filter((item) => item.id !== "en/b")).map((item) => item.slug)).toEqual(["a"]);
  });

  it("hasWhatsapp: só com número brasileiro completo", () => {
    expect(computeFeatures(baseSources({ env: { whatsappNumber: "5548999999999", ga4Id: "" } })).hasWhatsapp).toBe(true);
    expect(computeFeatures(baseSources({ env: { whatsappNumber: "999", ga4Id: "" } })).hasWhatsapp).toBe(false);
  });
});

describe("validação de config", () => {
  it("CNPJ inválido e agenda sem https derrubam o build", () => {
    const sources = baseSources();
    sources.empresa.cnpj = "11.111.111/1111-11";
    sources.agenda.url = "http://agenda.example";
    expect(configIssues(sources)).toHaveLength(2);
  });

  it("score D exige a confirmação do dono", () => {
    const sources = baseSources();
    sources.qualificacao.scoreD.ativo = true;
    expect(configIssues(sources).join()).toMatch(/scoreDRecebeDiagnostico/);
  });
});
