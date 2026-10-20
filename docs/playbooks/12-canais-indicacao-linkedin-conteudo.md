# 12 — Canais: indicação, parcerias, comunidade, LinkedIn e conteúdo

**Backlog:** B312 (indicação 1:1), B313 (parcerias de canal), B318 (comunidade), B316 (marketplaces), B315 (LinkedIn dos sócios), B054 (critério de volta do blog), B055 (pauta de decisão de compra), B110 (parcial: pauta e processo; os textos não foram escritos), B298 (autor real), B300 (cadência), B302 (checklist de tom e teste da negação), B299 (Medium com canonical), B301 e B311 (iscas: decisão de não fazer agora), B319 (canais fora por enquanto).
**Fontes:** BLUEPRINT §6.12, §7.1 (parâmetros de atribuição), §12; 05-conteudo §6 e §8; 06-marketing §6.4.

---

## 1. Ordem dos canais

| Prioridade | Canal | Papel | Playbook |
|---|---|---|---|
| 1 | Indicação e parcerias | motor de receita no início | §2 e §3 |
| 2 | Google Ads (Pesquisa) | demanda de quem já está procurando | 07 |
| 3 | LinkedIn pessoal dos sócios | autoridade e prospecção leve | §6 |
| 4 | SEO e conteúdo | ativo de longo prazo | 08 e §7 |
| 5 | Perfil da Empresa no Google | busca local | 08 §3 |
| oportunista | marketplaces, Clutch, comunidade | caixa, prova, rede | §4, §5, 08 §4 |
| fora por enquanto | LinkedIn Ads, GetNinjas, pixels de redes sociais | — | §9 e [15](15-registro-de-decisoes.md) |

**Atribuição em todo link:** use UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`); o wizard grava tudo no pedido. **Nunca use `?ref=`** para indicação ou parceiro: `ref` é reservado ao slug do case e pré-marca a P2 do wizard (BLUEPRINT §7.1). **Nunca ponha nome ou e-mail de pessoa em URL**: use um código.

URL curta para mensagens: `https://lemamon.dev/diagnostico?...` (301 para `/orcamento` levando a query).

## 2. Indicação 1:1 (B312)

1. Liste 30 a 50 contatos: ex-colegas, ex-clientes, fornecedores, donos de empresa conhecidos, contadores. Planilha, aba `Indicação`:

```
codigo,nome,relacao,canal,contatado_em,resposta,indicacoes_recebidas,observacoes
```

   `codigo` é um código curto, sem dado pessoal, sempre do mesmo tamanho: `i001`, `i002`… (é ele que vai no link, nunca o nome).

2. Mande mensagem **individual** (nada de lista de transmissão). Modelo:

> Oi, {nome}! Tudo bem? Estou à frente da Lemamon: a gente desenvolve software sob medida aqui em São Paulo, com escopo, prazo e preço combinados antes de começar. Tudo começa por um diagnóstico gratuito de 45 minutos. Se você souber de alguém com a operação presa em planilha, com sistemas que não conversam ou com uma ideia de produto para tirar do papel, eu agradeço a indicação. O link para a pessoa começar é este: https://lemamon.dev/diagnostico?utm_source=indicacao&utm_medium=whatsapp&utm_campaign=indicacao-{aaaa-mm}&utm_content={codigo}

   Se for verdade, acrescente a capacidade: "Temos espaço para um projeto novo em {período}."
3. Um único lembrete depois de 2 semanas, se não houver resposta. Agradeça toda indicação, vire ela projeto ou não.
4. Meça no CRM: `utm_source = indicacao` e `utm_content` = código do contato (colunas da aba `Pedidos`, 05 §5). Quem chega por mensagem direta, sem passar pelo link, ganha protocolo `IND-AAAAMMDD-NN` e o código de quem indicou em `observacoes` (ex.: "indicado por i007").
5. Na aba `Indicação`, a coluna `indicacoes_recebidas` se preenche sozinha (linha 2; o código está em `A2`):

