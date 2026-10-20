/// <reference types="vitest/config" />
/**
 * Vitest com a config Vite do Astro (aliases @/, astro:content, JSON, .astro).
 * Testes unitários: src/**\/*.test.ts e tests/unit/**\/*.test.ts.
 * Fixtures (dados de teste que NUNCA vão ao ar): tests/fixtures/.
 *
 * Camada de dados fictícios: os testes rodam SEMPRE com o dado real do
 * dados/dono.json, mesmo com PUBLIC_DADOS_FICTICIOS=true no .env.local (a
 * variável do processo tem prioridade sobre os arquivos .env). A camada é
 * testada pelas funções puras e pelos builds do globalSetup.
 *
 * globalSetup (tests/unit/support/builds-dos-dados.ts) faz 12 builds antes dos
 * testes (~3 s cada), em node_modules/.cache/lemamon-testes/: com e sem a
 * camada na raiz real, e, em raízes de teste com o dono.json trocado, produção
 * com a flag (empresa/privacidade vazias: falha na trava; preenchidas: passa e
 * sai byte a byte igual à produção sem a flag), um build local com a flag sem
 * --outDir (vai para dist-ficticio/) e 6 ATAQUES (url() de CSS, new URL(),
 * leitura por fs, falha no prerender, cópias no projeto, outDir por link
 * simbólico), que têm de cair sem deixar dist/ para trás. O teste de
 * vazamento varre o dist/ sem a camada atrás de qualquer marcador fictício e
 * de imagem fictícia, idêntica, alterada ou recodificada. Os builds usam o
 * número de WhatsApp de TESTE do E2E, nunca o do .env.local.
 */
import { getViteConfig } from "astro/config";

process.env.PUBLIC_DADOS_FICTICIOS = "false";
// Os builds do globalSetup que SIMULAM produção (CONTEXT=production) usam o
// número de WhatsApp de TESTE do E2E; o verify-build o recusa em produção
// (backlog B007), exceto com esta variável, que só existe aqui. Nunca a crie no Netlify.
process.env.LEMAMON_TESTE_PRODUCAO_SIMULADA = "1";

export default getViteConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", "dist-e2e/**", "dist-ficticio/**", "tests/e2e/**"],
    environment: "node",
    globalSetup: ["tests/unit/support/builds-dos-dados.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/env.d.ts"],
    },
  },
});
