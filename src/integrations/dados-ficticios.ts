/**
 * Integração da CAMADA DE DADOS FICTÍCIOS (dono: gated). Ativação e trava.
 *
 * 1. Antes de tudo (astro:config:setup, que roda antes do astro sync/check e de
 *    qualquer import do JSON):
 *    a. lê dados/dono.json com erro de SINTAXE em pt-BR (arquivo, linha,
 *       coluna, motivo: src/config/json-do-dono.ts);
 *    b. CÓPIA da camada no dado real derruba o build, em qualquer modo
 *       (copiasDaCamadaFicticia): todo arquivo de src/, public/ e dados/ (fora
 *       da própria camada e de uma lista curta de arquivos que DESCREVEM a
 *       camada) é conferido contra os valores de identidade e os distintivos
 *       do dono.ficticio.json, os valores e frases dos MDX fictícios, os nomes
 *       e textos das imagens fictícias, a estrutura do dono.ficticio.json
 *       (JSON copiado para fora de dados/) e o CONTEÚDO das imagens fictícias:
 *       janelas de bytes crus (pega cópia com bytes a mais ou a menos, em
 *       qualquer arquivo, binário ou texto, e em base64) e semelhança
 *       perceptual (pega imagem recodificada, convertida, redimensionada ou
 *       recortada);
 *    c. aplica a regra de src/config/camada-ficticia.ts — PUBLIC_DADOS_FICTICIOS=true
 *       E fora de produção (CONTEXT ≠ production) — e registra o módulo virtual
 *       `virtual:lemamon/dados-ficticios`:
 *         - ligada: exporta ATIVO = true e as seções de dados/dono.ficticio.json;
 *         - desligada: exporta ATIVO = false e nada mais;
 *       pedida em produção: ignorada, com aviso no log do build;
 *    d. desligada: CAMADA 1 da trava (plugin Vite `lemamon:dados-ficticios`):
 *         - resolveId/load: import que resolve para dados/dono.ficticio.json ou
 *           para dentro de dados/ficticio/ (inclusive ?raw, ?inline, ?url e
 *           import.meta.glob) derruba o build;
 *         - transform: código de src/ (.astro, .css, .js, .ts, .mdx...) que CITA
 *           a camada fora de comentário derruba o build. É o que pega url() de
 *           CSS e new URL(…, import.meta.url), que o Vite resolve por dentro,
 *           sem passar por resolveId/load;
 *         - generateBundle: asset ou chunk que veio da camada derruba o build.
 *       O que escapa disso (caminho montado em tempo de execução, leitura por
 *       fs no frontmatter) cai na camada 2, depois do build;
 *    e. ligada fora de deploy preview/branch deploy do Netlify: o build vai
 *       para dist-ficticio/, nunca para dist/ (a pasta que o Netlify publica).
 *       A comparação é pelo caminho REAL (link simbólico para dist/ conta como
 *       dist/), e a variável tem de vir do ambiente do processo (painel do
 *       Netlify), não de um .env local.
 * 2. Durante o build: dist/.build-incompleto marca a saída até a conferência
 *    final passar. Build que FALHA (aqui ou em qualquer outro ponto) apaga a
 *    pasta de saída: nunca sobra material de build reprovado para um deploy
 *    manual.
 * 3. Depois do build (astro:build:done), CAMADA 2 — confere a pasta gerada:
 *      - desligada: nenhum marcador fictício (nomes, CNPJ, textos, frases dos
 *        MDX, slugs, a classe e o atributo da faixa, noindex,nofollow) em
 *        nenhum arquivo nem nome de arquivo, e nenhuma imagem fictícia —
 *        idêntica, com bytes a mais ou a menos, em base64 ou parecida
 *        (recodificada para webp/jpg, redimensionada, recortada);
 *      - ligada: TODA página tem a faixa (role="note") e o robots noindex,nofollow.
 *    Qualquer problema apaga a saída e derruba o build.
 *
 * 4. Mídia do dono que não é imagem (vídeo e legendas do depoimento em vídeo,
 *    src/content/midia.ts): o HTML cita /_midia/<nome>.<hash>.<ext>; no build,
 *    a integração copia para <saída>/_midia/ só o que é citado (ANTES da
 *    camada 2, que confere os bytes), procurando em dados/ — sem a camada,
 *    dados/ficticio/ fica de fora e a mídia citada que só existe lá derruba o
 *    build; no `astro dev`, o plugin serve /_midia/ (com Range).
 *
 * As funções de marcadores, cópia, imagem e varredura são exportadas para os
 * testes (tests/unit/dados-vazamento.test.ts, dados-validacao.test.ts,
 * dados-camada-ficticia.test.ts).
 */

