# 09a — Catálogo do portfólio publicado

**Decisão:** D45 em [15](15-registro-de-decisoes.md). **Regras de prova:** [09](09-prova-cases-depoimentos.md) (§1 e §10, exceção `semTermo`).

29 projetos do portfólio viraram case **sem o nome do cliente** (setor + porte), em `src/content/cases/<pt|en|es>/<slug>.mdx`; **28 estão no ar** (o 33 espera setor e porte do dono),
com capa ilustrada em `src/content/cases/_imagens/<slug>/capa.png` (ilustração gerada por `scripts/gerar-capas-portfolio.mjs`, não tela real).
Nenhum tem termo do cliente: todos levam `semTermo` (decisão registrada do dono), que o schema só aceita em case sem `cliente`, sem `resultado`,
sem prazo e preço, sem link do produto e sem depoimento. A linha do tempo "Como foi" usa as 4 etapas que o dono declarou para todos (D45).

**Este repositório é público.** Nada aqui liga um case a um cliente: nome, marca, produto, parceiro e cidade ficam fora deste arquivo, dos MDX,
das URLs e das capas. A lista original com os nomes, as pendências e as perguntas de cada projeto ficam com o dono, fora do repositório.

## Para um case ganhar o nome do cliente

1. Termo assinado ([09](09-prova-cases-depoimentos.md) §6) com "Nome da empresa" marcado.
2. Trocar `semTermo` por `autorizacao` (com `escopo.nomeDoCliente: true`) e acrescentar `cliente` nos 3 idiomas.
3. De preferência, telas reais no lugar da ilustração.
4. `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn build` e `yarn test`.

## Cases publicados (na ordem do site: os 3 primeiros vão para a Home)

