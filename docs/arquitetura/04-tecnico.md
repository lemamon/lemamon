# Arquitetura Técnica

> Escopo: `lemamon.dev` — landing page + funil de captação da Lemamon.
> Objetivo de negócio: **converter mais visitantes em clientes**. Todo item abaixo é priorizado por impacto nessa métrica, não por elegância técnica.
> Base de análise: leitura integral do `src/`, build de produção executado localmente e sondagem da produção real em 31/07/2026.

---

## 0. Três correções factuais ao diagnóstico prévio

Antes de qualquer coisa, três premissas do briefing estão erradas e mudam a priorização inteira. Registro aqui porque decisões foram tomadas em cima delas.

**0.1 — A produção NÃO está no GitHub Pages. Está no Netlify.**

```
$ curl -sI https://lemamon.dev/projects
HTTP/2 200
server: Netlify
cache-status: "Netlify Edge"; hit; ttl=31535987
```

Consequências:
- `public/_redirects:1` (`/* /index.html 200`) está **correto e funcionando**. `/projects` e `/blog` retornam 200 com o `index.html` em refresh direto. O SPA fallback não está quebrado.
- `.github/workflows/pipeline.yaml` é um **pipeline fantasma**: builda e publica no GitHub Pages, e `https://lemamon-dev.github.io/lemamon.dev/` retorna **404**. Ou seja, a CI que existe no repositório deploya para lugar nenhum, e o deploy que serve o cliente real é configurado na UI do Netlify — fora do versionamento, sem `netlify.toml`, sem revisão, sem histórico.
- Isso é pior do que o problema original: não há uma fonte de verdade de build. Ninguém no repositório consegue responder "qual comando gera a produção".

**0.2 — `dist/` NÃO está versionado.**

```
$ git ls-files dist | wc -l
0
$ git log --oneline -- dist
(vazio)
```

`/dist` está em `.gitignore:14`. O diretório existia no disco local com artefatos de **out/2024** (`dist/index.html` de 2.397 bytes, anterior ao New Relic de fev/2025) — resíduo local do dev, não do repositório. Não é dívida técnica; é sujeira de máquina.

**0.3 — O backend de captação de leads está MORTO.** Isso é o achado mais grave do documento e vira o P0-1.

```
$ curl -i -X OPTIONS https://lemamon-email-service-eac435b5f8e8.herokuapp.com/send-email
HTTP/1.1 404 Not Found
Server: heroku-router
<title>No such app</title>
```

`No such app` não é dyno dormindo nem erro 500. É a aplicação **não existir mais** no roteador da Heroku. Todo lead que preenche o formulário em `/projects` hoje recebe a tela de erro do `src/components/ContactForm/index.tsx:71-88` e vai embora.

---

## 1. Resultado real do build

`yarn build` **não roda mais** neste repositório por dois motivos independentes.

**Motivo 1 — o gerenciador de pacotes.** O ambiente usa Yarn 4.18 via Corepack e o `yarn.lock` é formato v1:

```
Internal Error: lemamon.dev@workspace:.: This package doesn't seem to be present in your lockfile
```

Instalei via `npm install --no-save --no-package-lock --legacy-peer-deps` para conseguir medir. Nota do install: **9 vulnerabilidades (2 moderate, 6 high, 1 critical)** e `i18next-xhr-backend@3.2.2: replaced by i18next-http-backend` (deprecated).

**Motivo 2 — o `tsc` falha.** `package.json:32` define `"build": "tsc && vite build"`, e o `tsc` quebra:

```
src/service/index.ts(33,7): error TS2591: Cannot find name 'process'.
```

`tsconfig.json:18` restringe `"types": ["vite/client", "vite-plugin-svgr/client"]` — sem `node`. A linha `process.env.NODE_ENV` introduzida em `src/service/index.ts:33` (alteração **não commitada** na working tree) não compila. No commit `8b36ba2` (HEAD) o build passa; assim que essa alteração for commitada, **a CI quebra**. Em Vite o certo é `import.meta.env.PROD`.

**Bundle real** (`npx vite build`, Vite 5.4.21, 2846 módulos, 2.87s):

| Artefato | Bruto | Gzip | Quando carrega |
|---|---:|---:|---|
| `dist/index.html` | 73,53 kB | 22,46 kB | sempre |
| `assets/index-Dm1VY-Zi.css` (antd global) | **557,87 kB** | 67,83 kB | sempre, render-blocking |
| `assets/index-DohUYx-z.js` (entry) | **474,77 kB** | 159,13 kB | sempre |
| `assets/index-Doc-x55c.js` | **757,94 kB** | 170,43 kB | rota `/projects` |
| `assets/index-DzbFKMIN.js` (antd + prism) | 308,12 kB | 100,73 kB | rota `/post/:id` |
| `assets/Dropdown-DamMviVj.js` | 77,95 kB | 27,17 kB | `/projects` |
| `assets/react-awesome-reveal.esm` | 31,04 kB | 10,65 kB | sempre |
| demais 12 chunks | ~66 kB | ~24 kB | — |
| **Total JS emitido** | **~1,7 MB** | **~492 kB** | — |

O Rollup emitiu o aviso padrão de chunks > 500 kB.

**O que é o chunk de 757,94 kB.** Não é o blog, não é o Prism. Contei nele:

```
$ grep -o 'Outlined\|Filled\|TwoTone' dist/assets/index-Doc-x55c.js | sort | uniq -c
   234 Filled
   448 Outlined
   152 TwoTone
```

**834 ícones** — o barrel inteiro do `@ant-design/icons`, arrastado pelo `<Result>` do antd em `src/components/ContactForm/index.tsx:5`. A rota `/projects` — **a única rota de conversão do site** — é a mais pesada da aplicação: ~885 kB brutos extras (`index-Doc-x55c` + `Dropdown` + `EnterOutlined` + `index-Dr7Pitqu`) para desenhar um check verde e um X vermelho.

Traduzindo para negócio: o visitante que clica em "Comece seu projeto!" — o de maior intenção de compra do site — recebe o pior tempo de carregamento. Está pagando ~200 kB gzip de ícones que nunca verá.

---

## 2. Diagnóstico priorizado

### P0 — Bloqueante. Está custando cliente hoje.

**P0-1 · Endpoint de leads inexistente** — `src/service/index.ts:16`
```ts
const baseUrl = "https://lemamon-email-service-eac435b5f8e8.herokuapp.com";
```
App deletada da Heroku (404 `No such app`, verificado). **Impacto:** 100% dos leads do funil `/projects` são perdidos silenciosamente — o usuário vê "Erro ao criar projeto" e sai. É a definição de dinheiro no chão.
**Correção:** ver §6 (redesenho completo). Ação imediata de 30 minutos: trocar o `Result` de erro por um fallback de WhatsApp com o resumo do projeto pré-preenchido na URL, para não perder o lead enquanto o backend não volta.

