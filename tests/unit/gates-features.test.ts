/**
 * Cada flag when_data (src/config/features.ts) LIGA com dado completo e
 * DESLIGA com vazio e com dado parcial (BLUEPRINT §4: "dado parcial não
 * renderiza"). Também: config malformado e conteúdo contraditório derrubam o
 * build; página when_data some de rota, menu, footer e hreflang sem a flag.
 */
import { describe, expect, it } from "vitest";

import { mainLinks, blogLink } from "@/components/shell/nav";
import {
  computeFeatures,
  contentIssues,
  EMPTY_CONTENT,
  hasRelatedCases,
  pricingLinesFor,
  primaryCtaKey,
  THRESHOLDS,
  withPrimaryCtaLabel,
  type FeatureSources,
} from "@/config/features";
import { alternates, isRouteLive } from "@/config/routes";
import { t } from "@/i18n";
import { configIssues } from "@/config/validate";

import { baseSources } from "../fixtures/features";
import { caseVersions, completeContent, completeSources, FIXTURE_CASE_SLUGS, fx, withoutLocale } from "../fixtures/owner-data";

const flags = (sources: FeatureSources) => computeFeatures(sources);
const mutate = (fn: (sources: FeatureSources) => void): FeatureSources => {
  const sources = completeSources();
  fn(sources);
  return sources;
};

describe("estado do repositório e fixtures", () => {
  it("dado completo (fixtures) liga TODAS as flags when_data e os configs completos são válidos", () => {
    const sources = completeSources();
    expect(configIssues(sources)).toEqual([]);
    expect(contentIssues(sources.content)).toEqual([]);
    const features = flags(sources);
    const off = Object.entries(features).filter(([key, value]) => key.startsWith("has") && value === false);
    // hasCaseFilters exige 6 cases: é o único limiar que as 2 fixtures de case não atingem.
    expect(off.map(([key]) => key)).toEqual(["hasCaseFilters"]);
    expect(Object.values(features.confirm).every(Boolean)).toBe(true);
  });

  it("vazio (baseSources): nenhuma flag when_data ligada", () => {
    const features = flags(baseSources());
    const on = Object.entries(features).filter(([key, value]) => key.startsWith("has") && value === true);
    expect(on).toEqual([]);
    expect(features.caseCount).toBe(0);
    expect(features.engineeringFields).toEqual([]);
  });
});

