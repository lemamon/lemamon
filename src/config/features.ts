/**
 * features.ts — ÚNICA fonte das flags when_data (BLUEPRINT §4). Dono: gated.
 *
 * Páginas, Header, Footer, sitemap, mapa de rotas e hreflang consultam SÓ daqui.
 * Nada de checar `precos.sustentacao !== null` num componente: pergunte à flag.
 *
 * Uso (frontmatter .astro ou getStaticPaths):
 *   const features = await getFeatures();
 *   if (!features.hasPricing) return;          // a seção some inteira
 *
 * Ilhas React recebem só os booleanos de que precisam, por props. Este módulo
 * importa `astro:content` e zod: não pode ir para o bundle do cliente.
 *
 * Os dados vêm de dados/dono.json (src/config/dono.ts), com a camada fictícia
 * por cima só fora de produção e com PUBLIC_DADOS_FICTICIOS=true.
 *
 * computeFeatures() é puro (sem I/O) e é o que os testes exercitam com fixtures
 * (tests/fixtures/). Limiares EXATOS de BLUEPRINT §4 — dado parcial não conta:
 *
 *   hasPricing          ≥ 1 linha de precos completa nos 3 idiomas (faixa + 1–3 fatores)
 *   hasBudgetTiers      moeda + 4 faixas completas + corteMql
 *   hasMonthlyTiers     hasBudgetTiers + 4 faixas mensais completas + corteMqlMensal
 *   hasProfiles         ≥ 1 perfil com publicar: true
 *   hasAgenda           URL https em agenda
 *   hasCompanyData      razão social + CNPJ válido
 *   hasAboutIntro       empresa.apresentacao nos 3 idiomas
 *   hasAboutStory       empresa.historia (≥ 1 parágrafo) nos 3 idiomas
 *   hasDiscoveryFormat  os 3 campos de descoberta.ts (formato, participantes, ritmo)
 *                       nos 3 idiomas; a duração não conta nem é publicada (D44)
 *   hasDiscoveryExclusions  descoberta.naoInclui com ≥ 1 item nos 3 idiomas
 *   hasSupportFormat    inclui + contratacao + canais nos 3 idiomas
 *   hasEngineering      ≥ 1 campo de engenharia.ts nos 3 idiomas
 *   hasLogos            ≥ 4 empresas diferentes com logo autorizado
 *   hasTestimonials     ≥ 1 depoimento nominal autorizado
 *   hasCases            ≥ 2 cases publicados nos 3 idiomas
 *   hasCaseFilters      ≥ 6 cases publicados (chips do hub, BLUEPRINT §6.10)
 *   hasMethodProof      ≥ 1 case publicado ou ≥ 1 depoimento sobre o processo (/como-trabalhamos #11)
 *   hasTeam             ≥ 1 pessoa completa que atua em projetos
 *   hasPosts            ≥ 3 posts não rascunho
 */

import { getCollection } from "astro:content";

import donoJson from "../../dados/dono.json";
import { ARQUIVO_FICTICIO, listaDoDono, temMdx } from "../content/loaders";
import { SLUG_PATTERN } from "../content/schemas";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/locales";
import { agenda, agendaReal, type Agenda } from "./agenda";
import { CNPJ_FICTICIO } from "./camada-ficticia";
import { confirmacoes, confirmacoesReais, type Confirmacoes } from "./confirmacoes";
import { descoberta, descobertaReal, DISCOVERY_FIELDS, type Descoberta } from "./descoberta";
import { ARQUIVO_DONO, comCamadaFicticia, MODO_FICTICIO, SECOES_DONO } from "./dono";
import { empresa, empresaReal, isValidCnpj, type Empresa } from "./empresa";
import { ENGINEERING_FIELDS, engenharia, engenhariaReal, type Engenharia, type EngineeringField } from "./engenharia";
import { PROFILE_IDS, perfis, perfisReais, type Perfil, type ProfileId } from "./perfis";
import { getPriceLine, PRICE_LINE_IDS, precos, precosReais, type PriceLineId, type Precos } from "./precos";
import { qualificacao, qualificacaoReal, type BudgetTier, type Qualificacao } from "./qualificacao";
import { SERVICE_KEYS, type ServiceKey } from "./routes";
import { GA4_ID, hasWhatsappNumber, WHATSAPP_NUMBER } from "./site";
import { SUPPORT_REQUIRED_FIELDS, sustentacao, sustentacaoReal, type Sustentacao } from "./sustentacao";
import { isFilledList, isFilledText } from "./types";
import { assertDono } from "./validate";

