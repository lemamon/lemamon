# Auditoria de conversão do site novo da Lemamon

**Data:** 21/10/2026 · **Branch:** `feat/site-astro` (`46f353e`) · **Ambiente auditado:** build de produção servido em `http://localhost:4700` (dados reais, sem camada fictícia, WhatsApp de teste `5548900000000`) e o deploy preview `https://deploy-preview-13--boring-shockley-7c50b2.netlify.app` (headers, redirects, cache e HTTPS) · **Fontes de verdade:** [BLUEPRINT](BLUEPRINT.md), [VALIDACAO](VALIDACAO.md), `dados/dono.json`, `src/i18n/{pt,en,es}.json`, [playbooks](../playbooks/INDEX.md)

**Método.** Cinco jornadas de persona (Rafael no iPhone, Cláudia no desktop, Marcos no notebook, uma empreendedora hispana no Android e um CTO americano no notebook) e sete especialistas (UX/UI, CRO, copy, marketing e SEO, QA, acessibilidade e performance) navegaram no Google Chrome real como usuários comuns: rolaram, clicaram, preencheram campos e voltaram. Depois, cada achado foi reproduzido de novo por um verificador independente, que podia confirmar, corrigir a severidade, reescrever a recomendação ou refutar. **Nenhum formulário foi enviado e nenhum link de WhatsApp, `mailto:` ou `tel:` foi clicado** (os POSTs ficaram bloqueados nos scripts). As severidades e recomendações deste documento são as **da verificação**, não as do relato original.

**Onde estão as provas.** Os prints e scripts citados ficam no kit da auditoria, na pasta de rascunho da sessão: `KIT = /private/tmp/claude-501/-Users-deyvidmarinho-Documents-projects-lemamon-lemamon-dev/0f140e91-6727-4788-9ed1-968b51ee0350/scratchpad/audit-kit`. Todo caminho `out/...` abaixo é relativo a `KIT`. **Essa pasta é temporária:** se os prints forem necessários depois, copie `KIT/out/` para um lugar permanente antes de encerrar a sessão.

**Como ler.** Os achados vão de F01 a F93. Severidade: **alto** (perde conversão no caminho principal), **médio** (perde conversão num trecho ou num segmento relevante), **baixo** (atrito, acabamento ou medição). Esforço: **P** (horas, copy ou CSS e poucas linhas), **M** (1 a 3 dias, com testes), **G** (mais que isso ou depende de decisão externa). "Já conhecido" quer dizer que o achado já está em [VALIDACAO §d](VALIDACAO.md).

---

## (a) Resumo executivo

### A resposta curta: o site converte?

**Converte quem já chegou disposto; ainda perde o cético, quem está comparando fornecedores e o estrangeiro. Nota geral: 6,5/10.**

- **Hoje, em produção, a nota é zero.** Conferido em 21/10/2026: `https://lemamon.dev/` ainda serve o app antigo (HTML de 73.585 bytes, bundle `assets/index-DzC6TVDn.js`), e o único canal de contato encontrado no bundle dele é um `mailto:lemamon.dev@gmail.com` (nenhum formulário nem link de WhatsApp). Nenhuma melhoria deste documento chega a um cliente antes do deploy, e o deploy depende dos campos de `dados/dono.json › privacidade` (trava do build, [VALIDACAO §d.1](VALIDACAO.md)). **Publicar continua sendo a ação de maior impacto de todas.**
- **A mecânica do funil está acima da média de software house no Brasil.** A promessa aparece em 5 segundos ("escopo, prazo e preço combinados antes de começar"), há um único CTA primário repetido de 5 a 9 vezes por página com origem rastreada, a barra fixa do celular some quando outro CTA está na tela, o wizard mostra valor antes de pedir o contato, tem saída "não sei" em cada pergunta, validação em linha, rascunho salvo e retomada. O site é rápido (LCP de 0,6 a 1,2 s no celular com rede limitada, CLS 0) e o axe não acusa nenhuma violação WCAG em 88 execuções.
- **O que custa conversão não é falta de texto, é posição.** Os quatro vazamentos que não dependem do dono:
  1. **A recompensa do wizard fica escondida.** O resumo começa repetindo as 6 respostas e a linha do método da Home; "o que influencia prazo e preço no seu caso", que é a promessa da entrada, só aparece depois de ~3,5 telas no celular (F02).
  2. **A ação some em pontos-chave.** Quem vem de anúncio por uma página de serviço cai numa entrada do wizard sem botão na primeira tela do celular (F03); no notebook, o "Continuar" fica abaixo da dobra em 4 de 6 perguntas (F04); no celular, erros aparecem atrás da barra fixa (F05).
  3. **A inversão de risco está no fim do FAQ.** "O código é da sua empresa, por contrato" e "NDA antes dos detalhes", já confirmados pelo dono, ficam em acordeões fechados, enquanto a faixa de compromissos usa "sustentação, se você quiser" (F01, F15, F42).
  4. **O pós-envio deixa o lead escapar.** E-mail com erro de digitação passa (F07), o obrigado não confirma o contato deixado nem incentiva o primeiro "oi" (F10), duplo clique grava resposta errada (F06).
- **A falta de prova continua sendo o maior freio** (nenhuma pessoa com nome, case, depoimento ou agenda online), mas já é conhecida e depende do dono (F57). Dá para mitigar com o que já está confirmado: garantias à vista, CNPJ como prova de existência e o primeiro "oi" no WhatsApp.
- **Quase tudo é barato.** Os 20 achados confirmados de severidade alta ou média são de esforço P ou M, e nenhum depende de dado novo do dono.

### Nota por etapa do funil

| Etapa | Nota | O que funciona | O que tira ponto |
|---|---:|---|---|
| **Chegada** (anúncio ou busca → primeira tela) | **8,5** | LCP sempre em texto, 0,6–0,7 s local e 0,8–1,2 s no preview com rede limitada; CLS 0; H1 das páginas de serviço casa com o anúncio; 39 URLs com title, description, canonical e hreflang corretos; redirects 301 preservam `gclid` e UTM | Home com `gclid` nunca usa o cache da CDN (+150 a 280 ms, F54); com a fonte do navegador em "Grande", o CTA do header sai da tela (F13) |
| **Entendimento** (o que é, como funciona, quanto custa) | **7** | Proposta clara em 5 s; método em 4 etapas com "Você recebe"; "Como comparar orçamentos" é a melhor peça para quem compara | Preço e prazo respondidos pela negativa ("Depende", "Antes da conversa, não", "não chuta prazo", F08); no MVP, preço e prazo só nas telas 11 e 12 de 16 (F12); método repetido em 7 componentes, páginas de 16 a 20 telas no celular (F38); en/es não dizem se atendem fora do Brasil (F17) |
| **Confiança** (é sério? vai dar certo?) | **4** | CNPJ e razão social no rodapé; Política LGPD detalhada; processo com duas decisões antes de pagar | Sem pessoas, cases, depoimentos ou logos (F57, conhecido); garantias contratuais escondidas (F01, F15); perfis vazios com destaque de 1,6 tela no celular (F14); Descoberta sem duração (F58, conhecido) |
| **Decisão** (clicar no CTA) | **7** | CTA único e repetido; barra fixa com WhatsApp; microcopy de risco baixo | Microcopy repete "Gratuito" (já no botão) e não diz "sem compromisso" (F41); clique a mais entre o CTA e a 1ª pergunta (F20); entrada sem botão visível vindo de serviço (F03) |
| **Wizard** (6 perguntas, resumo, contato) | **7** | Uma pergunta por tela, "não sei" em todas, rascunho e retomada, voltar do navegador, validação em linha, máscara de telefone, resumo antes do contato | Resumo com a recompensa no fim (F02) e genérico para prazo de 3 meses (F09); "Continuar" fora da dobra no notebook (F04); erro atrás da barra no celular (F05); duplo clique (F06, F21); en/es: telefone com exemplo +55 (F16) |
| **Pós-envio** (do obrigado ao diagnóstico marcado) | **5** | H1 com o nome; botão de WhatsApp com o código do pedido; resumo para copiar | Não confirma o contato deixado nem orienta o primeiro "oi" (F10); e-mail digitado errado passa (F07); recarregar o contato apaga tudo (F24); sem agenda nem prazo de resposta (F57, F59, conhecidos) |

Estimativa, não medição: com o pacote "Fazer agora" a nota sobe para **cerca de 7,5**; com os dados do dono que destravam prova (1 pessoa, 1 case, agenda, duração da Descoberta), para **cerca de 8**.

### As 5 ações de maior impacto (sem depender do dono)

Pré-requisito, que depende do dono: **pôr o site no ar** ([VALIDACAO §d.1](VALIDACAO.md)). Com o site no ar, estas são as cinco:

1. **Botão "Começar" na primeira tela para quem vem de anúncio (F03, P).** Em `src/components/quote/QuoteEntry.astro`, mover `<div data-wizard-context></div>` para depois de `.entry__actions` e encurtar `quote.entry.context_service`. Simulado no Chrome: o botão volta de y=681–729 para y=559–607 em 390×664 e 360×640. Métrica: `wizard_start ÷ wizard_view` com `origem=*-hero` no celular.
2. **Resumo do wizard entrega a recompensa primeiro (F02 + F09 + F21, M).** Ordem nova: fatores do caso → pauta do diagnóstico → "E o preço?" → CTA → chips das respostas → método compacto. Reconhecer a janela de 3 meses. Progresso a 95% no contato, não 100% três telas antes. Métrica: `wizard_summary_view → wizard_reach_form`.
3. **Garantias à vista (F01 + F42 + F15 + F41, P cada).** "O código é da sua empresa, por contrato" no lugar do 4º item da faixa de compromissos; o card "O fornecedor que some" passa a citar o código; NDA nas páginas de serviço (pergunta própria em integrações); "Sem compromisso · 45 minutos · devolutiva por escrito" sob o CTA. Métrica: cliques no CTA do hero e da faixa; menos perguntas de NDA no WhatsApp.
4. **Ação sempre visível e à prova de toque no wizard (F04 + F05 + F06, P).** Barra de ações `sticky` também no desktop; erro e aviso de limite dentro da barra fixa no celular; trava de 400 ms contra duplo clique na entrada de cada tela (700 ms no contato). Métrica: queda por passo (`wizard_step` n → n+1) e `wizard_blocked`.
5. **Não perder o lead depois do "sim" (F07 + F10, P).** Sugestão "Você quis dizer joao@gmail.com?" no blur; no obrigado, mostrar o contato que a pessoa deixou com um "Algum dado errado?" e apresentar o "Mande um oi no WhatsApp" como próximo passo recomendado. Métrica: diagnósticos marcados ÷ leads; leads sem contato efetivo.

Sem tráfego para teste A/B (site B2B novo), a forma de medir é comparar 4 semanas antes com 4 semanas depois nos eventos que o site já dispara: `wizard_view → wizard_start → wizard_step 1…6 → wizard_summary_view → wizard_reach_form → lead_submitted`.

### Números da auditoria

| Situação | Achados | Alto | Médio | Baixo |
|---|---:|---:|---:|---:|
| Confirmados (reproduzidos por verificador) | 51 | 2 | 18 | 31 |
| Não verificados (baixos ou já conhecidos) | 38 | — | — | — |
| Refutados | 4 | — | — | — |
| **Total** | **93** | | | |

Dos 38 não verificados, 8 já são conhecidos e dependem de dado do dono (F17, F57–F63); os outros 30 são novos, quase todos baixos.

| Plano | Itens |
|---|---:|
| Fazer agora (impacto alto ou médio, esforço P/M, sem dono) | 19 |
| Próximo (esforço maior ou depende de medição) | 6 (+ a 2ª fase de F16, F40 e F45) |
| Depende do dono | 13 |
| Polimento (baixos) | 51 |

---

## (b) Como cada usuário viveu o site

| Persona | Dispositivo | Nota | Converteria hoje? | Onde saiu ou travou | Com "Fazer agora" |
|---|---|---:|---|---|---|
| Rafael, fundador vindo de anúncio de MVP | iPhone 13 | ~6 | Talvez | Preço e prazo só na tela 11 de 16; entrada do wizard sem botão | Pede pelo wizard |
| Cláudia, distribuidora em Campinas, compara 3 fornecedores | Desktop 1440 | 6 | Parcialmente: sonda pelo WhatsApp | Resumo genérico para "não sei / 3 meses" | Envia pelo wizard |
| Marcos, head de produto de empresa de 300 pessoas | Notebook 1280 | 5,5 | Não pelo wizard: e-mail pedindo NDA | NDA escondido; nada para levar ao diretor | Trata o diagnóstico como "teste barato" |
| Empreendedora de Bogotá | Pixel 7, es-CO | 5 | Provavelmente não | Faixas em BRL; telefone com exemplo +55 recusa o número local | Melhora, mas depende da D31 |
| CTO de startup americana | Notebook 1280, en-US | 4 | Não: copia o e-mail | Nada sobre idioma, fuso, moeda; erro +55 | Melhora pouco sem a D31 |

### Rafael — fundador, iPhone 13, anúncio → `/servicos/mvp`

**Converteria?** Talvez, com chance moderada. **Onde travou, em ordem:**
1. **Na página de MVP, entre a 3ª e a 5ª tela**, rolando atrás de preço e prazo. As duas respostas só aparecem nas telas 11,2 e 12,1 de 16,3, e começam por "Depende" e "a gente não chuta prazo" (F12, F08). Sem pessoas nem cases. A saída provável é o WhatsApp da barra fixa ou "fechar para ver depois", que perde o `gclid` (F26).
2. **Em `/quanto-custa`**, ao ler "Antes da conversa, não", que para um fundador com orçamento apertado soa como "prepare-se para o pior" (F08).
3. **Na entrada de `/orcamento`**, vindo do CTA da página de MVP: a tela termina numa caixa amarela de contexto e nenhum botão aparece (F03; `out/j1-rafael-mobile/14-mobile-entry-fold.png`).
4. Depois que começa, vai até o contato sem atrito relevante. Na P4, o campo da data do piloto fica escondido sob a barra fixa (F30). No contato pensaria "quando vão me chamar?" (F59) e "minha ideia está protegida?": o NDA só aparece dentro do campo opcional "Quer contar mais alguma coisa?" (F01).

Parou com os campos preenchidos, sem enviar (`out/j1-rafael-mobile/12-contact-ready-not-sent.png`). **O que o plano muda:** F03, F12, F08 e a microcopy "· NDA se você pedir" no hero do MVP (F01) atacam as três saídas.

### Cláudia — dona de distribuidora em Campinas, desktop 1440, comparando 3 fornecedores

**Converteria?** Parcialmente (6/10). Começaria o wizard porque custa pouco e não pede contato antes do resumo. **Onde travou:**
1. **No resumo**: marcou "Ainda não sei — quero entender o que é razoável" e "nos próximos 3 meses", e o resumo não comenta nenhuma das duas (F09; `out/j2-claudia-desktop/08-wiz-resumo-dobra.png`). O conteúdo personalizado está abaixo do eco das respostas (F02).
2. **Toda pergunta concreta recebe a mesma resposta adiada**: "valor combinado antes de começar" aparece 13 vezes e "Sprint de Descoberta" 39 vezes em 5 páginas, sem número (F38, F08). A decisão 3 (não publicar preço) se mantém; o problema é o enquadramento.
3. **Garantias escondidas** (o código é do cliente, NDA) no fim dos FAQs (F01).
4. **Em `/contato`**, depois de preencher nome, e-mail e WhatsApp, a dica "Projeto novo?" a tira do formulário e o wizard pede tudo de novo (F40; `out/j2-claudia-desktop/06-contato-preenchido-projeto-novo.png`).
5. Dúvidas que só o dono responde: nota fiscal, atendimento em Campinas e formato do diagnóstico (F60), duração da Descoberta e se o plano fica com ela (F58), case do setor (F57).

