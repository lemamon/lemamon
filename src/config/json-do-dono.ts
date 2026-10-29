/**
 * Leitura do dados/dono.json (e do arquivo da camada fictícia) com erro de
 * SINTAXE em pt-BR (dono: gated). Puro: sem I/O, sem ambiente.
 *
 * O JSON.parse do Node só diz "Unexpected token ']'" e o import JSON do Vite
 * falha em inglês, apontando o src/content.config.ts. Aqui o erro diz o
 * arquivo, a linha, a coluna e o motivo em português, com a linha do arquivo e
 * uma seta embaixo:
 *
 *   [dados] dados/dono.json não é um JSON válido (linha 124, coluna 1): vírgula
 *   sobrando depois do último item. JSON não aceita vírgula final nem comentário.
 *
 * Quem chama: a integração src/integrations/dados-ficticios.ts (no
 * astro:config:setup, ANTES do astro sync/check e de qualquer import do JSON) e
 * os loaders de src/content/loaders.ts.
 */

export interface ErroDeJson {
  /** Posição (0…) do caractere onde o JSON quebra. */
  posicao: number;
  /** Motivo em português, para quem edita o arquivo. */
  dica: string;
}

const VIRGULA_FINAL = "vírgula sobrando depois do último item";
const AVISO = "JSON não aceita vírgula final nem comentário.";

/**
 * Onde e por que o texto não é JSON (null = é JSON válido). Analisador
 * recursivo mínimo, só para achar a posição e o motivo do primeiro erro.
 */
export function localizarErroDeJson(texto: string): ErroDeJson | null {
  let i = 0;
  class Quebra extends Error {
    constructor(
      readonly posicao: number,
      readonly dica: string,
    ) {
      super(dica);
    }
  }
  const falha = (dica: string, posicao = i): never => {
    throw new Quebra(posicao, dica);
  };
  const espacos = () => {
    while (i < texto.length && /[ \t\r\n]/.test(texto[i]!)) i++;
  };
  const inesperado = (esperado: string): never => {
    if (i >= texto.length) return falha(`o arquivo terminou antes da hora: falta fechar uma } ou ] (esperava ${esperado})`);
    const c = texto[i]!;
    if (c === "/" && (texto[i + 1] === "/" || texto[i + 1] === "*")) return falha("comentário (// ou /* */) não é permitido em JSON");
    if (c === "'") return falha('texto entre aspas simples: use aspas duplas ("assim")');
    if (c === "﻿") return falha("caractere invisível (BOM) no começo do arquivo: salve como UTF-8 sem BOM");
    if (c === "“" || c === "”") return falha('aspas “curvas” (de editor de texto): use aspas duplas retas (")');
    return falha(`esperava ${esperado}, veio "${c}"`);
  };

  const valor = (): void => {
    espacos();
    const c = texto[i];
    if (c === "{") return objeto();
    if (c === "[") return lista();
    if (c === '"') return string();
    if (c !== undefined && /[-0-9]/.test(c)) return numero();
    for (const literal of ["true", "false", "null"]) {
      if (texto.startsWith(literal, i)) {
        i += literal.length;
        return;
      }
    }
    if (c !== undefined && /[A-Za-z]/.test(c)) {
      const palavra = /^[A-Za-z_]+/.exec(texto.slice(i))?.[0] ?? c;
      return falha(`valor inválido "${palavra}": use true, false, null (minúsculas e sem aspas), um número ou um texto entre aspas duplas`);
    }
    return inesperado("um valor (texto entre aspas, número, true, false, null, { … } ou [ … ])");
  };

  const string = (): void => {
    const inicio = i;
    i++; // "
    while (i < texto.length) {
      const c = texto[i]!;
      if (c === '"') {
        i++;
        return;
      }
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === "\n" || c === "\r") return falha("quebra de linha dentro de um texto: feche as aspas na mesma linha (ou use \\n)");
      if (c < " ") return falha("caractere de controle (tab) dentro de um texto: troque por espaço");
      i++;
    }
    return falha("texto sem as aspas de fechamento", inicio);
  };

  const numero = (): void => {
    const casou = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(texto.slice(i));
    if (!casou) return falha("número inválido (use ponto para decimais e nada de zero à esquerda)");
    i += casou[0].length;
  };

  const objeto = (): void => {
    i++; // {
    espacos();
    if (texto[i] === "}") {
      i++;
      return;
    }
    for (;;) {
      espacos();
      if (texto[i] !== '"') {
        if (texto[i] === "}") return falha(VIRGULA_FINAL);
        return inesperado('o nome de um campo entre aspas duplas ("campo")');
      }
      string();
      espacos();
      if (texto[i] !== ":") return inesperado('":" depois do nome do campo');
      i++;
      valor();
      espacos();
      if (texto[i] === ",") {
        i++;
        continue;
      }
      if (texto[i] === "}") {
        i++;
        return;
      }
      if (texto[i] === '"' || texto[i] === "{" || texto[i] === "[") return falha("faltou uma vírgula entre dois campos");
      return inesperado('"," ou "}" depois do valor');
    }
  };

  const lista = (): void => {
    i++; // [
    espacos();
    if (texto[i] === "]") {
      i++;
      return;
    }
    for (;;) {
      espacos();
      if (texto[i] === "]") return falha(VIRGULA_FINAL);
      valor();
      espacos();
      if (texto[i] === ",") {
        i++;
        continue;
      }
      if (texto[i] === "]") {
        i++;
        return;
      }
      if (texto[i] === '"' || texto[i] === "{" || texto[i] === "[") return falha("faltou uma vírgula entre dois itens da lista");
      return inesperado('"," ou "]" depois do item');
    }
  };

  try {
    valor();
    espacos();
    if (i < texto.length) {
      if (texto[i] === ",") return { posicao: i, dica: VIRGULA_FINAL };
      inesperado("o fim do arquivo (tem algo depois da última })");
    }
    return null;
  } catch (error) {
    if (error instanceof Quebra) return { posicao: error.posicao, dica: error.dica };
    throw error;
  }
}

