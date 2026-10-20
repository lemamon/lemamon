/**
 * Rótulo do CTA de diagnóstico (B167, BLUEPRINT §8.6) — components/shared/cta-label.ts.
 * Dono: home. Com agenda online, TODO CTA de diagnóstico vira "Agendar…",
 * inclusive o das seções de método; sem agenda, o de método usa a variação.
 */
import { describe, expect, it } from "vitest";

import { diagnosisCtaKey } from "@/components/shared/cta-label";
import { t, type Locale } from "@/i18n";

const LOCALES: Locale[] = ["pt", "en", "es"];

describe("diagnosisCtaKey (B167)", () => {
  it("sem agenda: primário = Pedir; método = a variação de método", () => {
    expect(diagnosisCtaKey({ hasAgenda: false })).toBe("shared.cta.primary");
    expect(diagnosisCtaKey({ hasAgenda: false }, "method")).toBe("shared.cta.primary_method");
  });

  it("com agenda: primário E método = Agendar (um rótulo primário só por página)", () => {
    expect(diagnosisCtaKey({ hasAgenda: true })).toBe("shared.cta.primary_schedule");
    expect(diagnosisCtaKey({ hasAgenda: true }, "method")).toBe("shared.cta.primary_schedule");
  });

  it("com agenda, nenhum CTA de diagnóstico sai com o rótulo 'Pedir…' nos 3 idiomas", () => {
    for (const locale of LOCALES) {
      const pedir = t(locale, "shared.cta.primary");
      for (const label of ["primary", "method"] as const) {
        expect(t(locale, diagnosisCtaKey({ hasAgenda: true }, label)), `${locale} ${label}`).not.toBe(pedir);
      }
    }
  });
});
