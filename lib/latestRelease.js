/**
 * Latest published GitHub release tag for the plugin, for the header badge.
 *
 * Fetched server-side. `revalidate` lets Next cache it so we're not hitting
 * the GitHub API on every request (unauthenticated API is rate-limited to
 * 60/hr per IP). Failure is non-fatal: a network error, a rate-limit, or a
 * repo with no releases yet all return null, and the header simply omits the
 * badge rather than breaking the build or the page.
 */

const REPO = 'wordpress-gcb/gutenberg-control-blocks-lite';

export async function getLatestReleaseTag() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        // Re-check hourly. Releases change rarely; this keeps the badge
        // current without spending the rate limit.
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null; // 404 = no releases yet; 403 = rate-limited
    const data = await res.json();
    return typeof data.tag_name === 'string' ? data.tag_name : null;
  } catch {
    return null;
  }
}
