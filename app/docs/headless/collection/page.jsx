import { H1, H2, P, Code, Pre, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — Collection helper' };

export default function CollectionDoc() {
  return (
    <>
      <H1>Collection helper</H1>

      <P>
        A &ldquo;section block&rdquo; usually wants to render a strip of
        records pulled from a CPT — a projects grid, a testimonial slider,
        a brands logo wall. Authors should pick between &ldquo;latest N&rdquo;
        and &ldquo;manually picked&rdquo;. <Code>getCptCollection</Code>{' '}
        handles both.
      </P>

      <H2 id="signature">Signature</H2>

      <Pre lang="ts">{`async function getCptCollection(
  postType: string,
  attrs: {
    source?:    'latest' | 'manual';
    count?:     number;
    post_ids?:  number[];
  } = {}
): Promise<RestEntity[]>;`}</Pre>

      <H2 id="usage">Usage</H2>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `import { getCptCollection } from '@/lib/wpRestClient';

export default async function Projects({ attributes }) {
  const items = await getCptCollection('project', attributes);

  return (
    <div className="row">
      {items.map((p) => (
        <article className="col-md-4" key={p.id}>
          <img src={p.meta.cover?.url} alt={p.title.rendered} />
          <h3>{p.title.rendered}</h3>
        </article>
      ))}
    </div>
  );
}` },
        { label: 'PHP', lang: 'php', code: `<?php
use GCBLite\\Collection;
$items = Collection::query('project', $attributes);
?>
<div class="row">
  <?php foreach ($items as $p):
    $cover = get_post_meta($p->ID, 'cover', true);
  ?>
    <article class="col-md-4">
      <img src="<?php echo esc_url($cover['url'] ?? ''); ?>"
           alt="<?php echo esc_attr(get_the_title($p)); ?>" />
      <h3><?php echo esc_html(get_the_title($p)); ?></h3>
    </article>
  <?php endforeach; ?>
</div>` },
      ]} />

      <H2 id="modes">The two modes</H2>

      <H2 id="latest" style={{ fontSize: 20 }}><Code>source: &quot;latest&quot;</Code></H2>
      <P>
        Fetches <Code>?per_page={'{count}'}&amp;orderby=date&amp;order=desc</Code>.
        Default count is 6 (clamped 1..100). Use this for &ldquo;newest
        posts/projects/brands&rdquo; strips.
      </P>

      <H2 id="manual" style={{ fontSize: 20 }}><Code>source: &quot;manual&quot;</Code></H2>
      <P>
        Fetches <Code>?include[]={'{ids...}'}&amp;orderby=include</Code>{' '}
        — preserves the author&rsquo;s explicit order. Pair with a{' '}
        <Code>post-object</Code> field to let authors curate the list.
      </P>

      <H2 id="block-fields">Pairs with this block.fields.json</H2>

      <Pre lang="json">{`{ "id": "ctrl_source",
  "type": "toggle-group",
  "attributeKey": "source",
  "default": "latest",
  "options": [
    { "value": "latest", "label": "Latest" },
    { "value": "manual", "label": "Pick" }
  ] },

{ "id": "ctrl_count",
  "type": "number",
  "attributeKey": "count",
  "default": 6,
  "validation": { "min": 1, "max": 24 },
  "conditionalLogic": {
    "enabled": true,
    "rules": [{ "field": "source", "operator": "==", "value": "latest" }]
  } },

{ "id": "ctrl_post_ids",
  "type": "post-object",
  "attributeKey": "post_ids",
  "multiple": true,
  "postType": "project",
  "conditionalLogic": {
    "enabled": true,
    "rules": [{ "field": "source", "operator": "==", "value": "manual" }]
  } }`}</Pre>

      <Callout type="tip">
        The demo section blocks (brands, blog, projects, testimonials)
        all use this exact pattern. Copy one as a starting point.
      </Callout>

      <H2 id="caching">Caching</H2>

      <P>
        Calls use <Code>fetch(url, {`{ next: { revalidate: 30 } }`})</Code>{' '}
        — Next.js will cache the response for 30 seconds. Editor changes
        appear within that window. Tune the revalidate value per route if
        you need faster or slower freshness.
      </P>
    </>
  );
}
