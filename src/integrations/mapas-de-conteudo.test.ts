/**
 * Marca de "astro build no ar" — src/integrations/mapas-de-conteudo.ts.
 * Dono: shell. O dev só sobe e só refaz .astro/content-*.mjs sem marca viva de
 * build; marca de processo morto ou velha não pode travar o dev para sempre.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import mapasDeConteudo, { outroBuildNoAr, PASTA_DE_MARCAS, VALIDADE_DA_MARCA_MS } from "./mapas-de-conteudo";

const raizes: string[] = [];
const novaRaiz = () => {
  const raiz = mkdtempSync(join(tmpdir(), "lemamon-marcas-"));
  raizes.push(raiz);
  return raiz;
};
const pastaDeMarcas = (raiz: string) => join(raiz, ".astro", PASTA_DE_MARCAS);
const marcar = (raiz: string, pid: number | string) => {
  mkdirSync(pastaDeMarcas(raiz), { recursive: true });
  writeFileSync(join(pastaDeMarcas(raiz), String(pid)), "");
};
/** pid de um processo que já terminou. */
const pidMorto = () => spawnSync(process.execPath, ["-e", ""]).pid;

afterEach(() => {
  for (const raiz of raizes.splice(0)) rmSync(raiz, { recursive: true, force: true });
});

describe("outroBuildNoAr", () => {
  it("sem pasta de marcas: nenhum build no ar", () => {
    expect(outroBuildNoAr(pastaDeMarcas(novaRaiz()))).toBe(false);
  });

  it("marca de processo vivo trava; a do próprio processo não", async () => {
    const raiz = novaRaiz();
    marcar(raiz, process.pid);
    expect(outroBuildNoAr(pastaDeMarcas(raiz))).toBe(false);

    const outro = spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"]);
    try {
      marcar(raiz, outro.pid!);
      expect(outroBuildNoAr(pastaDeMarcas(raiz))).toBe(true);
    } finally {
      outro.kill();
      await new Promise((resolve) => outro.once("exit", resolve));
    }
    expect(outroBuildNoAr(pastaDeMarcas(raiz))).toBe(false);
  });

  it("marca mais velha que a validade não trava (pid reaproveitado, Ctrl+C) e é apagada", async () => {
    const raiz = novaRaiz();
    const outro = spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"]);
    try {
      marcar(raiz, outro.pid!);
      const velha = (Date.now() - VALIDADE_DA_MARCA_MS - 60_000) / 1000;
      utimesSync(join(pastaDeMarcas(raiz), String(outro.pid)), velha, velha);
      expect(outroBuildNoAr(pastaDeMarcas(raiz))).toBe(false);
      expect(readdirSync(pastaDeMarcas(raiz))).toEqual([]);
    } finally {
      outro.kill();
      await new Promise((resolve) => outro.once("exit", resolve));
    }
  });

  it("marca de processo morto ou com nome inválido não trava e é apagada", () => {
    const raiz = novaRaiz();
    marcar(raiz, pidMorto());
    marcar(raiz, "lixo");
    expect(outroBuildNoAr(pastaDeMarcas(raiz))).toBe(false);
    expect(readdirSync(pastaDeMarcas(raiz))).toEqual([]);
  });
});

describe("marca de build", () => {
  it("existe enquanto o processo do build vive e some na saída; dev, sync (check) e preview não marcam", () => {
    const raiz = novaRaiz();
    const modulo = pathToFileURL(join(import.meta.dirname, "mapas-de-conteudo.ts")).href;
    const rodar = (command: string) => {
      const codigo = [
        'import { existsSync } from "node:fs";',
        `import mapas from ${JSON.stringify(modulo)};`,
        `const config = { root: new URL(${JSON.stringify(pathToFileURL(`${raiz}/`).href)}) };`,
        `await mapas().hooks["astro:config:setup"]({ command: ${JSON.stringify(command)}, config });`,
        `console.log(existsSync(${JSON.stringify(pastaDeMarcas(raiz))} + "/" + process.pid));`,
      ].join("\n");
      const resultado = spawnSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", codigo], { encoding: "utf8" });
      expect(resultado.stderr).toBe("");
      return resultado.stdout.trim();
    };

    expect(rodar("build")).toBe("true");
    expect(rodar("sync")).toBe("false");
    expect(rodar("dev")).toBe("false");
    expect(rodar("preview")).toBe("false");
    // O processo do build já saiu: nenhuma marca ficou para trás.
    expect(existsSync(pastaDeMarcas(raiz)) ? readdirSync(pastaDeMarcas(raiz)) : []).toEqual([]);
  });
});

describe("dev com build no ar", () => {
  it("o dev só passa do astro:config:setup (e sincroniza) depois que o build sai", async () => {
    const raiz = novaRaiz();
    const build = spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"]);
    const avisos: string[] = [];
    try {
      marcar(raiz, build.pid!);
      const setup = mapasDeConteudo().hooks["astro:config:setup"] as unknown as (opcoes: object) => Promise<void>;
      let subiu = false;
      const subida = setup({
        command: "dev",
        isRestart: false,
        config: { root: pathToFileURL(`${raiz}/`) },
        logger: { warn: (texto: string) => avisos.push(texto) },
      }).then(() => (subiu = true));
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(subiu).toBe(false);
      expect(avisos).toHaveLength(1);

      build.kill();
      await subida;
      expect(subiu).toBe(true);
    } finally {
      build.kill();
    }
  });
});
