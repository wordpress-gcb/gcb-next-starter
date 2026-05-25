import { H1, H2, P, Code, Pre, Field } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — heading-level' };

export default function HeadingDoc() {
  return (
    <>
      <H1>heading-level</H1>

      <P>
        A compound control: a text input for the heading text, plus a
        dropdown that picks the heading level (h1..h6, p, div, span). Stores
        both together as a single attribute.
      </P>

      <P>
        Use this anywhere a block needs an editable heading whose semantic
        level matters for accessibility &mdash; site banner h1, section h2,
        accordion item h3, etc.
      </P>

      <H2 id="declare">Declare</H2>

      <Pre lang="json">{`{ "id": "ctrl_heading",
  "type": "heading-level",
  "label": "Heading",
  "attributeKey": "heading",
  "default": { "text": "Selected projects", "level": "h2" },
  "levels": ["h2", "h3"],
  "validation": { "required": true },
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="config">Config keys</H2>

      <Field name="default" type="{ text, level }">
        Initial value. Both keys are optional; missing pieces fall back to
        empty string / first item of <Code>levels</Code>.
      </Field>
      <Field name="levels" type="string[]">
        Subset of <Code>h1, h2, h3, h4, h5, h6, p, div, span</Code> the
        author can choose. Default: all six h-levels.
      </Field>

      <H2 id="shape">Saved value shape</H2>

      <Pre lang="json">{`{ "text": "Selected projects", "level": "h2" }`}</Pre>

      <H2 id="consume">Consume</H2>

      <P>
        Render the right tag dynamically. Validate the level against a
        whitelist so a bad attribute doesn&rsquo;t render arbitrary HTML.
      </P>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `const HEADING_LEVELS = new Set(['h1','h2','h3','h4','h5','h6','p','div','span']);

export default function Section({ attributes }) {
  const heading = attributes.heading || {};
  const Tag = HEADING_LEVELS.has(heading.level) ? heading.level : 'h2';
  return <Tag className="title">{heading.text || ''}</Tag>;
}` },
        { label: 'PHP', lang: 'php', code: `<?php
$allowed_levels = ['h1','h2','h3','h4','h5','h6','p','div','span'];
$heading = $attributes['heading'] ?? [];
$tag  = in_array($heading['level'] ?? '', $allowed_levels, true)
      ? $heading['level']
      : 'h2';
$text = $heading['text'] ?? '';
?>
<<?php echo $tag; ?> class="title"><?php echo esc_html($text); ?></<?php echo $tag; ?>>` },
      ]} />
    </>
  );
}
