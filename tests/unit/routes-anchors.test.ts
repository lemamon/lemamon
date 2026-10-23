/**
 * Âncoras localizadas em en/es (auditoria SEO S01-8; parte das âncoras da F71
 * da auditoria de conversão) — src/config/routes.ts (ANCHORS,
 * LOCALIZED_ANCHORS, anchorId, anchorAlias, anchorFor) e Section `aliasId`.
 * Dono: shell.
 *
 *  - o id publicado em en/es sai do idioma; o pt nunca muda;
 *  - a seção leva o id pt como alias vazio, para link antigo continuar
 *    caindo na seção;
 *  - nos builds (com e sem a camada fictícia, que liga as seções when_data):
 *    nenhum id repetido numa página, todo link "#…" e "/página#…" interno
 *    aponta para um id que existe, e em en/es os links usam o id localizado
 *    (o alias é só compatibilidade, ninguém do site linka para ele).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, inject, it } from "vitest";

import { anchorAlias, anchorFor, anchorId, ANCHORS, LOCALIZED_ANCHORS, localeFromPath, normalizePath, urlFor } from "@/config/routes";
import { fileForPath } from "@/integrations/verify-build";

const ANCHOR_IDS: string[] = Object.values(ANCHORS).flatMap((value) => (typeof value === "string" ? [value] : Object.values(value)));

describe("anchorId, anchorAlias e anchorFor", () => {
  it("pt nunca muda; en/es saem no idioma; id fora do mapa volta igual", () => {
    expect(anchorId(ANCHORS.stage.development, "pt")).toBe("desenvolvimento");
    expect(anchorId(ANCHORS.stage.development, "en")).toBe("development");
    expect(anchorId(ANCHORS.stage.development, "es")).toBe("desarrollo");
    expect(anchorId(ANCHORS.stage.support, "es")).toBe("mantenimiento");
    expect(anchorId(ANCHORS.faq, "en")).toBe("faq");
    expect(anchorId(ANCHORS.stage.diagnosis, "es")).toBe("diagnostico");
    expect(anchorId("riscos", "en")).toBe("riscos");
    expect(anchorFor("how_we_work", "en", ANCHORS.stage.development)).toBe("/en/how-we-work#development");
    expect(anchorFor("pricing", "es", ANCHORS.howToCompare)).toBe("/es/cuanto-cuesta#como-comparar");
    expect(anchorFor("how_we_work", "pt", ANCHORS.stage.discovery)).toBe("/como-trabalhamos#descoberta");
  });

  it("alias = o id pt só quando o publicado difere", () => {
    expect(anchorAlias(ANCHORS.stage.development, "en")).toBe("desenvolvimento");
    expect(anchorAlias(ANCHORS.stage.development, "pt")).toBeUndefined();
    expect(anchorAlias(ANCHORS.stage.diagnosis, "es")).toBeUndefined();
  });

  it("o mapa cobre todas as âncoras de ANCHORS, com ids válidos e sem colisão entre idiomas", () => {
    expect(Object.keys(LOCALIZED_ANCHORS).sort()).toEqual([...ANCHOR_IDS].sort());
    for (const locale of ["en", "es"] as const) {
      const published = ANCHOR_IDS.map((id) => anchorId(id, locale));
      expect(new Set(published).size, locale).toBe(published.length);
      for (const [index, id] of published.entries()) {
        expect(id, locale).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        // O id localizado nunca é o id pt de OUTRA âncora (o alias dela colidiria).
        const other = ANCHOR_IDS.findIndex((pt) => pt === id);
        expect(other === -1 || other === index, `${locale} ${id}`).toBe(true);
      }
    }
  });
});

/** Arquivos .html de um dist. */
function htmlFiles(dir: string, root = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full, root);
    return name.endsWith(".html") ? [relative(root, full).split(sep).join("/")] : [];
  });
}

