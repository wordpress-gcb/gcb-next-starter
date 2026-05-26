import { getComponentBySlug } from '@/wordpress/config/wpBlockHelpers';
import { renderBlocksViaPlugin } from '@/lib/wpRestClient';

/**
 * Walk a parsed block tree and render each one.
 *
 * Rules per block:
 *   - gcb/* with a React component in WP_BLOCK_REGISTRY → render the component
 *   - gcb/* without a React component               → fetch HTML from the
 *                                                     plugin's /render-batch
 *                                                     (falls back to
 *                                                     render.php / component
 *                                                     server)
 *   - core/columns + core/column                    → render as a flex
 *                                                     row + columns, recurse
 *                                                     into innerBlocks per
 *                                                     column. Unlocks
 *                                                     "compose two-column
 *                                                     layouts in wp-admin,
 *                                                     render them here"
 *                                                     without each section
 *                                                     block needing its own
 *                                                     layout control.
 *   - other core blocks                             → use the parser's
 *                                                     innerHTML directly
 *   - blank/whitespace blocks                       → skip
 *
 * This is a server component — fetching happens during SSR, not on the client.
 */
export default async function BlockRenderer({ blocks, blockDefaults = {} }) {
  if (!blocks?.length) return null;

  // Merge the registered defaults under the saved attrs. WP only persists
  // values that differ from defaults, so without this the React components
  // see `undefined` for any default-valued field.
  const withDefaults = (block) => {
    if (!block?.blockName) return block;
    const defaults = blockDefaults[block.blockName];
    if (!defaults) return block;
    return { ...block, attrs: { ...defaults, ...(block.attrs || {}) } };
  };

  const resolvedBlocks = blocks.map(withDefaults);

  // First pass: figure out which gcb blocks need an HTTP render. Group those
  // into one batched request and assign each block an index so we can stitch
  // results back in order. core/columns + core/column are handled by
  // dedicated branches below — they don't go to render-batch.
  const renderRequests = [];
  const blockTags = resolvedBlocks.map((block, i) => {
    if (!block?.blockName) return { kind: 'skip' };

    if (block.blockName === 'core/columns') return { kind: 'columns' };
    if (block.blockName === 'core/column')  return { kind: 'column' };

    if (block.blockName.startsWith('gcb/')) {
      const slug = block.blockName.slice('gcb/'.length);
      if (getComponentBySlug(slug)) {
        return { kind: 'react', slug };
      }
      const requestIndex = renderRequests.length;
      renderRequests.push({
        clientId: `block-${i}`,
        blockName: block.blockName,
        attributes: block.attrs || {},
        innerBlocks: block.innerBlocks || [],
      });
      return { kind: 'remote', requestIndex };
    }
    return { kind: 'core' };
  });

  let remoteResults = {};
  if (renderRequests.length > 0) {
    remoteResults = await renderBlocksViaPlugin(renderRequests);
  }

  return (
    <>
      {resolvedBlocks.map((block, i) => {
        const tag = blockTags[i];

        if (tag.kind === 'skip') return null;

        if (tag.kind === 'react') {
          const Entry = getComponentBySlug(tag.slug);
          const Component = Entry.frontend || Entry;
          return (
            <Component
              key={i}
              attributes={block.attrs || {}}
              innerBlocks={block.innerBlocks || []}
            />
          );
        }

        if (tag.kind === 'columns') {
          return <ColumnsRow key={i} block={block} blockDefaults={blockDefaults} />;
        }

        if (tag.kind === 'column') {
          // A bare core/column rendered at the top level — degenerate
          // case (the WP editor doesn't usually produce this). Render
          // as a single-column flex item so we still emit something
          // readable rather than dropping the content.
          return <ColumnInner key={i} block={block} blockDefaults={blockDefaults} />;
        }

        if (tag.kind === 'remote') {
          const html = remoteResults[`block-${i}`] || '';
          if (!html.trim()) return null;
          return (
            /* eslint-disable-next-line react/no-danger */
            <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
          );
        }

        // Other core block.
        const html = block.innerHTML || (block.innerContent || []).filter(Boolean).join('');
        if (!html.trim()) return null;
        return (
          /* eslint-disable-next-line react/no-danger */
          <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </>
  );
}

/**
 * core/columns → Bootstrap .container > .row markup so Saas's CSS
 * lands in the layout context it expects. The .section-padding /
 * .single-portfolio-area shell mirrors Saas's project-details
 * template — that's the section type the wordpress-theme page is
 * patterned on, and it's where Saas ships its right padding /
 * max-width / typography rules for .section-heading.
 *
 * If you're rendering a different layout shell (e.g. about-us with
 * different padding), wrap your columns in your own section instead
 * and remove the .section-padding wrapper here — but for now this
 * matches the only example we need.
 */
function ColumnsRow({ block, blockDefaults }) {
  const columns = block.innerBlocks || [];

  // Resolve each column to its Bootstrap class first so we can detect
  // common Saas patterns (5+6 portfolio split → add offset-xl-1 to
  // the 6-col, etc.) before rendering.
  const widths = columns.map((col) =>
    col?.attrs?.width ? widthToBootstrapCol(col.attrs.width) : 'col-lg'
  );

  return (
    <section className="section-padding single-portfolio-area">
      <div className="container">
        <div className="row">
          {columns.map((col, i) => (
            <ColumnInner
              key={i}
              block={col}
              blockDefaults={blockDefaults}
              colClass={resolveColClasses(widths, i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * core/column → Bootstrap .col-lg-N. WP stores the column width as a
 * string like "42%"; we round to the nearest twelfth so it maps to a
 * real Bootstrap column class. Falls back to .col-lg (auto-share the
 * remaining row) when no width is set.
 *
 * Why .col-lg-N (not .col-md-N)? Saas's templates use the lg
 * breakpoint, so columns stack below 992px — same behaviour as the
 * source theme. If you want them side-by-side earlier, swap to
 * .col-md-N here.
 */
function ColumnInner({ block, blockDefaults, colClass }) {
  return (
    <div className={colClass}>
      <BlockRenderer blocks={block.innerBlocks || []} blockDefaults={blockDefaults} />
    </div>
  );
}

/**
 * Add Saas's signature offsets to common column patterns.
 *
 * The 5+6 portfolio split in Saas's own ProjectDetails template uses
 * `col-lg-6 offset-xl-1` on the second column — the extra 1/12 gap on
 * xl screens is what gives the layout its breathing room. WP doesn't
 * have an "offset" concept on core/column, so we infer it from the
 * width pattern.
 *
 * Patterns recognised:
 *   col-lg-5 + col-lg-6  → second gets `col-lg-6 offset-xl-1`
 *   col-lg-7 + col-lg-4  → second gets `col-lg-4 offset-xl-1` (mirror)
 *
 * Any pattern not recognised here just uses the raw col class. Add more
 * mappings as Saas's other layouts come into play.
 */
function resolveColClasses(widths, index) {
  const base = widths[index];

  // 5+6 portfolio pattern → offset the 6-col.
  if (widths.length === 2 && widths[0] === 'col-lg-5' && widths[1] === 'col-lg-6' && index === 1) {
    return 'col-lg-6 offset-xl-1';
  }
  if (widths.length === 2 && widths[0] === 'col-lg-7' && widths[1] === 'col-lg-4' && index === 1) {
    return 'col-lg-4 offset-xl-1';
  }

  return base;
}

/**
 * "42%" → "col-lg-5" (5/12 ≈ 41.7%).
 * "50%" → "col-lg-6"
 * "100px" or other non-% units → "col-lg" (let Bootstrap decide).
 */
function widthToBootstrapCol(width) {
  const match = /^(\d+(?:\.\d+)?)\s*%$/.exec(String(width).trim());
  if (!match) return 'col-lg';
  const pct = parseFloat(match[1]);
  const twelfths = Math.max(1, Math.min(12, Math.round((pct / 100) * 12)));
  return `col-lg-${twelfths}`;
}
