# 10 — LGPD operacional

**Backlog:** B089 (Política publicada com dados reais do controlador: decisões e dados do dono; a página é do agente `shell`), B344 (decisão de base legal; o aviso de cookies com Consent Mode já está pronto no código), B274 (New Relic: gravação de sessão já desligada no código; falta o dono assinar a D18).
**Fontes:** BLUEPRINT §6.13, §14 item 13; i18n `_notes.launch_blockers`, `_notes.legal_review`, `_notes.privacy_conditionals`, `quote._notes.privacy`; `src/config/privacidade.ts`; `src/config/empresa.ts`.

> Este playbook organiza o trabalho; não é parecer jurídico. Os pontos marcados "advogado" precisam de revisão profissional antes do lançamento.

---

## 1. Papéis

| Situação | Papel da Lemamon.dev |
|---|---|
| Pedidos do site (wizard e `/contato`), conversas por WhatsApp e e-mail, medição do site | **controladora** |
| Sistemas que a Lemamon.dev desenvolve ou mantém e que tratam dados dos clientes do cliente | **operadora** do cliente (ver §12) |

Controlador identificado na Política: razão social + CNPJ em `dados/dono.json › empresa`, hoje Lemamon.dev LTDA, CNPJ 69.700.690/0001-98 (D39). O nome da pessoa responsável (`empresa.responsavel`) só serve para controlador sem PJ e fica vazio.

## 2. Bloqueadores de lançamento (i18n `_notes.launch_blockers`)

| # | Item | Responsável | Feito |
|---|---|---|---|
| 1 | Controlador em `dados/dono.json › empresa` (razão social + CNPJ, ou responsável). Razão social e CNPJ informados em 20/10/2026 (D39): a trava não lista mais `empresa`; falta só a conferência do dono contra o cartão CNPJ (grafia e município da sede, [00](00-DADOS-DO-DONO.md) §A2) | dono | [x] 20/10/2026 |
| 2 | `privacidade.ts`: `baseAnuncios`, `encarregado`, `mecanismoTransferencia` | dono + advogado | [ ] |
| 3 | `privacidade.ts`: os 6 prazos de retenção, conferidos nas ferramentas (§5) | dono | [ ] |
| 4 | Remarketing e personalização: desligados (`privacidade.remarketing = false`, tag do Ads com `allow_ad_personalization_signals: false`, sem listas de público, Google Signals desligado) **ou** `remarketing = true` com `baseAnuncios = "consentimento"` (o aviso de cookies e a tag ligada ao aceite já estão prontos no código: B344, B348). **Conversões otimizadas do Google Ads desligadas** | dono (contas) | [ ] |
| 5 | Revisão jurídica da Política inteira (§4) | advogado | [ ] |
| 6 | Imagem de compartilhamento (OG) nova, uma por idioma | `shell` | [ ] |
| 7 | Formulários fora das gravações do New Relic (`data-nr-block` no wizard e no `/contato`, com verificação automática). A gravação de sessão já está **desligada** (§11); o bloqueio fica como garantia para o caso de religar | `shell` / `conversion` | [ ] |

Valores e formato de `dados/dono.json › empresa` e `› privacidade`: playbook [00](00-DADOS-DO-DONO.md) §A2 e §A3.

## 3. Operadores e o que cada um recebe

| Operador | Para quê | Dados | Observações |
|---|---|---|---|
| Netlify | hospedagem e formulários | campos do `briefing` e do `contato`; o Netlify também registra IP e navegador de quem envia; logs de acesso | o filtro de spam dos formulários usa o Akismet (citar ou não como suboperador: advogado, item g) |
| Google Analytics 4 | medição do site | navegação e eventos; respostas do wizard só no `lead_submitted` | retenção configurada no GA4 |
| Google Ads | medir anúncios | cookies de clique, `gclid`, conversão no envio e importação offline da evolução do pedido | papel do Google: advogado, item i |
| Gmail (Google) | e-mail da Lemamon.dev e notificações de formulário | tudo o que chega por e-mail | com Google Workspace e aditivo assinado, a Política troca para `email_with_workspace` (playbook 11) |
| New Relic | desempenho e erros | navegação, velocidade e erros (sem gravação de sessão); no `lead_failed`, só motivo, tentativas, status HTTP, formulário e o código do pedido, nada do que a pessoa digitou | ver §11 |
| WhatsApp (Meta) | conversa quando o visitante clica | o que a pessoa envia | backups no Google Drive ou iCloud entram na rotina de exclusão |

