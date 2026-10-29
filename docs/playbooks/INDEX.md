# Playbooks operacionais — índice

Tudo o que o site novo **não resolve com código**: processo comercial, oferta e preço, SLA, CRM, medição, Google Ads, Search Console, Perfil da Empresa, prova social, LGPD operacional, canais e rituais. Escritos em 19/10/2026 a partir do BLUEPRINT (fonte de verdade), do i18n, do 04-tecnico, do 06-marketing, do 07-negocios e do backlog aberto.

**Regras usadas em todos:** nenhum dado da Lemamon.dev inventado (o que falta está como `[PREENCHER]`); nenhum valor monetário da Lemamon.dev; estimativas dos documentos de arquitetura aparecem como referência, nunca como meta; nada promete o que o BLUEPRINT §12 proíbe; onde um item do backlog conflita com o BLUEPRINT, vale o BLUEPRINT e o conflito está anotado.

**Praça:** São Paulo, SP desde 20/10/2026 (antes Florianópolis, SC; D38 em [15](15-registro-de-decisoes.md)). O BLUEPRINT e o COPY já dizem São Paulo; só as análises 01–07 e o BACKLOG de `docs/arquitetura/` mantêm Florianópolis como análise histórica. Para a cidade, vale o i18n. O que o dono precisa trocar fora do código está no [08](08-search-console-e-seo-local.md) §3, "Mudança de praça".

## Arquivos

| # | Playbook | Para quê |
|---|---|---|
| 00 | [00-DADOS-DO-DONO.md](00-DADOS-DO-DONO.md) | o que preencher em `dados/dono.json` (arquivo único do dono), formato exato, o que libera, como validar; camada de dados fictícios e a trava |
| 01 | [01-diagnostico-e-devolutiva.md](01-diagnostico-e-devolutiva.md) | roteiro dos 45 minutos, modelo da devolutiva, agenda e limite semanal |
| 02 | [02-proposta-e-politica-comercial.md](02-proposta-e-politica-comercial.md) | premissas, custo-hora, política de preço, propostas, contrato, NDA |
| 03 | [03-qualificacao-e-score.md](03-qualificacao-e-score.md) | dicionário das respostas do wizard, score A/B/C/D, checklist BANT+F+P |
| 04 | [04-sla-follow-up-e-nutricao.md](04-sla-follow-up-e-nutricao.md) | SLA interno, modelos por score, cadências, retomada, WhatsApp Business |
| 05 | [05-crm-e-funil.md](05-crm-e-funil.md) | Netlify Forms → notificação → planilha; verificação em produção; relatórios |
| 06 | [06-ga4-e-medicao.md](06-ga4-e-medicao.md) | GA4, eventos de §7.11, dimensões, explorações, alertas, uptime |
| 07 | [07-google-ads.md](07-google-ads.md) | URLs finais, conversão por evento, por URL e offline; campanhas; verba |
| 08 | [08-search-console-e-seo-local.md](08-search-console-e-seo-local.md) | Search Console, Bing, Keyword Planner, Perfil da Empresa, diretórios, links de referência (§6) |
| 09 | [09-prova-cases-depoimentos.md](09-prova-cases-depoimentos.md) | cases, depoimentos, logos, termo de autorização, roteiro de entrevista |
| 09a | [09a-catalogo-de-projetos.md](09a-catalogo-de-projetos.md) | os 29 cases do portfólio publicados sem o nome do cliente (`semTermo`, D45) e como um deles ganha o nome |
| 10 | [10-lgpd-operacional.md](10-lgpd-operacional.md) | bloqueadores, operadores reais, retenção, rotina de exclusão, titulares |
| 11 | [11-email-dominio-proprio.md](11-email-dominio-proprio.md) | e-mail @lemamon.dev com SPF, DKIM e DMARC |
| 12 | [12-canais-indicacao-linkedin-conteudo.md](12-canais-indicacao-linkedin-conteudo.md) | indicação, parcerias, comunidade, LinkedIn, blog, Medium |
| 12a | [12a-rascunhos-blog.md](12a-rascunhos-blog.md) | rascunhos completos dos 3 primeiros posts de decisão e briefing do post técnico |
| 13 | [13-kpis-e-rituais.md](13-kpis-e-rituais.md) | KPIs, painel, financeiro, rituais, revisões 60/90, testes A/B |
| 14 | [14-calendario-90-dias.md](14-calendario-90-dias.md) | o 06-marketing §6.8 adaptado às decisões do dono |
| 15 | [15-registro-de-decisoes.md](15-registro-de-decisoes.md) | decisões pendentes do dono, verificações e confirmações |
| 16 | [16-processo-de-entrega.md](16-processo-de-entrega.md) | kickoff, ciclo de entregas a cada 2 semanas, mudança de escopo, go-live, sustentação, subcontratado |

## Por onde começar (semana do lançamento)

