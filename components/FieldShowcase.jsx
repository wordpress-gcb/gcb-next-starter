'use client';

/**
 * FieldShowcase — server-rendered already by gcb-lite (see
 * examples/themes/gcb-saas-theme/blocks/field-showcase/render.php).
 *
 * The PHP-side does the heavy lifting because it has the live values
 * AND the field config in one place. The React frontend just inherits
 * that rendered HTML via `innerHtml` (the component-server pipeline
 * passes through the full block HTML) and reproduces it.
 *
 * If you want a different visual treatment on the public frontend vs
 * the WP-admin preview, this is where to swap. For now the two render
 * identically — the demo's value is consistency between editor preview
 * and live site.
 *
 * Block: gcb/field-showcase
 */

export default function FieldShowcase({ innerHtml = '' }) {
  if (innerHtml) {
    return (
      <div
        className="gcb-field-showcase-react-wrap"
        // The PHP renderer emits the full structure including its
        // wrapper. We hand-off untouched. Safe: WP has already kses'd
        // the values through wp_kses_post in the rich-text fields, and
        // every other field type emits via esc_html / esc_url / esc_attr.
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    );
  }

  // Fallback when there's no SSR'd HTML — shouldn't happen on the
  // component-server path but defensive for direct mounts.
  return (
    <div style={{ padding: 24, color: '#525260' }}>
      <p>Field showcase: no content available.</p>
      <p style={{ fontSize: 12 }}>
        The PHP-side render.php should have provided HTML for this block.
        Check that the block is correctly registered.
      </p>
    </div>
  );
}
