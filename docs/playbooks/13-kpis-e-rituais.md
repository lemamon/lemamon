# 13 — KPIs, rituais e revisões

**Backlog:** B058 (KPIs semanais e metas), B373 (linha de base de leads/mês e meta de 90 dias), B374 (% de leads A+B), B376 (painel de KPIs financeiros), B367 (meta de MRR e de conversão em sustentação), B369 (concentração de receita), B370 (régua de cobrança e consulta de CNPJ), B377 (rituais semanal, mensal e trimestral), B350 (revisões de 60 e 90 dias), B371 (dependência de pessoa-chave; processo de entrega no playbook 16), B368 (componentes reutilizáveis, aba `Componentes`), B300 (cadência do blog conferida no ritual mensal), B286 (medir o tempo até o primeiro sistema no ar), B303 (gatilho de nicho), B253 (ativação do Renovate no GitHub), B056 e B321 (protocolo de teste A/B), B320 e B322 (testes em conflito com o BLUEPRINT).
**Fontes:** 07-negocios §7.7 a §7.9; 06-marketing §6.7; README §7; BLUEPRINT §2, §7.2, §8.6.

> Todas as metas dos documentos de arquitetura são **estimativas de mercado**. Aqui elas aparecem só como referência; a meta vale quando você a substitui por um número seu.

---

## 1. Os 5 KPIs que importam primeiro (07 §7.9.3)

| KPI | Fórmula | Fonte | Responsável | Meta |
|---|---|---|---|---|
| Leads por mês | pedidos `briefing` + pedidos de outras origens registrados | CRM, aba `Relatório` (05 §8) | [PREENCHER] | linha de base + [PREENCHER] % em 90 dias (§2) |
| % de leads A+B | (A + B) ÷ total, pelo `score` original | CRM (05 §8) e GA4 (`lead_submitted` por `score`) | [PREENCHER] | [PREENCHER] (07 cita 40%) |
| Taxa de fechamento | ganhos pagos (desenvolvimento, sustentação) ÷ propostas apresentadas; a Descoberta, gratuita, não conta como ganho (D44) | CRM (05 §8, "Proposta → ganho") | [PREENCHER] | [PREENCHER] |
| Margem bruta por projeto | (preço − custo direto) ÷ preço, com custo direto = horas reais × custo-hora (recomendação, a decidir: incluir as horas da Sprint de Descoberta do mesmo cliente, que é gratuita desde a D44; Descobertas que não viram projeto entram como custo de pré-venda, 02 §3, linha D) | horas reais (apontamento por marco, 02 §5) × custo-hora (02 §3), por projeto entregue no mês | [PREENCHER] | ≥ [PREENCHER] % (07 sugere 40%) |
| Cobertura do custo fixo pelo MRR | MRR ÷ custo fixo mensal | financeiro (MRR) e contabilidade (custo fixo, 02 §1) | [PREENCHER] | [PREENCHER] em 6 meses; 100% em [PREENCHER] meses (07 cita 30% em 6 meses e 100% em 12) |

Os 5 ficam numa linha por mês na aba `Financeiro` (§5), atualizada no ritual mensal (§6).

**Acompanhamento da D44 (fora dos 5):** desde 21/10/2026 a Sprint de Descoberta é gratuita, e as horas dela são custo de pré-venda (02 §3). Para saber quanto esse custo rende, acompanhe **Diagnóstico → Descoberta** e **Descoberta → desenvolvimento**, com as fórmulas do 05 §8 (colunas `descoberta_iniciada_em` e `descoberta_encerrada_em`), numa linha por trimestre na aba `Relatório`, revista no ritual trimestral (§6). Meta: [PREENCHER] depois de 2 trimestres de linha de base.

"Medir 5 KPIs de verdade vale mais que listar 20 num painel que ninguém abre."

## 2. Linha de base e meta (B373)

1. Dia 0: GA4 no ar com `lead_submitted` como evento-chave (playbook 06 §5) e CRM registrando todo pedido (playbook 05).
2. Dia 30: registre a linha de base.
3. Defina a meta de 90 dias.

