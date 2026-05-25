/**
 * AbstrakBrands — wired to the `brand` CPT.
 *
 * Markup from Abstrak's BrandOne.js + BrandItem.js — Bootstrap row of
 * .col-lg-3 .col-6 cells, each containing a .brand-grid logo. Styled
 * by abstrak-scss/template/_brand.scss.
 *
 * Falls back to Abstrak's 8 sample brand logos when the CPT is empty.
 *
 * Brand CPT data shape (gcb-abstrak theme):
 *   title.rendered  — brand name
 *   meta.logo       — image-control object
 *   meta.website    — url-control object
 */

import { getCptCollection } from '@/lib/wpRestClient';

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
  const heading = attributes.heading || {};
  const HeadingTag = HEADING_LEVELS.has(heading.level) ? heading.level : 'h2';
  const headingText = heading.text || 'Used by teams building with GCB.';
  const subtitle    = attributes.subtitle    || 'In production';
  const description = attributes.description || 'Marketing sites, SaaS dashboards, editorial publications — all rendering from the same typed Gutenberg blocks.';

  const cptItems = await getCptCollection('brand', attributes).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapCptToCard) : SAMPLE_BRANDS;

  return (
    <div className="section section-padding-2 bg-color-dark">
      <div className="container">
        <SectionTitle
          subtitle={subtitle}
          title={headingText}
          HeadingTag={HeadingTag}
          description={description}
          textAlignment="heading-light-left"
        />
        <div className="row">
          {items.map((brand) => (
            <div className="col-lg-3 col-6" key={brand.id}>
              <BrandGrid brand={brand} />
            </div>
          ))}
        </div>
      </div>
      <ul className="list-unstyled shape-group-10">
        <li className="shape shape-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/others/line-9.png" alt="Circle" />
        </li>
      </ul>
    </div>
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

function SectionTitle({ subtitle, title, HeadingTag = 'h2', description, textAlignment, textColor = '' }) {
  return (
    <div className={`section-heading ${textAlignment} ${textColor}`}>
      <div className="subtitle">{subtitle}</div>
      <HeadingTag className="title">{title}</HeadingTag>
      <p>{description}</p>
    </div>
  );
}

function BrandGrid({ brand }) {
  if (!brand.image) return null;
  const content = (
    <div className="brand-grid">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brand.image} alt={brand.name || 'Brand'} />
    </div>
  );

  if (brand.website?.url) {
    return (
      <a
        href={brand.website.url}
        target={brand.website.opensInNewTab ? '_blank' : undefined}
        rel={brand.website.opensInNewTab ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }
  return content;
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
