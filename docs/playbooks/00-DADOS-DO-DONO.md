# 00 — Dados do dono: o que preencher, em que formato e o que cada dado libera

**Para quem:** o dono da Lemamon.dev (ou quem edita os arquivos por ele).
**Onde fica TUDO que vem de você:** um arquivo só, [`dados/dono.json`](../../dados/dono.json). Fotos e logos ficam em `dados/imagens/`. Cases e posts são texto longo e continuam em MDX (`src/content/cases/` e `src/content/posts/`).
**Fontes:** BLUEPRINT §4 (gatilhos `when_data`) e §14 (pendências por alavancagem), conferido contra o código em 19/10/2026: `dados/dono.schema.json`, `src/config/validate.ts`, `src/config/json-do-dono.ts`, `src/content/schemas.ts`, `src/config/features.ts`, `src/integrations/dados-ficticios.ts`; e, em 20/10/2026, `src/config/camada-ficticia.ts` (par razão social + CNPJ). Se o código mudar depois disso, **a validação no código manda** e este guia precisa ser atualizado.

---

## Como o arquivo funciona (leia antes de tudo)

1. **Um arquivo, várias seções.** `dados/dono.json` tem 13 seções, nesta ordem: `empresa`, `privacidade`, `time`, `perfis`, `confirmacoes`, `qualificacao`, `precos`, `agenda`, `descoberta`, `sustentacao`, `engenharia`, `depoimentos`, `logos`. Nenhuma seção pode ser apagada: deixe vazia (`null`, `""`, `[]` ou `false`), nunca remova.
2. **O editor ajuda.** A primeira linha (`"$schema": "./dono.schema.json"`) liga o autocompletar no VS Code: ao passar o mouse sobre um campo, aparece o que ele é e o que libera; campo com nome errado ou tipo errado fica sublinhado. Não apague essa linha.
3. **JSON não aceita comentário nem vírgula sobrando.** Texto entre aspas duplas (`"assim"`), `true`/`false` e `null` sem aspas, vírgula entre itens e nenhuma depois do último. Errou a sintaxe? O build para logo no começo e mostra, em português, a linha e a coluna, com uma seta embaixo:

   ```
   [dados] dados/dono.json não é um JSON válido (linha 123, coluna 14): vírgula sobrando depois do último item. JSON não aceita vírgula final nem comentário.
       123 |   "logos": [],
           |              ^
   ```
   Outros motivos que ele reconhece: comentário (`//`), aspas simples, aspas “curvas” de editor de texto, vírgula faltando entre dois campos, `True` com maiúscula, texto quebrado em duas linhas e arquivo cortado.
4. **Vazio = a seção não existe.** Sem dado, a seção não gera HTML, título, âncora, item de menu, link no footer, entrada no sitemap nem par de hreflang. Não existe "em breve".
5. **Parcial = vazio.** Todo texto que aparece no site é `{ "pt": "…", "en": "…", "es": "…" }`. Faltou um idioma, o item não aparece. Pessoa, depoimento e logo com campo obrigatório faltando **quebram o build** de propósito.
6. **Malformado = build falha, em português, com o campo.** CNPJ com dígito errado, URL sem `https://`, 3 ou 5 faixas, texto acima do limite, campo com nome errado, foto que não existe: o `yarn build` para e diz exatamente o que corrigir, sempre no formato `arquivo › caminho.do.campo: problema`. Exemplos reais:

   ```
   [dados] 3 problema(s) para corrigir:
    - dados/dono.json › empresa.cnpj: CNPJ inválido (dígitos verificadores): confira no cartão CNPJ
    - dados/dono.json › time[0].foto: arquivo não encontrado: dados/imagens/ana.jpg
    - dados/dono.json › perfis.github.publicar: tipo errado: esperava true ou false, veio texto "sim"
   ```
7. **Dinheiro só em duas seções.** Valor monetário só é aceito em `precos` e `qualificacao`. Em qualquer outro texto (do dono.json, do site ou de um case) o build recusa, e o teste `tests/unit/no-money.test.ts` confere.
8. **Texto provisório derruba o build.** Neste guia, `[PREENCHER]` é instrução para você. Se um texto tiver `[PREENCHER]`, `[CONFIRMAR]`, `[EXEMPLO]`, chaves `{…}`, `TODO`, `XXX` ou "lorem ipsum", o build falha com "texto com marca de rascunho".
9. **Dado fictício nunca vai no `dono.json` (nem num case ou post).** Use o `dono.ficticio.json` como modelo de ESTRUTURA, nunca de conteúdo. O build recusa, com o campo:
   - nome, empresa, e-mail ou URL com "Exemplo", `example.com`, o CNPJ `00.000.000/0000-00` ou imagem de `dados/ficticio/` ("parece dado fictício");
   - **qualquer texto** marcado como exemplo: "(exemplo)", "(example)", "(ejemplo)", começando por "Exemplo:", "Texto de exemplo", "Condições de exemplo", "Depoimento de exemplo", "Conteúdo de exemplo" (e os equivalentes em inglês e espanhol), ou com "fictício" ("texto de EXEMPLO da camada fictícia"). "Por exemplo" no meio da frase é normal e passa;
   - **qualquer valor copiado** do `dono.ficticio.json` ou dos MDX de `dados/ficticio/`, mesmo sem a marca ("valor copiado de dados/dono.ficticio.json › descoberta.formato.pt"); vale também para frases copiadas para um case ou post em `src/content/` e para imagens copiadas de `dados/ficticio/imagens/`.

   Dado de exemplo mora na **camada fictícia** (Parte C).
10. **Os três idiomas.** Espanhol neutro latino-americano, com "tú". Termos fixos: diagnóstico gratuito → EN "free assessment" / ES "diagnóstico gratuito"; devolutiva por escrito → EN "written feedback" / ES "conclusiones por escrito"; Sprint de Descoberta → "Discovery Sprint" / "Sprint de Descubrimiento".

### O que já está decidido e preenchido no `dono.json`

| Decisão | Campo | Valor |
|---|---|---|
| 5 — mudança de escopo (FAQ `scope_change`) | `confirmacoes.escopoMudanca` | `true`. Texto publicado: "As entregas a cada 2 semanas existem para você perceber cedo o que precisa mudar. Se a mudança mexer no escopo, escopo, prazo e preço são combinados de novo antes de seguir." |
| 6 — perfis públicos | `perfis.github`, `perfis.linkedin`, `perfis.medium` | `github.com/lemamon-dev`, `linkedin.com/in/lemamon-dev`, `medium.com/@lemamon.dev`, os três com `"publicar": true` (Medium e GitHub vazios em 20/10/2026: ver §B3 e D35) |
| 7 — faixas da P5 (qualificação, **não** é preço publicado) | `qualificacao` | moeda `BRL` nos 3 idiomas; 4 faixas: até R$ 30 mil · R$ 30–80 mil · R$ 80–200 mil · acima de R$ 200 mil ("ainda não sei" é a opção fixa do wizard); `corteMql: "tier_2"` (lead qualificado a partir de R$ 30 mil) |
| 3 — preço | `precos` | tudo `null`: nenhum valor publicado; as seções de investimento só aparecem quando você preencher |
| Razão social e CNPJ (20/10/2026, D39) | `empresa.razaoSocial`, `empresa.cnpj` | `Lemamon.dev LTDA` e `69.700.690/0001-98` (dígitos verificadores válidos), os dois informados pelo dono. `hasCompanyData` ligado e `empresa` fora da trava de lançamento; falta só a sua conferência contra o cartão CNPJ (§A2) |
| Praça (20/10/2026, D38) | não é campo do `dono.json` | São Paulo, SP (antes Florianópolis, SC). Está no i18n e em `ADDRESS` de `src/config/site.ts` (JSON-LD); o que muda fora do código está no [08](08-search-console-e-seo-local.md) §3 |
| Atende fora do Brasil (21/10/2026, D31) | `confirmacoes.outrasCidades`, `confirmacoes.atendeExterior` | `true` e `true` ("atendemos o mundo todo"). O FAQ "Vocês atendem empresas de outras cidades ou de fora do Brasil?" e a linha "Atendemos o mundo todo" no eyebrow da Home vão ao ar nos 3 idiomas. O site afirma só atendimento a distância, em português, inglês ou espanhol, com o mesmo processo; moeda, contrato e forma de pagamento "combinados por escrito antes de começar". `atendeExterior` exige `outrasCidades` (o build confere) |
| Sprint de Descoberta gratuita, só quando necessária, sem protótipo (21/10/2026, D44; revoga a D42) | `descoberta.duracao`, `confirmacoes.duracaoDescoberta`, `precos` | `descoberta.duracao` = `null` (aqui e no `dono.ficticio.json`; o build recusa outro valor) e `duracaoDescoberta` = `true`: o FAQ "Quanto dura?" responde sem número ("a necessidade e a duração são definidas com você no diagnóstico"). A Descoberta é gratuita: `precos` não tem mais a linha `descoberta`, e `confirmacoes.descobertaAbatida` e `.descobertaUnicoCusto` saíram do arquivo e do schema. `formato`, `participantes`, `ritmo` e `naoInclui` continuam `null`; `planoDoCliente` continua `false` |

