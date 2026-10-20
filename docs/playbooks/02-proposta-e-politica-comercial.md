# 02 — Proposta, política comercial e precificação

**Backlog:** B351 (premissas), B353 (custo-hora e margem), B355 (preço fechado, nunca preço-hora), B356 (teto da Descoberta obrigatória), B357 (colchão de risco e horas reais), B366 (entrada e marcos), B354 (empacotar a Sprint de Descoberta), B363 (proposta padronizada por oferta, inclusive sustentação de sistema já no ar, e apresentada ao vivo), B365 (escopo e contrato), B109 (Sustentação), B111 (MVP, parte interna), B041 e B291 (Squad Dedicado), B384 (NDA e questionário de segurança), B383 (pacotes, com conflito), B114 (parcial: one-pager).
**Fontes:** BLUEPRINT §1, §5.2, §12, §14; 07-negocios §7.2, §7.3, §7.6, §7.8.

> Nada aqui é publicado. Os números deste playbook são **seus** e ficam em planilhas internas. No site, valor só existe em `precos.ts` e `qualificacao.ts`, e só depois das contas das §3 a §5.

---

## 1. Premissas do negócio (B351)

Preencha antes de definir preço, verba de mídia ou meta de leads. Os documentos de arquitetura usam estimativas de mercado; aqui entram os números reais.

| Premissa | Valor | Fonte | Alimenta |
|---|---|---|---|
| Ticket médio de projeto (últimos 12 meses) | [PREENCHER] | contratos | verba de Ads (07), valor de conversão offline |
| Projetos simultâneos que a operação aguenta | [PREENCHER] | você | meta de leads, limite de diagnósticos |
| Diagnósticos por semana sem prejudicar entregas | [PREENCHER] | você | agenda (01 §7) |
| Custo fixo mensal | [PREENCHER] | contabilidade | custo-hora (§3), meta de MRR (13) |
| Caixa disponível (meses de operação) | [PREENCHER] | financeiro | cenário de verba (07 §6) |
| Responsável pelo SLA de primeiro contato | [PREENCHER] | você | playbook 04 |
| Alíquota de impostos sobre faturamento | [PREENCHER] | contador | fórmula de preço (§3) |

Confirmado por escrito em: [PREENCHER data]. Revise na revisão trimestral (playbook [13](13-kpis-e-rituais.md)).

## 2. As ofertas: o que é público e o que é interno

| Etapa (BLUEPRINT §1.2) | Público no site | Interno (este playbook) |
|---|---|---|
| Diagnóstico | Gratuito, 45 min, devolutiva por escrito | roteiro e modelo (01) |
| Sprint de Descoberta | Paga, valor combinado antes; 4 entregáveis (§5.2) | escopo, duração, preço, condição de pagamento, exclusões |
| Desenvolvimento | Entregas a cada 2 semanas; prazo e preço fechados no plano da Descoberta | preço por escopo, marcos, garantia, exclusões |
| Sustentação e evolução | Contínua | planos, canais, tratamento de urgência, preço mensal |

**Squad Dedicado (B041, B291):** não faz parte do posicionamento nem do site (BLUEPRINT não o lista). Recomendação: tratar como **continuidade** para cliente que já passou pelo desenvolvimento, negociada caso a caso, nunca anunciada. Registre a decisão em [15-registro-de-decisoes.md](15-registro-de-decisoes.md). Para virar oferta pública, precisa de capacidade real, mudança no BLUEPRINT e copy novo.

**MVP (B111):** no site é um tipo de projeto (`/servicos/mvp`), com o mesmo método. Internamente você pode ter uma referência de prazo e de faixa, mas **o site não publica duração de MVP** (BLUEPRINT §12) até você confirmar e o BLUEPRINT mudar.

## 3. Custo-hora interno e piso de margem (B353)

Monte uma planilha com estas linhas. Revise a cada semestre (data da próxima revisão: [PREENCHER]).

