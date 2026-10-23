# Guia de revisão — Onda 1

Roteiro para conferir tudo que mudou. Cada item traz **o que fazer**, **o que esperar** e **onde está no código**.

Ordem sugerida: rodar (§1) → clicar (§2) → ler o código (§3) → conferir o build (§4) → configurar o que falta (§5).

---

## 1. Rodar local

O servidor já está no ar em **http://localhost:5173**. Para subir de novo:

```bash
./node_modules/.bin/vite --port 5173
```

> `yarn dev` e `yarn build` não rodam nesta máquina: o ambiente usa **Yarn 4 via Corepack** contra um `yarn.lock` no formato **v1**, e o Yarn recusa o lockfile. Por isso os comandos deste guia chamam os binários direto de `node_modules/.bin`. Consertar o lockfile está na Onda 2.

Já existe um `.env.local` (ignorado pelo git) para a revisão:

```
VITE_WHATSAPP_NUMBER=5548999999999   ← número FALSO, só para o botão aparecer
VITE_GA4_ID=                          ← vazio de propósito
```

Duas coisas úteis durante a revisão:

- Abra o **console do navegador**. Sem `VITE_GA4_ID`, todo evento do funil é impresso com o prefixo `[analytics]` em vez de ir para o GA4. É assim que você vê o funil funcionando sem ter property criada.
- Use `?lng=pt` na URL para forçar português. O detector de idioma respeita o idioma do navegador, então em um navegador em inglês o site abre em inglês — isso é o comportamento correto, não um bug.

---

## 2. Roteiro no navegador

### 2.1 O crash que derrubava a sessão · P0

Era o pior bug de navegação: qualquer item do menu fora da Home lançava `TypeError` e deixava a tela branca, porque não havia `ErrorBoundary` em lugar nenhum.

1. Abra **http://localhost:5173/projects?lng=pt**
2. Clique no ☰ e depois em **"Sobre"**

**Esperado:** navega para `/#about` e rola suavemente até a seção, com o título logo abaixo do header — sem tela branca, sem erro no console.

Repita com **"Missão"** e **"Serviços"**. Antes, os três quebravam.

> O detalhe do header: a seção para **117px** do topo com um header de **101px**. Antes o `scrollIntoView` alinhava no topo absoluto e o header sticky cobria o título.

📁 [`src/common/utils/scrollToSection.ts`](../../src/common/utils/scrollToSection.ts) · [`src/components/ErrorBoundary/index.tsx`](../../src/components/ErrorBoundary/index.tsx)

### 2.2 Botão de subir dentro do wizard

1. Em `/projects`, clique em **"Comece seu projeto!"**
2. Role para baixo e clique no botão de voltar ao topo

**Esperado:** sobe normalmente. Antes ele procurava `#intro`, que é desmontado quando o wizard inicia — clicar ali quebrava a página.

📁 [`src/common/ScrollToTop/index.tsx`](../../src/common/ScrollToTop/index.tsx)

### 2.3 O wizard, agora acessível por teclado

1. Em `/projects`, inicie o wizard
2. Navegue **só com Tab e Enter/Espaço**

**Esperado:** os cards de opção recebem foco, mostram um anel de foco azul e respondem ao teclado. Antes eram `<div onClick>` — invisíveis para teclado e leitor de tela.

Inspecione um card selecionado: deve ser `<button aria-pressed="true">`. A seleção era sinalizada só por cor.

📁 [`src/components/QuestionItem/index.tsx`](../../src/components/QuestionItem/index.tsx) · [`styles.ts`](../../src/components/QuestionItem/styles.ts)

### 2.4 Tela de sucesso do formulário

Chegue ao formulário final (responda todas as perguntas), preencha e envie.

> **Local não é teste real de envio.** O Netlify Forms só existe em produção; no Vite o `POST /` devolve o `index.html` com 200 e o código interpreta como sucesso. O que dá para validar aqui é a **tela**, não o transporte.

**Esperado na tela de sucesso:** os dois botões funcionam. "Criar outro projeto" reseta o wizard do zero; "Voltar ao início" vai para a Home. Antes eles eram renderizados **sem `onClick`** — clicar não fazia nada, no momento de maior engajamento da jornada.

📁 [`src/components/ContactForm/index.tsx`](../../src/components/ContactForm/index.tsx)

### 2.5 Fallback de WhatsApp no erro

Para forçar o caminho de erro sem quebrar nada: no DevTools, aba **Network**, ative **Offline**, e envie o formulário.

**Esperado:** depois de 3 tentativas com backoff, aparece a tela de erro com "Tentar novamente", "Voltar ao início" e o botão verde **"Falar no WhatsApp"** — com o briefing inteiro já escrito na mensagem. Passe o mouse e confira a URL `wa.me`.

