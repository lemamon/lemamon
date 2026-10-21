# 14 — Calendário de 90 dias (06-marketing §6.8, adaptado às decisões do dono)

**Base:** 06-marketing §6.8. **O que mudou:** o site agora é Astro estático com o método como herói, nenhum preço publicado, o diagnóstico gratuito de 45 minutos como única porta e `/orcamento` no lugar de `/projects`. Por isso, metade do calendário original já foi feita pela migração (código) e alguns itens saíram (ver o fim deste documento).

**Dia 0 = o site novo em produção**, depois dos bloqueadores de lançamento. Datas reais: dia 0 = [PREENCHER].

Legenda: **D** = dono · **C** = comercial · **I** = integrador/agentes de código.

---

## Antes do dia 0 — bloqueadores

- [x] **D** Controlador em `dados/dono.json › empresa` (razão social + CNPJ: os dois informados em 20/10/2026, D39 em [15](15-registro-de-decisoes.md); falta só conferir a grafia e o município da sede contra o cartão CNPJ) — [00](00-DADOS-DO-DONO.md) §A2
- [ ] **D** + advogado: decisões e prazos de `privacidade.ts`; revisão jurídica — [10](10-lgpd-operacional.md) §2 e §4
- [ ] **D** Google Ads: conversões otimizadas desligadas; personalização conforme `baseAnuncios` — [07](07-google-ads.md) §1
- [ ] **D** Netlify: `PUBLIC_WHATSAPP_NUMBER` e `PUBLIC_GA4_ID` (escopo Production) — [00](00-DADOS-DO-DONO.md) §A1
- [ ] **D** Responder `formatoDiagnostico` e `escopoMudanca` (as duas confirmações de maior efeito em conversão) — [00](00-DADOS-DO-DONO.md) §B1 e §B5
- [ ] **D** Notificação de formulários configurada + filtro no e-mail — [05](05-crm-e-funil.md) §3
- [ ] **I** OG image nova por idioma; formulários fora do replay do New Relic (bloqueadores 6 e 7)
- [ ] **D** Perfis com conteúdo antes do go-live: todo perfil que aparece no site (footer, Home, `/contato`, `/como-trabalhamos`) com pelo menos 1 conteúdo publicado, ou tirado do ar; em 20/10/2026 Medium e GitHub estavam vazios (decisão na D35, com a D01 para o footer e o `/contato`) — [00](00-DADOS-DO-DONO.md) §B3

## Quinzena 1 (dias 1–15) — Ligar e ver

- [ ] **C** Dia 1: verificação em produção dos formulários `briefing` e `contato` (B380) — [05](05-crm-e-funil.md) §2
- [ ] **C** Planilha de CRM no ar; todo pedido registrado — [05](05-crm-e-funil.md) §5
- [ ] **D** SLA interno definido, responsável e backup nomeados — [04](04-sla-follow-up-e-nutricao.md) §1
- [ ] **C** WhatsApp Business: perfil, saudação, ausência, respostas rápidas, etiquetas — [04](04-sla-follow-up-e-nutricao.md) §7
- [ ] **D** GA4: propriedade, medição aprimorada ajustada, eventos-chave, dimensões, tráfego interno, retenção — [06](06-ga4-e-medicao.md) §2 a §5
- [ ] **D** Alerta de `lead_failed` e monitor de uptime — [06](06-ga4-e-medicao.md) §7 e §8
- [ ] **D** Search Console (domínio) e Bing; sitemap enviado; indexação das páginas principais pedida — [08](08-search-console-e-seo-local.md) §1
- [ ] **D** Google Ads: auditoria das URLs finais (nada em `/projects`), "Solicitar cotação" registrando, conversão por URL criada como secundária, `lead_qualified` do GA4 importado como secundária — [07](07-google-ads.md) §3, §4 e §4.5
- [ ] **C** Roteiro do diagnóstico e modelo da devolutiva em uso desde o primeiro pedido — [01](01-diagnostico-e-devolutiva.md)
- [ ] **D** Perfis: a conferência do 00 §B3 repetida a cada deploy de produção, com o resultado em [15](15-registro-de-decisoes.md) §2 — [00](00-DADOS-DO-DONO.md) §B3
- [ ] **D** Logo após o primeiro deploy: prévia de compartilhamento revalidada no Sharing Debugger, no Post Inspector e no WhatsApp (B024) — [08](08-search-console-e-seo-local.md) §1.1
- [ ] **D** Cláusula de portfólio no contrato padrão; NDA mútuo com o advogado e documento de respostas de segurança (1–2 páginas), os dois antes de ligar `confirmacoes.nda` — [09](09-prova-cases-depoimentos.md) §3, [02](02-proposta-e-politica-comercial.md) §11
- [ ] **D** Rituais semanal, mensal e trimestral na agenda; revisões dos dias 60 e 90 marcadas — [13](13-kpis-e-rituais.md) §6 e §7
- [ ] **D** GitHub: app Renovate só no repositório, "Allow auto-merge", `main` protegida com o check `build, testes e E2E`; depois do lançamento, `E2E_PRODUCAO_ATIVO = true` (B253) — [13](13-kpis-e-rituais.md) §10

