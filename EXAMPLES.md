# Examples branch

This branch builds on `main` with four extra marketing blocks and a
working demo homepage at `app/page.jsx` that uses them. Treat it as a
fork-and-prune source: take what you want, leave the rest.

## What's added vs `main`

| Block             | Demonstrates                                              |
|-------------------|-----------------------------------------------------------|
| `gcb/hero`        | text + wysiwyg + image (focal point) + two URL CTAs + toggle-group layout |
| `gcb/feature-trio`| parent block with inner-block children + Repeater pattern |
| `gcb/feature-item`| child block with text + textarea + icon                   |
| `gcb/cta`         | text + textarea + URL + toggle-group style variant        |

Plus the original three reference blocks inherited from `main`:
`gcb/accordion-test` + `gcb/accordion-test-item`, `gcb/text-image`,
`gcb/gallery-test`.

## Running the demo

```bash
git checkout examples
npm install
npm run dev
# → http://localhost:3001
```

The homepage at `/` is the demo. It composes the marketing blocks with
hardcoded content so it renders without a WordPress install. The
public-page route at `/[...slug]` still works against a real WP if you
have one set up (see the main README).

## Using these blocks against a real WordPress

The theme-side schemas (`block.json` + `block.fields.json`) live in
[`wordpress-theme-files/blocks/`](./wordpress-theme-files/blocks/).
Copy any folder you want into your theme's `blocks/` directory; the
GCB Lite plugin will discover and register them.

For each block you copy, the corresponding React component is already in
[`components/`](./components/) and registered in
[`wordpress/config/WPBlockRegistry.js`](./wordpress/config/WPBlockRegistry.js).

## Why this isn't on `main`

`main` stays minimal so it's easy to fork as the seed of a real site
without having a marketing template to prune out. The examples branch
never merges back.
