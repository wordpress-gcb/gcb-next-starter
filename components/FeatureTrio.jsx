import Repeater from './Repeater';

/**
 * Feature Trio — a three-column section of FeatureItems. Items live as
 * inner blocks (gcb/feature-item). The parent renders just the header
 * and delegates to Repeater for the items.
 */
export default function FeatureTrio({ attributes = {}, innerBlocks = [] }) {
  const { eyebrow = '', heading = '', intro = '' } = attributes;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {(eyebrow || heading || intro) && (
        <div className="text-center max-w-2xl mx-auto mb-12">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-3">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              {heading}
            </h2>
          )}
          {intro && (
            <p className="text-lg text-neutral-600">{intro}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Repeater
          blocks={innerBlocks}
          allowedBlocks={['gcb/feature-item']}
          addButtonLabel="Add feature"
          min={1}
          defaultChildren={3}
        />
      </div>
    </section>
  );
}