## Quinzena 2 (dias 16–30) — Base comercial e dados do dono

- [ ] **D** Premissas do negócio, custo-hora e piso de margem; política comercial assinada — [02](02-proposta-e-politica-comercial.md) §1 a §4
- [ ] **D** Meta de MRR e de conversão em sustentação: números atuais e metas trimestrais com data registrados — [13](13-kpis-e-rituais.md) §5
- [ ] **D** Processo de entrega lido e adotado (kickoff, ciclo de 2 semanas, go-live, subcontratado) — [16](16-processo-de-entrega.md)
- [ ] **D** Modelos de proposta (desenvolvimento e sustentação de sistema já no ar) e o combinado da Descoberta, gratuita, prontos — [02](02-proposta-e-politica-comercial.md) §7, §8 e §8b
- [ ] **D** Palavras-chave validadas no Keyword Planner — [08](08-search-console-e-seo-local.md) §2
- [ ] **D** Perfil da Empresa no Google criado e em verificação, com área de serviço em São Paulo, SP (D38); Rich Results Test da Home sem erros — [08](08-search-console-e-seo-local.md) §3
- [ ] **D** Lista de 30–50 contatos e início das mensagens de indicação — [12](12-canais-indicacao-linkedin-conteudo.md) §2
- [ ] **D** Uma pessoa real em `dados/dono.json › time` + razão social e CNPJ → `/sobre` no ar — [00](00-DADOS-DO-DONO.md) §B2
- [ ] **D** Confirmações de FAQ: nota fiscal, outras cidades (define a segmentação do Ads), propriedade do código, `confirmacoes.nda` (só com o NDA e o documento de segurança prontos, [02](02-proposta-e-politica-comercial.md) §11) — [00](00-DADOS-DO-DONO.md) §B5
- [ ] **D** E-mail no domínio lemamon.dev, antes de aumentar a verba — [11](11-email-dominio-proprio.md)
- [ ] **C** Dia 30: linha de base de leads e % A+B registrada; primeira reconciliação Netlify × CRM × GA4 — [13](13-kpis-e-rituais.md) §2

## Quinzena 3 (dias 31–45) — Ligar a demanda

- [ ] **D** Verba inicial e critérios de escalada decididos — [07](07-google-ads.md) §6
- [ ] **D** Google Ads Pesquisa: 2 a 3 campanhas para as páginas de serviço, frase e exata, negativas, **lances em CPC manual ou Maximizar cliques com teto** (nunca Maximizar conversões antes da troca da D09) e aplicação automática de recomendações de lances desligada — [07](07-google-ads.md) §1 e §5
- [ ] **D** LinkedIn: rotina de 2–3 posts por semana; página de empresa criada — [12](12-canais-indicacao-linkedin-conteudo.md) §6
- [ ] **D** Primeiras conversas com 3–5 parceiros; acordo-modelo com o advogado — [12](12-canais-indicacao-linkedin-conteudo.md) §3
- [ ] **D** `dados/dono.json › qualificacao`: faixas e corte de MQL (preenchido pela decisão 7; revisar a partir dos pisos das ofertas) — [00](00-DADOS-DO-DONO.md) §B4
- [ ] **C** Cadências de retomada e de follow-up de proposta rodando no CRM — [04](04-sla-follow-up-e-nutricao.md) §3 a §5

## Quinzena 4 (dias 46–60) — Prova e primeiro ajuste

- [ ] **C** Pedidos de case e de depoimento aos clientes com projeto entregue; termos assinados; primeiras entrevistas — [09](09-prova-cases-depoimentos.md) §5 a §7
- [ ] **C** Pedido de autorização de logos (a faixa só aparece com 4) — [09](09-prova-cases-depoimentos.md) §13
- [ ] **D** Conversões offline criadas no Google Ads; primeiro envio do CSV — [07](07-google-ads.md) §4.4
- [ ] **D** Autor do blog definido; os 3 rascunhos prontos revisados por ele — [12](12-canais-indicacao-linkedin-conteudo.md) §7 e [12a](12a-rascunhos-blog.md)
- [ ] **D** Clutch/GoodFirms, só se já houver cliente disposto a avaliar (e decidida a questão do preço-hora) — [08](08-search-console-e-seo-local.md) §4
- [ ] **D+C** **Revisão do dia 60** — [13](13-kpis-e-rituais.md) §7

## Quinzena 5 (dias 61–75) — Ampliar o que funcionou

