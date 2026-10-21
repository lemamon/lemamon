# 07 — Google Ads: URLs finais, conversões e campanhas

**Backlog:** B314 (campanhas por intenção, negativas, destino certo), B010 (parte do Ads: URL final fora de `/projects`), B342 (conversões offline), B120 (lead qualificado como conversão principal: importação offline e `lead_qualified` do GA4, com gatilho de volume, saída para baixo volume, lances sem otimização por conversão até a troca e conferência dos pedidos de Ads sem `gclid`), B106 (parcial: o evento do GA4 entra como secundário), B349 (verba e critérios de escalada), B123 (landing por segmento: decisão de não fazer agora).
**Fontes:** BLUEPRINT §1.6, §10.1, §10.2, §12; 06-marketing §6.4.2 e §6.7; `src/config/site.ts` (`GOOGLE_ADS`); i18n `_notes.launch_blockers` (4) e `_notes.legal_review`.

Conta: `AW-16881353870`. Conversão "Solicitar cotação": `AW-16881353870/cEi0CLmh9Z8aEI6J1PE-` (disparada por evento no sucesso do envio do wizard).

---

## 1. Antes de gastar um real

- [ ] Política de Privacidade publicada e sem bloqueadores (playbook 10 §2).
- [ ] **Conversões otimizadas (enhanced conversions) desligadas**, nos modos manual e automático: com elas, a tag lê e-mail e telefone dos formulários e a Política não descreve isso (launch blocker 4).
- [ ] Personalização e remarketing conforme a decisão de `privacidade.baseAnuncios` (sem consentimento: desligados).
- [ ] GA4 no ar e conferido (playbook 06).
- [ ] Notificação de formulário e SLA funcionando (playbooks 05 e 04).
- [ ] Monitor de uptime ativo (06 §8).
- [ ] **Eventos conferidos no deploy preview com `?debug_analytics=1`** (achado F82): abra qualquer página do preview com esse parâmetro e faça o caminho (CTA, wizard, envio, pós-envio, WhatsApp, `/contato`). Cada evento, a conversão do Ads e o aviso ao New Relic aparecem no console do navegador com o prefixo `[analytics:debug]`, **sem sair nada** da aba; vale nas próximas páginas da mesma aba e desliga com `?debug_analytics=0` ou fechando a aba. No preview o GA4 não carrega (só em produção), então o modo é o jeito de ver os parâmetros de cada evento antes do lançamento.
- [ ] Toda URL final responde **200 sem redirect** (§3).
- [ ] **Estratégia de lances de cada campanha = CPC manual ou Maximizar cliques com limite de CPC máximo de R$ [PREENCHER]** enquanto a ação principal for de formulário ("Solicitar cotação" ou "Pedido enviado (página)", isto é, enquanto o gatilho da D09 não for batido). **Nunca** Maximizar conversões, CPA desejado, Maximizar valor da conversão nem ROAS desejado com a ação de formulário como principal: essas estratégias otimizam na ação principal, e o Ads passaria a buscar volume bruto de formulário, inclusive pedido fora de perfil. Onde: §5, linha "Lances".
- [ ] **Aplicação automática de recomendações desligada para lances e orçamento:** Campanhas › Recomendações › **Aplicar automaticamente** (o nome muda com a interface) › desmarque tudo de "Lances e orçamentos" (em especial "Ajustar lances com Maximizar conversões" e "Usar CPA desejado"). Sem isso, o Ads pode trocar a estratégia sozinho.

## 2. Configurações da conta

