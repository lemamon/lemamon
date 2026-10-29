# Estratégia de Produto — Landing Page Lemamon

> Documento de arquitetura de melhoria — Seção 1 (Produto)
> Base: leitura do código em `/Users/deyvidmarinho/Documents/projects/lemamon/lemamon.dev` (branch `main`, commit `8b36ba2`)
> Premissa de tráfego usada nos cálculos: ~800 sessões/mês (site pequeno, com Google Ads ativo — tag `AW-16881353870` em `index.html`). Ajustar os números de Reach quando houver dado real do GA4.

---

## 1. Diagnóstico

### 1.1 O que o site comunica hoje

A Home (`src/pages/Home/index.tsx`) tem 5 blocos, nesta ordem: `intro` → `middleBlock` → `about` → `mission` → `product` → `contact`. Todo o copy vem de `src/locales/pt-BR/translation.json`. Lido em sequência, o site diz:

| Bloco | Copy real | O que o comprador entende |
|---|---|---|
| `introContent.title` | "Soluções Tecnológicas Personalizadas para o Seu Negócio" | Nada. Frase intercambiável com 10 mil agências. |
| `middleBlockContent.title` | "Transforme Ideias em Realidade" | Slogan. Zero informação. |
| `aboutContent.title` | "Transformação Digital" | Jargão de 2016. |
| `aboutContent.section[0]` | "Inovação Constante — Estamos sempre à frente, explorando e implementando as mais recentes tecnologias…" | Autoelogio sem prova. |
| `missionContent` | "Nossa Missão — Impulsionar a transformação digital de empresas…" | Um bloco inteiro da Home dedicado a algo que nenhum cliente pesquisa. |
| `productContent` | "Oferecemos desenvolvimento de software sob medida, criação de websites e aplicativos móveis, consultoria tecnológica e integração de sistemas." | Lista de serviços em **um parágrafo só**, sem página própria, sem preço, sem prazo. |

**Resumo do diagnóstico de copy:** a landing page inteira fala sobre a Lemamon em abstrato e não responde nenhuma das quatro perguntas que um comprador brasileiro de PME faz nos primeiros 30 segundos:

1. **Vocês já fizeram algo parecido com o que eu preciso?** → não há um único case, logo de cliente, screenshot de produto ou depoimento em todo o repositório.
2. **Quanto custa mais ou menos?** → a palavra "investimento", "a partir de", "faixa" ou "R$" não aparece em nenhum lugar de `src/locales/pt-BR/translation.json`.
3. **Em quanto tempo fica pronto?** → nenhuma menção a prazo, sprint, entrega, MVP em semanas.
4. **Quem são vocês? É empresa ou é um freelancer?** → o único contato é `mailto:lemamon.dev@gmail.com` (`src/components/Contact/index.tsx:24` e `src/components/Footer/index.tsx:59`). Um **Gmail**, não um e-mail no domínio próprio. Não há CNPJ, não há foto de equipe, não há tamanho de time. Para um gestor de PME avaliando um fornecedor de R$40–150k, isso é sinal de risco.

### 1.2 Problemas estruturais concretos

**a) A rota `/projects` mente sobre o que entrega.**
O CTA principal do hero é "Conheça Mais" apontando para `/projects` (`translation.json` → `introContent.button[0].path`). Quem clica em "Conheça Mais" na landing de uma agência espera **portfólio**. O que recebe é um wizard de briefing de 4 telas (`src/pages/Projects/index.tsx` → `ProjectBuilder`). A página abre com `"🌟 Bem-vindo à Área de Projetos! 🚀"` — emoji em `<h1>`, tom infantilizado para um comprador B2B. Isto é a quebra de expectativa mais cara do site: o visitante em modo de avaliação é jogado direto em modo de formulário.

**b) O ProjectBuilder pede tudo e devolve nada.**
`src/pages/Projects/data.json` define 4 perguntas obrigatórias (serviço → tipo de projeto → segmento → adicionais), com até 8 opções cada. O visitante navega 4 telas, preenche nome/e-mail/telefone/descrição em `ContactForm`, e a recompensa é `contactForm.successSubTitle`: **"Em breve nossa equipe entrará em contato."** Zero reciprocidade. Nenhuma faixa de preço estimada, nenhum prazo, nenhum PDF, nenhum "seu projeto se parece com o case X". A troca é assimétrica e o abandono no meio do funil deve ser alto.

**c) O lead que chega não é qualificado.**
`src/service/index.ts` define `EmailData` com `{ email, phone, description, name, optionsSummaryText }`. Não há: **orçamento**, **prazo desejado**, **nome da empresa**, **cargo**, **origem/UTM**. O comercial recebe um e-mail sem saber se é um estudante curioso ou um head de produto com R$200k aprovados. Sem campo de orçamento, todo lead custa a mesma hora de reunião.

