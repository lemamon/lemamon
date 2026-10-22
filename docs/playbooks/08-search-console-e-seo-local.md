# 08 — Search Console, sitemap, palavras-chave, Google Business Profile e diretórios

**Backlog:** B103 (Search Console e Bing com sitemap), B024 (prévia de compartilhamento revalidada depois do primeiro deploy, §1.1), B310 (validar no Keyword Planner as palavras-chave do BLUEPRINT §3.1 e todos os termos do 06 §6.3.1), B029 (Perfil da Empresa no Google e Rich Results Test), B317 (Clutch e GoodFirms), B387 (listas de "melhores empresas"), B343 (vínculo com o GA4, junto com o playbook 06).
**Fontes:** BLUEPRINT §3.1 (keyword por página), §6.5 (keywords secundárias por serviço), §10.3; 06-marketing §6.3; `public/robots.txt`; `astro.config.mjs` (sitemap).

---

## 1. Google Search Console (B103)

1. https://search.google.com/search-console › **Adicionar propriedade › Domínio** › `lemamon.dev`.
2. Copie o registro **TXT** e adicione no DNS do domínio (o DNS de lemamon.dev está em [PREENCHER: Netlify DNS ou registrador]). Clique em **Verificar**; a propagação pode levar horas.
3. **Sitemaps** › envie `https://lemamon.dev/sitemap-index.xml` (o `robots.txt` já aponta para ele). Esperado: status "Sucesso" e as páginas descobertas.
4. **Inspeção de URL** › teste e peça indexação, uma por vez: `/`, `/como-trabalhamos`, `/sprint-de-descoberta`, `/servicos`, as 5 páginas de serviço, `/quanto-custa`, `/orcamento`, `/contato`, `/en/`, `/es/`. Em "Ver página testada", o HTML precisa trazer o H1 e o texto (o site novo é estático: não depende de JavaScript).
5. **Bing Webmaster Tools:** https://www.bing.com/webmasters › importar do Search Console › conferir o sitemap.
6. **Vínculo com o GA4:** playbook 06 §9.

**O que é normal aparecer como "não indexada"** (não é erro):

| Situação no relatório "Páginas" | URL | Motivo |
|---|---|---|
| Excluída pela tag "noindex" | `/orcamento/enviado`, `/en/quote/sent`, `/es/cotizacion/enviada`, páginas 404 | de propósito (BLUEPRINT §3.1) |
| Página com redirecionamento | `/projects`, `/diagnostico`, `/lemamon`, `/home`, `/post/*`, `/?lng=…` | 301 do `netlify.toml` (§10.1) |
| Página alternativa com tag canônica adequada | `/orcamento?servico=…&origem=…` e variantes | o canonical aponta para a URL limpa |

**Critério de aceite:** propriedade de domínio verificada, sitemap com "Sucesso" e, no fim da Onda 2, pelo menos 8 rotas indexadas (README §7).

**Rotina mensal:** Desempenho (consultas e páginas com impressão e sem clique), Páginas (o que saiu do índice), Experiência (Core Web Vitals), e a comparação com a palavra-chave de cada página (§2). Página when_data nova (cases, sobre, blog) entra no sitemap sozinha: peça indexação dela quando publicar.

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
6. **Dados estruturados no Rich Results Test:** https://search.google.com/test/rich-results › **URL** › `https://lemamon.dev/` › Testar URL. Esperado: **Organização** detectada (com o logo) e nenhum **erro** (vermelho). O nó da Home é `Organization` + `ProfessionalService`, com nome, site, logo, e-mail, "São Paulo, SP, BR" (`ADDRESS` em `src/config/site.ts`) e os perfis em `sameAs`. Avisos (amarelos, "campo opcional ausente") são **esperados** e não são erro: `streetAddress`, `postalCode` e `telephone`, porque o site não publica rua nem telefone (BLUEPRINT §1.5), e `priceRange`, porque nenhum preço é publicado (decisão 3 do dono). Antes do lançamento, dá para testar o deploy preview: abra a Home do preview, copie o código-fonte (Ver código-fonte da página) e cole na aba **Código** da ferramenta. Repita quando a empresa (`empresa.razaoSocial`/`cnpj`, que acrescentam `legalName` e `taxID`) ou um telefone forem publicados em `dados/dono.json`. Registre em [15](15-registro-de-decisoes.md) §2.
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
- **Atenção:** esses diretórios costumam pedir **faixa de valor por hora** e **tamanho mínimo de projeto**. Publicar preço-hora contradiz a política comercial (playbook 02 §4). Se o campo for obrigatório, decida e registre a exceção em [15](15-registro-de-decisoes.md), ou não crie o perfil.
- Destaque pago: não fazer antes de 8 a 10 avaliações reais (06 §6.4.2).
- Critério de aceite: perfis publicados com pelo menos 3 avaliações verificadas.

## 5. Listas de "melhores empresas de desenvolvimento de software" (B387)

**Pré-requisito:** pelo menos 1 case publicado.

1. Pesquise no Google: "melhores empresas de desenvolvimento de software", "empresas de desenvolvimento de software em São Paulo", "fábrica de software São Paulo", "empresa de aplicativos São Paulo".
2. Anote as 10 primeiras listas na planilha:

```
lista,url,consulta,posicao,aceita_inclusao,como(formulario|contato|pago),custo,status,data_envio,data_inclusao,link_de_referencia
```

3. Candidate-se com o link do case e da página de serviço. Inclusão paga só com decisão registrada (e sabendo que o leitor não sabe que foi pago).
4. Meça: GA4 › Aquisição › origem da sessão (referral) de cada lista.

Critério de aceite: planilha com status e pelo menos 2 inclusões confirmadas em 90 dias.
