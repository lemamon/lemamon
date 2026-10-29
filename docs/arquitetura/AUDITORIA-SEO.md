# Auditoria de SEO do site novo da Lemamon.dev

**Data:** 22/10/2026 · **Branch:** `feat/site-astro` (`2ba7e9d`) · **Ambiente auditado:** build de produção servido em `http://127.0.0.1:4330` (dados reais), com os HTML em `SA = /private/tmp/claude-501/-Users-deyvidmarinho-Documents-projects-lemamon-lemamon-dev/0f140e91-6727-4788-9ed1-968b51ee0350/scratchpad/site-atual`, e o deploy preview `https://deploy-preview-13--boring-shockley-7c50b2.netlify.app` (headers e redirects reais; `x-robots-tag: noindex` por ser preview) · **Fontes de verdade:** [BLUEPRINT](BLUEPRINT.md) §3.1, `src/i18n/{pt,en,es}.json` (`meta.*`), `src/components/shell/{SEO.astro,seo.ts}`, `src/config/routes.ts`, `netlify.toml`, `public/robots.txt`, o sitemap gerado e os playbooks [08](../playbooks/08-search-console-e-seo-local.md), [12](../playbooks/12-canais-indicacao-linkedin-conteudo.md), [12a](../playbooks/12a-rascunhos-blog.md), [14](../playbooks/14-calendario-90-dias.md) e [15](../playbooks/15-registro-de-decisoes.md).

**Método.** Sete dimensões (técnico, on-page, dados estruturados, conteúdo e E-E-A-T, local e off-site, busca por IA, SERP e concorrência), cada uma com um especialista que rastreou os 135 HTML do build por script e no Chrome real (headless, Playwright). Dois agentes de pesquisa montaram o mapa de keywords (602 termos únicos, 66 clusters) e tentaram tirar o volume no Keyword Planner. Depois, **cada achado de severidade média ou alta passou por um verificador cético independente**, que reproduziu a evidência e podia confirmar, mudar a severidade, reescrever a recomendação ou refutar. Os achados baixos ficaram sem essa verificação. **Nada foi editado no projeto, nenhum formulário foi enviado e não houve scraping do google.com:** as SERPs vieram da ferramenta WebSearch (que roda dos EUA, então a ordem é aproximada) e de WebFetch nos resultados; as sugestões vieram do endpoint público de autocomplete, a 1 requisição por segundo. As severidades e recomendações deste documento são **as da verificação**, não as do relato original.

**Onde estão as provas.** Scripts e saídas de cada agente ficam em `SEO = /private/tmp/claude-501/-Users-deyvidmarinho-Documents-projects-lemamon-lemamon-dev/0f140e91-6727-4788-9ed1-968b51ee0350/scratchpad/seo`, numa subpasta por agente (`tecnico`, `onpage`, `schema`, `conteudo-eeat`, `local-offsite`, `geo`, `serp`, `clusters` e uma `cetico-<chave>` por verificação). **Essa pasta é temporária:** copie para um lugar permanente se for precisar dela depois.

**Como ler.** As chaves vão de S01 a S07, uma por dimensão (S01 técnico, S02 dados estruturados, S03 conteúdo e E-E-A-T, S04 local e off-site, S05 busca por IA, S06 on-page, S07 SERP e keywords). Severidade: **alto** (impede indexar ou perde o cluster principal), **médio** (perde um cluster ou um sinal relevante), **baixo** (higiene, acabamento ou ganho marginal). Esforço: **P** (horas: copy, uma regra, poucas linhas), **M** (1 a 3 dias, com testes), **G** (mais que isso, ou depende de terceiros). "Depende do dono" quer dizer que falta um fato, um acesso ou uma decisão que só o dono dá.

---

## (a) Resumo executivo

### A resposta curta: o site está pronto para o Google?

**Está pronto para indexar. Ainda não tem com que ranquear além da marca e de algumas caudas longas. Nota geral: 5,6/10.**

- **A parte técnica está acima do padrão de software house.** As 129 URLs do sitemap respondem 200 no build local e no preview; canonical absoluto em todas; hreflang pt-BR/en/es/x-default recíproco em 132 páginas, com 0 erro; 404 real por idioma; 301 de barra final, `http`, `www` e das rotas do app antigo; nenhum link interno quebrado, nenhuma página órfã, profundidade máxima de 2 cliques; 471 imagens com `alt`; LCP de 0,94 a 1,09 s no celular com rede limitada e CLS 0. Nada no código impede a indexação no dia do lançamento.
- **O que segura a nota não é código.** A Lemamon.dev não tem pegada fora do site: a busca pela marca não traz a empresa e o motor sugere "Lemon.dev"; o `sameAs` aponta para um perfil pessoal do LinkedIn; GitHub e Medium estão vazios; não há Perfil da Empresa, diretório nem avaliação. Dentro do site não aparece nenhuma pessoa (sem autor, time ou `/sobre`), e os 29 cases (90 das 129 URLs) repetem o mesmo fato várias vezes, sem dizer o que foi difícil nem o que aconteceu depois.
- **A verificação mudou o quadro.** Dos 14 achados que chegaram como "alto", nenhum continuou alto: 6 ficaram médios e o resto baixo. 17 achados foram refutados, em geral porque a recomendação contrariava o BLUEPRINT §3.1, uma decisão do dono (D37, D43, D44, D45) ou não tinha volume que a sustentasse. Por isso quase nenhum title muda neste relatório (ver (d)).
- **Não há volume de busca.** O Keyword Planner ficou sem acesso: a conta Google logada não tem conta do Google Ads concluída, e a regra era não criar nem aceitar termos. Nenhum número de volume foi obtido nem estimado. O mapa de keywords usa sinal relativo (sugestões do autocomplete e composição da SERP). **Toda troca de title motivada por keyword fica condicionada ao Keyword Planner (B310).**
- **Domínio:** `lemamon.dev` existe desde 31/03/2021, mas hoje serve o app antigo (SPA com `<title>lemamon.dev</title>`, soft-404 em qualquer caminho e "Florianópolis, SC" no rodapé). Para o Google, o site novo começa praticamente do zero.

### Nota por dimensão

| Dimensão | Nota | O que funciona | O que tira ponto |
|---|---:|---|---|
| **Técnico** | **8,5** | Indexação, canonical, hreflang, sitemap, robots, 404 por idioma, redirects, CWV, links internos: tudo conferido em 135 HTML e nas 129 URLs no preview | Search Console sem verificar (S01-2); host `boring-shockley-7c50b2.netlify.app` espelha a produção sem 301 (S01-1); cases en/es com slug em português, 58 URLs (S01-3); `/sitemap.xml` e URLs prováveis dão 404 (S01-4) |
| **On-page** | **6,5** | 1 H1 por página; nenhum title, description ou H1 duplicado; nenhum nível de heading pulado; descriptions de 103 a 155 caracteres (com 1 exceção) | Title de `/servicos/sistemas-web` sem "web" e de `/servicos/aplicativos` no singular (S06-6); contato com a praça e sem a marca no fim (S06-8); a ficha dos cases não linka o serviço (S06-9) |
| **Dados estruturados** | **6,5** | JSON válido em 100% das páginas; Organization + ProfessionalService com `legalName` e `taxID`; Service ligado ao `@id` da Organization; FAQPage igual ao FAQ visível em 30 páginas e 228 perguntas | `sameAs` com LinkedIn pessoal (S02-1); placeholder "A confirmar" no BreadcrumbList (S02-2); sem `areaServed` e idiomas apesar da D31 (S02-3); breadcrumb dos cases com nomes repetidos (S02-10) |
| **Conteúdo e E-E-A-T** | **5** | Páginas de serviço com 1.200 a 1.560 palavras; régua "Como comparar orçamentos" sem equivalente nos concorrentes abertos; CNPJ nas 135 páginas; traduções limpas | Nenhuma pessoa no site (S03-1); case com "A confirmar · A confirmar" publicado (S03-2); cases repetitivos e sem papel nem desafio (S03-3); MVP e sustentação sem nenhum case (S03-5) |
| **Local e off-site** | **3** | NAP igual nos 3 idiomas; Página da empresa no LinkedIn já existe (`/company/lemamondev`, criada em 21/10/2026); CNPJ ativo em São Paulo | Nada aponta para a Página; Perfil da Empresa com elegibilidade não confirmada (S04-1); nenhum diretório, avaliação ou plano de links (S04-4, S04-7) |
| **Busca por IA** | **5,5** | HTML estático (o texto chega aos bots que não rodam JS); FAQ com respostas que abrem por "Sim."/"Não."; robots e borda liberam os 9 user agents testados | A frase que define a entidade some quando há dados da empresa (S05-1); sem `/sobre` (S05-2); pegada externa zero (S05-3) |
| **Potencial de keywords** | **4,5** | Caudas longas com concorrentes pequenos e intenção certa: preço fechado, escopo fechado, planilha, ideia de app, "software house são paulo" | Cabeças dominadas por UDS, Senior, TOTVS, iPaaS e diretórios; o cluster "quanto custa", o mais acessível em pt, pede faixa em R$ que o site não publica (S07-2); en e es sem chance realista em 6 meses |

A nota geral é a média simples das sete dimensões (5,64). **Estimativa, não medição:** com o "Fazer agora" a média sobe para cerca de 6,3 (on-page, schema e conteúdo); com os dados do dono que destravam prova e entidade (uma pessoa, a Página do LinkedIn no `sameAs`, o Perfil da Empresa, a primeira avaliação), para cerca de 7.

### Pronto para indexar no lançamento?

**Sim.** Nenhum item técnico impede a indexação. Cinco coisas devem estar resolvidas **antes do dia 0** (o dia 0 é o do [14](../playbooks/14-calendario-90-dias.md)), três delas porque ficam caras ou feias depois:

| # | O quê | Por quê | Quem | Chave |
|---|---|---|---|---|
| 1 | Propriedade de Domínio no Search Console verificada pelo TXT **no Netlify DNS**, pelo menos 3 dias antes | A coleta começa quando a propriedade é adicionada; no dia 0 já dá para enviar o sitemap e pedir indexação | Dono (15 min) | S01-2 |
| 2 | Case `painel-interativo-com-animacoes` sem "A confirmar" | Texto de rascunho em 15 superfícies indexáveis, inclusive no JSON-LD e na mensagem do WhatsApp | Dono informa setor e porte, ou despublica | S02-2, S03-2, S04-9 |
| 3 | `sameAs` e links do rodapé com a Página da empresa no LinkedIn | Hoje a Organization se declara igual a uma conta pessoal, com encerramento previsto (AUDITORIA-LINKEDIN, ação 17) | Dono confirma a Página; 1 linha em `dados/dono.json` | S02-1, S04-2 |
| 4 | Decidir os slugs localizados dos cases em en/es | Antes do lançamento é troca de código; depois, 58 redirects 301 | Integrador (M) ou registrar a exceção | S01-3 |
| 5 | 301 do host `boring-shockley-7c50b2.netlify.app` para `lemamon.dev` | Higiene: tira uma cópia rastreável do site (o Netlify já manda `Link: rel=canonical`) | Integrador (P) | S01-1 |

### As 5 ações de maior impacto

1. **Ligar a medição antes do dia 0 (S01-2, P).** Propriedade de Domínio + TXT no Netlify DNS 3 dias antes; no dia 0, sitemap, inspeção de até ~10 URLs por dia e importação no Bing. Sem isso, nenhuma das revisões previstas (D37 aos 60 dias, títulos aos 90) tem dado. Métrica: URLs válidas no relatório Páginas.
2. **Consolidar a entidade (S02-1, S04-2, S05-3, S03-11, P; dono confirma).** `sameAs` e rodapé com `https://www.linkedin.com/company/lemamondev`; `sameAs()` filtrando por `publicar` (D01); organização `lemamon-dev` no GitHub com nome "Lemamon.dev", site, cidade e README; Medium fora até o 1º post (D35). É o que separa "Lemamon.dev" de "Lemon.dev" e do perfil pessoal do fundador. Métrica: Home em 1º para "lemamon.dev" até 60 dias depois da indexação.
3. **Limpar a camada de cases, que é 70% das URLs (S02-10, S03-2, S03-3, S03-4, S06-9, P/M).** Breadcrumb com o nome do case em vez de "Setor · Porte"; ficha com link para o serviço; todo case recebendo link de outro case; texto sem o mesmo fato 7 a 9 vezes; "A confirmar" fora. Métrica: páginas de case em "Válida" no Search Console e cliques de case para serviço.
4. **Ajustes on-page baratos e com evidência (S06-6, S06-8, S05-1, S03-7, S07-8, S07-10, P).** "web" no title de sistemas web; "aplicativos" no plural; contato sem a praça; a frase "empresa de desenvolvimento de software sob medida de São Paulo, SP" no FAQ que já está no FAQPage; definição de MVP; "time and materials" em en; API, webhook e IoT industrial em integrações. Métrica: impressões por página no Search Console.
5. **Pôr uma pessoa real no site (S03-1, S05-2; depende do dono).** Uma pessoa em `dados/dono.json › time` libera `/sobre`, o JSON-LD `Person` e o autor do blog (B298). O blog é o único caminho para as caudas informacionais (planilha, escopo fechado, ideia de app) e só volta com 3 posts e autor real. Métrica: `/sobre` indexada; blog no ar na quinzena 5.

### Números da auditoria

| Medida | Valor |
|---|---|
| HTML do build rastreados | 135 (129 indexáveis + 6 `noindex`: 3 páginas 404 e 3 de "pedido enviado") |
| URLs do sitemap | 129, todas 200 no build local e no preview; 516 `xhtml:link` de hreflang |
| Links internos quebrados / páginas órfãs | 0 / 0 |
| Imagens com `alt` | 471 de 471 (29 imagens únicas) |
| Core Web Vitals no celular (preview, perfil iPhone 13, Slow 4G, CPU 4x, mediana de 3) | LCP 0,94–1,09 s · CLS 0 · maior tarefa longa 83 ms · proxy de INP até 88 ms |
| JSON-LD | 0 erros e 0 avisos no validator.schema.org (3 URLs); FAQPage em 30 páginas, 228 perguntas, 0 divergência com o visível |
| Termos de keyword | 602 únicos; 66 clusters (40 pt, 13 en, 12 es, 1 de marca) |
| Volume do Keyword Planner | **0 termos** (sem acesso) |
| Autocomplete | 103 consultas do agente de clusters, mais as dos agentes de SERP e conteúdo (1 req/s) |
| SERPs analisadas | 18 consultas documentadas (10 pt, 4 en, 4 es) + 14 buscas novas para separar clusters |
| Rastreadores de IA testados | 9 user agents, todos com 200 no preview |

| Situação | Achados | Alto | Médio | Baixo |
|---|---:|---:|---:|---:|
| Confirmados (reproduzidos pelo cético) | 43 | 0 | 6 | 37 |
| Baixos não verificados | 30 | — | — | 30 |
| Refutados | 17 | — | — | — |
| **Total** | **90** | | | |

Os 43 confirmados se agrupam em **28 temas** (o mesmo problema visto por mais de uma dimensão, como o `sameAs`, visto por schema, off-site e busca por IA). Dos 14 que chegaram como alto, 6 ficaram médios e 8 baixos. Dos 60 achados verificados, 17 (28%) foram refutados.

| Plano | Itens |
|---|---:|
| Fazer agora (antes ou no lançamento, P/M, sem decisão do dono) | 17 |
| Próximo (30–90 dias) | 7 |
| Depende do dono | 19 |
| Polimento | 21 |

### O que veio do artigo "AI prompts for SEO" (GoDaddy)

O artigo propõe 10 prompts de IA para SEO e avisa que a saída precisa ser verificada. Aqui eles viraram tarefas de agentes, e a verificação foi feita por um segundo agente que reproduzia cada achado.

| # | Prompt do artigo | Onde foi aplicado | O que saiu |
|---|---|---|---|
| 1 | Estratégia | (a) e (c) | Foco em 6 meses nas caudas com concorrentes pequenos; nada de conteúdo para as cabeças nem para es |
| 2 | Keywords de cauda longa e termos locais | (b) | 602 termos pt/en/es com a praça São Paulo (D38) |
| 3 | Mapa de keywords (conteúdo, meta, URL, sem stuffing) | (b) e (d) | Uma URL dona por cluster; regra de 1 ocorrência por bloco |
| 4 | Revisão on-page | S06 | 135 páginas: headings, títulos medidos em pixel, `alt`, links por zona |
| 5 | Otimizar post | (e) | Rascunhos do 12a revisados: title igual ao de um concorrente, keyword sem sinal |
| 6 | Títulos e descrições | (d) | 43 páginas × 3 idiomas, com caracteres contados |
| 7 | FAQ com schema | (f) e S02-9 | FAQPage conferido item a item; ressalva: o rich result de FAQ foi descontinuado pelo Google |
| 8 | Outline | (e) | Outline curto dos 10 primeiros posts |
| 9 | Cluster de keywords | (b) | 66 clusters separados por sobreposição de SERP |
| 10 | Dores do público | (b) e (e) | Clusters ligados às personas: planilha (Cláudia), ideia de app (Rafael), código e NDA (Marcos) |

