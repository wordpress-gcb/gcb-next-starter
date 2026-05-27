import Link from 'next/link';
import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';

export const metadata = { title: 'GCB Lite — Field reference' };

/**
 * Field-reference page. One entry per control type with: stored shape,
 * config options, an example block.fields.json snippet, and any gotchas.
 *
 * Single source of truth for stored-value shapes remains the control
 * source in gcb-lite/src/controls/<type>.js — these docs mirror what's
 * in code at the time of writing. If anything diverges, the code wins.
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

      <P>
        Every control accepts the common keys <Code>id</Code>,{' '}
        <Code>attributeKey</Code>, <Code>label</Code>, <Code>helpText</Code>,{' '}
        <Code>default</Code>, <Code>parentPanelId</Code>,{' '}
        <Code>conditionalLogic</Code>, <Code>validation</Code>. The
        sections below list only the control-specific options.
      </P>

      <Callout type="tip">
        Want to see a control in action? Every shipping site has the{' '}
        <Link href="/all-fields">All fields</Link> page seeded with one of
        every control type — it&rsquo;s the same code the Inspector renders,
        with sample data wired up.
      </Callout>

      {/* ====================================================== */}
      <H2 id="text">Text</H2>

      <H3 id="text-control"><Code>text</Code></H3>
      <P>Single-line text input.</P>
      <P><strong>Stores:</strong> <Code>string</Code></P>
      <P><strong>Options:</strong> <Code>placeholder</Code></P>
      <Pre lang="json">{`{ "type": "text", "attributeKey": "eyebrow", "label": "Eyebrow",
  "placeholder": "e.g. Now in beta" }`}</Pre>

      <H3 id="textarea-control"><Code>textarea</Code></H3>
      <P>Multi-line plain text. Four rows by default.</P>
      <P><strong>Stores:</strong> <Code>string</Code></P>
      <P><strong>Options:</strong> <Code>placeholder</Code></P>

      <H3 id="email-control"><Code>email</Code></H3>
      <P>
        Text input typed as <Code>email</Code> (gets the email
        keyboard on mobile + browser-level validation).
      </P>
      <P><strong>Stores:</strong> <Code>string</Code></P>
      <P><strong>Options:</strong> <Code>placeholder</Code> (defaults to{' '}
        <Code>name@example.com</Code>)</P>

      <H3 id="code-control"><Code>code</Code></H3>
      <P>Monospace textarea for raw HTML / CSS / shortcode snippets.</P>
      <P><strong>Stores:</strong> <Code>string</Code></P>
      <P><strong>Options:</strong> <Code>placeholder</Code>,{' '}
        <Code>rows</Code> (default 8)</P>

      <H3 id="richtext-control"><Code>richtext</Code></H3>
      <P>
        Tiptap-backed rich text editor (ProseMirror under the hood).
        Bold, italic, strikethrough, inline code, headings, lists,
        blockquote, links, images.
      </P>
      <P><strong>Stores:</strong> <Code>string</Code> (HTML)</P>
      <P><strong>Options:</strong></P>
      <ul style={{ lineHeight: 1.8 }}>
        <li><Code>headingLevels</Code> — array of allowed levels, default <Code>[2, 3, 4]</Code></li>
        <li><Code>allowImages</Code> — hide the insert-image button when false</li>
        <li><Code>display</Code> — <Code>'inline' | 'popover' | 'modal'</Code>. Defaults: <Code>popover</Code> in the block Inspector sidebar (so the canvas stays visible for live updates), <Code>inline</Code> on wider surfaces (meta-box, options page, etc.).</li>
      </ul>
      <Pre lang="json">{`{ "type": "richtext", "attributeKey": "body", "label": "Body",
  "headingLevels": [2, 3],
  "allowImages": false }`}</Pre>

      <H3 id="wysiwyg-control"><Code>wysiwyg</Code></H3>
      <P>
        Alias for <Code>richtext</Code>. Originally TinyMCE-backed;
        now both control types render the same Tiptap component. Use{' '}
        <Code>richtext</Code> for new fields. <Code>wysiwyg</Code> stays
        for back-compat with existing schemas.
      </P>

      <H3 id="oembed-control"><Code>oembed</Code></H3>
      <P>
        URL input that renders a WordPress oEmbed preview underneath
        (YouTube, Vimeo, Twitter, etc.).
      </P>
      <P><strong>Stores:</strong> <Code>string</Code> (URL)</P>

      {/* ====================================================== */}
      <H2 id="choice">Choice</H2>

      <H3 id="toggle-control"><Code>toggle</Code></H3>
      <P>Single on/off switch.</P>
      <P><strong>Stores:</strong> <Code>boolean</Code></P>

      <H3 id="checkbox-control"><Code>checkbox</Code></H3>
      <P>Single boolean. Same data as <Code>toggle</Code>; checkbox UI instead of a switch.</P>
      <P><strong>Stores:</strong> <Code>boolean</Code></P>

      <H3 id="toggle-group-control"><Code>toggle-group</Code></H3>
      <P>Segmented radio control. Single selection, button-style row.</P>
      <P><strong>Stores:</strong> <Code>string</Code></P>
      <P><strong>Options:</strong> <Code>options</Code>,{' '}
        <Code>isBlock</Code> (full-width row, default true)</P>
      <Pre lang="json">{`{ "type": "toggle-group", "attributeKey": "align", "label": "Align",
  "options": [
    { "label": "L", "value": "left" },
    { "label": "C", "value": "center" },
    { "label": "R", "value": "right" }
  ] }`}</Pre>

      <H3 id="button-group-control"><Code>button-group</Code></H3>
      <P>
        Multi-select row of toggle buttons. Same data shape as
        checkbox-group, just a different UI affordance.
      </P>
      <P><strong>Stores:</strong> <Code>string[]</Code></P>
      <P><strong>Options:</strong> <Code>options</Code></P>

      <H3 id="checkbox-group-control"><Code>checkbox-group</Code></H3>
      <P>Vertical column of checkboxes; multi-select.</P>
      <P><strong>Stores:</strong> <Code>string[]</Code></P>
      <P><strong>Options:</strong> <Code>options</Code></P>

      <H3 id="select-control"><Code>select</Code></H3>
      <P>Single-select dropdown.</P>
      <P><strong>Stores:</strong> <Code>string</Code> (or token object when{' '}
        <Code>tokenGroup</Code> is set — see Theme tokens below)</P>
      <P><strong>Options:</strong> <Code>options</Code>,{' '}
        <Code>placeholder</Code>, <Code>tokenGroup</Code>,{' '}
        <Code>tokenKeys</Code>, <Code>defaultOptionKey</Code></P>

      <H3 id="radio-control"><Code>radio</Code></H3>
      <P>Radio button group; single-select.</P>
      <P><strong>Stores:</strong> <Code>string</Code></P>
      <P><strong>Options:</strong> <Code>options</Code></P>

      {/* ====================================================== */}
      <H2 id="numeric">Numeric</H2>

      <H3 id="number-control"><Code>number</Code></H3>
      <P>Numeric input.</P>
      <P><strong>Stores:</strong> <Code>number</Code> (0 when emptied)</P>
      <P><strong>Options:</strong> <Code>min</Code>, <Code>max</Code>,{' '}
        <Code>step</Code> (default 1), <Code>placeholder</Code></P>

      <H3 id="range-control"><Code>range</Code></H3>
      <P>Slider, optionally bound to a theme.json token group.</P>
      <P><strong>Stores:</strong> <Code>number</Code> (or token-object key when{' '}
        <Code>tokenGroup</Code> is set)</P>
      <P><strong>Options:</strong> <Code>min</Code> (default 0),{' '}
        <Code>max</Code> (default 100), <Code>step</Code> (default 1),{' '}
        <Code>tokenGroup</Code>, <Code>defaultOptionKey</Code></P>

      {/* ====================================================== */}
      <H2 id="date-color">Date &amp; color</H2>

      <H3 id="date-control"><Code>date</Code></H3>
      <P>WordPress <Code>DatePicker</Code> in a popover.</P>
      <P><strong>Stores:</strong> <Code>string</Code> (ISO date, e.g.{' '}
        <Code>2026-12-31</Code>)</P>

      <H3 id="datetime-control"><Code>datetime</Code></H3>
      <P>Calendar + time-of-day picker.</P>
      <P><strong>Stores:</strong> <Code>string</Code> (ISO datetime, e.g.{' '}
        <Code>2026-12-31T18:00:00</Code>)</P>

      <H3 id="color-control"><Code>color</Code></H3>
      <P>
        Color or gradient picker, sourcing palettes from{' '}
        <Code>theme.json</Code>.
      </P>
      <P><strong>Stores:</strong> <Code>string</Code> — either a CSS color
        (<Code>#5956E9</Code>, <Code>rgb(…)</Code>) or a full CSS gradient
        declaration. Color and gradient share the same field; picking one
        clears the other.</P>
      <P><strong>Options:</strong></P>
      <ul style={{ lineHeight: 1.8 }}>
        <li><Code>showGradients</Code> — hide the gradient tab (default true)</li>
        <li><Code>enableAlpha</Code> — allow rgba (default true)</li>
        <li><Code>disableCustomColors</Code> — palette only, no custom picker</li>
        <li><Code>disableCustomGradients</Code> — preset gradients only</li>
      </ul>

      {/* ====================================================== */}
      <H2 id="media">Media</H2>

      <H3 id="image-control"><Code>image</Code></H3>
      <P>
        Image picker with focal-point + size + custom-width + repeat +
        fixed-background controls in a popover. Built on{' '}
        <Code>wp.media</Code>.
      </P>
      <P><strong>Stores:</strong></P>
      <Pre lang="json">{`{
  "id": 42,
  "url": "https://.../image.jpg",
  "alt": "...",
  "title": "...",
  "filename": "image.jpg",
  "width": 800,
  "height": 500,
  "filesize": 123456,
  "focalPoint": { "x": 0.5, "y": 0.5 },
  "size": "cover" | "contain" | "auto",
  "repeat": true,
  "isFixed": false,
  "customWidth": ""
}`}</Pre>
      <P><strong>Options:</strong></P>
      <ul style={{ lineHeight: 1.8 }}>
        <li><Code>enableFocalPoint</Code> (default true)</li>
        <li><Code>enableSizeOptions</Code> (default true)</li>
        <li><Code>enableRepeatOptions</Code> (default true)</li>
        <li><Code>enableFixedBackground</Code> (default true)</li>
      </ul>
      <Callout type="tip">
        Don&rsquo;t cherry-pick just <Code>url</Code> on the frontend —
        most of these properties exist to let authors lay out a hero
        properly. <Code>focalPoint</Code> maps to{' '}
        <Code>object-position</Code> / <Code>background-position</Code>,{' '}
        <Code>size</Code> maps to <Code>object-fit</Code> /{' '}
        <Code>background-size</Code>.
      </Callout>

      <H3 id="gallery-control"><Code>gallery</Code></H3>
      <P>Multiple-image picker. Drag to reorder rows.</P>
      <P><strong>Stores:</strong> <Code>Array</Code> of image objects
        (same shape as <Code>image</Code> above)</P>

      <H3 id="file-control"><Code>file</Code></H3>
      <P>Non-image attachment picker.</P>
      <P><strong>Stores:</strong>{' '}
        <Code>{`{ id, url, filename, title }`}</Code></P>
      <P><strong>Options:</strong> <Code>allowedTypes</Code> (default{' '}
        <Code>['application', 'text', 'image', 'video', 'audio']</Code>)</P>

      <H3 id="icon-control"><Code>icon</Code></H3>
      <P>
        Visual picker over the WordPress 7.0+ icon registry. Each icon
        is an SVG fetched from <Code>/wp/v2/icons</Code> on first open;
        render.php resolves the name to SVG server-side via{' '}
        <Code>WP_Icons_Registry</Code> so post_content stays clean.
      </P>
      <P><strong>Stores:</strong>{' '}
        <Code>{`{ source: 'wp', name: 'core/star-filled' }`}</Code></P>
      <P><strong>Options:</strong></P>
      <ul style={{ lineHeight: 1.8 }}>
        <li>
          <Code>namespace</Code> — restrict to icons whose name starts
          with <Code>{`{namespace}/`}</Code>. Useful once themes register
          their own sets via WP 7.1&rsquo;s <Code>register_block_icon()</Code>.
        </li>
        <li>
          <Code>filter</Code> — explicit allow-list of full icon names.
          Takes precedence over <Code>namespace</Code>.
        </li>
      </ul>
      <Pre lang="json">{`{ "type": "icon", "attributeKey": "social", "label": "Social icon",
  "namespace": "icomoon" }

{ "type": "icon", "attributeKey": "cta_icon",
  "filter": ["core/arrow-right", "core/external", "core/download"] }`}</Pre>
      <Callout type="warn">
        Requires WP 7.0+. On older WordPress the picker surfaces a clear
        &ldquo;requires WordPress 7.0&rdquo; message instead of trying to
        fall back to dashicons.
      </Callout>

      <H3 id="google-map-control"><Code>google-map</Code></H3>
      <P>Address autocomplete + draggable pin + zoom slider.</P>
      <P><strong>Stores:</strong>{' '}
        <Code>{`{ address, lat, lng, zoom }`}</Code></P>
      <P>
        Requires a Google Maps API key set in{' '}
        <strong>Settings → GCB Lite → Google Maps API key</strong>.
        Without a key, the field degrades to a plain address text input.
      </P>

      {/* ====================================================== */}
      <H2 id="link">Links &amp; relationships</H2>

      <H3 id="url-control"><Code>url</Code></H3>
      <P>
        Link picker. In the block Inspector sidebar this uses{' '}
        <Code>@wordpress/block-editor</Code>&rsquo;s <Code>LinkControl</Code>{' '}
        (the same popover used by core blocks). In meta-box / options
        surfaces it falls back to three stacked inputs.
      </P>
      <P><strong>Stores:</strong>{' '}
        <Code>{`{ url, text, opensInNewTab }`}</Code></P>

      <H3 id="post-object-control"><Code>post-object</Code></H3>
      <P>
        Searchable post picker with optional post-type + taxonomy
        filters. Drag-reorderable in multi-select mode.
      </P>
      <P><strong>Stores:</strong> <Code>number | number[]</Code> (post IDs)
        or <Code>object | object[]</Code> (full REST post objects), depending
        on <Code>returnFormat</Code></P>
      <P><strong>Options:</strong></P>
      <ul style={{ lineHeight: 1.8 }}>
        <li><Code>multiple</Code> — allow multi-select</li>
        <li><Code>returnFormat</Code> — <Code>'id'</Code> (default) or <Code>'object'</Code></li>
        <li><Code>postType</Code> — string or array; restricts the searchable set</li>
        <li><Code>postStatus</Code> — string or array (e.g. <Code>'publish'</Code>)</li>
        <li><Code>enablePostTypeFilter</Code> — dropdown in the picker</li>
        <li><Code>enableTaxonomyFilter</Code> — dropdown(s) in the picker</li>
        <li><Code>filterTaxonomies</Code> — taxonomies to expose as filters</li>
      </ul>

      <H3 id="page-link-control"><Code>page-link</Code></H3>
      <P>
        Internal-only link picker. Currently delegates to{' '}
        <Code>url</Code>; richer page-picker UI in the roadmap.
      </P>

      <H3 id="taxonomy-control"><Code>taxonomy</Code></H3>
      <P>Term picker for a given taxonomy.</P>
      <P><strong>Stores:</strong> <Code>number | number[]</Code> (term IDs)
        or term objects, depending on <Code>returnFormat</Code></P>
      <P><strong>Options:</strong></P>
      <ul style={{ lineHeight: 1.8 }}>
        <li><Code>taxonomy</Code> — slug, default <Code>category</Code></li>
        <li><Code>multiple</Code> — default true</li>
        <li><Code>returnFormat</Code> — <Code>'id'</Code> or <Code>'object'</Code></li>
        <li><Code>allowCreateTerms</Code> — surface a &ldquo;new term&rdquo; input in the picker</li>
      </ul>

      <H3 id="user-control"><Code>user</Code></H3>
      <P>User picker; searches via <Code>/wp/v2/users</Code>.</P>
      <P><strong>Stores:</strong> <Code>number | number[]</Code> (user IDs)
        or user objects</P>
      <P><strong>Options:</strong> <Code>multiple</Code>,{' '}
        <Code>returnFormat</Code></P>

      <H3 id="relationship-control"><Code>relationship</Code></H3>
      <P>
        Multi-select post picker — currently a thin wrapper over{' '}
        <Code>post-object</Code> with <Code>multiple: true</Code> forced.
        Reserved name for a future richer relationship UI.
      </P>

      {/* ====================================================== */}
      <H2 id="dimension">Typography &amp; dimension</H2>

      <H3 id="heading-level-control"><Code>heading-level</Code></H3>
      <P>
        Compound input: heading text plus a level dropdown (H1–H6, P,
        DIV, SPAN). Mirrors WP&rsquo;s <Code>UnitControl</Code> shape — text
        input on the left, level selector inset on the right.
      </P>
      <P><strong>Stores:</strong>{' '}
        <Code>{`{ text, level }`}</Code></P>
      <P><strong>Options:</strong> <Code>levels</Code> — array of allowed
        tags, default <Code>['h1','h2','h3','h4','h5','h6','p','div','span']</Code></P>
      <Callout type="tip">
        Picking <Code>div</Code> or <Code>span</Code> shows an
        accessibility warning under the input — non-headings are skipped
        by screen-reader heading navigation.
      </Callout>

      <H3 id="size-control"><Code>size</Code></H3>
      <P>CSS-length input with unit picker (px, em, rem, %, vh, vw).</P>
      <P><strong>Stores:</strong> <Code>string</Code> (e.g. <Code>16px</Code>, <Code>1.5rem</Code>)</P>

      <H3 id="spacing-control"><Code>spacing</Code></H3>
      <P>
        Preset picker (none/small/medium/large) plus an opt-in custom
        CSS value when none of the presets fit.
      </P>
      <P><strong>Stores:</strong> <Code>string</Code> — either a preset key
        (<Code>small</Code>) or a CSS length (<Code>2rem</Code>)</P>
      <P><strong>Options:</strong> <Code>presets</Code> — override the
        default list</P>

      {/* ====================================================== */}
      <H2 id="composite">Composite</H2>

      <H3 id="repeater-control"><Code>repeater</Code></H3>
      <P>
        Inspector-side repeater — an array of rows, each row a
        compound of any sub-control types. Drag-reorderable; rows
        collapse / expand.
      </P>
      <P><strong>Stores:</strong> array of row objects, each with a stable{' '}
        <Code>_id</Code> plus the sub-field keys</P>
      <P><strong>Options:</strong></P>
      <ul style={{ lineHeight: 1.8 }}>
        <li><Code>fields</Code> — sub-control array (any control types except <Code>repeater</Code> itself)</li>
        <li><Code>min</Code> — minimum rows (default 0)</li>
        <li><Code>max</Code> — maximum rows (null/0 = unlimited)</li>
        <li><Code>addButtonLabel</Code> — text on the add-row button</li>
        <li><Code>collapsedTitle</Code> — sub-field name to show as the row header when collapsed</li>
      </ul>
      <Pre lang="json">{`{ "type": "repeater", "attributeKey": "links", "label": "Social links",
  "collapsedTitle": "label",
  "addButtonLabel": "Add link",
  "fields": [
    { "attributeKey": "label", "type": "text", "label": "Label" },
    { "attributeKey": "url",   "type": "url",  "label": "URL" }
  ] }`}</Pre>
      <Callout type="warn">
        Distinct from <Code>gcb/repeater</Code>, which is an{' '}
        <em>InnerBlocks</em>-based canvas pattern for nesting other
        blocks. The <Code>repeater</Code> control here lives in the
        Inspector and stores typed values.
      </Callout>

      {/* ====================================================== */}
      <H2 id="display">Display-only</H2>

      <H3 id="message-control"><Code>message</Code></H3>
      <P>
        Informational note in the Inspector. No input, no stored value —
        useful for guidance, deprecation hints, or links to docs.
      </P>
      <P><strong>Stores:</strong> nothing</P>
      <P><strong>Options:</strong> <Code>message</Code> (the body) — falls
        back to <Code>helpText</Code> if omitted</P>

      {/* ====================================================== */}
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

      {/* ====================================================== */}
      <H2 id="affordances">Cross-cutting affordances</H2>

      <H3 id="click-to-focus">Click-to-focus from preview</H3>
      <P>
        Inside <Code>render.php</Code>, tag any element with the focus
        attribute so a click on it in the editor preview opens the
        matching Inspector field with a blue ring:
      </P>
      <Pre lang="php">{`<h1 class="title" <?php gcb_focus('heading'); ?>>
  <?php echo esc_html($props['heading']['text']); ?>
</h1>`}</Pre>
      <P>
        The attribute name (<Code>data-focus-field</Code> by default)
        can be remapped via the <Code>gcblite_focus_field_attribute</Code>{' '}
        filter for sites that collide with another plugin.
      </P>

      <H3 id="conditional">Conditional logic</H3>
      <P>
        Any control can declare a <Code>conditionalLogic</Code> block to
        only render when other fields match a rule:
      </P>
      <Pre lang="json">{`"conditionalLogic": {
  "enabled": true,
  "operator": "and",
  "rules": [
    { "field": "source", "operator": "==", "value": "manual" }
  ]
}`}</Pre>

      <H3 id="validation">Validation</H3>
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
