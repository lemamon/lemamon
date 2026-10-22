/**
 * Schemas Zod das coleções when_data (src/content/schemas.ts): dado completo
 * passa; dado parcial, anônimo, sem autorização por escrito, com valor em
 * dinheiro ou com marca de rascunho QUEBRA (o build falha, nada vai ao ar pela metade).
 */
import { describe, expect, it } from "vitest";

import { hasMidCta, MONEY_PATTERN } from "@/content/schemas";

import {
  caseFrontmatter,
  image,
  logoFrontmatter,
  POST_BODY,
  postFrontmatter,
  schemas,
  teamFrontmatter,
  testimonialFrontmatter,
} from "../fixtures/content-entries";

type Mutator<T> = (draft: T) => void;

function variant<T>(base: () => T, mutate: Mutator<T>): T {
  const draft = structuredClone(base());
  mutate(draft);
  return draft;
}

const issuesOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  result.success ? [] : (result.error?.issues ?? []).map((issue) => `${issue.path.join(".")}: ${issue.message}`);

describe("schema de case (cases/<idioma>/<slug>.mdx)", () => {
  it("case completo valida nos 3 idiomas", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      expect(issuesOf(schemas.cases.safeParse(caseFrontmatter(locale)))).toEqual([]);
    }
  });

  it("publicado é false por padrão (ninguém publica por esquecimento)", () => {
    const { publicado: _ignored, ...rest } = caseFrontmatter();
    expect(schemas.cases.parse(rest).publicado).toBe(false);
  });

  const invalid: [string, Mutator<ReturnType<typeof caseFrontmatter>>, RegExp][] = [
    ["sem autorização", (d) => void Reflect.deleteProperty(d, "autorizacao"), /autorizacao/],
    ["autorização que não é por escrito", (d) => void ((d.autorizacao as { porEscrito: unknown }).porEscrito = false), /porEscrito/],
    ["autorização datada no futuro", (d) => void (d.autorizacao.data = "2999-01-01"), /futuro/],
    ["autorização sem registro", (d) => void (d.autorizacao.registro = " "), /registro/],
    ["nome do cliente sem autorização do nome", (d) => void (d.autorizacao.escopo.nomeDoCliente = false), /cliente/],
    ["resultado sem autorização de resultado", (d) => void (d.autorizacao.escopo.resultados = false), /resultado/],
    ["prazo e preço sem autorização", (d) => void (d.autorizacao.escopo.prazoEPreco = false), /prazoEPreco/],
    ["sem cliente e sem porte", (d) => void (Reflect.deleteProperty(d, "cliente"), Reflect.deleteProperty(d, "porte")), /porte/],
    ["problema vazio", (d) => void (d.problema = ""), /problema/],
    ["serviço repetido", (d) => void (d.servicos = ["mvp", "mvp"]), /servicos/],
    ["serviço inexistente", (d) => void (d.servicos = ["site"]), /servicos/],
    ["etapas fora de ordem", (d) => void d.comoFoi.reverse(), /comoFoi/],
    ["linha do tempo vazia", (d) => void (d.comoFoi = []), /comoFoi/],
    ["métrica sem fonte", (d) => void Reflect.deleteProperty(d.resultado[0]!, "fonte"), /fonte/],
    ["mais de 3 métricas", (d) => void (d.resultado = [...d.resultado, ...d.resultado, ...d.resultado, ...d.resultado]), /resultado/],
    ["valor em dinheiro no texto", (d) => void (d.combinado.prazoEPreco = "Preço fechado em R$ 80 mil"), /monetário/],
    ["placeholder no texto", (d) => void (d.entregue = "Um sistema para {cliente}"), /rascunho/],
    ["[CONFIRMAR] no texto", (d) => void (d.titulo = "[CONFIRMAR] título"), /rascunho/],
    ["link do produto sem https", (d) => void (d.fichaTecnica.link = "http://example.com"), /link/],
    ["capa sem alt", (d) => void (d.capa.alt = ""), /capa/],
    ["campo desconhecido (typo)", (d) => void ((d as Record<string, unknown>).titlo = "x"), /titlo|Unrecognized|desconhecid/i],
    ["seoTitle acima de 50", (d) => void ((d as Record<string, unknown>).seoTitle = "x".repeat(51)), /seoTitle/],
  ];

  it.each(invalid)("quebra: %s", (_label, mutate, expected) => {
    const issues = issuesOf(schemas.cases.safeParse(variant(() => caseFrontmatter(), mutate)));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.join("\n")).toMatch(expected);
  });

  /** Case anonimizado: sem cliente, sem link do produto e sem depoimento nominal (B378). */
  const anonimizado = () =>
    variant(caseFrontmatter, (d) => {
      Reflect.deleteProperty(d, "cliente");
      Reflect.deleteProperty(d.fichaTecnica, "link");
      Reflect.deleteProperty(d, "depoimento");
      d.autorizacao.escopo.nomeDoCliente = false;
    });

  it("anonimizado por setor + porte é válido sem autorização do nome", () => {
    expect(issuesOf(schemas.cases.safeParse(anonimizado()))).toEqual([]);
  });

  it("anonimizado + link do produto no ar quebra (o link identificaria o cliente)", () => {
    const comLink = variant(anonimizado, (d) => void (d.fichaTecnica.link = "https://fixture-lemamon.test/painel"));
    expect(issuesOf(schemas.cases.safeParse(comLink)).join("\n")).toMatch(/fichaTecnica\.link: case anonimizado/);
  });

  it("anonimizado + depoimento nominal quebra (o depoimento mostra a empresa e a pessoa)", () => {
    const comDepoimento = variant(anonimizado, (d) => void ((d as Record<string, unknown>).depoimento = { collection: "depoimentos", id: "fixture-lemamon-depoimento" }));
    expect(issuesOf(schemas.cases.safeParse(comDepoimento)).join("\n")).toMatch(/depoimento: case anonimizado/);
  });

  /** Case anonimizado publicado sem termo, por decisão registrada do dono (D45). */
  const semTermo = () =>
    variant(anonimizado, (d) => {
      Reflect.deleteProperty(d, "autorizacao");
      Reflect.deleteProperty(d, "resultado");
      Reflect.deleteProperty(d.combinado, "prazoEPreco");
      (d as Record<string, unknown>).semTermo = { decididoPor: "dono", data: "2026-10-21", registro: "D45 em docs/playbooks/15-registro-de-decisoes.md" };
    });

  it("anonimizado com semTermo (decisão do dono) é válido sem autorização", () => {
    expect(issuesOf(schemas.cases.safeParse(semTermo()))).toEqual([]);
  });

  it.each([
    ["com o nome do cliente", (d: Record<string, unknown>) => void (d.cliente = "Fixture Lemamon Cliente"), /cliente: nome do cliente exige/],
    ["com resultado", (d: Record<string, unknown>) => void (d.resultado = structuredClone(caseFrontmatter().resultado)), /resultado: resultado exige/],
    ["com prazo e preço", (d: Record<string, unknown>) => void ((d.combinado as Record<string, unknown>).prazoEPreco = "No prazo"), /prazoEPreco/],
    ["junto com autorizacao", (d: Record<string, unknown>) => void (d.autorizacao = structuredClone(caseFrontmatter().autorizacao)), /semTermo: use/],
    ["decidido por outra pessoa", (d: Record<string, unknown>) => void ((d.semTermo as Record<string, unknown>).decididoPor = "cliente"), /decididoPor/],
    ["sem registro da decisão", (d: Record<string, unknown>) => void ((d.semTermo as Record<string, unknown>).registro = " "), /registro/],
  ])("semTermo quebra %s", (_label, mutate, expected) => {
    const data = variant(semTermo, (d) => mutate(d as Record<string, unknown>));
    expect(issuesOf(schemas.cases.safeParse(data)).join("\n")).toMatch(expected);
  });

  it("resultado é opcional (o case faz sentido sem ele)", () => {
    const without = variant(caseFrontmatter, (d) => {
      Reflect.deleteProperty(d, "resultado");
      d.autorizacao.escopo.resultados = false;
    });
    expect(issuesOf(schemas.cases.safeParse(without))).toEqual([]);
  });
});

