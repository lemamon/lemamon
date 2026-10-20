/**
 * globalSetup do Vitest (não é spec): 13 builds reais do site, em sequência,
 * antes de qualquer teste, para os testes da camada fictícia e do vazamento.
 *
 * Na raiz REAL do projeto (dados/dono.json de hoje):
 *  - comFicticio — local + PUBLIC_DADOS_FICTICIOS=true: o site cheio, com a
 *    faixa e noindex,nofollow em toda página;
 *  - semFicticio — local, flag desligada: o build que o caçador de vazamento
 *    varre. Fica por último na raiz real para o cache de conteúdo terminar no
 *    estado real.
 *
 * Em RAÍZES DE TESTE (cópia de src/, public/, dados/ e da config, com o
 * dados/dono.json trocado; node_modules por links), para os testes não
 * dependerem do quanto o dono já preencheu:
 *  - producaoComFlagVazio — raiz "vazia" (empresa e privacidade vazias),
 *    CONTEXT=production + flag: a camada é IGNORADA (aviso) e o build FALHA na
 *    trava da Política, porque dado fictício nunca satisfaz o launch blocker;
 *  - producaoComFlag / producaoSemFlag — raiz "preenchida" (empresa e
 *    privacidade com dado de teste válido), CONTEXT=production com e sem a
 *    flag: os dois passam e o dist tem de ser byte a byte igual;
 *  - localComFlag — raiz "preenchida", local, flag ligada e SEM --outDir: o
 *    build vai para dist-ficticio/ e nunca para dist/ (a pasta publicada);
 *  - producaoComPixels — raiz "preenchida" com baseAnuncios = "consentimento"
 *    e os dois pixels de anúncio (B346 LinkedIn Insight Tag, B347 Meta Pixel)
 *    em privacidade.pixels, CONTEXT=production sem a flag: é o caminho que o
 *    dono liga preenchendo o ID (aviso com data-*-id, CSP e os itens da
 *    Política), ou a trava que derruba o build enquanto o copy da Política
 *    não existir nos 3 idiomas (tests/unit/dados-pixels.test.ts).
 *
 * ATAQUES (cada um numa raiz "preenchida" própria, CONTEXT=production com a
 * flag ligada — o pior caso — e SEM --outDir, isto é, escrevendo no dist/
 * publicado), para provar a trava ponta a ponta:
 *  - cssUrl / newUrl — url() de CSS (num .css fora de src/, que a varredura
 *    de cópia não confere) e new URL(`…/${x}.png`, import.meta.url) apontando
 *    para dados/ficticio/: o Vite resolve os dois por dentro (sem resolveId),
 *    a camada 1 pega no transform; o dist/ não fica;
 *  - leituraPorFs — frontmatter lê o dono.ficticio.json por fs com o caminho
 *    montado em tempo de execução: passa da camada 1, a camada 2 (varredura do
 *    dist/) pega e APAGA o dist/;
 *  - falhaNoPrerender — página que lança erro no meio do build: o dist/
 *    parcial (chunks de .prerender) é apagado na saída do processo;
 *  - copiasNoProjeto — PNG fictício com 1 byte a mais em public/, tela
 *    fictícia recodificada para JPG em public/, avatar recodificado em
 *    dados/imagens/ e o dono.ficticio.json copiado para src/config/: o build
 *    cai antes de começar (astro:config:setup);
 *  - outDirPorLink — local, flag ligada, --outDir out com out → dist (link
 *    simbólico): o build vai para dist-ficticio/ e dist/ fica vazio.
 *
 * Cada build leva ~3 s. Saídas em node_modules/.cache/lemamon-testes/; raízes
 * de teste no diretório temporário do sistema, apagadas no fim. Todos os
 * builds usam o número de WhatsApp de TESTE (o do E2E), para o resultado não
 * depender do .env.local de quem roda.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type FabricaSharp from "sharp";
import type { TestProject } from "vitest/node";

export interface ResultadoDoBuild {
  outDir: string;
  /** Código de saída do `astro build` (0 = ok). */
  status: number | null;
  /** stdout + stderr. */
  saida: string;
}

