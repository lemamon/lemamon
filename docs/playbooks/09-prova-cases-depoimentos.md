# 09 — Produção de prova: cases, depoimentos, logos e autorização de uso

**Backlog:** B032 (produzir 2 a 3 cases reais com autorização), B035 (depoimentos nominais autorizados), B285 (cláusula de portfólio no contrato), B372 (pedir depoimento no go-live, com gatilho no CRM e `depoimento_status` próprio), B303 (conferir o gatilho de nicho a cada case), B219 (diagramas de arquitetura com as cores dos tokens), B378 (case anonimizado por setor e porte), B287 (depoimento em vídeo: produção e publicação por `dados/dono.json`, §12), B034 (parcial: logos com autorização), B068 (parcial: imagens reais de projeto).
**Fontes:** BLUEPRINT §2.5, §4, §6.10, §12; 05-conteudo §5; `src/content.config.ts` (schemas); i18n `_notes.proof`.

---

## 1. Regras que não mudam

1. **Nada inventado.** Nenhum cliente, logo, número ou citação sem fonte real. O exemplo de 05-conteudo §5.3 ("Transportadora de médio porte — SC") **nunca** é publicado.
2. **Toda prova tem autorização por escrito**, inclusive o case anonimizado. O schema exige `autorizacao` com `porEscrito: true`, `autorizadoPor`, `data` e `registro` (e, no case, o `escopo` do que foi autorizado): sem ela, a entrada não valida e o build quebra. A autorização nunca é publicada; fica no repositório para auditoria.
3. **Depoimento é sempre nominal** (nome completo, cargo, empresa). Anônimo não existe no site.
4. **Resultado numérico é opcional.** O case faz sentido sem ele. Número só com fonte e autorização.
5. **Três idiomas.** Um case só conta quando existe e está publicado em pt, en e es. `hasCases` exige 2 assim.
6. **Limiares:** cases ≥ 2, logos de ≥ 4 empresas diferentes, depoimentos ≥ 1, time ≥ 1. Abaixo disso, a seção não existe.

## 2. O caminho de uma prova

```
contrato com cláusula de portfólio (§3)
  → go-live: checklist de prova (§4)
  → pedido de autorização (§5) + termo assinado (§6)
  → entrevista de 30–40 min (§7)
  → redação no formato do schema (§8)
  → aprovação escrita do texto e dos números pelo cliente
  → tradução en/es
  → arquivos no repositório (formato no playbook 00 §B9)
  → deploy preview → publicação
  → conferir o gatilho de nicho (13 §8): contar os cases publicados com o mesmo `setor`;
    se este for o 3º, abrir a revisão de headline, pauta e palavras-chave
    (mudança de posicionamento passa pelo BLUEPRINT)
```

Lead time típico: [PREENCHER] semanas. É o item de maior lead time do BLUEPRINT (§14 item 11): comece no primeiro projeto entregue.

## 3. Cláusula de portfólio no contrato (B285)

Texto-base para o advogado ajustar e incluir no contrato padrão:

> **Uso em portfólio.** O CONTRATANTE autoriza a LEMAMON a citar o nome e a marca do CONTRATANTE e a descrever, em linhas gerais, o projeto objeto deste contrato em seu site, propostas comerciais e perfis profissionais, sem divulgar informação confidencial. A publicação de depoimento, de imagens do sistema e de resultados numéricos depende de aprovação prévia e por escrito do CONTRATANTE para cada material. O CONTRATANTE pode, a qualquer tempo e por escrito, pedir que a citação seja anonimizada (setor e porte) ou retirada, e a LEMAMON fará a alteração em até [PREENCHER] dias úteis.

Critério de aceite: o contrato padrão vigente tem a cláusula, e os contratos novos são assinados com ela. A cláusula **não substitui** o termo da §6 para depoimento, imagem e números.

## 4. Checklist de prova no go-live (B372)

