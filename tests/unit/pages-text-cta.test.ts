/**
 * Um rótulo primário só por página (B167, BLUEPRINT §8.6) — dono: pages.
 *
 * O TextCta (link de texto que fecha uma seção) passa por diagnosisCtaKey
 * (components/shared/cta-label.ts), como o CtaDiagnosis: com agenda online
 * (hasAgenda, dados/dono.json › agenda), TODO CTA de diagnóstico vira
 * "Agendar diagnóstico gratuito", inclusive o das seções de método
 * (label="method": *-metodo, preco-comparar, descoberta-perfis). Sem agenda
 * (produção hoje), nenhum vira "Agendar…". Vale para o CTA cujo texto é um
 * rótulo completo; link embutido numa frase do copy fica de fora.
 *
 * Build com a camada fictícia (agenda preenchida) e build com o dado real,
 * ambos do globalSetup (tests/unit/support/builds-dos-dados.ts).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { SERVICE_KEYS, SERVICE_ROUTE, urlFor, type RouteKey } from "@/config/routes";
import { t, type Locale } from "@/i18n";
import { fileForPath, textOf } from "@/integrations/verify-build";

const LOCALES: Locale[] = ["pt", "en", "es"];
const PAGES: RouteKey[] = ["how_we_work", "discovery_sprint", "pricing", "services_hub", ...SERVICE_KEYS.map((key) => SERVICE_ROUTE[key])];
/** Origens dos TextCta com label="method" (seções de método), as que ficavam com o rótulo antigo. */
const METHOD_ORIGINS = ["sistemas-web-metodo", "aplicativos-metodo", "integracoes-metodo", "mvp-metodo", "preco-comparar", "descoberta-perfis"];

const built = (outDir: string, path: string) => readFileSync(join(outDir, fileForPath(path)), "utf8");

/** [data-origem, texto] de cada CTA de diagnóstico (<a data-cta-id="diagnosis">) da página. */
function diagnosisCtas(html: string): Array<[string, string]> {
  return [...html.matchAll(/<a\b[^>]*data-cta-id="diagnosis"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [
    m[0].match(/data-origem="([^"]+)"/)?.[1] ?? "",
    textOf(m[1] ?? ""),
  ]);
}

describe("TextCta: um rótulo primário só por página (B167)", () => {
  it("com agenda (camada fictícia): nenhum CTA de diagnóstico fica com 'Pedir…' nas páginas de pages, nos 3 idiomas", () => {
    const { comFicticio } = inject("buildsDosDados");
    expect(comFicticio.status, comFicticio.saida).toBe(0);
    const seen = new Set<string>();
    for (const locale of LOCALES) {
      const schedule = t(locale, "shared.cta.primary_schedule");
      const ask = t(locale, "shared.cta.primary");
      const method = t(locale, "shared.cta.primary_method");
      for (const page of PAGES) {
        const path = urlFor(page, locale);
        const ctas = diagnosisCtas(built(comFicticio.outDir, path));
        expect(ctas.length, path).toBeGreaterThan(0);
        for (const [origem, text] of ctas) {
          // Link embutido numa frase ("…pedir o diagnóstico…", FAQ) não é rótulo de CTA.
          if (![ask, method, schedule].some((label) => text.includes(label))) continue;
          expect(text, `${path} ${origem}`).not.toContain(ask);
          expect(text, `${path} ${origem}`).not.toContain(method);
          expect(text, `${path} ${origem}`).toContain(schedule);
          if (METHOD_ORIGINS.includes(origem)) seen.add(`${locale}:${origem}`);
        }
      }
    }
    // As seções de método existem de fato no build (o teste não passa por omissão).
    for (const locale of LOCALES) {
      for (const origem of METHOD_ORIGINS) expect(seen.has(`${locale}:${origem}`), `${locale} ${origem}`).toBe(true);
    }
  });

  it("sem agenda (dado real): nenhum 'Agendar…', e as seções de método usam a variação de método", () => {
    const { semFicticio } = inject("buildsDosDados");
    expect(semFicticio.status, semFicticio.saida).toBe(0);
    for (const locale of LOCALES) {
      const schedule = t(locale, "shared.cta.primary_schedule");
      const method = t(locale, "shared.cta.primary_method");
      for (const page of PAGES) {
        const path = urlFor(page, locale);
        for (const [origem, text] of diagnosisCtas(built(semFicticio.outDir, path))) {
          expect(text, `${path} ${origem}`).not.toContain(schedule);
          if (METHOD_ORIGINS.includes(origem)) expect(text, `${path} ${origem}`).toBe(method);
        }
      }
    }
  });
});