Esse era o buraco central: hoje, em produção, **100% dos leads se perdem** porque o backend do Heroku foi deletado (`404 No such app`). Agora, se o envio falhar, o lead ainda tem para onde ir.

📁 [`src/service/index.ts`](../../src/service/index.ts) · [`src/lib/whatsapp.ts`](../../src/lib/whatsapp.ts)

### 2.6 WhatsApp em todas as rotas

**Esperado:** botão verde flutuante no canto inferior direito, em qualquer página. Some se `VITE_WHATSAPP_NUMBER` estiver vazio — apague a variável do `.env.local` e recarregue para confirmar que não sobra link morto.

Confira também a seção **"Entre em Contato"** na Home: agora tem WhatsApp ao lado do e-mail.

📁 [`src/components/WhatsAppButton/`](../../src/components/WhatsAppButton/) · [`src/components/Contact/index.tsx`](../../src/components/Contact/index.tsx)

### 2.7 Eventos do funil

Com o console aberto, percorra o wizard.

**Esperado**, nesta ordem:

```
[analytics] wizard_start     {total_steps: N}
[analytics] wizard_step      {step: 1, question_id: "..."}
[analytics] wizard_step      {step: 2, ...}
[analytics] wizard_reach_form
[analytics] lead_submitted   ou  lead_failed {reason: "network", attempts: 3}
```

Clique no botão de WhatsApp: `whatsapp_click {source: "floating_button"}`.

Hoje existe **um único ponto de medição** no site, no fim do funil, e ele só dispara se o Heroku responder OK — ou seja, a conversão reportada ao Google Ads hoje é zero.

📁 [`src/lib/analytics.ts`](../../src/lib/analytics.ts)

### 2.8 Menu e footer

**Esperado no menu:** apareceu **"Monte seu projeto"** apontando para `/projects`. O wizard é o único ativo de conversão do site e não estava linkado em nenhum item de navegação.

**Esperado no footer:** sumiram "Press" e "Careers & Culture" (os dois apontavam para `/`) e o link do blog falso. Sobrou "Sobre" e "Monte seu projeto".

📁 [`src/components/Header/index.tsx`](../../src/components/Header/index.tsx) · [`src/components/Footer/index.tsx`](../../src/components/Footer/index.tsx)

### 2.9 Blog falso fora do ar

Acesse **http://localhost:5173/blog** e **/post/1**.

**Esperado:** página 404 em português, com botão de voltar. As rotas foram desregistradas e `posts.ts` foi esvaziado. Estavam em produção cinco posts assinados por gente que não existe ("João Silva", "Maria Santos"), com links para `exemplo.com` e imagens hotlinkadas de terceiros.

Os componentes `src/pages/Blog` e `src/pages/Post` **continuam no repositório de propósito** — o renderizador vira a base das páginas de case na Onda 2. Como não estão importados, não entram no bundle.

📁 [`src/router/config.ts`](../../src/router/config.ts) · [`src/data/posts.ts`](../../src/data/posts.ts)

### 2.10 Foco visível

Dê **Tab** a partir do topo de qualquer página.

**Esperado:** anel de foco azul visível em todo elemento interativo. Havia um `*:focus { outline: none }` global, sem nada no lugar — quem navega por teclado não tinha como saber onde estava.

📁 [`src/styles/styles.ts`](../../src/styles/styles.ts)

### 2.11 Hierarquia de títulos

No console:

```js
[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName + ': ' + h.textContent.trim().slice(0,40))
```

**Esperado:** exatamente **um `H1`**, seções em `H2`, sub-itens em `H3`. Antes o site inteiro usava `<h6>` e nenhuma página tinha `<h1>`. Como todos os níveis têm 36px no CSS global, a mudança é semântica — o visual não muda.

---

## 3. Revisão do código, por tema

### 3.1 Captação de lead — o coração da mudança

| Arquivo | O que olhar |
|---|---|
| [`src/service/index.ts`](../../src/service/index.ts) | Reescrito. Validação, timeout de 12s via `AbortController`, retry com backoff, honeypot, rascunho em `localStorage`, eventos de falha. Leia o comentário sobre **retry duplicar lead**: é uma troca deliberada — lead duplicado é mais barato que lead perdido. |
| [`index.html`](../../index.html) | Formulário estático `name="briefing"` com `hidden`. O Netlify detecta forms parseando o HTML no build; o form React é client-side e nunca seria visto. **Os nomes dos campos têm que bater com os do `submitLead`.** |
| [`src/lib/whatsapp.ts`](../../src/lib/whatsapp.ts) | Monta a URL e a mensagem pré-preenchida. `hasWhatsapp()` exige ≥12 dígitos. |

