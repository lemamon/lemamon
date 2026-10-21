# Copy do site Lemamon.dev

Texto final do site, para você revisar antes da implementação em Astro. Este documento junta os 5 documentos de copy (Home, Método e preço, Serviços, Conversão e Estrutura), validados por 7 revisores especialistas (as três personas, comercial, UX writer, SEO e compliance) em 3 rodadas, mais um portão final.

- **Fonte de verdade:** `src/i18n/pt.json`, `src/i18n/en.json` e `src/i18n/es.json`. Este documento é a versão legível do pt-BR.
- **Versões mescladas:** pt-BR v5 dos 5 documentos; en v3; es v3 (o wizard e a página de contato em es estão na v2).
- **Verificação:** `node scripts/check-i18n.mjs` confere que os 3 idiomas têm exatamente as mesmas chaves (ver seção 8).
- **O site atual não muda:** `src/locales` continua sendo o copy do site em React até a migração.

## Sumário

1. [Posicionamento e mensagem central](#1-posicionamento-e-mensagem-central)
2. [O copy pt-BR, página por página](#2-o-copy-pt-br-página-por-página)
3. [Variações de headline para teste A/B](#3-variações-de-headline-para-teste-ab)
4. [O que melhora quando você confirmar dados](#4-o-que-melhora-quando-você-confirmar-dados)
5. [Histórico de validação](#5-histórico-de-validação)
6. [Bloqueios](#6-bloqueios)
7. [Ajustes feitos na mesclagem](#7-ajustes-feitos-na-mesclagem)
8. [Como os arquivos são usados](#8-como-os-arquivos-são-usados)

---

## 1. Posicionamento e mensagem central

### Posicionamento

**Escopo, prazo e preço fechados** (Hipótese C de `05-conteudo.md` §2). A Lemamon.dev leva a empresa da descoberta ao software rodando, com escopo, prazo e preço combinados antes de começar. O herói do site é o método, não a tecnologia: o comprador está comprando previsibilidade.

### Mensagem central

- **Promessa (H1 da Home):** "Software sob medida com escopo, prazo e preço combinados antes de começar."
- **Síntese do método, repetida no site:** "Primeiro a gente combina. Depois a gente constrói."
- **Porta de entrada:** diagnóstico gratuito de 45 minutos, com devolutiva por escrito, sem compromisso de contratar.
- **CTA primário único:** "Pedir diagnóstico gratuito". Dentro das seções de método ele vira "Começar pelo diagnóstico gratuito". O WhatsApp ("Falar no WhatsApp") é a porta paralela em todas as páginas.

### O problema que o site nomeia

A Home trata o medo de contratar software como algo que "costuma dar errado", nunca como experiência do leitor, e responde cada medo com uma etapa confirmada do método:

| O que costuma dar errado | Como o método evita |
|---|---|
| Orçamentos impossíveis de comparar, porque cada fornecedor entendeu uma coisa | O problema e o escopo priorizado com você ficam por escrito, e só depois vem o preço |
| Meses de projeto sem ver nada funcionando | Software funcionando a cada 2 semanas |
| Escopo que ninguém escreveu e preço que só cresce | Escopo validado por você e por escrito, e preço fechado sobre esse escopo |
| O fornecedor que some depois do lançamento | Sustentação e evolução contínua, se você quiser |

### O método: as únicas promessas do site

| Etapa | Custo | Você recebe |
|---|---|---|
| 1. Diagnóstico | Gratuito · 45 minutos | uma devolutiva por escrito sobre o seu caso |
| 2. Sprint de Descoberta | Gratuita · se for necessária | entendimento do problema, escopo priorizado e plano com prazo e preço fechados para o desenvolvimento |
| 3. Desenvolvimento | Entregas a cada 2 semanas | software funcionando, que você usa, não apresentação de slide |
| 4. Sustentação e evolução | Contínua, com valor combinado antes de começar | o sistema cuidado e evoluindo depois que entra no ar |

**Onde o cliente decide:** em dois momentos. Depois da devolutiva, se segue (a Sprint de Descoberta, quando necessária, é gratuita). Com prazo e preço fechados no plano, se segue para o desenvolvimento. Até aprovar o desenvolvimento, não paga nada (D44, 21/10/2026). A frase que resume: "Você não assina o projeto inteiro no escuro."

### Para quem o texto é escrito

- **Cláudia, sócia ou diretora de PME tradicional:** é a leitora padrão. Ela se reconhece na planilha que virou sistema, na digitação dupla e nas ferramentas que não conversam. O site responde ao medo dela ("vou pagar, vai atrasar e não vai funcionar") com preço combinado antes, software a cada 2 semanas, devolutiva por escrito para levar ao sócio e uma régua para comparar propostas em /quanto-custa.
- **Rafael, fundador de startup em fase seed:** o card do fundador ("sem queimar o caixa construindo a coisa errada"), a página de MVP e o WhatsApp desde o hero falam com ele.
- **Marcos, head de produto ou tech lead de empresa média:** chega por Como trabalhamos, Integrações e Sustentação. A prova técnica que ele procura (engenharia, perfis, time) entra quando você preencher os dados.

### Como o site trata o preço

Nenhum valor é publicado. A pergunta "quanto custa?" recebe uma resposta honesta que começa pelo que já dá para saber ("o preço sai fechado antes do desenvolvimento"), não pela negativa (auditoria de conversão F08), a lista do que pesa no preço e o caminho até um preço fechado. As faixas de referência existem como estrutura e ficam escondidas até `precos.ts` ser preenchido.

### Regras que o copy respeita

- Só afirma os fatos confirmados. Os únicos números de serviço são "45 minutos" e "a cada 2 semanas"; "6 perguntas" descreve o próprio formulário. A duração da Descoberta não é publicada: ela é definida com o cliente no diagnóstico (D44, 21/10/2026, revoga a D42).
- Afirma o atendimento a distância fora do Brasil, em português, inglês ou espanhol (D31, `confirmacoes.atendeExterior`), sem citar moeda, nota fiscal de exportação, foro ou fuso: esses ficam "combinados por escrito antes de começar".
- Não cita clientes, número de projetos, anos de mercado, tamanho ou nomes do time, certificações, prêmios, percentuais, depoimentos, logos, duração do MVP, duração da Descoberta (definida com o cliente no diagnóstico), preço, abatimento ou protótipo da Descoberta, quem decide se a Descoberta é necessária além de "definido com você no diagnóstico", que o plano fica com o cliente se ele não seguir, custo total do projeto, prazo da devolutiva, preços, garantias contratuais além das confirmadas pelo dono (o código da empresa por contrato, com `codigoProprietario = "answer_draft"`, e o NDA antes dos detalhes), prazo de resposta nem superlativos ("melhor", "líder", "referência").
- Cases, depoimentos, logos, time e preços são escritos só como estrutura (título, introdução, rótulos) e aparecem quando o dado existir. O texto dessas seções faz sentido com 1 ou mais itens.
- Sustentação fala de "o sistema" que entra no ar, nunca promete assumir sistema feito por outra empresa (isso depende de `confirmacoes.sistemaTerceiros`).

### Tom de voz

Concreto, franco e sem pompa. "A gente" e "você". A frase começa pelo problema do cliente. Jargão só com explicação curta na primeira menção (escopo priorizado, MVP, API).

### Termos fixos por idioma

- **Marca (D43):** sempre "Lemamon.dev" no texto, nos 3 idiomas ("a Lemamon.dev", "da Lemamon.dev"), nunca só "Lemamon". O wordmark gráfico usa `lemamon.dev` em minúsculas (D34).

| pt-BR | en | es |
|---|---|---|
| diagnóstico gratuito | free assessment | diagnóstico gratuito |
| devolutiva por escrito | written feedback | conclusiones por escrito |
| Sprint de Descoberta | Discovery Sprint | Sprint de Descubrimiento |
| entregas a cada 2 semanas | working software every 2 weeks | entregas cada 2 semanas |
| sustentação e evolução | support and continuous improvement | mantenimiento y evolución |
| escopo, prazo e preço | scope, timeline and price | alcance, plazo y precio |
| Pedir diagnóstico gratuito | Request a free assessment | Pide tu diagnóstico gratuito |
| Falar no WhatsApp | Chat on WhatsApp | Escríbenos por WhatsApp |
| orçamento (`/orcamento`) | quote (`/en/quote`) | cotización (`/es/cotizacion`) |

O espanhol é neutro latino-americano, com "tú" em todo o site. Em selos e linhas curtas, "São Paulo, SP" vira "São Paulo, Brazil/Brasil". Nenhuma versão diz que a Lemamon.dev atende fora do Brasil enquanto `confirmacoes.outrasCidades` estiver pendente.

---

## 2. O copy pt-BR, página por página

**Como ler:**

- Cada página segue a ordem das seções na tela. O título de cada bloco traz o caminho da chave (ex.: `home.hero`), para você apontar ajustes.
- Palavras em `fonte de código` são identificadores internos e não aparecem no site.
- `{nome}` é um campo preenchido pelo sistema (ex.: `{email}`, `{servico}`, `{protocolo}`).
- _(variante…)_ marca um texto que substitui o principal só numa condição (ex.: quando há faixas de preço, agenda online ou sistema já no ar).
- _(rascunho…)_ marca respostas que só vão ao ar quando você aprovar a flag correspondente.
- **Condicional** marca seções que só aparecem quando o dado existir.
- As notas de implementação (chaves que começam com `_`) ficam fora deste documento e estão nos JSON.

### Home (`/`)

Ordem das seções conforme o BLUEPRINT §6.1. Hoje vão ao ar 8 seções; as condicionais aparecem sozinhas quando o dado existir.

#### 1. Hero · `home.hero`

- **Sobretítulo**: Para PMEs e startups · São Paulo, SP
- **Título**: Software sob medida com escopo, prazo e preço combinados antes de começar.
- **Subtítulo**: Sistemas, aplicativos, integrações e MVPs. Você aprova o plano antes do desenvolvimento e recebe software funcionando a cada 2 semanas.

> Abaixo dos botões: texto de apoio `shared.cta.microcopy_diagnosis` e a linha do método compacta (ver item 6).

#### 2. Faixa de compromissos · `shared.commitments`
> Componente compartilhado, mostrado aqui porque fica logo abaixo do hero.

- **Rótulo de acessibilidade**: O que a Lemamon.dev combina com você
- **Itens**
  - **`scope_price_closed`**: Escopo, prazo e preço fechados antes do desenvolvimento
  - **`every_two_weeks`**: Software funcionando a cada 2 semanas
  - **`you_decide`**: Você decide se segue depois do diagnóstico e do plano
  - **`after_launch`**: Sustentação e evolução depois que entra no ar
- **`location_seal`**: São Paulo, SP

> 3. Logos de clientes: **condicional** (`hasLogos`, pelo menos 4 com autorização). Rótulo em `shared.proof.logos_label`.

#### 4. Sinais de que chegou a hora · `home.problem`

- **Sobretítulo**: Sinais de que chegou a hora
- **Título**: O improviso trouxe a sua empresa até aqui. Agora ele começou a custar caro.
- **Introdução**: Se algum destes cenários parece com o seu, na operação ou num produto novo, a conversa começa por aí.
- **Cartões**
  - **`spreadsheet`**
    - **Título**: A planilha virou o sistema da empresa
    - **Texto**: E só uma pessoa sabe mexer nela sem quebrar nada.
  - **`double_entry`**
    - **Título**: A mesma informação é digitada duas vezes
    - **Texto**: O pedido chega pelo WhatsApp, vai para a planilha, depois para o sistema, e alguém sempre erra no caminho.
  - **`disconnected_tools`**
    - **Título**: Você paga por ferramentas que não conversam
    - **Texto**: E, na hora de decidir, cada uma mostra um número diferente.
  - **`off_the_shelf`**
    - **Título**: O software pronto não faz o principal
    - **Texto**: Porque o seu processo não é igual ao dos outros, e a equipe vive contornando o sistema.
  - **`founder_idea`**
    - **Título**: A ideia de produto ainda está no papel
    - **Texto**: E você precisa colocá-la nas mãos de usuários sem queimar o caixa construindo a coisa errada.
- **Link**: Reconheceu o seu caso? Pedir diagnóstico gratuito

#### 5. O que costuma dar errado · `home.risks`

- **Título**: O que costuma dar errado quando se contrata software
- **Introdução**: São riscos comuns. Veja o que a gente faz para evitar cada um.
- **Pares medo → resposta**
  - **`incomparable_quotes`**
    - **Medo**: Orçamentos impossíveis de comparar, porque cada fornecedor entendeu uma coisa
    - **Resposta**: O problema e o escopo priorizado com você ficam por escrito, e só depois vem o preço.
  - **`nothing_working`**
    - **Medo**: Meses de projeto sem ver nada funcionando
    - **Resposta**: Software funcionando a cada 2 semanas, para você usar e dar retorno.
  - **`unwritten_scope`**
    - **Medo**: Escopo que ninguém escreveu e preço que só cresce
    - **Resposta**: Escopo validado por você e por escrito, e preço fechado sobre esse escopo.
  - **`vendor_disappears`**
    - **Medo**: O fornecedor que some depois do lançamento
    - **Resposta**: Sustentação e evolução contínua: a gente segue com você, se quiser.
- **Frase-ponte**: Em todos eles, faltou combinar antes de começar, mostrar o andamento ou continuar depois do lançamento. Por isso a gente trabalha assim:

#### 6. Como trabalhamos (o método) · `home.method`

- **Sobretítulo**: Como trabalhamos
- **Título**: Primeiro a gente combina. Depois a gente constrói.
- **Introdução**: Em cada etapa, você sabe o que recebe. A Descoberta só entra quando o diagnóstico mostra que ela é necessária.
- **Etapas**
  - **Diagnóstico**
    - **Título-benefício**: Seu caso ouvido antes de qualquer gasto
    - **Texto**: Você conta o problema na língua do seu negócio e tira as suas dúvidas. A gente faz as perguntas que importam.
  - **Sprint de Descoberta**
    - **Título-benefício**: Daqui saem escopo, prazo e preço fechados
    - **Texto**: Sem custo, o problema vira um escopo priorizado e validado por você. Assim, prazo e preço deixam de ser chute.
  - **Desenvolvimento**
    - **Título-benefício**: Você acompanha usando o próprio software
    - **Texto**: Cada entrega é uma parte do sistema funcionando. O que precisa de ajuste aparece cedo, e não no fim do projeto.
  - **Sustentação e evolução**
    - **Título-benefício**: Depois que entra no ar, a gente continua
    - **Texto**: O seu negócio muda, e o sistema precisa mudar junto. Se você quiser, a gente segue cuidando dele.

#### 6a. Linha do método (nome, tag e 'Você recebe' de cada etapa) · `shared.method_timeline`
> Componente compartilhado, usado também em Como trabalhamos, Sprint de Descoberta, serviços e resumo do orçamento.

- **Rótulo de acessibilidade**: Como a Lemamon.dev trabalha, em 4 etapas
- **`start_here_badge`**: Comece aqui
- **`next_step_badge`**: Próximo passo
- **`you_get_label`**: Você recebe:
- **Etapas**
  - **Diagnóstico**
    - **Nome**: Diagnóstico
    - **Tag**: Gratuito · 45 minutos
    - **Você recebe**: uma devolutiva por escrito sobre o seu caso
  - **Sprint de Descoberta**
    - **Nome**: Sprint de Descoberta
    - **Tag**: Gratuita · se for necessária (a mesma nas 3 variantes; sem tag longa nem duração, D44)
    - **Você recebe**: entendimento do problema, escopo priorizado e plano com prazo e preço fechados para o desenvolvimento
  - **Desenvolvimento**
    - **Nome**: Desenvolvimento
    - **Tag**: Entregas a cada 2 semanas
    - **Você recebe**: software funcionando, que você usa, não apresentação de slide
  - **Sustentação e evolução**
    - **Nome**: Sustentação e evolução
    - **Tag**: Contínua
    - **Você recebe**: o sistema cuidado e evoluindo depois que entra no ar

#### 6b. Onde você decide · `shared.decision_points`
> Componente compartilhado.

- **Título**: Onde você decide
- **Introdução**: Você não assina o projeto inteiro no escuro: só segue para o desenvolvimento com escopo, prazo e preço fechados na mão.
- **`after_feedback`**: Com a devolutiva por escrito em mãos, você decide se segue. A Sprint de Descoberta, quando necessária, é gratuita.
- **`after_plan`**: Com prazo e preço fechados no plano, você decide se segue para o desenvolvimento.

> 7. Depoimento: **condicional** (`hasTestimonials`, nominal). Rótulos em `shared.proof`.

#### 8. O que a gente constrói · `home.services`

- **Sobretítulo**: Serviços
- **Título**: O que a gente constrói
- **Introdução**: Desenvolvimento de software sob medida para o processo que o software pronto não atende e para o produto que ainda não existe. Em todos os casos, o mesmo método.
- **Itens**
  - **`web_systems`**
    - **Título**: Sistemas web
    - **Texto**: Sistemas de gestão, painéis e portais para a sua empresa, do jeito que ela trabalha.
  - **`mobile_apps`**
    - **Título**: Aplicativos
    - **Texto**: Apps para seus clientes ou sua equipe. A publicação nas lojas pode fazer parte do escopo.
  - **`integrations`**
    - **Título**: Integrações e automação
    - **Texto**: Os sistemas que você já usa trocando dados, sem digitar a mesma informação duas vezes.
  - **`mvp`**
    - **Título**: MVP e produtos digitais
    - **Texto**: A primeira versão do seu produto nas mãos de usuários reais, só com o essencial.
  - **Sustentação e evolução**
    - **Título**: Sustentação e evolução
    - **Texto**: O sistema cuidado e evoluindo depois que entra no ar, conforme a operação muda.
- **Rodapé da seção**: Não sabe em qual se encaixa? O diagnóstico serve para isso.

#### 9. Cases · `home.cases`
> **Condicional:** `hasCases` (pelo menos 2 cases publicados).

- **Sobretítulo**: Cases
- **Título**: Projetos que a gente já entregou
- **Introdução**: O problema, o que foi entregue e, quando o cliente autoriza divulgar, o resultado.

> 10. Investimento: **condicional** (`hasPricing`). Texto em `shared.investment` (ver Componentes compartilhados).

#### 11. Time · `home.team`
> **Condicional:** `hasTeam` (pelo menos 1 pessoa com foto, nome e papel).

- **Título**: Quem trabalha nos projetos da Lemamon.dev
- **Introdução**: Conheça quem está por trás da Lemamon.dev antes da primeira conversa.
- **Link**: Conhecer a Lemamon.dev

#### 12. Confira antes de conversar · `home.trust_profiles`
> **Condicional:** `hasProfiles` (pelo menos 1 perfil marcado como publicar em perfis.ts). Os cartões usam `shared.profiles`.

- **Título**: Confira antes de conversar
- **Texto**: A Lemamon.dev é uma empresa de desenvolvimento de software sob medida em São Paulo, SP. Aqui você encontra a empresa fora deste site.

#### 13. Perguntas antes de começar · `home.faq`

- **Título**: Perguntas antes de começar
- **Link final**: Quanto custa um software sob medida e o que define o preço

#### 13a. Perguntas do FAQ da Home

Perguntas, nesta ordem (as respostas completas estão em [Perguntas frequentes — banco central](#perguntas-frequentes--banco-central)):

1. Quanto custa um projeto de software? · `faq.items.how_much`
2. Quanto tempo leva para desenvolver um sistema ou aplicativo? · `faq.items.how_long`
3. Pago alguma coisa antes do desenvolvimento? · `faq.items.pay_before_development`
4. O diagnóstico gratuito tem algum compromisso? · `faq.items.diagnosis_commitment`
5. Preciso entender de tecnologia para contratar? · `faq.items.need_tech_knowledge`
6. Como eu acompanho o andamento? · `faq.items.how_follow_progress`
7. E depois que o sistema entra no ar? · `faq.items.after_launch`

Condicionais (entram quando o dono ligar a flag):

- E se eu precisar mudar o escopo no meio do projeto? · `faq.conditional.scope_change`
- O código fica com a minha empresa? · `faq.conditional.code_ownership`
- Vocês emitem nota fiscal? · `faq.conditional.invoice`
- Vocês atendem empresas de outras cidades? · `faq.conditional.other_cities`
- Vocês assinam acordo de confidencialidade (NDA)? · `faq.conditional.nda`

#### 14. CTA final · `home.cta_final`

- **Título**: Comece por 45 minutos de conversa
- **Texto**: Você conta o problema, mesmo sem escopo pronto, e recebe uma devolutiva por escrito.

> O CTA final da Home leva também o bloco 'Como funciona' em 3 passos (`shared.cta_final.how_it_works_steps`) e a linha de e-mail e localização (ver Componentes compartilhados).

### Como trabalhamos (`/como-trabalhamos`)

Página-pilar do método. Ordem conforme o BLUEPRINT §6.2.

#### 1. Hero · `how_we_work.hero`

- **Sobretítulo**: Como trabalhamos
- **Título**: Desenvolvimento de software com escopo, prazo e preço fechados
- **Subtítulo**: Diagnóstico e Sprint de Descoberta gratuitos, e desenvolvimento com preço fechado. Nada é cobrado antes do desenvolvimento, e você decide se segue.
- **Rótulo do índice**: Etapas do método

#### Texto da imagem de compartilhamento · `how_we_work.og_image_headline`

- Primeiro a gente combina. Depois constrói.

#### 2. O que está combinado desde o início · `how_we_work.agreement`

- **Título**: O que a Lemamon.dev combina com você
- **Itens**
  - **`scope_price`**
    - **Título**: Escopo, prazo e preço fechados antes do desenvolvimento
    - **Texto**: Vêm por escrito, para você aprovar o desenvolvimento sabendo o que vai receber, quando e por quanto.
  - **`every_two_weeks`**
    - **Título**: Software funcionando a cada 2 semanas
    - **Texto**: Você acompanha o projeto pelo que já roda, não por relatório de andamento.
  - **`you_decide`**
    - **Título**: Você decide se segue, em dois momentos
    - **Texto**: Um depois da devolutiva do diagnóstico, outro depois do plano com prazo e preço. Até o segundo, você não paga nada.

#### 3. Por que nesta ordem · `how_we_work.why_this_order`

- **Título**: Por que a gente combina antes de construir
- **Parágrafos**:
  1. Um preço dado antes de entender o seu problema é chute. Ou vem alto, para cobrir o risco de quem orçou, ou vem baixo e cresce no meio do caminho, quando aparece o que ninguém tinha previsto.
  2. Por isso prazo e preço só saem fechados, por escrito, depois de entender o problema e priorizar o escopo. Quando o diagnóstico mostra que isso pede uma Sprint de Descoberta, ela é gratuita.
- **Destaque**: Primeiro a gente combina. Depois a gente constrói.

> 4. Linha do método completa: `shared.method_timeline` (texto na Home, item 6a).

#### 5. Etapa 1: Diagnóstico · `how_we_work.stage_diagnosis`

- **Título**: Diagnóstico gratuito
- **Rótulo 'para quem'**: Para quem
- **Para quem**: Quem tem um problema na operação, uma ideia de produto ou um processo que o sistema atual já não acompanha, e quer saber por onde começar.
- **Rótulo 'como é'**: Como é
- **Como é**: São 45 minutos de conversa sobre o problema, quem sofre com ele hoje, o que já foi tentado e o que precisa mudar. Você não precisa chegar com escopo pronto.
- **Você recebe**: uma devolutiva por escrito sobre o seu caso
- **Título 'tenha à mão'**: Para aproveitar melhor os 45 minutos
- **Itens para ter à mão**:
  1. Se puder, traga para a conversa quem decide sobre o projeto e quem conhece os sistemas de hoje.
  2. Separe exemplos do que existe hoje: planilhas, telas, mensagens ou rascunhos da ideia.
  3. Liste os sistemas e as ferramentas que vocês já usam.
- **Rótulo 'depois'**: Depois
- **Depois**: Se fizer sentido seguir, a gente define com você se a Sprint de Descoberta é necessária e quanto ela dura. Ela é gratuita.

#### 6. Etapa 2: Sprint de Descoberta · `how_we_work.stage_discovery`

- **Título**: Sprint de Descoberta
- **Texto**: É aqui que o seu problema vira um plano. O escopo é priorizado com você, e prazo e preço do desenvolvimento saem fechados, por escrito.
- **Você recebe**: entendimento do problema, escopo priorizado e plano com prazo e preço fechados para o desenvolvimento
- **Rótulo de custo**: Custo
- **Custo**: Gratuita. Só acontece quando o diagnóstico mostra que ela é necessária, e a duração é definida com você.
- **Rótulo 'depois'**: Depois
- **Depois**: Com o plano em mãos, já com prazo e preço fechados, você decide se segue para o desenvolvimento.
- **Link**: Entender por que a Sprint de Descoberta vem antes

#### 7. Etapa 3: Desenvolvimento · `how_we_work.stage_development`

- **Título**: Desenvolvimento
- **Texto**: A cada 2 semanas você recebe uma parte do sistema funcionando, para usar. O seu retorno orienta os ajustes do ciclo seguinte, dentro do escopo combinado.
- **`cycle_aria_label`**: Ciclo de entregas a cada 2 semanas
- **`cycle_steps`**
  - **`build`**: A gente constrói
  - **`deliver`**: Você recebe funcionando
  - **`use`**: Você usa e comenta
  - **`next`**: Começa o próximo ciclo
- **Você recebe**: software funcionando, que você usa, não apresentação de slide
- **Rótulo 'por quê'**: Por que importa
- **Por quê**: Você vê o progresso no próprio software e percebe cedo o que precisa de ajuste, em vez de descobrir só no fim.

#### 8. Etapa 4: Sustentação e evolução · `how_we_work.stage_support`

- **Título**: Sustentação e evolução
- **Texto**: Software no ar continua precisando de cuidado. Na sustentação e evolução contínua, a gente cuida do que está rodando e evolui o sistema conforme a sua operação muda, com formato e valor combinados com você antes de começar.
- **Você recebe**: o sistema cuidado e evoluindo depois que entra no ar
- **`live_system`**: Já tem um sistema no ar? A conversa começa pelo mesmo diagnóstico gratuito e, se fizer sentido seguir, o que vem depois é combinado com você antes de começar.
- **Link**: Ver como funciona a sustentação de sistemas

#### 9. Você decide com informação na mão · `how_we_work.decide`

- **Título**: Você decide com informação na mão
- **Introdução**: Até aprovar o desenvolvimento, você não paga nada. E aprova já sabendo quanto ele vai custar.

#### 10. Sem combinado × com o método · `how_we_work.comparison`

- **Título**: O que muda para quem contrata
- **Legenda**: Comparação entre como a contratação de software costuma acontecer e como funciona com o método da Lemamon.dev
- **Coluna 1**: Aspecto
- **Coluna 'sem'**: Como costuma ser
- **Coluna 'com'** _(variante: só quando o dado indicado existir)_: Com o método da Lemamon.dev
- **Linhas**
  - **`price`**
    - **Dimensão**: Preço
    - **Sem**: Um “a partir de”, dado antes de entender o problema
    - **Com**: Fechado por escrito, antes de o desenvolvimento começar
  - **`deadline`**
    - **Dimensão**: Prazo
    - **Sem**: Estimado no escuro, antes de conhecer o escopo
    - **Com**: Fechado no plano, junto com o preço
  - **`scope`**
    - **Dimensão**: Escopo
    - **Sem**: Uma lista de desejos que cresce durante o projeto
    - **Com**: Priorizado e validado com você antes de construir
  - **`follow_up`**
    - **Dimensão**: Acompanhamento
    - **Sem**: Progresso medido em reunião e slide
    - **Com**: Software funcionando a cada 2 semanas, para você usar
  - **`after_launch`**
    - **Dimensão**: Depois do lançamento
    - **Sem**: Suporte só quando algo quebra, negociado na hora
    - **Com**: Sustentação e evolução contínua, com valor combinado antes

#### 11. O método na prática · `how_we_work.proof`
> **Condicional:** `hasCases` (pelo menos 1) ou `hasTestimonials`.

- **Título**: O método na prática
- **Introdução**: Como o método funcionou para quem já passou por ele.

#### 12. Como a gente constrói · `how_we_work.engineering`
> **Condicional:** `hasEngineering` (engenharia.ts). Só rótulos e introdução; o conteúdo vem do dono.

- **Título**: Como a gente constrói
- **Introdução**: Para quem avalia a parte técnica: as práticas de engenharia que a Lemamon.dev usa nos projetos.
- **Campos**
  - **`tests`**: Testes
  - **`ci_cd`**: Integração e entrega contínuas
  - **`code_review`**: Revisão de código
  - **`repository`**: Onde fica o código
  - **`documentation`**: Documentação
  - **`handover`**: Passagem de conhecimento
  - **`people`**: Quem trabalha no projeto
  - **`security`**: Segurança e acesso aos dados
- **`profiles_fallback`**: Para quem avalia a parte técnica: a Lemamon.dev no GitHub.

> 13. Investimento: **condicional** (`hasPricing`), texto em `shared.investment`.

#### 14. Perguntas frequentes (título) · `how_we_work.faq`

- **Título**: Dúvidas sobre o processo

#### 14a. Perguntas desta página

Perguntas, nesta ordem (as respostas completas estão em [Perguntas frequentes — banco central](#perguntas-frequentes--banco-central)):

1. Pago alguma coisa antes do desenvolvimento? · `faq.items.pay_before_development`
2. Quanto tempo leva para desenvolver um sistema ou aplicativo? · `faq.items.how_long`
3. O diagnóstico gratuito tem algum compromisso? · `faq.items.diagnosis_commitment`
4. Preciso entender de tecnologia para contratar? · `faq.items.need_tech_knowledge`

Condicionais (entram quando o dono ligar a flag):

- Como é o diagnóstico e com quem eu falo? · `faq.conditional.diagnosis_format`
- E se eu precisar mudar o escopo no meio do projeto? · `faq.conditional.scope_change`
- O código fica com a minha empresa? · `faq.conditional.code_ownership`
- O plano da Descoberta é meu se eu não seguir com a Lemamon.dev? · `faq.conditional.discovery_plan_ownership`
- Quanto tempo dura a Sprint de Descoberta? · `faq.conditional.discovery_duration` (resposta sem número, D44)
- Posso começar direto pelo desenvolvimento? · `faq.conditional.skip_discovery`
- Vocês assinam acordo de confidencialidade (NDA)? · `faq.conditional.nda`
- Como é feito o pagamento? · `faq.conditional.payment_terms`

Teto de 9 perguntas visíveis; a ordem de remoção está em `how_we_work._notes.faq_composition`.

#### 15. CTA final · `how_we_work.cta_final`

- **Título**: O primeiro passo é gratuito e leva 45 minutos
- **Texto**: Você conta o problema e recebe uma devolutiva por escrito. Se o software tem data para ficar pronto, conte na conversa: o plano mostra o que cabe até lá.

### Sprint de Descoberta (`/sprint-de-descoberta`)

Página da etapa 2, gratuita e só quando o diagnóstico mostra que é necessária (D44, 21/10/2026). Ordem conforme o BLUEPRINT §6.3.

#### 1. Hero · `discovery_sprint.hero`

- **Sobretítulo**: Etapa 2 de 4
- **Título**: Sprint de Descoberta: do problema ao plano com escopo, prazo e preço fechados
- **Subtítulo**: Sem pagar nada, você sai com o escopo priorizado e um plano com prazo e preço fechados para o desenvolvimento. Só então decide se segue.
- **Texto de apoio**: O primeiro passo é o diagnóstico gratuito de 45 minutos. Nele, a gente define com você se a Descoberta, também gratuita, é necessária.

#### Texto da imagem de compartilhamento · `discovery_sprint.og_image_headline`

- Do problema ao preço fechado

#### 2. Por que começar por aqui · `discovery_sprint.why_start_here`

- **Título**: Por que a Descoberta vem antes do desenvolvimento
- **Texto**: Sem entender o problema a fundo, qualquer preço de desenvolvimento é chute, para mais ou para menos. A Descoberta, que o mercado também chama de discovery de produto, existe para que o número que você aprova tenha base.
- **`table_caption`**: Diferenças entre começar um projeto sem e com a Sprint de Descoberta
- **Coluna 1**: Aspecto
- **Coluna 'sem'**: Sem Descoberta
- **Coluna 'com'** _(variante: só quando o dado indicado existir)_: Com Descoberta
- **Linhas**
  - **`price`**
    - **Dimensão**: Preço
    - **Sem**: Orçamento por estimativa
    - **Com**: Preço fechado sobre um escopo priorizado
  - **`scope`**
    - **Dimensão**: Escopo
    - **Sem**: Escopo discutido no meio do projeto
    - **Com**: O que entra e o que fica de fora, decidido antes
  - **`deadline`** _(no lugar de `first_screen`, o protótipo, desde a D44)_
    - **Dimensão**: Prazo
    - **Sem**: Estimado antes de conhecer o escopo
    - **Com**: Fechado no plano, junto com o preço
  - **`decision`**
    - **Dimensão**: Decisão
    - **Sem**: Projeto inteiro aprovado sobre uma estimativa
    - **Com**: Você decide se segue com escopo, prazo e preço fechados na mão

#### 3. O que você recebe · `discovery_sprint.deliverables`

- **Título**: O que você recebe
- **Introdução**: A Descoberta termina com três entregas:

#### 3a. Os 3 entregáveis · `shared.discovery_deliverables`
> Componente compartilhado.

- **`problem_understanding`**
  - **Título**: Entendimento do problema
  - **Texto**: O problema que o software precisa resolver, e por quê, registrado antes de decidir o que construir.
- **`prioritized_scope`**
  - **Título**: Escopo priorizado
  - **Texto**: O que entra primeiro e o que pode esperar, para você saber o que está contratando antes de contratar.
- **`plan`**
  - **Título**: Plano com prazo e preço fechados
  - **Texto**: O prazo e o preço da fase de desenvolvimento, já fechados, para você decidir se segue.

#### 4. Para quem é · `discovery_sprint.who_for`

- **Título**: Para quem é
- **Perfis**
  - **`problem_no_solution`**
    - **Título**: Você conhece o problema, mas não sabe o que construir
    - **Texto**: A Descoberta transforma a dor da operação em um escopo que dá para construir, orçar e acompanhar.
  - **`list_no_priority`**
    - **Título**: Você tem uma ideia, mas não sabe o que vem primeiro
    - **Texto**: Seja a primeira versão de um produto (um MVP) ou uma lista de funcionalidades, a Descoberta separa o que entra primeiro do que pode esperar.
  - **`different_quotes`**
    - **Título**: Você recebeu orçamentos que não batem entre si
    - **Texto**: Quando cada fornecedor entendeu uma coisa, não dá para comparar os números. Na Descoberta, o escopo vem escrito antes do preço, e você sabe o que o número cobre.
  - **`approve_with_partners`** _(variante: só quando o dado indicado existir)_
    - **Título**: Você precisa de um número confiável para sócios ou diretoria
    - **Texto**: Com escopo e plano por escrito, você leva aos sócios, à diretoria ou aos investidores um preço que se explica, não uma estimativa.
- **Fechamento**: Se você se reconheceu em algum destes casos, o primeiro passo leva 45 minutos e não custa nada.

#### 5. Antes e depois da Descoberta · `discovery_sprint.where_it_fits`

- **Título**: Antes e depois da Descoberta
- **`before_label`**: Antes
- **`before_text`**: Um diagnóstico gratuito de 45 minutos, com devolutiva por escrito. Nele, a gente define com você se a Descoberta é necessária e quanto ela dura.
- **Rótulo 'depois'**: Depois
- **`after_text`**: Com o plano em mãos, você decide se segue. Se seguir, começa o desenvolvimento, a primeira etapa paga, com entregas a cada 2 semanas.

#### 6. Como ela acontece · `discovery_sprint.how_it_happens`
> **Condicional:** `hasDiscoveryFormat` (descoberta.ts com formato, participantes e ritmo; a duração não é publicada, D44).

- **Título**: Como a Descoberta acontece
- **Introdução**: Como a Descoberta é organizada e quem participa. A duração é definida com você no diagnóstico.
- **Campos**
  - **`format`**: Formato
  - **`participants`**: Quem participa
  - **`rhythm`**: Ritmo

#### 7. ~~Investimento~~ · `discovery_sprint.investment`
> **Saiu em 21/10/2026 (D44):** a Descoberta é gratuita e não tem faixa de preço; `precos.descoberta` deixou de existir.

#### 8. Perguntas frequentes (título) · `discovery_sprint.faq`

- **Título**: Perguntas sobre a Sprint de Descoberta

#### 8a. Perguntas desta página

Perguntas, nesta ordem (as respostas completas estão em [Perguntas frequentes — banco central](#perguntas-frequentes--banco-central)):

1. Quanto custa a Sprint de Descoberta? · `faq.items.discovery_cost` ("Nada")
2. Toda empresa precisa da Sprint de Descoberta? · `faq.items.when_discovery`
3. Quanto tempo dura a Sprint de Descoberta? · `faq.conditional.discovery_duration` (condicional; resposta sem número)
4. Preciso seguir com a Lemamon.dev depois da Descoberta? · `faq.items.obliged_to_continue`
5. Preciso já saber o que quero? · `faq.items.need_scope_ready`

Condicionais (entram quando o dono ligar a flag):

- O plano da Descoberta é meu se eu não seguir com a Lemamon.dev? · `faq.conditional.discovery_plan_ownership`

Saíram em 21/10/2026 (D44): `faq.items.why_discovery_paid` e `faq.conditional.discovery_credit`.

#### 9. CTA final · `discovery_sprint.cta_final`

- **Título**: A Descoberta começa por uma conversa gratuita
- **Texto**: São 45 minutos de diagnóstico, com devolutiva por escrito. Se o software tem data para ficar pronto, conte na conversa: o plano mostra o que cabe até lá.
- **`already_diagnosed`**: Já fez o diagnóstico e a Descoberta ficou definida? Para combinar o início, responda pelo WhatsApp ou pelo e-mail.

### Quanto custa (`/quanto-custa`)

Página da busca nº 1 do comprador. Funciona sem números. Ordem conforme o BLUEPRINT §6.6.

#### 1. Hero · `pricing.hero`

- **Título**: Quanto custa desenvolver um sistema ou aplicativo sob medida?
- **Abertura**: O preço sai fechado antes do desenvolvimento, e nada é cobrado antes dele: o diagnóstico e a Sprint de Descoberta, quando necessária, são gratuitos. Com o preço do seu escopo em mãos, você decide se segue.

#### Texto da imagem de compartilhamento · `pricing.og_image_headline`

- Quanto custa um software sob medida?

#### 2. Faixas de referência · `pricing.ranges`
> **Condicional:** `hasPricing`. Some por inteiro sem faixas.

- **Título**: Faixas de referência de investimento

#### 3. O que define o preço · `pricing.factors`

- **Título**: O que define o preço de um software
- **Introdução**: O preço de um sistema, aplicativo ou primeira versão de um produto (MVP) acompanha o tamanho do trabalho, e o tamanho do trabalho depende destes fatores.
- **Itens**
  - **`scope_size`**
    - **Título**: Tamanho do escopo
    - **Texto**: Quantos processos, telas e funcionalidades entram na versão que vai ser construída.
  - **`user_types`**
    - **Título**: Tipos de usuário e permissões
    - **Texto**: Quem usa o sistema e o que cada perfil pode ver e fazer: equipe, gestor, cliente, fornecedor.
  - **`business_rules`**
    - **Título**: Regras de negócio e cálculos
    - **Texto**: Comissões, impostos, aprovações, vencimentos: quanto mais regra própria da sua empresa, mais trabalho.
  - **`integrations`**
    - **Título**: Integrações com outros sistemas
    - **Texto**: Cada sistema que precisa conversar com o novo, como ERP, e-commerce ou meio de pagamento, e o quanto ele permite essa conexão.
  - **`platforms`**
    - **Título**: Plataformas (web, iOS, Android)
    - **Texto**: Funcionar no navegador, no iPhone, no Android ou nos três muda o volume de trabalho.
  - **`existing_data`**
    - **Título**: Dados que precisam ser trazidos
    - **Texto**: Informações que hoje estão em planilhas ou em sistemas antigos e precisam entrar no novo.
  - **`deadline`**
    - **Título**: Prazo
    - **Texto**: Com data fixa, o plano mostra o que cabe até lá, e o preço é fechado sobre esse escopo.
- **`app_subtitle`**: E quanto custa desenvolver um aplicativo?
- **`app_intro`**: Além dos fatores acima, num aplicativo pesam:
- **`app_items`**
  - **`platforms`**: iPhone (iOS), Android ou os dois
  - **`store_publishing`**: Publicação nas lojas de aplicativos
  - **`notifications`**: Notificações no celular
  - **`offline`**: Uso sem internet
- **`app_link`**: Ver o que pesa no preço de desenvolver um aplicativo
- **Fechamento**: Você não precisa ter essas respostas para pedir o diagnóstico: a gente organiza isso com você, sem custo, no diagnóstico e, se for necessária, na Sprint de Descoberta.

#### 4. Por que a gente não dá preço por formulário · `pricing.why_not_by_form`

- **Título**: Por que a gente não dá preço por formulário
- **Texto**: Um formulário não enxerga as regras do seu negócio nem os sistemas que precisam conversar. O número que sai dele costuma vir com margem de segurança ou crescer depois em cobrança extra. Por isso, as 6 perguntas do nosso pedido de diagnóstico terminam num resumo do seu projeto, não num preço.

#### 5. Como você chega a um preço fechado · `pricing.how_price_closes`

- **Título**: Como você chega a um preço fechado
- **Rótulo de custo**: Custo
- **Etapas**
  - **Diagnóstico**
    - **Custo**: Gratuito
    - **Texto**: 45 minutos de conversa e uma devolutiva por escrito.
  - **Sprint de Descoberta**
    - **Custo**: Gratuita, quando necessária
    - **Texto**: Termina no plano, com prazo e preço fechados. Com ele em mãos, você decide se segue.
    - **Link**: Ver o que a Sprint de Descoberta entrega
  - **Desenvolvimento**
    - **Custo**: Preço fechado no plano, antes de começar
    - **Texto**: Software funcionando, com entregas a cada 2 semanas.
  - **Sustentação e evolução**
    - **Custo**: Valor combinado antes de começar
    - **Texto**: Depois que o software entra no ar, a Lemamon.dev pode cuidar dele e evoluí-lo conforme a sua operação muda.

#### 6. Como comparar propostas de software · `pricing.how_to_compare`
> A pergunta 'O que acontece se o escopo mudar?' (`questions.scope_change`) só aparece com `confirmacoes.escopoMudanca`. Sem a flag, a régua fica com 5 perguntas.

- **Título**: Como comparar propostas de desenvolvimento de software
- **Introdução**: Se você está avaliando mais de um fornecedor, faça estas perguntas a todos eles. As respostas dizem mais do que o valor no fim da proposta, e as da Lemamon.dev estão logo abaixo de cada pergunta.
- **`questions`**
  - **`out_of_scope`**
    - **Pergunta**: O que está fora do escopo?
    - **Por quê**: Uma proposta que não diz o que ficou de fora não dá para comparar com outra.
    - **`lemamon`**: Na Lemamon.dev: o escopo vem por escrito antes do desenvolvimento, com o que entra, o que fica de fora e o que pode esperar.
  - **`fixed_or_hourly`**
    - **Pergunta**: O preço é fechado ou cobrado por hora?
    - **Por quê**: A resposta mostra se o valor pode mudar no meio do projeto.
    - **`lemamon`**: Na Lemamon.dev: fechado no plano, antes do desenvolvimento.
  - **`when_working`**
    - **Pergunta**: Quando eu vejo software funcionando?
    - **Por quê**: Progresso é software que você consegue usar, não relatório de andamento.
    - **`lemamon`**: Na Lemamon.dev: a cada 2 semanas, durante o desenvolvimento, para você usar.
  - **`scope_change`**
    - **Pergunta**: O que acontece se o escopo mudar?
    - **Por quê**: Mudança acontece. Pergunte antes de assinar como ela é tratada e como afeta prazo e preço.
    - **`lemamon_with_scope_change`** _(variante: só quando o dado indicado existir)_: Na Lemamon.dev: a mudança aparece cedo, nas entregas a cada 2 semanas, e escopo, prazo e preço são combinados de novo com você antes de seguir.
  - **`after_launch`**
    - **Pergunta**: Quem cuida depois do lançamento?
    - **Por quê**: Software no ar continua precisando de cuidado. Saiba quem cuida antes de assinar.
    - **`lemamon`**: Na Lemamon.dev: se você quiser, a gente segue cuidando do sistema no ar, na sustentação e evolução contínua, com valor combinado com você antes de começar.
  - **`before_paying`**
    - **Pergunta**: O que eu recebo antes de pagar pelo desenvolvimento?
    - **Por quê**: Se nada estiver por escrito antes do desenvolvimento, você aprova o projeto no escuro.
    - **`lemamon`**: Na Lemamon.dev: tudo o que vem antes do desenvolvimento é gratuito. Do diagnóstico, a devolutiva por escrito. Da Sprint de Descoberta, quando necessária: entendimento do problema, escopo priorizado e plano com prazo e preço fechados.
- **Fechamento**: Quer ver essas respostas aplicadas ao seu projeto? O primeiro passo leva 45 minutos.

#### 7. Perguntas frequentes (título) · `pricing.faq`

- **Título**: Perguntas sobre preço

#### 7a. Perguntas desta página

Perguntas, nesta ordem (as respostas completas estão em [Perguntas frequentes — banco central](#perguntas-frequentes--banco-central)):

1. O orçamento é gratuito? · `faq.items.free_estimate`
2. Pago alguma coisa antes do desenvolvimento? · `faq.items.pay_before_development`
3. Por que não existe tabela de preços? · `faq.items.no_price_table`
4. Consigo ter uma ideia de valor antes de conversar? · `faq.items.reference_before_talking`
5. Preciso seguir com a Lemamon.dev depois da Descoberta? · `faq.items.obliged_to_continue`

Condicionais (entram quando o dono ligar a flag):

- E se eu precisar mudar o escopo no meio do projeto? · `faq.conditional.scope_change`
- O plano da Descoberta é meu se eu não seguir com a Lemamon.dev? · `faq.conditional.discovery_plan_ownership`
- Como é feito o pagamento? · `faq.conditional.payment_terms`
- Vocês emitem nota fiscal? · `faq.conditional.invoice`

#### 8. CTA final · `pricing.cta_final`

- **Título**: Do diagnóstico gratuito ao preço fechado do desenvolvimento
- **Texto**: São 45 minutos de conversa e uma devolutiva por escrito. Se o software tem data para ficar pronto, conte na conversa: o plano mostra o que cabe até lá.

### Perguntas frequentes — banco central

As perguntas usadas em mais de uma página e todas as condicionais. Cada página escolhe as suas (ver a lista em cada página).

#### Perguntas que sempre podem aparecer · `faq.items`

- **`how_much`**
  - **Pergunta**: Quanto custa um projeto de software?
  - **Resposta**: Depende do que o software precisa fazer. O diagnóstico e a Sprint de Descoberta, quando necessária, são gratuitos. Antes do desenvolvimento, você recebe o preço fechado e só então decide se segue. Tem um valor em mente? Indique a faixa no pedido de diagnóstico.
  - **`answer_with_pricing_suffix`** _(só com faixas de preço preenchidas)_: Para se planejar, veja as faixas de referência de investimento.
- **`how_long`**
  - **Pergunta**: Quanto tempo leva para desenvolver um sistema ou aplicativo?
  - **Resposta**: Depende do escopo, por isso o prazo sai fechado antes do desenvolvimento, junto com o preço. Tem uma data, como um lançamento ou um piloto? Conte no diagnóstico: o plano mostra o que dá para entregar até lá.
- **`pay_before_development`** _(no lugar de `why_discovery_paid`, D44, 21/10/2026)_
  - **Pergunta**: Pago alguma coisa antes do desenvolvimento?
  - **Resposta**: Não. O diagnóstico e a Sprint de Descoberta, quando ela é necessária, são gratuitos. As etapas pagas são o desenvolvimento, com escopo, prazo e preço fechados antes de começar, e a sustentação, se você quiser.
- **`discovery_cost`**
  - **Pergunta**: Quanto custa a Sprint de Descoberta?
  - **Resposta**: Nada. A Sprint de Descoberta é gratuita, como o diagnóstico. Você só começa a pagar se aprovar o desenvolvimento, com escopo, prazo e preço fechados.
- **`when_discovery`** _(novo, D44)_
  - **Pergunta**: Toda empresa precisa da Sprint de Descoberta?
  - **Resposta**: Não. Ela só acontece quando o diagnóstico gratuito mostra que é necessária, e isso é definido com você. Quando não é, o escopo, o prazo e o preço do desenvolvimento são fechados do mesmo jeito, antes de começar.
- **`diagnosis_commitment`**
  - **Pergunta**: O diagnóstico gratuito tem algum compromisso?
  - **Resposta**: Não. São 45 minutos de conversa e uma devolutiva por escrito. Depois, você decide se quer seguir.
- **`need_tech_knowledge`**
  - **Pergunta**: Preciso entender de tecnologia para contratar?
  - **Resposta**: Não. Você traz o problema na linguagem do seu negócio, e ele vira, com você, um escopo priorizado: o que entra primeiro e o que pode esperar.
- **`how_follow_progress`**
  - **Pergunta**: Como eu acompanho o andamento?
  - **Resposta**: Usando o próprio software. A cada 2 semanas você recebe uma parte funcionando para usar e dar o seu retorno. Se algo sair do previsto, você percebe cedo, nas entregas, e não só no fim do projeto.
- **`after_launch`**
  - **Pergunta**: E depois que o sistema entra no ar?
  - **Resposta**: A Lemamon.dev pode seguir cuidando do que está rodando e evoluindo o sistema conforme a sua operação muda. É a sustentação e evolução contínua, com formato e valor combinados com você antes de começar.
- **`what_happens_in_diagnosis`**
  - **Pergunta**: O que acontece no diagnóstico gratuito?
  - **Resposta**: Uma conversa de 45 minutos para entender o seu caso: o problema, quem sofre com ele e o que já foi tentado. Não precisa de preparação técnica. Depois, você recebe uma devolutiva por escrito.
- **`need_scope_ready`**
  - **Pergunta**: Preciso já saber o que quero?
  - **Resposta**: Não. No diagnóstico gratuito, você conta o problema do seu jeito. Se faltar organizar o que você precisa e decidir o que entra primeiro, esse é o trabalho da Sprint de Descoberta, que também é gratuita.
- **`obliged_to_continue`**
  - **Pergunta**: Preciso seguir com a Lemamon.dev depois da Descoberta?
  - **Resposta**: Não. A Descoberta é gratuita e, com o plano em mãos, já com prazo e preço fechados, você decide se segue para o desenvolvimento.
- **`free_estimate`**
  - **Pergunta**: O orçamento é gratuito?
  - **Resposta**: Sim. O diagnóstico de 45 minutos, com devolutiva por escrito, é gratuito. A Sprint de Descoberta, quando necessária, também, e fecha o preço do desenvolvimento antes de você decidir se segue. Você só começa a pagar se aprovar o desenvolvimento.
- **`no_price_table`**
  - **Pergunta**: Por que não existe tabela de preços?
  - **Resposta**: Porque dois sistemas com o mesmo nome podem ter escopos muito diferentes. Uma tabela viraria uma média que não serve para o seu caso, ou um “a partir de” que cresce depois. Por isso o preço do desenvolvimento é fechado sobre o seu escopo, antes de ele começar.
  - **`question_with_pricing`** _(só com faixas de preço preenchidas)_: Por que as faixas não são o preço do meu projeto?
  - **`answer_with_pricing`** _(só com faixas de preço preenchidas)_: Porque dois sistemas com o mesmo nome podem ter escopos muito diferentes. As faixas dão a ordem de grandeza para você se planejar; o preço do desenvolvimento do seu projeto é fechado sobre o seu escopo, antes de ele começar.
- **`reference_before_talking`**
  - **Pergunta**: Consigo ter uma ideia de valor antes de conversar?
  - **`answer_with_pricing`** _(só com faixas de preço preenchidas)_: Sim. As faixas de referência de investimento ajudam a se planejar. O preço do desenvolvimento é fechado antes de ele começar.
  - **`answer_without_pricing`**: Um número para o seu caso sai depois de entender o escopo. O que dá para saber já: os 7 fatores desta página mostram o que encarece ou barateia o projeto. E até o preço fechado do desenvolvimento chegar por escrito, você não paga nada. Tem um valor em mente? Indique a faixa no pedido.

#### Perguntas condicionais · `faq.conditional`
> **Condicional:** cada pergunta tem a sua flag em config/confirmacoes.ts (ex.: `escopoMudanca`, `codigoProprietario`, `notaFiscal`, `outrasCidades`, `nda`, `sistemaTerceiros`, `semDescoberta`, `duracaoDescoberta`, `planoDoCliente`, `migracaoDados`, `formatoDiagnostico`, `pagamento`). Sem a flag, a pergunta não aparece. `descobertaAbatida` e `descobertaUnicoCusto` saíram em 21/10/2026 (D44: a Descoberta é gratuita).

- **`diagnosis_format`**
  - **Pergunta**: Como é o diagnóstico e com quem eu falo?
  - **`answer_with_format`** _(variante: só quando o dado indicado existir)_: O diagnóstico de 45 minutos é {formato_diagnostico}, com {participantes_diagnostico}. Depois, você recebe uma devolutiva por escrito.
- **`scope_change`**
  - **Pergunta**: E se eu precisar mudar o escopo no meio do projeto?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Pode acontecer, e as entregas a cada 2 semanas existem para você perceber cedo o que precisa mudar. Se a mudança mexer no que foi combinado, escopo, prazo e preço são combinados de novo com você antes de seguir.
- **`code_ownership`**
  - **Pergunta**: O código fica com a minha empresa?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Sim. O código desenvolvido para o seu projeto é da sua empresa, e isso fica escrito no contrato. Se um dia quiser seguir com outro fornecedor, o código está com você.
  - **`answer_draft_alt`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Sim. A propriedade do código desenvolvido para o seu projeto passa para a sua empresa conforme os pagamentos combinados em contrato são feitos. Se um dia quiser seguir com outro fornecedor, o código pago está com você.
- **`invoice`**
  - **Pergunta**: Vocês emitem nota fiscal?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Sim. A Lemamon.dev emite nota fiscal de serviço para todas as etapas pagas.
  - **`question_with_company_data`** _(variante: só quando o dado indicado existir)_: Vocês têm CNPJ e emitem nota fiscal?
  - **`answer_with_company_data`** _(variante: só quando o dado indicado existir)_: Sim. A Lemamon.dev emite nota fiscal de serviço para todas as etapas pagas, e o CNPJ está no rodapé do site.
- **`payment_terms`**
  - **Pergunta**: Como é feito o pagamento?
  - **`answer_with_terms`** _(variante: só quando o dado indicado existir)_: {condicoes_pagamento}
- **`other_cities`**
  - **Pergunta**: Vocês atendem empresas de outras cidades?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Sim. A Lemamon.dev fica em São Paulo, SP, e atende empresas de outras cidades do Brasil a distância, com o mesmo processo: diagnóstico, Sprint de Descoberta quando necessária e entregas a cada 2 semanas.
- **`nda`**
  - **Pergunta**: Vocês assinam acordo de confidencialidade (NDA)?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Sim. Se o seu projeto pede sigilo, a gente assina o acordo antes de você compartilhar os detalhes. É só pedir pelo WhatsApp ou pelo e-mail lemamon.dev@gmail.com.
- **`third_party_system`**
  - **Pergunta**: Vocês cuidam de sistemas que outra empresa desenvolveu?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Sim, depois de uma avaliação. Antes de assumir, a gente precisa entender o que está no ar, onde ele roda e o que pede atenção. Essa avaliação começa no diagnóstico gratuito de 45 minutos, e o que vem depois é combinado com você antes de começar.
- **`skip_discovery`**
  - **Pergunta**: Posso começar direto pelo desenvolvimento?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag; texto alinhado à D44)_: Em alguns casos. A necessidade da Sprint de Descoberta é definida com você no diagnóstico gratuito. Quando ela não é necessária, a proposta de desenvolvimento já vem com escopo, prazo e preço fechados. Quando é, a Descoberta, também gratuita, vem antes.
- **`discovery_duration`**
  - **Pergunta**: Quanto tempo dura a Sprint de Descoberta?
  - **`answer_draft`** _(no ar com `duracaoDescoberta`; sem número, D44)_: Depende do tamanho do problema. A necessidade e a duração da Descoberta são definidas com você no diagnóstico gratuito.
- **`discovery_plan_ownership`**
  - **Pergunta**: O plano da Descoberta é meu se eu não seguir com a Lemamon.dev?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag; `planoDoCliente` continua `false`)_: Sim. Tudo o que a Descoberta entrega fica com você: entendimento do problema, escopo priorizado e plano. O escopo e o plano servem de base para seguir com a Lemamon.dev ou para pedir proposta a outro fornecedor.
- **`data_migration`**
  - **Pergunta**: Vocês migram os dados da planilha ou do sistema atual?
  - **`answer_draft`** _(rascunho: só vai ao ar quando o dono aprovar a flag)_: Sim. Antes do desenvolvimento, a gente define com você quais dados precisam vir das planilhas ou do sistema antigo e como isso vai acontecer. A migração entra no escopo, prazo e preço fechados.

### Serviços — hub (`/servicos`)

Ordem conforme o BLUEPRINT §6.4.

#### Hub de serviços · `services.hub`

- **Hero**
  - **Título**: Serviços de desenvolvimento de software para empresas
  - **Subtítulo**: Sistemas web, aplicativos, integrações e MVPs com escopo, prazo e preço fechados antes do desenvolvimento. Depois, sustentação e evolução.
- **`list`**
  - **`for_when_label`**: Para quando…
  - **Itens**
    - **`web_systems`**
      - **Nome**: Sistemas web
      - **`for_when`**: o jeito que a sua empresa trabalha não cabe em software pronto.
      - **Exemplos**:
        1. Sistemas de gestão
        2. Painéis de indicadores
        3. Portal do cliente
    - **`mobile_apps`**
      - **Nome**: Aplicativos
      - **`for_when`**: seus clientes ou sua equipe precisam resolver pelo celular.
      - **Exemplos**:
        1. Reservas e agendamentos
        2. Delivery e marketplace
        3. App para a equipe
    - **`integrations`**
      - **Nome**: Integrações e automação
      - **`for_when`**: a mesma informação é digitada mais de uma vez.
      - **Exemplos**:
        1. ERP e e-commerce conectados
        2. Meios de pagamento
        3. Chatbots e IA
    - **`mvp`**
      - **Nome**: MVP e produtos digitais
      - **`for_when`**: uma ideia precisa virar a primeira versão nas mãos de usuários reais.
      - **Exemplos**:
        1. Plataforma web ou app
        2. Marketplace para validar demanda
        3. Primeira versão com IA
    - **Sustentação e evolução**
      - **Nome**: Sustentação e evolução
      - **`for_when`**: o sistema entrou no ar e precisa de manutenção e evolução contínua.
      - **Exemplos**:
        1. Correções e atualizações
        2. Melhorias contínuas
        3. Novas funcionalidades
- **`same_method`**
  - **Título**: Qualquer que seja o projeto, o mesmo método
  - **`price_link`**: Ver como o preço é fechado
- **CTA final**
  - **Título**: Não sabe qual é o seu caso?
  - **Texto**: O diagnóstico gratuito serve para isso: 45 minutos de conversa sobre o seu problema e uma devolutiva por escrito.

> Investimento no hub: **condicional** (`hasPricing`), texto em `shared.investment`.

### Serviços — textos comuns às 5 páginas

Rótulos e frases que o template usa em todas as páginas de serviço. `{servico}` e semelhantes são preenchidos por página.

#### Template · `services.template`

- **Sobretítulo**: Serviço
- **`signals_title`**: Faz sentido quando…
- **`signals_cta_lead`**: Reconheceu o seu caso?
- **`examples_title`**: Exemplos do que dá para construir
- **`examples_cta_lead`**: Não viu o seu caso na lista?
- **`how_it_works_title`**: Como funciona um projeto de {servico_frase}
- **`discovery_defines_title`**: O que a Sprint de Descoberta define neste tipo de projeto
- **`engineering_link`**: Ver como a gente constrói
- **`price_factors_closing`**: A gente pesa cada ponto no seu caso e fecha prazo e preço antes do desenvolvimento, sem cobrar nada até lá.
- **`price_factors_cta_lead`**: Você não precisa ter essas respostas para conversar:
- **`price_factors_link`**: Ver o que define o preço de um projeto
- **`price_factors_link_with_pricing`** _(só com faixas de preço preenchidas)_: Ver quanto custa um projeto de software
- **`investment_note`**: Referência, não proposta.
- **`price_answer_link`**: Ver as faixas de referência deste serviço
- **`related_cases_title`**: Cases de {servico_frase}
- **`faq_title`**: Perguntas sobre um projeto de {servico_frase}
- **`faq_cta_lead`**: Ficou uma dúvida que não está aqui?
- **`profiles_line`**: Quer conferir antes de conversar? Veja o que a gente publica:
- **`other_services_title`**: Outros serviços

### Serviço: Sistemas web (`/servicos/sistemas-web`)

#### Sistemas web · `services.web_systems`

- **Nome**: Sistemas web
- **`name_in_sentence`**: sistema web
- **`page_name_in_sentence`**: sistemas web
- **Título (H1)**: Desenvolvimento de sistemas web sob medida para empresas
- **Subtítulo**: Sistemas de gestão, CRM, painéis e portais do jeito que a sua empresa trabalha, com escopo, prazo e preço fechados antes do desenvolvimento.
- **Sinais ('faz sentido quando…')**:
  1. A planilha virou o sistema da empresa, e só uma pessoa sabe mexer nela.
  2. Pedidos, clientes e prazos estão espalhados entre e-mails, cadernos e conversas.
  3. O software pronto não segue o seu processo, e a equipe vive dando um jeito por fora.
  4. Para ver os números da operação, alguém precisa montar relatório na mão.
  5. O cliente liga para saber do pedido, e alguém larga o que está fazendo para responder.
- **Exemplos**
  - **1.**
    - **Título**: Gestão financeira e operacional (ERP)
    - **Texto**: Contas a pagar e a receber, fluxo de caixa, compras e relatórios num lugar só, sem planilha paralela.
  - **2.**
    - **Título**: Gestão de clientes (CRM)
    - **Texto**: Contatos, negociações e histórico de cada cliente à vista de quem vende e de quem atende.
  - **3.**
    - **Título**: Estoque e pedidos
    - **Texto**: Entrada, saída e reserva de produtos ligadas aos pedidos, para uma distribuidora, por exemplo, saber o que tem disponível antes de vender.
  - **4.**
    - **Título**: Painéis de indicadores
    - **Texto**: Vendas, estoque e financeiro num painel atualizado, para decidir sem esperar o fechamento do mês.
  - **5.**
    - **Título**: Painel administrativo
    - **Texto**: Onde a sua equipe cadastra, aprova e configura o dia a dia do sistema.
  - **6.**
    - **Título**: Portal ou área do cliente
    - **Texto**: Pedidos, documentos e status numa área só para o seu cliente (o inquilino de uma imobiliária, por exemplo), sem idas e vindas por e-mail.
  - **7.**
    - **Título**: Plataforma de treinamento e cursos
    - **Texto**: Cursos e trilhas para a sua equipe ou para os seus clientes, com acesso e progresso controlados.
- **Etapas do método nesta página**
  - **Diagnóstico**: Você mostra como o processo funciona hoje e onde ele trava.
  - **Sprint de Descoberta**: Módulos priorizados e plano com prazo e preço fechados.
  - **Desenvolvimento**: A cada 2 semanas, uma parte do sistema funcionando para a sua equipe usar.
  - **Sustentação e evolução**: Sustentação e evolução, combinadas com você, para o sistema acompanhar a operação.
- **O que a Descoberta define**:
  1. Quais processos entram primeiro
  2. Quem acessa o quê: perfis e permissões
  3. Os relatórios essenciais para a gestão
  4. As integrações necessárias com outros sistemas
- **Título 'o que pesa no preço'**: O que pesa no preço de um sistema
- **O que pesa no preço**
  - **1.**
    - **Título**: Módulos e processos
    - **Texto**: Cada processo que entra vira telas e regras próprias. Mais processos, mais escopo.
  - **2.**
    - **Título**: Tipos de usuário e permissões
    - **Texto**: Quando gerente, vendedor e cliente veem coisas diferentes, cada perfil precisa ser pensado e testado.
  - **3.**
    - **Título**: Regras de negócio e cálculos
    - **Texto**: Comissão, preço por cliente, impostos, exceções: quanto mais regras próprias, mais trabalho para acertar cada caso.
  - **4.**
    - **Título**: Integrações com outros sistemas
    - **Texto**: Conectar com o sistema que você já usa, o e-commerce ou os meios de pagamento depende do que cada um deles permite.
  - **5.**
    - **Título**: Dados de planilhas ou sistemas antigos
    - **Texto**: Quando o histórico precisa vir junto, os dados têm de ser organizados e conferidos antes de entrar.
  - **6.**
    - **Título**: Relatórios
    - **Texto**: Cada relatório depende de dados confiáveis por trás. Quanto mais relatórios, e mais fontes de dados cada um cruza, maior o esforço.
- **Perguntas frequentes**
  - **`custom_vs_ready`**
    - **Pergunta**: Sistema sob medida ou software pronto?
    - **Resposta**: Se um software pronto atende o seu processo, ele costuma ser o caminho mais barato. Sob medida faz sentido quando o processo é o que diferencia a sua empresa, ou quando o pronto obriga a equipe a dar um jeito por fora dele. O diagnóstico gratuito ajuda a decidir.
  - **`start_with_part`** _(variante: só quando o dado indicado existir)_
    - **Pergunta**: Dá para começar por uma parte do sistema?
    - **Resposta**: Dá. A Descoberta prioriza o escopo, e as entregas a cada 2 semanas seguem essa ordem: o que mais pesa na operação vem primeiro.
  - **`price`**
    - **Pergunta**: Quanto custa um sistema sob medida?
    - **Resposta**: Depende de quantos processos entram, dos perfis de acesso, das regras, das integrações e dos relatórios. O preço do sistema sai fechado antes do desenvolvimento, e nada é cobrado antes dele: o diagnóstico e a Sprint de Descoberta, quando necessária, são gratuitos. Se você já tem um valor em mente, conte no diagnóstico: o escopo priorizado mostra o que cabe nele.
  - **`how_long_system`**
    - **Pergunta**: Quanto tempo leva para desenvolver um sistema?
    - **Resposta**: O prazo sai fechado antes do desenvolvimento, junto com o preço, e depende do escopo. Se o sistema precisa estar no ar numa data, conte no diagnóstico: ela entra no plano, e você sabe antes de começar o que cabe até lá.
- **Linha em 'outros serviços'**: Gestão, painéis e portais feitos para o jeito que a sua empresa trabalha.
- **Texto da imagem de compartilhamento**: Sistema sob medida com preço fechado
- **CTA final**
  - **Título**: Conte o processo que precisa virar sistema
  - **Texto**: Enquanto o processo vive na planilha, ele depende de uma pessoa. Comece pelo diagnóstico gratuito de 45 minutos: a gente entende o seu processo com você, e você recebe uma devolutiva por escrito.

### Serviço: Aplicativos (`/servicos/aplicativos`)

#### Aplicativos · `services.mobile_apps`

- **Nome**: Aplicativos
- **`name_in_sentence`**: aplicativo
- **`page_name_in_sentence`**: aplicativos
- **Título (H1)**: Desenvolvimento de aplicativos sob medida para empresas
- **Subtítulo**: Um app para seus clientes ou sua equipe, com escopo, prazo e preço fechados antes do desenvolvimento e entregas a cada 2 semanas.
- **Sinais ('faz sentido quando…')**:
  1. Seus clientes já pedem para resolver pelo celular.
  2. A equipe em campo anota no papel ou no WhatsApp e digita tudo depois.
  3. Pedidos, reservas ou agendamentos chegam por mensagem e se perdem.
  4. Você quer lançar um produto que vive no celular.
  5. Você sabe o problema que o app precisa resolver, mas não por onde começar.
- **Exemplos**
  - **1.**
    - **Título**: Reservas e agendamentos
    - **Texto**: Consultas, aulas, passeios ou serviços marcados pelo app, sem ida e volta de mensagem.
  - **2.**
    - **Título**: Transporte e delivery
    - **Texto**: Pedido, rota e status da entrega acompanhados por quem pede e por quem entrega.
  - **3.**
    - **Título**: E-commerce e marketplace
    - **Texto**: A sua loja ou vários vendedores no mesmo app, com catálogo, carrinho e pagamento.
  - **4.**
    - **Título**: App para processos internos
    - **Texto**: Checklists, vistorias e ordens de serviço feitos no celular, direto no sistema, em vez de papel.
  - **5.**
    - **Título**: App de comunidade e relacionamento
    - **Texto**: Um espaço próprio para os seus clientes ou membros receberem novidades, conversarem e participarem.
- **`common_features_title`**: Recursos comuns em um app
- **`common_features`**:
  1. Notificações no celular
  2. Pagamento e integrações
  3. Painel administrativo
- **Etapas do método nesta página**
  - **Diagnóstico**: Quem vai usar o app, onde e para resolver o quê.
  - **Sprint de Descoberta**: O que o app faz primeiro e plano com prazo e preço fechados.
  - **Desenvolvimento**: A cada 2 semanas, uma versão funcionando para você instalar e testar no celular.
  - **Sustentação e evolução**: Atualizações e melhorias depois do lançamento, conforme o uso real.
- **O que a Descoberta define**:
  1. iOS (iPhone), Android ou os dois
  2. O que fica no app e o que fica no painel da sua equipe
  3. Quais notificações o app envia e quando
  4. Se a publicação nas lojas faz parte do escopo
- **Título 'o que pesa no preço'**: O que pesa no preço de um aplicativo
- **O que pesa no preço**
  - **1.**
    - **Título**: Uma ou duas plataformas
    - **Texto**: iOS e Android têm regras e aparelhos próprios para testar. Atender os dois amplia o trabalho.
  - **2.**
    - **Título**: Telas e fluxos
    - **Texto**: Cada caminho que o usuário percorre, do cadastro ao pagamento, é desenhado, construído e testado.
  - **3.**
    - **Título**: Login e tipos de usuário
    - **Texto**: Cliente, entregador e administrador, por exemplo, veem telas diferentes. Cada perfil é construído e testado.
  - **4.**
    - **Título**: Integrações
    - **Texto**: Pagamento, mapas e os sistemas da sua empresa: cada conexão depende do que o outro lado permite.
  - **5.**
    - **Título**: Notificações
    - **Texto**: Avisos automáticos precisam de regras: quem recebe, quando e por qual motivo.
  - **6.**
    - **Título**: Painel administrativo
    - **Texto**: Alguém vai cadastrar produtos, aprovar pedidos ou ver relatórios. Esse painel também é construído.
  - **7.**
    - **Título**: Uso sem internet
    - **Texto**: Quando o app precisa funcionar sem sinal e enviar os dados quando a conexão voltar, a construção fica mais trabalhosa.
- **Perguntas frequentes**
  - **`app_or_web`**
    - **Pergunta**: Precisa ser app ou um sistema web resolve?
    - **Resposta**: Uso no celular, em campo ou pelo seu cliente final tende a pedir app. Uso no escritório, no computador, costuma ser bem atendido por um sistema web. O diagnóstico gratuito ajuda a decidir.
  - **`ios_android`**
    - **Pergunta**: iOS, Android ou os dois?
    - **Resposta**: Dá para atender os dois. A escolha é feita com você antes do desenvolvimento, a partir de quem vai usar o app e de quais aparelhos essas pessoas têm, porque cada plataforma a mais amplia a construção e os testes.
  - **`store_publishing`**
    - **Pergunta**: Vocês publicam o app nas lojas?
    - **Resposta**: A publicação na App Store e no Google Play pode fazer parte do escopo. Um app só para uso da sua equipe, por exemplo, pode não precisar ficar aberto ao público nas lojas. Isso é definido com você antes do desenvolvimento, junto com o resto do escopo.
  - **`price`**
    - **Pergunta**: Quanto custa desenvolver um aplicativo?
    - **Resposta**: Depende principalmente das plataformas (iOS, Android ou as duas), das telas e fluxos do app e das integrações, como pagamento e mapas. O preço do app sai fechado antes do desenvolvimento, e nada é cobrado antes dele: o diagnóstico e a Sprint de Descoberta, quando necessária, são gratuitos. Se já existe um orçamento para o app, conte no diagnóstico.
  - **`how_long_app`**
    - **Pergunta**: Quanto tempo leva para desenvolver um aplicativo?
    - **Resposta**: O prazo sai fechado antes do desenvolvimento, junto com o preço, e depende do escopo. Se o app tem data de lançamento, conte no diagnóstico: a data entra no plano, e você sabe antes do desenvolvimento o que dá para ter pronto até lá.
- **Linha em 'outros serviços'**: Apps para seus clientes ou sua equipe resolverem pelo celular.
- **Texto da imagem de compartilhamento**: Aplicativo sob medida com preço fechado
- **CTA final**
  - **Título**: Conte o que o seu app precisa resolver
  - **Texto**: No diagnóstico gratuito de 45 minutos, a gente entende quem vai usar o app, para quê e até quando ele precisa estar no ar. Você recebe uma devolutiva por escrito.

### Serviço: Integrações e automação (`/servicos/integracoes`)

#### Integrações e automação · `services.integrations`

- **Nome**: Integrações e automação
- **`name_in_sentence`**: integração e automação
- **`page_name_in_sentence`**: integrações e automação
- **Título (H1)**: Integração de sistemas e automação de processos
- **Subtítulo**: Seus sistemas conversando entre si e o trabalho repetitivo automatizado, com escopo, prazo e preço fechados antes do desenvolvimento.
- **Sinais ('faz sentido quando…')**:
  1. A mesma informação é digitada em mais de um sistema, todo dia.
  2. O pedido do e-commerce não chega sozinho no sistema de gestão (ERP).
  3. O time de tecnologia está tomado, e a integração nunca sai da fila.
  4. A equipe responde às mesmas perguntas no WhatsApp o dia inteiro.
  5. Vendas e financeiro chegam a números diferentes para o mesmo mês.
- **Exemplos**
  - **1.**
    - **Título**: Sistemas que você já usa, conectados
    - **Texto**: ERP e e-commerce, por exemplo: pedido, estoque e nota fiscal passam de um para o outro sem redigitação.
  - **2.**
    - **Título**: Meios de pagamento
    - **Texto**: Cobrança, confirmação de pagamento e baixa no financeiro sem conferência manual.
  - **3.**
    - **Título**: Ferramentas de marketing e CRM
    - **Texto**: Contatos e vendas sincronizados entre o CRM, onde fica a gestão de clientes, e as ferramentas de marketing.
  - **4.**
    - **Título**: Automação de tarefas repetitivas
    - **Texto**: Relatórios, cadastros, avisos e conferências que hoje alguém faz na mão, rodando sozinhos.
  - **5.**
    - **Título**: Chatbot de atendimento, vendas ou uso interno
    - **Texto**: Respostas para as perguntas que se repetem, no site ou no WhatsApp, passando para uma pessoa quando precisa.
  - **6.**
    - **Título**: IA para automação e análise de dados
    - **Texto**: Classificar pedidos, ler documentos ou resumir dados para a equipe decidir com a informação pronta.
- **Etapas do método nesta página**
  - **Diagnóstico**: Quais sistemas você usa, o que é digitado duas vezes e onde o trabalho manual dói.
  - **Sprint de Descoberta**: Escopo priorizado do que cada sistema troca, e plano com prazo e preço fechados.
  - **Desenvolvimento**: A cada 2 semanas, uma parte da integração funcionando, que a sua equipe já pode usar.
  - **Sustentação e evolução**: Se você quiser, a gente ajusta a integração quando um dos sistemas mudar.
- **O que a Descoberta define**:
  1. Quais sistemas entram e o que cada um permite
  2. Em que direção e com que frequência os dados circulam
  3. O que acontece quando um dos lados falha
  4. Onde a integração roda e quem acessa os dados
- **Título 'o que pesa no preço'**: O que pesa no preço de uma integração
- **O que pesa no preço**
  - **1.**
    - **Título**: Quantidade de sistemas
    - **Texto**: Cada sistema a mais é uma conexão a mais para construir, testar e manter.
  - **2.**
    - **Título**: Se os sistemas permitem conexão (API)
    - **Texto**: API é a porta de conexão de um sistema. Com ela aberta e bem documentada, a integração fica mais simples; sem ela, é preciso outro caminho, como troca de arquivos, e isso costuma dar mais trabalho.
  - **3.**
    - **Título**: Volume e frequência dos dados
    - **Texto**: Atualizar no fim do dia (em lote) costuma ser mais simples do que sincronizar cada pedido na hora (em tempo real). E quanto mais dados passam, mais a integração precisa aguentar.
  - **4.**
    - **Título**: Regras para transformar os dados
    - **Texto**: Quando código de produto, imposto ou status têm formatos diferentes em cada sistema, a integração precisa de regras para traduzir de um formato para o outro.
  - **5.**
    - **Título**: Tratamento de falhas e reprocessamento
    - **Texto**: Se um sistema sai do ar, a integração precisa guardar o que não passou e reenviar depois, sem duplicar o pedido.
  - **6.**
    - **Título**: Painel de acompanhamento
    - **Texto**: Uma tela para ver o que foi sincronizado, o que falhou e o que foi reenviado. Essa tela também é construída.
- **Perguntas frequentes**
  - **`integrate_existing`**
    - **Pergunta**: Dá para integrar com o sistema que eu já uso?
    - **Resposta**: Depende do que ele permite. Com API (a porta de conexão de um sistema), a integração costuma ser mais simples; sem ela, às vezes há outro caminho, como troca de arquivos entre os sistemas. Leve o nome dos sistemas ao diagnóstico gratuito: a Descoberta confirma o que cada um permite antes de fechar escopo, prazo e preço.
  - **`integrate_or_replace`**
    - **Pergunta**: Vale integrar ou trocar de sistema?
    - **Resposta**: Se o sistema atual resolve a maior parte do trabalho, integrar costuma sair mais barato do que trocar. Quando ele trava a operação, trocar pode valer mais. O diagnóstico gratuito existe para essa decisão.
  - **`price`**
    - **Pergunta**: Quanto custa uma integração de sistemas?
    - **Resposta**: Depende de quantos sistemas entram, do que cada um permite e de os dados passarem uma vez por dia ou a cada pedido. O preço da integração sai fechado antes do desenvolvimento, depois de confirmar cada conexão. Nada é cobrado antes disso: o diagnóstico e a Sprint de Descoberta, quando necessária, são gratuitos. Se você já tem um valor em mente, conte no diagnóstico.
  - **`how_long_integration`**
    - **Pergunta**: Quanto tempo leva uma integração de sistemas?
    - **Resposta**: O prazo sai fechado antes do desenvolvimento, junto com o preço, depois de confirmar o que cada sistema permite. Se há uma data, como a troca de um sistema, conte no diagnóstico: ela entra no plano.
- **Linha em 'outros serviços'**: Os sistemas que você já usa conversando entre si, e as tarefas repetitivas rodando sozinhas.
- **Texto da imagem de compartilhamento**: Seus sistemas conversando, com preço fechado
- **CTA final**
  - **Título**: Conte quais sistemas precisam conversar
  - **Texto**: Se a equipe ainda redigita dados entre sistemas, comece pelo diagnóstico gratuito de 45 minutos: a gente entende onde está o trabalho manual, e você recebe uma devolutiva por escrito.

### Serviço: MVP e produtos digitais (`/servicos/mvp`)

#### MVP e produtos digitais · `services.mvp`

- **Nome**: MVP e produtos digitais
- **`name_in_sentence`**: MVP
- **`page_name_in_sentence`**: MVP
- **Título (H1)**: Desenvolvimento de MVP: a primeira versão do seu produto nas mãos de usuários reais
- **Subtítulo**: Escopo cortado no essencial, prazo e preço fechados antes do desenvolvimento, e produto funcionando a cada 2 semanas.
- **Sinais ('faz sentido quando…')**:
  1. A ideia já foi validada em conversas, mas ainda não existe produto.
  2. A sua startup tem uma data: captação, piloto ou cliente-âncora esperando.
  3. Você precisa de uma primeira versão para mostrar a clientes ou investidores.
  4. Você quer saber, antes do desenvolvimento, quanto vai pagar e quando vai ver o produto funcionando.
  5. Você precisa saber o que cortar para caber no orçamento.
- **Exemplos**
  - **1.**
    - **Título**: Plataforma web
    - **Texto**: O fluxo principal do seu produto rodando no navegador, sem as telas que podem esperar.
  - **2.**
    - **Título**: Aplicativo
    - **Texto**: O app com a jornada que prova a ideia. O resto entra depois que os usuários mostrarem o caminho.
  - **3.**
    - **Título**: Marketplace
    - **Texto**: Quem oferece e quem compra se encontrando, com o mínimo de operação para provar a demanda de ambos os lados.
  - **4.**
    - **Título**: Plataforma com IA
    - **Texto**: Um uso de IA no centro do produto, testado com usuários reais antes de ganhar recursos extras.
  - **5.**
    - **Título**: Plataforma de cursos
    - **Texto**: Conteúdo, acesso e pagamento para a primeira turma, antes de investir em tudo que uma plataforma madura tem.
  - **6.**
    - **Título**: Painel administrativo para operar o produto
    - **Texto**: O mínimo para você tocar o produto no dia a dia: cadastrar, aprovar e acompanhar.
- **Etapas do método nesta página**
  - **Diagnóstico**: O problema, para quem, o que você já tem (ideia, telas ou protótipo) e a sua data.
  - **Sprint de Descoberta**: O corte do MVP (o que entra agora) e plano com prazo e preço fechados.
  - **Desenvolvimento**: A cada 2 semanas, produto funcionando para mostrar a usuários, sócios ou investidores.
  - **Sustentação e evolução**: Se você quiser, o produto segue evoluindo com o que os usuários mostrarem.
- **O que a Descoberta define**:
  1. O que a primeira versão precisa provar
  2. O que fica para depois
  3. Web, app ou os dois na primeira versão
  4. Como saber se deu certo
- **Título 'o que pesa no preço'**: O que pesa no preço de um MVP
- **O que pesa no preço**
  - **1.**
    - **Título**: Tamanho do escopo da primeira versão
    - **Texto**: É o fator que você mais controla: cada funcionalidade que fica para depois reduz o primeiro investimento.
  - **2.**
    - **Título**: Plataformas
    - **Texto**: Web, iOS ou Android. Cada plataforma a mais amplia a construção e os testes.
  - **3.**
    - **Título**: Integrações
    - **Texto**: Pagamento, login, mapas ou sistemas de parceiros: cada conexão depende do que o outro lado permite.
  - **4.**
    - **Título**: Painel administrativo
    - **Texto**: Você vai precisar operar o produto. Quanto do dia a dia passa por tela, e não por planilha, muda o escopo.
  - **5.**
    - **Título**: Tipos de usuário
    - **Texto**: Comprador e vendedor, aluno e professor: cada perfil é uma experiência própria para construir.
- **Perguntas frequentes**
  - **`price`**
    - **Pergunta**: Quanto custa desenvolver um MVP?
    - **Resposta**: O preço do MVP sai fechado antes do desenvolvimento, e o que mais pesa nele é o tamanho da primeira versão. Tem um valor em mente? Conte no diagnóstico gratuito: o escopo priorizado mostra o que cabe nele. A Sprint de Descoberta, quando necessária, também é gratuita.
  - **`wont_stall`**
    - **Pergunta**: Como eu sei que o projeto não vai parar no meio?
    - **Resposta**: Projeto costuma parar quando o orçamento acaba antes de o produto ficar pronto, ou quando ninguém vê software funcionando antes do fim. Aqui, escopo, prazo e preço ficam fechados antes do desenvolvimento, e a cada 2 semanas você recebe uma parte funcionando: se algo sair do rumo, aparece na entrega seguinte, não no fim.
    - **`answer_with_code_ownership`** _(variante: só quando o dado indicado existir)_: Projeto costuma parar quando o orçamento acaba antes de o produto ficar pronto, ou quando ninguém vê software funcionando antes do fim. Aqui, escopo, prazo e preço ficam fechados antes do desenvolvimento, e a cada 2 semanas você recebe uma parte funcionando: se algo sair do rumo, aparece na entrega seguinte, não no fim. E o código desenvolvido é da sua empresa.
  - **`how_long_mvp`**
    - **Pergunta**: Quanto tempo leva um MVP?
    - **Resposta**: O prazo sai fechado antes do desenvolvimento, junto com o preço, e depende do que a primeira versão precisa provar. Tem data de captação ou de piloto? Conte no diagnóstico: o plano mostra o que cabe até lá. No desenvolvimento, você recebe software funcionando a cada 2 semanas.
  - **`what_goes_in`**
    - **Pergunta**: O que entra na primeira versão?
    - **Resposta**: O mínimo para provar a ideia. O que entra e o que fica para depois é decidido com você antes do desenvolvimento: é o escopo priorizado.
  - **`what_is_mvp`**
    - **Pergunta**: O que é um MVP, na prática?
    - **Resposta**: MVP (produto mínimo viável) é a menor versão do produto que já resolve o problema principal para usuários reais. Não é protótipo nem demonstração: é software funcionando, com o resto deixado para depois de propósito.
  - **`after_mvp`**
    - **Pergunta**: E depois do MVP?
    - **Resposta**: O produto pode seguir com a Lemamon.dev em sustentação e evolução contínua. As próximas versões são priorizadas a partir do uso real, não da lista de desejos do início.
- **Linha em 'outros serviços'**: A primeira versão do seu produto nas mãos de usuários reais.
- **Texto da imagem de compartilhamento**: MVP com prazo e preço fechados
- **CTA final**
  - **Título**: Conte o produto que você quer lançar
  - **Texto**: No diagnóstico gratuito de 45 minutos, a gente entende o problema, o público, a sua data e o seu orçamento, e você recebe uma devolutiva por escrito.

### Serviço: Sustentação e evolução (`/servicos/sustentacao`)

No lugar de 'O que pesa no preço', esta página tem 'o que é cada uma' e 'o que a gente combina antes de começar'. A seção de formato (`format`) só aparece com `hasSupportFormat`, e cada campo só com o dado preenchido.

#### Sustentação e evolução · `services.support`

- **Nome**: Sustentação e evolução
- **`name_in_sentence`**: sustentação e evolução
- **`page_name_in_sentence`**: sustentação e evolução
- **Título (H1)**: Manutenção de software: sustentação e evolução contínua
- **Subtítulo**: Correções, atualizações e evolução do sistema no ar. No diagnóstico gratuito, a gente avalia com você se faz sentido para o seu caso.
- **Sinais ('faz sentido quando…')**:
  1. O sistema entrou no ar e a operação já pede melhorias.
  2. Pequenas melhorias ficam meses na fila.
  3. O sistema dá erro com frequência, e a equipe já aprendeu a contornar.
  4. Você quer o sistema cuidado de forma contínua, não só quando quebra.
- **`what_it_is`**
  - **Título**: Sustentação e evolução, o que é cada uma
  - **`support_label`**: Sustentação
  - **`support_text`**: A manutenção do que está no ar: corrigir o que dá errado e manter o software em dia.
  - **`evolution_label`**: Evolução
  - **`evolution_text`**: A melhoria contínua do software conforme o negócio muda: ajustes no que existe e funcionalidades novas.
- **`examples_title`**: Exemplos do que dá para cuidar e evoluir
- **Exemplos**
  - **1.**
    - **Título**: Correções
    - **Texto**: O que dá errado no uso é investigado e corrigido, na ordem de prioridade combinada com você.
  - **2.**
    - **Título**: Atualizações
    - **Texto**: As ferramentas e os serviços de que o sistema depende, mantidos em dia para ele seguir funcionando quando eles mudam.
  - **3.**
    - **Título**: Melhorias contínuas
    - **Texto**: Ajustes no que já existe a partir do que a operação mostra no dia a dia.
  - **4.**
    - **Título**: Novas funcionalidades
    - **Texto**: O que o negócio passou a precisar, priorizado com você e com preço combinado antes.
- **`how_it_works_title`**: Como funcionam a sustentação e a evolução
- **Etapas do método nesta página**
  - **Diagnóstico**: O que está no ar hoje e o que precisa de atenção primeiro.
  - **Sprint de Descoberta**: Evolução maior: escopo priorizado e plano com prazo e preço fechados antes do desenvolvimento.
  - **Desenvolvimento**: Evolução maior segue como desenvolvimento, com entregas a cada 2 semanas.
  - **Sustentação e evolução**: Cuidado contínuo do que está no ar, enquanto o sistema evolui.
- **`agreed_before_title`**: O que a gente combina antes de começar
- **`agreed_before`**:
  1. Quais partes do sistema a sustentação cobre
  2. Quais evoluções vêm primeiro
  3. Como você acompanha o que foi feito
- **`format`**
  - **Título**: Formato e contratação
  - **Introdução**: O que a sustentação inclui e como ela é contratada.
  - **Campos**
    - **`includes`**: O que inclui
    - **`how_hired`**: Como é contratada
    - **`channels`**: Canais
    - **`urgent`**: Como erros urgentes são tratados
- **`how_it_starts`**
  - **Título**: Por onde começa
  - **Texto**: Pelo diagnóstico gratuito de 45 minutos. Você conta o que mais incomoda hoje e, depois da devolutiva por escrito, decide o próximo passo.
- **`investment_intro`**: Faixa de referência para você se planejar antes da conversa. O valor da sustentação é combinado com você antes de começar.
- **`investment_note`**: Referência, não proposta.
- **`price_answer_link`**: Ver a faixa de referência da sustentação
- **`related_cases_title`**: Cases de sustentação e evolução
- **`faq_title`**: Perguntas sobre sustentação e evolução
- **Perguntas frequentes**
  - **`support_vs_evolution`**
    - **Pergunta**: Qual a diferença entre sustentação e evolução?
    - **Resposta**: Sustentação mantém o que existe funcionando; evolução acrescenta e melhora. Na prática: corrigir um relatório que parou de bater é sustentação, e criar um relatório novo é evolução.
  - **`how_it_starts`**
    - **Pergunta**: Preciso saber o que está errado no sistema para começar?
    - **Resposta**: Não. Você conta o que a operação sente, como erros que voltam, lentidão ou melhorias paradas na fila. No diagnóstico gratuito, a gente entende com você o que está no ar e avalia se a sustentação faz sentido para o seu caso.
  - **`price`**
    - **Pergunta**: Quanto custa a manutenção de um sistema?
    - **Resposta**: Depende do que está no ar e de quanto a operação pede de evolução. O formato e o valor são combinados com você antes de começar. O primeiro passo é o diagnóstico gratuito.
- **Linha em 'outros serviços'**: Manutenção e evolução do sistema depois que ele entra no ar.
- **Texto da imagem de compartilhamento**: Manutenção e evolução de software
- **CTA final**
  - **Título**: Conte o que precisa mudar no sistema
  - **Texto**: Melhoria parada na fila é a operação dando um jeito por fora. No diagnóstico gratuito de 45 minutos, a gente entende o que está travando, e você recebe uma devolutiva por escrito.

### Orçamento — wizard (`/orcamento`)

Recebe o 301 de `/projects` (conversão do Google Ads). Entrada estática, 6 perguntas de clique, resumo antes do contato, formulário de contato, erro e mensagens de WhatsApp. Variantes por resposta (ex.: quem já tem sistema no ar) estão marcadas.

#### Entrada · `quote.entry`

- **`resume_banner`**
  - **Texto**: Você começou um pedido em {data}. Suas respostas ficaram salvas neste navegador.
  - **`continue`**: Continuar de onde parei
  - **`restart`**: Começar de novo
  - **`restart_hint`**: Isso apaga as respostas salvas.
- **Sobretítulo**: Para PMEs e startups · São Paulo, SP
- **Título**: Orçamento de software sob medida: comece pelo diagnóstico gratuito
- **Subtítulo**: Responda 6 perguntas, veja na hora o que influencia prazo e preço no seu caso e, se quiser, peça a conversa de 45 minutos. Escopo, prazo e preço são fechados antes de construir.
- **`markers`**
  - **`free`**: Gratuito e sem compromisso
  - **`duration`**: 45 minutos de conversa
  - **`written_feedback`**: Devolutiva por escrito
- **`summary_promise`**: Você vê o resumo antes de deixar qualquer contato.
- **`start`**: Começar as 6 perguntas
- **`whatsapp_link`**: Prefere conversar direto? Falar no WhatsApp
- **`context_service`**: Já deixamos marcado o que mais combina com {servico_frase}. Dá para mudar. _(Aparece depois do botão "Começar", auditoria F03.)_
- **`context_case`**: Você veio pelo case {case}, então já deixamos marcado o mesmo tipo de projeto. Dá para mudar se quiser.
- **`quick_faq`**
  - **Título**: Antes de começar
  - **`price_at_end`**
    - **Pergunta**: Vou sair daqui com um orçamento?
    - **Resposta**: Um orçamento fechado, ainda não. No fim das 6 perguntas, você vê o que influencia prazo e preço no seu caso e o caminho até o software rodando.
    - **`answer_no_pricing_variant`** _(variante)_: Um orçamento, ainda não: o resumo não mostra valores. No fim das 6 perguntas, você vê o que influencia prazo e preço no seu caso e o caminho até o software rodando.
    - **`answer_with_pricing_suffix`** _(só com faixas de preço preenchidas)_: Dependendo do seu caso, o resumo também mostra uma referência de investimento.
    - **`answer_2`** _(desde a D44, o texto da antiga variante `skip`, que saiu)_: Preço dado antes de entender o projeto costuma virar cobrança extra no meio do caminho. Por isso, prazo e preço fechados saem de um escopo bem definido: o seu, se ele já bastar, ou o da Sprint de Descoberta.
    - **`answer_3`**: A Sprint de Descoberta é gratuita e só acontece quando o diagnóstico mostra que ela é necessária. Nela, o problema vira escopo e plano.
    - **`answer_3_with_values`** _(variante: só quando o dado indicado existir)_: A Sprint de Descoberta é gratuita e só acontece quando o diagnóstico mostra que ela é necessária. No diagnóstico gratuito, você já pode perguntar sobre valores.
  - **`really_free`**
    - **Pergunta**: O diagnóstico é gratuito mesmo?
    - **Resposta**: É. São 45 minutos de conversa, com devolutiva por escrito, sem compromisso de contratar. O que vem depois só acontece se você decidir seguir.
  - **`off_track`**
    - **Pergunta**: Como vocês evitam que o projeto saia do combinado?
    - **Resposta**: O que costuma dar errado é começar a construir sem combinar o que entra. Aqui, escopo, prazo e preço são fechados antes do desenvolvimento, e a cada 2 semanas você usa software funcionando.
    - **`answer_2`**: E você decide se segue em dois momentos: depois da devolutiva e depois do plano.
  - **`conversation_format`**
    - **Pergunta**: Como é a conversa e com quem eu falo?
    - **`answer_with_format`** _(variante: só quando o dado indicado existir)_: A conversa de 45 minutos é {formato_diagnostico}, com {participantes_diagnostico}.
  - **`need_to_know_everything`**
    - **Pergunta**: Preciso saber tudo sobre o projeto para responder?
    - **Resposta**: Não. Toda pergunta tem uma saída para quem ainda não sabe, como “Ainda não sei” ou “Pular”. O que faltar, a gente começa a organizar com você no diagnóstico.
  - **`data_use`**
    - **Pergunta**: O que vocês fazem com os meus dados?
    - **Resposta**: Usamos para responder ao seu pedido, organizar a ordem de atendimento e preparar o diagnóstico. Também registramos como você chegou ao site, por exemplo por um anúncio, e medimos o uso do site.
    - **`answer_2`**: Os detalhes, inclusive como pedir a exclusão, estão na {politica}.
- **`scope_line`**: O diagnóstico serve para quem quer desenvolver software sob medida:
- **`scope_items`**
  - **`ops_system`**: criar um sistema de gestão para a empresa
  - **`client_platform`**: criar um portal ou uma plataforma para os seus clientes
  - **`mobile_app`**: criar um aplicativo para celular
  - **`integration`**: integrar os sistemas que você já usa
  - **`automation`**: automatizar tarefas ou atendimento
  - **`mvp`**: lançar a primeira versão de um produto digital (MVP)
  - **`live_system`**: evoluir ou cuidar de um sistema que já está no ar
- **`after_send`**
  - **Título**: O que acontece depois que você envia
  - **Passos**
    - **`contact`**: A gente fala com você para marcar o horário.
    - **`conversation`**: Uma conversa de 45 minutos sobre o problema que você quer resolver.
    - **`feedback`**: Depois da conversa, você recebe a devolutiva por escrito.
  - **`schedule_variant`** _(variante)_: Você escolhe o horário logo depois de enviar, ou a gente fala com você para marcar.
  - **`next_step_note`**: Para construir algo novo, se fizer sentido seguir, a gente define com você se a Sprint de Descoberta é necessária. Ela é gratuita e termina num plano com prazo e preço fechados.
  - **`next_step_note_live_variant`** _(variante)_: Para o sistema que você já tem, se fizer sentido seguir, escopo, prazo e preço do que vem depois são combinados com você antes de começar.
  - **`next_step_decision`**: Quem decide se segue é você, com a devolutiva na mão.
  - **Link**: Ver como trabalhamos

#### Progresso · `quote.progress`

- **Rótulo**: Pergunta {n} de {total}
- **`summary_label`**: Resumo
- **`contact_label`**: Último passo: seu contato
- **`live_announcement`**: Pergunta {n} de {total}: {pergunta}
- **`document_title`**: Pergunta {n} de {total} · Orçamento | Lemamon.dev
- **`summary_document_title`**: Seu ponto de partida · Orçamento | Lemamon.dev
- **`contact_document_title`**: Seu contato · Orçamento | Lemamon.dev

#### Navegação · `quote.nav`

- **`back`**: Voltar
- **`continue`**: Continuar
- **`continue_to_summary`**: Ver meu resumo
- **`skip`**: Pular
- **`skip_aria_label`**: Pular esta pergunta
- **`selected_count`**: {n} selecionadas
- **`selected_count_one`**: {n} selecionada
- **`selected_count_of_max`**: Selecionadas: {n} de 3
- **`exclusive_hint`**: Marcar “Ainda não sei” desmarca as outras opções.
- **`exclusive_hint_live_variant`** _(variante)_: Marcar “Ainda não sei classificar” desmarca as outras opções.

#### Validação · `quote.validation`

- **`select_one`**: Escolha uma opção para continuar.
- **`select_one_or_not_sure`**: Escolha uma opção ou marque “Ainda não sei”.
- **`select_at_least_one_or_not_sure`**: Marque pelo menos uma opção ou “Ainda não sei”.
- **`select_at_least_one_or_not_sure_live_variant`** _(variante)_: Marque pelo menos uma opção ou “Ainda não sei classificar”.
- **`max_three`**: Você já marcou 3. Para trocar, desmarque uma.

#### As 6 perguntas · `quote.steps`

- **`stage`**
  - **Rótulo curto**: Momento
  - **Pergunta**: Em que ponto você está?
  - **Ajuda**: Não existe resposta errada. Isso só muda por onde a conversa começa.
  - **Opções**
    - **`problem_unclear`**: Tenho um problema na operação, mas ainda não sei o que construir
    - **`product_idea`**: Tenho uma ideia de produto e quero tirar do papel
    - **`scope_defined`**: Já sei o que precisa ser construído e quero começar
    - **`evolve_live_system`**: Quero evoluir um sistema ou produto que já está no ar
    - **`maintain_live_system`**: Preciso de quem cuide de um sistema que já está no ar
  - **Opções (versão curta, usada no resumo)**
    - **`problem_unclear`**: Problema na operação, solução em aberto
    - **`product_idea`**: Ideia de produto para tirar do papel
    - **`scope_defined`**: Já sei o que construir
    - **`evolve_live_system`**: Evoluir um sistema no ar
    - **`maintain_live_system`**: Cuidar de um sistema no ar
- **`build_type`**
  - **Rótulo curto**: Tipo de software
  - **Pergunta**: O que você precisa construir?
  - **`question_unclear_variant`** _(variante)_: Se já tiver uma ideia, que tipo de software seria?
  - **`question_live_variant`** _(variante)_: Que tipo de sistema você tem hoje?
  - **Ajuda**: Pode marcar mais de uma. Se ainda não souber dizer, tudo bem: a gente começa a definir isso com você no diagnóstico gratuito.
  - **`helper_live_variant`** _(variante)_: Pode marcar mais de uma. Se não souber classificar, marque a mais próxima ou “Ainda não sei classificar”: a gente confirma no diagnóstico.
  - **Opções**
    - **`ops_system`**: Sistema de gestão para a empresa (financeiro, estoque, ERP, CRM, painéis)
    - **`client_platform`**: Portal ou plataforma para os seus clientes (área do cliente, e-commerce, marketplace, agendamento, cursos online)
    - **`mobile_app`**: Aplicativo para celular (iPhone, Android ou os dois)
    - **`integration`**: Integração entre sistemas que você já usa
    - **`automation`**: Automação de tarefas ou atendimento (inclusive com chatbot ou IA)
    - **`mvp`**: Produto digital novo ou MVP (a primeira versão do produto)
    - **`not_sure`**: Ainda não sei — quero ajuda para definir
  - **Opções (versão curta, usada no resumo)**
    - **`ops_system`**: Sistema de gestão para a empresa
    - **`client_platform`**: Portal ou plataforma para clientes
    - **`mobile_app`**: Aplicativo para celular
    - **`integration`**: Integração entre sistemas
    - **`automation`**: Automação de tarefas ou atendimento
    - **`mvp`**: Produto digital novo ou MVP
    - **`not_sure`**: Ainda não sei
  - **`options_live_variant`** _(variante)_
    - **`mvp`**: Produto digital ou MVP que já está no ar
    - **`not_sure`**: Ainda não sei classificar — explico na conversa
  - **`options_short_live_variant`** _(variante)_
    - **`mvp`**: Produto digital ou MVP no ar
    - **`not_sure`**: Ainda não sei classificar
- **`pain`**
  - **Rótulo curto**: O que pesa hoje
  - **Pergunta**: O que mais pesa hoje?
  - **Ajuda**: Marque até 3, ou pule esta pergunta. O que você marcar entra na pauta da nossa conversa.
  - **Opções**
    - **`manual_process`**: Processo manual, em planilha, papel ou WhatsApp, que depende de uma pessoa
    - **`double_entry`**: A mesma informação é digitada em mais de um lugar
    - **`disconnected_tools`**: As ferramentas que usamos não conversam entre si
    - **`off_the_shelf_misfit`**: O software pronto que usamos não atende o nosso processo
    - **`late_numbers`**: Números e relatórios chegam tarde ou não batem
    - **`customer_channel`**: Clientes ou parceiros pedem um canal digital (portal, app, pedido online)
    - **`new_product`**: Preciso lançar um produto novo e colocar na mão dos primeiros usuários
    - **`other`**: Outro motivo — conto na conversa
  - **Opções (versão curta, usada no resumo)**
    - **`manual_process`**: Processo manual
    - **`double_entry`**: Informação digitada em dobro
    - **`disconnected_tools`**: Ferramentas que não conversam
    - **`off_the_shelf_misfit`**: Software pronto que não atende
    - **`late_numbers`**: Números atrasados ou que não batem
    - **`customer_channel`**: Clientes pedem canal digital
    - **`new_product`**: Lançar um produto novo
    - **`other`**: Outro motivo
- **`system_pain`**
  - **Rótulo curto**: O que pede atenção
  - **Pergunta**: O que está pedindo atenção no sistema que você tem?
  - **Ajuda**: Marque até 3, ou pule esta pergunta. O que você marcar entra na pauta da nossa conversa.
  - **Opções**
    - **`errors_instability`**: Erros ou instabilidade no que está no ar
    - **`new_features`**: Preciso de funcionalidades novas
    - **`hard_to_maintain`**: Está lento ou difícil de manter
    - **`ongoing_care`**: Preciso de alguém cuidando de forma contínua
    - **`other`**: Outro motivo — conto na conversa
  - **Opções (versão curta, usada no resumo)**
    - **`errors_instability`**: Erros ou instabilidade
    - **`new_features`**: Funcionalidades novas
    - **`hard_to_maintain`**: Lento ou difícil de manter
    - **`ongoing_care`**: Cuidado contínuo
    - **`other`**: Outro motivo
- **`deadline`**
  - **Rótulo curto**: Prazo
  - **Pergunta**: Quando isso precisa estar funcionando?
  - **`question_live_variant`** _(variante)_: Para quando você precisa dessa ajuda?
  - **Ajuda**: Escopo, prazo e preço são combinados antes de começar. Por isso é bom saber o seu prazo desde já.
  - **Opções**
    - **`asap`**: O quanto antes — já está atrasado
    - **`within_3_months`**: Nos próximos 3 meses
    - **`between_3_and_6_months`**: Entre 3 e 6 meses
    - **`over_6_months`**: Daqui a mais de 6 meses
    - **`not_defined`**: Ainda não tenho prazo definido
  - **`reason_label`**: Tem alguma data que não pode passar? (opcional)
  - **`reason_short_label`**: Data que não pode passar
  - **`reason_placeholder`**: Ex.: até a feira de maio, antes do fim do trimestre ou antes da próxima captação.
- **`budget`**
  - **Rótulo curto**: Investimento
  - **`question_tiers`**: Quanto você pretende investir neste projeto?
  - **`question_tiers_monthly`**: Quanto você pretende investir por mês para manter e evoluir o sistema?
  - **`helper_tiers`**: Escolha uma opção. Serve para a conversa começar do tamanho certo, sem compromisso. O preço fechado vem antes do desenvolvimento.
  - **`helper_tiers_live_variant`** _(variante)_: É uma referência para a conversa começar do tamanho certo. Não é proposta nem compromisso: o preço é combinado com você antes de começar.
  - **`helper_tiers_monthly`**: É uma referência para a conversa começar do tamanho certo, sem compromisso.
  - **`helper_maintain_note`**: Se for sustentação e evolução contínua, pense no total de um ano.
  - **`options_tiers_mode`**
    - **`not_sure`**: Ainda não sei — quero entender o que é razoável
    - **`prefer_to_discuss`**: Prefiro conversar sobre isso no diagnóstico
  - **`question_no_numbers`**: O investimento para este projeto já está previsto?
  - **`question_no_numbers_live_variant`** _(variante)_: O investimento para cuidar e evoluir o sistema já está previsto?
  - **`helper_no_numbers`**: Escolha uma opção. Serve para a proposta levar a sua realidade em conta. Não é compromisso, e você não precisa dizer valores.
  - **`options_no_numbers_mode`**
    - **`approved`**: Sim, o valor já está separado ou aprovado
    - **`being_defined`**: Está em definição (depende de aprovação ou de captação)
    - **`not_considered`**: Ainda não — primeiro quero entender quanto custa algo assim
    - **`prefer_to_discuss`**: Prefiro conversar sobre isso no diagnóstico
- **`role`**
  - **Rótulo curto**: Decisão
  - **Pergunta**: Qual é o seu papel nessa decisão?
  - **Ajuda**: Assim a gente sabe quem convidar para o diagnóstico. Se mais alguém decide, traga essa pessoa para a conversa.
  - **Opções**
    - **`i_decide`**: Eu decido
    - **`decide_with_partners`** _(variante: só quando o dado indicado existir)_: Decido junto com sócios ou diretoria
    - **`recommend_to_decider`**: Vou recomendar para quem decide
    - **`researching`**: Estou pesquisando opções por enquanto
    - **`not_defined`**: Ainda não está definido quem decide

#### Resumo: 'Este é o seu ponto de partida' · `quote.summary`

- **Título**: Este é o seu ponto de partida
- **Introdução**: Com base nas suas respostas: o que pesa no prazo e no preço do seu caso, o que a gente vai aprofundar nos 45 minutos e o caminho até o software rodando.
- **`intro_live_variant`** _(variante)_: Com base nas suas respostas: o que pesa no prazo e no preço do seu caso, o que a gente vai aprofundar nos 45 minutos e o caminho a partir do sistema que você tem.
- **`for_line`**: Para: {respostas} _(tipo, prazo e faixa, separados por " · ", seguidos do link `fix_answers`; auditoria F02)_
- **`told_us_title`**: Suas respostas
- **`edit`**: Alterar
- **`edit_aria_label`**: Alterar resposta: {rotulo}
- **`skipped_answer`**: Não respondida (opcional)
- **`path_title`**: O caminho até o software rodando
- **`path_title_live_variant`** _(variante)_: O caminho a partir do sistema que você tem
- **`path_all_stages`**: Ver as 4 etapas
- **`emphasis`**
  - **`discovery_default`**: Na Sprint de Descoberta, que é gratuita, você fica sabendo quanto o desenvolvimento custa e quando fica pronto, antes de começar a construir.
  - **`discovery_scope_defined`** _(desde a D44, a antiga variante `skip`, com "gratuita")_: No diagnóstico, a gente vê com você se o que você já tem basta para fechar escopo, prazo e preço. Se faltar definição, a Sprint de Descoberta, gratuita, vem antes.
  - **`live_system`**: No diagnóstico, a gente entende como o seu sistema funciona hoje e conversa sobre por onde faz sentido começar.
- **`deep_dive_title`**: No diagnóstico, a gente vai aprofundar
- **`topics`**
  - **`topic_live_system`**: O que está no ar hoje e o que pede atenção primeiro
  - **`topic_pain`**: Quanto os pontos que você marcou custam hoje para a empresa
  - **`topic_pain_product_variant`** _(variante)_: Os pontos que você marcou e o que eles mudam no lançamento
  - **`topic_integration`**: Quais sistemas precisam conversar e o que cada um permite
  - **`topic_app`**: Quem vai usar o app e o que ele precisa resolver primeiro
  - **`topic_process`**: Como o seu processo funciona hoje, passo a passo
  - **`topic_process_product_variant`** _(variante)_: Quem vai usar o produto e o que essa pessoa precisa conseguir fazer primeiro
  - **`topic_mvp`**: O que a primeira versão do produto precisa provar
  - **`topic_automation`**: Quais tarefas se repetem e quanto tempo elas consomem
  - **`topic_not_sure`**: Que tipo de software resolve o seu problema
  - **`topic_deadline`**: O que é essencial para a primeira entrega
  - **`topic_budget`**: O que faz o preço do seu projeto subir ou descer
  - **`topic_decider`**: Quem precisa participar da próxima conversa
  - **`topic_success`**: Como seria o “deu certo” para você
- **`weighs_title`**: O que influencia prazo e preço no seu caso
- **`factors`**
  - **`factor_app`**: iPhone, Android ou os dois, e se a publicação nas lojas entra no escopo
  - **`factor_integration`**: O quanto os sistemas que você já usa permitem conexão
  - **`factor_automation`**: Quantas tarefas entram na automação e de quais sistemas ela depende
  - **`factor_multi`** _(desde a D44, o texto da antiga variante `skip`)_: Mais de um tipo de software no mesmo projeto: a ordem entre eles é combinada antes de começar
  - **`factor_deadline`**: Urgência ou data marcada: o que entra primeiro é combinado antes de começar
  - **`factor_deadline_window`** _(P4 = nos próximos 3 meses)_: Uma janela de 3 meses: o que entra na primeira entrega é combinado antes de começar
  - **`factor_scope`**: Quantos processos e tipos de usuário entram na primeira versão
  - **`factor_scope_live`**: O tamanho do sistema atual e o que precisa mudar primeiro
  - **`factor_default`**: O que entra primeiro e o que pode esperar
- **`price_title`**: E o preço?
- **`price_empty`**: No diagnóstico gratuito, a gente já mostra o que faz o preço de um projeto como o seu subir ou descer.
- **`price_empty_2`**: Diagnóstico e Sprint de Descoberta são gratuitos. A primeira etapa paga é o desenvolvimento, com preço fechado antes de ele começar.
- **`price_empty_live`**: Escopo, prazo e preço do que vem depois do diagnóstico são combinados com você antes de começar, e você decide se segue.
- **`price_empty_live_2`**: No diagnóstico, a gente explica o que pesa no preço de cuidar e evoluir o seu sistema.
- **`price_empty_live_2_with_values`** _(variante: só quando o dado indicado existir)_: No diagnóstico, você pode perguntar sobre valores: a gente explica o que pesa no preço de cuidar e evoluir o seu sistema.
- **`price_ranges_intro`**: Faixas de referência para você ter uma ordem de grandeza. Cada uma vale para um tipo de projeto.
- **`price_note`**: Referência, não proposta. O preço do desenvolvimento é fechado antes de começar, e nada é cobrado até lá.
- **`deadline_note`**: Com prazo apertado ou data marcada, quanto antes a gente conversar, mais opções você tem para a primeira entrega.
- **`deadline_note_window`** _(P4 = nos próximos 3 meses)_: Com 3 meses pela frente, quanto antes a gente conversar, mais opções você tem para a primeira entrega.
- **CTA primário**: Pedir meu diagnóstico gratuito
- **`below_primary`**: Falta só o contato. Gratuito e sem compromisso. _(1 linha na barra fixa a 390px, auditoria F21.)_
- **`secondary_whatsapp`**: Prefiro falar no WhatsApp
- **`fix_answers`**: Alterar respostas

#### Formulário de contato · `quote.contact_form`

- **Título**: Como a gente fala com você?
- **Introdução**: Com o seu contato, a gente marca os 45 minutos do seu diagnóstico gratuito.
- **Campos**
  - **Nome**
    - **Rótulo**: Nome
    - **Erro (campo vazio)**: Informe o seu nome.
  - **E-mail**
    - **Rótulo**: E-mail
    - **`help`**: Para combinar o diagnóstico com você.
    - **Erro (campo vazio)**: Informe o seu e-mail.
    - **Erro (formato)**: Confira o e-mail. Ele precisa ter o formato nome@exemplo.com.
  - **`channel`**
    - **Rótulo**: Por onde a gente combina o horário com você?
    - **Opções**
      - **WhatsApp**: WhatsApp
      - **E-mail**: E-mail
      - **`phone_call`**: Ligação
    - **Erro (campo vazio)**: Escolha por onde a gente combina o horário.
  - **`phone`**
    - **Rótulo**: WhatsApp com DDD
    - **`label_optional`**: WhatsApp com DDD (opcional)
    - **`label_with_call`** _(variante: só quando o dado indicado existir)_: WhatsApp ou telefone com DDD
    - **`label_with_call_optional`** _(variante: só quando o dado indicado existir)_: WhatsApp ou telefone com DDD (opcional)
    - **`help`**: Para combinar o horário.
    - **`help_optional`**: Se quiser, como alternativa para combinar o horário.
    - **Exemplo no campo**: (11) 99999-9999
    - **Erro (campo vazio)**: Informe o número com DDD ou escolha E-mail como canal.
    - **Erro (formato)**: Confira o número com DDD, por exemplo: (11) 99999-9999. Fora do Brasil, comece com + e o código do país.
  - **`company`**
    - **Rótulo**: Empresa (opcional)
  - **`details`**
    - **`toggle`**: Quer contar mais alguma coisa? (opcional)
    - **Rótulo**: Mais detalhes sobre o seu projeto
    - **Exemplo no campo**: Ex.: hoje os pedidos chegam pelo WhatsApp e a gente perde venda quando o time não dá conta.
    - **`placeholder_product_variant`** _(variante)_: Ex.: quero colocar a primeira versão na mão de clientes-piloto antes da próxima captação.
    - **`placeholder_live_variant`** _(variante)_: Ex.: cada mudança no sistema demora e acaba quebrando outra coisa.
    - **`nda_note`**: Prefere assinar um acordo de confidencialidade (NDA) antes de dar detalhes? Escreva só “NDA” aqui e deixe os detalhes para depois.
- **Botão de envio**: Pedir meu diagnóstico gratuito
- **`below_submit`**: Gratuito e sem compromisso de contratar.
- **`privacy_notice`**: Usamos estes dados e as suas respostas para responder ao seu pedido, organizar a ordem de atendimento e preparar o diagnóstico. Também registramos como você chegou ao site, por exemplo por um anúncio, e medimos o uso do site. Detalhes na {politica}.
- **Enviando**: Enviando o seu pedido…
- **`sending_slow`**: Ainda enviando. Não precisa clicar de novo: suas respostas continuam aqui.

#### Erro de envio · `quote.error`

- **Título**: Não conseguimos enviar agora.
- **Texto**: Suas respostas continuam aqui. Tente de novo ou mande o pedido pelo WhatsApp, que já abre com as suas respostas e o código do pedido.
- **`text_no_whatsapp`** _(variante sem WhatsApp configurado)_: Suas respostas continuam aqui. Tente de novo, ou copie as respostas e mande por e-mail.
- **Tentar de novo**: Tentar de novo
- **WhatsApp**: Enviar pelo WhatsApp
- **`copy_answers`**: Copiar minhas respostas
- **`copied`**: Respostas copiadas.
- **`email_line`**: Se preferir, escreva para {email}.
- **`email_line_no_whatsapp`** _(variante sem WhatsApp configurado)_: E-mail: {email}

#### Mensagens de WhatsApp pré-preenchidas · `quote.whatsapp_messages`

- **`summary_intro`**: Olá! Vi o resumo do meu projeto no site da Lemamon.dev e quero pedir o diagnóstico gratuito. Estas são as minhas respostas:
- **`summary_closing`**: Podemos marcar a conversa?
- **`failure_intro`**: Olá! Tentei enviar meu pedido de diagnóstico pelo site da Lemamon.dev e não consegui. Estas são as minhas respostas:
- **`failure_closing`**: Podemos marcar o diagnóstico por aqui?
- **`name_line`**: *Nome:* {nome}
- **`company_line`**: *Empresa:* {empresa}
- **`answer_line`**: *{rotulo}:* {resposta}
- **`answer_separator`**:  · 
- **`ref_line`**: Código do pedido: {protocolo}
- **`ref_line_summary`**: Código do pedido: {protocolo}
- **`post_submit`**: Olá! Acabei de pedir o diagnóstico gratuito pelo site da Lemamon.dev (código do pedido: {protocolo}) e queria adiantar a conversa por aqui.
- **`post_submit_generic`**: Olá! Acabei de pedir o diagnóstico gratuito pelo site da Lemamon.dev e queria adiantar a conversa por aqui.
- **`entry_direct`**: Olá! Vim pela página de orçamento da Lemamon.dev e prefiro conversar por aqui sobre o meu projeto.
- **`wizard_question`**: Olá! Estou preenchendo o pedido de diagnóstico no site da Lemamon.dev e tenho uma dúvida.
- **`wrong_contact`** _(pós-envio, "Algum dado errado?")_: Olá! O contato do meu pedido {protocolo} saiu errado. O certo é:

### Pedido enviado (`/orcamento/enviado`)

Página de confirmação (noindex).

#### Pedido enviado · `quote.sent`

- **`title_with_name`** _(variante: só quando o dado indicado existir)_: Pedido recebido, {nome}.
- **`title_generic`**: Pedido recebido.
- **`what_now_title`**: O que acontece agora
- **Passos**
  - **`read`**: A gente lê as suas respostas.
  - **`contact`**: A gente fala com você para marcar o seu diagnóstico.
  - **`contact_by_channel`**
    - **WhatsApp**: A gente fala com você pelo WhatsApp {contato} para marcar o seu diagnóstico.
    - **E-mail**: A gente escreve para {contato} para marcar o seu diagnóstico. A mensagem sai de {email}. Se não estiver na caixa de entrada, confira o spam.
    - **`phone_call`**: A gente liga para {contato} para marcar o seu diagnóstico.
  - **`contact_schedule_variant`** _(variante)_: Escolha um horário logo abaixo, ou a gente fala com você para marcar o seu diagnóstico.
  - **`feedback`**: Depois da conversa, você recebe a devolutiva por escrito.
- **`protocol_label`**: Código do seu pedido
- **`schedule`** _(só com agenda online)_
  - **Título**: Quer adiantar? Escolha um horário agora
  - **Botão**: Escolher horário
  - **Nota**: São os 45 minutos do seu diagnóstico gratuito.
- **`wrong_contact`** _(abaixo do 2º passo, só com o contato do pedido na tela)_
  - **Texto**: Algum dado errado?
  - **Link**: Mande o certo pelo WhatsApp com o código do pedido.
  - **`text_no_whatsapp`** _(variante sem WhatsApp configurado)_: Algum dado errado? Escreva o certo para {email} e cite o código do pedido.
- **`whatsapp_now`**
  - **Texto**: Quer agilizar? Mande um “oi” agora
  - **Botão**: Mandar oi no WhatsApp
  - **Apoio** _(só quando a mensagem já leva o código)_: A mensagem já leva o código do seu pedido e a conversa fica no seu WhatsApp.
- **`email_fallback`**: Quer adiantar? Escreva para {email} e cite o código do seu pedido.
- **`email_fallback_generic`**: Quer adiantar? Escreva para {email}.
- **`prepare`**
  - **Título**: Para aproveitar os 45 minutos
  - **Itens**
    - **`decider`**: Se mais alguém participa da decisão, convide essa pessoa para a conversa.
    - **Exemplos**: Separe exemplos de como funciona hoje (planilhas, telas, mensagens) ou rascunhos da ideia.
    - **`systems`**: Liste os sistemas e ferramentas que você já usa.
    - **`tried`**: Se algo já foi tentado, com outra ferramenta ou outro fornecedor, anote o que não funcionou.
    - **`deadline`**: Se existe uma data que não pode passar, anote o que precisa estar pronto até lá.
    - **`success`**: Pense em como seria o “deu certo” para você.
- **`summary`**
  - **Título**: Resumo do seu pedido
  - **`contact_label`**: Seus contatos
  - **`copy`**: Copiar resumo
  - **`copy_help`**: Para repassar a quem participa da decisão.
  - **`copied`**: Resumo copiado.
  - **`copy_header`**: Pedido de diagnóstico gratuito na Lemamon.dev (45 minutos de conversa, com devolutiva por escrito) · código {protocolo}
  - **`copy_footer`**: Lemamon.dev · software sob medida com escopo, prazo e preço combinados antes de começar e entregas a cada 2 semanas. Como funciona: {url_metodo}
- **`meanwhile`**
  - **Título**: Enquanto isso
  - **`discovery_link`**: Entenda a Sprint de Descoberta
  - **`how_we_work_link`**: Ver como trabalhamos
  - **`cases_title`**: Projetos do mesmo tipo que o seu
  - **`cases_title_one`**: Um projeto do mesmo tipo que o seu
  - **`back_home`**: Voltar ao início

### Contato (`/contato`)

#### Contato · `contact`

- **Hero**
  - **Título**: Fale com a Lemamon.dev
  - **Subtítulo**: Projeto novo ou sistema no ar? Comece pelo diagnóstico gratuito: 6 perguntas, o resumo na hora e 45 minutos de conversa. Para outros assuntos, escolha o canal.
  - **`subtitle_new_only_variant`** _(variante)_: Para projeto novo, comece pelo diagnóstico gratuito: 6 perguntas, o resumo na hora e 45 minutos de conversa. Para outros assuntos, escolha o canal.
- **`channels`**
  - **Título**: Canais de contato
  - **Diagnóstico**
    - **`badge`**: Recomendado para projetos
    - **Título**: Diagnóstico gratuito
    - **Texto**: 45 minutos de conversa sobre o seu projeto, com devolutiva por escrito.
  - **WhatsApp**
    - **Título**: WhatsApp
    - **Texto**: Para uma conversa direta, sem formulário.
  - **E-mail**
    - **Título**: E-mail
    - **Texto**: Para enviar documentos ou um assunto com mais detalhes.
    - **`text_with_nda`** _(variante: só quando o dado indicado existir)_: Para enviar NDA, documentos ou um assunto com mais detalhes.
  - **Localização**: Lemamon.dev · software sob medida · São Paulo, SP, Brasil
- **`form`**
  - **Título**: Prefere escrever?
  - **Campos**
    - **Nome**
      - **Rótulo**: Nome
      - **Erro (campo vazio)**: Informe o seu nome.
    - **E-mail**
      - **Rótulo**: E-mail
      - **Erro (campo vazio)**: Informe o seu e-mail.
      - **Erro (formato)**: Confira o e-mail. Ele precisa ter o formato nome@exemplo.com.
    - **`phone`**
      - **Rótulo**: WhatsApp com DDD (opcional)
      - **Erro (formato)**: Confira o número com DDD, por exemplo: (11) 99999-9999. Fora do Brasil, comece com + e o código do país.
    - **`subject`**
      - **Rótulo**: Assunto
      - **Opções**
        - **`new_project`**: Projeto novo
        - **`existing_system`**: Sistema que já está no ar
        - **`partnership`**: Parceria
        - **`other`**: Outro
      - **Erro (campo vazio)**: Escolha um assunto.
    - **`message`**
      - **Rótulo**: Mensagem
      - **Exemplo no campo**: Conte em poucas linhas o que você precisa e por quê.
      - **Erro (campo vazio)**: Escreva a sua mensagem.
  - **`new_project_tip_lead`**: Pode escrever por aqui.
  - **`new_project_tip`**: Se preferir, responda 6 perguntas e veja o resumo do seu projeto na hora
  - **`existing_system_tip_lead`**: Pode escrever por aqui.
  - **`existing_system_tip`**: Se preferir, responda 6 perguntas sobre o sistema no ar e veja o resumo na hora
  - **Botão de envio**: Enviar mensagem
  - **Enviando**: Enviando a sua mensagem…
  - **`privacy_notice`**: Usamos estes dados para responder à sua mensagem e registramos como você chegou ao site, por exemplo por um anúncio. Os detalhes estão na {politica}.
  - **Sucesso: título**: Mensagem recebida.
  - **Sucesso: texto**: A gente responde no e-mail que você informou.
  - **`success_text_with_phone`** _(variante: só quando o dado indicado existir)_: A gente responde pelo e-mail ou pelo WhatsApp que você informou.
  - **`success_new_project_text`**: Enquanto isso, se quiser, responda 6 perguntas e veja na hora o que influencia prazo e preço no seu caso.
  - **`success_new_project_link`**: Pedir diagnóstico gratuito
  - **Erro: título**: Não conseguimos enviar a sua mensagem.
  - **Erro: texto**: O que você escreveu continua aqui. Tente de novo, chame no WhatsApp ou escreva para {email}.
  - **`error_text_no_whatsapp`** _(variante sem WhatsApp configurado)_: O que você escreveu continua aqui. Tente de novo ou escreva para {email}.
  - **Tentar de novo**: Tentar de novo
  - **WhatsApp**: Falar no WhatsApp

### Cases (`/cases e /cases/[slug]`)

**Página condicional** (`hasCases`, pelo menos 2 cases publicados). O texto é só estrutura: títulos e rótulos; o conteúdo vem de cada case.

#### Cases · `cases`

- **`hub`**
  - **Título**: Cases: projetos de software sob medida
  - **Introdução**: Em cada projeto: o problema, o que foi combinado antes de começar, o que foi entregue e, quando o cliente autoriza divulgar, o resultado.
  - **`filters`**
    - **Rótulo**: Filtrar cases por serviço
    - **`all`**: Todos
    - **`web_systems`**: Sistemas web
    - **`mobile_apps`**: Aplicativos
    - **`integrations`**: Integrações
    - **`mvp`**: MVP
    - **Sustentação e evolução**: Sustentação
  - **CTA final**
    - **Título**: Quer algo parecido?
    - **Texto**: Comece pelo diagnóstico gratuito: 45 minutos de conversa sobre o seu caso e uma devolutiva por escrito.
- **`case`**
  - **`fact_sheet`**
    - **Título**: Resumo do projeto
    - **`sector`**: Setor
    - **`size`**: Porte
    - **`service`**: Serviço
    - **Etapas**: Etapas contratadas
    - **`period`**: Período
  - **`problem_title`**: O problema
  - **`agreed_title`**: O que foi combinado
  - **`built_title`**: O que foi entregue
  - **`how_it_went_title`**: Como foi
  - **`result_title`**: O resultado
  - **`tech_sheet`**
    - **Título**: Ficha técnica
    - **`stack`**: Tecnologias usadas neste projeto
    - **`live_link`**: Ver o produto no ar
  - **`related_title`**: Outros projetos
  - **CTA final**
    - **Título**: Quer algo parecido?
    - **Texto**: Conte o seu caso em um diagnóstico gratuito de 45 minutos e receba uma devolutiva por escrito.
    - **Botão**: Pedir diagnóstico gratuito

### Sobre (`/sobre`)

**Página condicional** (`hasTeam`, pelo menos 1 pessoa completa). O subtítulo e a história vêm do dono.

#### Sobre · `about`

- **Hero**
  - **Sobretítulo**: Desenvolvimento de software sob medida
  - **Título**: Quem é a Lemamon.dev
- **`beliefs`**
  - **Título**: No que a gente acredita
  - **Itens**
    - **`price_needs_understanding`**
      - **`belief`**: Preço sem entender o problema é chute.
      - **`practice`**: Por isso a Sprint de Descoberta vem antes do preço do desenvolvimento.
    - **`progress_is_working_software`**
      - **`belief`**: Progresso se mede em software funcionando.
      - **`practice`**: Por isso as entregas são a cada 2 semanas, e você usa o que foi feito.
    - **`live_software_needs_care`**
      - **`belief`**: Software no ar continua precisando de cuidado.
      - **`practice`**: Por isso existe sustentação e evolução contínua depois do lançamento.
    - **`first_conversation_has_value`**
      - **`belief`**: A primeira conversa tem que valer por si.
      - **`practice`**: Por isso o diagnóstico é gratuito e termina com uma devolutiva por escrito, contratando ou não.
- **`story`**
  - **Título**: Por que a gente trabalha assim
- **`team`**
  - **Título**: Quem trabalha nos projetos da Lemamon.dev
- **`company`**
  - **Título**: Dados da empresa
  - **`legal_name`**: Razão social
  - **`cnpj`**: CNPJ
  - **`city`**: Cidade
  - **`founded`**: Ano de fundação
- **Perfis**
  - **Título**: Confira antes de conversar
- **CTA final**
  - **Título**: Vamos conversar sobre o seu projeto?
  - **Texto**: O primeiro passo é um diagnóstico gratuito de 45 minutos, com devolutiva por escrito.

### Blog (`/blog e /blog/[slug]`)

**Página condicional** (`hasPosts`, pelo menos 3 posts com autor real). Só em pt-BR.

#### Blog · `blog`

- **`hub`**
  - **Título**: Software sob medida, explicado por quem constrói
  - **Introdução**: Artigos para quem vai contratar um projeto de software e para quem precisa avaliá-lo tecnicamente.
  - **`card_by`**: Por {autor}
  - **`card_date`**: Publicado em {data}
  - **`read_post`**: Ler artigo
  - **`read_post_aria`**: Ler artigo: {titulo}
- **`post`**
  - **`by`**: Por {autor}
  - **`published`**: Publicado em {data}
  - **Atualização**: Atualizado em {data}
  - **`mid_cta`**
    - **Texto**: Está avaliando um projeto de software? Em 45 minutos de diagnóstico gratuito, a gente entende o seu caso e você recebe uma devolutiva por escrito.
    - **Botão**: Pedir diagnóstico gratuito
  - **`end_cta`**
    - **Título**: Vamos olhar o seu caso?
    - **Texto**: Comece pelo diagnóstico gratuito de 45 minutos, com devolutiva por escrito.
  - **`related_title`**: Leia também
  - **`service_link_label`**: Ver como funciona: {servico}

### Política de Privacidade (`/privacidade`)

**Não publicar antes da revisão jurídica e do controlador preenchido** (ver Bloqueios). Os campos entre chaves vêm de config/empresa.ts e config/privacidade.ts. Só uma variante de cada item renderiza, conforme a decisão jurídica.

#### Título · `privacy.title`

- Política de Privacidade

#### Atualização · `privacy.updated`

- Última atualização: {data}

#### Rótulo do sumário · `privacy.toc_label`

- Nesta página

#### Quem trata os seus dados · `privacy.sections.controller`

- **Título**: Quem trata os seus dados
- **Corpo**: O controlador dos dados pessoais tratados neste site é {razao_social}, CNPJ {cnpj}, responsável pela Lemamon.dev (lemamon.dev), de São Paulo, SP. Para qualquer assunto sobre os seus dados, inclusive para exercer os seus direitos, escreva para {email}.
- **`body_individual`**: O controlador dos dados pessoais tratados neste site é {nome_do_responsavel}, responsável pela Lemamon.dev (lemamon.dev), de São Paulo, SP. Para qualquer assunto sobre os seus dados, inclusive para exercer os seus direitos, escreva para {email}.
- **`dpo`**: O encarregado pelo tratamento de dados pessoais é {nome_do_encarregado}, que atende pelo e-mail {email_do_encarregado}.

#### Dados que você informa · `privacy.sections.data_collected`

- **Título**: Dados que você informa
- **Corpo**: A gente recebe estes dados quando você envia um formulário ou fala com a gente:
- **Itens**
  - **`form_fields`**: Pelos formulários de orçamento e de contato: nome, e-mail, telefone ou WhatsApp, empresa, as respostas às perguntas, o canal de contato preferido, o assunto e a mensagem.
  - **`attribution`**: Junto com cada pedido: o idioma da página e a origem da visita, como o anúncio, a campanha ou o link que trouxe você ao site.
  - **`technical`**: No envio: dados técnicos que o serviço de recebimento dos formulários pode registrar, como o endereço IP e o navegador.
  - **`conversations`**: Pelo WhatsApp ou por e-mail: o que você enviar nessas conversas.
- **Rascunho**: Enquanto você responde ao formulário de orçamento, um rascunho com as suas respostas e a origem da visita fica guardado no seu navegador, para você continuar depois.
- **`draft_measurement`**: Desde a chegada ao site, a primeira página aberta e a origem da visita (o anúncio, a campanha ou o site que trouxe você) ficam guardadas no seu navegador enquanto a aba estiver aberta e seguem junto com o pedido se você enviar o formulário de orçamento ou o de contato. Se você abrir o site em outra aba enquanto essa continuar aberta, a aba nova usa a mesma origem. Se o pedido vier de um clique em anúncio do Google que não ficou guardado na aba, o identificador desse clique pode ser lido do cookie do Google Ads. Depois de um clique em anúncio do Google, as mensagens de WhatsApp que o site prepara levam uma referência curta da campanha (por exemplo, “Ref.: G-mvp”), que você vê e pode apagar antes de enviar. A origem da visita também é medida pelas ferramentas descritas em Dados de navegação.
- **`draft_ttl`**: Se o rascunho ficar 30 dias sem mudança, ele deixa de valer e é apagado na próxima vez que você abrir o site. Você também pode apagá-lo limpando os dados do site no navegador.
- **`after_send`**: Depois do envio, o rascunho é apagado, e um resumo do pedido fica só na aba aberta, para mostrar a página de confirmação, até você fechá-la.
- **Fechamento**: Nenhum campo pede dados sensíveis, como saúde, religião, opinião política ou biometria, e pedimos que você não os inclua nas mensagens.

#### Dados de navegação · `privacy.sections.navigation_data`

- **Título**: Dados de navegação
- **Corpo**: Usamos estas ferramentas de medição. Elas usam cookies e tecnologias parecidas:
- **Itens**
  - **`ga4`**: Google Analytics 4: mostra como o site é usado, por exemplo: páginas visitadas, botões clicados, etapas do formulário, tipo de aparelho e região aproximada. Quando um pedido de orçamento é enviado, o Google Analytics também recebe as respostas de múltipla escolha e a classificação automática do pedido, sem nome nem contato.
  - **`google_ads`**: Google Ads: usa cookies para ligar a sua visita ao anúncio em que você clicou e para registrar quando um pedido é enviado. Se o pedido veio de um anúncio, o identificador desse clique segue junto com ele e pode ser usado para informar ao Google Ads como o pedido evoluiu, para medir o resultado da campanha.
  - **`google_ads_with_remarketing`** _(variante: só quando o dado indicado existir)_: Google Ads: usa cookies para ligar a sua visita ao anúncio em que você clicou, para registrar quando um pedido é enviado e para mostrar anúncios da Lemamon.dev a quem já visitou o site. Se o pedido veio de um anúncio, o identificador desse clique segue junto com ele e pode ser usado para informar ao Google Ads como o pedido evoluiu, para medir o resultado da campanha.
  - **`new_relic`**: New Relic Browser: mede a velocidade e os erros das páginas e pode gravar uma reprodução de parte das visitas para encontrar falhas. Os formulários do site ficam fora dessas gravações, e nelas todo o texto da página e tudo o que você digita ficam mascarados.
- **`hosting_logs`**: Além da medição, a Netlify, que hospeda o site, registra dados técnicos de cada acesso, como o endereço IP, o navegador e a página aberta, para operar e proteger o site.
- **`controls`**: Você pode bloquear cookies nas configurações do seu navegador, e o site continua funcionando.
- **`controls_with_consent`** _(variante: só quando o dado indicado existir)_: Você escolhe no aviso de cookies quais ferramentas de medição aceita e pode mudar a escolha quando quiser em {preferencias_de_cookies}. Também pode bloquear cookies nas configurações do seu navegador, e o site continua funcionando.
- **`controls_scripts`**: Bloquear cookies não interrompe toda a medição. Para interromper, use um bloqueador de scripts no navegador.
- **`controls_ga_optout`**: No caso do Google Analytics, você também pode usar o {desativar_google_analytics}.
- **`controls_opposition`**: Para se opor ao uso dos seus dados na medição de anúncios, escreva para {email}. Se o seu pedido veio de um anúncio, a gente deixa de informar ao Google Ads como ele evoluiu.
- **`controls_google_account`**: Na sua conta Google, você também controla os anúncios que vê em {configuracoes_de_anuncios}.
- **`ads_settings_link_label`**: configurações de anúncios do Google
- **`ga_optout_link_label`**: complemento de desativação do Google Analytics
- **`cookie_preferences_link_label`**: preferências de cookies

#### Para que usamos · `privacy.sections.purposes`

- **Título**: Para que usamos
- **Corpo**: Usamos os dados para:
- **Itens**
  - **`respond`**: Responder ao seu pedido, marcar e conduzir o diagnóstico, enviar a devolutiva por escrito e, se você quiser continuar, combinar os próximos passos com você.
  - **`service_order`**: Organizar a ordem de atendimento dos pedidos. As respostas de múltipla escolha geram uma classificação automática de cada pedido, usada para organizar essa ordem.
  - **`service_order_with_routing`** _(variante: só quando o dado indicado existir)_: Organizar a ordem e a forma de atendimento dos pedidos. As respostas de múltipla escolha geram uma classificação automática de cada pedido, usada para isso.
  - **`follow_up`**: Retomar o contato se a conversa não chegar a ser marcada e responder a mensagens sobre outros assuntos.
  - **`attribution`**: Saber como você chegou ao site, por exemplo por um anúncio ou uma campanha. Isso inclui informar ao Google Ads que um pedido foi enviado depois de um clique em anúncio e como esse pedido evoluiu.
  - **`remarketing`**: Mostrar anúncios da Lemamon.dev a quem já visitou o site.
  - **`site`**: Entender como o site é usado, corrigir erros e medir o resultado dos anúncios, com os dados de navegação.
- **Fechamento**: Não vendemos dados pessoais.

#### Base legal · `privacy.sections.legal_basis`

- **Título**: Base legal
- **Corpo**: Cada uso dos dados tem uma base legal na LGPD:
- **Itens**
  - **Diagnóstico**: Atender ao seu pedido de diagnóstico e enviar a devolutiva e a proposta: procedimentos preliminares a um eventual contrato, feitos a seu pedido (art. 7º, V).
  - **`service_order`**: Organizar a ordem de atendimento, retomar o contato, responder a mensagens sobre outros assuntos e saber como o pedido chegou até a gente: legítimo interesse da Lemamon.dev (art. 7º, IX).
  - **`site_measurement`**: Medir o uso do site e corrigir erros: legítimo interesse (art. 7º, IX).
  - **`ads_measurement`**: Medir o resultado dos anúncios com cookies do Google Ads e informar ao Google Ads como evoluiu um pedido que veio de anúncio: legítimo interesse da Lemamon.dev (art. 7º, IX).
  - **`ads_measurement_with_consent`** _(variante: só quando o dado indicado existir)_: Medir o resultado dos anúncios com cookies do Google Ads e informar ao Google Ads como evoluiu um pedido que veio de anúncio: o seu consentimento, dado no aviso de cookies (art. 7º, I). Você pode retirá-lo quando quiser em {preferencias_de_cookies}.
  - **`remarketing`**: Mostrar anúncios da Lemamon.dev a quem já visitou o site: o seu consentimento, dado no aviso de cookies (art. 7º, I).
  - **`contract`**: Se um contrato for assinado: execução do contrato e cumprimento de obrigações legais (art. 7º, V e II).
- **Fechamento**: Quando a base é o legítimo interesse, você pode se opor ao tratamento escrevendo para {email}.

#### Com quem compartilhamos · `privacy.sections.processors`

- **Título**: Com quem compartilhamos
- **Corpo**: Os dados passam pelos fornecedores que fazem o site e o atendimento funcionarem:
- **Itens**
  - **`netlify`**: Netlify: hospedagem do site e recebimento dos formulários.
  - **`google_analytics`**: Google Analytics: medição do uso do site.
  - **`google_ads`**: Google Ads: medição do resultado dos anúncios. O Google também trata parte desses dados sob a política de privacidade dele.
  - **E-mail**: Gmail: o e-mail da Lemamon.dev. É um serviço do Google, que trata os dados também sob a política de privacidade dele.
  - **`email_with_workspace`** _(variante: só quando o dado indicado existir)_: Google Workspace: o e-mail da Lemamon.dev.
  - **`new_relic`**: New Relic: desempenho e erros do site.
- **WhatsApp**: Se você falar com a gente pelo WhatsApp, a conversa passa pelo WhatsApp, serviço da Meta: a Lemamon.dev recebe o que você envia, e a Meta trata os dados da conversa sob a política de privacidade dela.
- **Fechamento**: Esses fornecedores e o WhatsApp armazenam dados fora do Brasil, principalmente nos Estados Unidos. Também compartilhamos dados quando a lei ou uma autoridade competente exigir.
- **`closing_with_mechanism`** _(variante: só quando o dado indicado existir)_: Esses fornecedores e o WhatsApp armazenam dados fora do Brasil, principalmente nos Estados Unidos, com base em {mecanismo_transferencia} (LGPD, art. 33). Também compartilhamos dados quando a lei ou uma autoridade competente exigir.

#### Por quanto tempo guardamos · `privacy.sections.retention`

- **Título**: Por quanto tempo guardamos
- **Corpo**: Guardamos os dados por estes prazos:
- **Itens**
  - **`requests`**: Pedidos e mensagens que não viram contrato: {prazo_retencao_pedidos}. Depois disso, apagamos esses dados do recebimento de formulários, do nosso e-mail e do nosso WhatsApp.
  - **`contract`**: Pedidos e mensagens ligados a um contrato assinado: pelo tempo que a lei exigir.
  - **`navigation_ga4`**: Dados de navegação no Google Analytics: {prazo_ga4}.
  - **`navigation_google_ads`**: Cookies do Google Ads no seu navegador: {prazo_google_ads}.
  - **`google_ads_conversions`**: Conversões informadas ao Google Ads: {prazo_conversoes_google_ads}.
  - **`navigation_new_relic`**: Dados de navegação e gravações no New Relic: {prazo_new_relic}.
  - **`access_logs`**: Registros de acesso na Netlify: {prazo_logs_hospedagem}.
- **Fechamento**: Você pode pedir a exclusão dos seus dados a qualquer momento pelo e-mail {email}, salvo quando a lei obrigar a guardá-los.

#### Seus direitos · `privacy.sections.rights`

- **Título**: Seus direitos
- **Corpo**: Pela LGPD (art. 18), você pode pedir a qualquer momento:
- **Itens**
  - **`confirmation_access`**: A confirmação de que tratamos os seus dados e o acesso a eles.
  - **`correction`**: A correção do que estiver incompleto, errado ou desatualizado.
  - **`anonymization_deletion`**: A anonimização, o bloqueio ou a exclusão do que for desnecessário, excessivo ou tratado em desacordo com a LGPD.
  - **`portability`**: A portabilidade dos seus dados.
  - **`sharing_info`**: A informação sobre com quem compartilhamos os seus dados.
  - **`consent_revocation`**: A revogação do consentimento, quando ele for a base do tratamento.
  - **`consent_deletion`**: A eliminação dos dados tratados com o seu consentimento.
  - **`consent_refusal_info`**: A informação sobre a possibilidade de não consentir e sobre o que acontece se você não consentir.
  - **`opposition`**: A oposição a um tratamento.
  - **`automated_review`**: A revisão de decisões tomadas só com base em tratamento automatizado, como a classificação que organiza a ordem de atendimento dos pedidos (art. 20).
  - **`automated_review_with_routing`** _(variante: só quando o dado indicado existir)_: A revisão de decisões tomadas só com base em tratamento automatizado, como a classificação que organiza a ordem e a forma de atendimento dos pedidos (art. 20).
- **Fechamento**: Basta escrever para {email}, e a gente responde dentro do prazo previsto na lei. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).

#### Fale com a gente sobre privacidade · `privacy.sections.contact`

- **Título**: Fale com a gente sobre privacidade
- **Corpo**: Pedidos e dúvidas sobre os seus dados: {email}. Escreva “Privacidade” no assunto para a gente identificar o pedido. Se esta política mudar, a data no topo da página é atualizada.

### Componentes compartilhados

Textos que aparecem em várias páginas: cabeçalho, rodapé, botões, WhatsApp, barras, idiomas, linha do método, investimento, prova, perfis, termos explicados, avisos de LGPD, erros e 404.

#### Link 'pular para o conteúdo' · `shared.skip_link`

- Pular para o conteúdo

#### Acessibilidade · `shared.a11y`

- **`open_menu`**: Abrir menu
- **`close_menu`**: Fechar menu
- **`opens_new_tab`**: (abre em nova aba)
- **`main_nav`**: Navegação principal
- **`footer_nav`**: Navegação do rodapé
- **`loading`**: Carregando…

#### Copiar · `shared.clipboard`

- **`copy`**: Copiar
- **`copied`**: Copiado
- **`copy_email_aria`**: Copiar o e-mail {email}
- **`copied_email`**: E-mail copiado

#### Cabeçalho · `shared.header`

- **`logo_label`**: Lemamon.dev, página inicial
- **`nav`**
  - **`services`**: Serviços
  - **`how_we_work`**: Como trabalhamos
  - **`pricing`**: Quanto custa
  - **`cases`**: Cases
  - **`about`**: Sobre
  - **`contact`**: Contato
- **`services_menu`**
  - **`web_systems`**: Sistemas web
  - **`mobile_apps`**: Aplicativos
  - **`integrations`**: Integrações e automação
  - **`mvp`**: MVP e produtos digitais
  - **Sustentação e evolução**: Sustentação e evolução
  - **`discovery_label`**: Antes de construir: Sprint de Descoberta
  - **`all_services`**: Todos os serviços
- **`menu_button`**: Menu
- **WhatsApp**: WhatsApp

#### Cabeçalho do orçamento (modo foco) · `shared.focus_header`

- **`progress`**: Pergunta {n} de {total}
- **`help_whatsapp`**: Dúvidas? WhatsApp
- **`logo_label_saved`**: Lemamon.dev, voltar à página inicial
- **`logo_saved_hint`**: Suas respostas ficam salvas neste navegador.

#### Rodapé · `shared.footer`

- **`tagline`**: Software sob medida com escopo, prazo e preço combinados antes de começar.
- **Localização**: São Paulo, SP, Brasil
- **`col_services`**: Serviços
- **`col_company`**: Lemamon.dev
- **`col_contact`**: Fale com a gente
- **`links`**
  - **`discovery_sprint`**: Sprint de Descoberta
  - **`how_we_work`**: Como trabalhamos
  - **`pricing`**: Quanto custa
  - **`cases`**: Cases
  - **`about`**: Sobre
  - **`blog`**: Blog
  - **`contact`**: Contato
  - **`privacy`**: Política de Privacidade
- **`email_label`**: E-mail
- **Perfis**
  - **`linkedin`**: LinkedIn
  - **`github`**: GitHub
  - **`medium`**: Medium
- **`copyright`**: © {ano} Lemamon.dev
- **`company_id`**: {razao_social} · CNPJ {cnpj}

> Com `hasCompanyData` (ligado desde 20/10/2026, D39) sai "Lemamon.dev LTDA · CNPJ 69.700.690/0001-98": na barra inferior do rodapé e, no rodapé mínimo do /orcamento, numa linha própria.

- **`language_label`**: Escolher idioma

#### Botões e chamadas · `shared.cta`

- **CTA primário**: Pedir diagnóstico gratuito
- **`primary_short`**: Pedir diagnóstico
- **`primary_method`**: Começar pelo diagnóstico gratuito
- **`primary_schedule`** _(só com agenda online)_: Agendar diagnóstico gratuito
- **`continue_order`**: Continuar meu pedido
- **WhatsApp**: Falar no WhatsApp
- **`whatsapp_questions`**: Tirar dúvidas no WhatsApp
- **`see_how_we_work`**: Ver como trabalhamos
- **`see_method_detail`**: Ver cada etapa em detalhe
- **`see_service`**: Ver como funciona
- **`see_service_aria`**: Ver como funciona: {servico}
- **`see_all_services`**: Ver todos os serviços
- **`see_all_cases`**: Ver todos os cases
- **`read_case`**: Ler o case
- **`read_case_aria`**: Ler o case: {case}
- **`back_home`**: Voltar ao início
- **`microcopy_diagnosis`**: Gratuito · 45 minutos · devolutiva por escrito
- **`microcopy_no_commitment`**: Gratuito e sem compromisso de contratar

#### Mensagens de WhatsApp por página · `shared.whatsapp`

- **`floating_label`**: Falar no WhatsApp
- **`message_page`**: Olá! Vim pelo site da Lemamon.dev, na página “{pagina}”, e quero conversar sobre um projeto.
- **`message_home`**: Olá! Vim pelo site da Lemamon.dev e quero conversar sobre um projeto.
- **`message_service`**: Olá! Vim pela página de {servico_frase} da Lemamon.dev e quero conversar sobre o meu caso.
- **`message_case`**: Olá! Vim pelo case {case} e quero algo parecido.
- **`message_contact`**: Olá! Vim pela página de contato da Lemamon.dev. O assunto é:

#### Barra fixa (mobile) · `shared.sticky_bar`

- **Rótulo de acessibilidade**: Ações rápidas
- **`whatsapp_label`**: Falar no WhatsApp

#### Trilha de navegação · `shared.breadcrumb`

- **Rótulo de acessibilidade**: Você está em
- **`home`**: Início
- **`services`**: Serviços
- **`how_we_work`**: Como trabalhamos
- **`discovery_sprint`**: Sprint de Descoberta
- **`cases`**: Cases
- **`blog`**: Blog

#### Idiomas · `shared.language`

- **`selector_label`**: Escolher idioma
- **`pt`**: Português
- **`en`**: English
- **`es`**: Español
- **`pt_short`**: PT
- **`en_short`**: EN
- **`es_short`**: ES
- **`suggestion_banner`**: Esta página também está disponível em português.
- **`suggestion_link`**: Ver em português
- **`suggestion_dismiss`**: Fechar aviso de idioma

#### CTA final (padrão do site) · `shared.cta_final`

- **`title_default`**: Comece por 45 minutos de conversa
- **`text_default`**: Você conta o problema, mesmo sem escopo pronto, e recebe uma devolutiva por escrito, contratando ou não. Até aprovar o desenvolvimento, você não paga nada.
- **`deadline_line`**: Tem uma data que o software precisa cumprir? Conte no diagnóstico. Ela entra no plano com prazo e preço, e você sabe antes do desenvolvimento o que cabe até lá.
- **`how_it_works_title`**: Como funciona
- **`how_it_works_steps`**
  - **Resposta**: Você responde 6 perguntas de múltipla escolha e vê o resumo do seu projeto antes de deixar o seu contato.
  - **`contact`**: A gente lê as suas respostas e fala com você pelo canal que você escolher para marcar os 45 minutos.
  - **`contact_with_agenda`** _(variante: só quando o dado indicado existir)_: Logo depois de enviar, você escolhe o horário da conversa.
  - **Diagnóstico**: Conversa de 45 minutos e, depois, a devolutiva por escrito.
  - **`diagnosis_with_format`** _(variante: só quando o dado indicado existir)_: Conversa de 45 minutos, {formato_diagnostico}, com {participantes_diagnostico}. Depois, a devolutiva por escrito.
- **`email_line_label`**: Prefere e-mail?
- **Localização**: São Paulo, SP

#### Investimento (faixas de preço) · `shared.investment`
> **Condicional:** `hasPricing`. Some por inteiro sem faixas.

- **Título**: Faixas de referência de investimento
- **Introdução**: Servem para você se planejar antes da conversa. O preço do desenvolvimento do seu projeto é fechado antes de ele começar.
- **`diagnosis_line`**: Diagnóstico: gratuito
- **`discovery_line`** _(linha fixa, fora da sustentação; D44)_: Sprint de Descoberta: gratuita, se for necessária
- **`row_labels`** _(sem linha da Descoberta desde a D44)_
  - **`development_web_systems`**: Desenvolvimento de sistema web
  - **`development_mobile_apps`**: Desenvolvimento de aplicativo
  - **`development_integrations`**: Integrações e automação
  - **`development_mvp`**: Desenvolvimento de MVP
  - **Sustentação e evolução**: Sustentação e evolução
- **`unit_project`**: por projeto
- **`unit_month`**: por mês
- **`value_drivers_label`**: O que faz o valor variar
- **Nota**: Referência, não proposta.
- **`cta_lead`**: O caminho até o preço fechado do seu projeto começa pelo diagnóstico gratuito.
- **`faq_link`**: Ver faixas de referência

#### Prova (cases, depoimentos, logos, time) · `shared.proof`
> **Condicional:** rótulos de cases, depoimentos, logos e time; cada um só com o dado correspondente.

- **`logos_label`**: Empresas que já trabalharam com a Lemamon.dev
- **`logo_alt`** _(alternativa ao rascunho, para o dono escolher)_: {empresa}
- **`testimonial_hidden_title`**: Depoimentos de clientes
- **`case_card`**
  - **`service_label`**: Serviço
  - **`sector_label`**: Setor
  - **`problem_label`**: O problema
  - **`delivered_label`**: O que foi entregue
  - **`result_label`**: O resultado
- **`team_card`**
  - **`photo_alt`** _(alternativa ao rascunho, para o dono escolher)_: {nome}, {papel} na Lemamon.dev
  - **`linkedin`**: LinkedIn de {nome}
  - **`github`**: GitHub de {nome}

#### Perfis públicos · `shared.profiles`
> **Condicional:** cada perfil só com `publicar: true` em perfis.ts (no rodapé os três aparecem sempre).

- **`github`**
  - **Nome**: GitHub
  - **Texto**: O código que a gente publica, para quem vai avaliar a parte técnica.
- **`linkedin`**
  - **Nome**: LinkedIn
  - **Texto**: A Lemamon.dev no LinkedIn: o que a gente faz e publica.
- **`medium`**
  - **Nome**: Medium
  - **Texto**: Os artigos que a gente escreve.

#### Termos explicados · `shared.terms`

- **`prioritized_scope`**: Escopo priorizado: a lista do que o software vai fazer, em ordem, com o que entra primeiro e o que fica para depois.
- **`mvp`**: MVP (produto mínimo viável): a menor versão do produto que já resolve o problema principal para usuários reais.
- **`api`**: API: a porta de conexão de um sistema, por onde outros sistemas trocam informações com ele.
- **`discovery_sprint`**: Sprint de Descoberta: a etapa gratuita antes do desenvolvimento, quando o diagnóstico mostra que ela é necessária. Nela, o problema vira escopo priorizado e um plano com prazo e preço fechados.
- **Sustentação e evolução**: Sustentação: o cuidado com o sistema depois que ele entra no ar, com correções, atualizações e novas funcionalidades.
- **`written_feedback`**: Devolutiva por escrito: o retorno que você recebe depois dos 45 minutos de conversa. Por ser escrita, dá para ler com calma e repassar a quem decide com você.
- **`written_feedback_with_content`** _(variante: só quando o dado indicado existir)_: Devolutiva por escrito: o retorno depois dos 45 minutos de conversa, com {conteudo_da_devolutiva}. Dá para repassar a quem decide com você.

#### Aviso de privacidade nos formulários · `shared.lgpd`

- **`form_notice`**: Usamos estes dados para responder ao seu contato e registramos como você chegou ao site, por exemplo por um anúncio. Os detalhes estão na {politica}.
- **`privacy_link_label`**: Política de Privacidade

#### Formulários · `shared.forms`

- **`optional_suffix`**: (opcional)
- **`required_hint`**: obrigatório
- **Enviando**: Enviando…
- **`email_suggestion`** _(abaixo do e-mail, sem bloquear o envio)_: Você quis dizer {email}? · botão **Corrigir**

#### Mensagens de erro · `shared.errors`

- **`generic_title`**: Não conseguimos concluir agora
- **`generic_text`**: Tente de novo em alguns instantes. Se o problema continuar, fale com a gente pelo WhatsApp ou escreva para {email}.
- **`generic_text_no_whatsapp`** _(variante sem WhatsApp configurado)_: Tente de novo em alguns instantes. Se o problema continuar, escreva para {email}.
- **`network`**: Não conseguimos enviar. O que você preencheu continua aqui: confira a sua conexão e tente de novo.
- **Tentar de novo**: Tentar de novo
- **`required`**: Preencha este campo.
- **`invalid_email`**: Confira o e-mail. Ele precisa ter o formato nome@exemplo.com.
- **`invalid_phone`**: Confira o número com DDD, por exemplo: (11) 99999-9999. Fora do Brasil, comece com + e o código do país.

#### Página 404 · `shared.not_found`

- **Título**: Esta página não existe
- **Texto**: O endereço pode ter mudado. Estes caminhos podem ajudar:
- **`link_home`**: Início
- **`link_how_we_work`**: Como trabalhamos
- **`link_services`**: Serviços
- **`link_pricing`**: Quanto custa

> Já mostrados nas páginas: `shared.commitments` e `shared.method_timeline` e `shared.decision_points` (Home), `shared.discovery_deliverables` (Sprint de Descoberta).

### SEO: títulos, descrições e imagem de compartilhamento

O que aparece no Google e na prévia de links (WhatsApp, LinkedIn). Title até 60 caracteres, description até 155.

#### Metadados · `meta`

- **Nome do site**: Lemamon.dev
- **Descrição da organização**: Lemamon.dev, de São Paulo, SP, desenvolve software sob medida para empresas e startups: sistemas web, aplicativos, integrações, MVPs e sustentação, com escopo, prazo e preço combinados antes de começar.
- **`default_og_image_alt`** _(alternativa ao rascunho, para o dono escolher)_: lemamon.dev: software sob medida com escopo, prazo e preço fechados. Diagnóstico gratuito de 45 minutos. Para PMEs e startups. São Paulo, SP.
- **`default_og_image_text`**
  - **`brand`**: lemamon.dev
  - **`headline`**: Software sob medida com escopo, prazo e preço fechados
  - **`support_line`**: Diagnóstico gratuito de 45 minutos
  - **`audience_line`**: Para PMEs e startups · São Paulo, SP
- **`home`**
  - **Título**: Desenvolvimento de software sob medida em São Paulo | Lemamon.dev
  - **Descrição**: Software sob medida: sistemas, apps, integrações e MVPs com escopo, prazo e preço fechados antes de construir. Peça o diagnóstico gratuito de 45 minutos.
- **`how_we_work`**
  - **Título**: Desenvolvimento de software com preço fechado | Lemamon.dev
  - **Descrição**: Escopo, prazo e preço fechados antes de construir o seu software. Diagnóstico de 45 min e Sprint de Descoberta gratuitos; entregas a cada 2 semanas.
- **`discovery_sprint`**
  - **Título**: Sprint de Descoberta: do problema ao preço fechado | Lemamon.dev
  - **Descrição**: O seu problema vira escopo priorizado e plano com prazo e preço fechados. Discovery de produto gratuito, feito após o diagnóstico de 45 minutos.
- **`services_hub`**
  - **Título**: Serviços de desenvolvimento de software | Lemamon.dev
  - **Descrição**: Sistemas web, aplicativos, integrações e MVPs com escopo, prazo e preço combinados antes de começar, e sustentação e evolução depois que entram no ar.
- **`services_web_systems`**
  - **Título**: Desenvolvimento de sistemas para empresas | Lemamon.dev
  - **Descrição**: Sistema de gestão, ERP, CRM, painéis e portal do cliente feitos para o processo da sua empresa, com escopo, prazo e preço fechados antes de construir.
- **`services_mobile_apps`**
  - **Título**: Desenvolvimento de aplicativo sob medida | Lemamon.dev
  - **Descrição**: Desenvolvimento de aplicativo sob medida para empresas, no iOS e no Android: escopo e preço fechados antes de construir e entregas a cada 2 semanas.
- **`services_integrations`**
  - **Título**: Integração de sistemas e automação de processos | Lemamon.dev
  - **Descrição**: Integração de sistemas e automação: ERP, e-commerce, pagamento e CRM trocando dados sozinhos. Escopo, prazo e preço combinados antes de começar.
- **`services_mvp`**
  - **Título**: Desenvolvimento de MVP com prazo e preço fechados | Lemamon.dev
  - **Descrição**: Desenvolvimento de MVP para startups: a primeira versão do produto nas mãos de usuários reais, com prazo e preço fechados e entregas a cada 2 semanas.
- **`services_support`**
  - **Título**: Manutenção de software: sustentação e evolução | Lemamon.dev
  - **Descrição**: Correções, atualizações e novas funcionalidades para o seu sistema no ar. No diagnóstico gratuito, a gente avalia com você se a sustentação faz sentido.
- **`pricing`**
  - **Título**: Quanto custa desenvolver um sistema ou aplicativo? | Lemamon.dev
  - **Descrição**: O que pesa no preço de um sistema ou aplicativo, como comparar propostas e como chegar a escopo, prazo e preço fechados antes do desenvolvimento.
- **`quote`**
  - **Título**: Orçamento de software: diagnóstico gratuito | Lemamon.dev
  - **Descrição**: Orçamento de desenvolvimento de software: em 6 perguntas, veja o que pesa no prazo e no preço do seu caso e peça o diagnóstico gratuito de 45 minutos.
- **`quote_sent`**
  - **Título**: Pedido recebido | Lemamon.dev
  - **Descrição**: Seu pedido de diagnóstico gratuito chegou à Lemamon.dev. Veja o que acontece agora e como aproveitar os 45 minutos de conversa.
- **`contact`**
  - **Título**: Contato | Lemamon.dev · software sob medida em São Paulo
  - **Descrição**: Contato da Lemamon.dev: WhatsApp, e-mail e um formulário curto. Para projeto novo, comece pelo diagnóstico gratuito de 45 minutos, com devolutiva por escrito.
  - **`description_no_whatsapp`** _(variante sem WhatsApp configurado)_: Contato da Lemamon.dev: e-mail e um formulário curto. Para projeto novo, comece pelo diagnóstico gratuito de 45 minutos, com devolutiva por escrito.
- **`cases_hub`**
  - **Título**: Cases de desenvolvimento de software | Lemamon.dev
  - **Descrição**: Projetos de software sob medida: o problema de cada cliente, o que foi combinado, o que foi entregue e, quando o cliente autoriza, o resultado.
- **`case_template`**
  - **Título**: {tipo_de_sistema} para {cliente_ou_setor} | Lemamon.dev
  - **Descrição**: {cliente_ou_setor}: {problema_resolvido}. O que foi combinado, o que foi entregue e como foi o projeto.
- **`about`**
  - **Título**: Lemamon.dev: desenvolvimento de software em São Paulo
  - **Descrição**: Quem faz a Lemamon.dev, empresa de desenvolvimento de software em São Paulo, SP, e por que a gente combina escopo, prazo e preço antes de construir.
- **`blog_hub`**
  - **Título**: Blog: como contratar e avaliar software | Lemamon.dev
  - **Descrição**: Artigos escritos por quem constrói software, para quem vai contratar um projeto e para quem precisa avaliá-lo tecnicamente.
- **`blog_post_template`**
  - **Título**: {titulo_do_post} | Lemamon.dev
  - **Descrição**: {resumo}
- **`privacy`**
  - **Título**: Política de Privacidade | Lemamon.dev
  - **Descrição**: Como a Lemamon.dev trata os dados que você informa nos formulários e os dados de navegação do site, e como exercer os seus direitos pela LGPD.
- **`not_found`**
  - **Título**: Página não encontrada | Lemamon.dev
  - **Descrição**: Esta página não existe ou mudou de endereço. Veja os caminhos para os serviços, o método e o diagnóstico gratuito da Lemamon.dev.

---

## 3. Variações de headline para teste A/B

As listas abaixo vieram dos revisores. Algumas foram escritas na rodada 3 e marcadas como "publicada" naquela versão; o texto que está no ar na versão final aparece primeiro em cada página. Regra para qualquer teste: nenhuma variação pode trazer número além de "45 minutos" e "a cada 2 semanas", nem prova que ainda não existe.

### Home (H1)

**No ar:** "Software sob medida com escopo, prazo e preço combinados antes de começar."

| Variação | Para quem | Texto |
|---|---|---|
| Controle | método + keyword | Software sob medida com escopo, prazo e preço combinados antes de começar. |
| Método | a síntese no H1; a keyword fica no sobretítulo e no title | Primeiro a gente combina escopo, prazo e preço. Depois a gente constrói. |
| Decisão/risco | Cláudia, medo de assinar no escuro | Escopo, prazo e preço fechados antes de você decidir construir. |
| Dor operacional | Cláudia, tráfego de busca "sistema para empresa" | Sua operação não cabe mais na planilha. Nem em orçamento no escuro. |
| Fundador | Rafael; ideal para anúncios e landing de MVP | Tire o produto do papel sabendo escopo, prazo e preço antes. |

### Como trabalhamos (H1)

**No ar:** "Desenvolvimento de software com escopo, prazo e preço fechados" (versão com foco em SEO).

- Escopo, prazo e preço fechados antes de construir o seu software
- Primeiro a gente combina escopo, prazo e preço. Depois a gente constrói. (crença)
- Você só paga o desenvolvimento depois de saber escopo, prazo e preço (risco)

### Sprint de Descoberta (H1)

**No ar:** "Sprint de Descoberta: do problema ao plano com escopo, prazo e preço fechados"

- Sprint de Descoberta: escopo, prazo e preço fechados antes do desenvolvimento
- Sprint de Descoberta: saiba o que construir e quanto custa antes de começar (pergunta do comprador)
- Sprint de Descoberta: um preço que você consegue defender para os sócios (aprovação com sócio)

### Quanto custa (H1 e abertura)

**No ar:** "Quanto custa desenvolver um sistema ou aplicativo sob medida?"

- Quanto custa desenvolver um software sob medida?
- Quanto custa um software sob medida? (texto-guia original do BLUEPRINT)
- Quanto custa desenvolver um sistema para a sua empresa? (keyword primária)
- Quanto custa um software sob medida, e como chegar a um preço fechado (promessa do método)
- Abertura: "Resposta honesta: depende do escopo." (no ar) × "Resposta direta: depende do escopo."

### Serviços

| Página | No ar | Variações |
|---|---|---|
| Hub | Serviços de desenvolvimento de software para empresas | O que a Lemamon.dev desenvolve, com escopo, prazo e preço fechados · Desenvolvimento de software sob medida: sistemas, apps e integrações |
| Sistemas web | Desenvolvimento de sistemas web sob medida para empresas | Sistema sob medida para o jeito que a sua empresa trabalha · Desenvolvimento de sistemas para empresas, com preço fechado antes de começar |
| Aplicativos | Desenvolvimento de aplicativos sob medida para empresas | Aplicativo sob medida para a sua empresa, com preço fechado antes de programar · Criar aplicativo para empresa, com escopo, prazo e preço fechados antes |
| Integrações | Integração de sistemas e automação de processos | Integração de sistemas: cada informação digitada uma vez só · Integração de sistemas e automação, com escopo, prazo e preço fechados antes |
| MVP | Desenvolvimento de MVP: a primeira versão do seu produto nas mãos de usuários reais | Desenvolvimento de MVP com escopo, prazo e preço fechados antes de programar · MVP para startup: o essencial nas mãos de usuários, sem queimar o caixa construindo a coisa errada |
| Sustentação | Manutenção de software: sustentação e evolução contínua | Manutenção e evolução de software para o sistema que já está no ar · Sustentação de sistemas: o que está no ar, cuidado e evoluindo |

### Orçamento (H1 do wizard)

**No ar (controle):** "Orçamento de software sob medida: comece pelo diagnóstico gratuito"

- Orçamento de software sem chute: comece pelo diagnóstico gratuito
- Orçamento de software: antes do preço, um diagnóstico gratuito
- Quer um orçamento de software? Comece por 45 minutos de diagnóstico
- Seu orçamento de software começa por 6 perguntas e 45 minutos

### Elementos de estrutura

| Onde | No ar | Variações |
|---|---|---|
| Title da Home (resultado do Google) | Desenvolvimento de software sob medida \| Lemamon.dev (48 caracteres, keyword exata) | Software sob medida com prazo e preço fechados \| Lemamon.dev · Software sob medida: escopo, prazo e preço fechados (sem marca, 51) · Software sob medida com preço fechado antes de começar (sem marca, 54) · Desenvolvimento de software sob medida com preço fechado (sem marca, 56; disputa a keyword de Como trabalhamos) |
| Título do CTA final padrão | Comece por 45 minutos de conversa | O primeiro passo é gratuito: 45 minutos · Antes de qualquer preço, 45 minutos de conversa · Seu caso, 45 minutos, devolutiva por escrito |
| Tag da Descoberta na linha do método | Gratuita · se for necessária (D44) | Gratuita · quando necessária · Gratuita |
| Item do menu de serviços | Antes de construir: Sprint de Descoberta | ("Todo projeto passa por aqui" saiu: desde a D44, a Descoberta só acontece quando necessária) |

---

## 4. O que melhora quando você confirmar dados

Lista consolidada dos 5 documentos, na ordem de alavancagem (BLUEPRINT §14 e notas dos documentos). Os textos já estão escritos como variantes ou rascunhos nos JSON; confirmar o dado só liga o que já existe ou permite a mudança descrita.

### 4.1 Mudança de escopo (`confirmacoes.escopoMudanca`), prioridade 1

É a objeção central do Rafael e da Cláudia, e hoje nenhuma página a responde.

- **Home:** completar a resposta do par "preço que só cresce" com "se o escopo mudar, escopo, prazo e preço são combinados de novo antes de seguir" e mostrar a pergunta `scope_change` no FAQ.
- **Faixa "Onde você decide"** (`shared.decision_points`): um terceiro ponto, "Se o escopo mudar, escopo, prazo e preço são combinados de novo antes de seguir".
- **/como-trabalhamos:** publicar a pergunta no FAQ e acrescentar à tabela comparativa a linha "Mudança de escopo" (sem combinado: vira briga ou aditivo surpresa; com o método: tudo combinado de novo antes de seguir).
- **/quanto-custa:** a pergunta "O que acontece se o escopo mudar?" volta à régua de comparação, com a resposta da Lemamon.dev já escrita. Hoje ela fica fora para a régua não reprovar a própria Lemamon.dev.
- **Serviços MVP e Sistemas web:** "E se eu precisar mudar o escopo?" ao lado da pergunta sobre o que entra na primeira versão.

### 4.2 Propriedade do código (`confirmacoes.codigoProprietario`)

Escolha entre os dois rascunhos de `faq.conditional.code_ownership`: "é da sua empresa, e isso fica escrito no contrato" ou "passa para você conforme cada etapa é paga". O resto do site segue a escolha.

- **Home:** um 5º par de riscos, "Ficar preso ao fornecedor e ao código dele" → "O código é da sua empresa".
- **Faixa de compromissos e rodapé:** o compromisso "O código é do seu negócio".
- **/como-trabalhamos e /quanto-custa:** linha "Código" na tabela comparativa (do fornecedor × da sua empresa) e uma 7ª pergunta na régua ("De quem é o código no fim?").
- **Serviço MVP:** publicar `code_ownership` e a variante de "Como eu sei que o projeto não vai parar no meio?" que termina com "E o código desenvolvido é da sua empresa". Possível reforço no subtítulo ("sem ficar refém de uma pessoa").

### 4.3 Pessoas e empresa (`hasTeam`, `hasCompanyData`, `notaFiscal`)

- **Pelo menos 1 pessoa completa (foto, nome, papel):** libera a seção Time da Home, a página /sobre e o item "Sobre" no menu. Permite dizer quem conduz o diagnóstico (etapa 1 da Home e de /como-trabalhamos, pós-envio e /contato) e responder "quem vai tocar o meu produto?" na página de MVP. "Você fala com quem escreve o código" continua proibido até você confirmar.
- **Razão social e CNPJ (`empresa.ts`):** CNPJ no rodapé, perto do CTA final da Home e de /quanto-custa, no rodapé mínimo do /orcamento e em /contato. Responde a pergunta da Cláudia "vocês têm CNPJ?" e a dúvida "é freelancer?". O controlador da Política é obrigatório de qualquer forma (ver seção 6).
- **Nota fiscal (`notaFiscal`):** publica o FAQ `invoice` (com CNPJ, na variante `question_with_company_data`) e o selo "Emitimos nota fiscal" junto de "São Paulo, SP".

### 4.4 Perfis públicos (`perfis.ts`, `publicar`)

Marcar só os perfis com conteúdo público recente. Libera "Confira antes de conversar" na Home e permite que os cartões de perfil citem o conteúdo real (temas do Medium, projetos do GitHub). É o primeiro lugar que o Marcos confere.

### 4.5 Diagnóstico: conteúdo, formato e prazos

- **Conteúdo da devolutiva (`devolutivaConteudo`):** a etapa 1 da Home, os CTAs finais, `shared.terms.written_feedback_with_content`, a entrada e o pós-envio do orçamento, o cartão de /contato e as respostas de FAQ passam a dizer o que vem na devolutiva (ex.: o caminho recomendado e os principais riscos). É a principal alavanca da oferta gratuita.
- **Formato do diagnóstico (`formatoDiagnostico`):** publica `faq.conditional.diagnosis_format` e a variante `diagnosis_with_format` do "Como funciona" ("vou falar com alguém técnico?").
- **Prazo da devolutiva, se você se comprometer com um:** entra no pós-envio e nas etapas do diagnóstico.
- **Prazo de resposta ao pedido, se você se comprometer com um:** "a gente responde em até X" no CTA final da Home, no passo `contact` do "Como funciona", na description de /contato, no pós-envio e na mensagem de sucesso de /contato. Reduz a ansiedade depois do envio, onde "quem responde primeiro leva".
- **Agenda online (`hasAgenda`):** o CTA vira "Agendar diagnóstico gratuito" e o passo 2 do "Como funciona" vira "Você escolhe o horário na hora"; o pós-envio oferece o horário.
- **Canal "Ligação" (`ligacao`):** liga a opção no formulário do orçamento.

### 4.6 Sprint de Descoberta

- **Decisão do dono de 21/10/2026 (D44, revoga a D42):** a Sprint de Descoberta é gratuita, só acontece quando o diagnóstico mostra que é necessária (necessidade e duração definidas com o cliente no diagnóstico) e não entrega protótipo. Saíram do site: a duração típica, o valor e o abatimento da Descoberta, o protótipo e a seção de investimento de /sprint-de-descoberta.
- **Duração (`duracaoDescoberta`):** ligada, só com a resposta sem número ("a necessidade e a duração são definidas com você no diagnóstico"). `descoberta.duracao` fica sempre `null`; "Como ela acontece" sai com formato, participantes e ritmo.
- **O plano é do cliente (`planoDoCliente`):** continua `false`. Se ligar, "e ficam com você, mesmo que não siga com a Lemamon.dev" nos 3 entregáveis e em "Antes e depois da Descoberta".
- **Começar sem Descoberta (`semDescoberta`):** a D44 já tornou a Descoberta condicional em todo o site ("nesta ordem" saiu, e as variantes `skip` do /orcamento viraram o texto base). A flag passa a publicar só o FAQ `skip_discovery`, com texto alinhado à D44; ligar = o dono aprovar esse texto. Atende o Marcos.

### 4.7 Preço e qualificação

- **Faixas de preço (`precos.ts`, `hasPricing`):** liga a seção Investimento em todo o site (filtrada por página), as faixas no topo de /quanto-custa (com "As faixas de referência estão logo abaixo" no lead), o link "Ver faixas de referência" nos FAQs de preço, as variantes `answer_with_pricing` e o bloco de preço no resumo do orçamento. Também troca o rótulo dos links para /quanto-custa nas páginas de serviço para "Ver quanto custa…". A Descoberta é gratuita e não tem linha (D44): o Investimento mostra "Sprint de Descoberta: gratuita, se for necessária" como linha fixa.
- **Faixas do orçamento (`qualificacao.ts`, `hasBudgetTiers`, `hasMonthlyTiers`):** a pergunta 5 do wizard passa a usar faixas, com rótulos e moeda definidos por você. Atenção à trava de score D (seção 6).
- **Condições de pagamento (`pagamento`):** publica `faq.conditional.payment_terms` com o texto que você aprovar.

### 4.8 Formatos e engenharia

- **Sustentação (`sustentacao.ts`, `hasSupportFormat`):** liga "Formato e contratação" na página de Sustentação, com o que inclui, como é contratada e canais. Cada campo só aparece preenchido; "Como erros urgentes são tratados" só com o seu texto. Sem SLA até você definir.
- **Engenharia (`engenharia.ts`, `hasEngineering`):** liga "Como a gente constrói" em /como-trabalhamos; na página de Integrações, protocolos e práticas (REST, webhooks, logs, reprocessamento) e a pergunta "Como o código é testado e revisado?" na régua. É a prova técnica do Marcos.

### 4.9 Prova: cases, depoimentos e logos

É o item de maior prazo de preparação. Exige autorização por escrito.

- **Cases (`hasCases`, pelo menos 2):** seção Cases da Home, /cases e cada case, "O método na prática" em /como-trabalhamos, casos relacionados por serviço e no pós-envio. Os perfis de "Para quem é" da Sprint podem citar um exemplo real. Com 3 ou mais cases num serviço, dá para testar um H1 com prova verificável (só números reais).
- **Depoimentos (`hasTestimonials`, nominais):** um depoimento sobre previsibilidade logo depois do método na Home.
- **Logos (`hasLogos`, pelo menos 4 autorizados):** faixa abaixo dos compromissos, com o rótulo "Empresas que já trabalharam com a Lemamon.dev".

### 4.10 Abrangência e outras confirmações

- **Outras cidades (`outrasCidades`):** o sobretítulo pode virar "São Paulo, SP · atendimento remoto"; publica `other_cities`; as versões en/es podem dizer quem atendem. Amplia o alcance de anúncios fora de São Paulo.
- **Sistema feito por outra empresa (`sistemaTerceiros`):** publica `third_party_system` na Sustentação; a sustentação e a opção do wizard "Preciso de quem cuide de um sistema que já está no ar" podem dizer explicitamente que o sistema pode ter sido feito por outra empresa. Muda o texto dos anúncios de "manutenção de sistema".
- **NDA (`nda`):** FAQ em /como-trabalhamos e /contato; assunto "NDA ou questionário de segurança" no formulário de contato.
- **Migração de dados (`migracaoDados`):** FAQ em Sistemas web, e o fator "Dados de planilhas ou sistemas antigos" passa a dizer quem migra.
- **Publicação nas lojas:** se a Lemamon.dev sempre publica, "pode incluir" vira afirmação.
- **Chatbot no WhatsApp oficial:** confirmar antes de manter "no WhatsApp" no exemplo de Integrações e antes de anunciar para "chatbot whatsapp para empresas".
- **Prazos típicos de desenvolvimento:** se você confirmar, permitem uma variante de H1 ou subtítulo com faixa de prazo para MVP e apps.
- **Time do cliente (`timeDoCliente`, sugerida):** responder se a Lemamon.dev trabalha junto com o time de tecnologia do cliente, pergunta do Marcos sem resposta hoje.
- **E-mail em domínio próprio:** troca `lemamon.dev@gmail.com` em todo o copy e simplifica a seção de fornecedores da Política.
- **GA4 instalado de fato:** confirmar ou remover o parágrafo do Google Analytics na Política.

---

## 5. Histórico de validação

### 5.1 Rodadas por documento

Banca de 7 revisores por rodada: Rafael, Cláudia e Marcos (personas), comercial, UX writer, SEO e compliance. "Aprovações" conta quantos dos 7 aprovaram a versão; a nota é a média da banca.

| Documento | Rodada 1 (v1) | Rodada 2 (v2) | Rodada 3 (v3) | Portão final |
|---|---|---|---|---|
| Home | 3/7 · nota 7,5 | 4/7 · 7,6 | 4/7 · 7,7 | v5 corrigida e aprovada |
| Método e preço | 1/7 · 7,3 | 0/7 · 7,4 | 1/7 · 7,4 | v5 corrigida e aprovada |
| Serviços | 0/7 · 7,3 | 3/7 · 7,6 | 3/7 · 7,8 | v5 corrigida e aprovada |
| Conversão | 1/7 · 7,3 | 2/7 · 7,9 | 5/7 · 8,1 | v5 corrigida e aprovada |
| Estrutura | 0/7 · 7,2 | 1/7 · 6,9 | 3/7 · 7,6 | v5 corrigida e aprovada |

Nenhum documento passou na banca dentro das 3 rodadas: em todas, o compliance ainda apontava bloqueios. Depois da rodada 3, a v4 e a v5 corrigiram os bloqueios listados na seção 6.1, e a v5 de cada documento passou no portão final ("fixed", depois "ok"). As versões en e es foram adaptadas a partir da v5 do pt e passaram por revisões próprias de tradução (en v1 a v3; es v1 a v3, e v1 a v2 na conversão); as notas da banca valem para o pt-BR.

### 5.2 As personas entrariam em contato?

As respostas abaixo são da rodada 3 (v3). Os bloqueios que elas citam foram corrigidos na v5; o que continua segurando o contato depende de dados que só você pode fornecer.

**Home**

| Revisor | Nota | Entraria? | Por quê, e o que segura |
|---|---|---|---|
| Rafael | 8 | Sim | Chamaria no WhatsApp para perguntar faixa de valor, duração da Descoberta e quem é a pessoa técnica; depois pediria o diagnóstico. O passo é de baixo risco, e a franqueza sobre a Descoberta paga dá mais confiança que um "orçamento grátis". Segura: nenhuma prova visível e a dúvida sobre mudança de escopo. |
| Cláudia | 8 | Sim | Conversa gratuita, devolutiva para mostrar ao sócio e sem compromisso. O que mais deu confiança: preço combinado antes e sistema funcionando a cada 2 semanas. Perguntaria preço aproximado, custo e duração da Descoberta, CNPJ e nota, quem são as pessoas e se já fizeram algo no setor dela. |
| Marcos | 6,5 | Ainda não | Nada na página deixa conferir quem está do outro lado (cases, time, perfis e CNPJ fora do ar). Abriria o GitHub e "Ver cada etapa em detalhe"; chamaria se houvesse trabalho público recente e respostas sobre código e mudança de escopo. |
| Comercial | 7,5 | Sim (Cláudia e Rafael) | A Cláudia se reconhece nos cards e em "antes de qualquer gasto"; o Rafael, no card do fundador e no MVP. O Marcos chega por Como trabalhamos e pelo GitHub, como previsto. Segura: nenhuma prova antes dos dados. |
| UX writer | 8 | Sim | A Cláudia entende o método sem jargão e vê que o primeiro passo é gratuito; o Rafael encontra "startups", MVP e o preço fechado. Sugeriu deixar explícito que a Lemamon.dev continua depois do lançamento. |
| SEO | 8,5 | Sim | A página leva do problema ao método e ao diagnóstico sem prometer o que não pode cumprir. Pesam o texto do link "quanto custa" e a prévia no WhatsApp. |
| Compliance | 7,5 | Sim (Cláudia), provavelmente (Rafael), talvez (Marcos) | A promessa de combinar antes tira o medo de "pagar, atrasar e não funcionar". Bloqueava a leitura de que a Lemamon.dev assume sistema de terceiros e o plural no time (corrigidos). |

**Método e preço** (/como-trabalhamos, /sprint-de-descoberta, /quanto-custa e FAQ)

| Revisor | Nota | Entraria? | Por quê, e o que segura |
|---|---|---|---|
| Rafael | 7,5 | Sim, pelo WhatsApp | Risco quase zero, e o método responde "como não ser enganado no preço". Perguntaria quem constrói, ordem de grandeza e duração da Descoberta, se o código é dele e o que acontece se o escopo mudar. Quase fechou a aba quando a régua de /quanto-custa respondia "leve para o diagnóstico" (corrigido). |
| Cláudia | 7,5 | Sim, pelo WhatsApp | Gratuito, 45 minutos e algo por escrito para o sócio. Perguntaria custo da Descoberta, CNPJ e nota, código, pagamento e mudança de escopo. O que mais a moveria: a faixa da Descoberta em `precos.ts`. |
| Marcos | 7,5 | Ainda não | Confere GitHub e LinkedIn antes de falar, e engenharia, NDA e propriedade do código estão escondidos no lançamento. Chamaria com a resposta sobre mudança de escopo, NDA e código visíveis e a seção de engenharia preenchida. |
| Comercial | 7,2 | Sim (Cláudia), provavelmente (Rafael), talvez (Marcos) | A régua de comparação e os fatores de preço fazem a Lemamon.dev parecer o fornecedor mais honesto dos três sites que a Cláudia abriu. Faltam mudança de escopo e propriedade do código. |
| UX writer | 7,5 | Sim (Cláudia e Rafael) | A tabela comparativa, os fatores e "Você não precisa chegar com escopo pronto" dão argumento para o sócio. Hesitações: "Custo: Contínua" e a evasiva sobre escopo (os dois corrigidos). |
| Compliance | 7 | Sim (Cláudia), provavelmente (Rafael), talvez (Marcos) | Material para convencer o sócio e barreira baixa. O que trava: mudança de escopo, duração da Descoberta, prova e propriedade do código. |

**Serviços**

| Revisor | Nota | Entraria? | Por quê, e o que segura |
|---|---|---|---|
| Rafael | 7,5 | Sim, pelo WhatsApp do hero | Decidir em dois momentos tira o medo de assinar no escuro. Entraria desconfiado: quem constrói, se o código é dele, quanto custa e dura a Descoberta, mudança de escopo. Se a resposta demorar ou vier vaga, fecha com outra agência. |
| Cláudia | 8 | Sim, na primeira visita | O texto descreve o problema dela melhor do que ela, e a franqueza sobre software pronto a fez acreditar no resto. Primeira mensagem: preço aproximado, custo da Descoberta e nota fiscal. Segura: nenhum case, rosto ou CNPJ. |
| Marcos | 7,5 | Sim, para perguntar | Integrações o convenceu (falhas, reprocessamento, lote × tempo real). Perguntaria se trabalham com o time interno e quem faria o trabalho. Só agendaria com prova técnica; com o GitHub vazio, nem escreveria. |
| Comercial | 8,1 | Sim | Sinais na voz do cliente, porta de baixo risco e "você não assina no escuro". Hesitação: o link "Ver quanto custa" sem valor (rótulo corrigido) e urgência na sustentação. |
| UX writer | 8 | Provavelmente (Cláudia), sim com ressalva (Rafael) | As rotinas de sistemas web e integrações são as da Cláudia; a página de MVP fala a língua do Rafael, que sai sem saber se o código é dele. |
| SEO | 8 | Sim | O H1 confirma a página certa, os sinais usam as palavras do comprador e "O que pesa no preço" responde a pergunta nº 1. Freios: código existente no MVP e urgência na sustentação. |
| Compliance | 7,5 | Sim nas 4 páginas de projeto | Decidir em dois momentos é o que mais reduz o risco percebido. Na sustentação, alertou para a expectativa de assumir sistema de terceiros e de atendimento de urgência (corrigidos). |

**Conversão** (orçamento, pós-envio e contato)

| Revisor | Nota | Entraria? | Por quê, e o que segura |
|---|---|---|---|
| Rafael | 8 | Sim | WhatsApp primeiro (mensagem pronta), depois as 6 perguntas, que não pedem contato antes do resumo. Perguntaria quem participa, se é por vídeo e se o código fica com ele. |
| Cláudia | 8 | Sim | Grátis, sem compromisso, e vê o resumo antes de dar o WhatsApp. Pediria orçamento em mais dois lugares; quem der ideia de valor antes ganha vantagem. |
| Marcos | 8 | Sim | Faria o wizard até o fim para perguntar quem participa, se trabalham com o time dele e se dá para pular a Descoberta. Quase desconfiou do resumo falando em "software rodando" para quem já tem sistema (corrigido com a variante própria). |
| Comercial | 8 | Sim, na maioria | Resumo antes do contato, WhatsApp sempre à mão, NDA e e-mail para questionário de segurança. A Cláudia hesita no "E o preço?" e por não ver quem é a Lemamon.dev. |
| UX writer | 8 | Sim | O H1 honesto e o "Ainda não" sobre preço desarmam a sensação de isca; "Copiar resumo" ajuda a levar ao sócio. |
| SEO | 8 | Sim | O H1 e o FAQ dizem antes do clique que dali não sai preço, o que evita frustração. |
| Compliance | 8,5 | Sim nas três personas | O texto não cria expectativa falsa. O risco está nas promessas que dependem de você (marcar os 45 minutos com todo pedido e falar de preço em toda conversa), cobertas pela trava de score D. |

**Estrutura** (metadados, componentes, cases, sobre, blog e Política)

| Revisor | Nota | Entraria? | Por quê, e o que segura |
|---|---|---|---|
| Rafael | 7,5 | Sim, pelo WhatsApp | Checaria se quem responde entende de produto e quem conduz o diagnóstico. O site ganharia o clique dizendo quem conduz a conversa (depende de você). |
| Cláudia | 8 | Sim | O custo de tentar é baixo. O pé atrás está fora do texto: com quem vai falar, CNPJ, rosto, e-mail Gmail e o que vem na devolutiva. |
| Marcos | 7 | Ainda não | Tudo o que ele procura está escondido no lançamento (quem conduz, pessoas, CNPJ, e-mail no domínio). Abriria o GitHub primeiro. |
| Comercial | 8 | Sim (Cláudia e Rafael) | O site diz com clareza o que é pago e onde o cliente decide. Três sinais de confiança que o texto não resolve: Gmail, nenhuma pessoa ou CNPJ visível e LinkedIn pessoal. |
| UX writer | 8 | Sim, as três personas | 45 minutos, "Onde você decide" e devolutiva para repassar ao sócio. |
| SEO | 8 | Sim | O resultado da Home promete o que o comprador quer ouvir, com porta de entrada sem risco. Ponto fraco: a imagem de compartilhamento no WhatsApp (texto reduzido na v5; imagem a regenerar). |
| Compliance | 7 | Sim, nas três | Copy honesto e concreto. Os bloqueios eram de risco jurídico na Política e da promessa do bloco de investimento (corrigidos no texto; revisão jurídica pendente). |

---

## 6. Bloqueios

### 6.1 Bloqueios apontados na rodada 3: situação na versão final

Todos foram resolvidos no texto da v5 do pt-BR. Os que tinham voltado nas traduções foram alinhados na mesclagem (seção 7).

| Documento | Chave | Problema | Situação final |
|---|---|---|---|
| Home | `home.services.items.support.text` | "O seu sistema" lia como "assumimos o seu sistema" | Resolvido: "O sistema cuidado e evoluindo depois que entra no ar…". en/es tinham voltado ao possessivo e foram alinhados. |
| Home | `home.risks.pairs.*.answer` | Respostas trocadas; "preço que só cresce" sem resposta | Resolvido: o par 1 fala de entendimento e o par 3 termina em "preço fechado sobre esse escopo". |
| Home | `home.method.stages.diagnosis.benefit_title` | Prometia o caso "entendido" em 45 minutos | Resolvido: "Seu caso ouvido antes de qualquer gasto". |
| Home | `home.team.intro` | Plural "as pessoas" insinuava tamanho do time | Resolvido: "Conheça quem está por trás da Lemamon.dev…". O es usava plural e foi alinhado. |
| Método e preço | `pricing.how_to_compare.questions.scope_change` | A régua mandava perguntar e a Lemamon.dev não respondia | Resolvido: a pergunta inteira só aparece com `escopoMudanca`; sem a flag, a régua tem 5 perguntas, todas respondidas. |
| Método e preço | `pricing.how_price_closes.stages.support.cost` | "Custo: Contínua" | Resolvido: "Valor combinado antes de começar". |
| Método e preço | `how_we_work.stage_*.you_get` | Diferente da linha do método | Resolvido no pt; no en, o diagnóstico foi alinhado na mesclagem. O verificador confere a igualdade. |
| Método e preço | `pricing.hero.lead` | Abria com "depende" e "paga", sem o passo gratuito | Resolvido: o lead traz o diagnóstico gratuito antes da etapa paga. Desde a D44 (21/10/2026), diz que nada é cobrado antes do desenvolvimento. |
| Método e preço | 4 chaves com "único valor que você assume" | Garantia de custo não confirmada | Resolvido: a frase saiu. |
| Método e preço | `how_we_work.proof.intro` | Plural "projetos reais" | Resolvido: "para quem já passou por ele". |
| Método e preço | `pricing.factors.intro` e `before_paying.why` | "Protótipo" e "MVP" sem explicação | Resolvido: MVP explicado no texto; protótipo recebe o termo explicado na primeira menção. Desde a D44 (21/10/2026), o protótipo saiu do site. |
| Serviços | `services.template.price_factors_link` | Prometia preço que o destino não mostra | Resolvido: "Ver o que define o preço de um projeto", com variante para quando houver faixas. |
| Serviços | `services.mvp.faq.wont_stall.answer_with_code_ownership` | "Desde o início" contradizia um dos rascunhos | Resolvido: "E o código desenvolvido é da sua empresa." |
| Serviços | `services.support.subtitle` | Prometia cuidar de qualquer sistema | Resolvido: a ressalva "a gente avalia com você se faz sentido para o seu caso" está no hero. O en usava "your live system" e foi alinhado. |
| Serviços | `services.support.format.fields.urgent` | Rótulo podia aparecer vazio | Resolvido no texto: cada campo só aparece com o dado. Falta o campo `urgente` no schema de `sustentacao.ts` (6.3). |
| Conversão | `quote.summary.factors.factor_multi` | MVP + 1 tipo contava como duas frentes | Resolvido: a regra conta frentes sem o MVP, e o texto foi reescrito. |
| Conversão | `quote.entry.quick_faq.data_use.answer` | "Só neste navegador" não era verdade com o replay do New Relic | Resolvido: a frase saiu e só volta com os critérios técnicos de `quote._notes.privacy`. |
| Conversão | `quote.summary.path_title` / `intro` | "Software rodando" para quem já tem sistema | Resolvido: variantes `_live_variant`. |
| Conversão | `quote.error.text` | "Tudo preenchido" no WhatsApp não era verdade | Resolvido: "já abre com as suas respostas e o código do pedido". |
| Estrutura | `shared.terms.written_feedback` | Dependia de dado inexistente | Resolvido: versão base para o lançamento e `written_feedback_with_content` para depois. |
| Estrutura | `privacy.sections.legal_basis.items.ads_measurement` | Duas bases legais com "ou" | Resolvido no texto: duas variantes fechadas, escolhidas por `privacidade.ts`; o build falha sem a escolha. A decisão jurídica continua pendente (6.2). |
| Estrutura | `meta.home.title` | Sem a keyword primária | Resolvido: "Desenvolvimento de software sob medida \| Lemamon.dev". |
| Estrutura | `meta.default_og_image_text` | Texto denso para a prévia do WhatsApp | Resolvido no texto (marca, headline e "Diagnóstico gratuito de 45 minutos"). A imagem precisa ser regenerada (6.2). |
| Estrutura | `privacy.sections.data_collected.draft` | Dizia que a origem da visita só chegava no envio | Resolvido: o rascunho fica no navegador e a medição da origem é declarada. |
| Estrutura | `privacy.sections.navigation_data.items.google_ads` | Não informava remarketing | Resolvido no texto: variante `google_ads_with_remarketing`; a configuração da tag é bloqueador de lançamento (6.2). |
| Estrutura | `privacy.sections.processors.*` | Conformidade não verificada; todos tratados como operadores; Google fixo | Resolvido: só o fato da transferência (com variante para o mecanismo), corpo sem "operadores", itens condicionais por ferramenta ativa. |
| Estrutura | `shared.investment.cta_lead` | Insinuava que o diagnóstico situa o projeto numa faixa | Resolvido: "O caminho até o preço fechado do seu projeto começa pelo diagnóstico gratuito." |
| Estrutura | `privacy.sections.controller.body` | Política sem controlador e sem revisão jurídica | Continua aberto: depende de você e do advogado (6.2). |

### 6.2 O que ainda impede publicar o site

Não são problemas de texto: são dados e decisões que só você (e um advogado) pode fornecer. O build deve falhar enquanto faltarem.

1. **Controlador na Política:** razão social e CNPJ em `config/empresa.ts` ou, sem pessoa jurídica, o nome do responsável. Sem isso, /privacidade, /orcamento e /contato não vão ao ar, porque os avisos dos formulários apontam para a Política (LGPD art. 9, III). **Resolvido em 20/10/2026:** Lemamon.dev LTDA, CNPJ 69.700.690/0001-98 (D39); falta o dono conferir a grafia e o município da sede (São Paulo/SP) no cartão CNPJ.
2. **Decisões jurídicas em `config/privacidade.ts`:** base legal da medição de anúncios (legítimo interesse ou consentimento, com aviso de cookies), encarregado (pequeno porte ou dados do encarregado) e mecanismo de transferência internacional.
3. **Prazos de retenção:** pedidos, GA4, Google Ads, conversões, New Relic e logs da hospedagem.
4. **Remarketing e personalização:** ou a tag do Google Ads sai com `allow_ad_personalization_signals: false`, sem listas de público e com o Google Signals desligado, ou a Política usa as variantes de remarketing com consentimento. Também conferir que as conversões otimizadas (enhanced conversions) estão desligadas.
5. **Revisão jurídica da Política inteira**, nos três idiomas: itens (a) a (p) de `_notes.legal_review` (o (p), identificação do fornecedor, entrou em 20/10/2026) e, para o es, os dois itens que `_notes.localization_es` pede para acrescentar: qual versão prevalece em caso de divergência e revisão da tradução.
6. **Imagem de compartilhamento regenerada**, uma por idioma, com `meta.default_og_image_text`. A atual diz "Squad dedicado", que não é oferta confirmada.
7. **Formulários fora das gravações do New Relic**, com verificação automática (`data-nr-block` na ilha do wizard e no formulário de /contato, ou replay desligado nessas rotas). Sem isso, o item do New Relic na Política não é verdade.
8. **Trava de score D:** se `qualificacao.ts` ganhar regras de score D, o build falha até você confirmar que esses pedidos também recebem os 45 minutos e a devolutiva, ou até existirem as variantes de texto.

### 6.3 Pendências de documentação para quem implementar

As notas dos documentos registram mudanças que ainda precisam entrar no BLUEPRINT e no content-model:

- **BLUEPRINT §4:** `empresa.ts` com controlador obrigatório no build; flags novas `formatoDiagnostico` e `pagamento`; campo `urgente` em `sustentacao.ts`; `timeDoCliente` (sugerida).
- **BLUEPRINT §6:** composição dos FAQs de /como-trabalhamos, /sprint-de-descoberta, /quanto-custa e serviços; H1 e textos-guia de /como-trabalhamos e /sprint-de-descoberta; régua de comparação com `scope_change` condicional; CTAs no meio das páginas de serviço; título "Formato e contratação" da sustentação.
- **BLUEPRINT §10.3 e §11:** formulários fora do replay como critério de aceite.
- **BLUEPRINT §14:** item 2 (controlador na Política) como bloqueador de lançamento.
- **Content-model:** chaves novas de og-image por página, `profiles_fallback`, `live_system`, `app_intro` e as variantes de `pricing.how_price_closes`.

Ponto em aberto que o texto não resolve sozinho: a Política em en e es é tradução fiel do pt e tem o mesmo status jurídico; precisa da mesma revisão.

---

## 7. Ajustes feitos na mesclagem

Na mescla dos 5 documentos em `src/i18n`, 30 textos foram ajustados. Nenhum cria afirmação nova: todos alinham um texto ao documento de origem (o pt-BR v5) ou a outra chave que precisa ser idêntica. Cada troca conferiu o valor antigo antes de mudar.

### 7.1 Alinhamentos entre documentos pedidos pelas próprias notas

O documento Home foi fechado antes da Estrutura e da Conversão, que pediram estes alinhamentos (`_notes.cross_doc` e `quote._notes`, "o mesmo sobretítulo da Home"):

| Chave | Idioma | Antes | Depois |
|---|---|---|---|
| `home.cases.intro` | pt | O problema, o que foi entregue e, quando dá para medir, o que mudou. | O problema, o que foi entregue e, quando o cliente autoriza divulgar, o resultado. |
| `home.cases.intro` | en | …where it can be measured, what changed. | …when the client allows us to share it, the result. |
| `home.cases.intro` | es | …cuando se puede medir, lo que cambió. | …cuando el cliente autoriza difundirlo, el resultado. |
| `home.team.title` | pt | Quem faz a Lemamon.dev | Quem trabalha nos projetos da Lemamon.dev |
| `home.team.title` | en | Who's behind Lemamon.dev | Who works on Lemamon.dev projects |
| `home.team.title` | es | Quiénes están detrás de Lemamon.dev | Quién trabaja en los proyectos de Lemamon.dev |
| `quote.entry.eyebrow` | pt | Para empresas e startups · Florianópolis, SC | Para PMEs e startups · Florianópolis, SC |
| `quote.entry.eyebrow` | en | For companies and startups · Florianópolis, Brazil | For SMBs and startups · Florianópolis, Brazil |
| `quote.entry.eyebrow` | es | Para empresas y startups · Florianópolis, Brasil | Para pymes y startups · Florianópolis, Brasil |

> Registro da mesclagem, mantido como estava. Desde 20/10/2026 (D38) a cidade é São Paulo: hoje os sobretítulos são "Para PMEs e startups · São Paulo, SP", "For SMBs and startups · São Paulo, Brazil" e "Para pymes y startups · São Paulo, Brasil" (seção 2 e `src/i18n`).

### 7.2 Bloqueios resolvidos no pt que tinham voltado nas traduções

**Sustentação sem possessivo.** O pt usa "o sistema" de propósito, para não prometer assumir sistema feito por outra empresa (`sistemaTerceiros` pendente). O en e o es tinham voltado a "your system" e "tu sistema" nas mesmas chaves:

| Chave | Idioma | Depois |
|---|---|---|
| `home.services.items.support.text` | en | The system maintained and improved after it goes live, as your operations change. |
| `home.services.items.support.text` | es | Después del lanzamiento, mantenemos el sistema y lo mejoramos a medida que cambia tu operación. |
| `shared.method_timeline.stages.support.you_get` e `how_we_work.stage_support.you_get` | en | the system looked after and improving once it's live |
| `shared.method_timeline.stages.support.you_get` e `how_we_work.stage_support.you_get` | es | el sistema con mantenimiento y mejoras continuas una vez que está en funcionamiento |
| `pricing.how_to_compare.questions.after_launch.lemamon` | en | …we keep looking after the live system… |
| `services.hub.list.items.support.for_when` | en | the system is live and needs ongoing maintenance and improvement. |
| `services.support.subtitle` | en | Bug fixes, updates and improvements for the live system. In the free assessment, … |
| `services.support.signals[0]` | en | The system is live, and day-to-day use already calls for improvements. |
| `services.support.signals[3]` | en | You want the system looked after on an ongoing basis, not just when it breaks. |
| `services.support.signals[3]` | es | Quieres que el sistema reciba cuidado continuo, no solo cuando falla. |
| `services.support.examples[1].text` | en | The tools and services the system depends on, … |
| `services.support.other_services_line` | en | Maintenance and improvement for the system after it goes live. |
| `services.support.other_services_line` | es | Mantenimiento y evolución del sistema después del lanzamiento. |
| `services.support.cta_final.title` | en | Tell us what needs to change in the system |

Ficaram com o possessivo as frases que não falam de assumir a sustentação (o preço do sistema a construir, a integração com os sistemas que o cliente já usa) e as que o pt também usa: o resumo do orçamento para quem marcou que já tem sistema no ar e a description da página de Sustentação, que traz a ressalva do diagnóstico.

**Time sem número implícito (es).** "Quiénes" e "quienes" afirmam mais de uma pessoa; a seção pode aparecer com 1:

| Chave | Depois |
|---|---|
| `home.team.intro` | Antes de la primera conversación, conoce quién está detrás de Lemamon.dev. |
| `about.team.title` | Quién trabaja en los proyectos de Lemamon.dev |

### 7.3 Chaves que precisam ser idênticas

| Chave | Idioma | Ajuste |
|---|---|---|
| `how_we_work.stage_diagnosis.you_get` | en | "written feedback on your case" → "written feedback on your situation", igual à linha do método. |
| `shared.errors.invalid_email` | es | Igual ao erro dos formulários: "Revisa el correo electrónico. Debe tener el formato nombre@ejemplo.com." |
| `shared.errors.invalid_phone` | es | Igual à primeira frase do erro dos formulários: "Revisa el número con código de área, por ejemplo: (48) 99999-9999." A segunda frase dos formulários (números de fora do Brasil) é específica de cada formulário e fica só neles. |

### 7.4 Notas

- `_notes.localization_es` (glossário e decisões do espanhol) existia só no es. Como é nota e não texto do site, foi copiada igual para os 3 arquivos, para a paridade de chaves sem perder a informação.
- `_notes.merge` registra, nos 3 arquivos, as versões de origem e a lista destes ajustes.

---

## 8. Como os arquivos são usados

- **`src/i18n/pt.json`, `en.json`, `es.json`:** um objeto por idioma, com as chaves de topo dos 5 documentos: `home`, `how_we_work`, `discovery_sprint`, `pricing`, `faq`, `services`, `quote`, `contact`, `meta`, `shared`, `cases`, `about`, `blog`, `privacy`, mais `_notes`.
- **Chaves com prefixo `_`** são notas de implementação (regras de quando cada variante aparece, flags, ordem dos FAQs). O loader de i18n deve ignorá-las; elas não vão para a interface.
- **Variantes:** chaves com `_with_…`, `_variant`, `_draft` e `_alt` substituem a chave principal só na condição descrita nas notas da seção. Os textos `_draft` só vão ao ar quando você aprovar a flag em `config/confirmacoes.ts`.
- **Campos entre chaves** (`{email}`, `{servico}`, `{protocolo}`, `{politica}`…) são preenchidos pelo código. O número do WhatsApp nunca aparece no texto; vem da variável de ambiente.
- **Verificação:** `node scripts/check-i18n.mjs` confere que os 3 arquivos são JSON válido, têm exatamente as mesmas chaves em todos os níveis (com arrays do mesmo tamanho), os mesmos campos `{…}` em cada texto, nenhum texto vazio e que as chaves duplicadas por regra são idênticas dentro de cada idioma (CTA primário, progresso do wizard, idioma do rodapé, título das faixas de preço, erros de formulário e o "Você recebe" de cada etapa). Sai com código 1 se encontrar qualquer erro. Vale rodar a cada mudança de copy e no build.
- **`src/locales`** não foi tocado: o site atual em React continua usando esse diretório até a migração para Astro.