1. **Codificação automática (auto-tagging): ligada.** Admin › Configurações da conta. Sem `gclid`, não há importação offline: o wizard e o formulário de `/contato` gravam o `gclid` no pedido (e o `gbraid`/`wbraid` dos cliques de iPhone, dentro do `attribution`).
2. **Sufixo de URL final por campanha:** `utm_source=google&utm_medium=cpc&utm_campaign=<nome-da-campanha>&utm_term={keyword}`. O wizard e o `/contato` gravam as UTMs em `attribution`, e o CRM mostra a campanha de cada pedido. Use nomes de campanha curtos e sem dado pessoal (ex.: `mvp-sp`): o nome também aparece no fim das mensagens de WhatsApp de quem chegou pelo anúncio, como `Ref.: G-mvp-sp` (§4.6).
3. **Rede:** só Pesquisa. Desligue Rede de Display e parceiros de pesquisa nas campanhas de pesquisa.
4. **Local:** alinhado a `confirmacoes.outrasCidades`. A praça é **São Paulo, SP** desde 20/10/2026 (D38 em [15](15-registro-de-decisoes.md); antes, Florianópolis, SC). Enquanto você não confirmar que atende outras cidades, segmente [PREENCHER: cidade de São Paulo / Grande São Paulo / estado de SP] (D29). Confirmado, pode abrir para o Brasil. Nada de segmentação fora do Brasil (o site não diz que atende; decisão D31 em [15](15-registro-de-decisoes.md)). Em **Configurações › Locais › Opções de local**, marque **Presença** (pessoas que estão ou costumam estar nos locais segmentados), não "Presença ou interesse": essa opção mostra o anúncio também a quem só pesquisa sobre a área, inclusive fora do Brasil. **Campanha já criada com Florianópolis ou SC:** troque o local agora (Campanhas › a campanha › **Configurações** › **Locais**) e registre a data na D29.
5. **Idioma:** português. Campanhas em inglês ou espanhol só com decisão registrada (D31).

> **Nota D31 (21/10/2026):** o dono confirmou que atende empresas de qualquer país (`confirmacoes.outrasCidades` e `confirmacoes.atendeExterior` ligados). Os itens 4 e 5 continuam valendo para a campanha atual, mas a segmentação **pode** abrir para o Brasil inteiro e, com campanha própria em inglês ou espanhol (URL final em `/en/` ou `/es/`), para fora do Brasil. Antes de ligar uma campanha fora do Brasil: definir moeda, nota fiscal de exportação e foro (ainda não definidos; o site só diz que são combinados por escrito antes de começar), conferir o telefone com código do país no `/en/` e no `/es/` (auditoria F16) e registrar a escolha na D29 do [15](15-registro-de-decisoes.md). As faixas da P5 do wizard continuam em BRL (F32).

## 3. URLs finais (B010)

Nenhum anúncio aponta para `/projects` (301, salto desnecessário) nem para a Home (exceto a campanha de marca, se existir).

**Auditoria:** Anúncios e recursos › filtre "URL final contém `/projects`" e "URL final é `https://lemamon.dev/`"; faça o mesmo em **sitelinks**. Troque conforme a tabela.

| Intenção da busca | URL final |
|---|---|
| sistema sob medida, ERP/CRM sob medida, portal do cliente | `https://lemamon.dev/servicos/sistemas-web` |
| aplicativo sob medida, criar aplicativo para empresa | `https://lemamon.dev/servicos/aplicativos` |
| integração de sistemas, automação de processos | `https://lemamon.dev/servicos/integracoes` |
| desenvolvimento de MVP, produto digital | `https://lemamon.dev/servicos/mvp` |
| manutenção e sustentação de sistemas | `https://lemamon.dev/servicos/sustentacao` |
| quanto custa um sistema / software | `https://lemamon.dev/quanto-custa` |
| software com preço fechado | `https://lemamon.dev/como-trabalhamos` |
| orçamento de software, desenvolvimento de software sob medida (genérica) | `https://lemamon.dev/orcamento` |
| marca ("lemamon") | `https://lemamon.dev/` |

**Conferir cada URL:** `curl -sI <url> | head -1` tem que mostrar `200` (não `301`). Depois de trocar, confira na coluna "Status" que nenhum anúncio foi reprovado por destino.

## 4. Conversões

### 4.1 "Solicitar cotação" (por evento) — a principal hoje

- Disparada pela função `reportAdsConversion()` só no **sucesso confirmado** do envio do wizard, só em produção.
- Conferir em Metas › Conversões: categoria "Enviar formulário de lead"; contagem **Uma**; janela de conversão de clique: [PREENCHER] dias; **ação principal**.
- **Principal provisória:** ela é principal só para a coluna "Conversões" contar os pedidos desde o primeiro dia. **Não guia lances automáticos**: enquanto ela for a principal, toda campanha usa CPC manual ou Maximizar cliques com teto (§1 e §5, linha "Lances"). A troca para uma ação de lead qualificado segue o §4.4, passo 5, e a D09.
- Depois do envio de teste (playbook 05 §2), o status precisa ficar "Registrando conversões".

### 4.2 "Pedido enviado (página)" — em paralelo por 30 dias (BLUEPRINT §10.2)