Sairia por "Prefiro falar no WhatsApp" para sondar faixa de preço, nota fiscal e Campinas. Entraria na lista como "o fornecedor mais organizado", mas perde para quem mostrar um case de distribuidora ou uma ordem de grandeza de preço. **O que o plano muda:** com F02, F09, F01 e F08 (todos P/M), ela enviaria pelo wizard em vez de só sondar. `confirmacoes.valoresNoDiagnostico` (dono) liga variantes de texto já escritas sem publicar preço.

### Marcos — head de produto, empresa de 300 pessoas, integração, notebook 1280

**Converteria?** Hoje não pelo wizard (5,5/10): mandaria um e-mail pedindo o NDA e uma conversa técnica. **Onde travou:**
1. **O NDA só aparece no 8º acordeão de `/como-trabalhamos`**, em `/contato` e no FAQ de `/orcamento` (7º de 8). Não aparece na Home, nas 4 páginas de serviço (o teto de 9 FAQs corta o NDA primeiro), em `/sprint-de-descoberta` nem em `/quanto-custa` (F01). A página de integrações não responde quem acessa os dados do ERP (F15; `out/j3-marcos-laptop/integracoes-faq-open.png`).
2. **Nada para encaminhar ao diretor antes de virar lead**: o resumo só oferece "Pedir diagnóstico" e WhatsApp, e a URL do resumo aberta por outra pessoa cai na pergunta 1 vazia (F45).
3. **No notebook**, o "Continuar" fica abaixo da dobra na P2 e na P3 (F04).
4. **O que faria escrever "descartar"** já está mapeado e depende do dono: nenhuma pessoa com nome e senioridade, GitHub e Medium vazios, LinkedIn `/in/` em vez de `/company/` (F14, F48, F57), nenhuma prática de engenharia (`engenharia.*` vazio) e Descoberta sem duração (F58). "Para PMEs e startups" pode afastar uma empresa de 300 pessoas (F63).

O achado de que o texto "não fala com o avaliador técnico" foi **refutado** (F44): a página de integrações já usa API, falhas, reprocessamento e painel; o que falta é prática de engenharia, que é dado do dono. **O que o plano muda:** F01, F15 e o anúncio "Depois de enviar, você recebe este resumo pronto para repassar a quem decide" (F45) fazem do diagnóstico "um teste barato" mesmo antes de haver time e cases.

### Empreendedora de Bogotá — Pixel 7 (412×839), es-CO

**Converteria?** Provavelmente não pelo formulário (5/10). O espanhol é natural, usa "tú" do começo ao fim, o aviso "Esta página también está disponible en español" aparece sem CLS e o axe dá 0 violações. **Onde travou:**
1. **Na home `/es/`**: "São Paulo, Brasil" aparece 6 vezes e nada diz se atendem empresas de fora, em que idioma, fuso, moeda ou nota (F17, conhecido; `out/j4-hispano-mobile/02-es-home-full.png`).
2. **No passo 5**: faixas "Hasta BRL 30 mil… Más de BRL 200 mil" obrigam a converter moeda (F32; `out/j4-hispano-mobile/06-etapa-5-dobra.png`).
3. **No contato**: digita "300 123 4567" e recebe "…por ejemplo: +55 11 99999-9999" (F16; `out/j4-hispano-mobile/08-contacto-telefono-local-error.png`). Conclui que é só para o Brasil.
4. Quem chega direto em `/orcamento` não tem troca de idioma (F31); fechar o aviso de idioma vale para sempre (F68); alguns decalques do português (F69).

**O que o plano muda:** F16 (copy) e F31 tiram as travas mecânicas. A trava de contexto exige a decisão D31 do dono; enquanto ela não vem, a FAQ "¿Trabajan con empresas fuera de Brasil?" proposta em F17 é segura porque não afirma atendimento.

### CTO de startup americana — notebook 1280, en-US

**Converteria?** Não pelo wizard (4/10). O método convence: "How to compare quotes" em `/en/pricing` e a tabela de `/en/how-we-work` são o melhor do site. **Onde travou:**
1. **Na home**: "São Paulo, Brazil" 6 vezes, nada sobre idioma, fuso, contrato ou faturamento (F17).
2. **No passo 5**: BRL, e "Over BRL 200k" (uns US$ 35–40 mil) ancora o porte do fornecedor para baixo (F32).
3. **No contato**: WhatsApp pré-marcado e obrigatório; "(415) 555-0134" gera erro com exemplo +55 (F16; `out/j5-english-desktop/quote-09b-phone-field.png`). Pior: "+55 415 555 0134" passa como número válido e errado.
4. Na entrada, "Custom software quote" e logo "Not yet" no primeiro FAQ aberto (F18); nenhum e-mail é clicável (F49).

Sairia copiando `comercial@lemamon.dev` para perguntar "do you work with US companies?". **O que o plano muda:** pouco sem a D31. O público declarado é PME no Brasil; a versão em inglês só converte esse perfil depois de o dono decidir se atende fora.

### Os especialistas, em uma linha

| Especialista | Nota hoje | Com as correções P/M | Ponto principal |
|---|---:|---:|---|
| UX/UI | 7 | ~8,5 | Funil do diagnóstico: erro atrás da barra, botão fora da dobra, recompensa do resumo no fim (F02–F05) |
| CRO | 7 | ~8 | Garantias escondidas, ordem do resumo, obrigado sem contato confirmado (F01, F02, F10) |
| Copy | 7,5 | — | Argumentos fortes no lugar errado; preço pela negativa; botões com o mesmo rótulo (F01, F08, F21) |
| Marketing e SEO | 7 | — | Atribuição fora do wizard (F11, F26, F34); campanhas de "orçamento" sem pré-qualificação (F35) |
| QA | 7 | ~9 | Duplo clique, e-mail com erro, contato apagado no reload (F06, F07, F24) |
| Acessibilidade | 8 | — | Fonte ampliada quebra o header (F13); zoom faz header e barra ocuparem até 46% da tela (F51) |
| Performance | 8,5 | — | Toque antes da hidratação sem retorno (F25); React é 73% do JS do funil (F53) |

---

## (c) Plano priorizado

### Fazer agora — impacto alto ou médio, esforço P/M, sem depender do dono

**Pacote A · Funil do wizard (entrada → resumo → contato)**

| Key | Problema | Recomendação exata | Onde | Impacto esperado | Técnica |
|---|---|---|---|---|---|
| **F03** (alto, P) | Vindo de `?servico=` (caminho dos anúncios), o "Começar as 6 perguntas" desce para y=681–729 numa tela de 664 (iPhone 13) e de 640 (Android 360); a única ação visível é "Dúvidas? WhatsApp" | Mover `<div data-wizard-context></div>` para **depois** de `<div class="entry__actions">`. Trocar `quote.entry.context_service` por pt "Já deixamos marcado o que mais combina com {servico_frase}. Dá para mudar." · en "We've preselected what best fits {servico_frase}. You can change it." · es "Ya marcamos lo que mejor encaja con {servico_frase}. Puedes cambiarlo." Atualizar `quote._notes.entry_context`, BLUEPRINT §10.3 e `tests/e2e/quote-focus-and-summary.spec.ts` l.79 | `src/components/quote/QuoteEntry.astro` l.115; i18n ×3 | Botão volta a y=559–607 (simulado). ↑ `wizard_start ÷ wizard_view` com `origem=*-hero` no celular | Continuidade do clique; CTA acima da dobra |
| **F02** (alto, M) | O resumo abre com as 6 respostas e a linha do método da Home; fatores, pauta e preço só a partir de y≈2.175 (celular) e 2.050 (desktop) | Ordem nova em `renderSummary`: H2 + intro → 1 linha "Para: {tipo} · {prazo} · {faixa} · Revisar respostas" → **"O que influencia prazo e preço no seu caso"** → "Pauta do seu diagnóstico" (2 colunas ≥1024) → "E o preço?" → CTA (o `earlyActions` do desktop vem para cá) → chips compactos → método compacto (etapa 1 e etapa 2 realçada "Paga · valor combinado antes do início"; as 4 etapas num `<details>` "Ver as 4 etapas") → CTA final + WhatsApp. `quote.summary.intro`: "Com base nas suas respostas: o que pesa no prazo e no preço do seu caso, o que a gente vai aprofundar nos 45 minutos e o caminho até o software rodando." Não esconder os chips num `<details>` fechado | `src/islands/wizard/Wizard.tsx` (renderSummary); i18n ×3; BLUEPRINT §7.4; e2e l.141–157 | Conteúdo personalizado na 1ª tela. ↑ `wizard_summary_view → wizard_reach_form`; medir a visibilidade do bloco de fatores (IntersectionObserver, sem valor de resposta) | Reciprocidade (valor antes do pedido); cumprir a promessa da entrada |
| **F09** (médio, P) | "Nos próximos 3 meses" (o caminho mais comum) não muda nada no resumo | Em `model.ts`, `hasDeadlineWindow(a) = isDeadlineUrgent(a) \|\| a.deadline === "within_3_months"` (não alterar `isDeadlineUrgent`, que vai no lead em `lead.ts:312`). `summaryTopics` usa o predicado novo. Fator `factor_deadline_window`: "Uma janela de 3 meses: o que entra na primeira entrega é combinado antes de começar". Nota `deadline_note_window` acima do CTA: "Com 3 meses pela frente, quanto antes a gente conversar, mais opções você tem para a primeira entrega." Não mexer no bloco de preço | `model.ts`, `rules.ts`, `Wizard.tsx:1356`; i18n ×3 | Personalização percebida no momento de maior intenção | Personalização; relevância |
| **F21** (médio, P) | O botão do resumo e o envio têm o mesmo rótulo e quase a mesma posição no celular; a barra de progresso marca 100% na P6, no resumo e no contato | Manter "Pedir diagnóstico gratuito" (BLUEPRINT §8.6). Ignorar o submit do contato nos primeiros ~700 ms depois de a etapa abrir; submit sem nenhum campo tocado só foca "Nome", sem `showAllErrors` nem `form_validation_error`. Progresso sobre 8 passos: P6 75%, resumo ≈87%, contato ≈95%, 100% só em `/orcamento/enviado` (`aria-valuemax` 8). Opcional: `quote.summary.below_primary` "Falta só o contato. Gratuito e sem compromisso." (1 linha a 390 px) | `Wizard.tsx` 1736–1759 e onSubmit; i18n ×3 | Fim dos 3 erros vermelhos por toque duplo; contato deixa de parecer passo extra | Prevenção de erro; gradiente de meta |
| **F04** (médio, P) | Notebook: o "Continuar" fica fora da tela na P2–P5 (1366×657: bottom 803, 869, 721, 730); P4 tem "falso fim" | `Wizard.module.css`: `@media (min-width: 768px) and (min-height: 34em) { .actions { position: sticky; inset-block-end: 0; z-index: var(--z-floating); padding-block: var(--space-3); background-color: var(--color-bg-canvas); border-block-start: 1px solid var(--color-border-subtle); } }`. Em `Wizard.tsx` (actionsRef, l.369), medir a altura também com `sticky`; tirar `scroll-padding-block-end` do media `max-width: 767.98px`. **Não** usar o contato em 2 colunas | `Wizard.module.css`, `Wizard.tsx` | Continuar da P3 de 869 → 645 em 1366×657 (protótipo). ↓ queda por passo em 1280–1536 | Ação primária sempre visível |
| **F05** (médio, P) | Celular: "Escolha uma opção para continuar." fica atrás da barra fixa; o aviso "Você já marcou 3" da P3 fica em y≈931 | Passar `note: stepError ?? limitNotice` ao helper `actions()` (já renderiza `.barNote` acima do Continuar) e criar `.barNote[data-tone="error"]` vermelho e negrito abaixo de 768 px. Na P3, contador no helper: "Marque até 3 · Selecionadas: 3 de 3". Em `onContinue`, `setAnnouncement(validationText(question))`. Não usar `role="alert"` | `Wizard.tsx` ~l.1003 e 1119–1122; `Wizard.module.css` | Nenhum toque sem retorno visível; ↓ `wizard_blocked` repetido | Visibilidade do status (Nielsen #1) |
| **F06** (médio, P) | Duplo clique em "Continuar": no desktop grava uma opção que o usuário não escolheu; no celular abre a P2 toda vermelha ou pula a P3 | Trava única de entrada de tela: em `go()`, `enteredAtRef.current = performance.now()`; na raiz do wizard, `onClickCapture={(e) => { if (e.detail !== 0 && performance.now() - enteredAtRef.current < 400) { e.preventDefault(); e.stopPropagation(); } }}`. `e.detail === 0` preserva Enter/Espaço. Testes: 2 cliques a 130 ms na P1 → `build_type` continua `undefined`; 2 toques a 150 ms na P2 → vai para `?etapa=3` | `Wizard.tsx` | Fim de qualificação errada no lead e de `wizard_skip`/`wizard_blocked` falsos | Prevenção de erro (Nielsen #5) |
| **F16** (médio, P na copy) | en/es: placeholder e erro com +55 recusam o número local; "+55 415 555 0134" passa como válido e errado | en: placeholder "+1 415 555 0134"; help "Start with + and your country code, e.g. +1 for the US."; erro "Add + and your country code, e.g. +1 415 555 0134." · es: placeholder "+52 55 1234 5678"; erro "Revisa el número: empieza con + y el código de tu país, por ejemplo +52 55 1234 5678 (México) o +57 300 123 4567 (Colombia)." Aplicar em `quote.contact_form.fields.phone`, `contact.form.fields.phone` e `shared.errors.invalid_phone`. Manter WhatsApp como canal padrão no es. Abaixo de 768 px, `scroll-padding-bottom` do tamanho da barra no formulário | i18n en/es | ↓ `form_validation_error` de telefone em en/es; menos lead com número impossível | Validação que ensina; contexto local |

**Pacote B · Preço, prazo e garantias à vista**

| Key | Problema | Recomendação exata | Onde | Impacto esperado | Técnica |
|---|---|---|---|---|---|
| **F01** (médio, P cada) | "O código fica com a minha empresa?" é o último item, fechado, do FAQ da Home e dos serviços; NDA tem 0 menções em `/`, nos 4 serviços, em `/sprint-de-descoberta` e em `/quanto-custa`; a faixa de compromissos usa "Sustentação…, se você quiser" | 1) Trocar `shared.commitments.items.after_launch` por `code_owned` = pt "O código é da sua empresa, por contrato" · en "Your company owns the code, by contract" · es "El código es de tu empresa, por contrato" (Home, 4 serviços e linha compacta de `/orcamento`; manter 4 itens). 2) `home.risks.pairs.vendor_disappears.answer` = "Você vê o projeto andar a cada entrega, e o código é da sua empresa, por contrato: se um dia quiser trocar de fornecedor, ele fica com você." 3) FAQ da Home: `code_ownership` em 3º; na ordem de remoção, `how_follow_progress` sai antes de `nda`. 4) Serviços: tirar `nda` de `SERVICE_FAQ_REMOVAL` em sistemas-web e integrações; **adicionar** `nda` em aplicativos e MVP (no MVP logo após `code_ownership`, tirando `what_is_mvp`); no hero do MVP, "· NDA se você pedir". 5) `/orcamento`: subir as duas perguntas do FAQ "Antes de começar" de 7º/8º para 2º/3º. 6) `/como-trabalhamos`: 4º card em `how_we_work.agreement` e linha "Código" na tabela. No mesmo PR: F42, F37 e F41 (Polimento) | `src/i18n/*.json`; `src/components/services/kit/service-faq.ts`; FAQ da Home | ↓ ansiedade perto do CTA; ↑ cliques no CTA do hero e da faixa; menos perguntas de NDA no WhatsApp | Inversão de risco; reduzir ansiedade (modelo LIFT) |
| **F15** (médio, P) | A página de integrações não diz nada sobre NDA nem sobre acesso aos dados do ERP e do financeiro | Trocar `how_follow_progress` (redundante ali) por `services.integrations.faq.data_access`, em 3º. P: "Vocês assinam NDA? E quem acessa os dados dos meus sistemas?" R: "Sim. Se o projeto pede sigilo, a gente assina o acordo de confidencialidade (NDA) antes de você contar os detalhes. É só pedir pelo WhatsApp ou pelo e-mail {email}. Quais acessos a integração precisa, onde ela roda e quem vê os dados ficam definidos no plano da Sprint de Descoberta, antes de fechar escopo, prazo e preço." Corrigir `services._notes.faq_composition` (diz que o NDA está em `/quanto-custa`; não está) | `service-faq.ts`; i18n ×3 | O avaliador técnico consegue defender o fornecedor internamente | Tratar a objeção eliminatória onde ela surge |
| **F08** (médio, P) | Preço e prazo respondidos pela negativa: `pricing.hero.lead` e `meta.pricing.description` abrem com "Depende do escopo."; `reference_before_talking` com "Antes da conversa, não"; prazos com "a gente não chuta prazo" | `pricing.hero.lead`: "O preço sai fechado antes do desenvolvimento. O diagnóstico é gratuito; a Sprint de Descoberta tem valor combinado antes de começar e termina com o preço do seu escopo. Só então você decide se segue." · `meta.pricing.description`: "Os 7 fatores que mais pesam no preço de um sistema ou aplicativo, como comparar orçamentos e como ter o preço fechado antes de desenvolver." · `faq.items.reference_before_talking.answer_without_pricing`: "Um número para o seu caso sai depois de entender o escopo. O que dá para saber já: os 7 fatores desta página mostram o que encarece ou barateia o projeto. E, se fizer sentido seguir depois do diagnóstico gratuito, o valor da Sprint de Descoberta vem por escrito antes de você pagar qualquer coisa. Tem um valor em mente? Indique a faixa no pedido." · `services.mvp.faq.price`: "O preço do MVP sai fechado na Sprint de Descoberta, e o que mais pesa nele é o tamanho da primeira versão. Tem um valor em mente? Conte no diagnóstico gratuito: o escopo priorizado mostra o que cabe nele. Se fizer sentido seguir, a proposta da Descoberta vem com o valor dela." · `how_long_mvp`: "O prazo sai fechado na Sprint de Descoberta, junto com o preço, e depende do que a primeira versão precisa provar. Tem data de captação ou de piloto? Conte no diagnóstico: o plano mostra o que cabe até lá. No desenvolvimento, você recebe software funcionando a cada 2 semanas." · Em `how_long_system/app/integration`, tirar "e a gente não chuta prazo" e abrir com "O prazo sai fechado na Descoberta, junto com o preço…". Replicar en/es | i18n ×3 | ↑ CTR de `/quanto-custa` na busca; menos leitura de "evasiva" (decisão 3 preservada) | Enquadramento positivo (framing) |
| **F12** (médio, P) | No MVP, "Quanto custa" e "Quanto tempo leva" ficam nas telas 11,2 e 12,1 de 16,3 no iPhone | 1) Hero do MVP: link terciário "Quanto custa e quanto tempo leva um MVP? ↓" para `#perguntas` (origem `mvp-hero-preco`). 2) Em `service-faq.ts` (lista mvp), `how_long_mvp` logo depois de `price`. 3) `services.mvp.subtitle`: "Você conta o orçamento e a data; a gente corta a primeira versão ao essencial e fecha prazo e preço antes do desenvolvimento." (conferir CTA acima da dobra em 360×640). Não criar bloco novo | `ServiceHero.astro`; `service-faq.ts`; i18n ×3 | Objeção nº 1 respondida na 1ª tela do tráfego pago; comparar cliques `mvp-hero-preco` × `mvp-hero` | Tratar a objeção onde ela surge |
| **F14** (médio, P) | A seção "A Lemamon em outros canais" ocupa ~1.055 px (1,6 tela) no celular entre Serviços e FAQ, com 3 cards para perfis ainda vazios | Manter `publicar: true` (decisão 6). Home `#confira`: `<Profiles variant="inline">` abaixo de 768 px (a variante já existe). `home.trust_profiles.text`: "Lemamon.dev LTDA · CNPJ 69.700.690/0001-98 · São Paulo, SP" (en/es com o rótulo "Brazilian company registration (CNPJ)" / "Registro de empresa en Brasil (CNPJ)"). Em `/contato`, perfis em linha depois do card de e-mail | `HomeTrustProfiles.astro`, `Profiles.astro`, `ContactChannels.astro`; i18n ×3 | FAQ e CTA final sobem ~1 tela no celular; prova de existência em vez de perfil vazio | Prova verificável; reduzir distração |