**Gatilho:** quando a linha do projeto no CRM recebe `go_live_em` (playbook [05](05-crm-e-funil.md) §5; o go-live em si está no playbook [16](16-processo-de-entrega.md) §5). Nesse momento, `status_prova` começa em `nao_pedida` e `depoimento_status` em `nao_pedido`; a linha fica vermelha até o pedido sair e volta a ficar vermelha se o depoimento seguir sem resposta depois do `prazo_depoimento_dias` (aba `Config` do 05). No mesmo dia do go-live de todo projeto:

- [ ] Registrar as métricas de "antes" levantadas no diagnóstico ou na Descoberta (quando houve) e combinar quando medir o "depois" (data: [PREENCHER]).
- [ ] Capturar telas reais do sistema funcionando (sem dados pessoais; ver §9).
- [ ] Pedir o depoimento enquanto a satisfação está no pico: a entrevista (§5 e §7) ou, se o cliente não tem 30 minutos, o pedido curto por escrito (§5.1). No CRM: `depoimento_status = pedido` no dia do pedido; depois `autorizado` (com `depoimento_autorizado_em`) ou `recusado`. **`autorizado`** só com o termo assinado com "Depoimento escrito" marcado (§6), o texto aprovado por escrito e nome completo, cargo e empresa: é o depoimento que entra em `dados/dono.json › depoimentos` (§11).
- [ ] Pedir a autorização de logo.
- [ ] Pedir a autorização dos números (opção "Resultados numéricos" do termo, §6).
- [ ] Perguntar se aceita gravar um vídeo curto (§12; só com "Vídeo e voz do depoente" marcado no termo).
- [ ] Perguntar se aceita avaliação no Perfil da Empresa no Google e, depois, no Clutch (playbook 08).
- [ ] Atualizar `status_prova` no CRM (a prova do projeto em geral: case, logo, números): `pedida` no dia do pedido; depois `autorizada`, `recusada` ou `anonimizada`.

**`status_prova` não mede depoimento.** `anonimizada` é a opção "Publicação SEM o nome da empresa" do termo: serve para case anonimizado (§10), nunca para depoimento, que é sempre nominal (§1, regra 3). Logo autorizado sem depoimento também não conta. O depoimento só conta com `depoimento_status = autorizado`.

Meta: 1 depoimento autorizado por projeto entregue (100% dos projetos com `go_live_em`). O ritual mensal (13 §6) confere os projetos com `go_live_em` e `status_prova = nao_pedida` ou `depoimento_status` em `nao_pedido`/`pedido` depois do prazo, e os indicadores da §15 saem de `go_live_em` e `depoimento_status`.

## 5. Pedido de autorização (mensagem)

> Oi, {nome}. Que bom ver o {sistema} no ar. Quero te pedir uma coisa: a gente gostaria de contar este projeto no site da Lemamon.dev, do jeito que vocês aprovarem. Pode ser com o nome da {empresa} ou sem nome (só setor e porte). Se topar, são 30 minutos de conversa para eu entender o antes e o depois, e eu te mando o texto para aprovar antes de qualquer publicação. Nada vai ao ar sem o seu ok por escrito.

## 5.1 Pedido curto por escrito (quando o cliente não tem 30 minutos)

> Oi, {nome}. Que bom ver o {sistema} no ar. Se você topar, eu gostaria de contar este projeto no site da Lemamon.dev. Para não tomar o seu tempo com uma conversa, são 3 perguntas, e pode responder por aqui mesmo, do jeito que sair:
> 1. Como era antes do sistema?
> 2. O que mudou depois que ele entrou no ar? Dá para medir?
> 3. O que você diria a um colega que está pensando em contratar a gente?
> Com as respostas, eu escrevo um texto curto e te mando para aprovar. Nada vai ao ar sem o seu ok por escrito, e você pode pedir para publicar sem o nome da {empresa}.

A resposta é matéria-prima, não depoimento pronto: o texto final passa pela aprovação escrita do cliente (§11) e pelo termo assinado (§6) antes de qualquer publicação. Número citado na resposta 2 só entra com a fonte e com "Resultados numéricos" marcado no termo.

