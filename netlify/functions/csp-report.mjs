/**
 * Coletor dos relatórios de violação da CSP (backlog B254) — dono: shell.
 *
 * A política gerada no build (src/integrations/csp.ts) manda o navegador
 * avisar aqui, por report-uri e por report-to (header Reporting-Endpoints no
 * dist/_headers), toda vez que algo seria bloqueado. Em Report-Only nada é
 * bloqueado: o relatório mostra o que QUEBRARIA com a política efetiva. É a
 * medição de "uma semana sem violações" com tráfego real, com GA4, Google Ads
 * e New Relic carregados (só existem no build de produção), antes de trocar
 * CSP_ENFORCE para true.
 *
 * Endereço: /.netlify/functions/csp-report (padrão do Netlify para
 * netlify/functions/*; a função existe em produção e em cada deploy preview).
 * Para mandar os relatórios a um coletor externo (ex.: report-uri.com), basta
 * a variável de build CSP_REPORT_URI no painel do Netlify; aí esta função
 * deixa de ser chamada.
 *
 * Onde ver: painel do Netlify › Logs › Functions › csp-report, linhas
 * "[csp-report] {…}". Nenhuma linha = nenhuma violação.
 *
 * Privacidade: registra só origem + caminho das URLs (sem query string nem
 * fragmento), a diretiva, a disposição (report/enforce), arquivo e linha.
 * Nada do corpo bruto, de IP ou de user agent. Função sem dependências: o
 * Netlify empacota o arquivo como está (Functions 2.0, Request → Response).
 */

/** Corpo maior que isso é recusado (um relatório real tem menos de 2 KB). */
export const MAX_BODY_BYTES = 64 * 1024;

/** Relatórios por pedido (o Reporting API manda em lote). */
export const MAX_REPORTS = 20;

/** Origem + caminho de uma URL; palavras-chave da CSP ("inline", "eval", "self") ficam como estão. */
export function stripUrl(value) {
  if (typeof value !== "string" || value === "") return "";
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) return value.slice(0, 100);
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return `${url.origin}${url.pathname}`.slice(0, 300);
    return url.protocol;
  } catch {
    return value.slice(0, 100);
  }
}

const text = (value, max) => (typeof value === "string" ? value.slice(0, max) : "");
const lineOf = (value) => (Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : undefined);

/**
 * Relatórios normalizados de um corpo JSON nos dois formatos que os
 * navegadores mandam: report-uri ({"csp-report": {…}}) e Reporting API
 * ([{type: "csp-violation", url, body: {…}}]). Corpo inválido = lista vazia.
 */
export function parseCspReports(body) {
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return [];
  }
  const items = Array.isArray(data) ? data : [data];
  const reports = [];
  for (const item of items.slice(0, MAX_REPORTS)) {
    if (!item || typeof item !== "object") continue;
    const legacy = item["csp-report"];
    if (legacy && typeof legacy === "object") {
      reports.push({
        page: stripUrl(legacy["document-uri"]),
        blocked: stripUrl(legacy["blocked-uri"]),
        directive: text(legacy["effective-directive"] || legacy["violated-directive"], 100),
        disposition: text(legacy.disposition, 20),
        source: stripUrl(legacy["source-file"]),
        line: lineOf(legacy["line-number"]),
      });
      continue;
    }
    if (item.type === "csp-violation" && item.body && typeof item.body === "object") {
      const report = item.body;
      reports.push({
        page: stripUrl(report.documentURL || item.url),
        blocked: stripUrl(report.blockedURL),
        directive: text(report.effectiveDirective, 100),
        disposition: text(report.disposition, 20),
        source: stripUrl(report.sourceFile),
        line: lineOf(report.lineNumber),
      });
    }
  }
  return reports;
}

export default async function cspReport(request) {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return new Response(null, { status: 413 });
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return new Response(null, { status: 413 });
  for (const report of parseCspReports(body)) console.warn(`[csp-report] ${JSON.stringify(report)}`);
  return new Response(null, { status: 204 });
}
