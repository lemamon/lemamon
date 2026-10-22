# CONTRACT — fundação da migração para Astro (Onda 2)

**Para quem:** os 6 agentes que trabalham em paralelo (`shell`, `home`, `pages`, `conversion`, `gated`, `playbooks`) e o integrador.
**Fontes de verdade, nesta ordem:** `BLUEPRINT.md` › `src/i18n/*.json` › `03-ui.md` (visual) › `04-tecnico.md` › este contrato (como o código está organizado).
**Estado de entrega da fundação:** `yarn build` passa (`astro check` com 0 erros, 0 warnings, 0 hints; 45 páginas; verificação de rotas e H1), `yarn test` passa (28 testes), `yarn i18n:check` passa.
**Estado depois da integração (Onda 2, integrador):** os 6 agentes entregaram, o app React/Vite (`legacy/`) e o `Stub.astro` foram apagados, `yarn build` passa com 0/0/0 no `astro check`, `yarn test` e `yarn test:e2e` passam (ver §3). A partir daqui a tabela de ownership (§12) vale como mapa de responsabilidade, não mais como trava de edição paralela.

> Regra de ouro: **edite só os arquivos da sua linha na tabela de ownership (§12).** Importar qualquer módulo é livre. Precisa mudar arquivo de outro dono? Escreva o pedido no seu retorno (§13).

---

## 1. Árvore de diretórios

```
lemamon.dev/
├── astro.config.mjs          site, output estático, política de URL, react/mdx/sitemap, verify-build   [shell]
├── netlify.toml              Node 22, yarn build → dist, redirects §10.1, headers, cache                [shell]
│                             (dist/ = pasta PUBLICADA: build com a camada fictícia fora de deploy preview
│                             vai para dist-ficticio/, nunca para dist/ — ver §7.1)
├── package.json · yarn.lock · .yarnrc   Yarn 1.22.22 (packageManager), ignore-engines (ver §3)         [shell]
├── tsconfig.json             astro/tsconfigs/strict + alias @/* → src/*; exclui legacy/                  [shell]
├── vitest.config.ts          getViteConfig do Astro                                                     [shell]
├── playwright.config.ts      E2E contra o build (astro preview), sempre com PUBLIC_DADOS_FICTICIOS=false [shell]
├── .env.example              PUBLIC_WHATSAPP_NUMBER, PUBLIC_GA4_ID, PUBLIC_DADOS_FICTICIOS (vazio)      [shell]
├── dados/                    DADOS DO DONO (fonte única, ver §7.1)                                      [gated]
│   ├── dono.json             empresa, privacidade, time, perfis, confirmacoes, qualificacao, precos,
│   │                         agenda, descoberta, sustentacao, engenharia, depoimentos, logos
│   ├── dono.schema.json      JSON Schema (autocompletar no editor; o Zod de validate.ts é quem decide)
│   ├── imagens/              fotos e logos REAIS (caminhos do dono.json são relativos a dados/)
│   ├── dono.ficticio.json    camada FICTÍCIA (mesma estrutura), só fora de produção com a flag
│   └── ficticio/             imagens/ (geradas), cases/{pt,en,es}/*.mdx e posts/*.mdx fictícios
├── public/                   robots.txt, manifest.json, favicon.ico/.svg, apple-touch-icon.png,         [shell]
│                             icon-192/512/maskable-512.png, assets/img/og/<rota>-<idioma>.jpg (cartões
│                             1200×630 gerados por scripts/build-og-image.sh), scripts/newrelic.js
├── scripts/                  check-i18n.mjs [shell] · build-og-image.sh [shell] · build-fonts.sh [home] ·
│                             gerar-imagens-ficticias.mjs [gated]
├── docs/arquitetura/         BLUEPRINT e afins (integrador) · docs/playbooks/** [playbooks]
├── tests/
│   ├── unit/                 Vitest (i18n, routes, features, no-money, verify-build, dados-*)
│   │   └── support/          globalSetup: 12 builds reais (com/sem a camada; produção+flag em raízes   [gated]
│                             de teste vazia e preenchida; local+flag sem --outDir → dist-ficticio/;
│                             6 ATAQUES: url() de CSS, new URL(), leitura por fs, falha no prerender,
│                             cópias no projeto, outDir por link simbólico)
│   ├── fixtures/             dados de teste que NUNCA vão ao ar (gates)                                 [gated]
│   └── e2e/                  Playwright: smoke, shell-*, pages-*, quote-* (caminho do dinheiro, falha,
│                             retomada, pré-marcação), site-navigation, redirects (só contra deploy);
│                             support/wizard.ts = helpers (não é spec)
└── src/
    ├── env.d.ts              tipos de import.meta.env                                                    [shell]
    ├── content.config.ts     coleções cases, logos, depoimentos, time, posts (Zod)                      [gated]
    ├── content/              cases/{pt,en,es}/ · posts/ (MDX, VAZIOS) · schemas.ts · loaders.ts         [gated]
    │                         (time, depoimentos e logos vêm de dados/dono.json via loaders.ts)
    ├── assets/fonts/         motiva-sans-{light,bold}.woff2 (+ source/*.ttf)                            [home]
    ├── styles/               tokens.css · global.css · breakpoints.ts                                    [home]
    ├── i18n/                 pt.json en.json es.json (copy) · index.ts (loader) · locales.ts             [shell]
    ├── config/
    │   ├── routes.ts         mapa de rotas, política de URL, hreflang, âncoras, quoteHref                [shell]
    │   ├── site.ts           env (WhatsApp, GA4, CONTEXT), Google Ads                                    [shell]
    │   ├── privacidade.ts    decisões jurídicas da Política + privacyLaunchBlockers()                    [shell]
    │   ├── features.ts       ÚNICA fonte das flags when_data                                             [gated]
    │   ├── validate.ts       validação Zod do dados/dono.json, mensagens pt-BR (falha o build)           [gated]
    │   ├── types.ts          Localized<T>, isFilledText, isFilledList                                    [gated]
    │   ├── dono.ts           lê dados/dono.json + camada fictícia (MODO_FICTICIO, comCamadaFicticia)      [gated]
    │   ├── camada-ficticia.ts regra pura da camada (flag × produção), merge, marcas, dist-ficticio        [gated]
    │   ├── json-do-dono.ts   leitura do dono.json com erro de SINTAXE em pt-BR (linha, coluna, motivo)  [gated]
    │   └── precos · qualificacao · confirmacoes · perfis · agenda · empresa · descoberta ·
    │       sustentacao · engenharia (.ts)  — LEEM a sua seção do dono.json (mesmos exports e tipos)     [gated]
    ├── integrations/verify-build.ts   checa rotas, H1, data-nr-block e placeholders {…} depois do build  [shell]
    ├── integrations/dados-ficticios.ts  ativação/trava da camada fictícia: sintaxe do dono.json, cópia da [gated]
    │                         camada em src/·public/·dados/ (texto, JSON, bytes e semelhança de imagem),
    │                         plugin (import, citação em código, asset emitido), dist-ficticio/ pelo
    │                         caminho real, sentinela e limpeza de build reprovado, varredura do dist/
    ├── layouts/Base.astro    <html lang>, <head> (SEO), header/footer, variante wizard                   [shell]
    ├── views/                uma view por tipo de página, compartilhada pelos 3 idiomas (dono = dono da página)
    ├── pages/                arquivos FINOS por idioma (1–3 linhas) que renderizam a view                (dono = dono da página)
    ├── components/
    │   ├── ui/               Button, Section, Icon (primitivos)                                          [home]
    │   ├── shared/           §5 do BLUEPRINT: MethodTimeline, Commitments, DiscoveryDeliverables,
    │   │                     DecisionPoints, Investment, CtaFinal, CtaDiagnosis, WhatsAppCta, Faq(+faq.ts),
    │   │                     Profiles, Term, CaseCard, TestimonialCard, TeamCard, LogoWall               [home]
    │   ├── home/             seções da Home                                                              [home]
    │   ├── how-we-work/ · discovery/ · pricing/ · services/                                              [pages]
    │   ├── quote/ · quote-sent/ · contact/                                                               [conversion]
    │   ├── gated/            seções when_data (logos, depoimento, cases, time, prova, engenharia,
    │   │                     formato da Descoberta e da sustentação, cases relacionados)                 [gated]
    │   ├── shell/            SEO, JsonLd, SkipLink, Header, MobileDrawer, nav.ts, LanguageSelector,
    │   │                     LanguageSuggestion, ResumeLabel, StickyBar, WhatsAppFloat, WizardHeader,
    │   │                     WizardFooter, Footer, Breadcrumb, CopyEmail, Analytics                       [shell]
    ├── islands/wizard/       Wizard.tsx + Wizard.module.css (única ilha React)                           [conversion]
    ├── lib/
    │   ├── analytics.ts · whatsapp.ts · forms.ts · draft.ts   (seguros para o cliente)                    [conversion]
    │   ├── whatsapp-messages.ts   (só servidor: usa o i18n)                                               [conversion]
    │   └── content.ts        consultas às coleções (só servidor)                                          [gated]
    └── scripts/              scripts vanilla do cliente (drawer, dropdown, barra fixa, retomada, copiar)  [shell]
```

