# 04 — SLA de resposta, follow-up, retomada e WhatsApp Business

**Backlog:** B057 (SLA em horas úteis com responsável, modelos por classe e alerta na planilha), B364 (follow-up D+3, D+7, D+14 com datas calculadas e envio registrado), B044 (sequência de retomada com mensagens prontas em pt/en/es, UTMs e checklist de automação), B323 (newsletter: opt-in no D+30, lista, sincronização de descadastros antes de cada envio, envio e métricas), B324 (sequência de topo de funil: não se aplica hoje), B325 (WhatsApp Business nos 3 idiomas), B074 (parcial: confirmação D0 feita por pessoa, não por e-mail automático).
**Fontes:** BLUEPRINT §7.6 a §7.8, §12; 06-marketing §6.5.3 a §6.5.5; 07-negocios §7.6.2; i18n `quote._notes.privacy`.

---

## 1. SLA interno de primeiro contato (B057)

**O site não publica prazo de resposta** (BLUEPRINT §12 proíbe SLA com número no copy). O SLA abaixo é compromisso interno, medido no CRM.

| Item | Definição |
|---|---|
| Horário de atendimento | [PREENCHER] (dias e horas, fuso `America/Sao_Paulo`) |
| Responsável pelo primeiro contato | [PREENCHER] |
| Backup (férias, picos) | [PREENCHER] |
| Relógio do SLA | começa no horário do envio (Netlify Forms) e para na primeira mensagem humana |
| Unidade | **horas úteis**: só contam as horas dentro do horário de atendimento acima, nos dias de atendimento (padrão: segunda a sexta), sem feriados. Um pedido que chega sexta às 18h e é respondido segunda na abertura tem 0 h úteis |

| Score | Meta interna (horas úteis) | Referência dos documentos |
|---|---|---|
| A | [PREENCHER] | 07 sugere 2 h úteis; 06 sugere 15 min |
| B | [PREENCHER] | 07 sugere 24 h úteis |
| C | [PREENCHER] | 07 sugere 48 h úteis |
| D | [PREENCHER] | 07 sugere 48 h úteis |
| Formulário `contato` | [PREENCHER] | — |
| WhatsApp direto | [PREENCHER] | — |

Copie esta tabela para a aba `Config` da planilha (playbook [05](05-crm-e-funil.md) §5): é dela que sai a meta de cada linha.

**Como medir:** na aba `Pedidos` (05 §5), `horas_sla` conta as horas úteis desde o envio até o primeiro contato (ou até agora, se ainda não houve contato), `meta_sla_h` traz a meta do score e `fora_do_sla` fica `VERDADEIRO` quando `horas_sla` passa da meta, para **qualquer score**. A linha fica vermelha na hora em que estoura, não só depois do contato. O ritual semanal conta os leads A fora do SLA com a fórmula do playbook [13](13-kpis-e-rituais.md) §3.2.

**Teste do alerta (faça uma vez, com linhas de teste `TESTE INTERNO`, e apague depois):**
1. Meta de A = 2 h na `Config`. Crie uma linha A com `recebido_em` 3 horas úteis atrás e `primeiro_contato_em` vazio: a linha fica vermelha e `fora_do_sla` = `VERDADEIRO`.
2. Crie outra linha A, recebida nesta semana, com `primeiro_contato_em` 30 horas úteis depois de `recebido_em`: ela entra na contagem "Leads A fora do SLA" da semana (13 §3.2).
3. Registre o teste em [15](15-registro-de-decisoes.md) §2.

**Critério de aceite:** mediana dentro da meta por 4 semanas seguidas e **zero lead A fora do SLA** conferido no ritual semanal (playbook 13).

**Não existe e-mail automático ao lead** (BLUEPRINT §7.8: "não há envio ao lead"). O pós-envio mostra protocolo e próximos passos; a confirmação D0 é o primeiro contato humano dentro do SLA. Um e-mail transacional automático a todo lead (B074) exigiria código, um provedor novo citado na Política e mudança no BLUEPRINT. A retomada automática só para leads C, sem código, tem checklist próprio na §5.4.

## 2. Primeiro contato: modelos por score

Responda no idioma do pedido (`lang`) e pelo canal escolhido (`channel`). Use o primeiro nome. Nunca cite preço, prazo de desenvolvimento ou algo que o site não promete.

**A — WhatsApp**

> Oi, {primeiro nome}! Aqui é {seu nome}, da Lemamon.dev. Recebi o seu pedido {protocolo} sobre {resumo em 1 linha}. Quero marcar os 45 minutos do diagnóstico gratuito: pode ser {opção 1} ou {opção 2}? Se mais alguém decide com você, vale trazer essa pessoa para a conversa.

**B — WhatsApp**

> Oi, {primeiro nome}! Aqui é {seu nome}, da Lemamon.dev. Li o seu pedido {protocolo}: {resumo em 1 linha}. Vamos marcar o diagnóstico gratuito de 45 minutos? Tenho {opção 1} ou {opção 2}. Depois da conversa, você recebe uma devolutiva por escrito.

**C — WhatsApp ou e-mail**

> Oi, {primeiro nome}! Aqui é {seu nome}, da Lemamon.dev. Obrigado pelo pedido {protocolo}. Pelo que você contou, o projeto ainda está tomando forma, e tudo bem: o diagnóstico serve para entender o problema e o caminho até o software rodando. Quer marcar os 45 minutos? Tenho {opção 1} ou {opção 2}. Se preferir deixar para mais tarde, me diz quando faz sentido.

**D — fora de perfil** (só existe com `dados/dono.json › qualificacao.scoreD.ativo = true`, que exige `confirmacoes.scoreDRecebeDiagnostico`; ver 03 §5)

