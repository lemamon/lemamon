/**
 * Consultas às coleções when_data (dono: gated). SÓ SERVIDOR (astro:content).
 *
 * Toda página/seção que lista conteúdo passa por aqui, para as regras valerem
 * igual em todo lugar:
 *  - case: só "publicado nos 3 idiomas" (features.publishedCases);
 *  - post: só "não rascunho", com <CtaMeio /> no corpo (falta = build quebra);
 *  - pessoa do time: só quem atua em projetos;
 *  - link para case (logo, depoimento, relacionados): só se o case estiver no ar.
 */

import { getCollection, type CollectionEntry } from "astro:content";

import { collectionHasFiles, getFeatures, publishedCases } from "../config/features";
import type { ServiceKey } from "../config/routes";
import { hasMidCta, POST_MID_CTA_TAG, STAGE_IDS, type StageId } from "../content/schemas";
import { LOCALES, type Locale } from "../i18n/locales";

export interface CaseItem {
  /** Chave do case: o nome do arquivo, igual nos 3 idiomas (`relacionados`, `caseSlug`, `?ref=`). */
  slug: string;
  /** Slug da URL no idioma da entrada (`slugUrl` em en/es, S01-3; senão, a chave). Todo urlFor("case") usa este. */
  urlSlug: string;
  entry: CollectionEntry<"cases">;
}

/** Slug da URL de uma entrada de case: `slugUrl` do idioma ou, sem ele, a chave (nome do arquivo). */
export function caseUrlSlug(entry: { data: { slugUrl?: string | undefined } }, slug: string): string {
  return entry.data.slugUrl ?? slug;
}

const byOrder = <T extends { data: { ordem: number } }>(a: T, b: T, tie: (a: T, b: T) => number) =>
  a.data.ordem - b.data.ordem || tie(a, b);

/** Slugs de cases que têm página no ar (hasCases + publicado nos 3 idiomas). */
export async function liveCaseSlugs(): Promise<Set<string>> {
  const features = await getFeatures();
  if (!features.hasCases || !collectionHasFiles("cases")) return new Set();
  const all = await getCollection("cases");
  return new Set(
    publishedCases(all.map((entry) => ({ id: entry.id, publicado: entry.data.publicado, servicos: entry.data.servicos }))).map(
      (item) => item.slug,
    ),
  );
}

/**
 * Cases publicados nos 3 idiomas, com a versão do idioma pedido, na ordem
 * `ordem` (menor primeiro) e depois slug. Não olha hasCases: quem precisa de
 * página no ar (links) confere a flag ou usa liveCaseSlugs().
 */
export async function caseItems(locale: Locale): Promise<CaseItem[]> {
  if (!collectionHasFiles("cases")) return [];
  const all = await getCollection("cases");
  const slugs = publishedCases(
    all.map((entry) => ({ id: entry.id, publicado: entry.data.publicado, servicos: entry.data.servicos })),
  ).map((item) => item.slug);
  return slugs
    .flatMap((slug) => {
      const entry = all.find((item) => item.id === `${locale}/${slug}`);
      return entry ? [{ slug, urlSlug: caseUrlSlug(entry, slug), entry }] : [];
    })
    .sort((a, b) => byOrder(a.entry, b.entry, () => a.slug.localeCompare(b.slug)));
}

/** Um case publicado no idioma pedido (ou null). */
export async function caseItem(locale: Locale, slug: string): Promise<CaseItem | null> {
  return (await caseItems(locale)).find((item) => item.slug === slug) ?? null;
}

/**
 * Slug da URL do case em cada idioma (chave → { pt, en, es }), para o hreflang
 * e o seletor de idioma da página do case (S01-3). Idioma sem a entrada
 * publicada fica de fora.
 */
