/**
 * Validação dos DADOS DO DONO no build (dono: gated). Só roda no servidor (usa
 * zod): NUNCA importe este arquivo numa ilha.
 *
 * Fonte: dados/dono.json (e, com a camada fictícia ligada fora de produção, o
 * resultado mesclado com dados/dono.ficticio.json). O editor autocompleta pelo
 * dados/dono.schema.json; quem DECIDE é este arquivo.
 *
 * Duas camadas:
 *  1. Estrutura e formato (este arquivo): tipo errado, campo desconhecido, CNPJ
 *     inválido, URL sem https, 5 faixas no wizard, texto com {placeholder},
 *     valor em dinheiro fora de precos/qualificacao, imagem que não existe,
 *     dado fictício no dono.json (nome "Exemplo", example.com, CNPJ de exemplo
 *     ou QUALQUER texto marcado como exemplo: "(exemplo)", "Exemplo: …",
 *     "Condições de exemplo", "fictício"...) → o build FALHA com a lista de
 *     problemas, em pt-BR e com o CAMINHO do campo a corrigir:
 *       dados/dono.json › empresa.cnpj: CNPJ inválido (dígitos verificadores)
 *  2. Preenchimento (features.ts): texto vazio ou faltando num idioma → o item
 *     é "parcial" e simplesmente não renderiza (BLUEPRINT §4).
 *
 * Por isso aqui texto VAZIO é aceito nas seções de config (é a camada 2 que
 * decide), mas texto preenchido precisa estar limpo. Pessoas, depoimentos e
 * logos são entradas completas ou erro (mesmos schemas de src/content/schemas.ts).
 */

import { existsSync } from "node:fs";
import { join, resolve, sep } from "node:path";

import { z } from "astro/zod";

import {
  arquivoDeMidia,
  type FabricaDeArquivo,
  hasDraftMark,
  logoSchema,
  mensagemDeExemplo,
  MONEY_PATTERN,
  SLUG_PATTERN,
  teamSchema,
  testimonialSchema,
  textoDeExemplo,
} from "../content/schemas";
import type { Agenda } from "./agenda";
import { CNPJ_FICTICIO, pareceFicticio } from "./camada-ficticia";
import type { Confirmacoes } from "./confirmacoes";
import type { Descoberta } from "./descoberta";
import { ARQUIVO_DONO, SECOES_DONO, type SecaoColecao } from "./dono";
import { isValidCnpj, type Empresa } from "./empresa";
import type { Engenharia } from "./engenharia";
import { PROFILE_HOSTS, type Perfil, type ProfileId } from "./perfis";
import { PRICE_LINE_IDS, PRICE_LINE_UNIT, getPriceLine, type Precos } from "./precos";
import type { Privacidade } from "./privacidade";
import type { Qualificacao } from "./qualificacao";
import type { Sustentacao } from "./sustentacao";

export { isValidCnpj } from "./empresa";

// --- mensagens em pt-BR ---------------------------------------------------------

const NOME_DO_TIPO: Record<string, string> = {
  string: "texto entre aspas",
  number: "número",
  int: "número inteiro",
  boolean: "true ou false",
  object: "objeto { … }",
  array: "lista [ … ]",
  null: "null",
  date: "data AAAA-MM-DD",
  literal: "valor fixo",
};

function tipoDoValor(valor: unknown): string {
  if (valor === null) return "null";
  if (Array.isArray(valor)) return "lista [ … ]";
  if (typeof valor === "object") return "objeto { … }";
  if (typeof valor === "string") return `texto "${valor.length > 40 ? `${valor.slice(0, 40)}…` : valor}"`;
  return NOME_DO_TIPO[typeof valor] ?? typeof valor;
}

interface IssueCrua {
  code?: string;
  input?: unknown;
  expected?: string;
  keys?: string[];
  values?: unknown[];
  origin?: string;
  maximum?: number | bigint;
  minimum?: number | bigint;
  format?: string;
}

/**
 * Mapa de erros do Zod em pt-BR, escrito para quem edita o dados/dono.json.
 * Mensagens dos próprios schemas (refine) têm prioridade e já estão em pt-BR.
 */