**d) O blog é falso e isso é visível.**
`src/data/posts.ts` tem 3 posts assinados por **"João Silva"**, **"Maria Santos"** e **"Pedro Oliveira"** — nomes-placeholder óbvios —, datados de jan/2024, com títulos genéricos ("Introdução ao JavaScript Moderno", "Dicas de CSS Grid"). Um deles referencia `https://exemplo.com/videos/css-grid-tutorial.mp4` (link morto, `posts.ts:96`). O Footer linka `/blog` publicamente (`src/components/Footer/index.tsx:67`). Um comprador que abre isso conclui, corretamente, que o site é um template não finalizado. **Isto destrói mais confiança do que a ausência de blog.**

**e) Links mortos no Footer.**
`src/components/Footer/index.tsx:66-69`: `Press` → `/`, `Careers & Culture` → `/`, `About` → `/`. Uma empresa sem assessoria de imprensa anunciando uma seção "Imprensa" que não existe.

**f) Dois bugs que quebram a conversão.**

- `src/components/Header/index.tsx:28-34` — `scrollTo(id)` faz `document.getElementById(id).scrollIntoView()`. Fora da Home (em `/projects`, `/blog`, `/post/:id`) o elemento não existe e a chamada lança `TypeError`. **O botão "Contato" do header não funciona em 3 das 4 rotas do site.**
- `src/components/ContactForm/index.tsx:60-66` — na tela de sucesso, os botões "Criar outro projeto" e "Voltar ao início" **não têm `onClick`**. O usuário que acabou de converter fica num beco sem saída.

**g) SEO e compartilhamento quebrados.**
Em `index.html`: `<html lang="en">` num site em português; `og:locale` = `"en_EN"` (locale inválido — nem existe); `<meta name="keywords">` é uma **cópia literal** da description (parágrafo inteiro, não keywords); **não há `og:image`** — link colado no WhatsApp ou LinkedIn aparece sem thumbnail, o que reduz clique drasticamente no canal que mais importa aqui. Não há `sitemap.xml` em `public/` (só `robots.txt` genérico). E como é SPA em GitHub Pages sem SSR/prerender, todas as rotas compartilham a mesma meta description.

**h) Mensuração cega.**
`gtag_report_conversion` só é chamado dentro de `sendEmail` (`src/service/index.ts:31-36`) — ou seja, **só o envio do wizard é medido**. Os dois `mailto:` (Contact e Footer), que provavelmente são o canal real de contato, não disparam evento nenhum. Não há evento de scroll, de início do wizard, de abandono por etapa, de clique em CTA. Com Google Ads rodando, isso significa otimizar campanha às cegas.

**i) Três idiomas sem cliente em três idiomas.**
`src/locales/{pt-BR,en,es}/translation.json` triplicam o custo de qualquer mudança de copy. O seletor de idioma fica escondido **no rodapé** (`Footer/index.tsx:77-102`). Pior: `src/translation.ts` define `fallbackLng: "en"` — um visitante brasileiro cuja detecção falhe cai em inglês. Não há nenhum sinal no negócio de que EUA ou LatAm sejam ICP.

**j) Endereço subaproveitado.**
"Florianópolis, SC - Brasil" (`Footer/index.tsx:73`) é o único ativo local do site e está enterrado no rodapé, sem Google Business Profile, sem página local, sem uso em SEO ("desenvolvimento de software Florianópolis" é busca de cauda longa com intenção comercial e baixa concorrência).

### 1.3 O que a landing page **deveria** comunicar

Em ordem de prioridade, para um comprador brasileiro de PME com ciclo curto:

1. **Especificidade**: o que a Lemamon faz melhor que o vizinho, dito em uma frase verificável. Não "soluções tecnológicas personalizadas", mas algo do tipo "Construímos e colocamos no ar o MVP do seu produto digital em 8 a 12 semanas — time sênior, contrato fechado, código seu."
2. **Prova**: 3–5 cases com nome do cliente, problema, o que foi construído, resultado numérico e prazo.
3. **Faixa de preço e modelo de contratação**: "projetos a partir de R$X" ou "squad dedicado a partir de R$Y/mês". Filtrar quem não pode pagar é ganho, não perda.
4. **Processo**: como trabalha — descoberta, sprints, quem participa das reuniões, o que o cliente precisa fazer.
5. **Fricção zero para falar com gente**: WhatsApp visível e persistente, e-mail no domínio próprio, agendamento direto.

---

## 2. Personas / ICP

### Persona 1 — Rafael, fundador de startup em pré-seed/seed (ICP primário)

