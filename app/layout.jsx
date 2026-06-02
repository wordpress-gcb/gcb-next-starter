// Saas's full visual identity, bundled verbatim from the purchased
// theme's SCSS tree at /saas-scss. The order matters:
//   1. Bootstrap 5 reset + grid (.row / .col-lg-* etc.)
//   2. Saas's own SCSS — its CSS variables override Bootstrap defaults
//   3. Our own globals.css last (Tailwind directives + small additions)
// next-app-router supports SCSS imports out of the box; sass is a devDep.
import 'bootstrap/dist/css/bootstrap.min.css';
import '../saas-scss/app.scss';
import './globals.css';

import { DM_Sans, Poppins } from 'next/font/google';

import { Suspense } from 'react';

import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import EmbedMode from '@/components/EmbedMode';

// Saas design tokens — same fonts the gcb-saas theme.json declares,
// loaded via next/font so we get the self-hosting + font-display:swap
// behaviour automatically.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'GCB Lite — typed Gutenberg fields, from a JSON file',
  description: 'File-based schemas. No UI authoring. A scaffold CLI built for stdin. Render in PHP, React, or both — same typed fields, same source of truth.',
};

export default function RootLayout({ children }) {
  // WordPress core block styles — required for any page that uses core
  // blocks like core/cover, core/group, core/columns, core/buttons etc.
  // (incl. anything inserted from the editor's pattern picker).
  // Without these the markup ships but the cover gradients / group
  // padding / image sizing all evaluate to nothing because the
  // .wp-block-* selectors aren't styled.
  //
  // We pull straight from the WP origin so the version always matches
  // what WP itself uses to serialise. ?ver= cache-busts when WP updates
  // and avoids permanent Vercel caching of a possibly-stale file.
  //
  // ADOPTER NOTE: If you're forking this starter, swap NEXT_PUBLIC_WP_URL
  // for your own WP install. If you DON'T use any core blocks beyond
  // paragraph / heading / list (i.e. you stick to gcb/* blocks), you
  // can delete this <link> and your bundle shrinks.
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL || '';
  const coreBlockCssHref = wpUrl
    ? `${wpUrl.replace(/\/+$/, '')}/wp-includes/css/dist/block-library/style.min.css`
    : null;

  return (
    // data-bs-theme="light" anchors Bootstrap 5.3's CSS-variable theme
    // system. Without it, Bootstrap's --bs-body-color / --bs-body-bg
    // defaults aren't guaranteed to evaluate (Bootstrap 5.3 introduced
    // light/dark scoping via [data-bs-theme]) — which in practice meant
    // accordion bodies inherited the light-on-light combo and the text
    // was invisible.
    <html
      lang="en"
      data-bs-theme="light"
      className={`${dmSans.variable} ${poppins.variable}`}
    >
      <head>
        {coreBlockCssHref && (
          /* eslint-disable-next-line @next/next/no-css-tags */
          <link rel="stylesheet" href={coreBlockCssHref} />
        )}
      </head>
      <body className="font-sans bg-white text-saas-body antialiased">
        {/*
          EmbedMode reads ?embed=1 and toggles a body class so the
          docs hover-preview iframe can hide chrome via CSS rules in
          globals.css. useSearchParams requires a Suspense boundary.
        */}
        <Suspense fallback={null}>
          <EmbedMode />
        </Suspense>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
