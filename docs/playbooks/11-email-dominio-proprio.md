# 11 — E-mail no domínio lemamon.dev

**Backlog:** B006 (trocar o @gmail.com por um endereço do domínio lemamon.dev).
**Fontes:** BLUEPRINT §1.5 e §14 item 15; i18n `_notes.email`, `_notes.pending_owner` (4) e `_notes.legal_review` (f); `src/config/empresa.ts`.

**Por que antes de aumentar a verba de Ads:** `@gmail.com` é o primeiro sinal de "é freelancer?" para a compradora e para o avaliador técnico (i18n `_notes.pending_owner` 4). Com o e-mail centralizado em `dados/dono.json › empresa.email`, a troca no site é uma linha.

---

## 1. Decisões

| Decisão | Opções | Observação |
|---|---|---|
| Provedor | Google Workspace · Microsoft 365 · Zoho Mail · outro | Com **Google Workspace e o aditivo de tratamento de dados assinado**, a Política já tem a variante pronta (`processors.items.email_with_workspace`). Outro provedor exige item novo na Política (pedido ao `shell`) |
| Endereço público | [PREENCHER] (ex. de forma: `contato@lemamon.dev`) | é o que vai para o site, o footer, a Política e o Perfil da Empresa |
| Endereços pessoais | [PREENCHER] | quem assina propostas e devolutivas |
| Onde está o DNS de lemamon.dev | [PREENCHER] (Netlify DNS ou registrador) | os registros da §2 vão lá |

Registre em [15-registro-de-decisoes.md](15-registro-de-decisoes.md).

## 2. Registros de DNS

Cada provedor mostra os valores exatos no painel de configuração do domínio. Use os dele; os exemplos abaixo são do Google Workspace.

| Registro | Nome | Valor | Observação |
|---|---|---|---|
| MX | `@` | os servidores indicados pelo provedor | remova MX antigos, se houver |
| TXT (SPF) | `@` | `v=spf1 include:_spf.google.com ~all` | **um único** registro SPF; se outra ferramenta enviar e-mail como @lemamon.dev (ex.: ferramenta de e-mail), acrescente o `include:` dela no mesmo registro |
| TXT (DKIM) | `google._domainkey` | a chave gerada no painel (Workspace: Admin › Apps › Gmail › Autenticar e-mail) | depois de publicar, clique em "Iniciar autenticação" |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:[PREENCHER endereço para relatórios]` | começar em `p=none` |

**Endurecer o DMARC:** depois de 2 a 4 semanas de relatórios sem falha de SPF/DKIM, troque para `p=quarantine`; depois de mais algumas semanas limpas, `p=reject`.

## 3. Testes

1. De uma conta externa (Gmail e Outlook), envie para o endereço novo e responda **a partir** dele.
2. No Gmail externo, abra a mensagem › "Mostrar original": SPF, DKIM e DMARC precisam aparecer como `PASS`.
3. Confira que a resposta não caiu em spam no Gmail nem no Outlook.

Critério de aceite: um e-mail de teste chega e é respondido do mesmo domínio, com SPF, DKIM e DMARC aprovados.

## 4. Trocar no site

1. `dados/dono.json › empresa.email` = `"[PREENCHER endereço novo]"` (nunca edite o código em `src/config/`). O `{email}` é interpolado em todas as chaves, nos 3 idiomas, inclusive `aria-label` (i18n `_notes.email`).
2. **Pendência conhecida:** a resposta do FAQ de NDA (`faq.conditional.nda.answer_draft`, nos 3 idiomas) tem o endereço do Gmail escrito à mão, fora do `{email}`. Pedido registrado ao agente `shell` para trocar por `{email}`. Até lá, ligar `confirmacoes.nda` publicaria o Gmail.
3. Política: se o provedor for Google Workspace com aditivo assinado, ligue `privacidade.emailWorkspace = true` (a Política passa a usar `email_with_workspace`) e atualize `privacidade.atualizadaEm`. Outro provedor exige item novo na Política (pedido ao `shell`).
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
