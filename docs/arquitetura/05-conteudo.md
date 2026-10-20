# 05 — Conteúdo, Copy e Narrativa

> Escopo desta seção: auditoria do copy em produção, definição de mensagem central, copy final pronto para colar, estrutura da narrativa "Como trabalhamos", estratégia de prova social, plano editorial do blog, estratégia de i18n e guia de tom de voz.
>
> Fontes analisadas: `src/locales/pt-BR/translation.json`, `src/locales/en/translation.json`, `src/locales/es/translation.json`, `src/pages/Projects/project-questions.json`, `src/pages/Projects/data.json`, `src/data/posts.ts`, `src/pages/Home/index.tsx`, `src/components/ContentBlock/index.tsx`, `src/components/Header/index.tsx`, `src/components/Footer/index.tsx`, `src/translation.ts`, `index.html`.
>
> **Convenção de dados**: tudo que for número, nome de cliente, depoimento ou resultado aparece marcado como `[PLACEHOLDER — preencher com dado real]`. Nada foi inventado. Onde há uma decisão de negócio que só a Lemamon pode responder, o marcador é `[CONFIRMAR: ...]`.

---

## 1. Auditoria do copy atual

### 1.1 Diagnóstico em uma frase

O site inteiro é escrito da perspectiva da Lemamon ("nós oferecemos", "nós desenvolvemos", "nossa missão"), com vocabulário intercambiável com o de qualquer outra agência do Brasil, sem um único número, nome de cliente, prazo, tecnologia ou caso concreto. **Se você trocar "lemamon.dev" por qualquer outro nome no arquivo `translation.json`, nada no texto fica falso.** Esse é o teste que o copy atual reprova.

### 1.2 Achados por trecho literal

#### A. A headline não posiciona nada

```
"introContent": {
  "title": "Soluções Tecnológicas Personalizadas para o Seu Negócio",
  "text": "Impulsione o crescimento da sua empresa com softwares, websites e aplicativos móveis sob medida. Na lemamon.dev, oferecemos inovação e qualidade em cada projeto."
}
```

O que está errado:

- **"Soluções Tecnológicas Personalizadas"** é a definição de dicionário de "software house". Não diz para quem, não diz o problema, não diz o resultado. É a headline default de milhares de sites.
- **"inovação e qualidade"** — dois substantivos abstratos que ninguém nega ter. Nenhum concorrente escreve "oferecemos estagnação e baixa qualidade". Palavra que o concorrente não pode negar é palavra que não diferencia.
- **"Impulsione o crescimento da sua empresa"** — promessa vaga e não atribuível. A Lemamon não impulsiona crescimento; ela entrega software que resolve um gargalo específico. Prometer crescimento sem prova é o tipo de frase que faz o comprador B2B experiente desconfiar.
- A lista **"softwares, websites e aplicativos móveis"** comunica "fazemos de tudo" — que para o comprador significa "não são especialistas em nada".

#### B. "Sobre" e "Missão" dizem literalmente a mesma coisa, na mesma página

```
"aboutContent": {
  "title": "Transformação Digital",
  "text": "Na lemamon.dev, ajudamos empresas a crescer por meio de soluções tecnológicas de alta qualidade e inovação."
}
```

```
"missionContent": {
  "title": "Nossa Missão",
  "text": "Impulsionar a transformação digital de empresas, oferecendo soluções tecnológicas de alta qualidade e inovação. Ajudamos nossos clientes a crescer por meio da tecnologia."
}
```

`src/pages/Home/index.tsx` renderiza os dois blocos na mesma rolagem (`id="about"` e `id="mission"`). O visitante lê **"soluções tecnológicas de alta qualidade e inovação"** duas vezes em dois blocos consecutivos, e **"ajudamos empresas/clientes a crescer"** também duas vezes. São duas seções de página gastas para transmitir zero informação nova. Além disso, "Transformação Digital" como título de seção é jargão de 2016 esvaziado por uso excessivo — hoje sinaliza consultoria genérica, não competência técnica.

#### C. Afirmações não verificáveis apresentadas como diferencial

```
"title": "Inovação Constante",
"content": "Estamos sempre à frente, explorando e implementando as mais recentes tecnologias para garantir que nossos clientes recebam soluções modernas, eficientes e adaptáveis ao seu contexto."
```

- **"Estamos sempre à frente"** — à frente de quem, medido como? É autoelogio puro.
- **"as mais recentes tecnologias"** é, para boa parte do comprador B2B, um **antissinal**: quem já se queimou com projeto terceirizado teme exatamente o fornecedor que escolhe stack pela novidade. Aqui o copy está vendendo o risco como se fosse benefício.
- **"soluções modernas, eficientes e adaptáveis ao seu contexto"** — três adjetivos sem objeto. Nada aqui é falsificável, logo nada é informação.

```
"title": "Atendimento Personalizado",
"content": "Priorizamos um atendimento individualizado, trabalhando lado a lado com nossos clientes para entender suas necessidades e oferecer soluções sob medida que realmente agreguem valor ao negócio."
```

- **"realmente agreguem valor ao negócio"** — o "realmente" é a confissão de que a frase não tem lastro. Advérbio de reforço aparece justamente onde falta prova.
- "Atendimento personalizado" é o que toda agência pequena diz. Só vira diferencial quando vira **mecanismo**: quem atende, com que frequência, em qual canal, com qual SLA. Nada disso está no site.

#### D. Serviços listados como catálogo, sem resultado associado

```
"productContent": {
  "title": "Nossos Serviços",
  "text": "Oferecemos desenvolvimento de software sob medida, criação de websites e aplicativos móveis, consultoria tecnológica e integração de sistemas para maximizar a produtividade e eficiência do seu negócio."
}
```

Um parágrafo corrido com cinco serviços empilhados e terminado em **"maximizar a produtividade e eficiência"** — o clichê corporativo mais previsível possível. É copy focado em *feature* (o que fazemos) e não em *job* (o que o cliente deixa de sofrer). O comprador não acorda querendo "integração de sistemas"; ele acorda porque o time comercial digita o mesmo pedido em dois sistemas diferentes e erra.

Agravante técnico: esse bloco é renderizado com `direction="left"` em `src/pages/Home/index.tsx`, e o `ContentBlock` só renderiza botões quando `direction === "right"`. **A seção de Serviços não tem — e no código atual não pode ter — nenhum CTA.** O mesmo vale para o bloco Missão, que é `direction="right"` mas não recebe a prop `button`: renderiza um `ButtonWrapper` vazio. A página apresenta os serviços e termina sem pedir nada.

#### E. Frases duplicadas literalmente entre chaves

```
"anyQuestions": "Tem alguma dúvida? Sinta-se à vontade para entrar em contato.",
...
"contactContent": {
  "title": "Entre em Contato",
  "text": "Tem alguma dúvida? Sinta-se à vontade para entrar em contato. Nossa equipe está pronta para ajudar e esclarecer todas as suas questões."
}
```

A mesma frase existe em duas chaves e aparece em dois lugares do layout (`Contact` na Home e `Footer`). Além da repetição, **"Tem alguma dúvida?"** é o convite mais fraco possível para o fundo do funil: trata o visitante como curioso, não como comprador. E **"Nossa equipe está pronta para ajudar"** não compromete a nada — não há prazo de resposta, não há o que acontece depois de enviar o formulário.

#### F. Rótulos de CTA que não descrevem o destino

```
"button": [
  { "title": "Conheça Mais", "path": "/projects" },
  { "title": "Fale Conosco", "color": "#fff", "path": "contact" }
]
```

