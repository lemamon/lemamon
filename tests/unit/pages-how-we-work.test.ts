/**
 * Como trabalhamos e CTA final dos serviços (dono: pages).
 *
 * B134 / painel de design: a linha how_we_work.engineering.profiles_fallback
 * ("Perfil público: a Lemamon no GitHub.") saía DUAS vezes seguidas, porque
 * HwwComparison (pages) e gated/EngineeringSection (gated) renderizavam a
 * mesma linha com a mesma condição. O dono único é o EngineeringSection, e a
 * view só o renderiza com hasEngineering: logo depois da tabela, a linha
 * levava a uma organização do GitHub sem repositório público (painel de
 * design, comercial). Com o dado real, a frase não aparece (0) e o GitHub fica
 * no rodapé; com a camada fictícia (hasEngineering), a seção completa entra.
 *
 * Serviços: os perfis no cta_final são a linha terciária (Profiles
 * variant="inline", services._notes.profiles_line), nunca os cards grandes,
 * que no fundo escuro deixavam o ícone sem contraste e empurravam ~750px de
 * links de saída para depois do CTA no mobile.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, inject, it } from "vitest";

import HwwComparison from "@/components/how-we-work/HwwComparison.astro";
import { SERVICE_KEYS, SERVICE_ROUTE, urlFor } from "@/config/routes";
import { t, type Locale } from "@/i18n";
import { fileForPath } from "@/integrations/verify-build";
import HowWeWorkView from "@/views/HowWeWorkView.astro";

const LOCALES: Locale[] = ["pt", "en", "es"];
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const occurrences = (html: string, needle: string) => html.split(needle).length - 1;
const main = (html: string) => html.slice(html.indexOf("<main"), html.indexOf("</main>"));
const built = (outDir: string, path: string) => readFileSync(join(outDir, fileForPath(path)), "utf8");

describe("Como trabalhamos: linha do GitHub numa fonte só (B134)", () => {
  for (const locale of LOCALES) {
    const phrase = t(locale, "how_we_work.engineering.profiles_fallback_link_phrase");

    it(`${locale}: HwwComparison nunca renderiza a linha (o dono é gated/EngineeringSection)`, async () => {
      const html = await container.renderToString(HwwComparison, { props: { locale } });
      expect(occurrences(html, phrase)).toBe(0);
      expect(html).not.toContain('data-profile="github"');
    });

    it(`${locale}: a view com o dado real não tem a linha do GitHub no <main> (fica no rodapé)`, async () => {
      const html = main(await container.renderToString(HowWeWorkView, { props: { locale } }));
      expect(occurrences(html, phrase)).toBe(0);
      expect(occurrences(html, 'data-profile="github"')).toBe(0);
    });
  }

  it("build com o dado real: nenhuma ocorrência no <main>; o GitHub segue no rodapé", () => {
    const { semFicticio } = inject("buildsDosDados");
    expect(semFicticio.status, semFicticio.saida).toBe(0);
    for (const locale of LOCALES) {
      const phrase = t(locale, "how_we_work.engineering.profiles_fallback_link_phrase");
      const path = urlFor("how_we_work", locale);
      const html = built(semFicticio.outDir, path);
      expect(occurrences(main(html), phrase), path).toBe(0);
      expect(occurrences(main(html), 'data-profile="github"'), path).toBe(0);
      expect(html.slice(html.indexOf("</main>")), path).toContain('data-profile="github"');
    }
  });

  it("build com a camada fictícia (hasEngineering): a seção completa substitui a linha (0)", () => {
    const { comFicticio } = inject("buildsDosDados");
    expect(comFicticio.status, comFicticio.saida).toBe(0);
    for (const locale of LOCALES) {
      const phrase = t(locale, "how_we_work.engineering.profiles_fallback_link_phrase");
      const path = urlFor("how_we_work", locale);
      const html = built(comFicticio.outDir, path);
      expect(occurrences(html, phrase), path).toBe(0);
      expect(html, path).toContain(t(locale, "how_we_work.engineering.title"));
    }
  });
});

describe("Serviços: perfis no CTA final como linha terciária", () => {
  it("5 serviços × 3 idiomas: Profiles inline dentro do cta_final, sem cards", () => {
    const { semFicticio } = inject("buildsDosDados");
    for (const locale of LOCALES) {
      for (const service of SERVICE_KEYS) {
        const path = urlFor(SERVICE_ROUTE[service], locale);
        const html = built(semFicticio.outDir, path);
        const cta = html.slice(html.indexOf('id="cta-final"'), html.indexOf("</main>"));
        expect(cta, path).toContain(t(locale, "services.template.profiles_line"));
        expect(cta, path).toMatch(/class="profiles-inline\b/);
        expect(cta, path).not.toMatch(/class="profile\b/);
        for (const profile of ["github", "linkedin", "medium"]) {
          expect(occurrences(cta, `data-profile="${profile}"`), `${path} ${profile}`).toBe(1);
        }
      }
    }
  });
});

describe("Como trabalhamos: 'o projeto vai parar no meio?' no FAQ do método (painel de design, comercial)", () => {
  const esc = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  for (const locale of LOCALES) {
    it(`${locale}: faq.items.wont_stall aparece uma vez no FAQ visível, depois de how_long`, async () => {
      // Sem os <script> (o JSON-LD do FAQ repete a pergunta dentro do <main>).
      const html = main(await container.renderToString(HowWeWorkView, { props: { locale } })).replace(
        /<script\b[\s\S]*?<\/script>/g,
        "",
      );
      const question = esc(t(locale, "faq.items.wont_stall.question"));
      expect(occurrences(html, question)).toBe(1);
      const howLong = html.indexOf(esc(t(locale, "faq.items.how_long.question")));
      if (howLong >= 0) expect(html.indexOf(question)).toBeGreaterThan(howLong);
    });
  }
});
