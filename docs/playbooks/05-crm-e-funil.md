# 05 — Do Netlify Forms ao CRM: notificação, funil e registro de cada lead

**Backlog:** B043 (rotear cada lead para CRM/planilha e notificar na hora), B380 e B381 (confirmar em produção que o Netlify detecta o form e que cada campo do envio real aparece no painel), B375 (conversões do funil comercial e ciclo de venda no CRM), B058 (parte comercial: registrar os leads de WhatsApp), B057 (colunas de SLA e alerta), B364 (follow-up calculado e registrado em `fu_dN_feito_em`), B363 (aba `Propostas`: envio, apresentação ao vivo no prazo e resultado de cada proposta), B366 (`kickoff_em`), B372 (`go_live_em`, `status_prova` e `depoimento_status`), B312 e B318 (indicação e comunidade no relatório), B323 (registro do opt-in e do descadastro), B376 (`horas_pre_venda`), B044 (colunas da retomada), B313 (protocolo `PAR-…` e aba `Parceiros`), B367 (datas e valor da sustentação, base da conversão e do MRR do 13 §5).
**Fontes:** BLUEPRINT §7.6 (notificação nativa do Netlify, nunca webhook chamado pelo navegador), §7.10 (campos), §15.3; 07-negocios §7.6; `src/lib/forms.ts`; i18n `_notes.privacy_conditionals`.

---

## 1. O caminho de um lead

```
Visitante → wizard (/orcamento) ─ envio ─► Netlify Forms "briefing" ─► e-mail de notificação ─► CRM (planilha)
Visitante → /contato ─────────── envio ─► Netlify Forms "contato"  ─► e-mail de notificação ─► CRM
Visitante → botão de WhatsApp ───────────────────────────────────────► conversa no WhatsApp ─► CRM (manual)
```

- O **Netlify Forms é o registro de origem** de todo pedido do site. O CRM é onde o pedido é trabalhado.
- O navegador nunca chama webhook de terceiros (decisão do BLUEPRINT §15.3). Qualquer integração sai do painel do Netlify.
- Nomes dos campos (iguais nos 3 idiomas): `briefing` = `name, email, phone, channel, company, details, answers, summary, score, protocol, subject, lang, attribution, gclid, bot-field`; `contato` = `name, email, phone, subject, message, lang, origin, bot-field`.

## 2. Verificação em produção depois do deploy (B380)

Faça no dia do lançamento e depois de qualquer mudança nos formulários.

1. **Detecção de formulários ligada:** Netlify › o site › **Forms**. Se aparecer o botão para habilitar a detecção, habilite e faça um deploy novo.
2. **Os dois formulários aparecem:** `briefing` e `contato`, com os campos da §1. Se faltar um campo, avise o agente `conversion` (a declaração estática fica em `src/components/quote/NetlifyForms.astro` e tem teste de contrato).
3. **Envio real em produção:** antes de começar, anote o prazo (P4) e a faixa de investimento (P5) que você vai escolher. Abra `https://lemamon.dev/orcamento?utm_source=teste-interno&origem=teste`, responda as 6 perguntas com essas escolhas e, na tela de contato, preencha **todos** os campos:
   - Nome: `TESTE INTERNO`; e-mail: um e-mail da equipe;
   - canal: WhatsApp; WhatsApp com DDD: o número de teste da equipe;
   - Empresa (opcional): `TESTE INTERNO LTDA`;
   - "Quer contar mais alguma coisa?": `TESTE INTERNO`.
   Envie.
   - Esperado: página `/orcamento/enviado` com protocolo `LEM-…`.
   - O teste gera um `lead_submitted` no GA4 (excluído se o filtro de tráfego interno estiver ativo, playbook 06 §4) e **uma conversão no Google Ads**. Anote data e hora para descontar.
4. **Painel:** Forms › `briefing` mostra o envio. Confira campo a campo:

   | Campo | Esperado |
   |---|---|
   | `name` | `TESTE INTERNO` |
   | `email` | o e-mail da equipe |
   | `phone` | o número de teste |
   | `channel` | `whatsapp` |
   | `company` | `TESTE INTERNO LTDA` |
   | `details` | `TESTE INTERNO` |
   | `answers` | as 6 respostas, com o prazo e a faixa anotados antes |
   | `summary` | o texto legível das respostas |
   | `score` | uma letra (A, B, C ou D) |
   | `protocol` | o mesmo `LEM-…` da página de confirmação |
   | `subject` | `[score] LEM-…` (ex.: `[B] LEM-20261019-AB12`) |
   | `lang` | `pt` |
   | `attribution` | contém `utm_source` = `teste-interno` e `origem` = `teste` |
   | `gclid` | vazio (esperado no teste, sem clique em anúncio) |

   Campo vazio ou ausente que deveria estar preenchido: avise o agente `conversion` (lista única em `src/lib/forms.ts`, com teste de contrato).