- **"Conheça Mais"** promete informação, mas leva a `/projects`, que é um **wizard de 4 etapas terminando em formulário com nome, e-mail, telefone e descrição da ideia**. É um pedido de altíssimo compromisso disfarçado de link informativo. Isso produz abandono e queima a confiança logo no primeiro clique.
- **"Fale Conosco"** e, no `MiddleBlock`, **"Saiba Mais"** são rótulos sem verbo de valor. Nenhum dos três diz o que o visitante ganha ao clicar.

#### G. Registro infantilizado numa venda B2B

Trechos literais de `pt-BR/translation.json`:

```
"title": "🌟 Bem-vindo à Área de Projetos! 🚀"
"invite": "Vamos juntos criar algo extraordinário? Explore as opções abaixo e comece a dar vida ao seu projeto!"
"text": "Planejamos a interface e a jornada do usuário com carinho para que seu produto digital encante seus clientes."
"text": "Os aplicativos são indispensáveis hoje em dia. Vamos criar algo incrível para destacar sua empresa!"
"text": "Vamos cuidar de tudo para você! Criamos o design, desenvolvemos e lançamos seu produto, pronto para impressionar."
```

- Emoji dentro do **título principal** de uma página inteira.
- **"com carinho"** — o comprador não contrata carinho, contrata previsibilidade de entrega.
- **"Os aplicativos são indispensáveis hoje em dia"** — obviedade que consome espaço e sinaliza que o interlocutor é tratado como leigo.
- **"pronto para impressionar"**, **"algo incrível"**, **"algo extraordinário"** — superlativos vazios. Note a repetição: "incrível" aparece 3 vezes no arquivo (`a3876e92`, `b05b73d9`, `ca3f91e8`), "extraordinário" 1 vez, "poderoso" 1 vez.

O contraste é revelador: o mesmo arquivo tem trechos **bons**, concretos, quando fala de coisas específicas —

```
"title": "Landing Page",
"text": "Promova seus serviços ou produtos com uma página otimizada para SEO e conversões."
"title": "Gestão de Estoque",
"text": "Controle seu estoque, pedidos e logística de produtos."
```

Esses funcionam porque nomeiam um objeto e uma ação. O problema não é falta de capacidade de escrever bem; é que a **camada institucional** (hero, sobre, missão, serviços) foi escrita em modo genérico enquanto a camada de produto foi escrita em modo concreto.

#### H. Elementos que destroem credibilidade de forma silenciosa

| Onde | Trecho / fato | Problema |
|---|---|---|
| `src/components/Footer/index.tsx:68-69` | `<Large to="/">{t("Press")}</Large>` e `{t("Careers & Culture")}` | "Imprensa" e "Carreiras e Cultura" apontam para `/`. São links mortos que prometem seções inexistentes. Empresa pequena com link de Imprensa vazio parece maior do que é e depois decepciona. |
| `src/components/Footer/index.tsx:67` | `<Large to="/blog">{t("Blog")}</Large>` | A chave `"Blog"` **não existe** em nenhum dos três `translation.json`. Só funciona porque o i18next devolve a própria chave. Em EN/ES continua "Blog" por acidente, não por decisão. |
| `src/components/Footer/index.tsx:59` | `mailto:lemamon.dev@gmail.com` | E-mail Gmail em site com domínio próprio (`lemamon.dev`). Sinal clássico de operação amadora para comprador corporativo. |
| `src/locales/*/translation.json` | `"Product": "Serviços"` (PT) vs `"Product": "Product"` (EN) | O menu diz "Serviços" em PT e "Product" (singular, sentido de produto próprio) em EN. Incoerência de proposta: a empresa vende serviço, não produto. |
| `index.html` | `<meta name="keywords" content="Na lemamon.dev, impulsionamos a transformação digital...">` | O parágrafo inteiro da description foi colado na tag `keywords`. A tag é ignorada pelo Google desde 2009; aqui ainda por cima duplica conteúdo. Remover. |
| `index.html` | `<html lang="en">` + `<meta property="og:locale" content="en_EN">` | Site majoritariamente em português declarado como inglês. `en_EN` nem sequer é um código de locale válido. Prejudica SEO em pt-BR e a renderização de compartilhamentos. |
| `index.html` | `<title>lemamon.dev</title>` | Title tag com o nome do domínio e nada mais. Zero palavra-chave, zero proposta de valor no resultado de busca. |
| Site inteiro | — | **Não existe uma única prova social**: nenhum logo de cliente, depoimento, case, número, stack declarada, foto de pessoa, CNPJ, tempo de mercado ou link para projeto entregue. |

#### I. `project-questions.json` — regressão de i18n em arquivo novo

`src/pages/Projects/project-questions.json` (arquivo não versionado, aparece como `??` no `git status`) contém as perguntas do wizard **hardcoded em português**, duplicando textos que já existem sob `projectsContent.questions` nos três `translation.json`. Se esse arquivo entrar em uso, o wizard passa a exibir português para visitantes em EN e ES, e o copy do wizard passa a ter duas fontes da verdade que vão divergir na primeira edição. Recomendação de conteúdo: **manter a fonte única em `locales/`** e, se o objetivo era simplificar a estrutura, migrar `data.json` + `translation.json` para um formato único — nunca duplicar o texto.

#### J. Qualidade das traduções

As três versões estão tecnicamente corretas e completas (334 linhas, mesmas chaves, sem faltas). Observações:

- **EN**: tradução fiel e natural. Único erro real de proposta é `"Product": "Product"` (deveria ser "Services", coerente com o PT). `"Do you have any question?"` deveria ser `"questions"` (plural) — está no plural em `contactContent` e no singular em `anyQuestions`, inconsistência dentro do mesmo idioma.
- **ES**: **inconsistência grave de tratamento**. O bloco institucional usa *tú* (`"Impulsa el crecimiento de tu empresa"`, `"Ponte en Contacto"`, `"Consulta las últimas noticias"`) e o wizard inteiro vira *usted* (`"¿Qué servicio necesita usted o su empresa ahora mismo?"`, `"Elija entre nuestras opciones"`, `"Puede elegir más de una opción, ¡siéntase libre!"`). O visitante espanhol é tratado por você e por senhor na mesma sessão. Além disso `"¡siéntase libre!"` é calco direto de "fique à vontade" — não se diz assim em espanhol; o natural é `"¡elige las que quieras!"`.
- Conclusão: **o problema das traduções não é a qualidade da tradução — é que elas traduzem fielmente um copy ruim.** Traduzir "Soluções Tecnológicas Personalizadas" para três idiomas produz três headlines igualmente genéricas. Reescrever o PT primeiro; retraduzir depois.

### 1.3 Resumo da auditoria

| Sintoma | Evidência | Impacto |
|---|---|---|
| Copy intercambiável | "Soluções Tecnológicas Personalizadas para o Seu Negócio" | Visitante não consegue diferenciar a Lemamon de 50 concorrentes |
| Zero prova | nenhum número, cliente, case ou depoimento em todo o repositório | Nenhuma razão para confiar |
| Foco em feature, não em resultado | `productContent.text` (catálogo de 5 serviços em 1 parágrafo) | Não conecta com dor do comprador |
| Redundância | `aboutContent.text` ≈ `missionContent.text` | Duas seções desperdiçadas |
| CTA fraco e enganoso | "Conheça Mais" → wizard de 4 etapas | Abandono no primeiro clique |
| Ausência de CTA no meio da página | `direction="left"` bloqueia botões no `ContentBlock` | Serviços não convertem |
| Registro infantilizado | "com carinho", "🌟", "algo incrível" | Perde credibilidade com decisor sênior |
| Sinais de amadorismo | Gmail, links mortos, `lang="en"`, blog fake | Rejeição silenciosa |

