/**
 * Shared react-markdown component map for the docs pages.
 *
 * One source of truth, imported by every page that renders doc markdown
 * (app/docs/page.jsx, app/docs/[...slug]/page.jsx, and the trimmed intro
 * on app/docs/fields/page.jsx). It used to be copy-pasted into each file,
 * which is exactly how the inline-code bug survived a "fix" — one copy got
 * patched, the /docs root copy didn't. Keep it here so that can't recur.
 */

import { H1, H2, H3, P, Code, Pre, Callout, Table, Th, Td } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';
import Paths from '@/components/Paths';

function labelForLang(lang) {
  const map = { jsx: 'React', tsx: 'React', js: 'JavaScript', ts: 'TypeScript', php: 'PHP', bash: 'Shell', json: 'JSON' };
  return map[lang] || lang.toUpperCase();
}

// Concept docs render with remark-gfm + remark-directive but no rehype-slug,
// so headings arrive without ids — meaning in-page [text](#anchor) links have
// nothing to land on. Derive a GitHub-style slug from the heading text so
// every heading is linkable without pulling in another remark/rehype dep.
function textOf(node) {
  if (node == null || node === false) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node.props) return textOf(node.props.children);
  return '';
}
function slugifyHeading(children, explicitId) {
  if (explicitId) return explicitId;
  return textOf(children)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// react-markdown v9+ removed the `inline` prop, so we can't branch on it.
// Distinguish inline code from a fenced block by the className: only fenced
// blocks carry `language-*` (added by remark from the fence info string).
// Anything without it is an inline `code` span and renders as a chip —
// otherwise every inline span falls through to <Pre> and renders as a
// full-width padded block on its own line.
function codeComponent({ children, className }) {
  const isFenced = /\blanguage-/.test(className || '');
  if (!isFenced) return <Code>{children}</Code>;
  const lang = (className || '').replace(/.*language-/, '').trim();
  return <Pre lang={lang}>{String(children).replace(/\n$/, '')}</Pre>;
}

export const docsMarkdownComponents = {
  h1: ({ children }) => <H1>{children}</H1>,
  h2: ({ children, id }) => <H2 id={slugifyHeading(children, id)}>{children}</H2>,
  h3: ({ children, id }) => <H3 id={slugifyHeading(children, id)}>{children}</H3>,
  // A standalone image parses as a paragraph wrapping an <img>. Our img
  // renders a block-level <figure>, and <figure> inside <p> is invalid HTML
  // (hydration error). So when a paragraph's only real child is an image,
  // skip the <p> wrapper and let the figure stand on its own.
  p: ({ children, node }) => {
    const kids = (node?.children || []).filter(
      (c) => !(c.type === 'text' && /^\s*$/.test(c.value || ''))
    );
    if (kids.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'img') {
      return <>{children}</>;
    }
    return <P>{children}</P>;
  },
  // External links (http/https to another origin) open in a new tab with a
  // small ↗ icon so the reader knows they're leaving the docs; internal
  // (/docs/…) and in-page (#anchor) links behave normally.
  a: ({ href = '', children }) => {
    const isExternal = /^https?:\/\//i.test(href);
    if (!isExternal) {
      return <a href={href} style={{ color: 'var(--color-primary, #2563eb)' }}>{children}</a>;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--color-primary, #2563eb)', whiteSpace: 'nowrap' }}
      >
        {children}
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ display: 'inline-block', verticalAlign: '-1px', marginLeft: 3 }}
        >
          <path d="M14 5 h5 v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 5 L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 14 v4 a1 1 0 0 1-1 1 H6 a1 1 0 0 1-1-1 V7 a1 1 0 0 1 1-1 h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    );
  },
  code: codeComponent,
  pre: ({ children }) => <>{children}</>, // the code child renders <Pre> itself
  ul: ({ children }) => <ul style={{ marginLeft: 20, color: 'var(--color-body)', lineHeight: 1.7 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ marginLeft: 20, color: 'var(--color-body)', lineHeight: 1.7 }}>{children}</ol>,
  blockquote: ({ children }) => <Callout type="note">{children}</Callout>,
  // Screenshots / figures. react-markdown emits a bare <img> otherwise —
  // full-bleed and unstyled. Wrap in a bordered figure; the alt text doubles
  // as a caption so docs images explain themselves.
  img: ({ src, alt }) => (
    <figure style={{ margin: '0 0 22px' }}>
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 8,
          border: '1px solid #e3e0d8',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      />
      {alt && (
        <figcaption style={{ marginTop: 8, fontSize: 13, color: 'var(--color-gray-1, #6b7280)', lineHeight: 1.5 }}>
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  // GFM tables — react-markdown emits these bare/unstyled otherwise. We map
  // table/th/td to bordered+padded helpers; thead/tbody/tr pass straight
  // through. Zebra striping is done with a scoped CSS :nth-child rule inside
  // <Table> (NOT by cloning row elements — manually rebuilding React elements
  // strips their internal fields and breaks RSC serialization).
  table: ({ children }) => <Table>{children}</Table>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  // react-markdown puts GFM column alignment on `style` — forward it.
  th: ({ children, style }) => <Th style={style}>{children}</Th>,
  td: ({ children, style }) => <Td style={style}>{children}</Td>,
  // remark-codetabs rewrites the :::codetabs directive into a
  // <codetabs tabs="..."/> element; pick up the JSON-encoded tabs prop.
  codetabs: ({ tabs }) => {
    try {
      const parsed = JSON.parse(tabs);
      return (
        <CodeTabs
          tabs={parsed.map((t) => ({
            label: labelForLang(t.lang),
            lang: t.lang,
            code: t.value,
          }))}
        />
      );
    } catch {
      return null;
    }
  },
  // :::paths chooser (remark-paths). <paths> wraps one <pathpanel label="…">
  // per tab; <Paths> reads the labels off its children to build the tab bar.
  // pathpanel just forwards its rendered markdown body and carries the label.
  paths: ({ children }) => <Paths>{children}</Paths>,
  pathpanel: ({ label, children }) => <div data-path-label={label}>{children}</div>,
};
