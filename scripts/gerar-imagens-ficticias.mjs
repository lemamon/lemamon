#!/usr/bin/env node
// Gera as imagens e a mídia da CAMADA FICTÍCIA em dados/ficticio/ (avatares
// com iniciais, logos de empresas de exemplo, capas/telas de case, capas de
// post, o pôster e o vídeo curto do depoimento em vídeo e as legendas). Nada
// aqui é foto, voz ou marca real: são desenhos gerados, todos com "EXEMPLO"
// visível.
//
// Uso: node scripts/gerar-imagens-ficticias.mjs
// Sem dependências para as imagens: SVG é texto e o PNG é montado à mão (zlib
// do Node). Cada imagem tem desenho PRÓPRIO (nenhuma é cópia byte a byte de
// outra: o Astro deduplica arquivos iguais e a og:image de um case sairia com
// o nome do arquivo de outro). O vídeo (.mp4, alguns segundos do pôster
// parado) é codificado pelo ffmpeg, se estiver instalado; sem ele, o script
// avisa e mantém o vídeo que já existe.
// Tudo só entra no site com PUBLIC_DADOS_FICTICIOS=true fora de produção
// (docs/playbooks/00-DADOS-DO-DONO.md, "Camada fictícia").
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dados", "ficticio", "imagens");
const OUT_VIDEO = join(ROOT, "dados", "ficticio", "videos");
mkdirSync(OUT, { recursive: true });
mkdirSync(OUT_VIDEO, { recursive: true });

// Paleta da marca (mesmos valores de src/styles/tokens.css; imagem não lê CSS).
const INK_800 = "#18216d";
const INK_600 = "#2f3f9e";
const INK_50 = "#eef1fb";
const AMBER_500 = "#f59e0b";
const NEUTRAL_100 = "#f1f3f6";
const NEUTRAL_300 = "#cfd5de";
const WHITE = "#ffffff";

// --- avatares (4:5, como o card do time) ------------------------------------
function avatar(initials, background) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" role="img" aria-label="Avatar de exemplo ${initials}">
  <rect width="400" height="500" fill="${background}"/>
  <circle cx="200" cy="210" r="120" fill="${WHITE}" fill-opacity="0.14"/>
  <text x="200" y="250" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700" fill="${WHITE}">${initials}</text>
  <rect x="0" y="420" width="400" height="80" fill="${AMBER_500}"/>
  <text x="200" y="472" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="6" fill="${INK_800}">EXEMPLO</text>
</svg>
`;
}

// --- logos (monocromáticos, wordmark + forma) -------------------------------
const SHAPES = {
  circle: `<circle cx="32" cy="32" r="20" fill="currentColor"/>`,
  square: `<rect x="14" y="14" width="36" height="36" rx="6" fill="currentColor"/>`,
  triangle: `<path d="M32 12 L54 52 L10 52 Z" fill="currentColor"/>`,
  diamond: `<path d="M32 10 L54 32 L32 54 L10 32 Z" fill="currentColor"/>`,
  ring: `<circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="8"/>`,
};

function logo(name, shape) {
  const width = 64 + name.length * 15;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="64" viewBox="0 0 ${width} 64" role="img" aria-label="${name} (logo de exemplo)" style="color:${INK_800}">
  ${SHAPES[shape]}
  <text x="64" y="41" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="700" fill="currentColor">${name}</text>
</svg>
`;
}

// --- PNG à mão: RGB 8 bits, sem dependência ---------------------------------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}
const hex = (color) => [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));

