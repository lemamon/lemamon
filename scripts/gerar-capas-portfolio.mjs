#!/usr/bin/env node
// Gera as CAPAS dos cases publicados do portfólio: uma ilustração por case,
// 1200×675, em src/content/cases/_imagens/<slug>/capa.png. Os cases vão ao ar
// anonimizados, então cada capa desenha só o TIPO de produto (painel, app no
// celular, site, widget de gráfico, jogo, sensor + app, mapa de vias...) com
// composição própria; nenhuma é tela real (o alt de cada capa diz
// "Ilustração de…"). Usam só a paleta da marca e não desenham logo, nome nem
// marca de cliente, produto, parceiro ou lugar, rosto ou foto de pessoa. Texto
// na imagem é o mínimo e neutro de idioma: números e siglas genéricas de
// interface (AQI, BLE, kg, %) e ícones; títulos e nomes viram barras de texto.
//
// Uso: node scripts/gerar-capas-portfolio.mjs
// Cada capa é um HTML montado aqui (CSS + SVG inline, fontes do sistema) e
// fotografado pelo Chromium do Playwright (@playwright/test, já instalado para
// os testes e2e). A página não usa a rede: toda requisição é abortada. Os
// números dos gráficos saem de um gerador com semente fixa por slug, então
// cada execução gera os mesmos desenhos.
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "content", "cases", "_imagens");

const W = 1200;
const H = 675;
const LIMITE_BYTES = 400 * 1024;

// Paleta da marca (mesmos valores de src/styles/tokens.css; imagem não lê CSS).
const INK_800 = "#18216d";
const INK_600 = "#2f3f9e";
const INK_50 = "#eef1fb";
const AMBER_500 = "#f59e0b";
const NEUTRAL_100 = "#f1f3f6";
const NEUTRAL_300 = "#cfd5de";
const WHITE = "#ffffff";
const FONT = "Helvetica, Arial, sans-serif";

// --- utilidades ---------------------------------------------------------------

/** Gerador pseudoaleatório com semente (mulberry32): mesmo slug, mesmos números. */
function rng(slug) {
  let seed = 0;
  for (const ch of slug) seed = (Math.imul(seed, 31) + ch.charCodeAt(0)) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cor da paleta com transparência (rgba), para sombras e véus. */
function alpha(color, a) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

const sombra = (a = 0.18, y = 22, blur = 44) => `box-shadow:0 ${y}px ${blur}px ${alpha(INK_800, a)};`;

/** Caixa posicionada em coordenadas absolutas (px) dentro do pai. */
function abs(x, y, w, h, css = "", inner = "") {
  const size = `${w == null ? "" : `width:${w}px;`}${h == null ? "" : `height:${h}px;`}`;
  return `<div class="a" style="left:${x}px;top:${y}px;${size}${css}">${inner}</div>`;
}

/** Linha de "texto" de interface (barra arredondada no lugar das palavras). */
const ln = (w, color = NEUTRAL_300, h = 10, css = "") =>
  `<i class="ln" style="width:${w}px;height:${h}px;background:${color};${css}"></i>`;

const txt = (s, size, color = INK_800, weight = 700, css = "") =>
  `<span style="font-size:${size}px;font-weight:${weight};color:${color};line-height:1;${css}">${s}</span>`;

const row = (gap, inner, css = "") => `<div style="display:flex;align-items:center;gap:${gap}px;${css}">${inner}</div>`;
const col = (gap, inner, css = "") => `<div style="display:flex;flex-direction:column;gap:${gap}px;${css}">${inner}</div>`;
const dot = (size, color, css = "") =>
  `<i style="display:inline-block;flex:none;width:${size}px;height:${size}px;border-radius:50%;background:${color};${css}"></i>`;
const svg = (w, h, inner, css = "") =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible;${css}">${inner}</svg>`;

// Ícones de traço (grade 24×24), desenhados aqui: nenhum vem de biblioteca ou marca.
const ICONS = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M7 7l10 10M17 7L7 17"/>',
  bell: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 1.5h-15z"/><path d="M10 21.2h4"/>',
  pin: '<path d="M12 21.5s7-6.6 7-12a7 7 0 0 0-14 0c0 5.4 7 12 7 12z"/><circle cx="12" cy="9.5" r="2.6"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a4.8 4.8 0 0 1 6.4 0"/><path d="M12 19.4h.01"/>',
  bt: '<path d="M7 7.5l10 9-5 4.5V3l5 4.5-10 9"/>',
  heart: '<path d="M12 20s-8-5.2-8-11a4.4 4.4 0 0 1 8-2.6A4.4 4.4 0 0 1 20 9c0 5.8-8 11-8 11z"/>',
  folder: '<path d="M3 6.5h6l2 2.5h10v10.5H3z"/>',
  doc: '<path d="M6 2.5h8.5L19 7v14.5H6z"/><path d="M14 2.5V7h5M9 12h6.5M9 16h6.5"/>',
  bolt: '<path d="M13.5 2.5L5 13.5h6.5l-1 8 8.5-11h-6.5z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>',
  home: '<path d="M3.5 11L12 3.5l8.5 7.5v9.5h-17z"/><path d="M9.5 20.5V15h5v5.5"/>',
  book: '<path d="M4 5.5c3-1.5 5.5-1.5 8 0v14c-2.5-1.5-5-1.5-8 0zM20 5.5c-3-1.5-5.5-1.5-8 0v14c2.5-1.5 5-1.5 8 0z"/>',
  building: '<path d="M3.5 20.5h17M5 20.5V9.5h14v11M4 9.5L12 4l8 5.5M8.5 12.5v5M12 12.5v5M15.5 12.5v5"/>',
  megaphone: '<path d="M3.5 10v4h3.5l8 5V5l-8 5z"/><path d="M18.5 9a4 4 0 0 1 0 6"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  cloud: '<path d="M7 18.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18.5z"/>',
  rain: '<path d="M7 14.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14.5z"/><path d="M8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3"/>',
  storm: '<path d="M7 14.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14.5z"/><path d="M12.5 14.5l-2.5 4h3.5l-2 4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  truck: '<path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3 3.5v3h-7z"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  bus: '<rect x="4" y="3.5" width="16" height="15" rx="3"/><path d="M4 11h16M7.5 21v-2.5M16.5 21v-2.5M8 15h.01M16 15h.01"/>',
  car: '<path d="M4 15.5l1.8-5.2A2 2 0 0 1 7.7 9h8.6a2 2 0 0 1 1.9 1.3L20 15.5v3.5H4z"/><path d="M7.5 16h.01M16.5 16h.01"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/>',
  shieldCheck: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  clip: '<path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.6 1.6 0 0 1-2.3-2.3L15 7.3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  arrowR: '<path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/>',
  arrowUp: '<path d="M12 20V5M6.5 10.5L12 5l5.5 5.5"/>',
  arrowDown: '<path d="M12 4v15M6.5 13.5L12 19l5.5-5.5"/>',
  chevD: '<path d="M6 9.5l6 6 6-6"/>',
  chevU: '<path d="M6 14.5l6-6 6 6"/>',
  chevR: '<path d="M9.5 6l6 6-6 6"/>',
  chevL: '<path d="M14.5 6l-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  droplet: '<path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3z"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/>',
  flame: '<path d="M12 21.5c-4 0-6.5-2.8-6.5-6.3 0-4.2 4-6.2 4-10.7 3 1.7 4.4 4 4.4 6.4 1-.6 1.6-1.6 1.8-2.9 1.8 1.7 2.8 4 2.8 6.6 0 3.8-2.5 6.9-6.5 6.9z"/>',
  activity: '<path d="M2.5 12h4l2.5-6.5 5 13 2.5-6.5h5"/>',
  camera: '<path d="M3 7.5h4l2-2.5h6l2 2.5h4v12H3z"/><circle cx="12" cy="13" r="3.8"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  chart: '<path d="M4 20V4M4 20h16M8.5 16v-5M13 16V8M17.5 16v-3"/>',
  alert: '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.3v.2"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
  code: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
  box: '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>',
  cart: '<path d="M2.5 4h3l2.2 11h10.6l2-8H6.5"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  sync: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  swap: '<path d="M7 4v16M3.5 7.5L7 4l3.5 3.5M17 20V4M13.5 16.5L17 20l3.5-3.5"/>',
  server: '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M7.5 7h.01M7.5 17h.01M11 7h5M11 17h5"/>',
  scale: '<path d="M12 3.5v17M7.5 20.5h9M4.5 7h15M6.5 7l-3 7a3 3 0 0 0 6 0zM17.5 7l-3 7a3 3 0 0 0 6 0z"/>',
  layers: '<path d="M12 3.5L2.5 8.5 12 13.5l9.5-5zM2.5 12.5L12 17.5l9.5-5M2.5 16.5L12 21.5l9.5-5"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 16l5-5 4 4 3-3 5 5"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  send: '<path d="M3.5 11.5L20.5 4l-6.5 16.5-3-6.5z"/><path d="M11 14l9.5-10"/>',
  tower: '<path d="M12 9.5L7.5 21M12 9.5l4.5 11.5M9 17h6M12 9.5v.01"/><path d="M8.5 6a5 5 0 0 0 0 7M15.5 6a5 5 0 0 1 0 7M5.5 3.5a9 9 0 0 0 0 12M18.5 3.5a9 9 0 0 1 0 12"/>',
  hand: '<path d="M9 13V5a1.6 1.6 0 0 1 3.2 0v6.5M12.2 10.5a1.6 1.6 0 0 1 3.2 0v1.5M15.4 11a1.6 1.6 0 0 1 3.2 0v1M18.6 12a1.6 1.6 0 0 1 3.2 0V15c0 4-2.6 6.5-6.5 6.5h-1.6c-2.2 0-3.6-1-4.8-2.8L5 14.6a1.7 1.7 0 0 1 2.7-2L9 14"/>',
  edit: '<path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16z"/>',
  sliders: '<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  move: '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8l1.6 2.4 2.8-.8.6 2.8 2.8.6-.8 2.8 2.4 1.6-2.4 1.6.8 2.8-2.8.6-.6 2.8-2.8-.8L12 21.2l-1.6-2.4-2.8.8-.6-2.8-2.8-.6.8-2.8L2.8 12l2.4-1.6-.8-2.8 2.8-.6.6-2.8 2.8.8z"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
};

/** Ícone como <svg> solto (HTML). */
function ic(name, size, color, sw = 2, fill = "none") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none">${ICONS[name]}</svg>`;
}

/** Ícone dentro de um SVG maior (grupo posicionado). */
function icg(name, x, y, size, color, sw = 2, fill = "none") {
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;
}

/** Ícone num círculo de fundo. */
const badgeIcon = (name, size, bg, color, sw = 2.2, pad = 0.5) =>
  `<div style="flex:none;width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center">${ic(name, Math.round(size * pad), color, sw)}</div>`;