export interface BuildSemOutDir extends ResultadoDoBuild {
  /** <raiz>/dist existe depois do build. */
  criouDist: boolean;
  /** <raiz>/dist-ficticio/index.html existe depois do build. */
  criouDistFicticio: boolean;
  /** <raiz>/dist-ficticio/index.html tem noindex,nofollow. */
  distFicticioComNoindex: boolean;
}

export interface Ataque extends ResultadoDoBuild {
  /** Raiz de teste do ataque (apagada no fim). */
  raiz: string;
  /** <raiz>/dist existe depois do build. */
  distExiste: boolean;
  /** Quantos arquivos ficaram em <raiz>/dist (seguindo link). */
  arquivosNoDist: number;
  /** <raiz>/dist-ficticio/index.html existe depois do build. */
  distFicticioExiste: boolean;
}

export interface BuildsDosDados {
  semFicticio: ResultadoDoBuild;
  comFicticio: ResultadoDoBuild;
  producaoComFlagVazio: ResultadoDoBuild;
  producaoComFlag: ResultadoDoBuild;
  producaoSemFlag: ResultadoDoBuild;
  localComFlag: BuildSemOutDir;
  producaoComPixels: ResultadoDoBuild;
  ataques: {
    cssUrl: Ataque;
    newUrl: Ataque;
    leituraPorFs: Ataque;
    falhaNoPrerender: Ataque;
    copiasNoProjeto: Ataque;
    outDirPorLink: Ataque;
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    buildsDosDados: BuildsDosDados;
  }
}

const ROOT = process.cwd();
export const PASTA_DOS_BUILDS = join(ROOT, "node_modules", ".cache", "lemamon-testes");

/** sharp (dependência do Astro), por require a partir da raiz: para gerar imagens recodificadas nos testes. */
export function carregarSharp(): typeof FabricaSharp {
  const modulo = createRequire(join(ROOT, "package.json"))("sharp") as { default?: unknown };
  return (modulo.default ?? modulo) as typeof FabricaSharp;
}

/** Número de WhatsApp de TESTE (o mesmo do E2E, playwright.config.ts): nunca o real. */
export const WHATSAPP_DE_TESTE = "5548900000000";

/** Dado de teste VÁLIDO e com cara de real (nunca "Exemplo"): só nas raízes de teste. */
export const EMPRESA_DE_TESTE = { razaoSocial: "Razão Social de Teste Ltda", cnpj: "11.444.777/0001-61", responsavel: "Responsável de Teste" };

type Doc = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** dono.json com empresa e privacidade VAZIAS (a trava da Política tem de segurar). */
export function donoVazio(real: Doc): Doc {
  const doc = structuredClone(real);
  Object.assign(doc.empresa, { razaoSocial: "", cnpj: "", responsavel: "" });
  const p = doc.privacidade;
  p.baseAnuncios = null;
  p.encarregado = null;
  for (const prazo of Object.keys(p.prazos)) p.prazos[prazo] = null;
  p.atualizadaEm = "";
  return doc;
}

/** dono.json com empresa e privacidade preenchidas com dado de teste válido (a trava libera). */
export function donoPreenchido(real: Doc): Doc {
  const doc = structuredClone(real);
  Object.assign(doc.empresa, EMPRESA_DE_TESTE);
  const p = doc.privacidade;
  p.baseAnuncios = "legitimo_interesse";
  p.encarregado = "pequeno_porte";
  p.remarketing = false;
  for (const prazo of Object.keys(p.prazos)) p.prazos[prazo] = { pt: "12 meses", en: "12 months", es: "12 meses" };
  p.atualizadaEm = "2026-10-19";
  return doc;
}

