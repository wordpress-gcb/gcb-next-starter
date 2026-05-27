#!/usr/bin/env bash
#
# Sync plugin-owned doc sources into the Next.js content/ dir so the
# docs renderer can read them at build time. Single source of truth
# lives in the plugin at ../gcblitewp/.../schemas/{controls,concepts}/.
#
# Run before `next build` and on demand during dev (`npm run sync:docs`).
#
# Override the source with --plugin=PATH if your local layout differs.

set -euo pipefail

# Default: assume the plugin sits in the WordPress install next to this
# repo (~/sites/gcblitewp/wp-content/plugins/gcb-lite). Override if not.
DEFAULT_PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/gcblitewp/wp-content/plugins/gcb-lite"
PLUGIN_DIR="$DEFAULT_PLUGIN_DIR"

for arg in "$@"; do
    case "$arg" in
        --plugin=*) PLUGIN_DIR="${arg#--plugin=}" ;;
        --help|-h)  sed -n '3,15p' "${BASH_SOURCE[0]}"; exit 0 ;;
        *) echo "Unknown arg: $arg" >&2; exit 1 ;;
    esac
done

SOURCE="$PLUGIN_DIR/schemas"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/content"

if [ ! -d "$SOURCE" ]; then
    echo "WARN: docs source not found at $SOURCE — skipping sync." >&2
    echo "      Set --plugin=PATH or check the plugin layout." >&2
    # Don't fail the build; the renderer treats a missing content dir
    # as "no docs yet" rather than crashing.
    exit 0
fi

mkdir -p "$DEST"
rsync -a --delete \
    --exclude='README.md' \
    --include='*/' \
    --include='*.md' \
    --include='*.json' \
    --exclude='*' \
    "$SOURCE/" "$DEST/"

# Belt + braces: even if a README slips through, strip it. The
# README files are contributor-facing; they're not routable docs.
find "$DEST" -name 'README.md' -delete 2>/dev/null || true

echo "✓ Synced docs: $SOURCE → $DEST"
