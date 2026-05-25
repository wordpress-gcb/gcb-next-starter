import Link from 'next/link';
import { H1, H2, P, Code, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite docs — overview' };

export default function DocsHome() {
  return (
    <>
      <H1>GCB Lite documentation</H1>

      <P>
        Typed Inspector fields for Gutenberg, declared as JSON files in
        your theme. No admin-UI field-group screens. No database-backed
        field config. The block&rsquo;s <Code>block.fields.json</Code> is
        the source of truth, version-controlled alongside its{' '}
        <Code>block.json</Code> and its render code.
      </P>

      <P>Render the same block in PHP, React, or both:</P>

      <CodeTabs tabs={[
        { label: 'block.fields.json', lang: 'json', code: `{
  "controls": [
    { "id": "panel", "type": "group", "label": "Hello" },
    { "id": "ctrl_name",
      "type": "text",
      "attributeKey": "name",
      "label": "Name",
      "default": "world",
      "parentPanelId": "panel" }
  ]
}` },
        { label: 'render.php', lang: 'php', code: `<?php
$name = $attributes['name'] ?? 'world';
?>
<h2>Hello, <?php echo esc_html($name); ?>.</h2>` },
        { label: 'Hello.jsx', lang: 'jsx', code: `export default function Hello({ attributes = {} }) {
  const { name = 'world' } = attributes;
  return <h2>Hello, {name}.</h2>;
}` },
      ]} />

      <Callout type="tip">
        New here? Start with the <Link href="/docs/quickstart">Quickstart</Link>{' '}
        — install the plugin, scaffold your first block, see it render in
        ten minutes.
      </Callout>

      <H2 id="why">What you get</H2>

      <ul style={{ lineHeight: 1.9 }}>
        <li>
          <strong>File-based schemas.</strong> Field config lives in JSON
          beside its block, not in <em>wp_options</em>. Diffable in
          git, reviewable in PRs, mergeable.
        </li>
        <li>
          <strong>No UI authoring.</strong> There&rsquo;s no Field Groups
          screen to click through. Add a control by adding a JSON object.
        </li>
        <li>
          <strong>Scaffold CLI built for stdin.</strong>{' '}
          <Code>wp gcblite scaffold</Code> reads a field spec from stdin
          and writes the block files — terminal, CI, or any other
          process that can pipe JSON.
        </li>
        <li>
          <strong>30+ typed control types.</strong> text, textarea,
          image, url, post-object, taxonomy, repeater, heading-level,
          conditional logic, validation. See the{' '}
          <Link href="/docs/fields">Field reference</Link>.
        </li>
        <li>
          <strong>Render PHP or React, or both.</strong> Same{' '}
          <Code>block.fields.json</Code>, same typed attrs. Pick the
          render path per block.
        </li>
        <li>
          <strong>Editor/frontend parity (React path).</strong> One
          component renders the editor preview AND the live site &mdash;
          no <Code>edit.js</Code> to maintain in parallel.
        </li>
      </ul>

      <H2 id="map">Where to go next</H2>

      <ul style={{ lineHeight: 1.9 }}>
        <li>
          <strong><Link href="/docs/quickstart">Quickstart</Link></strong> —
          install, create your first block, render it both ways.
        </li>
        <li>
          <strong><Link href="/docs/fields">Field reference</Link></strong> —
          every Inspector control type, the shape of its saved value,
          copy-paste examples.
        </li>
        <li>
          <strong><Link href="/docs/post-fields">Post fields</Link></strong> —
          attach typed fields to CPTs using{' '}
          <Code>gcblite_register_post_fields()</Code>.
        </li>
        <li>
          <strong><Link href="/docs/headless">Headless rendering</Link></strong> —
          parse block markup, dispatch to React components, fetch via REST.
        </li>
      </ul>

      <H2 id="shape">The shape of a GCB block</H2>

      <ul style={{ lineHeight: 1.9 }}>
        <li><Code>block.json</Code> — WP&rsquo;s standard block metadata.</li>
        <li><Code>block.fields.json</Code> — GCB&rsquo;s Inspector control declarations.</li>
        <li>
          <Code>render.php</Code> (PHP path) or a React component on your
          component server (React path) — or both.
        </li>
      </ul>

      <P>
        gcb-lite reads <Code>block.fields.json</Code>, generates a typed
        WP attribute schema, renders the Inspector panel, and feeds the
        resolved attrs into whichever render path the block declares.
      </P>
    </>
  );
}
