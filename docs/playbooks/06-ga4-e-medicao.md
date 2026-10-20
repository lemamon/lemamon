# 06 — GA4, eventos do funil, alertas e monitoramento

**Backlog:** B045 (propriedade GA4 e ID em produção), B058 e B065 (exploração de funil de 10 passos), B119 (`lead_qualified` por configuração do GA4), B107 (alerta de falha na captura, parte de configuração: condição NRQL com Event timer), B345 (dimensões personalizadas), B051 (`wizard_abandon` por tela, `wizard_return` e o segmento "Abandono sem envio"), B327 (`scroll_depth` por limiar), B329 (`language_change`), B331 (`wizard_start` com `entry_source`, `wizard_view`, `wizard_restart`), B337 (`form_field_complete` e `form_validation_error` por campo), B343 (vínculo com o Search Console), B373 (evento-chave e linha de base, com o playbook 13), B374 (distribuição por score, com o playbook 13), B275 (monitor de uptime), B273 (decisão sobre Netlify Analytics), B348 (públicos de remarketing, condicionado à LGPD).
**Fontes:** BLUEPRINT §7.11, §10.2, §10.3; CONTRACT §8 e §11; `src/lib/analytics.ts`; `src/config/site.ts`; i18n `_notes.launch_blockers` (4) e `_notes.privacy`.

---

## 1. Antes de criar a propriedade: quatro decisões

| Decisão | Recomendação até o advogado decidir | Por quê |
|---|---|---|
| Google Signals | **desligado** | launch blocker 4: sem a variante de remarketing na Política, Signals e personalização ficam desligados |
| Personalização de anúncios no vínculo GA4 ↔ Ads | **desligada** | mesmo motivo |
| Retenção de dados do GA4 | 2 ou 14 meses; **o mesmo valor de `privacidade.prazos.ga4`** | a Política descreve o prazo; o GA4 precisa cumprir |
| Compartilhamento de dados da conta com o Google | revisar com o advogado (i18n `_notes.legal_review` item i) e registrar a escolha | define o papel do Google |

## 2. Criar a propriedade e ligar no site (B045)

1. GA4 › **Admin › Criar › Propriedade**: nome `lemamon.dev`; fuso `(GMT-03:00) São Paulo`; moeda Real brasileiro (BRL); objetivo de negócio "gerar leads".
2. **Fluxo de dados › Web**: URL `https://lemamon.dev`, nome `lemamon.dev produção`. Copie o ID de medição `G-…`.
3. **Medição aprimorada** (no fluxo de dados):
   - Visualizações de página: **ligado**; nas opções avançadas, **desligue "mudanças de página com base em eventos do histórico do navegador"**. O site é estático; o wizard troca `?etapa=` por `pushState` e já envia `wizard_step`. Com a opção ligada, cada passo vira um `page_view` a mais.
   - Rolagens: ligado (registra 90%). Cliques de saída: ligado. Downloads de arquivo: ligado.
   - Pesquisa no site: desligado (não há busca). Interações com formulário: **desligado** (ruído e eventos duplicados; o funil já é medido pelos eventos próprios). Vídeo: desligado.
4. **Netlify:** variável `PUBLIC_GA4_ID` = `G-…`, **escopo só Production**, e um deploy novo (playbook 00 §A1). O GA4 só carrega quando `CONTEXT = production`; preview e local nunca enviam evento.
5. **Retenção:** Admin › Coleta e modificação de dados › **Retenção de dados**: o valor decidido na §1.
6. **Conferir:**
   - Relatórios › **Tempo real**: abra o site em produção e veja `page_view`.
   - **DebugView** com o Tag Assistant (tagassistant.google.com › conectar `https://lemamon.dev`): clique no CTA do hero (`cta_click`), no WhatsApp (`whatsapp_click`), comece o wizard (`wizard_start`, `wizard_step`).
   - Nada chega de `deploy-preview--…netlify.app`.

Critério de aceite: o Tempo real mostra `page_view` e eventos do funil vindos de `https://lemamon.dev`, sem `page_view` duplicado.

## 3. Os eventos do site (BLUEPRINT §7.11)

