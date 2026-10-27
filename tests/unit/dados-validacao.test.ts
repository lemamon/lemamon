/**
 * dados/dono.json (dono: gated): o arquivo do dono é válido, traz as decisões
 * já tomadas e nada mais; a camada fictícia mesclada também é válida e liga
 * todas as seções; erros de validação dizem, em pt-BR, QUAL campo corrigir; o
 * dados/dono.schema.json (autocompletar do editor) aceita os dois arquivos e
 * acompanha as seções do Zod; dado fictício nunca satisfaz a trava da Política;
 * erro de SINTAXE no JSON sai em pt-BR com linha e coluna; e texto de exemplo
 * ou valor COPIADO da camada fictícia no dado real (dono.json ou MDX) derruba o build.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { CNPJ_FICTICIO, mesclarSecaoFicticia, pareceFicticio } from "@/config/camada-ficticia";
import { SECOES_DONO } from "@/config/dono";
import { isValidCnpj } from "@/config/empresa";
import { computeFeatures, type ContentSnapshot } from "@/config/features";
import { privacyLaunchBlockers, type Privacidade } from "@/config/privacidade";
import { donoIssues } from "@/config/validate";
import type { Empresa } from "@/config/empresa";
import type { FeatureSources } from "@/config/features";
import { localizarErroDeJson, lerJsonDoDono, mensagemDeJsonInvalido } from "@/config/json-do-dono";
import { exemplosNoMdxReal, listaDoDono, temMdx } from "@/content/loaders";
import { caseSchema, postSchema, textoDeExemplo } from "@/content/schemas";
import { copiasDaCamadaFicticia, marcadoresFicticios, trechosDoCorpo, valorDistintivo, valoresDoFrontmatter } from "@/integrations/dados-ficticios";

import { caseFrontmatter, fakeImage, fakeReference, postFrontmatter } from "../fixtures/content-entries";

const ROOT = process.cwd();
type Doc = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const lerJson = (arquivo: string): Doc => JSON.parse(readFileSync(join(ROOT, arquivo), "utf8")) as Doc;
const real = lerJson("dados/dono.json");
const ficticio = lerJson("dados/dono.ficticio.json");
const schema = lerJson("dados/dono.schema.json");
const mesclado = (): Doc => Object.fromEntries(SECOES_DONO.map((secao) => [secao, mesclarSecaoFicticia(secao, real[secao], ficticio[secao])]));
const copia = (): Doc => structuredClone(real);

describe("dados/dono.json — o arquivo do dono", () => {
  it("é válido (nenhum problema de estrutura, formato ou dado fictício)", () => {
    expect(donoIssues(real)).toEqual([]);
  });

  it("decisões 5, 9, 10, D31 e D44: escopo, código do cliente (answer_draft), NDA, outras cidades e exterior, FAQ da duração da Descoberta (sem número); o resto desligado", () => {
    const ligadas = Object.entries(real.confirmacoes).filter(([, value]) => value !== false && value !== null);
    expect(Object.fromEntries(ligadas)).toEqual({
      escopoMudanca: true,
      codigoProprietario: "answer_draft",
      outrasCidades: true,
      atendeExterior: true,
      nda: true,
      duracaoDescoberta: true,
    });
  });

  it("D44 (revoga a D42): a duração da Descoberta não é publicada; formato, participantes, ritmo, duração e exclusões vazios", () => {
    expect(real.descoberta).toEqual({
      formato: null,
      participantes: null,
      ritmo: null,
      duracao: null,
      naoInclui: null,
    });
    const features = computeFeatures({
      ...(real as unknown as Omit<FeatureSources, "content" | "env">),
      content: { cases: [], logos: [], depoimentos: [], time: [], posts: [] },
      env: { whatsappNumber: "", ga4Id: "" },
    });
    expect("hasDiscoveryDuration" in features).toBe(false);
    expect(features.hasDiscoveryFormat).toBe(false);
    expect(features.confirm.duracaoDescoberta).toBe(true);
    expect(features.confirm.atendeExterior).toBe(true);
    // A Descoberta é gratuita: abatimento e "único custo" saíram do arquivo e do schema.
    expect(Object.keys(real.confirmacoes)).not.toContain("descobertaAbatida");
    expect(Object.keys(real.confirmacoes)).not.toContain("descobertaUnicoCusto");
  });

  it("decisão 6: GitHub, LinkedIn e Medium publicados", () => {
    expect(real.perfis).toEqual({
      github: { url: "https://github.com/lemamon-dev", publicar: true },
      linkedin: { url: "https://www.linkedin.com/in/lemamon-dev", publicar: true },
      medium: { url: "https://medium.com/@lemamon.dev", publicar: true },
    });
  });

  it("decisão 7: faixas da P5 em BRL nos 3 idiomas, corte de MQL a partir de 30 mil (tier_2)", () => {
    expect(real.qualificacao.moeda).toBe("BRL");
    expect(real.qualificacao.corteMql).toBe("tier_2");
    expect(real.qualificacao.faixasMensais).toEqual([]);
    expect(real.qualificacao.scoreD).toEqual({ ativo: false });
    expect(real.qualificacao.faixas.map((tier: Doc) => tier.id)).toEqual(["tier_1", "tier_2", "tier_3", "tier_4"]);
    expect(real.qualificacao.faixas.map((tier: Doc) => tier.rotulo.pt)).toEqual([
      "Até R$ 30 mil",
      "R$ 30–80 mil",
      "R$ 80–200 mil",
      "Acima de R$ 200 mil",
    ]);
    for (const tier of real.qualificacao.faixas) {
      expect(tier.rotulo.en, tier.id).toMatch(/BRL/);
      expect(tier.rotulo.es, tier.id).toMatch(/BRL/);
    }
  });

  it("decisões 3 e 8: nenhum preço, pessoa, depoimento ou logo; razão social e CNPJ o dono já mandou (o resto fica vazio)", () => {
    const linhas = [real.precos.sustentacao, ...Object.values(real.precos.desenvolvimento)];
    expect(linhas.every((linha) => linha === null)).toBe(true);
    // D44: a Sprint de Descoberta é gratuita e não tem linha de preço.
    expect(Object.keys(real.precos)).not.toContain("descoberta");
    expect(real.empresa).toMatchObject({ razaoSocial: "Lemamon.dev LTDA", cnpj: "69.700.690/0001-98", responsavel: "", anoFundacao: null });
    expect(isValidCnpj(real.empresa.cnpj)).toBe(true);
    expect([real.time, real.depoimentos, real.logos]).toEqual([[], [], []]);
    expect(real.agenda.url).toBe("");
    // D05/encarregado: o dono decidiu base de medição por consentimento e
    // encarregado de pequeno porte (23/10/2026); o resto da privacidade segue
    // vazio e trava a produção (prazos, data, mecanismo e as duas confirmações).
    expect(real.privacidade.baseAnuncios).toBe("consentimento");
    expect(real.privacidade.encarregado).toBe("pequeno_porte");
    expect(real.privacidade.atualizadaEm).toBe("");
  });
});

describe("dados/dono.ficticio.json — camada fictícia", () => {
  it("mesma estrutura: só seções do dono.json", () => {
    expect(Object.keys(ficticio).filter((key) => key !== "$schema").sort()).toEqual([...SECOES_DONO].sort());
  });

  it("mesclada por cima do dono.json é válida (com o CNPJ fictício aceito só aqui)", () => {
    expect(donoIssues(mesclado(), { permitirFicticio: true, origem: "mesclado" })).toEqual([]);
  });

  it("liga TODAS as seções when_data (o site cheio para revisar)", () => {
    const doc = mesclado();
    const content: ContentSnapshot = {
      cases: ["pt", "en", "es"].flatMap((locale) =>
        ["exemplo-sistema-de-fretes", "exemplo-app-de-vistorias"].map((slug) => ({ id: `${locale}/${slug}`, publicado: true, servicos: ["mobile_apps"] as const })),
      ),
      logos: doc.logos.map((logo: Doc) => ({ id: logo.id, empresa: logo.empresa })),
      depoimentos: doc.depoimentos.map((item: Doc) => ({ id: item.id, sobreProcesso: item.sobreProcesso })),
      time: doc.time.map((pessoa: Doc) => ({ id: pessoa.id, atuaEmProjetos: pessoa.atuaEmProjetos })),
      posts: ["a", "b", "c"].map((id) => ({ id, rascunho: false })),
    };
    const features = computeFeatures({
      ...(doc as unknown as Omit<FeatureSources, "content" | "env">),
      content,
      env: { whatsappNumber: "", ga4Id: "" },
      modoFicticio: true,
    });
    const off = Object.entries(features).filter(([key, value]) => key.startsWith("has") && value === false);
    // hasCaseFilters exige 6 cases; WhatsApp e GA4 são variáveis de ambiente, não dados do dono.
    expect(off.map(([key]) => key).sort()).toEqual(["hasCaseFilters", "hasGa4", "hasWhatsapp"]);
    // Sem a camada, o par fictício (razão social + CNPJ de exemplo) não conta.
    const comParFicticio = { ...doc, empresa: { ...doc.empresa, razaoSocial: ficticio.empresa.razaoSocial, cnpj: ficticio.empresa.cnpj } };
    expect(
      computeFeatures({ ...(comParFicticio as unknown as Omit<FeatureSources, "content" | "env">), content, env: { whatsappNumber: "", ga4Id: "" } }).hasCompanyData,
    ).toBe(false);
  });

  it("tudo fictício é reconhecível: 'Exemplo' nos nomes, example.com, CNPJ inválido de propósito", () => {
    expect(ficticio.empresa.razaoSocial).toBe("Empresa Exemplo Ltda");
    expect(ficticio.empresa.cnpj).toBe(CNPJ_FICTICIO);
    expect(isValidCnpj(ficticio.empresa.cnpj)).toBe(false);
    expect(ficticio.agenda.url).toBe("https://example.com/agenda");
    for (const pessoa of [...ficticio.time, ...ficticio.depoimentos]) {
      expect(pessoa.nome, pessoa.id).toMatch(/Exemplo/);
      expect(pessoa.id, pessoa.id).toMatch(/^exemplo-/);
    }
    for (const logo of ficticio.logos) expect(`${logo.id} ${logo.empresa}`).toMatch(/^exemplo-.* .*Exemplo/);
    for (const pessoa of ficticio.time) {
      expect(pessoa.foto).toMatch(/^ficticio\/imagens\/.+\.svg$/);
      if (pessoa.linkedin) expect(pareceFicticio(pessoa.linkedin), pessoa.linkedin).toBe(true);
    }
    for (const email of [ficticio.empresa.email, ficticio.privacidade.encarregado.email]) expect(email).toMatch(/@example\.com$/);
  });

  it("conteúdo MDX fictício fica separado (dados/ficticio/) e só entra com a camada", () => {
    // Desde a D45 há cases REAIS em src/content/cases: nenhum é um arquivo da camada (mesmo idioma e nome).
    const mdx = (dir: string) => ["pt", "en", "es"].flatMap((l) => (existsSync(join(dir, l)) ? readdirSync(join(dir, l)).map((f) => `${l}/${f}`) : []));
    const daCamada = new Set(mdx(join(ROOT, "dados", "ficticio", "cases")));
    expect(mdx(join(ROOT, "src", "content", "cases")).filter((nome) => daCamada.has(nome))).toEqual([]);
    expect(temMdx("posts", ROOT, false)).toBe(false);
    expect(temMdx("cases", ROOT, true)).toBe(true);
    expect(temMdx("posts", ROOT, true)).toBe(true);
    expect(listaDoDono("time", ROOT, false)).toMatchObject({ itens: [], arquivo: "dados/dono.json", ficticia: false });
    const time = listaDoDono("time", ROOT, true);
    expect(time.arquivo).toBe("dados/dono.ficticio.json");
    expect(time.itens.length).toBeGreaterThanOrEqual(1);
    expect(listaDoDono("logos", ROOT, true).itens.length).toBeGreaterThanOrEqual(4);
  });
});

describe("mensagens de validação em pt-BR, com o campo a corrigir", () => {
  const erros = (mutar: (doc: Doc) => void) => {
    const doc = copia();
    mutar(doc);
    return donoIssues(doc).join("\n");
  };

  it.each<[string, (doc: Doc) => void, RegExp]>([
    ["CNPJ com dígito errado", (d) => void (d.empresa.cnpj = "11.111.111/1111-11"), /dados\/dono\.json › empresa\.cnpj: CNPJ inválido/],
    ["CNPJ fictício no arquivo real", (d) => void (d.empresa.cnpj = CNPJ_FICTICIO), /empresa\.cnpj: 00\.000\.000\/0000-00 é o CNPJ da camada fictícia/],
    ["campo com nome errado", (d) => void (d.empresa.razao_social = "X"), /empresa: campo desconhecido "razao_social"/],
    ["seção desconhecida", (d) => void (d.cases = []), /dados\/dono\.json › cases: seção desconhecida/],
    ["seção apagada", (d) => void delete d.agenda, /agenda: seção obrigatória faltando/],
    ["tipo errado", (d) => void (d.perfis.github.publicar = "sim"), /perfis\.github\.publicar: tipo errado: esperava true ou false, veio texto "sim"/],
    ["texto num campo de idioma", (d) => void (d.descoberta.formato = "só em português"), /descoberta\.formato: tipo errado: esperava objeto/],
    ["idioma faltando", (d) => void (d.descoberta.formato = { pt: "a", en: "b" }), /descoberta\.formato\.es: campo obrigatório faltando/],
    ["dinheiro fora de preço", (d) => void (d.sustentacao.inclui = { pt: "R$ 5 mil", en: "x", es: "x" }), /sustentacao\.inclui\.pt: valor monetário só em dados\/dono\.json › precos/],
    ["agenda sem https", (d) => void (d.agenda.url = "http://agenda.exemplo"), /agenda\.url: deixe "" ou use uma URL https/],
    ["5 faixas", (d) => void d.qualificacao.faixas.push(d.qualificacao.faixas[0]), /qualificacao\.faixas: exatamente 4 faixas/],
    ["score D sem confirmação", (d) => void (d.qualificacao.scoreD.ativo = true), /qualificacao\.scoreD\.ativo: exige confirmacoes\.scoreDRecebeDiagnostico/],
    ["exterior sem outras cidades (D31)", (d) => void (d.confirmacoes.outrasCidades = false), /confirmacoes\.atendeExterior: exige confirmacoes\.outrasCidades = true/],
    ["atendeExterior que não é sim/não", (d) => void (d.confirmacoes.atendeExterior = "sim"), /confirmacoes\.atendeExterior: tipo errado: esperava true ou false/],
    ["unidade errada", (d) => void (d.precos.sustentacao = { faixa: { pt: "a", en: "a", es: "a" }, unidade: "projeto", fatores: { pt: ["x"], en: ["x"], es: ["x"] } }), /precos\.sustentacao\.unidade: unidade de "sustentacao" é "mes"/],
    ["encarregado malformado", (d) => void (d.privacidade.encarregado = "pequeno"), /privacidade\.encarregado: use "pequeno_porte" ou/],
    ["data da Política", (d) => void (d.privacidade.atualizadaEm = "19/10/2026"), /privacidade\.atualizadaEm: data "AAAA-MM-DD"/],
    // B346/B347: o resto do caminho dos pixels (build de produção com os IDs) está em dados-pixels.test.ts.
    ["ID de pixel com letra", (d) => void (d.privacidade.pixels = { linkedin: { id: "12a4567", prazo: null }, meta: null }), /privacidade\.pixels\.linkedin\.id: só dígitos/],
    ["pixel desconhecido", (d) => void (d.privacidade.pixels = { tiktok: { id: "1234567", prazo: null } }), /privacidade\.pixels: campo desconhecido "tiktok"/],
    ["placeholder esquecido", (d) => void (d.empresa.responsavel = "{nome}"), /empresa\.responsavel: texto com marca de rascunho/],
  ])("%s", (_nome, mutar, esperado) => {
    expect(erros(mutar)).toMatch(esperado);
  });

  it("pessoa do time incompleta, sem foto ou com nome de exemplo: cada campo com o seu caminho", () => {
    const issues = erros((d) => {
      d.time = [
        { id: "Ana Souza", nome: "Ana", foto: "imagens/nao-existe.jpg", linha: { pt: "x", en: "x", es: "x" }, atuaEmProjetos: true },
        { id: "bruno", nome: "Bruno Exemplo Lima", foto: "ficticio/imagens/pessoa-bruno-exemplo.svg", papel: { pt: "x", en: "x", es: "x" }, linha: { pt: "x", en: "x", es: "x" }, atuaEmProjetos: true },
      ];
    });
    expect(issues).toMatch(/time\[0\]\.id: obrigatório, em minúsculas, números e hífen/);
    expect(issues).toMatch(/time\[0\]\.nome: nome completo \(nome e sobrenome\)/);
    expect(issues).toMatch(/time\[0\]\.foto: arquivo não encontrado: dados\/imagens\/nao-existe\.jpg/);
    expect(issues).toMatch(/time\[0\]\.papel: campo obrigatório faltando/);
    expect(issues).toMatch(/time\[1\]\.foto: imagem da camada fictícia no dados\/dono\.json/);
    expect(issues).toMatch(/time\[1\]\.nome: "Bruno Exemplo Lima" parece dado fictício/);
  });

  it("depoimento em vídeo (B287): arquivo que não existe, mídia da camada fictícia e vídeo sem autorização, cada um com o caminho", () => {
    const depoimento = (video: Record<string, unknown>, autorizacaoVideo?: boolean) => ({
      id: "marina-souza",
      citacao: { pt: "Na terceira semana a gente já usava.", en: "By the third week we used it.", es: "En la tercera semana ya lo usábamos." },
      nome: "Marina Souza",
      cargo: { pt: "Diretora de operações", en: "Operations director", es: "Directora de operaciones" },
      empresa: "Transportes Modelo",
      video,
      autorizacao: {
        porEscrito: true,
        autorizadoPor: "Diretora de operações da Transportes Modelo",
        data: "2026-03-12",
        registro: "e-mail arquivado em Autorizações/2026",
        foto: false,
        ...(autorizacaoVideo === undefined ? {} : { video: autorizacaoVideo }),
      },
    });
    const issues = erros((d) => {
      d.depoimentos = [
        depoimento({ src: "videos/nao-existe.mp4", poster: "imagens/nao-existe.jpg", legendas: { pt: "videos/nao-existe.pt.vtt" }, duracaoSegundos: 60 }, true),
        depoimento(
          {
            src: "ficticio/videos/depoimento-carla-exemplo.mp4",
            poster: "ficticio/imagens/poster-depoimento-carla-exemplo.png",
            legendas: { pt: "ficticio/videos/depoimento-carla-exemplo.pt.vtt" },
            duracaoSegundos: 60,
          },
          true,
        ),
        depoimento({ src: "videos/x.mov", poster: "imagens/x.jpg", legendas: { en: "videos/x.en.vtt" }, duracaoSegundos: 120 }),
        depoimento(
          {
            src: "./ficticio/videos/depoimento-carla-exemplo.mp4",
            poster: "imagens/x.jpg",
            legendas: { pt: "ficticio//videos/depoimento-carla-exemplo.pt.vtt" },
            duracaoSegundos: 60,
          },
          true,
        ),
      ];
    });
    expect(issues).toMatch(/depoimentos\[0\]\.video\.src: arquivo não encontrado: dados\/videos\/nao-existe\.mp4/);
    expect(issues).toMatch(/depoimentos\[0\]\.video\.legendas\.pt: arquivo não encontrado: dados\/videos\/nao-existe\.pt\.vtt/);
    expect(issues).toMatch(/depoimentos\[1\]\.video\.src: arquivo da camada fictícia no dados\/dono\.json/);
    expect(issues).toMatch(/depoimentos\[1\]\.video\.legendas\.pt: arquivo da camada fictícia no dados\/dono\.json/);
    expect(issues).toMatch(/depoimentos\[2\]\.video\.src: formato: mp4 ou webm/);
    expect(issues).toMatch(/depoimentos\[2\]\.video\.legendas\.pt: campo obrigatório faltando/);
    expect(issues).toMatch(/depoimentos\[2\]\.video\.duracaoSegundos: no máximo 90 segundos/);
    // Caminho "disfarçado" para a camada também é recusado (pelo caminho resolvido).
    expect(issues).toMatch(/depoimentos\[3\]\.video\.src: arquivo da camada fictícia no dados\/dono\.json/);
    expect(issues).toMatch(/depoimentos\[3\]\.video\.legendas\.pt: arquivo da camada fictícia no dados\/dono\.json/);
  });

  it("toda mensagem começa pelo arquivo e pelo caminho do campo", () => {
    const issues = donoIssues({ ...copia(), agenda: { url: 1 }, extra: true });
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) expect(issue).toMatch(/^dados\/dono\.json › [a-zA-Z$]/);
  });
});

describe("trava da Política: dado fictício nunca libera", () => {
  it("o dono.json de hoje bloqueia o build de produção (só a data da Política pendente; empresa, base de medição e prazos o dono já decidiu)", () => {
    const blockers = privacyLaunchBlockers().join("\n");
    expect(blockers).not.toMatch(/empresa: razão social/);
    // baseAnuncios, encarregado e os prazos decididos (D05/memo jurídico, 27/10/2026); falta só a data.
    expect(blockers).not.toMatch(/privacidade\.baseAnuncios/);
    expect(blockers).not.toMatch(/privacidade\.encarregado/);
    expect(blockers).not.toMatch(/privacidade\.prazos/);
    expect(blockers).toMatch(/privacidade\.atualizadaEm/);
  });

  it("com TODOS os campos da camada fictícia, continua bloqueado", () => {
    const doc = mesclado();
    // A empresa inteira da camada (o par real completo do dono.json venceria a mescla).
    const empresa = { ...doc.empresa, razaoSocial: ficticio.empresa.razaoSocial, cnpj: ficticio.empresa.cnpj, responsavel: ficticio.empresa.responsavel };
    const blockers = privacyLaunchBlockers(doc.privacidade as Privacidade, { hasAgenda: true }, empresa as Empresa).join("\n");
    expect(blockers).toMatch(/empresa: razão social \+ CNPJ válido, ou responsável \(dado real, não fictício\)/);
    // encarregado "pequeno_porte" e os prazos do dono vencem a mescla (campos
    // preenchidos), então não são mais bloqueadores; empresa e agenda fictícios continuam barrando.
    expect(blockers).toMatch(/ferramentas\.agenda\.fornecedor/);
  });

  it("com dado real de verdade (e CNPJ válido), libera", () => {
    const privacidade: Privacidade = {
      ...(real.privacidade as Privacidade),
      baseAnuncios: "legitimo_interesse",
      encarregado: "pequeno_porte",
      prazos: Object.fromEntries(Object.keys(real.privacidade.prazos).map((key) => [key, { pt: "12 meses", en: "12 months", es: "12 meses" }])) as Privacidade["prazos"],
      atualizadaEm: "2026-10-19",
    };
    const empresa: Empresa = { ...(real.empresa as Empresa), razaoSocial: "Razão Social de Teste Ltda", cnpj: "11.444.777/0001-61" };
    expect(privacyLaunchBlockers(privacidade, {}, empresa)).toEqual([]);
  });
});

// --- JSON Schema (autocompletar do editor) ------------------------------------------
// Validador mínimo do subconjunto de draft-07 que o dono.schema.json usa.
type Schema = Doc;
function validar(no: unknown, esquema: Schema, caminho = "$"): string[] {
  if (esquema.$ref) {
    const alvo = (esquema.$ref as string).replace("#/definitions/", "");
    const resolvido = schema.definitions[alvo];
    if (!resolvido) return [`${caminho}: $ref inexistente ${esquema.$ref}`];
    return validar(no, resolvido, caminho);
  }
  const erros: string[] = [];
  const tipo = no === null ? "null" : Array.isArray(no) ? "array" : Number.isInteger(no) ? "integer" : typeof no;
  if (esquema.type) {
    const aceitos: string[] = Array.isArray(esquema.type) ? esquema.type : [esquema.type];
    const ok = aceitos.includes(tipo) || (tipo === "integer" && aceitos.includes("number"));
    if (!ok) return [`${caminho}: tipo ${tipo}, esperava ${aceitos.join("|")}`];
  }
  if ("const" in esquema && no !== esquema.const) erros.push(`${caminho}: tem que ser ${JSON.stringify(esquema.const)}`);
  if (esquema.enum && !esquema.enum.includes(no)) erros.push(`${caminho}: fora do enum`);
  if (typeof no === "string") {
    if (esquema.pattern && !new RegExp(esquema.pattern).test(no)) erros.push(`${caminho}: não casa ${esquema.pattern}`);
    if (esquema.maxLength !== undefined && no.length > esquema.maxLength) erros.push(`${caminho}: maior que ${esquema.maxLength}`);
    if (esquema.minLength !== undefined && no.length < esquema.minLength) erros.push(`${caminho}: menor que ${esquema.minLength}`);
  }
  if (typeof no === "number" && esquema.minimum !== undefined && no < esquema.minimum) erros.push(`${caminho}: menor que ${esquema.minimum}`);
  if (Array.isArray(no)) {
    if (esquema.maxItems !== undefined && no.length > esquema.maxItems) erros.push(`${caminho}: mais de ${esquema.maxItems} itens`);
    if (esquema.minItems !== undefined && no.length < esquema.minItems) erros.push(`${caminho}: menos de ${esquema.minItems} itens`);
    if (esquema.items) no.forEach((item, index) => erros.push(...validar(item, esquema.items, `${caminho}[${index}]`)));
  }
  if (tipo === "object" && no) {
    const objeto = no as Doc;
    for (const chave of esquema.required ?? []) if (!(chave in objeto)) erros.push(`${caminho}.${chave}: obrigatório`);
    for (const [chave, valor] of Object.entries(objeto)) {
      const filho = esquema.properties?.[chave];
      if (filho) erros.push(...validar(valor, filho, `${caminho}.${chave}`));
      else if (esquema.additionalProperties === false) erros.push(`${caminho}.${chave}: chave não prevista`);
    }
  }
  if (esquema.anyOf && !esquema.anyOf.some((opcao: Schema) => validar(no, opcao, caminho).length === 0)) erros.push(`${caminho}: nenhuma opção do anyOf`);
  if (esquema.allOf) for (const parte of esquema.allOf) erros.push(...validar(no, parte, caminho));
  return erros;
}

describe("dados/dono.schema.json — autocompletar e checagem no editor", () => {
  it("o dono.json e o dono.ficticio.json apontam para o schema e passam nele", () => {
    expect(real.$schema).toBe("./dono.schema.json");
    expect(ficticio.$schema).toBe("./dono.schema.json");
    expect(validar(real, schema)).toEqual([]);
    expect(validar(ficticio, schema)).toEqual([]);
  });

  it("acompanha as seções do Zod e recusa campo desconhecido, tipo errado e 3 faixas", () => {
    expect(Object.keys(schema.properties).filter((key) => key !== "$schema").sort()).toEqual([...SECOES_DONO].sort());
    expect(schema.required.sort()).toEqual([...SECOES_DONO].sort());
    const doc = copia();
    doc.empresa.razao_social = "x";
    doc.perfis.github.publicar = "sim";
    doc.qualificacao.faixas = doc.qualificacao.faixas.slice(0, 3);
    const erros = validar(doc, schema).join("\n");
    expect(erros).toMatch(/\$\.empresa\.razao_social: chave não prevista/);
    expect(erros).toMatch(/\$\.perfis\.github\.publicar: tipo string/);
    expect(erros).toMatch(/\$\.qualificacao\.faixas: nenhuma opção do anyOf/);
  });

  it("todo campo de seção tem descrição (é o que aparece no editor)", () => {
    const semDescricao: string[] = [];
    for (const [secao, definicao] of Object.entries<Schema>(schema.properties)) {
      if (secao === "$schema") continue;
      if (!definicao.description) semDescricao.push(secao);
      const props = definicao.properties ?? definicao.items?.properties ?? {};
      for (const [campo, def] of Object.entries<Schema>(props)) {
        if (!def.description && !def.$ref) semDescricao.push(`${secao}.${campo}`);
      }
    }
    expect(semDescricao).toEqual([]);
  });
});

// --- erro de sintaxe do JSON, em pt-BR ------------------------------------------------
describe("dados/dono.json com erro de SINTAXE: mensagem em pt-BR com arquivo, linha, coluna e motivo", () => {
  const texto = readFileSync(join(ROOT, "dados", "dono.json"), "utf8");

  it("o arquivo de hoje é JSON válido", () => {
    expect(localizarErroDeJson(texto)).toBeNull();
    expect(lerJsonDoDono(texto, "dados/dono.json")).toEqual(real);
  });

  it("vírgula sobrando antes do } final (o erro comum do playbook 00, item 3)", () => {
    const quebrado = texto.replace(/"logos": \[\]\n\}/, '"logos": [],\n}');
    expect(quebrado).not.toBe(texto);
    const linhas = quebrado.split("\n");
    const linhaDaVirgula = linhas.findIndex((linha) => linha.includes('"logos": [],')) + 1;
    const mensagem = mensagemDeJsonInvalido(quebrado, "dados/dono.json");
    expect(mensagem).toContain(`[dados] dados/dono.json não é um JSON válido (linha ${linhaDaVirgula}, coluna 14): vírgula sobrando depois do último item.`);
    expect(mensagem).toContain("JSON não aceita vírgula final nem comentário.");
    expect(mensagem).toContain(`${linhaDaVirgula} |   "logos": [],`);
    expect(() => lerJsonDoDono(quebrado, "dados/dono.json")).toThrow(/vírgula sobrando/);
  });

  it.each<[string, string, RegExp]>([
    ["vírgula final em lista", '{\n  "a": [1, 2,]\n}', /linha 2, coluna 13\): vírgula sobrando depois do último item/],
    ["comentário", '{\n  // nota\n  "a": 1\n}', /linha 2, coluna 3\): comentário \(\/\/ ou \/\* \*\/\) não é permitido/],
    ["aspas simples", "{\n  'a': 1\n}", /linha 2, coluna 3\): texto entre aspas simples: use aspas duplas/],
    ["vírgula faltando", '{\n  "a": 1\n  "b": 2\n}', /linha 3, coluna 3\): faltou uma vírgula entre dois campos/],
    ["true com maiúscula", '{ "a": True }', /valor inválido "True": use true, false, null/],
    ["arquivo cortado", '{ "a": [1, 2', /o arquivo terminou antes da hora/],
    ["quebra de linha num texto", '{ "a": "linha\nquebrada" }', /quebra de linha dentro de um texto/],
    ["aspas curvas", '{ "a": “x” }', /aspas “curvas”/],
  ])("%s", (_nome, quebrado, esperado) => {
    expect(() => JSON.parse(quebrado)).toThrow();
    expect(mensagemDeJsonInvalido(quebrado, "dados/dono.json")).toMatch(esperado);
  });
});

// --- texto de exemplo no dado real ----------------------------------------------------
describe("texto de EXEMPLO da camada fictícia nunca vale no dado real", () => {
  it("reconhece os rótulos da camada e deixa passar português comum", () => {
    for (const valor of [
      "de duas a três semanas (exemplo)",
      "R$ 8 mil a R$ 15 mil (exemplo)",
      "BRL 3k–8k (example)",
      "Exemplo: encontros remotos com quem decide",
      "Example: remote sessions",
      "Texto de ejemplo: con el tiempo",
      "Condições de exemplo: o pagamento é dividido em parcelas",
      "Example terms: payment is split",
      "Depoimento de exemplo: na terceira semana",
      "**Conteúdo de exemplo.** Este post é fictício",
      "Post de exemplo sobre integração entre sistemas",
      "Case de exemplo: os pedidos chegavam por WhatsApp",
      "Dado fictício da camada de exemplo; não existe autorização",
      "Sample content. This case is fictitious",
      "agenda em https://example.com/agenda",
    ]) {
      expect(textoDeExemplo(valor.replace(/\*/g, "")), valor).not.toBeNull();
    }
    for (const valor of [
      "Por exemplo, um sistema de fretes com app do motorista.",
      "A gente mostra um exemplo do que foi entregue.",
      "Exemplos de entrega ficam no plano.",
      "As entregas a cada 2 semanas existem para você perceber cedo o que precisa mudar.",
      "Até R$ 30 mil",
      "lemamon.dev@gmail.com",
    ]) {
      expect(textoDeExemplo(valor), valor).toBeNull();
    }
  });

  it("qualquer campo do dono.json com texto de exemplo derruba a validação, com o caminho", () => {
    const doc = copia();
    doc.descoberta.formato = { pt: "encontros remotos (exemplo)", en: "remote sessions", es: "encuentros remotos" };
    doc.confirmacoes.pagamento = { pt: "Condições de exemplo: parcelas ligadas às entregas.", en: "Payment in installments.", es: "Pago en cuotas." };
    doc.sustentacao.inclui = { pt: "Exemplo: correção de erros.", en: "Bug fixes.", es: "Corrección de errores." };
    const issues = donoIssues(doc).join("\n");
    expect(issues).toMatch(/dados\/dono\.json › descoberta\.formato\.pt: texto de EXEMPLO da camada fictícia \(marcado "\(exemplo\)"\)/);
    expect(issues).toMatch(/dados\/dono\.json › confirmacoes\.pagamento\.pt: texto de EXEMPLO da camada fictícia \(começa com "Condições de exemplo"\)/);
    expect(issues).toMatch(/dados\/dono\.json › sustentacao\.inclui\.pt: texto de EXEMPLO/);
    expect(issues).not.toMatch(/\.en: texto de EXEMPLO|\.es: texto de EXEMPLO/);
  });

  it("frontmatter de case e post com texto de exemplo não passa no schema (só com a camada ligada)", () => {
    const casos = caseSchema(fakeImage, fakeReference);
    const posts = postSchema(fakeImage);
    const caso = { ...caseFrontmatter(), periodo: "fev–jul/2026 (exemplo)", cliente: "FIXTURE-LEMAMON Transportadora Exemplo Ltda" };
    const erroCaso = casos.safeParse(caso);
    expect(erroCaso.success).toBe(false);
    const mensagens = erroCaso.error!.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
    expect(mensagens).toMatch(/periodo: texto de EXEMPLO/);
    expect(mensagens).toMatch(/cliente: texto de EXEMPLO da camada fictícia \("FIXTURE-LEMAMON Transportadora Exemplo Ltda" parece nome ou link de exemplo\)/);
    const post = { ...postFrontmatter(), resumo: "Post de exemplo sobre integração entre sistemas." };
    expect(posts.safeParse(post).success).toBe(false);
    expect(caseSchema(fakeImage, fakeReference, { permitirExemplo: true }).safeParse(caso).success).toBe(true);
    expect(postSchema(fakeImage, { permitirExemplo: true }).safeParse(post).success).toBe(true);
    // Sem texto de exemplo, as fixtures passam.
    expect(casos.safeParse(caseFrontmatter()).success).toBe(true);
    expect(posts.safeParse(postFrontmatter()).success).toBe(true);
  });

  it("corpo de MDX real com texto de exemplo derruba o loader (com ou sem a camada)", () => {
    const corpo = "**Conteúdo de exemplo.** Este post foi escrito ontem.\n\nTexto normal, por exemplo.\n\n<CtaMeio />\n\nMais texto.";
    expect(exemplosNoMdxReal("src/content/posts/x.mdx", { titulo: "Título real" }, corpo)).toEqual([
      'src/content/posts/x.mdx (corpo, linha 1 do texto): texto de EXEMPLO da camada fictícia (começa com "Conteúdo de exemplo"): dado fictício nunca vai ao ar. Escreva o texto real ou deixe vazio',
    ]);
    expect(exemplosNoMdxReal("src/content/posts/x.mdx", { titulo: "Título real" }, "Texto real.\n\n<CtaMeio />")).toEqual([]);
  });
});

