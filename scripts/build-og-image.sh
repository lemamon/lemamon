#!/usr/bin/env bash
# Social cards (og:image / twitter:image) and brand icons, generated from the
# copy in src/i18n — owner: shell. Run it after changing any of these keys:
#   meta.default_og_image_text.*            default card, one per language
#   {page}.og_image_headline                per-page cards (see PAGES below and
#                                           OG_PAGE_HEADLINE in src/components/shell/seo.ts)
#   shared.method_timeline.stages.*.name    the 4-step method rail on every card
#
# Outputs (all committed):
#   public/assets/img/og/<page>-<locale>.jpg   1200x630 JPEG, ~60 kB each
#   public/assets/img/og-image.svg             editable preview of the pt default card
#   public/favicon.svg · favicon.ico · apple-touch-icon.png · icon-192.png ·
#   icon-512.png · icon-maskable-512.png       brand mark ({L} on ink-800)
#
# Composition (i18n _notes.og_image): brand, headline and support line inside
# the central ~630x630 safe area (WhatsApp crops a centred square in the compact
# preview); headline in at most 3 lines; audience line and the method rail sit
# outside the safe area and may be cropped without losing the message.
#
# macOS only: QuickLook (qlmanage) rasterises the SVGs with the Motiva Sans
# TTFs embedded (src/assets/fonts/source), sips crops and encodes. qlmanage
# normalises to a square canvas, so each card is rendered on 1200x1200 with the
# artwork in the centred 630px band (y 285..915) and cropped back.
set -euo pipefail

cd "$(dirname "$0")/.."

OUT_OG="public/assets/img/og"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT_OG" "$TMP/svg" "$TMP/png" "$TMP/icons"

node --input-type=module - "$TMP" <<'NODE'
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TMP = process.argv[2];
const LOCALES = ["pt", "en", "es"];
const copy = Object.fromEntries(LOCALES.map((l) => [l, JSON.parse(readFileSync(`src/i18n/${l}.json`, "utf8"))]));
const get = (obj, path) => path.split(".").reduce((node, key) => node?.[key], obj);

/* Page cards: route key (src/config/routes.ts) -> i18n key of the headline. Keep in sync with seo.ts. */
const PAGES = {
  how_we_work: "how_we_work.og_image_headline",
  discovery_sprint: "discovery_sprint.og_image_headline",
  pricing: "pricing.og_image_headline",
  service_web_systems: "services.web_systems.og_image_headline",
  service_mobile_apps: "services.mobile_apps.og_image_headline",
  service_integrations: "services.integrations.og_image_headline",
  service_mvp: "services.mvp.og_image_headline",
  service_support: "services.support.og_image_headline",
};
/* Step highlighted on the rail (0 = diagnosis, "start here"). */
const HIGHLIGHT = { discovery_sprint: 1, service_support: 3 };

/* Palette = primitives of src/styles/tokens.css. */
const C = {
  bg: "#111845", // ink-900
  brand: "#18216d", // ink-800
  rule: "#ffffff",
  text: "#ffffff",
  muted: "#cbd2e0", // neutral-300
  faint: "#9aa4bb", // neutral-400
  amber: "#fbbf24", // amber-400
  amberSoft: "#fcd34d", // amber-300
};

const FONT_BOLD = "src/assets/fonts/source/Motiva-Sans-Bold.ttf";
const FONT_LIGHT = "src/assets/fonts/source/Motiva-Sans-Light.ttf";

/* Text measurement with the real font (fontkitten ships with Astro); rough fallback otherwise. */
let measure = (text, size) => text.length * size * 0.56;
try {
  const { create } = await import("fontkitten");
  const fonts = { 700: create(readFileSync(FONT_BOLD)), 300: create(readFileSync(FONT_LIGHT)) };
  measure = (text, size, weight = 700) => {
    const font = fonts[weight];
    const units = [...text].reduce((sum, ch) => sum + font.glyphForCodePoint(ch.codePointAt(0)).advanceWidth, 0);
    return (units / font.unitsPerEm) * size;
  };
} catch {
  console.warn("fontkitten not found: using approximate text widths");
}

function wrap(text, size, maxWidth, weight = 700) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size, weight) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FAMILY = `'Motiva Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif`;

/* {L} mark: braces + L, the brand mark carried over from the old logo (red L → amber). */
function mark(x, y, size, { radius = 14, fullBleed = false, scale = 1 } = {}) {
  const s = size / 64;
  const inner = `
    <g transform="translate(32 32) scale(${scale}) translate(-32 -32)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 14c-5 0-6 3-6 7v5c0 3-2 6-5 6 3 0 5 3 5 6v5c0 4 1 7 6 7" stroke="${C.text}" stroke-width="3.6"/>
      <path d="M43 14c5 0 6 3 6 7v5c0 3 2 6 5 6-3 0-5 3-5 6v5c0 4-1 7-6 7" stroke="${C.text}" stroke-width="3.6"/>
      <path d="M27 20v24h11" stroke="${C.amber}" stroke-width="5.4" stroke-linecap="square" stroke-linejoin="miter"/>
    </g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect width="64" height="64" rx="${fullBleed ? 0 : radius}" fill="${C.brand}"/>${inner}
  </g>`;
}

