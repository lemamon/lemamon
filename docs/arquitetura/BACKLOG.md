# Backlog consolidado

Gerado a partir dos 7 docs de especialistas. 606 pontos brutos → 387 itens após deduplicação e crítica de completude. Estado verificado contra o código pós-Onda 1. Dados completos (descrição, correção proposta, critério de aceite, fontes) em [`backlog.json`](backlog.json).

## Analytics (53)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B045 | P0 | parcial | Criar a propriedade GA4 e preencher VITE_GA4_ID em produção | outro |
| B046 | P0 | feito (Onda 1) | Disparar page_view a cada navegação da SPA | none |
| B116 | P0 | feito (Onda 1) | Instrumentar whatsapp_click com a origem do clique | none |
| B018 | P1 | parcial | Capturar e persistir a origem do lead (UTM, gclid, referrer, página de entrada) e enviá-la com o lead | none |
| B047 | P1 | aberto | Rastrear cliques nos CTAs principais (cta_click com tipo/origem) e completar os eventos de funil restantes | none |
| B049 | P1 | feito (Onda 1) | Registrar o início do wizard (wizard_start) | none |
| B052 | P1 | parcial | Enriquecer o evento de lead (generate_lead) com valor, serviços, orçamento e prazo | none |
| B106 | P1 | parcial | Importar o evento de lead do GA4 como conversão principal do Ads e remover a função global | outro |
| B107 | P1 | parcial | Criar alerta automático quando a captura de lead falhar | none |
| B115 | P1 | feito (Onda 1) | Criar camada única de analytics (track) no lugar da chamada direta de conversão | none |
| B119 | P1 | aberto | Disparar lead_qualified no servidor após aplicar a regra de MQL | none |
| B120 | P1 | aberto | Usar lead_qualified como conversão primária do Google Ads | outro |
| B272 | P1 | parcial | Reportar falhas do lead ao monitoramento (New Relic), não só ao GA4 | none |
| B339 | P1 | aberto | Disparar generate_lead_attempt com event_id antes do envio | none |
| B344 | P1 | aberto | Implementar Consent Mode v2 com banner de cookies | none |
| B373 | P1 | parcial | Estabelecer a linha de base de leads/mês e a meta de +30% em 90 dias | outro |
| B048 | P2 | parcial | Medir o clique em e-mail em todos os mailto, inclusive o do rodapé | none |
| B050 | P2 | parcial | Enriquecer o evento de etapa do wizard com as opções escolhidas e o tempo no passo | none |
| B051 | P2 | aberto | Medir o abandono do wizard (wizard_abandon) | none |
| B058 | P2 | aberto | Montar o painel/exploração de funil com KPIs semanais e metas | none |
| B065 | P2 | feito (Onda 1) | Instrumentar eventos em cada etapa do wizard | none |
| B117 | P2 | aberto | Instrumentar case_view por slug | none |
| B118 | P2 | aberto | Instrumentar pricing_view quando a seção de investimento entrar na tela | none |
| B326 | P2 | aberto | Avaliar a migração das tags para o Google Tag Manager | none |
| B330 | P2 | aberto | Disparar wizard_view na intro de /projects | none |
| B331 | P2 | parcial | Completar wizard_start com entry_source e não inflar o evento no reinício | none |
| B332 | P2 | parcial | Disparar wizard_step_view ao exibir cada passo | none |
| B333 | P2 | aberto | Rastrear cada seleção de opção (wizard_option_select) | none |
| B334 | P2 | feito (Onda 1) | Rastrear o retorno de passo (wizard_step_back) | none |
| B335 | P2 | aberto | Medir a fricção ao tentar avançar sem escolher (wizard_blocked) | none |
| B336 | P2 | feito (Onda 1) | Disparar form_view quando o formulário final aparece | none |
| B340 | P2 | feito (Onda 1) | Registrar a falha de envio do lead | none |
| B342 | P2 | aberto | Importar conversões offline no Google Ads (qualificado, reunião, proposta, venda) | outro |
| B343 | P2 | aberto | Vincular o Search Console ao GA4 | outro |
| B345 | P2 | aberto | Registrar as dimensões personalizadas no GA4 | none |
| B346 | P2 | aberto | Instalar a LinkedIn Insight Tag | outro |
| B348 | P2 | aberto | Ativar listas de remarketing (não iniciou, abandonou o wizard, converteu) | outro |
| B374 | P2 | aberto | Medir o % de leads A+B (qualidade, não volume) | none |
| B375 | P2 | aberto | Medir no CRM as conversões do funil comercial e o ciclo de venda | stack ✔ decidido |
| B056 | P3 | aberto | Rodar teste A/B de headline e CTA do hero quando houver volume | posicionamento ✔ decidido |
| B121 | P3 | aberto | Instrumentar schedule_click no botão de agendamento | none |
| B273 | P3 | aberto | Avaliar o Netlify Analytics como baseline imune a adblock | outro |
| B320 | P3 | aberto | Rodar o teste A/B do wizard de 4 passos contra 2 passos | none |
| B321 | P3 | aberto | Rodar o teste A/B com e sem faixa de preço na Home | preço |
| B322 | P3 | aberto | Rodar o teste A/B da captura de e-mail no passo 1 contra no fim | none |
| B327 | P3 | aberto | Medir a profundidade de scroll da Home (25/50/75/90%) | none |
| B328 | P3 | premissa inválida | Instrumentar blog_post_view e blog_read_complete quando o blog voltar | none |
| B329 | P3 | aberto | Rastrear a troca de idioma (language_change) | none |
| B337 | P3 | aberto | Rastrear o preenchimento de cada campo do formulário | none |
| B338 | P3 | parcial | Registrar o erro de validação do e-mail visto pelo usuário | none |
| B341 | P3 | parcial | Disparar lead_success_view na tela de sucesso | none |
| B347 | P3 | aberto | Instalar o Meta Pixel apenas para remarketing | outro |
| B376 | P3 | aberto | Montar o painel de KPIs financeiros | fatos operacionais |

