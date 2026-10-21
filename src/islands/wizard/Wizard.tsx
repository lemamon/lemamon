/**
 * Ilha React do wizard — BLUEPRINT §7 inteiro. Dono: conversion.
 * Única ilha React do site (client:load em /orcamento ×3).
 *
 * Regras do contrato (CONTRACT.md §10):
 *  - Textos chegam RESOLVIDOS por props (WizardCopy, montado no servidor com
 *    getSection). A ilha nunca importa @/i18n (só tipos), @/config/features nem
 *    @/lib/whatsapp-messages.
 *  - Faixas de orçamento e de preço: import direto de config/qualificacao e
 *    config/precos (bundle do cliente), NUNCA por props.
 *  - A raiz leva data-nr-block (fora do session replay do New Relic).
 *
 * Mecânica (§7.1–§7.2):
 *  - Passo em ?etapa= (1…6, resumo, contato) com history.pushState; o voltar do
 *    navegador funciona (popstate) e um passo sem as respostas anteriores manda
 *    para a primeira pendente.
 *  - Uma pergunta por tela, fieldset + legend (o título é um H2 dentro da
 *    legend), inputs nativos, opções ≥ 56px, seleção com ícone + borda + peso,
 *    sem avanço automático, "Continuar" sempre habilitado com erro inline.
 *  - Rascunho em localStorage (lib/draft.ts) a cada mudança; apagado só depois
 *    do sucesso confirmado. Banner de retomada acima do H1 (portal).
 *  - Progresso "Pergunta N de 6" desenhado no alvo [data-wizard-progress] do
 *    WizardHeader (portal), com a barra sobre 8 passos (perguntas, resumo e
 *    contato; 100% só depois do envio, auditoria F21); o modo foco esconde a
 *    casca estática via html[data-wizard-mode="focus"].
 *  - aria-live anuncia passo, envio e erro; o foco vai para o título de cada tela.
 *  - Mobile: a barra fixa é do primário (~70–100%). "Pular" (P3) e "Revisar
 *    respostas" (resumo) ficam no fluxo; no contato, "Voltar" sai da barra.
 *    Desktop (≥ 768px, tela com altura útil): a barra gruda no rodapé
 *    (sticky), e o Continuar das P2–P5 não fica abaixo da dobra (F04).
 *    A altura medida da barra vira --wizard-bar-height e o html ganha
 *    scroll-padding-block-end: foco por Tab e o campo inválido nunca ficam
 *    atrás dela (backlog B165, B193, B270). Erro e aviso da pergunta também
 *    aparecem na nota da barra (F05).
 *  - Trava de entrada de tela (F06, F21): o clique de ponteiro que chega logo
 *    depois de trocar de tela é o 2º de um duplo clique e é ignorado (teclado
 *    nunca). No contato, envio sem nenhum campo tocado só leva ao "Nome".
 *  - Falha de render: WizardBoundary (backlog B234).
 *  - Resumo (§7.4, auditoria F02): primeiro o que é do visitante (linha "Para:",
 *    fatores de prazo e preço, pauta, preço e o CTA), depois o eco compacto
 *    das respostas e o método compacto (etapa 1 e a realçada; as 4 num
 *    <details>). Com cases publicados (when_data), até 2 do mesmo tipo que o
 *    pedido, entre a pauta e "E o preço?" (backlog B379); sem case
 *    compatível, nada.
 *  - Medição (§7.11 + backlog): wizard_view, wizard_start (uma vez por página),
 *    wizard_restart, wizard_blocked, wizard_abandon/wizard_return,
 *    wizard_summary_factors_view (F02), eventos de campo, e
 *    lead_attempt/lead_submitted/lead_failed com o mesmo event_id (= código do
 *    pedido). Nenhum evento antes do lead_submitted leva valor de resposta.
 */
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { getPriceLine, PRICE_LINE_LABEL, precos, type PriceLineId } from "../../config/precos";
import { qualificacao } from "../../config/qualificacao";
import { serviceFromParam, type ServiceKey } from "../../config/routes";
import { LOCALE_META, type Locale } from "../../i18n/locales";
import {
  createOnce,
  entrySource,
  flushPendingEvents,
  readCampaign,
  readSessionTouch,
  reportAdsConversion,
  track,
  trackWhenOnline,
} from "../../lib/analytics";
import {
  clearDraft,
  parseStep,
  readDraft,
  writeDraft,
  writeSentSummary,
  type ContactChannel,
  type Draft,
} from "../../lib/draft";
import {
  formatPhone,
  generateProtocol,
  HONEYPOT_FIELD,
  isFilled,
  previewSubmitActive,
  SLOW_SUBMIT_MS,
  submitNetlifyForm,
  suggestEmail,
} from "../../lib/forms";
import { fillTemplate, hasWhatsapp, openWhatsapp, whatsappHref } from "../../lib/whatsapp";
import { watchAbandon, type AbandonState, type AbandonWatcher } from "./abandon";
import type { WizardCopy } from "./copy";
import {
  buildAttribution,
  buildBriefingFields,
  buildSentSummary,
  gclidAllowed,
  leadEventParams,
  phoneRequired,
  validateContact,
  type ContactErrorKey,
  type ContactField,
  type ContactValues,
} from "./lead";
import { failureCopyText, failureWhatsappMessage, summaryWhatsappMessage } from "./messages";
import {
  allowedScreen,
  answerOf,
  answersToRecord,
  blocksEntryClick,
  budgetSetFor,
  casesForAnswers,
  EXCLUSIVE_OPTION,
  firstIncompleteStep,
  hasPrefill,
  isAnswered,
  isLive,
  isOptional,
  MULTI_QUESTIONS,
  optionIds,
  prefillStep,
  previousScreen,
  progressValue,
  PROGRESS_STEPS,
  questionForStep,
  recordToAnswers,
  SERVICE_PREFILL,
  setAnswer,
  toggleOption,
  TOTAL_QUESTIONS,
  type Answers,
  type ModelFlags,
  type QuestionId,
  type Screen,
  type StepNumber,
} from "./model";
import {
  answerChips,
  deadlineNote,
  emphasisKey,
  forLineParts,
  highlightedStage,
  joinAnnouncement,
  optionLabel,
  priceBlock,
  summaryFactors,
  summaryTopics,
  type ChipContext,
} from "./rules";
import { classifyLead, scoreConfigFrom } from "./score";
import { WizardBoundary } from "./WizardBoundary";
import styles from "./Wizard.module.css";

declare global {
  interface Window {
    /** A ilha já está ouvindo os botões [data-wizard-start]. */
    __lemamonWizardReady?: boolean;
    /** Clique em "Começar" antes da hidratação (script inline da QuoteView). */
    __lemamonWizardQueued?: boolean;
  }
}

export interface WizardFlags extends ModelFlags {
  hasPricing: boolean;
  hasAgenda: boolean;
  hasWhatsapp: boolean;
  /** confirmacoes.ligacao: opção "Ligação" no canal de contato. */
  phoneCall: boolean;
  /** confirmacoes.semDescoberta (variantes "skip" do resumo). */
  semDescoberta: boolean;
  /** confirmacoes.valoresNoDiagnostico. */
  valoresNoDiagnostico: boolean;
  /** confirmacoes.nda (nota de NDA sob "Mais detalhes"). */
  nda: boolean;
}

export interface CaseRef {
  /** Nome curto do case (cliente ou setor), nunca o H1. */
  name: string;
  services: ServiceKey[];
  /** urlFor("case", locale, { slug }): o card do resumo (B379). */
  url: string;
  /** tipoDeSistema do case (ex.: "Sistema de gestão de fretes"), o título do card do resumo. */
  tipoDeSistema: string;
}

export interface WizardProps {
  locale: Locale;
  copy: WizardCopy;
  flags: WizardFlags;
  /** urlFor("quote_sent", locale). */
  sentUrl: string;
  /** urlFor("privacy", locale). */
  privacyUrl: string;
  /** Linhas completas de precos.ts (features.pricingLines): só ids, nunca valores. */
  pricingLines: PriceLineId[];
  /** services.{key}.page_name_in_sentence, para a linha de contexto do ?servico=. */
  servicePages: Record<ServiceKey, string>;
  /**
   * Cases publicados (when_data hasCases), para o ?ref= e para os cases do
   * mesmo tipo no resumo (B379). Vazio sem cases: o resumo não muda.
   */
  cases: Record<string, CaseRef>;
  /** E-mail público (config/empresa.ts). */
  email: string;
  /** urlFor("home", locale): "Voltar ao início" da tela de falha (B234). */
  homeUrl: string;
  /**
   * Deploy preview / branch deploy (backlog B277): o envio é de teste (sem
   * POST, sem conversão do Ads, sem lead_submitted) e o contato avisa.
   */
  previewSubmit?: boolean;
  /**
   * privacidade.baseAnuncios = "consentimento" (backlog B342): o gclid só vai
   * no envio se a pessoa aceitou o aviso de cookies (lead.ts gclidAllowed).
   */
  adsConsentRequired?: boolean;
  /** Slot: prova (depoimento ou logos, when_data) abaixo do envio no contato (B140). */
  contactProof?: ReactNode;
  /**
   * features.hasTestimonials || features.hasLogos. O slot chega à ilha mesmo
   * vazio (StaticHtml é sempre um elemento): sem isto, sairia um bloco vazio.
   */
  hasContactProof?: boolean;
  /** Slot: linha do método com a Descoberta realçada (MethodTimeline.astro). */
  timelineDiscovery?: ReactNode;
  /** Slot: linha do método com a sustentação realçada. */
  timelineSupport?: ReactNode;
}

