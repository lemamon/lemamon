# 08 — Search Console, sitemap, palavras-chave, Google Business Profile e diretórios

**Backlog:** B103 (Search Console e Bing com sitemap; auditoria SEO S01-2, S01-7, S05-11), B024 (prévia de compartilhamento revalidada depois do primeiro deploy, §1.1), B310 (validar no Keyword Planner as palavras-chave do BLUEPRINT §3.1 e todos os termos do 06 §6.3.1), B029 (Perfil da Empresa no Google e Rich Results Test), B317 (Clutch e GoodFirms), B387 (listas de "melhores empresas"), B343 (vínculo com o GA4, junto com o playbook 06).
**Fontes:** BLUEPRINT §3.1 (keyword por página), §6.5 (keywords secundárias por serviço), §10.1, §10.3; 06-marketing §6.3; [AUDITORIA-SEO](../arquitetura/AUDITORIA-SEO.md) (22/10/2026); `public/robots.txt`; `astro.config.mjs` (sitemap); `netlify.toml` (redirects).

---

## 1. Google Search Console (B103)

1. **Pelo menos 3 dias antes do dia 0** ([14](14-calendario-90-dias.md), "Antes do dia 0"): https://search.google.com/search-console › **Adicionar propriedade › Domínio** › `lemamon.dev`. Use a propriedade de **Domínio** (cobre `https`, `http`, `www` e qualquer subdomínio), não a de prefixo de URL. A coleta de dados começa quando a propriedade é adicionada: verificada antes, ela registra a troca de site desde o primeiro dia, e no dia 0 já dá para enviar o sitemap e pedir indexação (auditoria SEO S01-2).
2. Copie o registro **TXT** e grave no **Netlify DNS**, que é o DNS de `lemamon.dev` (servidores de nome `dns1` a `dns4.p05.nsone.net`): app.netlify.com › **Domains** › `lemamon.dev` › **DNS settings** › **Add new record** › tipo **TXT**, no domínio raiz (`lemamon.dev`), com o valor copiado do Search Console. O registro SPF com `secureserver.net` que aparece no DNS é só do e-mail (D41): **não grave o TXT de verificação lá** nem no painel da GoDaddy. Clique em **Verificar**; a propagação pode levar horas. Registre a data em [15](15-registro-de-decisoes.md) §2.
3. **Dia 0, Sitemaps** › envie `https://lemamon.dev/sitemap-index.xml` (o `robots.txt` já aponta para ele; `/sitemap.xml` também leva a ele por 301). Esperado: status "Sucesso" e as páginas descobertas.
4. **Inspeção de URL** › teste e peça indexação, uma por vez. A cota é de **cerca de 10 pedidos por dia**: no **dia 0**, `/`, `/en/`, `/es/`, `/orcamento` e as 5 páginas de serviço; no **dia 1**, `/como-trabalhamos`, `/sprint-de-descoberta`, `/quanto-custa`, `/servicos`, `/contato` e `/cases`. Em "Ver página testada", o HTML precisa trazer o H1 e o texto (o site novo é estático: não depende de JavaScript).
5. **Bing Webmaster Tools** (auditoria SEO S05-11): https://www.bing.com/webmasters › importar do Search Console (pode ser logo depois da verificação do passo 2, antes do dia 0, ou no dia 0) › conferir o sitemap. O índice do Bing alimenta o Copilot e parte da busca do ChatGPT: na troca de site, ele também precisa saber que as URLs mudaram. Depois de um deploy com página nova ou mudada (case, post), use **Envio de URL** no próprio Bing Webmaster.
   - **IndexNow (próximo passo, não implementado):** avisar o Bing sozinho a cada deploy de produção. Como seria: uma chave em `public/<chave>.txt` e, num plugin `onSuccess` do Netlify que só roda com `CONTEXT=production`, um POST para `https://api.indexnow.org/indexnow` com as URLs do `sitemap-0.xml`. Vale pedir ao agente `shell` quando cases ou posts passarem a sair com frequência; até lá, o Envio de URL resolve.
6. **Vínculo com o GA4:** playbook 06 §9.

**Conferências técnicas do dia 0** (logo depois do deploy de produção; auditoria SEO, 22/10/2026):

