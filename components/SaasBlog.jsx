/**
 * SaasBlog — server-component wrapper.
 *
 * Pulls from WP standard posts (post type 'posts') via getCptCollection.
 * Falls back to two sample cards when there are no published posts yet.
 */

import { getCptCollection } from '@/lib/wpRestClient';
import SaasBlogView from './SaasBlogView';

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

export default async function SaasBlog({ attributes = {} }) {
  const heading = {
    text:  attributes.heading?.text  || 'From the blog',
    level: HEADING_LEVELS.has(attributes.heading?.level) ? attributes.heading.level : 'h2',
  };
  const subtitle    = attributes.subtitle || 'Latest writing';
  const description = attributes.intro    || 'Tips, patterns, and release notes from the team building GCB and the headless Gutenberg stack around it.';

  // Default to 2 posts to match Saas's 2-up layout if count not set.
  const fetchAttrs = { ...attributes, count: attributes.count || 2 };
  const cptItems   = await getCptCollection('posts', fetchAttrs).catch(() => []);
  const items = cptItems.length > 0 ? cptItems.map(mapPostToCard) : SAMPLE_POSTS;

  return (
    <SaasBlogView
      heading={heading}
      subtitle={subtitle}
      description={description}
      items={items}
    />
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

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, '').trim();
}
