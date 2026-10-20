/**
 * FAQ de /como-trabalhamos (how_we_work._notes.faq_composition, BLUEPRINT
 * §6.2). Dono: pages. Fonte única da ordem usada por
 * src/views/HowWeWorkView.astro e pelos testes (tests/unit/pages-faq.test.ts),
 * para a página e o teste nunca divergirem.
 *
 * - `wont_stall` ("Como eu sei que o projeto não vai parar no meio?") entra
 *   logo depois de how_long (painel de design, comercial): a objeção "já fui
 *   enganado / o projeto parou no meio" ganha resposta explícita na página do
 *   método, e não só implícita na tabela "Como costuma ser". É a mesma
 *   pergunta do banco que as 4 páginas de projeto já usam (faq.items.wont_stall),
 *   sem fato novo. Nunca sai pelo teto.
 *
 * Teto de 9 visíveis; com todas as flags são 13 itens, e saem os 4 primeiros
 * visíveis de HWW_FAQ_REMOVAL. discovery_duration e discovery_plan_ownership
 * saem antes dos outros condicionais porque /sprint-de-descoberta, ligada em
 * stage_discovery.link, responde os dois.
 */
import type { FaqEntry } from "@/components/services/kit/faq-compose";

export const HWW_FAQ: readonly FaqEntry[] = [
  { bank: "why_discovery_paid" },
  { bank: "how_long" },
  { bank: "wont_stall" },
  { bank: "diagnosis_commitment" },
  { bank: "need_tech_knowledge" },
  { cond: "diagnosis_format" },
  { cond: "scope_change" },
  { cond: "code_ownership" },
  { cond: "discovery_plan_ownership" },
  { cond: "discovery_duration" },
  { cond: "skip_discovery" },
  { cond: "nda" },
  { cond: "payment_terms" },
];

/** Ordem de remoção acima do teto de 9 (how_we_work._notes.faq_composition). */
export const HWW_FAQ_REMOVAL = [
  "need_tech_knowledge",
  "diagnosis_commitment",
  "discovery_duration",
  "discovery_plan_ownership",
  "nda",
] as const;

/** Perguntas que o teto nunca tira desta página (dinheiro, prazo, risco, mudança e código). */
export const HWW_FAQ_NEVER_REMOVED = [
  "why_discovery_paid",
  "how_long",
  "wont_stall",
  "scope_change",
  "code_ownership",
] as const;
