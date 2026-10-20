/**
 * ============================================================================
 *  camada-ficticia.ts — REGRA da camada de DADOS FICTÍCIOS (dono: gated).
 *  Pura: sem I/O, sem ambiente. Segura para o cliente (a ilha a usa via dono.ts).
 * ============================================================================
 *
 * O site lê os dados do dono de dados/dono.json. Enquanto pessoas, CNPJ,
 * depoimentos etc. não chegam, dados/dono.ficticio.json + dados/ficticio/
 * (cases e posts MDX, imagens) podem ser ligados POR CIMA, para revisar o site
 * cheio. A regra é uma só (testada em tests/unit/dados-camada-ficticia.test.ts):
 *
 *   liga  ⇔  PUBLIC_DADOS_FICTICIOS = "true"  E  fora de produção
 *
 *   produção = CONTEXT=production no Netlify. No runtime do build, quem diz é
 *   isProductionDeploy() (src/config/site.ts); a integração
 *   src/integrations/dados-ficticios.ts aplica a mesma regra antes do build,
 *   com o CONTEXT do processo, e é ela que decide se o arquivo fictício entra
 *   no grafo de módulos. Em produção a camada é IGNORADA mesmo com a variável
 *   ligada, e o build registra um aviso.
 *
 * Ligada: faixa "Dados fictícios — não publicar" e
 * <meta name="robots" content="noindex,nofollow"> em TODAS as páginas.
 */

/** Nome da variável de ambiente que pede a camada. */
export const VARIAVEL_DADOS_FICTICIOS = "PUBLIC_DADOS_FICTICIOS";

/**
 * CNPJ da camada fictícia: inválido de propósito (todos os dígitos iguais),
 * para nunca coincidir com o de uma empresa real. Só é aceito na camada
 * fictícia; no dados/dono.json o build recusa.
 */
export const CNPJ_FICTICIO = "00.000.000/0000-00";

/** Conteúdo do robots com a camada ligada (todas as páginas). */
export const ROBOTS_FICTICIO = "noindex,nofollow";

/** Atributo da faixa de aviso (verify e testes procuram por ele). */
export const ATRIBUTO_FAIXA = "data-dados-ficticios";

/**
 * Classe da faixa. O estilo dela vai INLINE, dentro do ramo da camada ligada
 * (src/layouts/Base.astro): a classe e o CSS só existem num build fictício, e
 * os dois são marcadores que o caçador de vazamento procura sem a camada.
 */
export const CLASSE_FAIXA = "fictitious-banner";

/**
 * Pasta de saída de um build fictício local. dist/ é a pasta publicada pelo
 * Netlify (netlify.toml › publish): build com a camada ligada fora de deploy
 * preview/branch deploy nunca escreve lá (src/integrations/dados-ficticios.ts).
 */
export const PASTA_SAIDA_FICTICIA = "dist-ficticio";

/** Contextos do Netlify em que a camada pode ligar E escrever no dist/ publicado (nunca produção). */
export const CONTEXTOS_DE_PREVIEW: readonly string[] = ["deploy-preview", "branch-deploy"];

/** "true", "1", "sim" ou "yes" (sem diferenciar maiúsculas). Qualquer outra coisa é desligado. */
export function flagLigada(valor: unknown): boolean {
  if (typeof valor === "boolean") return valor;
  return typeof valor === "string" && /^(true|1|sim|yes)$/i.test(valor.trim());
}

export interface EntradaDaRegra {
  /** Valor de PUBLIC_DADOS_FICTICIOS (texto do ambiente ou booleano). */
  flag: unknown;
  /** Build de produção (CONTEXT=production). */
  producao: boolean;
}

export interface DecisaoDaCamada {
  /** A camada fictícia entra no site. */
  ativa: boolean;
  /** Pediram a camada num build de produção: ela fica de fora e o build avisa. */
  ignoradaEmProducao: boolean;
}

