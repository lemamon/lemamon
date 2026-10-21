#!/usr/bin/env node
// Verifica os arquivos de copy em src/i18n (dono: shell):
//   1. pt.json, en.json e es.json são JSON válido;
//   2. paridade profunda: o mesmo conjunto de chaves em todos os níveis, o mesmo tipo
//      em cada chave e arrays com o mesmo tamanho;
//   3. placeholders ({nome}) iguais em cada texto nos 3 idiomas;
//   4. nenhum texto vazio fora de chaves de nota (prefixo _);
//   5. chaves duplicadas que precisam ser idênticas dentro de cada idioma (SAME);
//   6. no idioma-fonte (pt), frase repetida (40+ caracteres) em duas chaves
//      diferentes só existe se o grupo estiver em SAME (decisão registrada) ou em
//      PENDING (consolidação pedida a outro dono, backlog B290). Qualquer
//      repetição nova derruba a checagem. Em en/es, tradução que coincide em duas
//      chaves cujo texto em pt é diferente não conta: a fonte única é decidida em pt.
//
// Uso: node scripts/check-i18n.mjs   (sai com código 1 se houver erro)
// Também roda dentro do `yarn build` (antes do astro check) e do `yarn test`
// (tests/unit/i18n.test.ts importa checkI18n()).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "src", "i18n");
export const LANGS = ["pt", "en", "es"];

/** Tamanho mínimo de uma frase para contar como repetição (critério 6). */
export const DUPLICATE_MIN_LENGTH = 40;

/** Idioma-fonte: a fonte única de cada frase é decidida nele (critério 6). */
export const SOURCE_LANG = "pt";

/**
 * 5. Chaves que precisam ser idênticas dentro de cada idioma. Cada grupo é uma
 * DECISÃO registrada (i18n _notes.duplicated_keys, how_we_work._notes.you_get,
 * conversao._notes.privacy, pricing.ranges, BLUEPRINT):
 *  - CTA primário repetido nos cases e no post; progresso do modo foco; rótulo do seletor de idioma;
 *  - título da seção de investimento; erro de e-mail inválido (wizard, /contato, genérico);
 *  - "Você recebe" de cada etapa (linha do método = Como trabalhamos);
 *  - BLUEPRINT §6.1 e §8.5: o H1 da Home é a tagline do rodapé (a promessa do método);
 *  - BLUEPRINT §6.1 e §7.2: o eyebrow do hero é o eyebrow do /orcamento e a linha de público do cartão OG;
 *  - BLUEPRINT §6.2 #3 e §6.3 #3: o título do método na Home é a frase-síntese de "Por que nesta ordem" (B290);
 *  - a pergunta "o projeto vai parar no meio?" é a mesma no banco (sistemas web, aplicativos e integrações)
 *    e no MVP, que tem resposta própria (i18n faq._notes.wont_stall).
 */
export const SAME = [
  ["shared.cta.primary", "cases.case.cta_final.button", "blog.post.mid_cta.button"],
  ["quote.progress.label", "shared.focus_header.progress"],
  ["shared.language.selector_label", "shared.footer.language_label"],
  ["shared.investment.title", "pricing.ranges.title"],
  ["quote.contact_form.fields.email.error_invalid", "contact.form.fields.email.error_invalid", "shared.errors.invalid_email"],
  ...["diagnosis", "discovery", "development", "support"].map((s) => [
    `shared.method_timeline.stages.${s}.you_get`,
    `how_we_work.stage_${s}.you_get`,
  ]),
  ["home.hero.title", "shared.footer.tagline"],
  ["home.hero.eyebrow", "quote.entry.eyebrow", "meta.default_og_image_text.audience_line"],
  ["home.method.title", "how_we_work.why_this_order.highlight"],
  ["faq.items.wont_stall.question", "services.mvp.faq.wont_stall.question"],
  ["home.team.title", "about.team.title"],
];

/**
 * 6. Repetições que AINDA existem, mas já têm dono para consolidar numa chave só
 * (backlog B290). Não derrubam a checagem; aparecem como aviso. Quando o
 * consumidor passar a ler a chave canônica e o redator apagar a cópia nos 3
 * idiomas, o aviso de "pendência resolvida" pede para tirar o grupo daqui.
 */