export function erroPtBr(issue: IssueCrua): string {
  switch (issue.code) {
    case "invalid_type": {
      const esperado = NOME_DO_TIPO[issue.expected ?? ""] ?? issue.expected ?? "outro tipo";
      if (issue.input === undefined) return `campo obrigatório faltando (esperava ${esperado})`;
      return `tipo errado: esperava ${esperado}, veio ${tipoDoValor(issue.input)}`;
    }
    case "unrecognized_keys":
      return `campo desconhecido ${(issue.keys ?? []).map((key) => `"${key}"`).join(", ")}: confira a grafia (os campos válidos estão no dados/dono.schema.json)`;
    case "invalid_value": {
      const valores = (issue.values ?? []).map((value) => JSON.stringify(value));
      return valores.length === 1 ? `valor inválido: tem que ser ${valores[0]}` : `valor inválido: use um destes: ${valores.join(", ")}`;
    }
    case "too_big":
      if (issue.origin === "string") return `no máximo ${issue.maximum} caracteres`;
      if (issue.origin === "array") return `no máximo ${issue.maximum} itens`;
      return `no máximo ${issue.maximum}`;
    case "too_small":
      if (issue.origin === "string") return Number(issue.minimum) <= 1 ? "obrigatório (texto vazio)" : `no mínimo ${issue.minimum} caracteres`;
      if (issue.origin === "array") return `pelo menos ${issue.minimum} item(ns)`;
      return `no mínimo ${issue.minimum}`;
    case "invalid_format":
      if (issue.format === "email") return "e-mail inválido (ex.: nome@dominio.com.br)";
      return "formato inválido";
    case "invalid_union":
      return "valor fora das formas aceitas (veja a descrição do campo no dados/dono.schema.json)";
    default:
      return "valor inválido";
  }
}

/** Caminho legível do campo: time[0].papel.pt */
export function caminhoDoCampo(path: readonly PropertyKey[]): string {
  return path.reduce<string>((acc, key) => (typeof key === "number" ? `${acc}[${key}]` : acc ? `${acc}.${String(key)}` : String(key)), "");
}

function problemas(origem: string, prefixo: string, schema: z.ZodType, valor: unknown): string[] {
  const result = schema.safeParse(valor, { error: (issue) => erroPtBr(issue as unknown as IssueCrua) });
  if (result.success) return [];
  return result.error.issues.map((issue) => {
    const campo = caminhoDoCampo([...(prefixo ? [prefixo] : []), ...issue.path]);
    return `${origem} › ${campo || "(raiz)"}: ${issue.message}`;
  });
}

// --- blocos de texto --------------------------------------------------------------

/** Texto de config: pode estar vazio (= parcial), mas não pode ter marca de rascunho. */
function configText(max: number, options: { money?: boolean } = {}) {
  return z
    .string()
    .max(max, `no máximo ${max} caracteres`)
    .refine((value) => !hasDraftMark(value), "texto com marca de rascunho ({…}, [CONFIRMAR], TODO, lorem ipsum)")
    .refine(
      (value) => options.money === true || !MONEY_PATTERN.test(value),
      "valor monetário só em dados/dono.json › precos ou › qualificacao (BLUEPRINT §4)",
    );
}

function localized(max: number, options: { money?: boolean } = {}) {
  const field = configText(max, options);
  return z.strictObject({ pt: field, en: field, es: field });
}

function localizedList(maxItems: number, maxText: number, options: { money?: boolean } = {}) {
  const list = z.array(configText(maxText, options)).max(maxItems, `no máximo ${maxItems} itens`);
  return z.strictObject({ pt: list, en: list, es: list });
}

const isHttps = (value: string) => /^https:\/\/[^\s]+$/.test(value) && URL.canParse(value);

function hostUrl(host: string) {
  return z.string().refine((value) => {
    if (!isHttps(value)) return false;
    const hostname = new URL(value).hostname.replace(/^www\./, "");
    return hostname === host || hostname.endsWith(`.${host}`);
  }, `URL https de ${host}`);
}

// --- precos (único lugar com dinheiro, junto com qualificacao) -------------------
const priceLine = z
  .strictObject({
    faixa: localized(80, { money: true }),
    unidade: z.enum(["projeto", "mes"]),
    fatores: localizedList(3, 120, { money: true }),
  })
  .nullable();