---

## 2. Mensagem central e posicionamento

### 2.1 O diferencial não está no material — e isso é o problema número um

Li os 334 linhas do `translation.json` procurando uma resposta para "por que a Lemamon e não outra?". **Não existe.** O material atual sustenta apenas duas afirmações: *fazemos software sob medida* e *atendemos bem*. Ambas são pré-requisito de mercado, não diferencial.

Antes de escrever a mensagem central é preciso escolher um posicionamento. Abaixo três hipóteses viáveis, com trade-offs honestos. Elas são **mutuamente exclusivas na comunicação de topo** (a home só pode defender uma), embora a operação possa fazer as três.

---

#### Hipótese A — Especialista de nicho vertical

> "A Lemamon faz software para [SETOR — ex.: operações logísticas de médio porte]. Só isso."

**Como soa na home:** headline nomeia o setor e a dor específica dele. O blog fala a língua do setor. Cases são todos do mesmo vertical.

| A favor | Contra |
|---|---|
| Preço premium: especialista cobra 2–3x o generalista pelo mesmo escopo | Exige 3+ cases publicáveis no mesmo setor. **Hoje a Lemamon não tem nem 1 case publicado** |
| Ciclo de venda curto: o lead chega já convencido de que você entende o problema dele | Fecha a porta para leads fora do nicho — e hoje toda receita provavelmente vem de fora dele |
| SEO muito mais barato: "sistema de gestão para transportadora" tem menos concorrência que "desenvolvimento de software" | Se o nicho encolher, a empresa encolhe junto |
| Indicação boca a boca circula dentro do setor | Só é honesto se houver experiência real acumulada — fingir nicho é detectável na primeira reunião |

**Veredicto:** é o posicionamento de maior retorno, mas **prematuro**. Só adotar quando existirem 3 cases reais no mesmo vertical.

---

#### Hipótese B — Squad sob demanda (time plugável)

> "Um time de produto sênior plugado na sua operação, por mês, sem passivo trabalhista."

**Como soa na home:** vende *capacidade contínua*, não projeto. Preço por squad/mês. CTA é "montar seu squad".

| A favor | Contra |
|---|---|
| Receita recorrente e previsível — muda o valuation da agência | Comprador é diferente: CTO/Head de Produto de empresa que **já tem** time. Ticket alto, ciclo de venda longo (2–4 meses) |
| Ticket anual muito maior que projeto fechado | Concorre com body shops grandes e com plataformas internacionais que pagam mais pelos mesmos devs |
| Elimina a briga de escopo fechado | Exige provar senioridade **individual** dos profissionais: perfis, GitHub, experiência nominal. Isso é público e checável |
| Casa bem com o link de GitHub já existente no footer (`github.com/lemamon-dev`) | Requer banco de talentos disponível; sem isso, você vende e não entrega |

**Veredicto:** viável como **oferta secundária** ("continuidade") depois da entrega do primeiro projeto, não como mensagem de topo.

---

#### Hipótese C — Parceiro de produto de ponta a ponta, com escopo e prazo fechados *(recomendado)*

> "Para a empresa que já superou a planilha e não quer montar time interno: da descoberta ao software rodando, com escopo, prazo e preço fechados antes de começar."

**Como soa na home:** o herói é o **método** — descoberta paga, escopo fechado, entregas quinzenais, suporte pós-lançamento. O diferencial é *previsibilidade*, não tecnologia.

| A favor | Contra |
|---|---|
| **É o que o site já é hoje**, feito direito: o wizard em `/projects` já pressupõe escopo fechado (serviço → tipo → segmento → adicionais) | "Ponta a ponta" é a promessa mais comum do mercado — a diferenciação precisa vir 100% do **mecanismo**, não da promessa |
| Não exige case de nicho: exige mostrar **processo**, que a Lemamon controla e pode publicar amanhã | Escopo fechado transfere risco para a agência; sem descoberta paga, mata a margem |
| Ataca o medo real do comprador de PME/scale-up: "vou pagar, vai atrasar e não vai funcionar" | Ticket menor que o da Hipótese B, sem recorrência automática |
| Permite a "Como trabalhamos" que o cliente **pediu explicitamente** — ela vira a seção-herói da página | Precisa de disciplina operacional: se você prometer entrega quinzenal e não entregar, o copy vira passivo |

**Veredicto: adotar a Hipótese C agora.** Ela é a única sustentável com o material que existe hoje, ela transforma o pedido do cliente ("contar como trabalhamos") no coração da narrativa, e ela cria o caminho natural para migrar depois para A (quando houver cases de nicho) ou vender B como upsell (contrato de evolução contínua).

---

### 2.2 A mensagem central (sob a Hipótese C)

**Frase de posicionamento (uso interno, não vai no site):**

> A Lemamon desenvolve software sob medida para empresas brasileiras de pequeno e médio porte que precisam substituir processos manuais por sistemas próprios, entregando com escopo, prazo e preço definidos antes da primeira linha de código — e mostrando software funcionando a cada duas semanas até o fim. `[CONFIRMAR: cadência real de entrega]`

**O porquê (a crença que sustenta a empresa):**

> A maior parte dos projetos de software terceirizados não falha por falta de tecnologia. Falha por falta de combinado. O cliente não sabe o que vai receber, o fornecedor não sabe o que prometeu, e os dois descobrem juntos, tarde demais. A Lemamon existe para tirar essa incerteza do caminho: primeiro a gente combina, depois a gente escreve código.

**O diferencial (o mecanismo, não o adjetivo):**

> Toda proposta da Lemamon nasce de uma descoberta estruturada, entra com escopo e preço fechados, e roda em entregas quinzenais que você usa de verdade — não em apresentação de slide. `[CONFIRMAR: descoberta é paga ou gratuita? Duração?]`

**Regra de ouro para todo copy novo:** cada afirmação institucional precisa passar no **teste da negação** — se o concorrente não pode escrever o contrário sem parecer ridículo, a frase não diferencia e deve ser reescrita. "Oferecemos qualidade" reprova. "Preço fechado antes de começar" passa (muitos concorrentes cobram por hora e defendem isso).

---

## 3. Copy novo — pronto para colar

> Estrutura proposta da nova Home, na ordem de rolagem. Cada bloco traz título, texto e CTA finais. As chaves i18n sugeridas estão em `código` para facilitar o mapeamento em `src/locales/pt-BR/translation.json`.

### 3.1 Hero — 3 variações para teste A/B

As três dividem o mesmo subheadline-base e o mesmo par de CTAs, para que o teste isole a variável headline.

---

**Variação A — ângulo DOR (recomendada como controle)**

`heroContent.title`
> **Sua operação já é grande demais para planilha. E cara demais para continuar assim.**

`heroContent.text`
> A Lemamon desenvolve o sistema sob medida que a sua empresa precisa — com escopo, prazo e preço fechados antes de começar, e software funcionando na sua mão a cada duas semanas. `[CONFIRMAR: cadência]`

---

**Variação B — ângulo MÉTODO**

`heroContent.title`
> **Software sob medida com preço fechado. Sem surpresa no meio do caminho.**

`heroContent.text`
> A gente combina o escopo, o prazo e o valor antes da primeira linha de código. Depois disso, você acompanha entregas quinzenais até o sistema estar rodando na sua operação. `[CONFIRMAR: cadência]`

---

**Variação C — ângulo TIME / MODELO**

`heroContent.title`
> **O time de produto que a sua empresa precisa, sem precisar contratar um.**

