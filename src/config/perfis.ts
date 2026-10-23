/**
 * ============================================================================
 *  perfis.ts — PERFIS PÚBLICOS (BLUEPRINT §1.5, §4 e §5.8).
 *  O DADO MORA EM dados/dono.json › perfis.
 *  Decidido pelo dono: GitHub, LinkedIn e Medium com publicar = true.
 * ============================================================================
 *
 * PARA O DONO — o que preencher (em dados/dono.json, não aqui)
 *   As URLs já são fatos confirmados. Marque `publicar: true` SÓ depois de
 *   conferir que o perfil tem conteúdo público recente: um perfil vazio prova o
 *   contrário do que a seção quer provar.
 *
 * O QUE LIBERA (features.hasProfiles = pelo menos 1 publicado; features.profiles.<id>)
 *   - Seção "Confira antes de conversar" da Home (só os perfis publicados).
 *   - Bloco de perfis em /sobre (quando /sobre existir).
 *   - Linha "a Lemamon no GitHub" em /como-trabalhamos quando não há
 *     engenharia.ts preenchido (só com github publicado).
 *   O footer lista os três sempre (BLUEPRINT §8.5), porque são canais confirmados.
 *
 * O QUE QUEBRA O BUILD: URL sem https ou fora do domínio da rede
 *   (github.com, linkedin.com, medium.com).
 */

import { perfis as perfisJson } from "../../dados/dono.json";
import { comCamadaFicticia } from "./dono";

export const PROFILE_IDS = ["github", "linkedin", "medium"] as const;
export type ProfileId = (typeof PROFILE_IDS)[number];

export interface Perfil {
  url: string;
  publicar: boolean;
}

/** Domínio aceito para cada perfil (validado no build). */
export const PROFILE_HOSTS: Record<ProfileId, string> = {
  github: "github.com",
  linkedin: "linkedin.com",
  medium: "medium.com",
};

/** Como está em dados/dono.json (sem a camada fictícia). */
export const perfisReais: Record<ProfileId, Perfil> = perfisJson as unknown as Record<ProfileId, Perfil>;

/** O que o site usa (com a camada fictícia por cima, quando ligada fora de produção). */
export const perfis: Record<ProfileId, Perfil> = comCamadaFicticia("perfis", perfisReais);
