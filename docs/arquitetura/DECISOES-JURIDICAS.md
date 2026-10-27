# Decisões jurídicas — Política de Privacidade e conformidade do site

**Rascunho para confirmação do advogado — não é parecer jurídico. Cada decisão abaixo é a recomendação padrão; o advogado confirma e o dono confirma.**

> Controlador: **Lemamon.dev LTDA**, CNPJ 69.700.690/0001-98, São Paulo/SP. Software house B2B, atendimento a distância no Brasil e no exterior, em pt/en/es (D31).
> Base normativa principal: LGPD (Lei 13.709/2018), Marco Civil da Internet (Lei 12.965/2014), Decreto 7.962/2013 (regulamenta o CDC no comércio eletrônico) e Resoluções CD/ANPD.
> Documento revisado contra os achados do revisor adversarial e as lacunas do crítico de completude (incorporados, descartados com motivo, ou registrados como ponto aberto na seção 5).
> Datas de referência: hoje 27/10/2026.

---

## 1. Resumo

- **16 pontos oficiais do advogado** (lista a–p, playbook 10 §4).
- **7 campos obrigatórios de `dados/dono.json › privacidade`** que travam o lançamento: os 6 prazos de retenção + `atualizadaEm`. (`mecanismoTransferencia` também é obrigatório para a decisão, mas entra como item **b**.)
- **13 lacunas de governança** levantadas na revisão (seção 5).

Situação dos 16 pontos oficiais:

| Estado | Quantos | Quais |
|---|---|---|
| **Já decididos — advogado só confirma** | 7 | a, c, d, e, i, k, n |
| **Decisão de toggle recomendada (dono liga)** | 2 | m (→ `true`), e (mantém `false`) |
| **Dependem de dado do dono / da ferramenta / de DPA** | 7 | b, f, g, h, j, o, p |

> Observação do revisor incorporada: a ordem prudente de **b** (transferência internacional) mudou de "preencher agora" para **"manter `null` até conferir os DPAs"** (ver 3.9). O item **l** (Marco Civil) estava como placeholder no rascunho dos especialistas e foi reescrito (ver 3.14). O item **p** (Decreto 7.962) estava ausente e foi incluído (ver 3.15).

---

## 2. Tabela mestra de confirmação

Uma linha por ponto. `☐ Adv` = advogado confirma; `☐ Dono` = dono confirma/fornece o dado.

### Tema A — Base legal e titulares

| Ref | Campo `dono.json` | Pergunta ao advogado | Recomendação (padrão) | Opções | Confiança | Conf. |
|---|---|---|---|---|---|---|
| a | `baseAnuncios` | Consentimento é base adequada e suficiente p/ cookies do Ads e importação offline do `gclid`? | Manter `"consentimento"` + banner Aceitar/Recusar de mesmo peso + Consent Mode v2 | consentimento / legítimo interesse (exige LIA, sem remarketing) | Alta | ☐ Adv ☐ Dono |
| d | — | Base no B2B p/ o pedido de diagnóstico? | art. 7º, V (procedimentos preliminares) p/ responder/diagnosticar + art. 7º, IX (legítimo interesse) p/ fila/retomada | 7º V+IX / consentimento (desnecessário) | Alta | ☐ Adv ☐ Dono |
| a/d/j/m | — (copy + config) | O envio da conversão ao Ads via `gclid` está mapeado em 2 bases ao mesmo tempo? | **Separar**: cookies+tags+envio ao Ads = consentimento; atribuição **interna** + fila = legítimo interesse | — | Média | ☐ Adv ☐ Dono |
| e | `classificacaoDefineAtendimento` | O score A/B/C/D só ordena a fila, não decide o atendimento? | Manter `false`; Política descreve a classificação e oferece a revisão do art. 20 | false / true (`*_with_routing`) | Alta | ☐ Adv ☐ Dono |
| i | — | Papel do Google no Ads/GA4: operador ou controlador independente? | Papel **misto**: operador na medição por conta da Lemamon + controlador independente no uso próprio | misto / só operador / joint | Alta | ☐ Adv ☐ Dono |
| j | — | Efeito da oposição por e-mail à medição por anúncios? | Descrever o efeito concreto; sob consentimento vira revogação em "Preferências de cookies" | descrever efeito / só linha genérica | Média | ☐ Adv ☐ Dono |
| k | `remarketing` | Se ligar remarketing, a base é consentimento? | Manter `false`; se ligar, base = consentimento (nunca legítimo interesse) | false / true (só com consentimento) | Alta | ☐ Adv ☐ Dono |
| m | `naoVendemosConfirmado` | Enviar conversões ao Ads é venda/compartilhamento comercial? | `true`: não é venda (não há "venda" na LGPD, nem contraprestação) | true / false | Média | ☐ Adv ☐ Dono |
| n | — | A redação do art. 18, IV está fiel? E lista o art. 18 inteiro (I–IX)? | Manter texto do inciso IV + incluir enumeração completa I–IX (portabilidade V com ressalva) | manter / detalhar inline | Alta | ☐ Adv ☐ Dono |
| o | — (i18n, shell) | Os avisos de formulário devem citar o retorno ao Google Ads? | Adotar a variante que cita o Ads nos 3 idiomas (mais transparente; não obrigatório) | adotar variante / confiar no link da Política | Média | ☐ Adv ☐ Dono |

### Tema B — Transferência internacional e operadores

| Ref | Campo `dono.json` | Pergunta ao advogado | Recomendação (padrão) | Opções | Confiança | Conf. |
|---|---|---|---|---|---|---|
| b | `mecanismoTransferencia` | Citar cláusulas contratuais do art. 33, II, ou manter a frase padrão? | **Manter `null` AGORA**; só preencher a frase do art. 33, II **após** conferir, DPA a DPA, que a base são as Cláusulas-Padrão da ANPD (ou cláusula específica aprovada) | null (padrão) / art. 33, II após DPAs / adequação (não cabe) | Média | ☐ Adv ☐ Dono |
| c | `encarregado` | Enquadra como agente de pequeno porte (dispensa DPO)? | Manter `"pequeno_porte"`; e-mail geral = canal do titular (Res. 2/2022 + Res. 18/2024) | pequeno_porte / indicar encarregado (facultativo) | Alta | ☐ Adv ☐ Dono |
| f | `provedorEmail` | O DPA da Microsoft cobre a conta M365 revendida pela GoDaddy? A GoDaddy é suboperadora à parte? | Manter `"microsoft_365"` + a frase atual "(contratado por meio da GoDaddy)"; obter os 2 aditivos (Microsoft e GoDaddy) p/ o registro | manter menção / item separado da GoDaddy / migrar p/ contrato direto | Média | ☐ Adv ☐ Dono |
| g | — (i18n, shell) | Declarar o Akismet (Automattic, EUA) como suboperador do filtro de spam do Netlify? | **Declarar** na linha do Netlify (recebe conteúdo do formulário + IP, sem opt-out) | declarar / item próprio / não citar | Alta | ☐ Adv ☐ Dono |

### Tema C — Marco Civil e consumidor