| Item | Valor | Data |
|---|---|---|
| Leads nos primeiros 30 dias (todas as origens) | [PREENCHER] | [PREENCHER] |
| Dos quais, pelo wizard | [PREENCHER] | |
| % A+B | [PREENCHER] | |
| Meta de leads/mês no dia 90 | [PREENCHER] (07 sugere +30%) | |

## 3. Painel semanal (B058)

O painel tem duas partes: o **relatório do Looker Studio**, que atualiza sozinho os números do GA4, e a aba `KPIs` da planilha, com os números do CRM e uma linha por semana.

### 3.1 Relatório do Looker Studio (números do GA4, atualiza sozinho)

1. https://lookerstudio.google.com › **Criar › Relatório** › conector **Google Analytics** (gratuito) › conta e propriedade `lemamon.dev`. Nome: `Lemamon.dev — funil semanal`.
2. **Período padrão:** últimos 7 dias, comparando com o período anterior.
3. **Scorecards no topo**, nesta ordem, cada um com a referência de meta numa caixa de texto ao lado:

| Scorecard | Configuração | Referência |
|---|---|---|
| `lead_failed` na semana | métrica Contagem de eventos, filtro Nome do evento = `lead_failed`; formatação condicional vermelha se > 0 | **0** |
| Sessões | métrica Sessões | linha de base do mês 1 |
| Visita → `wizard_start` | combinação de dados (Blend) de duas tabelas da mesma fonte, unidas por Data: Contagem de eventos com filtro `wizard_start` ÷ Sessões, num campo calculado | 06 cita > 8% |
| `wizard_start` → `lead_submitted` | o mesmo, com as duas contagens de evento | 06 cita > 25% |
| Maior queda por passo | gráfico de barras: dimensão "Passo do wizard" (`step`, 06 §5), métrica Usuários, filtro Nome do evento = `wizard_step`, ordenado pelo passo; a maior queda é a maior diferença entre barras vizinhas. O número exato sai do funil de 10 passos do 06 §6, no ritual mensal | 07 cita nenhuma etapa acima de 25% de perda |
| `lead_submitted` por score | tabela: dimensão Score (`score`), métrica Contagem de eventos, filtro `lead_submitted` | % A+B: meta do §1 |

4. **Compartilhar** com o dono (Leitor). O relatório só lê números agregados do GA4, sem dado pessoal.
5. Os dados do GA4 chegam ao Looker Studio com atraso de algumas horas. Para falha de envio em tempo real, vale o alerta do New Relic (06 §7).
6. **Revisão:** o relatório é aberto no ritual semanal e no mensal (§6). No dia 30, troque as referências das caixas de texto pela linha de base real (§2); no dia 90, pelas metas definidas.

### 3.2 Aba `KPIs` da planilha (números do CRM, uma linha por semana)

```
semana,sessoes,visita_wizard_start,wizard_start_lead_submitted,maior_queda_passo,lead_failed,envios_netlify,linhas_crm,lead_submitted,pedidos_whatsapp,mediana_1o_contato_h,leads_a_fora_do_sla,lead_diagnostico,custo_por_pedido_ads,bloco_prospeccao_cumprido
```

| Indicador | Fonte | Referência (estimativa) |
|---|---|---|
| Sessões, visita → `wizard_start`, `wizard_start` → `lead_submitted`, maior queda por passo, `lead_failed` | copiados do relatório do Looker Studio (§3.1) | as do §3.1 |
| Envios Netlify × linhas no CRM × `lead_submitted` | reconciliação (05 §6) | iguais |
| Pedidos por WhatsApp (registrados) | CRM (`protocolo` `WA-*`) | — |
| Mediana do 1º contato (h úteis) | CRM (05 §8) | meta interna (04 §1) |
| Leads A fora do SLA | CRM: `=CONT.SES(score;"A";fora_do_sla;VERDADEIRO;recebido_em;">="&HOJE()-7)` (colunas do 05 §5) | **0** |
| Lead → diagnóstico | CRM | 07 cita 35% |
| Custo por pedido (Ads) | Ads + CRM | meta do 07 §6 |
| `bloco_prospeccao_cumprido` | `sim` ou `nao`, conferido no ritual semanal (§8, B371) | `sim` em ≥ 90% das semanas: `=CONT.SE(bloco_prospeccao_cumprido;"sim")/CONT.VALORES(bloco_prospeccao_cumprido)` no trimestre |

