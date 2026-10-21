/**
 * Riscos da Home (BLUEPRINT §6.1 #5) — a resposta de cada par. Dono: home.
 *
 * `vendor_disappears` ("O fornecedor que some…") troca para
 * answer_with_code_ownership quando o dono aprovou o rascunho answer_draft de
 * confirmacoes.codigoProprietario ("o código é da sua empresa, por contrato";
 * auditoria de conversão F01). Com answer_draft_alt (a propriedade passa
 * conforme os pagamentos) ou sem a flag, fica a resposta padrão. A HomeRisks e
 * o plano de termos da HomeView (1ª menção, §5.9) leem daqui, para os dois
 * verem o mesmo texto.
 *
 * Seguro para testes: só o i18n e configs puros.
 */
import { confirmacoes, type Confirmacoes } from "@/config/confirmacoes";
import type { Features } from "@/config/features";
import { getSection, hasText, tDynamic, type Locale } from "@/i18n";

/** Resposta visível de cada par, por id, na ordem do i18n. */
export function riskAnswers(
  locale: Locale,
  features: Pick<Features, "confirm">,
  codeChoice: Confirmacoes["codigoProprietario"] = confirmacoes.codigoProprietario,
): Record<string, string> {
  const pairs = getSection(locale, "home.risks.pairs");
  const withCode = features.confirm.codigoProprietario && codeChoice === "answer_draft";
  return Object.fromEntries(
    Object.entries(pairs).map(([id, pair]) => {
      const key = `home.risks.pairs.${id}.answer_with_code_ownership`;
      return [id, withCode && hasText(locale, key) ? tDynamic(locale, key) : pair.answer];
    }),
  );
}
