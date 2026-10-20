## O que muda

<!-- 1 a 3 frases: o problema, a mudança e como conferir. Cite o item do backlog (Bxxx) se houver. -->

## Conferido localmente

- [ ] `yarn i18n:check`
- [ ] `yarn run check` (astro check)
- [ ] `yarn test`
- [ ] `yarn build` (sem `PUBLIC_DADOS_FICTICIOS`)
- [ ] Nada de dado fictício, pessoa, cliente, número ou valor em R$ inventado fora de `dados/ficticio/` e dos arquivos de dados de preço/qualificação

## Copy (B302)

Preencha esta seção quando o PR mexer em `src/i18n/**`, `src/content/**`, `scripts/build-og-image.sh` ou `public/assets/img/og/**`. Caso contrário, apague-a.

O teste `tests/unit/i18n.test.ts` já barra as palavras proibidas e os rótulos genéricos ("Saiba mais", "Conheça mais", "Fale conosco"). O resto depende de quem revisa. Fonte: `docs/playbooks/12-canais-indicacao-linkedin-conteudo.md` §7.

- [ ] A frase começa pelo problema do cliente, não pela Lemamon.
- [ ] "A gente" e "você"; frases curtas; parágrafo de até 3 linhas.
- [ ] Nenhuma palavra proibida: soluções, transformação digital, inovação, excelência, de ponta, melhor, líder, referência, incrível, extraordinário, poderoso.
- [ ] Nenhum advérbio de reforço (realmente, verdadeiramente, completamente).
- [ ] Nenhum emoji em título.
- [ ] Nenhum número que não seja 45 minutos, a cada 2 semanas, ou dado real confirmado.
- [ ] Nenhuma promessa não confirmada (prazo de devolutiva, duração de MVP ou Descoberta, SLA, "atendemos todo o Brasil", "assumimos sistemas de terceiros", "você fala com quem escreve o código").
- [ ] Termos fixos: "diagnóstico gratuito", "devolutiva por escrito", "Sprint de Descoberta", "entregas a cada 2 semanas" (algarismo), "escopo, prazo e preço" (nessa ordem).
- [ ] Teste da negação: se o concorrente consegue escrever o contrário sem parecer ridículo, reescreva. Se a frase serve para qualquer agência, reescreva.
- [ ] CTA único e específico, terminando no diagnóstico gratuito.
- [ ] Mesma mudança em pt, en e es (paridade conferida pelo `yarn i18n:check`).
