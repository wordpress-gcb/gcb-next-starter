/**
 * AbstrakBanner — wired to WP. Reads from the block's `attributes`
 * (Inspector controls in WP admin) and falls back to Abstrak's sample
 * copy when a field is empty, so a freshly-inserted block already looks
 * fully designed in the editor preview. Authors then replace the bits
 * they care about.
 *
 * Markup ported verbatim from Abstrak's BannerFour.js (.banner
 * .banner-style-4 and everything inside). The CSS at
 * abstrak-scss/template/_banner.scss styles it.
 *
 * Attributes (all optional — empty falls back to sample):
 *   heading:       { text, level }                — heading-level field
 *   body:          string                          — textarea
 *   image:         { url, alt, focalPoint, ... }  — image field
 *   primary_cta:   { url, text, opensInNewTab }   — url field
 *   secondary_cta: { url, text, opensInNewTab }   — saved on the block
 *                                                   but not rendered by
 *                                                   the BannerFour layout
 *                                                   (kept for future
 *                                                   variants)
 *   facebook / twitter / linkedin: url-shaped objects
 */

import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { img } from './imageBase';

// Abstrak's hero sample copy — used when the matching attribute is
// empty. Means an unedited block in the editor previews fully styled
// rather than blank.
const SAMPLE = {
  heading:  'Building custom Gutenberg blocks should be this easy.',
  body:     "One JSON file defines your fields. 30+ premium controls render natively in the Inspector — image focal points, galleries, repeaters, post relationships, conditional logic.\n\nGo headless: write one React component, get pixel-perfect 1:1 previews in wp-admin and on your public site. Or render in PHP if React's overkill. Your choice, per block.",
  ctaText:  'View on GitHub',
  ctaHref:  'https://github.com/wordpress-gcb/gutenberg-control-blocks-lite',
  image:    '/images/banner/banner-thumb-7.png',
  socials: {
    facebook: 'https://facebook.com/',
    twitter:  'https://twitter.com/',
    linkedin: 'https://www.linkedin.com/',
  },
};

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export default function AbstrakBanner({ attributes = {} }) {
  const heading = attributes.heading || {};
  const HeadingTag = HEADING_LEVELS.has(heading.level) ? heading.level : 'h1';
  const headingText = heading.text || SAMPLE.heading;

  const body = attributes.body || SAMPLE.body;

  // image field stores { url, alt, focalPoint, size, customWidth, ... }
  // Honour .url + .alt only here — focalPoint etc. only matter when the
  // hero crops; Abstrak's hero is full-image so they don't apply.
  const image = attributes.image && attributes.image.url
    ? attributes.image
    : { url: SAMPLE.image, alt: '' };

  const primaryCta = attributes.primary_cta || {};
  const primaryHref   = primaryCta.url  || SAMPLE.ctaHref;
  const primaryLabel  = primaryCta.text || SAMPLE.ctaText;
  const primaryTarget = primaryCta.opensInNewTab ? '_blank' : undefined;
  const primaryRel    = primaryCta.opensInNewTab ? 'noopener noreferrer' : undefined;

  const facebook = (attributes.facebook && attributes.facebook.url) || SAMPLE.socials.facebook;
  const twitter  = (attributes.twitter  && attributes.twitter.url)  || SAMPLE.socials.twitter;
  const linkedin = (attributes.linkedin && attributes.linkedin.url) || SAMPLE.socials.linkedin;

  return (
    <div className="banner banner-style-4">
      <div className="container">
        <div className="banner-content">
          <HeadingTag className="title">{headingText}</HeadingTag>
          {body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <div>
            <a
              href={primaryHref}
              target={primaryTarget}
              rel={primaryRel}
              className="axil-btn btn-fill-primary btn-large"
            >
              {primaryLabel}
            </a>
          </div>
        </div>
        <div className="banner-thumbnail">
          <div className="large-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(image.url)} alt={image.alt || ''} />
          </div>
        </div>
        <div className="banner-social">
          <div className="border-line" />
          <ul className="list-unstyled social-icon">
            <li><a href={facebook}><FaFacebookF /> Facebook</a></li>
            <li><a href={twitter}><FaTwitter /> twitter</a></li>
            <li><a href={linkedin}><FaLinkedinIn /> Linkedin</a></li>
          </ul>
        </div>
      </div>
      <ul className="list-unstyled shape-group-19">
        {/* eslint-disable @next/next/no-img-element */}
        <li className="shape shape-1"><img src={img('/images/others/bubble-29.png')} alt="" /></li>
        <li className="shape shape-2"><img src={img('/images/others/line-7.png')} alt="" /></li>
        {/* eslint-enable @next/next/no-img-element */}
      </ul>
    </div>
  );
}
