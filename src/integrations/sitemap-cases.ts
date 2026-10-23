/**
 * Datas do sitemap dos cases (dono: gated; auditoria de SEO S01-6). SÓ NODE
 * (fs): carregado pelo astro.config.mjs, que não tem `astro:content`.
 *
 * `<lastmod>` só com data verdadeira: o campo opcional `atualizadoEm` do
 * frontmatter de cada case (src/content/schemas.ts › caseSchema), por idioma.
 * Sem o campo, o case sai no sitemap sem lastmod (nunca a data do build).
 *
 * O frontmatter é lido aqui por linha, só as chaves de 1º nível `slugUrl` e
 * `atualizadoEm` (valores simples, sem aspas obrigatórias). O schema do Astro
 * continua validando o arquivo inteiro no build: data no futuro ou fora do
 * formato derruba o build antes de o sitemap ser gerado.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { urlFor } from "../config/routes";
import { LOCALES } from "../i18n/locales";

/** Pasta dos cases reais, relativa à raiz do projeto. */
export const PASTA_DOS_CASES = "src/content/cases";

/** Chaves de 1º nível que o sitemap lê do frontmatter. */
export interface CamposDoSitemap {
  slugUrl?: string;
  atualizadoEm?: string;
}

/** Lê `slugUrl` e `atualizadoEm` do frontmatter (entre os dois primeiros "---"). */
export function camposDoSitemap(arquivo: string): CamposDoSitemap {
  const bloco = /^---\r?\n([\s\S]*?)\r?\n---/.exec(arquivo)?.[1] ?? "";
  const campos: CamposDoSitemap = {};
  for (const linha of bloco.split(/\r?\n/)) {
    const hit = /^(slugUrl|atualizadoEm):\s*(?:"([^"]*)"|'([^']*)'|([^\s#]+))\s*(?:#.*)?$/.exec(linha);
    if (!hit) continue;
    const valor = (hit[2] ?? hit[3] ?? hit[4] ?? "").trim();
    if (valor) campos[hit[1] as keyof CamposDoSitemap] = valor;
  }
  return campos;
}

/** "2026-10-22" → "2026-10-22T00:00:00.000Z"; null se não for data AAAA-MM-DD válida. */
export function lastmodDe(valor: string | undefined): string | null {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const data = new Date(`${valor}T00:00:00.000Z`);
  return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

/**
 * Caminho da página de cada case (política de URL de routes.ts, com o slug da
 * URL do idioma) → lastmod ISO. Só entram os cases com `atualizadoEm`.
 */
export function lastmodDosCases(raiz: string = process.cwd()): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const locale of LOCALES) {
    const pasta = join(raiz, PASTA_DOS_CASES, locale);
    if (!existsSync(pasta)) continue;
    for (const nome of readdirSync(pasta)) {
      const chave = /^([a-z0-9-]+)\.mdx?$/.exec(nome)?.[1];
      if (!chave) continue;
      const campos = camposDoSitemap(readFileSync(join(pasta, nome), "utf8"));
      const lastmod = lastmodDe(campos.atualizadoEm);
      if (!lastmod) continue;
      mapa.set(urlFor("case", locale, { slug: campos.slugUrl ?? chave }), lastmod);
    }
  }
  return mapa;
}