**Taxa de falha técnica em destaque:** `lead_failed` e a reconciliação vêm primeiro no painel. Lead perdido não aparece em nenhum outro número.

## 4. Funil comercial e ciclo (B374, B375)

Fórmulas no playbook 05 §8. Mensal: % A+B; lead → diagnóstico; diagnóstico → proposta apresentada; proposta → ganho; ciclo médio do pedido ao contrato (07 sugere ≤ 30 dias como meta inicial); **pedidos por indicação** (B312: link com `utm_source = indicacao` + protocolos `IND-…`), **pedidos de comunidade** (B318: `utm_source = comunidade` + protocolos `COM-…`) e **pedidos de parceiros** (B313: `utm_source = parceiro` + protocolos `PAR-…`). Critério de aceite do B374: relatório mensal com a distribuição por score e o % de A+B.

## 5. KPIs financeiros (B376, B367, B369, B370)

Aba `Financeiro`, uma linha por mês:

```
mes,leads_mes,pct_ab,taxa_fechamento,margem_bruta_media,faturamento,custo_fixo,mrr,cobertura_mrr,contratos_fechados,ticket_medio,maior_cliente_pct,inadimplencia_30d_pct,horas_orcadas,horas_reais,desvio_estimativa,projetos_entregues,convertidos_em_sustentacao,custo_aquisicao_por_canal
```

As 4 primeiras colunas depois de `mes`, mais `cobertura_mrr`, são os 5 KPIs essenciais do §1: `leads_mes`, `pct_ab` e `taxa_fechamento` vêm da aba `Relatório` (05 §8); `margem_bruta_media` é a média da margem dos projetos entregues no mês (§1). `projetos_entregues` conta as linhas de `Pedidos` com `go_live_em` no mês; `convertidos_em_sustentacao` conta, entre elas, as que têm `sustentacao_contrato_em` dentro da janela (`janela_sustentacao_dias`). Com poucos projetos por mês, a **taxa** de conversão é calculada por trimestre (fórmula abaixo), nunca mês a mês.

| KPI | Definição | Fonte | Responsável | Meta |
|---|---|---|---|---|
| Ticket médio | faturamento fechado ÷ contratos | emissor de nota fiscal / banco | [PREENCHER] | [PREENCHER] |
| MRR | receita recorrente do mês (sustentação + contratos recorrentes) | emissor de nota fiscal (valor oficial), conferido pelo CRM: `=SOMARPRODUTO((sustentacao_contrato_em<>"")*(sustentacao_contrato_em<=fim_do_mes)*(((sustentacao_encerrada_em="")+(sustentacao_encerrada_em>fim_do_mes))>0)*sustentacao_valor_mensal)` (colunas do 05 §5; `fim_do_mes` = último dia do mês do relatório). Diferença entre os dois = contrato sem nota ou nota sem linha no CRM: acertar no ritual mensal | [PREENCHER] | [PREENCHER] |
| Cobertura do custo fixo | MRR ÷ custo fixo | MRR + custo fixo da contabilidade (02 §1) | [PREENCHER] | [PREENCHER] (07 cita 30% em 6 meses e 100% em 12) |
| Margem bruta por projeto | ver §1 | horas reais × custo-hora (02 §3 e §5) | [PREENCHER] | ≥ [PREENCHER] % |
| Desvio de estimativa | horas reais ÷ horas orçadas | horas orçadas da proposta (02 §8) + controle de horas por marco (02 §5) | [PREENCHER] | ≤ [PREENCHER] (07 sugere 1,2) |
| Custo de aquisição por canal | (mídia + ferramentas + **horas de pré-venda** × custo-hora) ÷ clientes do canal | custo do Ads (07 §7) + `horas_pre_venda` do CRM (05 §5) × custo-hora (02 §3) | [PREENCHER] | [PREENCHER] |
| Concentração (B369) | % do maior cliente no faturamento do trimestre | faturamento por cliente (emissor de nota fiscal) | [PREENCHER] | ≤ 25% (07) |
| Inadimplência | vencido há mais de 30 dias ÷ faturado | emissor de nota fiscal / banco | [PREENCHER] | ≤ [PREENCHER] % (07 sugere 3%) |
| Conversão em sustentação (B367) | projetos com go-live no trimestre que assinaram sustentação até `janela_sustentacao_dias` depois do go-live (assinatura antes do go-live, junto com o desenvolvimento, também conta) ÷ projetos com go-live no trimestre; medida por trimestre e acumulada em 12 meses: `=SOMARPRODUTO((go_live_em>=início_do_tri)*(go_live_em<início_do_tri_seguinte)*(sustentacao_contrato_em<>"")*(sustentacao_contrato_em-go_live_em<=janela_sustentacao_dias))/CONT.SES(go_live_em;">="&início_do_tri;go_live_em;"<"&início_do_tri_seguinte)`. Clientes do 02 §8b (sistema que já estava no ar, sem `go_live_em`) entram no MRR, mas não nesta taxa | CRM: `go_live_em` e `sustentacao_contrato_em` (05 §5), nunca a `etapa` (ela volta para 6 quando há proposta nova) | [PREENCHER] | [PREENCHER] % até [PREENCHER data] (07 cita 60–70%) |