describe("schema de depoimento — nunca anônimo", () => {
  it("depoimento nominal completo valida", () => {
    expect(issuesOf(schemas.depoimentos.safeParse(testimonialFrontmatter()))).toEqual([]);
  });

  it.each([
    ["só o primeiro nome", "Marina"],
    ["sobrenome abreviado", "Marina S."],
    ["anônimo", "Cliente Anônimo"],
    ["cargo no lugar do nome", "CEO da empresa"],
    ["rótulo genérico", "Diretora Comercial"],
    ["vazio", ""],
  ])("quebra: %s (%s)", (_label, nome) => {
    const data = variant(testimonialFrontmatter, (d) => void (d.nome = nome));
    expect(issuesOf(schemas.depoimentos.safeParse(data)).join("\n")).toMatch(/nome/);
  });

  it("citação faltando num idioma quebra", () => {
    const data = variant(testimonialFrontmatter, (d) => void (d.citacao.es = ""));
    expect(issuesOf(schemas.depoimentos.safeParse(data)).join("\n")).toMatch(/citacao\.es/);
  });

  it("sem empresa quebra", () => {
    const data = variant(testimonialFrontmatter, (d) => void Reflect.deleteProperty(d, "empresa"));
    expect(issuesOf(schemas.depoimentos.safeParse(data)).join("\n")).toMatch(/empresa/);
  });

  it("foto sem autorização da foto quebra; com autorização valida", () => {
    const photo = { src: { src: "/x.png", width: 10, height: 10, format: "png" }, alt: { pt: "Foto", en: "Photo", es: "Foto" } };
    const without = variant(testimonialFrontmatter, (d) => void ((d as Record<string, unknown>).foto = photo));
    expect(issuesOf(schemas.depoimentos.safeParse(without)).join("\n")).toMatch(/foto/);
    const withAuth = variant(() => without, (d) => void (d.autorizacao.foto = true));
    expect(issuesOf(schemas.depoimentos.safeParse(withAuth))).toEqual([]);
  });

  it("sem autorização por escrito quebra", () => {
    const data = variant(testimonialFrontmatter, (d) => void Reflect.deleteProperty(d, "autorizacao"));
    expect(issuesOf(schemas.depoimentos.safeParse(data)).join("\n")).toMatch(/autorizacao/);
  });

  describe("depoimento em vídeo (B287): autorizado, legendado, curto", () => {
    type ComVideo = ReturnType<typeof testimonialFrontmatter> & {
      video: { src: string; poster: ReturnType<typeof image>; legendas: Record<string, string>; duracaoSegundos: number };
      autorizacao: { video?: boolean };
    };
    const comVideo = (): ComVideo => {
      const base = testimonialFrontmatter() as ComVideo;
      base.video = { src: "videos/marina-souza.mp4", poster: image("poster"), legendas: { pt: "videos/marina-souza.pt.vtt" }, duracaoSegundos: 60 };
      base.autorizacao.video = true;
      return base;
    };

    it("vídeo com autorização de imagem e voz, legenda pt e até 90 s valida", () => {
      expect(issuesOf(schemas.depoimentos.safeParse(comVideo()))).toEqual([]);
      const webm = variant(comVideo, (d) => void (d.video.src = "videos/marina-souza.webm"));
      expect(issuesOf(schemas.depoimentos.safeParse(webm))).toEqual([]);
    });

    it.each([
      ["vídeo sem autorizacao.video", (d: ComVideo) => void Reflect.deleteProperty(d.autorizacao, "video"), /video: vídeo exige autorizacao\.video/],
      ["autorizacao.video false", (d: ComVideo) => void (d.autorizacao.video = false), /video: vídeo exige autorizacao\.video/],
      ["vídeo sem legenda em português", (d: ComVideo) => void (d.video.legendas = { en: "videos/marina-souza.en.vtt" }), /video\.legendas\.pt/],
      ["legenda que não é WebVTT", (d: ComVideo) => void (d.video.legendas.pt = "videos/marina-souza.srt"), /video\.legendas\.pt: formato: vtt/],
      ["vídeo acima de 90 s", (d: ComVideo) => void (d.video.duracaoSegundos = 120), /video\.duracaoSegundos: no máximo 90/],
      ["formato que não é mp4/webm", (d: ComVideo) => void (d.video.src = "videos/marina-souza.mov"), /video\.src: formato: mp4 ou webm/],
      ["vídeo de player de terceiros (URL)", (d: ComVideo) => void (d.video.src = "https://www.youtube.com/watch.mp4"), /video\.src: caminho relativo/],
      ["caminho com ..", (d: ComVideo) => void (d.video.src = "../segredo.mp4"), /video\.src: caminho relativo/],
      ["sem pôster (o carregamento inicial baixa só ele)", (d: ComVideo) => void Reflect.deleteProperty(d.video, "poster"), /video\.poster/],
    ])("quebra: %s", (_label, mutate, expected) => {
      expect(issuesOf(schemas.depoimentos.safeParse(variant(comVideo, mutate))).join("\n")).toMatch(expected);
    });
  });
});