**O que o artigo não cobre e esta auditoria cobriu:** SEO técnico (canonical, hreflang, redirects, host duplicado, CWV), entidade e NAP (`sameAs`, Perfil da Empresa, diretórios), off-site e backlinks, busca por IA (rastreadores, `llms.txt`, frase citável), medição (Search Console no dia do lançamento) e **dado de volume**, que nenhum prompt substitui: sem o Keyword Planner, toda escolha de keyword aqui é condicional. A ressalva do artigo se confirmou na prática: 28% dos achados verificados não paravam em pé.

---

## (b) Mapa de keywords

**Status dos volumes:** `sem_acesso`. A conta Google logada no Chrome (o e-mail do dono) não tem conta do Google Ads utilizável: a tela de seleção vem vazia e oferece "Nova conta do Google Ads" e "Terminar de criar sua conta?". O agente parou aí, sem criar conta, aceitar termos ou consultar nenhum termo. **Para destravar (depende do dono):** concluir a conta do Google Ads sem campanha (modo especialista › "Criar uma conta sem uma campanha"), entrar com outra conta que já tenha acesso ao Ads, ou usar uma conta de cliente via MCC. Sem gasto ativo, o Planner costuma mostrar faixas (100–1 mil, 1 mil–10 mil), não números exatos. Por isso a coluna **Volume (KP)** está vazia em todas as linhas, e a coluna ao lado traz o sinal relativo que foi possível medir.

**Legenda de prioridade:** **alta** = realista para um site novo em 6 meses e com ação definida; média = vale on-page ou um post, sem expectativa de topo; baixa = só alinhamento, sem investimento no semestre.

### Português

| # | Cluster | Primária | Secundárias principais | Volume (KP) | Sinal no autocomplete e na SERP | Intenção | URL alvo | Prioridade |
|---|---|---|---|---|---|---|---|---|
| 0 | Marca (pt/en/es) | lemamon.dev | lemamon, lemamon dev | — | 0 sugestões; o WebSearch sugere "Lemon.dev" (agência Shopify de Tallinn) | navegacional | `/` | **alta** |
| 1 | Local São Paulo | desenvolvimento de software são paulo | empresa de desenvolvimento de software são paulo; software house são paulo; fábrica de software são paulo | — | sugestão exata; "sao paulo" é a 2ª de 10 em "empresa de desenvolvimento de software"; SERP de landings pequenas e listas | local | `/` (title da D37) | **alta** |
| 2 | Software sob medida (cabeça) | desenvolvimento de software sob medida | software sob medida; empresa de desenvolvimento de software; software house | — | SERP de UDS, Senior, Wüst e guias | transacional | `/` | média (só on-page) |
| 3 | Listas de "melhores" | melhores empresas de desenvolvimento de software do brasil | melhor software house do brasil | — | listas ordenadas por avaliações no Clutch | comercial | perfis externos → `/` | média (off-site) |
| 4 | Hub de serviços | desenvolvimento de software para empresas | serviços de desenvolvimento de software | — | sugestão exata | comercial | `/servicos` | baixa |
| 5 | Sistemas web | desenvolvimento de sistemas web para empresas | sistema web para empresas; sistema sob medida; criar sistema para minha empresa | — | "…web para empresas" é sugestão exata; sem "web", 5 de 9 resultados são cursos de ADS | transacional | `/servicos/sistemas-web` | **alta** |
| 6 | ERP e CRM sob medida | erp sob medida | crm sob medida; sistema de gestão personalizado | — | sugestão exata; SERP de ERPs "personalizáveis" | transacional | `/servicos/sistemas-web` (H3 existentes) | média |
| 7 | Da planilha para o sistema | transformar planilha em sistema | transformar planilha em sistema web; transformar planilha excel em sistema web | — | 3 sugestões; SERP fraca (freelancer, no-code, fórum) | comercial | post 7, `/blog/transformar-planilha-em-sistema` | **alta** |
| 8 | Software para indústria | sistema de controle de produção industrial | dashboard de produção industrial; sistema de rastreabilidade industrial | — | SERP de SaaS e MES prontos | comercial | os cases de indústria (sem hub novo) | baixa |
| 9 | Aplicativos (comercial) | empresa de desenvolvimento de aplicativos | desenvolvimento de aplicativos em são paulo; desenvolvimento de aplicativos sob medida | — | "empresa de…" e "…em são paulo" são sugestões exatas; "aplicativo sob medida" tem 0 | transacional | `/servicos/aplicativos` | **alta** |
| 10 | Aplicativos por nicho | aplicativo para empresa de transporte | aplicativo para agência de turismo; aplicativo para prefeituras | — | só autocomplete | comercial | `/servicos/aplicativos` (H3) | baixa |
| 11 | Revenda de gás (case) | aplicativo para revenda de gás | sistema para distribuidora de gás e água | — | sugestão exata | comercial | `/cases/app-do-revendedor-de-gas` | baixa |
| 12 | Gestão escolar (case) | sistema de gestão escolar online | app escola para pais | — | SERP de SaaS e de sistemas de governo | comercial | `/cases/portal-escola-professores-e-pais` | baixa |
| 13 | Passagens (case) | sistema de venda de passagens rodoviárias | — | — | só autocomplete | comercial | `/cases/passagens-de-onibus-web-e-app` | baixa |
| 14 | Configurador (case) | configurador de produtos | — | — | intenção de ERP industrial | comercial | `/cases/seletores-de-produtos-para-varejo` (só no texto) | baixa |
| 15 | Apps: dúvidas técnicas | diferença entre app nativo e híbrido | quanto tempo leva para desenvolver um aplicativo | — | "app nativo ou hibrido" é sugestão exata | informacional | FAQ de `/servicos/aplicativos` ou post 10 alternativo | baixa (depende do stack) |
| 16 | MVP (comercial) | desenvolvimento de mvp | mvp para startups; desenvolvimento de software mvp | — | SERP informacional (Sankhya, TOTVS, RD Station) | transacional | `/servicos/mvp` | média |
| 17 | MVP: o que é | o que é mvp em desenvolvimento de software | produto mínimo viável; como criar um mvp | — | "o que é mvp" ambíguo (esporte, jogos) | informacional | `/servicos/mvp` (definição no FAQ) | baixa |
| 18 | Quanto custa um MVP | quanto custa um mvp | quanto custa desenvolver um saas | — | sugestão exata; SERP pede faixa em R$ | comercial | `/servicos/mvp` (FAQ existente) | baixa (sem número não compete) |
| 19 | Tenho uma ideia de app | tenho uma ideia de aplicativo mas não sei programar | tive uma ideia de aplicativo e agora; como validar uma ideia de negócio | — | 10 sugestões em "ideia de aplicativo"; SERP de blogs pequenos e antigos | informacional | suplente, `/blog/tenho-uma-ideia-de-aplicativo` | **alta** (proposta de troca com o post 5) |
| 20 | Proteger a ideia e NDA | patentear ideia de aplicativo | como proteger uma ideia de aplicativo; nda para startups | — | autocomplete | informacional | suplente, `/blog/como-proteger-ideia-de-aplicativo` | média (revisão jurídica) |
| 21 | De quem é o código | propriedade intelectual desenvolvimento de software | contrato de desenvolvimento de software; de quem é o código fonte | — | 5 e 8 sugestões; uma software house pequena ranqueia | informacional | post 10, `/blog/de-quem-e-o-codigo-do-software` | média (revisão jurídica) |
| 22 | Integração (comercial) | empresa de integração de sistemas | integração de sistemas via api; integração de sistemas legados | — | sugestões exatas; a cabeça é 100% guias e iPaaS | transacional | `/servicos/integracoes` | média |
| 23 | ERP com e-commerce | integração erp e commerce | integração erp crm; erp com integração mercado livre | — | sugestão exata; SERP de hubs e integradores prontos | comercial | H2 do post 8 | média |
| 24 | WhatsApp, chatbot e IA | integração whatsapp business api | chatbot para empresas; agente de ia para empresas | — | SERP de SaaS | comercial | `/servicos/integracoes` (H3 existentes) | baixa |
| 25 | Automação administrativa | como automatizar processos administrativos | automação de processos empresariais | — | 0 URL em comum com "integração de sistemas" | informacional | sem post no semestre | baixa |
| 26 | Manutenção e sustentação | manutenção de software | sustentação de sistemas; manutenção evolutiva de software | — | "sustentação" puxa vagas; "manutenção corretiva" puxa indústria e predial | comercial | `/servicos/sustentacao` | baixa |
| 27 | Fornecedor sumiu | meu desenvolvedor sumiu | sistema sem suporte o que fazer | — | concorrência quase nula | informacional | **bloqueado:** `confirmacoes.sistemaTerceiros` é `false` | — |
| 28 | Sistemas legados | modernização de sistemas legados | migração de sistemas legados | — | sugestão exata | comercial | `/servicos/sustentacao`, só se o dono confirmar | baixa |
| 29 | Quanto custa um software | quanto custa desenvolver um sistema (primária do BLUEPRINT §3.1) | quanto custa um software sob medida; quanto custa um software para empresa; orçamento desenvolvimento de software | — | "…sob medida" é a 3ª sugestão de "software sob medida"; SERP 100% com faixas em R$ | comercial | `/quanto-custa` | **alta com faixas** (D6); média sem |
| 30 | Quanto custa um aplicativo | quanto custa desenvolver um aplicativo | quanto custa um aplicativo simples | — | 1ª sugestão de "quanto custa desenvolver um" | comercial | `/quanto-custa` (H3) e FAQ de `/servicos/aplicativos` | média |
| 31 | Quanto custa ERP/CRM | quanto custa um erp personalizado | quanto custa desenvolver um crm | — | sugestão exata | comercial | FAQ de `/servicos/sistemas-web` | baixa |
| 32 | Custo de manter um app | quanto custa manter um aplicativo | quanto custa manter um aplicativo no ar | — | 6 sugestões, parte sobre taxa de loja | comercial | post 9 | baixa |
| 33 | Preço fechado (método) | desenvolvimento de software com preço fechado | projeto de escopo fechado | — | 0 sugestões; SERP de landings pequenas com o mesmo posicionamento | transacional | `/como-trabalhamos` (o title já casa) | alta (já atendida: só medir) |
| 34 | Escopo aberto ou fechado | escopo aberto ou fechado | contrato escopo fechado; preço fechado ou por hora | — | "escopo fechado" tem 6 sugestões; "preço fechado ou por hora" tem 0 | informacional | post 3, `/blog/preco-fechado-ou-por-hora` (H2) | **alta** |
| 35 | Discovery de produto | discovery de produto | processo de discovery de produto; o que é discovery em projetos | — | 9 sugestões; SERP de produto (Atlassian, Tera) | informacional | post 2, `/blog/o-que-receber-de-uma-sprint-de-descoberta` | média |
| 36 | Sprint de Descoberta (oferta) | sprint de descoberta | discovery de produto gratuito | — | 0 sugestões | comercial | `/sprint-de-descoberta` (title mantido) | baixa |
| 37 | Sistema pronto ou sob medida | sistema pronto ou sob medida | software pronto ou sob medida; vantagens do software sob medida | — | 0 sugestões; title do rascunho igual ao de um concorrente | informacional | post 1, `/blog/sistema-pronto-ou-sob-medida` | média |
| 38 | Software house: o que é e como escolher | como escolher empresa de desenvolvimento de software | o que é software house; software house exemplos | — | "o que é software house" sugere; "como escolher…" 0 | informacional | post 4 | média |
| 39 | Freelancer x software house | software house ou freelancer | terceirizar ou internalizar desenvolvimento | — | 0 sugestões | informacional | H2 do post 4 | baixa |
| 40 | Lovable e apps feitos com IA | lovable vale a pena | criar mvp com ia; app feito com ia funciona em produção | — | 6 sugestões; SERP ainda sem dono | informacional | suplente, `/blog/lovable-vale-a-pena` | média |

### Inglês

| # | Cluster | Primária | Secundárias principais | Volume (KP) | Sinal | Intenção | URL alvo | Prioridade |
|---|---|---|---|---|---|---|---|---|
| E1 | Home (cabeça) | custom software development company | custom software development services; for small business | — | 10 sugestões, quase todas com cidade ou país | transacional | `/en/` | baixa |
| E2 | Brasil e nearshore | software development company in brazil | nearshore software development brazil; brazil software companies | — | "…in brazil" é sugestão exata; "nearshore … brazil" 0 | comercial | `/en/` (o title já casa) e FAQ "outside Brazil" | média |
| E3 | Fixed price | fixed price software development | fixed price vs time and materials | — | 2 sugestões; SERP de guias que comparam com T&M | comercial | `/en/how-we-work` | média |
| E4 | Custo | how much does custom software cost | custom software development cost | — | 6 sugestões | comercial | `/en/pricing` | baixa |
| E5 | Orçamento | software development quote | — | — | ambíguo ("quotes" = citações) | transacional | `/en/quote` | baixa |
| E6 | MVP | mvp development for startups | fixed price mvp; mvp development for non technical founders | — | 10 sugestões com país | transacional | `/en/services/mvp` | baixa |
| E7 | Web apps, ERP e CRM | custom web application development | custom crm development; custom software vs off the shelf | — | sugestões com cidades da Índia | transacional | `/en/services/web-systems` | baixa |
| E8 | Apps | custom mobile app development | fixed price app development | — | — | transacional | `/en/services/mobile-apps` | baixa |
| E9 | Integrações | api integration services | erp integration services | — | — | transacional | `/en/services/integrations` | baixa |
| E10 | Manutenção | software maintenance and support services | legacy system modernization services | — | — | transacional | `/en/services/support-and-evolution` | baixa |
| E11 | Discovery | discovery phase software development | product discovery services | — | sugestões comerciais; SERP com páginas de serviço | comercial | `/en/discovery-sprint` (texto) | baixa |
| E12 | Como escolher | how to choose a software development company | freelancer vs agency | — | — | informacional | `/en/pricing` (H2 existente) | baixa |
| E13 | Código e NDA | who owns the source code | software development nda | — | poluído (jogos) | informacional | FAQ de `/en/how-we-work` | baixa |

### Espanhol

| # | Cluster | Primária | Secundárias principais | Volume (KP) | Sinal | Intenção | URL alvo | Prioridade |
|---|---|---|---|---|---|---|---|---|
| S1 | Home | desarrollo de software a medida | desarrollo de software en brasil; software a medida para empresas | — | 8 de 10 sugestões com país; "…en brasil" é sugestão exata | transacional | `/es/` | baixa |
| S2 | Variações por país | empresa de desarrollo de software en mexico | …colombia, …chile, …españa | — | autocomplete localizado por país | local | **não atacar** (páginas por país seriam doorway) | — |
| S3 | Llave en mano / precio fijo | desarrollo de software llave en mano | desarrollo de software precio fijo | — | "llave en mano" só ecoa; "precio fijo" 0 | transacional | `/es/como-trabajamos` (title mantido) | baixa |
| S4 | Sistemas web | desarrollo de sistemas a medida | desarrollo de crm a medida | — | sugestão exata | transacional | `/es/servicios/sistemas-web` | baixa |
| S5 | Apps | desarrollo de aplicaciones móviles a medida | desarrollo de apps para empresas | — | poluído por cursos | transacional | `/es/servicios/aplicaciones` | baixa |
| S6 | MVP | desarrollo de mvp | mvp para startups; producto minimo viable | — | SERP informacional | transacional | `/es/servicios/mvp` | baixa |
| S7 | Integrações | integracion erp | integracion api; automatizacion de procesos para empresas | — | nomes de plataforma por país | comercial | `/es/servicios/integraciones` | baixa |
| S8 | Manutenção | mantenimiento y soporte de software | cuanto cuesta mantener una app | — | — | transacional | `/es/servicios/soporte-y-evolucion` | baixa |
| S9 | Custo | cuanto cuesta desarrollar una app | cuanto cuesta un software a la medida | — | 7 de 10 com país; SERP em EUR e COP | comercial | `/es/cuanto-cuesta` | baixa |
| S10 | Cotização | cotizacion desarrollo de software | presupuesto desarrollo de software | — | — | transacional | `/es/cotizacion` | baixa |
| S11 | Sprint | sprint de descubrimiento | product discovery | — | 0 sugestões | comercial | `/es/sprint-de-descubrimiento` | baixa |
| S12 | Guias | como elegir una empresa de desarrollo de software | contrato de desarrollo de software | — | — | informacional | FAQ de `/es/como-trabajamos` | baixa |

**Fora do mapa de propósito** (intenção errada para a oferta): preço-hora de desenvolvimento (lado de quem vende; D23), "como criar um aplicativo do zero", alocação de desenvolvedores e "squad as a service" (D02), "hire brazilian developers", "design sprint" (a Sprint de Descoberta não tem protótipo, D44), "empresa de tecnologia são paulo" (amplo demais), "contrato de desenvolvimento de software modelo" (quem busca quer baixar um modelo).

### Metas realistas em 6 meses (referência, não meta registrada)

Pelo [13](../playbooks/13-kpis-e-rituais.md) §1, uma meta só vale quando o dono a troca por um número próprio, depois da linha de base do dia 30. Estes números são a referência para essa conversa.

