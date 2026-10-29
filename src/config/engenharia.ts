/**
 * ============================================================================
 *  engenharia.ts — PRÁTICAS DE ENGENHARIA (BLUEPRINT §4 e §6.2 #12).
 *  O DADO MORA EM dados/dono.json › engenharia. VAZIO POR PADRÃO.
 * ============================================================================
 *
 * PARA O DONO — o que preencher em dados/dono.json (cada campo POR IDIOMA, 1–2 frases, até 300 caracteres)
 *   tests          como o código é testado.
 *   ci_cd          integração e entrega contínuas (como o código chega ao ar).
 *   code_review    como funciona a revisão de código.
 *   repository     onde fica o código e de quem ele é.
 *   documentation  o que é documentado.
 *   handover       como é a passagem de conhecimento ao fim do projeto.
 *   people         quem trabalha no projeto (papéis, sem número de pessoas inventado).
 *   security       segurança e acesso aos dados do cliente.
 *   Escreva só o que vale para TODO projeto. Deixe `null` o que não quer afirmar.
 *
 * O QUE LIBERA (features.hasEngineering = pelo menos 1 campo nos 3 idiomas;
 *   features.engineeringFields = os campos completos, na ordem acima)
 *   - Seção "Como a gente constrói" em /como-trabalhamos (uma linha por campo completo).
 *   - Link "Ver como a gente constrói" nas páginas de serviço.
 *   Campo com um idioma vazio = dado parcial: aquele campo não aparece.
 *   Sem nenhum campo e com perfis.github publicado, /como-trabalhamos mostra só
 *   a linha "a Lemamon no GitHub".
 *
 * O QUE QUEBRA O BUILD: texto com {placeholder}/[CONFIRMAR]/TODO, valor em
 *   dinheiro ou acima do limite.
 */

import { engenharia as engenhariaJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";
import type { Localized } from "./types";

export const ENGINEERING_FIELDS = [
  "tests",
  "ci_cd",
  "code_review",
  "repository",
  "documentation",
  "handover",
  "people",
  "security",
] as const;
export type EngineeringField = (typeof ENGINEERING_FIELDS)[number];

export type Engenharia = Record<EngineeringField, Localized | null>;

/** Como está em dados/dono.json (sem a camada fictícia). */
export const engenhariaReal: Engenharia = engenhariaJson as unknown as Engenharia;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const engenharia: Engenharia = comCamadaFicticia("engenharia", engenhariaReal);