| Ref | Campo `dono.json` | Pergunta ao advogado | Recomendação (padrão) | Opções | Confiança | Conf. |
|---|---|---|---|---|---|---|
| l | ↔ `prazos.logsHospedagem` | Marco Civil art. 15 (guarda de registros de acesso 6 meses) se aplica a um site vitrine com formulários? | Aplicabilidade **discutível** p/ site institucional; **não** contratar Netlify Enterprise só p/ isso; publicar "cerca de 7 dias" e registrar a posição no inventário | assumir limitação (padrão) / Log Drain 6 meses (Enterprise) | Média | ☐ Adv ☐ Dono |
| p | ↔ `empresa.ts` (footer) | A oferta B2B é relação de consumo? Publicar endereço físico + e-mail em destaque (Decreto 7.962, art. 2º)? | Em regra **não é consumo** (teoria finalista/STJ); ainda assim publicar endereço físico + e-mail em destaque (baixo custo, cobre o caso-limite) | publicar endereço / manter só cidade+CNPJ | Média | ☐ Adv ☐ Dono |

### Tema D — Retenção e prazos (todos obrigatórios p/ lançar)

| Ref | Campo `dono.json` | Recomendação (padrão) | Confiança | Conf. |
|---|---|---|---|---|
| prazo:retencaoPedidos | `prazos.retencaoPedidos` | 24 meses após o último contato (12 se preferir mais conservador) | Média | ☐ Adv ☐ Dono |
| prazo:ga4 | `prazos.ga4` | 14 meses (ajustar o painel do GA4) | Alta | ☐ Adv ☐ Dono |
| prazo:googleAds | `prazos.googleAds` | até 90 dias (cookie `_gcl_au`) | Média | ☐ Adv ☐ Dono |
| prazo:conversoesGoogleAds | `prazos.conversoesGoogleAds` | frase referencial à política do Google (sem número próprio) | Média | ☐ Adv ☐ Dono |
| prazo:newRelic | `prazos.newRelic` | 8 dias (plano gratuito/Standard) | Média | ☐ Adv ☐ Dono |
| prazo:logsHospedagem | `prazos.logsHospedagem` | cerca de 7 dias (ver item l) | Baixa | ☐ Adv ☐ Dono |
| h | — (copy opcional + rotina) | exclusão alcança lixeira e backups, concluída no ciclo de backup seguinte | Média | ☐ Adv ☐ Dono |
| atualizadaEm | `atualizadaEm` | data do go-live, formato AAAA-MM-DD (dono preenche no dia) | Alta | ☐ Adv ☐ Dono |

---

## 3. Detalhe por ponto

### 3.1 — (a) Base legal da medição por anúncios: consentimento

**Pergunta.** Confirma que `"consentimento"` é base adequada e suficiente para os cookies do Google Ads e para a importação offline pelo `gclid`, e que o banner atende aos requisitos de consentimento livre (Aceitar/Recusar de mesmo peso, sem pré-seleção, granularidade medição×anúncio, reabertura por "Preferências de cookies")?

**Recomendação.** Manter `baseAnuncios = "consentimento"`. É a base mais segura e abrangente para cookies de anúncio/medição e para a importação offline pelo `gclid`, e é coerente com um eventual remarketing futuro (que só admite consentimento). Garantir Aceitar/Recusar de mesmo peso visual, sem caixa pré-marcada, e Consent Mode v2 (já pronto no código, B344).

**Opções.** (1) `"consentimento"` — banner com recusa tão fácil quanto o aceite, Consent Mode v2, reabertura (**recomendada**). (2) `"legitimo_interesse"` — sem banner, mas **não** serve para cookies de publicidade/conversão e exige LIA documentada; o próprio Guia da ANPD rejeita legítimo interesse para cookies de anúncio, então **não é um fallback equivalente**.

**Justificativa (norma + fonte).** ANPD, *Guia Orientativo: Cookies e Proteção de Dados Pessoais*, **18/10/2022** (documento interpretativo, não norma vinculante): cookies de publicidade/remarketing demandam **consentimento**; analíticos podem ir por legítimo interesse, mas o consentimento é a via mais segura. O consentimento deve ser livre, informado e inequívoco (LGPD art. 5º, XII; art. 8º), com recusa tão fácil quanto o aceite e sem opções pré-habilitadas. Consent Mode v2 é exigência do próprio Google. *(Correção da revisão: a data correta do Guia é 18/10/2022, não "out/2023".)*

**Valor exato.** `privacidade.baseAnuncios = "consentimento"` (já setado).

**Confiança:** Alta.

---

### 3.2 — (c) Encarregado: agente de pequeno porte

**Pergunta.** Confirma o enquadramento da Lemamon.dev como agente de tratamento de pequeno porte, que dispensa indicar encarregado, mantido um canal de atendimento ao titular (o e-mail da Política cumpre o art. 41, §2º, I)?

**Recomendação.** Manter `encarregado = "pequeno_porte"` (sem DPO nomeado), usando o e-mail geral da Política como canal do titular. Perfil compatível: baixo volume de dados de contato B2B, sem dados sensíveis, sem tratamento de alto risco. A dispensa é só da **nomeação formal** — não afasta bases legais, princípios, direitos e demais obrigações.

**Opções.** (1) `"pequeno_porte"` — não publica DPO; e-mail geral como canal (**recomendada**). (2) Indicar encarregado `{ nome, email }` — facultativo; conta como boa prática de governança e atenuante (LGPD art. 52, §1º, IX).

**Justificativa (norma + fonte).** Res. CD/ANPD **2/2022**: art. 2º define o agente de pequeno porte (ME, EPP, startups, pessoas jurídicas de direito privado); art. 3º afasta quem faz tratamento de alto risco; art. 11 dispensa a indicação de encarregado, mas exige disponibilizar um canal com o titular; art. 5º exige comprovar o enquadramento à ANPD em até 15 dias se solicitado. **Incorporado da revisão:** desde 16/07/2024 vigora a Res. CD/ANPD **18/2024** (Regulamento da atuação do encarregado), a norma **atual** sobre o encarregado — ela **mantém** a dispensa para o agente de pequeno porte e remete expressamente ao art. 11 da Res. 2/2022 para o canal ao titular. **Teste de alto risco (art. 4º da Res. 2/2022):** registrar que o score A/B/C/D é perfilização (critério específico), mas, pelo baixo volume, **não** há "larga escala" (critério geral) — logo não caracteriza tratamento de alto risco e preserva o enquadramento.

**Valor exato.** `privacidade.encarregado = "pequeno_porte"` (já setado).

**Confiança:** Alta.
**Dono confirma:** o porte real (ME/EPP/startup pelo faturamento do ano-calendário, art. 2º) e a ausência de tratamento de alto risco (arts. 3º e 4º). Guardar a análise para eventual comprovação à ANPD em 15 dias (art. 5º).

---

### 3.3 — (d) Base legal no B2B

**Pergunta.** Confirma a base dupla para o pedido de diagnóstico: art. 7º, V (procedimentos preliminares a contrato, a pedido do titular) para responder/conduzir o diagnóstico, devolutiva e proposta; e art. 7º, IX (legítimo interesse) para ordenar a fila, retomar contato e atribuição — lembrando que no Brasil o dado de contato profissional é dado pessoal (não há exceção B2B como no GDPR)?

**Recomendação.** Manter a redação atual. `legal_basis.items.diagnosis` por art. 7º, V (o titular pediu o serviço); `legal_basis.items.service_order` por art. 7º, IX, com as salvaguardas do art. 10. **Não** usar consentimento como base para responder ao pedido.