Todo o resto (os outros campos de `empresa`, Política, pessoas, depoimentos, logos, agenda, formatos) está vazio, esperando você.

### Como validar qualquer mudança localmente

Na raiz do projeto (`lemamon.dev/`):

| Passo | Comando | O que confere |
|---|---|---|
| 1 | `PUBLIC_DADOS_FICTICIOS=false COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn dev` e abra http://localhost:4321 | o site só com o seu dado real, nos 3 idiomas (`/`, `/en/`, `/es/`) |
| 2 | `PUBLIC_DADOS_FICTICIOS=false COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn build` | sintaxe e validação do `dono.json` (mensagens em pt-BR), cópia da camada fictícia, schemas, rotas, H1, placeholders `{…}` esquecidos e a varredura de dado fictício no `dist/` |
| 3 | `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn test` | testes de gate, `no-money`, validação e o caçador de vazamento fictício |
| 4 | `grep -n "PREENCHER\|CONFIRMAR" dados/dono.json` | nada provisório vai ao ar |
| 5 | *Deploy preview* do Netlify no pull request | o mesmo, no ambiente real, antes de produção |

Sem o `PUBLIC_DADOS_FICTICIOS=false` na frente, o seu `.env.local` liga a camada fictícia e você vê dados de exemplo misturados (Parte C); nesse caso o `yarn build` escreve em `dist-ficticio/`, não em `dist/`.

**Produção sai só do build do Netlify.** Nunca publique uma pasta gerada no seu computador (`netlify deploy --prod` sem `--build`, arrastar a pasta no painel, outro pipeline): é proibido. O `dist/` local pode estar velho, e um build com a camada fictícia (que vai para `dist-ficticio/`) leva pessoas, logos e cases de exemplo e `noindex,nofollow` em toda página, o que tira o site do Google. Build que falha apaga o `dist/` sozinho; se sobrar um `dist/` (ou um `dist/.build-incompleto`) depois de um erro, apague a pasta. Regras completas na Parte C, "Regras de deploy".

---

## Parte A — Bloqueadores de lançamento

Sem estes itens o site **não vai para produção**: o build de produção (`CONTEXT=production` no Netlify) **falha** e lista o que falta (i18n `_notes.launch_blockers`; parte jurídica no playbook [10-lgpd-operacional.md](10-lgpd-operacional.md)). A trava lê **só o `dono.json` real** — a camada fictícia nunca entra em produção e valor com cara de fictício não conta.

### A1. Variáveis de ambiente no Netlify

Onde: Netlify › o site › **Site configuration › Environment variables**. Variáveis `PUBLIC_*` entram no HTML no build: **depois de mudar, faça um deploy novo**.

| Variável | Formato | Escopo | Libera |
|---|---|---|---|
| `PUBLIC_WHATSAPP_NUMBER` | só dígitos: `55` + DDD + número (12 ou 13 dígitos) | todos os contextos | todo botão de WhatsApp |
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | **só Production** | eventos do funil (playbook [06](06-ga4-e-medicao.md)) |
| `PUBLIC_DADOS_FICTICIOS` | **não crie em produção** | no máximo deploy preview | camada fictícia (Parte C). Em produção é ignorada e o build avisa |

### A2. Controlador dos dados — `empresa`

```json
"empresa": {
  "email": "comercial@lemamon.dev",
  "razaoSocial": "Lemamon.dev LTDA",
  "cnpj": "69.700.690/0001-98",
  "anoFundacao": null,
  "responsavel": "",
  "apresentacao": null,
  "historia": null
}
```

| Campo | Formato | Libera |
|---|---|---|
| `email` | e-mail válido | o `{email}` dos 3 idiomas (trocar aqui troca no site inteiro) |
| `razaoSocial` + `cnpj` | até 160 caracteres + CNPJ com dígitos verificadores válidos | `hasCompanyData`: "razão social · CNPJ" no footer e em linha própria no rodapé mínimo do `/orcamento`, controlador na Política, bloco "Dados da empresa" em `/sobre`, `legalName`/`taxID` no JSON-LD, variante com CNPJ do FAQ de nota fiscal |
| `responsavel` | nome completo, até 120 | só se NÃO houver PJ: controlador da Política |
| `anoFundacao` | número inteiro (ex.: `2021`) ou `null` | `foundingDate` no JSON-LD |
| `apresentacao` | `{ pt, en, es }`, até 160 cada | `hasAboutIntro`: subtítulo de `/sobre` (1 frase com "a gente", "São Paulo, SP", sem número nem superlativo) |
| `historia` | `{ "pt": ["parágrafo", …], "en": […], "es": […] }`, 1 a 4 parágrafos de até 600 | `hasAboutStory`: "Por que a gente trabalha assim" em `/sobre` |

- **Mínimo para lançar:** razão social + CNPJ válido. A Lemamon.dev tem CNPJ (D39), então deixe `responsavel` vazio; ele existe só para controlador sem PJ.
- **Estado em 20/10/2026:** razão social `Lemamon.dev LTDA` e CNPJ `69.700.690/0001-98` informados pelo dono e preenchidos (D39). Com os dois, `hasCompanyData` está ligado: "Lemamon.dev LTDA · CNPJ 69.700.690/0001-98" no footer (e em linha própria no rodapé mínimo do `/orcamento`), Lemamon.dev LTDA como controlador na Política, bloco "Dados da empresa" em `/sobre` e `legalName`/`taxID` no JSON-LD. A trava de lançamento não lista mais `empresa`; os campos de `privacidade` (§A3) continuam travando produção. Confira o footer, o rodapé do `/orcamento` e o controlador em `/privacidade` nos 3 idiomas com `PUBLIC_DADOS_FICTICIOS=false yarn dev`.
- **Conferência do dono contra o cartão CNPJ (antes do deploy de produção):** (1) a grafia da razão social, letra por letra (inclusive "LTDA"): a Receita costuma registrar o nome em maiúsculas (por exemplo, "LEMAMON.DEV LTDA"), e o site mostra exatamente o que está em `razaoSocial`; (2) o município da sede no cartão é São Paulo/SP, porque o site afirma "São Paulo, SP" ao lado do CNPJ (D38). Anote a conferência na D39 do [15](15-registro-de-decisoes.md).
- **Nunca** use o CNPJ de exemplo `00.000.000/0000-00`: o build recusa no `dono.json`.

