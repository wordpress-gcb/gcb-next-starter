/**
 * SaasTestimonials — server-component wrapper.
 *
 * Resolves CPT records or sample fallback, normalises, delegates to
 * SaasTestimonialsView.
 *
 * Testimonial CPT data shape (gcb-saas theme):
 *   title.rendered             — author name
 *   meta.quote                 — string
 *   meta.author_name           — string
 *   meta.author_role           — string
 *   meta.author_image          — image-control object
 *   meta.from_label            — string (e.g. "Google", "Yelp")
 *   meta.from_logo             — image-control object
 */

import { getCptCollection } from '@/lib/wpRestClient';
import SaasTestimonialsView from './SaasTestimonialsView';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const SAMPLE_TESTIMONIALS = [
  {
    id:           1,
    from:         '/images/icon/yelp-2.png',
    fromtext:     'Yelp',
    description:  '“ Donec metus lorem, vulputate at sapien sit amet, auctor iaculis lorem. In vel hendrerit nisi. Vestibulum eget risus velit. ”',
    authorimg:    '/images/testimonial/testimonial-1.png',
    authorname:   'Darrell Steward',
    authordesig:  'Executive Chairman',
  },
  {
    id:           2,
    from:         '/images/icon/google-2.png',
    fromtext:     'Google',
    description:  '“ Donec metus lorem, vulputate at sapien sit amet, auctor iaculis lorem. In vel hendrerit nisi. Vestibulum eget risus velit. ”',
    authorimg:    '/images/testimonial/testimonial-2.png',
    authorname:   'Savannah Nguyen',
    authordesig:  'Executive Chairman',
  },
  {
    id:           3,
    from:         '/images/icon/fb-2.png',
    fromtext:     'Facebook',
    description:  '“ Donec metus lorem, vulputate at sapien sit amet, auctor iaculis lorem. In vel hendrerit nisi. Vestibulum eget risus velit. ”',
    authorimg:    '/images/testimonial/testimonial-3.png',
    authorname:   'Floyd Miles',
    authordesig:  'Executive Chairman',
  },
];

export default async function SaasTestimonials({ attributes = {} }) {
  const heading = {
    text:  attributes.heading?.text  || 'What teams say after shipping with it',
    level: HEADING_LEVELS.has(attributes.heading?.level) ? attributes.heading.level : 'h2',
  };
  const subtitle    = attributes.subtitle    || 'Field reports';
  const description = attributes.description || 'Frontend engineers and editors talking about the editor-frontend parity story and the typed-field workflow.';

  const cptItems = await getCptCollection('testimonial', attributes).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapCptToCard) : SAMPLE_TESTIMONIALS;

  return (
    <SaasTestimonialsView
      heading={heading}
      subtitle={subtitle}
      description={description}
      items={items}
    />
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

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