describe("schema de logo", () => {
  it("logo autorizado valida", () => {
    expect(issuesOf(schemas.logos.safeParse(logoFrontmatter()))).toEqual([]);
  });

  it.each([
    ["sem autorização", (d: ReturnType<typeof logoFrontmatter>) => void Reflect.deleteProperty(d, "autorizacao"), /autorizacao/],
    ["sem empresa (alt)", (d: ReturnType<typeof logoFrontmatter>) => void (d.empresa = ""), /empresa/],
    ["sem arquivo", (d: ReturnType<typeof logoFrontmatter>) => void Reflect.deleteProperty(d, "arquivo"), /arquivo/],
    ["caseSlug fora do padrão", (d: ReturnType<typeof logoFrontmatter>) => void ((d as Record<string, unknown>).caseSlug = "Meu Case"), /caseSlug/],
  ])("quebra: %s", (_label, mutate, expected) => {
    expect(issuesOf(schemas.logos.safeParse(variant(() => logoFrontmatter(), mutate))).join("\n")).toMatch(expected);
  });
});

describe("schema de pessoa do time", () => {
  it("pessoa completa valida", () => {
    expect(issuesOf(schemas.time.safeParse(teamFrontmatter()))).toEqual([]);
  });

  it.each([
    ["sem foto (card sem foto não conta)", (d: ReturnType<typeof teamFrontmatter>) => void Reflect.deleteProperty(d, "foto"), /foto/],
    ["sem papel", (d: ReturnType<typeof teamFrontmatter>) => void Reflect.deleteProperty(d, "papel"), /papel/],
    ["papel faltando num idioma", (d: ReturnType<typeof teamFrontmatter>) => void (d.papel.en = ""), /papel\.en/],
    ["nome sem sobrenome", (d: ReturnType<typeof teamFrontmatter>) => void (d.nome = "Rafael"), /nome/],
    ["LinkedIn que não é do LinkedIn", (d: ReturnType<typeof teamFrontmatter>) => void (d.linkedin = "https://example.com/rafael"), /linkedin/],
    ["GitHub sem https", (d: ReturnType<typeof teamFrontmatter>) => void (d.github = "http://github.com/x"), /github/],
    ["sem atuaEmProjetos (o dono tem de marcar)", (d: ReturnType<typeof teamFrontmatter>) => void Reflect.deleteProperty(d, "atuaEmProjetos"), /atuaEmProjetos/],
  ])("quebra: %s", (_label, mutate, expected) => {
    expect(issuesOf(schemas.time.safeParse(variant(() => teamFrontmatter(), mutate))).join("\n")).toMatch(expected);
  });
});