**Regra antes de ligar qualquer ferramenta nova** que receba dado pessoal (agenda online, CRM em nuvem, ferramenta de e-mail, Slack, webhook, Zapier/Make, player de vídeo, Tag Manager, pixels):

1. Leia os termos e o aditivo de tratamento de dados da ferramenta; anote onde os dados ficam (transferência internacional).
2. Declare a ferramenta na Política. As 5 já previstas ligam o item pronto preenchendo `dados/dono.json › privacidade.ferramentas.<nome>` (fornecedor e prazo nos 3 idiomas): `agenda` (agenda online), `crm` (CRM ou planilha na nuvem), `emailAcompanhamento` (e-mails de acompanhamento a quem pediu o diagnóstico), `automacao` (webhook, Zapier/Make) e `chatEquipe` (aviso no chat da equipe). Ferramenta fora dessa lista, ou com finalidade nova (ex.: newsletter, que pede consentimento), exige pedido ao agente `shell` do item novo em `privacy.sections.processors` (e em `purposes`, `legal_basis`, `navigation_data` ou `retention`, se for o caso) nos 3 idiomas.
3. Defina o prazo de retenção da ferramenta.
4. Atualize `privacidade.atualizadaEm`.
5. Publique a Política nova.
6. **Só então** ative a ferramenta.

Se uma ferramenta sair do site, o item dela sai da Política e a data muda: a lista de fornecedores nunca cita ferramenta inativa.

## 4. Pontos para o advogado (i18n `_notes.legal_review`, resumido)

