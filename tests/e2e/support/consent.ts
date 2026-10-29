/**
 * Base dos E2E que NÃO testam o aviso de cookies — dono: shell.
 *
 * Com dados/dono.json › privacidade.baseAnuncios = "consentimento" (decisão
 * D05), o aviso de cookies (ConsentBanner.astro) vai a TODA página e, preso ao
 * pé da tela (placement "fixed"), intercepta os cliques das outras telas
 * enquanto não há escolha salva. Estes testes não são sobre o aviso, então ele
 * é dispensado ANTES de qualquer script da página: um addInitScript grava a
 * escolha "aceito" em localStorage[CONSENT_KEY] e src/scripts/consent.ts nasce
 * com o aviso escondido (sem carregar nada de terceiros fora de produção).
 *
 * Só isso é pré-setado — nenhum outro valor — para não esconder regressão real.
 *
 * O `test` exportado daqui dispensa o aviso na fixture `context` (vale para o
 * `page` padrão e para `context.newPage()`). Contextos criados à mão com
 * `browser.newContext()` ficam FORA da fixture: nesses, chame `dismissConsent`
 * logo depois de criar o contexto, antes do primeiro `goto`.
 *
 * O único spec que importa `test`/`expect` do @playwright/test direto é o
 * tests/e2e/shell-consent.spec.ts, que testa o próprio aviso a partir do estado
 * limpo. Todos os outros importam daqui.
 */
import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

import { CONSENT_ACCEPTED, CONSENT_KEY } from "../../../src/scripts/storage-keys";

/** Grava a escolha "aceito" antes de qualquer script, em toda navegação do escopo. */
export async function dismissConsent(scope: Page | BrowserContext): Promise<void> {
  await scope.addInitScript(
    ([key, value]) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Sem storage (modo privado etc.): o aviso pode aparecer, mas nada quebra.
      }
    },
    [CONSENT_KEY, CONSENT_ACCEPTED] as const,
  );
}

export const test = base.extend({
  context: async ({ context }, use) => {
    await dismissConsent(context);
    await use(context);
  },
});

export { expect };
export { devices } from "@playwright/test";
export type { APIRequestContext, Browser, BrowserContext, Page, Route } from "@playwright/test";
