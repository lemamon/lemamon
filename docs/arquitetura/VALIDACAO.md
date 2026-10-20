# Validação final do site novo da Lemamon

**Data:** 20/10/2026 · **Escopo:** os 387 itens do [backlog](backlog.json), o copy nos 3 idiomas e o painel de 9 revisores · **Fonte dos vereditos:** `final-verdicts.json` (376 itens, gerado pela validação) · **Fontes de verdade:** [BLUEPRINT](BLUEPRINT.md), [CONTRACT](CONTRACT.md), `src/i18n/{pt,en,es}.json`, [playbooks](../playbooks/INDEX.md)

> **Praça.** Parte das provas foi coletada antes da decisão D38 e cita "Florianópolis, SC". Desde 20/10/2026 o site diz **São Paulo, SP** (D38; `src/i18n/pt.json` tem 0 "Florianópolis" e 25 "São Paulo"; `ADDRESS` em `src/config/site.ts`). Onde uma prova abaixo cita Florianópolis, leia São Paulo: o comportamento verificado é o mesmo. Razão social e CNPJ também entraram em 20/10 (D39), depois de algumas provas.

---

## (a) Resumo executivo

### A resposta curta: está finalizado?

**O código está pronto e validado. O site ainda não está no ar.** São duas coisas diferentes, e a segunda é a que custa dinheiro hoje.

- **Produção continua sendo o app antigo.** Conferido agora: `https://lemamon.dev/` serve o mesmo HTML de 73.585 bytes do SPA antigo, e o chunk `/assets/index-BanLyzmD.js` ainda envia o formulário para `lemamon-email-service-…herokuapp.com`, que responde **404**. Enquanto o site novo não for publicado, **todo lead que preenche o formulário se perde** (B231).
- **O site novo não foi commitado.** O `git status` mostra 38 caminhos novos não rastreados (`??`) e 74 renomeações para `legacy/` no índice. Nada foi publicado.
- **O build de produção trava de propósito.** A trava da Política de Privacidade (CONTRACT §15.2) derruba o build com `CONTEXT=production` enquanto 9 campos de `dados/dono.json › privacidade` estiverem vazios. Isso é o que separa o site do lançamento, e só o dono resolve (com o advogado).
- **Tudo o que é código passou:** `astro check` 0/0/0, 904 testes unitários verdes, 311 testes E2E verdes com 0 falha, paridade do i18n em 2.173 caminhos nos 3 idiomas, orçamento de peso por página, nenhum valor monetário fora da ilha do wizard e nenhum dado fictício no build de produção.

### Os números

| Veredito | Itens | % | O que significa |
|---|---:|---:|---|
| `fixed` | 234 | 62% | Resolvido e provado no build ou no navegador |
| `covered_by_playbook` | 68 | 18% | Não é código; há playbook acionável em `docs/playbooks/` |
| `blocked_owner_data` | 37 | 10% | O site está pronto para receber o dado; falta o dado real do dono |
| `out_of_scope_by_decision` | 28 | 7% | Excluído por decisão do dono ou do BLUEPRINT (com a referência) |
| `partially_fixed` | 9 | 2% | Parte feita; resta trabalho de código ou de documentação |
| `not_fixed` | 0 | 0% | — |
| **Total com veredito** | **376** | | Os outros 11 itens do backlog eram premissas inválidas (ver nota na seção c) |

**330 dos 376 itens (88%) estão fechados** do ponto de vista do código (`fixed` + `covered_by_playbook` + `out_of_scope_by_decision`). Os 37 bloqueados dependem só de dado do dono. Os 9 parciais não impedem o lançamento: 4 são acabamento do design system, 2 são de ferramenta (lint, CSP), 1 é de copy condicionada a uma decisão futura (D03), 1 é de rótulo de CTA e 1 é a aprovação do title (D37).

**Por especialidade:**

| Especialidade | Resolvidos | Playbook | Dado do dono | Fora de escopo | Parciais | Total |
|---|---:|---:|---:|---:|---:|---:|
| Conteúdo | 26 | 10 | 17 | 8 | 2 | 63 |
| UX | 42 | 0 | 4 | 7 | 0 | 53 |
| Produto e repositório | 15 | 20 | 1 | 1 | 0 | 37 |
| Técnico | 48 | 4 | 5 | 1 | 2 | 60 |
| Medição | 25 | 16 | 5 | 6 | 0 | 52 |
| SEO e idiomas | 24 | 3 | 0 | 0 | 0 | 27 |
| Negócio | 2 | 12 | 3 | 5 | 1 | 23 |
| Acessibilidade | 18 | 0 | 0 | 0 | 0 | 18 |
| UI e design system | 34 | 3 | 2 | 0 | 4 | 43 |
| **Total** | **234** | **68** | **37** | **28** | **9** | **376** |

### O que mudou nas rodadas de correção

Três rodadas de correção levaram os itens pendentes de **73 para 9** (73 → 23 → 16 → 9). Em paralelo, o copy recebeu 110 alterações pedidas pelo painel (33 + 42 + 35). O painel passou de 1 para 2 grupos aprovados (Estrutura na rodada 0, Conversão na rodada 1); Home, Método e Serviços subiram de 3, 4 e 1 aprovações para 6, 5 e 6, e os 5 grupos passaram a ter compliance ok. Os testes unitários foram de 799 para 904 e os E2E de 303 para 311 verdes, sempre com 0 falha. O detalhe está na seção (f).

### O site está pronto para conquistar clientes?

**Pronto para converter quem já confia; ainda não para convencer quem desconfia.**

O método é o herói, como o dono decidiu, e funciona: a promessa ("escopo, prazo e preço combinados antes de começar") aparece em 5 segundos, o primeiro passo custa quase nada (diagnóstico gratuito de 45 minutos, resumo antes de deixar o contato, devolutiva por escrito) e o funil não perde o lead (rascunho salvo, 3 tentativas, saída por WhatsApp e e-mail). No painel, **Rafael e Cláudia pediriam o diagnóstico ou mandariam um WhatsApp**; Marcos, hoje, no máximo mandaria uma pergunta. Nenhum dos três fecharia contrato só com o que o site mostra hoje.

O que segura não é texto. São 5 provas que só o dono pode dar, e todos os grupos do painel citaram as mesmas:

1. **Perfis públicos vazios.** A seção "A Lemamon em outros canais" manda o comprador conferir o GitHub (0 repositórios) e o Medium (0 artigos), e o LinkedIn é perfil pessoal (`/in/`). Para o comprador desconfiado, isso tira mais confiança do que dá.
2. **Nenhuma pessoa com nome e rosto.** "Quem vai fazer o meu sistema? É um freelancer?" fica sem resposta.
3. **E-mail `@gmail.com`** ao lado do CNPJ.
4. **"O código fica com a minha empresa?"** sem resposta (o texto está pronto, falta escolher a versão).
5. **Nenhum case nem depoimento.**

Com os itens 1 a 4 resolvidos (dias de trabalho, não meses), Rafael diz que pediria o diagnóstico direto pelo botão e Marcos que marcaria o diagnóstico como "um teste barato". Cláudia ainda quer um case do setor dela: o item 5 é o de maior prazo e deve começar já (playbook 09).

---

## (b) Validação do copy pelo painel

O painel tem 9 revisores: as 3 personas do BLUEPRINT (**Rafael**, fundador técnico com MVP; **Cláudia**, diretora de PME que já foi enganada; **Marcos**, head de produto/tech lead de empresa média), mais diretor comercial, UX writer, SEO, compliance, nativo em inglês e nativo em espanhol. Um grupo é aprovado com 7 de 9 aprovações e compliance ok.

| Grupo | Páginas | Aprovado | Aprovações | Média | Compliance | Última rodada |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Home | `/`, `/en/`, `/es/` | Não | 6/9 | 7,8 | ok | 3 |
| Método | Como trabalhamos, Sprint de Descoberta, Quanto custa | Não | 5/9 | 7,8 | ok | 3 |
| Serviços | `/servicos` e as 5 páginas de serviço | Não | 6/9 | 7,9 | ok | 3 |
| Conversão | `/orcamento` (wizard), `/orcamento/enviado`, `/contato` | **Sim** | 7/9 | 8,1 | ok | 1 |
| Estrutura | header, rodapé, menu, 404, Política, `/sobre`, cases e blog | **Sim** | 8/9 | 8,1 | ok | 0 |

**Notas por revisor (rodada final de cada grupo):**

| Revisor | Home | Método | Serviços | Conversão | Estrutura |
|---|:---:|:---:|:---:|:---:|:---:|
| Rafael (persona) | 7 | 7 | 8 | 7,5 | 8 |
| Cláudia (persona) | 7 | 7 | 7 | 8 | 8 |
| Marcos (persona) | 7 | 6 | 6,5 | 7 | 7 |
| Comercial | 7,5 | 8 | 8 | 8 | 8 |
| UX writer | 7,5 | 7,5 | 8,5 | 8 | 8 |
| SEO | 8,5 | 9 | 8,5 | 9 | 8 |
| Compliance | 8,5 | 9 | 8,5 | 8,5 | 8,5 |
| Nativo EN | 8 | 8,4 | 8 | 8 | 8,5 |
| Nativo ES | 9 | 8,5 | 8,5 | 8,5 | 8,5 |

> Conversão e Estrutura foram avaliadas nas rodadas 1 e 0, antes da D39 (CNPJ) e das rodadas de copy seguintes. Por isso alguns bloqueios desses grupos ("falta CNPJ") já não valem: o rodapé de produção mostra hoje "Lemamon.dev LTDA · CNPJ 69.700.690/0001-98".

### As personas entrariam em contato hoje?

| Grupo | Rafael | Cláudia | Marcos |
|---|---|---|---|
| Home | **Provavelmente sim**, pelo WhatsApp ou pelo diagnóstico, desconfiado | **Sim, mas pelo WhatsApp**, e pediria orçamento a mais 2 fornecedores | **Não agora** |
| Método | **Sim, pelo WhatsApp**, ainda desconfiado | **Sim para o diagnóstico**; não pagaria a Descoberta | **Ainda não** |
| Serviços | **Sim, pelo WhatsApp**, com 3 perguntas antes | **Sim, pelo WhatsApp**, só para sondar preço e suporte | **Não, ainda não** |
| Conversão | **Sim, só o diagnóstico**, com o pé atrás | **Sim**, pelo wizard ou pelo WhatsApp | **Ainda não** |
| Estrutura | **Sim, pelo WhatsApp**, para testar antes | **Só um WhatsApp**, sem preencher o pedido | **Não**, com o site como está |

**Rafael (fundador com MVP)** — entra, mas para testar.
- Home: "Não fecharia contrato sem saber quem vai programar, se o código fica comigo e se vou falar com alguém técnico no diagnóstico."
- Serviços: "Sem rosto, sem case, com Gmail e com GitHub/Medium vazios, a Lemamon entra na minha comparação como 'possível freelancer organizado'."
- Conversão: "O site me transforma em lead de diagnóstico. Para me transformar em cliente, faltam os dados do dono."
- **O que o segura:** nenhuma pessoa técnica com nome; "o código fica comigo?" sem resposta (`confirmacoes.codigoProprietario`); duração da Descoberta desconhecida (`descoberta.duracao`); com quem é a conversa de 45 minutos (`confirmacoes.formatoDiagnostico`); nenhum MVP no ar para clicar; perfis vazios; e-mail Gmail. Na Home, o FAQ de preço e de prazo abrem com "Depende".

**Cláudia (diretora de PME, já foi enganada)** — entra pelo canal de menor risco e compara.
- Home: "Sem rosto, sem um case do meu setor e sem nenhuma faixa de preço, a Lemamon perde para quem mostrar essas três coisas, mesmo tendo o processo mais claro dos três."
- Método: "Não pagaria a Sprint de Descoberta sem saber a faixa de valor, quanto tempo ela dura, quem vai trabalhar no meu projeto, se o escopo e o protótipo ficam comigo…"
- Estrutura: "O método me convence. O que falta é ver que existe uma empresa de verdade do outro lado."
- **O que a segura:** nenhuma ordem de grandeza de preço (decisão 3 do dono: isso é escolha, não falha); "Depende" abrindo as respostas de preço (FAQ da Home e `pricing.hero.lead`); nenhum case do setor dela; "o plano da Descoberta fica comigo?" e "a Descoberta é abatida?" sem resposta (`planoDoCliente`, `descobertaAbatida`); nota fiscal sem confirmação (`notaFiscal`); em `/servicos/sustentacao`, a faixa "Sustentação e evolução após o lançamento, se você quiser" sugere que a Lemamon só cuida do que ela mesma lançou.

