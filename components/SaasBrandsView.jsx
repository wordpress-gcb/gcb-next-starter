/**
 * SaasBrandsView — pure presentational. Pair with SaasBrands (the
 * server-component wrapper) for fetch + sample fallback. See that file
 * for the dual-render rationale.
 *
 * Items shape: { id, image, name, website?: { url, opensInNewTab } }
 */

import { img } from './imageBase';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export default function SaasBrandsView({
  heading,
  subtitle,
  description,
  items = [],
}) {
  const HeadingTag = HEADING_LEVELS.has(heading?.level) ? heading.level : 'h2';
  const headingText = heading?.text || '';

  return (
    <div className="section section-padding-2 bg-color-dark">
      <div className="container">
        <div className="section-heading heading-light-left ">
          <div className="subtitle">{subtitle}</div>
          <HeadingTag className="title">{headingText}</HeadingTag>
          <p>{description}</p>
        </div>
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
          <img src={img('/images/others/line-9.png')} alt="Circle" />
        </li>
      </ul>
    </div>
  );
}

function BrandGrid({ brand }) {
  if (!brand.image) return null;
  const content = (
    <div className="brand-grid">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img(brand.image)} alt={brand.name || 'Brand'} />
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