5. **Notificação** chega ao e-mail do comercial em menos de 5 minutos (§3).
6. **Repita para `/contato`** com assunto "Outro" e mensagem `TESTE INTERNO`.
7. **Apague os envios de teste** no painel e registre a verificação (data, quem fez, resultado campo a campo) em [15-registro-de-decisoes.md](15-registro-de-decisoes.md) §2.

Critério de aceite (B380, B381): envio feito em produção aparece em Forms › `briefing` com **todos** os campos da tabela do passo 4 preenchidos como esperado (empresa, prazo, faixa e UTM inclusive), e a notificação chega em até 5 minutos. A execução depende do primeiro deploy de produção.

## 3. Notificação dos formulários

**Onde:** Netlify › o site › **Site configuration › Notifications › Emails and webhooks › Form submission notifications › Add notification** (o caminho pode mudar com o painel; procure por "Form submission notifications").

| Notificação | Formulário | Para | Quando usar |
|---|---|---|---|
| E-mail | `briefing` | e-mail do responsável comercial + backup | **sempre** (padrão do lançamento) |
| E-mail | `contato` | o mesmo | **sempre** |
| Slack | qualquer | canal da equipe | opcional; o Slack vira operador de dados: atualize a Política antes |
| Outgoing webhook | `briefing` | automação para a planilha (§7) | opcional; mesma regra da Política |

**No Gmail (ou no e-mail que recebe):**
1. Abra a primeira notificação de teste e crie um filtro a partir dela (menu ⋮ › "Filtrar mensagens como esta"): aplicar o marcador `Leads`, marcar com estrela, **nunca enviar para spam**.
2. Ative notificação no celular para esse marcador (ou para mensagens importantes), para cumprir o SLA do score A.

**Assunto do e-mail:** o Netlify usa um campo chamado `subject`, quando existe no formulário, como assunto da notificação (confira na documentação atual do Netlify Forms). O `contato` já tem `subject` (o assunto escolhido). O `briefing` tem um campo oculto `subject` com `[score] protocolo`, por exemplo `[A] LEM-20261019-AB12` (sem dado pessoal e sem texto de idioma), declarado com `data-remove-prefix` para o Netlify não acrescentar o prefixo dele. Use o `[A]` no começo do assunto para o filtro do Gmail destacar o score A (SLA). No primeiro envio real em produção (passo 5 acima), confira que o assunto chegou assim; se o painel ignorar o campo, o score continua no corpo.

**Spam:** envios marcados como spam pelo filtro do Netlify **não geram notificação**. Confira Forms › Spam submissions **toda semana** e marque como "não é spam" o que for pedido real. Envio com o campo-armadilha `bot-field` preenchido é descartado no próprio navegador e nem chega ao painel.

**Cota do plano:** o Netlify Forms tem limite mensal de envios por plano. Confira o seu em Forms e configure um aviso antes de chegar ao limite.

## 4. Qual CRM

| Opção | Quando | Operador novo na Política? |
|---|---|---|
| **Planilha** (padrão do lançamento) | até [PREENCHER] leads/mês e uma pessoa vendendo | Arquivo local: não. Google Sheets: é Google, mas não é o Gmail descrito na Política hoje; confirme com o advogado se precisa citar o Google Drive/Workspace |
| HubSpot Free, Pipedrive ou similar | mais de uma pessoa vendendo, ou quando a planilha atrapalhar o SLA | **Sim**: atualize a Política antes de importar qualquer lead |

Registre a escolha em [15-registro-de-decisoes.md](15-registro-de-decisoes.md).

## 5. Estrutura da planilha

**Aba `Pedidos`** — uma linha por lead (e, depois do ganho, por projeto). Cabeçalho para colar:

