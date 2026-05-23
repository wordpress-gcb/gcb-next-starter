# gcb-next-starter

A Next.js starter that implements the [GCB Lite](https://github.com/wordpress-gcb/gutenberg-control-blocks-lite)
WordPress plugin's frontend contract. Use it as the seed of a real
production frontend, or as a reference to copy bits from into an existing
Next.js / Astro / Express project.

Three React-rendered blocks ship on `main` (accordion, text + image,
gallery) so you can see the full editor ↔ frontend round-trip working in
60 seconds. A richer block library lives on the [`examples` branch](https://github.com/wordpress-gcb/gcb-next-starter/tree/examples)
for fork-and-prune adoption.

**[Live demo](https://gcb-next-starter.vercel.app/)** — the `examples`
branch deployed as-is.

---

## What this is for

GCB Lite is a WordPress plugin that lets you render Gutenberg blocks as
React components — same component for the editor preview *and* the public
site. The plugin needs a frontend that speaks one HTTP route:

```
GET /wordpress/render/{slug}?attrs={url-encoded JSON}
  → <wp-block-wrapper data-block-name="{slug}" data-cache-timestamp="{ts}">
      ...component HTML...
    </wp-block-wrapper>
```

This repo implements that route. Plus a public-page renderer at
`app/[...slug]/page.jsx` that fetches WP pages via REST and renders them
through the same components.

In production, you don't run this as a separate service alongside the
public site — it *is* the public site, plus one extra route. Same Next.js
app, same Tailwind config, same deployment.

---

## Quick start (60 seconds)

You need a WordPress 6.x+ site with the [gcb-lite](https://github.com/wordpress-gcb/gutenberg-control-blocks-lite)
plugin installed.

```bash
# 1. Clone and run this starter
git clone https://github.com/wordpress-gcb/gcb-next-starter
cd gcb-next-starter
cp .env.local.example .env.local   # then edit: set NEXT_PUBLIC_WP_URL
npm install
npm run dev
# → http://localhost:3001

# 2. Tell WordPress where to find it
#    In your WP install's wp-config.php:
#       define('GCBLITE_COMPONENT_SERVER_URL', 'http://localhost:3001');

# 3. Seed a demo page in WP that uses all three reference blocks
cd /path/to/your/wp-install
bash /path/to/gcb-next-starter/sample-content/seed-demo-page.sh
```

Open the demo page in two places:

- `http://your-wp-site.test/wp-admin/edit.php?post_type=page` → click
  "GCB Lite Demo" → edit. Editor preview is the React component.
- `http://localhost:3001/gcb-lite-demo` → the public side. Same component,
  same markup.

If you'd rather build a page by hand: edit any page in wp-admin and from
the inserter add **Accordion (React test)**, **Text + Image (React test)**,
or **Gallery (React test)**.

---

## What's inside

| Path                                     | What it does                                                                                       |
|------------------------------------------|----------------------------------------------------------------------------------------------------|
| `app/wordpress/render/[block]/page.jsx`  | The render endpoint WordPress calls server-to-server for editor previews.                          |
| `app/wordpress/styles.css/route.js`      | Stable URL for the Tailwind bundle — the plugin enqueues this inside the editor canvas iframe.     |
| `app/wordpress/editor.css/route.js`      | Editor-only CSS overrides (force-open Radix accordions for static SSR, etc.).                      |
| `app/[...slug]/page.jsx`                 | Public-frontend page route. Fetches WP pages, parses blocks, dispatches to components.             |
| `components/`                            | React components for the three reference blocks plus the `BlockRenderer` dispatcher.               |
| `wordpress/config/WPBlockRegistry.js`    | Block-name → React component map. Add entries here when you build new blocks.                      |
| `wordpress/config/helpers.jsx`           | Renders a block inside the `<wp-block-wrapper>` envelope.                                          |
| `sample-content/seed-demo-page.sh`       | WP-CLI script that creates a demo page in your WP install for testing.                             |

---

## Adding a new block

Three steps. Two files in your theme, one component here.

1. **Theme:** create `themes/{your-theme}/blocks/{slug}/block.json` (standard
   WP block metadata) and optionally `block.fields.json` (Inspector
   controls). **Do not** add `render.php` — its presence routes the editor
   preview through PHP instead of through this Next.js app.

2. **Component:** add `components/{Name}.jsx`. Default export a function
   that takes `{ attributes, innerBlocks, innerHtml }`.

3. **Registry:** add the mapping in `wordpress/config/WPBlockRegistry.js`:
   ```js
   'gcb/{slug}': MyComponent
   ```

No plugin code changes, no build step on the WordPress side. The plugin
discovers the block from `block.json` automatically.

For the authoring contract in full — control types, Inspector grouping,
the `<repeater>` and `<innerblocks>` marker patterns, editor-SSR caveats —
see the plugin repo's [AGENTS.md](https://github.com/wordpress-gcb/gutenberg-control-blocks-lite/blob/main/AGENTS.md).

---

## Pointing at a different WordPress install

The plugin defaults to `http://localhost:3001` for the frontend it talks
to. Override with either:

```php
// wp-config.php
define('GCBLITE_COMPONENT_SERVER_URL', 'https://your-frontend.example.com');
```

…or via filter:

```php
add_filter('gcblite_frontend_url', fn() => 'https://your-frontend.example.com');
```

This frontend points at WordPress via an env var:

```bash
# .env.local
NEXT_PUBLIC_WP_URL=http://your-wp-site.test
```

---

## End-to-end smoke test (no WordPress required)

```bash
npm run dev

# in another terminal
curl -s 'http://localhost:3001/wordpress/render/text-image?attrs=%7B%22heading%22%3A%22Hello%22%7D' \
  | grep -oE '<wp-block-wrapper[^>]*>'
```

You should see `<wp-block-wrapper data-block-name="text-image" ...>`. If
you do, anything that speaks the contract can talk to this app — including
the WordPress plugin.

---

## Notes for shadcn / Radix / any JS-driven UI

The editor preview is **static SSR with no client hydration**. Two
consequences worth knowing up front:

- **`<Accordion.Item>` (and similar Radix/headless-UI primitives that read
  context) crash when rendered standalone.** The editor renders each block
  independently — a child block won't be nested in its parent's `<Root>`
  in the editor preview. Wrap each item in its own `<Root>` so it's
  self-contained. See `components/AccordionItem.jsx`.
- **Anything hidden until you click stays hidden.** Use `forceMount` on
  collapsible Radix primitives so the closed state has children in the
  DOM anyway. Pair with an editor-only CSS override
  (`/wordpress/editor.css`) to force-open in the editor.

Same rules apply to shadcn — it's a thin layer over Radix.

---

## Branches

- **`main`** — lean starter. Three reference blocks, designed to be
  cloned and grown into a real site.
- **`examples`** — rich block library + demo homepage. 15+ blocks across
  common patterns (hero, feature cards, pricing, FAQ, testimonials,
  navigation, forms, CTA). Use this branch to evaluate gcb-lite end-to-end
  before committing, or cherry-pick components from it into your own project.

The two branches never merge. `main` stays minimal on purpose.

---

## License

GPL-2.0-or-later. See [LICENSE](./LICENSE).