`heroContent.text`
> Produto, design e engenharia em um time só, focado no seu sistema. Escopo e prazo definidos no começo, entregas quinzenais até o fim, suporte depois do lançamento. `[CONFIRMAR: cadência e escopo do suporte]`

---

**CTAs do hero (iguais nas três variações):**

`heroContent.button[0].title` → **Agendar diagnóstico gratuito de 30 min** → `[PLACEHOLDER — link do Cal.com/Calendly]`
`heroContent.button[1].title` → **Ver como trabalhamos** → âncora `#processo`

> **Nota de implementação:** o CTA primário deixa de ser o wizard. O wizard (`/projects`) passa a ser o CTA da seção de Serviços, com rótulo honesto — "Montar o escopo do meu projeto (4 perguntas)" — e não mais mascarado de "Conheça Mais".

**Faixa de credibilidade logo abaixo do hero** (uma linha, sem título):

`heroContent.trustline`
> `[PLACEHOLDER — preencher com dado real: ex. "+X projetos entregues · Y anos de estrada · clientes em Z estados"]` — Florianópolis, SC · atendimento remoto para todo o Brasil

> **Regra:** se não houver números reais e confortáveis de publicar, esta faixa vira uma linha de **stack** (que é fato verificável e não exige autorização de cliente): "React · React Native · Node.js · TypeScript · PostgreSQL · AWS" `[CONFIRMAR: stack real]`. É infinitamente melhor do que a faixa vazia ou do que um número inflado.

---

### 3.2 Seção Problema — "Você provavelmente está aqui"

`problemContent.title`
> **Dá pra reconhecer o momento em que o improviso passa a custar caro**

`problemContent.text`
> Se você marcou dois ou mais itens abaixo, o problema não é mais falta de organização. É falta de sistema.

`problemContent.items` (4 cards curtos, mesmo padrão visual dos serviços):

1. **A planilha virou o sistema da empresa** — e uma pessoa só sabe mexer nela sem quebrar.
2. **A mesma informação é digitada duas vezes** — no ERP e no WhatsApp, no site e no caderno. Alguém sempre erra.
3. **Você paga por três ferramentas que não conversam** — e ainda paga uma pessoa para copiar dados entre elas.
4. **O software que você comprou pronto não faz o principal** — porque o seu processo não é igual ao de mais ninguém.

`problemContent.cta`
> **Me conta o seu caso em 30 minutos** → `[PLACEHOLDER — link de agendamento]`

---

### 3.3 Seção Como trabalhamos

*(copy completo na seção 4 deste documento — é a seção mais importante da nova Home)*

---

### 3.4 Seção Serviços — reescrita orientada a resultado

`servicesContent.title`
> **O que a gente constrói**

`servicesContent.text`
> Três frentes, um time só. Você pode contratar uma ou a solução completa — e em qualquer caso o escopo e o preço são definidos antes de começar.

`servicesContent.items`:

**1. Sistemas internos (ERP, CRM, painéis de gestão)**
> Quando o processo da sua empresa não cabe em software de prateleira. A gente mapeia o fluxo que você já usa e transforma em sistema — com os controles, permissões e relatórios que a sua operação exige de verdade.

**2. Aplicativos e plataformas para o seu cliente final**
> App, marketplace, e-commerce ou área do cliente. Da interface ao servidor, incluindo publicação nas lojas da Apple e do Google e o painel administrativo para você tocar sozinho depois.

**3. Automação e integração de sistemas**
> Conectamos o que você já usa — ERP, gateway de pagamento, ferramenta de marketing, planilha — para que o dado seja digitado uma vez só e chegue certo nos dois lados.

`servicesContent.cta`
> **Montar o escopo do meu projeto (4 perguntas)** → `/projects`

> **Nota de implementação:** para esta seção ter CTA é preciso alterar `src/components/ContentBlock/index.tsx`, que hoje só renderiza botões quando `direction === "right"`. Ou usar `direction="right"` neste bloco, ou desacoplar a renderização do botão da direção da animação. Ver seção de arquitetura de componentes.

---

### 3.5 Seção Prova / Cases

`casesContent.title`
> **Projetos que já estão rodando**

`casesContent.text`
> Cada card abaixo é um sistema em produção, com o problema que resolveu e o resultado que gerou.

`casesContent.cta`
> **Ver todos os cases** → `/cases`

> Conteúdo dos cards e template completo na seção 5. **Enquanto não houver ao menos 2 cases reais autorizados, esta seção não deve ir ao ar** — seção de cases vazia ou com exemplo genérico é pior do que seção ausente.

---

### 3.6 Seção Quem faz

`teamContent.title`
> **Quem vai mexer no seu projeto**

`teamContent.text`
> A Lemamon é um time enxuto e sênior, com sede em Florianópolis e atendimento remoto para todo o Brasil. Você fala direto com quem escreve o código — não com um gerente de contas que repassa recado. `[CONFIRMAR: tamanho e composição real do time]`

`teamContent.cta`
> **Ver nosso código no GitHub** → `https://github.com/lemamon-dev`

> Esse CTA é prova social gratuita e verificável, e o link **já existe no footer**. Trazê-lo para o corpo da página é o ganho de credibilidade mais barato disponível hoje.

---

### 3.7 Seção FAQ — onde as objeções morrem

`faqContent.title`
> **As perguntas que todo cliente faz antes de fechar**

**Quanto custa um projeto com vocês?**
> Depende do escopo, e por isso a gente não trabalha com tabela. O que a gente garante é que você recebe **um valor fechado** antes de começar — e ele não muda no meio do caminho, a não ser que você mude o escopo. A faixa típica dos nossos projetos fica entre `[PLACEHOLDER — preencher com faixa real de ticket]`.

**Quanto tempo leva?**
> A descoberta leva `[PLACEHOLDER — ex. 1 a 2 semanas]`. O desenvolvimento depende do escopo, mas você vê software funcionando já na primeira entrega, `[CONFIRMAR: em quantas semanas?]` depois da assinatura.

**E se eu mudar de ideia no meio?**
> Muda. Sempre muda — e o processo prevê isso. A cada entrega você testa e ajusta. Mudanças dentro do escopo entram na próxima quinzena; mudanças que aumentam o escopo viram um orçamento novo, aprovado por você antes de virar trabalho.

**O código é meu?**
> É seu. Repositório, infraestrutura e documentação ficam no nome da sua empresa desde o primeiro dia. Você não fica preso à Lemamon para evoluir o produto depois.

**Vocês somem depois de entregar?**
> Não. Todo projeto inclui `[PLACEHOLDER — ex. 30/60/90 dias]` de garantia para correção de defeitos, e existe um plano mensal opcional para evolução contínua.

**Vocês atendem fora de Santa Catarina?**
> Sim. O trabalho é remoto por padrão e temos clientes em `[PLACEHOLDER — preencher com estados/regiões reais]`.

---

### 3.8 CTA final

`ctaContent.title`
> **Trinta minutos agora podem evitar seis meses de projeto errado**

`ctaContent.text`
> Na conversa de diagnóstico a gente entende o seu processo, aponta o caminho mais curto e diz com franqueza se dá para resolver com uma ferramenta de prateleira — inclusive quando isso significa não vender nada para você.

`ctaContent.button`
> **Agendar diagnóstico gratuito** → `[PLACEHOLDER — link de agendamento]`

`ctaContent.reassurance`
> Sem compromisso, sem proposta comercial na primeira conversa. Respondemos em até 1 dia útil. `[CONFIRMAR: SLA real de resposta]`

---