### A3. Decisões da Política — `privacidade`

Os valores são decisão sua com o advogado. Cada campo escolhe uma variante de texto que já está escrita no i18n.

```json
"privacidade": {
  "baseAnuncios": "legitimo_interesse",
  "encarregado": "pequeno_porte",
  "mecanismoTransferencia": null,
  "prazos": {
    "retencaoPedidos": { "pt": "[PREENCHER] ex.: N meses depois do último contato", "en": "…", "es": "…" },
    "ga4": { "pt": "…", "en": "…", "es": "…" },
    "googleAds": { "pt": "…", "en": "…", "es": "…" },
    "conversoesGoogleAds": { "pt": "…", "en": "…", "es": "…" },
    "newRelic": { "pt": "…", "en": "…", "es": "…" },
    "logsHospedagem": { "pt": "…", "en": "…", "es": "…" }
  },
  "atualizadaEm": "AAAA-MM-DD",
  "remarketing": false,
  "provedorEmail": "microsoft_365",
  "classificacaoDefineAtendimento": false,
  "naoVendemosConfirmado": false,
  "ferramentas": { "agenda": null, "crm": null, "emailAcompanhamento": null, "automacao": null, "chatEquipe": null },
  "pixels": { "linkedin": null, "meta": null }
}
```

| Campo | Valores | Efeito |
|---|---|---|
| `baseAnuncios` | `"legitimo_interesse"` ou `"consentimento"` | base legal da medição (decisão D05, com o advogado; [10](10-lgpd-operacional.md) §11). Com `"consentimento"`, o site mostra o aviso de cookies com Aceitar/Recusar e Consent Mode v2 (já pronto, B344), e o Google Ads, o GA4 e o New Relic só gravam cookies depois do Aceitar. É a única opção que permite remarketing (`remarketing = true`, D07) |
| `encarregado` | `"pequeno_porte"` ou `{ "nome": "…", "email": "…" }` | com objeto, publica o encarregado (DPO) |
| `mecanismoTransferencia` | `null` (frase padrão) ou `{ pt, en, es }` até 200 | mecanismo do art. 33 indicado pelo advogado |
| `prazos.*` | `{ pt, en, es }` até 80 cada | os 6 prazos de retenção; **todos obrigatórios** para lançar. GA4 tem que bater com GA4 › Admin › Retenção de dados |
| `atualizadaEm` | `"AAAA-MM-DD"` | data da Política; mude sempre que ela mudar |
| `remarketing` | `true` só com `baseAnuncios = "consentimento"` | troca as frases de anúncios pelas de remarketing |
| `provedorEmail` | `"gmail"`, `"google_workspace"` (só com o aditivo assinado) ou `"microsoft_365"` (contratado pela GoDaddy; o atual, D41) | o fornecedor de e-mail em "Com quem compartilhamos" (playbook 11) |
| `classificacaoDefineAtendimento` | `true` se o score define a forma de atendimento (advogado, item e) | variantes `*_with_routing` |
| `naoVendemosConfirmado` | `true` só com a sua confirmação E a do advogado | publica "Não vendemos dados pessoais." |
| `ferramentas.<nome>` | `null` ou `{ "fornecedor": "Nome do serviço", "prazo": { pt, en, es } }` | declara a ferramenta em "Com quem compartilhamos" e "Por quanto tempo guardamos". **Agenda ligada sem `ferramentas.agenda` trava o build de produção** |
| `pixels.linkedin` / `pixels.meta` | `null` (desligado, o padrão) ou `{ "id": "[PREENCHER] só dígitos, o ID real da conta", "prazo": { "pt": "…", "en": "…", "es": "…" } }` (prazo até 80 caracteres por idioma) | liga a LinkedIn Insight Tag (B346; o ID é o *partner ID* do Campaign Manager) ou o Meta Pixel (B347; o *pixel ID* do Events Manager). Decisão **D12** do [15](15-registro-de-decisoes.md). **Exige `baseAnuncios = "consentimento"` (D05)**: sem ela, com ID inválido ou com prazo faltando em algum idioma, o build de produção falha (`privacyLaunchBlockers`). Carrega **só em produção e só depois do "Aceitar"** do aviso de cookies; o Meta Pixel nunca carrega no `/orcamento*` e no `/contato` (e equivalentes en/es). A Política passa a listar o operador e o prazo sozinha, e o aviso de cookies ganha a frase do pixel. Passo a passo para ligar, conferir e desligar: [12](12-canais-indicacao-linkedin-conteudo.md) §9.1 (LinkedIn) e §9.2 (Meta); revisão trimestral no [13](13-kpis-e-rituais.md) §6 |

- **Como conferir:** `/privacidade` em `yarn dev` sem frase pela metade; o build de produção para de falhar quando a lista de bloqueadores zera.

### A4. Notificação dos formulários no painel do Netlify

Passo a passo no playbook [05-crm-e-funil.md](05-crm-e-funil.md) §2 e §3.

---

## Parte B — Por ordem de alavancagem (BLUEPRINT §14)

### B1. Mudança de escopo — `confirmacoes.escopoMudanca` (decidido)

Já está `true` (decisão 5). Libera o FAQ "E se eu precisar mudar o escopo no meio do projeto?" (Home, Como trabalhamos, serviços, FAQ rápido do `/orcamento`) e a pergunta `scope_change` da régua "Como comparar propostas" em `/quanto-custa`. Pré-requisito que continua valendo: a cláusula de mudança de escopo no contrato (playbook [02](02-proposta-e-politica-comercial.md) §10).

### B2. Uma pessoa real no time — `time` (pendência nº 2)

Uma entrada por pessoa, com a foto em `dados/imagens/`:

```json
"time": [
  {
    "id": "nome-sobrenome",
    "nome": "[PREENCHER] Nome Sobrenome",
    "foto": "imagens/nome-sobrenome.jpg",
    "papel": { "pt": "[PREENCHER]", "en": "[PREENCHER]", "es": "[PREENCHER]" },
    "linha": { "pt": "[PREENCHER] 1 linha escrita pela pessoa", "en": "…", "es": "…" },
    "linkedin": "https://www.linkedin.com/in/[PREENCHER]",
    "github": "https://github.com/[PREENCHER]",
    "atuaEmProjetos": true,
    "ordem": 0
  }
]
```

| Campo | Regra |
|---|---|
| `id` | minúsculas, números e hífen; único |
| `nome` | nome e sobrenome, sem abreviar; nunca cargo ou "cliente" no lugar do nome |
| `foto` | caminho **relativo à pasta `dados/`** (`imagens/…`), arquivo existente, png/jpg/webp/avif/svg; foto real, nunca banco de imagem |
| `papel` / `linha` | até 60 / 160 por idioma |
| `linkedin` / `github` | opcionais; https no domínio certo |
| `atuaEmProjetos` | `true` só se a pessoa trabalha em projetos de cliente |

- **Libera (`hasTeam` = ≥ 1 pessoa completa com `atuaEmProjetos: true`):** a seção Time da Home, `/sobre` (`/en/about`, `/es/nosotros`), o item "Sobre" no menu e no footer, sitemap e hreflang.
- Recomendação do i18n: a mesma pessoa que aparece na Política como responsável entra aqui, com foto.

