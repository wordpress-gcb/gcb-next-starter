import { H1, H2, P, Code, Pre, Callout } from '@/components/DocsArticle';

export const metadata = { title: 'GCB Lite — repeater' };

export default function RepeaterDoc() {
  return (
    <>
      <H1>repeater</H1>

      <Callout type="warn">
        <Code>type: &quot;repeater&quot;</Code> looks like a control but isn&rsquo;t
        rendered as an Inspector field. It exists so a block can declare an
        array-shaped attribute, but the editor never shows a &ldquo;repeater&rdquo;
        widget in the sidebar.
      </Callout>

      <P>
        Repeater behaviour comes from a marker tag your React component
        emits, not from an Inspector control. When the editor receives the
        marker in the SSR HTML, gcb-lite&rsquo;s preview parser swaps it
        for a real WP <Code>InnerBlocks</Code> UI — Add button,
        drag-to-reorder, child-block scoping.
      </P>

      <H2 id="marker">The marker tag</H2>

      <P>Emit this from your React component:</P>

      <Pre lang="jsx">{`export default function Accordion({ attributes, innerBlocks = [] }) {
  return (
    <div className="accordion">
      {/* On the public site: render the inner blocks normally. */}
      {innerBlocks.length > 0
        ? innerBlocks.map((child) => /* dispatch via your block registry */ null)
        : (
          /* Marker — only meaningful in the editor preview. */
          /* eslint-disable-next-line react/no-unknown-property */
          <repeater
            allowedblocks={JSON.stringify(['gcb/accordion-item'])}
            addbuttonlabel="Add item"
          />
        )}
    </div>
  );
}`}</Pre>

      <H2 id="attributes">Attributes</H2>

      <ul>
        <li>
          <Code>allowedblocks</Code> — JSON-stringified array of allowed
          child block names.
        </li>
        <li>
          <Code>addbuttonlabel</Code> — label for the Add button.
        </li>
        <li>
          <Code>template</Code> (optional) — JSON of initial child blocks
          to seed the repeater with.
        </li>
      </ul>

      <H2 id="when">When to actually use repeater-type</H2>

      <P>
        Only when you want a block-level array attribute AS WELL as the
        marker. In most cases the marker alone is what you want — the
        child blocks ARE the data. Don&rsquo;t add a{' '}
        <Code>type: &quot;repeater&quot;</Code> entry to your{' '}
        <Code>block.fields.json</Code> just because you have a repeater
        marker in your component.
      </P>

      <Callout type="tip">
        Look at the <Code>accordion-test</Code> block in the demo theme for
        the working pattern: marker in the component, no repeater entry in
        the field config, child block has its own{' '}
        <Code>block.fields.json</Code>.
      </Callout>
    </>
  );
}