**Meta de MRR e de conversão em sustentação (B367)**

Situação atual (preencha no primeiro ritual mensal e atualize todo mês):

| Item | Valor | Data |
|---|---|---|
| Custo fixo mensal | [PREENCHER] | [PREENCHER] |
| MRR | [PREENCHER] | [PREENCHER] |
| Cobertura do custo fixo (MRR ÷ custo fixo) | [PREENCHER] | [PREENCHER] |
| Conversão em sustentação (últimos 12 meses) | [PREENCHER] | [PREENCHER] |

Metas:

| Trimestre | Meta de cobertura (%) | Meta de MRR | Meta de conversão em sustentação (%) | Data-limite | Real | Desvio |
|---|---|---|---|---|---|---|
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | | |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | | |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | | |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | | |

07 §7.9.2 cita 30% em 6 meses e 100% em 12 como referência para a cobertura; a meta vale quando você troca a referência por um número seu. Revisão mensal no ritual (§6): o "Real" do trimestre corrente é atualizado todo mês.

**De onde sai o "Real" (B367):** MRR e conversão vêm das colunas `go_live_em`, `sustentacao_contrato_em`, `sustentacao_valor_mensal` e `sustentacao_encerrada_em` da aba `Pedidos` (05 §5), com as fórmulas da tabela acima; `início_do_tri`, `início_do_tri_seguinte` e `fim_do_mes` são células da aba `Relatório` (05 §8), e `janela_sustentacao_dias` é da aba `Config`. A `etapa` não serve de fonte: ela não tem data, volta para "6 Proposta apresentada" quando o cliente recebe proposta de um projeto novo e não diz quando a sustentação acabou.

**Teste das fórmulas** (antes do primeiro ritual mensal; apague a linha depois e registre em [15](15-registro-de-decisoes.md) §2): numa linha de teste, `go_live_em` = 10/11/2026, `sustentacao_contrato_em` = 20/11/2026, `sustentacao_valor_mensal` = 1 e `janela_sustentacao_dias` = 30. Com `início_do_tri` = 01/10/2026 e `início_do_tri_seguinte` = 01/01/2027, a conversão dá **100%** (se a linha de teste for a única com go-live no trimestre) e o MRR de novembro de 2026 soma 1. Troque `sustentacao_contrato_em` por 20/01/2027: a conversão do 4º trimestre de 2026 dá **0%**. Preencha `sustentacao_encerrada_em` = 30/11/2026: o MRR de dezembro de 2026 não soma a linha.

**Concentração (B369):** quando um cliente passa de 25% do faturamento do trimestre, a prospecção vira prioridade da semana seguinte, mesmo com a operação cheia. Registre o plano na ata do ritual mensal.

**Régua de cobrança (B370):**