> Oi, {primeiro nome}! Aqui é {seu nome}, da Lemamon.dev. Obrigado por contar sobre {projeto}. Quero ser franco: pelo que você descreveu, {motivo, ex.: uma primeira versão com tudo isso costuma ficar acima do investimento que você indicou}. {Alternativa, se houver.} Mesmo assim, os 45 minutos do diagnóstico estão de pé se você quiser entender o que caberia: {opção 1} ou {opção 2}.

**E-mail (B ou C)** — assunto: `Seu pedido {protocolo} na Lemamon.dev: vamos marcar o diagnóstico?`

> Oi, {primeiro nome}.
> Aqui é {seu nome}, da Lemamon.dev. Recebi o seu pedido {protocolo} sobre {resumo}.
> O próximo passo é o diagnóstico gratuito: 45 minutos de conversa e, depois, uma devolutiva por escrito. Tenho {opção 1} ou {opção 2}. Se nenhum servir, me diga um horário bom para você.
> {seu nome} · Lemamon.dev · São Paulo, SP

**Ligação** (só com `confirmacoes.ligacao`): apresente-se, cite o protocolo, confirme que é um bom momento, ofereça 2 horários, confirme o canal para o convite. Se não atender, mande mensagem curta no mesmo dia.

**EN** (generic first contact):

> Hi {first name}, this is {your name} from Lemamon.dev. I got your request {protocol} about {summary}. Shall we schedule the 45-minute free assessment? I have {option 1} or {option 2}. Afterward, you'll get written feedback.

**ES** (con "tú"):

> Hola, {nombre}. Soy {tu nombre}, de Lemamon.dev. Recibí tu solicitud {protocolo} sobre {resumen}. ¿Agendamos el diagnóstico gratuito de 45 minutos? Tengo {opción 1} o {opción 2}. Después, te enviamos nuestras conclusiones por escrito.

## 3. Cadência quando o lead não responde ao primeiro contato

| Toque | Quando | Mensagem |
|---|---|---|
| 1 | dentro do SLA | modelo da §2 |
| 2 | +2 dias úteis | "Oi, {nome}. Passando com uma ideia de horário para o diagnóstico: {opção}. Se preferir, me diga um dia bom." |
| 3 | +5 dias úteis | com conteúdo: "Enquanto isso, este texto mostra como a gente trabalha e onde você decide: https://lemamon.dev/como-trabalhamos" |
| Encerramento | +10 dias úteis | "Vou parar de insistir por aqui para não incomodar. Se fizer sentido mais para frente, é só responder esta mensagem." |

Registre cada toque no CRM. Depois do encerramento, status "Sem resposta" (não "sumido"). A Política cobre esta retomada: "Retomar o contato se a conversa não chegar a ser marcada" (`privacy.sections.purposes.items.follow_up`).

Esta cadência vale para A e B que não responderam ao primeiro contato. Lead C entra direto na sequência da §5 (o D0 dela é o primeiro contato da §2), e quem respondeu mas não marcou também vai para a §5. Ninguém recebe as duas ao mesmo tempo.

## 4. Follow-up depois da proposta apresentada (B364)

Só começa **depois da apresentação ao vivo** (playbook 02 §9). Toda mensagem leva conteúdo; nada de "passando para saber".

| Toque | Quando | Conteúdo |
|---|---|---|
| D+3 | 3 dias depois da apresentação | "Na conversa, você perguntou sobre {objeção}. A resposta é {resposta curta}. Ficou mais alguma dúvida?" |
| D+7 | 7 dias | material ligado à objeção: `/como-trabalhamos` (entregas a cada 2 semanas), `/sprint-de-descoberta` (para levar ao sócio), um case publicado do mesmo serviço (quando houver) |
| D+14 | 14 dias | encerramento: "Vou considerar que agora não é o momento e encerrar esta proposta. A validade era {data}. Se mudar, é só responder." |

**Automação:** na planilha, as colunas `fu_d3`, `fu_d7` e `fu_d14` (05 §5) são calculadas a partir de `proposta_apresentada_em` e ficam vermelhas a partir do dia do toque até ele ser registrado em `fu_dN_feito_em` (`fu_d3_feito_em`, `fu_d7_feito_em`, `fu_d14_feito_em`: a data em que a mensagem saiu); depois do D+14 sem resposta, mude a etapa para Perdido (com `motivo_perda`) ou Adiado (com `proximo_passo_em`). Se a linha continuar em "6 Proposta apresentada" depois do D+14, ela inteira fica vermelha até ganhar um status final. Num CRM com automação (D15), crie as três tarefas automaticamente quando a etapa vira "Proposta apresentada". **Critério de aceite:** nenhuma oportunidade fica sem status final (ganho, perdido ou adiado com data) depois do D+14.

## 5. Sequência de retomada para leads C e para quem não marcou (B044)

**Base legal e Política, antes de qualquer automação:**
- Mensagens **1:1, enviadas por uma pessoa, sobre o mesmo pedido**, se apoiam na finalidade "retomar o contato" que a Política já descreve (`privacy.sections.purposes.items.follow_up`). Confirme com o advogado (playbook 10 §4).
- Uma **ferramenta de e-mail automático** (Brevo, Mailchimp, MailerLite) é operador novo: siga o checklist da §5.4 **antes** de ligar qualquer envio automático.
- Quem pedir para parar sai na hora: marque `nao_contatar = sim` no CRM.

**Sequência (manual, 1:1, no canal escolhido pelo lead e no idioma do pedido):**

