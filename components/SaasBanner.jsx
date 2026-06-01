/**
 * SaasBanner — sticky parity with render.php.
 *
 * This component is the RENDER TWIN of saas-banner's render.php. The
 * structural contract — class names, focus-field attributes, conditional
 * branches, video/image detection — has to match exactly because:
 *
 *   1. When gcblite_force_component_server is on, the editor preview
 *      fetches THIS component's output and authors rely on the same
 *      click-to-focus, the same image constraint, the same body slot.
 *   2. theme.css + the inline override in the theme's functions.php
 *      target the PHP markup; React has to ship the same selectors.
 *
 * If you change render.php, change this file. If you change this file,
 * change render.php. See [[component-twin-parity]] in the harness rules.
 *
 * Attributes (all optional):
 *   eyebrow:       string
 *   image:         { url, alt, focalPoint, ... }  — accepts video too
 *   primary_cta:   { url, text, opensInNewTab }
 *   secondary_cta: { url, text, opensInNewTab }   — saved but unrendered
 *   facebook / twitter / linkedin: url-shaped objects
 *
 * Heading + body are NOT typed fields — they live inside InnerBlocks,
 * authored as core/heading + core/paragraph etc. The pre-rendered child
 * HTML arrives on `innerBlocks` (BlockRenderer hands it through) and is
 * injected into .banner-body. No SAMPLE fallback for the body: render.php
 * seeds the InnerBlocks template, so a fresh block already has starter
 * content. If the author deletes everything inside, the body renders empty.
 */

import { FaFacebookF, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { img } from './imageBase';

const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv']);

function detectVideo(url) {
  if (!url) return false;
  const ext = (url.split('?')[0].split('#')[0].split('.').pop() || '').toLowerCase();
  return VIDEO_EXTS.has(ext);
}

export default function SaasBanner({ attributes = {}, innerBlocks = null }) {
  const eyebrow      = attributes.eyebrow || '';
  const primaryCta   = attributes.primary_cta || null;
  const image        = (attributes.image && attributes.image.url) ? attributes.image : null;
  const facebookUrl  = attributes.facebook?.url || '';
  const twitterUrl   = attributes.twitter?.url  || '';
  const linkedinUrl  = attributes.linkedin?.url || '';

  // Three states for the body, two callers:
  //
  //   Editor preview (component-server route): innerBlocks arrives null.
  //     We emit an <innerblocks> marker. parse-preview.js swaps it for a
  //     live wp-block-editor InnerBlocks slot — same trick the Repeater
  //     component uses. WP owns the children; the React render owns the
  //     surrounding layout.
  //
  //   Public frontend (BlockRenderer at /): innerBlocks is the parsed
  //     array of child blocks. We join their innerHTML into the body
  //     slot directly.
  //
  //   Fresh block, author hasn't typed anything: empty array, empty
  //     body. render.php's InnerBlocks template seeds starter content
  //     upstream; if the author cleared it deliberately, respect that.
  const isEditorPreview = innerBlocks === null;
  const bodyHtml = (innerBlocks || [])
    .map((b) => b?.innerHTML || '')
    .join('')
    .trim();

  const primaryHref   = primaryCta?.url  || '';
  const primaryLabel  = primaryCta?.text || 'View on GitHub';
  const primaryTarget = primaryCta?.opensInNewTab ? '_blank' : undefined;
  const primaryRel    = primaryCta?.opensInNewTab ? 'noopener noreferrer' : undefined;

  const mediaUrl = image?.url || '';
  const mediaAlt = image?.alt || '';
  const isVideo  = detectVideo(mediaUrl);

  // Socials: only render if at least one URL is set (matches PHP).
  const socials = [
    facebookUrl  && { key: 'Facebook',  url: facebookUrl,  icon: <FaFacebookF /> },
    twitterUrl   && { key: 'Twitter',   url: twitterUrl,   icon: <FaTwitter /> },
    linkedinUrl  && { key: 'Linkedin',  url: linkedinUrl,  icon: <FaLinkedinIn /> },
  ].filter(Boolean);

  return (
    <div
      className="banner banner-style-4 gcb-saas-banner"
      data-block-name="saas-banner"
    >
      <div className="container">
        <div className="banner-content">
          {eyebrow && (
            <span className="subtitle" data-focus-field="eyebrow">{eyebrow}</span>
          )}

          {/* InnerBlocks body. Includes the H1 the author edited inline. */}
          <div className="banner-body gcb-banner-innerblocks">
            {isEditorPreview ? (
              // Editor: emit the <innerblocks> marker. The plugin's
              // parse-preview.js swaps this for a live wp-block-editor
              // InnerBlocks slot with the author's actual children.
              // Template + allowed-blocks list match what render.php seeds
              // so the two render paths give the same starter content.
              <innerblocks
                allowedblocks='["core/paragraph","core/heading","core/list","core/buttons","core/image","core/quote","core/separator"]'
                template='[["core/heading",{"level":1,"className":"title","content":"Your headline here"}],["core/paragraph",{"content":"Replace this paragraph with your own copy."}]]'
              />
            ) : (
              // Public frontend: BlockRenderer already passed the parsed
              // children. Join their innerHTML into the slot.
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            )}
          </div>

          {primaryHref && (
            <div data-focus-field="primary_cta">
              <a
                href={primaryHref}
                target={primaryTarget}
                rel={primaryRel}
                className="axil-btn btn-fill-primary btn-large"
              >
                {primaryLabel}
              </a>
            </div>
          )}
        </div>

        {mediaUrl && (
          <div className="banner-thumbnail" data-focus-field="image">
            <div className="large-thumb">
              {isVideo ? (
                <video
                  src={img(mediaUrl)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={mediaAlt}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img(mediaUrl)} alt={mediaAlt} />
              )}
            </div>
          </div>
        )}

        {socials.length > 0 && (
          <div className="banner-social">
            <div className="border-line" />
            <ul className="list-unstyled social-icon">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.url}>
                    {s.icon} {s.key}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ul className="list-unstyled shape-group-19">
        {/* eslint-disable @next/next/no-img-element */}
        <li className="shape shape-1">
          <img src={img('/images/others/bubble-29.png')} alt="" />
        </li>
        <li className="shape shape-2">
          <img src={img('/images/others/line-7.png')} alt="" />
        </li>
        {/* eslint-enable @next/next/no-img-element */}
      </ul>
    </div>
  );
}