- [ ] `curl -sI https://lemamon.dev/` sem `x-robots-tag`; na Home, `<meta name="robots" content="index, follow, max-image-preview:large">`; `https://lemamon.dev/robots.txt` com a linha do sitemap.
- [ ] `curl -sI https://boring-shockley-7c50b2.netlify.app/servicos/mvp` → **301** para `https://lemamon.dev/servicos/mvp` (o host do Netlify não fica como cópia rastreável; S01-1). O deploy preview continua 200, com o noindex do Netlify.
- [ ] `curl -sI https://lemamon.dev/index.html` → 301 para `/`, e `curl -sI https://lemamon.dev/` → **200** (sem loop; S01-5). Se `/` entrar em loop, apague as 3 regras de `/index.html` do `netlify.toml`: o canonical resolve sozinho.
- [ ] `curl -sI https://lemamon.dev/sitemap.xml` e `/contact` → 301 (S01-4).
- [ ] `https://lemamon.dev/llms.txt` → 200, `text/plain`, com as páginas nos 3 idiomas (S05-10).
- [ ] Tudo isso roda sozinho: `E2E_NETLIFY_URL=https://lemamon.dev yarn playwright test tests/e2e/redirects.spec.ts --project=desktop` (e no E2E diário, depois de `E2E_PRODUCAO_ATIVO = true`). Antes do merge, o mesmo comando contra o deploy preview confere os 301 e a raiz com 200.

**O que é normal aparecer como "não indexada"** (não é erro):

| Situação no relatório "Páginas" | URL | Motivo |
|---|---|---|
| Excluída pela tag "noindex" | `/orcamento/enviado`, `/en/quote/sent`, `/es/cotizacion/enviada`, páginas 404 | de propósito (BLUEPRINT §3.1) |
| Página com redirecionamento | `/projects`, `/diagnostico`, `/lemamon`, `/home`, `/post/*`, `/?lng=…`, `/contact`, `/quote`, `/Diagnostico`, `/servicos/sistema-web`, `/en/projects`, `/es/projects`, `/sitemap.xml`, `/index.html` (e `/en/`, `/es/`), qualquer URL de `boring-shockley-7c50b2.netlify.app` | 301 do `netlify.toml` (BLUEPRINT §10.1) |
| Página alternativa com tag canônica adequada | `/orcamento?servico=…&origem=…`, `/orcamento?ref=…`, `/en/quote?…`, `/es/cotizacion?…` e variantes: cerca de **780 URLs** do wizard com query, porque cada CTA do site leva `?origem=` (e o de serviço, `?servico=`) | **esperado** (auditoria SEO S01-7): o canonical aponta para a URL limpa e o Google indexa só ela. Não é erro e não pede ação; só preocupa se a URL limpa (`/orcamento`) sair de "Válida" |

**Critério de aceite:** propriedade de domínio verificada, sitemap com "Sucesso" e, no fim da Onda 2, pelo menos 8 rotas indexadas (README §7).

**Semanas 1 a 4 (uma vez por semana, não todo dia):**

- Páginas › "Não encontrado (404)" e, no GA4, o evento `page_not_found` por `path`: caminho antigo com visita ou com link de fora ganha um 301 no `netlify.toml` (pedido ao agente `shell`).
- Páginas › conferir que os "não indexados" são os da tabela acima, e nada mais.
- Desempenho › consultas que contêm "lemamon" e "lemon" (a marca nova ainda é confundida com Lemon.dev; meta de referência: Home em 1º para "lemamon.dev" até 60 dias depois da indexação).

**Rotina mensal:** Desempenho (consultas e páginas com impressão e sem clique), Páginas (o que saiu do índice), Experiência (Core Web Vitals), e a comparação com a palavra-chave de cada página (§2). Página when_data nova (cases, sobre, blog) entra no sitemap sozinha: peça indexação dela quando publicar. Nos dias 60 e 90, a revisão de SEO do [13](13-kpis-e-rituais.md) §7 decide as trocas de title que ficaram esperando dado.

### 1.1 Logo após o primeiro deploy do site novo: prévia de compartilhamento (B024)

