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
 * - `pay_before_development` ("Pago alguma coisa antes do desenvolvimento?")
 *   abre a página no lugar de why_discovery_paid desde 21/10/2026 (D44: a
 *   Sprint de Descoberta é gratuita) e nunca sai pelo teto.
 *
 * - `other_cities` ("Vocês atendem empresas de outras cidades ou de fora do
 *   Brasil?") entra logo depois do nda (auditoria SEO S05-7 e S03-12): era a
 *   única resposta para quem é de fora do Brasil e só aparecia na Home, e a
 *   1ª frase dela nomeia a categoria da empresa (S05-1). Com os dados de hoje
 *   são 10 itens e sai need_tech_knowledge, que continua na Home.
 *
 * Teto de 9 visíveis; com todas as flags são 14 itens, e saem os 5 visíveis de
 * HWW_FAQ_REMOVAL (o nda, a reserva, também: ele continua nas páginas de
 * serviço e em /contato). discovery_duration e discovery_plan_ownership
 * saem antes dos outros condicionais porque /sprint-de-descoberta, ligada em
 * stage_discovery.link, responde os dois.
 */
import type { FaqEntry } from "@/components/services/kit/faq-compose";

export const HWW_FAQ: readonly FaqEntry[] = [
  { bank: "pay_before_development" },
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
  { cond: "other_cities" },
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
  "pay_before_development",
  "how_long",
  "wont_stall",
  "scope_change",
  "code_ownership",
] as const;
