'use client';

/**
 * AbstrakIconAccordion — heading + interactive accordion of icon items.
 *
 * Emits Abstrak's exact markup: a .why-choose-us wrapper containing a
 * .section-heading and a Bootstrap .accordion. The bundled SCSS (which
 * includes both Bootstrap's .accordion-* defaults AND Abstrak's
 * _why-choose.scss overrides) styles the result directly.
 *
 * Bootstrap's accordion JS isn't loaded — we use React state as the
 * open/close driver. To get Bootstrap's smooth height transition, we
 * mimic its `.collapsing` lifecycle by hand: when an item opens or
 * closes, we briefly apply `.collapsing` with an explicit height, then
 * settle into `.collapse` / `.collapse.show`. That's the same dance
 * Bootstrap's own collapse.js does — without bundling the JS.
 *
 * Block: gcb/abstrak-icon-accordion
 * Children: gcb/abstrak-icon-accordion-item
 */

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import * as Fa from 'react-icons/fa';
import { FaCircle } from 'react-icons/fa';

const HEADING_LEVELS = new Set(['h2', 'h3', 'h4']);

export default function AbstrakIconAccordion({ attributes = {}, innerBlocks = [] }) {
  const { heading = { text: '', level: 'h3' }, intro = '' } = attributes;

  const items = innerBlocks
    .filter((b) => b?.blockName === 'gcb/abstrak-icon-accordion-item')
    .map((b, idx) => ({
      id:    `item-${idx}`,
      icon:  (b.attrs?.icon  || '').trim(),
      title: b.attrs?.title  || '',
      body:  b.attrs?.body   || '',
    }))
    .filter((it) => it.title);

  const HeadingTag = HEADING_LEVELS.has(heading?.level) ? heading.level : 'h3';
  const headingText = heading?.text || '';

  // Single-open mode (mirrors Bootstrap's data-bs-parent behaviour).
  const [openId, setOpenId] = useState(items[0]?.id);

  return (
    <div className="why-choose-us">
      {(headingText || intro) && (
        <div className="section-heading heading-left">
          {headingText && <HeadingTag className="title">{headingText}</HeadingTag>}
          {intro && <p>{intro}</p>}
        </div>
      )}

      {items.length === 0 ? (
        <p style={{ padding: 16, color: 'var(--color-gray-1)' }}>
          Add accordion items inside this block in WP admin.
        </p>
      ) : (
        <div className="accordion">
          {items.map((item) => (
            <AccordionRow
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AccordionRow({ item, isOpen, onToggle }) {
  const Icon = resolveIcon(item.icon);

  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button
          type="button"
          aria-expanded={isOpen}
          // `.accordion-button` always present; `.collapsed` toggles
          // OFF when the item is open (Bootstrap convention).
          className={`accordion-button${isOpen ? '' : ' collapsed'}`}
          onClick={onToggle}
        >
          <Icon />
          {item.title}
        </button>
      </h2>
      <Collapse isOpen={isOpen}>
        <div className="accordion-body">{item.body}</div>
      </Collapse>
    </div>
  );
}

/**
 * Smooth open/close via inline grid-rows trick.
 *
 * We tried mimicking Bootstrap's class lifecycle (.collapse / .collapsing
 * / .collapse.show with rAF-driven inline height) and the close path
 * stalled — the rAF timing + React batching + transitionend coordination
 * proved too fragile.
 *
 * This implementation is the simpler version:
 *   - The wrapper is ALWAYS rendered. No `display: none` toggling
 *     (which can't be transitioned in CSS).
 *   - We use a `display: grid` outer with `grid-template-rows` going
 *     between `0fr` (closed) and `1fr` (open). Both are interpolatable
 *     values for the browser, so CSS transitions both directions
 *     symmetrically — no rAF dance needed.
 *   - The inner content sits in `min-height: 0; overflow: hidden` so
 *     it clips during the transition.
 *
 * This is a well-known pattern (Adam Argyle, web.dev, "Animating to
 * height auto"). It works in every evergreen browser.
 *
 * We still emit the Bootstrap class names on the outer so Abstrak's
 * own .accordion-collapse selectors continue to match — but layout +
 * animation comes from the inline grid style here, not from Bootstrap.
 */
function Collapse({ isOpen, children }) {
  return (
    <div
      className={`accordion-collapse collapse${isOpen ? ' show' : ''}`}
      style={{
        display: 'grid',
        gridTemplateRows: isOpen ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.35s ease',
      }}
    >
      <div style={{ minHeight: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Resolve a react-icons/fa (FontAwesome 5) icon by string name. Authors
 * set the icon attribute to `FaCompress`, `FaCode`, `FaGlobe`, etc. —
 * anything from https://react-icons.github.io/react-icons/icons/fa.
 *
 * Unknown names fall back to FaCircle so the layout doesn't break.
 */
function resolveIcon(name) {
  if (!name) return FaCircle;
  const Icon = Fa[name];
  return typeof Icon === 'function' ? Icon : FaCircle;
}