| Dia | Tema | Página de conteúdo (pt) | `utm_content` |
|---|---|---|---|
| D0 | primeiro contato (§2) | — | — |
| D+3 | como funciona o método e onde você decide | `/como-trabalhamos` | `d3` |
| D+7 | como comparar propostas de software | `/quanto-custa`, seção "Como comparar propostas de desenvolvimento de software" (âncora `#como-comparar`) | `d7` |
| D+14 | o que pesa no preço do tipo de projeto marcado na P2 | página do serviço (tabela da §5.1) ou um case do mesmo serviço, quando houver | `d14` |
| D+21 | para levar a quem decide | `/sprint-de-descoberta` | `d21` |
| D+30 | "Ainda faz sentido?" (uma pergunta só) + convite da newsletter (§6) | — | `d30` |

**UTMs em todo link** (playbook 12 §1): `utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content={toque}`, em que `{canal}` é `whatsapp` ou `email` (o canal em que a mensagem sai) e `{toque}` é `d3`, `d7`, `d14`, `d21` ou `d30`. Toda mensagem termina num CTA único: o diagnóstico gratuito, no caminho `/diagnostico` (pt; o 301 para `/orcamento` leva a query, e o wizard grava a UTM em `attribution`), `/en/quote` (en) ou `/es/cotizacion` (es), sempre com as UTMs acima. A UTM também vale quando a pessoa entra pela página de conteúdo e só depois abre o wizard: o site guarda a campanha da sessão.

O lead C já mandou um pedido. Ele pode simplesmente responder a mensagem com um horário: o link do CTA serve para quem prefere atualizar o cenário ou marcar sozinho. Num e-mail, use o assunto indicado e feche com a assinatura da §2.

### 5.1 Mensagens prontas

**D+3 — onde você decide** · assunto: `Onde você decide num projeto com a Lemamon.dev` · EN `Where you decide in a project with Lemamon.dev` · ES `Dónde decides en un proyecto con Lemamon.dev`

> Oi, {primeiro nome}. Aqui é {seu nome}, da Lemamon.dev, sobre o seu pedido {protocolo}. Uma dúvida comum nesta fase é "em que momento eu me comprometo?". Com a gente, você decide depois da devolutiva por escrito do diagnóstico e, de novo, depois do plano da Sprint de Descoberta. Escopo, prazo e preço são combinados antes de começar o desenvolvimento. O caminho inteiro está aqui: https://lemamon.dev/como-trabalhamos?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d3
> Quando fizer sentido, o diagnóstico gratuito de 45 minutos começa por aqui: https://lemamon.dev/diagnostico?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d3

EN:

> Hi {first name}, this is {your name} from Lemamon.dev, following up on your request {protocol}. A common question at this stage is "when do I commit?". With us, you decide after the written feedback from the free assessment, and again after the Discovery Sprint plan. Scope, timeline and price are agreed before development starts. Here's the whole path: https://lemamon.dev/en/how-we-work?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d3
> When it makes sense for you, the 45-minute free assessment starts here: https://lemamon.dev/en/quote?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d3

ES (con "tú"):

> Hola, {nombre}. Soy {tu nombre}, de Lemamon.dev, sobre tu solicitud {protocolo}. Una duda común en esta etapa es "¿en qué momento me comprometo?". Con nosotros, decides después de nuestras conclusiones por escrito del diagnóstico y, otra vez, después del plan del Sprint de Descubrimiento. El alcance, el plazo y el precio se acuerdan antes de empezar el desarrollo. Aquí está todo el camino: https://lemamon.dev/es/como-trabajamos?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d3
> Cuando tenga sentido para ti, el diagnóstico gratuito de 45 minutos empieza aquí: https://lemamon.dev/es/cotizacion?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d3

**D+7 — como comparar propostas** · assunto: `Perguntas para comparar propostas de software` · EN `Questions to compare software quotes` · ES `Preguntas para comparar cotizaciones de software`

> Oi, {primeiro nome}. Se você está conversando com outros fornecedores, comparar faz parte. Separamos as perguntas que vale fazer a qualquer empresa de software antes de assinar, inclusive a nós: "O que está fora do escopo?", "O preço é fechado ou cobrado por hora?", "Quando eu vejo software funcionando?". As respostas da Lemamon.dev estão logo abaixo de cada pergunta: https://lemamon.dev/quanto-custa?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d7#como-comparar
> Se quiser passar o seu caso por essas perguntas com a gente, o diagnóstico gratuito leva 45 minutos: https://lemamon.dev/diagnostico?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d7

EN:

> Hi {first name}. If you're talking to other vendors, comparing is part of the process. We put together the questions worth asking any software company before you sign, including us: "What's out of scope?", "Is the price fixed or billed by the hour?", "When will I see working software?". Lemamon.dev's answers are right below each question: https://lemamon.dev/en/pricing?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d7#como-comparar
> If you'd like to run your case through these questions with us, the free assessment takes 45 minutes: https://lemamon.dev/en/quote?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d7

ES:

> Hola, {nombre}. Si estás hablando con otros proveedores, comparar es parte del proceso. Reunimos las preguntas que vale la pena hacerle a cualquier empresa de software antes de firmar, incluidos nosotros: "¿Qué queda fuera del alcance?", "¿El precio es fijo o se cobra por hora?", "¿Cuándo veo software funcionando?". Las respuestas de Lemamon.dev están justo debajo de cada pregunta: https://lemamon.dev/es/cuanto-cuesta?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d7#como-comparar
> Si quieres pasar tu caso por estas preguntas con nosotros, el diagnóstico gratuito dura 45 minutos: https://lemamon.dev/es/cotizacion?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d7

**D+14 — o que pesa no preço do serviço** (um modelo para os 5 serviços) · assunto: `O que pesa no preço de {serviço}` · EN `What drives the price of {service}` · ES `Qué pesa en el precio de {servicio}`

