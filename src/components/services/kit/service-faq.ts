/**
 * FAQ das 5 páginas de serviço (services._notes.faq_composition). Dono: pages.
 * Fonte única da ordem usada por src/views/ServiceView.astro e pelos testes
 * (tests/unit/pages-faq.test.ts), para a página e o teste nunca divergirem.
 *
 * - `wont_stall` ("Como eu sei que o projeto não vai parar no meio?"): nas 4
 *   páginas de projeto, logo depois do how_long_* (faq._notes.wont_stall). Na
 *   PME é a pergunta do banco (faq.items.wont_stall, "software"); no MVP, a
 *   própria (services.mvp.faq.wont_stall, "produto"). Nunca sai pelo teto.
 * - Sustentação abre por how_it_starts ("Preciso saber o que está errado no
 *   sistema para começar?"): a 1ª pergunta abre sozinha (§5.6), e a diferença
 *   entre sustentação e evolução já foi definida em what_it_is, logo depois
 *   dos sinais (painel de design).
 *
 * Teto de 9 visíveis; acima disso, saem na ordem de FAQ_REMOVAL. Nunca saem:
 * price, why_discovery_paid, how_long_*, how_follow_progress, wont_stall,
 * scope_change e code_ownership. start_with_part (sistemas web) e
 * store_publishing (aplicativos) entram na ordem de remoção para
 * code_ownership caber quando a flag ligar (pior caso testado em
 * tests/unit/pages-faq.test.ts).
 */
import type { ServiceKey } from "@/config/routes";

import type { FaqEntry } from "./faq-compose";

export const SERVICE_FAQ: Readonly<Record<ServiceKey, readonly FaqEntry[]>> = {
  web_systems: [
    { own: "custom_vs_ready" },
    { bank: "need_tech_knowledge" },
    { own: "start_with_part" },
    { cond: "data_migration" },
    { own: "price" },
    { bank: "why_discovery_paid" },
    { own: "how_long_system" },
    { bank: "wont_stall" },
    { cond: "scope_change" },
    { bank: "how_follow_progress" },
    { cond: "code_ownership" },
    { cond: "skip_discovery" },
    { cond: "nda" },
    { cond: "invoice" },
  ],
  mobile_apps: [
    { own: "app_or_web" },
    { own: "ios_android" },
    { own: "store_publishing" },
    { own: "price" },
    { bank: "why_discovery_paid" },
    { own: "how_long_app" },
    { bank: "wont_stall" },
    { cond: "scope_change" },
    { bank: "how_follow_progress" },
    { cond: "code_ownership" },
    { cond: "invoice" },
  ],
  integrations: [
    { own: "integrate_existing" },
    { bank: "need_tech_knowledge" },
    { own: "integrate_or_replace" },
    { own: "price" },
    { bank: "why_discovery_paid" },
    { own: "how_long_integration" },
    { bank: "wont_stall" },
    { cond: "scope_change" },
    { bank: "how_follow_progress" },
    { cond: "code_ownership" },
    { cond: "skip_discovery" },
    { cond: "nda" },
    { cond: "invoice" },
  ],
  mvp: [
    { own: "price" },
    { bank: "why_discovery_paid" },
    { cond: "discovery_duration" },
    { own: "wont_stall" },
    { cond: "code_ownership" },
    { own: "how_long_mvp" },
    { cond: "scope_change" },
    { own: "what_goes_in" },
    { own: "what_is_mvp" },
    { own: "after_mvp" },
    { cond: "discovery_plan_ownership" },
    { cond: "third_party_system" },
    { cond: "skip_discovery" },
  ],
  support: [
    { own: "how_it_starts" },
    { own: "support_vs_evolution" },
    { cond: "third_party_system" },
    { own: "price" },
    { cond: "skip_discovery" },
    { cond: "invoice" },
  ],
};

/** Perguntas próprias em que "diagnóstico gratuito" vira link (services._notes.faq_links). */
export const SERVICE_FAQ_DIAGNOSIS_LINK: Readonly<Partial<Record<ServiceKey, readonly string[]>>> = {
  web_systems: ["custom_vs_ready"],
  mobile_apps: ["app_or_web"],
  integrations: ["integrate_or_replace", "integrate_existing"],
};

/**
 * Ordem de remoção acima do teto de 9 (services._notes.faq_composition), mais
 * start_with_part (sistemas web: com wont_stall, migração, mudança de escopo e
 * código ligados ao mesmo tempo, a página teria 10) e store_publishing.
 */
export const SERVICE_FAQ_REMOVAL = [
  "invoice",
  "nda",
  "skip_discovery",
  "need_tech_knowledge",
  "start_with_part",
  "store_publishing",
  "what_is_mvp",
  "third_party_system",
  "discovery_plan_ownership",
] as const;

/** Perguntas que o teto nunca tira (as objeções de dinheiro, prazo, risco, mudança e código). */
export const SERVICE_FAQ_NEVER_REMOVED = [
  "price",
  "why_discovery_paid",
  "how_long_system",
  "how_long_app",
  "how_long_integration",
  "how_long_mvp",
  "how_follow_progress",
  "wont_stall",
  "scope_change",
  "code_ownership",
] as const;
