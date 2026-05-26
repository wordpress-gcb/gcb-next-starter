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

// Saas demo — section blocks composed in WP, rendered here. CPT-driven
// blocks (projects, testimonials, brands, blog) are server components that
// fetch their data via the WP REST API.
import SaasBanner            from '../../components/SaasBanner';
import SaasProjects          from '../../components/SaasProjects';
import SaasTestimonials      from '../../components/SaasTestimonials';
import SaasBrands            from '../../components/SaasBrands';
import SaasBlog              from '../../components/SaasBlog';
import SaasCta               from '../../components/SaasCta';
import SaasSectionText       from '../../components/SaasSectionText';
import SaasIconAccordion     from '../../components/SaasIconAccordion';
import SaasIconAccordionItem from '../../components/SaasIconAccordionItem';

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

  // Saas demo
  'gcb/saas-banner':               SaasBanner,
  'gcb/saas-projects':             SaasProjects,
  'gcb/saas-testimonials':         SaasTestimonials,
  'gcb/saas-brands':               SaasBrands,
  'gcb/saas-blog':                 SaasBlog,
  'gcb/saas-cta':                  SaasCta,
  'gcb/saas-section-text':         SaasSectionText,
  'gcb/saas-icon-accordion':       SaasIconAccordion,
  'gcb/saas-icon-accordion-item':  SaasIconAccordionItem,
};