## 6. Termo de autorização de uso de nome, marca, depoimento e imagem (modelo)

> Revisar com advogado antes do primeiro uso. Um termo por projeto; a pessoa do depoimento assina a parte dela.

```
TERMO DE AUTORIZAÇÃO DE USO

AUTORIZANTE (empresa): {razão social}, CNPJ {cnpj}, representada por {nome}, {cargo}.
DEPOENTE (pessoa, se houver depoimento): {nome completo}, {cargo}.
AUTORIZADA: {Lemamon.dev LTDA, na grafia do cartão CNPJ}, CNPJ 69.700.690/0001-98.

1. O que está autorizado (marque):
   [ ] Nome da empresa                     [ ] Logo da empresa
   [ ] Descrição do projeto (texto aprovado em anexo)
   [ ] Resultados numéricos (anexo, com a fonte de cada número)
   [ ] Prazo e preço do plano, descritos sem valores em dinheiro
   [ ] Imagens do sistema (anexo, já sem dados pessoais)
   [ ] Depoimento escrito (texto aprovado em anexo) com nome completo, cargo e empresa
   [ ] Foto do depoente                    [ ] Vídeo e voz do depoente
   [ ] Publicação SEM o nome da empresa, apenas como: "{setor}, {porte}, {UF}"

2. Onde pode ser usado:
   [ ] Site lemamon.dev, em português, inglês e espanhol (com tradução fiel do texto aprovado)
   [ ] Propostas e apresentações comerciais da Lemamon.dev
   [ ] Perfis da Lemamon.dev e de seus sócios em redes profissionais
   [ ] Diretórios de avaliação de fornecedores (ex.: Clutch)

3. Condições:
   a) Uso gratuito, sem contrapartida.
   b) Vale por prazo indeterminado e pode ser revogado a qualquer tempo, por escrito, pelo
      e-mail {e-mail da Lemamon.dev}. Após a revogação, a Lemamon.dev retira o material do site e dos
      perfis em até {N} dias úteis. Materiais já enviados a terceiros antes da revogação não
      são recolhidos.
   c) Nenhuma alteração de sentido no texto aprovado. Mudanças de redação exigem nova aprovação.
   d) Dados pessoais do depoente (nome, cargo, foto, voz) são tratados só para esta finalidade,
      com base no consentimento dado neste termo (LGPD, art. 7º, I), que pode ser revogado
      como em (b).

Local e data: {cidade}, {data}
Assinatura do representante da empresa: ____________
Assinatura do depoente: ____________
```

**Arquivo:** guarde o PDF assinado em [PREENCHER: pasta]. No conteúdo do site, o termo vira o bloco `autorizacao` (formato no playbook 00 §B9):

| Campo | O que vai |
|---|---|
| `porEscrito` | `true` (só existe com o termo assinado) |
| `autorizadoPor` | cargo e empresa de quem assinou (o nome fica no documento, não no repositório) |
| `data` | data da assinatura |
| `registro` | onde está o termo (ex.: "termo assinado arquivado em Autorizações/2026/{arquivo}") |
| `escopo.nomeDoCliente` (case) | `true` só se a opção "Nome da empresa" foi marcada |
| `escopo.resultados` (case) | `true` só se "Resultados numéricos" foi marcada |
| `escopo.prazoEPreco` (case) | `true` só se o cliente autorizou citar prazo e preço do plano (sem valor em dinheiro) |
| `foto` (depoimento) | `true` só se "Foto do depoente" foi marcada |

O build recusa `cliente`, `resultado`, `combinado.prazoEPreco` ou `foto` sem a autorização correspondente.

## 7. Roteiro da entrevista de case (30–40 min)

Grave só com permissão explícita no início ("Posso gravar para não perder nenhuma palavra? A gravação é só para eu escrever o texto"). As respostas viram os campos do schema.

