/**
 * Logos de tecnologia do Icon.astro no Badge da ficha técnica (B212, 03-ui
 * §3.4.2). Dono: home.
 *  - cada logo é um SVG monocromático preenchido (currentColor), viewBox 24,
 *    decorativo (aria-hidden), com path de comandos SVG válidos;
 *  - no <Badge variant="mono">, o logo sai em 16px ANTES do rótulo;
 *  - contrato com gated/tech-icon.ts: todo ícone que techIcon() devolve para
 *    um nome de stack existe no Icon.astro e desenha alguma coisa.
 * Qual tecnologia aparece continua sendo decisão do case real (fichaTecnica
 * .stack, validada no termo do case, playbook 09): aqui só o desenho.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";

import { techIcon } from "@/components/gated/tech-icon";
import Badge from "@/components/ui/Badge.astro";
import Icon, { type IconName } from "@/components/ui/Icon.astro";

const TECH_LOGOS = [
  "typescript",
  "javascript",
  "react",
  "nodejs",
  "postgresql",
  "sqlite",
  "nextjs",
  "astro",
  "docker",
] as const satisfies readonly IconName[];

/** Nomes como um case escreve na stack (caixa, ponto, espaço variados). */
const STACK_NAMES = [
  "TypeScript",
  "JavaScript",
  "React",
  "React Native",
  "Node.js",
  "PostgreSQL",
  "Postgres",
  "SQLite",
  "Next.js",
  "Astro",
  "Docker",
  "GitHub",
  "GitHub Actions",
];

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderIcon = (name: IconName, size = 16) => container.renderToString(Icon as any, { props: { name, size } });
const svgTag = (html: string) => /<svg\b[^>]*>/.exec(html)?.[0] ?? "";
const paths = (html: string) => [...html.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]!);

describe("Icon — logos de tecnologia (B212)", () => {
  it.each(TECH_LOGOS)("%s: SVG preenchido em currentColor, viewBox 24, decorativo", async (name) => {
    const html = await renderIcon(name);
    const tag = svgTag(html);
    expect(tag).toMatch(/viewBox="0 0 24 24"/);
    expect(tag).toMatch(/width="16"/);
    expect(tag).toMatch(/height="16"/);
    expect(tag).toMatch(/fill="currentColor"/);
    expect(tag).toMatch(/stroke="none"/);
    expect(tag).toMatch(/aria-hidden="true"/);
    const ds = paths(html);
    expect(ds.length).toBeGreaterThan(0);
    for (const d of ds) {
      // Só comandos e números de path: nada de cor, url() ou texto colado.
      expect(d).toMatch(/^[Mm][MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/);
      expect(d.length).toBeGreaterThan(40);
    }
  });

  it("cada logo tem desenho próprio (nenhum path repetido entre eles)", async () => {
    const all = await Promise.all(TECH_LOGOS.map(async (name) => paths(await renderIcon(name)).join(" ")));
    expect(new Set(all).size).toBe(TECH_LOGOS.length);
  });
});

describe("Badge mono com logo (ficha técnica do case)", () => {
  it("logo de 16px antes do rótulo, dentro da pílula mono", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = await container.renderToString(Badge as any, {
      props: { variant: "mono", icon: "nodejs" },
      slots: { default: "Node.js" },
    });
    const badge = /<span class="badge"[^>]*data-variant="mono"[^>]*>([\s\S]*?)<\/span>/.exec(html)?.[1] ?? "";
    expect(badge).toMatch(/^\s*<svg[^>]*class="badge__icon"[^>]*width="16"[^>]*height="16"/);
    expect(badge.indexOf("<svg")).toBeLessThan(badge.indexOf("Node.js"));
  });
});

describe("contrato com gated/tech-icon.ts", () => {
  it("todo ícone que techIcon() devolve existe no Icon.astro e desenha um path", async () => {
    for (const nome of STACK_NAMES) {
      const icon = techIcon(nome);
      if (!icon) continue;
      const ds = paths(await renderIcon(icon));
      expect(ds.length, `${nome} → ${icon}`).toBeGreaterThan(0);
    }
  });
});
