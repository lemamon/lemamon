/**
 * Rótulo do CTA de diagnóstico (BLUEPRINT §8.6). Dono: home. Puro: seguro
 * para testes.
 *
 * "primary" = shared.cta.primary ("Pedir diagnóstico gratuito"), ou
 * shared.cta.primary_schedule ("Agendar diagnóstico gratuito") com agenda
 * online (primaryCtaKey). "method" = shared.cta.primary_method, a variação das
 * seções de método — MAS, com agenda, também vira "Agendar…" (B167): a página
 * nunca mostra dois rótulos primários diferentes.
 * Usado por CtaDiagnosis (home); o TextCta dos serviços (pages) pode usar o
 * mesmo.
 */
import { primaryCtaKey, type Features } from "@/config/features";

export type DiagnosisCtaLabel = "primary" | "method";

export function diagnosisCtaKey(
  features: Pick<Features, "hasAgenda">,
  label: DiagnosisCtaLabel = "primary",
): "shared.cta.primary" | "shared.cta.primary_schedule" | "shared.cta.primary_method" {
  return label === "method" && !features.hasAgenda ? "shared.cta.primary_method" : primaryCtaKey(features);
}
