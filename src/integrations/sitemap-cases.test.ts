/**
 * Datas do sitemap dos cases (S01-6) e slug da URL por idioma nos cases reais
 * (S01-3). Dono: gated.
 */
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import { SLUG_PATTERN } from "../content/schemas";
import { camposDoSitemap, lastmodDe, lastmodDosCases, PASTA_DOS_CASES } from "./sitemap-cases";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

const frontmatter = (linhas: string[], corpo = "### Para quem\n\nslugUrl: \"no-corpo-nao-conta\"\n") => `---\n${linhas.join("\n")}\n---\n\n${corpo}`;

describe("camposDoSitemap: só slugUrl e atualizadoEm, de 1º nível, no frontmatter", () => {
  it("lê com aspas duplas, simples, sem aspas e com comentário", () => {
    expect(camposDoSitemap(frontmatter(['titulo: "X"', 'slugUrl: "air-quality-widget"', "atualizadoEm: 2026-10-22"]))).toEqual({
      slugUrl: "air-quality-widget",
      atualizadoEm: "2026-10-22",
    });
    expect(camposDoSitemap(frontmatter(["slugUrl: 'widget'", 'atualizadoEm: "2026-10-01" # revisão'])).atualizadoEm).toBe("2026-10-01");
  });

  it("ignora chave aninhada, o corpo do MDX e arquivo sem frontmatter", () => {
    expect(camposDoSitemap(frontmatter(["semTermo:", '  atualizadoEm: "2026-10-21"', '  slugUrl: "x"']))).toEqual({});
    expect(camposDoSitemap(frontmatter(['titulo: "X"']))).toEqual({});
    expect(camposDoSitemap("slugUrl: x\natualizadoEm: 2026-10-22\n")).toEqual({});
  });
});

describe("lastmodDe: só data AAAA-MM-DD válida", () => {
  it("data válida vira ISO; o resto, null", () => {
    expect(lastmodDe("2026-10-22")).toBe("2026-10-22T00:00:00.000Z");
    expect(lastmodDe(undefined)).toBeNull();
    expect(lastmodDe("22/10/2026")).toBeNull();
    expect(lastmodDe("2026-13-45")).toBeNull();
  });
});

describe("lastmodDosCases: caminho da página do case (com o slug do idioma) → lastmod", () => {
  const raiz = mkdtempSync(join(tmpdir(), "lemamon-sitemap-cases-"));
  afterAll(() => rmSync(raiz, { recursive: true, force: true }));

  it("só o case com atualizadoEm entra, no caminho de routes.ts e com o slugUrl do idioma", () => {
    for (const locale of ["pt", "en", "es"]) mkdirSync(join(raiz, PASTA_DOS_CASES, locale), { recursive: true });
    writeFileSync(join(raiz, PASTA_DOS_CASES, "pt", "widget-de-ar.mdx"), frontmatter(["atualizadoEm: 2026-10-20"]));
    writeFileSync(join(raiz, PASTA_DOS_CASES, "en", "widget-de-ar.mdx"), frontmatter(['slugUrl: "air-widget"', "atualizadoEm: 2026-10-21"]));
    writeFileSync(join(raiz, PASTA_DOS_CASES, "es", "widget-de-ar.mdx"), frontmatter(['slugUrl: "widget-de-aire"']));
    writeFileSync(join(raiz, PASTA_DOS_CASES, "pt", "LEIA-ME.txt"), "não é case");
    expect([...lastmodDosCases(raiz)]).toEqual([
      ["/cases/widget-de-ar", "2026-10-20T00:00:00.000Z"],
      ["/en/cases/air-widget", "2026-10-21T00:00:00.000Z"],
    ]);
  });

  it("raiz sem cases: mapa vazio (o sitemap sai sem lastmod)", () => {
    expect(lastmodDosCases(join(raiz, "nao-existe")).size).toBe(0);
  });
});

describe("cases reais: slug da URL por idioma (S01-3)", () => {
  const nomes = (locale: string) => readdirSync(join(ROOT, PASTA_DOS_CASES, locale)).filter((nome) => /\.mdx?$/.test(nome));
  const campos = (locale: string, nome: string) => camposDoSitemap(readFileSync(join(ROOT, PASTA_DOS_CASES, locale, nome), "utf8"));

  it("pt-BR usa o nome do arquivo (sem slugUrl); en e es declaram slug próprio, válido e único no idioma", () => {
    const pt = nomes("pt");
    expect(pt.length).toBeGreaterThan(0);
    for (const nome of pt) expect(campos("pt", nome).slugUrl, `pt/${nome}`).toBeUndefined();
    for (const locale of ["en", "es"]) {
      const slugs = nomes(locale).map((nome) => campos(locale, nome).slugUrl);
      expect(slugs.every((slug) => slug && SLUG_PATTERN.test(slug)), locale).toBe(true);
      expect(new Set(slugs).size, locale).toBe(slugs.length);
    }
    // Em inglês, nenhum slug fica igual ao português.
    for (const nome of nomes("en")) expect(`${campos("en", nome).slugUrl}.mdx`, `en/${nome}`).not.toBe(nome);
  });
});