O HTML novo já tem tudo certo (`og:image` 1200×630 por página e idioma, `og:locale`, `twitter:card`; conferido no build). O problema é o cache das redes: Facebook, LinkedIn e WhatsApp guardaram a prévia do site antigo, que tinha `lang=en`, nenhuma `og:image` e `og:locale` inválido, e continuam mostrando essa prévia sem imagem até alguém pedir a releitura. A `og:image` é uma URL absoluta (`https://lemamon.dev/assets/img/og/…`), então isso só dá para fazer **depois** que o domínio estiver servindo o site novo.

URLs para conferir, com a imagem esperada (arquivos em `public/assets/img/og/`):

| URL | Imagem esperada |
|---|---|
| https://lemamon.dev/ | `default-pt.jpg` |
| https://lemamon.dev/como-trabalhamos | `how_we_work-pt.jpg` |
| https://lemamon.dev/servicos/mvp | `service_mvp-pt.jpg` |
| https://lemamon.dev/quanto-custa | `pricing-pt.jpg` |
| https://lemamon.dev/en/ | `default-en.jpg` |
| https://lemamon.dev/es/ | `default-es.jpg` |

1. **Facebook Sharing Debugger** (vale também para o WhatsApp, que usa a mesma leitura de Open Graph): https://developers.facebook.com/tools/debug/ (pede login no Facebook). Cole cada URL da tabela › **Depurar** › **Coletar novamente** ("Scrape Again"). Esperado: a imagem da tabela, 1200×630; título e descrição no idioma da URL; `og:locale` `pt_BR`, `en_US` ou `es_LA`; nenhum aviso sobre `og:image`. O aviso de `fb:app_id` ausente é esperado (o site não tem app do Facebook) e não é erro.
2. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/ (pede login). Cole cada URL › **Inspect**. A inspeção já atualiza o cache do LinkedIn. Esperado: a mesma imagem, título e descrição.
3. **WhatsApp:** cole `https://lemamon.dev` numa conversa (a conversa com você mesmo serve) e espere a prévia antes de enviar. Esperado: miniatura com a imagem, título e descrição em português. Se aparecer a prévia antiga, sem imagem, é o cache do aparelho: teste em outro aparelho depois do passo 1. Nunca espalhe o link com parâmetro inventado só para furar o cache.
4. **Slack (se a equipe usar):** cole o link num canal; esperado: prévia com a imagem grande.
5. **Sempre que uma arte de `public/assets/img/og/` mudar:** os arquivos dessa pasta não têm hash no nome; o Netlify entrega a versão nova na hora, mas as redes guardam a imagem pela URL. Por isso a arte nova precisa de **nome novo** (ex.: `default-pt-v2.jpg`). O nome sai do código (`ogImageFile` em `src/components/shell/seo.ts` e `scripts/build-og-image.sh`): peça a troca ao agente `shell` e, depois do deploy, repita os passos 1 a 3 para as URLs afetadas.

**Feito quando:** os 3 validadores (Sharing Debugger, Post Inspector e WhatsApp) mostram a imagem nova nas 6 URLs da tabela, sem aviso de `og:image`. Registre a data e os avisos em [15](15-registro-de-decisoes.md) §2.

## 2. Validar as palavras-chave no Keyword Planner (B310)

As palavras-chave dos documentos são estimativas, sem consulta a ferramenta (06 §6.3). Valide antes de escrever conteúdo novo ou subir campanha.

1. Google Ads › Ferramentas › **Planejador de palavras-chave** › "Ver volume de pesquisa e previsões".
2. Cole **as duas listas** abaixo (todos os termos, inclusive os que já estão marcados como fora: o volume deles serve de comparação). Local: Brasil (depois, repita para o estado de São Paulo; até 20/10/2026 a praça era Florianópolis e a repetição era para Santa Catarina, D38). Idioma: português. Período: 12 meses.
3. Exporte e preencha a planilha:

```
palavra_chave,pagina,intencao,volume_brasil,volume_sp,concorrencia,lance_baixo,lance_alto,prioridade_revista,decisao
```

**Lista de partida** (BLUEPRINT §3.1 e §6.5):

