# 01 — Diagnóstico gratuito de 45 minutos e devolutiva por escrito

**Backlog:** B358 (roteiro + modelo de devolutiva), B359 (limite semanal), B112 (operação do diagnóstico como CTA principal), B053 (parte operacional da agenda).
**Fontes:** BLUEPRINT §1.2, §6.2 (`stage_diagnosis`), §7.4, §7.8, §12; 07-negocios §7.4 e §7.6.2.

---

## 1. O que o site promete, e só isso

O site promete exatamente: **diagnóstico gratuito, 45 minutos, devolutiva por escrito, sem compromisso de contratar.** Depois do envio, "a gente fala com você para marcar o horário". Se fizer sentido seguir, o próximo passo é a **proposta da Sprint de Descoberta**. O cliente decide em dois pontos: depois da devolutiva e depois do plano da Descoberta.

O site **não** promete (BLUEPRINT §12): prazo de entrega da devolutiva, conteúdo da devolutiva, formato da conversa, preço ou prazo do desenvolvimento. Tudo o que este playbook define nesses pontos é **regra interna** até você confirmar e preencher `confirmacoes.devolutivaConteudo` e `confirmacoes.formatoDiagnostico` (ver [00-DADOS-DO-DONO.md](00-DADOS-DO-DONO.md) B5).

## 2. Papéis

| Papel | Quem | Backup |
|---|---|---|
| Conduz os 45 minutos e escreve a devolutiva | [PREENCHER] | [PREENCHER] |
| Marca o horário e manda convite e lembrete | [PREENCHER] | [PREENCHER] |
| Revisa a devolutiva antes do envio (opcional) | [PREENCHER] | — |

## 3. Antes da conversa

1. **Leia o pedido no CRM:** o campo `summary` (texto legível) e o `answers` (respostas). O dicionário dos ids está no playbook [03](03-qualificacao-e-score.md) §2.
2. **Monte a pauta a partir dos tópicos que o cliente já viu.** O resumo do wizard mostrou a ele "No diagnóstico, a gente vai aprofundar" com 2 a 4 tópicos. Use os mesmos, na mesma ordem (tabela da §4.2). O cliente chega esperando falar disso.
3. **Veja o papel na decisão (P6).** Se for `recommend_to_decider`, `researching` ou `not_defined`, peça no convite que a pessoa traga quem decide.
4. **Contexto da empresa, 10 minutos no máximo:** site e página da empresa. Pesquise o negócio, não a pessoa.
5. **Mande o convite** (modelo abaixo) com data, horário de início e fim, link ou endereço e a pauta.
6. **Lembrete na véspera** (modelo abaixo).

### Convite (WhatsApp ou e-mail)

> Oi, {primeiro nome}. Aqui é {seu nome}, da Lemamon.
> Ficou marcado o diagnóstico gratuito do pedido {protocolo}: {dia}, das {hora início} às {hora fim} ({formato e link}).
> A pauta sai do que você respondeu: {tópico 1}; {tópico 2}; {tópico 3}.
> Para aproveitar os 45 minutos, tenha à mão: quem decide com você (se puder, traga essa pessoa), exemplos de como o processo funciona hoje (planilhas, telas, mensagens), os sistemas que vocês já usam e como seria o "deu certo" para você.
> Depois da conversa, você recebe uma devolutiva por escrito.

EN (leads de `/en/`):

> Hi {first name}, this is {your name} from Lemamon. Your free assessment for request {protocol} is set for {day}, {start}–{end} ({format and link}). Agenda, based on your answers: {topic 1}; {topic 2}; {topic 3}. To make the most of the 45 minutes, have at hand: who decides with you (bring them if you can), examples of how the process works today, the systems you already use, and what "it worked" would look like for you. After the conversation, you'll get written feedback.

ES (leads de `/es/`, con "tú"):

> Hola, {nombre}. Soy {tu nombre}, de Lemamon. Quedó agendado el diagnóstico gratuito de tu solicitud {protocolo}: {día}, de {inicio} a {fin} ({formato y enlace}). La agenda sale de lo que respondiste: {tema 1}; {tema 2}; {tema 3}. Para aprovechar los 45 minutos, ten a mano: quién decide contigo (si puedes, invítalo), ejemplos de cómo funciona el proceso hoy, los sistemas que ya usan y cómo sería "salió bien" para ti. Después de la conversación, te enviamos nuestras conclusiones por escrito.

### Lembrete (véspera)

> Oi, {primeiro nome}. Lembrete do diagnóstico de amanhã, {hora início}–{hora fim}: {link}. Se precisar mudar o horário, me avisa por aqui.