| Bloco | Perguntas | Campo do case |
|---|---|---|
| Antes (8 min) | "Como era antes do sistema?" · "O que dava errado, e com que frequência?" · "Quanto isso custava (tempo, dinheiro, venda perdida)?" | `problema` |
| A decisão (5 min) | "Por que vocês decidiram resolver agora?" · "O que pesou para escolher este caminho?" | contexto do `problema` |
| O combinado (7 min) | "O que entrou primeiro e o que ficou para depois?" · "O prazo e o preço foram os combinados?" (só publique prazo e preço do plano com autorização, sem valor em dinheiro) | `combinado.escopo`, `combinado.foraDoEscopo`, `combinado.prazoEPreco` |
| A entrega (7 min) | "O que o sistema faz hoje, na prática?" · "Como foi receber software funcionando a cada 2 semanas?" | `entregue`, corpo do MDX e `comoFoi` (quando cada etapa aconteceu) |
| Depois (8 min) | "O que mudou?" · "Dá para medir? De quanto para quanto? Onde está esse número?" | `resultado` (antes → depois e a fonte de cada número, até 3) |
| Depoimento (5 min) | "Se um colega perguntasse se vale contratar a Lemamon.dev, o que você diria?" · "Como foi o processo, comparado ao que você esperava?" | `citacao` (prefira falas sobre previsibilidade: `sobreProcesso: true`) |

## 8. Redação

**Mapa para o schema** (formato completo no playbook 00 §B9):

| Campo | Como escrever |
|---|---|
| `titulo` (H1) | orientado ao problema resolvido, não à tecnologia |
| `tipoDeSistema` | ex. de forma: "Sistema de gestão de pedidos" (entra no title da página) |
| `cliente` | só com autorização de nome; senão, apague o campo |
| `setor`, `porte` | setor sempre, com **rótulo padronizado**: cases do mesmo setor usam exatamente o mesmo texto em `setor` (ex. de forma: "Logística", nunca "Logística" num e "Transporte e logística" noutro), para a contagem do gatilho de nicho (13 §8) funcionar; mantenha a lista de rótulos usados numa linha da aba `Config` da planilha. Porte obrigatório quando não há `cliente`; porte em palavras ("médio porte"), não em número de funcionários sem autorização |
| `servicos` | as tags dos serviços: alimentam "Projetos de {serviço}" na página do serviço |
| `periodo` | quando o projeto aconteceu (ex. de forma: "mar–jul/2026") |
| `comoFoi` | a linha do tempo real: uma entrada por etapa do método que o projeto teve (diagnóstico, Descoberta, desenvolvimento, sustentação), em ordem, com quando e o que aconteceu |
| `problema` | 2–3 frases na linguagem do cliente |
| `combinado.escopo`, `combinado.foraDoEscopo` | o escopo priorizado e o que ficou de fora |
| `combinado.prazoEPreco` | prazo e preço do plano, **sem valor em dinheiro**, só com `escopo.prazoEPreco` autorizado |
| `entregue` | resumo em português de negócio (card e abertura da seção); o detalhe vai no corpo do MDX; a tecnologia vai na ficha técnica |
| `resultado` | até 3 métricas com antes, depois e `fonte` (a fonte não é publicada); só com `escopo.resultados` autorizado |
| `fichaTecnica.stack` | a stack real do projeto (o avaliador técnico procura isto) |
| `fichaTecnica.link` | o produto no ar, só se for público e autorizado |
| `capa`, `imagens` | telas reais (§9), com `alt` descritivo em cada idioma; `legenda` opcional; até 12 imagens |
| `relacionados` | até 2 slugs de cases parecidos (sem isso, o site usa os do mesmo serviço) |

**Regras de texto:** as do BLUEPRINT §12 e do guia de tom (05 §8): "a gente" e "você", frases curtas, nada de "solução", "inovação", superlativo ou advérbio de reforço. O cliente aprova **por escrito** o texto final e cada número antes da tradução.

**Tradução:** en e es com o mesmo sentido (es com "tú"). Informe o cliente de que o texto aprovado será publicado também em inglês e espanhol (já previsto no termo).