```
A  Custo mensal total = salários + encargos + pró-labore + ferramentas + contador
                        + infraestrutura própria + outros fixos                     = [PREENCHER]
B  Horas úteis por pessoa no mês                                                    = [PREENCHER]
C  Pessoas que produzem                                                              = [PREENCHER]
D  Ociosidade real (pré-venda, gestão, férias, retrabalho) — 07 estima 25–35%       = [PREENCHER] %
E  Horas faturáveis no mês = B × C × (1 − D)
F  Custo-hora interno = A ÷ E
G  Margem bruta mínima por proposta                                                 = 40 %
   (padrão do 07-negocios e critério do B383, já preenchido; você pode subir;
    baixar só com motivo registrado em 15-registro-de-decisoes.md)
H  Impostos sobre o faturamento                                                      = [PREENCHER] %
```

**Preço mínimo de uma proposta de preço fechado:**

```
Preço mínimo = (horas estimadas × (1 + colchão de risco) × F) ÷ (1 − G − H)
```

- Proposta abaixo do preço mínimo só com aprovação do sócio e motivo registrado no CRM.
- O preço apresentado ao cliente é o **valor da entrega**, nunca horas × taxa (§4).
- Critério de aceite: cada oferta (Descoberta, desenvolvimento por tipo, sustentação) tem a conta feita na planilha com margem ≥ G.

## 4. Política comercial (B355)

Texto para adotar, assinar e compartilhar com quem vende:

1. **Preço fechado por escopo** é o modelo principal do desenvolvimento. Ele só existe depois da Sprint de Descoberta, ou de um escopo já documentado quando `confirmacoes.semDescoberta` estiver ligada.
2. **Recorrente** (mensal) para sustentação e evolução.
3. **Hora** só como exceção interna (pequena extensão para cliente atual, auditoria pontual). Nunca anunciada, nunca no site, nunca como linha "horas × taxa" em proposta.
4. **Toda proposta traz o que NÃO está incluído**, com o mesmo destaque do que está.
5. **Validade da proposta:** **15 dias** corridos a partir do envio (padrão do 07-negocios §7.6.2, já preenchido; você pode mudar). O follow-up de proposta encerra no D+14 citando essa data (04 §4); se mudar a validade, ajuste também o último toque do 04 §4.
6. **Reajuste anual** por índice em todo contrato recorrente: índice [PREENCHER].
7. **Mudança de escopo:** registrada por escrito, com impacto em prazo e preço, aprovada antes de entrar (cláusula no contrato; libera `confirmacoes.escopoMudanca`).

Conferência no site: o copy não oferece hora. `grep -ni "por hora\|preço-hora\|valor da hora" src/i18n/pt.json src/i18n/en.json src/i18n/es.json` só pode retornar a pergunta da régua de `/quanto-custa` ("O preço é fechado ou cobrado por hora?", chave `pricing.how_to_compare.questions.fixed_or_hourly`) e notas internas `_notes`; nunca uma oferta por hora (em en, procure também "per hour" e "hourly").

## 5. Colchão de risco, horas reais e teto da Descoberta (B357, B356, B383)

**Colchão de risco (B357):** toda estimativa de preço fechado leva [PREENCHER] % de colchão (07 sugere 20–30% até haver histórico). Ele entra na fórmula da §3, não aparece na proposta.

**Apontamento de horas:** cada projeto ativo registra horas orçadas e horas realizadas por marco (planilha ou ferramenta). Ao fechar o projeto, calcule `desvio = horas realizadas ÷ horas orçadas`. Na revisão trimestral, recalibre o colchão com a mediana dos desvios.

**Teto da Descoberta obrigatória (B356):** acima de [PREENCHER] (07 sugere um valor de referência; defina o seu), nenhum preço fechado de desenvolvimento sai sem Sprint de Descoberta.

