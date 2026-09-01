#!/usr/bin/env bash
# Build a variant and screenshot all pages in light + dark.
# Usage: capture.sh <variant-name>
set -euo pipefail
VARIANT="${1:-baseline}"
DOCSITE="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$DOCSITE/.." && pwd)"

bash "$DOCSITE/experiments/build-only.sh" "$VARIANT"

mkdir -p "$ROOT/screenshots/$VARIANT"
for PAGE in index about bread sage nufor now; do
  URL="http://127.0.0.1:8081/$PAGE.html"
  python3 "$DOCSITE/experiments/shot.py" "$URL" "$ROOT/screenshots/$VARIANT/${PAGE}-light.png" 9222
  python3 "$DOCSITE/experiments/shot.py" "$URL" "$ROOT/screenshots/$VARIANT/${PAGE}-dark.png" 9222 dark
done
echo "captured $VARIANT"