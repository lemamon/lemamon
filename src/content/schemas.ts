/**
 * Schemas Zod das coleções when_data — BLUEPRINT §4, §6.10–6.12 (dono: gated).
 *
 * Este arquivo NÃO é conteúdo: cases e posts são MDX em src/content/cases/** e
 * src/content/posts/**; time, depoimentos e logos vêm de dados/dono.json (seções
 * homônimas). Os schemas ficam aqui, como fábricas puras, para os loaders
 * (src/content/loaders.ts), a validação do dono.json (src/config/validate.ts) e
 * os testes (tests/unit/gates-schemas.test.ts) usarem os mesmos, sem depender do
 * runtime `astro:content`.
 *
 * Regra geral: uma entrada só existe se passar no schema. Campo faltando, texto
 * vazio, autorização ausente, valor monetário ou depoimento anônimo QUEBRAM O
 * BUILD com a mensagem do campo — nunca renderizam pela metade.
 *
 * O que nunca é publicado (só fica no repositório, para auditoria): o bloco
 * `autorizacao` inteiro (ou o `semTermo` do case anonimizado) e a `fonte` de
 * cada métrica de resultado.
 */

import { z } from "astro/zod";

import { SERVICE_KEYS } from "../config/routes";

/** Etapas do método, na ordem (BLUEPRINT §5.1). */
export const STAGE_IDS = ["diagnosis", "discovery", "development", "support"] as const;
export type StageId = (typeof STAGE_IDS)[number];

/**
 * Valor monetário (BLUEPRINT §4/§12): só pode existir em dados/dono.json ›
 * precos e › qualificacao. O teste no-money aplica o mesmo padrão em src/ e dados/.
 */
export const MONEY_PATTERN = /(R\$|US\$|€|£)\s?\d|\b\d+(?:[.,]\d+)?\s?(?:mil|reais|dólares|dollars|USD|BRL)\b/i;

/**
 * Marcas de texto não final (rascunho do dono ou placeholder de template).
 * TODO/XXX só em MAIÚSCULAS: "todo" é palavra comum em português ("todo projeto").
 */
const DRAFT_TAGS = /[{}]|\[(?:CONFIRMAR|PREENCHER|EXEMPLO|TODO)\]|\blorem ipsum\b/i;
const DRAFT_WORDS = /\b(?:TODO|XXX|TBD)\b/;

/** Texto com marca de rascunho ({placeholder}, [CONFIRMAR], TODO, lorem ipsum...). */
export function hasDraftMark(value: string): boolean {
  return DRAFT_TAGS.test(value) || DRAFT_WORDS.test(value);
}

// --- texto de EXEMPLO (camada de dados fictícios) -------------------------------------
//
// O que a camada fictícia (dados/dono.ficticio.json e os MDX de dados/ficticio/)
// escreve para ser reconhecível. No dado REAL (dados/dono.json, src/content/cases,
// src/content/posts) isso é sempre cópia da camada e derruba o build. "por
// exemplo" no meio da frase é português comum e passa.

/** "(exemplo)", "(example)", "(ejemplo)" em qualquer lugar. */
const EXEMPLO_ENTRE_PARENTESES = /\((?:exemplo|example|ejemplo)\)/i;

/** Rótulo de exemplo no INÍCIO do texto (ou da linha, no corpo MDX). */
const ROTULO_DE_EXEMPLO = new RegExp(
  "^(?:" +
    [
      "Exemplo",
      "Example",
      "Ejemplo",
      "Texto de exemplo",
      "Sample text",
      "Texto de ejemplo",
      "Condições de exemplo",
      "Example terms",
      "Condiciones de ejemplo",
      "Depoimento de exemplo",
      "Sample testimonial",
      "Testimonio de ejemplo",
      "Post de exemplo",
      "Sample post",
      "Post de ejemplo",
      "Case de exemplo",
      "Sample case",
      "Caso de ejemplo",
      "Conteúdo de exemplo",
      "Sample content",
      "Contenido de ejemplo",
      "Avatar de exemplo",
      "Sample avatar",
      "Avatar de ejemplo",
      "Tela de exemplo",
      "Sample screen",
      "Pantalla de ejemplo",
      "Painel de exemplo",
      "Dado fictício",
    ]
      .sort((a, b) => b.length - a.length)
      .join("|") +
    ")\\b",
);

