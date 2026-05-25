/**
 * AbstrakProjectsView — pure presentational. Plain function, no fetch.
 *
 * Renders Abstrak's project grid given the resolved data. The data
 * shape matches what mapCptToCard produces in AbstrakProjects (the
 * server-component wrapper). The theme bundle's hydration layer reads
 * the same shape out of the wrapper's data-props attribute.
 *
 * Decoupling fetch from render so the same component renders:
 *   - Server-side on Next.js (wrapper does the fetch, passes items in)
 *   - Client-side in the WP theme (render.php pre-fetches, JS hydrates)
 */

import { img } from './imageBase';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export default function AbstrakProjectsView({
  heading,
  subtitle,
  description,
  items = [],
}) {
  const HeadingTag = HEADING_LEVELS.has(heading?.level) ? heading.level : 'h2';
  const headingText = heading?.text || '';

  return (
    <div className="section section-padding-equal bg-color-dark">
      <div className="container">
        <div className="section-heading heading-light-left mb--90 ">
          <div className="subtitle">{subtitle}</div>
          <HeadingTag className="title">{headingText}</HeadingTag>
          <p>{description}</p>
        </div>

        {/* Featured project callout — currently static; future variant
            block could make it authorable. */}
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
            <img src={img('/images/project/mobile-mockup.png')} alt="GCB demo mockup" />
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

function ProjectCard({ projectStyle, portfolio }) {
  const slug = slugify(portfolio.title);
  const href = portfolio.link || `/project-details/${slug}`;
  return (
    <div className={`project-grid ${projectStyle}`}>
      <div className="thumbnail">
        <a href={href}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(portfolio.image)} alt="icon" />
        </a>
      </div>
      <div className="content">
        <span className="subtitle">
          {(portfolio.category || []).map((cat, i) => <span key={i}>{cat}</span>)}
        </span>
        <h3 className="title"><a href={href}>{portfolio.title}</a></h3>
      </div>
    </div>
  );
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}
