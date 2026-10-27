/**
 * Decisões jurídicas da Política de Privacidade — i18n _notes.launch_blockers,
 * _notes.privacy_conditionals e _notes.legal_review (dono: shell).
 * O DADO MORA EM dados/dono.json › privacidade. VAZIO POR PADRÃO.
 *
 * Cada campo escolhe uma variante JÁ ESCRITA em privacy.sections.* (nenhuma
 * frase nova sai daqui). Enquanto faltar algo obrigatório,
 * privacyLaunchBlockers() lista o que impede publicar a Política, e o build de
 * PRODUÇÃO (CONTEXT=production no Netlify) FALHA: src/views/PrivacyView.astro
 * lança erro com a lista. Preview e local continuam buildando, com as frases
 * incompletas fora da página (dado parcial não renderiza).
 *
 * A trava lê SEMPRE o dado REAL (privacidadeReal, empresaReal), nunca a camada
 * fictícia, e recusa valor com cara de fictício ("Exemplo", @example.com, o
 * CNPJ 00.000.000/0000-00): dado fictício nunca libera a Política.
 */

import { privacidade as privacidadeJson } from "../../dados/dono.json";
import { pareceFicticio } from "./camada-ficticia";
import { comCamadaFicticia } from "./dono";
import { empresaReal, isValidCnpj, type Empresa } from "./empresa";
import type { RouteKey } from "./routes";
import { isFilledText, type Localized } from "./types";

/**
 * Ferramentas OPCIONAIS que tratam dados dos pedidos (i18n
 * _notes.privacy_conditionals: precisam estar na Política ANTES de entrar no
 * ar). Cada uma liga processors.items.<item> e retention.items.<item>:
 *   agenda → scheduling (agenda online de dados/dono.json › agenda)
 *   crm → crm (CRM ou planilha na nuvem com os pedidos)
 *   emailAcompanhamento → email_tool (e-mails de acompanhamento a quem pediu)
 *   automacao → automation (outgoing webhook/automação do Netlify Forms)
 *   chatEquipe → team_chat (aviso de pedido no chat da equipe, ex. Slack)
 * null = ferramenta inativa (nada aparece). Preenchida, precisa de fornecedor
 * e prazo nos 3 idiomas, senão privacyLaunchBlockers() acusa.
 */
export interface FerramentaOpcional {
  /** Nome do serviço, como aparece na Política (ex.: "Calendly", "HubSpot"). */
  fornecedor: string;
  /** Prazo de retenção nessa ferramenta, por idioma. */
  prazo: Localized | null;
}

export const OPTIONAL_TOOLS = ["agenda", "crm", "emailAcompanhamento", "automacao", "chatEquipe"] as const;
export type OptionalTool = (typeof OPTIONAL_TOOLS)[number];

/** Placeholders de i18n de cada ferramenta (fornecedor, prazo). */
export const OPTIONAL_TOOL_VARS: Record<OptionalTool, { fornecedor: string; prazo: string }> = {
  agenda: { fornecedor: "fornecedor_agenda", prazo: "prazo_agenda" },
  crm: { fornecedor: "fornecedor_crm", prazo: "prazo_crm" },
  emailAcompanhamento: { fornecedor: "fornecedor_email", prazo: "prazo_email" },
  automacao: { fornecedor: "fornecedor_automacao", prazo: "prazo_automacao" },
  chatEquipe: { fornecedor: "fornecedor_chat", prazo: "prazo_chat" },
};

/**
 * Pixel de anúncio OPCIONAL (backlog B346 LinkedIn Insight Tag, B347 Meta
 * Pixel; decisão D12 do playbook 15, que hoje recomenda NÃO instalar). Mora em
 * dados/dono.json › privacidade.pixels.<pixel>; null ou ausente = desligado (o
 * padrão), e aí nada muda no site. Preenchido, o pixel só carrega:
 *   - no build de PRODUÇÃO (o atributo que o liga só sai com CONTEXT=production);
 *   - com baseAnuncios = "consentimento" (o aviso de cookies existe);
 *   - DEPOIS do "Aceitar" (src/scripts/consent.ts), nunca antes, nunca depois
 *     de "Recusar". Uso só de remarketing/medição de campanha no canal (12 §9):
 *     nenhum evento de lead, nenhuma resposta do pedido vai para o pixel.
 * A Política ganha os itens dele (navigation_data / processors / retention,
 * chaves linkedin_insight/linkedin e meta_pixel) só com o ID preenchido, e o
 * prazo de retenção é obrigatório. A CSP inclui os domínios só quando o build
 * publica o ID (src/integrations/csp.ts). privacyLaunchBlockers() barra ID sem
 * consentimento, ID inválido e ID sem prazo.
 */
export interface PixelDeAnuncio {
  /** LinkedIn: partner ID; Meta: pixel ID. Só dígitos. */
  id: string;
  /** Prazo de retenção nesse operador, por idioma ({prazo_linkedin_insight} / {prazo_meta_pixel}). */
  prazo: Localized | null;
}

