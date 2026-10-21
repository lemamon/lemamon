# 03 — Qualificação do lead e uso do score A/B/C/D

**Backlog:** B042 (uso operacional da classificação), B360 (regras de qualificação: no fim, por faixas, com saída digna — lado operacional), B374 (% de leads A+B, junto com o playbook 13).
**Fontes:** BLUEPRINT §7.3 (perguntas), §7.9 (classificação), §7.10 (campos do formulário); 07-negocios §7.5.

---

## 1. Princípios

1. **Nenhuma resposta descarta o lead.** O score organiza a fila; não decide quem é atendido. A Política diz que a classificação é usada para "organizar a ordem de atendimento" (i18n `privacy.sections.purposes.items.service_order`).
2. **O score nunca é mostrado ao cliente** e não existe tela de recusa.
3. **Enquanto o site disser "a gente marca os 45 minutos" a todo pedido**, todo pedido recebe o convite para o diagnóstico, inclusive o fora de perfil (i18n `quote._notes.pending_owner` 5). Mudar isso exige variante de texto no site antes.
4. **O comercial pode revisar o score** depois do primeiro contato, mas o score original fica registrado (é ele que mede a qualidade do site).

## 2. O que chega em cada pedido (formulário `briefing`)

| Campo | O que é |
|---|---|
| `protocol` | protocolo `LEM-AAAAMMDD-XXXX` (o cliente vê o mesmo no pós-envio e no WhatsApp) |
| `name`, `email`, `phone`, `company` | contato; `phone` só é obrigatório se o canal for WhatsApp ou Ligação; `company` é opcional |
| `channel` | canal preferido: WhatsApp, E-mail ou Ligação (Ligação só com `confirmacoes.ligacao`) |
| `details` | "Quer contar mais alguma coisa?" (opcional) |
| `summary` | resumo legível das respostas: **leia este primeiro** |
| `answers` | JSON com os ids das respostas (dicionário abaixo), inclusive `deadline_reason` |
| `score` | A, B, C ou D (§3) |
| `lang` | `pt`, `en` ou `es`: responda no mesmo idioma |
| `attribution` | JSON: UTMs, referrer, página de entrada, `origem` (CTA clicado), `servico`, `ref` (case), `entrada` |
| `gclid` | identificador do clique no Google Ads (usado na importação offline, playbook 07 §4) |

### Dicionário das respostas

**P1 `stage` — Em que ponto você está?**

| id | Significa | Leitura comercial |
|---|---|---|
| `problem_unclear` | tem um problema na operação, não sabe o que construir | candidato natural à Descoberta |
| `product_idea` | tem uma ideia de produto | fundador; perguntar a data (captação, piloto) |
| `scope_defined` | já sabe o que precisa ser construído | conferir se o escopo basta; Descoberta continua sendo o padrão |
| `evolve_live_system` | tem sistema ou produto no ar e quer evoluir | entender quem desenvolveu e o acesso ao código |
| `maintain_live_system` | tem sistema no ar e precisa de quem cuide | sustentação; **não prometa assumir sistema de terceiros** sem `confirmacoes.sistemaTerceiros` |

**P2 `build_type` — O que você precisa construir?** (multisseleção)
`ops_system` sistema para a operação · `client_platform` portal ou plataforma para clientes · `mobile_app` aplicativo · `integration` integração entre sistemas · `automation` automação de tarefas ou atendimento · `mvp` produto novo ou MVP · `not_sure` ainda não sei (exclusiva).

**P3 `pain` (opcional, até 3)** — `manual_process` processo manual que depende de uma pessoa · `double_entry` digitação em mais de um lugar · `disconnected_tools` ferramentas que não conversam · `off_the_shelf_misfit` software pronto não atende · `late_numbers` números atrasados ou que não batem · `customer_channel` clientes pedem canal digital · `new_product` lançar produto novo · `other`.
**P3 `system_pain` (quem tem sistema no ar)** — `errors_instability` · `new_features` · `hard_to_maintain` · `ongoing_care` · `other`.

**P4 `deadline` — Quando precisa estar funcionando?** `asap` · `within_3_months` · `between_3_and_6_months` · `over_6_months` · `not_defined`. Mais `deadline_reason` (a data que trava, texto livre): **o melhor sinal de urgência real**.

**P5 `budget`** — modo sem números (padrão): `approved` já aprovado · `being_defined` em definição · `not_considered` ainda não pensou · `prefer_to_discuss` prefere conversar. Modo com faixas (`qualificacao.ts` preenchido): `tier_1` a `tier_4` · `not_sure` · `prefer_to_discuss`.

**P6 `role` — Papel na decisão:** `i_decide` · `decide_with_partners` · `recommend_to_decider` (influenciador técnico; **não** cai automaticamente em C) · `researching` · `not_defined`.

## 3. Como o score é calculado (BLUEPRINT §7.9)

Definições:
- **Orçamento OK** = faixa ≥ `corteMql` (modo com faixas) ou `approved` (modo sem números).
- **Prazo OK** = `asap`, `within_3_months` ou `between_3_and_6_months`.
- **Decisor acessível** = `i_decide`, `decide_with_partners` ou `recommend_to_decider`.