```
=CONT.SES(Pedidos!utm_source;"indicacao";Pedidos!utm_content;A2) + CONT.SES(Pedidos!protocolo;"IND-*";Pedidos!observacoes;"*"&A2&"*")
```

6. Todo mês, o indicador "Pedidos por indicação" da aba `Relatório` (05 §8) entra no ritual mensal (13 §6).

Critério de aceite: lista com status por contato; indicações recebidas por contato calculadas na aba `Indicação`; total do mês na aba `Relatório`, revisado no ritual mensal.

## 3. Parcerias de canal (B313)

**Quem:** quem vende para o mesmo comprador sem concorrer: agências de marketing digital, consultorias de gestão e de ERP, estúdios de design e UX, contadores que atendem PME (06 §6.4.2).

**Acordo por escrito — checklist** (o texto final passa pelo advogado):
- [ ] Comissão: [PREENCHER] % sobre o valor **efetivamente recebido** do cliente indicado (06 cita 10–15% como referência de mercado).
- [ ] O que conta como indicação: o parceiro avisa por e-mail antes **e** o pedido chega com a UTM do parceiro, ou o cliente confirma a indicação.
- [ ] Janela de atribuição: [PREENCHER] meses a partir do aviso.
- [ ] Quando paga: [PREENCHER] dias depois de cada recebimento; contra nota fiscal do parceiro.
- [ ] Quais contratos entram (Descoberta, desenvolvimento, sustentação: decidir).
- [ ] Sem exclusividade; vigência e rescisão.
- [ ] Confidencialidade.
- [ ] **LGPD:** o parceiro só passa contato de alguém com a autorização da pessoa; o melhor caminho é o indicado entrar pelo link.
- [ ] Uso da marca Lemamon só com aprovação.

**Kit do parceiro:** o link `https://lemamon.dev/diagnostico?utm_source=parceiro&utm_medium=indicacao&utm_campaign={codigo-do-parceiro}`, o one-pager (playbook 02 §12), três frases para descrever a Lemamon (as do BLUEPRINT §1.1 e §1.2) e o que **não** é perfil (site e landing page estão fora da lista confirmada).

Registre cada parceiro no CRM, na aba `Parceiros` (cabeçalho e fórmula no [05](05-crm-e-funil.md) §5). `codigo` é curto, sem dado pessoal, sempre do mesmo tamanho: `p001`, `p002`… (é ele que vai no `utm_campaign` do link).

**Quem chega indicado pelo parceiro sem passar pelo link** (e-mail de apresentação, grupo de WhatsApp, ligação) entra no CRM à mão, com protocolo `PAR-AAAAMMDD-NN` e o código do parceiro em `observacoes` (ex.: "parceiro p003"). É esse registro que prova a indicação na hora de calcular a comissão. A coluna `indicacoes` da aba `Parceiros` soma os dois caminhos (link e `PAR-…`), e o indicador "Pedidos de parceiros" do relatório mensal também (05 §8).

Critério de aceite: 3 acordos assinados e os pedidos de parceiros identificados no CRM, pelo link (`utm_source = parceiro`) ou pelo protocolo `PAR-…`.

## 4. Comunidade (B318)

- Escolha 1 a 2 eventos por mês ([PREENCHER]: associações empresariais e de tecnologia, meetups de tecnologia e de gestão em São Paulo). A ACATE, citada no backlog (B318), é de Santa Catarina: vale só se a rede de indicação de lá continuar ativa depois da mudança para São Paulo (D38).
- Objetivo: rede de indicação, não venda no evento.
- **Registre a presença** numa aba `Eventos` da planilha, uma linha por evento:

```
data,evento,campanha,organizador,quem_foi,contatos_gerados,indicacoes_geradas,proximo_evento
```

  `campanha` é o código do evento no formato `{evento-aaaa-mm}` (ex.: `meetup-sp-2026-11`), o mesmo do link abaixo.

