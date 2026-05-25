/**
 * AbstrakSectionText — emits the same markup shape Abstrak's source
 * ProjectDetails.js uses:
 *
 *   <>
 *     <div className="section-heading heading-left mb-0">
 *       <span className="subtitle">…</span>
 *       <h3 className="title">…</h3>
 *     </div>              ← .section-heading closes here
 *     <p>…body para 1…</p>
 *     <p>…body para 2…</p>
 *     <a className="axil-btn btn-fill-primary">CTA</a>
 *   </>
 *
 * Crucially the body paragraphs + CTA sit OUTSIDE the .section-heading
 * div, as siblings. Putting them inside .section-heading triggers its
 * `p { width: 50%; margin: 0 auto }` rule which is intended for centred
 * hero-style headings, not body copy.
 *
 * The parent column (.col-lg-5 etc.) is what owns layout — this
 * component just emits its content as direct siblings within that
 * column.
 *
 * Block: gcb/abstrak-section-text
 *
 * Attributes:
 *   subtitle_left:  string         → first .subtitle span
 *   subtitle_right: string         → second .subtitle span
 *   heading:        { text, level } → .title element (h2/h3/h4)
 *   body:           string         → raw HTML from wysiwyg control
 *   cta:            { url, text, opensInNewTab } | null → .axil-btn
 */

const HEADING_LEVELS = new Set(['h2', 'h3', 'h4']);

export default function AbstrakSectionText({ attributes = {} }) {
  const {
    subtitle_left:  subtitleLeft  = '',
    subtitle_right: subtitleRight = '',
    heading = { text: '', level: 'h3' },
    body = '',
    cta,
  } = attributes;

  const HeadingTag = HEADING_LEVELS.has(heading?.level) ? heading.level : 'h3';
  const headingText = heading?.text || '';
  const subtitleParts = [subtitleLeft, subtitleRight].filter(Boolean);

  return (
    <>
      {(subtitleParts.length > 0 || headingText) && (
        <div className="section-heading heading-left mb-0">
          {subtitleParts.length > 0 && (
            <span className="subtitle">
              {subtitleParts.map((part, i) => (
                <span key={i}>{part}</span>
              ))}
            </span>
          )}
          {headingText && <HeadingTag className="title">{headingText}</HeadingTag>}
        </div>
      )}

      {body && (
        /* eslint-disable-next-line react/no-danger */
        <div dangerouslySetInnerHTML={{ __html: body }} />
      )}

      {cta?.url && (
        <a
          href={cta.url}
          target={cta.opensInNewTab ? '_blank' : undefined}
          rel={cta.opensInNewTab ? 'noopener noreferrer' : undefined}
          className="axil-btn btn-fill-primary"
        >
          {cta.text || cta.url}
        </a>
      )}
    </>
  );
}
