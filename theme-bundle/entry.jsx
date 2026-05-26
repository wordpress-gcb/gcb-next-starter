/**
 * Theme bundle entry point.
 *
 * Scans the page for SSR'd `[data-block-name^="abstrak-"]` wrappers
 * emitted by the gcb-lite abstrak-* block render.php files, parses each
 * wrapper's `data-props` JSON, normalises the props to the shape each
 * View component expects, and renders the component into the wrapper.
 *
 * The PHP-side render.php files emit data in their own "raw entity"
 * shape (e.g. cover.url, categories[]). The React Views expect a
 * flattened card shape (e.g. image, category[]). The ADAPTERS map
 * below does that translation — one function per block name.
 *
 * This file is loaded by gcb-abstrak's functions.php as a
 * `wp_enqueue_script` on both frontend and editor contexts. Built to a
 * single self-contained file by theme-bundle/build.mjs.
 */

import { createRoot } from 'react-dom/client';

// Static imports so esbuild bundles everything — no per-component network
// requests means Playground compatibility (PHP-to-network is blocked but
// same-origin JS is fine).
import AbstrakBanner          from '@/components/AbstrakBanner';
import AbstrakBrandsView      from '@/components/AbstrakBrandsView';
import AbstrakProjectsView    from '@/components/AbstrakProjectsView';
import AbstrakTestimonialsView from '@/components/AbstrakTestimonialsView';
import AbstrakBlogView        from '@/components/AbstrakBlogView';
import AbstrakCta             from '@/components/AbstrakCta';
import AbstrakIconAccordion   from '@/components/AbstrakIconAccordion';
import AbstrakSectionText     from '@/components/AbstrakSectionText';
import SiteHeader             from '@/components/SiteHeader';
import SiteFooter             from '@/components/SiteFooter';

/**
 * Per-block adapters: take the data-props PHP emits, return the props
 * shape the corresponding component expects. Each adapter is the seam
 * between the PHP entity shape and the React view shape.
 *
 * Where the PHP already emits the right shape (e.g. block-attribute-
 * only blocks like banner / cta), the adapter is a passthrough.
 */
const ADAPTERS = {
  'abstrak-banner': (raw) => ({
    // AbstrakBanner takes { attributes }, so wrap. Banner's data-props
    // is already keyed like `attributes.*` would be.
    attributes: {
      eyebrow:       raw.eyebrow || '',
      heading:       raw.heading,
      body:          raw.body || '',
      primary_cta:   raw.primaryCta,
      secondary_cta: raw.secondaryCta,
      image:         raw.image,
    },
  }),

  'abstrak-projects': (raw) => ({
    heading:     raw.heading,
    subtitle:    raw.subtitle || 'Built with GCB',
    description: raw.intro    || 'Real sites running typed-field Gutenberg blocks rendered through a React frontend. Same component in the editor and on the live page.',
    items: (raw.items || []).map((p) => ({
      id:    p.id,
      image: p.cover?.url || '/images/project/project-7.png',
      title: p.title || '',
      category: (p.categories || []).map((c) => c.name),
      link:  p.url,
    })),
  }),

  'abstrak-brands': (raw) => ({
    heading:     raw.heading,
    subtitle:    raw.subtitle    || 'In production',
    description: raw.description || 'Marketing sites, SaaS dashboards, editorial publications — all rendering from the same typed Gutenberg blocks.',
    items: (raw.items || []).map((b) => ({
      id:      b.id,
      image:   b.logo?.url || '',
      name:    b.name || '',
      website: b.website,
    })),
  }),

  'abstrak-testimonials': (raw) => ({
    heading:     raw.heading,
    subtitle:    raw.subtitle    || 'Field reports',
    description: raw.description || 'Frontend engineers and editors talking about the editor-frontend parity story and the typed-field workflow.',
    items: (raw.items || []).map((t) => ({
      id:           t.id,
      fromtext:     t.fromLabel || '',
      from:         t.fromLogo?.url || '',
      description:  t.quote     || '',
      authorimg:    t.authorImage?.url || '',
      authorname:   t.authorName || '',
      authordesig:  t.authorRole || '',
    })),
  }),

  'abstrak-blog': (raw) => ({
    heading:     raw.heading,
    subtitle:    raw.subtitle    || 'Latest writing',
    description: raw.intro       || 'Tips, patterns, and release notes from the team building GCB and the headless Gutenberg stack around it.',
    items: (raw.items || []).map((post) => ({
      id:      post.id,
      title:   post.title   || '',
      excerpt: post.excerpt || '',
      thumb:   post.cover?.url || '/images/blog/thumb_5.png',
      link:    post.url     || '#',
    })),
  }),

  'abstrak-cta': (raw) => ({ attributes: raw }),

  'abstrak-section-text': (raw) => ({ attributes: raw }),

  'abstrak-icon-accordion': (raw) => ({
    attributes: raw,
    innerBlocks: raw.innerBlocks || [],
  }),
};

