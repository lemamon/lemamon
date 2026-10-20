/**
 * Fixtures de ENTRADA das coleções (dono: gated): o que o dono escreveria no
 * frontmatter de src/content/{cases,posts}/ ou num item de dados/dono.json ›
 * {time,depoimentos,logos}, aqui só para os testes de schema e de renderização.
 * NUNCA VÃO AO AR (marca FIXTURE_MARK; ver tests/unit/gates-no-fixtures.test.ts).
 *
 * As imagens são metadados falsos ({ src, width, height, format }), validados nos
 * testes com `fakeImage` no lugar do image() do Astro.
 */
import type { CollectionEntry } from "astro:content";
import { z } from "astro/zod";

import { caseSchema, logoSchema, postSchema, teamSchema, testimonialSchema } from "@/content/schemas";

import { FIXTURE_CASE_SLUGS, FIXTURE_MARK } from "./owner-data";

/** Substitui o image() do Astro nos testes. */
export const fakeImage = () =>
  z.strictObject({ src: z.string(), width: z.number(), height: z.number(), format: z.enum(["png", "jpg", "jpeg", "webp", "svg", "avif"]) });

/** Formato da referência resolvida (reference("depoimentos")). */
export const fakeReference = z.strictObject({ collection: z.literal("depoimentos"), id: z.string() });

export const schemas = {
  cases: caseSchema(fakeImage, fakeReference),
  logos: logoSchema(fakeImage),
  depoimentos: testimonialSchema(fakeImage),
  time: teamSchema(fakeImage),
  posts: postSchema(fakeImage),
};

export const image = (name: string) => ({ src: `/@fs/fixtures/${name}.png`, width: 1200, height: 675, format: "png" as const });

const authorization = {
  porEscrito: true,
  autorizadoPor: `${FIXTURE_MARK} Diretora de operações`,
  data: "2026-03-12",
  registro: `${FIXTURE_MARK} REGISTRO-INTERNO e-mail arquivado`,
};

/** Frontmatter completo de um case (um idioma). */
export function caseFrontmatter(locale: "pt" | "en" | "es" = "pt", slug: string = FIXTURE_CASE_SLUGS[0]) {
  return {
    titulo: `${FIXTURE_MARK} Pedidos de frete que chegavam pelo WhatsApp viraram um sistema (${locale})`,
    tipoDeSistema: `${FIXTURE_MARK} Sistema de fretes`,
    cliente: `${FIXTURE_MARK} Transportes Modelo`,
    setor: `${FIXTURE_MARK} Logística`,
    porte: `${FIXTURE_MARK} Médio porte`,
    servicos: ["web_systems", "mobile_apps"],
    periodo: "mar–jul/2026",
    problema: `${FIXTURE_MARK} Os pedidos chegavam por WhatsApp e eram anotados numa planilha compartilhada.`,
    combinado: {
      escopo: `${FIXTURE_MARK} Cadastro de fretes e app do motorista primeiro.`,
      foraDoEscopo: `${FIXTURE_MARK} Integração com o ERP ficou para a fase 2.`,
      prazoEPreco: `${FIXTURE_MARK} Prazo e preço fechados no plano, sem aditivo.`,
    },
    entregue: `${FIXTURE_MARK} Um sistema web para o comercial e um app para o motorista.`,
    comoFoi: [
      { etapa: "diagnosis", quando: "fev/2026", texto: `${FIXTURE_MARK} Conversa de 45 minutos e devolutiva.` },
      { etapa: "discovery", quando: "mar/2026", texto: `${FIXTURE_MARK} Escopo priorizado e protótipo.` },
      { etapa: "development", quando: "abr–jul/2026", texto: `${FIXTURE_MARK} Entregas a cada 2 semanas.` },
    ],
    resultado: [
      { metrica: `${FIXTURE_MARK} Fechamento do mês`, antes: "4 dias", depois: "2 horas", fonte: `${FIXTURE_MARK} FONTE-INTERNA relatório` },
    ],
    fichaTecnica: { stack: ["React", "Node.js", "PostgreSQL"], link: "https://fixture-lemamon.test/painel" },
    capa: { src: image("capa"), alt: `${FIXTURE_MARK} Tela do painel de fretes` },
    imagens: [{ src: image("tela"), alt: `${FIXTURE_MARK} Tela do app do motorista`, legenda: `${FIXTURE_MARK} App do motorista` }],
    depoimento: { collection: "depoimentos", id: "fixture-lemamon-depoimento" },
    relacionados: [slug === FIXTURE_CASE_SLUGS[0] ? FIXTURE_CASE_SLUGS[1] : FIXTURE_CASE_SLUGS[0]],
    ordem: 0,
    autorizacao: { ...authorization, escopo: { nomeDoCliente: true, resultados: true, prazoEPreco: true } },
    publicado: true,
  };
}