// --- cópia literal da camada no dado real ---------------------------------------------
describe("valor COPIADO de dados/dono.ficticio.json ou de dados/ficticio/ derruba o build", () => {
  const raizes: string[] = [];
  afterAll(() => raizes.forEach((raiz) => rmSync(raiz, { recursive: true, force: true })));

  /** Raiz mínima: dados/ (real + camada) e src/content/, com o dono.json e os MDX que o teste quiser. */
  function raiz(mutar: (doc: Doc) => void = () => {}, mdx: Record<string, string> = {}): string {
    const dir = mkdtempSync(join(tmpdir(), "lemamon-copia-"));
    raizes.push(dir);
    cpSync(join(ROOT, "dados"), join(dir, "dados"), { recursive: true });
    const doc = copia();
    mutar(doc);
    writeFileSync(join(dir, "dados", "dono.json"), JSON.stringify(doc, null, 2));
    for (const pasta of ["cases", "posts"]) mkdirSync(join(dir, "src", "content", pasta), { recursive: true });
    for (const [arquivo, texto] of Object.entries(mdx)) writeFileSync(join(dir, "src", "content", arquivo), texto);
    return dir;
  }

  // Varre src/, public/ e dados/ inteiros contra cada imagem da camada (janelas de bytes e semelhança):
  // o tempo cresce com o número de imagens da camada, como as varreduras de dados-vazamento.test.ts.
  it("src/, public/ e dados/ de hoje não têm cópia (sem falso positivo no projeto real)", { timeout: 120_000 }, async () => {
    expect(await copiasDaCamadaFicticia(ROOT)).toEqual([]);
  });

  it("valores distintivos: textos e nomes sim; ids, enums e datas não", () => {
    for (const valor of ["de duas a três semanas (exemplo)", "Ana Exemplo Souza", "https://example.com/agenda", "São Paulo, SP, onde a gente atende"]) {
      expect(valorDistintivo(valor), valor).toBe(true);
    }
    for (const valor of ["tier_2", "BRL", "legitimo_interesse", "answer_draft_alt", "2026-01-15", "projeto", "TypeScript"]) {
      expect(valorDistintivo(valor), valor).toBe(false);
    }
  });

  it("seções inteiras copiadas para o dono.json (cenário X8): cada valor, com o caminho dos dois lados", { timeout: 120_000 }, async () => {
    const problemas = (await copiasDaCamadaFicticia(
      raiz((doc) => {
        for (const secao of ["descoberta", "sustentacao", "engenharia", "precos"]) doc[secao] = structuredClone(ficticio[secao]);
        doc.confirmacoes.pagamento = structuredClone(ficticio.confirmacoes.pagamento);
        doc.qualificacao.faixasMensais = structuredClone(ficticio.qualificacao.faixasMensais);
      }),
    )).join("\n");
    expect(problemas).toMatch(
      /dados\/dono\.json › descoberta\.ritmo\.pt: valor copiado de dados\/dono\.ficticio\.json › descoberta\.ritmo\.pt \("Exemplo: dois encontros por semana/,
    );
    expect(problemas).toMatch(/dados\/dono\.json › precos\.desenvolvimento\.sistemas\.faixa\.pt: valor copiado de .*"R\$ 60 mil a R\$ 150 mil \(exemplo\)"/);
    expect(problemas).toMatch(/dados\/dono\.json › confirmacoes\.pagamento\.pt: valor copiado de/);
    expect(problemas).toMatch(/dados\/dono\.json › qualificacao\.faixasMensais\[0\]\.rotulo\.pt: valor copiado de/);
    // ids e enums iguais (tier_1, "projeto", "mes") não contam como cópia.
    expect(problemas).not.toMatch(/\.id: valor copiado|\.unidade: valor copiado/);
  });

  it("post fictício copiado para src/content/posts com título, slug e autor trocados (cenário X9b)", { timeout: 120_000 }, async () => {
    const original = readFileSync(join(ROOT, "dados", "ficticio", "posts", "exemplo-integrar-sistemas.mdx"), "utf8");
    const corpo = original.split("---").slice(2).join("---");
    const frontmatter = '---\ntitulo: "O que muda quando os sistemas conversam"\nresumo: "Por onde começar."\nautor:\n  nome: "Bruno Real Lima"\n  foto: "./autor.png"\n  link: "https://www.linkedin.com/in/bruno-real"\n  papelTecnico: "Desenvolvedor"\npublicadoEm: "2026-08-25"\n---';
    const problemas = (await copiasDaCamadaFicticia(raiz(undefined, { "posts/integrar-sistemas.mdx": frontmatter + corpo }))).join("\n");
    expect(problemas).toMatch(/src\/content\/posts\/integrar-sistemas\.mdx: trecho copiado de dados\/ficticio\/posts\/exemplo-integrar-sistemas\.mdx/);
  });

  it("frases do corpo e todo valor de frontmatter dos MDX fictícios viram marcadores", () => {
    const marcadores = marcadoresFicticios(ROOT);
    expect(marcadores).toContain("Este case é fictício e só aparece com a camada de dados fictícios ligada.");
    expect(marcadores).toContain("Case de exemplo: os pedidos chegavam por WhatsApp, eram copiados para uma planilha compartilhada e ninguém sabia com certeza qual frete estava em andamento.");
    expect(marcadores).toContain("Tela de exemplo de um painel de fretes, com a faixa EXEMPLO");
    expect(valoresDoFrontmatter('titulo: "A"\nsetor: Logística (exemplo)\nordem: 0\nlista: ["x", "y"]')).toEqual(["A", "x", "y", "Logística (exemplo)"]);
    expect(trechosDoCorpo("**Conteúdo de exemplo.** Este post é fictício e só aparece aqui.\n\n<CtaMeio />\n\nThat's the \"rule\" -- ok")).toEqual([
      "Este post é fictício e só aparece aqui.",
    ]);
  });
});