**Marcos (head de produto, tech lead)** — é o mais exigente e hoje não entra.
- Home: "A org do GitHub está vazia, o Medium não tem artigos, o LinkedIn é um perfil pessoal, o e-mail é @gmail e não aparece uma pessoa com nome. Leio isso como uma pessoa só, recém-aberta, e não levo ao meu chefe."
- Método: "Cheguei procurando quem constrói e como. Não achei pessoas, práticas de engenharia, dono do código, NDA, nem nada sobre trabalhar com o meu time."
- Serviços: "O texto me convenceu de que o método comercial é sério e transparente. O que falta é eu acreditar que a engenharia é."
- **O que o segura:** GitHub sem repositório; `engenharia.*` vazio (a seção "Como a gente constrói" não aparece); nenhuma pessoa com senioridade; Gmail; NDA (`confirmacoes.nda`) e propriedade do código desligados; nada sobre trabalhar com o time interno (`confirmacoes.timeDoCliente`) nem sobre pular a Descoberta quando já há escopo (`confirmacoes.semDescoberta`). Ele voltaria com "1 pessoa com foto e papel, 1 repositório público, contato@lemamon.dev e o FAQ de propriedade do código ligado".

### Os outros revisores, em uma linha

- **Comercial (7,5–8):** um comprador de PME pediria o diagnóstico; o cético confere a empresa por fora, acha perfis vazios e Gmail, e desiste. "Eu só ligaria a mídia paga depois de preencher os perfis (ou escondê-los), confirmar a propriedade do código e publicar pelo menos 1 pessoa do time."
- **UX writer (7,5–8,5):** o texto convence sobre o método; os bloqueios dele são de comprimento: 33 trechos da Home e 10 do grupo Método ocupam 4 a 6 linhas a 375 px, com propostas de texto mais curto nos 3 idiomas.
- **SEO (8–9):** title, H1 e subtítulo respondem a intenção de busca; a prévia no WhatsApp vende a promessa. O que segura é prova, não SEO. Na Estrutura, apontou o corpo de post e case sem espaçamento entre parágrafos e titles de case/post acima de 60 caracteres.
- **Compliance (8,5–9):** **ok em todos os grupos** desde a rodada 3. Nenhuma promessa sem lastro; os bloqueios restantes são a Política sem controlador, encarregado e prazos (trava de build) e a decisão D05 sobre a base legal dos cookies de anúncio.
- **Nativo EN (8–8,5):** o inglês está bom; "even without a finished scope" (Home), "your date" (MVP) e o fragmento do apoio da P5 soam traduzidos; o H1 de How we work perdeu "timeline". Um comprador americano hesitaria pela falta de pessoas, cases e de qualquer sinal de atendimento fora do Brasil.
- **Nativo ES (8,5–9):** o espanhol é nativo e usa "tú" em todo lugar; a meta de Cómo trabajamos não diz que o Sprint é pago, e "número al aire" se repete no parágrafo-chave do Sprint. Para o comprador fora do Brasil, falta dizer se a Lemamon atende de lá (decisão D31).

### Bloqueios abertos do painel final, por tipo

Não houve rodada 4: os pedidos abaixo vieram da avaliação final e **continuam abertos** (conferi o texto atual de cada chave citada).

| Tipo | Onde | O que é | Quem resolve |
|---|---|---|---|
| Dado do dono | Todos os grupos | Perfis vazios, nenhuma pessoa, Gmail, nenhum case, propriedade do código, formato do diagnóstico, Descoberta sem duração | Dono (seção d) |
| Design | Serviços | Faixa de compromissos de `/servicos/sustentacao` ainda mostra só "após o lançamento, se você quiser". Precisa da prop `group` em `Commitments.astro` (home) e de 1 linha em `ServiceView.astro:124` (pages). O patch de referência de uma rodada anterior não aplica mais limpo | home + pages |
| Design | Estrutura | Corpo MDX de post e case sem espaçamento entre parágrafos; title de case/post passa de 60 caracteres; no espanhol, o item "Sprint de Descubrimiento" quebra no dropdown e o ícone do WhatsApp é espremido quando há agenda; card de case com cliente esconde o setor | gated + shell |
| Design | Conversão | Na P3, depois de 3 marcadas, tocar uma 4ª não dá retorno visível no mobile | conversion |
| Copy | Home | `faq.items.how_much` e `how_long` abrem com "Depende" (pt/en/es); 33 trechos longos demais a 375 px; en `home.cta_final.text` ("finished scope") | copy |
| Copy | Método | `pricing.hero.lead` (Cláudia quer a garantia junto do "Depende"; UX writer quer encurtar: decidir entre as duas); subtítulos longos dos heros; en `how_we_work.hero.title` sem "timeline"; en/es `meta.how_we_work.description` sem "paga"; es `discovery_sprint.why_start_here.text` | copy |
| Copy | Serviços / Conversão / Estrutura | en `services.mvp.cta_final.text` ("your date"); `quote.summary.below_primary` quebra em 2 linhas na barra fixa; o exemplo do erro de telefone quebra no meio; en `quote.steps.budget.helper_tiers`; es `about.cta_final.title` | copy |
| Decisão | Home, Método, Serviços | Atender fora do Brasil (D31); `semDescoberta`, `timeDoCliente`, `sistemaTerceiros`, `nda`, `notaFiscal` | Dono |

> **Texto da decisão 5 para conferir.** O FAQ de mudança de escopo em pt está como "…Se a mudança mexer no escopo, a gente combina de novo com você escopo, prazo e preço antes de seguir." O texto aprovado era "…escopo, prazo e preço são combinados de novo antes de seguir." O sentido é o mesmo; a forma mudou numa rodada de copy. Aprove a nova forma ou peça a volta ao texto literal.

---

## (c) Tabela completa por item

Ordem: primeiro os parciais (com o motivo), depois os bloqueados por dado do dono, os cobertos por playbook, os fora de escopo por decisão e, por fim, os resolvidos. Não há nenhum `not_fixed`. "4511" é o build igual ao de produção; "4512" é o build com a camada de dados fictícios (noindex, faixa "Dados fictícios — não publicar"), usado só para provar que o site recebe o dado.

> **Itens sem veredito.** 11 itens do backlog estavam marcados como premissa inválida desde a análise (B098, B138, B178, B179, B183, B223, B230, B248, B284, B288, B328) e não foram revalidados. O conteúdo de B288 ("não usar o GitHub como prova enquanto a org não tiver repositórios") reaparece no painel e no B299.

> † A prova deste item passou por um segundo revisor (o "cético"), que corrigiu ou completou a avaliação. O veredito da tabela já considera essa revisão.

### Parcialmente resolvidos (9)

Parte do critério está atendida; o restante é trabalho de código ou de documentação. Nenhum destes impede o lançamento.

| ID | Item | O que já está feito | O que falta (quem faz) |
|---|---|---|---|
| B101 | Reescrever title, description e OG alinhados ao posicionamento (keyword primeiro, description até 160 caracteres) | Title de 59 caracteres, description de 153, OG e Twitter iguais e imagem 1200×630 nos 3 idiomas. | [dono + playbooks] Aprovar title e description por escrito na D37. A D37 ainda cita o title antigo de 61 caracteres, e o COPY.md:2353 também. |
| B167† | Unificar os rótulos de CTA do site: um primário e o WhatsApp como secundário | Rótulos antigos zerados; todo botão primário usa o mesmo texto nos 3 idiomas. | [conversion + copy] A dica 'sistema no ar' do /contato diz 'Começar pelo diagnóstico…'. Com agenda ligada, os 2 botões finais do wizard não viram 'Agendar…'. |
| B211 | Criar o wrapper Section com ritmo vertical padronizado | `<Section>` com tokens --section-* em 68 arquivos; varredura de 17 páginas sem desvio, exceto 1 faixa. | [pages] A faixa 'Já recebeu a proposta?' de /sprint-de-descoberta tem padding próprio de 20px fora do `<Section>`. |
| B212† | Criar o Badge de tecnologia com a stack real da Lemamon | Badge mono com logo de 16px funciona na ficha técnica do case fictício. | [gated] Tecnologia sem logo sai só com o nome, sem aviso no build. E falta 1 case real com stack validada. |
| B214 | Criar os demais primitivos do design system (Stack, Card, Link, Dialog etc.) | Card, ArrowLink, Divider, Section, Badge e Button existem e usam tokens. | [home, com pedidos a pages, shell e gated] Link com seta, cartão e callout ainda feitos à mão; falta o primitivo Callout e um teste que cubra o site todo. |
| B222 | Adotar grid de 12 colunas e proibir o 11+11 com space-between do ContentBlock | .grid-12 com calha de token; composições 7+5, 8+4 e 4+8 nas seções. | [home + shell] auto-fit em Profiles e LogoWall, calha fora do token em DecisionPoints e Commitments, /privacidade fora da grade. |
| B251 | Configurar ESLint 9 flat + Prettier + lint-staged/Husky | scripts/lint.mjs (3 regras) e pre-commit bloqueiam console.log e asserção desnecessária. | [shell] Sem Prettier nem regras de hooks do React; 6 violações em allowlist. Exige instalar dependências numa rodada própria. |
| B254 | Adicionar Content-Security-Policy aos headers de segurança | CSP com hash por script, sem 'unsafe-inline' e com coletor de relatórios; 0 violação no teste local com a política imposta. | [shell, depois do lançamento] Está em Report-Only de propósito. Promover para Content-Security-Policy depois de 7 dias sem relatório em produção. |
| B383 | Montar uma tabela de pacotes pré-definidos para projetos abaixo do teto da descoberta | Playbook 02 §3/§5 tem a margem de 40%, a tabela de pacotes e o roteamento do lead abaixo do teto. | [copy] As 25 frases que vendem a Descoberta não têm variante para semDescoberta = true. Ligar a D03 hoje contradiria o site. |

### Bloqueados por dado do dono (37)

O site já recebe o dado (provado com a camada fictícia na 4512 ou por teste); falta o dado real do dono ou o deploy que depende dele.

