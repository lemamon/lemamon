// @vitest-environment jsdom
/**
 * lib/attribution.ts, lib/analytics.ts e a medição da auditoria de conversão: atribuição do
 * /contato (F11), gbraid/wbraid (F81), toque de campanha entre abas e cookie
 * _gcl_aw (F26), "Ref.: G-…" nas mensagens de WhatsApp (F34) e o modo de
 * conferência ?debug_analytics=1 (F82).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { contactAttribution } from "@/components/contact/contact-form";
import {
  ATTRIBUTION_SESSION_KEY,
  campaignRef,
  readCampaign,
  readSessionTouch,
  rememberLanding,
  shareCampaignTouch,
  whatsappHrefWithRef,
  withCampaignRef,
  type AttributionMessage,
  type ChannelLike,
  type Touch,
} from "@/lib/analytics";
import { adoptCampaign, attributionFields, buildAttribution, gclidAllowed, gclidFromCookie, withoutAdClickIds } from "@/lib/attribution";
import { CONSENT_ACCEPTED, CONSENT_DECLINED, CONSENT_KEY } from "@/scripts/storage-keys";

class MemoryStorage {
  map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

const store = () => new MemoryStorage() as unknown as Storage;

const paidTouch: Touch = {
  landing: "/servicos/mvp?utm_source=google&utm_medium=cpc&utm_campaign=mvp-sp&gclid=TESTE-GCLID",
  referrer: "https://www.google.com/",
  utm: { utm_source: "google", utm_medium: "cpc", utm_campaign: "mvp-sp" },
  gclid: "TESTE-GCLID",
  at: 1,
};

const organicTouch: Touch = { landing: "/", referrer: "https://www.google.com/", utm: {}, gclid: "", at: 2 };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("gbraid e wbraid (F81)", () => {
  it("readCampaign só inclui gbraid/wbraid quando vêm na URL", () => {
    expect(readCampaign("?gbraid=GB-1&wbraid=WB-2&utm_source=google")).toEqual({
      utm: { utm_source: "google" },
      gclid: "",
      gbraid: "GB-1",
      wbraid: "WB-2",
    });
    expect(readCampaign("?utm_source=google")).toEqual({ utm: { utm_source: "google" }, gclid: "" });
  });

  it("o toque da sessão guarda gbraid/wbraid e conta como campanha", () => {
    const storage = store();
    rememberLanding({ pathname: "/", search: "", host: "lemamon.dev" }, "", storage, 1);
    rememberLanding({ pathname: "/servicos", search: "?wbraid=WB-9", host: "lemamon.dev" }, "", storage, 2);
    expect(readSessionTouch(storage)).toMatchObject({ landing: "/servicos?wbraid=WB-9", wbraid: "WB-9", gclid: "" });
  });

  it("buildAttribution leva gbraid/wbraid da URL e do toque da sessão", () => {
    const fromUrl = buildAttribution({
      pathname: "/orcamento",
      search: "?gbraid=GB-1&origem=home-hero",
      host: "lemamon.dev",
      referrer: "",
      sessionTouch: null,
      cookie: "",
    });
    expect(fromUrl).toMatchObject({ gbraid: "GB-1", origem: "home-hero" });
    expect(fromUrl).not.toHaveProperty("gclid");
    const fromTouch = buildAttribution({
      pathname: "/contato",
      search: "",
      host: "lemamon.dev",
      referrer: "",
      sessionTouch: { ...organicTouch, wbraid: "WB-2" },
      cookie: "",
    });
    expect(fromTouch).toMatchObject({ wbraid: "WB-2" });
  });

  it("as regras do gclid valem para os três: sem permissão, nenhum id vai no envio", () => {
    const attribution = {
      utm_source: "google",
      gclid: "G-1",
      gbraid: "GB-1",
      wbraid: "WB-1",
      landing: "/?gbraid=GB-1&utm_source=google",
      entry_page: "/contato",
    };
    expect(attributionFields(attribution, true)).toEqual({
      attribution: JSON.stringify({ utm_source: "google", gbraid: "GB-1", wbraid: "WB-1", landing: "/?gbraid=GB-1&utm_source=google", entry_page: "/contato" }),
      gclid: "G-1",
    });
    const denied = attributionFields(attribution, false);
    expect(denied.gclid).toBe("");
    expect(denied.attribution).not.toMatch(/GB-1|WB-1|G-1/);
    expect(JSON.parse(denied.attribution)).toEqual(withoutAdClickIds(attribution));
  });
});

describe("cookie _gcl_aw (F26)", () => {
  it("lê o gclid do formato GCL.<timestamp>.<gclid>", () => {
    expect(gclidFromCookie("_ga=GA1.1.1; _gcl_aw=GCL.1760000000.Cj0KCQ-abc_123; outro=1")).toBe("Cj0KCQ-abc_123");
    expect(gclidFromCookie("x_gcl_aw=GCL.1760000000.OUTRO")).toBe("");
    expect(gclidFromCookie("_gcl_au=1.1.1")).toBe("");
    expect(gclidFromCookie("_gcl_aw=lixo")).toBe("");
    expect(gclidFromCookie("")).toBe("");
  });

  it("entra só sem id de clique na URL e no toque da sessão", () => {
    const cookie = "_gcl_aw=GCL.1760000000.DO-COOKIE";
    const base = { pathname: "/orcamento", search: "", host: "lemamon.dev", referrer: "", cookie };
    expect(buildAttribution({ ...base, sessionTouch: null }).gclid).toBe("DO-COOKIE");
    expect(buildAttribution({ ...base, sessionTouch: paidTouch }).gclid).toBe("TESTE-GCLID");
    expect(buildAttribution({ ...base, search: "?gclid=DA-URL", sessionTouch: null }).gclid).toBe("DA-URL");
    // Clique de iPhone nesta visita: o gclid antigo do cookie não se mistura.
    expect(buildAttribution({ ...base, search: "?gbraid=GB-1", sessionTouch: null })).not.toHaveProperty("gclid");
  });

  it("sem o parâmetro, lê document.cookie", () => {
    document.cookie = "_gcl_aw=GCL.1760000000.DO-NAVEGADOR";
    expect(buildAttribution({ pathname: "/contato", search: "", host: "lemamon.dev", referrer: "", sessionTouch: null }).gclid).toBe(
      "DO-NAVEGADOR",
    );
    document.cookie = "_gcl_aw=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });
});

describe("toque de campanha entre abas (F26)", () => {
  /** BroadcastChannel de mentira: entrega na hora para as outras abas abertas. */
  function hub() {
    const open: FakeChannel[] = [];
    const sent: AttributionMessage[] = [];
    class FakeChannel implements ChannelLike {
      listeners: ((event: { data: unknown }) => void)[] = [];
      closed = false;
      constructor() {
        open.push(this);
      }
      postMessage(message: AttributionMessage) {
        sent.push(message);
        for (const other of open) {
          if (other === this || other.closed) continue;
          for (const listener of other.listeners) listener({ data: structuredClone(message) });
        }
      }
      addEventListener(_type: "message", listener: (event: { data: unknown }) => void) {
        this.listeners.push(listener);
      }
      close() {
        this.closed = true;
      }
    }
    return { open: () => new FakeChannel(), sent };
  }

  function tab(touch: Touch | null) {
    const storage = store();
    if (touch) storage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(touch));
    return storage;
  }

  it("aba nova sem campanha adota o toque de campanha de outra aba aberta", () => {
    const channels = hub();
    const campaignTab = tab(paidTouch);
    shareCampaignTouch({ open: channels.open, storage: campaignTab });
    const newTab = tab(organicTouch);
    const adopted = vi.fn();
    shareCampaignTouch({ open: channels.open, storage: newTab, onAdopt: adopted });
    expect(readSessionTouch(newTab)).toMatchObject({ gclid: "TESTE-GCLID", utm: { utm_campaign: "mvp-sp" }, landing: paidTouch.landing });
    expect(adopted).toHaveBeenCalledTimes(1);
    // A aba com campanha não pede nada; a nova pede uma vez.
    expect(channels.sent.filter((message) => message.type === "pedido")).toHaveLength(1);
  });

  it("nunca troca a campanha que a aba já tem, nem adota toque sem campanha", () => {
    const channels = hub();
    const other: Touch = { ...paidTouch, utm: { utm_source: "linkedin", utm_campaign: "outra" }, gclid: "", at: 3 };
    shareCampaignTouch({ open: channels.open, storage: tab(other) });
    const ownCampaign = tab(paidTouch);
    shareCampaignTouch({ open: channels.open, storage: ownCampaign });
    expect(readSessionTouch(ownCampaign)).toMatchObject({ gclid: "TESTE-GCLID", utm: { utm_campaign: "mvp-sp" } });

    const lonely = hub();
    shareCampaignTouch({ open: lonely.open, storage: tab(organicTouch) });
    const newTab = tab(null);
    shareCampaignTouch({ open: lonely.open, storage: newTab });
    expect(readSessionTouch(newTab)).toBeNull();
  });

  it("mensagem adulterada não entra no storage; aba fechada não responde", () => {
    const channels = hub();
    const newTab = tab(null);
    const listener = channels.open();
    shareCampaignTouch({ open: channels.open, storage: newTab });
    listener.postMessage({ type: "toque", touch: { landing: 42 } as unknown as Touch });
    expect(readSessionTouch(newTab)).toBeNull();

    const closing = hub();
    const close = shareCampaignTouch({ open: closing.open, storage: tab(paidTouch) });
    close?.();
    const late = tab(null);
    shareCampaignTouch({ open: closing.open, storage: late });
    expect(readSessionTouch(late)).toBeNull();
  });

  it("sem BroadcastChannel ou sem storage: nada", () => {
    expect(shareCampaignTouch({ open: () => null, storage: tab(null) })).toBeNull();
    expect(shareCampaignTouch({ open: hub().open, storage: null })).toBeNull();
  });

  it("adoptCampaign: a atribuição montada sem campanha ganha a do toque adotado", () => {
    const mounted = { origem: "home-hero", landing: "/orcamento?origem=home-hero", entry_page: "/orcamento" };
    expect(adoptCampaign(mounted, paidTouch)).toEqual({
      origem: "home-hero",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "mvp-sp",
      gclid: "TESTE-GCLID",
      referrer: "https://www.google.com/",
      landing: paidTouch.landing,
      entry_page: "/orcamento",
    });
    const withCampaign = { ...mounted, utm_source: "linkedin" };
    expect(adoptCampaign(withCampaign, paidTouch)).toBe(withCampaign);
    expect(adoptCampaign(mounted, organicTouch)).toBe(mounted);
    expect(adoptCampaign(mounted, null)).toBe(mounted);
  });
});

