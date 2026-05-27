/**
 * Docs manifest — drives the sidebar on every /docs page. Adding a new
 * doc means: write the page, add it here. No automatic file-system scan
 * (Next.js App Router has no built-in MDX scanner without extra deps).
 */

export const docsManifest = [
  {
    section: 'Getting started',
    items: [
      { href: '/docs',                    title: 'Overview' },
      { href: '/docs/quickstart',         title: 'Quickstart' },
    ],
  },
  {
    section: 'Field reference',
    items: [
      { href: '/docs/fields',             title: 'All controls' },
      { href: '/docs/fields/text',        title: 'text / textarea' },
      { href: '/docs/fields/image',       title: 'image' },
      { href: '/docs/fields/url',         title: 'url' },
      { href: '/docs/fields/heading',     title: 'heading-level' },
      { href: '/docs/fields/toggle',      title: 'toggle / toggle-group' },
      { href: '/docs/fields/checkbox',    title: 'checkbox-group' },
      { href: '/docs/fields/repeater',    title: 'repeater' },
      { href: '/docs/fields/post-object', title: 'post-object' },
    ],
  },
  {
    section: 'Post fields (CPT meta)',
    items: [
      { href: '/docs/post-fields',        title: 'Overview' },
    ],
  },
  {
    section: 'AI workflows',
    items: [
      { href: '/docs/ai',                 title: 'Abilities + agents' },
    ],
  },
  {
    section: 'Headless rendering',
    items: [
      { href: '/docs/headless',           title: 'Overview' },
      { href: '/docs/headless/parser',    title: 'Block parser' },
      { href: '/docs/headless/registry',  title: 'Block registry' },
      { href: '/docs/headless/collection',title: 'Collection helper' },
      { href: '/docs/headless/deploy',    title: 'Deploy' },
    ],
  },
];
