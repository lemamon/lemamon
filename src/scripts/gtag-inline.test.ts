/**
 * Snippet do gtag (src/scripts/gtag-inline.ts) executado do jeito que vai ao
 * ar, com window/localStorage falsos: ordem do Consent Mode v2 (B344), escolha
 * salva aplicada antes dos config e peso ≤ 1 KiB (critério 7 do verify-build).
 */
import { describe, expect, it } from "vitest";

import { gtagInlineScript, type GtagInlineOptions } from "./gtag-inline";
import { CONSENT_KEY } from "./storage-keys";

const BASE: GtagInlineOptions = { adsId: "AW-1", sendTo: "AW-1/x", ga4Id: "G-ABC", consent: true, personalization: false };

function run(options: Partial<GtagInlineOptions> = {}, stored: string | null = null, throwOnStorage = false) {
  const dataLayer: unknown[][] = [];
  const window: Record<string, unknown> = { dataLayer };
  const localStorage = {
    getItem: (key: string) => {
      if (throwOnStorage) throw new Error("SecurityError");
      return key === CONSENT_KEY ? stored : null;
    },
  };
  new Function("window", "localStorage", gtagInlineScript({ ...BASE, ...options }))(window, localStorage);
  return { calls: dataLayer.map((args) => [...(args as unknown as unknown[])]), window };
}

describe("gtag inline: Consent Mode v2", () => {
  it("sem escolha salva: consent default denied antes de js/config, nenhum update", () => {
    const { calls } = run();
    expect(calls[0]).toEqual([
      "consent",
      "default",
      { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", wait_for_update: 500 },
    ]);
    expect(calls.some((call) => call[0] === "consent" && call[1] === "update")).toBe(false);
    expect(calls.findIndex((call) => call[0] === "js")).toBeGreaterThan(0);
    expect(calls.filter((call) => call[0] === "config").map((call) => call[1])).toEqual(["AW-1", "G-ABC"]);
  });

  it("escolha 'aceito' salva: update granted ANTES dos config; ad_personalization só com remarketing", () => {
    const accepted = run({}, "aceito").calls;
    const update = accepted.findIndex((call) => call[0] === "consent" && call[1] === "update");
    expect(update).toBeGreaterThan(0);
    expect(update).toBeLessThan(accepted.findIndex((call) => call[0] === "config"));
    expect(accepted[update]?.[2]).toEqual({ ad_storage: "granted", ad_user_data: "granted", analytics_storage: "granted" });
    const withRemarketing = run({ personalization: true }, "aceito").calls;
    expect(withRemarketing.find((call) => call[1] === "update")?.[2]).toMatchObject({ ad_personalization: "granted" });
  });

  it("'recusado' ou storage bloqueado: tudo continua denied, sem erro", () => {
    expect(run({}, "recusado").calls.some((call) => call[1] === "update")).toBe(false);
    expect(() => run({}, "aceito", true)).not.toThrow();
  });

  it("sem consentimento (legítimo interesse): nenhum comando de consent; conversão global existe", () => {
    const { calls, window } = run({ consent: false, ga4Id: "" });
    expect(calls.some((call) => call[0] === "consent")).toBe(false);
    expect(calls.filter((call) => call[0] === "config").map((call) => call[1])).toEqual(["AW-1"]);
    expect(typeof window.gtag_report_conversion).toBe("function");
  });

  it("vai ao ar com no máximo 1 KiB, com consentimento, remarketing e GA4", () => {
    const code = gtagInlineScript({ ...BASE, adsId: "AW-16881353870", sendTo: "AW-16881353870/cEi0CLmh9Z8aEI6J1PE-", ga4Id: "G-XXXXXXXXXX", personalization: true });
    expect(Buffer.byteLength(code)).toBeLessThanOrEqual(1024);
  });
});
