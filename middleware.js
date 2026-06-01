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
 * leak for credential checks.
 *
 * Edge runtime doesn't expose node:crypto.timingSafeEqual, so we
 * hand-roll the same idea: encode both strings to Uint8Arrays, pad
 * the shorter one to match the longer, XOR every byte and OR the
 * results. The loop runs Math.max(a.length, b.length) iterations
 * regardless of when (or if) a mismatch occurs, so timing doesn't
 * leak prefix-match length. The final `a.length === b.length`
 * check prevents shorter-string-masquerading-as-longer through a
 * pad-byte collision.
 */
function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  const len = Math.max(ba.length, bb.length);
  let diff = 0;
  for (let i = 0; i < len; i++) {
    // i >= length → byte is treated as 0; the XOR with the other
    // side's actual byte still contributes to `diff` so the loop
    // doesn't short-circuit. Same wall-clock for any input.
    const x = i < ba.length ? ba[i] : 0;
    const y = i < bb.length ? bb[i] : 0;
    diff |= x ^ y;
  }
  return diff === 0 && ba.length === bb.length;
}