```
protocolo,recebido_em,formulario,lang,nome,empresa,email,telefone,canal,score,score_revisado,motivo_revisao,p1_stage,p2_build_type,p3_dor,p4_prazo,data_que_trava,p5_orcamento,p6_papel,resumo,origem,servico,entrada,ref,utm_source,utm_medium,utm_campaign,utm_content,utm_term,gclid,responsavel,etapa,primeiro_contato_em,horas_ate_1o_contato,meta_sla_h,horas_sla,fora_do_sla,retomada_toque,retomada_reativou,diagnostico_em,devolutiva_enviada_em,proposta_oferta,proposta_valor,proposta_apresentada_em,fu_d3,fu_d7,fu_d14,fu_d3_feito_em,fu_d7_feito_em,fu_d14_feito_em,objecao,proximo_passo,proximo_passo_em,resultado,motivo_perda,valor_fechado,contrato_em,primeira_parcela_em,kickoff_em,go_live_em,sustentacao_contrato_em,sustentacao_valor_mensal,sustentacao_encerrada_em,status_prova,depoimento_status,depoimento_autorizado_em,ciclo_dias,horas_pre_venda,conversoes_ads_enviadas,newsletter_optin,newsletter_optin_em,newsletter_optin_canal,newsletter_optin_texto,newsletter_descadastro_em,nao_contatar,excluir_em,observacoes
```

**Como escrever as fórmulas:** os nomes de coluna abaixo valem para a célula **da mesma linha** (na linha 2, troque `recebido_em` por `B2`, `primeiro_contato_em` pela célula dessa coluna, e assim por diante). Os nomes `inicio_expediente`, `fim_expediente`, `feriados` e `Config` são da aba `Config` (abaixo). Funções em Google Sheets pt-BR; no Excel ou Sheets em inglês: `SE` = IF, `DIATRABALHOTOTAL.INTL` = NETWORKDAYS.INTL, `MED` = MEDIAN, `AGORA` = NOW, `HOJE` = TODAY, `PROCV` = VLOOKUP, `CONT.SES` = COUNTIFS, `CONT.SE` = COUNTIF, `E` = AND, `OU` = OR.

