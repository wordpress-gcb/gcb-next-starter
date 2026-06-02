/**
 * DocsSearch — client-side fuzzy-ish filter over the docs.
 *
 * Receives a pre-built index (title/href/section/text) from the docs
 * layout (a server component that reads it at build time via
 * buildSearchIndex()). No runtime filesystem, no search-engine dep —
 * just substring matching over a few tens of KB of records, which is
 * instant for a docs set this size.
 *
 * Behaviour: type to filter; title matches rank above body matches;
 * ↑/↓ move the selection, Enter navigates, Esc clears. Click-away and
 * route change close the panel.
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DocsSearch({ index = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const scored = [];
    for (const doc of index) {
      const title = doc.title.toLowerCase();
      const text = (doc.text || '').toLowerCase();
      let score = 0;
      if (title === q) score = 100;
      else if (title.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else if (text.includes(q)) score = 30;
      if (score > 0) scored.push({ doc, score });
    }
    scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
    return scored.slice(0, 8).map((s) => s.doc);
  }, [query, index]);

  // Reset the highlighted row whenever the result set changes.
  useEffect(() => setActive(0), [query]);

  // Close on click outside.
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function go(href) {
    setOpen(false);
    setQuery('');
    router.push(href);
  }

  function onKeyDown(e) {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active].href); }
    else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginBottom: 24 }}>
      <input
        type="search"
        value={query}
        placeholder="Search the docs…"
        aria-label="Search the docs"
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        style={{
          width: '100%',
          padding: '9px 12px',
          fontSize: 14,
          border: '1px solid #d8d6cf',
          borderRadius: 8,
          background: '#fff',
          color: 'var(--color-body)',
          outline: 'none',
        }}
      />

      {open && results.length > 0 && (
        <ul
          className="list-unstyled"
          style={{
            position: 'absolute',
            zIndex: 10,
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            margin: 0,
            padding: 6,
            background: '#fff',
            border: '1px solid #e2e0d9',
            borderRadius: 10,
            boxShadow: '0 12px 30px rgba(20,24,31,0.12)',
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {results.map((doc, i) => (
            <li key={doc.href}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(doc.href)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  border: 'none',
                  borderRadius: 6,
                  background: i === active ? '#f2f0ec' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-heading, #14181f)' }}>
                  {doc.title}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--color-gray-1, #6b7280)' }}>
                  {doc.section}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && (
        <div
          style={{
            position: 'absolute', zIndex: 10, top: 'calc(100% + 6px)', left: 0, right: 0,
            padding: '10px 12px', background: '#fff', border: '1px solid #e2e0d9',
            borderRadius: 10, fontSize: 13, color: 'var(--color-gray-1, #6b7280)',
          }}
        >
          No matches for “{query.trim()}”.
        </div>
      )}
    </div>
  );
}