---

## 2. Política de URL (única)

| Item | Valor |
|---|---|
| `build.format` | `"preserve"` (o arquivo de saída espelha o de `src/pages`) |
| `trailingSlash` | `"ignore"` (o dev server aceita as duas variantes, como o Netlify) |
| Raízes de idioma | **com** barra: `/`, `/en/`, `/es/` → `index.html`, `en/index.html`, `es/index.html` |
| Todas as outras páginas | **sem** barra e sem `.html`: `/como-trabalhamos` → `como-trabalhamos.html` |
| 404 | `404.html`, `en/404.html`, `es/404.html` (noindex, sem canonical/hreflang) |

Consequências práticas:

- Uma página `/x` é o arquivo `src/pages/x.astro`, **nunca** `src/pages/x/index.astro` (isso geraria `/x/`). Uma página com filhas usa os dois: `orcamento.astro` + `orcamento/enviado.astro`.
- **Todo** href interno, canonical, hreflang e entrada de sitemap sai de `src/config/routes.ts`. Nunca escreva `"/orcamento"` à mão; escreva `urlFor("quote", locale)` ou `quoteHref(locale, {...})`.
- O sitemap (`sitemap-index.xml`) normaliza pela mesma função (`normalizePath`) e traz `xhtml:link` com os mesmos pares de `alternates()`.
- Parâmetros de atribuição (`origem`, `servico`, `entrada`, `ref`) e âncoras entre páginas (`ANCHORS`) **não** variam por idioma. `?servico=` usa os slugs pt estáveis de `SERVICE_PARAM` (`sistemas-web`, `aplicativos`, `integracoes`, `mvp`, `sustentacao`) em `/en/quote` e `/es/cotizacion` também.

---

## 3. Ambiente e comandos

- Node local 23 funciona; **Netlify usa `NODE_VERSION = "22"`** (Astro 7 exige ≥ 22.22).
- Yarn 1.22.22 via Corepack (`"packageManager": "yarn@1.22.22"`, `yarn.lock` v1). Sempre `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn <cmd>`.
- `.yarnrc` tem `ignore-engines true`: vitest/jsdom declaram engines só para Node par (22/24); sem isso o `yarn install` quebra no Node 23 local. No Netlify (Node 22) os engines batem.
- **Não instale dependências.** `package.json` tem dono único (shell). Precisa de pacote? Peça (§13).
- `@emnapi/runtime` em `dependencies` NÃO é dependência morta: é peer de `@napi-rs/wasm-runtime`, usado pelo `@astrojs/astro2tsx` do `astro check`, e o Yarn 1 não instala peers sozinho. `@vitest/coverage-v8` serve ao `yarn test:coverage`.

| Comando | O que faz |
|---|---|
| `yarn dev` | dev server em http://localhost:4321 |
| `yarn build` | `astro check && astro build` + verificação de rotas/H1 (falha o build se faltar rota ou se o H1 divergir do i18n) |
| `yarn run check` | só o `astro check`. **Atenção:** `yarn check` (sem `run`) é um comando nativo do Yarn 1 que NÃO roda o script |
| `yarn test` | Vitest (`tests/unit`, `src/**/*.test.ts`) |
| `yarn test:coverage` | Vitest com cobertura (v8) |
| `yarn test:e2e` | Playwright (instale antes: `yarn playwright install chromium`). Builda em `dist-e2e/` com um WhatsApp de TESTE (`5548900000000`, playwright.config.ts) e serve com `astro preview --outDir dist-e2e --ignore-lock` (o Astro 7 vai para segundo plano sozinho quando detecta agente; `--ignore-lock` o mantém em primeiro plano). Redirects do netlify.toml só com `E2E_NETLIFY_URL` (deploy preview) |
| `yarn i18n:check` | paridade e placeholders de pt/en/es |

Critério de pronto para qualquer agente: `yarn build` e `yarn test` verdes, `yarn i18n:check` verde se o i18n mudou.

