/**
 * Texto do /llms.txt (auditoria SEO S05-10; dono: shell). SÓ SERVIDOR (usa i18n).
 *
 * Resumo do site em texto, no formato de llmstxt.org (H1 com o nome, citação
 * com o resumo, seções com listas de links), para quem lê o arquivo: nome,
 * categoria e cidade (meta.organization_description), o método (promessa da
 * Home), o que é cobrado e quando (FAQ "Pago alguma coisa antes do
 * desenvolvimento?"), o atendimento fora de São Paulo (FAQ other_cities, só
 * com a flag da D31), o contato e as páginas principais nos 3 idiomas, com o
 * title e a description de cada uma.
 *
 * Nada é escrito aqui: tudo sai do i18n, das configs e das flags de
 * features.ts, na MESMA variante que a página mostra (bankItems e
 * conditionalItems de shared/faq; description sem WhatsApp quando não há
 * número). Página when_data entra só com a flag. Sem data, contagem nem
 * "hoje": é texto que não envelhece.
 *
 * Prioridade baixa: nem o Google nem a OpenAI declaram ler o arquivo. A
 * política de rastreadores de IA (S05-9) é decisão do dono e mora no
 * public/robots.txt, que continua liberando tudo (playbook 15).
 *
 * src/pages/[llms].txt.ts publica o resultado SÓ sem a camada fictícia.
 */

import { bankItems, conditionalItems } from "@/components/shared/faq";
import { empresa } from "@/config/empresa";
import type { Features } from "@/config/features";
import { absoluteUrl, hasLocale, isRouteLive, routeDef, SERVICE_KEYS, SERVICE_ROUTE, urlFor, type RouteKey } from "@/config/routes";
import { hasText, LOCALES, t, tDynamic, type Locale } from "@/i18n";

/** Páginas listadas, na ordem do menu e do rodapé. As when_data só entram com a flag. */
export const LLMS_PAGES: readonly RouteKey[] = [
  "home",
  "how_we_work",
  "discovery_sprint",
  "services_hub",
  ...SERVICE_KEYS.map((key) => SERVICE_ROUTE[key]),
  "pricing",
  "cases_hub",
  "about",
  "blog_hub",
  "contact",
  "quote",
];

type LlmsFeatures = Pick<Features, "hasPricing" | "confirm" | "hasCompanyData" | "hasWhatsapp" | "hasCases" | "hasTeam" | "hasPosts">;

/** Texto de uma chave meta.<página>.<campo>, com a variante sem WhatsApp quando não há número. */
function metaText(locale: Locale, route: RouteKey, field: "title" | "description", features: LlmsFeatures): string {
  const base = `meta.${routeDef(route).meta}.${field}`;
  const noWhatsapp = `${base}_no_whatsapp`;
  return !features.hasWhatsapp && hasText(locale, noWhatsapp) ? tDynamic(locale, noWhatsapp) : tDynamic(locale, base);
}

/** Title sem a marca do fim ("Contato | Lemamon.dev" → "Contato"): no arquivo, a marca já é o H1. */
function pageName(title: string): string {
  return title.split(" | ")[0]?.trim() || title;
}

/** Linha "pergunta resposta" de um item de FAQ. */
const qa = (item: { question: string; answer: string }) => `${item.question} ${item.answer}`;

function localeSection(locale: Locale, features: LlmsFeatures): string[] {
  const lines = [`## ${tDynamic(locale, `shared.language.${locale}`)}`, ""];
  if (locale !== "pt") lines.push(`> ${t(locale, "meta.organization_description")}`, "");
  lines.push(t(locale, "home.hero.title"), "");
  for (const item of bankItems(locale, ["pay_before_development"], features)) lines.push(qa(item), "");
  for (const item of conditionalItems(locale, ["other_cities"], features)) lines.push(qa(item), "");
  lines.push(`${t(locale, "shared.footer.links.contact")}: ${empresa.email} · ${absoluteUrl(urlFor("contact", locale))}`, "");
  for (const route of LLMS_PAGES) {
    if (!hasLocale(route, locale) || !isRouteLive(route, features)) continue;
    const name = pageName(metaText(locale, route, "title", features));
    lines.push(`- [${name}](${absoluteUrl(urlFor(route, locale))}): ${metaText(locale, route, "description", features)}`);
  }
  lines.push("");
  return lines;
}

/** Conteúdo do /llms.txt para as flags do build. */
export function buildLlmsTxt(features: LlmsFeatures): string {
  const lines = [`# ${t("pt", "meta.site_name")}`, "", `> ${t("pt", "meta.organization_description")}`, ""];
  for (const locale of LOCALES) lines.push(...localeSection(locale, features));
  return `${lines.join("\n").trimEnd()}\n`;
}
