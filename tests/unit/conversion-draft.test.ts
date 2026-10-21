/**
 * lib/draft.ts — rascunho do wizard (TTL 30 dias, try/catch, sem dado de
 * contato) e resumo do envio no sessionStorage (BLUEPRINT §7.1).
 */
import { describe, expect, it } from "vitest";

import {
  clearDraft,
  DRAFT_KEY,
  DRAFT_TTL_MS,
  parseDraft,
  parseSentSummary,
  parseStep,
  readDraft,
  readSentSummary,
  SENT_SUMMARY_KEY,
  writeDraft,
  writeSentSummary,
  type SentSummary,
} from "@/lib/draft";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

class BrokenStorage extends MemoryStorage {
  override getItem(): string | null {
    throw new Error("SecurityError");
  }
  override setItem(): void {
    throw new Error("QuotaExceeded");
  }
}

const base = {
  step: 3 as const,
  lang: "pt" as const,
  answers: { stage: "product_idea", build_type: ["mvp"] },
  attribution: { origem: "home-hero", gclid: "abc" },
};

describe("rascunho", () => {
  it("grava e lê com a chave v2", () => {
    const storage = new MemoryStorage();
    expect(writeDraft(base, storage, 1_000)).toBe(true);
    expect(DRAFT_KEY).toBe("lemamon:orcamento:v2");
    const draft = readDraft(storage, 2_000);
    expect(draft).toMatchObject({ v: 2, savedAt: 1_000, step: 3, answers: base.answers });
  });

  it("vencido (> 30 dias) é apagado ao ser lido", () => {
    const storage = new MemoryStorage();
    writeDraft(base, storage, 0);
    expect(readDraft(storage, DRAFT_TTL_MS + 1)).toBeNull();
    expect(storage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("corrompido ou de versão antiga é descartado", () => {
    expect(parseDraft("{nope")).toBeNull();
    expect(parseDraft(JSON.stringify({ ...base, v: 1, savedAt: Date.now() }))).toBeNull();
    expect(parseDraft(JSON.stringify({ ...base, v: 2, savedAt: Date.now(), step: "9" }))).toBeNull();
    expect(parseDraft(JSON.stringify({ ...base, v: 2, savedAt: Date.now(), answers: { stage: 3 } }))).toBeNull();
  });

  it("data impossível (savedAt no futuro, ex.: 1e20) é descartada: o banner de retomada não quebra (B234)", () => {
    const now = 1_760_000_000_000;
    expect(parseDraft(JSON.stringify({ ...base, v: 2, savedAt: 1e20 }), now)).toBeNull();
    expect(parseDraft(JSON.stringify({ ...base, v: 2, savedAt: now + 2 * 24 * 3600 * 1000 }), now)).toBeNull();
    // Relógio um pouco adiantado continua valendo.
    expect(parseDraft(JSON.stringify({ ...base, v: 2, savedAt: now + 60_000 }), now)).not.toBeNull();
    // startedAt impossível some (o rascunho continua).
    expect(parseDraft(JSON.stringify({ ...base, v: 2, savedAt: now, startedAt: 1e20 }), now)?.startedAt).toBeUndefined();
    const storage = new MemoryStorage();
    storage.setItem(DRAFT_KEY, JSON.stringify({ ...base, v: 2, savedAt: 1e20 }));
    expect(readDraft(storage, now)).toBeNull();
    expect(storage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("sem storage (aba anônima, bloqueio): nada quebra", () => {
    const storage = new BrokenStorage();
    expect(writeDraft(base, storage)).toBe(false);
    expect(readDraft(storage)).toBeNull();
    expect(() => clearDraft(storage)).not.toThrow();
    expect(writeDraft(base, null)).toBe(false);
  });

  it("o formato não tem campo de contato (nome, e-mail, telefone, empresa, detalhes)", () => {
    const storage = new MemoryStorage();
    writeDraft(base, storage);
    const raw = storage.getItem(DRAFT_KEY) ?? "";
    expect(Object.keys(JSON.parse(raw)).sort()).toEqual(["answers", "attribution", "lang", "savedAt", "step", "v"]);
  });

  it("?etapa= aceita 1…6, resumo e contato", () => {
    expect(parseStep("1")).toBe(1);
    expect(parseStep("6")).toBe(6);
    expect(parseStep("resumo")).toBe("resumo");
    expect(parseStep("contato")).toBe("contato");
    expect(parseStep("7")).toBeNull();
    expect(parseStep("0")).toBeNull();
    expect(parseStep(null)).toBeNull();
  });
});

describe("resumo do envio (sessionStorage)", () => {
  const summary: SentSummary = {
    v: 1,
    protocol: "LEM-20261019-ABCD",
    lang: "pt",
    firstName: "Ana",
    channel: "whatsapp",
    channelContact: "(48) 99999-8888",
    role: "i_decide",
    deadlineUrgent: false,
    services: ["mvp"],
    lines: [{ label: "Momento", value: "Ideia de produto" }],
    contacts: ["Ana Souza", "ana@x.com"],
    measured: true,
  };

  it("ida e volta", () => {
    const storage = new MemoryStorage();
    expect(writeSentSummary(summary, storage)).toBe(true);
    expect(storage.getItem(SENT_SUMMARY_KEY)).not.toBeNull();
    expect(readSentSummary(storage)).toEqual(summary);
  });

  it("measured só é true quando gravado true (resumo antigo ou adulterado não mede, B341)", () => {
    const { measured: _measured, ...legacy } = summary;
    expect(parseSentSummary(JSON.stringify(legacy))?.measured).toBe(false);
    expect(parseSentSummary(JSON.stringify({ ...summary, measured: "true" }))?.measured).toBe(false);
    expect(parseSentSummary(JSON.stringify({ ...summary, measured: false }))?.measured).toBe(false);
    expect(parseSentSummary(JSON.stringify(summary))?.measured).toBe(true);
  });

  it("channelContact (F10): resumo antigo, sem o campo, vira \"\" (o pós-envio fica com o texto genérico)", () => {
    const { channelContact: _contact, ...legacy } = summary;
    expect(parseSentSummary(JSON.stringify(legacy))?.channelContact).toBe("");
    expect(parseSentSummary(JSON.stringify({ ...summary, channelContact: 42 }))?.channelContact).toBe("");
    expect(parseSentSummary(JSON.stringify(summary))?.channelContact).toBe("(48) 99999-8888");
  });

  it("formato inválido vira null (a página cai na versão genérica)", () => {
    expect(parseSentSummary(JSON.stringify({ ...summary, channel: "fax" }))).toBeNull();
    expect(parseSentSummary("[]")).toBeNull();
    expect(readSentSummary(new BrokenStorage())).toBeNull();
  });
});
