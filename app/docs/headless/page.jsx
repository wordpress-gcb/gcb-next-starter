import Link from 'next/link';
import { H1, H2, P, Code, Pre, Callout } from '@/components/DocsArticle';

export const metadata = { title: 'GCB Lite — Headless rendering' };

export default function HeadlessOverview() {
  return (
    <>
      <H1>Headless rendering</H1>

      <P>
        GCB Lite is built for a headless setup: WordPress holds the content,
        a React frontend (Next.js, Astro, Remix — anything that can run a
        component server) renders it. The same React components power both
        the WordPress block editor preview AND the public site.
      </P>

      <H2 id="flow">The end-to-end flow</H2>

      <ol style={{ lineHeight: 1.9 }}>
        <li>
          <strong>Edit in WP</strong> — author drops blocks on a page. Each
          block&rsquo;s <Code>block.fields.json</Code> renders an Inspector
          panel; values save as typed WP attributes.
        </li>
        <li>
          <strong>Persist as block markup</strong> — WP writes the page as a
          sequence of HTML comments: <Code>&lt;!-- wp:gcb/foo {`{...}`} /--&gt;</Code>.
        </li>
        <li>
          <strong>Fetch via REST</strong> — your Next.js frontend fetches
          the page, reads its <Code>blocks_raw</Code> field (added by
          gcb-lite&rsquo;s REST extension) or falls back to{' '}
          <Code>content.rendered</Code>.
        </li>
        <li>
          <strong>Parse</strong> — use <Code>@wordpress/block-serialization-default-parser</Code>{' '}
          to turn block markup into a tree of <Code>{`{ blockName, attrs, innerBlocks }`}</Code>.
          See <Link href="/docs/headless/parser">Block parser</Link>.
        </li>
        <li>
          <strong>Dispatch</strong> — walk the tree and look up each block
          in your <Code>WP_BLOCK_REGISTRY</Code>. Render the matching React
          component with the parsed attributes. See{' '}
          <Link href="/docs/headless/registry">Block registry</Link>.
        </li>
        <li>
          <strong>Section blocks fetch their own data</strong> — a brands
          strip block hits the brand CPT collection; a blog grid block hits{' '}
          <Code>/wp/v2/posts</Code>. Use{' '}
          <Code>getCptCollection(postType, attrs)</Code> to mirror the
          plugin&rsquo;s PHP Collection helper. See{' '}
          <Link href="/docs/headless/collection">Collection helper</Link>.
        </li>
      </ol>

      <H2 id="why-headless">Why this matters</H2>

      <P>
        The classic Gutenberg setup has two render paths: an{' '}
        <Code>edit.js</Code> for the editor and a <Code>save.js</Code>{' '}
        (or PHP <Code>render.php</Code>) for the frontend. They drift. The
        editor previews one thing, the public site renders another, and
        the editor lies about what readers will see.
      </P>

      <P>
        GCB Lite collapses both into a single React component. The plugin
        SSRs your component server&rsquo;s output INTO the editor preview,
        so the preview IS the live site, fed by the live attributes. No{' '}
        <Code>edit.js</Code> to maintain.
      </P>

      <Callout type="tip">
        This is the differentiator vs. WordPress 7&rsquo;s declarative
        inspector controls. The inspector surface alone is becoming
        commoditised. The editor/frontend parity story is the moat.
      </Callout>

      <H2 id="next">Read on</H2>

      <ul style={{ lineHeight: 1.9 }}>
        <li><Link href="/docs/headless/parser">Block parser</Link> — turning block markup into a tree.</li>
        <li><Link href="/docs/headless/registry">Block registry</Link> — dispatching to React components.</li>
        <li><Link href="/docs/headless/collection">Collection helper</Link> — fetching CPT records from inside a section block.</li>
        <li><Link href="/docs/headless/deploy">Deploy</Link> — Vercel + WP-on-Kinsta and other patterns.</li>
      </ul>
    </>
  );
}
