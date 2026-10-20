/**
 * Depoimento em vídeo SEM peso no carregamento inicial (backlog B287) — dono: gated.
 *
 * Fachada (src/components/gated/TestimonialVideo.astro): até a pessoa chegar
 * perto do vídeo, a página não pede NADA dele (nem o pôster); perto, pede 1
 * pôster do tamanho da tela (≤ 800w num celular de 375px); no clique, o
 * <video> entra no lugar do botão, recebe o foco, pede o .mp4/.webm e liga a
 * legenda do idioma da página (só aí o .vtt é baixado).
 *
 * Contra o build de sempre (playwright.config.ts: dado REAL do dados/dono.json):
 * sem depoimento em vídeo, confere que nenhuma página pede /_midia/ nem tem
 * <video>; quando o dono publicar um vídeo, as mesmas páginas passam pela
 * prova inteira, sem mudar este arquivo.
 *
 * Contra o build com a camada FICTÍCIA (que tem o vídeo de exemplo), a prova é
 * obrigatória na Home e no case do depoimento, nos 3 idiomas:
 *
 *   PUBLIC_DADOS_FICTICIOS=true yarn -s astro build   # → dist-ficticio/
 *   yarn -s astro preview --outDir dist-ficticio --port 4512 --ignore-lock
 *   E2E_NETLIFY_URL=http://localhost:4512 yarn test:e2e gated-testimonial-video
 *
 * Os tamanhos de tela são do próprio teste (375×812 e 1280×800, densidade 1):
 * roda só no projeto "desktop".
 */
import { expect, test, type Browser, type Page } from "@playwright/test";

const HOMES = ["/", "/en/", "/es/"] as const;
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
] as const;
/** Vídeo e legendas do dono (src/content/midia.ts). */
const MIDIA = /\/_midia\//;

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "os tamanhos de tela são do próprio teste");
});

/** Build com a camada fictícia: a faixa "Dados fictícios — não publicar" em toda página. */
async function camadaFicticia(page: Page): Promise<boolean> {
  return (await page.locator("[data-dados-ficticios]").count()) > 0;
}

/** URLs absolutas do pôster na fachada (srcset + src de reserva) → largura (w) de cada uma. */
async function urlsDoPoster(page: Page): Promise<Map<string, number>> {
  const pares = await page.locator("[data-testimonial-video-play] img").evaluate((img: HTMLImageElement) => {
    // data-* (como o componente entrega) ou, se alguém ligar direto, srcset/src.
    const lista = (img.dataset.srcset ?? img.getAttribute("srcset") ?? "")
      .split(",")
      .map((parte) => parte.trim().split(/\s+/))
      .filter(([url]) => url)
      .map(([url, w]) => [new URL(url!, location.href).href, Number.parseInt(w ?? "0", 10)] as [string, number]);
    const src = img.dataset.src ?? img.getAttribute("src");
    const reserva = src ? new URL(src, location.href).href : null;
    // O src de reserva quase sempre é uma das larguras do srcset; se não for, vale a largura do <img>.
    if (reserva && !lista.some(([url]) => url === reserva)) lista.push([reserva, Number(img.getAttribute("width") ?? 0)]);
    return lista;
  });
  return new Map(pares);
}

/**
 * Abre `path` num contexto novo e confere a fachada. Devolve o link do case do
 * depoimento (Home), quando houver. `exigir`: a página TEM de ter o vídeo.
 */