**Camada de dados fictícios no ambiente local.** O `.env.local` liga `PUBLIC_DADOS_FICTICIOS=true`, então `yarn dev`/`yarn build`/`yarn preview` locais mostram o site cheio de dados de EXEMPLO (faixa "Dados fictícios — não publicar" e `noindex,nofollow` em toda página). Com a camada ligada fora de deploy preview/branch deploy, o build vai para **`dist-ficticio/`** (git-ignorado) e o `dist/` (pasta publicada pelo Netlify) não é tocado; `astro preview` serve a mesma pasta. Para conferir o site real em `dist/`: `PUBLIC_DADOS_FICTICIOS=false yarn build`. **Deploy manual de um `dist/` local (`netlify deploy --prod`) é proibido**: produção sai só do build do Netlify. Build que **falha** (em qualquer ponto) apaga a pasta de saída; enquanto a conferência final não passa, a saída leva `.build-incompleto` (nunca publique pasta com esse arquivo). Num contexto de preview (`CONTEXT=deploy-preview`/`branch-deploy`), o `dist/` só recebe a camada quando a variável vem do ambiente do processo (painel do Netlify); vinda só de um `.env` local, o build também vai para `dist-ficticio/`. `yarn test` força a flag desligada (vitest.config.ts) e o globalSetup faz 12 builds (~3 s cada; 6 deles são ataques que têm de cair) em `node_modules/.cache/lemamon-testes/`, todos com o número de WhatsApp de TESTE do E2E; o E2E também roda com a flag desligada.

---

## 4. i18n — `src/i18n/index.ts`

**Nenhum texto visível hardcoded em componente.** Inclui `aria-label`, `alt`, `title`, mensagens de erro e textos de WhatsApp. Chaves `_*` são notas internas e nunca renderizam (o loader as remove e lança erro se pedidas).

```astro
---
import { t, tRaw, getSection, interpolate, tDynamic, type Locale } from "@/i18n";
const { locale } = Astro.props;                     // "pt" | "en" | "es"
---
<h1>{t(locale, "home.hero.title")}</h1>                              <!-- chave checada pelo TS -->
<p>{t(locale, "shared.footer.copyright", { ano: 2026 })}</p>          <!-- interpola {ano} -->
{Object.entries(getSection(locale, "shared.commitments.items")).map(([id, text]) => <li>{text}</li>)}
```

| Função | Uso |
|---|---|
| `t(locale, key, vars?)` | texto de uma chave literal; **lança erro** se faltar variável de `{placeholder}` (texto com `{x}` cru nunca vai ao ar) |
| `tRaw(locale, key)` | texto SEM interpolar (para interpolar no cliente) |
| `getSection(locale, path)` | objeto/array inteiro, tipado, sem notas — para passar a componentes e ilhas |
| `interpolate(template, vars)` | interpolação (serve no cliente) |
| `tDynamic(locale, path, vars?)` / `hasText(locale, path)` | caminho montado em runtime (`` `services.${key}.h1` ``). Prefira `t` com chave literal |
| `LOCALE_META[locale]` | `htmlLang` (pt-BR/en/es), `hreflang`, `ogLocale`, `prefix` |

Variantes de texto (`*_with_pricing`, `*_no_whatsapp`, `*_with_format`...) são escolhidas pelo componente a partir de `features` (§7), seguindo as `_notes` do JSON.

**Chave nova** (ex.: um `aria-label` que não existe): o dono do i18n é o `shell`. Peça no retorno com o caminho e o texto nos 3 idiomas (pt-BR; en; es neutro latino-americano com "tú"). Quem adiciona roda `yarn i18n:check`.

---

## 5. Rotas — `src/config/routes.ts`

`ROUTES` é o mapa `chave → { paths: {pt,en,es}, copy, meta, h1, gate?, noindex?, layout?, error? }` com os slugs de BLUEPRINT §3.1. Chaves: `home, how_we_work, discovery_sprint, services_hub, service_web_systems, service_mobile_apps, service_integrations, service_mvp, service_support, pricing, quote, quote_sent, contact, privacy, not_found, cases_hub, case, about, blog_hub, blog_post`.

| Helper | Retorna |
|---|---|
| `urlFor(key, locale, params?)` | caminho interno na política (§2); lança erro se a página não existe no idioma |
| `anchorFor(key, locale, id)` | `urlFor + #id` |
| `quoteHref(locale, { origem, servico?, entrada?, ref? })` | link do wizard com atribuição (`/orcamento?servico=mvp&origem=mvp-hero`) |
| `canonicalUrl(key, locale, params?)` | URL absoluta (null na 404) |
| `alternates(key, params?)` | pares hreflang recíprocos pt-BR/en/es + `x-default`→pt; `[]` se só 1 idioma (blog) ou 404 |
| `localeFromPath(path)`, `matchRoute(path)`, `normalizePath(path)`, `isNoindexPath(path)` | utilidades (sitemap, seletor de idioma) |
| `isRouteLive(key, features)` | when_data: a página existe com as flags atuais? |
| `SERVICE_KEYS`, `SERVICE_ROUTE`, `SERVICE_PARAM`, `serviceFromParam()` | os 5 serviços |
| `ANCHORS` | âncoras estáveis: `homeMethod` (`#como-trabalhamos`), `stage.{diagnosis,discovery,development,support}` (`#diagnostico`...), `investment`, `faq`, `engineering` (`#como-construimos`), `discoveryFormat` (`#como-acontece`), `supportFormat` (`#formato`), `relatedCases` (`#cases-relacionados`), `methodProof` (`#na-pratica`) |
| `METHOD_SHORT_PATH`, `METHOD_SHORT_UTM` | URL curta do método por idioma (`/metodo`, `/en/method`, `/es/metodo`), usada no "Copiar resumo" do pós-envio; o 301 está no netlify.toml e o teste do shell confere o par |

**Como as páginas são geradas:** arquivos finos por idioma em `src/pages/` renderizam uma *view* compartilhada em `src/views/` (`<HowWeWorkView locale="en" />`). Slugs ficam explícitos na árvore, cada agente é dono dos seus arquivos, e não há catch-all disputado.

- Serviços: `servicos/[servico].astro`, `en/services/[service].astro`, `es/servicios/[servicio].astro` (getStaticPaths a partir de `SERVICE_KEYS`).
- when_data de rota única (hub de cases, sobre, blog): `[gated].astro` em cada idioma, gerando só as rotas com `isRouteLive`. Detalhe: `cases/[slug].astro`, `en/cases/[slug].astro`, `es/casos/[slug].astro`, `blog/[slug].astro` (getStaticPaths devolve `[]` sem dado).
- **Página nova ou slug novo = mudança em `routes.ts` (pedido ao shell)**, além do arquivo fino. O `verify-build` derruba o build se uma rota de `routes.ts` não for gerada, se o único H1 não for o texto da chave `h1` da rota, ou se sobrar placeholder do i18n sem interpolar (`{email}`, `{politica}`…) no texto visível, num atributo lido (alt, title, aria-label, meta content) ou no JSON-LD de qualquer página (`placeholderProblems()`; props de ilha, `<script>` comum e `<pre>/<code>` ficam de fora). Toda chave com `{…}` passa por `interpolate()`.

---

## 6. Layout, SEO, canonical e hreflang

```astro
<Base locale={locale} route="pricing"
      title={t(locale, "meta.pricing.title")} description={t(locale, "meta.pricing.description")}
      whatsappMessage={message} ctaOrigin="preco-barra">
  …seções…
</Base>
```

