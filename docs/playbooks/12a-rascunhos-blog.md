# 12a — Rascunhos dos primeiros posts do blog

**Backlog:** B055 (pauta de decisão de compra: textos), B110 (artigos de fundo de funil), B298 (autor real: pendente), B302 (checklist de tom).
**Fontes:** BLUEPRINT §6.12 (pauta inicial, escrevível sem números) e §12 (regras de copy); playbook [12](12-canais-indicacao-linkedin-conteudo.md) §7 (processo e checklist); [08](08-search-console-e-seo-local.md) §2 (palavras-chave); `src/content/schemas.ts` (`postSchema`); [00](00-DADOS-DO-DONO.md) §B10 (onde o MDX mora).

> Rascunhos escritos a partir da pauta do BLUEPRINT §6.12. **Nada aqui está publicado.** O autor real (B298) revisa, assina e ajusta cada texto antes de virar MDX. Publicar é trabalho do agente `gated`, depois que o autor existir.

---

## Como usar

1. O autor (B298) lê o rascunho, corrige o que não reconhece como verdade na prática da Lemamon.dev e passa pela revisão técnica (12 §7, processo, passo 2).
2. Preencha os `[PREENCHER]` do frontmatter, inclusive a capa (o `alt` proposto descreve um cartão com o título; ajuste ao que a imagem mostrar). Com eles, o build recusa o arquivo (`hasDraftMark`), de propósito.
3. Copie o bloco de frontmatter e o corpo para `src/content/posts/<slug>.mdx` (só pt-BR). O `<CtaMeio />` fica exatamente onde está marcado. Mantenha `rascunho: true` até o fim da revisão.
4. Deploy preview → checklist B302 de novo (abaixo) → `rascunho: false` → publicar. O blog só aparece com 3 posts publicados (`hasPosts`).
5. Republicar no Medium com canonical (12 §7).

**O CTA final de todo post é do template:** depois do corpo, a página mostra `blog.post.end_cta` ("Vamos olhar o seu caso?", botão do diagnóstico gratuito, rastreado com `?origem=blog-final`). O `<CtaMeio />` usa `midCtaText` (ou o texto padrão) e é rastreado com `?origem=blog-meio`. Por isso o corpo **não** leva link próprio para o wizard: o último parágrafo prepara o CTA final.

**Se uma confirmação mudar:** os rascunhos seguem o que o site afirma hoje. Desde a D44 (21/10/2026), a Sprint de Descoberta é gratuita, só acontece quando o diagnóstico mostra que é necessária e não entrega protótipo; os 3 posts já seguem isso. Se `planoDoCliente` ou `devolutivaConteudo` forem confirmadas, o autor pode acrescentar a frase confirmada, com o texto de 00 §B5.

**Cuidados de MDX:** no corpo, nada de chaves `{ }` (MDX lê como código) nem de `<` fora do `<CtaMeio />`. Nenhuma linha do corpo pode começar com "Exemplo" (a trava de conteúdo fictício derruba o build).

**Limites do schema** (`postSchema`): `capa` **obrigatória** (`src` + `alt` ≤ 160; vira a og:image e a imagem do JSON-LD; foto real ou cartão 1200×630 próprio do post, nunca foto de banco, BLUEPRINT §6.1) · `titulo` ≤ 110 · `resumo` ≤ 200 · `seoTitle` ≤ 50 · `seoDescription` ≤ 155 · `midCtaText` ≤ 240 · `relacionados` até 3 slugs · `servico` ∈ `web_systems`, `mobile_apps`, `integrations`, `mvp`, `support` (sem ele, o link do fim do post vai para o método). Os rascunhos abaixo cabem em todos.

---

## Post 1 — O que você deveria receber de uma Sprint de Descoberta

| Item | Valor |
|---|---|
| Slug | `o-que-receber-de-uma-sprint-de-descoberta` |
| Palavra-chave (08 §2) | `sprint de descoberta` · secundária `discovery de produto` |
| Leitor | quem vai fazer uma Sprint de Descoberta, combinada no diagnóstico, e quer saber o que conferir no fim |
| Pergunta que o post responde | o que eu deveria ter nas mãos no fim de uma Sprint de Descoberta? |
| Link interno | `/sprint-de-descoberta` (12 §7, pauta 2) e `/como-trabalhamos` |

