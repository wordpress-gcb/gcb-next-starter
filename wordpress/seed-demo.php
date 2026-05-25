#!/usr/bin/env php
<?php
/**
 * Portable seed for the gcb-next-starter demo.
 *
 * Creates / upserts:
 *   - 3 projects, 3 testimonials, 6 brands
 *   - 'home' page composed of typed Gutenberg blocks
 *
 * Idempotent — re-running updates existing records (matched by a
 * `_gcblite_seed_marker` meta) rather than duplicating.
 *
 * ## Where to run this
 *
 *   1. Local dev (Valet / .test domain):
 *      php seed-demo.php <wp-root>
 *      e.g. php seed-demo.php /Users/me/sites/gcblitewp
 *
 *   2. Kinsta (or any host with WP-CLI):
 *      Copy this file to the server, then:
 *      wp eval-file seed-demo.php
 *      (WP_CLI boots the right wp-load.php automatically.)
 *
 *   3. Anywhere else with PHP CLI access:
 *      php seed-demo.php /absolute/path/to/wp-root
 *
 * ## Requirements
 *
 *   - gcb-lite plugin active (provides Collection helper, post-fields).
 *   - A theme that registers project / testimonial / brand CPTs with the
 *     same field shapes the demo expects. (The example
 *     gcblite/examples/themes/gcb-abstrak theme does this.)
 *   - The five abstrak-* blocks registered as well (the example
 *     gcblite/examples/blocks/abstrak-* dirs cover this).
 *
 * The seed itself doesn't install plugin / theme code — it only writes
 * content. Make sure code is in place before running.
 */

if (!defined('ABSPATH')) {
    if (php_sapi_name() !== 'cli') {
        die('CLI only');
    }
    $wp_root = $argv[1] ?? null;
    if (!$wp_root) {
        fwrite(STDERR, "Usage: php seed-demo.php <wp-root>\n");
        fwrite(STDERR, "   or: wp eval-file seed-demo.php   (when WP-CLI is available)\n");
        exit(1);
    }
    $_SERVER['HTTP_HOST']   = parse_url(home_url() ?: 'http://localhost', PHP_URL_HOST) ?: 'localhost';
    $_SERVER['REQUEST_URI'] = '/';
    require rtrim($wp_root, '/') . '/wp-load.php';
}

function gcb_seed_attrs_json(array $a) {
    return wp_json_encode($a, JSON_UNESCAPED_SLASHES);
}

function gcb_seed_upsert($post_type, $marker, $post_data, $meta = []) {
    $existing = get_posts([
        'post_type'   => $post_type,
        'meta_key'    => '_gcblite_seed_marker',
        'meta_value'  => $marker,
        'post_status' => 'any',
        'numberposts' => 1,
    ]);

    if ($existing) {
        $post_id = $existing[0]->ID;
        wp_update_post(array_merge(['ID' => $post_id], $post_data));
    } else {
        $post_id = wp_insert_post(array_merge($post_data, [
            'post_type'   => $post_type,
            'post_status' => 'publish',
        ]));
        update_post_meta($post_id, '_gcblite_seed_marker', $marker);
    }

    foreach ($meta as $key => $value) {
        update_post_meta($post_id, $key, $value);
    }
    return $post_id;
}

/* ---------- Projects ---------- */
$projects = [
    ['Postwave CMS Marketing',    'SaaS site',  'project-1.png', 'https://postwave.example'],
    ['Beacon Analytics Dashboard','Web app',    'project-4.png', 'https://beacon.example'],
    ['Glide Editorial',           'Publishing', 'project-2.png', 'https://glide.example'],
];
foreach ($projects as [$title, $cat, $img, $url]) {
    gcb_seed_upsert('project', 'project:' . sanitize_title($title), [
        'post_title'   => $title,
        'post_excerpt' => "Designed and shipped end-to-end on GCB — typed Gutenberg blocks on the back, React on the front, one component for both. $cat.",
    ], [
        'cover'    => ['url' => '/images/project/' . $img, 'alt' => $title, 'width' => 800, 'height' => 500],
        'live_url' => ['url' => $url, 'text' => 'Visit site', 'opensInNewTab' => true],
    ]);
}

/* ---------- Testimonials ---------- */
$testimonials = [
    ['Maya Hernández', 'Senior Frontend Engineer', 'Postwave',
     '“Editor preview and the live site are the same React component. The bug-spotting loop collapsed from hours to seconds — we ship a block, our editors see exactly what readers will see.”'],
    ['Jordan Ito',     'Editor-in-Chief',          'Glide',
     '“My editors author in Gutenberg, our frontend is Next.js. Before GCB those were two codebases that drifted. Now they\'re one component, and the team finally trusts the preview.”'],
    ['Sam Okafor',     'Tech Lead',                'Beacon',
     '“The typed field system is what hooked me. We declare an Inspector control in JSON and the React frontend reads it back via REST as a real number, a real URL object, not a stringly-typed mess.”'],
];
foreach ($testimonials as [$name, $role, $from, $quote]) {
    gcb_seed_upsert('testimonial', 'testimonial:' . sanitize_title($name), [
        'post_title' => $name,
    ], [
        'quote'        => $quote,
        'author_name'  => $name,
        'author_role'  => $role,
        'author_image' => ['url' => 'https://i.pravatar.cc/120?u=' . sanitize_title($name), 'alt' => $name],
        'from_label'   => $from,
    ]);
}