| Prop | Padrão |
|---|---|
| `locale`, `route`, `title`, `description` | obrigatórios (`meta.*.title` já termina em "\| Lemamon") |
| `params` | slug de case/post |
| `noindex` | vem de `routes.ts` (`quote_sent`, `not_found`) |
| `variant` | vem de `routes.ts` (`quote`, `quote_sent` = `"wizard"`: header/footer mínimos, sem barra fixa nem WhatsApp flutuante) |
| `whatsappMessage` | `message_home`; a view passa a da página (§7.7) |
| `ctaOrigin` | `?origem=` do CTA do header/barra fixa |
| `ogImage`, `jsonLd`, `alternates` | opcionais (sobrescrevem o padrão) |

- `<html lang>` = `LOCALE_META[locale].htmlLang`. `<main id="conteudo" tabindex="-1">` é o alvo do skip link.
- `SEO.astro` (shell) gera title, description, robots, **canonical = `canonicalUrl()`**, **hreflang = `alternates()`**, OG e Twitter. Ninguém escreve `<link rel="canonical">` ou `hreflang` à mão.
- JSON-LD: `Faq` emite `FAQPage` só com os itens visíveis; `Breadcrumb` emite `BreadcrumbList`; Organization/ProfessionalService (Home, Sobre), Service (serviços, Sprint) e OG por página/idioma são do shell **dentro de `SEO.astro`, por chave de rota** — as views não precisam mudar para isso. Article do post vem do gated via prop `jsonLd`.
- Fontes: o Base pré-carrega os dois woff2 com o hash do build (mesma URL do `@font-face`).
- `LanguageSelector` aceita `as="nav"|"group"` (rodapé = landmark `nav`; header e drawer = `group`) e emite `language_change` pelo listener delegado. `LanguageSuggestion` (aviso discreto de idioma, só quando o idioma da página não está entre os do navegador; fechar é persistente) e `ResumeLabel` (rótulo "Continuar meu pedido" sem layout shift) são do shell.
- JSON-LD Organization em /sobre com `hasCompanyData`: `legalName`, `taxID` (CNPJ formatado por `formatCnpj`) e `foundingDate` quando houver; `og:type = article` nos posts.

---

## 7. Flags when_data — `src/config/features.ts`

```astro
---
import { getFeatures, pricingLinesFor } from "@/config/features";
const features = await getFeatures();          // memoizado; valida configs e lê as coleções
---
{features.hasTestimonials && <section …>…</section>}
```

Flags: `hasPricing` (+ `pricingLines`), `hasBudgetTiers`, `hasMonthlyTiers`, `hasProfiles` (+ `profiles.{github,linkedin,medium}`), `hasAgenda`, `hasCompanyData`, `hasDiscoveryFormat`, `hasSupportFormat`, `hasEngineering` (+ `engineeringFields`), `hasLogos` (≥ 4), `hasTestimonials` (≥ 1 nominal), `hasCases` (≥ 2 publicados nos 3 idiomas, + `casesByService`), `hasTeam` (≥ 1 completo que atua em projetos), `hasPosts` (≥ 3), `confirm.<item>` (um por item de `confirmacoes.ts`), `hasWhatsapp`, `hasGa4`. Helpers: `hasPriceLine(features, id)`, `pricingLinesFor(features, ids)`.

**Como uma seção when_data se esconde (regra de build, não de CSS):**

1. O componente da seção é **auto-gated**: lê a flag e, sem dado, não renderiza NADA — nem `<section>`, nem título, nem âncora, nem wrapper. Nunca `display:none`, nunca "em breve".
2. A view só posiciona `<LogosStrip locale={locale} />`; quem decide é o componente. Componentes when_data recebem só `locale` (e `service` quando preciso) e buscam o próprio dado, para não exigir mudança na view de outro dono.
3. Página when_data inteira: só é gerada com a flag (`isRouteLive` no `getStaticPaths`). Sem página, não há HTML, sitemap, hreflang, item de menu nem link de footer: header/footer usam `components/shell/nav.ts`, que consulta as mesmas flags.
4. Dado parcial não renderiza: texto de config precisa estar preenchido nos 3 idiomas (`isFilledText`); entrada de coleção só existe se passar no schema Zod (campo faltando quebra o build). Config malformado (CNPJ inválido, URL sem https, 5 faixas no wizard, score D sem confirmação) **derruba o build** (`validate.ts`).
5. Nenhum valor monetário fora de `dados/dono.json › precos` e `› qualificacao` (o teste `no-money` varre `src/` inteiro, inclusive comentários dos `.ts`, as outras seções do dono.json e os MDX). Faixas do wizard só dentro da ilha (§10).
6. Testes de gate usam fixtures em `tests/fixtures/` com `computeFeatures()` (puro); nunca conteúdo em `src/content/` nem em `dados/`. `baseSources()` = tudo vazio; `realSources()` = o dono.json de hoje.

Coleções (`src/content.config.ts`, loaders em `src/content/loaders.ts`): `cases` = `src/content/cases/<pt|en|es>/<slug>.mdx` (mesmo nome de arquivo nos 3 idiomas, a chave do case; em en/es, `slugUrl` no frontmatter dá o slug da URL, auditoria de SEO S01-3), `posts` = `src/content/posts/*.mdx` (só pt-BR), `time`/`depoimentos`/`logos` = listas de `dados/dono.json` (cada item com `id`). Consultas prontas em `src/lib/content.ts` (`caseItems(locale)`, `postItems()`).

### 7.1 Dados do dono — `dados/dono.json` (fonte única) e camada fictícia