## 4. Roteiro dos 45 minutos

**Regra de ouro:** é diagnóstico, não consultoria grátis. O objetivo é entender o problema o bastante para recomendar o próximo passo com honestidade. Termine no horário combinado.

### 4.1 Blocos

| Tempo | Bloco | Objetivo | Perguntas-guia |
|---|---|---|---|
| 0–3 | Abertura | Combinar o tempo e o que sai da conversa | "A gente termina às {hora}. Depois você recebe uma devolutiva por escrito." · "Quem mais participa da decisão?" |
| 3–15 | O problema hoje (necessidade) | Ouvir o processo real, na voz do cliente | "Me conta como isso funciona hoje, passo a passo." · "Onde dói mais?" · "O que acontece quando dá errado?" · "Quanto isso custa hoje: tempo, retrabalho, venda perdida?" |
| 15–23 | Quem usa e o que já foi tentado | Usuários, volume, sistemas, tentativas anteriores | "Quem usa isso no dia a dia, e quantas pessoas?" · "Que sistemas e planilhas entram nisso?" · "Vocês já tentaram resolver? Com software pronto, outro fornecedor? O que não funcionou?" |
| 23–31 | Como seria o "deu certo" (prazo) | Resultado esperado, prioridade e data real | "Daqui a seis meses, o que mudou para você dizer que deu certo?" · "O que precisa funcionar primeiro?" · "Existe uma data que trava isso? Qual e por quê?" |
| 31–37 | Decisão e investimento | Quem aprova, como, e se há verba prevista | "Como a decisão é tomada aí, e quem assina?" · "O investimento para isso já está previsto, em definição, ou ainda não?" (ver regra de valores abaixo) |
| 37–43 | Próximo passo | Explicar o caminho e os pontos de decisão | O que vem na devolutiva; o que é a Sprint de Descoberta (os 4 entregáveis: entendimento do problema, escopo priorizado, protótipo, plano com prazo e preço fechados) e que o valor dela é combinado antes; "Depois da devolutiva, você decide se quer fazer a Descoberta." |
| 43–45 | Fechamento | Confirmar envio e encerrar no horário | "Para quem eu mando a devolutiva, e por qual canal?" |

**Regra de valores:** com `confirmacoes.valoresNoDiagnostico = false` (padrão), você explica **o que faz o preço e o prazo subirem ou descerem** no caso dele (os fatores da página de serviço e de `/quanto-custa`) e **não dá número**. Só fale em ordem de grandeza se você ligar essa confirmação e aprovar o texto correspondente (i18n `quote._notes.pending_owner` 4).

### 4.2 Tópicos do wizard → perguntas de aprofundamento

| Tópico mostrado ao cliente (BLUEPRINT §7.4 c) | Quando aparece | Aprofunde com |
|---|---|---|
| `topic_live_system` — o que está no ar hoje e o que precisa de atenção primeiro | P1 = evoluir ou manter sistema no ar | Onde roda, quem desenvolveu, se há acesso ao código e à infraestrutura, o que quebra com mais frequência. **Não prometa assumir sistema de terceiros** sem `confirmacoes.sistemaTerceiros` |
| `topic_integration` — quais sistemas precisam conversar e o que cada um permite | P2 inclui integração | Nome de cada sistema, se tem "porta de conexão" (API) documentada, direção e frequência dos dados, o que fazer quando um lado falha |
| `topic_app` — quem vai usar o app e o que ele precisa resolver primeiro | P2 inclui aplicativo | Quem usa (cliente, equipe de campo), iPhone/Android, uso sem internet, publicação nas lojas ("pode fazer parte do escopo") |
| `topic_process` — como o processo funciona hoje, passo a passo | P2 inclui sistema para a operação ou portal para clientes | Peça para ver a planilha ou a tela; conte as etapas e quem faz cada uma |
| `topic_mvp` — o que a primeira versão precisa provar | P2 inclui MVP | Hipótese principal, usuário da primeira versão, o que fica para depois, data (captação, piloto, cliente-âncora) |
| `topic_automation` — quais tarefas se repetem e quanto tempo consomem | P2 inclui automação | Frequência, tempo gasto, regras, exceções |
| `topic_not_sure` — que tipo de software resolve o seu problema | P2 = ainda não sei | Comece pelo problema; ao final, diga com franqueza se um software pronto atende |
| `topic_deadline` — o que é essencial para a primeira entrega | prazo "o quanto antes" ou data informada | O que é inegociável para a data; o que pode esperar |
| `topic_budget` — como o preço se forma e o que faz ele variar | P5 = ainda não sei / ainda não pensei | Explique os fatores; pergunte como a empresa costuma aprovar investimentos |
| `topic_decider` — quem precisa participar da próxima conversa | P6 = recomendo / pesquisando / não definido | Quem decide, o que essa pessoa precisa ver para aprovar, se ela pode estar na próxima conversa |

