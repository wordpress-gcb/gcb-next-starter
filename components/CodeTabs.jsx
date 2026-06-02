'use client';

/**
 * CodeTabs — Panda-CSS-style tabbed code snippet.
 *
 * GCB blocks render two ways: server-side in PHP (`render.php`) or
 * client-side in React (component server). Docs that show "how to
 * consume" should always show both paths so a reader can pick the one
 * that matches their stack.
 *
 * Usage:
 *
 *   <CodeTabs tabs={[
 *     { label: 'React',  lang: 'jsx', code: '...' },
 *     { label: 'PHP',    lang: 'php', code: '...' },
 *   ]} />
 *
 * First tab is active by default. The active tab key is local to each
 * instance (no global "preferred language" sync yet — could be added
 * later via localStorage if it proves useful).
 */

import { useState } from 'react';

export default function CodeTabs({ tabs = [] }) {
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;
  const current = tabs[active] || tabs[0];

  return (
    <div style={{ marginBottom: 22 }}>
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid #2a2b2f',
          background: '#1c1d20',
          borderRadius: '8px 8px 0 0',
          padding: '6px 8px 0',
        }}
      >
        {tabs.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={tab.label}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActive(i)}
              style={{
                background: isActive ? '#2a2b2f' : 'transparent',
                color:      isActive ? '#f0eee6' : '#9ca3af',
                border: 'none',
                padding: '8px 14px',
                fontSize: 12.5,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: 0.3,
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                transition: 'color 120ms ease, background 120ms ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <pre
        style={{
          background: '#1c1d20',
          color: '#f0eee6',
          padding: '18px 20px',
          borderRadius: '0 0 8px 8px',
          margin: 0,
          overflowX: 'auto',
          fontSize: 13.5,
          lineHeight: 1.6,
        }}
      >
        <code className={current.lang ? `language-${current.lang}` : undefined}>
          {current.code}
        </code>
      </pre>
    </div>
  );
}
