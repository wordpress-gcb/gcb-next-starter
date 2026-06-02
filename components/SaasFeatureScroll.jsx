'use client';

/**
 * SaasFeatureScroll — sticky-image feature tour.
 *
 * Mirrors the PHP render.php structure exactly:
 *   - .gcb-feature-scroll__layout (CSS grid, two columns)
 *     - .gcb-feature-scroll__rail (left: stack of items)
 *     - .gcb-feature-scroll__stage (right: sticky, stacked images)
 *
 * The sticky behaviour is pure CSS (position:sticky on .__stage). This
 * component's only runtime job is to swap `.is-active` between stage
 * frames as the user scrolls past each item. PHP serves the first item
 * active by default; React takes over after mount.
 *
 * Body copy for each item is the item's InnerBlocks (paragraph,
 * heading, list, buttons). We render those by joining their innerHTML.
 *
 * Block: gcb/saas-feature-scroll
 * Children: gcb/saas-feature-scroll-item
 */

import { useEffect, useRef, useState } from 'react';
import { img } from './imageBase';

const HEADING_LEVELS = new Set(['h2', 'h3']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv']);

export default function SaasFeatureScroll({ attributes = {}, innerBlocks = [] }) {
  const {
    eyebrow = '',
    heading = { text: '', level: 'h2' },
    intro   = '',
  } = attributes;

  // Don't drop items without a title — empty-title is a normal "draft"
  // state authors leave items in while writing. Render them with an
  // empty h3 (matches the PHP side, which also emits an empty h3).
  const items = innerBlocks
    .filter((b) => b?.blockName === 'gcb/saas-feature-scroll-item')
    .map((b, idx) => {
      const a = b.attrs || {};
      const image = a.image && typeof a.image === 'object' ? a.image : {};
      return {
        id:    `feat-${idx}`,
        title: a.title || '',
        image: {
          url:     image.url || '',
          alt:     image.alt || a.title || '',
          isVideo: detectVideo(image.url || ''),
        },
        innerBlocks: Array.isArray(b.innerBlocks) ? b.innerBlocks : [],
      };
    });

  const HeadingTag = HEADING_LEVELS.has(heading?.level) ? heading.level : 'h2';

  const itemRefs   = useRef([]);
  const stageRef   = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Wire up the scroll observer. Re-runs whenever items.length changes.
  // We track each item's last-known intersection ratio and pick the
  // highest each time the observer fires — that way the active index
  // tracks "what's most in view" instead of "what most recently became
  // visible," which previously left activeIdx stuck on the first item
  // when none crossed the band threshold simultaneously.
  useEffect(() => {
    if (items.length <= 1) return;
    const nodes = itemRefs.current.slice(0, items.length).filter(Boolean);
    if (nodes.length < items.length) return; // refs not all set yet — bail; the next render will retry

    const ratios = new Map(nodes.map((n) => [n, 0]));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target, e.intersectionRatio);
        }
        let bestIdx = -1;
        let bestRatio = 0;
        nodes.forEach((n, i) => {
          const r = ratios.get(n) || 0;
          if (r > bestRatio) { bestRatio = r; bestIdx = i; }
        });
        if (bestIdx !== -1 && bestRatio > 0) {
          setActiveIdx(bestIdx);
        }
      },
      {
        // Band that triggers "this is the focused item." A wider band
        // than before so on shorter viewports (laptop in the editor)
        // SOME item is always counted as in-view.
        rootMargin: '-25% 0px -25% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items.length]);

  // Drive video playback off activeIdx. Browsers throttle or refuse to
  // play <video> elements that aren't visible — opacity: 0 frames may
  // pause silently. Force play on the active frame, pause the rest so
  // we don't leak background video decoders on long pages.
  useEffect(() => {
    if (!stageRef.current) return;
    const videos = stageRef.current.querySelectorAll('video');
    videos.forEach((v, i) => {
      if (i === activeIdx) {
        // play() returns a promise; ignore rejections (autoplay policy).
        v.play?.().catch(() => {});
      } else {
        v.pause?.();
      }
    });
  }, [activeIdx, items.length]);

  if (!items.length) {
    return (
      <section className="section section-padding gcb-saas-feature-scroll">
        <div className="container">
          <p style={{ padding: 16, color: 'var(--color-gray-1)' }}>
            Add feature items inside this block in WP admin.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section section-padding gcb-saas-feature-scroll">
      <div className="container">
        {(eyebrow || heading?.text || intro) && (
          <div className="section-heading heading-left mb--60">
            {eyebrow && <span className="subtitle">{eyebrow}</span>}
            {heading?.text && <HeadingTag className="title">{heading.text}</HeadingTag>}
            {intro && <p>{intro}</p>}
          </div>
        )}

        <div className="gcb-feature-scroll__layout">
          <div className="gcb-feature-scroll__rail">
            {items.map((it, i) => (
              <FeatureRow
                key={it.id}
                item={it}
                refCb={(el) => { itemRefs.current[i] = el; }}
              />
            ))}
          </div>

          <div ref={stageRef} className="gcb-feature-scroll__stage" aria-hidden="true">
            {items.map((it, i) => {
              if (!it.image.url) return null;
              const src = img(it.image.url);
              const cls = `gcb-feature-scroll__stage-frame${i === activeIdx ? ' is-active' : ''}`;
              return it.image.isVideo ? (
                <video
                  key={it.id}
                  src={src}
                  autoPlay muted loop playsInline preload="auto"
                  className={cls}
                  aria-label={it.image.alt}
                />
              ) : (
                <img
                  key={it.id}
                  src={src}
                  alt={it.image.alt}
                  className={cls}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Per-item row. Title + InnerBlocks body. NO image — the parent's
 * sticky stage owns the image, this is just copy.
 */
function FeatureRow({ item, refCb }) {
  const bodyHtml = (item.innerBlocks || [])
    .map((b) => b?.innerHTML || '')
    .join('');

  return (
    <div ref={refCb} className="gcb-feature-scroll__item">
      <h3 className="gcb-feature-scroll__item-title">{item.title}</h3>
      {bodyHtml && (
        <div
          className="gcb-feature-scroll__item-body"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      )}
    </div>
  );
}

function detectVideo(url) {
  if (!url) return false;
  const ext = (url.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
  return VIDEO_EXTS.has(ext);
}
