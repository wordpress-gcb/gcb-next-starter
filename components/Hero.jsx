import { cn } from '@/lib/utils';

/**
 * Hero — above-the-fold marketing section. Image + headline + body + CTAs.
 *
 * The image control's full surface is honoured: focal point becomes
 * object-position, size becomes object-fit, customWidth becomes inline
 * width. isFixed and repeat don't apply here (foreground image).
 */
export default function Hero({ attributes = {} }) {
  const {
    eyebrow = '',
    heading = '',
    body = '',
    image,
    ctaPrimary,
    ctaSecondary,
    imageSide = 'right',
  } = attributes;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-12 items-center',
          imageSide === 'left' && 'md:[&>*:first-child]:order-2',
        )}
      >
        <div>
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-3">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 tracking-tight">
              {heading}
            </h1>
          )}
          {body && (
            /* eslint-disable-next-line react/no-danger */
            <div
              className="prose prose-lg text-neutral-700 max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
          {(ctaPrimary?.url || ctaSecondary?.url) && (
            <div className="flex flex-wrap gap-4">
              {ctaPrimary?.url && <CTA link={ctaPrimary} variant="primary" />}
              {ctaSecondary?.url && <CTA link={ctaSecondary} variant="secondary" />}
            </div>
          )}
        </div>

        <div>
          {image?.url ? <HeroImage image={image} /> : <ImagePlaceholder />}
        </div>
      </div>
    </section>
  );
}

function CTA({ link, variant }) {
  const styles = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50';
  return (
    <a
      href={link.url}
      target={link.opensInNewTab ? '_blank' : undefined}
      rel={link.opensInNewTab ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center px-6 py-3 rounded-md font-medium transition-colors ${styles}`}
    >
      {link.text || link.url}
    </a>
  );
}

function HeroImage({ image }) {
  const { url, alt = '', focalPoint, size = 'cover', customWidth = '' } = image;
  const fpx = typeof focalPoint?.x === 'number' ? focalPoint.x : 0.5;
  const fpy = typeof focalPoint?.y === 'number' ? focalPoint.y : 0.5;
  const objectFit = size === 'auto' ? undefined : size;
  const objectPosition = objectFit ? `${fpx * 100}% ${fpy * 100}%` : undefined;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className="rounded-2xl shadow-2xl"
      style={{
        width: customWidth || '100%',
        height: 'auto',
        objectFit,
        objectPosition,
      }}
    />
  );
}

function ImagePlaceholder() {
  return (
    <div className="aspect-[4/3] w-full bg-gradient-to-br from-blue-50 to-blue-100 border border-dashed border-blue-300 rounded-2xl grid place-items-center text-blue-400 text-sm">
      Add a hero image in the Inspector →
    </div>
  );
}