**Pacotes abaixo do teto (B383) — conflito a decidir:** 07-negocios sugere pacotes fechados para escopos pequenos sem Descoberta. Isso só é coerente com o site se:
- você ligar `confirmacoes.semDescoberta`, **e só depois** que existirem as variantes de todas as chaves listadas em i18n `faq._notes.skip_discovery` (25 em 20/10/2026; a nota é a fonte da lista; pedido ao `shell` e ao redator). Ligar a flag hoje acrescenta o FAQ "Posso começar direto pelo desenvolvimento? Em alguns casos…" e as variantes do wizard, mas deixa no ar textos que se contradizem (conferido em `src/i18n/pt.json` em 20/10/2026): a Home diz "Quatro etapas, nesta ordem", `/sprint-de-descoberta` diz que "qualquer preço de desenvolvimento é chute" as 4 páginas de projeto dizem que o prazo "sai da Descoberta, junto com o preço" e que o preço "fecha na Sprint de Descoberta" (FAQ de preço), o fechamento de "o que pesa no preço" dessas páginas diz que a Descoberta "fecha prazo e preço antes do desenvolvimento", e a P5 do `/orcamento` (com as faixas ligadas) e os blocos de investimento dizem que o preço fechado "sai da Sprint de Descoberta". Antes de ligar em produção, confira com a camada fictícia (porta local, 00 Parte C) a conferência descrita no fim da própria nota: em `/`, `/como-trabalhamos`, `/sprint-de-descoberta`, `/quanto-custa`, `/servicos`, nas 4 páginas de projeto e no passo P5 do `/orcamento`, nos 3 idiomas, nenhuma dessas frases aparece mais;
- o pacote estiver dentro dos serviços confirmados (site e landing page estão **fora** da lista confirmada do BLUEPRINT §1.5);
- o pacote passar pela conta da §3 com margem ≥ G (40%, nunca abaixo).

Enquanto isso não for decidido (D03), não ofereça pacote. Registre a decisão em [15](15-registro-de-decisoes.md).

**Tabela de pacotes (só depois de D03 = sim).** Interna, nunca publicada; preço só pela conta da §3. De 3 a 5 linhas:

| Pacote | Serviço confirmado (BLUEPRINT §1.5) | Inclui | Não inclui | Premissas do cliente | Horas estimadas | Colchão | Prazo interno | Preço (fórmula da §3) | Margem (≥ G, nunca abaixo de 40%) | Aprovado em |
|---|---|---|---|---|---|---|---|---|---|---|
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] % | [PREENCHER] | [PREENCHER] | [PREENCHER] % | [PREENCHER] |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] % | [PREENCHER] | [PREENCHER] | [PREENCHER] % | [PREENCHER] |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] % | [PREENCHER] | [PREENCHER] | [PREENCHER] % | [PREENCHER] |

Pacote com margem calculada abaixo de 40% não entra na tabela. Exceção só com motivo e data em [15](15-registro-de-decisoes.md) (D03).

"Não inclui" tem o mesmo tamanho de "Inclui" (§4, item 4). O prazo interno não vai ao site (BLUEPRINT §12).

**Roteamento do lead abaixo do teto:** o pacote só é oferecido **depois do diagnóstico gratuito**, quando o escopo do lead cabe inteiro num pacote da tabela e o valor estimado fica abaixo do teto D04. Registre no CRM `proposta_oferta = pacote` (nome do pacote em `observacoes`, na linha do lead e na da aba `Propostas`, [05](05-crm-e-funil.md) §5); a recomendação de pacote sai do diagnóstico ([01](01-diagnostico-e-devolutiva.md) §5 e §6); a proposta segue o modelo da §8 sem a referência à Descoberta e é apresentada ao vivo (§9). Escopo que não cabe inteiro num pacote passa pela Descoberta.

