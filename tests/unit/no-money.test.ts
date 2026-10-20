/**
 * BLUEPRINT §4/§12: valor monetário SÓ em dados/dono.json › precos e
 * › qualificacao (e nas mesmas seções da camada fictícia, dados/dono.ficticio.json).
 * Em nenhum outro lugar: copy, componentes, ilha, configs .ts (nem em
 * comentário), outras seções do dono.json, MDX de conteúdo. O padrão é o mesmo
 * que os schemas e o validate.ts aplicam no build (src/content/schemas.ts › MONEY_PATTERN).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { MONEY_PATTERN } from "@/content/schemas";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const DADOS = join(ROOT, "dados");
/** As únicas seções do dono.json onde dinheiro é aceito. */
const SECOES_COM_DINHEIRO = new Set(["precos", "qualificacao"]);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

/** Textos com dinheiro fora das seções permitidas: "secao.campo: texto". */
function dinheiroForaDoLugar(doc: Record<string, unknown>): string[] {
  const achados: string[] = [];
  const walk = (no: unknown, caminho: string) => {
    if (typeof no === "string") {
      if (MONEY_PATTERN.test(no)) achados.push(`${caminho}: ${no}`);
    } else if (Array.isArray(no)) no.forEach((item, index) => walk(item, `${caminho}[${index}]`));
    else if (no && typeof no === "object") for (const [key, value] of Object.entries(no)) walk(value, caminho ? `${caminho}.${key}` : key);
  };
  for (const [secao, valor] of Object.entries(doc)) if (!SECOES_COM_DINHEIRO.has(secao)) walk(valor, secao);
  return achados;
}

describe("sem valor monetário fora das seções de preço/qualificação", () => {
  it("varre src/ inteiro (nenhum arquivo, nem os configs .ts)", () => {
    const offenders = files(SRC)
      .filter((file) => /\.(astro|tsx?|json|mdx?|ya?ml|css)$/.test(file))
      .filter((file) => !/\.test\.tsx?$/.test(file))
      .filter((file) => MONEY_PATTERN.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it.each(["dados/dono.json", "dados/dono.ficticio.json", "dados/dono.schema.json"])("%s: dinheiro só em precos e qualificacao", (arquivo) => {
    const doc = JSON.parse(readFileSync(join(ROOT, arquivo), "utf8")) as Record<string, unknown>;
    expect(dinheiroForaDoLugar(doc)).toEqual([]);
  });

  it("MDX de conteúdo (real e fictício) não tem dinheiro", () => {
    const offenders = [...files(join(SRC, "content")), ...files(join(DADOS, "ficticio"))]
      .filter((file) => /\.mdx?$/.test(file))
      .filter((file) => MONEY_PATTERN.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it("as seções permitidas existem e o padrão de fato as reconhece (o teste não é cego)", () => {
    const real = JSON.parse(readFileSync(join(DADOS, "dono.json"), "utf8")) as Record<string, { faixas?: { rotulo: { pt: string } }[] }>;
    expect(Object.keys(real)).toEqual(expect.arrayContaining([...SECOES_COM_DINHEIRO]));
    expect(MONEY_PATTERN.test(real.qualificacao?.faixas?.[0]?.rotulo.pt ?? "")).toBe(true);
  });
});
