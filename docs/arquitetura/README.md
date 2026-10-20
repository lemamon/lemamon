# Plano de Arquitetura — lemamon.dev

**Objetivo de negócio:** mostrar quem é a Lemamon, como ela trabalha, e converter mais visitantes em clientes.

**Data da análise:** 31/07/2026 · **Base:** commit `8b36ba2` + working tree
**Método:** sete análises independentes (produto, UX, UI, técnica, conteúdo, marketing, negócio) sobre leitura direta do código, build de produção executado localmente e sondagem da produção real.
**Status em 20/10/2026 — praça:** a praça da Lemamon mudou de Florianópolis, SC, para São Paulo, SP (D38 em [`docs/playbooks/15-registro-de-decisoes.md`](../playbooks/15-registro-de-decisoes.md)). O [BLUEPRINT](BLUEPRINT.md) e o [COPY](COPY.md) já refletem São Paulo (BLUEPRINT §15.5, linha 13). Só as análises 01–07 (e o [BACKLOG](BACKLOG.md), registro dos achados) mantêm Florianópolis como análise histórica e não serão reescritas; a fonte de verdade da cidade é o i18n (`src/i18n/{pt,en,es}.json`), com o JSON-LD em `ADDRESS` de `src/config/site.ts`.

**Status em 20/10/2026 — validação final:** a migração para Astro e as 3 rodadas de correção estão concluídas no código. Dos 387 itens do backlog, 376 têm veredito final: 234 resolvidos, 68 cobertos por playbook, 37 aguardando dado do dono, 28 fora de escopo por decisão e 9 parcialmente resolvidos, e nenhum ficou sem tratamento (os outros 11 eram premissa inválida). O painel de copy aprovou Conversão e Estrutura; Home, Método e Serviços ficaram em 5 ou 6 de 9 porque as personas pedem prova que só o dono pode dar (uma pessoa com nome, perfis com conteúdo, e-mail no domínio, resposta sobre a propriedade do código, cases). **O site novo ainda não está no ar:** o build de produção espera os 9 campos de `dados/dono.json › privacidade`, e o código está sem commit. Até o deploy, `lemamon.dev` continua com o app antigo, que perde os leads do formulário. A tabela por item, o que depende do dono e o caminho até o lançamento estão em [VALIDACAO.md](VALIDACAO.md).

Este documento é o **sumário de decisão**. Ele consolida as sete seções, resolve as contradições entre elas e define uma única ordem de execução. As seções completas estão indexadas no fim.

---

## 1. A conclusão em um parágrafo

O site é um template institucional tecnicamente competente e comercialmente vazio. Ele fala de "transformação digital" e "inovação constante" para um comprador que quer saber **quanto custa, quanto demora e quem já confiou**. Nenhuma das três perguntas é respondida em lugar nenhum do repositório. Mas isso é o segundo problema. O primeiro é que **o funil de captação está quebrado há tempo indeterminado**: o backend que recebe os leads foi deletado, e 100% de quem preenche o formulário hoje vê uma mensagem de erro e vai embora. Antes de discutir posicionamento, framework ou design system, é preciso parar de perder o lead que já chega.

---

## 2. Fatos verificados

Três premissas que circulavam sobre o projeto estavam erradas. Foram checadas contra a produção real e o resultado muda a priorização inteira.

| Premissa anterior | Realidade verificada | Consequência |
|---|---|---|
| Deploy é GitHub Pages | **É Netlify** (`server: Netlify` em `curl -sI https://lemamon.dev/projects` → 200) | `public/_redirects` está correto e funcionando. O SPA fallback **não** está quebrado. |
| `_redirects` Netlify em host errado | Host é Netlify. Arquivo correto. | Não é bug. Sai da lista. |
| `dist/` versionado no repo | `git ls-files dist` → 0 registros. Está em `.gitignore:13` | Sujeira de máquina local, não dívida técnica. |

E o pipeline em `.github/workflows/pipeline.yaml` publica no GitHub Pages, que retorna **404**. É um pipeline fantasma: a CI versionada deploya para lugar nenhum, e o deploy que serve o cliente real está configurado na UI do Netlify, fora do versionamento, sem `netlify.toml`. Não existe fonte de verdade de build no repositório.

---

## 3. Os cinco problemas que estão custando cliente hoje

Ordenados por dinheiro perdido, não por elegância técnica.

### P0-1 · O backend de leads não existe mais

```
$ curl -i -X OPTIONS https://lemamon-email-service-eac435b5f8e8.herokuapp.com/send-email
HTTP/1.1 404 Not Found
Server: heroku-router
<title>No such app</title>
```