**Opções.** (1) art. 7º, V + IX, como já está (**recomendada**). (2) consentimento (art. 7º, I) — desnecessário e cria atrito, já que o próprio titular solicitou o diagnóstico.

**Justificativa (norma + fonte).** LGPD art. 7º, V (execução de procedimentos preliminares relacionados a contrato, a pedido do titular); art. 7º, IX (legítimo interesse) com a avaliação do art. 10; o contato profissional é dado pessoal (art. 5º, I e II). Fonte: LGPD (Planalto).

**Valor exato.** Sem alteração de campo. Manter `legal_basis.items.diagnosis` (art. 7º, V) e `legal_basis.items.service_order` (art. 7º, IX).

**Confiança:** Alta.

---

### 3.4 — (a/d/j/m) Correção: a importação offline do `gclid` em UMA base só

**Problema (revisão).** A coexistência "consentimento para cookies" (a) e "legítimo interesse para responder ao lead" (d) **não** é contradição — são operações distintas, logo bases distintas estão corretas. A inconsistência **real**: o **envio da conversão ao Google Ads via `gclid`** (importação offline) aparece como consentimento no ponto (a) e como legítimo interesse ("atribuição", `service_order`) nos pontos (d)/(j)/(m). A **mesma** operação fica em duas bases ao mesmo tempo.

**Recomendação (correção a aplicar no mapeamento da Política, via `shell`).** Separar duas operações e fixar **uma** base para cada:
1. **Leitura/gravação de cookies, disparo das tags do Google e envio da conversão ao Ads (importação offline do `gclid`) = consentimento** (Consent Mode v2). Sem aceite, o Consent Mode restringe e a conversão não é enviada. Retirar "medição de anúncio / importação offline" do balde de legítimo interesse.
2. **Atribuição INTERNA (registrar de que canal o lead veio, para uso próprio) + ordenação da fila + retomada = legítimo interesse** (art. 7º, IX) — **sem** envio a terceiros.

Ajustar `purposes` / `legal_basis` e o copy de (j) para que "atribuição ao Google Ads" fique sob consentimento e "atribuição interna + fila" sob legítimo interesse.

**Norma.** LGPD art. 7º, I e IX; art. 8º; art. 10. **Confiança:** Média. **Precisa de `shell`** (ajuste de i18n/config) + confirmação do advogado sobre o recorte das duas operações.

---

### 3.5 — (e) Classificação automática: o score só ordena a fila (art. 20)

**Pergunta.** Confirma que o score A/B/C/D apenas organiza a ordem de atendimento e não define quem é atendido nem a forma de atendimento (playbook 03: nunca é mostrado, não há tela de recusa, o comercial revisa), mantendo `classificacaoDefineAtendimento = false` — e que a Política deve, ainda assim, descrever a classificação e oferecer a revisão do art. 20?

**Recomendação.** Manter `classificacaoDefineAtendimento = false`. Usar `purposes.items.service_order` e `rights.items.automated_review` (sem as variantes `*_with_routing`). Manter na Política a descrição da classificação e a oferta de revisão do art. 20, e preservar a revisão humana real pelo comercial. Reavaliar para `true` só se o score passar a condicionar o acesso ou a forma de atendimento.

**Opções.** (1) `false` — classificação só organiza a ordem (**recomendada**). (2) `true` — classificação também define a forma de atendimento (`service_order_with_routing` / `automated_review_with_routing`).

**Justificativa (norma + fonte).** LGPD art. 20: direito a solicitar revisão de decisões tomadas unicamente com base em tratamento automatizado que afetem interesses do titular. A exigência de revisão **por pessoa natural** foi retirada (MP 869/2018) e o veto ao §3º foi mantido pelo Congresso em 02/10/2019 (Lei 13.853/2019) — logo a revisão humana não é legalmente obrigatória, mas é boa prática e aqui é real. Art. 9º: transparência sobre a finalidade. Fonte: LGPD (Planalto).

**Valor exato.** `privacidade.classificacaoDefineAtendimento = false`.

**Confiança:** Alta.
**Compromisso do dono:** o score permanece só de ordenação (playbook 03). Se passar a condicionar acesso ou forma de atendimento, mudar para `true` e ligar as variantes `*_with_routing` antes de ir ao ar.

---

### 3.6 — (i) Papel do Google no Ads e no GA4

**Pergunta.** Confirma o enquadramento misto do Google: controlador independente quanto ao que ele trata sob a política própria, e operador quanto à medição feita a pedido da Lemamon.dev? A Política pode manter "O Google também trata parte desses dados sob a política de privacidade dele"?

**Recomendação.** Manter o enquadramento misto já refletido na Política. O Google é **operador** na medição por conta da Lemamon.dev (*Ads Data Processing Terms*) **e** **controlador independente** quanto ao que trata para fins próprios (*Google Measurement Controller-Controller Data Protection Terms*, que citam expressamente a LGPD). As frases atuais (`navigation_data.items.google_ads`, `processors.items.google_ads`) já expressam isso — nada a mudar na copy.

**Opções.** (1) papel duplo (operador + controlador independente) (**recomendada**). (2) só operador — incorreto p/ GA4/Ads. (3) controladoria conjunta (joint) — não é o modelo contratual padrão do Google.

**Justificativa (norma + fonte).** LGPD art. 5º, VI e VII (distinção controlador × operador). Os *Google Measurement Controller-Controller Data Protection Terms* afirmam que cada parte é controladora independente e incluem a LGPD; os *Ads Data Processing Terms* colocam o Google como operador para os dados tratados a pedido do anunciante. Fonte: termos de proteção de dados do Google (support.google.com/analytics).

**Valor exato.** Sem alteração de copy.

**Confiança:** Alta.
**Dono confirma:** quais termos estão aceitos nas contas (*Ads Data Processing Terms* e *Measurement Controller-Controller Terms* / data-sharing do GA4) e anexa ao registro de operadores (playbook 10 §10).

---

### 3.7 — (j) Efeito da oposição por e-mail à medição de anúncios

**Pergunta.** Confirma o efeito e a redação: sob consentimento, a oposição à medição de anúncios é feita como **revogação do consentimento** em "Preferências de cookies" (`controls_opposition` não renderiza); o direito de oposição por e-mail permanece para os usos por legítimo interesse (fila, atribuição interna, medição do site) e, na operação, retira o titular da importação offline, quando a Lemamon.dev deixa de informar ao Google Ads como o pedido evoluiu?

**Recomendação.** Descrever o efeito explicitamente. Com `baseAnuncios = "consentimento"`, `navigation_data.controls_opposition` **não** renderiza — parar a medição por anúncios vira revogação do consentimento em {preferencias_de_cookies} (`ads_measurement_with_consent`). O direito de oposição por e-mail segue valendo para os tratamentos por legítimo interesse (art. 7º, IX) e como salvaguarda; na operação, oposição = `nao_contatar` + exclusão da importação offline do Google Ads (playbook 07 §4.4).

**Opções.** (1) descrever o efeito concreto + revogação via preferências (**recomendada**). (2) só a linha genérica de oposição ao legítimo interesse (`legal_basis.closing`).

**Justificativa (norma + fonte).** LGPD art. 18 (direitos); art. 18, §2º (oposição a tratamento com dispensa de consentimento, em caso de descumprimento); art. 10 (salvaguardas do legítimo interesse incluem oposição). Quando a base é consentimento, aplica-se a revogação (art. 8º, §5º; art. 18, IX). Fonte: LGPD (Planalto).

