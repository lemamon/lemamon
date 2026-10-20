/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Só dígitos: 55 + DDD + número. Vazio = nenhum botão de WhatsApp. */
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
  /** Measurement ID do GA4 (G-XXXXXXXXXX). Vazio = sem GA4. */
  readonly PUBLIC_GA4_ID?: string;
  /**
   * "true" liga a camada de DADOS FICTÍCIOS (dados/dono.ficticio.json + dados/ficticio/)
   * por cima de dados/dono.json — só fora de produção (src/config/camada-ficticia.ts).
   */
  readonly PUBLIC_DADOS_FICTICIOS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Módulo virtual da camada fictícia (src/integrations/dados-ficticios.ts). */
declare module "virtual:lemamon/dados-ficticios" {
  /** A integração ligou a camada neste build (flag ligada e CONTEXT ≠ production). */
  export const ATIVO: boolean;
  /** Seções de dados/dono.ficticio.json quando ATIVO; objeto vazio quando não. */
  export const secoes: Readonly<Record<string, unknown>>;
}