type View = Screen | "intro";

const INITIAL_CONTACT: ContactValues = {
  name: "",
  email: "",
  channel: "whatsapp",
  phone: "",
  company: "",
  details: "",
  bot: "",
};

const CONTACT_ORDER: ContactField[] = ["name", "email", "channel", "phone"];

/** Campos do contato medidos por form_field_complete (B337): só o nome do campo. */
type TrackedField = ContactField | "company" | "details";

/** Até quantos caracteres um valor da linha "Para:" do resumo fica numa linha só (F02). */
const FOR_LINE_NO_WRAP_MAX = 24;

/** Campos de texto do contato (o canal já vem marcado): nenhum preenchido = envio "intocado" (F21). */
const TRACKED_FIELDS: readonly Exclude<TrackedField, "channel">[] = ["name", "email", "phone", "company", "details"];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Seta de "Ler o case" (o mesmo desenho de arrow-right do ui/Icon.astro). */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Divide "texto {token} texto" para pôr um elemento no lugar do token. */
function splitToken(template: string, token: string, node: ReactNode): ReactNode {
  const marker = `{${token}}`;
  const index = template.indexOf(marker);
  if (index < 0) return template;
  return (
    <>
      {template.slice(0, index)}
      {node}
      {template.slice(index + marker.length)}
    </>
  );
}

