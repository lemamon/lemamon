import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { fileForPath, h1sOf, textOf } from "@/integrations/verify-build";

describe("verify-build", () => {
  it("mapeia a política de URL para os arquivos do build (format preserve)", () => {
    expect(fileForPath("/")).toBe("index.html");
    expect(fileForPath("/en/")).toBe("en/index.html");
    expect(fileForPath("/orcamento/enviado")).toBe("orcamento/enviado.html");
    expect(fileForPath("/404")).toBe("404.html");
  });

  it("extrai o texto de cada <h1>", () => {
    expect(h1sOf('<h1 class="x">A &amp; <span>B</span>&#39;s</h1><h2>c</h2>')).toEqual(["A & B's"]);
    expect(textOf("  a \n b ")).toBe("a b");
  });
});

describe("verify-build: formulários fora do replay do New Relic", () => {
  it("acusa ilha e formulário visível sem data-nr-block", async () => {
    const { replayProblems } = await import("@/integrations/verify-build");
    expect(replayProblems('<astro-island uid="1"><div data-nr-block="">x</div></astro-island>')).toEqual([]);
    expect(replayProblems('<astro-island uid="1"><div>x</div></astro-island>')).toHaveLength(1);
    expect(replayProblems('<form name="contato" method="POST" data-nr-block>')).toEqual([]);
    expect(replayProblems('<form name="briefing" data-netlify="true" hidden>')).toEqual([]);
    expect(replayProblems('<form name="contato" method="POST">')).toHaveLength(1);
    expect(replayProblems('<astro-island><div data-nr-block><form></form></div></astro-island>')).toEqual([]);
  });
});

