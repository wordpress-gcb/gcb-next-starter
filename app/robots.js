/**
 * robots.txt — served by Next at /robots.txt.
 *
 * Allow everything and point crawlers at the sitemap. `host`/sitemap URLs are
 * made absolute via metadataBase (app/layout.jsx).
 */

export default function robots() {
	return {
		rules: { userAgent: '*', allow: '/' },
		sitemap: '/sitemap.xml',
	};
}
