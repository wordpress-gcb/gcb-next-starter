/**
 * Examples-branch demo homepage.
 *
 * Composes the marketing blocks (Hero, FeatureTrio, Cta) with static
 * content, so it renders without needing a paired WordPress install. It's
 * the gcb-lite landing page, built out of its own blocks.
 *
 * In a real deployment you wouldn't hardcode block content like this —
 * you'd fetch a WP page via /wp-json/wp/v2/pages and let
 * app/[...slug]/page.jsx walk the block tree. This page exists so the
 * `examples` branch works out of the box without a paired WordPress.
 */

import Hero from '@/components/Hero';
import FeatureTrio from '@/components/FeatureTrio';
import Cta from '@/components/Cta';

export default function Home() {
  return (
    <main>
      <Hero
        attributes={{
          eyebrow: 'GCB Lite · WordPress + React',
          heading: 'Author in Gutenberg. Render in React.',
          body: '<p>Build custom blocks with typed fields, then render the same React component in the editor preview and on your public Next.js site. No <code>edit.js</code> to maintain in parallel with your real frontend.</p>',
          imageSide: 'right',
          ctaPrimary: {
            url: 'https://github.com/wordpress-gcb/gutenberg-control-blocks-lite',
            text: 'View on GitHub',
            opensInNewTab: true,
          },
          ctaSecondary: {
            url: 'https://github.com/wordpress-gcb/gcb-next-starter',
            text: 'Try the starter',
            opensInNewTab: true,
          },
        }}
      />

      <FeatureTrio
        attributes={{
          eyebrow: 'What you get',
          heading: 'One source of truth per block',
          intro:
            'The editor preview is the same React component you ship to production, server-rendered and handed to wp-admin as HTML.',
        }}
        innerBlocks={[
          {
            blockName: 'gcb/feature-item',
            attrs: {
              icon: { source: 'dashicon', icon: 'editor-code' },
              title: 'One component, two contexts',
              body: 'Write the React component once. WordPress fetches it server-to-server for the editor preview; visitors see the same component on the public site.',
            },
          },
          {
            blockName: 'gcb/feature-item',
            attrs: {
              icon: { source: 'dashicon', icon: 'admin-customizer' },
              title: '30+ Inspector controls',
              body: 'Image with focal point, gallery with drag-to-reorder, post relationships, taxonomy, icon, repeater. The rich stuff core leaves to plugins.',
            },
          },
          {
            blockName: 'gcb/feature-item',
            attrs: {
              icon: { source: 'dashicon', icon: 'admin-tools' },
              title: 'AI-ready out of the box',
              body: 'Registers WordPress 7 Abilities for list-blocks and render-block, so MCP clients like Claude Desktop can drive the editor without bespoke glue.',
            },
          },
        ]}
      />

      <Cta
        attributes={{
          heading: 'Ready to build?',
          body:
            "Clone the plugin and the starter. You'll be authoring React-rendered blocks in under five minutes.",
          variant: 'branded',
          link: {
            url:
              'https://github.com/wordpress-gcb/gutenberg-control-blocks-lite#quick-start',
            text: 'Read the quick-start',
            opensInNewTab: true,
          },
        }}
      />
    </main>
  );
}