```yaml
---
titulo: "O que você deveria receber de uma Sprint de Descoberta"
resumo: "Entendimento do problema, escopo priorizado e um plano com prazo e preço fechados: o que conferir antes de aprovar o desenvolvimento."
capa:
  src: "[PREENCHER] ../imagens/<cartão 1200×630 do post>"
  alt: "Cartão do post com o título O que você deveria receber de uma Sprint de Descoberta, sobre fundo azul-escuro da Lemamon.dev"
autor:
  nome: "[PREENCHER] nome completo do autor (B298)"
  foto: "[PREENCHER] ../imagens/<arquivo da foto real>"
  link: "[PREENCHER] https:// perfil público verificável"
  papelTecnico: "[PREENCHER] papel técnico real"
publicadoEm: "[PREENCHER AAAA-MM-DD]"
midCtaText: "Não sabe se o seu projeto precisa de uma Sprint de Descoberta? Em 45 minutos de diagnóstico gratuito, a gente entende o seu caso e você recebe uma devolutiva por escrito."
relacionados: ["preco-fechado-ou-por-hora", "sistema-pronto-ou-sob-medida"]
seoTitle: "O que receber de uma Sprint de Descoberta"
seoDescription: "O que uma Sprint de Descoberta deve entregar antes do desenvolvimento: problema entendido, escopo priorizado e plano com prazo e preço fechados."
rascunho: true
---
```

**Corpo:**

```mdx
Você pediu orçamento para um sistema e, no diagnóstico, ficou combinado que antes vem uma Sprint de Descoberta. É natural querer saber o que ela entrega. Este texto mostra o que você deveria ter nas mãos quando ela termina.

## Por que existe uma etapa antes de construir

Sem entender o problema, qualquer preço de desenvolvimento é um chute. Um chute baixo costuma virar aditivo no meio do projeto. Um chute alto faz você pagar por uma margem de segurança que ninguém explica.

A Descoberta existe para trocar o chute por um plano. Na Lemamon.dev, ela é gratuita e termina antes do desenvolvimento.

## O que você deveria receber

### O problema entendido

O problema escrito com as palavras da sua operação: quem faz o quê hoje, onde o trabalho trava e o que muda quando der certo. Se você ler e não se reconhecer, a Descoberta ainda não terminou.

### Um escopo priorizado

A lista do que entra primeiro e do que pode esperar. Prioridade tem corte: se tudo é essencial, nada foi priorizado.

### Um plano com prazo e preço fechados

O plano diz o que será construído, em que ordem, em quanto tempo e por quanto. É com ele na mão que você decide se segue para o desenvolvimento.

<CtaMeio />

## Sinais de que a Descoberta não entregou o que devia

- O documento final fala de tecnologia e quase nada do seu problema.
- Não existe uma lista do que ficou de fora.
- O escopo não passou por quem vai usar o sistema no dia a dia.
- O preço do desenvolvimento continua "a partir de" ou "estimado".

Se algum desses sinais aparecer, pergunte antes de aprovar o próximo passo. Uma boa pergunta agora custa menos do que um aditivo depois.

## Onde você decide

Na Lemamon.dev, você decide depois da devolutiva por escrito do diagnóstico gratuito e, de novo, antes do desenvolvimento, com o plano na mão. Seguir para o desenvolvimento é escolha sua, com escopo, prazo e preço combinados antes de começar, e até lá você não paga nada.

No desenvolvimento, você recebe software funcionando a cada 2 semanas, não apresentação de slide. Os detalhes da etapa estão na página da [Sprint de Descoberta](/sprint-de-descoberta), e o caminho inteiro está em [Como trabalhamos](/como-trabalhamos).

Se você ainda não sabe se o seu caso precisa de uma Descoberta, o primeiro passo é o diagnóstico gratuito: 45 minutos de conversa sobre o problema, com devolutiva por escrito. É nele que a necessidade e a duração da Descoberta são definidas com você.
```

---

## Post 2 — Preço fechado ou por hora: o que muda para quem contrata

| Item | Valor |
|---|---|
| Slug | `preco-fechado-ou-por-hora` |
| Palavra-chave (08 §2) | `escopo aberto ou fechado` · secundária `contrato escopo fechado` (6 sugestões no autocomplete em "escopo fechado"; validar no Planner, 12 §7). **Não** usar `desenvolvimento de software com preço fechado`, primária de `/como-trabalhamos` |
| Leitor | quem está comparando propostas, uma por hora e outra com preço fechado |
| Pergunta que o post responde | em cada modelo, quem carrega o risco quando a estimativa erra? |
| Link interno | `/como-trabalhamos` (12 §7, pauta 3) e `/quanto-custa#como-comparar` |

