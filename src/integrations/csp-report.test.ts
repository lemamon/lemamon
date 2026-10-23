/**
 * Coletor dos relatórios de violação da CSP (backlog B254):
 * netlify/functions/csp-report.mjs. Dono: shell.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import cspReport, { MAX_BODY_BYTES, parseCspReports, stripUrl } from "../../netlify/functions/csp-report.mjs";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseCspReports", () => {
  it("formato report-uri: normaliza e tira query string e fragmento", () => {
    const body = JSON.stringify({
      "csp-report": {
        "document-uri": "https://lemamon.dev/orcamento?origem=home-hero&email=a@b.c#p3",
        "blocked-uri": "https://www.googletagmanager.com/gtag/js?id=G-XYZ",
        "violated-directive": "script-src-elem",
        "effective-directive": "script-src-elem",
        disposition: "report",
        "source-file": "https://lemamon.dev/_astro/x.js?v=1",
        "line-number": 12,
      },
    });
    expect(parseCspReports(body)).toEqual([
      {
        page: "https://lemamon.dev/orcamento",
        blocked: "https://www.googletagmanager.com/gtag/js",
        directive: "script-src-elem",
        disposition: "report",
        source: "https://lemamon.dev/_astro/x.js",
        line: 12,
      },
    ]);
  });

  it("formato Reporting API (lote): só csp-violation; palavras-chave ficam como estão", () => {
    const body = JSON.stringify([
      { type: "csp-violation", url: "https://lemamon.dev/", body: { blockedURL: "inline", effectiveDirective: "script-src-elem", disposition: "report", lineNumber: 3 } },
      { type: "deprecation", url: "https://lemamon.dev/", body: { id: "x" } },
    ]);
    expect(parseCspReports(body)).toEqual([
      { page: "https://lemamon.dev/", blocked: "inline", directive: "script-src-elem", disposition: "report", source: "", line: 3 },
    ]);
  });

  it("corpo inválido ou estranho: nenhum relatório", () => {
    expect(parseCspReports("not json")).toEqual([]);
    expect(parseCspReports("42")).toEqual([]);
    expect(parseCspReports(JSON.stringify([null, "x", { foo: 1 }]))).toEqual([]);
    expect(stripUrl("data:image/png;base64,AAAA")).toBe("data:");
  });
});

describe("função csp-report", () => {
  const post = (body: string, headers: Record<string, string> = {}) =>
    new Request("https://lemamon.dev/.netlify/functions/csp-report", { method: "POST", body, headers: { "content-type": "application/csp-report", ...headers } });

  it("POST registra cada violação (console.warn) e responde 204", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const response = await cspReport(post(JSON.stringify({ "csp-report": { "document-uri": "https://lemamon.dev/", "blocked-uri": "eval" } })));
    expect(response.status).toBe(204);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/^\[csp-report\] \{"page":"https:\/\/lemamon\.dev\/","blocked":"eval"/);
  });

  it("GET é 405; corpo grande demais é 413", async () => {
    expect((await cspReport(new Request("https://lemamon.dev/.netlify/functions/csp-report"))).status).toBe(405);
    expect((await cspReport(post("x".repeat(MAX_BODY_BYTES + 1)))).status).toBe(413);
  });
});