import { createHash } from "node:crypto";
import {
  copyFileSync,
  createReadStream,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { basename, dirname, extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { AstroIntegration } from "astro";
import type { Sharp, SharpOptions } from "sharp";
import { loadEnv, type Plugin } from "vite";

import { EXTENSAO_DE_MIDIA, nomePublicoDaMidia, PASTA_DE_MIDIA, PREFIXO_DE_MIDIA, TIPO_DE_MIDIA } from "../content/midia";
import {
  ATRIBUTO_FAIXA,
  CLASSE_FAIXA,
  CONTEXTOS_DE_PREVIEW,
  decidirCamadaFicticia,
  flagLigada,
  PASTA_SAIDA_FICTICIA,
  ROBOTS_FICTICIO,
  type DecisaoDaCamada,
} from "../config/camada-ficticia";
import { lerJsonDoDono } from "../config/json-do-dono";

export const MODULO_VIRTUAL = "virtual:lemamon/dados-ficticios";
const RESOLVIDO = `\0${MODULO_VIRTUAL}`;

/** Caminhos, relativos à raiz do projeto. */
export const ARQUIVO_REAL = "dados/dono.json";
export const ARQUIVO_FICTICIO = "dados/dono.ficticio.json";
export const PASTA_FICTICIA = "dados/ficticio";
const ARQUIVO_SCHEMA = "dados/dono.schema.json";
/** Pastas conferidas atrás de cópia da camada (todo arquivo, texto ou binário). */
const PASTAS_CONFERIDAS = ["src", "public", "dados"];

/**
 * Arquivos que DESCREVEM a camada (caminhos, marcas, regras de texto de
 * exemplo) e por isso citam valores dela de propósito. Ficam fora da busca
 * por cópia; o resto de src/, public/ e dados/ é conferido.
 */
export const DESCREVEM_A_CAMADA = [
  "src/config/camada-ficticia.ts",
  "src/integrations/dados-ficticios.ts",
  "src/content/loaders.ts",
  "src/content/schemas.ts",
] as const;

/** Arquivo que marca uma saída de build não conferida (apagado quando a conferência passa). */
export const ARQUIVO_SENTINELA = ".build-incompleto";
const TEXTO_SENTINELA =
  "Build incompleto ou reprovado na trava dos dados do dono. NÃO publique esta pasta: apague-a e rode o build de novo " +
  "(docs/playbooks/00-DADOS-DO-DONO.md, Parte C).\n";

/** Aviso do build quando a camada é pedida em produção. */
export const AVISO_PRODUCAO =
  "PUBLIC_DADOS_FICTICIOS=true IGNORADO: este é um build de produção (CONTEXT=production). " +
  "A camada fictícia (dados/dono.ficticio.json e dados/ficticio/) nunca entra em produção; o site usa só dados/dono.json.";

/** Aviso do build quando a camada está ligada. */
export const AVISO_ATIVA =
  "CAMADA DE DADOS FICTÍCIOS LIGADA (PUBLIC_DADOS_FICTICIOS=true): dados/dono.ficticio.json e dados/ficticio/ " +
  'preenchem o que está vazio em dados/dono.json. Toda página leva a faixa "Dados fictícios — não publicar" e noindex,nofollow. NÃO publique este build.';

/** Aviso quando o build fictício é desviado do dist/ publicado. */
export const AVISO_SAIDA =
  `build fictício em ${PASTA_SAIDA_FICTICIA}/: dist/ é a pasta que o Netlify publica e nunca recebe build fictício ` +
  "(deploy manual de dist/ local é proibido: docs/playbooks/00-DADOS-DO-DONO.md, Parte C)";

/** Decide pela variável e pelo CONTEXT do Netlify (local = sem CONTEXT). */
export function decidirPeloAmbiente(env: { flag: unknown; contexto: string | undefined }): DecisaoDaCamada {
  return decidirCamadaFicticia({ flag: env.flag, producao: env.contexto === "production" });
}

// --- caminhos reais (links simbólicos) e a pasta publicada ------------------------------

/**
 * Caminho REAL: resolve links simbólicos — inclusive link QUEBRADO (out → dist
 * antes de dist existir), seguindo o destino — e, do ancestral mais próximo
 * que existe, acrescenta o resto (a pasta não precisa existir; nada é criado).
 */
export function caminhoReal(caminho: string): string {
  let atual = resolve(caminho);
  const resto: string[] = [];
  for (let saltos = 0; saltos < 64; saltos += 1) {
    try {
      return join(realpathSync(atual), ...resto);
    } catch {
      // não existe (ainda) ou é link quebrado
    }
    try {
      if (lstatSync(atual).isSymbolicLink()) {
        atual = resolve(dirname(atual), readlinkSync(atual));
        continue;
      }
    } catch {
      // não existe: sobe para o pai
    }
    const pai = dirname(atual);
    if (pai === atual) return join(atual, ...resto);
    resto.unshift(basename(atual));
    atual = pai;
  }
  return resolve(caminho);
}

/** O caminho (real) é a pasta publicada <raiz>/dist ou fica dentro dela? */
export function dentroDaPastaPublicada(caminho: string, root: string): boolean {
  const publicada = caminhoReal(join(root, "dist"));
  const real = caminhoReal(caminho);
  return real === publicada || real.startsWith(publicada + sep);
}

/**
 * Para onde vai um build: com a camada ligada, uma saída que é (pelo caminho
 * real) a pasta publicada <raiz>/dist, ou fica dentro dela, vira
 * <raiz>/dist-ficticio. null = não muda: camada desligada, --outDir explícito
 * para outra pasta, ou deploy preview/branch deploy do Netlify com a variável
 * no ambiente do processo (painel do Netlify). Num contexto de preview com a
 * variável só num arquivo .env (build local imitando o Netlify), a saída
 * também é desviada. dist-ficticio/ que aponta para dist/ derruba o build.
 */
export function saidaDoBuildFicticio(opcoes: {
  ativa: boolean;
  contexto: string | undefined;
  outDir: string;
  root: string;
  /** A variável veio do ambiente do processo (e não só de um .env)? Padrão: sim. */
  flagNoProcesso?: boolean;
}): string | null {
  if (!opcoes.ativa) return null;
  if (previewDoNetlify(opcoes.contexto, opcoes.flagNoProcesso)) return null;
  if (!dentroDaPastaPublicada(opcoes.outDir, opcoes.root)) return null;
  const saida = resolve(opcoes.root, PASTA_SAIDA_FICTICIA);
  if (dentroDaPastaPublicada(saida, opcoes.root)) {
    throw new Error(
      `[dados] ${PASTA_SAIDA_FICTICIA}/ aponta para dist/ (link simbólico): o build fictício cairia na pasta publicada. ` +
        `Apague ${PASTA_SAIDA_FICTICIA} e rode de novo.`,
    );
  }
  return saida;
}

function previewDoNetlify(contexto: string | undefined, flagNoProcesso: boolean | undefined): boolean {
  return CONTEXTOS_DE_PREVIEW.includes(contexto ?? "") && flagNoProcesso !== false;
}

/**
 * Pode apagar esta saída de build? Só pasta dentro do projeto (ou a publicada,
 * mesmo por link), nunca a raiz, um ancestral dela nem pasta com cara de
 * projeto (package.json, src/, dados/, .git).
 */
export function podeApagarSaida(pasta: string, root: string): boolean {
  const real = caminhoReal(pasta);
  const raiz = caminhoReal(root);
  if (real === raiz || raiz.startsWith(real + sep) || dirname(real) === real) return false;
  if (["package.json", "src", "dados", ".git"].some((nome) => existsSync(join(real, nome)))) return false;
  return dentroDaPastaPublicada(real, root) || real.startsWith(raiz + sep);
}

/** Apaga a saída de um build reprovado (com as guardas de podeApagarSaida). true = apagou. */
export function apagarSaida(pasta: string, root: string): boolean {
  if (!existsSync(pasta) || !podeApagarSaida(pasta, root)) return false;
  rmSync(caminhoReal(pasta), { recursive: true, force: true });
  return true;
}

// --- o módulo virtual e a camada 1 (plugin Vite) ---------------------------------------

function lerArquivoJson(root: string, arquivo: string): unknown {
  const caminho = join(root, arquivo);
  if (!existsSync(caminho)) {
    throw new Error(`[dados] ${arquivo} não existe. Ele é obrigatório: restaure o arquivo (a estrutura está em dados/dono.schema.json).`);
  }
  return lerJsonDoDono(readFileSync(caminho, "utf8"), arquivo);
}

/** Código do módulo virtual. Desligada: nenhum byte do arquivo fictício. */
export function codigoDoModulo(ativa: boolean, root: string): string {
  if (!ativa) return "export const ATIVO = false;\nexport const secoes = {};\n";
  const { $schema: _schema, ...secoes } = lerArquivoJson(root, ARQUIVO_FICTICIO) as Record<string, unknown>;
  return `export const ATIVO = true;\nexport const secoes = ${JSON.stringify(secoes)};\n`;
}

/** O id (resolvido) aponta para a camada fictícia? Ignora ?raw, ?inline, ?url, \0 e /@fs. */
export function idDaCamadaFicticia(id: string, root: string): boolean {
  const limpo = id.replace(/^\0/, "").split("?")[0]!.replace(/^\/@fs(?=\/)/, "");
  if (!limpo || !isAbsolute(limpo)) return false;
  const caminho = normalize(limpo);
  return raizesDe(root).some((raiz) => {
    const arquivo = resolve(raiz, ARQUIVO_FICTICIO);
    const pasta = resolve(raiz, PASTA_FICTICIA);
    return caminho === arquivo || caminho === pasta || caminho.startsWith(pasta + sep);
  });
}

const RAIZES = new Map<string, string[]>();

/** A raiz como foi passada e o caminho real dela (ex.: /tmp → /private/tmp no macOS). */
function raizesDe(root: string): string[] {
  let raizes = RAIZES.get(root);
  if (!raizes) {
    const conjunto = new Set([resolve(root)]);
    try {
      conjunto.add(realpathSync(root));
    } catch {
      // raiz que não existe no disco (testes): fica só a resolvida
    }
    raizes = [...conjunto];
    RAIZES.set(root, raizes);
  }
  return raizes;
}

/** Caminho de um asset (absoluto ou relativo à raiz) dentro da camada? */
function origemDaCamada(arquivo: string, root: string): boolean {
  return idDaCamadaFicticia(isAbsolute(arquivo) ? arquivo : resolve(root, arquivo), root);
}

/** Código sem comentários (de bloco, de HTML e, fora de CSS, de linha). */
export function semComentarios(codigo: string, arquivo = ""): string {
  const semBloco = codigo.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  if (/\.(css|scss|sass|less|styl)$/.test(arquivo) || /[?&]lang\.css\b|[?&]type=style\b/.test(arquivo)) return semBloco;
  // "//" depois de ":" ou de outra "/" é URL (https://, file:///), não comentário.
  return semBloco.replace(/(^|[^:"'`\\/])\/\/.*$/gm, "$1");
}

/** Citação da camada no código (caminho da pasta ou do arquivo fictício). */
const CITA_A_CAMADA = /dados\/ficticio\b|dono\.ficticio\.json/;
const CODIGO_CONFERIDO = /\.(astro|css|scss|sass|less|styl|mdx?|[cm]?[jt]sx?|html|svelte|vue)$/;

/**
 * O módulo `id` é código do projeto que CITA a camada fora de comentário?
 * Fora: node_modules, os dois leitores da camada (por fs) e os testes.
 */
export function codigoCitaACamada(codigo: string, id: string, root: string): boolean {
  const limpo = id.replace(/^\0/, "").split("?")[0]!.replace(/^\/@fs(?=\/)/, "");
  if (!limpo || !isAbsolute(limpo) || limpo.includes(`${sep}node_modules${sep}`) || !CODIGO_CONFERIDO.test(limpo)) return false;
  const raiz = raizesDe(root).find((r) => limpo.startsWith(r + sep));
  if (!raiz) return false;
  const rotulo = relative(raiz, limpo).split(sep).join("/");
  if (rotulo === "src/integrations/dados-ficticios.ts" || rotulo === "src/content/loaders.ts") return false;
  if (rotulo.startsWith("tests/") || /\.(test|spec)\.[cm]?[jt]sx?$/.test(rotulo)) return false;
  return CITA_A_CAMADA.test(semComentarios(codigo, id));
}

/** Caminho relativo à raiz (pela raiz como foi passada ou pela real, a que casar). */
function rotuloDe(root: string, caminho: string): string {
  const limpo = caminho.replace(/^\0/, "").split("?")[0]!.replace(/[/\\]+$/, "");
  const raiz = raizesDe(root).find((r) => limpo === r || limpo.startsWith(r + sep)) ?? root;
  return relative(raiz, limpo).split(sep).join("/");
}

function mensagemDeImport(root: string, id: string, importador?: string): string {
  const quem = importador ? ` (em ${rotuloDe(root, importador)})` : "";
  return (
    `[dados] import de dado fictício com a camada DESLIGADA: ${rotuloDe(root, id)}${quem}. ` +
    "O código nunca importa dados/dono.ficticio.json nem dados/ficticio/ (nem com ?raw, ?inline, ?url ou import.meta.glob): " +
    "a camada entra só pelo módulo virtual e pelos loaders, e só com PUBLIC_DADOS_FICTICIOS=true fora de produção."
  );
}

function mensagemDeCitacao(root: string, id: string): string {
  return (
    `[dados] ${rotuloDe(root, id)} cita a camada fictícia (dados/ficticio/ ou dono.ficticio.json) com ela DESLIGADA. ` +
    "Nada de url() de CSS, new URL(…, import.meta.url), src/href ou caminho de arquivo apontando para a camada: " +
    "imagem e texto reais moram em dados/dono.json e dados/imagens/."
  );
}

function mensagemDeAsset(root: string, saida: string, origens: readonly string[]): string {
  return (
    `[dados] o build ia publicar ${saida}, que veio da camada fictícia (${origens.map((o) => rotuloDe(root, isAbsolute(o) ? o : resolve(root, o))).join(", ")}) ` +
    "com ela DESLIGADA. Troque pela imagem ou pelo texto real (dados/imagens/, dados/dono.json)."
  );
}

// --- mídia do dono que não é imagem (vídeo e legenda) ----------------------------------

/**
 * Mídia que o site pode servir em /_midia/: todo .mp4/.webm/.vtt de dados/,
 * pelo nome público (nome.hash.ext). Sem a camada, dados/ficticio/ fica de
 * fora: mídia fictícia citada num build sem a camada não é encontrada.
 */
export function midiasDoDono(root: string, ativa: boolean): Map<string, string> {
  const mapa = new Map<string, string>();
  const camada = resolve(root, PASTA_FICTICIA);
  for (const caminho of arquivos(join(root, "dados"))) {
    if (!EXTENSAO_DE_MIDIA.test(caminho)) continue;
    if (!ativa && (caminho === camada || caminho.startsWith(camada + sep))) continue;
    mapa.set(nomePublicoDaMidia(caminho, readFileSync(caminho)), caminho);
  }
  return mapa;
}

const MIDIA_CITADA = new RegExp(`${PREFIXO_DE_MIDIA.replace(/\//g, "\\/")}([A-Za-z0-9._-]+)`, "g");

/**
 * Copia para <dist>/_midia/ a mídia que algum HTML cita. Devolve os problemas
 * (mídia citada que não existe em dados/, ou que só existe na camada fictícia
 * desligada). Vazio = ok.
 */
export function copiarMidiaCitada(dist: string, root: string, ativa: boolean): { copiadas: string[]; problemas: string[] } {
  const citadas = new Set<string>();
  for (const caminho of arquivos(dist).filter((arquivo) => arquivo.endsWith(".html"))) {
    for (const casou of readFileSync(caminho, "utf8").matchAll(MIDIA_CITADA)) citadas.add(casou[1] as string);
  }
  if (citadas.size === 0) return { copiadas: [], problemas: [] };
  const mapa = midiasDoDono(root, ativa);
  const copiadas: string[] = [];
  const problemas: string[] = [];
  for (const nome of [...citadas].sort()) {
    const origem = mapa.get(nome);
    if (!origem) {
      problemas.push(
        `${PREFIXO_DE_MIDIA}${nome}: citada no HTML, mas não existe em dados/` +
          (ativa ? "" : " (com a camada fictícia desligada, a mídia de dados/ficticio/ nunca é publicada)"),
      );
      continue;
    }
    mkdirSync(join(dist, PASTA_DE_MIDIA), { recursive: true });
    copyFileSync(origem, join(dist, PASTA_DE_MIDIA, nome));
    copiadas.push(nome);
  }
  return { copiadas, problemas };
}

/** Middleware do `astro dev`: serve /_midia/<nome> de dados/ (com Range: o Safari só toca vídeo assim). */
function servirMidia(root: string, ativa: boolean) {
  return (
    req: { url?: string; headers: Record<string, string | string[] | undefined> },
    res: { statusCode: number; setHeader(nome: string, valor: string | number): void; end(corpo?: string): void },
    next: () => void,
  ) => {
    const url = (req.url ?? "").split("?")[0] ?? "";
    if (!url.startsWith(PREFIXO_DE_MIDIA)) return next();
    const caminho = midiasDoDono(root, ativa).get(decodeURIComponent(url.slice(PREFIXO_DE_MIDIA.length)));
    if (!caminho) {
      res.statusCode = 404;
      res.end("mídia não encontrada em dados/");
      return;
    }
    const tamanho = statSync(caminho).size;
    res.setHeader("Content-Type", TIPO_DE_MIDIA[extname(caminho).toLowerCase()] ?? "application/octet-stream");
    res.setHeader("Accept-Ranges", "bytes");
    const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range ?? ""));
    let inicio = 0;
    let fim = tamanho - 1;
    if (range && (range[1] || range[2])) {
      inicio = range[1] ? Number(range[1]) : Math.max(0, tamanho - Number(range[2]));
      fim = range[1] && range[2] ? Math.min(Number(range[2]), tamanho - 1) : tamanho - 1;
      if (inicio > fim || inicio >= tamanho) {
        res.statusCode = 416;
        res.setHeader("Content-Range", `bytes */${tamanho}`);
        res.end();
        return;
      }
      res.statusCode = 206;
      res.setHeader("Content-Range", `bytes ${inicio}-${fim}/${tamanho}`);
    }
    res.setHeader("Content-Length", fim - inicio + 1);
    createReadStream(caminho, { start: inicio, end: fim }).pipe(res as unknown as NodeJS.WritableStream);
  };
}

/** Plugin Vite da camada (módulo virtual + camada 1 da trava + sentinela da saída + /_midia/ no dev). */
export function pluginDosDadosFicticios(
  ativa: boolean,
  root: string,
  sentinela: () => string | null = () => null,
): Plugin {
  const real = resolve(root, ARQUIVO_REAL);
  return {
    name: "lemamon:dados-ficticios",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use(servirMidia(root, ativa));
    },
    buildStart() {
      const pasta = sentinela();
      if (!pasta) return;
      mkdirSync(pasta, { recursive: true });
      writeFileSync(join(pasta, ARQUIVO_SENTINELA), TEXTO_SENTINELA);
    },
    async resolveId(source, importer, options) {
      if (source === MODULO_VIRTUAL) return RESOLVIDO;
      if (ativa || source.startsWith("\0") || source.startsWith("virtual:") || source.startsWith("astro:")) return null;
      const resolvido = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (resolvido && idDaCamadaFicticia(resolvido.id, root)) this.error(mensagemDeImport(root, resolvido.id, importer));
      return null;
    },
    load(id) {
      if (id === RESOLVIDO) {
        if (ativa) this.addWatchFile(join(root, ARQUIVO_FICTICIO));
        return codigoDoModulo(ativa, root);
      }
      if (!ativa && idDaCamadaFicticia(id, root)) this.error(mensagemDeImport(root, id));
      return null;
    },
    // Antes do vite:json (erro de sintaxe do dono.json em pt-BR também no `astro dev`)
    // e antes do vite:css/vite:asset-import-meta-url (url() e new URL() que citam a camada).
    transform(code, id) {
      if (id.split("?")[0] === real) lerJsonDoDono(code, ARQUIVO_REAL);
      if (!ativa && codigoCitaACamada(code, id, root)) this.error(mensagemDeCitacao(root, id));
      return null;
    },
    generateBundle(_opcoes, bundle) {
      if (ativa) return;
      for (const saida of Object.values(bundle)) {
        if (saida.type === "asset") {
          const daCamada = (saida.originalFileNames ?? []).filter((origem) => origemDaCamada(origem, root));
          if (daCamada.length) this.error(mensagemDeAsset(root, saida.fileName, daCamada));
        } else {
          const daCamada = (saida.moduleIds ?? Object.keys(saida.modules ?? {})).filter((id) => idDaCamadaFicticia(id, root));
          if (daCamada.length) this.error(mensagemDeAsset(root, saida.fileName, daCamada));
        }
      }
    },
  };
}

// --- marcadores do que é fictício ----------------------------------------------

/** Campos de identidade: o valor inteiro é marcador (nome, empresa, CNPJ, e-mail, URL...). */
const CAMPOS_DE_IDENTIDADE = new Set([
  "id",
  "nome",
  "empresa",
  "cliente",
  "razaoSocial",
  "cnpj",
  "email",
  "url",
  "link",
  "linkedin",
  "github",
  "fornecedor",
  "responsavel",
  "autorizadoPor",
  "registro",
  "caseSlug",
]);
const CAMPOS_DE_IMAGEM = new Set(["foto", "arquivo", "src"]);
const TEXTO_MARCADO = /exemplo|ejemplo|example|fict[ií]ci|fictitious/i;
/** Identificador ou enum ("tier_2", "legitimo_interesse", "BRL", datas): não distingue nada. */
const IDENTIFICADOR = /^[a-z0-9_.:/-]+$/i;
const EXTENSAO_DE_IMAGEM = /\.(png|jpe?g|webp|avif|gif|tiff?|bmp|heic|heif|svg)$/i;

/**
 * Valor fictício DISTINTIVO: tem "exemplo/example/ejemplo/fictício" ou é um
 * texto de 16+ caracteres que não é identificador/enum. Igual a um valor do
 * dono.json real = cópia da camada (derruba o build). Ids e enums curtos
 * (tier_*, BRL, legitimo_interesse) coincidem por definição e são ignorados.
 */
export function valorDistintivo(valor: string): boolean {
  const texto = valor.trim();
  if (TEXTO_MARCADO.test(texto)) return texto.length >= 6;
  return texto.length >= 16 && !(IDENTIFICADOR.test(texto) && !texto.includes("://"));
}

type Caminho = (string | number)[];

function caminhoLegivel(path: Caminho): string {
  return path.reduce<string>((acc, key) => (typeof key === "number" ? `${acc}[${key}]` : acc ? `${acc}.${key}` : key), "");
}

/** Todo texto do JSON, com o caminho (sem $schema). */
function textosDoJson(no: unknown, path: Caminho = [], saida: [Caminho, string][] = []): [Caminho, string][] {
  if (typeof no === "string") saida.push([path, no.trim()]);
  else if (Array.isArray(no)) no.forEach((item, index) => textosDoJson(item, [...path, index], saida));
  else if (no && typeof no === "object") {
    for (const [chave, valor] of Object.entries(no)) if (chave !== "$schema") textosDoJson(valor, [...path, chave], saida);
  }
  return saida;
}

function arquivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho];
  });
}

