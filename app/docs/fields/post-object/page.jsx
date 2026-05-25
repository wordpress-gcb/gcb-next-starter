import { H1, H2, P, Code, Pre, Field, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — post-object' };

export default function PostObjectDoc() {
  return (
    <>
      <H1>post-object</H1>

      <P>
        Pick one or many posts (or any custom post type). Stores post IDs
        — the React component then fetches the rest via REST (or the{' '}
        <Code>getCptCollection</Code> helper).
      </P>

      <H2 id="declare">Declare (multi-select)</H2>

      <Pre lang="json">{`{ "id": "ctrl_post_ids",
  "type": "post-object",
  "label": "Brands",
  "attributeKey": "post_ids",
  "multiple": true,
  "postType": "brand",
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="config">Config keys</H2>

      <Field name="postType" type="string" required>
        WP post type slug — <Code>&quot;post&quot;</Code>, <Code>&quot;page&quot;</Code>,
        or any custom-post-type slug.
      </Field>
      <Field name="multiple" type="boolean (default false)">
        Allow selecting more than one. With <Code>true</Code> the saved
        value is an array; with <Code>false</Code> it&rsquo;s a single ID.
      </Field>

      <H2 id="shape">Saved value shape</H2>

      <Pre lang="json">{`// multiple: true
[12, 7, 41]

// multiple: false
12`}</Pre>

      <H2 id="conditional">Pair with conditional logic</H2>

      <P>
        The pattern the demo section blocks use: a <Code>source</Code>{' '}
        toggle picks between &ldquo;latest&rdquo; and &ldquo;manual&rdquo;,
        and the post-object only shows when source == manual:
      </P>

      <Pre lang="json">{`{ "id": "ctrl_post_ids",
  "type": "post-object",
  "attributeKey": "post_ids",
  "multiple": true,
  "postType": "project",
  "conditionalLogic": {
    "enabled": true,
    "rules": [{ "field": "source", "operator": "==", "value": "manual" }]
  } }`}</Pre>

      <H2 id="consume">Consume</H2>

      <Callout type="tip">
        On the React side, use the bundled <Code>getCptCollection(postType, attrs)</Code>{' '}
        helper from <Code>lib/wpRestClient.js</Code>. On the PHP side, use
        the matching <Code>GCBLite\\Collection::query()</Code> — both handle
        latest + manual modes with the same attrs shape.
      </Callout>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `import { getCptCollection } from '@/lib/wpRestClient';

export default async function Brands({ attributes }) {
  const items = await getCptCollection('brand', attributes);
  return (
    <div className="row">
      {items.map((b) => (
        <div className="col-lg-3" key={b.id}>
          <img src={b.meta.logo?.url} alt={b.title.rendered} />
        </div>
      ))}
    </div>
  );
}` },
        { label: 'PHP', lang: 'php', code: `<?php
use GCBLite\\Collection;
$items = Collection::query('brand', $attributes);
?>
<div class="row">
  <?php foreach ($items as $b):
    $logo = get_post_meta($b->ID, 'logo', true);
  ?>
    <div class="col-lg-3">
      <img src="<?php echo esc_url($logo['url'] ?? ''); ?>"
           alt="<?php echo esc_attr(get_the_title($b)); ?>" />
    </div>
  <?php endforeach; ?>
</div>` },
      ]} />
    </>
  );
}