| ID | Item | O site já está pronto | O que falta |
|---|---|---|---|
| B006† | Trocar o e-mail @gmail.com por um endereço do domínio lemamon.dev | O e-mail vem só de dados/dono.json; build de teste com contato@lemamon.dev trocou as 390 ocorrências. | Criar a caixa no domínio (SPF, DKIM, DMARC) e trocar empresa.email. O playbook 11 §4 tem um check que dá falso 'pronto'. |
| B007 | Ativar o WhatsApp em produção com o número real (VITE_WHATSAPP_NUMBER) | Botão flutuante, CTAs e fallback de erro funcionam com número de teste; sem número, nenhum botão aparece. | Cadastrar PUBLIC_WHATSAPP_NUMBER no Netlify (variável de ambiente). |
| B011 | Criar a tela de estimativa (faixa, prazo, entregáveis) calculada a partir do data.json antes do formulário | Resumo antes do contato; o bloco 'E o preço?' mostra faixas na 4512 e só texto na 4511. | precos.* (faixas reais) para o bloco 'E o preço?' do resumo. |
| B030 | Criar a página /cases com grid de projetos reais | /cases com grid na 4512; 404 e fora do menu em produção; exige 2+ cases nos 3 idiomas. | 2 cases reais autorizados em MDX, nos 3 idiomas. |
| B031 | Criar a página de case completo /cases/:slug com resultado, prazo e CTA | Página de case completa na 4512; o CTA pré-marca o wizard e leva ?ref= ao lead. | Cases reais. |
| B033 | Criar a seção de Cases na Home (CaseCard com resultado numérico) | Seção 'Projetos que a gente já entregou' na Home da 4512; some em produção. | 2 ou mais cases reais. |
| B034 | Adicionar faixa de prova social/credibilidade abaixo do hero (logos autorizados, stack, números reais) | Faixa de compromissos no ar; faixa de logos (4+ empresas) pronta na 4512. | logos autorizados (4 ou mais empresas). |
| B035 | Adicionar seção de depoimentos nominais autorizados (nome, cargo, empresa, foto) | Depoimento nominal na Home da 4512; o schema recusa nome genérico. | depoimentos autorizados por escrito. |
| B037 | Mostrar faixas de investimento 'a partir de R$ X' por oferta (seção Planos/PricingTable) | Faixas de investimento com 'Referência, não proposta' na 4512; 0 'R$' em produção. | precos.* e a planilha de margem (playbook 02 §3). |
| B053 | Oferecer agendamento direto (Cal.com/Calendly) após a qualificação, inclusive na tela de sucesso | Link de agenda e rótulo 'Agendar diagnóstico gratuito' funcionam na 4512. | agenda.url e privacidade.ferramentas.agenda. |
| B054 | Republicar o blog (como /insights) só com posts reais e autoria real | Blog pt-BR com 3 posts, autor e CTAs rastreados na 4512; /blog faz 302 para / em produção. | 3 ou mais posts reais com autor real. |
| B086 | Criar a seção do time com fotos, nomes e papéis reais | Seção #time com foto, nome, papel e links na 4512; 0 HTML em produção. | time com pelo menos 1 pessoa real. |
| B088 | Reestruturar o rodapé em colunas claras com barra de ©, CNPJ, endereço e Política de Privacidade | Rodapé em 4 colunas com ©, cidade e Política; CNPJ entra com hasCompanyData. | Razão social e CNPJ já foram preenchidos em 20/10 (D39) e saem no rodapé; falta só conferir contra o cartão CNPJ. |
| B089 | Publicar a Política de Privacidade e adicionar aviso LGPD no formulário | /privacidade nos 3 idiomas, linkada nos dois formulários; o build de produção trava sem dado real. | privacidade.* (base de anúncios, encarregado, prazos, data de atualização). |
| B109 | Criar a oferta de Sustentação/continuidade e incluí-la por padrão na proposta | 'Formato e contratação', preço mensal e FAQ de sistema de terceiros prontos na 4512. | sustentacao.*, precos.sustentacao e confirmacoes.sistemaTerceiros. |
| B110 | Publicar os artigos prioritários de fundo de funil (quanto custa, como escolher) | Post com CTA no meio e no fim e 'Leia também' na 4512. | Posts reais. |
| B113 | Criar a página /sobre com time real, CNPJ, endereço e forma de trabalho | /sobre completa na 4512 (crenças, time, dados da empresa, perfis); 404 em produção. | time com pelo menos 1 pessoa (a empresa já foi preenchida na D39). |
| B114 | Oferecer material compartilhável para o comprador justificar a contratação internamente | Botão 'Salvar este case em PDF' com layout de impressão; one-pager no playbook 02 §12. | Cases reais (o CNPJ já está preenchido). |
| B118 | Instrumentar pricing_view quando a seção de investimento entrar na tela | pricing_view dispara uma vez por página na 4512. | precos.*. |
| B121 | Instrumentar schedule_click no botão de agendamento | schedule_click dispara no pós-envio da 4512. | agenda.url. |
| B140 | Inserir prova social dentro do fluxo do wizard | Depoimento ou logos na entrada e no contato do wizard (4512). | depoimentos ou logos. |
| B149 | Adicionar 'Ver nossos cases' entre as ações pós-sucesso | Pós-envio mostra até 2 cases do serviço escolhido (4512). | Cases reais. |
| B215† | Adotar a direção de arte 'Engenharia visível', com o artefato real como herói | Hero e método com artefatos autorais; cases com tela real na 4512. | Telas reais de projetos, que vêm com os cases. |
| B219† | Produzir diagramas técnicos autorais em SVG com a linguagem da marca | Case aceita diagrama como imagem; guia de estilo no playbook 09. | Arquitetura real autorizada. |
| B231† | Trocar o backend Heroku morto por Netlify Forms na captação de leads | Form 'briefing' do Netlify com os 15 campos; 0 'herokuapp' no código; E2E verde. | Lançamento. Hoje lemamon.dev ainda é o app antigo, que perde 100% dos leads do formulário. Depende de privacidade.* + commit + deploy. |
| B233† | Remover o pipeline fantasma do GitHub Pages e versionar o netlify.toml | pipeline.yaml apagado; netlify.toml com build, redirects e headers; CSP gerada no build. | Commit, deploy e conferência dos headers em produção. |
| B236† | Servir /assets/* com Cache-Control immutable | /_astro/* com Cache-Control immutable no netlify.toml (testado em unit). | Deploy e curl em produção. |
| B283 | Reescrever 'Atendimento Personalizado' como mecanismo verificável | Texto antigo saiu; engenharia.people e sustentacao.canais já renderizam na 4512. | engenharia.people e sustentacao.canais. |
| B287 | Produzir um depoimento em vídeo de 60 s | Vídeo com legenda nos 3 idiomas, carregado só no clique, sem player de terceiros (4512). | Vídeo gravado e autorização de imagem e voz. |
| B298 | Definir um autor real e único para o conteúdo | Schema exige autor com nome, foto, link e papel técnico. | Autor real dos posts. |
| B344 | Implementar Consent Mode v2 com banner de cookies | Consent Mode v2 e aviso de cookies prontos e testados num build de teste. | Decisão D05 (privacidade.baseAnuncios) com o advogado. |
| B346 | Instalar a LinkedIn Insight Tag | LinkedIn Insight Tag só depois do 'Aceitar', testada com ID de teste. | D05, D12 e partner ID real em privacidade.pixels.linkedin. |
| B347 | Instalar o Meta Pixel apenas para remarketing | Meta Pixel só com PageView e fora das páginas com formulário, testado com ID de teste. | D05, D12 e pixel ID real em privacidade.pixels.meta. |
| B354 | Empacotar e publicar a oferta Sprint de Descoberta | /sprint-de-descoberta completa; formato, exclusões e faixa aparecem na 4512. | precos.descoberta e descoberta.* (incluindo naoInclui). |
| B362 | Garantir que nenhum lead se perca quando o envio falha | Tela de erro com 'Tentar de novo', WhatsApp com respostas e protocolo, 'Copiar' e e-mail; lead_failed vai ao GA4 e ao New Relic. | PUBLIC_WHATSAPP_NUMBER e o alerta de lead_failed (playbook 06 §7). |
| B378 | Publicar prova sem nome do cliente (case anonimizado por setor e porte) enquanto falta autorização | Schema aceita case anonimizado por setor e porte; card sem nome testado. | Case real autorizado, com tela real anonimizada. |
| B379 | Mostrar 2 cases semelhantes na tela de resultado do wizard | Resumo do wizard e pós-envio mostram até 2 cases do mesmo tipo (4512). | 2 ou mais cases com servicos[] preenchido. |

### Cobertos por playbook (68)

Não é código. O playbook citado (em `docs/playbooks/`) diz o passo a passo e o critério; o que resta é execução ou assinatura do dono.

| ID | Item | Prova | Playbook |
|---|---|---|---|
| B029 | Criar e verificar o Perfil da Empresa no Google (SEO local Florianópolis) | Passo a passo do Perfil da Empresa no Google; JSON-LD com endereço já no ar. | 08 §3 |
| B032 | Produzir e publicar 2 a 3 cases reais estruturados (com autorização dos clientes) | Termo de autorização, roteiro de entrevista e checklist; o schema barra case sem autorização. | 09 |
| B043 | Rotear cada lead para CRM/planilha e notificar o comercial na hora (e-mail/WhatsApp/Slack) | Form estático com assunto '[score] protocolo'; notificação nativa do Netlify configurada pelo playbook. | 05 §2–§7 |
| B044 | Criar sequência de nutrição (D1 a D30) para leads frios | Cadência D0–D30 manual; automação só depois de a Política cobrir a ferramenta. | 04 §5 |
| B045 | Criar a propriedade GA4 e preencher VITE_GA4_ID em produção | GA4 pronto por PUBLIC_GA4_ID; criação da propriedade no playbook. | 06 §1–§2 |
| B055 | Definir a pauta editorial de decisão de compra (fundo de funil) no lugar de tutoriais | Pauta de 5 posts com keyword, CTA e link interno. | 12 §7 |
| B056 | Rodar teste A/B de headline e CTA do hero quando houver volume | Protocolo de teste A/B com amostra mínima; nenhum teste antes do volume. | 13 §9 |
| B057 | Definir e cumprir o SLA de primeiro contato com responsável e autoresponder | SLA interno por score e modelos de primeiro contato; o site não promete prazo. | 04 §1–§2 |
| B058 | Montar o painel/exploração de funil com KPIs semanais e metas | Eventos do funil existem; explorações e painel semanal descritos. | 06 §6, 13 §3 |
| B077 | Substituir o vermelho #ff0000 de hover/ação por um acento de marca com contraste adequado | Acento âmbar com contrastes ≥ 4,5:1 medidos; falta o 'sim' na D32. | 15 D32 |
| B103 | Verificar o domínio no Google Search Console/Bing e enviar o sitemap | Verificação do domínio e envio do sitemap; sitemap já servido. | 08 §1 |
| B107 | Criar alerta automático quando a captura de lead falhar | lead_failed vai ao GA4 e ao New Relic; alerta NRQL de 15 min no playbook. | 06 §7 |
| B119 | Disparar lead_qualified no servidor após aplicar a regra de MQL | Sem servidor: lead_qualified criado no GA4 a partir do score A. | 06 §5 |
| B120 | Usar lead_qualified como conversão primária do Google Ads | lead_qualified importado no Ads como secundário até o gatilho da D09. | 06 §5, 07 §4.4–4.5 |
| B221 | Definir a marca gráfica: wordmark mono com '.dev' em acento | Protótipo de wordmark pronto e fora das páginas; aguarda a D34. | 15 D34 |
| B226 | Incluir o argumento de fuso GMT-3 e sobreposição com os EUA (nearshore) | O site não diz que atende fora do Brasil; D31 preparada. | 15 D31 |
| B253 | Configurar Renovate ou Dependabot com agrupamento semanal | renovate.json pronto; instalação do app passo a passo. | 13 §10 |
| B265 | Avaliar o Decap CMS sobre o MDX quando houver editor não técnico | Decap CMS como decisão D25, com revisão no dia 90. | 15 D25 |
| B273 | Avaliar o Netlify Analytics como baseline imune a adblock | Netlify Analytics: não ativar agora, reavaliar no dia 60 (D10). | 06 §11, D10 |
| B275 | Configurar monitor de uptime externo para o site e o fluxo de lead | Monitor de uptime com palavra-chave e certificado. | 06 §8 |
| B285 | Incluir nos contratos a cláusula de uso de marca em portfólio | Cláusula de uso em portfólio pronta para o advogado. | 09 §3 |
| B299† | Decidir o papel do Medium (canonical no site) e tirar o link do perfil vazio | Decisão 6 mantém os 3 perfis; o cético conferiu GitHub (0 repositórios) e Medium (0 artigos) vazios em 20/10. | 00 §B3, D35, D01 |
| B300 | Publicar os demais posts da pauta a cada 15 dias | Pauta e cadência dos próximos posts. | 12 §7 |
| B303† | Rever o posicionamento de nicho ao ter 3 cases no mesmo setor | Gatilho de nicho (3º case do mesmo setor) no 13 §8 e no fluxo do 09 §2. | 13 §8, 09 §2 |
| B310 | Validar as keywords no Google Keyword Planner | Validação no Keyword Planner com cabeçalho da planilha e listas de termos. | 08 §2 |
| B312 | Iniciar a campanha de indicação 1:1 com 30 a 50 contatos | Roteiro de indicação 1:1 com link UTM e medição no CRM. | 12 §2 |
| B313 | Firmar 3 a 5 parcerias de canal com comissão por escrito | Checklist do acordo de parceria e kit com link UTM. | 12 §3 |
| B314† | Estruturar o Google Ads Search em campanhas por intenção, negativas e destino certo | Campanhas por intenção, negativas e URLs finais; todos os destinos respondem 200. | 07 §3–§5 |
| B315 | Começar a rotina de LinkedIn no perfil pessoal dos sócios | Rotina de LinkedIn com cadência, pilares e UTM. | 12 §6 |
| B316 | Usar Workana/99Freelas de forma oportunista para gerar cases | Uso oportunista de marketplaces registrado na D14. | 12 §5, D14 |
| B317 | Publicar perfis gratuitos no Clutch/GoodFirms com depoimentos verificados | Quando criar Clutch/GoodFirms e critério de avaliações. | 08 §4 |
| B318 | Participar da ACATE e de meetups locais como rede de indicação | Eventos de comunidade com aba no CRM e link com UTM. | 12 §4 |
| B319 | Registrar a decisão de não investir agora em LinkedIn Ads nem GetNinjas | LinkedIn Ads e GetNinjas fora, com gatilho de reavaliação (D13). | 12 §9, D13 |
| B323 | Criar a newsletter mensal para leads com 60+ dias | Newsletter só com opt-in, 3+ posts e Política atualizada. | 04 §6 |
| B325 | Configurar o WhatsApp Business: saudação, ausência e respostas rápidas | Saudação, ausência e 8 respostas rápidas do WhatsApp Business. | 04 §7 |
| B326 | Avaliar a migração das tags para o Google Tag Manager | Google Tag Manager: não agora (D11). | 15 D11 |
| B342 | Importar conversões offline no Google Ads (qualificado, reunião, proposta, venda) | Importação offline das conversões; o site já envia o gclid. | 07 §4.4 |
| B343 | Vincular o Search Console ao GA4 | Vínculo Search Console ↔ GA4 passo a passo. | 06 §9 |
| B345 | Registrar as dimensões personalizadas no GA4 | 15 dimensões personalizadas com o parâmetro exato. | 06 §5 |
| B348 | Ativar listas de remarketing (não iniciou, abandonou o wizard, converteu) | 3 públicos de remarketing; o código só liga com consentimento. | 06 §10, D07 |
| B349 | Escolher o cenário de verba e os critérios de escalada | Teto de verba e critérios para aumentar ou pausar (D24). | 07 §6, D24 |
| B350 | Fazer as revisões de 60 e 90 dias trocando estimativas por dado real | Pauta das revisões de 60 e 90 dias. | 13 §7 |
| B351 | Confirmar as premissas de negócio do plano: ticket, capacidade, caixa e responsável pelo SLA | Tabela de premissas do negócio para o dono confirmar. | 02 §1 |
| B353 | Calcular o custo-hora interno real e o piso de margem antes de publicar preço | Planilha de custo-hora e fórmula do preço mínimo. | 02 §3 |
| B355 | Adotar preço fechado como modelo principal e nunca expor preço-hora | Preço fechado; hora só como exceção interna, nunca em proposta. | 02 §4 |
| B356 | Definir o teto acima do qual a descoberta paga é obrigatória | Teto da Descoberta obrigatória (D04) e pacotes (D03). | 02 §5, D03/D04 |
| B357 | Embutir colchão de risco de 20 a 30% e medir horas reais contra as orçadas | Colchão de risco e horas orçadas × realizadas. | 02 §5, 13 §5 |
| B358 | Criar o roteiro fixo do diagnóstico e o template da devolutiva de 1 página | Roteiro de 45 minutos e devolutiva de 1 página. | 01 §4–§6 |
| B359† | Definir o limite semanal de diagnósticos e a regra para quando estourar | Limite semanal de diagnósticos e regra de espera; diagnóstico continua gratuito. | 01 §7, D19 |
| B363 | Padronizar a proposta comercial e apresentá-la ao vivo | Modelos de proposta por oferta, apresentação ao vivo e aba Propostas no CRM. | 02 §7–§9, 05 §5 |
| B364 | Implantar follow-up em D+3, D+7 e D+14 com lembrete automático | Follow-up em D+3, D+7 e D+14 com lembrete na planilha. | 04 §4 |
| B365 | Criar templates de escopo detalhado e contrato com cláusulas de proteção | Escopo assinado antes do código e checklist de contrato para o advogado. | 02 §10 |
| B366† | Exigir 30% de entrada antes do kickoff e pagamento por marcos | Entrada antes do kickoff e pagamento por marcos, com colunas no CRM. | 02 §6, 05 §5 |
| B367 | Definir a meta de MRR e a meta de conversão em Sustentação | Meta de MRR e conversão em sustentação. | 13 §1, §5 |
| B368 | Extrair componentes reutilizáveis de problemas recorrentes | Componentes reutilizáveis no ritual trimestral. | 13 §8 |
| B369 | Monitorar a concentração de receita com teto de 25% por cliente | Concentração de receita ≤ 25% por cliente. | 13 §5 |
| B370 | Implantar régua de cobrança e consulta de CNPJ antes de contratos grandes | Régua de cobrança e consulta de CNPJ antes de contrato grande. | 13 §5, 02 §10 |
| B371 | Reduzir a dependência de pessoa-chave com processo documentado | Processo de entrega documentado e bloco semanal de prospecção. | 16, 13 §8 |
| B372 | Pedir depoimento no go-live de todo projeto | Checklist de prova no go-live de todo projeto. | 09 §4 |
| B373 | Estabelecer a linha de base de leads/mês e a meta de +30% em 90 dias | Linha de base de leads e meta de 90 dias. | 06 §2, 13 §2 |
| B374 | Medir o % de leads A+B (qualidade, não volume) | % A+B pelo score, no evento e no CRM. | 06 §6, 05 §8 |
| B375 | Medir no CRM as conversões do funil comercial e o ciclo de venda | Relatórios do funil comercial com fórmulas. | 05 §8 |
| B376 | Montar o painel de KPIs financeiros | Painel de KPIs financeiros. | 13 §1, §5 |
| B377 | Instituir os rituais comerciais semanal, mensal e trimestral | Rituais semanal, mensal e trimestral com ata. | 13 §6 |
| B380 | Confirmar em produção que o Netlify detecta o form 'briefing' e fazer um envio real | Envio real em produção passo a passo; forms estáticos no build. | 05 §2 |
| B384 | Preparar NDA padrão e respostas prontas para questionário de segurança | NDA e respostas de segurança; a flag nda só liga com os 2 documentos. | 02 §11 |
| B385† | Decidir a família tipográfica da marca (Motiva ou sans variável + mono) | Motiva Sans 300/700 + mono do sistema, conferido no navegador; aguarda o 'sim' na D40. | 15 D40 |
| B387 | Entrar nas listas de 'melhores empresas de desenvolvimento de software' | Listas de 'melhores empresas' só depois de 1 case publicado. | 08 §5 |

### Fora de escopo por decisão (28)

O que o backlog pedia contraria uma decisão do dono ou do BLUEPRINT. Onde havia parte compatível, ela foi feita.

| ID | Item | Por que saiu | Decisão |
|---|---|---|---|
| B019 | Capturar o contato cedo (passo 2) e tornar opcionais os demais passos do wizard | Contato só depois do resumo; P3 opcional e rascunho salvo a cada passo. | BLUEPRINT §2.4, §7.4 |
| B041 | Empacotar a oferta Squad Dedicado e sua página (/servicos/consultoria-react) só se houver capacidade | Squad não é oferta pública; nenhuma opção de alocação no wizard. | Decisão 2; §7.3; D02 |
| B050 | Enriquecer o evento de etapa do wizard com as opções escolhidas e o tempo no passo | Nenhum valor de resposta antes do envio; lead_submitted traz as opções. | CONTRACT §8; Política |
| B069 | Mostrar o impacto de prazo de cada recurso adicional no wizard | As 'opções adicionais' saíram do wizard; prazo por recurso seria número não confirmado. | §7.3, §12 |
| B071 | Tornar o WhatsApp (com DDD) o campo de contato principal e o e-mail opcional | E-mail obrigatório; WhatsApp é o canal padrão e o telefone só é exigido nesse canal. | §7.5, §15.3 |
| B073 | Reescrever a tela de sucesso com próximo passo e prazo concreto de resposta | Tela 'Pedido recebido' com próximos passos; prazo numérico de resposta é proibido. | §7.8, §12 |
| B074 | Enviar e-mail transacional de confirmação (D0) ao lead com resumo e próximo passo | Não há e-mail automático ao lead; o primeiro contato é humano. | §7.8 |
| B083 | Exibir o botão de voltar ao topo no mobile sem colidir com o WhatsApp | Sem botão de voltar ao topo: a barra fixa ocupa esse lugar no mobile. | §8.2 |
| B087 | Criar o CTA final da Home com horário de atendimento e prazo de resposta | CTA final completo; horário e prazo de resposta não são publicados. | §12; playbook 04 §1 |
| B106 | Importar o evento de lead do GA4 como conversão principal do Ads e remover a função global | Conversão do Ads por evento, com conversão por URL em paralelo por 30 dias. | §10.2, §7.6 |
| B111 | Empacotar e publicar a oferta MVP em /servicos/mvp | /servicos/mvp existe; duração de MVP e garantia são proibidas. | §12 |
| B122 | Criar calculadora pública de estimativa (escopo para faixa e prazo) | Calculadora pública contraria a decisão 3 (nenhum preço publicado). | Decisão 3; §1.3 |
| B123 | Criar landing pages por segmento para o Google Ads | Páginas de serviço são as landing pages do Ads; reavaliar com 3 cases do mesmo setor. | §6.5; playbook 07 §8 |
| B136 | Tornar a pergunta 1 de seleção única com avanço automático | Seleção única feita; avanço automático vetado (WCAG 3.2.2). | §7.2 (WCAG 3.2.2) |
| B141 | Oferecer 'guardar e receber o link por e-mail' no meio do wizard | Pedir e-mail no meio do wizard quebra 'valor antes do dado'; a retomada é local. | §2.4, §7.10 |
| B146 | Ajustar o rótulo do WhatsApp fora do horário comercial | Rótulo com horário seria prazo de resposta publicado. | §12 |
| B165 | Empilhar os botões do wizard no mobile, com o primário embaixo e largura total | Barra fixa com 'Voltar' em texto e 'Continuar' ~70%, como manda o §7.2. | §7.2 |
| B228 | Adicionar métricas de prova no hero (MetricStat), só com números verdadeiros | Nenhum número no hero além de 45 min e 2 semanas; métrica só em case com fonte. | §6.1, §12 |
| B282 | Reescrever o diferencial 'Inovação Constante' como 'Tecnologia madura, escolhida a dedo' | Stack não é fato confirmado; tecnologia aparece na ficha de cada case. | §1.1, §1.5 |
| B286 | Medir e publicar o tempo 'da assinatura ao primeiro sistema no ar' | Tempo até o 1º sistema não é publicado; medição interna no 13 §8. | §12 |
| B289 | Reescrever o título e o texto do bloco de contato com instrução e prazo | /contato reescrito; prazo de resposta numérico é proibido. | §6.9, §12 |
| B301 | Criar a isca 'modelo de escopo de projeto' com captura de e-mail | Isca com captura de e-mail fora dos 2 formulários previstos (D17). | §7.10; D17 |
| B311 | Criar o lead magnet 'Checklist: 12 perguntas antes de contratar desenvolvimento' | A régua de perguntas já está aberta em /quanto-custa, sem pedir e-mail. | §6.6; D17 |
| B320 | Rodar o teste A/B do wizard de 4 passos contra 2 passos | Wizard tem sempre 6 perguntas. | §7.2 |
| B321 | Rodar o teste A/B com e sem faixa de preço na Home | Sem faixa publicada não existe a variante 'com preço'. | Decisão 3 |
| B322 | Rodar o teste A/B da captura de e-mail no passo 1 contra no fim | Pedir e-mail no passo 1 contraria 'valor antes do dado'. | §2.4 |
| B324 | Separar a sequência de topo de funil para quem baixou isca e não pediu proposta | Sem isca não há público de topo de funil. | Decisão 3; D17 |
| B333 | Rastrear cada seleção de opção (wizard_option_select) | Rastrear cada opção levaria resposta antes do envio, o que a Política proíbe. | CONTRACT §8 |

### Resolvidos (234)

Resolvido e provado no build de produção, no navegador ou por teste automatizado.

| ID | Item | Prova |
|---|---|---|
| B001 | Reescrever o hero (h1, subtítulo e eyebrow) com promessa específica e prova | H1 'Software sob medida com escopo, prazo e preço combinados antes de começar.' nos 3 idiomas; meta e OG com a mesma promessa. |
| B002 | Trocar o par de CTAs do hero por ação de baixo esforço (briefing/WhatsApp/diagnóstico) e secundário de prova | Hero com 'Pedir diagnóstico gratuito' e WhatsApp secundário, ambos rastreados. |
| B003 | Cortar da Home o bloco Missão e os blocos institucionais redundantes | Home na ordem do BLUEPRINT §6.1, sem Missão; 0 link quebrado em 106 páginas. |
| B004 | Remover ou reescrever o MiddleBlock 'Transforme Ideias em Realidade' | MiddleBlock virou a seção do método, com 4 etapas e CTA rastreado. |
| B005 | Transformar 'Nossos Serviços' em cards de oferta com escopo, prazo e link (wizard/página) | 5 serviços com a dor do cliente e link próprio; CTAs levam ao wizard com ?servico=. |
| B008 | Transformar a seção Contato da Home em bloco de conversão | CTA final na Home e formulário curto em /contato (Netlify Forms). |
| B009 | Reescrever a intro de /projects sem emoji, com promessa honesta de esforço e foco no momento do cliente | /orcamento sem emoji, com 'Responda 6 perguntas' e sem prometer orçamento. |
| B010 | Renomear /projects (briefing/orcamento) com redirect 301 e atualizar sitemap e Ads | /projects → /orcamento com 301; sitemap sem /projects. |
| B012 | Adicionar indicador de progresso (Passo X de N) ao wizard | 'Pergunta N de 6' com progressbar acessível e anúncio para leitor de tela. |
| B013 | Adicionar a opção 'Ainda não sei / quero ajuda' nas etapas do wizard (com saída para WhatsApp) | Saída 'não sei' em toda pergunta e WhatsApp desde a 1ª. |
| B014 | Reescrever a pergunta 1 do wizard em linguagem de negócio ('em que ponto você está') | P1 'Em que ponto você está?' com 5 estágios e seleção única. |
| B015 | Adicionar etapa/campo de faixa de investimento com opção 'ainda não tenho ideia' | P5 com as faixas da decisão 7 só dentro da ilha; a faixa chega ao Netlify. |
| B016 | Adicionar pergunta de prazo/urgência ('quando precisa estar funcionando') | P4 de prazo com data-limite opcional; entra no score. |
| B017 | Adicionar campo opcional 'Empresa' (e site) ao formulário final | Campo 'Empresa (opcional)' chega no envio. |
| B018 | Capturar e persistir a origem do lead (UTM, gclid, referrer, página de entrada) e enviá-la com o lead | UTM, gclid, referrer e página de entrada vão junto com o lead. |
| B020 | Dar ação aos botões da tela de sucesso do formulário | O sucesso leva a /orcamento/enviado, com saídas reais. |
| B021 | Eliminar os crashes de getElementById (header, ScrollToTop, MiddleBlock, ContentBlock) com helper de scroll e ErrorBoundary | Navegação por rotas e âncoras; 0 erro de console em 166 capturas. |
| B022 | Despublicar o blog fictício (rotas, link do rodapé e posts placeholder) | Blog fictício fora de produção; /blog faz 302 e /post/* faz 301. |
| B023 | Remover do rodapé os links mortos (Press, Careers & Culture, About apontando para /) | Rodapé só com links que respondem 200. |
| B024 | Corrigir as meta tags do index.html (lang/og:locale pt-BR, og:image 1200x630, twitter:*, sem keywords nem og:url duplicada) | lang pt-BR, og:image 1200×630 e twitter:* corretos, sem keywords. |
| B025 | Publicar sitemap.xml e declará-lo no robots.txt | sitemap-index.xml com 39 URLs e hreflang, declarado no robots.txt. |
| B026 | Gerar title, description e OG próprios por rota | Title, description e canonical únicos nas 45 páginas. |
| B027 | Usar pt como fallbackLng do i18next | pt-BR é a raiz estática; sem detector de idioma no navegador. |
| B028 | Decidir o futuro de en/es e retirar do seletor os idiomas sem demanda | pt/en/es mantidos com paridade total e nenhum texto em português em en/es. |
| B036 | Criar páginas de serviço /servicos/:slug com escopo, prazo, faixa de preço e FAQ | /servicos e 5 páginas de serviço nos 3 idiomas, com FAQ e CTAs rastreados. |
| B038 | Criar a seção 'Como trabalhamos' com etapas, entregáveis e prazo de cada uma | Seção do método com 4 etapas, 'Você recebe' e 'Onde você decide'. |
| B039 | Criar a seção FAQ de objeções com acordeão acessível e JSON-LD FAQPage | FAQ de 8 perguntas em `<details>` e FAQPage JSON-LD igual ao visível. |
| B040 | Criar a página de obrigado com protocolo, prazo de resposta e atalho para WhatsApp | /orcamento/enviado com protocolo, próximos passos e WhatsApp; noindex. |
| B042 | Classificar o lead automaticamente (MQL / A-B-C-D) e enviar a classe junto | Score A/B/C/D com corte de MQL em tier_2; vai no assunto e no evento. |
| B046 | Disparar page_view a cada navegação da SPA | Site multipágina: page_view nativo em cada página. |
| B047 | Rastrear cliques nos CTAs principais (cta_click com tipo/origem) e completar os eventos de funil restantes | cta_click {cta_id, origem} em todos os CTAs; nenhum link sem rastreio. |
| B048 | Medir o clique em e-mail em todos os mailto, inclusive o do rodapé | Sem mailto; o botão 'Copiar' dispara email_copy com a origem. |
| B049 | Registrar o início do wizard (wizard_start) | wizard_start uma vez; retomada gera wizard_resume. |
| B051 | Medir o abandono do wizard (wizard_abandon) | wizard_abandon por beacon ao fechar a aba, sem valor de resposta. |
| B052 | Enriquecer o evento de lead (generate_lead) com valor, serviços, orçamento e prazo | lead_submitted com score, estágio, tipo, prazo, faixa e papel, sem dado pessoal. |
| B059 | Persistir o estado do wizard em localStorage a cada passo e restaurar ao voltar | Rascunho em localStorage por 30 dias, com banner de retomada. |
| B060 | Reescrever o copy institucional da Home com fatos verificáveis e oferta por estágio do cliente | Copy só com fatos confirmados; a linha do método é igual em todo o site. |
| B061 | Renderizar botões e seções do ContentBlock pela presença de dados, não pela direção (sem wrappers vazios) | Seções próprias sem contêiner vazio; serviços levam ao wizard. |
| B062 | Validar campos inline no blur com mensagem por campo (aria-describedby) e manter 'Enviar' habilitado | Validação no blur com aria-describedby, foco no 1º campo inválido e botão habilitado. |
| B063 | Resolver a URL do SvgIcon no render, sem 'Loading...' nem render duplo | Ícones SVG inline; sem 'Loading...'. |
| B064 | Mostrar a navegação horizontal no desktop e deixar o hambúrguer só no mobile | Menu horizontal no desktop; 'Menu' só abaixo de 1024px. |
| B065 | Instrumentar eventos em cada etapa do wizard | wizard_step em cada etapa, além de back, skip, resume, resumo e contato. |
| B066 | Colocar CTA primário visível no header de todas as rotas | CTA primário no header (desktop) e na barra fixa (mobile) em toda rota. |
| B067 | Garantir um único `<h1>` por página e hierarquia de headings | Exatamente 1 H1 por página em 212 carregamentos; o build trava se não houver. |
| B068 | Trocar as ilustrações flat genéricas por screenshots/artefatos reais | Sem ilustração de banco; o hero usa o diagrama autoral do método. |
| B070 | Reescrever títulos, opções e microcopy das perguntas do wizard (sem superlativos) | Perguntas curtas, sem superlativos, e o apoio diz o modo de seleção. |
| B072 | Pré-preencher a mensagem do WhatsApp com o contexto da página de origem | A mensagem do WhatsApp muda conforme a página, nos 3 idiomas. |
| B075 | Restaurar o indicador de foco visível em todo o site | Anel de foco visível em todas as paradas (contraste ≥ 8,47:1). |
| B076 | Trocar as bandeiras por um seletor de idioma textual e acessível | Seletor de idioma textual, com aria-current e alvo de 44px. |
| B078 | Respeitar prefers-reduced-motion no site inteiro | Com reduced-motion, 0 elemento animado. |
| B079 | Consolidar os breakpoints em uma escala única mobile-first | Escala única de breakpoints, travada por teste. |
| B080 | Mostrar os ícones sociais do rodapé também no mobile | GitHub, LinkedIn e Medium visíveis no rodapé a 320 e 375px. |
| B081 | Remover overflow-x:hidden do body e corrigir os estouros na origem | Rolagem horizontal 0 em 106 páginas e 8 larguras. |
| B082 | Remover o div espaçador Empty (53px) do rodapé e usar gap/margin | Rodapé alinhado por grid, sem o espaçador de 53px. |
| B084 | Garantir alvo de toque mínimo de 44x44px (bandeiras, header, footer, scroll) | Alvos de toque ≥ 44px no header, rodapé, menu, barra fixa e wizard. |
| B085 | Servir as fontes em woff2 (subset) com font-display: swap e preload | 2 fontes woff2 de ~12 KB com swap e preload. |
| B090 | Trocar react-awesome-reveal por animação CSS/IntersectionObserver leve | Sem react-awesome-reveal; animações respeitam reduced-motion. |
| B091 | Otimizar o contact-us.png (~287 KB) para WebP/AVIF com srcset e lazy | contact-us.png saiu; /contato transfere 0 KB de imagem. |
| B092 | Otimizar com SVGO os SVGs (brasil.svg de 32 KB e ilustrações) | Bandeiras e ilustrações saíram; todo SVG tem menos de 5 KB. |
| B093 | Trocar o favicon emoji por um favicon de marca | Favicon {L} da marca em SVG, ICO e apple-touch. |
| B094 | Remover o import global de antd/dist/antd.css | antd removido; CSS ≤ 15 KiB gzip por página, travado no build. |
| B095 | Trocar o import * as AntIcons por um registro explícito de ícones | Registro explícito de ícones; o maior chunk (React, só no wizard) tem 209 KB. |
| B096 | Alinhar @types/react com o React 18 | React 19 com @types 19; astro check 0/0/0. |
| B097 | Adicionar orçamento de bundle/Lighthouse CI no PR | Orçamento de peso por página derruba o build (testado com CSS e JS extras). |
| B099 | Fixar pt-BR como idioma padrão servido e indexado, sem idioma misturado, até haver URL por idioma | pt-BR padrão; ?lng= vira 301; nenhum português em /en e /es. |
| B100 | Criar rotas por idioma (/, /en, /es) com hreflang recíproco, ou despublicar en/es | Rotas por idioma com hreflang recíproco; 0 problema em 42 páginas. |
| B102 | Apagar os arquivos soltos da raiz e o project-questions.json duplicado | Arquivos soltos da raiz e project-questions.json apagados. |
| B104 | Tirar do index.html o snippet inline e bloqueante do New Relic | New Relic fora do HTML, com defer e só em produção. |
| B105 | Reescrever a tela de erro do envio priorizando o WhatsApp e tranquilizando o lead | Tela de erro com 'Tentar de novo', WhatsApp com o resumo, 'Copiar minhas respostas' e e-mail. |
| B108 | Reescrever o rótulo da descrição como 'Qual problema você quer resolver?' e o botão de envio | P3 'O que mais pesa hoje?' e campo opcional; botão 'Pedir meu diagnóstico gratuito'. |
| B112 | Definir a oferta 'Diagnóstico gratuito' (30 a 45 min com devolutiva) como CTA principal | Diagnóstico gratuito de 45 min como CTA único em toda a Home. |
| B115 | Criar camada única de analytics (track) no lugar da chamada direta de conversão | Toda medição passa por src/lib/analytics.ts. |
| B116 | Instrumentar whatsapp_click com a origem do clique | 300 links wa.me com data-track e origem distinta. |
| B117 | Instrumentar case_view por slug | Case é página própria: page_view com o slug. |
| B124 | Colocar o wizard de orçamento na navegação principal | Link para o wizard no header ou no menu das 106 páginas. |
| B125 | Tornar os grupos da pergunta 3 rótulos, não cards falsamente clicáveis | Cada pergunta é um fieldset com opções nativas; nada falsamente clicável. |
| B126 | Permitir pular perguntas opcionais e explicar o botão desabilitado | 'Continuar' sempre habilitado com erro inline; 'Pular' nas opcionais. |
| B127 | Definir type, inputMode e autoComplete nos campos do formulário | type, inputMode e autoComplete corretos no wizard e no /contato. |
| B128 | Corrigir a página 404 (em inglês e com Result do antd) | 404 em pt/en/es com links úteis e noindex. |
| B129 | Manter `<html lang>` sincronizado com o idioma ativo do i18next | `<html lang>` certo nas 212 cargas; trocar de idioma é navegar. |
| B130 | Remover o botão 'Leia Mais' do blog, que só rolava a página | Nenhum 'Leia mais'; cards do blog são links. |
| B131 | Trocar o menu de âncoras por navegação por rota (Serviços, Cases, Como trabalhamos) | Menu só com rotas reais; nenhum href '#'. |
| B132 | Adicionar o WhatsApp como CTA secundário no header e ao lado de cada CTA | WhatsApp no header, menu, barra fixa, hero e CTA final, cada um com origem própria. |
| B133 | Trocar os itens de menu por `<Link>` reais do react-router | Itens do menu são `<a href>` reais; Cmd+clique abre nova aba. |
| B134† | Criar a página /como-trabalhamos com processo, prazos e time | /como-trabalhamos com 4 etapas, entregáveis, durações confirmadas e FAQ. |
| B135 | Dar uma URL para cada etapa do wizard | ?etapa= com pushState; o voltar do navegador funciona. |
| B137 | Sinalizar a seleção com checkbox visível e contador, não só por cor | Seleção com check, borda dupla e negrito; contador visível. |
| B139 | Mostrar o resumo editável do escopo antes do envio | Resumo editável com 'Alterar' antes do contato. |
| B142 | Migrar o schema do wizard para IDs semânticos | IDs semânticos no wizard (problem_unclear, mobile_app…). |
| B143 | Recolher a descrição livre e rotulá-la como opcional | Detalhes recolhidos atrás de '+ Quer contar mais alguma coisa? (opcional)'. |
| B144 | Aplicar máscara de telefone brasileiro | Máscara (48) 99999-8888 no wizard e no /contato. |
| B145 | Tirar o mailto como CTA e exibir o e-mail como texto copiável | E-mail como texto com 'Copiar'; 0 mailto. |
| B147 | Exibir um número de protocolo na confirmação | Protocolo LEM-AAAAMMDD-XXXX na tela e no registro do Netlify. |
| B148 | Mostrar o resumo do escopo na confirmação, com opção de receber cópia | Resumo do pedido na confirmação, com 'Copiar resumo'. |
| B150 | Limpar o rascunho do orçamento só depois do sucesso confirmado | O rascunho só é apagado no sucesso; no erro, as 6 respostas ficam. |
| B151 | Impedir que 'Voltar ao início' na tela de erro descarte as respostas | No erro, as respostas ficam e o CTA vira 'Continuar meu pedido'. |
| B152 | Tornar o botão hambúrguer acessível | Botão 'Menu' com aria-expanded e aria-controls, operável por teclado. |
| B153 | Estruturar os cards do wizard como radio/checkbox dentro de fieldset | fieldset + legend + radio/checkbox nativos. |
| B154 | Usar links reais nos cards de post do blog quando a listagem voltar | Cards de post e de case são um único link. |
| B155 | Corrigir o contraste do botão desabilitado | Nenhum botão desabilitado no site. |
| B156 | Dar uma borda perceptível ao botão secundário | Botão outline com borda de contraste ≥ 3:1. |
| B157 | Corrigir os textos alternativos dos links do rodapé | 0 violação WCAG (axe) em 212 cargas; rótulos claros no rodapé. |
| B158 | Fazer o Enter num campo enviar o formulário | Enter envia o formulário no wizard e no /contato. |
| B159 | Garantir o anúncio das mudanças de estado do envio (loading, sucesso, erro) | Região role=status anuncia envio, erro e sucesso. |
| B160 | Adicionar skip-link e landmark `<main>` | Skip link e um único `<main>` em todas as páginas. |
| B161 | Evitar que os cards do wizard estourem a viewport em 320px | Wizard sem estouro a 320px em todas as etapas. |
| B162 | Empilhar o layout de 2 colunas do ContentBlock entre 576 e 768px | Nada lado a lado a 600px; 2 colunas só a partir de 640px, e só para cards. |
| B163 | Desaninhar as colunas do rodapé | Rodapé em 1 coluna no mobile, com largura total. |
| B164 | Reduzir o corpo de texto no mobile para manter a hierarquia | Razão H1/corpo ≥ 1,6 no mobile. |
| B166 | Pré-selecionar o serviço no wizard via link (?servico=...) | ?servico= pré-marca a P2 (ou a P1, em sustentação). |
| B168 | Criar src/styles/tokens.ts e envolver a app em ThemeProvider tipado | tokens.css como fonte única; nenhum hex fora dos tokens. |
| B169 | Unificar os azuis da marca em tokens brand | Azuis antigos saíram; texto, marca e ação têm papéis separados. |
| B170 | Separar a semântica do vermelho: erro, selecionado e hover | Selecionado em azul da marca com check; vermelho só em erro. |
| B171 | Remover o sublinhado ondulado vermelho do hover do menu e do footer | Sem sublinhado ondulado; o hover só troca a cor. |
| B172 | Consolidar os cinzas de superfície e borda em poucos tokens neutros | Neutros reduzidos a poucos tokens de superfície e borda. |
| B173 | Unificar os cinzas de texto secundário | Texto secundário com 2 tokens, ambos AA. |
| B174 | Eliminar o preto puro (#000) do MinTitle e dos links do footer | Nenhum texto em preto puro. |
| B175 | Tirar o azul #1890ff do antd do funil de conversão | Nenhum azul do antd no site. |
| B176 | Declarar Motiva Sans como uma família com pesos 300/700 e eliminar o faux bold | Motiva Sans 300/700 reais, sem negrito sintético. |
| B177 | Trocar o fallback serif dos títulos por uma stack sans-serif | Fallback dos títulos sem serifa. |
| B180 | Criar escala tipográfica modular (h1 a h6 hoje têm todos 36px) | Escala tipográfica com papéis h1–h4, lead e body. |
| B181 | Eliminar tamanhos de fonte avulsos e padronizar unidade e line-height | Todo font-size vem de token. |
| B182 | Adotar escala de espaçamento em grid de 4px | Espaçamento em escala de 4px; nenhum valor literal de layout. |
| B184 | Apagar Input/TextArea mortos ou transformá-los no primitivo Field | Input e TextArea mortos apagados (falta só o git add -A no commit). |
| B185 | Trocar o Container calc(100% - 68px) por gutters de token e variantes de largura | Container com gutter de token e 4 larguras. |
| B186 | Remover a media query vazia de styles.ts | 0 media query vazia. |
| B187 | Unificar as sombras em uma escala e reduzir a sombra do botão | Sombras só por token; botão sem sombra em repouso. |
| B188 | Unificar os raios de borda e remover o radius 3rem morto do Block | Raios só por token. |
| B189 | Trocar transition: all por transições de propriedades explícitas | Nenhum transition: all. |
| B190 | Remover a transition duplicada no Large do footer | Nenhuma transition duplicada no rodapé. |
| B191 | Trocar ease-in por ease-out no hover do menu | Hover com ease-out. |
| B192 | Restringir efeitos de hover a dispositivos com ponteiro fino | Efeitos de hover só com ponteiro fino. |
| B193 | Corrigir o anel de foco dos inputs (aninhamento :focus-within morto) | Anel de foco em todos os campos. |
| B194 | Corrigir o hover de link aninhado morto (a :hover) | Hover de link com cor própria, testado no navegador. |
| B195 | Configurar vite-plugin-svgr para ícones recoloríveis | Ícones SVG inline em currentColor; svgr desnecessário. |
| B196 | Dar dimensões intrínsecas, aspect-ratio e lazy-load às imagens (CLS) | Toda `<img>` com width/height e lazy; CLS 0. |
| B197 | Trocar o logo.png raster do header por SVG | Logo em SVG inline; CLS 0. |
| B198 | Converter o wordmark logo.svg em paths e unificar o logo do header e do footer | Logo em paths, o mesmo componente em todo lugar. |
| B199 | Parar de repetir o notes.svg nas duas colunas da seção Sobre | Nenhuma ilustração repetida. |
| B200 | Remover o twitter.svg sem referência | twitter.svg apagado (falta só o git add -A no commit). |
| B201 | Adicionar preconnect para os domínios de terceiros (gtag e New Relic) | preconnect/dns-prefetch para gtag e New Relic em produção. |
| B202 | Eliminar os casts as any em styled(componente antd) | 0 'as any'. |
| B203 | Criar um Grid/Row/Col próprio em CSS Grid com API compatível | Sem antd; grids nativos em CSS. |
| B204 | Substituir os componentes triviais do antd (Card, Layout.Content, Result, notification) | Sem antd nem styled-components; inputs nativos. |
| B205 | Reescrever o Drawer do header como diálogo nativo com focus-trap e sem !important | Menu mobile em `<dialog>` com focus trap, Esc e retorno do foco. |
| B206 | Reescrever Tag/Alert/Table/Checkbox e o tema Prism da página Post | Case e post sem antd nem Prism. |
| B207 | Corrigir o contraste do âmbar proposto quando usado como texto ou anel de foco | Âmbar nunca como texto sobre fundo claro; 116 pares de contraste testados. |
| B208 | Implementar tema escuro com toggle e persistência sem flash | Tema escuro com toggle, persistência e sem flash. |
| B209 | Reescrever o Button com variantes, tamanhos, estados, loading e versão link | Button com 5 variantes e 3 tamanhos; nunca `<button>` dentro de `<a>`. |
| B210 | Criar os primitivos Text e Heading que desacoplam semântica de tamanho | Tamanho vem de token de papel, separado da tag. |
| B213 | Criar o StickyCta (barra fixa no mobile, botão no header após scroll) | Barra fixa no mobile que some perto de outro CTA, de formulário ou do rodapé. |
| B216 | Usar grid explícito com linhas de 1px e âncoras numeradas em mono | Seções numeradas em mono com divisórias de 1px. |
| B217 | Alternar a densidade entre seções (densas com prova, respiradas com mensagem) | Ritmo das seções alterna compact/default/spacious e superfícies. |
| B218 | Criar um tema Prism customizado com os tokens | Tema de código (Shiki) com os tokens da marca. |
| B220 | Usar só foto real da equipe, sem stock de pessoas | Sem foto de banco; foto de pessoa só do time real. |
| B224 | Ajustar o header: sombra só após scroll, blur, borda sutil e altura 72/64px | Header com sombra e blur só depois da rolagem. |
| B225 | Levar 'Florianópolis, SC' do rodapé para o hero | Cidade no eyebrow do hero nos 3 idiomas (hoje 'São Paulo, SP', pela D38). |
| B227 | Reestruturar a Home na ordem promessa, prova, método, oferta, objeção e ação | Home na ordem promessa → problema → método → oferta → prova → objeção → ação. |
| B229 | Montar o layout do hero 7+5 com painel de código real | Hero 7+5 sem 100vh, LCP no H1; painel de código trocado pelo diagrama do método. |
| B232 | Trocar process.env por import.meta.env | import.meta.env no cliente; astro check 0/0/0. |
| B234 | Dar uma saída de contato real na tela do ErrorBoundary | ErrorBoundary com WhatsApp, 'Começar de novo' e e-mail copiável. |
| B235 | Dar dimensões reais, fetchpriority e preload à imagem do hero | Hero sem imagem; LCP no H1 em ~612 ms com 4G emulada. |
| B237 | Importar estaticamente os componentes da primeira dobra da Home | Home estática, sem lazy(); ~57 KB no total. |
| B238 | Criar os lazy() do Router uma única vez e trocar fallback={null} por skeleton | Sem router SPA; cada rota é HTML pronto. |
| B239 | Consertar o setupFiles do Vitest (src/setupTests.ts não existe) | Vitest com setup válido; suíte verde. |
| B240 | Criar o E2E do caminho do dinheiro em Playwright e rodá-lo diariamente em produção | E2E do caminho do dinheiro verde; cron diário pronto para produção. |
| B241 | Cobrir a lógica pura com cerca de 15 testes Vitest | Testes de validação, envio, WhatsApp e resumo (muito além de 15). |
| B242 | Corrigir o manifest.json, que se identificava como 'Landy - React Template' | manifest 'Lemamon' coerente com o theme-color. |
| B243 | Remover o i18next-xhr-backend (deprecated e sem uso) | Sem i18next; i18n em JSON estático. |
| B244 | Remover o código morto do useForm (fetch para url vazia) | useForm morto apagado. |
| B245 | Remover o validateProps órfão de src/common/types.ts | validateProps apagado. |
| B246 | Apagar o src/react-app-env.d.ts (sobra do CRA) | react-app-env.d.ts apagado. |
| B247 | Apagar o template.json do template Landy | template.json apagado (falta só o git add -A no commit). |
| B249 | Mover typescript, vite, plugins e @types/* para devDependencies | Só 6 dependências de runtime; clone limpo instala e faz o build. |
| B250 | Usar ou remover o vite-tsconfig-paths e acabar com os imports '../../' | Alias @/ nativo; sem vite-tsconfig-paths. |
| B252 | Zerar as vulnerabilidades crítica e altas das dependências | 0 vulnerabilidade (yarn audit e base de advisories do npm). |
| B255 | Fixar o gerenciador de pacotes e alinhar o lockfile (Yarn 4 contra yarn.lock v1) | Yarn 1.22.22 fixado; install --frozen-lockfile no CI e no Netlify. |
| B256 | Aprovar a migração para Astro | Astro adotado; JS de entrada de 5–7 KB gzip fora do wizard e LCP < 0,7 s. |
| B257 | Executar a fase 1 do Astro: andaime com @astrojs/react, mdx e sitemap | Astro com react, mdx e sitemap; 45 páginas no build. |
| B258 | Executar a fase 2 do Astro: Layout com `<head>` completo por página e Home/Header/Footer em .astro | `<head>` completo por página; Home, Header e Footer em .astro. |
| B259 | Executar a fase 3 do Astro: ProjectBuilder e ContactForm como ilha client:load | Wizard é a única ilha; form 'briefing' detectável pelo Netlify. |
| B260 | Executar a fase 4 do Astro: Content Collections em MDX para cases e blog com schema Zod | Coleções MDX de cases e posts com schema que quebra o build. |
| B261 | Executar a fase 5 do Astro: cortar antd, i18next, react-awesome-reveal, prismjs e react-router | Dependências antigas cortadas; só o wizard carrega React. |
| B262 | Executar a fase 6 do Astro: redirects das URLs antigas no corte de tráfego | Todas as rotas antigas com redirect no netlify.toml. |
| B263 | Corrigir a colisão de colunas da tabela no renderizador de Post | Tabelas em MDX renderizam corretamente. |
| B264 | Trocar as chaves opacas do translation.json por chaves semânticas | Chaves de i18n semânticas, com paridade nos 3 idiomas. |
| B266 | Trocar o listener de scroll do ScrollToTop por IntersectionObserver | IntersectionObserver no lugar do listener de scroll. |
| B267 | Adicionar timeout de 12 s e retry com backoff no envio do lead | 12 s por tentativa, 3 tentativas com backoff. |
| B268 | Validar nome, e-mail e telefone no cliente antes de enviar | Nome, e-mail e telefone validados antes do envio. |
| B269 | Completar o anti-spam com checagem de tempo mínimo de preenchimento | Tempo mínimo de 3 s e honeypot, sem captcha. |
| B270 | Separar erro de validação de erro de rede na interface | Erro de validação não abre a tela de erro de rede. |
| B271 | Tirar a URL fixa do código e documentar as env vars num .env.example | Nenhuma URL fixa de backend; .env.example documentado. |
| B272 | Reportar falhas do lead ao monitoramento (New Relic), não só ao GA4 | lead_failed vai ao New Relic mesmo sem GA4. |
| B274 | Reavaliar o New Relic: manter só error tracking, sem session replay (ou trocar por Sentry) | New Relic sem session replay, só erros e PageAction. |
| B276 | Recriar a CI de qualidade no GitHub Actions (lint, typecheck, unit, build, e2e) | CI com lint, typecheck, unit, build e E2E (falta o commit e a proteção da main). |
| B277 | Isolar os deploy previews: sem lead real, sem GA4 e sem conversão do Ads | Deploy preview sem lead real, sem GA4 e sem Ads. |
| B278 | Decidir o posicionamento de topo e registrá-lo | Posicionamento 'escopo, prazo e preço combinados antes' no H1, na meta e no OG. |
| B279 | Confirmar com o dono os fatos marcados [CONFIRMAR] antes de publicar o copy | Só fatos confirmados no copy; 0 [CONFIRMAR] no build. |
| B280 | Dar ao wizard um rótulo honesto ('Montar o escopo do meu projeto — 4 perguntas') | Rótulos dizem a ação; o esforço ('6 perguntas') aparece antes do clique. |
| B281 | Criar a seção 'Problema' com cards de dor e CTA de conversa | Seção 'Problema' com 5 cards e CTA rastreado. |
| B290 | Reescrever 'anyQuestions' e 'Let's Chat' do rodapé e eliminar a frase duplicada | Rodapé sem 'Let's Chat'; nenhuma frase duplicada indevida. |
| B291 | Tirar 'squad dedicado' da mensagem de topo e tratá-lo como continuidade | Nenhum 'squad' no topo; continuidade = Sustentação. |
| B292 | Corrigir 'Product' para 'Services' no EN | 'Services' no menu em inglês. |
| B293 | Corrigir 'Do you have any question?' para o plural no EN | 'Any question' eliminado. |
| B294 | Unificar o tratamento por 'tú' no ES e tirar o calco '¡siéntase libre!' | 'tú' em todo o espanhol. |
| B295 | Garantir que toda chave usada no código exista nos translation.json | Chave faltante quebra o build; paridade conferida. |
| B296 | Detectar o idioma como sugestão (banner), sem trocar o conteúdo automaticamente | Sugestão de idioma por banner, sem redirecionar. |
| B297 | Mover um post fictício para __fixtures__ fora do bundle, se os testes precisarem | Fixtures fora do bundle; 0 vazamento no build de produção. |
| B302 | Adotar o guia de tom de voz e o teste da negação na revisão de copy | Checklist de tom de voz aplicado; 0 termo proibido no copy. |
| B304 | Corrigir o canonical estático que aponta /projects para a Home | Canonical próprio em cada página; /projects é redirect. |
| B305 | Redirecionar com 301 /lemamon e /home para / | /lemamon e /home → / com 301. |
| B306 | Adicionar JSON-LD Organization/ProfessionalService com Florianópolis | JSON-LD Organization/ProfessionalService sem dado inventado. |
| B307 | Adicionar JSON-LD FAQPage nas páginas de serviço | FAQPage nas páginas de serviço igual ao FAQ visível. |
| B308 | Completar o manifest.json com ícones 192/512 e theme-color coerente | Ícones 192/512/maskable e theme-color coerentes. |
| B309 | Pré-renderizar as rotas e entregar HTML com conteúdo a crawlers sem JS | HTML estático com o conteúdo, legível sem JS. |
| B327 | Medir a profundidade de scroll da Home (25/50/75/90%) | scroll_depth 25/50/75/90% uma vez por sessão. |
| B329 | Rastrear a troca de idioma (language_change) | language_change com idioma de origem e destino. |
| B330 | Disparar wizard_view na intro de /projects | wizard_view com entry_source e has_draft. |
| B331 | Completar wizard_start com entry_source e não inflar o evento no reinício | wizard_start uma vez; recomeço gera wizard_restart. |
| B332 | Disparar wizard_step_view ao exibir cada passo | wizard_step ao exibir cada passo. |
| B334 | Rastrear o retorno de passo (wizard_step_back) | wizard_back ao voltar. |
| B335 | Medir a fricção ao tentar avançar sem escolher (wizard_blocked) | wizard_blocked ao tentar avançar sem resposta. |
| B336 | Disparar form_view quando o formulário final aparece | wizard_reach_form ao abrir o contato. |
| B337 | Rastrear o preenchimento de cada campo do formulário | form_field_complete por campo, sem o valor digitado. |
| B338 | Registrar o erro de validação do e-mail visto pelo usuário | form_validation_error com campo e tipo de erro. |
| B339 | Disparar generate_lead_attempt com event_id antes do envio | lead_attempt com event_id = protocolo antes do envio. |
| B340 | Registrar a falha de envio do lead | lead_failed numa fila offline, enviada quando a rede volta. |
| B341† | Disparar lead_success_view na tela de sucesso | lead_success_view uma vez por pedido, além do page_view de /orcamento/enviado. |
| B352 | Fazer a resposta da pergunta 1 mudar o fluxo e marcar a oferta do lead | P1 'sistema no ar' muda as perguntas seguintes e o resumo. |
| B360 | Seguir as regras de desenho da qualificação: no fim, por faixas, com saída digna | Qualificação no fim, por faixas, com saída 'não sei'. |
| B361 | Incluir 'Seu papel nessa decisão' no formulário final | P6 'Qual é o seu papel nessa decisão?' entra no score. |
| B381 | Manter o form estático do index.html em dia com cada campo novo do lead | FORM_FIELDS é a fonte única; teste de mutação pega campo novo. |
| B382 | Reescrever os textos de estado do envio que falam em 'criar projeto' | Textos de estado sem 'criar projeto'. |
| B386 | Atualizar o TypeScript 4.9 para 5.x | TypeScript 6; astro check 0/0/0. |

---

## (d) O que depende do dono, em ordem de alavancagem

A ordem é pelo efeito sobre conseguir clientes: primeiro o que põe o site no ar e para a perda de leads, depois o que tira as objeções que o painel inteiro levantou, por último o que enriquece. Todo campo citado é de `dados/dono.json`, exceto quando indicado. O passo a passo de cada campo está no [playbook 00](../playbooks/00-DADOS-DO-DONO.md).

### 1. Pôr o site no ar (hoje cada lead do formulário se perde)

| Campo | O que preencher | Destrava |
|---|---|---|
| `privacidade.baseAnuncios` | `"consentimento"` (recomendado) ou `"legitimo_interesse"`, decidido com o advogado (D05). Com `"consentimento"`, o aviso de cookies e o Consent Mode v2 já prontos entram sozinhos | Trava de build; B344 |
| `privacidade.encarregado` | `{ "nome", "email" }` reais do encarregado de dados | Trava de build; B089 |
| `privacidade.prazos.retencaoPedidos`, `.ga4`, `.googleAds`, `.conversoesGoogleAds`, `.newRelic`, `.logsHospedagem` | Prazo de guarda de cada um, em pt/en/es | Trava de build; B089 |
| `privacidade.atualizadaEm` | Data da revisão da Política, `AAAA-MM-DD` | Trava de build; B089 |
| `empresa.razaoSocial`, `empresa.cnpj` | **Já preenchidos** (D39). Falta conferir contra o cartão CNPJ a grafia exata e que a sede é São Paulo/SP, porque o site afirma "São Paulo, SP" ao lado do CNPJ | B088, B113, B114 |
| Variável do Netlify `PUBLIC_WHATSAPP_NUMBER` | Só dígitos, `55` + DDD + número, em todos os contextos. **O build passa sem ela**, e aí nenhum botão de WhatsApp aparece | B007, B362 |
| Variável do Netlify `PUBLIC_GA4_ID` | Só no contexto Production (playbook 06 §2) | B045, B373 |
| Commit | Fazer o commit da árvore nova com `git add -A`. Há 74 renomeações para `legacy/` no índice: um commit sem `-A` gravaria `legacy/` no repositório (B184, B200, B247) | B231, B233, B236, B257 |

### 2. Tirar as 4 objeções que o painel inteiro levantou

| # | Campo | O que fazer | Quem pediu |
|---|---|---|---|
| 2.1 | `perfis.github`, `perfis.medium`, `perfis.linkedin` | Decidir a D35 e a D01. Ou preencher os perfis (GitHub: `lemamon-dev/.github` com `profile/README.md`, bio, site e local, e pelo menos 1 repositório público; Medium: pelo menos 1 artigo; LinkedIn: página de empresa `/company/…` e trocar `perfis.linkedin.url`), ou marcar `publicar: false` no perfil vazio até haver conteúdo. A conferência do dia do deploy está no playbook 00 §B3 | Todos os grupos; B299 |
| 2.2 | `time[]` | Pelo menos 1 pessoa completa: foto real, nome, papel (com senioridade), uma linha escrita por ela, LinkedIn/GitHub. Liga a seção de time da Home, a página `/sobre` e o item "Sobre" no menu | Rafael, Cláudia, Marcos, Comercial; B086, B113 |
| 2.3 | `empresa.email` (+ `privacidade.emailWorkspace`) | Caixa no domínio, como `contato@lemamon.dev`, com SPF, DKIM e DMARC (playbook 11). O site troca as 390 ocorrências sozinho | Marcos, Comercial, Cláudia; B006 |
| 2.4 | `confirmacoes.codigoProprietario` — **decidido depois deste relatório** ("é do cliente", `answer_draft`, D na tabela de confirmações do playbook 15); um fixer da rodada 1 tinha voltado o campo para `false`, restaurado em 20/10/2026 | `"answer_draft"` (o código é da empresa do cliente, por contrato) ou `"answer_draft_alt"` (a propriedade passa conforme os pagamentos). O FAQ entra na Home, no método e nas páginas de projeto | Rafael, Marcos, Comercial, Cláudia |

### 3. Responder as perguntas que vêm logo depois

| Campo | O que preencher | Efeito |
|---|---|---|
| `confirmacoes.formatoDiagnostico` | `{ formato, participantes }` nos 3 idiomas (por exemplo, "por vídeo" e "quem vai desenvolver o projeto") | Liga "Como é a conversa e com quem eu falo?" no wizard e no FAQ |
| `descoberta.formato`, `.participantes`, `.ritmo`, `.duracao`, `.naoInclui` + `confirmacoes.duracaoDescoberta` | Como a Sprint de Descoberta acontece, quanto dura e o que não inclui | Liga "Como a Descoberta acontece" e "O que a Descoberta não inclui" (B354) |
| `confirmacoes.planoDoCliente`, `confirmacoes.descobertaAbatida` | Se o plano da Descoberta é do cliente mesmo sem seguir, e se o valor é abatido do desenvolvimento | Os 2 FAQs que mais reduzem o risco de pagar a Descoberta |
| `confirmacoes.notaFiscal` | `true` se toda venda sai com NF | FAQ "Vocês têm CNPJ e emitem nota fiscal?" |
| `confirmacoes.nda` | **Decidido depois deste relatório:** `true`, sem a promessa do questionário de segurança (a menção saiu do FAQ e do card de `/contato`); falta ter o NDA mútuo pronto para assinar (playbook 02 §11) | FAQ de NDA e card de `/contato` (B384) |
| `confirmacoes.devolutivaConteudo` | O que vem na devolutiva escrita, nos 3 idiomas | Termo "devolutiva por escrito" ganha conteúdo |
| `confirmacoes.timeDoCliente`, `confirmacoes.semDescoberta`, `confirmacoes.sistemaTerceiros` | Se trabalha junto com o time do cliente, se aceita começar sem Descoberta, se assume sistema de outra empresa | Perguntas do Marcos e de quem tem sistema no ar. `semDescoberta` só depois do B383 |

### 4. Prova (maior prazo; começar já)

| Onde | O que | Itens |
|---|---|---|
| `src/content/cases/<pt\|en\|es>/<slug>.mdx` (coleção de conteúdo, não `dono.json`) | Pelo menos 2 cases autorizados por escrito, nos 3 idiomas, com `servicos[]`, capa real e, se houver, resultado com fonte. Case anonimizado por setor e porte também vale | B030, B031, B033, B114, B149, B215, B219, B378, B379 |
| `depoimentos[]` | Depoimento nominal autorizado (foto e vídeo só com autorização própria) | B035, B140, B287 |
| `logos[]` | Logos de 4 ou mais empresas, autorizados | B034 |
| `src/content/posts/*.mdx` | 3 ou mais posts reais com autor real | B054, B110, B298 |

O passo a passo (termo de autorização, roteiro de entrevista, checklist) está no [playbook 09](../playbooks/09-prova-cases-depoimentos.md).

### 5. Completar quando fizer sentido

| Campo | Quando | Itens |
|---|---|---|
| `agenda.url` + `privacidade.ferramentas.agenda` | No mesmo deploy, se quiser agendamento direto | B053, B121 |
| `sustentacao.inclui`, `.contratacao`, `.canais`, `.urgencias` | Para a página de sustentação dizer como funciona | B109, B283 |
| `engenharia.tests`, `.ci_cd`, `.code_review`, `.repository`, `.documentation`, `.handover`, `.people`, `.security` | Liga "Como a gente constrói" (o que o Marcos procura) | B283 |
| `precos.descoberta`, `precos.desenvolvimento.{sistemas,aplicativos,integracoes,mvp}`, `precos.sustentacao` | **Só se o dono quiser publicar** (decisão 3), e depois da planilha de margem (playbook 02 §3) | B011, B037, B118, B354 |
| `privacidade.pixels.linkedin`, `privacidade.pixels.meta`, `privacidade.remarketing` | Só com `baseAnuncios = "consentimento"` e as decisões D12 e D07 | B346, B347, B348 |
| `confirmacoes.scoreDRecebeDiagnostico` (+ `qualificacao.scoreD.ativo`) | Se lead D também recebe diagnóstico | B042 |

### 6. Decisões para assinar no registro

Em [docs/playbooks/15-registro-de-decisoes.md](../playbooks/15-registro-de-decisoes.md), com recomendação já escrita: **D37** (title e description da Home, B101; a linha precisa citar o title atual de 59 caracteres), **D32** (cor de acento, B077), **D34** (wordmark, B221), **D40** (tipografia, B385), **D31** (atender fora do Brasil, B226), **D03/D04** (pacotes abaixo do teto, B356, B383), **D02** (Squad não é oferta pública), **D10, D11, D13, D14, D17, D18, D24, D25**. Confirme também a forma do FAQ de mudança de escopo (nota no fim da seção b).

---

## (e) O que só um deploy ou um painel confirma

O `astro preview` usado na validação não executa o `netlify.toml`, não recebe formulários e não carrega as tags de produção. Os itens abaixo estão prontos no código e testados localmente, mas o critério de aceite exige produção ou o painel de uma ferramenta.

### Caminho até o lançamento

1. Dono preenche a etapa 1 da seção (d) e faz a revisão jurídica da Política.
2. Commit com `git add -A`, PR e **deploy preview**. No preview não sai lead real, GA4 nem conversão do Ads (B277), então dá para testar à vontade: `E2E_NETLIFY_URL=https://deploy-preview-N--<site>.netlify.app yarn test:e2e redirects shell-headers shell-csp smoke --project=desktop`.
3. Merge e deploy de produção. Logo em seguida, as conferências da tabela abaixo.
4. Sete dias depois, promover a CSP (B254).

### Conferências

| O quê | Itens | Como testar | Passa quando |
|---|---|---|---|
| Netlify Forms | B231, B380, B381 | Painel › Forms: conferir `briefing` (15 campos) e `contato`. Envio real em `https://lemamon.dev/orcamento?utm_source=teste-interno` e em `/contato`; apagar depois (playbook 05 §2) | Os dois envios aparecem com nome, e-mail, telefone, detalhes, resumo e atribuição |
| Notificação de lead | B043, B057 | Painel › Forms › Notifications para o e-mail do comercial; filtro do Gmail destacando `[A]` (playbook 05 §3) | Notificação em menos de 5 minutos |
| Redirects | B010, B262, B304, B305 | `curl -sI` em `/projects`, `/projects/x?gclid=1`, `/home`, `/lemamon`, `/post/1`, `/blog`, `/?lng=en`, `/diagnostico` | 301 para `/orcamento` (com a query), `/`, `/`, `/`, 302 para `/`, 301 para `/en/`, 301 para `/orcamento` |
| Headers de segurança | B233 | `curl -sI https://lemamon.dev/` ou `tests/e2e/shell-headers.spec.ts` com `E2E_NETLIFY_URL` | `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`, COOP, HSTS e `content-security-policy-report-only` presentes |
| Cache dos assets | B236 | `curl -sI https://lemamon.dev/_astro/<arquivo>.js \| grep -i cache-control` | `max-age=31536000, immutable` |
| CSP | B254 | `E2E_NETLIFY_URL=https://lemamon.dev yarn test:e2e shell-csp --project=desktop`; 7 dias de Netlify › Logs › Functions › `csp-report` | 0 violação; então `CSP_ENFORCE = true` em `src/integrations/csp.ts:52` e o header vira `content-security-policy` |
| WhatsApp | B007, B362 | Botão em `/`, `/servicos` e numa URL 404; forçar erro no envio do wizard | Todos abrem `wa.me` com o número real; o erro leva o resumo e o protocolo |
| GA4 | B045, B046, B373, B119 | Tempo real e DebugView; desligar "mudanças de página com base no histórico"; marcar `lead_submitted` como evento-chave; criar `lead_qualified` (playbook 06 §2 e §5) | `page_view`, `cta_click`, `wizard_step` e `lead_submitted` chegam sem duplicar |
| Google Ads | B106, B120, B314 | Tag Assistant na Home e no envio do wizard; conversão por URL de `/orcamento/enviado` em paralelo por 30 dias (playbook 07 §4) | gtag `AW-16881353870` carregado e 1 conversão "Solicitar cotação" por envio |
| Alerta de falha de lead | B107, B272 | Condição NRQL `SELECT count(*) FROM PageAction WHERE actionName='lead_failed'` > 0 em 15 min; simular bloqueando o POST no DevTools (playbook 06 §7) | Alerta chega em até 15 min |
| Search Console | B103, B343, B025 | TXT no DNS, enviar `https://lemamon.dev/sitemap-index.xml`, vincular ao GA4 (playbook 08 §1, 06 §9) | Sitemap "Sucesso" e 8 ou mais rotas indexadas |
| Prévia social e dados estruturados | B024, B029, B306 | Sharing Debugger, Post Inspector, colar o link no WhatsApp; Rich Results Test em `/` | Imagem 1200×630 e promessa na prévia; Organization/ProfessionalService sem erro |
| Monitor de disponibilidade | B275 | UptimeRobot ou Better Stack com palavra-chave em `/`, `/orcamento` e `/projects`, mais SSL (playbook 06 §8) | Aviso em até 5 min |
| CI e dependências | B276, B253 | Proteger a `main` exigindo o check "CI / build, testes e E2E"; instalar o app Renovate (playbook 13 §10) | PR com erro de tipo, `console.log` ou E2E quebrado é barrado |
| E2E diário em produção | B240 | Criar a variável `E2E_PRODUCAO_ATIVO=true` no GitHub | O workflow `e2e-producao.yml` roda às 10h e abre issue se falhar |
| Aviso de cookies | B344 | Só se a D05 for "consentimento": abrir em janela anônima, recusar e aceitar | Nenhum cookie antes da escolha; "Recusar" não volta a perguntar |

---

## (f) Histórico das rodadas de correção

### Itens pendentes por rodada

| Rodada | Pendentes antes → depois | Correções de código (por área) | Copy | Testes depois da rodada |
|---|---|---|---|---|
| 1 | 73 → 23 | shell 14, home 16, conversion 16, gated 5, playbooks 8, pages 0 | 33 aplicadas | Build ok; 799 unitários; E2E 303 ok, 0 falha |
| 2 | 23 → 16 | shell 4, gated 3, playbooks 5, pages 2, conversion 2, home 0 | 42 aplicadas | 862 unitários; E2E 307 ok, 0 falha |
| 3 | 16 → 9 | shell 4, playbooks 5, conversion 2, gated 2, pages 1 | 35 aplicadas | 904 unitários; `yarn lint` ok; E2E 311 ok, 0 falha |

**Rodada 1.** O grosso da correção: formulários, wizard, eventos de medição, acessibilidade, design system e os playbooks de operação. A integração achou uma regressão: com o aviso de cookies e os pixels ligados, o JS de `/contato` passava do orçamento de 10 KiB; o limite foi para 12 KiB, ainda bem abaixo da meta de 30 KB do documento técnico. Ficaram para depois o lint completo (exige instalar dependências), a promoção da CSP (só depois do lançamento) e duas correções de pages que dependiam de arquivos do home.

**Rodada 2.** O shell cortou o CSS das páginas do wizard (`/orcamento` de 15,07 para 12,13 KiB) e devolveu o orçamento de CSS para 15 KiB; a CSP ganhou o coletor de relatórios (`netlify/functions/csp-report.mjs`). O home desenhou 9 logos de tecnologia para os badges. A faixa de compromissos de `/servicos/sustentacao` continuou pendente porque depende de uma prop no componente do home.

**Rodada 3.** A CSP foi conferida host a host contra o guia oficial do Google (GA4 com recursos do Ads, conversão, remarketing); a CI ganhou o passo de lint. O redator recusou voltar a cidade para Florianópolis porque a D38 fixou São Paulo. Ficaram os 9 parciais da seção (c).

### O painel ao longo das rodadas

| Grupo | Rodada 0 | Rodada 1 | Rodada 2 | Rodada 3 |
|---|---|---|---|---|
| Home | 3/9 · 7,5 · compliance ✗ | 2/9 · 7,4 · ✗ | 6/9 · 7,9 · ok | 6/9 · 7,8 · ok |
| Método | 4/9 · 7,6 · ✗ | 3/9 · 7,6 · ✗ | 1/9 · 7,4 · ✗ | 5/9 · 7,8 · ok |
| Serviços | 1/9 · 7,4 · ✗ | 3/9 · 7,8 · ok | 5/9 · 7,8 · ok | 6/9 · 7,9 · ok |
| Conversão | 4/9 · 7,8 · ✗ | **7/9 · 8,1 · ok — aprovado** | — | — |
| Estrutura | **8/9 · 8,1 · ok — aprovado** | — | — | — |

**Por que Home, Método e Serviços não chegaram a 7/9.** O copy convergiu: compliance ok nos 5 grupos, notas de SEO, compliance e dos nativos entre 8 e 9. Os votos que faltam vêm das personas e do comercial, e o motivo deles é o mesmo em todas as rodadas: falta prova (pessoa, perfis com conteúdo, e-mail no domínio, propriedade do código, case). Mais uma rodada de texto não muda isso. A recomendação é aplicar os pedidos de copy e design abertos da seção (b), preencher as etapas 1 e 2 da seção (d) e só então rodar o painel de novo.

---

*Gerado a partir de `final-verdicts.json` (376 vereditos) e `docs/arquitetura/backlog.json`. Conferido em 20/10/2026: `lemamon.dev` em produção ainda serve o app antigo; o build novo está no working tree, sem commit.*