describe("configs: completo liga, parcial desliga", () => {
  it("hasPricing + pricingLines: só linhas completas, por linha", () => {
    // 5 linhas: a Sprint de Descoberta é gratuita e não tem faixa (D44, 21/10/2026).
    expect(flags(completeSources()).pricingLines).toHaveLength(5);
    const partial = mutate((s) => {
      s.precos.desenvolvimento.sistemas = {
        ...s.precos.desenvolvimento.sistemas!,
        faixa: withoutLocale(s.precos.desenvolvimento.sistemas!.faixa, "es", ""),
      };
      s.precos.desenvolvimento.mvp = { ...s.precos.desenvolvimento.mvp!, fatores: { pt: [], en: [], es: [] } };
      s.precos.sustentacao = null;
    });
    const features = flags(partial);
    expect(features.pricingLines).toEqual(["desenvolvimento.aplicativos", "desenvolvimento.integracoes"]);
    expect(pricingLinesFor(features, ["desenvolvimento.sistemas", "desenvolvimento.mvp"])).toEqual([]);
    const none = mutate((s) => {
      s.precos = baseSources().precos;
    });
    expect(flags(none).hasPricing).toBe(false);
  });

  it("hasBudgetTiers: moeda + 4 faixas completas + corte; sem corte ou com rótulo vazio desliga", () => {
    expect(flags(completeSources()).hasBudgetTiers).toBe(true);
    expect(flags(mutate((s) => void (s.qualificacao.corteMql = null))).hasBudgetTiers).toBe(false);
    expect(flags(mutate((s) => void (s.qualificacao.faixas[3]!.rotulo.en = ""))).hasBudgetTiers).toBe(false);
    expect(flags(mutate((s) => void (s.qualificacao.moeda = ""))).hasBudgetTiers).toBe(false);
  });

  it("hasMonthlyTiers: só junto com as faixas principais e com corteMqlMensal", () => {
    expect(flags(completeSources()).hasMonthlyTiers).toBe(true);
    expect(flags(mutate((s) => void (s.qualificacao.corteMqlMensal = null))).hasMonthlyTiers).toBe(false);
    expect(flags(mutate((s) => void (s.qualificacao.corteMql = null))).hasMonthlyTiers).toBe(false);
    expect(flags(mutate((s) => void (s.qualificacao.faixasMensais[0]!.rotulo.pt = " "))).hasMonthlyTiers).toBe(false);
  });

  it("hasProfiles: ≥ 1 perfil com publicar; um por um", () => {
    const one = flags(
      mutate((s) => {
        s.perfis.linkedin.publicar = false;
        s.perfis.medium.publicar = false;
      }),
    );
    expect(one.hasProfiles).toBe(true);
    expect(one.profiles).toEqual({ github: true, linkedin: false, medium: false });
    expect(flags(mutate((s) => void (s.perfis = baseSources().perfis))).hasProfiles).toBe(false);
  });

  it("hasAgenda troca o rótulo do CTA primário: 'Agendar diagnóstico gratuito' com agenda, 'Pedir diagnóstico gratuito' sem", () => {
    const com = flags(completeSources());
    const sem = flags(mutate((s) => void (s.agenda.url = "")));
    expect(primaryCtaKey(com)).toBe("shared.cta.primary_schedule");
    expect(primaryCtaKey(sem)).toBe("shared.cta.primary");
    expect(t("pt", primaryCtaKey(com))).toBe("Agendar diagnóstico gratuito");
    expect(t("en", primaryCtaKey(com))).toBe("Schedule your free assessment");
    expect(t("es", primaryCtaKey(com))).toBe("Agenda tu diagnóstico gratuito");
    expect(t("pt", primaryCtaKey(sem))).toBe("Pedir diagnóstico gratuito");
    // Links que embutem o rótulo (home.problem.link_text, contact.form.*) trocam só o rótulo.
    for (const locale of ["pt", "en", "es"] as const) {
      const labels = { primary: t(locale, "shared.cta.primary"), schedule: t(locale, "shared.cta.primary_schedule") };
      const link = t(locale, "home.problem.link_text");
      expect(link, locale).toContain(labels.primary);
      expect(withPrimaryCtaLabel(link, labels, sem)).toBe(link);
      expect(withPrimaryCtaLabel(link, labels, com)).toBe(link.replace(labels.primary, labels.schedule));
    }
    expect(withPrimaryCtaLabel(t("pt", "home.problem.link_text"), { primary: t("pt", "shared.cta.primary"), schedule: t("pt", "shared.cta.primary_schedule") }, com)).toBe(
      "Reconheceu o seu caso? Agendar diagnóstico gratuito",
    );
  });

  it("hasAgenda: URL https; vazia desliga", () => {
    expect(flags(completeSources()).hasAgenda).toBe(true);
    expect(flags(mutate((s) => void (s.agenda.url = ""))).hasAgenda).toBe(false);
  });

  it("hasCompanyData: razão social + CNPJ válido; um sem o outro desliga", () => {
    expect(flags(completeSources()).hasCompanyData).toBe(true);
    expect(flags(mutate((s) => void (s.empresa.razaoSocial = ""))).hasCompanyData).toBe(false);
    expect(flags(mutate((s) => void (s.empresa.cnpj = ""))).hasCompanyData).toBe(false);
  });

  it("hasAboutIntro / hasAboutStory: texto do dono nos 3 idiomas", () => {
    expect(flags(completeSources())).toMatchObject({ hasAboutIntro: true, hasAboutStory: true });
    const partial = mutate((s) => {
      s.empresa.apresentacao = withoutLocale(s.empresa.apresentacao!, "en", "");
      s.empresa.historia = { ...s.empresa.historia!, es: [] };
    });
    expect(flags(partial)).toMatchObject({ hasAboutIntro: false, hasAboutStory: false });
  });

  it("hasDiscoveryExclusions (B354): naoInclui com ≥ 1 item nos 3 idiomas; vazio, null ou um idioma faltando desliga", () => {
    expect(flags(completeSources()).hasDiscoveryExclusions).toBe(true);
    expect(flags(mutate((s) => void (s.descoberta.naoInclui = null))).hasDiscoveryExclusions).toBe(false);
    expect(flags(mutate((s) => void Reflect.deleteProperty(s.descoberta, "naoInclui"))).hasDiscoveryExclusions).toBe(false);
    expect(flags(mutate((s) => void (s.descoberta.naoInclui = withoutLocale(s.descoberta.naoInclui!, "en", [])))).hasDiscoveryExclusions).toBe(false);
    expect(flags(mutate((s) => void (s.descoberta.naoInclui = withoutLocale(s.descoberta.naoInclui!, "es", [" "])))).hasDiscoveryExclusions).toBe(false);
    // Independente do formato: dá para publicar o que não inclui sem os 3 campos do formato.
    expect(flags(mutate((s) => void (s.descoberta.ritmo = null))).hasDiscoveryExclusions).toBe(true);
  });

  it("hasDiscoveryFormat: os 3 campos (formato, participantes, ritmo); 2 de 3 ou um idioma faltando desliga", () => {
    expect(flags(completeSources()).hasDiscoveryFormat).toBe(true);
    // A duração não conta (D44, 21/10/2026): é sempre null e o formato liga sem ela.
    expect(completeSources().descoberta.duracao).toBeNull();
    expect(flags(mutate((s) => void (s.descoberta.participantes = null))).hasDiscoveryFormat).toBe(false);
    expect(flags(mutate((s) => void (s.descoberta.ritmo = withoutLocale(s.descoberta.ritmo!, "pt", "")))).hasDiscoveryFormat).toBe(false);
  });

  it("D44 (revoga a D42): nenhuma flag publica a duração da Descoberta; preenchê-la derruba o build", () => {
    expect("hasDiscoveryDuration" in flags(completeSources())).toBe(false);
    const withDuration = mutate((s) => {
      (s.descoberta as unknown as { duracao: unknown }).duracao = fx("em geral 1 semana");
    });
    expect(configIssues(withDuration).join("\n")).toMatch(/descoberta\.duracao: a duração da Sprint de Descoberta não é publicada/);
  });

  it("confirm.atendeExterior (D31): só junto com outrasCidades", () => {
    expect(flags(completeSources()).confirm.atendeExterior).toBe(true);
    expect(flags(mutate((s) => void (s.confirmacoes.outrasCidades = false))).confirm.atendeExterior).toBe(false);
    expect(flags(mutate((s) => void (s.confirmacoes.atendeExterior = false))).confirm).toMatchObject({ atendeExterior: false, outrasCidades: true });
  });

  it("hasSupportFormat: inclui + contratação + canais; urgências é opcional", () => {
    expect(flags(completeSources()).hasSupportFormat).toBe(true);
    expect(flags(mutate((s) => void (s.sustentacao.urgencias = null))).hasSupportFormat).toBe(true);
    expect(flags(mutate((s) => void (s.sustentacao.canais = null))).hasSupportFormat).toBe(false);
    const onlyUrgent = mutate((s) => void (s.sustentacao = { inclui: null, contratacao: null, canais: null, urgencias: fx("x") }));
    expect(flags(onlyUrgent).hasSupportFormat).toBe(false);
  });

  it("hasEngineering + engineeringFields: só os campos completos, na ordem", () => {
    expect(flags(completeSources()).engineeringFields).toHaveLength(8);
    const partial = mutate((s) => {
      s.engenharia = { ...baseSources().engenharia, tests: fx("testes"), ci_cd: withoutLocale(fx("ci"), "es", "") };
    });
    expect(flags(partial)).toMatchObject({ hasEngineering: true, engineeringFields: ["tests"] });
    expect(flags(mutate((s) => void (s.engenharia = baseSources().engenharia))).hasEngineering).toBe(false);
  });

  it("confirm.*: itens de texto só com os 3 idiomas; codigoProprietario só com rascunho escolhido", () => {
    const partial = flags(
      mutate((s) => {
        s.confirmacoes.devolutivaConteudo = withoutLocale(s.confirmacoes.devolutivaConteudo!, "es", "");
        s.confirmacoes.formatoDiagnostico = { formato: fx("x"), participantes: withoutLocale(fx("y"), "en", "") };
        s.confirmacoes.codigoProprietario = false;
      }),
    );
    expect(partial.confirm).toMatchObject({ devolutivaConteudo: false, formatoDiagnostico: false, codigoProprietario: false, nda: true });
  });

  it("hasWhatsapp / hasGa4 degradam para desligado quando vazios", () => {
    expect(flags(mutate((s) => void (s.env = { whatsappNumber: "", ga4Id: "" })))).toMatchObject({ hasWhatsapp: false, hasGa4: false });
  });
});