describe("verify-build: orçamento de peso (B097)", () => {
  // Texto aleatório em base64: comprime pouco (≈ 75%), então o dobro de N bytes passa de N em gzip.
  const noise = (bytes: number) => Buffer.from(randomBytes(bytes * 2).toString("base64"));
  const page = (head: string, body = "") => `<html><head>${head}</head><body><h1>x</h1>${body}</body></html>`;

  it("página leve passa; CSS, JS e HTML acima do limite reprovam com a métrica e o limite", async () => {
    const { weightProblems, WEIGHT_BUDGET } = await import("@/integrations/verify-build");
    const assets: Record<string, Buffer> = {
      "/_astro/a.css": Buffer.from("body{color:red}"),
      "/_astro/a.js": Buffer.from('import"./b.js";console.log(1)'),
      "/_astro/b.js": Buffer.from("export const b=1"),
      "/_astro/big.css": noise(WEIGHT_BUDGET.cssGz + 2048),
      "/_astro/big.js": noise(WEIGHT_BUDGET.jsGz + 2048),
      "/_astro/entry.js": Buffer.from('import"./big.js";'),
    };
    const read = (path: string) => assets[path] ?? null;

    expect(weightProblems(page('<link rel="stylesheet" href="/_astro/a.css"><script type="module" src="/_astro/a.js"></script>'), read)).toEqual([]);
    expect(weightProblems(page('<link rel="stylesheet" href="/_astro/big.css">'), read).join()).toMatch(
      new RegExp(`CSS .* > ${(WEIGHT_BUDGET.cssGz / 1024).toFixed(1).replace(".", "\\.")} KiB \\(sem as folhas de dado do dono\\)`),
    );
    // Meta do B094: 15 KiB de CSS por página (sem as folhas de dado do dono); com elas, folga temporária ≤ 17 KiB.
    expect(WEIGHT_BUDGET.cssGz).toBe(15 * 1024);
    expect(WEIGHT_BUDGET.cssGzOwnerData).toBeLessThanOrEqual(17 * 1024);
    // O peso vem do import estático seguido (entry.js → big.js).
    expect(WEIGHT_BUDGET.jsGz).toBeLessThanOrEqual(12 * 1024);
    expect(weightProblems(page('<script type="module" src="/_astro/entry.js"></script>'), read).join()).toMatch(
      new RegExp(`JS .* > ${(WEIGHT_BUDGET.jsGz / 1024).toFixed(1).replace(".", "\\.")} KiB \\(página sem ilha permitida\\)`),
    );
    // A mesma carga cabe numa página do wizard (limite de 100 KiB, só nas rotas da ilha).
    expect(weightProblems(page("", '<astro-island component-url="/_astro/entry.js"></astro-island>'), read, true)).toEqual([]);
    expect(weightProblems(page("", `<p>${noise(WEIGHT_BUDGET.htmlGz + 2048).toString()}</p>`), read).join()).toMatch(/HTML .* > 25\.0 KiB/);
  });

  it("folhas de dado do dono (when_data e aviso de cookies) ficam fora dos 15 KiB, mas contam no teto temporário", async () => {
    const { pageWeight, weightProblems, WEIGHT_BUDGET } = await import("@/integrations/verify-build");
    const read = () => null;
    const extra = WEIGHT_BUDGET.cssGzOwnerData - WEIGHT_BUDGET.cssGz;
    // Folha when_data e a do aviso de cookies, ~(extra / 2) gzip cada: passam nos dois limites.
    const small = `<style data-rendered-style="CaseCard">${noise(Math.floor(extra / 4)).toString()}</style>`;
    const consent = `<style data-owner-style="consent-banner">${noise(Math.floor(extra / 4)).toString()}</style>`;
    expect(pageWeight(page(small + consent), read).cssGzCore).toBe(0);
    expect(weightProblems(page(small + consent), read)).toEqual([]);
    // Acima do teto com dados: reprova pela métrica "com as folhas when_data e o aviso de cookies".
    const big = `<style data-rendered-style="CaseCard">${noise(WEIGHT_BUDGET.cssGzOwnerData + 2048).toString()}</style>`;
    expect(weightProblems(page(big), read).join()).toMatch(/\(com as folhas when_data e o aviso de cookies\)/);
    // O mesmo CSS num <style> comum conta nos 15 KiB.
    const plain = `<style>${noise(WEIGHT_BUDGET.cssGz + 2048).toString()}</style>`;
    expect(weightProblems(page(plain), read).join()).toMatch(/\(sem as folhas de dado do dono\)/);
  });

  it("ilha React fora do wizard reprova, e o JS dela não ganha o limite de 100 KiB (B097)", async () => {
    const { islandProblems, weightProblems, WEIGHT_BUDGET } = await import("@/integrations/verify-build");
    // Componente de ~80 KiB gzip, como o experimento do revisor (<Contador client:visible /> na Home).
    const assets: Record<string, Buffer> = { "/_astro/x.js": noise(40 * 1024) };
    const read = (path: string) => assets[path] ?? null;
    const home = page("", '<astro-island uid="1" component-url="/_astro/x.js" data-nr-block><button>0</button></astro-island>');
    expect(islandProblems(home, false).join()).toMatch(/ilha React fora do wizard .*\/_astro\/x\.js/);
    expect(weightProblems(home, read).join()).toMatch(
      new RegExp(`JS .* > ${(WEIGHT_BUDGET.jsGz / 1024).toFixed(1).replace(".", "\\.")} KiB \\(página sem ilha permitida\\)`),
    );
    // Na rota do wizard a mesma ilha passa.
    expect(islandProblems(home, true)).toEqual([]);
    expect(weightProblems(home, read, true)).toEqual([]);
  });

  it("só /orcamento, /en/quote e /es/cotizacion podem ter ilha (rota quote de routes.ts)", async () => {
    const { islandFiles } = await import("@/integrations/verify-build");
    expect([...islandFiles()].sort()).toEqual(["en/quote.html", "es/cotizacion.html", "orcamento.html"]);
  });

  it("verifyDist acusa a ilha na Home (index.html) e aceita a do wizard", async () => {
    const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const { verifyDist } = await import("@/integrations/verify-build");
    const dir = mkdtempSync(join(tmpdir(), "verify-ilha-"));
    try {
      mkdirSync(join(dir, "_astro"));
      writeFileSync(join(dir, "_astro", "x.js"), noise(40 * 1024));
      const island = '<astro-island uid="1" component-url="/_astro/x.js" data-nr-block></astro-island>';
      writeFileSync(join(dir, "index.html"), page("", island));
      writeFileSync(join(dir, "orcamento.html"), page("", island));
      const problems = verifyDist(dir, {});
      expect(problems.filter((p) => p.startsWith("index.html:")).join("\n")).toMatch(/ilha React fora do wizard/);
      expect(problems.filter((p) => p.startsWith("index.html:")).join("\n")).toMatch(/JS .* gzip > 12\.0 KiB/);
      expect(problems.filter((p) => p.startsWith("orcamento.html:") && /ilha|JS/.test(p))).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("arquivo JS acima de 250 KiB brutos e fonte acima de 30 KiB reprovam", async () => {
    const { assetProblems } = await import("@/integrations/verify-build");
    expect(assetProblems([{ path: "_astro/a.js", size: 200 * 1024 }, { path: "_astro/f.woff2", size: 12_000 }])).toEqual([]);
    expect(assetProblems([{ path: "_astro/a.js", size: 251 * 1024 }]).join()).toMatch(/arquivo JS com 251\.0 KiB/);
    expect(assetProblems([{ path: "_astro/f.woff2", size: 31 * 1024 }]).join()).toMatch(/fonte com 31\.0 KiB/);
  });
});

describe("verify-build: todo CSS e JS do site conta, e terceiro só da lista (B097, revisor cético)", () => {
  const noise = (bytes: number) => Buffer.from(randomBytes(bytes * 2).toString("base64"));
  const page = (head: string, body = "") => `<html><head>${head}</head><body><h1>x</h1>${body}</body></html>`;
  const ANTD = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@4.24.16/dist/antd.min.css">';

  it("<script src> de public/scripts (fora de /_astro) acima de 12 KiB gzip reprova", async () => {
    const { weightProblems, pageWeight } = await import("@/integrations/verify-build");
    const assets: Record<string, Buffer> = { "/scripts/vendor-big.js": noise(20 * 1024) };
    const read = (path: string) => assets[path] ?? null;
    const html = page('<script src="/scripts/vendor-big.js" defer></script>');
    expect(pageWeight(html, read).jsGz).toBeGreaterThan(12 * 1024);
    expect(weightProblems(html, read).join()).toMatch(/JS .* gzip > 12\.0 KiB \(página sem ilha permitida\)/);
    // Endereço relativo, resolvido contra a página (en/index.html → /scripts/…), e import() de script inline também contam.
    expect(weightProblems(page('<script src="../scripts/vendor-big.js"></script>'), read, false, "en/index.html").join()).toMatch(/JS .* > 12\.0 KiB/);
    expect(weightProblems(page('<script type="module">import("/scripts/vendor-big.js")</script>'), read).join()).toMatch(/JS .* > 12\.0 KiB/);
  });

  it("CSS por <link rel=preload as=style> e por @import conta, sem contar o mesmo arquivo duas vezes", async () => {
    const { pageWeight } = await import("@/integrations/verify-build");
    const big = noise(4 * 1024);
    const assets: Record<string, Buffer> = { "/assets/a.css": big, "/_astro/b.css": Buffer.from('@import "/assets/a.css";body{color:red}') };
    const read = (path: string) => assets[path] ?? null;
    const once = pageWeight(page('<link rel="stylesheet" href="/assets/a.css">'), read).cssGz;
    expect(once).toBeGreaterThan(4 * 1024);
    expect(pageWeight(page('<link rel="preload" as="style" href="/assets/a.css"><link rel="stylesheet" href="/assets/a.css">'), read).cssGz).toBe(once);
    expect(pageWeight(page('<link rel="stylesheet" href="/_astro/b.css">'), read).cssGz).toBeGreaterThan(once);
  });

  it("antd.min.css de um CDN reprova (CSS de terceiro fora da lista)", async () => {
    const { thirdPartyProblems } = await import("@/integrations/verify-build");
    const read = () => null;
    expect(thirdPartyProblems(page(ANTD), read).join()).toMatch(/CSS\/JS de terceiro fora da lista .*cdn\.jsdelivr\.net\/npm\/antd@4\.24\.16/);
    expect(thirdPartyProblems(page('<script src="//unpkg.com/react@19/umd/react.production.min.js"></script>'), read)).toHaveLength(1);
    expect(thirdPartyProblems(page('<link rel="modulepreload" href="https://esm.sh/x.js">'), read)).toHaveLength(1);
    expect(thirdPartyProblems(page('<style>@import url("https://fonts.googleapis.com/css2?family=Inter");</style>'), read)).toHaveLength(1);
    // @import de terceiro escondido numa folha do próprio site.
    const assets: Record<string, Buffer> = { "/_astro/a.css": Buffer.from('@import "https://cdn.example.com/x.css";') };
    expect(thirdPartyProblems(page('<link rel="stylesheet" href="/_astro/a.css">'), (path) => assets[path] ?? null).join()).toMatch(/@import em \/_astro\/a\.css/);
    // O que não baixa CSS/JS não conta: preconnect, dns-prefetch, ícone, fonte e JSON-LD.
    const harmless =
      '<link rel="preconnect" href="https://www.googletagmanager.com"><link rel="dns-prefetch" href="https://bam.nr-data.net">' +
      '<link rel="icon" href="/favicon.svg"><link rel="preload" as="font" href="/_astro/f.woff2" crossorigin>' +
      '<script type="application/ld+json">{"url":"https://lemamon.dev"}</script><script type="module" src="/_astro/a.js"></script>';
    expect(thirdPartyProblems(page(harmless), read)).toEqual([]);
  });

  it("gtag.js é o único terceiro da lista, e só no build de produção (B277)", async () => {
    const { thirdPartyProblems, THIRD_PARTY_ALLOWLIST } = await import("@/integrations/verify-build");
    const read = () => null;
    const gtag = page('<script async src="https://www.googletagmanager.com/gtag/js?id=AW-16881353870"></script>');
    expect(THIRD_PARTY_ALLOWLIST.map((entry) => `${entry.origin}${entry.pathPrefix}`)).toEqual(["https://www.googletagmanager.com/gtag/js"]);
    expect(thirdPartyProblems(gtag, read, { production: true })).toEqual([]);
    expect(thirdPartyProblems(gtag, read, { production: false }).join()).toMatch(/só permitido em produção/);
    // Outro caminho do mesmo domínio não está na lista.
    expect(thirdPartyProblems(page('<script src="https://www.googletagmanager.com/gtm.js?id=GTM-X"></script>'), read, { production: true })).toHaveLength(1);
  });

  it("/scripts/newrelic.js fica fora do JS da página por NOME, com teto próprio de 30 KiB gzip", async () => {
    const { OWN_BUDGET_FILES, ownBudgetProblems, pageWeight, weightProblems } = await import("@/integrations/verify-build");
    const { NEW_RELIC_SCRIPT } = await import("@/config/site");
    const { readFileSync } = await import("node:fs");
    expect(Object.keys(OWN_BUDGET_FILES)).toEqual([NEW_RELIC_SCRIPT]);
    const real = readFileSync(`public${NEW_RELIC_SCRIPT}`);
    const read = (path: string) => (path === NEW_RELIC_SCRIPT ? real : null);
    const html = page(`<script defer src="${NEW_RELIC_SCRIPT}"></script>`);
    expect(pageWeight(html, read).jsGz).toBe(0);
    expect(weightProblems(html, read)).toEqual([]);
    // O arquivo real (≈ 21,7 KiB gzip) cabe no teto; um agente inchado não.
    expect(ownBudgetProblems(read)).toEqual([]);
    expect(ownBudgetProblems((path) => (path === NEW_RELIC_SCRIPT ? noise(40 * 1024) : null)).join()).toMatch(/scripts\/newrelic\.js: .* > 30\.0 KiB/);
    // O mesmo agente com outro nome conta no JS da página.
    expect(weightProblems(page('<script defer src="/scripts/agente.js"></script>'), (path) => (path === "/scripts/agente.js" ? noise(20 * 1024) : null)).join()).toMatch(
      /JS .* > 12\.0 KiB/,
    );
  });

  it("arquivo JS acima de 250 KiB em qualquer pasta do dist reprova (não só _astro)", async () => {
    const { assetProblems } = await import("@/integrations/verify-build");
    expect(assetProblems([{ path: "scripts/vendor-big.js", size: 400 * 1024 }]).join()).toMatch(/scripts\/vendor-big\.js: .* 400\.0 KiB/);
    expect(assetProblems([{ path: "assets/fonts/x.woff2", size: 31 * 1024 }]).join()).toMatch(/fonte com 31\.0 KiB/);
  });

  it("verifyDist: o experimento do revisor (vendor-big.js de 400 KB + antd do CDN no <head>) reprova pelos dois", async () => {
    const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const { verifyDist } = await import("@/integrations/verify-build");
    const dir = mkdtempSync(join(tmpdir(), "verify-terceiros-"));
    try {
      mkdirSync(join(dir, "scripts"));
      // 400 KiB exatos de base64 aleatório (comprime pouco: ≈ 300 KiB gzip).
      writeFileSync(join(dir, "scripts", "vendor-big.js"), Buffer.from(randomBytes(300 * 1024).toString("base64")));
      writeFileSync(join(dir, "index.html"), page(`<script src="/scripts/vendor-big.js" defer></script>${ANTD}`));
      const home = verifyDist(dir, {}).filter((p) => p.startsWith("index.html:") || p.startsWith("scripts/"));
      expect(home.join("\n")).toMatch(/index\.html: orçamento de peso: JS .* > 12\.0 KiB/);
      expect(home.join("\n")).toMatch(/index\.html: CSS\/JS de terceiro fora da lista .*antd/);
      expect(home.join("\n")).toMatch(/scripts\/vendor-big\.js: orçamento de peso: arquivo JS com 400\.0 KiB/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("verify-build: script inline síncrono ≤ 1 KiB (B104)", () => {
  it("reprova script clássico grande; module, JSON e o runtime de ilha do Astro passam", async () => {
    const { inlineScriptProblems } = await import("@/integrations/verify-build");
    const big = "x".repeat(1100);
    expect(inlineScriptProblems(`<script>${"y".repeat(900)}</script>`)).toEqual([]);
    expect(inlineScriptProblems(`<script>${big}</script>`)).toHaveLength(1);
    expect(inlineScriptProblems(`<script type="module">${big}</script>`)).toEqual([]);
    expect(inlineScriptProblems(`<script type="application/ld+json">${big}</script>`)).toEqual([]);
    const runtime = `<script>(function(){${big};customElements.get("astro-island")||customElements.define("astro-island",X)})()</script>`;
    expect(inlineScriptProblems(`${runtime}<astro-island></astro-island>`)).toEqual([]);
    // Sem ilha na página, o "runtime" não tem desculpa.
    expect(inlineScriptProblems(runtime)).toHaveLength(1);
  });

  it("o script do <head> que vai em toda página cabe no limite", async () => {
    const { inlineScriptProblems } = await import("@/integrations/verify-build");
    const { headInlineScript } = await import("@/scripts/head-inline");
    expect(inlineScriptProblems(`<script>${headInlineScript()}</script>`)).toEqual([]);
  });
});

describe("verify-build: WhatsApp no build de produção (B007)", () => {
  const home = (number: string) => `<a href="https://wa.me/${number}?text=Ol%C3%A1">WhatsApp</a>`;

  it("produção sem número, com número inválido ou com o número de TESTE reprova", async () => {
    const { whatsappLaunchProblems, TEST_WHATSAPP_NUMBER } = await import("@/integrations/verify-build");
    expect(whatsappLaunchProblems({ context: "production", homeHtml: "<p>sem botão</p>" }).join()).toMatch(/PUBLIC_WHATSAPP_NUMBER ausente ou inválido/);
    expect(whatsappLaunchProblems({ context: "production", homeHtml: home("48999999999") }).join()).toMatch(/PUBLIC_WHATSAPP_NUMBER ausente ou inválido/);
    expect(
      whatsappLaunchProblems({ context: "production", homeHtml: home(TEST_WHATSAPP_NUMBER), htmlWithTestNumber: ["index.html"] }).join(),
    ).toMatch(/número de TESTE 5548900000000/);
  });

  it("produção com número comercial válido passa; preview, branch deploy e local não mudam", async () => {
    const { whatsappLaunchProblems } = await import("@/integrations/verify-build");
    expect(whatsappLaunchProblems({ context: "production", homeHtml: home("5548999999999") })).toEqual([]);
    for (const context of ["deploy-preview", "branch-deploy", undefined]) {
      expect(whatsappLaunchProblems({ context, homeHtml: "<p>sem botão</p>" })).toEqual([]);
    }
    // Só os builds de teste que simulam produção (vitest.config.ts) aceitam o número de teste.
    expect(
      whatsappLaunchProblems({ context: "production", homeHtml: home("5548900000000"), htmlWithTestNumber: ["index.html"], allowTestNumber: true }),
    ).toEqual([]);
  });

  it("o número de teste é o mesmo do E2E (playwright.config.ts)", async () => {
    const { readFileSync } = await import("node:fs");
    const { TEST_WHATSAPP_NUMBER } = await import("@/integrations/verify-build");
    expect(readFileSync("playwright.config.ts", "utf8")).toContain(`E2E_WHATSAPP_NUMBER = "${TEST_WHATSAPP_NUMBER}"`);
  });
});

describe("verify-build: <img> com alt (B251, jsx-a11y/alt-text no HTML publicado)", () => {
  it("acusa <img> sem alt; alt vazio (decorativa) passa", async () => {
    const { altProblems } = await import("@/integrations/verify-build");
    expect(altProblems('<img src="a.png" alt="Tela do sistema"><img src="b.png" alt="">')).toEqual([]);
    expect(altProblems('<p><img src="a.png" width="10"></p>')).toHaveLength(1);
    expect(altProblems('<script>const x = "<img src=a>";</script>')).toEqual([]);
  });
});
