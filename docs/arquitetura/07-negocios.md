# 7. Modelo de Negócio, Oferta e Comercial

> Documento de arquitetura de melhoria do site — lemamon.dev
> Escopo desta seção: o que a Lemamon vende, como cobra, como qualifica e como fecha.
> Tudo que não está no repositório está marcado como `[PREENCHER]`. Toda faixa de preço está marcada como `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`.

---

## 7.1. Leitura da oferta atual — o que o site realmente diz que a Lemamon vende

### 7.1.1. As evidências no código

O wizard vive em `/projects` e é montado a partir de três arquivos:

- `src/pages/Projects/data.json` — a estrutura (ids + ícones), consumida em `src/pages/Projects/index.tsx` e passada para `src/components/ProjectBuilder/index.tsx`
- `src/locales/pt-BR/translation.json` (bloco `projectsContent.questions`) — o texto real que o visitante lê
- `src/pages/Projects/project-questions.json` — um arquivo **não versionado** (aparece como `??` no git status) que descreve o mesmo wizard em português, mas **desatualizado**: ele lista apenas 3 tipos de projeto na pergunta 2, enquanto `data.json` + `translation.json` já entregam 7 (Aplicativo, Website, Dashboard, Chatbot Inteligente, Plataforma com AI, Sistema de Gestão ERP/CRM, E-learning). Já existe divergência entre "o que a gente acha que vende" e "o que o site vende".

O fluxo tem 4 perguntas:

| # | Pergunta | O que revela |
|---|---|---|
| 1 | "Qual serviço você ou sua empresa precisam agora?" → **Solução Completa / UX/UI / Front-end / Back-end** | como a empresa se posiciona |
| 2 | "Que tipo de projeto você deseja criar?" → 7 tipos | vertical/tipo de produto |
| 3 | "Escolha o segmento do seu projeto" → subtipos por vertical | nicho |
| 4 | "Escolha as opções adicionais" → 8 checkboxes (Painel Admin, Pesquisa de UX, Identidade Visual, Publicação nas lojas, Integração com API, Push, Integração com serviços externos, Infraestrutura) | catálogo de extras |

Depois disso, `ContactForm` coleta **Nome, Email, Telefone e "Descreva sua ideia"** — e só.

### 7.1.2. O problema central: a pergunta 1 vende mão de obra, não resultado

A pergunta 1 coloca no mesmo menu quatro coisas de naturezas diferentes:

- **Solução Completa** — um resultado ("Criamos o design, desenvolvemos e lançamos seu produto")
- **UX/UI**, **Front-end**, **Back-end** — três *cargos internos de uma equipe de software*

Isso é um erro de posicionamento, e ele é estrutural, não cosmético:

1. **Convida o cliente a comprar cargo, e cargo tem preço de hora.** No momento em que o visitante clica em "Front-end", a conversa que vem depois é inevitavelmente "quantas horas?" e "quanto a hora?". Quem escolhe "Front-end" já decidiu a arquitetura, já decidiu que tem um back-end, e está procurando quem execute — ou seja, está comprando **capacidade**, e capacidade é comprada por preço. A Lemamon entra numa disputa de tabela horária contra freelancer de marketplace e contra fábrica de software com escala de custo maior que a dela.
2. **Transfere o risco do projeto para a Lemamon sem transferir o controle.** Se o cliente define o escopo por disciplina, ele mantém as decisões de produto e a Lemamon fica responsável só pela entrega. Quando o produto não performa, a culpa técnica sobra para o fornecedor, mas o mérito do resultado nunca aparece no case.
3. **É incoerente com o próprio copy institucional.** O `translation.json` diz, em `aboutContent`, "ajudamos empresas a crescer por meio de soluções tecnológicas"; em `missionContent`, "impulsionar a transformação digital de empresas"; em `middleBlockContent`, "soluções personalizadas, adaptadas às necessidades específicas de cada cliente". O site inteiro promete parceria de resultado — e o único ponto onde o visitante toma uma decisão real (o wizard) oferece um cardápio de mão de obra. O visitante acredita no que ele *clica*, não no que ele *lê*.
4. **A pergunta 4 piora o efeito.** Oito checkboxes de "opções adicionais" — sem esforço, sem prazo, sem preço, sem dependências — treinam o cliente a pensar no projeto como **soma de itens de um cardápio**. Ele marca oito, e o primeiro contato comercial já começa com uma expectativa inflada que ninguém precificou. É o desenho perfeito para escopo aberto e para a conversa "mas eu marquei isso no site".
5. **A pergunta 1 não altera nada do fluxo seguinte.** Ler `ProjectBuilder/index.tsx`: a resposta 1 só é concatenada no texto do e-mail (`optionsSummaryText`). Escolher "Back-end" leva às mesmas perguntas 2, 3 e 4 que "Solução Completa". Ou seja, a pergunta que mais compromete o posicionamento **não tem nenhuma função operacional** — é puro custo estratégico sem benefício.

### 7.1.3. O que mais está faltando na leitura comercial

- **Nenhuma pergunta sobre dinheiro, prazo ou decisão.** O wizard sabe se o cliente quer push notification, mas não sabe se ele tem R$ 5 mil ou R$ 500 mil, se precisa em 30 dias ou em 12 meses, nem se quem preencheu pode assinar contrato.
- **Nenhuma prova.** Não há cases, portfólio, depoimentos ou logos em lugar nenhum do site. O `src/data/posts.ts` contém posts genéricos de tutorial ("Introdução ao JavaScript Moderno", autor "João Silva") — conteúdo que não sustenta autoridade comercial nem gera lead qualificado.
- **Nenhum preço, nenhuma faixa, nenhuma âncora.** Zero ocorrências de valor no repositório. Quem não sabe se cabe no bolso não preenche formulário — ou preenche e desperdiça a reunião.
- **Contato por Gmail.** `Footer/index.tsx` expõe `mailto:lemamon.dev@gmail.com`. Para um comprador B2B de médio porte, e-mail de Gmail é um sinal de risco de fornecedor.
- **Links institucionais mortos.** "Press" e "Careers & Culture" no rodapé apontam para `/`. Detalhe pequeno, sinal ruim para quem está avaliando um fornecedor.