describe("coleções: limiares exatos, parcial não conta", () => {
  const withContent = (content: Partial<FeatureSources["content"]>) => completeSources({ content: { ...EMPTY_CONTENT, ...content } });

  it(`hasLogos: ≥ ${THRESHOLDS.logos} empresas diferentes`, () => {
    const logos = completeContent().logos;
    expect(flags(withContent({ logos })).hasLogos).toBe(true);
    expect(flags(withContent({ logos: logos.slice(0, 3) })).hasLogos).toBe(false);
    const repeated = [...logos.slice(0, 3), { ...logos[0]!, id: "outro-arquivo" }];
    expect(flags(withContent({ logos: repeated })).hasLogos).toBe(false);
    expect(contentIssues({ ...EMPTY_CONTENT, logos: repeated }).join()).toMatch(/empresa repetida/);
  });

  it("hasTestimonials: ≥ 1 depoimento (o schema garante nominal e autorizado)", () => {
    expect(flags(withContent({ depoimentos: completeContent().depoimentos })).hasTestimonials).toBe(true);
    expect(flags(withContent({ depoimentos: [] })).hasTestimonials).toBe(false);
  });

  it(`hasCases: ≥ ${THRESHOLDS.cases} cases publicados nos 3 idiomas; parcial não conta`, () => {
    const [a, b] = FIXTURE_CASE_SLUGS;
    expect(flags(withContent({ cases: [...caseVersions(a), ...caseVersions(b)] }))).toMatchObject({ hasCases: true, caseCount: 2 });
    expect(flags(withContent({ cases: caseVersions(a) }))).toMatchObject({ hasCases: false, caseCount: 1 });
    const missingEs = [...caseVersions(a), ...caseVersions(b, ["web_systems"], { locales: ["pt", "en"] })];
    expect(flags(withContent({ cases: missingEs })).hasCases).toBe(false);
    const draftEn = [...caseVersions(a), ...caseVersions(b).map((v) => (v.id.startsWith("en/") ? { ...v, publicado: false } : v))];
    expect(flags(withContent({ cases: draftEn })).hasCases).toBe(false);
  });

  it("casesByService e cases relacionados: por tag, só com as páginas de case no ar", () => {
    const [a, b] = FIXTURE_CASE_SLUGS;
    const features = flags(withContent({ cases: [...caseVersions(a, ["mvp", "web_systems"]), ...caseVersions(b, ["mvp"])] }));
    expect(features.casesByService).toEqual({ web_systems: 1, mobile_apps: 0, integrations: 0, mvp: 2, support: 0 });
    expect(hasRelatedCases(features, "mvp")).toBe(true);
    expect(hasRelatedCases(features, "support")).toBe(false);
    const single = flags(withContent({ cases: caseVersions(a, ["mvp"]) }));
    expect(hasRelatedCases(single, "mvp")).toBe(false);
  });

  it(`hasCaseFilters: chips do hub só com ≥ ${THRESHOLDS.caseFilters} cases`, () => {
    const six = Array.from({ length: 6 }, (_, i) => caseVersions(`fixture-lemamon-case-${i}`)).flat();
    expect(flags(withContent({ cases: six })).hasCaseFilters).toBe(true);
    expect(flags(withContent({ cases: six.slice(0, 15) })).hasCaseFilters).toBe(false);
  });

  it("hasMethodProof: 1 case publicado OU 1 depoimento sobre o processo", () => {
    expect(flags(withContent({ cases: caseVersions(FIXTURE_CASE_SLUGS[0]) })).hasMethodProof).toBe(true);
    expect(flags(withContent({ depoimentos: [{ id: "d", sobreProcesso: true }] })).hasMethodProof).toBe(true);
    expect(flags(withContent({ depoimentos: [{ id: "d", sobreProcesso: false }] })).hasMethodProof).toBe(false);
  });

  it("hasTeam: ≥ 1 pessoa que atua em projetos", () => {
    expect(flags(withContent({ time: [{ id: "p", atuaEmProjetos: true }] })).hasTeam).toBe(true);
    expect(flags(withContent({ time: [{ id: "p", atuaEmProjetos: false }] })).hasTeam).toBe(false);
  });

  it(`hasPosts: ≥ ${THRESHOLDS.posts} posts não rascunho`, () => {
    const posts = completeContent().posts;
    expect(flags(withContent({ posts })).hasPosts).toBe(true);
    expect(flags(withContent({ posts: posts.map((p, i) => (i === 0 ? { ...p, rascunho: true } : p)) })).hasPosts).toBe(false);
  });
});