1. [00](00-DADOS-DO-DONO.md) Parte A (bloqueadores) e [10](10-lgpd-operacional.md) §2.
2. [05](05-crm-e-funil.md) §2 e §3: formulários verificados e notificação chegando.
3. [04](04-sla-follow-up-e-nutricao.md) §1: SLA e responsável.
4. [06](06-ga4-e-medicao.md) §2 a §8 e [08](08-search-console-e-seo-local.md) §1.
5. [07](07-google-ads.md) §1 a §4: nenhum anúncio em `/projects`, conversões conferidas.
6. Depois, o [14](14-calendario-90-dias.md).

## Backlog → playbook

Status: **coberto** = a parte não-código está resolvida no playbook (a execução é do dono ou do comercial) · **parcial** = parte coberta, o restante está indicado · **decisão** = recomendação pronta; falta o dono registrar em [15](15-registro-de-decisoes.md).

| Id | Item (resumo) | Playbook | Status |
|---|---|---|---|
| B006 | E-mail no domínio lemamon.dev | [11](11-email-dominio-proprio.md) | coberto (o FAQ de NDA já usa `{email}`) |
| B007 | WhatsApp em produção com o número real | [00](00-DADOS-DO-DONO.md) §A1 | coberto |
| B010 | `/projects` → `/orcamento` e URLs finais do Ads | [07](07-google-ads.md) §3 | parcial (redirect e sitemap são código, já feitos pelo `shell`) |
| B015 | Faixa de investimento no wizard | [00](00-DADOS-DO-DONO.md) §B4 | parcial (as faixas são dado do dono; a P5 é código do `conversion`) |
| B024 | Prévia de compartilhamento depois do deploy | [08](08-search-console-e-seo-local.md) §1.1, [14](14-calendario-90-dias.md) | coberto (HTML já correto, feito pelo `shell`; Sharing Debugger, Post Inspector e WhatsApp nas 6 URLs logo após o primeiro deploy; arte nova só com nome novo) |
| B029 | Perfil da Empresa no Google | [08](08-search-console-e-seo-local.md) §3 | coberto (perfil, NAP e Rich Results Test da Home sem erros, com os avisos esperados listados) |
| B032 | Produzir 2 a 3 cases reais com autorização | [09](09-prova-cases-depoimentos.md) | coberto |
| B034 | Faixa de prova social (logos autorizados) | [09](09-prova-cases-depoimentos.md) §13, [00](00-DADOS-DO-DONO.md) §B9 | parcial (a faixa é código do `gated`) |
| B035 | Depoimentos nominais autorizados | [09](09-prova-cases-depoimentos.md) §11 | coberto |
| B036 / B037 | Faixas de preço por oferta | [02](02-proposta-e-politica-comercial.md) §3, [00](00-DADOS-DO-DONO.md) §B7 | parcial (conta e dado; seções são código; nada é publicado sem a conta) |
| B041 | Squad Dedicado | [02](02-proposta-e-politica-comercial.md) §2, [15](15-registro-de-decisoes.md) D02 | decisão |
| B042 | Classificação A/B/C/D do lead | [03](03-qualificacao-e-score.md) | parcial (uso operacional; o cálculo é código da ilha) |
| B043 | Rotear lead para CRM e notificar | [05](05-crm-e-funil.md) | coberto |
| B044 | Sequência de nutrição | [04](04-sla-follow-up-e-nutricao.md) §5 | coberto (mensagens prontas D+3 a D+30 em pt/en/es, UTMs em todo link, medição no CRM; automação pelo checklist do 04 §5.4, que depende de D33 e da Política) |
| B045 | Propriedade GA4 e ID em produção | [06](06-ga4-e-medicao.md) §2 | coberto |
| B050 | Opções e duração no evento de conclusão | [06](06-ga4-e-medicao.md) §5 e §6 | coberto (`pain` e `time_to_convert_s` já saem no `lead_submitted`, código do `conversion`; dimensão "Dor (P3)", métrica "Tempo até o pedido", conferência no DebugView e exploração "Qualidade dos pedidos"). Respostas no `wizard_step` ficam fora: BLUEPRINT §7.11 e a Política (o GA4 só recebe respostas no envio) |
| B051 | Abandono do wizard por tela | [06](06-ga4-e-medicao.md) §3, §5 e §6 | coberto (eventos `wizard_abandon` e `wizard_return` são código do `conversion`; dimensões "Última tela do wizard" e "Gatilho do abandono" (`trigger`), métrica `time_in_wizard_ms` e exploração "Abandono do wizard" com o segmento de sessão "Abandono sem envio" (exclui sessões com `lead_submitted`) e valor Sessões, inclusive `resumo` e `contato`; conferência no celular com troca de app e envio no 06 §5, passo 7) |
| B053 | Agendamento direto | [01](01-diagnostico-e-devolutiva.md) §7, [00](00-DADOS-DO-DONO.md) §B6 | coberto (o site já liga a agenda por `dados/dono.json › agenda`) |
| B054 | Blog só com posts e autores reais | [12](12-canais-indicacao-linkedin-conteudo.md) §7 | coberto |
| B055 | Pauta de decisão de compra | [12](12-canais-indicacao-linkedin-conteudo.md) §7, [12a](12a-rascunhos-blog.md) | coberto (pauta + rascunhos; publicação depende do autor B298) |
| B056 | Teste A/B do hero | [13](13-kpis-e-rituais.md) §9 | parcial (protocolo; execução depende de volume e de código) |
| B057 | SLA de primeiro contato com responsável | [04](04-sla-follow-up-e-nutricao.md) §1 e §2, [05](05-crm-e-funil.md) §5, [13](13-kpis-e-rituais.md) §3 | coberto (metas em horas úteis; `fora_do_sla` para todo score; contagem semanal de A fora do SLA) |
| B058 | Painel de funil com KPIs e metas | [06](06-ga4-e-medicao.md) §6, [13](13-kpis-e-rituais.md) §3 | coberto (funil de 10 passos; relatório do Looker Studio que atualiza sozinho; números do CRM na aba `KPIs`) |
| B065 | Queda por etapa do wizard, inclusive prazo e investimento | [06](06-ga4-e-medicao.md) §6 | coberto (funil fechado de 10 passos; o evento já é do código) |
| B068 | Imagens reais no lugar de ilustração | [09](09-prova-cases-depoimentos.md) §9 | parcial (produção; uso no layout é código) |
| B077 | Cor de acento aprovada pelo dono | [15](15-registro-de-decisoes.md) D32 | decisão (código e contrastes prontos, feitos pelo `shell`; imagem para aprovar em [img/d32-acento.png](img/d32-acento.png), capturada antes da D38: o eyebrow do hero ainda diz "Florianópolis, SC", as cores não mudaram; falta o dono preencher a D32 com a data) |
| B086 | Seção do time com pessoas reais | [00](00-DADOS-DO-DONO.md) §B2 | parcial (dado do dono; a seção é código) |
| B088 | CNPJ e razão social no rodapé | [00](00-DADOS-DO-DONO.md) §A2 | parcial (par informado pelo dono em 20/10/2026 e no `dono.json`, D39; o rodapé já mostra "Lemamon.dev LTDA · CNPJ 69.700.690/0001-98"; falta o dono conferir grafia e município da sede contra o cartão CNPJ) |
| B089 | Política de Privacidade com dados reais | [10](10-lgpd-operacional.md), [00](00-DADOS-DO-DONO.md) §A3 | parcial (decisões e dados; a página é do `shell`) |
| B103 | Search Console, Bing e sitemap | [08](08-search-console-e-seo-local.md) §1 | coberto |
| B106 | Conversão do GA4 no Ads | [07](07-google-ads.md) §4.3 | parcial (só como secundária; conflito com a conversão por evento do BLUEPRINT §10.2) |
| B107 | Alerta quando a captura de lead falhar | [06](06-ga4-e-medicao.md) §7 | coberto (condição NRQL com **Event timer** de 60 s, janela de 1 min e limiar acima de 0; destino + workflow; simulação em produção pelo console, sem deploy; ressalva do aviso de cookies com consentimento registrada na D05) |
| B109 | Oferta de Sustentação na proposta | [02](02-proposta-e-politica-comercial.md) §8 | coberto |
| B110 | Artigos de fundo de funil | [12](12-canais-indicacao-linkedin-conteudo.md) §7, [12a](12a-rascunhos-blog.md) | parcial (pauta e 3 rascunhos completos; publicação depende do autor B298; "quanto custa" não vira post, BLUEPRINT §6.12) |
| B111 | Oferta MVP | [02](02-proposta-e-politica-comercial.md) §2 | parcial (interno; o site não publica prazo de MVP, BLUEPRINT §12) |
| B112 | Diagnóstico gratuito como CTA principal | [01](01-diagnostico-e-devolutiva.md) | coberto (operação; o CTA já é o do BLUEPRINT) |
| B113 | `/sobre` com dados reais | [00](00-DADOS-DO-DONO.md) §A2 e §B2 | parcial (dados; página é código do `gated`) |
| B114 | Material compartilhável | [02](02-proposta-e-politica-comercial.md) §12 | parcial (one-pager; versão para impressão dos cases é código) |
| B119 | `lead_qualified` no GA4 | [06](06-ga4-e-medicao.md) §5 | coberto por configuração do GA4 (evento criado a partir de `lead_submitted` com `score = A`); a qualificação revisada por pessoa segue pela importação offline ([07](07-google-ads.md) §4.4) |
| B120 | Lead qualificado como conversão do Ads | [07](07-google-ads.md) §1, §4.1, §4.4, §4.5, §5 e §7, [15](15-registro-de-decisoes.md) D09, [13](13-kpis-e-rituais.md) §6 | coberto (gatilho de troca da ação principal: ≥ 30 conversões `Lead qualificado` em 30 dias, padrão que o dono pode mudar na D09; `lead_qualified` do GA4 importado como secundária desde o lançamento e candidato a principal se a offline não bater o gatilho em 90 dias; **até a troca, nenhuma campanha usa lance por conversão**: CPC manual ou Maximizar cliques com teto e aplicação automática de recomendações de lances desligada (07 §1 e §5, linha "Lances"; regra da D09, conferida no ritual mensal, 07 §7); saída para baixo volume no dia 90 (07 §4.5, D09); conferência mensal dos pedidos de Ads sem `gclid`, com o pedido de fallback `_gcl_aw` ao `conversion` acima de 30%). A troca em si acontece na conta do Ads quando o gatilho for batido |
| B146 | WhatsApp fora do horário | [04](04-sla-follow-up-e-nutricao.md) §7 | parcial (mensagem de ausência; o rótulo no site é código) |
| B219 | Diagramas de arquitetura com as cores dos tokens | [09](09-prova-cases-depoimentos.md) §9 e §14 | parcial (guia de estilo e conferência prontos; os diagramas dependem de projeto real entregue e autorizado) |
| B221 | Marca gráfica: wordmark mono com `.dev` em acento | [15](15-registro-de-decisoes.md) D34 | decisão (protótipo em `src/components/shell/Wordmark.astro`, sem uso em nenhuma página; imagem em [img/d34-wordmark.png](img/d34-wordmark.png); falta o dono aprovar) |
| B226 | Atender fora do Brasil (GMT-3, EUA) | [15](15-registro-de-decisoes.md) D31, [07](07-google-ads.md) §2 | decisão (recomendação: não publicar até haver atendimento em inglês, contrato e faturamento para o exterior) |
| B253 | Renovate: PR semanal agrupado e patch com CI verde entrando sozinho | [13](13-kpis-e-rituais.md) §10 | coberto (o `renovate.json` é código do `shell`; instalação do app, "Allow auto-merge", proteção da `main` com o check da CI e revisão semanal no playbook) |
| B265 | Avaliar Decap CMS | [13](13-kpis-e-rituais.md) §7, [15](15-registro-de-decisoes.md) D25 | decisão (agendada para o dia 90) |
| B273 | Netlify Analytics | [06](06-ga4-e-medicao.md) §11, [15](15-registro-de-decisoes.md) D10 | decisão |
| B274 | New Relic: replay | [10](10-lgpd-operacional.md) §11, [15](15-registro-de-decisoes.md) D18 | decisão (gravação já desligada no código pelo `shell`; playbook 10 atualizado; falta o dono assinar a D18) |
| B275 | Monitor de uptime | [06](06-ga4-e-medicao.md) §8 | coberto |
| B279 | Confirmar fatos antes de publicar | [00](00-DADOS-DO-DONO.md) §B5, [15](15-registro-de-decisoes.md) §3 | coberto |
| B285 | Cláusula de portfólio no contrato | [09](09-prova-cases-depoimentos.md) §3 | coberto (texto-base; revisão do advogado) |
| B286 | Tempo até o primeiro sistema no ar | [13](13-kpis-e-rituais.md) §8 | parcial (medir; publicar exige mudar o BLUEPRINT §12) |
| B287 | Depoimento em vídeo | [09](09-prova-cases-depoimentos.md) §12, [00](00-DADOS-DO-DONO.md) §B9 | bloqueado por dado do dono (produção do vídeo, 09 §12; publicação via 00 §B9: `depoimentos[].video` com `autorizacao.video: true`; o site já carrega sob demanda, sem player de terceiros) |
| B291 | Squad como continuidade | [02](02-proposta-e-politica-comercial.md) §2, [15](15-registro-de-decisoes.md) D02 | decisão |
| B298 | Autor real do conteúdo | [12](12-canais-indicacao-linkedin-conteudo.md) §7 | coberto |
| B299 | Medium com canonical e nenhum perfil vazio no site | [00](00-DADOS-DO-DONO.md) §B3, [12](12-canais-indicacao-linkedin-conteudo.md) §6 e §7, [14](14-calendario-90-dias.md), [15](15-registro-de-decisoes.md) D35 e D01 | decisão (regra única e conferência antes de cada deploy de produção prontas; em 20/10/2026 Medium e GitHub estavam vazios; falta o dono escolher, por perfil, publicar conteúdo ou tirar do ar; tirar do footer exige a D01) |
| B300 | Cadência de posts | [12](12-canais-indicacao-linkedin-conteudo.md) §7, [13](13-kpis-e-rituais.md) §6, [14](14-calendario-90-dias.md), [15](15-registro-de-decisoes.md) D36 | coberto (15 dias a partir da volta do blog, calendário dos posts 4 a 10, contagem mensal pelo `publicadoEm` no ritual) |
| B302 | Checklist de tom e teste da negação | [12](12-canais-indicacao-linkedin-conteudo.md) §7 | coberto (lint automático de termos proibidos seria código, opcional) |
| B303 | Gatilho de nicho com 3 cases | [13](13-kpis-e-rituais.md) §8, [09](09-prova-cases-depoimentos.md) §2 e §8 | coberto (conferido a cada case publicado e no trimestral; `setor` padronizado) |
| B310 | Validar palavras-chave no Keyword Planner | [08](08-search-console-e-seo-local.md) §2 | coberto (BLUEPRINT §3.1 + todos os termos do 06 §6.3.1, com decisão prévia) |
| B312 | Campanha de indicação 1:1 | [12](12-canais-indicacao-linkedin-conteudo.md) §2, [05](05-crm-e-funil.md) §5 e §8 | coberto (`utm_content` no CRM; `indicacoes_recebidas` por fórmula; indicador mensal) |
| B313 | Parcerias de canal com comissão | [12](12-canais-indicacao-linkedin-conteudo.md) §3, [05](05-crm-e-funil.md) §5 e §8 | coberto (link com UTM, nunca `?ref=`; apresentação sem link com protocolo `PAR-…`; aba `Parceiros` com `indicacoes` por fórmula; indicador mensal soma os dois) |
| B314 | Google Ads por intenção, negativas, destino | [07](07-google-ads.md) §5 | coberto |
| B315 | LinkedIn dos sócios | [12](12-canais-indicacao-linkedin-conteudo.md) §6 | coberto |
| B316 | Marketplaces | [12](12-canais-indicacao-linkedin-conteudo.md) §5, [15](15-registro-de-decisoes.md) D14 | decisão |
| B317 | Clutch e GoodFirms | [08](08-search-console-e-seo-local.md) §4 | coberto (com o conflito do preço-hora, D23) |
| B318 | ACATE e comunidade | [12](12-canais-indicacao-linkedin-conteudo.md) §4 | coberto (aba `Eventos`, link com UTM, protocolo `COM-…`, pauta mensal) |
| B319 | Não investir em LinkedIn Ads e GetNinjas | [12](12-canais-indicacao-linkedin-conteudo.md) §9, [15](15-registro-de-decisoes.md) D13 | decisão |
| B321 | A/B com e sem faixa de preço | [13](13-kpis-e-rituais.md) §9 | parcial (só depois de `precos.ts`; execução é código) |
| B323 | Newsletter mensal | [04](04-sla-follow-up-e-nutricao.md) §5.1, §5.2 e §6, [05](05-crm-e-funil.md) §5, [10](10-lgpd-operacional.md) §7 | coberto (opt-in no D+30, colunas de consentimento, `newsletter_descadastro_em`, sincronização de descadastros antes de cada envio, lista que exclui qualquer e-mail descadastrado, importação que nunca reinscreve, teste de descadastro com reimportação e métricas; ativação depende de D33, da Política e do blog com 3 posts) |
| B325 | WhatsApp Business | [04](04-sla-follow-up-e-nutricao.md) §7 | coberto (saudação e ausência nos 3 idiomas; respostas rápidas em pt, en e es) |
| B327 | Profundidade de rolagem da Home | [06](06-ga4-e-medicao.md) §3, §5 e §6 | coberto (evento é código do `home`; dimensão "Profundidade de rolagem" e exploração "Rolagem da Home") |
| B329 | Troca de idioma | [06](06-ga4-e-medicao.md) §3, §5 e §6 | coberto (evento é código do `shell`; dimensões de idioma de origem e destino e exploração "Troca de idioma") |
| B331 | Início do wizard com origem de entrada | [06](06-ga4-e-medicao.md) §3, §5 e §6 | coberto (evento é código do `conversion`; `wizard_view`, `wizard_restart`, dimensão "Origem de entrada" e `wizard_view` no funil do site) |
| B337 | Preenchimento por campo dos formulários | [06](06-ga4-e-medicao.md) §3, §5 e §6 | coberto (eventos são código do `conversion`; dimensões de formulário, campo e erro e exploração "Campos dos formulários") |
| B342 | Conversões offline no Ads | [07](07-google-ads.md) §4.4 | coberto |
| B343 | Search Console no GA4 | [06](06-ga4-e-medicao.md) §9 | coberto (vínculo + publicar a coleção na Biblioteca) |
| B344 | Consent Mode e aviso de cookies | [10](10-lgpd-operacional.md) §11, [15](15-registro-de-decisoes.md) D05 | decisão (aviso de cookies e Consent Mode v2 prontos no código, feitos pelo `shell`, e ligados por `privacidade.baseAnuncios = "consentimento"`; falta o dono decidir a D05 com o advogado) |
| B345 | Dimensões personalizadas no GA4 | [06](06-ga4-e-medicao.md) §5 | coberto |
| B346 / B347 | LinkedIn Insight Tag e Meta Pixel (só remarketing) | [12](12-canais-indicacao-linkedin-conteudo.md) §9, §9.1 e §9.2, [00](00-DADOS-DO-DONO.md) §A3, [13](13-kpis-e-rituais.md) §6, [15](15-registro-de-decisoes.md) D12 | decisão (código pronto e desligado, feito pelo `shell`: liga com `dados/dono.json › privacidade.pixels.<pixel> = { id, prazo }`, só com D05 = consentimento, só em produção e depois do "Aceitar", Meta fora do `/orcamento*` e do `/contato`; passo a passo para ligar e conferir — LinkedIn "Ativa" no Campaign Manager, Meta com só `PageView` no Events Manager —, desligar e revisão trimestral prontos; recomendação: não instalar agora) |
| B348 | Listas de remarketing | [06](06-ga4-e-medicao.md) §10, [15](15-registro-de-decisoes.md) D07 | decisão (código pronto; depende só de D05 = consentimento, `remarketing = true` e da configuração das contas: 3 públicos com exclusão permanente de `lead_submitted` e `contact_submitted`, listas só com quem aceitou o aviso, tamanho mínimo do Ads, 06 §10) |
| B349 | Verba e critérios de escalada | [07](07-google-ads.md) §6, [15](15-registro-de-decisoes.md) D24 | coberto |
| B350 | Revisões de 60 e 90 dias | [13](13-kpis-e-rituais.md) §7 | coberto |
| B351 | Premissas do negócio | [02](02-proposta-e-politica-comercial.md) §1 | coberto |
| B353 | Custo-hora e piso de margem | [02](02-proposta-e-politica-comercial.md) §3 | coberto |
| B354 | Empacotar a Sprint de Descoberta | [02](02-proposta-e-politica-comercial.md) §7, [00](00-DADOS-DO-DONO.md) §B7 e §B8 | bloqueado por dado do dono (página pronta; `descoberta.naoInclui` libera "O que a Descoberta não inclui" com o mesmo destaque de "O que você recebe" e é preenchido **no mesmo deploy** dos 3 campos de formato, 00 §B8; a Descoberta é gratuita e não tem linha em `precos` desde a D44; o combinado da Descoberta parte da mesma lista, 02 §7) |
| B355 | Preço fechado, nunca preço-hora | [02](02-proposta-e-politica-comercial.md) §4 | coberto |
| B356 | Teto da Descoberta obrigatória | [02](02-proposta-e-politica-comercial.md) §5, [15](15-registro-de-decisoes.md) D04 | sem objeto desde a D44 (21/10/2026: a Descoberta é gratuita e condicional; não há descoberta paga obrigatória). O que sobra é a D04: no máximo um critério interno para recomendar a Descoberta, nunca no site |
| B357 | Colchão de risco e horas reais | [02](02-proposta-e-politica-comercial.md) §5 | coberto |
| B358 | Roteiro do diagnóstico e modelo da devolutiva | [01](01-diagnostico-e-devolutiva.md) | coberto |
| B359 | Limite semanal de diagnósticos | [01](01-diagnostico-e-devolutiva.md) §7, [15](15-registro-de-decisoes.md) D19 | coberto (agenda por `dados/dono.json › agenda`; sem cobrança simbólica: conflito com "gratuito") |
| B360 | Regras de desenho da qualificação | [03](03-qualificacao-e-score.md) §1 | coberto (lado operacional; o wizard já segue as regras) |
| B363 | Proposta padronizada e apresentada ao vivo | [02](02-proposta-e-politica-comercial.md) §7, §8, §8b e §9, [05](05-crm-e-funil.md) §5 e §8, [13](13-kpis-e-rituais.md) §6 | coberto (um modelo por oferta; aba `Propostas` com uma linha por proposta, `enviada_em`, `apresentada_em` e dias úteis até apresentar; linha vermelha fora do prazo; % apresentadas ao vivo e no prazo no trimestral) |
| B364 | Follow-up D+3, D+7, D+14 | [04](04-sla-follow-up-e-nutricao.md) §4, [05](05-crm-e-funil.md) §5 | coberto (`fu_d3`/`fu_d7`/`fu_d14` calculadas; `fu_dN_feito_em` registra o envio e apaga o vermelho; linha vermelha sem status final depois do D+14; teste da formatação no 15 §2) |
| B365 | Escopo detalhado e contrato | [02](02-proposta-e-politica-comercial.md) §10 | coberto (checklist; texto do advogado) |
| B366 | Entrada antes do kickoff e marcos | [02](02-proposta-e-politica-comercial.md) §6, [05](05-crm-e-funil.md) §5, [16](16-processo-de-entrega.md) §1 | coberto (`kickoff_em` no CRM; conferência trimestral) |
| B367 | Meta de MRR e de conversão em sustentação | [13](13-kpis-e-rituais.md) §5 e §6, [05](05-crm-e-funil.md) §5, [16](16-processo-de-entrega.md) §6, [14](14-calendario-90-dias.md) | coberto (situação atual, metas por trimestre com data-limite, real × meta no ritual mensal; o real sai de `sustentacao_contrato_em`, `sustentacao_valor_mensal` e `sustentacao_encerrada_em`, com fórmula e teste) |
| B368 | Componentes reutilizáveis | [13](13-kpis-e-rituais.md) §8.1 | coberto (aba `Componentes` com contagem de clientes por setor, horas economizadas por fórmula e trava para produto/SaaS) |
| B369 | Concentração de receita | [13](13-kpis-e-rituais.md) §5 | coberto |
| B370 | Régua de cobrança e consulta de CNPJ | [13](13-kpis-e-rituais.md) §5, [02](02-proposta-e-politica-comercial.md) §10 | coberto |
| B371 | Dependência de pessoa-chave | [13](13-kpis-e-rituais.md) §3.2 e §8, [16](16-processo-de-entrega.md) | coberto (processo de entrega escrito; `bloco_prospeccao_cumprido` no painel) |
| B372 | Depoimento no go-live | [09](09-prova-cases-depoimentos.md) §4, §5.1 e §15, [05](05-crm-e-funil.md) §5, [13](13-kpis-e-rituais.md) §6 | coberto (gatilho `go_live_em`; `depoimento_status` próprio, separado de `status_prova`; KPI só com `autorizado`, meta 100%; linha vermelha para pedido sem resposta depois do prazo; conferência mensal) |
| B373 | Linha de base e meta de leads | [13](13-kpis-e-rituais.md) §2, [06](06-ga4-e-medicao.md) §5 | coberto |
| B374 | % de leads A+B | [13](13-kpis-e-rituais.md) §4, [06](06-ga4-e-medicao.md) §6 | coberto |
| B375 | Funil comercial e ciclo no CRM | [05](05-crm-e-funil.md) §8 | coberto |
| B376 | Painel de KPIs financeiros | [13](13-kpis-e-rituais.md) §1 e §5 | coberto (5 essenciais numa linha por mês; fonte e responsável de cada KPI; `horas_pre_venda` no CRM) |
| B377 | Rituais comerciais | [13](13-kpis-e-rituais.md) §6 | coberto |
| B378 | Case anonimizado | [09](09-prova-cases-depoimentos.md) §10 | coberto |
| B380 | Netlify detecta o form e envio real em produção | [05](05-crm-e-funil.md) §2 | coberto |
| B381 | Campos novos do lead chegando ao painel do Netlify | [05](05-crm-e-funil.md) §2 | coberto (envio de teste com todos os campos, conferidos um a um; execução no primeiro deploy de produção, B380) |
| B383 | Pacotes abaixo do teto | [02](02-proposta-e-politica-comercial.md) §3 e §5, [01](01-diagnostico-e-devolutiva.md) §5 e §6, [05](05-crm-e-funil.md) §5, [15](15-registro-de-decisoes.md) D03 | decisão (modelo da tabela de pacotes com margem mínima de 40% já preenchida em G e na coluna da tabela; opção `pacote {nome}` na recomendação do diagnóstico e na devolutiva; `proposta_oferta = pacote` no CRM, com o nome em `observacoes`; as chaves de `faq._notes.skip_discovery` já foram reescritas na D44, e `semDescoberta` não é mais pré-requisito) |
| B384 | NDA padrão e respostas de segurança | [02](02-proposta-e-politica-comercial.md) §11, [00](00-DADOS-DO-DONO.md) §B5, [14](14-calendario-90-dias.md) | coberto (`confirmacoes.nda` só liga com o NDA mútuo **e** o documento de segurança prontos; comentário da flag no código é pedido ao `gated`) |
| B385 | Família tipográfica da marca | [15](15-registro-de-decisoes.md) D40 | decisão (código pronto, feito pelo `home`/`shell`: Motiva Sans 300/700 em 2 woff2 latin + latin-ext com preload e mono do sistema só em eyebrow, badge, numeração, métrica e código, `src/styles/tokens.css` §3; imagem para aprovar em [img/d40-tipografia.png](img/d40-tipografia.png); falta o dono preencher a D40 com a data) |
| B387 | Listas de "melhores empresas" | [08](08-search-console-e-seo-local.md) §5 | coberto |

