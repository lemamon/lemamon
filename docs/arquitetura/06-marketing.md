# 6. Marketing, Aquisição e SEO

> **Escopo desta seção:** diagnóstico do estado atual de aquisição da lemamon.dev com base no que existe **de fato no repositório** (`index.html`, `public/robots.txt`, `public/manifest.json`, `src/router/config.ts`, `src/service/index.ts`, `src/locales/pt-BR/translation.json`, `src/pages/Projects/*`, `src/components/*`) e o plano de melhoria para gerar mais clientes.
>
> **Aviso sobre dados:** não temos acesso a nenhum dado de tráfego, ranking, impressões ou custo real. Não há Search Console, GA4 ou relatório de Ads disponível no repositório. **Todo número de volume de busca, CPC, CPL, taxa de conversão e meta neste documento é estimativa de mercado e precisa ser validado** em ferramenta (Google Keyword Planner, Search Console, Ahrefs/Semrush, painel do Google Ads) antes de virar compromisso. Onde houver número, ele vem marcado como `[ESTIMATIVA]`.

---

## 6.1. Sumário executivo do diagnóstico

Cinco constatações que resumem o problema de aquisição hoje:

1. **O site é praticamente invisível para busca e para compartilhamento.** Não existe `og:image`, `twitter:card`, `canonical`, `hreflang`, JSON-LD nem `sitemap.xml` no projeto (verificado por busca no repositório inteiro — zero ocorrências). O `<title>` é literalmente `lemamon.dev`, sem uma única palavra-chave.
2. **O site declara ser em inglês.** `index.html` linha 2: `<html lang="en">`, e linha 20: `<meta property="og:locale" content="en_EN" />` — sendo que 100% do conteúdo comercial (`src/locales/pt-BR/translation.json`) é português do Brasil. Isso confunde o Google sobre para qual mercado ranquear.
3. **Não existe Google Analytics.** O que existe em `index.html` é **apenas a tag de Google Ads** (`AW-16881353870`) com um único evento de conversão. Não há nenhum ID `G-` (GA4) nem `GTM-` no arquivo. Ou seja: **não sabemos quantas pessoas visitam, de onde vêm, nem onde abandonam o wizard.** Só sabemos quando alguém envia o formulário — e mesmo assim sem contexto.
4. **O funil tem 5 etapas e zero instrumentação intermediária.** O wizard `/projects` (`src/pages/Projects/data.json`) tem 4 perguntas + formulário final, e o único disparo de conversão acontece em `src/service/index.ts` linha 35, depois do email já ter sido enviado com sucesso. Não há como saber em qual pergunta o lead desiste.
5. **Deep link provavelmente quebra em produção.** O deploy é GitHub Pages (`.github/workflows/`, `actions/deploy-pages@v4`), mas o único arquivo de fallback de rota é `public/_redirects` com `/*  /index.html  200` — **isso é sintaxe da Netlify e o GitHub Pages ignora**. Sem um `404.html` de fallback, acessar `https://lemamon.dev/projects` diretamente (que é exatamente o que um clique de anúncio ou um link compartilhado faz) tende a retornar 404. **Isso precisa ser verificado em produção antes de qualquer investimento em mídia paga.**

O ponto 5 é bloqueante: gastar dinheiro em anúncio apontando para uma URL que retorna 404 é queimar verba. Ele lidera o backlog.

---

## 6.2. Auditoria de SEO técnico

### 6.2.1. O que existe hoje, literalmente

Conteúdo real do `<head>` em `index.html`:

| Item | Estado | Trecho literal no repositório |
|---|---|---|
| `lang` do documento | ❌ Errado | `<html lang="en">` (linha 2) |
| `<title>` | ⚠️ Inútil para SEO | `<title>lemamon.dev</title>` (linha 27) |
| `meta description` | ⚠️ Longa demais (~330 caracteres) | `"Na lemamon.dev, impulsionamos a transformação digital da sua empresa com soluções tecnológicas inovadoras e personalizadas. Oferecemos desenvolvimento de software sob medida, criação de websites e aplicativos móveis, consultoria tecnológica e integração de sistemas."` (linhas 10-11) |
| `meta keywords` | ❌ Preenchida errado | Contém **exatamente o mesmo parágrafo da description** (linhas 12-13), não uma lista de keywords. Irrelevante para o Google desde 2009, mas sinaliza descuido. |
| `meta robots` | ✅ OK | `<meta name="robots" content="index, follow" />` (linha 19) |
| `og:title` | ⚠️ Fraco | `<meta property="og:title" content="lemamon.dev" />` (linha 14) |
| `og:type` | ✅ OK | `content="website"` (linha 15) |
| `og:url` | ⚠️ **Duplicado** | Aparece duas vezes: linha 16 e linha 22, ambas `https://lemamon.dev/` |
| `og:description` | ⚠️ Longa demais | Mesmo parágrafo da description (linhas 17-18) |
| `og:locale` | ❌ Valor inválido | `<meta property="og:locale" content="en_EN" />` (linha 20). `en_EN` **não é um locale válido** (seria `en_US`), e o correto aqui seria `pt_BR`. |
| `og:site_name` | ✅ OK | `content="lemamon.dev"` (linha 21) |
| **`og:image`** | ❌ **AUSENTE** | — |
| `twitter:card` | ❌ **AUSENTE** | — |
| `twitter:title` / `twitter:description` | ⚠️ Atributo errado | Usam `property=` (linhas 23-25); a especificação do Twitter/X exige `name=` |
| `twitter:site` | ❌ Valor errado | `content="https://lemamon.dev/"` (linha 26) — o campo espera um `@handle`, não uma URL |
| `twitter:image` | ❌ **AUSENTE** | — |
| `link rel="canonical"` | ❌ **AUSENTE** | — |
| `hreflang` | ❌ **AUSENTE** | — |
| JSON-LD (`application/ld+json`) | ❌ **AUSENTE** | — |
| Favicon | ⚠️ Emoji genérico | `data:image/svg+xml,...<text>👨🏻‍💻</text>` (linhas 6-7). Existe um `public/favicon.ico` real que **não está referenciado**. |
| `public/robots.txt` | ⚠️ Mínimo, sem sitemap | Conteúdo integral: `# https://www.robotstxt.org/robotstxt.html` / `User-agent: *` / `Disallow:` |
| `sitemap.xml` | ❌ **NÃO EXISTE** | Busca por `*sitemap*` no repositório inteiro: zero resultados |
| `public/manifest.json` | ❌ Template não customizado | `"short_name": "Landy"`, `"name": "Landy - React Template"` — nome do template React de origem, não da Lemamon. Aponta para `img/icons/logo192.png` e `logo512.png`, que **não existem em `public/`**. |
| Google Ads | ✅ Instalado | `gtag/js?id=AW-16881353870` (linhas 36-43) |
| Conversão Ads | ✅ Instalada, 1 evento | `send_to: "AW-16881353870/cEi0CLmh9Z8aEI6J1PE-"` (linhas 53-56) |
| **GA4** | ❌ **AUSENTE** | Nenhum ID `G-XXXXXXX` no arquivo |
| **GTM** | ❌ **AUSENTE** | Nenhum ID `GTM-XXXXXXX` no arquivo |
| New Relic Browser | ✅ Instalado | `accountID: "6460432"`, `applicationID: "601533249"`, com `session_replay` a `sampling_rate: 10.0` (linhas 61-68) |

**Observação importante sobre o New Relic:** o session replay está ativo com amostragem de 10% e `mask_all_inputs: true` / `mask_text_selector: '*'`. Isso é bom para privacidade, mas significa que o replay **não** serve para diagnóstico de CRO (você não consegue ler o que a pessoa escolheu). Ele não substitui analytics de produto. Além disso, o agente do New Relic está inline e minificado dentro do `index.html`, que hoje tem **73 KB** — praticamente todo esse peso é o New Relic bloqueando o parse inicial do HTML, o que penaliza LCP/INP e, por consequência, Core Web Vitals.

### 6.2.2. Problemas de arquitetura de URL

`src/router/config.ts` define:

```
path: ["/", "/lemamon", "/home"]  → component: "Home"
path: ["/projects"]               → component: "Projects"
path: ["/blog"]                   → component: "Blog"
path: ["/post/:id"]               → component: "Post"
```