| Ordem | Página | Setor · porte | Serviços | Força |
|---|---|---|---|---|
| 10 | [Itens fabricados contados em tempo real, com as métricas da linha num painel](https://lemamon.dev/cases/controle-de-producao-com-contagem-automatica) | Indústria · Fabricante | Sistemas web, Integrações | 5/5 |
| 11 | [Gás doméstico comprado pelo celular e entregue direto ao consumidor, no Android e no iOS](https://lemamon.dev/cases/app-de-compra-de-gas) | Varejo · Distribuidora | Aplicativos | 4/5 |
| 12 | [Um sistema de gestão escolar que aproxima a administração da escola, os professores e os pais](https://lemamon.dev/cases/portal-escola-professores-e-pais) | Educação · Multinacional | Sistemas web, Aplicativos | 4/5 |
| 13 | [Documentos e arquivos das auditorias gerenciados em um sistema feito para as equipes de qualidade](https://lemamon.dev/cases/gestao-de-documentos-da-qualidade) | Indústria · Multinacional | Sistemas web | 4/5 |
| 14 | [Monitorar e validar se os trabalhadores usam os EPIs da forma correta, com sensores no próprio equipamento](https://lemamon.dev/cases/sensores-em-epis-com-app) | Energia · Grande empresa | Integrações, Aplicativos | 4/5 |
| 15 | [Um sistema para comprar passagens de ônibus pela web ou pelo aplicativo](https://lemamon.dev/cases/passagens-de-onibus-web-e-app) | Transporte · Multinacional | Sistemas web, Aplicativos | 4/5 |
| 16 | [Um app para lojistas e distribuidores de gás gerenciarem suas vendas e entregas](https://lemamon.dev/cases/app-do-revendedor-de-gas) | Varejo · Distribuidora | Aplicativos | 4/5 |
| 17 | [Controle da produção com os dados dos produtos fabricados registrados e exibidos em um painel](https://lemamon.dev/cases/painel-de-controle-de-producao) | Indústria · Fabricante | Sistemas web | 4/5 |
| 18 | [Arquivos das auditorias de processos organizados e geridos em um sistema para a equipe de qualidade](https://lemamon.dev/cases/arquivos-de-auditoria-de-processos) | Indústria · Grande empresa | Sistemas web | 4/5 |
| 19 | [Os vários testes de validação da linha de produção, automatizados e gerenciados em um painel](https://lemamon.dev/cases/painel-de-testes-automatizados) | Indústria · Multinacional | Sistemas web | 4/5 |
| 20 | [Um app que faz a placa Micro:bit trocar dados com aparelhos Android, por cabo ou por Bluetooth](https://lemamon.dev/cases/app-android-para-placa-educativa) | Educação · Grande empresa | Integrações, Aplicativos | 4/5 |
| 21 | [Um app que mostra ao usuário a própria rotina de saúde, a partir de métricas de dispositivos vestíveis](https://lemamon.dev/cases/app-de-saude-com-vestiveis) | Saúde e bem-estar · Estúdio | Aplicativos, Integrações | 4/5 |
| 22 | [Um painel web para pais e psicólogos analisarem os dados coletados enquanto as crianças jogam no celular](https://lemamon.dev/cases/painel-para-pais-e-psicologos) | Saúde e bem-estar · Estúdio | Sistemas web | 3/5 |
| 23 | [Seletores de produtos e ambientes que ajudam o usuário a achar a opção certa entre mais de cem](https://lemamon.dev/cases/seletores-de-produtos-para-varejo) | Varejo · Multinacional | Sistemas web | 3/5 |
| 24 | [Um widget para sites externos que mostra, em gráficos, a qualidade do ar da cidade selecionada](https://lemamon.dev/cases/widget-de-qualidade-do-ar) | Varejo · Multinacional | Sistemas web, Integrações | 3/5 |
| 25 | [Um painel informativo que mostra os índices de qualidade do ar em tempo real](https://lemamon.dev/cases/painel-de-qualidade-do-ar) | Indústria · Multinacional | Sistemas web, Integrações | 3/5 |
| 26 | [Um sistema para a polícia local levar com rapidez notícias, alertas e comunicados de segurança à população](https://lemamon.dev/cases/app-de-alertas-de-seguranca) | Setor público · Multinacional | Aplicativos | 3/5 |
| 27 | [Um jogo para celular feito para ajudar crianças a identificar e compreender as próprias emoções](https://lemamon.dev/cases/jogo-educativo-sobre-emocoes) | Educação · Estúdio | Aplicativos | 3/5 |
| 28 | [Um app para monitorar e medir o fluxo de veículos em vias públicas com visão computacional](https://lemamon.dev/cases/app-de-contagem-de-veiculos) | Transporte · Universidade pública | Aplicativos | 3/5 |
| 29 | [Um template de componentes modulares para o site de uma marca, integrado ao sistema de gestão de conteúdo](https://lemamon.dev/cases/template-modular-para-site-de-marca) | Alimentos e bebidas · Multinacional | Sistemas web | 2/5 |
| 30 | [Site oficial com gerenciamento de conteúdo para uma marca de alimentos exibir informações institucionais e de produtos](https://lemamon.dev/cases/site-institucional-com-cms) | Alimentos e bebidas · Marca de alimentos | Sistemas web | 2/5 |
| 31 | [Página inicial de um tribunal reformulada para modernizar o portal e facilitar a publicação de notícias](https://lemamon.dev/cases/portal-de-noticias-de-tribunal) | Setor público · Órgão público | Sistemas web | 2/5 |
| 32 | [A base de um sistema para evitar que descargas de energia estática danifiquem placas eletrônicas na produção](https://lemamon.dev/cases/deteccao-de-descarga-estatica) | Indústria · Multinacional | Integrações | 2/5 |
| 33 | Um painel interativo com visual aprimorado e interatividade mais evidente desde a página inicial (`painel-interativo-com-animacoes`, **fora do ar**: `publicado: false` nos 3 idiomas até o dono informar setor e porte; o schema recusa "A confirmar" em case publicado, auditoria SEO S02-2) | [PREENCHER: setor · porte] | Sistemas web | 2/5 |
| 34 | [Um site que apresenta de forma marcante o estudo de caso de uma IA que processa mensagens de bullying](https://lemamon.dev/cases/site-de-estudo-de-caso-de-ia) | Publicidade · Multinacional | Sistemas web | 2/5 |
| 35 | [Um app que guia e auxilia turistas e visitantes em uma cidade](https://lemamon.dev/cases/app-guia-turistico) | Setor público · Multinacional | Aplicativos | 2/5 |
| 36 | [Batalhas de gladiadores em uma arena, com salas locais para jogar com quem está na mesma rede](https://lemamon.dev/cases/jogo-multiplayer-de-arena) | Jogos · Multinacional | Aplicativos | 2/5 |
| 37 | [Site que divulga uma marca de alimentos na fase de pré-lançamento, com animações interativas](https://lemamon.dev/cases/site-de-pre-lancamento-com-animacoes) | Alimentos e bebidas · Marca de alimentos | Sistemas web | 1/5 |
| 38 | [Jogo de plataforma em que o jogador controla dois heróis ao mesmo tempo, com os mesmos botões](https://lemamon.dev/cases/jogo-de-plataforma-com-dois-herois) | Jogos · Multinacional | Aplicativos | 1/5 |

Fora do site: 2 campanhas de e-mail marketing e 1 curso de capacitação (não são sistema).