const REGISTRY = {
  'abstrak-banner':          AbstrakBanner,
  'abstrak-projects':        AbstrakProjectsView,
  'abstrak-testimonials':    AbstrakTestimonialsView,
  'abstrak-brands':          AbstrakBrandsView,
  'abstrak-blog':            AbstrakBlogView,
  'abstrak-cta':             AbstrakCta,
  'abstrak-icon-accordion':  AbstrakIconAccordion,
  'abstrak-section-text':    AbstrakSectionText,
};

/**
 * Find all abstrak-* wrappers on the page and hydrate each one.
 *
 * The wrapper's outer tag + classes are SSR'd by render.php. We render
 * INTO the existing wrapper (not replace it) so the outer attributes
 * survive — React only owns the inner content.
 *
 * Marked-hydrated guard via a WeakSet — calling hydrateAll() multiple
 * times (e.g. from the editor MutationObserver below as new preview
 * blocks appear) is a no-op for wrappers already mounted, preserving
 * the React state of existing instances.
 */
const HYDRATED = new WeakSet();

function hydrateAll() {
  const wrappers = document.querySelectorAll('[data-block-name]');
  wrappers.forEach((el) => {
    if (HYDRATED.has(el)) return;

    const blockName = el.getAttribute('data-block-name');
    const Component = REGISTRY[blockName];
    const adapt     = ADAPTERS[blockName];
    if (!Component || !adapt) return;

    let raw = {};
    try {
      const rawAttr = el.getAttribute('data-props');
      if (rawAttr) raw = JSON.parse(rawAttr);
    } catch (err) {
      console.warn(`gcb hydrate: bad data-props on ${blockName}`, err);
      return;
    }

    const props = adapt(raw);

    HYDRATED.add(el);

    // Fresh createRoot rather than hydrateRoot: the SSR'd HTML was
    // emitted by PHP and is shaped for raw-WP viewing, not React's
    // hydration contract — a clean client-side render avoids mismatches.
    el.innerHTML = '';
    const root = createRoot(el);
    root.render(<Component {...props} />);
  });
}

/**
 * Mount SiteHeader / SiteFooter into theme-emitted placeholders.
 *
 * The theme's header.php and footer.php emit empty <div id="gcb-site-
 * header"> / <div id="gcb-site-footer"> placeholders. Same component
 * source as the Next.js demo (components/SiteHeader.jsx + SiteFooter.jsx)
 * so the WP frontend gets the same nav + GitHub link + footer chrome.
 */
function mountChrome() {
  const headerEl = document.getElementById('gcb-site-header');
  if (headerEl) {
    createRoot(headerEl).render(<SiteHeader />);
  }
  const footerEl = document.getElementById('gcb-site-footer');
  if (footerEl) {
    createRoot(footerEl).render(<SiteFooter />);
  }
}

function bootAll() {
  mountChrome();
  hydrateAll();
}

/**
 * In the WP block editor, gcb-lite's SSR loop injects rendered preview
 * HTML INTO the editor's React tree on demand — after the initial DOM
 * load, on every block insert / save / attribute change. A one-shot
 * DOMContentLoaded scan would miss all of those.
 *
 * The observer re-runs hydrateAll on any subtree change. Hydration is
 * idempotent (WeakSet guard above) so the cost per mutation is one
 * querySelectorAll + a set lookup per wrapper — cheap enough at
 * editor-interaction frequency.
 *
 * Frontend gets this too; harmless there since the DOM doesn't change
 * after initial load.
 */
function watchForNewBlocks() {
  if (typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver(() => hydrateAll());
  observer.observe(document.body, { childList: true, subtree: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bootAll();
      watchForNewBlocks();
    });
  } else {
    bootAll();
    watchForNewBlocks();
  }
}
