#!/bin/bash
# Копирует Euclid Circular A из локальной папки в public/fonts
# Запуск: ./scripts/copy-fonts.sh (из корня проекта)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SRC="$PROJECT_DIR/../Euclid Circular A (1)/Euclid Circular A pack/web files"
DST="$PROJECT_DIR/public/fonts"
mkdir -p "$DST"
for f in EuclidCircularA-Regular-WebM.woff2 EuclidCircularA-Regular-WebS.woff2 EuclidCircularA-Regular-WebXL.woff2 EuclidCircularA-Medium-WebM.woff2 EuclidCircularA-Semibold-WebM.woff2 EuclidCircularA-Semibold-WebS.woff2; do
  if [ -f "$SRC/$f" ]; then cp "$SRC/$f" "$DST/" && echo "Copied $f"; fi
done
echo "Fonts in $DST:" && ls -la "$DST" 2>/dev/null || echo "No fonts copied - run from Tracks_Land directory"
