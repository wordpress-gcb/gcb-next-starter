/**
 * remark plugin: container directive `:::codetabs` → <CodeTabs> emit.
 *
 * Authoring contract:
 *
 *   :::codetabs
 *   ```php
 *   echo gcb_field('eyebrow');
 *   ```
 *   ```jsx
 *   <p>{eyebrow}</p>
 *   ```
 *   :::
 *
 * Each fenced code block inside the directive becomes one tab. The
 * code block's info string (`php`, `jsx`, …) becomes both the tab
 * label and the syntax-highlighting language.
 *
 * We transform the directive node into a `<codetabs>` MDX-style HTML
 * element with a JSON-stringified `tabs` attribute. react-markdown's
 * `components` map then renders that into the existing <CodeTabs>
 * React component (see app/docs/[...slug]/page.jsx).
 */

import { visit } from 'unist-util-visit';

export default function remarkCodetabs() {
	return (tree) => {
		visit(tree, (node) => {
			if (node.type !== 'containerDirective') return;
			if (node.name !== 'codetabs') return;

			const tabs = [];
			for (const child of node.children || []) {
				if (child.type !== 'code') continue;
				tabs.push({
					lang:  child.lang || 'text',
					value: child.value || '',
				});
			}

			// Rewrite the node as an HTML-shaped element that react-markdown
			// will hand off to our `components.codetabs` renderer. We can't
			// pass complex JS objects through HAST props directly — JSON-encode
			// + decode on the renderer side.
			const data = node.data || (node.data = {});
			data.hName = 'codetabs';
			data.hProperties = {
				tabs: JSON.stringify(tabs),
			};
			// Children no longer need to render — the renderer reads the tabs
			// prop and emits the whole tabbed UI itself.
			node.children = [];
		});
	};
}