/** Frases da camada em qualquer lugar do texto (nenhuma é português/inglês/espanhol comum). */
const FRASE_DE_EXEMPLO =
  /\b(?:post|case|conte[uú]do|depoimento|avatar) de exemplo\b|\bsample (?:post|case|content|testimonial|avatar)\b|\b(?:caso|contenido|testimonio|avatar) de ejemplo\b|\bcamada (?:de exemplo|fict[ií]cia)\b|\bexample\.(?:com|org|net)\b/i;

/** "fictício", "fictícia", "ficticio", "fictitious". */
const PALAVRA_FICTICIO = /\bfict[ií]ci[oa]s?\b|\bfictitious\b/i;

/**
 * Texto com cara de EXEMPLO da camada fictícia? Devolve o motivo (para a
 * mensagem de erro) ou null. Usado em dados/dono.json (validate.ts), no
 * frontmatter de cases e posts (caseSchema/postSchema) e no corpo dos MDX reais
 * (loaders.ts). Nunca vale em dado real.
 */
export function textoDeExemplo(valor: string): string | null {
  const texto = valor.trim();
  if (!texto) return null;
  if (EXEMPLO_ENTRE_PARENTESES.test(texto)) return 'marcado "(exemplo)"';
  const rotulo = ROTULO_DE_EXEMPLO.exec(texto);
  if (rotulo) return `começa com "${rotulo[0]}"`;
  const frase = FRASE_DE_EXEMPLO.exec(texto);
  if (frase) return `contém "${frase[0]}"`;
  const palavra = PALAVRA_FICTICIO.exec(texto);
  if (palavra) return `contém "${palavra[0]}"`;
  return null;
}

/** Mensagem padrão para texto de exemplo em dado real. */
export function mensagemDeExemplo(motivo: string): string {
  return `texto de EXEMPLO da camada fictícia (${motivo}): dado fictício nunca vai ao ar. Escreva o texto real ou deixe vazio`;
}

/**
 * Campos de identidade (nome de pessoa ou empresa, link): aqui basta a palavra
 * "Exemplo", example.com ou o CNPJ de exemplo para ser dado fictício.
 */
const IDENTIDADE_FICTICIA = /\b(?:exemplo|ejemplo|example|fict[ií]ci[oa]s?|fictitious)\b|00\.?000\.?000\/?0000-?00/i;
const CAMPOS_DE_IDENTIDADE = new Set(["nome", "cliente", "empresa", "link", "linkedin", "github", "autorizadoPor"]);

/**
 * Procura texto de exemplo em TODO valor de texto de um objeto (frontmatter de
 * case ou post). Devolve [caminho, motivo] de cada achado.
 */
export function exemplosNoObjeto(no: unknown, caminho: (string | number)[] = []): [(string | number)[], string][] {
  if (typeof no === "string") {
    const chave = caminho.at(-1);
    // Caminho de imagem (relativo ou já processado pelo astro:assets) não é texto publicado.
    if (chave === "src" || chave === "fsPath") return [];
    if (typeof chave === "string" && CAMPOS_DE_IDENTIDADE.has(chave) && IDENTIDADE_FICTICIA.test(no)) {
      return [[caminho, `"${no}" parece nome ou link de exemplo`]];
    }
    const motivo = textoDeExemplo(no);
    return motivo ? [[caminho, motivo]] : [];
  }
  if (Array.isArray(no)) return no.flatMap((item, index) => exemplosNoObjeto(item, [...caminho, index]));
  if (no && typeof no === "object" && !(no instanceof Date)) {
    return Object.entries(no).flatMap(([chave, valor]) => exemplosNoObjeto(valor, [...caminho, chave]));
  }
  return [];
}

/**
 * Corpo MDX real com texto de exemplo? Confere linha a linha (sem a marcação de
 * ênfase), para o rótulo "Exemplo:"/"Conteúdo de exemplo." no começo de um
 * parágrafo também contar. Devolve [linha (1…), motivo].
 */
