/**
 * CAÇADOR DE VAZAMENTO da camada fictícia (dono: gated). Usa os builds reais
 * do globalSetup (tests/unit/support/builds-dos-dados.ts):
 *
 *  - SEM a flag: nenhum marcador fictício (nomes, CNPJ, e-mails, URLs, slugs,
 *    textos, frases dos MDX, imagens e o conteúdo delas, a classe e o atributo
 *    da faixa, noindex,nofollow) em nenhum arquivo ou nome de arquivo do dist/,
 *    nem página when_data que só a camada liga;
 *  - COM a flag (local): os mesmos marcadores aparecem (prova de que o caçador
 *    funciona), toda página tem a faixa e noindex,nofollow;
 *  - PRODUÇÃO com a flag: a camada é ignorada com aviso. Com empresa e
 *    privacidade vazias, o build FALHA na trava da Política (dado fictício nunca
 *    satisfaz o launch blocker); com dado real, passa e o dist é byte a byte o
 *    mesmo do build de produção sem a flag;
 *  - LOCAL com a flag e sem --outDir: o build vai para dist-ficticio/, nunca
 *    para dist/ (a pasta que o Netlify publica);
 *  - nenhum placeholder "{…}" sem interpolar em HTML nenhum (texto ou JSON-LD);
 *  - nenhum módulo de src/ importa a camada (trava estática; a trava de build
 *    está na integração);
 *  - IMAGEM fictícia alterada: com bytes a mais ou a menos (janelas de bytes
 *    crus, também em base64) e recodificada/convertida/recortada (semelhança
 *    perceptual), no dist/ e em src/, public/ e dados/;
 *  - camada 1 (plugin): url() de CSS, new URL(…, import.meta.url) e asset
 *    emitido da camada derrubam o build com ela desligada;
 *  - ATAQUES reais (globalSetup): cada caminho de vazamento derruba o build e
 *    não deixa dist/ para trás; outDir por link simbólico não cai no dist/.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";

import type { Plugin } from "vite";
import { afterAll, describe, expect, inject, it } from "vitest";

import { ATRIBUTO_FAIXA, CLASSE_FAIXA, CNPJ_FICTICIO, ROBOTS_FICTICIO } from "@/config/camada-ficticia";
import { ROUTES } from "@/config/routes";
import {
  ARQUIVO_SENTINELA,
  AVISO_ATIVA,
  AVISO_PRODUCAO,
  AVISO_SAIDA,
  conferirDist,
  copiarMidiaCitada,
  copiasDaCamadaFicticia,
  imagensFicticias,
  imagensParecidas,
  janelasDeBytes,
  LIMIAR_DE_SEMELHANCA,
  marcadoresFicticios,
  pluginDosDadosFicticios,
  procurarMarcadores,
} from "@/integrations/dados-ficticios";
import { fileForPath, placeholderProblems } from "@/integrations/verify-build";

import { FIXTURE_CASE_SLUGS, FIXTURE_MARK } from "../fixtures/owner-data";
import { carregarSharp } from "./support/builds-dos-dados";

const ROOT = process.cwd();
const { semFicticio, comFicticio, producaoComFlagVazio, producaoComFlag, producaoSemFlag, localComFlag, ataques } = inject("buildsDosDados");
const marcadores = marcadoresFicticios(ROOT);
const imagens = imagensFicticias(ROOT);

function arquivosDe(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? arquivosDe(full) : [full];
  });
}
const htmls = (dir: string) => arquivosDe(dir).filter((file) => file.endsWith(".html"));

const PAGINAS_SO_COM_DADO = ["about", "cases_hub", "blog_hub"] as const;

describe("marcadores fictícios (o que o caçador procura)", () => {
  it("cobrem identidade, empresa, textos, frontmatter e corpo dos MDX, imagens e a faixa", () => {
    for (const esperado of [
      "Empresa Exemplo Ltda",
      CNPJ_FICTICIO,
      "Ana Exemplo Souza",
      "Carla Exemplo Ribeiro",
      "Transportadora Exemplo Ltda",
      "contato.exemplo@example.com",
      "privacidade.exemplo@example.com",
      "https://example.com/agenda",
      // textos de config que vazaram no cenário de cópia (X8)
      "de duas a três semanas (exemplo)",
      "R$ 8 mil a R$ 15 mil (exemplo)",
      "R$ 3 mil a R$ 8 mil (exemplo)",
      "Condições de exemplo: o pagamento é dividido em parcelas ligadas às entregas, combinadas no plano.",
      // MDX: slug, título, frontmatter e frases do corpo (X9b)
      "exemplo-sistema-de-fretes",
      "exemplo-app-de-vistorias",
      "exemplo-planilha-ou-sistema",
      "Exemplo: pedidos de frete que chegavam pelo WhatsApp viraram um sistema",
      "Logística (exemplo)",
      "Post de exemplo sobre integração entre sistemas: por onde começar, o que costuma dar errado e como medir se valeu a pena.",
      "Este post é fictício e só aparece com a camada de dados fictícios ligada.",
      // imagens: nome, texto do SVG e conteúdo
      "pessoa-ana-exemplo",
      "logo-cooperativa-exemplo",
      "capa-exemplo-sistema-de-fretes",
      "Avatar de exemplo AE",
      "EXEMPLO",
      // faixa
      "Dados fictícios — não publicar",
      "Fictitious data — do not publish",
      "Datos ficticios — no publicar",
      ATRIBUTO_FAIXA,
      CLASSE_FAIXA,
      ROBOTS_FICTICIO,
    ]) {
      expect(marcadores, esperado).toContain(esperado);
    }
    expect(imagens.length).toBeGreaterThanOrEqual(10);
    for (const imagem of imagens) {
      expect(imagem.sha256, imagem.arquivo).toMatch(/^[0-9a-f]{64}$/);
      // PNG: janelas de bytes crus de alta entropia; SVG (texto): o meio em base64.
      if (imagem.arquivo.endsWith(".png")) expect(imagem.janelas.length, imagem.arquivo).toBeGreaterThanOrEqual(8);
      expect(imagem.base64.length, imagem.arquivo).toBeGreaterThanOrEqual(3);
    }
  });

  it("nenhum marcador é valor do dono.json real (não acusaria dado legítimo)", () => {
    const real = readFileSync(join(ROOT, "dados", "dono.json"), "utf8");
    expect(marcadores.filter((marcador) => real.includes(`"${marcador}"`))).toEqual([]);
  });
});

describe("build SEM a flag: nada fictício no dist/", () => {
  it("o build passa (e a integração já conferiu o dist/)", () => {
    expect(semFicticio.status, semFicticio.saida.slice(-3000)).toBe(0);
    expect(semFicticio.saida).toMatch(/camada fictícia desligada: nenhum dado fictício no dist\//);
    expect(semFicticio.saida).not.toContain(AVISO_ATIVA);
  });

  it("nenhum arquivo nem nome de arquivo contém marcador fictício nem imagem fictícia", { timeout: 120_000 }, async () => {
    expect(procurarMarcadores(semFicticio.outDir, marcadores, imagens)).toEqual([]);
    expect(await conferirDist(semFicticio.outDir, { ativa: false, root: ROOT })).toEqual([]);
    expect(existsSync(join(semFicticio.outDir, ARQUIVO_SENTINELA)), "sentinela some quando a conferência passa").toBe(false);
  });

  it("nem a classe da faixa nem o CSS dela (o estilo só existe no ramo da camada ligada)", () => {
    for (const arquivo of arquivosDe(semFicticio.outDir).filter((file) => /\.(html|css|js)$/.test(file))) {
      const texto = readFileSync(arquivo, "utf8");
      expect(texto, arquivo).not.toContain(CLASSE_FAIXA);
      expect(texto, arquivo).not.toContain(ATRIBUTO_FAIXA);
    }
  });

  it("nenhuma marca nem slug de fixture de teste", () => {
    expect(procurarMarcadores(semFicticio.outDir, [FIXTURE_MARK, ...FIXTURE_CASE_SLUGS, "fixture-lemamon"])).toEqual([]);
  });

  it("robots normal (index ou noindex, follow) e nenhuma página que só a camada liga", () => {
    const paginas = htmls(semFicticio.outDir);
    expect(paginas.length).toBeGreaterThan(40);
    for (const pagina of paginas) {
      const html = readFileSync(pagina, "utf8");
      expect(html, pagina).toMatch(/<meta name="robots" content="(index, follow|noindex, follow)">/);
      expect(html, pagina).not.toContain(ATRIBUTO_FAIXA);
    }
    for (const rota of PAGINAS_SO_COM_DADO) {
      for (const path of Object.values(ROUTES[rota].paths)) {
        expect(existsSync(join(semFicticio.outDir, fileForPath(path))), `${rota} ${path}`).toBe(false);
      }
    }
    const sitemap = readFileSync(join(semFicticio.outDir, "sitemap-0.xml"), "utf8");
    expect(sitemap).not.toMatch(/\/sobre<|\/cases<|\/blog</);
  });
});

describe("build COM a flag (local): a camada aparece, marcada", () => {
  it("o build passa e avisa que a camada está ligada", () => {
    expect(comFicticio.status, comFicticio.saida.slice(-3000)).toBe(0);
    expect(comFicticio.saida).toContain(AVISO_ATIVA);
  });

  it("o caçador acha os marcadores (controle positivo: a varredura não é cega)", () => {
    const achados = new Set(procurarMarcadores(comFicticio.outDir, marcadores, imagens).map((achado) => achado.marcador));
    for (const esperado of [
      "Empresa Exemplo Ltda",
      CNPJ_FICTICIO,
      "Ana Exemplo Souza",
      "exemplo-sistema-de-fretes",
      "de duas a três semanas (exemplo)",
      "Este post é fictício e só aparece com a camada de dados fictícios ligada.",
      CLASSE_FAIXA,
      ROBOTS_FICTICIO,
    ]) {
      expect(achados, esperado).toContain(esperado);
    }
  });

  it("TODA página tem a faixa (role=note, no idioma da página, estilo inline) e noindex,nofollow", async () => {
    const faixas = { pt: "Dados fictícios — não publicar", en: "Fictitious data — do not publish", es: "Datos ficticios — no publicar" };
    const paginas = htmls(comFicticio.outDir);
    expect(paginas.length).toBeGreaterThan(50);
    for (const pagina of paginas) {
      const html = readFileSync(pagina, "utf8");
      const relativo = pagina.slice(comFicticio.outDir.length + 1);
      const idioma = relativo.startsWith("en/") ? "en" : relativo.startsWith("es/") ? "es" : "pt";
      expect(html, relativo).toMatch(
        new RegExp(`<div class="${CLASSE_FAIXA}" role="note" ${ATRIBUTO_FAIXA} style="[^"]*font-weight: 700[^"]*">${faixas[idioma]}</div>`),
      );
      expect(html, relativo).toContain(`<meta name="robots" content="${ROBOTS_FICTICIO}">`);
    }
    expect(await conferirDist(comFicticio.outDir, { ativa: true, root: ROOT })).toEqual([]);
  });

  it("as páginas que só existem com dado aparecem (sobre, cases, blog)", () => {
    for (const rota of PAGINAS_SO_COM_DADO) {
      for (const path of Object.values(ROUTES[rota].paths)) {
        expect(existsSync(join(comFicticio.outDir, fileForPath(path))), `${rota} ${path}`).toBe(true);
      }
    }
    expect(existsSync(join(comFicticio.outDir, "cases", "exemplo-sistema-de-fretes.html"))).toBe(true);
    expect(existsSync(join(comFicticio.outDir, "es", "casos", "exemplo-app-de-vistorias.html"))).toBe(true);
    expect(existsSync(join(comFicticio.outDir, "blog", "exemplo-planilha-ou-sistema.html"))).toBe(true);
  });
});

describe("mídia do dono que não é imagem (depoimento em vídeo, B287; cases e posts, B260/B378)", () => {
  const html = (dir: string, pagina: string) => readFileSync(join(dir, pagina), "utf8");

  it("COM a flag: a Home tem a fachada do vídeo (pôster fora da carga inicial), <video preload=none>, e o vídeo e as legendas citados estão em _midia/", () => {
    const home = html(comFicticio.outDir, "index.html");
    // B287: fora do <noscript>/<template>, nenhum poster="…" nem <video>; o quadro é
    // uma <img loading=lazy> com srcset em data-* (webp, ≤ 800w para o celular).
    const vivo = home.replace(/<noscript>[\s\S]*?<\/noscript>/g, "").replace(/<template\b[\s\S]*?<\/template>/g, "");
    expect(vivo).not.toMatch(/\bposter="/);
    expect(vivo).not.toMatch(/<video\b/);
    const img = /<img\b[^>]*class="testimonial-video__poster[^"]*"[^>]*>/.exec(vivo)?.[0] ?? "";
    expect(img).toContain('loading="lazy"');
    expect(img).not.toMatch(/\s(src|srcset)="/);
    const larguras = [...(/data-srcset="([^"]+)"/.exec(img)?.[1] ?? "").matchAll(/\/_astro\/[^ ,]+\.webp (\d+)w/g)].map((m) => Number(m[1]));
    expect(larguras.length).toBeGreaterThan(0);
    expect(Math.min(...larguras)).toBeLessThanOrEqual(800);
    const tag = /<template\b[^>]*>\s*<video\b[^>]*>/.exec(home)?.[0] ?? "";
    expect(tag).toContain('preload="none"');
    expect(/<noscript>\s*<video\b[^>]*>/.exec(home)?.[0]).toMatch(/poster="\/_astro\/[^"]+"/);
    // Únicas: o mesmo arquivo aparece no <template> (clique) e no <noscript>.
    const citadas = [...new Set([...home.matchAll(/\/_midia\/([A-Za-z0-9._-]+)/g)].map((casou) => casou[1]!))];
    expect(citadas.some((nome) => nome.endsWith(".mp4"))).toBe(true);
    expect(citadas.filter((nome) => nome.endsWith(".vtt"))).toHaveLength(3);
    for (const nome of citadas) expect(existsSync(join(comFicticio.outDir, "_midia", nome)), nome).toBe(true);
    expect(comFicticio.saida).toMatch(/mídia do dono em _midia\/: /);
  });

  it("SEM a flag (e em produção): nenhum <video>, nenhuma pasta _midia/", () => {
    for (const dir of [semFicticio.outDir, producaoSemFlag.outDir]) {
      for (const pagina of htmls(dir)) expect(readFileSync(pagina, "utf8"), pagina).not.toMatch(/<video\b|\/_midia\//);
      expect(existsSync(join(dir, "_midia")), dir).toBe(false);
    }
  });

  it("mídia fictícia citada num build SEM a camada não é encontrada (o build cai); com a camada, é copiada", () => {
    const dist = mkdtempSync(join(tmpdir(), "lemamon-midia-"));
    try {
      const nome = [...html(comFicticio.outDir, "index.html").matchAll(/\/_midia\/([A-Za-z0-9._-]+\.mp4)/g)][0]![1]!;
      writeFileSync(join(dist, "index.html"), `<video><source src="/_midia/${nome}"></video>`);
      const desligada = copiarMidiaCitada(dist, ROOT, false);
      expect(desligada.copiadas).toEqual([]);
      expect(desligada.problemas.join("\n")).toMatch(/citada no HTML, mas não existe em dados\/.*camada fictícia desligada/);
      expect(existsSync(join(dist, "_midia", nome))).toBe(false);
      const ligada = copiarMidiaCitada(dist, ROOT, true);
      expect(ligada).toEqual({ copiadas: [nome], problemas: [] });
      // E a varredura da camada acusa os bytes do vídeo fictício, se ele chegasse a um dist sem a camada.
      expect(procurarMarcadores(dist, [], imagens).some((achado) => achado.arquivo === `_midia/${nome}`)).toBe(true);
    } finally {
      rmSync(dist, { recursive: true, force: true });
    }
  });

  it("COM a flag: cada post tem og:image própria e o Article tem image; cada case tem a SUA capa (B260)", () => {
    const ogDe = (pagina: string) => /<meta property="og:image" content="([^"]+)"/.exec(html(comFicticio.outDir, pagina))?.[1] ?? "";
    const posts = ["exemplo-integrar-sistemas", "exemplo-planilha-ou-sistema", "exemplo-primeira-versao-do-produto"].map((slug) => `blog/${slug}.html`);
    const ogs = posts.map(ogDe);
    for (const [index, og] of ogs.entries()) {
      expect(og, posts[index]).not.toMatch(/default-pt\.jpg|^$/);
      expect(html(comFicticio.outDir, posts[index]!), posts[index]).toMatch(/"@type":"Article"[^<]*"image":"https:\/\/[^"]+"/);
    }
    expect(new Set(ogs).size).toBe(posts.length);
    const fretes = ogDe("cases/exemplo-sistema-de-fretes.html");
    const vistorias = ogDe("cases/exemplo-app-de-vistorias.html");
    expect(fretes).toMatch(/capa-exemplo-sistema-de-fretes/);
    expect(vistorias).toMatch(/capa-exemplo-app-de-vistorias/);
  });

  it("COM a flag: o case anonimizado não leva o nome da empresa a lugar nenhum (B378)", () => {
    for (const [pagina, setor] of [
      ["index.html", "Agronegócio (exemplo) · Cooperativa regional (exemplo)"],
      ["en/index.html", "Agribusiness (example) · Regional cooperative (example)"],
      ["es/index.html", "Agronegocio (ejemplo) · Cooperativa regional (ejemplo)"],
    ] as const) {
      const home = html(comFicticio.outDir, pagina);
      expect(home, pagina).toContain(setor);
      const link = pagina.startsWith("es/") ? "/es/casos/exemplo-app-de-vistorias" : pagina.startsWith("en/") ? "/en/cases/exemplo-app-de-vistorias" : "/cases/exemplo-app-de-vistorias";
      expect(home.split(`href="${link}"`).length - 1, pagina).toBe(1);
    }
    for (const pagina of ["cases/exemplo-app-de-vistorias.html", "en/cases/exemplo-app-de-vistorias.html", "es/casos/exemplo-app-de-vistorias.html"]) {
      expect(html(comFicticio.outDir, pagina), pagina).not.toContain("Cooperativa Exemplo");
    }
  });
});

describe("build de PRODUÇÃO com a flag ligada", () => {
  it("empresa e privacidade vazias: ignora a camada (com aviso) e falha na trava da Política", () => {
    expect(producaoComFlagVazio.status).not.toBe(0);
    expect(producaoComFlagVazio.saida).toContain(AVISO_PRODUCAO);
    expect(producaoComFlagVazio.saida).not.toContain(AVISO_ATIVA);
    expect(producaoComFlagVazio.saida).not.toMatch(/FICTÍCIO\(S\) de dados\/dono\.ficticio\.json|MDX FICTÍCIOS/);
    expect(producaoComFlagVazio.saida).toMatch(/Política de Privacidade incompleta/);
    expect(producaoComFlagVazio.saida).toMatch(/dados\/dono\.json › empresa: razão social \+ CNPJ válido, ou responsável/);
  });

  it("com dado real preenchido: passa, ignora a camada e não tem nada fictício", () => {
    expect(producaoComFlag.status, producaoComFlag.saida.slice(-3000)).toBe(0);
    expect(producaoComFlag.saida).toContain(AVISO_PRODUCAO);
    expect(producaoComFlag.saida).not.toContain(AVISO_ATIVA);
    expect(producaoComFlag.saida).toMatch(/camada fictícia desligada: nenhum dado fictício no dist\//);
    expect(procurarMarcadores(producaoComFlag.outDir, marcadores, imagens)).toEqual([]);
  });

  it("o dist é byte a byte igual ao do build de produção sem a flag", () => {
    expect(producaoSemFlag.status, producaoSemFlag.saida.slice(-3000)).toBe(0);
    const lista = (dir: string) => arquivosDe(dir).map((file) => relative(dir, file).split(sep).join("/")).sort();
    const comFlag = lista(producaoComFlag.outDir);
    expect(comFlag.length).toBeGreaterThan(40);
    expect(comFlag).toEqual(lista(producaoSemFlag.outDir));
    for (const arquivo of comFlag) {
      const a = readFileSync(join(producaoComFlag.outDir, arquivo));
      const b = readFileSync(join(producaoSemFlag.outDir, arquivo));
      expect(a.equals(b), arquivo).toBe(true);
    }
  });
});

describe("build LOCAL com a flag e sem --outDir: nunca no dist/ publicado", () => {
  it("vai para dist-ficticio/, avisa e não cria dist/", () => {
    expect(localComFlag.status, localComFlag.saida.slice(-3000)).toBe(0);
    expect(localComFlag.saida).toContain(AVISO_SAIDA);
    expect(localComFlag.criouDistFicticio).toBe(true);
    expect(localComFlag.distFicticioComNoindex).toBe(true);
    expect(localComFlag.criouDist).toBe(false);
  });
});

describe("placeholders do i18n: nenhum {…} sem interpolar no que é publicado", () => {
  it.each([
    ["sem a flag", () => semFicticio.outDir],
    ["com a flag (todas as confirmações ligadas, inclusive NDA)", () => comFicticio.outDir],
  ])("%s", (_nome, dir) => {
    const problemas = htmls(dir()).flatMap((pagina) => placeholderProblems(readFileSync(pagina, "utf8")).map((p) => `${relative(dir(), pagina)}: ${p}`));
    expect(problemas).toEqual([]);
  });

  it("a FAQ de NDA do orçamento leva o e-mail de verdade, no texto E no JSON-LD (3 idiomas)", () => {
    // (Os props da ilha do wizard levam textos com {email} de propósito: o cliente interpola.)
    // O endereço vem de dados/dono.json › empresa.email: trocar o e-mail não pode quebrar o teste.
    const email = (JSON.parse(readFileSync(join(ROOT, "dados/dono.json"), "utf8")) as { empresa: { email: string } }).empresa.email;
    for (const [pagina, frase] of [
      ["orcamento.html", `É só pedir pelo WhatsApp ou pelo e-mail ${email}.`],
      ["en/quote.html", `Just ask on WhatsApp or by email at ${email}.`],
      ["es/cotizacion.html", `tienes que pedirlo por WhatsApp o por correo electrónico a ${email}.`],
    ] as const) {
      const html = readFileSync(join(comFicticio.outDir, pagina), "utf8");
      expect(html.split(frase).length - 1, pagina).toBeGreaterThanOrEqual(2);
      expect(placeholderProblems(html), pagina).toEqual([]);
    }
  });

  it("a conferência acusa o placeholder esquecido (texto visível, atributo e JSON-LD), mas não o código nem os props da ilha", () => {
    expect(placeholderProblems('<p>É só pedir pelo e-mail {email}.</p>')).toHaveLength(1);
    expect(placeholderProblems('<img alt="Foto de {nome}">')).toHaveLength(1);
    expect(placeholderProblems('<script type="application/ld+json">{"text":"pelo e-mail {email}"}</script>')).toHaveLength(1);
    expect(placeholderProblems('<script>const a={n};</script><astro-island props="{&quot;t&quot;:&quot;Pergunta {n}&quot;}"></astro-island>')).toEqual([]);
  });
});

describe("CTA primário: com agenda online, 'Agendar diagnóstico gratuito'", () => {
  const ctaDe = (html: string, origem: string) =>
    new RegExp(`<a\\b[^>]*data-origem="${origem}"[^>]*>([\\s\\S]*?)</a>`).exec(html)?.[1]?.replace(/<[^>]+>/g, " ") ?? "";

  it("sem agenda (dado real de hoje): header, barra fixa e rodapé com 'Pedir diagnóstico gratuito'", () => {
    const html = readFileSync(join(semFicticio.outDir, "index.html"), "utf8");
    for (const origem of ["home-header", "home-barra", "home-footer"]) expect(ctaDe(html, origem), origem).toContain("Pedir diagnóstico gratuito");
    for (const pagina of htmls(semFicticio.outDir)) {
      const texto = readFileSync(pagina, "utf8");
      expect(texto, pagina).not.toMatch(/Agendar diagnóstico gratuito|Schedule your free assessment|Agenda tu diagnóstico gratuito/);
    }
  });

  it("com agenda (camada fictícia): o rótulo troca nos 3 idiomas, e 'Continuar meu pedido' continua no lugar", () => {
    const casos = [
      ["index.html", "home", "Agendar diagnóstico gratuito", "Continuar meu pedido"],
      ["en/index.html", "home", "Schedule your free assessment", null],
      ["es/index.html", "home", "Agenda tu diagnóstico gratuito", null],
    ] as const;
    for (const [pagina, prefixo, rotulo, retomada] of casos) {
      const html = readFileSync(join(comFicticio.outDir, pagina), "utf8");
      for (const origem of [`${prefixo}-header`, `${prefixo}-barra`, `${prefixo}-footer`, `${prefixo}-problema`, `${prefixo}-hero`]) {
        const cta = ctaDe(html, origem);
        expect(cta, `${pagina} ${origem}`).toContain(rotulo);
        if (retomada && [`${prefixo}-header`, `${prefixo}-barra`].includes(origem)) expect(cta, `${pagina} ${origem}`).toContain(retomada);
      }
    }
    // Link de texto (TextCta) e bloco de investimento também trocam.
    const servico = readFileSync(join(comFicticio.outDir, "servicos", "mvp.html"), "utf8");
    expect(ctaDe(servico, "mvp-sinais")).toContain("Agendar diagnóstico gratuito");
    expect(ctaDe(servico, "mvp-investimento")).toContain("Agendar diagnóstico gratuito");
    const contato = readFileSync(join(comFicticio.outDir, "contato.html"), "utf8");
    expect(contato).toContain("Agendar diagnóstico gratuito: 6 perguntas e o resumo do seu projeto na hora");
    expect(contato).not.toContain("Pedir diagnóstico gratuito");
  });
});

// --- imagem fictícia ALTERADA (bytes e semelhança perceptual) ----------------------------
describe("imagem fictícia alterada não chega ao site (janelas de bytes e semelhança)", () => {
  const sharp = carregarSharp();
  const TELA = "dados/ficticio/imagens/tela-exemplo-sistema-de-fretes.png";
  const CAPA = "dados/ficticio/imagens/capa-exemplo-app-de-vistorias.png";
  const AVATAR = "dados/ficticio/imagens/pessoa-ana-exemplo.svg";
  const LOGO = "dados/ficticio/imagens/logo-escola-exemplo.svg";
  const ler = (arquivo: string) => readFileSync(join(ROOT, arquivo));
  const pastas: string[] = [];
  afterAll(() => pastas.forEach((pasta) => rmSync(pasta, { recursive: true, force: true })));
  const pastaNova = () => {
    const pasta = mkdtempSync(join(tmpdir(), "lemamon-imagens-"));
    pastas.push(pasta);
    return pasta;
  };
  const lista = (pasta: string) => arquivosDe(pasta).map((caminho): [string, string] => [relative(pasta, caminho), caminho]);

  it("PNG com 1 byte a mais, com bytes a menos ou com metadado na frente: janelas de bytes crus (cenário A12c)", () => {
    const dist = pastaNova();
    const original = ler(TELA);
    writeFileSync(join(dist, "capa-projeto.png"), Buffer.concat([original, Buffer.from([0])]));
    writeFileSync(join(dist, "cortado.png"), original.subarray(0, original.length - 300));
    writeFileSync(join(dist, "com-cabecalho.bin"), Buffer.concat([Buffer.from("qualquer coisa antes"), original]));
    const achados = procurarMarcadores(dist, [], imagens);
    for (const arquivo of ["capa-projeto.png", "cortado.png", "com-cabecalho.bin"]) {
      expect(achados.find((achado) => achado.arquivo === arquivo)?.marcador, arquivo).toMatch(/bytes de dados\/ficticio\/imagens\/(tela|capa)-exemplo-/);
    }
    expect(janelasDeBytes(original).length).toBeGreaterThanOrEqual(8);
  });

  it("PNG alterado embutido em base64 (data: URL) num HTML: acha em qualquer alinhamento", () => {
    const dist = pastaNova();
    const alterado = Buffer.concat([Buffer.from([1, 2]), ler(CAPA)]);
    writeFileSync(join(dist, "index.html"), `<img src="data:image/png;base64,${alterado.toString("base64")}">`);
    expect(procurarMarcadores(dist, marcadores, imagens).some((achado) => achado.arquivo === "index.html")).toBe(true);
  });

  it("recodificada (JPG, WebP, PNG reotimizado), redimensionada, sem cor, clareada ou sem a faixa EXEMPLO: semelhança (cenários A12b, A27)", { timeout: 120_000 }, async () => {
    const pasta = pastaNova();
    const tela = ler(TELA);
    const { width = 0, height = 0 } = await sharp(tela).metadata();
    const variantes: Record<string, Buffer> = {
      "tela.jpg": await sharp(tela).jpeg({ quality: 70 }).toBuffer(),
      "tela.webp": await sharp(tela).resize(480).webp({ quality: 50 }).toBuffer(),
      "joana.png": await sharp(ler(AVATAR)).png({ compressionLevel: 9 }).toBuffer(),
      "avatar-pequeno.jpg": await sharp(ler(AVATAR)).resize(120).jpeg().toBuffer(),
      "cinza.png": await sharp(tela).greyscale().png().toBuffer(),
      "clara.png": await sharp(tela).modulate({ brightness: 1.15 }).png().toBuffer(),
      "sem-faixa.png": await sharp(tela).extract({ left: 0, top: 0, width, height: Math.round(height * 0.85) }).png().toBuffer(),
      "og.jpg": await sharp(ler(CAPA)).resize(1200, 630, { fit: "cover" }).jpeg().toBuffer(),
      "logo.webp": await sharp(ler(LOGO)).resize(400).webp().toBuffer(),
    };
    for (const [nome, bytes] of Object.entries(variantes)) writeFileSync(join(pasta, nome), bytes);
    const achados = await imagensParecidas(lista(pasta), ROOT);
    for (const nome of Object.keys(variantes)) {
      const achado = achados.find((item) => item.arquivo === nome);
      expect(achado, nome).toBeDefined();
      expect(achado!.nota, nome).toBeGreaterThanOrEqual(LIMIAR_DE_SEMELHANCA);
      expect(achado!.origem, nome).toMatch(/^dados\/ficticio\/imagens\//);
    }
    // Nenhuma dessas é cópia por bytes: só a semelhança pega.
    expect(procurarMarcadores(pasta, [], imagens).filter((achado) => achado.arquivo !== "sem-faixa.png")).toEqual([]);
  });

  it("imagens reais do site (ícones, OG, favicon) não são acusadas (sem falso positivo)", { timeout: 120_000 }, async () => {
    const reais = arquivosDe(join(ROOT, "public")).map((caminho): [string, string] => [relative(ROOT, caminho), caminho]);
    expect(reais.length).toBeGreaterThan(20);
    expect(await imagensParecidas(reais, ROOT)).toEqual([]);
  });

  it("controle: as webp/jpg que o Astro gera da camada no build COM a flag são reconhecidas; no build SEM a flag, nada", { timeout: 120_000 }, async () => {
    const astro = (dist: string) => lista(join(dist, "_astro")).filter(([nome]) => /\.(webp|jpe?g|png|avif)$/.test(nome));
    const geradas = astro(comFicticio.outDir);
    expect(geradas.length).toBeGreaterThan(5);
    const achados = await imagensParecidas(geradas, ROOT);
    expect(achados.map((achado) => achado.arquivo).sort()).toEqual(geradas.map(([nome]) => nome).sort());
    expect(await imagensParecidas(lista(semFicticio.outDir), ROOT)).toEqual([]);
  });

  it("em src/, public/ e dados/: PNG +1 byte, JPG recodificado, avatar recodificado, data: URL e o dono.ficticio.json copiado (A11b, A12, A27)", { timeout: 120_000 }, async () => {
    const raiz = pastaNova();
    for (const item of ["dados", "src", "public"]) cpSync(join(ROOT, item), join(raiz, item), { recursive: true });
    writeFileSync(join(raiz, "public", "capa-projeto.png"), Buffer.concat([ler(TELA), Buffer.from([0])]));
    writeFileSync(join(raiz, "public", "tela.jpg"), await sharp(ler(TELA)).jpeg({ quality: 80 }).toBuffer());
    writeFileSync(join(raiz, "dados", "imagens", "joana.png"), await sharp(ler(AVATAR)).png().toBuffer());
    mkdirSync(join(raiz, "src", "styles"), { recursive: true });
    writeFileSync(join(raiz, "src", "styles", "fundo.css"), `.x{background:url(data:image/png;base64,${Buffer.concat([Buffer.from([7]), ler(CAPA)]).toString("base64")})}`);
    cpSync(join(ROOT, "dados", "dono.ficticio.json"), join(raiz, "src", "config", "demo.json"));
    // Só a estrutura, com todo texto trocado: ainda é cópia do arquivo fictício.
    const estrutura = JSON.parse(readFileSync(join(ROOT, "dados", "dono.ficticio.json"), "utf8"), (_chave, valor: unknown) =>
      typeof valor === "string" ? "x" : valor,
    ) as unknown;
    writeFileSync(join(raiz, "public", "dados.json"), JSON.stringify(estrutura));
    const problemas = (await copiasDaCamadaFicticia(raiz)).join("\n");
    expect(problemas).toMatch(/public\/capa-projeto\.png: imagem copiada \(bytes de dados\/ficticio\/imagens\//);
    expect(problemas).toMatch(/public\/tela\.jpg: imagem parecida com dados\/ficticio\/imagens\/(tela|capa)-exemplo-/);
    expect(problemas).toMatch(/dados\/imagens\/joana\.png: imagem parecida com dados\/ficticio\/imagens\/(pessoa|depoimento)-/);
    expect(problemas).toMatch(/src\/styles\/fundo\.css: trecho copiado de dados\/ficticio\/imagens\/.*\(em base64\)/);
    expect(problemas).toMatch(/src\/config\/demo\.json: trecho copiado de dados\/dono\.ficticio\.json › /);
    expect(problemas).toMatch(/src\/config\/demo\.json: cópia de dados\/dono\.ficticio\.json \(100% da estrutura/);
    expect(problemas).toMatch(/public\/dados\.json: cópia de dados\/dono\.ficticio\.json \(100% da estrutura, 0 texto/);
  });

  it("valor de identidade da camada em código de src/ (fora de comentário) é cópia; em comentário, não", { timeout: 120_000 }, async () => {
    const raiz = pastaNova();
    for (const item of ["dados", "src"]) cpSync(join(ROOT, item), join(raiz, item), { recursive: true });
    writeFileSync(join(raiz, "src", "config", "nome.ts"), '// Ana Exemplo Souza era o exemplo\nexport const a = "x";\n');
    expect(await copiasDaCamadaFicticia(raiz)).toEqual([]);
    writeFileSync(join(raiz, "src", "config", "nome.ts"), 'export const pessoa = "Ana Exemplo Souza";\nexport const cnpj = "00.000.000/0000-00";\n');
    const problemas = (await copiasDaCamadaFicticia(raiz)).join("\n");
    expect(problemas).toMatch(/src\/config\/nome\.ts: trecho copiado de dados\/dono\.ficticio\.json › time\[0\]\.nome \("Ana Exemplo Souza"\)/);
    expect(problemas).toMatch(/src\/config\/nome\.ts: trecho copiado de dados\/dono\.ficticio\.json › empresa\.cnpj/);
  });
});

// --- camada 1: o plugin pega url() de CSS, new URL() e asset emitido --------------------
describe("camada 1 (plugin Vite) com a camada DESLIGADA", () => {
  type Contexto = { error: (mensagem: string) => never };
  const contexto: Contexto = {
    error: (mensagem: string) => {
      throw new Error(mensagem);
    },
  };
  const plugin = (ativa = false): Plugin => pluginDosDadosFicticios(ativa, ROOT);
  const transformar = (codigo: string, id: string, ativa = false) =>
    (plugin(ativa).transform as unknown as (this: Contexto, code: string, id: string) => unknown).call(contexto, codigo, id);
  const gerar = (bundle: Record<string, unknown>, ativa = false) =>
    (plugin(ativa).generateBundle as unknown as (this: Contexto, o: unknown, b: Record<string, unknown>) => void).call(contexto, {}, bundle);
  const pagina = join(ROOT, "src", "pages", "index.astro");

  it("url() de CSS para dados/ficticio/ (bloco <style> de .astro e arquivo .css): derruba (cenário A7)", () => {
    const css = '.x{background:url("../../dados/ficticio/imagens/capa-exemplo-sistema-de-fretes.png")}';
    expect(() => transformar(css, `${pagina}?astro&type=style&index=0&lang.css`)).toThrow(/cita a camada fictícia/);
    expect(() => transformar(css, join(ROOT, "src", "styles", "x.css"))).toThrow(/src\/styles\/x\.css cita a camada fictícia/);
    // url(//cdn) antes na mesma linha não esconde a citação (CSS não tem comentário de linha).
    expect(() => transformar(`.a{background:url(//cdn.x/a.png)} ${css}`, join(ROOT, "src", "styles", "x.css"))).toThrow(/cita a camada/);
  });

  it("new URL(…, import.meta.url) e file:// no frontmatter: derruba (cenários A13, A13b)", () => {
    const script = 'const u = new URL("../../dados/ficticio/imagens/capa-exemplo-sistema-de-fretes.png", import.meta.url);';
    expect(() => transformar(script, `${pagina}?astro&type=script&index=0&lang.ts`)).toThrow(/cita a camada fictícia/);
    expect(() => transformar(`---\nconst src = "file://${ROOT}/dados/ficticio/imagens/x.png";\n---\n<img src={src}>`, pagina)).toThrow(/cita a camada/);
    expect(() => transformar('fetch("/dono.ficticio.json")', join(ROOT, "src", "scripts", "x.ts"))).toThrow(/cita a camada/);
  });

  it("não acusa: comentário, os dois leitores da camada, testes, node_modules e camada LIGADA", () => {
    expect(transformar("// lê dados/ficticio/ só pela integração\nexport const a = 1;", join(ROOT, "src", "config", "x.ts"))).toBeNull();
    expect(transformar("/* dados/ficticio/ */ .a{color:red}", join(ROOT, "src", "styles", "x.css"))).toBeNull();
    expect(transformar("<!-- dados/ficticio/ -->\n<p>x</p>", pagina)).toBeNull();
    expect(transformar('const p = "dados/ficticio";', join(ROOT, "src", "content", "loaders.ts"))).toBeNull();
    expect(transformar('const p = "dados/ficticio";', join(ROOT, "src", "integrations", "dados-ficticios.ts"))).toBeNull();
    expect(transformar('const p = "dados/ficticio";', join(ROOT, "tests", "unit", "x.test.ts"))).toBeNull();
    expect(transformar('const p = "dados/ficticio";', join(ROOT, "node_modules", "pacote", "index.js"))).toBeNull();
    expect(transformar('const p = "dados/ficticio";', join(ROOT, "src", "config", "x.ts"), true)).toBeNull();
  });

  it("generateBundle: asset ou chunk que veio da camada derruba", () => {
    expect(() =>
      gerar({ "a.png": { type: "asset", fileName: "_astro/capa.B4fPsf7b.png", originalFileNames: ["dados/ficticio/imagens/capa-exemplo-sistema-de-fretes.png"] } }),
    ).toThrow(/ia publicar _astro\/capa\.B4fPsf7b\.png, que veio da camada fictícia/);
    expect(() =>
      gerar({ "c.js": { type: "chunk", fileName: "_astro/c.js", moduleIds: [join(ROOT, "dados", "dono.ficticio.json")], modules: {} } }),
    ).toThrow(/que veio da camada fictícia \(dados\/dono\.ficticio\.json\)/);
    expect(() =>
      gerar({ "a.png": { type: "asset", fileName: "_astro/real.png", originalFileNames: ["dados/imagens/real.png"] } }),
    ).not.toThrow();
    expect(() =>
      gerar({ "a.png": { type: "asset", fileName: "x.png", originalFileNames: ["dados/ficticio/imagens/x.png"] } }, true),
    ).not.toThrow();
  });
});

