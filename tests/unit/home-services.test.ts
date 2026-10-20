/**
 * Home §6.1 #8 `services` — layout da lista no mobile (painel de design,
 * ux_writer: em 375px a coluna do ícone de 44px deixava o texto com ~240px e
 * as descrições em 4–6 linhas). Dono: home.
 *  - o ícone (decorativo) mora no <h3>: abaixo de 768px fica em 22px na linha
 *    do título e a linha tem só duas colunas (texto | seta), então o texto
 *    ocupa a largura toda;
 *  - a partir de 768px: o ícone volta para a caixa de 44px acima do título.
 * A medida real (linhas por idioma em 375px) é feita no navegador; aqui fica
 * a trava para a coluna do ícone não voltar.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

import HomeServices from "@/components/home/HomeServices.astro";
import { SERVICE_KEYS } from "@/config/routes";
import { getSection } from "@/i18n";

const source = readFileSync(new URL("../../src/components/home/HomeServices.astro", import.meta.url), "utf8");
const css = /<style>([\s\S]*)<\/style>/.exec(source)?.[1] ?? "";
const mobile = css.slice(0, css.indexOf("@media (min-width: 768px)"));
const desktop = css.slice(css.indexOf("@media (min-width: 768px)"));
const rule = (block: string, selector: string) =>
  new RegExp(`(^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(block)?.[2] ?? "";

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe("HomeServices — mobile sem coluna de ícone", () => {
  it("o ícone decorativo fica dentro do <h3>, antes do nome do serviço", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = await container.renderToString(HomeServices as any, { props: { locale: "pt" } });
    const items = getSection("pt", "home.services.items");
    const titles = [...html.matchAll(/<h3 class="service__title"[^>]*>([\s\S]*?)<\/h3>/g)].map((match) => match[1]!);
    expect(titles).toHaveLength(5);
    for (const title of titles) {
      expect(title).toMatch(/^\s*<span class="service__icon"[^>]*>\s*<svg[^>]*width="22"[^>]*aria-hidden="true"/);
    }
    expect(titles.map((title) => title.replace(/<[^>]+>/g, "").trim())).toEqual(SERVICE_KEYS.map((key) => items[key].title));
  });

  it("linha do mobile: texto | seta (duas colunas), ícone sem encolher na linha do título", () => {
    expect(rule(mobile, ".service")).toMatch(/grid-template-columns:\s*minmax\(0, 1fr\) auto;/);
    expect(rule(mobile, ".service__title")).toMatch(/display:\s*flex/);
    expect(rule(mobile, ".service__icon")).toMatch(/flex:\s*none/);
    expect(rule(mobile, ".service__icon")).not.toMatch(/inline-size:\s*2\.75rem/);
  });

  it("desktop: caixa de 44px com o ícone de 28px, acima do título", () => {
    expect(rule(desktop, ".service__title")).toMatch(/display:\s*grid/);
    expect(rule(desktop, ".service__icon")).toMatch(/inline-size:\s*2\.75rem/);
    expect(rule(desktop, ".service__icon :global(svg)")).toMatch(/inline-size:\s*1\.75rem/);
  });
});
