import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';

import { findDoc, docDescription } from '@/lib/docs';
import remarkCodetabs from '@/lib/remark-codetabs';
import remarkPaths from '@/lib/remark-paths';
import { H1 } from '@/components/DocsArticle';
import { docsMarkdownComponents } from '@/components/docsMarkdown';

/**
 * /docs index — renders the concepts/overview.md doc.
 *
 * Next.js's [...slug] catch-all doesn't match an empty path, so the
 * root /docs URL needs its own page.jsx. Shares the markdown component
 * map with app/docs/[...slug]/page.jsx via @/components/docsMarkdown so
 * the two can't drift (which is how inline code stayed broken here).
 */

export function generateMetadata() {
  const doc = findDoc([]);
  if (!doc) return {};
  const description = docDescription(doc);
  return {
    title: doc.title,
    description,
    alternates: { canonical: '/docs' },
    openGraph: { title: doc.title, description, url: '/docs', type: 'article' },
    twitter: { title: doc.title, description },
  };
}

export default function DocsIndex() {
  const doc = findDoc([]);
  if (!doc) notFound();

  return (
    <>
      <H1>{doc.title}</H1>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkCodetabs, remarkPaths]}
        components={docsMarkdownComponents}
      >
        {doc.body}
      </ReactMarkdown>
    </>
  );
}