## Itens não-código que ficaram fora (e por quê)

| Id | Item | Motivo |
|---|---|---|
| B074 | E-mail transacional automático ao lead | BLUEPRINT §7.8 ("não há envio ao lead"); exige código, provedor novo na Política e domínio próprio. O primeiro contato humano dentro do SLA faz esse papel ([04](04-sla-follow-up-e-nutricao.md) §1) |
| B122 | Calculadora pública de estimativa | nenhum preço publicado (decisão 3 do dono; BLUEPRINT §1.3) |
| B123 | Landing pages por segmento | as páginas de serviço são os destinos de Ads (BLUEPRINT §6.5); exige cases do setor e código ([07](07-google-ads.md) §8) |
| B301 / B311 | Iscas com captura de e-mail | BLUEPRINT não prevê; exige formulário, finalidade nova na Política e ferramenta de e-mail ([12](12-canais-indicacao-linkedin-conteudo.md) §8) |
| B320 | A/B do wizard 4 × 2 passos | BLUEPRINT fixa N = 6 (§7.2) |
| B322 | A/B do e-mail no passo 1 | contradiz "valor antes do dado" (§2.4) |
| B324 | Sequência para quem baixou isca | não há isca |
| B326 | Migrar para o Google Tag Manager | decisão preparada (D11): não agora |
| B040 / B073 / B087 | Prazo de resposta publicado no site | BLUEPRINT §12 proíbe SLA com número no copy; o SLA é interno ([04](04-sla-follow-up-e-nutricao.md) §1) |
| B278 / B028 | Posicionamento e idiomas | já decididos (BLUEPRINT §1.1 e §1.7) |