| Página | Palavra-chave primária | Secundárias |
|---|---|---|
| `/` | desenvolvimento de software sob medida | empresa de desenvolvimento de software |
| `/como-trabalhamos` | desenvolvimento de software com preço fechado | — |
| `/sprint-de-descoberta` | sprint de descoberta | discovery de produto |
| `/servicos` | serviços de desenvolvimento de software | — |
| `/servicos/sistemas-web` | desenvolvimento de sistemas web para empresas (auditoria SEO S06-6: sugestão exata; sem "web", a SERP é de cursos) | desenvolvimento de sistemas para empresas, sistema sob medida, erp sob medida, crm sob medida, portal do cliente |
| `/servicos/aplicativos` | desenvolvimento de aplicativos sob medida (auditoria SEO S06-6: o plural tem sugestão, o singular não) | desenvolvimento de aplicativo sob medida, criar aplicativo para empresa, aplicativo ios e android, quanto custa desenvolver um aplicativo |
| `/servicos/integracoes` | integração de sistemas | integração erp e e-commerce, automação de processos, chatbot para empresas |
| `/servicos/mvp` | desenvolvimento de mvp | criar mvp para startup, desenvolvimento de produto digital |
| `/servicos/sustentacao` | sustentação de sistemas | manutenção de software, evolução de sistema |
| `/quanto-custa` | quanto custa desenvolver um sistema | quanto custa um software sob medida |
| `/orcamento` | orçamento de desenvolvimento de software (06 §6.3.1: "orçamento desenvolvimento de software") | — |
| `/sobre` (quando existir) | empresa de desenvolvimento de software em São Paulo | desenvolvimento de software São Paulo, desenvolvimento de software SP |

A praça das palavras-chave locais é **São Paulo** desde 20/10/2026 (D38). O 06 §6.3.1 (em `docs/arquitetura/`) ainda diz Florianópolis porque é análise histórica; o BLUEPRINT §3.1 e o title de `/sobre` no i18n (`meta.about.title`) já usam São Paulo. Em São Paulo, os termos locais tendem a ter mais volume e lance mais alto do que tinham em Florianópolis: compare `volume_sp` e `lance_alto` antes de escolher a palavra-chave local de `/sobre` e do Perfil da Empresa.

**Inglês e espanhol no semestre (auditoria SEO S07-14):** as páginas en e es e o hreflang ficam como estão, mas **nenhum conteúdo novo em espanhol** nos primeiros 6 meses: as cabeças em es dependem do país ("desarrollo de software en mexico", "…colombia") e uma página por país seria doorway. Em inglês, também nada novo além do que já existe; o que se mede é a impressão das páginas atuais.

**Termos do 06 §6.3.1 (comparação e conteúdo).** Os termos do 06 §6.3.1 que não estão na lista de partida. Com as duas listas, cada termo do 06 §6.3.1 aparece em exatamente uma delas. A coluna "decisão prévia" já vai preenchida na planilha (coluna `decisao`); o volume real pode mudar a decisão, mas a mudança passa pelo BLUEPRINT.

