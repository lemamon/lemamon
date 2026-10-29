/**
 * Fixtures de DADO DO DONO (dono: gated) — exemplos completos de cada config e
 * coleção when_data, para provar que cada flag liga com dado completo e desliga
 * com vazio/parcial.
 *
 * NUNCA VÃO AO AR: ficam fora de src/content, src/config e dados/ e só entram nos testes
 * (computeFeatures, schemas, Container API). Todo texto leva a marca
 * FIXTURE_MARK, procurada em src/ e dist/ pelo tests/unit/gates-no-fixtures.test.ts.
 * Nenhum dado aqui é real: empresas, pessoas e números são fictícios.
 */
import type { Agenda } from "@/config/agenda";
import type { Confirmacoes } from "@/config/confirmacoes";
import type { Descoberta } from "@/config/descoberta";
import type { Empresa } from "@/config/empresa";
import type { Engenharia } from "@/config/engenharia";
import type { ContentSnapshot, FeatureSources } from "@/config/features";
import type { Perfil, ProfileId } from "@/config/perfis";
import type { PriceLine, Precos } from "@/config/precos";
import type { BudgetTier, Qualificacao } from "@/config/qualificacao";
import type { ServiceKey } from "@/config/routes";
import type { Sustentacao } from "@/config/sustentacao";
import type { Localized } from "@/config/types";

import { baseSources } from "./features";

/** Marca de fixture: não pode aparecer em src/ nem em dist/. */
export const FIXTURE_MARK = "FIXTURE-LEMAMON";

/** Mesmo texto nos 3 idiomas, com a marca. */
export const fx = (value: string): Localized => ({
  pt: `${FIXTURE_MARK} ${value} (pt)`,
  en: `${FIXTURE_MARK} ${value} (en)`,
  es: `${FIXTURE_MARK} ${value} (es)`,
});

/** Lista nos 3 idiomas. */
export const fxList = (...values: string[]): Localized<string[]> => ({
  pt: values.map((value) => `${FIXTURE_MARK} ${value} (pt)`),
  en: values.map((value) => `${FIXTURE_MARK} ${value} (en)`),
  es: values.map((value) => `${FIXTURE_MARK} ${value} (es)`),
});

/** Remove um idioma (dado parcial). */
export function withoutLocale<T>(value: Localized<T>, locale: "pt" | "en" | "es", empty: T): Localized<T> {
  return { ...value, [locale]: empty };
}

// --- precos.ts (valores fictícios; dinheiro só é aceito aqui e em qualificacao) ---
const line = (faixa: string, unidade: PriceLine["unidade"]): PriceLine => ({
  faixa: { pt: `R$ ${faixa} mil`, en: `BRL ${faixa}k`, es: `BRL ${faixa} mil` },
  unidade,
  fatores: fxList("fator de escopo", "fator de integração"),
});

export function completePrecos(): Precos {
  return {
    desenvolvimento: {
      sistemas: line("10 a 20", "projeto"),
      aplicativos: line("15 a 30", "projeto"),
      integracoes: line("5 a 10", "projeto"),
      mvp: line("12 a 25", "projeto"),
    },
    sustentacao: line("1 a 3", "mes"),
  };
}

// --- qualificacao.ts ---
const tier = (id: BudgetTier["id"], label: string): BudgetTier => ({
  id,
  rotulo: { pt: `${FIXTURE_MARK} ${label}`, en: `${FIXTURE_MARK} ${label}`, es: `${FIXTURE_MARK} ${label}` },
});
const tiers = (prefix: string): BudgetTier[] => [
  tier("tier_1", `${prefix} faixa 1`),
  tier("tier_2", `${prefix} faixa 2`),
  tier("tier_3", `${prefix} faixa 3`),
  tier("tier_4", `${prefix} faixa 4`),
];

export function completeQualificacao(): Qualificacao {
  return {
    moeda: "BRL",
    faixas: tiers("projeto"),
    faixasMensais: tiers("mensal"),
    corteMql: "tier_2",
    corteMqlMensal: "tier_2",
    scoreD: { ativo: false },
  };
}

// --- confirmacoes.ts ---
export function completeConfirmacoes(): Confirmacoes {
  return {
    escopoMudanca: true,
    codigoProprietario: "answer_draft",
    notaFiscal: true,
    outrasCidades: true,
    atendeExterior: true,
    nda: true,
    sistemaTerceiros: true,
    semDescoberta: true,
    duracaoDescoberta: true,
    planoDoCliente: true,
    migracaoDados: true,
    ligacao: true,
    valoresNoDiagnostico: true,
    timeDoCliente: true,
    scoreDRecebeDiagnostico: true,
    devolutivaConteudo: fx("conteúdo da devolutiva"),
    formatoDiagnostico: { formato: fx("chamada de vídeo"), participantes: fx("quem conduz") },
    pagamento: fx("condições de pagamento"),
  };
}

