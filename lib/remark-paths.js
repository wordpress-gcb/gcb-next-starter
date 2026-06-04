/**
 * remark plugin: container directive `:::paths` → <paths> / <pathpanel> emit.
 *
 * The choose-your-stack chooser. Where :::codetabs switches one code block
 * between languages, :::paths switches an ENTIRE walkthrough — prose, several
 * code blocks, callouts — between the ways a reader can build a GCB block.
 *
 * Authoring contract (see the plugin's schemas/_directives.md for the full
 * spec):
 *
 *   :::paths
 *   == I'm building in PHP ==
 *
 *   Everything lives in your WordPress theme.
 *
 *   ```php
 *   echo esc_html($attributes['heading']);
 *   ```
 *
 *   == I'm building my frontend in JS ==
 *
 *   The markup is produced by your own frontend.
 *
 *   ```jsx
 *   export default function Hero({ attributes }) { return ...; }
 *   ```
 *   :::
 *
 * Each `== Label ==` line opens a new tab; everything until the next label
 * (or the closing `:::`) is that tab's body. Unlike codetabs we DON'T flatten
 * to strings — a tab body is arbitrary markdown, so we keep the parsed AST
 * nodes and let react-markdown render them. We just regroup the directive's
 * flat child list into one <pathpanel label="…"> per tab, all wrapped in a
 * single <paths> element that the client component turns into a tab UI.
 */

import { visit } from 'unist-util-visit';

// A `== Label ==` marker parses (via remark) as a paragraph whose text is
// "== Label ==". Detect that shape and pull the label out. Two or more `=`
// on each side; inner whitespace trimmed.
const LABEL_RE = /^\s*={2,}\s*(.+?)\s*={2,}\s*$/;

function paragraphLabel(node) {
  if (!node || node.type !== 'paragraph') return null;
  // Only a lone text child can be a marker — "== x ==" with inline
  // formatting isn't a marker, it's prose.
  const kids = node.children || [];
  if (kids.length !== 1 || kids[0].type !== 'text') return null;
  const m = kids[0].value.match(LABEL_RE);
  return m ? m[1] : null;
}

export default function remarkPaths() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;
      if (node.name !== 'paths') return;

      // Split the flat children into [{ label, nodes }] groups, opening a
      // new group on each `== Label ==` paragraph. Content before the first
      // label (if any) is dropped — authors should lead with a label.
      const groups = [];
      let current = null;
      for (const child of node.children || []) {
        const label = paragraphLabel(child);
        if (label !== null) {
          current = { label, nodes: [] };
          groups.push(current);
          continue;
        }
        if (current) current.nodes.push(child);
      }

      if (groups.length === 0) return; // nothing to do — leave node as-is

      // Each group → a <pathpanel label="…"> wrapping its (still-AST) nodes.
      // remark-directive lets us set hName/hProperties via node.data; we
      // synthesise plain nodes of our own and give them the same treatment.
      const panels = groups.map((g) => ({
        type: 'paths-panel',
        children: g.nodes,
        data: {
          hName: 'pathpanel',
          hProperties: { label: g.label },
        },
      }));

      // The directive node itself becomes <paths>, holding the panels.
      const data = node.data || (node.data = {});
      data.hName = 'paths';
      data.hProperties = {};
      node.children = panels;
    });
  };
}