| Objetivo | Referência em 6 meses | Como medir |
|---|---|---|
| Marca | Home em 1º para "lemamon.dev" e "lemamon" até 60 dias depois da indexação | Search Console › Desempenho, filtro "contém lemamon" |
| Indexação | ≥ 95% das 129 URLs como "Válida" | Search Console › Páginas |
| Cauda comercial | Top 10 em pelo menos 3 termos destes: "desenvolvimento de software com preço fechado", "software house são paulo", "empresa de desenvolvimento de software são paulo", "desenvolvimento de sistemas web para empresas", "desenvolvimento de aplicativos são paulo" | Search Console, posição média por consulta |
| Cauda informacional (depende do blog no ar na quinzena 5) | Impressões nas consultas dos posts 1 a 4; top 20 em "escopo aberto ou fechado" e "transformar planilha em sistema" | Search Console, filtro por página do post |
| Demanda orgânica | Pedidos de diagnóstico com origem orgânica registrados todo mês (linha de base no dia 30) | GA4 `lead_submitted` × origem `organic`; CRM |
| Fora de alcance no semestre | As cabeças ("desenvolvimento de software sob medida", "empresa de desenvolvimento de software", "desenvolvimento de MVP", "integração de sistemas"), todas as cabeças em en e todo o es | — |

### Canibalização

| # | Conflito | Páginas | Decisão depois da verificação | Status |
|---|---|---|---|---|
| 1 | Praça São Paulo no title | `/`, `/contato` (pt.json:2075, igual em en/es), `/sobre` (gated) | `/contato` perde a praça (S06-8). A Home fica com "desenvolvimento de software sob medida" + São Paulo (D37). `/sobre`, quando existir, fica com a intenção de entidade "empresa de desenvolvimento de software em São Paulo" (BLUEPRINT §3.1, linha 73). Rever com o Search Console aos 60 dias (janela da D37) | confirmado (contato); `/sobre` mantido (S07-6 e S06-8) |
| 2 | "Quanto custa" × "orçamento" | `/quanto-custa`, `/orcamento`, FAQs de custo dos serviços | Title de `/quanto-custa` mantido (primária do BLUEPRINT; "aplicativo" tem mais sinal que "sob medida", S06-3). A description de `/orcamento` deixa de abrir com "Orçamento de desenvolvimento de software:" (S06-11). O FAQ "Quanto custa um sistema sob medida?" (pt.json:971) pode virar "Quanto custa um ERP ou CRM sob medida?" | parcial: descrições em Polimento |
| 3 | "Preço fechado" em 3 titles | `/como-trabalhamos`, `/sprint-de-descoberta`, `/servicos/mvp` | **Não é canibalização** (S06-7): os núcleos são diferentes ("desenvolvimento de software", "Sprint de Descoberta", "MVP") e "preço fechado" é o diferencial do site inteiro. Nenhuma troca. O post 3 não usa "desenvolvimento de software com preço fechado" no `seoTitle` | refutado |
| 4 | Discovery | `/sprint-de-descoberta` × post 2 | A página de oferta mantém o title e "discovery de produto" na description; o post usa o termo em H2 e na description. Qual dos dois é a primária do post decide o Keyword Planner (B310) | decisão com volume |
| 5 | Pronto × sob medida | FAQ de `/servicos/sistemas-web` (pt.json:963), H3 da Home, post 1 | O post é o dono da comparação; com o blog no ar, o FAQ responde em 2 linhas e linka o post | quando o blog voltar |
| 6 | Integração × automação | `/servicos/integracoes` | A página fica com "integração de sistemas"; automação administrativa fica sem post no semestre (SERP de BPM/RPA) | baixa |
| 7 | Home × `/servicos` × sistemas web | três páginas | Home = "sob medida"; `/servicos` = "para empresas"; sistemas web ganha "web" no title (S06-6) | confirmado |
| 8 | Cases parecidos | `arquivos-de-auditoria-de-processos` × `gestao-de-documentos-da-qualidade` (22% de texto em comum fora do boilerplate); `controle-de-producao-com-contagem-automatica` × `painel-de-controle-de-producao` | O dono decide fundir ou diferenciar o title e o H1 pelo que é único (09a) | não verificado; depende do dono |
| 9 | FAQ repetido | "E se eu precisar mudar o escopo…" em 8 páginas; "O código fica com a minha empresa?" em 7; "Pago alguma coisa antes…" em 7 | Texto repetido é tratado como boilerplate, sem penalidade, e o rich result de FAQ não existe mais. Manter o texto (decisão de conversão, F01/F15); marcar no FAQPage só na página dona é opcional (S05-12) | baixo |
| 10 | Posts × serviços | blog × `/servicos/*` | Regra de âncora: o post linka o serviço com a primária do serviço; o serviço linka o post com a primária do post. Nenhum `seoTitle` de post usa a primária de uma página de serviço | regra para o 12 §7 |

---

## (c) Plano priorizado

### Fazer agora — antes ou no lançamento, esforço P/M, sem decisão do dono

| Chave | Problema | Recomendação exata | Impacto esperado | Esforço |
|---|---|---|---|---|
| **S01-2** | Search Console sem propriedade; o playbook manda gravar o TXT no lugar errado | (1) Dono adiciona a propriedade de **Domínio** `lemamon.dev` pelo menos 3 dias antes do dia 0 e grava o TXT em app.netlify.com › Domains › lemamon.dev › DNS settings (o DNS é Netlify/NS1; o SPF `secureserver.net` é só do e-mail). (2) `08:11`: trocar "[PREENCHER: Netlify DNS ou registrador]" por "Netlify DNS (NS dns1–dns4.p05.nsone.net)…; o SPF com secureserver.net é só do e-mail; não grave o TXT lá". (3) `08:13`, passo 4: "a cota da Inspeção é de cerca de 10 pedidos por dia: no dia 0, `/`, `/en/`, `/es/`, `/orcamento` e as 5 páginas de serviço; o resto no dia 1". (4) [14](../playbooks/14-calendario-90-dias.md), linha 30: separar a verificação para "Antes do dia 0" e deixar sitemap, inspeção e Bing na quinzena 1 | Dados desde a troca de site; sitemap e indexação no dia 0 | P |
| **S01-1** | `boring-shockley-7c50b2.netlify.app` serve a produção com 200 e "index, follow" | `netlify.toml`, logo depois do comentário das linhas 41–45 e **antes** da regra `/projects` (linha 50): `[[redirects]] from = "https://boring-shockley-7c50b2.netlify.app/*" to = "https://lemamon.dev/:splat" status = 301 force = true`. Depois do merge: `curl -sI https://boring-shockley-7c50b2.netlify.app/servicos/mvp` → 301 para `https://lemamon.dev/servicos/mvp`; o deploy preview continua 200 com `noindex` | Higiene: o Netlify já manda `Link: rel=canonical`; o 301 tira a cópia rastreável | P |
| **S02-10 · S03-15 · S03-2** | O breadcrumb e o BreadcrumbList dos cases usam "Setor · Porte" ("Indústria · Multinacional" em 4 cases) e carregam o "A confirmar" | `src/components/gated/CaseArticle.astro:102`: `{ label: data.seoTitle ?? data.tipoDeSistema }`. Setor e porte continuam no eyebrow (regra de anonimização da D45). Opcional, para conversão: em `CaseView.astro:52`, passar `data.seoTitle` para `caseMessage` | Breadcrumb único e descritivo em 87 URLs; o placeholder sai do dado estruturado | P |
| **S03-4 · S06-9** | A linha "Serviços" da ficha do case é texto puro; 5 cases só recebem link do hub | (1) `src/components/gated/FieldList.astro`: aceitar `links?: { label; href }[]` no item e renderizar `<a>` separados por " · ". (2) `CaseArticle.astro:79`: `links: data.servicos.map((key) => ({ label: serviceLabels[key], href: urlFor(SERVICE_ROUTE[key], locale) }))`; linha 80: cada etapa com `anchorFor("how_we_work", locale, ANCHORS.stage[stage])`, e a etapa discovery com `urlFor("discovery_sprint", locale)`. (3) Trocar `relacionados` nos 3 idiomas: `painel-de-controle-de-producao` → `["painel-de-testes-automatizados", "controle-de-producao-com-contagem-automatica"]`; `sensores-em-epis-com-app` → `["app-de-saude-com-vestiveis", "deteccao-de-descarga-estatica"]`; `app-guia-turistico` → `["app-de-alertas-de-seguranca", "app-de-contagem-de-veiculos"]`; `template-modular-para-site-de-marca` → `["site-institucional-com-cms", "site-de-estudo-de-caso-de-ia"]` | Sistemas web passa de 6 para 23 páginas com link de conteúdo; aplicativos de 7 para 20; integrações de 6 para 13; todo case recebe link de outro case | P |
| **S03-3 (A)** | O mesmo fato aparece 7 a 9 vezes por case; a etapa de sustentação diz "suporte, correções **ou** evolução" nos 29 | Nos MDX dos 3 idiomas, começando por `controle-de-producao-com-contagem-automatica`, `app-de-compra-de-gas`, `portal-escola-professores-e-pais`, `sensores-em-epis-com-app`, `gestao-de-documentos-da-qualidade` e `app-android-para-placa-educativa`: (1) tirar o `### O que foi construído` que repete `combinado.escopo`; (2) cada fato no máximo 2 vezes por página; (3) manter as 4 etapas da D45(4), sem reescrever o problema nelas; a etapa support passa a "Depois de entrar no ar, o app seguiu em sustentação." (en "After launch, the app moved into ongoing support."; es "Después del lanzamiento, la app siguió con soporte.") | Mais informação nova por página nas 87 URLs de prova | M |
| **S06-6** | Title de sistemas web sem "web" (cai numa SERP de cursos de ADS); aplicativos no singular, sem sinal no autocomplete | `pt.json:2043`: "Desenvolvimento de sistemas web para empresas \| Lemamon.dev" (59; 590 px, abaixo do corte de ~600 px). `pt.json:2044`: "Desenvolvimento de sistemas web sob medida para empresas: ERP, CRM, painéis e portal do cliente, com escopo, prazo e preço fechados antes de construir." (151). `pt.json:2047`: "Desenvolvimento de aplicativos sob medida \| Lemamon.dev" (55). `pt.json:2048`: "Desenvolvimento de aplicativos sob medida para empresas, no iOS e no Android: escopo e preço fechados antes de construir e entregas a cada 2 semanas." (149). Registrar o desvio no BLUEPRINT §15.4 e atualizar a primária no 08 §2. H1 sem mudança | Title igual ao termo com sugestão exata e ao H1; mesmo padrão do es | P |
| **S06-8** | Os 3 titles de contato são os únicos que não terminam na marca e levam a praça da Home; a description pt tem 158 | `pt.json:2075` "Contato \| Lemamon.dev" (21); `en.json:2075` "Contact \| Lemamon.dev" (21); `es.json:2075` "Contacto \| Lemamon.dev" (22). `pt.json:2076`: "Contato da Lemamon.dev: WhatsApp, e-mail e formulário curto. Projeto novo? Comece pelo diagnóstico gratuito de 45 minutos, com devolutiva por escrito." (150). Em `pt.json:29` (`_notes.deviations`), apagar o trecho sobre `meta.contact.title` (a Home já leva a praça). Não citar WhatsApp no title sem criar `title_no_whatsapp` (regra de `pt.json:15`) | Um único dono para o cluster local | P |
| **S05-1 · S07-5** | A frase que nomeia a categoria ("empresa de desenvolvimento de software sob medida") some do HTML quando há dados da empresa | `faq.conditional.other_cities.answer_with_abroad` (linha 739) e `answer_draft` (linha 737), só a primeira oração: pt "Sim. A Lemamon.dev é uma empresa de desenvolvimento de software sob medida de São Paulo, SP, e atende a distância empresas de outras cidades do Brasil e de outros países, em português, inglês ou espanhol, …"; en "Yes. Lemamon.dev is a custom software development company based in São Paulo, Brazil, and works remotely with companies in other Brazilian cities and in other countries, in English, Portuguese or Spanish, …"; es "Sí. Lemamon.dev es una empresa de desarrollo de software a medida de São Paulo, Brasil, y atiende a distancia a empresas de otras ciudades de Brasil y de otros países, en español, inglés o portugués, …". Opcional: `HomeTrustProfiles.astro:40-42` renderiza `text` + `text_with_company` | Frase sujeito + categoria + local + público, citável e já dentro do FAQPage | P |
| **S05-7 · S03-12** | A única resposta para quem é de fora do Brasil só aparece na Home | `src/components/how-we-work/hww-faq.ts`: `{ cond: "other_cities" }` logo depois de `{ cond: "nda" }`. Com o teto de 9, sai `need_tech_knowledge` (que continua na Home). Atualizar `how_we_work._notes.faq_composition` e `tests/unit/pages-faq.test.ts` | "Do you work with companies outside Brazil?" no FAQPage de `/en/how-we-work` e `/es/como-trabajamos` | P |
| **S03-7 · S07-9** | `/servicos/mvp` não explica o que é MVP (a definição existe em `what_is_mvp`, mas o teto do FAQ corta) | `services.mvp.faq.what_goes_in.answer` (pt.json:1301): "MVP (produto mínimo viável) é a menor versão do produto que já resolve o problema principal para usuários reais: o mínimo para provar a ideia. O que entra e o que fica para depois é decidido com você antes do desenvolvimento: é o escopo priorizado." en: "An MVP (minimum viable product) is the smallest version of the product that already solves the main problem for real users: the minimum needed to prove the idea. What goes in and what waits until later is decided with you before development: that's the prioritized scope." es: "Un MVP (producto mínimo viable) es la versión más pequeña del producto que ya resuelve el problema principal para usuarios reales: lo mínimo para demostrar la idea. Qué entra y qué queda para después se decide contigo antes del desarrollo: es el alcance priorizado." Registrar em `services._notes.faq_composition`, no COPY (~linha 1260) e no 08:100 | "produto mínimo viável" passa a existir na página e no FAQPage, sem seção nova (F38) | P |
| **S03-6** | Sustentação tem 3 perguntas e não responde NDA nem propriedade do código, já confirmados | `src/components/services/kit/service-faq.ts:96-103`, `support`: `{ cond: "nda" }` e `{ cond: "code_ownership" }` logo depois de `{ own: "price" }`. Atualizar `services._notes.faq_composition` e `tests/unit/pages-faq.test.ts` | +~70 palavras aprovadas por idioma; objeção de acesso ao sistema no ar respondida | P |
| **S07-8** | `/en/how-we-work` e `/en/pricing` não usam "time and materials", o termo da SERP de "fixed price" | `en.json:575`: "Is the price fixed, or time and materials (billed by the hour)?" (63). Entre os parágrafos de `en.json:236` e `:237`: "Billing by the hour (time and materials) avoids the guess, but leaves an open-ended budget with you." Testar o bloco a 360 px | Casa com a intenção comparativa da SERP em en sem página nova | P |
| **S05-5** | O FAQ "Quanto custa um projeto de software?" abre com "Depende" (resto da F08) | `faq.items.how_much.answer` (pt.json:643): "O preço sai fechado, por escrito, antes do desenvolvimento, e acompanha principalmente o tamanho do escopo, as integrações com outros sistemas e as plataformas (web, iOS, Android). O diagnóstico e a Sprint de Descoberta, quando necessária, são gratuitos. Tem um valor em mente? Indique a faixa no pedido de diagnóstico." en/es equivalentes. `faq.items.how_long.answer` (pt.json:648) abre por "O prazo sai fechado antes do desenvolvimento, junto com o preço, e depende do escopo." Opcional, `pricing.factors.intro` (pt.json:494): "…Estes são os 7 fatores que mais pesam:" | Resposta direta, citável e coerente com a meta description ("Os 7 fatores…") | P |
| **S02-3 · S05-4** | Organization sem `areaServed` e idiomas, apesar da D31 | `seo.ts:86-115`: `SeoFlags` ganha `atendeExterior` e `outrasCidades` (passados por `SEO.astro:57`). Com `atendeExterior`: `areaServed: "Worldwide"` e `knowsLanguage: ["pt-BR","en","es"]`; só com `outrasCidades`: `areaServed: { "@type": "Country", "name": "BR" }`. Sem telefone. Atualizar o comentário `seo.ts:11`, o teste `seo.test.ts:60` (hoje proíbe `areaServed`), `BLUEPRINT.md:175` e a nota `services._notes.jsonld` | Coerência do grafo com "atendemos o mundo todo"; ganho de ranking não documentado | P |
| **S07-10** | Integrações não cita API, webhook, sistema sem API nem IoT, os subtemas da cauda | `services.integrations.examples[0].text` (pt.json:1115): "ERP e e-commerce, por exemplo: pedido, estoque e nota fiscal passam de um para o outro sem redigitação, por API ou webhook; quando um sistema não tem API, às vezes por troca de arquivos." Novo exemplo: título "Sensores e equipamentos conectados ao sistema", texto "Máquinas, sensores e dispositivos enviando dados para um painel ou aplicativo, como na contagem de produção em tempo real." (apoiado nos cases de indústria). en/es equivalentes | Casa com "via api", "webhooks", "legados" e "indústria 4.0" sem afirmar fato novo | P |
| **S03-8** | O texto en não usa "discovery phase", termo com SERP comercial; a Sprint não aponta para a prova | `en.json:384`: "The Discovery Sprint (known elsewhere as product discovery or a discovery phase) replaces the guess with a fixed price for a written scope, at no cost to you." Depois de "O que você recebe", linha com link para `/cases` (chave nova): pt "Veja nos cases como a Descoberta entrou em projetos reais."; en "See in our cases how Discovery fit into real projects."; es "Mira en los casos cómo el Sprint de Descubrimiento entró en proyectos reales.". Não afirmar que a Descoberta desses projetos foi gratuita | Cobre a variante en com demanda; liga oferta e prova | P |
| **S01-3** | 58 URLs de case em en/es com slug em português | **Só se couber antes do lançamento.** `caseSchema` ganha `slugUrl: slug.optional()` por idioma; `CaseItem` ganha `urlSlug` e **mantém** `slug` (pt) como chave de `relacionados`, `caseSlug` e `?ref=`; os 8 `urlFor("case")` passam a usar `urlSlug`; `CaseView` passa `alternates` por idioma e `paramsByLocale` ao seletor de idioma; o sitemap devolve `links: []` para cases (o hreflang do HTML basta). Atualizar `schemas.ts:189/:330`, CONTRACT.md:246, 00:430, 09:241 e os testes. Se não couber: registrar no BLUEPRINT §9 que os cases são exceção | Pequeno (no celular o Google mostra só o domínio); a janela barata fecha no lançamento | M |

