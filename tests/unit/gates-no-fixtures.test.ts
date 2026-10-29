/**
 * Nenhum dado fictício chega ao build de produção (BLUEPRINT §4/§12: "nunca
 * inventar cliente, logo ou número").
 *
 *  1. Nada em src/ importa tests/ (fixtures só entram nos testes).
 *  2. Nenhum arquivo de src/ nem de dados/ contém a marca FIXTURE_MARK nem slugs de fixture.
 *  3. src/content/ só tem conteúdo de verdade (hoje: vazio, só .gitkeep, loaders e o schema).
 *  4. No build SEM a camada fictícia (globalSetup: builds-dos-dados.ts), nenhum
 *     arquivo contém a marca nem slugs de fixture, e com as coleções vazias
 *     nenhuma página when_data foi gerada nem entrou no sitemap. (O caçador de
 *     dado fictício está em dados-vazamento.test.ts.)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { collectionHasFiles } from "@/config/features";
import { ROUTES } from "@/config/routes";
import { fileForPath } from "@/integrations/verify-build";

import { FIXTURE_CASE_SLUGS, FIXTURE_MARK } from "../fixtures/owner-data";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const DADOS = join(ROOT, "dados");
const DIST = inject("buildsDosDados").semFicticio.outDir;
const TEXT_FILE = /\.(astro|tsx?|jsx?|mjs|json|mdx?|ya?ml|css|html|xml|txt|svg)$/;

function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

const markers = [FIXTURE_MARK, ...FIXTURE_CASE_SLUGS, "fixture-lemamon"];

describe("fixtures nunca vão ao ar", () => {
  it("src/ não importa nada de tests/", () => {
    const offenders = files(SRC)
      .filter((file) => /\.(astro|tsx?|mjs)$/.test(file))
      .filter((file) => /from\s+["'][^"']*\btests\/|import\(["'][^"']*\btests\//.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it("src/ e dados/ não contêm marca nem slug de fixture", () => {
    const offenders = [...files(SRC), ...files(DADOS)]
      .filter((file) => TEXT_FILE.test(file))
      .filter((file) => {
        const text = readFileSync(file, "utf8");
        return markers.some((marker) => text.includes(marker));
      })
      .map((file) => relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it("src/content/ só tem os schemas, os loaders e os diretórios vazios (nenhum conteúdo de exemplo)", () => {
    const content = files(join(SRC, "content")).map((file) => relative(SRC, file).split("\\").join("/"));
    const unexpected = content.filter(
      (file) => file !== "content/schemas.ts" && file !== "content/loaders.ts" && !file.endsWith(".gitkeep"),
    );
    // Conteúdo REAL do dono é bem-vindo aqui; este teste só garante que nada dele é fixture.
    for (const file of unexpected) {
      const text = readFileSync(join(SRC, file), "utf8");
      expect(markers.some((marker) => text.includes(marker)), file).toBe(false);
    }
  });

  it("dist/ (build sem a camada fictícia) não contém marca nem slug de fixture", () => {
    expect(existsSync(DIST)).toBe(true);
    const offenders = files(DIST)
      .filter((file) => TEXT_FILE.test(file))
      .filter((file) => {
        const text = readFileSync(file, "utf8");
        return markers.some((marker) => text.includes(marker));
      })
      .map((file) => relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it("dist/ (build sem a camada fictícia): sem dado, nenhuma página when_data (nem no sitemap)", () => {
    const gatedByCollection = {
      cases_hub: "cases",
      about: "time",
      blog_hub: "posts",
    } as const;
    const sitemap = files(DIST)
      .filter((file) => /sitemap.*\.xml$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    for (const [route, collection] of Object.entries(gatedByCollection) as [keyof typeof gatedByCollection, (typeof gatedByCollection)[keyof typeof gatedByCollection]][]) {
      if (collectionHasFiles(collection)) continue;
      for (const path of Object.values(ROUTES[route].paths)) {
        expect(existsSync(join(DIST, fileForPath(path))), `${route} ${path}`).toBe(false);
        expect(sitemap.includes(`https://lemamon.dev${path}<`), `sitemap ${path}`).toBe(false);
      }
    }
    if (!collectionHasFiles("cases")) {
      expect(existsSync(join(DIST, "cases"))).toBe(false);
      expect(existsSync(join(DIST, "es", "casos"))).toBe(false);
    }
    if (!collectionHasFiles("posts")) {
      expect(existsSync(join(DIST, "blog"))).toBe(false);
    }
  });
});