**Valor exato.** Manter `legal_basis.closing` + `ads_measurement_with_consent`. **Sem novo campo** em `dono.json`.

**Confiança:** Média.
**Depende de (i):** o papel do Google e o prazo das conversões definem em quanto tempo a importação offline cessa após a oposição.

---

### 3.8 — (k) Remarketing: desligado; se ligar, só por consentimento

**Pergunta.** Confirma que, se ligar remarketing, a base é consentimento (art. 7º, I), exigindo `baseAnuncios = "consentimento"`, e que as variantes já prontas (`text_with_remarketing`; `items.remarketing`; `google_ads_with_remarketing`) bastam?

**Recomendação.** Manter `remarketing = false` no lançamento. Se ligar: base = consentimento (art. 7º, I), **nunca** legítimo interesse. O código já condiciona personalização e Google Signals ao remarketing + aceite (B348); os textos prontos entram automaticamente.

**Opções.** (1) `false` — sem remarketing, Signals ou personalização (**recomendada agora**). (2) `true` — remarketing por consentimento, com as variantes prontas (exige `baseAnuncios = "consentimento"`).

**Justificativa (norma + fonte).** ANPD, *Guia de Cookies* (18/10/2022): cookies de publicidade/remarketing exigem consentimento (LGPD art. 7º, I; art. 8º). Legítimo interesse não ampara remarketing. Fonte: Guia ANPD.

**Valor exato.** `privacidade.remarketing = false`.

**Confiança:** Alta.

---

### 3.9 — (b) Mecanismo de transferência internacional

**Pergunta.** Preencher `mecanismoTransferencia` citando as cláusulas contratuais do art. 33, II, ou manter `null` (frase padrão, que só informa armazenamento fora do Brasil)? E confirmar que os DPAs de Netlify, Google (Ads/GA4), Microsoft 365, Meta/WhatsApp e New Relic já adotam as **Cláusulas-Padrão Contratuais da ANPD** (Anexo II da Res. 19/2024) ou cláusulas específicas aprovadas?

**Recomendação (rebaixada pela revisão).** **Manter `mecanismoTransferencia = null` AGORA** (frase padrão `processors.closing`, que informa que os dados ficam fora do Brasil). **Só preencher** a frase do art. 33, II **depois** de conferir, DPA a DPA, que a base é cláusula contratual compatível com as CPC da ANPD — ou outra hipótese do art. 33 quando couber. Para um controlador pequeno, afirmar algo não confirmado pode tornar a Política factualmente falsa.

**Opções.** (1) `null` — frase padrão, enquanto os DPAs não são conferidos (**recomendada agora**). (2) Preencher art. 33, II **após** confirmar as CPC da ANPD em cada DPA. (3) Invocar adequação (art. 33, I) — **não cabe**: a ANPD ainda não editou decisão de adequação de país/organismo.

**Justificativa (norma + fonte).** LGPD art. 33 lista as hipóteses de transferência internacional; o inciso II admite garantias contratuais (entre elas as cláusulas-padrão). Res. CD/ANPD **19/2024** (publicada em 23/08/2024) aprovou o Regulamento de Transferência Internacional e as CPC (Anexo II), com adoção integral e sem alteração (art. 16); o art. 18 admite equivalência de cláusulas de outros países. O **prazo de 12 meses** para adequar contratos **encerrou em 23/08/2025** — hoje (27/10/2026) já passou —, então transferência por cláusulas contratuais só vale com as **CPC da ANPD** ou cláusulas específicas aprovadas. Como a maioria dos SaaS globais ainda opera com SCCs próprias (UE), e para o Google-controlador-independente (item i) a garantia do art. 33, II é controller-to-controller e não encaixa de forma limpa, a conferência DPA a DPA é essencial antes de publicar a frase. Fontes: gov.br/anpd (Res. 19/2024); Mayer Brown; Lefosse; ZNA Advogados.

**Valor exato (agora).** `privacidade.mecanismoTransferencia = null`.
**Frase pronta para quando confirmar (cada idioma ≤200 caracteres):**
```json
{
  "pt": "cláusulas contratuais de proteção de dados firmadas com cada fornecedor, que asseguram proteção equivalente à da LGPD",
  "en": "data protection contractual clauses signed with each provider, ensuring protection equivalent to the LGPD",
  "es": "cláusulas contractuales de protección de datos firmadas con cada proveedor, que garantizan una protección equivalente a la de la LGPD"
}
```

**Confiança:** Média.
**Dono confirma:** no DPA/aditivo de cada fornecedor (Netlify, Google, Microsoft 365, Meta/WhatsApp, New Relic) se a base é cláusula contratual e se já incorpora as CPC da ANPD (Anexo II) ou cláusula específica aprovada. Se algum fornecedor não tiver, rever a base para aquele fornecedor.

---

### 3.10 — (f) E-mail: Microsoft 365 contratado pela GoDaddy

**Pergunta.** O *Microsoft Products and Services DPA* cobre a conta M365 revendida/administrada pela GoDaddy, ou a conta é regida pelos termos da GoDaddy? A GoDaddy entra como suboperadora à parte, além da menção já existente "(contratado por meio da GoDaddy)"?

**Recomendação.** Manter `provedorEmail = "microsoft_365"` e a frase pronta (`processors.items.email_with_microsoft_365`), que já diz "Microsoft 365 (contratado por meio da GoDaddy)". Enquadrar a Microsoft como operadora do e-mail e a GoDaddy como operadora/suboperadora que administra a conta. A menção atual já atende à transparência (art. 9º) — **não** é preciso item separado para a GoDaddy. Obter, para o registro de operadores, o aditivo de tratamento **tanto da Microsoft quanto da GoDaddy**.

**Opções.** (1) manter só a menção atual (**recomendada**). (2) acrescentar item separado citando a GoDaddy como administradora/suboperadora. (3) migrar o e-mail para Microsoft ou Google **contratado direto** (sem revenda), encerrando a dúvida sobre a cadeia.

**Justificativa (norma + fonte).** LGPD art. 39 (o operador trata conforme instruções do controlador; a cadeia de suboperadores sob contrato equivalente). O *GoDaddy Reseller DPA* descreve o revendedor processando dados em nome e sob instruções da GoDaddy, e o DPA geral da GoDaddy a coloca como "Processor or Subprocessor". O DPA da Microsoft separa papéis (onde a Microsoft é controladora — p.ex. dados de diagnóstico — vale a Privacy Statement, não o DPA). Não há confirmação pública do escopo do DPA da Microsoft para **licença revendida** — por isso a conferência. Art. 9º (transparência) exige informar o uso compartilhado; a frase atual já cumpre. Fontes: GoDaddy Reseller DPA / Data Processing Addendum; Microsoft Products and Services DPA.

**Valor exato.** Manter `provedorEmail = "microsoft_365"`. Copy sem alteração: `processors.items.email_with_microsoft_365`.

**Confiança:** Média.
**Dono levanta (painel GoDaddy / contrato):** (1) se a conta M365 é regida pelo *Microsoft Products and Services DPA* ou pelos termos da GoDaddy; (2) o aditivo de tratamento da GoDaddy para a revenda do M365; (3) o escopo do DPA da Microsoft para licença revendida. Guardar ambos no registro de operadores (playbook 10 §10).

---

### 3.11 — (g) Akismet (Automattic) como suboperador do Netlify Forms

