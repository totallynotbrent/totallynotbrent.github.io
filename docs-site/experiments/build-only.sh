#!/usr/bin/env bash
# Build one experiment variant into public/. No screenshots.
# Usage: build-only.sh <variant-name>
set -euo pipefail

VARIANT="${1:-baseline}"
DOCSITE="$(cd "$(dirname "$0")/.." && pwd)"
EXP="$DOCSITE/experiments/$VARIANT"

CONFIG="$EXP/config.yaml"
cp "$CONFIG" "$DOCSITE/quartz.config.yaml"

cd "$DOCSITE"
npx quartz build -d ../docs >/tmp/qbuild.log 2>&1 || { tail -30 /tmp/qbuild.log; exit 1; }
echo "built $VARIANT"