### Próximo — 30 a 90 dias

| Chave | Problema | Recomendação exata | Impacto esperado | Esforço |
|---|---|---|---|---|
| **S04-4** | Não há uma visão única das fontes de link nem regra para o link do parceiro | Novo **08 §6 "Links de referência"**, só apontando o que já existe: Perfil da Empresa (08 §3, quinzena 2), Página do LinkedIn (12 §6, quinzena 3), README do GitHub (D35 a, antes do dia 0), Medium com canonical (12 §7, quinzena 5), Clutch/GoodFirms (08 §4, quinzena 4), listas (08 §5), parceiros (12 §3), eventos (12 §4). Planilha do 08 §5 com as colunas `tipo` e `rel(follow\|nofollow\|ugc\|sponsored)`. No 12 §3, depois do "Kit do parceiro": "Menção no site do parceiro (opcional, nunca cláusula do acordo): peça uma linha com o que a Lemamon.dev faz e um link simples para https://lemamon.dev/, sem UTM. Como o parceiro recebe comissão, não condicione a comissão ao link; se o link fizer parte do programa, ele leva `rel=\"sponsored\"`." Proibido: comprar link, PBN, troca em massa, patrocinado sem `sponsored` | Links editoriais medidos sem risco de política de spam | P |
| **S04-7 · S07-3** | O 08 §4 não diz o que fazer quando preço-hora e projeto mínimo são opcionais | D23 (15:33), proposta: "Não publicar preço-hora nem projeto mínimo (projeto mínimo é um 'a partir de', que o site critica em `how_we_work.comparison.rows.price.without`). Campo opcional: deixar em branco e aceitar ficar fora dos filtros de preço. Campo obrigatório: não criar o perfil, ou registrar exceção." `08:157`: acrescentar a mesma regra. No 08 §4, item "O que esperar": o link do perfil no Clutch é nofollow e o Softdex grátis não passa autoridade; o ganho é prova social e visita de referência (UTM `utm_source=clutch\|goodfirms\|softdex&utm_medium=referral&utm_campaign=diretorio`) | Diretórios sem quebrar a política de preço | P |
| **S03-1 · S05-2** | Quando o time for publicado, `/sobre` sai sem JSON-LD de pessoa | Código inerte até `hasTeam`: `seo.ts:164` emite, para `about`, um `Person` por pessoa com `atuaEmProjetos` (`@id` `https://lemamon.dev/sobre#<id>`, `name`, `jobTitle`, `image`, `sameAs` pessoal, `worksFor: {"@id":"https://lemamon.dev/#organization"}`); a Organization ganha `founder`/`employee` por `@id`; caso de teste em `seo.test.ts` sem time | Entidade pessoa ligada à empresa assim que o dono preencher | P |
| **S03-10** | O teto de 9 perguntas corta perguntas próprias dos serviços (`store_publishing`, `start_with_part`, `need_tech_knowledge`, `what_is_mvp`, `after_mvp`) | `capFaq` já aceita `max` (`src/components/shared/faq.ts:225`): passar 11 nas páginas de serviço e manter 9 nas demais. Atualizar `services._notes.faq_composition` e o BLUEPRINT §6.5. É regra de UX: **passa pelo dono** | Texto próprio de cauda longa volta às páginas de serviço | P |
| **N-blog** (S07-11, S03-13, clusters) | Pauta do 12 §7 com keyword sem sinal e um title igual ao de concorrente | No 12a e no 12 §7: `seoTitle` de `sistema-pronto-ou-sob-medida` → "Sistema pronto, sob medida ou integrar?" (39); no post `preco-fechado-ou-por-hora`, H2 "Escopo fechado ou aberto: o mesmo debate com outro nome" e "escopo fechado" na `seoDescription`; post 7 com a keyword "transformar planilha em sistema" (evitar "como sair da planilha do excel", SERP de tutorial); post 8 com "integração erp e commerce" num H2; propor ao dono trocar o post 5 por "Tenho uma ideia de aplicativo: e agora?" (ver (e)). Toda troca de título com volume real passa pelo BLUEPRINT (08 §2) | Cada post mira uma consulta com sinal e não copia concorrente | P |
| **S05-11** | Na troca de site, o Bing (que alimenta o Copilot e parte do ChatGPT search) não é avisado | Chave IndexNow em `public/<chave>.txt`; num plugin `onSuccess` do Netlify, só com `CONTEXT=production`, POST para `https://api.indexnow.org/indexnow` com as URLs do `sitemap-0.xml` | Recoleta mais rápida no Bing | M |
| **N-revisão** (D37, S07-16, S06-3, S04-6) | Várias decisões de title ficaram para quando houver dado | Revisão do dia 60 e do 90 ([13](../playbooks/13-kpis-e-rituais.md) §7), com Keyword Planner e Search Console: title da Home (D37); "Desenvolvimento de aplicativos em São Paulo \| Lemamon.dev" (57) se a busca local ganhar; `/quanto-custa` "Quanto custa um software sob medida? \| Lemamon.dev" (50) só se ganhar de "desenvolvimento de um sistema/aplicativo"; Home × `/sobre`; consultas "lemamon" e "lemon"; páginas com impressão e sem clique | Troca de title com dado, não com palpite | P |

### Depende do dono

| Chave | O que falta | Recomendação exata | Impacto esperado | Esforço |
|---|---|---|---|---|
| **Volumes (B310)** | Conta do Google Ads concluída | Terminar a conta sem campanha (modo especialista) e rodar as duas listas do 08 §2 + os clusters de prioridade alta de (b), Brasil e estado de SP, 12 meses | Destrava toda decisão de title e de pauta | P |
| **S02-1 · S04-2 · S04-6** | Confirmar que `https://www.linkedin.com/company/lemamondev` é a Página oficial e o slug definitivo (o LinkedIn só deixa trocar a cada 30 dias) | `dados/dono.json:41`: `"linkedin": { "url": "https://www.linkedin.com/company/lemamondev", "publicar": true }`. Atualizar `seo.test.ts:57`, `shared-render.test.ts:123`, `tests/fixtures/owner-data.ts:118`, `dados-validacao.test.ts:82`, BLUEPRINT.md:31, 00:46 e :254, 07:502. `shared.profiles.linkedin.text` (linha 2365): agora "A página da Lemamon.dev no LinkedIn." (en "Our company page on LinkedIn."; es "La página de Lemamon.dev en LinkedIn."). Na AUDITORIA-LINKEDIN, trocar `/company/lemamon` (dá 404) por `/company/lemamondev` (linhas 53, 69, 138, 141, 374, 1188). Na Página: Sede "São Paulo, SP, Brasil", Especialidades e 1 post. Depois do deploy, encerrar `/in/lemamon-dev` (ação 17) | Organization ligada à Página, que linka de volta para o site | P |
| **S05-3 · S04-5 · S03-11 · S02-11** | Perfis vazios no `sameAs` | GitHub, Settings › Profile: Name "Lemamon.dev", URL https://lemamon.dev, Location "São Paulo, SP, Brasil", descrição de `meta.organization_description` (en); repositório `lemamon-dev/.github` com `profile/README.md` (D35 a); verificação do domínio opcional. Medium: `publicar: false` (D35 b). Decidir a D01 e aplicar em `seo.ts:81`: `PROFILE_IDS.filter((id) => perfis[id].publicar).map((id) => perfis[id].url)` | O `sameAs` só declara perfil com conteúdo | P |
| **S02-2 · S03-2 · S04-9** | Setor e porte reais de `painel-interativo-com-animacoes` | Preencher as linhas 4–5 dos 3 MDX e o 09a:47; fechar o [PREENCHER] da D45. Se não vier até o deploy: `publicado: false` nos 3 idiomas (os relacionados se recompõem sozinhos) e registrar "28 no ar" na D45. No mesmo commit, a trava em `schemas.ts:416` (`superRefine`): com `data.publicado`, recusar setor/porte que case com `/\b(?:a confirmar\|to be confirmed\|por confirmar)\b/i` | Placeholder fora de 15 superfícies | P |
| **S03-1 · S05-2** | Uma pessoa real | `dados/dono.json › time[0]` (nome, foto real, papel e linha nos 3 idiomas, `linkedin: https://www.linkedin.com/in/lemamon`, `atuaEmProjetos: true`), `empresa.responsavel` e `empresa.apresentacao`. Isso libera `/sobre`, o `Person` e o autor do blog (B298). Antes, reescrever o perfil `/in/lemamon` (AUDITORIA-LINKEDIN) | E-E-A-T e o blog destravados | P (dono) |
| **S07-2** | Publicar ou não faixas próprias | Pergunta ao dono, como revisão da decisão 3 e não como atalho: "Preencher `dados/dono.json › precos` (00 §B7), pelo menos sistemas e aplicativos, depois da conta do playbook 02 §3?" Isso liga `ranges` em `/quanto-custa` e o bloco de investimento nos serviços, sem copy nova. Se não: `/quanto-custa` é página de conversão e de régua, e não vai ranquear para "quanto custa" (nada de link building para ela). Nunca faixas de concorrentes com link | O único caminho para o cluster pt mais acessível | P (decisão) |
| **S04-1** | Elegibilidade do Perfil da Empresa | No 08 §3, antes do passo 1, o passo 0: "O Google só aceita empresa com contato presencial com clientes no horário informado, na sede ou indo até o cliente. Responda `confirmacoes.formatoDiagnostico` (00 §273) ou confirme reuniões na sede do cliente em São Paulo. Se todo o atendimento for por vídeo ou telefone, não crie o perfil." `08:117`: "Área de serviço: São Paulo, SP, e, se você atende presencialmente lá, municípios da Grande SP (até 20 áreas, a no máximo ~2 h de carro). Mesmo com `outrasCidades` e `atendeExterior` = true (D31), não inclua outros estados, 'Brasil' nem países." `08:114`: "Categoria principal: Empresa de software (Software company). Não existe 'desenvolvedor de software'." | Evita perfil suspenso | P |
| **S07-3 · S04-7** | Avaliações e D23 | Decidir a D23 (texto em "Próximo"). Avaliação da Lemamon.dev só de cliente de projeto da Lemamon.dev: os 29 cases são de 2016–2021 (D45) e sem termo; pedir avaliação por eles deturpa a relação. Exceção só com o período e o vínculo reais. Meta: 3 avaliações verificadas no Clutch → candidatura à lista da Mind Group na revisão trimestral seguinte | Entrada nas listas que ocupam a SERP | M |
| **S04-8** | Ano de fundação | Manter `empresa.anoFundacao = null` (preencher acende "Ano de fundação" em `/sobre` e `foundingDate`, e expõe o que a D45(5) evitou). LinkedIn: campo vazio. Diretório que exigir: 2026, a data do cartão CNPJ (abertura em 20/10/2026 na ReceitaWS) | Coerência entre fontes sem contradizer a D45 | P |
| **S03-3 (B)** | Desafio e decisões de cada case | Campos opcionais `desafio` (≤ 400) e `decisoes` (2–3 itens ≤ 200, "escolhemos X porque Y") em `caseSchema`, renderizados em `CaseArticle.astro` entre "O que foi entregue" e "Como foi". `papel` e resultado só com alteração registrada da D45 | Experiência em primeira mão nos cases | M |
| **S03-5** | Que cases tiveram sustentação ou MVP | 2–3 cases com sustentação longa e fatos concretos: reescrever a etapa `support` e acrescentar `"support"` em `servicos` (nunca como 1ª tag). `"mvp"` só se o projeto foi a 1ª versão de um produto novo | Liga a seção de cases em `/servicos/sustentacao` (e talvez MVP) | P |
| **S03-9** | Custos que continuam depois do lançamento | FAQ novo em `/quanto-custa`, `faq.items.running_costs`: pt "Depois que o software entra no ar, ainda tem custo?" / "Pode ter. Além da sustentação e evolução contínua, se você quiser, com valor combinado antes de começar, o software no ar costuma usar serviços de terceiros: servidor e banco de dados, domínio, serviços cobrados por uso (envio de e-mail e SMS, mapas, IA) e, num aplicativo, as contas de desenvolvedor das lojas. Quais deles o seu projeto usa fica escrito antes do desenvolvimento." Precisa do OK do dono diante da nota `pricing._notes.single_value` | Responde a dúvida "quanto custa manter" sem número | P |
| **S07-10 (3)** | Plataformas que o time já integrou de fato | Só nomes confirmados, na resposta de `integrate_existing` (pt.json:1180): "Já integramos, por exemplo, [NOMES CONFIRMADOS]." Lista própria por idioma | Casa com "integração erp + [plataforma]" | P |
| **S03-12 · S07-8** | Fuso e horário (D31: "fora do site") e o rótulo "nearshore" | Quando definir: acrescentar a `answer_with_abroad` (en.json:739) "São Paulo is on UTC-3 year-round, 1 to 2 hours ahead of US Eastern Time." (72) e a sobreposição de horário. Não usar "nearshore" em title ou H1 nem criar `/en/nearshore` | Atende a pergunta nº 1 do comprador americano | P |
| **S05-8** | Mostrar "{n} cases" contraria a regra COPY.md:72 ("não cita número de projetos") | Se o dono abrir a exceção para a contagem de cases publicados, calculada no build: `shared.see_all_cases` "Ver os {n} cases" (en "See all {n} case studies"; es "Ver los {n} casos") e `cases.hub.intro` "{n} projetos do portfólio, identificados por setor e porte, sem o nome do cliente. …" Sem período nem "anos de experiência" | Número citável por motores de IA | P |
| **S04-11** | Variantes livres do domínio | Registrar `lemamon.com.br` e `lemamon.com` com 301 para https://lemamon.dev/; consultar a marca "Lemamon.dev" no INPI (classe 42) | Defesa contra typosquatting | P |
| **S07-15 · S03-6** | `confirmacoes.sistemaTerceiros` é `false` | Se o dono confirmar que assume sistema de outro fornecedor: ligar a flag (o FAQ `third_party_system` já existe) e, depois, o post "Desenvolvedor sumiu: como retomar o seu sistema" (47). Vocabulário "manutenção corretiva/evolutiva" só com exceção à regra de jargão (BLUEPRINT §5.9 e "Persona e linguagem"), numa frase só, em `services.support.faq.support_vs_evolution.answer` | Cauda de compra de sustentação | P |
| **es-home** | Praça no title es | Opção por analogia com a D37: `es.json:2027` "Desarrollo de software a medida en Brasil \| Lemamon.dev" (55), coerente com "desarrollo de software en brasil" (sugestão exata) e com o público de fora | Única cauda es viável | P (decisão) |
| **S05-9** | Política para rastreadores de IA | Registrar no 15: busca e respostas de IA com link liberadas; treino liberado de propósito (marca nova). O `robots.txt` atual já faz isso (`User-agent: *` / `Allow: /`) | Evita bloquear por engano um bot de busca | P |

### Polimento — baixos, quando der