1. Metas › Conversões › Nova ação › **Site** › domínio `lemamon.dev` › escolha a criação de conversão **por URL** (carregamento de página; o nome da opção muda com a interface) com a regra **URL contém** `/orcamento/enviado`, e repita a regra para `/en/quote/sent` e `/es/cotizacion/enviada`. A tag do Google Ads vai em todas as páginas de produção pelo layout (`src/components/shell/Analytics.astro`, do agente `shell`, só em produção): confira com o Tag Assistant que ela carrega em `/orcamento/enviado` antes de criar a ação.
2. Contagem **Uma**. Marque como **secundária** (não entra nos lances).
3. Por 30 dias, compare semanalmente: "Solicitar cotação" × "Pedido enviado (página)" × pedidos no CRM com `gclid` preenchido.
4. Depois: a que bater melhor com o CRM fica principal; a outra continua secundária. Registre em [15](15-registro-de-decisoes.md).

### 4.3 `lead_submitted` importado do GA4 (B106) — só como secundária

Com o GA4 vinculado, você pode importar `lead_submitted`. Marque como **secundária** para não contar o mesmo pedido duas ou três vezes.

Como a conversão "Solicitar cotação" sai do site (parte de código do B106): o snippet do `<head>` (`src/scripts/gtag-inline.ts`, carregado pelo `Analytics.astro` só em produção) **continua definindo** a função global `window.gtag_report_conversion`, porque o BLUEPRINT §10.2 exige o snippet. O wizard, porém, dispara a conversão por `reportAdsConversion()` (`src/lib/analytics.ts`), com `transaction_id` = protocolo do pedido (o Ads deduplica se o mesmo pedido chegar duas vezes), e só cai na função global se o `gtag` não existir.

### 4.4 Conversões offline: o que acontece depois do pedido (B342, B120)

O Ads aprende a buscar pedidos que viram cliente, não só pedidos baratos.

1. Metas › Conversões › Nova ação › **Importar** › "CRMs, arquivos ou outras fontes de dados" › **conversões de cliques**. Crie quatro ações, todas **secundárias** no início:
   - `Lead qualificado` (score revisado A ou B depois do primeiro contato)
   - `Diagnóstico realizado`
   - `Proposta apresentada`
   - `Contrato assinado` (com valor)
2. **Toda semana**, monte o CSV a partir do CRM (só linhas com `gclid`, sem `nao_contatar`, com o evento depois do clique e dentro da janela de validade do `gclid`, de até 90 dias; as linhas da aba `Pedidos` que vieram de uma mensagem de `/contato` copiam o `gclid` de lá, playbook 05 §5):

```csv
Parameters:TimeZone=-0300
Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency
<gclid>,Diagnóstico realizado,2026-11-03 15:00:00,,
<gclid>,Contrato assinado,2026-11-20 10:00:00,[PREENCHER valor],BRL
```

   **Pedido só com `gbraid` ou `wbraid`** (clique de iPhone, sem `gclid`; achado F81): na hora do upload, confira no modelo de arquivo que o Ads oferece (Metas › Envios › baixar o modelo) se há coluna para esse id. Se houver, envie com o mesmo nome de conversão; se não houver, a linha fica fora do CSV e só conta na conferência do §7. Mesmas regras do `gclid`: nunca com `nao_contatar`.
3. Metas › **Envios (uploads)** › enviar o arquivo; confira o relatório de erros.
4. Marque no CRM (`conversoes_ads_enviadas`) o que já foi enviado.
5. **Gatilho da troca (B120; D09 do [15](15-registro-de-decisoes.md)):** torne `Lead qualificado` a ação **PRINCIPAL** e rebaixe "Solicitar cotação" a **SECUNDÁRIA** quando houver **≥ 30 conversões `Lead qualificado` em 30 dias** (referência do Google para lances automáticos). Confira no ritual mensal ([13](13-kpis-e-rituais.md) §6): Metas › Conversões › `Lead qualificado`, período "Últimos 30 dias", coluna de conversões **por horário da conversão** (em inglês, "Conv. (by conv. time)"; acrescente pelo seletor de colunas, o nome em português muda com a interface; a coluna "Conversões" padrão conta pela data do clique e, com o upload semanal atrasado, mostra menos do que aconteceu). Batido o gatilho, faça a troca no mesmo dia e registre a data na D09. O número 30 é o padrão; para usar outro, troque aqui e na D09. Se a ação de formulário principal for "Pedido enviado (página)" (decisão D08), é ela que vira secundária. Nunca deixe duas ações de lead qualificado como principais ao mesmo tempo (a do §4.5 e esta): o mesmo pedido contaria duas vezes nos lances. Enquanto o gatilho não for batido, **nenhuma campanha usa lance por conversão** (regra do §1 e da §5, linha "Lances"): com a ação de formulário como principal, o lance automático otimiza volume bruto de formulário, e com pouco volume de lead qualificado ele aprende mal. Só **depois** da troca, com `Lead qualificado` (ou `lead_qualified`, §4.5) como principal e o gatilho batido, uma campanha pode passar para Maximizar conversões (e, mais tarde, CPA desejado); registre a data e a campanha na D09.