Três problemas:

1. **Conteúdo duplicado em três URLs.** `/`, `/lemamon` e `/home` servem exatamente a mesma Home. Sem `canonical`, o Google pode indexar as três e diluir autoridade. `/lemamon` e `/home` devem ser redirect 301 para `/`, ou no mínimo receber canonical apontando para `/`.
2. **Só existem 4 rotas indexáveis.** Um site de agência com 4 URLs não tem superfície de busca nenhuma. Cada serviço vendido (`src/locales/pt-BR/translation.json` → "desenvolvimento de software sob medida, criação de websites e aplicativos móveis, consultoria tecnológica e integração de sistemas") deveria ter a própria página com a própria intenção de busca. Ver §6.3.3.
3. **O blog está populado com conteúdo de demonstração.** `src/data/posts.ts` tem 5 posts genéricos, tipo `"Introdução ao JavaScript Moderno"` com autor `"João Silva"`. Não é conteúdo de aquisição — é lastro de template. Ou vira conteúdo real de fundo de funil, ou sai do ar (`noindex`) até virar.

### 6.2.3. Impacto de ser SPA sem SSR

O app é 100% client-side render: `index.html` entrega `<div id="root"></div>` e um `<script type="module" src="/src/index.tsx">`. Sem SSR, sem pré-render.

**Para indexação orgânica:**
- O Googlebot renderiza JavaScript, mas em uma **segunda passada**, na fila de renderização. Na prática isso significa indexação mais lenta e menos confiável, e conteúdo que só aparece após interação (todo o wizard de `/projects`, que só monta depois de `setIsInitial(false)` em `src/pages/Projects/index.tsx`) **não é indexado de jeito nenhum**.
- Bing, e principalmente os crawlers de LLM/AI (que já pesam em descoberta B2B), renderizam JS mal ou não renderizam. Hoje, para esses, a lemamon.dev é uma página em branco com o texto "You need to enable JavaScript to run this app." (`index.html` linha 31).
- Como todas as rotas compartilham o mesmo `<head>` estático, **`/projects` e `/blog` têm exatamente o mesmo title e a mesma description da Home**. Do ponto de vista do Google, não há diferenciação de página.

**Para preview de link — o ponto crítico no Brasil:**

Aqui não é uma questão de "seria bom ter". No Brasil, a distribuição de link B2B acontece majoritariamente por **WhatsApp** (grupos de empresários, conversa direta com o decisor, encaminhamento interno) e por **LinkedIn**. E os crawlers dessas plataformas **não executam JavaScript**:

| Plataforma | Executa JS? | O que ela vê hoje |
|---|---|---|
| WhatsApp | ❌ Não | Título "lemamon.dev", descrição de 330 caracteres truncada, **e nenhuma imagem** — o link aparece como um retângulo cinza sem thumbnail |
| LinkedIn | ❌ Não | Mesma coisa; sem `og:image` o post fica sem cartão visual e o alcance orgânico despenca |
| Telegram / Slack / Discord | ❌ Não | Mesma coisa |
| X/Twitter | ❌ Não | Sem `twitter:card`, provavelmente nenhum cartão |

Um link sem thumbnail no WhatsApp tem taxa de clique drasticamente menor que um com imagem. Considerando que indicação e compartilhamento direto são o canal mais provável de primeiro cliente para uma agência (§6.4), **`og:image` é possivelmente a correção de maior retorno por hora de trabalho em todo este documento.** É uma imagem de 1200×630 px e três linhas de meta tag.

Como todas as rotas compartilham o mesmo `<head>`, compartilhar `/projects` (a página que efetivamente converte) produz o mesmo preview genérico da Home.

### 6.2.4. Backlog de SEO técnico, priorizado

**P0 — fazer nesta semana, antes de qualquer verba em mídia**

1. **Verificar em produção se `https://lemamon.dev/projects` acessado diretamente retorna 200 ou 404.** `public/_redirects` é sintaxe Netlify e o GitHub Pages não a interpreta. Se der 404, criar `public/404.html` que faz o fallback para o app (padrão SPA-GitHub-Pages). Sem isso, todo anúncio e todo link compartilhado apontando para `/projects` está perdido.
2. Trocar `<html lang="en">` por `<html lang="pt-BR">` e `og:locale` de `en_EN` para `pt_BR`.
3. Criar e adicionar `og:image` + `twitter:image` (1200×630 px, com logo, proposta de valor legível em miniatura e cidade/país). Adicionar `<meta name="twitter:card" content="summary_large_image">`.
4. Corrigir `<title>` para algo com keyword e marca. Proposta: `Fábrica de Software e Desenvolvimento Sob Medida | Lemamon` (≤ 60 caracteres).
5. Encurtar `meta description` e `og:description` para 150–160 caracteres, com CTA. Proposta: `Desenvolvemos software, apps e sistemas sob medida para empresas. Monte o escopo do seu projeto em 2 minutos e receba um orçamento.`
6. Remover a `meta keywords` (ou preenchê-la corretamente — mas o correto é remover; não tem efeito e hoje está errada).
7. Remover a `og:url` duplicada (linha 22).
8. Corrigir `twitter:title`/`twitter:description` para `name=` em vez de `property=`, e remover ou corrigir `twitter:site`.

**P1 — próximas 2–3 semanas**

9. `<link rel="canonical">` por rota; 301 ou canonical de `/lemamon` e `/home` para `/`.
10. `sitemap.xml` gerado no build (script no `vite.config.mts` ou passo no workflow do GitHub Actions), e linha `Sitemap: https://lemamon.dev/sitemap.xml` no `public/robots.txt`.
11. JSON-LD de `Organization` + `ProfessionalService` na Home (nome, logo, `areaServed: BR`, `address` — o footer já declara `Florianópolis, SC - Brasil`, ver `src/components/Footer/index.tsx`), e `FAQPage` na página de serviços quando ela existir.
12. Meta tags por rota com `react-helmet-async` — hoje não há nenhuma biblioteca de head no `package.json`, o `<head>` é 100% estático.
13. Corrigir `public/manifest.json`: `"Landy - React Template"` → nome real da Lemamon, e criar de fato os ícones `logo192.png`/`logo512.png` referenciados (eles não existem em `public/`).
14. Registrar propriedade no **Google Search Console** e no **Bing Webmaster Tools**, submeter sitemap. Sem isso, seguimos sem nenhum dado de busca real.

**P2 — 1–3 meses (estrutural)**

15. **Pré-renderização.** A correção definitiva do problema de SPA. Duas opções, em ordem de esforço:
    - **Opção A (recomendada, baixo risco):** `vite-plugin-ssg` / `vite-react-ssg` ou um passo de pré-render com Puppeteer no workflow, gerando HTML estático por rota. Mantém GitHub Pages, mantém o custo em zero, resolve indexação e preview de link por rota.
    - **Opção B (maior esforço, maior teto):** migrar para Next.js/Astro em Vercel ou Cloudflare Pages. Só justifica se a estratégia de conteúdo de §6.3.3 for pra frente de verdade e o blog virar um ativo.
16. Extrair o New Relic inline do `index.html` para carregamento assíncrono/deferido, ou avaliar se o session replay com todo o texto mascarado justifica os ~70 KB bloqueantes. Isso é Core Web Vitals direto.
17. Definir a estratégia de idioma. Hoje `src/translation.ts` usa `LanguageDetector` com `fallbackLng: "en"` e troca de idioma no client (`src/components/Footer/index.tsx`, `handleChange`), **sem URL própria por idioma**. Isso torna `hreflang` impossível de implementar corretamente. Duas saídas: (a) assumir que o mercado é Brasil, deixar o site em pt-BR com fallback pt e adiar en/es; (b) criar `/en/` e `/es/` como rotas reais e então declarar `hreflang`. **Recomendo (a)** — o alvo comercial é Brasil e manter três idiomas sem tradução de qualidade nem URL própria só custa manutenção.

---

## 6.3. Pesquisa de palavras-chave

> **Metodologia e ressalva:** os volumes abaixo são estimativas de ordem de grandeza para o Brasil, baseadas em conhecimento de mercado do setor, **não em consulta a ferramenta**. Servem para priorizar o trabalho, não para prever tráfego. **Antes de produzir conteúdo ou subir campanha, validar cada termo no Google Keyword Planner** (dá acesso a volume real ao criar uma campanha no Ads, que já existe: `AW-16881353870`) e cruzar com o Search Console assim que houver dado próprio.