- **Perfil**: 28–40 anos, sócio não-técnico ou técnico sobrecarregado, 2–8 pessoas na empresa. Ticket alvo: R$60k–180k por projeto, ou squad de R$25k–45k/mês.
- **Job**: tirar o produto da cabeça/Figma e colocar usuários pagantes dentro dele antes do dinheiro acabar.
- **Dores**: já tentou com freelancer e o código virou refém de uma pessoa; não sabe estimar escopo; tem prazo de captação ou de piloto com cliente-âncora.
- **Objeções**: "vocês vão sumir no meio?", "quem é o dev sênior que vai tocar isso, ou vão colocar júnior?", "o código é meu no fim?", "e se eu precisar mudar o escopo na metade?"
- **Gatilhos de decisão**: ver um MVP real que a agência colocou no ar (com link clicável); prazo curto e explícito; contrato com propriedade intelectual clara; conversa com o técnico da agência (não com vendedor) na primeira call.
- **Comportamento**: pesquisa no Google e pede indicação no LinkedIn/grupos. Decide em 1–3 semanas. **Fecha por WhatsApp.**

### Persona 2 — Cláudia, sócia/diretora de PME tradicional (ICP secundário, maior volume)

- **Perfil**: 38–55 anos, empresa de 20–200 funcionários (distribuidora, clínica, escola, indústria, imobiliária). Não é de tecnologia. Ticket: R$30k–120k.
- **Job**: parar de perder dinheiro com processo em planilha/WhatsApp — quer um sistema interno, um portal para clientes, ou integração entre o ERP e o e-commerce.
- **Dores**: já foi queimada por fornecedor que entregou pela metade e sumiu; não consegue avaliar tecnicamente a proposta; tem medo de ficar dependente do fornecedor.
- **Objeções**: "quanto custa?" (primeira e principal), "vocês têm CNPJ e emitem NF?", "quem dá suporte depois que entrega?", "vocês já fizeram para o meu setor?"
- **Gatilhos de decisão**: **case do mesmo segmento**; preço com faixa clara antes da reunião; contrato de manutenção/suporte definido; alguém que atenda no WhatsApp no mesmo dia; presença física/local (Florianópolis conta).
- **Comportamento**: busca no Google ("sistema de gestão sob medida", "desenvolvimento de aplicativo para empresa"), abre 3 sites, pede orçamento nos 3. **Quem responde primeiro leva.** Ciclo: 2–6 semanas.

### Persona 3 — Marcos, head de produto/tech lead em empresa média (ICP de maior ticket, menor volume)

- **Perfil**: 32–45 anos, empresa de 100–800 pessoas com time interno de tecnologia. Contrata para **ampliar capacidade**, não para substituí-la. Ticket: squad de R$50k–150k/mês, contratos de 6–18 meses.
- **Job**: entregar o roadmap do trimestre sem esperar 4 meses de headcount aprovado e recrutamento.
- **Dores**: alocação de body shop que não entrega; onboarding lento; precisa de gente que se integre ao processo dele (o Jira dele, o CI dele, o code review dele).
- **Objeções**: "qual a senioridade real?", "vocês seguem meu processo ou o de vocês?", "posso entrevistar as pessoas antes?", "como funciona o off-boarding e a transferência de conhecimento?"
- **Gatilhos de decisão**: prova técnica (repositório público, artigo técnico de verdade, contribuição open-source); descrição do processo de engenharia (testes, CI/CD, code review); flexibilidade contratual; NDA e questionário de segurança respondidos rápido.
- **Comportamento**: pesquisa no LinkedIn e no GitHub antes de falar. **Este é o único perfil para quem um blog técnico de verdade converte.** Ciclo: 1–3 meses.

**Priorização de ICP:** Cláudia gera volume e caixa (ciclo curto, decisão por preço+prova), Rafael gera projetos interessantes e referência, Marcos gera receita recorrente. A landing page deve ser otimizada **para Cláudia e Rafael na Home** e ter uma trilha separada (página de squad/alocação + conteúdo técnico) para Marcos.

---

## 3. Jobs to be done e jornada do visitante

### JTBDs em jogo

| # | Job (na voz do cliente) | O que o site precisa entregar |
|---|---|---|
| J1 | "Preciso saber se essa empresa é séria antes de gastar meu tempo numa reunião." | Cases com nome, prova social, CNPJ, rosto de gente, canal de contato humano. |
| J2 | "Preciso saber se cabe no meu orçamento antes de pedir proposta." | Faixas de investimento por tipo de projeto, modelos de contratação. |
| J3 | "Preciso saber se eles já resolveram um problema como o meu." | Cases filtráveis por segmento e por tipo de solução. |
| J4 | "Preciso descrever o que quero sem saber falar de tecnologia." | O ProjectBuilder — que hoje existe e resolve isso bem, mas está no lugar errado do funil. |
| J5 | "Preciso falar com alguém agora, não depois de amanhã." | WhatsApp fixo + agendamento direto. |
| J6 | "Preciso justificar essa contratação para meu sócio/chefe." | Página de case exportável, proposta com escopo e prazo, materiais compartilháveis. |

