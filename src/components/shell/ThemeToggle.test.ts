/**
 * Botão de tema (B208): só sai com o rótulo no i18n (shared.header.theme_toggle,
 * pedido ao redator), é um botão de alternância com nome acessível igual ao
 * texto visível e nasce "não pressionado" (o script acerta pelo tema da 1ª pintura).
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { afterEach, describe, expect, it, vi } from "vitest";

async function render(withLabel: boolean) {
  vi.resetModules();
  vi.doMock("@/i18n", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/i18n")>();
    const key = "shared.header.theme_toggle";
    return {
      ...actual,
      hasText: (locale: Parameters<typeof actual.hasText>[0], path: string) => (path === key ? withLabel : actual.hasText(locale, path)),
      tDynamic: (locale: Parameters<typeof actual.tDynamic>[0], path: string, vars?: Parameters<typeof actual.tDynamic>[2]) =>
        path === key ? "Tema escuro" : actual.tDynamic(locale, path, vars),
    };
  });
  const { default: ThemeToggle } = await import("./ThemeToggle.astro");
  const container = await AstroContainer.create();
  return container.renderToString(ThemeToggle, { props: { locale: "pt" } });
}

afterEach(() => {
  vi.doUnmock("@/i18n");
});

describe("ThemeToggle.astro", () => {
  it("com o rótulo: botão de alternância com texto visível e ícone decorativo", async () => {
    const html = await render(true);
    expect(html).toMatch(/<button type="button"[^>]*data-theme-toggle[^>]*aria-pressed="false"/);
    expect(html).toContain(">Tema escuro</span>");
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/aria-label=/);
  });

  it("sem o rótulo no i18n: não renderiza botão sem nome", async () => {
    const html = await render(false);
    expect(html).not.toContain("data-theme-toggle");
  });
});
