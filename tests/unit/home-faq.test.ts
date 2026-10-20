/**
 * FAQ da Home (BLUEPRINT §6.1 #13, backlog B039) — components/home/home-faq.ts.
 * Dono: home.
 *  - sem flag do dono: as 7 do banco, na ordem do BLUEPRINT;
 *  - com TODAS as condicionais ligadas (12 perguntas): o teto de 9 tira NF,
 *    NDA e "Como acompanho" (respondidas em /quanto-custa, /contato e na
 *    etapa 3 do método) e mantém "E depois que entra no ar?" e "Preciso
 *    entender de tecnologia?";
 *  - o FAQPage JSON-LD é exatamente a lista visível (pergunta e resposta);
 *  - a HomeView usa esta composição.
 */
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";

import {
  HOME_FAQ_BANK,
  HOME_FAQ_CONDITIONAL,
  HOME_FAQ_REMOVAL_ORDER,
  homeFaqItems,
} from "@/components/home/home-faq";
import Faq from "@/components/shared/Faq.astro";
import { answerText, FAQ_MAX, type FaqItem } from "@/components/shared/faq";
import { computeFeatures, getFeatures } from "@/config/features";
import { t, type Locale } from "@/i18n";
import HomeView from "@/views/HomeView.astro";

import { baseSources } from "../fixtures/features";
import { completeConfirmacoes, completeDescoberta, completeEmpresa } from "../fixtures/owner-data";

const LOCALES: Locale[] = ["pt", "en", "es"];
const owner = { confirmacoes: completeConfirmacoes(), descoberta: completeDescoberta() };
const empty = computeFeatures(baseSources());
const allFlags = computeFeatures(baseSources({ ...owner, empresa: completeEmpresa() }));
const ids = (items: FaqItem[]) => items.map((item) => item.id);

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

/** Texto visível de um trecho de HTML (tags fora, entidades e espaços normalizados). */
const visibleText = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

/** Perguntas e respostas como aparecem na tela, na ordem dos <details>. */
function visibleFaq(html: string) {
  return [...html.matchAll(/<details\b[^>]*data-faq-id="([^"]+)"[^>]*>([\s\S]*?)<\/details>/g)].map(([, id, body]) => ({
    id,
    question: visibleText(/<span class="faq__question"[^>]*>([\s\S]*?)<\/span>/.exec(body ?? "")?.[1] ?? ""),
    answer: visibleText(/<div class="faq__answer"[^>]*>([\s\S]*?)<\/div>/.exec(body ?? "")?.[1] ?? ""),
  }));
}

function faqJsonLd(html: string) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    ([, json]) => JSON.parse(json ?? "{}") as { "@type"?: string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] },
  );
  const faq = blocks.filter((block) => block["@type"] === "FAQPage");
  expect(faq).toHaveLength(1);
  return (faq[0]?.mainEntity ?? []).map((entry) => ({ question: entry.name, answer: entry.acceptedAnswer.text }));
}

describe("FAQ da Home — composição (B039)", () => {
  it("sem flag do dono: as 7 perguntas do banco, na ordem do BLUEPRINT §6.1 #13", () => {
    for (const locale of LOCALES) {
      expect(ids(homeFaqItems(locale, { features: empty }))).toEqual([...HOME_FAQ_BANK]);
    }
  });

  it("com todas as condicionais: 9 perguntas, sem NF/NDA/acompanhamento, com 'depois do ar' e 'preciso entender de tecnologia'", () => {
    expect(HOME_FAQ_BANK.length + HOME_FAQ_CONDITIONAL.length).toBe(12);
    for (const locale of LOCALES) {
      const items = homeFaqItems(locale, { features: allFlags, sources: owner });
      expect(items, locale).toHaveLength(FAQ_MAX);
      expect(ids(items), locale).toEqual([
        "how_much",
        "how_long",
        "why_discovery_paid",
        "diagnosis_commitment",
        "need_tech_knowledge",
        "after_launch",
        "scope_change",
        "code_ownership",
        "other_cities",
      ]);
      for (const removed of ["invoice", "nda", "how_follow_progress"]) expect(ids(items), locale).not.toContain(removed);
    }
  });

  it("a ordem de remoção só tira o necessário: com 10 perguntas sai só a NF", () => {
    const tenFlags = computeFeatures(
      baseSources({
        ...owner,
        confirmacoes: { ...owner.confirmacoes, outrasCidades: false, nda: false },
      }),
    );
    // banco 7 + scope_change, code_ownership, invoice = 10 → sai invoice
    const items = homeFaqItems("pt", { features: tenFlags, sources: owner });
    expect(items).toHaveLength(9);
    expect(ids(items)).not.toContain("invoice");
    expect(ids(items)).toContain("how_follow_progress");
    expect(HOME_FAQ_REMOVAL_ORDER[0]).toBe("invoice");
  });

  it("scope_change publica o texto aprovado pelo dono (decisão 5)", () => {
    const item = homeFaqItems("pt", { features: allFlags, sources: owner }).find((entry) => entry.id === "scope_change");
    expect(item?.answer).toBe(t("pt", "faq.conditional.scope_change.answer_draft"));
  });
});

describe("FAQ da Home — o JSON-LD é igual ao que está na tela", () => {
  it("com todas as condicionais (9 itens), nos 3 idiomas", async () => {
    for (const locale of LOCALES) {
      const items = homeFaqItems(locale, { features: allFlags, sources: owner });
      const html = await container.renderToString(Faq, { props: { locale, title: t(locale, "home.faq.title"), items } });
      const visible = visibleFaq(html);
      expect(visible.map((entry) => entry.id), locale).toEqual(ids(items));
      const ld = faqJsonLd(html);
      expect(ld, locale).toEqual(visible.map(({ question, answer }) => ({ question, answer })));
      expect(ld.map((entry) => entry.answer)).toEqual(items.map((item) => answerText(item)));
    }
  });

  it("a HomeView usa a composição da Home (dado real do repositório)", async () => {
    const features = await getFeatures();
    for (const locale of LOCALES) {
      const html = await container.renderToString(HomeView, { props: { locale } });
      const expected = homeFaqItems(locale, { features });
      expect(visibleFaq(html).map((entry) => entry.id), locale).toEqual(ids(expected));
      expect(faqJsonLd(html).map((entry) => entry.question), locale).toEqual(expected.map((item) => item.question));
    }
  });
});
