import { cn } from '@/lib/utils';

const VARIANTS = {
  dark:    'bg-neutral-900 text-white',
  light:   'bg-neutral-50  text-neutral-900 border-y border-neutral-200',
  branded: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
};

const BUTTON_VARIANTS = {
  dark:    'bg-white text-neutral-900 hover:bg-neutral-100',
  light:   'bg-neutral-900 text-white hover:bg-neutral-800',
  branded: 'bg-white text-blue-700 hover:bg-blue-50',
};

export default function Cta({ attributes = {} }) {
  const { heading = '', body = '', link, variant = 'dark' } = attributes;
  const v = VARIANTS[variant] || VARIANTS.dark;

  return (
    <section className={cn('py-16 md:py-20', v)}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{heading}</h2>
        )}
        {body && (
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">{body}</p>
        )}
        {link?.url && (
          <a
            href={link.url}
            target={link.opensInNewTab ? '_blank' : undefined}
            rel={link.opensInNewTab ? 'noopener noreferrer' : undefined}
            className={cn(
              'inline-flex items-center px-8 py-3 rounded-md font-semibold transition-colors',
              BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.dark,
            )}
          >
            {link.text || link.url}
          </a>
        )}
      </div>
    </section>
  );
}