| Evento | Quando dispara | Parâmetros | Evento-chave? |
|---|---|---|---|
| `page_view` | automático | — | não |
| `cta_click` | clique em CTA com `data-track` | `cta_id`, `origem` | não |
| `whatsapp_click` | clique em qualquer botão de WhatsApp | `source` | **sim** (secundário) |
| `email_copy` | botão "Copiar" do e-mail | `source` | não |
| `profile_click` | clique em GitHub, LinkedIn, Medium | `profile` | não |
| `wizard_view` | a entrada (intro) de `/orcamento` foi exibida, sem `?etapa=` na URL; uma vez por carregamento (B330) | `entry_source`, `has_draft` (`true` quando aparece o aviso "Continuar de onde parei") | não |
| `wizard_start` | "Começar" no wizard; no máximo uma vez por carregamento (Começar → Voltar → Começar = 1) | `origem` (só quando a URL tem `?origem=`, o id do CTA que trouxe ao wizard), `entry_source` | não |
| `wizard_resume` | "Continuar de onde parei" | — | não |
| `wizard_restart` | "Começar de novo" no aviso de rascunho; **não conta como início** (não gera `wizard_start`) | — | não |
| `wizard_step` | cada pergunta exibida (P1 a P6) | `step`, `question_id` | não |
| `wizard_blocked` | "Continuar" sem resposta numa pergunta obrigatória | `step`, `question_id` | não |
| `wizard_back` | "Voltar" | — | não |
| `wizard_skip` | "Pular" na P3 | `question_id` | não |
| `wizard_answer_edit` | "Alterar" no resumo | `question_id` | não |
| `wizard_summary_view` | tela de resumo | — | não |
| `wizard_reach_form` | tela de contato | — | não |
| `wizard_abandon` | saída da página (`pagehide` ou aba oculta) com o wizard começado e não enviado, enviado como beacon. Um por saída: depois de um `wizard_return`, a próxima saída gera outro, então **uma sessão pode ter 2** (ex.: `hidden` na P2, volta, e `pagehide` no `contato`). **Não dispara** depois do envio nem na ida ao WhatsApp (troca de canal não é abandono). **Não é perda por si só:** quem troca de app e volta para enviar fica com `wizard_abandon` + `wizard_return` + `lead_submitted` na mesma sessão; a perda real é a sessão com abandono e sem envio (segmento "Abandono sem envio", §6) | `last_step` (`1` a `6`, `resumo` ou `contato`: a tela em que a pessoa estava), `question_id` (só nas perguntas), `time_in_wizard_ms` (tempo desde o início nesta visita), `trigger`: `pagehide` = a página foi descarregada (ex.: clique no logo ou em outro link, na mesma aba); `hidden` = a aba ou o app ficou oculto e a pessoa **pode voltar** (troca de app ou de aba, tela bloqueada; conforme o navegador, também o fechamento da aba, quando ele esconde a página antes de descarregá-la). Por isso o gatilho sozinho não separa quem voltou de quem saiu: quem separa é o `wizard_return` e, na análise, o segmento do §6 | não |
| `wizard_return` | a **mesma página** voltou a ficar visível depois de um `wizard_abandon` com `trigger = hidden`, ou foi devolvida pelo navegador do cache de voltar (bfcache: botão Voltar depois de sair); a vigilância se rearma. É diferente do `wizard_resume`, que é a retomada de um rascunho num carregamento novo | `last_step` (a tela do abandono que foi desfeito). Nunca resposta | não |
| `wizard_render_error` | o wizard falhou ao desenhar uma tela (a página volta ao conteúdo estático, com os outros caminhos de contato); também vai ao New Relic | `view` | não |
| `form_field_complete` | campo preenchido e deixado, uma vez por campo, no contato do wizard e em `/contato` | `form` (`briefing` ou `contato`), `field_name` (`name`, `email`, `phone`, `company`, `details` no wizard; `name`, `email`, `phone`, `subject`, `message` no `/contato`). **Nunca o valor do campo** | não |
| `form_validation_error` | erro de validação exibido, uma vez por campo e tipo de erro | `form`, `field_name`, `error` (`required` ou `invalid`). **Nunca o valor do campo** | não |
| `lead_attempt` | clique em enviar, antes do envio (wizard) | `event_id` (o código `LEM-…` do pedido), `form` | não |
| `lead_submitted` | envio confirmado | `score`, `stage`, `build_type`, `deadline`, `budget`, `role`, `pain`, `event_id`, `time_to_convert_s` | **sim (principal)** |
| `lead_failed` | envio falhou depois das tentativas | `reason`, `attempts`, `form`, `event_id` (só no wizard) | não (alerta, §7) |
| `schedule_click` | clique na agenda (com `dados/dono.json › agenda.url` preenchida) | — | sim, quando existir agenda |
| `summary_copy` | "Copiar resumo" no pós-envio | — | não |
| `contact_submitted` | envio do `/contato` | `subject` | **sim** (secundário) |
| `language_change` | clique em outro idioma no seletor (header, menu do celular, rodapé) ou no aviso de idioma; o link do idioma atual não dispara | `from_lang`, `to_lang` (só `pt`, `en`, `es`) | não |
| `scroll_depth` | rolagem da Home (pt, en, es) passando de 25, 50, 75 e 90% do conteúdo principal (`<main>`); uma vez por limiar por sessão da aba (recarregar não repete). É diferente do `scroll` da medição aprimorada, que só registra 90% e vale para qualquer página | `percent` (`25`, `50`, `75`, `90`), `page_path` | não |
| `pricing_view` | a seção de investimento apareceu na tela; só existe com faixas de preço publicadas (`dados/dono.json › precos`) | `origem` | não |
| `page_not_found` | 404 | `path` | não (relatório, §6) |
| `lead_qualified` | **criado no GA4** a partir do `lead_submitted` com `score = A` (§5); o site não envia | os do `lead_submitted` | **sim** (qualificado) |

`entry_source` é a origem da entrada no wizard, calculada pelo site: o `?origem=` do CTA (ex.: `home-hero`), senão o `utm_source` da URL ou da sessão, senão o domínio de quem mandou o visitante, senão `direct`.

**Regra de privacidade (i18n `_notes.privacy`):** nenhum evento anterior a `lead_submitted` leva valor de resposta do wizard. Se você vir resposta (ex.: `problem_unclear`) num `wizard_step`, avise o agente `conversion`: isso torna falsa uma frase da Política.

## 4. Tráfego interno e testes