- [ ] **(a)** Base legal dos cookies do Google Ads e da importação offline pelo `gclid`: legítimo interesse (sem aviso de cookies, com teste de balanceamento documentado) ou consentimento (com aviso de cookies).
- [ ] **(b)** Mecanismo de transferência internacional de cada fornecedor (art. 33; Res. CD/ANPD 19/2024) → `mecanismoTransferencia`.
- [ ] **(c)** Encarregado (art. 41): a Lemamon.dev se enquadra como agente de pequeno porte (Res. CD/ANPD 2/2022)? → `encarregado`.
- [ ] **(d)** Base legal no B2B (art. 7º): quem preenche costuma falar em nome de uma empresa.
- [ ] **(e)** Classificação automática dos pedidos (arts. 9º e 20): se ela também definir a forma de atendimento (retomada para C, resposta própria para D), ligar `privacidade.classificacaoDefineAtendimento` (usa as variantes `*_with_routing`).
- [ ] **(f)** Fornecedor do e-mail (`privacidade.provedorEmail`, playbook 11). Hoje é Microsoft 365 contratado pela GoDaddy (D41): confirmar se o termo de tratamento de dados da Microsoft cobre a conta contratada pela GoDaddy e se a GoDaddy, que administra a conta, entra como suboperador à parte.
- [ ] **(g)** Akismet como suboperador. _Rascunho aplicado pelo `shell`: `processors.items.netlify` cita o Akismet (Automattic, EUA) como filtro de spam dos formulários._
- [ ] **(h)** Prazos de retenção e se a exclusão alcança os backups (lixeira e backups do e-mail, inclusive do Gmail antigo enquanto ele existir; backup do WhatsApp). _Rascunho aplicado: `retention.items.requests` termina dizendo que a exclusão alcança a lixeira e as cópias de segurança (backups), concluída no ciclo de backup seguinte._
- [ ] **(i)** Papel do Google no Ads e no GA4 (operador ou controlador independente) e o prazo das conversões enviadas.
- [ ] **(j)** Efeito da oposição por e-mail (a Lemamon.dev deixa de informar ao Ads como o pedido evoluiu).
- [ ] **(k)** Base e texto do remarketing, se for ativado.
- [ ] **(l)** Marco Civil, art. 15: guarda de registros de acesso e o prazo dos logs da Netlify.
- [ ] **(m)** "Não vendemos dados pessoais": confirmar que o envio de conversões ao Ads não é venda nem compartilhamento comercial. A frase só vai ao ar com `privacidade.naoVendemosConfirmado = true` (sua confirmação e a do advogado).
- [ ] **(n)** Redação do direito de anonimização e exclusão (art. 18, IV). _Rascunho aplicado: enumeração do art. 18 completa (I–IX); `rights.items.portability` passou a citar o art. 18, V com a ressalva da regulamentação da ANPD._
- [ ] **(o)** Se os avisos dos formulários precisam citar o retorno ao Google Ads (variante pronta no i18n). _Rascunho aplicado: variantes `*_with_ads` criadas nos 3 idiomas (`quote.contact_form`, `contact.form`, `shared.lgpd`) e ligadas quando a tag do Google Ads está ativa (`GOOGLE_ADS.id`); a importação offline do `gclid` fica só sob consentimento e `legal_basis.items.service_order` marca a atribuição por legítimo interesse como só para uso interno._
- [ ] **(p)** Identificação do fornecedor (Decreto 7.962/2013, art. 2º, I e II): se a oferta for relação de consumo, publicar endereço físico (do cartão CNPJ ou comercial) e eletrônico em local de destaque, inclusive no rodapé do `/orcamento`; hoje o site mostra só cidade, razão social, CNPJ e e-mail.
- [ ] **Lacunas de governança com copy já rascunhada (DECISOES-JURIDICAS.md §5):** base legal do New Relic (G2, `legal_basis.items.new_relic`: legítimo interesse em segurança e desempenho do site); declaração de que o site é B2B e não se dirige a menores (G8, `data_collected.minors`); dados sensíveis não coletados de propósito (G9, `data_collected.closing`, já existente); capítulo de cookies distinguindo os necessários ao funcionamento dos de medição e de anúncio, estes só após o aceite (G13, nova seção `cookies`). Confirmar na revisão jurídica; documentos internos (LIA, ROPA, RIPD) seguem pendentes com o dono.
- [ ] Retomada de contato e sequência de mensagens 1:1 (playbook 04 §5) dentro da finalidade "retomar o contato"; e-mail automático e newsletter só com Política atualizada e, no caso da newsletter, consentimento.

## 5. Retenção: prazo, onde vale e como cumprir

| Dado | Campo da Política | Onde fica | Como o prazo é cumprido |
|---|---|---|---|
| Pedidos e mensagens que não viram contrato | `retencaoPedidos` = [PREENCHER] | Netlify Forms, e-mail, WhatsApp, CRM, CSVs baixados | rotina mensal manual (§6) |
| Pedidos ligados a contrato | pelo tempo que a lei exigir | CRM, contrato | junto com os documentos do contrato |
| Navegação no GA4 | `ga4` = [PREENCHER] | GA4 | configuração de retenção do GA4 (automático) |
| Cookies do Google Ads | `googleAds` = [PREENCHER] | navegador do visitante | duração configurada na tag |
| Conversões enviadas ao Ads | `conversoesGoogleAds` = [PREENCHER] | Google Ads | política do Google (advogado, item i) |
| Navegação e erros no New Relic | `newRelic` = [PREENCHER] | New Relic | retenção da conta (confira na administração da conta) |
| Logs de acesso | `logsHospedagem` = [PREENCHER] | Netlify | plano da Netlify (confira) + Marco Civil (item l) |

## 6. Rotina mensal de exclusão (primeiro dia útil do mês)