> Oi, {primeiro nome}. No seu pedido, você marcou {serviço}. Num projeto assim, o preço sai das escolhas de escopo, mais do que do tamanho da ideia. Na página do serviço, a gente mostra quais escolhas costumam pesar: {link do serviço}
> No diagnóstico gratuito, a gente olha essas escolhas no seu caso, em 45 minutos: https://lemamon.dev/diagnostico?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14

EN:

> Hi {first name}. In your request, you selected {service}. In a project like this, the price depends on scope choices more than on the size of the idea. On the service page, we show which choices usually weigh the most: {service link}
> In the free assessment, we look at those choices in your case, in 45 minutes: https://lemamon.dev/en/quote?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14

ES:

> Hola, {nombre}. En tu solicitud marcaste {servicio}. En un proyecto así, el precio depende más de las decisiones de alcance que del tamaño de la idea. En la página del servicio mostramos qué decisiones suelen pesar más: {enlace del servicio}
> En el diagnóstico gratuito revisamos esas decisiones en tu caso, en 45 minutos: https://lemamon.dev/es/cotizacion?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14

Qual serviço usar: P1 `maintain_live_system` ou `evolve_live_system` → sustentação e evolução; senão, pela P2: `ops_system` ou `client_platform` → sistemas web; `mobile_app` → aplicativos; `integration` ou `automation` → integrações e automação; `mvp` → MVP. Com mais de um tipo marcado, use o primeiro. Se só marcou "Ainda não sei", troque a primeira frase por "No seu pedido, você contou que ainda está definindo o que construir." e use a página de serviços (última linha). Troque `{canal}` no link, como nos outros.

| {serviço} pt · en · es | {link do serviço} pt | en | es |
|---|---|---|---|
| sistemas web · web applications · sistemas web | https://lemamon.dev/servicos/sistemas-web?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/en/services/web-systems?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/es/servicios/sistemas-web?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco |
| aplicativos · mobile apps · aplicaciones móviles | https://lemamon.dev/servicos/aplicativos?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/en/services/mobile-apps?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/es/servicios/aplicaciones?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco |
| integrações e automação · integrations and automation · integraciones y automatización | https://lemamon.dev/servicos/integracoes?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/en/services/integrations?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/es/servicios/integraciones?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco |
| MVP · MVP · MVP | https://lemamon.dev/servicos/mvp?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/en/services/mvp?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco | https://lemamon.dev/es/servicios/mvp?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-pesa-no-preco |
| sustentação e evolução · support and continuous improvement · mantenimiento y evolución | https://lemamon.dev/servicos/sustentacao?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-e | https://lemamon.dev/en/services/support-and-evolution?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-e | https://lemamon.dev/es/servicios/soporte-y-evolucion?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14#o-que-e |
| (só "Ainda não sei") | https://lemamon.dev/servicos?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14 | https://lemamon.dev/en/services?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14 | https://lemamon.dev/es/servicios?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d14 |

A página de sustentação não tem a seção de preço; a âncora `#o-que-e` leva ao que entra no serviço. Com um case publicado do mesmo serviço (`/cases/<slug>`), você pode trocar o link do serviço pelo do case, com as mesmas UTMs.

**D+21 — para levar a quem decide** · assunto: `Para mostrar a quem decide com você` · EN `Something to share with whoever decides with you` · ES `Para mostrarle a quien decide contigo`

> Oi, {primeiro nome}. Se a decisão passa por mais alguém (sócio, diretoria, financeiro), esta página foi feita para ser repassada. Ela explica o que a Sprint de Descoberta entrega (entendimento do problema, escopo priorizado, protótipo e um plano com prazo e preço fechados) e por que ela vem antes do desenvolvimento: https://lemamon.dev/sprint-de-descoberta?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d21
> O primeiro passo continua sendo o diagnóstico gratuito de 45 minutos, com devolutiva por escrito: https://lemamon.dev/diagnostico?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d21

EN:

> Hi {first name}. If someone else is part of the decision (a partner, the board, finance), this page was written to be passed along. It explains what the Discovery Sprint delivers (an understanding of the problem, a prioritized scope, a prototype and a plan with a fixed timeline and price) and why it comes before development: https://lemamon.dev/en/discovery-sprint?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d21
> The first step is still the 45-minute free assessment, with written feedback: https://lemamon.dev/en/quote?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d21

ES:

> Hola, {nombre}. Si la decisión pasa por alguien más (un socio, la dirección, finanzas), esta página está hecha para compartirla. Explica qué entrega el Sprint de Descubrimiento (la comprensión del problema, un alcance priorizado, un prototipo y un plan con plazo y precio cerrados) y por qué va antes del desarrollo: https://lemamon.dev/es/sprint-de-descubrimiento?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d21
> El primer paso sigue siendo el diagnóstico gratuito de 45 minutos, con nuestras conclusiones por escrito: https://lemamon.dev/es/cotizacion?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d21

**D+30 — ainda faz sentido?** · assunto: `Ainda faz sentido?` · EN `Does it still make sense?` · ES `¿Todavía tiene sentido?`

> Oi, {primeiro nome}. Queria saber uma coisa só: o projeto do pedido {protocolo} ainda faz sentido para vocês? Se fizer, o diagnóstico gratuito de 45 minutos continua de pé: https://lemamon.dev/diagnostico?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d30
> Se não for o momento, tudo bem: esta é a última mensagem da sequência.
> Antes de eu parar: posso te mandar um e-mail por mês com um conteúdo da Lemamon.dev? Você sai quando quiser. Se quiser, é só responder "sim".

O último parágrafo é o convite de opt-in da newsletter (texto-modelo da §6). **Só mande esse parágrafo quando a newsletter estiver pronta para começar** (§6, "Antes do 1º envio"); até lá, o D+30 termina na frase anterior. Em en e es, o D+30 não leva o convite: a newsletter é só em português, como o blog (BLUEPRINT §6.12).