- Admin › Fluxos de dados › o fluxo › Configurar tag › **Definir tráfego interno** (IPs da equipe). Admin › **Filtros de dados** › "Tráfego interno": deixe em teste por uma semana e depois ative.
- IP residencial muda: nas máquinas da equipe, instale também o complemento de desativação do Google Analytics no navegador.
- Envios de teste em produção: use o nome `TESTE INTERNO` e anote data e hora (playbook 05 §2).

## 5. Eventos-chave e dimensões personalizadas (B373, B345)

**Eventos-chave:** Admin › **Eventos-chave › Novo evento-chave** e digite o nome exato: `lead_submitted`, `contact_submitted`, `whatsapp_click` (e `schedule_click` quando houver agenda). Pode ser feito antes do primeiro disparo.

**Dimensões personalizadas** (Admin › **Definições personalizadas › Criar dimensão personalizada**, escopo **Evento**; o "parâmetro do evento" é o nome exato):

| Dimensão (nome sugerido) | Parâmetro | Usada em |
|---|---|---|
| CTA | `cta_id` | `cta_click` |
| Origem do CTA | `origem` | `cta_click`, `wizard_start`, `pricing_view` |
| Fonte | `source` | `whatsapp_click`, `email_copy` |
| Perfil | `profile` | `profile_click` |
| Passo do wizard | `step` | `wizard_step`, `wizard_blocked` |
| Pergunta | `question_id` | `wizard_step`, `wizard_blocked`, `wizard_skip`, `wizard_answer_edit`, `wizard_abandon` |
| Origem de entrada | `entry_source` | `wizard_view`, `wizard_start` (B331) |
| Tinha rascunho | `has_draft` | `wizard_view` |
| Última tela do wizard | `last_step` | `wizard_abandon`, `wizard_return` (B051) |
| Gatilho do abandono | `trigger` | `wizard_abandon` (B051): `pagehide` ou `hidden` |
| Formulário | `form` | `form_field_complete`, `form_validation_error`, `lead_attempt`, `lead_failed` (B337) |
| Campo do formulário | `field_name` | `form_field_complete`, `form_validation_error` |
| Tipo de erro | `error` | `form_validation_error` |
| Idioma de origem | `from_lang` | `language_change` (B329) |
| Idioma de destino | `to_lang` | `language_change` |
| Profundidade de rolagem | `percent` | `scroll_depth` (B327); para a página, use a dimensão nativa "Caminho da página" |
| Score | `score` | `lead_submitted` |
| Estágio (P1) | `stage` | `lead_submitted` |
| Tipo (P2) | `build_type` | `lead_submitted` |
| Prazo (P4) | `deadline` | `lead_submitted` |
| Orçamento (P5) | `budget` | `lead_submitted` |
| Papel (P6) | `role` | `lead_submitted` |
| Dor (P3) | `pain` | `lead_submitted` (B050): ids da P3, ou de "o que mais incomoda" quando o sistema já está no ar, separados por vírgula; vazio quando a pessoa pulou a P3 |
| Motivo da falha | `reason` | `lead_failed` |
| Assunto | `subject` | `contact_submitted` |
| Caminho 404 | `path` | `page_not_found` |

**Métricas personalizadas** (Admin › Definições personalizadas › **Métricas personalizadas › Criar**, escopo Evento):

| Métrica | Parâmetro | Unidade | Usada em |
|---|---|---|---|
| Tentativas | `attempts` | padrão | `lead_failed` |
| Tempo no wizard | `time_in_wizard_ms` | **Milissegundos** | `wizard_abandon` (B051) |
| Tempo até o pedido | `time_to_convert_s` | **Segundos** | `lead_submitted` (B050): do "Começar" ao envio; o site não manda o parâmetro quando o início foi há mais de 30 dias ou não foi registrado |

Dimensões e métricas só passam a ter dado a partir da criação: **crie todas no dia do lançamento**. Sem elas, os parâmetros aparecem no DebugView e no Tempo real, mas não em relatórios nem explorações (ex.: sem `percent`, os 4 limiares de `scroll_depth` aparecem somados num número só). A dimensão "Passo do wizard" (`step`) é a que o funil de 10 passos do §6 usa. A propriedade padrão aceita 50 dimensões de evento; esta tabela usa 26.