| Chave | Recomendação | Esforço |
|---|---|---|
| S01-4 | `netlify.toml`, antes das regras de 404 por idioma (linha 135): 301 com `force = true` de `/contact` → `/contato`, `/quote` → `/orcamento`, `/Diagnostico` → `/orcamento`, `/servicos/sistema-web` → `/servicos/sistemas-web`, `/en/projects` → `/en/quote`, `/es/projects` → `/es/cotizacion`, `/sitemap.xml` → `/sitemap-index.xml` (fecha o F90) | P |
| S01-5 | Opcional: 301 de `/index.html`, `/en/index.html` e `/es/index.html` para a raiz de cada idioma; o canonical já resolve | P |
| S01-6 | `lastmod` só com data verdadeira: campo `atualizadoEm` opcional no `caseSchema` e no `serialize` do sitemap (`astro.config.mjs:79-83`); nunca a data do build | P |
| S01-7 | Registrar no 08 §1 que ~780 URLs do wizard com query (`?origem=`, `?servico=`) aparecem como "Página alternativa com tag canônica adequada"; é esperado | P |
| S01-8 | IDs de âncora localizados em en/es (`#development`, `#desarrollo`…) com alias vazio do id pt (fecha o F71) | M |
| S01-9 | Decisão do dono: hreflang `pt` em vez de `pt-BR` (`locales.ts:24`) e `x-default` para en (`routes.ts:337`) | P |
| S01-10 | `SEO.astro:63`: "index, follow, max-image-preview:large" | P |
| S02-7 | `websiteNode()` (`seo.ts:118-126`): mesmo nó nas 3 Homes, `url: "https://lemamon.dev/"` e `inLanguage: ["pt-BR","en","es"]` | P |
| S02-9 | Atualizar 08 §3 passo 6 e BLUEPRINT §10.3: não esperar FAQ no Rich Results Test nem no Search Console (rich result de FAQ descontinuado) | P |
| S02-13 | `BlogPostView.astro:62`: `publisher: { "@id": ORGANIZATION_ID }` e `isPartOf: { "@id": WEBSITE_ID }` | P |
| S03-14 | Política de Privacidade promete "a data no topo" e não mostra data: preencher `privacidade.atualizadaEm` depois da revisão jurídica, ou tirar a frase (depende do dono) | P |
| S05-10 | `llms.txt` opcional, gerado do i18n por `src/pages/llms.txt.ts`, sem texto que envelheça; não gerar com a camada fictícia. Abaixo de todo o resto | P |
| S05-12 | Opcional: flag `schema: false` nas perguntas compartilhadas, marcando no FAQPage só a página dona (`/como-trabalhamos` e `/quanto-custa`) | P |
| S06-10 | Âncoras internas: `price_factors_link` (linha 868) "Quanto custa um software sob medida"; `see_how_we_work` (2192) "Ver como funciona o desenvolvimento com preço fechado"; en/es equivalentes | P |
| S06-11 | Descriptions do wizard sem repetir o title: pt.json:2068 "Responda 6 perguntas sobre o seu projeto, veja o que pesa no prazo e no preço e peça o diagnóstico gratuito de 45 minutos." (122); en/es em (d) | P |
| S06-12 | Description do hub de cases com os setores, sem o número (COPY.md:72): ver (d) | P |
| S07-14 | Não produzir conteúdo novo em es no semestre; manter páginas e hreflang | — |
| Sprint (resto de S06-7) | Opcional: description da Sprint dizendo "só quando necessária" (D44), ver (d) | P |
| Case gás | `app-do-revendedor-de-gas` pt: `seoTitle` "Aplicativo para revenda de gás" (title de 44), sugestão exata no autocomplete | P |
| S02-8 | **Não fazer:** ContactPage, CollectionPage e CreativeWork nos cases (nenhum rich result; risco de anonimato da D45, ver S05-4 e S02-4) | — |
| S04-10 · S02-12 · S06-13 · S07-13 · S07-16 | Já incorporados: em S02-3, D9/S03-1, S01-3, S03-8 (title da Sprint mantido) e na revisão do dia 60 | — |

---

## (d) Titles e descriptions propostos para todas as páginas

Contagem de caracteres com a marca. "Manter" quer dizer que a verificação não achou motivo para trocar: o excesso de 60 cai sobre a marca (S06-1, refutado) e a marca já aparece no nome do site acima do resultado. Linhas do i18n: a mesma em pt, en e es (title na linha indicada, description na seguinte).

### Português (`src/i18n/pt.json`)

| Página · chave (linha) | Title atual (car.) | Title proposto (car.) | Description atual (car.) | Description proposta (car.) |
|---|---|---|---|---|
| `/` · `meta.home` (2027) | Desenvolvimento de software sob medida, São Paulo \| Lemamon.dev (63) | Manter (D37/D43; rever aos 60 dias) | Software sob medida: sistemas, apps, integrações e MVPs com escopo, prazo e preço fechados antes de construir. Peça o diagnóstico gratuito de 45 minutos. (153) | Manter (S07-4 refutado) |
| `/como-trabalhamos` · `how_we_work` (2031) | Desenvolvimento de software com preço fechado \| Lemamon.dev (59) | Manter | Escopo, prazo e preço fechados antes de construir o seu software. Diagnóstico de 45 min e Sprint de Descoberta gratuitos; entregas a cada 2 semanas. (148) | Manter |
| `/sprint-de-descoberta` · `discovery_sprint` (2035) | Sprint de Descoberta: do problema ao preço fechado \| Lemamon.dev (64) | Manter (S03-8) | O seu problema vira escopo priorizado e plano com prazo e preço fechados. Discovery de produto gratuito, feito após o diagnóstico de 45 minutos. (144) | Opcional: O seu problema vira escopo priorizado e plano com prazo e preço fechados. Discovery de produto gratuito, quando o diagnóstico mostra que é preciso. (147) |
| `/servicos` · `services_hub` (2039) | Serviços de desenvolvimento de software \| Lemamon.dev (53) | Manter | Serviços de desenvolvimento de software: sistemas web, apps, integrações, MVPs e sustentação, com escopo, prazo e preço combinados antes de começar. (148) | Manter |
| `/servicos/sistemas-web` (2043) | Desenvolvimento de sistemas para empresas \| Lemamon.dev (55) | **Desenvolvimento de sistemas web para empresas \| Lemamon.dev (59)** | Desenvolvimento de sistemas sob medida para empresas: ERP, CRM, painéis e portal do cliente, com escopo, prazo e preço fechados antes de construir. (147) | **Desenvolvimento de sistemas web sob medida para empresas: ERP, CRM, painéis e portal do cliente, com escopo, prazo e preço fechados antes de construir. (151)** |
| `/servicos/aplicativos` (2047) | Desenvolvimento de aplicativo sob medida \| Lemamon.dev (54) | **Desenvolvimento de aplicativos sob medida \| Lemamon.dev (55)**; depois do Keyword Planner, talvez "Desenvolvimento de aplicativos em São Paulo \| Lemamon.dev" (57) | Desenvolvimento de aplicativo sob medida para empresas, no iOS e no Android: escopo e preço fechados antes de construir e entregas a cada 2 semanas. (148) | **Desenvolvimento de aplicativos sob medida para empresas, no iOS e no Android: escopo e preço fechados antes de construir e entregas a cada 2 semanas. (149)** |
| `/servicos/integracoes` (2051) | Integração de sistemas e automação de processos \| Lemamon.dev (61) | Manter | Integração de sistemas e automação com escopo, prazo e preço fechados antes do desenvolvimento: ERP, e-commerce, pagamento e CRM trocando dados. (144) | Manter |
| `/servicos/mvp` (2055) | Desenvolvimento de MVP com prazo e preço fechados \| Lemamon.dev (63) | Manter | Desenvolvimento de MVP para startups: a primeira versão do produto nas mãos de usuários reais, com prazo e preço fechados e entregas a cada 2 semanas. (150) | Manter |
| `/servicos/sustentacao` (2059) | Manutenção de software: sustentação e evolução \| Lemamon.dev (60) | Manter | Manutenção e sustentação de sistemas: correções, atualizações e novas funcionalidades para o software no ar, na prioridade combinada com você. (142) | Manter (tem a primária "sustentação de sistemas") |
| `/quanto-custa` · `pricing` (2063) | Quanto custa desenvolver um sistema ou aplicativo? \| Lemamon.dev (64) | Manter (S06-3 refutado); alternativa só com dado: "Quanto custa um software sob medida? \| Lemamon.dev" (50) | Os 7 fatores que mais pesam no preço de um sistema ou aplicativo, como comparar orçamentos e como ter o preço fechado antes de desenvolver. (139) | Manter |
| `/orcamento` · `quote` (2067) | Orçamento de software: diagnóstico gratuito \| Lemamon.dev (57) | Manter (primária do BLUEPRINT) | Orçamento de desenvolvimento de software: em 6 perguntas, veja o que pesa no prazo e no preço do seu caso e peça o diagnóstico gratuito de 45 minutos. (150) | Responda 6 perguntas sobre o seu projeto, veja o que pesa no prazo e no preço e peça o diagnóstico gratuito de 45 minutos. (122) |
| `/orcamento/enviado` · `quote_sent` (2071) | Pedido recebido \| Lemamon.dev (29) | Manter (`noindex`) | Seu pedido de diagnóstico gratuito chegou à Lemamon.dev. Veja o que acontece agora e como aproveitar os 45 minutos de conversa. (127) | Manter |
| `/contato` · `contact` (2075) | Contato \| Lemamon.dev · software sob medida em São Paulo (56) | **Contato \| Lemamon.dev (21)** | Contato da Lemamon.dev: WhatsApp, e-mail e um formulário curto. Para projeto novo, comece pelo diagnóstico gratuito de 45 minutos, com devolutiva por escrito. (158) | **Contato da Lemamon.dev: WhatsApp, e-mail e formulário curto. Projeto novo? Comece pelo diagnóstico gratuito de 45 minutos, com devolutiva por escrito. (150)**; `description_no_whatsapp` (148): manter |
| `/cases` · `cases_hub` (2080) | Cases de desenvolvimento de software \| Lemamon.dev (50) | Manter | Projetos de software sob medida: o problema de cada cliente, o que foi combinado, o que foi entregue e, quando o cliente autoriza, o resultado. (143) | Cases de software sob medida em indústria, varejo, educação, saúde e setor público: o problema do cliente, o que foi combinado e o que foi entregue. (148) |
| `/sobre` · `about` (2088, gated) | Lemamon.dev: desenvolvimento de software em São Paulo (53) | Manter (BLUEPRINT §3.1) | Quem faz a Lemamon.dev, empresa de desenvolvimento de software em São Paulo, SP, e por que a gente combina escopo, prazo e preço antes de construir. (148) | Manter |
| `/blog` · `blog_hub` (2092, gated) | Blog: como contratar e avaliar software \| Lemamon.dev (53) | Manter | Artigos escritos por quem constrói software, para quem vai contratar um projeto e para quem precisa avaliá-lo tecnicamente. (123) | Manter |
| `/privacidade` · `privacy` | Política de Privacidade \| Lemamon.dev (37) | Manter | Como a Lemamon.dev trata os dados que você informa nos formulários e os dados de navegação do site, e como exercer os seus direitos pela LGPD. (142) | Manter |
| 404 · `not_found` | Página não encontrada \| Lemamon.dev (35) | Manter (`noindex`) | Esta página não existe ou mudou de endereço. Veja os caminhos para os serviços, o método e o diagnóstico gratuito da Lemamon.dev. (129) | Manter |

### Inglês (`src/i18n/en.json`)

| Página (linha) | Title atual (car.) | Title proposto | Description atual (car.) | Description proposta (car.) |
|---|---|---|---|---|
| `/en/` (2027) | Custom software development in São Paulo, Brazil \| Lemamon.dev (62) | Manter | Custom software: web and mobile apps, integrations and MVPs with scope, timeline and price fixed before we build. Request a free 45-minute assessment. (150) | Manter |
| `/en/how-we-work` (2031) | Fixed-price software development \| Lemamon.dev (46) | Manter | Scope, timeline and price fixed before we build: a free 45-min assessment and a free Discovery Sprint. Then working software every 2 weeks. (139) | Manter |
| `/en/discovery-sprint` (2035) | Discovery Sprint: from problem to fixed price \| Lemamon.dev (59) | Manter | Turn your problem into a prioritized scope and a plan with a fixed timeline and price. Free product discovery, after a 45-minute assessment. (140) | Opcional: Turn your problem into a prioritized scope and a plan with a fixed timeline and price. Free product discovery, when the assessment shows it's needed. (149) |
| `/en/services` (2039) | Software development services for businesses \| Lemamon.dev (58) | Manter | Software development for businesses: web and mobile apps, integrations and MVPs, with scope, timeline and price fixed up front and support after launch. (152) | Manter |
| `/en/services/web-systems` (2043) | Custom web application development for businesses \| Lemamon.dev (63) | Manter | Custom web application development: ERP, CRM, dashboards and customer portals built around your processes, with scope, timeline and price fixed up front. (153) | Manter |
| `/en/services/mobile-apps` (2047) | Custom mobile app development for businesses \| Lemamon.dev (58) | Manter | Custom mobile app development for your business on iOS, Android or both. Scope and price fixed before we build, then working software every 2 weeks. (148) | Manter |
| `/en/services/integrations` (2051) | System integration and process automation \| Lemamon.dev (55) | Manter | System integration and automation with scope, timeline and price fixed before development: ERP, online store, payments and CRM syncing data. (140) | Manter |
| `/en/services/mvp` (2055) | MVP development with a fixed timeline and price \| Lemamon.dev (61) | Manter | MVP development for startups: the first version of your product in real users' hands, with a fixed timeline and price, and working software every 2 weeks. (154) | Manter |
| `/en/services/support-and-evolution` (2059) | Software maintenance and continuous improvement \| Lemamon.dev (61) | Manter | Software maintenance and continuous improvement: bug fixes, updates and new features for a system that's already live, prioritized with you. (140) | Manter |
| `/en/pricing` (2063) | How much does custom software or an app cost? \| Lemamon.dev (59) | Manter | The 7 factors that drive the price of custom software or an app, how to compare quotes and how to get a fixed price before development starts. (142) | Manter |
| `/en/quote` (2067) | Software development quote: free assessment \| Lemamon.dev (57) | Manter | Software development quote: answer 6 questions, see what drives the timeline and price of your project, then request a free 45-minute assessment. (145) | Answer 6 questions about your project, see what drives the timeline and price, then request a free 45-minute assessment. (120) |
| `/en/quote/sent` (2071) | Request received \| Lemamon.dev (30) | Manter (`noindex`) | (122) | Manter |
| `/en/contact` (2075) | Contact Lemamon.dev \| Custom software in São Paulo, Brazil (58) | **Contact \| Lemamon.dev (21)** | Reach Lemamon.dev on WhatsApp, by email or through a short form. For a new project, start with the free 45-minute assessment, with written feedback. (148) | Manter |
| `/en/cases` (2080) | Software development case studies \| Lemamon.dev (47) | Manter | Custom software projects: each client's problem, what was agreed, what was delivered and, when the client allows it, the result. (128) | Custom software projects in manufacturing, retail, education, health and the public sector: each client's problem, what was agreed and what was delivered. (154) |
| `/en/about` (2088, gated) | Lemamon.dev: software development company in São Paulo, Brazil (62) | Manter | Who's behind Lemamon.dev and why we agree on scope, timeline and price before we build. Custom software from São Paulo, Brazil. (127) | Manter |
| `/en/privacy` | Privacy Policy \| Lemamon.dev (28) | Manter | (140) | Manter |
| `/en/404` | Page not found \| Lemamon.dev (28) | Manter | (103) | Manter |

### Espanhol (`src/i18n/es.json`)

| Página (linha) | Title atual (car.) | Title proposto | Description atual (car.) | Description proposta (car.) |
|---|---|---|---|---|
| `/es/` (2027) | Desarrollo de software a medida en São Paulo \| Lemamon.dev (58) | Decisão do dono: "Desarrollo de software a medida en Brasil \| Lemamon.dev" (55) | Software a medida: sistemas, apps, integraciones y MVP con alcance, plazo y precio cerrados antes de construir. Pide tu diagnóstico gratuito de 45 minutos. (155) | Manter |
| `/es/como-trabajamos` (2031) | Desarrollo de software a precio fijo \| Lemamon.dev (50) | Manter ("llave en mano" não tem sinal suficiente) | Alcance, plazo y precio cerrados antes de construir: diagnóstico de 45 min y Sprint de Descubrimiento gratuitos, y entregas cada 2 semanas. (139) | Manter |
| `/es/sprint-de-descubrimiento` (2035) | Sprint de Descubrimiento: plazo y precio cerrados \| Lemamon.dev (63) | Manter | Tu problema convertido en alcance priorizado y plan con plazo y precio cerrados. Product discovery gratuito, después del diagnóstico de 45 minutos. (147) | Opcional: Tu problema convertido en alcance priorizado y plan con plazo y precio cerrados. Product discovery gratuito, si el diagnóstico muestra que hace falta. (150) |
| `/es/servicios` (2039) | Servicios de desarrollo de software \| Lemamon.dev (49) | Manter | (148) | Manter |
| `/es/servicios/sistemas-web` (2043) | Desarrollo de sistemas web para empresas \| Lemamon.dev (54) | Manter | (147) | Manter |
| `/es/servicios/aplicaciones` (2047) | Desarrollo de aplicaciones móviles a medida \| Lemamon.dev (57) | Manter | (148) | Manter |
| `/es/servicios/integraciones` (2051) | Integración de sistemas y automatización \| Lemamon.dev (54) | Manter | (148) | Manter |
| `/es/servicios/mvp` (2055) | Desarrollo de MVP con plazo y precio cerrados \| Lemamon.dev (59) | Manter | (150) | Manter |
| `/es/servicios/soporte-y-evolucion` (2059) | Mantenimiento y evolución de software \| Lemamon.dev (51) | Manter | (151) | Manter |
| `/es/cuanto-cuesta` (2063) | ¿Cuánto cuesta desarrollar un software o una app? \| Lemamon.dev (63) | Manter | (149) | Manter |
| `/es/cotizacion` (2067) | Cotización de software: diagnóstico gratuito \| Lemamon.dev (58) | Manter | Cotización de software a medida: en 6 preguntas, descubre qué influye en el plazo y el precio de tu caso y pide el diagnóstico gratuito de 45 minutos. (150) | Responde 6 preguntas sobre tu proyecto, mira qué influye en el plazo y el precio y pide el diagnóstico gratuito de 45 minutos. (126) |
| `/es/cotizacion/enviada` (2071) | Solicitud recibida \| Lemamon.dev (32) | Manter (`noindex`) | (127) | Manter |
| `/es/contacto` (2075) | Contacto \| Lemamon.dev · software a medida en São Paulo (55) | **Contacto \| Lemamon.dev (22)** | Contacto de Lemamon.dev: WhatsApp, correo y un formulario breve. ¿Proyecto nuevo? Empieza por el diagnóstico gratuito de 45 minutos. (132) | Manter |
| `/es/casos` (2080) | Casos de desarrollo de software \| Lemamon.dev (45) | Manter | Proyectos de software a medida: el problema de cada cliente, lo que se acordó, lo que se entregó y, cuando el cliente lo autoriza, el resultado. (144) | Casos de software a medida en industria, comercio, educación, salud y sector público: el problema del cliente, lo que se acordó y lo que se entregó. (148) |
| `/es/nosotros` (2088, gated) | Lemamon.dev: empresa de desarrollo de software en São Paulo (59) | Manter | (121) | Manter |
| `/es/privacidad` | Política de privacidad \| Lemamon.dev (36) | Manter | (154) | Manter |
| `/es/404` | Página no encontrada \| Lemamon.dev (34) | Manter | (133) | Manter |

