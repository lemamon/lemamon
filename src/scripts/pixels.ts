/**
 * Pixels de anúncio OPCIONAIS — LinkedIn Insight Tag (backlog B346) e Meta
 * Pixel (B347). Dono: shell. DESLIGADOS por padrão (decisão D12 do playbook
 * 15 recomenda não instalar agora).
 *
 * Este módulo só define constantes e funções (nada roda ao importar): o
 * src/scripts/consent.ts chama os loaders DEPOIS do "Aceitar" do aviso de
 * cookies, e só quando o ConsentBanner publicou o ID nos atributos abaixo
 * (produção + baseAnuncios = "consentimento" + ID em dados/dono.json ›
 * privacidade.pixels). A integração da CSP (src/integrations/csp.ts) lê os
 * mesmos atributos para incluir os domínios dos pixels na política.
 *
 * Uso só de remarketing/medição de campanha (playbook 12 §9): o Meta Pixel
 * recebe só PageView; nenhum evento de lead e nenhuma resposta do pedido vão
 * para nenhum dos dois. Para isso valer também do lado da Meta (B347):
 *   - fbq("set", "autoConfig", false, id) ANTES do init desliga os eventos
 *     automáticos (cliques em botão e metadados da página, que leriam os
 *     rótulos das respostas) e a correspondência avançada automática (e-mail
 *     e telefone digitados), mesmo que alguém ligue isso no Events Manager;
 *   - o pixel nem carrega nas páginas com formulário (META_PIXEL_FREE_ROUTES
 *     de src/config/privacidade.ts, aplicado no ConsentBanner.astro).
 */

export const PIXEL_ATTRIBUTES = {
  linkedin: "data-linkedin-partner-id",
  meta: "data-meta-pixel-id",
} as const;

export const LINKEDIN_INSIGHT_SRC = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
export const META_PIXEL_SRC = "https://connect.facebook.net/en_US/fbevents.js";

/** Cookies primários que os pixels gravam (apagados na recusa, como os do gtag). */
export const PIXEL_COOKIE = /^(_fbp|_fbc|li_fat_id|li_giant|ln_or)$/;

type Queue = ((...args: unknown[]) => void) & { q?: unknown[][]; queue?: unknown[][] };

interface PixelWindow {
  _linkedin_partner_id?: string;
  _linkedin_data_partner_ids?: string[];
  lintrk?: Queue;
  fbq?: Queue & { callMethod?: (...args: unknown[]) => void; loaded?: boolean; version?: string; push?: Queue };
  _fbq?: unknown;
}

function inject(src: string): void {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.append(script);
}

/** LinkedIn Insight Tag (o snippet oficial, sem a imagem de <noscript>: sem JS não há aceite). */
export function loadLinkedInInsight(partnerId: string): void {
  if (!/^\d+$/.test(partnerId)) return;
  const w = window as unknown as PixelWindow;
  w._linkedin_partner_id = partnerId;
  w._linkedin_data_partner_ids = w._linkedin_data_partner_ids ?? [];
  if (!w._linkedin_data_partner_ids.includes(partnerId)) w._linkedin_data_partner_ids.push(partnerId);
  if (!w.lintrk) {
    const lintrk: Queue = (a, b) => lintrk.q?.push([a, b]);
    lintrk.q = [];
    w.lintrk = lintrk;
  }
  inject(LINKEDIN_INSIGHT_SRC);
}

/** Meta Pixel: autoConfig desligado + init + PageView e nada mais (o snippet oficial, em TypeScript). */
export function loadMetaPixel(pixelId: string): void {
  if (!/^\d+$/.test(pixelId)) return;
  const w = window as unknown as PixelWindow;
  if (!w.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue?.push(args);
    }) as NonNullable<PixelWindow["fbq"]>;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    w.fbq = fbq;
    w._fbq = w._fbq ?? fbq;
    fbq("consent", "grant");
    // Sem eventos automáticos nem correspondência avançada automática (B347): tem de vir antes do init.
    fbq("set", "autoConfig", false, pixelId);
    fbq("init", pixelId);
    fbq("track", "PageView");
  }
  inject(META_PIXEL_SRC);
}

/** Recusa depois de um aceite na mesma página: o Meta Pixel para de enviar (o LinkedIn não tem API; some na próxima página). */
export function revokeMetaPixel(): void {
  (window as unknown as PixelWindow).fbq?.("consent", "revoke");
}