| Coluna | Como preencher |
|---|---|
| `protocolo` | do formulário; para linhas criadas à mão: WhatsApp `WA-AAAAMMDD-NN`, indicação `IND-AAAAMMDD-NN`, LinkedIn `LI-AAAAMMDD-NN`, comunidade e eventos `COM-AAAAMMDD-NN`, parceiro `PAR-AAAAMMDD-NN` (com o código do parceiro em `observacoes`, ex.: "parceiro p003"; 12 §3) |
| `recebido_em` | data e hora do envio (painel do Netlify) |
| `score` | do formulário; nunca editar |
| `score_revisado`, `motivo_revisao` | depois do primeiro contato (playbook 03 §6) |
| `p1_stage` … `p6_papel` | ids do `answers` (dicionário no playbook 03 §2) |
| `origem`, `servico`, `entrada`, `ref` | do `attribution` (`origem` é o id do CTA que levou ao wizard, ex.: `home-hero`; não é o canal) |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | do `attribution`, **só o que veio no pedido**. Linha criada à mão fica com eles vazios; o canal dela está no prefixo do `protocolo`. `utm_content` guarda o código de quem indicou (12 §2) e o toque da retomada (04 §5); `utm_term` guarda a palavra-chave do Google Ads (07 §2) |
| `gclid` | do campo próprio; usado na importação offline (playbook 07 §4) |
| `etapa` | lista fixa (abaixo) |
| `horas_sla` | horas úteis desde `recebido_em` até `primeiro_contato_em`, ou até agora se ainda não houve contato (unidade do 04 §1): `=SE(recebido_em="";"";24*((DIATRABALHOTOTAL.INTL(recebido_em;SE(primeiro_contato_em="";AGORA();primeiro_contato_em);1;feriados)-1)*(fim_expediente-inicio_expediente)+SE(DIATRABALHOTOTAL.INTL(SE(primeiro_contato_em="";AGORA();primeiro_contato_em);SE(primeiro_contato_em="";AGORA();primeiro_contato_em);1;feriados);MED(MOD(SE(primeiro_contato_em="";AGORA();primeiro_contato_em);1);fim_expediente;inicio_expediente);fim_expediente)-MED(DIATRABALHOTOTAL.INTL(recebido_em;recebido_em;1;feriados)*MOD(recebido_em;1);fim_expediente;inicio_expediente)))`. O `1` é o fim de semana sábado e domingo; se você atende no sábado, troque por `11` |
| `horas_ate_1o_contato` | `=SE(primeiro_contato_em="";"";horas_sla)`: horas úteis até o 1º contato (usada na mediana do §8) |
| `meta_sla_h` | `=PROCV(SE(score="";"sem_score";score);Config!A:B;2;FALSO)`: a meta do score, da aba `Config` |
| `fora_do_sla` | `=SE(OU(horas_sla="";meta_sla_h="");FALSO;horas_sla>meta_sla_h)`: `VERDADEIRO` quando o SLA estourou, com ou sem contato registrado |
| `retomada_toque` | último toque da sequência de retomada enviado (`d3`, `d7`, `d14`, `d21`, `d30`); vazio = fora da retomada (04 §5) |
| `retomada_reativou` | o toque que trouxe o lead de volta (respondeu, marcou ou mandou pedido novo pelo link); vazio = não reativou (04 §5.2) |
| `fu_d3`, `fu_d7`, `fu_d14` | calculadas sozinhas quando a proposta é apresentada; são as 3 tarefas do playbook 04 §4: `=SE(proposta_apresentada_em="";"";proposta_apresentada_em+3)`, `+7` e `+14` |
| `fu_d3_feito_em`, `fu_d7_feito_em`, `fu_d14_feito_em` | data em que o toque foi enviado; preenchida à mão ao enviar a mensagem do 04 §4. É ela que apaga o vermelho da `fu_dN` (formatação condicional abaixo) |
| `proposta_oferta`, `proposta_valor`, `proposta_apresentada_em` | a proposta **em curso** deste lead. `proposta_oferta` aceita só `descoberta` · `desenvolvimento` · `sustentacao` · `pacote`, os mesmos valores de `oferta` da aba `Propostas` (abaixo); com `pacote`, o nome do pacote vai em `observacoes` (tabela interna do 02 §5, só com D03 = sim). O histórico de todas as propostas, com a data de envio, fica na aba `Propostas` (abaixo). Proposta seguinte na mesma linha (o desenvolvimento depois da Descoberta): a anterior já está na aba `Propostas` com o resultado; aqui, troque os três campos pelos da nova, apague os três `fu_dN_feito_em` e volte a `etapa` para "6 Proposta apresentada" até o resultado da nova. **Nunca apague** `go_live_em` nem as três colunas `sustentacao_*`: o MRR e a conversão em sustentação (13 §5) saem delas, não da `etapa`. Projeto novo de quem já é cliente ganha linha nova (protocolo novo) |
| `kickoff_em` | data da reunião de início do desenvolvimento; só preencher com `primeira_parcela_em` já preenchida (02 §6) |
| `go_live_em` | data em que o sistema entrou no ar (playbook [16](16-processo-de-entrega.md) §5). Preenchida, dispara o checklist de prova do 09 §4. Fica vazia no lead que chegou com sistema já no ar e só contratou sustentação (02 §8b) |
| `sustentacao_contrato_em` | data de assinatura do contrato recorrente de sustentação e evolução, inclusive quando ele é assinado antes do go-live, junto com o desenvolvimento (02 §8, item 6), e no caso do 02 §8b |
| `sustentacao_valor_mensal` | valor mensal contratado, sem impostos destacados, igual ao da nota fiscal; no reajuste anual, troque pelo valor novo |
| `sustentacao_encerrada_em` | data em que a sustentação acabou (fim do contrato ou aviso prévio cumprido); vazia enquanto ativa. Preenchida, mova a `etapa` para "Sustentação encerrada" |
| `status_prova` | a prova do projeto **em geral** (case, logo, números): `nao_pedida` · `pedida` · `autorizada` · `recusada` · `anonimizada` (09 §4); começa em `nao_pedida` quando `go_live_em` é preenchida. Não mede depoimento: para isso existe `depoimento_status` |
| `depoimento_status` | `nao_pedido` · `pedido` · `autorizado` · `recusado` (09 §4); começa em `nao_pedido` quando `go_live_em` é preenchida. **`autorizado`** = termo assinado com a opção "Depoimento escrito" marcada (09 §6) + texto aprovado por escrito + nome completo, cargo e empresa: um depoimento que cabe em `dados/dono.json › depoimentos`. Logo autorizado sem depoimento, ou case publicado só sem o nome (`status_prova = anonimizada`), **não** é `autorizado` |
| `depoimento_autorizado_em` | data da aprovação escrita do texto do depoimento (a do termo, se vier depois) |
| `ciclo_dias` | fórmula: `contrato_em − recebido_em` |
| `horas_pre_venda` | horas gastas com o lead até o ganho ou a perda (diagnóstico, devolutiva, proposta, apresentação, follow-up); entra no custo de aquisição do 13 §5 |
| `conversoes_ads_enviadas` | quais estágios já foram importados no Google Ads |
| `newsletter_optin` | `sim` só com opt-in explícito (04 §6); `nao` depois de um descadastro (link do e-mail, pedido por mensagem ou hard bounce); vazio nos outros casos |
| `newsletter_optin_em`, `newsletter_optin_canal`, `newsletter_optin_texto` | data do aceite, canal (`whatsapp`, `email` ou `conversa`) e o texto exato do convite aceito: é o registro do consentimento. **Nunca apague** depois de um descadastro: ficam como histórico |
| `newsletter_descadastro_em` | data em que a pessoa saiu da newsletter (revogação do consentimento, LGPD art. 8º, §5º). Preenchida junto com `newsletter_optin = nao` em **todas** as linhas com o mesmo e-mail, no mesmo dia do pedido ou, no máximo, na sincronização antes do próximo envio (04 §6). Com ela preenchida em qualquer linha, o e-mail nunca volta para a lista |
| `nao_contatar` | `sim` quando o lead pede para parar ou se opõe ao uso dos dados (também tira da newsletter). Descadastro só da newsletter **não** muda `nao_contatar` |
| `excluir_em` | `recebido_em` + prazo de retenção da Política (playbook 10 §5) |

