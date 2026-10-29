/**
 * Integração (dono: shell): o dev server refaz os mapas de conteúdo que outro
 * processo do Astro sobrescreveu, mas só quando nenhum build está no ar.
 *
 * O PROBLEMA: todo comando do Astro que sincroniza conteúdo (dev, build, check,
 * sync) grava .astro/content-assets.mjs (imagens das coleções: logos, fotos,
 * capas) e .astro/content-modules.mjs (MDX de cases e posts) na raiz do
 * projeto. O build guarda o data-store à parte (node_modules/.astro), mas
 * esses dois mapas não (Astro 7.4). Um build ou check com outro conjunto de
 * dados (o de produção ignora a camada fictícia; o globalSetup do `yarn test`
 * roda dois builds na raiz real) com o dev no ar e PUBLIC_DADOS_FICTICIOS=true
 * esvazia os mapas, e toda página com imagem da camada cai em
 * LocalImageUsedWrongly até reiniciar o dev.
 *
 * POR QUE ESPERAR O BUILD: o build lê os mapas do disco ao montar o bundle, bem
 * depois de gravá-los. Se o dev gravasse o mapa fictício no meio de um build de
 * produção, as imagens fictícias entrariam no bundle e a trava de vazamento
 * (dados-ficticios.ts) derrubaria o build. check e sync não releem os mapas:
 * não precisam de espera.
 *
 * COMO:
 *  - `astro build` deixa a marca .astro/builds-no-ar/<pid> enquanto o processo
 *    vive (apagada no "exit"; marca de processo morto ou com mais de
 *    VALIDADE_DA_MARCA_MS é ignorada e removida, o que cobre Ctrl+C e pid
 *    reaproveitado);
 *  - o dev, ao subir ou reiniciar (astro.config, package.json, tsconfig), espera
 *    não haver marca viva antes da própria sincronização (astro:config:setup
 *    roda antes dela nos dois casos);
 *  - no ar, quando os mapas mudam para um conteúdo diferente do último que este
 *    dev gravou, ele espera não haver marca viva e chama refreshContent(): o
 *    donoLoader (src/content/loaders.ts) faz store.clear() a cada
 *    sincronização, o que deixa os dois mapas "sujos", e o Astro os regrava a
 *    partir do store DESTE processo (sem apagar nada antes: a página nunca vê
 *    o mapa ausente). O conteúdo regravado vira a nova referência (o evento da
 *    própria escrita compara igual: sem laço);
 *  - reinício recria o servidor sem passar de novo pelo astro:server:start: a
 *    conferência religa no próprio astro:server:setup.
 *
 * Fora do alcance (raro, e a trava de vazamento falha o build em vez de
 * publicar): arquivo de conteúdo editado com o dev no ar no meio de um build
 * faz o dev sincronizar sem esperar.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as dormir } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

/** Mapas que o Astro grava em .astro/ em todo comando que sincroniza conteúdo. */
const MAPAS = ["content-assets.mjs", "content-modules.mjs"] as const;

/** Uma marca (arquivo vazio com o pid no nome) por `astro build` no ar. */
export const PASTA_DE_MARCAS = "builds-no-ar";

/** Build deste site leva poucos minutos: marca mais velha que isso é de processo que morreu sem "exit". */
export const VALIDADE_DA_MARCA_MS = 30 * 60 * 1000;

/** Espera antes de conferir: o outro processo grava os dois mapas em sequência. */
const ESPERA_MS = 400;

/** Com build no ar, confere de novo a cada tanto. */
const NOVA_TENTATIVA_MS = 2000;

/** O processo existe? EPERM = existe, só não é deste usuário. */
function processoVivo(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (erro) {
    return (erro as NodeJS.ErrnoException).code === "EPERM";
  }
}

/**
 * Algum OUTRO `astro build` está no ar nesta raiz? Marca de processo morto, com
 * nome inválido ou mais velha que VALIDADE_DA_MARCA_MS é apagada aqui.
 */
export function outroBuildNoAr(pasta: string, agora = Date.now()): boolean {
  if (!existsSync(pasta)) return false;
  let vivo = false;
  for (const nome of readdirSync(pasta)) {
    const pid = Number(nome);
    if (pid === process.pid) continue;
    const marca = join(pasta, nome);
    const recente = existsSync(marca) && agora - statSync(marca).mtimeMs < VALIDADE_DA_MARCA_MS;
    if (Number.isInteger(pid) && pid > 0 && recente && processoVivo(pid)) vivo = true;
    else rmSync(marca, { force: true });
  }
  return vivo;
}