### B3. Perfis públicos — `perfis` (decidido; revisão aberta na D35)

Os três estão com `"publicar": true` (decisão 6). URL tem que ser https no domínio do perfil (`github.com`, `linkedin.com`, `medium.com`).

| Onde o perfil aparece | Depende de `publicar`? |
|---|---|
| "Confira antes de conversar" na Home (pt, en, es), bloco de perfis em `/sobre` e nas páginas de serviço, a linha "a Lemamon.dev no GitHub" em `/como-trabalhamos` enquanto `engenharia` estiver vazia (`hasProfiles` e `features.profiles.<id>`) | **sim**: com `publicar: false`, o perfil sai daqui |
| Footer de todas as páginas, cards de perfil em `/contato` e `sameAs` do JSON-LD da Home | **não**: o BLUEPRINT (§8.5 e a página de contato) trata os três como canais confirmados e lista sempre. Para tirar daqui, a D01 do [15](15-registro-de-decisoes.md) precisa ser "só com `publicar`" (BLUEPRINT pelo integrador; `Footer.astro` e `sameAs()` de `seo.ts` pelo `shell`; `ContactChannels.astro` pelo `conversion`) |

> **Alerta (conferido em 20/10/2026):** o Medium `@lemamon.dev` não tem nenhuma story (o feed volta com 0 itens) e a organização `lemamon-dev` no GitHub não tem nenhum repositório público. Com a decisão 6 como está, o site manda quem avalia a Lemamon.dev para dois perfis vazios, inclusive o avaliador técnico de `/como-trabalhamos`. O BLUEPRINT conta perfis como confiança só "quando tiverem conteúdo recente" (§2, item 5) e a seção existe para provar o contrário de um perfil vazio (§6.1, item 12). A revisão da decisão 6 está aberta na **D35** do [15](15-registro-de-decisoes.md).

**Regra única (vale para este playbook, para o [12](12-canais-indicacao-linkedin-conteudo.md) §6 e §7 e para o [14](14-calendario-90-dias.md)):** nenhum perfil aparece no site sem pelo menos 1 conteúdo público publicado. Antes de **todo** deploy de produção, rode a conferência abaixo. Se um perfil der 0, você escolhe uma das duas opções e registra na D35:

- **(a) Publicar conteúdo antes.** Medium: importar o primeiro post do blog com "Import a story" (12 §7; o post nasce em lemamon.dev, então isso só é possível depois que o blog voltar). GitHub: pelo menos 1 repositório público com README; o mais simples é o repositório `lemamon-dev/.github` com o arquivo `profile/README.md` (o GitHub mostra esse README na página da organização), descrevendo o método em 4 passos (BLUEPRINT §1.2) e com o link para https://lemamon.dev, só com fatos confirmados. LinkedIn: o primeiro post dos pilares do 12 §6.
- **(b) Tirar o perfil até haver conteúdo:** `"publicar": false` em `dados/dono.json › perfis.<id>`. Como mostra a tabela acima, isso só tira o perfil das seções da Home, de `/sobre`, das páginas de serviço e de `/como-trabalhamos`; o footer, os cards do `/contato` e o `sameAs` continuam com ele até a D01.

**README de perfil do GitHub, pronto para colar** (opção (a) do GitHub; só fatos do BLUEPRINT §1.2 e §1.5). Em https://github.com/organizations/lemamon-dev/repositories/new: nome `.github`, **Public**, marque "Add a README file" › Create. Depois, **Add file › Create new file** com o caminho `profile/README.md` e este texto:

```markdown
# Lemamon.dev

Software sob medida com escopo, prazo e preço combinados antes de começar. São Paulo, SP, Brasil.

## Como a gente trabalha

1. **Diagnóstico gratuito** de 45 minutos, com devolutiva por escrito.
2. **Sprint de Descoberta**, gratuita, quando o diagnóstico mostra que ela é necessária: entendimento do problema, escopo priorizado e um plano com prazo e preço fechados para o desenvolvimento.
3. **Desenvolvimento** com entregas a cada 2 semanas: software funcionando, que você usa, não apresentação de slide.
4. **Sustentação e evolução** contínua.

## O que a gente constrói

Sistemas web · Aplicativos · Integrações e automação · MVP e produtos digitais · Sustentação e evolução.

[Pedir diagnóstico gratuito](https://lemamon.dev/orcamento?utm_source=github&utm_medium=perfil&utm_campaign=org-readme) · [lemamon.dev](https://lemamon.dev/?utm_source=github&utm_medium=perfil&utm_campaign=org-readme)
```

> Se este README já estiver publicado em `lemamon-dev/.github`, atualize lá também (decisão D44, 21/10/2026: a Descoberta deixou de ser paga e de entregar protótipo).

Isso tira o GitHub do zero (`public_repos` passa a 1) e dá ao avaliador técnico de `/como-trabalhamos` o método por escrito. Um repositório público com código real (uma biblioteca ou ferramenta que a Lemamon.dev usa de verdade, sem código de cliente) prova mais; só publique se existir.

**Conferência obrigatória antes de cada deploy de produção** (qualquer terminal; leitura pública, sem login):

```sh
# Medium: número de stories no feed. Tem que ser >= 1.
curl -s https://medium.com/feed/@lemamon.dev | grep -o '<item>' | wc -l

# GitHub: repositórios públicos da organização. Tem que ser >= 1.
curl -s https://api.github.com/users/lemamon-dev | grep '"public_repos"'
```

LinkedIn: o LinkedIn bloqueia leitura sem login (responde 999). Abra https://www.linkedin.com/in/lemamon-dev numa janela anônima ou logado com outra conta e confira que há pelo menos 1 post publicado.

Critério de aceite (B299): no dia do deploy de produção, todo perfil que aparece no site (footer, "Confira antes de conversar", `/contato`, `/como-trabalhamos`) tem pelo menos 1 item publicado, ou foi tirado do ar pela opção (b) com a D01. Registre o resultado de cada conferência em [15](15-registro-de-decisoes.md) §2. Republicação no Medium sempre com canonical para lemamon.dev ("Import a story", 12 §7).

### B4. Faixas de qualificação do wizard — `qualificacao` (decidido)

Preenchido com a decisão 7 (ver tabela no início). Regras para quando mudar:

- Exatamente 4 faixas (`tier_1` … `tier_4`, em ordem crescente) ou nenhuma; rótulo até 60 caracteres por idioma, já com a moeda. `corteMql` tem que ser uma das faixas.
- `faixasMensais` + `corteMqlMensal` (opcional): 4 faixas para quem só quer manter/evoluir um sistema; só ligam com as 4 principais.
- `scoreD.ativo: true` exige `confirmacoes.scoreDRecebeDiagnostico: true`, senão o build falha.
- **Privacidade do valor:** as faixas só existem dentro da ilha do wizard (bundle do cliente), nunca no HTML indexável. Conferir: `curl -s localhost:4321/orcamento | grep -c "30 mil"` tem que dar `0`.

### B5. Confirmações que liberam FAQs e variantes — `confirmacoes`

Ligue cada item **só depois de conferir que a frase publicada é verdade** no contrato e na prática.

