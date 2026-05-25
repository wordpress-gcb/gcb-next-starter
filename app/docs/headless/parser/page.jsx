import { H1, H2, P, Code, Pre, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — Block parser' };

export default function ParserDoc() {
  return (
    <>
      <H1>Block parser</H1>

      <P>
        WordPress stores a page as a sequence of HTML comments wrapped
        around their rendered HTML. To get back to a tree of typed
        attributes you parse that markup with the same library Gutenberg
        uses on the server.
      </P>

      <H2 id="parse">Parse</H2>

      <P>
        Same block markup; same tree shape. The Node side uses the
        official <Code>@wordpress/block-serialization-default-parser</Code>{' '}
        package. The PHP side uses WP core&rsquo;s <Code>parse_blocks()</Code>.
      </P>

      <CodeTabs tabs={[
        { label: 'Node (JS)', lang: 'js', code: `// npm i @wordpress/block-serialization-default-parser
import { parse } from '@wordpress/block-serialization-default-parser';

const tree = parse(\`
  <!-- wp:gcb/banner {"heading":{"text":"Hi","level":"h1"}} /-->
  <!-- wp:gcb/blog {"count":3} /-->
\`);

// tree[0] === { blockName: 'gcb/banner', attrs: { ... }, innerBlocks: [], ... }
// tree[1] === { blockName: 'gcb/blog',   attrs: { count: 3 }, innerBlocks: [], ... }` },
        { label: 'PHP', lang: 'php', code: `<?php
// WP core ships parse_blocks() — no extra install needed.
$tree = parse_blocks('
  <!-- wp:gcb/banner {"heading":{"text":"Hi","level":"h1"}} /-->
  <!-- wp:gcb/blog {"count":3} /-->
');

// $tree[0] === [
//   'blockName'   => 'gcb/banner',
//   'attrs'       => [ 'heading' => [...] ],
//   'innerBlocks' => [],
//   ...
// ]` },
      ]} />

      <H2 id="block-shape">The block shape</H2>

      <Pre lang="ts">{`type Block = {
  blockName:    string | null;   // 'gcb/banner', 'core/columns', null for HTML
  attrs:        Record<string, any>;
  innerBlocks:  Block[];
  innerHTML:    string;          // HTML between wrapping comments
  innerContent: (string | null)[];
};`}</Pre>

      <Callout type="note">
        Block markup IS HTML, so freeform HTML between blocks (raw text,
        custom HTML blocks) shows up as blocks with{' '}
        <Code>blockName: null</Code>. Skip them in your renderer or render
        their <Code>innerHTML</Code> as-is.
      </Callout>

      <H2 id="defaults">Attribute defaults</H2>

      <P>
        WP only persists attributes that DIFFER from the registered
        defaults. So <Code>attrs</Code> from the parser will be missing
        keys an empty block actually has. Fetch the defaults from{' '}
        <Code>/wp-json/gcblite/v1/blocks</Code> and merge them in:
      </P>

      <Pre lang="js">{`import { getBlockDefaults } from '@/lib/wpRestClient';

const defaults = await getBlockDefaults();
// defaults['gcb/banner'] === { heading: { text: '', level: 'h1' }, body: '...' }

const merged = { ...defaults[block.blockName], ...block.attrs };`}</Pre>

      <Callout type="tip">
        gcb-next-starter does this for you in{' '}
        <Code>app/[...slug]/page.jsx</Code>. If you fork the starter you
        don&rsquo;t need to think about it.
      </Callout>
    </>
  );
}