### 7.1.4. Diagnóstico em uma frase

> O site atual capta **pedidos de execução**, não **problemas de negócio** — e por isso entrega leads que só podem ser respondidos com uma tabela de preço por hora.

---

## 7.2. Arquitetura de oferta proposta

Quatro ofertas nomeadas, com fronteira clara, que substituem o cardápio de disciplinas. As três primeiras formam uma escada: cada uma vende naturalmente a seguinte.

> **Nota sobre preços:** todas as faixas abaixo são `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`.
> A validação obrigatória antes de publicar qualquer número: calcular o **custo-hora interno real** (salários + encargos + pró-labore + ferramentas + contador + impostos + ociosidade real de 25–35%) e conferir se cada oferta fecha com margem bruta ≥ 40%. Sem essa conta, nenhum número vai para o site.
> Custo-hora interno de referência no mercado brasileiro para agência pequena: R$ 90 – R$ 180/h `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`. Preço de venda por hora praticado: R$ 150 – R$ 320/h `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`.

---

### Oferta 1 — **Sprint de Descoberta**

**Para quem:** empresa que sabe qual problema tem, mas não sabe o que construir, quanto custa nem em que ordem. Fundador, head de operações ou dono de negócio tradicional que está prestes a "pedir orçamento de um app".

**O que entrega (artefatos, não opinião):**
- Mapa do problema e do processo atual (quem faz o quê hoje, onde dói, quanto custa a dor)
- Definição do escopo mínimo viável: lista priorizada de funcionalidades com corte explícito do que fica fora
- Protótipo navegável das 3–5 telas principais
- Arquitetura técnica de alto nível e decisões de stack/integrações
- **Plano de execução com prazo e preço fechado** para a fase seguinte (a proposta do MVP nasce aqui, já validada)
- Riscos mapeados e o que pode derrubar o projeto

**Prazo:** 1 a 3 semanas, com data de entrega no contrato.

**Faixa de preço:** R$ 6.000 – R$ 18.000 `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`

**O que NÃO inclui:** nenhuma linha de código de produção, nenhuma implantação, nenhuma integração real, nenhum design final de todas as telas, nenhuma garantia de que o MVP subsequente caberá no orçamento imaginado pelo cliente.

**Critério de qualificação:** aceitar qualquer empresa com problema real e capacidade de pagar a descoberta. É a oferta de entrada — não deve ser filtrada com rigor. Recusar apenas: cliente que quer a descoberta de graça, cliente que já tem escopo pronto e só quer preço (esse vai direto para a Oferta 2 ou é descartado), e projeto de terceiro sem acesso ao decisor.

**Por que existe:** transforma visitante frio em cliente pagante em semanas, financia o pré-venda que hoje é feito de graça, e é a única forma honesta de dar preço fechado no MVP sem chutar.

---

### Oferta 2 — **MVP em 8 a 12 semanas**

**Para quem:** empresa com escopo definido (idealmente saído da Oferta 1) que precisa colocar um produto funcional na mão de usuários reais dentro de um trimestre.

**O que entrega:**
- Produto funcionando em produção, com usuários reais usando
- Design de interface das telas do escopo acordado
- Front-end + back-end + banco + infraestrutura + deploy
- Painel administrativo básico, quando o escopo pedir
- Publicação nas lojas Apple/Google, quando for app
- Handover: repositório, credenciais, documentação de operação
- 30 dias de garantia de correção de defeitos após o go-live

**Prazo:** 8 a 12 semanas, com data de go-live contratada e marcos quinzenais de demonstração.

**Faixa de preço:** R$ 60.000 – R$ 180.000 `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`
Condição de pagamento sugerida: 30% na assinatura, 40% no marco intermediário, 30% no go-live.

**O que NÃO inclui:** funcionalidade fora da lista assinada (vai para o backlog e vira nova proposta ou entra na Oferta 4), migração de dados de sistema legado, integração com sistema de terceiro sem documentação, conteúdo/textos/fotos, custos de infraestrutura e licenças de terceiros (pagos direto pelo cliente, no cartão dele), tráfego pago, suporte após os 30 dias de garantia.

**Critério de qualificação:**
- Orçamento disponível ≥ piso da faixa, confirmado antes da proposta
- Um decisor único acessível e disponível para ritual quinzenal
- Escopo escrito e assinado antes do início (sem exceção)
- Não aceitar: escopo verbal, "vamos definindo no caminho", pagamento 100% na entrega, ou cliente que quer o MVP mas não aceita cortar nada.

---

### Oferta 3 — **Squad Dedicado**

**Para quem:** empresa que já tem produto no ar e roadmap contínuo, e precisa de time de produto sem montar time interno. Cliente que compra **velocidade recorrente**, não entrega pontual.

**O que entrega:**
- Time alocado por ciclo mensal (ex.: 1 tech lead + 1–2 devs + design compartilhado)
- Ciclos quinzenais com planejamento, entrega e demonstração
- Backlog priorizado junto com o cliente, com o cliente decidindo prioridade e a Lemamon decidindo o como
- Relatório mensal do que entrou, do que saiu e do que foi entregue

**Prazo:** contrato mínimo de 3 meses, renovação automática, aviso prévio de 30 dias para encerrar.

**Faixa de preço:** R$ 30.000 – R$ 90.000/mês, conforme composição do time `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`

**O que NÃO inclui:** compromisso com escopo fixo ou data fixa de funcionalidade (o cliente compra capacidade, não promessa de entrega); plantão fora do horário comercial (isso é a Oferta 4); alocação de pessoa específica nomeada; realocação instantânea de perfil.