| Campo | Pergunta para você | Onde aparece |
|---|---|---|
| `formatoDiagnostico` *(prioridade)* | Os 45 minutos são por vídeo, telefone ou presencial? Com quem o cliente fala (o papel)? | FAQ rápido do `/orcamento`, passos do CTA final, FAQ `diagnosis_format` |
| `codigoProprietario` | O código é do cliente desde o início (`"answer_draft"`) ou passa conforme os pagamentos (`"answer_draft_alt"`)? `false` = não publicar | FAQ `code_ownership` |
| `notaFiscal` | Emite NF de serviço para todas as etapas pagas? | FAQ `invoice` |
| `outrasCidades` | Atende outras cidades do Brasil, a distância? **Decidido: sim (D31, 21/10/2026)** | FAQ `other_cities` (afeta en/es e Google Ads) |
| `atendeExterior` | Atende empresas de outros países, a distância? **Decidido: sim (D31, 21/10/2026).** Exige `outrasCidades = true` | variante "…ou de fora do Brasil?" do FAQ `other_cities` (uma pergunta só) e a linha "Atendemos o mundo todo" no eyebrow da Home. Antes do 1º cliente de fora: moeda, nota fiscal de exportação e foro (o site não afirma nenhum dos três) |
| `nda` | O NDA mútuo revisado por advogado **e** o documento de respostas de segurança ([02](02-proposta-e-politica-comercial.md) §11) existem e podem ser enviados em até 1 dia útil? Só então ligue. O site passa a dizer que a Lemamon.dev assina o acordo e responde ao questionário de segurança | FAQ `nda` ("…assina o acordo antes de você compartilhar os detalhes e também responde ao questionário de segurança da sua empresa"); card de e-mail em `/contato` ("Para enviar NDA, questionário de segurança…") |
| `sistemaTerceiros` | Assume sistema feito por outra empresa, depois de avaliação? | FAQ `third_party_system` |
| `semDescoberta` | Aprova o texto do FAQ "Posso começar direto pelo desenvolvimento?" (a necessidade da Descoberta é definida com o cliente no diagnóstico)? | FAQ `skip_discovery`. Os textos que diziam que o preço só sai da Descoberta já foram revistos na D44 (21/10/2026); a flag liga só este FAQ |
| `duracaoDescoberta` | Publicar o FAQ "Quanto dura?" sem número? **Decidido: sim (D44, 21/10/2026, revoga a D42)** | FAQ `discovery_duration` com a resposta "Depende do tamanho do problema. A necessidade e a duração da Descoberta são definidas com você no diagnóstico gratuito." Nenhuma duração vai ao site |
| `planoDoCliente` | Os 3 entregáveis da Descoberta ficam com o cliente mesmo sem seguir? **Por ora não (D44 mantém `false`)** | FAQ `discovery_plan_ownership` |
| `migracaoDados` | Faz migração de planilha/sistema antigo no escopo? | FAQ `data_migration` |
| `ligacao` | Liga para quem escolher "Ligação"? | opção "Ligação" no wizard |
| `valoresNoDiagnostico` | Responde sobre valores no diagnóstico? | FAQ rápido do `/orcamento` e resumo do wizard |
| `timeDoCliente` | Trabalha junto com o time interno do cliente? | variantes que citam a equipe do cliente |
| `scoreDRecebeDiagnostico` | Todo pedido fora de perfil também recebe os 45 min e a devolutiva? | condição para `qualificacao.scoreD.ativo` |
| `devolutivaConteudo` | O que vem, de fato, na devolutiva? (`{ pt, en, es }` até 240, um grupo nominal que completa "…com {conteudo}") | termo "devolutiva por escrito" |
| `pagamento` | Condições de pagamento, sem valores (`{ pt, en, es }` até 240, frase completa) | FAQ `payment_terms` |

```json
"formatoDiagnostico": {
  "formato": { "pt": "[PREENCHER] ex. de forma: por chamada de vídeo", "en": "…", "es": "…" },
  "participantes": { "pt": "[PREENCHER] ex.: quem vai conduzir o seu projeto", "en": "…", "es": "…" }
}
```

Registre cada confirmação, com data, em [15-registro-de-decisoes.md](15-registro-de-decisoes.md).

### B6. Agenda online — `agenda`

```json
"agenda": { "url": "https://[PREENCHER] link da página de agendamento" }
```

**Libera (`hasAgenda`):** "Quer adiantar? Escolha um horário agora" como CTA primário no pós-envio, o rótulo "Agendar diagnóstico gratuito" (EN "Schedule your free assessment", ES "Agenda tu diagnóstico gratuito") no lugar de "Pedir diagnóstico gratuito" em todo CTA primário do site (header, menu, barra fixa, rodapé, botões e links de diagnóstico, bloco de investimento, link "Reconheceu o seu caso?" da Home e links para o pedido em `/contato`; "Continuar meu pedido" continua valendo para quem tem rascunho) e `contact_with_agenda` no CTA final. **Pré-requisito:** declarar `privacidade.ferramentas.agenda` (fornecedor e prazo) no mesmo deploy, senão o build de produção falha.

### B7. Faixas de preço — `precos` (decisão 3: vazio até você preencher)

**Pré-requisito:** custo-hora interno e piso de margem (playbook [02](02-proposta-e-politica-comercial.md) §3).

```json
"precos": {
  "desenvolvimento": {
    "sistemas": {
      "faixa": { "pt": "[PREENCHER] faixa com a moeda", "en": "…", "es": "…" },
      "unidade": "projeto",
      "fatores": { "pt": ["[PREENCHER]", "[PREENCHER]"], "en": ["…", "…"], "es": ["…", "…"] }
    },
    "aplicativos": null,
    "integracoes": null,
    "mvp": null
  },
  "sustentacao": null
}
```

- Cada linha: `faixa` até 80 caracteres por idioma; `fatores` de 1 a 3 itens de até 120; `unidade` `"projeto"` (desenvolvimento) ou `"mes"` (sustentação, obrigatório). **A Sprint de Descoberta é gratuita e não tem linha** (D44, 21/10/2026): uma linha `descoberta` derruba o build com "campo desconhecido".
- **Libera (`hasPricing` = ≥ 1 linha completa):** blocos de investimento na Home, Como trabalhamos, serviços e no topo de Quanto custa (cada página só com as linhas dela, mais as linhas fixas "Diagnóstico: gratuito" e "Sprint de Descoberta: gratuita, se for necessária"); variantes de FAQ "Quanto custa?"; faixas lado a lado no resumo do wizard. **Só as linhas completas renderizam.**

### B8. Formato da Descoberta, da sustentação e engenharia

Todos os campos: `{ pt, en, es }`, até 300 caracteres por idioma, ou `null`. Exceção: `descoberta.naoInclui` é uma **lista** por idioma (abaixo).

| Seção | Campos | Libera |
|---|---|---|
| `descoberta` | `formato`, `participantes`, `ritmo` — **os 3** (`duracao` fica sempre `null`: a duração é definida com o cliente no diagnóstico e não vai ao site, D44); e `naoInclui`: lista `{ pt: [...], en: [...], es: [...] }` de **1 a 5 itens**, até **120 caracteres** cada, sem valor em dinheiro, ou `null` | os 3 campos: "Como a Descoberta acontece" em `/sprint-de-descoberta` (`hasDiscoveryFormat`), sem duração. `naoInclui` com ≥ 1 item nos 3 idiomas: "O que a Descoberta não inclui" (`#o-que-nao-inclui`, flag `hasDiscoveryExclusions`), logo depois de "O que você recebe" e com o mesmo destaque. Faltou um idioma, o bloco some inteiro |
| `sustentacao` | `inclui`, `contratacao`, `canais` obrigatórios; `urgencias` opcional | "Formato e contratação" em `/servicos/sustentacao`. Sem SLA, horas ou monitoramento que você não cumpre hoje |
| `engenharia` | `tests`, `ci_cd`, `code_review`, `repository`, `documentation`, `handover`, `people`, `security` | cada campo completo vira uma linha de "Como a gente constrói" em `/como-trabalhamos` (`hasEngineering` = ≥ 1) |