### 6.3.1. Termos por intenção

**Transacional — quem está com cartão na mão (prioridade máxima)**

| Keyword | Volume/mês `[ESTIMATIVA]` | Dificuldade | Comentário |
|---|---|---|---|
| fábrica de software | 800–1.500 | Alta | Termo mais comercial do setor no Brasil. Muita concorrência de player grande. |
| desenvolvimento de software sob medida | 300–700 | Média | Já é o copy da `meta description` atual. Casa perfeito. |
| desenvolvimento de aplicativo sob medida | 200–500 | Média | Alinha com a opção "Aplicativo" do wizard (`project-questions.json`). |
| empresa de desenvolvimento de aplicativos | 500–1.000 | Alta | — |
| quanto custa desenvolver um aplicativo | 1.000–2.500 | Média | Volume alto, intenção clara de orçamento. **Oportunidade grande** — ver lead magnet, §6.5.2. |
| desenvolvimento de sistemas para empresas | 300–600 | Média | Casa com a opção "Sistema de Gestão (ERP/CRM)" do wizard. |
| criar aplicativo para empresa | 200–500 | Média | — |
| orçamento desenvolvimento de software | 100–300 | Baixa | Baixo volume, altíssima intenção. Alvo perfeito para o wizard `/projects`. |

**Comercial — está comparando fornecedor**

| Keyword | Volume/mês `[ESTIMATIVA]` | Dificuldade | Comentário |
|---|---|---|---|
| consultoria react | 100–300 | Baixa | Nicho, barato, alinhado à stack real do repositório (React 18 + TypeScript + Vite). |
| consultoria em desenvolvimento de software | 200–400 | Média | — |
| desenvolvedor react freelancer / empresa react | 150–400 | Baixa | — |
| melhores empresas de desenvolvimento de software no Brasil | 100–300 | Alta | Listicles dominam. Melhor caminho é **estar** nessas listas, não escrever a sua. |
| terceirização de desenvolvimento / outsourcing de TI | 300–800 | Média | Público corporativo maior. |
| squad as a service / alocação de desenvolvedores | 150–400 | Média | Modelo de receita recorrente — mais previsível que projeto fechado. |
| desenvolvimento de MVP | 200–500 | Média | Público startup. |
| agência de desenvolvimento de aplicativos Florianópolis | 30–100 | Baixa | **Local. Baixíssima concorrência, altíssima conversão.** O footer já declara Florianópolis. Ver §6.3.4. |

**Informacional — está aprendendo, ainda não compra (topo de funil, para conteúdo)**

| Keyword | Volume/mês `[ESTIMATIVA]` | Comentário |
|---|---|---|
| como criar um aplicativo do zero | 2.000–5.000 | Volume alto, intenção fraca, muito "quero fazer sozinho". |
| quanto tempo leva para desenvolver um app | 500–1.500 | Melhor que o anterior: quem pergunta prazo costuma ter projeto. |
| o que é MVP | 1.000–3.000 | Genérico demais. |
| diferença entre app nativo e híbrido | 500–1.200 | Bom conteúdo de meio de funil, atrai quem já decidiu construir. |
| react ou angular / react vs vue | 1.000–3.000 | Atrai desenvolvedor, **não comprador**. Bom pra marca empregadora, ruim pra lead. |
| como escolher uma fábrica de software | 100–300 | **Baixo volume, mas o leitor é literalmente o comprador.** Conteúdo de altíssimo valor. |
| checklist para contratar desenvolvimento de software | 50–150 | Idem. Vira lead magnet direto. |

**Regra de priorização:** com orçamento pequeno, ignore quase todo o informacional. "Como criar um aplicativo do zero" traz 5.000 visitas de gente que quer fazer sozinho e nenhum cliente. "Como escolher uma fábrica de software" traz 200 visitas de gente que vai contratar alguém.

### 6.3.2. Mapa página → keyword

Estado atual: 4 rotas, todas com o mesmo `<head>`. Estado alvo:

| URL | Status | Keyword primária | Keywords secundárias | Intenção | Title proposto |
|---|---|---|---|---|---|
| `/` | Existe | fábrica de software | desenvolvimento de software sob medida, empresa de desenvolvimento | Transacional | `Fábrica de Software e Desenvolvimento Sob Medida \| Lemamon` |
| `/projects` | Existe | orçamento desenvolvimento de software | quanto custa desenvolver um aplicativo | Transacional | `Monte o Escopo do Seu Projeto e Receba um Orçamento \| Lemamon` |
| `/servicos/aplicativos` | **Criar** | desenvolvimento de aplicativo sob medida | criar aplicativo para empresa, app iOS Android | Transacional | `Desenvolvimento de Aplicativos Sob Medida para Empresas \| Lemamon` |
| `/servicos/sistemas` | **Criar** | desenvolvimento de sistemas para empresas | ERP sob medida, CRM sob medida | Transacional | `Desenvolvimento de Sistemas e ERP Sob Medida \| Lemamon` |
| `/servicos/mvp` | **Criar** | desenvolvimento de MVP | criar MVP para startup, validar ideia | Comercial | `Desenvolvimento de MVP para Startups \| Lemamon` |
| `/servicos/consultoria-react` | **Criar** | consultoria react | especialista react, squad react | Comercial | `Consultoria e Squad React para Empresas \| Lemamon` |
| `/cases` | **Criar** | (marca / prova social) | — | Comercial | `Cases e Projetos Entregues \| Lemamon` |
| `/blog` | Existe (conteúdo demo) | (hub) | — | Informacional | `Blog sobre Desenvolvimento de Software \| Lemamon` |
| `/blog/quanto-custa-desenvolver-um-aplicativo` | **Criar** | quanto custa desenvolver um aplicativo | preço app, orçamento aplicativo | Informacional→Transacional | `Quanto Custa Desenvolver um Aplicativo em 2026? Faixas Reais` |
| `/blog/como-escolher-fabrica-de-software` | **Criar** | como escolher uma fábrica de software | contratar desenvolvimento | Informacional→Comercial | `Como Escolher uma Fábrica de Software: 12 Critérios` |
| `/lemamon`, `/home` | Existem | — | — | — | **Eliminar** (301 → `/`) |

O conteúdo dessas páginas de serviço **já existe em texto** dentro de `src/pages/Projects/project-questions.json` — as descrições de "Aplicativo", "Website", "Dashboard", "Sistema de Gestão (ERP/CRM)", "Plataforma com AI", "E-learning", "Chatbot Inteligente". Hoje esse conteúdo está preso dentro de um wizard client-side que nenhum buscador enxerga. Transformá-lo em páginas estáticas indexáveis é reaproveitamento, não redação do zero.

### 6.3.3. Ordem de execução do conteúdo

Não fazer tudo. Sequência recomendada:

1. **Quinzena 1–2:** corrigir a Home (title/description/OG/JSON-LD). É a página que já recebe todo o tráfego.
2. **Quinzena 3–4:** criar `/servicos/aplicativos` e `/servicos/sistemas` — as duas de maior intenção transacional, e as que servem de destino para Google Ads.
3. **Quinzena 5–6:** criar `/cases` com 3 projetos reais. Sem prova social nenhuma (e hoje não há **nenhuma** — nem cliente, nem depoimento, nem case no `translation.json`), a conversão de qualquer canal fica travada.
4. **Quinzena 7+:** os dois artigos de blog transacionais ("quanto custa" e "como escolher"). Um artigo bom a cada 15 dias vale mais que quatro medíocres.

### 6.3.4. SEO local — o atalho mais barato

O footer (`src/components/Footer/index.tsx`) já declara `Florianópolis, SC - Brasil`. Isso é um ativo não explorado:

- Criar e verificar o **Perfil da Empresa no Google** (Google Business Profile). É gratuito, aparece no mapa e no pacote local, e a concorrência por "desenvolvimento de software Florianópolis" é uma fração da concorrência nacional.
- Adicionar `LocalBusiness`/`ProfessionalService` no JSON-LD com o endereço.
- Florianópolis tem um ecossistema de tecnologia denso (ACATE, Sapiens Parque, startups). Ranquear localmente coloca a Lemamon na frente de empresas que preferem fornecedor próximo — e isso pesa em B2B brasileiro, onde a primeira reunião presencial ainda fecha negócio.

