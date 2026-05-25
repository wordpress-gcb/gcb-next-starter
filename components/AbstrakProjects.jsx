/**
 * AbstrakProjects — wired to the `project` CPT.
 *
 * Markup from Abstrak's ProjectFour.js + ProjectPropTwo.js, with the
 * data resolved via getCptCollection (mirrors the PHP Collection helper:
 * source = 'latest' | 'manual', count / post_ids). When the CPT has no
 * records yet, we fall back to Abstrak's four sample portfolio rows so
 * a fresh install still demoes the design.
 *
 * Project CPT data shape (set by examples/themes/gcb-abstrak/functions.php):
 *   title.rendered              — string
 *   link                        — permalink
 *   meta.cover                  — image-control object { url, alt, ... }
 *   _embedded['wp:term']        — taxonomy chips for project_category
 *
 * Block attrs:
 *   heading: { text, level }
 *   subtitle:    string
 *   description: string
 *   source:      'latest' | 'manual'
 *   count:       number  (latest)
 *   post_ids:    number[] (manual)
 */

import { getCptCollection } from '@/lib/wpRestClient';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

// Fallback when the CPT is empty (fresh install). Reskinned to look like
// real GCB-built products rather than Abstrak's source agency portfolio.
const SAMPLE_PROJECTS = [
  { id: 13, image: '/images/project/project-1.png',  title: 'Postwave CMS Marketing', category: ['SaaS site', 'Next.js'] },
  { id: 14, image: '/images/project/project-4.png',  title: 'Beacon Analytics',       category: ['Web app', 'React'] },
  { id: 15, image: '/images/project/project-2.png',  title: 'Glide Editorial',        category: ['Publishing', 'Next.js'] },
  { id: 16, image: '/images/project/project-3.png',  title: 'Atlas Docs Hub',         category: ['Docs', 'MDX'] },
];

export default async function AbstrakProjects({ attributes = {} }) {
  const heading = attributes.heading || {};
  const HeadingTag = HEADING_LEVELS.has(heading.level) ? heading.level : 'h2';
  const headingText = heading.text || 'Selected work';
  const subtitle    = attributes.subtitle    || 'Built with GCB';
  const description = attributes.description || 'Real sites running typed-field Gutenberg blocks rendered through a React frontend. Same component in the editor and on the live page.';

  // Try the CPT. If nothing comes back, use the sample.
  const cptItems = await getCptCollection('project', attributes).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapCptToCard) : SAMPLE_PROJECTS;

  return (
    <div className="section section-padding-equal bg-color-dark">
      <div className="container">
        <SectionTitle
          subtitle={subtitle}
          title={headingText}
          HeadingTag={HeadingTag}
          description={description}
          textAlignment="heading-light-left mb--90"
        />

        {/*
          The project-add-banner is Abstrak's "featured project" call-out
          ABOVE the grid. Static for now — a future variant block could
          expose it as authorable. Reskinned to point at GCB itself: the
          flagship "site that ships with GCB" is THIS site.
        */}
        <div className="project-add-banner">
          <div className="content">
            <span className="subtitle">featured — built with GCB</span>
            <h3 className="title">This entire site is a GCB demo.</h3>
            <p style={{ color: 'var(--color-gray-1)' }}>
              Every section above is a typed-field block on a WordPress page,
              rendered as React via the gcb-lite plugin and a Next.js frontend.
            </p>
          </div>
          <div className="thumbnail">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/project/mobile-mockup.png" alt="GCB demo mockup" />
          </div>
        </div>

        <div className="row row-45">
          {items.map((data) => (
            <div className="col-md-6" key={data.id}>
              <ProjectCard portfolio={data} projectStyle="project-style-2" />
            </div>
          ))}
        </div>

        <div className="more-project-btn">
          <a href="#" className="axil-btn btn-fill-white">Discover More Projects</a>
        </div>
      </div>
    </div>
  );
}

/**
 * Map a WP REST project entity → the card shape Abstrak's
 * ProjectPropTwo expects ({ id, image, title, category }).
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

function SectionTitle({ subtitle, title, HeadingTag = 'h2', description, textAlignment, textColor = '' }) {
  return (
    <div className={`section-heading ${textAlignment} ${textColor}`}>
      <div className="subtitle">{subtitle}</div>
      <HeadingTag className="title">{title}</HeadingTag>
      <p>{description}</p>
    </div>
  );
}

function ProjectCard({ projectStyle, portfolio }) {
  const slug = slugify(portfolio.title);
  const href = portfolio.link || `/project-details/${slug}`;
  return (
    <div className={`project-grid ${projectStyle}`}>
      <div className="thumbnail">
        <a href={href}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portfolio.image} alt="icon" />
        </a>
      </div>
      <div className="content">
        <span className="subtitle">
          {portfolio.category.map((cat, i) => <span key={i}>{cat}</span>)}
        </span>
        <h3 className="title"><a href={href}>{portfolio.title}</a></h3>
      </div>
    </div>
  );
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
