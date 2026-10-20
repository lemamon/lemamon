/**
 * Sprint de Descoberta e páginas de serviço no build (dono: pages).
 *
 * B354: "O que a Descoberta não inclui" vem colada em "O que você recebe", com
 * o mesmo destaque (H2 do mesmo nível, mesma superfície). Só sai com
 * dados/dono.json › descoberta.naoInclui (hasDiscoveryExclusions): no build
 * com a camada fictícia aparece nos 3 idiomas; no build com o dado real
 * (naoInclui null), nem a âncora existe.
 *
 * Painel de design: na sustentação, what_it_is ("o que é cada uma") vem logo
 * depois dos sinais e antes dos exemplos, e o FAQ abre por how_it_starts; nas 4
 * páginas de projeto, o diagnóstico é o único link com seta em "Como funciona"
 * e em "O que pesa no preço" (os links de saída são terciários).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { SERVICE_KEYS, SERVICE_ROUTE, urlFor } from "@/config/routes";
import { t, type Locale } from "@/i18n";
import { fileForPath, textOf } from "@/integrations/verify-build";

const LOCALES: Locale[] = ["pt", "en", "es"];
const built = (outDir: string, path: string) => readFileSync(join(outDir, fileForPath(path)), "utf8");
const main = (html: string) => html.slice(html.indexOf("<main"), html.indexOf("</main>"));
/** Trecho de uma <section id="…"> até a próxima <section (as seções destas páginas não se aninham). */
function section(html: string, id: string): string {
  const open = html.match(new RegExp(`<section[^>]*\\bid="${id}"[^>]*>`));
  if (!open || open.index === undefined) return "";
  const next = html.indexOf("<section", open.index + open[0].length);
  return html.slice(open.index, next > 0 ? next : undefined);
}
const h2Of = (html: string, id: string) => html.match(new RegExp(`<h2[^>]*id="${id}"`))?.[0] ?? null;
const sectionTag = (html: string, id: string) => html.match(new RegExp(`<section[^>]*id="${id}"[^>]*>`))?.[0] ?? null;

describe("Sprint de Descoberta: 'O que a Descoberta não inclui' (B354)", () => {
  it("camada fictícia: a seção aparece logo depois de 'O que você recebe', com H2 do mesmo nível e a mesma superfície", () => {
    const { comFicticio } = inject("buildsDosDados");
    expect(comFicticio.status, comFicticio.saida).toBe(0);
    for (const locale of LOCALES) {
      const path = urlFor("discovery_sprint", locale);
      const html = main(built(comFicticio.outDir, path));
      const deliverables = html.indexOf('id="entregaveis"');
      const exclusions = html.indexOf('id="o-que-nao-inclui"');
      const whoFor = html.indexOf('id="para-quem"');
      expect(exclusions, path).toBeGreaterThan(deliverables);
      expect(whoFor, path).toBeGreaterThan(exclusions);
      expect(h2Of(html, "entregaveis-title"), path).not.toBeNull();
      expect(h2Of(html, "o-que-nao-inclui-title"), path).not.toBeNull();
      expect(textOf(html), path).toContain(t(locale, "discovery_sprint.exclusions.title"));
      // Mesmo destaque: as duas seções na superfície sutil.
      expect(sectionTag(html, "entregaveis"), path).toContain('data-bg="subtle"');
      expect(sectionTag(html, "o-que-nao-inclui"), path).toContain('data-bg="subtle"');
      expect(section(html, "o-que-nao-inclui").match(/<li/g)?.length ?? 0, path).toBeGreaterThanOrEqual(1);
    }
  });

  it("dado real (descoberta.naoInclui null): nem a âncora, nem o título", () => {
    const { semFicticio } = inject("buildsDosDados");
    expect(semFicticio.status, semFicticio.saida).toBe(0);
    for (const locale of LOCALES) {
      const path = urlFor("discovery_sprint", locale);
      const html = built(semFicticio.outDir, path);
      expect(html, path).not.toContain("o-que-nao-inclui");
      expect(textOf(html), path).not.toContain(t(locale, "discovery_sprint.exclusions.title"));
      expect(html, path).toContain('id="entregaveis"');
    }
  });
});

describe("Sustentação: termos definidos antes do uso e FAQ abrindo pela objeção real (painel de design)", () => {
  it("what_it_is vem depois dos sinais e antes dos exemplos; o FAQ abre por how_it_starts", () => {
    const { semFicticio } = inject("buildsDosDados");
    for (const locale of LOCALES) {
      const path = urlFor("service_support", locale);
      const html = main(built(semFicticio.outDir, path));
      const signals = html.indexOf('id="sinais"');
      const whatItIs = html.indexOf('id="o-que-e"');
      const examples = html.indexOf('id="exemplos"');
      expect(signals, path).toBeGreaterThan(-1);
      expect(whatItIs, path).toBeGreaterThan(signals);
      expect(examples, path).toBeGreaterThan(whatItIs);
      const firstOpen = html.match(/<details[^>]*\bopen\b[^>]*>[\s\S]*?<\/summary>/)?.[0] ?? "";
      expect(textOf(firstOpen), path).toContain(t(locale, "services.support.faq.how_it_starts.question"));
    }
  });
});

describe("Páginas de projeto: um destaque só por seção (painel de design)", () => {
  const PROJECTS = SERVICE_KEYS.filter((key) => key !== "support");

  it("'Como funciona' e 'O que pesa no preço': só o diagnóstico é link com seta; as saídas são terciárias", () => {
    const { semFicticio } = inject("buildsDosDados");
    for (const locale of LOCALES) {
      for (const service of PROJECTS) {
        const path = urlFor(SERVICE_ROUTE[service], locale);
        const html = main(built(semFicticio.outDir, path));
        for (const id of ["como-funciona", "o-que-pesa-no-preco"]) {
          const part = section(html, id);
          expect(part, `${path} #${id}`).not.toBe("");
          const arrowLinks = part.match(/<a[^>]*class="arrow-link[^"]*"[^>]*>/g) ?? [];
          expect(arrowLinks, `${path} #${id}`).toHaveLength(1);
          expect(arrowLinks[0], `${path} #${id}`).toContain('data-cta-id="diagnosis"');
        }
        expect(section(html, "como-funciona"), path).toContain(`href="${urlFor("how_we_work", locale)}"`);
        expect(section(html, "o-que-pesa-no-preco"), path).toContain(`href="${urlFor("pricing", locale)}"`);
      }
    }
  });

  it("FAQ das 3 páginas da PME com 'o projeto vai parar no meio?' (faq.items.wont_stall)", () => {
    const { semFicticio } = inject("buildsDosDados");
    for (const locale of LOCALES) {
      for (const service of ["web_systems", "mobile_apps", "integrations"] as const) {
        const path = urlFor(SERVICE_ROUTE[service], locale);
        const html = section(main(built(semFicticio.outDir, path)), "perguntas");
        expect(textOf(html), path).toContain(t(locale, "faq.items.wont_stall.question"));
        expect(html.match(/<details/g)?.length ?? 0, path).toBeLessThanOrEqual(9);
      }
    }
  });
});