function localStore(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function urlForView(view: View): string {
  const url = new URL(window.location.href);
  if (view === "intro") url.searchParams.delete("etapa");
  else url.searchParams.set("etapa", String(view));
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Tela + texto da linha de contexto do ?servico= / ?ref= (§7.1). */
interface ContextLine {
  text: string;
  step: StepNumber;
}

function WizardFlow(props: WizardProps) {
  const { locale, copy, flags, sentUrl, privacyUrl, pricingLines, servicePages, cases, email, previewSubmit = false } = props;
  const uid = useId();
  const modelFlags = useMemo<ModelFlags>(
    () => ({ hasBudgetTiers: flags.hasBudgetTiers, hasMonthlyTiers: flags.hasMonthlyTiers }),
    [flags.hasBudgetTiers, flags.hasMonthlyTiers],
  );

  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const [protocol, setProtocol] = useState<string | undefined>();
  const [startedAt, setStartedAt] = useState<number | undefined>();
  const [started, setStarted] = useState(false);
  const [banner, setBanner] = useState<Draft | null>(null);
  const [editing, setEditing] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  /** "Você já marcou 3": aviso, não erro (não marca as opções como inválidas). */
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [context, setContext] = useState<{ text: string; step: StepNumber } | null>(null);
  const [contact, setContact] = useState<ContactValues>(INITIAL_CONTACT);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "slow" | "error">("idle");
  const [announcement, setAnnouncement] = useState("");
  const [copied, setCopied] = useState<"" | "answers" | "email">("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  /** Pedido de foco no 1º campo inválido, atendido DEPOIS do commit (B270). */
  const [focusRequest, setFocusRequest] = useState<{ field: ContactField; n: number } | null>(null);

  const answersRef = useRef<Answers>(answers);
  const historyRef = useRef<{ depth: number; stack: View[] }>({ depth: 0, stack: ["intro"] });
  const prefillRef = useRef<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorPanelRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | null>>>({});
  /** Bloco de cada campo (rótulo + input + ajuda + erro), para rolar inteiro para a área livre. */
  const fieldWrapRefs = useRef<Partial<Record<ContactField, HTMLElement | null>>>({});
  const originalTitle = useRef("");
  const doneRef = useRef(false);
  const sendingRef = useRef(false);
  const startRef = useRef<() => void>(() => undefined);
  /** A tela anterior era do modo foco (para devolver o foco ao "Começar"). */
  const wasFocusRef = useRef(false);
  /** wizard_start no máximo uma vez por carregamento de página (B331). */
  const startTrackedRef = useRef(false);
  /** Linha de contexto do ?servico=/?ref= desta visita; com rascunho, só entra no "Começar de novo" (B166). */
  const contextRef = useRef<ContextLine | null>(null);
  /** Início do wizard NESTA visita (time_in_wizard_ms do wizard_abandon). */
  const visitStartRef = useRef<number | undefined>(undefined);
  const abandonStateRef = useRef<Omit<AbandonState, "done">>({ view: "intro", started: false });
  const abandonRef = useRef<AbandonWatcher | null>(null);
  /** Eventos de campo uma vez por campo (e por tipo de erro). */
  const fieldOnceRef = useRef(createOnce());
  const barObserverRef = useRef<ResizeObserver | null>(null);
  /** Tela atual e quando ela abriu por ação da pessoa (trava de duplo clique, F06/F21). */
  const entryRef = useRef<{ view: View; at: number }>({ view: "intro", at: -Infinity });
  /** Bloco "O que influencia prazo e preço" do resumo (wizard_summary_factors_view, F02). */
  const factorsRef = useRef<HTMLDivElement>(null);

  const waEnabled = flags.hasWhatsapp && hasWhatsapp();
  const waBase = waEnabled ? whatsappHref() : null;

  const updateAnswers = useCallback((next: Answers) => {
    answersRef.current = next;
    setAnswers(next);
  }, []);

  /**
   * Mede a barra de ação (fixa abaixo de 768px; sticky no rodapé acima disso,
   * F04) e publica a altura em --wizard-bar-height no <html>: o
   * scroll-padding-block-end e o espaço reservado no fim da página usam o
   * valor real (com nota, safe-area e quebra de linha), não um número fixo
   * (B165, B193, B270). Com o teclado aberto a barra some, mas volta quando
   * ele fecha: a última medida fica, para o campo trazido à tela enquanto a
   * pessoa digita (o telefone e o erro dele, F16) não acabar atrás da barra.
   */
  const actionsRef = useCallback((node: HTMLDivElement | null) => {
    barObserverRef.current?.disconnect();
    barObserverRef.current = null;
    if (!node) return;
    const root = document.documentElement;
    const update = () => {
      const style = window.getComputedStyle(node);
      if (style.display === "none" && node.dataset.keyboard === "open") return;
      const pinned = style.position === "fixed" || style.position === "sticky";
      const height = pinned ? Math.ceil(node.getBoundingClientRect().height) : 0;
      root.style.setProperty("--wizard-bar-height", `${height}px`);
    };
    update();
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(update);
      observer.observe(node);
      barObserverRef.current = observer;
    }
  }, []);

  const tierLabel = useCallback(
    (set: "tiers" | "monthly", id: string) =>
      (set === "monthly" ? qualificacao.faixasMensais : qualificacao.faixas).find((tier) => tier.id === id)?.rotulo[locale],
    [locale],
  );
  const chipCtx = useMemo<ChipContext>(() => ({ ...modelFlags, tierLabel }), [modelFlags, tierLabel]);
  const chips = useMemo(() => answerChips(answers, copy, chipCtx), [answers, copy, chipCtx]);
  const summaryCtx = useMemo(
    () => ({ semDescoberta: flags.semDescoberta, valoresNoDiagnostico: flags.valoresNoDiagnostico, pricingLines }),
    [flags.semDescoberta, flags.valoresNoDiagnostico, pricingLines],
  );

  /* ---------------------------------------------------------------- *
   * Navegação (?etapa= + history)
   * ---------------------------------------------------------------- */

  const go = useCallback(
    (target: View, mode: "push" | "replace" = "push") => {
      const allowed: View = target === "intro" ? target : allowedScreen(target, answersRef.current, modelFlags);
      const history = historyRef.current;
      if (mode === "push") {
        history.depth += 1;
        history.stack = [...history.stack.slice(0, history.depth), allowed];
        window.history.pushState({ wizardDepth: history.depth }, "", urlForView(allowed));
      } else {
        history.stack[history.depth] = allowed;
        window.history.replaceState({ wizardDepth: history.depth }, "", urlForView(allowed));
      }
      // Toda troca de tela por ação da pessoa abre a janela da trava de duplo clique.
      entryRef.current = { view: allowed, at: performance.now() };
      setStepError(null);
      setLimitNotice(null);
      setView(allowed);
    },
    [modelFlags],
  );

  /**
   * Trava de entrada de tela (F06; no contato, também F21): na captura, antes
   * de qualquer handler, o clique de ponteiro que chega logo depois da troca
   * de tela é cancelado (preventDefault também impede o envio do form e a
   * marcação da opção pelo <label>). Enter e Espaço (detail 0) passam sempre.
   */
  const onEntryClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const entry = entryRef.current;
    if (!blocksEntryClick(event.detail, performance.now() - entry.at, entry.view)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const currentEntrySource = () =>
    entrySource({
      search: window.location.search,
      referrer: document.referrer,
      host: window.location.host,
      sessionTouch: readSessionTouch(),
    });

  /** wizard_start {origem, entry_source}: uma vez por carregamento (Começar → Voltar → Começar = 1). */
  const trackStart = () => {
    if (startTrackedRef.current) return;
    startTrackedRef.current = true;
    const origem = new URLSearchParams(window.location.search).get("origem");
    track("wizard_start", { ...(origem ? { origem: origem.slice(0, 120) } : {}), entry_source: currentEntrySource() });
  };

  const markVisit = () => {
    visitStartRef.current ??= Date.now();
  };

  const start = () => {
    setBanner(null);
    setStarted(true);
    setStartedAt((current) => current ?? Date.now());
    markVisit();
    trackStart();
    go(1);
  };
  startRef.current = start;

  const resume = () => {
    const draft = banner;
    setBanner(null);
    setStarted(true);
    markVisit();
    track("wizard_resume", {});
    go(draft ? draft.step : 1);
  };

  /** "Começar de novo": apaga o rascunho e aplica a pré-marcação e o contexto desta visita (B166). */
  const restart = () => {
    clearDraft();
    updateAnswers({ ...prefillRef.current });
    setContext(contextRef.current);
    setProtocol(undefined);
    setStartedAt(Date.now());
    setBanner(null);
    setStarted(true);
    markVisit();
    track("wizard_restart", {});
    go(1);
  };

  // Montagem: rascunho, atribuição, pré-marcação, passo pedido na URL.
  useEffect(() => {
    originalTitle.current = document.title;
    // Falha de envio guardada offline numa visita anterior desta aba (B340).
    void flushPendingEvents();
    const params = new URLSearchParams(window.location.search);
    const draft = readDraft();

    const base = buildAttribution({
      pathname: window.location.pathname,
      search: window.location.search,
      host: window.location.host,
      referrer: document.referrer,
      sessionTouch: readSessionTouch(),
    });
    if (draft) {
      // O rascunho guarda o primeiro toque do pedido; campanha nova na URL atual ganha.
      const campaign = readCampaign(window.location.search);
      const fresh: Record<string, string> = { ...campaign.utm };
      if (campaign.gclid) fresh.gclid = campaign.gclid;
      setAttribution({ ...base, ...draft.attribution, ...fresh });
    } else {
      setAttribution(base);
    }

    const service = serviceFromParam(params.get("servico"));
    const refSlug = params.get("ref") ?? "";
    const caseRef = refSlug && Object.hasOwn(cases, refSlug) ? cases[refSlug] : undefined;
    const prefillService = service ?? caseRef?.services[0] ?? null;
    prefillRef.current = prefillService ? { ...SERVICE_PREFILL[prefillService] } : {};
    const initial = draft ? recordToAnswers(draft.answers) : { ...prefillRef.current };
    answersRef.current = initial;
    setAnswers(initial);
    if (caseRef && prefillService) {
      contextRef.current = { text: fillTemplate(copy.contextCase, { case: caseRef.name }), step: prefillStep(prefillService) };
    } else if (service && servicePages[service]) {
      contextRef.current = {
        text: fillTemplate(copy.contextService, { servico_frase: servicePages[service] }),
        step: prefillStep(service),
      };
    }
    // Com rascunho, o ?servico= novo não sobrescreve as respostas: a linha "já
    // deixamos marcado…" só aparece se a marcação já estiver nelas (B166). Senão,
    // ela fica guardada para o "Começar de novo".
    if (contextRef.current && hasPrefill(initial, prefillRef.current)) setContext(contextRef.current);

    setProtocol(draft?.protocol);
    setStartedAt(draft?.startedAt);

    const requested = parseStep(params.get("etapa"));
    window.history.replaceState({ wizardDepth: 0 }, "", window.location.href);
    if (requested) {
      const target = allowedScreen(requested, initial, modelFlags);
      historyRef.current = { depth: 0, stack: [target] };
      if (target !== requested) window.history.replaceState({ wizardDepth: 0 }, "", urlForView(target));
      setStarted(true);
      setView(target);
      markVisit();
      if (draft) track("wizard_resume", {});
      else {
        setStartedAt(Date.now());
        trackStart();
      }
    } else {
      // Banner sempre que há rascunho válido (BLUEPRINT §6.7 #0), a mesma regra
      // do script do <head> (data-draft-step), que reserva o espaço do banner
      // antes da pintura: o H1 não pula quando ele aparece (B238).
      if (draft) setBanner(draft);
      // A entrada foi exibida (B330): uma vez por carregamento, nunca com ?etapa=.
      track("wizard_view", { entry_source: currentEntrySource(), has_draft: Boolean(draft) });
    }

    window.__lemamonWizardReady = true;
    setReady(true);
    if (window.__lemamonWizardQueued) {
      window.__lemamonWizardQueued = false;
      startRef.current();
    }

    const onClick = (event: MouseEvent) => {
      const element = event.target as Element | null;
      // Ida para o WhatsApp (header, entrada, resumo, erro): troca de canal, não abandono.
      if (element?.closest?.('a[href^="https://wa.me/"]')) abandonRef.current?.markHandoff();
      const trigger = element?.closest?.("[data-wizard-start]");
      if (!trigger) return;
      event.preventDefault();
      startRef.current();
    };
    document.addEventListener("click", onClick);
    const watcher = watchAbandon(() => ({ ...abandonStateRef.current, done: doneRef.current }));
    abandonRef.current = watcher;
    return () => {
      document.removeEventListener("click", onClick);
      watcher.stop();
      abandonRef.current = null;
      window.__lemamonWizardReady = false;
    };
    // Só na montagem: as props são estáticas (vêm do HTML).
  }, []);

  // Voltar/avançar do navegador.
  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      const state = event.state as { wizardDepth?: unknown } | null;
      const depth = typeof state?.wizardDepth === "number" ? state.wizardDepth : 0;
      historyRef.current.depth = depth;
      const requested = parseStep(new URLSearchParams(window.location.search).get("etapa"));
      setStepError(null);
      if (!requested) {
        historyRef.current.stack[depth] = "intro";
        setEditing(false);
        setView("intro");
        return;
      }
      const allowed = allowedScreen(requested, answersRef.current, modelFlags);
      if (allowed !== requested) window.history.replaceState({ wizardDepth: depth }, "", urlForView(allowed));
      historyRef.current.stack[depth] = allowed;
      // "Voltar" da ilha usa history.back(): o 2º clique do duplo clique cai aqui.
      entryRef.current = { view: allowed, at: performance.now() };
      if (allowed === "resumo" || allowed === "contato") setEditing(false);
      setView(allowed);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [modelFlags]);

  // Rascunho: grava a cada mudança depois do "Começar" (nunca depois do sucesso).
  useEffect(() => {
    if (!ready || !started || doneRef.current || view === "intro") return;
    writeDraft({ step: view, lang: locale, answers: answersToRecord(answers), attribution, protocol, startedAt });
  }, [ready, started, view, answers, attribution, protocol, startedAt, locale]);

  // Código do pedido nasce ao abrir o resumo (vai na mensagem de WhatsApp dele).
  useEffect(() => {
    if (view === "resumo" && !protocol) setProtocol(generateProtocol());
  }, [view, protocol]);

  // Resumo (F02): o bloco de fatores apareceu na tela (metade dele), uma vez
  // por abertura do resumo. Mede a ordem nova sem nenhum valor de resposta.
  useEffect(() => {
    if (!ready || view !== "resumo") return;
    const node = factorsRef.current;
    if (!node || typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        track("wizard_summary_factors_view", {});
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready, view]);

  // Teclado virtual aberto: a barra fixa do mobile some (§7.2).
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const onResize = () => setKeyboardOpen(window.innerHeight - viewport.height > 150);
    viewport.addEventListener("resize", onResize);
    return () => viewport.removeEventListener("resize", onResize);
  }, []);

  // Troca de tela: modo foco, título da aba, anúncio, evento e foco.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const help =
      document.querySelector<HTMLAnchorElement>("[data-wizard-help]") ??
      document.querySelector<HTMLAnchorElement>('a[data-source="wizard_header"]');
    if (help && !help.dataset.introHref) help.dataset.introHref = help.href;

    if (view === "intro") {
      delete root.dataset.wizardMode;
      if (originalTitle.current) document.title = originalTitle.current;
      if (help?.dataset.introHref) help.href = help.dataset.introHref;
      // Voltou da pergunta 1 para a entrada: o foco volta ao "Começar".
      if (wasFocusRef.current) document.querySelector<HTMLElement>("[data-wizard-start]")?.focus();
      wasFocusRef.current = false;
      return;
    }
    wasFocusRef.current = true;
    root.dataset.wizardMode = "focus";
    const focusHref = whatsappHref(copy.whatsapp.wizard_question);
    if (help && focusHref) help.href = focusHref;

    const total = TOTAL_QUESTIONS;
    if (typeof view === "number") {
      const question = questionForStep(view, answersRef.current);
      document.title = fillTemplate(copy.progress.document_title, { n: view, total });
      setAnnouncement(
        fillTemplate(copy.progress.live_announcement, {
          n: view,
          total,
          pergunta: questionText(question, answersRef.current).question,
        }),
      );
      track("wizard_step", { step: view, question_id: question });
    } else if (view === "resumo") {
      // O progresso também é anunciado no resumo e no contato (B012), e não só
      // o título: "Resumo. Este é o seu ponto de partida".
      document.title = copy.progress.summary_document_title;
      setAnnouncement(joinAnnouncement(copy.progress.summary_label, copy.summary.title));
      track("wizard_summary_view", {});
    } else {
      // "Último passo: seu contato. Como a gente fala com você?"
      document.title = copy.progress.contact_document_title;
      setAnnouncement(joinAnnouncement(copy.progress.contact_label, copy.contactForm.title));
      track("wizard_reach_form", {});
    }
    // O efeito roda depois do commit: o título da nova tela já está no DOM.
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
    // A pergunta anunciada é a do momento da troca; respostas mudam dentro da tela.
  }, [ready, view]);

  // Espaço do banner de retomada (B238): a casca reserva o lugar antes da
  // pintura quando há rascunho (html[data-draft-step]); aqui a ilha diz se o
  // banner ficou ("open") ou se o lugar some ("closed": rascunho recusado,
  // "Começar de novo", volta da P1 à entrada).
  useEffect(() => {
    if (!ready) return;
    const node = document.querySelector<HTMLElement>("[data-wizard-resume]");
    if (node) node.dataset.state = view === "intro" && banner && bannerDate(banner) ? "open" : "closed";
  }, [ready, banner, view]);

  // Voltar à entrada devolve o foco ao botão "Começar".
  // Erro de envio: o foco vai para o painel (título + saídas), depois do commit.
  useEffect(() => {
    if (submitState === "error") errorPanelRef.current?.focus();
  }, [submitState]);

  // Estado lido pelo wizard_abandon na saída da página (B051).
  useEffect(() => {
    abandonStateRef.current = {
      view,
      started,
      questionId: typeof view === "number" ? questionForStep(view, answers) : undefined,
      visitStartedAt: visitStartRef.current,
    };
  });

  // Campo inválido no envio (B270): foco no campo (também no clique de mouse) e o
  // bloco inteiro (rótulo, campo, ajuda e erro) na área livre entre o header e a
  // barra fixa (scroll-padding do html), depois que a mensagem já está no DOM.
  useEffect(() => {
    if (!focusRequest) return;
    const input = fieldRefs.current[focusRequest.field];
    const block = fieldWrapRefs.current[focusRequest.field] ?? input;
    input?.focus({ preventScroll: true });
    block?.scrollIntoView({ block: "nearest" });
  }, [focusRequest]);

  // Saindo do wizard (desmontagem), a variável da barra não fica para trás.
  useEffect(
    () => () => {
      barObserverRef.current?.disconnect();
      document.documentElement.style.removeProperty("--wizard-bar-height");
    },
    [],
  );

  /* ---------------------------------------------------------------- *
   * Textos por pergunta (variantes de i18n quote._notes.variants_live)
   * ---------------------------------------------------------------- */

  function questionText(question: QuestionId, current: Answers): { question: string; helper: string; extra?: string } {
    const steps = copy.steps;
    const live = isLive(current);
    switch (question) {
      case "stage":
        return { question: steps.stage.question, helper: steps.stage.helper };
      case "build_type":
        if (live) return { question: steps.build_type.question_live_variant, helper: steps.build_type.helper_live_variant };
        return {
          question: current.stage === "problem_unclear" ? steps.build_type.question_unclear_variant : steps.build_type.question,
          helper: steps.build_type.helper,
        };
      case "pain":
        return { question: steps.pain.question, helper: steps.pain.helper };
      case "system_pain":
        return { question: steps.system_pain.question, helper: steps.system_pain.helper };
      case "deadline":
        return { question: live ? steps.deadline.question_live_variant : steps.deadline.question, helper: steps.deadline.helper };
      case "budget": {
        const set = budgetSetFor(current, modelFlags);
        if (set === "monthly") return { question: steps.budget.question_tiers_monthly, helper: steps.budget.helper_tiers_monthly };
        if (set === "tiers") {
          return {
            question: steps.budget.question_tiers,
            helper: live ? steps.budget.helper_tiers_live_variant : steps.budget.helper_tiers,
            extra: current.stage === "maintain_live_system" ? steps.budget.helper_maintain_note : undefined,
          };
        }
        return {
          question: live ? steps.budget.question_no_numbers_live_variant : steps.budget.question_no_numbers,
          helper: steps.budget.helper_no_numbers,
        };
      }
      case "role":
        return { question: steps.role.question, helper: steps.role.helper };
    }
  }

  function validationText(question: QuestionId): string {
    const v = copy.validation;
    if (question === "build_type") {
      return isLive(answers) ? v.select_at_least_one_or_not_sure_live_variant : v.select_at_least_one_or_not_sure;
    }
    if (question === "budget" && budgetSetFor(answers, modelFlags) !== "no_numbers") return v.select_one_or_not_sure;
    return v.select_one;
  }

  function labelFor(question: QuestionId, id: string): string {
    if (question === "budget") {
      const set = budgetSetFor(answers, modelFlags);
      if (id.startsWith("tier_")) return tierLabel(set === "monthly" ? "monthly" : "tiers", id) ?? id;
      const map: Readonly<Record<string, string>> =
        set === "no_numbers" ? copy.steps.budget.options_no_numbers_mode : copy.steps.budget.options_tiers_mode;
      return map[id] ?? id;
    }
    return optionLabel(question, id, answers, copy, chipCtx, false);
  }

  /* ---------------------------------------------------------------- *
   * Ações das perguntas
   * ---------------------------------------------------------------- */

  const onSingle = (question: QuestionId, id: string) => {
    setStepError(null);
    updateAnswers(setAnswer(answersRef.current, question, id, modelFlags));
  };

  const onToggle = (question: QuestionId, id: string, checked: boolean) => {
    const current = answersRef.current;
    const value = answerOf(question, current, modelFlags);
    const order = optionIds(question, current, modelFlags);
    const result = toggleOption(question, Array.isArray(value) ? value : [], id, checked, order);
    if (result.blocked) {
      setLimitNotice(copy.validation.max_three);
      setAnnouncement(copy.validation.max_three);
      return;
    }
    setLimitNotice(null);
    setStepError(null);
    updateAnswers(setAnswer(current, question, result.next, modelFlags));
  };

  const advance = (from: StepNumber) => {
    if (editing) {
      const pending = firstIncompleteStep(answersRef.current, modelFlags);
      if (pending === null) {
        setEditing(false);
        go("resumo");
      } else {
        go(pending);
      }
      return;
    }
    go(from === TOTAL_QUESTIONS ? "resumo" : ((from + 1) as StepNumber));
  };

  const onContinue = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof view !== "number") return;
    const question = questionForStep(view, answersRef.current);
    const answered = isAnswered(question, answersRef.current, modelFlags);
    if (!answered && !isOptional(question)) {
      const message = validationText(question);
      setStepError(message);
      // A região role=status lê o erro mesmo quando o texto visível está na barra (F05).
      setAnnouncement(message);
      track("wizard_blocked", { step: view, question_id: question });
      firstOptionRef.current?.focus();
      return;
    }
    if (!answered) track("wizard_skip", { question_id: question });
    advance(view);
  };

  const onSkip = () => {
    if (typeof view !== "number") return;
    const question = questionForStep(view, answersRef.current);
    updateAnswers(setAnswer(answersRef.current, question, [], modelFlags));
    track("wizard_skip", { question_id: question });
    advance(view);
  };

  const onBack = () => {
    track("wizard_back", {});
    if (view === "intro") return;
    const target: View = editing && typeof view === "number" ? "resumo" : (previousScreen(view) ?? "intro");
    setEditing(false);
    const history = historyRef.current;
    if (history.depth > 0 && history.stack[history.depth - 1] === target) {
      window.history.back();
    } else {
      go(target, "replace");
    }
  };

  const onEdit = (step: StepNumber, question: QuestionId) => {
    track("wizard_answer_edit", { question_id: question });
    setEditing(true);
    go(step);
  };

  const onFixAnswers = () => {
    setEditing(false);
    go(1);
  };

  const openWa = (message: string, source: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    abandonRef.current?.markHandoff();
    track("whatsapp_click", { source });
    openWhatsapp(message);
  };

  /* ---------------------------------------------------------------- *
   * Contato e envio (§7.5–§7.6)
   * ---------------------------------------------------------------- */

  const contactErrors = useMemo(() => validateContact(contact, locale), [contact, locale]);
  const visibleError = (field: ContactField) => (touched[field] || showAllErrors ? contactErrors[field] : undefined);

  const setField = (field: keyof ContactValues, value: string) => {
    setContact((current) => ({ ...current, [field]: field === "phone" ? formatPhone(value, locale) : value }));
  };

  /** form_validation_error (B338): uma vez por campo e tipo de erro, sem o valor. */
  const trackFieldError = (field: ContactField, key: ContactErrorKey) => {
    const error = key === "error_invalid" ? "invalid" : "required";
    if (fieldOnceRef.current(`error:${field}:${error}`)) {
      track("form_validation_error", { form: "briefing", field_name: field, error });
    }
  };

  /** Blur de um campo do contato: marca como visitado e mede preenchimento (B337) e erro exibido (B338). */
  const onFieldBlur = (field: TrackedField) => {
    if (field !== "company" && field !== "details") setTouched((t) => ({ ...t, [field]: true }));
    if (isFilled(contact[field]) && fieldOnceRef.current(`complete:${field}`)) {
      track("form_field_complete", { form: "briefing", field_name: field });
    }
    if (field === "company" || field === "details") return;
    const error = validateContact(contact, locale)[field];
    if (error) trackFieldError(field, error);
  };

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current) return;
    // Envio sem nenhum campo tocado (F21): quase sempre o toque que sobrou do
    // botão do resumo, que tem o mesmo rótulo e quase a mesma posição. Só leva
    // ao "Nome", sem pintar os erros nem medir form_validation_error.
    const pristine =
      !Object.values(touched).some(Boolean) && TRACKED_FIELDS.every((field) => !isFilled(contact[field]));
    if (pristine) {
      setFocusRequest((current) => ({ field: "name", n: (current?.n ?? 0) + 1 }));
      return;
    }
    setShowAllErrors(true);
    const errors = validateContact(contact, locale);
    for (const field of CONTACT_ORDER) {
      const error = errors[field];
      if (error) trackFieldError(field, error);
    }
    const firstInvalid = CONTACT_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      setFocusRequest((current) => ({ field: firstInvalid, n: (current?.n ?? 0) + 1 }));
      return;
    }
    const pending = firstIncompleteStep(answersRef.current, modelFlags);
    if (pending !== null) {
      go(pending);
      return;
    }

    sendingRef.current = true;
    setSubmitState("sending");
    setAnnouncement(copy.contactForm.sending);
    const slowTimer = window.setTimeout(() => {
      setSubmitState("slow");
      setAnnouncement(copy.contactForm.sending_slow);
    }, SLOW_SUBMIT_MS);

    const code = protocol ?? generateProtocol();
    if (!protocol) setProtocol(code);
    const current = answersRef.current;
    const score = classifyLead(current, scoreConfigFrom(qualificacao));
    const fields = buildBriefingFields({
      answers: current,
      flags: modelFlags,
      chips,
      contact,
      score,
      protocol: code,
      lang: locale,
      attribution,
      // Modo consentimento: sem o aceite do aviso de cookies, o pedido sai sem gclid (B342).
      gclidAllowed: gclidAllowed(props.adsConsentRequired === true, localStore()),
    });
    // Deploy preview (B277): envio de teste, sem POST e sem nenhum evento de lead.
    const preview = previewSubmitActive(previewSubmit);
    // Tentativa antes do fetch (B339): event_id = código do pedido, o mesmo das
    // novas tentativas, do lead_submitted/lead_failed e do campo protocol.
    // Offline, o evento espera a conexão voltar (B340).
    if (!isFilled(contact.bot) && !preview) trackWhenOnline("lead_attempt", { event_id: code, form: "briefing" });
    const result = await submitNetlifyForm("briefing", fields, { startedAt, preview });
    window.clearTimeout(slowTimer);

    if (result.ok || result.reason === "spam") {
      // Sucesso confirmado (ou robô descartado em silêncio, sem medição). Envio
      // de teste em deploy preview: segue o fluxo, sem conversão nem lead (B277).
      const real = result.ok && !result.preview;
      // O POST passou: a conexão está provada, e uma falha guardada offline sai agora (B340).
      if (real) void flushPendingEvents({ reachable: true });
      const conversion = real ? reportAdsConversion(undefined, code) : Promise.resolve();
      if (real) track("lead_submitted", leadEventParams(current, modelFlags, score, { eventId: code, startedAt }));
      // measured: só o envio real dispara lead_success_view no pós-envio (B341).
      writeSentSummary(buildSentSummary({ answers: current, chips, contact, protocol: code, lang: locale, measured: real }, copy));
      doneRef.current = true;
      clearDraft();
      await conversion;
      window.location.assign(sentUrl);
      return;
    }

    sendingRef.current = false;
    setSubmitState("error");
    setAnnouncement(copy.error.title);
    // GA4 + New Relic. Sem rede (o caso mais comum no celular), o evento fica
    // guardado e sai quando a conexão volta, em vez de se perder (B340).
    trackWhenOnline(
      "lead_failed",
      { reason: result.reason, attempts: result.attempts, form: "briefing", event_id: code },
      { reason: result.reason, attempts: result.attempts, status: result.status ?? 0, form: "briefing", event_id: code },
    );
  };

  const copyText = async (text: string, which: "answers" | "email") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setAnnouncement(which === "email" ? copy.clipboard.copied_email : copy.error.copied);
      if (which === "email") track("email_copy", { source: "wizard_error" });
    } catch {
      // Sem permissão de clipboard: o texto continua visível e selecionável.
    }
  };

  /* ---------------------------------------------------------------- *
   * Render
   * ---------------------------------------------------------------- */

  /**
   * Barra de ação. Desktop: inline, "Voltar" à esquerda e o primário (com a
   * nota logo abaixo dele) à direita. Mobile (< 768px): fixa no rodapé, com o
   * primário de 70% a 100% da largura numa linha só (§7.2); `back: "desktop"`
   * tira o "Voltar" da barra no mobile (o contato mostra um "Voltar" no fluxo).
   * A nota (below_primary / below_submit) fica colada no primário, no mesmo
   * alinhamento dele, e não solta no conteúdo (§7.4f, §7.5). Nas perguntas, a
   * nota é o erro ou o aviso da tela (F05): a barra fixa (e a sticky do
   * desktop) cobria o texto do fluxo. O leitor de tela já ouve esse texto pela
   * região role=status e pelo aria-describedby das opções; aqui ele é só visual.
   */
  const actions = (options: {
    backLabel?: string;
    onBackClick?: () => void;
    back?: "always" | "desktop";
    primaryLabel?: string;
    primaryType?: "submit" | "button";
    onPrimary?: () => void;
    busy?: boolean;
    note?: string;
    /** "error" (vermelho e negrito) ou "notice" (aviso): nota repetida do fluxo, só visual. */
    noteTone?: "error" | "notice";
    /** "error": painel de erro aberto; a única ação de reenvio é a do painel. */
    state?: "error";
  }) => (
    <div
      ref={actionsRef}
      className={styles.actions}
      data-wizard-actions=""
      data-back={options.backLabel ? (options.back ?? "always") : "none"}
      data-keyboard={keyboardOpen ? "open" : undefined}
      data-state={options.state}
    >
      {options.backLabel && (
        <button type="button" className={styles.back} onClick={options.onBackClick}>
          {options.backLabel}
        </button>
      )}
      {options.primaryLabel && (
        <div className={styles.primaryGroup}>
          <button
            type={options.primaryType ?? "button"}
            className={styles.primary}
            // Sem isto, o mousedown tira o foco do campo, o blur mostra a mensagem
            // de erro, o botão desce e o clique cai fora dele: o envio nunca
            // acontecia e o foco ficava no botão (B270). O teclado não muda.
            onMouseDown={(event) => event.preventDefault()}
            onClick={options.onPrimary}
            data-busy={options.busy ? "true" : undefined}
          >
            {options.primaryLabel}
          </button>
          {options.note && (
            <p
              className={styles.barNote}
              data-tone={options.noteTone}
              data-wizard-bar-note=""
              aria-hidden={options.noteTone ? "true" : undefined}
            >
              {options.note}
            </p>
          )}
        </div>
      )}
    </div>
  );

  function renderQuestion(step: StepNumber) {
    const question = questionForStep(step, answers);
    const texts = questionText(question, answers);
    const multi = MULTI_QUESTIONS.has(question);
    const ids = optionIds(question, answers, modelFlags);
    const value = answerOf(question, answers, modelFlags);
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    const helperId = `${uid}-helper`;
    const extraId = `${uid}-extra`;
    const hintId = `${uid}-hint`;
    const errorId = `${uid}-error`;
    const exclusive = multi && EXCLUSIVE_OPTION[question];
    const live = isLive(answers);
    const describedBy = [helperId, texts.extra ? extraId : "", exclusive ? hintId : ""].filter(Boolean).join(" ");
    let counter = "";
    if (multi && selected.length > 0) {
      counter =
        question === "build_type"
          ? fillTemplate(selected.length === 1 ? copy.nav.selected_count_one : copy.nav.selected_count, { n: selected.length })
          : fillTemplate(copy.nav.selected_count_of_max, { n: selected.length });
    }
    const continueLabel = step === TOTAL_QUESTIONS || editing ? copy.nav.continue_to_summary : copy.nav.continue;
    // P3 (até 3): o contador fica logo abaixo do helper, no topo, à vista de quem
    // toca a 4ª opção lá embaixo (F05). Na P2 ele continua depois das opções.
    const counterOnTop = question !== "build_type";

    return (
      <form key={`step-${step}-${question}`} className={styles.screen} onSubmit={onContinue} noValidate>
        {context && context.step === step && <p className={styles.context}>{context.text}</p>}
        <fieldset className={styles.fieldset} aria-describedby={describedBy}>
          <legend className={styles.legend}>
            <h2 ref={headingRef} tabIndex={-1} className={styles.question}>
              {texts.question}
            </h2>
          </legend>
          <p id={helperId} className={styles.helper}>
            {texts.helper}
          </p>
          {texts.extra && (
            <p id={extraId} className={styles.helper}>
              {texts.extra}
            </p>
          )}
          {exclusive && (
            <p id={hintId} className={styles.hint}>
              {live ? copy.nav.exclusive_hint_live_variant : copy.nav.exclusive_hint}
            </p>
          )}
          {counter && counterOnTop && <p className={styles.counter}>{counter}</p>}
          <div className={styles.options}>
            {ids.map((id, index) => {
              const checked = selected.includes(id);
              return (
                <label key={id} className={styles.option} data-checked={checked ? "true" : undefined}>
                  <input
                    ref={index === 0 ? firstOptionRef : undefined}
                    className={styles.input}
                    type={multi ? "checkbox" : "radio"}
                    name={question}
                    value={id}
                    checked={checked}
                    onChange={(event) =>
                      multi ? onToggle(question, id, event.currentTarget.checked) : onSingle(question, id)
                    }
                    aria-invalid={stepError ? true : undefined}
                    aria-describedby={stepError ? errorId : undefined}
                  />
                  <span className={styles.indicator} data-shape={multi ? "square" : "circle"} aria-hidden="true">
                    {checked && <CheckIcon />}
                  </span>
                  <span className={styles.optionText}>{labelFor(question, id)}</span>
                </label>
              );
            })}
          </div>
          {counter && !counterOnTop && <p className={styles.counter}>{counter}</p>}
          {/* O erro visível fica na nota da barra (F05); este é o texto ligado às
              opções por aria-describedby, só para leitor de tela. */}
          {stepError && (
            <p id={errorId} className="sr-only">
              {stepError}
            </p>
          )}
        </fieldset>
        {isOptional(question) && (
          // "Pular" fora da barra fixa (B165): no fluxo, logo abaixo das opções.
          <button type="button" className={`${styles.linkButton} ${styles.skipLink}`} aria-label={copy.nav.skip_aria_label} onClick={onSkip}>
            {copy.nav.skip}
          </button>
        )}
        {question === "deadline" && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${uid}-reason`}>
              {copy.steps.deadline.reason_label}
            </label>
            <input
              id={`${uid}-reason`}
              className={styles.control}
              type="text"
              maxLength={300}
              autoComplete="off"
              placeholder={copy.steps.deadline.reason_placeholder}
              value={answers.deadline_reason ?? ""}
              onChange={(event) => updateAnswers({ ...answersRef.current, deadline_reason: event.currentTarget.value })}
            />
          </div>
        )}
        {actions({
          backLabel: copy.nav.back,
          onBackClick: onBack,
          primaryLabel: continueLabel,
          primaryType: "submit",
          note: stepError ?? limitNotice ?? undefined,
          noteTone: stepError ? "error" : limitNotice ? "notice" : undefined,
        })}
      </form>
    );
  }

  function renderPrice() {
    const block = priceBlock(answers, summaryCtx);
    const s = copy.summary;
    if (block.kind === "live") {
      return (
        <>
          <p>{s.price_empty_live}</p>
          <p>{s[block.second]}</p>
        </>
      );
    }
    if (block.kind === "empty") {
      return (
        <>
          <p>{s[block.first]}</p>
          <p>{s.price_empty_2}</p>
        </>
      );
    }
    return (
      <>
        <p>{s.price_ranges_intro}</p>
        <ul className={styles.ranges}>
          {block.lines.map((id) => {
            const line = getPriceLine(precos, id);
            if (!line) return null;
            return (
              <li key={id} className={styles.range}>
                <span className={styles.rangeLabel}>{copy.investment.row_labels[PRICE_LINE_LABEL[id]]}</span>
                <strong className={styles.rangeValue}>{line.faixa[locale]}</strong>
                <span className={styles.rangeUnit}>
                  {line.unidade === "mes" ? copy.investment.unit_month : copy.investment.unit_project}
                </span>
              </li>
            );
          })}
        </ul>
        <p>{s[block.note]}</p>
      </>
    );
  }

  /**
   * Cases do mesmo tipo que o pedido (backlog B379): até 2 cards (nome, tipo de
   * sistema, "Ler o case"), cada um um único link para o case, na mesma aba (o
   * rascunho já guarda o resumo para a volta). Sem case compatível (ou sem
   * cases publicados), nada: nem título nem wrapper. O clique (e o clique do
   * meio) mede cta_click {cta_id: "case", origem: "wizard_result"}.
   */
  function renderSummaryCases() {
    const matches = casesForAnswers(cases, answers);
    if (matches.length === 0) return null;
    const c = copy.summaryCases;
    const onCaseClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      track("cta_click", { cta_id: "case", origem: "wizard_result" });
    };
    return (
      <div className={styles.block} data-wizard-summary-cases="">
        <h3 className={styles.blockTitle}>
          {matches.length === 1 ? c.titleOne : c.title}
        </h3>
        <ul className={styles.caseList} role="list">
          {matches.map(([slug, item]) => (
            <li key={slug}>
              <a href={item.url} className={styles.caseCard} onClick={onCaseClick} onAuxClick={onCaseClick}>
                <span className={styles.caseName}>{item.name}</span>
                <span className={styles.caseType}>{item.tipoDeSistema}</span>
                <span className={styles.caseMore}>
                  {c.readCase}
                  <ArrowIcon />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /**
   * Linha do método compacta (F02): a etapa 1 (o próximo passo, gratuito) e a
   * etapa realçada pela P1, com a tag de cada uma ("Paga · valor combinado
   * antes do início" só aparece aqui). As 4 etapas, com o "Você recebe" e os
   * termos explicados, ficam num <details> fechado.
   */
  function renderMethod(stage: "discovery" | "support", live: boolean) {
    const s = copy.summary;
    const stages = copy.method.stages;
    const highlighted: { id: "discovery" | "support"; index: string } =
      stage === "support" ? { id: "support", index: "04" } : { id: "discovery", index: "02" };
    return (
      <div className={styles.block}>
        <h3 className={styles.blockTitle}>{live ? s.path_title_live_variant : s.path_title}</h3>
        <ol className={styles.stages}>
          <li className={styles.stage}>
            <span className={styles.stageIndex} aria-hidden="true">
              01
            </span>
            <span className={styles.stageName}>{stages.diagnosis.name}</span>
            <span className={styles.stageBadge}>{copy.method.nextStep}</span>
            <span className={styles.stageTag}>{stages.diagnosis.tag}</span>
          </li>
          <li className={styles.stage} data-highlight="true" aria-current="step">
            <span className={styles.stageIndex} aria-hidden="true">
              {highlighted.index}
            </span>
            <span className={styles.stageName}>{stages[highlighted.id].name}</span>
            <span className={styles.stageTag}>{stages[highlighted.id].tag}</span>
          </li>
        </ol>
        <p className={styles.emphasis}>{s.emphasis[emphasisKey(answers, summaryCtx)]}</p>
        <details className={styles.allStages}>
          <summary className={styles.allStagesSummary}>
            <svg className={styles.toggleIcon} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {s.path_all_stages}
          </summary>
          <div className={styles.allStagesBody}>
            <div className={styles.timeline}>{stage === "support" ? props.timelineSupport : props.timelineDiscovery}</div>
            {stage === "discovery" && (
              <ul className={styles.terms}>
                <li>{copy.terms.prioritized_scope}</li>
                <li>{copy.terms.prototype}</li>
              </ul>
            )}
          </div>
        </details>
      </div>
    );
  }

  /**
   * Resumo (§7.4) na ordem da auditoria F02: primeiro o que é do visitante (o
   * que pesa no prazo e no preço dele, a pauta, o preço e o CTA), depois o eco
   * das respostas e o método, compactos. Antes, a 1ª tela devolvia as 6
   * respostas e a linha do método que a pessoa já viu na Home, e os fatores
   * ficavam 2 a 3,5 telas abaixo. Os chips continuam abertos (nunca num
   * <details> fechado, §7.4a).
   */
  function renderSummary() {
    const s = copy.summary;
    const live = isLive(answers);
    const stage = highlightedStage(answers);
    const topics = summaryTopics(answers, summaryCtx);
    const factors = summaryFactors(answers, summaryCtx);
    const note = deadlineNote(answers);
    const titleId = `${uid}-summary`;
    const waMessage = summaryWhatsappMessage(chips, copy.whatsapp, protocol);
    return (
      <section className={styles.screen} aria-labelledby={titleId}>
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className={styles.title}>
          {s.title}
        </h2>
        <p className={styles.lead}>{live ? s.intro_live_variant : s.intro}</p>
        {/* "Para: tipo · prazo · faixa": o eco curto; "Revisar respostas" (§7.4f) é
            link no fluxo, não par do CTA na barra fixa (B165). */}
        <p className={styles.forLine} data-wizard-for-line="">
          {splitToken(
            s.for_line,
            "respostas",
            // Valor curto (o rótulo de uma faixa, "Nos próximos 3 meses") não quebra no
            // meio; os longos quebram, para nunca vazar a 320px.
            forLineParts(chips).map((part, index) => (
              <Fragment key={index}>
                {index > 0 && " · "}
                <span className={part.length <= FOR_LINE_NO_WRAP_MAX ? styles.noWrap : undefined}>{part}</span>
              </Fragment>
            )),
          )}
          {/* Espaço sem quebra antes do "·": a quebra, se houver, vem depois dele. */}
          {"\u00a0· "}
          <button type="button" className={styles.inlineLink} onClick={onFixAnswers}>
            {s.fix_answers}
          </button>
        </p>

        <div ref={factorsRef} className={styles.block} data-wizard-summary-factors="">
          <h3 className={styles.blockTitle}>{s.weighs_title}</h3>
          <ul className={styles.list}>
            {factors.map((factor) => (
              <li key={factor}>{s.factors[factor]}</li>
            ))}
          </ul>
        </div>

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>{s.deep_dive_title}</h3>
          <ul className={`${styles.list} ${styles.topics}`}>
            {topics.map((topic) => (
              <li key={topic}>{s.topics[topic]}</li>
            ))}
          </ul>
        </div>

        {renderSummaryCases()}

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>{s.price_title}</h3>
          {renderPrice()}
        </div>

        {/* Próximo passo, logo depois do preço: a nota do prazo (F09) em todas as
            telas e, no desktop (≥ 768px), o CTA, para quem já quer seguir não
            rolar até o fim (painel comercial). No mobile o CTA some: lá a barra
            fixa já mostra o primário. É um link para ?etapa=contato (a URL do
            próximo passo, interceptada pela ilha), e não um 2º botão com o
            mesmo nome do primário da barra. */}
        <div className={styles.nextStep}>
          {note && <p className={styles.note}>{s[note]}</p>}
          <div className={styles.earlyActions} data-wizard-early-actions="">
            <div className={styles.earlyRow}>
              <a
                href={typeof window === "undefined" ? "?etapa=contato" : urlForView("contato")}
                className={styles.primary}
                aria-describedby={`${uid}-early-note`}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                  event.preventDefault();
                  go("contato");
                }}
              >
                {s.primary}
              </a>
              {waBase && (
                <a
                  href={waBase}
                  target="_blank"
                  rel="noopener"
                  className={styles.secondary}
                  onClick={openWa(waMessage, "wizard_summary_top")}
                >
                  {s.secondary_whatsapp}
                  <span className="sr-only"> {copy.opensNewTab}</span>
                </a>
              )}
            </div>
            <p id={`${uid}-early-note`} className={styles.earlyNote}>
              {s.below_primary}
            </p>
          </div>
        </div>

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>{s.told_us_title}</h3>
          <ul className={styles.chips} role="list">
            {chips.map((chip) => (
              <li key={`${chip.step}-${chip.question}`} className={styles.chip}>
                <span className={styles.chipLabel}>{chip.label}</span>
                <span className={styles.chipValue}>{chip.value}</span>
                <button
                  type="button"
                  className={styles.linkButton}
                  aria-label={fillTemplate(s.edit_aria_label, { rotulo: chip.label })}
                  onClick={() => onEdit(chip.step, chip.question === "deadline_reason" ? "deadline" : chip.question)}
                >
                  {s.edit}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {renderMethod(stage, live)}

        <div className={styles.closing}>
          {actions({
            primaryLabel: s.primary,
            primaryType: "button",
            onPrimary: () => go("contato"),
            note: s.below_primary,
          })}
          {waBase && (
            // Secundário (§7.4f, §8.6): contornado e afastado do primário.
            <a
              href={waBase}
              target="_blank"
              rel="noopener"
              className={`${styles.secondary} ${styles.altChannel}`}
              onClick={openWa(waMessage, "wizard_summary")}
            >
              {s.secondary_whatsapp}
              <span className="sr-only"> {copy.opensNewTab}</span>
            </a>
          )}
        </div>
      </section>
    );
  }

  function fieldError(field: ContactField): string | undefined {
    const key = visibleError(field);
    if (!key) return undefined;
    const f = copy.contactForm.fields;
    switch (field) {
      case "name":
        return f.name.error_required;
      case "email":
        return key === "error_invalid" ? f.email.error_invalid : f.email.error_required;
      case "channel":
        return f.channel.error_required;
      case "phone":
        return key === "error_invalid" ? f.phone.error_invalid : f.phone.error_required;
    }
  }

  function renderErrorPanel() {
    const e = copy.error;
    const failureMessage = failureWhatsappMessage(chips, copy.whatsapp, contact, protocol);
    const emailLine = waEnabled ? e.email_line : e.email_line_no_whatsapp;
    return (
      <div ref={errorPanelRef} tabIndex={-1} className={styles.errorPanel} aria-labelledby={`${uid}-error-title`}>
        <h3 id={`${uid}-error-title`} className={styles.blockTitle}>
          {e.title}
        </h3>
        <p>{waEnabled ? e.text : e.text_no_whatsapp}</p>
        {protocol && (
          <p className={styles.protocol}>
            {copy.protocolLabel}: <strong>{protocol}</strong>
          </p>
        )}
        <div className={styles.errorActions}>
          <button type="submit" className={styles.primary}>
            {e.retry}
          </button>
          {waBase && (
            <a href={waBase} target="_blank" rel="noopener" className={styles.whatsapp} onClick={openWa(failureMessage, "wizard_error")}>
              {e.whatsapp}
              <span className="sr-only"> {copy.opensNewTab}</span>
            </a>
          )}
          <button
            type="button"
            className={styles.secondary}
            onClick={() => copyText(failureCopyText(chips, copy, contact, protocol), "answers")}
          >
            {copied === "answers" ? e.copied : e.copy_answers}
          </button>
        </div>
        <p className={styles.emailLine}>
          {splitToken(emailLine, "email", <span className={styles.email}>{email}</span>)}{" "}
          <button
            type="button"
            className={styles.linkButton}
            aria-label={fillTemplate(copy.clipboard.copy_email_aria, { email })}
            onClick={() => copyText(email, "email")}
          >
            {copied === "email" ? copy.clipboard.copied : copy.clipboard.copy}
          </button>
        </p>
      </div>
    );
  }

  function renderContact() {
    const f = copy.contactForm.fields;
    const titleId = `${uid}-contact`;
    const channels: ContactChannel[] = flags.phoneCall ? ["whatsapp", "email", "phone_call"] : ["whatsapp", "email"];
    const required = phoneRequired(contact.channel);
    const phoneLabel = flags.phoneCall
      ? required
        ? f.phone.label_with_call
        : f.phone.label_with_call_optional
      : required
        ? f.phone.label
        : f.phone.label_optional;
    const live = isLive(answers);
    const detailsPlaceholder = live
      ? f.details.placeholder_live_variant
      : answers.stage === "product_idea" || answers.build_type?.includes("mvp")
        ? f.details.placeholder_product_variant
        : f.details.placeholder;
    const describe = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;
    const nameError = fieldError("name");
    const emailError = fieldError("email");
    // F07: "Você quis dizer …? [Corrigir]" depois que a pessoa sai do campo; nunca bloqueia o envio.
    const emailSuggestion = touched.email || showAllErrors ? suggestEmail(contact.email) : null;
    const channelError = fieldError("channel");
    const phoneError = fieldError("phone");
    const sending = submitState === "sending" || submitState === "slow";

    return (
      <form className={styles.screen} onSubmit={onSubmit} noValidate aria-labelledby={titleId}>
        {/* Mobile: "Voltar" sai da barra fixa (o primário cabe numa linha a 320px, B165). */}
        <button type="button" className={`${styles.linkButton} ${styles.backInline}`} onClick={onBack}>
          {copy.nav.back}
        </button>
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className={styles.title}>
          {copy.contactForm.title}
        </h2>
        <p className={styles.lead}>{copy.contactForm.intro}</p>

        {submitState === "error" && renderErrorPanel()}

        <div className={styles.fields}>
          <div
            className={styles.field}
            ref={(node) => {
              fieldWrapRefs.current.name = node;
            }}
          >
            <label className={styles.label} htmlFor={`${uid}-name`}>
              {f.name.label}
            </label>
            <input
              ref={(node) => {
                fieldRefs.current.name = node;
              }}
              id={`${uid}-name`}
              className={styles.control}
              type="text"
              name="name"
              autoComplete="name"
              required
              value={contact.name}
              onChange={(event) => setField("name", event.currentTarget.value)}
              onBlur={() => onFieldBlur("name")}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={describe(nameError && `${uid}-name-error`)}
            />
            {nameError && (
              <p id={`${uid}-name-error`} className={styles.error}>
                {nameError}
              </p>
            )}
          </div>

          <div
            className={styles.field}
            ref={(node) => {
              fieldWrapRefs.current.email = node;
            }}
          >
            <label className={styles.label} htmlFor={`${uid}-email`}>
              {f.email.label}
            </label>
            <input
              ref={(node) => {
                fieldRefs.current.email = node;
              }}
              id={`${uid}-email`}
              className={styles.control}
              type="email"
              inputMode="email"
              name="email"
              autoComplete="email"
              required
              value={contact.email}
              onChange={(event) => setField("email", event.currentTarget.value)}
              onBlur={() => onFieldBlur("email")}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={describe(`${uid}-email-help`, emailError && `${uid}-email-error`)}
            />
            <p id={`${uid}-email-help`} className={styles.help}>
              {f.email.help}
            </p>
            {emailError && (
              <p id={`${uid}-email-error`} className={styles.error}>
                {emailError}
              </p>
            )}
            <p className={styles.suggestion} aria-live="polite">
              {emailSuggestion && (
                <>
                  <span>{fillTemplate(copy.emailSuggestion.text, { email: emailSuggestion })}</span>{" "}
                  <button
                    type="button"
                    className={styles.suggestionFix}
                    // O foco fica no e-mail: o blur dele não mexe na tela entre o toque e o clique.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setField("email", emailSuggestion);
                      fieldRefs.current.email?.focus();
                    }}
                  >
                    {copy.emailSuggestion.fix}
                  </button>
                </>
              )}
            </p>
          </div>

          <fieldset
            className={styles.fieldsetCompact}
            aria-describedby={describe(channelError && `${uid}-channel-error`)}
            ref={(node) => {
              fieldWrapRefs.current.channel = node;
            }}
          >
            <legend className={styles.label}>{f.channel.label}</legend>
            <div className={styles.chipsChoice}>
              {channels.map((channel, index) => (
                <label key={channel} className={styles.choice} data-checked={contact.channel === channel ? "true" : undefined}>
                  <input
                    ref={
                      index === 0
                        ? (node) => {
                            fieldRefs.current.channel = node;
                          }
                        : undefined
                    }
                    className={styles.input}
                    type="radio"
                    name="channel"
                    value={channel}
                    checked={contact.channel === channel}
                    onChange={() => setContact((current) => ({ ...current, channel }))}
                  />
                  <span className={styles.indicator} data-shape="circle" aria-hidden="true">
                    {contact.channel === channel && <CheckIcon />}
                  </span>
                  <span className={styles.optionText}>{f.channel.options[channel]}</span>
                </label>
              ))}
            </div>
            {channelError && (
              <p id={`${uid}-channel-error`} className={styles.error}>
                {channelError}
              </p>
            )}
          </fieldset>

          <div
            className={styles.field}
            ref={(node) => {
              fieldWrapRefs.current.phone = node;
            }}
          >
            <label className={styles.label} htmlFor={`${uid}-phone`}>
              {phoneLabel}
            </label>
            <input
              ref={(node) => {
                fieldRefs.current.phone = node;
              }}
              id={`${uid}-phone`}
              className={styles.control}
              type="tel"
              inputMode="tel"
              name="phone"
              autoComplete="tel"
              required={required}
              placeholder={f.phone.placeholder}
              value={contact.phone}
              onChange={(event) => setField("phone", event.currentTarget.value)}
              onBlur={() => onFieldBlur("phone")}
              aria-invalid={phoneError ? true : undefined}
              aria-describedby={describe(`${uid}-phone-help`, phoneError && `${uid}-phone-error`)}
            />
            <p id={`${uid}-phone-help`} className={styles.help}>
              {required ? f.phone.help : f.phone.help_optional}
            </p>
            {phoneError && (
              <p id={`${uid}-phone-error`} className={styles.error}>
                {phoneError}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${uid}-company`}>
              {f.company.label}
            </label>
            <input
              id={`${uid}-company`}
              className={styles.control}
              type="text"
              name="company"
              autoComplete="organization"
              value={contact.company}
              onChange={(event) => setField("company", event.currentTarget.value)}
              onBlur={() => onFieldBlur("company")}
            />
          </div>

          <div className={styles.field}>
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={detailsOpen}
              aria-controls={`${uid}-details-panel`}
              onClick={() => setDetailsOpen((open) => !open)}
            >
              <svg
                className={styles.toggleIcon}
                data-open={detailsOpen ? "true" : undefined}
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {f.details.toggle}
            </button>
            <div id={`${uid}-details-panel`} hidden={!detailsOpen} className={styles.detailsPanel}>
              <label className={styles.label} htmlFor={`${uid}-details`}>
                {f.details.label}
              </label>
              <textarea
                id={`${uid}-details`}
                className={styles.control}
                name="details"
                rows={4}
                maxLength={2000}
                placeholder={detailsPlaceholder}
                value={contact.details}
                onChange={(event) => setField("details", event.currentTarget.value)}
                onBlur={() => onFieldBlur("details")}
                aria-describedby={flags.nda ? `${uid}-nda` : undefined}
              />
              {flags.nda && (
                <p id={`${uid}-nda`} className={styles.help}>
                  {f.details.nda_note}
                </p>
              )}
            </div>
          </div>

          <div className={styles.honeypot} aria-hidden="true">
            <input
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="off"
              value={contact.bot}
              onChange={(event) => setField("bot", event.currentTarget.value)}
            />
          </div>
        </div>

        <p className={styles.privacy}>
          {splitToken(copy.contactForm.privacy_notice, "politica", <a href={privacyUrl}>{copy.privacyLinkLabel}</a>)}
        </p>

        {previewSubmit && copy.previewNotice && (
          <p className={styles.previewNotice} role="note">
            {copy.previewNotice}
          </p>
        )}

        <div className={styles.closing}>
          {actions({
            backLabel: copy.nav.back,
            onBackClick: onBack,
            back: "desktop",
            // Com o painel de erro aberto, "Tentar de novo" (no painel) é o único reenvio.
            primaryLabel: submitState === "error" ? undefined : copy.contactForm.submit,
            primaryType: "submit",
            busy: sending,
            note: copy.contactForm.below_submit,
            state: submitState === "error" ? "error" : undefined,
          })}
          {sending && (
            <p className={styles.status} aria-hidden="true">
              {submitState === "slow" ? copy.contactForm.sending_slow : copy.contactForm.sending}
            </p>
          )}
        </div>

        {props.hasContactProof && props.contactProof && <div className={styles.proof}>{props.contactProof}</div>}
      </form>
    );
  }

  function renderProgress() {
    if (view === "intro") return null;
    // Sobre 8 passos (F21): o contato fica em ~95%, e 100% só depois do envio.
    const n = progressValue(view);
    const label =
      typeof view === "number"
        ? fillTemplate(copy.progress.label, { n: view, total: TOTAL_QUESTIONS })
        : view === "resumo"
          ? copy.progress.summary_label
          : copy.progress.contact_label;
    return (
      <div className={styles.progress}>
        <span className={styles.progressLabel} aria-hidden="true">
          {label}
        </span>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={copy.a11y.progress_name}
          aria-valuemin={0}
          aria-valuemax={PROGRESS_STEPS}
          aria-valuenow={n}
          aria-valuetext={label}
        >
          <span className={styles.progressFill} style={{ inlineSize: `${(n / PROGRESS_STEPS) * 100}%` }} />
        </div>
      </div>
    );
  }

  /** Data do banner ("20 de outubro"), ou "" se não der para formatar. */
  function bannerDate(draft: Draft): string {
    // parseDraft já recusa data impossível; o try/catch é a segunda trava (B234).
    try {
      return new Intl.DateTimeFormat(LOCALE_META[locale].htmlLang, { day: "numeric", month: "long" }).format(
        new Date(draft.savedAt),
      );
    } catch {
      return "";
    }
  }

  function renderBanner() {
    if (!banner) return null;
    const date = bannerDate(banner);
    if (!date) return null;
    const hintId = `${uid}-restart-hint`;
    return (
      <div className={styles.banner} role="status">
        <p className={styles.bannerText}>{fillTemplate(copy.resumeBanner.text, { data: date })}</p>
        <div className={styles.bannerActions}>
          <button type="button" className={styles.primary} onClick={resume}>
            {copy.resumeBanner.continue}
          </button>
          <button type="button" className={styles.secondary} onClick={restart} aria-describedby={hintId}>
            {copy.resumeBanner.restart}
          </button>
        </div>
        <p id={hintId} className={styles.help}>
          {copy.resumeBanner.restart_hint}
        </p>
      </div>
    );
  }

  const target = (selector: string) => (ready ? document.querySelector<HTMLElement>(selector) : null);
  const progressTarget = target("[data-wizard-progress]");
  const resumeTarget = target("[data-wizard-resume]");
  const contextTarget = target("[data-wizard-context]");

  let content: ReactNode = null;
  if (view === "resumo") content = renderSummary();
  else if (view === "contato") content = renderContact();
  else if (typeof view === "number") content = renderQuestion(view);

  return (
    <div
      className={styles.root}
      data-nr-block=""
      data-wizard-root=""
      data-locale={locale}
      data-view={view === "intro" ? "intro" : "focus"}
      onClickCapture={onEntryClickCapture}
    >
      <div role="status" className="sr-only">
        {announcement}
      </div>
      {!ready && <p className={styles.pending}>{copy.loading}</p>}
      {content}
      {progressTarget && createPortal(renderProgress(), progressTarget)}
      {resumeTarget && view === "intro" && createPortal(renderBanner(), resumeTarget)}
      {contextTarget && context && view === "intro" && createPortal(<p className={styles.contextIntro}>{context.text}</p>, contextTarget)}
    </div>
  );
}

/**
 * A ilha: o fluxo dentro do error boundary (B234). Uma falha de render vira a
 * tela de acolhimento com os canais, nunca uma página em branco.
 */
export default function Wizard(props: WizardProps) {
  const { copy, email } = props;
  return (
    <WizardBoundary
      email={email}
      homeUrl={props.homeUrl}
      whatsappEnabled={props.flags.hasWhatsapp}
      copy={{
        title: copy.renderError.title,
        text: copy.renderError.text,
        restart: copy.resumeBanner.restart,
        home: copy.backHome,
        whatsapp: copy.whatsappCta,
        whatsappMessage: copy.whatsapp.wizard_question,
        copy: copy.clipboard.copy,
        copied: copy.clipboard.copied,
        copyEmailAria: fillTemplate(copy.clipboard.copy_email_aria, { email }),
        opensNewTab: copy.opensNewTab,
      }}
    >
      <WizardFlow {...props} />
    </WizardBoundary>
  );
}