describe("atribuição do /contato (F11)", () => {
  beforeEach(() => {
    window.sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(paidTouch));
  });

  it("leva utm_*, gclid, origem e página de entrada, como o wizard", () => {
    const fields = contactAttribution(
      { pathname: "/contato", search: "?origem=footer", host: "lemamon.dev" },
      "https://lemamon.dev/servicos/mvp",
      true,
    );
    expect(fields.gclid).toBe("TESTE-GCLID");
    expect(JSON.parse(fields.attribution)).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "mvp-sp",
      origem: "footer",
      referrer: "https://www.google.com/",
      landing: paidTouch.landing,
      entry_page: "/contato",
    });
  });

  it("modo consentimento sem o aceite: sem gclid no campo nem na página de entrada", () => {
    const allowed = gclidAllowed(true, window.localStorage);
    expect(allowed).toBe(false);
    const fields = contactAttribution({ pathname: "/contato", search: "", host: "lemamon.dev" }, "", allowed);
    expect(fields.gclid).toBe("");
    expect(fields.attribution).not.toContain("TESTE-GCLID");
    expect(JSON.parse(fields.attribution)).toMatchObject({ utm_campaign: "mvp-sp", landing: "/servicos/mvp?utm_source=google&utm_medium=cpc&utm_campaign=mvp-sp" });
    window.localStorage.setItem(CONSENT_KEY, CONSENT_ACCEPTED);
    expect(gclidAllowed(true, window.localStorage)).toBe(true);
    window.localStorage.setItem(CONSENT_KEY, CONSENT_DECLINED);
    expect(gclidAllowed(true, window.localStorage)).toBe(false);
  });

  it("sessão orgânica, sem cookie: nenhum id de clique", () => {
    window.sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(organicTouch));
    const fields = contactAttribution({ pathname: "/en/contact", search: "", host: "lemamon.dev" }, "", true);
    expect(fields.gclid).toBe("");
    expect(JSON.parse(fields.attribution)).toEqual({ referrer: "https://www.google.com/", landing: "/", entry_page: "/en/contact" });
  });
});

