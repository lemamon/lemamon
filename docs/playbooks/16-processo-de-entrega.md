# 16 — Processo de entrega: do kickoff à sustentação

**Backlog:** B371 (processo de entrega documentado, para reduzir a dependência de pessoa-chave e permitir subcontratar em pico). Apoia B366 (1ª parcela antes do kickoff), B372 (prova no go-live), B109 (passagem para sustentação) e B365 (aceite contra o anexo de escopo).
**Fontes:** BLUEPRINT §1.2 (processo que pode ser prometido) e §12; decisão 5 do dono (mudança de escopo); playbooks [02](02-proposta-e-politica-comercial.md) §5, §6, §8, §10 e §11; [05](05-crm-e-funil.md) §5; [09](09-prova-cases-depoimentos.md) §4; [10](10-lgpd-operacional.md) §3 e §9.

> Interno. Nada aqui é publicado, e nada aqui cria promessa nova: sem duração de MVP ou de Descoberta e sem SLA com número (BLUEPRINT §12). O único ritmo fixo é o que o site já promete: **entregas a cada 2 semanas**, com software funcionando.

Quem é quem neste playbook: **responsável pelo projeto** = [PREENCHER] (quem conduz o projeto com o cliente); **time** = quem desenvolve, inclusive subcontratado (§7).

---

## 1. Kickoff (checklist)

O kickoff só é marcado com todos os itens abaixo marcados.

- [ ] Contrato assinado, com o **anexo de escopo** item a item, as exclusões, as premissas e os marcos (02 §10).
- [ ] **1ª parcela recebida** e `primeira_parcela_em` preenchida no CRM (02 §6). Só então preencha `kickoff_em`; a planilha pinta a linha de vermelho se o kickoff vier antes da parcela (05 §5).
- [ ] NDA assinado, se o projeto pede sigilo (02 §11).
- [ ] **Acessos** recebidos, com o mínimo necessário: código existente, servidores, contas de terceiros (pagamento, e-mail, lojas de aplicativo), sistemas a integrar. Lista de acessos guardada em [PREENCHER local seguro], nunca em mensagem.
- [ ] **Ambientes** combinados: desenvolvimento, homologação (onde o cliente vê o software funcionando) e produção; quem paga a infraestrutura (02 §8, "O que NÃO está incluído").
- [ ] **Canal** do projeto definido (grupo, e-mail ou quadro de tarefas) e quem participa do lado do cliente, inclusive quem aprova cada entrega.
- [ ] **Calendário** das entregas a cada 2 semanas marcado na agenda dos dois lados, com a data da primeira demonstração.
- [ ] Horas orçadas por marco copiadas para o controle de horas (§4).

**Pauta da reunião de kickoff:** retomar o problema e o "deu certo" com as palavras do cliente; ler junto o escopo priorizado e o que não está incluído; apresentar o ciclo de entregas (§2) e a regra de mudança de escopo (§3); confirmar quem aprova; marcar a primeira demonstração.

## 2. O ciclo de entregas a cada 2 semanas

| Momento | O que acontece | Registro |
|---|---|---|
| Início do ciclo | planejamento: os itens do anexo de escopo que entram neste ciclo, na ordem do escopo priorizado | lista do ciclo no canal do projeto |
| Durante o ciclo | desenvolvimento e teste interno; dúvidas do time vão ao cliente pelo canal, sem esperar a demonstração | horas por marco (§4) |
| Fim do ciclo | **demonstração de software funcionando** no ambiente de homologação, que o cliente acessa e usa. Nunca slide, vídeo ou protótipo no lugar do software | data da demonstração |
| Depois da demonstração | **aceite por item** contra o critério de aceite do anexo de escopo (02 §10): aceito, ou ajuste necessário com o motivo | aceite por escrito no canal (o "ok" do cliente por item) |

Regras:
- Item aceito não volta sem uma mudança de escopo (§3).
- Ajuste dentro do critério de aceite já combinado não é mudança de escopo: entra no ciclo seguinte.
- Se uma data de entrega do plano estiver em risco, o cliente sabe no mesmo ciclo, com o motivo e as opções. Nunca na data.

## 3. Mudança de escopo

Texto aprovado pelo dono (decisão 5), usado com o cliente e no site:

> As entregas a cada 2 semanas existem para você perceber cedo o que precisa mudar. Se a mudança mexer no escopo, escopo, prazo e preço são combinados de novo antes de seguir.

Como funciona:
1. O cliente ou o time identifica a mudança, quase sempre numa demonstração.
2. O responsável pelo projeto escreve o pedido de mudança: o que muda, o impacto em prazo e em preço (pela conta da 02 §3) e o que sai do escopo, se for troca.
3. O cliente aprova por escrito **antes** de a mudança entrar num ciclo (02 §4, item 7; cláusula do contrato, 02 §10).
4. O anexo de escopo e o calendário são atualizados, e o CRM registra a mudança em `observacoes`.