**Pergunta.** Declarar o Akismet (Automattic, EUA) como suboperador do Netlify no filtro de spam, ou basta a menção genérica ao Netlify? O Netlify roda o Akismet em todo envio, **sem opção de desligar**, e o Akismet recebe o conteúdo do formulário e o IP.

**Recomendação.** **Declarar.** Acrescentar à linha do Netlify que o filtro de spam dos formulários usa o Akismet (Automattic, EUA). É suboperador que recebe dado pessoal (conteúdo + IP) e armazena fora do Brasil; a transparência pede identificar esse compartilhamento. Custo baixo, risco menor.

**Opções.** (1) acrescentar à linha do Netlify (**recomendada**). (2) item próprio "Akismet" em `processors.items`. (3) não citar (menor transparência; não recomendado).

**Justificativa (norma + fonte).** A documentação do Netlify confirma que todo envio de formulário é filtrado pelo Akismet, em segundo plano, sem opt-out. O Akismet é serviço da Automattic (EUA); listas de suboperadores o descrevem recebendo IP e conteúdo. LGPD art. 6º, VI (transparência) e art. 9º, III (informação sobre uso compartilhado); na cadeia, Netlify é operador e Akismet suboperador (art. 39). Fontes: docs.netlify.com (spam filters); netlify.com/blog (Akismet); akismet.com/privacy.

**Valor exato (copy p/ `shell`, append a `processors.items.netlify`):**
- **pt:** "Netlify: hospedagem do site e recebimento dos formulários. O filtro de spam dos formulários usa o Akismet (Automattic, EUA)."
- **en:** "Netlify: site hosting and form handling. Form spam filtering uses Akismet (Automattic, USA)."
- **es:** "Netlify: alojamiento del sitio y recepción de los formularios. El filtro de spam de los formularios usa Akismet (Automattic, EE. UU.)."

**Confiança:** Alta.
**Precisa de `shell`** (i18n nos 3 idiomas) + atualizar `privacidade.atualizadaEm` ao publicar. Confirmar no DPA do Netlify que o Akismet é o suboperador de spam e quais campos recebe.

---

### 3.12 — (m) "Não vendemos dados pessoais"

**Pergunta.** Confirma que enviar conversões/`gclid` ao Google Ads para medir as próprias campanhas não configura venda nem compartilhamento comercial, autorizando publicar "Não vendemos dados pessoais" (`purposes.closing`)?

**Recomendação.** Definir `naoVendemosConfirmado = true`. O envio de conversões/`gclid` ao Ads **não é venda** (a LGPD não usa o conceito de "venda"; não há contraprestação pela transferência) **nem compartilhamento comercial**: é compartilhamento com fornecedor de medição, para finalidade própria já declarada (`purposes.items.attribution`). A frase é verdadeira. Por ser compromisso absoluto, fica **contingente** à conclusão do item (i).

**Opções.** (1) `true` — publica "Não vendemos dados pessoais" (**recomendada**). (2) `false` — omite a frase (se o advogado preferir não assumir compromisso absoluto antes de (i)).

**Justificativa (norma + fonte).** A LGPD disciplina "compartilhamento" e "uso compartilhado de dados" (art. 5º, XVI; art. 7º; art. 11, §4º), não "venda" (conceito da CCPA, EUA). Não há contraprestação financeira pela transferência, e a finalidade (medir campanhas) está declarada; transparência e boa-fé (art. 6º). Fonte: LGPD (Planalto).

**Valor exato.** `privacidade.naoVendemosConfirmado = true`.

**Confiança:** Média.
**Dono confirma** que nenhum dado é transferido a terceiros mediante contraprestação. Se o Google for tido como controlador independente usando os dados para fins próprios (item i), revisar a redação — ainda assim não há "venda".

---

### 3.13 — (n) Direito de anonimização/exclusão (art. 18, IV) e enumeração completa

**Pergunta.** Confirma que `rights.items.anonymization_deletion` reproduz o art. 18, IV, e que, com base consentimento, consta também a eliminação dos dados tratados com consentimento (art. 18, VI)? **E (revisão):** a Política lista **todos** os incisos do art. 18 (I–IX)?

**Recomendação.** Manter a redação atual do inciso IV + `rights.items.consent_deletion` (art. 18, VI) + `retention.closing`. **Incorporado da revisão:** confirmar/incluir a **enumeração completa do art. 18, I–IX**: I confirmação, II acesso, III correção, IV anonimização/bloqueio/eliminação, V **portabilidade** (hoje ausente — incluir com a ressalva "nos termos da regulamentação da ANPD", eficácia limitada até regulamentação), VI eliminação dos dados consentidos, VII informação sobre uso compartilhado, VIII informação sobre a opção de não consentir, IX revogação do consentimento. Incluir também o direito de **petição/reclamação à ANPD** (art. 18, §1º; art. 19).

**Opções.** (1) manter o inciso IV + completar I–IX (**recomendada**). (2) detalhar inline a exceção de guarda legal (redundante com `retention.closing`).

**Justificativa (norma + fonte).** LGPD art. 18, I a IX; art. 18, §1º (petição à ANPD); art. 16 (hipóteses de conservação); art. 19 (prazos de resposta). Fonte: LGPD (Planalto).

**Valor exato (copy já pronta do inciso IV — sem alteração):**
- **pt:** "A anonimização, o bloqueio ou a exclusão do que for desnecessário, excessivo ou tratado em desacordo com a LGPD."
- **en:** "Anonymization, blocking or deletion of anything unnecessary, excessive or processed in breach of the LGPD."
- **es:** "La anonimización, el bloqueo o la eliminación de los datos innecesarios, excesivos o tratados en incumplimiento de la LGPD."

A inclusão da portabilidade (V) e demais incisos faltantes é tarefa de copy do `shell`.

**Confiança:** Alta (inciso IV) / Média (completar I–IX depende de checar a Política atual).

---

### 3.14 — (l) Marco Civil, art. 15 (reescrito — era placeholder)

**Pergunta.** O art. 15 do Marco Civil (guarda de registros de acesso por 6 meses) se aplica a um site institucional/marketing com formulários? Até onde os logs da Netlify atendem? Como fechar o gap entre a janela curta da Netlify e a obrigação de 6 meses?

**Recomendação (padrão, proporcional).**
1. Reconhecer que o art. 15 obriga o **provedor de aplicações de internet, pessoa jurídica, que exerça a atividade de forma organizada, profissionalmente e com fins econômicos**, a guardar os registros de acesso por **6 meses**, sob sigilo e em ambiente controlado.
2. **Porém** a **aplicabilidade a um site vitrine/institucional com formulários é genuinamente discutível**: o dispositivo mira o provedor cuja atividade econômica **é** a aplicação (plataforma/serviço on-line), não um site de divulgação de uma software house. É um caso-limite.
3. **Não** contratar Netlify Enterprise/Log Drains **só** para reter logs por 6 meses — sobre-conformidade cara e desproporcional ao risco residual.
4. Publicar honestamente **"cerca de 7 dias"** (`prazos.logsHospedagem`) e **registrar no inventário** a posição assumida (limitação técnica do provedor + aplicabilidade discutível).

**Opções.** (1) assumir a limitação e documentar a posição; manter "cerca de 7 dias" (**recomendada**). (2) tratar como claramente coberto → configurar Log Drain para destino próprio com retenção de 6 meses (exige Enterprise + custo) e mudar `logsHospedagem` para "6 meses" — só se o advogado concluir que o art. 15 se aplica e o dono quiser conformidade máxima.

