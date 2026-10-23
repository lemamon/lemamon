/**
 * Loaders das coleções when_data (dono: gated). SÓ SERVIDOR (fs).
 *
 *  - time, depoimentos, logos → dados/dono.json (seções homônimas). Cada item
 *    tem `id` + os campos do schema; imagens são caminhos relativos a dados/.
 *    Antes do schema do Astro, o item passa pela validação com mensagens em
 *    pt-BR (src/config/validate.ts › colecaoIssues), para o erro dizer qual
 *    campo do dono.json corrigir.
 *  - cases, posts → MDX em src/content/cases/** e src/content/posts/**.
 *
 * Camada fictícia (MODO_FICTICIO, src/config/dono.ts): fora de produção e com
 * PUBLIC_DADOS_FICTICIOS=true, uma lista VAZIA do dono.json é preenchida pela
 * de dados/dono.ficticio.json (nunca mistura real com fictício), e os MDX de
 * dados/ficticio/cases/** e dados/ficticio/posts/** entram nas coleções. Sem a
 * camada, nada disso é lido.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { glob, type Loader, type LoaderContext } from "astro/loaders";

import { ARQUIVO_DONO, MODO_FICTICIO, type SecaoColecao } from "../config/dono";
import { lerJsonDoDono } from "../config/json-do-dono";
import { colecaoIssues } from "../config/validate";
import { exemplosNoCorpo, exemplosNoObjeto, mensagemDeExemplo } from "./schemas";

/**
 * Caminhos da camada fictícia, relativos à raiz. Só este arquivo e a integração
 * (src/integrations/dados-ficticios.ts) leem a camada (por fs); nenhum módulo
 * importa esses arquivos (trava de import na integração e
 * tests/unit/dados-vazamento.test.ts › "nenhum import da camada").
 */
export const ARQUIVO_FICTICIO = "dados/dono.ficticio.json";
export const PASTA_FICTICIA = "dados/ficticio";

/** Um item de lista do dono, como está no JSON. */
export type ItemDoDono = { id: string } & Record<string, unknown>;

export interface ListaDoDono {
  itens: ItemDoDono[];
  /** De onde vieram os itens (relativo à raiz). */
  arquivo: typeof ARQUIVO_DONO | typeof ARQUIVO_FICTICIO;
  ficticia: boolean;
}

function lerJson(root: string, arquivo: string): Record<string, unknown> {
  return lerJsonDoDono(readFileSync(join(root, arquivo), "utf8"), arquivo) as Record<string, unknown>;
}

/**
 * Lista efetiva de uma seção (time, depoimentos, logos): a do dono.json; vazia
 * e com a camada fictícia ligada, a do dono.ficticio.json.
 */
export function listaDoDono(secao: SecaoColecao, root: string = process.cwd(), modoFicticio: boolean = MODO_FICTICIO): ListaDoDono {
  const real = lerJson(root, ARQUIVO_DONO)[secao];
  const itens = Array.isArray(real) ? (real as ItemDoDono[]) : [];
  if (itens.length > 0 || !modoFicticio) return { itens, arquivo: ARQUIVO_DONO, ficticia: false };
  const ficticia = lerJson(root, ARQUIVO_FICTICIO)[secao];
  return { itens: Array.isArray(ficticia) ? (ficticia as ItemDoDono[]) : [], arquivo: ARQUIVO_FICTICIO, ficticia: true };
}

/** Loader de uma lista do dono (time, depoimentos ou logos). */
export function donoLoader(secao: SecaoColecao): Loader {
  return {
    name: `lemamon:dono:${secao}`,
    load: async ({ store, parseData, config, logger, watcher }) => {
      const root = fileURLToPath(config.root);
      const sync = async () => {
        const { itens, arquivo, ficticia } = listaDoDono(secao, root);
        const issues = colecaoIssues(secao, itens, { origem: arquivo, raiz: root, permitirFicticio: ficticia });
        if (issues.length) {
          throw new Error(`[dados] ${issues.length} problema(s) para corrigir:\n - ${issues.join("\n - ")}`);
        }
        store.clear();
        for (const { id, ...data } of itens) {
          const parsed = await parseData({ id, data, filePath: join(root, arquivo) });
          store.set({ id, data: parsed, filePath: arquivo });
        }
        if (itens.length === 0) logger.info(`${secao} vazio em ${ARQUIVO_DONO} (when_data: a flag fica desligada)`);
        else if (ficticia) logger.warn(`${secao}: ${itens.length} item(ns) FICTÍCIO(S) de ${ARQUIVO_FICTICIO}`);
      };
      await sync();
      const observados = [join(root, ARQUIVO_DONO), ...(MODO_FICTICIO ? [join(root, ARQUIVO_FICTICIO)] : [])];
      for (const caminho of observados) watcher?.add(caminho);
      watcher?.on("change", async (mudou) => {
        if (!observados.includes(mudou)) return;
        try {
          await sync();
          logger.info(`${secao} recarregado de ${mudou.slice(root.length + 1)}`);
        } catch (error) {
          logger.error((error as Error).message);
        }
      });
    },
  };
}