**Critério de qualificação:**
- Já existe produto em produção **ou** o MVP foi entregue pela própria Lemamon
- Existe alguém do lado do cliente capaz de priorizar backlog toda semana
- Cliente entende e aceita que compra capacidade e não entregável fechado
- Empresa com histórico de pagamento limpo — este é o contrato mais exposto a inadimplência, porque o custo é fixo e mensal.

---

### Oferta 4 — **Sustentação e Evolução**

**Para quem:** todo cliente que já teve algo entregue pela Lemamon e cujo sistema está no ar gerando receita ou operação. Deve ser oferecida **por padrão**, na proposta do MVP, e não como assunto separado depois.

**O que entrega:**
- Monitoramento e disponibilidade do que está em produção
- Correção de defeitos com SLA de resposta e de solução por severidade
- Atualizações de segurança e de dependências
- Bolsa mensal de horas para pequenas evoluções (ex.: 10, 20 ou 40 h/mês)
- Relatório mensal de incidentes, uso e recomendações

**Prazo:** contrato de 12 meses, reajuste anual por índice, renovação automática.

**Faixa de preço:** R$ 3.500 – R$ 18.000/mês, conforme SLA e bolsa de horas `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`

**O que NÃO inclui:** novas funcionalidades grandes (viram proposta separada ou consomem várias bolsas); horas não usadas não acumulam além de 1 mês; suporte a código de terceiros que a Lemamon não escreveu e não auditou (auditoria é orçada à parte); atendimento 24×7 no plano básico.

**Critério de qualificação:** sistema no ar; código sob controle da Lemamon ou auditado por ela; cliente adimplente. Para código de terceiros, exigir **auditoria paga** antes de assumir qualquer SLA — assumir sustentação de código desconhecido com SLA é a forma mais rápida de destruir margem.

---

### Como o wizard passa a apresentar isso

A pergunta 1 deixa de ser "UX/UI, Front-end, Back-end" e passa a ser **em que estágio o cliente está**:

1. "Tenho um problema, ainda não sei o que construir" → Sprint de Descoberta
2. "Sei o que quero, preciso colocar no ar" → MVP
3. "Já tenho produto no ar e preciso evoluir com constância" → Squad Dedicado
4. "Já tenho sistema no ar e preciso de quem cuide dele" → Sustentação

Mesma quantidade de cliques, posicionamento invertido: o cliente escolhe o **momento dele**, não o **cargo que quer contratar**.

---

## 7.3. Modelo de precificação

### 7.3.1. Os três modelos, sem romantismo

| Modelo | Margem | Risco | Previsibilidade de caixa | Efeito no posicionamento |
|---|---|---|---|---|
| **Hora (time & materials)** | Baixa e travada. A margem é a diferença entre custo-hora e preço-hora, e o cliente pode negociar exatamente esse número. Ganho de produtividade vira **menos** faturamento. | Baixo para a Lemamon, alto para o cliente — por isso ele resiste e exige teto | Ruim: faturamento oscila com alocação e com feriado | Fornecedor comparável por planilha |
| **Preço fechado por escopo** | Alta e destravada. Se a Lemamon entrega em 6 semanas o que orçou em 10, a margem é dela. Reuso de código e biblioteca própria vira lucro. | Alto — se o escopo estourar, o prejuízo é integral da Lemamon. Mitigado por: escopo escrito, descoberta paga antes e cláusula de mudança | Boa: marcos com datas conhecidas | Parceira de resultado |
| **Mensalidade recorrente** | Média, mas **estável e composta**. Cada contrato assinado eleva o piso do mês seguinte. | Médio: o custo é fixo, então cliente que cancela ou atrasa dói na hora | Excelente: é a única receita que existe antes de vender qualquer coisa | Parceira de longo prazo |

### 7.3.2. Recomendação

**Modelo principal: preço fechado por escopo, com descoberta paga obrigatória antes de todo preço fechado relevante.**
**Modelo secundário e alvo estratégico: mensalidade recorrente (Ofertas 3 e 4), com meta de cobrir o custo fixo da operação.**
**Hora: apenas como exceção controlada** — extensões pequenas para cliente existente, auditorias, consultoria pontual. Nunca como oferta principal e nunca publicada no site.

**Por que preço fechado como principal:**

- **Margem.** É o único modelo em que ficar melhor no ofício aumenta o lucro. Numa agência pequena, esse é o principal ativo composto: cada projeto entregue deixa componentes, decisões e templates que barateiam o próximo. Por hora, essa melhoria vira desconto involuntário para o cliente.
- **Risco.** O risco do preço fechado é real, mas é **gerenciável por processo** (descoberta paga, escopo assinado, cláusula de mudança, marcos). O risco do modelo por hora é **estrutural e não gerenciável**: é a commoditização. Você negocia sua tabela para baixo todo ano até não ter mais negócio.
- **Caixa.** 30/40/30 com marcos contratados dá previsibilidade suficiente e coloca 30% na conta antes de a primeira linha de código existir.
- **Posicionamento.** Preço fechado obriga a Lemamon a se responsabilizar pelo resultado. É a diferença entre "cobramos R$ 200/h" e "entregamos seu produto no ar em 10 semanas por R$ 90 mil". A segunda frase não tem concorrente de marketplace.

**Regras inegociáveis do preço fechado:**

1. **Nunca dar preço fechado sem descoberta paga** para projeto acima de `[PREENCHER — definir limite, sugestão: R$ 40 mil]`. Abaixo disso, usar tabela de pacotes pré-definidos.
2. **Colchão de risco de 20–30%** embutido em toda estimativa (não é gordura, é o desvio-padrão real do trabalho de software) `[ESTIMATIVA DE MERCADO — validar com o histórico real de estouro de prazo da Lemamon]`.
3. **Cláusula de mudança de escopo** no contrato: toda alteração vira registro escrito com impacto em prazo e preço, aprovado antes de entrar. Sem isso, preço fechado vira prejuízo fechado.
4. **Preço nunca é derivado de horas na frente do cliente.** Horas servem para calcular custo internamente; o cliente vê valor e entrega.
5. **Reajuste anual** em todo contrato recorrente, por índice, escrito.

