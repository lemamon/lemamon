/**
 * Fixtures de gate (dono: gated). NUNCA são publicadas: ficam fora de
 * src/content e de dados/ e só entram em computeFeatures() nos testes.
 *
 *  - baseSources(): TUDO VAZIO (como o dados/dono.json antes das decisões do
 *    dono). É o ponto de partida dos testes de gate: cada teste liga só o que
 *    quer provar.
 *  - realSources(): o dados/dono.json de hoje (sem a camada fictícia), para os
 *    testes do "estado do repositório".
 */
import { CONFIG_SOURCES_REAIS, EMPTY_CONTENT, type FeatureSources } from "@/config/features";
import type { Localized } from "@/config/types";

export const text = (value: string): Localized => ({ pt: value, en: value, es: value });

/** Configs vazios: nenhuma flag when_data ligada. */
export function emptyConfigs(): Omit<FeatureSources, "content" | "env"> {
  return {
    precos: {
      descoberta: null,
      desenvolvimento: { sistemas: null, aplicativos: null, integracoes: null, mvp: null },
      sustentacao: null,
    },
    qualificacao: { moeda: "", faixas: [], faixasMensais: [], corteMql: null, corteMqlMensal: null, scoreD: { ativo: false } },
    confirmacoes: {
      escopoMudanca: false,
      codigoProprietario: false,
      notaFiscal: false,
      outrasCidades: false,
      nda: false,
      sistemaTerceiros: false,
      semDescoberta: false,
      duracaoDescoberta: false,
      planoDoCliente: false,
      descobertaAbatida: false,
      descobertaUnicoCusto: false,
      migracaoDados: false,
      ligacao: false,
      valoresNoDiagnostico: false,
      timeDoCliente: false,
      scoreDRecebeDiagnostico: false,
      devolutivaConteudo: null,
      formatoDiagnostico: null,
      pagamento: null,
    },
    perfis: {
      github: { url: "https://github.com/lemamon-dev", publicar: false },
      linkedin: { url: "https://www.linkedin.com/in/lemamon-dev", publicar: false },
      medium: { url: "https://medium.com/@lemamon.dev", publicar: false },
    },
    agenda: { url: "" },
    empresa: {
      email: "lemamon.dev@gmail.com",
      razaoSocial: "",
      cnpj: "",
      anoFundacao: null,
      responsavel: "",
      apresentacao: null,
      historia: null,
    },
    descoberta: { formato: null, participantes: null, ritmo: null, duracao: null },
    sustentacao: { inclui: null, contratacao: null, canais: null, urgencias: null },
    engenharia: {
      tests: null,
      ci_cd: null,
      code_review: null,
      repository: null,
      documentation: null,
      handover: null,
      people: null,
      security: null,
    },
  };
}

/** Configs vazios + conteúdo vazio + ambiente vazio. */
export function baseSources(overrides: Partial<FeatureSources> = {}): FeatureSources {
  return {
    ...emptyConfigs(),
    content: EMPTY_CONTENT,
    env: { whatsappNumber: "", ga4Id: "" },
    ...overrides,
  };
}

/** dados/dono.json de hoje (sem a camada fictícia) + conteúdo vazio + ambiente vazio. */
export function realSources(overrides: Partial<FeatureSources> = {}): FeatureSources {
  return {
    ...structuredClone(CONFIG_SOURCES_REAIS),
    content: EMPTY_CONTENT,
    env: { whatsappNumber: "", ga4Id: "" },
    ...overrides,
  };
}
