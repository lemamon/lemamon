// @vitest-environment jsdom
/**
 * Botão de tema (src/scripts/theme.ts; backlog B208): sincroniza aria-pressed
 * com o tema da 1ª pintura, alterna <html data-theme>, grava a escolha e
 * acompanha o sistema só enquanto não há escolha salva.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_KEY } from "./storage-keys";

let systemListener: ((event: { matches: boolean }) => void) | undefined;
/** Listeners que cada import do módulo põe em document/window: removidos entre os testes. */
const added: [EventTarget, string, EventListenerOrEventListenerObject][] = [];
for (const target of [document, window]) {
  const original = target.addEventListener.bind(target);
  target.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
    added.push([target, type, listener]);
    original(type, listener, options);
  }) as typeof target.addEventListener;
}

async function load(initial: "dark" | null = null) {
  vi.resetModules();
  for (const [target, type, listener] of added.splice(0)) target.removeEventListener(type, listener);
  document.body.innerHTML = `
    <footer><button type="button" data-theme-toggle aria-pressed="false"><span>Tema escuro</span></button></footer>
    <dialog><button type="button" data-theme-toggle aria-pressed="false">Tema escuro</button></dialog>`;
  if (initial) document.documentElement.dataset.theme = initial;
  else delete document.documentElement.dataset.theme;
  systemListener = undefined;
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: (_: string, listener: (event: { matches: boolean }) => void) => (systemListener = listener),
  }) as unknown as typeof window.matchMedia;
  await import("./theme");
  return [...document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")];
}

const theme = () => document.documentElement.dataset.theme ?? null;
const pressed = (buttons: HTMLButtonElement[]) => buttons.map((button) => button.getAttribute("aria-pressed"));

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  document.body.innerHTML = "";
  delete document.documentElement.dataset.theme;
  for (const [target, type, listener] of added.splice(0)) target.removeEventListener(type, listener);
});

describe("botão de tema", () => {
  it("aria-pressed acompanha o tema da 1ª pintura (head-inline.ts)", async () => {
    expect(pressed(await load("dark"))).toEqual(["true", "true"]);
    expect(pressed(await load(null))).toEqual(["false", "false"]);
  });

  it("clique alterna o tema, grava a escolha e atualiza todos os botões", async () => {
    const buttons = await load(null);
    buttons[0]!.querySelector("span")!.click();
    expect(theme()).toBe("dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(pressed(buttons)).toEqual(["true", "true"]);
    buttons[1]!.click();
    expect(theme()).toBeNull();
    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
    expect(pressed(buttons)).toEqual(["false", "false"]);
  });

  it("sem escolha salva, acompanha o sistema; com escolha, não", async () => {
    const buttons = await load(null);
    systemListener?.({ matches: true });
    expect(theme()).toBe("dark");
    expect(pressed(buttons)).toEqual(["true", "true"]);
    buttons[0]!.click();
    expect(theme()).toBeNull();
    systemListener?.({ matches: true });
    expect(theme()).toBeNull();
  });

  it("outra aba trocou o tema: esta acompanha", async () => {
    await load(null);
    window.localStorage.setItem(THEME_KEY, "dark");
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY }));
    expect(theme()).toBe("dark");
  });
});
