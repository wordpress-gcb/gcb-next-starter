/**
 * Docs source loader.
 *
 * Single source of truth: markdown files under content/{controls,concepts}/
 * synced from the gcb-lite plugin's schemas/ directory by
 * scripts/sync-docs.sh. This module reads them, parses frontmatter,
 * exposes them to the docs renderer + sidebar manifest builder.
 *
 * `runtime` is node-only (uses fs). Callers must be Server Components
 * or build-time scripts.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.join(process.cwd(), 'content');

/**
 * Read every .md file under content/, parse frontmatter + body, return
 * an array of doc entries. Filename without extension becomes the
 * `slug` (e.g. controls/color.md → slug: 'fields/color').
 *
 * Mapping rules:
 *   content/controls/{type}.md  → /docs/fields/{type}
 *   content/concepts/{name}.md  → /docs/{name}        (concept pages
 *                                                       live at /docs root)
 *
 * Frontmatter is normalised: every entry gets at minimum {slug, title,
 * section, order}. Section defaults to "Reference" for controls and
 * "Concepts" for concept pages; renderers using a custom section
 * override via frontmatter.section.
 */
export function loadAllDocs() {
	if (!fs.existsSync(ROOT)) return [];

	const docs = [];

	const controlsDir = path.join(ROOT, 'controls');
	if (fs.existsSync(controlsDir)) {
		for (const file of fs.readdirSync(controlsDir)) {
			if (!file.endsWith('.md')) continue;
			const type = file.replace(/\.md$/, '');
			const raw = fs.readFileSync(path.join(controlsDir, file), 'utf8');
			const { data, content } = matter(raw);

			// One .md file can answer to multiple URLs via frontmatter
			// `aliases`. E.g. text.md aliases ['textarea'] so
			// /docs/fields/textarea returns the same content. Primary
			// entry is the filename; aliases get their own doc records
			// pointing at the same body, but only the primary appears in
			// the sidebar manifest (alias is set on the doc record so
			// buildManifest() can filter).
			const primary = {
				slug: ['fields', type],
				href: `/docs/fields/${type}`,
				kind: 'control',
				title: data.title || type,
				section: data.section || 'Field reference',
				order: typeof data.order === 'number' ? data.order : 100,
				frontmatter: data,
				body: content,
				isAlias: false,
			};
			docs.push(primary);

			const aliases = Array.isArray(data.aliases) ? data.aliases : [];
			for (const alias of aliases) {
				if (typeof alias !== 'string' || !alias) continue;
				docs.push({
					...primary,
					slug: ['fields', alias],
					href: `/docs/fields/${alias}`,
					isAlias: true,
				});
			}
		}
	}

	const conceptsDir = path.join(ROOT, 'concepts');
	if (fs.existsSync(conceptsDir)) {
		for (const file of fs.readdirSync(conceptsDir)) {
			if (!file.endsWith('.md')) continue;
			const name = file.replace(/\.md$/, '');
			const raw = fs.readFileSync(path.join(conceptsDir, file), 'utf8');
			const { data, content } = matter(raw);
			// Slug resolution, in priority order:
			//   1. frontmatter.slug — array (multi-segment) or string (single segment / "a/b" path)
			//   2. filename === "overview" → [] (the /docs root)
			//   3. filename → [name]
			let slug;
			if (Array.isArray(data.slug)) {
				slug = data.slug;
			} else if (typeof data.slug === 'string' && data.slug.length > 0) {
				slug = data.slug.split('/').filter(Boolean);
			} else if (name === 'overview') {
				slug = [];
			} else {
				slug = [name];
			}
			const href = slug.length === 0 ? '/docs' : `/docs/${slug.join('/')}`;
			docs.push({
				slug,
				href,
				kind: 'concept',
				title: data.title || name,
				section: data.section || 'Getting started',
				order: typeof data.order === 'number' ? data.order : 100,
				frontmatter: data,
				body: content,
			});
		}
	}

	return docs;
}

/**
 * Find a single doc by its slug array.
 * @param {string[]} slug e.g. ['fields', 'color'] or ['quickstart'] or [].
 */
export function findDoc(slug) {
	const all = loadAllDocs();
	const want = slug.join('/');
	return all.find((d) => d.slug.join('/') === want) || null;
}

/**
 * Build the sidebar manifest from frontmatter on every doc. Returns
 * an array of { section, items: [{href, title}] }, ordered by the
 * lowest `order` within each section.
 */
export function buildManifest() {
	const all = loadAllDocs();
	const bySection = new Map();
	for (const doc of all) {
		// Aliases (e.g. textarea → text.md) share content with another
		// entry; only the primary belongs in the sidebar.
		if (doc.isAlias) continue;
		if (!bySection.has(doc.section)) bySection.set(doc.section, []);
		bySection.get(doc.section).push(doc);
	}
	// Sort items within each section by order, then by title.
	const sections = [];
	for (const [section, items] of bySection) {
		items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
		sections.push({
			section,
			items: items.map((i) => ({ href: i.href, title: i.title })),
		});
	}
	// Stable section ordering: Getting started first, Reference second,
	// AI workflows third, Headless rendering fourth, anything else after.
	const sectionOrder = [
		'Getting started',
		'Field reference',
		'Post fields (CPT meta)',
		'AI workflows',
		'Headless rendering',
	];
	sections.sort((a, b) => {
		const ai = sectionOrder.indexOf(a.section);
		const bi = sectionOrder.indexOf(b.section);
		return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
	});
	return sections;
}