/** Caminho suave (Catmull-Rom → Bézier) por uma lista de pontos. */
function smooth(points) {
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Valores (0..1) espalhados numa área: lista de [x, y]. */
const pontos = (vals, x, y, w, h) => vals.map((v, i) => [x + (i * w) / (vals.length - 1), y + h - v * h]);

/** Série aleatória suave entre min e max. */
function serie(r, n, min = 0.2, max = 0.9) {
  let v = min + r() * (max - min);
  return Array.from({ length: n }, () => {
    v = Math.min(max, Math.max(min, v + (r() - 0.5) * 0.35));
    return v;
  });
}

/** Arco de anel (para donuts e medidores), ângulos em graus a partir do topo. */
function arco(cx, cy, raio, de, ate) {
  const p = (a) => [cx + raio * Math.sin((a * Math.PI) / 180), cy - raio * Math.cos((a * Math.PI) / 180)];
  const [x1, y1] = p(de);
  const [x2, y2] = p(ate);
  const grande = ate - de > 180 ? 1 : 0;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${raio},${raio} 0 ${grande} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

/** Anel de progresso (0..1) em SVG. */
function anel(size, frac, color, track, sw, inner = "") {
  const c = size / 2;
  const rr = c - sw / 2;
  const end = Math.min(359.9, frac * 360);
  return svg(
    size,
    size,
    `<circle cx="${c}" cy="${c}" r="${rr}" fill="none" stroke="${track}" stroke-width="${sw}"/><path d="${arco(c, c, rr, 0, end)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>${inner}`,
  );
}

// --- molduras de dispositivo ---------------------------------------------------

/** Celular em pé: moldura, tela com cantos arredondados e a ilha da câmera. */
function phone(x, y, w, h, inner, { frame = INK_800, screen = WHITE, rot = 0, r = 40, b = 11, shadow = sombra(0.3, 28, 56) } = {}) {
  const sw = w - 2 * b;
  const sh = h - 2 * b;
  return abs(
    x,
    y,
    w,
    h,
    `background:${frame};border-radius:${r}px;padding:${b}px;transform:rotate(${rot}deg);${shadow}`,
    `<div style="position:relative;width:${sw}px;height:${sh}px;border-radius:${r - b}px;overflow:hidden;background:${screen}">${inner}${abs(sw / 2 - 38, 9, 76, 20, `background:${frame};border-radius:12px`)}</div>`,
  );
}

/** Celular deitado (jogo, câmera): ilha da câmera na lateral esquerda. */
function phoneLand(x, y, w, h, inner, { frame = INK_800, screen = WHITE, r = 54, b = 15, shadow = sombra(0.3, 28, 56) } = {}) {
  const sw = w - 2 * b;
  const sh = h - 2 * b;
  return abs(
    x,
    y,
    w,
    h,
    `background:${frame};border-radius:${r}px;padding:${b}px;${shadow}`,
    `<div style="position:relative;width:${sw}px;height:${sh}px;border-radius:${r - b}px;overflow:hidden;background:${screen}">${inner}${abs(10, sh / 2 - 38, 20, 76, `background:${frame};border-radius:12px`)}</div>`,
  );
}

/** Janela de navegador estilizada (barra com três pontos e campo de endereço vazio). */
function browser(x, y, w, h, inner, { bar = NEUTRAL_100, body = WHITE, url = WHITE, dots = NEUTRAL_300, shadow = sombra(), r = 16 } = {}) {
  const top = `<div style="height:40px;background:${bar};display:flex;align-items:center;gap:8px;padding:0 18px">${dot(12, dots)}${dot(12, dots)}${dot(12, dots)}<i style="margin-left:18px;width:${Math.min(380, Math.round(w * 0.38))}px;height:20px;border-radius:10px;background:${url}"></i></div>`;
  return abs(x, y, w, h, `border-radius:${r}px;overflow:hidden;background:${body};${shadow}`, `${top}<div style="position:relative;height:${h - 40}px">${inner}</div>`);
}

// --- desenhos reaproveitados ---------------------------------------------------

/** Peças de EPI (sem pessoa): capacete, colete, luva e bota. */
function epi(kind, w) {
  const views = {
    capacete: [
      "0 0 100 70",
      `<path d="M14 54C14 24 32 8 50 8S86 24 86 54Z" fill="${AMBER_500}"/><rect x="41" y="9" width="18" height="44" rx="4" fill="${WHITE}" opacity=".35"/><rect x="3" y="50" width="94" height="12" rx="6" fill="${AMBER_500}" stroke="${INK_800}" stroke-width="3"/>`,
    ],
    colete: [
      "0 0 100 110",
      `<path d="M20 6H37L47 34 46 104H10L6 32Z" fill="${INK_600}"/><path d="M80 6H63L53 34 54 104H90L94 32Z" fill="${INK_600}"/><rect x="9" y="62" width="37" height="9" fill="${WHITE}"/><rect x="54" y="62" width="37" height="9" fill="${WHITE}"/><rect x="9" y="82" width="37" height="9" fill="${WHITE}"/><rect x="54" y="82" width="37" height="9" fill="${WHITE}"/>`,
    ],
    luva: [
      "0 0 84 100",
      `<g fill="${NEUTRAL_300}"><rect x="16" y="10" width="12" height="40" rx="6"/><rect x="30" y="4" width="12" height="44" rx="6"/><rect x="44" y="6" width="12" height="44" rx="6"/><rect x="58" y="14" width="11" height="36" rx="5.5"/><rect x="14" y="34" width="56" height="46" rx="14"/><rect x="2" y="38" width="12" height="32" rx="6" transform="rotate(-32 8 70)"/></g><rect x="17" y="76" width="50" height="20" rx="4" fill="${INK_600}"/>`,
    ],
    bota: [
      "0 0 100 92",
      `<path d="M18 4H50V46L82 54C92 56 96 62 96 70V76H14V4Z" fill="${INK_800}"/><rect x="10" y="74" width="88" height="14" rx="5" fill="${AMBER_500}"/><rect x="18" y="4" width="32" height="10" fill="${INK_600}"/>`,
    ],
  };
  const [viewBox, body] = views[kind];
  const [, , vw, vh] = viewBox.split(" ").map(Number);
  return `<svg width="${w}" height="${Math.round((w * vh) / vw)}" viewBox="${viewBox}" style="display:block;overflow:visible">${body}</svg>`;
}

/** Sensor pequeno (placa + LED + ondas de sinal), em SVG. */
const sensor = (x, y) =>
  `<g transform="translate(${x} ${y})"><rect width="34" height="22" rx="5" fill="${INK_800}"/><circle cx="10" cy="11" r="4" fill="${AMBER_500}"/><path d="M22 7h6M22 15h6" stroke="${INK_600}" stroke-width="2.5" stroke-linecap="round"/><path d="M40 0a14 14 0 0 1 0 22M48 -6a22 22 0 0 1 0 34" fill="none" stroke="${AMBER_500}" stroke-width="3" stroke-linecap="round"/></g>`;

/** Botijão de gás (desenho genérico, sem marca). */
function botijao(w, { body = INK_600, dark = INK_800, label = true } = {}) {
  return `<svg width="${w}" height="${Math.round(w * 1.55)}" viewBox="0 0 300 465" style="display:block">
    <rect x="104" y="14" width="92" height="62" rx="22" fill="none" stroke="${dark}" stroke-width="18"/>
    <rect x="136" y="70" width="28" height="30" rx="4" fill="${NEUTRAL_300}"/>
    <rect x="28" y="92" width="244" height="336" rx="88" fill="${body}"/>
    <rect x="28" y="236" width="244" height="26" fill="${dark}" opacity=".55"/>
    <rect x="58" y="132" width="26" height="250" rx="13" fill="${WHITE}" opacity=".22"/>
    <rect x="52" y="418" width="196" height="40" rx="8" fill="${dark}"/>
    ${label ? `<rect x="94" y="290" width="118" height="64" rx="14" fill="${WHITE}"/><text x="153" y="333" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="700" fill="${INK_800}">13 kg</text>` : ""}
  </svg>`;
}

/** Caixa de leite (silhueta genérica). */
const caixaLeite = (w, fill, roof, stroke = "none") =>
  `<svg width="${w}" height="${Math.round(w * 1.5)}" viewBox="0 0 40 60" style="display:block"><rect x="13" y="1" width="14" height="6" rx="1" fill="${roof}"/><path d="M6 19L12 7H28L34 19V58H6Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M6 19H34" stroke="${roof}" stroke-width="3"/><rect x="11" y="30" width="18" height="14" rx="3" fill="${roof}" opacity=".5"/></svg>`;

/** Gota (ponta para cima). */
function gota(cx, cy, s, fill) {
  return `<path d="M${cx},${cy - 1.6 * s} C${cx + 0.4 * s},${cy - 0.8 * s} ${cx + s},${cy - 0.2 * s} ${cx + s},${cy + 0.3 * s} A${s},${s} 0 0 1 ${cx - s},${cy + 0.3 * s} C${cx - s},${cy - 0.2 * s} ${cx - 0.4 * s},${cy - 0.8 * s} ${cx},${cy - 1.6 * s} Z" fill="${fill}"/>`;
}

/** Coroa de respingo (base em y, altura h, meia-largura w): parede em taça, dedos inclinados para fora e uma gota no topo de cada um. */
function coroa(cx, base, h, w, fill) {
  const k = w / 110;
  const f = (n) => n.toFixed(1);
  const borda = base - 0.36 * h;
  let d = `M${f(cx - 80 * k)},${base} C${f(cx - 86 * k)},${f(base - 0.15 * h)} ${f(cx - 104 * k)},${f(borda + 0.08 * h)} ${f(cx - 108 * k)},${f(borda)} L${f(cx + 108 * k)},${f(borda)} C${f(cx + 104 * k)},${f(borda + 0.08 * h)} ${f(cx + 86 * k)},${f(base - 0.15 * h)} ${f(cx + 80 * k)},${base} Z`;
  let gotas = "";
  const dedos = [
    [-100, 0.64],
    [-67, 0.84],
    [-33, 0.74],
    [0, 0.96],
    [33, 0.74],
    [67, 0.84],
    [100, 0.64],
  ];
  const m = 11 * k;
  for (const [dx, alto] of dedos) {
    const x = cx + dx * k;
    const topo = base - alto * h;
    const xt = x + dx * k * 0.16;
    const meio = borda - (borda - topo) * 0.45;
    d += ` M${f(x - m)},${f(borda + 3)} C${f(x - m * 0.55)},${f(meio)} ${f(xt - m * 0.4)},${f(topo + m)} ${f(xt)},${f(topo)} C${f(xt + m * 0.4)},${f(topo + m)} ${f(x + m * 0.55)},${f(meio)} ${f(x + m)},${f(borda + 3)} Z`;
    gotas += `<circle cx="${f(xt + dx * k * 0.04)}" cy="${f(topo - m * 1.05)}" r="${f(m * 0.72)}" fill="${fill}"/>`;
  }
  return `<path d="${d}" fill="${fill}"/>${gotas}`;
}

// --- capas ---------------------------------------------------------------------

/**
 * Cada capa: fundo e o HTML da ilustração.
 */
const COVERS = {
  // Painel interativo de totem: página inicial com toque e animação (ondas do toque, curva de easing e linha do tempo).
  "painel-interativo-com-animacoes": () => {
    const SW = 438;
    const icons = ["home", "calendar", "pin", "play", "grid", "info"];
    let tiles = "";
    icons.forEach((name, i) => {
      const x = 28 + (i % 2) * 197;
      const y = 140 + Math.floor(i / 2) * 112;
      const on = i === 3;
      tiles += abs(
        x,
        y,
        181,
        96,
        `background:${on ? AMBER_500 : WHITE};border-radius:16px;${on ? "transform:scale(.95)" : `box-shadow:0 4px 0 ${NEUTRAL_300}`}`,
        abs(16, 16, null, null, "", badgeIcon(name, 40, on ? WHITE : INK_50, INK_600)) + abs(16, 70, null, null, "", ln(70 + (i % 3) * 18, on ? WHITE : NEUTRAL_300, 10)),
      );
    });
    const ripple = svg(
      SW,
      488,
      [100, 74, 48].map((rr, i) => `<circle cx="315" cy="300" r="${rr}" fill="none" stroke="${AMBER_500}" stroke-width="${2 + i * 1.5}" opacity="${0.25 + i * 0.3}"/>`).join(""),
    );
    const screen = abs(0, 0, SW, 56, `background:${WHITE};display:flex;align-items:center;justify-content:space-between;padding:0 24px`, row(10, dot(14, AMBER_500) + ln(90, INK_800, 12)) + txt("10:24", 17, INK_600)) +
      abs(28, 78, null, null, "", col(10, ln(220, INK_800, 18) + ln(150, NEUTRAL_300, 12))) +
      tiles +
      abs(0, 0, SW, 488, "pointer-events:none", ripple) +
      abs(292, 286, 64, 64, `background:${WHITE};border-radius:50%;display:flex;align-items:center;justify-content:center;${sombra(0.3, 8, 18)}`, ic("hand", 38, INK_800, 1.8));
    const kiosk = abs(150, 46, 470, 520, `background:${INK_600};border-radius:30px;padding:16px`, `<div style="position:relative;width:438px;height:488px;border-radius:18px;overflow:hidden;background:${INK_50}">${screen}</div>`) +
      abs(355, 566, 60, 74, `background:${INK_600}`) +
      abs(270, 636, 230, 18, `background:${INK_600};border-radius:9px`);
    // Curva de easing com alças e o ponto animado deixando rastro.
    const bez = (t) => {
      const [p0, p1, p2, p3] = [[40, 220], [190, 220], [200, 40], [410, 40]];
      const m = 1 - t;
      return [0, 1].map((k) => m ** 3 * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t ** 3 * p3[k]);
    };
    const ghosts = [0.2, 0.3, 0.4, 0.5].map((t, i) => {
      const [x, y] = bez(t);
      return `<circle cx="${x}" cy="${y}" r="${5 + i}" fill="${AMBER_500}" opacity="${0.15 + i * 0.15}"/>`;
    });
    const [bx, by] = bez(0.62);
    let grid = "";
    for (let i = 0; i < 5; i++) grid += `<path d="M40 ${40 + i * 45}H410" stroke="${INK_800}" stroke-width="1.5"/>`;
    const curva = svg(
      440,
      260,
      `${grid}<path d="M40 220H410M40 220V30" stroke="${INK_50}" stroke-opacity=".5" stroke-width="2"/><path d="M40 220L190 220M410 40L200 40" stroke="${WHITE}" stroke-width="2" stroke-dasharray="5 5"/><path d="M40 220C190 220 200 40 410 40" fill="none" stroke="${AMBER_500}" stroke-width="6" stroke-linecap="round"/><circle cx="190" cy="220" r="8" fill="${WHITE}"/><circle cx="200" cy="40" r="8" fill="${WHITE}"/>${ghosts.join("")}<circle cx="${bx}" cy="${by}" r="12" fill="${AMBER_500}" stroke="${WHITE}" stroke-width="4"/>`,
    );
    const tracks = [
      [80, 200, 330],
      [120, 260],
      [80, 160, 400],
    ];
    let tl = "";
    ["0", "300", "600", "900"].forEach((n, i) => {
      const x = 80 + i * 106.7;
      tl += `<path d="M${x} 44V52" stroke="${INK_50}" stroke-opacity=".6" stroke-width="2"/><text x="${x}" y="34" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700" fill="${INK_50}" fill-opacity=".7">${n}</text>`;
    });
    tracks.forEach((keys, i) => {
      const y = 84 + i * 44;
      tl += `<rect x="24" y="${y - 12}" width="24" height="24" rx="6" fill="${INK_800}"/><rect x="80" y="${y - 2}" width="330" height="4" rx="2" fill="${INK_800}"/>`;
      keys.forEach((k, j) => {
        tl += `<rect x="${k - 8}" y="${y - 8}" width="16" height="16" fill="${(i + j) % 2 ? AMBER_500 : WHITE}" transform="rotate(45 ${k} ${y})"/>`;
      });
    });
    tl += `<path d="M262 58V196" stroke="${AMBER_500}" stroke-width="3"/><path d="M252 52h20l-10 12z" fill="${AMBER_500}"/>`;
    return {
      bg: `${INK_800};background-image:radial-gradient(${INK_600} 1.6px, transparent 1.8px);background-size:28px 28px`,
      html: kiosk + abs(700, 96, 440, 260, `background:${INK_600};border-radius:22px`, curva) + abs(700, 380, 440, 220, `background:${INK_600};border-radius:22px`, svg(440, 220, tl)),
    };
  },

  // Site de estudo de caso: hero com título em barras e um fluxo de mensagens filtradas por IA.
  "site-de-estudo-de-caso-de-ia": () => {
    const bolha = (w, flagged, lines) =>
      `<div style="position:relative;align-self:flex-start;width:${w}px;padding:14px 16px;border-radius:18px 18px 18px 4px;background:${flagged ? INK_600 : WHITE}">${col(
        8,
        lines.map((lw) => ln(lw, flagged ? INK_800 : NEUTRAL_300, 10, flagged ? `background:repeating-linear-gradient(90deg, ${INK_800} 0 10px, ${alpha(INK_50, 0.35)} 10px 16px);filter:blur(1.5px)` : "")).join(""),
      )}${flagged ? abs(w - 18, -12, 34, 34, `background:${AMBER_500};border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid ${INK_800}`, ic("shieldCheck", 18, INK_800, 2.4)) : ""}</div>`;
    const chat =
      row(12, `<div style="width:46px;height:46px;border-radius:50%;background:${INK_600};display:flex;align-items:center;justify-content:center">${ic("star", 24, AMBER_500, 2, AMBER_500)}</div>` + col(8, ln(120, alpha(WHITE, 0.85), 12) + ln(70, INK_600, 9))) +
      col(11, bolha(230, false, [180, 120]) + bolha(260, true, [210, 150]) + bolha(190, false, [140]) + bolha(240, true, [190, 110]), "margin-top:18px");
    const nucleo = svg(
      120,
      120,
      `<circle cx="60" cy="60" r="56" fill="${AMBER_500}"/><g stroke="${INK_800}" stroke-width="3"><path d="M38 44L60 76L82 44Z" fill="none"/></g><circle cx="38" cy="44" r="9" fill="${INK_800}"/><circle cx="82" cy="44" r="9" fill="${INK_800}"/><circle cx="60" cy="76" r="9" fill="${INK_800}"/><circle cx="60" cy="56" r="5" fill="${WHITE}"/>`,
    );
    const inner =
      abs(48, 26, 984, 40, "display:flex;align-items:center;justify-content:space-between", row(12, `<i style="width:28px;height:28px;border-radius:8px;background:${AMBER_500}"></i>` + ln(80, INK_800, 12)) + row(28, ln(64) + ln(64) + ln(64) + `<i style="width:120px;height:36px;border-radius:18px;background:${INK_800}"></i>`)) +
      abs(48, 112, 480, null, "", col(18, ln(64, AMBER_500, 8) + col(18, ln(400, INK_800, 50) + row(14, ln(250, INK_800, 50) + ln(96, AMBER_500, 50))) + col(12, ln(400, NEUTRAL_300, 12) + ln(360, NEUTRAL_300, 12) + ln(250, NEUTRAL_300, 12)))) +
      abs(48, 418, null, null, "", row(48, col(10, txt("2.4k", 46, INK_600, 800) + ln(90)) + col(10, txt("87%", 46, AMBER_500, 800) + ln(90)) + col(10, txt("24/7", 46, INK_600, 800) + ln(90)))) +
      abs(620, 84, 400, 420, `background:${INK_800};border-radius:26px;padding:26px 28px`, chat) +
      abs(648, 440, 344, 46, `background:${INK_600};border-radius:23px;display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 20px`, ln(140, alpha(INK_50, 0.35), 10) + badgeIcon("send", 36, AMBER_500, INK_800, 2.2)) +
      abs(552, 214, 120, 120, `border-radius:50%;${sombra(0.35, 10, 24)}`, nucleo);
    return { bg: INK_50, html: browser(60, 52, 1080, 572, inner) };
  },

  // Seletor de produtos: passos, escolha de ambiente, carrossel de cards e a conversão de planilha para JSON.
  "seletores-de-produtos-para-varejo": () => {
    const passo = (n, on, cur) =>
      `<div style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 17px ${FONT};${on ? `background:${INK_600};color:${WHITE}` : `background:${WHITE};color:${INK_600};border:3px solid ${cur ? AMBER_500 : NEUTRAL_300}`}">${n}</div>`;
    const stepper = row(0, passo(1, true) + ln(120, INK_600, 4, "border-radius:0") + passo(2, true) + ln(120, NEUTRAL_300, 4, "border-radius:0") + passo(3, false, true));
    const ambientes = ["home", "droplet", "wind", "layers"]
      .map(
        (name, i) =>
          `<div style="position:relative;width:162px;height:162px;border-radius:18px;background:${INK_50};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;${i === 1 ? `outline:4px solid ${AMBER_500};outline-offset:-4px;background:${WHITE}` : ""}">${ic(name, 56, INK_600, 1.8)}${ln(70 + (i % 2) * 20)}${i === 1 ? abs(126, -10, 34, 34, `background:${AMBER_500};border-radius:50%;display:flex;align-items:center;justify-content:center`, ic("check", 20, INK_800, 3)) : ""}</div>`,
      )
      .join("");
    const produtos = [
      `<rect x="70" y="24" width="50" height="104" rx="16" fill="${INK_600}"/><rect x="78" y="14" width="34" height="16" rx="4" fill="${INK_800}"/><rect x="78" y="56" width="34" height="36" rx="6" fill="${WHITE}" opacity=".85"/>`,
      `<path d="M95 112H168L160 121L168 130H95Z" fill="${AMBER_500}"/><circle cx="95" cy="72" r="48" fill="${AMBER_500}"/><circle cx="95" cy="72" r="34" fill="none" stroke="${WHITE}" stroke-opacity=".35" stroke-width="3"/><circle cx="95" cy="72" r="22" fill="${INK_50}" stroke="${INK_800}" stroke-width="4"/>`,
      `<rect x="62" y="26" width="66" height="96" rx="10" fill="${NEUTRAL_300}"/><path d="M95 50v38a12 12 0 0 1-24 0" fill="none" stroke="${INK_800}" stroke-width="10" stroke-linecap="round"/><circle cx="95" cy="44" r="8" fill="${INK_800}"/>`,
    ];
    const estrelas = (n) => row(3, Array.from({ length: 5 }, (_, i) => ic("star", 16, AMBER_500, 2, i < n ? AMBER_500 : "none")).join(""));
    const cards = produtos
      .map(
        (p, i) =>
          `<div style="width:190px;height:300px;border-radius:18px;background:${WHITE};overflow:hidden;${i === 1 ? `transform:translateY(-10px);outline:3px solid ${INK_600};${sombra(0.22, 18, 30)}` : sombra(0.08, 6, 14)}"><div style="height:150px;background:${INK_50}">${svg(190, 150, p)}</div>${col(10, ln(140, INK_800, 12) + ln(100) + estrelas(4 + (i % 2)) + `<i style="margin-top:8px;width:96px;height:30px;border-radius:15px;background:${i === 1 ? AMBER_500 : INK_600}"></i>`, "padding:16px")}</div>`,
      )
      .join("");
    const chips = row(
      10,
      [0, 1, 2, 3].map((i) => `<i style="width:${[110, 90, 120, 80][i]}px;height:36px;border-radius:18px;${i === 0 ? `background:${INK_800}` : `background:${WHITE};border:2px solid ${NEUTRAL_300}`}"></i>`).join("") +
        `<div style="margin-left:auto">${row(8, ic("grid", 22, INK_600) + txt("120+", 24, INK_800, 800))}</div>`,
    );
    const seta = (name, x) => abs(x, 240, 46, 46, `background:${WHITE};border-radius:50%;display:flex;align-items:center;justify-content:center;${sombra(0.15, 6, 12)}`, ic(name, 24, INK_800, 2.6));
    let planilha = "";
    for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 3; c++) planilha += `<rect x="${c * 15}" y="${rr * 11}" width="13" height="9" rx="1.5" fill="${rr === 0 ? INK_600 : NEUTRAL_300}"/>`;
    return {
      bg: NEUTRAL_100,
      html:
        abs(0, 0, W, 76, `background:${INK_800};display:flex;align-items:center;gap:40px;padding:0 60px`, `<i style="width:36px;height:36px;border-radius:10px;background:${AMBER_500}"></i>` + row(28, ln(80, INK_600, 12) + ln(80, INK_600, 12) + ln(80, INK_600, 12)) + ic("search", 24, INK_50)) +
        abs(0, 104, W, 40, "display:flex;justify-content:center", stepper) +
        abs(60, 176, 400, 440, `background:${WHITE};border-radius:22px;padding:28px 30px`, col(24, ln(170, INK_800, 14) + `<div style="display:grid;grid-template-columns:162px 162px;gap:16px">${ambientes}</div>`)) +
        abs(500, 176, 640, 440, "", abs(0, 0, 640, 40, "", chips) + abs(40, 84, 560, 320, "display:flex;gap:20px", cards) + seta("chevL", -14) + seta("chevR", 610) + abs(40, 412, null, null, "", row(8, `<i style="width:28px;height:10px;border-radius:5px;background:${AMBER_500}"></i>` + [1, 2, 3, 4].map(() => dot(10, NEUTRAL_300)).join("")))) +
        abs(880, 566, 260, 72, `background:${WHITE};border-radius:18px;display:flex;align-items:center;justify-content:center;gap:18px;${sombra(0.15, 10, 20)}`, svg(44, 42, planilha) + ic("arrowR", 28, AMBER_500, 2.6) + txt("{ }", 30, INK_600, 800)),
    };
  },

  // Painel de qualidade do ar em tela grande: medidor do índice, poluentes e as últimas 24 horas.
  "painel-de-qualidade-do-ar": (r) => {
    const valor = 68;
    const ang = -90 + (valor / 150) * 180;
    let ticks = "";
    for (let i = 0; i <= 10; i++) {
      const a = -90 + i * 18;
      const rad = (a * Math.PI) / 180;
      ticks += `<path d="M${210 + 128 * Math.sin(rad)},${250 - 128 * Math.cos(rad)} L${210 + 116 * Math.sin(rad)},${250 - 116 * Math.cos(rad)}" stroke="${INK_50}" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>`;
    }
    const nr = (ang * Math.PI) / 180;
    const gauge = svg(
      420,
      330,
      `<path d="${arco(210, 250, 170, -90, 90)}" fill="none" stroke="${INK_600}" stroke-width="34" stroke-linecap="round"/><path d="${arco(210, 250, 170, -90, ang)}" fill="none" stroke="${AMBER_500}" stroke-width="34" stroke-linecap="round"/>${ticks}<circle cx="${210 + 170 * Math.sin(nr)}" cy="${250 - 170 * Math.cos(nr)}" r="24" fill="${WHITE}" stroke="${AMBER_500}" stroke-width="8"/><text x="40" y="300" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${INK_50}" fill-opacity=".6">0</text><text x="380" y="300" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${INK_50}" fill-opacity=".6">150</text>`,
    );
    const tiles = [
      ["PM2.5", "18"],
      ["PM10", "26"],
      ["O₃", "31"],
      ["NO₂", "9"],
    ]
      .map(([k, v], i) => {
        const vals = serie(r, 9);
        return `<div style="position:relative;width:200px;height:150px;border-radius:16px;background:${INK_600};padding:16px 18px">${col(10, txt(k, 17, INK_50, 700, "opacity:.8") + row(8, txt(v, 46, WHITE, 800) + txt("µg/m³", 14, INK_50, 700, "opacity:.6;align-self:flex-end;margin-bottom:6px")))}${abs(18, 108, 164, 30, "", svg(164, 30, `<path d="${smooth(pontos(vals, 0, 2, 164, 26))}" fill="none" stroke="${i === 0 ? AMBER_500 : INK_50}" stroke-width="3" stroke-linecap="round"/>`))}</div>`;
      })
      .join("");
    const horas = serie(r, 24, 0.25, 1);
    let bars = "";
    horas.forEach((v, i) => {
      bars += `<rect x="${i * 35.5}" y="${50 - v * 50}" width="26" height="${v * 50}" rx="4" fill="${i === 17 ? AMBER_500 : INK_600}"/>`;
    });
    ["00", "06", "12", "18", "24"].forEach((t, i) => {
      bars += `<text x="${Math.min(i * 6 * 35.5, 23 * 35.5 + 26) + (i === 4 ? -10 : 0)}" y="70" font-family="${FONT}" font-size="13" font-weight="700" fill="${INK_50}" fill-opacity=".5">${t}</text>`;
    });
    const tela =
      abs(28, 22, 876, 30, "display:flex;align-items:center;justify-content:space-between", row(12, dot(14, AMBER_500, `box-shadow:0 0 0 6px ${alpha(AMBER_500, 0.25)}`) + txt("14:05", 20, WHITE)) + row(14, ln(120, INK_600, 10) + ic("wifi", 24, INK_50, 2.2))) +
      abs(30, 64, 420, 330, "", gauge) +
      abs(30, 228, 420, null, "text-align:center", col(8, txt(String(valor), 104, WHITE, 800, "letter-spacing:-3px") + txt("AQI", 22, AMBER_500, 800, "letter-spacing:6px"), "align-items:center")) +
      abs(494, 70, 416, 316, "display:grid;grid-template-columns:200px 200px;gap:16px", tiles) +
      abs(34, 404, 864, 76, "", svg(864, 76, bars));
    return {
      bg: `${NEUTRAL_100};background-image:linear-gradient(${NEUTRAL_100} 0 600px, ${NEUTRAL_300} 600px)`,
      html:
        abs(570, 574, 60, 40, `background:${INK_600}`) +
        abs(470, 608, 260, 18, `background:${INK_600};border-radius:9px`) +
        abs(120, 56, 960, 520, `background:${INK_600};border-radius:22px;padding:14px;${sombra(0.25, 24, 50)}`, `<div style="position:relative;width:932px;height:492px;border-radius:12px;background:${INK_800};overflow:hidden">${tela}</div>`),
    };
  },

  // Template modular para CMS: página montada por componentes numerados e a biblioteca de onde se arrasta um novo bloco.
  "template-modular-para-site-de-marca": () => {
    const mods = [
      [36, `display:flex;align-items:center;justify-content:space-between;padding:0 6px`, ln(60, INK_800, 12) + row(12, ln(40) + ln(40) + ln(40))],
      [130, `background:${AMBER_500};border-radius:10px;padding:24px 24px;position:relative;outline:3px solid ${INK_600};outline-offset:4px`, col(12, ln(190, INK_800, 18) + ln(130, alpha(INK_800, 0.45), 12) + `<i style="margin-top:10px;width:96px;height:30px;border-radius:15px;background:${WHITE}"></i>`) + abs(262, 40, 84, 84, `border-radius:50%;background:${alpha(WHITE, 0.45)}`) + abs(282, 10, 92, 30, `background:${INK_600};border-radius:8px;display:flex;align-items:center;justify-content:space-around;padding:0 8px`, ic("move", 16, WHITE) + ic("gear", 16, WHITE) + ic("x", 16, WHITE))],
      [100, `display:flex;gap:12px`, [0, 1, 2].map(() => `<div style="flex:1;border-radius:10px;background:${INK_50};padding:10px">${col(8, `<i style="display:block;height:36px;border-radius:6px;background:${NEUTRAL_300}"></i>` + ln(70) + ln(50))}</div>`).join("")],
      [84, `border:3px dashed ${AMBER_500};border-radius:12px;background:${alpha(AMBER_500, 0.08)};display:flex;align-items:center;justify-content:center`, badgeIcon("plus", 40, AMBER_500, INK_800, 3)],
      [64, `display:flex;gap:10px`, [0, 1, 2, 3].map(() => `<i style="flex:1;border-radius:8px;background:${NEUTRAL_100}"></i>`).join("")],
      [40, `background:${INK_800};border-radius:8px`, ""],
    ];
    let y = 18;
    let page = "";
    let tags = "";
    mods.forEach(([h, css, inner], i) => {
      page += abs(18, y, 394, h, css, inner);
      tags += abs(36, 56 + y + h / 2 - 12, 34, 24, `background:${i === 3 ? AMBER_500 : INK_600};border-radius:6px;display:flex;align-items:center;justify-content:center`, txt(`0${i + 1}`, 12, i === 3 ? INK_800 : WHITE, 700));
      y += h + 14;
    });
    const thumbs = [
      `<rect x="14" y="14" width="172" height="58" rx="8" fill="${AMBER_500}"/><rect x="26" y="30" width="70" height="8" rx="4" fill="${INK_800}"/><rect x="14" y="82" width="120" height="8" rx="4" fill="${NEUTRAL_300}"/>`,
      [0, 1, 2].map((i) => `<rect x="${14 + i * 60}" y="14" width="52" height="78" rx="8" fill="${INK_50}"/><rect x="${22 + i * 60}" y="22" width="36" height="28" rx="4" fill="${NEUTRAL_300}"/>`).join(""),
      `<rect x="40" y="14" width="120" height="66" rx="8" fill="${INK_50}"/><path d="M26 47l-8-8M26 47l-8 8M174 47l8-8M174 47l8 8" stroke="${INK_600}" stroke-width="3" stroke-linecap="round"/><circle cx="88" cy="92" r="4" fill="${AMBER_500}"/><circle cx="100" cy="92" r="4" fill="${NEUTRAL_300}"/><circle cx="112" cy="92" r="4" fill="${NEUTRAL_300}"/>`,
      `<rect x="14" y="14" width="172" height="80" rx="8" fill="${INK_800}"/><circle cx="100" cy="54" r="20" fill="${WHITE}"/><path d="M94 44v20l16-10z" fill="${INK_800}"/>`,
      `<text x="20" y="66" font-family="Georgia, serif" font-size="70" font-weight="700" fill="${INK_600}">“</text><rect x="70" y="30" width="110" height="8" rx="4" fill="${NEUTRAL_300}"/><rect x="70" y="48" width="90" height="8" rx="4" fill="${NEUTRAL_300}"/><rect x="70" y="72" width="50" height="8" rx="4" fill="${AMBER_500}"/>`,
      `<rect x="14" y="16" width="172" height="20" rx="6" fill="${NEUTRAL_100}" stroke="${NEUTRAL_300}" stroke-width="2"/><rect x="14" y="44" width="172" height="20" rx="6" fill="${NEUTRAL_100}" stroke="${NEUTRAL_300}" stroke-width="2"/><rect x="14" y="74" width="70" height="22" rx="11" fill="${INK_600}"/>`,
    ];
    const lib = thumbs
      .map((t, i) =>
        i === 3
          ? `<div style="height:140px;border-radius:14px;border:3px dashed ${NEUTRAL_300}"></div>`
          : `<div style="height:140px;border-radius:14px;background:${WHITE};padding:8px">${svg(200, 108, t)}${ln(80, NEUTRAL_300, 8, "margin:6px 0 0 14px")}</div>`,
      )
      .join("");
    const arrastado = abs(
      440,
      352,
      232,
      148,
      `background:${WHITE};border-radius:14px;padding:10px;transform:rotate(-6deg);outline:3px solid ${INK_600};${sombra(0.35, 22, 36)}`,
      svg(200, 108, thumbs[3]) + ln(80, NEUTRAL_300, 8, "margin:6px 0 0 14px"),
    );
    return {
      bg: `${WHITE};background-image:radial-gradient(${INK_50} 2px, transparent 2.2px);background-size:24px 24px`,
      html:
        abs(84, 56, 430, 570, `background:${WHITE};border:2px solid ${NEUTRAL_300};border-radius:18px;${sombra(0.12, 16, 32)}`, page) +
        tags +
        abs(600, 56, 540, 568, `background:${INK_50};border-radius:22px;padding:24px 26px`, row(12, badgeIcon("grid", 40, INK_600, WHITE) + ln(140, INK_800, 14) + `<i style="margin-left:auto;width:150px;height:34px;border-radius:17px;background:${WHITE}"></i>`) + `<div style="margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:16px">${lib}</div>`) +
        arrastado +
        abs(522, 432, 80, 80, `background:${WHITE};border-radius:50%;display:flex;align-items:center;justify-content:center;${sombra(0.3, 8, 16)}`, ic("hand", 44, INK_800, 1.8)),
    };
  },

  // Widget em acordeão embutido num site de terceiros: gráfico de qualidade do ar por cidade.
  "widget-de-qualidade-do-ar": (r) => {
    const host =
      abs(40, 30, 500, 40, "display:flex;align-items:center;gap:22px", `<i style="width:30px;height:30px;border-radius:50%;background:${NEUTRAL_300}"></i>` + ln(70) + ln(70) + ln(70)) +
      abs(40, 104, 500, null, "", col(14, ln(380, NEUTRAL_300, 22) + ln(300, NEUTRAL_300, 22) + `<div style="height:10px"></div>` + ln(460, NEUTRAL_100, 12) + ln(430, NEUTRAL_100, 12) + ln(450, NEUTRAL_100, 12))) +
      abs(40, 318, 280, 160, `background:${NEUTRAL_100};border-radius:14px;overflow:hidden`, svg(280, 160, `<path d="M0 160L80 70L140 120L190 80L280 150V160Z" fill="${NEUTRAL_300}"/><circle cx="220" cy="44" r="18" fill="${NEUTRAL_300}"/>`)) +
      abs(340, 324, 200, null, "", col(12, ln(190, NEUTRAL_100, 12) + ln(170, NEUTRAL_100, 12) + ln(180, NEUTRAL_100, 12) + ln(120, NEUTRAL_100, 12)));
    const vals = serie(r, 12, 0.25, 0.85);
    const linha = serie(r, 12, 0.35, 0.95);
    let chart = "";
    for (let i = 0; i < 4; i++) chart += `<path d="M34 ${18 + i * 40}H420" stroke="${NEUTRAL_300}" stroke-width="1.5" stroke-dasharray="4 5"/><text x="0" y="${22 + i * 40}" font-family="${FONT}" font-size="12" font-weight="700" fill="${INK_600}" fill-opacity=".6">${150 - i * 50}</text>`;
    vals.forEach((v, i) => {
      const x = 44 + i * 31.5;
      chart += `<rect x="${x}" y="${138 - v * 120}" width="20" height="${v * 120}" rx="3" fill="${alpha(INK_600, 0.18)}" stroke="${INK_600}" stroke-width="2"/>`;
    });
    const pts = pontos(linha, 54, 18, 346, 120);
    chart += `<path d="${smooth(pts)}" fill="none" stroke="${AMBER_500}" stroke-width="4"/>${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${WHITE}" stroke="${AMBER_500}" stroke-width="2.5"/>`).join("")}`;
    const linhaAcordeao = (num, chip, w) =>
      `<div style="height:56px;border-top:2px solid ${NEUTRAL_100};display:flex;align-items:center;gap:12px;padding:0 22px">${ic("pin", 22, INK_600)}${ln(w, NEUTRAL_300, 11)}<span style="margin-left:auto;padding:6px 12px;border-radius:12px;background:${chip};font:700 15px ${FONT};color:${INK_800}">${num}</span>${ic("chevD", 22, INK_800, 2.4)}</div>`;
    const widget =
      `<div style="height:64px;display:flex;align-items:center;gap:12px;padding:0 22px;background:${INK_600}">${badgeIcon("wind", 38, WHITE, INK_600)}${ln(130, alpha(WHITE, 0.85), 12)}<span style="margin-left:auto">${ic("code", 24, WHITE, 2.2)}</span></div>` +
      `<div style="padding:16px 22px 10px">${row(12, ic("pin", 22, AMBER_500, 2.4) + ln(110, INK_800, 12) + `<span style="margin-left:auto">${ic("chevU", 22, INK_800, 2.4)}</span>`)}${row(14, txt("58", 56, INK_800, 800) + col(6, txt("AQI", 15, AMBER_500, 800, "letter-spacing:3px") + row(10, row(5, dot(9, INK_600) + ln(30)) + row(5, dot(9, AMBER_500) + ln(30)))), "margin-top:12px")}<div style="margin-top:12px">${svg(420, 150, chart)}</div></div>` +
      linhaAcordeao("35", INK_50, 120) +
      linhaAcordeao("71", AMBER_500, 90) +
      linhaAcordeao("24", INK_50, 130);
    return {
      bg: INK_50,
      html: browser(40, 36, 1120, 603, host + abs(568, 20, 508, 528, `border:3px dashed ${AMBER_500};border-radius:24px`) + abs(578, 30, 488, 508, `background:${WHITE};border-radius:18px;overflow:hidden;${sombra(0.28, 20, 40)}`, widget)),
    };
  },

  // Placa de microcontrolador falando com o app Android por cabo e por Bluetooth Low Energy.
  "app-android-para-placa-educativa": (r) => {
    const heart = ["01010", "11111", "11111", "01110", "00100"];
    let leds = "";
    heart.forEach((linha, y) => [...linha].forEach((b, x) => {
      leds += `<rect x="${117 + x * 36}" y="${56 + y * 36}" width="22" height="22" rx="5" fill="${b === "1" ? AMBER_500 : INK_600}"${b === "1" ? ' filter="url(#brilho)"' : ""}/>`;
    }));
    let dentes = "";
    for (const x of [80, 88, 156, 164, 232, 240, 308, 316]) dentes += `<rect x="${x}" y="290" width="5" height="22" rx="1.5" fill="${AMBER_500}" opacity=".75"/>`;
    const pads = [22, 98, 174, 250, 326].map((x) => `<rect x="${x}" y="268" width="52" height="46" rx="8" fill="${AMBER_500}"/><circle cx="${x + 26}" cy="286" r="10" fill="${INK_800}"/>`).join("");
    const placa = svg(
      400,
      330,
      `<defs><filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="0" y="0" width="400" height="330" rx="28" fill="${INK_800}"/>${dentes}${pads}<rect x="400" y="120" width="26" height="54" rx="6" fill="${NEUTRAL_300}"/>${leds}<circle cx="58" cy="140" r="24" fill="${NEUTRAL_300}"/><circle cx="58" cy="140" r="13" fill="${INK_800}"/><circle cx="342" cy="140" r="24" fill="${NEUTRAL_300}"/><circle cx="342" cy="140" r="13" fill="${INK_800}"/>`,
    );
    const eixos = [serie(r, 10), serie(r, 10), serie(r, 10)];
    const grafico = svg(222, 110, eixos.map((v, i) => `<path d="${smooth(pontos(v, 0, 4, 222, 100))}" fill="none" stroke="${[INK_600, AMBER_500, NEUTRAL_300][i]}" stroke-width="3.5" stroke-linecap="round"/>`).join(""));
    const pacotes = ["0x1F", "0x2A", "0x07", "0x3C", "0x11"]
      .map((hx, i) => `<div style="display:flex;align-items:center;gap:10px;height:30px">${dot(9, i === 0 ? AMBER_500 : NEUTRAL_300)}${txt(hx, 14, INK_800)}${ln(50 + ((i * 17) % 30))}<span style="margin-left:auto">${txt(`${18 + i * 6} ms`, 13, INK_600)}</span></div>`)
      .join("");
    const tela =
      abs(18, 46, 242, 40, "display:flex;align-items:center;gap:10px", badgeIcon("bt", 36, WHITE, INK_600) + ln(80, INK_800, 12) + `<span style="margin-left:auto;display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:12px;background:${WHITE}">${dot(8, AMBER_500)}${txt("BLE", 12, INK_600)}</span>`) +
      abs(16, 100, 246, 170, `background:${WHITE};border-radius:18px;padding:16px 12px`, row(10, row(5, dot(8, INK_600) + txt("x", 13, INK_800)) + row(5, dot(8, AMBER_500) + txt("y", 13, INK_800)) + row(5, dot(8, NEUTRAL_300) + txt("z", 13, INK_800))) + `<div style="margin-top:12px">${grafico}</div>`) +
      abs(16, 284, 246, 186, `background:${WHITE};border-radius:18px;padding:10px 16px`, pacotes) +
      abs(16, 484, 246, 40, `background:${INK_600};border-radius:12px;display:flex;align-items:center;justify-content:center`, ic("sync", 22, WHITE, 2.4));
    const conexoes = svg(
      W,
      H,
      `<path d="M516 300C640 300 600 640 770 640L930 640" fill="none" stroke="${NEUTRAL_300}" stroke-width="9" stroke-linecap="round"/><rect x="912" y="618" width="36" height="22" rx="5" fill="${NEUTRAL_300}"/>` +
        `<g fill="none" stroke="${AMBER_500}" stroke-width="5" stroke-linecap="round"><path d="M668 92a40 40 0 0 1 0 56M690 72a68 68 0 0 1 0 96M572 92a40 40 0 0 0 0 56M550 72a68 68 0 0 0 0 96"/></g><circle cx="620" cy="120" r="30" fill="${AMBER_500}"/>${icg("bt", 604, 104, 32, INK_800, 2.4)}`,
    );
    return {
      bg: INK_600,
      html: abs(0, 0, W, H, "", conexoes) + abs(90, 150, 430, 330, "transform:rotate(-6deg)", placa) + phone(780, 64, 300, 560, tela, { screen: INK_50 }),
    };
  },

  // EPIs vestíveis com sensores, ligados ao app que confere o uso de cada peça.
  "sensores-em-epis-com-app": () => {
    const pecas =
      abs(110, 70, null, null, "", epi("capacete", 250)) +
      abs(400, 60, null, null, "", epi("colete", 230)) +
      abs(110, 330, null, null, "", epi("luva", 190)) +
      abs(380, 380, null, null, "", epi("bota", 240));
    const ligacoes = svg(
      W,
      H,
      `<g fill="none" stroke="${AMBER_500}" stroke-width="3" stroke-dasharray="7 9" stroke-linecap="round"><path d="M300 92C520 30 640 110 806 150"/><path d="M640 220C700 220 720 250 806 260"/><path d="M290 410C520 330 660 360 806 380"/><path d="M640 470C700 480 740 500 806 490"/></g>${sensor(258, 82)}${sensor(590, 210)}${sensor(248, 398)}${sensor(586, 458)}`,
    );
    const itens = [
      ["capacete", true],
      ["colete", true],
      ["luva", false],
      ["bota", true],
    ]
      .map(
        ([k, ok]) =>
          `<div style="height:62px;display:flex;align-items:center;gap:14px;padding:0 6px;border-bottom:2px solid ${NEUTRAL_100}"><div style="width:46px;height:46px;border-radius:12px;background:${INK_50};display:flex;align-items:center;justify-content:center">${epi(k, 32)}</div>${col(7, ln(96, INK_800, 11) + ln(60, NEUTRAL_300, 8))}<div style="margin-left:auto;width:32px;height:32px;border-radius:50%;background:${ok ? INK_600 : AMBER_500};display:flex;align-items:center;justify-content:center">${ic(ok ? "check" : "x", 18, ok ? WHITE : INK_800, 3)}</div></div>`,
      )
      .join("");
    const tela =
      abs(20, 48, 238, 30, "display:flex;align-items:center;justify-content:space-between", ln(110, INK_800, 14) + ic("bt", 22, INK_600, 2.2)) +
      abs(18, 92, 242, 140, `background:${INK_50};border-radius:20px;display:flex;align-items:center;gap:16px;padding:0 18px`, `<div style="position:relative">${anel(104, 0.75, INK_600, WHITE, 14)}${abs(0, 38, 104, null, "text-align:center", txt("3/4", 28, INK_800, 800))}</div>` + col(10, ln(80, INK_800, 12) + ln(60) + `<span style="display:inline-flex;align-items:center;gap:6px">${dot(10, AMBER_500)}${ln(40, AMBER_500, 8)}</span>`)) +
      abs(14, 248, 250, null, "", itens) +
      abs(18, 520, 242, 0, "", "");
    return {
      bg: NEUTRAL_100,
      html: abs(70, 40, 640, 600, `background:${WHITE};border-radius:40px;opacity:.7`) + pecas + abs(0, 0, W, H, "", ligacoes) + phone(806, 50, 300, 575, tela),
    };
  },

  // Controle de linha de produção: contador em tempo real no painel e a esteira passando pelo sensor.
  "controle-de-producao-com-contagem-automatica": (r) => {
    const vals = serie(r, 14, 0.35, 0.95);
    let bars = "";
    vals.forEach((v, i) => {
      bars += `<rect x="${i * 44}" y="${220 - v * 200}" width="30" height="${v * 200}" rx="6" fill="${i === vals.length - 1 ? AMBER_500 : INK_600}"/>`;
    });
    bars += `<path d="M0 ${220 - 0.62 * 200}H610" stroke="${NEUTRAL_300}" stroke-width="2.5" stroke-dasharray="8 6"/>`;
    ["08", "10", "12", "14"].forEach((t, i) => {
      bars += `<text x="${i * 176 + 2}" y="246" font-family="${FONT}" font-size="14" font-weight="700" fill="${INK_600}" fill-opacity=".6">${t}</text>`;
    });
    const linhas = [
      ["L1", "98%", INK_600],
      ["L2", "91%", INK_600],
      ["L3", "74%", AMBER_500],
    ]
      .map(([l, p, c]) => `<span style="display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:14px;background:${INK_50}">${dot(10, c)}${txt(l, 15, INK_800)}${txt(p, 15, INK_600, 700)}</span>`)
      .join("");
    const painel =
      abs(32, 30, null, null, "", row(12, badgeIcon("box", 40, INK_800, AMBER_500, 2.2) + ln(110, INK_800, 14))) +
      abs(32, 100, null, null, "", txt("12 480", 88, INK_800, 800, "letter-spacing:-3px")) +
      abs(36, 196, null, null, "", row(10, ic("arrowUp", 24, AMBER_500, 3) + txt("+38", 24, AMBER_500, 800) + ln(80))) +
      abs(32, 254, null, null, "", row(10, linhas)) +
      abs(430, 34, 620, 260, "", svg(620, 260, bars));
    let esteira = `<rect x="0" y="150" width="1200" height="28" rx="0" fill="${INK_800}"/>`;
    for (let x = 30; x < 1200; x += 80) esteira += `<circle cx="${x}" cy="194" r="15" fill="${INK_600}"/><circle cx="${x}" cy="194" r="4" fill="${INK_50}"/>`;
    for (let x = 100; x < 1200; x += 240) esteira += `<rect x="${x}" y="206" width="16" height="70" fill="${INK_600}"/>`;
    for (let x = 40; x < 1200; x += 60) esteira += `<path d="M${x} 158l8 6-8 6" fill="none" stroke="${INK_600}" stroke-width="3" stroke-linecap="round"/>`;
    const caixa = (x, on) =>
      `<g transform="translate(${x} 78)"><rect width="84" height="72" rx="6" fill="${WHITE}" stroke="${on ? AMBER_500 : INK_600}" stroke-width="${on ? 5 : 3}"/><rect x="34" y="0" width="16" height="72" fill="${on ? AMBER_500 : NEUTRAL_300}"/><path d="M-30 30h-30M-24 46h-44" stroke="${NEUTRAL_300}" stroke-width="4" stroke-linecap="round" opacity="${on ? 0 : 1}"/></g>`;
    esteira += [120, 300, 478, 720, 900, 1080].map((x) => caixa(x, x === 478)).join("");
    esteira += `<rect x="436" y="10" width="18" height="140" fill="${INK_600}"/><rect x="566" y="10" width="18" height="140" fill="${INK_600}"/><rect x="430" y="0" width="160" height="40" rx="8" fill="${INK_800}"/><rect x="474" y="-18" width="72" height="22" rx="5" fill="${NEUTRAL_100}" stroke="${INK_600}" stroke-width="2"/><circle cx="488" cy="-7" r="4" fill="${AMBER_500}"/><rect x="498" y="40" width="24" height="110" fill="${AMBER_500}" opacity=".18"/><rect x="506" y="40" width="8" height="110" fill="${AMBER_500}"/><text x="612" y="34" font-family="${FONT}" font-size="36" font-weight="800" fill="${AMBER_500}">+1</text>`;
    return {
      bg: INK_50,
      html: abs(60, 40, 1080, 316, `background:${WHITE};border-radius:24px;${sombra(0.12, 14, 30)}`, painel) + abs(0, 398, W, 277, "", svg(W, 277, esteira)),
    };
  },

  // Detecção de descarga eletrostática em placas: placa de circuito com alerta e o osciloscópio com o pico acima do limite.
  "deteccao-de-descarga-estatica": (r) => {
    let trilhas = "";
    const traco = (d) => `<path d="${d}" fill="none" stroke="${INK_50}" stroke-opacity=".35" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (let i = 0; i < 9; i++) {
      const y = 70 + i * 50;
      const x1 = 40 + r() * 80;
      const x2 = 220 + r() * 120;
      const y2 = y + (r() > 0.5 ? 30 : -30);
      trilhas += traco(`M${x1} ${y}H${x2}L${x2 + 30} ${y2}H${x2 + 160 + r() * 80}`);
      trilhas += `<circle cx="${x1}" cy="${y}" r="7" fill="${INK_800}" stroke="${INK_50}" stroke-opacity=".5" stroke-width="3"/>`;
    }
    const chip = (x, y, w, h) => {
      let pins = "";
      for (let i = 10; i < w - 6; i += 16) pins += `<rect x="${x + i}" y="${y - 8}" width="7" height="10" fill="${NEUTRAL_300}"/><rect x="${x + i}" y="${y + h - 2}" width="7" height="10" fill="${NEUTRAL_300}"/>`;
      for (let i = 10; i < h - 6; i += 16) pins += `<rect x="${x - 8}" y="${y + i}" width="10" height="7" fill="${NEUTRAL_300}"/><rect x="${x + w - 2}" y="${y + i}" width="10" height="7" fill="${NEUTRAL_300}"/>`;
      return `${pins}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${INK_800}"/><circle cx="${x + 16}" cy="${y + 16}" r="5" fill="${INK_600}"/>`;
    };
    const faisca = `<path d="M470 300l-26 34 30 4-34 46" fill="none" stroke="${AMBER_500}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" filter="url(#luz)"/><circle cx="436" cy="384" r="10" fill="${AMBER_500}" filter="url(#luz)"/>`;
    const placa = svg(
      650,
      540,
      `<defs><filter id="luz" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="650" height="540" rx="26" fill="${INK_600}"/>${[[30, 30], [620, 30], [30, 510], [620, 510]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${INK_800}" stroke="${NEUTRAL_300}" stroke-width="4"/>`).join("")}${trilhas}${chip(220, 150, 170, 170)}${chip(470, 380, 110, 80)}${chip(80, 380, 90, 60)}${faisca}<g transform="translate(470 60)"><path d="M70 0L140 122H0Z" fill="${AMBER_500}" stroke="${INK_800}" stroke-width="6" stroke-linejoin="round"/>${icg("bolt", 46, 40, 48, INK_800, 2.6, INK_800)}</g>`,
    );
    let onda = "";
    for (let i = 0; i <= 6; i++) onda += `<path d="M${i * 58} 0V240" stroke="${INK_600}" stroke-width="1.5"/>`;
    for (let i = 0; i <= 4; i++) onda += `<path d="M0 ${i * 60}H350" stroke="${INK_600}" stroke-width="1.5"/>`;
    const pts = [];
    for (let x = 0; x <= 350; x += 7) pts.push([x, 168 + (r() - 0.5) * 22]);
    const pico = pts.findIndex(([x]) => x >= 224);
    pts[pico - 1][1] = 120;
    pts[pico][1] = 36;
    pts[pico + 1][1] = 196;
    pts[pico + 2][1] = 150;
    onda += `<path d="M0 70H350" stroke="${AMBER_500}" stroke-width="2.5" stroke-dasharray="8 6"/><path d="M${pts.map((p) => p.join(" ")).join("L")}" fill="none" stroke="${INK_50}" stroke-width="3" stroke-linejoin="round"/><path d="M${pts.slice(pico - 2, pico + 3).map((p) => p.join(" ")).join("L")}" fill="none" stroke="${AMBER_500}" stroke-width="4" stroke-linejoin="round"/><circle cx="${pts[pico][0]}" cy="${pts[pico][1]}" r="7" fill="${AMBER_500}"/>`;
    const painel =
      row(12, badgeIcon("bolt", 42, AMBER_500, INK_800, 2.4) + ln(130, INK_800, 14)) +
      `<div style="margin-top:18px;border-radius:14px;background:${INK_800};overflow:hidden">${svg(350, 230, onda)}</div>` +
      row(6, txt("1.8", 56, INK_800, 800, "letter-spacing:-2px") + txt("kV", 26, INK_600, 800, "align-self:flex-end;margin-bottom:6px"), "margin-top:18px") +
      row(22, row(8, ic("alert", 22, AMBER_500, 2.4) + txt("3", 20, INK_800)) + row(8, ic("clock", 22, INK_600, 2.4) + txt("12 ms", 20, INK_800)), "margin-top:14px") +
      `<div style="margin-top:18px;height:58px;border-radius:14px;background:${AMBER_500};display:flex;align-items:center;gap:12px;padding:0 18px">${ic("alert", 26, INK_800, 2.4)}${ln(150, INK_800, 12)}${ln(60, alpha(INK_800, 0.35), 12)}</div>`;
    return {
      bg: INK_800,
      html: abs(60, 80, 650, 540, "", placa) + abs(750, 96, 390, 524, `background:${NEUTRAL_100};border-radius:24px;padding:22px 20px`, painel),
    };
  },

  // Bancada de testes automatizados: progresso geral, estações de teste e o log da execução.
  "painel-de-testes-automatizados": (r) => {
    const side =
      abs(24, 24, 36, 36, `background:${AMBER_500};border-radius:10px`) +
      ["grid", "chart", "server", "sliders"].map((n, i) => abs(14, 110 + i * 64, 56, 48, `border-radius:12px;display:flex;align-items:center;justify-content:center;${i === 0 ? `background:${INK_600}` : ""}`, ic(n, 24, i === 0 ? WHITE : alpha(INK_50, 0.6), 2.2))).join("");
    const resumo =
      `<div style="display:flex;justify-content:center;position:relative">${anel(190, 0.96, INK_600, INK_50, 20)}${abs(0, 66, 236, null, "text-align:center", txt("96%", 50, INK_800, 800, "letter-spacing:-2px"))}</div>` +
      col(12, [["check", INK_600, "248"], ["x", AMBER_500, "6"], ["clock", NEUTRAL_300, "12"]].map(([n, c, v]) => row(12, badgeIcon(n, 30, c, n === "x" ? INK_800 : WHITE, 3, 0.6) + ln(80) + `<span style="margin-left:auto">${txt(v, 20, INK_800)}</span>`)).join(""), "margin-top:22px");
    const status = ["ok", "ok", "run", "ok", "fail", "ok", "ok", "run", "ok", "ok", "fail", "ok"];
    const estacoes = status
      .map((s, i) => {
        const prog = s === "run" ? 0.35 + r() * 0.4 : 1;
        const icone =
          s === "ok"
            ? badgeIcon("check", 30, INK_600, WHITE, 3, 0.6)
            : s === "fail"
              ? badgeIcon("x", 30, AMBER_500, INK_800, 3, 0.6)
              : svg(30, 30, `<circle cx="15" cy="15" r="12" fill="none" stroke="${INK_50}" stroke-width="4"/><path d="${arco(15, 15, 12, 0, 250)}" fill="none" stroke="${INK_600}" stroke-width="4" stroke-linecap="round"/>`);
        return `<div style="position:relative;border-radius:16px;background:${WHITE};padding:16px">${row(10, txt(`#${String(i + 1).padStart(2, "0")}`, 14, INK_600) + `<span style="margin-left:auto">${icone}</span>`)}<div style="margin-top:12px;width:64px;height:20px;border-radius:5px;background:${INK_800};display:flex;align-items:center;gap:5px;padding:0 7px">${dot(5, s === "fail" ? AMBER_500 : INK_50)}<i style="width:28px;height:3px;background:${INK_600}"></i></div><div style="margin-top:14px;height:6px;border-radius:3px;background:${NEUTRAL_100}"><div style="width:${prog * 100}%;height:6px;border-radius:3px;background:${s === "fail" ? AMBER_500 : INK_600}"></div></div></div>`;
      })
      .join("");
    const log = [
      ["check", INK_50, "#07", 420, "1.8s"],
      ["check", INK_50, "#08", 360, "2.1s"],
      ["x", AMBER_500, "#05", 300, "0.9s"],
      ["check", INK_50, "#09", 470, "1.6s"],
      ["check", INK_50, "#10", 390, "2.4s"],
    ]
      .map(([n, c, id, w, t]) => row(14, ic(n, 18, c, 3) + txt(id, 15, INK_50, 700) + ln(w, INK_600, 9) + ln(120 - (w % 70), alpha(INK_600, 0.5), 9) + `<span style="margin-left:auto">${txt(t, 14, INK_50, 700, "opacity:.6")}</span>`, "height:24px;padding-right:150px"))
      .join("");
    return {
      bg: NEUTRAL_100,
      html:
        abs(0, 0, 84, H, `background:${INK_800}`, side) +
        abs(116, 40, 300, 360, `background:${WHITE};border-radius:22px;padding:26px 32px`, resumo) +
        abs(440, 40, 720, 360, "display:grid;grid-template-columns:repeat(4,1fr);gap:16px", estacoes) +
        abs(116, 424, 1044, 216, `background:${INK_800};border-radius:22px;padding:20px 28px`, col(4, log + row(14, txt("›", 22, AMBER_500, 800) + `<i style="width:12px;height:20px;background:${AMBER_500}"></i>`, "height:24px"))),
    };
  },

  // Gestão da qualidade: árvore de pastas, documentos com versão e a pilha de auditoria com carimbo.
  "gestao-de-documentos-da-qualidade": () => {
    const arvore = [
      [0, false, 130],
      [1, true, 110],
      [2, false, 90],
      [2, false, 100],
      [1, false, 120],
      [0, false, 110],
      [1, false, 90],
      [1, false, 105],
      [0, false, 125],
    ]
      .map(([n, on, w]) => `<div style="height:44px;display:flex;align-items:center;gap:10px;padding-left:${12 + n * 22}px;border-radius:10px;${on ? `background:${INK_50}` : ""}">${ic("folder", 22, on ? AMBER_500 : INK_600, 2.2, on ? AMBER_500 : "none")}${ln(w - n * 14, on ? INK_800 : NEUTRAL_300, 10)}</div>`)
      .join("");
    const docs = [
      [170, "v3", INK_600],
      [140, "v1", AMBER_500],
      [190, "v5", INK_600],
      [120, "v2", INK_600],
      [160, "v4", AMBER_500],
      [150, "v1", INK_600],
      [175, "v2", INK_600],
    ]
      .map(
        ([w, v, c], i) =>
          `<div style="height:58px;display:flex;align-items:center;gap:14px;padding:0 16px;border-radius:12px;${i === 2 ? `background:${INK_50};box-shadow:inset 5px 0 0 ${AMBER_500}` : ""}">${ic("doc", 26, INK_600, 2)}${col(7, ln(w, INK_800, 11, "opacity:.85") + ln(80, NEUTRAL_300, 8))}<span style="margin-left:auto;padding:5px 10px;border-radius:10px;background:${i === 2 ? WHITE : INK_50};font:700 14px ${FONT};color:${INK_600}">${v}</span>${dot(12, c)}</div>`,
      )
      .join("");
    const folha = (rot, x, y, inner = "") =>
      abs(x, y, 240, 320, `background:${WHITE};border-radius:14px;transform:rotate(${rot}deg);padding:30px 26px;${sombra(0.16, 14, 28)}`, col(12, ln(130, INK_800, 14) + ln(180) + ln(160) + ln(170) + ln(120) + ln(150)) + inner);
    const carimbo = abs(70, 150, 140, 140, `border:7px solid ${AMBER_500};border-radius:50%;transform:rotate(-14deg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:${alpha(WHITE, 0.85)}`, ic("check", 50, AMBER_500, 4) + txt("QA", 26, AMBER_500, 800, "letter-spacing:3px"));
    return {
      bg: INK_50,
      html:
        abs(60, 56, 290, 563, `background:${WHITE};border-radius:22px;padding:24px 16px`, row(10, badgeIcon("shieldCheck", 40, INK_800, AMBER_500, 2.2) + ln(100, INK_800, 16), "padding:0 8px 18px") + arvore + `<div style="margin:18px 8px 0;padding-top:16px;border-top:2px solid ${NEUTRAL_100}">${row(10, ic("server", 20, INK_600, 2.2) + ln(80, NEUTRAL_300, 9) + `<span style="margin-left:auto">${txt("72%", 15, INK_800)}</span>`)}<div style="margin-top:10px;height:8px;border-radius:4px;background:${NEUTRAL_100}"><div style="width:72%;height:8px;border-radius:4px;background:${INK_600}"></div></div></div>`) +
        abs(370, 56, 480, 563, `background:${WHITE};border-radius:22px;padding:22px 16px`, row(12, `<div style="flex:1;height:42px;border-radius:21px;background:${NEUTRAL_100};display:flex;align-items:center;gap:10px;padding:0 16px">${ic("search", 20, INK_600)}${ln(120)}</div>` + badgeIcon("sliders", 42, INK_50, INK_600), "margin-bottom:16px") + docs) +
        folha(-11, 880, 120) +
        folha(-3, 896, 108) +
        folha(5, 904, 104, carimbo + abs(170, -22, 40, 60, "", ic("clip", 46, INK_600, 2.4))),
    };
  },

  // Painel administrativo de produção em modo escuro: indicadores, barras empilhadas por semana e rosca de eficiência.
  "painel-de-controle-de-producao": (r) => {
    const kpis = [
      ["box", "3 412", "arrowUp", "+4%"],
      ["check", "97.2%", "arrowUp", "+1%"],
      ["alert", "18", "arrowDown", "−3"],
      ["clock", "4.1h", "arrowDown", "−6%"],
    ]
      .map(([n, v, a, d]) => `<div style="border-radius:18px;background:${INK_600};padding:20px 22px">${row(10, ic(n, 22, alpha(INK_50, 0.75), 2.2) + ln(80, alpha(INK_50, 0.3), 9))}${row(12, txt(v, 40, WHITE, 800, "letter-spacing:-1px") + `<span style="display:inline-flex;align-items:center;gap:3px;padding:4px 8px;border-radius:10px;background:${alpha(AMBER_500, 0.18)}">${ic(a, 14, AMBER_500, 3)}${txt(d, 13, AMBER_500)}</span>`, "margin-top:16px")}</div>`)
      .join("");
    let barras = "";
    for (let i = 0; i < 5; i++) barras += `<path d="M30 ${30 + i * 60}H650" stroke="${INK_800}" stroke-width="2"/>`;
    for (let i = 0; i < 12; i++) {
      const a = 0.35 + r() * 0.5;
      const b = 0.06 + r() * 0.12;
      const x = 44 + i * 51;
      barras += `<rect x="${x}" y="${270 - a * 240}" width="30" height="${a * 240}" rx="5" fill="${INK_50}"/><rect x="${x}" y="${270 - (a + b) * 240 - 4}" width="30" height="${b * 240}" rx="5" fill="${AMBER_500}"/><text x="${x + 15}" y="298" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700" fill="${INK_50}" fill-opacity=".5">${i + 1}</text>`;
    }
    const seg = [
      [0, 220, AMBER_500],
      [226, 314, INK_50],
      [320, 354, NEUTRAL_300],
    ];
    const rosca = svg(240, 240, seg.map(([a, b, c]) => `<path d="${arco(120, 120, 96, a, b)}" fill="none" stroke="${c}" stroke-width="34"/>`).join(""));
    return {
      bg: INK_800,
      html:
        abs(40, 28, 600, 44, "display:flex;align-items:center;gap:14px", `<div style="width:44px;height:44px;border-radius:12px;background:${INK_600};display:flex;align-items:center;justify-content:center">${ic("chart", 24, AMBER_500, 2.4)}</div>` + ln(150, alpha(INK_50, 0.9), 14) + ln(90, INK_600, 10)) +
        abs(40, 96, 1120, 120, "display:grid;grid-template-columns:repeat(4,1fr);gap:16px", kpis) +
        abs(40, 236, 700, 400, `background:${INK_600};border-radius:20px;padding:22px 24px`, row(10, ln(140, alpha(INK_50, 0.8), 12) + `<span style="margin-left:auto">${row(14, row(6, dot(10, INK_50) + ln(40, alpha(INK_50, 0.4), 8)) + row(6, dot(10, AMBER_500) + ln(40, alpha(INK_50, 0.4), 8)))}</span>`) + `<div style="margin-top:16px">${svg(652, 310, barras)}</div>`) +
        abs(760, 236, 400, 400, `background:${INK_600};border-radius:20px;padding:22px 24px`, ln(120, alpha(INK_50, 0.8), 12) + `<div style="position:relative;display:flex;justify-content:center;margin-top:14px">${rosca}${abs(0, 92, 352, null, "text-align:center", txt("87%", 48, WHITE, 800, "letter-spacing:-1px"))}</div>` + row(18, [AMBER_500, INK_50, NEUTRAL_300].map((c, i) => row(6, dot(10, c) + txt(["62", "25", "13"][i], 15, alpha(INK_50, 0.8)))).join(""), "justify-content:center;margin-top:16px")),
    };
  },

  // Auditoria de processos: fluxograma com lupa sobre a etapa auditada, anexos e checklist.
  "arquivos-de-auditoria-de-processos": () => {
    const seta = (d) => `<path d="${d}" fill="none" stroke="${INK_600}" stroke-width="3.5" marker-end="url(#ponta)"/>`;
    const num = (x, y, n, c = INK_800) => `<circle cx="${x}" cy="${y}" r="13" fill="${c}"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${c === AMBER_500 ? INK_800 : WHITE}">${n}</text>`;
    const fluxo = svg(
      780,
      400,
      `<defs><marker id="ponta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${INK_600}"/></marker></defs>` +
        `<rect x="20" y="172" width="120" height="56" rx="28" fill="${INK_800}"/>${icg("play", 66, 188, 24, WHITE, 2, WHITE)}` +
        seta("M140 200H196") +
        `<rect x="200" y="165" width="150" height="70" rx="14" fill="${INK_50}" stroke="${INK_600}" stroke-width="3"/>${icg("doc", 216, 186, 28, INK_600)}<rect x="254" y="190" width="76" height="9" rx="4.5" fill="${INK_600}"/><rect x="254" y="208" width="50" height="8" rx="4" fill="${NEUTRAL_300}"/>${num(200, 165, 1)}` +
        seta("M350 200H404") +
        `<path d="M470 140L534 200L470 260L406 200Z" fill="${WHITE}" stroke="${AMBER_500}" stroke-width="3.5"/>${icg("search", 458, 188, 24, AMBER_500, 2.6)}${num(470, 140, 2, AMBER_500)}` +
        seta("M534 200C560 200 560 100 596 100") +
        seta("M534 200C560 200 560 300 596 300") +
        `<rect x="600" y="65" width="150" height="70" rx="14" fill="${INK_50}" stroke="${INK_600}" stroke-width="3"/><rect x="618" y="90" width="80" height="9" rx="4.5" fill="${INK_600}"/><rect x="618" y="108" width="54" height="8" rx="4" fill="${NEUTRAL_300}"/>${num(600, 65, 3)}` +
        `<rect x="600" y="265" width="150" height="70" rx="14" fill="${INK_50}" stroke="${INK_600}" stroke-width="3"/>${icg("clip", 616, 286, 28, INK_600)}<rect x="654" y="290" width="76" height="9" rx="4.5" fill="${INK_600}"/><rect x="654" y="308" width="44" height="8" rx="4" fill="${NEUTRAL_300}"/>${num(600, 265, 4)}`,
    );
    const lente = abs(
      470,
      26,
      220,
      220,
      `border-radius:50%;border:14px solid ${INK_800};background:${WHITE};overflow:hidden;${sombra(0.3, 16, 30)}`,
      abs(18, 54, 156, 84, `border-radius:16px;background:${INK_50};border:4px solid ${AMBER_500};padding:14px 16px`, row(10, ic("doc", 30, INK_600) + col(8, ln(70, INK_600, 10) + ln(44, NEUTRAL_300, 8))) + abs(108, -16, 44, 32, `background:${AMBER_500};border-radius:16px;display:flex;align-items:center;justify-content:center;gap:2px`, ic("clip", 16, INK_800, 2.6) + txt("3", 15, INK_800))),
    );
    const cabo = abs(640, 222, 34, 110, `background:${INK_800};border-radius:12px;transform:rotate(-40deg);transform-origin:top center`);
    const anexos = [AMBER_500, INK_600, INK_600, AMBER_500]
      .map((c, i) => `<div style="flex:1;height:64px;border-radius:14px;background:${WHITE};display:flex;align-items:center;gap:10px;padding:0 14px">${ic("doc", 26, c)}${ln(60 + (i % 2) * 14, NEUTRAL_300, 9)}<span style="margin-left:auto">${ic("clip", 18, INK_600, 2.2)}</span></div>`)
      .join("");
    const check = [true, true, true, true, false, false]
      .map((ok, i) => row(14, `<div style="width:30px;height:30px;border-radius:8px;${ok ? `background:${AMBER_500}` : `border:3px solid ${INK_600}`};display:flex;align-items:center;justify-content:center">${ok ? ic("check", 20, INK_800, 3.2) : ""}</div>` + ln([150, 120, 170, 130, 160, 110][i], ok ? INK_600 : alpha(INK_50, 0.7), 11), "height:52px"))
      .join("");
    return {
      bg: `${WHITE};background-image:linear-gradient(${INK_50} 2px, transparent 2px),linear-gradient(90deg, ${INK_50} 2px, transparent 2px);background-size:36px 36px`,
      html:
        abs(30, 90, 780, 400, "", fluxo) +
        cabo +
        lente +
        abs(40, 494, 780, 140, `background:${INK_50};border-radius:22px;padding:22px 24px`, row(12, ic("clip", 22, INK_600, 2.4) + ln(110, INK_800, 12) + `<span style="margin-left:auto">${row(10, `<i style="display:block;width:120px;height:8px;border-radius:4px;background:linear-gradient(90deg, ${AMBER_500} 0 66%, ${NEUTRAL_300} 66%)"></i>` + txt("4/6", 18, INK_800))}</span>`) + row(14, anexos, "margin-top:16px")) +
        abs(850, 40, 310, 594, `background:${INK_800};border-radius:24px;padding:28px 28px`, row(10, ln(120, alpha(WHITE, 0.9), 13) + `<span style="margin-left:auto">${txt("4/6", 24, AMBER_500, 800)}</span>`, "margin-bottom:22px") + check + `<div style="margin-top:28px;height:52px;border-radius:14px;background:${AMBER_500};display:flex;align-items:center;justify-content:center">${ic("check", 26, INK_800, 3)}</div>`),
    };
  },

  // Marketplace de gás de cozinha: botijão e o app do consumidor com rota de entrega e pedido.
  "app-de-compra-de-gas": () => {
    let mapa = `<rect width="288" height="240" fill="${INK_50}"/>`;
    mapa += `<g stroke="${WHITE}" stroke-width="14" fill="none"><path d="M-10 60H300M-10 170H300M70 -10V250M200 -10V250"/></g><g stroke="${WHITE}" stroke-width="7" fill="none"><path d="M-10 115H300M135 -10V250"/></g>`;
    mapa += `<path d="M70 196V115H200V60" fill="none" stroke="${AMBER_500}" stroke-width="6" stroke-dasharray="2 10" stroke-linecap="round"/>`;
    mapa += `<circle cx="70" cy="196" r="20" fill="${INK_600}"/>${icg("home", 58, 184, 24, WHITE, 2.4)}<circle cx="200" cy="60" r="24" fill="${INK_800}"/>${icg("truck", 186, 46, 28, AMBER_500, 2.2)}`;
    const btn = (n, on) => `<div style="width:34px;height:34px;border-radius:50%;${on ? `background:${INK_800}` : `border:2px solid ${NEUTRAL_300}`};display:flex;align-items:center;justify-content:center">${ic(n, 18, on ? WHITE : INK_800, 2.8)}</div>`;
    const tela =
      abs(0, 0, 288, 240, "", svg(288, 240, mapa)) +
      abs(16, 212, null, 46, `background:${WHITE};border-radius:23px;padding:0 16px;display:flex;align-items:center;gap:8px;${sombra(0.2, 6, 14)}`, ic("clock", 20, AMBER_500, 2.6) + txt("25 min", 16, INK_800)) +
      abs(16, 274, 256, 120, `background:${NEUTRAL_100};border-radius:18px;padding:14px;display:flex;align-items:center;gap:12px`, `<div style="width:62px;height:92px;border-radius:12px;background:${WHITE};display:flex;align-items:center;justify-content:center">${botijao(44, { label: false })}</div>` + col(8, ln(80, INK_800, 11) + txt("13 kg", 15, INK_600) + row(2, Array.from({ length: 5 }, (_, i) => ic("star", 13, AMBER_500, 2, i < 4 ? AMBER_500 : "none")).join(""))) + col(8, btn("plus", true) + txt("1", 16, INK_800, 800, "text-align:center") + btn("minus", false), "margin-left:auto;align-items:center")) +
      abs(16, 410, 256, 50, `border-bottom:2px solid ${NEUTRAL_100};display:flex;align-items:center;gap:10px`, ic("pin", 22, INK_600, 2.2) + ln(150) + `<span style="margin-left:auto">${ic("chevR", 20, INK_800, 2.4)}</span>`) +
      abs(16, 476, 256, 58, `background:${INK_800};border-radius:18px;display:flex;align-items:center;justify-content:center;gap:14px`, ic("cart", 26, AMBER_500, 2.4) + ln(90, alpha(WHITE, 0.9), 12));
    return {
      bg: AMBER_500,
      html:
        abs(70, 110, 480, 480, `border-radius:50%;background:${alpha(WHITE, 0.35)}`) +
        abs(130, 96, 640, 640, `border-radius:50%;border:3px dashed ${alpha(INK_800, 0.25)}`) +
        abs(170, 112, null, null, "", botijao(290)) +
        phone(650, 56, 310, 578, tela, { rot: 4 }),
    };
  },

  // App do revendedor: fila de pedidos, rota de entregas e o resumo de vendas da semana.
  "app-do-revendedor-de-gas": (r) => {
    const vendas = serie(r, 7, 0.3, 1);
    const pedidos = [
      ["#1042", "×2", "go", "12'"],
      ["#1041", "×1", "clock", "18'"],
      ["#1039", "×3", "ok", "26'"],
      ["#1038", "×1", "ok", "31'"],
      ["#1036", "×2", "ok", "40'"],
    ]
      .map(([id, q, s, t]) => {
        const st = s === "go" ? badgeIcon("play", 32, AMBER_500, INK_800, 2.4) : s === "clock" ? badgeIcon("clock", 32, INK_50, INK_600, 2.4) : badgeIcon("check", 32, INK_600, WHITE, 3);
        return `<div style="height:72px;border-radius:16px;background:${WHITE};display:flex;align-items:center;gap:12px;padding:0 14px">${col(7, txt(id, 16, INK_800) + ln(70, NEUTRAL_300, 8))}${txt(q, 18, INK_600, 800, "margin-left:auto")}${col(4, st + txt(t, 11, INK_600, 700, "text-align:center"), "align-items:center")}</div>`;
      })
      .join("");
    const telaA =
      abs(18, 46, 240, 30, "display:flex;align-items:center;justify-content:space-between", ln(90, INK_800, 14) + `<span style="position:relative">${ic("bell", 24, INK_800, 2.2)}${abs(14, -2, 10, 10, `border-radius:50%;background:${AMBER_500}`)}</span>`) +
      abs(14, 90, 240, 36, "display:flex;gap:8px", `<i style="width:80px;height:34px;border-radius:17px;background:${INK_800}"></i><i style="width:70px;height:34px;border-radius:17px;background:${WHITE}"></i><i style="width:70px;height:34px;border-radius:17px;background:${WHITE}"></i>`) +
      abs(12, 140, 244, null, "", col(10, pedidos));
    let mapa = `<rect width="258" height="520" fill="${INK_50}"/><g stroke="${WHITE}" stroke-width="12" fill="none"><path d="M-10 90L270 140M-10 260L270 230M60 -10L90 530M190 -10L170 530"/></g>`;
    const paradas = [
      [70, 110],
      [180, 190],
      [90, 290],
      [190, 350],
    ];
    mapa += `<path d="M${paradas.map((p) => p.join(" ")).join("L")}" fill="none" stroke="${INK_600}" stroke-width="6" stroke-linejoin="round"/>`;
    paradas.forEach(([x, y], i) => {
      const cor = i === 1 ? AMBER_500 : INK_800;
      mapa += `<circle cx="${x}" cy="${y}" r="17" fill="${cor}" stroke="${WHITE}" stroke-width="4"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${i === 1 ? INK_800 : WHITE}">${i + 1}</text>`;
    });
    const telaB =
      abs(0, 0, 258, 520, "", svg(258, 520, mapa)) +
      abs(0, 392, 258, 128, `background:${WHITE};border-radius:24px 24px 0 0;padding:14px 18px`, `<i style="display:block;margin:0 auto 14px;width:44px;height:5px;border-radius:3px;background:${NEUTRAL_300}"></i>` + row(10, badgeIcon("pin", 38, AMBER_500, INK_800) + col(7, ln(90, INK_800, 11) + ln(60, NEUTRAL_300, 8)) + txt("2.4 km", 16, INK_800, 800, "margin-left:auto")));
    let barras = "";
    vendas.forEach((v, i) => {
      barras += `<rect x="${i * 42}" y="${80 - v * 80}" width="28" height="${v * 80}" rx="6" fill="${i === 6 ? AMBER_500 : INK_50}"/>`;
    });
    return {
      bg: INK_600,
      html:
        abs(56, 112, 360, 250, `background:${WHITE};border-radius:24px;padding:22px 24px;${sombra(0.25, 18, 36)}`, row(10, badgeIcon("chart", 36, INK_50, INK_600) + ln(110, INK_800, 12)) + row(10, txt("86", 56, INK_800, 800, "letter-spacing:-2px") + row(4, ic("arrowUp", 18, AMBER_500, 3) + txt("+12", 17, AMBER_500, 800)), "margin-top:14px") + `<div style="margin-top:14px">${svg(300, 80, barras)}</div>`) +
        abs(96, 392, 330, 160, `background:${INK_800};border-radius:24px;padding:22px 24px;${sombra(0.25, 18, 36)}`, row(12, badgeIcon("truck", 42, AMBER_500, INK_800, 2.2) + ln(110, alpha(WHITE, 0.85), 12) + txt("14 min", 16, WHITE, 700, "margin-left:auto")) + `<div style="margin-top:30px;display:flex;align-items:center">${dot(18, AMBER_500)}<i style="flex:1;height:4px;background:${AMBER_500}"></i>${dot(18, AMBER_500)}<i style="flex:1;height:4px;background:${INK_600}"></i>${dot(18, INK_800, `border:4px solid ${WHITE}`)}</div><div style="margin-top:12px;display:flex;justify-content:space-between">${ln(40, alpha(WHITE, 0.35), 8)}${ln(40, alpha(WHITE, 0.35), 8)}${ln(40, alpha(WHITE, 0.35), 8)}</div>`) +
        phone(800, 96, 280, 542, telaB, { rot: 6, screen: INK_50 }) +
        phone(470, 50, 290, 580, telaA, { screen: NEUTRAL_100 }),
    };
  },

  // Jogo mobile das emoções: personagem na paisagem escolhendo um cartão (sol, nuvem, chuva, tempestade).
  "jogo-educativo-sobre-emocoes": () => {
    const cena = svg(
      868,
      418,
      `<defs><linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK_50}"/><stop offset="1" stop-color="${WHITE}"/></linearGradient></defs><rect width="868" height="418" fill="url(#ceu)"/>` +
        `<ellipse cx="200" cy="470" rx="420" ry="190" fill="${INK_600}" opacity=".3"/><ellipse cx="720" cy="480" rx="380" ry="200" fill="${INK_600}" opacity=".45"/><ellipse cx="380" cy="520" rx="520" ry="190" fill="${INK_600}"/>` +
        `<g transform="translate(120 238)"><path d="M46 0V-26" stroke="${INK_800}" stroke-width="5" stroke-linecap="round"/><circle cx="46" cy="-30" r="9" fill="${AMBER_500}" stroke="${INK_800}" stroke-width="4"/><rect x="12" y="78" width="16" height="22" rx="8" fill="${INK_800}"/><rect x="64" y="78" width="16" height="22" rx="8" fill="${INK_800}"/><circle cx="46" cy="46" r="46" fill="${AMBER_500}"/>${icg("heart", 32, 34, 28, WHITE, 2, WHITE)}</g>` +
        `<path d="M200 270C260 210 300 200 330 196" fill="none" stroke="${INK_800}" stroke-width="3" stroke-dasharray="4 8" stroke-linecap="round"/>`,
    );
    const cartas = [
      ["sun", AMBER_500, true],
      ["cloud", INK_600, false],
      ["rain", INK_600, false],
      ["storm", INK_800, false],
    ]
      .map(
        ([n, c, on]) =>
          `<div style="position:relative;width:118px;height:140px;border-radius:24px;background:${WHITE};display:flex;align-items:center;justify-content:center;${on ? `transform:translateY(-14px) rotate(-4deg);outline:6px solid ${AMBER_500};${sombra(0.3, 16, 26)}` : sombra(0.12, 8, 16)}">${ic(n, 72, c, 2, n === "sun" ? alpha(AMBER_500, 0.25) : "none")}${on ? abs(92, -16, 40, 40, `background:${INK_800};border-radius:50%;display:flex;align-items:center;justify-content:center`, ic("check", 22, AMBER_500, 3.2)) : ""}</div>`,
      )
      .join("");
    const tela =
      abs(0, 0, 868, 418, "", cena) +
      abs(56, 28, null, null, "", row(16, badgeIcon("menu", 48, WHITE, INK_800, 2.6) + `<span style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:18px;background:${WHITE}">${ic("star", 22, AMBER_500, 2, AMBER_500)}${txt("3", 20, INK_800)}</span>`)) +
      abs(620, 34, 220, null, "", col(10, row(6, ic("heart", 26, AMBER_500, 2, AMBER_500) + ic("heart", 26, AMBER_500, 2, AMBER_500) + ic("heart", 26, AMBER_500, 2.2), "justify-content:flex-end") + `<div style="height:12px;border-radius:6px;background:${WHITE}"><div style="width:62%;height:12px;border-radius:6px;background:${INK_600}"></div></div>`)) +
      abs(318, 120, 540, 160, "display:flex;gap:16px", cartas) +
      abs(766, 320, 70, 70, `background:${INK_800};border-radius:50%;display:flex;align-items:center;justify-content:center`, ic("play", 30, WHITE, 2, WHITE));
    return {
      bg: INK_50,
      html:
        abs(-110, -150, 400, 400, `border-radius:50%;background:${AMBER_500}`) +
        abs(900, 420, 380, 380, `border-radius:50%;background:${WHITE}`) +
        abs(1000, 40, 120, 120, `border-radius:50%;background:${alpha(INK_600, 0.12)}`) +
        phoneLand(150, 112, 900, 448, tela),
    };
  },

  // Painel web para pais e psicólogos: radar das emoções, frequência por dia e a linha do tempo das sessões.
  "painel-para-pais-e-psicologos": (r) => {
    const nav = ["grid", "chart", "calendar", "doc", "gear"]
      .map((n, i) => `<div style="height:48px;border-radius:12px;display:flex;align-items:center;gap:12px;padding:0 14px;${i === 0 ? `background:${INK_800}` : ""}">${ic(n, 22, i === 0 ? AMBER_500 : alpha(INK_50, 0.7), 2.2)}${ln(90 - i * 6, i === 0 ? alpha(WHITE, 0.85) : alpha(INK_50, 0.35), 10)}</div>`)
      .join("");
    const stats = [
      ["sun", AMBER_500, "42%"],
      ["cloud", INK_600, "23%"],
      ["rain", INK_600, "21%"],
      ["storm", INK_800, "14%"],
    ]
      .map(([n, c, v]) => `<div style="border-radius:18px;background:${NEUTRAL_100};padding:18px 20px;display:flex;align-items:center;gap:14px"><div style="width:52px;height:52px;border-radius:14px;background:${WHITE};display:flex;align-items:center;justify-content:center">${ic(n, 32, c, 2.2)}</div>${col(8, txt(v, 28, INK_800, 800) + ln(70))}</div>`)
      .join("");
    const eixos = ["sun", "cloud", "rain", "storm", "heart", "star"];
    const cx = 200;
    const cy = 200;
    const R = 130;
    const ponto = (i, k) => {
      const a = (i * 60 * Math.PI) / 180;
      return [cx + R * k * Math.sin(a), cy - R * k * Math.cos(a)];
    };
    let radar = "";
    for (const k of [0.33, 0.66, 1]) radar += `<path d="M${eixos.map((_, i) => ponto(i, k).map((n) => n.toFixed(1)).join(" ")).join("L")}Z" fill="none" stroke="${NEUTRAL_300}" stroke-width="2"/>`;
    eixos.forEach((_, i) => {
      const [x, y] = ponto(i, 1);
      radar += `<path d="M${cx} ${cy}L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${NEUTRAL_300}" stroke-width="2"/>`;
    });
    const atual = [0.92, 0.55, 0.48, 0.3, 0.8, 0.66];
    const antes = [0.6, 0.7, 0.62, 0.5, 0.55, 0.45];
    radar += `<path d="M${atual.map((k, i) => ponto(i, k).map((n) => n.toFixed(1)).join(" ")).join("L")}Z" fill="${WHITE}" stroke="${AMBER_500}" stroke-width="4" stroke-linejoin="round"/>`;
    radar += `<path d="M${antes.map((k, i) => ponto(i, k).map((n) => n.toFixed(1)).join(" ")).join("L")}Z" fill="none" stroke="${INK_600}" stroke-width="3" stroke-dasharray="7 6"/>`;
    atual.forEach((k, i) => {
      const [x, y] = ponto(i, k);
      radar += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${WHITE}" stroke="${AMBER_500}" stroke-width="3"/>`;
    });
    eixos.forEach((n, i) => {
      const [x, y] = ponto(i, 1.2);
      radar += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" fill="${WHITE}"/>${icg(n, x - 12, y - 12, 24, INK_600, 2.2)}`;
    });
    let barras = "";
    for (let d = 0; d < 7; d++) {
      let y = 160;
      [AMBER_500, INK_600, NEUTRAL_300].forEach((c) => {
        const h = 16 + r() * 36;
        barras += `<rect x="${12 + d * 52}" y="${y - h}" width="32" height="${h - 3}" rx="5" fill="${c}"/>`;
        y -= h;
      });
      barras += `<text x="${28 + d * 52}" y="184" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700" fill="${INK_600}" fill-opacity=".6">${d + 1}</text>`;
    }
    let linhaTempo = `<path d="M20 40H360" stroke="${INK_600}" stroke-width="4" stroke-linecap="round"/>`;
    ["sun", "cloud", "sun", "rain", "sun"].forEach((n, i) => {
      const x = 30 + i * 80;
      const on = i === 4;
      linhaTempo += `<circle cx="${x}" cy="40" r="20" fill="${on ? AMBER_500 : WHITE}"/>${icg(n, x - 11, 29, 22, INK_800, 2.2)}`;
    });
    return {
      bg: WHITE,
      html:
        abs(0, 0, 240, H, `background:${INK_600};padding:36px 22px`, row(10, ic("heart", 30, AMBER_500, 2, AMBER_500) + ln(96, alpha(WHITE, 0.9), 16), "padding:0 10px 36px") + col(6, nav)) +
        abs(280, 38, 600, 40, "display:flex;align-items:center;gap:16px", ln(200, INK_800, 18) + `<div style="margin-left:auto;width:220px;height:40px;border-radius:20px;background:${NEUTRAL_100};display:flex;align-items:center;gap:10px;padding:0 14px">${ic("search", 20, INK_600)}${ln(100)}</div>` + ic("bell", 24, INK_800, 2.2)) +
        abs(280, 100, 880, 96, "display:grid;grid-template-columns:repeat(4,1fr);gap:16px", stats) +
        abs(280, 220, 420, 420, `background:${INK_50};border-radius:22px`, abs(10, 10, 400, 400, "", svg(400, 400, radar))) +
        abs(720, 220, 440, 250, `background:${NEUTRAL_100};border-radius:22px;padding:20px 24px`, ln(120, INK_800, 12) + `<div style="margin-top:14px">${svg(380, 190, barras)}</div>`) +
        abs(720, 490, 440, 150, `background:${INK_800};border-radius:22px;padding:20px 24px`, row(10, ln(110, alpha(WHITE, 0.85), 12) + ln(50, INK_600, 10)) + `<div style="margin-top:20px">${svg(390, 70, linhaTempo)}</div>`),
    };
  },

  // App de saúde com vestíveis: anéis de atividade, frequência cardíaca, sono e o relógio sincronizado.
  "app-de-saude-com-vestiveis": (r) => {
    let ecg = "M0 360";
    for (let x = 0; x < W; x += 200) ecg += `H${x + 70}l14 -12l12 12h10l10 -90l14 160l12 -96l10 26h18`;
    ecg += `H${W}`;
    const fundo = svg(W, H, `<path d="${ecg}" fill="none" stroke="${INK_600}" stroke-width="5" stroke-linejoin="round"/>`);
    const chip = (x, y, n, v, u) => abs(x, y, 232, 92, `background:${INK_600};border-radius:22px;display:flex;align-items:center;gap:14px;padding:0 20px;${sombra(0.3, 14, 28)}`, badgeIcon(n, 48, AMBER_500, INK_800, 2.2) + row(6, txt(v, 34, WHITE, 800) + txt(u, 16, INK_50, 700, "opacity:.7;align-self:flex-end;margin-bottom:4px")));
    const aneis = svg(
      204,
      204,
      [
        [92, 0.8, AMBER_500],
        [72, 0.62, INK_600],
        [52, 0.45, NEUTRAL_300],
      ]
        .map(([rr, f, c]) => `<circle cx="102" cy="102" r="${rr}" fill="none" stroke="${WHITE}" stroke-width="15"/><path d="${arco(102, 102, rr, 0, f * 360)}" fill="none" stroke="${c}" stroke-width="15" stroke-linecap="round"/>`)
        .join(""),
    );
    const sono = serie(r, 7, 0.35, 1);
    const mini = `M0 30H40l8-8 8 8h6l7-26 8 44 7-28 6 10h20l8-8 8 8h6l7-26 8 44 7-28 6 10H190`;
    const tela =
      abs(20, 46, 238, 30, "display:flex;align-items:center;justify-content:space-between", ln(120, INK_800, 14) + ic("sync", 22, INK_600, 2.4)) +
      abs(18, 88, 242, 226, `background:${INK_50};border-radius:22px;display:flex;align-items:center;justify-content:center;position:relative`, aneis + abs(0, 94, 242, null, "text-align:center", col(4, txt("8 412", 22, INK_800, 800) + `<span style="display:flex;justify-content:center">${ic("activity", 18, AMBER_500, 2.6)}</span>`))) +
      abs(18, 328, 242, 112, `background:${INK_800};border-radius:22px;padding:16px 18px`, row(8, ic("heart", 26, AMBER_500, 2, AMBER_500) + txt("72", 36, WHITE, 800) + txt("bpm", 14, INK_50, 700, "opacity:.7;align-self:flex-end;margin-bottom:4px")) + `<div style="margin-top:10px">${svg(206, 50, `<path d="${mini}" fill="none" stroke="${AMBER_500}" stroke-width="3" stroke-linejoin="round"/>`)}</div>`) +
      abs(18, 454, 242, 92, `background:${NEUTRAL_100};border-radius:22px;padding:14px 18px;display:flex;align-items:flex-end;gap:12px`, col(6, ic("moon", 24, INK_600, 2.2) + txt("7h20", 18, INK_800, 800)) + `<div style="flex:1;display:flex;justify-content:flex-end">${svg(136, 60, sono.map((v, i) => `<rect x="${i * 20}" y="${60 - v * 60}" width="14" height="${v * 60}" rx="4" fill="${i === 6 ? AMBER_500 : INK_600}"/>`).join(""))}</div>`);
    const relogio =
      abs(845, 120, 120, 120, `background:${INK_600};border-radius:22px`) +
      abs(845, 450, 120, 150, `background:${INK_600};border-radius:22px`) +
      abs(1004, 284, 16, 56, `background:${NEUTRAL_300};border-radius:6px`) +
      abs(800, 190, 210, 290, `background:${NEUTRAL_300};border-radius:64px;padding:14px;${sombra(0.35, 20, 40)}`, `<div style="width:182px;height:262px;border-radius:52px;background:${INK_800};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">${ic("heart", 48, AMBER_500, 2, AMBER_500)}${txt("72", 64, WHITE, 800, "letter-spacing:-2px")}${svg(120, 34, `<path d="M0 20H30l6-6 6 6h4l6-18 6 30 6-20 4 8H120" fill="none" stroke="${AMBER_500}" stroke-width="3" stroke-linejoin="round"/>`)}</div>`);
    const sync = abs(712, 300, 80, 80, "", svg(80, 80, `<g fill="none" stroke="${AMBER_500}" stroke-width="4" stroke-linecap="round"><path d="M56 22a26 26 0 0 1 0 36M66 12a40 40 0 0 1 0 56"/></g><circle cx="30" cy="40" r="20" fill="${AMBER_500}"/>${icg("bt", 18, 28, 24, INK_800, 2.4)}`));
    return {
      bg: INK_800,
      html: abs(0, 0, W, H, "", fundo) + chip(70, 140, "droplet", "98%", "SpO₂") + chip(110, 290, "flame", "420", "kcal") + chip(70, 440, "moon", "7h20", "") + sync + relogio + phone(410, 46, 300, 590, tela, { frame: INK_600 }),
    };
  },

  // Passagens de ônibus: bilhete com rota e horário, mapa de assentos e a busca no app.
  "passagens-de-onibus-web-e-app": (r) => {
    let barcode = "";
    let bx = 0;
    while (bx < 120) {
      const w = 2 + Math.floor(r() * 5);
      barcode += `<rect x="${bx}" y="0" width="${w}" height="150" fill="${INK_800}"/>`;
      bx += w + 2 + Math.floor(r() * 4);
    }
    const bilhete =
      abs(0, 0, 680, 300, `background:${WHITE};border-radius:24px;${sombra(0.14, 16, 32)}`) +
      abs(490, -22, 44, 44, `background:${NEUTRAL_100};border-radius:50%`) +
      abs(490, 278, 44, 44, `background:${NEUTRAL_100};border-radius:50%`) +
      abs(511, 30, 2, 240, `border-left:3px dashed ${NEUTRAL_300}`) +
      abs(32, 28, 440, null, "", row(12, badgeIcon("bus", 44, INK_50, INK_600, 2.2) + col(8, ln(160, INK_800, 13) + ln(90, NEUTRAL_300, 9)))) +
      abs(32, 104, 440, null, "display:flex;align-items:center;justify-content:space-between", col(10, txt("08:30", 56, INK_800, 800, "letter-spacing:-2px") + row(6, ic("pin", 18, INK_600, 2.4) + ln(70))) + `<div style="flex:1;margin:0 18px;position:relative;height:4px;border-top:4px dotted ${NEUTRAL_300}">${abs(48, -26, 48, 48, `background:${AMBER_500};border-radius:50%;display:flex;align-items:center;justify-content:center`, ic("bus", 26, INK_800, 2.2))}</div>` + col(10, txt("14:15", 56, INK_800, 800, "letter-spacing:-2px") + row(6, ic("pin", 18, AMBER_500, 2.4) + ln(70)), "align-items:flex-end")) +
      abs(32, 230, 440, 44, "display:flex;gap:28px", row(8, ic("calendar", 22, INK_600, 2.2) + txt("12", 20, INK_800)) + row(8, ic("grid", 22, INK_600, 2.2) + txt("12A", 20, INK_800)) + row(8, ic("clock", 22, INK_600, 2.2) + txt("5h45", 20, INK_800))) +
      abs(546, 50, 120, 150, "", svg(120, 150, barcode)) +
      abs(546, 220, 120, null, "", col(8, ln(110, INK_800, 10) + ln(70)));
    const ocupados = new Set([1, 4, 5, 9, 12, 14, 18, 23, 26, 30, 33, 35, 39, 41]);
    let assentos = "";
    for (let c = 0; c < 11; c++) {
      for (let rr = 0; rr < 4; rr++) {
        const i = c * 4 + rr;
        const sel = i === 21 || i === 22;
        const x = 130 + c * 46;
        const y = 22 + rr * 36 + (rr >= 2 ? 22 : 0);
        const fill = sel ? AMBER_500 : ocupados.has(i) ? INK_600 : WHITE;
        assentos += `<rect x="${x}" y="${y}" width="36" height="28" rx="7" fill="${fill}" stroke="${sel ? AMBER_500 : ocupados.has(i) ? INK_600 : NEUTRAL_300}" stroke-width="2.5"/>`;
      }
    }
    const onibus = svg(680, 200, `<rect x="4" y="4" width="672" height="192" rx="46" fill="${WHITE}" stroke="${INK_600}" stroke-width="5"/><rect x="30" y="30" width="62" height="62" rx="14" fill="${INK_50}"/><circle cx="61" cy="140" r="22" fill="none" stroke="${INK_600}" stroke-width="6"/><circle cx="61" cy="140" r="5" fill="${INK_600}"/>${assentos}`);
    const datas = [12, 13, 14, 15, 16]
      .map((d) => `<div style="width:44px;height:58px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;${d === 14 ? `background:${AMBER_500}` : `background:${NEUTRAL_100}`}">${txt(String(d), 18, INK_800, 800)}${ln(18, d === 14 ? INK_800 : NEUTRAL_300, 4)}</div>`)
      .join("");
    const resultados = [
      ["07:00", "12:45", true],
      ["08:30", "14:15", false],
      ["11:10", "16:50", false],
    ]
      .map(([a, b, on]) => `<div style="height:62px;border-radius:14px;border:${on ? `3px solid ${INK_600}` : `2px solid ${NEUTRAL_300}`};display:flex;align-items:center;gap:8px;padding:0 12px">${txt(a, 16, INK_800)}${ic("arrowR", 16, NEUTRAL_300, 2.6)}${txt(b, 16, INK_800)}<span style="margin-left:auto">${ln(40, on ? AMBER_500 : INK_600, 10)}</span></div>`)
      .join("");
    const tela =
      abs(20, 46, 238, 30, "display:flex;align-items:center;justify-content:space-between", ln(110, INK_800, 14) + ic("menu", 24, INK_800, 2.4)) +
      abs(16, 86, 246, 150, `background:${INK_800};border-radius:22px;padding:22px 20px;position:relative`, row(10, ic("pin", 22, AMBER_500, 2.4) + ln(120, alpha(WHITE, 0.85), 11)) + `<i style="display:block;margin:18px 0 18px 32px;height:2px;background:${INK_600}"></i>` + row(10, ic("pin", 22, WHITE, 2.4) + ln(100, alpha(WHITE, 0.85), 11)) + abs(192, 52, 42, 42, `background:${AMBER_500};border-radius:50%;display:flex;align-items:center;justify-content:center`, ic("swap", 22, INK_800, 2.4))) +
      abs(16, 252, 246, 60, "display:flex;justify-content:space-between", datas) +
      abs(16, 328, 246, null, "", col(10, resultados));
    return {
      bg: NEUTRAL_100,
      html: abs(60, 100, 680, 300, "", bilhete) + abs(60, 432, 680, 200, "", onibus) + phone(806, 50, 300, 578, tela),
    };
  },

  // Alertas de segurança à população: mapa com zonas de alerta, torre de transmissão e as notificações no celular.
  "app-de-alertas-de-seguranca": (r) => {
    let mapa = `<rect width="720" height="675" fill="${INK_800}"/>`;
    mapa += `<rect x="440" y="80" width="190" height="150" rx="16" fill="${INK_600}" opacity=".35"/><rect x="60" y="440" width="220" height="150" rx="16" fill="${INK_600}" opacity=".35"/>`;
    for (let i = 0; i < 7; i++) mapa += `<path d="M-20 ${40 + i * 100 + r() * 20}L740 ${20 + i * 100 + r() * 40}" stroke="${INK_600}" stroke-width="${i % 3 === 1 ? 20 : 8}"/>`;
    for (let i = 0; i < 6; i++) mapa += `<path d="M${30 + i * 130 + r() * 20} -20L${10 + i * 130 + r() * 30} 700" stroke="${INK_600}" stroke-width="${i % 3 === 2 ? 20 : 8}"/>`;
    const zona = (x, y, rr) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${INK_800}" stroke="${AMBER_500}" stroke-width="3" stroke-dasharray="8 8"/><circle cx="${x}" cy="${y}" r="${rr * 0.55}" fill="${INK_600}"/>`;
    const alfinete = (x, y) => `<g transform="translate(${x - 22} ${y - 56})"><path d="M22 56s20-19 20-34A20 20 0 0 0 2 22c0 15 20 34 20 34z" fill="${AMBER_500}" stroke="${INK_800}" stroke-width="3"/><path d="M22 12v12M22 30v.5" stroke="${INK_800}" stroke-width="4.5" stroke-linecap="round"/></g>`;
    mapa += zona(170, 180, 110) + zona(560, 470, 90) + zona(250, 560, 60);
    mapa += alfinete(170, 180) + alfinete(560, 470) + alfinete(250, 560);
    mapa += `<g transform="translate(360 330)"><circle r="150" fill="none" stroke="${WHITE}" stroke-opacity=".12" stroke-width="3"/><circle r="100" fill="none" stroke="${WHITE}" stroke-opacity=".2" stroke-width="3"/><circle r="56" fill="${INK_600}"/>${icg("tower", -30, -30, 60, WHITE, 1.8)}</g>`;
    const avisos = [
      ["bell", INK_600, WHITE],
      ["alert", AMBER_500, INK_800],
      ["info", INK_50, INK_600],
      ["pin", INK_600, WHITE],
    ]
      .map(([n, bg, c], i) => `<div style="height:84px;border-radius:18px;background:${WHITE};display:flex;align-items:center;gap:12px;padding:0 14px">${badgeIcon(n, 44, bg, c, 2.2)}${col(8, ln(110 + (i % 2) * 20, INK_800, 11) + ln(80, NEUTRAL_300, 8))}<span style="margin-left:auto;align-self:flex-start;margin-top:18px">${txt(`${(i + 1) * 7}'`, 13, INK_600)}</span></div>`)
      .join("");
    const tela =
      abs(20, 46, 238, 30, "display:flex;align-items:center;gap:10px", ic("shield", 24, INK_600, 2.4) + ln(130, INK_800, 13)) +
      abs(14, 92, 250, 92, `border:3px dashed ${NEUTRAL_300};border-radius:18px`) +
      abs(14, 196, 250, null, "", col(12, avisos));
    const novo = abs(
      680,
      152,
      340,
      100,
      `background:${WHITE};border-radius:20px;box-shadow:inset 7px 0 0 ${AMBER_500}, 0 24px 44px ${alpha(INK_800, 0.55)};display:flex;align-items:center;gap:14px;padding:0 20px 0 26px;transform:rotate(-3deg)`,
      badgeIcon("megaphone", 52, AMBER_500, INK_800, 2.2) + col(9, ln(150, INK_800, 12) + ln(110, NEUTRAL_300, 9)) + `<span style="margin-left:auto;align-self:flex-start;margin-top:22px">${ic("clock", 18, AMBER_500, 2.6)}</span>`,
    );
    return {
      bg: INK_800,
      html: abs(0, 0, 720, H, "", svg(720, H, mapa)) + phone(790, 50, 300, 578, tela, { screen: NEUTRAL_100, frame: INK_600 }) + novo,
    };
  },

  // Gestão escolar: calendário na web, papéis (escola, professores, famílias) ligados e conversa no app.
  "portal-escola-professores-e-pais": () => {
    let dias = "";
    const marcas = { 8: AMBER_500, 15: INK_600, 22: INK_50, 27: AMBER_500 };
    for (let i = 0; i < 35; i++) {
      const d = i - 2;
      const ok = d >= 1 && d <= 31;
      const m = marcas[d];
      dias += `<div style="height:52px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;${m ? `background:${m}` : ""}">${ok ? txt(String(d), 16, m === INK_600 ? WHITE : INK_800, m ? 800 : 700, ok && !m ? "opacity:.75" : "") : ""}${d === 22 ? dot(6, AMBER_500) : ""}</div>`;
    }
    const calendario =
      abs(30, 24, 500, 40, "display:flex;align-items:center;justify-content:space-between", ic("chevL", 24, INK_800, 2.6) + ln(140, INK_800, 14) + ic("chevR", 24, INK_800, 2.6)) +
      abs(30, 76, 500, 20, "display:grid;grid-template-columns:repeat(7,1fr);justify-items:center", Array.from({ length: 7 }, () => ln(20, NEUTRAL_300, 6)).join("")) +
      abs(30, 104, 500, 300, "display:grid;grid-template-columns:repeat(7,1fr);gap:6px", dias);
    const papeis = [
      ["building", INK_800, WHITE, 196],
      ["book", AMBER_500, INK_800, 340],
      ["home", INK_600, WHITE, 484],
    ];
    const linhas = svg(W, H, papeis.map(([, , , y]) => `<path d="M630 ${y}H702M778 ${y}C830 ${y} 830 370 872 370" fill="none" stroke="${INK_600}" stroke-width="3" stroke-dasharray="6 7" stroke-linecap="round"/>`).join(""));
    const circulos = papeis.map(([n, bg, c, y]) => abs(702, y - 38, 76, 76, `border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;${sombra(0.2, 10, 20)}`, ic(n, 38, c, 2))).join("");
    const bolha = (lado, bg, linhas2, extra = "") =>
      `<div style="align-self:${lado === "e" ? "flex-start" : "flex-end"};max-width:190px;padding:12px 14px;border-radius:${lado === "e" ? "16px 16px 16px 4px" : "16px 16px 4px 16px"};background:${bg}">${col(7, linhas2.map((w) => ln(w, bg === INK_600 ? alpha(WHITE, 0.8) : bg === AMBER_500 ? INK_800 : NEUTRAL_300, 9)).join(""))}${extra}</div>`;
    const tela =
      abs(18, 46, 230, 30, "display:flex;align-items:center;justify-content:space-between", ln(100, INK_800, 14) + `<span style="position:relative">${ic("bell", 22, INK_800, 2.2)}${abs(13, -2, 9, 9, `border-radius:50%;background:${AMBER_500}`)}</span>`) +
      abs(14, 92, 220, 330, "display:flex;flex-direction:column;gap:12px", bolha("e", NEUTRAL_100, [150, 110]) + bolha("d", INK_600, [130, 90]) + bolha("e", NEUTRAL_100, [120], `<div style="margin-top:10px;display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;background:${WHITE}">${ic("doc", 20, INK_600)}${ln(70)}</div>`) + bolha("d", AMBER_500, [80])) +
      abs(14, 408, 220, 46, `border-radius:23px;background:${NEUTRAL_100};display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 16px`, ln(90) + badgeIcon("send", 36, INK_600, WHITE, 2.2));
    return {
      bg: WHITE,
      html:
        abs(30, 30, 1140, 615, `background:${INK_50};border-radius:34px`) +
        abs(70, 64, null, null, "", row(14, `<i style="width:36px;height:36px;border-radius:10px;background:${AMBER_500}"></i>` + ln(230, INK_800, 20))) +
        abs(0, 0, W, H, "", linhas) +
        browser(70, 128, 560, 466, calendario) +
        circulos +
        phone(872, 120, 268, 498, tela),
    };
  },

  // Guia turístico no Android: mapa com rio e pontos de interesse e cartões ilustrados dos lugares.
  "app-guia-turistico": () => {
    const mapa = svg(
      288,
      568,
      `<rect width="288" height="568" fill="${NEUTRAL_100}"/><ellipse cx="60" cy="120" rx="80" ry="60" fill="${INK_50}"/><ellipse cx="240" cy="330" rx="90" ry="70" fill="${INK_50}"/>` +
        `<path d="M320 40C220 80 240 180 150 220S40 300 70 380 0 520 -40 560" fill="none" stroke="${INK_600}" stroke-width="50" stroke-linecap="round" opacity=".85"/><path d="M150 220C200 260 260 250 320 300" fill="none" stroke="${INK_600}" stroke-width="18" opacity=".7"/>` +
        `<g stroke="${WHITE}" stroke-width="6" fill="none"><path d="M0 170L300 150M90 0L120 568"/></g>` +
        [
          [96, 120, 1],
          [214, 182, 2],
          [180, 300, 3],
          [40, 270, 4],
        ]
          .map(([x, y, n]) => `<g transform="translate(${x - 18} ${y - 46})"><path d="M18 46s16-15 16-28A16 16 0 0 0 2 18c0 13 16 28 16 28z" fill="${AMBER_500}" stroke="${INK_800}" stroke-width="2.5"/><text x="18" y="24" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" fill="${INK_800}">${n}</text></g>`)
          .join("") +
        `<circle cx="128" cy="236" r="18" fill="${INK_800}" fill-opacity=".18"/><circle cx="128" cy="236" r="9" fill="${INK_800}" stroke="${WHITE}" stroke-width="3"/>`,
    );
    const cenas = {
      rio: `<rect width="210" height="150" fill="${INK_50}"/><circle cx="150" cy="56" r="26" fill="${AMBER_500}"/><rect y="92" width="210" height="58" fill="${INK_600}"/><path d="M0 108h210M0 126h210" stroke="${INK_50}" stroke-opacity=".35" stroke-width="3"/><path d="M50 92h70l-10 16H60z" fill="${INK_800}"/><path d="M84 92V62l22 26z" fill="${WHITE}"/>`,
      floresta: `<rect width="210" height="150" fill="${NEUTRAL_100}"/><path d="M0 120h210v30H0z" fill="${INK_600}"/>${[20, 70, 120, 168].map((x, i) => `<path d="M${x} ${120}l${26} -${70 + (i % 2) * 20} ${26} ${70 + (i % 2) * 20}z" fill="${i % 2 ? INK_800 : INK_600}"/>`).join("")}<circle cx="182" cy="34" r="16" fill="${AMBER_500}"/>`,
      feira: `<rect width="210" height="150" fill="${INK_50}"/><path d="M20 50h170l-12 26H32z" fill="${AMBER_500}"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${32 + i * 30} 50h15l-3 26h-12z" fill="${WHITE}"/>`).join("")}<rect x="34" y="76" width="142" height="54" fill="${INK_600}"/><rect x="50" y="90" width="40" height="24" rx="4" fill="${AMBER_500}"/><rect x="104" y="90" width="56" height="24" rx="4" fill="${INK_50}"/><rect y="130" width="210" height="20" fill="${NEUTRAL_300}"/>`,
    };
    const cards = [
      ["rio", "0.8 km", "4.8"],
      ["floresta", "3.2 km", "4.6"],
      ["feira", "1.1 km", "4.7"],
    ]
      .map(([k, d, s]) => `<div style="width:210px;border-radius:22px;overflow:hidden;background:${WHITE};${sombra(0.14, 14, 28)}"><svg width="210" height="190" viewBox="0 0 210 150" preserveAspectRatio="xMidYMid slice" style="display:block">${cenas[k]}</svg><div style="padding:16px 16px 18px">${col(8, ln(140, INK_800, 12) + ln(100))}${row(8, ic("pin", 18, AMBER_500, 2.4) + txt(d, 15, INK_800) + `<span style="margin-left:auto;display:inline-flex;align-items:center;gap:4px">${ic("star", 16, AMBER_500, 2, AMBER_500)}${txt(s, 15, INK_800)}</span>`, "margin-top:14px")}</div></div>`)
      .join("");
    const tela =
      abs(0, 0, 288, 568, "", mapa) +
      abs(222, 44, 48, 48, `background:${WHITE};border-radius:50%;display:flex;align-items:center;justify-content:center;${sombra(0.2, 4, 10)}`, ic("compass", 28, INK_800, 2.2)) +
      abs(0, 392, 288, 176, `background:${WHITE};border-radius:26px 26px 0 0;padding:14px 18px`, `<i style="display:block;margin:0 auto 14px;width:44px;height:5px;border-radius:3px;background:${NEUTRAL_300}"></i>` + row(14, `<div style="width:92px;height:92px;border-radius:16px;overflow:hidden">${svg(92, 92, `<g transform="scale(.62) translate(-40 -10)">${cenas.rio}</g>`)}</div>` + col(9, ln(110, INK_800, 12) + row(2, Array.from({ length: 5 }, () => ic("star", 14, AMBER_500, 2, AMBER_500)).join("")) + row(6, ic("pin", 16, AMBER_500, 2.4) + txt("1.2 km", 14, INK_800)))));
    const chips = ["sun", "camera", "pin", "star"].map((n, i) => `<span style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:22px;background:${i === 0 ? INK_800 : WHITE}">${ic(n, 20, i === 0 ? AMBER_500 : INK_600, 2.2)}${ln(40, i === 0 ? alpha(WHITE, 0.6) : NEUTRAL_300, 8)}</span>`).join("");
    let ondas = "";
    for (let y = 40; y < H; y += 46) ondas += `<path d="M0 ${y}q30 -14 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0" fill="none" stroke="${WHITE}" stroke-width="3" opacity=".7"/>`;
    return {
      bg: INK_50,
      html:
        abs(0, 0, W, H, "", svg(W, H, ondas)) +
        phone(100, 44, 310, 590, tela) +
        abs(480, 64, 680, null, "", row(14, badgeIcon("compass", 56, AMBER_500, INK_800, 2) + col(12, ln(300, INK_800, 26) + ln(180, INK_600, 10)))) +
        abs(480, 156, 680, 300, "display:flex;align-items:flex-start;gap:20px", cards) +
        abs(480, 486, 680, null, "", row(12, chips)),
    };
  },

  // Site de pré-lançamento com animação por sprites: respingo, contagem regressiva e a folha de quadros.
  "site-de-pre-lancamento-com-animacoes": () => {
    const respingo = svg(
      440,
      250,
      `<ellipse cx="220" cy="214" rx="190" ry="24" fill="${WHITE}" opacity=".9"/><ellipse cx="220" cy="214" rx="120" ry="12" fill="${INK_50}"/>${coroa(220, 212, 170, 120, WHITE)}<circle cx="70" cy="110" r="8" fill="${WHITE}"/><circle cx="372" cy="96" r="6" fill="${WHITE}"/><circle cx="96" cy="60" r="5" fill="${WHITE}"/>${gota(220, -10, 14, WHITE)}`,
    );
    const contagem = ["12", "04", "37", "15"]
      .map((n, i) => `${i ? txt(":", 40, AMBER_500, 800) : ""}<div style="width:92px;height:72px;border-radius:14px;background:${INK_600};display:flex;align-items:center;justify-content:center">${txt(n, 40, WHITE, 800)}</div>`)
      .join("");
    const site =
      abs(36, 24, 888, 30, "display:flex;align-items:center;justify-content:space-between", `<i style="width:30px;height:30px;border-radius:50%;background:${WHITE}"></i>` + row(24, ln(60, INK_600) + ln(60, INK_600) + `<i style="width:110px;height:32px;border-radius:16px;background:${AMBER_500}"></i>`)) +
      abs(260, 40, 440, 250, "", respingo) +
      abs(0, 300, 960, 72, "display:flex;align-items:center;justify-content:center;gap:12px", contagem);
    const quadro = (k) => {
      const base = 80;
      let s = `<ellipse cx="50" cy="${base}" rx="40" ry="7" fill="${INK_50}" opacity=".85"/>`;
      if (k <= 2) s += gota(50, 18 + k * 22, 9, WHITE);
      if (k === 3) s += `<path d="M30 ${base}Q50 ${base - 26} 70 ${base}Z" fill="${WHITE}"/><circle cx="50" cy="${base - 30}" r="5" fill="${WHITE}"/>`;
      if (k === 4) s += coroa(50, base, 34, 30, WHITE);
      if (k === 5) s += coroa(50, base, 52, 36, WHITE);
      if (k === 6) s += `${coroa(50, base, 22, 32, WHITE)}<circle cx="24" cy="40" r="4" fill="${WHITE}"/><circle cx="78" cy="34" r="4" fill="${WHITE}"/><circle cx="50" cy="26" r="5" fill="${WHITE}"/>`;
      if (k === 7) s += `<ellipse cx="50" cy="${base}" rx="26" ry="5" fill="none" stroke="${WHITE}" stroke-width="2.5"/><ellipse cx="50" cy="${base}" rx="36" ry="7" fill="none" stroke="${WHITE}" stroke-width="2" opacity=".6"/>`;
      return s;
    };
    const quadros = Array.from({ length: 8 }, (_, k) => `<div style="position:relative;width:100px;height:96px;border-radius:12px;background:${INK_600};${k === 4 ? `outline:4px solid ${AMBER_500}` : ""}">${svg(100, 96, quadro(k))}${abs(8, 6, null, null, "", txt(`0${k + 1}`, 11, INK_50, 700, "opacity:.6"))}</div>`).join("");
    return {
      bg: INK_600,
      html:
        browser(120, 44, 960, 420, site, { body: INK_800, bar: INK_800, url: INK_600, dots: INK_600, shadow: sombra(0.4, 24, 48) }) +
        abs(120, 496, 960, 140, `background:${INK_800};border-radius:22px;display:flex;align-items:center;justify-content:center;gap:14px`, quadros) +
        abs(667, 478, 24, 18, "", svg(24, 18, `<path d="M0 0H24L12 16Z" fill="${AMBER_500}"/>`)),
    };
  },

  // Site institucional com CMS: painel de edição (lista e editor de blocos) publicando na página de produtos.
  "site-institucional-com-cms": () => {
    const menu = ["grid", "doc", "image", "layers", "gear"]
      .map((n, i) => `<div style="height:46px;display:flex;align-items:center;gap:10px;padding:0 18px;${i === 1 ? `box-shadow:inset 4px 0 0 ${AMBER_500};background:${INK_600}` : ""}">${ic(n, 20, i === 1 ? WHITE : alpha(INK_50, 0.6), 2.2)}${ln(56, i === 1 ? alpha(WHITE, 0.8) : alpha(INK_50, 0.3), 8)}</div>`)
      .join("");
    const posts = [
      [INK_600, 160],
      [AMBER_500, 130],
      [NEUTRAL_300, 150],
      [INK_600, 120],
    ]
      .map(([c, w], i) => `<div style="height:58px;display:flex;align-items:center;gap:12px;border-bottom:2px solid ${NEUTRAL_100}"><i style="width:18px;height:18px;border-radius:5px;border:2px solid ${NEUTRAL_300}"></i><div style="width:40px;height:40px;border-radius:10px;background:${INK_50};display:flex;align-items:center;justify-content:center">${caixaLeite(18, i % 2 ? WHITE : INK_600, i % 2 ? INK_600 : AMBER_500, i % 2 ? INK_600 : "none")}</div>${col(7, ln(w, INK_800, 10) + ln(80, NEUTRAL_300, 7))}<i style="margin-left:auto;width:60px;height:22px;border-radius:11px;background:${c}"></i></div>`)
      .join("");
    const editor = `<div style="display:inline-flex;gap:8px;padding:8px 10px;border-radius:12px;background:${WHITE};${sombra(0.12, 4, 10)}">${["plus", "edit", "image", "link"].map((n) => ic(n, 18, INK_600, 2.2)).join("")}</div>${col(10, ln(240, INK_800, 16) + ln(320, NEUTRAL_300, 9) + ln(280, NEUTRAL_300, 9), "margin-top:16px")}<div style="margin-top:16px;height:64px;border-radius:12px;border:2px dashed ${INK_600};display:flex;align-items:center;justify-content:center">${ic("image", 30, INK_600, 2)}</div>`;
    const cms =
      abs(0, 0, 150, 560, `background:${INK_800};padding-top:24px`, `<i style="display:block;margin:0 18px 24px;width:38px;height:38px;border-radius:10px;background:${INK_600}"></i>` + menu) +
      abs(150, 0, 450, 60, `border-bottom:2px solid ${NEUTRAL_100};display:flex;align-items:center;padding:0 20px`, ln(120, INK_800, 12) + `<span style="margin-left:auto">${badgeIcon("plus", 34, AMBER_500, INK_800, 3)}</span>`) +
      abs(170, 72, 410, null, "", posts) +
      abs(170, 324, 410, 216, `background:${INK_50};border-radius:16px;padding:16px`, editor);
    const produtos = [
      [INK_600, AMBER_500],
      [WHITE, INK_600],
      [INK_600, INK_800],
    ]
      .map(([f, t]) => `<div style="border-radius:14px;background:${NEUTRAL_100};padding:14px 12px 16px;display:flex;flex-direction:column;align-items:center;gap:10px">${caixaLeite(60, f, t, f === WHITE ? INK_600 : "none")}${ln(80, INK_800, 9)}${ln(40, AMBER_500, 8)}</div>`)
      .join("");
    const site =
      abs(26, 18, 418, 30, "display:flex;align-items:center;justify-content:space-between", `<i style="width:26px;height:26px;border-radius:50%;background:${INK_600}"></i>` + row(16, ln(46) + ln(46) + ln(46))) +
      abs(26, 62, 418, 160, `background:${INK_600};border-radius:16px;overflow:hidden`, abs(26, 34, null, null, "", col(10, ln(150, WHITE, 14) + ln(110, alpha(WHITE, 0.5), 10) + `<i style="margin-top:8px;width:84px;height:28px;border-radius:14px;background:${AMBER_500}"></i>`)) + abs(230, 22, null, null, "", row(10, caixaLeite(64, WHITE, AMBER_500) + caixaLeite(76, INK_50, INK_800))) + abs(-30, 130, 480, 80, `border-radius:50%;background:${alpha(WHITE, 0.18)}`)) +
      abs(26, 238, 418, 180, "display:grid;grid-template-columns:repeat(3,1fr);gap:12px", produtos) +
      abs(0, 428, 470, 32, `background:${INK_800}`);
    return {
      bg: NEUTRAL_100,
      html: abs(40, 60, 600, 560, `background:${WHITE};border-radius:18px;overflow:hidden;${sombra(0.16, 18, 36)}`, cms) + browser(690, 104, 470, 500, site) + abs(633, 470, 64, 64, `background:${AMBER_500};border-radius:50%;border:4px solid ${WHITE};display:flex;align-items:center;justify-content:center;${sombra(0.25, 8, 16)}`, ic("arrowR", 28, INK_800, 2.8)),
    };
  },

  // Reformulação de portal institucional: antes (denso, apagado) e depois (limpo), com a alça de comparação no meio.
  "portal-de-noticias-de-tribunal": () => {
    const antigo =
      abs(0, 0, 380, 544, `background:${NEUTRAL_100}`) +
      abs(0, 0, 380, 58, `background:${NEUTRAL_300}`, abs(16, 16, 26, 26, `background:${NEUTRAL_100};border-radius:4px`) + abs(52, 22, null, null, "", row(8, ln(60, NEUTRAL_100, 8) + ln(50, NEUTRAL_100, 8) + ln(60, NEUTRAL_100, 8) + ln(40, NEUTRAL_100, 8)))) +
      abs(0, 58, 380, 22, `background:${alpha(NEUTRAL_300, 0.5)}`, abs(10, 7, null, null, "", ln(300, NEUTRAL_100, 8))) +
      abs(12, 92, 110, 440, "", col(7, Array.from({ length: 18 }, (_, i) => ln(60 + ((i * 23) % 44), NEUTRAL_300, 8)).join(""))) +
      abs(132, 92, 236, 120, `background:${NEUTRAL_300}`) +
      abs(132, 222, 236, 310, "", col(7, Array.from({ length: 22 }, (_, i) => ln(140 + ((i * 37) % 90), NEUTRAL_300, 7)).join("")));
    const acessos = ["doc", "calendar", "search", "scale", "clock", "pin"].map((n) => `<div style="height:84px;border-radius:16px;background:${INK_50};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">${ic(n, 28, INK_600, 2.2)}${ln(46, NEUTRAL_300, 6)}</div>`).join("");
    const noticias = [AMBER_500, INK_600, INK_800].map((c) => `<div style="border-radius:16px;border:2px solid ${NEUTRAL_300};padding:12px;display:flex;gap:12px;align-items:center"><i style="flex:none;width:56px;height:56px;border-radius:12px;background:${c}"></i>${col(8, ln(90, INK_800, 10) + ln(70, NEUTRAL_300, 8) + ln(40, NEUTRAL_300, 8))}</div>`).join("");
    const predio = svg(
      300,
      220,
      `<rect width="300" height="220" fill="${INK_600}"/><circle cx="240" cy="50" r="26" fill="${AMBER_500}"/><path d="M50 92L150 46L250 92Z" fill="${WHITE}"/><rect x="56" y="92" width="188" height="12" fill="${WHITE}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${66 + i * 38}" y="110" width="16" height="74" fill="${WHITE}"/>`).join("")}<rect x="48" y="184" width="204" height="14" fill="${WHITE}"/><rect x="0" y="198" width="300" height="22" fill="${INK_800}"/>`,
    );
    const novo =
      abs(380, 0, 680, 72, `background:${INK_800};display:flex;align-items:center;gap:22px;padding:0 28px`, `<i style="width:36px;height:36px;border-radius:10px;background:${AMBER_500}"></i>` + ln(110, alpha(WHITE, 0.9), 12) + row(22, ln(60, INK_600, 9) + ln(60, INK_600, 9) + ln(60, INK_600, 9), "margin-left:auto") + ic("search", 22, WHITE, 2.4)) +
      abs(408, 94, 624, 220, `border-radius:20px;overflow:hidden;background:${NEUTRAL_100};display:flex`, predio + `<div style="padding:30px 26px">${col(12, ln(70, AMBER_500, 8) + ln(240, INK_800, 18) + ln(200, INK_800, 18) + ln(230, NEUTRAL_300, 10) + ln(160, NEUTRAL_300, 10))}<div style="margin-top:22px">${badgeIcon("arrowR", 44, INK_800, WHITE, 2.6)}</div></div>`) +
      abs(408, 334, 624, 84, "display:grid;grid-template-columns:repeat(6,1fr);gap:12px", acessos) +
      abs(408, 436, 624, 84, "display:grid;grid-template-columns:repeat(3,1fr);gap:12px", noticias);
    const alca = abs(376, 0, 8, 544, `background:${WHITE};box-shadow:0 0 0 2px ${alpha(INK_800, 0.15)}`) + abs(350, 244, 60, 60, `background:${AMBER_500};border-radius:50%;border:4px solid ${WHITE};display:flex;align-items:center;justify-content:center;${sombra(0.3, 6, 14)}`, ic("chevL", 18, INK_800, 3.2) + ic("chevR", 18, INK_800, 3.2));
    return {
      bg: INK_50,
      html: browser(70, 50, 1060, 584, antigo + novo + alca),
    };
  },

  // Jogo multiplayer de arena (rede local): lista de salas e a arena vista de cima com quatro gladiadores.
  "jogo-multiplayer-de-arena": (r) => {
    const cx = 370;
    const cy = 320;
    let arena = `<circle cx="${cx}" cy="${cy}" r="310" fill="${INK_600}"/>`;
    for (const rr of [292, 270, 248]) arena += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${INK_800}" stroke-width="9" stroke-dasharray="10 9"/>`;
    for (const a of [0, 90, 180, 270]) arena += `<rect x="${cx - 24}" y="${cy - 312}" width="48" height="90" fill="${INK_800}" transform="rotate(${a + 45} ${cx} ${cy})"/>`;
    arena += `<circle cx="${cx}" cy="${cy}" r="232" fill="${INK_800}"/><circle cx="${cx}" cy="${cy}" r="218" fill="${AMBER_500}"/>`;
    for (let i = 0; i < 160; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 205;
      arena += `<circle cx="${(cx + d * Math.cos(a)).toFixed(1)}" cy="${(cy + d * Math.sin(a)).toFixed(1)}" r="${1.5 + r() * 2.5}" fill="${INK_800}" opacity=".13"/>`;
    }
    arena += `<circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="${INK_800}" stroke-opacity=".25" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="120" fill="none" stroke="${INK_800}" stroke-opacity=".15" stroke-width="4" stroke-dasharray="12 10"/>`;
    const gladiador = (x, y, ang, cor, n, vida) =>
      `<g transform="translate(${x} ${y})"><g transform="rotate(${ang})"><path d="M0 -10L74 -4L74 4L0 10Z" fill="${WHITE}" stroke="${INK_800}" stroke-width="3"/><circle r="30" fill="${cor}" stroke="${INK_800}" stroke-width="4"/><path d="${arco(0, 0, 38, -60, 60)}" fill="none" stroke="${INK_800}" stroke-width="12" stroke-linecap="round" transform="rotate(-90)"/></g><text y="7" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="${cor === INK_600 ? WHITE : INK_800}">${n}</text><rect x="-34" y="-62" width="68" height="10" rx="5" fill="${INK_800}"/><rect x="-32" y="-60" width="${64 * vida}" height="6" rx="3" fill="${WHITE}"/></g>`;
    arena += `<g stroke="${WHITE}" stroke-width="5" stroke-linecap="round"><path d="M${cx + 8} ${cy - 30}l14 -20M${cx + 26} ${cy - 10}l22 -6M${cx - 6} ${cy - 34}l-6 -22M${cx + 22} ${cy + 10}l18 8"/></g>`;
    arena += gladiador(cx - 110, cy - 70, -20, WHITE, 1, 0.8) + gladiador(cx + 110, cy + 30, 200, INK_50, 2, 0.45) + gladiador(cx - 60, cy + 130, -60, NEUTRAL_300, 3, 0.95) + gladiador(cx + 70, cy - 150, 120, INK_600, 4, 0.6);
    const salas = [
      ["#1", 2, true],
      ["#2", 4, false],
      ["#3", 1, true],
      ["#4", 3, true],
    ]
      .map(([id, n, aberta], i) => `<div style="height:76px;border-radius:16px;background:${i === 0 ? INK_800 : alpha(INK_800, 0.55)};display:flex;align-items:center;gap:14px;padding:0 16px;${i === 0 ? `box-shadow:inset 0 0 0 3px ${AMBER_500}` : ""}">${txt(id, 22, WHITE, 800)}${row(5, Array.from({ length: 4 }, (_, k) => dot(12, k < n ? AMBER_500 : INK_600)).join(""))}${txt(`${n}/4`, 16, INK_50, 700, "opacity:.75")}<span style="margin-left:auto">${aberta ? badgeIcon("play", 38, AMBER_500, INK_800, 2.2) : badgeIcon("lock", 38, INK_600, INK_50, 2.2)}</span></div>`)
      .join("");
    return {
      bg: INK_800,
      html:
        abs(60, 46, null, null, "", col(14, ln(290, alpha(WHITE, 0.92), 26) + ln(170, INK_600, 8))) +
        abs(60, 140, 330, 480, `background:${INK_600};border-radius:24px;padding:22px 20px`, row(10, ic("wifi", 26, AMBER_500, 2.4) + ln(120, alpha(WHITE, 0.85), 12) + `<span style="margin-left:auto">${ic("sync", 22, INK_50, 2.2)}</span>`, "margin-bottom:18px") + col(12, salas) + `<div style="margin-top:18px;height:52px;border-radius:14px;background:${AMBER_500};display:flex;align-items:center;justify-content:center">${ic("plus", 28, INK_800, 3)}</div>`) +
        abs(420, 20, 740, 640, "", svg(740, 640, arena)),
    };
  },

  // Jogo de plataforma com dois heróis em dois cenários e os mesmos botões na tela.
  "jogo-de-plataforma-com-dois-herois": () => {
    const ruinas = (h, cor, op, seed) => {
      let s = "";
      let x = -20;
      let k = seed;
      while (x < W) {
        const w = 70 + ((k * 37) % 80);
        const t = 60 + ((k * 53) % 110);
        s += `<path d="M${x} ${h}V${h - t}l${w * 0.3} ${-12 - (k % 3) * 8}l${w * 0.25} ${18}l${w * 0.45} ${-6}V${h}Z" fill="${cor}" opacity="${op}"/>`;
        x += w + 18;
        k += 3;
      }
      return s;
    };
    const heroi = (x, y, corpo, visor) =>
      `<g transform="translate(${x} ${y})"><rect x="6" y="40" width="10" height="18" rx="4" fill="${corpo}"/><rect x="26" y="40" width="10" height="18" rx="4" fill="${corpo}"/><rect x="0" y="0" width="42" height="46" rx="12" fill="${corpo}"/><rect x="8" y="12" width="30" height="10" rx="5" fill="${visor}"/><rect x="-12" y="18" width="14" height="22" rx="4" fill="${visor}" opacity=".9"/></g>`;
    const plataforma = (x, y, w, cor, sob) => `<rect x="${x}" y="${y}" width="${w}" height="16" rx="5" fill="${cor}"/><rect x="${x + 6}" y="${y + 16}" width="${w - 12}" height="8" rx="3" fill="${sob}"/>`;
    const gema = (x, y, c) => `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" fill="${c}" transform="rotate(45 ${x} ${y})"/>`;
    let cima = `<rect width="${W}" height="300" fill="${INK_600}"/>${ruinas(300, INK_800, 0.55, 2)}`;
    cima += `<rect y="262" width="${W}" height="38" fill="${INK_800}"/>`;
    cima += plataforma(260, 196, 170, NEUTRAL_300, INK_800) + plataforma(520, 140, 150, NEUTRAL_300, INK_800) + plataforma(800, 190, 200, NEUTRAL_300, INK_800);
    cima += heroi(560, 66, AMBER_500, INK_800) + `<path d="M380 180Q470 30 560 80" fill="none" stroke="${WHITE}" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round"/>`;
    cima += gema(880, 160, WHITE) + gema(930, 160, WHITE) + gema(330, 168, WHITE);
    let baixo = `<rect width="${W}" height="240" fill="${NEUTRAL_100}"/>${ruinas(240, NEUTRAL_300, 1, 5)}`;
    baixo += `<rect y="206" width="${W}" height="34" fill="${INK_600}"/>`;
    baixo += plataforma(160, 136, 180, INK_600, INK_800) + plataforma(460, 96, 160, INK_600, INK_800) + plataforma(760, 140, 220, INK_600, INK_800);
    baixo += heroi(860, 70, INK_800, AMBER_500) + gema(520, 70, AMBER_500) + gema(560, 70, AMBER_500);
    const botao = (x, y, s, nome, on) => abs(x, y, s, s, `border-radius:50%;display:flex;align-items:center;justify-content:center;${on ? `background:${AMBER_500}` : `background:${alpha(WHITE, 0.12)};border:3px solid ${alpha(WHITE, 0.5)}`}`, ic(nome, Math.round(s * 0.5), on ? INK_800 : WHITE, 3));
    // Os mesmos botões comandam os dois heróis: selo com os dois personagens ligados.
    const mini = (corpo, visor) => `<svg width="30" height="34" viewBox="-12 0 54 60" style="display:block">${heroi(0, 0, corpo, visor)}</svg>`;
    const fios = abs(270, 602, null, 50, `background:${INK_600};border-radius:25px;display:flex;align-items:center;gap:10px;padding:0 18px`, mini(AMBER_500, INK_800) + ic("link", 22, WHITE, 2.4) + mini(INK_50, AMBER_500));
    const hud = abs(40, 26, null, null, "", row(8, ic("heart", 28, WHITE, 2, WHITE) + ic("heart", 28, WHITE, 2, WHITE) + ic("heart", 28, WHITE, 2.2) + txt("0420", 24, WHITE, 800, "margin-left:16px;letter-spacing:2px")));
    return {
      bg: INK_800,
      html:
        abs(0, 0, W, 300, "", svg(W, 300, cima)) +
        abs(0, 300, W, 36, `background:${AMBER_500};display:flex;align-items:center;justify-content:center;gap:16px`, `<i style="width:180px;height:3px;background:${INK_800}"></i>` + ic("swap", 26, INK_800, 2.6) + `<i style="width:180px;height:3px;background:${INK_800}"></i>`) +
        abs(0, 336, W, 240, "", svg(W, 240, baixo)) +
        abs(0, 576, W, 99, `background:${INK_800}`) +
        fios +
        botao(60, 586, 78, "chevL", false) +
        botao(158, 586, 78, "chevR", false) +
        botao(1018, 580, 86, "chevU", true) +
        hud,
    };
  },

  // Visão computacional no Android: câmera com caixas de detecção e linha de contagem, mais o fluxo de veículos por hora.
  "app-de-contagem-de-veiculos": (r) => {
    const SW = 748;
    const SH = 408;
    let cena = `<rect width="${SW}" height="${SH}" fill="${NEUTRAL_100}"/><rect width="${SW}" height="90" fill="${INK_50}"/>`;
    cena += `<path d="M0 92Q60 60 120 86T240 82T360 86T480 78T600 86T748 80V92Z" fill="${NEUTRAL_300}"/>`;
    cena += `<path d="M300 90H448L748 ${SH}H0Z" fill="${INK_600}"/>`;
    cena += `<path d="M300 90L0 ${SH}M448 90L748 ${SH}" stroke="${WHITE}" stroke-width="5"/>`;
    for (let i = 0; i < 7; i++) {
      const t0 = Math.pow(i / 7, 1.6);
      const t1 = Math.pow((i + 0.45) / 7, 1.6);
      const y0 = 90 + t0 * (SH - 90);
      const y1 = 90 + t1 * (SH - 90);
      cena += `<path d="M374 ${y0.toFixed(1)}L374 ${y1.toFixed(1)}" stroke="${WHITE}" stroke-opacity=".8" stroke-width="${2 + t1 * 8}"/>`;
    }
    const carro = (x, y, w, cor, id, conf) => {
      const h = w * 0.62;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.14}" fill="${cor}"/><rect x="${x + w * 0.14}" y="${y + h * 0.14}" width="${w * 0.72}" height="${h * 0.3}" rx="${w * 0.06}" fill="${INK_50}" opacity=".75"/><rect x="${x + w * 0.08}" y="${y + h * 0.7}" width="${w * 0.16}" height="${h * 0.12}" rx="2" fill="${AMBER_500}"/><rect x="${x + w * 0.76}" y="${y + h * 0.7}" width="${w * 0.16}" height="${h * 0.12}" rx="2" fill="${AMBER_500}"/>` +
        `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="4" fill="none" stroke="${AMBER_500}" stroke-width="3"/><rect x="${x - 9.5}" y="${y - 30}" width="${Math.max(84, w * 0.7)}" height="22" rx="4" fill="${AMBER_500}"/><text x="${x - 2}" y="${y - 14}" font-family="${FONT}" font-size="13" font-weight="700" fill="${INK_800}">#${id} ${conf}</text>`;
    };
    cena += carro(316, 116, 56, NEUTRAL_300, 31, "0.88");
    cena += carro(388, 158, 74, WHITE, 27, "0.91");
    cena += carro(196, 232, 112, INK_800, 24, "0.97");
    cena += carro(430, 274, 136, NEUTRAL_300, 22, "0.94");
    cena += `<path d="M40 324H708" stroke="${AMBER_500}" stroke-width="4" stroke-dasharray="14 10"/>`;
    const tela =
      abs(0, 0, SW, SH, "", svg(SW, SH, cena)) +
      abs(48, 18, null, null, "", row(8, dot(12, AMBER_500) + txt("00:42", 16, INK_800, 800))) +
      abs(640, 18, null, null, "", txt("30 fps", 14, INK_800, 800, "opacity:.7")) +
      abs(48, 340, null, 46, `background:${WHITE};border-radius:23px;display:flex;align-items:center;gap:14px;padding:0 18px;${sombra(0.2, 6, 12)}`, row(4, ic("arrowUp", 18, INK_600, 3) + txt("128", 18, INK_800, 800)) + row(4, ic("arrowDown", 18, AMBER_500, 3) + txt("96", 18, INK_800, 800)));
    const fluxo = serie(r, 12, 0.25, 0.95);
    const pts = pontos(fluxo, 0, 10, 212, 110);
    let grafico = "";
    for (let i = 0; i < 4; i++) grafico += `<path d="M0 ${10 + i * 37}H212" stroke="${NEUTRAL_300}" stroke-width="1.5" stroke-dasharray="4 5"/>`;
    grafico += `<path d="${smooth(pts)}L212 130L0 130Z" fill="${INK_50}"/><path d="${smooth(pts)}" fill="none" stroke="${AMBER_500}" stroke-width="4"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="6" fill="${WHITE}" stroke="${AMBER_500}" stroke-width="3"/>`;
    const etapa = (n, bg, c) => badgeIcon(n, 52, bg, c, 2.2);
    return {
      bg: INK_50,
      html:
        abs(60, 34, null, null, "", row(12, ic("camera", 34, INK_600, 2.2) + ln(200, INK_800, 20))) +
        phoneLand(60, 104, 780, 440, tela) +
        abs(880, 104, 260, 200, `background:${INK_800};border-radius:24px;padding:24px 26px`, ic("car", 40, AMBER_500, 2.2) + row(6, txt("342", 66, WHITE, 800, "letter-spacing:-2px") + txt("/h", 24, INK_50, 700, "opacity:.7;align-self:flex-end;margin-bottom:10px"), "margin-top:14px")) +
        abs(880, 324, 260, 220, `background:${WHITE};border-radius:24px;padding:20px 24px`, ln(110, INK_800, 12) + `<div style="margin-top:18px">${svg(212, 140, grafico)}</div>`) +
        abs(60, 574, 780, 60, "display:flex;align-items:center;gap:16px", etapa("camera", INK_800, WHITE) + ic("arrowR", 26, INK_600, 2.6) + etapa("grid", INK_600, WHITE) + ic("arrowR", 26, INK_600, 2.6) + etapa("car", AMBER_500, INK_800) + ic("arrowR", 26, INK_600, 2.6) + etapa("chart", WHITE, INK_600)),
    };
  },
};