- **Tudo que vem do dono mora em `dados/dono.json`** (13 seções; playbook `docs/playbooks/00-DADOS-DO-DONO.md` campo a campo). Nada de dado do dono hardcoded em `.ts`. Cada `src/config/<seção>.ts` lê a sua seção com import NOMEADO do JSON (`import { precos as precosJson } from "../../dados/dono.json"`), exporta `<seção>Real(ais)` (o JSON puro) e `<seção>` (com a camada fictícia por cima quando ligada) e mantém os tipos e helpers de antes. O import nomeado é o que mantém o bundle da ilha só com `precos` e `qualificacao`.
- **Sintaxe** (`src/config/json-do-dono.ts`): o `astro:config:setup` da integração lê o `dados/dono.json` antes do `astro sync`/`check` e de qualquer import; vírgula sobrando, comentário, aspas simples, vírgula faltando etc. derrubam o build em pt-BR com arquivo, linha, coluna, motivo e a linha com uma seta (`[dados] dados/dono.json não é um JSON válido (linha 123, coluna 14): vírgula sobrando depois do último item. JSON não aceita vírgula final nem comentário.`). No `astro dev`, o mesmo erro sai no import (transform antes do `vite:json`) e nos loaders.
- **Validação** (`src/config/validate.ts`): Zod com mapa de erro em pt-BR; toda mensagem sai como `dados/dono.json › caminho.do.campo: problema`. Roda no `getFeatures()` (documento inteiro, inclusive seção/campo desconhecido e dado com cara de fictício no arquivo real) e nos loaders de `time`/`depoimentos`/`logos` (antes do schema do Astro; imagens relativas a `dados/`, conferidas no disco). `dados/dono.schema.json` só serve ao editor; o teste `dados-validacao` garante que ele aceita os dois arquivos e acompanha as seções do Zod.
- **Texto de EXEMPLO nunca vale no dado real** (`textoDeExemplo()` em `src/content/schemas.ts`): "(exemplo)/(example)/(ejemplo)", rótulos no começo ("Exemplo:", "Texto de exemplo", "Condições de exemplo", "Depoimento de exemplo", "Conteúdo de exemplo"… nos 3 idiomas), "post/case/conteúdo de exemplo", "fictício" e `example.com` derrubam o build em QUALQUER campo do `dono.json` (`marcasFicticiasNoReal`), no frontmatter de cases e posts (`caseSchema`/`postSchema`; aceito só com a camada ligada, para os MDX de `dados/ficticio/`) e no frontmatter e no corpo de todo MDX REAL de `src/content/` (loader, em qualquer modo). "por exemplo" no meio da frase passa.
- **Cópia da camada no dado real** (`copiasDaCamadaFicticia()`, no `astro:config:setup`, em TODO build, em qualquer modo): confere TODO arquivo de `src/`, `public/` e `dados/` — fora a própria camada, o `dados/dono.schema.json`, os testes e quem DESCREVE a camada (`DESCREVEM_A_CAMADA`: `src/config/camada-ficticia.ts`, `src/integrations/dados-ficticios.ts`, `src/content/loaders.ts`, `src/content/schemas.ts`; no i18n, só a chave `shared.fictitious_data`). Derrubam o build: (1) no `dono.json`, valor distintivo do `dono.ficticio.json` ou do frontmatter de um MDX fictício IGUAL a um valor dele (mensagem com o caminho dos dois lados); (2) em qualquer arquivo de texto (código **sem comentários**), um valor de identidade (nome, razão social, CNPJ, e-mail, URL, slug) ou distintivo da camada, uma frase do corpo de um MDX fictício, o nome de um arquivo da camada, um texto de SVG fictício ou uma imagem fictícia em base64; (3) JSON com ≥ 50% da estrutura ou ≥ 5 textos do `dono.ficticio.json` (cópia do arquivo fictício para fora de `dados/`, mesmo com os nomes trocados); (4) em qualquer arquivo, texto ou binário, imagem fictícia idêntica ou com uma das suas **janelas de 48 bytes crus** (pega cópia com bytes a mais, a menos ou embutida); (5) imagem **parecida** com uma fictícia (correlação ≥ 0,95 em tons de cinza, inteira ou como recorte de 80–100% da largura: pega recodificação para JPG/WebP, redimensionamento, troca de cor, corte da faixa EXEMPLO). Distintivo = tem "exemplo/example/ejemplo/fictício" ou é texto de 16+ caracteres que não é id/enum; ids e enums (`tier_*`, `BRL`, `legitimo_interesse`) coincidem por definição e são ignorados. A semelhança usa o `sharp` (dependência do Astro para imagens), carregado por `require` a partir da raiz; sem ele o build cai em vez de pular a conferência.
- **Quem lê a camada**: só `src/content/loaders.ts` (listas e MDX, por fs) e `src/integrations/dados-ficticios.ts` (módulo virtual e varredura, por fs). Os caminhos (`ARQUIVO_FICTICIO`, `PASTA_FICTICIA`) moram nesses dois arquivos. **Nenhum módulo importa nem cita `dados/dono.ficticio.json` ou `dados/ficticio/**`**. Com a camada desligada, a CAMADA 1 da trava é o plugin Vite da integração (`enforce: "pre"`): `resolveId`/`load` derrubam import que resolve para lá (inclusive `?raw`, `?inline`, `?url` e `import.meta.glob`); `transform` derruba código do projeto (`.astro`, `.css`, `.js`, `.ts`, `.mdx`…, fora `node_modules`, os dois leitores e os testes) que CITA a camada fora de comentário — é o que pega `url()` de CSS e `new URL(…, import.meta.url)`, que o Vite resolve por dentro, sem `resolveId`; `generateBundle` derruba asset ou chunk que veio da camada. Caminho montado em tempo de execução ou leitura por fs no frontmatter passam da camada 1 e caem na CAMADA 2 (varredura do `dist/`). O teste `dados-vazamento` › "trava estática" procura `dono.ficticio`/`dados/ficticio` fora de comentário em todo `src/`.
- **Camada fictícia**: `dados/dono.ficticio.json` + `dados/ficticio/` (cases, posts, imagens geradas). Liga **só** com `PUBLIC_DADOS_FICTICIOS=true` **e** fora de produção. Duas travas que precisam concordar: a integração `src/integrations/dados-ficticios.ts` (antes do build, pelo `CONTEXT`; em produção o módulo virtual `virtual:lemamon/dados-ficticios` sai vazio e o build avisa `IGNORADO`) e `MODO_FICTICIO` em `src/config/dono.ts` (runtime, com `isProductionDeploy()`). Merge por cima que só preenche lacuna (`null`, `""`, `[]`, `false`); listas são atômicas.
- **Ligada**: `Base.astro` põe a faixa `<div class="fictitious-banner" role="note" data-dados-ficticios style="…">` (i18n `shared.fictitious_data.banner`) e `SEO.astro` troca o robots por `noindex,nofollow`, em TODA página. O estilo da faixa é INLINE, dentro do ramo `MODO_FICTICIO`: sem a camada não sai nem a classe nem o CSS (os dois são marcadores). Ninguém mais consulta `MODO_FICTICIO` para decidir layout: as seções continuam perguntando às flags.
- **Saída do build**: com a camada ligada, a integração troca a saída que é — pelo **caminho real** (link simbólico para `dist/`, inclusive quebrado, conta) — a pasta publicada `dist/` ou fica dentro dela por `dist-ficticio/` (`saidaDoBuildFicticio()`); `--outDir` explícito para outra pasta (testes, E2E) é respeitado. Exceção: deploy preview/branch deploy do Netlify com a variável no ambiente do PROCESSO (painel); vinda só de um `.env` local, o build também é desviado. `dist-ficticio/` que aponta para `dist/` derruba o build, e um build fictício que ainda assim termine no `dist/` fora de preview é reprovado e apagado.
- **Build reprovado não deixa saída**: o plugin grava `<saída>/.build-incompleto` no começo do build e a integração só o apaga depois que a conferência final passa. Falha no `astro:build:done` apaga a pasta antes de derrubar o build; falha em qualquer outro ponto (prerender, outra integração) apaga a pasta na saída do processo (`process.on("exit")`, código ≠ 0). Guardas de `podeApagarSaida()`: nunca a raiz, um ancestral dela, pasta fora do projeto (exceto a publicada, mesmo por link) ou pasta com `package.json`/`src`/`dados`/`.git`.
- **Trava pós-build** (CAMADA 2, mesma integração): sem a camada, qualquer marcador fictício no `dist/` derruba o build — nomes, CNPJ, textos, todo valor de frontmatter e as frases do corpo dos MDX fictícios, slugs, a classe e o atributo da faixa, `noindex,nofollow` — e qualquer imagem fictícia: pelo nome, pelo texto dos SVGs, idêntica (sha256), com bytes a mais ou a menos (janelas de bytes crus, em qualquer arquivo, também em base64 nos 3 alinhamentos) ou parecida (a mesma semelhança perceptual de cima: pega a webp/jpg que o próprio Astro gera); com a camada, página sem faixa ou sem `noindex,nofollow` derruba o build. `privacyLaunchBlockers()` lê só o dado REAL e recusa valor com cara de fictício: o build de produção continua falhando até `empresa`/`privacidade` reais. Em produção com a flag ligada e dado real, o `dist/` sai byte a byte igual ao de produção sem a flag (teste `dados-vazamento`).