```yaml
---
titulo: "Preço fechado ou por hora: o que muda para quem contrata"
resumo: "Num modelo, você paga o tempo; no outro, um escopo escrito. Veja quem carrega o risco quando a estimativa erra e o que perguntar antes de assinar."
capa:
  src: "[PREENCHER] ../imagens/<cartão 1200×630 do post>"
  alt: "Cartão do post com o título Preço fechado ou por hora: o que muda para quem contrata, sobre fundo azul-escuro da Lemamon.dev"
autor:
  nome: "[PREENCHER] nome completo do autor (B298)"
  foto: "[PREENCHER] ../imagens/<arquivo da foto real>"
  link: "[PREENCHER] https:// perfil público verificável"
  papelTecnico: "[PREENCHER] papel técnico real"
publicadoEm: "[PREENCHER AAAA-MM-DD]"
midCtaText: "Quer ver como o seu projeto ficaria com escopo, prazo e preço combinados antes de começar? Comece pelo diagnóstico gratuito: 45 minutos e uma devolutiva por escrito."
relacionados: ["o-que-receber-de-uma-sprint-de-descoberta", "sistema-pronto-ou-sob-medida"]
seoTitle: "Preço fechado ou por hora em software"
seoDescription: "Preço fechado ou por hora, escopo fechado ou aberto: quem carrega o risco em cada modelo e o que perguntar a qualquer fornecedor antes de assinar."
rascunho: true
---
```

**Corpo:**

```mdx
Você está comparando propostas para um projeto de software. Uma cobra por hora, a outra fecha um preço. No papel, a de hora parece mais barata e mais flexível. Antes de escolher, vale entender quem paga a conta quando a estimativa erra.

## Por hora: você paga o tempo

No modelo por hora, você paga o tempo que a equipe gasta. Se a estimativa estava curta, a conta cresce, e a diferença sai do seu orçamento.

Esse modelo funciona quando o trabalho é pequeno e conhecido, ou quando você tem alguém técnico do seu lado para acompanhar as horas de perto. Sem isso, você descobre o tamanho do projeto na fatura.

## Preço fechado: você paga um escopo escrito

No preço fechado, o preço vale para um escopo escrito. Se a estimativa estava curta, o risco fica com quem estimou, não com você.

Para isso funcionar, o escopo precisa estar claro antes do preço. Preço fechado sem escopo escrito costuma virar discussão no meio do projeto, porque ninguém sabe dizer o que estava combinado.

## Escopo fechado ou aberto: o mesmo debate com outro nome

Algumas propostas falam em escopo fechado ou escopo aberto. É a mesma escolha, vista pelo que vai ser entregue.

No escopo fechado, a lista do que entra está escrita antes, e o preço vale para ela. No escopo aberto, o que entra vai sendo decidido no caminho, e a conta acompanha as horas. A pergunta continua a mesma: quem paga quando a estimativa erra.

## O que perguntar em qualquer proposta

- O que está fora do escopo?
- O que acontece se o escopo mudar?
- Quando eu vejo software funcionando?
- O que eu recebo antes de pagar pelo desenvolvimento?

As respostas dizem mais do que o valor no fim da proposta. A lista completa, com as respostas da Lemamon.dev, está em [Como comparar propostas de desenvolvimento de software](/quanto-custa#como-comparar).

<CtaMeio />

## Como a Lemamon.dev trabalha

Na Lemamon.dev, escopo, prazo e preço são combinados antes de começar. O preço fechado do desenvolvimento sai antes de ele começar: quando é necessária, da Sprint de Descoberta, que é gratuita e transforma o problema em escopo priorizado e um plano com prazo e preço fechados.

No desenvolvimento, você recebe software funcionando, não apresentação de slide. As entregas a cada 2 semanas existem para você perceber cedo o que precisa mudar. Se a mudança mexer no escopo, escopo, prazo e preço são combinados de novo antes de seguir.

O caminho inteiro, do diagnóstico à sustentação, está em [Como trabalhamos](/como-trabalhamos).

Se você quer ver como o seu projeto ficaria com escopo, prazo e preço combinados antes de começar, o primeiro passo é o diagnóstico gratuito: 45 minutos de conversa, com devolutiva por escrito.
```

---

## Post 3 — Sistema pronto ou sob medida: como decidir