---

## 7.4. Isca de entrada — como virar visitante frio em conversa paga

O site hoje tem uma única porta: preencher o wizard e esperar. Não há nada entre "não conheço a Lemamon" e "quero um projeto".

### Opções avaliadas

| Isca | Prós | Contras |
|---|---|---|
| **Diagnóstico 100% gratuito, sem limite** | Volume alto de leads | Atrai curioso, consome as horas mais caras da empresa (as do dono), desvaloriza a expertise e não filtra nada. É exatamente o pré-venda gratuito que a Lemamon já faz hoje sem perceber |
| **Sprint de Descoberta paga como primeira oferta** | Filtra bem, margem boa | Barreira alta demais para quem nunca ouviu falar da empresa. Poucos compram R$ 10 mil de um site sem prova social |
| **Diagnóstico gratuito curto e estruturado, com entregável, seguido de proposta de Descoberta paga** | Baixa fricção na entrada, filtra por agenda e por resposta às perguntas de qualificação, gera entregável que já demonstra competência | Exige disciplina de tempo para não virar consultoria de graça |

### Recomendação

**Isca: "Diagnóstico de Produto — 45 minutos, gratuito, com devolutiva escrita."**

Como funciona:

1. O visitante completa o wizard (que agora qualifica — ver 7.5) e agenda a conversa **direto na agenda**, sem ida e volta de e-mail.
2. A conversa é de **45 minutos, com hora de fim respeitada**, roteirizada: problema, o que já tentaram, quem usa, o que precisa acontecer, restrição de prazo e orçamento.
3. Em até 2 dias úteis, o lead recebe uma **devolutiva escrita de 1 página**: entendimento do problema, os 3 principais riscos que a Lemamon enxerga, o caminho recomendado, e a faixa de investimento provável.
4. A devolutiva termina com a proposta de **Sprint de Descoberta paga**, ou com a proposta direta do MVP quando o escopo já estiver claro.

**Por que essa e não outra:**
- É gratuito o suficiente para ter volume, e escasso o suficiente (45 min, agenda limitada) para não virar balcão.
- A devolutiva escrita é a **melhor peça de venda que existe** — o lead vê a qualidade do raciocínio antes de assinar. E o custo marginal dela é baixo com um bom template.
- Cria degrau natural: gratuito (45 min) → pago barato (Descoberta) → pago grande (MVP) → recorrente (Squad/Sustentação). Ninguém precisa dar um salto de confiança grande demais.
- Limite operacional: `[PREENCHER — nº de diagnósticos por semana que a Lemamon consegue absorver sem prejudicar entrega]`. Quando estourar o limite, o diagnóstico passa a ser pago simbolicamente e abatido na Descoberta.

---

## 7.5. Qualificação de lead

### 7.5.1. Critério: BANT adaptado para agência pequena

| Letra | O que importa aqui | Nota de corte |
|---|---|---|
| **B — Budget** | Faixa de investimento que o cliente já tem aprovada ou consegue aprovar | Abaixo do piso da oferta correspondente = não avançar para proposta |
| **A — Authority** | Quem assina. Em PME brasileira normalmente é sócio/dono; em empresa média é diretor com alçada | Sem acesso ao decisor até a segunda conversa = risco alto |
| **N — Need** | Existe dor operacional/financeira mensurável, ou é vontade de "ter um app"? | Sem dor mensurável = lead de baixa prioridade |
| **T — Timing** | Quando precisa estar no ar e por quê (evento, safra, contrato, concorrente) | Sem data = projeto que não começa |

Acrescentar duas letras que importam mais que o BANT para agência pequena:

- **F — Fit técnico:** a Lemamon sabe entregar isso bem? Projeto fora de competência com prazo apertado é prejuízo garantido.
- **P — Pagamento:** empresa formalizada, capaz de pagar 30% antecipado. Cliente que resiste ao pagamento inicial é o mesmo que vai atrasar o resto.

### 7.5.2. Como o wizard deve qualificar sem afugentar

Regras de desenho:

1. **Qualificar só depois de o visitante ter investido cliques.** As perguntas de dinheiro entram **no fim**, nunca no começo. Quem já respondeu 3 telas não abandona por causa da quarta.
2. **Faixas, nunca campo aberto de valor.** Ninguém digita orçamento em caixa de texto; quase todo mundo clica numa faixa.
3. **Sempre com uma saída digna.** Toda pergunta sensível tem a opção "ainda não sei" / "prefiro conversar antes" — que **não descarta** o lead, apenas o classifica.
4. **Explicar por que se pergunta.** Uma linha de contexto reduz a rejeição drasticamente.
5. **Nunca mais que 3 perguntas de qualificação.**

### 7.5.3. As perguntas exatas (prontas para entrar no wizard)

Inseridas como novas etapas, após a atual pergunta de "opções adicionais" e antes do formulário de contato.

---

**Nova Pergunta 1 — substitui a atual "Qual serviço você precisa agora?"**

> **Em que ponto você está hoje?**
> Isso define como a gente conduz a conversa — não existe resposta errada.
>
> - ☐ **Tenho um problema, mas ainda não sei o que construir** — precisa de clareza antes de código
> - ☐ **Sei o que quero e preciso colocar no ar** — escopo mais ou menos definido
> - ☐ **Já tenho produto no ar e preciso evoluir com constância** — roadmap contínuo
> - ☐ **Já tenho sistema no ar e preciso de quem cuide dele** — estabilidade e suporte

---

**Nova Pergunta 5 — Prazo**