1. **CRM:** filtre `excluir_em` ≤ hoje e sem contrato. Apague a linha ou anonimize (mantenha só data, origem, score e resultado, sem nome, e-mail, telefone, empresa e textos livres) para não perder os números do funil.
2. **Netlify Forms:** em `briefing` e `contato`, apague os envios mais antigos que o prazo (inclusive os da lista de spam).
3. **E-mail:** busque `label:Leads older_than:<N>m` (ajuste ao prazo), apague e esvazie a lixeira dessas mensagens. Faça o mesmo com as respostas trocadas com esses leads.
4. **WhatsApp:** apague as conversas vencidas que não viraram contrato. Backups (Google Drive/iCloud) seguem a decisão do item h.
5. **Arquivos locais:** CSVs exportados, anotações e gravações de diagnóstico vencidos.
6. **Registre** a execução (data, quem, quantos registros) em [15-registro-de-decisoes.md](15-registro-de-decisoes.md) §2.

## 7. Pedidos de titular (LGPD art. 18)

**Canal:** o e-mail de `dados/dono.json › empresa.email` (é o que a Política informa).

1. Registre o pedido: data, quem pediu, o que pediu. O prazo para a resposta completa é de até **15 dias** (art. 19, II); a confirmação de existência em formato simplificado pode ser imediata.
2. **Confirme a identidade** com o mínimo: responda pelo mesmo e-mail ou telefone usado no pedido original. Não peça documentos além do necessário.
3. **Localize os dados:** Netlify Forms, e-mail, WhatsApp, CRM, agenda (se houver). GA4 e New Relic não guardam nome nem e-mail; o Google Ads recebe o `gclid` e a evolução do pedido.
4. **Atenda:**

| Pedido | O que fazer |
|---|---|
| Acesso / confirmação | enviar o que existe sobre a pessoa e onde está |
| Correção | corrigir em todos os lugares do item 3 |
| Exclusão | apagar em todos os lugares, salvo dado ligado a contrato ou obrigação legal (explicar qual) |
| Oposição ao uso para anúncios | `nao_contatar = sim` e fora da importação offline do Google Ads (playbook 07 §4.4) |
| Revisão da classificação automática (art. 20) | explicar os critérios (playbook 03 §3) e revisar manualmente |
| Revogar consentimento da newsletter | remover na ferramenta + `newsletter_optin = nao` e `newsletter_descadastro_em` no CRM, em todas as linhas com o e-mail, no mesmo dia (04 §5.2 e §6) |
| Revogar consentimento de depoimento ou imagem | retirar o material do site e dos perfis no prazo do termo (playbook 09 §6) e marcar `depoimento_status = recusado` no CRM (05 §5) |

5. Responda por escrito e guarde a resposta.

**Modelo de resposta (exclusão):**

> Oi, {nome}. Recebemos o seu pedido de exclusão em {data}. Apagamos os seus dados do recebimento de formulários, do nosso e-mail, do nosso WhatsApp e da nossa planilha de atendimento. {Se houver exceção: "Mantivemos apenas {dado}, porque {motivo legal}."} As informações de navegação no Google Analytics não identificam você pelo nome. Qualquer dúvida, é só responder este e-mail.

## 8. Incidentes de segurança

1. **Conter:** trocar senhas, revogar acessos, tirar do ar o que vazou.
2. **Avaliar:** que dados, de quantas pessoas, que risco.
3. **Registrar** todo incidente (mesmo os que não precisam ser comunicados): data, o que houve, dados, pessoas, medidas.
4. **Comunicar** à ANPD e aos titulares quando houver risco ou dano relevante, no prazo da regulamentação (Res. CD/ANPD 15/2024 fala em 3 dias úteis; confirme com o advogado).

## 9. Acessos e contas

| Conta | Dono | Quem mais acessa | 2FA |
|---|---|---|---|
| Netlify | [PREENCHER] | [PREENCHER] | [ ] |
| DNS / registrador de lemamon.dev | [PREENCHER] | | [ ] |
| Google (Gmail/Workspace, GA4, Ads, Search Console, Perfil da Empresa) | [PREENCHER] | | [ ] |
| New Relic | [PREENCHER] | | [ ] |
| WhatsApp Business | [PREENCHER] | | [ ] (verificação em duas etapas) |
| GitHub | [PREENCHER] | | [ ] |
| CRM / planilha | [PREENCHER] | | [ ] |