### 4.3 O que não dizer na conversa (BLUEPRINT §12)

- Nenhum prazo de desenvolvimento, de MVP ou de duração da Descoberta sem confirmação.
- Nenhum preço de desenvolvimento. O valor da Descoberta é "combinado antes de começar".
- Nada de "assumimos sistemas de terceiros", "atendemos todo o Brasil" ou "você fala com quem escreve o código" sem a confirmação correspondente.
- Nada de nome de cliente sem autorização.

## 5. Anotações (vão para o CRM)

Copie este bloco no registro do lead (playbook [05](05-crm-e-funil.md)):

```
Diagnóstico — {protocolo} — {data} — conduzido por {nome}
Participantes / quem decide:
Problema (palavras do cliente):
Como é hoje (passos, sistemas, planilhas):
Custo do problema hoje:
Tentativas anteriores:
Usuários e volume:
"Deu certo" =
Data que trava / prazo do cliente:
Investimento: previsto | em definição | não pensado | prefere não dizer
Riscos / pontos de atenção:
Recomendação: Descoberta | proposta direta (só com semDescoberta) | pacote {nome} (só com D03 = sim, escopo inteiro dentro de um pacote do 02 §5 e valor abaixo do teto D04) | software pronto | fora de perfil | sustentação após avaliação
Score revisado (A/B/C/D) e motivo:
Próximo passo + data:
Frases que podem virar depoimento (só com autorização futura):
```

## 6. Modelo da devolutiva por escrito (1 página)

**Prazo interno de envio:** [PREENCHER] (07-negocios sugere até 2 dias úteis). É meta interna: o site não publica prazo.
**Formato:** documento de 1 página (PDF ou texto no corpo do e-mail), no idioma do cliente.

```
DEVOLUTIVA DO DIAGNÓSTICO
{Empresa} · Pedido {protocolo} · Conversa em {data} com {participantes}

1. O que a gente entendeu
{3 a 5 linhas, nas palavras do cliente: o problema, para quem, o que custa hoje.}

2. Como funciona hoje
- {passo ou sistema}
- {onde dói}

3. O que pesa no seu caso
- {fator 1, no mesmo vocabulário das páginas de serviço: ex. quantos processos e tipos de usuário entram na primeira versão}
- {fator 2}
- {fator 3, no máximo}

4. Pontos de atenção
- {o que precisa ser resolvido antes de construir, até 3}

5. O caminho que a gente recomenda
{Uma recomendação só, com o motivo em 2 linhas. Opções honestas:
 - Sprint de Descoberta (padrão para construir algo novo);
 - proposta direta de desenvolvimento, se o escopo já basta (só com confirmacoes.semDescoberta);
 - pacote {nome}, se o escopo cabe inteiro num pacote da tabela interna (só com D03 = sim,
   escopo inteiro dentro de um pacote do 02 §5 e valor abaixo do teto D04);
 - um software pronto, se ele atende (diga qual tipo e por quê);
 - avaliação do sistema atual antes da sustentação;
 - não é o nosso tipo de projeto, com uma alternativa quando houver.}

6. Próximo passo
Se fizer sentido seguir, a proposta da Sprint de Descoberta vai junto com esta devolutiva.
Ela entrega: entendimento do problema, escopo priorizado, protótipo e um plano com prazo e
preço fechados para o desenvolvimento. O valor é combinado antes de começar.
Mais detalhes: https://lemamon.dev/sprint-de-descoberta
Você decide se segue.

{Se a recomendação for um pacote (só com D03 = sim), troque o parágrafo acima por:
 A proposta do pacote {nome}, com o que inclui, o que não inclui, prazo e preço, vai junto
 com esta devolutiva. Você decide se segue.
 A proposta segue o modelo do 02 §8 sem a referência à Descoberta.}

{Bloco opcional, SÓ se você ligou confirmacoes.valoresNoDiagnostico e preencheu precos.ts:
 Referência de investimento: {faixas de precos.ts, lado a lado, nunca somadas}. Referência, não proposta.}

Esta devolutiva é sua. Pode repassar a quem decide com você.
{seu nome} · Lemamon · São Paulo, SP · {e-mail} · WhatsApp
```