// A Sprint de Descoberta é gratuita (D44, 21/10/2026): não existe linha
// `descoberta` em precos (campo desconhecido derruba o build).
const precosSchema = z
  .strictObject({
    desenvolvimento: z.strictObject({
      sistemas: priceLine,
      aplicativos: priceLine,
      integracoes: priceLine,
      mvp: priceLine,
    }),
    sustentacao: priceLine,
  })
  .superRefine((value, ctx) => {
    for (const id of PRICE_LINE_IDS) {
      const line = getPriceLine(value as Precos, id);
      if (line && line.unidade !== PRICE_LINE_UNIT[id]) {
        ctx.addIssue({
          code: "custom",
          path: [...id.split("."), "unidade"],
          message: `unidade de "${id}" é "${PRICE_LINE_UNIT[id]}"`,
        });
      }
    }
  });

// --- qualificacao -------------------------------------------------------------------
const TIER_IDS = ["tier_1", "tier_2", "tier_3", "tier_4"] as const;
const tiers = z
  .array(z.strictObject({ id: z.enum(TIER_IDS), rotulo: localized(60, { money: true }) }))
  .refine(
    (list) => list.length === 0 || (list.length === 4 && list.every((tier, index) => tier.id === TIER_IDS[index])),
    "exatamente 4 faixas (tier_1…tier_4, em ordem) ou nenhuma",
  );

const qualificacaoSchema = z
  .strictObject({
    moeda: z.string().refine((value) => value === "" || /^[A-Z]{3}$/.test(value), "código de moeda ISO (ex.: BRL)"),
    faixas: tiers,
    faixasMensais: tiers,
    corteMql: z.enum(TIER_IDS).nullable(),
    corteMqlMensal: z.enum(TIER_IDS).nullable().optional(),
    scoreD: z.strictObject({ ativo: z.boolean() }),
  })
  .refine((value) => value.corteMql === null || value.faixas.some((tier) => tier.id === value.corteMql), {
    message: "corteMql precisa ser uma das faixas",
    path: ["corteMql"],
  })
  .refine(
    (value) => !value.corteMqlMensal || value.faixasMensais.some((tier) => tier.id === value.corteMqlMensal),
    { message: "corteMqlMensal precisa ser uma das faixas mensais", path: ["corteMqlMensal"] },
  )
  .refine((value) => value.faixasMensais.length === 0 || value.faixas.length === 4, {
    message: "faixas mensais só existem junto com as 4 faixas principais",
    path: ["faixasMensais"],
  })
  .refine((value) => value.faixas.length === 0 || value.moeda.trim() !== "", { message: "faixas exigem a moeda", path: ["moeda"] });

// --- confirmacoes ---------------------------------------------------------------------
const confirmacoesSchema = z.strictObject({
  escopoMudanca: z.boolean(),
  codigoProprietario: z.union([z.literal(false), z.literal("answer_draft"), z.literal("answer_draft_alt")], {
    error: 'use false, "answer_draft" ou "answer_draft_alt"',
  }),
  notaFiscal: z.boolean(),
  outrasCidades: z.boolean(),
  atendeExterior: z.boolean(),
  nda: z.boolean(),
  sistemaTerceiros: z.boolean(),
  semDescoberta: z.boolean(),
  duracaoDescoberta: z.boolean(),
  planoDoCliente: z.boolean(),
  migracaoDados: z.boolean(),
  ligacao: z.boolean(),
  valoresNoDiagnostico: z.boolean(),
  timeDoCliente: z.boolean(),
  scoreDRecebeDiagnostico: z.boolean(),
  devolutivaConteudo: localized(240).nullable(),
  formatoDiagnostico: z.strictObject({ formato: localized(120), participantes: localized(120) }).nullable(),
  pagamento: localized(240).nullable(),
});

// --- perfis / agenda ------------------------------------------------------------------
const perfil = (id: ProfileId) => z.strictObject({ url: hostUrl(PROFILE_HOSTS[id]), publicar: z.boolean() });
const perfisSchema = z.strictObject({ github: perfil("github"), linkedin: perfil("linkedin"), medium: perfil("medium") });

const agendaSchema = z.strictObject({
  url: z.string().refine((value) => value === "" || isHttps(value), 'deixe "" ou use uma URL https válida da sua agenda'),
});