`[ESTIMATIVA]` Um perfil local bem configurado pode gerar 3–10 solicitações de contato/mês em uma cidade desse porte, a custo zero. Precisa ser validado na prática.

---

## 6.4. Estratégia de canais

Premissa: agência pequena, verba limitada, precisa de cliente **agora** e não em 12 meses. Isso muda tudo — orgânico não pode ser o carro-chefe no começo.

### 6.4.1. Comparativo

| Canal | Papel | Custo mensal `[ESTIMATIVA]` | Tempo até 1º resultado | Prioridade |
|---|---|---|---|---|
| **Indicação e parceria** | Motor principal de receita no ano 1 | ~R$ 0 (comissão 10–15% sobre fechado) | 2–6 semanas | 🟢 **1 — Máxima** |
| **Google Ads (Search)** | Torneira de demanda ligada/desligada | R$ 1.500–5.000 | 1–2 semanas | 🟢 **2 — Alta** |
| **LinkedIn orgânico (perfil pessoal)** | Autoridade + prospecção 1:1 | ~R$ 0 (custa tempo: 3–5h/semana) | 4–8 semanas | 🟢 **3 — Alta** |
| **SEO orgânico** | Ativo de longo prazo, CAC decrescente | R$ 0–2.000 (conteúdo) | 4–8 meses | 🟡 **4 — Média, começar já** |
| **Marketplaces (Workana, 99Freelas)** | Volume rápido, margem ruim | R$ 0–200 (plano) | 1–2 semanas | 🟡 **5 — Média, tático** |
| **Clutch / GoodFirms** | Prova social + lead internacional | US$ 0 (perfil) / US$ 1k+ mês (destaque) | 3–6 meses | 🟡 **6 — Média** |
| **Comunidade (ACATE, meetups, Discord)** | Rede + marca empregadora | R$ 0–500 | 2–4 meses | 🟡 **7 — Média** |
| **LinkedIn Ads** | Segmentação precisa, CPL caro | R$ 3.000+ (mínimo viável) | 2–4 semanas | 🔴 **8 — Baixa, adiar** |
| **GetNinjas** | Lead residencial/barato, não B2B | R$ 300–800 | 1 semana | 🔴 **9 — Não recomendado** |

### 6.4.2. Detalhamento

**1. Indicação e parceria — comece por aqui**

Para agência de software no Brasil, indicação é o canal com melhor CAC, melhor ticket e melhor taxa de fechamento. E é o mais negligenciado porque não tem dashboard.

- Ação: listar 30–50 contatos (ex-colegas, ex-clientes, fornecedores, amigos donos de empresa) e fazer contato 1:1 com uma mensagem específica — não "estou aceitando projetos", mas "estamos com capacidade para um projeto de app/sistema no próximo trimestre; se você souber de alguém precisando, me avisa".
- Ação: firmar 3–5 **parcerias de canal** com quem vende para o mesmo comprador mas não compete: agências de marketing digital (recebem pedido de sistema e não sabem entregar), consultorias de gestão/ERP, designers/estúdios de UX, contadores que atendem PME. Comissão de 10–15% sobre o valor fechado, acordo simples por escrito.
- Custo: praticamente zero. Tempo até resultado: 2–6 semanas.
- **É aqui que o `og:image` (§6.2.3) rende:** o parceiro vai mandar o link da Lemamon no WhatsApp. Se o preview vier sem imagem, a indicação perde força no exato momento em que ela é mais valiosa.

**2. Google Ads (Rede de Pesquisa) — a torneira**

A conta já existe (`AW-16881353870` em `index.html`, com label de conversão `cEi0CLmh9Z8aEI6J1PE-` — indica que já houve alguma tentativa de campanha).

- Papel: capturar quem já está buscando fornecedor **hoje**. É o único canal que liga demanda em dias.
- Estrutura recomendada: 3 campanhas separadas por intenção — "fábrica de software / desenvolvimento sob medida", "desenvolvimento de aplicativo", "sistema/ERP sob medida". Correspondência de frase e exata, nunca ampla no começo.
- Lista de negativas obrigatória desde o dia 1: `curso`, `grátis`, `gratuito`, `como fazer`, `tutorial`, `salário`, `vaga`, `emprego`, `estágio`, `download`, `apk`, `no code`, `sem programar`. Sem isso, metade da verba vira tráfego de desenvolvedor e estudante.
- Destino: `/servicos/aplicativos` e `/servicos/sistemas` quando existirem; até lá, `/projects`. **Não** mandar para a Home.
- **Pré-requisito bloqueante:** confirmar que o deep link responde 200 (§6.2.4, item 1). Anúncio apontando para 404 é dinheiro incinerado, e o Google Ads reprova o anúncio por página de destino inválida.
- `[ESTIMATIVA]` CPC no setor no Brasil: R$ 6–20 em termos comerciais, podendo passar de R$ 30 em "fábrica de software". Taxa de conversão de LP bem feita: 2–5%. Isso projeta CPL de R$ 150–600 — **a validar com dado real da conta**.

**3. LinkedIn orgânico — do perfil pessoal, não da página**

- No Brasil, o alcance orgânico de página de empresa é irrisório; perfil pessoal de fundador entrega muito mais. A estratégia é o(s) sócio(s) postando 2–3x/semana: bastidor de projeto, decisão técnica com justificativa de negócio, número real de um resultado entregue.
- Combinar com prospecção manual leve: 10–20 conexões/semana com perfis de "Diretor de Operações", "Head de Produto", "Sócio" em PMEs de 20–200 funcionários, sem pitch na primeira mensagem.
- Custo: tempo (3–5h/semana). Resultado: 4–8 semanas para os primeiros inbound.
- Aqui, de novo, `og:image` importa: post com link sem cartão visual tem alcance muito menor.

**4. SEO orgânico — plantar agora, colher depois**

- Papel: em 6–12 meses, virar a principal fonte de lead qualificado com CAC próximo de zero na margem.
- **Não é canal de curto prazo.** Tratar como investimento, executar em paralelo, nunca como plano A.
- O trabalho de §6.2.4 (P0/P1) é pré-requisito. Sem sitemap, sem canonical, sem pré-render e sem Search Console, produzir conteúdo é jogar texto no vácuo.

**5. Marketplaces — Workana, 99Freelas**

- Papel: **fluxo de caixa e portfólio**, não construção de marca. Serve para: preencher capacidade ociosa da equipe, gerar os 3 primeiros cases reais que faltam para `/cases`, e obter depoimentos.
- Realidade: margem apertada, concorrência por preço, cliente frequentemente internacional pagando pouco. Não construa o negócio em cima disso.
- Recomendação: usar por 3–6 meses de forma **oportunista**, com meta explícita de sair. Só aceitar projeto que gere case publicável.

**6. Clutch / GoodFirms / DesignRush**

- Papel: prova social verificável e porta de entrada para cliente internacional (que paga em dólar — muda a economia da agência inteira).
- Perfil gratuito vale a pena desde já. **Mas exige depoimentos verificados de clientes**, e essa é a peça que hoje não existe.
- Destaque pago custa a partir de ~US$ 1.000/mês. **Não fazer agora.** Só considerar depois de 8–10 avaliações reais.

**7. Comunidade — ACATE, meetups, Discords de tecnologia**

- Florianópolis tem uma vantagem estrutural: a ACATE e o ecossistema local concentram exatamente o comprador-alvo em eventos presenciais.
- Papel: rede de indicação (alimenta o canal 1) e marca empregadora. Não é canal de lead direto e não deve ser medido como tal.
- Custo: baixo. Retorno: indireto e lento, mas composto.

**8–9. LinkedIn Ads e GetNinjas — não fazer agora**

- **LinkedIn Ads:** segmentação por cargo/setor/tamanho de empresa é imbatível, mas `[ESTIMATIVA]` CPL de R$ 200–800 no Brasil e orçamento mínimo viável de ~R$ 3.000/mês para gerar aprendizado estatístico. Só entra no cenário agressivo (§6.7).
- **GetNinjas:** o modelo é venda de lead avulso, o público é majoritariamente pessoa física buscando serviço barato, e o mesmo lead é vendido para vários fornecedores. Descasado do ticket de uma fábrica de software. **Recomendação: não usar.**

