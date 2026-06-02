import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';

import { findDoc } from '@/lib/docs';
import remarkCodetabs from '@/lib/remark-codetabs';
import CodeTabs from '@/components/CodeTabs';
import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';

/**
 * /docs index — renders the concepts/overview.md doc.
 *
 * Next.js's [...slug] catch-all doesn't match an empty path, so the
 * root /docs URL needs its own page.jsx. Behaviour mirrors the
 * concept-doc branch of app/docs/[...slug]/page.jsx — keep them in
 * sync if either changes.
 */

export function generateMetadata() {
  const doc = findDoc([]);
  if (!doc) return {};
  return { title: `GCB Lite — ${doc.title}` };
}

export default function DocsIndex() {
  const doc = findDoc([]);
  if (!doc) notFound();

  return (
    <>
      <H1>{doc.title}</H1>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkCodetabs]}
        components={mdComponents}
      >
        {doc.body}
      </ReactMarkdown>
    </>
  );
}

const mdComponents = {
  h1: ({ children }) => <H1>{children}</H1>,
  h2: ({ children, id }) => <H2 id={id}>{children}</H2>,
  h3: ({ children, id }) => <H3 id={id}>{children}</H3>,
  p: ({ children }) => <P>{children}</P>,
  code: ({ inline, children, className }) => {
    if (inline) return <Code>{children}</Code>;
    const lang = (className || '').replace('language-', '');
    return <Pre lang={lang}>{String(children).replace(/\n$/, '')}</Pre>;
  },
  pre: ({ children }) => <>{children}</>,
  ul: ({ children }) => <ul style={{ marginLeft: 20, color: 'var(--color-body)', lineHeight: 1.7 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ marginLeft: 20, color: 'var(--color-body)', lineHeight: 1.7 }}>{children}</ol>,
  blockquote: ({ children }) => <Callout type="note">{children}</Callout>,
  codetabs: ({ tabs }) => {
    try {
      const parsed = JSON.parse(tabs);
      return (
        <CodeTabs
          tabs={parsed.map((t) => ({
            label: labelForLang(t.lang),
            lang:  t.lang,
            code:  t.value,
          }))}
        />
      );
    } catch {
      return null;
    }
  },
};

function labelForLang(lang) {
  const map = { jsx: 'React', tsx: 'React', js: 'JavaScript', ts: 'TypeScript', php: 'PHP', bash: 'Shell', json: 'JSON' };
  return map[lang] || lang.toUpperCase();
}