---

## 8. Medição (atributos de dados)

CTAs e links levam atributos; o shell liga **um** listener delegado (Analytics.astro / `src/scripts/`) que chama `track()` de `src/lib/analytics.ts`:

| Atributos | Evento |
|---|---|
| `data-track="cta_click" data-cta-id="diagnosis" data-origem="home-hero"` | `cta_click {cta_id, origem}` |
| `data-track="whatsapp_click" data-source="floating"` | `whatsapp_click {source}` |
| `data-track="profile_click" data-profile="github"` | `profile_click {profile}` |
| botão `data-copy` (CopyEmail) | `email_copy {source}` (já ligado no CopyEmail) |
| `data-resume-cta` | CTA que vira "Continuar meu pedido" com rascunho válido |
| `data-track="language_change" data-from-lang data-to-lang` | `language_change {from_lang, to_lang}` (LanguageSelector) |

O mesmo script global (`src/scripts/analytics-delegate.ts`, carregado em toda página pelo `Analytics.astro`) chama `rememberLanding()`: o toque da sessão (primeira página, referrer externo, utm_*, gclid, gbraid/wbraid) fica no `sessionStorage` e o wizard e o `/contato` o enviam em `attribution`/`gclid` (`src/lib/attribution.ts`). Ele também liga, de `src/lib/analytics.ts`, o toque de campanha entre abas (`shareCampaignTouch`: aba nova adota o toque de outra aba aberta por BroadcastChannel), o "Ref.: G-{campanha}" nos links de WhatsApp depois de clique pago (`campaignRef`) e o modo `?debug_analytics=1` (eventos no console, nada enviado). `reportError()` manda `lead_failed` ao New Relic como PageAction e `noticeError`.

**Rótulo do CTA primário** ("Pedir diagnóstico gratuito"): nunca `t(locale, "shared.cta.primary")` direto num CTA de diagnóstico; use `t(locale, primaryCtaKey(features))` (`src/config/features.ts`), que devolve `shared.cta.primary_schedule` ("Agendar diagnóstico gratuito") com `hasAgenda` (BLUEPRINT §4 e §8.6). Já fazem isso `ResumeLabel` (header, drawer, barra fixa), `CtaDiagnosis`, `TextCta`, o rodapé e o `Investment`; texto de link que embute o rótulo (`home.problem.link_text`, `contact.form.new_project_tip`, `contact.form.success_new_project_link`) passa por `withPrimaryCtaLabel()`. "Continuar meu pedido" (`data-resume-cta`, rascunho válido) continua tendo precedência. `label="method"` ("Começar pelo diagnóstico gratuito") não muda.

`CtaDiagnosis` e `WhatsAppCta` já emitem os atributos. Ilha e scripts chamam `track(nome, params)` direto (eventos tipados de §7.11 em `EventParams`). Nenhum evento anterior a `lead_submitted` leva valor de resposta do wizard.

---

## 9. CSS e tokens

- `src/styles/tokens.css` (dono: home) é a única fonte de cor, tipo, espaço, raio, sombra, motion, camada. **Nenhum hex/rgb/px literal de cor, raio ou sombra fora dele.** Componentes usam os semânticos: `--color-*`, `--text-*`/`--leading-*`, `--space-*`, `--section-{compact,default,spacious}`, `--radius-*`, `--shadow-*`, `--duration-*`/`--ease-*`/`--transition-*`, `--z-*`, `--target-{min,option,cta}`.
- Seção escura (método, CTA final): `data-surface="inverse"` (ou `<Section surface="inverse">`). Os mesmos nomes semânticos passam a valer para fundo escuro. Não existe tema escuro global.
- Contraste (verificado e documentado no topo de `tokens.css`): âmbar é **fundo de ação**, nunca texto nem anel de foco sobre fundo claro. Borda de campo = `--color-border-control` (3:1). Foco = `--color-focus-ring` (ink-600 no claro, amber-400 no escuro), já aplicado globalmente em `:focus-visible` — não sobrescreva com `outline: none`.
- Estilo de componente: `<style>` escopado do próprio `.astro`. Nada de antd, styled-components ou CSS-in-JS. Na ilha React: CSS module (`*.module.css`) com os tokens.
- Breakpoints (literais em `@media`, espelhados em `src/styles/breakpoints.ts`): xs 380 · sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536. Navegação: mobile < 768 · tablet 768–1023 · desktop ≥ 1024.
- Fonte: Motiva Sans, só **300** e **700** (pesos ≤ 500 renderizam a Light; ≥ 600, a Bold), woff2 com subset latino, `font-display: swap`.
- Utilitários globais: `.container` (`data-width="prose|wide"`), `.stack` (`--stack-space`), `.prose`, `.sr-only`, `.skip-link`. `prefers-reduced-motion` já zera animações/transições.
- Primitivos com API estável (home): `Section` (`id, spacing, surface, width, labelledby, label, as`), `Button` (`href?, variant: primary|secondary|outline|ghost|whatsapp, size: sm|md|lg, full: boolean|"mobile", data-*`), `Icon` (`name, size`).

---

## 10. Ilha React (só o wizard)

```astro
<Wizard client:load locale={locale} copy={…getSection(locale, "quote…")…} flags={{ hasBudgetTiers: features.hasBudgetTiers, … }}
        sentUrl={urlFor("quote_sent", locale)} privacyUrl={urlFor("privacy", locale)} />
```

