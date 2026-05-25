/**
 * Block name (gcb/{slug}) → React component.
 *
 * To wire up a new block:
 *   1. Add the block.json + block.fields.json under the theme's blocks/ dir.
 *   2. Build the React component in ../../components/.
 *   3. Register it here.
 *
 * Components can export either:
 *   export default function MyBlock({ attributes }) {...}
 * or:
 *   export default { admin: AdminComponent, frontend: FrontendComponent }
 *     — useful when the editor preview should differ from the public render
 *       (e.g. heavy animation off in admin).
 */

// Reference blocks (also present on main).
import Accordion from '../../components/Accordion';
import AccordionItem from '../../components/AccordionItem';
import TextImage from '../../components/TextImage';
import Gallery from '../../components/Gallery';

// Marketing blocks (this branch only).
import Hero from '../../components/Hero';
import FeatureTrio from '../../components/FeatureTrio';
import FeatureItem from '../../components/FeatureItem';
import Cta from '../../components/Cta';

// Abstrak demo — section blocks composed in WP, rendered here. CPT-driven
// blocks (projects, testimonials, brands, blog) are server components that
// fetch their data via the WP REST API.
import AbstrakBanner            from '../../components/AbstrakBanner';
import AbstrakProjects          from '../../components/AbstrakProjects';
import AbstrakTestimonials      from '../../components/AbstrakTestimonials';
import AbstrakBrands            from '../../components/AbstrakBrands';
import AbstrakBlog              from '../../components/AbstrakBlog';
import AbstrakCta               from '../../components/AbstrakCta';
import AbstrakSectionText       from '../../components/AbstrakSectionText';
import AbstrakIconAccordion     from '../../components/AbstrakIconAccordion';
import AbstrakIconAccordionItem from '../../components/AbstrakIconAccordionItem';

export const WP_BLOCK_REGISTRY = {
  // Reference
  'gcb/accordion-test': Accordion,
  'gcb/accordion-test-item': AccordionItem,
  'gcb/text-image': TextImage,
  'gcb/gallery-test': Gallery,

  // Marketing
  'gcb/hero': Hero,
  'gcb/feature-trio': FeatureTrio,
  'gcb/feature-item': FeatureItem,
  'gcb/cta': Cta,

  // Abstrak demo
  'gcb/abstrak-banner':               AbstrakBanner,
  'gcb/abstrak-projects':             AbstrakProjects,
  'gcb/abstrak-testimonials':         AbstrakTestimonials,
  'gcb/abstrak-brands':               AbstrakBrands,
  'gcb/abstrak-blog':                 AbstrakBlog,
  'gcb/abstrak-cta':                  AbstrakCta,
  'gcb/abstrak-section-text':         AbstrakSectionText,
  'gcb/abstrak-icon-accordion':       AbstrakIconAccordion,
  'gcb/abstrak-icon-accordion-item':  AbstrakIconAccordionItem,
};
