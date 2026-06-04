import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { H1, H2, H3, P, Code, Callout } from '@/components/DocsArticle';
import ControlRef from '@/components/ControlRef';
import { findDoc, loadAllDocs } from '@/lib/docs';

export const metadata = {
  title: 'Field reference',
  description:
    'Every GCB Lite Inspector control type — text, image, repeater, post-object and more — with the shape of value each one stores.',
  alternates: { canonical: '/docs/fields' },
};

/**
 * Field-reference index page. Generated from the same plugin-owned
 * markdown sources as the per-control pages — read every .md from
 * content/controls/ (synced from gcb-lite/schemas/controls/), group by
 * a `category` derived from the file's `order` range, render a compact
 * card per control with description + stored shape + supports.
 *
 * Single source of truth: the .md files. This page can't drift from
 * the per-control pages because both render from the same data.
 */

// Order ranges → human category. Authors set `order` in each
// control's .md frontmatter; this map sorts them into reading groups.
// Ranges loose on purpose — slot new controls anywhere within a range
// without re-numbering the rest.
const CATEGORY_FOR_ORDER = [
  { max: 4,  name: 'Text input' },
  { max: 13, name: 'Choice' },
  { max: 22, name: 'Numeric & visual' },
  { max: 31, name: 'Date & time' },
  { max: 41, name: 'Display-only' },
  { max: 53, name: 'Media' },
  { max: 64, name: 'Reference' },
  { max: 79, name: 'Other' },
  { max: 99, name: 'Composite' },
];

function categoryFor(order) {
  for (const { max, name } of CATEGORY_FOR_ORDER) {
    if (order <= max) return name;
  }
  return 'Other';
}

export default function FieldReference() {
  // Only primary entries; aliases (e.g. textarea, heading-level)
  // would otherwise show as separate cards.
  const controls = loadAllDocs()
    .filter((d) => d.kind === 'control' && !d.isAlias)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  // Group by category.
  const byCategory = new Map();
  for (const c of controls) {
    const cat = categoryFor(c.order);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(c);
  }
  // Stable category order matching CATEGORY_FOR_ORDER.
  const orderedCategories = CATEGORY_FOR_ORDER
    .map((c) => c.name)
    .filter((name) => byCategory.has(name));

  // Intro prose lives in schemas/concepts/fields-overview.md so it's
  // editable alongside the rest of the docs. Hidden from the sidebar
  // via `section: __hidden__` — only rendered here, inline.
  const intro = findDoc(['fields-overview']);

  return (
    <>
      <H1>{intro?.title || 'Field reference'}</H1>

      {intro?.body && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={introComponents}
        >
          {intro.body}
        </ReactMarkdown>
      )}

      {orderedCategories.map((category) => (
        <section key={category}>
          <H2 id={slugify(category)}>{category}</H2>
          {byCategory.get(category).map((c) => {
            const type = c.slug[1]; // ['fields', 'color'] → 'color'
            const fm = c.frontmatter || {};
            return (
              <article key={type} style={{ marginBottom: 24 }}>
                <H3 id={`${type}-control`}>
                  <ControlRef type={type}><Code>{type}</Code></ControlRef>
                </H3>
                {fm.description && <P>{fm.description}</P>}
                {fm.stored && (
                  <P style={{ fontSize: 13, color: '#525260', marginTop: -8 }}>
                    <strong>Stored:</strong> <Code>{fm.stored}</Code>
                  </P>
                )}
                {Array.isArray(fm.configOptions) && fm.configOptions.length > 0 && (
                  <P style={{ fontSize: 13, color: '#525260', marginTop: -8 }}>
                    <strong>Config:</strong>{' '}
                    {fm.configOptions
                      .filter((o) => o && o.name)
                      .map((o, i, arr) => (
                        <span key={o.name}>
                          <Code>{o.name}</Code>{i < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                  </P>
                )}
              </article>
            );
          })}
        </section>
      ))}
    </>
  );
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Trim markdown component map for the page intro — only the elements
// the fields-overview.md prose actually uses (paragraphs, inline code,
// blockquote-as-Callout). Doesn't need the full set the dynamic page
// uses (no headings or fenced code blocks in this short intro).
const introComponents = {
  p: ({ children }) => <P>{children}</P>,
  // The intro prose is all inline code (no fenced blocks), and
  // react-markdown v9+ dropped the `inline` flag — so render every
  // `code` node as our inline chip.
  code: ({ children }) => <Code>{children}</Code>,
  blockquote: ({ children }) => <Callout type="tip">{children}</Callout>,
  a: ({ href, children }) => <a href={href}>{children}</a>,
};