- Única ilha do site; JS fora dela só em `<script>` vanilla mínimo (drawer, dropdown, barra fixa, retomada, copiar e-mail).
- Textos entram **resolvidos por props** (montados no servidor com `getSection`). A ilha **nunca** importa `@/i18n` (iria o JSON inteiro para o bundle), `@/config/features` nem `@/lib/whatsapp-messages` (usam `astro:content`/zod/i18n).
- Props são serializadas no HTML (`<astro-island props=…>`): **nunca** passe faixas de orçamento ou preço por props. As faixas vêm de `import { qualificacao } from "@/config/qualificacao"` dentro da ilha (bundle do cliente). Por props, só booleanos (`hasBudgetTiers`).
- Módulos seguros para a ilha: `@/config/qualificacao`, `@/config/precos`, `@/config/dono`, `@/config/camada-ficticia`, `@/config/types`, `@/config/site`, `@/config/routes`, `@/lib/{analytics,whatsapp,forms,draft}`, `@/styles/breakpoints`. `qualificacao.ts` e `precos.ts` importam só a própria seção do `dados/dono.json` (import nomeado): nunca importe o JSON inteiro (`import dono from …`) num módulo que a ilha alcança — ele leva autorizações e dados internos para o bundle.
- A raiz da ilha e o formulário de `/contato` levam `data-nr-block` (fora do replay do New Relic — i18n `_notes.privacy_conditionals`).
- Rascunho: `src/lib/draft.ts` (`DRAFT_KEY = "lemamon:orcamento:v2"`, TTL 30 dias). O script inline do shell recebe esses valores por `define:vars`.
- Netlify Forms: campos em `src/lib/forms.ts` (`FORM_FIELDS`, iguais em todos os idiomas); a declaração estática (`components/quote/NetlifyForms.astro`) usa a mesma lista e já está publicada nas 3 páginas do wizard.
- O progresso "Pergunta N de 6" do modo foco é desenhado pela ilha no alvo `[data-wizard-progress]` do `WizardHeader` (createPortal); o link "Dúvidas? WhatsApp" do header leva `[data-wizard-help]` e a ilha troca a mensagem dele entre `entry_direct` e `wizard_question`.
- O `briefing` tem o campo oculto `subject` = `[score] protocolo` (assunto da notificação do Netlify, sem dado pessoal), declarado com `data-remove-prefix`.
- Os `<MethodTimeline>` passados como slot ao resumo do wizard usam `links="none"`. Nomes de slot em camelCase (o renderer React não converte kebab-case no cliente).

---

## 11. Netlify

- `netlify.toml`: `NODE_VERSION 22`, `YARN_VERSION 1.22.22`, `yarn build` → `dist`.
- Redirects de BLUEPRINT §10.1 no topo, nesta ordem: `/projects` e `/projects/*` → `/orcamento` (301, a query string vai junto), `/diagnostico` → `/orcamento` (301), `/metodo` · `/en/method` · `/es/metodo` → página do método com `utm_source=resumo_copiado&utm_medium=compartilhamento` (301), `/lemamon` e `/home` → `/` (301), `/post/*` → `/` (301), `/?lng=en|es` → `/en/` | `/es/` (301, por query), `/blog` → `/` (**302 sem force**: some sozinho quando `blog.html` existir), `/en/*` e `/es/*` → 404 do idioma. **Sem catch-all de SPA** (`public/_redirects` foi apagado).
- Headers: nosniff, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, HSTS, COOP; CSP em **Report-Only** (o shell promove depois de validar GA4/Ads/NR/forms no deploy de produção; ao promover, `'unsafe-inline'` vira `'sha256-…'` de cada script inline listado no comentário do netlify.toml: head-inline, o script do `<head>` do QuoteView, o snippet do gtag, o runtime inline de ilha do Astro e os `<script type="module">` pequenos que o Astro embute inline, ou `vite.build.assetsInlineLimit = 0`); `/_astro/*` com `Cache-Control: public, max-age=31536000, immutable`.
- Medição de produção (Google Ads, New Relic, GA4) só com `CONTEXT=production` (`isProductionDeploy()` em `config/site.ts`): preview nunca gera conversão.
- `PUBLIC_DADOS_FICTICIOS` nunca é criada no contexto de produção. Se for, a camada é ignorada (aviso no log) e o site usa só `dados/dono.json`. Em deploy preview ela pode ligar (com faixa e `noindex,nofollow`).

---

## 12. Tabela de OWNERSHIP

Cada caminho tem **um** dono. Só ele edita. Diretório com `/**` inclui arquivos novos dentro dele.