| Termo (06 §6.3.1) | Intenção | Uso / página-alvo | Decisão prévia |
|---|---|---|---|
| fábrica de software | transacional | comparação com a primária da Home | medir só para comparar; FAQ "A Lemamon.dev é uma fábrica de software?" removida (BLUEPRINT §15.3) |
| empresa de desenvolvimento de aplicativos | transacional | comparação com a primária de `/servicos/aplicativos` | candidata a secundária de `/servicos/aplicativos` e a grupo do Ads `aplicativos` (07 §5) |
| consultoria em desenvolvimento de software | comercial | comparação com a primária da Home | medir; candidata a secundária da Home |
| terceirização de desenvolvimento / outsourcing de TI | comercial | comparação com a primária da Home | medir; no Ads, negativa se a busca for por alocação de pessoas (Squad não é oferta pública, 02 §2, D02) |
| agência de desenvolvimento de aplicativos São Paulo (no 06 §6.3.1, com Florianópolis; praça trocada na D38) | comercial, local | `/sobre` (quando existir), `/servicos/aplicativos` e Perfil da Empresa (§3) | comparar com "desenvolvimento de software São Paulo"; candidata a palavra-chave local |
| consultoria react | comercial | — | fora: Squad não é oferta pública (02 §2, D02) |
| desenvolvedor react freelancer / empresa react | comercial | — | fora: Squad não é oferta pública (02 §2, D02); negativa no Ads |
| squad as a service / alocação de desenvolvedores | comercial | — | fora: Squad não é oferta pública (02 §2, D02); negativa no Ads |
| melhores empresas de desenvolvimento de software no Brasil | comercial | listas de terceiros | estar nas listas (§5); não escrever lista própria |
| quanto tempo leva para desenvolver um app | informacional | tema de blog e comparação com `/servicos/aplicativos` | post só sem prazo numérico (BLUEPRINT §12): o prazo é fechado antes do desenvolvimento |
| diferença entre app nativo e híbrido | informacional | tema de blog (meio de funil), link para `/servicos/aplicativos` | candidato à pauta depois dos 5 primeiros posts (12 §7) |
| como escolher uma fábrica de software | informacional | tema de blog | comparar com "como escolher empresa de desenvolvimento de software", a forma da pauta 4 (12 §7; BLUEPRINT §6.12); o título usa a de maior volume |
| checklist para contratar desenvolvimento de software | informacional | `/quanto-custa#como-comparar` (a régua de perguntas) e tema de blog | isca com captura de e-mail fora por enquanto (12 §8, D17) |
| o que é MVP | informacional | `/servicos/mvp` (a definição abre a resposta do FAQ "O que entra na primeira versão?", `what_goes_in`, e vai no FAQPage; auditoria SEO S03-7) | medir; genérico demais para post próprio (06) |
| como criar um aplicativo do zero | informacional | — | fora do posicionamento: intenção de fazer sozinho (06 §6.3.1); negativa no Ads |
| react ou angular / react vs vue | informacional | — | fora: Squad não é oferta pública (02 §2, D02); atrai desenvolvedor, não comprador |

**O que fazer com o resultado:**
- Se a primária de uma página tem volume desprezível e uma secundária é muito maior, **proponha** a troca: title, H1 e meta são copy (i18n, dono `shell`) e estão amarrados ao BLUEPRINT §3.1. A mudança passa pelo integrador; não é automática.
- Use os volumes e lances para escolher as campanhas iniciais do Ads (playbook 07 §5).
- Repita depois de 90 dias com os dados do Search Console (consultas reais que já trazem impressões).

Critério de aceite: planilha com volume e lance reais de cada termo das duas listas (BLUEPRINT §3.1 + 06 §6.3.1), com a prioridade revista.

## 3. Perfil da Empresa no Google (B029)

1. https://business.google.com › **Adicionar empresa** › nome **"Lemamon.dev"**, exatamente (sem palavra-chave no nome: isso viola as diretrizes do Google).
2. **Categoria principal:** a mais próxima de "empresa de software" ou "desenvolvedor de software" na lista em português. Secundárias: no máximo [PREENCHER], só se coerentes com os 5 serviços.
3. **Local:**
   - Se não há atendimento presencial no endereço, configure como **empresa de área de serviço** e oculte o endereço. O Google pede o endereço para verificar, mesmo oculto: use um endereço real da Lemamon.dev em São Paulo, SP (caixa postal e escritório virtual sem equipe no local não são aceitos pelas diretrizes do Google).
   - Área de serviço: São Paulo, SP (desde 20/10/2026, D38; antes, Florianópolis). Outras cidades só com `confirmacoes.outrasCidades`.
   - **Perfil já criado com Florianópolis:** edite o endereço (continua oculto) e troque a área de serviço para São Paulo. O Google pode pedir nova verificação; até ela sair, as edições ficam pendentes. Não crie um segundo perfil para a cidade nova: as diretrizes do Google proíbem perfil duplicado da mesma empresa.
4. **Contato:**
   - Telefone: [PREENCHER: decidir se o número do WhatsApp fica público no perfil].
   - Site: `https://lemamon.dev/?utm_source=google&utm_medium=organic&utm_campaign=gbp` (a UTM separa no GA4 quem veio do perfil).
