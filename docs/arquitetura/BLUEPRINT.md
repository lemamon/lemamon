# BLUEPRINT — lemamon.dev (versão final da arquitetura de informação)

**Status:** fonte de verdade para a Onda 2 (Astro) e para a escrita do copy.
**Praça:** São Paulo, SP desde 20/10/2026 (D38 em `docs/playbooks/15-registro-de-decisoes.md`; antes, Florianópolis, SC). Texto visível: `src/i18n/{pt,en,es}.json`; endereço do JSON-LD: `ADDRESS` em `src/config/site.ts`.
**Base:** Proposta B (Jornada), vencedora no placar (B 40,4 · A 38,7 · C 35,6), com enxertos de A e C decididos pelos 5 julgamentos (Rafael, Cláudia, Marcos, Comercial, Tech lead).
**Esqueleto de copy:** `content-model.json`, com todas as chaves de texto do site. Cada página deste documento indica a chave de copy correspondente.
**Escopo:** este documento não altera nada em `src/`. Ele define o que a migração para Astro deve construir.

---

## 0. Como ler este documento

- **always**: a seção ou página sempre vai ao ar.
- **when_data (gatilho)**: a seção ou página só existe quando o dado indicado estiver preenchido. Sem dado, ela não gera HTML, rota, item de menu, link no footer, entrada no sitemap nem par de hreflang (§4). O texto estrutural dessas seções é escrito de forma que só faça sentido com o dado presente. Nunca há "em breve", placeholder nem título órfão.
- **Papel no funil**: atenção → identificação → diferenciação (método) → confiança/prova → objeção → conversão → pós-conversão.
- **CTA**: no máximo 1 CTA primário por seção (§8.6).
- O texto entre aspas nas seções é **texto-guia**: indica intenção e tom. O copy final sai dos documentos de copy (§13) e precisa respeitar §12.

---

## 1. Premissas fixas (não se rediscutem)

1. **Posicionamento: escopo, prazo e preço fechados.** Da descoberta ao software rodando, com escopo, prazo e preço combinados antes de começar. O herói do site é o **método**, porque o diferencial é previsibilidade e não tecnologia.
2. **Processo que pode ser prometido:**
   a. Diagnóstico gratuito de 45 minutos, com devolutiva por escrito.
   b. Sprint de Descoberta, **gratuita**, só quando o diagnóstico mostra que ela é necessária (a necessidade e a duração são definidas com o cliente no diagnóstico): entendimento do problema, escopo priorizado e plano (a proposta) com prazo e preço fechados para o desenvolvimento. Nada é cobrado antes do desenvolvimento; as etapas pagas são o desenvolvimento e a sustentação (D44, 21/10/2026).
   c. Desenvolvimento com entregas a cada 2 semanas: software funcionando que o cliente usa, não apresentação de slide.
   d. Sustentação e evolução contínua.
3. **Preço:** nenhum número publicado no copy. As faixas de investimento ficam escondidas até o dono preencher `precos.ts`.
4. **Stack:** Astro estático, com HTML de conteúdo real indexável. A única ilha React é o wizard.
5. **Fatos confirmados** (os únicos que podem ser afirmados): nome Lemamon.dev; domínio lemamon.dev; São Paulo, SP, Brasil; razão social Lemamon.dev LTDA e CNPJ 69.700.690/0001-98 (D39, só com `hasCompanyData`); software sob medida (sistemas web, aplicativos, integrações, produtos digitais/MVPs, sustentação); e-mail lemamon.dev@gmail.com; WhatsApp (o número vem de variável de ambiente e o copy diz só "WhatsApp"); GitHub github.com/lemamon-dev; LinkedIn linkedin.com/in/lemamon-dev; Medium medium.com/@lemamon.dev; o processo do item 2; **atende empresas de outras cidades do Brasil e de qualquer país, a distância, em português, inglês ou espanhol, com o mesmo processo** (D31, 21/10/2026, `confirmacoes.outrasCidades` e `.atendeExterior`; moeda, contrato e forma de pagamento "combinados por escrito antes de começar", sem afirmar moeda, nota de exportação, foro nem fuso); **a Sprint de Descoberta é gratuita, não entrega protótipo e só acontece quando o diagnóstico mostra que é necessária; a necessidade e a duração são definidas com o cliente no diagnóstico** (D44, 21/10/2026, revoga a D42: `descoberta.duracao = null`, nenhuma duração publicada; `confirmacoes.duracaoDescoberta` liga só a resposta sem número do FAQ "Quanto dura?").
6. **Restrição do Google Ads:** a conversão "Solicitar cotação" é registrada no wizard, hoje em `/projects`. A rota muda, então o **301 é obrigatório** (§10).
7. **Idiomas:** pt-BR na raiz `/`, inglês em `/en/`, espanhol neutro latino-americano em `/es/`, com "tú" em todo o site.

---

## 2. Princípios de arquitetura

1. **O método é a espinha do site.** Um único componente de linha do método (4 etapas, §5.1) aparece no hero da Home, em Como trabalhamos, na Sprint de Descoberta, nas páginas de serviço, em Quanto custa e no resumo do wizard. É uma fonte de texto só por idioma.
2. **Um CTA, uma porta.** O CTA primário é sempre **"Pedir diagnóstico gratuito"**, e o secundário é sempre **WhatsApp**. Os dois existem desde o hero.
3. **Honestidade de nomenclatura.** A rota do wizard se chama `/orcamento`, que é a palavra do comprador e o nome da conversão no Ads. O H1 e um FAQ curto, os dois **antes do primeiro clique**, explicam que dali sai um diagnóstico e não um preço. O rótulo "Agendar" só existe se houver agenda online de verdade.
4. **Valor antes do dado.** O wizard devolve um resumo personalizado antes de pedir qualquer contato.
5. **Confiança sem inventar prova.** Enquanto não houver cases, a confiança vem de três fontes: compromissos verificáveis do processo, transparência do método (o que cada etapa entrega e onde o cliente decide) e perfis públicos (quando tiverem conteúdo recente).
6. **when_data é regra de build, não de CSS.** Um único módulo de features decide o que existe (§4).
7. **Toda pergunta sensível tem saída digna**, e nenhuma resposta descarta o lead.
8. **Mobile primeiro.** H1, subtítulo e CTA cabem acima da dobra em 360×640. O LCP é texto, e não há carrossel escondendo prova.

---

## 3. Mapa de páginas

### 3.1 Rotas e visibilidade

| # | Página | pt-BR | en | es | Visibilidade | Keyword primária (pt) | Chave de copy |
|---|---|---|---|---|---|---|---|
| 1 | Home | `/` | `/en/` | `/es/` | always | desenvolvimento de software sob medida | `home` |
| 2 | Como trabalhamos | `/como-trabalhamos` | `/en/how-we-work` | `/es/como-trabajamos` | always | desenvolvimento de software com preço fechado | `how_we_work` |
| 3 | Sprint de Descoberta | `/sprint-de-descoberta` | `/en/discovery-sprint` | `/es/sprint-de-descubrimiento` | always | sprint de descoberta / discovery de produto | `discovery_sprint` |
| 4 | Serviços (hub) | `/servicos` | `/en/services` | `/es/servicios` | always | serviços de desenvolvimento de software | `services.hub` |
| 5 | Sistemas web | `/servicos/sistemas-web` | `/en/services/web-systems` | `/es/servicios/sistemas-web` | always | desenvolvimento de sistemas web para empresas (§15.4, item 6) | `services.web_systems` |
| 6 | Aplicativos | `/servicos/aplicativos` | `/en/services/mobile-apps` | `/es/servicios/aplicaciones` | always | desenvolvimento de aplicativos sob medida (§15.4, item 6) | `services.mobile_apps` |
| 7 | Integrações e automação | `/servicos/integracoes` | `/en/services/integrations` | `/es/servicios/integraciones` | always | integração de sistemas | `services.integrations` |
| 8 | MVP e produtos digitais | `/servicos/mvp` | `/en/services/mvp` | `/es/servicios/mvp` | always | desenvolvimento de MVP | `services.mvp` |
| 9 | Sustentação e evolução | `/servicos/sustentacao` | `/en/services/support-and-evolution` | `/es/servicios/soporte-y-evolucion` | always | sustentação de sistemas / manutenção de software | `services.support` |
| 10 | Quanto custa | `/quanto-custa` | `/en/pricing` | `/es/cuanto-cuesta` | always | quanto custa desenvolver um sistema | `pricing` |
| 11 | Orçamento (wizard) | `/orcamento` | `/en/quote` | `/es/cotizacion` | always | orçamento de desenvolvimento de software | `quote` |
| 12 | Pedido enviado | `/orcamento/enviado` | `/en/quote/sent` | `/es/cotizacion/enviada` | always, **noindex** | — | `quote.sent` |
| 13 | Contato | `/contato` | `/en/contact` | `/es/contacto` | always | Lemamon.dev contato | `contact` |
| 14 | Política de Privacidade | `/privacidade` | `/en/privacy` | `/es/privacidad` | always (noindex opcional) | — | `privacy` |
| 15 | 404 | `404.html` | `/en/404.html` | `/es/404.html` | always, noindex | — | `shared.not_found` |
| 16 | Cases (hub) | `/cases` | `/en/cases` | `/es/casos` | when_data: `hasCases` (≥ 2 cases publicados) | cases de desenvolvimento de software | `cases.hub` |
| 17 | Case | `/cases/[slug]` | `/en/cases/[slug]` | `/es/casos/[slug]` | when_data: por case publicado | {tipo de sistema} para {setor} | `cases.case` |
| 18 | Sobre | `/sobre` | `/en/about` | `/es/nosotros` | when_data: `hasTeam` (≥ 1 pessoa com foto, nome e papel) | empresa de desenvolvimento de software em São Paulo | `about` |
| 19 | Blog e post | `/blog`, `/blog/[slug]` | — (só pt-BR) | — (só pt-BR) | when_data: `hasPosts` (≥ 3 posts com autor real) | por post | `blog` |

Hoje vão ao ar 14 URLs em pt-BR, mais a 404, espelhadas em `/en/` e `/es/`. As páginas 16 a 19 entram sozinhas quando o dado existir.

### 3.2 Fluxo entre páginas (jornada)

```
Entrada (indicação WhatsApp/LinkedIn · busca · Ads)
   ├─ Home ────────────┐
   ├─ /servicos/[slug] ┤──► /como-trabalhamos ──► /sprint-de-descoberta
   ├─ /quanto-custa ───┤          │                       │
   └─ /contato ────────┘          ▼                       ▼
                         /orcamento (wizard, ?servico= pré-marca a P2)
                                  │  6 perguntas → resumo → contato
                                  ▼
                         /orcamento/enviado (protocolo, WhatsApp, preparar a conversa)
                                  ▼  (offline)
           Diagnóstico 45 min (necessidade e duração da Descoberta definidas com o cliente)
           → devolutiva escrita → Sprint de Descoberta gratuita, quando necessária
           → plano (proposta) do desenvolvimento com prazo e preço fechados
           (o comercial envia /sprint-de-descoberta junto com a devolutiva quando a Descoberta foi combinada)
```

Em qualquer ponto, o WhatsApp é a porta paralela.

---

## 4. Gatilhos de dados (`when_data`)

Um módulo central (`src/config/features.ts`) calcula todas as flags no build e é a **única** fonte consultada por páginas, Header, Footer, sitemap, mapa de rotas e hreflang.

| Arquivo / coleção | Conteúdo | Flag e limiar | O que libera |
|---|---|---|---|
| `config/precos.ts` | Faixas por item: `desenvolvimento.sistemas`, `desenvolvimento.aplicativos`, `desenvolvimento.integracoes`, `desenvolvimento.mvp`, `sustentacao` (mensal). Cada linha: faixa (texto), unidade, "o que move o valor" (até 3 itens), por idioma. **Vazio por padrão.** A Sprint de Descoberta é gratuita e não tem linha (D44). | `hasPricing` (≥ 1 linha); flag por linha | Seções "Investimento" (Home, Como trabalhamos, serviços, Quanto custa); variantes de FAQ "Quanto custa?"; bloco de preço no resumo do wizard. Só as linhas preenchidas renderizam. |
| `config/qualificacao.ts` | Faixas de orçamento do wizard por idioma (rótulo, moeda decidida pelo dono), faixa de corte de MQL, faixas mensais opcionais, regras de score. **Separado de `precos.ts`.** | `hasBudgetTiers`, `hasMonthlyTiers` | P5 com faixas numéricas. Vazio: P5 usa a versão sem números (§7.3). |
| `config/confirmacoes.ts` | Flags e respostas aprovadas pelo dono: `escopoMudanca`, `codigoProprietario`, `notaFiscal`, `outrasCidades`, `atendeExterior` (D31; exige `outrasCidades`), `nda`, `sistemaTerceiros`, `semDescoberta` (só o FAQ `skip_discovery`, com texto alinhado à D44), `duracaoDescoberta` (resposta sem número, D44), `planoDoCliente` (continua `false`), `migracaoDados`, `devolutivaConteudo`, `ligacao` | uma flag por item | FAQs condicionais; frase explicativa da devolutiva; opção "Ligação" no canal de contato. |
| `config/perfis.ts` | GitHub, LinkedIn, Medium: `publicar: true/false` (o dono marca depois de conferir que há conteúdo público recente) | `hasProfiles` (≥ 1 com `publicar`) | Seção "Confira antes de conversar" da Home. O footer lista os três sempre, porque são canais confirmados. |
| `config/agenda.ts` | URL de agenda online | `hasAgenda` | CTA "Escolher horário agora" no pós-envio; troca do rótulo para "Agendar diagnóstico gratuito" (§8.6). |
| `config/empresa.ts` | Razão social, CNPJ, ano de fundação (opcional) | `hasCompanyData` | CNPJ no rodapé, controlador na Política, bloco "Dados da empresa" em /sobre. |
| `config/descoberta.ts` | Formato, participantes e ritmo da Sprint (`duracao` fica sempre `null`: a duração é definida com o cliente no diagnóstico, D44) | `hasDiscoveryFormat` (os 3) | Seção "Como ela acontece" (os 3), sem duração. |
| `config/sustentacao.ts` | O que inclui, como é contratada, canais | `hasSupportFormat` | Seção "Como funciona a sustentação". |
| `config/engenharia.ts` | Práticas de engenharia (testes, CI/CD, code review, repositório, documentação, passagem de conhecimento) | `hasEngineering` | Seção "Como a gente constrói" em /como-trabalhamos. |
| coleção `logos/` | Arquivo, nome da empresa, registro de autorização por escrito | `hasLogos` (≥ 4) | Faixa de logos na Home. |
| coleção `depoimentos/` | Citação, nome completo, cargo, empresa, foto opcional, case opcional, autorização | `hasTestimonials` (≥ 1 nominal); **nunca anônimo** | Depoimentos (Home, Como trabalhamos, case). |
| coleção `cases/` (MDX + schema Zod) | Cliente ou setor+porte, serviço (tag), problema, o que foi combinado, o que foi entregue, como foi, resultado antes→depois (opcional e verificável), ficha técnica, imagens, depoimento, autorização (ou `semTermo`, decisão registrada do dono, aceito só em case sem `cliente`, sem `resultado`, sem prazo e preço, sem link do produto e sem depoimento; D45) | `hasCases` (≥ 2); por tag (≥ 1) | /cases, /cases/[slug], seção Cases da Home, cases relacionados nos serviços, prova do método. |
| coleção `time/` | Foto real, nome, papel, 1 linha escrita pela pessoa, links | `hasTeam` (≥ 1 completo) | Seção Time da Home, /sobre, item "Sobre" no menu. |
| coleção `posts/` | Post com autor real (nome, foto, link), datas | `hasPosts` (≥ 3) | /blog, item "Blog" no footer. |

**Regras:**
- Um dado parcial não renderiza (um card de pessoa sem foto não conta).
- O FAQPage JSON-LD de cada página inclui só as perguntas visíveis.
- Nenhum valor monetário aparece no código de copy. Os valores vêm apenas de `precos.ts` e `qualificacao.ts`, e as faixas do wizard só existem dentro da ilha React, fora do HTML indexável.

---

## 5. Componentes compartilhados

### 5.1 Linha do método (`shared.method_timeline`)
4 etapas, cada uma com **nome**, **tag** e **"Você recebe"** em uma linha:

| id | Nome | Tag | Você recebe |
|---|---|---|---|
| `diagnosis` | Diagnóstico | Gratuito · 45 minutos | uma devolutiva por escrito |
| `discovery` | Sprint de Descoberta | Gratuita · se for necessária | entendimento do problema, escopo priorizado e plano com prazo e preço fechados para o desenvolvimento |
| `development` | Desenvolvimento | Entregas a cada 2 semanas | software funcionando, que você usa — não apresentação de slide |
| `support` | Sustentação e evolução | Contínua | o sistema cuidado e evoluindo depois que entra no ar |

Variantes: **compacta** (hero, serviços, wizard: nome e tag), **completa** (Home e Como trabalhamos: com "Você recebe") e **destaque** (uma etapa realçada: Sprint de Descoberta e resumo do wizard). A etapa 1 sempre leva o selo "comece aqui" ou "próximo passo". Em HTML é um `<ol>`, e cada etapa vira âncora para `/como-trabalhamos#{id}`. As tags são texto com contraste AA, nunca só cor.

### 5.2 Entregáveis da Descoberta (`shared.discovery_deliverables`)
Exatamente 3: **Entendimento do problema** · **Escopo priorizado** (o que entra primeiro e o que pode esperar) · **Plano com prazo e preço fechados** para o desenvolvimento (a proposta). Nada além disso (sem protótipo, "arquitetura", "documento de riscos" nem duração) até o dono confirmar. O protótipo saiu em 21/10/2026 (D44, opção "Sem protótipo" do dono; o site não diz onde ele entra).

### 5.3 Faixa de compromissos (`shared.commitments`)
4 itens curtos, sem título: escopo, prazo e preço fechados antes do desenvolvimento · software funcionando a cada 2 semanas · você decide se segue depois do diagnóstico e depois do plano · **o código é da sua empresa, por contrato** (com o rascunho `answer_draft` de `confirmacoes.codigoProprietario`; sem ele, sustentação e evolução depois que entra no ar; auditoria de conversão F01, §15.5 linha 17). Nunca 5 itens. Também um selo "São Paulo, SP". Os logos (when_data) entram **abaixo** desta faixa e nunca no lugar dela.

### 5.4 Bloco "Investimento" (`shared.investment`) · when_data `hasPricing`
Título, introdução que se sustenta sem números ("o preço do desenvolvimento do seu projeto é fechado antes de ele começar"), uma linha por item preenchido (rótulo, faixa, unidade, "o que move o valor"), as linhas fixas "Diagnóstico: gratuito" e "Sprint de Descoberta: gratuita, se for necessária" (esta fora da sustentação; D44: a Descoberta não tem faixa) e a nota "Referência, não proposta". Sem "plano recomendado" e sem destaque de card. Some por inteiro, título e âncora incluídos, com o config vazio. Cada página filtra as linhas que lhe interessam.

### 5.5 CTA final (`shared.cta_final`)
Título, texto de 1–2 frases, CTA primário, WhatsApp, e-mail em texto com botão "Copiar" (sem `mailto` como ação principal) e "São Paulo, SP". Microcopy: "Gratuito e sem compromisso de contratar". Cada página pode sobrescrever o título e o texto (as chaves ficam na página). Fundo escuro, fechando o arco visual aberto pela seção do método.