- Para quem quiser seguir a conversa, mande o link com UTM do evento (sem nome de pessoa na URL): `https://lemamon.dev/diagnostico?utm_source=comunidade&utm_medium=evento&utm_campaign={evento-aaaa-mm}` (ex.: `meetup-sp-2026-11`).
- Quem pede para conversar sem passar pelo link entra no CRM à mão, com protocolo `COM-AAAAMMDD-NN` e o código do evento (`campanha`) em `observacoes`. Só registre quem quis manter contato.
- `indicacoes_geradas` se preenche sozinha (linha 2; `campanha` em `C2`): `=CONT.SES(Pedidos!utm_source;"comunidade";Pedidos!utm_campaign;C2) + CONT.SES(Pedidos!protocolo;"COM-*";Pedidos!observacoes;"*"&C2&"*")`.

Medição: o indicador "Pedidos de comunidade" (05 §8) e a aba `Eventos` entram na pauta mensal (13 §6). Recorrência: meses com pelo menos um evento registrado ÷ meses do trimestre.

Critério de aceite: aba `Eventos` com uma linha por evento frequentado; pedidos de comunidade contados no relatório mensal.

## 5. Marketplaces (B316)

Workana, 99Freelas e similares: margem baixa, concorrência por preço. **Recomendação:** só com capacidade ociosa e só projeto que já nasça com autorização de case (termo do playbook 09 §6 assinado antes de começar) e que passe na conta de margem (02 §3). Registre a decisão (usar ou não, até quando) em [15](15-registro-de-decisoes.md).

## 6. LinkedIn (B315)

| Item | Definição |
|---|---|
| Quem posta | [PREENCHER] (perfil pessoal do sócio; alcance de página de empresa é baixo) |
| Cadência | 2 a 3 posts por semana (8 a 12 por mês) |
| Página da empresa | criar `/company/` (recomendação do i18n `_notes.profiles`); trocar a URL em `perfis.ts` é mudança de fato do BLUEPRINT §1.5 |
| Localização nos perfis | "São Paulo, SP, Brasil", igual ao footer, no LinkedIn (perfil de quem posta e página da empresa), no campo *Location* da organização `lemamon-dev` no GitHub e na bio do Medium, se ela citar cidade. Até 20/10/2026 a praça era Florianópolis, SC (D38); consistência de NAP no [08](08-search-console-e-seo-local.md) §3 |
| Prospecção leve | 10 a 20 conexões por semana com perfis de decisão em empresas-alvo, sem oferta na primeira mensagem |

**Pilares de conteúdo** (sempre com as regras do BLUEPRINT §12):
1. **O método na prática:** por que o preço sai da Descoberta; o que o cliente decide e quando; o que é "software funcionando a cada 2 semanas".
2. **Bastidor real:** uma decisão técnica explicada pelo efeito no negócio (sem nome de cliente sem autorização).
3. **Para quem não é técnico:** protótipo, escopo priorizado, API ("a porta de conexão de um sistema"), MVP.
4. **Perguntas para qualquer fornecedor:** a régua de `/quanto-custa` ("Como comparar propostas de software").

Links com `utm_source=linkedin&utm_medium=organico&utm_campaign=post-{aaaa-mm}`. Medição: pedidos com origem LinkedIn no CRM; sessões de `linkedin` no GA4. O perfil já está com `perfis.linkedin.publicar = true` (decisão 6); vale a regra única do [00](00-DADOS-DO-DONO.md) §B3: sem pelo menos 1 post publicado no dia do deploy de produção, publique o primeiro post ou tire o perfil do ar (D35).

## 7. Blog e conteúdo (B054, B055, B110, B298, B300, B302, B299)

**Quando o blog volta (B054):** com **3 posts reais**, autor real com papel técnico (exigido pelo schema), só em pt-BR (BLUEPRINT §6.12). Antes disso, `/blog` responde 302 para a Home.

