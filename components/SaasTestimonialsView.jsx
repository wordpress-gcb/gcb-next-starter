/**
 * SaasTestimonialsView — pure presentational. Pair with
 * SaasTestimonials (server-component wrapper) for fetch + sample
 * fallback.
 *
 * Items shape:
 *   { id, fromtext, from, description, authorimg, authorname, authordesig }
 */

import { img } from './imageBase';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export default function SaasTestimonialsView({
  heading,
  subtitle,
  description,
  items = [],
}) {
  const HeadingTag = HEADING_LEVELS.has(heading?.level) ? heading.level : 'h2';
  const headingText = heading?.text || '';

  return (
    <div className="section section-padding">
      <div className="container">
        <div className="section-heading heading-left ">
          <div className="subtitle">{subtitle}</div>
          <HeadingTag className="title">{headingText}</HeadingTag>
          <p>{description}</p>
        </div>
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
          <img src={img('/images/others/bubble-1.png')} alt="" />
        </li>
      </ul>
    </div>
  );
}

function TestimonialGrid({ data }) {
  return (
    <div className="testimonial-grid">
      {data.from && (
        <span className="social-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(data.from)} alt={data.fromtext} />
        </span>
      )}
      <p>{data.description}</p>
      <div className="author-info">
        {data.authorimg && (
          <div className="thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(data.authorimg)} alt={data.authorname} />
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
