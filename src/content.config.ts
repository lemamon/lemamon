/**
 * Coleções de conteúdo when_data — BLUEPRINT §4 (dono: gated).
 *
 * Uma entrada só existe se passar no schema (src/content/schemas.ts), ou seja,
 * se estiver completa: dado parcial quebra o build em vez de renderizar pela
 * metade. Os limiares (≥ 4 logos, ≥ 2 cases...) ficam em src/config/features.ts,
 * que lê estas coleções no build.
 *
 *   dados/dono.json › time[]          foto real, nome, papel, 1 linha da pessoa
 *   dados/dono.json › depoimentos[]   nominal (nome completo, cargo, empresa) + autorização
 *   dados/dono.json › logos[]         ≥ 4, cada um com autorização por escrito
 *   src/content/cases/<pt|en|es>/<slug>.mdx   mesmo slug nos 3 idiomas; vai ao ar com publicado: true nos 3
 *   src/content/posts/<slug>.mdx      só pt-BR; autor real; <CtaMeio /> no meio do texto
 *
 * Camada fictícia (só fora de produção, PUBLIC_DADOS_FICTICIOS=true): listas
 * vazias do dono.json recebem as de dados/dono.ficticio.json e os MDX de
 * dados/ficticio/{cases,posts} entram (src/content/loaders.ts).
 *
 * Texto de EXEMPLO ("(exemplo)", "Exemplo: …", "Conteúdo de exemplo", "fictício")
 * no frontmatter derruba o build pelo schema (sem a camada, nada de exemplo
 * entra) e, no frontmatter E no corpo de todo MDX real de src/content/, pelo
 * loader, com ou sem a camada.
 *
 * Fixtures de teste NUNCA ficam aqui: ficam em tests/fixtures/ (fora do build).
 */

import { defineCollection, reference } from "astro:content";

import { MODO_FICTICIO } from "./config/dono";
import { donoLoader, globComFicticio } from "./content/loaders";
import { caseSchema, logoSchema, postSchema, teamSchema, testimonialSchema } from "./content/schemas";

// "**/*": arquivo fora de cases/<pt|en|es>/ é carregado de propósito, para o
// features.contentIssues() derrubar o build com a mensagem certa em vez de ignorá-lo.
const cases = defineCollection({
  loader: globComFicticio("**/*.{md,mdx}", "cases"),
  schema: ({ image }) => caseSchema(image, reference("depoimentos"), { permitirExemplo: MODO_FICTICIO }),
});

const logos = defineCollection({
  loader: donoLoader("logos"),
  schema: ({ image }) => logoSchema(image),
});

const depoimentos = defineCollection({
  loader: donoLoader("depoimentos"),
  schema: ({ image }) => testimonialSchema(image),
});

const time = defineCollection({
  loader: donoLoader("time"),
  schema: ({ image }) => teamSchema(image),
});

const posts = defineCollection({
  loader: globComFicticio("**/*.{md,mdx}", "posts"),
  schema: ({ image }) => postSchema(image, { permitirExemplo: MODO_FICTICIO }),
});

export const collections = { cases, logos, depoimentos, time, posts };
