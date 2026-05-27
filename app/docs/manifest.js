/**
 * Docs manifest — drives the sidebar on every /docs page.
 *
 * Now generated from the plugin-owned markdown sources (read by
 * lib/docs.js → buildManifest()). The hand-maintained array is gone:
 * every .md file in content/{controls,concepts}/ shows up
 * automatically, ordered by frontmatter `order` within frontmatter
 * `section`.
 *
 * This file stays as a thin re-export so existing imports
 * (`import { docsManifest } from './manifest'`) keep working.
 */

import { buildManifest } from '@/lib/docs';

export const docsManifest = buildManifest();