// --- empresa ------------------------------------------------------------------------
function empresaSchema(permitirFicticio: boolean) {
  return z.strictObject({
    email: z.email(),
    razaoSocial: configText(160),
    cnpj: z.string().superRefine((value, ctx) => {
      if (value.trim() === "" || isValidCnpj(value)) return;
      if (value.trim() === CNPJ_FICTICIO) {
        if (permitirFicticio) return;
        ctx.addIssue({ code: "custom", message: `${CNPJ_FICTICIO} é o CNPJ da camada fictícia: no dados/dono.json só vale o CNPJ real` });
        return;
      }
      ctx.addIssue({ code: "custom", message: "CNPJ inválido (dígitos verificadores): confira no cartão CNPJ" });
    }),
    anoFundacao: z
      .number()
      .int()
      .min(1900)
      .refine((year) => year <= new Date().getFullYear(), "ano de fundação no futuro")
      .nullable(),
    responsavel: configText(120),
    apresentacao: localized(160).nullable().optional(),
    historia: localizedList(4, 600).nullable().optional(),
  });
}

// --- descoberta / sustentacao / engenharia --------------------------------------------
const descobertaSchema = z.strictObject({
  formato: localized(300).nullable(),
  participantes: localized(300).nullable(),
  ritmo: localized(300).nullable(),
  /** D44 (21/10/2026, revoga a D42): a duração da Descoberta não é publicada. */
  duracao: z.null({
    error: "a duração da Sprint de Descoberta não é publicada (decisão do dono de 21/10/2026, D44): ela é definida com o cliente no diagnóstico. Deixe null",
  }),
  /** "O que a Descoberta não inclui": até 5 itens de até 120 caracteres por idioma (vazio = parcial, não aparece). */
  naoInclui: localizedList(5, 120).nullable().optional(),
});

const sustentacaoSchema = z.strictObject({
  inclui: localized(300).nullable(),
  contratacao: localized(300).nullable(),
  canais: localized(300).nullable(),
  urgencias: localized(300).nullable(),
});

const engenhariaSchema = z.strictObject({
  tests: localized(300).nullable(),
  ci_cd: localized(300).nullable(),
  code_review: localized(300).nullable(),
  repository: localized(300).nullable(),
  documentation: localized(300).nullable(),
  handover: localized(300).nullable(),
  people: localized(300).nullable(),
  security: localized(300).nullable(),
});

// --- privacidade (decisões da Política; a trava de lançamento está em privacidade.ts) ---
const ferramenta = z.strictObject({ fornecedor: configText(80), prazo: localized(80).nullable() }).nullable();

/**
 * Pixel de anúncio opcional (B346 LinkedIn Insight Tag, B347 Meta Pixel; decisão
 * D12 do playbook 15). null ou ausente = desligado (o padrão). O ID é só
 * dígitos (partner ID do LinkedIn, pixel ID da Meta). Aqui só a FORMA; o que
 * libera a produção (baseAnuncios = "consentimento", ID real, prazo nos 3
 * idiomas, os itens da Política no i18n) está em privacyLaunchBlockers() e no
 * PrivacyView: o pixel só carrega em produção e depois do "Aceitar".
 */
const PIXEL_ID = /^\d{4,20}$/;
const pixel = z
  .strictObject({
    id: z.string().refine((value) => PIXEL_ID.test(value), "só dígitos, 4 a 20 (o partner ID do LinkedIn ou o pixel ID da Meta, sem espaço nem letra)"),
    prazo: localized(80).nullable(),
  })
  .nullable();