describe("Ref. da campanha no WhatsApp (F34)", () => {
  it("só com toque de campanha paga do Google; nome curto da campanha ou G-ads", () => {
    expect(campaignRef(paidTouch)).toBe("Ref.: G-mvp-sp");
    expect(campaignRef({ ...paidTouch, utm: { utm_medium: "CPC", utm_campaign: "MVP São Paulo / Nov" }, gclid: "" })).toBe(
      "Ref.: G-mvp-sao-paulo-nov",
    );
    expect(campaignRef({ ...organicTouch, gclid: "SO-GCLID" })).toBe("Ref.: G-ads");
    expect(campaignRef({ ...organicTouch, gbraid: "GB-1" })).toBe("Ref.: G-ads");
    expect(campaignRef({ ...paidTouch, utm: { utm_campaign: "x".repeat(80), utm_medium: "cpc" } })).toBe(`Ref.: G-${"x".repeat(30)}`);
    expect(campaignRef({ ...organicTouch, utm: { utm_source: "linkedin", utm_medium: "social", utm_campaign: "post" } })).toBe("");
    expect(campaignRef(organicTouch)).toBe("");
    expect(campaignRef(null)).toBe("");
  });

  it("nunca leva o gclid", () => {
    expect(campaignRef(paidTouch)).not.toContain("TESTE-GCLID");
    expect(campaignRef({ ...paidTouch, utm: { utm_medium: "cpc", utm_campaign: "" } })).toBe("Ref.: G-ads");
  });

  it("acrescenta a linha uma vez só, no fim da mensagem", () => {
    const message = withCampaignRef("Olá! Vim pela página de MVP da Lemamon.", "Ref.: G-mvp-sp");
    expect(message).toBe("Olá! Vim pela página de MVP da Lemamon.\n\nRef.: G-mvp-sp");
    expect(withCampaignRef(message, "Ref.: G-outra")).toBe(message);
    expect(withCampaignRef("Olá!", "")).toBe("Olá!");
  });

  it("href do wa.me: só o link com ?text= ganha a linha", () => {
    const href = `https://wa.me/5548900000000?text=${encodeURIComponent("Olá! Tenho uma dúvida.")}`;
    const withRef = whatsappHrefWithRef(href, "Ref.: G-mvp-sp");
    expect(new URL(withRef).searchParams.get("text")).toBe("Olá! Tenho uma dúvida.\n\nRef.: G-mvp-sp");
    expect(withRef).toContain("%20");
    expect(whatsappHrefWithRef(withRef, "Ref.: G-mvp-sp")).toBe(withRef);
    expect(whatsappHrefWithRef("https://wa.me/5548900000000", "Ref.: G-mvp-sp")).toBe("https://wa.me/5548900000000");
    expect(whatsappHrefWithRef("https://example.com/?text=oi", "Ref.: G-mvp-sp")).toBe("https://example.com/?text=oi");
    expect(whatsappHrefWithRef(href, "")).toBe(href);
  });

  it("openWhatsapp (mensagens que a ilha abre por JS) leva a referência da sessão", async () => {
    vi.resetModules();
    vi.stubEnv("PUBLIC_WHATSAPP_NUMBER", "5548900000000");
    const { openWhatsapp } = await import("@/lib/whatsapp");
    const open = vi.fn();
    window.sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(paidTouch));
    expect(openWhatsapp("Olá! Meu resumo.", { open })).toBe(true);
    const text = new URL(open.mock.calls[0]?.[0] as string).searchParams.get("text");
    expect(text).toBe("Olá! Meu resumo.\n\nRef.: G-mvp-sp");
    window.sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(organicTouch));
    openWhatsapp("Olá! Meu resumo.", { open });
    expect(new URL(open.mock.calls[1]?.[0] as string).searchParams.get("text")).toBe("Olá! Meu resumo.");
  });
});