**Autor (B298):** [PREENCHER] nome, foto real, link verificável, papel técnico. Recomendação: a mesma pessoa da coleção `time/`.

**Pauta inicial** (BLUEPRINT §6.12, escrevível sem números; o tema "quanto custa" fica em `/quanto-custa` e não vira post). **Rascunhos completos** dos posts 1, 2 e 3 e o briefing do post técnico 5 estão em [12a-rascunhos-blog.md](12a-rascunhos-blog.md), prontos para a revisão do autor:

| # | Título de trabalho | Palavra-chave a validar (08 §2) | CTA e link interno |
|---|---|---|---|
| 1 | Sistema pronto ou sob medida: como decidir | sistema pronto ou sob medida | diagnóstico · `/servicos/sistemas-web` |
| 2 | O que você deveria receber de uma Sprint de Descoberta | sprint de descoberta / discovery de produto | diagnóstico · `/sprint-de-descoberta` |
| 3 | Preço fechado ou por hora: o que muda para quem contrata | contrato de software preço fechado | diagnóstico · `/como-trabalhamos` |
| 4 | Como escolher uma empresa de desenvolvimento de software | como escolher empresa de desenvolvimento de software | diagnóstico · `/quanto-custa` |
| 5 | Entregas a cada 2 semanas: o que você deveria ver funcionando | entregas quinzenais software (validar) | diagnóstico · `/como-trabalhamos` |

Temas compatíveis do 05-conteudo §6.3 para depois: como escrever um escopo sem ser da área de TI; sinais de que a planilha virou risco; integrar ou trocar de sistema; publicar app nas lojas ("pode fazer parte do escopo"); de quem é o código (só depois de `confirmacoes.codigoProprietario`). **Conflito resolvido:** 05 pede um número real em todo post; o BLUEPRINT pede pauta escrevível sem números. Vale o BLUEPRINT: número só se for real e confirmado.

**Processo de cada post:**
1. Briefing: palavra-chave, leitor, pergunta que o post responde, CTA, link para o serviço ou o método.
2. Rascunho → revisão técnica (quem tem papel técnico) → checklist abaixo.
3. Arquivo `src/content/posts/<slug>.mdx` (formato no 00 §B10), com `capa` (obrigatória: foto real ou cartão 1200×630 do post, com `alt`), o componente `<CtaMeio />` no meio do texto (obrigatório) e `rascunho: true` até o fim da revisão.
4. Deploy preview → publicar.
5. Republicar no Medium com canonical para lemamon.dev (abaixo); compartilhar no LinkedIn; postar no Perfil da Empresa.

**Cadência (B300):** depois dos 3 primeiros, **1 post a cada 15 dias** (padrão do 05 §6.3; para mudar, registre a nova cadência na D36 do [15](15-registro-de-decisoes.md) e refaça as datas abaixo). As datas contam a partir de **D = o dia em que `/blog` volta** com os 3 primeiros posts (quinzena 5 do [14](14-calendario-90-dias.md)). Anote D aqui: [PREENCHER data].

| # | Tema (ordem da pauta acima e do 05 §6.3) | Data prevista | Autor | `rascunho: false` em | URL |
|---|---|---|---|---|---|
| 1–3 | os 3 primeiros da pauta ([12a](12a-rascunhos-blog.md)) | D | | | |
| 4 | Como escolher uma empresa de desenvolvimento de software | D+15 | | | |
| 5 | Entregas a cada 2 semanas: o que você deveria ver funcionando (briefing no 12a) | D+30 | | | |
| 6 | Como escrever um escopo sem ser da área de TI | D+45 | | | |
| 7 | Sinais de que a planilha virou risco | D+60 | | | |
| 8 | Integrar ou trocar de sistema | D+75 | | | |
| 9 | Publicar app nas lojas ("pode fazer parte do escopo") | D+90 | | | |
| 10 | De quem é o código: só com `confirmacoes.codigoProprietario` ligada; sem ela, entra no lugar "Diferença entre app nativo e híbrido" (08 §2) | D+105 | | | |