/* ---------- Brands ---------- */
$brands = ['Postwave', 'Beacon', 'Glide', 'Northwind', 'Helio', 'Atlas'];
foreach ($brands as $brand) {
    gcb_seed_upsert('brand', 'brand:' . sanitize_title($brand), [
        'post_title' => $brand,
    ], [
        'logo' => [
            'url' => 'https://dummyimage.com/200x60/202020/ffffff&text=' . urlencode($brand),
            'alt' => $brand, 'width' => 200, 'height' => 60,
        ],
    ]);
}

/* ---------- Home page ---------- */
$why_text_attrs = gcb_seed_attrs_json([
    'subtitle_left'  => 'gutenberg',
    'subtitle_right' => 'react',
    'heading'        => ['text' => 'Why GCB Lite?', 'level' => 'h3'],
    'body'           => "<p>WordPress as a typed-field CMS for a React frontend. One component renders both the editor preview and the public site — no edit.js to maintain in parallel with your real frontend.</p>\n<p>Author rich content in the block editor you already know. Ship it to a Next.js / Astro / Remix frontend without rebuilding any of it.</p>",
    'cta'            => ['url' => 'https://github.com/wordpress-gcb/gutenberg-control-blocks-lite', 'text' => 'View on GitHub', 'opensInNewTab' => true],
]);
$why_accordion_attrs = gcb_seed_attrs_json([
    'heading' => ['text' => 'What you get', 'level' => 'h3'],
    'intro'   => 'Five reasons developers and editors actually agree.',
]);
$why_items = [
    gcb_seed_attrs_json(['icon' => 'FaTags',    'title' => 'Typed fields',                  'body' => 'Declare Inspector controls in JSON. The plugin generates WP attributes with correct types and defaults — no manual block.json wiring.']),
    gcb_seed_attrs_json(['icon' => 'FaSyncAlt', 'title' => 'Editor / frontend parity',      'body' => 'One React component renders the editor preview AND the public site. No edit.js drift. What the author sees is what ships.']),
    gcb_seed_attrs_json(['icon' => 'FaCode',    'title' => 'Headless React, end-to-end',    'body' => 'Native Next.js / Astro / Remix story. Block markup over REST. No theme.php to write, no Twig, no Bootstrap legacy.']),
    gcb_seed_attrs_json(['icon' => 'FaSitemap', 'title' => 'Conditional logic + validation','body' => 'Show fields when others have values. Required, min/max, regex — enforced client + server. The CMS knows your content rules.']),
    gcb_seed_attrs_json(['icon' => 'FaServer',  'title' => 'REST-native, headless-ready',   'body' => 'Every block field is in /wp/v2/{type}.meta. Every CPT field too. Pull straight into any frontend without scraping HTML.']),
];
$why_items_block = '';
foreach ($why_items as $a) $why_items_block .= "<!-- wp:gcb/abstrak-icon-accordion-item $a /-->\n";

$why_section = <<<WHY
<!-- wp:columns -->
<div class="wp-block-columns">
<!-- wp:column {"width":"42%"} -->
<div class="wp-block-column" style="flex-basis:42%">
<!-- wp:gcb/abstrak-section-text $why_text_attrs /-->
</div>
<!-- /wp:column -->

<!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%">
<!-- wp:gcb/abstrak-icon-accordion $why_accordion_attrs -->
$why_items_block<!-- /wp:gcb/abstrak-icon-accordion -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
WHY;

$home_content = <<<EOT
<!-- wp:gcb/abstrak-banner /-->

<!-- wp:gcb/abstrak-projects /-->

<!-- wp:gcb/abstrak-testimonials /-->

<!-- wp:gcb/abstrak-brands {"heading":{"text":"Used by teams building with GCB.","level":"h2"},"source":"latest","count":6} /-->

$why_section

<!-- wp:gcb/abstrak-blog /-->

<!-- wp:gcb/abstrak-cta /-->
EOT;

// KSES filters HTML-escape <!-- comments --> nested inside wp-block-column
// shells. Lift filters around the upsert so the nested block markup
// survives — re-init after.
kses_remove_filters();
$home_id = gcb_seed_upsert('page', 'home-page', [
    'post_title'   => 'Home',
    'post_name'    => 'home',
    'post_content' => $home_content,
]);
kses_init_filters();

echo "✓ Seeded:\n";
echo "  3 projects, 3 testimonials, 6 brands\n";
echo "  'home' page (ID $home_id) composed of typed Gutenberg blocks\n";
echo "\nVisit /?page_id=$home_id on this WordPress to preview, or\n";
echo "hit the configured component server URL to see it rendered as React.\n";