async function conferir(browser: Browser, baseURL: string, path: string, viewport: { width: number; height: number }, exigir: boolean) {
  const context = await browser.newContext({ baseURL, viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const pedidos: string[] = [];
  page.on("request", (request) => pedidos.push(request.url()));
  const onde = `${path} em ${viewport.width}px`;
  try {
    await page.goto(path, { waitUntil: "networkidle" });
    const fachada = page.locator("[data-testimonial-video-play]");

    if ((await fachada.count()) === 0) {
      expect(exigir, `${onde}: a fachada do vídeo devia estar na página`).toBe(false);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState("networkidle");
      expect(pedidos.filter((url) => MIDIA.test(url)), `${onde}: sem vídeo, nenhum pedido de /_midia/`).toEqual([]);
      await expect(page.locator("video")).toHaveCount(0);
      return null;
    }

    // 1) Carga inicial, sem rolar: nada do vídeo (nem pôster, nem mídia, nem <video> vivo).
    await expect(fachada).toHaveCount(1);
    const poster = await urlsDoPoster(page);
    expect(poster.size, `${onde}: srcset do pôster`).toBeGreaterThan(0);
    expect(pedidos.filter((url) => poster.has(url) || MIDIA.test(url)), `${onde}: carga inicial sem pôster nem mídia`).toEqual([]);
    await expect(page.locator("[data-testimonial-video] > video")).toHaveCount(0);

    // 2) Perto do vídeo: 1 pôster, do tamanho da tela.
    await fachada.scrollIntoViewIfNeeded();
    await expect.poll(() => pedidos.filter((url) => poster.has(url)).length, { message: `${onde}: 1 pedido de pôster` }).toBe(1);
    const servido = pedidos.find((url) => poster.has(url))!;
    if (viewport.width <= 375) expect(poster.get(servido), `${onde}: pôster servido (w)`).toBeLessThanOrEqual(800);
    expect(pedidos.filter((url) => MIDIA.test(url)), `${onde}: antes do play, nada de /_midia/`).toEqual([]);

    // 3) Play: o <video> entra no lugar do botão, com foco; pede o vídeo e a legenda do idioma da página.
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    const vtt = await page
      .locator("[data-testimonial-video] template")
      .evaluate((template: HTMLTemplateElement, lang) => template.content.querySelector(`track[srclang="${lang}"]`)?.getAttribute("src") ?? null, htmlLang);
    const pedidoDoVideo = page.waitForRequest((request) => MIDIA.test(request.url()) && /\.(mp4|webm)(\?|$)/.test(request.url()));
    const pedidoDaLegenda = vtt ? page.waitForRequest((request) => request.url() === new URL(vtt, page.url()).href) : null;
    await fachada.click();
    const video = page.locator("[data-testimonial-video] > video");
    await expect(video).toHaveCount(1);
    await expect(fachada).toHaveCount(0);
    await expect(video).toBeFocused();
    await expect(video).toHaveAttribute("preload", "none");
    expect(await video.evaluate((element: HTMLVideoElement) => element.poster), `${onde}: poster = o quadro da fachada`).toBe(servido);
    await pedidoDoVideo;
    if (pedidoDaLegenda) {
      await pedidoDaLegenda;
      await expect
        .poll(() => video.evaluate((element: HTMLVideoElement) => Array.from(element.textTracks).filter((track) => track.mode === "showing").map((track) => track.language)))
        .toEqual([htmlLang]);
    }
    const linkDoCase = page.locator("a.highlight__case");
    return (await linkDoCase.count()) > 0 ? await linkDoCase.first().getAttribute("href") : null;
  } finally {
    await context.close();
  }
}

test("depoimento em vídeo: nada do vídeo na carga inicial; pôster perto da tela; vídeo e legenda só no play (B287)", async ({ browser, baseURL, page }) => {
  test.setTimeout(180_000);
  await page.goto("/");
  const ficticia = await camadaFicticia(page);
  for (const viewport of VIEWPORTS) {
    for (const home of HOMES) {
      const caso = await conferir(browser, baseURL!, home, viewport, ficticia);
      // O case do depoimento mostra o mesmo vídeo (CaseArticle).
      if (caso) await conferir(browser, baseURL!, caso, viewport, true);
      else expect(ficticia, `${home}: na camada fictícia o depoimento leva ao case`).toBe(false);
    }
  }
});
