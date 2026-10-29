/**
 * ============================================================================
 *  dono.ts — de onde vêm os DADOS DO DONO (dono: gated). Seguro para o cliente.
 * ============================================================================
 *
 * Fonte única: dados/dono.json (o dono edita SÓ esse arquivo; o editor
 * autocompleta pelo dados/dono.schema.json). Cada src/config/<seção>.ts lê a
 * sua seção de lá, mantém os mesmos exports e tipos de antes e passa por
 * comCamadaFicticia(). A validação Zod (mensagens em pt-BR) fica em
 * src/config/validate.ts e roda no build (getFeatures e loaders das coleções).
 *
 * Camada fictícia (ver camada-ficticia.ts): com PUBLIC_DADOS_FICTICIOS=true e
 * fora de produção, dados/dono.ficticio.json preenche o que está VAZIO no
 * dono.json. A integração src/integrations/dados-ficticios.ts decide antes do
 * build se o arquivo fictício entra no grafo de módulos (em produção ele nem é
 * lido: o módulo virtual sai vazio). Aqui a mesma regra é conferida de novo com
 * isProductionDeploy() — as duas travas precisam concordar para a camada ligar.
 *
 * O módulo virtual só carrega dado quando a camada está ativa; com ela
 * desligada, nada fictício chega a nenhum bundle (tests/unit/dados-vazamento.test.ts).
 */

import { ATIVO as CAMADA_NO_BUILD, secoes as secoesFicticias } from "virtual:lemamon/dados-ficticios";

import { decidirCamadaFicticia, mesclarSecaoFicticia } from "./camada-ficticia";
import { isProductionDeploy } from "./site";

/** Seções de dados/dono.json (mesma ordem do arquivo). */
export const SECOES_DONO = [
  "empresa",
  "privacidade",
  "time",
  "perfis",
  "confirmacoes",
  "qualificacao",
  "precos",
  "agenda",
  "descoberta",
  "sustentacao",
  "engenharia",
  "depoimentos",
  "logos",
] as const;
export type SecaoDono = (typeof SECOES_DONO)[number];

/** Seções que viram coleções de conteúdo (src/content.config.ts). */
export const SECOES_COLECAO = ["time", "depoimentos", "logos"] as const;
export type SecaoColecao = (typeof SECOES_COLECAO)[number];

/**
 * Caminho do arquivo do dono, relativo à raiz do projeto. Os caminhos da camada
 * fictícia ficam SÓ em src/content/loaders.ts e src/integrations/dados-ficticios.ts,
 * os dois únicos lugares que leem a camada (por fs, nunca por import).
 */
export const ARQUIVO_DONO = "dados/dono.json";

/**
 * A camada fictícia está ligada NESTE build? true só com as duas travas: a
 * integração (antes do build, pelo CONTEXT) e o runtime (isProductionDeploy()).
 */
export const MODO_FICTICIO: boolean =
  CAMADA_NO_BUILD &&
  decidirCamadaFicticia({ flag: import.meta.env.PUBLIC_DADOS_FICTICIOS, producao: isProductionDeploy() }).ativa;

/** Seção como fica no site: o real do dono.json, com a camada fictícia por cima quando ligada. */
export function comCamadaFicticia<T>(secao: SecaoDono, real: T): T {
  if (!MODO_FICTICIO) return real;
  return mesclarSecaoFicticia(secao, real, (secoesFicticias as Readonly<Record<string, unknown>>)[secao]);
}