### 5.6 FAQ (`faq` + chaves das páginas)
Acordeão com `<details>/<summary>` nativo, a primeira pergunta aberta, sem JS e indexável. Um **banco central** (`faq`) guarda as perguntas usadas em mais de uma página e todas as condicionais. As perguntas exclusivas de uma página ficam na chave dela. **Pode haver repetição entre páginas**: o Google não mostra rich result de FAQ para sites comerciais desde 2023, então a unicidade por página não define a arquitetura. O JSON-LD FAQPage é gerado com os itens visíveis.

### 5.7 Prova (`shared.proof`) · when_data
Rótulos estruturais de cards de case, depoimento, logos e pessoa do time, reutilizados em todas as páginas.

### 5.8 Perfis públicos (`shared.profiles`)
Uma linha por perfil (GitHub, LinkedIn, Medium) em linguagem de negócio, porque a Cláudia não sabe o que é GitHub: "o código que a gente publica", "a empresa no LinkedIn", "artigos". Links com `rel="noopener"` e evento `profile_click`.

### 5.9 Termos explicados (`shared.terms`)
Explicações curtas e inline para o comprador não técnico: **escopo priorizado**, **MVP**, **devolutiva por escrito** (esta só com `confirmacoes.devolutivaConteudo`; até lá, o texto é só "uma devolutiva por escrito"). Aparecem como frase de apoio ou `<abbr>`/tooltip acessível na primeira menção de cada página.

---

## 6. Páginas, seção por seção

### 6.1 Home (`/`) · copy `home`