5. **Verificação:** siga o método que o Google oferecer (vídeo é o mais comum).
6. **Dados estruturados no Rich Results Test:** https://search.google.com/test/rich-results › **URL** › `https://lemamon.dev/` › Testar URL. Esperado: **Organização** detectada (com o logo) e nenhum **erro** (vermelho). O nó da Home é `Organization` + `ProfessionalService`, com nome, site, logo, e-mail, "São Paulo, SP, BR" (`ADDRESS` em `src/config/site.ts`), os perfis em `sameAs` e, com a D31, `areaServed` "Worldwide", `knowsLanguage` e `contactPoint` nos 3 idiomas; ao lado, o nó `WebSite`. **Não espere FAQ** (auditoria SEO S02-9): o rich result de FAQ foi descontinuado pelo Google (deixou de aparecer em 07/05/2026, segundo a página de atualizações da Busca citada na auditoria). O `FAQPage` continua no HTML, mas o Rich Results Test e o relatório de melhorias do Search Console não mostram mais FAQ; isso não é erro. Nas páginas de serviço, da Sprint e dos cases, o esperado é **Navegação estrutural** (BreadcrumbList). Avisos (amarelos, "campo opcional ausente") são **esperados** e não são erro: `streetAddress`, `postalCode` e `telephone`, porque o site não publica rua nem telefone (BLUEPRINT §1.5), e `priceRange`, porque nenhum preço é publicado (decisão 3 do dono). Antes do lançamento, dá para testar o deploy preview: abra a Home do preview, copie o código-fonte (Ver código-fonte da página) e cole na aba **Código** da ferramenta. Repita quando a empresa (`empresa.razaoSocial`/`cnpj`, que acrescentam `legalName` e `taxID`) ou um telefone forem publicados em `dados/dono.json`. Registre em [15](15-registro-de-decisoes.md) §2.
7. **Descrição** (até 750 caracteres; só fatos confirmados):

   > A Lemamon.dev desenvolve software sob medida em São Paulo, SP: sistemas web, aplicativos, integrações e automação, MVPs e sustentação e evolução. Escopo, prazo e preço são combinados antes de começar. Tudo começa por um diagnóstico gratuito de 45 minutos, com devolutiva por escrito. Quando é necessária, vem a Sprint de Descoberta, também gratuita, que transforma o problema em escopo priorizado e um plano com prazo e preço fechados para o desenvolvimento. No desenvolvimento, você recebe software funcionando a cada 2 semanas.

   Se esta descrição já estiver publicada no Perfil da Empresa, troque lá também (D44, 21/10/2026: a Descoberta deixou de ser paga e de entregar protótipo).

8. **Serviços:** Diagnóstico gratuito · Sprint de Descoberta · Sistemas web · Aplicativos · Integrações e automação · MVP e produtos digitais · Sustentação e evolução. Sem preço.
9. **Horário:** [PREENCHER] (o mesmo do WhatsApp Business, playbook 04 §7).
10. **Fotos:** logo e capa. Fotos de pessoas só reais (time, quando houver). Nada de banco de imagem.
11. **Avaliações:** peça só a clientes reais, depois de uma entrega, com o link de avaliação do perfil. **Nunca** ofereça desconto ou brinde em troca, nunca peça a amigos e familiares. Responda todas. Avaliações não vão para o site (o JSON-LD não leva rating, BLUEPRINT §6.1).
12. **Postagens:** quando houver novidade real (case publicado, post do blog), com link e UTM `utm_campaign=gbp-post`.
13. **Mensagens pelo perfil:** deixe desligado se ninguém for responder dentro do SLA.

**Consistência de nome, cidade e site (NAP):** o mesmo nome, `lemamon.dev` e "São Paulo, SP" do footer (`shared.footer.location`: "São Paulo, SP, Brasil") e do JSON-LD (`ProfessionalService`, sem endereço de rua). Se o perfil mostrar telefone e você quiser o mesmo no JSON-LD, isso é um fato novo: registre no BLUEPRINT §1.5 e peça ao agente `shell`.

**Mudança de praça para São Paulo, SP (D38, 20/10/2026): o que atualizar fora do código.** O site (i18n, JSON-LD e imagens de prévia) já diz São Paulo. Uma cidade diferente em qualquer outro lugar quebra a consistência de NAP. Faça uma vez e marque na D38:

- [ ] **Perfil da Empresa no Google:** endereço oculto e área de serviço em São Paulo (passo 3 acima); descrição do passo 7.
- [ ] **Google Ads:** local de cada campanha, título "Lemamon.dev · São Paulo, SP" e frase de destaque "São Paulo, SP" ([07](07-google-ads.md) §2, item 4, e §5).
- [ ] **WhatsApp Business:** descrição, endereço e mensagem de saudação ([04](04-sla-follow-up-e-nutricao.md) §7).
- [ ] **LinkedIn, GitHub e Medium:** localização "São Paulo, SP, Brasil" no LinkedIn (perfil de quem posta e página da empresa, quando existir), no campo *Location* da organização `lemamon-dev` no GitHub e na bio do Medium, se ela citar cidade ([12](12-canais-indicacao-linkedin-conteudo.md) §6).
- [ ] **Diretórios e listas:** cidade nos perfis do Clutch e do GoodFirms e nas listas em que a Lemamon.dev já estiver (§4 e §5), se existirem.
- [ ] **Modelos fora do repositório:** assinatura de e-mail, respostas rápidas do WhatsApp e cópias salvas da devolutiva, da proposta e do one-pager ([01](01-diagnostico-e-devolutiva.md) §6, [02](02-proposta-e-politica-comercial.md) §12, [04](04-sla-follow-up-e-nutricao.md) §2). Os modelos destes playbooks já estão com São Paulo.
- [ ] **Depois do deploy:** Rich Results Test da Home (passo 6) mostrando "São Paulo". As imagens de prévia (`public/assets/img/og/`) foram regeneradas com São Paulo antes do primeiro deploy do site novo, então não precisam de nome novo; se alguma delas já tiver ido ao ar com Florianópolis, siga o §1.1, passo 5.
- Search Console e Bing não mudam: a propriedade é do domínio, não da cidade.

Critério de aceite: perfil verificado, aparecendo no Maps; Rich Results Test da Home sem erros (passo 6); nome, cidade e site do perfil iguais aos do footer e do JSON-LD.

## 4. Diretórios com avaliação verificada (B317)

**Clutch e GoodFirms:** perfil gratuito, avaliações verificadas por entrevista com o cliente.

- **Quando:** depois de pelo menos um projeto entregue com cliente disposto a dar a avaliação (o mesmo fluxo de autorização do playbook 09).
- **Atenção:** esses diretórios costumam pedir **faixa de valor por hora** e **tamanho mínimo de projeto**. Publicar preço-hora contradiz a política comercial (playbook 02 §4). **Regra (proposta da D23 em [15](15-registro-de-decisoes.md); auditoria SEO S04-7):** não publicar preço-hora nem projeto mínimo (projeto mínimo é um "a partir de", justamente o que o site critica na comparação de `/como-trabalhamos`). Campo **opcional**: deixe em branco e aceite ficar fora dos filtros de preço. Campo **obrigatório**: não crie o perfil, ou registre a exceção na D23.
- **O que esperar:** o link do perfil no Clutch é `nofollow`, e o do plano grátis do Softdex também não passa autoridade. O ganho é prova social e visita de referência, não ranking. Todo link do perfil para o site leva UTM: `https://lemamon.dev/?utm_source=clutch&utm_medium=referral&utm_campaign=diretorio` (troque `clutch` por `goodfirms` ou `softdex`).
- **Ordem** (auditoria SEO, (g)): (1) Página do LinkedIn e (2) organização `lemamon-dev` no GitHub, antes do dia 0 (são perfis próprios, §6); (3) **Softdex**, plano grátis, depois do dia 0 (o domínio precisa servir o site novo), com 3 a 5 cases e o texto anonimizado do site; **nunca** o plano pago com "backlinks dofollow" (é link pago sem `rel="sponsored"`); (4) **Clutch** e (5) **GoodFirms**, com o 1º cliente da Lemamon.dev disposto a avaliar; (6) TechBehemoths e DesignRush, opcionais, depois do Clutch. Fora por agora: Sortlist, ABES e listas pagas sem rótulo. O NAP é o mesmo do §3 em todos.
- Destaque pago: não fazer antes de 8 a 10 avaliações reais (06 §6.4.2).
- Critério de aceite: perfis publicados com pelo menos 3 avaliações verificadas.

## 5. Listas de "melhores empresas de desenvolvimento de software" (B387)

**Pré-requisito:** pelo menos 1 case publicado.

