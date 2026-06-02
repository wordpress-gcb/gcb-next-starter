/**
 * Tiny prose + code presentational helpers, shared across /docs pages.
 *
 * - <H1> / <H2> / <H3>      — anchor-ready headings
 * - <P>                     — body paragraph
 * - <Code>                  — inline code chip
 * - <Pre lang="js"> ...     — block code with language badge
 * - <Callout type="note">   — coloured aside (note | warn | tip)
 * - <Field>                 — reference card for control config (key + type + description)
 *
 * Kept deliberately small. The goal is readable docs without adding MDX
 * or syntax-highlighting deps to the bundle.
 */

// scrollMarginTop keeps an #anchor target from landing under the ~90px
// fixed header when you jump to a heading via the URL hash or a TOC link.
export function H1({ children, id }) {
  return <h1 id={id} style={{ marginTop: 0, marginBottom: 16, scrollMarginTop: 110 }}>{children}</h1>;
}

export function H2({ children, id }) {
  return <h2 id={id} style={{ marginTop: 48, marginBottom: 12, fontSize: 28, scrollMarginTop: 110 }}>{children}</h2>;
}

export function H3({ children, id }) {
  return <h3 id={id} style={{ marginTop: 32, marginBottom: 10, fontSize: 22, scrollMarginTop: 110 }}>{children}</h3>;
}

export function P({ children }) {
  return <p style={{ marginBottom: 14, lineHeight: 1.7 }}>{children}</p>;
}

export function Code({ children }) {
  return (
    <code
      style={{
        background: '#f2f0ec',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: '0.92em',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      {children}
    </code>
  );
}

export function Pre({ lang = '', children }) {
  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      {lang && (
        <span
          style={{
            position: 'absolute', top: 8, right: 12,
            fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
            color: 'var(--color-gray-1)',
          }}
        >
          {lang}
        </span>
      )}
      <pre
        style={{
          background: '#1c1d20',
          color: '#f0eee6',
          padding: '18px 20px',
          borderRadius: 8,
          overflowX: 'auto',
          fontSize: 13.5,
          lineHeight: 1.6,
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function Callout({ type = 'note', children }) {
  const palette = {
    note: { bg: '#eaf3ff', border: '#3b82f6', label: 'Note' },
    warn: { bg: '#fff4e5', border: '#f59e0b', label: 'Heads up' },
    tip:  { bg: '#e7f7ee', border: '#10b981', label: 'Tip' },
  }[type] || { bg: '#eee', border: '#999', label: type };

  return (
    <div
      style={{
        background:  palette.bg,
        borderLeft:  `4px solid ${palette.border}`,
        padding:     '12px 16px',
        borderRadius:'0 6px 6px 0',
        marginBottom: 18,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>{palette.label}</strong>
      <div>{children}</div>
    </div>
  );
}

/**
 * Reference card for a single field control attribute / config key.
 * Use under an H3 that names the control.
 *
 * <Field name="default" type="any" required={false}>
 *   Initial value shown when the user hasn't edited the field.
 * </Field>
 */
export function Field({ name, type, required = false, children }) {
  return (
    <div style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Code>{name}</Code>
        <span style={{ color: 'var(--color-gray-1)', fontSize: 12 }}>{type}</span>
        {required && (
          <span style={{ color: '#dc2626', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            required
          </span>
        )}
      </div>
      <div style={{ marginTop: 6, color: 'var(--color-body)' }}>{children}</div>
    </div>
  );
}