| Dia depois do vencimento | Ação |
|---|---|
| D+1 | lembrete cordial com o boleto ou a chave de pagamento |
| D+5 | segundo aviso, com a data da suspensão prevista no contrato |
| D+[PREENCHER] (07 sugere 10) | suspensão do trabalho, conforme a cláusula do contrato |
| D+15 | encaminhar para cobrança formal ou jurídico |

Configure na ferramenta de faturamento, se ela tiver régua; senão, use lembretes na agenda. Antes de contrato acima de [PREENCHER], consulte o CNPJ do cliente e anexe ao registro (02 §10).

## 6. Rituais (B377)

| Ritual | Duração | Quando | Pauta fixa |
|---|---|---|---|
| **Semanal** | 30 min | [PREENCHER dia e hora] | painel semanal (§3); leads sem próximo passo com data; leads A fora do SLA; propostas em follow-up (toques vencidos sem `fu_dN_feito_em`) e propostas enviadas ainda não apresentadas (aba `Propostas`); spam do Netlify conferido; PRs do Renovate da semana (§10); **bloco de prospecção da semana cumprido?** |
| **Mensal** | 1 h | primeiro dia útil | atualizar a linha do mês da aba `Financeiro` com os 5 KPIs essenciais (§1), com a margem bruta dos projetos entregues no mês; funil completo (§4), com pedidos por indicação, de comunidade e de parceiros; eventos do mês (aba `Eventos`, 12 §4) e indicações com origem comunidade; relatório do Looker Studio (§3.1) e funil de 10 passos do wizard (06 §6); MRR, cobertura e conversão em sustentação: real × meta do trimestre (§5); concentração; inadimplência; projetos com `go_live_em` e `status_prova = nao_pedida`, e projetos com `go_live_em` há mais de `prazo_depoimento_dias` e `depoimento_status` em `nao_pedido` ou `pedido` (05 §5: a mesma linha vermelha `E(go_live_em<>""; HOJE()-go_live_em>prazo_depoimento_dias; OU(depoimento_status="nao_pedido"; depoimento_status="pedido"))`), e os indicadores do 09 §15 (depoimento conta só com `depoimento_status = autorizado`); termos de pesquisa e custo do Ads; **gatilho da ação principal do Ads**: conversões `Lead qualificado` e `lead_qualified` nos últimos 30 dias × 30 (07 §4.4, passo 5; D09), **estratégia de lances** de cada campanha (antes da troca da D09, só CPC manual ou Maximizar cliques com teto; 07 §5, linha "Lances") e % de pedidos de Ads sem `gclid` (07 §7, limite 30%); **posts publicados no mês × cadência** (meta: 2, D36; fonte: a lista de `/blog` ou `publicadoEm` dos MDX, 12 §7; abaixo da meta, registrar o motivo e a nova data na ata); rotina de exclusão LGPD executada (10 §6) |
| **Trimestral** | meio dia | [PREENCHER] | margem real × orçada por projeto; desvio de estimativa e recalibração do colchão (02 §5); revisão do custo-hora e do preço das ofertas; % dos projetos iniciados no trimestre com `primeira_parcela_em` ≤ `kickoff_em` (meta 100%, B366); % das propostas do trimestre (`enviada_em` no trimestre, aba `Propostas` do 05 §5) apresentadas ao vivo e com resultado registrado (meta 100%, B363) e % apresentadas no prazo (05 §8); calibração do score (03 §8); premissas do negócio (02 §1); revisão de acessos (10 §9); % de semanas com o bloco de prospecção cumprido (meta ≥ 90%, §3.2); gatilhos da §8 (incluindo a aba `Componentes`, B368); **pixels ativos (Meta/LinkedIn, B346/B347):** ainda há campanha de remarketing ou de LinkedIn rodando no canal? Se não, voltar `dados/dono.json › privacidade.pixels.<pixel>` a `null` e fazer deploy ([12](12-canais-indicacao-linkedin-conteudo.md) §9; anotar na D12 do 15) |

Crie os três eventos recorrentes na agenda. **Ata** (um documento por ritual):

