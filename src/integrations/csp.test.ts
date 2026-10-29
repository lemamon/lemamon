/**
 * CSP gerada no build (backlog B254) — src/integrations/csp.ts. Dono: shell.
 * Funções puras + os builds reais do globalSetup (tests/unit/support/builds-dos-dados.ts):
 * o dist/_headers lista o hash de TODO script inline publicado e nada mais
 * libera script inline.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import {
  CSP_ENFORCE,
  CSP_REPORT_PATH,
  cspHeaderName,
  cspInlineProblems,
  cspPolicy,
  cspReportUri,
  headersFile,
  HEADERS_FILE,
  inlineScriptHashes,
  PIXEL_ATTRIBUTES,
} from "./csp";

const sha = (text: string) => createHash("sha256").update(text, "utf8").digest("base64");
const directive = (policy: string, name: string) => policy.split("; ").find((part) => part.startsWith(`${name} `)) ?? "";

describe("inlineScriptHashes", () => {
  it("hash de cada script inline executável (clássico e module); src, JSON e JSON-LD ficam de fora", () => {
    const html = [
      "<script>var a=1</script>",
      '<script type="module">import"/_astro/x.js"</script>',
      '<script src="/_astro/y.js"></script>',
      '<script type="module" src="/_astro/z.js"></script>',
      '<script type="application/ld+json">{"@type":"Organization"}</script>',
      '<script type="application/json">{"a":1}</script>',
    ].join("");
    expect(inlineScriptHashes(html)).toEqual([sha("var a=1"), sha('import"/_astro/x.js"')]);
  });

  it("o hash é do texto exato (espaços e quebras de linha contam)", () => {
    expect(inlineScriptHashes("<script>\n  x()\n</script>")).toEqual([sha("\n  x()\n")]);
  });
});

describe("cspPolicy", () => {
  const policy = cspPolicy({ hashes: ["bbb=", "aaa=", "aaa="], enforce: false });

  it("script-src com 'self', os hashes (únicos e em ordem) e as tags de medição, SEM 'unsafe-inline'", () => {
    const scripts = directive(policy, "script-src");
    expect(scripts).toMatch(/^script-src 'self' 'sha256-aaa=' 'sha256-bbb=' https:\/\/www\.googletagmanager\.com/);
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).toContain("https://js-agent.newrelic.com");
  });

  it("mantém o resto da política de antes (frame-ancestors, form-action, object-src…)", () => {
    for (const part of ["default-src 'self'", "frame-ancestors 'none'", "form-action 'self'", "base-uri 'self'", "object-src 'none'", "worker-src 'self' blob:"]) {
      expect(policy).toContain(part);
    }
    expect(directive(policy, "connect-src")).toContain("https://bam.nr-data.net");
    expect(directive(policy, "connect-src")).toContain("https://pagead2.googlesyndication.com");
    expect(directive(policy, "style-src")).toBe("style-src 'self' 'unsafe-inline'");
  });

  it("cobre o guia oficial de CSP do Google para GA4 com Ads e Google Ads (conversão, remarketing, linker) — B254", () => {
    // developers.google.com/tag-platform/security/guides/csp (20/out/2026), host a host.
    const need: Record<string, string[]> = {
      "script-src": ["https://www.googletagmanager.com", "https://www.googleadservices.com", "https://www.google.com"],
      "img-src": [
        "https://www.googletagmanager.com",
        "https://x.google-analytics.com",
        "https://www.google.com",
        "https://www.google.com.br",
        "https://stats.g.doubleclick.net",
        "https://googleads.g.doubleclick.net",
        "https://pagead2.googlesyndication.com",
        "https://www.googleadservices.com",
      ],
      "connect-src": [
        "https://www.googletagmanager.com",
        "https://region1.google-analytics.com",
        "https://region1.analytics.google.com",
        "https://www.google.com",
        "https://www.google.com.br",
        "https://stats.g.doubleclick.net",
        "https://googleads.g.doubleclick.net",
        "https://ad.doubleclick.net",
        "https://pagead2.googlesyndication.com",
        "https://www.googleadservices.com",
      ],
      "frame-src": ["https://www.googletagmanager.com", "https://td.doubleclick.net"],
    };
    const allows = (sources: string[], url: string) =>
      sources.some((source) => {
        const host = new URL(url).host;
        if (!source.startsWith("https://")) return false;
        const pattern = source.slice("https://".length);
        return pattern.startsWith("*.") ? host.endsWith(pattern.slice(1)) : host === pattern;
      });
    for (const [name, urls] of Object.entries(need)) {
      const sources = directive(policy, name).split(" ").slice(1);
      for (const url of urls) expect(allows(sources, url), `${name} libera ${url}`).toBe(true);
    }
  });

  it("upgrade-insecure-requests só na política efetiva (Report-Only ignora e avisa no console)", () => {
    expect(policy).not.toContain("upgrade-insecure-requests");
    expect(cspPolicy({ hashes: [], enforce: true })).toMatch(/; upgrade-insecure-requests$/);
  });

  it("domínios do LinkedIn e da Meta só com o pixel publicado (B346/B347)", () => {
    expect(policy).not.toMatch(/licdn|linkedin|facebook/);
    const withPixels = cspPolicy({ hashes: [], linkedin: true, meta: true });
    expect(directive(withPixels, "script-src")).toContain("https://snap.licdn.com");
    expect(directive(withPixels, "script-src")).toContain("https://connect.facebook.net");
    expect(directive(withPixels, "img-src")).toContain("https://px.ads.linkedin.com");
    expect(directive(withPixels, "connect-src")).toContain("https://www.facebook.com");
  });

  it("_headers do Netlify: regra /* com o header do modo atual", () => {
    const file = headersFile("default-src 'self'", false);
    expect(file).toMatch(/^\/\*\n {2}Content-Security-Policy-Report-Only: default-src 'self'\n$/m);
    expect(headersFile("x", true)).toContain("\n  Content-Security-Policy: x\n");
    expect(cspHeaderName()).toBe(CSP_ENFORCE ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only");
  });
});

describe("relatórios de violação (B254)", () => {
  it("destino padrão é a função do site; CSP_REPORT_URI (https) troca; valor inválido derruba o build", () => {
    expect(cspReportUri({})).toBe(CSP_REPORT_PATH);
    expect(CSP_REPORT_PATH).toBe("/.netlify/functions/csp-report");
    expect(cspReportUri({ CSP_REPORT_URI: " https://lemamon.report-uri.com/r/d/csp/reportOnly " })).toBe(
      "https://lemamon.report-uri.com/r/d/csp/reportOnly",
    );
    expect(() => cspReportUri({ CSP_REPORT_URI: "http://x.example/r" })).toThrow(/precisa ser https/);
    expect(() => cspReportUri({ CSP_REPORT_URI: "coletor" })).toThrow(/CSP_REPORT_URI inválida/);
  });

  it("a política leva report-uri e report-to; o _headers, o Reporting-Endpoints do mesmo endpoint", () => {
    const policy = cspPolicy({ hashes: [], enforce: false, reportUri: CSP_REPORT_PATH });
    expect(policy).toContain(`; report-uri ${CSP_REPORT_PATH}; report-to csp`);
    const file = headersFile(policy, false, CSP_REPORT_PATH);
    expect(file).toContain(`\n  Reporting-Endpoints: csp="${CSP_REPORT_PATH}"\n`);
    // Sem destino, nada de relatório (e nenhuma linha a mais).
    expect(cspPolicy({ hashes: [] })).not.toMatch(/report-(uri|to)/);
    expect(headersFile("x", false)).not.toContain("Reporting-Endpoints");
  });

  it("a função do Netlify existe e o netlify.toml declara a pasta", async () => {
    expect(existsSync("netlify/functions/csp-report.mjs")).toBe(true);
    expect(readFileSync("netlify.toml", "utf8")).toMatch(/\[functions\]\s*\n\s*directory = "netlify\/functions"/);
  });
});

describe("cspInlineProblems", () => {
  it("acusa handler inline e javascript:, que nenhum hash libera", () => {
    expect(cspInlineProblems('<button onclick="x()">a</button>')).toHaveLength(1);
    expect(cspInlineProblems('<img src="a.png" onerror="x()">')).toHaveLength(1);
    expect(cspInlineProblems('<a href="javascript:void(0)">a</a>')).toHaveLength(1);
  });

  it("não confunde data-on*, texto e código de script com handler", () => {
    expect(cspInlineProblems('<a data-onboarding="1" href="/x">online = sim</a><script>el.onclick=f</script>')).toEqual([]);
  });
});

describe("dist/_headers dos builds reais", () => {
  const builds = inject("buildsDosDados");
  const htmls = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) return htmls(full);
      return name.endsWith(".html") ? [full] : [];
    });

  for (const [label, build] of [
    ["local sem a camada", builds.semFicticio],
    ["local com a camada fictícia", builds.comFicticio],
    ["produção (CONTEXT=production, com gtag)", builds.producaoSemFlag],
  ] as const) {
    it(`${label}: uma política só, com o hash de cada script inline publicado`, () => {
      expect(build.status, build.saida.slice(-2000)).toBe(0);
      const file = join(build.outDir, HEADERS_FILE);
      expect(existsSync(file)).toBe(true);
      const headers = readFileSync(file, "utf8");
      const lines = headers.split("\n").filter((line) => /^\s+Content-Security-Policy/.test(line));
      expect(lines).toHaveLength(1);
      const policy = lines[0]?.replace(/^\s+[^:]+:\s*/, "") ?? "";
      const scripts = directive(policy, "script-src");
      expect(scripts).not.toContain("'unsafe-inline'");

      const published = new Set(htmls(build.outDir).flatMap((page) => inlineScriptHashes(readFileSync(page, "utf8"))));
      expect(published.size).toBeGreaterThan(2);
      for (const hash of published) expect(scripts, hash).toContain(`'sha256-${hash}'`);
      // Nenhum hash sobrando (política exata deste build).
      expect(scripts.match(/'sha256-/g)?.length).toBe(published.size);
      // Relatórios de violação para a função do site (B254), pelos dois caminhos.
      expect(policy).toContain(`report-uri ${CSP_REPORT_PATH}`);
      expect(policy).toContain("report-to csp");
      expect(headers).toContain(`Reporting-Endpoints: csp="${CSP_REPORT_PATH}"`);
      // Pixel nenhum configurado hoje (dados/dono.json): domínios fora.
      const pages = htmls(build.outDir).map((page) => readFileSync(page, "utf8")).join("");
      expect(pages).not.toContain(PIXEL_ATTRIBUTES.linkedin);
      expect(policy).not.toMatch(/licdn|facebook/);
    });
  }

  it("produção: o snippet do gtag (só em produção) está entre os hashes", () => {
    const home = readFileSync(join(builds.producaoSemFlag.outDir, "index.html"), "utf8");
    const gtag = [...home.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1] ?? "").find((body) => body.includes("window.dataLayer"));
    expect(gtag).toBeTruthy();
    expect(readFileSync(join(builds.producaoSemFlag.outDir, HEADERS_FILE), "utf8")).toContain(`'sha256-${sha(gtag ?? "")}'`);
  });
});