**Conferência no DebugView, no dia do lançamento** (Tag Assistant conectado a `https://lemamon.dev`, antes de ativar o filtro de tráfego interno, §4; nada de envio real nos passos 1 a 6; o envio `TESTE INTERNO` dos passos 7 e 8 é o mesmo do teste A do `lead_qualified`, abaixo):
1. Home: role até o fim → 4 `scroll_depth` com `percent` = 25, 50, 75 e 90; role de novo e recarregue → nenhum novo.
2. Rodapé da Home: clique em **EN** → `language_change` com `from_lang = pt` e `to_lang = en`.
3. Abra `https://lemamon.dev/orcamento?origem=teste-debug` → `wizard_view` (`entry_source = teste-debug`, `has_draft = false`); **Começar** → `wizard_start` (`origem` e `entry_source` = `teste-debug`); **Voltar** e **Começar** de novo → nenhum segundo `wizard_start`.
4. Responda a P1 e, na P2, clique no logo → `wizard_abandon` com `last_step = 2`, `question_id = build_type`, `trigger = pagehide` e `time_in_wizard_ms` maior que 0.
5. **Troca de aba (B051):** volte ao `/orcamento` e clique em "Continuar de onde parei" (`wizard_resume`). Na P2, passe para outra aba do navegador por alguns segundos e volte → `wizard_abandon` com `last_step = 2` e `trigger = hidden` e, na volta, `wizard_return` com `last_step = 2`. É o mesmo caminho da troca de app no celular (passo 7).
6. Na mesma aba, abra de novo `https://lemamon.dev/orcamento`, sem `?etapa=` (sair da P2 gera mais um `wizard_abandon` com `trigger = pagehide`: esperado), e clique em "Começar de novo" no aviso de rascunho → `wizard_restart`, sem `wizard_start`. Avance até a tela de contato: preencha o nome e saia do campo → `form_field_complete` (`form = briefing`, `field_name = name`); digite um e-mail inválido e saia → `form_validation_error` (`field_name = email`, `error = invalid`). Nenhum parâmetro mostra o que foi digitado. Clique no logo sem enviar → `wizard_abandon` com `last_step = contato` e `trigger = pagehide`.
7. **No celular, troca de app e envio (B051).** Faça junto com o envio de teste A do `lead_qualified` (abaixo), para não criar um pedido de teste a mais: num celular **fora da rede da equipe** (dados móveis), abra `https://lemamon.dev/orcamento`, comece e, na P2, troque de app (abra outro app ou vá para a tela inicial) por alguns segundos e volte ao navegador, em menos de 30 minutos (o tempo limite da sessão do GA4). Esperado: `wizard_abandon` (`trigger = hidden`, `last_step = 2`, `question_id = build_type`) e `wizard_return` (`last_step = 2`). Siga até o fim e envie com o nome `TESTE INTERNO` → `lead_submitted`. **Onde ver:** o celular não conecta ao Tag Assistant, então use Relatórios › **Tempo real** › **Ver resumo do usuário** (*View user snapshot*), escolha o usuário com categoria de dispositivo `mobile` e clique em cada evento para ver os parâmetros. Anote data e hora. **Dois dias depois**, na exploração "Abandono do wizard" (§6), filtrada pela data do teste: **sem** o segmento "Abandono sem envio", a célula `mobile` × `2` × `hidden` conta essa sessão; **com** o segmento, não conta. Se contar com o segmento, confira se o grupo de exclusão do segmento está como "Excluir permanentemente sessões quando" `lead_submitted` (§6) e se o envio saiu na mesma sessão (volta em menos de 30 minutos).
8. **Parâmetros do envio (B050):** no envio de teste `TESTE INTERNO` do `lead_qualified` (abaixo), o `lead_submitted` mostra `pain` com ids separados por vírgula (ex.: `manual_process`), nunca texto digitado, e `time_to_convert_s` maior que 0. Nenhum `wizard_step` anterior ao envio traz resposta (regra de privacidade do §3).

Registre em [15](15-registro-de-decisoes.md) §2. Dois dias depois (com as dimensões e métricas acima já criadas), confira que as explorações do §6 "Abandono do wizard", "Rolagem da Home", "Troca de idioma" e "Campos dos formulários" mostram esses testes separados por tela, limiar, idioma e campo, e faça a conferência do passo 7: com o segmento "Abandono sem envio", a sessão do celular que trocou de app e enviou **não aparece** (critério de aceite do B051: a exploração conta só sessões sem envio).

**Evento `lead_qualified` (B119), sem servidor:** o site é estático (BLUEPRINT §15.3), mas o score já viaja no `lead_submitted`. O GA4 cria o evento qualificado a partir dele:
1. Admin › Exibição de dados › **Eventos › Criar evento** › Criar.
2. Nome do evento personalizado: `lead_qualified`.
3. Condições: `event_name` **é igual a** `lead_submitted` **e** `score` **é igual a** `A` (MQL = score A, BLUEPRINT §7.9).
4. Marque **"Copiar parâmetros do evento de origem"**. Salve.
5. Admin › Eventos-chave › Novo evento-chave › `lead_qualified`.

Critério de aceite: um envio de teste `TESTE INTERNO` com respostas de score A (P4 "O quanto antes — já está atrasado" ou "Nos próximos 3 meses", P5 na faixa de corte do MQL ou acima, P6 "Eu decido") gera `lead_qualified` no DebugView e no Tempo real; um envio de teste com score C (P5 "Ainda não sei") gera só `lead_submitted`. Faça o teste antes de ativar o filtro de tráfego interno (§4), ou de um celular fora da rede da equipe, e registre em [15](15-registro-de-decisoes.md) §2. A qualificação revisada por pessoa (`score_revisado`) continua indo ao Google Ads pela importação offline ([07](07-google-ads.md) §4.4). O próprio `lead_qualified` também vai ao Ads, importado do GA4 como conversão secundária desde o lançamento ([07](07-google-ads.md) §4.5).

## 6. Explorações (B058, B374)

Em **Explorar**, crie e compartilhe com o dono:

| Exploração | Tipo | Configuração | Pergunta que responde |
|---|---|---|---|
| Funil do site | Funil (aberto) | `session_start` → `cta_click` → `wizard_view` → `wizard_start` → `lead_submitted`; detalhamento por página de destino, por origem/mídia da sessão e por "Origem de entrada" (`entry_source`) | de onde vem quem pede, onde para e quem chega à entrada do wizard e não começa (B330, B331) |
| Funil do wizard (10 passos) | Funil (fechado) | os 10 passos da tabela abaixo; detalhamento por categoria de dispositivo; visualização "Funil de conversão" com a coluna **Taxa de abandono** | em que pergunta as pessoas desistem, inclusive prazo (P4) e investimento (P5) |
| CTAs que funcionam | Forma livre | linhas `origem` e `cta_id`; valores: contagem de `cta_click` | quais seções levam ao wizard |
| Qualidade dos pedidos | Forma livre | linhas `score`; colunas mês; valores: contagem de `lead_submitted` e a média de "Tempo até o pedido" (`time_to_convert_s`); para ver a dor, acrescente a linha "Dor (P3)" (`pain`) | % A+B por mês (B374) e quanto tempo cada score leva do início ao pedido (B050) |
| WhatsApp | Forma livre | linhas `source`; valores: `whatsapp_click` | onde o WhatsApp é usado |
| 404 | Forma livre | linhas `path`; valores: `page_not_found` | redirects que faltam (peça ao agente `shell` no `netlify.toml`) |
| Abandono do wizard | Forma livre | **segmento de sessão "Abandono sem envio"** (montagem abaixo); filtro: Nome do evento = `wizard_abandon`; linhas "Última tela do wizard" (`last_step`); colunas "Categoria do dispositivo" e "Gatilho do abandono" (`trigger`); valores: **Sessões** (principal), Usuários, Contagem de eventos e a média de "Tempo no wizard" | em que tela as pessoas saem **sem enviar**, inclusive no `resumo` e no `contato` (a tela mais valiosa, que não tem `question_id`) (B051) |
| Rolagem da Home | Forma livre | filtro: Nome do evento = `scroll_depth`; linhas "Profundidade de rolagem" (`percent`); colunas "Caminho da página" (`/`, `/en/`, `/es/`); valores: Usuários | até onde a Home é lida, por idioma (B327) |
| Troca de idioma | Forma livre | filtro: Nome do evento = `language_change`; linhas "Idioma de origem" (`from_lang`) e "Idioma de destino" (`to_lang`); valores: Contagem de eventos | quem troca de idioma e para qual; insumo da revisão de 90 dias (13 §7, tráfego por idioma) (B329) |
| Campos dos formulários | Forma livre | filtro: Nome do evento = `form_field_complete` ou `form_validation_error`; linhas "Formulário" (`form`) e "Campo do formulário" (`field_name`); colunas Nome do evento e "Tipo de erro" (`error`); valores: Contagem de eventos | que campo trava o envio, no wizard e no `/contato` (B337) |

**Abandono do wizard: o segmento "Abandono sem envio" (B051).** O `wizard_abandon` sai em toda saída com o wizard começado, inclusive quando a pessoa só troca de app no celular para buscar o e-mail ou o telefone na tela de contato e volta para enviar. Contar eventos infla a perda de dois jeitos: (1) quem troca de app e volta para enviar fica com `wizard_abandon` (`hidden`) + `wizard_return` + `lead_submitted` na mesma sessão, e isso **não é perda**; (2) uma sessão pode ter 2 `wizard_abandon` (`hidden` numa tela, a volta, e `pagehide` numa tela posterior). Por isso a exploração usa um segmento de sessão e conta **Sessões**, não eventos:

1. Na exploração, Variáveis › **Segmentos › +** › **Segmento de sessão**. Nome: `Abandono sem envio`.
2. **Incluir sessões quando:** o evento `wizard_abandon`.
3. **Adicionar grupo para excluir** › troque o seletor para **Excluir permanentemente sessões quando** › o evento `lead_submitted`. "Permanentemente" tira a sessão inteira, mesmo com o envio depois do abandono.
4. Salve e aplique: Configurações da guia › **Comparações de segmentos** › arraste `Abandono sem envio`. Mantenha o filtro Nome do evento = `wizard_abandon`: sem ele, a linha "Última tela do wizard" também conta o `wizard_return`.

Como ler:
- **Sessões** = sessões que começaram o wizard, saíram e não enviaram. O total da coluna não conta a mesma sessão duas vezes, mas as linhas podem somar mais que o total: a sessão com 2 abandonos (ex.: `hidden` na P2, volta, `pagehide` no `contato`) aparece nas duas linhas, e a tela em que ela saiu de vez é a do último abandono. Contagem de eventos fica como apoio, nunca como a perda.
- **Gatilho do abandono:** dentro do segmento, `hidden` é quem escondeu a aba ou o app e não voltou para enviar nesta sessão (fechou a aba, o celular descartou a página ou a pessoa desistiu); `pagehide` é quem saiu da página por um link ou pelo logo.
- **O segmento olha a sessão.** Quem sai e volta em **outra** sessão (mais de 30 minutos depois, ou outro dia, por "Continuar de onde parei") e envia aparece aqui como abandono da 1ª sessão. Para o tamanho da perda por pessoa, duplique a aba com um **Segmento de usuário** igual (incluir usuários quando `wizard_abandon`; excluir permanentemente usuários quando `lead_submitted`) e valor **Usuários**. A versão por sessão mostra a tela que trava; a por usuário, quantas pessoas se perderam.
- **Sem o segmento**, a mesma aba mostra todo abandono, inclusive o desfeito. A diferença por tela entre as duas versões é quanto do "abandono" era só troca de app ou de aba (no `contato`, a esperada).