> **Quando isso precisa estar funcionando?**
> A gente só assume prazo que consegue cumprir — por isso pergunta antes.
>
> - ☐ Era para ontem (até 1 mês)
> - ☐ Nos próximos 3 meses
> - ☐ Entre 3 e 6 meses
> - ☐ Mais de 6 meses / ainda estou planejando
>
> *(campo opcional)* **Existe alguma data específica travando isso?** Ex.: evento, contrato, temporada.

---

**Nova Pergunta 6 — Orçamento**

> **Qual faixa de investimento faz sentido para este projeto?**
> Perguntamos para não te propor algo fora da sua realidade — e para não te fazer perder tempo com uma reunião que não levaria a nada. A faixa não é compromisso.
>
> - ☐ Até R$ 15 mil `[ESTIMATIVA DE MERCADO — validar com o custo real da Lemamon]`
> - ☐ R$ 15 mil a R$ 50 mil `[ESTIMATIVA DE MERCADO — validar]`
> - ☐ R$ 50 mil a R$ 150 mil `[ESTIMATIVA DE MERCADO — validar]`
> - ☐ Acima de R$ 150 mil `[ESTIMATIVA DE MERCADO — validar]`
> - ☐ Ainda não tenho ideia — quero entender o que é razoável

> A última opção é essencial: ela **não descarta ninguém** e ainda é uma informação útil (indica lead de estágio inicial, candidato natural à Sprint de Descoberta).

---

**Nova Pergunta 7 — Decisão (embutida no formulário final, sem parecer interrogatório)**

No formulário atual (`ContactForm/index.tsx`, campos Nome / Email / Telefone / Descreva sua ideia), acrescentar:

> **Empresa** _(campo de texto — hoje inexistente, e é a informação de qualificação mais barata que existe)_
>
> **Seu papel nessa decisão**
> - ☐ Sou eu quem decide
> - ☐ Decido junto com sócio(s) ou diretoria
> - ☐ Estou levantando informação para quem decide

E trocar o rótulo genérico "Descreva sua ideia" por uma pergunta que puxa dor em vez de solução:

> **Qual problema você quer resolver?**
> Placeholder: *"Ex.: hoje meus pedidos entram por WhatsApp e a gente perde venda quando o time não dá conta."*

---

### 7.5.4. Classificação automática do lead

Com essas respostas dá para classificar sem intervenção humana:

| Faixa | Regra | Ação |
|---|---|---|
| **A — Quente** | Orçamento ≥ R$ 50 mil **e** prazo ≤ 3 meses **e** "sou eu quem decide" | Contato em até 2 h úteis, pelo telefone. Diagnóstico agendado no mesmo dia |
| **B — Morno** | Orçamento definido **ou** prazo definido, decisor acessível | Contato em até 24 h úteis, oferta de diagnóstico |
| **C — Frio / inicial** | "Ainda não tenho ideia" **ou** prazo > 6 meses **ou** só levantando informação | Resposta automática com material útil + convite para diagnóstico. Entra em nutrição |
| **D — Fora de perfil** | Orçamento até R$ 15 mil em projeto que exige MVP completo, ou fora de competência técnica | Resposta honesta e rápida, com indicação de alternativa quando existir. **Nunca deixar sem resposta** — cliente descartado hoje indica cliente bom amanhã |

---

## 7.6. Processo comercial — do lead ao contrato assinado

### 7.6.1. O que acontece hoje (e por que isso mata negócio)

Lendo `ProjectBuilder/index.tsx` → `handleSubmit` → `src/service/index.ts` → `sendEmail`:

1. As respostas viram um array de strings (`optionsSummaryText`) e são enviadas via `POST` para `https://lemamon-email-service-eac435b5f8e8.herokuapp.com/send-email`.
2. Se der certo, dispara `gtag_report_conversion()` em produção e o visitante vê a tela de sucesso.
3. **Fim.**

Consequências concretas:

- **O lead não é persistido em lugar nenhum.** Não há CRM, não há banco, não há planilha. A única cópia do lead é um e-mail numa caixa de entrada. Se o e-mail cair em spam, for arquivado por engano, ou o serviço da Heroku falhar num momento em que ninguém está olhando, **o lead deixa de existir e ninguém fica sabendo**.
- **O lead não recebe nada.** Nenhum e-mail de confirmação, nenhum resumo do que ele escolheu, nenhum próximo passo, nenhum nome de pessoa. Ele fecha a aba e a Lemamon perde o único momento em que a atenção dele estava no auge.
- **A promessa é vaga.** A tela de sucesso diz "Em breve nossa equipe entrará em contato" (`contactForm.successSubTitle`). "Em breve" é o compromisso mais fácil de quebrar que existe.
- **Os botões da tela de sucesso não fazem nada.** Em `ContactForm/index.tsx`, os botões "Criar outro projeto" e "Voltar ao início" do bloco de sucesso não têm `onClick` — o lead que quer continuar navegando fica preso numa tela morta. (No bloco de erro, os handlers existem; no de sucesso, não.)
- **Não há dono, não há prazo, não há fila.** Não existe SLA, não existe follow-up, não existe registro de "esse lead foi respondido?".

> Em resumo: **hoje o lead vira um e-mail e morre num inbox.** Todo o investimento em SEO, Google Ads e conversão do wizard termina numa caixa de entrada pessoal, sem rastreabilidade.

### 7.6.2. O processo proposto