### 3.9 Formulário de contato — reescrita das chaves existentes

Substituições diretas em `contactForm` e `contactContent`:

| Chave | Hoje | Novo |
|---|---|---|
| `contactContent.title` | "Entre em Contato" | **Vamos conversar sobre o seu projeto** |
| `contactContent.text` | "Tem alguma dúvida? Sinta-se à vontade para entrar em contato. Nossa equipe está pronta para ajudar..." | **Descreva em duas linhas o que você precisa resolver. A gente responde em até 1 dia útil com os próximos passos — e sem enrolação comercial.** `[CONFIRMAR: SLA]` |
| `anyQuestions` | "Tem alguma dúvida? Sinta-se à vontade para entrar em contato." | **Quer tirar o projeto do papel? Fale com a gente.** |
| `Let's Chat` | "Vamos Conversar" | **Falar com a Lemamon** |
| `contactForm.labelDescription` | "Descreva sua ideia" | **O que você precisa resolver?** |
| `contactForm.sendButton` | "Enviar" | **Enviar e agendar conversa** |
| `contactForm.successSubTitle` | "Em breve nossa equipe entrará em contato." | **Recebemos. Você recebe um retorno em até 1 dia útil no e-mail informado.** `[CONFIRMAR: SLA]` |
| `contactForm.errorTitle` | "Erro ao criar projeto" | **Não conseguimos enviar. Tente de novo ou escreva direto para contato@lemamon.dev** `[CONFIRMAR: criar e-mail no domínio próprio — hoje é `lemamon.dev@gmail.com`]` |

### 3.10 Metadados (`index.html`)

```html
<html lang="pt-BR">
<title>Lemamon · Software sob medida com escopo e prazo fechados</title>
<meta name="description" content="Desenvolvemos sistemas, apps e integrações sob medida para empresas brasileiras. Escopo, prazo e preço definidos antes de começar. Diagnóstico gratuito de 30 minutos.">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="Lemamon · Software sob medida com escopo e prazo fechados">
<meta property="og:description" content="Sistemas, apps e integrações para empresas que precisam substituir processo manual por software próprio. Preço fechado, entregas quinzenais.">
<!-- REMOVER a tag <meta name="keywords">: ignorada pelo Google e hoje duplica a description -->
```

---

## 4. Estrutura "Como trabalhamos" — pedido explícito do cliente

Esta é a seção que carrega o posicionamento inteiro. Ela deve ficar **imediatamente abaixo do hero e da seção de problema**, antes dos serviços — porque o método *é* a oferta.

**Cabeçalho da seção**

`processContent.title`
> **Como a gente trabalha**

`processContent.text`
> Cinco etapas, nessa ordem, em todo projeto. Você sabe onde está, o que vem depois e o que já foi pago — do primeiro contato ao suporte pós-entrega.

---

**Etapa 1 — Descoberta**

`processContent.steps[0].label` → `01 · Descoberta`
`processContent.steps[0].title` → **Primeiro a gente entende o processo. Depois fala de software.**
`processContent.steps[0].text`
> Sentamos com quem executa o trabalho hoje — não só com quem decide. Mapeamos o fluxo real, os gargalos e o que já existe de sistema na casa. No fim, você tem um documento de escopo com o que será construído, o que ficou de fora e por quê.
>
> **Você recebe:** documento de escopo, protótipo navegável das telas principais e estimativa de prazo. `[CONFIRMAR: entregáveis reais da descoberta]`
> **Duração:** `[PLACEHOLDER — ex. 1 a 2 semanas]`

---

**Etapa 2 — Proposta**

`processContent.steps[1].label` → `02 · Proposta`
`processContent.steps[1].title` → **Preço fechado, prazo fechado, assinado antes de começar.**
`processContent.steps[1].text`
> Com o escopo na mão, a proposta vira um número só — sem "a partir de", sem hora extra escondida. Se durante o projeto você quiser algo que não estava combinado, isso vira um orçamento à parte que você aprova antes de virar trabalho.
>
> **Você recebe:** proposta com valor fechado, cronograma por entrega e contrato com a propriedade do código no nome da sua empresa.

---

**Etapa 3 — Sprints**

`processContent.steps[2].label` → `03 · Sprints`
`processContent.steps[2].title` → **A cada duas semanas você usa o que foi feito.** `[CONFIRMAR: cadência]`
`processContent.steps[2].text`
> Nada de sumir por três meses e voltar com uma surpresa. A cada quinzena entregamos uma parte funcionando em ambiente de teste, você usa de verdade e diz o que precisa ajustar. O ajuste entra na quinzena seguinte.
>
> **Você recebe:** acesso ao ambiente de testes desde a primeira entrega, um canal direto com quem está desenvolvendo e um resumo por escrito do que foi feito e do que vem a seguir.

---

**Etapa 4 — Entrega**

`processContent.steps[3].label` → `04 · Entrega`
`processContent.steps[3].title` → **Entrar no ar é o começo, não o fim.**
`processContent.steps[3].text`
> Colocamos o sistema em produção, migramos os dados que você já tem, publicamos o app nas lojas quando for o caso e treinamos o seu time para operar sem depender da gente.
>
> **Você recebe:** sistema em produção, dados migrados, documentação técnica, acessos no nome da sua empresa e treinamento gravado para quem entrar no time depois.

---

**Etapa 5 — Suporte e evolução**

`processContent.steps[4].label` → `05 · Suporte`
`processContent.steps[4].title` → **Software vivo precisa de manutenção. A gente fica.**
`processContent.steps[4].text`
> Todo projeto sai com garantia para correção de defeitos. Depois disso, quem quiser continuar evoluindo o produto contrata um plano mensal com horas de desenvolvimento, monitoramento e atendimento prioritário. Quem não quiser, leva o código e toca sozinho — sem multa e sem dependência.
>
> **Você recebe:** `[PLACEHOLDER — ex. 90 dias]` de garantia, monitoramento de erros em produção e plano mensal opcional. `[CONFIRMAR: existe plano mensal? Qual o formato?]`

---

**CTA de fechamento da seção**

`processContent.cta`
> **Começar pela descoberta** → `[PLACEHOLDER — link de agendamento]`

`processContent.microcopy`
> A primeira conversa é gratuita e dura 30 minutos. Você sai dela com um caminho, mesmo que não feche com a gente.

---

## 5. Prova social

### 5.1 O que buscar, em ordem de custo x impacto

| Tipo de prova | Esforço | Impacto | Como conseguir |
|---|---|---|---|
| **Stack declarada** | Nenhum | Médio | É fato interno. Publicar hoje: "React · React Native · Node · TypeScript · PostgreSQL · AWS" `[CONFIRMAR]` |
| **Repositórios públicos** | Nenhum | Médio-alto | `github.com/lemamon-dev` já existe no footer. Subir para o corpo da página |
| **Case com número** | Alto | **Altíssimo** | Pedir ao cliente na entrega, enquanto o resultado está fresco. Template abaixo |
| **Depoimento nominal (nome + cargo + empresa + foto)** | Médio | Alto | Pedir junto do encerramento do projeto, com texto pré-redigido para o cliente só editar |
| **Logo de cliente** | Baixo | Alto | Exige autorização por escrito. Pedir sempre no contrato: cláusula de uso de marca em portfólio |
| **Tempo de entrega** | Nenhum | Alto | "Da assinatura ao primeiro sistema no ar: X semanas" — é dado próprio, basta medir |
| **Depoimento em vídeo (60s)** | Alto | **Altíssimo** | Chamada gravada de 15 min editada para 60s. Converte mais que qualquer texto |
| **Números da própria operação** | Baixo | Médio | "X projetos entregues", "Y anos", "Z% dos clientes renovam" — só publicar se for verdade e confortável |