// --- ataques reais (builds do globalSetup) --------------------------------------------------
describe("ATAQUES reais: produção com a flag, escrevendo no dist/ publicado", () => {
  const distLimpo = (ataque: (typeof ataques)[keyof typeof ataques]) => {
    expect(ataque.distExiste && ataque.arquivosNoDist > 0, `${ataque.raiz}/dist ficou com ${ataque.arquivosNoDist} arquivo(s)`).toBe(false);
  };

  it("url() de CSS para dados/ficticio/: camada 1 derruba e o dist/ não fica (A7)", () => {
    expect(ataques.cssUrl.status).not.toBe(0);
    expect(ataques.cssUrl.saida).toMatch(/estilos\/fundo\.css cita a camada fictícia/);
    distLimpo(ataques.cssUrl);
  });

  it("new URL(…, import.meta.url) para dados/ficticio/: camada 1 derruba e o dist/ não fica (A13)", () => {
    expect(ataques.newUrl.status).not.toBe(0);
    expect(ataques.newUrl.saida).toMatch(/src\/pages\/index\.astro cita a camada fictícia/);
    distLimpo(ataques.newUrl);
  });

  it("leitura por fs com caminho montado em tempo de execução: camada 2 derruba e APAGA o dist/ (A8, A11)", () => {
    expect(ataques.leituraPorFs.status).not.toBe(0);
    expect(ataques.leituraPorFs.saida).toMatch(/problema\(s\) da camada fictícia no dist\//);
    expect(ataques.leituraPorFs.saida).toMatch(/Ana Exemplo Souza/);
    distLimpo(ataques.leituraPorFs);
  });

  it("build que falha no meio (prerender): o dist/ parcial é apagado na saída do processo (A6)", () => {
    expect(ataques.falhaNoPrerender.status).not.toBe(0);
    expect(ataques.falhaNoPrerender.saida).toMatch(/falha proposital do teste/);
    expect(ataques.falhaNoPrerender.saida).toMatch(/\[dados\] build com falha: dist\/ apagada/);
    distLimpo(ataques.falhaNoPrerender);
  });

  it("cópias no projeto (PNG +1 byte, JPG e avatar recodificados, JSON fictício copiado): cai antes do build", () => {
    const { status, saida } = ataques.copiasNoProjeto;
    expect(status).not.toBe(0);
    expect(saida).toMatch(/valor\(es\) copiado\(s\) de dados\/dono\.ficticio\.json ou de dados\/ficticio\//);
    expect(saida).toMatch(/public\/capa-projeto\.png: imagem copiada/);
    expect(saida).toMatch(/public\/tela\.jpg: imagem parecida com dados\/ficticio\/imagens\//);
    expect(saida).toMatch(/dados\/imagens\/joana\.png: imagem parecida com dados\/ficticio\/imagens\//);
    expect(saida).toMatch(/src\/config\/demo\.json: /);
    distLimpo(ataques.copiasNoProjeto);
  });

  it("--outDir out com out → dist (link simbólico), local com a flag: vai para dist-ficticio/ e o dist/ fica vazio (A10)", () => {
    const { status, saida, distFicticioExiste, arquivosNoDist } = ataques.outDirPorLink;
    expect(status, saida.slice(-3000)).toBe(0);
    expect(saida).toContain(AVISO_SAIDA);
    expect(distFicticioExiste).toBe(true);
    expect(arquivosNoDist).toBe(0);
  });
});

describe("trava estática: nenhum módulo de src/ importa a camada fictícia", () => {
  // Só estes dois arquivos leem a camada, e por fs (nunca por import).
  const PERMITIDOS = new Set(["src/integrations/dados-ficticios.ts", "src/content/loaders.ts"]);

  // Código sem comentários (de linha, de bloco e de HTML), para a busca não pegar documentação.
  function semComentarios(codigo: string): string {
    return codigo
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
  }

  it("'dono.ficticio' e 'dados/ficticio' só aparecem (fora de comentário) nos dois leitores da camada", () => {
    const fontes = [...arquivosDe(join(ROOT, "src")), join(ROOT, "astro.config.mjs")].filter((file) => /\.(ts|tsx|mts|js|mjs|astro|mdx?|css)$/.test(file));
    const achados: string[] = [];
    for (const arquivo of fontes) {
      const rotulo = relative(ROOT, arquivo).split(sep).join("/");
      if (PERMITIDOS.has(rotulo)) continue;
      const codigo = semComentarios(readFileSync(arquivo, "utf8"));
      for (const termo of ["dono.ficticio", "dados/ficticio", "ficticio/imagens", "ficticio/cases", "ficticio/posts"]) {
        if (codigo.includes(termo)) achados.push(`${rotulo}: "${termo}"`);
      }
    }
    expect(achados).toEqual([]);
  });

  it("nos dois leitores, nenhum import da camada (só leitura por fs)", () => {
    for (const rotulo of PERMITIDOS) {
      const codigo = semComentarios(readFileSync(join(ROOT, rotulo), "utf8"));
      expect(codigo, rotulo).not.toMatch(/(?:import|from)\s*\(?\s*["'`][^"'`]*ficticio[^"'`]*["'`]|import\.meta\.glob\([^)]*ficticio/);
    }
  });
});