**Lista de etapas** (validação de dados na coluna `etapa`; as mesmas etiquetas do WhatsApp Business):

| Etapa | Entra quando |
|---|---|
| 1 Novo | o pedido chega |
| 2 Contatado | a primeira mensagem humana sai |
| 3 Diagnóstico marcado | data combinada |
| 4 Diagnóstico feito | a conversa acontece |
| 5 Devolutiva enviada | devolutiva + proposta da Descoberta enviadas |
| 6 Proposta apresentada | apresentação ao vivo feita (02 §9) |
| 7 Ganho: Descoberta | aceite e pagamento da Descoberta |
| 8 Ganho: Desenvolvimento | contrato assinado e 1ª parcela recebida |
| 9 Sustentação ativa | contrato recorrente assinado; `sustentacao_contrato_em` e `sustentacao_valor_mensal` preenchidas |
| Sustentação encerrada | com `sustentacao_encerrada_em` |
| Perdido | com `motivo_perda` |
| Adiado | com `proximo_passo_em` |
| Sem resposta | fim da cadência do playbook 04 §3 ou da retomada do 04 §5 |
| Reativado | chegou um pedido novo do mesmo lead pela retomada (`utm_source = retomada`); o trabalho segue na linha nova (04 §5.2) |
| Não contatar | pediu para parar |

**Regra:** toda linha que não está em Ganho, Sustentação ativa, Sustentação encerrada, Perdido, Sem resposta, Reativado ou Não contatar tem `responsavel`, `proximo_passo` e `proximo_passo_em`.

**Formatação condicional** (Formatar › Formatação condicional › "A fórmula personalizada é", aplicada ao intervalo da aba; trave a coluna com `$`, ex.: `=$AK2=VERDADEIRO`):

| Regra | Fica vermelho |
|---|---|
| `proximo_passo_em` vencido | a célula |
| `fora_do_sla = VERDADEIRO` (qualquer score; substitui a antiga regra "score A sem primeiro contato") | a linha |
| `E(etapa="6 Proposta apresentada"; fu_d3<>""; HOJE()>=fu_d3; fu_d3_feito_em="")`; o mesmo para d7 (`fu_d7`, `fu_d7_feito_em`) e d14 (`fu_d14`, `fu_d14_feito_em`): toque vencido e não enviado | a célula `fu_dN`, do dia do toque até ele ser registrado em `fu_dN_feito_em` |
| `E(etapa="6 Proposta apresentada"; fu_d14<>""; HOJE()>fu_d14)`: sem status final depois do D+14 | a linha |
| `E(kickoff_em<>""; OU(primeira_parcela_em=""; primeira_parcela_em>kickoff_em))`: kickoff antes da 1ª parcela (B366) | a linha |
| `E(go_live_em<>""; status_prova="nao_pedida")`: projeto no ar sem pedido de prova (B372) | a linha |
| `E(go_live_em<>""; HOJE()-go_live_em>prazo_depoimento_dias; OU(depoimento_status="nao_pedido"; depoimento_status="pedido"))`: depoimento não pedido ou pedido e sem resposta depois do prazo (B372) | a linha |

`prazo_apresentacao` e `prazo_depoimento_dias` são intervalos nomeados da aba `Config` (abaixo).

**Teste da formatação do follow-up (B364):** numa linha de teste em "6 Proposta apresentada", com `proposta_apresentada_em` = hoje − 8 e `fu_d3_feito_em` preenchida, só a célula `fu_d7` fica vermelha; com `proposta_apresentada_em` = hoje − 15 e a etapa ainda em 6, a linha inteira fica vermelha. Apague a linha e registre o teste em [15](15-registro-de-decisoes.md) §2.

O vermelho do SLA depende de `AGORA()`: em Arquivo › Configurações › Cálculo, escolha **"Na alteração e a cada hora"**, para a linha ficar vermelha mesmo sem ninguém editar a planilha.

**Aba `Config`** — metas e expediente, copiados do 04 §1:

```
chave,valor
A,[PREENCHER horas úteis]
B,[PREENCHER horas úteis]
C,[PREENCHER horas úteis]
D,[PREENCHER horas úteis]
sem_score,[PREENCHER horas úteis: WhatsApp direto e linhas criadas à mão]
inicio_expediente,[PREENCHER hh:mm]
fim_expediente,[PREENCHER hh:mm]
prazo_apresentacao,[PREENCHER dias úteis entre o envio e a apresentação da proposta, o mesmo do 02 §9]
prazo_depoimento_dias,[PREENCHER dias corridos depois do go-live para ter a resposta do pedido de depoimento]
janela_sustentacao_dias,[PREENCHER dias corridos depois do go-live em que a assinatura da sustentação ainda conta como conversão (13 §5)]
```

Crie os intervalos nomeados `inicio_expediente` e `fim_expediente` (as duas células de valor, formatadas como hora), `prazo_apresentacao`, `prazo_depoimento_dias` e `janela_sustentacao_dias` (células de valor, como número) e `feriados` (uma coluna com as datas dos feriados nacionais, do estado de São Paulo e da cidade de São Paulo do ano, por exemplo 25/01, aniversário da cidade, e 09/07, feriado estadual; atualize todo janeiro; até 20/10/2026 a lista era a de Florianópolis, D38). O aceite do alerta de SLA está no 04 §1 ("Teste do alerta").

**Aba `Propostas`** (B363) — **uma linha por proposta**, não por lead: o mesmo lead pode ter a da Descoberta, depois a do desenvolvimento e, no go-live, a da sustentação. Cabeçalho para colar:

```
protocolo,oferta,enviada_em,apresentada_em,dias_uteis_ate_apresentar,participantes,objecao,resultado,resultado_em,motivo_perda,observacoes
```

| Coluna | Como preencher |
|---|---|
| `protocolo` | o mesmo da linha do lead em `Pedidos` |
| `oferta` | `descoberta` · `desenvolvimento` · `sustentacao` · `pacote` (modelos do 02 §7, §8 e §8b; `pacote` usa o 02 §8 sem a referência à Descoberta, só com D03 = sim, e o nome do pacote vai em `observacoes`) |
| `enviada_em` | data em que a proposta foi enviada ao cliente |
| `apresentada_em` | data da apresentação ao vivo (02 §9); vazia até ela acontecer |
| `dias_uteis_ate_apresentar` | `=SE(apresentada_em="";"";DIATRABALHOTOTAL.INTL(enviada_em;apresentada_em;1;feriados)-1)` |
| `participantes`, `objecao` | quem participou da apresentação e a objeção nomeada (02 §9) |
| `resultado` | `ganho` · `perdido` (com `motivo_perda`) · `adiado` (data em `observacoes` e em `proximo_passo_em` de `Pedidos`) |
| `resultado_em` | data em que o resultado foi registrado (aceite, recusa ou adiamento) |

Formatação condicional da aba (a linha fica vermelha):
- `E(enviada_em<>""; apresentada_em=""; DIATRABALHOTOTAL.INTL(enviada_em;HOJE();1;feriados)-1>prazo_apresentacao)`: enviada e não apresentada no prazo;
- `E(apresentada_em<>""; resultado=""; HOJE()-apresentada_em>14)`: apresentada e sem resultado depois do D+14 (o mesmo limite do 04 §4).

Ao enviar uma proposta, crie a linha aqui no mesmo dia; ao apresentar, preencha `apresentada_em` aqui e `proposta_apresentada_em` em `Pedidos` (é ela que calcula o follow-up do 04 §4).

**Aba `Parceiros`** (B313; acordo e kit no [12](12-canais-indicacao-linkedin-conteudo.md) §3) — uma linha por parceiro:

```
codigo,empresa,contato,acordo_assinado_em,indicacoes,contratos,comissoes_pagas
```

| Coluna | Como preencher |
|---|---|
| `codigo` | `p001`, `p002`…: o mesmo do `utm_campaign` do link do parceiro; nunca nome de pessoa |
| `empresa`, `contato` | empresa parceira e a pessoa de contato (dado pessoal: mesma retenção e acesso restrito da planilha, §9) |
| `acordo_assinado_em` | data da assinatura do acordo por escrito (12 §3) |
| `indicacoes` | soma sozinha os pedidos que chegaram pelo link e os apresentados sem o link (protocolo `PAR-…` com o código em `observacoes`). Na linha 2, com o código em `A2`: `=CONT.SES(Pedidos!utm_source;"parceiro";Pedidos!utm_campaign;A2) + CONT.SES(Pedidos!protocolo;"PAR-*";Pedidos!observacoes;"*"&A2&"*")` |
| `contratos` | contratos fechados com clientes indicados por este parceiro (Descoberta, desenvolvimento, sustentação, conforme o acordo) |
| `comissoes_pagas` | soma das comissões já pagas, contra nota fiscal do parceiro; o detalhe de cada pagamento fica no financeiro |