**Regra de ouro:** depoimento sem nome, cargo, empresa e foto vale zero — o visitante assume que foi inventado. **Depoimento anônimo é pior que nenhum depoimento**, porque sinaliza que você tentou enganar.

**Hierarquia de fallback**, enquanto não houver cases autorizados:
1. Nenhum case → publicar **stack + GitHub + método detalhado + FAQ com preço**. Método detalhado é prova de competência.
2. Case sem autorização de nome → publicar anonimizado por **setor e porte**: "Transportadora de médio porte em SC". Menos forte, mas honesto e usável.
3. Nunca → inventar cliente, logo ou número.

### 5.2 Template de case study

```markdown
## [Nome do cliente ou "Setor + porte", se anonimizado]
**Setor:** …  |  **Porte:** …  |  **Prazo:** … semanas  |  **Escopo:** …

### O problema
2–3 frases sobre o que doía ANTES. Concreto, em linguagem do cliente,
sem citar tecnologia. O que era feito à mão, o que era perdido, o que
custava caro.

### O que construímos
2–3 frases sobre a solução, em português de negócio. Tecnologia entra
em uma linha à parte, não no corpo.

### O resultado
- Métrica 1: de X para Y  (o número mais importante primeiro)
- Métrica 2: de X para Y
- Métrica 3 (qualitativa, se não houver terceira métrica dura)

### Depoimento
> "Citação de 2–3 linhas, dita por gente de verdade, com nome completo,
> cargo e empresa."
> — Nome Sobrenome, Cargo, Empresa

**Stack:** …
**Prazo total:** da descoberta ao go-live, em semanas.
```

### 5.3 Exemplo preenchido

> ⚠️ **EXEMPLO / PLACEHOLDER — CONTEÚDO FICTÍCIO.**
> O bloco abaixo existe **apenas** para demonstrar o formato e o nível de concretude esperado. Empresa, pessoa e números **não são reais** e **não podem ir ao ar sob nenhuma hipótese**. Substituir integralmente por dados de um cliente real com autorização por escrito antes da publicação.

```markdown
## [EXEMPLO — NÃO PUBLICAR] Transportadora de médio porte — SC
**Setor:** Logística  |  **Porte:** ~80 funcionários  |  **Prazo:** 14 semanas
**Escopo:** Sistema de gestão de fretes + app do motorista

### O problema
Os pedidos de frete chegavam por WhatsApp e eram anotados numa planilha
compartilhada. Três pessoas mexiam no mesmo arquivo ao mesmo tempo, e a
conferência de comprovante de entrega era feita por foto no celular do
motorista — quando o motorista lembrava de mandar. Fechar a fatura do mês
levava quatro dias de trabalho manual.

### O que construímos
Um sistema web onde o time comercial registra o frete e acompanha o status
em tempo real, e um app para o motorista confirmar coleta e entrega com foto
e assinatura no próprio celular, funcionando offline em área sem sinal. O
fechamento da fatura passou a ser um relatório gerado em um clique.

### O resultado
- Fechamento de faturamento: de 4 dias para 2 horas
- Comprovantes de entrega registrados no mesmo dia: de 61% para 98%
- Retrabalho por pedido digitado errado: de ~30 ocorrências/mês para 2

### Depoimento
> "A gente não queria um sistema bonito, queria parar de perder comprovante.
> Na terceira semana já estava usando uma parte no dia a dia, e isso mudou o
> jogo — deu para ajustar o que não servia antes de estar tudo pronto."
> — Nome Sobrenome, Diretor de Operações, Empresa Exemplo Ltda.

**Stack:** React, React Native, Node.js, PostgreSQL, AWS
**Prazo total:** 14 semanas da descoberta ao go-live
```

### 5.4 Como apresentar na home

- **Máximo 3 cases na home**, cada um em card com: setor, uma frase de problema, **o número mais forte em destaque tipográfico**, e link para o case completo.
- **Faixa de logos** só a partir de 4 logos autorizados. Com menos de 4, a faixa parece vazia e denuncia a falta de clientes.
- **Um depoimento em destaque** logo abaixo da seção "Como trabalhamos" — é ali que a objeção "será que cumprem mesmo?" nasce, e é ali que ela deve morrer.
- Números sempre com **contexto de antes e depois**. "Reduzimos 40%" sem base é ruído; "de 4 dias para 2 horas" é argumento.

---

## 6. Plano de conteúdo do blog

### 6.1 O que fazer com os posts falsos — remover agora

Estado atual em `src/data/posts.ts`:

- **Autores inventados**: "João Silva", "Maria Santos", "Pedro Oliveira" — pessoas que não existem, assinando conteúdo público. Não é só ruim de marketing: é declaração falsa de autoria.
- **Conteúdo sem relação com a oferta**: "Introdução ao JavaScript Moderno", "Dicas de CSS Grid", "Checklist de Otimização Web". Esse conteúdo atrai **desenvolvedor júnior estudando**, exatamente o público que nunca vai contratar a Lemamon. Atrair o público errado é pior do que não atrair ninguém — polui o sinal do site para o Google e infla métricas inúteis.
- **Links quebrados em produção**: `https://exemplo.com/videos/css-grid-tutorial.mp4` e `https://exemplo.com/thumbnails/css-grid.jpg` são placeholders publicados.
- **Hotlink de imagens de terceiros**: `static.vecteezy.com/.../javascript-logo...png` e `conversion.com.br/wp-content/uploads/2024/03/GRAFICO.png` — imagens carregadas do servidor alheio, com risco de direito de imagem e de quebrar sem aviso.
- **Datas envelhecidas**: 15, 16 e 17 de janeiro de 2024. Um blog com três posts do mesmo dia, há mais de dois anos, comunica "abandonado".

**Recomendação: remover, não despublicar.**

1. Esvaziar o array em `src/data/posts.ts` (`const posts: Post[] = []`). Manter os tipos e o componente — a estrutura de renderização é boa e será reaproveitada.
2. Fazer o componente de listagem tratar o estado vazio: se `posts.length === 0`, **esconder o link "Blog" do footer e a rota `/blog`**. Blog vazio publicado é pior que blog inexistente.
3. Republicar a rota só quando existirem **3 posts reais**. Três é o mínimo para a seção não parecer abandonada.
4. Preservar um post fictício como fixture de teste, se necessário — mas em `src/data/__fixtures__/`, fora do bundle de produção.
5. Definir e usar autor real e único: `[CONFIRMAR: quem assina o conteúdo? Sugestão: assinar com nome próprio do fundador — pessoa vende mais que marca em agência pequena]`.
6. Avaliar o Medium já linkado no footer (`medium.com/@lemamon.dev`): ou consolidar tudo no blog próprio (melhor para SEO do domínio) ou publicar no blog próprio e republicar no Medium com `canonical` apontando para o site.

### 6.2 Quem o blog precisa atrair

**Não é desenvolvedor.** É o **dono ou diretor de operações de empresa de 20 a 200 funcionários** que já sentiu a dor do processo manual e está começando a pesquisar solução. Ele não pesquisa "async/await"; pesquisa "quanto custa fazer um sistema", "sistema próprio ou pronto", "como escolher empresa de desenvolvimento".

### 6.3 Pauta editorial — 10 posts

Ordenados por prioridade de publicação. Cadência sugerida: 1 post a cada 15 dias.