/** IDs de TESTE dos pixels (só dígitos, nunca de uma conta real): só nas raízes de teste. */
export const PIXELS_DE_TESTE = { linkedin: "1234567", meta: "123456789012345" } as const;
/** Prazos de TESTE dos pixels (aparecem na Política do build com pixels). */
export const PRAZOS_DOS_PIXELS_DE_TESTE = {
  linkedin: { pt: "180 dias", en: "180 days", es: "180 días" },
  meta: { pt: "90 dias", en: "90 days", es: "90 días" },
} as const;

/** dono.json "preenchido" + consentimento + os dois pixels de anúncio com ID e prazo (B346/B347). */
export function donoComPixels(real: Doc): Doc {
  const doc = donoPreenchido(real);
  doc.privacidade.baseAnuncios = "consentimento";
  doc.privacidade.pixels = {
    linkedin: { id: PIXELS_DE_TESTE.linkedin, prazo: { ...PRAZOS_DOS_PIXELS_DE_TESTE.linkedin } },
    meta: { id: PIXELS_DE_TESTE.meta, prazo: { ...PRAZOS_DOS_PIXELS_DE_TESTE.meta } },
  };
  return doc;
}

/** Cópia do projeto para uma raiz de teste, com outro dados/dono.json. */
function criarRaiz(base: string, nome: string, dono: Doc): string {
  const raiz = join(base, nome);
  mkdirSync(raiz, { recursive: true });
  for (const item of ["astro.config.mjs", "tsconfig.json", "package.json", "src", "public", "dados"]) {
    cpSync(join(ROOT, item), join(raiz, item), { recursive: true });
  }
  writeFileSync(join(raiz, "dados", "dono.json"), `${JSON.stringify(dono, null, 2)}\n`);
  // node_modules por links, menos os caches (cada raiz tem o seu cache de conteúdo).
  mkdirSync(join(raiz, "node_modules"));
  for (const entrada of readdirSync(join(ROOT, "node_modules"))) {
    if ([".astro", ".cache", ".vite", ".vite-temp"].includes(entrada)) continue;
    symlinkSync(join(ROOT, "node_modules", entrada), join(raiz, "node_modules", entrada));
  }
  return raiz;
}

function build(
  nome: string,
  env: Record<string, string>,
  opcoes: { raiz?: string; outDir?: string | null; argOutDir?: string } = {},
): ResultadoDoBuild {
  const raiz = opcoes.raiz ?? ROOT;
  const outDir = opcoes.outDir === null ? join(raiz, "dist") : (opcoes.outDir ?? join(PASTA_DOS_BUILDS, nome));
  if (opcoes.outDir !== null) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(PASTA_DOS_BUILDS, { recursive: true });
  // Ambiente limpo: nada de CONTEXT nem de flag herdados do terminal, e nada do
  // Vitest (NODE_ENV=test faria o build rodar com import.meta.env.PROD = false).
  const herdado = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !["CONTEXT", "PUBLIC_DADOS_FICTICIOS", "NODE_ENV", "TEST", "MODE"].includes(key) && !key.startsWith("VITEST"),
    ),
  );
  const destino = opcoes.argOutDir ?? (opcoes.outDir === null ? null : outDir);
  const args = [join(ROOT, "node_modules", "astro", "bin", "astro.mjs"), "build", ...(destino === null ? [] : ["--outDir", destino])];
  const result = spawnSync(process.execPath, args, {
    cwd: raiz,
    env: { ...herdado, PUBLIC_GA4_ID: "", PUBLIC_WHATSAPP_NUMBER: WHATSAPP_DE_TESTE, ...env },
    encoding: "utf8",
    timeout: 240_000,
  });
  return { outDir, status: result.status, saida: `${result.stdout ?? ""}\n${result.stderr ?? ""}` };
}

function contarArquivos(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((total, nome) => {
    const caminho = join(dir, nome);
    return total + (statSync(caminho).isDirectory() ? contarArquivos(caminho) : 1);
  }, 0);
}

