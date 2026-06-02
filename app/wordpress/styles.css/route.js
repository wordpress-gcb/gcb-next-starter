/**
 * Stable URL for WordPress (and anything else) to consume the component
 * server's CSS bundle.
 *
 *   GET /wordpress/styles.css
 *
 * Reads Next.js's build manifest, finds EVERY CSS asset the layout uses,
 * and returns one stylesheet that @imports them all in order. The plugin
 * only needs to know this one URL — the indirection handles the
 * fingerprint churn that happens on every prod build AND the fact that
 * Next.js splits each `import './x.css'` into its own chunk.
 *
 * Why not a redirect to a single file (previous behaviour): the layout
 * imports bootstrap.min.css + saas-scss/app.scss + globals.css. Next.js
 * splits each into its own fingerprinted chunk. A 302 to the first one
 * meant 2/3 of the styles never reached the editor.
 *
 * If the manifest isn't available yet (very first dev start, before any
 * page has been requested), fall back to the known unfingerprinted dev
 * path.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const FALLBACK_BODY = '@import url("/_next/static/css/app/layout.css");\n';

export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), '.next', 'app-build-manifest.json');
    const raw = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    const layoutAssets = manifest?.pages?.['/layout'] || [];
    const cssChunks = layoutAssets
      .filter((p) => p.endsWith('.css'))
      .map((p) => '/_next/' + p.replace(/^\//, ''));

    if (cssChunks.length === 0) {
      return new Response(FALLBACK_BODY, {
        status: 200,
        headers: {
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Concatenate every layout CSS chunk via @import directives. The
    // editor's <link rel="stylesheet"> then transparently picks up all
    // of bootstrap + abstrak + globals.
    const body = cssChunks.map((p) => `@import url("${p}");`).join('\n') + '\n';

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        // Manifest changes per build; don't let browser hold a stale
        // import list across deploys.
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(FALLBACK_BODY, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}