```
Ritual {semanal|mensal|trimestral} — {data} — presentes: {nomes}
Números: {cole a linha do painel}
MRR, cobertura e conversão em sustentação: real × meta do trimestre; ação se abaixo: (só no mensal)
Posts do mês: publicados × previstos no 12 §7; se abaixo, motivo e nova data: (só no mensal)
O que mudou desde a última:
Decisões (com dono e data):
Pendências que passam para a próxima:
```

Critério de aceite: ≥ 90% dos rituais do trimestre aconteceram, com ata.

## 7. Revisões de 60 e 90 dias (B350)

Marque as duas na agenda a partir do dia do lançamento.

**Dia 60:** funil do GA4 (onde está o maior abandono); custo por pedido do Ads com dado real; % A+B por origem; decisão de verba (07 §6); decisão sobre Netlify Analytics (06 §11).

**Dia 90:** custo por pedido e custo de aquisição reais por canal; taxa pedido → cliente real; troca de **todas** as estimativas usadas nos playbooks por números seus (este playbook, 02 §1, 07 §6); alocação do trimestre seguinte pelo canal de menor custo de aquisição; avaliação do Decap CMS só se alguém fora do time técnico for publicar conteúdo (B265); revisão do tráfego por idioma (dado para o integrador, sem mudar a decisão do BLUEPRINT §1.7).

Registre os números reais e as decisões em [15-registro-de-decisoes.md](15-registro-de-decisoes.md) e peça ao integrador para atualizar as estimativas de `docs/arquitetura/06-marketing.md` e `07-negocios.md`.

## 8. Gatilhos e hábitos

| Gatilho / hábito | Regra | Backlog |
|---|---|---|
| Bloco de prospecção | um bloco semanal na agenda que não se move, inclusive em mês de entrega cheia; conferido no ritual semanal (meta ≥ 90% das semanas) | B371 |
| Processo documentado | estes playbooks + o processo de entrega escrito no playbook [16](16-processo-de-entrega.md) (kickoff, ciclo de entregas a cada 2 semanas, go-live, passagem para sustentação, entrada de subcontratado), para permitir subcontratar em pico | B371 |
| Tempo até o primeiro sistema no ar | para cada projeto, registre data de assinatura e data da primeira entrega em produção; calcule a mediana. **Publicar** esse número exige sua confirmação e mudança no BLUEPRINT §12 (hoje só "45 minutos" e "a cada 2 semanas" podem ser afirmados) | B286 |
| Componentes reutilizáveis | no trimestral, aba `Componentes` (bloco abaixo): problemas que se repetem por setor, com quantos clientes; 1 candidato; horas economizadas medidas quando ele for reutilizado em 2 projetos; produto ou SaaS só com a trava do bloco | B368 |
| Nicho | quando o 3º case do mesmo setor for publicado, revisar headline, pauta do blog e palavras-chave para esse setor (mudança de posicionamento passa pelo BLUEPRINT); conferido a cada case publicado (09 §2) e no ritual trimestral (§6). A contagem usa o rótulo padronizado do campo `setor` (09 §8) | B303 |

### 8.1 Componentes reutilizáveis (B368)

Problema que aparece em vários clientes (reservas, controle de entregas, aprovação de pedidos, por exemplo) pode virar um componente que a Lemamon.dev reaproveita. Isso aumenta a margem dos projetos de preço fechado. Produto próprio vem muito depois, e só com a trava abaixo.

**Aba `Componentes` da planilha**, uma linha por problema recorrente:

```
problema,setor,clientes_com_o_problema,protocolos_ou_projetos,candidato,componente,projetos_que_reusaram,horas_extracao,horas_orcadas_sem_reuso,horas_reais_com_reuso,horas_economizadas,decisao_produto,registrado_em
```

