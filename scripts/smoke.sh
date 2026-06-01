#!/usr/bin/env bash
#
# Smoke test — curl every route we don't want shipping broken,
# assert HTTP 200, fail with a useful message on the first miss.
#
# Runs after `next start` (in CI or locally). Designed to catch the
# class of bug that's been escaping local-only `npm run dev` testing:
#
#   - middleware imports a Node-only API → /wordpress/render/* 500s
#   - sync-docs.sh silently skipped → /docs and /docs/{slug} 404
#   - middleware secret mismatch → render routes 401
#   - notFound() called in a page when its data source is empty
#
# Each of those was a 30-second curl away from being caught at push
# time. This script is that curl.
#
# Usage:
#   BASE_URL=http://localhost:3000 scripts/smoke.sh
#   BASE_URL=http://localhost:3000 RENDER_SECRET=xyz scripts/smoke.sh
#
# Exit 0 on all pass, 1 on first failure. CI relies on the exit code.

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
RENDER_SECRET="${RENDER_SECRET:-}"

fail_count=0
pass_count=0

# Routes we expect 200 from on every push.
# Format: METHOD|PATH|EXPECTED_STATUS|[header=value]...
#   - METHOD: GET or POST. POST sends empty body.
#   - PATH:   appended to BASE_URL.
#   - EXPECTED_STATUS: 200 unless we care about something specific
#     (e.g. middleware auth → 401 without header).
#   - headers: extra request headers, space-separated.
#
# Add a route here every time a new public path ships. Cheap insurance.
ROUTES=(
  # Public-facing routes — these are the demo surfaces. If any of
  # these 4xx/5xx, the public site is degraded.
  "GET|/|200"
  "GET|/docs|200"
  "GET|/docs/quickstart|200"
  "GET|/docs/fields|200"
  "GET|/all-fields|200"

  # WP integration routes — render gated, styles/editor open.
  # See middleware.js for the auth split.
  "GET|/wordpress/styles.css|200"
  "GET|/wordpress/editor.css|200"

  # Revalidate route — refuses based on server-side env state:
  #   - REVALIDATE_SECRET unset → 503 "not configured"
  #   - REVALIDATE_SECRET set + no header → 401 "unauthorized"
  # Either is a healthy response: the endpoint exists, it didn't
  # crash, and the auth check is wired. Accept both as pass.
  "POST|/api/revalidate|401,503"
)

# /wordpress/render/* requires the render secret if RENDER_SECRET is
# set on the server. If we have the secret in env we test the happy
# path (200); without it we test that the middleware 401s.
if [ -n "$RENDER_SECRET" ]; then
  ROUTES+=("GET|/wordpress/render/saas-banner?attrs=%7B%7D|200|x-gcblite-render-secret=$RENDER_SECRET")
else
  # When the server-side RENDER_SECRET is also unset, middleware
  # short-circuits and the route returns 200. When it's set, we get
  # 401. We can't tell which from outside, so SKIP this assertion
  # unless the caller pinned RENDER_SECRET. Better to skip than
  # encode an ambiguous expectation.
  echo "→ RENDER_SECRET not set; skipping /wordpress/render/* auth assertion."
fi

echo "Smoke testing $BASE_URL"
echo "─────────────────────────────────────────────"

for route in "${ROUTES[@]}"; do
    IFS='|' read -r method path expected extra_headers <<< "$route"

    # Build curl args. -w prints the HTTP status code; -s -o silences
    # body; -X sets method; --max-time bails on hung routes.
    args=(-s -o /dev/null -w "%{http_code}" --max-time 10 -X "$method")

    # Parse extra headers. Format: "key1=val1 key2=val2".
    if [ -n "${extra_headers:-}" ]; then
        for hdr in $extra_headers; do
            key="${hdr%%=*}"
            val="${hdr#*=}"
            args+=(-H "$key: $val")
        done
    fi

    full_url="$BASE_URL$path"
    actual=$(curl "${args[@]}" "$full_url")

    # Expected can be a single code (200) or a comma-separated list
    # (401,503) for routes whose healthy response depends on env state
    # we can't predict here. Match if `actual` is anywhere in the list.
    is_match=0
    IFS=',' read -ra expected_list <<< "$expected"
    for exp in "${expected_list[@]}"; do
        if [ "$actual" = "$exp" ]; then
            is_match=1
            break
        fi
    done

    if [ "$is_match" -eq 1 ]; then
        printf "  \033[32m✓\033[0m %-6s %s → %s\n" "$method" "$path" "$actual"
        pass_count=$((pass_count + 1))
    else
        printf "  \033[31m✗\033[0m %-6s %s → got %s, expected %s\n" "$method" "$path" "$actual" "$expected"
        fail_count=$((fail_count + 1))
    fi
done

echo "─────────────────────────────────────────────"
echo "  $pass_count passed, $fail_count failed"

if [ "$fail_count" -gt 0 ]; then
    echo ""
    echo "Smoke failed. The build shipped at least one broken route."
    echo "Run \`npm run build && npm run start\` locally and reproduce."
    exit 1
fi

exit 0