**Teto D04 e as faixas da P5:** recomendação: alinhar o teto D04 ao limite superior da faixa `tier_1` em `dados/dono.json › qualificacao` (o corte de MQL é `tier_2`, decisão 7). Assim, `tier_1` é o público do pacote e `tier_2` em diante passa pela Descoberta. Enquanto D03 não for decidido, o lead `tier_1` recebe o mesmo caminho de todos: diagnóstico gratuito, devolutiva por escrito e, se fizer sentido, proposta da Descoberta, com a resposta franca do 04 §2 quando o investimento indicado não couber no que ele descreveu.

## 6. Condições de pagamento (B366)

| Oferta | Regra | Valor |
|---|---|---|
| Sprint de Descoberta | pagamento antes do início | [PREENCHER] (à vista ou parcelas) |
| Desenvolvimento | entrada antes do kickoff + parcelas por marco | [PREENCHER] (07 sugere 30% na assinatura, 40% no marco intermediário, 30% no go-live) |
| Sustentação | mensal | [PREENCHER] dia de vencimento, pagamento antecipado ou postecipado |

**Regra sem exceção:** o kickoff só é marcado depois da confirmação do recebimento da primeira parcela, com `primeira_parcela_em` e `kickoff_em` registrados no CRM (05 §5; a linha fica vermelha se o kickoff vier antes da parcela). Critério de aceite: 100% dos projetos iniciados no trimestre com `primeira_parcela_em` ≤ `kickoff_em`, conferido no ritual trimestral (13 §6). O checklist de kickoff está no playbook [16](16-processo-de-entrega.md) §1.

Quando o texto estiver aprovado e igual ao contrato, ele pode ir ao site em `confirmacoes.pagamento` (00 §B5).

## 7. Modelo de proposta da Sprint de Descoberta (B354)

Use o idioma do cliente. Mantenha os **4 entregáveis exatamente como o site** (BLUEPRINT §5.2); qualquer entregável a mais só depois de confirmado e escrito também no site.

```
PROPOSTA — SPRINT DE DESCOBERTA
{Empresa} · Pedido {protocolo} · {data} · Válida até {data + validade (§4, item 5)}

1. Contexto
{2 a 4 linhas: o problema, nas palavras da devolutiva. O cliente precisa se reconhecer.}

2. Objetivo da Sprint de Descoberta
Transformar {o problema} em um plano com escopo priorizado, prazo e preço fechados
para o desenvolvimento, antes de construir.

3. O que você recebe
- Entendimento do problema: {o que será mapeado neste caso}
- Escopo priorizado: o que entra primeiro e o que pode esperar
- Protótipo: para ver e validar antes de construir ({o que será prototipado})
- Plano com prazo e preço fechados para o desenvolvimento

4. O que NÃO está incluído
- Código de produção, implantação ou integração real
- Design final de todas as telas
- {outras exclusões que você decidir}
- Garantia de que o desenvolvimento caberá em um orçamento definido antes da Descoberta

5. Como acontece
Formato: [PREENCHER]   Participantes: [PREENCHER]   Ritmo: [PREENCHER]   Duração: [PREENCHER]
{Mesmo texto de dados/dono.json › descoberta quando ele estiver preenchido.}
O que a gente precisa de você: {acesso às pessoas, exemplos, sistemas}

6. Investimento
Valor: [PREENCHER]   Condição: [PREENCHER]
{Só se confirmacoes.descobertaAbatida (integral): "Se você seguir para o desenvolvimento
 com a Lemamon, o valor pago pela Sprint de Descoberta é descontado do preço do desenvolvimento."}
{Só se confirmacoes.planoDoCliente: "Tudo o que a Descoberta entrega fica com você."}

7. Depois da Descoberta
Com o plano em mãos, você decide se segue para o desenvolvimento, com entregas a cada 2 semanas.

8. Aceite
Nome, cargo, empresa, data.
```

