import { H1, H2, P, Code, Pre, Field, Callout } from '@/components/DocsArticle';
import CodeTabs from '@/components/CodeTabs';

export const metadata = { title: 'GCB Lite — toggle / toggle-group' };

export default function ToggleDoc() {
  return (
    <>
      <H1>toggle &amp; toggle-group</H1>

      <P>
        Two related controls.
      </P>
      <ul>
        <li><Code>toggle</Code> — on/off switch. Stores a <Code>boolean</Code>.</li>
        <li><Code>toggle-group</Code> — single-select segmented control. Stores the chosen <Code>value</Code> as a string.</li>
      </ul>

      <Callout type="note">
        For <em>multi</em>-select use <Code>checkbox-group</Code> (alias:{' '}
        <Code>button-group</Code>). The two are picked by the SHAPE of the
        saved value, not by visual style.
      </Callout>

      <H2 id="toggle">toggle</H2>

      <Pre lang="json">{`{ "id": "ctrl_pinned",
  "type": "toggle",
  "label": "Pin to top",
  "attributeKey": "is_pinned",
  "default": false,
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="toggle-group">toggle-group</H2>

      <Pre lang="json">{`{ "id": "ctrl_source",
  "type": "toggle-group",
  "label": "Source",
  "attributeKey": "source",
  "default": "latest",
  "options": [
    { "value": "latest", "label": "Latest" },
    { "value": "manual", "label": "Pick" }
  ],
  "parentPanelId": "panel" }`}</Pre>

      <H2 id="config">Config keys (toggle-group)</H2>

      <Field name="options" type="{ value, label }[]" required>
        The choices shown as segments.
      </Field>
      <Field name="default" type="string">
        The pre-selected <Code>value</Code>. Should match one of the
        options or it&rsquo;ll render with no segment active.
      </Field>

      <H2 id="consume">Consume</H2>

      <CodeTabs tabs={[
        { label: 'React', lang: 'jsx', code: `export default function Collection({ attributes }) {
  const source = attributes.source === 'manual' ? 'manual' : 'latest';
  // ... branch on \`source\`
}` },
        { label: 'PHP', lang: 'php', code: `<?php
$source = ($attributes['source'] ?? 'latest') === 'manual' ? 'manual' : 'latest';
// ... branch on $source` },
      ]} />
    </>
  );
}