| # | Título | Palavra-chave / intenção | Por que atrai o cliente-alvo | CTA do post |
|---|---|---|---|---|
| 1 | **Quanto custa desenvolver um sistema sob medida no Brasil em 2026 (e o que faz o preço subir)** | "quanto custa desenvolver um sistema" — comercial | É a busca nº 1 de quem está avaliando. Responder com faixa e critérios reais gera confiança imediata e filtra lead fora de orçamento | Diagnóstico gratuito |
| 2 | **Sistema pronto ou sob medida? Um passo a passo honesto para decidir** | "sistema pronto ou sob medida" — comparação | Captura o momento exato da decisão. Recomendar software de prateleira quando for o certo constrói autoridade e gera indicação | FAQ + diagnóstico |
| 3 | **Como escrever um escopo de projeto de software sem ser da área de TI** | "como fazer escopo de projeto de software" — informacional | Entrega ferramenta prática, gera download de checklist e captura e-mail | Modelo de escopo (isca) |
| 4 | **Os 7 sinais de que a sua planilha virou um risco para a operação** | "substituir planilha por sistema" — problema | Fala a dor exata da seção Problema da home. Altamente compartilhável dentro da empresa | Seção Problema |
| 5 | **Preço fechado ou por hora: qual modelo de contrato protege mais o cliente** | "contrato desenvolvimento software preço fechado" — comercial | Defende diretamente o posicionamento da Lemamon com argumento, não com slogan | Como trabalhamos |
| 6 | **De quem é o código que você mandou desenvolver? O que precisa estar no contrato** | "propriedade do código contrato software" — jurídico/comercial | Objeção real e pouco coberta em português. Ranqueia rápido por baixa concorrência | FAQ |
| 7 | **Quanto tempo leva para ter a primeira versão de um sistema no ar** | "quanto tempo leva desenvolver um sistema" — comercial | Segunda busca mais comum depois de preço. Permite mostrar a cadência quinzenal como prova | Como trabalhamos |
| 8 | **Integrar ou trocar? O que fazer quando as suas ferramentas não conversam** | "integração de sistemas empresa" — problema | Vende a terceira frente de serviço sem parecer venda | Serviços |
| 9 | **Publicar um app na App Store e no Google Play: o que ninguém te conta sobre prazos e exigências** | "publicar app na app store empresa" — informacional | Conteúdo de utilidade alta e conhecimento específico. Demonstra experiência sem precisar de case | Serviços |
| 10 | **O que perguntar para uma empresa de desenvolvimento antes de assinar (13 perguntas)** | "como escolher empresa de desenvolvimento de software" — comercial | Post-âncora do funil: o leitor usa a lista para avaliar os concorrentes, e a Lemamon é quem responde melhor a todas | Diagnóstico gratuito |

**Regras editoriais:**

- Todo post fecha com um CTA único e específico — nunca "entre em contato".
- Todo post cita ao menos um número ou faixa real. Post de opinião sem dado não ranqueia e não converte.
- Nada de tutorial de código. Se o time quiser escrever conteúdo técnico para outros devs, o lugar disso é o GitHub ou o Medium — não o blog comercial.
- Posts 1, 2, 5 e 10 são os que vendem. Se só der para publicar quatro, publique esses.

---

## 7. Estratégia de i18n

### 7.1 O problema imediato

`src/translation.ts`:

```ts
fallbackLng: "en",
```

`index.html`:

```html
<html lang="en">
<meta property="og:locale" content="en_EN" />
```

Uma empresa brasileira, com endereço em Florianópolis no rodapé e público-alvo brasileiro, **abre em inglês** para qualquer visitante cujo navegador não esteja explicitamente em `pt`. O HTML declara ao Google que a página é em inglês, enquanto o conteúdo majoritário e o mercado são em português. Além disso `en_EN` não é um código de locale válido (o correto seria `en_US` ou `en_GB`).

### 7.2 Recomendação