### Jornada proposta (do primeiro clique ao lead qualificado)

```
[Google Ads / busca orgânica / indicação / LinkedIn]
        │
        ▼
1. HOME  ─────────────────────────────────────────────────────
   Hero específico (o que fazemos, para quem, em quanto tempo)
   + logos/nomes de clientes acima da dobra
   + 3 cases em destaque com resultado numérico
   + como trabalhamos (4 passos)
   + faixas de investimento
   + prova social (depoimentos com nome, cargo, empresa)
   CTAs paralelos: [Falar no WhatsApp] [Ver cases] [Montar meu projeto]
        │
        ├──── J1/J3 não resolvido ──► 2. CASES (/cases) ──► 2b. CASE (/cases/:slug)
        │                                                      CTA: "Quero algo parecido"
        │                                                      (pré-preenche o briefing)
        │
        ├──── J2 não resolvido ─────► 3. SERVIÇOS (/servicos/:slug)
        │                              escopo, prazo típico, faixa de preço, FAQ
        │
        ├──── J1 pendente ──────────► 4. SOBRE (/sobre)
        │                              time com rosto e nome, CNPJ, como trabalhamos
        │
        └──── pronto para agir ─────► 5. BRIEFING (/briefing)  ← ProjectBuilder reposicionado
                                        │
                                        ▼
                              6. RESULTADO IMEDIATO
                                 estimativa de faixa + prazo + cases similares
                                 (reciprocidade — hoje inexistente)
                                        │
                                        ▼
                              7. AGENDAMENTO / WHATSAPP
                                 lead qualificado no CRM + notificação
```

**Regra de projeto derivada da jornada:** o visitante deve conseguir chegar em WhatsApp **de qualquer ponto do site, em 1 clique**, sem passar pelo wizard. Hoje o único caminho de contato rápido é um `mailto:` para Gmail, e o wizard é a única rota "oficial".

---

## 4. Mapa de páginas e seções proposto

### 4.1 Rotas

Arquivo a alterar: `src/router/config.ts` (hoje: `/`, `/projects`, `/blog`, `/post/:id`).

| Rota | Existe? | Objetivo | Conteúdo mínimo | CTA primário | CTA secundário |
|---|---|---|---|---|---|
| `/` | sim | Qualificar e direcionar em 30s | Hero específico, prova social acima da dobra, 3 cases, como trabalhamos, faixas de preço, depoimentos, FAQ | **Falar no WhatsApp** | Ver cases |
| `/cases` | **criar** | Provar competência por segmento | Grid filtrável por segmento e tipo (reaproveitar taxonomia de `src/pages/Projects/data.json`) | Ver case | Montar meu projeto |
| `/cases/:slug` | **criar** | Converter quem já confia | Problema → solução → stack → resultado numérico → prazo → depoimento do cliente | **Quero algo parecido** (leva a `/briefing?ref=slug`) | WhatsApp |
| `/servicos/:slug` | **criar** (3–5 páginas) | Capturar busca orgânica de cauda longa e responder J2 | Uma página por serviço: app, sistema web/dashboard, e-commerce, squad dedicado, IA/automação. Cada uma: o que entra, prazo típico, **faixa de investimento**, FAQ, 2 cases relacionados | Pedir orçamento | WhatsApp |
| `/sobre` | **criar** | Matar a objeção "isso é freelancer?" | Time com foto/nome/LinkedIn, história, CNPJ, endereço, valores em forma de **política de trabalho** (não de slogan) | Falar com o time | Ver cases |
| `/briefing` | **renomear** `/projects` | Transformar interesse em lead qualificado | ProjectBuilder + campos de qualificação + tela de resultado | Enviar e ver estimativa | — |
| `/blog` + `/post/:id` | **despublicar** | — | ver 4.3 | — | — |
| `/obrigado` | **criar** | Fechar o loop e medir conversão | Confirmação, prazo de resposta explícito ("respondemos em até 4h úteis"), link de WhatsApp, materiais | Falar no WhatsApp agora | — |

Manter `/projects` como redirect 301-equivalente para `/briefing` para não quebrar links de campanha existentes.

### 4.2 Seções da Home — reordenação

Ordem atual em `src/pages/Home/index.tsx`: `intro` → `middleBlock` → `about` → `mission` → `product` → `contact`.