Revise a cada trimestre. Quando alguém sai, revogue todos os acessos no mesmo dia.

## 10. Registro simplificado das operações de tratamento

Agente de pequeno porte pode manter um registro simplificado (Res. CD/ANPD 2/2022; confirmar o enquadramento):

| Operação | Finalidade | Dados | Titulares | Base legal | Operadores | Retenção |
|---|---|---|---|---|---|---|
| Pedido de diagnóstico (wizard) | responder ao pedido, conduzir o diagnóstico, organizar a ordem de atendimento | nome, e-mail, telefone, empresa, respostas, atribuição, `gclid` | contatos de empresas | [advogado] | Netlify, Google | `retencaoPedidos` |
| Formulário de contato | responder | nome, e-mail, telefone, assunto, mensagem | idem | [advogado] | Netlify, Google | `retencaoPedidos` |
| WhatsApp | responder | o que a pessoa envia | idem | [advogado] | Meta | `retencaoPedidos` |
| Medição do site | entender o uso, corrigir erros, medir anúncios | dados de navegação | visitantes | [advogado] | Google, New Relic, Netlify | prazos da §5 |
| Cases e depoimentos | divulgar trabalho | nome, cargo, foto, voz, citação | clientes | consentimento (termo) | Netlify | enquanto autorizado |

## 11. Aviso de cookies e New Relic (B344, B274)

**Aviso de cookies (decisão de `baseAnuncios`):**

| Opção | O site | Consequências |
|---|---|---|
| Legítimo interesse (`"legitimo_interesse"`) | sem aviso de cookies; Política com o direito de oposição | sem remarketing, sem Signals, sem personalização; exige teste de balanceamento documentado |
| Consentimento (`"consentimento"`) | aviso de cookies com Aceitar/Recusar de mesmo peso e Consent Mode v2, **já pronto no código** (B344): aparece sozinho com `baseAnuncios = "consentimento"`; reabre por "Preferências de cookies" no rodapé e pelo link da Política | permite remarketing (`privacidade.remarketing`) com as variantes da Política e do aviso; medição de quem recusa fica limitada (o New Relic também só carrega depois do Aceitar: D05) |

Registre a decisão em [15](15-registro-de-decisoes.md) D05. O banner e o Consent Mode já estão no código (B344, agente `shell`): a escolha aqui é só a decisão e o dado em `dados/dono.json › privacidade.baseAnuncios`.

**New Relic (B274):** a gravação de sessão **já está desligada no código**: `public/scripts/newrelic.js` tem `NREUM.init.session_replay.enabled = false` com `sampling_rate` e `error_sampling_rate` em 0, conferido pelo teste `src/components/shell/shell-assets.test.ts`. Ficam o desempenho (RUM), os erros de JS e o PageAction `lead_failed` (alerta do [06](06-ga4-e-medicao.md) §7). A Política já diz que o New Relic não grava reproduções das visitas (`privacy.sections.navigation_data.items.new_relic`). Falta o dono assinar a [15](15-registro-de-decisoes.md) D18. **Religar a gravação** exige, antes: trocar esse item da Política nos 3 idiomas (pedido ao `shell`), manter o `data-nr-block` com verificação automática (bloqueador 7, que segue valendo só como garantia para esse caso) e atualizar a D18.

## 12. Quando a Lemamon.dev é operadora (projetos de clientes)

- Contrato com cláusula de tratamento de dados (playbook 02 §10): seguir instruções do cliente, segurança, suboperadores, aviso de incidente ao cliente em [PREENCHER] horas, devolução e exclusão ao final.
- Acesso mínimo a dados de produção; dados de teste anonimizados.
- Telas de cases sem dados pessoais (playbook 09 §9).
- Ao fim do contrato: devolver ou apagar os dados e registrar.
