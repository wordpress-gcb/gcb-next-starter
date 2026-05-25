import { H1, H2, P, Code, Pre, Field } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — url' };

export default function UrlDoc() {
  return (
    <>
      <H1>url</H1>

      <P>
        URL picker with a custom display label and a &ldquo;open in new tab&rdquo;
        toggle. Stores all three together.
      </P>

      <H2 id="declare">Declare</H2>

      <Pre lang="json">{`{ "id": "ctrl_cta",
  "type": "url",
  "label": "Primary CTA",
  "attributeKey": "primary_cta",
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="config">Config keys</H2>

      <Field name="default" type="object">
        Initial value, e.g.{' '}
        <Code>{`{ "url": "", "text": "Learn more", "opensInNewTab": false }`}</Code>.
      </Field>

      <H2 id="shape">Saved value shape</H2>

      <Pre lang="json">{`{
  "url":           "https://example.com/pricing",
  "text":          "See plans",
  "opensInNewTab": true
}`}</Pre>

      <H2 id="consume">Consume</H2>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `export default function CtaButton({ attributes }) {
  const cta = attributes.primary_cta;
  if (!cta?.url) return null;

  return (
    <a
      href={cta.url}
      target={cta.opensInNewTab ? '_blank' : undefined}
      rel={cta.opensInNewTab ? 'noopener noreferrer' : undefined}
      className="cta-btn"
    >
      {cta.text || 'Learn more'}
    </a>
  );
}` },
        { label: 'PHP', lang: 'php', code: `<?php
$cta = $attributes['primary_cta'] ?? null;
if (!$cta || empty($cta['url'])) return;
$new_tab = !empty($cta['opensInNewTab']);
?>
<a
  href="<?php echo esc_url($cta['url']); ?>"
  <?php if ($new_tab): ?>target="_blank" rel="noopener noreferrer"<?php endif; ?>
  class="cta-btn"
>
  <?php echo esc_html($cta['text'] ?? 'Learn more'); ?>
</a>` },
      ]} />
    </>
  );
}