`No such app` não é dyno dormindo. É a aplicação ter sido deletada. Todo lead que completa o wizard em `/projects` recebe a tela de erro de [`ContactForm/index.tsx:71`](../../src/components/ContactForm/index.tsx) e sai. O `catch` em [`service/index.ts`](../../src/service/index.ts) apenas faz `console.error` — ninguém foi notificado quando isso caiu.

**É a definição de dinheiro no chão.** Correção imediata (30 min): trocar o `Result` de erro por fallback de WhatsApp com o resumo do projeto pré-preenchido na URL. Correção definitiva: Netlify Forms (a plataforma já é paga e já resolve isso — manter o Heroku era a causa raiz).

### P0-2 · O build está quebrado na working tree

```
src/service/index.ts(33,7): error TS2591: Cannot find name 'process'.
```

A alteração **não commitada** em [`service/index.ts:33`](../../src/service/index.ts) usa `process.env.NODE_ENV`, e [`tsconfig.json:18`](../../tsconfig.json) restringe `types` sem incluir `node`. No `HEAD` o build passa; **assim que esse commit entrar, a CI cai**. Em Vite o certo é `import.meta.env.PROD`.

### P0-3 · Zero preview social

Não existe `og:image`, `twitter:card` nem `twitter:image` em [`index.html`](../../index.html). Todo link de lemamon.dev colado em WhatsApp, LinkedIn ou Slack renderiza como texto cinza sem imagem. Para uma empresa cujo canal nº 1 é indicação e prospecção 1-a-1, isso corta a taxa de clique do link compartilhado pela metade ou mais. **É a maior relação retorno/hora do documento inteiro.**

Ainda no mesmo arquivo: `<html lang="en">` com conteúdo 100% pt-BR, `og:locale="en_EN"` (código de locale inválido), `og:url` duplicada, `<title>` literalmente `lemamon.dev`, e `<meta keywords>` com a description colada inteira.

### P0-4 · Quatro crashes de runtime, sem Error Boundary

`getElementById(...) as HTMLDivElement` sem null-check, com o `as` mascarando o `null`:

| Arquivo:linha | Gatilho |
|---|---|
| [`Header/index.tsx:29`](../../src/components/Header/index.tsx) | clicar qualquer item do menu em `/blog`, `/projects` ou `/post/:id` |
| [`ScrollToTop/index.tsx:26`](../../src/common/ScrollToTop/index.tsx) | botão de subir em `/blog`, ou em `/projects` após iniciar o quiz (`#intro` desmonta) |
| [`ContentBlock/index.tsx:38`](../../src/components/ContentBlock/index.tsx) | botão "Fale Conosco" fora da Home |
| [`MiddleBlock/index.tsx:23`](../../src/components/MiddleBlock/index.tsx) | `scrollTo` fora da Home |

Não há `ErrorBoundary` em lugar nenhum ([`router/index.tsx`](../../src/router/index.tsx) só tem `Suspense`). Resultado: tela branca. O visitante que veio pelo blog e clica em "Contato" perde a página.

### P0-5 · A tela de sucesso é um beco sem saída

Os botões renderizados após o envio bem-sucedido do formulário estão **sem `onClick`** ([`ContactForm/index.tsx:60`](../../src/components/ContactForm/index.tsx)). No momento de maior engajamento de toda a jornada, o usuário clica e nada acontece.

---

## 4. Os cinco buracos estratégicos

Não são bugs. São ausências.

1. **Zero prova social em todo o repositório.** Nenhum case, logo de cliente, depoimento ou número. É o vazio mais caro do site, e o único item deste plano cujo gargalo não é código — depende de conseguir autorização dos clientes. **Começar a produção na semana 1, em paralelo a tudo.**

2. **O único ativo de conversão não está no menu.** O wizard `/projects` não é linkado por nenhum item de navegação ([`Header/index.tsx:37`](../../src/components/Header/index.tsx) só tem 4 âncoras da Home). A empresa construiu uma máquina de captação e não colocou porta nela.

3. **Nenhum WhatsApp em lugar nenhum do código.** Contato é `mailto:` para um Gmail, em uma empresa com domínio próprio. No Brasil, para este ticket, isso é fricção pura.

4. **Não existe medição de funil.** `index.html` carrega **apenas a tag do Google Ads** — não há GA4, não há GTM. Existe um único ponto de medição, no fim do funil, e ele só dispara se o Heroku responder OK. Como o Heroku está morto, **a conversão reportada ao Google Ads hoje é zero**.

