/**
 * Talks to a WordPress install over the core REST API.
 *
 * We don't use any gcb-specific endpoints here — /wp/v2/pages already returns
 * everything we need (raw block markup + per-block rendered HTML).
 *
 * Configure the target via NEXT_PUBLIC_WP_URL in .env.local. Functions
 * throw at call time (not module load time) if the env var is missing, so
 * builds that don't exercise the WP fetch (e.g. the demo homepage on
 * Vercel) succeed without a WordPress install configured.
 */

import { parse } from '@wordpress/block-serialization-default-parser';

function getWpUrl() {
  const url = process.env.NEXT_PUBLIC_WP_URL;
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_WP_URL is not set. Add it to .env.local — see .env.local.example for the format.',
    );
  }
  return url;
}

function apiBase() {
  return `${getWpUrl()}/wp-json/wp/v2`;
}

export async function getPageBySlug(slug) {
  const res = await fetch(`${apiBase()}/pages?slug=${encodeURIComponent(slug)}&_embed=1`, {
    // Soft cache during dev so editing in WP shows up within a minute.
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`WP REST returned ${res.status} for slug=${slug}`);
  }

  const pages = await res.json();
  return pages[0] || null;
}

export async function getPostBySlug(slug) {
  const res = await fetch(`${apiBase()}/posts?slug=${encodeURIComponent(slug)}&_embed=1`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`WP REST returned ${res.status} for slug=${slug}`);
  const posts = await res.json();
  return posts[0] || null;
}

/**
 * Pull the right block source off a WP REST entity. Prefers the plugin's
 * `blocks_raw` field (registered by GCBLite\RestAPI\RawBlocksField) which
 * keeps the block comments needed to identify gcb/* blocks by name.
 * Falls back to `content.rendered` for entities that don't expose blocks_raw
 * (e.g. an older WordPress without the plugin installed).
 *
 * Used by app/[...slug]/page.jsx to walk the block tree and render each
 * block via the registry.
 */
export function blockSourceFromEntity(entity) {
  if (!entity) return '';
  return entity.blocks_raw || entity.content?.rendered || '';
}

/**
 * Turn raw block markup into a tree of:
 *   { blockName, attrs, innerBlocks, innerHTML, innerContent }
 */
export function parseBlocks(content) {
  if (!content) return [];
  return parse(content);
}

/**
 * Fetch the attribute defaults for every registered gcb/* block. Used by
 * the page renderer to fill in attrs WordPress didn't persist (it only
 * stores values that differ from the default).
 *
 * @returns {Promise<Record<string, Record<string, any>>>} block name → { attrKey: default }
 */
export async function getBlockDefaults() {
  const res = await fetch(`${getWpUrl()}/wp-json/gcblite/v1/blocks`, {
    next: { revalidate: 300 }, // schemas barely change; cache 5 min
  });
  if (!res.ok) return {};
  const data = await res.json();
  const out = {};
  for (const [name, info] of Object.entries(data?.blocks || {})) {
    const defaults = {};
    for (const [k, v] of Object.entries(info?.attributes || {})) {
      // null defaults from core "lock/style/className" attrs aren't useful —
      // skip so they don't override real values further up the chain.
      if (v?.default !== null && v?.default !== undefined) {
        defaults[k] = v.default;
      }
    }
    out[name] = defaults;
  }
  return out;
}

/**
 * Resolve a collection of CPT posts for a section block.
 *
 * Mirrors the gcb-lite plugin's PHP Collection::query helper — same two
 * source modes ('latest' and 'manual') — so saas-projects /
 * saas-testimonials / saas-brands / saas-blog can do their own
 * data fetch from React instead of needing a separate plugin endpoint.
 *
 * @param {string} postType WP REST slug (e.g. 'project', 'testimonial').
 * @param {object} attrs    Block attrs: { source, count, post_ids }.
 * @returns {Promise<Array<object>>} REST entities — raw shape, callers
 *                                   read fields like .meta.cover, .title.rendered.
 */
export async function getCptCollection(postType, attrs = {}) {
  const source = attrs.source === 'manual' ? 'manual' : 'latest';

  if (source === 'manual') {
    const ids = Array.isArray(attrs.post_ids)
      ? attrs.post_ids.map((n) => parseInt(n, 10)).filter((n) => n > 0)
      : [];
    if (ids.length === 0) return [];

    // ?include[]=1&include[]=2&orderby=include preserves the author's order.
    const params = new URLSearchParams({
      per_page: String(ids.length),
      orderby: 'include',
      _embed: '1',
    });
    ids.forEach((id) => params.append('include[]', String(id)));

    const res = await fetch(`${apiBase()}/${postType}?${params}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return res.json();
  }

  // Latest mode.
  const count = Math.max(1, Math.min(100, parseInt(attrs.count, 10) || 6));
  const params = new URLSearchParams({
    per_page: String(count),
    orderby: 'date',
    order: 'desc',
    _embed: '1',
  });
  const res = await fetch(`${apiBase()}/${postType}?${params}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return [];
  return res.json();
}

/**
 * Ask the plugin to render gcb/* blocks that this component server doesn't
 * have a React component for. The plugin's render-batch endpoint falls back
 * to render.php (for blocks that have one) or recursively to the component
 * server (for blocks that don't). Either way we get HTML back per clientId.
 *
 * @param {Array<{clientId, blockName, attributes, innerBlocks?}>} requests
 * @returns {Promise<Record<string, string>>} map of clientId → rendered HTML
 */
export async function renderBlocksViaPlugin(requests) {
  if (!requests?.length) return {};

  const res = await fetch(`${getWpUrl()}/wp-json/gcblite/v1/render-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks: requests }),
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    console.warn(`/render-batch returned ${res.status}`);
    return {};
  }

  const data = await res.json();
  if (!data?.success || !data?.results) return {};

  const out = {};
  for (const [clientId, result] of Object.entries(data.results)) {
    if (result?.success && result.html) out[clientId] = result.html;
  }
  return out;
}