---

## 6.5. Estratégia de conversão

### 6.5.1. CRO na landing e no wizard

**Problemas de conversão identificados no código:**

| # | Problema | Onde | Correção |
|---|---|---|---|
| 1 | **Zero prova social.** Nenhum logo de cliente, depoimento, case, número de projetos ou anos de mercado em todo o `translation.json` | `src/locales/pt-BR/translation.json` | Adicionar seção de logos + 2–3 depoimentos com nome, cargo e empresa acima da dobra |
| 2 | **Zero informação de preço ou prazo.** O copy fala em "Soluções Tecnológicas Personalizadas" e "Transformação Digital" — abstrato demais | `introContent`, `middleBlockContent`, `productContent` | Adicionar faixas ("projetos a partir de R$ X", "MVP em 8–12 semanas"). Faixa de preço **aumenta** conversão B2B ao filtrar quem não tem verba |
| 3 | **CTA genérico.** `"Conheça Mais"` e `"Fale Conosco"` | `introContent.button` | Trocar por `"Montar meu orçamento em 2 minutos"` — específico e com promessa de esforço baixo |
| 4 | **Wizard exige 4 passos antes de pedir contato**, com 7 e 8 opções em passos intermediários | `src/pages/Projects/data.json` | Testar versão de 2 passos; e capturar email **antes** do último passo para recuperar abandono |
| 5 | **Sem barra de progresso.** `ProjectBuilder` controla `currentQuestion` mas não mostra "Passo 2 de 4" | `src/components/ProjectBuilder/index.tsx` | Adicionar indicador de progresso — reduz abandono mensuravelmente |
| 6 | **Sem opção de "não sei ainda"** em nenhuma pergunta. Todo passo é obrigatório (`currentQuestionNotSelected` bloqueia o botão) | `ProjectBuilder` | Adicionar escape em cada passo. Lead que não sabe o que quer é lead válido, e hoje ele trava |
| 7 | **Nenhum campo de orçamento, prazo ou empresa** no formulário final. Só nome, email, telefone, descrição | `src/components/ContactForm/index.tsx` | Adicionar "faixa de orçamento" (select) e "quando pretende começar". Sem isso, não há qualificação e o time perde tempo com lead frio |
| 8 | **BUG — botões da tela de sucesso não fazem nada.** `<Button key="back" color="#fff">` e `<Button key="home">` não recebem `onClick` | `ContactForm`, bloco `if (success)` | Ligar os handlers. O lead que acabou de converter fica em beco sem saída |
| 9 | **Sem aviso de LGPD/privacidade** no formulário que coleta nome, email e telefone | `ContactForm` | Adicionar texto e link de política. É exigência legal e também sinal de confiança |
| 10 | **Sem canal de contato imediato.** O único é `mailto:lemamon.dev@gmail.com` | `src/components/Footer/index.tsx` | Adicionar WhatsApp (§6.5.5). Email pessoal do Gmail como único canal também prejudica percepção de profissionalismo |
| 11 | **Links de rodapé quebrados.** `"About"`, `"Press"` e `"Careers & Culture"` apontam todos para `/` | `Footer` | Remover os que não existem. Link morto sinaliza site abandonado |
| 12 | **Sem loading/feedback de erro específico.** Erro genérico "Erro ao criar projeto" | `ContactForm` + `src/service/index.ts` | Preservar os dados digitados no erro e oferecer WhatsApp como alternativa |

**Testes A/B a rodar, em ordem** (só depois de ter GA4 e volume mínimo — testar sem instrumentação é adivinhação):
1. CTA da Home: `"Conheça Mais"` vs `"Montar meu orçamento em 2 minutos"`
2. Wizard de 4 passos vs 2 passos
3. Com vs sem faixa de preço na Home
4. Captura de email no passo 1 vs no fim

### 6.5.2. Lead magnet

Hoje o site oferece uma coisa só: preencher um wizard de 4 passos e esperar contato. Isso captura apenas quem já decidiu comprar. Falta oferta para quem está a 3 meses da decisão.

Três iscas, em ordem de prioridade:

1. **"Calculadora: quanto custa desenvolver seu aplicativo"** — ⭐ prioridade máxima. Casa exatamente com a keyword de maior volume transacional da lista (§6.3.1), e **90% dela já está construída**: o wizard em `src/pages/Projects/data.json` já coleta tipo de projeto, segmento e funcionalidades adicionais (painel admin, integração com API, push, infraestrutura). Falta apenas atribuir faixa de valor a cada combinação e exibir uma estimativa **na hora**, antes do envio. Entregar valor imediato multiplica a conversão em relação a "aguarde nosso contato".
2. **"Checklist: 12 perguntas para fazer antes de contratar uma fábrica de software"** (PDF) — captura quem está comparando fornecedores, e enquadra os critérios de avaliação a favor de quem escreveu o checklist.
3. **"Diagnóstico técnico gratuito de 30 minutos"** — para leads mais quentes; alto custo de tempo, então oferecer só a quem sinalizou orçamento.

### 6.5.3. Sequência de nutrição por email

Hoje: `src/service/index.ts` dispara um POST para o backend Heroku (`lemamon-email-service-...herokuapp.com/send-email`) e acabou. **Não há CRM, não há sequência, não há follow-up automático.** Um lead que não responde ao primeiro contato está perdido para sempre.

Sequência proposta (ferramenta: Brevo ou MailerLite, planos gratuitos até ~300 envios/dia — suficiente no início):

| Dia | Email | Objetivo |
|---|---|---|
| 0 (imediato) | **Confirmação + resumo do que ele escolheu no wizard** + próximo passo com prazo explícito ("respondemos em até 4h úteis") | Confirmar recebimento, provar que fomos atentos ao que ele pediu |
| 1 | Case relevante ao **tipo de projeto que ele selecionou** (app / sistema / dashboard) | Prova social segmentada |
| 3 | "Como funciona nosso processo" — descoberta, protótipo, sprints, entrega | Reduzir risco percebido |
| 7 | "Erros mais caros ao contratar desenvolvimento" | Autoridade + enquadramento de critério |
| 14 | Convite direto para conversa de 20 minutos, com link de agenda | Conversão |
| 30 | "Ainda faz sentido?" — email curto, uma pergunta só | Reativação. Costuma ser o de maior taxa de resposta |
| 60+ | Newsletter mensal (1 conteúdo + 1 case) | Manter presença até o momento de compra |

Sequência separada para quem baixou a calculadora mas **não** completou o formulário — esse é lead de topo e não deve receber a mesma cadência comercial.

### 6.5.4. SLA de resposta ao lead

Este é o item de maior impacto e menor custo do documento inteiro.

Pesquisa clássica de vendas B2B (Harvard Business Review / InsideSales): responder um lead inbound em até 5 minutos aumenta drasticamente a chance de qualificá-lo comparado a responder em 1 hora, e a curva despenca depois disso. `[ESTIMATIVA de mercado — não é dado da Lemamon]`

Hoje, o lead vai para um email. Se ninguém estiver olhando a caixa, ele espera horas ou dias. Nesse intervalo, ele já falou com dois concorrentes.

**Compromissos a estabelecer:**

| Horário | SLA de 1º contato | Como |
|---|---|---|
| Dias úteis, 9h–18h | **≤ 15 minutos** | Notificação push (WhatsApp/Telegram/Slack) disparada pelo backend a cada lead |
| Fora do horário e fins de semana | **≤ 2 horas na manhã seguinte** | Autoresponder imediato com prazo explícito |

**Implementação técnica (baixo esforço, alto retorno):**
- No serviço Heroku que já recebe o POST, adicionar disparo de webhook para WhatsApp/Telegram do responsável comercial, com nome, telefone e resumo das escolhas do wizard. Hoje o payload já carrega `optionsSummaryText` (`src/service/index.ts`), ou seja, todo o contexto necessário já está sendo transmitido — só falta rotear.
- Primeiro contato por **WhatsApp**, não por email. No B2B brasileiro, WhatsApp tem taxa de resposta várias vezes maior que email frio. O formulário já coleta `phone` (`ContactForm`) — o dado está sendo capturado e não está sendo usado.
- Registrar o lead em CRM. Sugestão inicial: planilha estruturada ou Pipedrive/HubSpot Free. Sem registro, não há como medir lead → reunião → proposta → cliente.