/** Um ataque: raiz "preenchida" própria, preparada por `preparar`, e o build dela. */
function ataque(
  base: string,
  nome: string,
  real: Doc,
  preparar: (raiz: string) => void | Promise<void>,
  opcoes: { env?: Record<string, string>; argOutDir?: string } = {},
): Promise<Ataque> {
  return (async () => {
    const raiz = criarRaiz(base, `ataque-${nome}`, donoPreenchido(real));
    await preparar(raiz);
    const resultado = build(`ataque-${nome}`, opcoes.env ?? { CONTEXT: "production", PUBLIC_DADOS_FICTICIOS: "true" }, {
      raiz,
      outDir: null,
      argOutDir: opcoes.argOutDir,
    });
    return {
      ...resultado,
      raiz,
      distExiste: existsSync(join(raiz, "dist")),
      arquivosNoDist: contarArquivos(join(raiz, "dist")),
      distFicticioExiste: existsSync(join(raiz, "dist-ficticio", "index.html")),
    };
  })();
}

/** Acrescenta um import ao frontmatter da Home da raiz de teste. */
function importarNaHome(raiz: string, linha: string): void {
  const pagina = join(raiz, "src", "pages", "index.astro");
  const original = readFileSync(pagina, "utf8");
  writeFileSync(pagina, original.replace('import HomeView from "@/views/HomeView.astro";', `import HomeView from "@/views/HomeView.astro";\n${linha}`));
}

/** Acrescenta um trecho ao fim de uma página da raiz de teste. */
function acrescentar(raiz: string, pagina: string, trecho: string): void {
  appendFileSync(join(raiz, "src", "pages", pagina), `\n${trecho}\n`);
}

async function ataques(base: string, real: Doc): Promise<BuildsDosDados["ataques"]> {
  const sharp = carregarSharp();
  const tela = join(ROOT, "dados", "ficticio", "imagens", "tela-exemplo-sistema-de-fretes.png");
  const avatar = join(ROOT, "dados", "ficticio", "imagens", "pessoa-ana-exemplo.svg");
  // CSS fora de src/ (a varredura de cópia confere src/, public/ e dados/): só a camada 1 vê o url().
  const cssUrl = await ataque(base, "css-url", real, (raiz) => {
    mkdirSync(join(raiz, "estilos"));
    writeFileSync(join(raiz, "estilos", "fundo.css"), '.x{background:url("../dados/ficticio/imagens/capa-exemplo-sistema-de-fretes.png")}\n');
    importarNaHome(raiz, 'import "../../estilos/fundo.css";');
  });
  // Template literal: nenhum nome de arquivo fictício no código, só a pasta (o Vite vira glob).
  const newUrl = await ataque(base, "new-url", real, (raiz) =>
    acrescentar(
      raiz,
      "index.astro",
      "<script>const nome = document.title ? 'a' : 'b'; const u = new URL(`../../dados/ficticio/imagens/${nome}.png`, import.meta.url); console.log(u.href);</script>",
    ),
  );
  const leituraPorFs = await ataque(base, "leitura-por-fs", real, (raiz) => {
    const pagina = join(raiz, "src", "pages", "index.astro");
    const original = readFileSync(pagina, "utf8");
    writeFileSync(
      pagina,
      original.replace(
        'import HomeView from "@/views/HomeView.astro";',
        'import HomeView from "@/views/HomeView.astro";\nimport { readFileSync } from "node:fs";\nimport { join } from "node:path";\n' +
          'const arquivo = ["dono", "fict" + "icio", "json"].join(".");\n' +
          'const dado = JSON.parse(readFileSync(join(process.cwd(), "dados", arquivo), "utf8"));',
      ) + "\n<p>{dado.time[0].nome}</p>\n",
    );
  });
  const falhaNoPrerender = await ataque(base, "falha-no-prerender", real, (raiz) =>
    writeFileSync(join(raiz, "src", "pages", "zz-falha.astro"), '---\nthrow new Error("falha proposital do teste");\n---\n<p>x</p>\n'),
  );
  const copiasNoProjeto = await ataque(base, "copias-no-projeto", real, async (raiz) => {
    writeFileSync(join(raiz, "public", "capa-projeto.png"), Buffer.concat([readFileSync(tela), Buffer.from([0])]));
    writeFileSync(join(raiz, "public", "tela.jpg"), await sharp(readFileSync(tela)).jpeg({ quality: 82 }).toBuffer());
    writeFileSync(join(raiz, "dados", "imagens", "joana.png"), await sharp(readFileSync(avatar)).png({ compressionLevel: 9 }).toBuffer());
    cpSync(join(ROOT, "dados", "dono.ficticio.json"), join(raiz, "src", "config", "demo.json"));
  });
  const outDirPorLink = await ataque(
    base,
    "outdir-por-link",
    real,
    (raiz) => {
      mkdirSync(join(raiz, "dist"));
      symlinkSync(join(raiz, "dist"), join(raiz, "out"));
    },
    { env: { PUBLIC_DADOS_FICTICIOS: "true" }, argOutDir: "out" },
  );
  return { cssUrl, newUrl, leituraPorFs, falhaNoPrerender, copiasNoProjeto, outDirPorLink };
}