**Regra da Descoberta (B354):** preencha `descoberta.naoInclui` **no mesmo deploy** em que preencher os 3 campos de formato (a Descoberta não tem linha em `precos`, D44). Formato publicado sem a lista do que não inclui descumpre o B354; não conte com o build para lembrar. A mesma lista vai na seção "4. O que NÃO está incluído" do plano da Descoberta ([02](02-proposta-e-politica-comercial.md) §7), para site e proposta não se contradizerem. Exemplo:

```json
"naoInclui": {
  "pt": ["[PREENCHER] 1 exclusão por item, em até 120 caracteres", "[PREENCHER] …"],
  "en": ["…", "…"],
  "es": ["…", "…"]
}
```

Escreva com as suas palavras (o que costuma ficar de fora: construir o sistema, que é o desenvolvimento; custos de infraestrutura e de ferramentas de terceiros; mexer em sistemas que o cliente já usa). Use o mesmo número de itens nos 3 idiomas, na mesma ordem (o site não confere isso). Valor em dinheiro, `[PREENCHER]` ou `{placeholder}` no texto quebram o build.

### B9. Depoimentos e logos — `depoimentos`, `logos` (maior lead time)

Produção e autorização: playbook [09-prova-cases-depoimentos.md](09-prova-cases-depoimentos.md).

**Autorização** (obrigatória em depoimento e logo; nunca é publicada):

```json
"autorizacao": {
  "porEscrito": true,
  "autorizadoPor": "[PREENCHER] cargo e empresa de quem autorizou",
  "data": "2026-01-31",
  "registro": "[PREENCHER] onde está a prova"
}
```

**Depoimento:**

```json
"depoimentos": [
  {
    "id": "nome-do-depoimento",
    "citacao": { "pt": "[PREENCHER] 2–3 linhas, palavras da pessoa", "en": "…", "es": "…" },
    "nome": "[PREENCHER] Nome Sobrenome",
    "cargo": { "pt": "[PREENCHER]", "en": "…", "es": "…" },
    "empresa": "[PREENCHER]",
    "foto": { "src": "imagens/nome-sobrenome.jpg", "alt": { "pt": "…", "en": "…", "es": "…" } },
    "video": {
      "src": "videos/nome-sobrenome.mp4",
      "poster": "imagens/nome-sobrenome-poster.jpg",
      "legendas": {
        "pt": "videos/nome-sobrenome.pt.vtt",
        "en": "videos/nome-sobrenome.en.vtt",
        "es": "videos/nome-sobrenome.es.vtt"
      },
      "duracaoSegundos": 60
    },
    "caseSlug": "slug-do-case",
    "sobreProcesso": true,
    "ordem": 0,
    "autorizacao": { "porEscrito": true, "autorizadoPor": "…", "data": "2026-01-31", "registro": "…", "foto": true, "video": true }
  }
]
```

`foto` só com `autorizacao.foto: true`. Libera `hasTestimonials` (≥ 1 nominal): depoimento na Home, prova em `/como-trabalhamos` e no case, e prova no pedido de cotação (`/orcamento`): abaixo dos 3 marcadores da entrada do wizard e abaixo do botão de envio no passo de contato. Sem depoimento, essas duas posições do wizard mostram a faixa de logos, se houver 4 ou mais (`hasLogos`). Um case liga um depoimento pelo `id` (`depoimento: nome-do-depoimento` no frontmatter).

**Depoimento em vídeo (opcional, B287).** Produção e roteiro: [09](09-prova-cases-depoimentos.md) §12. Para publicar, preencha `video` no depoimento, como no exemplo acima:

- `autorizacao.video: true` é obrigatório: a pessoa autorizou **por escrito** o uso da imagem e da voz (opção "vídeo e voz" do termo, 09 §6). Sem o campo, ou com `false`, o depoimento com `video` **quebra o build** de propósito. Sem o bloco `video`, o depoimento continua só com texto (e foto, se houver).
- `src`: o vídeo em **mp4** ou **webm**. `poster`: a imagem mostrada antes do play (jpg, png ou webp; um quadro do vídeo com o rosto da pessoa).
- `legendas`: arquivos **WebVTT** (`.vtt`). A legenda em português (`pt`) é **obrigatória**; `en` e `es` são opcionais (sem elas, o vídeo aparece nos 3 idiomas com a legenda em português no menu do player).
- `duracaoSegundos`: inteiro de 1 a **90**. Acima de 90 s, o build recusa. O recomendado é ~60 s editados.
- **Todos os arquivos ficam dentro de `dados/`** (ex.: `dados/videos/`, `dados/imagens/`), com o caminho escrito **relativo a `dados/`**, sem `/` no início, sem `..` e sem URL. Arquivo que não existe derruba o build.
- Onde aparece: logo abaixo do depoimento na Home (o primeiro depoimento, com `sobreProcesso: true` na frente) e na página do case ligado por `caseSlug`. O site carrega sob demanda: a página baixa só o pôster; o vídeo e as legendas só vêm quando a pessoa aperta o play. Sem YouTube, Vimeo ou outro player de terceiros (que seria operador novo na Política), sem cookie.
- Para conferir antes de publicar: a camada fictícia (abaixo) tem um depoimento com vídeo de exemplo ("Carla Exemplo Ribeiro"), que mostra como o vídeo fica na Home.

**Logo:**

```json
"logos": [
  {
    "id": "nome-da-empresa",
    "empresa": "[PREENCHER] nome da empresa",
    "arquivo": "imagens/logo-empresa.svg",
    "caseSlug": "slug-do-case",
    "ordem": 0,
    "autorizacao": { "porEscrito": true, "autorizadoPor": "…", "data": "2026-01-31", "registro": "…" }
  }
]
```

Libera `hasLogos` **só com logos de 4 empresas diferentes**, todos autorizados. Com 3, nada aparece.

### B10. Cases e posts (MDX, fora do JSON)

Texto longo continua em MDX, com metadados no frontmatter (validados pelos schemas de `src/content/schemas.ts`):

- **Case:** `src/content/cases/<pt|en|es>/<slug>.mdx`, mesmo slug nos 3 idiomas, `publicado: true` nos 3 para contar. O frontmatter liga o case ao `dono.json` por `depoimento: <id do depoimento>`, e logos/depoimentos ligam ao case por `caseSlug`. Libera `hasCases` (≥ 2), `/cases`, cases na Home e nos serviços, filtros com ≥ 6.
- **Post:** `src/content/posts/<slug>.mdx` (só pt-BR), autor real com foto, `capa` obrigatória (foto real ou cartão 1200×630 próprio do post, com `alt`; vira a og:image), `<CtaMeio />` obrigatório no meio do texto. Libera `hasPosts` (≥ 3), `/blog` e o item "Blog". Rascunhos dos 3 primeiros posts: [12a-rascunhos-blog.md](12a-rascunhos-blog.md).

Exemplos completos e válidos de frontmatter estão nos MDX da camada fictícia: `dados/ficticio/cases/*/` e `dados/ficticio/posts/` (copie a estrutura, nunca o conteúdo). Um case ou post em `src/content/` com texto de exemplo ("(exemplo)", "Exemplo:", "Conteúdo de exemplo", "fictício"), no frontmatter ou no corpo, ou com uma frase copiada de um MDX fictício, **derruba o build**, mesmo com título, slug e autor trocados.

### B11. Itens de §14 que não são dados

