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
 * - Garantias à vista (auditoria de conversão F01, F12, F15): o NDA nunca sai
 *   pelo teto onde aparece (sistemas web, aplicativos e MVP; no MVP logo
 *   depois de code_ownership). Em integrações, `data_access` ("Vocês assinam
 *   NDA? E quem acessa os dados dos meus sistemas?") entra perto do topo no
 *   lugar de how_follow_progress e do condicional nda, que repetiria a mesma
 *   resposta. No MVP, how_long_mvp vem logo depois de price (preço e prazo nas
 *   duas primeiras perguntas) e what_is_mvp desce para a ordem de remoção.
 *
 * Teto de 9 visíveis; acima disso, cada página tira os itens na ordem da SUA
 * lista em SERVICE_FAQ_REMOVAL. Nunca saem: SERVICE_FAQ_NEVER_REMOVED (price,
 * pay_before_development, how_long_*, wont_stall, scope_change, code_ownership,
 * nda e data_access). pay_before_development ("Pago alguma coisa antes do
 * desenvolvimento?") entrou no lugar de why_discovery_paid em 21/10/2026 (D44:
 * a Sprint de Descoberta é gratuita), na mesma posição. how_follow_progress pode sair em sistemas web e
 * aplicativos: wont_stall, logo acima, já diz que a cada 2 semanas você recebe
 * uma parte funcionando. Pior caso testado em tests/unit/pages-faq.test.ts.
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
    { bank: "pay_before_development" },
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
    { bank: "pay_before_development" },
    { own: "how_long_app" },
    { bank: "wont_stall" },
    { cond: "scope_change" },
    { bank: "how_follow_progress" },
    { cond: "code_ownership" },
    { cond: "nda" },
    { cond: "invoice" },
  ],
  integrations: [
    { own: "integrate_existing" },
    { bank: "need_tech_knowledge" },
    { own: "data_access" },
    { own: "integrate_or_replace" },
    { own: "price" },
    { bank: "pay_before_development" },
    { own: "how_long_integration" },
    { bank: "wont_stall" },
    { cond: "scope_change" },
    { cond: "code_ownership" },
    { cond: "skip_discovery" },
    { cond: "invoice" },
  ],
  mvp: [
    { own: "price" },
    { own: "how_long_mvp" },
    { bank: "pay_before_development" },
    { cond: "discovery_duration" },
    { own: "wont_stall" },
    { cond: "code_ownership" },
    { cond: "nda" },
    { cond: "scope_change" },
    { own: "what_goes_in" },
    { own: "after_mvp" },
    { own: "what_is_mvp" },
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
 * Ordem de remoção acima do teto de 9, por página (services._notes.faq_composition).
 * Com os dados de hoje (escopo, código, NDA e duração da Descoberta ligados;
 * a duração sem número desde a D44):
 * sistemas web tira need_tech_knowledge e start_with_part; aplicativos,
 * store_publishing e how_follow_progress; integrações, need_tech_knowledge;
 * MVP, what_is_mvp e after_mvp.
 */
export const SERVICE_FAQ_REMOVAL: Readonly<Record<ServiceKey, readonly string[]>> = {
  web_systems: ["invoice", "skip_discovery", "need_tech_knowledge", "start_with_part", "how_follow_progress"],
  mobile_apps: ["invoice", "store_publishing", "how_follow_progress"],
  integrations: ["invoice", "skip_discovery", "need_tech_knowledge"],
  mvp: ["skip_discovery", "what_is_mvp", "third_party_system", "discovery_plan_ownership", "after_mvp"],
  support: ["invoice", "skip_discovery"],
};

/** Perguntas que o teto nunca tira (as objeções de dinheiro, prazo, risco, mudança, código e sigilo). */
export const SERVICE_FAQ_NEVER_REMOVED = [
  "price",
  "pay_before_development",
  "how_long_system",
  "how_long_app",
  "how_long_integration",
  "how_long_mvp",
  "wont_stall",
  "scope_change",
  "code_ownership",
  "nda",
  "data_access",
] as const;