const privacidadeSchema = z.strictObject({
  baseAnuncios: z.enum(["legitimo_interesse", "consentimento"]).nullable(),
  encarregado: z
    .union([z.literal("pequeno_porte"), z.strictObject({ nome: configText(120), email: z.email() })], {
      error: 'use "pequeno_porte" ou { "nome": "…", "email": "…" } com um e-mail válido',
    })
    .nullable(),
  mecanismoTransferencia: localized(200).nullable(),
  prazos: z.strictObject({
    retencaoPedidos: localized(80).nullable(),
    ga4: localized(80).nullable(),
    googleAds: localized(80).nullable(),
    conversoesGoogleAds: localized(80).nullable(),
    newRelic: localized(80).nullable(),
    logsHospedagem: localized(80).nullable(),
  }),
  atualizadaEm: z
    .string()
    .refine((value) => value === "" || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))), 'data "AAAA-MM-DD" ou ""'),
  remarketing: z.boolean(),
  provedorEmail: z.enum(["gmail", "google_workspace", "microsoft_365"]),
  classificacaoDefineAtendimento: z.boolean(),
  naoVendemosConfirmado: z.boolean(),
  ferramentas: z.strictObject({
    agenda: ferramenta,
    crm: ferramenta,
    emailAcompanhamento: ferramenta,
    automacao: ferramenta,
    chatEquipe: ferramenta,
  }),
  pixels: z.strictObject({ linkedin: pixel.optional(), meta: pixel.optional() }).optional(),
});

// --- time / depoimentos / logos (entradas das coleções) -------------------------------

export interface OpcoesDono {
  /** Rótulo do arquivo nas mensagens ("dados/dono.json"). */
  origem?: string;
  /** Raiz do projeto (as imagens são relativas a <raiz>/dados/). */
  raiz?: string;
  /** Aceita o que só existe na camada fictícia (CNPJ fictício, imagens de dados/ficticio/). */
  permitirFicticio?: boolean;
}

/** Imagem do dono: caminho relativo à pasta dados/ (ex.: "imagens/ana.jpg"), arquivo existente. */
function imagemDoDono(raiz: string, permitirFicticio: boolean) {
  return () =>
    z.string().superRefine((value, ctx) => {
      const issue = (message: string) => ctx.addIssue({ code: "custom", message });
      if (!value.trim()) return issue("caminho da imagem vazio");
      if (/^[a-z]+:/i.test(value) || value.startsWith("/") || value.split(/[\\/]/).includes("..")) {
        return issue('caminho relativo à pasta dados/ (ex.: "imagens/ana-souza.jpg"), sem URL, sem "/" no início e sem ".."');
      }
      if (!/\.(png|jpe?g|webp|avif|svg)$/i.test(value)) return issue("formato de imagem: png, jpg, webp, avif ou svg");
      if (!permitirFicticio && value.startsWith("ficticio/")) {
        return issue("imagem da camada fictícia no dados/dono.json: use uma imagem real em dados/imagens/");
      }
      if (!existsSync(join(raiz, "dados", value))) return issue(`arquivo não encontrado: dados/${value}`);
    });
}

/**
 * Arquivo de mídia do dono (vídeo e legenda do depoimento em vídeo): o formato
 * de src/content/schemas.ts (relativo a dados/, extensão certa) + o arquivo
 * existe + nada da camada fictícia no dado real.
 */
function arquivoDoDono(raiz: string, permitirFicticio: boolean): FabricaDeArquivo {
  return (extensoes) =>
    arquivoDeMidia(extensoes).superRefine((value, ctx) => {
      if (!value.trim() || /^[a-z]+:/i.test(value) || value.startsWith("/") || value.split(/[\\/]/).includes("..")) return;
      // Pelo caminho resolvido ("./ficticio/…", "ficticio//…" também contam).
      const camada = resolve(raiz, "dados", "ficticio");
      const alvo = resolve(raiz, "dados", value);
      if (!permitirFicticio && (alvo === camada || alvo.startsWith(camada + sep))) {
        ctx.addIssue({ code: "custom", message: "arquivo da camada fictícia no dados/dono.json: use o arquivo real (ex.: dados/videos/)" });
        return;
      }
      if (!existsSync(join(raiz, "dados", value))) ctx.addIssue({ code: "custom", message: `arquivo não encontrado: dados/${value}` });
    });
}

function schemaDoItem(secao: SecaoColecao, raiz: string, permitirFicticio: boolean): z.ZodType {
  const imagem = imagemDoDono(raiz, permitirFicticio);
  if (secao === "time") return teamSchema(imagem);
  if (secao === "depoimentos") return testimonialSchema(imagem, arquivoDoDono(raiz, permitirFicticio));
  return logoSchema(imagem);
}

