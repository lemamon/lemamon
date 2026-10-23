/**
 * Foco visível nos chips do índice de etapas de Como trabalhamos (dono: pages).
 *
 * B075 (WCAG 2.4.7 / 2.4.11): abaixo de 1024px o índice é uma fila de chips
 * com rolagem horizontal. O chip focado por teclado precisa entrar na área
 * visível da fila (focusin → scrollIntoView) e o respiro interno precisa caber
 * o anel inteiro (3px de largura + 2px de offset). Aqui: Tab por todos os
 * chips e, em cada um, o retângulo do chip inflado em 5px fica dentro do
 * retângulo do <ol> que rola.
 */
import { expect, test } from "./support/consent";

import { urlFor } from "../../src/config/routes";
import type { Locale } from "../../src/i18n/locales";

const LOCALES: Locale[] = ["pt", "en", "es"];
const CHIPS = '.stage-index[data-variant="chips"] .stage-index__link';
/** Anel de foco: --focus-ring-width (3px) + --focus-ring-offset (2px). */
const RING = 5;

for (const locale of LOCALES) {
  test(`${locale} how_we_work: cada chip focado mostra o anel inteiro dentro da fila`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "os chips só existem abaixo de 1024px");
    await page.goto(urlFor("how_we_work", locale));
    const chips = page.locator(CHIPS);
    await expect(chips).toHaveCount(4);
    const count = await chips.count();

    await chips.first().focus();
    for (let index = 0; index < count; index++) {
      if (index > 0) await page.keyboard.press("Tab");
      await expect(chips.nth(index)).toBeFocused();
      // scrollIntoView pode animar: espera a posição assentar.
      await expect
        .poll(
          () =>
            page.evaluate((ring) => {
              const chip = document.activeElement as HTMLElement;
              const list = chip.closest(".stage-index__list") as HTMLElement;
              const a = chip.getBoundingClientRect();
              const b = list.getBoundingClientRect();
              return (
                a.left - ring >= b.left - 0.5 &&
                a.right + ring <= b.right + 0.5 &&
                a.top - ring >= b.top - 0.5 &&
                a.bottom + ring <= b.bottom + 0.5 &&
                getComputedStyle(chip).outlineStyle !== "none"
              );
            }, RING),
          { message: `chip ${index + 1}` },
        )
        .toBe(true);
    }
  });
}