/** Frontmatter e corpo de um MDX. */
function partesDoMdx(texto: string): { frontmatter: string; corpo: string } {
  const casou = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(texto);
  return casou ? { frontmatter: casou[1] ?? "", corpo: casou[2] ?? "" } : { frontmatter: "", corpo: texto };
}

/** Todos os valores de texto do frontmatter (entre aspas, em lista ou sem aspas). */
export function valoresDoFrontmatter(frontmatter: string): string[] {
  const valores: string[] = [];
  for (const casou of frontmatter.matchAll(/"((?:[^"\\]|\\.)*)"/g)) valores.push((casou[1] ?? "").replace(/\\"/g, '"'));
  for (const casou of frontmatter.matchAll(/'((?:[^'\\]|\\.)*)'/g)) valores.push(casou[1] ?? "");
  for (const linha of frontmatter.split("\n")) {
    const semAspas = /^\s*(?:-\s+)?[\w]+:\s+([^"'[{#\s][^#]*?)\s*$/.exec(linha)?.[1];
    if (semAspas && !/^(?:true|false|null|-?\d+(?:\.\d+)?)$/.test(semAspas)) valores.push(semAspas);
  }
  return valores.map((valor) => valor.trim()).filter(Boolean);
}

/**
 * Trechos do corpo de um MDX que saem iguais no HTML: o texto é cortado em
 * frases e em todo caractere que a renderização pode trocar (aspas e
 * apóstrofos viram curvos, "--" e "..." viram traço e reticências, ênfase e
 * links viram tags). Só trechos de 24+ caracteres.
 */
export function trechosDoCorpo(corpo: string): string[] {
  return corpo
    .replace(/<[^>]*>/g, "\n")
    .split(/\n+|(?<=[.!?:;])\s+|["'`*_[\]()<>{}#|‘’“”]|--|\.\.\./)
    .map((trecho) => trecho.replace(/\s+/g, " ").trim())
    .filter((trecho) => trecho.length >= 24);
}

/** Texto visível de um SVG (rótulos e <text>/<title>), para achar o SVG embutido. */
function textosDoSvg(svg: string): string[] {
  const saida: string[] = [];
  for (const casou of svg.matchAll(/\b(?:aria-label|title)="([^"]+)"/g)) saida.push(casou[1] ?? "");
  for (const casou of svg.matchAll(/<(?:text|title)\b[^>]*>([^<]+)</g)) saida.push(casou[1] ?? "");
  return saida.map((texto) => texto.trim()).filter((texto) => texto.length >= 6);
}

// --- imagens fictícias: hash, janelas de bytes e base64 ----------------------------------

/** Tamanho de uma janela de bytes crus. */
const JANELA = 48;
/** Posições examinadas por imagem (espalhadas pelo arquivo, longe do cabeçalho). */
const POSICOES_POR_IMAGEM = 64;
/** Janelas guardadas por imagem (as de bytes mais variados, espalhadas). */
const JANELAS_POR_IMAGEM = 16;
/** Janela só conta com bytes variados (dado comprimido): cabeçalho, sequência repetida e texto nunca. */
const BYTES_DISTINTOS_POR_JANELA = 32;

/**
 * Janelas de 48 bytes crus, de alta entropia (32+ valores distintos), espalhadas
 * pelo arquivo (fora dos 64 primeiros e dos 32 últimos bytes, que se repetem
 * entre arquivos do mesmo formato). Qualquer uma dentro de outro arquivo é
 * cópia — com bytes a mais, a menos, metadado trocado ou embutida noutro arquivo.
 */
export function janelasDeBytes(bytes: Buffer): Buffer[] {
  const inicio = 64;
  const fim = bytes.length - 32 - JANELA;
  if (fim <= inicio) return [];
  const passo = (fim - inicio) / (POSICOES_POR_IMAGEM - 1);
  const boas: Buffer[] = [];
  for (let indice = 0; indice < POSICOES_POR_IMAGEM; indice += 1) {
    const deslocamento = Math.round(inicio + indice * passo);
    const janela = bytes.subarray(deslocamento, deslocamento + JANELA);
    if (new Set(janela).size >= BYTES_DISTINTOS_POR_JANELA) boas.push(Buffer.from(janela));
  }
  if (boas.length <= JANELAS_POR_IMAGEM) return boas;
  const salto = boas.length / JANELAS_POR_IMAGEM;
  return Array.from({ length: JANELAS_POR_IMAGEM }, (_, indice) => boas[Math.floor(indice * salto)]!);
}

/**
 * A mesma janela em base64 (data: URL), nos 3 alinhamentos possíveis: com
 * bytes a mais ou a menos antes dela, o alinhamento de 3 bytes muda.
 */
function base64DaJanela(janela: Buffer): string[] {
  return [0, 1, 2].map((desvio) => janela.subarray(desvio, desvio + 45).toString("base64"));
}

/** Pedaço do meio de um arquivo de TEXTO (SVG), para o caso de virar base64. */
function janelaDoMeio(bytes: Buffer): Buffer | null {
  if (bytes.length < 96) return null;
  const inicio = Math.floor(bytes.length / 2) - JANELA / 2;
  return bytes.subarray(inicio, inicio + JANELA);
}

export interface ImagemFicticia {
  /** Relativo à raiz (dados/ficticio/imagens/...). */
  arquivo: string;
  sha256: string;
  /** Janelas de bytes crus (vazio para SVG, que é texto). */
  janelas: Buffer[];
  /** As janelas (ou o meio do SVG) em base64, nos 3 alinhamentos. */
  base64: string[];
}

const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

/** Arquivos de TEXTO da camada além dos MDX (SVG, legendas WebVTT): conferidos pelo meio em base64. */
const ARQUIVO_DE_TEXTO_DA_CAMADA = /\.(svg|vtt)$/i;

/** Imagens e mídia da camada (dados/ficticio/**, menos os MDX), com hash, janelas e base64. */
export function imagensFicticias(root: string): ImagemFicticia[] {
  return arquivos(join(root, PASTA_FICTICIA))
    .filter((arquivo) => !/\.mdx?$/.test(arquivo))
    .map((arquivo) => {
      const bytes = readFileSync(arquivo);
      const texto = ARQUIVO_DE_TEXTO_DA_CAMADA.test(arquivo);
      const janelas = texto ? [] : janelasDeBytes(bytes);
      const meio = texto ? janelaDoMeio(bytes) : null;
      const base64 = [...janelas, ...(meio ? [meio] : [])].flatMap(base64DaJanela);
      return { arquivo: relative(root, arquivo).split(sep).join("/"), sha256: sha256(bytes), janelas, base64 };
    });
}

/** Cópia por bytes (idêntica ou com uma janela da imagem fictícia dentro). null = nada. */
function copiaPorBytes(bytes: Buffer, imagens: readonly ImagemFicticia[]): string | null {
  const hash = sha256(bytes);
  for (const imagem of imagens) {
    if (imagem.sha256 === hash) return `conteúdo idêntico a ${imagem.arquivo}`;
    const iguais = imagem.janelas.filter((janela) => bytes.includes(janela)).length;
    if (iguais > 0) return `bytes de ${imagem.arquivo} (${iguais}/${imagem.janelas.length} janelas)`;
  }
  return null;
}

// --- imagens fictícias: semelhança perceptual -------------------------------------------

type FabricaSharp = (entrada?: Buffer, opcoes?: SharpOptions) => Sharp;
const SHARP = new Map<string, FabricaSharp | null>();

/**
 * sharp (dependência do Astro para imagens), por require a partir da raiz do
 * projeto. Nada de import() dinâmico: a config do Astro roda no module runner
 * do Vite, que já está fechado quando os hooks rodam. null = não carregou.
 */
function carregarSharp(root: string): FabricaSharp | null {
  if (!SHARP.has(root)) {
    let fabrica: FabricaSharp | null = null;
    for (const base of [join(root, "package.json"), fileURLToPath(import.meta.url)]) {
      try {
        const modulo = createRequire(base)("sharp") as { default?: unknown };
        fabrica = (modulo.default ?? modulo) as FabricaSharp;
        break;
      } catch {
        // tenta a próxima base
      }
    }
    SHARP.set(root, fabrica);
  }
  return SHARP.get(root) ?? null;
}

/** Pixels da grade de comparação: ~32×32, na proporção da imagem. */
const AREA_DA_GRADE = 1024;
/** Escalas do recorte procurado (1 = largura inteira; 0,8 = 80% da largura da original). */
const ESCALAS_DE_RECORTE = [1, 0.97, 0.94, 0.91, 0.88, 0.85, 0.82, 0.8];
/** O recorte cobre pelo menos 60% da área da original (tira estreita nunca conta). */
const AREA_MINIMA_DO_RECORTE = 0.6;
/** Abaixo disso na grade grossa, a posição nem é refinada. */
const LIMIAR_DE_REFINO = 0.85;
/** Imagem quase lisa (desvio-padrão da grade < 8 tons) não tem forma para comparar. */
const DESVIO_MINIMO = 8;
/**
 * Correlação (NCC, -1 a 1) da imagem em tons de cinza com a fictícia, inteira
 * ou como recorte. Medido: recodificar (jpg/webp, inclusive a saída do Astro),
 * redimensionar, clarear, tirar a cor ou cortar a faixa EXEMPLO dá ≥ 0,98;
 * 1.157 imagens reais (ícones, fotos, telas, gradientes) ficaram ≤ 0,91.
 * (dHash 9×8 foi descartado: a webp que o próprio Astro gera de uma tela
 * fictícia fica a 14–16 bits da original, e logo liso em fundo branco tem
 * quase todos os bits zerados, o que acusaria logo real.)
 */
export const LIMIAR_DE_SEMELHANCA = 0.95;

interface ImagemCinza {
  png: Buffer;
  largura: number;
  altura: number;
}

interface Referencia extends ImagemCinza {
  arquivo: string;
  amostras: Map<string, Float64Array>;
}

interface Candidata extends ImagemCinza {
  cw: number;
  ch: number;
  pixels: Float64Array;
  desvio: number;
}

/** A imagem achatada em fundo branco e em tons de cinza (PNG). null = não é imagem que o sharp lê. */
async function emCinza(sharp: FabricaSharp, bytes: Buffer): Promise<ImagemCinza | null> {
  try {
    const png = await sharp(bytes, { density: 72, limitInputPixels: 2e8, failOn: "none", animated: false })
      .flatten({ background: "#ffffff" })
      .greyscale()
      .png()
      .toBuffer();
    const meta = await sharp(png).metadata();
    if (!meta.width || !meta.height) return null;
    return { png, largura: meta.width, altura: meta.height };
  } catch {
    return null;
  }
}

/** Grade de w×h tons de cinza (um canal), opcionalmente de um recorte. */
async function amostra(
  sharp: FabricaSharp,
  png: Buffer,
  w: number,
  h: number,
  recorte?: { left: number; top: number; width: number; height: number },
): Promise<Float64Array> {
  const base = recorte ? sharp(png).extract(recorte) : sharp(png);
  const { data, info } = await base.resize(w, h, { fit: "fill" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const pixels = new Float64Array(w * h);
  for (let indice = 0; indice < w * h; indice += 1) pixels[indice] = data[indice * info.channels] ?? 0;
  return pixels;
}

/** Correlação normalizada da janela (ox, oy, w×h) de `ref` com `cand`. */
function correlacao(ref: Float64Array, rw: number, cand: Float64Array, w: number, h: number, ox: number, oy: number): number {
  const n = w * h;
  let mediaRef = 0;
  let mediaCand = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      mediaRef += ref[(y + oy) * rw + x + ox]!;
      mediaCand += cand[y * w + x]!;
    }
  }
  mediaRef /= n;
  mediaCand /= n;
  let produto = 0;
  let somaRef = 0;
  let somaCand = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const a = ref[(y + oy) * rw + x + ox]! - mediaRef;
      const b = cand[y * w + x]! - mediaCand;
      produto += a * b;
      somaRef += a * a;
      somaCand += b * b;
    }
  }
  return somaRef < 1e-6 || somaCand < 1e-6 ? 0 : produto / Math.sqrt(somaRef * somaCand);
}

function desvioPadrao(pixels: Float64Array): number {
  let media = 0;
  for (const valor of pixels) media += valor;
  media /= pixels.length;
  let soma = 0;
  for (const valor of pixels) soma += (valor - media) ** 2;
  return Math.sqrt(soma / pixels.length);
}

async function amostraDaReferencia(sharp: FabricaSharp, ref: Referencia, w: number, h: number): Promise<Float64Array> {
  const chave = `${w}x${h}`;
  let pixels = ref.amostras.get(chave);
  if (!pixels) {
    pixels = await amostra(sharp, ref.png, w, h);
    ref.amostras.set(chave, pixels);
  }
  return pixels;
}

async function candidataDe(sharp: FabricaSharp, bytes: Buffer): Promise<Candidata | null> {
  const cinza = await emCinza(sharp, bytes);
  if (!cinza) return null;
  const cw = Math.max(2, Math.round(Math.sqrt((AREA_DA_GRADE * cinza.largura) / cinza.altura)));
  const ch = Math.max(2, Math.round(Math.sqrt((AREA_DA_GRADE * cinza.altura) / cinza.largura)));
  const pixels = await amostra(sharp, cinza.png, cw, ch);
  return { ...cinza, cw, ch, pixels, desvio: desvioPadrao(pixels) };
}

/**
 * Semelhança (0 a 1) da candidata com a referência: a maior correlação entre
 * a imagem inteira (mesma proporção, ±3%) e qualquer recorte de 80% a 100% da
 * largura da referência (≥ 60% da área), refinado em resolução cheia.
 *
 * Para no primeiro valor que chega a `bastante` (padrão: o limiar): quem chama
 * só decide se a candidata passa do limiar, e a resposta é a mesma de buscar o
 * máximo. Sem a parada, a candidata que É a referência (toda webp/jpg que o
 * Astro gera da camada) refinava as 8 escalas, até 75 amostras em resolução
 * cheia cada, e o custo crescia com o número de imagens da camada (D45).
 */
async function semelhanca(sharp: FabricaSharp, ref: Referencia, cand: Candidata, bastante = LIMIAR_DE_SEMELHANCA): Promise<number> {
  if (cand.desvio < DESVIO_MINIMO || cand.cw < 4 || cand.ch < 4) return 0;
  let melhor = 0;
  const razao = cand.largura / cand.altura / (ref.largura / ref.altura);
  if (razao > 0.97 && razao < 1.03) {
    melhor = correlacao(await amostraDaReferencia(sharp, ref, cand.cw, cand.ch), cand.cw, cand.pixels, cand.cw, cand.ch, 0, 0);
    if (melhor >= bastante) return melhor;
  }
  for (const escala of ESCALAS_DE_RECORTE) {
    const rw = Math.round(cand.cw / escala);
    const rh = Math.max(2, Math.round((rw * ref.altura) / ref.largura));
    if (cand.ch > rh || (cand.cw * cand.ch) / (rw * rh) < AREA_MINIMA_DO_RECORTE) continue;
    const grade = await amostraDaReferencia(sharp, ref, rw, rh);
    let nota = -1;
    let bx = 0;
    let by = 0;
    for (let oy = 0; oy + cand.ch <= rh; oy += 1) {
      for (let ox = 0; ox + cand.cw <= rw; ox += 1) {
        const valor = correlacao(grade, rw, cand.pixels, cand.cw, cand.ch, ox, oy);
        if (valor > nota) [nota, bx, by] = [valor, ox, oy];
      }
    }
    melhor = Math.max(melhor, nota);
    if (melhor >= bastante) return melhor;
    if (nota < LIMIAR_DE_REFINO || nota >= 0.999) continue;
    // Refino em resolução cheia: posição em quartos de pixel da grade e escala ±1,5%.
    const fx = ref.largura / rw;
    const fy = ref.altura / rh;
    const cx = (bx + cand.cw / 2) * fx;
    const cy = (by + cand.ch / 2) * fy;
    for (const fator of [0.985, 1, 1.015]) {
      for (const dy of [-0.5, -0.25, 0, 0.25, 0.5]) {
        for (const dx of [-0.5, -0.25, 0, 0.25, 0.5]) {
          const width = Math.round(cand.cw * fx * fator);
          const height = Math.round(cand.ch * fy * fator);
          const left = Math.round(cx + dx * fx - width / 2);
          const top = Math.round(cy + dy * fy - height / 2);
          if (left < 0 || top < 0 || width < 2 || height < 2 || left + width > ref.largura || top + height > ref.altura) continue;
          const pixels = await amostra(sharp, ref.png, cand.cw, cand.ch, { left, top, width, height });
          melhor = Math.max(melhor, correlacao(pixels, cand.cw, cand.pixels, cand.cw, cand.ch, 0, 0));
          if (melhor >= bastante) return melhor;
        }
      }
    }
  }
  return melhor;
}

const REFERENCIAS = new Map<string, Promise<Referencia[]>>();

/** As imagens da camada prontas para comparar (cache por raiz e pelo conteúdo). */
function referenciasPerceptuais(sharp: FabricaSharp, root: string): Promise<Referencia[]> {
  const imagens = imagensFicticias(root).filter((imagem) => EXTENSAO_DE_IMAGEM.test(imagem.arquivo));
  const chave = `${root}|${imagens.map((imagem) => imagem.sha256).join(",")}`;
  let referencias = REFERENCIAS.get(chave);
  if (!referencias) {
    referencias = Promise.all(
      imagens.map(async (imagem) => {
        const cinza = await emCinza(sharp, readFileSync(join(root, imagem.arquivo)));
        return cinza ? { ...cinza, arquivo: imagem.arquivo, amostras: new Map<string, Float64Array>() } : null;
      }),
    ).then((lista) => lista.filter((ref): ref is Referencia => ref !== null));
    REFERENCIAS.set(chave, referencias);
  }
  return referencias;
}

const ASSINATURAS_DE_IMAGEM: [number[], number][] = [
  [[0x89, 0x50, 0x4e, 0x47], 0], // PNG
  [[0xff, 0xd8, 0xff], 0], // JPEG
  [[0x47, 0x49, 0x46, 0x38], 0], // GIF
  [[0x57, 0x45, 0x42, 0x50], 8], // RIFF....WEBP
  [[0x66, 0x74, 0x79, 0x70], 4], // ftyp (AVIF/HEIC)
  [[0x49, 0x49, 0x2a, 0x00], 0], // TIFF
  [[0x4d, 0x4d, 0x00, 0x2a], 0], // TIFF
  [[0x42, 0x4d], 0], // BMP
];

/** É imagem (pela extensão ou pelos primeiros bytes, para extensão trocada)? */
export function pareceImagem(caminho: string, bytes: Buffer): boolean {
  if (EXTENSAO_DE_IMAGEM.test(caminho)) return true;
  return ASSINATURAS_DE_IMAGEM.some(([assinatura, inicio]) => assinatura.every((byte, indice) => bytes[inicio + indice] === byte));
}

export interface ImagemParecida {
  /** Rótulo do arquivo conferido (como o chamador passou). */
  arquivo: string;
  /** Imagem fictícia de origem (dados/ficticio/imagens/...). */
  origem: string;
  /** Semelhança (0 a 1), ≥ LIMIAR_DE_SEMELHANCA: a primeira que passou do limiar, não necessariamente a máxima. */
  nota: number;
}

/**
 * Imagens parecidas com uma da camada (recodificadas, convertidas,
 * redimensionadas, sem cor ou recortadas). `lista` = [rótulo, caminho].
 * Sem o sharp a comparação não roda e a função lança erro: o build cai (nunca
 * passa em silêncio).
 */
export async function imagensParecidas(lista: readonly [string, string][], root: string): Promise<ImagemParecida[]> {
  const candidatas = lista.filter(([, caminho]) => {
    const tamanho = statSync(caminho).size;
    return tamanho > 0 && tamanho < 25 * 1024 * 1024 && pareceImagem(caminho, readFileSync(caminho).subarray(0, 16));
  });
  if (!candidatas.length) return [];
  const sharp = carregarSharp(root);
  if (!sharp) {
    throw new Error(
      "[dados] a conferência de imagens fictícias precisa do sharp (dependência do Astro para imagens), que não carregou. " +
        "Rode `yarn install`; sem ela, o build não sabe se uma imagem recodificada da camada fictícia vai ao ar.",
    );
  }
  const referencias = await referenciasPerceptuais(sharp, root);
  const achados: ImagemParecida[] = [];
  for (const [rotulo, caminho] of candidatas) {
    const cand = await candidataDe(sharp, readFileSync(caminho));
    if (!cand) continue;
    // Nome que começa com o de uma imagem da camada (o Astro gera "capa-x.<hash>_<variante>.webp"): compara com
    // ela primeiro e, se passar do limiar, as outras não mudam a resposta. Sem essa dica (toda imagem real), compara
    // com todas, como sempre.
    const nome = basename(caminho);
    const dica = referencias.find((ref) => nome.startsWith(`${basename(ref.arquivo, extname(ref.arquivo))}.`));
    const ordem = dica ? [dica, ...referencias.filter((ref) => ref !== dica)] : referencias;
    let melhor: ImagemParecida | null = null;
    for (const ref of ordem) {
      const nota = await semelhanca(sharp, ref, cand);
      if (nota >= LIMIAR_DE_SEMELHANCA && (!melhor || nota > melhor.nota)) melhor = { arquivo: rotulo, origem: ref.arquivo, nota };
      if (melhor && ref === dica) break;
    }
    if (melhor) achados.push(melhor);
  }
  return achados;
}

// --- marcadores (texto) -------------------------------------------------------------

/** Mesmo texto como sai no HTML (o Astro escapa &, <, >, aspas e apóstrofo). */
function variantes(valor: string): string[] {
  const html = valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return html === valor ? [valor] : [valor, html];
}

/** Valores de texto do dono.json real (para não acusar id/enum que coincide por definição). */
function textosReais(root: string): Set<string> {
  return new Set(existsSync(join(root, ARQUIVO_REAL)) ? textosDoJson(lerArquivoJson(root, ARQUIVO_REAL)).map(([, valor]) => valor) : []);
}

/** Marcadores (sem variantes) do dono.ficticio.json: identidade, imagens e todo valor distintivo → caminho de origem. */
function marcadoresDoJson(root: string): Map<string, string> {
  const saida = new Map<string, string>();
  if (!existsSync(join(root, ARQUIVO_FICTICIO))) return saida;
  const reais = textosReais(root);
  for (const [path, valor] of textosDoJson(lerArquivoJson(root, ARQUIVO_FICTICIO))) {
    if (!valor) continue;
    const chave = [...path].reverse().find((parte) => typeof parte === "string") ?? "";
    let marcador: string | null = null;
    if (CAMPOS_DE_IMAGEM.has(chave) && EXTENSAO_DE_IMAGEM.test(valor)) marcador = basename(valor, extname(valor));
    else if (valorDistintivo(valor)) marcador = valor;
    else if (CAMPOS_DE_IDENTIDADE.has(chave) && valor.length >= 6) marcador = valor;
    // Só um valor NÃO distintivo igual a um do dono.json real (ids, enums) é descartado.
    // Valor distintivo igual ao real é cópia: fica como marcador E derruba o build (copiasDaCamadaFicticia).
    if (marcador && !(reais.has(valor) && !valorDistintivo(valor)) && !saida.has(marcador)) {
      saida.set(marcador, `${ARQUIVO_FICTICIO} › ${caminhoLegivel(path)}`);
    }
  }
  return saida;
}

/** Marcadores dos MDX fictícios: nome do arquivo, todo valor do frontmatter e as frases do corpo → arquivo de origem. */
function marcadoresDosMdx(root: string): Map<string, string> {
  const saida = new Map<string, string>();
  for (const arquivo of arquivos(join(root, PASTA_FICTICIA)).filter((nome) => /\.mdx?$/.test(nome))) {
    const rotulo = relative(root, arquivo).split(sep).join("/");
    const { frontmatter, corpo } = partesDoMdx(readFileSync(arquivo, "utf8"));
    const anotar = (marcador: string) => {
      if (!saida.has(marcador)) saida.set(marcador, rotulo);
    };
    for (const valor of valoresDoFrontmatter(frontmatter)) {
      if (EXTENSAO_DE_IMAGEM.test(valor)) anotar(basename(valor, extname(valor)));
      else if (valorDistintivo(valor)) anotar(valor);
    }
    for (const trecho of trechosDoCorpo(corpo)) anotar(trecho);
  }
  return saida;
}

/**
 * Marcadores de CÓPIA da camada → de onde vieram: identidade e valores
 * distintivos do dono.ficticio.json, frontmatter e frases dos MDX fictícios,
 * nomes dos arquivos da camada, textos dos SVGs e as imagens em base64. Sem as
 * marcas da faixa (classe, atributo, texto, robots), que o código do site usa
 * de propósito.
 */
export function marcadoresDeCopia(root: string): Map<string, string> {
  const saida = new Map<string, string>(marcadoresDoJson(root));
  for (const [marcador, origem] of marcadoresDosMdx(root)) if (!saida.has(marcador)) saida.set(marcador, origem);
  for (const arquivo of arquivos(join(root, PASTA_FICTICIA))) {
    const rotulo = relative(root, arquivo).split(sep).join("/");
    const nome = basename(arquivo, extname(arquivo));
    if (nome.length >= 6 && !saida.has(nome)) saida.set(nome, rotulo);
    if (arquivo.endsWith(".svg")) {
      for (const texto of textosDoSvg(readFileSync(arquivo, "utf8"))) if (!saida.has(texto)) saida.set(texto, rotulo);
    }
  }
  for (const imagem of imagensFicticias(root)) for (const trecho of imagem.base64) saida.set(trecho, `${imagem.arquivo} (em base64)`);
  return saida;
}

/** Textos da faixa nos 3 idiomas (i18n shared.fictitious_data.banner). */
function textosDaFaixa(root: string): string[] {
  return ["pt", "en", "es"].flatMap((idioma) => {
    const caminho = join(root, "src", "i18n", `${idioma}.json`);
    if (!existsSync(caminho)) return [];
    const copy = JSON.parse(readFileSync(caminho, "utf8")) as { shared?: { fictitious_data?: { banner?: string } } };
    const faixa = copy.shared?.fictitious_data?.banner;
    return faixa ? [faixa] : [];
  });
}

/**
 * Valores distintivos da camada fictícia, derivados dos próprios arquivos
 * (dados/dono.ficticio.json, dados/ficticio/** — MDX e imagens — e a faixa do
 * i18n). Nenhum deles pode aparecer num build sem a camada.
 */
export function marcadoresFicticios(root: string): string[] {
  const saida = new Set<string>([ATRIBUTO_FAIXA, CLASSE_FAIXA, ROBOTS_FICTICIO, ...textosDaFaixa(root)]);
  for (const marcador of marcadoresDeCopia(root).keys()) saida.add(marcador);
  return [...saida].flatMap(variantes);
}

// --- cópia da camada no dado real (src/, public/, dados/) ----------------------------------

const ARQUIVO_DE_CODIGO = /\.(astro|css|scss|sass|less|styl|[cm]?[jt]sx?|svelte|vue)$/;
const AVISO_DE_COPIA = "dado fictício nunca vai ao ar: escreva o dado real ou deixe vazio (docs/playbooks/00-DADOS-DO-DONO.md, Parte C)";

/** Arquivo de texto? (sem byte nulo no começo) */
function ehTexto(bytes: Buffer): boolean {
  return !bytes.subarray(0, 8000).includes(0);
}

/** Texto a conferir de um arquivo real: sem comentários (código) e sem a chave da faixa (i18n). */
function textoConferido(rotulo: string, bytes: Buffer): string {
  const texto = bytes.toString("utf8");
  if (/^src\/i18n\/[a-z]{2}\.json$/.test(rotulo)) {
    try {
      const copy = JSON.parse(texto) as { shared?: Record<string, unknown> };
      if (copy.shared) delete copy.shared.fictitious_data;
      return JSON.stringify(copy);
    } catch {
      return texto;
    }
  }
  return ARQUIVO_DE_CODIGO.test(rotulo) ? semComentarios(texto, rotulo) : texto;
}

/** Caminhos (com [] no lugar de índices) de todas as folhas e nós de um JSON, com 2+ níveis. */
function caminhosDoJson(no: unknown, prefixo = "", saida = new Set<string>()): Set<string> {
  if (Array.isArray(no)) no.forEach((item) => caminhosDoJson(item, `${prefixo}[]`, saida));
  else if (no && typeof no === "object") {
    for (const [chave, valor] of Object.entries(no)) {
      if (chave === "$schema") continue;
      const caminho = prefixo ? `${prefixo}.${chave}` : chave;
      if (prefixo) saida.add(caminho);
      caminhosDoJson(valor, caminho, saida);
    }
  }
  return saida;
}

export interface ReferenciaDeJson {
  caminhos: Set<string>;
  folhas: Set<string>;
}

/** Estrutura e textos do dono.ficticio.json (sem os que coincidem com o dono.json real). */
export function referenciaDoJsonFicticio(root: string): ReferenciaDeJson {
  const ficticio = lerArquivoJson(root, ARQUIVO_FICTICIO);
  const reais = textosReais(root);
  const folhas = new Set(textosDoJson(ficticio).map(([, valor]) => valor).filter((valor) => valor.length >= 4 && !reais.has(valor)));
  return { caminhos: caminhosDoJson(ficticio), folhas };
}

/**
 * Sobreposição de um JSON com o dono.ficticio.json: fração da estrutura dele
 * presente (0 a 1) e quantos textos dele aparecem. Alta = cópia do arquivo
 * fictício (mesmo com os nomes trocados), que nunca mora fora de dados/.
 */
export function sobreposicaoComOFicticio(doc: unknown, referencia: ReferenciaDeJson): { estrutura: number; textos: number } {
  const caminhos = caminhosDoJson(doc);
  let iguais = 0;
  for (const caminho of referencia.caminhos) if (caminhos.has(caminho)) iguais += 1;
  const textos = [...new Set(textosDoJson(doc).map(([, valor]) => valor))].filter((valor) => referencia.folhas.has(valor)).length;
  return { estrutura: referencia.caminhos.size ? iguais / referencia.caminhos.size : 0, textos };
}

/** Arquivos reais conferidos atrás de cópia (fora a camada, o schema do editor, os testes e quem descreve a camada). */
function arquivosReais(root: string): [string, string][] {
  const fora = new Set<string>([ARQUIVO_FICTICIO, ARQUIVO_SCHEMA, ...DESCREVEM_A_CAMADA]);
  return PASTAS_CONFERIDAS.flatMap((pasta) => arquivos(join(root, pasta)))
    .map((caminho): [string, string] => [relative(root, caminho).split(sep).join("/"), caminho])
    .filter(
      ([rotulo]) =>
        !fora.has(rotulo) &&
        !rotulo.startsWith(`${PASTA_FICTICIA}/`) &&
        !/(^|\/)\.gitkeep$|(^|\/)\.DS_Store$/.test(rotulo) &&
        !/\.(test|spec)\.[cm]?[jt]sx?$/.test(rotulo),
    );
}

/**
 * Valor da camada fictícia COPIADO para o dado real. Confere:
 *  - dados/dono.json: todo valor de texto igual a um valor distintivo do
 *    dados/dono.ficticio.json ou do frontmatter de um MDX fictício (com o caminho);
 *  - todo arquivo de TEXTO de src/, public/ e dados/ (código sem comentários):
 *    nomes, CNPJ, e-mails, URLs, slugs, textos distintivos e frases dos MDX da
 *    camada, textos dos SVGs e as imagens em base64;
 *  - todo JSON: estrutura ou textos do dono.ficticio.json (cópia do arquivo
 *    fictício para fora de dados/, mesmo com os nomes trocados);
 *  - todo arquivo, texto ou binário: imagem fictícia idêntica ou com bytes a
 *    mais/a menos (janelas de bytes crus);
 *  - toda imagem: parecida com uma fictícia (recodificada, convertida,
 *    redimensionada, sem cor, recortada).
 * Ficam de fora a própria camada, o dados/dono.schema.json, os testes e
 * DESCREVEM_A_CAMADA (mais a chave shared.fictitious_data do i18n).
 * Lista vazia = nada copiado. Roda em TODO build (com ou sem a camada).
 */
export async function copiasDaCamadaFicticia(root: string): Promise<string[]> {
  const problemas: string[] = [];
  if (!existsSync(join(root, ARQUIVO_FICTICIO))) return problemas;

  // 1. dono.json, valor a valor (mensagem com o caminho dos dois lados).
  const origemDoValor = new Map<string, string>();
  for (const [path, valor] of textosDoJson(lerArquivoJson(root, ARQUIVO_FICTICIO))) {
    if (valorDistintivo(valor) && !origemDoValor.has(valor)) origemDoValor.set(valor, `${ARQUIVO_FICTICIO} › ${caminhoLegivel(path)}`);
  }
  for (const [marcador, origem] of marcadoresDosMdx(root)) if (valorDistintivo(marcador) && !origemDoValor.has(marcador)) origemDoValor.set(marcador, origem);
  const jaNoDono = new Set<string>();
  if (existsSync(join(root, ARQUIVO_REAL))) {
    for (const [path, valor] of textosDoJson(lerArquivoJson(root, ARQUIVO_REAL))) {
      const origem = origemDoValor.get(valor);
      if (origem && valorDistintivo(valor)) {
        jaNoDono.add(valor);
        problemas.push(`${ARQUIVO_REAL} › ${caminhoLegivel(path)}: valor copiado de ${origem} ("${valor.slice(0, 70)}"): ${AVISO_DE_COPIA}`);
      }
    }
  }

  // 2. Todo arquivo real: texto, JSON e bytes.
  const marcadores = [...marcadoresDeCopia(root)].flatMap(([marcador, origem]) => {
    const json = JSON.stringify(marcador).slice(1, -1);
    return (json === marcador ? [marcador] : [marcador, json]).map((variante): [string, string] => [variante, origem]);
  });
  const referencia = referenciaDoJsonFicticio(root);
  const imagens = imagensFicticias(root);
  const reais = arquivosReais(root);
  const jaAcusadas = new Set<string>();
  for (const [rotulo, caminho] of reais) {
    const bytes = readFileSync(caminho);
    const porBytes = copiaPorBytes(bytes, imagens);
    if (porBytes) {
      jaAcusadas.add(rotulo);
      problemas.push(`${rotulo}: imagem copiada (${porBytes}): ${AVISO_DE_COPIA}`);
      continue;
    }
    if (!ehTexto(bytes) || (EXTENSAO_DE_IMAGEM.test(rotulo) && !rotulo.endsWith(".svg"))) continue;
    const texto = textoConferido(rotulo, bytes);
    let achados = 0;
    for (const [marcador, origem] of marcadores) {
      if (achados >= 3) break;
      if (rotulo === ARQUIVO_REAL && jaNoDono.has(marcador)) continue;
      if (texto.includes(marcador)) {
        achados += 1;
        problemas.push(`${rotulo}: trecho copiado de ${origem} ("${marcador.slice(0, 70)}"): ${AVISO_DE_COPIA}`);
      }
    }
    if (rotulo.endsWith(".json") && rotulo !== ARQUIVO_REAL) {
      let doc: unknown = null;
      try {
        doc = JSON.parse(bytes.toString("utf8"));
      } catch {
        // JSON inválido: o build dele (se for importado) já reclama.
      }
      const { estrutura, textos } = sobreposicaoComOFicticio(doc, referencia);
      if (estrutura >= 0.5 || textos >= 5) {
        problemas.push(
          `${rotulo}: cópia de ${ARQUIVO_FICTICIO} (${Math.round(estrutura * 100)}% da estrutura, ${textos} texto(s) iguais). ` +
            `Os dados do dono moram só em ${ARQUIVO_REAL}: ${AVISO_DE_COPIA}`,
        );
      }
    }
  }

  // 3. Imagens parecidas (recodificadas, convertidas, recortadas).
  for (const achado of await imagensParecidas(reais.filter(([rotulo]) => !jaAcusadas.has(rotulo)), root)) {
    problemas.push(
      `${achado.arquivo}: imagem parecida com ${achado.origem} (semelhança ${achado.nota.toFixed(2)}: recodificada, convertida, ` +
        `redimensionada ou recortada): ${AVISO_DE_COPIA}`,
    );
  }
  return problemas;
}

// --- varredura do dist ----------------------------------------------------------------

const ARQUIVO_DE_TEXTO = /\.(html?|js|mjs|css|xml|txt|json|svg|webmanifest|map)$/i;

export interface Achado {
  arquivo: string;
  marcador: string;
}

/**
 * Procura os marcadores no conteúdo de texto e no NOME de todo arquivo do dist
 * e, com `imagens`, imagem fictícia por bytes em TODO arquivo (texto ou
 * binário): idêntica (sha256) ou com uma janela de bytes crus dela dentro.
 */
export function procurarMarcadores(dist: string, marcadores: readonly string[], imagens: readonly ImagemFicticia[] = []): Achado[] {
  const achados: Achado[] = [];
  for (const caminho of arquivos(dist)) {
    const arquivo = relative(dist, caminho).split(sep).join("/");
    for (const marcador of marcadores) {
      if (arquivo.includes(marcador)) achados.push({ arquivo, marcador: `(nome do arquivo) ${marcador}` });
    }
    const bytes = readFileSync(caminho);
    const porBytes = copiaPorBytes(bytes, imagens);
    if (porBytes) achados.push({ arquivo, marcador: `(${porBytes})` });
    if (!ARQUIVO_DE_TEXTO.test(caminho)) continue;
    const texto = bytes.toString("utf8");
    for (const marcador of marcadores) if (texto.includes(marcador)) achados.push({ arquivo, marcador });
  }
  return achados;
}

/** Problemas do dist conforme a camada (vazio = ok). */
export async function conferirDist(dist: string, opcoes: { ativa: boolean; root: string }): Promise<string[]> {
  if (!opcoes.ativa) {
    const achados = procurarMarcadores(dist, marcadoresFicticios(opcoes.root), imagensFicticias(opcoes.root));
    const problemas = achados.map(({ arquivo, marcador }) => `${arquivo}: dado fictício num build sem a camada → "${marcador.slice(0, 80)}"`);
    const acusados = new Set(achados.map(({ arquivo }) => arquivo));
    const lista = arquivos(dist)
      .map((caminho): [string, string] => [relative(dist, caminho).split(sep).join("/"), caminho])
      .filter(([arquivo]) => !acusados.has(arquivo));
    for (const achado of await imagensParecidas(lista, opcoes.root)) {
      problemas.push(`${achado.arquivo}: imagem parecida com ${achado.origem} (semelhança ${achado.nota.toFixed(2)}) num build sem a camada`);
    }
    return problemas;
  }
  const problemas: string[] = [];
  for (const caminho of arquivos(dist).filter((arquivo) => arquivo.endsWith(".html"))) {
    const arquivo = relative(dist, caminho).split(sep).join("/");
    const html = readFileSync(caminho, "utf8");
    if (!new RegExp(`<[^>]+\\b${ATRIBUTO_FAIXA}\\b[^>]*role="note"|<[^>]+role="note"[^>]*\\b${ATRIBUTO_FAIXA}\\b`).test(html)) {
      problemas.push(`${arquivo}: sem a faixa "Dados fictícios — não publicar" (role="note")`);
    }
    if (!html.includes(`<meta name="robots" content="${ROBOTS_FICTICIO}"`)) {
      problemas.push(`${arquivo}: sem <meta name="robots" content="${ROBOTS_FICTICIO}">`);
    }
  }
  return problemas;
}

function falhar(titulo: string, problemas: readonly string[]): never {
  throw new Error(`[dados] ${problemas.length} ${titulo}:\n - ${problemas.slice(0, 40).join("\n - ")}`);
}

export default function dadosFicticios(): AstroIntegration {
  let decisao: DecisaoDaCamada = { ativa: false, ignoradaEmProducao: false };
  let root = process.cwd();
  let contexto: string | undefined;
  let flagNoProcesso = false;
  let saidaDoBuild: string | null = null;
  let construindo = false;
  let saidaRegistrada = false;
  return {
    name: "lemamon:dados-ficticios",
    hooks: {
      "astro:config:setup": async ({ command, config, updateConfig, logger }) => {
        root = fileURLToPath(config.root);
        contexto = process.env.CONTEXT;
        flagNoProcesso = flagLigada(process.env.PUBLIC_DADOS_FICTICIOS);
        // a. Sintaxe do dono.json (antes do sync: o import JSON do Vite falharia em inglês).
        lerArquivoJson(root, ARQUIVO_REAL);
        // b. Cópia da camada no dado real: derruba qualquer build, em qualquer modo.
        const copias = await copiasDaCamadaFicticia(root);
        if (copias.length) falhar("valor(es) copiado(s) de dados/dono.ficticio.json ou de dados/ficticio/", copias);
        // c. Regra da camada.
        const modo = command === "build" ? "production" : "development";
        const env = loadEnv(modo, config.vite.envDir || root, "PUBLIC_");
        decisao = decidirPeloAmbiente({ flag: env.PUBLIC_DADOS_FICTICIOS, contexto });
        if (decisao.ignoradaEmProducao) logger.warn(AVISO_PRODUCAO);
        if (decisao.ativa) {
          lerArquivoJson(root, ARQUIVO_FICTICIO);
          logger.warn(AVISO_ATIVA);
        }
        // e. Build fictício nunca no dist/ publicado (pelo caminho real).
        const saida = saidaDoBuildFicticio({ ativa: decisao.ativa, contexto, outDir: fileURLToPath(config.outDir), root, flagNoProcesso });
        if (saida) {
          logger.warn(AVISO_SAIDA);
          updateConfig({ outDir: pathToFileURL(saida + sep) });
        }
        // d. Módulo virtual + camada 1 da trava + sentinela da saída.
        updateConfig({
          vite: { plugins: [pluginDosDadosFicticios(decisao.ativa, root, () => (construindo ? saidaDoBuild : null))] },
        });
      },
      "astro:config:done": ({ config }) => {
        saidaDoBuild = fileURLToPath(config.outDir);
      },
      "astro:build:start": () => {
        construindo = true;
        if (saidaRegistrada) return;
        saidaRegistrada = true;
        // Build que falha em QUALQUER ponto (prerender, outra integração, aqui) não
        // deixa saída para trás: nada de dist/ meio pronto ou reprovado num deploy manual.
        process.once("exit", (codigo) => {
          if (codigo === 0 || !saidaDoBuild) return;
          if (apagarSaida(saidaDoBuild, root)) {
            // writeSync: no "exit" só dá para escrever de forma síncrona.
            writeSync(2, `[dados] build com falha: ${rotuloDe(root, saidaDoBuild) || saidaDoBuild}/ apagada (saída de build reprovado nunca é publicada).\n`);
          }
        });
      },
      "astro:build:done": async ({ dir, logger }) => {
        const pasta = fileURLToPath(dir);
        const reprovar = (titulo: string, problemas: readonly string[]): never => {
          if (apagarSaida(pasta, root)) logger.error(`${rotuloDe(root, pasta) || pasta}/ apagada: build reprovado nunca fica pronto para deploy.`);
          return falhar(titulo, problemas);
        };
        if (decisao.ativa && dentroDaPastaPublicada(pasta, root) && !previewDoNetlify(contexto, flagNoProcesso)) {
          reprovar("problema da camada fictícia", [`build fictício em dist/ (a pasta publicada) fora de deploy preview: use ${PASTA_SAIDA_FICTICIA}/`]);
        }
        // Mídia do dono citada no HTML (vídeo e legenda): copiada ANTES da varredura,
        // que confere os bytes de tudo que foi para a saída.
        const midia = copiarMidiaCitada(pasta, root, decisao.ativa);
        if (midia.problemas.length) reprovar("mídia citada que não pode ser publicada", midia.problemas);
        if (midia.copiadas.length) logger.info(`mídia do dono em ${PASTA_DE_MIDIA}/: ${midia.copiadas.join(", ")}`);
        const problemas = await conferirDist(pasta, { ativa: decisao.ativa, root });
        if (problemas.length) reprovar("problema(s) da camada fictícia no dist/", problemas);
        const sentinela = join(pasta, ARQUIVO_SENTINELA);
        if (existsSync(sentinela)) unlinkSync(sentinela);
        logger.info(
          decisao.ativa
            ? "camada fictícia: toda página com a faixa e noindex,nofollow"
            : "camada fictícia desligada: nenhum dado fictício no dist/",
        );
      },
    },
  };
}
