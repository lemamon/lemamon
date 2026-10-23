/**
 * Renderização das seções e páginas when_data (Container API do Astro):
 *  - com o dado REAL do repositório (dados/dono.json, sem pessoas, cases,
 *    depoimentos, logos nem formatos), cada seção gated não gera NADA (nem
 *    <section>, nem título, nem âncora), nos 3 idiomas. Exceção decidida pelo
 *    dono: com o GitHub publicado, "Como a gente constrói" vira só a linha
 *    "a Lemamon.dev no GitHub" (sem título);
 *  - com as fixtures injetadas (prop `data`, só para teste), cada seção aparece
 *    com a estrutura do BLUEPRINT; com dado parcial, some;
 *  - o que é interno (registro da autorização, fonte da métrica) nunca é publicado.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";

import CaseArticle from "@/components/gated/CaseArticle.astro";
import CaseGrid from "@/components/gated/CaseGrid.astro";
import CasesSection from "@/components/gated/CasesSection.astro";
import DiscoveryExclusions from "@/components/gated/DiscoveryExclusions.astro";
import DiscoveryFormat from "@/components/gated/DiscoveryFormat.astro";
import EngineeringSection from "@/components/gated/EngineeringSection.astro";
import LogosStrip from "@/components/gated/LogosStrip.astro";
import MethodProof from "@/components/gated/MethodProof.astro";
import PostArticle from "@/components/gated/PostArticle.astro";
import PostMidCta from "@/components/gated/PostMidCta.astro";
import RelatedCases from "@/components/gated/RelatedCases.astro";
import SupportFormat from "@/components/gated/SupportFormat.astro";
import TeamSection from "@/components/gated/TeamSection.astro";
import TestimonialHighlight from "@/components/gated/TestimonialHighlight.astro";
import LanguageSelector from "@/components/shell/LanguageSelector.astro";
import LanguageSuggestion from "@/components/shell/LanguageSuggestion.astro";
import { POST_MID_CTA_LOCAL } from "@/components/gated/blog";
import { techIcon, techKey } from "@/components/gated/tech-icon";
import { ENGINEERING_FIELDS } from "@/config/engenharia";
import { getFeatures } from "@/config/features";
import { anchorId, ANCHORS, SERVICE_KEYS } from "@/config/routes";
import { hasText, t, tDynamic, type Locale } from "@/i18n";
import type { CaseItem } from "@/lib/content";

import {
  caseFrontmatter,
  entry,
  image,
  logoFrontmatter,
  POST_BODY,
  postFrontmatter,
  teamFrontmatter,
  testimonialFrontmatter,
} from "../fixtures/content-entries";
import { completeDescoberta, completeEngenharia, completeSustentacao, FIXTURE_CASE_SLUGS, FIXTURE_MARK } from "../fixtures/owner-data";

const LOCALES: Locale[] = ["pt", "en", "es"];
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const html = (component: any, props: Record<string, unknown>, options: { locals?: Record<string, unknown>; slots?: Record<string, string> } = {}) =>
  container.renderToString(component, { props, ...options });

const caseItem = (locale: Locale, slug: string): CaseItem => ({
  slug,
  urlSlug: slug,
  entry: entry("cases", `${locale}/${slug}`, caseFrontmatter(locale, slug)),
});
const caseItems = (locale: Locale) => FIXTURE_CASE_SLUGS.map((slug) => caseItem(locale, slug));
const testimonial = () => entry("depoimentos", "fixture-lemamon-depoimento", testimonialFrontmatter());
const person = () => entry("time", "fixture-lemamon-pessoa", teamFrontmatter());
const logos = () => ["alfa", "beta", "gama", "delta"].map((name) => entry("logos", `fixture-lemamon-${name}`, logoFrontmatter(name)));
const post = (n: number) => entry("posts", `fixture-lemamon-post-${n}`, postFrontmatter(n), POST_BODY);

describe("sem dado (estado real do repositório): nenhuma seção when_data gera HTML", () => {
  const sections = {
    LogosStrip,
    TestimonialHighlight,
    CasesSection,
    TeamSection,
    MethodProof,
    DiscoveryFormat,
    DiscoveryExclusions,
    SupportFormat,
  };
  for (const locale of LOCALES) {
    it.each(Object.entries(sections))(`%s (${locale})`, async (_name, component) => {
      expect((await html(component, { locale })).trim()).toBe("");
    });
    it(`EngineeringSection (${locale}): sem engenharia preenchida, só a linha do GitHub publicado`, async () => {
      const out = await html(EngineeringSection, { locale });
      expect(out).not.toContain("<h2");
      expect(out).not.toContain(`id="${anchorId(ANCHORS.engineering, locale)}"`);
      expect(out).toContain('href="https://github.com/lemamon-dev"');
      expect(out).toContain('data-profile="github"');
    });
    it(`RelatedCases nos 5 serviços (${locale})`, async () => {
      for (const service of SERVICE_KEYS) {
        expect((await html(RelatedCases, { locale, service })).trim()).toBe("");
      }
    });
  }
});

describe("com dado completo (fixtures injetadas), cada seção aparece; parcial some", () => {
  it("LogosStrip: rótulo sem H2 + ≥ 4 logos; com 3, nada", async () => {
    const on = await html(LogosStrip, { locale: "pt", data: { features: { hasLogos: true }, logos: logos() } });
    expect(on).toContain('id="logos"');
    expect(on).toContain(t("pt", "shared.proof.logos_label"));
    expect(on).not.toMatch(/<h2/);
    const few = await html(LogosStrip, { locale: "pt", data: { features: { hasLogos: true }, logos: logos().slice(0, 3) } });
    expect(few.trim()).toBe("");
    const off = await html(LogosStrip, { locale: "pt", data: { features: { hasLogos: false }, logos: logos() } });
    expect(off.trim()).toBe("");
  });

  it("LogosStrip: logo com caseSlug (case no ar) vira link para o case no idioma; sem, só imagem", async () => {
    const [first, ...rest] = logos();
    const linked = { ...first!, data: { ...first!.data, caseSlug: FIXTURE_CASE_SLUGS[0] } };
    const out = await html(LogosStrip, { locale: "es", data: { features: { hasLogos: true }, logos: [linked, ...rest] } });
    expect(out.match(/<a\b/g)?.length ?? 0).toBe(1);
    expect(out).toContain(`href="/es/casos/${FIXTURE_CASE_SLUGS[0]}"`);
  });

  it("TestimonialHighlight: <figure>, nome completo, H2 oculto e 'Ler o case' com o nome do case", async () => {
    const out = await html(TestimonialHighlight, {
      locale: "en",
      data: { features: { hasTestimonials: true }, testimonial: testimonial(), caseName: "Case X" },
    });
    expect(out).toContain('id="depoimento"');
    expect(out).toMatch(/<h2[^>]*class="sr-only"/);
    expect(out).toContain("<figure");
    expect(out).toContain(`Marina ${FIXTURE_MARK} Souza`);
    expect(out).toContain(`href="/en/cases/${FIXTURE_CASE_SLUGS[0]}"`);
    expect(out).toContain(`aria-label="${t("en", "shared.cta.read_case_aria", { case: "Case X" })}"`);
    expect(out).not.toContain("REGISTRO-INTERNO");
    const noCase = entry("depoimentos", "d", { ...testimonialFrontmatter(), caseSlug: undefined });
    const without = await html(TestimonialHighlight, { locale: "pt", data: { features: { hasTestimonials: true }, testimonial: noCase } });
    expect(without).not.toContain("/cases/");
  });

  it("TestimonialHighlight com vídeo (B287): fachada sem peso inicial, <video preload=none> só no clique; sem player de terceiros", async () => {
    const fm = testimonialFrontmatter();
    const comVideo = entry("depoimentos", "fixture-lemamon-depoimento-video", {
      ...fm,
      video: {
        src: "videos/fixture-lemamon.mp4",
        poster: image("poster"),
        legendas: { pt: "videos/fixture-lemamon.pt.vtt", es: "videos/fixture-lemamon.es.vtt" },
        duracaoSegundos: 60,
      },
      autorizacao: { ...fm.autorizacao, video: true },
    });
    const video = { src: "/_midia/fixture-lemamon.0123456789.mp4", legendas: { pt: "/_midia/fixture-lemamon.pt.0123456789.vtt", es: "/_midia/fixture-lemamon.es.0123456789.vtt" } };
    const out = await html(TestimonialHighlight, {
      locale: "es",
      data: { features: { hasTestimonials: true }, testimonial: comVideo, caseName: "Case X", video },
    });
    // Fora do <noscript> e do <template> (inertes), o HTML não pede NADA do vídeo:
    // nenhum poster="…", nenhum <video> vivo, e a <img> do quadro sai sem src/srcset.
    const vivo = out.replace(/<noscript>[\s\S]*?<\/noscript>/g, "").replace(/<template\b[\s\S]*?<\/template>/g, "");
    expect(vivo).not.toMatch(/\bposter="/);
    expect(vivo).not.toContain("<video");
    expect(vivo).not.toContain("/_midia/");
    // A fachada: <button> com nome acessível, aspect-ratio do quadro (sem salto) e a
    // <img> lazy com srcset/src em data-* (o script liga a ~300px da tela) e sizes.
    const button = /<button\b[^>]*data-testimonial-video-play[^>]*>/.exec(vivo)?.[0] ?? "";
    expect(button).toContain('type="button"');
    expect(button).toMatch(/aria-label="[^"]*Marina [^"]*"/);
    expect(button).toMatch(/style="aspect-ratio: \d+ \/ \d+"/);
    const img = /<img\b[^>]*>/.exec(button ? vivo.slice(vivo.indexOf(button)) : "")?.[0] ?? "";
    expect(img).toContain('loading="lazy"');
    expect(img).toContain('decoding="async"');
    expect(img).toContain('alt=""');
    expect(img).toMatch(/\bdata-srcset="[^"]+ \d+w(, [^"]+ \d+w)*"/);
    expect(img).toMatch(/\bdata-src="[^"]+"/);
    expect(img).toMatch(/\bsizes="[^"]+"/);
    expect(img).toMatch(/\bwidth="\d+"[^>]*\bheight="\d+"/);
    expect(img).not.toMatch(/\s(src|srcset)="/);
    // O <video> do clique (no <template>) e o do <noscript>: preload=none, controles,
    // nome acessível; só o do <noscript> leva poster (sem JavaScript não há fachada).
    const template = /<template\b[^>]*data-testimonial-video-template[^>]*>([\s\S]*?)<\/template>/.exec(out)?.[1] ?? "";
    const noscript = /<noscript>([\s\S]*?)<\/noscript>/.exec(out)?.[1] ?? "";
    for (const bloco of [template, noscript]) {
      const tag = /<video\b[^>]*>/.exec(bloco)?.[0] ?? "";
      expect(tag).toContain('preload="none"');
      expect(tag).toContain("controls");
      expect(tag).toContain("playsinline");
      expect(tag).toMatch(/aria-label="[^"]*Marina [^"]*"/);
      expect(bloco).toContain('<source src="/_midia/fixture-lemamon.0123456789.mp4" type="video/mp4"');
      expect(bloco).toMatch(/<track kind="captions" src="\/_midia\/fixture-lemamon\.pt\.0123456789\.vtt" srclang="pt-BR"/);
      expect(bloco).toMatch(/<track kind="captions" src="\/_midia\/fixture-lemamon\.es\.0123456789\.vtt" srclang="es" label="[^"]+"/);
    }
    expect(/<video\b[^>]*>/.exec(template)?.[0]).not.toMatch(/\bposter="/);
    expect(/<video\b[^>]*>/.exec(noscript)?.[0]).toMatch(/\bposter="[^"]+"/);
    // A legenda do idioma da página liga no primeiro play (data-legenda-padrao), nunca
    // com <track default>: com default, o navegador baixaria o .vtt antes da hora.
    expect(/<video\b[^>]*>/.exec(template)?.[0]).toContain('data-legenda-padrao="es"');
    expect(out).not.toMatch(/<track\b[^>]*\bdefault\b/);
    expect(out).not.toMatch(/<iframe|youtube|vimeo/i);
    // Sem vídeo no depoimento, nenhum <video> nem fachada.
    const semVideo = await html(TestimonialHighlight, { locale: "es", data: { features: { hasTestimonials: true }, testimonial: testimonial() } });
    expect(semVideo).not.toContain("<video");
    expect(semVideo).not.toContain("data-testimonial-video");
  });

  it("CasesSection: H2, até 3 cards e 'Ver todos os cases'; sem hasCases, nada", async () => {
    const out = await html(CasesSection, { locale: "es", data: { features: { hasCases: true }, items: caseItems("es") } });
    expect(out).toContain('id="cases"');
    expect(out).toContain(t("es", "home.cases.title"));
    expect(out).toContain('href="/es/casos"');
    expect(out.match(/data-case-item/g)).toHaveLength(2);
    const off = await html(CasesSection, { locale: "es", data: { features: { hasCases: false }, items: caseItems("es") } });
    expect(off.trim()).toBe("");
  });

  it("CasesSection como capítulo da Home (B216): número na eyebrow e divisória no topo", async () => {
    const out = await html(CasesSection, {
      locale: "pt",
      index: 5,
      divider: true,
      data: { features: { hasCases: true }, items: caseItems("pt") },
    });
    expect(out).toMatch(/<section[^>]*id="cases"[^>]*data-divider="true"/);
    expect(out).toMatch(new RegExp(`class="eyebrow__index"[^>]*>05 /</span>\\s*${t("pt", "home.cases.eyebrow")}`));
    // Fora da Home (sem as props): sem número e sem linha.
    const plain = await html(CasesSection, { locale: "pt", data: { features: { hasCases: true }, items: caseItems("pt") } });
    expect(plain).not.toContain("eyebrow__index");
    expect(plain).not.toContain("data-divider");
  });

  it("CasesSection com cases ANONIMIZADOS (B378): 'Setor:' + 'setor · porte', nenhum nome de cliente", async () => {
    const anonimo = (locale: Locale, slug: string): CaseItem => {
      const fm = caseFrontmatter(locale, slug);
      const { cliente: _cliente, depoimento: _depoimento, ...rest } = fm;
      const data = {
        ...rest,
        fichaTecnica: { stack: fm.fichaTecnica.stack },
        autorizacao: { ...fm.autorizacao, escopo: { ...fm.autorizacao.escopo, nomeDoCliente: false } },
      };
      return { slug, urlSlug: slug, entry: entry("cases", `${locale}/${slug}`, data) };
    };
    for (const locale of LOCALES) {
      const items = FIXTURE_CASE_SLUGS.map((slug) => anonimo(locale, slug));
      const out = await html(CasesSection, { locale, data: { features: { hasCases: true }, items } });
      expect(out.match(/data-case-item/g), locale).toHaveLength(2);
      expect(out, locale).toContain(`${t(locale, "shared.proof.case_card.sector_label")}:`);
      expect(out, locale).toContain(`${FIXTURE_MARK} Logística · ${FIXTURE_MARK} Médio porte`);
      expect(out, locale).not.toContain(`${t(locale, "shared.proof.case_card.client_label")}:`);
      expect(out, locale).not.toContain("Transportes Modelo");
    }
  });

  it("RelatedCases: só cases com a tag do serviço", async () => {
    const features = { hasCases: true, casesByService: { web_systems: 2, mobile_apps: 2, integrations: 0, mvp: 0, support: 0 } };
    const on = await html(RelatedCases, { locale: "pt", service: "mobile_apps", data: { features, items: caseItems("pt") } });
    expect(on).toContain('id="cases-relacionados"');
    expect(on).toContain(t("pt", "services.template.related_cases_title", { servico_frase: "aplicativo" }));
    const off = await html(RelatedCases, { locale: "pt", service: "integrations", data: { features, items: caseItems("pt") } });
    expect(off.trim()).toBe("");
  });

  it("TeamSection: card da pessoa e link para /sobre", async () => {
    const out = await html(TeamSection, { locale: "pt", data: { features: { hasTeam: true }, people: [person()] } });
    expect(out).toContain('id="time"');
    expect(out).toContain(`Rafael ${FIXTURE_MARK} Lima`);
    expect(out).toContain('href="/sobre"');
    // Sem as props de capítulo: eyebrow "Time" sem número e sem linha.
    expect(out).toMatch(new RegExp(`<p class="eyebrow"[^>]*>\\s*${t("pt", "home.team.eyebrow")}\\s*</p>`));
    expect(out).not.toContain("eyebrow__index");
    expect(out).not.toContain("data-divider");
    const notActing = entry("time", "p", { ...teamFrontmatter(), atuaEmProjetos: false });
    const off = await html(TeamSection, { locale: "pt", data: { features: { hasTeam: true }, people: [notActing] } });
    expect(off.trim()).toBe("");
  });

  it("TeamSection como capítulo da Home (B216): eyebrow com o número e divisória, nos 3 idiomas", async () => {
    for (const locale of LOCALES) {
      const out = await html(TeamSection, { locale, index: 7, divider: true, data: { features: { hasTeam: true }, people: [person()] } });
      expect(out, locale).toMatch(/<section[^>]*id="time"[^>]*data-divider="true"/);
      expect(out, locale).toMatch(new RegExp(`class="eyebrow__index"[^>]*>07 /</span>\\s*${t(locale, "home.team.eyebrow")}`));
    }
  });

  it("MethodProof: linha do tempo real nas etapas do método; link só com as páginas de case no ar", async () => {
    const data = { features: { hasMethodProof: true, hasCases: false }, items: caseItems("pt").slice(0, 1), testimonial: testimonial() };
    const out = await html(MethodProof, { locale: "pt", data });
    expect(out).toContain('id="na-pratica"');
    expect(out).toContain(t("pt", "shared.method_timeline.stages.discovery.name"));
    expect(out).toContain("mar/2026");
    expect(out).not.toContain("/cases/");
    expect(out).toContain("<figure");
    const linked = await html(MethodProof, { locale: "pt", data: { ...data, features: { hasMethodProof: true, hasCases: true } } });
    expect(linked).toContain(`href="/cases/${FIXTURE_CASE_SLUGS[0]}"`);
  });

  it("EngineeringSection: um item por campo completo; fallback do GitHub; senão nada", async () => {
    const all = await html(EngineeringSection, {
      locale: "pt",
      data: { features: { hasEngineering: true, engineeringFields: [...ENGINEERING_FIELDS], profiles: { github: true, linkedin: false, medium: false } }, engenharia: completeEngenharia() },
    });
    expect(all).toContain('id="como-construimos"');
    expect(all.match(/<dt/g)).toHaveLength(ENGINEERING_FIELDS.length);
    const one = await html(EngineeringSection, {
      locale: "pt",
      data: { features: { hasEngineering: true, engineeringFields: ["tests"], profiles: { github: false, linkedin: false, medium: false } }, engenharia: completeEngenharia() },
    });
    expect(one.match(/<dt/g)).toHaveLength(1);
    const fallback = await html(EngineeringSection, {
      locale: "en",
      data: { features: { hasEngineering: false, engineeringFields: [], profiles: { github: true, linkedin: false, medium: false } }, engenharia: completeEngenharia() },
    });
    expect(fallback).not.toContain("<h2");
    expect(fallback).toContain('href="https://github.com/lemamon-dev"');
    expect(fallback).toContain('data-track="profile_click"');
    expect(fallback).toContain("Lemamon.dev on GitHub");
    const none = await html(EngineeringSection, {
      locale: "pt",
      data: { features: { hasEngineering: false, engineeringFields: [], profiles: { github: false, linkedin: false, medium: false } }, engenharia: completeEngenharia() },
    });
    expect(none.trim()).toBe("");
  });

  it("DiscoveryFormat: os 3 campos (sem duração, D44); com 1 faltando, nada", async () => {
    const on = await html(DiscoveryFormat, { locale: "es", data: { features: { hasDiscoveryFormat: true }, descoberta: completeDescoberta() } });
    // es: id localizado (auditoria SEO S01-8) e o id pt como alias vazio.
    expect(on).toContain('id="como-funciona"');
    expect(on).toMatch(/<span id="como-acontece" class="section__alias sr-only" aria-hidden="true"/);
    expect(on.match(/<dt/g)).toHaveLength(3);
    // A duração não aparece: o intro remete ao diagnóstico.
    expect(on).toContain(t("es", "discovery_sprint.how_it_happens.intro"));
    const partial = await html(DiscoveryFormat, {
      locale: "es",
      data: { features: { hasDiscoveryFormat: true }, descoberta: { ...completeDescoberta(), ritmo: null } },
    });
    expect(partial.trim()).toBe("");
  });

  it("DiscoveryExclusions (B354): 'O que a Descoberta não inclui' só com a flag e a lista nos 3 idiomas", async () => {
    const data = { features: { hasDiscoveryExclusions: true }, descoberta: completeDescoberta() };
    for (const locale of LOCALES) {
      const on = await html(DiscoveryExclusions, { locale, data });
      if (hasText(locale, "discovery_sprint.exclusions.title")) {
        expect(on, locale).toContain('id="o-que-nao-inclui"');
        expect(on, locale).toMatch(/<h2[^>]*id="o-que-nao-inclui-title"/);
        expect(on, locale).toContain(tDynamic(locale, "discovery_sprint.exclusions.title"));
        expect(on.match(/<li/g), locale).toHaveLength(2);
        expect(on, locale).toContain(`${FIXTURE_MARK} a hospedagem (${locale})`);
      } else {
        // Sem o título no i18n (chave pedida ao shell/copy), nunca sai uma lista sem cabeçalho.
        expect(on.trim(), locale).toBe("");
      }
    }
    const off = await html(DiscoveryExclusions, { locale: "pt", data: { ...data, features: { hasDiscoveryExclusions: false } } });
    expect(off.trim()).toBe("");
    const partial = await html(DiscoveryExclusions, {
      locale: "pt",
      data: { ...data, descoberta: { ...completeDescoberta(), naoInclui: { ...completeDescoberta().naoInclui!, es: [] } } },
    });
    expect(partial.trim()).toBe("");
  });

  it("SupportFormat: urgências só aparece com texto (o rótulo nunca sozinho)", async () => {
    const full = await html(SupportFormat, { locale: "pt", data: { features: { hasSupportFormat: true }, sustentacao: completeSustentacao() } });
    expect(full).toContain('id="formato"');
    expect(full).toContain(t("pt", "services.support.format.fields.urgent"));
    const noUrgent = await html(SupportFormat, {
      locale: "pt",
      data: { features: { hasSupportFormat: true }, sustentacao: { ...completeSustentacao(), urgencias: null } },
    });
    expect(noUrgent.match(/<dt/g)).toHaveLength(3);
    expect(noUrgent).not.toContain(t("pt", "services.support.format.fields.urgent"));
  });
});

describe("página de case e post (corpo)", () => {
  it("CaseArticle: H1, ficha, combinado, linha do tempo, resultado, ficha técnica; nada interno vaza", async () => {
    const item = caseItem("pt", FIXTURE_CASE_SLUGS[0]);
    const out = await html(
      CaseArticle,
      { locale: "pt", slug: item.slug, entry: item.entry, testimonial: testimonial(), related: [caseItem("pt", FIXTURE_CASE_SLUGS[1])] },
      { slots: { default: `<p>${FIXTURE_MARK} corpo MDX</p>` } },
    );
    expect(out.match(/<h1/g)).toHaveLength(1);
    expect(out).toContain(item.entry.data.titulo);
    expect(out).toContain('aria-label="' + t("pt", "shared.breadcrumb.aria_label") + '"');
    for (const key of ["problem_title", "agreed_title", "built_title", "how_it_went_title", "result_title", "related_title"] as const) {
      expect(out).toContain(t("pt", `cases.case.${key}`));
    }
    expect(out).toContain(t("pt", "cases.case.agreed_labels.out_of_scope"));
    expect(out).toContain(t("pt", "cases.case.result_labels.before"));
    expect(out).toContain(`${FIXTURE_MARK} corpo MDX`);
    expect(out).toContain('rel="noopener"');
    expect(out).not.toContain("REGISTRO-INTERNO");
    expect(out).not.toContain("FONTE-INTERNA");
    expect(out).not.toContain("Diretora de operações");
    // B114: "Salvar este case em PDF" (window.print) medido como cta_click case_print; só com o rótulo no i18n.
    if (hasText("pt", "cases.case.print.button")) {
      expect(out).toMatch(/<p class="case-print"[^>]*data-case-print[^>]*hidden/);
      expect(out).toMatch(/<button[^>]*data-track="cta_click"[^>]*data-cta-id="case_print"/);
      expect(out).toContain(tDynamic("pt", "cases.case.print.button"));
    } else {
      expect(out).not.toContain("data-case-print");
    }
    // B114, no papel o header some: o case leva logo + endereço no topo e, só com
    // razão social e CNPJ válidos (hasCompanyData), o fecho com os dois.
    const masthead = /<div class="case-print-masthead"[\s\S]*?<\/div>/.exec(out)?.[0] ?? "";
    expect(masthead).toContain(`/cases/${item.slug}`);
    expect(masthead).not.toMatch(/https?:\/\//);
    expect(out.indexOf("case-print-masthead")).toBeLessThan(out.indexOf("<h1"));
    const features = await getFeatures();
    if (features.hasCompanyData) {
      expect(out).toMatch(/<p class="case-print-colophon"[^>]*>[^<]*CNPJ/);
      expect(out.lastIndexOf("case-print-colophon")).toBeGreaterThan(out.indexOf('id="outros-projetos"'));
    } else {
      expect(out).not.toContain("case-print-colophon");
    }
  });

  it("CaseArticle (SEO S02-10, S03-15, S03-2): breadcrumb e BreadcrumbList com o nome do projeto, nunca setor · porte", async () => {
    const fm = caseFrontmatter("pt");
    const { cliente: _cliente, depoimento: _depoimento, ...rest } = fm;
    const anonimo = {
      ...rest,
      setor: `${FIXTURE_MARK} Indústria`,
      porte: `${FIXTURE_MARK} Multinacional`,
      fichaTecnica: { stack: fm.fichaTecnica.stack },
      autorizacao: { ...fm.autorizacao, escopo: { ...fm.autorizacao.escopo, nomeDoCliente: false } },
    };
    const trail = (out: string) => /<nav class="breadcrumb"[\s\S]*?<\/nav>/.exec(out)?.[0] ?? "";
    const crumbsLd = (out: string) =>
      [...out.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
        .map((match) => JSON.parse(match[1]!))
        .find((node) => node["@type"] === "BreadcrumbList");
    for (const [data, expected] of [
      [{ ...anonimo, seoTitle: `${FIXTURE_MARK} Painel de fretes` }, `${FIXTURE_MARK} Painel de fretes`],
      [anonimo, fm.tipoDeSistema],
    ] as const) {
      const item = entry("cases", "pt/x", data);
      const out = await html(CaseArticle, { locale: "pt", slug: "x", entry: item, testimonial: null, related: [] });
      expect(trail(out)).toMatch(new RegExp(`<span aria-current="page"[^>]*>${expected}</span>`));
      // O nome do projeto não é o H1: o item atual não some no celular.
      expect(trail(out)).not.toContain("data-hide-current");
      expect(trail(out)).not.toContain(`${FIXTURE_MARK} Indústria · ${FIXTURE_MARK} Multinacional`);
      const list = crumbsLd(out);
      expect(list.itemListElement.at(-1)).toEqual({ "@type": "ListItem", position: 3, name: expected });
      // Setor e porte continuam no eyebrow (D45).
      expect(out).toMatch(new RegExp(`<p class="eyebrow"[^>]*>${FIXTURE_MARK} Indústria · ${FIXTURE_MARK} Multinacional</p>`));
    }
  });

  it("CaseArticle (SEO S03-4, S06-9): ficha com link para cada serviço e cada etapa; a Descoberta leva à Sprint", async () => {
    const paths = {
      pt: { services: ["/servicos/sistemas-web", "/servicos/aplicativos"], how: "/como-trabalhamos", sprint: "/sprint-de-descoberta" },
      en: { services: ["/en/services/web-systems", "/en/services/mobile-apps"], how: "/en/how-we-work", sprint: "/en/discovery-sprint" },
      es: { services: ["/es/servicios/sistemas-web", "/es/servicios/aplicaciones"], how: "/es/como-trabajamos", sprint: "/es/sprint-de-descubrimiento" },
    } as const;
    for (const locale of LOCALES) {
      const item = caseItem(locale, FIXTURE_CASE_SLUGS[0]);
      const out = await html(CaseArticle, { locale, slug: item.slug, entry: item.entry, testimonial: null, related: [] });
      const sheet = /<div class="case-hero__sheet"[\s\S]*?<\/dl>/.exec(out)?.[0] ?? "";
      const links = [...sheet.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((match) => [match[1], match[2]]);
      expect(links, locale).toEqual([
        [paths[locale].services[0], t(locale, "cases.hub.filters.web_systems")],
        [paths[locale].services[1], t(locale, "cases.hub.filters.mobile_apps")],
        [`${paths[locale].how}#${anchorId(ANCHORS.stage.diagnosis, locale)}`, t(locale, "shared.method_timeline.stages.diagnosis.name")],
        [paths[locale].sprint, t(locale, "shared.method_timeline.stages.discovery.name")],
        [`${paths[locale].how}#${anchorId(ANCHORS.stage.development, locale)}`, t(locale, "shared.method_timeline.stages.development.name")],
      ]);
      // O separador " · " entre os links é decorativo.
      expect(sheet).toMatch(/<span class="field-list__sep" aria-hidden="true"[^>]*>\s*·\s*<\/span>/);
      // Setor e porte continuam texto puro.
      expect(sheet).toMatch(new RegExp(`<dd class="field-list__value"[^>]*>${FIXTURE_MARK} Logística</dd>`));
    }
  });

  it("slug da URL por idioma (SEO S01-3): card, endereço impresso, seletor e aviso de idioma usam o slugUrl; a chave continua no data-case", async () => {
    const withSlug = (locale: Locale, slugUrl?: string): CaseItem => {
      const data = { ...caseFrontmatter(locale), ...(slugUrl ? { slugUrl } : {}) };
      const item = entry("cases", `${locale}/${FIXTURE_CASE_SLUGS[0]}`, data);
      return { slug: FIXTURE_CASE_SLUGS[0], urlSlug: slugUrl ?? FIXTURE_CASE_SLUGS[0], entry: item };
    };
    const en = withSlug("en", "freight-system");
    const grid = await html(CaseGrid, { locale: "en", items: [en] });
    expect(grid).toContain('href="/en/cases/freight-system"');
    expect(grid).not.toContain(`/en/cases/${FIXTURE_CASE_SLUGS[0]}`);
    const article = await html(CaseArticle, { locale: "en", slug: en.slug, entry: en.entry, testimonial: null, related: [] });
    expect(article).toContain(`data-case="${FIXTURE_CASE_SLUGS[0]}"`);
    expect(/<div class="case-print-masthead"[\s\S]*?<\/div>/.exec(article)?.[0]).toContain("lemamon.dev/en/cases/freight-system");

    const paramsByLocale = { pt: { slug: FIXTURE_CASE_SLUGS[0] }, en: { slug: "freight-system" }, es: { slug: "sistema-de-fletes" } };
    const selector = await html(LanguageSelector, { locale: "en", route: "case", params: { slug: "freight-system" }, paramsByLocale, variant: "full" });
    expect(selector).toContain(`href="/cases/${FIXTURE_CASE_SLUGS[0]}"`);
    expect(selector).toContain('href="/en/cases/freight-system"');
    expect(selector).toContain('href="/es/casos/sistema-de-fletes"');
    const suggestion = await html(LanguageSuggestion, { locale: "en", route: "case", params: { slug: "freight-system" }, paramsByLocale });
    expect(suggestion).toContain(`href="/cases/${FIXTURE_CASE_SLUGS[0]}"`);
    expect(suggestion).toContain('href="/es/casos/sistema-de-fletes"');
    // Sem paramsByLocale (todas as outras páginas): os mesmos params em todo idioma.
    const plain = await html(LanguageSelector, { locale: "pt", route: "how_we_work", variant: "full" });
    expect(plain).toContain('href="/en/how-we-work"');
  });

  it("CaseArticle, ficha técnica (B212): cada tecnologia é um Badge mono; logo só com desenho no Icon.astro", async () => {
    const fm = caseFrontmatter("pt");
    const stack = ["TypeScript", "React", "Node.js", "PostgreSQL", "GitHub Actions"];
    const item = { slug: "x", entry: entry("cases", "pt/x", { ...fm, fichaTecnica: { ...fm.fichaTecnica, stack } }) };
    const out = await html(CaseArticle, { locale: "pt", slug: "x", entry: item.entry, testimonial: null, related: [] });
    const sheet = /<section[^>]*id="ficha-tecnica"[\s\S]*?<\/section>/.exec(out)?.[0] ?? "";
    const badges = [...sheet.matchAll(/<span class="badge"[^>]*data-variant="mono"[^>]*>([\s\S]*?)<\/span>/g)].map((match) => match[1]!);
    expect(badges).toHaveLength(stack.length);
    stack.forEach((tech, i) => expect(badges[i]).toContain(tech));
    // O pílula própria antiga saiu: o estilo é o do primitivo.
    expect(out).not.toContain("case-stack__item");
    // Com logo no Icon.astro: svg.badge__icon decorativo; sem logo, só o rótulo.
    const withIcon = badges.filter((badge) => /<svg[^>]*class="badge__icon[^"]*"[^>]*aria-hidden="true"/.test(badge));
    expect(withIcon).toHaveLength(stack.filter((tech) => techIcon(tech)).length);
    // As 5 tecnologias desta stack têm logo no Icon.astro: 5 svg.badge__icon.
    expect(withIcon).toHaveLength(stack.length);
    expect(badges.at(-1)).toMatch(/<svg[^>]*class="badge__icon/);
  });

  it("techIcon: compara sem caixa, acento, espaço, ponto e hífen; desconhecida → sem logo", () => {
    expect(techKey("Node.js")).toBe("nodejs");
    expect(techKey(" GitHub-Actions ")).toBe("githubactions");
    expect(techKey("C#")).toBe("c#");
    expect(techKey("C++")).toBe("c++");
    expect(techIcon("GitHub Actions")).toBe("github");
    expect(techIcon("github")).toBe("github");
    // Os logos do Icon.astro (home) ligados ao nome que o case escreve na stack.
    expect(techIcon("TypeScript")).toBe("typescript");
    expect(techIcon("JavaScript")).toBe("javascript");
    expect(techIcon("React")).toBe("react");
    expect(techIcon("React Native")).toBe("react");
    expect(techIcon("Node.js")).toBe("nodejs");
    expect(techIcon("NodeJS")).toBe("nodejs");
    expect(techIcon("Node")).toBe("nodejs");
    expect(techIcon("PostgreSQL")).toBe("postgresql");
    expect(techIcon("Postgres")).toBe("postgresql");
    expect(techIcon("SQLite")).toBe("sqlite");
    expect(techIcon("Next.js")).toBe("nextjs");
    expect(techIcon("Astro")).toBe("astro");
    expect(techIcon("Docker")).toBe("docker");
    expect(techIcon("Tecnologia Inexistente")).toBeUndefined();
    expect(techIcon("constructor")).toBeUndefined();
    expect(techIcon("__proto__")).toBeUndefined();
  });

  it("CaseArticle sem resultado nem prazo/preço: as seções somem (sem título órfão)", async () => {
    const fm = caseFrontmatter("pt");
    const data = {
      ...fm,
      resultado: undefined,
      combinado: { escopo: fm.combinado.escopo },
      depoimento: undefined,
      autorizacao: { ...fm.autorizacao, escopo: { nomeDoCliente: true, resultados: false, prazoEPreco: false } },
    };
    const item = { slug: "x", entry: entry("cases", "pt/x", data) };
    const out = await html(CaseArticle, { locale: "pt", slug: "x", entry: item.entry, testimonial: null, related: [] });
    expect(out).not.toContain(t("pt", "cases.case.result_title"));
    expect(out).not.toContain(t("pt", "cases.case.agreed_labels.timeline_and_price"));
    expect(out).not.toContain(t("pt", "cases.case.related_title"));
  });

  it("PostArticle: H1, autor real com link, datas em <time>, relacionados e link para o serviço", async () => {
    const out = await html(PostArticle, { entry: post(1), related: [post(2), post(3)] }, { slots: { default: "<p>corpo</p>" } });
    expect(out.match(/<h1/g)).toHaveLength(1);
    expect(out).toContain(`Rafael ${FIXTURE_MARK} Lima`);
    expect(out).toContain('datetime="2026-01-10"');
    expect(out).toContain('datetime="2026-01-20"');
    expect(out).toContain('href="/servicos/sistemas-web"');
    expect(out).toContain(t("pt", "blog.post.related_title"));
    expect(out).toContain('href="/blog/fixture-lemamon-post-2"');
    // No post, o item atual do breadcrumb é o título (o H1 logo abaixo): some no celular.
    expect(out).toMatch(/<nav class="breadcrumb" data-hide-current/);
  });

  it("<CtaMeio />: texto do post (Astro.locals) e botão do diagnóstico com origem", async () => {
    const custom = await html(PostMidCta, {}, { locals: { [POST_MID_CTA_LOCAL]: { text: `${FIXTURE_MARK} texto do meio`, origem: "blog-meio" } } });
    expect(custom).toContain(`${FIXTURE_MARK} texto do meio`);
    expect(custom).toContain("origem=blog-meio");
    const fallback = await html(PostMidCta, {});
    expect(fallback).toContain(t("pt", "blog.post.mid_cta.text"));
  });
});