Ordem proposta:

1. **Hero** (`introContent`) — reescrever para dizer o que se faz, para quem e em quanto tempo. Dois CTAs: WhatsApp (primário) e "Ver cases" (secundário). Hoje os dois CTAs são "Conheça Mais" → `/projects` e "Fale Conosco" → âncora; ambos vagos.
2. **Barra de prova social** — nova seção, logo abaixo do hero: logos ou nomes de clientes + 1–2 números ("14 produtos no ar", "R$X transacionados nas plataformas que construímos").
3. **Cases em destaque** — nova seção: 3 cards com resultado, linkando `/cases/:slug`.
4. **Serviços** (`productContent`) — quebrar o parágrafo único em 4–5 cards linkando `/servicos/:slug`.
5. **Como trabalhamos** — nova seção: 4 passos com prazo em cada um. Isto é o que substitui `missionContent` e `aboutContent` com informação real.
6. **Investimento** — nova seção: faixas por tipo de projeto e modelos de contratação (projeto fechado vs. squad).
7. **Depoimentos** — nova seção: 2–3 com nome, cargo, empresa e foto.
8. **FAQ** — nova seção: as objeções da seção 2 respondidas literalmente (código é meu? NF? suporte depois? mudança de escopo?). Gera rich snippet no Google.
9. **Contato** (`contactContent`) — substituir o `mailto:` de `src/components/Contact/index.tsx:24` por WhatsApp + formulário curto + e-mail no domínio próprio.

**Cortar:** `missionContent` inteiro (bloco `mission` da Home) e `aboutContent.section` ("Inovação Constante" / "Atendimento Personalizado"). Se houver apego institucional, movê-los para `/sobre` — não ocupam espaço na página de conversão.

**Botão flutuante de WhatsApp** persistente em todas as rotas (componente novo, montado no layout junto com `Header`/`Footer` em `src/router/index.tsx`).

### 4.3 O que fazer com o Blog falso

**Decisão: despublicar agora, republicar só com conteúdo real.**

Onda 1 (imediato):
- Remover o link `<Large to="/blog">{t("Blog")}</Large>` de `src/components/Footer/index.tsx:67`.
- Remover as rotas `/blog` e `/post/:id` de `src/router/config.ts`.
- Zerar `src/data/posts.ts` (manter o array vazio e os tipos em `src/types/index.ts` — a infraestrutura de renderização em `src/pages/Post/index.tsx` é boa e suporta code, callout, tabela, checklist; é ativo reaproveitável).

Onda 3 (quando houver conteúdo): republicar como **`/insights`** com 4–6 artigos de verdade, escritos pelo time, com autoria real (nome, foto, LinkedIn). Pauta orientada ao ICP, não a tutorial genérico:
- "Quanto custa desenvolver um aplicativo no Brasil em 2026 — faixas reais por tipo de projeto" (capta Cláudia e Rafael no fundo do funil)
- "Contrato de desenvolvimento: os 6 pontos que você precisa negociar" (mata objeção)
- "MVP em 10 semanas: o que entra e o que fica de fora" (mata objeção de escopo)
- 1–2 artigos técnicos de profundidade real para Marcos

Regra: **nenhum post placeholder volta ao ar.** É melhor ter zero posts do que "João Silva" escrevendo sobre CSS Grid.

### 4.4 O que fazer com o ProjectBuilder

O ProjectBuilder (`src/components/ProjectBuilder/index.tsx` + `src/pages/Projects/data.json`) é o **melhor ativo do site** e está mal posicionado. Ele resolve J4 (o cliente não sabe descrever o que quer) melhor que qualquer formulário de contato. O problema não é o wizard, é o contexto e a recompensa.

Mudanças propostas:

1. **Reposicionar**: sai de "Conheça Mais" no hero e vira CTA secundário, em `/briefing`. O CTA primário do site passa a ser WhatsApp. Quem chega por Ads de fundo de funil vai direto para `/briefing`.
2. **Reduzir fricção de entrada**: hoje `handleNext` (linha 38-51) bloqueia o avanço se nada estiver selecionado, e a barra de progresso não existe. Adicionar indicador "Etapa 2 de 5 — 40 segundos restantes" e permitir "não sei ainda" como opção válida em cada etapa. "Não sei" é a resposta honesta de Cláudia na pergunta "UX/UI, Front-end, Back-end ou Solução Completa?" — pergunta que, aliás, exige vocabulário técnico que ela não tem (`translation.json` → `b47f2h6r`). **Reescrever a primeira pergunta em linguagem de negócio.**
3. **Adicionar qualificação**: duas etapas novas antes do formulário final —
   - **Orçamento** (faixas: até R$30k / R$30–80k / R$80–200k / acima de R$200k / não sei)
   - **Prazo** (o quanto antes / 1–3 meses / 3–6 meses / só pesquisando)
   Mais um campo "empresa/site" no `ContactForm`. Estes três campos são o que separa lead de curioso.