### 4.5 `lead_qualified` importado do GA4 — secundária desde o lançamento (B119, B120)

Fonte mais rápida de "lead qualificado" no Ads, porque **não depende de `gclid` no pedido**: o GA4 liga o evento ao clique pelo próprio cookie, inclusive quando a pessoa clicou no anúncio, fechou e voltou outro dia.

1. Pré-requisitos: o evento `lead_qualified` criado e marcado como evento-chave no GA4 ([06](06-ga4-e-medicao.md) §5) e o vínculo GA4 ↔ Google Ads feito ([06](06-ga4-e-medicao.md) §9).
2. Metas › Conversões › **Nova ação** › **Importar** › **Google Analytics 4** › propriedades da Web › marque `lead_qualified` › Importar e continuar.
3. Contagem **Uma**; marque como **secundária** desde o lançamento.
4. Depois do envio de teste com score A (06 §5, critério de aceite do `lead_qualified`), o status precisa ficar "Registrando conversões" em até 48 h.

**Diferença entre as duas ações de lead qualificado:**

| Ação | Score usado | Precisa de `gclid` no pedido? | Quando entra |
|---|---|---|---|
| `lead_qualified` (GA4, este §4.5) | automático, calculado pelo wizard: só **A** (BLUEPRINT §7.9) | não | no envio do pedido |
| `Lead qualificado` (offline, §4.4) | **revisado** por pessoa depois do primeiro contato: A ou B | sim | no upload semanal |

**Regra de volume:** se a ação offline não bater o gatilho do §4.4, passo 5, em 90 dias contados do lançamento, `lead_qualified` (GA4) passa a ser a candidata a principal, **pela mesma regra** (≥ 30 conversões em 30 dias); batido o gatilho, troque e registre na D09. Uma única ação de lead qualificado fica como principal; a outra continua secundária.

**Saída para baixo volume (D09):** se em 90 dias contados do lançamento **nenhuma** das duas ações de lead qualificado bater o gatilho, você decide na revisão de 90 dias, entre:
- **(a)** manter "Solicitar cotação" como principal e os lances manuais (CPC manual ou Maximizar cliques com teto) por mais 90 dias; ou
- **(b) recomendado:** tornar `lead_qualified` (GA4) a principal mesmo abaixo de 30 conversões, rebaixar "Solicitar cotação" a secundária e **manter Maximizar cliques com teto** (ou CPC manual). A coluna "Conversões" passa a contar lead qualificado, que é o que você otimiza à mão, e o lance não depende do volume. O lance por conversão continua proibido até a principal bater os 30 em 30 dias.

Registre a escolha e a data na D09.

### 4.6 `contact_submitted` e `whatsapp_click` importados do GA4 — só como secundárias (achados F11 e F34)

Lead de anúncio também chega pelo `/contato` e pelo WhatsApp, e nenhum dos dois dispara "Solicitar cotação". Para o Ads ver esses caminhos sem otimizar por eles:

1. GA4: marque `contact_submitted` e `whatsapp_click` como **eventos-chave** ([06](06-ga4-e-medicao.md) §5).
2. Ads: Metas › Conversões › **Nova ação** › **Importar** › **Google Analytics 4** › propriedades da Web › marque `contact_submitted` e `whatsapp_click` › Importar e continuar.
3. Contagem: `contact_submitted` **Uma**; `whatsapp_click` **Uma** (o mesmo visitante clicando várias vezes conta uma). As duas **secundárias**, sempre: `whatsapp_click` é um clique no botão, não uma conversa, e `contact_submitted` mistura assunto de projeto com parceria e "outro". Nunca entram nos lances.
4. Leitura: elas mostram que palavra-chave e anúncio trazem gente que escreve em vez de pedir pelo wizard. A conversa de WhatsApp que vira oportunidade entra no CRM como linha `WA-…` com as UTMs da `Ref.: G-…` (playbook 05 §5) e conta nos critérios do §6 e na conferência do §7.