function card(locale, page) {
  const t = copy[locale];
  const og = t.meta.default_og_image_text;
  const headline = page ? get(t, PAGES[page]) : og.headline;
  if (!headline) throw new Error(`missing headline for ${page} (${locale})`);
  const highlight = HIGHLIGHT[page] ?? 0;
  const stages = Object.values(t.shared.method_timeline.stages).map((stage) => stage.name);

  // Safe area: x 285..915. Text block is left-aligned inside it.
  const X = 300;
  const MAX = 600;
  let size = 64;
  let lines = wrap(headline, size, MAX);
  while ((lines.length > 3 || lines.some((l) => measure(l, size) > MAX)) && size > 40) {
    size -= 2;
    lines = wrap(headline, size, MAX);
  }
  const lead = Math.round(size * 1.12);

  const [brandName, ...rest] = og.brand.split(".");
  const brandTld = rest.length ? `.${rest.join(".")}` : "";
  // Brand, headline and support line, then centred vertically on the card (the
  // mark in the left band follows the brand line).
  const layout = (shift) => ({ brandY: 132 + shift, headTop: 236 + shift });
  const draft = layout(0);
  const draftSupport = Math.max(draft.headTop + (lines.length - 1) * lead + 72, 420);
  const shift = Math.max(0, Math.round(315 - (draft.brandY - 30 + draftSupport) / 2));
  const { brandY, headTop } = layout(shift);
  const supportY = draftSupport + shift;

  const headlineSvg = lines
    .map((line, i) => `<text x="${X}" y="${headTop + i * lead}" font-size="${size}" font-weight="700" fill="${C.text}" letter-spacing="-0.5">${esc(line)}</text>`)
    .join("\n    ");

  // Method rail (right band, x 915..1200).
  const railX = 952;
  const nameX = 976;
  const nameMax = 1200 - nameX - 36;
  const nameSize = 19;
  const nameLead = 24;
  const items = stages.map((name) => wrap(name, nameSize, nameMax));
  const gap = 30;
  const railHeight = items.reduce((h, l) => h + l.length * nameLead, 0) + gap * (items.length - 1);
  let y = Math.round((630 - railHeight) / 2) + 16;
  const dots = [];
  const names = [];
  items.forEach((nameLines, i) => {
    const on = i === highlight;
    dots.push({ y: y - 6, on });
    nameLines.forEach((line, j) => {
      names.push(`<text x="${nameX}" y="${y + j * nameLead}" font-size="${nameSize}" font-weight="${on ? 700 : 300}" fill="${on ? C.text : C.muted}">${esc(line)}</text>`);
    });
    y += nameLines.length * nameLead + gap;
  });
  const railSvg = `
    <line x1="${railX}" y1="${dots[0].y}" x2="${railX}" y2="${dots[dots.length - 1].y}" stroke="${C.faint}" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>
    ${dots
      .map((d, i) =>
        d.on
          ? `<circle cx="${railX}" cy="${d.y}" r="9" fill="${C.amber}"/><text x="${railX}" y="${d.y + 4.5}" font-size="12" font-weight="700" fill="${C.bg}" text-anchor="middle">${i + 1}</text>`
          : `<circle cx="${railX}" cy="${d.y}" r="9" fill="${C.bg}" stroke="${C.faint}" stroke-width="2"/><text x="${railX}" y="${d.y + 4.5}" font-size="11" font-weight="700" fill="${C.muted}" text-anchor="middle">${i + 1}</text>`,
      )
      .join("\n    ")}
    ${names.join("\n    ")}`;

  const [aud1, ...aud2] = og.audience_line.split(" · ");
  const audience = [aud1, aud2.join(" · ")].filter(Boolean);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="${FAMILY}">
  <rect width="1200" height="630" fill="${C.bg}"/>
  <g stroke="${C.rule}" stroke-opacity="0.08" stroke-width="1">
    <line x1="285.5" y1="0" x2="285.5" y2="630"/>
    <line x1="915.5" y1="0" x2="915.5" y2="630"/>
    <line x1="0" y1="72.5" x2="1200" y2="72.5"/>
    <line x1="0" y1="557.5" x2="1200" y2="557.5"/>
  </g>
  ${mark(64, brandY - 28, 88)}
  <text x="${X}" y="${brandY}" font-size="30" font-weight="700" fill="${C.text}">${esc(brandName)}<tspan fill="${C.amber}">${esc(brandTld)}</tspan></text>
  ${headlineSvg}
  <rect x="${X}" y="${supportY - 24}" width="12" height="30" fill="${C.amber}"/>
  <text x="${X + 26}" y="${supportY}" font-size="27" font-weight="700" fill="${C.amberSoft}">${esc(og.support_line)}</text>
  ${audience.map((line, i) => `<text x="64" y="${520 + i * 28}" font-size="19" font-weight="300" fill="${C.muted}">${esc(line)}</text>`).join("\n  ")}
  ${railSvg}
</svg>
`;
}

const fontCss = () => {
  const b64 = (file) => readFileSync(file).toString("base64");
  return `<style>
@font-face { font-family: 'Motiva Sans'; font-weight: 700; src: url(data:font/ttf;base64,${b64(FONT_BOLD)}) format('truetype'); }
@font-face { font-family: 'Motiva Sans'; font-weight: 300; src: url(data:font/ttf;base64,${b64(FONT_LIGHT)}) format('truetype'); }
</style>`;
};
const css = fontCss();

/* Square 1200x1200 canvas for qlmanage, artwork in the centred band. */
const forRaster = (svg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">${css}<rect width="1200" height="1200" fill="${C.bg}"/><g transform="translate(0 285)">${svg.replace(/^<svg[^>]*>/, "<g>").replace(/<\/svg>\s*$/, "</g>").replace("<g>", `<g font-family="${FAMILY}">`)}</g></svg>`;

const names = [];
for (const locale of LOCALES) {
  for (const page of [null, ...Object.keys(PAGES)]) {
    const name = `${page ?? "default"}-${locale}`;
    const svg = card(locale, page);
    writeFileSync(join(TMP, "svg", `${name}.svg`), forRaster(svg));
    names.push(name);
    if (!page && locale === "pt") {
      writeFileSync(
        "public/assets/img/og-image.svg",
        `<!--\n  Preview of public/assets/img/og/default-pt.jpg (og:image, 1200x630).\n  GENERATED by scripts/build-og-image.sh from src/i18n: edit the copy or the script, not this file.\n-->\n${svg}`,
      );
    }
  }
}
writeFileSync(join(TMP, "cards.txt"), names.join("\n") + "\n");

/* Brand icons. */
const icon = (size, opts) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${mark(0, 0, size, opts)}</svg>`;
writeFileSync("public/favicon.svg", icon(64, { radius: 14 }) + "\n");
writeFileSync(join(TMP, "icons", "rounded.svg"), icon(1024, { radius: 14 }));
writeFileSync(join(TMP, "icons", "bleed.svg"), icon(1024, { fullBleed: true }));
writeFileSync(join(TMP, "icons", "maskable.svg"), icon(1024, { fullBleed: true, scale: 0.78 }));
NODE

# --- Social cards -----------------------------------------------------------
qlmanage -t -s 1200 -o "$TMP/png" "$TMP"/svg/*.svg >/dev/null 2>&1
rm -f "$OUT_OG"/*.jpg
while read -r name; do
  [ -n "$name" ] || continue
  raster="$TMP/png/$name.svg.png"
  [ -f "$raster" ] || { echo "qlmanage produced no output for $name" >&2; exit 1; }
  sips -c 630 1200 "$raster" >/dev/null
  sips -s format jpeg -s formatOptions 82 "$raster" --out "$OUT_OG/$name.jpg" >/dev/null
done <"$TMP/cards.txt"

# --- Icons ------------------------------------------------------------------
qlmanage -t -s 1024 -o "$TMP/icons" "$TMP"/icons/*.svg >/dev/null 2>&1
resize() { # src size out
  cp "$TMP/icons/$1.svg.png" "$TMP/icons/tmp.png"
  sips -z "$2" "$2" "$TMP/icons/tmp.png" --out "$3" >/dev/null
}
resize rounded 512 public/icon-512.png
resize rounded 192 public/icon-192.png
resize maskable 512 public/icon-maskable-512.png
resize bleed 180 public/apple-touch-icon.png
for s in 16 32 48; do resize rounded "$s" "$TMP/icons/ico-$s.png"; done

# favicon.ico with PNG-compressed entries (16, 32, 48).
node --input-type=module - "$TMP/icons" <<'NODE'
import { readFileSync, writeFileSync } from "node:fs";
const dir = process.argv[2];
const sizes = [16, 32, 48];
const pngs = sizes.map((s) => readFileSync(`${dir}/ico-${s}.png`));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const at = 6 + 16 * i;
  header.writeUInt8(s, at);
  header.writeUInt8(s, at + 1);
  header.writeUInt8(0, at + 2);
  header.writeUInt8(0, at + 3);
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(pngs[i].length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += pngs[i].length;
});
writeFileSync("public/favicon.ico", Buffer.concat([header, ...pngs]));
NODE

echo "Wrote $(wc -l <"$TMP/cards.txt" | tr -d ' ') cards in $OUT_OG, public/assets/img/og-image.svg and the brand icons."