/** Limiares de BLUEPRINT §4 (e §6.10 para os filtros do hub). */
export const THRESHOLDS = {
  logos: 4,
  testimonials: 1,
  cases: 2,
  caseFilters: 6,
  methodProofCases: 1,
  team: 1,
  posts: 3,
} as const;

/** Quantos itens cada seção mostra (BLUEPRINT §6.1 #9, §6.5 #7, §6.10, §6.2 #11, §6.12). */
export const LIMITS = {
  homeCases: 3,
  relatedCasesService: 3,
  relatedCasesCase: 2,
  methodProofCases: 2,
  relatedPosts: 3,
} as const;

export type ConfirmationId = keyof Confirmacoes;

export interface Features {
  /** ≥ 1 linha completa em precos.ts. */
  hasPricing: boolean;
  /** Linhas completas, na ordem de PRICE_LINE_IDS. Cada página filtra as suas. */
  pricingLines: PriceLineId[];
  /** Moeda + 4 faixas completas + corteMql em qualificacao.ts (P5 com faixas). */
  hasBudgetTiers: boolean;
  /** hasBudgetTiers + 4 faixas mensais completas + corteMqlMensal. */
  hasMonthlyTiers: boolean;
  /** ≥ 1 perfil com publicar = true. */
  hasProfiles: boolean;
  profiles: Record<ProfileId, boolean>;
  hasAgenda: boolean;
  /** Razão social + CNPJ válido. */
  hasCompanyData: boolean;
  /** Subtítulo de /sobre (empresa.apresentacao) nos 3 idiomas. */
  hasAboutIntro: boolean;
  /** "Por que a gente trabalha assim" (empresa.historia) nos 3 idiomas. */
  hasAboutStory: boolean;
  /**
   * Os 3 campos de DISCOVERY_FIELDS (formato, participantes, ritmo) completos.
   * A duração da Descoberta não entra nem é publicada: ela é definida com o
   * cliente no diagnóstico (decisão do dono de 21/10/2026, D44, que revoga a D42).
   */
  hasDiscoveryFormat: boolean;
  /** "O que a Descoberta não inclui": descoberta.naoInclui com ≥ 1 item nos 3 idiomas (B354). */
  hasDiscoveryExclusions: boolean;
  /** inclui + contratacao + canais completos em sustentacao.ts. */
  hasSupportFormat: boolean;
  /** ≥ 1 campo completo em engenharia.ts. */
  hasEngineering: boolean;
  engineeringFields: EngineeringField[];
  /** ≥ 4 logos autorizados (empresas diferentes). */
  hasLogos: boolean;
  /** ≥ 1 depoimento nominal autorizado. */
  hasTestimonials: boolean;
  /** ≥ 2 cases publicados nos 3 idiomas. */
  hasCases: boolean;
  /** Número de cases publicados nos 3 idiomas. */
  caseCount: number;
  /** ≥ 6 cases publicados: chips de filtro no hub /cases. */
  hasCaseFilters: boolean;
  /** "O método na prática" (/como-trabalhamos): ≥ 1 case publicado ou ≥ 1 depoimento sobre o processo. */
  hasMethodProof: boolean;
  /** Cases publicados por tag de serviço (cases relacionados: ≥ 1). */
  casesByService: Record<ServiceKey, number>;
  /** ≥ 1 pessoa completa que atua em projetos. */
  hasTeam: boolean;
  /** ≥ 3 posts publicados (não rascunho). */
  hasPosts: boolean;
  /** Uma flag por item de confirmacoes.ts (itens com texto: true só com os 3 idiomas preenchidos). */
  confirm: Record<ConfirmationId, boolean>;
  /** PUBLIC_WHATSAPP_NUMBER válido. Falso = nenhum botão de WhatsApp em lugar nenhum. */
  hasWhatsapp: boolean;
  /** PUBLIC_GA4_ID definido. */
  hasGa4: boolean;
}