## 9. Imagens reais (B068, parcial)

- Só telas e artefatos reais, com autorização (item do termo).
- Antes de capturar: use dados fictícios ou borre nomes, e-mails, telefones, valores e qualquer dado de clientes do cliente.
- Formato: PNG ou JPG em boa resolução; o Astro otimiza. Guarde em `src/content/cases/_imagens/<slug>/`.
- Sem imagem real, sem imagem: o site não usa foto de banco nem ilustração genérica (BLUEPRINT §6.1).

### Diagramas de arquitetura (B219)

Um diagrama da arquitetura de um projeto entregue é prova técnica para o avaliador do comprador. Ele entra no case como uma imagem de `imagens[]` (até 12, com `alt` e `legenda` por idioma; o schema aceita SVG).

1. **Só arquitetura real** de projeto entregue, com autorização por escrito (item "Imagens do sistema" do termo, §6). Em case anonimizado (§10), anonimize também os nomes de sistemas, empresas e domínios no diagrama.
2. **Formato:** SVG com `viewBox` e sem `width`/`height` fixos, ou PNG 2x exportado desse SVG.
3. **Só estas cores** (as mesmas dos tokens de `src/styles/tokens.css`; uma imagem em `<img>` não lê as variáveis CSS, por isso o valor vai escrito):

   | Uso | Cor | Token |
   |---|---|---|
   | traço de linhas e setas, 1,5 px | `#9aa4bb` | `--color-border-strong` |
   | fundo dos nós | `#ffffff` | `--color-bg-surface` |
   | borda dos nós | `#cbd2e0` | `--color-border-default` |
   | fluxo em destaque (o caminho principal) | `#f59e0b` | `--color-accent` |
   | texto | `#111845` | `--color-text-primary` |

   Nenhum gradiente, sombra ou outra cor. O diagrama tem fundo próprio `#ffffff`: no tema escuro do site ele aparece como um cartão claro, e isso é esperado.
4. **Texto convertido em contorno** (`<path>`), sem `<text>`: dentro de `<img>`, a fonte Motiva Sans não carrega (mesmo motivo do B198). No editor, use "converter texto em contornos" antes de exportar.
5. Salve em `src/content/cases/_imagens/<slug>/` e referencie em `imagens[]` do MDX, com `alt` descritivo nos 3 idiomas (o que o diagrama mostra, em palavras) e `legenda`.

Conferência antes de publicar: §14.

## 10. Case anonimizado (B378)

Quando o cliente autoriza contar o projeto, mas não o nome:

- `cliente` fica fora; o card usa `setor` + `porte` (+ UF no texto, se autorizado).
- Sem logo, sem nome de pessoa, sem link do produto.
- **Ainda exige termo assinado** (opção "Publicação sem o nome" na §6).
- Confira se setor + porte + UF não identificam a empresa num mercado pequeno; se identificarem, generalize (ex.: só a região).
- Números: os mesmos critérios de fonte e autorização.

Critério de aceite: pelo menos 2 provas concretas na Home, sem nome, logo ou número inventado, com a confirmação escrita de que cada número é real e publicável anonimizado.

## 11. Depoimentos (B035)

1. Monte o texto **a partir das falas da entrevista** (§7), em 2–3 linhas.
2. Mande para a pessoa: "Escrevi a partir do que você disse. Pode mudar o que quiser; só publicamos a versão que você aprovar."
3. Com o "aprovado" por escrito e o termo assinado, acrescente o depoimento em `dados/dono.json › depoimentos` (formato no 00 §B9) e marque no CRM `depoimento_status = autorizado` e `depoimento_autorizado_em` (05 §5).
4. Foto só com a autorização de imagem (`autorizacao.foto: true`); sem foto, o depoimento continua válido. O nome precisa ser completo (nome e sobrenome, sem abreviar): o build recusa "Cliente", "CEO" ou "Diretor" no lugar do nome.
5. `sobreProcesso: true` quando a fala é sobre previsibilidade ou processo: esse vai logo depois do método na Home.