class Canvas {
  constructor(width, height, background) {
    this.width = width;
    this.height = height;
    this.pixels = Buffer.alloc(width * height * 3);
    this.rect(0, 0, width, height, background);
  }
  rect(x, y, w, h, color) {
    const [r, g, b] = hex(color);
    for (let yy = Math.max(0, y); yy < Math.min(this.height, y + h); yy++) {
      for (let xx = Math.max(0, x); xx < Math.min(this.width, x + w); xx++) {
        const i = (yy * this.width + xx) * 3;
        this.pixels[i] = r;
        this.pixels[i + 1] = g;
        this.pixels[i + 2] = b;
      }
    }
  }
  /** Texto em fonte de bitmap 5×7 (só as letras usadas). */
  text(word, x, y, scale, color) {
    let cursor = x;
    for (const letter of word) {
      const glyph = GLYPHS[letter];
      glyph.forEach((row, gy) => {
        [...row].forEach((bit, gx) => {
          if (bit === "1") this.rect(cursor + gx * scale, y + gy * scale, scale, scale, color);
        });
      });
      cursor += 6 * scale;
    }
  }
  png() {
    const raw = Buffer.alloc((this.width * 3 + 1) * this.height);
    for (let y = 0; y < this.height; y++) {
      raw[y * (this.width * 3 + 1)] = 0;
      this.pixels.copy(raw, y * (this.width * 3 + 1) + 1, y * this.width * 3, (y + 1) * this.width * 3);
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(this.width, 0);
    header.writeUInt32BE(this.height, 4);
    header.writeUInt8(8, 8);
    header.writeUInt8(2, 9);
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", header),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]);
  }
}

const GLYPHS = {
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
};

/** Tela de sistema estilizada (blocos), com a faixa "EXEMPLO". */
function screen(variant) {
  const canvas = new Canvas(1200, 675, NEUTRAL_100);
  canvas.rect(0, 0, 1200, 72, INK_800);
  canvas.rect(32, 24, 140, 24, INK_600);
  canvas.rect(1040, 22, 128, 28, AMBER_500);
  canvas.rect(0, 72, 240, 603, WHITE);
  for (let i = 0; i < 6; i++) canvas.rect(32, 112 + i * 56, 176, 20, i === 1 ? INK_600 : NEUTRAL_300);
  if (variant === "tabela") {
    for (let i = 0; i < 3; i++) {
      canvas.rect(280 + i * 300, 112, 276, 120, WHITE);
      canvas.rect(304 + i * 300, 136, 120, 20, NEUTRAL_300);
      canvas.rect(304 + i * 300, 172, 180, 36, i === 0 ? AMBER_500 : INK_600);
    }
    canvas.rect(280, 264, 876, 300, WHITE);
    for (let i = 0; i < 6; i++) canvas.rect(304, 292 + i * 44, 828, 24, i % 2 ? INK_50 : NEUTRAL_100);
  } else if (variant === "mapa") {
    // Mapa de rotas: quarteirões, ruas e paradas.
    canvas.rect(280, 112, 600, 452, INK_50);
    for (let i = 0; i < 4; i++) canvas.rect(280, 150 + i * 110, 600, 14, WHITE);
    for (let i = 0; i < 5; i++) canvas.rect(320 + i * 130, 112, 14, 452, WHITE);
    for (const [x, y] of [[360, 190], [500, 300], [640, 410], [760, 230]]) canvas.rect(x, y, 28, 28, AMBER_500);
    canvas.rect(912, 112, 256, 452, WHITE);
    for (let i = 0; i < 5; i++) {
      canvas.rect(936, 140 + i * 84, 40, 40, i === 0 ? AMBER_500 : INK_600);
      canvas.rect(992, 148 + i * 84, 152, 24, NEUTRAL_300);
    }
  } else if (variant === "lista") {
    // Lista do dia: linhas com marcador, texto e situação.
    for (let i = 0; i < 7; i++) {
      canvas.rect(280, 112 + i * 66, 888, 54, i === 0 ? INK_50 : WHITE);
      canvas.rect(300, 124 + i * 66, 30, 30, i % 3 === 0 ? AMBER_500 : INK_600);
      canvas.rect(350, 128 + i * 66, 300 + (i % 3) * 80, 22, NEUTRAL_300);
      canvas.rect(1040, 126 + i * 66, 108, 26, i % 2 ? INK_600 : NEUTRAL_300);
    }
  } else {
    for (let i = 0; i < 3; i++) {
      canvas.rect(300 + i * 290, 112, 250, 452, WHITE);
      canvas.rect(324 + i * 290, 136, 202, 240, i === 2 ? AMBER_500 : INK_50);
      canvas.rect(324 + i * 290, 400, 160, 20, NEUTRAL_300);
      canvas.rect(324 + i * 290, 436, 202, 40, INK_600);
    }
  }
  canvas.rect(0, 590, 1200, 85, AMBER_500);
  canvas.text("EXEMPLO", 432, 604, 8, INK_800);
  return canvas.png();
}

/**
 * Textura de pontos em posições pseudoaleatórias (semente fixa: o arquivo sai
 * igual a cada execução). Sem ela, uma imagem de blocos lisos comprime tanto
 * que sobra pouco byte "variado" para a trava reconhecer uma cópia.
 */
function texture(canvas, area, seed) {
  let state = seed >>> 0;
  const next = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const colors = [INK_800, INK_50, NEUTRAL_300, AMBER_500];
  for (let i = 0; i < 900; i++) {
    const x = area.x + Math.floor(next() * (area.w - 6));
    const y = area.y + Math.floor(next() * (area.h - 6));
    canvas.rect(x, y, 2 + Math.floor(next() * 5), 2 + Math.floor(next() * 5), colors[Math.floor(next() * colors.length)]);
  }
}

/**
 * Capa de post (1200×630, o tamanho da og:image): fundo da marca, um desenho
 * do tema e a faixa "EXEMPLO". Uma por post, todas diferentes.
 */
function postCover(theme) {
  const canvas = new Canvas(1200, 630, INK_800);
  canvas.rect(64, 64, 520, 28, INK_600);
  canvas.rect(64, 116, 420, 28, INK_600);
  canvas.rect(64, 168, 300, 28, INK_600);
  // Textura de pontos espalhados (semente própria por capa): dá corpo à imagem e a deixa única.
  texture(canvas, { x: 64, y: 240, w: 500, h: 260 }, { integrar: 11, planilha: 23, "primeira-versao": 37 }[theme] ?? 5);
  if (theme === "integrar") {
    // Dois sistemas ligados por uma ponte.
    canvas.rect(640, 120, 200, 300, INK_50);
    canvas.rect(960, 120, 200, 300, INK_50);
    canvas.rect(840, 250, 120, 40, AMBER_500);
    for (let i = 0; i < 4; i++) {
      canvas.rect(664, 148 + i * 64, 152, 28, NEUTRAL_300);
      canvas.rect(984, 148 + i * 64, 152, 28, NEUTRAL_300);
    }
  } else if (theme === "planilha") {
    // Grade de planilha virando tela.
    canvas.rect(620, 96, 520, 360, WHITE);
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) canvas.rect(636 + c * 126, 112 + r * 56, 118, 48, (r + c) % 2 ? NEUTRAL_100 : INK_50);
    }
    canvas.rect(636, 112, 496, 48, AMBER_500);
  } else {
    // Primeira versão: degraus crescentes.
    for (let i = 0; i < 4; i++) canvas.rect(640 + i * 130, 400 - i * 90, 110, 60 + i * 90, i === 3 ? AMBER_500 : INK_50);
  }
  canvas.rect(0, 530, 1200, 100, AMBER_500);
  canvas.text("EXEMPLO", 432, 552, 8, INK_800);
  return canvas.png();
}

