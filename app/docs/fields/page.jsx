import Link from 'next/link';
import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';

export const metadata = { title: 'GCB Lite — Field reference' };

/**
 * Field-reference index. One row per control type, with a one-line
 * description of the shape of the saved value. Detail pages live under
 * /docs/fields/<name>/ for the controls that need more than a sentence.
 */
export default function FieldReference() {
  return (
    <>
      <H1>Field reference</H1>

      <P>
        Every entry in <Code>block.fields.json</Code> declares one Inspector
        control. The <Code>type</Code> picks the React component shown in
        the editor. The <Code>attributeKey</Code> picks the WP attribute
        name your React component receives.
      </P>

      <Callout type="tip">
        The single source of truth for any control&rsquo;s saved-value shape
        is its source file in{' '}
        <Code>gcb-lite/src/controls/&lt;type&gt;.js</Code> — read it if you&rsquo;re
        unsure. The summaries below are a starting point, not a contract.
      </Callout>

      <H2 id="text">Text inputs</H2>

      <H3 id="text-control"><Code>text</Code></H3>
      <P>Single-line input. Stores a <Code>string</Code>.</P>

      <H3 id="textarea-control"><Code>textarea</Code></H3>
      <P>Multi-line input. Stores a <Code>string</Code>.</P>

      <H3 id="number-control"><Code>number</Code></H3>
      <P>
        Numeric input with optional <Code>validation: {`{ min, max }`}</Code>.
        Stores a <Code>number</Code>.
      </P>

      <H3 id="code-control"><Code>code</Code></H3>
      <P>Monospace textarea (no syntax highlighting). Stores a <Code>string</Code>.</P>

      <H3 id="wysiwyg-control"><Code>wysiwyg</Code></H3>
      <P>
        Classic TinyMCE editor. Stores an HTML <Code>string</Code>. Useful
        when the author needs rich inline formatting but you don&rsquo;t
        want the full block editor.
      </P>

      <H2 id="choice">Choice</H2>

      <H3 id="toggle-control"><Code>toggle</Code></H3>
      <P>
        On/off switch. Stores a <Code>boolean</Code>. See{' '}
        <Link href="/docs/fields/toggle">toggle / toggle-group</Link>.
      </P>

      <H3 id="toggle-group-control"><Code>toggle-group</Code></H3>
      <P>
        Single-select segmented control. Stores the chosen{' '}
        <Code>value</Code> as a <Code>string</Code>.
      </P>

      <H3 id="checkbox-group-control"><Code>checkbox-group</Code></H3>
      <P>
        Multi-select checkboxes (alias: <Code>button-group</Code>). Stores
        an array of selected <Code>value</Code>s.
      </P>

      <H3 id="select-control"><Code>select</Code></H3>
      <P>Native &lt;select&gt; dropdown. Stores the chosen value.</P>

      <H3 id="radio-control"><Code>radio</Code></H3>
      <P>Radio-button list. Stores the chosen value.</P>

      <H2 id="link">Links + relationships</H2>

      <H3 id="url-control"><Code>url</Code></H3>
      <P>
        URL picker with text label and new-tab toggle. Stores{' '}
        <Code>{`{ url, text, opensInNewTab }`}</Code>. See{' '}
        <Link href="/docs/fields/url">url</Link>.
      </P>

      <H3 id="post-object-control"><Code>post-object</Code></H3>
      <P>
        Pick one or many posts/CPTs. Stores an array of post IDs (or a
        single ID). See <Link href="/docs/fields/post-object">post-object</Link>.
      </P>

      <H3 id="page-link-control"><Code>page-link</Code></H3>
      <P>Pick a single internal page. Stores a post ID.</P>

      <H3 id="taxonomy-control"><Code>taxonomy</Code></H3>
      <P>Pick taxonomy terms. Stores term IDs.</P>

      <H3 id="user-control"><Code>user</Code></H3>
      <P>Pick a user. Stores a user ID.</P>

      <H2 id="media">Media</H2>

      <H3 id="image-control"><Code>image</Code></H3>
      <P>
        Media library image picker with focal point + size options. Stores{' '}
        <Code>{`{ url, alt, width, height, focalPoint, size, ... }`}</Code>.{' '}
        See <Link href="/docs/fields/image">image</Link>.
      </P>

      <H3 id="gallery-control"><Code>gallery</Code></H3>
      <P>Multi-image picker. Stores an array of image objects.</P>

      <H3 id="file-control"><Code>file</Code></H3>
      <P>Generic file picker. Stores <Code>{`{ url, filename, mime, size }`}</Code>.</P>

      <H3 id="oembed-control"><Code>oembed</Code></H3>
      <P>YouTube / Vimeo / Twitter etc. URL. Stores the URL string.</P>

      <H2 id="typography-design">Typography &amp; design</H2>

      <H3 id="heading-control"><Code>heading-level</Code></H3>
      <P>
        Compound control: heading text + level (h1..h6). Stores{' '}
        <Code>{`{ text, level }`}</Code>. See{' '}
        <Link href="/docs/fields/heading">heading-level</Link>.
      </P>

      <H3 id="color-control"><Code>color</Code></H3>
      <P>Color picker. Stores a hex/rgb <Code>string</Code>.</P>

      <H3 id="range-control"><Code>range</Code></H3>
      <P>Slider. Stores a <Code>number</Code>.</P>

      <H3 id="size-control"><Code>size</Code></H3>
      <P>
        CSS length input (number + unit). Stores{' '}
        <Code>{`{ value, unit }`}</Code>.
      </P>

      <H3 id="spacing-control"><Code>spacing</Code></H3>
      <P>
        Padding/margin grid. Stores per-side{' '}
        <Code>{`{ top, right, bottom, left }`}</Code> values.
      </P>

      <H3 id="icon-control"><Code>icon</Code></H3>
      <P>Dashicon / icon picker. Stores the icon slug.</P>

      <H2 id="layout">Layout</H2>

      <H3 id="group-control"><Code>group</Code></H3>
      <P>
        Inspector panel wrapper. No <Code>attributeKey</Code>; it groups
        other controls. Children point at this group via{' '}
        <Code>parentPanelId</Code>.
      </P>

      <Pre lang="json">{`{ "id": "panel_seo", "type": "group", "label": "SEO" },
{ "id": "ctrl_meta_title",
  "type": "text",
  "attributeKey": "meta_title",
  "label": "Meta title",
  "parentPanelId": "panel_seo" }`}</Pre>

      <H2 id="conditional">Conditional logic</H2>

      <P>
        Any control can declare a <Code>conditionalLogic</Code> block to
        only render when other fields match a rule:
      </P>

      <Pre lang="json">{`"conditionalLogic": {
  "enabled": true,
  "rules": [
    { "field": "source", "operator": "==", "value": "manual" }
  ]
}`}</Pre>

      <H2 id="validation">Validation</H2>

      <P>
        Every control accepts a <Code>validation</Code> block. Common keys:
      </P>

      <ul style={{ lineHeight: 1.8 }}>
        <li><Code>required: true</Code> — blocks save with a notice</li>
        <li><Code>minLength / maxLength</Code> — for text-y controls</li>
        <li><Code>min / max</Code> — for numeric controls</li>
        <li><Code>pattern: &quot;^[a-z]+$&quot;</Code> — regex (validated server-side too)</li>
      </ul>
    </>
  );
}