**LGPD:** a Política já diz que a Lemamon informa ao Google Ads que um pedido foi enviado depois de um clique e como ele evoluiu (`purposes.items.attribution`). Quem se opuser por e-mail (`controls_opposition`) fica fora dos envios. O prazo `conversoesGoogleAds` da Política depende da revisão jurídica (`_notes.legal_review` itens a, i, j).

## 5. Estrutura das campanhas (B314)

**Regras:** uma campanha por intenção; correspondência de **frase** e **exata** (nunca ampla no começo); lista de negativas desde o dia 1; anúncios só com fatos confirmados.

**Lances (todas as campanhas):** enquanto a ação principal for de formulário (D09 não batida), **CPC manual** ou **Maximizar cliques com limite de CPC máximo** de R$ [PREENCHER]. Nunca Maximizar conversões, CPA desejado, Maximizar valor da conversão nem ROAS desejado (§1).
- **Ao criar a campanha:** no passo **Lances**, o Ads sugere "Conversões" como foco: troque para **Cliques** e marque **Definir um limite máximo de lance de custo por clique** com o teto; ou use **Selecionar diretamente uma estratégia de lances** › **CPC manual** (se aparecer a opção de CPC otimizado, deixe desmarcada).
- **Em campanha já criada:** Campanhas › selecione a campanha › **Configurações** › **Lances** › **Alterar estratégia de lances** › Maximizar cliques (com o limite de CPC máximo) ou CPC manual › Salvar. O nome das opções muda com a interface; o que importa é a estratégia não ser de conversão.
- **Conferir:** Campanhas › coluna **Tipo de estratégia de lances** (acrescente pelo seletor de colunas): todas as linhas mostram "Maximizar cliques" ou "CPC manual".
- **Depois da troca da D09** (§4.4, passo 5), uma campanha de cada vez pode passar para Maximizar conversões; anote a data e a campanha na D09.

| Campanha | Grupos e palavras-chave semente (validar no Keyword Planner, playbook 08 §2) | URL final |
|---|---|---|
| `sistemas-web` | "desenvolvimento de sistemas para empresas", "sistema sob medida", "erp sob medida", "crm sob medida", "portal do cliente" | `/servicos/sistemas-web` |
| `aplicativos` | "desenvolvimento de aplicativo sob medida", "criar aplicativo para empresa", "aplicativo ios e android para empresa" | `/servicos/aplicativos` |
| `integracoes` | "integração de sistemas", "integração erp e-commerce", "automação de processos" | `/servicos/integracoes` |
| `mvp` | "desenvolvimento de mvp", "criar mvp para startup", "desenvolvimento de produto digital" | `/servicos/mvp` |
| `sustentacao` | "sustentação de sistemas", "manutenção de software", "evolução de sistema" | `/servicos/sustentacao` |
| `orcamento` | "orçamento desenvolvimento de software", "desenvolvimento de software sob medida", "empresa de desenvolvimento de software" | `/orcamento` |
| `quanto-custa` | "quanto custa desenvolver um sistema", "quanto custa um software sob medida" | `/quanto-custa` |

Comece com [PREENCHER] campanhas (06 §6.7 recomenda 2 a 3 no cenário enxuto: as de maior intenção e as que você mais quer vender).

**Negativas (lista compartilhada da conta):** curso · cursos · grátis · gratuito · como fazer · tutorial · salário · vaga · vagas · emprego · estágio · download · apk · no code · sem programar (lista do 06 §6.4.2). Sugestões a avaliar no relatório de termos: faculdade · tcc · pdf · modelo · template · o que é. Atenção: "gratuito" negativa buscas por "diagnóstico gratuito"; se alguém buscar isso, você vai ver no relatório de termos e pode ajustar.

**Anúncio responsivo — exemplo para `sistemas-web`** (só fatos do BLUEPRINT §1.5 e §12; títulos até 30 caracteres, descrições até 90):