### 3.2 Performance

O ganho grande **não** veio do `<Result>` do antd, como o diagnóstico inicial supunha. Veio de [`src/common/Icon/index.tsx`](../../src/common/Icon/index.tsx):

```ts
import * as AntIcons from "@ant-design/icons";   // ← antes: barrel inteiro, 834 ícones
```

O `QuestionItem` usa esse componente, então a rota `/projects` — a única que converte — carregava ~758 KB de ícones para desenhar 38. Agora é um registro explícito. Se alguém adicionar um ícone no `data.json` sem registrar aqui, o console avisa.

O `<Result>` também saiu, de [`ContactForm`](../../src/components/ContactForm/Feedback.tsx) e de [`NotFound`](../../src/pages/NotFound/index.tsx) — este último importado de forma **eager** pelo router, então ia para o bundle de todo mundo.

### 3.3 Meta tags e preview social

[`index.html`](../../index.html): `lang="pt-BR"`, `og:image` absoluta 1200×630, `twitter:card`, `og:locale=pt_BR`, canonical. Saíram a `og:url` duplicada e a `meta keywords` que era a description colada inteira.

A imagem é gerada de um SVG versionado:

```bash
./scripts/build-og-image.sh
```

Vale abrir [`public/assets/img/og-image.jpg`](../../public/assets/img/og-image.jpg) e julgar o visual — é o que vai aparecer quando alguém colar o link no WhatsApp ou no LinkedIn.

### 3.4 Infra

| Arquivo | Por quê |
|---|---|
| [`netlify.toml`](../../netlify.toml) | Novo. Build, SPA fallback, headers de segurança, cache de assets, deploy previews. Antes o build de produção só existia na UI do Netlify — fora do versionamento. |
| `.github/workflows/pipeline.yaml` | **Deletado.** Publicava no GitHub Pages, que retorna 404. Era um pipeline fantasma. |
| [`.env.example`](../../.env.example) | Novo. Documenta as duas variáveis. |

### 3.5 Código morto removido

`src/common/utils/useForm.tsx` e `validationRules.ts` foram deletados: nada os importava e o `useForm` tinha `const url = ""` com o comentário *"Fill in your API URL here"* — leftover do template original.

---

## 4. Conferir o build

```bash
npx tsc --noEmit && npx vite build
```

Esperado: `tsc` sem saída, build em ~2,5s. Números a bater:

| Métrica | Antes | Agora |
|---|---:|---:|
| JS total | ~1,7 MB | **621 KB** |
| Rota `/projects` | 757,94 + 77,95 KB | **146,59 KB** |
| Ícones antd | 834 | **38** |

Conferir os ícones no bundle:

```bash
grep -o 'Outlined' dist/assets/index-*.js | wc -l
```

O CSS segue em **557 KB** — é o `antd/dist/antd.css` importado global, ~98,5% não usado. Sai na Onda 2 junto com o antd.

---

## 5. Pendências de configuração

Sem isso a Onda 1 não produz efeito em produção:

1. **`VITE_WHATSAPP_NUMBER`** e **`VITE_GA4_ID`** nas variáveis de ambiente do Netlify. Sem o primeiro, o botão de WhatsApp não aparece; sem o segundo, o funil não é medido.
2. Depois do primeiro deploy, confirmar no painel do Netlify que o formulário **`briefing`** foi detectado, e configurar notificação de nova submissão (e-mail ou webhook).
3. Apontar o build do Netlify para o `netlify.toml` versionado, em vez da configuração da UI.
4. Criar a property do GA4 e colar o Measurement ID.

---

## 6. O que ficou de fora, e por quê

| Item | Motivo |
|---|---|
| Zod na validação do lead | Gerenciador de pacotes quebrado — dependência nova não era verificável. Validação escrita à mão, sem dependência. |
| `<title>`/`description` por rota | Exigiria `react-helmet-async`, mesma restrição. A Onda 2 resolve nativo: o Astro gera `<head>` por página. |
| Remoção do antd (CSS de 557 KB) | Sai junto com a migração para Astro, para não fazer o trabalho duas vezes. |
| Cor de hover `#ff0000` (contraste 4.0:1, falha AA) | Decisão de marca, não de código. Está especificada em [`03-ui.md`](03-ui.md) com a paleta nova. |
| Tela de estimativa antes do formulário | Onda 3 — depende do empacotamento de oferta de [`07-negocios.md`](07-negocios.md). |

---

## 7. Escopo do diff

**35 arquivos modificados, 856 inserções, 409 remoções.** Mais 3 deletados e 14 novos.

Nada foi commitado. Para ver tudo:

```bash
git diff
```