export const PENDING = [
  // conversion: wizard e /contato passam a ler shared.errors.invalid_phone.
  ["quote.contact_form.fields.phone.error_invalid", "contact.form.fields.phone.error_invalid", "shared.errors.invalid_phone"],
  // pages: HwwAgreement.astro passa a ler shared.commitments.items.scope_price_closed.
  ["how_we_work.agreement.items.scope_price.title", "shared.commitments.items.scope_price_closed"],
  // conversion: pós-envio lê quote.entry.after_send.steps.feedback.
  ["quote.entry.after_send.steps.feedback", "quote.sent.steps.feedback"],
  // conversion: system_pain usa o helper de pain.
  ["quote.steps.pain.helper", "quote.steps.system_pain.helper"],
  // conversion: uma chave só para "Prefiro conversar sobre isso no diagnóstico".
  ["quote.steps.budget.options_tiers_mode.prefer_to_discuss", "quote.steps.budget.options_no_numbers_mode.prefer_to_discuss"],
];

const kind = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);
const isNote = (p) => p.split(/[.[\]]/).some((seg) => seg.startsWith("_"));

// Mapa caminho -> descrição (tipo e, para arrays, tamanho) de cada idioma
function flatten(node, path, map) {
  const k = kind(node);
  if (k === "array") {
    map.set(path, `array[${node.length}]`);
    node.forEach((v, i) => flatten(v, `${path}[${i}]`, map));
  } else if (k === "object") {
    map.set(path, "object");
    for (const key of Object.keys(node)) flatten(node[key], path ? `${path}.${key}` : key, map);
  } else {
    map.set(path, k);
  }
  return map;
}

const get = (obj, p) =>
  p.split(/\.|\[(\d+)\]/).filter((s) => s !== undefined && s !== "").reduce((a, k) => (a == null ? undefined : a[k]), obj);
const placeholders = (s) => [...s.matchAll(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g)].map((m) => m[1]).sort().join(",");

/** Lê os 3 arquivos de src/i18n. Erro de sintaxe vira mensagem, nunca exceção. */
export function readLocales(dir = DIR) {
  const data = {};
  const errors = [];
  for (const lang of LANGS) {
    try {
      data[lang] = JSON.parse(readFileSync(join(dir, `${lang}.json`), "utf8"));
    } catch (e) {
      errors.push(`${lang}.json: JSON inválido ou ilegível (${e.message})`);
    }
  }
  return { data, errors };
}

/**
 * Grupos de caminhos (sem notas) cujo texto, com DUPLICATE_MIN_LENGTH+
 * caracteres, se repete num idioma. Cada grupo vem ordenado.
 */
export function duplicateGroups(tree, minLength = DUPLICATE_MIN_LENGTH) {
  const byText = new Map();
  for (const [path, desc] of flatten(tree, "", new Map())) {
    if (desc !== "string" || isNote(path)) continue;
    const value = get(tree, path);
    if (typeof value !== "string" || value.trim().length < minLength) continue;
    const list = byText.get(value) ?? [];
    list.push(path);
    byText.set(value, list);
  }
  return [...byText.values()].filter((paths) => paths.length > 1).map((paths) => [...paths].sort());
}

/**
 * Roda todas as conferências. Devolve { errors, warnings, summary }; não sai do
 * processo (o modo CLI, no fim do arquivo, decide o código de saída).
 * `data` (opcional, para testes): os 3 idiomas já lidos, no lugar de src/i18n.
 * @param {{ data?: Record<string, any>, same?: string[][], pending?: string[][] }} [options]
 * @returns {{ errors: string[], warnings: string[], summary: string }}
 */
