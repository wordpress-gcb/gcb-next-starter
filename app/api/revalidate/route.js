/**
 * POST /api/revalidate
 *
 * Called by WordPress on `save_post` to bust the Next data cache for the
 * paths that just changed. Without this hook, the page cache
 * (`revalidate: 30` on the WP REST fetches) holds stale content for up to
 * 30 seconds after a save — annoying when you're actively editing.
 *
 * Body:
 *   {
 *     paths: ["/", "/about", ...]     // explicit paths to revalidate
 *     tags:  ["wp:page:home", ...]    // optional cache-tag invalidation
 *   }
 *
 * Auth:
 *   - Header `x-gcblite-revalidate-secret` must match
 *     process.env.REVALIDATE_SECRET. Without the secret set, the route
 *     refuses everything — easier to ship a secret-less codebase than
 *     to ship an open invalidation endpoint.
 *
 * Returns 200 with { revalidated: ["/", ...] } on success.
 *
 * Wired up:
 *   - Next side: .env.local sets REVALIDATE_SECRET.
 *   - WP side: wp-config.php defines GCBLITE_REVALIDATE_URL +
 *              GCBLITE_REVALIDATE_SECRET. CacheRevalidator hooks save_post
 *              and POSTs here on every save.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET not configured on this server' },
      { status: 503 }
    );
  }

  const provided = request.headers.get('x-gcblite-revalidate-secret') || '';
  if (provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const paths = Array.isArray(body?.paths) ? body.paths : [];
  const tags  = Array.isArray(body?.tags)  ? body.tags  : [];

  // Revalidate every path / tag we were given. revalidatePath drops the
  // cached server-component output AND any fetch-tagged data for routes
  // that touched it; revalidateTag is finer-grained if we ever start
  // tagging fetches.
  const revalidated = [];
  for (const path of paths) {
    if (typeof path !== 'string' || path === '') continue;
    try {
      revalidatePath(path);
      revalidated.push(path);
    } catch (e) {
      // Don't fail the whole request if one path errors — keep going.
      console.warn(`[revalidate] path failed: ${path}`, e?.message);
    }
  }
  for (const tag of tags) {
    if (typeof tag !== 'string' || tag === '') continue;
    try {
      revalidateTag(tag);
      revalidated.push(`tag:${tag}`);
    } catch (e) {
      console.warn(`[revalidate] tag failed: ${tag}`, e?.message);
    }
  }

  return NextResponse.json({ revalidated, at: new Date().toISOString() });
}