export default async function setup(project: TestProject): Promise<() => void> {
  const real = JSON.parse(readFileSync(join(ROOT, "dados", "dono.json"), "utf8")) as Doc;
  const raizes = mkdtempSync(join(tmpdir(), "lemamon-raizes-"));

  const vazia = criarRaiz(raizes, "vazia", donoVazio(real));
  const producaoComFlagVazio = build("dist-producao-com-flag-vazio", { CONTEXT: "production", PUBLIC_DADOS_FICTICIOS: "true" }, { raiz: vazia });

  const preenchida = criarRaiz(raizes, "preenchida", donoPreenchido(real));
  const producaoComFlag = build("dist-producao-com-flag", { CONTEXT: "production", PUBLIC_DADOS_FICTICIOS: "true" }, { raiz: preenchida });
  const producaoSemFlag = build("dist-producao-sem-flag", { CONTEXT: "production", PUBLIC_DADOS_FICTICIOS: "false" }, { raiz: preenchida });
  const local = build("local-com-flag", { PUBLIC_DADOS_FICTICIOS: "true" }, { raiz: preenchida, outDir: null });
  const indexFicticio = join(preenchida, "dist-ficticio", "index.html");
  const localComFlag: BuildSemOutDir = {
    ...local,
    outDir: join(preenchida, "dist-ficticio"),
    criouDist: existsSync(join(preenchida, "dist")),
    criouDistFicticio: existsSync(indexFicticio),
    distFicticioComNoindex: existsSync(indexFicticio) && readFileSync(indexFicticio, "utf8").includes('content="noindex,nofollow"'),
  };

  const comPixels = criarRaiz(raizes, "com-pixels", donoComPixels(real));
  const producaoComPixels = build("dist-producao-com-pixels", { CONTEXT: "production", PUBLIC_DADOS_FICTICIOS: "false" }, { raiz: comPixels });

  const atacados = await ataques(raizes, real);

  const comFicticio = build("dist-com-ficticio", { PUBLIC_DADOS_FICTICIOS: "true" });
  const semFicticio = build("dist-sem-ficticio", { PUBLIC_DADOS_FICTICIOS: "false" });

  project.provide("buildsDosDados", {
    semFicticio,
    comFicticio,
    producaoComFlagVazio,
    producaoComFlag,
    producaoSemFlag,
    localComFlag,
    producaoComPixels,
    ataques: atacados,
  });
  return () => rmSync(raizes, { recursive: true, force: true });
}