/** Resumo das coleções que computeFeatures precisa (já validadas pelo schema). */
export interface ContentSnapshot {
  /** id = "<locale>/<slug>" (cases/<locale>/<slug>.mdx). */
  cases: ReadonlyArray<{
    id: string;
    publicado: boolean;
    servicos: readonly ServiceKey[];
    /** id do depoimento ligado (coleção depoimentos). */
    depoimento?: string | null;
    relacionados?: readonly string[];
    /**
     * Case anonimizado (sem `cliente`: só setor + porte). Nada pode ligar a
     * empresa a ele: logo e depoimento com caseSlug para este case derrubam o
     * build (contentIssues), e o valor tem de ser igual nos 3 idiomas.
     */
    anonimo?: boolean;
    /** Slug da URL neste idioma (en/es; S01-3). Sem ele, a URL usa o nome do arquivo. */
    slugUrl?: string | null;
  }>;
  logos: ReadonlyArray<{ id: string; empresa?: string; caseSlug?: string | null }>;
  depoimentos: ReadonlyArray<{ id: string; caseSlug?: string | null; sobreProcesso?: boolean }>;
  time: ReadonlyArray<{ id: string; atuaEmProjetos: boolean }>;
  posts: ReadonlyArray<{ id: string; rascunho: boolean; relacionados?: readonly string[] }>;
}

export interface FeatureSources {
  precos: Precos;
  qualificacao: Qualificacao;
  confirmacoes: Confirmacoes;
  perfis: Record<ProfileId, Perfil>;
  agenda: Agenda;
  empresa: Empresa;
  descoberta: Descoberta;
  sustentacao: Sustentacao;
  engenharia: Engenharia;
  content: ContentSnapshot;
  env: { whatsappNumber: string; ga4Id: string };
  /**
   * Camada fictícia ligada (só fora de produção). Único efeito aqui: o CNPJ
   * fictício (inválido de propósito) conta como dado da empresa, para a prévia
   * mostrar o bloco. No dado real ele nunca vale (validate.ts recusa).
   */
  modoFicticio?: boolean;
}

export const EMPTY_CONTENT: ContentSnapshot = { cases: [], logos: [], depoimentos: [], time: [], posts: [] };

/** "<locale>/<slug>" → partes. null se o caminho não segue cases/<pt|en|es>/<slug>. */
export function parseCaseId(id: string): { locale: Locale; slug: string } | null {
  const [locale, ...rest] = id.split("/");
  const slug = rest.join("/");
  if (!slug || !(LOCALES as readonly string[]).includes(locale ?? "")) return null;
  return { locale: locale as Locale, slug };
}

/** Slugs de case publicados nos 3 idiomas, com as tags da versão pt (ordem: slug). */
export function publishedCases(list: ContentSnapshot["cases"]): { slug: string; servicos: readonly ServiceKey[] }[] {
  const bySlug = new Map<string, Map<Locale, { publicado: boolean; servicos: readonly ServiceKey[] }>>();
  for (const entry of list) {
    const parsed = parseCaseId(entry.id);
    if (!parsed) continue;
    const versions = bySlug.get(parsed.slug) ?? new Map();
    versions.set(parsed.locale, { publicado: entry.publicado, servicos: entry.servicos });
    bySlug.set(parsed.slug, versions);
  }
  const result: { slug: string; servicos: readonly ServiceKey[] }[] = [];
  for (const [slug, versions] of bySlug) {
    const complete = LOCALES.every((locale) => versions.get(locale)?.publicado === true);
    if (complete) result.push({ slug, servicos: versions.get("pt")?.servicos ?? [] });
  }
  return result.sort((a, b) => a.slug.localeCompare(b.slug));
}

const sameSet = (a: readonly string[] = [], b: readonly string[] = []) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

/**
 * Problemas de CONSISTÊNCIA entre entradas (o schema valida cada entrada sozinha).
 * Vazio = ok. Qualquer item derruba o build (getFeatures): é dado contraditório,
 * não dado parcial. Publicar um idioma antes dos outros NÃO é problema (é parcial).
 */
