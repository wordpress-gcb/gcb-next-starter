import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';

import { findDoc, loadAllDocs } from '@/lib/docs';
import remarkCodetabs from '@/lib/remark-codetabs';
import remarkPaths from '@/lib/remark-paths';
import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';
import { docsMarkdownComponents } from '@/components/docsMarkdown';

/**
 * Dynamic docs route — resolves a slug to a markdown doc and renders.
 *
 * Two flavours, dispatched on `doc.kind`:
 *   - control  → structured frontmatter view (description, stored,
 *                supports, configOptions, gotchas, example) + optional
 *                prose body underneath.
 *   - concept  → markdown body rendered with custom components,
 *                supports the :::codetabs directive for PHP/React pairs.
 *
 * All docs come from content/ under the project root, populated by
 * scripts/sync-docs.sh from the plugin's schemas/ directory before
 * each build.
 */

// Pre-generate static paths for every doc on disk. Saves a runtime
// filesystem lookup on every page load.
export function generateStaticParams() {
  return loadAllDocs()
    .filter((d) => d.slug.length > 0) // root /docs handled by app/docs/page.jsx
    .map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }) {
  const doc = findDoc(params.slug);
  if (!doc) return {};
  return { title: `GCB Lite — ${doc.title}` };
}

export default function DocPage({ params }) {
  const doc = findDoc(params.slug);
  if (!doc) notFound();

  if (doc.kind === 'control') {
    return <ControlReference doc={doc} />;
  }
  return <ConceptArticle doc={doc} />;
}

/**
 * Structured view for control reference docs. Frontmatter does the
 * heavy lifting — no markdown body needed in 95% of cases.
 */
function ControlReference({ doc }) {
  const fm = doc.frontmatter;
  return (
    <>
      <H1>{fm.title || doc.title}</H1>
      {fm.description && <P>{fm.description}</P>}

      {fm.stored && (
        <>
          <H2 id="stored">Stored value</H2>
          <P><Code>{fm.stored}</Code></P>
        </>
      )}

      {Array.isArray(fm.supports) && fm.supports.length > 0 && (
        <>
          <H2 id="supports">Supports</H2>
          <ul style={{ marginLeft: 20, color: 'var(--color-body)', lineHeight: 1.7 }}>
            {fm.supports.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </>
      )}

      {Array.isArray(fm.configOptions) && fm.configOptions.length > 0 && (
        <>
          <H2 id="config">Config options</H2>
          <dl style={{ margin: 0 }}>
            {fm.configOptions.map((opt, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <dt style={{ marginBottom: 4 }}>
                  <Code>{opt.name}</Code>
                  {opt.type && <span style={{ color: '#525260', marginLeft: 8, fontSize: 13 }}>{opt.type}</span>}
                  {opt.default !== undefined && (
                    <span style={{ color: '#525260', marginLeft: 8, fontSize: 13 }}>
                      default: <code>{JSON.stringify(opt.default)}</code>
                    </span>
                  )}
                </dt>
                {opt.description && <dd style={{ margin: 0, color: 'var(--color-body)' }}>{opt.description}</dd>}
              </div>
            ))}
          </dl>
        </>
      )}

      {fm.example && (
        <>
          <H2 id="example">Example</H2>
          <Pre lang="json">{fm.example}</Pre>
        </>
      )}

      {Array.isArray(fm.gotchas) && fm.gotchas.length > 0 && (
        <>
          <H2 id="gotchas">Gotchas</H2>
          {fm.gotchas.map((item, i) => (
            <Callout key={i} type="warn">{item}</Callout>
          ))}
        </>
      )}

      {/* Optional prose body — used for the rare control that needs
         more explanation than fits in structured frontmatter. */}
      {doc.body.trim() && (
        <>
          <H2 id="notes">Notes</H2>
          <MarkdownBody body={doc.body} />
        </>
      )}
    </>
  );
}

/**
 * Prose-heavy view for concept docs. Renders the markdown body via
 * react-markdown with custom components that match the JSX-era docs
 * styling (H1 / H2 / Code / Pre / Callout). Supports the :::codetabs
 * directive via the remarkCodetabs plugin.
 */
function ConceptArticle({ doc }) {
  return (
    <>
      <H1>{doc.title}</H1>
      <MarkdownBody body={doc.body} />
    </>
  );
}

function MarkdownBody({ body }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkCodetabs, remarkPaths]}
      components={docsMarkdownComponents}
    >
      {body}
    </ReactMarkdown>
  );
}