| Coluna | Como preencher |
|---|---|
| `problema` | o problema em uma frase, nas palavras do cliente (ex. de forma: "agenda de técnicos em campo") |
| `setor` | o **mesmo rótulo padronizado** do 09 §8 (lista na aba `Config`); setores diferentes com o mesmo problema ganham uma linha cada |
| `clientes_com_o_problema` | quantos clientes diferentes tiveram o problema, contando diagnósticos, Descobertas e projetos |
| `protocolos_ou_projetos` | os protocolos do CRM (05 §5) onde o problema apareceu, separados por vírgula: é a prova da contagem |
| `candidato` | `sim` ou `nao`; no máximo 1 `sim` novo por trimestre |
| `componente` | nome interno do componente, quando houver |
| `projetos_que_reusaram` | protocolos dos projetos que usaram o componente depois de extraído |
| `horas_extracao` | horas gastas para transformar o código de um projeto em componente reaproveitável (fora das horas do projeto do cliente) |
| `horas_orcadas_sem_reuso` | soma, nos projetos que reusaram, da estimativa do item **como se fosse feito do zero**. Faça essa estimativa na proposta (02 §5), antes de descontar o componente: é a base de comparação |
| `horas_reais_com_reuso` | soma das horas reais desses mesmos itens, do apontamento por marco (02 §5; [16](16-processo-de-entrega.md) §4) |
| `horas_economizadas` | `=horas_orcadas_sem_reuso-horas_reais_com_reuso` (na linha 2, com as células dessas colunas) |
| `decisao_produto` | vazio, `nao` ou `sim` (só com a trava abaixo cumprida e registrada em [15](15-registro-de-decisoes.md)) |
| `registrado_em` | data da última revisão da linha no ritual trimestral |

**Trava para virar produto ou SaaS:** só depois de o componente **se pagar em 3 projetos**, isto é, com 3 ou mais protocolos em `projetos_que_reusaram` e `horas_economizadas × F ≥ horas_extracao × F` (F = custo-hora interno do 02 §3; o mesmo que `horas_economizadas ≥ horas_extracao`). Mesmo assim, **nunca com caixa operacional**: o investimento sai de reserva separada, decidida e registrada em 15 com o valor e o prazo para reavaliar.

**Critério de aceite (B368):** a aba é revisada em todo ritual trimestral, com pelo menos 1 linha `candidato = sim` e a contagem de clientes de cada problema; quando o candidato for reutilizado em 2 projetos, `horas_economizadas` está calculada.

## 9. Testes A/B: protocolo (B056, B321) e testes em conflito (B320, B322)

**Quando testar:** só depois de 30 dias de GA4 e com volume mínimo ([PREENCHER] sessões/mês; o B056 sugere 1.500). Implementar um teste é código (agentes `shell`/`home`/`conversion`) e toda variante de texto é chave nova de i18n, aprovada por você.

**Tamanho de amostra (por variante, para 95% de confiança e 80% de poder):**

```
n ≈ 16 × p × (1 − p) ÷ d²
p = taxa atual (ex.: cliques no CTA primário ÷ sessões)
d = menor diferença absoluta que vale a pena detectar
Ex. ilustrativo: p = 0,05 e d = 0,01 → n ≈ 16 × 0,05 × 0,95 ÷ 0,0001 ≈ 7.600 sessões por variante
```

Regras: uma variável por teste; duração definida antes (semanas inteiras, no mínimo 2); métrica principal definida antes (clique no CTA primário ou `lead_submitted`); sem olhar o resultado no meio para encerrar antes; resultado e decisão registrados.

| Teste do backlog | Status | Motivo |
|---|---|---|
| B056 — headline e CTA do hero | **possível, com limites** | o CTA primário é único ("Pedir diagnóstico gratuito", BLUEPRINT §8.6) e a promessa do H1 é fixa (§1.1). Só variações que mantêm o posicionamento; a variação "O time de produto…" do backlog contradiz o posicionamento e está fora |
| B321 — com e sem faixa de preço na Home | **só depois de `precos.ts`** | sem faixas não há o que testar; esconder a seção para metade do tráfego é código |
| B320 — wizard de 4 contra 2 passos | **fora** | o BLUEPRINT fixa N = 6 e decidiu a ordem das perguntas (§7.2 e §15.3) |
| B322 — e-mail no passo 1 contra no fim | **fora** | contradiz "valor antes do dado": o resumo vem antes de qualquer contato (BLUEPRINT §2.4) |

## 10. GitHub: dependências em dia sem esforço (B253)