export function contentIssues(content: ContentSnapshot): string[] {
  const issues: string[] = [];
  const depoimentoIds = new Set(content.depoimentos.map((item) => item.id));
  const versions = new Map<string, ContentSnapshot["cases"][number][]>();
  /** URL de cada case por idioma ("en/air-quality-widget" → id), para recusar duas páginas no mesmo endereço. */
  const urls = new Map<string, string>();

  for (const entry of content.cases) {
    const parsed = parseCaseId(entry.id);
    if (!parsed) {
      issues.push(`content/cases/${entry.id}: o arquivo precisa estar em cases/<pt|en|es>/<slug>.mdx`);
      continue;
    }
    if (!SLUG_PATTERN.test(parsed.slug)) {
      issues.push(`content/cases/${entry.id}: slug "${parsed.slug}" fora do padrão (minúsculas, números e hífen)`);
    }
    if (entry.slugUrl && parsed.locale === DEFAULT_LOCALE) {
      issues.push(`content/cases/${entry.id}: \`slugUrl\` só vale em en/es (em pt-BR, a URL é o nome do arquivo)`);
    }
    const url = `${parsed.locale}/${entry.slugUrl || parsed.slug}`;
    const taken = urls.get(url);
    if (taken) issues.push(`content/cases/${entry.id}: a URL do case (${url}) é a mesma de ${taken}; use outro \`slugUrl\``);
    else urls.set(url, entry.id);
    if (entry.depoimento && !depoimentoIds.has(entry.depoimento)) {
      issues.push(`content/cases/${entry.id}: depoimento "${entry.depoimento}" não existe em dados/dono.json › depoimentos`);
    }
    if (entry.relacionados?.includes(parsed.slug)) {
      issues.push(`content/cases/${entry.id}: um case não pode ser relacionado a si mesmo`);
    }
    versions.set(parsed.slug, [...(versions.get(parsed.slug) ?? []), entry]);
  }

  for (const [slug, list] of versions) {
    const [first, ...others] = list;
    if (!first) continue;
    for (const other of others) {
      if (!sameSet(first.servicos, other.servicos)) {
        issues.push(`content/cases/*/${slug}: \`servicos\` diferente entre ${first.id} e ${other.id} (tem de ser igual nos 3 idiomas)`);
      }
      if ((first.depoimento ?? null) !== (other.depoimento ?? null)) {
        issues.push(`content/cases/*/${slug}: \`depoimento\` diferente entre ${first.id} e ${other.id}`);
      }
      if (!sameSet(first.relacionados, other.relacionados)) {
        issues.push(`content/cases/*/${slug}: \`relacionados\` diferente entre ${first.id} e ${other.id}`);
      }
      if ((first.anonimo ?? false) !== (other.anonimo ?? false)) {
        issues.push(
          `content/cases/*/${slug}: \`cliente\` em ${first.anonimo ? other.id : first.id} e não em ${first.anonimo ? first.id : other.id} ` +
            "(o case é nominal ou anonimizado nos 3 idiomas, nunca os dois)",
        );
      }
    }
  }

  // Case anonimizado: logo e depoimento (que mostram a empresa e a pessoa) não
  // podem apontar para ele, nem por link nem por "Ler o case" (playbook 09 §10).
  const anonimos = new Set(
    content.cases.flatMap((entry) => {
      const parsed = parseCaseId(entry.id);
      return parsed && entry.anonimo ? [parsed.slug] : [];
    }),
  );
  const ligadoAAnonimo = (secao: "logos" | "depoimentos", id: string, caseSlug: string | null | undefined) => {
    if (caseSlug && anonimos.has(caseSlug)) {
      issues.push(
        `dados/dono.json › ${secao} (${id}): caseSlug "${caseSlug}" aponta para um case anonimizado (sem \`cliente\`) e identificaria o cliente. ` +
          "Tire o caseSlug ou publique o case com o nome autorizado",
      );
    }
  };
  for (const logo of content.logos) ligadoAAnonimo("logos", logo.id, logo.caseSlug);
  for (const item of content.depoimentos) ligadoAAnonimo("depoimentos", item.id, item.caseSlug);

  const companies = new Map<string, string>();
  for (const logo of content.logos) {
    const key = (logo.empresa ?? logo.id).trim().toLocaleLowerCase("pt-BR");
    const previous = companies.get(key);
    if (previous) issues.push(`dados/dono.json › logos (${logo.id}): empresa repetida (já existe em ${previous})`);
    else companies.set(key, logo.id);
  }

  for (const post of content.posts) {
    if (!SLUG_PATTERN.test(post.id)) {
      issues.push(`content/posts/${post.id}: slug fora do padrão (minúsculas, números e hífen)`);
    }
    if (post.relacionados?.includes(post.id)) {
      issues.push(`content/posts/${post.id}: um post não pode ser relacionado a si mesmo`);
    }
  }
  return issues;
}