| # | Etapa | Quando | Quem | O que acontece | Entregável |
|---|---|---|---|---|---|
| 0 | **Captura** | Instantâneo | Sistema | Lead gravado em CRM **antes** do e-mail. Envio de e-mail é efeito colateral, nunca a fonte da verdade. Classificação A/B/C/D automática | Registro no CRM com todas as respostas do wizard |
| 1 | **Confirmação ao lead** | Instantâneo | Sistema | E-mail automático com: resumo do que ele escolheu, o nome de quem vai falar com ele, o prazo de resposta e o link direto para agendar o diagnóstico | E-mail de confirmação + link de agenda |
| 2 | **Primeiro contato humano** | Lead A: 2 h úteis · B: 24 h úteis · C/D: 48 h úteis | Responsável comercial `[PREENCHER — quem é]` | Telefone/WhatsApp para A e B; e-mail para C. Objetivo único: marcar o diagnóstico | Diagnóstico agendado |
| 3 | **Diagnóstico (45 min)** | Até 5 dias úteis do contato | Responsável técnico-comercial `[PREENCHER]` | Roteiro fixo: problema, tentativas anteriores, usuários, sucesso esperado, prazo, orçamento, decisão | Anotações no CRM |
| 4 | **Devolutiva escrita** | Até 2 dias úteis do diagnóstico | Mesmo responsável | 1 página: entendimento, 3 riscos, caminho recomendado, faixa de investimento | PDF de devolutiva |
| 5 | **Proposta** | Junto com a devolutiva ou até 3 dias depois | Mesmo responsável | Proposta de **uma** oferta nomeada (não um cardápio): o que entrega, o que **não** entrega, prazo, preço, condição de pagamento, validade de 15 dias | Proposta comercial |
| 6 | **Apresentação da proposta** | Até 5 dias úteis do envio | Mesmo responsável | **Nunca enviar proposta por e-mail e esperar.** Apresentar ao vivo, ler junto, tratar objeção na hora | Decisão ou objeção nomeada |
| 7 | **Follow-up** | D+3, D+7, D+14 após apresentação | Sistema lembra, humano executa | Três toques com conteúdo (não "passando para saber"). No D+14 sem resposta: e-mail de encerramento educado | Ganho, perdido ou adiado — nunca "sumido" |
| 8 | **Escopo detalhado** | Após o "sim" verbal | Responsável técnico | Documento de escopo item a item, com exclusões explícitas, assinado junto com o contrato | Anexo de escopo |
| 9 | **Contrato** | Até 3 dias úteis do "sim" | `[PREENCHER — quem redige/revisa]` | Contrato com: escopo anexo, marcos e datas, preço e parcelas, cláusula de mudança de escopo, propriedade intelectual, multa por atraso de pagamento, garantia de 30 dias, condição de rescisão | Contrato assinado |
| 10 | **Pagamento inicial + kickoff** | Sem exceção, nessa ordem | Responsável de entrega | **Projeto não começa antes do pagamento da primeira parcela.** Kickoff com apresentação do time, rituais e canal de comunicação | Recibo + ata de kickoff |
| 11 | **Oferta de Sustentação** | No go-live, não depois | Responsável comercial | A proposta de Sustentação já vai na proposta original do MVP, como opção pré-precificada | Contrato de Sustentação |

### 7.6.3. Mudanças técnicas que o processo exige

Em ordem de impacto por esforço:

1. **Persistir o lead antes de enviar e-mail** — hoje `sendEmail` em `src/service/index.ts` é o único caminho e não tem fallback. Se o `fetch` falha, o `catch` apenas loga no console e relança; o lead está perdido. Mínimo viável: gravar em CRM/planilha/banco e só então notificar.
2. **E-mail automático de confirmação para o lead**, com resumo e link de agendamento.
3. **Trocar "Em breve nossa equipe entrará em contato"** por um SLA concreto: "Você recebeu um e-mail com o resumo. Falamos com você em até 1 dia útil." E colocar o link de agenda direto na tela de sucesso.
4. **Corrigir os botões mortos da tela de sucesso** em `ContactForm/index.tsx`.
5. **Capturar origem do lead** (UTM, referrer, página de entrada) e gravar junto — sem isso não existe cálculo de CAC por canal.
6. **Campos novos no formulário**: empresa e papel na decisão.
7. **Substituir o e-mail Gmail do rodapé** por endereço no domínio próprio.

---

## 7.7. Receita recorrente — como sair do ciclo de projeto único

O modelo atual é 100% projeto pontual. Todo mês começa em zero, o comercial nunca descansa, e uma janela sem venda vira uma janela sem faturamento — mas nunca sem custo.

### Três frentes, em ordem de dificuldade

**1. Sustentação — a mais fácil, e a que está sendo deixada na mesa**

Todo cliente que teve algo entregue precisa que aquilo continue funcionando. Se a Lemamon não vende sustentação, ou o cliente contrata outro (e leva o relacionamento junto), ou o sistema apodrece (e vira case ruim).

Regras:
- Sustentação **entra por padrão** na proposta do MVP, com preço já definido — não é conversa separada no fim do projeto, quando o cliente está com o caixa apertado.
- Contrato de 12 meses, reajuste anual, renovação automática.
- Meta: `[PREENCHER — % dos projetos entregues que devem converter em sustentação. Referência de mercado saudável: 60–70%]` `[ESTIMATIVA DE MERCADO]`

**2. Retainer / Squad — a de maior valor por cliente**

Cliente com produto vivo tem demanda contínua. O Squad Dedicado é a evolução natural do MVP bem entregue e o contrato com maior receita por cliente. Caminho: Descoberta → MVP → Sustentação → Squad. Cada degrau usa a confiança construída no anterior.

**3. Produto próprio — a de maior alavancagem e maior risco**

Serviço não escala: mais receita exige mais gente. Produto escala, mas exige investimento sem receita durante meses.

Caminho realista para agência pequena, **sem apostar a empresa**:
- Identificar um problema que aparece em **3 ou mais clientes diferentes** (exemplo plausível na base atual: o wizard já mostra recorrência de temas como "Guia & Reservas", "Transporte & Delivery" e "Sistema de Gestão").
- Extrair o núcleo comum como componente reutilizável — isso já aumenta a margem dos projetos fechados **imediatamente**, mesmo que nunca vire produto.
- Só depois de o componente se pagar em 3 projetos, avaliar empacotar como produto/SaaS de nicho.
- **Nunca financiar produto com o caixa operacional.** Produto se financia com margem excedente ou com um cliente-âncora que paga o desenvolvimento em troca de condição especial.