5. **A oferta vende cargo, não resultado.** O wizard oferece "UX/UI, Front-end, Back-end" como itens de menu, posicionando a Lemamon como mão de obra por hora e contradizendo o próprio copy institucional. Pior: a pergunta 1 **não altera nada do fluxo** — é só concatenada no texto do email. Custo estratégico sem benefício operacional.

---

## 5. Decisões — onde as sete análises divergiram

Cada linha abaixo é uma contradição real entre especialistas, com a decisão tomada e o motivo.

| Tema | Divergência | **Decisão** |
|---|---|---|
| **Renderização** | Técnico: migrar para Astro (10 dias). Produto: prerender via plugin (menor esforço). | **Astro.** Prerender congela a arquitetura ruim e paga o custo de novo depois. Astro resolve SEO, performance e o corte do antd no mesmo movimento. Mas **só na Onda 2** — nada disso importa se o lead continua se perdendo. |
| **antd** | UI: remover (CSS 545 KB → ~14 KB). Técnico: cortar dependências durante a migração. | **Remover, mas uma vez só.** O `<Result>` sai já na Onda 1 (ele sozinho arrasta 834 ícones e 757 KB para a rota de conversão). O resto do antd sai junto com a migração Astro, não antes — senão o trabalho é feito duas vezes. |
| **Blog fake** | Produto: despublicar. Conteúdo: remover. | **Remover.** Não é só constrangimento: são autores inventados, URLs `exemplo.com` quebradas e imagens hotlinkadas de terceiros, em produção. O renderizador de `Post` fica — vira a base das páginas de case. |
| **i18n** | Conteúdo: pt-BR default, despriorizar espanhol. Produto: descontinuar en/es. Marketing: quer `hreflang` funcionando. | **pt-BR como default agora** (1 linha em `translation.ts` + `lang` no HTML). `en`/`es` ficam com `noindex` até serem reescritos — o espanhol atual mistura *tú* e *usted* entre a home e o wizard. Decidir sobre manter os idiomas na Onda 2, com dado de tráfego real. |
| **Wizard** | UX: tela de estimativa antes do formulário. Negócio: perguntas BANT. Produto: campos de qualificação. | **Os três, num redesenho só.** A ordem importa: primeiro a Lemamon entrega valor (faixa + prazo estimados), depois pede os dados. Hoje a troca é 100% assimétrica — 6 telas de perguntas e um "em breve entraremos em contato". |
| **Destino do lead** | Técnico: Netlify Forms. Negócio/Produto: CRM + notificação no WhatsApp do comercial. | **Ambos, em camadas.** Netlify Forms como transporte (resolve o P0-1 sem subir backend), com webhook para planilha/CRM e notificação. O ponto do Negócio é válido: hoje o lead morre num inbox. |
| **Plano de eventos** | Três planos de analytics diferentes (Produto, Marketing, Técnico). | **O do Marketing** (~25 eventos, cobre wizard passo a passo, `wizard_blocked`, `wizard_abandon` e captura de `gclid` para conversão offline). Os outros dois são subconjuntos. |

---

## 6. Roadmap unificado

Três ondas. A Onda 1 não depende de nenhuma decisão de framework, design ou posicionamento — pode começar hoje.

### Onda 1 — Parar a hemorragia · ~5 dias de dev

> Meta: nenhum lead perdido, nenhum link morto socialmente, deploy previsível.
> Zero migração, zero redesign. Tudo em cima do código atual.

| # | Tarefa | Ref. | Dias |
|---|---|---|---:|
| 1 | Netlify Forms + `submitLead` reescrito: validação, timeout 12s, retry com backoff, honeypot, fallback de WhatsApp, `localStorage` | P0-1 | 1,5 |
| 2 | `og:image` 1200×630, `twitter:card`, `og:locale=pt_BR`, `lang="pt-BR"`, title/description por rota | P0-3 | 0,5 |
| 3 | `import.meta.env.PROD`; helper `scrollToSection` nos 4 pontos; `ErrorBoundary` no router; `onClick` na tela de sucesso | P0-2, P0-4, P0-5 | 0,5 |
| 4 | Deletar workflow de Pages; criar `netlify.toml` versionado (build, headers, deploy previews); `.env.example` | §2 | 0,5 |
| 5 | Remover `<Result>` do antd (−757 KB na rota de conversão); imports estáticos na Home; `SvgIcon` sem o "Loading..." em inglês | UI/Técnico | 1 |
| 6 | Remover blog fake e a rota; corrigir `manifest.json`; links mortos do footer | Conteúdo | 0,25 |
| 7 | GA4 + eventos do funil + alerta automático se `lead_failed` | Marketing | 0,75 |
| 8 | Botão flutuante de WhatsApp em todas as rotas + `/projects` no menu | Produto/UX | 0,5 |
| 9 | A11y de baixo custo: remover `*:focus{outline:none}`, `<button>` no lugar de `<div onClick>`, um `<h1>` real, `alt` decente | UX | 0,5 |

