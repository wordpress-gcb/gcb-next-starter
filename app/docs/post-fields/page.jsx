import Link from 'next/link';
import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — Post fields (CPT meta)' };

export default function PostFieldsDoc() {
  return (
    <>
      <H1>Post fields (CPT meta)</H1>

      <P>
        GCB Lite&rsquo;s field system isn&rsquo;t just for blocks. The same
        typed controls can attach to a custom post type as a meta-box. The
        author edits structured fields next to (or instead of) the post
        body; you read the result from REST as typed JSON.
      </P>

      <P>
        Useful for content that&rsquo;s a <em>record</em>, not a page —
        testimonials, brands, team members, projects, FAQ items. The CPT
        is just rows; the fields are the columns.
      </P>

      <H2 id="register">Register fields on a CPT</H2>

      <P>
        In your theme&rsquo;s <Code>functions.php</Code>:
      </P>

      <Pre lang="php">{`add_action('init', function () {
    register_post_type('testimonial', [
        'label'        => __('Testimonials', 'mytheme'),
        'public'       => true,
        'show_in_rest' => true,
        'supports'     => ['title'],   // no 'editor' — fields-only
    ]);

    if (function_exists('gcblite_register_post_fields')) {
        gcblite_register_post_fields('testimonial', [
            'controls' => [
                ['type'         => 'textarea',
                 'attributeKey' => 'quote',
                 'label'        => __('Quote', 'mytheme'),
                 'validation'   => ['required' => true, 'minLength' => 10]],

                ['type'         => 'text',
                 'attributeKey' => 'author_name',
                 'label'        => __('Author name', 'mytheme'),
                 'validation'   => ['required' => true]],

                ['type'         => 'image',
                 'attributeKey' => 'author_image',
                 'label'        => __('Author headshot', 'mytheme')],
            ],
        ]);
    }
});`}</Pre>

      <H2 id="meta-box">What the author sees</H2>

      <P>
        Visit any post of this CPT — you&rsquo;ll see a <em>Fields</em>{' '}
        meta-box with the controls you declared. The block editor body is
        stripped by default (the record IS the data, not a wrapped
        document). Opt back in by passing <Code>has_body =&gt; true</Code>.
      </P>

      <H2 id="rest">REST exposure</H2>

      <P>
        Every field is automatically registered as REST{' '}
        <Code>meta</Code> with its typed schema. You can read it via:
      </P>

      <Pre lang="bash">{`curl "https://example.com/wp-json/wp/v2/testimonial?per_page=10&_embed=1"`}</Pre>

      <P>Response:</P>

      <Pre lang="json">{`[
  {
    "id": 42,
    "title": { "rendered": "Maya Hernández" },
    "meta": {
      "quote":        "The editor preview and the live site are the same component...",
      "author_name":  "Maya Hernández",
      "author_image": {
        "url":   "https://example.com/wp-content/uploads/.../maya.jpg",
        "alt":   "Maya Hernández",
        "width": 200,
        "height":200
      }
    }
  }
]`}</Pre>

      <Callout type="note">
        <Code>gcblite_register_post_fields</Code> automatically enables{' '}
        <Code>custom-fields</Code> support on the CPT — without that, WP
        core suppresses <Code>meta</Code> from REST responses even for
        registered fields. You don&rsquo;t need to add it to your{' '}
        <Code>supports</Code> array.
      </Callout>

      <H2 id="config">Config keys</H2>

      <H3 id="config-controls"><Code>controls</Code></H3>
      <P>
        Required. Same shape as a block&rsquo;s <Code>block.fields.json</Code>
        controls array. See the{' '}
        <Link href="/docs/fields">Field reference</Link>.
      </P>

      <H3 id="config-has-body"><Code>has_body</Code></H3>
      <P>
        Optional (default <Code>false</Code>). When <Code>true</Code>, keeps
        the block editor body on the post-edit screen alongside the fields
        meta-box. Use this when the CPT really is a hybrid &mdash; record
        data PLUS a free-form body (e.g. a project with structured metadata
        and a long case-study).
      </P>

      <H2 id="frontend">Consume</H2>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `import { getCptCollection } from '@/lib/wpRestClient';

export default async function Testimonials({ attributes }) {
  const items = await getCptCollection('testimonial', attributes);
  return items.map((t) => (
    <blockquote key={t.id}>
      <p>{t.meta.quote}</p>
      <cite>{t.meta.author_name}</cite>
    </blockquote>
  ));
}` },
        { label: 'PHP', lang: 'php', code: `<?php
use GCBLite\\Collection;
$items = Collection::query('testimonial', $attributes);
foreach ($items as $t):
  $quote  = get_post_meta($t->ID, 'quote', true);
  $author = get_post_meta($t->ID, 'author_name', true);
?>
  <blockquote>
    <p><?php echo esc_html($quote); ?></p>
    <cite><?php echo esc_html($author); ?></cite>
  </blockquote>
<?php endforeach; ?>` },
      ]} />

      <Callout type="tip">
        The <Code>attrs</Code> argument is the section block&rsquo;s own
        attribute set. The helper reads <Code>source</Code> (&ldquo;latest&rdquo;
        / &ldquo;manual&rdquo;), <Code>count</Code>, and{' '}
        <Code>post_ids</Code> from it — so a single helper covers both
        query modes.
      </Callout>
    </>
  );
}
