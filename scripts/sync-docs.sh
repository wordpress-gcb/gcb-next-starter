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

# Local layout missing? Try the CI fallback: clone the plugin from
# GitHub into a temp dir and source from there. This is the path that
# fires on Vercel / any CI runner that doesn't have the WordPress
# install next door.
#
# The branch is configurable via GCBLITE_DOCS_REF (defaults to main)
# so a deploy can pin to a tag, branch, or commit if the local plugin
# checkout has drifted ahead of stable.
#
# Network failure here is FATAL — without docs the /docs route 404s
# and the renderer ships missing content. Better to break the build
# than ship a doc-less production deploy.
if [ ! -d "$SOURCE" ]; then
    DOCS_REF="${GCBLITE_DOCS_REF:-main}"
    DOCS_REPO="${GCBLITE_DOCS_REPO:-https://github.com/wordpress-gcb/gutenberg-control-blocks-lite.git}"
    CACHE="${TMPDIR:-/tmp}/gcblite-docs-$$"
    echo "→ docs source not found at $SOURCE — cloning $DOCS_REPO ($DOCS_REF) for CI sync." >&2

    # --depth=1 + sparse-checkout = clone JUST schemas/ instead of the
    # entire plugin history. Drops the cold clone to a couple hundred
    # KB / under 5s on a typical Vercel build.
    if ! git clone --quiet --depth=1 --filter=blob:none --sparse \
            --branch "$DOCS_REF" "$DOCS_REPO" "$CACHE" 2>&1; then
        echo "ERROR: failed to clone $DOCS_REPO for docs sync." >&2
        echo "       Set GCBLITE_DOCS_REPO / GCBLITE_DOCS_REF or fix the local plugin path." >&2
        rm -rf "$CACHE"
        exit 1
    fi
    (cd "$CACHE" && git sparse-checkout set --no-cone schemas >/dev/null 2>&1) || true

    if [ ! -d "$CACHE/schemas" ]; then
        echo "ERROR: schemas/ not found in cloned $DOCS_REPO@$DOCS_REF." >&2
        rm -rf "$CACHE"
        exit 1
    fi

    SOURCE="$CACHE/schemas"
    # Register cleanup so we don't leave the temp clone behind.
    trap 'rm -rf "$CACHE"' EXIT
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