// --- perfis.ts / agenda.ts ---
export function completePerfis(): Record<ProfileId, Perfil> {
  return {
    github: { url: "https://github.com/lemamon-dev", publicar: true },
    linkedin: { url: "https://www.linkedin.com/in/lemamon-dev", publicar: true },
    medium: { url: "https://medium.com/@lemamon.dev", publicar: true },
  };
}

export function completeAgenda(): Agenda {
  return { url: "https://cal.example.com/fixture-lemamon" };
}

// --- empresa.ts (CNPJ de exemplo com dígitos válidos, não é de empresa real da Lemamon) ---
export const FIXTURE_CNPJ = "11.444.777/0001-61";

export function completeEmpresa(): Empresa {
  return {
    email: "lemamon.dev@gmail.com",
    razaoSocial: `${FIXTURE_MARK} Razão Social Ltda`,
    cnpj: FIXTURE_CNPJ,
    anoFundacao: 2020,
    responsavel: `${FIXTURE_MARK} Pessoa Responsável`,
    apresentacao: fx("A gente desenvolve software sob medida em São Paulo, SP"),
    historia: fxList("primeiro parágrafo da história", "segundo parágrafo"),
  };
}

// --- descoberta.ts / sustentacao.ts / engenharia.ts ---
export function completeDescoberta(): Descoberta {
  return {
    formato: fx("encontros remotos"),
    participantes: fx("quem decide e quem usa"),
    ritmo: fx("dois encontros por semana"),
    // D44 (21/10/2026): a duração da Descoberta não é publicada; o campo é sempre null.
    duracao: null,
    naoInclui: fxList("o desenvolvimento do sistema", "a hospedagem"),
  };
}

export function completeSustentacao(): Sustentacao {
  return {
    inclui: fx("correções e melhorias"),
    contratacao: fx("contrato mensal"),
    canais: fx("WhatsApp e e-mail"),
    urgencias: fx("erros urgentes primeiro"),
  };
}

export function completeEngenharia(): Engenharia {
  return {
    tests: fx("testes automatizados"),
    ci_cd: fx("deploy automático"),
    code_review: fx("revisão em todo pull request"),
    repository: fx("repositório do cliente"),
    documentation: fx("documentação viva"),
    handover: fx("passagem de conhecimento"),
    people: fx("quem trabalha no projeto"),
    security: fx("acesso mínimo aos dados"),
  };
}

// --- coleções (resumo que computeFeatures lê) ---
export const FIXTURE_CASE_SLUGS = ["fixture-lemamon-fretes", "fixture-lemamon-estoque"] as const;

/** Um case nos 3 idiomas. */
export function caseVersions(
  slug: string,
  servicos: readonly ServiceKey[] = ["web_systems"],
  options: { publicado?: boolean; locales?: readonly ("pt" | "en" | "es")[]; depoimento?: string | null; anonimo?: boolean } = {},
): ContentSnapshot["cases"][number][] {
  const { publicado = true, locales = ["pt", "en", "es"], depoimento = null, anonimo = false } = options;
  return locales.map((locale) => ({ id: `${locale}/${slug}`, publicado, servicos, depoimento, relacionados: [], anonimo }));
}

export function completeContent(): ContentSnapshot {
  return {
    cases: [...caseVersions(FIXTURE_CASE_SLUGS[0], ["web_systems", "mobile_apps"], { depoimento: "fixture-lemamon-depoimento" }), ...caseVersions(FIXTURE_CASE_SLUGS[1], ["integrations"])],
    logos: ["alfa", "beta", "gama", "delta"].map((name) => ({ id: `fixture-lemamon-${name}`, empresa: `${FIXTURE_MARK} ${name}`, caseSlug: null })),
    depoimentos: [{ id: "fixture-lemamon-depoimento", caseSlug: FIXTURE_CASE_SLUGS[0], sobreProcesso: true }],
    time: [{ id: "fixture-lemamon-pessoa", atuaEmProjetos: true }],
    posts: ["um", "dois", "tres"].map((name) => ({ id: `fixture-lemamon-post-${name}`, rascunho: false, relacionados: [] })),
  };
}

/** Todos os configs e coleções completos + ambiente com WhatsApp e GA4. */
export function completeSources(overrides: Partial<FeatureSources> = {}): FeatureSources {
  return baseSources({
    precos: completePrecos(),
    qualificacao: completeQualificacao(),
    confirmacoes: completeConfirmacoes(),
    perfis: completePerfis(),
    agenda: completeAgenda(),
    empresa: completeEmpresa(),
    descoberta: completeDescoberta(),
    sustentacao: completeSustentacao(),
    engenharia: completeEngenharia(),
    content: completeContent(),
    env: { whatsappNumber: "5548999999999", ga4Id: "G-FIXTURE00" },
    ...overrides,
  });
}
