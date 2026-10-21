/**
 * Camada de DADOS FICTÍCIOS (dono: gated): regra de ativação (flag × contexto),
 * merge por cima do dados/dono.json e o módulo virtual que a integração gera.
 * Nos testes a camada está sempre desligada (vitest.config.ts); os builds reais
 * com e sem a camada estão em dados-vazamento.test.ts.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
  CNPJ_FICTICIO,
  decidirCamadaFicticia,
  estaVazio,
  flagLigada,
  mesclarFicticio,
  mesclarSecaoFicticia,
  pareceFicticio,
} from "@/config/camada-ficticia";
import { comCamadaFicticia, MODO_FICTICIO, SECOES_DONO } from "@/config/dono";
import { t } from "@/i18n";
import {
  apagarSaida,
  AVISO_PRODUCAO,
  caminhoReal,
  codigoDoModulo,
  decidirPeloAmbiente,
  dentroDaPastaPublicada,
  idDaCamadaFicticia,
  podeApagarSaida,
  saidaDoBuildFicticio,
} from "@/integrations/dados-ficticios";

const ROOT = process.cwd();
const lerJson = (arquivo: string) => JSON.parse(readFileSync(join(ROOT, arquivo), "utf8")) as Record<string, unknown>;
const real = lerJson("dados/dono.json");
const ficticio = lerJson("dados/dono.ficticio.json");

describe("regra de ativação: PUBLIC_DADOS_FICTICIOS=true E fora de produção", () => {
  it("flag: só 'true', '1', 'sim', 'yes' (ou true) ligam", () => {
    for (const on of ["true", "TRUE", " true ", "1", "sim", "yes", true]) expect(flagLigada(on), String(on)).toBe(true);
    for (const off of ["", "false", "0", "não", "no", "ture", undefined, null, false, 1]) expect(flagLigada(off), String(off)).toBe(false);
  });

  it.each([
    // flag,      produção, ativa, ignorada (com aviso)
    ["true", false, true, false],
    ["true", true, false, true],
    ["false", false, false, false],
    ["false", true, false, false],
    ["", false, false, false],
    [undefined, true, false, false],
  ] as const)("flag=%s produção=%s → ativa=%s, ignorada=%s", (flag, producao, ativa, ignorada) => {
    expect(decidirCamadaFicticia({ flag, producao })).toEqual({ ativa, ignoradaEmProducao: ignorada });
  });

  it("contexto do Netlify: só CONTEXT=production bloqueia; preview, branch e local podem ligar", () => {
    expect(decidirPeloAmbiente({ flag: "true", contexto: "production" })).toEqual({ ativa: false, ignoradaEmProducao: true });
    for (const contexto of ["deploy-preview", "branch-deploy", "dev", undefined]) {
      expect(decidirPeloAmbiente({ flag: "true", contexto }).ativa, String(contexto)).toBe(true);
      expect(decidirPeloAmbiente({ flag: "", contexto }).ativa, String(contexto)).toBe(false);
    }
  });

  it("o aviso de produção diz que a camada foi ignorada e que o site usa só o dono.json", () => {
    expect(AVISO_PRODUCAO).toMatch(/IGNORADO/);
    expect(AVISO_PRODUCAO).toMatch(/CONTEXT=production/);
    expect(AVISO_PRODUCAO).toMatch(/dados\/dono\.json/);
  });

  it("build fictício nunca no dist/ publicado: local e CONTEXT=dev vão para dist-ficticio/; deploy preview e branch deploy ficam no dist/", () => {
    const root = "/projeto";
    const dist = "/projeto/dist";
    for (const contexto of [undefined, "dev", "qualquer"]) {
      expect(saidaDoBuildFicticio({ ativa: true, contexto, outDir: dist, root }), String(contexto)).toBe("/projeto/dist-ficticio");
      expect(saidaDoBuildFicticio({ ativa: true, contexto, outDir: "/projeto/dist/", root }), String(contexto)).toBe("/projeto/dist-ficticio");
    }
    for (const contexto of ["deploy-preview", "branch-deploy"]) {
      expect(saidaDoBuildFicticio({ ativa: true, contexto, outDir: dist, root }), contexto).toBeNull();
    }
    // Camada desligada ou --outDir explícito para outra pasta (testes, E2E): não muda.
    expect(saidaDoBuildFicticio({ ativa: false, contexto: undefined, outDir: dist, root })).toBeNull();
    expect(saidaDoBuildFicticio({ ativa: true, contexto: undefined, outDir: "/projeto/dist-e2e", root })).toBeNull();
    // Pasta DENTRO de dist/ também é a publicada.
    expect(saidaDoBuildFicticio({ ativa: true, contexto: undefined, outDir: "/projeto/dist/sub", root })).toBe("/projeto/dist-ficticio");
    // Preview com a variável só num .env local (build local imitando o Netlify): desvia.
    expect(saidaDoBuildFicticio({ ativa: true, contexto: "deploy-preview", outDir: dist, root, flagNoProcesso: false })).toBe("/projeto/dist-ficticio");
  });

  describe("pelo caminho REAL: link simbólico para dist/ conta como dist/", () => {
    const raizes: string[] = [];
    afterAll(() => raizes.forEach((raiz) => rmSync(raiz, { recursive: true, force: true })));
    const projeto = () => {
      const raiz = mkdtempSync(join(tmpdir(), "lemamon-saida-"));
      raizes.push(raiz);
      return raiz;
    };

    it("--outDir out, com out → dist: vai para dist-ficticio/ (cenário A10)", () => {
      const root = projeto();
      mkdirSync(join(root, "dist"));
      symlinkSync(join(root, "dist"), join(root, "out"));
      expect(dentroDaPastaPublicada(join(root, "out"), root)).toBe(true);
      expect(saidaDoBuildFicticio({ ativa: true, contexto: undefined, outDir: join(root, "out"), root })).toBe(join(root, "dist-ficticio"));
      // Link para uma pasta DENTRO de dist/ também.
      mkdirSync(join(root, "dist", "x"));
      symlinkSync(join(root, "dist", "x"), join(root, "out2"));
      expect(saidaDoBuildFicticio({ ativa: true, contexto: undefined, outDir: join(root, "out2"), root })).toBe(join(root, "dist-ficticio"));
    });

    it("link QUEBRADO (out → dist antes de dist existir): também vai para dist-ficticio/", () => {
      const root = projeto();
      symlinkSync(join(root, "dist"), join(root, "out"));
      expect(dentroDaPastaPublicada(join(root, "out"), root)).toBe(true);
      expect(saidaDoBuildFicticio({ ativa: true, contexto: undefined, outDir: join(root, "out"), root })).toBe(join(root, "dist-ficticio"));
      // Link relativo e em cadeia: out2 → out → dist.
      symlinkSync("out", join(root, "out2"));
      expect(dentroDaPastaPublicada(join(root, "out2", "sub"), root)).toBe(true);
    });

    it("dist/ que é link para outra pasta: aquela pasta é a publicada", () => {
      const root = projeto();
      mkdirSync(join(root, "publicada"));
      symlinkSync(join(root, "publicada"), join(root, "dist"));
      expect(dentroDaPastaPublicada(join(root, "publicada"), root)).toBe(true);
      expect(saidaDoBuildFicticio({ ativa: true, contexto: undefined, outDir: join(root, "publicada"), root })).toBe(join(root, "dist-ficticio"));
    });

    it("dist-ficticio/ que aponta para dist/ derruba o build", () => {
      const root = projeto();
      mkdirSync(join(root, "dist"));
      symlinkSync(join(root, "dist"), join(root, "dist-ficticio"));
      expect(() => saidaDoBuildFicticio({ ativa: true, contexto: undefined, outDir: join(root, "dist"), root })).toThrow(/dist-ficticio\/ aponta para dist\//);
    });

    it("caminho que ainda não existe: resolve pelo ancestral, sem criar nada", () => {
      const root = projeto();
      expect(caminhoReal(join(root, "dist", "a", "b"))).toBe(join(caminhoReal(root), "dist", "a", "b"));
      expect(dentroDaPastaPublicada(join(root, "dist"), root)).toBe(true);
    });

    it("build reprovado apaga a saída, mas nunca a raiz, um ancestral nem pasta com cara de projeto", () => {
      const root = projeto();
      writeFileSync(join(root, "package.json"), "{}");
      mkdirSync(join(root, "dist", ".prerender"), { recursive: true });
      writeFileSync(join(root, "dist", ".prerender", "chunk.mjs"), "x");
      expect(podeApagarSaida(root, root)).toBe(false);
      expect(podeApagarSaida(join(root, ".."), root)).toBe(false);
      expect(podeApagarSaida("/", root)).toBe(false);
      mkdirSync(join(root, "outra", "src"), { recursive: true });
      expect(podeApagarSaida(join(root, "outra"), root)).toBe(false);
      expect(podeApagarSaida(join(tmpdir(), "fora-do-projeto"), root)).toBe(false);
      expect(apagarSaida(join(root, "dist"), root)).toBe(true);
      expect(apagarSaida(join(root, "dist"), root)).toBe(false);
    });
  });

  it("trava de import: reconhece o arquivo e a pasta da camada, com ?raw, ?inline, ?url, \\0 e /@fs", () => {
    const root = "/projeto";
    for (const id of [
      "/projeto/dados/dono.ficticio.json",
      "/projeto/dados/ficticio/imagens/pessoa-ana-exemplo.svg?raw",
      "/projeto/dados/ficticio/imagens/capa.png?inline",
      "/projeto/dados/ficticio/imagens/capa.png?url",
      "\0/projeto/dados/ficticio/posts/x.mdx?astroContentCollectionEntry=true",
      "/@fs/projeto/dados/ficticio/imagens/logo.svg",
      "/projeto/dados/ficticio",
    ]) {
      expect(idDaCamadaFicticia(id, root), id).toBe(true);
    }
    for (const id of ["/projeto/dados/dono.json", "/projeto/dados/imagens/ana.jpg", "/projeto/dados/ficticio-velho/x.svg", "virtual:lemamon/dados-ficticios", "dados/ficticio/x.svg"]) {
      expect(idDaCamadaFicticia(id, root), id).toBe(false);
    }
  });

  it("módulo virtual desligado não carrega NENHUM dado fictício", () => {
    const desligado = codigoDoModulo(false, ROOT);
    expect(desligado).toBe("export const ATIVO = false;\nexport const secoes = {};\n");
    const ligado = codigoDoModulo(true, ROOT);
    expect(ligado).toContain("export const ATIVO = true;");
    expect(ligado).toContain("Empresa Exemplo Ltda");
    expect(ligado).not.toContain("$schema");
  });

  it("nos testes a camada está desligada (vitest força a flag): o site usa só o dono.json", () => {
    expect(MODO_FICTICIO).toBe(false);
    for (const secao of SECOES_DONO) expect(comCamadaFicticia(secao, real[secao])).toBe(real[secao]);
  });
});

describe("merge: a camada fictícia só preenche o que está vazio", () => {
  it("vazio = null, undefined, texto em branco, lista vazia ou false; número nunca", () => {
    for (const vazio of [null, undefined, "", "   ", [], false]) expect(estaVazio(vazio), JSON.stringify(vazio)).toBe(true);
    for (const cheio of ["x", [1], true, 0, 2020, {}]) expect(estaVazio(cheio), JSON.stringify(cheio)).toBe(false);
  });

  it("objeto campo a campo; o valor real preenchido sempre vence", () => {
    const base = { a: "real", b: "", c: null, d: false, e: true, f: 0, g: { pt: "real", en: "", es: "" } };
    const camada = { a: "fict", b: "fict", c: { pt: "x" }, d: true, e: false, f: 9, g: { pt: "fict", en: "fict", es: "fict" }, h: "novo" };
    expect(mesclarFicticio(base, camada)).toEqual({
      a: "real",
      b: "fict",
      c: { pt: "x" },
      d: true,
      e: true,
      f: 0,
      g: { pt: "real", en: "fict", es: "fict" },
      h: "novo",
    });
  });

  it("razão social e CNPJ são um par: real só completo; incompleto, o par fictício inteiro", () => {
    const camada = { email: "x@example.com", razaoSocial: "Empresa Exemplo Ltda", cnpj: CNPJ_FICTICIO, responsavel: "Ana Exemplo" };
    const cnpjReal = "69.700.690/0001-98";
    // Só o CNPJ real: nada de razão social de exemplo ao lado dele.
    expect(mesclarSecaoFicticia("empresa", { email: "a@b.com", razaoSocial: "", cnpj: cnpjReal, responsavel: "" }, camada)).toEqual({
      email: "a@b.com",
      razaoSocial: "Empresa Exemplo Ltda",
      cnpj: CNPJ_FICTICIO,
      responsavel: "Ana Exemplo",
    });
    // Só a razão social real: idem.
    expect(mesclarSecaoFicticia("empresa", { email: "", razaoSocial: "Real Ltda", cnpj: "", responsavel: "" }, camada)).toMatchObject({
      razaoSocial: "Empresa Exemplo Ltda",
      cnpj: CNPJ_FICTICIO,
    });
    // Par completo: o real vale.
    expect(mesclarSecaoFicticia("empresa", { email: "", razaoSocial: "Real Ltda", cnpj: cnpjReal, responsavel: "" }, camada)).toMatchObject({
      razaoSocial: "Real Ltda",
      cnpj: cnpjReal,
    });
    // Par real completo: o ano de fundação de exemplo não entra ao lado do CNPJ real.
    expect(
      mesclarSecaoFicticia("empresa", { email: "", razaoSocial: "Real Ltda", cnpj: cnpjReal, anoFundacao: null, responsavel: "" }, { ...camada, anoFundacao: 2020 }),
    ).toMatchObject({ cnpj: cnpjReal, anoFundacao: null });
    // Par incompleto: o ano de exemplo continua (o preview mostra a linha).
    expect(
      mesclarSecaoFicticia("empresa", { email: "", razaoSocial: "", cnpj: cnpjReal, anoFundacao: null, responsavel: "" }, { ...camada, anoFundacao: 2020 }),
    ).toMatchObject({ cnpj: CNPJ_FICTICIO, anoFundacao: 2020 });
    // Camada sem CNPJ: vazio, nunca o CNPJ real ao lado da razão social de exemplo.
    expect(mesclarSecaoFicticia("empresa", { email: "", razaoSocial: "", cnpj: cnpjReal, responsavel: "" }, { razaoSocial: "Empresa Exemplo Ltda" })).toMatchObject({
      razaoSocial: "Empresa Exemplo Ltda",
      cnpj: "",
    });
    // Outras seções: a mescla de sempre.
    expect(mesclarSecaoFicticia("agenda", { url: "" }, { url: "https://example.com/agenda" })).toEqual({ url: "https://example.com/agenda" });
  });

  it("lista é atômica: nunca mistura item real com fictício", () => {
    expect(mesclarFicticio({ time: [] }, { time: [{ id: "f" }] })).toEqual({ time: [{ id: "f" }] });
    expect(mesclarFicticio({ time: [{ id: "r" }] }, { time: [{ id: "f" }, { id: "g" }] })).toEqual({ time: [{ id: "r" }] });
  });

  it("não muta as entradas, ignora $schema e camada ausente devolve o real", () => {
    const base = { x: null as null | { y: number }, $schema: "./a.json" };
    const camada = { x: { y: 1 }, $schema: "./b.json" };
    const saida = mesclarFicticio(base, camada);
    expect(saida).toEqual({ x: { y: 1 }, $schema: "./a.json" });
    expect(base.x).toBeNull();
    saida.x!.y = 2;
    expect(camada.x.y).toBe(1);
    expect(mesclarFicticio(base, undefined)).toBe(base);
  });

  it("dono.json + dono.ficticio.json: decisões reais preservadas, vazios preenchidos", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const efetivo: Record<string, any> = Object.fromEntries(SECOES_DONO.map((secao) => [secao, mesclarSecaoFicticia(secao, real[secao], ficticio[secao])]));
    // Decisões do dono continuam valendo por cima da camada.
    expect(efetivo.perfis).toEqual(real.perfis);
    expect(efetivo.confirmacoes.escopoMudanca).toBe(true);
    expect(efetivo.qualificacao.faixas).toEqual((real.qualificacao as Record<string, unknown>).faixas);
    // O e-mail é o do dono (dados/dono.json › empresa.email), seja qual for: trocar o endereço não pode quebrar o teste.
    expect(efetivo.empresa.email).toBe((real.empresa as { email: string }).email);
    // Razão social e CNPJ entram como par: o par real do dono, completo, vence a camada.
    expect(efetivo.empresa.razaoSocial).toBe((real.empresa as { razaoSocial: string }).razaoSocial);
    expect(efetivo.empresa.cnpj).toBe((real.empresa as { cnpj: string }).cnpj);
    expect(efetivo.empresa.cnpj).not.toBe(CNPJ_FICTICIO);
    expect(efetivo.empresa.anoFundacao).toBe((real.empresa as { anoFundacao: number | null }).anoFundacao);
    // D31 e D42: as decisões novas valem com a camada ligada.
    expect(efetivo.confirmacoes.outrasCidades).toBe(true);
    expect(efetivo.confirmacoes.atendeExterior).toBe(true);
    expect(efetivo.confirmacoes.duracaoDescoberta).toBe(true);
    // Descoberta parcial (D42): a duração real vence a de exemplo, campo a campo e idioma a idioma;
    // os campos vazios (formato, participantes, ritmo, exclusões) vêm da camada.
    expect(efetivo.descoberta.duracao).toEqual((real.descoberta as { duracao: unknown }).duracao);
    expect(JSON.stringify(efetivo.descoberta.duracao)).not.toMatch(/exemplo|example|ejemplo/i);
    expect(efetivo.descoberta.formato).toEqual((ficticio.descoberta as { formato: unknown }).formato);
    expect(efetivo.descoberta.naoInclui).toEqual((ficticio.descoberta as { naoInclui: unknown }).naoInclui);
    // O que estava vazio vem da camada.
    expect(efetivo.agenda.url).toBe("https://example.com/agenda");
    expect(efetivo.qualificacao.faixasMensais).toHaveLength(4);
    expect(efetivo.time.length).toBeGreaterThanOrEqual(1);
    expect(efetivo.depoimentos.length).toBeGreaterThanOrEqual(1);
    expect(efetivo.logos.length).toBeGreaterThanOrEqual(4);
  });
});

describe("faixa e marcas", () => {
  it("faixa 'Dados fictícios — não publicar' nos 3 idiomas (i18n)", () => {
    expect(t("pt", "shared.fictitious_data.banner")).toBe("Dados fictícios — não publicar");
    expect(t("en", "shared.fictitious_data.banner")).toBe("Fictitious data — do not publish");
    expect(t("es", "shared.fictitious_data.banner")).toBe("Datos ficticios — no publicar");
  });

  it("pareceFicticio reconhece nomes, domínios e o CNPJ de exemplo, sem pegar dado real", () => {
    for (const valor of ["Ana Exemplo Souza", "contato.exemplo@example.com", "https://example.com/agenda", CNPJ_FICTICIO, "00000000000000", "Datos de ejemplo"]) {
      expect(pareceFicticio(valor), valor).toBe(true);
    }
    for (const valor of ["lemamon.dev@gmail.com", "https://github.com/lemamon-dev", "Razão Social de Teste Ltda", "11.444.777/0001-61", 42]) {
      expect(pareceFicticio(valor), String(valor)).toBe(false);
    }
  });
});