4. **Dar reciprocidade**: nova tela de resultado antes/junto do sucesso, com (a) faixa estimada de investimento e prazo calculados a partir das seleções, (b) 2 cases similares, (c) próximo passo com botão de WhatsApp e link de agendamento. Isto é a mudança de maior impacto no wizard.
5. **Salvar parcial**: capturar e-mail na etapa 2, não só no fim. Hoje quem abandona na etapa 3 some sem deixar rastro.
6. **Corrigir os bugs**: `onClick` ausente nos botões de sucesso (`ContactForm/index.tsx:60-66`); `scrollTo` quebrado fora da Home (`Header/index.tsx:28-34`).
7. **Enriquecer o payload**: `EmailData` em `src/service/index.ts` precisa carregar `budget`, `timeline`, `company`, `utm_source/medium/campaign`, `referrer` e `page_path`. E o destino precisa deixar de ser só e-mail — ver seção 5.

---

## 5. Funil e métricas

### 5.1 Definição de lead qualificado (MQL)

Um lead conta como qualificado quando satisfaz **todas** as condições:

- Identificação verificável: nome + e-mail **corporativo ou com empresa/site informado** + telefone com DDD válido
- Orçamento declarado ≥ R$30k **ou** modelo de squad
- Prazo declarado ≤ 6 meses ("só pesquisando" não é MQL)
- Escopo minimamente descrito (as seleções do wizard **ou** um `description` com ≥ 100 caracteres)

Leads que não passam viram **lead frio** — entram numa lista de nutrição, não na fila de reunião do comercial. Isso protege o recurso mais escasso da agência, que é a hora de quem vende.

### 5.2 Eventos a instrumentar (GA4)

Hoje existe **um único** evento efetivo, disparado em `src/service/index.ts:31-36`. Proposta de camada de eventos — criar `src/lib/analytics.ts` como wrapper único (`track(event, params)`) e substituir a chamada direta a `window.gtag_report_conversion` por ele.

| Evento | Onde disparar | Por que importa |
|---|---|---|
| `page_view` (com `page_path` correto) | `src/router/index.tsx`, no listener de rota | SPA não dispara page_view em navegação — hoje todo o tráfego interno é invisível |
| `hero_cta_click` (param: `whatsapp` \| `cases` \| `briefing`) | Hero da Home | Diz qual promessa está funcionando |
| `whatsapp_click` (param: `origin`) | Botão flutuante, hero, contato, cases | **Métrica-chave. Hoje 100% invisível.** |
| `email_click` | Todos os `mailto:` (`Contact/index.tsx:24`, `Footer/index.tsx:59`) | Idem |
| `case_view` (param: `slug`) | `/cases/:slug` | Mostra qual segmento atrai |
| `pricing_view` | Seção de investimento (intersection observer) | Correlaciona com qualidade do lead |
| `briefing_start` | Primeiro clique em `ProjectBuilder` | Denominador do funil do wizard |
| `briefing_step` (param: `step`, `answers`) | `handleNext` em `ProjectBuilder/index.tsx:38` | **Identifica em qual pergunta as pessoas desistem** |
| `briefing_abandon` | `beforeunload` com wizard iniciado e não enviado | Quantifica a perda |
| `lead_submit` (params: `budget`, `timeline`, `services`) | `handleSubmit`, `ProjectBuilder/index.tsx:68` | Substitui a conversão atual, agora segmentável |
| `lead_qualified` | Server-side, após aplicar as regras de 5.1 | **Esta é a conversão que deve alimentar o Google Ads**, não `lead_submit` |
| `schedule_click` | Botão de agendamento | Mede intenção máxima |

Configurar `lead_qualified` (não `lead_submit`) como conversão primária no Google Ads. Otimizar campanha para volume bruto de formulário é o erro mais comum e mais caro.

### 5.3 Funil-alvo

Baseline estimado (o site não tem dados confiáveis hoje — instrumentar primeiro, depois validar):

| Etapa | Hoje (estimado) | Meta 90 dias | Meta 180 dias |
|---|---|---|---|
| Sessões/mês | 800 | 1.200 | 2.500 |
| Visualiza case ou serviço | — (não existe) | 25% | 35% |
| Contato iniciado (WhatsApp + briefing + e-mail) | ~1,5% | 4% | 6% |
| Lead submetido | ~0,8% | 2,5% | 4% |
| **Lead qualificado (MQL)** | não medido | **1,2%** (≈14/mês) | **2%** (≈50/mês) |
| MQL → reunião realizada | — | 60% | 70% |
| Reunião → proposta | — | 70% | 75% |
| Proposta → fechamento | — | 25% | 30% |
| **Clientes novos/mês** | — | ~1,5 | ~7 |

