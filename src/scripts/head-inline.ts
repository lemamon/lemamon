/**
 * Script INLINE e SÍNCRONO do <head> (dono: shell). Roda antes de o <body>
 * ser pintado, por isso não há flash nem layout shift (BLUEPRINT §7.1, §15.3):
 *
 *  1. marca <html class="js"> (o CSS mostra o botão "Menu" do drawer só com JS;
 *     sem JS, o link "Menu" leva ao rodapé, que tem toda a navegação);
 *  2. retomada global: com rascunho válido do wizard em localStorage
 *     ("lemamon:orcamento:v2"), grava <html data-draft-step="N">. O CSS troca o
 *     rótulo dos CTAs [data-resume-cta] para "Continuar meu pedido" (os dois
 *     rótulos ocupam a mesma célula de grid: largura fixa, sem CLS) e
 *     src/scripts/resume.ts aponta o link para o último passo;
 *  3. TTL: rascunho vencido (> 30 dias sem mudança) é APAGADO aqui, em qualquer
 *     página do site (i18n _notes.ttl; privacy.sections.data_collected.draft_ttl
 *     promete isso);
 *  4. tema (backlog B208): grava <html data-theme="dark"> antes da 1ª pintura
 *     quando a pessoa escolheu o escuro (localStorage "lemamon-theme", botão
 *     de tema do rodapé e do menu, src/scripts/theme.ts) ou, sem escolha
 *     salva, quando o sistema está no escuro (prefers-color-scheme). Os tokens
 *     de tokens.css §2b fazem o resto: a página já abre escura, sem piscar;
 *  5. aviso de idioma (BLUEPRINT §9; backlog B296): só quando o idioma da
 *     página NÃO está entre os idiomas do navegador e outro dos 3 do site está,
 *     grava <html data-lang-suggest="en"> e o CSS mostra o aviso discreto "This
 *     page is also available in English." (LanguageSuggestion.astro). Quem usa
 *     o celular em inglês mas também lê português não vê nada. Nunca
 *     redireciona. Fechar o aviso vale para as próximas páginas.
 *
 * É uma STRING de propósito: bundlers não tocam nela (nada de helper injetado
 * num Function.toString()), e o teste (head-inline.test.ts) a executa do jeito
 * que vai ao ar. Tudo em try/catch: sem storage, o site funciona e só não
 * oferece a retomada.
 *
 * Escrita JÁ COMPACTA (nomes curtos, sem indentação): é síncrona e vai em toda
 * página, então fica com no máximo 1 KiB depois de trocar os placeholders
 * (backlog B104; o teste confere o tamanho e o verify-build reprova qualquer
 * script inline clássico acima de 1 KiB). Parâmetros: w=window, d=document,
 * k=chave do rascunho, t=TTL em ms, s=passos aceitos, x=chave do aviso fechado,
 * l=idiomas do site, m=chave do tema.
 */

import { DRAFT_KEY, DRAFT_TTL_MS } from "@/lib/draft";

import { LANG_SUGGEST_DISMISSED_KEY, THEME_KEY } from "./storage-keys";

export { LANG_SUGGEST_DISMISSED_KEY, THEME_KEY };

/** Passos aceitos em ?etapa= (BLUEPRINT §7.1). */
export const DRAFT_STEPS = ["1", "2", "3", "4", "5", "6", "resumo", "contato"] as const;

const SITE_LOCALES = ["pt", "en", "es"];

const SOURCE =
  "(function(w,d,k,t,s,x,l,m){" +
  // 1. <html class="js">
  'var r=d.documentElement,g=null,a,i;r.className+=(r.className?" ":"")+"js";' +
  "try{g=w.localStorage}catch(e){}" +
  // 2 e 3. rascunho: vencido ou sem data = apagado; v2 válido = data-draft-step
  'try{a=g&&g.getItem(k);if(a){a=JSON.parse(a);if(a&&typeof a=="object"){i=Number(a.savedAt);' +
  'if(!isFinite(i)||Date.now()-i>t)g.removeItem(k);else if(a.v===2){a=String(a.step);r.dataset.draftStep=s.indexOf(a)<0?"1":a}}}}catch(e){}' +
  // 4. tema: escolha salva ("dark"/"light") ou, sem ela, o do sistema
  'try{a=g&&g.getItem(m);if(a=="dark"||a!="light"&&w.matchMedia("(prefers-color-scheme:dark)").matches)r.dataset.theme="dark"}catch(e){}' +
  // 5. aviso de idioma: só se o idioma da página não está entre os do navegador
  'try{if(g&&g.getItem(x)=="1")return;var p=(r.lang||"").slice(0,2).toLowerCase(),n=w.navigator||{},' +
  'v=n.languages&&n.languages.length?n.languages:[n.language||""],c=[];' +
  'for(i=0;i<v.length;i++)c.push(String(v[i]||"").slice(0,2).toLowerCase());if(c.indexOf(p)>=0)return;' +
  'for(i=0;i<c.length;i++)if(l.indexOf(c[i])>=0){r.dataset.langSuggest=c[i];return}}catch(e){}' +
  "})(window,document,__KEY__,__TTL__,__STEPS__,__DISMISS__,__LOCALES__,__THEME__);";

/** Código pronto para <script is:inline set:html={headInlineScript()} />. */
export function headInlineScript(key: string = DRAFT_KEY, ttlMs: number = DRAFT_TTL_MS): string {
  return SOURCE.replace("__KEY__", JSON.stringify(key))
    .replace("__TTL__", String(ttlMs))
    .replace("__STEPS__", JSON.stringify(DRAFT_STEPS))
    .replace("__DISMISS__", JSON.stringify(LANG_SUGGEST_DISMISSED_KEY))
    .replace("__LOCALES__", JSON.stringify(SITE_LOCALES))
    .replace("__THEME__", JSON.stringify(THEME_KEY));
}