**P0-2 · Build quebrado na working tree** — `src/service/index.ts:33` + `tsconfig.json:18`
`process.env.NODE_ENV` com `types` sem `node` → `TS2591`. **Impacto:** o próximo commit derruba a CI e congela a capacidade de publicar.
**Correção:** `import.meta.env.PROD`.

**P0-3 · Zero preview social** — `index.html:14-26`
Não existe `og:image`, não existe `twitter:card`, não existe `twitter:image`. **Impacto:** todo link de lemamon.dev colado em WhatsApp, LinkedIn ou Slack renderiza como texto cinza sem imagem. Para uma agência que vende por indicação e prospecção 1-a-1, isso corta a taxa de clique do link compartilhado pela metade ou mais. É a correção de maior retorno por hora de trabalho no documento inteiro.
**Correção:** `og:image` 1200×630 absoluta, `twitter:card=summary_large_image`, `og:image:width/height`, `og:locale=pt_BR`.

**P0-4 · Pipeline fantasma e ausência de fonte de verdade de deploy** — `.github/workflows/pipeline.yaml:47`
Publica em GitHub Pages (404 na prática) enquanto o Netlify serve a produção sem `netlify.toml` no repositório. Ainda no arquivo, `pipeline.yaml:36`:
```yaml
run: yarn install --legacy-peer-deps
```
`--legacy-peer-deps` é flag do **npm**, ignorada pelo yarn — e sem `--frozen-lockfile` o build não é reprodutível. **Impacto:** ninguém sabe o que está no ar; rollback é impossível; não há preview por PR.
**Correção:** deletar o workflow de Pages, adicionar `netlify.toml` versionado com build command, headers e deploy previews.

**P0-5 · Quatro crashes de runtime por `getElementById` sem null-check**

| Arquivo:linha | Gatilho |
|---|---|
| `src/components/Header/index.tsx:29` | clicar "Sobre"/"Missão"/"Serviços"/"Contato" no menu em `/blog`, `/projects` ou `/post/:id` |
| `src/common/ScrollToTop/index.tsx:26` | clicar o botão de subir em `/blog`, ou em `/projects` após iniciar o quiz (o `#intro` desmonta em `src/pages/Projects/index.tsx:17`) |
| `src/components/ContentBlock/index.tsx:38` | botão "Fale Conosco" (`path: "contact"`) fora da Home |
| `src/components/MiddleBlock/index.tsx:23` | `scrollTo(goToPath ?? "mission")` fora da Home |