**"4. O que NÃO está incluído" parte de `dados/dono.json › descoberta.naoInclui`** (00 §B8): os itens publicados no site entram na proposta, na mesma redação, e as exclusões específicas do caso vêm depois deles. Se uma exclusão nova valer para toda proposta, acrescente-a também ao `naoInclui` (até 5 itens), para site e proposta não se contradizerem. Enquanto o `naoInclui` estiver vazio, use os itens do modelo acima e preencha o campo antes de publicar prazo ou faixa da Descoberta (00 §B7 e §B8).

**Página de apoio:** envie https://lemamon.dev/sprint-de-descoberta junto. Ela foi feita para o comprador justificar o gasto ao sócio.

## 8. Modelo de proposta de desenvolvimento (com sustentação pré-precificada, B109)

```
PROPOSTA — DESENVOLVIMENTO
{Empresa} · Referência: plano da Sprint de Descoberta de {data} · Válida até {data + validade (§4, item 5)}

1. O que vamos construir
{Resumo do escopo priorizado. O detalhamento item a item vai no anexo de escopo (§10).}

2. O que NÃO está incluído
{Mesmo tamanho da seção 1. Ex.: funcionalidade fora da lista, migração de dados não prevista,
 integração sem documentação, conteúdo e textos, custos de infraestrutura e licenças de terceiros,
 tráfego pago. Ajuste ao caso.}

3. Como acompanhamos
Entregas a cada 2 semanas: software funcionando, que você usa e comenta.
Marcos e datas: {marco 1 — data} · {marco 2 — data} · {go-live — data}

4. Prazo e preço
Prazo: [PREENCHER]   Preço fechado: [PREENCHER]
Pagamento: [PREENCHER] (§6)
Garantia de correção depois do go-live: [PREENCHER] dias (só se você oferece)

5. Mudanças de escopo
Toda mudança é registrada por escrito, com impacto em prazo e preço, e aprovada antes de entrar.

6. Depois do go-live: sustentação e evolução (opcional, já precificada)
O que inclui: [PREENCHER]   Como é contratada: [PREENCHER]   Valor mensal: [PREENCHER]
{A sustentação vai nesta proposta, não depois do projeto.}

7. Aceite
```

**Sustentação, definição interna (B109):** antes da primeira proposta, defina e escreva:

| Item | Definição |
|---|---|
| O que inclui (correções, atualizações, evolução) | [PREENCHER] |
| Planos (ex.: por bolsa de horas ou por escopo mensal) | [PREENCHER] |
| Como urgências são tratadas e em que horário | [PREENCHER] (só o que você cumpre) |
| Contrato mínimo, reajuste e aviso prévio | [PREENCHER] |
| Sistema de terceiros | só depois de avaliação paga ou do diagnóstico; regra: [PREENCHER] |
| Preço mensal por plano (conta da §3) | [PREENCHER] |

Quando estiver definido, a parte pública vai para `dados/dono.json › sustentacao` (00 §B8; nunca edite `src/config/sustentacao.ts`). SLA com número só entra no site se você cumpre.

## 8b. Modelo de proposta de sustentação e evolução (sistema já no ar)

Para o lead que chega com um sistema que já está no ar (P1 "Preciso de quem cuide de um sistema que já está no ar" ou "Quero evoluir um sistema ou produto que já está no ar") e não passa por desenvolvimento antes. A recomendação da devolutiva é avaliar o sistema atual antes da sustentação (01 §6).