**Funil do wizard, passo a passo** (10 é o limite de passos de um funil no GA4). Em cada passo, "Adicionar condição" com o nome do evento e, nos passos de `wizard_step`, "Adicionar parâmetro" › `step` **corresponde exatamente a** o número:

| Passo | Evento | Parâmetro |
|---|---|---|
| 1 | `wizard_start` | — |
| 2 | `wizard_step` | `step` = `1` (P1, estágio) |
| 3 | `wizard_step` | `step` = `2` (P2, tipo) |
| 4 | `wizard_step` | `step` = `3` (P3, dor) |
| 5 | `wizard_step` | `step` = `4` (P4, prazo) |
| 6 | `wizard_step` | `step` = `5` (P5, investimento) |
| 7 | `wizard_step` | `step` = `6` (P6, papel na decisão) |
| 8 | `wizard_summary_view` | — |
| 9 | `wizard_reach_form` | — |
| 10 | `lead_submitted` | — |

O parâmetro `step` só aparece na lista se a dimensão "Passo do wizard" do §5 existir, e ela só tem dado a partir da criação: crie no dia do lançamento. Quem volta por "Continuar de onde parei" dispara `wizard_resume` em vez de `wizard_start` e fica fora deste funil fechado; para ver essas pessoas, duplique a exploração como funil aberto. A "Maior queda entre passos do wizard" do painel (13 §3) é a maior taxa de abandono deste funil, conferida no ritual mensal.

As taxas e as metas semanais estão no playbook [13](13-kpis-e-rituais.md); o relatório que atualiza sozinho está no 13 §3.1.

## 7. Alertas (B107)

