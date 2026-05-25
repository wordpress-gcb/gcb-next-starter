import Link from 'next/link';
import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — Quickstart' };

export default function Quickstart() {
  return (
    <>
      <H1>Quickstart</H1>

      <P>
        GCB blocks render two ways: server-side in PHP (classic Gutenberg)
        or client-side in React on a Next.js / Astro / Remix component
        server. Pick the path that matches your stack — or use both. The
        same block, the same typed fields.
      </P>

      <Callout type="note">
        You&rsquo;ll need WordPress 6.5+ with the block editor and a theme
        you can edit. For the React path you also need a component server
        — this guide uses Next.js.
      </Callout>

      <H2 id="install">1. Install the plugin</H2>

      <P>
        Download the latest release zip from{' '}
        <a href="https://github.com/wordpress-gcb/gutenberg-control-blocks-lite/releases" target="_blank" rel="noopener noreferrer">
          GitHub Releases
        </a>{' '}
        and upload via <em>Plugins &rarr; Add New &rarr; Upload Plugin</em>,
        or install from{' '}
        <a href="https://wordpress.org/plugins/gcb-lite/" target="_blank" rel="noopener noreferrer">wordpress.org</a>.
      </P>

      <P>
        After activation, visit <em>Settings &rarr; GCB Lite</em>. If
        you&rsquo;re going to render in React, set the component server
        URL (e.g. <Code>http://localhost:3001</Code>). If you&rsquo;re
        rendering in PHP only, leave it blank.
      </P>

      <H2 id="scaffold">2. Scaffold a block</H2>

      <P>From your theme&rsquo;s <Code>blocks/</Code> directory:</P>

      <Pre lang="bash">{`mkdir -p blocks/hello && cd blocks/hello`}</Pre>

      <H3 id="blockjson"><Code>block.json</Code></H3>

      <P>
        Same as any WP block. The <Code>render</Code> field tells WP which
        path you want. Choose one:
      </P>

      <CodeTabs tabs={[
        {
          label: 'PHP (render.php)',
          lang: 'json',
          code: `{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "myplugin/hello",
  "title": "Hello",
  "category": "common",
  "render": "file:./render.php"
}`,
        },
        {
          label: 'React (component server)',
          lang: 'json',
          code: `{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "myplugin/hello",
  "title": "Hello",
  "category": "common"
}`,
        },
      ]} />

      <H3 id="fieldsjson"><Code>block.fields.json</Code></H3>

      <P>
        This is the GCB-specific bit. Declare your Inspector controls
        and their typed attributes — gcb-lite generates the WP attribute
        schema and renders the sidebar panel. <strong>Identical for both
        paths.</strong>
      </P>

      <Pre lang="json">{`{
  "controls": [
    { "id": "panel", "type": "group", "label": "Hello settings" },

    { "id": "ctrl_name",
      "type": "text",
      "label": "Name",
      "attributeKey": "name",
      "default": "world",
      "parentPanelId": "panel" },

    { "id": "ctrl_intro",
      "type": "textarea",
      "label": "Intro",
      "attributeKey": "intro",
      "validation": { "maxLength": 200 },
      "parentPanelId": "panel" }
  ]
}`}</Pre>

      <H3 id="render">3. Render the block</H3>

      <P>
        This is where the two paths diverge. Pick your tab:
      </P>

      <CodeTabs tabs={[
        {
          label: 'PHP (render.php)',
          lang: 'php',
          code: `<?php
/**
 * Same file referenced by block.json "render".
 * $attributes is an associative array of typed values matching
 * the keys you declared in block.fields.json.
 */
$name  = $attributes['name']  ?? 'world';
$intro = $attributes['intro'] ?? '';
?>
<section class="hello">
  <h2>Hello, <?php echo esc_html($name); ?>.</h2>
  <?php if ($intro): ?>
    <p><?php echo esc_html($intro); ?></p>
  <?php endif; ?>
</section>`,
        },
        {
          label: 'React (component server)',
          lang: 'jsx',
          code: `// components/Hello.jsx
export default function Hello({ attributes = {} }) {
  const { name = 'world', intro = '' } = attributes;
  return (
    <section className="hello">
      <h2>Hello, {name}.</h2>
      {intro && <p>{intro}</p>}
    </section>
  );
}

// Register in your block registry:
export const WP_BLOCK_REGISTRY = {
  'myplugin/hello': Hello,
  // ...
};`,
        },
      ]} />

      <H2 id="use">4. Use it</H2>

      <P>
        Open the block editor for any page. Insert a new block, search
        for &ldquo;Hello&rdquo;. You&rsquo;ll see the rendered output
        (PHP or React, whichever you wired) with the default values, and
        the Inspector sidebar showing the two fields from{' '}
        <Code>block.fields.json</Code>.
      </P>

      <P>
        Edit the fields — the preview updates. Save the page and view
        it on the public site: same render, same markup. That&rsquo;s
        the parity.
      </P>

      <Callout type="tip">
        Next: read the{' '}
        <Link href="/docs/fields">Field reference</Link>{' '}
        to see every control type and what shape of value it stores, or{' '}
        <Link href="/docs/post-fields">Post fields</Link>{' '}
        to add typed fields to your CPTs.
      </Callout>
    </>
  );
}
