/**
 * AbstrakCta — wired to WP. Markup from Abstrak's CtaLayoutOne.js;
 * heading + body + CTA all read from the block's attrs with sample
 * fallbacks. Background bubbles + foreground images stay fixed
 * (they're Abstrak's brand identity, not authored content).
 *
 * Attributes (all optional):
 *   heading: { text, level }                  — heading-level field
 *   body:    string                           — textarea (not currently
 *                                               rendered by the CTA layout
 *                                               itself; Abstrak shows the
 *                                               heading + subtitle only,
 *                                               so we wire `body` as a
 *                                               subtitle override)
 *   cta:     { url, text, opensInNewTab }
 */

const SAMPLE = {
  subtitle: 'Open source — MIT',
  heading:  'Ready to ship typed Gutenberg blocks?',
  ctaText:  'View on GitHub',
  ctaHref:  'https://github.com/wordpress-gcb/gutenberg-control-blocks-lite',
};

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export default function AbstrakCta({ attributes = {} }) {
  const heading = attributes.heading || {};
  const HeadingTag = HEADING_LEVELS.has(heading.level) ? heading.level : 'h2';
  const headingText = heading.text || SAMPLE.heading;

  // The CTA's "subtitle" slot above the headline is short — we reuse
  // `body` for that. Authors who want full prose under the heading
  // would need a richer CTA variant; this matches Abstrak's layout.
  const subtitle = attributes.body || SAMPLE.subtitle;

  const cta = attributes.cta || {};
  const ctaHref   = cta.url  || SAMPLE.ctaHref;
  const ctaLabel  = cta.text || SAMPLE.ctaText;
  const ctaTarget = cta.opensInNewTab ? '_blank' : undefined;
  const ctaRel    = cta.opensInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div className="section call-to-action-area">
      <div className="container">
        <div className="call-to-action">
          <div className="section-heading heading-light">
            <span className="subtitle">{subtitle}</span>
            <HeadingTag className="title">{headingText}</HeadingTag>
            <a
              href={ctaHref}
              target={ctaTarget}
              rel={ctaRel}
              className="axil-btn btn-large btn-fill-white"
            >
              {ctaLabel}
            </a>
          </div>
          <div className="thumbnail">
            <div className="larg-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="paralax-image" src="/images/others/chat-group.png" alt="Chat" />
            </div>
            <ul className="list-unstyled small-thumb">
              <li className="shape shape-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="paralax-image" src="/images/others/laptop-poses.png" alt="Laptop" />
              </li>
              <li className="shape shape-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="paralax-image" src="/images/others/bill-pay.png" alt="Bill" />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <ul className="list-unstyled shape-group-9">
        {/* eslint-disable @next/next/no-img-element */}
        <li className="shape shape-1"><img src="/images/others/bubble-12.png" alt="" /></li>
        <li className="shape shape-2"><img src="/images/others/bubble-16.png" alt="" /></li>
        <li className="shape shape-3"><img src="/images/others/bubble-13.png" alt="" /></li>
        <li className="shape shape-4"><img src="/images/others/bubble-14.png" alt="" /></li>
        <li className="shape shape-5"><img src="/images/others/bubble-16.png" alt="" /></li>
        <li className="shape shape-6"><img src="/images/others/bubble-15.png" alt="" /></li>
        <li className="shape shape-7"><img src="/images/others/bubble-16.png" alt="" /></li>
        {/* eslint-enable @next/next/no-img-element */}
      </ul>
    </div>
  );
}