/** Problemas de uma lista do dono (time, depoimentos ou logos): id + schema do item. */
export function colecaoIssues(secao: SecaoColecao, itens: unknown, opcoes: OpcoesDono = {}): string[] {
  const origem = opcoes.origem ?? ARQUIVO_DONO;
  const raiz = opcoes.raiz ?? process.cwd();
  if (!Array.isArray(itens)) return [`${origem} › ${secao}: tipo errado: esperava lista [ … ], veio ${tipoDoValor(itens)}`];
  const issues: string[] = [];
  const schema = schemaDoItem(secao, raiz, opcoes.permitirFicticio ?? false);
  const ids = new Set<string>();
  itens.forEach((item: unknown, index) => {
    const campo = `${secao}[${index}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      issues.push(`${origem} › ${campo}: tipo errado: esperava objeto { … }, veio ${tipoDoValor(item)}`);
      return;
    }
    const { id, ...data } = item as Record<string, unknown>;
    if (typeof id !== "string" || !SLUG_PATTERN.test(id)) {
      issues.push(`${origem} › ${campo}.id: obrigatório, em minúsculas, números e hífen (ex.: "ana-souza")`);
    } else if (ids.has(id)) {
      issues.push(`${origem} › ${campo}.id: "${id}" repetido em ${secao}`);
    } else {
      ids.add(id);
    }
    issues.push(...problemas(origem, campo, schema, data));
  });
  return issues;
}

// --- documento inteiro ----------------------------------------------------------------

export interface ConfigSources {
  precos: Precos;
  qualificacao: Qualificacao;
  confirmacoes: Confirmacoes;
  perfis: Record<ProfileId, Perfil>;
  agenda: Agenda;
  empresa: Empresa;
  descoberta: Descoberta;
  sustentacao: Sustentacao;
  engenharia: Engenharia;
}

/** Problemas de estrutura/formato das seções de config. Vazia = válidas. */
export function configIssues(sources: ConfigSources & { privacidade?: Privacidade }, opcoes: OpcoesDono = {}): string[] {
  const origem = opcoes.origem ?? ARQUIVO_DONO;
  const issues = [
    ...problemas(origem, "precos", precosSchema, sources.precos),
    ...problemas(origem, "qualificacao", qualificacaoSchema, sources.qualificacao),
    ...problemas(origem, "confirmacoes", confirmacoesSchema, sources.confirmacoes),
    ...problemas(origem, "perfis", perfisSchema, sources.perfis),
    ...problemas(origem, "agenda", agendaSchema, sources.agenda),
    ...problemas(origem, "empresa", empresaSchema(opcoes.permitirFicticio ?? false), sources.empresa),
    ...problemas(origem, "descoberta", descobertaSchema, sources.descoberta),
    ...problemas(origem, "sustentacao", sustentacaoSchema, sources.sustentacao),
    ...problemas(origem, "engenharia", engenhariaSchema, sources.engenharia),
    ...(sources.privacidade ? problemas(origem, "privacidade", privacidadeSchema, sources.privacidade) : []),
  ];

  // Trava de build do score D (i18n shared _notes.cta_final).
  if (sources.qualificacao?.scoreD?.ativo && !sources.confirmacoes?.scoreDRecebeDiagnostico) {
    issues.push(
      `${origem} › qualificacao.scoreD.ativo: exige confirmacoes.scoreDRecebeDiagnostico = true (o pedido fora de perfil também recebe os 45 minutos e a devolutiva)`,
    );
  }

  // D31: a variante "…ou de fora do Brasil?" do FAQ other_cities afirma também
  // as outras cidades do Brasil (i18n faq._notes.other_cities).
  if (sources.confirmacoes?.atendeExterior && !sources.confirmacoes?.outrasCidades) {
    issues.push(
      `${origem} › confirmacoes.atendeExterior: exige confirmacoes.outrasCidades = true (quem atende empresas de outros países também atende as de outras cidades do Brasil, e a resposta do FAQ diz as duas coisas)`,
    );
  }
  return issues;
}

/** Campos de identidade: valor com cara de fictício aqui é dado fictício no lugar errado. */
const IDENTIDADE = new Set([
  "nome",
  "empresa",
  "razaoSocial",
  "responsavel",
  "email",
  "url",
  "linkedin",
  "github",
  "link",
  "fornecedor",
  "cnpj",
  "autorizadoPor",
]);

/**
 * Dado fictício dentro do dados/dono.json (o lugar dele é a camada fictícia):
 *  - campo de identidade (nome, empresa, e-mail, URL, CNPJ...) com "Exemplo",
 *    example.com ou o CNPJ de exemplo;
 *  - QUALQUER texto com cara de exemplo: "(exemplo)", "Exemplo: …",
 *    "Texto de exemplo: …", "Condições de exemplo: …", "fictício"...
 *    (textoDeExemplo, src/content/schemas.ts). É o que acontece quando alguém
 *    copia um trecho do arquivo fictício para o real.
 * A cópia literal de qualquer valor distintivo do arquivo fictício também
 * derruba o build, antes de tudo (src/integrations/dados-ficticios.ts).
 */
export function marcasFicticiasNoReal(doc: unknown, origem: string = ARQUIVO_DONO): string[] {
  const issues: string[] = [];
  const walk = (no: unknown, path: PropertyKey[]) => {
    if (typeof no === "string") {
      const chave = path.at(-1);
      if (path[0] === "$schema") return;
      if (typeof chave === "string" && IDENTIDADE.has(chave) && pareceFicticio(no)) {
        issues.push(
          `${origem} › ${caminhoDoCampo(path)}: "${no}" parece dado fictício ("Exemplo", example.com, CNPJ ${CNPJ_FICTICIO}). Dado fictício só vai na camada fictícia, nunca no dados/dono.json (docs/playbooks/00-DADOS-DO-DONO.md, Parte C)`,
        );
        return;
      }
      const motivo = textoDeExemplo(no);
      if (motivo) issues.push(`${origem} › ${caminhoDoCampo(path)}: ${mensagemDeExemplo(motivo)}`);
      return;
    }
    if (Array.isArray(no)) no.forEach((item, index) => walk(item, [...path, index]));
    else if (no && typeof no === "object") for (const [key, value] of Object.entries(no)) walk(value, [...path, key]);
  };
  walk(doc, []);
  return issues;
}

/**
 * Todos os problemas de um documento no formato do dados/dono.json.
 * `permitirFicticio` = validar o resultado mesclado com a camada fictícia.
 */
export function donoIssues(doc: unknown, opcoes: OpcoesDono = {}): string[] {
  const origem = opcoes.origem ?? ARQUIVO_DONO;
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return [`${origem}: o arquivo precisa ser um objeto JSON { … }`];
  const raiz = doc as Record<string, unknown>;
  const issues: string[] = [];
  const conhecidas = new Set<string>([...SECOES_DONO, "$schema"]);
  for (const key of Object.keys(raiz)) {
    if (!conhecidas.has(key)) issues.push(`${origem} › ${key}: seção desconhecida (as seções válidas: ${SECOES_DONO.join(", ")})`);
  }
  for (const secao of SECOES_DONO) {
    if (!(secao in raiz)) issues.push(`${origem} › ${secao}: seção obrigatória faltando (deixe vazia, mas não apague)`);
  }
  if (issues.length) return issues;
  issues.push(...configIssues(raiz as unknown as ConfigSources & { privacidade: Privacidade }, opcoes));
  for (const secao of ["time", "depoimentos", "logos"] as const) issues.push(...colecaoIssues(secao, raiz[secao], opcoes));
  if (!opcoes.permitirFicticio) issues.push(...marcasFicticiasNoReal(doc, origem));
  return issues;
}

/** Falha o build se as seções de config estiverem malformadas. */
export function assertValidConfigs(sources: ConfigSources & { privacidade?: Privacidade }, opcoes: OpcoesDono = {}): void {
  const issues = configIssues(sources, opcoes);
  if (issues.length) {
    throw new Error(`[dados] ${issues.length} problema(s) para corrigir:\n - ${issues.join("\n - ")}`);
  }
}

/** Falha o build com a lista de problemas (pt-BR, com o caminho de cada campo). */
export function assertDono(doc: unknown, opcoes: OpcoesDono = {}): void {
  const issues = donoIssues(doc, opcoes);
  if (issues.length) {
    throw new Error(`[dados] ${issues.length} problema(s) para corrigir:\n - ${issues.join("\n - ")}`);
  }
}