describe("modo de conferência ?debug_analytics=1 (F82)", () => {
  async function load() {
    vi.resetModules();
    vi.stubEnv("PUBLIC_GA4_ID", "G-TESTE");
    const gtag = vi.fn();
    vi.stubGlobal("gtag", gtag);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const analytics = await import("@/lib/analytics");
    return { ...analytics, gtag, warn };
  }

  it("liga pela URL, vale nas páginas seguintes da aba e desliga com =0", async () => {
    const { analyticsDebugEnabled } = await load();
    const storage = store();
    expect(analyticsDebugEnabled("", storage)).toBe(false);
    expect(analyticsDebugEnabled("?debug_analytics=1", storage)).toBe(true);
    expect(analyticsDebugEnabled("?etapa=2", storage)).toBe(true);
    expect(analyticsDebugEnabled("?debug_analytics=0", storage)).toBe(false);
    expect(analyticsDebugEnabled("", storage)).toBe(false);
    expect(analyticsDebugEnabled("?debug_analytics=1", null)).toBe(true);
  });

  it("track, conversão do Ads e New Relic vão para o console, sem enviar", async () => {
    const { track, reportAdsConversion, reportError, gtag, warn } = await load();
    const newrelic = { addPageAction: vi.fn(), noticeError: vi.fn() };
    vi.stubGlobal("newrelic", newrelic);
    window.history.replaceState({}, "", "/orcamento?debug_analytics=1");
    track("cta_click", { cta_id: "diagnosis", origem: "home-hero" });
    await reportAdsConversion(10, "LEM-20261021-ABCD");
    reportError("lead_failed", { reason: "network" });
    expect(gtag).not.toHaveBeenCalled();
    expect(newrelic.addPageAction).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("[analytics:debug] cta_click", { cta_id: "diagnosis", origem: "home-hero" });
    expect(warn.mock.calls.map(([label]) => label)).toEqual([
      "[analytics:debug] cta_click",
      "[analytics:debug] conversion",
      "[analytics:debug] monitor lead_failed",
    ]);

    window.history.replaceState({}, "", "/orcamento?debug_analytics=0");
    track("cta_click", { cta_id: "diagnosis", origem: "home-hero" });
    expect(gtag).toHaveBeenCalledWith("event", "cta_click", expect.objectContaining({ send_to: "G-TESTE" }));
    warn.mockRestore();
  });
});