Metas operacionais adicionais:
- **Tempo de primeira resposta ≤ 4h úteis** (para Cláudia, quem responde primeiro leva — é a métrica de maior alavancagem e não depende de código).
- **% de leads que chegam por WhatsApp**: expectativa de 40–60% do total uma vez que o canal esteja visível. Se ficar abaixo, o botão está mal posicionado.
- **Taxa de conclusão do wizard** (`briefing_start` → `lead_submit`): alvo ≥ 45%. Abaixo de 30% significa que ainda há fricção demais nas 4 etapas.

---

## 6. Priorização (RICE, em 3 ondas)

Fórmula: `RICE = (Reach × Impact × Confidence) / Effort`.
Reach = visitantes/mês impactados. Impact = 0,25 (mínimo) a 3 (massivo). Confidence = 0–1. Effort = pessoa-semana.

### Onda 1 — Quick wins (2–3 semanas, sem redesign)

| # | Iniciativa | Arquivos | R | I | C | E | RICE |
|---|---|---|---|---|---|---|---|
| 1.1 | Botão flutuante de WhatsApp em todas as rotas + link no hero e contato | novo componente + `src/router/index.tsx`, `src/components/Contact/index.tsx` | 800 | 3,0 | 0,9 | 0,5 | **4.320** |
| 1.2 | Corrigir bugs de conversão: `onClick` ausente na tela de sucesso e `scrollTo` quebrado fora da Home | `ContactForm/index.tsx:60-66`, `Header/index.tsx:28-34` | 300 | 2,0 | 1,0 | 0,3 | **2.000** |
| 1.3 | Reescrever hero + cortar `missionContent` e `aboutContent.section` | `src/locales/pt-BR/translation.json`, `src/pages/Home/index.tsx` | 800 | 2,0 | 0,7 | 0,7 | **1.600** |
| 1.4 | Despublicar blog falso (remover rotas, link do footer, zerar `posts.ts`) | `src/router/config.ts`, `Footer/index.tsx:67`, `src/data/posts.ts` | 150 | 2,5 | 1,0 | 0,2 | **1.875** |
| 1.5 | Campos de qualificação no briefing: orçamento, prazo, empresa | `ProjectBuilder/index.tsx`, `ContactForm/index.tsx`, `src/service/index.ts` | 120 | 3,0 | 0,9 | 0,8 | **405** |
| 1.6 | Camada de analytics + eventos-chave (whatsapp_click, briefing_step, lead_submit) | novo `src/lib/analytics.ts`, `src/service/index.ts` | 800 | 1,5 | 0,8 | 1,0 | **960** |
| 1.7 | Corrigir meta tags: `lang="pt-BR"`, `og:locale`, `og:image`, remover keywords duplicada, adicionar `sitemap.xml` | `index.html`, `public/` | 400 | 1,5 | 0,8 | 0,4 | **1.200** |
| 1.8 | Remover links mortos do footer (Press, Careers) e trocar Gmail por e-mail do domínio | `Footer/index.tsx:66-69,59`, `Contact/index.tsx:24` | 300 | 1,0 | 1,0 | 0,2 | **1.500** |
| 1.9 | Seção de prova social provisória na Home (nomes/logos de clientes + 2 depoimentos) | `translation.json` + nova seção em `Home/index.tsx` | 800 | 2,5 | 0,8 | 1,0 | **1.600** |

**Total onda 1: ~5 pessoa-semana.** Ordem de execução por RICE: 1.1 → 1.2 → 1.4 → 1.9 → 1.3 → 1.8 → 1.7 → 1.6 → 1.5.

### Onda 2 — Estrutural (4–8 semanas)