### 6.5.5. WhatsApp Business

Não é opcional no Brasil. É o canal de vendas B2B padrão.

- **Botão flutuante de WhatsApp** em todas as páginas, com mensagem pré-preenchida contextual por rota (`https://wa.me/55DDDNUMERO?text=Olá,+vim+pelo+site+e+quero+um+orçamento+de+aplicativo`).
- **WhatsApp Business API ou app Business** com: mensagem de saudação automática, mensagem de ausência com prazo de retorno, e respostas rápidas para as 10 perguntas mais frequentes.
- **Rastreamento:** cada botão de WhatsApp dispara evento GA4 (`whatsapp_click`, ver §6.6) com a rota de origem, e a URL leva parâmetro identificando a origem para atribuição.
- **Não substituir o wizard pelo WhatsApp.** O wizard qualifica melhor e coleta escopo estruturado. Ofereça os dois: wizard para quem quer pensar, WhatsApp para quem quer falar agora. `[ESTIMATIVA]` Cerca de metade dos leads B2B brasileiros prefere o contato direto — hoje, essa metade não tem por onde entrar.

---

## 6.6. Instrumentação de analytics

### 6.6.1. Estado atual e o buraco

O que existe em `index.html`:
- `gtag/js?id=AW-16881353870` — **tag de Google Ads**, não GA4.
- `window.gtag_report_conversion()` com `send_to: "AW-16881353870/cEi0CLmh9Z8aEI6J1PE-"`.
- New Relic Browser (RUM + session replay a 10%, com todo o texto e inputs mascarados).

O que **não** existe: nenhum ID `G-` (GA4), nenhum `GTM-`, nenhum Meta Pixel, nenhum LinkedIn Insight Tag.

O único disparo de conversão está em `src/service/index.ts`:

```ts
if (
  typeof window.gtag_report_conversion === "function" &&
  process.env.NODE_ENV === "production"
) {
  window.gtag_report_conversion();
}
```

Consequências práticas:
- **Um funil de 6 etapas com 1 ponto de medição, no fim.** Se a taxa de conversão for baixa, não há como saber se o problema é tráfego, Home, entrada no wizard, passo 3 ou o formulário.
- **Nenhuma pageview é registrada em GA4** — porque não há GA4. Não sabemos volume de visitas, origem de tráfego, dispositivo ou taxa de rejeição.
- **A conversão só dispara após `response.ok`.** Se o backend Heroku estiver dormindo (dyno free hiberna) ou falhar, o lead preencheu tudo e **não é contabilizado nem no Ads**. Recomendação: disparar um evento GA4 `generate_lead_attempt` **antes** do `fetch`, e a conversão do Ads após o sucesso.
- **Nenhum `event_id`/deduplicação**, o que impede conversão server-side futura sem contagem dupla.

### 6.6.2. Plano de eventos GA4

Convenção: `snake_case`, parâmetros custom registrados como dimensões personalizadas no GA4.

**Etapa 1 — Visita**

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `page_view` | Toda mudança de rota (react-router v5 — instrumentar via listener do `history`, pois SPA não recarrega) | `page_path`, `page_title`, `page_referrer`, `language` |
| `session_start` | Automático (GA4) | — |

**Etapa 2 — Engajamento**

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `scroll_depth` | 25/50/75/90% da Home | `percent`, `page_path` |
| `cta_click` | Clique em qualquer CTA principal (`introContent.button`, `middleBlockContent.button`) | `cta_id`, `cta_text`, `page_path`, `position` |
| `whatsapp_click` | Clique no botão de WhatsApp | `page_path`, `source_section` |
| `email_click` | Clique no `mailto:lemamon.dev@gmail.com` do footer | `page_path` |
| `blog_post_view` | Abertura de `/post/:id` | `post_id`, `post_title`, `post_category` |
| `blog_read_complete` | 90% de scroll em um post | `post_id`, `time_on_page` |
| `language_change` | Uso do seletor de idioma no `Footer` | `from_lang`, `to_lang` |

**Etapa 3 — Início do wizard**

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `wizard_view` | Renderização da intro de `/projects` (`isInitial === true`) | `entry_source`, `referrer` |
| `wizard_start` | Clique em "Comece seu projeto!" → `setIsInitial(false)` | `entry_source` |

**Etapa 4 — Passo a passo do wizard** (instrumentar em `src/components/ProjectBuilder/index.tsx`)

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `wizard_step_view` | Cada mudança de `currentQuestion` | `step_index` (0–3), `step_id` (`b47f2h6r`, `a5eb108e`, `d0a431fb`, `ad1b837a`), `step_title` |
| `wizard_option_select` | Cada `toggleSelection` | `step_id`, `option_id`, `option_title`, `selected` (bool), `total_selected` |
| `wizard_step_complete` | `handleNext` bem-sucedido | `step_index`, `step_id`, `options_selected` (array), `time_on_step_ms` |
| `wizard_step_back` | `handleBack` | `from_step`, `to_step` |
| `wizard_blocked` | Clique em "Próximo" com `currentQuestionNotSelected === true` | `step_id` — **mede fricção diretamente** |
| `wizard_abandon` | `beforeunload` com wizard iniciado e não enviado | `last_step_index`, `time_in_wizard_ms` |

**Etapa 5 — Lead**

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `form_view` | `showFinalForm === true` | `total_steps_completed`, `selections_summary` |
| `form_field_complete` | `blur` em cada campo com valor | `field_name` (`name`/`email`/`phone`/`description`) |
| `form_validation_error` | Botão desabilitado por email inválido | `field_name`, `error_type` |
| `generate_lead_attempt` | **Antes** do `fetch` em `src/service/index.ts` | `event_id` (UUID), `services`, `project_types`, `segment`, `extras_count` |
| `generate_lead` ⭐ | Após `response.ok` — **conversão principal** | `event_id`, `value` `[ESTIMATIVA de ticket]`, `currency: BRL`, `services`, `project_types`, `has_phone`, `time_to_convert_ms` |
| `generate_lead_error` | No `catch` de `sendEmail` | `event_id`, `error_message`, `http_status` |
| `lead_success_view` | Renderização do `Result` de sucesso | `event_id` |

**Etapa 6 — Cliente (offline, fora do site)**

| Evento | Quando | Como |
|---|---|---|
| `lead_qualified` | Comercial marca o lead como qualificado no CRM | Import de conversão offline no Google Ads via GCLID |
| `meeting_booked` | Reunião agendada | Idem |
| `proposal_sent` | Proposta enviada | Idem |
| `deal_won` | Contrato assinado | Import offline **com valor real** — é isso que ensina o algoritmo do Ads a buscar leads que viram cliente, e não só leads baratos |

Para o import offline funcionar, é preciso capturar o `gclid` da URL na primeira visita, guardar em `localStorage`/cookie de primeira parte e enviá-lo junto com o payload em `sendEmail`. **Sem isso, jamais será possível calcular ROI real de mídia paga.**

### 6.6.3. Configuração recomendada

1. **Criar propriedade GA4** e instalar via **Google Tag Manager**, não via snippet direto. GTM permite adicionar/ajustar tags e pixels sem novo deploy — relevante aqui, já que cada mudança em `index.html` exige rodar o workflow do GitHub Actions e republicar o site.
2. **Vincular GA4 ↔ Google Ads** (a conta `AW-16881353870` já existe) para importar conversões e habilitar remarketing.
3. **Marcar `generate_lead` como conversão** no GA4 e importar para o Ads como conversão primária. Manter a tag atual de `gtag_report_conversion` durante a transição para não perder histórico.
4. **Search Console → GA4:** vincular assim que a propriedade estiver verificada, para cruzar consulta de busca com comportamento no site.
5. **Consent Mode v2 + banner de cookies.** O site coleta nome, email e telefone (`ContactForm`) e roda session replay (New Relic), sem nenhum aviso de privacidade. É exposição de LGPD e também requisito do Consent Mode para campanhas.
6. **Dimensões personalizadas no GA4:** `step_id`, `services`, `project_types`, `segment`, `entry_source`.
7. **Relatório de funil (exploração no GA4):** `page_view` → `wizard_view` → `wizard_start` → `wizard_step_complete[0..3]` → `form_view` → `generate_lead`. Este é o painel que responde "onde estamos perdendo gente".