export async function caseUrlSlugs(slug: string): Promise<Partial<Record<Locale, string>>> {
  const entries = await Promise.all(LOCALES.map(async (locale) => [locale, (await caseItem(locale, slug))?.urlSlug] as const));
  return Object.fromEntries(entries.filter(([, urlSlug]) => Boolean(urlSlug)));
}

/** Slug da URL de cada case publicado no idioma (chave → slug da URL), para links que só têm a chave (logo, depoimento). */
export async function caseUrlSlugMap(locale: Locale): Promise<Map<string, string>> {
  return new Map((await caseItems(locale)).map((item) => [item.slug, item.urlSlug]));
}

/**
 * Cases relacionados (BLUEPRINT §6.5 #7, §6.10 #9, §7.8 meanwhile):
 *  - `service`: só os que têm a tag;
 *  - `prefer`: slugs escolhidos à mão (campo `relacionados` do case) vêm primeiro;
 *  - `sharedWith`: depois, os que compartilham mais tags com o case de origem;
 *  - `exclude`: o próprio case.
 * Sem hasCases devolve [] (os cards linkam para páginas de case).
 */
export async function relatedCaseItems(
  locale: Locale,
  options: {
    service?: ServiceKey;
    sharedWith?: readonly ServiceKey[];
    exclude?: string;
    prefer?: readonly string[];
    limit: number;
  },
): Promise<CaseItem[]> {
  const features = await getFeatures();
  if (!features.hasCases) return [];
  const pool = (await caseItems(locale)).filter((item) => item.slug !== options.exclude);
  const preferred = (options.prefer ?? [])
    .map((slug) => pool.find((item) => item.slug === slug))
    .filter((item): item is CaseItem => Boolean(item));
  const shared = (item: CaseItem) => item.entry.data.servicos.filter((tag) => options.sharedWith?.includes(tag)).length;
  const matching = pool
    .filter((item) => !preferred.includes(item) && (!options.service || item.entry.data.servicos.includes(options.service)))
    .map((item, index) => ({ item, index, score: shared(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
  return [...preferred, ...matching].slice(0, options.limit);
}

/** Etapas que o case teve, na ordem do método (ficha "Etapas contratadas"). */
export function caseStages(entry: CollectionEntry<"cases">): StageId[] {
  const present = new Set(entry.data.comoFoi.map((step) => step.etapa));
  return STAGE_IDS.filter((stage) => present.has(stage));
}

/** Quem é o cliente nas listas e no eyebrow do case: cliente (autorizado) ou "setor · porte" (D45). */
export function caseDisplayName(entry: CollectionEntry<"cases">): string {
  const { cliente, setor, porte } = entry.data;
  return cliente ?? [setor, porte].filter(Boolean).join(" · ");
}

/**
 * Nome do PROJETO no breadcrumb, no BreadcrumbList e na mensagem do WhatsApp
 * (auditoria de SEO S02-10, S03-15, S03-2): `seoTitle` ou, sem ele,
 * `tipoDeSistema`. Nunca "setor · porte", que se repete entre cases e não diz
 * qual projeto é (setor e porte ficam no eyebrow, D45).
 */
export function caseProjectName(entry: { data: { seoTitle?: string | undefined; tipoDeSistema: string } }): string {
  return entry.data.seoTitle ?? entry.data.tipoDeSistema;
}

/** Copia a entrada trocando `caseSlug` por undefined quando o case não está no ar. */
function withLiveCaseSlug<E extends { data: { caseSlug?: string | undefined } }>(entry: E, live: Set<string>): E {
  const slug = entry.data.caseSlug;
  if (!slug || live.has(slug)) return entry;
  return { ...entry, data: { ...entry.data, caseSlug: undefined } };
}

/** Logos autorizados (ordem, depois empresa). `caseSlug` só sobrevive se o case estiver no ar. */
export async function logoItems(): Promise<CollectionEntry<"logos">[]> {
  if (!collectionHasFiles("logos")) return [];
  const [all, live] = await Promise.all([getCollection("logos"), liveCaseSlugs()]);
  return all
    .map((entry) => withLiveCaseSlug(entry, live))
    .sort((a, b) => byOrder(a, b, () => a.data.empresa.localeCompare(b.data.empresa, "pt-BR")));
}

/**
 * Depoimentos nominais autorizados. Os que falam do processo (sobreProcesso) vêm
 * primeiro, depois `ordem` e nome. `caseSlug` só sobrevive se o case estiver no ar.
 */
export async function testimonialItems(): Promise<CollectionEntry<"depoimentos">[]> {
  if (!collectionHasFiles("depoimentos")) return [];
  const [all, live] = await Promise.all([getCollection("depoimentos"), liveCaseSlugs()]);
  return all
    .map((entry) => withLiveCaseSlug(entry, live))
    .sort(
      (a, b) =>
        Number(b.data.sobreProcesso) - Number(a.data.sobreProcesso) ||
        byOrder(a, b, () => a.data.nome.localeCompare(b.data.nome, "pt-BR")),
    );
}

/** Depoimento por id (referência do case). */
export async function testimonialById(id: string | undefined | null): Promise<CollectionEntry<"depoimentos"> | null> {
  if (!id) return null;
  return (await testimonialItems()).find((entry) => entry.id === id) ?? null;
}

/** Pessoas completas que atuam em projetos (seção Time e /sobre), na ordem `ordem`, depois nome. */
export async function teamItems(): Promise<CollectionEntry<"time">[]> {
  if (!collectionHasFiles("time")) return [];
  const all = await getCollection("time", (entry) => entry.data.atuaEmProjetos);
  return all.sort((a, b) => byOrder(a, b, () => a.data.nome.localeCompare(b.data.nome, "pt-BR")));
}

/**
 * Posts publicados (não rascunho), do mais novo para o mais antigo. Blog só em pt-BR.
 * Todo post precisa do componente <CtaMeio /> no meio do texto (BLUEPRINT §6.12:
 * 1 CTA contextual no meio): sem ele o build falha com o nome do arquivo.
 */
export async function postItems(): Promise<CollectionEntry<"posts">[]> {
  if (!collectionHasFiles("posts")) return [];
  const posts = await getCollection("posts", (entry) => !entry.data.rascunho);
  const missing = posts.filter((entry) => !hasMidCta(entry.body)).map((entry) => entry.id);
  if (missing.length) {
    throw new Error(`[content] posts sem <${POST_MID_CTA_TAG} /> no meio do texto: ${missing.join(", ")}`);
  }
  return posts.sort((a, b) => b.data.publicadoEm.getTime() - a.data.publicadoEm.getTime());
}

/**
 * 2–3 posts relacionados: os escolhidos no frontmatter (`relacionados`), depois
 * os do mesmo serviço, depois os mais novos.
 */
export async function relatedPosts(entry: CollectionEntry<"posts">, limit: number): Promise<CollectionEntry<"posts">[]> {
  const pool = (await postItems()).filter((post) => post.id !== entry.id);
  const preferred = (entry.data.relacionados ?? [])
    .map((slug) => pool.find((post) => post.id === slug))
    .filter((post): post is CollectionEntry<"posts"> => Boolean(post));
  const sameService = pool.filter((post) => !preferred.includes(post) && entry.data.servico && post.data.servico === entry.data.servico);
  const rest = pool.filter((post) => !preferred.includes(post) && !sameService.includes(post));
  return [...preferred, ...sameService, ...rest].slice(0, limit);
}

/**
 * Corta um texto de <head> na última palavra inteira (i18n _notes.blog: sem
 * seoTitle/seoDescription, o template trunca; title ≤ 50 sem a marca, description ≤ 155).
 */
export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.lastIndexOf(" ") > max / 2 ? cut.slice(0, cut.lastIndexOf(" ")) : cut;
  return `${atWord.replace(/[\s,.;:!?—–-]+$/, "")}…`;
}
