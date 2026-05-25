import { H1, H2, P, Code, Pre, Field, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — image' };

export default function ImageDoc() {
  return (
    <>
      <H1>image</H1>

      <P>
        Media library image picker. Stores a full image object — URL, alt,
        dimensions, optional focal point, and (when enabled) sizing /
        repeat / fixed-background config.
      </P>

      <H2 id="declare">Declare</H2>

      <Pre lang="json">{`{ "id": "ctrl_cover",
  "type": "image",
  "label": "Cover image",
  "attributeKey": "cover",
  "validation": { "required": true },
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="config">Config keys</H2>

      <Field name="enableFocalPoint" type="boolean (default true)">
        Show the FocalPointPicker so the author can choose a focus point
        for cover-cropping.
      </Field>
      <Field name="enableSizeOptions" type="boolean (default true)">
        Show cover / contain / tile + custom-width selectors.
      </Field>
      <Field name="enableRepeatOptions" type="boolean (default true)">
        Toggle for background-repeat (active when size !== &ldquo;cover&rdquo;).
      </Field>
      <Field name="enableFixedBackground" type="boolean (default true)">
        Toggle for <Code>background-attachment: fixed</Code>.
      </Field>

      <H2 id="shape">Saved value shape</H2>

      <Pre lang="json">{`{
  "url":        "https://example.com/wp-content/uploads/2026/hero.jpg",
  "alt":        "A laptop on a desk",
  "width":      1600,
  "height":     900,
  "id":         482,
  "focalPoint": { "x": 0.5, "y": 0.4 },
  "size":       "cover",
  "isRepeat":   false,
  "isFixed":    false
}`}</Pre>

      <Callout type="note">
        Optional fields only appear when the corresponding{' '}
        <Code>enable*</Code> flag is on AND the author touched the control.
        Always destructure with defaults in React.
      </Callout>

      <H2 id="consume">Consume</H2>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `export default function Hero({ attributes }) {
  const cover = attributes.cover;
  if (!cover?.url) return null;

  return (
    <div
      className="hero"
      style={{
        backgroundImage: \`url(\${cover.url})\`,
        backgroundSize:  cover.size || 'cover',
        backgroundPosition: cover.focalPoint
          ? \`\${cover.focalPoint.x * 100}% \${cover.focalPoint.y * 100}%\`
          : 'center',
      }}
    />
  );
}` },
        { label: 'PHP', lang: 'php', code: `<?php
$cover = $attributes['cover'] ?? null;
if (!$cover || empty($cover['url'])) return;

$bg_pos = isset($cover['focalPoint'])
  ? sprintf('%d%% %d%%', $cover['focalPoint']['x'] * 100, $cover['focalPoint']['y'] * 100)
  : 'center';
?>
<div
  class="hero"
  style="background-image:url(<?php echo esc_url($cover['url']); ?>);
         background-size:<?php echo esc_attr($cover['size'] ?? 'cover'); ?>;
         background-position:<?php echo esc_attr($bg_pos); ?>;"
></div>` },
      ]} />
    </>
  );
}