**Justificativa (norma + fonte).** Marco Civil (Lei 12.965/2014) art. 15, *caput* (guarda de 6 meses pelo provedor de aplicações PJ com fins econômicos), regulamentado pelo Decreto 8.771/2016; art. 5º, VIII (definição de registro de acesso a aplicações). O TJSP tratou o art. 15 como norma de eficácia contida. A Netlify mantém logs de função/edge por ~7 dias (Log Drains só no Enterprise). Fontes: Lei 12.965/2014 (Planalto); docs.netlify.com (logs/log drains).

**Valor exato.** Manter `prazos.logsHospedagem` = "cerca de 7 dias" (ver 3.20). Registrar a posição no inventário/registro de decisões.

**Confiança:** Média.
**Dono confirma** o plano Netlify e a retenção real dos logs, e se existe Log Drain. Decide com o advogado se guardará 6 meses — se sim, ajusta o draft para "6 meses".

---

### 3.15 — (p) Decreto 7.962/2013: identificação do fornecedor (incluído — estava ausente)

**Pergunta.** A oferta B2B da Lemamon.dev é relação de consumo? Se for, o Decreto 7.962/2013 exige publicar nome empresarial + CNPJ e endereço físico + eletrônico em local de destaque. Hoje o site mostra só cidade, razão social, CNPJ e e-mail.

**Recomendação.** Em regra, **não é relação de consumo**: pela **teoria finalista** adotada pelo STJ (CDC art. 2º), empresa que contrata desenvolvimento de software como **insumo da própria atividade** não é "destinatária final"/consumidora — logo o Decreto 7.962/2013, art. 2º, I–II, **não vincula**. Mesmo assim, **publicar endereço físico + e-mail em local de destaque** (p.ex. rodapé e página de orçamento) é a opção mais segura: reforça a qualificação do controlador (LGPD art. 9º e art. 41) e cobre o caso-limite de algum contratante ser tratado como consumidor (p.ex. MEI/pessoa física como destinatário final). Baixo custo, risco residual menor.

**Opções.** (1) publicar endereço físico + e-mail em destaque (**recomendada**). (2) manter só cidade + razão social + CNPJ + e-mail (mínimo, assume a tese finalista sem rede).

**Justificativa (norma + fonte).** Decreto 7.962/2013, art. 2º: os sítios de oferta/contrato de consumo devem disponibilizar, **em local de destaque e de fácil visualização**, I — nome empresarial e nº de inscrição no CNPJ/CPF; II — **endereço físico e eletrônico** e demais dados de contato. CDC art. 2º (conceito de consumidor) + teoria finalista do STJ (o destinatário final econômico; empresa que usa o serviço como insumo em regra não é consumidora). Fontes: Decreto 7.962/2013 (Planalto); CDC (Planalto); jurisprudência do STJ sobre a teoria finalista.

**Valor exato.** Não há campo em `privacidade`. É configuração do controlador (`empresa.ts` / rodapé): dono fornece e aprova o **endereço físico**; `shell` publica em destaque no rodapé e no `/orcamento`.

**Confiança:** Média.
**Dono confirma** se há alguma oferta B2C/consumo e se aceita divulgar o endereço físico (cartão CNPJ ou comercial).

---

### 3.16–3.21 — Prazos de retenção (todos obrigatórios p/ lançar)

Cada prazo é um objeto `{ pt, en, es }`, frase ≤80 caracteres por idioma.

| Campo | Valor recomendado (pt / en / es) | O que conferir na ferramenta |
|---|---|---|
| `prazos.retencaoPedidos` | "por até 24 meses após o último contato" / "for up to 24 months after the last contact" / "hasta 24 meses después del último contacto" | Netlify Forms, caixa comercial@ (M365 + lixeira/backups), WhatsApp e CSVs/CRM realmente apagam o lead ao fim do prazo; definir a rotina/responsável (playbook 10 §6) |
| `prazos.ga4` | "14 meses" / "14 months" / "14 meses" | GA4 › Admin › Config. de dados › Retenção › **ajustar "Retenção de dados de eventos" para 14 meses** (default nasce 2 meses; não é retroativo) |
| `prazos.googleAds` | "até 90 dias" / "up to 90 days" / "hasta 90 días" | Janela de conversão no Google Ads (default 30 dias, máx. 90) e se nenhum `cookie_expiration` custom foi setado no gtag. Se não houver conversion linker e a janela for 30 dias, trocar p/ "até 30 dias" |
| `prazos.conversoesGoogleAds` | "conforme a política de retenção de dados do Google" / "per Google's data-retention policy" / "según la política de retención de datos de Google" | Página "Data retention" do Google Ads antes do go-live; depende de (i). Consolidado (ver nota abaixo) |
| `prazos.newRelic` | "8 dias" / "8 days" / "8 días" | New Relic › Data management › Data retention — confirmar a janela **por tipo de dado** (métricas/logs/traces variam; logs podem nascer em 30 dias) e se o plano é gratuito/Standard Original |
| `prazos.logsHospedagem` | "cerca de 7 dias" / "about 7 days" / "unos 7 días" | Plano Netlify e retenção real; ver item (l). Se decidir guardar 6 meses (Marco Civil), ajustar p/ "6 meses" |

**Justificativas e fontes por prazo:**

- **retenção de pedidos (24 meses).** Decisão de negócio, não padrão de ferramenta. LGPD art. 15, III (término quando a finalidade é alcançada) e art. 16 (eliminação após o término), à luz de necessidade/minimização (art. 6º, III). 24 meses cobre um ciclo de reengajamento B2B razoável; **12 meses** é a opção mais conservadora; não existe prazo "oficial". **Confiança: Média.**
- **GA4 (14 meses).** O GA4 Standard só oferece 2 ou 14 meses; propriedades novas nascem em 2 meses. 14 é o teto e segue defensável sob minimização. O essencial: o valor publicado coincidir com o painel. Fonte: Google Analytics Help — Data retention. **Confiança: Alta.**
- **Google Ads — cookie (até 90 dias).** O cookie `_gcl_au` (conversion linker) expira em 90 dias; a janela de conversão default é 30 dias, máx. 90. Publicar o maior prazo evita subdeclarar a vida do cookie. Depende do consentimento. Fonte: Google Ads Help "About conversion windows" + Conversion Linker. **Confiança: Média.**
- **Conversões enviadas ao Ads (frase referencial).** Quem define/aplica o prazo é o Google: 11 anos para dados de relatório; a partir de 2026, dados granulares (horário/diário/semanal) caem a 37 meses (anúncio do Google de mai/2026, aplicação jun/2026); Customer Match ~540 dias. Como o papel do Google e o prazo exato são questão do item (i), **frase referencial** é mais estável e correta do que cravar um número. Fontes: Google Ads Help — Data retention; techwyse; ppc.land. **Confiança: Média.**
- **New Relic (8 dias).** Retenção padrão "de pelo menos 8 dias" no free tier/Standard "Original"; prazos maiores (30/60/90 dias) exigem Data Plus (pago). 8 dias é o mais minimizador e atende ao propósito (desempenho/erros, sem gravação de sessão). Atenção: **varia por tipo de dado** (logs podem nascer em 30 dias). Fontes: New Relic — pricing/free-tier e docs de data retention. **Confiança: Média.**
- **Logs da hospedagem (cerca de 7 dias).** Netlify expõe logs de função/edge por ~7 dias em planos pagos (24h no gratuito); logs de tráfego só via Log Drains (Enterprise). Gap com o Marco Civil tratado em (l). Fonte: docs.netlify.com — logs/log drains. **Confiança: Baixa** (depende do plano e da decisão de (l)).