**Regras de escrita:** "a gente" e "você"; frases curtas; jargão só com explicação ("API, a porta de conexão de um sistema"); nenhum superlativo; nenhum prazo ou preço de desenvolvimento; recomendar software pronto quando ele atende é parte do método.

**Cabeçalhos em outros idiomas:** EN "Written feedback" · "What we understood" · "How it works today" · "What weighs on your case" · "Points of attention" · "What we recommend" · "Next step". ES (con "tú") "Conclusiones por escrito" · "Lo que entendimos" · "Cómo funciona hoy" · "Qué pesa en tu caso" · "Puntos de atención" · "El camino que recomendamos" · "Próximo paso". Evite "devolución" (em espanhol, significa reembolso).

**Depois de usar o modelo em pelo menos um diagnóstico real** (critério de aceite do B358), descreva em uma frase o que a devolutiva entrega e preencha `confirmacoes.devolutivaConteudo` com um grupo nominal que encaixe em "…com {conteudo}" (ver 00 §B5). Só descreva os blocos que você entrega de fato.

### Envio da devolutiva

> Oi, {primeiro nome}. Segue a devolutiva do nosso diagnóstico ({protocolo}). Junto vai a proposta da Sprint de Descoberta, se fizer sentido seguir. Posso te apresentar a proposta em uma conversa curta? Tenho {opção 1} ou {opção 2}.

Se a recomendação for um pacote (só com D03 = sim), troque "a proposta da Sprint de Descoberta" por "a proposta do pacote {nome}".

(A proposta é sempre apresentada ao vivo: playbook [02](02-proposta-e-politica-comercial.md) §9.)

## 7. Agenda e limite semanal de diagnósticos (B359, B053)

1. **Defina o limite:** no máximo [PREENCHER] diagnósticos por semana, sem prejudicar entregas em andamento.
2. **Escolha a ferramenta de agenda** (Google Agenda com página de agendamento, Cal.com, Calendly ou similar) e configure:
   - horários fixos por semana que somam o limite; intervalo de [PREENCHER] minutos entre conversas; antecedência mínima de [PREENCHER] horas;
   - fuso `America/Sao_Paulo`;
   - duração de 45 minutos e link de vídeo gerado automaticamente (se o formato for vídeo);
   - só nome e e-mail como campos obrigatórios (minimização de dados);
   - lembrete automático, se a ferramenta tiver.
3. **Antes de publicar o link no site:** a ferramenta é operador novo de dados pessoais, então a Política precisa citá-la: preencha `dados/dono.json › privacidade.ferramentas.agenda` (fornecedor e prazo de retenção nos 3 idiomas) no mesmo deploy da URL; sem isso, o build de produção falha (00 §B6; playbook [10](10-lgpd-operacional.md) §3). Link externo, nunca embed.
4. **Preencha `dados/dono.json › agenda.url`** com a URL https (00 §B6). Nunca edite o código em `src/config/` (ele só lê o JSON). Isso muda o pós-envio e libera o rótulo "Agendar".
5. **Quando o limite estoura:** ofereça o próximo horário livre e registre a espera no CRM. **Não cobre pelo diagnóstico:** o site promete "gratuito" (07-negocios §7.4 sugere cobrança simbólica acima do limite; isso contradiz o BLUEPRINT e exigiria mudar o método e o copy). Uma linha de escassez no site só com confirmação sua e texto aprovado (i18n `_notes.pending_owner` 7).

## 8. Quando a conversa não acontece

- **Não compareceu:** no mesmo dia, "Oi, {nome}. Senti sua falta às {hora}. Quer marcar outro horário? Tenho {opção 1} ou {opção 2}."
- **Segundo não comparecimento:** o lead vai para a cadência de retomada (playbook [04](04-sla-follow-up-e-nutricao.md) §3) com status "Diagnóstico não realizado".

## 9. Indicadores deste playbook

| Indicador | Fórmula | Fonte | Meta |
|---|---|---|---|
| Comparecimento | diagnósticos feitos ÷ marcados | CRM | [PREENCHER] |
| Devolutiva no prazo interno | devolutivas no prazo ÷ devolutivas enviadas | CRM | 100% |
| Diagnóstico → proposta | propostas enviadas ÷ diagnósticos feitos | CRM | [PREENCHER] (07 §7.9.1 cita 70% como estimativa de mercado) |
| Tempo do pedido ao diagnóstico | mediana em dias úteis | CRM | [PREENCHER] |