Todos com `as HTMLDivElement` mascarando o `null`. **Impacto:** tela branca (não há Error Boundary em lugar nenhum — `src/router/index.tsx` só tem `Suspense`). O visitante que veio pelo blog e clica em "Contato" perde a página. Sessão encerrada, lead perdido.
**Correção:** um helper único e defensivo:
```ts
// src/common/utils/scrollToSection.ts
export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) { window.location.assign(`/#${id}`); return; }
  el.scrollIntoView({ behavior: "smooth" });
};
```
Mais um `ErrorBoundary` envolvendo o `<Switch>` em `src/router/index.tsx:21`.

### P1 — Corrói conversão de forma mensurável.

**P1-6 · Barrel de 834 ícones na rota de conversão** — `src/components/ContactForm/index.tsx:5`
757,94 kB / 170,43 kB gzip em `/projects`. **Correção:** remover `<Result>`, escrever os três estados (loading/sucesso/erro) com os componentes próprios de `src/common/`. Zero dependência nova, ~40 linhas.

**P1-7 · `antd/dist/antd.css` global** — `src/index.tsx:3`
557,87 kB brutos / 67,83 kB gzip de CSS **render-blocking em toda rota**, incluindo a Home que usa `Row`, `Col` e `Drawer`. O projeto já tem `styled-components` como sistema de estilo — o antd é usado para grid e três componentes. **Correção:** matar o import global; usar `@ant-design/babel-plugin-import` como paliativo ou, no destino final (§3), eliminar o antd.

**P1-8 · Hero não pinta no primeiro render** — `src/common/SvgIcon/index.tsx:7-17`
```tsx
useEffect(() => { setIconSrc(`${basePath}assets/img/svg/${src}`); }, [src]);
return iconSrc ? <img .../> : <span>Loading...</span>;
```
A imagem principal da Home (`developer.svg`) só existe depois de: baixar 474 kB de JS → hidratar → primeiro render (`Loading...`) → `useEffect` → segundo render → **só então** iniciar o download da imagem. `width="100%" height="100%"` como atributos HTML são inválidos e não reservam espaço → **CLS**. O `useEffect` é inútil: `import.meta.env.BASE_URL` é constante de build.
**Correção:** derivar a URL direto no corpo do componente, `width`/`height` numéricos reais, `fetchpriority="high"` no hero, `loading="lazy"` no resto, `<link rel="preload" as="image">` no `index.html`.

**P1-9 · `Cache-Control: max-age=0` em assets com hash de conteúdo**
```
$ curl -sI https://lemamon.dev/assets/index-DzC6TVDn.js | grep -i cache-control
cache-control: public,max-age=0,must-revalidate
```
Arquivos com hash imutável no nome sendo revalidados a cada visita. Brotli está ligado (bom), mas o visitante recorrente paga RTT em todos os chunks. **Correção:** `netlify.toml` com `Cache-Control: public, max-age=31536000, immutable` para `/assets/*`.

**P1-10 · `lazy()` acima da dobra + `Suspense fallback={null}`** — `src/pages/Home/index.tsx:4-8`, `src/router/index.tsx:18`
`Container`, `ContentBlock`, `MiddleBlock` e `ScrollToTop` estão todos em `lazy()`. Nenhum deles é opcional na Home — todos aparecem na primeira tela. O code splitting aqui **atrapalha**: adiciona um round-trip serial (entry → chunk da rota → chunks dos componentes) antes do primeiro pixel, e o `fallback={null}` garante que a tela fica **branca** durante essa cascata. Somado ao `react-awesome-reveal` (`Fade`/`Slide` iniciam em `opacity: 0`), o LCP é adiado por três mecanismos empilhados.
**Veredito:** `lazy()` aqui é anti-padrão. Deve sobrar apenas para `/post/:id` (Prism), `/projects` (quiz) e o `Drawer` mobile.
**Correção interina:** import estático dos componentes da Home; `fallback` com skeleton, não `null`.

**P1-11 · Suíte de testes inexistente e configuração quebrada** — `vite.config.mts:11`
`setupFiles: "./src/setupTests.ts"` aponta para arquivo que não existe. `yarn test` quebra na primeira invocação. Zero arquivos `*.test.*` no repositório. **Impacto:** nada impede uma regressão no funil de leads de chegar em produção — que é exatamente o que aconteceu no P0-1.

**P1-12 · Conteúdo falso publicado** — `src/data/posts.ts:1-167`, `public/manifest.json:2-3`
Três posts fictícios assinados por "João Silva", "Maria Santos" e "Pedro Oliveira", com imagens hotlinkadas de `static.vecteezy.com` e `conversion.com.br`, e um vídeo apontando para `https://exemplo.com/videos/css-grid-tutorial.mp4` (`posts.ts:96`). Tudo indexável em `/blog` e `/post/1..3`. O `manifest.json` ainda se identifica como `"Landy - React Template"`.
**Impacto:** um prospect que abre o blog vê lorem ipsum profissional assinado por gente que não existe. Isso não é dívida técnica, é **dano de credibilidade** — pior do que não ter blog. **Ação imediata:** despublicar `/blog` (`src/router/config.ts:13-21`) e remover o link do `src/components/Footer/index.tsx:67` até haver conteúdo real.

**P1-13 · i18n desalinhado com o mercado-alvo** — `src/translation.ts:10,14,25`
- `fallbackLng: "en"` numa agência brasileira: visitante com locale não detectado vê inglês.
- Pasta `locales/pt-BR/` registrada sob a chave `"pt"` — funciona por acidente da cadeia de fallback do i18next.
- `.use(XHR)` carrega `i18next-xhr-backend` (deprecated) sem uso: os `resources` são inline em `translation.ts:18-28`. Peso morto no entry.
- `index.html:2` declara `<html lang="en">` e `index.html:20` declara `og:locale="en_EN"` (código inválido; o correto seria `pt_BR`).
- Não há rota por idioma (`/pt`, `/en`, `/es`) nem `hreflang`. As três traduções **não geram nenhum tráfego orgânico** — o Google indexa uma única URL em inglês.

**P1-14 · Fontes e imagens** — `src/styles/styles.ts:5-15`
- `Motiva-Sans-Light.ttf` (64,5 kB) + `Motiva-Sans-Bold.ttf` (63,5 kB) = **128 kB em TTF**, sem `woff2`, sem `font-display: swap`, sem `preload`, declaradas dentro de um `createGlobalStyle` que só é injetado após a hidratação. Resultado: FOIT tardio + reflow.
- `public/assets/img/svg/contact-us.png`: **286,7 kB** para uma ilustração decorativa (`src/components/Contact/index.tsx:22`). Sem WebP/AVIF, sem `srcset`, sem `loading="lazy"`.
- `brasil.svg` com 32,5 kB — SVG não otimizado (sem SVGO).

**P1-15 · Meta description e keywords idênticas e longas demais** — `index.html:11,13,18,25`
O mesmo bloco de 294 caracteres repetido em `description`, `keywords`, `og:description` e `twitter:description`. O Google trunca em ~155-160. `meta keywords` é ignorada desde 2009 e o conteúdo dela é uma frase corrida — sinal clássico de página de baixa qualidade. `<title>lemamon.dev</title>` (`index.html:27`) é o mesmo em **todas** as rotas e não contém uma única palavra-chave comercial ("desenvolvimento de software", "aplicativo sob medida", "Florianópolis").

### P2 — Higiene. Não converte, mas custa velocidade de time.

| # | Item | Local |
|---|---|---|
| P2-16 | Código morto: `useForm` faz `fetch("")` para uma `url = ""` — nenhum componente importa | `src/common/utils/useForm.tsx:31` |
| P2-17 | `validate()` e `validateProps` órfãos junto com o `useForm` | `src/common/utils/validationRules.ts`, `src/common/types.ts:33` |
| P2-18 | `/// <reference types="react-scripts" />` — resquício de CRA, pacote não instalado | `src/react-app-env.d.ts:1` |
| P2-19 | `template.json` na raiz: manifesto do template "Landy" original | `template.json` |
| P2-20 | `scripts/` vazio, versionado | `scripts/` |
| P2-21 | Lixo não versionado: `estrutura_projeto.txt` (21 kB), `output.txt`, `readfile.js`, `src/pages/Projects/project-questions.json` (duplicata parcial de `data.json` com textos inline) | raiz e `src/pages/Projects/` |
| P2-22 | `typescript`, `vite`, `@vitejs/plugin-react-swc` e todos os `@types/*` listados em `dependencies`, não `devDependencies` | `package.json:6-29` |
| P2-23 | `@types/react: ^17` com `react: ^18.3.1` — tipos divergem do runtime | `package.json:9,19` |
| P2-24 | `vite-tsconfig-paths` instalado, não usado no `vite.config.mts`, e `tsconfig.json` sem `paths` — imports relativos `../../` por todo lado | `package.json:28` |
| P2-25 | Sem ESLint funcional (`eslintConfig: {extends: "react-app"}` sem o pacote), sem Prettier, sem hooks de pré-commit | `package.json:37-39` |
| P2-26 | 9 vulnerabilidades (1 crítica, 6 altas). `antd v4` em manutenção, `react-router-dom v5` (v7 é o atual), TS 4.9 (5.x há 3 anos) | `package.json` |
| P2-27 | Sem `sitemap.xml` (a URL retorna o `index.html` via fallback), `robots.txt` sem diretiva `Sitemap:` | `public/robots.txt` |
| P2-28 | Sem headers de segurança (`X-Frame-Options`, `X-Content-Type-Options`, CSP, `Referrer-Policy`) — verificado em produção | `netlify.toml` inexistente |

---

## 3. SEO e renderização

### O problema em uma frase

O HTML servido em `https://lemamon.dev/` tem **73 kB e zero conteúdo**: um `<div id="root">` vazio, quatro `<meta>` genéricas, e 69,4 kB de New Relic minificado inline (`index.html:67` — uma única linha de 69.399 caracteres). Todo o texto que vende — "Soluções Tecnológicas Personalizadas", "Desenvolvimento de software sob medida", os serviços, a localização em Florianópolis — só existe depois que 474 kB de JavaScript baixam, executam e hidratam.

Isso significa, na prática:
- **Nenhum crawler que não executa JS vê nada.** O bot do WhatsApp, do LinkedIn, do Slack e do X não executam. Nem o do Bing em boa parte dos casos.
- **O Googlebot executa, mas na fila de renderização.** Páginas JS-only entram numa segunda passada que pode levar dias e recebem sinal de qualidade inferior. Para uma landing page nova competindo por "desenvolvimento de software Florianópolis", isso é a diferença entre existir e não existir na SERP.
- **Todas as rotas compartilham `<title>lemamon.dev</title>` e a mesma description.** Do ponto de vista do Google, o site tem **uma** página.
- **Três idiomas traduzidos, zero URLs por idioma.** O trabalho de tradução em `src/locales/` gera exatamente zero tráfego orgânico adicional.

### Avaliação das três opções

**Opção A — Manter SPA + prerender (`react-snap` / `vite-plugin-prerender`).**
Prós: 2-3 dias, não toca no código de componentes.
Contras que matam: `react-snap` está **sem manutenção desde 2019** e depende de Puppeteer no CI; continua carregando 1,7 MB de JS depois do HTML prerenderizado (o HTML resolve o crawler, não o Core Web Vitals); rotas dinâmicas (`/post/:id`) exigem lista manual; e o `<title>`/`og:image` por rota ainda exigem `react-helmet` + o antd v4 EOL continua no bundle. É um curativo que **congela** a arquitetura ruim e ainda adiciona uma dependência frágil no pipeline. Rejeitado.

**Opção B — Migrar para Next.js.**
Prós: solução robusta, App Router, `generateMetadata` por rota, Route Handlers para receber o lead sem backend externo, ecossistema enorme.
Contras: exige runtime Node (sair do Netlify estático ou usar o adapter, que traz cold start e custo); traz Server Components, boundaries de `"use client"`, cache do Next e um modelo mental caro para um time pequeno que hoje escreve React clássico; `styled-components` v5 em RSC é notoriamente doloroso. Para um site de **6 páginas sem autenticação, sem sessão, sem dados por usuário**, é infraestrutura demais para o problema. Rejeitado — e seria a escolha certa apenas se houvesse plano de área logada ou dashboard de cliente.

**Opção C — Migrar para Astro. ✅ RECOMENDADO.**

Astro é a única opção que ataca simultaneamente os quatro problemas: HTML estático real por rota (SEO + preview social), JS quase zero por padrão (Core Web Vitals), i18n com roteamento nativo (`/`, `/en`, `/es` com `hreflang` automático), e Content Collections com MDX tipado (§5, gestão de conteúdo). Nada disso exige servidor: continua sendo deploy estático no Netlify, exatamente o modelo atual.

O que fecha a decisão para **este** time:
1. **A interatividade é uma ilha só.** O único componente genuinamente interativo é o quiz `ProjectBuilder` (`src/components/ProjectBuilder/index.tsx`). Header, Footer, ContentBlock, MiddleBlock, Contact, Blog e Post são conteúdo estático renderizado a partir de JSON. Isso é o caso de uso canônico de Astro Islands — 95% do site vira HTML puro e o quiz continua React (`@astrojs/react`) sem reescrita.
2. **Migração incremental de verdade.** Os componentes React existentes rodam sob `@astrojs/react` sem alteração. Não é rewrite; é reempacotamento.
3. **Curva de aprendizado.** Um dev que escreve React aprende Astro em um dia. Next App Router leva semanas até parar de errar boundary de client/server.
4. **Elimina o antd de graça.** Sem `Row`/`Col`/`Drawer` do antd (substituíveis por CSS Grid e um `<dialog>`), somem 557,87 kB de CSS e 834 ícones.

**Estimativa: 8-10 dias de dev.** Contra ~15 de Next.js e ~3 de prerender (que resolve um quarto do problema e cria dívida nova).

### Caminho de migração incremental

| Fase | Duração | Entrega | Risco |
|---|---|---|---|
| 1. Andaime | 1d | `npm create astro@latest` num branch, `@astrojs/react` + `@astrojs/sitemap` + `@astrojs/mdx`. Netlify apontado para o novo build. | Nenhum — nada em produção muda |
| 2. Layout + Home | 2d | `Layout.astro` com `<head>` completo (title/description/OG/canonical/hreflang por página). Home vira `.astro` com o copy dos `translation.json` movido para frontmatter. Header/Footer viram `.astro`. | Baixo |
| 3. Ilha do funil | 2d | `ProjectBuilder` + `ContactForm` reaproveitados como `<ProjectBuilder client:load />`. `<Result>` do antd substituído (elimina o chunk de 757 kB). | Médio — é o funil; exige teste E2E antes de publicar |
| 4. Conteúdo | 2d | Content Collections para `blog/` e `cases/` em MDX. `posts.ts` fake deletado. | Baixo |
| 5. i18n + corte | 1-2d | `astro:i18n` com `/` (pt-BR default), `/en`, `/es`. Remoção de antd, i18next, react-awesome-reveal, prismjs (Shiki é nativo do Astro). | Baixo |
| 6. Corte de tráfego | 0,5d | Redirects preservando URLs antigas, sitemap submetido, Search Console verificado. | Baixo |

**Meta de saída:** entry JS < 30 kB gzip (contra 159 kB hoje), CSS < 15 kB gzip (contra 67,8 kB), LCP < 1,8 s em 4G.

---

## 4. Performance

### Core Web Vitals — o que está quebrado e por quê

**LCP.** Quatro atrasos empilhados antes do maior elemento pintar:
1. 73 kB de HTML dos quais 69,4 kB são New Relic inline (`index.html:67`) — parseado antes de qualquer coisa útil.
2. 557,87 kB de CSS do antd render-blocking (`src/index.tsx:3`).
3. Cascata de chunks: entry (474 kB) → chunk da rota → chunks dos componentes lazy da Home, com `fallback={null}` (`src/router/index.tsx:18`) = tela branca durante toda a cadeia.
4. `SvgIcon` só resolve a URL no `useEffect` (`src/common/SvgIcon/index.tsx:7`), então o download do hero só **começa** após a hidratação e um render extra.

E quando finalmente pinta, `react-awesome-reveal` (`Fade`/`Slide` em `ContentBlock`, `MiddleBlock`, `Contact`, `Blog`) parte de `opacity: 0` — o navegador não conta como pintura visível.

**CLS.** `SvgIcon` emite `width="100%" height="100%"` como atributos HTML (`src/common/SvgIcon/index.tsx:14`) — valores inválidos para atributos de dimensão, que portanto não reservam espaço. Some-se `<span>Loading...</span>` como placeholder de imagem (tamanho totalmente diferente) e fontes TTF sem `font-display: swap`. Layout shift garantido em toda ilustração.

**INP.** Não é crítico hoje (pouca interatividade), mas `ScrollToTop` (`src/common/ScrollToTop/index.tsx:19-24`) registra um listener de `scroll` **sem throttle e recriado a cada mudança de estado**, via `useCallback` com `showScroll` na deps. Cada evento de scroll dispara `setState`. É jank barato de eliminar com `IntersectionObserver`.

### Veredito sobre o code splitting atual

O `lazy()` de `src/pages/Home/index.tsx:4-8` **atrapalha o LCP**. Splitting só compensa quando o código adiado não é necessário no primeiro paint — e `Container`, `ContentBlock` e `MiddleBlock` são o primeiro paint. O que deveria estar em `lazy()` (Prism, o quiz, o barrel de ícones) está no caminho crítico ou colado em rota. A configuração está exatamente invertida.

### Plano de ação de performance

**Antes da migração (ganho imediato, ~1,5 dia):**
1. New Relic: trocar o blob inline de 69,4 kB pelo loader externo com `defer`, ou desligar até haver um SLO que justifique. Ganha ~22 kB gzip no HTML e retira parse do caminho crítico.
2. Remover `<Result>` do antd de `ContactForm` → **-757,94 kB** na rota de conversão.
3. Import estático dos componentes da Home; `fallback` com skeleton.
4. `SvgIcon`: URL derivada no render, dimensões numéricas, `fetchpriority="high"` no hero, `loading="lazy"` no resto.
5. Fontes → `woff2` (~35 kB cada, -70%) + `font-display: swap` + `<link rel="preload">` no `index.html`.
6. `contact-us.png` (286,7 kB) → WebP com `srcset` (alvo < 40 kB); SVGO em todos os SVGs.
7. `netlify.toml` com `Cache-Control: immutable` em `/assets/*` e headers de segurança.
8. Remover `i18next-xhr-backend` (`src/translation.ts:3,10`) — deprecated e sem uso.

**Depois da migração:** antd, react-awesome-reveal (trocar por `@keyframes` + `prefers-reduced-motion`, que também é acessibilidade) e prismjs saem do bundle. O JS residual do site vira só o quiz.

---

## 5. Gestão de conteúdo

### Situação

- Copy de marketing: 334 linhas × 3 arquivos `translation.json` (`src/locales/{en,es,pt-BR}/translation.json`), com chaves opacas do tipo `projectsContent.questions.dd384459xZ.title`.
- Posts: `src/data/posts.ts` — 167 linhas de TypeScript com AST customizada (`PostContent` em `src/types/index.ts:1-59`: 11 variantes — `text`, `code`, `image`, `video`, `callout`, `list`, `blockquote`, `table`, `checklist`, `codepen`, `figure`).
- Cases: não existem. É a maior lacuna de conversão do site — uma agência sem portfólio pede que o visitante confie no vazio.

Consequência: **publicar um post exige um dev**, um commit e um deploy. Alterar uma frase da Home exige editar três JSONs e acertar uma chave hexadecimal. Na prática, o site nunca é atualizado — o blog fake de janeiro/2024 ainda estar no ar é prova disso.

Sobre o `PostContent`: são 11 tipos de bloco, um switch de 90 linhas (`src/pages/Post/index.tsx:54-147`) e uma `<table>` cuja `dataIndex` deriva de `header.toLowerCase()` (`Post/index.tsx:82`) — dois headers iguais colidem silenciosamente. Isso é um CMS caseiro reinventando Markdown, com mais bugs e menos recursos.

### Opções

**CMS headless (Contentful / Sanity / Strapi).** Interface bonita para não-técnicos, mas: custo recorrente, mais um serviço para manter, mais um webhook de rebuild, latência de API ou complexidade de build hooks, e — decisivo — **o time é composto por devs**. Pagar SaaS para que devs editem conteúdo por um formulário web é resolver um problema que não existe. Rejeitado nesta fase.

**MDX no repositório com Astro Content Collections. ✅ RECOMENDADO.**

```
src/content/
├── config.ts          # schema Zod: título, data, capa, tags, autor, draft
├── blog/
│   └── 2026-07-como-escolher-stack.mdx
└── cases/
    └── cliente-x-reducao-40-checkout.mdx
```

```ts
// src/content/config.ts
import { defineCollection, z } from "astro:content";

const cases = defineCollection({
  schema: z.object({
    cliente: z.string(),
    segmento: z.string(),
    resultado: z.string(),        // "+38% de conversão em 90 dias"
    stack: z.array(z.string()),
    capa: z.string(),             // usada como og:image do case
    publicadoEm: z.date(),
    draft: z.boolean().default(false),
  }),
});
export const collections = { cases /* , blog */ };
```

Por que ganha:
- **Zero custo, zero serviço novo.** O CI que já existe publica.
- **Schema validado em build.** Frontmatter errado quebra o build, não a página em produção. As 11 variantes do `PostContent` viram Markdown normal + componentes MDX para os casos especiais (`<Callout>`, `<Codepen>`).
- **Publicar = abrir PR.** Com Deploy Preview do Netlify (§8), qualquer pessoa do time revisa o post renderizado antes do merge. Isso é revisão editorial de graça.
- **Syntax highlighting nativo (Shiki, em build).** `prismjs` sai do bundle inteiramente.
- **Migração de saída.** Se o time crescer e precisar de editor visual, **Decap CMS** (ex-Netlify CMS) pluga por cima dos mesmos arquivos MDX em ~4 horas — `admin/config.yml` + Netlify Identity. Ninguém remigra conteúdo.

**Sobre a copy de marketing:** as chaves opacas dos `translation.json` viram frontmatter/collections em `src/content/i18n/{pt-br,en,es}.json` com chaves semânticas. `dd384459xZ` vira `chatbot.tipo.pergunta`.

**Prioridade dentro deste tópico:** cases > blog. Uma agência sem prova social documentada perde deal para quem tem, independentemente de blog. As primeiras três collections devem ser cases reais, e cada case precisa de `og:image` própria — é o ativo que circula no LinkedIn.

---

## 6. Captação de lead — redesenho de `src/service/index.ts`

### O que está errado no arquivo de 43 linhas

| Linha | Problema |
|---|---|
| `16` | URL de produção hardcoded, sem env var — e a app **não existe mais** |
| `19-25` | Sem `timeout`, sem `AbortController` — o usuário pode ficar preso indefinidamente na tela "Criando seu projeto" (`ContactForm/index.tsx:41-51`) |
| `19-25` | Sem retry; qualquer falha de rede transitória = lead perdido |
| `24` | Zero validação no cliente além do regex de e-mail em `ProjectBuilder/index.tsx:26`. Nome, telefone e descrição são enviados como vierem |
| — | Sem honeypot, sem rate-limit, sem timing check. Um endpoint público que dispara e-mail é alvo garantido de spam |
| `33` | `process.env` quebra o `tsc` (P0-2) |
| `39-42` | `console.error` + rethrow: o erro morre no console do navegador. Ninguém é notificado de que o funil caiu — **por isso o backend morto passou despercebido** |
| — | Retorno `Promise<any>`; erro não tipado; a UI não distingue "rede caiu" de "e-mail inválido" de "servidor fora" |
| — | Sem fallback: falhou, acabou. O usuário de maior intenção do site vê "Erro ao criar projeto" e vai embora |

### Onde o lead deve parar

**Recomendação: Netlify Forms como sistema de registro + notificação por e-mail + WhatsApp como canal de resgate.**

Justificativa: o site já roda em Netlify. Netlify Forms dá persistência (o lead fica no painel mesmo se o e-mail falhar), notificação por e-mail, honeypot e reCAPTCHA nativos, exportação CSV e webhook — **sem nenhum backend para manter**. A causa raiz do P0-1 foi manter um serviço Heroku para uma função que a plataforma de hospedagem já oferece. Não repetir o erro.

Ordem de destinos, por maturidade:
1. **Hoje (obrigatório):** Netlify Forms. O lead **persiste** mesmo se tudo mais falhar. Fim do lead perdido silenciosamente.
2. **+ notificação:** e-mail para `lemamon.dev@gmail.com` (nativo) **e** mensagem no grupo de WhatsApp/Slack via webhook. Tempo de resposta é o fator #1 de conversão em serviço B2B; e-mail sozinho perde o lead quente.
3. **Quando houver volume (> ~20 leads/mês):** webhook do Netlify Forms → CRM. Recomendo **Pipedrive** ou o free tier do HubSpot. Sem volume, CRM é overhead — a planilha do Netlify basta.

**Não** recomendo Google Sheets como destino primário: é frágil (OAuth expira, cota de API), não notifica e não tem histórico de estado do lead.

### Implementação proposta

```ts
// src/service/leads.ts
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(160),
  phone: z.string().trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 0 || (v.length >= 10 && v.length <= 13), "Telefone inválido"),
  description: z.string().trim().max(2000).default(""),
  optionsSummaryText: z.array(z.string()).max(50),
  // anti-spam
  website: z.string().max(0, "spam"),  // honeypot: campo oculto, deve vir vazio
  elapsedMs: z.number().min(3000, "spam"), // bot preenche em < 3s
});