| Agente | Escopo | Arquivos/diretórios que SÓ ele edita |
|---|---|---|
| **shell** | layout, SEO, navegação, chrome do wizard, infra | `src/layouts/**` · `src/components/shell/**` · `src/scripts/**` · `src/integrations/**` (exceto `dados-ficticios.ts`) · `src/env.d.ts` · `src/i18n/**` (**pt.json, en.json, es.json**, index.ts, locales.ts) · `src/config/routes.ts` · `src/config/site.ts` · `src/config/privacidade.ts` · `src/views/PrivacyView.astro` · `src/views/NotFoundView.astro` · `src/pages/404.astro` · `src/pages/en/404.astro` · `src/pages/es/404.astro` · `src/pages/privacidade.astro` · `src/pages/en/privacy.astro` · `src/pages/es/privacidad.astro` · `public/**` · `astro.config.mjs` · `netlify.toml` · **`package.json`** · `yarn.lock` · `.yarnrc` · `tsconfig.json` · `vitest.config.ts` · `playwright.config.ts` · `.env.example` · `.gitignore` · `scripts/check-i18n.mjs` · `scripts/build-og-image.sh` · `tests/unit/i18n.test.ts` · `tests/unit/routes.test.ts` · `tests/unit/verify-build.test.ts` · `tests/e2e/smoke.spec.ts` · `tests/e2e/shell-*.spec.ts` |
| **home** | Home ×3 + componentes compartilhados de §5 + design system | `src/views/HomeView.astro` · `src/pages/index.astro` · `src/pages/en/index.astro` · `src/pages/es/index.astro` · `src/components/home/**` · `src/components/shared/**` · `src/components/ui/**` · `src/styles/**` (**tokens.css**, global.css, breakpoints.ts) · `src/assets/**` · `scripts/build-fonts.sh` · `tests/unit/home-*.test.ts` · `tests/unit/shared-*.test.ts` · `tests/e2e/home-*.spec.ts` |
| **pages** | Como trabalhamos, Sprint de Descoberta, Quanto custa, Serviços (hub + 5) ×3 | `src/views/HowWeWorkView.astro` · `src/views/DiscoverySprintView.astro` · `src/views/PricingView.astro` · `src/views/ServicesHubView.astro` · `src/views/ServiceView.astro` · `src/components/how-we-work/**` · `src/components/discovery/**` · `src/components/pricing/**` · `src/components/services/**` · `src/pages/como-trabalhamos.astro` · `src/pages/sprint-de-descoberta.astro` · `src/pages/quanto-custa.astro` · `src/pages/servicos.astro` · `src/pages/servicos/[servico].astro` · `src/pages/en/how-we-work.astro` · `src/pages/en/discovery-sprint.astro` · `src/pages/en/pricing.astro` · `src/pages/en/services.astro` · `src/pages/en/services/[service].astro` · `src/pages/es/como-trabajamos.astro` · `src/pages/es/sprint-de-descubrimiento.astro` · `src/pages/es/cuanto-cuesta.astro` · `src/pages/es/servicios.astro` · `src/pages/es/servicios/[servicio].astro` · `tests/unit/pages-*.test.ts` · `tests/e2e/pages-*.spec.ts` |
| **conversion** | wizard, /orcamento, /orcamento/enviado, /contato, envio, analytics, WhatsApp | `src/islands/**` · `src/views/QuoteView.astro` · `src/views/QuoteSentView.astro` · `src/views/ContactView.astro` · `src/components/quote/**` · `src/components/quote-sent/**` · `src/components/contact/**` · `src/lib/analytics.ts` · `src/lib/whatsapp.ts` · `src/lib/whatsapp-messages.ts` · `src/lib/forms.ts` · `src/lib/draft.ts` · `src/pages/orcamento.astro` · `src/pages/orcamento/enviado.astro` · `src/pages/contato.astro` · `src/pages/en/quote.astro` · `src/pages/en/quote/sent.astro` · `src/pages/en/contact.astro` · `src/pages/es/cotizacion.astro` · `src/pages/es/cotizacion/enviada.astro` · `src/pages/es/contacto.astro` · `tests/unit/wizard-*.test.ts` · `tests/unit/conversion-*.test.ts` · `tests/e2e/quote-*.spec.ts` · `tests/e2e/contact-*.spec.ts` |
| **gated** | coleções, schemas, configs, flags e tudo que é when_data; DADOS DO DONO e camada fictícia | `dados/**` · `src/config/dono.ts` · `src/config/camada-ficticia.ts` · `src/config/json-do-dono.ts` · `src/integrations/dados-ficticios.ts` · `scripts/gerar-imagens-ficticias.mjs` · `tests/unit/dados-*.test.ts` · `tests/unit/support/**` · `src/content.config.ts` · `src/content/**` · `src/config/features.ts` · `src/config/validate.ts` · `src/config/types.ts` · `src/config/precos.ts` · `src/config/qualificacao.ts` · `src/config/confirmacoes.ts` · `src/config/perfis.ts` · `src/config/agenda.ts` · `src/config/empresa.ts` · `src/config/descoberta.ts` · `src/config/sustentacao.ts` · `src/config/engenharia.ts` · `src/lib/content.ts` · `src/components/gated/**` · `src/views/CasesHubView.astro` · `src/views/CaseView.astro` · `src/views/AboutView.astro` · `src/views/BlogHubView.astro` · `src/views/BlogPostView.astro` · `src/pages/[gated].astro` · `src/pages/en/[gated].astro` · `src/pages/es/[gated].astro` · `src/pages/cases/[slug].astro` · `src/pages/en/cases/[slug].astro` · `src/pages/es/casos/[slug].astro` · `src/pages/blog/[slug].astro` · `tests/fixtures/**` · `tests/unit/features.test.ts` · `tests/unit/no-money.test.ts` · `tests/unit/gates-*.test.ts` |
| **playbooks** | documentação operacional | `docs/playbooks/**` (não toca em código) |
| **integrador** (ninguém mais) | — | `docs/arquitetura/**` · `README.md` · `.claude/**` · `tests/e2e/support/**` · `tests/e2e/quote-money-path.spec.ts` · `tests/e2e/quote-resume-prefill.spec.ts` · `tests/e2e/site-navigation.spec.ts` · `tests/e2e/redirects.spec.ts` (`legacy/` e `Stub.astro` já apagados) |

**Arquivos compartilhados com dono único:** `src/config/routes.ts` → shell · `src/i18n/*.json` → shell · `src/config/features.ts` → gated · `src/styles/tokens.css` → home · `package.json`/`yarn.lock` → shell.

**Importar é livre** (ex.: `pages` usa `MethodTimeline` do home, `Breadcrumb` do shell, `RelatedCases` do gated). APIs (props) de componentes compartilhados são estáveis: o dono pode mudar o visual à vontade, mas mudar props exige combinar com quem usa (pedido no retorno).

---

## 13. Pedido de mudança em arquivo de outro dono

No retorno, inclua uma seção **"Pedidos a outros donos"** com uma linha por pedido:

```
[para: shell] src/i18n/{pt,en,es}.json — adicionar shared.a11y.close_dialog
  pt: "Fechar"  ·  en: "Close"  ·  es: "Cerrar"
  motivo: aria-label do botão de fechar do drawer (BLUEPRINT §8.1)
[para: gated] src/config/features.ts — expor features.hasCaseForService(service) para o pós-envio
  motivo: §7.8 meanwhile mostra 2 cases do serviço escolhido
[para: home]  src/components/shared/Faq.astro — prop `footer` (slot) para o link "Mais sobre preço" da Home
```

Enquanto o pedido não entra, **não** contorne copiando o arquivo nem duplicando lógica: use o que existe e deixe o ponto pendente listado.

---

## 14. Stubs da fundação

- **Concluído na integração:** nenhuma seção usa mais `<Stub>`; `src/components/dev/Stub.astro` foi apagado e `grep -rn "dev/Stub\|data-stub" src` volta vazio (o teste `shared-render` confere que nenhuma página tem `data-stub`).
- Cada hero já renderiza o **único H1** da página com a chave de `routes.ts`; mantenha o texto do H1 = i18n (o build confere).

---

## 15. Decisões abertas e pendências conhecidas

1. **Perfis:** decidido pelo dono (decisão 6) — GitHub, LinkedIn e Medium com `publicar: true` em `dados/dono.json › perfis`, então footer (BLUEPRINT §4/§8.5) e seções gated mostram os três. Para tirar um do ar, `publicar: false`.
2. **Política de Privacidade:** `privacyLaunchBlockers()` lista o que falta (controlador, base legal de anúncios, encarregado, prazos, data; e ferramentas opcionais declaradas pela metade ou agenda ligada sem estar na Política). A trava está **LIGADA**: o build de produção do Netlify (`CONTEXT=production`) falha de propósito enquanto a lista não estiver vazia. Preview e local buildam. Dono: preencher com dado REAL `dados/dono.json › privacidade` e `› empresa` (playbook 00 §A2–A3); dado fictício nunca satisfaz a trava.
3. **OG image e manifest: resolvidos.** Cartões 1200×630 por página e idioma em `public/assets/img/og/<rota>-<idioma>.jpg` (scripts/build-og-image.sh); ícones novos; `manifest.json` só com o nome "Lemamon" (um manifest só, sem description, para não duplicar copy fora do i18n).
4. **CSP** em Report-Only até validar no preview.
5. **React 19** na ilha: só nas 3 páginas do wizard (medição no relatório de integração; a Home não carrega React).
6. **`/blog` 302** depende de o Netlify sombrear a regra quando `blog.html` existir — conferir com `curl -sI` no preview ao publicar o blog.
7. Âncoras e parâmetros não localizados (`#diagnostico`, `?origem=` em pt) também em en/es, de propósito (§2).