| Item | Valor |
|---|---|
| Slug | `sistema-pronto-ou-sob-medida` |
| Palavra-chave (08 §2) | `sistema pronto ou sob medida` (0 sugestões no autocomplete; validar no Planner) · relacionada `sistema sob medida` (BLUEPRINT §6.5) |
| Leitor | dono ou gestor com a operação presa em planilha, em dúvida entre contratar um sistema pronto e construir |
| Pergunta que o post responde | quando um sistema pronto basta e quando vale construir sob medida? |
| Link interno | `/servicos/sistemas-web` (12 §7, pauta 1), pelo campo `servico: "web_systems"` e no corpo |

```yaml
---
titulo: "Sistema pronto ou sob medida: como decidir"
resumo: "Quando um sistema pronto resolve, quando vale construir sob medida e o caminho do meio que pouca gente considera: integrar o que já funciona."
capa:
  src: "[PREENCHER] ../imagens/<cartão 1200×630 do post>"
  alt: "Cartão do post com o título Sistema pronto ou sob medida: como decidir, sobre fundo azul-escuro da Lemamon.dev"
autor:
  nome: "[PREENCHER] nome completo do autor (B298)"
  foto: "[PREENCHER] ../imagens/<arquivo da foto real>"
  link: "[PREENCHER] https:// perfil público verificável"
  papelTecnico: "[PREENCHER] papel técnico real"
publicadoEm: "[PREENCHER AAAA-MM-DD]"
servico: "web_systems"
midCtaText: "Ainda em dúvida entre um sistema pronto e um sob medida? Em 45 minutos de diagnóstico gratuito, a gente olha o seu processo e você recebe uma devolutiva por escrito."
relacionados: ["o-que-receber-de-uma-sprint-de-descoberta", "preco-fechado-ou-por-hora"]
seoTitle: "Sistema pronto, sob medida ou integrar?"
seoDescription: "Sistema pronto ou sob medida? Sinais de que o pronto resolve, de que vale construir e de que o caminho é integrar. Perguntas para decidir com segurança."
rascunho: true
---
```

**Corpo:**

```mdx
A planilha não dá mais conta, e alguém já sugeriu contratar um sistema pronto. Outra pessoa acha que o caminho é construir sob medida. Os dois caminhos funcionam, para problemas diferentes.

## Quando o sistema pronto resolve

- O seu processo é parecido com o de muitas empresas do setor, como financeiro, nota fiscal ou controle de ponto.
- Você aceita mudar o jeito de trabalhar para caber no sistema.
- O que você precisa já está na lista de funcionalidades, sem adaptação.

Nesses casos, um sistema pronto costuma ser o caminho mais curto. Construir algo que já existe pronto raramente compensa.

## Quando faz sentido construir sob medida

- O jeito como você trabalha é parte do que você vende: o processo é a sua vantagem.
- O sistema pronto exigiria tantas adaptações que você pagaria por um produto inteiro e usaria só uma parte.
- Você precisa que sistemas diferentes conversem, e nenhum produto pronto faz essa ponte.
- Você já tentou um sistema pronto, e a equipe voltou para a planilha.

## Perguntas para decidir

- O que acontece hoje quando o processo falha, e quanto isso custa em tempo ou em venda perdida?
- Quantas adaptações o sistema pronto precisaria, e quem paga por elas a cada atualização do fornecedor?
- Daqui a um tempo, você quer mudar o processo para caber no sistema, ou o sistema para caber no processo?
- Quem vai usar no dia a dia, e essa pessoa participou da escolha?

<CtaMeio />

## O caminho do meio: integrar

Há uma terceira opção que pouca gente considera: manter o sistema pronto que já funciona para o básico e construir só a parte que é sua, conectada a ele. O dado entra uma vez e aparece onde precisa, sem ninguém digitar de novo.

## Como a Lemamon.dev ajuda a decidir

Antes de qualquer proposta, vem o diagnóstico gratuito: 45 minutos para entender o problema. Se fizer sentido construir e a Descoberta for necessária, ela é gratuita e transforma o problema em escopo priorizado e um plano com prazo e preço fechados. Se você decidir seguir, recebe software funcionando a cada 2 semanas.

Veja como funciona um projeto de [sistemas web sob medida](/servicos/sistemas-web) e, se a dúvida é conectar o que já existe, a página de [integrações e automação](/servicos/integracoes).

Se você está nessa dúvida agora, o primeiro passo é o diagnóstico gratuito: 45 minutos sobre o seu processo, com devolutiva por escrito.
```

---

## Post 5 (técnico) — briefing: Entregas a cada 2 semanas: o que você deveria ver funcionando

Briefing para o autor escrever (o texto técnico precisa ser de quem constrói; B298).