| §14 | Item | Onde está o passo a passo |
|---|---|---|
| 12 | Google Ads | [07-google-ads.md](07-google-ads.md) |
| 13 | LGPD: retenção, revisão jurídica, aviso de cookies | [10-lgpd-operacional.md](10-lgpd-operacional.md) e A3 |
| 14 | Notificação do Netlify Forms | [05-crm-e-funil.md](05-crm-e-funil.md) §3 |
| 15 | E-mail no domínio lemamon.dev (`empresa.email`) | [11-email-dominio-proprio.md](11-email-dominio-proprio.md) |

---

## Parte C — Camada fictícia (para revisar o site cheio) e a trava

Enquanto pessoas, dados da empresa, depoimentos e logos não chegam, dá para ver o site como ele vai ficar com **dados fictícios**, sem tocar no `dono.json`.

### O que é

| Arquivo | O que tem |
|---|---|
| `dados/dono.ficticio.json` | mesma estrutura do `dono.json`, tudo preenchido com dados de EXEMPLO: "Empresa Exemplo Ltda", CNPJ `00.000.000/0000-00` (inválido de propósito), pessoas "Ana Exemplo Souza" e "Bruno Exemplo Lima", depoimento de "Carla Exemplo Ribeiro", 5 logos de empresas "Exemplo", agenda `https://example.com/agenda`, preços e textos marcados "(exemplo)" |
| `dados/ficticio/imagens/` | avatares SVG com iniciais e a faixa "EXEMPLO", logos SVG gerados e telas de case. Nunca foto de pessoa real. Gerados por `node scripts/gerar-imagens-ficticias.mjs` |
| `dados/ficticio/cases/` | 2 cases fictícios nos 3 idiomas (`exemplo-sistema-de-fretes`, `exemplo-app-de-vistorias`) |
| `dados/ficticio/posts/` | 3 posts fictícios em pt-BR (`exemplo-*`) |

### Como liga

- **Regra única:** liga com `PUBLIC_DADOS_FICTICIOS=true` **E** fora de produção. O `.env.local` já vem com `PUBLIC_DADOS_FICTICIOS=true`, então `yarn dev`, `yarn build` e `yarn preview` locais mostram a camada.
- **Para ver só o dado real:** `PUBLIC_DADOS_FICTICIOS=false yarn dev` (ou `yarn build`).
- **Onde sai o build:** com a camada ligada no seu computador, o `yarn build` escreve em **`dist-ficticio/`** (ignorada pelo git), nunca em `dist/`, que é a pasta que o Netlify publica; o log avisa "build fictício em dist-ficticio/". O `yarn preview` serve a mesma pasta. Vale também para `--outDir` que aponta para `dist/` por link simbólico (até link quebrado) ou para uma pasta dentro de `dist/`. Só um *deploy preview* ou *branch deploy* do Netlify com a variável ligada **no painel do Netlify** escreve a camada em `dist/`, e esses nunca são produção; com a variável só no seu `.env.local` (um `CONTEXT=deploy-preview` imitado no seu computador), o build continua indo para `dist-ficticio/`.
- **Merge por cima que só preenche lacuna:** o que você já preencheu de verdade no `dono.json` sempre aparece; a camada só preenche o que está vazio (`null`, `""`, `[]`, `false`). Listas (time, depoimentos, logos, faixas) são inteiras: com 1 pessoa real no `dono.json`, nenhuma pessoa fictícia aparece. Os MDX fictícios entram nas coleções junto com os reais.
- **Razão social + CNPJ são um par, como as listas** (`mesclarSecaoFicticia` em `src/config/camada-ficticia.ts`): o par real só vale com os dois preenchidos; com um só, a camada mostra o par fictício inteiro ("Empresa Exemplo Ltda" + `00.000.000/0000-00`), nunca a razão social de exemplo ao lado do CNPJ real. Exemplo: com só o CNPJ preenchido, o preview com a camada ligada mostraria o par de exemplo no footer e na Política. Hoje o par real está completo (D39), então o preview mostra "Lemamon.dev LTDA" e o CNPJ real, e a camada também não preenche `anoFundacao` ao lado dele: o ano de fundação de exemplo só aparece junto do par de exemplo.
- **Ligada, toda página** mostra a faixa **"Dados fictícios — não publicar"** no topo (nos 3 idiomas, `role="note"`) e leva `<meta name="robots" content="noindex,nofollow">`. O log do build avisa em amarelo.

### A trava (por que dado fictício nunca chega a produção)