/** Linha e coluna (1…) de uma posição. */
export function linhaEColuna(texto: string, posicao: number): { linha: number; coluna: number } {
  const antes = texto.slice(0, posicao).split("\n");
  return { linha: antes.length, coluna: (antes.at(-1)?.length ?? 0) + 1 };
}

/** Mensagem do erro de sintaxe, em pt-BR, com a linha do arquivo e uma seta. */
export function mensagemDeJsonInvalido(texto: string, arquivo: string): string {
  const erro = localizarErroDeJson(texto) ?? { posicao: 0, dica: "conteúdo inválido" };
  // Vírgula sobrando: aponta a própria vírgula, que é o que precisa sair.
  let posicao = erro.posicao;
  if (erro.dica === VIRGULA_FINAL) {
    let j = posicao - 1;
    while (j >= 0 && /[ \t\r\n]/.test(texto[j]!)) j--;
    if (texto[j] === ",") posicao = j;
  }
  const { linha, coluna } = linhaEColuna(texto, posicao);
  const conteudo = (texto.split("\n")[linha - 1] ?? "").replace(/\t/g, " ").replace(/\r$/, "");
  return (
    `[dados] ${arquivo} não é um JSON válido (linha ${linha}, coluna ${coluna}): ${erro.dica}. ${AVISO}\n` +
    `    ${linha} | ${conteudo}\n` +
    `    ${" ".repeat(String(linha).length)} | ${" ".repeat(Math.max(0, coluna - 1))}^`
  );
}

/** JSON.parse com o erro de sintaxe em pt-BR (arquivo, linha, coluna e motivo). */
export function lerJsonDoDono(texto: string, arquivo: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error(mensagemDeJsonInvalido(texto, arquivo));
  }
}