Itens de código do backlog (componentes, eventos, performance, a11y, infra) são dos agentes `shell`, `home`, `pages`, `conversion` e `gated` e não aparecem aqui.

## Pedidos a outros donos (registrados no retorno deste agente)

- `shell` — feito: `faq.conditional.nda.answer_draft` já usa `{email}`.
- `gated` — `dados/dono.schema.json` (description de `confirmacoes.nda`) e `src/config/confirmacoes.ts` (comentários de `nda`): acrescentar "só ligar com NDA mútuo revisado + documento de respostas de segurança prontos para envio em até 1 dia útil (B384, playbook 02 §11)".
- `shell` — feito: `Logo.astro` e `Logo.test.ts` já citam a D34 (o wordmark é a D34 do [15](15-registro-de-decisoes.md)), e o protótipo mora em `src/components/shell/Wordmark.astro`, que nenhuma página importa (B221). Opcional: mostrar o `Wordmark.astro` só com a camada fictícia ligada, para o dono ver ao vivo, desde que o CSS dele não entre no bundle de produção.
- `conversion` (opcional) — incluir `scroll_depth` e `pricing_view` em `EventParams` de `src/lib/analytics.ts` e tirar o cast de `src/components/shared/section-events.ts` (B327).
- `shell` — Política: feito para as 5 ferramentas previstas (agenda, CRM em nuvem, e-mail de acompanhamento, automação/webhook, chat da equipe), que o dono liga em `dados/dono.json › privacidade.ferramentas`; item novo só para ferramenta fora dessa lista ([10](10-lgpd-operacional.md) §3).
- `conversion` — feito: campo oculto `subject` no `briefing` (`[score] protocolo`, [05](05-crm-e-funil.md) §3) e `lead_failed` também no New Relic (B272; alerta no [06](06-ga4-e-medicao.md) §7).
- `shell` — Política: finalidade e base legal (consentimento) da newsletter, ligadas por um campo de `dados/dono.json › privacidade`, e o texto do operador de e-mail cobrindo a newsletter, antes do 1º envio (B323; [04](04-sla-follow-up-e-nutricao.md) §6).
- `shell` — feito: `allow_ad_personalization_signals`, `allow_google_signals` e `ad_personalization` ligados a `privacidade.remarketing` e ao aceite do aviso de cookies (`src/scripts/gtag-inline.ts`, `src/scripts/consent.ts`; B348, [06](06-ga4-e-medicao.md) §10).
- `conversion` (opcional, B348) — em `src/scripts/consent.test.ts`, um caso com `data-personalization="true"` que confira que o clique em Aceitar manda `ad_personalization: "granted"` (hoje só o caso `"false"` tem teste).
- `gated` (recomendado, B354) — em `src/config/validate.ts`: com `hasDiscoveryFormat` = true (3 campos) e `descoberta.naoInclui` vazio, aviso no build (ou falha no build de produção, `CONTEXT=production`), com teste em `tests/unit/gates-features.test.ts`. Hoje só o playbook segura a regra (00 §B7 e §B8).
- ~~`shell` e redator — variantes de todas as chaves de `faq._notes.skip_discovery` antes de qualquer `semDescoberta = true`~~ **Feito na D44 (21/10/2026):** a Descoberta passou a ser gratuita e só quando necessária, as chaves foram reescritas para todo lead e as variantes `*_skip_variant` do `/orcamento` viraram o texto base (B383; [02](02-proposta-e-politica-comercial.md) §5).
- `conversion` (condicional, B120) — só se a conferência mensal do [07](07-google-ads.md) §7 mostrar mais de 30% dos pedidos de Ads sem `gclid`: em `buildAttribution` (`src/islands/wizard/lead.ts`), ler o `gclid` do cookie de primeira parte `_gcl_aw` (`GCL.<timestamp>.<gclid>`) quando o da URL e o do toque da sessão estiverem vazios, depois de confirmar que `privacy.sections.navigation_data.items.google_ads` cobre isso nos 3 idiomas.
- `gated` — publicar os rascunhos do [12a](12a-rascunhos-blog.md) como MDX em `src/content/posts/` depois que o autor (B298) revisar e assinar.
- integrador e `shell` — se D01 = "só com `publicar`" (pré-requisito da opção (b) da D35, B299): BLUEPRINT §8.5 e página de contato (integrador) e, no código, `Footer.astro` e `sameAs()` de `src/components/shell/seo.ts` (`shell`) e `src/components/contact/ContactChannels.astro` (`conversion`) filtrados por `perfis.<id>.publicar`. Hoje os três listam os perfis sempre, e o CONTRACT §15.1 diz que `publicar: false` tira o perfil do ar, o que só vale para as seções gated.
- `shell` — só quando uma arte de `public/assets/img/og/` mudar: nome de arquivo novo (versão) em `ogImageFile` e em `scripts/build-og-image.sh`, para as redes não mostrarem a imagem antiga (B024; [08](08-search-console-e-seo-local.md) §1.1).
- integrador (B385, D40) — `docs/arquitetura/CONTRACT.md` §9 (linha "Fonte: Motiva Sans…"): trocar "woff2 com subset latino" por "2 woff2 com subset latin + latin-ext, preload dos 2" e acrescentar "`--font-mono` = pilha do sistema (`ui-monospace`, SF Mono, Menlo, Consolas), só rótulos técnicos (eyebrow, badge, numeração, código) e métricas", como já está em `src/styles/tokens.css` §3.
- integrador — se D31 = sim: BLUEPRINT §1.5 e §9 e a flag `confirmacoes.atendeExterior` (`gated`); se D33 ligar a retomada automática: registro em BLUEPRINT §7.8 de que existe e-mail automático para leads C.