export function logoFrontmatter(name = "alfa") {
  return { empresa: `${FIXTURE_MARK} ${name}`, arquivo: image(`logo-${name}`), ordem: 0, autorizacao: authorization };
}

export function testimonialFrontmatter() {
  return {
    citacao: {
      pt: `${FIXTURE_MARK} Na terceira semana a gente já usava uma parte no dia a dia.`,
      en: `${FIXTURE_MARK} By the third week we were already using part of it every day.`,
      es: `${FIXTURE_MARK} En la tercera semana ya usábamos una parte en el día a día.`,
    },
    nome: `Marina ${FIXTURE_MARK} Souza`,
    cargo: { pt: `${FIXTURE_MARK} Diretora`, en: `${FIXTURE_MARK} Director`, es: `${FIXTURE_MARK} Directora` },
    empresa: `${FIXTURE_MARK} Transportes Modelo`,
    caseSlug: FIXTURE_CASE_SLUGS[0],
    sobreProcesso: true,
    autorizacao: { ...authorization, foto: false },
  };
}

export function teamFrontmatter() {
  return {
    nome: `Rafael ${FIXTURE_MARK} Lima`,
    foto: image("pessoa"),
    papel: { pt: `${FIXTURE_MARK} Desenvolvedor`, en: `${FIXTURE_MARK} Developer`, es: `${FIXTURE_MARK} Desarrollador` },
    linha: { pt: `${FIXTURE_MARK} Gosto de software que dura.`, en: `${FIXTURE_MARK} I like software that lasts.`, es: `${FIXTURE_MARK} Me gusta el software que dura.` },
    linkedin: "https://www.linkedin.com/in/fixture-lemamon",
    github: "https://github.com/fixture-lemamon",
    atuaEmProjetos: true,
  };
}

export function postFrontmatter(n = 1) {
  return {
    titulo: `${FIXTURE_MARK} Sistema pronto ou sob medida ${n}`,
    resumo: `${FIXTURE_MARK} Como decidir entre um sistema pronto e um sob medida.`,
    capa: { src: image(`capa-post-${n}`), alt: `${FIXTURE_MARK} Capa do post ${n}` },
    autor: {
      nome: `Rafael ${FIXTURE_MARK} Lima`,
      foto: image("autor"),
      link: "https://www.linkedin.com/in/fixture-lemamon",
      papelTecnico: `${FIXTURE_MARK} Desenvolvedor`,
    },
    publicadoEm: `2026-0${n}-10`,
    atualizadoEm: `2026-0${n}-20`,
    servico: "web_systems",
  };
}

export const POST_BODY = `${FIXTURE_MARK} Primeiro parágrafo.\n\n<CtaMeio />\n\n${FIXTURE_MARK} Último parágrafo.`;

/** Entrada de coleção (como o getCollection devolveria) a partir do frontmatter validado. */
export function entry<C extends "cases" | "logos" | "depoimentos" | "time" | "posts">(
  collection: C,
  id: string,
  frontmatter: unknown,
  body = "",
): CollectionEntry<C> {
  const data = schemas[collection].parse(frontmatter);
  return { id, collection, data, body } as unknown as CollectionEntry<C>;
}