**Pacote C · Pós-envio e formulários**

| Key | Problema | Recomendação exata | Onde | Impacto esperado | Técnica |
|---|---|---|---|---|---|
| **F07** (médio, P) | `joao@gmail.con`, `gmial.com`, `hotmal.com`, `gmail..com` passam; com canal E-mail o telefone é opcional e o lead some | `suggestEmail(value)` em `src/lib/forms.ts`, sem bloquear: lista BR (gmail.com, hotmail.com, hotmail.com.br, outlook.com, outlook.com.br, live.com, yahoo.com, yahoo.com.br, icloud.com, uol.com.br, bol.com.br, terra.com.br, ig.com.br); **nunca** sugerir se o domínio já está na lista (uol × bol); `gmail.com.br → gmail.com`; em domínio de empresa só corrigir o final (`.con/.cpm/.vom/.comm/.om → .com`, `.com.bt/.com.vr/.combr → .com.br`). Texto: "Você quis dizer joao@gmail.com? [Corrigir]" · en "Did you mean …? [Fix it]" · es "¿Quisiste decir …? [Corregir]", em `aria-live="polite"`, chave em `shared.forms.email_suggestion`. Complemento: rejeitar `..`, ponto no início/fim e TLD de 1 letra | `src/lib/forms.ts`; wizard e `/contato`; i18n ×3 | Recupera leads de alto valor que hoje se perdem em silêncio | Prevenção de erro; recuperação de lead |
| **F10** (médio, P/M) | O obrigado não confirma o contato deixado, não tem como corrigir dado errado e apresenta o WhatsApp como opcional, abaixo da 1ª tela do iPhone (topo em 691 px) | Campo `channelContact` no `SentSummary` (`lead.ts`). `quote.sent.steps.contact_by_channel.whatsapp`: "A gente fala com você pelo WhatsApp {contato} para marcar o seu diagnóstico." · `.email`: "A gente escreve para {contato} para marcar o seu diagnóstico. A mensagem sai de {email}. Se não estiver na caixa de entrada, confira o spam." · `.phone_call`: "A gente liga para {contato} para marcar o seu diagnóstico." Abaixo: "Algum dado errado? Mande o certo pelo WhatsApp com o código do pedido." (mensagem "Olá! O contato do meu pedido {protocolo} saiu errado. O certo é: "). Canal WhatsApp: `whatsapp_now.text` "Quer agilizar? Mande um “oi” agora", apoio "A mensagem já leva o código do seu pedido e a conversa fica no seu WhatsApp.", botão "Mandar oi no WhatsApp", e menos espaço antes para entrar na 1ª tela. Aplicar o código também no "Dúvidas? WhatsApp" do topo. Não publicar o número da Lemamon (BLUEPRINT §1.5) | `SentConfirmation.astro`, `sent-page.ts`, `lead.ts`; i18n ×3 | ↑ diagnósticos marcados ÷ leads (conversa aberta pelo lead, número salvo) | Compromisso e consistência; reduzir fricção do primeiro contato |
| **F40** (médio, P na 1ª camada) | Em `/contato`, a dica "Projeto novo?" aparece depois de nome, e-mail e WhatsApp preenchidos e manda para o wizard, que pede tudo de novo | 1ª camada (P): mover o fieldset "Assunto" para o topo do formulário em `ContactForm.astro`, para a dica aparecer antes de digitar. `contact.form.new_project_tip_lead`/`new_project_tip`: "Pode escrever por aqui. Se preferir, responda 6 perguntas e veja o resumo do seu projeto na hora →". Mesmo ajuste em `existing_system_tip`. (2ª camada em "Próximo") | `src/components/contact/ContactForm.astro`; i18n ×3 | O desvio para o wizard deixa de custar trabalho já feito | Não pedir dado duas vezes |

**Pacote D · Robustez**

| Key | Problema | Recomendação exata | Onde | Impacto esperado | Técnica |
|---|---|---|---|---|---|
| **F13** (médio, M) | Com o "Tamanho da fonte" do Chrome em Grande (20 px) ou Muito grande (24 px), o CTA do header sai da tela e surge rolagem lateral: 151 px em 1024@20, 293 px em 1280@24 | Trocar px por `em` em todas as `@media` de `Header.astro`, `MobileDrawer.astro` e `LanguageSelector.astro` (768px→48em, 1024px→64em, 1279.98px→79.999em), de preferência no site todo. **Obrigatório junto:** `minWidth()` e `NAV_QUERIES` em `src/styles/breakpoints.ts` em `em`, senão a barra fixa não aparece. Não usar `.site-header__nav{overflow:hidden}` (corta o dropdown). E2E com `cdp.send('Page.setFontSizes', { fontSizes: { standard: 24, fixed: 20 } })` | Header, drawer, seletor, `breakpoints.ts` | 0 px de rolagem lateral com 20 e 24 px (testado em tempo de execução); CTA do hero volta à 1ª dobra | Robustez para o decisor que amplia a fonte |

**Pacote E · Medição (para saber se o resto funcionou)**

| Key | Problema | Recomendação exata | Onde | Impacto esperado | Técnica |
|---|---|---|---|---|---|
| **F11** (médio, P) | O formulário de `/contato` envia só `{form-name, lang, origin}`; o lead de anúncio chega sem `gclid` nem UTM | Incluir `attribution` e `gclid` em `FORM_FIELDS.contato` (`src/lib/forms.ts`) e na declaração do `NetlifyForms.astro`; no submit de `contact-form.ts`, `buildAttribution({ pathname, search, host, referrer, sessionTouch: readSessionTouch() })` com `gclidAllowed()` / `withoutAdClickIds()` (mover essas funções de `lead.ts` para `src/lib`). Política: `privacy.sections.data_collected.draft_measurement` passa a dizer "o formulário de orçamento ou o de contato" (×3). CRM: colunas entrada, utm_source, utm_medium, utm_campaign e gclid na aba Contato (playbook 05 §6). Já: importar `contact_submitted` do GA4 como conversão **secundária** no Ads | `forms.ts`, `contact-form.ts`, `NetlifyForms.astro`; i18n ×3; playbooks 05 e 07 | CPL do Ads e importação offline passam a ver esse lead | Atribuição fechada |
| **F34** (médio, P) | As mensagens de WhatsApp citam a página, nunca a campanha; `whatsapp_click` não vai ao Ads | Script no carregamento: se o toque da sessão (`lemamon:atribuicao:v1`) tiver `utm_medium=cpc` ou `gclid`, acrescentar ao `text=` de todo `a[data-track=whatsapp_click]` (e às mensagens que a ilha abre por JS) a linha "Ref.: G-{campanha curta}" ou "Ref.: G-ads"; nunca o `gclid`. Playbook 05: preencher utm_* na linha WA-* quando houver "Ref.: G-…"; 07 §6 e §7 contam essas linhas. 07 §4: importar `whatsapp_click` e `contact_submitted` como **secundárias** | script no cliente; playbooks 05 e 07 | Palavra-chave que gera conversa no WhatsApp deixa de parecer que não converte | Atribuição fechada |

Também antes de ligar o Ads, do Polimento: **F82** (modo `?debug_analytics=1` para conferir eventos no preview), **F81** (`gbraid`/`wbraid` do iOS) e **F26** (atribuição entre abas).

### Próximo — esforço maior ou dependente de medição

| Key | Problema | Recomendação | Onde | Impacto esperado | Técnica |
|---|---|---|---|---|---|
| **F20** (médio, M) | Um clique a mais entre o CTA e a 1ª pergunta; no desktop, a entrada ocupa só a metade esquerda e pula de eixo ao abrir a P1 | **Medir antes:** `wizard_start ÷ wizard_view` por origem. Se o início vindo de CTA interno ficar abaixo de ~80%: entrada em 2 colunas ≥1024 px, com um cartão "Pergunta 1 de 6 · Em que ponto você está?" e as 5 opções da P1 como **botões** (não radios, para não ferir o §7.2/WCAG 3.2.2); clicar grava o stage, dispara `wizard_start` e abre a P2. Alinhar entrada e P1 no mesmo eixo. `?etapa=1` direto só sem rascunho | `QuoteEntry.astro`, `QuoteView.astro`, `Wizard.tsx` | ↑ início do formulário | Pé na porta (foot-in-the-door) |
| **F38** (baixo, M) | Home com 19,8 telas e `/como-trabalhamos` com 19,6 no celular; método repetido na mesma página | Home <768 px: trocar o cartão `.plan` do hero (543 px) por 1 linha "Diagnóstico grátis → Descoberta paga → Entregas a cada 2 semanas → Sustentação · Ver como trabalhamos ↓" (~−450 px). `/como-trabalhamos`: `HwwTimeline` com `variant="compact"` (~−500 px). Manter a timeline nos serviços e no resumo | `HomeHero.astro:70`; `HwwTimeline.astro:23` | Problema, riscos e FAQ sobem; menos "pular blocos" | Hierarquia; redução de redundância |
| **F52** (baixo, P–M) | Da Home ao wizard pronto: 1,3–1,6 s no celular lento, baixando ~114 KB só depois do toque | Script ocioso (requestIdleCallback, só em 4G e sem `saveData`): prefetch do **href exato** do CTA visível, `modulepreload` de `Wizard.*.js` e `client.*.js`, prefetch dos 2 CSS. Lista de hashes gerada por uma integração de build num data-attribute. Speculation Rules só como bônus (hoje o `csp.ts` não gera hash para elas) | `analytics-delegate` ou `header.ts`; integração de build | FCP→pronto de ~1,1 s para ~0,5 s (medido com preload ocioso) | Latência percebida |
| **F53** (baixo, M) | React é 72–73% do JS de `/orcamento` (61–62 de ~90 KB br); orçamento do build em 92,1 de 100 KiB | 1º: retorno visual imediato no toque (F25). 2º: `@astrojs/preact({ compat: true })`, `react`/`react-dom` → `preact/compat`; E2E completo nos 3 idiomas. Expectativa: funil de ~90 para ~38–42 KB br; teto novo ~45 KiB | `astro.config`, `tsconfig`, `Wizard.tsx` | −0,3 a −0,45 s no 4G lento; folga para a agenda online | Peso de JS |
| **F71** (baixo, M; não verificado) | Em `/es/`, âncoras e parâmetros em português (`#desenvolvimento`, `?etapa=resumo`) | ids localizados (`#desarrollo`, `#mantenimiento`) com alias vazio em pt; aceitar `etapa=resumen`/`contacto` | componentes de método; `QuoteView` | Menos cara de site traduzido | Localização |
| **F91** (baixo, M; não verificado) | CSS bloqueante de `/orcamento` quase todo sem uso na entrada (MethodTimeline 0%, QuoteView 19%) | Carregar `MethodTimeline.css` só no resumo; separar CSS da entrada e das perguntas | build de `/orcamento` | −100 a −250 ms de FCP (estimado) | Caminho crítico |
| F16, 2ª fase (M) | — | Código do país pela região de `navigator.languages` (en-US +1, es-MX +52, es-CO +57…): placeholder e sugestão "Did you mean +1 415 555 0134? [Use this]" no blur; não pré-preencher o input | wizard e `/contato` | ↓ erro de telefone em en/es | Validação que ensina |
| F40, 2ª fase (M) | — | Ao sair do `/contato` para o wizard (`contato-dica-projeto`, `contato-sistema-existente`, `contato-sucesso`), guardar nome, e-mail e telefone em sessionStorage e pré-preencher o contato do wizard; antes, linha nova em `privacy.sections.data_collected` | `contact-form.ts`, `Wizard.tsx` | Não pedir o mesmo dado duas vezes | Não pedir dado duas vezes |
| F45, 2ª fase (M) | — | Botão secundário "Enviar para quem decide": link com as respostas codificadas (sem nome nem contato), `track('summary_share')`; quem recebe abre o mesmo resumo com o CTA | `Wizard.tsx` | O decisor vira o lead | Venda em grupo (B2B) |