export const PIXELS = ["linkedin", "meta"] as const;
export type Pixel = (typeof PIXELS)[number];

/** Placeholder do prazo de cada pixel na Política (retention.items.*). */
export const PIXEL_PRAZO_VAR: Record<Pixel, string> = {
  linkedin: "prazo_linkedin_insight",
  meta: "prazo_meta_pixel",
};

export const PROVEDORES_EMAIL = ["gmail", "google_workspace", "microsoft_365"] as const;
export type ProvedorEmail = (typeof PROVEDORES_EMAIL)[number];

export interface Privacidade {
  /** legal_basis.items.ads_measurement ("legitimo_interesse") ou ads_measurement_with_consent ("consentimento"). */
  baseAnuncios: "legitimo_interesse" | "consentimento" | null;
  /** "pequeno_porte" (sem controller.dpo) ou os dados do encarregado (liberam controller.dpo). */
  encarregado: "pequeno_porte" | { nome: string; email: string } | null;
  /** {mecanismo_transferencia}: vazio usa processors.closing; preenchido usa closing_with_mechanism. */
  mecanismoTransferencia: Localized | null;
  /** Prazos de retenção (placeholders {prazo_*} de privacy.sections.retention), por idioma. */
  prazos: {
    retencaoPedidos: Localized | null;
    ga4: Localized | null;
    googleAds: Localized | null;
    conversoesGoogleAds: Localized | null;
    newRelic: Localized | null;
    logsHospedagem: Localized | null;
  };
  /** {data} de privacy.updated, ISO "AAAA-MM-DD". Mude sempre que a Política mudar. */
  atualizadaEm: string;
  /**
   * Remarketing ou personalização de anúncios ligados na conta do Google Ads.
   * true troca navigation_data.items.google_ads por google_ads_with_remarketing e
   * inclui purposes.items.remarketing e legal_basis.items.remarketing. Exige
   * baseAnuncios = "consentimento" (privacyLaunchBlockers). O código já segue
   * sozinho (B348): a tag liga allow_ad_personalization_signals,
   * allow_google_signals e ad_personalization = granted só com remarketing E o
   * aceite (src/scripts/gtag-inline.ts), e o aviso de cookies troca o texto por
   * shared.consent.text_with_remarketing (ConsentBanner.astro). Falta só a conta:
   * Google Signals e públicos no GA4/Ads (playbook 06 §10).
   */
  remarketing: boolean;
  /**
   * Onde está o e-mail da Lemamon (processors.items.*): "gmail" (Gmail pessoal,
   * items.email), "google_workspace" (com aditivo de tratamento assinado,
   * items.email_with_workspace) ou "microsoft_365" (contratado pela GoDaddy,
   * items.email_with_microsoft_365). Playbook 11.
   */
  provedorEmail: ProvedorEmail;
  /**
   * A classificação automática também define a FORMA de atendimento (score C em
   * nutrição, D fora de perfil)? true usa as variantes *_with_routing (legal_review e).
   */
  classificacaoDefineAtendimento: boolean;
  /** "Não vendemos dados pessoais." (purposes.closing) só com a confirmação do dono E do advogado (legal_review m). */
  naoVendemosConfirmado: boolean;
  /**
   * A exclusão dos pedidos alcança a lixeira e os backups
   * (retention.items.requests_with_backups): true troca retention.items.requests
   * por requests_with_backups. Só com a confirmação do dono (memo 3.22 /
   * legal_review h): ele confirma o período de Itens Recuperáveis do M365, o
   * ciclo de backup e se o backup do WhatsApp está ligado. VAZIO/false por
   * padrão — sem a confirmação, a Política não afirma o alcance aos backups.
   */
  exclusaoAlcancaBackups: boolean;
  /** Ferramentas opcionais ativas (ver FerramentaOpcional). */
  ferramentas: Record<OptionalTool, FerramentaOpcional | null>;
  /** Pixels de anúncio opcionais (ver PixelDeAnuncio). Ausente = nenhum. */
  pixels?: Partial<Record<Pixel, PixelDeAnuncio | null>>;
}

/** Como está em dados/dono.json (sem a camada fictícia). É o que a trava de lançamento lê. */
export const privacidadeReal: Privacidade = privacidadeJson as unknown as Privacidade;

/** O que a página usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const privacidade: Privacidade = comCamadaFicticia("privacidade", privacidadeReal);

/**
 * Rotas SEM Meta Pixel (B347): as páginas com formulário (wizard, pós-envio e
 * contato, nos 3 idiomas). Os eventos automáticos e a correspondência
 * avançada da Meta leem botões, rótulos e campos da página; a Política promete
 * que nenhuma resposta do pedido vai para a Meta. O ConsentBanner não publica
 * data-meta-pixel-id nelas (o wizard já fica fora por placement "inline").
 */