/**
 * glob() do Astro, mas com coleção vazia logada como info, não warning: vazio é
 * o estado normal de toda coleção when_data até o dono publicar conteúdo.
 */
export function contentGlob(pattern: string, base: string): Loader {
  const inner = glob({ pattern, base });
  return {
    ...inner,
    name: "lemamon:glob",
    load: (context) => {
      const logger = new Proxy(context.logger, {
        get(target, prop, receiver) {
          if (prop === "warn") {
            return (message: string) =>
              message.startsWith("No files found matching")
                ? target.info(`${message} (when_data vazia: a flag fica desligada)`)
                : target.warn(message);
          }
          const value: unknown = Reflect.get(target, prop, receiver);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
      return inner.load({ ...context, logger });
    },
  };
}

/**
 * Texto de EXEMPLO num MDX real (frontmatter ou corpo): é cópia da camada
 * fictícia e nunca vai ao ar, com ou sem a camada ligada. Lista vazia = ok.
 */
export function exemplosNoMdxReal(arquivo: string, data: unknown, corpo: string | undefined): string[] {
  return [
    ...exemplosNoObjeto(data).map(([path, motivo]) => `${arquivo} › ${path.join(".")}: ${mensagemDeExemplo(motivo)}`),
    ...exemplosNoCorpo(corpo).map(([linha, motivo]) => `${arquivo} (corpo, linha ${linha} do texto): ${mensagemDeExemplo(motivo)}`),
  ];
}

/**
 * MDX do dono (src/content/<coleção>) + MDX fictício (dados/ficticio/<coleção>)
 * só com a camada ligada. O glob real roda primeiro e apaga do cache tudo que
 * não achou (inclusive entradas fictícias de um build anterior); o fictício
 * roda depois com um store que não apaga nada, só acrescenta.
 *
 * Toda entrada REAL passa por exemplosNoMdxReal() antes de entrar no store:
 * um post ou case copiado de dados/ficticio/ ("Conteúdo de exemplo", "(exemplo)",
 * "Exemplo: …", "fictício") derruba o build mesmo com título, slug e autor trocados.
 */
export function globComFicticio(pattern: string, colecao: "cases" | "posts"): Loader {
  const real = contentGlob(pattern, `./src/content/${colecao}`);
  const ficticio = contentGlob(pattern, `./${PASTA_FICTICIA}/${colecao}`);
  return {
    name: `lemamon:glob+ficticio:${colecao}`,
    load: async (context: LoaderContext) => {
      const conferido = new Proxy(context.store, {
        get(target, prop) {
          if (prop === "set") {
            return (entrada: Parameters<typeof target.set>[0]) => {
              const arquivo = entrada.filePath ?? `src/content/${colecao}/${entrada.id}`;
              const problemas = exemplosNoMdxReal(arquivo, entrada.data, entrada.body);
              if (problemas.length) {
                throw new Error(`[dados] ${problemas.length} problema(s) para corrigir:\n - ${problemas.join("\n - ")}`);
              }
              return target.set(entrada);
            };
          }
          const value: unknown = Reflect.get(target, prop, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
      await real.load({ ...context, store: conferido });
      if (!MODO_FICTICIO) return;
      const store = new Proxy(context.store, {
        get(target, prop) {
          if (prop === "keys") return () => [];
          const value: unknown = Reflect.get(target, prop, target);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
      context.logger.warn(`${colecao}: MDX FICTÍCIOS de ${PASTA_FICTICIA}/${colecao} incluídos`);
      await ficticio.load({ ...context, store });
    },
  };
}

/** Há MDX em src/content/<coleção> (e, com a camada, em dados/ficticio/<coleção>)? */
export function temMdx(colecao: "cases" | "posts", root: string = process.cwd(), modoFicticio: boolean = MODO_FICTICIO): boolean {
  const walk = (dir: string): boolean =>
    existsSync(dir) &&
    readdirSync(dir, { withFileTypes: true }).some((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : /\.mdx?$/.test(entry.name)));
  return walk(join(root, "src", "content", colecao)) || (modoFicticio && walk(join(root, PASTA_FICTICIA, colecao)));
}
