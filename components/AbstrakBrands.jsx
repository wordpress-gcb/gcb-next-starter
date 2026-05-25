/**
 * AbstrakBrands — server-component wrapper. Resolves CPT data with a
 * sample fallback, delegates to AbstrakBrandsView for rendering.
 *
 * Brand CPT data shape (gcb-abstrak theme):
 *   title.rendered  — brand name
 *   meta.logo       — image-control object
 *   meta.website    — url-control object
 */

import { getCptCollection } from '@/lib/wpRestClient';
import AbstrakBrandsView from './AbstrakBrandsView';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const SAMPLE_BRANDS = [
  { id: 1, image: '/images/brand/brand-1.png', name: 'Brand 1' },
  { id: 2, image: '/images/brand/brand-2.png', name: 'Brand 2' },
  { id: 3, image: '/images/brand/brand-3.png', name: 'Brand 3' },
  { id: 4, image: '/images/brand/brand-4.png', name: 'Brand 4' },
  { id: 5, image: '/images/brand/brand-5.png', name: 'Brand 5' },
  { id: 6, image: '/images/brand/brand-6.png', name: 'Brand 6' },
  { id: 7, image: '/images/brand/brand-7.png', name: 'Brand 7' },
  { id: 8, image: '/images/brand/brand-8.png', name: 'Brand 8' },
];

export default async function AbstrakBrands({ attributes = {} }) {
  const heading = {
    text:  attributes.heading?.text  || 'Used by teams building with GCB.',
    level: HEADING_LEVELS.has(attributes.heading?.level) ? attributes.heading.level : 'h2',
  };
  const subtitle    = attributes.subtitle    || 'In production';
  const description = attributes.description || 'Marketing sites, SaaS dashboards, editorial publications — all rendering from the same typed Gutenberg blocks.';

  const cptItems = await getCptCollection('brand', attributes).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapCptToCard) : SAMPLE_BRANDS;

  return (
    <AbstrakBrandsView
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
    id:      entity.id,
    image:   m.logo?.url || '',
    name:    stripHtml(entity?.title?.rendered || ''),
    website: m.website,
  };
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
