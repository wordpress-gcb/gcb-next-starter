/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // The component server consumes images uploaded to WordPress — allow any
    // host so test setups with different WP URLs (gcblitewp.test, localhost,
    // etc.) work without re-configuring this file.
    remotePatterns: [{ protocol: 'http', hostname: '**' }, { protocol: 'https', hostname: '**' }],
  },

  // CORS for cross-origin embedding. The gcb-lite plugin enqueues this
  // app's /wordpress/styles.css + /wordpress/editor.css into wp-admin,
  // which means the WP origin (e.g. gcblitewp.test) needs to load
  // stylesheets AND the fonts those stylesheets reference (woff2 files
  // under /_next/static/media/). Browsers gate cross-origin font loads
  // on CORS — without these headers the editor canvas renders with
  // fallback fonts and spams the console.
  //
  // Open the static + CSS routes only; route handlers stay closed.
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
      {
        source: '/wordpress/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};

export default nextConfig;