// Ordem dos cases (a mesma da listagem do portfólio).
const SLUGS = [
  "painel-interativo-com-animacoes",
  "site-de-estudo-de-caso-de-ia",
  "seletores-de-produtos-para-varejo",
  "painel-de-qualidade-do-ar",
  "template-modular-para-site-de-marca",
  "widget-de-qualidade-do-ar",
  "app-android-para-placa-educativa",
  "sensores-em-epis-com-app",
  "controle-de-producao-com-contagem-automatica",
  "deteccao-de-descarga-estatica",
  "painel-de-testes-automatizados",
  "gestao-de-documentos-da-qualidade",
  "painel-de-controle-de-producao",
  "arquivos-de-auditoria-de-processos",
  "app-de-compra-de-gas",
  "app-do-revendedor-de-gas",
  "jogo-educativo-sobre-emocoes",
  "painel-para-pais-e-psicologos",
  "app-de-saude-com-vestiveis",
  "passagens-de-onibus-web-e-app",
  "app-de-alertas-de-seguranca",
  "portal-escola-professores-e-pais",
  "app-guia-turistico",
  "site-de-pre-lancamento-com-animacoes",
  "site-institucional-com-cms",
  "portal-de-noticias-de-tribunal",
  "jogo-multiplayer-de-arena",
  "jogo-de-plataforma-com-dois-herois",
  "app-de-contagem-de-veiculos",
];

