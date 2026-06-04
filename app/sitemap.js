/**
 * XML sitemap for the docs site. Next serves this at /sitemap.xml.
 *
 * Enumerates every doc route from the same loadAllDocs() the pages use, so it
 * can't drift from what's actually published. The home + /docs index are added
 * explicitly; everything else comes from each doc's `href`.
 *
 * URLs are absolute via metadataBase (set in app/layout.jsx) — Next resolves
 * the relative paths against it.
 */

import { loadAllDocs } from '@/lib/docs';

export default function sitemap() {
	const docs = loadAllDocs();

	const docEntries = docs.map((doc) => ({
		url: doc.href,
		changeFrequency: 'weekly',
		priority: doc.href === '/docs' ? 0.9 : 0.7,
	}));

	return [
		{ url: '/', changeFrequency: 'weekly', priority: 1 },
		...docEntries,
	];
}