export type Lead = z.infer<typeof LeadSchema>;
export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "validation"; fields: Record<string, string> }
  | { ok: false; reason: "network" | "server" | "timeout" | "spam" };

const ENDPOINT = import.meta.env.PUBLIC_LEAD_ENDPOINT ?? "/";
const FORM_NAME = "orcamento";
const TIMEOUT_MS = 12_000;
const RETRIES = 2;

async function postWithTimeout(body: string, signal: AbortSignal) {
  return fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal,
  });
}

export async function submitLead(raw: unknown): Promise<LeadResult> {
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] = i.message;
    if (Object.values(fields).includes("spam")) return { ok: false, reason: "spam" };
    return { ok: false, reason: "validation", fields };
  }

  const { website: _hp, elapsedMs: _t, ...lead } = parsed.data;
  const body = new URLSearchParams({
    "form-name": FORM_NAME,
    ...lead,
    optionsSummaryText: lead.optionsSummaryText.join("\n"),
  }).toString();

  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await postWithTimeout(body, ctrl.signal);
      clearTimeout(timer);

      if (res.ok) {
        track("lead_submitted", { services: lead.optionsSummaryText.length });
        return { ok: true };
      }
      if (res.status >= 400 && res.status < 500) {
        reportError("lead_rejected", { status: res.status });
        return { ok: false, reason: "server" };   // 4xx não se repete
      }
      // 5xx → retry
    } catch (err) {
      clearTimeout(timer);
      if (attempt === RETRIES) {
        const timedOut = err instanceof DOMException && err.name === "AbortError";
        reportError("lead_failed", { timedOut });
        return { ok: false, reason: timedOut ? "timeout" : "network" };
      }
    }
    await new Promise((r) => setTimeout(r, 2 ** attempt * 500)); // 500ms, 1s
  }
  return { ok: false, reason: "network" };
}

