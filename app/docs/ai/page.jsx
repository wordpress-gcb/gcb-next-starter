import Link from 'next/link';
import { H1, H2, H3, P, Code, Pre, Callout } from '@/components/DocsArticle';

export const metadata = { title: 'GCB Lite — AI workflows' };

/**
 * AI workflows doc. Explains what gcb-lite registers with WP 7.0's
 * Abilities API and how to drive it from an LLM / agent / MCP client.
 *
 * Honest framing throughout — WP core ships the typed function bus
 * (Abilities API). The UX layer (an editor chat sidebar, a CLI agent,
 * an MCP server) is plugin territory. We register abilities; any
 * compliant client can drive them.
 */
export default function AIWorkflows() {
  return (
    <>
      <H1>AI workflows</H1>

      <P>
        gcb-lite plugs into WordPress 7.0&rsquo;s{' '}
        <Link href="https://make.wordpress.org/core/" style={{ color: 'inherit' }}>
          Abilities API
        </Link>
        . That&rsquo;s the typed, schema-validated function bus WordPress
        shipped specifically so AI clients can drive a site without
        screen-scraping wp-admin.
      </P>

      <Callout type="note">
        WP core ships the bus (<Code>/wp-json/wp-abilities/v1/&hellip;</Code>),
        not a chat UI. The wp-admin chat sidebar you might be picturing is
        plugin territory — gcb-lite registers the typed actions; any AI
        client (Claude Desktop, a custom agent, a WP chat plugin like AI
        Engine) can discover and call them.
      </Callout>

      <H2 id="abilities">Abilities we register</H2>

      <P>
        Both live under the <Code>gcblite</Code> category. The Abilities
        API exposes them at{' '}
        <Code>POST /wp-json/wp-abilities/v1/abilities/&#123;name&#125;/run</Code>{' '}
        with the input wrapped under an <Code>input</Code> key.
      </P>

      <H3 id="list-blocks"><Code>gcblite/list-blocks</Code></H3>

      <P>
        Returns every registered <Code>gcb/*</Code> block on the site,
        with each block&rsquo;s attribute schema and defaults. Use this
        first to discover what&rsquo;s available before composing or
        rendering anything.
      </P>

      <Pre lang="bash">{`curl -X POST https://your-site.com/wp-json/wp-abilities/v1/abilities/gcblite/list-blocks/run \\
  -H "Content-Type: application/json" \\
  -d '{ "input": {} }'`}</Pre>

      <P>Response:</P>

      <Pre lang="json">{`{
  "blocks": {
    "gcb/saas-banner": {
      "attributes": {
        "eyebrow":  { "type": "string", "default": "" },
        "heading":  { "type": "string", "default": "Built with GCB" },
        "cta_url":  { "type": "object", "default": { "url": "", "text": "" } },
        "...": "..."
      }
    },
    "gcb/saas-projects":     { "attributes": { /* ... */ } },
    "gcb/field-showcase":    { "attributes": {} }
  }
}`}</Pre>

      <P>
        Permission: <Code>__return_true</Code> — the schema is the same
        thing the editor already exposes to logged-in authors and isn&rsquo;t
        sensitive.
      </P>

      <H3 id="render-block"><Code>gcblite/render-block</Code></H3>

      <P>
        Renders a single block to HTML server-side. Either runs the
        block&rsquo;s <Code>render.php</Code> (if one exists) or fetches
        the React component-server&rsquo;s SSR output. Same code path as
        the editor preview. Returns the rendered HTML plus any wrapper
        attributes the renderer asked for.
      </P>

      <Pre lang="bash">{`curl -X POST https://your-site.com/wp-json/wp-abilities/v1/abilities/gcblite/render-block/run \\
  -H "Content-Type: application/json" \\
  -d '{ "input": {
    "blockName": "gcb/saas-banner",
    "attributes": {
      "eyebrow": "Beta",
      "heading": "Typed Gutenberg fields from a JSON file"
    }
  }}'`}</Pre>

      <P>
        Permission: <Code>edit_posts</Code> — render performs an outbound
        HTTP call to the component server and writes a transient cache,
        so it&rsquo;s gated against anonymous abuse.
      </P>

      <H2 id="loop">The agent loop</H2>

      <P>
        A useful pattern an agent can run end-to-end:
      </P>

      <ol style={{ paddingLeft: 24, color: 'var(--color-body)', lineHeight: 1.7 }}>
        <li>
          <strong>Discover</strong> — call <Code>gcblite/list-blocks</Code>.
          Now the agent knows the block menu and each block&rsquo;s typed
          shape.
        </li>
        <li>
          <strong>Compose</strong> — pick a block + attribute values that
          fit the user&rsquo;s ask. The schema constrains what the LLM
          can output; invalid attribute shapes get caught by the input
          validator on the call below.
        </li>
        <li>
          <strong>Preview</strong> — call <Code>gcblite/render-block</Code>{' '}
          to get the HTML back without writing to the database. Show it
          to the user, ask &ldquo;does this look right?&rdquo;
        </li>
        <li>
          <strong>Persist</strong> — once approved, the agent uses{' '}
          <Code>wp/v2/&lt;post-type&gt;</Code> to write the composed block
          markup into a post or page. This step is plain WP REST, no
          ability needed.
        </li>
      </ol>

      <P>
        The Abilities API gives you a stop-checking-types-and-just-call-it
        primitive on top of WP&rsquo;s usual REST endpoints. Everything
        an LLM sends is validated against the registered{' '}
        <Code>input_schema</Code>; everything it gets back conforms to{' '}
        <Code>output_schema</Code>. No hallucination-driven 500s.
      </P>

      <H2 id="schemas-as-prompt">Schemas as prompt context</H2>

      <P>
        Every <Code>block.fields.json</Code> in your theme is plain JSON
        on disk. That&rsquo;s deliberate — it means an LLM with file
        access (Cursor, Claude with the filesystem tool, an MCP client
        with file-tools) can read your block schemas as part of its
        prompt without needing to call an API.
      </P>

      <P>
        Pattern: paste a <Code>block.fields.json</Code> into the model
        and ask it to write the matching React component. The schema
        defines exactly what props it&rsquo;ll receive (control{' '}
        <Code>attributeKey</Code>s become prop names; stored value
        shapes documented in <Code>schemas/controls/&#123;type&#125;.json</Code>{' '}
        tell it what each prop looks like). Short, structured prompt
        in, working component out.
      </P>

      <H2 id="mcp">MCP clients</H2>

      <P>
        Model Context Protocol clients (Claude Desktop, etc.) discover
        WordPress abilities via a compatible MCP adapter plugin. We
        don&rsquo;t ship one — there are several to choose from in the
        plugin ecosystem already, and they all read the same{' '}
        <Code>/wp-abilities/v1</Code> registry. Install one, point the
        client at your site, and our two abilities appear alongside
        whatever else is registered.
      </P>

      <Callout type="warn">
        <strong>Auth:</strong> <Code>gcblite/render-block</Code> requires{' '}
        <Code>edit_posts</Code>. MCP clients calling it need application
        passwords (or equivalent) attached. The list endpoint is
        unauthenticated; the run endpoint isn&rsquo;t.
      </Callout>

      <H2 id="adding-abilities">Registering your own abilities</H2>

      <P>
        Your theme or a companion plugin can register more abilities the
        same way — anything that operates on gcb-lite blocks (publish
        flow, content audit, bulk re-render, etc.) is a natural fit.
        Standard{' '}
        <Code>wp_register_ability()</Code> call inside the{' '}
        <Code>wp_abilities_api_init</Code> action.
      </P>

      <Pre lang="php">{`add_action('wp_abilities_api_init', function () {
    wp_register_ability('mytheme/publish-with-banner', [
        'label'        => 'Publish post with banner',
        'description'  => 'Compose a post + a gcb/saas-banner header in one go.',
        'category'     => 'gcblite',
        'input_schema' => [
            'type'       => 'object',
            'properties' => [
                'title'   => [ 'type' => 'string' ],
                'eyebrow' => [ 'type' => 'string' ],
            ],
            'required'   => ['title'],
        ],
        'output_schema'    => [
            'type'       => 'object',
            'properties' => [ 'post_id' => [ 'type' => 'integer' ] ],
        ],
        'execute_callback' => function ($input) {
            // Compose markup, wp_insert_post, return id.
        },
        'permission_callback' => function () {
            return current_user_can('publish_posts');
        },
    ]);
});`}</Pre>

      <H2 id="positioning">Why this matters</H2>

      <P>
        WP shipped a typed function bus. That solves the &ldquo;how does
        an AI call WordPress&rdquo; problem at the protocol layer. The
        question becomes: <em>what do the typed functions actually
        operate on?</em> Core attributes are <Code>string</Code>,{' '}
        <Code>number</Code>, <Code>boolean</Code>, <Code>object</Code>,{' '}
        <Code>array</Code>. Useful, but blunt. An LLM generating an{' '}
        <Code>object</Code> isn&rsquo;t generating an image-with-focal-point
        or a repeater of testimonials.
      </P>

      <P>
        gcb-lite&rsquo;s typed-field layer is the structured schema an
        AI agent needs to compose against. The Abilities API is the
        callable surface. Together: an agent can list available blocks,
        compose one with real focal points and gallery items and
        post-object references, preview it, and ship it — without your
        site shipping an ounce of bespoke AI code.
      </P>
    </>
  );
}