export default function mapasDeConteudo(): AstroIntegration {
  let dotAstro = "";
  /** O que este dev gravou por último; null = desconhecido (refaz na próxima conferência). */
  let referencia: string | null = null;
  /** O dev já passou pelo astro:server:start (reinício conta como "já subiu"). */
  let jaSubiu = false;
  /** Liga a conferência no servidor atual (o do último astro:server:setup). */
  let ligar: ((adotarDisco: boolean) => void) | undefined;

  const marcas = () => join(dotAstro, PASTA_DE_MARCAS);
  const caminhos = () => MAPAS.map((mapa) => join(dotAstro, mapa));
  const lerMapas = () => caminhos().map((caminho) => (existsSync(caminho) ? readFileSync(caminho, "utf8") : "")).join("\0");

  return {
    name: "lemamon:mapas-de-conteudo",
    hooks: {
      "astro:config:setup": async ({ command, config, isRestart, logger }) => {
        dotAstro = fileURLToPath(new URL(".astro/", config.root));
        if (command === "dev") {
          if (isRestart) jaSubiu = true;
          // A sincronização do dev (logo depois deste hook) gravaria os mapas dele no meio do build.
          if (outroBuildNoAr(marcas())) {
            logger.warn("um `astro build` está no ar nesta pasta; o dev sobe quando ele terminar.");
            while (outroBuildNoAr(marcas())) await dormir(NOVA_TENTATIVA_MS);
          }
          return;
        }
        if (command !== "build") return;
        const marca = join(marcas(), String(process.pid));
        // Mesmo processo carregando a config de novo: a marca e o "exit" já existem.
        if (existsSync(marca)) return;
        mkdirSync(marcas(), { recursive: true });
        writeFileSync(marca, "");
        process.once("exit", () => rmSync(marca, { force: true }));
      },
      "astro:server:setup": ({ server, refreshContent, logger }) => {
        if (!refreshContent) return;
        const mapas = caminhos();
        let espera: ReturnType<typeof setTimeout> | undefined;
        let fila = Promise.resolve();
        let ativo = false;
        let avisado = false;

        const conferir = async () => {
          if (!ativo || (referencia !== null && lerMapas() === referencia)) return;
          if (outroBuildNoAr(marcas())) {
            if (!avisado) {
              logger.warn(
                "um `astro build` está usando .astro/content-*.mjs; o dev refaz os mapas quando ele terminar " +
                  "(até lá, página com imagem ou MDX da camada fictícia pode dar erro).",
              );
            }
            avisado = true;
            agendar(NOVA_TENTATIVA_MS);
            return;
          }
          avisado = false;
          const semReferencia = referencia === null;
          const antes = lerMapas();
          await refreshContent({});
          // Build que começou durante a sincronização pode ter gravado por cima: não adota, confere de novo.
          if (outroBuildNoAr(marcas())) {
            referencia = null;
            agendar(NOVA_TENTATIVA_MS);
            return;
          }
          referencia = lerMapas();
          if (!semReferencia && referencia !== antes) logger.info("mapas de conteúdo (.astro/content-*.mjs) refeitos a partir deste dev server.");
        };

        function agendar(ms: number) {
          clearTimeout(espera);
          espera = setTimeout(() => {
            fila = fila.then(conferir).catch((erro: unknown) => logger.error(`não deu para refazer os mapas de conteúdo: ${String(erro)}`));
          }, ms);
        }

        ligar = (adotarDisco) => {
          ativo = true;
          // Na primeira subida, a sincronização inicial (sem build no ar) acabou de gravar os mapas deste dev.
          referencia = adotarDisco && !outroBuildNoAr(marcas()) ? lerMapas() : null;
          agendar(ESPERA_MS);
        };

        server.watcher.add(mapas);
        server.watcher.on("all", (evento, caminho) => {
          if (evento !== "unlink" && mapas.includes(caminho)) agendar(ESPERA_MS);
        });
        // Reinício: não haverá astro:server:start; confere depois da sincronização do reinício.
        if (jaSubiu) ligar(false);
      },
      "astro:server:start": () => {
        jaSubiu = true;
        ligar?.(true);
      },
    },
  };
}
