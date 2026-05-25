import { H1, H2, P, Code, Pre, Callout } from '@/components/DocsArticle';

export const metadata = { title: 'GCB Lite — Block registry' };

export default function RegistryDoc() {
  return (
    <>
      <H1>Block registry</H1>

      <P>
        A registry maps a block name (string) to a React component. Walk
        the parsed tree, look each block up, render it. That&rsquo;s the
        whole dispatch layer.
      </P>

      <H2 id="define">Define</H2>

      <Pre lang="js">{`// components/registry.js
import AbstrakBanner       from './AbstrakBanner';
import AbstrakProjects     from './AbstrakProjects';
import AbstrakTestimonials from './AbstrakTestimonials';

export const WP_BLOCK_REGISTRY = {
  'gcb/abstrak-banner':       AbstrakBanner,
  'gcb/abstrak-projects':     AbstrakProjects,
  'gcb/abstrak-testimonials': AbstrakTestimonials,
};`}</Pre>

      <H2 id="renderer">The renderer</H2>

      <P>
        A simple recursive component that walks the tree and dispatches:
      </P>

      <Pre lang="jsx">{`import { WP_BLOCK_REGISTRY } from './registry';

export function BlockRenderer({ blocks = [] }) {
  return blocks.map((block, i) => {
    if (!block.blockName) {
      // Freeform HTML or core blocks we don't override — pass through.
      return <div key={i} dangerouslySetInnerHTML={{ __html: block.innerHTML }} />;
    }

    const Component = WP_BLOCK_REGISTRY[block.blockName];
    if (!Component) return null; // or fall back to plugin render

    return (
      <Component
        key={i}
        attributes={block.attrs}
        innerBlocks={block.innerBlocks}
      />
    );
  });
}`}</Pre>

      <H2 id="core-blocks">Handling core blocks</H2>

      <P>
        For core blocks like <Code>core/columns</Code> or{' '}
        <Code>core/heading</Code>, you can either:
      </P>

      <ol style={{ lineHeight: 1.9 }}>
        <li>
          <strong>Render via your own components</strong> — register them
          in the same registry. The gcb-next-starter does this for{' '}
          <Code>core/columns</Code> so it emits Bootstrap grid markup.
        </li>
        <li>
          <strong>Pass through</strong> — render <Code>innerHTML</Code>{' '}
          as-is. Works for prose blocks but breaks for blocks whose markup
          needs your theme&rsquo;s classnames.
        </li>
        <li>
          <strong>Ask the plugin to render</strong> — call{' '}
          <Code>renderBlocksViaPlugin(blocks)</Code> for any block your
          registry doesn&rsquo;t cover. The plugin&rsquo;s render-batch
          endpoint either runs the block&rsquo;s <Code>render.php</Code>{' '}
          or recurses back to your component server.
        </li>
      </ol>

      <Callout type="tip">
        The starter uses option 3 as a fallback — anything not in the
        registry is rendered by the plugin and the HTML is dangerously set
        into a wrapper div. That way you can adopt blocks one at a time.
      </Callout>
    </>
  );
}