/** Pôster do depoimento em vídeo (16:9): silhueta e a faixa "EXEMPLO". */
function videoPoster() {
  const canvas = new Canvas(640, 360, INK_600);
  texture(canvas, { x: 0, y: 0, w: 640, h: 300 }, 53);
  canvas.rect(260, 70, 120, 120, INK_50);
  canvas.rect(200, 200, 240, 110, INK_50);
  canvas.rect(0, 300, 640, 60, AMBER_500);
  canvas.text("EXEMPLO", 194, 312, 6, INK_800);
  return canvas.png();
}

const files = {
  "pessoa-ana-exemplo.svg": avatar("AE", INK_800),
  "pessoa-bruno-exemplo.svg": avatar("BE", INK_600),
  "depoimento-carla-exemplo.svg": avatar("CE", INK_600),
  "logo-transportadora-exemplo.svg": logo("Transportadora Exemplo", "triangle"),
  "logo-clinica-exemplo.svg": logo("Clínica Exemplo", "circle"),
  "logo-industria-exemplo.svg": logo("Indústria Exemplo", "square"),
  "logo-cooperativa-exemplo.svg": logo("Cooperativa Exemplo", "ring"),
  "logo-escola-exemplo.svg": logo("Escola Exemplo", "diamond"),
  "capa-exemplo-sistema-de-fretes.png": screen("tabela"),
  "tela-exemplo-sistema-de-fretes.png": screen("mapa"),
  "capa-exemplo-app-de-vistorias.png": screen("cards"),
  "tela-exemplo-app-de-vistorias.png": screen("lista"),
  "capa-exemplo-integrar-sistemas.png": postCover("integrar"),
  "capa-exemplo-planilha-ou-sistema.png": postCover("planilha"),
  "capa-exemplo-primeira-versao-do-produto.png": postCover("primeira-versao"),
  "poster-depoimento-carla-exemplo.png": videoPoster(),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, name), content);
  console.log(`dados/ficticio/imagens/${name}`);
}

// --- depoimento em vídeo: legendas (WebVTT) e o vídeo curto ------------------
const CAPTIONS = {
  pt: ["Depoimento de exemplo: vídeo fictício, só para revisar o layout.", "Nenhuma pessoa real gravou este vídeo."],
  en: ["Sample testimonial: fictitious video, only to review the layout.", "No real person recorded this video."],
  es: ["Testimonio de ejemplo: video ficticio, solo para revisar el diseño.", "Ninguna persona real grabó este video."],
};
for (const [lang, [first, second]] of Object.entries(CAPTIONS)) {
  const name = `depoimento-carla-exemplo.${lang}.vtt`;
  writeFileSync(join(OUT_VIDEO, name), `WEBVTT\n\n00:00.000 --> 00:01.500\n${first}\n\n00:01.500 --> 00:03.000\n${second}\n`);
  console.log(`dados/ficticio/videos/${name}`);
}

const VIDEO = join(OUT_VIDEO, "depoimento-carla-exemplo.mp4");
const ffmpeg = spawnSync(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-loop", "1", "-i", join(OUT, "poster-depoimento-carla-exemplo.png"),
    "-t", "3", "-r", "10",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "36", "-movflags", "+faststart", "-an",
    VIDEO,
  ],
  { stdio: "inherit" },
);
if (ffmpeg.error || ffmpeg.status !== 0) {
  console.warn("ffmpeg indisponível ou com erro: dados/ficticio/videos/depoimento-carla-exemplo.mp4 NÃO foi regerado (o que já existe continua).");
} else {
  console.log("dados/ficticio/videos/depoimento-carla-exemplo.mp4");
}