**Nota de consolidação (revisão).** O rascunho dos especialistas tinha **dois** itens com o mesmo ref `prazo:conversoesGoogleAds` (um estilo "ponto p/ advogado", outro estilo "prazos") apontando para o **mesmo** campo. Foram **unificados** num único item com a frase referencial acima, para não colidir na aplicação nem gerar valor conflitante.

---

### 3.22 — (h) Exclusão que alcança backups e lixeira

**Pergunta.** Até onde a exclusão precisa alcançar backups e lixeiras (Itens Recuperáveis do M365, lixeira do Gmail antigo, backup do WhatsApp)? O que declarar na Política × o que basta cumprir na rotina mensal (playbook 10 §6)?

**Recomendação.** Declarar que a exclusão alcança **também a lixeira e as cópias de segurança (backups), concluída no ciclo de backup seguinte**. É razoável excluir dos sistemas ativos de imediato e dos backups no ciclo de rotação seguinte — não se exige apagar backup fora de ciclo. Operacionalmente: esvaziar a lixeira/Itens Recuperáveis do M365, a lixeira do Gmail antigo (purga ~30 dias) e desligar/retirar o backup do WhatsApp na rotina mensal.

**Opções.** (1) declarar que alcança lixeira e backups, concluída no ciclo seguinte (**recomendada**). (2) silenciar sobre backups (menor transparência; risco no art. 18, VI). (3) prometer exclusão imediata inclusive de backups (difícil de cumprir; não recomendado).

**Justificativa (norma + fonte).** LGPD art. 18, VI (eliminação a pedido) c/c art. 16 (guarda limitada ao necessário) e art. 15, III (término do tratamento). Não há norma específica da ANPD sobre backups; a prática de mercado é eliminar do ambiente ativo de imediato e dos backups no ciclo de rotação seguinte, documentando. Fonte: LGPD arts. 15, 16 e 18; playbook 10 §6.

**Valor exato (copy opcional p/ `shell`, append a `retention.items.requests`):**
- **pt:** "A exclusão alcança também a lixeira e as cópias de segurança (backups), concluída no ciclo de backup seguinte."
- **en:** "Deletion also reaches trash and backups, completed in the next backup cycle."
- **es:** "La eliminación también alcanza la papelera y las copias de seguridad, concluida en el siguiente ciclo de backup."

**Confiança:** Média.
**Dono confirma** o período de Itens Recuperáveis do M365, o ciclo de backup e se o backup do WhatsApp (Google Drive/iCloud) está ligado. Se publicar a frase, `shell` altera o i18n nos 3 idiomas; senão, basta operacionalizar na rotina mensal.

---

### 3.23 — (o) Avisos de formulário citarem o retorno ao Google Ads

**Pergunta.** Os avisos de formulário devem citar na própria tela o retorno ao Google Ads, ou basta o link para a Política (que já descreve o fluxo `gclid`→Ads)?

**Recomendação.** Adotar a variante que cita o Google Ads nos avisos (orçamento, contato e `shared.lgpd`). Não é obrigatório — os avisos já linkam a Política —, mas é a opção mais transparente, pois o `gclid` viaja junto com o envio. **Atenção (revisão/alinhamento com i/j):** sob consentimento, o envio ao Ads depende do aceite de cookies — avaliar se o aviso deve condicionar a frase ("se você aceitar os cookies de medição"). **Hoje não há chave `*_with_ads` pronta no i18n** (a "variante pronta" consta só como texto em `_notes.legal_review`, item o): `shell` precisa criá-la nos 3 idiomas.

**Opções.** (1) adotar a cláusula do Google Ads nos 3 idiomas (**recomendada**). (2) manter os avisos atuais e confiar no link da Política (mínimo suficiente).

**Justificativa (norma + fonte).** LGPD art. 9º: informação clara, no momento da coleta, sobre finalidade e compartilhamento. Não é mandatório porque a Política linkada já cobre. Fonte: LGPD (Planalto); `_notes.legal_review` (o).

**Valor exato (copy p/ `shell` — exemplo do contato):**
- **pt:** "Usamos estes dados para responder à sua mensagem e registramos como você chegou ao site, por exemplo por um anúncio; nesse caso, podemos informar ao Google Ads como o seu pedido evoluiu. Os detalhes estão na {politica}."
- **en:** "We use this information to respond to your message, and we record how you found our site, for example through an ad; in that case, we may tell Google Ads how your request progressed. The details are in our {politica}."
- **es:** "Usamos estos datos para responder a tu mensaje y registramos cómo llegaste al sitio, por ejemplo desde un anuncio; en ese caso, podemos informar a Google Ads cómo evolucionó tu solicitud. Los detalles están en la {politica}."

Para o aviso de orçamento, inserir a mesma oração "; nesse caso, podemos informar ao Google Ads como o seu pedido evoluiu" após "por exemplo por um anúncio".

**Confiança:** Média.
**Precisa de `shell`** (criar `quote.contact_form.privacy_notice`, `contact.form.privacy_notice` e `shared.lgpd.form_notice` nos 3 idiomas).

---

## 4. Já decidido pelo dono — o advogado só confirma

| Campo | Valor | O advogado confirma que… |
|---|---|---|
| `privacidade.baseAnuncios` | `"consentimento"` (D05) | é base adequada e suficiente p/ cookies do Ads + importação offline (3.1); banner Aceitar/Recusar de mesmo peso + Consent Mode v2 |
| `privacidade.encarregado` | `"pequeno_porte"` (D06) | a Lemamon.dev se enquadra como agente de pequeno porte (Res. 2/2022 + Res. 18/2024), dispensada de DPO, com o e-mail geral como canal do titular (3.2) |
| `privacidade.remarketing` | `false` | sem remarketing/Signals/personalização no lançamento (3.8) |
| `privacidade.provedorEmail` | `"microsoft_365"` | e-mail por M365 contratado via GoDaddy — pendente só a conferência dos DPAs (3.10) |

A escolha do dono por **consentimento** (e não legítimo interesse) é a mais segura e abrangente, e a única compatível com um remarketing futuro. A escolha por **pequeno porte** é coerente com o perfil (baixo volume B2B, sem dados sensíveis, sem alto risco), e a dispensa é só da nomeação formal.

---

## 5. Pontos em aberto / lacunas da revisão

Cada um com recomendação. Os que viram documento interno (LIA, ROPA, RIPD, política de segurança) não travam o lançamento do site, mas sustentam a conformidade numa fiscalização.