| Títulos | Descrições |
|---|---|
| Sistemas Web Sob Medida | Escopo, prazo e preço combinados antes de começar. Comece pelo diagnóstico gratuito. |
| Escopo, Prazo e Preço Antes | Diagnóstico gratuito de 45 minutos, com devolutiva por escrito. Sem compromisso. |
| Diagnóstico Gratuito: 45 min | No desenvolvimento, você recebe software funcionando a cada 2 semanas. |
| Devolutiva por Escrito | Sistemas web para a operação da sua empresa. Primeiro a gente combina, depois constrói. |
| Entregas a Cada 2 Semanas | |
| Pedir Diagnóstico Gratuito | |
| Lemamon · São Paulo, SP | |

Para os outros serviços, troque o primeiro título e a última descrição pelo serviço da campanha. **Proibido** em anúncio (BLUEPRINT §12): preço, duração de MVP ou de Descoberta, "melhor", "líder", "referência", "soluções", "inovação", nomes de clientes, número de projetos, "atendemos todo o Brasil" sem `outrasCidades`.

**Recursos (extensões):** sitelinks Como trabalhamos (`/como-trabalhamos`), Sprint de Descoberta (`/sprint-de-descoberta`), Quanto custa (`/quanto-custa`), Contato (`/contato`); frases de destaque "Diagnóstico gratuito", "Devolutiva por escrito", "Entregas a cada 2 semanas", "São Paulo, SP"; snippet estruturado "Serviços": Sistemas web, Aplicativos, Integrações, MVP, Sustentação. **Recurso de local** (vínculo com o Perfil da Empresa): não use enquanto o perfil estiver como empresa de área de serviço com endereço oculto ([08](08-search-console-e-seo-local.md) §3): o recurso mostra o endereço do perfil, e o site não publica rua (BLUEPRINT §1.5). Se algum recurso já tiver sido criado com "Florianópolis, SC" (título, frase de destaque ou local), troque por "São Paulo, SP" e confira na coluna "Status" que ele voltou a ser aprovado.

## 6. Verba e critérios de escalada (B349)

Os cenários do 06-marketing §6.7 são **estimativas de mercado**, não dado da Lemamon. Decida e registre:

| Item | Decisão |
|---|---|
| Teto mensal inicial | [PREENCHER] |
| Data da primeira revisão | [PREENCHER] (sugestão: 60 dias) |
| Aumentar a verba só se, por 4 semanas | GA4 medindo o funil · SLA do score A cumprido · CPL do Ads ≤ [PREENCHER] · % de pedidos A+B vindos do Ads ≥ [PREENCHER] · capacidade de atender · prova publicada (≥ 2 cases, `hasCases`) |
| Reduzir ou pausar se, por 4 semanas | CPL > [PREENCHER] ou nenhum diagnóstico vindo do Ads |

**O que conta como "vindo do Ads"** nos critérios acima: pedido (`Pedidos`) ou mensagem de `/contato` com `gclid`, `gbraid`, `wbraid` ou `utm_medium = cpc`, **e** as linhas `WA-…` com `utm_medium = cpc` (conversa de WhatsApp aberta com `Ref.: G-…`, playbook 05 §5). Sem as linhas `WA-…`, a palavra-chave que gera conversa no WhatsApp parece não converter e o corte de verba erra.

Registre em [15-registro-de-decisoes.md](15-registro-de-decisoes.md) e revise nas revisões de 60 e 90 dias (playbook 13).

## 7. Rotina

| Quando | O quê |
|---|---|
| Semanal | relatório de **termos de pesquisa** → novas negativas; status das conversões ("Registrando"); anúncios reprovados; destinos respondendo 200; envio do CSV offline |
| Mensal | custo por pedido, custo por pedido A+B, custo por diagnóstico realizado (CRM); comparação das conversões por evento e por URL (até decidir); ajuste de palavras-chave; **gatilho da ação principal** (§4.4, passo 5): conversões `Lead qualificado` e `lead_qualified` nos últimos 30 dias × 30; **estratégia de lances**: antes da troca da D09, a coluna "Tipo de estratégia de lances" mostra só "Maximizar cliques" ou "CPC manual" em todas as campanhas, e a aplicação automática de recomendações de lances continua desligada (§1 e §5, linha "Lances"); **pedidos de Ads sem `gclid`** (abaixo) |
| Trimestral | estrutura de campanhas, URLs finais, verba (com o playbook 13) |