/** Resgate: nunca deixar o lead sair de mãos vazias. */
export function whatsappFallbackUrl(lead: Partial<Lead>) {
  const msg = [
    `Olá! Vim pelo site da Lemamon.`,
    lead.name && `Meu nome é ${lead.name}.`,
    lead.optionsSummaryText?.length && `Preciso de: ${lead.optionsSummaryText.join(" | ")}`,
    lead.description && `Sobre o projeto: ${lead.description}`,
  ].filter(Boolean).join("\n");
  return `https://wa.me/${import.meta.env.PUBLIC_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
```

**Notas de implementação, em ordem de importância:**

1. **O fallback de WhatsApp não é decoração — é a diferença entre lead e churn.** Quando `ok: false`, a UI deve apresentar, em ordem: (a) botão "Falar no WhatsApp agora" já com o resumo do projeto na mensagem, (b) "Tentar novamente", (c) `mailto:` com o mesmo conteúdo. Nunca uma tela de erro sem saída como a de hoje (`ContactForm/index.tsx:71-88`).
2. **Persistir o rascunho em `localStorage`** a cada passo do quiz. Hoje, se a página recarrega no meio dos 5 passos, o usuário recomeça do zero e não volta.
3. **Anti-spam em três camadas, todas gratuitas:** honeypot (`website`, oculto via CSS — nunca `type="hidden"`, bots preenchem), timing mínimo de 3s, e o reCAPTCHA nativo do Netlify Forms se o spam persistir. Nada de captcha visível por padrão — cada fricção adicional custa conversão real.
4. **Variáveis de ambiente** em `.env.example` versionado: `PUBLIC_LEAD_ENDPOINT`, `PUBLIC_WHATSAPP`, `PUBLIC_GA_ID`, `PUBLIC_SITE_URL`. Nunca mais uma URL de produção hardcoded (`src/service/index.ts:16`).
5. **`reportError` é obrigatório.** A falha do funil precisa gerar alerta (§7). O `console.error` de `src/service/index.ts:40` é a razão pela qual o backend está morto há sabe-se lá quanto tempo sem ninguém notar.
6. **Validação inline, por campo, no blur** — não `disabled` global. Hoje o botão Enviar fica travado por `isValidEmail` (`ProjectBuilder/index.tsx:148`) sem dizer ao usuário **o que** está errado. Botão desabilitado sem mensagem é destruidor de conversão.
7. **Reduzir o quiz.** Cinco telas antes de pedir contato é muita fricção. Recomendo mover o formulário de contato para o **passo 2** e tornar os demais opcionais ("pular"). Melhor um lead com dados parciais do que um abandono no passo 4. Sugerir teste A/B assim que houver instrumentação (§7).

---

## 7. Analytics e observabilidade

### Situação

- Um `gtag` de Google Ads (`AW-16881353870`) inline em `index.html:36-44`.
- Uma conversão única, `gtag_report_conversion`, disparada **apenas** no sucesso do envio de e-mail (`src/service/index.ts:31-36`).
- New Relic Browser com Session Replay a 10% de amostragem (`index.html:62`), 69,4 kB inline.

Problemas: `AW-` é conta de **Ads**, não de **Analytics** — não há GA4, portanto não há sessões, origem de tráfego, funil ou comportamento. Só existe um evento no site inteiro e ele fica no **último** passo de um fluxo de 5 etapas. Não é possível responder nenhuma das perguntas que decidem investimento: quantos chegam em `/projects`? Em qual passo abandonam? De onde vêm os que convertem? E, criticamente: **o backend caiu e nenhum dashboard acusou**, porque a única métrica existente mede sucesso, não falha.

### Instrumentação proposta

**Ferramenta: GA4 + Google Ads (conversão importada do GA4) + Netlify Analytics.** Recomendo **não** trocar por Plausible/PostHog agora: o Google Ads já está rodando e a integração nativa GA4→Ads é necessária para otimização de campanha. Netlify Analytics (server-side, US$ 9/mês) dá pageviews imunes a adblock, o que serve de baseline para descobrir quanto do tráfego o GA4 está perdendo.

**Eventos do funil** — camada fina, tipada, um único ponto de saída:

```ts
// src/lib/analytics.ts
type FunnelEvent =
  | { name: "cta_click";       cta: string; location: "hero" | "header" | "footer" | "middle" }
  | { name: "quiz_start" }
  | { name: "quiz_step";       step: number; questionId: string; selected: number }
  | { name: "quiz_abandon";    step: number }        // via visibilitychange/beforeunload
  | { name: "form_view" }
  | { name: "form_field_blur"; field: string; valid: boolean }
  | { name: "lead_submitted";  services: number }
  | { name: "lead_failed";     reason: string }      // ← o que faltava
  | { name: "whatsapp_fallback_click" }
  | { name: "whatsapp_direct_click" };

export const track = (e: FunnelEvent) => {
  const { name, ...params } = e;
  window.gtag?.("event", name, params);
  if (import.meta.env.DEV) console.debug("[track]", name, params);
};
```

`lead_submitted` vira a conversão importada no Google Ads. Substitui o `gtag_report_conversion` solto de `index.html:47-58`, que hoje é uma função global no `window` chamada com `typeof` guard (`src/service/index.ts:32`) — gambiarra que denuncia acoplamento.

**Dashboard mínimo (4 números, revisão semanal):**
1. Sessões → `/projects` (taxa de entrada no funil)
2. `quiz_start` → `form_view` (taxa de conclusão do quiz, com quebra por passo)
3. `form_view` → `lead_submitted` (taxa de conversão do formulário)
4. `lead_failed` / (`lead_failed` + `lead_submitted`) — **taxa de falha técnica**

O item 4 é o que impede o P0-1 de acontecer de novo.

**Observabilidade:**
- **Alerta de funil quebrado.** Regra no New Relic (já pago): `lead_failed > 0` em 15 min → notificação. Alternativa gratuita: um Netlify Scheduled Function que faz `HEAD` no endpoint de lead a cada hora e avisa no WhatsApp/Slack se falhar. Custo: 1 hora de dev. Teria evitado 100% do prejuízo do P0-1.
- **New Relic: reavaliar.** 69,4 kB inline no caminho crítico (`index.html:67`) para monitorar um site estático de 6 páginas é caro em LCP. Session Replay a 10% em um site com este volume raramente captura a sessão que interessa. Recomendo: manter apenas o error tracking (ou trocar por **Sentry**, bundle bem menor), carregado com `defer` e **fora** do HTML — sem replay até haver hipótese de UX que o justifique.
- **Uptime externo:** UptimeRobot gratuito em `lemamon.dev` e no endpoint de lead.
- **Lighthouse CI no PR** com budget: LCP < 2,5 s, CLS < 0,1, JS transferido < 150 kB. Falha o check se regredir.

---

## 8. Qualidade

Landing page **não** precisa de cobertura alta. Precisa que **o funil nunca quebre em silêncio**. A estratégia abaixo é deliberadamente pequena — testes que ninguém mantém são pior que testes que não existem.

### Testes — 3 camadas, ~1 dia de setup

**Camada 1 · E2E do caminho do dinheiro (Playwright) — inegociável.**
Quatro specs, e nada além disso no início:
1. Home carrega → CTA "Comece seu projeto!" → quiz abre.
2. Quiz completo (5 passos) → formulário → submit mockado (`page.route`) → tela de sucesso.
3. Submit falha (rota mockada com 500) → **botão de WhatsApp aparece e tem `href` correto**.
4. Navegação: `/blog` e `/projects` carregam; clicar cada item do menu **não gera exceção no console** (cobre os quatro crashes do P0-5).

Roda no PR e num cron diário contra produção. O spec 3 é o que teria detectado o P0-1 no dia.

**Camada 2 · Unit (Vitest) — apenas lógica pura, ~15 testes.**
`LeadSchema` (válido, e-mail inválido, honeypot preenchido, telefone com máscara, `elapsedMs` baixo), `whatsappFallbackUrl` (encoding), o helper `scrollToSection` (elemento ausente não lança), o agregador `optionsSummaryText` de `ProjectBuilder/index.tsx:69-86` (que tem lógica de flatMap não trivial e nenhum teste).

Primeiro passo obrigatório: **criar `src/setupTests.ts`** ou remover a linha `vite.config.mts:11`. Hoje `yarn test` nem inicia.

**Camada 3 · Visual/estrutural — barato.**
Lighthouse CI com budget no PR (§7). Sem snapshot testing de componente: em landing page, o layout muda toda semana e o snapshot vira ruído que o time aprende a ignorar.

**Meta explícita de cobertura: nenhuma.** O critério é "o funil está coberto E2E". `test:coverage` (`package.json:35`) pode ficar, mas sem gate.

### Lint e formatação (~2h)

ESLint 9 flat config (`@typescript-eslint`, `react-hooks`, `jsx-a11y`) + Prettier + `lint-staged` no pre-commit via Husky. Hoje `eslintConfig: { "extends": "react-app" }` (`package.json:37-39`) referencia um preset do CRA que **não está instalado** — lint decorativo.

Três regras com valor imediato aqui: `@typescript-eslint/no-unnecessary-type-assertion` (pega os `as HTMLDivElement` do P0-5), `no-console` (pega `src/service/index.ts:40`) e `jsx-a11y/alt-text`.

### CI (~4h)

Substituir `.github/workflows/pipeline.yaml` inteiro:

```yaml
name: CI
on: [pull_request, push]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: yarn }
      - run: yarn install --frozen-lockfile   # ← reprodutível
      - run: yarn lint
      - run: yarn typecheck                   # tsc --noEmit isolado do build
      - run: yarn test:unit
      - run: yarn build
      - run: yarn test:e2e
      - uses: treosh/lighthouse-ci-action@v11
```

Notas: `--frozen-lockfile` (hoje ausente, `pipeline.yaml:36`, junto do `--legacy-peer-deps` que o yarn ignora); `actions/checkout@v3`→`v4`; separar `typecheck` do `build` para feedback mais rápido. **Deletar** os steps de GitHub Pages (P0-4).

### Preview por PR (~1h)

Netlify Deploy Previews: habilitar na UI e versionar `netlify.toml`.

```toml
[build]
  command = "yarn build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"

[context.deploy-preview]
  command = "yarn build"
[context.deploy-preview.environment]
  PUBLIC_LEAD_ENDPOINT = "/__mock__"   # preview nunca envia lead real
```

Isso resolve três coisas de uma vez: URL de preview por PR (revisão de copy sem ambiente local), configuração de deploy versionada (fim do P0-4) e headers de cache/segurança (P1-9, P2-28).

### Dependências (~4h, contínuo)

Renovate ou Dependabot com agrupamento semanal e auto-merge de patch quando a CI passar. Atacar primeiro a vulnerabilidade **crítica** e as 6 **altas** reportadas no install. Mover `typescript`, `vite`, `@vitejs/plugin-react-swc` e `@types/*` para `devDependencies` (P2-22) e alinhar `@types/react` com React 18 (P2-23).

---

## 9. Roadmap técnico

### Onda 1 — Parar a hemorragia · 5 dias

Objetivo: **nenhum lead perdido, nenhum link morto socialmente, deploy previsível.** Zero migração; tudo em cima do código atual.

| # | Tarefa | Ref. | Dias |
|---|---|---|---:|
| 1 | Netlify Forms + `submitLead` novo (validação, timeout, retry, honeypot, WhatsApp fallback, `localStorage`) | P0-1, §6 | 1,5 |
| 2 | `og:image` 1200×630, `twitter:card`, `og:locale=pt_BR`, `lang="pt-BR"`, `<title>`/description por rota via `react-helmet-async` | P0-3, P1-15 | 0,5 |
| 3 | Corrigir `process.env`→`import.meta.env.PROD`; helper `scrollToSection` nos 4 sites; `ErrorBoundary` no router | P0-2, P0-5 | 0,5 |
| 4 | Deletar workflow de Pages; criar `netlify.toml` (build, headers, previews, env de preview); `.env.example` | P0-4, P1-9, P2-28 | 0,5 |
| 5 | Remover `<Result>` do antd (−757,94 kB em `/projects`); imports estáticos na Home; `SvgIcon` sem `useEffect` + dimensões | P1-6, P1-8, P1-10 | 1 |
| 6 | Despublicar `/blog` e os posts fake; corrigir `manifest.json` | P1-12 | 0,25 |
| 7 | GA4 + eventos do funil + alerta de `lead_failed` | §7 | 0,75 |

**Saída medível:** lead chega em 100% dos casos (ou cai no WhatsApp); preview social funcionando; `/projects` ~200 kB gzip mais leve; alerta ativo se o funil cair.

### Onda 2 — Migração para Astro · 10 dias

Objetivo: **existir no Google e carregar rápido.** Fases 1-6 de §3, sem sobreposição com a Onda 1 (o trabalho da Onda 1 em `submitLead`, meta tags e analytics é portado, não refeito).

| # | Tarefa | Dias |
|---|---|---:|
| 8 | Andaime Astro + `@astrojs/react`/`mdx`/`sitemap`; Netlify apontado para o novo build | 1 |
| 9 | `Layout.astro` com `<head>` completo por página; Home, Header, Footer em `.astro` | 2 |
| 10 | Ilha do funil: `ProjectBuilder` + `ContactForm` como `client:load`; E2E do caminho do dinheiro (Playwright) | 2 |
| 11 | Content Collections (MDX): `cases/` e `blog/` com schema Zod; template de case com `og:image` própria | 2 |
| 12 | `astro:i18n`: `/` (pt-BR default), `/en`, `/es` + `hreflang` + `sitemap` por idioma | 1,5 |
| 13 | Corte de dependências: antd, i18next, react-awesome-reveal, prismjs, react-router; fontes woff2 + preload; imagens WebP/`<Image>`; SVGO | 1 |
| 14 | Redirects de URLs antigas, `sitemap.xml`, `robots.txt` com `Sitemap:`, Search Console | 0,5 |

**Saída medível:** HTML estático com o copy real em todas as rotas; entry JS < 30 kB gzip; CSS < 15 kB gzip; LCP < 1,8 s em 4G; `<title>` e OG únicos por rota; 3 idiomas indexáveis.

### Onda 3 — Otimizar conversão · 6 dias

Objetivo: **transformar tráfego em lead com mais eficiência.** Só faz sentido depois da Onda 2, porque exige dados da instrumentação.

| # | Tarefa | Dias |
|---|---|---:|
| 15 | Publicar 3 cases reais (dev + escrita); prova social na Home acima da dobra | 1,5 |
| 16 | Reduzir fricção do quiz: contato no passo 2, demais passos opcionais; validação inline por campo; barra de progresso | 1,5 |
| 17 | Suíte de qualidade: ESLint 9 + Prettier + Husky, Vitest unit no schema/helpers, Lighthouse CI com budget no PR | 1 |
| 18 | Renovate; zerar vulnerabilidades crítica/altas; `devDependencies` corrigidas; limpar código morto (`useForm`, `validationRules`, `react-app-env.d.ts`, `template.json`, `scripts/`, arquivos soltos da raiz) | 1 |
| 19 | Reavaliar New Relic (manter só error tracking com `defer`, ou migrar para Sentry); UptimeRobot | 0,5 |
| 20 | Primeiro teste A/B de headline/CTA sobre a instrumentação da §7 | 0,5 |

**Saída medível:** portfólio publicado; taxa `quiz_start`→`lead_submitted` medida e com baseline; qualidade automatizada no PR; dívida de dependências zerada.

---

**Total: 21 dias de dev.** A Onda 1, sozinha (5 dias), recupera 100% dos leads que hoje são perdidos e conserta o preview social — é de longe o melhor retorno por dia investido do plano inteiro, e deve começar antes de qualquer discussão de framework.

---

### Anexo — Como reproduzir as medições

```bash
npm install --no-save --no-package-lock --legacy-peer-deps   # yarn.lock v1 x Yarn 4 no ambiente
npx tsc --noEmit          # → src/service/index.ts(33,7): error TS2591
npx vite build            # → tabela de bundle da §1
grep -o 'Outlined\|Filled\|TwoTone' dist/assets/index-*.js | sort | uniq -c   # → 834 ícones
curl -sI https://lemamon.dev/projects | grep -i server                        # → Netlify
curl -i -X OPTIONS https://lemamon-email-service-*.herokuapp.com/send-email    # → 404 No such app
```
