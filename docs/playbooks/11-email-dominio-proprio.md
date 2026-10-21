# 11 — E-mail no domínio lemamon.dev

**Backlog:** B006 (trocar o @gmail.com por um endereço do domínio lemamon.dev).
**Fontes:** BLUEPRINT §1.5 e §14 item 15; i18n `_notes.email`, `_notes.pending_owner` (4) e `_notes.legal_review` (f); `src/config/empresa.ts`.

**Por que antes de aumentar a verba de Ads:** `@gmail.com` é o primeiro sinal de "é freelancer?" para a compradora e para o avaliador técnico (i18n `_notes.pending_owner` 4). Com o e-mail centralizado em `dados/dono.json › empresa.email`, a troca no site é uma linha.

---

## 1. Decisões

| Decisão | Opções | Observação |
|---|---|---|
| Provedor | **Microsoft 365 contratado pela GoDaddy** (plano Email Essentials, 2 contas) | decidido em 20/10/2026 (D41). A Política tem uma linha por fornecedor, escolhida por `privacidade.provedorEmail`: `"gmail"`, `"google_workspace"` (só com o aditivo assinado) ou `"microsoft_365"` (o atual, `processors.items.email_with_microsoft_365`) |
| Endereço público | **`comercial@lemamon.dev`** | é o que vai para o site, o footer, a Política e o Perfil da Empresa |
| Endereços pessoais | [PREENCHER] (1 conta livre no plano) | quem assina propostas e devolutivas |
| Onde está o DNS de lemamon.dev | **Netlify DNS** (servidores `dns1`–`dns4.p05.nsone.net`; o domínio é registrado fora da Netlify) | por isso a GoDaddy não cria os registros sozinha: eles são adicionados à mão na Netlify (Team › DNS › lemamon.dev › Add new record) |

Registre em [15-registro-de-decisoes.md](15-registro-de-decisoes.md).

## 2. Registros de DNS

**No ar desde 20/10/2026 (Microsoft 365 pela GoDaddy, na Netlify DNS):**

| Registro | Nome | Valor | Para quê |
|---|---|---|---|
| TXT | `@` | `MS=ms35669882` | prova à Microsoft que o domínio é seu (pode ficar) |
| MX | `@` | `0 lemamon-dev.mail.protection.outlook.com` | receber |
| TXT (SPF) | `@` | `v=spf1 include:secureserver.net -all` | enviar; o `secureserver.net` da GoDaddy inclui `spf.protection.outlook.com` (conferido em 20/10/2026) |
| CNAME | `autodiscover` | `autodiscover.outlook.com` | configuração automática do Outlook e do celular |
| CNAME | `email` | `email.secureserver.net` | webmail em `email.lemamon.dev` |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:comercial@lemamon.dev` | relatórios de autenticação; endurecer como abaixo |

O painel da GoDaddy (E-mail e Office › Visão geral) confirma os registros em até 1 hora. **DKIM:** a GoDaddy não pediu registro de DKIM; confira em "Mostrar original" (§3) se a mensagem sai com `DKIM: PASS` para `lemamon.dev`. Se não sair, o DMARC passa só pelo SPF, e o endurecimento abaixo espera o DKIM. Se outra ferramenta passar a enviar e-mail como @lemamon.dev, o `include:` dela entra no **mesmo** registro SPF; o `-all` recusa qualquer remetente fora da lista.

Referência para outro provedor (exemplos do Google Workspace; cada provedor mostra os valores exatos no painel dele):

| Registro | Nome | Valor | Observação |
|---|---|---|---|
| MX | `@` | os servidores indicados pelo provedor | remova MX antigos, se houver |
| TXT (SPF) | `@` | `v=spf1 include:_spf.google.com ~all` | **um único** registro SPF; se outra ferramenta enviar e-mail como @lemamon.dev (ex.: ferramenta de e-mail), acrescente o `include:` dela no mesmo registro |
| TXT (DKIM) | `google._domainkey` | a chave gerada no painel (Workspace: Admin › Apps › Gmail › Autenticar e-mail) | depois de publicar, clique em "Iniciar autenticação" |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:comercial@lemamon.dev` | começar em `p=none` |

**Endurecer o DMARC:** depois de 2 a 4 semanas de relatórios sem falha de SPF/DKIM, troque para `p=quarantine`; depois de mais algumas semanas limpas, `p=reject`.

## 3. Testes

1. De uma conta externa (Gmail e Outlook), envie para o endereço novo e responda **a partir** dele.
2. No Gmail externo, abra a mensagem › "Mostrar original": SPF, DKIM e DMARC precisam aparecer como `PASS`.
3. Confira que a resposta não caiu em spam no Gmail nem no Outlook.

Critério de aceite: um e-mail de teste chega e é respondido do mesmo domínio, com SPF, DKIM e DMARC aprovados.

## 4. Trocar no site

1. **Feito em 20/10/2026:** `dados/dono.json › empresa.email` = `"comercial@lemamon.dev"` (nunca edite o código em `src/config/`). O `{email}` é interpolado em todas as chaves, nos 3 idiomas, inclusive `aria-label` (i18n `_notes.email`). Vai ao ar no próximo deploy; antes dele, faça o teste da §3.
2. A resposta do FAQ de NDA (`faq.conditional.nda.answer_draft`) já usa `{email}` nos 3 idiomas.
3. **Feito em 20/10/2026:** `privacidade.provedorEmail = "microsoft_365"`, e a Política diz "Microsoft 365 (contratado por meio da GoDaddy): o e-mail da Lemamon." Falta: o advogado confere o item (f) do [10](10-lgpd-operacional.md), e `privacidade.atualizadaEm` recebe a data em que a Política for publicada.
4. Conferir:
   ```bash
   grep -rn "gmail.com" src | grep -v "_notes"
   ```
   Tem que voltar vazio (as notas internas `_notes` podem citar o endereço antigo).
5. `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn build` e confira footer, `/contato`, `/privacidade` e a tela de erro do wizard nos 3 idiomas.

## 5. Transição do endereço antigo

- Mantenha `lemamon.dev@gmail.com` monitorado por [PREENCHER] meses (links antigos, Medium, contas de ferramentas).
- Configure o encaminhamento do Gmail antigo para o endereço novo (Gmail › Configurações › Encaminhamento).
- Troque o e-mail de contato e de recuperação nas contas: Netlify, Google Ads, GA4, Search Console, Perfil da Empresa, WhatsApp Business, New Relic, GitHub, LinkedIn, Medium, registrador do domínio.
- Atualize a notificação dos formulários do Netlify para o endereço novo (playbook 05 §3) e refaça o filtro de marcador `Leads`.
- Rotina de exclusão LGPD (playbook 10 §6) passa a cobrir as duas caixas enquanto a antiga existir.