### Cases (title = `seoTitle` + " | Lemamon.dev"; descriptions de 103 a 151 caracteres, todas mantidas)

| Slug | pt (car.) | en (car.) | es (car.) | Proposta |
|---|---|---|---|---|
| app-android-para-placa-educativa | App Android para a placa Micro:bit (48) | Android app for the Micro:bit board (49) | App Android para la placa Micro:bit (49) | Manter |
| app-de-alertas-de-seguranca | Alertas de segurança da polícia local (51) | Safety alerts from the local police (49) | Alertas de seguridad de la policía local (54) | Manter |
| app-de-compra-de-gas | App de compra e entrega de gás (44) | Gas ordering and delivery app (43) | App de compra y entrega de gas (44) | Manter |
| app-de-contagem-de-veiculos | App Android que mede o fluxo de veículos (54) | Android app that measures vehicle flow (52) | App Android que mide el flujo vehicular (53) | Manter |
| app-de-saude-com-vestiveis | App de saúde com dispositivos vestíveis (53) | Health app with wearable devices (46) | App de salud con dispositivos vestibles (53) | Manter |
| app-do-revendedor-de-gas | App do revendedor de gás (38) | Gas reseller app (30) | App del revendedor de gas (39) | pt: "Aplicativo para revenda de gás" (44, polimento) |
| app-guia-turistico | App nativo Android de guia turístico (50) | Native Android tourist guide app (46) | App nativa Android de guía turística (50) | Manter |
| arquivos-de-auditoria-de-processos | Arquivos de auditoria de processos organizados (60) | Organized process audit files (43) | Archivos de auditoría de procesos organizados (59) | Manter (fundir ou diferenciar: dono) |
| controle-de-producao-com-contagem-automatica | Controle de produção com contagem automática (58) | Production control with automatic item counting (61) | Control de producción con conteo automático (57) | Manter |
| deteccao-de-descarga-estatica | Detecção de descarga estática na produção (55) | Static discharge detection in production (54) | Detección de descarga estática en la producción (61) | Manter |
| gestao-de-documentos-da-qualidade | Gestão de documentos da qualidade em auditorias (61) | Quality document management for audits (52) | Gestión de documentos de calidad en auditorías (60) | Manter (fundir ou diferenciar: dono) |
| jogo-de-plataforma-com-dois-herois | Jogo de plataforma com dois heróis ao mesmo tempo (63) | Platform game with two heroes at once (51) | Juego de plataformas con dos héroes a la vez (58) | Manter (corte só na marca) |
| jogo-educativo-sobre-emocoes | Jogo das emoções para crianças (44) | An emotions game for children (43) | Juego de emociones para niños (43) | Manter |
| jogo-multiplayer-de-arena | Jogo mobile multiplayer de gladiadores (52) | Multiplayer gladiator mobile game (47) | Juego móvil multijugador de gladiadores (53) | Manter |
| painel-de-controle-de-producao | Painel de controle de produção (44) | Production control dashboard (42) | Panel de control de producción (44) | Manter |
| painel-de-qualidade-do-ar | Painel de qualidade do ar em tempo real (53) | Real-time air quality dashboard (45) | Panel de calidad del aire en tiempo real (54) | Manter |
| painel-de-testes-automatizados | Testes automatizados na linha de produção (55) | Automated tests on the production line (52) | Pruebas automatizadas en la línea de producción (61) | Manter |
| painel-interativo-com-animacoes | Painel interativo com animações (45) | Interactive panel with animations (47) | Panel interactivo con animaciones (47) | Manter; setor e porte: dono |
| painel-para-pais-e-psicologos | Painel de jogo para pais e psicólogos (51) | Game dashboard for parents and psychologists (58) | Panel de juego para padres y psicólogos (53) | Manter |
| passagens-de-onibus-web-e-app | Passagens de ônibus pela web e pelo app (53) | Bus tickets on the web and in an app (50) | Pasajes de autobús por la web y por la app (56) | Manter |
| portal-de-noticias-de-tribunal | Nova página inicial do portal de um tribunal (58) | New homepage for a court's portal (47) | Nueva página de inicio del portal de un tribunal (62) | Manter |
| portal-escola-professores-e-pais | Sistema de gestão escolar com web e app (53) | School management system with web and app (55) | Sistema de gestión escolar con web y app (54) | Manter |
| seletores-de-produtos-para-varejo | Seletores de produtos para o varejo (49) | Product selectors for retail (42) | Selectores de productos para comercio minorista (61) | Manter |
| sensores-em-epis-com-app | EPIs vestíveis com sensores e app de monitoramento (64) | Wearable PPE with sensors and a monitoring app (60) | EPP vestibles con sensores y app de monitoreo (59) | Manter (corte só na marca) |
| site-de-estudo-de-caso-de-ia | Site de estudo de caso sobre IA e bullying (56) | Case study website on AI and bullying (51) | Sitio de estudio de caso sobre IA y bullying (58) | Manter |
| site-de-pre-lancamento-com-animacoes | Site de pré-lançamento com animações (50) | Pre-launch website with animations (48) | Sitio de prelanzamiento con animaciones (53) | Manter |
| site-institucional-com-cms | Site institucional com CMS em WordPress (53) | Company website with a WordPress CMS (50) | Sitio institucional con CMS en WordPress (54) | Manter |
| template-modular-para-site-de-marca | Template modular de site com Sitecore (51) | Modular website template on Sitecore (50) | Plantilla modular de sitio con Sitecore (53) | Manter |
| widget-de-qualidade-do-ar | Widget de qualidade do ar para sites (50) | Air quality widget for websites (45) | Widget de calidad del aire para sitios (52) | Manter |

---

## (e) Plano de conteúdo de 90 dias: os 10 primeiros artigos

**Como encaixa no [14](../playbooks/14-calendario-90-dias.md):** o blog só volta com 3 posts reais e autor real (B054, B298), na quinzena 5 (dias 61–75 depois do lançamento). Esse dia é o **D** do [12](../playbooks/12-canais-indicacao-linkedin-conteudo.md) §7, e a cadência é de 1 post a cada 15 dias (D36). **Dentro dos 90 dias saem os posts 1 a 4**; os posts 5 a 10 caem entre D+30 e D+105. A ordem é a do 12 §7 (o 12a numera os três primeiros de outro jeito; aqui vale o slug). Só pt-BR (BLUEPRINT §6.12). `seoTitle` ≤ 50 caracteres (`postSchema`); nenhum número além de 45 minutos e "a cada 2 semanas" (checklist B302).

| # | Data | Título de trabalho · `seoTitle` (car.) | Keyword e sinal | Intenção | Outline curto | URL | Link interno |
|---|---|---|---|---|---|---|---|
| 1 | D | Sistema pronto ou sob medida: como decidir · **"Sistema pronto, sob medida ou integrar?" (39)** (o title atual é igual ao de um concorrente) | sistema pronto ou sob medida · 0 sugestões; validar | comparação | Quando o pronto resolve · Quando vale construir · Perguntas para decidir · O caminho do meio: integrar · Como a Lemamon.dev ajuda a decidir | `/blog/sistema-pronto-ou-sob-medida` | `/servicos/sistemas-web` (`servico: "web_systems"`); o FAQ "Sistema sob medida ou software pronto?" passa a linkar o post |
| 2 | D | O que você deveria receber de uma Sprint de Descoberta · "O que receber de uma Sprint de Descoberta" (41) | sprint de descoberta (0 sugestões) + discovery de produto (9 sugestões) em H2 e na description; a primária sai do Keyword Planner | informacional | Por que existe uma etapa antes de construir · O que receber: problema entendido, escopo priorizado, plano com prazo e preço · Sinais de que a Descoberta não entregou · Onde você decide | `/blog/o-que-receber-de-uma-sprint-de-descoberta` | `/sprint-de-descoberta` (âncora "Sprint de Descoberta gratuita"), `/como-trabalhamos` |
| 3 | D | Preço fechado ou por hora: o que muda para quem contrata · "Preço fechado ou por hora em software" (37); alternativa com volume: "Escopo fechado ou por hora: o que muda" (38) | escopo aberto ou fechado / contrato escopo fechado (6 sugestões em "escopo fechado"); "preço fechado ou por hora" 0 | comparação | Por hora: você paga o tempo · Preço fechado: você paga um escopo escrito · Escopo fechado ou aberto: o mesmo debate com outro nome · O que perguntar em qualquer proposta · Como a Lemamon.dev trabalha | `/blog/preco-fechado-ou-por-hora` | `/como-trabalhamos`, `/quanto-custa#como-comparar`; nunca usar "desenvolvimento de software com preço fechado" no `seoTitle` |
| 4 | D+15 | Como escolher uma empresa de desenvolvimento de software · "Como escolher uma empresa de software" (37) ou "O que é software house e como escolher uma" (42), pela forma de maior volume (08 §2) | como escolher empresa de desenvolvimento de software (0) × o que é software house (sugere) | informacional | O que é uma software house (e o que não é) · Freelancer, software house ou time interno · As perguntas da régua · Sinais de alerta numa proposta · Como a Lemamon.dev responde a cada uma | `/blog/como-escolher-empresa-de-desenvolvimento-de-software` | `/quanto-custa#como-comparar` |
| 5 | D+30 | Entregas a cada 2 semanas: o que você deveria ver funcionando · "Entregas a cada 2 semanas: o que ver" (36). **Proposta ao dono:** trocar de lugar com o suplente "Tenho uma ideia de aplicativo: e agora?" (39), que tem sinal de busca e é a pergunta de entrada do Rafael | entregas quinzenais: sem sinal (serve E-E-A-T e o Marcos) | informacional | O que é uma entrega · O que ver funcionando · Como dar retorno · Quando parar e replanejar | `/blog/entregas-a-cada-2-semanas` | `/como-trabalhamos` |
| 6 | D+45 | Como escrever um escopo sem ser da área de TI · "Como escrever um escopo sem ser de TI" (37) | escopo de projeto de software exemplo (validar) | informacional | Por que o escopo decide o preço · O que escrever: quem usa, o que faz, o que não faz · O que deixar para a Descoberta · Exemplo comentado | `/blog/como-escrever-um-escopo` | `/sprint-de-descoberta`, `/orcamento` |
| 7 | D+60 | Sinais de que a planilha virou risco · "Planilha virou sistema? Quando e como migrar" (44) | transformar planilha em sistema (3 sugestões; SERP fraca). Evitar "como sair da planilha do excel" (SERP de tutorial) | comercial | Sinais de risco · Quando o no-code basta · Quando não basta · O que um sistema web resolve · Como migrar os dados | `/blog/transformar-planilha-em-sistema` | `/servicos/sistemas-web` |
| 8 | D+75 | Integrar ou trocar de sistema · "Integrar ou trocar de sistema: como decidir" (43) | integração erp e commerce (sugestão exata) em H2; não usar "integração de sistemas via api" (cauda da página de serviço) | comparação | Quando integrar · Quando trocar · ERP e e-commerce: conector nativo, API ou hub · O que levar ao diagnóstico. Só plataformas confirmadas pelo dono | `/blog/integrar-ou-trocar-de-sistema` | `/servicos/integracoes` |
| 9 | D+90 | Publicar app nas lojas ("pode fazer parte do escopo") · "Publicar app na App Store e no Google Play" (42) | quanto custa publicar app na play store / apple store (há demanda) | informacional | Conta de desenvolvedor: em nome de quem · Revisão das lojas · Atualizações · O que entra no escopo. Taxas oficiais só com exceção do dono à regra de números (BLUEPRINT §12), com link para as páginas oficiais | `/blog/publicar-app-nas-lojas` | `/servicos/aplicativos` |
| 10 | D+105 | De quem é o código · "De quem é o código do software encomendado?" (43). `codigoProprietario` está como `answer_draft`; publicar só com revisão jurídica (Lei 9.609/98). Sem ela: "App nativo ou híbrido: qual escolher?" (37), se o dono confirmar o stack | propriedade intelectual desenvolvimento de software (5 sugestões) / app nativo ou hibrido (sugestão exata) | informacional | O que diz a lei · O que o contrato precisa dizer · Repositório, acessos e domínio · Como a Lemamon.dev faz | `/blog/de-quem-e-o-codigo-do-software` | `/como-trabalhamos` (FAQ "O código fica com a minha empresa?") |

**Suplentes com sinal de busca** (para trocar um item da pauta, a decisão é do dono, registrada no 12 §7):

| Título · `seoTitle` (car.) | Keyword | Condição | Link |
|---|---|---|---|
| Tenho uma ideia de aplicativo: e agora? (39) | tenho uma ideia de aplicativo mas não sei programar | nenhuma | `/servicos/mvp`, `/sprint-de-descoberta` |
| Lovable vale a pena para lançar o seu produto? (46) | lovable vale a pena (6 sugestões) | revisar a cada 6 meses | `/servicos/mvp`, `/servicos/sustentacao` |
| Como proteger a ideia do seu aplicativo (39) | como proteger uma ideia de aplicativo | revisão jurídica; NDA mútuo pronto (09 §3) | FAQ de NDA |
| Desenvolvedor sumiu: como retomar o seu sistema (47) | meu desenvolvedor sumiu | **só com `sistemaTerceiros: true`** | `/servicos/sustentacao` |

Regra para todos: o post linka o serviço com a primária do serviço como âncora; o serviço linka o post com a primária do post; republicação no Medium com canonical para lemamon.dev (12 §7).

---

## (f) Schema: o JSON-LD a acrescentar ou corrigir

**O que já está certo e não muda:** Organization + ProfessionalService nas 3 Homes; Service nos 5 serviços e na Sprint, com `provider` pelo `@id` (o vínculo Service → Organization já existe); BreadcrumbList nos serviços, na Sprint e nos 87 cases; FAQPage gerado dos mesmos itens visíveis. **Ressalva:** segundo a página de atualizações da Busca do Google consultada pelos agentes, o rich result de FAQ deixou de aparecer em 07/05/2026 e a documentação saiu em 15/06/2026. O FAQPage continua inofensivo e útil para entender a oferta, mas não rende nada na SERP.

**1. `sameAs` (S02-1, S04-2, S05-3; depende do dono).** Fonte única `dados/dono.json › perfis`, filtrada por `publicar` (`seo.ts:81`). Resultado esperado na Home, com o Medium fora até o 1º post:

```json
"sameAs": [
  "https://www.linkedin.com/company/lemamondev",
  "https://github.com/lemamon-dev"
]
```

**2. Organization (S02-3, S05-4).** Só fatos já publicados; `areaServed` e `knowsLanguage` dependem da flag `atendeExterior` (ligada pela D31). Nó da Home pt depois da mudança:

```json
{
  "@type": ["Organization", "ProfessionalService"],
  "@id": "https://lemamon.dev/#organization",
  "name": "Lemamon.dev",
  "legalName": "Lemamon.dev LTDA",
  "taxID": "69.700.690/0001-98",
  "url": "https://lemamon.dev/",
  "logo": "https://lemamon.dev/icon-512.png",
  "image": "https://lemamon.dev/assets/img/og/default-pt.jpg",
  "description": "<meta.organization_description>",
  "email": "comercial@lemamon.dev",
  "address": { "@type": "PostalAddress", "addressLocality": "São Paulo", "addressRegion": "SP", "addressCountry": "BR" },
  "areaServed": "Worldwide",
  "knowsLanguage": ["pt-BR", "en", "es"],
  "knowsAbout": ["<services.web_systems.name>", "<services.mobile_apps.name>", "<services.integrations.name>", "<services.mvp.name>", "<services.support.name>"],
  "sameAs": ["https://www.linkedin.com/company/lemamondev", "https://github.com/lemamon-dev"]
}
```

`contactPoint` é opcional (o e-mail já está no nível do negócio, como o Google pede para subtipos de LocalBusiness). Se entrar: `{"@type":"ContactPoint","contactType":"sales","email":"comercial@lemamon.dev","url":"https://lemamon.dev/contato","availableLanguage":["pt-BR","en","es"]}`, com `url` por idioma. **Sem `telephone`** até o número real (o build usa o de teste `5548900000000`), sem `foundingDate` (S04-8), sem `priceRange` e sem `aggregateRating`.

**3. WebSite (S02-7, polimento).** O mesmo nó nas 3 Homes, porque um `@id` é uma entidade só:

```json
{ "@type": "WebSite", "@id": "https://lemamon.dev/#website", "name": "Lemamon.dev", "url": "https://lemamon.dev/", "inLanguage": ["pt-BR", "en", "es"], "publisher": { "@id": "https://lemamon.dev/#organization" } }
```

**4. BreadcrumbList dos cases (S02-10, S03-2).** Último item com o nome do case (`seoTitle` ou `tipoDeSistema`), não "Setor · Porte":

```json
{ "@type": "BreadcrumbList", "itemListElement": [
  { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://lemamon.dev/" },
  { "@type": "ListItem", "position": 2, "name": "Cases", "item": "https://lemamon.dev/cases" },
  { "@type": "ListItem", "position": 3, "name": "Painel de qualidade do ar em tempo real" }
] }
```

**5. Person (S03-1, S05-2; código agora, dados do dono).** Em `/sobre`, para cada pessoa de `time` com `atuaEmProjetos`, e `founder`/`employee` na Organization:

```json
{ "@type": "Person", "@id": "https://lemamon.dev/sobre#<id>", "name": "<nome>", "jobTitle": "<papel>", "image": "https://lemamon.dev/<foto>", "sameAs": ["https://www.linkedin.com/in/lemamon", "<github pessoal>"], "worksFor": { "@id": "https://lemamon.dev/#organization" } }
```

O `/in/lemamon-dev` não vai para nó nenhum: é a segunda conta do dono, com encerramento previsto.

**6. Article do blog (S02-13, polimento).** `BlogPostView.astro:62`: `"publisher": { "@id": "https://lemamon.dev/#organization" }` e `"isPartOf": { "@id": "https://lemamon.dev/#website" }`.

**Não fazer (refutado ou sem ganho):** CreativeWork nos cases (S02-4: `creator` = Lemamon.dev LTDA com `temporalCoverage` 2016 afirmaria o que a D45(5) evitou); `@id`, `audience` e `availableChannel` no Service (S02-6: nenhum consumidor; "PMEs" depende da D26); ContactPage e CollectionPage (S05-4); BreadcrumbList nas páginas de 1º nível (S02-5: a hierarquia já está nas filhas e o Google dispensa o item de topo).

---

## (g) Off-site e local

### Perfil da Empresa no Google

1. **Elegibilidade primeiro (S04-1, depende do dono).** As diretrizes do Google excluem empresas "somente on-line": é preciso contato presencial com o cliente no horário informado, na sede ou indo até ele. `confirmacoes.formatoDiagnostico` ainda é `null`. **Se todo o atendimento for por vídeo ou telefone, não crie o perfil**: concentre o sinal local no JSON-LD, no LinkedIn e nos diretórios.
2. **Se for elegível:** empresa de área de serviço, endereço real em São Paulo oculto (nunca escritório virtual nem caixa postal); área "São Paulo, SP" e, se houver atendimento presencial lá, municípios da Grande SP (até 20 áreas, no máximo ~2 h de carro). **Mesmo com `outrasCidades` e `atendeExterior` = true, nada de outros estados, "Brasil" ou países.** Categoria principal "Empresa de software". Nome exatamente "Lemamon.dev". Site com `?utm_source=google&utm_medium=organic&utm_campaign=gbp`. Descrição do 08 §3 passo 7 (já com a D44). Avaliações só de clientes reais da Lemamon.dev.

### Diretórios, em ordem

| Ordem | Diretório | Quando | Como | Atenção |
|---|---|---|---|---|
| 1 | Página do LinkedIn (`/company/lemamondev`) | Antes do dia 0 | Sede "São Paulo, SP, Brasil", Especialidades, 1 post, `sameAs` | Já existe; falta o site apontar para ela |
| 2 | Organização `lemamon-dev` no GitHub | Antes do dia 0 | Nome, site, cidade, README (D35 a) | Hoje: nome em minúsculas e 0 repositórios |
| 3 | Softdex (plano grátis) | Depois do dia 0 (o domínio precisa servir o site novo) | Segmentos PMEs, Startups, Integração de sistemas e Tecnologia; 3 a 5 cases com o texto anonimizado do site | Domínio de 2026; prioridade baixa e custo zero. Nunca o plano pago com "backlinks dofollow" (link pago sem `rel="sponsored"`) |
| 4 | Clutch | Com o 1º cliente da Lemamon.dev disposto a avaliar (08 §4) | Perfil grátis; preço-hora e projeto mínimo em branco (D23) | Link do perfil é nofollow: o ganho é prova e visita, não autoridade |
| 5 | GoodFirms | Junto com o Clutch | Mesmo NAP | Mesma regra de preço |
| 6 | TechBehemoths, DesignRush | Opcional, depois do Clutch | Mesmo NAP | Ordem padrão "Sponsored": perfil sem avaliação fica no fim |
| — | Sortlist, ABES, listas pagas sem rótulo | Não agora | — | Sem fit, ou pago, ou publieditorial |

### Plano de backlinks

Consolidar no **08 §6 "Links de referência"** (texto em "Próximo", S04-4), sem playbook novo:

- **Fase 0, antes do dia 0:** perfis próprios (LinkedIn, GitHub) linkando https://lemamon.dev. São sinal de entidade, não de autoridade (nofollow).
- **Fase 1, semanas 1–8:** Perfil da Empresa (se elegível), Softdex grátis, e a menção editorial dos parceiros do 12 §3: uma linha e um link simples para https://lemamon.dev/, sem UTM, nunca como cláusula do acordo. Com comissão atrelada ao link, `rel="sponsored"`.
- **Fase 2, depois do 1º cliente avaliador:** Clutch e GoodFirms; candidatura às listas do 08 §5 (descartando as assinadas por concorrentes que se ranqueiam).
- **Fase 3, contínua, depende do dono:** pautas do fundador (só depois de `/sobre` com pessoa real); `/quanto-custa#como-comparar` como peça citável (aberta, sem PDF nem formulário, D17); open source na organização só com aprovação do dono (o repositório é privado e sem licença).
- **Proibido:** comprar link, PBN, troca em massa, patrocinado sem `sponsored`, cadastro em massa.
- **Medição:** Search Console › Links e GA4 › referral por domínio, com a coluna `rel` para não contar nofollow como link editorial. Sem meta numérica até a linha de base (13 §2).

### NAP e marca

| Fonte | Hoje | Como deve ficar |
|---|---|---|
| Site (rodapé, JSON-LD) | "Lemamon.dev LTDA · CNPJ 69.700.690/0001-98 · São Paulo, SP", `comercial@lemamon.dev` | Manter |
| LinkedIn Página | Sem sede, sem descrição | "São Paulo, SP, Brasil"; Sobre; Especialidades |
| GitHub | `lemamon.dev`, sem site, sem local | "Lemamon.dev", https://lemamon.dev, "São Paulo, SP, Brasil" |
| Medium | 0 stories | Nome "Lemamon.dev"; fora do site até o 1º post |
| Receita (ReceitaWS, 21/10/2026) | "LEMAMON.DEV LTDA", São Paulo/SP, ativa desde 20/10/2026 | Registrar na D39; o dono confere o cartão |
| CNPJ antigo 46.961.812/0001-02 | Fantasia "LEMAMON.DEV", Florianópolis/SC, **inapto** desde 31/08/2026 | Fiscal, não SEO: o dono decide com o contador (ação 37 da AUDITORIA-LINKEDIN) |
| Domínios | `lemamon.com` e `lemamon.com.br` livres | Registrar e fazer 301 (S04-11) |

---

## (h) Busca por IA

### Política de rastreadores

O `public/robots.txt` libera tudo (`User-agent: *`, `Allow: /`) e aponta o sitemap. No preview, os 9 user agents testados (GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended, CCBot, bingbot) recebem 200; o DNS é do Netlify, sem Cloudflare bloqueando bots de IA por padrão. **Recomendação: manter tudo liberado e registrar a decisão no 15 (S05-9).**

| Bot | Para que serve (segundo a documentação do dono do bot) | Política |
|---|---|---|
| Googlebot | Busca e AI Overviews | Liberado |
| Google-Extended | Uso em modelos do Google; não afeta a inclusão na Busca | Liberado (marca nova: ser conhecida pelo modelo pesa mais) |
| OAI-SearchBot | Presença no ChatGPT search | Liberado (bloquear tira o site das citações) |
| GPTBot | Treino | Liberado de propósito |
| ChatGPT-User | Visita a pedido do usuário | Liberado |
| PerplexityBot, Claude-SearchBot | Busca e citações | Liberado |
| ClaudeBot, CCBot, Applebot-Extended | Treino | Liberado de propósito |

Para sair do treino sem sair das respostas, bastaria um grupo `User-agent: GPTBot / Google-Extended / ClaudeBot / CCBot / Applebot-Extended` com `Disallow: /`. Hoje não há motivo para isso. Depois do deploy: `curl -sI https://lemamon.dev/ | grep -i x-robots` não deve retornar nada.

### `llms.txt`

Opcional e de prioridade baixa (S05-10): não há declaração oficial do Google nem da OpenAI de que leiam o arquivo. Se entrar, gerado do i18n por `src/pages/llms.txt.ts` (nome, categoria, cidade, método, "nada é cobrado antes do desenvolvimento", contato e as páginas principais nos 3 idiomas), nunca com a camada fictícia e sem texto que envelheça. Hoje `https://lemamon.dev/llms.txt` devolve o HTML do app antigo; no build novo dá 404, o que é correto.

### Estrutura citável

| O que | Onde | Chave |
|---|---|---|
| Frase de entidade: "A Lemamon.dev é uma empresa de desenvolvimento de software sob medida de São Paulo, SP…" | FAQ `other_cities` (Home, e `/como-trabalhamos` com S05-7), já no FAQPage | S05-1, S05-7 |
| Resposta direta para "quanto custa": o preço sai fechado antes e acompanha escopo, integrações e plataformas | FAQ `how_much` e `pricing.factors.intro` ("os 7 fatores") | S05-5 |
| Definição de MVP | FAQ `what_goes_in` de `/servicos/mvp` | S03-7 |
| "time and materials" e "discovery phase" | `/en/how-we-work`, `/en/pricing`, `/en/discovery-sprint` | S07-8, S03-8 |
| Página de entidade com pessoa | `/sobre` + `Person` | S03-1, S05-2 (dono) |
| Contagem do portfólio | `see_all_cases` e `cases.hub.intro` | S05-8 (exceção à COPY.md:72) |
| Pegada externa | LinkedIn Página, GitHub, diretórios | S05-3, S04-7 |
| Aviso de mudanças ao Bing | IndexNow | S05-11 |

Os testes com perguntas no WebSearch mostraram o padrão das fontes citadas para "quanto custa": "resposta rápida" com faixa, tabela, H2 em pergunta, ano no title e autor. Sem publicar preço, a Lemamon.dev disputa a parte "o que define o preço" e "como comparar", não o número.

---

## (i) Medição

### Checklist do Search Console no lançamento (08 §1, com as correções de S01-2)

**Dia −3 ou antes**
- [ ] Search Console › Adicionar propriedade › **Domínio** › `lemamon.dev`; TXT gravado no **Netlify DNS** (não na GoDaddy) e verificado.
- [ ] Bing Webmaster Tools: importar do Search Console (pode ficar para o dia 0).

**Dia 0 (deploy de produção)**
- [ ] `curl -sI https://lemamon.dev/` sem `x-robots-tag`; `<meta name="robots" content="index, follow">` na Home; `robots.txt` com o sitemap.
- [ ] `curl -sI https://boring-shockley-7c50b2.netlify.app/servicos/mvp` → 301 para lemamon.dev (S01-1).
- [ ] Sitemaps › `https://lemamon.dev/sitemap-index.xml` → "Sucesso".
- [ ] Inspeção de URL e pedido de indexação, ~10 por dia: `/`, `/en/`, `/es/`, `/orcamento` e as 5 páginas de serviço; no dia 1, `/como-trabalhamos`, `/sprint-de-descoberta`, `/quanto-custa`, `/servicos`, `/contato`, `/cases`. Em "Ver página testada", conferir H1 e texto.
- [ ] Rich Results Test da Home: Organização detectada, sem erro (avisos de `streetAddress`, `telephone`, `priceRange` são esperados). Não esperar FAQ (descontinuado).
- [ ] Prévia de compartilhamento revalidada (08 §1.1).
- [ ] Vínculo com o GA4 (06 §9).

**Semanas 1 a 4 (uma vez por semana, não por dia)**
- [ ] Páginas › "Não encontrado (404)" e GA4 `page_not_found` por `path`: caminho antigo com visita ou link ganha um 301 no `netlify.toml`.
- [ ] Páginas › conferir que os "não indexados" são os esperados: `noindex` (enviado e 404), redirects do app antigo, e as ~780 URLs do wizard com query como "Página alternativa com tag canônica adequada" (S01-7).
- [ ] Desempenho › consultas com "lemamon" e "lemon".

**Dia 60 e dia 90:** a revisão do "Próximo" (N-revisão).

### KPIs

As referências abaixo seguem o [13](../playbooks/13-kpis-e-rituais.md): viram meta quando o dono as troca por um número próprio, a partir da linha de base do dia 30.

| KPI | Fonte | Referência no dia 90 | Referência no mês 6 |
|---|---|---|---|
| URLs indexadas ("Válida") | Search Console › Páginas | ≥ 8 rotas principais (critério do README §7) e ≥ 90% das 129 | ≥ 95% |
| Posição da Home para "lemamon.dev" | Search Console › Desempenho | 1º | 1º, também para "lemamon" |
| Impressões orgânicas/mês | Search Console | linha de base do dia 30 | crescimento sobre a linha de base (meta do dono) |
| Consultas distintas com impressão | Search Console | linha de base | idem |
| Termos-alvo realistas (lista de (b)) | Search Console, posição média | top 20 em pelo menos 2 | top 10 em pelo menos 3 |
| CTR da Home | Search Console | comparar com a D37 aos 60 dias | — |
| Sessões orgânicas e `lead_submitted` orgânico | GA4 | linha de base | meta do dono |
| Domínios de referência (separando follow e nofollow) | Search Console › Links + planilha do 08 §6 | perfis próprios + Softdex + 1 parceiro | + Clutch/GoodFirms com avaliação |
| Core Web Vitals | Search Console › Experiência | sem URL "ruim" (dado de campo pode faltar com pouco tráfego) | idem |
| Rich results | Rich Results Test | Organization e BreadcrumbList sem erro | idem |
| Citação em respostas de IA | Checagem manual mensal de 5 perguntas fixas (ChatGPT, Perplexity, AI Overviews) | registro | a marca aparece em pelo menos 1 |

---

## (j) Achados

### Confirmados — severidade média (6)

| Chave | Achado | Severidade: relato → verificação | Veredito do cético | No plano |
|---|---|---|---|---|
| S02-1 | `sameAs` aponta para o LinkedIn pessoal `/in/lemamon-dev`, não para a Página `/company/lemamondev` | alto → **médio** | Reproduzido nas 3 Homes e em 129 páginas; a Página existe (200, "Lemamon.dev \| LinkedIn") e linka de volta. Rebaixado porque `sameAs` não é fator de ranking; o dano é de confiança e de regra do LinkedIn (L01/L02). Reordenar o `sameAs` não tem efeito; `/in/lemamon-dev` não vai para nenhum `Person`. Depende do dono confirmar a Página (D35) | Depende do dono |
| S04-2 | O mesmo, visto pelo off-site | alto → **médio** | Reproduzido; acrescenta que a AUDITORIA-LINKEDIN planeja `/company/lemamon`, que dá 404. Trocar já, sem esperar o 1º post; o post só decide o texto do card | Depende do dono |
| S03-1 | Nenhuma pessoa no site: sem autor, time ou `/sobre` | alto → **médio** | Reproduzido (0 páginas com nome; `time: []`; `/sobre` 404 pelo gate `hasTeam`). "Experience zerada" é falso (29 cases). E-E-A-T não é fator direto e o achado repete o F57. Novo: `AboutView` não emite `Person` nem com time | Depende do dono + Próximo (código) |
| S03-2 | Case publicado com "A confirmar · A confirmar" nos 3 idiomas | alto → **médio** | Reproduzido em 15 superfícies (case, hubs, relacionados, wizard, mensagem do WhatsApp); fora do `<title>` e da description. A D45 já registrava a pendência. A trava `DRAFT_TAGS` não pega "A confirmar" sem colchetes; a regex proposta no lugar errado quebraria o build | Fazer agora (breadcrumb) + Depende do dono |
| S03-3 | Cases sem papel, desafio ou resultado; o mesmo fato 7 a 9 vezes; linha do tempo igual nos 29 | alto → **médio** | Reproduzido; mas a similaridade entre cases é baixa (Jaccard mediano 0,06): o problema é redundância dentro da página, não duplicação. Linha do tempo igual vem da D45(4); tela real e "time de N" contrariam a D45 e saíram da recomendação. Pesa porque os cases são 70% das URLs | Fazer agora (A) + Depende do dono (B) |
| S04-1 | Perfil da Empresa: elegibilidade não confirmada e área de serviço que pode virar "Brasil" | alto → **médio** | Diretrizes reproduzidas; `formatoDiagnostico: null`; `08:117` ficou perigoso com `outrasCidades = true`. O site não prova que a empresa é só on-line; área grande não é motivo documentado de suspensão; suspensão não afeta o orgânico do site | Depende do dono |

