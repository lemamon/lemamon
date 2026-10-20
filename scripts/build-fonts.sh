#!/usr/bin/env bash
# Regenera as fontes woff2 do site a partir dos TTF originais (dono: home).
# Subset latin + latin-ext (ç, ã, õ, ñ, ¿, ¡, aspas curvas, travessões, …).
# Requer fonttools + brotli: python3 -m venv .venv-fonts && .venv-fonts/bin/pip install fonttools brotli
# Uso: PYFTSUBSET=.venv-fonts/bin/pyftsubset scripts/build-fonts.sh
set -euo pipefail
cd "$(dirname "$0")/.."
PYFTSUBSET="${PYFTSUBSET:-pyftsubset}"
UNICODES="U+0000-00FF,U+0100-017F,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212"
for weight in Light Bold; do
  lower=$(echo "$weight" | tr '[:upper:]' '[:lower:]')
  "$PYFTSUBSET" "src/assets/fonts/source/Motiva-Sans-$weight.ttf" \
    --unicodes="$UNICODES" \
    --layout-features='kern,liga,calt,locl' \
    --flavor=woff2 \
    --output-file="src/assets/fonts/motiva-sans-$lower.woff2"
done
ls -l src/assets/fonts/*.woff2
