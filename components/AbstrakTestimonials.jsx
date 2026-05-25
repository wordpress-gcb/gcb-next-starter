/**
 * AbstrakTestimonials — wired to the `testimonial` CPT.
 *
 * Markup from Abstrak's TestimonialOne.js + TestimonialPropOne.js.
 * Data comes from the testimonial CPT registered by the gcb-abstrak
 * theme; falls back to Abstrak's three sample quotes when the CPT is
 * empty.
 *
 * Testimonial CPT data shape (set by examples/themes/gcb-abstrak/
 * functions.php):
 *   title.rendered             — author name (used as REST title)
 *   meta.quote                 — string (textarea)
 *   meta.author_name           — string
 *   meta.author_role           — string
 *   meta.author_image          — image-control object
 *   meta.from_label            — string (e.g. "Google", "Yelp")
 *   meta.from_logo             — image-control object
 *
 * Block attrs (all optional):
 *   heading: { text, level }
 *   subtitle:    string
 *   description: string
 *   source / count / post_ids  — collection-controls shape
 */

import { getCptCollection } from '@/lib/wpRestClient';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const SAMPLE_TESTIMONIALS = [
  {
    from:         '/images/icon/yelp-2.png',
    fromtext:     'Yelp',
    description:  '“ Donec metus lorem, vulputate at sapien sit amet, auctor iaculis lorem. In vel hendrerit nisi. Vestibulum eget risus velit. ”',
    authorimg:    '/images/testimonial/testimonial-1.png',
    authorname:   'Darrell Steward',
    authordesig:  'Executive Chairman',
  },
  {
    from:         '/images/icon/google-2.png',
    fromtext:     'Google',
    description:  '“ Donec metus lorem, vulputate at sapien sit amet, auctor iaculis lorem. In vel hendrerit nisi. Vestibulum eget risus velit. ”',
    authorimg:    '/images/testimonial/testimonial-2.png',
    authorname:   'Savannah Nguyen',
    authordesig:  'Executive Chairman',
  },
  {
    from:         '/images/icon/fb-2.png',
    fromtext:     'Facebook',
    description:  '“ Donec metus lorem, vulputate at sapien sit amet, auctor iaculis lorem. In vel hendrerit nisi. Vestibulum eget risus velit. ”',
    authorimg:    '/images/testimonial/testimonial-3.png',
    authorname:   'Floyd Miles',
    authordesig:  'Executive Chairman',
  },
];

export default async function AbstrakTestimonials({ attributes = {} }) {
  const heading = attributes.heading || {};
  const HeadingTag = HEADING_LEVELS.has(heading.level) ? heading.level : 'h2';
  const headingText = heading.text || 'What teams say after shipping with it';
  const subtitle    = attributes.subtitle    || 'Field reports';
  const description = attributes.description || 'Frontend engineers and editors talking about the editor-frontend parity story and the typed-field workflow.';

  const cptItems = await getCptCollection('testimonial', attributes).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapCptToCard) : SAMPLE_TESTIMONIALS;

  return (
    <div className="section section-padding">
      <div className="container">
        <SectionTitle
          subtitle={subtitle}
          title={headingText}
          HeadingTag={HeadingTag}
          description={description}
          textAlignment="heading-left"
        />
        <div className="row">
          {items.map((data, i) => (
            <div className="col-lg-4" key={data.id ?? i}>
              <TestimonialGrid data={data} />
            </div>
          ))}
        </div>
      </div>
      <ul className="shape-group-4 list-unstyled">
        <li className="shape-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/others/bubble-1.png" alt="" />
        </li>
      </ul>
    </div>
  );
}

function mapCptToCard(entity) {
  const m = entity.meta || {};
  return {
    id:           entity.id,
    fromtext:     m.from_label || '',
    from:         m.from_logo?.url || '',
    description:  m.quote || '',
    authorimg:    m.author_image?.url || '',
    authorname:   m.author_name || stripHtml(entity?.title?.rendered || ''),
    authordesig:  m.author_role || '',
  };
}

function SectionTitle({ subtitle, title, HeadingTag = 'h2', description, textAlignment, textColor = '' }) {
  return (
    <div className={`section-heading ${textAlignment} ${textColor}`}>
      <div className="subtitle">{subtitle}</div>
      <HeadingTag className="title">{title}</HeadingTag>
      <p>{description}</p>
    </div>
  );
}

function TestimonialGrid({ data }) {
  return (
    <div className="testimonial-grid">
      {data.from && (
        <span className="social-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.from} alt={data.fromtext} />
        </span>
      )}
      <p>{data.description}</p>
      <div className="author-info">
        {data.authorimg && (
          <div className="thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.authorimg} alt={data.authorname} />
          </div>
        )}
        <div className="content">
          <span className="name">{data.authorname}</span>
          <span className="designation">{data.authordesig}</span>
        </div>
      </div>
    </div>
  );
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
