// @vitest-environment jsdom
/**
 * Aviso de cookies (src/scripts/consent.ts; backlog B344): aparece sem escolha
 * salva, "Aceitar"/"Recusar" gravam e mandam consent update, o New Relic só
 * carrega depois do aceite, a escolha vale nas próximas páginas e
 * "Preferências de cookies" reabre o aviso.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cookieDomains } from "./consent";
import { CONSENT_KEY } from "./storage-keys";

const BANNER = `
  <div data-consent-banner data-placement="fixed" data-personalization="false" data-nr-src="/scripts/newrelic.js" hidden>
    <button type="button" data-consent-choice="decline">Recusar</button>
    <button type="button" data-consent-choice="accept">Aceitar</button>
  </div>
  <footer><button type="button" data-consent-open>Preferências de cookies</button></footer>
  <p><a href="#preferencias-de-cookies">preferências de cookies</a></p>
  <a href="/quanto-custa" id="nav-link">Quanto custa</a>`;

let gtag: ReturnType<typeof vi.fn>;

async function load(stored: string | null = null, banner = BANNER) {
  vi.resetModules();
  document.body.innerHTML = banner;
  document.head.innerHTML = "";
  document.documentElement.removeAttribute("data-consent-open");
  window.localStorage.clear();
  if (stored) window.localStorage.setItem(CONSENT_KEY, stored);
  gtag = vi.fn();
  (window as unknown as { gtag: unknown }).gtag = gtag;
  await import("./consent");
  return document.querySelector<HTMLElement>("[data-consent-banner]")!;
}

const newRelic = () => document.head.querySelector('script[src="/scripts/newrelic.js"]');

const cookieNames = () =>
  document.cookie
    .split(";")
    .map((part) => part.split("=")[0]?.trim() ?? "")
    .filter(Boolean)
    .sort();

function setTrackingCookies() {
  for (const cookie of ["_ga=GA1.1.1", "_ga_TEST12345=GS1.1", "_gcl_au=1.1.1", "_gid=GA1.1.2", "outro=1"]) {
    document.cookie = `${cookie}; path=/`;
  }
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  for (const name of cookieNames()) document.cookie = `${name}=; Max-Age=0; path=/`;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("aviso de cookies", () => {
  it("sem escolha salva: aparece, sem New Relic, e o <html> reserva o espaço", async () => {
    const banner = await load();
    expect(banner.hidden).toBe(false);
    expect(document.documentElement.hasAttribute("data-consent-open")).toBe(true);
    expect(newRelic()).toBeNull();
  });

  it("com o aviso aberto, um clique em link normal navega (não é barrado); o rodapé e a Política reabrem", async () => {
    await load();
    expect(document.documentElement.hasAttribute("data-consent-open")).toBe(true);
    // Regressão: o <html> carrega data-consent-open (estado); o handler NÃO pode
    // tratá-lo como gatilho, senão todo link fica com preventDefault e nada navega.
    const link = document.querySelector<HTMLAnchorElement>("#nav-link")!;
    const navClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(navClick);
    expect(navClick.defaultPrevented).toBe(false);
    // O botão do rodapé reabre (e barra o default dele mesmo).
    document.querySelector<HTMLElement>("[data-consent-banner]")!.hidden = true;
    document.documentElement.removeAttribute("data-consent-open");
    const reopen = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.querySelector<HTMLButtonElement>("footer [data-consent-open]")!.dispatchEvent(reopen);
    expect(reopen.defaultPrevented).toBe(true);
    expect(document.documentElement.hasAttribute("data-consent-open")).toBe(true);
    // O link da Política também reabre.
    const prefClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.querySelector<HTMLAnchorElement>('a[href="#preferencias-de-cookies"]')!.dispatchEvent(prefClick);
    expect(prefClick.defaultPrevented).toBe(true);
  });

  it("Aceitar: grava, consent update granted, carrega o New Relic e some", async () => {
    const banner = await load();
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="accept"]')!.click();
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe("aceito");
    expect(gtag).toHaveBeenCalledWith("consent", "update", { ad_storage: "granted", ad_user_data: "granted", analytics_storage: "granted" });
    expect(newRelic()).not.toBeNull();
    expect(banner.hidden).toBe(true);
    expect(document.documentElement.hasAttribute("data-consent-open")).toBe(false);
  });

  it("Recusar: grava, consent update denied, nada de New Relic", async () => {
    const banner = await load();
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="decline"]')!.click();
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe("recusado");
    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ ad_storage: "denied", analytics_storage: "denied" }));
    expect(newRelic()).toBeNull();
    expect(banner.hidden).toBe(true);
  });

  it("a escolha vale nas próximas páginas: recusado não pergunta de novo; aceito carrega o New Relic", async () => {
    expect((await load("recusado")).hidden).toBe(true);
    expect(newRelic()).toBeNull();
    expect((await load("aceito")).hidden).toBe(true);
    expect(newRelic()).not.toBeNull();
  });

  it("Recusar apaga os cookies de medição e de anúncio e a sessão do New Relic, e mantém os outros", async () => {
    setTrackingCookies();
    window.localStorage.setItem("NRBA_SESSION", "{}");
    window.sessionStorage.setItem("NRBA/abc", "1");
    window.localStorage.setItem("lemamon:orcamento:v2", "{}");
    const banner = await load();
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="decline"]')!.click();
    expect(cookieNames()).toEqual(["outro"]);
    expect(window.localStorage.getItem("NRBA_SESSION")).toBeNull();
    expect(window.sessionStorage.getItem("NRBA/abc")).toBeNull();
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe("recusado");
  });

  it("retirar o consentimento (aceito → reabrir pelo rodapé → Recusar) também limpa", async () => {
    const banner = await load("aceito");
    setTrackingCookies();
    document.querySelector<HTMLButtonElement>("[data-consent-open]")!.click();
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="decline"]')!.click();
    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ ad_storage: "denied" }));
    expect(cookieNames()).toEqual(["outro"]);
  });

  it("com a recusa salva, a limpeza se repete a cada página", async () => {
    window.localStorage.setItem(CONSENT_KEY, "recusado");
    setTrackingCookies();
    vi.resetModules();
    document.body.innerHTML = BANNER;
    (window as unknown as { gtag: unknown }).gtag = vi.fn();
    await import("./consent");
    expect(cookieNames()).toEqual(["outro"]);
  });

  it("aceito não apaga nada", async () => {
    setTrackingCookies();
    await load("aceito");
    expect(cookieNames()).toEqual(["_ga", "_ga_TEST12345", "_gcl_au", "_gid", "outro"]);
  });

  it("domínios da limpeza: host e cada domínio pai; IP e localhost só no host", () => {
    expect(cookieDomains("www.lemamon.dev")).toEqual(["", "; domain=.www.lemamon.dev", "; domain=.lemamon.dev"]);
    expect(cookieDomains("lemamon.dev")).toEqual(["", "; domain=.lemamon.dev"]);
    expect(cookieDomains("localhost")).toEqual([""]);
    expect(cookieDomains("127.0.0.1")).toEqual([""]);
  });

  it("'Preferências de cookies' (rodapé e link da Política) reabre o aviso com o foco nele", async () => {
    const banner = await load("recusado");
    document.querySelector<HTMLButtonElement>("[data-consent-open]")!.click();
    expect(banner.hidden).toBe(false);
    expect(document.activeElement?.closest("[data-consent-banner]")).toBe(banner);
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="decline"]')!.click();
    document.querySelector<HTMLAnchorElement>('a[href="#preferencias-de-cookies"]')!.click();
    expect(banner.hidden).toBe(false);
  });
});

describe("pixels opcionais (B346 LinkedIn Insight Tag, B347 Meta Pixel)", () => {
  const WITH_PIXELS = BANNER.replace("data-consent-banner", 'data-consent-banner data-linkedin-partner-id="1234567" data-meta-pixel-id="123456789012345"');
  const linkedin = () => document.head.querySelector('script[src="https://snap.licdn.com/li.lms-analytics/insight.min.js"]');
  const meta = () => document.head.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]');
  type PixelWindow = { _linkedin_data_partner_ids?: string[]; fbq?: { queue?: unknown[][] }; _fbq?: unknown; lintrk?: unknown };
  const reset = () => {
    const w = window as unknown as PixelWindow;
    delete w._linkedin_data_partner_ids;
    delete w.fbq;
    delete w._fbq;
    delete w.lintrk;
  };
  beforeEach(reset);

  it("sem ID publicado (o padrão de hoje): nenhum pixel, nem depois do aceite", async () => {
    const banner = await load();
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="accept"]')!.click();
    expect(linkedin()).toBeNull();
    expect(meta()).toBeNull();
    expect((window as unknown as PixelWindow).fbq).toBeUndefined();
  });

  it("com ID: nada carrega antes da escolha", async () => {
    await load(null, WITH_PIXELS);
    expect(linkedin()).toBeNull();
    expect(meta()).toBeNull();
    expect((window as unknown as PixelWindow).fbq).toBeUndefined();
  });

  it("com ID e Aceitar: carrega os dois; a Meta recebe só init + PageView, com autoConfig desligado antes do init (B347)", async () => {
    const banner = await load(null, WITH_PIXELS);
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="accept"]')!.click();
    expect(linkedin()).not.toBeNull();
    expect(meta()).not.toBeNull();
    const w = window as unknown as PixelWindow;
    expect(w._linkedin_data_partner_ids).toEqual(["1234567"]);
    expect(w.fbq?.queue?.map((call) => [...call])).toEqual([
      ["consent", "grant"],
      ["set", "autoConfig", false, "123456789012345"],
      ["init", "123456789012345"],
      ["track", "PageView"],
    ]);
  });

  it("com ID e Recusar: nada carrega; com a recusa salva, nada carrega nas próximas páginas", async () => {
    const banner = await load(null, WITH_PIXELS);
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="decline"]')!.click();
    expect(linkedin()).toBeNull();
    expect(meta()).toBeNull();
    await load("recusado", WITH_PIXELS);
    expect(linkedin()).toBeNull();
    expect(meta()).toBeNull();
  });

  it("aceite salvo: os pixels carregam na página seguinte; retirar o consentimento revoga a Meta e apaga os cookies deles", async () => {
    const banner = await load("aceito", WITH_PIXELS);
    expect(linkedin()).not.toBeNull();
    expect(meta()).not.toBeNull();
    for (const cookie of ["_fbp=fb.1.1", "_fbc=fb.1.2", "li_fat_id=x", "outro=1"]) document.cookie = `${cookie}; path=/`;
    document.querySelector<HTMLButtonElement>("[data-consent-open]")!.click();
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="decline"]')!.click();
    expect((window as unknown as PixelWindow).fbq?.queue?.at(-1)).toEqual(["consent", "revoke"]);
    expect(cookieNames()).toEqual(["outro"]);
  });

  it("ID inválido no atributo não injeta nada", async () => {
    const banner = await load(null, BANNER.replace("data-consent-banner", 'data-consent-banner data-linkedin-partner-id="abc" data-meta-pixel-id="1;alert(1)"'));
    banner.querySelector<HTMLButtonElement>('[data-consent-choice="accept"]')!.click();
    expect(linkedin()).toBeNull();
    expect(meta()).toBeNull();
  });
});