| Item | Definição |
|---|---|
| Slug sugerido | `entregas-a-cada-2-semanas` |
| Palavra-chave (08 §2) | `entregas quinzenais software` (a validar no Planejador). **Só para pesquisa:** no texto, título e meta, sempre "a cada 2 semanas", nunca "quinzenal" (BLUEPRINT §12) |
| Leitor | o avaliador técnico do comprador (CTO, gerente de TI) e o comprador que quer saber o que cobrar |
| Pergunta | o que eu deveria ver funcionando em cada entrega, e como sei que o projeto está andando? |
| `servico` | sem campo (o link do fim vai para o método) |
| Link interno | `/como-trabalhamos` |
| CTA | `<CtaMeio />` com `midCtaText` (proposta abaixo) e o CTA final do template |

**Estrutura proposta:**
1. Abertura pelo problema: o projeto em que, depois de meses, o cliente só viu apresentação.
2. O que é "software funcionando": rodando num ambiente que o cliente acessa, com dado de teste, e não um vídeo ou um protótipo de telas.
3. O ciclo: o que entra no ciclo (a partir do escopo priorizado), o que aparece na demonstração, como o cliente comenta e aprova cada item (playbook [16](16-processo-de-entrega.md) §2).
4. Mudança de escopo, com o texto aprovado pelo dono: "As entregas a cada 2 semanas existem para você perceber cedo o que precisa mudar. Se a mudança mexer no escopo, escopo, prazo e preço são combinados de novo antes de seguir."
5. Sinais de alerta em qualquer fornecedor: entrega que só existe na máquina do desenvolvedor; demonstração sem acesso do cliente; nada para testar entre uma reunião e outra.
6. `<CtaMeio />` entre os passos 3 e 4.
7. Fechamento: o caminho inteiro em `/como-trabalhamos` e o convite ao diagnóstico gratuito.

**Frontmatter proposto:**

```yaml
titulo: "Entregas a cada 2 semanas: o que você deveria ver funcionando"
capa: { src: "[PREENCHER] cartão 1200×630", alt: "[PREENCHER] alt descritivo" }
resumo: "O que é software funcionando numa entrega, como acompanhar o projeto a cada 2 semanas e os sinais de alerta em qualquer fornecedor."
seoTitle: "Entregas a cada 2 semanas: o que ver"
seoDescription: "O que conferir em cada entrega de um projeto de software: software funcionando num ambiente que você acessa, aceite por item e mudança de escopo combinada."
midCtaText: "Quer ver como o seu projeto andaria com entregas a cada 2 semanas? Comece pelo diagnóstico gratuito: 45 minutos e uma devolutiva por escrito."
rascunho: true
```

**O que o autor não pode escrever:** duração de MVP ou de Descoberta; número de entregas de um projeto; SLA; "você fala com quem escreve o código"; nomes de clientes; prints de projeto sem autorização (09 §6). Exemplos técnicos de ferramentas (ambiente de homologação, quadro de tarefas) só os que a Lemamon.dev usa de fato (`dados/dono.json › engenharia`).

---

## Checklist B302 aplicado aos rascunhos

| Regra (12 §7) | Post 1 | Post 2 | Post 3 |
|---|---|---|---|
| Começa pelo problema do cliente | sim | sim | sim |
| "A gente" e "você"; parágrafos de até 3 linhas | sim | sim | sim |
| Nenhuma palavra proibida (soluções, transformação digital, inovação, excelência, de ponta, melhor, líder, referência, incrível, extraordinário, poderoso) | sim | sim | sim |
| Nenhum advérbio de reforço | sim | sim | sim |
| Nenhum número além de "45 minutos" e "a cada 2 semanas"; nunca "quinzenal" | sim | sim | sim |
| Nenhuma promessa não confirmada (duração de Descoberta ou MVP, prazo de devolutiva, SLA, abatimento da Descoberta, "o plano fica com você", "atendemos todo o Brasil") | sim | sim | sim |
| "Sprint de Descoberta" por extenso na primeira menção, depois "Descoberta" | sim | sim | sim |
| "escopo, prazo e preço" nessa ordem | sim | sim | sim |
| Teste da negação: o contrário soaria absurdo para um concorrente? | "você decide depois da devolutiva e antes do desenvolvimento" | "o preço fechado sai antes do desenvolvimento" | "antes de qualquer proposta, o diagnóstico" |
| CTA único, terminando no diagnóstico gratuito | `<CtaMeio />` + CTA final do template | idem | idem |

O autor refaz o checklist depois da revisão: qualquer frase que ele mudar precisa passar de novo.