EN:

> Hi {first name}. Just one question: does the project from request {protocol} still make sense for you? If it does, the 45-minute free assessment is still available: https://lemamon.dev/en/quote?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d30
> If now isn't the time, that's fine: this is the last message in this sequence.

ES:

> Hola, {nombre}. Solo una pregunta: ¿el proyecto de tu solicitud {protocolo} todavía tiene sentido para ti? Si es así, el diagnóstico gratuito de 45 minutos sigue en pie: https://lemamon.dev/es/cotizacion?utm_source=retomada&utm_medium={canal}&utm_campaign=retomada-c&utm_content=d30
> Si no es el momento, no hay problema: este es el último mensaje de esta secuencia.

### 5.2 Regras de saída

| Aconteceu | O que fazer no CRM (05 §5) |
|---|---|
| Respondeu | volta para o pipeline (a etapa que a resposta indicar); `retomada_reativou` = o toque que trouxe a resposta (ex.: `d7`) |
| Marcou o diagnóstico | etapa "3 Diagnóstico marcado"; `retomada_reativou` = o toque |
| Chegou um pedido novo com `utm_source = retomada` | é o mesmo lead voltando pelo link. O pedido novo ganha linha própria (o trabalho segue nela); na linha antiga, `retomada_reativou` = `utm_content` do pedido novo, etapa "Reativado" e o protocolo novo em `observacoes` |
| Pediu para parar | `nao_contatar = sim`, etapa "Não contatar"; sai também da newsletter: `newsletter_optin = nao` e `newsletter_descadastro_em` em todas as linhas com o mesmo e-mail, e remoção na ferramenta no mesmo dia |
| Descadastrou-se da newsletter (link do e-mail ou pedido por mensagem) | `newsletter_optin = nao` e `newsletter_descadastro_em` (data do descadastro) em **todas** as linhas com o mesmo e-mail, no mesmo dia ou, no máximo, na sincronização antes do próximo envio (§6). `newsletter_optin_em`, `_canal` e `_texto` ficam como histórico. `nao_contatar` só muda se a pessoa pedir para parar todo contato |
| Sem resposta no D+30 | etapa "Sem resposta" |
| Aceitou o convite da newsletter (no D+30 ou em qualquer etapa, inclusive fora da retomada) | `newsletter_optin = sim`, com `newsletter_optin_em` (data), `newsletter_optin_canal` (whatsapp ou email) e `newsletter_optin_texto` (o texto do convite que a pessoa aceitou); entra na lista mensal a partir do D+60, ou seja, 60 dias depois de `recebido_em` (§6) |

A cada toque enviado, atualize `retomada_toque` com o toque (`d3` … `d30`): é ele que diz qual é o próximo.

### 5.3 Medir no CRM

Fórmulas na aba `Relatório` (05 §8), com os nomes das colunas como intervalos nomeados e o período do mês em `recebido_em`:

| Indicador | Fórmula (Google Sheets pt-BR) |
|---|---|
| Leads que entraram na retomada | `=CONT.SES(retomada_toque;"<>";recebido_em;">="&início_do_mês;recebido_em;"<"&início_do_mês_seguinte)` |
| Leads reativados (responderam, marcaram ou voltaram pelo link) | `=CONT.SES(retomada_reativou;"<>";recebido_em;">="&início_do_mês;recebido_em;"<"&início_do_mês_seguinte)` |
| Reativados por toque | a mesma fórmula com `retomada_reativou;"d7"` (repita para `d3`, `d14`, `d21`, `d30`) |
| Diagnósticos vindos da retomada | `=CONT.SES(utm_source;"retomada";diagnostico_em;"<>") + CONT.SES(retomada_reativou;"<>";etapa;"<>Reativado";diagnostico_em;"<>")` (a primeira parte conta os pedidos novos que chegaram pelo link, filtrando `attribution` › `utm_source = retomada`; a segunda, quem respondeu e marcou na linha antiga) |
| Diagnósticos por toque | acrescente `utm_content;"d7"` na primeira parte e `retomada_reativou;"d7"` na segunda |
| Tempo até reativar | dias entre `recebido_em` e a data da resposta, anotada em `observacoes` |

**Cliques** (sessões que vieram das mensagens): GA4 › Relatórios › Aquisição › **Aquisição de tráfego**, filtro "Campanha da sessão" = `retomada-c`, dimensão secundária "Conteúdo do anúncio manual da sessão" (= `utm_content`). Mostra quantas pessoas abriram cada link, mesmo sem pedido novo.

### 5.4 Ativar automação (checklist)

Hoje a sequência é **manual e 1:1**. Automatize só quando o volume de leads C não couber na rotina. Antes do primeiro envio automático, todos os itens:

- [ ] **Decisão registrada:** ferramenta escolhida (Brevo, Mailchimp, MailerLite ou similar), com aditivo de tratamento de dados lido e o país onde os dados ficam anotado — [15](15-registro-de-decisoes.md) D33.
- [ ] **Política atualizada antes:** preencha `dados/dono.json › privacidade.ferramentas.emailAcompanhamento` (fornecedor e prazo de retenção nos 3 idiomas; liga o item "e-mails de acompanhamento a quem pediu o diagnóstico" da Política) e `privacidade.ferramentas.automacao`, se o gatilho for um webhook ou Zapier/Make. Mude `privacidade.atualizadaEm` e publique a Política **antes** de ligar a ferramenta (playbook 10 §3). Se o texto do item não descrever o que a ferramenta faz, peça ao agente `shell` o ajuste em `privacy.sections.processors` nos 3 idiomas.
- [ ] **Advogado:** confirmar que a sequência automática cabe na finalidade "retomar o contato" e, como o score C passa a definir a forma de atendimento, ligar `privacidade.classificacaoDefineAtendimento = true` (variantes `*_with_routing`; 10 §4 item e).
- [ ] **BLUEPRINT:** pedir ao integrador o registro em §7.8 de que existe e-mail automático para leads C (o BLUEPRINT diz hoje "não há envio ao lead"). O pós-envio continua sem prometer e-mail.
- [ ] **Gatilho por score C:** Netlify › Forms › Outgoing webhook do formulário `briefing` (nunca chamado pelo navegador, BLUEPRINT §7.6) → automação que filtra `score = C` e coloca o contato na sequência do idioma (`lang`). Lead que pediu para não ser contatado nunca entra.
- [ ] **Cadência automática:** D0 (o e-mail C da §2, assinado por uma pessoa, com resposta indo para o e-mail do comercial), D+3, D+7, D+14 e D+21, com os textos da §5.1 e `utm_medium=email`. A sequência automática dura 3 semanas; o D+30 continua manual, porque é uma pergunta pessoal e leva o convite da newsletter.
- [ ] **Descadastro em um clique** no rodapé de todo e-mail. Quem se descadastra **da sequência de retomada** recebe `nao_contatar = sim` no CRM no mesmo dia (e sai também da newsletter, como em "Pediu para parar" da §5.2).
- [ ] **Saída por resposta:** resposta ou diagnóstico marcado tira o lead da sequência (automático, se a ferramenta tiver; senão, à mão no mesmo dia).
- [ ] **Teste de aceite** com um pedido de teste C (`TESTE INTERNO`, e-mail da equipe, `utm_source=teste-interno`): o 1º e-mail chega em até 5 minutos; a sequência completa chega ao longo de 2 a 3 semanas; todo e-mail tem link de descadastro que funciona; cada clique abre a página com `utm_source=retomada&utm_campaign=retomada-c` e o `utm_content` do toque. Registre data e resultado em [15](15-registro-de-decisoes.md) §2 e apague o pedido de teste.

## 6. Newsletter mensal (B323)

**Opt-in explícito, sempre.** O convite vai no D+30 da retomada (§5.1) ou em qualquer conversa, com este texto-modelo:

> Posso te mandar um e-mail por mês com um conteúdo da Lemamon.dev? Você sai quando quiser.

Registre no CRM `newsletter_optin = sim`, `newsletter_optin_em`, `newsletter_optin_canal` e `newsletter_optin_texto` (05 §5). Sem esse registro, a pessoa não entra na lista. Só em português (o blog é só pt-BR).

**Antes do 1º envio** (todos os itens):
- [ ] Blog com 3 posts publicados (playbook 12 §7): é a fonte do conteúdo.
- [ ] Ferramenta escolhida e registrada em [15](15-registro-de-decisoes.md) D33, com descadastro em um clique.
- [ ] Política atualizada antes: a newsletter é **finalidade nova** com base no consentimento (LGPD art. 7º, I). Pedido ao agente `shell`: item de finalidade e de base legal da newsletter em `privacy.sections.purposes` e `legal_basis` (3 idiomas, ligados por um campo de `dados/dono.json › privacidade`), e o item da ferramenta em "Com quem compartilhamos". O item atual de `ferramentas.emailAcompanhamento` fala só de acompanhamento a quem pediu o diagnóstico (10 §3 e §4).
- [ ] **A importação nunca reinscreve quem saiu:** na ferramenta, a importação de contatos fica com qualquer opção do tipo "reinscrever", "resubscribe" ou "atualizar o status de inscrição" **desmarcada**, e contato descadastrado continua descadastrado depois de reimportado (confira na documentação da ferramenta escolhida e no teste abaixo). Anote a configuração em [15](15-registro-de-decisoes.md) D33.
- [ ] **Teste de descadastro, com reimportação** (numa lista **de teste** da ferramenta, com a mesma configuração de importação da lista real, para nenhum inscrito real receber teste): (1) crie na aba `Pedidos` duas linhas `TESTE INTERNO` com dois e-mails da equipe (A e B), `newsletter_optin = sim` e `recebido_em` de 60 dias atrás; (2) gere a lista pela fórmula, importe só A e B na lista de teste e mande a edição de teste: os dois recebem; (3) A clica em descadastrar; (4) rode a **sincronização de descadastros** (Operação, abaixo) e confira que a linha de A ficou com `newsletter_optin = nao` e `newsletter_descadastro_em` preenchida; (5) gere a lista do mês seguinte pela fórmula: A não aparece e B aparece; importe na lista de teste o arquivo da **primeira** importação (que ainda tem A) e confira que A continua descadastrado na ferramenta; (6) mande uma segunda edição de teste para a lista de teste: B recebe, A **não** recebe. Apague a lista e as linhas de teste e registre em 15 §2.

**Operação** (nesta ordem, todo mês):