function tiersComplete(list: readonly BudgetTier[]): boolean {
  return list.length === 4 && list.every((tier) => isFilledText(tier.rotulo));
}

/** Pura: mesmas entradas, mesmas flags. É o que os testes de gate exercitam. */
export function computeFeatures(src: FeatureSources): Features {
  const pricingLines = PRICE_LINE_IDS.filter((id) => {
    const line = getPriceLine(src.precos, id);
    return Boolean(line && isFilledText(line.faixa) && isFilledList(line.fatores, 1));
  });

  const profiles = Object.fromEntries(PROFILE_IDS.map((id) => [id, src.perfis[id].publicar === true])) as Record<
    ProfileId,
    boolean
  >;

  const engineeringFields = ENGINEERING_FIELDS.filter((field) => isFilledText(src.engenharia[field]));

  const cases = publishedCases(src.content.cases);
  const casesByService = Object.fromEntries(
    SERVICE_KEYS.map((key) => [key, cases.filter((item) => item.servicos.includes(key)).length]),
  ) as Record<ServiceKey, number>;

  const c = src.confirmacoes;
  const confirm: Record<ConfirmationId, boolean> = {
    escopoMudanca: c.escopoMudanca,
    codigoProprietario: c.codigoProprietario !== false,
    notaFiscal: c.notaFiscal,
    outrasCidades: c.outrasCidades,
    // D31: a variante "…ou de fora do Brasil?" só vale junto com outrasCidades (validate.ts).
    atendeExterior: c.atendeExterior && c.outrasCidades,
    nda: c.nda,
    sistemaTerceiros: c.sistemaTerceiros,
    semDescoberta: c.semDescoberta,
    duracaoDescoberta: c.duracaoDescoberta,
    planoDoCliente: c.planoDoCliente,
    migracaoDados: c.migracaoDados,
    ligacao: c.ligacao,
    valoresNoDiagnostico: c.valoresNoDiagnostico,
    timeDoCliente: c.timeDoCliente,
    scoreDRecebeDiagnostico: c.scoreDRecebeDiagnostico,
    devolutivaConteudo: isFilledText(c.devolutivaConteudo),
    formatoDiagnostico: Boolean(
      c.formatoDiagnostico && isFilledText(c.formatoDiagnostico.formato) && isFilledText(c.formatoDiagnostico.participantes),
    ),
    pagamento: isFilledText(c.pagamento),
  };

  const q = src.qualificacao;
  const hasBudgetTiers = q.moeda.trim() !== "" && tiersComplete(q.faixas) && q.corteMql !== null;
  const hasMonthlyTiers = hasBudgetTiers && tiersComplete(q.faixasMensais) && Boolean(q.corteMqlMensal);

  const d = src.descoberta;
  const s = src.sustentacao;
  const hasDiscoveryFormat = DISCOVERY_FIELDS.every(([field]) => isFilledText(d[field]));
  const companies = new Set(src.content.logos.map((logo) => (logo.empresa ?? logo.id).trim().toLocaleLowerCase("pt-BR")));
  const hasTestimonials = src.content.depoimentos.length >= THRESHOLDS.testimonials;

  return {
    hasPricing: pricingLines.length >= 1,
    pricingLines,
    hasBudgetTiers,
    hasMonthlyTiers,
    hasProfiles: Object.values(profiles).some(Boolean),
    profiles,
    hasAgenda: src.agenda.url.trim() !== "",
    hasCompanyData:
      src.empresa.razaoSocial.trim() !== "" &&
      (isValidCnpj(src.empresa.cnpj) || (src.modoFicticio === true && src.empresa.cnpj.trim() === CNPJ_FICTICIO)),
    hasAboutIntro: isFilledText(src.empresa.apresentacao),
    hasAboutStory: isFilledList(src.empresa.historia, 1),
    hasDiscoveryFormat,
    hasDiscoveryExclusions: isFilledList(d.naoInclui, 1),
    hasSupportFormat: SUPPORT_REQUIRED_FIELDS.every((field) => isFilledText(s[field])),
    hasEngineering: engineeringFields.length >= 1,
    engineeringFields,
    hasLogos: companies.size >= THRESHOLDS.logos,
    hasTestimonials,
    hasCases: cases.length >= THRESHOLDS.cases,
    caseCount: cases.length,
    hasCaseFilters: cases.length >= THRESHOLDS.caseFilters,
    hasMethodProof:
      cases.length >= THRESHOLDS.methodProofCases || src.content.depoimentos.some((item) => item.sobreProcesso === true),
    casesByService,
    hasTeam: src.content.time.filter((person) => person.atuaEmProjetos).length >= THRESHOLDS.team,
    hasPosts: src.content.posts.filter((post) => !post.rascunho).length >= THRESHOLDS.posts,
    confirm,
    hasWhatsapp: hasWhatsappNumber(src.env.whatsappNumber),
    hasGa4: src.env.ga4Id.trim() !== "",
  };
}