O `renovate.json` (agente `shell`) vem com o site novo: PRs toda segunda antes das 6h (horário de Brasília), agrupados em `astro`, `react` e `testes`, manutenção semanal do `yarn.lock`, e **merge automático só de atualização de patch** (ex.: 7.1.2 → 7.1.3), e só com a CI verde. O que falta é ligar no GitHub, uma vez, com uma conta de administrador do repositório `lemamon/lemamon`. **Pré-requisito:** o site novo já está na `main` do GitHub, com o `renovate.json` na raiz e o `.github/workflows/ci.yml`; antes disso, o Renovate não acha a configuração (e abriria o PR de onboarding dele) e o check da CI não existe para ser exigido.

1. **Instalar o app Renovate:** https://github.com/apps/renovate › **Install** (ou **Configure**, se já existir na conta) › conta `lemamon` › **Only select repositories** › `lemamon/lemamon` › Install. O app pode pedir para entrar no painel da Mend (o fornecedor do Renovate) com a mesma conta do GitHub; dê acesso só a esse repositório.
2. **Permitir auto-merge:** no repositório, **Settings › General ›** seção **Pull Requests** › marque **Allow auto-merge**. É ela que deixa o Renovate ligar o merge automático do próprio GitHub no PR de patch.
3. **Proteger a `main`:** **Settings › Branches › Add branch protection rule** (ou **Settings › Rules › Rulesets › New branch ruleset**, com o alvo `main`):
   - Branch name pattern: `main`;
   - marque **Require status checks to pass before merging** e **Require branches to be up to date before merging**;
   - na busca de checks, digite `build, testes e E2E` e adicione (na lista de checks de um PR ele aparece como `CI / build, testes e E2E`; o nome vem do `.github/workflows/ci.yml`). O check só aparece na busca depois de ter rodado pelo menos uma vez nos últimos 7 dias: se não aparecer, abra um PR qualquer, espere a CI rodar e volte;
   - se marcar **Require a pull request before merging**, deixe **Required approvals** em `0`: com 1 aprovação obrigatória, nenhum PR de patch entra sozinho (o Renovate não aprova o próprio PR);
   - salve. Daqui em diante, um commit direto na `main` sem a CI verde só passa para administrador (o GitHub registra o "bypass"); o caminho normal passa a ser PR.
4. **Onboarding:** como o `renovate.json` já está na `main`, o Renovate pula o PR de configuração inicial e começa direto. Se mesmo assim aparecer um PR "Configure Renovate", **não faça merge**: confira que o `renovate.json` está na `main` e feche o PR. O Renovate abre uma issue "Dependency Dashboard" com tudo o que está pendente; ela é a pauta da revisão semanal.
5. **Ritual semanal (segunda-feira, ou no ritual semanal da §6):** abrir os PRs do Renovate da semana.
   - PRs de **patch** com CI verde: já entraram sozinhos; confira em **Pull requests › Closed** que estão como "merged" pelo Renovate.
   - PRs agrupados com versão **minor** (`astro`, `react`, `testes`) e o de **Lock file maintenance**: leia as notas de versão linkadas no PR, confira que a CI passou e o deploy preview do Netlify abre, e faça o merge. **Major**: só com tempo para testar (ex.: Astro 7 → 8); deixe aberto e anote na ata.
   - CI vermelha num PR do Renovate: não force o merge; peça ao agente `shell` (ou a quem cuida do site) para olhar.
6. **Depois do lançamento** (mesma tela de Settings): **Secrets and variables › Actions › Variables › New repository variable** `E2E_PRODUCAO_ATIVO` = `true`. Liga o E2E diário contra produção (`.github/workflows/e2e-producao.yml`), que abre uma issue "E2E em produção falhou" quando o site publicado quebra. Antes do lançamento, deixe sem a variável.

**Critério de aceite (B253):** na primeira segunda-feira depois da instalação há pelo menos um PR do Renovate aberto, agrupado (`astro`, `react` ou `testes`) quando houver atualização nesses pacotes, e um PR de patch com a CI verde foi mergeado sem nenhum clique. Registre a data da instalação e o resultado da primeira segunda-feira em [15](15-registro-de-decisoes.md) §2.