Regras da cadência:
- `publicadoEm` no frontmatter do MDX é a data em que o post sai com `rascunho: false`; é ela que o ritual mensal conta.
- Post atrasado não empurra os seguintes: a data dos próximos fica onde está. O atraso é registrado no ritual mensal ([13](13-kpis-e-rituais.md) §6), com o motivo e a nova data.
- Depois do post 10, os temas novos saem das consultas com impressão e sem clique do Search Console (08 §1, rotina mensal), mantendo a mesma cadência.

**Como saber quantos posts saíram no mês** (para o ritual mensal): a lista de https://lemamon.dev/blog (cada post mostra a data), ou no repositório `grep -lE 'publicadoEm: "?2026-12' src/content/posts/*.mdx` (troque pelo ano e mês), descontando os que ainda têm `rascunho: true`. Meta: 2 por mês com a cadência de 15 dias.

**Checklist de revisão de copy (B302)** — vale para post, LinkedIn, anúncio e qualquer texto novo do i18n:
- [ ] A frase começa pelo problema do cliente, não pela Lemamon.
- [ ] "A gente" e "você"; frases curtas; parágrafo de até 3 linhas.
- [ ] Nenhuma palavra proibida: soluções, transformação digital, inovação, excelência, de ponta, melhor, líder, referência, incrível, extraordinário, poderoso.
- [ ] Nenhum advérbio de reforço (realmente, verdadeiramente, completamente).
- [ ] Nenhum emoji em título.
- [ ] Nenhum número que não seja 45 minutos, a cada 2 semanas, ou dado real confirmado.
- [ ] Nenhuma promessa não confirmada (prazo de devolutiva, duração de MVP ou Descoberta, SLA, "atendemos todo o Brasil", "assumimos sistemas de terceiros", "você fala com quem escreve o código").
- [ ] Termos fixos: "diagnóstico gratuito", "devolutiva por escrito", "Sprint de Descoberta", "entregas a cada 2 semanas" (algarismo), "escopo, prazo e preço" (nessa ordem).
- [ ] **Teste da negação:** o contrário da frase soaria absurdo para um concorrente? Se a frase serve para qualquer agência, reescreva.
- [ ] CTA único e específico, terminando no diagnóstico gratuito.

**Medium (B299):** publique primeiro em lemamon.dev. Depois, no Medium, use **"Import a story"** com a URL do post (o Medium marca o original como canonical). Vale a regra única do [00](00-DADOS-DO-DONO.md) §B3: nenhum perfil no site sem pelo menos 1 conteúdo publicado, conferido antes de cada deploy de produção. Em 20/10/2026 o Medium tinha 0 stories e `perfis.medium.publicar` estava `true` (decisão 6): como o conteúdo nasce aqui e o blog só volta com 3 posts, a recomendação é `publicar = false` até o primeiro post importado (opção (b) da D35 do [15](15-registro-de-decisoes.md), que só tira o link do footer e do `/contato` junto com a D01).

## 8. Iscas de captura (B301, B311) — não fazer agora

O "modelo de escopo" e o "checklist de 12 perguntas" pedem formulário novo, finalidade nova na Política e ferramenta de e-mail. O BLUEPRINT não prevê isca, e o conteúdo equivalente já está aberto em `/quanto-custa` ("Como comparar propostas de software"). Reavaliar quando `/quanto-custa` tiver [PREENCHER] sessões orgânicas por mês. Decisão em [15](15-registro-de-decisoes.md).

## 9. Fora por enquanto (B319)

| Canal | Motivo | Gatilho para reavaliar |
|---|---|---|
| LinkedIn Ads | custo por lead alto e verba mínima para aprender (06 §6.4.2) | CAC comprovado no Ads de pesquisa e capacidade de atender mais |
| GetNinjas | lead de pessoa física e vendido a vários fornecedores | não reavaliar |
| LinkedIn Insight Tag e Meta Pixel | operadores novos, exigem aviso de cookies e Política; sem campanha nesses canais, não há uso | decisão de `baseAnuncios = "consentimento"` + campanha paga no canal; **depois de ligado**, revisão trimestral (13 §6): sem campanha ativa no canal, o pixel volta a `null` |