/** Configs que o site usa (dados/dono.json + camada fictícia quando ligada), sem conteúdo. */
export const CONFIG_SOURCES = {
  precos,
  qualificacao,
  confirmacoes,
  perfis,
  agenda,
  empresa,
  descoberta,
  sustentacao,
  engenharia,
} as const;

/** Configs como estão em dados/dono.json, SEM a camada fictícia (o que vai a produção). */
export const CONFIG_SOURCES_REAIS = {
  precos: precosReais,
  qualificacao: qualificacaoReal,
  confirmacoes: confirmacoesReais,
  perfis: perfisReais,
  agenda: agendaReal,
  empresa: empresaReal,
  descoberta: descobertaReal,
  sustentacao: sustentacaoReal,
  engenharia: engenhariaReal,
} as const;

export type CollectionName = "cases" | "logos" | "depoimentos" | "time" | "posts";

/**
 * A coleção tem entrada? Checagem no build (este módulo só roda no servidor),
 * espelhando os loaders de src/content/loaders.ts: time/depoimentos/logos pela
 * lista do dados/dono.json; cases/posts por MDX em src/content/ (e, com a camada
 * fictícia, em dados/ficticio/). Evita getCollection em coleção vazia (warning).
 */
export function collectionHasFiles(name: CollectionName, root: string = process.cwd()): boolean {
  if (name === "cases" || name === "posts") return temMdx(name, root);
  return listaDoDono(name, root).itens.length > 0;
}

/** dados/dono.json como o site o vê (camada fictícia por cima quando ligada). */
function documentoEfetivo(): Record<string, unknown> {
  const real = donoJson as unknown as Record<string, unknown>;
  return Object.fromEntries(SECOES_DONO.map((secao) => [secao, comCamadaFicticia(secao, real[secao])]));
}

/**
 * Falha o build se dados/dono.json estiver malformado (mensagens em pt-BR com o
 * caminho do campo) ou tiver dado fictício. Com a camada ligada, valida também
 * o resultado mesclado com dados/dono.ficticio.json.
 */
export function assertDadosDoDono(): void {
  assertDono(donoJson, { origem: ARQUIVO_DONO });
  if (MODO_FICTICIO) {
    assertDono(documentoEfetivo(), { origem: `${ARQUIVO_DONO} + ${ARQUIVO_FICTICIO} (camada fictícia)`, permitirFicticio: true });
  }
}