1. Pesquise no Google: "melhores empresas de desenvolvimento de software", "empresas de desenvolvimento de software em São Paulo", "fábrica de software São Paulo", "empresa de aplicativos São Paulo".
2. Anote as 10 primeiras listas na planilha:

```
lista,url,consulta,posicao,aceita_inclusao,como(formulario|contato|pago),custo,status,data_envio,data_inclusao,link_de_referencia,tipo,rel(follow|nofollow|ugc|sponsored)
```

3. Candidate-se com o link do case e da página de serviço. Inclusão paga só com decisão registrada (e sabendo que o leitor não sabe que foi pago).
4. Meça: GA4 › Aquisição › origem da sessão (referral) de cada lista.

`tipo` = `perfil` (próprio), `diretorio`, `lista`, `parceiro`, `evento`, `imprensa` ou `blog`; `rel` = o atributo do link que aponta para lemamon.dev (abra o código-fonte da página e procure `lemamon.dev`). A mesma planilha vale para todas as fontes do §6. Descarte as listas assinadas por um concorrente que se coloca em 1º.

Critério de aceite: planilha com status e pelo menos 2 inclusões confirmadas em 90 dias.

## 6. Links de referência (auditoria SEO S04-4)

Sem playbook novo: esta seção só junta, numa visão única, as fontes de link que os outros playbooks já preveem, em ordem de quando acontecem. Toda fonte entra na planilha do §5 (com `tipo` e `rel`).

| Fonte | Onde está o passo a passo | Quando | O que vale |
|---|---|---|---|
| README da organização `lemamon-dev` no GitHub (nome "Lemamon.dev", site, cidade) | D35 (a) no [15](15-registro-de-decisoes.md); [12](12-canais-indicacao-linkedin-conteudo.md) §6 | antes do dia 0 | sinal de entidade (`sameAs`), não autoridade |
| Perfil da Empresa no Google | §3 | quinzena 2 ([14](14-calendario-90-dias.md)), se elegível | local e visita |
| Página da empresa no LinkedIn | [12](12-canais-indicacao-linkedin-conteudo.md) §6 | antes do dia 0: a auditoria achou a Página `/company/lemamondev`, que o dono ainda confirma como a oficial (S02-1); posts a partir da quinzena 3 | entidade e visita |
| Clutch e GoodFirms (e Softdex grátis) | §4 | quinzena 4 em diante | prova social e visita (`nofollow`) |
| Listas de "melhores empresas" | §5 | com 1 case publicado | visita e presença na SERP das listas |
| Parceiros de canal | [12](12-canais-indicacao-linkedin-conteudo.md) §3 | com cada acordo | menção editorial (abaixo) |
| Eventos e comunidade | [12](12-canais-indicacao-linkedin-conteudo.md) §4 | 1 a 2 por mês | link na página do evento, quando houver |
| Medium com canonical para lemamon.dev | [12](12-canais-indicacao-linkedin-conteudo.md) §7 | quinzena 5, com o blog | leitura e visita (o canonical devolve o crédito ao post original) |

**Fases:** (0) antes do dia 0, perfis próprios linkando https://lemamon.dev; (1) semanas 1 a 8, Perfil da Empresa, Softdex grátis e a menção dos parceiros; (2) depois do 1º cliente avaliador, Clutch, GoodFirms e candidatura às listas do §5; (3) contínua, depende do dono: pautas do fundador (só com `/sobre` e pessoa real), `/quanto-custa#como-comparar` como peça citável (aberta, sem PDF nem formulário, D17) e código aberto na organização só com aprovação do dono.

**Link do parceiro:** menção no site do parceiro é opcional e nunca cláusula do acordo; o texto está no [12](12-canais-indicacao-linkedin-conteudo.md) §3. Se a comissão depender do link, ele leva `rel="sponsored"`.

**Proibido:** comprar link, rede de blogs (PBN), troca de links em massa, conteúdo patrocinado sem `rel="sponsored"` e cadastro em massa em diretórios.

**Medição:** Search Console › Links e GA4 › origem `referral` por domínio, usando a coluna `rel` para não contar `nofollow` como link editorial. Sem meta numérica até a linha de base do dia 30 ([13](13-kpis-e-rituais.md) §2).
