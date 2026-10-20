# lemamon.dev

Site da Lemamon (software sob medida, São Paulo/SP): Astro estático em 3 idiomas
(pt-BR na raiz, `/en/`, `/es/`), com uma única ilha React (o wizard de `/orcamento`).
Deploy no Netlify a partir do `netlify.toml`.

## Comandos

Yarn 1.22.22 via Corepack (`COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn <cmd>`), Node ≥ 22.22.

| Comando | O que faz |
|---|---|
| `yarn dev` | servidor de desenvolvimento em http://localhost:4321 |
| `yarn build` | `astro check` (0 erros/warnings) + build estático em `dist/` + verificação de rotas, H1 e placeholders (com a camada fictícia ligada, o build vai para `dist-ficticio/`) |
| `yarn preview` | serve o `dist/` (ou o `dist-ficticio/`, com a camada fictícia ligada) |
| `yarn test` | testes unitários (Vitest), com 6 builds reais para o caçador de dado fictício |
| `yarn test:e2e` | Playwright (instale antes: `yarn playwright install chromium`); builda em `dist-e2e/` com um WhatsApp de teste |
| `yarn i18n:check` | paridade e placeholders de `src/i18n/{pt,en,es}.json` |

## Onde está cada coisa

- **Arquitetura e regras:** `docs/arquitetura/BLUEPRINT.md` (fonte de verdade), `CONTRACT.md` (organização do código), `03-ui.md` (visual), `04-tecnico.md`.
- **Textos:** `src/i18n/*.json`. Nenhum texto visível fica em componente.
- **Dados do dono** (empresa, Política, pessoas, perfis, confirmações, faixas, preços, agenda, formatos, depoimentos, logos): um arquivo só, `dados/dono.json` (autocompleta pelo `dados/dono.schema.json`; imagens em `dados/imagens/`). O guia campo a campo é `docs/playbooks/00-DADOS-DO-DONO.md`. Seção sem dado não existe no site (nem no menu, sitemap ou hreflang). Cases e posts continuam em MDX (`src/content/`).
- **Dados fictícios:** `dados/dono.ficticio.json` + `dados/ficticio/` preenchem o que está vazio só com `PUBLIC_DADOS_FICTICIOS=true` e fora de produção (faixa "Dados fictícios — não publicar" e `noindex,nofollow` em toda página). O `.env.local` vem com a camada ligada, e aí o build local vai para `dist-ficticio/` (nunca para `dist/`, a pasta publicada); `PUBLIC_DADOS_FICTICIOS=false yarn build` mostra só o dado real, em `dist/`. Texto de exemplo ou valor copiado da camada no `dono.json`, num case ou num post derruba o build. Deploy manual de pasta local é proibido: produção sai só do build do Netlify.
- **Variáveis de ambiente** (Netlify): `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_GA4_ID` (ver `.env.example`). Vazias, o recurso some. `PUBLIC_DADOS_FICTICIOS` nunca em produção (lá ela é ignorada).
- **Produção:** o build de produção do Netlify falha de propósito enquanto a Política de Privacidade estiver incompleta com dado REAL (`dados/dono.json › privacidade` e `› empresa`).