describe("schema de post (só pt-BR)", () => {
  it("post completo valida", () => {
    expect(issuesOf(schemas.posts.safeParse(postFrontmatter()))).toEqual([]);
  });

  it.each([
    ["autor sem foto", (d: ReturnType<typeof postFrontmatter>) => void Reflect.deleteProperty(d.autor, "foto"), /autor\.foto/],
    ["autor sem papel técnico", (d: ReturnType<typeof postFrontmatter>) => void (d.autor.papelTecnico = ""), /papelTecnico/],
    ["autor anônimo", (d: ReturnType<typeof postFrontmatter>) => void (d.autor.nome = "Equipe"), /autor\.nome/],
    ["link do autor sem https", (d: ReturnType<typeof postFrontmatter>) => void (d.autor.link = "http://x.com"), /autor\.link/],
    ["atualização antes da publicação", (d: ReturnType<typeof postFrontmatter>) => void (d.atualizadoEm = "2020-01-01"), /atualizadoEm/],
    ["data inválida", (d: ReturnType<typeof postFrontmatter>) => void (d.publicadoEm = "ontem"), /publicadoEm/],
    ["valor em dinheiro no resumo", (d: ReturnType<typeof postFrontmatter>) => void (d.resumo = "Um sistema custa R$ 50 mil"), /monetário/],
    // B260: sem capa, o post sairia com o cartão genérico (og:image e Article sem imagem própria).
    ["sem capa (og:image própria é obrigatória)", (d: ReturnType<typeof postFrontmatter>) => void Reflect.deleteProperty(d, "capa"), /capa/],
    ["capa sem alt", (d: ReturnType<typeof postFrontmatter>) => void (d.capa.alt = ""), /capa\.alt/],
  ])("quebra: %s", (_label, mutate, expected) => {
    expect(issuesOf(schemas.posts.safeParse(variant(() => postFrontmatter(), mutate))).join("\n")).toMatch(expected);
  });

  it("rascunho é false por padrão; o corpo exige <CtaMeio />", () => {
    expect(schemas.posts.parse(postFrontmatter()).rascunho).toBe(false);
    expect(hasMidCta(POST_BODY)).toBe(true);
    expect(hasMidCta("Texto sem CTA no meio.")).toBe(false);
    expect(hasMidCta(undefined)).toBe(false);
  });
});

describe("marca de rascunho", () => {
  it("TODO em maiúsculas quebra; a palavra portuguesa \"todo\" não", () => {
    const ok = variant(caseFrontmatter, (d) => void (d.entregue = "Revisão de código em todo pull request"));
    expect(issuesOf(schemas.cases.safeParse(ok))).toEqual([]);
    const draft = variant(caseFrontmatter, (d) => void (d.entregue = "TODO escrever"));
    expect(issuesOf(schemas.cases.safeParse(draft)).join()).toMatch(/rascunho/);
  });
});

describe("padrão de valor monetário", () => {
  it.each(["R$ 30 mil", "R$30.000", "US$ 5", "€ 20", "30 mil reais", "50k USD".replace("k", " mil")])("detecta %s", (value) => {
    expect(MONEY_PATTERN.test(value)).toBe(true);
  });
  it.each(["45 minutos", "a cada 2 semanas", "6 perguntas", "de 4 dias para 2 horas"])("não confunde %s", (value) => {
    expect(MONEY_PATTERN.test(value)).toBe(false);
  });
});