**Pedidos de Ads sem `gclid` (B120), conferência mensal.** A importação offline (§4.4) só casa pedido que chegou com `gclid`. O site guarda o clique no toque da sessão, que vive só enquanto a aba vive (BLUEPRINT §10.3), e no rascunho do wizard (30 dias). Desde a auditoria de conversão, três caminhos que perdiam o clique foram fechados: a aba nova (Cmd+clique num CTA) adota o toque de campanha de outra aba do site que ainda esteja aberta (F26, BroadcastChannel, sem gravar nada além da aba); sem `gclid` na URL e na aba, o pedido leva o do cookie `_gcl_aw` que o próprio Google Ads grava (F26, abaixo); e o `/contato` também envia `attribution` e `gclid` (F11). Continua sem `gclid` quem volta outro dia por outro caminho, com o cookie do Ads recusado ou apagado, e o clique de iPhone, que chega como `gbraid`/`wbraid` (F81). Por isso a conta usa duas fontes:

1. **Ads × CRM:** em Metas › Conversões, anote as conversões "Solicitar cotação" do mês (coluna de conversões por horário da conversão, a mesma do §4.4, passo 5, para comparar com a data de chegada do pedido no CRM). O Ads conta também quem voltou outro dia, porque o cookie dele lembra o clique. No CRM, conte os pedidos do mês com `gclid`: `=CONT.SES(gclid;"<>";recebido_em;">="&início_do_mês;recebido_em;"<"&início_do_mês_seguinte)`. **% de pedidos de Ads sem `gclid`** = `1 − pedidos_com_gclid ÷ conversões_solicitar_cotacao`.
2. **UTM sem `gclid`:** no CRM, os pedidos do mês com `utm_medium = cpc` (o sufixo do §2 grava `utm_source = google` junto), `gclid` vazio e **sem** `gbraid`/`wbraid` (clique de iPhone não tem `gclid`, e está certo): `=CONT.SES(utm_medium;"cpc";gclid;"";gbraid;"";wbraid;"";protocolo;"<>WA-*";recebido_em;">="&início_do_mês;recebido_em;"<"&início_do_mês_seguinte)` (as linhas `WA-…` ficam de fora: nunca têm `gclid`). Qualquer número acima de zero aqui indica que o `gclid` se perdeu no caminho: confira a codificação automática (§2, item 1) e se algum redirect corta a query string.
3. **Conversas de WhatsApp do Ads:** as linhas `WA-…` do mês com `utm_medium = cpc` (`Ref.: G-…`, playbook 05 §5): `=CONT.SES(protocolo;"WA-*";utm_medium;"cpc";recebido_em;">="&início_do_mês;recebido_em;"<"&início_do_mês_seguinte)`. Elas não entram na importação offline (sem `gclid`), mas contam no §6.

**Fallback do cookie `_gcl_aw` (achado F26, já no ar):** sem `gclid`, `gbraid` ou `wbraid` na URL e no toque da aba, o pedido (wizard e `/contato`) leva o `gclid` do cookie de primeira parte `_gcl_aw` (formato `GCL.<timestamp>.<gclid>`, `buildAttribution` em `src/lib/attribution.ts`). O cookie só existe se o Google Ads o gravou (no modo consentimento, só depois do aceite), e o envio segue as mesmas regras de permissão do `gclid`. A Política descreve a leitura em `privacy.sections.data_collected.draft_measurement` nos 3 idiomas, e o item (s) de `_notes.legal_review` leva o texto ao advogado. **Se o item 1 ainda passar de 30%** depois disso, registre em [15](15-registro-de-decisoes.md) §2 e avalie com o agente `conversion` o próximo passo; enquanto isso, a ação `lead_qualified` do GA4 (§4.5) não depende do `gclid` no pedido.

## 8. O que não fazer agora

- **Landing pages por segmento (B123):** as páginas de serviço são os destinos de Ads por tema (BLUEPRINT §6.5). Página por setor exige cases do setor e código novo; reavaliar quando houver 3 cases do mesmo setor (gatilho do playbook 13 §8).
- **Performance Max, Display, remarketing:** só depois da decisão de LGPD e com conversões confiáveis.
- **Lance por conversão** (Maximizar conversões, CPA desejado, Maximizar valor da conversão, ROAS desejado): só depois da troca da D09 (§4.4, passo 5). Até lá, CPC manual ou Maximizar cliques com teto (§5, linha "Lances").
- **Pixels de outras plataformas:** ver [12](12-canais-indicacao-linkedin-conteudo.md) §9 e [15](15-registro-de-decisoes.md).