async function loadContent(): Promise<ContentSnapshot> {
  const [cases, logos, depoimentos, time, posts] = await Promise.all([
    collectionHasFiles("cases") ? getCollection("cases") : [],
    collectionHasFiles("logos") ? getCollection("logos") : [],
    collectionHasFiles("depoimentos") ? getCollection("depoimentos") : [],
    collectionHasFiles("time") ? getCollection("time") : [],
    collectionHasFiles("posts") ? getCollection("posts") : [],
  ]);
  return {
    cases: cases.map((entry) => ({
      id: entry.id,
      publicado: entry.data.publicado,
      servicos: entry.data.servicos,
      depoimento: entry.data.depoimento?.id ?? null,
      relacionados: entry.data.relacionados ?? [],
      anonimo: !entry.data.cliente,
      slugUrl: entry.data.slugUrl ?? null,
    })),
    logos: logos.map((entry) => ({ id: entry.id, empresa: entry.data.empresa, caseSlug: entry.data.caseSlug ?? null })),
    depoimentos: depoimentos.map((entry) => ({
      id: entry.id,
      caseSlug: entry.data.caseSlug ?? null,
      sobreProcesso: entry.data.sobreProcesso,
    })),
    time: time.map((entry) => ({ id: entry.id, atuaEmProjetos: entry.data.atuaEmProjetos })),
    posts: posts.map((entry) => ({ id: entry.id, rascunho: entry.data.rascunho, relacionados: entry.data.relacionados ?? [] })),
  };
}

/** Falha o build se o conteúdo for contraditório entre entradas. */
export function assertConsistentContent(content: ContentSnapshot): void {
  const issues = contentIssues(content);
  if (issues.length) {
    throw new Error(`[content] ${issues.length} problema(s):\n - ${issues.join("\n - ")}`);
  }
}

let pending: Promise<Features> | undefined;

/** Flags do build atual (memoizadas). Valida configs e conteúdo e lê as coleções. */
export function getFeatures(): Promise<Features> {
  pending ??= (async () => {
    assertDadosDoDono();
    const content = await loadContent();
    assertConsistentContent(content);
    return computeFeatures({
      ...CONFIG_SOURCES,
      content,
      env: { whatsappNumber: WHATSAPP_NUMBER, ga4Id: GA4_ID },
      modoFicticio: MODO_FICTICIO,
    });
  })();
  return pending;
}

/**
 * Chave do rótulo do CTA PRIMÁRIO do site (header, drawer, barra fixa, rodapé,
 * CtaDiagnosis, links de texto e Investimento). Com agenda online (hasAgenda),
 * o pós-envio oferece o horário na mesma sessão, então o rótulo vira "Agendar
 * diagnóstico gratuito" (BLUEPRINT §4 config/agenda.ts e §8.6; COPY.md
 * primary_schedule). "Continuar meu pedido" (rascunho do wizard, ResumeLabel)
 * continua tendo precedência sobre os dois.
 */
export function primaryCtaKey(features: Pick<Features, "hasAgenda">): "shared.cta.primary" | "shared.cta.primary_schedule" {
  return features.hasAgenda ? "shared.cta.primary_schedule" : "shared.cta.primary";
}

/**
 * Texto de link que EMBUTE o rótulo do CTA primário (ex.: home.problem.link_text
 * "Reconheceu o seu caso? Pedir diagnóstico gratuito"): com hasAgenda, troca o
 * rótulo embutido pelo de agendar. `primary` e `schedule` são os textos já
 * traduzidos de shared.cta.primary e shared.cta.primary_schedule.
 */
export function withPrimaryCtaLabel(
  text: string,
  labels: { primary: string; schedule: string },
  features: Pick<Features, "hasAgenda">,
): string {
  return features.hasAgenda ? text.replace(labels.primary, labels.schedule) : text;
}

/** A linha de preço está completa? */
export function hasPriceLine(features: Pick<Features, "pricingLines">, id: PriceLineId): boolean {
  return features.pricingLines.includes(id);
}

/** Linhas completas dentre as pedidas (na ordem pedida). Cada página filtra as suas (§5.4). */
export function pricingLinesFor(features: Pick<Features, "pricingLines">, ids: readonly PriceLineId[]): PriceLineId[] {
  return ids.filter((id) => features.pricingLines.includes(id));
}

/**
 * Cases relacionados de um serviço (§6.5 #7, pós-envio §7.8): só com as páginas
 * de case no ar (hasCases) e ≥ 1 case publicado com a tag.
 */
export function hasRelatedCases(features: Pick<Features, "hasCases" | "casesByService">, service: ServiceKey): boolean {
  return features.hasCases && features.casesByService[service] >= 1;
}