```
PROPOSTA — SUSTENTAÇÃO E EVOLUÇÃO
{Empresa} · Pedido {protocolo} · {data} · Válida até {data + validade (§4, item 5)}

1. O que está no ar
Onde roda: {hospedagem, serviços}   Quem desenvolveu: {equipe interna, outra empresa, a Lemamon}
Acessos necessários: {código, servidores, contas de terceiros}

2. Avaliação inicial (quando o código é de terceiros)
Escopo da avaliação: {o que será lido e testado}   Prazo: [PREENCHER]   Valor: [PREENCHER]
A avaliação vem antes de qualquer compromisso de atendimento (regra "Sistema de terceiros", §8).
Ao final, você recebe o que foi encontrado e se a sustentação faz sentido.

3. O que inclui
{correções, atualizações de segurança e de dependências, evolução: o que a definição interna do §8 prevê}

4. O que NÃO inclui
{Mesmo tamanho da seção 3. Ex.: funcionalidade nova fora do plano, migração de infraestrutura,
 custos de hospedagem e licenças de terceiros, suporte a usuário final. Ajuste ao caso.}

5. Como acompanhamos
Canais: {e-mail, WhatsApp, quadro de tarefas}   Relatório: {o que e quando}

6. Urgências
{Só o que você cumpre de fato, sem número que não esteja confirmado no contrato (§8).}

7. Contrato
Contrato mínimo: [PREENCHER]   Aviso prévio: [PREENCHER]   Reajuste anual por índice: [PREENCHER] (§4, item 6)

8. Valor e condição
Valor mensal: [PREENCHER]   Condição: [PREENCHER] (§6)

9. Aceite
Nome, cargo, empresa, data.
```

O lead que recebeu esta proposta segue as mesmas regras de apresentação ao vivo (§9) e de follow-up (04 §4). No aceite, preencha `sustentacao_contrato_em` e `sustentacao_valor_mensal` na linha dele no CRM (05 §5): sem `go_live_em` (o sistema já estava no ar), ele entra no MRR, mas não na taxa de conversão em sustentação (13 §5).

## 9. Apresentação ao vivo (B363)

**Regra:** toda proposta, dos 3 modelos (Descoberta §7, desenvolvimento §8, sustentação e evolução §8b), é apresentada em uma conversa de até [PREENCHER] minutos, em até [PREENCHER] dias úteis depois do envio (07 sugere 5). Nunca "mandar e esperar".

Roteiro de 30 minutos:

| Tempo | O que fazer |
|---|---|
| 0–5 | Retomar o problema e o "deu certo" com as palavras do cliente |
| 5–15 | Ler junto: o que recebe, o que **não** está incluído, como acontece |
| 15–20 | Investimento e condição; pausa para perguntas |
| 20–27 | Objeções: ouvir, nomear, responder; o que não der para responder na hora vira pendência com data |
| 27–30 | Decisão ou próximo passo com data |

Registre no CRM, na aba `Propostas` ([05](05-crm-e-funil.md) §5, uma linha por proposta): `enviada_em` no dia do envio; depois `apresentada_em`, quem participou, a objeção nomeada e o resultado (ganho, perdido com motivo, adiado com data). A linha fica vermelha se passar do `prazo_apresentacao` (aba `Config`, o mesmo número de dias úteis desta regra) sem apresentação. Critério de aceite do B363: 100% das propostas do trimestre apresentadas ao vivo e com resultado registrado, medido pelos indicadores do 05 §8 e conferido no ritual trimestral ([13](13-kpis-e-rituais.md) §6). Follow-up depois da apresentação: playbook [04](04-sla-follow-up-e-nutricao.md) §4.

## 10. Escopo detalhado e contrato (B365)

**Regra:** escopo escrito e assinado antes de qualquer linha de código, sem exceção.

**Anexo de escopo:** lista item a item (o que o software faz, para quem, critério de aceite de cada item), a lista de exclusões, premissas (o que o cliente fornece e até quando), marcos e datas.

**Checklist de cláusulas para o advogado** (o texto é dele):