## 12. Depoimento em vídeo de 60 segundos (B287)

- Pré-requisitos: o primeiro case autorizado e a opção "vídeo e voz" marcada no termo.
- Grave a conversa (com permissão explícita), edite para 60 segundos e legende em português (en/es se for usar nos outros idiomas).
- Exporte em **mp4** (ou webm), com no máximo **90 s** (o build recusa acima disso), e as legendas em **WebVTT** (`.vtt`): a de português é obrigatória. Separe um quadro do vídeo como pôster (jpg ou png).
- Para publicar, preencha `dados/dono.json › depoimentos[].video` (formato e regras no 00 §B9) e marque `autorizacao.video: true` só com o termo assinado com "vídeo e voz". Os arquivos ficam em `dados/` (ex.: `dados/videos/`). O site carrega sob demanda, sem player de terceiros: a página baixa só o pôster, e o vídeo vem quando a pessoa aperta o play. Não é preciso pedir código a nenhum agente.
- Não suba o vídeo no YouTube ou no Vimeo para incorporar no site: um player de terceiros é operador novo na Política e coloca cookies sem consentimento.

## 13. Logos (B034, parcial)

- Só com autorização escrita da empresa (item "logo" do termo).
- **A faixa só aparece com logos de 4 empresas diferentes ou mais.** Não publique 1 a 3 esperando completar: eles não aparecem.
- Arquivo: SVG monocromático de preferência, respeitando o manual de marca do cliente.
- Formato do YAML no 00 §B9. `caseSlug` liga o logo ao case.

## 14. Antes de publicar

- [ ] Termo assinado e arquivado; `autorizacao` preenchida com `porEscrito: true` e o `escopo` igual às opções marcadas no termo.
- [ ] Texto e números aprovados por escrito pelo cliente.
- [ ] Case nos 3 idiomas, mesmo slug, `publicado: true` nos 3.
- [ ] `grep -rn "PREENCHER" src/content` vazio.
- [ ] Diagramas (§9): `grep -c "<text" arquivo.svg` dá `0`, e `grep -oiE '(fill|stroke)="#[0-9a-f]{3,6}"' arquivo.svg | sort -u` só mostra `#9aa4bb`, `#ffffff`, `#cbd2e0`, `#f59e0b` e `#111845` (ou `none`).
- [ ] `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn build` e `yarn test` passam.
- [ ] No deploy preview: o case aparece em `/cases/<slug>`, `/en/cases/<slug>` e `/es/casos/<slug>`; `/cases` só aparece com 2 ou mais.
- [ ] Pedir indexação da página nova no Search Console (playbook 08 §1).

## 15. Indicadores

| Indicador | Meta |
|---|---|
| Projetos entregues com pedido de depoimento feito | 100%: a soma de `CONT.SES(go_live_em;">="&início;go_live_em;"<"&fim;depoimento_status;"pedido")` com a mesma fórmula para `"autorizado"` e `"recusado"`, dividida por `CONT.SES(go_live_em;">="&início;go_live_em;"<"&fim)` (célula vazia não conta como pedido) |
| Depoimentos autorizados por projeto entregue | 100% (um por projeto): `=CONT.SES(go_live_em;">="&início;go_live_em;"<"&fim;depoimento_status;"autorizado") / CONT.SES(go_live_em;">="&início;go_live_em;"<"&fim)`. Só `autorizado` conta: case publicado sem o nome e logo sem depoimento ficam fora. A autorização pode chegar depois do mês do go-live: recalcule os meses anteriores no ritual mensal. Os depoimentos em si estão em `dados/dono.json › depoimentos` |
| Cases publicados nos 3 idiomas | 2 até [PREENCHER data]; 3 até [PREENCHER data] |
| Logos autorizados | 4 até [PREENCHER data] |

`início` e `fim` são o primeiro dia do período (mês ou trimestre) e o primeiro dia do período seguinte; os nomes de coluna são os intervalos nomeados da aba `Pedidos` (05 §8).