export const META_PIXEL_FREE_ROUTES: readonly RouteKey[] = ["quote", "quote_sent", "contact"];

/** ID de pixel válido: só dígitos (o partner ID do LinkedIn tem 6–8; o pixel ID da Meta, 15–16). */
const PIXEL_ID = /^\d{4,20}$/;

/**
 * IDs dos pixels que PODEM carregar depois do aceite: preenchidos, válidos e com
 * baseAnuncios = "consentimento". Qualquer outra combinação devolve "" (nada
 * carrega, nada aparece na Política). O ConsentBanner ainda exige produção.
 */
export function activePixels(source: Privacidade = privacidade): Record<Pixel, string> {
  const ids = {} as Record<Pixel, string>;
  for (const pixel of PIXELS) {
    const id = source.pixels?.[pixel]?.id?.trim() ?? "";
    ids[pixel] = source.baseAnuncios === "consentimento" && PIXEL_ID.test(id) ? id : "";
  }
  return ids;
}

/** O que está ligado no site e precisa estar descrito na Política. */
export interface ActiveTools {
  /** dados/dono.json › agenda preenchida (features.hasAgenda). */
  hasAgenda?: boolean;
}

/** Texto real: preenchido e sem cara de dado fictício. */
const real = (value: string | undefined | null): boolean => Boolean(value?.trim()) && !pareceFicticio(value);

/**
 * O que ainda impede publicar a Política (lista vazia = pode publicar).
 * Padrão: o dado REAL de dados/dono.json (nunca a camada fictícia).
 */
export function privacyLaunchBlockers(
  source: Privacidade = privacidadeReal,
  active: ActiveTools = {},
  company: Empresa = empresaReal,
): string[] {
  const missing: string[] = [];
  const hasPj = real(company.razaoSocial) && isValidCnpj(company.cnpj);
  if (!hasPj && !real(company.responsavel)) {
    missing.push("dados/dono.json › empresa: razão social + CNPJ válido, ou responsável (dado real, não fictício)");
  }
  if (!source.baseAnuncios) missing.push("dados/dono.json › privacidade.baseAnuncios");
  // "consentimento" não trava mais: o aviso de cookies com Consent Mode v2 e o
  // link {preferencias_de_cookies} existem (ConsentBanner.astro, consent.ts,
  // gtag-inline.ts; backlog B344). Sem os textos shared.consent.* no i18n, o
  // próprio build cai ao desenhar o aviso.
  if (source.remarketing && source.baseAnuncios !== "consentimento") {
    missing.push("dados/dono.json › privacidade.remarketing exige baseAnuncios = 'consentimento'");
  }
  if (!source.encarregado) missing.push("dados/dono.json › privacidade.encarregado");
  if (source.encarregado && typeof source.encarregado === "object") {
    if (!real(source.encarregado.nome) || !/^\S+@\S+\.\S+$/.test(source.encarregado.email) || pareceFicticio(source.encarregado.email)) {
      missing.push("dados/dono.json › privacidade.encarregado com nome e e-mail reais e válidos");
    }
  }
  for (const [name, value] of Object.entries(source.prazos)) {
    if (!isFilledText(value) || Object.values(value).some(pareceFicticio)) {
      missing.push(`dados/dono.json › privacidade.prazos.${name}`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(source.atualizadaEm)) missing.push("dados/dono.json › privacidade.atualizadaEm");
  for (const tool of OPTIONAL_TOOLS) {
    const declared = source.ferramentas[tool];
    if (!declared) continue;
    if (!real(declared.fornecedor)) missing.push(`dados/dono.json › privacidade.ferramentas.${tool}.fornecedor`);
    if (!isFilledText(declared.prazo)) missing.push(`dados/dono.json › privacidade.ferramentas.${tool}.prazo (3 idiomas)`);
  }
  for (const pixel of PIXELS) {
    const declared = source.pixels?.[pixel];
    const id = declared?.id?.trim() ?? "";
    if (!declared || !id) continue;
    if (!PIXEL_ID.test(id) || pareceFicticio(id)) missing.push(`dados/dono.json › privacidade.pixels.${pixel}.id (só dígitos, o ID real da conta)`);
    if (source.baseAnuncios !== "consentimento") {
      missing.push(`dados/dono.json › privacidade.pixels.${pixel} exige baseAnuncios = 'consentimento' (o pixel só carrega depois do aceite)`);
    }
    if (!isFilledText(declared.prazo) || Object.values(declared.prazo).some(pareceFicticio)) {
      missing.push(`dados/dono.json › privacidade.pixels.${pixel}.prazo (3 idiomas)`);
    }
  }
  if (active.hasAgenda && !source.ferramentas.agenda) {
    missing.push(
      "dados/dono.json › agenda está ligada: declare privacidade.ferramentas.agenda (fornecedor e prazo) antes de publicar",
    );
  }
  return missing;
}
