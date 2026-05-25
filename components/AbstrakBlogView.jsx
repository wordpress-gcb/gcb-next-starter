/**
 * AbstrakBlogView — pure presentational. Pair with AbstrakBlog
 * (server-component wrapper) for fetch + sample fallback.
 *
 * Items shape: { id, title, excerpt, thumb, link }
 */

import { FaAngleRight } from 'react-icons/fa';
import { img } from './imageBase';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

export default function AbstrakBlogView({
  heading,
  subtitle,
  description,
  items = [],
}) {
  const HeadingTag = HEADING_LEVELS.has(heading?.level) ? heading.level : 'h2';
  const headingText = heading?.text || '';

  return (
    <div className="section section-padding-equal">
      <div className="container">
        <div className="section-heading  ">
          <div className="subtitle" dangerouslySetInnerHTML={{ __html: subtitle }} />
          <HeadingTag className="title" dangerouslySetInnerHTML={{ __html: headingText }} />
          <p dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        <div className="row g-0">
          {items.map((post, idx) => (
            <div className="col-xl-6" key={post.id}>
              <BlogListItem post={post} index={idx} />
            </div>
          ))}
        </div>
      </div>
      <ul className="shape-group-1 list-unstyled">
        {/* eslint-disable @next/next/no-img-element */}
        <li className="shape shape-1"><img src={img('/images/others/bubble-1.png')} alt="bubble" /></li>
        <li className="shape shape-2"><img src={img('/images/others/line-1.png')}   alt="bubble" /></li>
        <li className="shape shape-3"><img src={img('/images/others/line-2.png')}   alt="bubble" /></li>
        <li className="shape shape-4"><img src={img('/images/others/bubble-2.png')} alt="bubble" /></li>
        {/* eslint-enable @next/next/no-img-element */}
      </ul>
    </div>
  );
}

function BlogListItem({ post, index }) {
  // Even cards get .border-start — matches Abstrak's BlogListOne stripe.
  const borderClass = index % 2 === 1 ? 'border-start' : '';
  return (
    <div className={`blog-list ${borderClass}`}>
      <div className="post-thumbnail">
        <a href={post.link}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(post.thumb)} alt={post.title || 'Blog post'} />
        </a>
      </div>
      <div className="post-content">
        <h5 className="title">
          <a href={post.link}>{post.title}</a>
        </h5>
        <p>{post.excerpt}</p>
        <a href={post.link} className="more-btn">
          Learn more <FaAngleRight />
        </a>
      </div>
    </div>
  );
}