**Manter os três idiomas não se justifica hoje.** Três idiomas custam: toda alteração de copy vira três alterações, e é exatamente por isso que o copy atual está congelado e genérico — mexer nele é caro. E o custo é pago sem retorno: não há SEO internacional (sem `hreflang`, sem URLs por idioma, tudo no mesmo `/`), não há operação comercial em espanhol e o espanhol ainda tem o problema de tratamento misto *tú*/*usted* descrito na auditoria.

**Plano em três movimentos:**

**1. Agora — corrigir o default (mudança de 3 linhas, impacto imediato em SEO e conversão)**

```ts
// src/translation.ts
fallbackLng: "pt",
supportedLngs: ["pt", "en"],
```

```html
<!-- index.html -->
<html lang="pt-BR">
<meta property="og:locale" content="pt_BR" />
```

**2. Agora — despriorizar o espanhol.** Manter os arquivos no repositório (não custa nada versionado), mas remover o seletor de espanhol do footer até existir demanda real. `[CONFIRMAR: existe algum cliente ou prospect em espanhol hoje? Se sim, manter.]`

**3. Reescrita — pt-BR primeiro, sempre.** O novo copy nasce em português, é validado em português, e só depois é traduzido. Traduzir antes de validar é multiplicar por três o custo de cada iteração.

**Sobre o inglês:** vale manter **se e somente se** houver intenção real de vender para fora do Brasil (ou para a diáspora tech). Nesse caso o inglês precisa de tratamento próprio, não de tradução literal: a proposta "escopo e preço fechados" compete em outro mercado, com outra referência de preço e outro comprador. Se não houver essa intenção, **remover o inglês também** e ficar monolíngue é a decisão que mais acelera o time de conteúdo.

**Se decidir manter mais de um idioma, implementar direito:**

- URLs por idioma: `lemamon.dev/` (pt-BR, canônica) e `lemamon.dev/en/`. Hoje os três idiomas dividem a mesma URL, o que significa que **o Google só indexa uma versão** — na prática, o esforço de tradução está sendo jogado fora.
- Tags `hreflang` recíprocas entre as versões.
- Detecção por navegador **como sugestão** (banner "View in English"), nunca como redirecionamento automático — redirect automático por idioma prejudica indexação e irrita o usuário.
- Blog **só em pt-BR**. Traduzir conteúdo editorial triplica o custo da operação de conteúdo e é onde o retorno por idioma extra é menor.

---

## 8. Guia de tom de voz

### 8.1 Como a Lemamon soa

**Direta, técnica sem ser hermética, e adulta.** Fala com quem toma decisão de compra, não com quem está aprendendo a programar. Prefere um número a três adjetivos. Não promete o que não controla. Diz "não" quando o certo é não.

**Quatro atributos:**

1. **Concreta** — número, prazo, nome de coisa. Nunca "soluções", sempre "o sistema que fecha a fatura".
2. **Franca** — assume limitação, recomenda o concorrente ou o software de prateleira quando for o caso. Franqueza é a prova social mais barata que existe.
3. **Sem pompa** — escreve como fala em reunião. "A gente" é permitido e preferível a "a empresa".
4. **Focada no cliente** — a frase começa pelo problema dele, não pela capacidade da agência.

### 8.2 O que fazer

- Começar a frase pelo cliente: "Você paga por três ferramentas que não conversam".
- Usar número, prazo e nome próprio de tecnologia.
- Usar verbo no imperativo nos CTAs, dizendo o que acontece: "Agendar diagnóstico de 30 min".
- Nomear o que **não** está incluso. Delimitar aumenta a confiança na promessa.
- Frases curtas. Parágrafo de até 3 linhas.
- Escrever "a gente" e "você". Segunda pessoa, sempre.

### 8.3 O que não fazer

- **Nada de**: "soluções", "transformação digital", "inovação", "excelência", "de ponta", "sinergia", "escalável" (sem contexto), "as mais recentes tecnologias".
- **Nada de** superlativo sem prova: "incrível", "extraordinário", "poderoso", "impressionar".
- **Nada de** emoji em título de página.
- **Nada de** advérbio de reforço: "realmente", "verdadeiramente", "completamente". Se precisa de reforço, a frase é fraca.
- **Nada de** promessa que a Lemamon não controla: "impulsione o crescimento da sua empresa".
- **Nada de** falar de si na terceira pessoa institucional: "nossa equipe está pronta para ajudar".
- **Nada de** obviedade: "os aplicativos são indispensáveis hoje em dia".
- **Nada de** infantilizar: "com carinho", "vamos juntos criar algo extraordinário".

### 8.4 Antes e depois — todos com copy real do site

**1.** `introContent.title`
❌ **Antes:** "Soluções Tecnológicas Personalizadas para o Seu Negócio"
✅ **Depois:** "Sua operação já é grande demais para planilha. E cara demais para continuar assim."
*Por quê:* sai da categoria genérica e entra na dor específica. O concorrente não consegue escrever o contrário.

**2.** `introContent.text`
❌ **Antes:** "Impulsione o crescimento da sua empresa com softwares, websites e aplicativos móveis sob medida. Na lemamon.dev, oferecemos inovação e qualidade em cada projeto."
✅ **Depois:** "A Lemamon desenvolve o sistema sob medida que a sua empresa precisa — com escopo, prazo e preço fechados antes de começar, e software funcionando na sua mão a cada duas semanas."
*Por quê:* troca duas promessas não verificáveis ("inovação", "qualidade") por dois compromissos verificáveis (preço fechado, cadência).

**3.** `aboutContent.section[0]`
❌ **Antes:** "Inovação Constante — Estamos sempre à frente, explorando e implementando as mais recentes tecnologias para garantir que nossos clientes recebam soluções modernas, eficientes e adaptáveis ao seu contexto."
✅ **Depois:** "Tecnologia madura, escolhida a dedo — Usamos o que é estável e tem gente no mercado para dar manutenção: React, Node e PostgreSQL. Novidade só entra quando resolve um problema seu, não quando é novidade."
*Por quê:* transforma autoelogio inverificável em decisão técnica defensável — e neutraliza o medo de ficar refém de stack exótica.

**4.** `aboutContent.section[1]`
❌ **Antes:** "Atendimento Personalizado — Priorizamos um atendimento individualizado, trabalhando lado a lado com nossos clientes para entender suas necessidades e oferecer soluções sob medida que realmente agreguem valor ao negócio."
✅ **Depois:** "Você fala com quem escreve o código — Sem gerente de contas no meio. Canal direto com o time, uma conversa de acompanhamento por semana e um resumo por escrito a cada entrega."
*Por quê:* "atendimento personalizado" é adjetivo; canal direto, reunião semanal e resumo escrito são mecanismos que o cliente consegue cobrar.

**5.** `productContent.text`
❌ **Antes:** "Oferecemos desenvolvimento de software sob medida, criação de websites e aplicativos móveis, consultoria tecnológica e integração de sistemas para maximizar a produtividade e eficiência do seu negócio."
✅ **Depois:** "Três frentes, um time só: sistemas internos para quem não cabe em software de prateleira, aplicativos para o seu cliente final, e integração entre as ferramentas que você já paga. Você contrata uma ou a solução completa."
*Por quê:* organiza em três categorias com critério de escolha, e substitui o clichê final por uma informação útil (dá para contratar parte).

**6.** `contactContent.text`
❌ **Antes:** "Tem alguma dúvida? Sinta-se à vontade para entrar em contato. Nossa equipe está pronta para ajudar e esclarecer todas as suas questões."
✅ **Depois:** "Descreva em duas linhas o que você precisa resolver. A gente responde em até 1 dia útil com os próximos passos — e sem enrolação comercial."
*Por quê:* troca convite passivo por instrução clara + compromisso de prazo. Diz o que acontece depois do clique.

**7.** `projectsContent.intro.title`
❌ **Antes:** "🌟 Bem-vindo à Área de Projetos! 🚀"
✅ **Depois:** "Monte o escopo do seu projeto em 4 perguntas"
*Por quê:* substitui saudação decorativa por promessa de esforço mensurável ("4 perguntas"), que é o que reduz abandono em formulário.

**8.** `projectsContent.questions.f4b29e1d.text` (UX/UI)
❌ **Antes:** "Planejamos a interface e a jornada do usuário com carinho para que seu produto digital encante seus clientes."
✅ **Depois:** "Desenhamos as telas e o fluxo antes de programar — você aprova um protótipo navegável e só depois a gente escreve código."
*Por quê:* tira o sentimento e coloca o entregável e a ordem do processo, que é o que reduz o risco percebido.

**9.** `middleBlockContent.title` + `.text`
❌ **Antes:** "Transforme Ideias em Realidade — Desenvolvemos soluções personalizadas, adaptadas às necessidades específicas de cada cliente, utilizando as melhores práticas e tecnologias para garantir um software que atenda perfeitamente aos objetivos do seu negócio."
✅ **Depois:** "Primeiro a gente combina. Depois a gente escreve código. — Escopo definido, preço fechado e entregas quinzenais que você usa de verdade. É assim que projeto de software para de atrasar."
*Por quê:* "Transformar ideias em realidade" é o slogan mais usado do setor. A versão nova é o posicionamento inteiro em duas frases.

**10.** `contactForm.successSubTitle`
❌ **Antes:** "Em breve nossa equipe entrará em contato."
✅ **Depois:** "Recebemos. Você recebe um retorno em até 1 dia útil no e-mail informado."
*Por quê:* "em breve" não é prazo. O momento pós-envio é o de maior ansiedade do lead e o mais barato de resolver.

---

## 9. Checklist de implementação de conteúdo

**Fazer hoje (custo quase zero, impacto alto):**
- [ ] `fallbackLng: "pt"` em `src/translation.ts`
- [ ] `<html lang="pt-BR">` e `og:locale = pt_BR` em `index.html`
- [ ] Remover `<meta name="keywords">`; reescrever `<title>` e `description`
- [ ] Esvaziar `src/data/posts.ts` e esconder a rota `/blog` no estado vazio
- [ ] Remover os links mortos "Press" e "Careers & Culture" do `Footer`
- [ ] Adicionar a chave `"Blog"` aos três `translation.json` (hoje só funciona por acidente do i18next)
- [ ] Criar `contato@lemamon.dev` e substituir o `mailto:` do Gmail
- [ ] Corrigir `"Product": "Services"` no `en/translation.json`

**Fazer na reescrita:**
- [ ] Aplicar todo o copy da seção 3 em `pt-BR/translation.json`
- [ ] Criar as chaves `processContent`, `problemContent`, `faqContent`, `casesContent`
- [ ] Ajustar `ContentBlock` para permitir CTA em blocos `direction="left"`
- [ ] Trocar o CTA primário do hero de `/projects` para o link de agendamento
- [ ] Decidir e preencher todos os `[CONFIRMAR: ...]` deste documento
- [ ] Retraduzir EN a partir do novo PT (ou remover o EN)
- [ ] Não duplicar copy em `src/pages/Projects/project-questions.json` — fonte única em `locales/`

**Fazer quando houver material:**
- [ ] Publicar 2–3 cases usando o template da seção 5.2
- [ ] Ativar a faixa de logos (mínimo 4 autorizados)
- [ ] Publicar os posts 1, 2, 5 e 10 da pauta
- [ ] Preencher a `trustline` do hero com números reais