| Item | Definição |
|---|---|
| Quem monta e envia | [PREENCHER] (recomendação: o autor do blog monta, B298; o responsável comercial confere a lista) |
| Dia fixo do mês | [PREENCHER] (recomendação: o mesmo dia útil todo mês, logo depois do ritual mensal, playbook 13 §6) |
| 1. Sincronizar descadastros (**obrigatório, antes de gerar a lista**) | exporte da ferramenta os descadastros e os hard bounces desde o último envio. Para cada e-mail, filtre a coluna `email` da aba `Pedidos` e marque `newsletter_optin = nao` e `newsletter_descadastro_em` (a data do descadastro ou do bounce) em **todas** as linhas com esse e-mail, não só na mais recente. Pedidos de saída que chegaram por WhatsApp ou e-mail já foram marcados no dia (§5.2); confira que também saíram na ferramenta |
| 2. Gerar a lista | fórmula abaixo: `newsletter_optin = sim` **e** nenhuma linha do mesmo e-mail com `newsletter_descadastro_em` **e** `nao_contatar` diferente de `sim` **e** não é cliente ativo (etapa não começa com 7, 8 ou 9) **e** 60 dias ou mais desde `recebido_em` |
| 3. Importar e enviar | exporte a aba `Newsletter` e importe na ferramenta, com a opção de reinscrever desmarcada (Antes do 1º envio) |
| Conteúdo | 1 conteúdo (o último post do blog) + 1 case publicado, quando houver. Sem promoção e sem preço. As regras de copy do 12 §7 (checklist B302) valem |
| Links | `utm_source=newsletter&utm_medium=email&utm_campaign=newsletter-{aaaa-mm}`; o CTA é o diagnóstico gratuito em `https://lemamon.dev/diagnostico?utm_source=newsletter&utm_medium=email&utm_campaign=newsletter-{aaaa-mm}` |

**Fórmula da lista** (aba `Newsletter`, Google Sheets pt-BR; gere **depois** da sincronização de descadastros e importe na ferramenta antes de cada envio):

```
=ÚNICO(FILTER(Pedidos!email; Pedidos!newsletter_optin="sim"; Pedidos!nao_contatar<>"sim";
        CONT.SES(Pedidos!email;Pedidos!email;Pedidos!newsletter_descadastro_em;"<>")=0;
        ESQUERDA(Pedidos!etapa;1)<>"7"; ESQUERDA(Pedidos!etapa;1)<>"8"; ESQUERDA(Pedidos!etapa;1)<>"9";
        HOJE()-Pedidos!recebido_em>=60))
```

O `CONT.SES(...)=0` tira o e-mail se **qualquer** linha dele tem descadastro (o mesmo lead pode ter um pedido antigo com `newsletter_optin = sim` e um novo); o `ÚNICO` (UNIQUE) evita mandar duas vezes para quem tem duas linhas.

**Quem quer voltar depois de sair:** só com um opt-in novo, explícito, pedido pela pessoa. Registre o novo aceite (`newsletter_optin = sim`, `_em`, `_canal`, `_texto` novos), apague `newsletter_descadastro_em` das linhas dela (anote a data antiga em `observacoes`) e reinscreva pelo formulário de inscrição da ferramenta, nunca pela importação.

**Métricas** (registre uma linha por edição na aba `Newsletter`: `edicao,enviados,aberturas,cliques,descadastros,diagnosticos_reativados`):
- aberturas, cliques e descadastros: relatório da ferramenta;
- diagnósticos reativados: `=CONT.SES(utm_source;"newsletter";utm_campaign;"newsletter-aaaa-mm";diagnostico_em;"<>")` na aba `Pedidos`.

Critério de aceite: newsletter enviada todo mês, no dia fixo, só para a lista da fórmula gerada depois da sincronização de descadastros, com o teste de descadastro e reimportação feito antes do 1º envio.

**Sequência de topo de funil (B324):** depende de uma isca com captura de e-mail, que não existe no site (BLUEPRINT não prevê). Não se aplica até essa decisão (playbook 12 §8).

## 7. WhatsApp Business (B325)

Use o app WhatsApp Business **no mesmo número de `PUBLIC_WHATSAPP_NUMBER`**.

**Perfil comercial**

| Campo | Valor |
|---|---|
| Nome | Lemamon.dev |
| Categoria | a mais próxima de "desenvolvimento de software" na lista do app |
| Descrição | "Software sob medida em São Paulo, SP: sistemas web, aplicativos, integrações, MVPs e sustentação. Escopo, prazo e preço combinados antes de começar. Comece pelo diagnóstico gratuito de 45 minutos." |
| Endereço | São Paulo, SP (sem rua, se não há atendimento presencial; até 20/10/2026 era Florianópolis, SC: troque no app, D38) |
| Horário | [PREENCHER] (o mesmo da §1) |
| E-mail | o de `dados/dono.json › empresa.email` |
| Site | https://lemamon.dev |

O site manda visitantes de `/en/` e `/es/` para este mesmo número, com a mensagem pré-preenchida no idioma deles. A saudação e a ausência disparam antes de qualquer pessoa ler, então vão nos 3 idiomas numa mensagem só. Depois, responda no idioma de quem escreveu (§2).

**Mensagem de saudação** (primeiro contato do cliente):

> Oi! Aqui é a Lemamon.dev, de São Paulo. Conta em uma frase o que você precisa ou comece o pedido de diagnóstico gratuito: https://lemamon.dev/diagnostico?utm_source=whatsapp&utm_medium=saudacao
> Hi! This is Lemamon.dev, from São Paulo, Brazil. Tell us in one sentence what you need, or start the free assessment request: https://lemamon.dev/en/quote?utm_source=whatsapp&utm_medium=saudacao
> ¡Hola! Somos Lemamon.dev, de São Paulo, Brasil. Cuéntanos en una frase qué necesitas o empieza tu solicitud de diagnóstico gratuito: https://lemamon.dev/es/cotizacion?utm_source=whatsapp&utm_medium=saudacao

**Mensagem de ausência** (fora do horário; sem prazo numérico de resposta, BLUEPRINT §12):

