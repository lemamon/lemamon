/**
 * Pixels de anúncio opcionais (backlog B346 LinkedIn Insight Tag, B347 Meta
 * Pixel; decisão D12 do playbook 15) — dono: gated (o campo do dono.json) e
 * shell (aviso, CSP, Política). O caminho que o dono liga preenchendo
 * dados/dono.json › privacidade.pixels.<pixel> = { id, prazo }:
 *
 *  - o dado REAL de hoje não tem pixel nenhum (null = desligado);
 *  - a validação aceita o campo (ID só de dígitos, prazo nos 3 idiomas) e
 *    recusa ID com letra, pixel desconhecido e campo a mais, em pt-BR;
 *  - a trava da Política barra pixel sem consentimento, sem prazo ou com ID
 *    inválido;
 *  - BUILD DE PRODUÇÃO REAL numa raiz de teste (globalSetup, producaoComPixels):
 *    com o copy da Política nos 3 idiomas, o aviso de cookies sai com
 *    data-linkedin-partner-id / data-meta-pixel-id, a CSP libera os domínios e
 *    a Política lista operador e prazo de cada pixel; SEM o copy, o build cai
 *    com a lista do que falta (nunca um pixel que a Política não cita);
 *  - nenhum outro build (local, camada fictícia, produção sem pixel) publica ID.
 *
 * Que o script só carrega DEPOIS do "Aceitar" (e nunca após "Recusar") está
 * em src/scripts/consent.test.ts (shell).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { activePixels, privacidadeReal, privacyLaunchBlockers, type Privacidade } from "@/config/privacidade";
import { urlFor } from "@/config/routes";
import { donoIssues } from "@/config/validate";
import { PIXEL_POLICY_ITEMS } from "@/components/shell/privacy";
import { LOCALES } from "@/i18n/locales";
import { fileForPath, textOf } from "@/integrations/verify-build";
import { PIXEL_ATTRIBUTES } from "@/scripts/pixels";

import { donoComPixels, PIXELS_DE_TESTE, PRAZOS_DOS_PIXELS_DE_TESTE } from "./support/builds-dos-dados";

const ROOT = process.cwd();
type Doc = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const lerJson = (arquivo: string): Doc => JSON.parse(readFileSync(join(ROOT, arquivo), "utf8")) as Doc;
const real = lerJson("dados/dono.json");
const schema = lerJson("dados/dono.schema.json");
const mensagens = Object.fromEntries(LOCALES.map((locale) => [locale, lerJson(`src/i18n/${locale}.json`)])) as Record<string, Doc>;
const prazo = (pt: string) => ({ pt, en: pt, es: pt });

describe("dados/dono.json › privacidade.pixels — o campo que liga o pixel", () => {
  it("hoje: nenhum pixel (LinkedIn e Meta null = desligados; D12 recomenda não instalar agora)", () => {
    expect(Object.values(real.privacidade.pixels ?? {}).every((pixel) => pixel === null)).toBe(true);
    expect(activePixels(privacidadeReal)).toEqual({ linkedin: "", meta: "" });
  });

  it("aceita ID só de dígitos com prazo nos 3 idiomas, prazo null e o campo ausente", () => {
    const com = structuredClone(real);
    com.privacidade.pixels = { linkedin: { id: "1234567", prazo: prazo("180 dias") }, meta: { id: "123456789012345", prazo: null } };
    expect(donoIssues(com)).toEqual([]);
    const sem = structuredClone(real);
    delete sem.privacidade.pixels;
    expect(donoIssues(sem)).toEqual([]);
    const so = structuredClone(real);
    so.privacidade.pixels = { meta: null };
    expect(donoIssues(so)).toEqual([]);
  });

  it.each<[string, unknown, RegExp]>([
    ["ID com letra", { linkedin: { id: "12a4567", prazo: null } }, /privacidade\.pixels\.linkedin\.id: só dígitos/],
    ["ID com espaço", { meta: { id: "1234 5678", prazo: null } }, /privacidade\.pixels\.meta\.id: só dígitos/],
    ["ID curto demais", { meta: { id: "123", prazo: null } }, /privacidade\.pixels\.meta\.id: só dígitos/],
    ["ID como número (sem aspas)", { linkedin: { id: 1234567, prazo: null } }, /privacidade\.pixels\.linkedin\.id: tipo errado: esperava texto/],
    ["sem prazo", { linkedin: { id: "1234567" } }, /privacidade\.pixels\.linkedin\.prazo: campo obrigatório faltando/],
    ["prazo só em português", { linkedin: { id: "1234567", prazo: { pt: "180 dias" } } }, /privacidade\.pixels\.linkedin\.prazo\.en: campo obrigatório faltando/],
    ["pixel desconhecido", { tiktok: null }, /privacidade\.pixels: campo desconhecido "tiktok"/],
    ["campo a mais no pixel", { meta: { id: "123456789012345", prazo: null, eventos: ["Lead"] } }, /privacidade\.pixels\.meta: campo desconhecido "eventos"/],
    ["dinheiro no prazo", { meta: { id: "123456789012345", prazo: { pt: "R$ 50 por mês", en: "x", es: "x" } } }, /privacidade\.pixels\.meta\.prazo\.pt: valor monetário/],
  ])("recusa %s, com o caminho do campo em pt-BR", (_nome, pixels, esperado) => {
    const doc = structuredClone(real);
    doc.privacidade.pixels = pixels;
    expect(donoIssues(doc).join("\n")).toMatch(esperado);
  });

  it("o dados/dono.schema.json (autocompletar do editor) descreve o campo e recusa ID com letra", () => {
    const pixels = schema.properties.privacidade.properties.pixels;
    expect(pixels.description).toMatch(/consentimento/);
    expect(Object.keys(pixels.properties).sort()).toEqual(["linkedin", "meta"]);
    expect(pixels.additionalProperties).toBe(false);
    const declarado = schema.definitions.pixelDeclarado;
    expect(declarado.required.sort()).toEqual(["id", "prazo"]);
    const id = new RegExp(declarado.properties.id.pattern);
    expect(["1234567", "123456789012345"].every((value) => id.test(value))).toBe(true);
    expect(["12a4567", "1234 567", "123", ""].some((value) => id.test(value))).toBe(false);
  });
});

describe("trava da Política: pixel só com consentimento, ID real e prazo", () => {
  const base = (): Privacidade => ({
    ...(real.privacidade as Privacidade),
    baseAnuncios: "consentimento",
    encarregado: "pequeno_porte",
    prazos: Object.fromEntries(Object.keys(real.privacidade.prazos).map((key) => [key, prazo("12 meses")])) as Privacidade["prazos"],
    atualizadaEm: "2026-10-20",
  });
  const empresa = { ...real.empresa, razaoSocial: "Razão Social de Teste Ltda", cnpj: "11.444.777/0001-61" };

  it("o dono de teste com os dois pixels libera", () => {
    const doc = donoComPixels(real);
    expect(donoIssues(doc)).toEqual([]);
    expect(privacyLaunchBlockers(doc.privacidade as Privacidade, {}, doc.empresa)).toEqual([]);
  });

  it("legítimo interesse, prazo vazio ou ID com cara de fictício: cada um com o seu caminho", () => {
    const comPixel = (pixels: Privacidade["pixels"], extra: Partial<Privacidade> = {}) => privacyLaunchBlockers({ ...base(), ...extra, pixels }, {}, empresa).join("\n");
    expect(comPixel({ linkedin: { id: "1234567", prazo: prazo("180 dias") } }, { baseAnuncios: "legitimo_interesse" })).toMatch(
      /privacidade\.pixels\.linkedin exige baseAnuncios = 'consentimento'/,
    );
    expect(comPixel({ meta: { id: "123456789012345", prazo: null } })).toMatch(/privacidade\.pixels\.meta\.prazo \(3 idiomas\)/);
    expect(comPixel({ meta: { id: "123456789012345", prazo: prazo("90 dias (exemplo)") } })).toMatch(/privacidade\.pixels\.meta\.prazo/);
    expect(comPixel({ linkedin: null, meta: null })).toBe("");
  });
});

describe("build de PRODUÇÃO com os pixels (raiz de teste, globalSetup)", () => {
  const { producaoComPixels, producaoSemFlag, producaoComFlag, semFicticio, comFicticio } = inject("buildsDosDados");
  const html = (outDir: string, path: string) => readFileSync(join(outDir, fileForPath(path)), "utf8");
  // O copy da Política (shell/redator): os 3 itens de cada pixel, nos 3 idiomas.
  const faltaCopy = LOCALES.flatMap((locale) =>
    Object.values(PIXEL_POLICY_ITEMS)
      .flat()
      .filter(([secao, item]) => typeof mensagens[locale]?.privacy?.sections?.[secao]?.items?.[item] !== "string")
      .map(([secao, item]) => `${locale}: privacy.sections.${secao}.items.${item}`),
  );

  it("nenhum outro build publica ID de pixel (local, camada fictícia, produção sem pixel)", () => {
    for (const build of [semFicticio, comFicticio, producaoComFlag, producaoSemFlag]) {
      if (build.status !== 0) continue;
      const home = html(build.outDir, "/");
      expect(home, build.outDir).not.toContain(`${PIXEL_ATTRIBUTES.linkedin}=`);
      expect(home, build.outDir).not.toContain(`${PIXEL_ATTRIBUTES.meta}=`);
    }
  });

  if (faltaCopy.length > 0) {
    it("sem o copy da Política nos 3 idiomas, o build de produção CAI com a lista do que falta (nunca pixel que a Política não cita)", () => {
      expect(producaoComPixels.status, producaoComPixels.saida.slice(-2000)).not.toBe(0);
      expect(producaoComPixels.saida).toMatch(/Pixel "(linkedin|meta)" publicado sem os itens da Política/);
      expect(producaoComPixels.saida).toMatch(/privacy\.sections\.(navigation_data|processors|retention)\.items\./);
    });
    return;
  }

  it("passa (o dono só precisa do ID, do prazo e de baseAnuncios = 'consentimento')", () => {
    expect(producaoComPixels.status, producaoComPixels.saida.slice(-3000)).toBe(0);
  });

  it("o aviso de cookies sai com os dois IDs (o script só carrega depois do 'Aceitar')", () => {
    for (const locale of LOCALES) {
      const home = html(producaoComPixels.outDir, urlFor("home", locale));
      const banner = home.match(/<div[^>]*data-consent-banner[^>]*>/)?.[0] ?? "";
      expect(banner, locale).toContain(`${PIXEL_ATTRIBUTES.linkedin}="${PIXELS_DE_TESTE.linkedin}"`);
      expect(banner, locale).toContain(`${PIXEL_ATTRIBUTES.meta}="${PIXELS_DE_TESTE.meta}"`);
      // Nenhuma tag de pixel no HTML: quem injeta é o consent.ts, depois do aceite.
      expect(home, locale).not.toMatch(/<script[^>]*src="https:\/\/(snap\.licdn\.com|connect\.facebook\.net)/);
      expect(home, locale).not.toMatch(/<img[^>]*src="https:\/\/(px\.ads\.linkedin\.com|www\.facebook\.com\/tr)/);
    }
  });

  it("a CSP libera os domínios do LinkedIn e da Meta só neste build", () => {
    const headers = readFileSync(join(producaoComPixels.outDir, "_headers"), "utf8");
    expect(headers).toMatch(/snap\.licdn\.com/);
    expect(headers).toMatch(/connect\.facebook\.net/);
    const semPixel = join(producaoSemFlag.outDir, "_headers");
    if (producaoSemFlag.status === 0 && existsSync(semPixel)) {
      expect(readFileSync(semPixel, "utf8")).not.toMatch(/snap\.licdn\.com|connect\.facebook\.net/);
    }
  });

  it("a Política lista o prazo de retenção de cada pixel, nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      const texto = textOf(html(producaoComPixels.outDir, urlFor("privacy", locale)));
      expect(texto, locale).toContain(PRAZOS_DOS_PIXELS_DE_TESTE.linkedin[locale]);
      expect(texto, locale).toContain(PRAZOS_DOS_PIXELS_DE_TESTE.meta[locale]);
      expect(texto, locale).toMatch(/LinkedIn/);
      expect(texto, locale).toMatch(/Meta/);
    }
  });
});