**Propósito:** em 5 segundos dizer o que a Lemamon.dev faz, para quem e qual é o diferencial (escopo, prazo e preço combinados antes de começar), e levar ao diagnóstico gratuito ou ao WhatsApp. É otimizada para a Cláudia e o Rafael. O Marcos chega por Como trabalhamos e Sustentação.
**Title/description:** keyword "desenvolvimento de software sob medida" + promessa + diagnóstico de 45 min.
**JSON-LD:** WebSite (o mesmo nó nas 3 Homes: `url` https://lemamon.dev/ e `inLanguage` pt-BR, en, es; auditoria SEO S02-7) + Organization + ProfessionalService (nome, url, e-mail, São Paulo/SP/BR via `ADDRESS` em `src/config/site.ts`, sameAs com os 3 perfis; com `hasCompanyData`, `legalName` e `taxID`; `areaServed` e idiomas pelas flags da D31: com `confirmacoes.atendeExterior`, `areaServed` "Worldwide", `knowsLanguage` e `contactPoint` comercial com `availableLanguage` nos 3 idiomas; só com `outrasCidades`, `areaServed` Country "BR"; sem flag, nada; auditoria SEO S02-3; sem telefone, sem rating, sem `foundingDate` enquanto `anoFundacao` for nulo).

Ordem (as seções when_data somem sem deixar rastro; hoje vão ao ar 8 seções):

| # | id | Visibilidade | Papel no funil |
|---|---|---|---|
| 1 | `hero` | always | atenção + promessa + conversão |
| 2 | `commitments` | always | confiança imediata |
| 3 | `logos` | when_data `hasLogos` | prova social |
| 4 | `problem` | always | identificação |
| 5 | `risks` | always | objeção de risco → ponte para o método |
| 6 | `method` | always | diferenciação (herói) |
| 7 | `testimonial` | when_data `hasTestimonials` | prova |
| 8 | `services` | always | consideração + distribuição interna |
| 9 | `cases` | when_data `hasCases` | prova |
| 10 | `investment` | when_data `hasPricing` | objeção de preço |
| 11 | `team` | when_data `hasTeam` | confiança por pessoas |
| 12 | `trust_profiles` | when_data `hasProfiles` | confiança verificável |
| 13 | `faq` | always | objeções residuais |
| 14 | `cta_final` | always | conversão |

**1. `hero`** · always
- Propósito: dizer o que é, para quem e por que é diferente, com as duas portas acima da dobra.
- Conteúdo: eyebrow (o que constrói + "São Paulo, SP"; com `confirmacoes.atendeExterior`, D31, + "Atendemos o mundo todo", só na Home); H1 com a promessa do método ("Software sob medida com escopo, prazo e preço combinados antes de começar."); subtítulo de até 2 frases (o que constrói, incluindo MVP, e como: plano aprovado antes de construir e software funcionando a cada 2 semanas, sem jargão como "linha de código"); microcopy sob os CTAs ("Sem compromisso · 45 minutos · devolutiva por escrito"; "gratuito" já está no botão, auditoria F41); visual da linha do método compacta (§5.1) com a etapa 1 marcada "comece aqui". O visual é clicável e leva a `#como-trabalhamos`.
- CTA primário: **Pedir diagnóstico gratuito** → `/orcamento?origem=home-hero`. Secundário: **Falar no WhatsApp** (mensagem com a página de origem).
- Notas: único H1; nenhum número além de 45 min e 2 semanas; sem foto de banco, sem snippet de código e sem animação no H1 (o LCP é o H1); altura automática, nunca 100vh. Grid 7+5 no desktop; no mobile, CTA em largura total ≥ 48px, WhatsApp em outline e a linha do método abaixo dos CTAs.

**2. `commitments`** · always — componente §5.3. Faixa logo abaixo do hero, sem título e sem CTA. 4 colunas no desktop, 2×2 no tablet, lista no mobile.

**3. `logos`** · when_data `hasLogos` (≥ 4 com autorização escrita)
- Rótulo sem H2 ("Empresas que já trabalharam com a Lemamon.dev"). Logos monocromáticos, alt = nome da empresa, link opcional para o case. Sem marquee. Fica abaixo da faixa de compromissos.

**4. `problem`** · always · identificação
- Propósito: o visitante se reconhece na **dor operacional** antes de ouvir sobre a solução, mesmo sem nunca ter contratado software.
- Conteúdo: título (texto-guia: "Dá pra reconhecer o momento em que o improviso passa a custar caro"); 1 frase de apoio; 5 cards (título curto + 1 frase na voz do cliente): (1) a planilha virou o sistema da empresa e só uma pessoa sabe mexer; (2) a mesma informação é digitada duas vezes e alguém sempre erra; (3) você paga por ferramentas que não conversam entre si; (4) o software pronto não faz o principal, porque o seu processo não é igual ao dos outros; (5) **card do fundador**: você tem uma ideia de produto e precisa colocá-la na mão do usuário sem queimar o caixa construindo a coisa errada.
- CTA: link de texto "Reconheceu sua empresa aqui? Pedir diagnóstico gratuito" → `/orcamento?origem=home-problema`.
- Notas: nenhuma estatística de mercado. Lista no mobile e grid no desktop.

**5. `risks`** · always · objeção de risco
- Propósito: nomear o medo de contratar software (a objeção central "vou pagar, vai atrasar e não vai funcionar") e responder cada medo com uma etapa confirmada do método.
- Conteúdo: título que trata o medo como algo comum e não como experiência do leitor (texto-guia: "O que costuma dar errado quando se contrata software"); 4 pares **medo → como a Lemamon.dev evita**: (1) orçamentos impossíveis de comparar, porque cada fornecedor entendeu uma coisa → problema e escopo priorizado por escrito, e só depois o preço; (2) meses sem ver nada funcionando → software funcionando a cada 2 semanas; (3) um escopo que ninguém escreveu e um preço que só cresce → escopo validado por você e por escrito, e preço fechado sobre ele; (4) o fornecedor que some depois do lançamento → sustentação e evolução contínua. **Frase-ponte** colada no método: "Em todos esses casos, faltou combinar antes de começar. É assim que a gente evita isso:".
- Notas: nunca nomeia concorrente. O lado "medo" fica em tom neutro e o lado "Lemamon.dev" em cor de destaque. 2×2 no desktop, pares empilhados no mobile.

**6. `method`** · always · diferenciação (âncora `#como-trabalhamos`)
- Propósito: seção pedida pelo dono e coração do posicionamento. Mostra as 4 etapas, o que o cliente recebe em cada uma e onde ele decide.
- Conteúdo: eyebrow "Como trabalhamos"; H2 (texto-guia: "Primeiro a gente combina. Depois a gente constrói."); intro ("Em cada etapa, você sabe o que recebe. A Descoberta só entra quando o diagnóstico mostra que ela é necessária."; D44); 4 etapas com número, nome, tag (§5.1), título-benefício de 1 linha, texto de até 2 frases e "Você recebe:"; **faixa "Onde você decide"** com 2 pontos: (1) depois da devolutiva do diagnóstico, se segue (a Descoberta, quando necessária, é gratuita); (2) com prazo e preço fechados no plano, se segue para o desenvolvimento.
- CTA primário: **Começar pelo diagnóstico gratuito** → `/orcamento?origem=home-metodo`. Link: "Ver cada etapa em detalhe" → `/como-trabalhamos`. O nome "Sprint de Descoberta" linka para `/sprint-de-descoberta`.
- Notas: única seção de fundo escuro, além do CTA final. Stepper horizontal no desktop; vertical com conector no mobile, sempre aberto e sem acordeão. `<ol>` com cada etapa em `<h3>`. Sem duração nas etapas 2 a 4 (D44: a duração da Descoberta é definida com o cliente no diagnóstico e não é publicada).

**7. `testimonial`** · when_data `hasTestimonials`
- Propósito: responder "será que cumprem?" logo depois do método. 1 depoimento nominal (citação de 2–3 linhas, nome, cargo, empresa, foto opcional, link "Ler o case"), de preferência sobre previsibilidade. H2 visualmente oculto. `<figure><blockquote><figcaption>`.

**8. `services`** · always · consideração + SEO interno
- Conteúdo: eyebrow; H2 ("O que a gente constrói"); intro ("Em todos os casos, o mesmo método."); 5 itens (nome, 1 frase problema→resultado, link "Ver como funciona"): Sistemas web · Aplicativos · Integrações e automação · MVP e produtos digitais · Sustentação e evolução; rodapé "Não sabe em qual se encaixa? O diagnóstico serve para isso."
- CTA: cada item → `/servicos/[slug]`; o rodapé leva "Pedir diagnóstico gratuito" → `/orcamento?origem=home-servicos`.
- Notas: no mobile, linhas tocáveis ≥ 56px com o item inteiro como um único `<a>`; no desktop, grid 3+2. Sem a palavra "soluções". A publicação nas lojas aparece como "pode incluir", nunca como afirmação.

**9. `cases`** · when_data `hasCases` (≥ 2)
- H2 ("Projetos que já estão rodando"); intro ("O que foi combinado, o que foi entregue e o que mudou."); até 3 cards (§5.7); link "Ver todos os cases" → `/cases`. No mobile, cards empilhados, sem carrossel. O card faz sentido sem o campo de resultado.

**10. `investment`** · when_data `hasPricing` — componente §5.4 com todas as linhas preenchidas. Quando visível, o FAQ "Quanto custa?" ganha o link "Ver faixas de referência".

**11. `team`** · when_data `hasTeam`
- H2 ("Quem vai trabalhar no seu projeto"); por pessoa: foto real, nome, papel, 1 linha escrita pela pessoa, LinkedIn/GitHub; link "Conhecer a Lemamon.dev" → `/sobre`. Fica imediatamente antes de `trust_profiles`.

**12. `trust_profiles`** · when_data `hasProfiles`
- Propósito: dar ao comprador (e ao sócio dele) uma forma de checar que a empresa existe e trabalha em público. É o substituto honesto da prova social enquanto ela não existe, e o gatilho nº 1 do Marcos.
- Conteúdo: H2 ("Confira antes de conversar"); 1 frase (com `hasCompanyData`: "Lemamon.dev LTDA · CNPJ … · São Paulo, SP", a prova de existência; en/es explicam o CNPJ); os perfis marcados em `perfis.ts` (§5.8) numa linha de links, ícone + nome (auditoria F14: perfil ainda vazio não ganha card).
- Notas: a seção some se nenhum perfil estiver marcado, porque um perfil vazio prova o contrário.

**13. `faq`** · always
- H2 ("Perguntas antes de começar"). Do banco `faq`, nesta ordem: `how_much` · `how_long` · `pay_before_development` · `diagnosis_commitment` · `need_tech_knowledge` · `how_follow_progress` · `after_launch`. Condicionais (aparecem quando o dono liga a flag): `scope_change` · `code_ownership` · `invoice` · `other_cities` · `nda`. Link final: "Mais sobre preço" → `/quanto-custa`.

**14. `cta_final`** · always — §5.5 com título da Home (texto-guia: "Comece por 45 minutos de conversa"), mais o bloco "Como funciona" em 3 passos: você responde 6 perguntas de clique e vê o resumo antes de deixar contato → a gente fala com você para marcar o horário → diagnóstico de 45 minutos e devolutiva por escrito. CTA → `/orcamento?origem=home-final`.

---

### 6.2 Como trabalhamos (`/como-trabalhamos`) · copy `how_we_work`

**Propósito:** página-pilar do posicionamento. Detalha o método para quem precisa entender ou justificar a contratação (a Cláudia para o sócio, o Marcos para o chefe) e para o lead que acabou de receber a devolutiva. É o destino de "Ver cada etapa em detalhe".
**Title:** "Como trabalhamos: escopo, prazo e preço fechados | Lemamon.dev".

| # | id | Visib. | Propósito | Papel | CTA |
|---|---|---|---|---|---|
| 1 | `hero` | always | Dizer o método numa frase e dar o índice das etapas | diferenciação | Pedir diagnóstico gratuito → `/orcamento?origem=metodo-hero` |
| 2 | `agreement` | always | Os compromissos antes do detalhe ("O que está combinado desde o início"): escopo, prazo e preço fechados antes do desenvolvimento (por escrito; no plano da Descoberta, quando ela é necessária); software funcionando a cada 2 semanas (você acompanha pelo que já roda); você decide depois do diagnóstico e depois do plano; e, com o rascunho `answer_draft` de `confirmacoes.codigoProprietario`, um 4º card: o código é da sua empresa, por contrato (auditoria F01) | confiança | — |
| 3 | `why_this_order` | always | A crença por trás do método: preço dado antes de entender o problema é chute, alto para cobrir o risco ou baixo e crescendo no meio do caminho. Frase-síntese em destaque: "Primeiro a gente combina. Depois a gente constrói." | convicção | — |
| 4 | `timeline` | always | Visão geral: linha do método completa (§5.1), cada etapa ancorada no bloco abaixo | orientação | — |
| 5 | `stage_diagnosis` (#diagnostico) | always | Etapa 1, gratuita, 45 min: para quem é; como é; "Você recebe: uma devolutiva por escrito"; **"Para aproveitar melhor, tenha à mão"**: quem decide, exemplos do processo de hoje (planilhas, telas, mensagens), os sistemas que vocês já usam; "Depois: se fizer sentido seguir, vem a Sprint de Descoberta, gratuita, quando o diagnóstico mostrou que ela é necessária, com a duração combinada nele; quando não é, vem a proposta de desenvolvimento" (a necessidade e a duração são definidas NO diagnóstico, não depois) | conversão (porta) | Pedir diagnóstico gratuito → `/orcamento?origem=metodo-diagnostico` |
| 6 | `stage_discovery` (#descoberta) | always | Etapa 2, gratuita e só quando necessária (D44): "é aqui que o seu problema vira um plano"; os 3 entregáveis (§5.2); "Custo: gratuita; só acontece quando o diagnóstico mostra que ela é necessária, e a duração é definida com você"; "Depois: com o plano em mãos, você decide se segue" | convicção | Link "Entenda a Sprint de Descoberta" → `/sprint-de-descoberta` |
| 7 | `stage_development` (#desenvolvimento) | always | Etapa 3, entregas a cada 2 semanas; mini-ciclo em 4 passos (a gente constrói → você recebe funcionando → você usa e comenta → próximo ciclo); "Você recebe: software funcionando, não apresentação de slide"; por que importa: você vê o progresso no próprio software e percebe cedo o que precisa de ajuste | redução de risco | — |
| 8 | `stage_support` (#sustentacao) | always | Etapa 4, contínua: depois que entra no ar, o sistema segue cuidado e evoluindo | objeção pós-entrega | Link → `/servicos/sustentacao` |
| 9 | `decide` | always | "Você decide com informação na mão": os 2 pontos de decisão, com destaque | redução de risco | Começar pelo diagnóstico gratuito → `/orcamento?origem=metodo-decide` |
| 10 | `comparison` | always | Tabela "Sem combinado × Com o método da Lemamon.dev", em 5 linhas: Preço ("a partir de", dado antes de entender o problema × fechado por escrito, antes do desenvolvimento) · Prazo (estimado no escuro × no plano, junto com o preço) · Escopo (lista de desejos × priorizado e validado com você antes de construir) · Acompanhamento (reunião de status e slide × software funcionando a cada 2 semanas) · Depois do lançamento (cada um por si × sustentação e evolução contínua); com o rascunho `answer_draft` de `codigoProprietario`, uma 6ª linha, Código (nem sempre é seu × é da sua empresa, por contrato; F01). Nunca nomeia concorrente. | convicção (material para o sócio) | — |
| 11 | `proof` | when_data `hasCases` (≥ 1) ou `hasTestimonials` | "O método na prática": 1–2 cases com a linha do tempo real e/ou 1 depoimento sobre o processo | prova | — |
| 12 | `engineering` | when_data `hasEngineering` | "Como a gente constrói": práticas preenchidas pelo dono (testes, CI/CD, code review, onde fica o repositório, documentação, passagem de conhecimento). Só rótulos e introdução no copy. | confiança técnica (Marcos) | — |
| 13 | `investment` | when_data `hasPricing` | §5.4, todas as linhas de desenvolvimento + `sustentacao` (a Descoberta, gratuita, aparece só como linha fixa) | objeção de preço | Pedir diagnóstico gratuito |
| 14 | `faq` | always | Na ordem de `how_we_work._notes.faq_composition` (`hww-faq.ts`). Do banco: `pay_before_development` (no lugar de `why_discovery_paid`, D44) · `how_long` · `wont_stall` · `diagnosis_commitment` · `need_tech_knowledge`; condicionais: `diagnosis_format` · `scope_change` · `code_ownership` · `discovery_plan_ownership` · `discovery_duration` · `skip_discovery` · `nda` · `other_cities` (auditoria SEO S05-7: a resposta para quem é de fora do Brasil, com a frase de entidade, S05-1) · `payment_terms`. Teto de 9 | objeção | — |
| 15 | `cta_final` | always | §5.5 (texto-guia: "O primeiro passo é gratuito e leva 45 minutos") | conversão | Pedir diagnóstico gratuito → `/orcamento?origem=metodo-final` |

**Notas de UI:** no mobile, o índice do hero vira uma fila de chips rolável; no desktop (≥ 1024px), um sumário lateral sticky com a etapa ativa em `aria-current`. Os blocos "Você recebe" seguem o mesmo padrão visual nas 4 etapas. Sem rituais, reuniões ou relatórios não confirmados. Da Descoberta, nenhuma duração: ela é definida com o cliente no diagnóstico (D44, revoga a D42). O ciclo do desenvolvimento é um SVG `aria-hidden` com o mesmo texto em lista.

---

### 6.3 Sprint de Descoberta (`/sprint-de-descoberta`) · copy `discovery_sprint`

**Propósito:** página da etapa 2, gratuita e só quando o diagnóstico mostra que é necessária (D44, 21/10/2026). Explica o que é, por que existe e o que o cliente leva. É o link que o comercial envia junto com a devolutiva, a peça que o comprador usa para mostrar ao sócio o que a Descoberta entrega e o destino de quem busca "discovery".
**Breadcrumb:** Início › Como trabalhamos › Sprint de Descoberta (BreadcrumbList).

| # | id | Visib. | Conteúdo | Papel | CTA |
|---|---|---|---|---|---|
| 1 | `hero` | always | eyebrow "Etapa 2 de 4" (mantido na revisão da D44: a condição "se for necessária" vem na microcopy e na tag da linha do método); H1 (texto-guia: "Sprint de Descoberta: escopo, prazo e preço fechados antes do desenvolvimento"); subtítulo: sem pagar nada, o problema vira escopo priorizado e plano com prazo e preço fechados; microcopy "O primeiro passo é o diagnóstico gratuito de 45 minutos. Nele, a gente define com você se a Descoberta, também gratuita, é necessária." (sem variante de duração, D44) | consideração | Começar pelo diagnóstico gratuito → `/orcamento?entrada=descoberta&origem=descoberta-hero`; secundário: "Tirar dúvidas no WhatsApp" |
| 1b | `already_diagnosed` | always | Faixa logo depois do hero (fora dele): "Já fez o diagnóstico e combinou com a gente a Sprint de Descoberta? Para marcar o início…", para quem chega pelo link que o comercial envia com a devolutiva; "responda pelo WhatsApp" é link com mensagem própria (`quote.whatsapp_messages.discovery_start`, D44; antes `discovery_proposal`) e o e-mail aparece com "Copiar". Sem WhatsApp, variante só com e-mail. A mesma frase volta no CTA final. (Onda 2, §15.5) | conversão (quem já fez o diagnóstico) | WhatsApp |
| 2 | `why_start_here` | always | H2 "Por que começar por aqui"; sem entender o problema, preço é chute, e a Descoberta, gratuita, troca o chute por preço fechado; tabela **Sem entender o problema / Com Descoberta** (legenda: "orçar sem entender o problema" × "começar pela Sprint de Descoberta"; não "Sem Descoberta", porque quem não precisa dela também recebe escopo, prazo e preço fechados, como diz o FAQ `when_discovery` na mesma página), em 4 linhas: orçamento por estimativa × preço fechado com escopo priorizado · escopo discutido no meio do projeto × o que entra e o que fica de fora decidido antes · prazo estimado antes de conhecer o escopo × fechado no plano, junto com o preço (no lugar da linha do protótipo, D44) · projeto inteiro aprovado sobre uma estimativa × você decide se segue com escopo, prazo e preço fechados na mão | objeção "por que uma etapa antes de construir?" | — |
| 3 | `deliverables` | always | H2 "O que você recebe"; os 3 entregáveis (§5.2) com 1 frase cada; com `hasCases`, link de texto "Veja nos cases como a Descoberta entrou em projetos reais" → `/cases` (auditoria SEO S03-8; não diz que a Descoberta desses projetos foi gratuita) | concretude + prova | Link → `/cases` |
| 4 | `who_for` | always | H2 "Para quem é"; 4 perfis: tem um problema e não sabe o que construir · tem uma ideia ou uma lista de funcionalidades e não sabe o que vem primeiro · recebeu orçamentos muito diferentes e não sabe em qual confiar · precisa de um número confiável para aprovar com sócios ou diretoria | fit | — |
| 5 | `where_it_fits` | always | H2 "Antes e depois da Descoberta"; linha do método com a etapa 2 em destaque. Antes: diagnóstico gratuito de 45 minutos, com devolutiva por escrito, em que se define com você se a Descoberta é necessária e quanto ela dura. Depois: você decide se segue; se seguir, o desenvolvimento, a primeira etapa paga, com entregas a cada 2 semanas | redução de risco | — |
| 6 | `how_it_happens` | when_data `hasDiscoveryFormat` | H2 "Como ela acontece"; formato, participantes e ritmo vindos de `descoberta.ts`; a intro diz que a duração é definida com você no diagnóstico (D44) | redução de risco | — |
| 7 | ~~`investment`~~ | — | Saiu em 21/10/2026 (D44): a Descoberta é gratuita e não tem faixa de preço. | — | — |
| 8 | `faq` | always | Nesta ordem: `discovery_cost` ("Nada") · `when_discovery` ("Toda empresa precisa da Sprint de Descoberta?") · [`discovery_duration`, sem número] · `obliged_to_continue` · `need_scope_ready` · [`discovery_plan_ownership`]. Saíram `why_discovery_paid` e `discovery_credit` (D44) | objeção | — |
| 9 | `cta_final` | always | §5.5 (texto-guia: "A Descoberta começa por uma conversa gratuita") | conversão | Pedir diagnóstico gratuito → `/orcamento?entrada=descoberta&origem=descoberta-final` |

---

### 6.4 Serviços — hub (`/servicos`) · copy `services.hub`

| # | id | Visib. | Conteúdo | Papel | CTA |
|---|---|---|---|---|---|
| 1 | `hero` | always | H1 "O que a Lemamon.dev desenvolve"; subtítulo: sistemas web, aplicativos, integrações, MVPs e sustentação, todos com escopo, prazo e preço combinados antes de começar. Curto, para a lista aparecer na primeira rolagem do mobile. | consideração | Pedir diagnóstico gratuito → `/orcamento?origem=servicos-hero` |
| 2 | `list` | always | 5 cards: nome, "Para quando…" (1 frase), 3 exemplos curtos e "Ver como funciona" | navegação + SEO interno | cada card → `/servicos/[slug]` |
| 3 | `same_method` | always | H2 "Qualquer que seja o projeto, o mesmo método"; linha do método compacta; link | diferenciação | Ver como trabalhamos → `/como-trabalhamos` |
| 4 | `investment` | when_data `hasPricing` | §5.4 com todas as linhas | objeção de preço | — |
| 5 | `cta_final` | always | §5.5 (texto-guia: "Não sabe qual é o seu caso? O diagnóstico gratuito serve para isso.") | conversão | Pedir diagnóstico gratuito → `/orcamento?origem=servicos-final` |

---

### 6.5 Serviços — template `/servicos/[slug]` · copy `services.template` + `services.{slug}`

Um único componente alimentado por dados por slug, com 5 páginas. Cada uma precisa de pelo menos 70% de texto próprio (sinais, exemplos, decisões da Descoberta, fatores de preço, FAQ). Também são as páginas de destino de Ads por tema. JSON-LD: Service + BreadcrumbList + FAQPage.

**Seções do template, em ordem:**

| # | id | Visib. | Propósito | Papel | CTA |
|---|---|---|---|---|---|
| 1 | `hero` | always | breadcrumb "Início › Serviços › {serviço}"; eyebrow "Serviço"; H1 com a keyword; subtítulo (até 140 caracteres) que une o serviço ao método; microcopy "Sem compromisso · 45 minutos · devolutiva por escrito" (F41). No MVP (F01, F12): com `confirmacoes.nda`, " · NDA se você pedir" no fim da microcopy, e abaixo dela o link terciário "Quanto custa e quanto tempo leva um MVP? ↓" para `#perguntas` (`cta_click`, origem `mvp-hero-preco`) | atenção + conversão | Pedir diagnóstico gratuito → `/orcamento?servico={slug}&origem={slug}-hero`; secundário WhatsApp ("Olá! Vim pela página de {serviço} da Lemamon.dev.") |
| 1b | `commitments` | always | Faixa de compromissos (§5.3) logo depois do hero, com o selo "São Paulo, SP". Nas 4 páginas de projeto, os 4 itens (o 4º é o código do cliente, com `codigoProprietario`; §5.3); em sustentação, só "Sustentação e evolução depois que entra no ar" (os outros 3 descrevem o método de projeto). Regra antes de qualquer campanha de Ads nestas páginas. (Onda 2, §15.5) | confiança imediata | — |
| 2 | `signals` | always | H2 "Faz sentido quando…"; 4–5 sinais na voz do cliente | identificação | — |
| 3 | `examples` | always | H2 **"Exemplos do que dá para construir"** (nunca "o que já construímos" enquanto não houver case); 4–7 exemplos tirados do escopo atual do wizard | consideração | — |
| 4 | `how_it_works` | always | H2 "Como funciona um projeto de {serviço}"; as 4 etapas em uma linha contextualizada cada (linha do método compacta, com a linha de cada etapa dentro dela: prop `notes`); bloco **"O que fica definido antes do desenvolvimento"** (3–4 decisões; antes "O que a Sprint de Descoberta define", trocado na revisão da D44 porque a Descoberta só acontece quando necessária); nas 4 páginas de projeto, faixa "Onde você decide" e link de texto "Começar pelo diagnóstico gratuito" (`?origem={slug}-metodo`); com `hasEngineering`, link "Como a gente constrói" → `/como-trabalhamos#como-construimos` | diferenciação | Ver como trabalhamos → `/como-trabalhamos` |
| 5 | `price_factors` | always (exceto sustentação) | H2 "O que pesa no preço de {um sistema / um aplicativo / uma integração / um MVP}"; fatores com 1 linha cada, sem nenhum valor; fecho "A gente pesa cada ponto no seu caso e fecha prazo e preço antes do desenvolvimento, sem cobrar nada até lá."; link → `/quanto-custa` | objeção de preço + régua para comparar | — |
| 6 | `investment` | when_data linha `desenvolvimento.{slug}` | §5.4 filtrado, com a linha fixa da Descoberta gratuita; nota "Referência, não proposta." e o preço fechado antes do desenvolvimento | objeção de preço | Pedir diagnóstico gratuito → `/orcamento?servico={slug}` |
| 7 | `related_cases` | when_data ≥ 1 case com a tag | H2 "Projetos de {serviço}"; 1–3 cards | prova | Ver todos os cases → `/cases` |
| 8 | `faq` | always | Perguntas próprias, do banco e condicionais intercaladas na ordem de `services._notes.faq_composition` (cada serviço tem o seu `how_long_*`), teto de **11** (`SERVICE_FAQ_MAX`; o resto do site fica em 9) com a ordem de remoção **de cada página** (`SERVICE_FAQ_REMOVAL`). Auditoria SEO S03-10 (22/10/2026): com 9, o teto cortava as perguntas próprias do serviço (texto de cauda longa); com os dados de hoje nenhuma sai. Sustentação responde NDA e propriedade do código logo depois do preço (S03-6). Auditoria de conversão (21/10/2026): NDA em sistemas web, aplicativos e MVP sem sair pelo teto (F01); em integrações, "Vocês assinam NDA? E quem acessa os dados dos meus sistemas?" (`data_access`) perto do topo (F15); no MVP, preço e prazo nas duas primeiras perguntas (F12). Em "sistema sob medida ou pronto", "app ou web", "integrar ou trocar" e "dá para integrar com o que eu uso", o trecho "diagnóstico gratuito" vira link para `/orcamento?servico={slug}&origem={slug}-faq` sem mudar o texto | objeção | — |
| 9 | `other_services` | always | 3–4 links para os outros serviços, com 1 linha cada | retenção + SEO interno | — |
| 10 | `cta_final` | always | §5.5 com título contextual (ex.: "Conte o processo que precisa virar sistema.") | conversão | Pedir diagnóstico gratuito → `/orcamento?servico={slug}&origem={slug}-final` |

**Conteúdo por slug (insumo para o copy):**

**`sistemas-web`** · H1 "Desenvolvimento de sistemas web sob medida para empresas" · keyword: desenvolvimento de sistemas web para empresas, com "web" desde a auditoria SEO S06-6 (secundárias: sistema sob medida, ERP sob medida, CRM sob medida, portal do cliente)
- Sinais: a planilha virou o sistema da empresa e só uma pessoa sabe mexer · a mesma informação é digitada em dois lugares e alguém sempre erra · o software pronto obriga a equipe a contornar o processo · ver os números da operação exige montar relatório na mão · clientes ou fornecedores pedem um portal, e hoje tudo vai por e-mail.
- Exemplos: gestão financeira (pagamentos, fluxo de caixa, relatórios) · gestão de clientes (CRM) · estoque e pedidos · painéis e indicadores de gestão · painel administrativo · portal ou área do cliente · plataforma de treinamento e cursos.
- A Descoberta define: quais processos entram primeiro · perfis de acesso e permissões · relatórios essenciais · integrações necessárias.
- Pesa no preço: quantidade de módulos e processos · tipos de usuário e permissões · regras de negócio e cálculos · integrações com outros sistemas · dados que precisam vir de planilhas ou de sistemas antigos · relatórios.
- FAQ próprio: Sistema sob medida ou software pronto? (franca: se o pronto atende, costuma ser mais barato, e o diagnóstico ajuda a decidir) · Dá para começar por uma parte do sistema? (o escopo é priorizado com você antes do desenvolvimento, e as entregas seguem essa ordem) · Quanto custa um sistema sob medida? Condicional: `migracaoDados` (Vocês migram os dados da planilha ou do sistema atual?).

**`aplicativos`** · H1 "Desenvolvimento de aplicativos sob medida para empresas" · keyword: desenvolvimento de aplicativos sob medida, no plural desde a auditoria SEO S06-6 (secundárias: criar aplicativo para empresa, aplicativo iOS e Android, quanto custa desenvolver um aplicativo)
- Sinais: seus clientes já pedem para resolver pelo celular · a equipe em campo anota no papel ou no WhatsApp e digita depois · pedidos, reservas ou agendamentos chegam por mensagem e se perdem · você quer lançar um produto que vive no celular.
- Exemplos: guia e reservas · transporte e delivery · e-commerce e marketplace · app para processos internos da equipe · app de comunidade e relacionamento. Recursos comuns: notificações, pagamento e integrações, painel administrativo e publicação nas lojas da Apple e do Google (**pode fazer parte do escopo**, definido com você antes do desenvolvimento).
- A Descoberta define: iOS, Android ou os dois · o que fica no app e o que fica no painel · notificações · publicação nas lojas.
- Pesa no preço: uma ou duas plataformas · quantidade de telas e fluxos · login e tipos de usuário · integrações (pagamento, mapas, sistemas da empresa) · notificações · painel administrativo · uso sem internet.
- FAQ próprio: App ou sistema web? (depende de quem usa e onde; o diagnóstico ajuda a decidir) · iOS, Android ou os dois? (definido com você antes do desenvolvimento, conforme quem vai usar) · Vocês publicam nas lojas? (pode fazer parte do escopo) · Quanto custa desenvolver um aplicativo?

**`integracoes`** · H1 "Integração de sistemas e automação de processos" · keyword: integração de sistemas (secundárias: integração ERP e e-commerce, automação de processos, chatbot para empresas)
- Sinais: a mesma informação é digitada em dois ou três sistemas · o pedido do e-commerce não chega sozinho no ERP · alguém passa o dia copiando dados entre ferramentas · tarefas repetitivas de atendimento ocupam a equipe · cada área tem um número diferente para a mesma coisa.
- Exemplos: sistemas que você já usa conectados entre si (ex.: ERP e e-commerce, por API ou webhook, ou por troca de arquivos quando um sistema não tem API) · meios de pagamento · ferramentas de marketing e CRM · automação de tarefas repetitivas · chatbot de atendimento, de vendas ou de uso interno · IA para automação de processos e análise de dados · sensores e equipamentos conectados ao sistema (auditoria SEO S07-10, apoiado nos cases de indústria; nenhuma plataforma pelo nome sem o dono confirmar).
- A Descoberta define: quais sistemas entram · em que direção e com que frequência os dados circulam · o que fazer quando um dos lados falha.
- Pesa no preço: quantidade de sistemas · se cada sistema permite conexão e como ela está documentada (explicar "API" como "a porta de conexão de um sistema") · volume e frequência dos dados · regras para transformar os dados · tratamento de falhas e reprocessamento · painel para acompanhar o que foi sincronizado. Frase de apoio: "Integração é algo vivo: os sistemas mudam, e alguém precisa cuidar."
- FAQ próprio: Dá para integrar com o sistema que eu já uso? (depende do que ele permite; isso é verificado antes de combinar escopo e preço) · Integrar ou trocar de sistema? (o diagnóstico existe para essa decisão) · Quanto custa uma integração?

**`mvp`** · H1 "Desenvolvimento de MVP: a primeira versão do seu produto nas mãos de usuários reais" · keyword: desenvolvimento de MVP (secundárias: criar MVP para startup, desenvolvimento de produto digital)
- Sinais: a ideia foi validada em conversas, mas ainda não existe produto · existe uma data (captação, piloto, cliente-âncora) · você precisa de uma primeira versão para mostrar a clientes ou investidores · já tentou com outro fornecedor ou freelancer e o projeto parou · você precisa saber o que cortar para caber no orçamento.
- Exemplos: plataforma web · aplicativo · marketplace · plataforma com IA · plataforma de cursos · painel administrativo para operar o produto, sempre na menor versão que prova a ideia.
- A Descoberta define: o que a primeira versão precisa provar · o que fica para depois · como saber se deu certo.
- Pesa no preço: tamanho do escopo da primeira versão · plataformas · integrações · painel administrativo · tipos de usuário.
- FAQ próprio: O que é um MVP, na prática? · O que entra na primeira versão? (abre pela definição de MVP, produto mínimo viável, auditoria SEO S03-7; o que entra é decidido com você antes do desenvolvimento: o escopo priorizado) · Quanto tempo leva um MVP? (o prazo é fechado antes do desenvolvimento, e a cada 2 semanas você tem uma parte funcionando) · E depois do MVP? (sustentação e evolução contínua a partir do uso real). Condicional: `code_ownership`.

**`sustentacao`** · H1 "Sustentação e evolução de software" · keyword: sustentação de sistemas (secundárias: manutenção de software, evolução de sistema)
- Sinais: o sistema entrou no ar e a operação já pede melhorias · pequenas melhorias ficam meses na fila · erros e instabilidade atrapalham a operação · você precisa de alguém cuidando do sistema de forma contínua.
- Seção **`how_it_starts`** ("Por onde começa"), depois de `how_it_works` (Onda 2, §15.5).
- Seção própria no lugar de `price_factors`: **`what_it_is`** ("Sustentação e evolução, o que é cada uma": sustentação = cuidar do que está no ar para a operação não parar; evolução = continuar melhorando conforme o negócio muda).
- Exemplos ("O que entra"): correções · atualizações · melhorias contínuas · novas funcionalidades.
- Bloco do `how_it_works` vira **"O que a gente combina antes de começar"**: o que está em produção · as prioridades de evolução · como você acompanha.
- Seção extra **`format`** · when_data `hasSupportFormat`: "Como funciona a sustentação", com o que inclui, como é contratada e os canais. Sem SLA, horas ou monitoramento enquanto o dono não preencher.
- `investment`: linha `sustentacao` (mensal).
- FAQ próprio: Qual a diferença entre sustentação e evolução? · Como começa? (pelo diagnóstico gratuito de 45 minutos, que entende o que está no ar e o que precisa de atenção primeiro). Condicionais: `third_party_system` (Vocês cuidam de sistemas que outra empresa desenvolveu?) e, logo depois do preço, `nda` e `code_ownership`, já confirmados (auditoria SEO S03-6).
- CTA: `/orcamento?servico=sustentacao` pré-marca a P1 = `maintain_live_system`.

---

### 6.6 Quanto custa (`/quanto-custa`) · copy `pricing`

**Propósito:** atender a busca nº 1 do comprador e transformar a falta de preço publicado em argumento do método. Funciona sem números e dá à compradora uma régua para comparar propostas. As faixas entram no topo quando `precos.ts` for preenchido.
**Title:** "Quanto custa um software sob medida? | Lemamon.dev".

| # | id | Visib. | Conteúdo | Papel | CTA |
|---|---|---|---|---|---|
| 1 | `hero` | always | H1 "Quanto custa um software sob medida?"; lead que responde pela afirmativa na primeira frase (auditoria F08, 21/10/2026): "O preço sai fechado antes do desenvolvimento, e nada é cobrado antes dele: o diagnóstico e a Sprint de Descoberta, quando necessária, são gratuitos. Com o preço do seu escopo em mãos, você decide se segue." (D44) A meta description abre pelos 7 fatores, não por "Depende". | atração + objeção | Pedir diagnóstico gratuito → `/orcamento?origem=preco-hero` |
| 2 | `ranges` | when_data `hasPricing` | §5.4 com todas as linhas, logo no topo | qualificação | — |
| 3 | `factors` | always | H2 "O que define o preço de um software"; 7 fatores (título + 1 linha): tamanho do escopo · tipos de usuário e permissões · regras de negócio e cálculos · integrações com outros sistemas · plataformas (web, iOS, Android) · dados existentes que precisam ser trazidos · prazo (com data fixa, o escopo é priorizado para caber até lá); H3 "E um aplicativo?" com 3–4 fatores e link → `/servicos/aplicativos` | educação | — |
| 4 | `why_not_by_form` | always | H2 "Por que a gente não dá preço por formulário"; um preço dado antes de entender o problema é chute, alto para cobrir o risco ou baixo e crescendo no meio do caminho | convicção (método) | — |
| 5 | `how_price_closes` | always | H2 "Como você chega a um preço fechado"; as 4 etapas com o custo de cada uma: Diagnóstico gratuito (45 min, devolutiva por escrito) · Sprint de Descoberta gratuita, se for necessária (D44), que termina no plano; quando ela não é necessária, prazo e preço são fechados do mesmo jeito, antes do desenvolvimento · Desenvolvimento com preço fechado antes de começar e entregas a cada 2 semanas (a régua `how_to_compare` diz "fechado por escrito, antes do desenvolvimento") · Sustentação e evolução contínua | convicção | Começar pelo diagnóstico gratuito |
| 6 | `how_to_compare` | always | H2 "Como comparar propostas de software"; 5–6 perguntas para fazer a **qualquer** fornecedor, com 1 linha de por quê: o que está fora do escopo? · o preço é fechado ou por hora? · quando eu vejo software funcionando? · o que acontece se o escopo mudar? · quem cuida depois do lançamento? · o que eu recebo antes de pagar pelo desenvolvimento? · de quem é o código no fim do projeto? (com o rascunho `answer_draft` de `codigoProprietario`, F37; 5 a 7 perguntas). A Home linka para esta seção no par "orçamentos impossíveis de comparar" dos riscos | régua de comparação (Cláudia) | — |
| 7 | `faq` | always | Do banco: `free_estimate` · `pay_before_development` (no lugar de `why_discovery_paid`, D44) · `no_price_table` · `reference_before_talking` (variante escolhida no build pelo `hasPricing`) | objeção | — |
| 8 | `cta_final` | always | §5.5 (texto-guia: "Descubra o caminho até o preço fechado do seu projeto") | conversão | Pedir diagnóstico gratuito → `/orcamento?origem=preco-final` |

---

### 6.7 Orçamento — página do wizard (`/orcamento`) · copy `quote`

**Propósito:** página de conversão. Recebe o 301 de `/projects` e é onde o Ads registra a conversão. A casca é HTML estático e indexável, e a ilha React (`client:load`) cuida das perguntas.
**Title:** "Orçamento de software sob medida: comece pelo diagnóstico gratuito | Lemamon.dev". **Description:** cita "orçamento" com honestidade e promete o diagnóstico de 45 min.
**Header reduzido** em toda a rota (§8.4) e footer mínimo (Política de Privacidade + e-mail; com `hasCompanyData`, razão social · CNPJ numa linha própria; seletor de idioma numa linha própria, §9).

| # | id | Visib. | Conteúdo | Papel | CTA |
|---|---|---|---|---|---|
| 0 | `resume_banner` | quando existe rascunho (cliente) | "Você começou um pedido em {data}." [Continuar de onde parei] [Começar de novo]; `role=status`, acima do H1 | recuperação de abandono | Continuar de onde parei |
| 1 | `entry` | always | H1 "Orçamento de software: comece pelo diagnóstico gratuito"; subtítulo: "Preço fechado só existe com escopo fechado. Responda 6 perguntas de clique, veja o resumo do seu projeto e o caminho até o software rodando, e só então peça a conversa."; 3 marcadores: "Gratuito e sem compromisso" · "45 minutos" · "Devolutiva por escrito"; promessa explícita: "Você vê o resumo antes de deixar qualquer contato."; linha de contexto quando houver `?servico=`: "Você veio pela página de {serviço}. Já deixamos isso marcado." | conversão (expectativa) | **Começar** → etapa 1; link "Prefere conversar direto? Falar no WhatsApp" |
| 2 | `quick_faq` | always (some depois de "Começar") | **Antes do primeiro clique**, `<details>` sob o botão: "Vou receber um preço no fim?" (você recebe o resumo e o caminho; prazo e preço fechados saem de um escopo bem definido, o seu, se ele já bastar, ou o da Sprint de Descoberta, que é gratuita e só acontece quando o diagnóstico mostra que é necessária; com `hasPricing`, "…e uma faixa de referência") · "O diagnóstico é gratuito mesmo?" · "Preciso saber tudo sobre o projeto para responder?" (não, há "Ainda não sei" onde faz sentido) · "O que vocês fazem com os meus dados?" | objeção | — |
| 3 | `after_send` | always (some no modo foco) | H2 "O que acontece depois que você envia"; 3 passos: a gente fala com você para marcar o horário (com `hasAgenda`: "ou você escolhe o horário na hora") → 45 minutos de conversa → devolutiva por escrito; logo abaixo dos passos, os compromissos (§5.3) em linha compacta; se fizer sentido seguir, a necessidade da Sprint de Descoberta, que é gratuita, é definida com você (variante própria com `?servico=sustentacao`); o botão "Começar" repetido e o link → `/como-trabalhamos` | confiança | Começar |
| 4 | `wizard` | always | Ilha React (§7) | qualificação + conversão | Pedir meu diagnóstico gratuito |

### 6.8 Pedido enviado (`/orcamento/enviado`) · copy `quote.sent` · noindex

Página estática separada. Lê o resumo do `sessionStorage` e tem uma versão genérica (sem nome) quando o storage está vazio. É o ponto de medição por URL da conversão (§10.3). O conteúdo detalhado está em §7.8.

### 6.9 Contato (`/contato`) · copy `contact`

**Propósito:** atender quem procura "Contato" por hábito, parcerias, NDA ou questionário de segurança, ou assunto de sistema existente, sem sujar a fila qualificada do wizard.

| # | id | Visib. | Conteúdo | Papel | CTA |
|---|---|---|---|---|---|
| 1 | `hero` | always | H1 "Fale com a Lemamon.dev"; subtítulo: para projeto novo, o caminho mais rápido é o diagnóstico gratuito; para o resto, escolha o canal | conversão | Pedir diagnóstico gratuito → `/orcamento?origem=contato`; WhatsApp |
| 2 | `channels` | always | Cards: Diagnóstico gratuito (selo "recomendado para projetos"; 45 minutos, devolutiva por escrito) · WhatsApp (botão, sem número) · E-mail lemamon.dev@gmail.com (texto + "Copiar") · LinkedIn · GitHub · Medium numa linha de links depois dos cards (auditoria F14: perfil ainda vazio não ganha card antes do formulário) · "São Paulo, SP, Brasil" | confiança | — |
| 3 | `form` | always | H2 "Prefere escrever?"; campos: Nome*, E-mail*, WhatsApp (opcional), Assunto* (Projeto novo · Sistema que já existe · Parceria · Outro), Mensagem*; honeypot; aviso LGPD; botão "Enviar mensagem". Se o assunto for "Projeto novo", aparece a dica inline "Para projeto novo, o diagnóstico gratuito é mais rápido →". Sucesso: "Mensagem recebida. A gente responde no e-mail informado." (sem prazo). Erro: dados preservados, com "Tentar de novo", WhatsApp e e-mail. | conversão secundária | Enviar mensagem |

Netlify Forms `contato`, separado do `briefing` (§7.10). Labels visíveis, `autocomplete`, validação no blur, botão sempre habilitado.

### 6.10 Cases (`/cases`, `/cases/[slug]`) · copy `cases` · when_data

**Hub** (`hasCases` ≥ 2): `hero` (H1 "Projetos que já estão rodando"; intro: o problema, o que foi combinado, o que foi entregue e o que mudou) → `filters` (chips por serviço, só com ≥ 6 cases e só os que têm resultado; sem JS, todos aparecem) → `grid` (card §5.7) → `cta_final` (título "Quer algo parecido?").

**Case** (por case publicado; schema Zod exige os campos):
1. `hero`: breadcrumb com o nome do projeto (`seoTitle` ou `tipoDeSistema`; auditoria de SEO S02-10); cliente ou setor+porte no eyebrow; H1 orientado ao problema resolvido; ficha em `<dl>` só com dados fornecidos (setor, porte, serviço, etapas contratadas, período), com cada serviço linkando a página do serviço e cada etapa a sua seção do método (a Descoberta, a página da Sprint; S03-4, S06-9); imagem real; no case anonimizado sem termo (D45), capa ilustrada do tipo de sistema, sem aviso visível, com alt "Ilustração de…".
2. `problem`: "O problema", 2–3 frases na linguagem do cliente.
3. `agreed`: "O que foi combinado", com escopo priorizado, o que ficou de fora e prazo e preço do plano (se autorizado).
4. `built`: "O que construímos", em português de negócio, com imagens reais (alt descritivo) (no case sem termo, D45, não há tela; só a capa ilustrada).
5. `how_it_went`: "Como foi", linha do tempo real nas 4 etapas, com datas desse projeto.
6. `result`: "O resultado", até 3 métricas antes→depois, verificáveis e autorizadas (opcional).
7. `testimonial`: when_data, nominal.
8. `tech_sheet`: **"Ficha técnica"**, com a stack usada no projeto e o link do produto no ar, se público (avaliador técnico).
9. `cta_final`: "Quer algo parecido?" → `/orcamento?ref={slug}&servico={tag}`; WhatsApp "Vim pelo case {nome}"; 2 cases relacionados.

### 6.11 Sobre (`/sobre`) · copy `about` · when_data `hasTeam`

Só vai ao ar com pelo menos 1 pessoa completa (foto, nome, papel). Sem pessoas, a página confirmaria a suspeita "é freelancer?". Até lá, a cidade (São Paulo, SP) e os perfis ficam no footer, em `/contato` e na Home (`trust_profiles`).
1. `hero`: H1 "Quem é a Lemamon.dev"; subtítulo do dono; São Paulo, SP.
2. `beliefs`: "No que a gente acredita", 4 pares crença → prática ligados ao método (preço sem entender o problema é chute → o preço do desenvolvimento só sai depois de entender o problema e fechar o escopo; progresso se mede em software funcionando → entregas a cada 2 semanas; software no ar continua precisando de cuidado → sustentação e evolução; a primeira conversa tem que valer por si → diagnóstico gratuito com devolutiva por escrito).
3. `story`: when_data (texto do dono), "Por que a gente trabalha assim".
4. `team`: cards completos.
5. `company`: when_data `hasCompanyData`, com razão social, CNPJ e cidade (JSON-LD Organization).
6. `profiles`: os 3 perfis.
7. `cta_final`.

**JSON-LD (auditoria SEO S03-1, S05-2):** Organization + uma `Person` por pessoa da seção Time (`@id` https://lemamon.dev/sobre#{id} nos 3 idiomas, `name`, `jobTitle` = papel no idioma, `image` = a foto processada, `sameAs` = LinkedIn e GitHub pessoais, `worksFor` pelo `@id` da Organization); a Organization liga cada pessoa em `employee` por `@id`. Sem `founder`: nenhum campo de `dados/dono.json` diz quem fundou. O código está pronto e só emite com `hasTeam` (a própria página só existe com ele).

### 6.12 Blog (`/blog`, `/blog/[slug]`) · copy `blog` · when_data `hasPosts` · só pt-BR

Para dois públicos: quem vai contratar software (fundo de funil) e o avaliador técnico (conteúdo técnico de verdade, "escrito por quem constrói"). Hub: H1, 1 frase, cards (título, resumo, autor real, data). Post: H1, autor (nome, foto, link), datas de publicação e atualização, corpo, 1 CTA contextual no meio e 1 no fim (sempre o diagnóstico), 2–3 posts relacionados, link para o serviço ou o método correspondente. JSON-LD Article. Republicação no Medium com canonical para lemamon.dev. Pauta inicial, escrevível sem números: "Sistema pronto ou sob medida: como decidir" · "O que você deveria receber de uma Sprint de Descoberta" · "Preço fechado ou por hora: o que muda para quem contrata" · "Como escolher uma empresa de desenvolvimento de software" · "Entregas a cada 2 semanas: o que você deveria ver funcionando". O tema "quanto custa" fica em `/quanto-custa` e não vira post. Enquanto o blog não existir, `/blog` responde 302 → `/`.

### 6.13 Política de Privacidade (`/privacidade`) · copy `privacy`

H1, data de atualização (só com `privacidade.atualizadaEm`; sem ela, a seção de contato não promete "a data no topo", variante `contact.body` × `contact.body_with_date`, auditoria SEO S03-14), sumário de âncoras e seções: quem controla os dados (Lemamon.dev e lemamon.dev@gmail.com; razão social e CNPJ via `empresa.ts`) · dados coletados pelos formulários (wizard e contato: nome, e-mail, telefone/WhatsApp, empresa, respostas, mensagem) · dados de navegação (Google Analytics 4, Google Ads, New Relic Browser com sessão mascarada) · finalidades (responder ao pedido e conduzir a conversa; medir o site) · base legal · operadores (Netlify para hospedagem e formulários, Google, New Relic; WhatsApp/Meta quando o visitante clica) · retenção (definida pelo dono) · direitos do titular (LGPD art. 18) e como exercer · contato. **Revisão jurídica antes de publicar.** Ferramentas opcionais que recebem dados dos pedidos (agenda online, CRM ou planilha na nuvem, e-mail de acompanhamento, automação/webhook do Netlify Forms, chat da equipe) já têm item de operador e de retenção escrito; cada um só aparece quando o dono declara a ferramenta em `privacidade.ts › ferramentas` com fornecedor e prazo, e ligar `agenda.ts` sem declarar a agenda trava o build de produção. A trava geral (`privacyLaunchBlockers()`) está ligada: o build de produção falha enquanto faltar controlador, base legal de anúncios, encarregado, prazos ou data.

### 6.14 404 · copy `shared.not_found`

H1 "Esta página não existe"; 1 frase ("O endereço pode ter mudado. Estes caminhos podem ajudar:"); links Início · Como trabalhamos · Serviços · Quanto custa; CTA primário; WhatsApp. Evento `page_not_found {path}`, para descobrir os redirects que faltam.

---

## 7. Wizard — especificação completa

### 7.1 Rota, estado, entradas

- **Rota única** `/orcamento` (`/en/quote`, `/es/cotizacion`). O passo fica em `?etapa=` (`1`…`6`, `resumo`, `contato`) via `history.pushState`: o voltar do navegador funciona, sem rewrite e sem URL falsa por passo.
- **Pós-envio** em página estática separada: `/orcamento/enviado`.
- **Entradas e pré-marcação** (a pergunta pré-marcada continua aparecendo para confirmação, então o total de passos não muda):
  - `?servico=sistemas-web|aplicativos|integracoes|mvp` pré-marca a P2 (`ops_system`+`client_platform` | `mobile_app` | `integration`+`automation` | `mvp`).
  - `?servico=sustentacao` pré-marca a P1 = `maintain_live_system`.
  - `?ref={slug-do-case}` pré-marca a P2 pela tag do case.
  - `?entrada=descoberta` não pré-marca nada; vai para a atribuição.
  - `?origem={pagina-secao}` é a atribuição do CTA clicado.
  - Com `?servico=` ou `?ref=`, a linha de contexto ("Já deixamos marcado o que mais combina com {serviço}. Dá para mudar.") aparece na entrada **depois** do botão "Começar as 6 perguntas" e do link de WhatsApp, e no topo da pergunta pré-marcada. Antes do botão, ela o empurrava para baixo da dobra a 360×640 e 390×664 justamente no tráfego dos anúncios (auditoria de conversão F03).
- Na entrada, a ilha captura `utm_source/medium/campaign/term/content`, `gclid`, `referrer`, a página de entrada, `origem`, `servico`, `ref`, `entrada` e o idioma, e grava tudo no rascunho.
- **Persistência:** `localStorage` com a chave `lemamon:orcamento:v2` (respostas, passo atual, atribuição, idioma, timestamp), gravado a cada mudança, com TTL de 30 dias e tudo em try/catch: sem storage, o fluxo funciona e só não retoma. O rascunho é apagado **só depois do sucesso confirmado**. O resumo do envio vai para `sessionStorage`, para a página de pós-envio ler. O contato digitado (nome, e-mail, canal, telefone, empresa, detalhes) nunca vai para o `localStorage`: fica em `sessionStorage` (`lemamon:orcamento:contato:v1`, 300 ms depois da última tecla) para sobreviver a um recarregamento, e sai no envio confirmado e no "Começar de novo" (auditoria F24).
- **Retomada global:** com rascunho válido, o CTA do header e o da barra fixa mobile viram **"Continuar meu pedido"** e levam ao último passo. A troca é feita por um script inline síncrono logo após o header, que troca só o texto do botão (largura fixa, sem flash e sem layout shift).

### 7.2 Mecânica das telas

- Uma pergunta por tela. Header em modo foco: logo (→ `/`, com o progresso salvo), "Pergunta N de 6" com barra (`role=progressbar`, `aria-valuetext`) e o link "Dúvidas? WhatsApp". O WhatsApp flutuante e a barra fixa mobile ficam ocultos. A barra conta **8 passos** (as 6 perguntas, o resumo e o contato até o envio; `aria-valuemax` 8): P6 = 75%, resumo ≈ 87%, contato ≈ 95%, e 100% só depois do envio. Antes, P6, resumo e contato marcavam 100% e o contato parecia um passo a mais (auditoria F21). O texto continua "Pergunta N de 6".
- Cada pergunta é um `<fieldset>` cuja `<legend>` é o título visível; o texto de apoio fica ligado por `aria-describedby`. As opções são `<input type=radio|checkbox>` **nativos**, estilizados como cartões de largura total, com área de toque ≥ 56px e seleção indicada por ícone de check, borda dupla e fundo, nunca só por cor (o peso do texto saiu na auditoria de conversão F22: em negrito, a opção marcada quebrava em mais linhas e empurrava as outras).
- **Sem avanço automático** (WCAG 3.2.2): sempre há "Continuar", que fica sempre habilitado. Sem seleção, aparece um erro (`aria-invalid` nas opções, foco na primeira opção e o texto na região `aria-live`). O texto visível fica na nota da barra de ação, logo abaixo do "Continuar", em vermelho e negrito; o aviso "Você já marcou 3" da P3 também. No fluxo, atrás da barra fixa, ninguém via o erro (auditoria F05). "Voltar" preserva as respostas.
- **Trava de duplo clique:** um clique de ponteiro nos primeiros 400 ms de uma tela nova (700 ms no contato) é o 2º clique de um duplo clique da tela anterior e é ignorado; Enter e Espaço nunca são travados. Sem a trava, o 2º clique marcava uma opção não escolhida (desktop), pulava a P3 (celular) ou caía no envio do contato, que fica quase no mesmo lugar do botão do resumo (auditoria F06 e F21).
- Multisseleção: contador "N selecionadas"; "Ainda não sei" é exclusiva (marcá-la desmarca as outras e vice-versa). A P3 tem o limite "até 3" e é opcional: "Continuar" sem nada marcado vale como pular (`wizard_skip`), e o texto de apoio diz isso ("Se nada disso pesa hoje, é só tocar em Continuar"). O botão "Pular" solto saiu na auditoria de conversão F22 (no celular ele ficava atrás da barra fixa). Na P3, o contador "Selecionadas: N de 3" fica logo abaixo do texto de apoio, no topo da pergunta.
- A cada passo: `document.title` = "Pergunta N de 6 · Orçamento | Lemamon.dev"; o foco vai para a legend; uma região `aria-live=polite` anuncia o passo.
- No mobile: barra de ação fixa no rodapé com "Voltar" (texto, à esquerda) e "Continuar" (primário, ~70%). Respeita a safe-area e some com o teclado aberto (a altura dela continua valendo no `scroll-padding`, para o campo trazido à tela não ficar atrás da barra quando o teclado fecha). No desktop (≥ 768px, com altura útil a partir de 34em), a barra gruda no rodapé (`position: sticky`) e o "Continuar" das P2–P5 não fica abaixo da dobra no notebook (auditoria F04). O contato continua numa coluna só. Transições respeitam `prefers-reduced-motion`.
- Ramificação mínima: **N é sempre 6**. As variações são só de texto ou de conjunto de opções (P2, P3, P5), nunca pulam uma pergunta.

### 7.3 Perguntas (ids estáveis em inglês, snake_case)

**P1 — `stage`** · seleção única · obrigatória
Pergunta: "Em que ponto você está?" · Apoio: "Não existe resposta errada. Isso só muda por onde a conversa começa."

| id | Opção |
|---|---|
| `problem_unclear` | Tenho um problema na operação, mas ainda não sei o que construir |
| `product_idea` | Tenho uma ideia de produto e quero tirar do papel |
| `scope_defined` | Já sei o que precisa ser construído e quero começar |
| `evolve_live_system` | Já tenho um sistema ou produto no ar e quero evoluir |
| `maintain_live_system` | Já tenho um sistema no ar e preciso de quem cuide dele |

Propósito: estágio e maturidade. Define a etapa enfatizada no resumo, o texto da P2, o conjunto de opções da P3 e a variante da P5. Mapeamento aproximado de persona: problema ≈ Cláudia, ideia ≈ Rafael, definido/evoluir ≈ Marcos. `problem_unclear` já é a saída de quem "ainda não sabe". `maintain_live_system` **não promete** assumir sistema de terceiros: o diagnóstico avalia (o FAQ `third_party_system` é condicional).

**P2 — `build_type`** · multisseleção · obrigatória
Pergunta: "O que você precisa construir?" · variante quando a P1 ∈ {`evolve_live_system`, `maintain_live_system`}: "Que tipo de sistema você tem hoje?" · Apoio: "Pode marcar mais de uma. Se ainda não sabe, tudo bem: descobrir isso é trabalho da Sprint de Descoberta."

| id | Opção |
|---|---|
| `ops_system` | Sistema para a operação da empresa (gestão, ERP, CRM, estoque, financeiro, painéis) |
| `client_platform` | Portal ou plataforma para os seus clientes (área do cliente, e-commerce, marketplace, agendamento, cursos online) |
| `mobile_app` | Aplicativo para celular (iOS e Android) |
| `integration` | Integração entre sistemas que você já usa |
| `automation` | Automação de tarefas ou atendimento (inclusive com chatbot ou IA) |
| `mvp` | Produto digital novo ou MVP |
| `not_sure` | Ainda não sei — quero ajuda para definir (exclusiva) |

Propósito: fit técnico e roteamento (tópicos do resumo, fatores, faixas quando houver, cases relacionados, serviço no CRM). Cobre as 7 categorias atuais do `data.json` em linguagem de negócio. Saem do wizard o "cardápio de cargos" (UX/UI, Front-end, Back-end), as "opções adicionais" que inflavam o escopo antes da Descoberta e "site/landing page", que está fora da lista confirmada.

**P3 — `pain`** (quando a P1 ∉ {`evolve_live_system`, `maintain_live_system`}) · multisseleção, até 3 · **opcional (Continuar sem marcar vale como pular)**
Pergunta: "O que mais pesa hoje?" · Apoio: "Marque até 3. Isso vira o roteiro da nossa conversa."

| id | Opção |
|---|---|
| `manual_process` | Processo manual, em planilha, papel ou WhatsApp, que depende de uma pessoa |
| `double_entry` | A mesma informação é digitada em mais de um lugar |
| `disconnected_tools` | As ferramentas que a gente usa não conversam entre si |
| `off_the_shelf_misfit` | O software pronto que usamos não atende o nosso processo |
| `late_numbers` | Números e relatórios chegam tarde ou não batem |
| `customer_channel` | Clientes ou parceiros pedem um canal digital |
| `new_product` | Preciso lançar um produto novo |
| `other` | Outro motivo — conto na conversa |

**P3 — `system_pain`** (quando a P1 ∈ {`evolve_live_system`, `maintain_live_system`}) · multisseleção, até 3 · opcional (Continuar sem marcar vale como pular)
Pergunta: "O que está pedindo atenção no sistema que você tem?" · Apoio: "Marque até 3."

| id | Opção |
|---|---|
| `errors_instability` | Erros ou instabilidade no que está no ar |
| `new_features` | Preciso de funcionalidades novas |
| `hard_to_maintain` | Está lento ou difícil de manter |
| `ongoing_care` | Preciso de alguém cuidando de forma contínua |
| `other` | Outro motivo — conto na conversa |

Propósito: a necessidade (o N do BANT), separando dor mensurável de "vontade de ter um app". Personaliza a pauta do diagnóstico e o resumo. `system_pain` separa cuidar de evoluir sem perguntar quem desenvolveu.

**P4 — `deadline`** · seleção única · obrigatória · campo opcional abaixo
Pergunta: "Quando isso precisa estar funcionando?" · Apoio: "Prazo é uma das três coisas que a gente combina antes de começar, então é bom saber o seu desde já."

| id | Opção |
|---|---|
| `asap` | O quanto antes — já está atrasado |
| `within_3_months` | Nos próximos 3 meses |
| `between_3_and_6_months` | Entre 3 e 6 meses |
| `over_6_months` | Daqui a mais de 6 meses |
| `not_defined` | Ainda não tenho prazo definido |

Campo `deadline_reason` (texto, opcional): "Existe alguma data que trava isso? (opcional)", com placeholder "Ex.: um evento, um contrato, uma temporada."
Propósito: timing (o T do BANT). São prazos **do cliente**, não promessa da Lemamon.dev. A data travante é o melhor sinal de urgência real e vai para a notificação do comercial.

**P5 — `budget`** · seleção única · obrigatória · **sem nenhum valor no copy**
- **Modo com faixas** (`hasBudgetTiers`): Pergunta "Quanto você pretende investir neste projeto?" · Apoio: "É uma referência para a conversa começar do tamanho certo. Não é orçamento nem compromisso: o preço fechado vem antes do desenvolvimento." Opções `tier_1`…`tier_4` com rótulos vindos de `qualificacao.ts`, por idioma (não são copy; o dono valida; os limites sugeridos nos documentos são o corte de MQL do README §7), mais as opções de copy `not_sure` ("Ainda não sei — quero entender o que é razoável") e `prefer_to_discuss` ("Prefiro conversar sobre isso no diagnóstico").
  - Variante quando a P1 = `maintain_live_system` e `hasMonthlyTiers`: "Quanto você pretende investir por mês para manter e evoluir o sistema?", com as faixas mensais. Sem faixas mensais, a pergunta principal ganha o apoio extra "Se for evolução contínua, pense no total de um ano." A pergunta nunca é pulada.
- **Modo sem números** (padrão, com `qualificacao.ts` vazio): Pergunta "O investimento para este projeto já está previsto?" · Apoio: "Serve para a gente não te propor algo fora da sua realidade. Não é compromisso."

| id | Opção (modo sem números) |
|---|---|
| `approved` | Sim, já está aprovado |
| `being_defined` | Está em definição |
| `not_considered` | Ainda não pensei nisso |
| `prefer_to_discuss` | Prefiro conversar sobre isso no diagnóstico |

Propósito: orçamento (o B do BANT), sobre o orçamento **do visitante**. Fica na 5ª posição, depois de 4 cliques investidos. `not_sure`, `not_considered` e `prefer_to_discuss` nunca descartam. `prefer_to_discuss` é neutro no score (orçamento é confidencial em empresa média).

**P6 — `role`** · seleção única · obrigatória
Pergunta: "Qual é o seu papel nessa decisão?" · Apoio: "Assim a gente sabe quem convidar para o diagnóstico. Se mais alguém decide, traga essa pessoa para a conversa."

| id | Opção |
|---|---|
| `i_decide` | Eu decido |
| `decide_with_partners` | Decido junto com sócios ou diretoria |
| `recommend_to_decider` | Vou recomendar para quem decide |
| `researching` | Estou pesquisando opções por enquanto |
| `not_defined` | Ainda não está definido quem decide |

Propósito: autoridade (o A do BANT). `recommend_to_decider` identifica o influenciador técnico (Marcos) e **não** cai automaticamente no score C. Ela, `researching` e `not_defined` geram o tópico "Quem precisa participar da próxima conversa" e destacam "traga quem decide" no pós-envio.

### 7.4 Tela de resumo — "Este é o seu ponto de partida" (a tela de estimativa, sem números) · `?etapa=resumo`

Aparece **antes** de qualquer dado de contato. Nunca mostra prazo estimado nem valor calculado.

**Ordem na tela (auditoria de conversão F02):** primeiro o que é do visitante, depois o eco das respostas e o método. Título e intro ("o que pesa no prazo e no preço do seu caso, o que a gente vai aprofundar nos 45 minutos e o caminho até o software rodando") → linha "Para: {tipo} · {prazo} · {faixa} · Revisar respostas" → (d) fatores → (c) pauta (em 2 colunas a partir de 1024px) → cases do mesmo tipo, quando houver → (e) preço → próximo passo: a nota do prazo e, no desktop, o CTA com o WhatsApp → (a) chips compactos (abertos, nunca num `<details>` fechado) → (b) método compacto: a etapa 1 e a etapa realçada com a tag de cada uma ("Gratuita · se for necessária", D44), a ênfase, e as 4 etapas num `<details>` "Ver as 4 etapas" → (f) CTA do fim + WhatsApp. Antes, a 1ª tela devolvia as 6 respostas e a linha do método que a pessoa já tinha visto na Home, e os fatores ficavam a 2.237 px (desktop) e 2.406 px (iPhone). O evento `wizard_summary_factors_view` mede se o bloco de fatores aparece na tela.

- **(a) "O que você nos contou"**: chips com cada resposta. "Alterar" abre o passo e volta direto ao resumo (`wizard_answer_edit`).
- **(b) "O caminho até o software rodando"**: linha do método em modo destaque (§5.1), com a etapa 1 marcada "Próximo passo · gratuito · 45 minutos" e uma etapa realçada conforme a P1:
  - `problem_unclear`, `product_idea`, `scope_defined` → Sprint de Descoberta: "Quando a Sprint de Descoberta é necessária, é nela, sem custo, que você fica sabendo quanto o desenvolvimento custa e quando fica pronto, antes de começar a construir." (condicional desde a revisão da D44, como a pílula "se for necessária" da etapa realçada) Variação para `scope_defined`: "No diagnóstico, a gente vê com você se o que você já tem basta para fechar escopo, prazo e preço. Se faltar definição, a Sprint de Descoberta, gratuita, vem antes." (D44: a antiga variante `skip` virou o texto base; sem protótipo)
  - `evolve_live_system`, `maintain_live_system` → Sustentação e evolução: "No diagnóstico, a gente entende o sistema que você tem hoje e indica por onde começar." (sem afirmar que se pula a Descoberta).
- **(c) "No diagnóstico, a gente vai aprofundar"**: de 2 a 4 tópicos em linguagem de negócio, gerados nesta ordem de prioridade:

| Regra | Tópico (id) |
|---|---|
| P1 = `maintain_live_system` ou `evolve_live_system` | `topic_live_system`: o que está no ar hoje e o que precisa de atenção primeiro |
| P2 ∋ `integration` | `topic_integration`: quais sistemas precisam conversar e o que cada um permite |
| P2 ∋ `mobile_app` | `topic_app`: quem vai usar o app e o que ele precisa resolver primeiro |
| P2 ∋ `ops_system` ou `client_platform` | `topic_process`: como o processo funciona hoje, passo a passo |
| P2 ∋ `mvp` | `topic_mvp`: o que a primeira versão precisa provar |
| P2 ∋ `automation` | `topic_automation`: quais tarefas se repetem e quanto tempo consomem |
| P2 = `not_sure` | `topic_not_sure`: que tipo de software resolve o seu problema |
| P4 = `asap` ou `within_3_months`, ou `deadline_reason` preenchido | `topic_deadline`: o que é essencial para a primeira entrega |
| P5 ∈ {`not_sure`, `not_considered`} | `topic_budget`: como o preço se forma e o que faz ele variar |
| P6 ∈ {`recommend_to_decider`, `researching`, `not_defined`} | `topic_decider`: quem precisa participar da próxima conversa |

Ordem efetiva (Onda 2, i18n `quote._notes`): `topic_pain` (quanto os pontos marcados na P3 custam hoje; variante de produto) entra logo depois de `topic_live_system`, `topic_deadline` sobe para logo depois dele, e `topic_success` ("como seria o 'deu certo' para você") completa a lista quando há menos de 2 tópicos. As variantes `topic_process_product_variant` e `topic_pain_product_variant` valem para ideia de produto/MVP.

- **(d) "O que pesa no seu caso"**: até 3 fatores, **sem jargão** (a implementação acrescenta `factor_automation`, quando a P2 ∋ `automation`, e `factor_scope_live`, para sistema no ar, conforme `quote._notes`):

| Regra | Fator (id) |
|---|---|
| P2 ∋ `mobile_app` | `factor_app`: uma ou duas plataformas (iPhone e Android) e a publicação nas lojas |
| P2 ∋ `integration` | `factor_integration`: o quanto os sistemas que você já usa permitem conexão |
| P2 com 2 ou mais tipos | `factor_multi`: mais de uma frente, e a ordem entre elas é combinada antes de começar |
| P4 = `asap` ou data informada | `factor_deadline`: com data marcada, o escopo é priorizado para caber até lá |
| P4 = `within_3_months` (sem data) | `factor_deadline_window`: uma janela de 3 meses, e o que entra na primeira entrega é combinado antes de começar |
| P2 ∋ `ops_system`, `client_platform` ou `mvp` | `factor_scope`: quantos processos e tipos de usuário entram na primeira versão |

- **(e) Bloco "E o preço?"**:
  - sem faixa aplicável: "No diagnóstico gratuito, a gente já mostra o que faz o preço de um projeto como o seu subir ou descer." + "A Sprint de Descoberta, quando necessária, também é gratuita. A primeira etapa paga é o desenvolvimento, com preço fechado antes de ele começar." (D44)
  - com a faixa do tipo marcado na P2 (só quando todos os tipos caem na mesma linha; com `not_sure` ou várias frentes, nenhuma): a faixa de desenvolvimento (no máximo uma; introdução no singular: "Faixa de referência para você ter uma ordem de grandeza do desenvolvimento de um projeto como o seu."), com a nota "Referência, não proposta. O preço do desenvolvimento é fechado antes de começar, e nada é cobrado até lá." A Descoberta é gratuita e não tem faixa (D44).
- **(f) Ações:** primário **"Pedir meu diagnóstico gratuito"** (→ contato); secundário **"Prefiro falar no WhatsApp"** (abre o `wa.me` com o resumo escrito, `whatsapp_click {source: wizard_summary}`); link "Revisar respostas" (na linha "Para:"). Logo acima do CTA, a nota do prazo: com urgência ou data marcada, "quanto antes a gente conversar, mais opções você tem para a primeira entrega"; com "nos próximos 3 meses", a variante da janela de 3 meses (auditoria F09). O "Nos próximos 3 meses" (o caminho mais comum) muda a pauta, o fator e a nota, mas não o bloco de preço nem a classificação do lead (`deadline_urgent` continua só com `asap` ou data). Evento `wizard_summary_view`.

### 7.5 Contato (`?etapa=contato`)

Título (texto-guia: "Como a gente fala com você?"), com uma linha dizendo que o contato é para marcar os 45 minutos.

| Campo | Regra |
|---|---|
| Nome | obrigatório · `autocomplete=name` |
| E-mail | obrigatório · `type=email`, `inputmode=email`, `autocomplete=email` · ajuda "Para o convite e a devolutiva" |
| Canal preferido | obrigatório · rádio/chips: **WhatsApp** (padrão) · **E-mail** · **Ligação** (a "Ligação" depende de `confirmacoes.ligacao`; sem a flag, só WhatsApp e e-mail) |
| WhatsApp ou telefone com DDD | obrigatório **só** se o canal for WhatsApp ou Ligação · `type=tel`, `inputmode=tel`, máscara BR, `autocomplete=tel` · ajuda "Para combinar o horário" |
| Empresa | opcional · "Empresa (opcional)" · `autocomplete=organization` |
| Mais detalhes | opcional, recolhido · "Quer contar mais alguma coisa? (opcional)" · placeholder: "Ex.: hoje os pedidos chegam pelo WhatsApp e a gente perde venda quando o time não dá conta." |
| Aviso LGPD | texto, **sem checkbox**: "Usamos estes dados só para responder ao seu pedido. Veja a Política de Privacidade." (link `/privacidade`) |
| Honeypot | `bot-field`, invisível, `aria-hidden`, `tabindex=-1`; se vier preenchido, o envio é descartado em silêncio |

Botão **"Pedir meu diagnóstico gratuito"**, sempre habilitado; Enter envia. Abaixo dele: "Gratuito e sem compromisso de contratar." Validação no blur e no envio, com mensagem inline (`aria-invalid` + `aria-describedby`): antes do 1º envio, o blur só mostra o erro de formato de um campo preenchido, e "obrigatório" aparece só depois do envio (auditoria F23, o mesmo no `/contato`). O que a pessoa digita fica no sessionStorage (sem o honeypot) e volta se a página recarregar; sai no envio confirmado e no "Começar de novo" (F24, Política em `privacy.sections.data_collected.draft`). Envio sem nenhum campo tocado (quase sempre o toque que sobrou do botão do resumo) só leva o foco ao "Nome", sem pintar os erros nem medir `form_validation_error` (auditoria F21). Telefone em `/en` e `/es`: só com "+" e o código do país, e o placeholder, a ajuda e o erro dão exemplos de fora do Brasil (en "+1 415 555 0134"; es "+52 55 1234 5678" e "+57 300 123 4567"); o canal padrão continua WhatsApp e o código do país nunca vem pré-preenchido (auditoria F16). Evento `wizard_reach_form`.

### 7.6 Envio, erro e fallback

- Transporte: o `submitLead` da Onda 1 (Netlify Forms `briefing`, timeout de 12 s, 3 tentativas com backoff, honeypot), com o schema de §7.10. O estado "Enviando…" é anunciado via `aria-live`.
- **Protocolo:** gerado no cliente (`LEM-AAAAMMDD-XXXX`, sufixo aleatório de 4 caracteres; não há sequência sem backend) quando o resumo abre, não só no sucesso: o "Prefiro falar no WhatsApp" do resumo e a tela de erro já levam o código, e o envio usa o mesmo.
- **Sucesso:** usa o protocolo do resumo → `gtag_report_conversion()` (conversão "Solicitar cotação") → GA4 `lead_submitted` → grava o resumo no `sessionStorage` → limpa o rascunho → navega para `/orcamento/enviado`.
- **Notificação ao comercial:** notificação nativa do Netlify Forms (e-mail ou outgoing webhook configurado no painel), com score, serviço e data travante no corpo. Nunca webhook chamado pelo navegador.
- **Erro:** tela "Não conseguimos enviar agora. Suas respostas estão salvas." com [Tentar de novo], [Enviar pelo WhatsApp] (briefing completo + protocolo pré-preenchidos) e o e-mail lemamon.dev@gmail.com em texto copiável. Evento `lead_failed {reason, attempts}`, que alimenta o alerta.

### 7.7 Mensagens pré-preenchidas de WhatsApp

| Contexto | Conteúdo |
|---|---|
| Página (botão flutuante, header, CTA final) | "Olá! Vim pela página {página} da Lemamon.dev e quero conversar sobre um projeto." |
| Serviço | "Olá! Vim pela página de {serviço} da Lemamon.dev." |
| Case | "Olá! Vim pelo case {nome} e quero algo parecido." |
| Resumo do wizard | saudação + respostas resumidas + "Quero pedir o diagnóstico gratuito." |
| Falha de envio | saudação + protocolo + respostas + nome/empresa informados |
| Pós-envio | "Olá! Acabei de pedir o diagnóstico pelo site (pedido {protocolo})." |

O número vem de `PUBLIC_WHATSAPP_NUMBER`. Se a variável estiver vazia, todo botão de WhatsApp some (sem link morto).

### 7.8 Pós-envio (`/orcamento/enviado`, noindex)

1. `confirmation`: H1 "Pedido recebido, {nome}." (versão genérica sem nome se não houver storage); "O que acontece agora", em 3 passos: a gente lê as suas respostas → fala com você pelo {canal escolhido} para marcar os 45 minutos → depois da conversa, você recebe a devolutiva por escrito. **Nenhum prazo numérico** e nenhum "você recebeu um e-mail" (não há envio ao lead). O foco vai para o H1 ao carregar.
2. `schedule` · when_data `hasAgenda`: "Quer adiantar? Escolha um horário agora", link ou embed (só com consentimento ou como link externo). Quando ativo, é o CTA primário da página.
3. `whatsapp_now`: "Prefere adiantar pelo WhatsApp?", com o botão "Falar no WhatsApp agora" (mensagem do pós-envio). Primário quando `schedule` está oculto.
4. `prepare`: "Para aproveitar os 45 minutos, tenha à mão": quem decide (em destaque se a P6 ∈ {`recommend_to_decider`, `researching`, `not_defined`}) · exemplos de como o processo funciona hoje (planilhas, telas, mensagens) · os sistemas que vocês já usam · como seria o "deu certo" para você.
5. `summary`: `<details>` fechado, "Resumo do seu pedido", com protocolo, respostas, contatos e o botão **"Copiar resumo"** para repassar ao sócio (confirmação via `aria-live`).
6. `meanwhile`: "Enquanto isso", com os links "Entenda a Sprint de Descoberta" e "Ver como trabalhamos", 2 cases do serviço escolhido (when_data) e "Voltar ao início".

A barra fixa mobile e o WhatsApp flutuante ficam ocultos nesta página.

### 7.9 Classificação interna (nunca exibida, sem tela de recusa)

Regras editáveis em `qualificacao.ts`. "Orçamento OK" = faixa ≥ corte de MQL (modo com faixas) ou `approved` (modo sem números). "Prazo OK" = `asap`, `within_3_months` ou `between_3_and_6_months`. "Decisor acessível" = `i_decide`, `decide_with_partners` ou `recommend_to_decider`.

| Score | Regra | Uso |
|---|---|---|
| **A** | orçamento OK + prazo OK + P6 ∈ {`i_decide`, `decide_with_partners`} | topo da fila; contato prioritário |
| **B** | (orçamento OK **ou** prazo OK **ou** `being_defined`) + decisor acessível; `prefer_to_discuss` não penaliza | fila normal |
| **C** | orçamento `not_sure`/`not_considered`, **ou** prazo `over_6_months`/`not_defined`, **ou** P6 ∈ {`researching`, `not_defined`} | nutrição + convite ao diagnóstico |
| **D** | faixa `tier_1` com 3 ou mais tipos marcados na P2, ou com `mvp` + `client_platform` | fora de perfil: resposta honesta e rápida, nunca sem resposta |

O score vai no payload, no evento `lead_submitted` e na notificação. MQL (README §7) = score A.

### 7.10 Schemas Netlify Forms

Os dois formulários são declarados em HTML estático (um `<form hidden>` no layout), e os nomes dos campos **não variam por idioma**.
- `briefing`: `name`, `email`, `phone`, `channel`, `company`, `details`, `answers` (JSON com as respostas, incluindo `deadline_reason`), `summary` (texto legível), `score`, `protocol`, `subject` (oculto, `[score] protocolo`, ex. `[A] LEM-20261019-AB12`: assunto do e-mail de notificação do Netlify, sem dado pessoal, declarado com `data-remove-prefix`), `lang`, `attribution` (JSON: utm, referrer, primeira página da sessão, origem, servico, ref, entrada), `gclid` (campo próprio, para importação de conversão offline), `bot-field`.
- `contato`: `name`, `email`, `phone`, `topic` (assunto escolhido, id estável: `new_project`, `existing_system`, `partnership`, `other`), `subject` (oculto, assunto legível da notificação do Netlify, ex. `[Contato] Projeto novo`, sem dado pessoal, com `data-remove-prefix`), `message`, `lang`, `origin`, `attribution`, `gclid`, `bot-field`.

### 7.11 Eventos GA4

`cta_click {cta_id, origem}` · `whatsapp_click {source}` · `email_copy {source}` · `profile_click {profile}` · `wizard_start` · `wizard_resume` · `wizard_step {step, question_id}` · `wizard_back` · `wizard_skip` · `wizard_answer_edit` · `wizard_summary_view` · `wizard_summary_factors_view` (metade do bloco de fatores na tela, uma vez por abertura do resumo; sem valor de resposta) · `wizard_reach_form` · `lead_submitted {score, stage, build_type, deadline, budget, role}` · `lead_failed {reason, attempts}` · `schedule_click` · `summary_copy` · `contact_submitted {subject}` · `page_not_found {path}` · `language_change {from_lang, to_lang}` (seletor de idioma; só códigos pt/en/es). `lead_failed` também vai ao New Relic (PageAction + `noticeError`) para o alerta existir sem GA4.

---

## 8. Navegação

### 8.1 Header (todas as páginas, exceto `/orcamento*`)
Sticky (64px no mobile, 72px no desktop); o primeiro elemento focável é o skip link "Pular para o conteúdo". O item ativo leva `aria-current="page"`.
- **Desktop (≥ 1024px):** [Logo → /] · **Serviços ▾** (`<details>`/`<summary>`, abre por clique e teclado, fecha com Esc e clique fora, nunca só por hover; painel com Sistemas web · Aplicativos · Integrações e automação · MVP e produtos digitais · Sustentação e evolução · divisor · "Para começar: Sprint de Descoberta" · "Todos os serviços" → /servicos) · **Como trabalhamos** · **Quanto custa** · Cases* · Sobre* · **Contato** · seletor "PT · EN · ES" compacto · [WhatsApp] (ghost, ícone + texto) · [**Pedir diagnóstico gratuito**] (primário).
- **Desktop estreito (1024–1279px):** o WhatsApp do header fica só com o ícone (o nome acessível continua "WhatsApp"); com Cases e Sobre no menu, o seletor de idioma compacto sai do header nessa faixa (continua no rodapé e no drawer). O header nunca passa da altura do token (`--header-height`), conferido por E2E.
- **Tablet (768–1023px):** logo · Como trabalhamos · CTA primário · botão "Menu".
- **Mobile (< 768px):** logo + botão "Menu" (ícone com texto, 44×44, `aria-expanded`, `aria-controls`). Drawer em tela cheia com os 5 serviços visíveis (sem submenu aninhado), Sprint de Descoberta, Como trabalhamos, Quanto custa, Cases*, Sobre*, Contato, CTA primário em largura total, WhatsApp, e-mail com "Copiar" e seletor de idioma. Focus trap, fecha com Esc e devolve o foco ao botão.
- (*) Só quando a página existe (§4).

### 8.2 Barra de ação fixa (mobile, < 768px)
Aparece quando o CTA do hero sai da tela (IntersectionObserver). Tem "Pedir diagnóstico gratuito" (primário, ~70%) e o ícone de WhatsApp (`aria-label` "Falar no WhatsApp"). No mobile, **substitui** o botão flutuante de WhatsApp, para não haver dois elementos fixos disputando o polegar. Fica oculta em `/orcamento*` e com o teclado aberto, respeita a safe-area, e o `<main>` ganha `padding-bottom`. Com rascunho, o rótulo vira "Continuar meu pedido".

### 8.3 WhatsApp flutuante (desktop)
Canto inferior direito, em todas as rotas exceto `/orcamento*`. Mensagem pré-preenchida pela página (§7.7). Some se a env estiver vazia.

### 8.4 Header do wizard (`/orcamento*`)
Antes de "Começar": logo + link "Dúvidas? WhatsApp", sem menu e sem CTA de header. Depois de "Começar" (modo foco): logo + "Pergunta N de 6" + "Dúvidas? WhatsApp". Footer mínimo: Política de Privacidade · lemamon.dev@gmail.com; com `hasCompanyData`, "razão social · CNPJ" (`shared.footer.company_id`) numa linha própria, porque o FAQ rápido do `/orcamento` diz que o CNPJ está no rodapé.

### 8.5 Footer (todas as páginas, exceto o footer mínimo do wizard)
- **Coluna 1:** logo; "Software sob medida com escopo, prazo e preço combinados antes de começar."; "São Paulo, SP, Brasil".
- **Coluna 2 — Serviços:** os 5 serviços + Sprint de Descoberta.
- **Coluna 3 — Lemamon.dev:** Como trabalhamos · Quanto custa · Cases* · Sobre* · Blog* · Contato.
- **Coluna 4 — Fale com a gente:** Pedir diagnóstico gratuito · WhatsApp · lemamon.dev@gmail.com (texto + "Copiar") · LinkedIn · GitHub · Medium, visíveis também no mobile.
- **Barra inferior:** © {ano} Lemamon.dev · São Paulo, SP · razão social · CNPJ* (`empresa`; hoje "Lemamon.dev LTDA · CNPJ 69.700.690/0001-98") · Política de Privacidade · seletor "Português · English · Español" (`<a hreflang lang>`).
- Nenhum link aponta para `/` como placeholder, e nenhum item leva a página inexistente.

### 8.6 Escada de CTA (regra do site inteiro)
- **Degrau 0, entender:** "Ver como trabalhamos", páginas de serviço, Quanto custa, FAQ.
- **Degrau 1, falar já:** WhatsApp (header, flutuante/barra fixa, hero, CTA final, resumo do wizard, erro de envio, pós-envio).
- **Degrau 2, pedir o diagnóstico:** CTA primário **único**, "Pedir diagnóstico gratuito" (EN "Request a free assessment" · ES "Pide tu diagnóstico gratuito"). A variação "Começar pelo diagnóstico gratuito" só aparece dentro de seções de método. Com rascunho salvo: "Continuar meu pedido".
- **Degrau 3:** diagnóstico de 45 min + devolutiva por escrito (offline).
- **Degrau 4:** Sprint de Descoberta, gratuita, quando o diagnóstico mostra que é necessária (combinada com o cliente no diagnóstico; D44).
- **Degrau 5:** desenvolvimento com entregas a cada 2 semanas → sustentação e evolução.
- **Agendar:** o rótulo vira "Agendar diagnóstico gratuito" só se `hasAgenda` e se o pós-envio oferecer a escolha de horário na mesma sessão.
- No máximo 1 CTA primário por seção. Todo CTA de diagnóstico leva `?origem={pagina-secao}`.
- **Rótulos proibidos:** "Saiba mais", "Conheça mais", "Fale conosco", "Comece seu projeto!", "Enviar" solto.

### 8.7 Breadcrumb
Em `/servicos/*`, `/sprint-de-descoberta`, `/cases/[slug]` e `/blog/[slug]`, com BreadcrumbList JSON-LD. Trilhas: serviços "Início › Serviços › {serviço}"; Sprint "Início › Como trabalhamos › Sprint de Descoberta" (a Sprint é etapa do método, i18n `_notes.breadcrumb`); case "Início › Cases › {case}", em que {case} é o nome do projeto (`seoTitle` ou `tipoDeSistema`), nunca "setor · porte"; post "Início › Blog › {post}".

---

## 9. Idiomas

- pt-BR na raiz; `/en/` e `/es/` com a mesma árvore e slugs localizados (§3.1). Cases também: o nome do arquivo é a chave, igual nos 3 idiomas, e `slugUrl` dá o slug da URL em en/es (auditoria de SEO S01-3); o seletor, o hreflang e o canonical usam o slug de cada idioma, e o sitemap lista os cases sem `xhtml:link` (o hreflang fica no `<head>`). Um **mapa central de rotas** (`chave → {pt, en, es}`) alimenta o seletor, que leva à página equivalente, o hreflang recíproco (pt-BR, en, es + `x-default` → pt-BR) e o sitemap. O `astro:i18n` não localiza slugs sozinho.
- **Não há redirecionamento automático** por idioma do navegador; no máximo um aviso discreto ("Also available in English"). Implementado assim: o aviso só aparece quando o idioma da página NÃO está entre os idiomas do navegador e algum dos outros dois está; leva à página equivalente; fechar é persistente (localStorage) em todas as páginas. No wizard, aparece só na entrada do `/orcamento` e some no modo foco; o footer mínimo do wizard tem o seletor de idioma, e a troca de idioma na entrada mantém a query da URL (`?servico=`, `?origem=`, `?ref=`, UTMs), menos o `?etapa=` (auditoria de conversão F31). Com o aviso, o "Começar" pode descer para a 2ª tela no celular de 360×640; o aviso e o H1 continuam na 1ª, a mesma regra da Home (§2.8): quem não lê o idioma da página precisa do aviso antes do botão. Com o navegador no idioma da página (o visitante do anúncio), não há aviso e o F03 vale.
- **Âncoras de seção (auditoria SEO S01-8, 22/10/2026; fecha a parte das âncoras da F71):** o id publicado em en/es sai no idioma (`/en/how-we-work#development`, `/es/como-trabajamos#desarrollo`), pelo mapa `LOCALIZED_ANCHORS` de `src/config/routes.ts`; a chave continua o id pt de `ANCHORS`, `anchorFor()` e `anchorId()` localizam, e a seção leva o id pt como alias vazio (`Section aliasId`), para link antigo continuar caindo nela. Parâmetros de URL (`?origem=`, `?servico=`, `?ref=`, `?etapa=`) continuam iguais nos 3 idiomas (a parte `?etapa=resumen` da F71 fica fora: é estado do wizard, não âncora).
- **Espanhol:** neutro latino-americano, com "tú" em todo o site, inclusive wizard, validações, WhatsApp e e-mails de formulário.
- **Blog:** só pt-BR.
- **Faixas do wizard e de preço:** por idioma, no config; a moeda é decisão do dono.
- **Glossário por idioma** (sugestão, a validar no documento de copy): Diagnóstico gratuito → EN "free assessment" / ES "diagnóstico gratuito"; devolutiva por escrito → EN "written feedback" / ES "retroalimentación por escrito" (evitar "devolución", que significa reembolso); Sprint de Descoberta → EN "Discovery Sprint" / ES "Sprint de Descubrimiento"; entregas a cada 2 semanas → EN "working software every 2 weeks" / ES "entregas cada 2 semanas"; sustentação e evolução → EN "support and evolution" / ES "soporte y evolución".
- **Atendimento fora do Brasil (D31, 21/10/2026): confirmado.** Com `confirmacoes.atendeExterior` (que exige `outrasCidades`), a Home diz "Atendemos o mundo todo" no eyebrow (`home.hero.eyebrow_with_abroad`, só na Home; o eyebrow do `/orcamento` e do cartão OG não muda) e o FAQ `other_cities` vira UMA pergunta com o exterior ("Vocês atendem empresas de outras cidades ou de fora do Brasil?"; en "Do you work with companies outside Brazil?"; es "¿Trabajan con empresas fuera de Brasil?"). O texto afirma só atendimento a distância, em português, inglês ou espanhol, com o mesmo processo, e que moeda, contrato e forma de pagamento são combinados por escrito antes de começar. Não afirma moeda, nota fiscal de exportação, foro nem fuso. As faixas da P5 do wizard seguem em BRL.

---

## 10. Redirects, Google Ads e medição

### 10.1 `netlify.toml` (antes de qualquer outra regra; remover o catch-all de SPA, porque o Astro gera `404.html`)

| De | Para | Status | Nota |
|---|---|---|---|
| `/projects` e `/projects/*` | `/orcamento` | 301 | o Netlify repassa a query string (gclid, utm) |
| `/diagnostico` | `/orcamento` | 301 | URL curta para bio e WhatsApp (usar com `?utm_source=`) |
| `/metodo` · `/en/method` · `/es/metodo` | página do método no idioma `?utm_source=resumo_copiado&utm_medium=compartilhamento` | 301 | URL curta e limpa do texto de "Copiar resumo" do pós-envio (`METHOD_SHORT_PATH` em `routes.ts`) |
| `/lemamon`, `/home` | `/` | 301 | |
| `/post/*` | `/` | 301 | posts falsos antigos |
| `/?lng=en` · `/?lng=es` | `/en/` · `/es/` | 301 | query match (detector de idioma antigo) |
| `/blog` | `/` | 302 | enquanto `hasPosts` for falso; some quando o blog existir |
| `https://boring-shockley-7c50b2.netlify.app/*` | `https://lemamon.dev/:splat` | 301 | regra de domínio, a primeira do arquivo (auditoria SEO S01-1): só o host exato de produção; deploy preview e branch deploy (`<algo>--boring-shockley-7c50b2.netlify.app`) continuam 200 com o noindex do Netlify |
| `/contact`, `/quote`, `/Diagnostico`, `/servicos/sistema-web`, `/en/projects`, `/es/projects`, `/sitemap.xml` | `/contato`, `/orcamento`, `/orcamento`, `/servicos/sistemas-web`, `/en/quote`, `/es/cotizacion`, `/sitemap-index.xml` | 301 | endereços prováveis que davam 404 (S01-4, F90), com force, antes do 404 por idioma |
| `/en/*` · `/es/*` não encontrados | `/en/404.html` · `/es/404.html` | 404 | |

`/index.html`, `/en/index.html` e `/es/index.html` ficam **sem** regra (S01-5, opcional): respondem 200 com o canonical na raiz do idioma. Um 301 forçado arriscaria loop na Home se o Netlify casasse a regra com o arquivo servido em `/`, e o ganho é quase nulo. Só volta depois de testado num deploy preview que já tenha a regra (`/` com 200 sem redirect, em `tests/e2e/redirects.spec.ts`).

### 10.2 Google Ads
- A conversão "Solicitar cotação" é **por evento** (`gtag_report_conversion()` no sucesso do envio), então sobrevive à troca de rota. O snippet sai de depois do `</body>` (como está hoje no `index.html`) e vai para o `<head>` do `Layout.astro`.
- Atualizar as URLs finais dos anúncios para `/orcamento` ou para a página de serviço do tema, evitando o salto do redirect.
- Criar em paralelo uma conversão por URL em `/orcamento/enviado`, rodar as duas por cerca de 30 dias e só então escolher a principal.

### 10.3 Medição e SEO técnico
- GA4 com os eventos de §7.11. O alerta automático de `lead_failed` continua.
- Sitemap só com páginas always + páginas when_data publicadas; a 404 e `/orcamento/enviado` ficam fora.
- JSON-LD por página: WebSite (Home, um nó só nos 3 idiomas), Organization/ProfessionalService (Home, Sobre; `areaServed` e idiomas pela D31, §6.1), Person (Sobre, com `hasTeam`, §6.11), Service (serviços, Sprint), FAQPage (só itens visíveis), BreadcrumbList, Article (blog; `publisher` e `isPartOf` pelo `@id` da Organization e do WebSite, S02-13).
- **Rich result de FAQ descontinuado (auditoria SEO S02-9):** segundo a página de atualizações da Busca do Google citada na auditoria, o rich result de FAQ deixou de aparecer em 07/05/2026. O FAQPage continua (inofensivo, ajuda a entender a oferta), mas **não espere FAQ** no Rich Results Test nem no relatório de melhorias do Search Console: o esperado na Home é Organização e, nas páginas internas, BreadcrumbList. O FAQPage leva a lista visível inteira, inclusive as perguntas repetidas entre páginas: marcar só a página dona (S05-12, opcional e não verificado na auditoria) foi avaliado e não aplicado, porque quebraria a regra "FAQPage = o FAQ visível" sem ganho na SERP.
- `<meta name="robots">`: "index, follow, max-image-preview:large" nas páginas indexáveis (S01-10), "noindex, follow" nas rotas noindex/erro, "noindex,nofollow" em todas com a camada fictícia.
- `/llms.txt` (S05-10, prioridade baixa): gerado do i18n e das flags por `src/pages/[llms].txt.ts` (nome, resumo, método, o que é cobrado e quando, atendimento fora de São Paulo com a D31, contato e as páginas principais nos 3 idiomas), sem data nem contagem; nunca gerado com a camada fictícia. O `public/robots.txt` continua liberando todos os rastreadores, inclusive os de IA: a política (S05-9) é decisão do dono, pendente no playbook 15.
- Title e description únicos por página (chaves `meta.*`). OG image 1200×630 por página ou padrão.
- `/orcamento`, `/en/quote` e `/es/cotizacion`: o `rel=canonical` aponta sempre para a URL limpa, sem `?servico=`, `?origem=` ou `?ref=`. A linha de contexto do `?servico=`/`?ref=` (§7.1) é desenhada pela ilha **depois** do botão "Começar", com o texto vindo do dado (nunca do valor cru da URL); slug desconhecido, nada. O `document.title` só muda depois do "Começar" ou ao retomar um rascunho. A landing do anúncio mantém o CTA na 1ª tela a 360×640 (auditoria F03).
- `PUBLIC_WHATSAPP_NUMBER` e `PUBLIC_GA4_ID` no ambiente do Netlify (as variáveis `VITE_*` não existem no Astro).
- Links de WhatsApp com texto livre do visitante (resumo, falha de envio) abrem por JS no clique, e o `href` renderizado não leva o `?text=`: o GA4 mede o `link_url` de cliques externos e o texto não pode chegar lá.
- Toque da sessão: um script global grava a primeira página vista, o referrer externo e utm/gclid no `sessionStorage` em TODA página; o wizard envia isso em `attribution`/`gclid` mesmo quando a pessoa entrou pela Home.

---

## 11. Acessibilidade e mobile (resumo obrigatório)

Um H1 por página · landmarks e skip link · foco visível (nunca `outline:none`) · contraste AA · `<details>` nativo · inputs nativos em fieldset/legend · seleção nunca só por cor · nenhuma mudança de contexto automática · `aria-live` em passo, envio e cópia · `prefers-reduced-motion` · `lang` por página · alvos de toque ≥ 44px (≥ 56px nas opções do wizard) · nenhum carrossel escondendo prova · LCP é texto em HTML estático · JS fora da ilha só em `<script>` vanilla mínimo (drawer, dropdown, barra fixa, troca do rótulo de retomada, copiar e-mail).

---

## 12. Regras de copy (valem para os 5 documentos)

**Pode afirmar:** só os fatos de §1.5 e o processo de §1.2. Os únicos números de serviço são **"45 minutos"** e **"a cada 2 semanas"**. "6 perguntas" descreve o próprio formulário. Os prazos 3 e 6 meses do wizard são respostas do cliente.

**Não pode:** nomes ou número de clientes ou projetos · anos de mercado · tamanho ou nomes do time · certificações, prêmios, percentuais, depoimentos, logos · duração da Descoberta (ela é definida com o cliente no diagnóstico; D44 revoga a D42), do MVP ou prazo da devolutiva · preço, abatimento ou protótipo da Descoberta · quem decide se a Descoberta é necessária além de "definido com você no diagnóstico" · que o plano fica com o cliente se ele não seguir (`planoDoCliente = false`) · custo total do projeto (só "as etapas pagas são o desenvolvimento e a sustentação") · preços ou qualquer valor (inclusive no wizard: as faixas são config) · garantias contratuais além das confirmadas em `confirmacoes` (código do cliente, por contrato; NDA antes dos detalhes) · SLA de resposta com número · "melhor", "líder", "referência", "incrível", "de ponta", "soluções", "transformação digital", "inovação" · "o que já construímos" sem case · "você fala com quem escreve o código" (não confirmado) · "assumimos sistemas de terceiros" · moeda, nota fiscal de exportação, foro ou fuso para clientes de fora (D31 confirma o atendimento, não esses termos).

**Conteúdo descrito com cautela:**
- **Devolutiva**: só "devolutiva por escrito" até `confirmacoes.devolutivaConteudo`.
- **Publicação nas lojas**: "pode fazer parte do escopo".
- **Descoberta**: "gratuita"; só "quando o diagnóstico mostra que é necessária"; necessidade e duração "definidas com você no diagnóstico" (D44).
- **Decisão do cliente**: só os 2 pontos (depois da devolutiva e depois do plano).

**Tom (05-conteudo §8):** concreta, franca, sem pompa, focada no cliente; "a gente" e "você"; frases curtas, parágrafos de até 3 linhas; a frase começa pelo problema do cliente; nada de emoji em título; nada de advérbio de reforço; nada de infantilizar. Todo enunciado institucional passa no **teste da negação**.

**Termos fixos:** "diagnóstico gratuito" · "devolutiva por escrito" · "Sprint de Descoberta" (nome completo na primeira menção da página, depois "Descoberta") · "entregas a cada 2 semanas" (sempre o algarismo 2, nunca "quinzenal") · "sustentação e evolução contínua" · "escopo, prazo e preço" (sempre nessa ordem) · "software funcionando, não apresentação de slide".

**Persona e linguagem:** escrever para a Cláudia (não técnica) por padrão; jargão só nas páginas de integração e de engenharia, e sempre com uma explicação curta (§5.9). Os textos de medo de fornecedor falam do que "costuma dar errado", não de "você já passou por isso".

---

## 13. Documentos de copy

O esqueleto em `content-model.json` está dividido em 5 documentos independentes. Cada top-level key pertence a exatamente um:

| Documento | Top-level keys | Escopo |
|---|---|---|
| `home` | `home` | Home completa |
| `metodo-e-preco` | `how_we_work`, `discovery_sprint`, `pricing`, `faq` | Páginas do método e do preço + banco central de FAQ |
| `servicos` | `services` | Hub + template + 5 páginas de serviço |
| `conversao` | `quote`, `contact` | Wizard completo (entrada, perguntas, resumo, contato, envio, erro, WhatsApp, pós-envio) e página de Contato |
| `estrutura` | `meta`, `shared`, `cases`, `about`, `blog`, `privacy` | Metadados de todas as páginas, componentes compartilhados (header, footer, CTA, WhatsApp, LGPD, 404, idiomas, erros, linha do método, compromissos, investimento, prova, perfis, termos) e páginas when_data/legal |

Ordem de escrita sugerida: `estrutura` (fixa os termos e componentes) → `home` → `conversao` → `metodo-e-preco` → `servicos`. Cada documento é escrito em pt-BR e depois adaptado para en e es-LatAm (tú).

---

## 14. Pendências do dono (por alavancagem)

1. **Responder `scope_change`** ("E se eu mudar o escopo no meio?"). É objeção central do Rafael e da Cláudia. Resposta sugerida para aprovar: "As entregas a cada 2 semanas existem para você perceber cedo o que precisa mudar. Se a mudança mexer no escopo, escopo, prazo e preço são combinados de novo antes de seguir."
2. **Publicar pelo menos 1 pessoa** (foto, nome, papel) e **razão social/CNPJ**. Isso libera /sobre, a seção Time e o CNPJ no rodapé, e desarma o "é freelancer?". Razão social e CNPJ: feitos em 20/10/2026 (D39, §15.5 linha 14); falta a pessoa.
3. **Conferir os perfis públicos** (GitHub, LinkedIn, Medium) e marcar `publicar` só nos que têm conteúdo recente.
4. **Faixas de qualificação** do wizard (`qualificacao.ts`) e o corte de MQL. Sem elas, a P5 usa a versão sem números.
5. **Flags de FAQ:** propriedade do código (feito, decisão 9), NF, outras cidades/países (feito em 21/10/2026, D31), NDA (feito, decisão 10), sistema de terceiros (afeta `/servicos/sustentacao` e a opção `maintain_live_system`), o texto do FAQ "Posso começar direto pelo desenvolvimento?" (`semDescoberta`; a D44 já torna a Descoberta condicional), o plano é do cliente se ele não seguir (continua `false`), migração de dados. Resolvidos pela D44 (21/10/2026): duração da Descoberta (não é publicada; o FAQ responde sem número) e Descoberta abatida (sem objeto: a Descoberta é gratuita).
6. **Conteúdo da devolutiva** (`devolutivaConteudo`), para explicar o que o cliente recebe.
7. **Canal "Ligação"**: confirmar que a Lemamon.dev liga para quem escolher essa opção.
8. **Agenda online** (`agenda.ts`): muda o pós-envio e permite o rótulo "Agendar".
9. **Faixas de preço** (`precos.ts`): libera "Investimento" em todo o site e o bloco de preço do resumo.
10. **Formato da Descoberta (formato, participantes e ritmo; sem duração, D44) e da sustentação** (`descoberta.ts`, `sustentacao.ts`) e **práticas de engenharia** (`engenharia.ts`).
11. **Cases, depoimentos e logos com autorização por escrito.** É o item de maior lead time. Exceção: os 29 cases anonimizados com `semTermo` (D45; 28 no ar, um espera setor e porte do dono); cada termo que chegar permite dar nome ao case.
12. **Google Ads:** atualizar as URLs finais; confirmar a conversão por evento e criar a conversão por URL em paralelo.
13. **LGPD:** retenção de dados, revisão jurídica da Política e decisão sobre aviso de cookies (GA4, Ads, New Relic).
14. **Notificação do Netlify Forms** configurada no painel para os formulários `briefing` e `contato`.
15. (Opcional) e-mail em domínio próprio. O copy usa o Gmail confirmado até lá.

---

## 15. Registro de decisões

### 15.1 Base
**Proposta B (Jornada)** é a espinha. Teve o maior placar e foi a preferida de 4 dos 5 juízes (Rafael, Cláudia, Marcos, Comercial), pela melhor jornada do clique ao pedido: WhatsApp como secundário desde o hero, wizard acessível sem avanço automático, resumo personalizado antes do contato, `/contato`, sustentação e o bloco "o que a Descoberta define" por serviço. O tech lead preferiu A pela simplicidade técnica, e as simplificações dele foram incorporadas (15.3).

### 15.2 O que veio de cada proposta

| De | Ideia aproveitada | Por quê |
|---|---|---|
| A | Problema da Home na voz de quem nunca contratou (planilha, digitação dupla, ferramentas que não conversam, software pronto que não serve) + card do fundador | Cláudia e Comercial: a dor operacional é o gatilho de compra da PME; B e C pressupunham experiência anterior |
| A | Faixa "Onde você decide" (2 pontos de decisão) | Rafael, Cláudia, Comercial: mata o medo de assinar no escuro |
| A | FAQ "Preciso entender de tecnologia para contratar?" | Cláudia: é a única resposta que tira o constrangimento da compradora não técnica |
| A | Seção "Confira antes de conversar" (GitHub, LinkedIn, Medium) | Marcos, Rafael, Comercial: é a única prova verificável sem cases. Virou when_data por flag (tech lead: evita título órfão) |
| A | "Agendar" só com agenda real | Todos os juízes: C quebrava a promessa no primeiro clique |
| A | Tirar "site/landing page" do wizard e do copy | Fora da lista confirmada; traz ticket fora de perfil |
| A | Canal "Ligação" e telefone obrigatório só se o canal exigir | Cláudia (persona de 38–55 anos), Marcos (prefere e-mail) |
| A | Pós-envio com protocolo, WhatsApp com o código e "Para aproveitar os 45 minutos" | Comparecimento e qualidade da conversa |
| A | Ficha técnica no template de case | Marcos: o avaliador técnico precisa de stack e link |
| A | Lista de redirects (incluindo `?lng=` e `/post/*`) e conversão em paralelo por 30 dias | Tech lead, Comercial |
| A | Score D (fora de perfil, nunca sem resposta) | Comercial |
| B | Rota `/orcamento` com H1 honesto e FAQ "Vou receber um preço no fim?" antes do clique | Cláudia, Comercial: é a palavra do comprador e o nome da conversão; o H1 neutraliza a sensação de isca |
| B | WhatsApp como secundário desde o hero; barra fixa mobile no lugar do flutuante | Rafael, Comercial: o comprador brasileiro fecha por WhatsApp |
| B | Frase-ponte "faltou combinar antes de começar" colada no método | Rafael, Cláudia |
| B | Wizard sem avanço automático, inputs nativos, "Continuar" sempre habilitado, "Ainda não sei" exclusivo, aria-live, foco gerenciado | Marcos, Tech lead, Rafael (WCAG 3.2.2; a qualidade do site é prova para o técnico) |
| B | P1 separando "evoluir" de "quem cuide" | 07 §7.5.3, Marcos, Comercial |
| B | "Prefiro conversar sobre isso no diagnóstico" e "Ainda não está definido" | Marcos (orçamento confidencial em empresa média) |
| B | Resumo "Este é o seu ponto de partida" com "No diagnóstico, a gente vai aprofundar" | Todos os juízes: devolve valor antes do pedido |
| B | "Copiar resumo" no pós-envio; agenda como CTA primário quando existir | Cláudia (repassar ao sócio), Comercial |
| B | Retomada "Continuar meu pedido" no header e na barra | Comercial, Rafael (recuperar abandono) |
| B | Template único `/servicos/[slug]` com "O que fica definido antes do desenvolvimento" (antes "O que a Sprint de Descoberta define neste tipo de projeto") e "Exemplos do que dá para construir" | Marcos, Comercial, Tech lead |
| B | `/servicos/sustentacao` | Cláudia (3ª objeção: suporte), Marcos, Comercial (receita recorrente) |
| B | `/contato` com Assunto e dica para o diagnóstico | Cláudia (hábito), Marcos (NDA, questionário) |
| B | Arquivos de config nomeados (`precos.ts`, `qualificacao.ts`, `confirmacoes.ts`, `agenda.ts`…) e FAQs condicionais por flag | Tech lead, Marcos |
| B | Versão da P5 sem números | Necessária para cumprir a regra do dono (15.4) |
| B | Tabela "Sem entender o problema / Com Descoberta" (antes "Sem Descoberta / Com Descoberta") | Cláudia, Comercial |
| B | Política de Privacidade com New Relic e operadores reais | Tech lead |
| C | `/quanto-custa` sem números + "O que pesa no preço" por serviço | Cláudia (régua para comparar), Rafael (busca real), Comercial |
| C | Pares medo → resposta do método ("o fornecedor que some" → sustentação) | Rafael, Cláudia, Comercial |
| C | Tabela "Sem combinado × Com o método" em /como-trabalhamos | Rafael, Cláudia, Comercial (material para o sócio) |
| C | H1 e sinais do MVP ("primeira versão nas mãos de usuários reais", "existe uma data", "o que cortar") | Rafael |
| C | Gatilhos de preço de integração em linguagem técnica com explicação, e "integração é algo vivo" | Marcos |
| C | Opção "Vou recomendar para quem decide" fora do score C | Marcos |
| C | `system_pain` (cuidar × evoluir) | Marcos |
| C | when_data como regra de build; componente único da linha do método | Tech lead |
| C | `?origem=` em todo CTA; `/diagnostico` como 301 de URL curta | Comercial |
| C | Faixas no resumo lado a lado e nunca somadas; faixas do wizard só dentro da ilha | Rafael, Tech lead |
| C | Pauta de blog escrevível sem números; canonical do Medium para lemamon.dev | Rafael, Marcos |
| C | Explicar jargão (escopo priorizado, MVP; protótipo saiu na D44) | Cláudia |
| Novo | Seção "Como comparar propostas de software" em /quanto-custa | Lacuna apontada pela Cláudia: régua para comparar as 3 propostas que ela recebe |
| Novo | Seção when_data "Como a gente constrói" (práticas de engenharia) | Lacuna comum apontada pelo Marcos |

### 15.3 Conflitos resolvidos

| Conflito | Posições | Decisão | Motivo |
|---|---|---|---|
| Nome da rota do wizard | A: `/diagnostico` · B, C: `/orcamento` | **`/orcamento`** + `/diagnostico` como 301 | A palavra que o comprador busca e o nome da conversão no Ads. O risco de isca (argumento de A) é resolvido com H1 e FAQ antes do clique, que todos os juízes aceitaram |
| Estado dos passos | B: uma URL por passo + rewrite · A, C: `?etapa=` | **`?etapa=`** | Tech lead e Comercial: mesmo ganho (voltar do navegador, funil medido) sem rewrite em 3 idiomas nem URLs duplicadas crawláveis |
| Pós-envio | C: mesma rota · A, B: página própria | **Página estática própria, noindex** | URL limpa para conversão por URL e meta de GA4; sem bug de refresh |
| Avanço automático | A, C: avança ao clicar · B: não | **Não avança** | WCAG 3.2.2; o toque errado no celular irrita (Rafael); um caminho de código só (tech lead) |
| Rótulo do CTA | C: "Agendar" · A, B: "Pedir" | **"Pedir diagnóstico gratuito"** | Não há agenda; "Agendar" sem agenda quebra a confiança no primeiro passo |
| CTA secundário do hero | A: "Ver como trabalhamos" · B: WhatsApp | **WhatsApp**; a linha do método do hero vira o link para o método | Rafael e Comercial: fecha por WhatsApp |
| Enquadramento do problema | B, C: "você já passou por isso" · A: dor operacional | **Duas seções**: dor operacional (identificação) + medos tratados como "o que costuma dar errado" (risco) | Cláudia: quem nunca contratou não se reconhece no medo de fornecedor; Rafael e Comercial querem os medos respondidos |
| FAQ de mudança de escopo | A, Rafael: fixa · B, Marcos, Comercial: condicional | **Condicional**, com resposta sugerida e prioridade nº 1 nas pendências | É compromisso de processo não confirmado; a regra do dono proíbe garantias não confirmadas |
| "Você decide se segue depois de cada etapa" | B: compromisso fixo · Marcos e Comercial: é inferência | **Reescrito como os 2 pontos de decisão** (depois da devolutiva e depois do plano) | Os dois decorrem do processo confirmado (diagnóstico gratuito → Descoberta paga → plano com preço para a fase seguinte). Desde a D44 (21/10/2026), a Descoberta é gratuita e só quando necessária; os 2 pontos de decisão continuam (depois da devolutiva e com o plano, antes do desenvolvimento) |
| Página de sustentação | A, Tech lead: não (rasa) · B, C, 3 juízes: sim | **Sim**, com a seção de formato when_data | Objeção da Cláudia e receita recorrente; a página é escrevível só com o processo confirmado, e o formato só entra com dado |
| URL da Descoberta | C: `/servicos/descoberta` · A, B: `/sprint-de-descoberta` | **`/sprint-de-descoberta`** | É uma etapa e oferta própria, e a URL é enviada pelo comercial; listada no menu de Serviços como "Para começar" |
| Páginas de serviço: "itens de escopo" (B) | B tinha; A e C não | **Removido**; os itens relevantes entram em "O que pesa no preço" | Sobreposição com exemplos e fatores; página mais curta |
| "Quanto custa" no menu | Cláudia: no menu · Comercial: só quando houver faixas | **No menu sempre** | A página responde com honestidade na 1ª frase e entrega valor sem números (fatores, como chegar ao preço, como comparar propostas); o item no menu sinaliza transparência para a objeção nº 1 |
| /sobre | C: sempre · A, B, todos os juízes: when_data | **when_data (≥ 1 pessoa completa)** | Página sem pessoas reforça a suspeita de freelancer |
| Unicidade do FAQ por página | C: perguntas distintas por página · Tech lead: não precisa | **Banco central, repetição permitida** | Rich result de FAQ não aparece para sites comerciais; menos texto para escrever e traduzir |
| FAQ "A Lemamon.dev é uma fábrica de software?" | C | **Removido** | Rafael, Cláudia e Marcos: soa como truque de SEO e adota o enquadramento de commodity |
| Ordem do wizard | A: dor em 2º · B, C: tipo em 2º | **estágio → tipo → dor → prazo → orçamento → papel** | `?servico=` pré-marca a P2; dinheiro e decisão no fim |
| Dor obrigatória | B: obrigatória · A, C: opcional | **Opcional, com "Pular"** | Comercial: não travar quem tem pressa |
| Ramificação | B: pula a P5 · C: troca a pergunta · Tech lead: N fixo | **N fixo em 6**; varia só texto ou conjunto de opções (P2, P3, P5) | Progresso estável e menos caminhos de código; o ramo `system_pain` de C (Marcos) cabe sem mudar N |
| Faixas em R$ no wizard | A, B, C: R$ 30/80/200 mil no copy | **Nenhum valor no copy**; faixas só em `qualificacao.ts`; padrão sem números | Regra do dono: "o copy não pode citar valores em lugar nenhum" |
| Opção "Ainda não sei dizer" na P1 (C) | C | **Removida** | Redundante com `problem_unclear` (Comercial) |
| Opção de ideia na P1 | B não tinha | **Incluída** (`product_idea`) | Rafael é o ICP primário |
| WhatsApp obrigatório no contato | C | **Não** | Atrito para quem prefere e-mail (Cláudia, Marcos, Comercial) |
| Protocolo | A: sequência | **Sufixo aleatório no cliente** | Não há sequência sem backend (tech lead) |
| Notificação ao comercial | B: webhook do navegador | **Notificação nativa do Netlify Forms** | Não expõe a URL nem cria ponto de falha no caminho do lead (tech lead) |
| Troca global do CTA para "Continuar meu pedido" | B: sim · Tech lead: adiar (CLS) | **Sim**, com script inline síncrono e largura fixa | Mantém o ganho de recuperação (Comercial, Rafael) sem o custo de layout que preocupava o tech lead |
| Rota do blog | B: `/conteudos` · A, C: `/blog` | **`/blog`**, com o escopo editorial de B (admite conteúdo técnico) | Aproveita a URL antiga; o Marcos ganha conteúdo técnico |
| `/post/*` e `/blog` | C: 404 real · A: 301 e 302 | **`/post/*` 301 → `/`; `/blog` 302 → `/`** | Não perder quem chega por link antigo; o 302 deixa a URL livre para o blog futuro |
| Duração da Descoberta no FAQ | B, C: "combinada antes de começar" como resposta fixa | **Condicional** (`duracaoDescoberta`) | Não está confirmada |
| "Quatro etapas, sempre nesta ordem" | A, B | **"nesta ordem"**, sem "sempre", + FAQ condicional `skip_discovery` | Marcos achou rígido; "sempre" não está confirmado |

### 15.4 Desvios deliberados em relação às três propostas
1. **Nenhum R$ no copy, nem no wizard.** As três propostas punham faixas em reais nas opções da P5. A regra do dono é absoluta, então as faixas viraram configuração (`qualificacao.ts`), e a versão padrão da P5 pergunta se o investimento está previsto.
2. **Devolutiva sem descrição de conteúdo.** A, C e alguns textos de B detalhavam a devolutiva ("o caminho que recomendamos", "no e-mail informado"). Fica só "devolutiva por escrito" até o dono confirmar.
3. **Publicação nas lojas como "pode fazer parte do escopo"**, e não como afirmação (B e C afirmavam).
4. **"Quanto custa" ganha a seção "Como comparar propostas"**, ausente nas três, para dar à Cláudia a régua que ela pediu.
5. **Titles acima de 60 caracteres com a marca completa.** Desde a D43, todo title termina em " | Lemamon.dev". Em `/sprint-de-descoberta`, o pt tem 64 caracteres ("Sprint de Descoberta: do problema ao preço fechado | Lemamon.dev") e o es 63 ("Sprint de Descubrimiento: plazo y precio cerrados | Lemamon.dev"). O desvio fica registrado em vez de cortar a promessa do title: o Google trunca por largura (cerca de 600 px), e o que pode cair é o fim da marca. Revisar se o Search Console mostrar o title reescrito.
6. **Sistemas web e aplicativos com a keyword da busca, não a de §3.1 original (auditoria SEO S06-6, 22/10/2026).** O title de `/servicos/sistemas-web` ganhou "web" ("Desenvolvimento de sistemas web para empresas | Lemamon.dev", 59 caracteres, cerca de 590 px): "sistemas web para empresas" é sugestão exata do autocomplete e, sem "web", 5 de 9 resultados são cursos de ADS. O de `/servicos/aplicativos` foi para o plural ("Desenvolvimento de aplicativos sob medida | Lemamon.dev"), a forma com sugestão. As descriptions acompanham; o H1 das duas páginas não muda. A keyword de §3.1 e do playbook 08 §2 foi atualizada junto; "em São Paulo" no title de aplicativos fica para a revisão com o Keyword Planner (B310).

### 15.5 Desvios registrados na Onda 2 (integração da migração para Astro)

Decisões das notas do i18n e do COPY.md marcadas com "Exige atualizar o BLUEPRINT" (linhas 1–12) e decisões do dono registradas em `docs/playbooks/15-registro-de-decisoes.md` (linhas 13 em diante), já implementadas e refletidas nas seções acima:

| # | Onde | Registro |
|---|---|---|
| 1 | §6.2, §6.3, §6.5, §6.6 (FAQ) | A composição do FAQ de cada página segue as notas `faq_composition` do i18n: perguntas do banco, condicionais e próprias intercaladas, **teto de 9 perguntas visíveis** (11 nas páginas de serviço desde a auditoria SEO S03-10, 22/10/2026) e ordem de remoção declarada pela página (ex.: serviços `invoice → nda → skip_discovery → need_tech_knowledge → what_is_mvp → third_party_system → discovery_plan_ownership`). |
| 2 | §6.3 | Tabela Sem/Com Descoberta com 4 linhas (entrou "Decisão"). |
| 3 | §6.3 | Faixa "Já recebeu a proposta?" depois do hero e no CTA final da Sprint, com mensagem de WhatsApp própria. |
| 4 | §6.5 | Faixa de compromissos depois do hero dos serviços (sustentação: só o item pós-lançamento). |
| 5 | §6.5 | CTAs em link de texto no meio das páginas de serviço (sinais, exemplos, método, fatores de preço), sempre com `?servico=` e `?origem={slug}-{seção}`; no FAQ, "diagnóstico gratuito" vira link sem mudar o texto. |
| 6 | §6.5 | "Por onde começa" (`how_it_starts`) como seção própria em sustentação. |
| 7 | §6.7 | Compromissos em linha compacta dentro de `after_send`; "Começar" repetido no fim da seção. |
| 8 | §7.2, §7.4, §7.6 | "Continuar" sem seleção na P3 = "Pular"; ordem dos tópicos/fatores do resumo; protocolo gerado ao abrir o resumo. |
| 9 | §7.10, §7.11 | Campo `subject` no `briefing`; evento `language_change`; `lead_failed` também no New Relic. |
| 10 | §8.1, §8.7, §9 | Faixa 1024–1279px do header; trilha da Sprint; aviso de idioma. |
| 11 | §10.1, §10.3 | URL curta do método (`/metodo`, `/en/method`, `/es/metodo`); WhatsApp com texto livre só por JS; toque da sessão gravado em toda página. |
| 12 | §6.13 | Itens prontos (e desligados) para ferramentas opcionais na Política; trava de lançamento ligada no build de produção. |
| 13 | Cabeçalho, §1 item 5, §3.1, §5.3, §5.5, §6.1, §6.5, §6.9, §6.11, §8.5 | **Praça: São Paulo, SP** desde 20/10/2026 (decisão do dono, D38; antes, Florianópolis, SC). Fatos confirmados, keyword de `/sobre`, selo da faixa de compromissos, CTA final, eyebrow da Home, `trust_profiles`, cards do `/contato`, hero de `/sobre`, footer e endereço do JSON-LD passam a dizer São Paulo. Formatos no site: pt "São Paulo, SP" ou "São Paulo, SP, Brasil"; en "São Paulo, Brazil"; es "São Paulo, Brasil". A análise de mercado das seções 01–07 continua com Florianópolis, como registro histórico. |
| 14 | §1 item 5, §6.1, §6.7, §8.4, §8.5 | **Razão social e CNPJ** ("Lemamon.dev LTDA", 69.700.690/0001-98) informados pelo dono em 20/10/2026 (D39): `hasCompanyData` ligado, "razão social · CNPJ" na barra inferior do footer e, no footer mínimo do wizard, numa linha própria; `legalName`/`taxID` no JSON-LD. Conferência da grafia e do município da sede contra o cartão CNPJ pendente com o dono (D39). |
| 15 | §1 item 5, §6.1, §9, §12, §14 | **Atende fora do Brasil (D31, 21/10/2026):** `confirmacoes.atendeExterior` (flag nova, exige `outrasCidades`, também ligada). Linha "Atendemos o mundo todo" no eyebrow da Home e o FAQ `other_cities` com a variante do exterior, uma pergunta só, nos 3 idiomas. Moeda, nota de exportação, foro e fuso continuam fora do site. |
| 16 | §1 item 5, §4, §6.1, §6.2, §6.3, §12 | **Revogada pela D44 (linha 18).** **Duração da Descoberta (D42, 21/10/2026):** `descoberta.duracao` sozinha ("em geral 1 semana") + `confirmacoes.duracaoDescoberta` liga `hasDiscoveryDuration`: a duração típica no FAQ "Quanto dura?" (em `/sprint-de-descoberta` logo depois de "Quanto custa?"), na tag da etapa 2 (variantes completa e destaque da linha do método e bloco da etapa em `/como-trabalhamos`) e na microcopy do hero de `/sprint-de-descoberta`. `hasDiscoveryFormat` continua exigindo os 4 campos. |
| 17 | §5.3, §6.1, §6.2, §6.5, §6.6, §6.7, §6.9 | **Auditoria de conversão, Pacote B** ([AUDITORIA-CONVERSAO](AUDITORIA-CONVERSAO.md), 21/10/2026): código do cliente como 4º compromisso, no risco "fornecedor que some", no 4º card e na linha "Código" de `/como-trabalhamos`, na 7ª pergunta da régua de `/quanto-custa` e no `wont_stall` do banco (F01, F37, F42, só com o rascunho `answer_draft`); NDA nas páginas de serviço e, com o código, em 2º/3º lugar no FAQ do `/orcamento` (F01); "Vocês assinam NDA? E quem acessa os dados?" em integrações (F15); microcopy "Sem compromisso · 45 minutos · devolutiva por escrito" (F41); preço e prazo pela afirmativa em `/quanto-custa` e nos FAQs de prazo (F08); no MVP, preço e prazo nas 2 primeiras perguntas, link do hero para elas e subtítulo novo (F12); perfis numa linha de links no `/contato` e na Home (a auditoria pedia só abaixo de 768px; a Home não tinha folga de CSS para uma variante só do celular), com "razão social · CNPJ" como frase de apoio na Home (F14; F70 em en/es). FAQ da Home com o código em 3º e a ordem de remoção invoice → how_follow_progress → diagnosis_commitment → nda. |
| 18 | §1.2, §1.5, §3.2, §4, §5.1, §5.2, §5.4, §5.9, §6.1–§6.7, §6.9, §7.3, §7.4, §8.6, §12, §14 | **Sprint de Descoberta gratuita, só quando necessária e sem protótipo (D44, 21/10/2026; revoga a D42):** tag "Gratuita · se for necessária" nas 3 variantes da linha do método (saem `tag_long` e `tag_long_with_duration`); 3 entregáveis; sem linha `descoberta` em `precos` (linha fixa "Sprint de Descoberta: gratuita, se for necessária" no Investimento, fora da sustentação; a seção `investment` de `/sprint-de-descoberta` saiu); `descoberta.duracao = null` no dado real e no fictício (o build recusa outro valor), sem `hasDiscoveryDuration`; `hasDiscoveryFormat` com 3 campos; `confirmacoes.descobertaAbatida` e `.descobertaUnicoCusto` saem do schema; FAQ `why_discovery_paid` vira `pay_before_development` ("Pago alguma coisa antes do desenvolvimento?") na Home, em `/como-trabalhamos`, em `/quanto-custa` e nas 4 páginas de projeto; `/sprint-de-descoberta` abre o FAQ por `discovery_cost` ("Nada") e `when_discovery` ("Toda empresa precisa?"); `discovery_credit` sai; as variantes `*_skip_variant` do `/orcamento` viram o texto base; `semDescoberta` passa a ligar só o FAQ `skip_discovery`; o resumo do wizard mostra só a faixa de desenvolvimento e diz que a primeira etapa paga é o desenvolvimento. |
| 19 | §4, §6.10, §14 | **Portfólio 2016–2021 em 29 cases sem o nome do cliente (D45, 21/10/2026):** `semTermo` (`decididoPor: "dono"`, `data`, `registro`) no lugar de `autorizacao`, aceito só em case sem `cliente`, `resultado`, prazo e preço, link do produto e depoimento; capa ilustrada do tipo de sistema, só o `alt` diz "Ilustração de…"; "Como foi" nas 4 etapas sem as promessas do método atual. |
| 20 | §5.4, §6.1, §6.2, §6.3, §6.5, §6.6, §6.13, §7.4, §15.4 | **Revisão da D44 (21/10/2026):** a frase "diagnóstico e Descoberta gratuitos" fica só em `pay_before_development` (sai de `how_much`, `free_estimate` e das 4 respostas de preço de serviço, vizinhas dela no FAQ); a tabela de `/sprint-de-descoberta` compara com "Sem entender o problema" (não "Sem Descoberta"); a Descoberta deixa de ser a única origem do preço fechado na Home ("Escopo, prazo e preço fechados, sem custo") e em `/quanto-custa` (o card da Descoberta diz que, sem ela, prazo e preço fecham do mesmo jeito; desenvolvimento "Preço fechado antes de começar"); o hero e a meta de `/como-trabalhamos`, a ênfase do resumo do wizard e o "Depois" do diagnóstico tratam a Descoberta como condicional; compromisso "Você decide antes de qualquer pagamento"; caixa das páginas de projeto "O que fica definido antes do desenvolvimento"; a Política cita a Descoberta gratuita como procedimento preliminar (art. 7º, V), com item novo na revisão jurídica; eyebrow "Etapa 2 de 4" mantido. |
| 21 | §6.1, §6.11, §6.13, §9, §10.1, §10.3 | **Auditoria SEO, parte técnica e de schema ([AUDITORIA-SEO](AUDITORIA-SEO.md), 22/10/2026):** 301 do host `*.netlify.app` de produção e dos 404 prováveis (`/index.html` por idioma fica sem 301: o canonical resolve e a regra arriscava loop na Home); robots com `max-image-preview:large`; Organization com `areaServed`/`knowsLanguage`/`contactPoint` pelas flags da D31; WebSite único nas 3 Homes; `Person` em Sobre (só com `hasTeam`); Article com `publisher`/`isPartOf` por `@id`; `/llms.txt`; âncoras localizadas em en/es com alias pt; FAQ fora do esperado no Rich Results Test; Política sem a frase da data enquanto não há data. Pendentes do dono: hreflang `pt` × `pt-BR` e `x-default` (S01-9) e política de rastreadores de IA (S05-9), no playbook 15. |

**Nota técnica (Astro + React):** os nomes de slot passados de um `.astro` para a ilha React precisam ser camelCase (`slot="timelineDiscovery"`). O renderer converte kebab-case no servidor, mas não no cliente, e o slot some na hidratação. Os `<MethodTimeline>` passados ao resumo do wizard usam `links="none"`, para o nome da etapa não tirar a pessoa do fluxo no meio do pedido.

**Pendências de decisão do dono** (registradas nos playbooks, `docs/playbooks/15-registro-de-decisoes.md`): perfis no rodapé (D01, CONTRACT §15.1), URL da empresa no LinkedIn (§1.5), outras cidades, telefone no JSON-LD (§1.5), publicação do tempo até o primeiro sistema (§12). Quando o dono decidir, os fatos e regras correspondentes deste documento mudam junto.