| Score | Regra | Uso |
|---|---|---|
| **A** | orçamento OK + prazo OK + P6 ∈ {`i_decide`, `decide_with_partners`} | topo da fila; contato prioritário. **MQL = score A** |
| **B** | (orçamento OK **ou** prazo OK **ou** `being_defined`) + decisor acessível; `prefer_to_discuss` não penaliza | fila normal |
| **C** | orçamento `not_sure`/`not_considered`, **ou** prazo `over_6_months`/`not_defined`, **ou** P6 ∈ {`researching`, `not_defined`} | convite ao diagnóstico + cadência de retomada |
| **D** | faixa `tier_1` com 3 ou mais tipos na P2, ou `tier_1` com `mvp` + `client_platform` | fora de perfil: resposta honesta e rápida, nunca sem resposta |

**Hoje (sem `qualificacao.ts`) só existem A, B e C**: o score D depende de faixas numéricas e de `scoreD.ativo` (que exige `confirmacoes.scoreDRecebeDiagnostico`). A precedência exata entre regras está no código da ilha do wizard; na dúvida, revise no primeiro contato.

**Divergência de documentos:** o README §7 define MQL por valor e prazo; o BLUEPRINT (que prevalece) define **MQL = score A**. Use o BLUEPRINT.

## 4. O que fazer com cada score

| Score | Primeiro contato (SLA interno, playbook 04) | Canal | Objetivo do contato | Se não responder |
|---|---|---|---|---|
| A | [PREENCHER] (07 sugere até 2 h úteis) | o canal escolhido; se for WhatsApp ou Ligação, tente no mesmo dia | marcar o diagnóstico com quem decide | cadência 04 §3 |
| B | [PREENCHER] (07 sugere até 24 h úteis) | o canal escolhido | marcar o diagnóstico | cadência 04 §3 |
| C | [PREENCHER] (07 sugere até 48 h úteis) | o canal escolhido | convidar para o diagnóstico; entender o momento | cadência 04 §3, depois retomada 04 §5 |
| D | [PREENCHER] (07 sugere até 48 h úteis) | o canal escolhido | resposta honesta (§5) + convite para os 45 minutos | encerrar com cordialidade |

Modelos de mensagem por score: playbook [04](04-sla-follow-up-e-nutricao.md) §2.

## 5. Fora de perfil (D) e respostas difíceis

- **Diga o motivo com franqueza** e, quando houver, indique a alternativa (software pronto, outro tipo de fornecedor, escopo menor). "Cliente descartado hoje indica cliente bom amanhã" (07 §7.5.4).
- **Mantenha o convite para o diagnóstico** enquanto o site prometer a todos (§1, princípio 3).
- **Nunca deixe sem resposta.** Lead D sem resposta é falha de SLA.

## 6. Checklist de qualificação (primeiro contato e diagnóstico)

O wizard cobre B, A, N e T. O diagnóstico confirma e acrescenta F e P (07 §7.5.1).

| Letra | Pergunta a responder | Sinal bom | Sinal de alerta |
|---|---|---|---|
| **N** Necessidade | Existe dor operacional ou financeira mensurável? | o cliente descreve o custo de hoje | "quero ter um app" sem problema por trás |
| **T** Prazo | Quando precisa estar no ar, e por quê? | data com motivo (evento, contrato, temporada) | sem data e sem motivo |
| **A** Autoridade | Quem assina? Essa pessoa participa? | decisor na conversa | sem acesso ao decisor até a segunda conversa |
| **B** Orçamento | O investimento está previsto? | aprovado ou em definição | expectativa muito abaixo do piso da oferta |
| **F** Fit técnico | A Lemamon.dev sabe entregar isso bem? | dentro dos serviços confirmados | fora de competência com prazo apertado |
| **P** Pagamento | Empresa formalizada, aceita entrada antes do início? | aceita a condição de pagamento | resiste à entrada ou quer pagar só no fim |

Registre no CRM: `score` original, `score revisado`, motivo da revisão. Exemplo: um `researching` (C) que, na conversa, traz o sócio que decide pode virar B.

## 7. Pedidos que não vêm do wizard

| Origem | Como tratar |
|---|---|
| Formulário `contato`, assunto "Projeto novo" ou "Sistema que já existe" | responda e convide para o diagnóstico; link `https://lemamon.dev/orcamento?origem=contato` |
| Formulário `contato`, assunto "Parceria" | lista de parceiros (playbook 12 §3) |
| Formulário `contato`, assunto "Outro" | responder pelo e-mail informado |
| WhatsApp direto | registre no CRM com origem `whatsapp` e a página citada na mensagem pré-preenchida ("Vim pela página…"); classifique manualmente com a §3 |
| Indicação ou parceiro | origem `indicacao` ou `parceiro-<nome>`; classifique manualmente |

## 8. Calibração (a cada trimestre)

1. Exporte do CRM os leads do trimestre com `score`, `score revisado` e resultado (diagnóstico feito, proposta, ganho, perdido).
2. Calcule a taxa de fechamento por score. Se o B fecha tanto quanto o A, o corte está alto; se o A raramente fecha, está baixo.
3. Ajuste o que é config (`qualificacao.corteMql`, faixas). Mudança nas **regras** é código da ilha do wizard: peça ao agente `conversion`.
4. Registre a mudança e a data em [15-registro-de-decisoes.md](15-registro-de-decisoes.md).

## 9. Direito de revisão (LGPD art. 20)

Se alguém pedir para entender ou revisar a classificação do próprio pedido, explique os critérios desta página em linguagem simples, revise manualmente e responda pelo e-mail. Procedimento de pedidos de titular: playbook [10](10-lgpd-operacional.md) §7.