## 4. Apontamento de horas por marco

- Cada pessoa do time registra as horas por marco, na mesma divisão de marcos da proposta (planilha ou ferramenta: [PREENCHER]).
- No fim de cada marco: horas realizadas × orçadas do marco, conferidas pelo responsável pelo projeto.
- No fim do projeto: `desvio = horas realizadas ÷ horas orçadas`, que vai para a recalibração do colchão no ritual trimestral (02 §5; 13 §5 e §6) e para a margem bruta do projeto (13 §1).

## 5. Definição de pronto e go-live

**Um item está pronto** quando:
- [ ] cumpre o critério de aceite do anexo de escopo;
- [ ] passou pelo teste interno e foi aceito pelo cliente na demonstração;
- [ ] está no ambiente de homologação, com o código no repositório do projeto;
- [ ] o que o cliente precisa saber para usar está escrito (ajuda, nota de entrega ou documentação combinada no escopo).

**Checklist de go-live:**
- [ ] Todos os itens do marco final aceitos.
- [ ] Dados migrados e conferidos com o cliente, se a migração estiver no escopo.
- [ ] Acessos de produção conferidos (só quem precisa) e credenciais guardadas em [PREENCHER local seguro].
- [ ] Backup e monitoramento de produção ligados, conforme o combinado no escopo.
- [ ] Publicação nas lojas, quando fizer parte do escopo de um aplicativo.
- [ ] Combinado com o cliente o horário da publicação e quem fica de prontidão nas primeiras horas.
- [ ] Depois da publicação: `go_live_em` preenchida no CRM (05 §5) e, **no mesmo dia, o checklist de prova do 09 §4** (pedido de depoimento, logo, números, vídeo curto; `status_prova` e `depoimento_status`).
- [ ] Última parcela conforme o contrato (02 §6).

## 6. Passagem para sustentação e evolução

- A sustentação já foi oferecida e precificada na proposta de desenvolvimento (02 §8, item 6). No go-live, o responsável pelo projeto retoma a oferta com o cliente.
- Se o cliente contratar: contrato recorrente assinado; no CRM, preencher `sustentacao_contrato_em` e `sustentacao_valor_mensal` e mover a etapa para "9 Sustentação ativa" (05 §5). É dessas duas colunas, junto com `go_live_em`, que saem a conversão em sustentação e o MRR (13 §5); a etapa sozinha não serve de fonte. Combine os canais de atendimento (02 §8, definição interna).
- No fim do contrato de sustentação: preencher `sustentacao_encerrada_em` e mover a etapa para "Sustentação encerrada"; revogar os acessos do time (§7).
- Entregue ao cliente, por escrito: onde o sistema roda, quais acessos ele tem, como pedir correção e evolução, e o que **não** está incluído na sustentação.
- Se o cliente não contratar: registre o motivo em `observacoes`, entregue a mesma documentação de acessos e combine a revogação dos acessos do time (§7).

## 7. Entrada de subcontratado (pico de demanda)

Antes do primeiro acesso de qualquer pessoa de fora do time fixo:

- [ ] **Contrato** com a pessoa ou empresa, com confidencialidade e cessão do que ela produzir no projeto (texto do advogado), coerente com o que o contrato do cliente diz sobre propriedade do código (02 §10).
- [ ] **NDA** assinado (02 §11) e, se o contrato do cliente exigir, o cliente avisado ou de acordo com a subcontratação.
- [ ] **LGPD:** se o projeto trata dados pessoais dos clientes do cliente, o subcontratado é suboperador: o contrato com ele repete as obrigações de tratamento do contrato do cliente (instruções, segurança, incidentes, exclusão ao final; 02 §10 e playbook 10 §3).
- [ ] **Acesso mínimo:** só os repositórios, ambientes e contas do projeto, com conta individual (nunca senha compartilhada) e verificação em duas etapas. Sem acesso à produção, salvo necessidade registrada.
- [ ] **Leitura obrigatória:** este playbook, o anexo de escopo do projeto e as regras de copy do BLUEPRINT §12, se ele for escrever qualquer texto para o cliente.
- [ ] **Na saída:** revogar todos os acessos no mesmo dia e registrar na revisão de acessos (playbook 10 §9).

Registre cada subcontratação (quem, projeto, acessos dados, data de entrada e de saída) na planilha, aba `Subcontratados`:

```
nome_ou_empresa,projeto,acessos,nda_em,contrato_em,entrada_em,saida_em,acessos_revogados_em
```

## 8. Critério de aceite (B371)

- Este processo existe e está no [INDEX](INDEX.md) e no playbook 13 §8.
- O bloco de prospecção foi cumprido em ≥ 90% das semanas do trimestre (coluna `bloco_prospeccao_cumprido` do painel semanal, 13 §3.2).
- No primeiro projeto que usar este playbook, o responsável pelo projeto anota o que faltou e atualiza o documento.
