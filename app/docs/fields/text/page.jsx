import { H1, H2, P, Code, Pre, Field } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — text / textarea' };

export default function TextDoc() {
  return (
    <>
      <H1>text &amp; textarea</H1>

      <P>
        The simplest controls. Single-line input (<Code>text</Code>) or
        multi-line (<Code>textarea</Code>). Both store a single string.
      </P>

      <H2 id="declare">Declare</H2>

      <Pre lang="json">{`{ "id": "ctrl_eyebrow",
  "type": "text",
  "label": "Eyebrow",
  "attributeKey": "eyebrow",
  "default": "",
  "placeholder": "e.g. New in beta",
  "validation": { "maxLength": 60 },
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="config">Config keys</H2>

      <Field name="default" type="string">
        Initial value if the author hasn&rsquo;t edited the field.
      </Field>
      <Field name="placeholder" type="string">
        Greyed-out hint shown when the input is empty.
      </Field>
      <Field name="helpText" type="string">
        One-line description shown below the input.
      </Field>
      <Field name="validation.required" type="boolean">
        Block save until the field is filled in.
      </Field>
      <Field name="validation.minLength" type="number">
        Minimum character count.
      </Field>
      <Field name="validation.maxLength" type="number">
        Maximum character count. Shown as &ldquo;X / Y&rdquo; counter in the editor.
      </Field>
      <Field name="validation.pattern" type="string (regex)">
        Regex the value must match. Enforced client- and server-side.
      </Field>

      <H2 id="consume">Consume</H2>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `export default function MyBlock({ attributes }) {
  const { eyebrow = '' } = attributes;
  return eyebrow ? <span className="eyebrow">{eyebrow}</span> : null;
}` },
        { label: 'PHP', lang: 'php', code: `<?php
$eyebrow = $attributes['eyebrow'] ?? '';
if ($eyebrow): ?>
  <span class="eyebrow"><?php echo esc_html($eyebrow); ?></span>
<?php endif; ?>` },
      ]} />
    </>
  );
}
