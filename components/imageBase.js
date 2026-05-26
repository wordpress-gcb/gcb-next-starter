/**
 * Resolve an `/images/...` path to an absolute URL.
 *
 * Three contexts to consider:
 *
 * 1. Vercel page rendering its own site (server-side React):
 *    No window, no base needed — Next.js serves /images/* from /public,
 *    same origin as the page. Path returned unchanged.
 *
 * 2. Vercel rendering an HTML fragment for a remote WP install
 *    (the /wordpress/render/[block] route, fired by gcb-lite's
 *    headless-variant theme):
 *    The HTML lands on wp-admin / public WP origin, where /images/foo.png
 *    DOES NOT exist. Must emit an absolute URL pointing back at the
 *    Vercel origin. Detected via VERCEL_URL or PUBLIC_BASE_URL env.
 *
 * 3. Browser running inside the WP theme bundle (PHP variant only —
 *    deprecated path, but still supported): window.__GCB_IMAGE_BASE__
 *    set by functions.php at the theme's bundled /assets/images dir.
 */

export function img(path) {
  if (!path) return path;
  if (/^[a-z]+:/i.test(path) || path.startsWith('//') || path.startsWith('data:')) {
    return path;
  }

  // Server-side render: prefer a configured public base URL so HTML
  // fragments emitted via /wordpress/render/[block] resolve back to
  // Vercel from wherever they land (Kinsta wp-admin, public WP frontend,
  // etc.). Falls back to the path unchanged if no base configured —
  // that's the "rendering own site" case.
  if (typeof window === 'undefined') {
    const base = serverBase();
    if (base) {
      if (path.startsWith('/')) return base + path;
      return base + '/' + path;
    }
    return path;
  }

  // Browser: legacy WP-theme override for the PHP-variant bundle.
  if (typeof window.__GCB_IMAGE_BASE__ === 'string') {
    const base = window.__GCB_IMAGE_BASE__.replace(/\/+$/, '');
    if (path.startsWith('/images/')) return base + path.slice('/images'.length);
    if (path.startsWith('/'))        return base + path;
    return base + '/' + path;
  }
  return path;
}

/**
 * Resolve the public origin for server-side rendering.
 *
 * Vercel sets VERCEL_URL automatically to the deployment URL (no scheme).
 * For preview deploys this is the per-build URL; for production it's the
 * canonical domain. NEXT_PUBLIC_BASE_URL overrides for self-hosted setups.
 *
 * Returns '' on local dev where neither is set — components fall back to
 * relative paths, which work fine when rendering for the local page.
 */
function serverBase() {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_URL;
  if (vercel) return 'https://' + vercel.replace(/\/+$/, '');

  return '';
}