1. **Em produção a camada é ignorada.** Com `CONTEXT=production` (Netlify), mesmo com a variável ligada, a integração `src/integrations/dados-ficticios.ts` nem lê o arquivo fictício (o módulo virtual sai vazio) e registra o aviso `PUBLIC_DADOS_FICTICIOS=true IGNORADO`. No runtime, `src/config/dono.ts` confere a mesma regra de novo com `isProductionDeploy()`: as duas travas precisam concordar para a camada ligar. Com o dado real preenchido, o site de produção com a variável ligada sai **byte a byte igual** ao site sem ela (teste automático).
2. **Build local fictício nunca fica em `dist/`.** Fora de *deploy preview*/*branch deploy* do Netlify, a camada ligada manda o build para `dist-ficticio/`, comparando o caminho REAL (link simbólico para `dist/` não engana). Se `dist-ficticio/` for um link para `dist/`, o build cai. E **deploy manual de pasta local é proibido**: produção sai só do build do Netlify.
3. **Cópia da camada no projeto derruba o build, em qualquer modo.** Antes de tudo, o build confere TODO arquivo de `src/`, `public/` e `dados/` (menos a própria camada e os poucos arquivos que descrevem a camada) e para com "valor copiado de dados/dono.ficticio.json …" quando acha:
   - no `dono.json`, valor igual a um do `dono.ficticio.json` ("R$ 60 mil a R$ 150 mil (exemplo)", "Condições de exemplo: …"), com o caminho do campo;
   - em qualquer arquivo de texto (código sem os comentários), nome, razão social, CNPJ, e-mail, URL ou slug da camada, uma frase de case ou post fictício, o nome de uma imagem fictícia ou uma imagem fictícia em base64;
   - um JSON com a estrutura ou os textos do `dono.ficticio.json` (por exemplo, o arquivo fictício copiado para `src/`, mesmo com os nomes trocados);
   - uma imagem fictícia — idêntica, **com bytes a mais ou a menos** (o build procura pedaços do arquivo original em qualquer arquivo) ou **recodificada, convertida (JPG, WebP), redimensionada, sem cor ou sem a faixa EXEMPLO** (o build compara o desenho das imagens). Foto fictícia "salva de novo" no Preview não passa.
   Ids e enums que coincidem por definição (`tier_1`, `BRL`, `projeto`) não contam.
4. **O `dono.json`, os cases e os posts recusam texto de exemplo.** Nome com "Exemplo", `example.com`, o CNPJ de exemplo, imagem de `dados/ficticio/`, "(exemplo)", "Exemplo: …", "Conteúdo de exemplo", "fictício" etc. no arquivo real derrubam o build (item 9 do começo deste guia).
5. **O código não importa nem cita a camada.** Só dois arquivos leem a camada, e por leitura de disco: `src/content/loaders.ts` e a integração. Com a camada desligada, o build cai em qualquer `import` de `dados/dono.ficticio.json` ou de `dados/ficticio/` (inclusive `?raw`, `?inline`, `?url`, `import.meta.glob`), em qualquer código que **cite** esses caminhos fora de comentário (`url()` de CSS, `new URL(…, import.meta.url)`, `src="file://…"`) e em qualquer arquivo publicado que tenha vindo de lá. Um teste procura esses caminhos em todo `src/`.
6. **O build confere o próprio resultado.** Sem a camada, qualquer marcador fictício em qualquer arquivo publicado derruba o build: nomes, CNPJ, e-mails, URLs, textos, todo valor do frontmatter e as frases do corpo dos MDX fictícios, slugs, a classe e o atributo da faixa, `noindex,nofollow`, e as imagens (pelo nome, pelo texto do SVG, pelo conteúdo — também com bytes a mais ou a menos e em base64 — e pelo desenho, o que pega a versão WebP que o próprio Astro gera). Com a camada, página sem a faixa ou sem o `noindex,nofollow` derruba o build.
7. **Build reprovado não deixa pasta para trás.** Durante o build, a pasta de saída leva o arquivo `.build-incompleto`, que só some quando a conferência final passa. Se o build falhar — na trava ou em qualquer outro ponto —, a pasta de saída (`dist/`) é **apagada**, para não sobrar um site pela metade ou reprovado pronto para um deploy manual. Se você ainda assim encontrar um `dist/` depois de um build com erro, ou um `dist/.build-incompleto`, **apague a pasta `dist/` e rode o build de novo**.
8. **Dado fictício nunca libera a Política.** A trava de lançamento (`privacyLaunchBlockers`) lê só o `dono.json` real e recusa valor com cara de fictício. O build de produção continua falhando até `empresa` e `privacidade` estarem preenchidos com dado REAL.
9. **Testes.** `yarn test` faz 12 builds reais: com e sem a camada; produção com a variável ligada numa cópia com empresa e privacidade vazias (tem de falhar na trava) e noutra com dado de teste válido (tem de passar, sem nada fictício e idêntica à produção sem a variável); um build local com a camada sem pasta de saída (tem de ir para `dist-ficticio/`); e 6 **ataques** que têm de cair sem deixar `dist/` (url() de CSS, new URL(), leitura do arquivo fictício por fs, falha no meio do build, imagens e JSON fictícios copiados para o projeto) ou de ir para `dist-ficticio/` (saída por link simbólico para `dist/`). O caçador de vazamento (`tests/unit/dados-vazamento.test.ts`) varre o build sem a camada atrás de cada marcador e de cada imagem fictícia, inclusive alterada.

### Regras de deploy (o que nenhuma trava de build cobre)

- **Produção sai só do build do Netlify** (push na branch de produção). Nunca rode `netlify deploy --prod` **sem `--build`**, nunca arraste uma pasta no painel e nunca publique `dist/` gerado no seu computador: a pasta pode ser velha, de outro contexto ou de um build com a camada.
- **Rascunho com `netlify deploy --build` também não vira produção depois:** nada de "testar com `netlify deploy --build` e depois `netlify deploy --prod`" reaproveitando a pasta. Para produção, faça o push e deixe o Netlify buildar.
- **Restrinja quem pode publicar no Netlify:** permissão de deploy só para quem mantém o site (papéis do time em *Team settings › Members*); revogue tokens pessoais que ninguém usa (*User settings › Applications › Personal access tokens*) e não crie token de CI que publique pasta pronta.
- **Depois de um build com falha**, apague `dist/` (o build já faz isso; confira) antes de qualquer outra coisa.

### Quando o dado real chegar

Preencha a seção no `dono.json`: ela passa a valer na hora, inclusive com a camada ligada (o real sempre vence; em `empresa`, razão social e CNPJ só vencem juntos e, completos, a camada não preenche `anoFundacao` ao lado deles). Não precisa apagar nada da camada fictícia; ela pode ficar no repositório para as próximas revisões.

---

## Resumo: campo do `dono.json` → flag → o que aparece

| Campo | Flag (`features.ts`) | Limiar | Aparece |
|---|---|---|---|
| env `PUBLIC_WHATSAPP_NUMBER` | `hasWhatsapp` | número BR válido | todos os botões de WhatsApp |
| env `PUBLIC_GA4_ID` | `hasGa4` | ID definido | eventos do GA4 (só produção) |
| `empresa.razaoSocial` + `empresa.cnpj` | `hasCompanyData` | razão social + CNPJ válido | CNPJ no footer, controlador na Política, dados em `/sobre` |
| `empresa.apresentacao`, `empresa.historia` | `hasAboutIntro`, `hasAboutStory` | texto nos 3 idiomas | subtítulo e "Por que a gente trabalha assim" em `/sobre` |
| `privacidade` | (trava de produção) | todos os obrigatórios, reais | a Política completa; sem eles o build de produção falha |
| `privacidade.pixels.linkedin`, `privacidade.pixels.meta` | (sem flag: `activePixels()` em `src/config/privacidade.ts` + trava de produção) | ID só dígitos + `prazo` nos 3 idiomas + `baseAnuncios = "consentimento"` (D05, D12) | LinkedIn Insight Tag / Meta Pixel **só em produção e depois do "Aceitar"** (Meta fora do `/orcamento*` e do `/contato`), a frase do pixel no aviso de cookies e o operador com o prazo na Política; ligar e conferir: [12](12-canais-indicacao-linkedin-conteudo.md) §9.1 e §9.2 |
| `time` | `hasTeam` | ≥ 1 completa que atua | Time na Home, `/sobre`, item "Sobre" |
| `perfis` | `hasProfiles`, `profiles.*` | ≥ 1 `publicar` | "Confira antes de conversar", perfis em `/sobre` e nos serviços, a linha do GitHub em `/como-trabalhamos` (footer, cards do `/contato` e `sameAs` mostram os três sempre: §B3) |
| `confirmacoes` | `confirm.<item>` | por item | FAQs condicionais, variantes, opção "Ligação" |
| `qualificacao` | `hasBudgetTiers`, `hasMonthlyTiers` | 4 faixas (+ 4 mensais e `corteMqlMensal`) | P5 com faixas, score com corte de MQL |
| `precos` | `hasPricing`, `pricingLines` | ≥ 1 linha completa | blocos de investimento, FAQ com faixas, preço no resumo |
| `agenda` | `hasAgenda` | URL https | agenda no pós-envio, rótulo "Agendar" |
| `descoberta` | `hasDiscoveryFormat` | 3 campos (formato, participantes, ritmo) | "Como a Descoberta acontece" (sem duração, D44) |
| `descoberta.naoInclui` | `hasDiscoveryExclusions` | ≥ 1 item nos 3 idiomas | "O que a Descoberta não inclui" em `/sprint-de-descoberta` |
| `sustentacao` | `hasSupportFormat` | 3 campos | "Formato e contratação" |
| `engenharia` | `hasEngineering` | ≥ 1 campo | "Como a gente constrói" |
| `depoimentos` | `hasTestimonials` | ≥ 1 nominal | depoimento na Home, em `/como-trabalhamos` e no case; prova na entrada do `/orcamento` e no passo de contato do wizard |
| `depoimentos[].video` | (sem flag: vem com o depoimento) | `autorizacao.video: true`, legenda `pt`, até 90 s | vídeo abaixo do depoimento na Home e no case, carregado só no play |
| `logos` | `hasLogos` | ≥ 4 empresas diferentes | faixa de logos |
| `src/content/cases/` (MDX) | `hasCases`, `casesByService`, `hasCaseFilters` | ≥ 2 nos 3 idiomas (filtros: ≥ 6) | `/cases`, cases na Home e nos serviços |
| case ou `depoimentos[].sobreProcesso` | `hasMethodProof` | ≥ 1 case ou ≥ 1 depoimento sobre o processo | "O método na prática" em `/como-trabalhamos` |
| `src/content/posts/` (MDX) | `hasPosts` | ≥ 3 | `/blog`, item "Blog" |
