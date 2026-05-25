/**
 * next/link shim for the theme bundle.
 *
 * SiteHeader / SiteFooter import next/link for client-side routing on
 * the Next.js side. The theme bundle has no router — fall back to a
 * plain anchor that does normal page navigation. esbuild's `alias`
 * config swaps next/link's real package for this file at theme-build
 * time only; the Next.js dev/build keeps the real next/link.
 */

import React from 'react';

export default function NextLinkShim({ href, children, ...rest }) {
  return React.createElement('a', { href, ...rest }, children);
}
