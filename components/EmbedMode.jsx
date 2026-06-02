'use client';

/**
 * EmbedMode — drops a body class when the page is loaded with ?embed=1.
 *
 * Used by the docs hover-preview iframe to strip site chrome (header,
 * footer, docs sidebar) so the iframe shows just the docs content. The
 * actual hiding is done in globals.css (.is-embed-mode rules).
 *
 * Why not search-params on the server? Layouts in the App Router don't
 * get search params — only pages do. Toggling chrome based on a query
 * string would require either a route-level wrapper or this small
 * client-side effect. The effect is the smaller surgery.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function EmbedMode() {
	const params = useSearchParams();
	const embed = params.get('embed');
	useEffect(() => {
		if (typeof document === 'undefined') return;
		const on = embed === '1';
		document.body.classList.toggle('is-embed-mode', on);
		return () => document.body.classList.remove('is-embed-mode');
	}, [embed]);
	return null;
}