/** A regra única: flag ligada E fora de produção. */
export function decidirCamadaFicticia({ flag, producao }: EntradaDaRegra): DecisaoDaCamada {
  const pedida = flagLigada(flag);
  return { ativa: pedida && !producao, ignoradaEmProducao: pedida && producao };
}

const ehObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

/**
 * "Vazio" para a camada: null, undefined, texto em branco, lista vazia ou false.
 * Número nunca é vazio (0 é um valor). Objeto não é vazio: ele é mesclado campo a campo.
 */
export function estaVazio(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === false) return true;
  if (typeof valor === "string") return valor.trim() === "";
  if (Array.isArray(valor)) return valor.length === 0;
  return false;
}

/**
 * Mescla a camada fictícia POR CIMA do dado real, preenchendo SÓ as lacunas:
 *
 *  - objeto: campo a campo, recursivo (um texto por idioma também);
 *  - lista (time, depoimentos, logos, faixas...): atômica — a fictícia só entra
 *    se a real estiver vazia. Nunca mistura pessoa real com pessoa fictícia;
 *  - texto, booleano, null: o real vale; vazio ("", null, false) recebe o fictício;
 *  - número: o real vale sempre.
 *
 * O que o dono já preencheu de verdade sempre aparece. Não muta as entradas.
 * `$schema` (dica do editor) nunca é mesclado.
 */
export function mesclarFicticio<T>(real: T, ficticio: unknown): T {
  if (ficticio === undefined) return real;
  if (ehObjeto(real) && ehObjeto(ficticio)) {
    const saida: Record<string, unknown> = { ...real };
    for (const [chave, valor] of Object.entries(ficticio)) {
      if (chave === "$schema") continue;
      saida[chave] = chave in real ? mesclarFicticio(real[chave], valor) : valor;
    }
    return saida as T;
  }
  if (estaVazio(real) && !estaVazio(ficticio)) return structuredClone(ficticio) as T;
  return real;
}

/**
 * Identidade jurídica (empresa): razão social e CNPJ andam juntos, como as
 * listas. O par real só vale completo; incompleto, a camada entra com o par
 * fictício inteiro (campo ausente na camada fica vazio, nunca o real). Com o
 * par real completo, o dado de registro que aparece ao lado dele (ano de
 * fundação) também só vale o real. Um valor de exemplo ao lado do CNPJ real
 * (ou o contrário) seria um registro falso com dado verdadeiro, mesmo no preview.
 */
export const IDENTIDADE_JURIDICA = ["razaoSocial", "cnpj"] as const;

/** Dado de registro que a camada não preenche ao lado do par real. */
export const SO_COM_O_PAR_REAL = ["anoFundacao"] as const;

/** mesclarFicticio de uma seção do dono, com a regra da identidade jurídica em "empresa". */
export function mesclarSecaoFicticia<T>(secao: string, real: T, ficticio: unknown): T {
  const efetivo = mesclarFicticio(real, ficticio);
  if (secao !== "empresa" || !ehObjeto(real) || !ehObjeto(efetivo) || !ehObjeto(ficticio)) return efetivo;
  const saida: Record<string, unknown> = { ...efetivo };
  if (IDENTIDADE_JURIDICA.every((campo) => !estaVazio(real[campo]))) {
    for (const campo of SO_COM_O_PAR_REAL) saida[campo] = real[campo] ?? null;
    return saida as T;
  }
  for (const campo of IDENTIDADE_JURIDICA) saida[campo] = campo in ficticio ? ficticio[campo] : "";
  return saida as T;
}

/**
 * Texto que denuncia dado fictício num campo de IDENTIDADE (nome, razão social,
 * e-mail, URL, CNPJ). Não use em texto corrido: "por exemplo" é português comum.
 */
const PADRAO_FICTICIO = /\b(?:exemplo|ejemplo|example|fict[ií]ci[oa]s?|fictitious)\b|00\.?000\.?000\/?0000-?00/i;

export function pareceFicticio(valor: unknown): boolean {
  return typeof valor === "string" && PADRAO_FICTICIO.test(valor);
}