**Aba `Contato`** — formulário `contato`: `recebido_em, lang, nome, email, telefone, assunto, mensagem, origem, responsavel, respondido_em, virou_pedido, observacoes, excluir_em`.

## 6. Rotina

| Quando | O quê |
|---|---|
| A cada notificação | criar a linha na aba `Pedidos` ou `Contato` (2 minutos) e fazer o primeiro contato dentro do SLA |
| Ao enviar uma proposta | linha nova na aba `Propostas` com `enviada_em`; marcar a apresentação ao vivo dentro do `prazo_apresentacao` (02 §9) |
| Ao enviar um toque de follow-up | preencher `fu_d3_feito_em`, `fu_d7_feito_em` ou `fu_d14_feito_em` com a data (04 §4) |
| Diário | olhar os vermelhos da planilha (SLA estourado, toques de follow-up vencidos e não registrados, propostas sem status depois do D+14, propostas enviadas e não apresentadas no prazo, kickoff sem 1ª parcela, projeto no ar sem pedido de prova, depoimento sem resposta depois do `prazo_depoimento_dias`) |
| No go-live de um projeto | preencher `go_live_em` (`status_prova` começa em `nao_pedida` e `depoimento_status` em `nao_pedido`), rodar o checklist do 09 §4 e atualizar as duas colunas |
| Ao assinar ou encerrar uma sustentação | assinatura: `sustentacao_contrato_em`, `sustentacao_valor_mensal` e etapa "9 Sustentação ativa"; fim: `sustentacao_encerrada_em` e etapa "Sustentação encerrada" (16 §6) |
| Semanal | conferir Forms › Spam submissions; **reconciliar contagens**: envios no Netlify × linhas no CRM × `lead_submitted` no GA4 na mesma semana (diferença grande = lead perdido, adblock ou falha de medição) |
| Semanal | registrar conversas de WhatsApp que viraram oportunidade (protocolo `WA-…`, canal `whatsapp`) |
| Mensal | relatório do funil (§8) e rotina de exclusão (playbook 10 §6) |

O painel do Netlify permite baixar os envios de um formulário em CSV; use para a reconciliação ou para recuperar um pedido que não gerou linha.

## 7. Opcional: envio automático para a planilha (outgoing webhook)

Só depois de: (a) a Política citar a ferramenta (Google Apps Script/Sheets, Zapier, Make…), (b) a planilha ter acesso restrito e (c) um teste no painel.

Exemplo com Google Apps Script na própria planilha (Extensões › Apps Script), publicado como app da web e com a URL `…/exec?token=<seu token>` cadastrada como outgoing webhook **só do formulário `briefing`**:

```js
// Copia só os campos necessários. Não grava IP nem user agent (minimização).
const TOKEN = "[PREENCHER: texto aleatório longo, guardado só aqui e no Netlify]";
const CAMPOS = ["protocol", "name", "company", "email", "phone", "channel", "score",
                "lang", "summary", "answers", "attribution", "gclid", "details"];

function doPost(e) {
  if (!e || !e.parameter || e.parameter.token !== TOKEN) {
    return ContentService.createTextOutput("forbidden");
  }
  const envio = JSON.parse(e.postData.contents);
  const d = envio.data || {};
  SpreadsheetApp.getActive().getSheetByName("Entrada")
    .appendRow([envio.created_at || new Date().toISOString(), ...CAMPOS.map((c) => d[c] || "")]);
  return ContentService.createTextOutput("ok");
}
```

- Grave numa aba `Entrada` e copie para `Pedidos` à mão (assim a estrutura da §5 não quebra).
- Confira a estrutura real do JSON no primeiro envio (Apps Script › Execuções). Se os nomes vierem diferentes, ajuste `envio.data` e `envio.created_at`.
- Se o webhook falhar, o e-mail de notificação continua chegando: ele é a rede de segurança.

## 8. Relatórios do funil comercial (B375)

Aba `Relatório`, por mês de `recebido_em` (exemplo em Google Sheets pt-BR, com intervalos nomeados iguais aos nomes das colunas):