Registre a decisão e a data de revisão em [15-registro-de-decisoes.md](15-registro-de-decisoes.md) (D12 para os pixels, D13 para LinkedIn Ads e GetNinjas).

**O código dos dois pixels já está pronto e desligado** (B346, B347): `src/scripts/pixels.ts` e `src/scripts/consent.ts` carregam a tag **só em produção, só com o ID em `dados/dono.json › privacidade.pixels` e só depois do "Aceitar"** do aviso de cookies; o aviso ganha a frase do pixel e a Política passa a listar o operador e o prazo sozinha. Não cole código de pixel no site e não use Tag Manager (D11). Ligar é preencher o `dono.json` (formato no [00](00-DADOS-DO-DONO.md) §A3) e conferir com os passos abaixo. Pré-requisitos dos dois: **D05 = consentimento** (o aviso de cookies já no ar), **D12 = sim** para o canal, com a data, e campanha paga aprovada no canal.

### 9.1 Como ligar a LinkedIn Insight Tag (quando a D12 mudar) — B346

1. **Campaign Manager** › a conta de anúncios › **Analisar › Insight Tag** (o nome do menu muda com a interface; procure "Insight Tag") › **Instalar minha Insight Tag** › "Vou instalar a tag por conta própria". Do código que aparece, copie **só os dígitos** de `_linkedin_partner_id`: é o *partner ID*. O resto do código não entra no site (o snippet já está em `src/scripts/pixels.ts`).
2. Em `dados/dono.json › privacidade`: confirme `"baseAnuncios": "consentimento"` e preencha `"pixels": { "linkedin": { "id": "[só dígitos, o partner ID]", "prazo": { "pt": "…", "en": "…", "es": "…" } }, … }`. O prazo é o de retenção desses dados que o advogado aprovar, até 80 caracteres por idioma (o mesmo cuidado dos `prazos.*` do 00 §A3). Atualize `privacidade.atualizadaEm`: a Política muda.
3. **Confira localmente, antes do push:** `CONTEXT=production PUBLIC_DADOS_FICTICIOS=false COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn build`. O build passa e a lista de bloqueadores não tem nenhuma linha `privacidade.pixels.linkedin` (ID com letra, `baseAnuncios` diferente de `"consentimento"` ou prazo faltando num idioma travam). `grep -c "data-linkedin-partner-id" dist/index.html` dá 1 e `grep -c "snap.licdn.com" dist/_headers` dá pelo menos 1 (a CSP já libera a tag). Depois, **apague o `dist/`**: produção sai só do build do Netlify (00, "Regras de deploy").
4. **Deploy:** push na branch de produção. Deploy preview não serve para conferir: os pixels só existem com `CONTEXT=production`.
5. **Conferência em produção**, num navegador limpo (janela anônima), DevTools › **Network**, filtro `licdn`:
   - antes de escolher no aviso de cookies: **nenhuma** requisição a `snap.licdn.com` nem a `px.ads.linkedin.com`;
   - clique em **Aceitar**: aparece `insight.min.js` (de `snap.licdn.com`) e, em seguida, requisições a `px.ads.linkedin.com`; navegue para `/como-trabalhamos`, `/orcamento` e `/en/`: a tag carrega em cada página (o aceite fica salvo);
   - outra janela anônima, clique em **Recusar**: nenhuma requisição, nem depois de navegar e recarregar;
   - o texto do aviso de cookies cita o LinkedIn Insight Tag, e `/privacidade` lista o LinkedIn como operador, com o prazo, nos 3 idiomas.