### Meta estrutural

> **A receita recorrente (Sustentação + Squad) deve cobrir 100% do custo fixo mensal da operação.**

Quando isso acontece, todo projeto fechado vira margem em vez de sobrevivência, o comercial pode recusar projeto ruim, e o preço para de ser feito com medo.

Custo fixo mensal atual: `[PREENCHER]`
Receita recorrente atual: `[PREENCHER]`
Cobertura atual: `[PREENCHER]`

---

## 7.8. Riscos do negócio e mitigação

### Risco 1 — Concentração de receita em poucos clientes

**Por que é o risco número um:** numa agência pequena, um cliente que representa 40% do faturamento não é cliente, é sócio sem contrato. Ele dita preço, prazo e prioridade — e a saída dele é um evento de sobrevivência.

**Sinal de alerta:** um cliente acima de 30% do faturamento do trimestre.

**Mitigação:**
- Teto declarado: nenhum cliente acima de 25% do faturamento trimestral. Quando passar, o comercial vira prioridade absoluta mesmo com a operação cheia.
- Manter prospecção ativa **inclusive nos meses cheios** — o erro clássico é parar de vender quando está entregando, e o buraco aparece 90 dias depois.
- Diversificar por segmento: o wizard já cobre 7 verticais; usar isso como mapa de diversificação, não só como formulário.
- Receita recorrente cobrindo custo fixo reduz a dependência de qualquer cliente único.

**Situação atual:** `[PREENCHER — distribuição de faturamento por cliente]`

---

### Risco 2 — Precificar abaixo do custo

**Por que acontece:** sem custo-hora interno calculado, o preço vira chute ancorado no que o cliente parece disposto a pagar. Piora com ociosidade não contabilizada (ninguém fatura 8 h/dia), com retrabalho não previsto e com pré-venda gratuito não rateado.

**Mitigação:**
- Calcular o custo-hora interno real e revisar semestralmente. **Nenhum preço sai sem essa conta.**
- Piso de margem bruta por oferta (sugestão: 40%). Proposta abaixo do piso exige aprovação consciente do sócio, com motivo registrado.
- Colchão de risco de 20–30% em toda estimativa de preço fechado.
- **Medir horas reais gastas por projeto** e comparar com o orçado. Sem esse número não existe aprendizado de precificação — a empresa repete o mesmo erro por anos.
- Descoberta paga elimina a maior fonte de erro: orçar o desconhecido.

**Situação atual:** custo-hora interno `[PREENCHER]` · margem média por projeto `[PREENCHER]`

---

### Risco 3 — Escopo aberto

**Por que o site atual amplifica isso:** a pergunta 4 do wizard oferece 8 "opções adicionais" sem esforço nem preço associado. O cliente marca tudo e chega à reunião com uma expectativa que ninguém orçou. E o campo "Descreva sua ideia" é aberto, sem estrutura.

**Mitigação:**
- **Escopo escrito e assinado antes de qualquer linha de código** — sem exceção, nem para cliente conhecido.
- **A lista de exclusões vale mais que a de inclusões.** Toda proposta traz "o que NÃO está incluído" com destaque igual ao do que está.
- **Cláusula de mudança de escopo** no contrato: alteração vira registro escrito com impacto em prazo e preço, aprovado antes de entrar em desenvolvimento.
- Marcos quinzenais de demonstração: escopo aberto costuma nascer de expectativa desalinhada descoberta tarde demais.
- No site: as "opções adicionais" passam a exibir impacto relativo (ex.: "adiciona ~2 semanas") em vez de serem checkboxes gratuitos.

---

### Risco 4 — Inadimplência

**Por que dói mais em empresa pequena:** o custo (salário, pró-labore, servidor) já foi pago quando a fatura atrasa. Um cliente médio inadimplente pode comprometer a folha.

**Mitigação:**
- **30% antecipado, sempre.** Cliente que não paga a entrada não vai pagar o resto. Essa é a melhor consulta de crédito que existe, e é gratuita.
- Pagamento vinculado a marcos, nunca só na entrega final.
- **Cláusula de suspensão:** atraso superior a `[PREENCHER — sugestão: 10 dias]` suspende o trabalho automaticamente. Deve estar no contrato e ser exercida — cláusula que não se usa não protege ninguém.
- **Retenção de entrega:** transferência de código, credenciais e propriedade intelectual só ocorre após quitação. Precisa estar escrito.
- Multa e juros de mora previstos em contrato.
- Consulta de CNPJ antes de contrato acima de `[PREENCHER — sugestão: R$ 50 mil]`.
- Régua de cobrança automática: D+1, D+5, D+10, D+15 (jurídico). Cobrar cedo e sem constrangimento — quem cobra tarde recebe por último.

---

### Risco 5 — Dependência de pessoa-chave

**Por que é real aqui:** o repositório e as redes sociais no rodapé (`github.com/lemamon-dev`, `linkedin.com/in/lemamon-dev`) apontam para uma operação muito enxuta. Se a mesma pessoa vende, entrega e sustenta, o gargalo é estrutural: nas semanas de entrega pesada, o comercial para — e o buraco de faturamento aparece 60–90 dias depois.

**Mitigação:**
- Bloquear agenda de prospecção **inegociável** toda semana, inclusive em mês de entrega cheia.
- Automatizar o que hoje consome tempo humano: qualificação (wizard), agendamento (agenda pública), confirmação (e-mail automático), follow-up (lembrete de CRM).
- Padronizar propostas, escopo e contrato em templates — a maior parte do tempo comercial é gasta reescrevendo o que já foi escrito.
- Documentar o processo de entrega para permitir subcontratação em pico de demanda sem perda de qualidade.

---

### Risco 6 — Ausência de prova social