- [ ] Objeto e anexo de escopo
- [ ] Marcos, datas e critério de aceite de cada entrega
- [ ] Preço, parcelas e vencimentos (§6)
- [ ] Mudança de escopo: registro escrito, impacto em prazo e preço, aprovação antes
- [ ] Propriedade intelectual do código: **igual à variante que você escolher em `confirmacoes.codigoProprietario`** (transferência total ou atrelada aos pagamentos)
- [ ] Retenção de entrega (código, credenciais) até a quitação, se for a sua política
- [ ] Multa e juros por atraso; suspensão do trabalho após [PREENCHER] dias de atraso (07 sugere 10)
- [ ] Garantia de correção depois do go-live: prazo e o que cobre
- [ ] Confidencialidade (ou referência ao NDA)
- [ ] **Uso de nome e marca em portfólio**, com opção de anonimização (B285; texto-base no playbook [09](09-prova-cases-depoimentos.md) §3)
- [ ] **Proteção de dados:** quando o sistema tratar dados pessoais dos clientes do cliente, a Lemamon age como operadora; o contrato precisa de cláusula de tratamento de dados (instruções, segurança, suboperadores, incidentes, devolução e exclusão ao final)
- [ ] Rescisão e o que acontece com o trabalho feito
- [ ] Reajuste anual (contratos recorrentes)

**Antes de contratos acima de [PREENCHER]:** consultar o CNPJ do cliente (situação cadastral e restrições) e anexar a consulta ao registro (B370; régua de cobrança no playbook 13).

## 11. NDA padrão e respostas de segurança (B384)

**NDA mútuo padrão** (revisado por advogado). Checklist do que ele precisa ter: definição de informação confidencial, exceções usuais, prazo de vigência, finalidade restrita à avaliação e execução do projeto, devolução ou destruição ao final, foro. Guarde a versão aprovada em [PREENCHER local].

**Documento de respostas de segurança (1–2 páginas)**, usando os mesmos fatos de `engenharia.ts`:

| Pergunta comum | Resposta da Lemamon |
|---|---|
| Onde fica o código e quem tem acesso | [PREENCHER] |
| Como credenciais e segredos são guardados | [PREENCHER] |
| Autenticação em dois fatores nas contas de trabalho | [PREENCHER] |
| Backups e recuperação | [PREENCHER] |
| Ambientes separados (desenvolvimento, homologação, produção) | [PREENCHER] |
| Tratamento de dados pessoais (LGPD) e incidentes | [PREENCHER] (ver playbook 10) |
| Saída de pessoas (revogação de acessos) | [PREENCHER] |
| Subcontratação | [PREENCHER] |

**Prazo interno para enviar NDA ou respostas:** [PREENCHER] (B384 pede até 1 dia útil). **Só ligue `confirmacoes.nda` quando os dois documentos existirem** e puderem sair nesse prazo: com a flag ligada, o FAQ "Vocês assinam NDA?" e o card de e-mail do `/contato` passam a dizer que a Lemamon assina o acordo **e responde ao questionário de segurança** da empresa do cliente, e explicam como pedir (i18n `contact._notes.nda` e `faq.conditional.nda`). Registre a confirmação em [15](15-registro-de-decisoes.md) §3.

## 12. Material para o comprador repassar (B114, parcial)

O comprador precisa justificar a contratação ao sócio. Hoje ele já tem: a devolutiva por escrito (01 §6), o "Copiar resumo" do pós-envio e as páginas `/como-trabalhamos` e `/sprint-de-descoberta`.

**One-pager institucional** (PDF interno, enviado junto com a proposta), só com fatos confirmados:

```
Lemamon — software sob medida · São Paulo, SP
O que a gente faz: sistemas web, aplicativos, integrações e automação, MVPs, sustentação e evolução.
Como trabalha: 1) Diagnóstico gratuito de 45 minutos, com devolutiva por escrito.
               2) Sprint de Descoberta, paga: escopo priorizado, protótipo e plano com prazo e preço fechados.
               3) Desenvolvimento com entregas a cada 2 semanas: software funcionando, não apresentação de slide.
               4) Sustentação e evolução contínua.
Onde você decide: depois da devolutiva e depois do plano.
{Dados da empresa, só com dados/dono.json › empresa preenchido: razão social e CNPJ.}
{Cases e depoimentos, só os publicados e autorizados.}
Contato: {e-mail} · WhatsApp · lemamon.dev
```

A versão para impressão dos cases (parte de código do B114) fica fora deste playbook.