export function exemplosNoCorpo(corpo: string | undefined): [number, string][] {
  const achados: [number, string][] = [];
  (corpo ?? "").split("\n").forEach((linha, index) => {
    const limpa = linha.replace(/[*_`]/g, "").replace(/^\s*(?:[-+>]|\d+\.)\s+/, "").replace(/^#+\s*/, "");
    const motivo = textoDeExemplo(limpa);
    if (motivo) achados.push([index + 1, motivo]);
  });
  return achados;
}

/** Opções dos schemas de cases e posts. */
export interface OpcoesDoConteudo {
  /**
   * Aceita texto de exemplo no frontmatter. Só com a camada fictícia ligada (os
   * MDX de dados/ficticio/ entram na coleção); os MDX reais continuam
   * conferidos pelo loader (src/content/loaders.ts) em qualquer modo.
   */
  permitirExemplo?: boolean;
}

function semExemplo(permitir: boolean | undefined) {
  return (data: unknown, ctx: z.RefinementCtx) => {
    if (permitir) return;
    for (const [path, motivo] of exemplosNoObjeto(data)) {
      ctx.addIssue({ code: "custom", path, message: mensagemDeExemplo(motivo) });
    }
  };
}

/** slug de URL: minúsculas, números e hífen (igual nos 3 idiomas). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Nomes que denunciam depoimento ou autor anônimo/genérico. */
const GENERIC_NAME = /\b(an[oôó]nim[oa]s?|anonymous|cliente|client|customer|usu[aá]ri[oa]|user|empresa|company|ceo|cto|diretor[a]?|director|gerente|manager|fundador[a]?|founder)\b/i;

/** Texto preenchido, sem placeholder e sem valor monetário. */
export function text(max: number) {
  return z
    .string()
    .trim()
    .min(1, "obrigatório (texto vazio não publica)")
    .max(max, `no máximo ${max} caracteres`)
    .refine((value) => !hasDraftMark(value), "texto com marca de rascunho ({…}, [CONFIRMAR], TODO, lorem ipsum)")
    .refine((value) => !MONEY_PATTERN.test(value), "valor monetário só em dados/dono.json › precos ou › qualificacao (BLUEPRINT §4)");
}

/** Texto nos 3 idiomas (depoimentos, time): os 3 obrigatórios. */
export function localizedText(max: number) {
  return z.strictObject({ pt: text(max), en: text(max), es: text(max) });
}

/** Nome completo de pessoa real: nome e sobrenome, sem abreviação e sem rótulo genérico. */
export const personName = text(80)
  .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, "nome completo (nome e sobrenome): nunca anônimo")
  .refine((value) => !/(^|\s)\p{L}\.?$/u.test(value), "sobrenome abreviado não vale: nome completo")
  .refine((value) => !GENERIC_NAME.test(value), "nome genérico ou cargo no lugar do nome: depoimento/pessoa nunca anônimo");

export const slug = z.string().regex(SLUG_PATTERN, "slug: minúsculas, números e hífen (ex.: sistema-de-fretes)");

/** URL https, opcionalmente presa a um domínio (perfil do LinkedIn, do GitHub...). */
export function httpsUrl(hosts?: readonly string[]) {
  return z.string().refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (!hosts) return true;
    const host = url.hostname.replace(/^www\./, "");
    return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  }, hosts ? `URL https de ${hosts.join(" ou ")}` : "URL https válida");
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Data (AAAA-MM-DD). `notFuture`: não pode estar no futuro (autorizações). */
export function date(options: { notFuture?: boolean } = {}) {
  const base = z.coerce.date({ error: "data no formato AAAA-MM-DD" });
  return options.notFuture
    ? base.refine((value) => value.getTime() <= Date.now() + DAY_MS, "data no futuro: a autorização tem que existir antes de publicar")
    : base;
}

function isUnique(list: readonly unknown[]): boolean {
  return new Set(list).size === list.length;
}

/**
 * Registro da autorização POR ESCRITO (BLUEPRINT §4: logos, depoimentos, cases).
 * Nunca é renderizado. Sem ele, a entrada não valida e o build quebra.
 */
export const authorization = z.strictObject({
  /** Tem que ser `true`: existe autorização por escrito (e-mail, contrato, termo assinado). */
  porEscrito: z.literal(true, { error: "porEscrito: true — só com autorização POR ESCRITO" }),
  /** Quem autorizou: cargo e empresa (o nome fica no documento arquivado, não no repositório). */
  autorizadoPor: text(120),
  /** Data da autorização. */
  data: date({ notFuture: true }),
  /** Onde está a prova (ex.: "e-mail de 12/03/2026 arquivado na pasta Autorizações/2026"). */
  registro: text(240),
});

/**
 * Autorização de um case: o que, além do case em si, o cliente autorizou.
 * Cada item é explícito (sem padrão) para ninguém publicar por esquecimento.
 */
export const caseAuthorization = authorization.extend({
  escopo: z.strictObject({
    /** Publicar o nome do cliente (campo `cliente`). Sem isso, o case usa setor + porte. */
    nomeDoCliente: z.boolean(),
    /** Publicar as métricas de `resultado`. */
    resultados: z.boolean(),
    /** Publicar o prazo e o preço do plano (`combinado.prazoEPreco`, sem valor em dinheiro). */
    prazoEPreco: z.boolean(),
  }),
});

/**
 * Case ANONIMIZADO publicado SEM termo do cliente, por decisão registrada do dono
 * (D45 em docs/playbooks/15-registro-de-decisoes.md). Fica no lugar de
 * `autorizacao` só no case sem `cliente`: nome, resultado, prazo e preço, link
 * do produto e depoimento continuam exigindo o termo. Nunca é renderizado.
 */
export const caseOwnerDecision = z.strictObject({
  /** Quem decidiu publicar sem termo: sempre o dono. */
  decididoPor: z.literal("dono", { error: 'decididoPor: "dono" (só o dono decide publicar sem termo)' }),
  /** Data da decisão. */
  data: date({ notFuture: true }),
  /** Onde a decisão está registrada (ex.: "D45 em docs/playbooks/15-registro-de-decisoes.md"). */
  registro: text(240),
});

/** Autorização de depoimento: inclui a foto e o vídeo, quando houver. */
export const testimonialAuthorization = authorization.extend({
  /** A pessoa autorizou a foto (campo `foto`). */
  foto: z.boolean(),
  /**
   * A pessoa autorizou o uso da IMAGEM e da VOZ em vídeo (campo `video`).
   * Sem o campo = não autorizado: um depoimento com vídeo quebra o build.
   */
  video: z.boolean().optional(),
});

// --- mídia que não é imagem (depoimento em vídeo) -------------------------------------

/** Formatos de vídeo aceitos no depoimento em vídeo (B287). */
export const EXTENSOES_DE_VIDEO = ["mp4", "webm"] as const;
/** Legenda do vídeo: WebVTT (o formato que o <track> do navegador lê). */
export const EXTENSOES_DE_LEGENDA = ["vtt"] as const;
/** Duração máxima do depoimento em vídeo (playbook 09 §12: ~60 s editados). */
export const VIDEO_MAX_SEGUNDOS = 90;

/** Fábrica do validador de arquivo de mídia (o loader troca por uma que confere o disco). */
export type FabricaDeArquivo = (extensoes: readonly string[]) => z.ZodType<string>;

/**
 * Arquivo de mídia do dono (vídeo, legenda): caminho RELATIVO à pasta dados/
 * (ex.: "videos/marina-souza.mp4"), sem URL, sem "/" no início e sem "..", com
 * uma das extensões pedidas. Formato só: a existência do arquivo é conferida em
 * src/config/validate.ts (com mensagem em pt-BR), antes do schema do Astro.
 */
export const arquivoDeMidia: FabricaDeArquivo = (extensoes) =>
  z.string().superRefine((value, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: "custom", message });
    if (!value.trim()) return issue("caminho do arquivo vazio");
    if (/^[a-z]+:/i.test(value) || value.startsWith("/") || value.split(/[\\/]/).includes("..")) {
      return issue('caminho relativo à pasta dados/ (ex.: "videos/marina-souza.mp4"), sem URL, sem "/" no início e sem ".."');
    }
    if (!new RegExp(`\\.(${extensoes.join("|")})$`, "i").test(value)) return issue(`formato: ${extensoes.join(" ou ")}`);
  });

/**
 * cases/<pt|en|es>/<slug>.mdx — um arquivo por idioma, mesmo slug nos 3.
 * O corpo MDX é o detalhe de "O que foi entregue" (português de negócio, com
 * imagens reais). Um case só vai ao ar publicado nos 3 idiomas (features.ts).
 */
export function caseSchema<Img extends z.ZodType, Ref extends z.ZodType>(
  image: () => Img,
  depoimentoRef: Ref,
  opcoes: OpcoesDoConteudo = {},
) {
  return z
    .strictObject({
      /** H1 orientado ao problema resolvido. */
      titulo: text(120),
      /** {tipo_de_sistema} do title (meta.case_template), ex.: "Sistema de gestão de fretes". */
      tipoDeSistema: text(60),
      /** Nome do cliente: SÓ com autorizacao.escopo.nomeDoCliente. Sem ele, setor + porte. */
      cliente: text(80).optional(),
      setor: text(60),
      /** Obrigatório quando não há `cliente` ("Cliente ou setor + porte", BLUEPRINT §4). */
      porte: text(60).optional(),
      /** Tags de serviço: cases relacionados nos serviços e ?servico= do CTA (a 1ª é a principal). */
      servicos: z.array(z.enum(SERVICE_KEYS)).min(1).max(SERVICE_KEYS.length).refine(isUnique, "serviço repetido"),
      /** Período do projeto, como texto (ex.: "mar–jul/2026"). */
      periodo: text(40).optional(),
      /** "O problema": 2–3 frases na linguagem do cliente. */
      problema: text(420),
      /** "O que foi combinado". */
      combinado: z.strictObject({
        /** Escopo priorizado. */
        escopo: text(420),
        /** O que ficou de fora. */
        foraDoEscopo: text(300).optional(),
        /** Prazo e preço do plano, sem valor em dinheiro. SÓ com autorizacao.escopo.prazoEPreco. */
        prazoEPreco: text(200).optional(),
      }),
      /** Resumo de "O que foi entregue" (card e abertura da seção; o detalhe vem do corpo MDX). */
      entregue: text(300),
      /** "Como foi": linha do tempo real, nas etapas do método que o projeto teve, em ordem. */
      comoFoi: z
        .array(z.strictObject({ etapa: z.enum(STAGE_IDS), quando: text(40), texto: text(300) }))
        .min(1)
        .max(STAGE_IDS.length)
        .refine(
          (list) => list.every((item, index) => index === 0 || STAGE_IDS.indexOf(item.etapa) > STAGE_IDS.indexOf(list[index - 1]!.etapa)),
          "etapas sem repetição e na ordem do método (diagnosis → discovery → development → support)",
        ),
      /** "O resultado": até 3 métricas antes → depois. Opcional; SÓ com autorizacao.escopo.resultados. */
      resultado: z
        .array(
          z.strictObject({
            metrica: text(80),
            antes: text(40),
            depois: text(40),
            /** De onde veio o número (verificável). Nunca publicado. */
            fonte: text(200),
          }),
        )
        .min(1)
        .max(3)
        .optional(),
      /** "Ficha técnica" (avaliador técnico). */
      fichaTecnica: z.strictObject({
        stack: z.array(text(40)).min(1).max(12).refine(isUnique, "tecnologia repetida"),
        /** Link do produto no ar, se for público. */
        link: httpsUrl().optional(),
      }),
      /** Imagem real do projeto (hero, card e og:image). */
      capa: z.strictObject({ src: image(), alt: text(160) }),
      /** Imagens reais de "O que foi entregue", com alt descritivo. */
      imagens: z.array(z.strictObject({ src: image(), alt: text(160), legenda: text(160).optional() })).max(12).default([]),
      /** Depoimento nominal ligado a este case (coleção depoimentos). */
      depoimento: depoimentoRef.optional(),
      /** Até 2 slugs de cases relacionados (sem isso: os que compartilham serviço). */
      relacionados: z.array(slug).max(2).refine(isUnique, "slug repetido").optional(),
      /** Ordem nas listas (menor primeiro). */
      ordem: z.number().int().min(0).default(0),
      /** Termo POR ESCRITO do cliente. Obrigatório, salvo `semTermo` em case anonimizado. */
      autorizacao: caseAuthorization.optional(),
      /** Case anonimizado publicado sem termo, por decisão registrada do dono. Nunca junto com `autorizacao`. */
      semTermo: caseOwnerDecision.optional(),
      /** Só vai ao ar com `true` nos 3 idiomas. */
      publicado: z.boolean().default(false),
      /** Title sem a marca, até 50 caracteres (a marca entra no template). */
      seoTitle: text(50).optional(),
      seoDescription: text(155).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.autorizacao && !data.semTermo) {
        ctx.addIssue({
          code: "custom",
          path: ["autorizacao"],
          message: "autorizacao obrigatória (termo POR ESCRITO); só o case anonimizado aceita `semTermo`, a decisão registrada do dono",
        });
      }
      if (data.autorizacao && data.semTermo) {
        ctx.addIssue({ code: "custom", path: ["semTermo"], message: "use `autorizacao` (termo) ou `semTermo` (decisão do dono), nunca os dois" });
      }
      // Sem termo não há escopo autorizado: nome, resultado e prazo e preço ficam de fora.
      const escopo = data.autorizacao?.escopo;
      if (!data.cliente && !data.porte) {
        ctx.addIssue({ code: "custom", path: ["porte"], message: "sem `cliente`, setor + porte são obrigatórios" });
      }
      if (data.cliente && !escopo?.nomeDoCliente) {
        ctx.addIssue({
          code: "custom",
          path: ["cliente"],
          message: "nome do cliente exige autorizacao.escopo.nomeDoCliente: true (`semTermo` nunca publica o nome)",
        });
      }
      // Case ANONIMIZADO (sem `cliente`, só setor + porte): nada na página pode
      // identificar a empresa (playbook 09 §10). O link do produto no ar e o
      // depoimento nominal (nome, cargo e empresa) entregariam quem é o cliente.
      // Logo e depoimento do dono.json que apontam para este case (caseSlug)
      // caem em features.contentIssues().
      if (!data.cliente && data.fichaTecnica.link) {
        ctx.addIssue({
          code: "custom",
          path: ["fichaTecnica", "link"],
          message: "case anonimizado (sem `cliente`) não publica o link do produto: o link identificaria o cliente",
        });
      }
      if (!data.cliente && data.depoimento) {
        ctx.addIssue({
          code: "custom",
          path: ["depoimento"],
          message: "case anonimizado (sem `cliente`) não liga depoimento nominal: o depoimento mostra a empresa e a pessoa",
        });
      }
      if (data.resultado && !escopo?.resultados) {
        ctx.addIssue({ code: "custom", path: ["resultado"], message: "resultado exige autorizacao.escopo.resultados: true" });
      }
      if (data.combinado.prazoEPreco && !escopo?.prazoEPreco) {
        ctx.addIssue({
          code: "custom",
          path: ["combinado", "prazoEPreco"],
          message: "prazo e preço exigem autorizacao.escopo.prazoEPreco: true",
        });
      }
    })
    .superRefine(semExemplo(opcoes.permitirExemplo));
}

/** dados/dono.json › logos[] — hasLogos exige ≥ 4 empresas diferentes, todas autorizadas. */
export function logoSchema<Img extends z.ZodType>(image: () => Img) {
  return z.strictObject({
    /** Nome da empresa: vira o alt do logo (shared.proof.logo_alt). */
    empresa: text(80),
    /** Logo monocromático, de preferência SVG. */
    arquivo: image(),
    /** Link opcional para o case da empresa (só vira link se o case estiver publicado). */
    caseSlug: slug.optional(),
    ordem: z.number().int().min(0).default(0),
    /** Autorização por escrito do uso da marca. */
    autorizacao: authorization,
  });
}

/** dados/dono.json › depoimentos[] — sempre nominal, nunca anônimo. */
export function testimonialSchema<Img extends z.ZodType>(image: () => Img, arquivo: FabricaDeArquivo = arquivoDeMidia) {
  return z
    .strictObject({
      /** Citação de 2–3 linhas, por idioma. */
      citacao: localizedText(360),
      /** Nome completo (nome e sobrenome). */
      nome: personName,
      cargo: localizedText(80),
      empresa: text(80),
      /** Foto opcional: SÓ com autorizacao.foto. */
      foto: z.strictObject({ src: image(), alt: localizedText(160) }).optional(),
      /**
       * Depoimento em VÍDEO (B287), opcional: SÓ com autorizacao.video. Até 90 s,
       * com legenda em português obrigatória (en/es opcionais). A página baixa só
       * o pôster até a pessoa apertar o play (preload="none"); sem player de
       * terceiros. Nome completo e empresa já são obrigatórios no depoimento.
       */
      video: z
        .strictObject({
          /** mp4 ou webm, relativo a dados/ (ex.: "videos/marina-souza.mp4"). */
          src: arquivo(EXTENSOES_DE_VIDEO),
          /** Quadro mostrado antes do play (imagem relativa a dados/). */
          poster: image(),
          /** WebVTT por idioma: pt obrigatória. */
          legendas: z.strictObject({
            pt: arquivo(EXTENSOES_DE_LEGENDA),
            en: arquivo(EXTENSOES_DE_LEGENDA).optional(),
            es: arquivo(EXTENSOES_DE_LEGENDA).optional(),
          }),
          duracaoSegundos: z
            .number()
            .int()
            .min(1)
            .max(VIDEO_MAX_SEGUNDOS, `no máximo ${VIDEO_MAX_SEGUNDOS} segundos (o depoimento em vídeo é curto: ~60 s editados)`),
        })
        .optional(),
      /** Case ligado ao depoimento (link "Ler o case" só se publicado). */
      caseSlug: slug.optional(),
      /** Fala sobre previsibilidade/processo: preferido logo depois do método e em "O método na prática". */
      sobreProcesso: z.boolean().default(false),
      ordem: z.number().int().min(0).default(0),
      autorizacao: testimonialAuthorization,
    })
    .superRefine((data, ctx) => {
      if (data.foto && !data.autorizacao.foto) {
        ctx.addIssue({ code: "custom", path: ["foto"], message: "foto exige autorizacao.foto: true" });
      }
      if (data.video && data.autorizacao.video !== true) {
        ctx.addIssue({
          code: "custom",
          path: ["video"],
          message: "vídeo exige autorizacao.video: true (imagem e voz autorizadas POR ESCRITO)",
        });
      }
    });
}

/** dados/dono.json › time[] — foto real, nome, papel e 1 linha da própria pessoa. */
export function teamSchema<Img extends z.ZodType>(image: () => Img) {
  return z.strictObject({
    nome: personName,
    /** Foto real (nunca banco de imagem). O alt sai de shared.proof.team_card.photo_alt. */
    foto: image(),
    papel: localizedText(60),
    /** 1 linha escrita pela própria pessoa. */
    linha: localizedText(160),
    linkedin: httpsUrl(["linkedin.com"]).optional(),
    github: httpsUrl(["github.com"]).optional(),
    /**
     * Atua em projetos de cliente (i18n _notes.about). Só quem atua entra na seção
     * Time e em /sobre, e só essas pessoas ligam hasTeam.
     */
    atuaEmProjetos: z.boolean(),
    ordem: z.number().int().min(0).default(0),
  });
}

/** posts/<slug>.mdx — só pt-BR; autor real com papel técnico (i18n _notes.blog). */
export function postSchema<Img extends z.ZodType>(image: () => Img, opcoes: OpcoesDoConteudo = {}) {
  return z
    .strictObject({
      titulo: text(110),
      resumo: text(200),
      /**
       * Capa OBRIGATÓRIA: vira a og:image do post (cartão no LinkedIn, no Medium e
       * no WhatsApp) e a `image` do JSON-LD Article. Post sem capa sairia com o
       * cartão genérico do site e quebra o build (B260). Imagem real ou cartão
       * 1200×630 próprio do post, com alt descritivo.
       */
      capa: z.strictObject({ src: image(), alt: text(160) }),
      autor: z.strictObject({
        nome: personName,
        foto: image(),
        /** Perfil público do autor (LinkedIn, GitHub...). */
        link: httpsUrl(),
        /** Quem escreve ou revisa código ("por quem constrói"). */
        papelTecnico: text(80),
      }),
      publicadoEm: date(),
      atualizadoEm: date().optional(),
      /** Serviço relacionado (link "Ver como funciona: {servico}"). Sem ele, o link vai para o método. */
      servico: z.enum(SERVICE_KEYS).optional(),
      /** Substitui blog.post.mid_cta.text; o botão é sempre o diagnóstico gratuito. */
      midCtaText: text(240).optional(),
      /** Até 3 posts relacionados (sem isso: mesmo serviço, depois os mais novos). */
      relacionados: z.array(slug).max(3).refine(isUnique, "slug repetido").optional(),
      seoTitle: text(50).optional(),
      seoDescription: text(155).optional(),
      rascunho: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.atualizadoEm && data.atualizadoEm.getTime() < data.publicadoEm.getTime()) {
        ctx.addIssue({ code: "custom", path: ["atualizadoEm"], message: "atualizadoEm antes de publicadoEm" });
      }
    })
    .superRefine(semExemplo(opcoes.permitirExemplo));
}

/** Componente MDX obrigatório no corpo de todo post (1 CTA contextual no meio, BLUEPRINT §6.12). */
export const POST_MID_CTA_TAG = "CtaMeio";

export function hasMidCta(body: string | undefined): boolean {
  return new RegExp(`<${POST_MID_CTA_TAG}\\s*/?>`).test(body ?? "");
}
