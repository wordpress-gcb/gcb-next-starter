/**
 * One feature card. Renders as a Tailwind card with an optional icon.
 * Standalone-safe (doesn't depend on parent context); when shown in the
 * editor as a standalone preview it looks reasonable.
 */
export default function FeatureItem({ attributes = {} }) {
  const { icon, title = '', body = '' } = attributes;
  const dashicon = icon?.icon;

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      {dashicon && (
        <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 grid place-items-center mb-4">
          <span className={`dashicons dashicons-${dashicon}`} style={{ fontSize: 24, width: 24, height: 24 }} />
        </div>
      )}
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        {title || <span className="text-neutral-400 italic">Untitled feature</span>}
      </h3>
      {body && (
        <p className="text-neutral-600 leading-relaxed">{body}</p>
      )}
    </div>
  );
}