// --- página --------------------------------------------------------------------

function pagina({ bg, html }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;background:${bg};font-family:${FONT};color:${INK_800};-webkit-font-smoothing:antialiased}
.a{position:absolute}
.ln{display:block;flex:none;border-radius:999px}
</style></head><body>${html}</body></html>`;
}

// --- execução ------------------------------------------------------------------

const faltando = SLUGS.filter((slug) => !COVERS[slug]);
if (faltando.length) throw new Error(`Capa sem desenho: ${faltando.join(", ")}`);

const browserInstance = await chromium.launch();
try {
  const context = await browserInstance.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  // Sem rede: a capa é só HTML/SVG inline; qualquer requisição seria engano.
  await context.route("**/*", (route) => route.abort());
  const page = await context.newPage();
  const grandes = [];
  for (const slug of SLUGS) {
    const cover = COVERS[slug](rng(slug));
    await page.setContent(pagina(cover), { waitUntil: "load" });
    const dir = join(OUT, slug);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "capa.png");
    await page.screenshot({ path: file, type: "png" });
    const { size } = statSync(file);
    if (size >= LIMITE_BYTES) grandes.push(`${slug} (${Math.round(size / 1024)} KB)`);
    console.log(`src/content/cases/_imagens/${slug}/capa.png  ${Math.round(size / 1024)} KB`);
  }
  if (grandes.length) {
    console.error(`Capas acima de ${LIMITE_BYTES / 1024} KB: ${grandes.join(", ")}`);
    process.exitCode = 1;
  }
} finally {
  await browserInstance.close();
}
