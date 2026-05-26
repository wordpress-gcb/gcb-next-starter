/**
 * Resolve an `/images/...` path.
 *
 * SERVER side (Vercel SSR + the /wordpress/render route): returns the
 * path unchanged. The PHP-side gcb-lite plugin runs a URL rewriter on
 * any HTML it gets back from the component server — it has the
 * authoritative knowledge of which origin to prefix with, and rewrites
 * relative paths there. Doing it server-side here would either
 * double-rewrite or land on the wrong origin (e.g. Vercel preview URL
 * instead of the canonical domain).
 *
 * BROWSER side: only used by the legacy PHP-variant WP theme bundle,
 * which sets window.__GCB_IMAGE_BASE__ to the theme's bundled
 * /assets/images dir. That bundle hydrates inside the browser, so the
 * rewrite has to happen client-side.
 */

export function img(path) {
  if (!path) return path;
  if (/^[a-z]+:/i.test(path) || path.startsWith('//') || path.startsWith('data:')) {
    return path;
  }

  // Server-side: do nothing. PHP-side handles it.
  if (typeof window === 'undefined') {
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