- [ ] **D** Comparação das conversões por evento e por URL (30 dias completos) e escolha da principal — [07](07-google-ads.md) §4.2
- [ ] **D** Se decidido: `dados/dono.json › precos` (faixas de referência) e `› agenda` (com a Política atualizada) — [00](00-DADOS-DO-DONO.md) §B6 e §B7
- [ ] **D** `dados/dono.json › descoberta`, `› sustentacao`, `› engenharia` — [00](00-DADOS-DO-DONO.md) §B8
- [ ] **D** Blog no ar com 3 posts (anote o dia D no 12 §7: é dele que contam as datas dos próximos); republicação no Medium com canonical e, só então, Medium de volta ao site se tinha saído pela D35 — [12](12-canais-indicacao-linkedin-conteudo.md) §7
- [ ] **D** 3 acordos de parceria assinados — [12](12-canais-indicacao-linkedin-conteudo.md) §3
- [ ] **D** Primeiro case publicado nos 3 idiomas; candidaturas às listas de "melhores empresas" — [08](08-search-console-e-seo-local.md) §5
- [ ] **D** Teste A/B do hero só se o volume mínimo existir — [13](13-kpis-e-rituais.md) §9

## Quinzena 6 (dias 76–90) — Consolidar e decidir

- [ ] **D** Segundo case publicado → `/cases` e a seção de cases da Home aparecem sozinhos — [09](09-prova-cases-depoimentos.md)
- [ ] **D** Post 4 publicado em D+15 (D = dia em que o blog voltou) — [12](12-canais-indicacao-linkedin-conteudo.md) §7. O post 5 (D+30) e os seguintes, a cada 15 dias, caem depois do dia 90: as datas ficam na tabela do 12 §7 e a conferência no ritual mensal ([13](13-kpis-e-rituais.md) §6)
- [ ] **D+C** Newsletter: só depois do blog com 3 posts (quinzena 5), da Política com a finalidade nova, da ferramenta (D33, com a importação que nunca reinscreve) e do teste de descadastro com reimportação (04 §6), o 1º envio no dia fixo, sempre depois da sincronização de descadastros do mês — [04](04-sla-follow-up-e-nutricao.md) §6
- [ ] **D** Decisão sobre aviso de cookies e remarketing revisitada com dados — [10](10-lgpd-operacional.md) §11
- [ ] **D+C** **Revisão do dia 90**: estimativas trocadas por números reais; alocação do próximo trimestre pelo canal de menor custo de aquisição — [13](13-kpis-e-rituais.md) §7. Se nenhuma ação de lead qualificado do Ads bateu o gatilho da D09, escolha a saída de baixo volume, (a) ou (b) — [07](07-google-ads.md) §4.5 e [15](15-registro-de-decisoes.md) D09
- [ ] **D+C** Primeiro ritual trimestral (margem, custo-hora, calibração do score, acessos) — [13](13-kpis-e-rituais.md) §6

---

## Itens do 06-marketing §6.8 e o que aconteceu com eles

| Item original | Situação |
|---|---|
| `/projects` respondendo 200, `404.html`, `lang`, `og:*`, `twitter:*`, title/description por rota, canonical, sitemap, JSON-LD, manifest, pré-renderização, botões mortos da tela de sucesso, botão de WhatsApp, barra de progresso, "ainda não sei", campos de orçamento e prazo, aviso de LGPD, New Relic inline | **código da migração** (agentes `shell`, `home`, `pages`, `conversion`, `gated`) |
| Instalar GTM | **não agora**: o site usa a tag do Google direto; GTM seria ferramenta nova na Política e na CSP ([15](15-registro-de-decisoes.md)) |
| LinkedIn Insight Tag e Meta Pixel | **não agora**: exigem aviso de cookies e Política ([12](12-canais-indicacao-linkedin-conteudo.md) §9) |
| Webhook do Heroku → WhatsApp/Telegram | **substituído** pela notificação nativa do Netlify Forms (BLUEPRINT §7.6) |
| SLA de 15 minutos | **virou SLA interno** definido por você, sem número no site (BLUEPRINT §12) |
| CTA "Montar meu orçamento em 2 minutos" | **fora**: o CTA primário é único, "Pedir diagnóstico gratuito" (§8.6) |
| Calculadora de custo pública | **fora**: nenhum preço publicado; faixas só em `precos.ts` e no resumo do wizard |
| Teste A/B wizard de 4 × 2 passos | **fora**: N = 6 fixo (§7.2) |
| `/servicos/consultoria-react` | **fora**: Squad Dedicado não é oferta pública ([02](02-proposta-e-politica-comercial.md) §2) |
| `/blog/quanto-custa-desenvolver-um-aplicativo` | **fora**: o tema fica em `/quanto-custa` (§6.12) |
| Checklist em PDF como isca | **não agora** ([12](12-canais-indicacao-linkedin-conteudo.md) §8) |
| Sequência de nutrição D0–D30 por ferramenta | **manual e 1:1**, com as mensagens prontas e as UTMs do [04](04-sla-follow-up-e-nutricao.md) §5; automação só pelo checklist do 04 §5.4 (Política, advogado e teste de aceite) |