> Oi! Agora estamos fora do horário de atendimento ({horário da §1}). A gente responde no próximo horário. Se quiser adiantar, comece o pedido de diagnóstico gratuito: https://lemamon.dev/diagnostico?utm_source=whatsapp&utm_medium=ausencia
> Hi! We're outside our business hours right now ({hours, in Brasília time}). We'll reply during our next business hours. To get a head start, begin the free assessment request: https://lemamon.dev/en/quote?utm_source=whatsapp&utm_medium=ausencia
> ¡Hola! Ahora estamos fuera del horario de atención ({horario, hora de Brasilia}). Te respondemos en el próximo horario. Si quieres adelantar, empieza tu solicitud de diagnóstico gratuito: https://lemamon.dev/es/cotizacion?utm_source=whatsapp&utm_medium=ausencia

(`/diagnostico` redireciona para `/orcamento` com a query; `/en/quote` e `/es/cotizacion` são o wizard em cada idioma. O wizard grava a UTM no pedido.)

**Respostas rápidas** (atalho `/`; se o app não aceitar hífen no atalho, use `/diagnosticoen` etc.). Os links levam `utm_source=whatsapp&utm_medium=resposta-rapida`.

| Atalho | Texto |
|---|---|
| `/diagnostico` | "O diagnóstico é gratuito, leva 45 minutos e você recebe uma devolutiva por escrito, sem compromisso de contratar. Quer marcar? Tenho {opção 1} ou {opção 2}." |
| `/diagnostico-en` | "The free assessment takes 45 minutes, and afterward you get written feedback, whether you hire us or not. Shall we schedule it? I have {option 1} or {option 2}." |
| `/diagnostico-es` | "El diagnóstico gratuito dura 45 minutos y después recibes nuestras conclusiones por escrito, contrates o no. ¿Lo agendamos? Tengo {opción 1} o {opción 2}." |
| `/descoberta` | "A Sprint de Descoberta é a etapa paga em que o problema vira escopo priorizado, protótipo e um plano com prazo e preço fechados para o desenvolvimento. O valor é combinado antes de começar: https://lemamon.dev/sprint-de-descoberta?utm_source=whatsapp&utm_medium=resposta-rapida" |
| `/descoberta-en` | "The Discovery Sprint is the paid step where the problem becomes a prioritized scope, a prototype and a plan with a fixed timeline and price for development. Its price is agreed before it starts: https://lemamon.dev/en/discovery-sprint?utm_source=whatsapp&utm_medium=resposta-rapida" |
| `/descoberta-es` | "El Sprint de Descubrimiento es la etapa con costo en la que el problema se convierte en un alcance priorizado, un prototipo y un plan con plazo y precio cerrados para el desarrollo. Su costo se acuerda antes de empezar: https://lemamon.dev/es/sprint-de-descubrimiento?utm_source=whatsapp&utm_medium=resposta-rapida" |
| `/preco` | "O preço fechado sai da Sprint de Descoberta, junto com o prazo, antes do desenvolvimento. No diagnóstico gratuito, a gente explica o que faz o preço de um caso como o seu subir ou descer: https://lemamon.dev/quanto-custa?utm_source=whatsapp&utm_medium=resposta-rapida" |
| `/preco-en` | "The fixed price comes out of the Discovery Sprint, together with the timeline, before development. In the free assessment, we explain what makes the price of a case like yours go up or down: https://lemamon.dev/en/pricing?utm_source=whatsapp&utm_medium=resposta-rapida" |
| `/preco-es` | "El precio cerrado sale del Sprint de Descubrimiento, junto con el plazo, antes del desarrollo. En el diagnóstico gratuito te explicamos qué hace subir o bajar el precio de un caso como el tuyo: https://lemamon.dev/es/cuanto-cuesta?utm_source=whatsapp&utm_medium=resposta-rapida" |
| `/prazo` | "O prazo também é fechado na Sprint de Descoberta, com o escopo e o preço. No desenvolvimento, você recebe software funcionando a cada 2 semanas." |
| `/prazo-en` | "The timeline is also set in the Discovery Sprint, together with the scope and the price. During development, you get working software every 2 weeks." |
| `/prazo-es` | "El plazo también se cierra en el Sprint de Descubrimiento, junto con el alcance y el precio. En el desarrollo, recibes software funcionando cada 2 semanas." |
| `/metodo` | "Primeiro a gente combina, depois a gente constrói: https://lemamon.dev/como-trabalhamos?utm_source=whatsapp&utm_medium=resposta-rapida" |
| `/dados` | "Usamos seus dados para responder ao seu pedido. Os detalhes estão na Política de Privacidade: https://lemamon.dev/privacidade" |
| `/nda` | só depois de ligar `confirmacoes.nda` (com o NDA e o documento de segurança prontos, 02 §11): "Se o seu projeto pede sigilo, a gente assina o acordo antes de você compartilhar os detalhes e também responde ao questionário de segurança da sua empresa." |
| `/agenda` | só depois de preencher `dados/dono.json › agenda.url` (00 §B6): "Se preferir, escolha o horário direto: {link}" |

**Etiquetas** = etapas do pipeline (playbook 05 §5): Novo · Contatado · Diagnóstico marcado · Devolutiva enviada · Proposta · Ganho · Perdido · Retomada · Não contatar.

**Regras:**
- Toda conversa que vira oportunidade entra no CRM com protocolo `WA-…` e canal `whatsapp` (B058: medir a proporção de leads por WhatsApp).
- Nada de lista de transmissão para quem não pediu.
- Ative a verificação em duas etapas do WhatsApp.
- Backups do WhatsApp (Google Drive ou iCloud) entram na rotina de exclusão da LGPD (playbook 10 §6).
- Catálogo, se usar: os serviços e as etapas, sem preço.

Critério de aceite: saudação e ausência ativas nos 3 idiomas; as respostas rápidas cadastradas (`/nda` e `/agenda` só quando liberadas); um teste a partir do botão de WhatsApp de `/en/` recebe a saudação com o link de `/en/quote`.