**Por que é comercial e não estético:** o site não tem um único case, depoimento ou logo de cliente. O blog (`src/data/posts.ts`) tem tutoriais genéricos assinados por "João Silva". Sem prova, a única alavanca de venda que sobra é preço — e preço é a alavanca que destrói margem.

**Mitigação:**
- Publicar 3 cases estruturados (problema → o que foi feito → resultado). Se não houver permissão do cliente, publicar anonimizado por segmento ("rede de restaurantes em SC").
- Pedir depoimento **no go-live**, quando a satisfação está no pico — não meses depois.
- Trocar o blog de tutorial genérico por conteúdo de decisão de negócio ("quanto custa um MVP de verdade", "os 5 erros que estouram o orçamento de um app"). Tutorial de JavaScript atrai desenvolvedor; conteúdo de decisão atrai comprador.
- **Nunca publicar resultado numérico de cliente sem autorização e sem o número real.** `[PREENCHER — cases disponíveis e autorizados]`

---

## 7.9. KPIs comerciais

### 7.9.1. Indicadores de funil

| KPI | Definição | Meta inicial | Como medir hoje |
|---|---|---|---|
| **Visitantes → início do wizard** | % de quem clica em "Comece seu projeto!" | 15% `[ESTIMATIVA DE MERCADO]` | GA4 — exige evento no clique de `setIsInitial(false)` em `Projects/index.tsx` (hoje não existe) |
| **Início → conclusão do wizard** | % que chega ao formulário final | 40% `[ESTIMATIVA DE MERCADO]` | Exige evento por etapa em `ProjectBuilder` (hoje não existe) |
| **Abandono por etapa** | Onde as pessoas desistem | Nenhuma etapa acima de 25% de perda | Idem |
| **Leads/mês** | Formulários enviados | `[PREENCHER — baseline atual]` → +30% em 90 dias | GA4 já dispara `gtag_report_conversion` no envio (`src/service/index.ts`) |
| **% de leads A+B** | Qualidade, não volume | 40% | Só possível após as perguntas de qualificação de 7.5 |
| **Lead → diagnóstico agendado** | Conversão do primeiro contato | 35% `[ESTIMATIVA DE MERCADO]` | CRM |
| **Diagnóstico → proposta** | | 70% | CRM |
| **Proposta → fechamento** | Taxa de vitória | 25–35% `[ESTIMATIVA DE MERCADO]` | CRM |
| **Ciclo de venda** | Dias do lead ao contrato assinado | ≤ 30 dias | CRM |

### 7.9.2. Indicadores financeiros

| KPI | Definição | Meta inicial |
|---|---|---|
| **Ticket médio por contrato** | Faturamento fechado ÷ nº de contratos | Crescer 20% em 2 trimestres `[PREENCHER baseline]` |
| **MRR** | Receita recorrente mensal (Sustentação + Squad) | Cobrir 100% do custo fixo em 12 meses |
| **Cobertura de custo fixo** | MRR ÷ custo fixo mensal | 30% em 6 meses · 100% em 12 |
| **Margem bruta por projeto** | (Preço − custo direto) ÷ preço | ≥ 40% em todo projeto |
| **Desvio de estimativa** | Horas reais ÷ horas orçadas | ≤ 1,2 |
| **CAC por canal** | Custo de aquisição (inclui horas de pré-venda) | `[PREENCHER]` — exige captura de UTM |
| **Concentração** | % do maior cliente no faturamento trimestral | ≤ 25% |
| **Inadimplência** | Valor vencido > 30 dias ÷ faturado | ≤ 3% |
| **Taxa de conversão em Sustentação** | Projetos entregues que viram contrato recorrente | 60% `[ESTIMATIVA DE MERCADO]` |

### 7.9.3. Rituais mínimos

- **Semanal (30 min):** revisão do pipeline — nenhum lead sem próximo passo com data. Nenhum lead A sem contato dentro do SLA.
- **Mensal (1 h):** funil completo, MRR, cobertura de custo fixo, concentração, inadimplência.
- **Trimestral (meio dia):** margem real por projeto entregue vs. orçado, revisão de preço das ofertas, revisão do custo-hora interno.

> Regra de disciplina: **medir 5 KPIs de verdade vale mais que listar 20 num painel que ninguém abre.** Se for para começar com poucos: leads/mês, % de leads A+B, taxa de fechamento, margem bruta por projeto e cobertura de custo fixo pelo MRR.

---

## 7.10. Resumo executivo da seção

1. O wizard atual vende **cargos** (UX/UI, Front-end, Back-end) misturados com um resultado (Solução Completa) — e isso posiciona a Lemamon como mão de obra por hora, contradizendo o próprio copy institucional do site.
2. Substituir por **4 ofertas nomeadas** — Sprint de Descoberta, MVP em 8–12 semanas, Squad Dedicado e Sustentação — em que o cliente escolhe **o estágio dele**, não o cargo que quer contratar.
3. Modelo de precificação principal: **preço fechado**, sempre precedido de **descoberta paga**; recorrente como alvo estratégico; hora só como exceção.
4. Isca de entrada: **diagnóstico gratuito de 45 min com devolutiva escrita**, que vende a Descoberta paga.
5. Qualificar no wizard com **3 perguntas no fim** (estágio, prazo, faixa de orçamento) mais empresa e papel na decisão no formulário, sempre com saída digna para quem não sabe.
6. Hoje o lead **vira um e-mail e morre num inbox**: sem CRM, sem persistência, sem confirmação ao lead, sem SLA, sem follow-up — e com botões sem handler na própria tela de sucesso.
7. Riscos prioritários: concentração de clientes, preço abaixo do custo, escopo aberto, inadimplência, dependência de pessoa-chave e ausência total de prova social.
8. Meta estrutural: **receita recorrente cobrindo 100% do custo fixo**, para que preço deixe de ser feito com medo.