describe("conteúdo contraditório derruba o build (contentIssues)", () => {
  const [a, b] = FIXTURE_CASE_SLUGS;
  it.each([
    ["serviços diferentes entre idiomas", [...caseVersions(a, ["mvp"], { locales: ["pt"] }), ...caseVersions(a, ["web_systems"], { locales: ["en"] })], /servicos/],
    ["depoimento que não existe", caseVersions(b, ["mvp"], { depoimento: "nao-existe" }), /depoimento/],
    ["arquivo fora de cases/<idioma>/", [{ id: "fr/x", publicado: true, servicos: ["mvp" as const] }], /cases\/<pt\|en\|es>/],
    ["slug fora do padrão", [{ id: "pt/Meu_Case", publicado: true, servicos: ["mvp" as const] }], /slug/],
  ] as const)("%s", (_label, cases, expected) => {
    expect(contentIssues({ ...EMPTY_CONTENT, cases }).join("\n")).toMatch(expected);
  });

  describe("slug da URL por idioma (slugUrl, SEO S01-3)", () => {
    const comSlug = (slug: string, slugs: Partial<Record<"pt" | "en" | "es", string>>) =>
      caseVersions(slug, ["mvp"]).map((item) => ({ ...item, slugUrl: slugs[item.id.split("/")[0] as "pt" | "en" | "es"] ?? null }));

    it("en e es com slug próprio, diferentes entre si e do pt, é válido", () => {
      expect(contentIssues({ ...EMPTY_CONTENT, cases: comSlug(a, { en: "freight-system", es: "sistema-de-fletes" }) })).toEqual([]);
    });

    it("slugUrl em pt-BR derruba o build (em pt, a URL é o nome do arquivo)", () => {
      expect(contentIssues({ ...EMPTY_CONTENT, cases: comSlug(a, { pt: "outro-nome" }) }).join("\n")).toMatch(/slugUrl` só vale em en\/es/);
    });

    it("dois cases com a mesma URL no mesmo idioma derrubam o build", () => {
      const cases = [...comSlug(a, { en: "freight-system" }), ...comSlug(b, { en: "freight-system" })];
      expect(contentIssues({ ...EMPTY_CONTENT, cases }).join("\n")).toMatch(/a URL do case \(en\/freight-system\) é a mesma de/);
      // slugUrl igual à chave de OUTRO case no mesmo idioma também colide.
      const colide = [...comSlug(a, {}), ...comSlug(b, { es: a })];
      expect(contentIssues({ ...EMPTY_CONTENT, cases: colide }).join("\n")).toMatch(new RegExp(`a URL do case \\(es/${a}\\)`));
      // O mesmo slug em idiomas diferentes não colide (URLs diferentes).
      expect(contentIssues({ ...EMPTY_CONTENT, cases: comSlug(a, { en: "mesmo-slug", es: "mesmo-slug" }) })).toEqual([]);
    });
  });

  it("publicar um idioma antes dos outros NÃO é erro (é parcial: só não vai ao ar)", () => {
    expect(contentIssues({ ...EMPTY_CONTENT, cases: caseVersions(a, ["mvp"], { locales: ["pt"] }) })).toEqual([]);
  });

  describe("case anonimizado (sem cliente): nada liga a empresa a ele (B378)", () => {
    const anonimo = caseVersions(a, ["mvp"], { anonimo: true });

    it("anonimizado sozinho, sem logo nem depoimento apontando para ele, é válido", () => {
      const logos = completeContent().logos;
      expect(contentIssues({ ...EMPTY_CONTENT, cases: anonimo, logos })).toEqual([]);
    });

    it("logo com caseSlug para o case anonimizado derruba o build (o logo identificaria o cliente)", () => {
      const logos = [{ id: "logo-x", empresa: "Empresa X", caseSlug: a }];
      expect(contentIssues({ ...EMPTY_CONTENT, cases: anonimo, logos }).join("\n")).toMatch(
        /dados\/dono\.json › logos \(logo-x\): caseSlug ".+" aponta para um case anonimizado/,
      );
    });

    it("depoimento com caseSlug para o case anonimizado derruba o build (nome, cargo e empresa)", () => {
      const depoimentos = [{ id: "dep-x", caseSlug: a, sobreProcesso: true }];
      expect(contentIssues({ ...EMPTY_CONTENT, cases: anonimo, depoimentos }).join("\n")).toMatch(
        /dados\/dono\.json › depoimentos \(dep-x\): caseSlug ".+" aponta para um case anonimizado/,
      );
    });

    it("o mesmo logo apontando para um case NOMINAL continua valendo", () => {
      const logos = [{ id: "logo-x", empresa: "Empresa X", caseSlug: b }];
      expect(contentIssues({ ...EMPTY_CONTENT, cases: [...anonimo, ...caseVersions(b, ["mvp"])], logos })).toEqual([]);
    });

    it("nominal num idioma e anonimizado em outro derruba o build", () => {
      const misto = [...caseVersions(a, ["mvp"], { locales: ["pt", "en"] }), ...caseVersions(a, ["mvp"], { locales: ["es"], anonimo: true })];
      expect(contentIssues({ ...EMPTY_CONTENT, cases: misto }).join("\n")).toMatch(/nominal ou anonimizado nos 3 idiomas/);
    });
  });
});

describe("config malformado derruba o build (configIssues)", () => {
  it.each([
    ["dinheiro fora de precos/qualificacao", (s: FeatureSources) => void (s.descoberta.formato = { pt: "R$ 5 mil", en: "x", es: "x" }), /monetário/],
    ["placeholder no texto do dono", (s: FeatureSources) => void (s.engenharia.tests = { pt: "{x}", en: "x", es: "x" }), /rascunho/],
    ["dinheiro no que a Descoberta não inclui", (s: FeatureSources) => void (s.descoberta.naoInclui = { pt: ["Hospedagem de R$ 200"], en: ["x"], es: ["x"] }), /descoberta\.naoInclui\.pt\[0\].*monetário/],
    ["mais de 5 itens no que a Descoberta não inclui", (s: FeatureSources) => void (s.descoberta.naoInclui = { pt: ["a", "b", "c", "d", "e", "f"], en: ["x"], es: ["x"] }), /descoberta\.naoInclui\.pt: no máximo 5/],
    ["item longo no que a Descoberta não inclui", (s: FeatureSources) => void (s.descoberta.naoInclui = { pt: ["x".repeat(121)], en: ["x"], es: ["x"] }), /descoberta\.naoInclui\.pt\[0\]: no máximo 120/],
    ["sustentação com unidade de projeto", (s: FeatureSources) => void (s.precos.sustentacao!.unidade = "projeto"), /unidade/],
    ["desenvolvimento com unidade mensal", (s: FeatureSources) => void (s.precos.desenvolvimento.sistemas!.unidade = "mes"), /unidade/],
    ["mais de 3 fatores", (s: FeatureSources) => void (s.precos.desenvolvimento.sistemas!.fatores.pt = ["a", "b", "c", "d"]), /fatores/],
    [
      "linha de preço da Descoberta (gratuita, D44)",
      (s: FeatureSources) => void ((s.precos as unknown as Record<string, unknown>).descoberta = null),
      /precos: campo desconhecido "descoberta"/,
    ],
    ["perfil fora do domínio", (s: FeatureSources) => void (s.perfis.github.url = "https://gitlab.com/lemamon"), /github/],
    ["3 faixas no wizard", (s: FeatureSources) => void s.qualificacao.faixas.pop(), /4 faixas/],
    ["corte que não é faixa", (s: FeatureSources) => void (s.qualificacao.faixas = []), /corteMql|faixas mensais/],
    ["moeda fora do padrão ISO", (s: FeatureSources) => void (s.qualificacao.moeda = "reais"), /moeda/],
    ["ano de fundação no futuro", (s: FeatureSources) => void (s.empresa.anoFundacao = 2999), /futuro/],
    ["CNPJ com dígito errado", (s: FeatureSources) => void (s.empresa.cnpj = "11.444.777/0001-60"), /CNPJ/],
    ["apresentação acima de 160 caracteres", (s: FeatureSources) => void (s.empresa.apresentacao = fx("x".repeat(170))), /apresentacao/],
    ["score D sem a confirmação do dono", (s: FeatureSources) => {
      s.qualificacao.scoreD.ativo = true;
      s.confirmacoes.scoreDRecebeDiagnostico = false;
    }, /scoreDRecebeDiagnostico/],
  ])("%s", (_label, fn, expected) => {
    expect(configIssues(mutate(fn)).join("\n")).toMatch(expected);
  });
});

describe("página when_data some de rota, menu, footer e hreflang sem a flag", () => {
  it("rotas: cases, case, sobre e blog só com a flag", () => {
    const on = flags(completeSources());
    const off = flags(baseSources());
    for (const key of ["cases_hub", "case", "about", "blog_hub", "blog_post"] as const) {
      expect(isRouteLive(key, on)).toBe(true);
      expect(isRouteLive(key, off)).toBe(false);
    }
  });

  it("menu e footer (components/shell/nav.ts) consultam as mesmas flags", () => {
    const on = flags(completeSources());
    const off = flags(baseSources());
    for (const locale of ["pt", "en", "es"] as const) {
      expect(mainLinks(locale, on).map((link) => link.route)).toEqual(expect.arrayContaining(["cases_hub", "about"]));
      expect(mainLinks(locale, off).map((link) => link.route)).not.toEqual(expect.arrayContaining(["cases_hub"]));
      expect(mainLinks(locale, off).map((link) => link.route)).not.toContain("about");
      expect(blogLink(locale, off)).toBeNull();
    }
    expect(blogLink("pt", on)?.route).toBe("blog_hub");
    expect(blogLink("en", on)).toBeNull();
  });

  it("hreflang: case recíproco nos 3 idiomas; blog (só pt-BR) sem pares", () => {
    expect(alternates("case", { slug: "x" }).map((item) => item.hreflang)).toEqual(["pt-BR", "en", "es", "x-default"]);
    expect(alternates("blog_post", { slug: "x" })).toEqual([]);
  });
});

describe("textos de <head> sem seoTitle/seoDescription", () => {
  it("truncateAtWord corta na última palavra inteira e marca o corte", async () => {
    const { truncateAtWord } = await import("@/lib/content");
    expect(truncateAtWord("Curto", 50)).toBe("Curto");
    const long = "Como escolher uma empresa de desenvolvimento de software sem cair em armadilhas";
    const cut = truncateAtWord(long, 50);
    expect(cut.length).toBeLessThanOrEqual(50);
    expect(cut.endsWith("…")).toBe(true);
    expect(long.startsWith(cut.slice(0, -1))).toBe(true);
    expect(cut).not.toMatch(/\s…$/);
  });
});
