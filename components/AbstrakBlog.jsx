/**
 * AbstrakBlog — wired to WP standard posts (post type 'posts').
 *
 * Markup from Abstrak's BlogOne.js + BlogListOne.js — `.section-padding-equal`
 * wrapper with a 2-column `.row.g-0` of `.blog-list` cards. The even-id
 * card gets `.border-start` to mirror Abstrak's stripe between cards.
 *
 * Featured image comes from `_embedded['wp:featuredmedia'][0].source_url`
 * (REST `_embed=1` is set by getCptCollection). Falls back to Abstrak's
 * two sample posts when the WP install has no published posts yet.
 */

import { getCptCollection } from '@/lib/wpRestClient';
import { FaAngleRight } from 'react-icons/fa';

const HEADING_LEVELS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const SAMPLE_POSTS = [
  {
    id: 1,
    title:    'Follow your own design process, whatever gets you to the outcome.',
    excerpt:  'Want to know the one thing that every successful digital marketer does first to ensure they get the biggest return on their marketing budget?',
    thumb:    '/images/blog/thumb_5.png',
    link:     '#',
  },
  {
    id: 2,
    title:    'How To Use a Remarketing Strategy To Get More',
    excerpt:  'Want to know the one thing that every successful digital marketer does first to ensure they get the biggest return on their marketing budget?',
    thumb:    '/images/blog/thumb_1.png',
    link:     '#',
  },
];

export default async function AbstrakBlog({ attributes = {} }) {
  const heading = attributes.heading || {};
  const HeadingTag = HEADING_LEVELS.has(heading.level) ? heading.level : 'h2';
  const headingText = heading.text || 'From the blog';
  const subtitle    = attributes.subtitle || 'Latest writing';
  const description = attributes.intro    || 'Tips, patterns, and release notes from the team building GCB and the headless Gutenberg stack around it.';

  // Default to 2 posts to match Abstrak's 2-up layout if count not set.
  const fetchAttrs = { ...attributes, count: attributes.count || 2 };
  const cptItems   = await getCptCollection('posts', fetchAttrs).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapPostToCard) : SAMPLE_POSTS;

  return (
    <div className="section section-padding-equal">
      <div className="container">
        <SectionTitle
          subtitle={subtitle}
          title={headingText}
          HeadingTag={HeadingTag}
          description={description}
        />
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
        <li className="shape shape-1"><img src="/images/others/bubble-1.png" alt="bubble" /></li>
        <li className="shape shape-2"><img src="/images/others/line-1.png"   alt="bubble" /></li>
        <li className="shape shape-3"><img src="/images/others/line-2.png"   alt="bubble" /></li>
        <li className="shape shape-4"><img src="/images/others/bubble-2.png" alt="bubble" /></li>
        {/* eslint-enable @next/next/no-img-element */}
      </ul>
    </div>
  );
}

function mapPostToCard(entity) {
  const featured = entity?._embedded?.['wp:featuredmedia']?.[0];
  return {
    id:      entity.id,
    title:   stripHtml(entity?.title?.rendered   || ''),
    excerpt: stripHtml(entity?.excerpt?.rendered || ''),
    thumb:   featured?.source_url || '/images/blog/thumb_5.png',
    link:    entity?.link || `/${entity?.slug || ''}`,
  };
}

function SectionTitle({ subtitle, title, HeadingTag = 'h2', description, textAlignment = '', textColor = '' }) {
  return (
    <div className={`section-heading ${textAlignment} ${textColor}`}>
      <div className="subtitle" dangerouslySetInnerHTML={{ __html: subtitle }} />
      <HeadingTag className="title" dangerouslySetInnerHTML={{ __html: title }} />
      <p dangerouslySetInnerHTML={{ __html: description }} />
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
          <img src={post.thumb} alt={post.title || 'Blog post'} />
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

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
