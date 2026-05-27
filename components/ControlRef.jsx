'use client';

/**
 * ControlRef — wraps a control name with a hover-preview popover.
 *
 * Usage:
 *   <ControlRef type="image">image</ControlRef>
 *
 * On hover (after a short delay), pops up an iframe pointing at
 * /docs/fields/{type}?embed=1. The embed mode strips site chrome and
 * the docs sidebar so the iframe shows only the article content.
 *
 * Click navigates to the full docs page. The popover is just a reading
 * affordance — content is fully selectable / copy-paste-able by the
 * browser's default iframe behaviour.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Control types that have a dedicated sub-page under /docs/fields/{type}.
// Mentioning a type not in this list renders as a plain link to the
// All-controls overview page (no hover preview).
const HAS_PAGE = new Set([
	'text', 'image', 'url', 'heading', 'toggle',
	'checkbox', 'repeater', 'post-object',
]);

// Hover delays — short enough to feel responsive, long enough that
// merely mousing over a paragraph doesn't trigger popovers everywhere.
const OPEN_DELAY  = 180;
const CLOSE_DELAY = 220;

export default function ControlRef({ type, children }) {
	const hasPage = HAS_PAGE.has(type);
	const href = hasPage ? `/docs/fields/${type}` : '/docs/fields';

	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({ top: 0, left: 0 });
	const triggerRef = useRef(null);
	const openTimer = useRef(null);
	const closeTimer = useRef(null);

	useEffect(() => () => {
		// Defensive cleanup if the component unmounts mid-timer.
		if (openTimer.current) clearTimeout(openTimer.current);
		if (closeTimer.current) clearTimeout(closeTimer.current);
	}, []);

	const positionFor = () => {
		const el = triggerRef.current;
		if (!el) return { top: 0, left: 0 };
		const rect = el.getBoundingClientRect();
		// Pin below the trigger by default; nudge left if it'd overflow
		// the viewport's right edge. iframe width ~ 460px.
		const POPOVER_W = 460;
		const margin = 12;
		let left = rect.left + window.scrollX;
		if (left + POPOVER_W + margin > window.scrollX + window.innerWidth) {
			left = window.scrollX + window.innerWidth - POPOVER_W - margin;
		}
		return {
			top: rect.bottom + window.scrollY + 6,
			left,
		};
	};

	const handleEnter = () => {
		if (!hasPage) return;
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
		if (open) return;
		openTimer.current = setTimeout(() => {
			setPos(positionFor());
			setOpen(true);
		}, OPEN_DELAY);
	};

	const handleLeave = () => {
		if (openTimer.current) {
			clearTimeout(openTimer.current);
			openTimer.current = null;
		}
		closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
	};

	return (
		<>
			<Link
				href={href}
				ref={triggerRef}
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
				className="gcb-control-ref"
				style={{
					color: 'inherit',
					textDecoration: 'none',
					// Subtle dotted underline marks the link as hoverable
					// without competing with regular doc links.
					borderBottom: '1px dotted currentColor',
				}}
			>
				{children ?? type}
			</Link>
			{open && (
				<div
					className="gcb-control-ref-popover"
					onMouseEnter={handleEnter}
					onMouseLeave={handleLeave}
					style={{
						position: 'absolute',
						top: pos.top,
						left: pos.left,
						width: 460,
						height: 380,
						zIndex: 1000,
						background: '#fff',
						border: '1px solid var(--color-gray-2, #e5e5e5)',
						borderRadius: 8,
						boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
						overflow: 'hidden',
					}}
				>
					<iframe
						src={`${href}?embed=1`}
						title={`${type} docs preview`}
						style={{ width: '100%', height: '100%', border: 'none' }}
						loading="lazy"
					/>
				</div>
			)}
		</>
	);
}