| Indicador | Fórmula |
|---|---|
| Leads no mês | `=CONT.SES(recebido_em;">="&DATA(2026;11;1);recebido_em;"<"&DATA(2026;12;1))` |
| Leads A+B | some os `CONT.SES` com `score;"A"` e `score;"B"` no mesmo período |
| % A+B | Leads A+B ÷ Leads no mês |
| Lead → diagnóstico | leads do mês com `diagnostico_em` preenchido (`diagnostico_em;"<>"`) ÷ leads do mês |
| Diagnóstico → proposta apresentada | com `proposta_apresentada_em;"<>"` ÷ com `diagnostico_em;"<>"` |
| Proposta → ganho | com `resultado;"Ganho*"` ÷ com `proposta_apresentada_em;"<>"` |
| % propostas apresentadas ao vivo (B363, por trimestre) | aba `Propostas`: `=CONT.SES(prop_enviada_em;">="&início_do_tri;prop_enviada_em;"<"&início_do_tri_seguinte;prop_apresentada_em;"<>") / CONT.SES(prop_enviada_em;">="&início_do_tri;prop_enviada_em;"<"&início_do_tri_seguinte)` (meta 100%) |
| % apresentadas no prazo (B363) | o mesmo denominador; no numerador, troque `prop_apresentada_em;"<>"` por `prop_dias_uteis_ate_apresentar;"<="&prazo_apresentacao` |
| % propostas com resultado registrado (B363) | o mesmo denominador; no numerador, `prop_resultado;"<>"` |
| Proposta → ganho, por proposta | aba `Propostas`: `CONT.SES(prop_resultado;"ganho";…)` ÷ `CONT.SES(prop_apresentada_em;"<>";…)` no período; acrescente `prop_oferta;"descoberta"` (ou `"desenvolvimento"`) para separar as ofertas |
| Ciclo médio (dias) | `=MÉDIA.SE(ciclo_dias;"<>")` filtrando os contratos do mês |
| Mediana do 1º contato (h úteis) | `=MED(FILTER(horas_ate_1o_contato;horas_ate_1o_contato<>""))` |
| Leads fora do SLA | `=CONT.SES(fora_do_sla;VERDADEIRO;recebido_em;">="&DATA(2026;11;1);recebido_em;"<"&DATA(2026;12;1))` (por score: acrescente `score;"A"`) |
| Pedidos por indicação (B312) | `=CONT.SES(utm_source;"indicacao";recebido_em;">="&DATA(2026;11;1);recebido_em;"<"&DATA(2026;12;1)) + CONT.SES(protocolo;"IND-*";recebido_em;">="&DATA(2026;11;1);recebido_em;"<"&DATA(2026;12;1))` (quem veio pelo link do 12 §2 + quem chegou por mensagem direta) |
| Pedidos de comunidade (B318) | a mesma fórmula com `utm_source;"comunidade"` e `protocolo;"COM-*"` (12 §4) |
| Pedidos de parceiros (B313) | `=CONT.SES(utm_source;"parceiro";recebido_em;">="&DATA(2026;11;1);recebido_em;"<"&DATA(2026;12;1)) + CONT.SES(protocolo;"PAR-*";recebido_em;">="&DATA(2026;11;1);recebido_em;"<"&DATA(2026;12;1))` (quem veio pelo link do parceiro + quem foi apresentado sem o link, 12 §3) |
| Pedidos por WhatsApp | `CONT.SES(protocolo;"WA-*";…)` no mesmo período |

Troque as datas pelo mês do relatório (ou use células `início_do_mês` e `início_do_mês_seguinte`; nos indicadores de proposta, `início_do_tri` e `início_do_tri_seguinte`). Na aba `Propostas`, os intervalos nomeados levam o prefixo `prop_` (`prop_enviada_em`, `prop_apresentada_em`, `prop_dias_uteis_ate_apresentar`, `prop_resultado`, `prop_oferta`), porque `resultado` e `protocolo` já são nomes da aba `Pedidos`. As linhas criadas à mão não têm UTM; por isso indicação, comunidade e parceiros somam o prefixo do protocolo.

Critério de aceite do B375: o relatório mostra as 3 taxas de conversão e o ciclo médio do mês. Os KPIs e as metas estão no playbook [13](13-kpis-e-rituais.md).

## 9. Cuidados de LGPD na planilha

- Só os campos da §5. Não copie IP, user agent nem o JSON inteiro do Netlify.
- Acesso só para quem atende; verificação em duas etapas na conta que guarda a planilha.
- `excluir_em` preenchido em toda linha; a rotina mensal apaga ou anonimiza o que venceu (playbook 10 §6), inclusive no painel do Netlify e no e-mail.
- `nao_contatar = sim` também bloqueia a importação do `gclid` no Google Ads (oposição, playbook 07 §4).