### Depende do dono — campo de `dados/dono.json` (ou decisão)

| O que falta | Campo ou decisão | Achados que destrava | Mitigação que já funciona sem o dado |
|---|---|---|---|
| **Pôr o site no ar** | `privacidade.baseAnuncios`, `.encarregado`, `.prazos.*` (6), `.atualizadaEm`; variável `PUBLIC_WHATSAPP_NUMBER` (este build usa o número de teste `5548900000000`) | Tudo; F62 | — |
| Pessoa com nome e rosto | `time[]` (1 pessoa basta) | F57 | F01 (garantias), F14 (CNPJ na seção de perfis) |
| Prova de trabalho | cases (coleção de conteúdo; hoje só a camada fictícia), `depoimentos[]`, `logos[]` | F57, F43 | F43 (exemplos B2B), F37 (régua com a pergunta do código) |
| Agenda logo após o envio | `agenda.url` + `privacidade.ferramentas.agenda` (o `SentSchedule` já está pronto) | F57, F10 | F10 (primeiro "oi" no WhatsApp) |
| A etapa paga | `descoberta.duracao`, `.formato`, `.participantes`, `.ritmo`, `.naoInclui`; `confirmacoes.duracaoDescoberta`, `.planoDoCliente`, `.descobertaAbatida`, `.descobertaUnicoCusto` | F58; F09 (frase "o plano mostra o que cabe até a sua data") | F02 mantém "Paga · valor combinado antes do início" visível |
| Avaliador técnico | `engenharia.*` (8 campos), `confirmacoes.timeDoCliente` | F58, F44 (refutado, mas a lacuna de engenharia é real) | F15; F48 passo 1 (README da organização no GitHub) |
| Perfis com conteúdo | `perfis.linkedin.url` (`/company/`); 1 repositório ou `lemamon-dev/.github/profile/README.md`; 1 artigo no Medium | F14, F48, F86 | F14 (variante inline) |
| Atender fora do Brasil? | Decisão D31 (não há campo ainda; hoje `confirmacoes.outrasCidades = false`) | F17, F32, F16 | FAQ en/es "¿Trabajan con empresas fuera de Brasil?" de F17 item 2, que não afirma atendimento |
| Logística do diagnóstico | `confirmacoes.formatoDiagnostico`, `.notaFiscal`, `.outrasCidades` | F60 | — (os FAQs já existem e ligam sozinhos) |
| Conteúdo da devolutiva | `confirmacoes.devolutivaConteudo` | F61 | — |
| Falar de valores no diagnóstico | `confirmacoes.valoresNoDiagnostico` (sem publicar preço) | F08 (opcional), F09 item de preço, Cláudia | F08 sem o dado |
| Prazo de resposta | Novo campo (ex.: `confirmacoes.prazoResposta`); hoje vetado pelo BLUEPRINT §12 | F59 | F10 |
| Aviso de privacidade mais curto | `privacidade.classificacaoDefineAtendimento` + revisão LGPD | F79 | — |
| "Para PMEs" ou "Para empresas" | Decisão `entry_placement` | F63 | — |
| Escassez real | D19 (limite semanal de diagnósticos) | F57 | Não usar escassez sem o dado |
| URL final dos anúncios | Playbook 07 §5: `/orcamento` ou página de serviço em vez da Home | F54, F35 | — |
| Taxa de referência USD/BRL | Valor aprovado em `dono.json` (só se a D31 for "sim") | F32 | Opções "Not sure yet" e "prefer to discuss" já existem |
| Abrir o código do site | Decisão do dono (esforço G: tirar `_notes` do i18n, `dados/dono.example.json`, histórico novo) | F48 passo 2 | F48 passo 1 |

### Polimento — baixos

Confirmados:

| Key | Recomendação curta | Onde | Técnica |
|---|---|---|---|
| F18 | `quote.entry.quick_faq.price_at_end.answer_no_pricing_variant` = "Você sai com o resumo do seu caso: o que pesa no prazo e no preço, o caminho até o software rodando e a pauta do seu diagnóstico. O preço fechado vem depois, e de propósito:" (en "You'll leave with a summary of your project…", es "Sales con el resumen de tu caso…"); manter a pergunta | i18n ×3 | Benefício antes da limitação |
| F19 | Agora: devolver "de clique" ao subtítulo ("Responda 6 perguntas de clique…"). Depois de medir `wizard_start → wizard_summary_view`: "São 6 perguntas de clique, uns 3 minutos…" e botão "Começar as 6 perguntas (3 min)" | `quote.entry.subtitle`, `.start` | Custo de tempo explícito |
| F22 | Helper da P3 "Marque até 3. Se nada disso pesa hoje, é só tocar em Continuar." e remover o "Pular" solto; tirar o `font-weight` do `.optionText` marcado; citar "prefira conversar no diagnóstico" no helper da P5. Sem avanço automático (vetado no BLUEPRINT) | `Wizard.tsx`, `Wizard.module.css`, i18n | Saída prometida visível |
| F23 | "Recompensar cedo, punir tarde": no blur, só erro de formato de campo preenchido; "obrigatório" só depois do envio; `trackFieldError` só com campo preenchido; `aria-describedby` em cada rádio do Assunto | `Wizard.tsx:872–893`, `contact-form.ts:100–147`, `ContactForm.astro:187` | Validação no momento certo |
| F24 | Guardar o contato do wizard em sessionStorage (`lemamon:orcamento:contato:v1`, debounce 300 ms, sem o honeypot) e reidratar em `?etapa=contato`; ajustar antes `privacy.sections.data_collected.draft` | `Wizard.tsx`, `lib/draft.ts`, i18n | Não perder trabalho do usuário |
| F25 | No script inline do `QuoteView.astro` (l.155–163), marcar o botão com `data-loading`, `aria-busy` e `aria-disabled` (spinner do `Button.astro` já existe), com volta ao normal em 8 s; limpar na montagem da ilha | `QuoteView.astro`, `Wizard.tsx:542` | Retorno imediato (Nielsen #1) |
| F26 | `BroadcastChannel('lemamon:atribuicao')` para a aba nova adotar o toque de campanha de outra aba aberta; fallback do cookie `_gcl_aw` já agora. Não usar localStorage por 90 dias nem UTM em link interno | `analytics-delegate.ts`, `buildAttribution` | Atribuição entre abas |
| F27 | `onAuxClick` nos links de WhatsApp do resumo; href com texto fixo seguro; no resumo, o "Dúvidas? WhatsApp" do topo abre a mensagem com as respostas; nas perguntas, "…na pergunta {n} de 6 ({tema})…". Nunca `deadline_reason` no href | `Wizard.tsx` | Manter contexto ao trocar de canal |
| F28 | `SERVICE_PREFILL`: sistemas-web → `["ops_system"]`, integrações → `["integration"]`; contexto "…já deixamos marcado “{opcao}”…"; opcional contar integração + automação como uma frente | `model.ts:297–299`, `rules.ts` | Personalização correta |
| F29 | Em modo edição, se a troca da P1 mudar a variante da P3 e ela estiver vazia, ir para a P3 (`p3AtEditRef`) | `Wizard.tsx` onEdit/advance | Integridade do dado |
| F30 | Na P4, com resposta ≠ "Ainda não tenho prazo", `scrollIntoView({ block: 'nearest' })` no campo de data (sem focar); placeholder "Ex.: captação em março, piloto com cliente" só para produto/MVP | `Wizard.tsx`, i18n | Campo visível |
| F31 | `LanguageSuggestion` na entrada do wizard (some no modo foco), mantendo a query menos `etapa`; seletor de idioma no rodapé mínimo; atualizar BLUEPRINT §9 | `Base.astro:210`, rodapé do wizard | Localização |
| F35 | Playbook 07 §5: RSA próprio para `orcamento`/`quanto-custa` com a **descrição** fixada "Sem tabela de preço: o valor sai do escopo. Comece pelo diagnóstico gratuito de 45 min."; negativas "tabela de preço", "valor hora", "barato", "calculadora", "freelancer"; sitelink "Pedir diagnóstico" → `/orcamento`; `quanto-custa` fora das primeiras campanhas | playbook 07 | Pré-qualificação no anúncio |
| F37 | 7ª pergunta em `pricing.how_to_compare.questions.code_ownership` ("De quem é o código no fim do projeto?" / "Na Lemamon: o código desenvolvido para o seu projeto é da sua empresa, e isso fica escrito no contrato."); link "Veja as perguntas que deixam orçamentos comparáveis" → `/quanto-custa#como-comparar` no par `incomparable_quotes` da Home | `PricingHowToCompare.astro`, i18n | Definir o critério de comparação |
| F39 | Âncora "Prefere escrever? Ir para o formulário ↓" no hero de `/contato`; perfis em linha no celular; `contact.channels.location` com razão social e CNPJ; linha "A gente responde pelo e-mail ou pelo WhatsApp que você informar." | `ContactHero/Channels/Form.astro` | Caminho visível para a conversão secundária |
| F41 | `shared.cta.microcopy_diagnosis` = "Sem compromisso · 45 minutos · devolutiva por escrito" (en "No obligation · 45 minutes · written feedback", es "Sin compromiso · 45 min · conclusiones por escrito"), com `NoBreakText` para a quebra cair antes do "·" | i18n ×3, `CtaDiagnosis` | Inversão de risco no ponto de clique |
| F42 | `faq.items.wont_stall.answer_with_code_ownership` (condicionada a `codigoProprietario`): "… E o código desenvolvido é da sua empresa, por contrato: se um dia precisar seguir com outro fornecedor, ele está com você." | `faq-compose.ts`, i18n | Inversão de risco |
| F43 | `services.web_systems.examples.5.text`: "Pedidos, segunda via e status numa área exclusiva do seu cliente (o revendedor que hoje liga para saber do pedido, por exemplo)…"; ampliar `examples.2.text` com "clientes e representantes, com a tabela de preço de cada cliente" | i18n ×3 | Identificação do leitor |
| F45 | Com `role` ∈ {recommend_to_decider, decide_with_partners}, `summary.below_primary_share`: "Falta só o seu contato. Depois de enviar, você recebe este resumo pronto para repassar a quem decide. Gratuito e sem compromisso de contratar." | `Wizard.tsx` renderSummary, i18n | Motivo para enviar |
| F46 | `@media print`: `[data-surface="inverse"]` volta aos tokens claros; linha "Diagnóstico gratuito: lemamon.dev/orcamento" só no papel; abrir os `<details>` no `beforeprint` | `global.css`, `CtaFinal`, layout | PDF que convence |
| F47 | `/como-trabalhamos` ≥1024 px: slot visual no `PageHero` (7+5) com o índice das 4 etapas (o `HwwStageIndex` hoje some no desktop) | `PageHero.astro`, `HwwStageIndex.astro` | Mapa do método na 1ª tela |
| F49 | `CopyEmail.astro`: endereço vira `mailto:` com assunto só no toque (`pointer: fine` mantém texto selecionável); "Copiar" segue principal; atualizar B145 e o teste `shared-render.test.ts:160`. Esconder `.wizard-footer__sep` abaixo de 480 px | `CopyEmail.astro`, `WizardFooter` | Menos passos no canal secundário |
| F51 | `@media (max-height: 34em)`: header do wizard e `.actions` estáticos; rótulo de progresso curto ("6/6", "Resumo", "Contato") via container query | `wizard-chrome.css`, `Wizard.module.css` | Reflow com zoom |
| F55 | Lighthouse mobile num build `CONTEXT=production` com e sem gtag/New Relic (coletores bloqueados) antes do corte; linha de base com teto de TBT e LCP | processo | Medir o que vai ao ar |
| F56 | Injetar o New Relic depois do `load` (requestIdleCallback) em vez de `defer` no head; checagem de teto do arquivo em `dist` | `Analytics.astro`, `consent.ts` | Caminho crítico |

Não verificados, novos (fazer quando sobrar tempo; detalhe na seção d): F64, F65, F66, F67, F68, F69, F70, F72, F73, F74, F75, F76, F77, F78, F80, F81, F82, F83, F84, F85, F87, F88, F89, F90, F92, F93. **F81, F82, F83 e F84** valem antes de ligar o Ads, porque afetam a leitura do próprio funil.

---

## (d) Achados

### Confirmados — severidade alta

#### F02 · O resumo do wizard deixa a recompensa 2 a 3,5 telas abaixo do eco das respostas — alto · M
- **Onde:** `/orcamento?etapa=resumo`, `/en/quote`, `/es/cotizacion` · todos os dispositivos.
- **Evidência (reproduzida, fluxo P1 problema na operação → P2 sistema de gestão + integração → P3 processo manual → P4 3 meses → P5 R$ 30–80 mil → P6 eu decido):**

  | Dispositivo | Suas respostas | Caminho | Pauta | Fatores | Preço | Página |
  |---|---:|---:|---:|---:|---:|---:|
  | iPhone 13 (vh 664) | 316 | 926 | 2.175 | 2.406 | 2.711 | 3.396 |
  | Pixel 7 | 285 | 874 | 2.123 | 2.353 | 2.633 | 3.300 |
  | 1024 / 1280 / 1440 | 275–276 | 959–961 | 2.050–2.053 | 2.232–2.237 | 2.415–2.420 | 3.026–3.033 |

  No celular sobram ~486 px úteis por tela (header de 65 px e barra de 113 px). Em 1440×900 a dobra mostra só H2, intro, os 6 chips e o CTA; em 1280×800 nem o CTA. en e es têm a mesma estrutura.
- **Prints:** `out/verify-F02/pt-mobile-summary-fold.png`, `out/verify-F02/pt-desktop-summary-fold.png`, `out/verify-F02/pt-desktop-summary-full.png`, `out/verify-F02/{en,es}-{mobile,desktop}-summary-{fold,full}.png`; script `out/verify-F02/01-summary-pos.mjs`.
- **Por que custa conversão:** `quote.entry.subtitle` promete "veja na hora o que influencia prazo e preço". É o último passo antes do formulário do funil principal; a primeira tela devolve o que a pessoa acabou de responder e a linha do método que ela já viu na Home (`MethodTimeline`, `QuoteView.astro:205`). Reciprocidade só funciona se o valor aparece antes do pedido.
- **Recomendação:** ver Pacote A. **Ajustes da verificação:** não esconder "Suas respostas" num `<details>` fechado (BLUEPRINT §7.4(a)); não reduzir a timeline a uma linha, porque "Paga" só aparece ali; o CTA cedo no desktop é decisão testada e continua, só muda o que vem antes dele.
- **Relatado por:** j2-claudia-desktop, s1-ux-ui, s2-cro.

#### F03 · Quem chega por CTA de página de serviço não vê "Começar as 6 perguntas" no celular — alto · P
- **Onde:** `/orcamento?servico=*` (+ en/es) · iPhone 13, Android 360×640/680.
- **Evidência (reproduzida, fluxo real `/servicos/aplicativos` → CTA do hero):** todos os 11 CTAs da página levam `?servico=aplicativos&origem=…`. Sem contexto, o botão fica em 559–607; com contexto, em 681–729 (703–751 em integrações) — abaixo da dobra em 390×664, 360×640 e 360×680; metade visível em en/es (648–696). Única ação visível: "Dúvidas? WhatsApp". A nota amarela diz "já deixamos marcado", mas na entrada nada está marcado; a mesma nota se repete na P2. Causa: `<div data-wizard-context>` antes de `.entry__actions` em `QuoteEntry.astro`, preenchido por portal em `Wizard.tsx` ~l.1825.
- **Prints:** `out/verify-F03/iphone13-servico-aplicativos.png` (sem botão), `out/verify-F03/iphone13-sem-ctx.png` (com botão), `out/verify-F03/fluxo-servico-aplicativos-360x640-landing.png`, `out/verify-F03/a360x640-simulacao-contexto-apos-botao.png` (correção simulada); `out/j1-rafael-mobile/14-mobile-entry-fold.png`.
- **Por que custa conversão:** é o tráfego de maior intenção (anúncio → serviço → "Pedir diagnóstico"), nos aparelhos mais comuns do Brasil, e cai numa segunda landing sem ação primária visível. Atinge `wizard_start`.
- **Recomendação:** ver Pacote A. **Ajustes da verificação:** no Pixel 7 o problema não existe (sobram ~140 px); o caso de 320 px é outro problema (densidade), raro em 2026.
- **Relatado por:** j1-rafael-mobile, s1-ux-ui, s4-marketing-seo.

### Confirmados — severidade média

#### F01 · Garantias já decididas (código do cliente, NDA) escondidas no fim do FAQ — médio · M (cada parte P)
- **Onde:** `/` (faixa, Riscos, FAQ), `/servicos/*`, `/como-trabalhamos`, `/sprint-de-descoberta`, `/quanto-custa`, `/orcamento` · todos.
- **Evidência (reproduzida):** o 4º item da faixa é "Sustentação e evolução após o lançamento, se você quiser" na Home e nos 4 serviços; "O código fica com a minha empresa?" é a última pergunta, fechada, do FAQ da Home e dos serviços (pt/en/es); `/\bNDA\b|confidencialidade|sigilo/` dá 0 em `/`, nos 4 serviços, em `/sprint-de-descoberta` e em `/quanto-custa`; a resposta a "O fornecedor que some…" não cita o código; `/como-trabalhamos` tem 3 cards em `agreement` e nenhuma linha de código; no wizard o `nda_note` só aparece ao abrir o campo opcional (`Wizard.tsx` 1666–1685); em `/orcamento` as duas perguntas estão em 7º e 8º de 8. O dono já confirmou: `confirmacoes.codigoProprietario = "answer_draft"`, `confirmacoes.nda = true`.
- **Prints:** `out/verify-F01/desktop-home-fold.png`, `out/verify-F01/desktop-home-riscos.png`, `out/verify-F01/desktop-home-faq-codigo.png`, `out/verify-F01/desktop-orcamento-full.png`, `out/verify-F01/mobile-mvp-fold.png`, `out/verify-F01/laptop-sistemas-web-fold.png`.
- **Por que custa conversão:** sem cases nem rosto, as garantias contratuais são a prova forte disponível. "Ficar refém do fornecedor" e "copiarem a minha ideia" são objeções eliminatórias para Cláudia, Marcos e Rafael, e quem passa os olhos não abre acordeão no fim da página. A sustentação aparece 5 vezes na Home; a posse do código, 1 vez e fechada.
- **Recomendação:** ver Pacote B. **Ajustes da verificação:** a faixa fica abaixo da dobra em 1280×800 e no celular (mas é o primeiro bloco depois do hero); tirar `nda` de `SERVICE_FAQ_REMOVAL` não basta em aplicativos e MVP (é preciso adicionar); não criar 5º item na faixa (componente de 1 a 4 colunas). Rebaixado de alto: a informação existe, o problema é destaque.
- **Relatado por:** j1, j2, j3, s2-cro, s3-copy.

#### F04 · No notebook, o "Continuar" das P2–P5 fica abaixo da dobra — médio · P
- **Onde:** `/orcamento` (P2–P5, resumo, contato), pt/en/es · 1366×768 (viewport ~657), 1280×800, 1536×864 a 125%, 1024×768, MacBook Air 1440×789.
- **Evidência (reproduzida):** bottom do Continuar em 1366×657: P1 597, **P2 803, P3 869, P4 721, P5 730**, P6 619. en: P2 803, P3 912, P4 699, P5 687. es: P2 803, P3 883, P4 764, P5 730. Na P2, "Ainda não sei" fica cortado; a P4 tem um falso fim (o último elemento visível é o campo opcional de data); na P5, "Prefiro conversar sobre isso" fica cortado. `.actions` só é `position: fixed` com `max-width: 767.98px`. O wizard não avança sozinho, então a pessoa procura o botão a cada passo. Atenuante: Enter avança, mas ninguém sabe disso.
- **Prints:** `out/verify-F04/p2-1366x657.png`, `out/verify-F04/p3-1366x657.png`, `out/verify-F04/p4-1366x657.png`, `out/verify-F04/p5-1366x657.png`, `out/verify-F04/p3-1366x657-sticky-prototipo.png` (correção testada); scripts `out/verify-F04/v1.mjs`–`v3.mjs`.
- **Por que custa conversão:** "uma pergunta por tela" só funciona com a ação sempre visível; as resoluções afetadas são as mais comuns em notebook de PME.
- **Recomendação:** ver Pacote A. **Ajustes da verificação:** o envio do contato tem bottom 1004 em todos os viewports, mas não é prioridade (o formulário rola com o Tab); a recomendação original de contato em 2 colunas e de padding menor foi descartada (contraria pesquisa de formulários; o padding já é 12 px).
- **Relatado por:** j2, s1-ux-ui, s5-qa.

#### F05 · No celular, o erro "Escolha uma opção" e o aviso "Você já marcou 3" ficam atrás da barra fixa — médio · P
- **Onde:** `/orcamento` (P1 e P3), pt/en/es · iPhone 13 e 360×640 (no Pixel 7 o erro da P1 aparece).
- **Evidência (reproduzida):** P1 sem escolha + Continuar: o texto fica em y=610–632 e a barra começa em 591 (567 em 360×640); a ilha foca a 1ª opção e rola ao topo, então mesmo quem rolou volta a ver o erro coberto. P3, toque na 4ª opção: nada muda na área visível; aviso em y=931 (iPhone), 894 (Pixel), 921 (360). Atenuantes: na P1 as opções ficam com borda vermelha; o helper diz "Marque até 3".
- **Prints:** `out/verify-F05/mobile-_orcamento-p1-after-continue.png`, `out/verify-F05/small360-_orcamento-p1-after-continue.png`, `out/verify-F05/mobile_orcamento-p3-4th-tap.png`, `out/verify-F05/android_orcamento-p3-4th-tap.png`; `out/s1-ux-ui/wiz-mobile-01-validation.png`.
- **Por que custa conversão:** feedback invisível num estado de erro, no tráfego majoritário; na P3, um toque sem nenhuma resposta parece defeito.
- **Recomendação:** ver Pacote A. **Ajustes:** `role="alert"` desnecessário (já há `role="status"` e `aria-describedby`); "erro acima das opções" sozinho falha na P3 para quem rolou.
- **Relatado por:** s1-ux-ui, s2-cro.

#### F06 · Duplo clique em "Continuar" grava resposta não escolhida (desktop) ou pula a P3 (celular) — médio · P
- **Onde:** `/orcamento`, en, es · desktop 1440, notebook 1280, iPhone 13, Pixel 7.
- **Evidência (reproduzida com dois cliques reais a 130 e 250 ms):** desktop/notebook P1→P2: a P2 abre com "Automação de tarefas ou atendimento…" marcada e `build_type: ["automation"]` no localStorage. Celular P1→P2: P2 abre com as 7 opções em vermelho. Celular P2: vai de `?etapa=2` para `?etapa=4`. Resumo → contato: no Pixel 7 o CTA do resumo e o envio têm o mesmo retângulo `[20,757,372,48]`; no iPhone 13 se sobrepõem em 30 de 48 px. `Wizard.tsx` não tem trava contra duplo clique.
- **Prints:** `out/verify-F06/p1-dbl-desktop.png`, `out/verify-F06/p1-dbl-mobile.png`, `out/verify-F06/p2-dbl-mobile.png`, `out/verify-F06/resumo-android.png`, `out/verify-F06/contato-android.png`.
- **Por que custa conversão:** hábito comum de público menos técnico; a tela vermelha na 2ª pergunta parece erro do usuário; qualificação errada no lead; a P3 (que alimenta a pauta) se perde; eventos falsos no GA4.
- **Recomendação:** ver Pacote A. **Ajustes:** `event.detail > 1` em `onContinue` não funciona (SubmitEvent não tem `detail`); trava só no Continuar não resolve o desktop, onde o 2º clique cai num `<label>` de opção. Rebaixado de alto: o resumo mostra o erro e tem "Alterar".
- **Relatado por:** s5-qa.

#### F07 · E-mail com erro de digitação passa e o lead fica sem contato — médio · P
- **Onde:** `/orcamento?etapa=contato` e `/contato`, pt/en/es · todos.
- **Evidência (reproduzida nos 6 formulários):** passam sem erro `joao@gmail.con`, `joao@gmial.com`, `joao@gmail..com`, `joao@empresa.com.`, `.joao@empresa.com`, `joao@empresa.c`, `joao@hotmal.com`, `joao@outlok.com`, `joao@gmail.com.br`. Com canal E-mail o telefone vira opcional. `isValidEmail` (`src/lib/forms.ts:223`) é `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, usado em `lead.ts:155` e `contact-form.ts:54`; os formulários usam `noValidate`.
- **Prints:** `out/verify-F07/wiz-pt-gmailcon-canal-email-mobile.png`, `out/verify-F07/wiz-{pt,en,es}-gmailcon-canal-email-desktop.png`, `out/verify-F07/contato-{pt,en,es}-gmaildotdot-desktop.png`.
- **Por que custa conversão:** é a perda mais cara do funil: a pessoa converteu e ninguém consegue responder, sem que ninguém perceba.
- **Recomendação:** ver Pacote C; acrescentar a linha "Algum contato errado?…" no obrigado (F10). **Ajustes:** só a sugestão pega `gmail.con` e `gmial.com` (sintaticamente válidos); a regra "distância ≤ 2" trocaria uol por bol. Rebaixado de alto: o autofill reduz a digitação manual.
- **Relatado por:** s5-qa.

#### F08 · Preço e prazo respondidos pela negativa, inclusive no hero e na meta description de `/quanto-custa` — médio · P
- **Onde:** `/quanto-custa` (hero, meta, FAQ), FAQs de preço e prazo dos 4 serviços, en/es · todos e SERP.
- **Evidência (reproduzida):** `meta.pricing.description` abre com "Depende do escopo." (en "It depends on scope.", es "Depende del alcance."); `pricing.hero.lead` idem, logo abaixo do H1; no MVP a primeira FAQ, aberta por padrão, é "Depende principalmente…"; "Consigo ter uma ideia de valor antes de conversar?" → "Antes da conversa, não: … seria chute"; três FAQs de prazo dizem "a gente não chuta prazo" (`pt.json` l.955, 959, 1068, 1072, 1171, 1175, 1262, 1271). Achado extra: H2 "Por que a gente não dá preço por formulário" na mesma página.
- **Prints:** `out/verify-F08/m-quanto-custa-dobra.png`, `out/verify-F08/d-quanto-custa-dobra.png`, `out/verify-F08/m-mvp-faq-price.png`, `out/verify-F08/m-quanto-ref-before.png`; `out/j2-claudia-desktop/04-quanto-s05.png`.
- **Por que custa conversão:** abrir pela negativa a pergunta nº 1 do comprador faz o "não" ficar na memória; na SERP, as duas primeiras palavras dizem "não vou responder". A decisão 3 não obriga a começar pelo "não".
- **Recomendação:** ver Pacote B. **Ajustes:** o "Depende" de `pricing.hero.lead` já está registrado em VALIDACAO (l.119, 147); o texto original proposto para `reference_before_talking` começava de novo com "não" e prometia demais; a meta não deve fixar "6 perguntas" (a 6ª depende de `confirmacoes.escopoMudanca`).
- **Relatado por:** j1, j2, s3-copy.

#### F09 · O resumo não usa o prazo de 3 meses nem a faixa que a pessoa acabou de informar — médio · P
- **Onde:** `/orcamento?etapa=resumo` (×3) · todos.
- **Evidência (reproduzida, variando só P4 e P5):** A = 3 meses + R$ 30–80 mil; B = 3 meses + "Ainda não sei"; C = "O quanto antes" + R$ 30–80 mil. Entre A e B só muda o chip "Investimento previsto"; pauta, fatores e "E o preço?" idênticos (`out/verify-F09/A.txt`, `B.txt`). Só C recebe "O que é essencial para a primeira entrega", o fator de urgência e o `deadline_note`. Causa: `isDeadlineUrgent` (`model.ts:282`) só considera `asap` ou data digitada; `topic_budget` só entra com faixas de preço publicadas.
- **Prints:** `out/verify-F09/A-3meses-30a80-desktop.png`, `out/verify-F09/B-3meses-naosei-desktop.png`, `out/verify-F09/A-3meses-30a80-mobile.png`, `out/verify-F09/C-asap-30a80-mobile.png`.
- **Por que custa conversão:** quem tem janela de 3 meses vê a Descoberta paga antes do desenvolvimento e não vê o resumo reconhecer a restrição dele.
- **Recomendação:** ver Pacote A (só a parte do prazo). **Ajustes:** o título original exagerava (os chips devolvem faixa e prazo); excluir `topic_budget` sem faixas foi decisão registrada em `quote._notes.topics`; prometer que "a proposta leva o valor em conta" é compromisso comercial novo e exige flag do dono.
- **Relatado por:** j1, j2, j5, s3-copy.

#### F10 · O obrigado não confirma o contato deixado nem leva ao primeiro "oi" — médio · P/M
- **Onde:** `/orcamento/enviado`, `/en/quote/sent`, `/es/cotizacion/enviada` · todos, crítico no celular.
- **Evidência (reproduzida com sessionStorage semeado, sem envio, nos canais whatsapp/email/phone_call):** o número da Lemamon não aparece (correto, BLUEPRINT §1.5); o telefone e o e-mail do lead ficam dentro do `<details>` "Ver e copiar o resumo do pedido", fechado para `i_decide`; nenhuma forma de corrigir um dado; o botão verde "Falar no WhatsApp agora" (com código) começa em 691 px numa tela de 664 e é apresentado como alternativa ("Prefere adiantar…?"); o "Dúvidas? WhatsApp" do topo não leva o código. O e-mail da Lemamon está no rodapé com "Copiar".
- **Prints:** `out/verify-F10/sent-wa-idecide-mobile-fold.png`, `out/verify-F10/sent-wa-idecide-mobile-full.png`, `out/verify-F10/sent-email-idecide-mobile-full.png`, `out/verify-F10/sent-phone-partners-mobile-full.png`, `out/verify-F10/sent-en-mobile-fold.png`, `out/verify-F10/sent-es-mobile-fold.png`.
- **Por que custa conversão:** a conversão que importa é o diagnóstico marcado. Mensagem de número desconhecido costuma ser ignorada; e-mail de domínio novo cai no spam; erro de digitação vira lead perdido. Se o lead manda o "oi", a conversa já está aberta e o número salvo.
- **Recomendação:** ver Pacote C. **Ajustes:** descartados número da Lemamon no copy, vCard e ícone de check; contra spam, a correção real é SPF/DKIM/DMARC (playbook 11).
- **Relatado por:** s1-ux-ui, s2-cro, s3-copy.

#### F11 · O formulário de `/contato` não envia UTM nem `gclid` — médio · P
- **Onde:** `/contato`, `/en/contact`, `/es/contacto` · todos.
- **Evidência (reproduzida):** pouso em `/servicos/mvp?gclid=…&utm_*` e clique em Contato: o toque da sessão tinha tudo; o FormData leva só `form-name, lang, origin, bot-field, name, email, phone, subject, message`. Vindo de sitelink direto, `origin` = `https://www.google.com`, indistinguível de orgânico. `FORM_FIELDS.contato` (`src/lib/forms.ts:49`) não tem `attribution` nem `gclid`; `contactOrigin()` lê só `?origem=` ou o referrer; o aviso do `/contato` promete "registramos como você chegou ao site", o que hoje não se cumpre.
- **Prints:** `out/verify-F11/A-desktop-contato-preenchido.png`, `out/verify-F11/B-mobile-contato-sitelink.png`, `out/verify-F11/C-android-_en_contact.png`.
- **Por que custa conversão:** falha de medição, não do visitante: o lead pago que escreve por ali fica fora da importação offline e do CRM.
- **Recomendação:** ver Pacote E. **Ajustes:** o CPL do Ads não infla hoje (a conversão do Ads só dispara no wizard); o GA4 já atribui `contact_submitted`; Ads ainda não está no ar. Rebaixado de alto.
- **Relatado por:** s4-marketing-seo.

#### F12 · No MVP, preço e prazo só nas telas 11 e 12 de 16 no celular — médio · P
- **Onde:** `/servicos/mvp` (+ en/es) · iPhone 13 (16,3 telas), Pixel 7 (12,5 telas).
- **Evidência (reproduzida com URL de CPC):** "O que pesa no preço de um MVP" na tela 8,9; "Quanto custa desenvolver um MVP?" na 11,2; "Quanto tempo leva um MVP?" na 12,1 (Pixel 7: 7,0, 8,8 e 9,4). A pergunta de prazo é o 5º item, fechado, atrás de `wont_stall` e `code_ownership`, contra o próprio comentário de `service-faq.ts`.
- **Prints:** `out/verify-F12/mobile-01-fold.png`, `out/verify-F12/mobile-02-tela2.png`, `out/verify-F12/mobile-04-price-factors.png`, `out/verify-F12/android-01-fold.png`, `out/verify-F12/360-01-fold.png`; `out/j1-rafael-mobile/01-mvp-fold.png`.
- **Por que custa conversão:** a objeção precisa ser tratada onde surge, e quem chega por CPC decide nas primeiras telas; o adiamento perde a atribuição (F26).
- **Recomendação:** ver Pacote B. **Ajustes:** a âncora `#preco-mvp` não existe (use `#perguntas`); evitar "Orçamento apertado?" (posiciona como barato) e "Não publicamos tabela" (quebra com `hasPricing`).
- **Relatado por:** j1-rafael-mobile.

#### F13 · Com a fonte do navegador ampliada, o CTA do header sai da tela e aparece rolagem lateral — médio · M
- **Onde:** todas as páginas com o header padrão · 1024/1280/1440 com "Tamanho da fonte" Grande (20 px) ou Muito grande (24 px).
- **Evidência (reproduzida com `Page.setFontSizes`, o mesmo mecanismo do ajuste do Chrome):** Home 1024@20: 151 px de rolagem, CTA cortado em "Pedir diag"; 1024@24: 382 px; 1280@20: 33 px; 1280@24: 293 px, CTA em x 1256–1573, e nenhum CTA de diagnóstico inteiro na 1ª dobra (o do hero fica em y 815–887 de 800); en 184 px, es 325 px, `/contato` 298 px; 1440@24: 133 px. O único elemento que estoura é `div.site-header__actions`. Com 16 px: 0.
- **Prints:** `out/verify-F13/real20-small_desktop-_.png`, `out/verify-F13/real24-laptop-_.png`, `out/verify-F13/emfix24-laptop-_.png` (correção testada), `out/verify-F13/protecao-nav-overflow-hidden-dropdown.png` (por que não usar `overflow: hidden`).
- **Por que custa conversão:** o CTA do header é o único sempre visível no desktop, e quem amplia a fonte costuma ser o decisor mais velho.
- **Recomendação:** ver Pacote D. **Ajustes:** o zoom do navegador (Ctrl +) funciona, então não é falha estrita de WCAG 1.4.4/1.4.10; a parte "iPhone com texto em 200%" não corresponde a um ajuste real. Rebaixado de alto.
- **Relatado por:** s6-a11y.

#### F14 · A seção de perfis leva o visitante para perfis vazios e ocupa 1,6 tela no celular — médio · P
- **Onde:** `/` (`#confira`), `/contato`, `/en/`, `/es/` · celular principalmente.
- **Evidência (reproduzida):** `#confira` com 1.055 px no iPhone 13 (en 946, es 996; desktop 487), entre `#servicos` e `#perguntas`, com 3 cards de 231 px para `github.com/lemamon-dev`, `linkedin.com/in/lemamon-dev` e `medium.com/@lemamon.dev`; em en, "Our profile on LinkedIn."; em `/contato`, os 3 cards vêm antes do formulário. O conteúdo vazio dos perfis vem do registro de 20/10 (playbook 15 §2); acesso a terceiros estava proibido nesta auditoria.
- **Prints:** `out/verify-F14/home-pt-confira.png`, `out/verify-F14/home-mobile-viewport-at-confira.png`, `out/verify-F14/contato-canais-mobile.png`, `out/verify-F14/integracoes-cta-final-mobile.png`.
- **Por que custa conversão:** perfil vazio é prova contra para o avaliador cético; a seção também empurra FAQ e CTA final para baixo.
- **Recomendação:** ver Pacote B. **Ajustes:** a parte de confiança já é conhecida (VALIDACAO l.61, §d 2.1, D35); o "vazamento do funil" é exagerado (links em nova aba, barra fixa visível); não mexer na `profiles_line` dos serviços.
- **Relatado por:** j1, j3, j5, s1-ux-ui, s2-cro.

#### F15 · A página de integrações não responde sobre NDA, dados e acesso aos sistemas — médio · P
- **Onde:** `/servicos/integracoes` (+ en/es) · todos.
- **Evidência (reproduzida):** as 9 perguntas (e o FAQPage JSON-LD) não falam de NDA, sigilo nem credenciais. A única menção a dados é "Onde a integração roda e quem acessa os dados" em "o que a Descoberta define". `service-faq.ts` monta 13 perguntas e o teto de 9 tira `invoice`, `nda`, `skip_discovery` e `need_tech_knowledge`. `services._notes.faq_composition` justifica que o NDA "já aparece em /quanto-custa", o que é falso.
- **Prints:** `out/verify-F15/faq-pt-laptop.png`, `out/verify-F15/faq-en-laptop.png`, `out/verify-F15/discovery-defines-pt-mobile.png`, `out/verify-F15/orcamento-nda-mobile.png`; `out/j3-marcos-laptop/integracoes-faq-open.png`.
- **Por que custa conversão:** em integração o cliente abre ERP e financeiro; sem a resposta, o head de produto não defende o fornecedor internamente.
- **Recomendação:** ver Pacote B. **Ajustes:** não juntar `why_discovery_paid` com `price`; não prometer práticas de credenciais sem o dono. Rebaixado de alto (a resposta existe a um clique, em `/orcamento`).
- **Relatado por:** j3-marcos-laptop.

#### F16 · Em en/es, o contato trata o visitante como brasileiro (exemplo e erro com +55) — médio · P (copy) / M (região)
- **Onde:** `/en/quote?etapa=contato`, `/es/cotizacion?etapa=contato`, `/en/contact`, `/es/contacto` · todos.
- **Evidência (reproduzida):** WhatsApp marcado por padrão (`Wizard.tsx:227`) e telefone obrigatório (`lead.ts:143`); placeholder "+55 11 99999-9999"; "(415) 555-0134", "415 555 0134" e "1 415 555 0134" dão "…for example: +55 11 99999-9999."; "300 123 4567", "3001234567" e "57 300 123 4567" idem em es. **Novo e mais grave:** "+55 415 555 0134" e "+55 55 1234 5678" passam como fixo brasileiro válido, gerando lead com WhatsApp inexistente.
- **Prints:** `out/verify-F16/en-quote-contact-local-error.png`, `out/verify-F16/es-cotizacion-contact-local-error.png` (erro também atrás da barra fixa), `out/verify-F16/_en_contact-local-error.png`; `out/j5-english-desktop/quote-09b-phone-field.png`, `out/j4-hispano-mobile/08-contacto-telefono-local-error.png`.
- **Por que custa conversão:** erro de validação no último passo depois de 6 respostas; o exemplo +55 diz "isto é para brasileiros".
- **Recomendação:** ver Pacote A e "Próximo". **Ajustes:** não trocar o canal padrão do es para e-mail; não pré-preencher "+1". Rebaixado de alto (erro em linha, corrigível; público secundário).
- **Relatado por:** j4-hispano-mobile, j5-english-desktop.

#### F20 · Um clique a mais entre "Pedir diagnóstico gratuito" e a 1ª pergunta; coluna direita vazia no desktop — médio · M
- **Onde:** `/orcamento`, `/en/quote`, `/es/cotizacion` (entrada) · todos; coluna vazia em 1280/1440.
- **Evidência (reproduzida):** os 6 CTAs da Home caem na entrada (H1, 3 marcadores, promessa, FAQ aberto); a P1 só vem depois de "Começar as 6 perguntas". Em 1440, texto até x≈840 (1280: x≈760). `?etapa=1` direto mantém a atribuição, mas **com rascunho** abre a P1 com respostas antigas e sem o banner de retomada. Achado novo: a entrada começa em x=120 e a P1 é centralizada (x 368–1072), a tela pula de lado.
- **Prints:** `out/verify-F20/d1440-entry-fold.png`, `out/verify-F20/l1280-entry-fold.png`, `out/verify-F20/d1440-p1-fold.png`, `out/verify-F20/m-direct-etapa1-with-draft.png`.
- **Por que custa conversão:** cada tela entre a decisão e a ação reduz a conclusão; embutir a 1ª pergunta costuma aumentar o início do formulário.
- **Recomendação:** ver "Próximo" (medir antes). **Ajustes:** a entrada não é atrito vazio (BLUEPRINT §6.7: landing indexável e do Ads, segura as expectativas "sem preço" e "resumo antes do contato"); opção com radios que avançam fere o §7.2.
- **Relatado por:** j1, s1-ux-ui, s2-cro.

#### F21 · Botão do resumo com o mesmo rótulo e quase a mesma posição do envio; progresso cheio antes do contato — médio · P
- **Onde:** `/orcamento` resumo e contato (×3) · todos; o risco de toque duplo é no celular.
- **Evidência (reproduzida):** `quote.summary.primary` e `quote.contact_form.submit` = "Pedir diagnóstico gratuito" (`pt.json` 1734 e 1787; en/es também iguais); no celular os dois botões ocupam 350×48 quase no mesmo lugar; `below_primary` quebra em 2 linhas (barra de 113 px contra 95 px). Progresso a 100% em P6, resumo e contato (`Wizard.tsx` 1736–1759). **Novo:** um toque duplo a 80 ou 300 ms no resumo cai no envio e pinta 3 erros ("Informe o seu nome." etc.) e 3 `form_validation_error` falsos (iPhone 13 e Pixel 7).
- **Prints:** `out/verify-F21/mobile-summary-top.png`, `out/verify-F21/mobile-contact-top.png`, `out/verify-F21/mobile-double-tap-300ms.png`, `out/verify-F21/android-double-tap-300ms.png`.
- **Por que custa conversão:** tela de erro no último passo da conversão principal, sem erro do usuário; barra cheia faz o contato parecer passo extra.
- **Recomendação:** ver Pacote A. **Ajustes:** trocar o rótulo por "Último passo: deixar meu contato" contraria a escada de CTA do BLUEPRINT §8.6 e não resolve o toque duplo; "já enviei?" é fraco (a tela de contato é clara); os eventos de funil já são distintos.
- **Relatado por:** j1, s1-ux-ui, s3-copy.

#### F34 · O clique no WhatsApp não chega ao Ads e a conversa não diz a campanha — médio · P
- **Onde:** todos os botões de WhatsApp · todos, principalmente celular.
- **Evidência (reproduzida):** com `gclid` e `utm_campaign=mvp-sp` no toque da sessão (que persiste em `/contato`, `/` e `/quanto-custa`), todos os links `wa.me` das 4 páginas levam só o texto da página ("Olá! Vim pela página de MVP da Lemamon…"). `reportAdsConversion` só existe em `Wizard.tsx`; o playbook 07 §4 não cita `whatsapp_click`; o playbook 05 manda deixar UTM vazia na linha WA-*. `06-marketing.md:381` já previa a origem no link.
- **Prints:** `out/verify-F34/mvp-gclid-mobile-fold.png`.
- **Por que custa conversão:** o critério de pausa do 07 §6 ("nenhum diagnóstico vindo do Ads") fica cego para leads que chegam por WhatsApp; corta-se verba que traz cliente.
- **Recomendação:** ver Pacote E.
- **Relatado por:** s4-marketing-seo.

#### F40 · A dica "Projeto novo?" de `/contato` tira do formulário quem já preencheu, e o wizard pede tudo de novo — médio · M
- **Onde:** `/contato` → `/orcamento?origem=contato-dica-projeto` · todos.
- **Evidência (reproduzida):** nome, e-mail e WhatsApp preenchidos + "Projeto novo" → a faixa aparece entre Assunto e Mensagem; o link abre o wizard na mesma aba; na etapa de contato os campos estão vazios (`Wizard.tsx` 225–230, nada gravado). Voltar restaura via bfcache.
- **Prints:** `out/verify-F40/01-desktop-contato-preenchido-projeto-novo.png`, `out/verify-F40/01-mobile-contato-preenchido-projeto-novo.png`, `out/verify-F40/02-desktop-wizard-entrada.png`, `out/verify-F40/04-desktop-wizard-etapa-contato-vazia.png`.
- **Por que custa conversão:** quem chega ao Assunto já recusou o wizard no hero; a dica insiste no pior momento e o lead quase capturado vai para um fluxo mais longo e redigita tudo.
- **Recomendação:** ver Pacote C e "Próximo". **Ajustes:** mostrar a dica só com nome e e-mail vazios faria quem preenche de cima para baixo nunca vê-la.
- **Relatado por:** j2-claudia-desktop.

### Confirmados — severidade baixa

Cada um com a evidência principal, o print e o ajuste da verificação. As recomendações estão na tabela de Polimento (ou em "Próximo" e "Depende do dono", quando indicado).

- **F18 · H1 promete "Orçamento / quote" e o 1º FAQ aberto responde "Ainda não / Not yet / Todavía no" (P).** No desktop a resposta aparece na 1ª dobra, logo abaixo do botão (pergunta em y=668); no celular, em y=766. Prints: `out/verify-F18/desktop-pt-fold.png`, `desktop-en-fold.png`, `mobile-pt-faq.png`. Ajuste: a sensação de "isca" é exagerada (o subtítulo já diz "veja o que influencia"; avisar antes é honesto); o que sobra é a dupla negativa como primeiro texto. Não usar "fixed-price" no H1 em inglês. Relatado por j2, j4, j5, s2, s3.
- **F19 · A entrada não diz quanto tempo leva nem que é de clique (P).** Fluxo real: 8 telas, 14 toques, 57–107 palavras por pergunta, resumo de ~400 palavras. O único tempo visível é "45 minutos de conversa", que é da reunião. O "de clique" estava no BLUEPRINT §6 (l.399) e saiu do copy. Prints: `out/verify-F19/entry-pt-fold.png`, `entry-pt-android-fold.png`, `walk-summary-full.png`. Ajuste: o tempo só entra depois de medido e preso ao resumo. Relatado por j1, s2, s3.
- **F22 · "Pular" da P3 escondido e opções que crescem ao marcar (P).** "Pular" em y=876 sob a barra (top 591); "Portal ou plataforma…" passa de 92 para 114 px; na P5 a 6ª opção ("Prefiro conversar sobre isso no diagnóstico") fica inteira sob a barra. Prints: `out/verify-F22/mobile-p3-fold.png`, `mobile-p2-after-portal.png`, `mobile-p5-fold.png`. Ajuste: avanço automático é vetado (BLUEPRINT l.480 e 904; B136); Continuar vazio na P3 já pula. Relatado por j1, s1.
- **F23 · Erro de "obrigatório" aparece só de passar pelo campo (P).** Tocar em Nome e depois em E-mail mostra "Informe o seu nome." e o E-mail desce 30 px; Tab pelos 3 campos deixa os 3 vermelhos. Prints: `out/verify-F23/mobile-wiz-02-name-blur.png`, `desktop-wiz-03-tab-through.png`, `mobile-contato-01-blur-errors.png`. Ajuste: o preenchimento normal não dispara nada; anunciar no blur pioraria o leitor de tela; extra: infla `form_validation_error`. Relatado por s1, s5, s6.
- **F24 · Recarregar a etapa de contato apaga nome, e-mail, telefone e empresa (P).** Volta em `?etapa=contato` com as respostas, mas com o contato vazio (`INITIAL_CONTACT`, `Wizard.tsx:224`). Print: `out/verify-F24/wiz-reload-mobile-nobfcache.png`. Ajuste: voltar da Política restaura com bfcache (o print original desligava o bfcache); `/contato` só perde no F5; a mudança exige ajustar a Política antes (`quote._notes.resume_banner`). Relatado por s5.
- **F25 · Toque em "Começar" antes da hidratação sem retorno visual (P).** Janela botão visível → ilha pronta: 515–723 ms (perfil Lighthouse), 2.389–2.461 ms (Slow 3G); em Slow 3G, 300 ms depois do toque nada muda e a P1 abre 1,05–1,9 s depois. Print: `out/verify-F25/prev-slow3g-cold-tap300-tap+300ms.png`. Ajuste: o toque nunca se perde (fila); "até 10 s" veio de atraso artificial. Relatado por s5, s7.
- **F26 · Atribuição só no sessionStorage: nova aba ou retorno perdem `gclid` e UTM (P).** Cmd+clique e clique do meio no CTA de `/servicos/sistemas-web?gclid=…` → aba nova com `{utm:{}, gclid:''}`; retorno sem rascunho → `{origem:'home-hero', landing:'/'}`. Prints: `out/verify-F26/02-newtab-wizard-step2.png`, `03-return-no-draft.png`, `04-return-with-draft.png`. Ajuste: lacuna documentada no playbook 07 §7, com gatilho de 30%; a Política promete "enquanto a aba estiver aberta", então nada de localStorage por 90 dias. Relatado por j1, s4.
- **F27 · Ao trocar o wizard pelo WhatsApp, o contexto se perde (P).** Nas perguntas, o href é sempre "Estou preenchendo… e tenho uma dúvida"; no resumo, os 2 links têm `href="https://wa.me/5548900000000"` sem texto (a mensagem completa vai por JS no clique normal). **Novo:** no resumo, o "Dúvidas? WhatsApp" do topo é o WhatsApp mais visível da dobra no desktop e manda a mensagem genérica. Prints: `out/verify-F27/desktop-resumo-dobra.png`, `mobile-resumo-dobra.png`. Ajuste: o href sem texto é decisão de privacidade (BLUEPRINT l.779); nunca `deadline_reason` no href. Relatado por j2, s2.
- **F28 · Vindo de sistemas-web ou integrações, 2 tipos pré-marcados e o fator "mais de um tipo de software" (P).** Sistemas-web marca `ops_system` + `client_platform`; integrações, `integration` + `automation`; o 1º fator vira "Mais de um tipo de software no mesmo projeto". Prints: `out/verify-F28/p2-sistemas-web-mobile.png`, `summary-sistemas-web-keep-mobile.png`. Ajuste: o score não é distorcido hoje (`scoreD.ativo = false`), mas haveria risco latente se o D for ligado. Relatado por s2.
- **F29 · Trocar a P1 pelo "Alterar" do resumo troca a P3, mas o wizard não pergunta a nova P3 (P).** Reproduzido nos dois sentidos (para e de "sistema no ar"); `firstIncompleteStep` (`model.ts` 191–197) ignora opcionais, contra o contrato do próprio arquivo. Prints: `out/verify-F29/to-live-apos-trocar-p1-mobile.png`, `to-nonlive-apos-trocar-p1-mobile.png`. Ajuste: a P3 não entra no score; o lead não se perde. Relatado por s5.
- **F30 · Na P4, o campo "Tem alguma data que não pode passar?" fica escondido sob a barra no iPhone (P).** Na chegada: última opção até y=581, barra em 591, rótulo em 605, input em 635–683; também em iPhone SE e Android 360×740; visível no Pixel 7. Prints: `out/verify-F30/mobile-01-p4-arrival.png`, `mobile-04-p4-bottom.png`, `v2-android360-_orcamento.png`. Ajuste: o campo sempre existe (não "depois de selecionar"); `padding-bottom` já existe; placeholder "captação" só para produto/MVP. Relatado por j1.
- **F31 · Entrada do wizard sem aviso nem seletor de idioma (P).** Com es-CO ou en-US, `<html data-lang-suggest>` é calculado, mas `Base.astro:210` (`{!isWizard && <LanguageSuggestion/>}`) não renderiza. Prints: `out/verify-F31/mobile-es-CO-_orcamento.png`, `desktop-en-US-_orcamento.png`. Ajuste: a fuga custa 3 toques (não 4) e perde só `servico`/`origem` (UTMs sobrevivem). Relatado por j4, s5.
- **F32 · Faixas de orçamento só em BRL em en/es (P; vai para "Depende do dono").** Prints: `out/verify-F32/en-desktop-etapa5-dobra.png`, `es-mobile-etapa5-dobra.png`. Ajuste: o helper já diz "Amounts in Brazilian reais (BRL)"; não há outro valor no site para explicar; "estraga o score" é falso (US$ 6 mil ou mais cai em tier_2+). Só vale uma taxa de referência no helper en se a D31 for "sim". Relatado por j4, j5.
- **F35 · Campanhas de "orçamento" e "quanto custa" sem pré-qualificação no anúncio (P).** Nenhum anúncio do playbook promete preço; as landings ajustam a expectativa acima da dobra. O RSA de exemplo é só o de `sistemas-web`; negativas não cobrem "tabela", "valor hora", "barato"; sitelink de conversão aponta para `/contato`. Prints: `out/verify-F35/orcamento-mobile-fold.png`, `quanto-custa-mobile-fold.png`. Ajuste: "Preço Fechado Antes de Começar" contradiz o site (o preço fecha depois da Descoberta paga). Relatado por s4.
- **F37 · "Como comparar orçamentos" sem a pergunta do código e sem link de outras páginas (P).** 6 perguntas; 0 menções a "código" na página; nenhum link para `#como-comparar`. Prints: `out/verify-F37/secao-comparar-desktop.png`, `quanto-custa-comparar-mobile.png`. Ajuste: a seção fica a 44–47% da página (não 60%); NDA não diferencia propostas; o âncora real é `#como-comparar`. Relatado por j2, s2, s3.
- **F38 · Método repetido e páginas de 16 a 20 telas no celular (M; vai para "Próximo").** Home 13.119 px (19,8 telas), cartão `.plan` de 543 px como 2ª tela inteira, timeline de novo na seção 03 (1.430 px); `/como-trabalhamos` 12.992 px com 8 linhas "Você recebe" para 4 etapas. Prints: `out/verify-F38/m_home_y664.png`, `m_home_s03b.png`, `m_hww_timeline.png`, `m_como-trabalhamos_full.png`. Ajuste: são 7 componentes com a timeline (não 9); `/quanto-custa` não tem `MethodTimeline`; a barra fixa reduz o efeito. Relatado por j2, s1, s3.
- **F39 · `/contato`: formulário a 2,4 telas no celular, CTAs repetidos e sem CNPJ perto do formulário (P).** "Prefere escrever?" em y=1.618 no iPhone 13 (Pixel 7: 1.575; 1440×900: 952). Prints: `out/verify-F39/mobile_pt_full.png`, `desktop_pt_fold.png`. Ajuste: não tirar os botões do hero (são os únicos CTAs da 1ª tela no celular; não há barra fixa em `/contato`); não usar "equipe comercial" (afirma time). Relatado por j2, s1.
- **F41 · Microcopy do CTA repete "Gratuito" e não diz "sem compromisso" (P).** "compromisso" aparece 0 vezes na 1ª dobra dos heroes; "Gratuito" de 2 a 4 vezes. Prints: `out/verify-F41/m-home-fold-current.png`, `m390-home-proposed-real-markup.png` (o texto novo quebra em 2 linhas, não em 1). Ajuste: rebaixado porque a entrada do wizard já diz "Gratuito e sem compromisso". Relatado por s3.
- **F42 · "O projeto não vai parar no meio?" não fala do risco de o fornecedor sair (P).** Confere em `/como-trabalhamos` e 3 serviços; **não confere no MVP**, onde a resposta já termina com "E o código desenvolvido é da sua empresa.". Prints: `out/verify-F42/laptop_como-trabalhamos-wont_stall-open.png`, `laptop_servicos_mvp-wont_stall-open.png`, `laptop_home-risks-vendor.png`. Ajuste: o texto precisa da mesma condição de `codigoProprietario`. Relatado por j3.
- **F43 · Exemplos de sistemas web sem pedido B2B; o portal usa uma imobiliária (P).** `services.web_systems.examples[5]` cita "o inquilino de uma imobiliária". Prints: `out/verify-F43/desktop-exemplos-portal.png`, `desktop-fatores-preco.png`. Ajuste: a página já fala de "preço por cliente" nos fatores; a parte do hero vazio foi descartada (é o template `PageHero`). Relatado por j2.
- **F45 · Quem recomenda ao decisor não tem o que encaminhar antes do contato (P/M).** **Novo:** a URL do resumo aberta por outra pessoa cai na "Pergunta 1 de 6" vazia (estado em localStorage). Prints: `out/verify-F45/laptop-summary-full.png`, `laptop-summary-url-fresh.png`, `mobile-summary-url-fresh.png`. Ajuste: copiar antes do contato canibaliza o envio; o "Copiar resumo" já existe depois do envio. Relatado por j3.
- **F46 · Na impressão, o CTA final fica apagado e os FAQs fechados não saem (P).** Medido em PDF real: título do CTA `#ababab` (2,3:1), botão principal `#080f2b` (18,9:1, legível); FAQ: 7 de 8 respostas não saem em `/como-trabalhamos`; a 1ª página não tem logo. Prints: `out/verify-F46/sprint-default-p5.png`, `hww-default-p8.png`, `sprint-default-p1.png`. Ajuste: "branco sobre branco" é falso no Chrome real (o Blink escurece o texto). Relatado por j3.
- **F47 · No notebook, a metade direita do hero fica vazia nas páginas de avaliação (M).** Em 1280×800 o texto termina em x=872; o `HwwStageIndex` aparece no celular e some a partir de 1024 px. Prints: `out/verify-F47/laptop-_como-trabalhamos.png`, `desktop-_sprint-de-descoberta.png`. Ajuste: nas páginas de serviço a faixa de compromissos já aparece na dobra; não misturar "Código" e "NDA" nos 4 entregáveis da Descoberta (§5.2). Relatado por j3.
- **F48 · A qualidade técnica do site é uma prova que ninguém vê (P/G; vai para "Depende do dono").** Headers do preview: HSTS com preload, X-Frame-Options DENY, nosniff, COOP, CSP report-only com hashes; projeto com CI, vitest, Playwright e Renovate; o link aponta para `github.com/lemamon-dev`. Prints: `out/verify-F48/laptop-home-confira.png`, `laptop_-gh.png`. Ajuste: abrir o código é G (`_notes` internos no i18n, `dados/` necessário ao build, histórico de 292 commits); o passo 1 (README da organização) é barato. Relatado por j3.
- **F49 · Nenhum e-mail é clicável (P).** 44 rotas, 0 `<a href="mailto:">`, 1–4 botões "Copiar" por página (funcionam, com `aria-live`). Separador "·" pendurado no rodapé do wizard no celular. Prints: `out/verify-F49/en-home-fold-desktop.png`, `en-copy-clicked-desktop.png`, `mobile-footer_orcamento_enviado.png`. Ajuste: sem `mailto:` foi decisão (B145, teste `shared-render.test.ts:160`); só no toque; a troca do canal do EN foi descartada. Relatado por j5, s5.
- **F51 · Com zoom, o header sticky e a barra fixa ocupam 35% a 47% da tela (P).** 1280×800 com zoom 200% (~640×350 CSS): 39% nas perguntas, 46% no resumo/contato, P2 mostra 0 opções inteiras no topo; zoom de página no celular: 31–47%. O campo focado sempre ficou visível (sem falha de WCAG 2.4.11). Prints: `out/verify-F51/z200-laptop-640x350-q2-scrolled.png`, `z200-laptop-640x350-contato.png`, `z200-laptop-640x350-contato-email-focus-fix.png` (correção testada: 0%). Ajuste: os 70% vieram de uma emulação sem ajuste real equivalente. Achado lateral: no resumo, com texto em 200%, a timeline vaza para 466 px. Relatado por s6.
- **F52 · Da Home ao wizard pronto, 1,3–1,6 s baixando ~114 KB depois do toque (P–M; vai para "Próximo").** Medido no preview com toque real: toque → pronto ~2,1 s (mediana, 7 corridas) e ~1,2 s com preload ocioso; prefetch de `/orcamento` sem a query baixa o HTML de novo (17 KB × 300 B). Prints: `out/verify-F52/journey-base_.png`, `journey-idle_.png`. Ajuste: o CSS pela rede é ~9 KB (não 117 KB); Speculation Rules não puderam ser medidas e o `csp.ts` não gera hash para elas. Relatado por s7.
- **F53 · React é 72–73% do JS do funil e o orçamento do build está em 92,1 de 100 KiB (M; vai para "Próximo").** `client.sXT19HB4.js` 61–62 KB br; cascata em 4G lento: `client.js` termina em 1.673 ms; hidratação em 1,8–2,0 s; tarefa longa de 87–114 ms só com CPU 8x. Prints: `out/verify-F53/earlytap-run1-tap+300ms.png`. Ajuste: o funil cai para ~38–42 KB br (não 25–30); retorno visual no toque vem primeiro. Relatado por s7.
- **F54 · Home com `gclid` ou UTM única nunca usa o cache da CDN (P; vai para "Depende do dono" pela URL final dos anúncios).** `/` responde `netlify-vary: query`; `/?gclid=<aleatório>` deu miss em 8 de 8 (176–379 ms); no Chrome, mediana 287 ms com `gclid` × 33 ms sem query; `/orcamento?gclid` sempre hit. Causa provável: as 2 regras com `query = { lng }` em `netlify.toml` l.110–125. Prints: `out/verify-F54/home-gclid-mobile.png`, `home-sem-query-mobile.png`; log `out/verify-F54/headers.log`. Ajuste: não apagar o 301 de `?lng=` (decisão documentada); o critério certo de validação é um `gclid` novo dar hit na 1ª requisição. Relatado por s7.
- **F55 · Nenhuma medição inclui gtag.js e New Relic, que só entram em produção (P).** `Analytics.astro` só emite os terceiros com `isProductionDeploy()`; local e preview sem nenhum pedido a googletagmanager ou nr-data. **Novo:** o preview injeta o Netlify Drawer, que não existe em produção. Prints: `out/verify-F55/local-orcamento-mobile.png`, `preview-orcamento-mobile.png`. Ajuste: `fetchpriority="low"` não muda nada; adiar o gtag exige trava para `gclid`/`gbraid`/`wbraid`. Relatado por s7.
- **F56 · New Relic de produção com `defer` no head segura os módulos (P).** DCL frio, Slow 4G, 8 rodadas: base 929 ms, `defer` 999 (+70), `async` 974, pós-load 936; em 3G +147 ms; INP do "Menu" igual (48 ms). Prints: `out/verify-F56/menu-open-defer-3g.png`, `menu-open-base-3g.png`. Ajuste: "pesa no INP" não reproduziu; os +327 ms não se repetiram com controle de ruído. Relatado por s7.

### Não verificados (baixos ou já conhecidos)

| Key | Achado | Já conhecido? | Nota ou mitigação |
|---|---|---|---|
| F17 | en/es não dizem se atendem fora do Brasil, nem idioma, fuso, moeda e contrato | Sim (D31) | FAQ "¿Trabajan con empresas fuera de Brasil?" / "Do you work with companies outside Brazil?" que pede para indicar o país e não afirma atendimento |
| F57 | Sem pessoas, cases, depoimentos, logos ou agenda | Sim (§d 2.1, 2.2, 4) | F01, F10, F14, F48 passo 1; escassez só com D19 |
| F58 | Descoberta sem duração, formato, abatimento ou plano do cliente; "Como a gente constrói" desligada | Sim (§d 3) | F02 mantém "Paga · valor combinado" visível |
| F59 | Nenhum ponto diz em quanto tempo a Lemamon responde | Sim (BLUEPRINT §12 veta prazo numérico) | F10 |
| F60 | Nota fiscal, formato do diagnóstico e atendimento fora de SP | Sim | Os FAQs ligam sozinhos com os campos |
| F61 | Tooltip "devolutiva por escrito" não diz o que vem nela | Sim | `devolutivaConteudo` |
| F62 | `/privacidade` cita "a data no topo" que não existe | Sim (trava de build) | Esconder a frase enquanto `atualizadaEm` estiver vazio |
| F63 | "Para PMEs e startups" pode afastar empresa média | Sim (`entry_placement`) | "Para empresas e startups" |
| F64 | Em `/sprint-de-descoberta`, faixa "Já recebeu a proposta?" logo abaixo do hero | Não | Só no fim, ou 1 linha sem e-mail |
| F65 | Em `/sprint-de-descoberta`, o menu ativa "Serviços" e o breadcrumb diz "Como trabalhamos" | Não | `aria-current` em "Como trabalhamos" |
| F66 | Sem campo "Alguém indicou a Lemamon?" | Não | Campo opcional recolhido; `lead_source=referral`; incluir na Política |
| F67 | axe "region" no WhatsApp flutuante e no aviso de idioma | Não | Envolver em `<aside aria-label>` |
| F68 | Fechar o aviso de idioma vale para sempre; seletor no fim do menu mobile | Não | Guardar o "fechar" por sessão ou 7 dias; seletor no topo da gaveta |
| F69 | Decalques do português em es/en ("etapa con costo", "management systems", "written feedback") | Não | Textos propostos no achado original (ex.: "Tú decides antes de pagar cada etapa", "written recommendations") |
| F70 | "LTDA · CNPJ" sem explicação no rodapé en/es | Não | "Brazilian company registration (CNPJ)" / "Registro de empresa en Brasil (CNPJ)" |
| F71 | URLs em es com âncoras e parâmetros em português | Não | Ver "Próximo" |
| F72 | Wizard não registra fuso do visitante | Não | Campos ocultos `tz` e `browser_lang` (conferir a Política) |
| F73 | Corpo em peso 300 cinza cansa a leitura no celular | Não | Peso 400 de 14 a 18 px (registrar junto da D40) |
| F74 | Rodapé repete o bloco do CTA final | Não | Rodapé só com links de texto nas páginas com CtaFinal |
| F75 | Microcopy de garantia em 12 px monoespaçado peso 300 nas páginas internas | Não | Estilo da Home no `CtaDiagnosis` (14 px, check) |
| F76 | Toggletip abre sobre o CTA e encosta na borda; alvos de 22–28 px | Não | `max-width: calc(100vw - 32px)`; alvo de 24 px (WCAG 2.5.8) |
| F77 | Grid de exemplos com 1 card sozinho; "Faz sentido quando…" com metade vazia | Não | "Não viu o seu caso?" como 8º card |
| F78 | Header mobile translúcido fica cinza sobre seções escuras | Não | Fundo opaco no celular |
| F79 | Aviso de privacidade acima do envio com ~50 palavras e "ordem de atendimento" | Não (depende de LGPD) | Ver "Depende do dono" |
| F80 | No obrigado, o leitor de tela ainda diz "Suas respostas ficam salvas neste navegador." | Não | Não renderizar `logo_saved_hint` em `/orcamento/enviado` |
| F81 | `gbraid`/`wbraid` não são guardados | Não | Capturar em `readCampaign()` e `buildAttribution()` |
| F82 | Eventos não podem ser conferidos antes da produção | Não | `?debug_analytics=1` que escreve no console sem enviar |
| F83 | `form_field_complete` conta e-mail inválido como concluído | Não | Disparar só com o campo válido |
| F84 | `scroll_depth` só na Home; aberturas de FAQ não medidas | Não | `observeScrollDepth()` nas views de landing; evento `faq_open` |
| F85 | Eventos fora do padrão de leads do GA4 | Não | Enviar também `generate_lead`/`qualify_lead`, um só como evento-chave |
| F86 | JSON-LD sem `contactPoint`, `areaServed`, idiomas; `sameAs` com LinkedIn pessoal | Não | Ver "Depende do dono" (número real, `/company/`) |
| F87 | Sitemap sem `lastmod`; `/index.html` e `/orcamento.html` com 200; BreadcrumbList parcial | Não | `lastmod`; 301 de `.html`; breadcrumb nas 5 páginas que faltam |
| F88 | Sem JS, "Começar as 6 perguntas" não faz nada e o `<noscript>` está no fim | Não | `<noscript>` logo abaixo de `.entry__actions` |
| F89 | Índice "Etapas do método" esconde 2 de 4 etapas numa rolagem lateral no celular | Não | Grid 2×2 abaixo de 768 px |
| F90 | `/contact`, `/quote`, `/Diagnostico`, `/servicos/sistema-web`, `/en/projects` dão 404 | Não | 301 forçados no `netlify.toml` |
| F91 | CSS bloqueante de `/orcamento` quase sem uso na entrada | Não | Ver "Próximo" |
| F92 | Fonte substituta sem métricas ajustadas (CLS 0,024–0,030 se a fonte atrasa) | Não | `@font-face` de fallback com `size-adjust` |
| F93 | No preview, o Netlify Drawer cobre Voltar/Continuar no celular | Não | Desligar o Drawer nos Deploy Previews; não afeta produção |

### Refutados

| Key | Achado | Por que foi refutado |
|---|---|---|
| F33 | `/orcamento/enviado` aberto direto diz "Pedido recebido." e inflaria a conversão por URL | A ação por URL do Ads é **secundária** e com contagem "Uma" (playbook 07 §4.2); os lances são CPC manual ou Maximizar cliques; a página é `noindex`, fora do sitemap e sem link no site. A mitigação proposta pioraria o caso legítimo de storage bloqueado |
| F36 | Landings sem os termos comprados ("criar aplicativo", "criar mvp") | Nenhum termo foi comprado (07 §1 aberto); o Google casa variantes próximas e os H1 já trazem o tema na dobra; "produto digital" aparece no breadcrumb, menu e JSON-LD. Sobra só um ajuste de SEO orgânico sem ganho de conversão |
| F44 | O texto não fala com o avaliador técnico | A página de integrações já usa API, volume, falhas, reprocessamento e painel; "Preciso entender de tecnologia? Não." nem aparece ali. A lacuna real (práticas de engenharia) já é conhecida e depende de `engenharia.*` |
| F50 | WhatsApp flutuante repete o do header e cobre cards no desktop | De 768 a 1023 px o header não tem WhatsApp; a sobreposição máxima foi 9% de um link, passageira, sem foco encoberto; tirar o flutuante contraria o BLUEPRINT §8.3 e esconde o canal em 1024–1279 px, onde o do header é só um ícone |

---

## (e) Métricas medidas

### Web Vitals no celular (iPhone 13 emulado)

Medições de s7-perf (`out/s7-perf/results-*.json`). "Com throttling" = CPU 4x, 1,6 Mbps, 150 ms de latência; mediana de 3 rodadas. O preview inclui o Netlify Drawer (F93), que não existe em produção, e **nenhuma medição inclui gtag.js nem New Relic** (F55).

| Página | LCP sem throttling (local) | LCP com throttling (local) | LCP com throttling (preview) | TTFB (preview) | CLS (após rolar até o fim) | Maior tarefa longa (preview) | Peso transferido | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 240 ms | 676 ms | 1.156 ms | 470 ms | 0 | 84 ms | 68 KB | 18 |
| `/orcamento` | 76 ms | 716 ms | 844 ms | 167 ms | 0 | 45 ms | 149 KB | 18 |
| `/como-trabalhamos` | 100 ms | 680 ms | 1.016 ms | 254 ms | 0 | 115 ms | 65 KB | 16 |
| `/quanto-custa` | 176 ms | 632 ms | 864 ms | 308 ms | 0 | 53 ms | 58 KB | 14 |
| `/servicos/sistemas-web` | 124 ms | 680 ms | 1.088 ms | 412 ms | 0 | 108 ms | 64 KB | 16 |
| `/contato` | 236 ms | 636 ms | 980 ms | 438 ms | 0 | 19 ms | 58 KB | 17 |
| `/en/` | 104 ms | 656 ms | 1.012 ms | 381 ms | 0 | 84 ms | 68 KB | 18 |

O elemento de LCP é sempre texto (H1 ou subtítulo). Nenhuma `<img>` no site; 2 woff2 de ~12 KB com preload e `swap`.

### Interação, funil e rede

| Métrica | Valor | Fonte |
|---|---|---|
| INP (abrir o menu) | até 128 ms; 48 ms no toque em "Menu" com e sem New Relic | s7-perf; F56 |
| INP (passos do wizard) | 56–96 ms | s7-perf |
| Botão "Começar" visível → ilha pronta | 515–723 ms (perfil Lighthouse); 2.389–2.461 ms (Slow 3G) | F25 |
| Toque → P1 aberta, tocando antes da hidratação | 144 ms a 1,9 s; sem retorno visual no intervalo | F25 |
| Home → wizard pronto (toque real, preview) | ~2,1 s mediana (1,5–7,3 s); ~1,2 s com preload ocioso | F52 |
| JS de `/orcamento` | 89–92 KB br; React 61–62 KB br (72–73%); orçamento do build 92,1 de 100 KiB | F53 |
| Tarefa longa na hidratação | 87–114 ms só com CPU 8x; nenhuma acima de 50 ms com CPU 4x | F53 |
| CLS com a fonte atrasada 1,5 s | 0,024–0,030 (abaixo de 0,1) | F92 |
| TTFB da Home com `gclid` × sem query | 287 ms (miss) × 33 ms (hit), mediana no Chrome | F54 |
| Esforço do wizard | 8 telas, ~14 toques, 38 caracteres; 2,5–4 min no total (1,5–2,5 min até o resumo), estimado | s2-cro; F19 |
| Altura das páginas no celular (vh 664) | Home 13.119 px (19,8 telas); `/como-trabalhamos` 12.992 px (19,6); `/servicos/mvp` 16,3 telas; `/quanto-custa` 10.867 px (16,4); formulário de `/contato` em y=1.618 (2,4 telas) | F12, F38, F39 |
| Resumo do wizard até a pauta (celular) | ~3,5 telas (pauta em y=2.175) | F02 |

### Acessibilidade, QA e SEO

| Verificação | Resultado | Fonte |
|---|---|---|
| axe-core (WCAG 2.1 AA + best-practice), 44 rotas × 2 dispositivos | **0 violações WCAG** em 88 execuções; só a regra "region" (moderada, best-practice) em 59 execuções (WhatsApp flutuante, aviso de idioma) | `out/s6-a11y/axe-all.json`; F67 |
| axe nos estados do wizard (pergunta com erro, resumo, contato com erros), pt/en/es, claro e escuro | 0 violações WCAG | s6-a11y |
| Teclado e leitor de tela | Foco visível (âmbar nas seções escuras), skip link, gaveta modal com focus trap e Esc, foco no título de cada pergunta com `role="status"`, erros com `aria-invalid` e `aria-describedby`, inputs de 16 px, alvos ≥44 px nos controles | s6-a11y |
| Rolagem horizontal, 45 rotas em 320/360/390/768/1024/1280/1440 | 0 | s1-ux-ui, s5-qa |
| Rolagem horizontal com fonte do Chrome em 20/24 px | até 151 px (1024@20) e 382 px (1024@24) | F13 |
| Zoom 200% (~640×350 CSS) no wizard | header + barra cobrem 39–46% da tela | F51 |
| Rotas, console e links | 46 rotas com 200; 0 erros de console ou de página; 0 requests falhando; todos os links internos 200; âncoras existem | s5-qa |
| Redirects no preview | `/projects`, `/projects/*`, `/diagnostico`, `/metodo`, `/?lng=` e barras finais com 301 preservando `gclid`/UTM | s4, s5 |
| Headers de segurança no preview | HSTS com preload, X-Frame-Options DENY, nosniff, COOP same-origin, Permissions-Policy, CSP report-only com hashes | F48 |
| SEO on-page | 39 URLs indexáveis; title ≤60 caracteres; description 122–155; canonical, hreflang recíproco com x-default, sitemap, robots e OG 1200×630 por página e idioma | s4-marketing-seo |

---

## Limites desta auditoria

- **Produção não foi medida com terceiros.** gtag.js e New Relic só entram com `CONTEXT=production`; os números de performance acima são otimistas (F55).
- **Nada foi enviado.** Fluxos depois do envio foram testados com o sessionStorage semeado (`measured: false`); a entrega real do lead no Netlify Forms e a importação no Ads não foram testadas.
- **Perfis externos não foram abertos** (acesso a terceiros proibido); o estado deles vem do registro de 20/10 (playbook 15 §2).
- **Ambiente diferente do briefing em dois pontos:** o build em `:4700` já mostra `comercial@lemamon.dev` (o briefing dizia que ainda não), e o HTML não traz a camada fictícia, embora o `preview.log` a anuncie.
- **Impactos são estimativas.** Com o tráfego de um site B2B novo, nenhum número de ganho é medível por A/B; a validação é antes/depois nos eventos de funil que o site já dispara.
