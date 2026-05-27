import Link from 'next/link';
import { H1, H2, H3, P, Code, Callout } from '@/components/DocsArticle';
import ControlRef from '@/components/ControlRef';
import { loadAllDocs } from '@/lib/docs';

export const metadata = { title: 'GCB Lite — Field reference' };

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

  return (
    <>
      <H1>Field reference</H1>

      <P>
        Every entry in <Code>block.fields.json</Code> declares one Inspector
        control. The <Code>type</Code> picks the React component shown in
        the editor. The <Code>attributeKey</Code> picks the WP attribute
        name your React component receives.
      </P>

      <P>
        Every control accepts the common keys <Code>id</Code>,{' '}
        <Code>attributeKey</Code>, <Code>label</Code>, <Code>helpText</Code>,{' '}
        <Code>default</Code>, <Code>parentPanelId</Code>,{' '}
        <Code>conditionalLogic</Code>, <Code>validation</Code>. The
        cards below list only the control-specific options.
      </P>

      <Callout type="tip">
        Hover any control name to preview its full reference page, or click
        through. Every shipping site has the{' '}
        <Link href="/all-fields">All fields</Link> page seeded with one of
        every control type — same code the Inspector renders, with sample
        data wired up.
      </Callout>

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
