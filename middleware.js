/**
 * Request middleware.
 *
 * Single job right now: gate the /wordpress/render/* routes behind a
 * shared secret so the paired WP install is the only thing that can
 * call them. Without this, anyone who finds the frontend URL can hit
 * those routes directly with arbitrary attributes — denial-of-service
 * surface even if no data leaks, since the routes do real render work.
 *
 * The header name matches what RenderAPI.php sends on its outbound
 * wp_remote_get: `x-gcblite-render-secret`.
 *
 * Policy:
 *   - RENDER_SECRET unset → routes are unauthenticated (alpha posture).
 *     Useful for `npm run dev` smoke tests before you set anything up;
 *     not safe for production. README says so explicitly.
 *   - RENDER_SECRET set    → routes require the matching header.
 *     Constant-time compare via crypto.timingSafeEqual with length
 *     padding so we don't leak the secret length via timing.
 *
 * EXPLICITLY NOT GATED:
 *   - /wordpress/styles.css and /wordpress/editor.css. Those are
 *     fetched by the BROWSER from the editor's <link> tag — the
 *     browser never sees the WP→frontend secret (that was the whole
 *     point of "secret never reaches the client"). Gating them would
 *     either break the editor styles or force shipping the secret
 *     client-side, defeating the auth on /render/*. They're
 *     stylesheets; treat them as public.
 *   - /api/revalidate has its own separate secret
 *     (REVALIDATE_SECRET) — different credential, different shape,
 *     handled inside the route itself.
 */

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

export const config = {
  // Only the render routes. Note styles.css / editor.css are
  // deliberately excluded — see the header comment.
  matcher: ['/wordpress/render/:path*'],
};

const HEADER_NAME = 'x-gcblite-render-secret';

export function middleware(request) {
  const expected = process.env.RENDER_SECRET || '';

  // No secret configured → routes are open. Alpha posture; README
  // calls this out. Production sites should set RENDER_SECRET on both
  // ends to flip on the auth path.
  if (expected === '') {
    return NextResponse.next();
  }

  const provided = request.headers.get(HEADER_NAME) || '';
  if (!constantTimeEquals(provided, expected)) {
    return new NextResponse(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

/**
 * Constant-time string compare. `===` leaks the secret length and
 * common-prefix length via timing — fine for normal app code, real
 * leak for credential checks. timingSafeEqual requires equal-length
 * buffers, so we pad both sides to the same length BEFORE comparing.
 *
 * Padding strategy: hash both inputs to a fixed length. We don't need
 * cryptographic strength here (the secret itself is the credential);
 * we just need equal-length buffers. Easiest: pad each to the longer
 * of the two with a sentinel byte, then compare.
 *
 * In practice the secrets we generate from the Settings page are
 * 40-char hex strings, so the lengths match and the pad is a no-op.
 * The padding only matters if an attacker sends a header of a
 * different length to probe — and the pad neutralises that probe.
 */
function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const len = Math.max(a.length, b.length);
  const ba = Buffer.alloc(len);
  const bb = Buffer.alloc(len);
  ba.write(a);
  bb.write(b);
  // Even if a and b are different lengths, timingSafeEqual now has
  // equal-length buffers and returns false. The pad bytes don't
  // collide with hex chars so equal-prefix attacks don't help.
  let equal = false;
  try {
    equal = timingSafeEqual(ba, bb);
  } catch {
    equal = false;
  }
  // Length must also match — pad bytes happened to match would
  // otherwise let a shorter string masquerade as a longer one.
  return equal && a.length === b.length;
}