| # | Lacuna | Recomendação | Norma |
|---|---|---|---|
| G1 | **LIA / Relatório de Legítimo Interesse** ausente | Produzir e arquivar a LIA (teste de balanceamento) p/ os usos por legítimo interesse: ordenação da fila, retomada, atribuição interna, e base do New Relic | LGPD art. 10 |
| G2 | **Base legal do New Relic** não declarada | Declarar na Política: legítimo interesse em segurança/estabilidade/desempenho (server-side, sem gravação de sessão), com LIA; o **cookie** de navegador do New Relic segue a regra de consentimento (D05) | LGPD art. 7º, IX + art. 10 |
| G3 | **Prova/registro do consentimento** | Guardar logs auditáveis do consentimento (registros da CMP/Consent Mode) — ônus do controlador | LGPD art. 8º, §2º |
| G4 | **Aviso de privacidade no WhatsApp** na coleta | Mensagem curta/boas-vindas com a finalidade + link p/ a Política | LGPD art. 9º |
| G5 | **ROPA** (registro das operações) | Manter ROPA em forma **simplificada** (modelo ANPD). O "registro de operadores" do playbook §10 é mais estreito que o ROPA | LGPD art. 37; Res. 2/2022 |
| G6 | **RIPD** do score e dos usos por legítimo interesse | A Res. 2/2022 **não** dispensa RIPD (dispensa DPO e simplifica ROPA). Manter um RIPD enxuto, guardado junto da LIA | LGPD art. 38 |
| G7 | **Medidas de segurança + incidentes** | A Política menciona que há medidas técnicas/administrativas; manter política simplificada de segurança e procedimento de comunicação de incidente (ANPD + titulares) | LGPD arts. 46–49; art. 48; Res. 2/2022 art. 12; Res. 15/2024 |
| G8 | **Menores** | Declarar que o site é B2B, não é dirigido a crianças/adolescentes e não coleta dados de menores conscientemente | LGPD art. 14 |
| G9 | **Dados sensíveis** | Declarar que os formulários não coletam dados sensíveis e orientar o titular a não enviá-los por formulário/WhatsApp | LGPD art. 11 |
| G10 | **Qualificação e canal do controlador** | Confirmar que a Política traz razão social, CNPJ e um canal dedicado ao exercício de direitos (liga com c e p) | LGPD art. 9º, art. 41 |
| G11 | **Extraterritorialidade (GDPR/UK GDPR)** | Atende o mundo todo em pt/en/es (D31): avaliar se ofertar a titulares na UE/Reino Unido aciona o GDPR (art. 3º) e se cabe menção/representante. Hoje o texto é só LGPD | GDPR/UK GDPR art. 3º |
| G12 | **Revogação do consentimento** | Confirmar que a Política traz o direito de revogar a qualquer tempo, além da reabertura por "Preferências de cookies" | LGPD art. 8º, §5º |
| G13 | **Inventário/política de cookies** | Criar capítulo/tabela de cookies: classificar por finalidade/necessidade/gestão/retenção; só os estritamente necessários rodam sem consentimento; Consent Mode v2 nasce *default denied* (nenhum cookie não essencial antes do aceite) | ANPD, Guia de Cookies (18/10/2022); LGPD art. 8º, art. 5º, XII |

---

## 6. Como aplicar depois de confirmado

Campos de `dados/dono.json › privacidade` para a sessão principal preencher num comando (valores recomendados):

```json
{
  "baseAnuncios": "consentimento",
  "encarregado": "pequeno_porte",
  "mecanismoTransferencia": null,
  "prazos": {
    "retencaoPedidos": { "pt": "por até 24 meses após o último contato", "en": "for up to 24 months after the last contact", "es": "hasta 24 meses después del último contacto" },
    "ga4": { "pt": "14 meses", "en": "14 months", "es": "14 meses" },
    "googleAds": { "pt": "até 90 dias", "en": "up to 90 days", "es": "hasta 90 días" },
    "conversoesGoogleAds": { "pt": "conforme a política de retenção de dados do Google", "en": "per Google's data-retention policy", "es": "según la política de retención de datos de Google" },
    "newRelic": { "pt": "8 dias", "en": "8 days", "es": "8 días" },
    "logsHospedagem": { "pt": "cerca de 7 dias", "en": "about 7 days", "es": "unos 7 días" }
  },
  "atualizadaEm": "<AAAA-MM-DD do go-live — dono preenche>",
  "remarketing": false,
  "provedorEmail": "microsoft_365",
  "classificacaoDefineAtendimento": false,
  "naoVendemosConfirmado": true
}
```

> **Confirmar o formato dos `prazos` antes de aplicar:** o campo espera `{ pt, en, es }` (frase por idioma ≤80 caracteres), conforme o enunciado da tarefa. Conferir contra o schema de `privacidade.ts` / `src/config` ao preencher — se o campo for string única, usar só a frase `pt`.

**Pendências que `null`/vazio dependem de dado externo:**
- `mecanismoTransferencia`: fica `null` até a conferência dos DPAs (3.9). Quando confirmado que a base são as CPC da ANPD, trocar pela frase `{ pt, en, es }` do 3.9.
- `atualizadaEm`: dono preenche a data real no dia do go-live (3.24 não aplicável antes).

**Tarefas de copy para o agente `shell` (i18n, 3 idiomas) — não são campos de `dono.json`:**
1. Akismet na linha do Netlify (3.11).
2. Separar a importação offline do `gclid` numa base só (consentimento) e corrigir o copy de (j) (3.4).
3. Variante dos avisos de formulário citando o Google Ads (3.23).
4. Completar a enumeração do art. 18, I–IX, com portabilidade (3.13).
5. (Opcional) frase de backups em `retention.items.requests` (3.22).
6. Capítulo/tabela de cookies (G13).
7. Base do New Relic na Política (G2); declarações de menores (G8) e dados sensíveis (G9).

**Tarefa de configuração do controlador (fora de `privacidade`):** endereço físico + e-mail em destaque no rodapé e no `/orcamento` (3.15, item p) — dono fornece/aprova o endereço, `shell` publica.

**Verificações nas ferramentas antes do go-live:** GA4 → 14 meses; Google Ads → janela de conversão e conversion linker; New Relic → retenção por tipo de dado; Netlify → plano e logs; DPAs de todos os fornecedores → base de transferência (CPC da ANPD?).

---

### Fontes consultadas (verificação de normas, 27/10/2026)

- LGPD — Lei 13.709/2018; Marco Civil — Lei 12.965/2014 (art. 15) e Decreto 8.771/2016; Decreto 7.962/2013 (art. 2º); CDC — Lei 8.078/1990 (art. 2º). Planalto: planalto.gov.br.
- Res. CD/ANPD **19/2024** (transferência internacional; CPC Anexo II; prazo encerrado em 23/08/2025): gov.br/anpd; Mayer Brown; Lefosse; ZNA Advogados.
- Res. CD/ANPD **18/2024** (atuação do encarregado; mantém a dispensa do pequeno porte) e Res. CD/ANPD **2/2022** (agente de pequeno porte): gov.br/anpd; publicação DOU 17/07/2024; Machado Meyer; Protiviti.
- ANPD, **Guia Orientativo: Cookies e Proteção de Dados Pessoais, 18/10/2022** (documento interpretativo): gov.br/anpd; Mattos Filho; Lefosse.
- Google Ads **Data retention** (37 meses granular / 11 anos relatório, 2026): Google Ads Help; techwyse; ppc.land; searchenginejournal.
- GA4 **Data retention** (2/14 meses): Google Analytics Help; usercentrics.
- New Relic **data retention** (≥8 dias free/Standard; Data Plus): newrelic.com/pricing; docs.newrelic.com.
- Netlify **logs / Log Drains** (~7 dias; Log Drains Enterprise): docs.netlify.com.