**Saída medível:** lead chega em 100% dos casos (ou cai no WhatsApp); preview social funcionando; `/projects` ~200 KB gzip mais leve; alerta ativo se o funil cair de novo.

**Em paralelo, sem dev:** começar a produção dos 3 primeiros cases — pedir autorização aos clientes. É o item de maior lead time do plano inteiro.

#### Status da Onda 1 — implementada em 31/07/2026

Os 9 itens acima foram implementados e verificados com build de produção e teste no navegador. Medições reais, antes → depois:

| Métrica | Antes | Depois |
|---|---:|---:|
| Total de JS emitido | ~1,7 MB | **621 KB** |
| Maior chunk | 757,94 KB (`/projects`) | 423 KB (entry) |
| Chunk da rota `/projects` | 757,94 KB + 77,95 KB | **146,59 KB** |
| Ícones do antd embarcados | 834 | **38** |
| `<h1>` na página | 0 | 1 |
| Crashes de `getElementById` | 4 | 0 |

Três desvios do plano original, todos deliberados:

1. **Sem Zod na validação do lead.** O gerenciador de pacotes está quebrado (Yarn 4 via Corepack contra um `yarn.lock` v1), então adicionar dependência não era verificável. A validação foi escrita à mão, sem dependência nova. Trocar por Zod na Onda 2, junto com o conserto do lockfile.
2. **Sem `<title>`/`description` por rota.** Exigiria `react-helmet-async` — mesma restrição. A Onda 2 resolve nativamente: o Astro gera `<head>` por página.
3. **A causa raiz dos 757 KB não era o `<Result>`.** Era `import * as AntIcons` em `src/common/Icon/index.tsx`, usado pelo `QuestionItem` — o barrel inteiro do `@ant-design/icons`. Substituído por um registro explícito dos 38 ícones que o `data.json` realmente referencia. O `<Result>` também saiu (`ContactForm` e `NotFound`).

Pendências de configuração fora do código, necessárias para a Onda 1 produzir efeito:

- Preencher `VITE_WHATSAPP_NUMBER` e `VITE_GA4_ID` no ambiente do Netlify (ver `.env.example`).
- Confirmar no painel do Netlify que o formulário `briefing` foi detectado após o primeiro deploy, e configurar a notificação de nova submissão.
- Apontar o build do Netlify para o `netlify.toml` versionado.

### Onda 2 — Existir no Google e ter o que provar · ~10 dias de dev

| # | Tarefa | Dias |
|---|---|---:|
| 10 | Andaime Astro + `@astrojs/react`/`mdx`/`sitemap`; Netlify apontado para o novo build | 1 |
| 11 | `Layout.astro` com `<head>` completo por página; Home, Header, Footer em `.astro` | 2 |
| 12 | Ilha do funil: `ProjectBuilder` + `ContactForm` como `client:load`; E2E do caminho do dinheiro (Playwright) | 2 |
| 13 | Content Collections (MDX) para `cases/` e `blog/` com schema Zod — publicar case vira PR, não deploy manual | 2 |
| 14 | `astro:i18n`: `/` pt-BR default, `/en`, `/es` + `hreflang` + sitemap por idioma | 1,5 |
| 15 | Corte de dependências: antd, i18next, react-awesome-reveal, prismjs, react-router; `tokens.ts`; fontes woff2 + preload; imagens WebP | 1 |
| 16 | Redirects das URLs antigas, `sitemap.xml`, `robots.txt`, Search Console | 0,5 |

**Saída medível:** HTML estático com o copy real em todas as rotas; entry JS < 30 KB gzip; CSS < 15 KB gzip (hoje 557 KB brutos); LCP < 1,8 s em 4G; `<title>` e OG únicos por rota.

**Em paralelo, sem dev:** reescrever o copy da Home (já entregue pronto na seção 05), publicar os 3 cases, definir as faixas de preço das 4 ofertas.

### Onda 3 — Converter melhor o tráfego que já existe · ~6 dias de dev

