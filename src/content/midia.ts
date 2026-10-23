/**
 * Mídia do dono que NÃO é imagem (vídeo e legendas do depoimento em vídeo,
 * B287). Dono: gated. SÓ SERVIDOR (fs).
 *
 * Imagem passa pelo astro:assets (image() dos schemas). Vídeo e legenda não:
 * o arquivo mora em dados/ (caminho relativo, como as imagens do dono.json) e
 * sai no site em /_midia/<nome>.<hash>.<ext>:
 *  - no build, a integração src/integrations/dados-ficticios.ts copia para
 *    <saída>/_midia/ SÓ o que o HTML cita, antes da varredura da camada
 *    fictícia (sem a camada, mídia de lá nem é encontrada: o build cai);
 *  - no `astro dev`, o plugin da mesma integração serve /_midia/ (com Range,
 *    que o Safari exige para tocar vídeo).
 * O hash do conteúdo no nome deixa o arquivo ser guardado em cache para sempre
 * e troca a URL quando o dono troca o vídeo.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

/** Pasta pública da mídia do dono (URL e pasta no dist). */
export const PASTA_DE_MIDIA = "_midia";
export const PREFIXO_DE_MIDIA = `/${PASTA_DE_MIDIA}/`;

/** Extensões servidas em /_midia/ (o resto de dados/ nunca é servido por aqui). */
export const EXTENSAO_DE_MIDIA = /\.(mp4|webm|vtt)$/i;

/** Content-Type de cada extensão servida. */
export const TIPO_DE_MIDIA: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".vtt": "text/vtt; charset=utf-8",
};

/** Nome público: base do arquivo (minúsculas, sem acento) + 10 dígitos do sha256 do conteúdo + extensão. */
export function nomePublicoDaMidia(caminho: string, bytes: Uint8Array): string {
  const extensao = extname(caminho).toLowerCase();
  const base =
    basename(caminho, extname(caminho))
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "") || "midia";
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
  return `${base}.${hash}${extensao}`;
}

/** URL pública de um arquivo de mídia do dono (`relativo` à pasta dados/, já validado pelo schema). */
export function urlDaMidia(relativo: string, root: string = process.cwd()): string {
  const bytes = readFileSync(join(root, "dados", relativo));
  return `${PREFIXO_DE_MIDIA}${nomePublicoDaMidia(relativo, bytes)}`;
}
