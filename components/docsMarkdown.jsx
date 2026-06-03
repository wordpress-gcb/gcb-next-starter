/**
 * Shared react-markdown component map for the docs pages.
 *
 * One source of truth, imported by every page that renders doc markdown
 * (app/docs/page.jsx, app/docs/[...slug]/page.jsx, and the trimmed intro
 * on app/docs/fields/page.jsx). It used to be copy-pasted into each file,
 * which is exactly how the inline-code bug survived a "fix" — one copy got
 * patched, the /docs root copy didn't. Keep it here so that can't recur.
 */

import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

function labelForLang(lang) {
  const map = { jsx: 'React', tsx: 'React', js: 'JavaScript', ts: 'TypeScript', php: 'PHP', bash: 'Shell', json: 'JSON' };
  return map[lang] || lang.toUpperCase();
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
  h2: ({ children, id }) => <H2 id={id}>{children}</H2>,
  h3: ({ children, id }) => <H3 id={id}>{children}</H3>,
  p: ({ children }) => <P>{children}</P>,
  code: codeComponent,
  pre: ({ children }) => <>{children}</>, // the code child renders <Pre> itself
  ul: ({ children }) => <ul style={{ marginLeft: 20, color: 'var(--color-body)', lineHeight: 1.7 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ marginLeft: 20, color: 'var(--color-body)', lineHeight: 1.7 }}>{children}</ol>,
  blockquote: ({ children }) => <Callout type="note">{children}</Callout>,
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
};
