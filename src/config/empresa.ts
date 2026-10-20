/**
 * ============================================================================
 *  empresa.ts — DADOS DA EMPRESA (BLUEPRINT §1.5, §4 e §6.11).
 *  O DADO MORA EM dados/dono.json › empresa.
 * ============================================================================
 *
 * PARA O DONO — o que preencher (em dados/dono.json, não aqui)
 *   email         fato confirmado; preenche {email} nos 3 idiomas. Trocar aqui
 *                 troca no site inteiro (ex.: quando houver e-mail no domínio).
 *   razaoSocial   razão social exatamente como no cartão CNPJ.
 *   cnpj          "00.000.000/0000-00" ou só os 14 dígitos (dígitos verificadores
 *                 conferidos no build).
 *   anoFundacao   opcional (ex.: 2021). null se não quiser publicar.
 *   responsavel   controlador SEM pessoa jurídica: nome da pessoa responsável
 *                 (Política de Privacidade, privacy.sections.controller.body_individual).
 *   apresentacao  subtítulo de /sobre, POR IDIOMA, até 160 caracteres: 1 frase
 *                 com "a gente", dizendo para quem a Lemamon trabalha e por que
 *                 combina escopo, prazo e preço antes de construir, citando
 *                 a cidade como no resto do site: pt "São Paulo, SP", en
 *                 "São Paulo, Brazil", es "São Paulo, Brasil" (nunca "SP" em
 *                 en/es). Sem número e sem superlativo.
 *                 (Ponto de partida em i18n about.hero._subtitle_note.)
 *   historia      "Por que a gente trabalha assim" em /sobre: de 1 a 4
 *                 parágrafos curtos POR IDIOMA, escritos por você.
 *
 * O QUE LIBERA
 *   hasCompanyData (razaoSocial + CNPJ válido): CNPJ no rodapé, controlador na
 *     Política e o bloco "Dados da empresa" em /sobre.
 *   hasAboutIntro  (apresentacao nos 3 idiomas): subtítulo do hero de /sobre.
 *   hasAboutStory  (historia nos 3 idiomas): seção "Por que a gente trabalha assim".
 *   /sobre em si só existe com pelo menos 1 pessoa completa em dados/dono.json › time
 *   (hasTeam). Razão social sem CNPJ válido (ou o contrário) = dado parcial: nada aparece.
 *
 * O QUE QUEBRA O BUILD: e-mail inválido, CNPJ preenchido com dígito verificador
 *   errado, ano no futuro, texto com {placeholder}/[CONFIRMAR]/TODO, valor em
 *   dinheiro, apresentação acima de 160 caracteres, dado fictício (nome com
 *   "Exemplo", e-mail @example.com, o CNPJ 00.000.000/0000-00): dado fictício só
 *   existe na camada fictícia (dados/dono.ficticio.json), nunca no dono.json.
 */

import { empresa as empresaJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";
import type { Localized } from "./types";

export interface Empresa {
  /** E-mail público. Trocar aqui troca nos 3 idiomas. */
  email: string;
  razaoSocial: string;
  /** "00.000.000/0000-00" ou só os 14 dígitos. */
  cnpj: string;
  anoFundacao: number | null;
  /** Controlador sem PJ: nome da pessoa responsável (privacy.sections.controller.body_individual). */
  responsavel: string;
  /** Subtítulo de /sobre (about.hero._subtitle_note). Até 160 caracteres por idioma. */
  apresentacao?: Localized | null;
  /** "Por que a gente trabalha assim" (about.story): parágrafos por idioma. */
  historia?: Localized<string[]> | null;
}

/** Como está em dados/dono.json (sem a camada fictícia). */
export const empresaReal: Empresa = empresaJson as unknown as Empresa;

/**
 * O que o site usa (com a camada fictícia por cima, quando ligada fora de produção),
 * já pronto para exibir: razão social sem espaço sobrando e CNPJ sempre como
 * 00.000.000/0000-00, igual no rodapé, na Política, em /sobre e no JSON-LD.
 */
export const empresa: Empresa = paraExibir(comCamadaFicticia("empresa", empresaReal));

function paraExibir(dados: Empresa): Empresa {
  return { ...dados, razaoSocial: dados.razaoSocial.trim(), cnpj: dados.cnpj.trim() === "" ? "" : formatCnpj(dados.cnpj) };
}

/** CNPJ com dígitos verificadores. Aceita com ou sem pontuação. Puro (sem zod). */
export function isValidCnpj(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calc = (base: string, weights: number[]) => {
    const sum = weights.reduce((acc, weight, index) => acc + Number(base[index]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const first = calc(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calc(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === Number(digits[12]) && second === Number(digits[13]);
}

/** CNPJ no formato 00.000.000/0000-00 (para exibir). Entrada com ou sem pontuação. */
export function formatCnpj(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 14) return input.trim();
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
