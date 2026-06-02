/**
 * SaasProjects — server-component wrapper.
 *
 * Resolves the data (CPT records or sample fallback), normalises the
 * heading/subtitle/description, then delegates rendering to
 * SaasProjectsView (a pure function component). The View is shared
 * with the WP theme's client-side hydration bundle, so the same render
 * happens in three places:
 *   - Next.js server (here, this wrapper)
 *   - Vercel-rendered HTML, hydrated by Next.js (also via this wrapper)
 *   - WP theme: render.php pre-fetches, theme.js hydrates View directly
 */

import { getCptCollection } from '@/lib/wpRestClient';
import SaasProjectsView from './SaasProjectsView';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

// Fallback when the CPT is empty. Reskinned to look like real GCB-built
// products rather than Saas's source agency portfolio.
const SAMPLE_PROJECTS = [
  { id: 13, image: '/images/project/project-1.png', title: 'Postwave CMS Marketing', category: ['SaaS site', 'Next.js'] },
  { id: 14, image: '/images/project/project-4.png', title: 'Beacon Analytics',       category: ['Web app', 'React'] },
  { id: 15, image: '/images/project/project-2.png', title: 'Glide Editorial',        category: ['Publishing', 'Next.js'] },
  { id: 16, image: '/images/project/project-3.png', title: 'Atlas Docs Hub',         category: ['Docs', 'MDX'] },
];

export default async function SaasProjects({ attributes = {} }) {
  const heading = {
    text:  attributes.heading?.text  || 'Selected work',
    level: HEADING_LEVELS.has(attributes.heading?.level) ? attributes.heading.level : 'h2',
  };
  const subtitle    = attributes.subtitle    || 'Built with GCB';
  const description = attributes.description || 'Real sites running typed-field Gutenberg blocks rendered through a React frontend. Same component in the editor and on the live page.';

  const cptItems = await getCptCollection('project', attributes).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapCptToCard) : SAMPLE_PROJECTS;

  return (
    <SaasProjectsView
      heading={heading}
      subtitle={subtitle}
      description={description}
      items={items}
    />
  );
}

/**
 * Normalise a WP REST project entity into the View's expected shape.
 * Mirrored on the PHP side in saas-projects/render.php so both
 * paths produce identical data-props.
 */
function mapCptToCard(entity) {
  const cover = entity?.meta?.cover;
  const terms = entity?._embedded?.['wp:term']?.flat() || [];
  return {
    id:    entity.id,
    image: cover?.url || '/images/project/project-7.png',
    title: stripHtml(entity?.title?.rendered || ''),
    category: terms
      .filter((t) => t.taxonomy === 'project_category')
      .map((t) => t.name),
    link:  entity.link,
  };
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