### 6.6.4. Pixels: Meta e LinkedIn — vale a pena?

| Pixel | Recomendação | Justificativa |
|---|---|---|
| **LinkedIn Insight Tag** | ✅ **Instalar agora** | Custo zero, e ele **começa a acumular audiência de remarketing imediatamente**. Mesmo sem rodar LinkedIn Ads hoje, quando a verba existir a audiência já estará madura. Também entrega dados demográficos de empresa/cargo dos visitantes — inteligência de mercado gratuita, e o público B2B do LinkedIn é exatamente o comprador-alvo. |
| **Meta Pixel** | 🟡 **Instalar, mas com expectativa baixa** | Também é gratuito e acumula audiência. Mas Meta é fraco para B2B de ticket alto: não há segmentação confiável por cargo, e o público em modo de lazer converte mal para "contratar fábrica de software". Serve principalmente para **remarketing** de quem já visitou (aí sim funciona bem e é barato). **Não usar como canal de prospecção fria.** |
| **TikTok Pixel** | ❌ Não | Público descasado do comprador B2B. |
| **Google Ads Remarketing** | ✅ Já vem no GA4 vinculado | Ativar listas de remarketing: "visitou mas não iniciou o wizard", "iniciou o wizard mas abandonou", "converteu". A segunda lista é ouro — pessoa em consideração ativa. |

**Regra de higiene:** todo pixel via GTM, disparo condicionado ao consentimento, e revisar a cada trimestre. Pixel esquecido é peso na página e risco de LGPD.

---

## 6.7. Orçamento e metas

> **Ressalva obrigatória:** os números abaixo são **estimativas de mercado para agências de software B2B no Brasil**. Não temos dado histórico da Lemamon — não há GA4, não há Search Console, não há relatório de Ads no repositório. Estes cenários servem para dimensionar decisão, não para prometer resultado. **Revisar todos os números após 60 dias com dado próprio.**

**Premissas usadas (todas `[ESTIMATIVA]`, todas a validar):**
- Ticket médio de projeto: R$ 25.000–80.000
- Taxa lead → reunião: 25–35%
- Taxa reunião → proposta: 50–60%
- Taxa proposta → fechamento: 20–30%
- Portanto, **lead → cliente ≈ 3–6%** → são necessários **~20–30 leads qualificados para 1 cliente**

### Cenário A — Enxuto (R$ 500–1.500/mês)

Para quando o caixa é apertado e o objetivo é validar canal.

| Item | Valor `[ESTIMATIVA]` |
|---|---|
| Google Ads (Search, 2 campanhas, keywords exatas) | R$ 800/mês |
| Ferramenta de email (Brevo free / MailerLite) | R$ 0 |
| CRM (HubSpot Free / planilha) | R$ 0 |
| Conteúdo (1 artigo/mês, produção interna) | R$ 0 (custa ~6h) |
| Perfis: Google Business, Clutch, LinkedIn | R$ 0 |
| Design de `og:image` e material | R$ 200 (uma vez) |
| **Total mensal** | **~R$ 800–1.000** |

| Meta | Valor `[ESTIMATIVA]` |
|---|---|
| CPL esperado | R$ 250–450 |
| Leads/mês (pagos) | 2–4 |
| Leads/mês (orgânico + indicação) | 2–5 |
| **Total leads/mês** | **4–9** |
| Clientes/mês esperados | 0,3–0,5 (≈ 1 a cada 2–3 meses) |

**Foco:** indicação e parceria (§6.4, canal 1) fazem o trabalho pesado. O Ads serve como teste controlado, não como motor.

### Cenário B — Médio (R$ 3.000–5.000/mês) ⭐ recomendado

Ponto de equilíbrio entre risco e velocidade. É o cenário que recomendo assim que os itens P0 de SEO técnico estiverem corrigidos.

| Item | Valor `[ESTIMATIVA]` |
|---|---|
| Google Ads (Search, 3 campanhas + remarketing) | R$ 2.500/mês |
| Meta Ads (apenas remarketing) | R$ 300/mês |
| Ferramenta de email (Brevo pago) | R$ 100/mês |
| CRM (Pipedrive Essential, 2 usuários) | R$ 200/mês |
| Conteúdo (2 artigos/mês, redator freelance com revisão técnica) | R$ 800/mês |
| Design (peças, cases, OG por página) | R$ 400/mês |
| Ferramenta de SEO (Semrush/Ahrefs plano de entrada) | R$ 600/mês |
| **Total mensal** | **~R$ 4.900** |

| Meta | Valor `[ESTIMATIVA]` |
|---|---|
| CPL esperado (pago) | R$ 180–350 |
| Leads/mês (pagos) | 8–15 |
| Leads/mês (orgânico) | 3–8 (a partir do mês 4) |
| Leads/mês (indicação/LinkedIn) | 4–8 |
| **Total leads/mês** | **15–30** |
| Clientes/mês esperados | 1–2 |
| CAC `[ESTIMATIVA]` | R$ 2.500–5.000 |
| Payback com ticket de R$ 40k | Primeiro projeto |

### Cenário C — Agressivo (R$ 10.000–15.000/mês)

Só faz sentido com **capacidade de entrega comprovada** e caixa para 6 meses. Gerar 40 leads sem time para atender é pior que não gerar.

| Item | Valor `[ESTIMATIVA]` |
|---|---|
| Google Ads (Search + Display remarketing + Performance Max) | R$ 6.000/mês |
| LinkedIn Ads (Lead Gen Forms, segmentação por cargo) | R$ 3.000/mês |
| Meta Ads (remarketing + lookalike) | R$ 800/mês |
| Conteúdo (4 artigos/mês + 1 material rico) | R$ 2.500/mês |
| SDR/BDR (meio período ou terceirizado) | R$ 2.500/mês |
| Ferramentas (CRM + SEO + automação) | R$ 1.200/mês |
| Clutch sponsored | R$ 0 (adiar até ter 8+ reviews) |
| **Total mensal** | **~R$ 16.000** |

| Meta | Valor `[ESTIMATIVA]` |
|---|---|
| CPL esperado (blended) | R$ 200–400 |
| **Total leads/mês** | **35–60** |
| Clientes/mês esperados | 2–4 |
| CAC `[ESTIMATIVA]` | R$ 4.000–8.000 |

### Recomendação

**Comece no Cenário A por 60 dias**, enquanto executa o P0/P1 de SEO técnico e monta a instrumentação de GA4. Sem dado, aumentar verba é aumentar a taxa de queima de dinheiro no escuro.

**Migre para o Cenário B no mês 3**, se e somente se: (1) GA4 estiver medindo o funil completo, (2) `/projects` responder 200 em deep link, (3) o SLA de 15 minutos estiver operando, (4) existirem ao menos 3 cases publicados.

**Cenário C só a partir do mês 9+**, e só com CAC comprovado abaixo de 15% do ticket médio.

### Indicadores a acompanhar semanalmente

| Métrica | Fonte | Meta inicial `[ESTIMATIVA]` |
|---|---|---|
| Sessões | GA4 | Baseline a estabelecer no mês 1 |
| Taxa visita → `wizard_start` | GA4 | > 8% |
| Taxa `wizard_start` → `generate_lead` | GA4 | > 25% |
| Tempo médio de 1ª resposta | CRM | < 15 min |
| Taxa lead → reunião | CRM | > 25% |
| CPL por canal | Ads + GA4 | < R$ 400 |
| CAC | CRM + custos | < 15% do ticket |
| Posições no Search Console | GSC | Crescimento mês a mês |

---

## 6.8. Calendário de execução — 90 dias

### Quinzena 1 (dias 1–15) — Parar o sangramento