### Confirmados — severidade baixa (37)

| Chave | Achado | Relato → verificação | Veredito do cético, em uma linha | No plano |
|---|---|---|---|---|
| S01-1 | Host netlify.app espelha a produção com 200 e sem `noindex` | médio → baixo | O Netlify já manda `Link: rel=canonical` para lemamon.dev; o 301 é higiene; "Search Console mostra duplicado" estava errado | Fazer agora |
| S01-2 | Search Console não verificado | médio → baixo | DNS é Netlify (não GoDaddy); a tarefa já estava no 08 e no 14; o ganho é verificar 3 dias antes; cota de ~10 inspeções/dia | Fazer agora |
| S01-3 | 58 URLs de case com slug pt em en/es | médio → baixo | Contraria o BLUEPRINT §9, mas no celular o Google mostra só o domínio e o breadcrumb já é traduzido; a recomendação original quebrava as buscas por chave | Fazer agora (se couber) |
| S02-2 | Placeholder no BreadcrumbList | alto → baixo | Mesmo problema de S03-2; efeito de ranking nulo; o `.refine` sem a condição `publicado` quebra o build | Fazer agora + dono |
| S02-3 | Organization sem `areaServed`, `knowsLanguage`, `contactPoint` | médio → baixo | Nenhum dos três é propriedade documentada pelo Google para Organization; coerência com a D31; a URL de LinkedIn da recomendação original estava errada | Fazer agora |
| S03-4 | Case não linka serviço nem método; 5 cases só recebem link do hub | alto → baixo | Menu e rodapé já linkam tudo; ganho de link contextual é marginal; MVP e sustentação não têm case para linkar | Fazer agora |
| S03-5 | `/servicos/mvp` e `/servicos/sustentacao` sem nenhum case | médio → baixo | Intencional (`hasRelatedCases`); marcar `support` nos 29 repetiria os cases da Home | Depende do dono |
| S03-6 | Sustentação fina e sem "corretiva/evolutiva" | médio → baixo | As consultas são acadêmicas ou de vaga; a página fina é dado pendente do dono; NDA e código já confirmados podem entrar no FAQ | Fazer agora (FAQ) + dono (vocabulário) |
| S03-7 | `/servicos/mvp` não define MVP | médio → baixo | A definição existe e foi cortada pelo teto do FAQ; "provar" já cobre "validar"; levar a definição para `what_goes_in` | Fazer agora |
| S03-8 | Sprint mira termo sem demanda e não diz como acontece | médio → baixo | "discovery de produto" é intenção de PM; o title fica; o "como acontece" já é F58; en sem "discovery phase" | Fazer agora (en) |
| S03-9 | `/quanto-custa` sem custos recorrentes, autor e data | médio → baixo | Já fala de sustentação; data e assinatura em página comercial descartadas; FAQ de custos de terceiros depende do dono | Depende do dono |
| S03-10 | A mesma FAQ em até 8 páginas | médio → baixo | Texto repetido é boilerplate, sem penalidade; o problema real é o teto de 9 cortando perguntas próprias | Próximo |
| S03-11 | GitHub vazio, LinkedIn pessoal, sem menções | médio → baixo | Duplica D35, D01, F14, F86 e L02; `publicar: false` sozinho não tira do `sameAs` | Depende do dono |
| S03-12 | en/es só tradução; slugs pt | médio → baixo | O FAQ já fala de idioma e contrato; fuso contraria a D31; levar o FAQ `other_cities` para `/como-trabalhamos` | Fazer agora + dono |
| S04-4 | Não existe plano de backlinks | alto → baixo | O plano existe espalhado (08 §3–§5, 12 §3, §4, §7, D35); falta consolidar e a regra do link de parceiro com comissão | Próximo |
| S04-5 | NAP incompleto nos perfis; dois CNPJs | médio → baixo | Incompleto, não divergente; ReceitaWS já mostra São Paulo/SP; o CNPJ antigo é assunto fiscal | Depende do dono |
| S04-6 | Busca da marca dominada pelo fundador e por homônimos | médio → baixo | Normal antes do lançamento; o fato novo é que a Página já existe; critério de reabrir: Home fora do 1º aos 60 dias | Depende do dono + medição |
| S04-7 | Diretórios: ordem e conflito com preço | médio → baixo | A D23 já cobre; Softdex é de 2026; links do Clutch e do Softdex grátis são nofollow | Próximo |
| S04-8 | Ano de fundação conflita com cases 2016–2021 | médio → baixo | Já está na AUDITORIA-LINKEDIN; preencher `anoFundacao` iria contra a D45(5) | Depende do dono |
| S04-9 | "A confirmar" no card do hub e no breadcrumb | médio → baixo | Mesmo de S03-2; "Publicidade" como setor seria inventar | Depende do dono |
| S05-1 | A frase de entidade some quando há dados da empresa | alto → baixo | A categoria aparece no title, no H1, na description e no JSON-LD; falta uma frase declarativa visível; resolver no FAQ, sem CSS novo | Fazer agora |
| S05-2 | Não existe `/sobre` | alto → baixo | Ausência proposital (BLUEPRINT §6.11); o caminho "sem time" contraria decisão registrada; novo: `Person` não é emitido | Depende do dono + Próximo |
| S05-3 | Pegada zero fora do site | alto → baixo | Quase tudo duplicado (D43, D38, D35, D01, F86, L02); a parte do GitHub é P | Depende do dono |
| S05-4 | JSON-LD da entidade só em 3 páginas | médio → baixo | O Google manda a Organization só na Home; o resíduo é `areaServed` (junto com S02-3) | Fazer agora |
| S05-5 | `/quanto-custa` sem frase citável; FAQ abre com "Depende" | médio → baixo | A página já tem H2 e 7 fatores; o resto é extensão da F08; data artificial rejeitada | Fazer agora |
| S05-7 | en/es sem fuso, contrato e porte para quem é de fora | médio → baixo | Fuso e porte são decisão do dono (D31); a resposta aprovada só não aparece fora da Home | Fazer agora |
| S05-8 | A contagem do portfólio nunca aparece | médio → baixo | Uma IA que lê `/cases` conta 29; mostrar o número contraria a COPY.md:72 | Depende do dono |
| S06-5 | Primeiro parágrafo e H2 dos serviços sem a keyword do cluster | médio → baixo | Falso para o termo principal (H1 e title já trazem); várias keywords propostas sem demanda ou com outra intenção; sobra MVP e sustentação | Fazer agora (via S03-7) + dono |
| S06-6 | Titles de sistemas web e aplicativos | médio → baixo | Usar o plural "sistemas web" (sugestão exata, 590 px) em vez do singular; "em São Paulo" só depois do Planner; "feitos em São Paulo" seria fato não confirmado | Fazer agora |
| S06-8 | Contato sem a marca no fim e com a praça | médio → baixo | Desvio sem registro; o title com "WhatsApp" fere a regra das variantes `_no_whatsapp`; `/sobre` fica como está (BLUEPRINT) | Fazer agora |
| S06-9 | Cases não linkam os serviços | médio → baixo | Mesmo que S03-4; o `FieldList` só aceita string, a implementação proposta não funcionava | Fazer agora |
| S07-2 | Cluster "quanto custa" exige faixas em R$ | alto → baixo | Escolha registrada (decisão 3); faixas de terceiros com link mandariam o lead aos concorrentes; a alavanca certa é `precos.ts` | Depende do dono |
| S07-3 | Listas e SERPs en decididas por Clutch e diretórios | alto → baixo | Duplicado do B317/B387; pedir avaliação por cases de 2016–2021 deturpa o vínculo; perfil grátis do Softdex sem dofollow | Depende do dono |
| S07-5 | "software house" e "empresa de desenvolvimento de software" com 0 ocorrências | médio → baixo | "desenvolvimento de software" está em title e H1; a secundária some por causa de S05-1; mudar 1 H2 só com volume | Fazer agora (via S05-1) |
| S07-8 | en sem "nearshore", fuso e fixed price × T&M | médio → baixo | A comparação já existe em `/en/pricing`; falta só o termo "time and materials"; FAQ nova estoura o teto | Fazer agora |
| S07-9 | MVP: SERP informacional, página sem "o que é" | médio → baixo | Reaproveitar a definição aprovada; "cauda de custo" sem número não é atingível | Fazer agora (via S03-7) |
| S07-10 | Integrações não cita plataformas | médio → baixo | Os 7 cases de integração são de IoT; nenhum nome sem o dono; cobrir API, webhook e IoT industrial | Fazer agora + dono |

### Baixos não verificados (30)

| Chave | Achado | Recomendação | No plano |
|---|---|---|---|
| S01-4 | URLs prováveis e `/sitemap.xml` dão 404 (F90) | 301 forçados antes da linha 135 | Polimento |
| S01-5 | `.html` e `/404` respondem 200 | Aceitar ou 301 das 3 raízes | Polimento |
| S01-6 | Sitemap sem `lastmod` | Só com data verdadeira (`atualizadoEm`) | Polimento |
| S01-7 | 780 URLs internas com query no wizard | Registrar como esperado no 08 | Polimento |
| S01-8 | Âncoras e parâmetros pt em en/es (F71) | IDs localizados com alias | Polimento |
| S01-9 | `x-default` em pt e hreflang `pt-BR` | Decisão do dono | Polimento |
| S01-10 | Sem `max-image-preview:large` | `SEO.astro:63` | Polimento |
| S02-7 | WebSite com o mesmo `@id` e valores diferentes | Nó único | Polimento |
| S02-8 | Sem WebPage/ContactPage/CollectionPage | **Não fazer** (S05-4) | Polimento |
| S02-9 | Rich result de FAQ descontinuado | Atualizar 08 e BLUEPRINT | Polimento |
| S02-10 | Breadcrumb dos cases "Setor · Porte" repetido | `tipoDeSistema`/`seoTitle` | Fazer agora |
| S02-11 | `sameAs` com perfis vazios | D35/D01 | Depende do dono |
| S02-12 | foundingDate, founder, telefone: só com o dono | Ver S04-8 e S03-1 | Depende do dono |
| S02-13 | Article com publisher solto | `@id` da Organization | Polimento |
| S03-14 | Política promete data e não mostra | Preencher `atualizadaEm` | Polimento (dono) |
| S03-15 | Breadcrumb "Setor · Porte"; case sem CreativeWork | Só o breadcrumb (CreativeWork refutado em S02-4) | Fazer agora |
| S04-10 | JSON-LD sem sinais locais e de idioma | Incorporado em S02-3 | Fazer agora |
| S04-11 | `lemamon.com` e `.com.br` livres | Registrar e 301; INPI | Depende do dono |
| S05-9 | Robots libera IA sem política registrada | Registrar no 15 | Depende do dono |
| S05-10 | `llms.txt` | Opcional, gerado do i18n | Polimento |
| S05-11 | Avisar o Bing com IndexNow | Plugin `onSuccess` | Próximo |
| S05-12 | FAQ repetido disputa citação | `schema: false` nas repetições | Polimento |
| S06-10 | Âncoras genéricas para `/quanto-custa` e `/como-trabalhamos` | Âncoras com a primária | Polimento |
| S06-11 | Wizard disputa "orçamento"; description repete o title | Descriptions novas | Polimento |
| S06-12 | Description do hub promete resultado | Setores, sem número | Polimento |
| S06-13 | Slugs pt nos cases en/es | Incorporado em S01-3 | Fazer agora |
| S07-13 | Title da Sprint sem "discovery de produto" | Title mantido (S03-8) | — |
| S07-14 | es localizado por país | Sem conteúdo novo em es | Polimento |
| S07-15 | Sustentação não fala de sistema de terceiros | Só com `sistemaTerceiros` | Depende do dono |
| S07-16 | "desenvolvimento de aplicativos em são paulo" | Validar no Planner | Próximo (revisão) |

### Refutados (17)

| Chave | Achado | Por que foi refutado |
|---|---|---|
| S02-4 | Cases sem schema de conteúdo | Nenhum tipo proposto gera rich result; `creator` + `temporalCoverage` afirmaria que a LTDA fez projetos de 2016, o que a D45(5) evitou; o exemplo apontava `@id` de Service que não existem. O problema real era a falta de link case → serviço (S03-4) |
| S02-5 | BreadcrumbList ausente em 21 páginas de 1º nível | Segue o BLUEPRINT §8.7; o Google dispensa o item de topo e a própria página; a hierarquia já está declarada nas filhas; no celular o Google nem mostra breadcrumb |
| S02-6 | Service sem `@id`, `areaServed`, `audience` | Service não tem recurso suportado; `provider` já liga à Organization; idiomas chegam por hreflang; "PMEs" depende da D26 |
| S03-13 | Blog inexistente: 10 artigos | Ausência proposital (302 até 3 posts); a pauta repetia o 12 §7; várias keywords com intenção errada (tutorial de Excel, hubs de ERP); títulos que estouram o `seoTitle` de 50 |
| S04-3 | Domínio ainda serve o app antigo | Já registrado (L07, contexto do projeto); o código novo já resolve o soft-404; efeito passageiro; "sem meta description" estava errado |
| S05-6 | A tese "preço fechado depois da Descoberta" sem frase de definição | A frase existe (`discovery_sprint.why_start_here.text`) e `/quanto-custa` responde "fixo ou por hora"; a "lacuna nas respostas de IA" veio do resumidor da ferramenta, não de AI Overviews |
| S06-1 | 20 titles acima de 60 caracteres | Nenhuma keyword é cortada (máximo 504 px antes do " \| "); o corte cai na marca, que já aparece no nome do site; a D37 e a D43 aceitaram esse excesso; a trava de build quebraria a Home |
| S06-2 | Home: title fora do limite e primária ausente do texto | Troca registrada na D43; a opção proposta tirava "sob medida" e copiava o title de `/sobre` |
| S06-3 | `/quanto-custa` junta duas intenções | O title começa pela primária do BLUEPRINT; o desvio está documentado; "aplicativo" tem mais sinal que "software sob medida"; a proposta criaria a canibalização com `/servicos/aplicativos` |
| S06-4 | 8 cases com title acima de 60 | Só 2 passam de 600 px, e o corte cai na marca; reduzir o schema para 46 seria mais rígido do que a regra aceita para a Home |
| S06-7 | "preço fechado" no title da Sprint | Núcleos diferentes; "preço fechado" é o diferencial do site inteiro; volume perto de zero; o H1 é escolha de conversão |
| S07-1 | Domínio novo deve mirar cauda | O domínio é de 2021; as páginas já miram a cauda (BLUEPRINT §3.1, 08 §2); várias caudas propostas não têm sugestão |
| S07-4 | Snippet da Home igual ao de 5 concorrentes | A description de `/como-trabalhamos` já traz a Descoberta gratuita; a Home também, no corpo e no FAQ; dois concorrentes também não cobram nada antes do desenvolvimento; o texto proposto esquecia "quando necessária" (D44) |
| S07-6 | Só a Home é página local; criar `/sobre` | `/sobre` existe e está bloqueada de propósito sem pessoa (BLUEPRINT §6.11); a Home já é a landing local |
| S07-7 | Marca sem resultado e colidindo com Lemon.dev | Normal antes do lançamento; lemon.dev é agência de Shopify, outra categoria; todas as ações já estão no backlog |
| S07-11 | Pauta do 12a com termos sem busca | Autocomplete vazio não é volume zero; títulos propostos estouram o `seoTitle` e o B302; "Discovery de produto" no post canibalizaria a Sprint. Sobrou o title duplicado do post 1 (em "Próximo") |
| S07-12 | Faltam tabela, setores, contadores, fundador | As tabelas de comparação já existem (`/como-trabalhamos`, `/sprint-de-descoberta`, `/quanto-custa`); contagens de setor erradas; fundador é F57 |

---

## (k) Limites desta auditoria

- **O site não está no ar.** `lemamon.dev` serve o app antigo; não há posição real, impressão, CTR nem dado de campo de Core Web Vitals. Tudo o que é "impacto" é estimativa.
- **Não há Search Console.** A propriedade não existe; nenhuma consulta real foi vista. As decisões de title marcadas como condicionais esperam esse dado (revisão dos dias 60 e 90).
- **O preview é `noindex`.** O `x-robots-tag: noindex` vem do próprio Netlify em deploy previews; o comportamento de produção foi inferido do código (`SEO.astro:63`, `camada-ficticia.ts:79-81`) e do host netlify.app.
- **Volume: o Keyword Planner era a fonte prevista e ficou sem acesso.** Nenhum volume foi obtido ou estimado. O autocomplete dá sinal relativo de demanda, não volume; a ausência de sugestão não prova volume zero.
- **SERP aproximada.** O WebSearch roda dos EUA e não é o google.com.br; a ordem dos resultados é indicativa. O DuckDuckGo devolveu CAPTCHA, e nenhum CAPTCHA foi resolvido. Parte das SERPs não pôde ser repetida pelos céticos porque o limite de buscas do turno acabou.
- **Perfis externos:** o LinkedIn pessoal não abre sem login (HTTP 999); o estado dele vem da AUDITORIA-LINKEDIN.
- **Achados baixos não foram verificados.** Os 30 da lista (j) são o relato do especialista, sem segunda checagem.
- **A afirmação sobre o rich result de FAQ** (descontinuado em 07/05/2026) vem da página de atualizações da Busca citada pelos agentes, não de medição própria.