| # | Tarefa | Dias |
|---|---|---:|
| 17 | Redesenho do wizard: rota por etapa, `localStorage`, barra de progresso, **tela de estimativa antes do formulário**, perguntas de qualificação (orçamento/prazo/decisor) | 2 |
| 18 | Roteamento do lead: webhook → planilha/CRM + notificação para o comercial + scoring de MQL | 1 |
| 19 | Páginas `/servicos/:slug` com as 4 ofertas empacotadas, faixa de preço e FAQ | 1,5 |
| 20 | Qualidade: ESLint + Prettier + Husky, Vitest no schema e helpers, Lighthouse CI com budget no PR | 1 |
| 21 | Primeiro teste A/B de headline (só com ≥1.500 sessões/mês — abaixo disso é decisão por ruído) | 0,5 |

**Total: ~21 dias de dev em 3 ondas.**

A Onda 1 sozinha, em 5 dias, recupera 100% dos leads que hoje se perdem e conserta o preview social. É de longe o melhor retorno por dia investido do plano, e **deve começar antes de qualquer discussão de framework, design system ou posicionamento**.

---

## 7. Como medir se funcionou

Nenhum baseline real existe hoje — não há GA4 instalado, então não há histórico de tráfego. Os alvos abaixo são metas iniciais a serem revisadas assim que houver 30 dias de dado real.

| Momento | O que medir | Alvo |
|---|---|---|
| Fim da Onda 1 | Taxa de erro no envio de lead | **0%** (hoje: 100%) |
| Fim da Onda 1 | Preview de link renderizando no WhatsApp | Sim/Não |
| Fim da Onda 1 | Peso da rota `/projects` | −200 KB gzip |
| Fim da Onda 2 | Rotas indexadas no Search Console | ≥ 8 |
| Fim da Onda 2 | LCP em 4G | < 1,8 s |
| Fim da Onda 3 | `wizard_start` → `lead_submitted` | baseline medido, depois +20% |
| Contínuo | Leads qualificados (MQL) / mês | `[PREENCHER com baseline real]` |

Definição de MQL adotada: orçamento declarado ≥ R$ 30k **e** prazo ≤ 6 meses **e** contato com papel de decisão. Números a calibrar com o custo real da Lemamon.

---

## 8. O que este plano não decide

Itens que dependem de informação que não está no repositório e precisam de decisão humana:

- **Faixas de preço reais** das 4 ofertas propostas. Todas as faixas nas seções estão marcadas como estimativa de mercado.
- **Qual posicionamento adotar** — a seção 05 propõe 3 hipóteses com trade-offs e recomenda uma, mas a escolha é do dono.
- **Se vale manter espanhol e inglês** — decidir com dado de tráfego após a Onda 2.
- **Quais clientes autorizam virar case** — gargalo real do item de maior impacto do plano.

Nenhum número de faturamento, cliente ou resultado da Lemamon foi inventado em nenhuma das sete seções. Onde não havia dado, está marcado `[PREENCHER]`.

---

## 9. Índice das seções completas

| # | Seção | Conteúdo |
|---|---|---|
| 01 | [Estratégia de Produto](01-produto.md) | Personas/ICP, jobs to be done, jornada, mapa de rotas, definição de MQL, priorização RICE |
| 02 | [UX e Jornada](02-ux.md) | Auditoria heurística, redesenho do wizard, acessibilidade, responsivo, wireframe da nova Home |
| 03 | [Design Visual e Design System](03-ui.md) | Auditoria de cores/tipografia, decisão sobre antd, `tokens.ts` completo, direção de arte, spec da Home em 11 seções |
| 04 | [Arquitetura Técnica](04-tecnico.md) | Correções factuais, build medido, P0-P2, decisão Astro, performance, CMS, redesenho do `submitLead`, roadmap |
| 05 | [Conteúdo, Copy e Narrativa](05-conteudo.md) | Auditoria do copy atual, posicionamento, **copy novo pronto para colar**, "Como trabalhamos", template de case, pauta de blog, tom de voz |
| 06 | [Marketing, Aquisição e SEO](06-marketing.md) | SEO técnico, keywords por intenção, canais priorizados, plano de ~25 eventos GA4, orçamento em 3 cenários, calendário de 90 dias |
| 07 | [Modelo de Negócio e Comercial](07-negocios.md) | Leitura da oferta atual, 4 ofertas empacotadas, precificação, qualificação BANT, processo comercial, riscos, KPIs |
| — | [Validação final](VALIDACAO.md) | Veredito dos 376 itens, painel de copy por grupo, pendências do dono por campo de `dados/dono.json`, conferências pós-deploy e histórico das rodadas (20/10/2026) |