| # | Iniciativa | Arquivos | R | I | C | E | RICE |
|---|---|---|---|---|---|---|---|
| 2.1 | Página `/cases` + `/cases/:slug` com 4–6 cases reais (inclui produção do conteúdo com os clientes) | `src/router/config.ts`, `src/pages/Cases/`, `src/data/cases.ts` | 500 | 3,0 | 0,9 | 3,0 | **450** |
| 2.2 | Seção de investimento/faixas de preço na Home + em cada serviço | `translation.json`, `Home/index.tsx` | 700 | 2,5 | 0,7 | 1,2 | **1.020** |
| 2.3 | Páginas `/servicos/:slug` (4–5 páginas com faixa, prazo, FAQ) | `src/pages/Servicos/` | 350 | 2,0 | 0,7 | 2,5 | **196** |
| 2.4 | Reposicionar `/projects` → `/briefing` + tela de resultado com estimativa e cases similares | `ProjectBuilder/index.tsx`, `src/pages/Projects/`, `router/config.ts` | 200 | 3,0 | 0,7 | 2,0 | **210** |
| 2.5 | Seção "Como trabalhamos" (4 passos com prazos) + FAQ com schema.org | `Home/index.tsx`, `translation.json` | 700 | 1,5 | 0,8 | 1,0 | **840** |
| 2.6 | Página `/sobre` com time real, CNPJ, endereço | `src/pages/Sobre/` | 250 | 1,5 | 0,8 | 1,0 | **300** |
| 2.7 | Roteamento de lead: webhook → CRM/planilha + notificação em WhatsApp/Slack para o comercial, com scoring de MQL | backend do serviço de e-mail + `src/service/index.ts` | 120 | 2,5 | 0,9 | 1,5 | **180** |
| 2.8 | Prerender/SSG das rotas estáticas (vite-plugin-ssg ou similar) para SEO e preview de link | build config | 400 | 2,0 | 0,6 | 2,0 | **240** |
| 2.9 | Descontinuar `en` e `es` (ou reduzir a uma landing única em inglês) | `src/locales/`, `src/translation.ts` (trocar `fallbackLng` para `pt`) | 800 | 0,5 | 0,8 | 0,5 | **640** |

**Total onda 2: ~15 pessoa-semana.** Sequência recomendada: 2.2 → 2.5 → 2.1 → 2.9 → 2.4 → 2.8 → 2.6 → 2.7 → 2.3.

Observação sobre 2.1: o RICE de 450 subestima o item. Cases são a **precondição** de quase todo o resto (a Home, o briefing e as páginas de serviço todos linkam para eles) e é o item de maior lead time, porque depende de conseguir autorização dos clientes. **Começar a produção de conteúdo na semana 1 da onda 1**, em paralelo, mesmo que a página só suba na onda 2.

### Onda 3 — Avançado (3–6 meses)

| # | Iniciativa | R | I | C | E | RICE |
|---|---|---|---|---|---|---|
| 3.1 | Agendamento direto na página (Cal.com/Calendly embutido) com qualificação prévia | 150 | 2,0 | 0,7 | 1,0 | **210** |
| 3.2 | Calculadora pública de estimativa (evolução do briefing: entra escopo, sai faixa + prazo, sem precisar enviar) | 400 | 2,0 | 0,5 | 3,0 | **133** |
| 3.3 | `/insights` — blog real, 6 artigos de fundo de funil + 2 técnicos | 300 | 1,5 | 0,6 | 4,0 | **68** |
| 3.4 | Landing pages por segmento para Ads (`/para/clinicas`, `/para/e-commerce`) | 300 | 2,0 | 0,6 | 2,5 | **144** |
| 3.5 | Testes A/B de hero e de CTA primário (WhatsApp vs. briefing) | 1.500 | 1,0 | 0,6 | 1,5 | **600** |
| 3.6 | Sequência de nutrição por e-mail/WhatsApp para leads frios | 100 | 1,5 | 0,6 | 2,0 | **45** |
| 3.7 | Google Business Profile + SEO local Florianópolis | 200 | 1,5 | 0,7 | 1,0 | **210** |

Onda 3 só faz sentido depois que a onda 2 estiver medida por pelo menos 60 dias. 3.5 tem RICE alto mas **exige volume**: só rodar A/B com ≥1.500 sessões/mês, caso contrário o teste não atinge significância e vira decisão por ruído.

---

## 7. Resumo executivo da estratégia

O site hoje é um template institucional bem construído tecnicamente e vazio comercialmente. Ele fala de "transformação digital", "inovação constante" e "nossa missão" para um comprador que quer saber **quanto custa, quanto demora, e quem já confiou em vocês** — três perguntas que o site não responde em lugar nenhum.

A tese de melhoria tem três movimentos:

1. **Provar** — substituir slogan por case, depoimento e número. É a mudança de maior impacto e a que mais depende de trabalho fora do código (conseguir autorização dos clientes).
2. **Precificar** — publicar faixas de investimento. Filtra quem não pode pagar, aumenta a qualidade da reunião e responde a objeção número um da persona de maior volume.
3. **Facilitar** — WhatsApp em 1 clique de qualquer página, e o wizard reposicionado como caminho alternativo com recompensa imediata, não como pedágio obrigatório.

O ProjectBuilder é ativo, não passivo: preserve-o, mova-o para `/briefing`, adicione qualificação (orçamento/prazo/empresa) e devolva algo ao usuário no final. O blog falso é passivo puro: despublique hoje.