export function checkI18n({ data: given, same = SAME, pending = PENDING } = {}) {
  const { data, errors } = given ? { data: given, errors: [] } : readLocales();
  const warnings = [];
  const err = (msg) => errors.push(msg);
  if (errors.length) return { errors, warnings, summary: "" };

  const flat = Object.fromEntries(LANGS.map((l) => [l, flatten(data[l], "", new Map())]));

  // 2. Paridade profunda
  const allPaths = new Set(LANGS.flatMap((l) => [...flat[l].keys()]));
  for (const p of allPaths) {
    const desc = LANGS.map((l) => flat[l].get(p));
    if (desc.some((d) => d === undefined)) {
      const missing = LANGS.filter((_l, i) => desc[i] === undefined);
      err(`paridade: "${p || "(raiz)"}" ausente em ${missing.join(", ")}`);
    } else if (new Set(desc).size > 1) {
      err(`paridade: "${p}" com tipo/tamanho diferente: ${LANGS.map((l, i) => `${l}=${desc[i]}`).join(" ")}`);
    }
  }

  // 3 e 4. Placeholders e textos vazios
  let strings = 0;
  for (const [p, d] of flat.pt) {
    if (d !== "string") continue;
    strings++;
    if (isNote(p)) continue;
    const vals = LANGS.map((l) => get(data[l], p));
    if (vals.some((v) => typeof v !== "string")) continue; // já acusado na paridade
    vals.forEach((v, i) => {
      if (!v.trim()) err(`vazio: ${LANGS[i]}:${p}`);
    });
    const ph = vals.map(placeholders);
    if (new Set(ph).size > 1) err(`placeholders: "${p}" ${LANGS.map((l, i) => `${l}={${ph[i]}}`).join(" ")}`);
  }

  // 5. Chaves que precisam ser idênticas dentro de cada idioma
  for (const lang of LANGS) {
    for (const group of same) {
      const vals = group.map((p) => get(data[lang], p));
      vals.forEach((v, i) => {
        if (typeof v !== "string") err(`duplicadas: ${lang}:${group[i]} não existe ou não é texto`);
      });
      if (vals.every((v) => typeof v === "string") && new Set(vals).size > 1) {
        err(`duplicadas: ${lang}: ${group.join(" = ")} divergem:\n    ${group.map((p, i) => `${p}: ${vals[i]}`).join("\n    ")}`);
      }
    }
  }

  // 6. Frase repetida (no idioma-fonte) só com decisão (SAME) ou pendência registrada (PENDING)
  const covered = (groups, paths) => groups.some((group) => paths.every((path) => group.includes(path)));
  const seenPending = new Set();
  for (const lang of [SOURCE_LANG]) {
    for (const paths of duplicateGroups(data[lang])) {
      if (covered(same, paths)) continue;
      const pendingGroup = pending.find((group) => paths.every((path) => group.includes(path)));
      if (pendingGroup) {
        const id = pendingGroup.join(" = ");
        if (!seenPending.has(id)) warnings.push(`frase repetida aguardando consolidação (B290): ${id}`);
        seenPending.add(id);
        continue;
      }
      err(
        `repetição: ${lang}: a mesma frase em ${paths.join(" = ")}. Use uma chave só (o componente lê a canônica) ` +
          `ou, se a repetição for decisão do BLUEPRINT, registre o grupo em SAME (scripts/check-i18n.mjs) e em _notes.duplicated_keys.`,
      );
    }
  }
  for (const group of pending) {
    if (!seenPending.has(group.join(" = "))) {
      warnings.push(`pendência resolvida (B290): ${group.join(" = ")} não se repete mais; tire o grupo de PENDING`);
    }
  }

  const summary =
    `check-i18n: ok. ${LANGS.map((l) => `${l}.json`).join(", ")} válidos; ` +
    `${flat.pt.size} caminhos idênticos nos 3 idiomas (${strings} textos); ` +
    `placeholders, ${same.length} grupos de chaves duplicadas e repetições de ${DUPLICATE_MIN_LENGTH}+ caracteres conferidos.`;
  return { errors, warnings, summary };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const { errors, warnings, summary } = checkI18n();
  for (const warning of warnings) console.warn(`check-i18n: aviso: ${warning}`);
  if (errors.length) {
    console.error(`check-i18n: ${errors.length} erro(s)`);
    for (const e of errors) console.error(" - " + e);
    process.exit(1);
  }
  console.log(summary);
}
