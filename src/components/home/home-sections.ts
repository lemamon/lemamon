/**
 * Plano das seções da Home (BLUEPRINT §6.1) — numeração e divisórias. Dono: home.
 *
 * "Engenharia visível" (03-ui §3.5.2, B216): cada seção-capítulo leva na
 * eyebrow a sua posição na página ("02 / …", mono) e, quando duas seções
 * vizinhas têm a mesma superfície, uma linha de 1px separa as duas. A conta
 * usa as MESMAS flags que escondem as seções when_data (features.ts), então a
 * numeração não tem buraco em produção (sem dado) nem com a camada fictícia.
 *
 * Fora da numeração: hero, faixas (compromissos, logos) e o depoimento (é
 * um respiro entre capítulos, com título só para leitor de tela).
 *
 * Seguro para testes: só tipos e funções puras.
 */
import type { Features } from "@/config/features";
import { hasText, tDynamic, type Locale } from "@/i18n";

export const HOME_SECTIONS = [
  "hero",
  "commitments",
  "logos",
  "problem",
  "risks",
  "method",
  "testimonial",
  "services",
  "cases",
  "investment",
  "team",
  "trust_profiles",
  "faq",
  "cta_final",
] as const;
export type HomeSectionKey = (typeof HOME_SECTIONS)[number];

type Surface = "canvas" | "subtle" | "inverse";

interface SectionDef {
  surface: Surface;
  /** Capítulo numerado na eyebrow. */
  numbered: boolean;
  /** Já desenha as próprias linhas de 1px (faixa de compromissos). */
  framed?: boolean;
  /** Linha de topo sempre (riscos: abre o arco que desce até o método). */
  alwaysDivider?: boolean;
  visible: (features: HomeSectionFeatures) => boolean;
}

export type HomeSectionFeatures = Pick<
  Features,
  "hasLogos" | "hasTestimonials" | "hasCases" | "pricingLines" | "hasTeam" | "hasProfiles"
>;

const always = () => true;

const DEFS: Record<HomeSectionKey, SectionDef> = {
  hero: { surface: "canvas", numbered: false, visible: always },
  commitments: { surface: "subtle", numbered: false, framed: true, visible: always },
  logos: { surface: "subtle", numbered: false, visible: (f) => f.hasLogos },
  problem: { surface: "canvas", numbered: true, visible: always },
  risks: { surface: "subtle", numbered: true, alwaysDivider: true, visible: always },
  method: { surface: "inverse", numbered: true, visible: always },
  testimonial: { surface: "canvas", numbered: false, visible: (f) => f.hasTestimonials },
  services: { surface: "canvas", numbered: true, visible: always },
  cases: { surface: "canvas", numbered: true, visible: (f) => f.hasCases },
  // A Home mostra todas as linhas de preço: o bloco existe com qualquer linha completa.
  investment: { surface: "subtle", numbered: true, visible: (f) => f.pricingLines.length > 0 },
  team: { surface: "canvas", numbered: true, visible: (f) => f.hasTeam },
  trust_profiles: { surface: "canvas", numbered: true, visible: (f) => f.hasProfiles },
  faq: { surface: "subtle", numbered: true, visible: always },
  cta_final: { surface: "inverse", numbered: true, visible: always },
};

export interface HomeSectionSlot {
  visible: boolean;
  /** Posição do capítulo (1 → "01 /"); undefined = sem número. */
  index?: number;
  /** Linha de 1px no topo. */
  divider: boolean;
}

/** Visibilidade, número e divisória de cada seção da Home, para este build. */
export function homeSectionPlan(features: HomeSectionFeatures): Record<HomeSectionKey, HomeSectionSlot> {
  const plan = {} as Record<HomeSectionKey, HomeSectionSlot>;
  let index = 0;
  let previous: SectionDef | undefined;
  for (const key of HOME_SECTIONS) {
    const def = DEFS[key];
    const visible = def.visible(features);
    if (!visible) {
      plan[key] = { visible, divider: false };
      continue;
    }
    const sameSurface = previous !== undefined && previous.surface === def.surface && !previous.framed;
    plan[key] = {
      visible,
      index: def.numbered ? ++index : undefined,
      divider: Boolean(def.alwaysDivider) || (sameSurface && def.surface !== "inverse"),
    };
    previous = def;
  }
  return plan;
}

/** Texto opcional do i18n (eyebrow nova que ainda pode não existir nos 3 idiomas). */
export function optionalText(locale: Locale, key: string): string | undefined {
  return hasText(locale, key) ? tDynamic(locale, key) : undefined;
}