6. **Critério de aceite (B346):** em até 24 a 48 horas, Campaign Manager › Insight Tag mostra o status **Ativa** e o domínio `lemamon.dev` na lista de domínios que enviaram sinal. Registre a data na D12 do [15](15-registro-de-decisoes.md) e na tabela de verificações (15 §2).
7. **Conversões no LinkedIn (opcional):** só por URL da página de envio (`/orcamento/enviado`, `/en/quote/sent`, `/es/cotizacion/enviada`), que não leva resposta do pedido. Nunca conversão por evento com dado de formulário.

**Desligar:** `privacidade.pixels.linkedin` de volta a `null`, `atualizadaEm` com a data e deploy. A tag some do site e da Política no mesmo deploy; remova a tag também no Campaign Manager se a campanha acabou.

### 9.2 Como ligar o Meta Pixel (só remarketing) — B347

1. **Events Manager** (business.facebook.com) › **Fontes de dados** › o pixel (ou "Conectar dados › Web" para criar) › copie o **ID do pixel** (só dígitos).
2. Nas **Configurações** do pixel, deixe **desligadas**: "Correspondência avançada automática" e "Configuração automática de eventos" (eventos sem código). O site já manda `autoConfig = false` antes do `init` (`src/scripts/pixels.ts`), mas a conta não pode contradizer. Não use a "Ferramenta de configuração de eventos".
3. Em `dados/dono.json › privacidade`: confirme `"baseAnuncios": "consentimento"` e preencha `"pixels": { …, "meta": { "id": "[só dígitos, o ID do pixel]", "prazo": { "pt": "…", "en": "…", "es": "…" } } }`, com o prazo aprovado pelo advogado; atualize `atualizadaEm`.
4. Confira localmente como no 9.1, passo 3 (sem linha `privacidade.pixels.meta` nos bloqueadores; `grep -c "data-meta-pixel-id" dist/index.html` dá 1; `grep -c "data-meta-pixel-id" dist/orcamento.html dist/orcamento/enviado.html dist/contato.html` dá 0 nos três; `grep -c "connect.facebook.net" dist/_headers` dá pelo menos 1), apague o `dist/` e faça o deploy (push).
5. **Conferência em produção:** Events Manager › o pixel › **Testar eventos** › abra `https://lemamon.dev` pelo botão da própria ferramenta (navegador limpo):
   - antes de escolher no aviso de cookies: **nada** chega;
   - depois de **Aceitar**: chega `PageView` de `/`, de `/como-trabalhamos` e de `/en/`;
   - **nada** chega de `/orcamento` (inclusive com `?etapa=`), `/orcamento/enviado`, `/contato`, `/en/quote`, `/en/quote/sent`, `/en/contact`, `/es/cotizacion`, `/es/cotizacion/enviada` e `/es/contacto`: o pixel nem carrega nessas páginas;
   - outra janela anônima, **Recusar**: nada chega, nem navegando;
   - só `PageView`: nenhum `Lead`, `Contact`, `SubmitApplication` nem evento automático (`SubscribedButtonClick`, `Microdata`).
6. **Critério de aceite (B347):** o pixel só dispara depois do aceite e o Events Manager recebe `PageView` das páginas sem formulário. Registre a data na D12 e no 15 §2.
7. **Nunca** crie eventos de `Lead` ou `Contact` no Meta Pixel, nem conversões personalizadas por URL de `/orcamento*` ou `/contato`: a Política promete que nenhuma resposta do pedido vai para a Meta, e o pixel é só para remarketing (06-marketing §6.6.4).

**Desligar:** `privacidade.pixels.meta` de volta a `null`, `atualizadaEm` com a data e deploy.

**Revisão trimestral (os dois pixels):** no ritual trimestral ([13](13-kpis-e-rituais.md) §6), para cada pixel ligado: ainda há campanha de remarketing ou de LinkedIn rodando no canal? Se não, volte `privacidade.pixels.<pixel>` a `null` e faça deploy no mesmo dia. Anote o resultado na D12.