- [ ] **Verificar em produção se `lemamon.dev/projects` retorna 200.** Se 404, criar `public/404.html` com fallback SPA. *(bloqueante para tudo)*
- [ ] Corrigir `<html lang="pt-BR">` e `og:locale` → `pt_BR` em `index.html`
- [ ] Criar `og:image` 1200×630 e adicionar `og:image` + `twitter:image` + `twitter:card`
- [ ] Reescrever `<title>` e `meta description`; remover `meta keywords` e a `og:url` duplicada
- [ ] Corrigir `twitter:*` de `property=` para `name=`
- [ ] Instalar **GTM + GA4**; configurar `page_view` para SPA (listener no history do react-router v5)
- [ ] Instalar **LinkedIn Insight Tag** e **Meta Pixel** via GTM (só acumulando audiência)
- [ ] Registrar no **Google Search Console** e **Bing Webmaster Tools**
- [ ] Corrigir o bug dos botões sem `onClick` na tela de sucesso do `ContactForm`
- [ ] Adicionar botão flutuante de **WhatsApp** com evento `whatsapp_click`
- [ ] Configurar **notificação instantânea de lead** (webhook do Heroku → WhatsApp/Telegram) e assumir o **SLA de 15 minutos**

### Quinzena 2 (dias 16–30) — Ver o funil

- [ ] Instrumentar o plano de eventos completo do §6.6.2 no `ProjectBuilder` e no `ContactForm`
- [ ] Disparar `generate_lead_attempt` **antes** do `fetch` em `src/service/index.ts`; adicionar `event_id`
- [ ] Capturar e persistir `gclid` para import de conversão offline
- [ ] Gerar `sitemap.xml` no build; adicionar `Sitemap:` ao `public/robots.txt`; submeter ao GSC
- [ ] Adicionar `canonical` por rota; 301/canonical de `/lemamon` e `/home` → `/`
- [ ] JSON-LD `Organization` + `LocalBusiness` (Florianópolis) na Home
- [ ] Corrigir `public/manifest.json` (tirar "Landy - React Template") e criar os ícones ausentes
- [ ] Validar keywords do §6.3.1 no **Google Keyword Planner** — substituir todas as estimativas por volume real
- [ ] Criar e verificar o **Perfil da Empresa no Google**
- [ ] Montar lista de 30–50 contatos para campanha de indicação; iniciar abordagem 1:1
- [ ] Configurar CRM (HubSpot Free ou Pipedrive) e cadastrar todo lead nele

### Quinzena 3 (dias 31–45) — Ligar a demanda

- [ ] Subir **Google Ads**: 2 campanhas de pesquisa, correspondência exata e de frase, lista de negativas completa
- [ ] Criar `/servicos/aplicativos` e `/servicos/sistemas` (reaproveitando o texto de `project-questions.json`), com meta tags e OG próprios
- [ ] Implementar `react-helmet-async` para meta tags por rota
- [ ] Adicionar **prova social** na Home: logos, 2–3 depoimentos com nome/cargo/empresa
- [ ] Trocar CTA `"Conheça Mais"` → `"Montar meu orçamento em 2 minutos"`
- [ ] Adicionar barra de progresso e opção "não sei ainda" no wizard
- [ ] Adicionar campos de **faixa de orçamento** e **prazo** no `ContactForm`
- [ ] Adicionar aviso de LGPD + link de política de privacidade no formulário
- [ ] Configurar sequência de nutrição por email (emails do dia 0, 1 e 3)
- [ ] Iniciar rotina de LinkedIn: 2–3 posts/semana no perfil dos sócios

### Quinzena 4 (dias 46–60) — Prova social e primeiro ajuste

- [ ] Criar página `/cases` com 3 projetos reais (usar projetos de marketplace se necessário)
- [ ] Coletar 3–5 depoimentos de clientes; publicar perfil no **Clutch** e **GoodFirms**
- [ ] Firmar 3–5 **parcerias de canal** com comissão acordada por escrito
- [ ] Completar a sequência de nutrição (dias 7, 14, 30)
- [ ] **Primeira revisão de dados:** analisar o funil do GA4 e identificar o maior ponto de abandono
- [ ] Otimizar Google Ads com base em termos de busca reais; expandir negativas
- [ ] Ativar listas de remarketing (visitou / abandonou wizard)
- [ ] Perfis em Workana/99Freelas, se o objetivo for capacidade ociosa

### Quinzena 5 (dias 61–75) — Escalar o que funcionou

- [ ] Publicar `/blog/quanto-custa-desenvolver-um-aplicativo` (keyword de maior volume transacional)
- [ ] Construir a **calculadora de custo** aproveitando a lógica do wizard existente — lead magnet nº 1
- [ ] Criar `/servicos/mvp` e `/servicos/consultoria-react`
- [ ] Rodar **teste A/B nº 1**: wizard de 4 passos vs 2 passos
- [ ] Configurar **import de conversão offline** no Google Ads (lead qualificado, deal ganho)
- [ ] Avaliar migração para o Cenário B de orçamento, conforme os critérios do §6.7
- [ ] Implementar **Consent Mode v2** + banner de cookies

### Quinzena 6 (dias 76–90) — Consolidar e decidir

- [ ] Publicar `/blog/como-escolher-fabrica-de-software` + checklist em PDF (lead magnet nº 2)
- [ ] Iniciar avaliação de **pré-renderização** (§6.2.4, item 15) — decidir entre plugin SSG e migração de plataforma
- [ ] Otimizar performance: extrair o New Relic inline do `index.html` (~70 KB bloqueantes) e medir Core Web Vitals
- [ ] Rodar **teste A/B nº 2**: com vs sem faixa de preço na Home
- [ ] **Revisão de 90 dias:** CPL real por canal, CAC real, taxa lead→cliente real — **substituir todas as estimativas deste documento por dados verdadeiros**
- [ ] Decidir alocação do trimestre seguinte com base no canal de melhor CAC
- [ ] Decidir sobre a estratégia multi-idioma (§6.2.4, item 17)

---

## 6.9. Riscos e premissas

| Risco | Impacto | Mitigação |
|---|---|---|
| `/projects` retorna 404 em produção (`_redirects` é sintaxe Netlify no GitHub Pages) | **Crítico** — inviabiliza mídia paga e link compartilhado | Verificar no dia 1; criar `404.html` de fallback |
| Backend Heroku indisponível (dyno hibernando) derruba a captura de lead | **Alto** — lead preenche tudo e some | Health check, retry, e disparo de `generate_lead_attempt` antes do `fetch` |
| Investir em conteúdo antes de resolver a indexação de SPA | Médio — trabalho sem retorno | Executar P0/P1 de SEO antes de escalar conteúdo |
| Escalar mídia sem capacidade de entrega | Alto — dano reputacional e leads queimados | Casar verba com capacidade real do time |
| Ausência total de prova social trava conversão em todos os canais | **Alto** | Priorizar `/cases` e depoimentos na quinzena 4 |
| LGPD: coleta de dados pessoais e session replay sem consentimento nem política | Médio-alto (legal) | Banner de consentimento + política de privacidade até a quinzena 3 |
| Todas as estimativas deste documento se provarem otimistas | Médio | Revisão obrigatória aos 60 e 90 dias com dado real |

**Premissas assumidas** (confirmar com o negócio): o mercado-alvo é Brasil; o ticket médio está na faixa de R$ 25k–80k; existe capacidade para 2–4 projetos simultâneos; há caixa para sustentar 3–6 meses de investimento antes do retorno; e há uma pessoa disponível para cumprir o SLA de 15 minutos em horário comercial.

---

### Arquivos citados nesta seção

- `index.html` — meta tags, OG, Twitter, Google Ads (`AW-16881353870`), New Relic
- `public/robots.txt`, `public/manifest.json`, `public/_redirects`
- `src/router/config.ts`, `src/router/index.tsx` — rotas indexáveis
- `src/service/index.ts` — envio de lead e disparo de conversão
- `src/locales/pt-BR/translation.json` — copy e promessas
- `src/pages/Projects/index.tsx`, `src/pages/Projects/data.json`, `src/pages/Projects/project-questions.json` — wizard
- `src/components/ProjectBuilder/index.tsx`, `src/components/ContactForm/index.tsx` — funil de conversão
- `src/components/Footer/index.tsx` — contato e seletor de idioma
- `src/data/posts.ts` — conteúdo de blog (demonstração)
- `src/translation.ts` — configuração i18n
- `.github/workflows/` — deploy GitHub Pages
- `vite.config.mts`, `package.json`
