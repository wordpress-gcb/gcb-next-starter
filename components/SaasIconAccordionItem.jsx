/**
 * SaasIconAccordionItem — placeholder component.
 *
 * The parent SaasIconAccordion reads each item's `attrs` directly
 * from `innerBlocks`; it doesn't recurse into rendering each item as
 * its own block. This component exists only so that:
 *
 *   1. The block registry has an entry for gcb/saas-icon-accordion-item
 *      (otherwise BlockRenderer would route it to /render-batch when
 *      encountered standalone).
 *   2. If someone drops an accordion item OUTSIDE an accordion — which
 *      shouldn't happen because the parent restricts allowedblocks, but
 *      defensively — we render something readable rather than empty.
 *
 * Normal flow: parent owns the rendering; this component never runs.
 */

export default function SaasIconAccordionItem({ attributes = {} }) {
  const { icon = '', title = '', body = '' } = attributes;
  if (!title) return null;

  return (
    <div className="border border-saas-light rounded-lg p-4 my-2 bg-white">
      <p className="font-semibold text-sm text-saas-text-dark m-0 mb-1">
        {icon && <span className="text-xs text-saas-primary mr-2">[{icon}]</span>}
        {title}
      </p>
      {body && <p className="text-sm text-saas-body m-0">{body}</p>}
    </div>
  );
}