## Design visual (45)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B068 | P1 | aberto | Trocar as ilustrações flat genéricas por screenshots/artefatos reais | prova real |
| B077 | P1 | aberto | Substituir o vermelho #ff0000 de hover/ação por um acento de marca com contraste adequado | outro |
| B168 | P1 | aberto | Criar src/styles/tokens.ts e envolver a app em ThemeProvider tipado | none |
| B170 | P1 | parcial | Separar a semântica do vermelho: erro, selecionado e hover | none |
| B180 | P1 | aberto | Criar escala tipográfica modular (h1 a h6 hoje têm todos 36px) | none |
| B093 | P2 | aberto | Trocar o favicon emoji por um favicon de marca | none |
| B169 | P2 | aberto | Unificar os azuis da marca em tokens brand | none |
| B171 | P2 | aberto | Remover o sublinhado ondulado vermelho do hover do menu e do footer | none |
| B175 | P2 | feito (Onda 1) | Tirar o azul #1890ff do antd do funil de conversão | none |
| B176 | P2 | aberto | Declarar Motiva Sans como uma família com pesos 300/700 e eliminar o faux bold | none |
| B177 | P2 | aberto | Trocar o fallback serif dos títulos por uma stack sans-serif | none |
| B197 | P2 | aberto | Trocar o logo.png raster do header por SVG | none |
| B198 | P2 | aberto | Converter o wordmark logo.svg em paths e unificar o logo do header e do footer | none |
| B203 | P2 | aberto | Criar um Grid/Row/Col próprio em CSS Grid com API compatível | stack ✔ decidido |
| B209 | P2 | parcial | Reescrever o Button com variantes, tamanhos, estados, loading e versão link | none |
| B210 | P2 | aberto | Criar os primitivos Text e Heading que desacoplam semântica de tamanho | none |
| B211 | P2 | aberto | Criar o wrapper Section com ritmo vertical padronizado | none |
| B212 | P2 | aberto | Criar o Badge de tecnologia com a stack real da Lemamon | fatos operacionais |
| B215 | P2 | aberto | Adotar a direção de arte 'Engenharia visível', com o artefato real como herói | prova real |
| B229 | P2 | aberto | Montar o layout do hero 7+5 com painel de código real | none |
| B082 | P3 | aberto | Remover o div espaçador Empty (53px) do rodapé e usar gap/margin | none |
| B172 | P3 | aberto | Consolidar os cinzas de superfície e borda em poucos tokens neutros | none |
| B173 | P3 | aberto | Unificar os cinzas de texto secundário | none |
| B174 | P3 | aberto | Eliminar o preto puro (#000) do MinTitle e dos links do footer | none |
| B178 | P3 | premissa inválida | Apagar o styled Logo morto que referencia a fonte Barriecito | none |
| B181 | P3 | aberto | Eliminar tamanhos de fonte avulsos e padronizar unidade e line-height | none |
| B182 | P3 | aberto | Adotar escala de espaçamento em grid de 4px | none |
| B185 | P3 | aberto | Trocar o Container calc(100% - 68px) por gutters de token e variantes de largura | none |
| B187 | P3 | aberto | Unificar as sombras em uma escala e reduzir a sombra do botão | none |
| B188 | P3 | aberto | Unificar os raios de borda e remover o radius 3rem morto do Block | none |
| B191 | P3 | aberto | Trocar ease-in por ease-out no hover do menu | none |
| B195 | P3 | aberto | Configurar vite-plugin-svgr para ícones recoloríveis | none |
| B199 | P3 | aberto | Parar de repetir o notes.svg nas duas colunas da seção Sobre | none |
| B208 | P3 | aberto | Implementar tema escuro com toggle e persistência sem flash | none |
| B214 | P3 | aberto | Criar os demais primitivos do design system (Stack, Card, Link, Dialog etc.) | none |
| B216 | P3 | aberto | Usar grid explícito com linhas de 1px e âncoras numeradas em mono | none |
| B217 | P3 | aberto | Alternar a densidade entre seções (densas com prova, respiradas com mensagem) | none |
| B218 | P3 | aberto | Criar um tema Prism customizado com os tokens | none |
| B219 | P3 | aberto | Produzir diagramas técnicos autorais em SVG com a linguagem da marca | prova real |
| B220 | P3 | aberto | Usar só foto real da equipe, sem stock de pessoas | prova real |
| B221 | P3 | aberto | Definir a marca gráfica: wordmark mono com '.dev' em acento | outro |
| B222 | P3 | aberto | Adotar grid de 12 colunas e proibir o 11+11 com space-between do ContentBlock | none |
| B223 | P3 | premissa inválida | Limitar a medida de leitura a 68ch | none |
| B224 | P3 | aberto | Ajustar o header: sombra só após scroll, blur, borda sutil e altura 72/64px | none |
| B385 | P3 | aberto | Decidir a família tipográfica da marca (Motiva ou sans variável + mono) | outro |

## Fluxo / UX (42)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B002 | P0 | aberto | Trocar o par de CTAs do hero por ação de baixo esforço (briefing/WhatsApp/diagnóstico) e secundário de prova | fatos operacionais |
| B011 | P0 | aberto | Criar a tela de estimativa (faixa, prazo, entregáveis) calculada a partir do data.json antes do formulário | preço |
| B012 | P0 | aberto | Adicionar indicador de progresso (Passo X de N) ao wizard | none |
| B124 | P0 | feito (Onda 1) | Colocar o wizard de orçamento na navegação principal | none |
| B008 | P1 | parcial | Transformar a seção Contato da Home em bloco de conversão | fatos operacionais |
| B013 | P1 | aberto | Adicionar a opção 'Ainda não sei / quero ajuda' nas etapas do wizard (com saída para WhatsApp) | none |
| B015 | P1 | aberto | Adicionar etapa/campo de faixa de investimento com opção 'ainda não tenho ideia' | preço |
| B016 | P1 | aberto | Adicionar pergunta de prazo/urgência ('quando precisa estar funcionando') | none |
| B017 | P1 | aberto | Adicionar campo opcional 'Empresa' (e site) ao formulário final | none |
| B040 | P1 | aberto | Criar a página de obrigado com protocolo, prazo de resposta e atalho para WhatsApp | fatos operacionais |
| B053 | P1 | aberto | Oferecer agendamento direto (Cal.com/Calendly) após a qualificação, inclusive na tela de sucesso | fatos operacionais |
| B059 | P1 | parcial | Persistir o estado do wizard em localStorage a cada passo e restaurar ao voltar | none |
| B064 | P1 | aberto | Mostrar a navegação horizontal no desktop e deixar o hambúrguer só no mobile | none |
| B066 | P1 | parcial | Colocar CTA primário visível no header de todas as rotas | prova real |
| B071 | P1 | aberto | Tornar o WhatsApp (com DDD) o campo de contato principal e o e-mail opcional | fatos operacionais |
| B105 | P1 | parcial | Reescrever a tela de erro do envio priorizando o WhatsApp e tranquilizando o lead | contato |
| B126 | P1 | aberto | Permitir pular perguntas opcionais e explicar o botão desabilitado | none |
| B131 | P1 | aberto | Trocar o menu de âncoras por navegação por rota (Serviços, Cases, Como trabalhamos) | none |
| B132 | P1 | aberto | Adicionar o WhatsApp como CTA secundário no header e ao lado de cada CTA | contato |
| B135 | P1 | aberto | Dar uma URL para cada etapa do wizard | none |
| B139 | P1 | aberto | Mostrar o resumo editável do escopo antes do envio | none |
| B151 | P1 | parcial | Impedir que 'Voltar ao início' na tela de erro descarte as respostas | none |
| B234 | P1 | parcial | Dar uma saída de contato real na tela do ErrorBoundary | none |
| B361 | P1 | aberto | Incluir 'Seu papel nessa decisão' no formulário final | none |
| B010 | P2 | aberto | Renomear /projects (briefing/orcamento) com redirect 301 e atualizar sitemap e Ads | none |
| B019 | P2 | aberto | Capturar o contato cedo (passo 2) e tornar opcionais os demais passos do wizard | none |
| B069 | P2 | aberto | Mostrar o impacto de prazo de cada recurso adicional no wizard | preço |
| B072 | P2 | parcial | Pré-preencher a mensagem do WhatsApp com o contexto da página de origem | none |
| B136 | P2 | aberto | Tornar a pergunta 1 de seleção única com avanço automático | none |
| B141 | P2 | aberto | Oferecer 'guardar e receber o link por e-mail' no meio do wizard | none |
| B144 | P2 | aberto | Aplicar máscara de telefone brasileiro | none |
| B145 | P2 | aberto | Tirar o mailto como CTA e exibir o e-mail como texto copiável | contato |
| B148 | P2 | aberto | Mostrar o resumo do escopo na confirmação, com opção de receber cópia | none |
| B149 | P2 | aberto | Adicionar 'Ver nossos cases' entre as ações pós-sucesso | prova real |
| B166 | P2 | aberto | Pré-selecionar o serviço no wizard via link (?servico=...) | none |
| B213 | P2 | aberto | Criar o StickyCta (barra fixa no mobile, botão no header após scroll) | none |
| B352 | P2 | aberto | Fazer a resposta da pergunta 1 mudar o fluxo e marcar a oferta do lead | none |
| B360 | P2 | aberto | Seguir as regras de desenho da qualificação: no fim, por faixas, com saída digna | none |
| B379 | P2 | aberto | Mostrar 2 cases semelhantes na tela de resultado do wizard | prova real |
| B130 | P3 | feito (Onda 1) | Remover o botão 'Leia Mais' do blog, que só rolava a página | none |
| B138 | P3 | premissa inválida | Pular a etapa de segmento quando o tipo escolhido não tiver filhos | none |
| B147 | P3 | aberto | Exibir um número de protocolo na confirmação | none |

## Outros (39)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B006 | P1 | aberto | Trocar o e-mail @gmail.com por um endereço do domínio lemamon.dev | contato |
| B042 | P1 | aberto | Classificar o lead automaticamente (MQL / A-B-C-D) e enviar a classe junto | preço |
| B057 | P1 | aberto | Definir e cumprir o SLA de primeiro contato com responsável e autoresponder | fatos operacionais |
| B312 | P1 | aberto | Iniciar a campanha de indicação 1:1 com 30 a 50 contatos | outro |
| B314 | P1 | aberto | Estruturar o Google Ads Search em campanhas por intenção, negativas e destino certo | outro |
| B102 | P2 | aberto | Apagar os arquivos soltos da raiz e o project-questions.json duplicado | none |
| B317 | P2 | aberto | Publicar perfis gratuitos no Clutch/GoodFirms com depoimentos verificados | prova real |
| B325 | P2 | aberto | Configurar o WhatsApp Business: saudação, ausência e respostas rápidas | fatos operacionais |
| B349 | P2 | aberto | Escolher o cenário de verba e os critérios de escalada | outro |
| B358 | P2 | aberto | Criar o roteiro fixo do diagnóstico e o template da devolutiva de 1 página | fatos operacionais |
| B364 | P2 | aberto | Implantar follow-up em D+3, D+7 e D+14 com lembrete automático | stack ✔ decidido |
| B142 | P3 | aberto | Migrar o schema do wizard para IDs semânticos | none |
| B179 | P3 | premissa inválida | Apagar o diretório vazio public/assets/fonts/Delicious | none |
| B183 | P3 | premissa inválida | Apagar estilos mortos citados como bugs visuais (CustomNavLink, Span, FormGroup) | none |
| B184 | P3 | aberto | Apagar Input/TextArea mortos ou transformá-los no primitivo Field | none |
| B186 | P3 | aberto | Remover a media query vazia de styles.ts | none |
| B190 | P3 | aberto | Remover a transition duplicada no Large do footer | none |
| B200 | P3 | aberto | Remover o twitter.svg sem referência | none |
| B202 | P3 | parcial | Eliminar os casts as any em styled(componente antd) | none |
| B204 | P3 | parcial | Substituir os componentes triviais do antd (Card, Layout.Content, Result, notification) | none |
| B206 | P3 | parcial | Reescrever Tag/Alert/Table/Checkbox e o tema Prism da página Post | stack ✔ decidido |
| B244 | P3 | feito (Onda 1) | Remover o código morto do useForm (fetch para url vazia) | none |
| B245 | P3 | aberto | Remover o validateProps órfão de src/common/types.ts | none |
| B246 | P3 | aberto | Apagar o src/react-app-env.d.ts (sobra do CRA) | none |
| B247 | P3 | aberto | Apagar o template.json do template Landy | none |
| B297 | P3 | aberto | Mover um post fictício para __fixtures__ fora do bundle, se os testes precisarem | none |
| B316 | P3 | aberto | Usar Workana/99Freelas de forma oportunista para gerar cases | fatos operacionais |
| B318 | P3 | aberto | Participar da ACATE e de meetups locais como rede de indicação | outro |
| B319 | P3 | aberto | Registrar a decisão de não investir agora em LinkedIn Ads nem GetNinjas | none |
| B324 | P3 | aberto | Separar a sequência de topo de funil para quem baixou isca e não pediu proposta | none |
| B350 | P3 | aberto | Fazer as revisões de 60 e 90 dias trocando estimativas por dado real | none |
| B357 | P3 | aberto | Embutir colchão de risco de 20 a 30% e medir horas reais contra as orçadas | fatos operacionais |
| B359 | P3 | aberto | Definir o limite semanal de diagnósticos e a regra para quando estourar | fatos operacionais |
| B368 | P3 | aberto | Extrair componentes reutilizáveis de problemas recorrentes | fatos operacionais |
| B369 | P3 | aberto | Monitorar a concentração de receita com teto de 25% por cliente | fatos operacionais |
| B370 | P3 | aberto | Implantar régua de cobrança e consulta de CNPJ antes de contratos grandes | fatos operacionais |
| B371 | P3 | aberto | Reduzir a dependência de pessoa-chave com processo documentado | fatos operacionais |
| B377 | P3 | aberto | Instituir os rituais comerciais semanal, mensal e trimestral | fatos operacionais |
| B387 | P3 | aberto | Entrar nas listas de 'melhores empresas de desenvolvimento de software' | outro |

## Estratégia de conteúdo (37)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B022 | P0 | feito (Onda 1) | Despublicar o blog fictício (rotas, link do rodapé e posts placeholder) | none |
| B030 | P0 | aberto | Criar a página /cases com grid de projetos reais | prova real |
| B032 | P0 | aberto | Produzir e publicar 2 a 3 cases reais estruturados (com autorização dos clientes) | prova real |
| B033 | P0 | aberto | Criar a seção de Cases na Home (CaseCard com resultado numérico) | prova real |
| B038 | P0 | aberto | Criar a seção 'Como trabalhamos' com etapas, entregáveis e prazo de cada uma | fatos operacionais |
| B279 | P0 | aberto | Confirmar com o dono os fatos marcados [CONFIRMAR] antes de publicar o copy | fatos operacionais |
| B003 | P1 | aberto | Cortar da Home o bloco Missão e os blocos institucionais redundantes | none |
| B031 | P1 | aberto | Criar a página de case completo /cases/:slug com resultado, prazo e CTA | prova real |
| B034 | P1 | aberto | Adicionar faixa de prova social/credibilidade abaixo do hero (logos autorizados, stack, números reais) | prova real |
| B035 | P1 | aberto | Adicionar seção de depoimentos nominais autorizados (nome, cargo, empresa, foto) | prova real |
| B036 | P1 | aberto | Criar páginas de serviço /servicos/:slug com escopo, prazo, faixa de preço e FAQ | preço |
| B039 | P1 | aberto | Criar a seção FAQ de objeções com acordeão acessível e JSON-LD FAQPage | fatos operacionais |
| B086 | P1 | aberto | Criar a seção do time com fotos, nomes e papéis reais | prova real |
| B113 | P1 | aberto | Criar a página /sobre com time real, CNPJ, endereço e forma de trabalho | contato |
| B134 | P1 | aberto | Criar a página /como-trabalhamos com processo, prazos e time | fatos operacionais |
| B227 | P1 | aberto | Reestruturar a Home na ordem promessa, prova, método, oferta, objeção e ação | posicionamento ✔ decidido |
| B281 | P1 | aberto | Criar a seção 'Problema' com cards de dor e CTA de conversa | none |
| B378 | P1 | aberto | Publicar prova sem nome do cliente (case anonimizado por setor e porte) enquanto falta autorização | prova real |
| B044 | P2 | aberto | Criar sequência de nutrição (D1 a D30) para leads frios | outro |
| B055 | P2 | aberto | Definir a pauta editorial de decisão de compra (fundo de funil) no lugar de tutoriais | preço |
| B110 | P2 | aberto | Publicar os artigos prioritários de fundo de funil (quanto custa, como escolher) | preço |
| B140 | P2 | aberto | Inserir prova social dentro do fluxo do wizard | prova real |
| B260 | P2 | aberto | Executar a fase 4 do Astro: Content Collections em MDX para cases e blog com schema Zod | stack ✔ decidido |
| B286 | P2 | aberto | Medir e publicar o tempo 'da assinatura ao primeiro sistema no ar' | fatos operacionais |
| B288 | P2 | premissa inválida | Não usar o GitHub como prova enquanto a org não tiver repositórios públicos | outro |
| B298 | P2 | aberto | Definir um autor real e único para o conteúdo | outro |
| B299 | P2 | aberto | Decidir o papel do Medium (canonical no site) e tirar o link do perfil vazio | outro |
| B315 | P2 | aberto | Começar a rotina de LinkedIn no perfil pessoal dos sócios | outro |
| B372 | P2 | aberto | Pedir depoimento no go-live de todo projeto | prova real |
| B054 | P3 | aberto | Republicar o blog (como /insights) só com posts reais e autoria real | prova real |
| B114 | P3 | aberto | Oferecer material compartilhável para o comprador justificar a contratação internamente | prova real |
| B123 | P3 | aberto | Criar landing pages por segmento para o Google Ads | posicionamento ✔ decidido |
| B264 | P3 | aberto | Trocar as chaves opacas do translation.json por chaves semânticas | none |
| B265 | P3 | aberto | Avaliar o Decap CMS sobre o MDX quando houver editor não técnico | none |
| B287 | P3 | aberto | Produzir um depoimento em vídeo de 60 s | prova real |
| B300 | P3 | aberto | Publicar os demais posts da pauta a cada 15 dias | fatos operacionais |
| B323 | P3 | aberto | Criar a newsletter mensal para leads com 60+ dias | none |

## Infra (29)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B007 | P0 | parcial | Ativar o WhatsApp em produção com o número real (VITE_WHATSAPP_NUMBER) | contato |
| B043 | P0 | parcial | Rotear cada lead para CRM/planilha e notificar o comercial na hora (e-mail/WhatsApp/Slack) | outro |
| B233 | P0 | feito (Onda 1) | Remover o pipeline fantasma do GitHub Pages e versionar o netlify.toml | none |
| B380 | P0 | aberto | Confirmar em produção que o Netlify detecta o form 'briefing' e fazer um envio real | fatos operacionais |
| B074 | P1 | aberto | Enviar e-mail transacional de confirmação (D0) ao lead com resumo e próximo passo | stack ✔ decidido |
| B240 | P1 | aberto | Criar o E2E do caminho do dinheiro em Playwright e rodá-lo diariamente em produção | none |
| B276 | P1 | aberto | Recriar a CI de qualidade no GitHub Actions (lint, typecheck, unit, build, e2e) | none |
| B362 | P1 | parcial | Garantir que nenhum lead se perca quando o envio falha | contato |
| B097 | P2 | aberto | Adicionar orçamento de bundle/Lighthouse CI no PR | none |
| B239 | P2 | aberto | Consertar o setupFiles do Vitest (src/setupTests.ts não existe) | none |
| B241 | P2 | aberto | Cobrir a lógica pura com cerca de 15 testes Vitest | none |
| B251 | P2 | aberto | Configurar ESLint 9 flat + Prettier + lint-staged/Husky | none |
| B252 | P2 | aberto | Zerar as vulnerabilidades crítica e altas das dependências | none |
| B254 | P2 | parcial | Adicionar Content-Security-Policy aos headers de segurança | none |
| B255 | P2 | aberto | Fixar o gerenciador de pacotes e alinhar o lockfile (Yarn 4 contra yarn.lock v1) | none |
| B257 | P2 | aberto | Executar a fase 1 do Astro: andaime com @astrojs/react, mdx e sitemap | stack ✔ decidido |
| B259 | P2 | aberto | Executar a fase 3 do Astro: ProjectBuilder e ContactForm como ilha client:load | stack ✔ decidido |
| B271 | P2 | feito (Onda 1) | Tirar a URL fixa do código e documentar as env vars num .env.example | none |
| B274 | P2 | aberto | Reavaliar o New Relic: manter só error tracking, sem session replay (ou trocar por Sentry) | stack ✔ decidido |
| B275 | P2 | aberto | Configurar monitor de uptime externo para o site e o fluxo de lead | none |
| B277 | P2 | parcial | Isolar os deploy previews: sem lead real, sem GA4 e sem conversão do Ads | none |
| B096 | P3 | aberto | Alinhar @types/react com o React 18 | none |
| B098 | P3 | premissa inválida | Não tratar o SPA fallback como problema: o deploy é Netlify e /projects já responde 200 | none |
| B230 | P3 | premissa inválida | Não tratar 'dist/ versionado' como dívida técnica | none |
| B248 | P3 | premissa inválida | Versionar scripts/build-og-image.sh | none |
| B249 | P3 | aberto | Mover typescript, vite, plugins e @types/* para devDependencies | none |
| B250 | P3 | aberto | Usar ou remover o vite-tsconfig-paths e acabar com os imports '../../' | none |
| B253 | P3 | aberto | Configurar Renovate ou Dependabot com agrupamento semanal | none |
| B386 | P3 | aberto | Atualizar o TypeScript 4.9 para 5.x | stack ✔ decidido |

## Copy (28)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B001 | P0 | aberto | Reescrever o hero (h1, subtítulo e eyebrow) com promessa específica e prova | posicionamento ✔ decidido |
| B280 | P0 | parcial | Dar ao wizard um rótulo honesto ('Montar o escopo do meu projeto — 4 perguntas') | none |
| B004 | P1 | aberto | Remover ou reescrever o MiddleBlock 'Transforme Ideias em Realidade' | fatos operacionais |
| B005 | P1 | aberto | Transformar 'Nossos Serviços' em cards de oferta com escopo, prazo e link (wizard/página) | posicionamento ✔ decidido |
| B009 | P1 | aberto | Reescrever a intro de /projects sem emoji, com promessa honesta de esforço e foco no momento do cliente | none |
| B014 | P1 | aberto | Reescrever a pergunta 1 do wizard em linguagem de negócio ('em que ponto você está') | posicionamento ✔ decidido |
| B060 | P1 | aberto | Reescrever o copy institucional da Home com fatos verificáveis e oferta por estágio do cliente | prova real |
| B073 | P1 | aberto | Reescrever a tela de sucesso com próximo passo e prazo concreto de resposta | fatos operacionais |
| B087 | P1 | aberto | Criar o CTA final da Home com horário de atendimento e prazo de resposta | fatos operacionais |
| B088 | P1 | aberto | Reestruturar o rodapé em colunas claras com barra de ©, CNPJ, endereço e Política de Privacidade | contato |
| B089 | P1 | aberto | Publicar a Política de Privacidade e adicionar aviso LGPD no formulário | contato |
| B101 | P1 | parcial | Reescrever title, description e OG alinhados ao posicionamento (keyword primeiro, description até 160 caracteres) | posicionamento ✔ decidido |
| B108 | P1 | aberto | Reescrever o rótulo da descrição como 'Qual problema você quer resolver?' e o botão de envio | none |
| B112 | P1 | aberto | Definir a oferta 'Diagnóstico gratuito' (30 a 45 min com devolutiva) como CTA principal | fatos operacionais |
| B167 | P1 | aberto | Unificar os rótulos de CTA do site: um primário e o WhatsApp como secundário | none |
| B282 | P1 | aberto | Reescrever o diferencial 'Inovação Constante' como 'Tecnologia madura, escolhida a dedo' | fatos operacionais |
| B283 | P1 | aberto | Reescrever 'Atendimento Personalizado' como mecanismo verificável | fatos operacionais |
| B289 | P1 | aberto | Reescrever o título e o texto do bloco de contato com instrução e prazo | fatos operacionais |
| B302 | P1 | aberto | Adotar o guia de tom de voz e o teste da negação na revisão de copy | none |
| B070 | P2 | aberto | Reescrever títulos, opções e microcopy das perguntas do wizard (sem superlativos) | none |
| B143 | P2 | aberto | Recolher a descrição livre e rotulá-la como opcional | none |
| B228 | P2 | aberto | Adicionar métricas de prova no hero (MetricStat), só com números verdadeiros | prova real |
| B290 | P2 | aberto | Reescrever 'anyQuestions' e 'Let's Chat' do rodapé e eliminar a frase duplicada | none |
| B382 | P2 | aberto | Reescrever os textos de estado do envio que falam em 'criar projeto' | none |
| B146 | P3 | aberto | Ajustar o rótulo do WhatsApp fora do horário comercial | fatos operacionais |
| B225 | P3 | aberto | Levar 'Florianópolis, SC' do rodapé para o hero | none |
| B226 | P3 | aberto | Incluir o argumento de fuso GMT-3 e sobreposição com os EUA (nearshore) | posicionamento ✔ decidido |
| B284 | P3 | premissa inválida | Remover a chave morta 'Saiba Mais' ou dar ao MiddleBlock um CTA real | none |

## Oferta e comercial (23)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B278 | P0 | aberto | Decidir o posicionamento de topo e registrá-lo | posicionamento ✔ decidido |
| B037 | P1 | aberto | Mostrar faixas de investimento 'a partir de R$ X' por oferta (seção Planos/PricingTable) | preço |
| B285 | P1 | aberto | Incluir nos contratos a cláusula de uso de marca em portfólio | outro |
| B291 | P1 | aberto | Tirar 'squad dedicado' da mensagem de topo e tratá-lo como continuidade | posicionamento ✔ decidido |
| B313 | P1 | aberto | Firmar 3 a 5 parcerias de canal com comissão por escrito | preço |
| B351 | P1 | aberto | Confirmar as premissas de negócio do plano: ticket, capacidade, caixa e responsável pelo SLA | fatos operacionais |
| B353 | P1 | aberto | Calcular o custo-hora interno real e o piso de margem antes de publicar preço | preço |
| B041 | P2 | aberto | Empacotar a oferta Squad Dedicado e sua página (/servicos/consultoria-react) só se houver capacidade | posicionamento ✔ decidido |
| B109 | P2 | aberto | Criar a oferta de Sustentação/continuidade e incluí-la por padrão na proposta | preço |
| B111 | P2 | aberto | Empacotar e publicar a oferta MVP em /servicos/mvp | fatos operacionais |
| B311 | P2 | aberto | Criar o lead magnet 'Checklist: 12 perguntas antes de contratar desenvolvimento' | none |
| B354 | P2 | aberto | Empacotar e publicar a oferta Sprint de Descoberta | fatos operacionais |
| B355 | P2 | aberto | Adotar preço fechado como modelo principal e nunca expor preço-hora | preço |
| B356 | P2 | premissa inválida | Definir o teto acima do qual a descoberta paga é obrigatória (sem objeto desde a D44, 21/10/2026: a Descoberta é gratuita e só acontece quando o diagnóstico mostra que é necessária; o que sobra, um critério interno para recomendá-la, fica na D04 do playbook 15) | preço |
| B363 | P2 | aberto | Padronizar a proposta comercial e apresentá-la ao vivo | fatos operacionais |
| B365 | P2 | aberto | Criar templates de escopo detalhado e contrato com cláusulas de proteção | fatos operacionais |
| B366 | P2 | aberto | Exigir 30% de entrada antes do kickoff e pagamento por marcos | fatos operacionais |
| B367 | P2 | aberto | Definir a meta de MRR e a meta de conversão em Sustentação | fatos operacionais |
| B122 | P3 | aberto | Criar calculadora pública de estimativa (escopo para faixa e prazo) | preço |
| B301 | P3 | aberto | Criar a isca 'modelo de escopo de projeto' com captura de e-mail | none |
| B303 | P3 | aberto | Rever o posicionamento de nicho ao ter 3 cases no mesmo setor | prova real |
| B383 | P3 | aberto | Montar uma tabela de pacotes pré-definidos para projetos abaixo do teto da descoberta | preço |
| B384 | P3 | aberto | Preparar NDA padrão e respostas prontas para questionário de segurança | fatos operacionais |

## Acessibilidade (18)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B075 | P0 | feito (Onda 1) | Restaurar o indicador de foco visível em todo o site | none |
| B152 | P0 | feito (Onda 1) | Tornar o botão hambúrguer acessível | none |
| B067 | P1 | feito (Onda 1) | Garantir um único <h1> por página e hierarquia de headings | none |
| B137 | P1 | parcial | Sinalizar a seleção com checkbox visível e contador, não só por cor | none |
| B153 | P1 | parcial | Estruturar os cards do wizard como radio/checkbox dentro de fieldset | none |
| B155 | P1 | aberto | Corrigir o contraste do botão desabilitado | none |
| B158 | P1 | parcial | Fazer o Enter num campo enviar o formulário | none |
| B193 | P1 | feito (Onda 1) | Corrigir o anel de foco dos inputs (aninhamento :focus-within morto) | none |
| B207 | P1 | aberto | Corrigir o contraste do âmbar proposto quando usado como texto ou anel de foco | outro |
| B078 | P2 | parcial | Respeitar prefers-reduced-motion no site inteiro | none |
| B129 | P2 | parcial | Manter <html lang> sincronizado com o idioma ativo do i18next | none |
| B133 | P2 | parcial | Trocar os itens de menu por <Link> reais do react-router | none |
| B156 | P2 | aberto | Dar uma borda perceptível ao botão secundário | none |
| B157 | P2 | parcial | Corrigir os textos alternativos dos links do rodapé | none |
| B159 | P2 | parcial | Garantir o anúncio das mudanças de estado do envio (loading, sucesso, erro) | none |
| B160 | P2 | aberto | Adicionar skip-link e landmark <main> | none |
| B205 | P2 | aberto | Reescrever o Drawer do header como diálogo nativo com focus-trap e sem !important | stack ✔ decidido |
| B154 | P3 | aberto | Usar links reais nos cards de post do blog quando a listagem voltar | none |

## Bugs (17)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B020 | P0 | feito (Onda 1) | Dar ação aos botões da tela de sucesso do formulário | none |
| B021 | P0 | feito (Onda 1) | Eliminar os crashes de getElementById (header, ScrollToTop, MiddleBlock, ContentBlock) com helper de scroll e ErrorBoundary | none |
| B231 | P0 | feito (Onda 1) | Trocar o backend Heroku morto por Netlify Forms na captação de leads | none |
| B232 | P0 | feito (Onda 1) | Trocar process.env por import.meta.env | none |
| B023 | P1 | feito (Onda 1) | Remover do rodapé os links mortos (Press, Careers & Culture, About apontando para /) | none |
| B061 | P1 | aberto | Renderizar botões e seções do ContentBlock pela presença de dados, não pela direção (sem wrappers vazios) | none |
| B062 | P1 | parcial | Validar campos inline no blur com mensagem por campo (aria-describedby) e manter 'Enviar' habilitado | none |
| B125 | P1 | aberto | Tornar os grupos da pergunta 3 rótulos, não cards falsamente clicáveis | none |
| B238 | P1 | aberto | Criar os lazy() do Router uma única vez e trocar fallback={null} por skeleton | none |
| B267 | P1 | feito (Onda 1) | Adicionar timeout de 12 s e retry com backoff no envio do lead | none |
| B270 | P1 | parcial | Separar erro de validação de erro de rede na interface | none |
| B381 | P1 | aberto | Manter o form estático do index.html em dia com cada campo novo do lead | none |
| B268 | P2 | feito (Onda 1) | Validar nome, e-mail e telefone no cliente antes de enviar | none |
| B269 | P2 | parcial | Completar o anti-spam com checagem de tempo mínimo de preenchimento | none |
| B150 | P3 | parcial | Limpar o rascunho do orçamento só depois do sucesso confirmado | none |
| B194 | P3 | feito (Onda 1) | Corrigir o hover de link aninhado morto (a :hover) | none |
| B263 | P3 | aberto | Corrigir a colisão de colunas da tabela no renderizador de Post | none |

## SEO (17)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B024 | P0 | feito (Onda 1) | Corrigir as meta tags do index.html (lang/og:locale pt-BR, og:image 1200x630, twitter:*, sem keywords nem og:url duplicada) | none |
| B025 | P1 | feito (Onda 1) | Publicar sitemap.xml e declará-lo no robots.txt | none |
| B026 | P1 | aberto | Gerar title, description e OG próprios por rota | stack ✔ decidido |
| B029 | P1 | aberto | Criar e verificar o Perfil da Empresa no Google (SEO local Florianópolis) | contato |
| B103 | P1 | aberto | Verificar o domínio no Google Search Console/Bing e enviar o sitemap | outro |
| B304 | P1 | aberto | Corrigir o canonical estático que aponta /projects para a Home | none |
| B306 | P1 | aberto | Adicionar JSON-LD Organization/ProfessionalService com Florianópolis | contato |
| B310 | P1 | aberto | Validar as keywords no Google Keyword Planner | outro |
| B100 | P2 | aberto | Criar rotas por idioma (/, /en, /es) com hreflang recíproco, ou despublicar en/es | posicionamento ✔ decidido |
| B256 | P2 | aberto | Aprovar a migração para Astro | stack ✔ decidido |
| B258 | P2 | aberto | Executar a fase 2 do Astro: Layout com <head> completo por página e Home/Header/Footer em .astro | stack ✔ decidido |
| B262 | P2 | aberto | Executar a fase 6 do Astro: redirects das URLs antigas no corte de tráfego | stack ✔ decidido |
| B305 | P2 | aberto | Redirecionar com 301 /lemamon e /home para / | none |
| B309 | P2 | aberto | Pré-renderizar as rotas e entregar HTML com conteúdo a crawlers sem JS | stack ✔ decidido |
| B242 | P3 | feito (Onda 1) | Corrigir o manifest.json, que se identificava como 'Landy - React Template' | none |
| B307 | P3 | aberto | Adicionar JSON-LD FAQPage nas páginas de serviço | fatos operacionais |
| B308 | P3 | parcial | Completar o manifest.json com ícones 192/512 e theme-color coerente | none |

## Performance (17)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B063 | P1 | feito (Onda 1) | Resolver a URL do SvgIcon no render, sem 'Loading...' nem render duplo | none |
| B085 | P1 | aberto | Servir as fontes em woff2 (subset) com font-display: swap e preload | none |
| B094 | P1 | aberto | Remover o import global de antd/dist/antd.css | stack ✔ decidido |
| B095 | P1 | feito (Onda 1) | Trocar o import * as AntIcons por um registro explícito de ícones | none |
| B104 | P1 | aberto | Tirar do index.html o snippet inline e bloqueante do New Relic | none |
| B235 | P1 | aberto | Dar dimensões reais, fetchpriority e preload à imagem do hero | none |
| B236 | P1 | feito (Onda 1) | Servir /assets/* com Cache-Control immutable | none |
| B237 | P1 | aberto | Importar estaticamente os componentes da primeira dobra da Home | none |
| B090 | P2 | aberto | Trocar react-awesome-reveal por animação CSS/IntersectionObserver leve | none |
| B091 | P2 | aberto | Otimizar o contact-us.png (~287 KB) para WebP/AVIF com srcset e lazy | none |
| B196 | P2 | parcial | Dar dimensões intrínsecas, aspect-ratio e lazy-load às imagens (CLS) | none |
| B243 | P2 | aberto | Remover o i18next-xhr-backend (deprecated e sem uso) | none |
| B261 | P2 | aberto | Executar a fase 5 do Astro: cortar antd, i18next, react-awesome-reveal, prismjs e react-router | stack ✔ decidido |
| B092 | P3 | aberto | Otimizar com SVGO os SVGs (brasil.svg de 32 KB e ilustrações) | none |
| B189 | P3 | aberto | Trocar transition: all por transições de propriedades explícitas | none |
| B201 | P3 | aberto | Adicionar preconnect para os domínios de terceiros (gtag e New Relic) | none |
| B266 | P3 | aberto | Trocar o listener de scroll do ScrollToTop por IntersectionObserver | none |

## Mobile (12)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B127 | P1 | feito (Onda 1) | Definir type, inputMode e autoComplete nos campos do formulário | none |
| B079 | P2 | aberto | Consolidar os breakpoints em uma escala única mobile-first | none |
| B080 | P2 | aberto | Mostrar os ícones sociais do rodapé também no mobile | none |
| B081 | P2 | aberto | Remover overflow-x:hidden do body e corrigir os estouros na origem | none |
| B084 | P2 | aberto | Garantir alvo de toque mínimo de 44x44px (bandeiras, header, footer, scroll) | none |
| B161 | P2 | parcial | Evitar que os cards do wizard estourem a viewport em 320px | none |
| B162 | P2 | aberto | Empilhar o layout de 2 colunas do ContentBlock entre 576 e 768px | none |
| B163 | P2 | aberto | Desaninhar as colunas do rodapé | none |
| B164 | P2 | aberto | Reduzir o corpo de texto no mobile para manter a hierarquia | none |
| B165 | P2 | aberto | Empilhar os botões do wizard no mobile, com o primário embaixo e largura total | none |
| B083 | P3 | aberto | Exibir o botão de voltar ao topo no mobile sem colidir com o WhatsApp | none |
| B192 | P3 | aberto | Restringir efeitos de hover a dispositivos com ponteiro fino | none |

## Idiomas (10)

| ID | P | Status | Item | Depende de |
|---|---|---|---|---|
| B027 | P1 | feito (Onda 1) | Usar pt como fallbackLng do i18next | none |
| B076 | P1 | aberto | Trocar as bandeiras por um seletor de idioma textual e acessível | none |
| B099 | P1 | parcial | Fixar pt-BR como idioma padrão servido e indexado, sem idioma misturado, até haver URL por idioma | posicionamento ✔ decidido |
| B128 | P1 | feito (Onda 1) | Corrigir a página 404 (em inglês e com Result do antd) | none |
| B028 | P2 | aberto | Decidir o futuro de en/es e retirar do seletor os idiomas sem demanda | posicionamento ✔ decidido |
| B292 | P2 | aberto | Corrigir 'Product' para 'Services' no EN | none |
| B295 | P2 | parcial | Garantir que toda chave usada no código exista nos translation.json | none |
| B296 | P2 | aberto | Detectar o idioma como sugestão (banner), sem trocar o conteúdo automaticamente | none |
| B293 | P3 | aberto | Corrigir 'Do you have any question?' para o plural no EN | none |
| B294 | P3 | aberto | Unificar o tratamento por 'tú' no ES e tirar o calco '¡siéntase libre!' | none |

