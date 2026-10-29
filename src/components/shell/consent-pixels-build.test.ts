/**
 * Aviso de cookies com os pixels opcionais no BUILD DE PRODUÇÃO REAL
 * (producaoComPixels do globalSetup, tests/unit/support/builds-dos-dados.ts;
 * backlog B346/B347). Dono: shell. Complementa o ConsentBanner.test.ts (que
 * renderiza o componente sozinho) e o dados-pixels.test.ts (gated: campo,
 * Política e CSP):
 *  - o texto do aviso cita o LinkedIn Insight Tag e o Meta Pixel nos 3
 *    idiomas, antes de pedir o aceite;
 *  - o Meta Pixel não sai nas páginas com formulário (wizard, pós-envio,
 *    contato), e sai nas outras.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { META_PIXEL_FREE_ROUTES } from "@/config/privacidade";
import { urlFor, type RouteKey } from "@/config/routes";
import { LOCALES } from "@/i18n/locales";
import { fileForPath, textOf } from "@/integrations/verify-build";
import { PIXEL_ATTRIBUTES } from "@/scripts/pixels";

const { producaoComPixels } = inject("buildsDosDados");
const page = (route: RouteKey, locale: (typeof LOCALES)[number]) => join(producaoComPixels.outDir, fileForPath(urlFor(route, locale)));
const built = producaoComPixels.status === 0 && existsSync(page("home", "pt"));
const banner = (html: string) => html.match(/<div[^>]*data-consent-banner[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)?.[0] ?? "";

// Sem o copy da Política dos pixels o build de produção cai de propósito (dados-pixels.test.ts cobre esse caso).
describe.runIf(built)("aviso de cookies com pixels, no build de produção (B346/B347)", () => {
  it("o texto do aviso informa o LinkedIn Insight Tag e o Meta Pixel nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      const text = textOf(banner(readFileSync(page("home", locale), "utf8")));
      expect(text, locale).toContain("LinkedIn Insight Tag");
      expect(text, locale).toContain("Meta Pixel");
    }
  });

  it("páginas com formulário sem data-meta-pixel-id; Home com os dois IDs", () => {
    for (const locale of LOCALES) {
      for (const route of META_PIXEL_FREE_ROUTES) {
        const file = page(route, locale);
        if (!existsSync(file)) continue;
        const html = readFileSync(file, "utf8");
        expect(html, `${route} ${locale}`).not.toContain(`${PIXEL_ATTRIBUTES.meta}=`);
        // O texto continua citando a Meta: o aceite dado aqui vale nas outras páginas.
        expect(textOf(banner(html)), `${route} ${locale}`).toContain("Meta Pixel");
      }
      const home = readFileSync(page("home", locale), "utf8");
      expect(home, locale).toContain(`${PIXEL_ATTRIBUTES.meta}=`);
      expect(home, locale).toContain(`${PIXEL_ATTRIBUTES.linkedin}=`);
    }
  });
});