const idsOf = (html: string) =>
  [...html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ").matchAll(/<[a-z][^>]*?\sid="([^"]+)"/gi)].map((match) => match[1] as string);
const hrefsOf = (html: string) => [...html.matchAll(/<a\b[^>]*?\shref="([^"]+)"/gi)].map((match) => (match[1] as string).replace(/&amp;/g, "&"));

/** Ids que só existem por JS (o link é interceptado pelo script, sem alvo no HTML). */
const SCRIPT_TARGETS = new Set(["preferencias-de-cookies"]);

describe("âncoras nos builds", () => {
  for (const build of ["semFicticio", "comFicticio"] as const) {
    it(`${build}: sem id repetido; todo link interno com # aponta para um id que existe, no idioma da página`, () => {
      const outDir = inject("buildsDosDados")[build].outDir;
      const files = htmlFiles(outDir);
      expect(files.length).toBeGreaterThan(40);
      const ids = new Map(files.map((file) => [file, idsOf(readFileSync(join(outDir, file), "utf8"))]));
      const problems: string[] = [];
      for (const file of files) {
        const list = ids.get(file) ?? [];
        const repeated = [...new Set(list.filter((id, index) => list.indexOf(id) !== index))];
        if (repeated.length) problems.push(`${file}: id repetido ${repeated.join(", ")}`);
        const html = readFileSync(join(outDir, file), "utf8");
        for (const href of hrefsOf(html)) {
          const hash = href.indexOf("#");
          if (hash < 0 || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
          const id = decodeURIComponent(href.slice(hash + 1));
          if (!id || SCRIPT_TARGETS.has(id)) continue;
          const path = href.slice(0, hash).split("?")[0] ?? "";
          const target = path ? fileForPath(normalizePath(path)) : file;
          const targetIds = ids.get(target);
          if (!targetIds) continue; // página fora deste build (when_data): a checagem de rota é do verify-build
          if (!targetIds.includes(id)) problems.push(`${file}: ${href} sem alvo em ${target}`);
          const locale = localeFromPath(path || `/${file}`);
          // Em en/es, o link usa o id localizado; o id pt é só alias de compatibilidade.
          if (locale !== "pt" && LOCALIZED_ANCHORS[id]?.[locale] && LOCALIZED_ANCHORS[id]?.[locale] !== id) {
            problems.push(`${file}: ${href} usa o id pt; use anchorId/anchorFor (${LOCALIZED_ANCHORS[id]?.[locale]})`);
          }
        }
      }
      expect(problems).toEqual([]);
    });
  }

  it("en/es: a seção tem o id localizado e o alias pt; pt fica como estava", () => {
    const outDir = inject("buildsDosDados").semFicticio.outDir;
    const page = (path: string) => readFileSync(join(outDir, fileForPath(path)), "utf8");
    const en = page(urlFor("how_we_work", "en"));
    expect(en).toMatch(/<section[^>]*\bid="development"/);
    expect(en).toMatch(/<span id="desenvolvimento" class="section__alias sr-only" aria-hidden="true"/);
    const es = page(urlFor("how_we_work", "es"));
    expect(es).toMatch(/<section[^>]*\bid="desarrollo"/);
    expect(es).toMatch(/<span id="desenvolvimento" class="section__alias sr-only"/);
    // Mesmo id nos dois idiomas: sem alias.
    expect(es).toMatch(/<section[^>]*\bid="diagnostico"/);
    expect(es).not.toMatch(/<span id="diagnostico"/);
    const pt = page(urlFor("how_we_work", "pt"));
    expect(pt).toMatch(/<section[^>]*\bid="desenvolvimento"/);
    expect(pt).not.toContain("section__alias");
    expect(page(urlFor("contact", "en"))).toContain('href="#form"');
    expect(page(urlFor("home", "es"))).toContain(`href="${anchorFor("pricing", "es", ANCHORS.howToCompare)}"`);
  });
});
