import { H1, H2, P, Code, Pre, Field, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — checkbox-group' };

export default function CheckboxDoc() {
  return (
    <>
      <H1>checkbox-group</H1>

      <P>
        Multi-select control. Alias: <Code>button-group</Code> (the two
        names render the same control with different visual styling). Use
        this when authors need to pick zero or more options from a fixed
        list.
      </P>

      <Callout type="warn">
        For <em>single</em>-select use <Code>toggle-group</Code>. The
        controls are picked by the SHAPE of the saved value: array of
        strings (multi) vs single string (single).
      </Callout>

      <H2 id="declare">Declare</H2>

      <Pre lang="json">{`{ "id": "ctrl_categories",
  "type": "checkbox-group",
  "label": "Show categories",
  "attributeKey": "categories",
  "default": ["design"],
  "options": [
    { "value": "design",      "label": "Design" },
    { "value": "engineering", "label": "Engineering" },
    { "value": "product",     "label": "Product" }
  ],
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="config">Config keys</H2>

      <Field name="options" type="{ value, label }[]" required>
        The choices.
      </Field>
      <Field name="default" type="string[]">
        Pre-selected values. Empty array if omitted.
      </Field>

      <H2 id="shape">Saved value shape</H2>

      <Pre lang="json">{`["design", "engineering"]`}</Pre>

      <H2 id="consume">Consume</H2>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `export default function Filters({ attributes }) {
  const cats = Array.isArray(attributes.categories) ? attributes.categories : [];
  return (
    <ul>
      {cats.map((c) => <li key={c}>{c}</li>)}
    </ul>
  );
}` },
        { label: 'PHP', lang: 'php', code: `<?php
$cats = is_array($attributes['categories'] ?? null) ? $attributes['categories'] : [];
?>
<ul>
  <?php foreach ($cats as $c): ?>
    <li><?php echo esc_html($c); ?></li>
  <?php endforeach; ?>
</ul>` },
      ]} />
    </>
  );
}
