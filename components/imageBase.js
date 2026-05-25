/**
 * Resolve an `/images/...` path against an optional runtime image base.
 *
 * On Vercel the components render server-side, no global is set, so
 * paths return unchanged — they resolve against the Next.js public dir.
 *
 * In the WP theme bundle the theme's functions.php prints a tiny inline
 * script that sets `window.__GCB_IMAGE_BASE__` to the theme's
 * assets URI. Components then route `/images/foo.png` to
 * `{theme-uri}/assets/images/foo.png`.
 *
 * Components that previously hardcoded `/images/foo.png` should now
 * call `img('/images/foo.png')` to get a host-resolved URL.
 */

export function img(path) {
  if (!path) return path;
  // Already absolute (http://) or data: — leave alone.
  if (/^[a-z]+:/i.test(path) || path.startsWith('//') || path.startsWith('data:')) {
    return path;
  }
  // Browser: check the runtime override set by the WP theme.
  if (typeof window !== 'undefined' && typeof window.__GCB_IMAGE_BASE__ === 'string') {
    const base = window.__GCB_IMAGE_BASE__.replace(/\/+$/, '');
    // Path may be /images/foo.png — strip the leading /images and join.
    if (path.startsWith('/images/')) return base + path.slice('/images'.length);
    if (path.startsWith('/'))        return base + path;
    return base + '/' + path;
  }
  return path;
}