**Falha no envio de pedido (`lead_failed`):**
1. **GA4, insight personalizado** (rede de segurança, não atende os 15 minutos: roda no máximo de hora em hora): Relatórios › **Insights › Criar**; frequência a cada hora; condição: contagem do evento `lead_failed` maior que 0; aviso por e-mail para o comercial e para quem cuida do site.
2. **New Relic (o alerta principal).** O envio de `lead_failed` ao New Relic já está implementado (`src/lib/analytics.ts`, `reportError`: PageAction `lead_failed` + `noticeError`, no wizard e no `/contato`). Configure o alerta:
   1. New Relic › **Alerts › Alert policies › New alert policy**: nome `Site — captura de lead`.
   2. **Alerts › Alert conditions › New alert condition › NRQL**, nesta política, com estes valores (confira cada um na tela da condição):
      - **Consulta:** `SELECT count(*) FROM PageAction WHERE actionName = 'lead_failed'`.
      - **Método de agregação** (em "Adjust to signal behavior" / "Advanced signal settings"): **Event timer**, nunca Event flow (o padrão); **timer = 60 segundos**. Por quê: `lead_failed` é raro, e os únicos PageActions do site são falhas (`lead_failed` e `wizard_render_error`), então o sinal é esparso. No Event flow, o New Relic só fecha uma janela quando chega outro dado com horário posterior; com uma falha isolada, a janela fica aberta até a próxima falha, que pode vir dias depois, e o e-mail não sai. A própria documentação do New Relic ("Streaming alerts: key terms and concepts", https://docs.newrelic.com/docs/alerts/create-alert/fine-tune/streaming-alerts-key-terms-concepts/) manda usar Event timer quando os dados chegam com mais de 65 minutos de intervalo. O Event timer fecha a janela 60 segundos depois do último dado.
      - **Janela de agregação (window duration):** 1 minuto. Preenchimento de lacunas (fill data gaps): nenhum.
      - **Limiar:** Critical, **acima de 0**, **pelo menos uma vez em 1 minuto** ("at least once in").
      - Conta do tempo até o e-mail: o agente do navegador manda os dados a cada 30–60 s, mais 1 minuto de janela, mais 60 s de timer, mais o envio do e-mail: poucos minutos, bem abaixo dos 15 do critério.
   3. **Alerts › Destinations › Email**: o e-mail do comercial e o de quem cuida do site.
   4. **Alerts › Workflows › New workflow**: filtro pela política `Site — captura de lead` → notificar o destino de e-mail. Sem o workflow, a condição dispara e ninguém fica sabendo.
3. **Reconciliação semanal** (playbook 05 §6): Netlify × CRM × `lead_submitted`.

**Simulação em produção, sem deploy e sem derrubar o site** (GA4 e New Relic só carregam em produção, `CONTEXT = production`; um deploy de teste nunca dispara o alerta):
1. Abra https://lemamon.dev/orcamento num navegador comum e abra o console do DevTools. Se `dados/dono.json › privacidade.baseAnuncios` for `"consentimento"`, clique em **Aceitar** no aviso de cookies antes: sem o aceite o New Relic não carrega e o alerta não dispara (ver a ressalva abaixo).
2. Rode este override, que rejeita **só** o POST do formulário para o próprio site e deixa passar todo o resto (GA4, New Relic):
   ```js
   const f = window.fetch; window.fetch = (u, o) => (o && o.method === 'POST' && (u === '/' || u === location.origin + '/')) ? Promise.reject(new TypeError('simulado')) : f(u, o);
   ```
3. Responda o wizard com o nome `TESTE INTERNO` e um e-mail da equipe e envie. Depois das 3 tentativas aparece a tela de erro, e o `lead_failed` sai com `reason = network` e `attempts = 3`. Nada chega ao Netlify e não há conversão no Ads.
4. Recarregue a página para desfazer o override.
5. Critério de aceite: o e-mail do alerta do New Relic chega em **até 15 minutos**, e a tela da condição mostra **Event timer**. Se o e-mail não chegar em 15 minutos, **antes de qualquer outra coisa** abra a condição e confira que o método de agregação é Event timer (com Event flow, a falha isolada fica presa na janela aberta); depois, que o workflow aponta para o destino de e-mail e que o PageAction chegou (New Relic › Query your data: `SELECT * FROM PageAction WHERE actionName = 'lead_failed' SINCE 30 minutes ago`). Anote data, hora do envio e hora do e-mail em [15](15-registro-de-decisoes.md) §2 (assim a reconciliação da semana não confunde o teste com lead perdido). Repita a simulação a cada trimestre.

**Ressalva: aviso de cookies com consentimento.** Com `dados/dono.json › privacidade.baseAnuncios = "consentimento"` (D05), o New Relic só carrega depois que o visitante clica em **Aceitar** no aviso de cookies (`src/components/shell/Analytics.astro` e `src/scripts/consent.ts`), e o GA4 de quem recusa só manda sinais sem cookie, que não aparecem como eventos nos relatórios. Aí o alerta e o insight do GA4 só enxergam falhas de quem aceitou. Nesse caso, a rede obrigatória passa a ser: a **reconciliação semanal** (05 §6) e o insight semanal de **queda de pedidos** (abaixo), que não veem cada falha mas mostram envios a menos no Netlify; os pedidos que chegam por WhatsApp ou e-mail com o resumo copiado da tela de erro do wizard (sinal de que o envio falhou para alguém); e a simulação trimestral feita com o aviso aceito. A consequência está registrada na D05 de [15](15-registro-de-decisoes.md).

**Queda de pedidos:** insight personalizado semanal: `lead_submitted` caiu mais de [PREENCHER] % em relação à semana anterior.

## 8. Monitor de uptime (B275)

Serviço externo gratuito (UptimeRobot, Better Stack ou similar). Monitores:

| Monitor | Tipo | Verifica |
|---|---|---|
| `https://lemamon.dev/` | palavra-chave | o texto do H1: "Software sob medida com escopo, prazo e preço combinados antes de começar." |
| `https://lemamon.dev/orcamento` | palavra-chave | "Orçamento de software sob medida: comece pelo diagnóstico gratuito" |
| `https://lemamon.dev/projects` | palavra-chave, seguindo redirects | o mesmo texto do `/orcamento` (prova que o 301 dos anúncios antigos funciona; o redirect é do Netlify, então localmente `/projects` dá 404 e isso é esperado) |
| certificado de `lemamon.dev` | SSL | expiração |

Intervalo de 5 minutos; aviso por e-mail e app para [PREENCHER]. Se o H1 mudar no i18n, atualize a palavra-chave. **Nunca** monitore enviando formulário: isso cria pedidos falsos. O caminho do envio é coberto pelo E2E do agente `shell`/`conversion` e pela reconciliação semanal.

Critério de aceite: site fora do ar gera aviso em até 5 minutos.

## 9. Vínculos (B343)

- **GA4 ↔ Google Ads:** Admin › Links de produtos › **Links do Google Ads**. Mantenha a personalização de anúncios desligada (§1). Ative a codificação automática (auto-tagging) no Google Ads (playbook 07).
- **GA4 ↔ Search Console:**
  1. **Pré-requisito:** a mesma conta Google é proprietária verificada da propriedade de Domínio `lemamon.dev` no Search Console (playbook 08 §1) **e** tem papel de Editor ou Administrador na propriedade GA4.
  2. Admin › Links de produtos › **Links do Search Console › Vincular** › escolha a propriedade `lemamon.dev` › escolha o fluxo web `lemamon.dev produção` (§2) › Enviar.
  3. Relatórios › **Biblioteca** › cartão da coleção "Search Console" › ⋮ › **Publicar**. Sem isso, a coleção fica despublicada e os relatórios não aparecem no menu.
  4. Espere até 48 h e confira em Relatórios › Search Console › "Consultas" e "Tráfego de pesquisa orgânica do Google".
  5. Registre a data em [15](15-registro-de-decisoes.md) §2.

  Critério de aceite: os relatórios de Search Console aparecem no GA4.

## 10. Públicos de remarketing (B348) — depende só da decisão de LGPD e das contas

**O código está pronto; nada a pedir a agente.** Com `dados/dono.json › privacidade.baseAnuncios = "consentimento"` e `privacidade.remarketing = true`, `src/scripts/gtag-inline.ts` (carregado pelo `src/components/shell/Analytics.astro`, só em produção) e `src/scripts/consent.ts` ligam `allow_ad_personalization_signals`, `allow_google_signals` e o Consent Mode `ad_personalization = granted` **só depois do Aceitar** no aviso de cookies; com qualquer outra combinação, ficam desligados (testes `src/scripts/gtag-inline.test.ts` e `src/components/shell/Analytics.test.ts`). O aviso de cookies com Consent Mode v2 (B344) também já existe e aparece sozinho com `baseAnuncios = "consentimento"`; com `remarketing = true`, o texto dele e a Política passam a dizer que o Google Ads mostra anúncios a quem já visitou o site. O build de produção recusa `remarketing = true` sem `baseAnuncios = "consentimento"` (`src/config/privacidade.ts`).

Pré-requisitos (dono e contas):
- `dados/dono.json › privacidade.baseAnuncios = "consentimento"` (D05, com o advogado; [10](10-lgpd-operacional.md) §11);
- `privacidade.remarketing = true` (D07), no mesmo deploy ou depois;
- Admin › Coleta de dados › **Google Signals: ativar**;
- no vínculo GA4 ↔ Ads (§9), **ativar a personalização de anúncios**, que até então fica desligada.

**Quem entra nas listas:** só quem clicou em **Aceitar** no aviso de cookies. Quem recusa ou ignora o aviso não entra em nenhum público (nem no de exclusão). Por isso as listas crescem mais devagar que o tráfego do site, e isso é esperado.

Aí, crie os 3 públicos em Admin › Exibição de dados › **Públicos** › **Novo público** › **Criar um público personalizado** (os nomes do menu mudam com a interface):

| Público | Incluir usuários quando | Grupo de exclusão: **Excluir permanentemente os usuários quando** | Duração da associação |
|---|---|---|---|
| Visitou e não começou | evento `session_start` | evento `wizard_start` **OU** `lead_submitted` **OU** `contact_submitted` | 30 dias |
| Começou e não enviou | evento `wizard_start` | evento `lead_submitted` **OU** `contact_submitted` | 30 dias |
| Enviou (para **excluir** das campanhas) | evento `lead_submitted` **OU** `contact_submitted` | (sem exclusão) | 90 dias |

Passo a passo de cada público:
1. Em **Incluir usuários quando**, escolha o evento da coluna "Incluir". No "Enviou", acrescente a segunda condição com **OU** (botão "OU" ao lado da condição, não "E").
2. Para os dois primeiros: clique em **Adicionar grupo para excluir**, troque o seletor para **Excluir permanentemente os usuários quando** (não use "Excluir temporariamente": quem já enviou o pedido ou o `/contato` voltaria para a lista quando a condição deixasse de valer) e adicione os eventos da coluna "Excluir", ligados por **OU**.
3. **Duração da associação:** a da tabela. Dê o nome da primeira coluna e salve.

`contact_submitted` entra nas exclusões porque quem já escreveu pelo `/contato` também já falou com você (§5: evento-chave secundário); sem isso, ele continuaria vendo o anúncio do diagnóstico gratuito.

No Google Ads, os públicos chegam pelo vínculo (§9). Use "Visitou e não começou" e "Começou e não enviou" só em campanhas de remarketing, e "Enviou" em **Exclusões** de todas as campanhas (Campanha › Públicos-alvo › Exclusões).

**Tamanho mínimo:** o Google Ads só veicula uma lista depois que ela atinge o mínimo de usuários ativos nos últimos 30 dias. Em dezembro de 2025 o Google baixou esse mínimo para **100 usuários ativos em todas as redes** (Pesquisa, Display e YouTube); guias mais antigos ainda falam em 1.000 para a Pesquisa. Confira o número vigente na Ajuda do Google Ads ("tamanho dos segmentos de público-alvo") antes de planejar. No começo, o status **"Pequeno demais para veicular"** (ou "Qualificação em andamento") é o esperado, não erro.

**Critério de aceite (B348):** em Google Ads › Ferramentas › Biblioteca compartilhada › **Gerenciador de públicos**, os 3 públicos aparecem, com tamanho **acima de zero e crescendo** de uma semana para a outra (ainda que "Pequeno demais para veicular"). Tamanho zero depois de 7 dias com tráfego: confira se `baseAnuncios = "consentimento"` e `remarketing = true` estão no `dono.json` de produção, se o Google Signals e a personalização no vínculo estão ligados, e aceite o aviso de cookies num navegador limpo para ver, no Tag Assistant, o `consent update` com `ad_personalization: granted`. Até a D05 e a D07, não crie listas nem as compartilhe com o Ads. Registre a decisão em [15](15-registro-de-decisoes.md) D07.

## 11. Netlify Analytics (B273) — decisão

| | Netlify Analytics | GA4 |
|---|---|---|
| Fonte | logs do servidor (não é bloqueado por adblock) | script no navegador |
| Eventos do funil | não | sim |
| Custo | pago (confira o valor atual no painel) | gratuito |

**Recomendação:** não ativar no lançamento. Reavaliar na revisão de 60 dias se a reconciliação mostrar `lead_submitted` muito abaixo dos envios do Netlify (sinal de adblock). Se ativar, compare pageviews das duas fontes por 30 dias e registre o resultado. Decisão em [15](15-registro-de-decisoes.md).

## 12. Retenção e Política

| Ferramenta | Onde se configura o prazo | Campo da Política (`privacidade.ts`) |
|---|---|---|
| GA4 | Admin › Retenção de dados | `prazos.ga4` |
| Google Ads (cookies) | configuração da tag | `prazos.googleAds` |
| Conversões enviadas ao Ads | política do Google + importações (playbook 07) | `prazos.conversoesGoogleAds` |
| New Relic | conta New Relic › retenção de dados | `prazos.newRelic` |
| Netlify (logs) | plano da Netlify | `prazos.logsHospedagem` |

Qualquer ferramenta nova de medição (Tag Manager, pixel, mapa de calor) entra na Política **antes** de ir ao ar.
