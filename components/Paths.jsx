'use client';

/**
 * Paths — the choose-your-stack tab group for docs.
 *
 * Renders the bodies emitted by the :::paths directive (see
 * lib/remark-paths.js). Where <CodeTabs> switches one code snippet between
 * languages, <Paths> switches a whole walkthrough — prose, multiple code
 * blocks, callouts — between "I'm building in PHP" and "I'm building my
 * frontend in JS".
 *
 * Children are the rendered <pathpanel label="…"> elements. We read the
 * labels off them to build the tab bar, then show only the active panel.
 *
 * The choice is about the READER, not this one example: it's keyed on the
 * label text, persisted to localStorage, and broadcast so every <Paths> on
 * the page (and the next page) lands on the same tab. Pick "JS" once and the
 * whole docs site follows.
 */

import { Children, useEffect, useState } from 'react';

const STORAGE_KEY = 'gcb-docs-path';
const EVENT = 'gcb-docs-path-change';

// The pathpanel renderer (see docsMarkdown.jsx) outputs
// <div data-path-label="…">, so the label lives on that prop, not `label`.
function panelLabel(child, i) {
  return child?.props?.['data-path-label'] ?? child?.props?.label ?? `Tab ${i + 1}`;
}

// Pick an icon from the label text. PHP labels get the elephant-tusk wordmark
// shape; anything mentioning JS / React / frontend gets code brackets. Falls
// back to a generic doc icon so an unrecognised label still renders cleanly.
function PathIcon({ label }) {
  const l = label.toLowerCase();
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, style: { flex: 'none' } };
  if (l.includes('php')) {
    // Stylised "php" mark — an ellipse with the letters, recognisable at a glance.
    return (
      <svg {...common} viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="11" ry="6.5" stroke="currentColor" strokeWidth="1.6" />
        <text x="12" y="15" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="ui-monospace, monospace">php</text>
      </svg>
    );
  }
  if (l.includes('js') || l.includes('javascript') || l.includes('react') || l.includes('frontend') || l.includes('vue')) {
    // Code brackets </>
    return (
      <svg {...common}>
        <path d="M8 6 L3 12 L8 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 6 L21 12 L16 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 4 L10.5 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  // Generic doc icon.
  return (
    <svg {...common}>
      <path d="M6 3 h8 l4 4 v14 H6 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3 v4 h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Paths({ children }) {
  const panels = Children.toArray(children).filter(Boolean);
  const labels = panels.map(panelLabel);

  // Start on the first tab for SSR + first paint (deterministic — no
  // hydration mismatch). The persisted choice is applied in an effect.
  const [active, setActive] = useState(0);

  // Apply any stored choice on mount, and keep this instance in sync when
  // another <Paths> (this page or a prior one) changes the selection.
  useEffect(() => {
    const apply = (label) => {
      if (!label) return;
      const idx = labels.indexOf(label);
      if (idx >= 0) setActive(idx);
    };

    try {
      apply(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      /* localStorage blocked (private mode / SSR) — first tab is fine */
    }

    const onChange = (e) => apply(e.detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
    // labels is derived from children and stable across renders for a given
    // doc; intentionally not depended-on to avoid re-subscribing each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (panels.length === 0) return null;
  // Single path → no chooser chrome, just render the body.
  if (panels.length === 1) return <div style={{ marginBottom: 22 }}>{panels[0]}</div>;

  const choose = (i) => {
    setActive(i);
    const label = labels[i];
    try {
      window.localStorage.setItem(STORAGE_KEY, label);
    } catch {
      /* ignore */
    }
    // Sync sibling instances on the same page immediately.
    window.dispatchEvent(new CustomEvent(EVENT, { detail: label }));
  };

  const tabId = (i) => `gcb-path-tab-${labels[i].replace(/\W+/g, '-').toLowerCase()}`;
  const panelId = (i) => `gcb-path-panel-${labels[i].replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Folder-style tabs: the strip sits on a track, and the active tab is a
          raised white "card" with rounded top corners whose bottom edge merges
          into the panel container below (active tab has no bottom border, so it
          reads as one continuous surface). Unmistakably tabs, not links. */}
      <div
        role="tablist"
        aria-label="Choose your stack"
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          padding: '6px 6px 0',
          background: '#f2f0ec',
          borderRadius: '10px 10px 0 0',
          border: '1px solid #e3e0d8',
          borderBottom: 'none',
        }}
      >
        {labels.map((label, i) => {
          const isActive = i === active;
          return (
            <button
              key={label}
              id={tabId(i)}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId(i)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => choose(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') choose((active + 1) % labels.length);
                if (e.key === 'ArrowLeft') choose((active - 1 + labels.length) % labels.length);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? 'var(--color-primary, #2563eb)' : 'var(--color-gray-1, #6b7280)',
                border: isActive ? '1px solid #e3e0d8' : '1px solid transparent',
                borderBottom: isActive ? '1px solid #fff' : '1px solid transparent',
                // Drop the active tab 1px onto the panel's top border so the
                // white bottom edge erases the seam → continuous surface.
                marginBottom: -1,
                borderRadius: '8px 8px 0 0',
                padding: '10px 16px',
                fontSize: 14.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 120ms ease, color 120ms ease',
              }}
            >
              <PathIcon label={label} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Panel container — bordered box the active tab connects into. */}
      <div
        style={{
          border: '1px solid #e3e0d8',
          borderRadius: '0 8px 8px 8px',
          padding: '4px 20px 20px',
          background: '#fff',
        }}
      >
        {/* Quiet hint so a reader knows the tabs swap content in place. */}
        <p style={{ margin: '12px 0 4px', fontSize: 12.5, color: 'var(--color-gray-1, #9ca3af)' }}>
          Same block — pick the stack you build in. Switching tabs stays on this page.
        </p>

        {panels.map((panel, i) => (
          <div
            key={labels[i]}
            id={panelId(i)}
            role="tabpanel"
            aria-labelledby={tabId(i)}
            hidden={i !== active}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
