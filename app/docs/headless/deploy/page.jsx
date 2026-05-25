import { H1, H2, P, Code, Pre, Callout } from '@/components/DocsArticle';

export const metadata = { title: 'GCB Lite — Deploy' };

export default function DeployDoc() {
  return (
    <>
      <H1>Deploy</H1>

      <P>
        GCB Lite splits cleanly across hosts: WordPress sits wherever WP
        traditionally sits (Kinsta, Pressable, WP Engine, a $5 VPS); the
        React component server sits wherever Next.js / Astro / Remix
        sits (Vercel, Netlify, Cloudflare, self-hosted Node). The two
        only need HTTPS reachability between them.
      </P>

      <H2 id="env">Environment variables</H2>

      <Pre lang="bash">{`# .env.local on the Next.js side
NEXT_PUBLIC_WP_URL=https://wp.yoursite.com`}</Pre>

      <P>
        On the WordPress side, in <em>Settings &rarr; GCB Lite</em>, set
        the component server URL — for production, this is the public
        Vercel / Netlify URL. The plugin POSTs each block&rsquo;s
        attributes to <Code>{`{component_server}/api/render`}</Code> and
        SSRs the result back into the block editor preview.
      </P>

      <H2 id="vercel">Pattern 1 — Vercel + WP-on-anything</H2>

      <ul style={{ lineHeight: 1.9 }}>
        <li>WP at <Code>wp.yoursite.com</Code> (managed host).</li>
        <li>Next.js at <Code>yoursite.com</Code> (Vercel).</li>
        <li>One DNS record points at each.</li>
      </ul>

      <P>
        Editors log into WP at <Code>wp.yoursite.com/wp-admin</Code>.
        Public visitors land on the Vercel-hosted Next.js site, which
        fetches content from the WP REST API. No proxy, no rewrites, no
        shared infrastructure between the two.
      </P>

      <Callout type="warn">
        Make sure WP&rsquo;s REST endpoints are reachable from Vercel
        (firewall allowlist if your host has one). Editor preview also
        needs Vercel to be reachable from WP&rsquo;s server (PHP-to-Node
        round trip).
      </Callout>

      <H2 id="cors">Pattern 2 — Shared origin via reverse proxy</H2>

      <P>
        Put WP under <Code>yoursite.com/wp/</Code> and the Next.js app at{' '}
        <Code>yoursite.com/</Code>. Easier for the WP admin (same-origin
        cookies, no CORS), at the cost of host coupling.
      </P>

      <H2 id="caching">Caching strategy</H2>

      <ul style={{ lineHeight: 1.9 }}>
        <li>
          <Code>getPageBySlug / getPostBySlug / getCptCollection</Code> use{' '}
          <Code>revalidate: 30</Code> by default. Tune per call.
        </li>
        <li>
          <Code>getBlockDefaults</Code> uses <Code>revalidate: 300</Code>{' '}
          (schemas barely change).
        </li>
        <li>
          For instant editor previews, use Next.js&rsquo;s{' '}
          <Code>on-demand revalidation</Code> from a WP{' '}
          <Code>save_post</Code> hook (POST to a Next.js revalidate
          endpoint when the author saves).
        </li>
      </ul>

      <H2 id="ssrf">SSRF posture</H2>

      <P>
        The plugin&rsquo;s render endpoints proxy POST requests to your
        configured component server URL. Treat this as one trusted
        relationship: only the URL the admin configured is callable. If
        you fork the plugin to add multi-tenancy or accept the URL from
        request input, pin allowed hosts and block private/loopback ranges.
      </P>
    </>
  );
}
