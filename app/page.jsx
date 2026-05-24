/**
 * Examples-branch demo homepage.
 *
 * Fetches the WP page with slug "home" and renders it via BlockRenderer.
 * This is the actual "WP as CMS for a React frontend" loop in action —
 * edit the page in wp-admin, save, reload here.
 *
 * Falls back to a helpful setup-state if:
 *   - NEXT_PUBLIC_WP_URL isn't set (Vercel build / fork before configuring)
 *   - the "home" page doesn't exist on the configured WP yet
 *   - the WP install isn't reachable
 *
 * Without the fallback, a fresh fork would crash at runtime instead of
 * pointing the new user at what to do.
 */

import {
  getPageBySlug,
  parseBlocks,
  blockSourceFromEntity,
  getBlockDefaults,
} from '@/lib/wpRestClient';
import BlockRenderer from '@/components/BlockRenderer';

const HOME_SLUG = 'home';

export default async function Home() {
  // If WordPress isn't wired up yet, show a setup hint instead of crashing.
  if (!process.env.NEXT_PUBLIC_WP_URL) {
    return <SetupHint reason="missing-env" />;
  }

  let page = null;
  let error = null;
  try {
    page = await getPageBySlug(HOME_SLUG);
  } catch (e) {
    error = e?.message || String(e);
  }

  if (error) {
    return <SetupHint reason="fetch-failed" detail={error} />;
  }
  if (!page) {
    return <SetupHint reason="no-page" />;
  }

  const blocks = parseBlocks(blockSourceFromEntity(page));
  const blockDefaults = await getBlockDefaults().catch(() => ({}));

  return (
    <main>
      <BlockRenderer blocks={blocks} blockDefaults={blockDefaults} />
    </main>
  );
}

function SetupHint({ reason, detail }) {
  const messages = {
    'missing-env':
      'NEXT_PUBLIC_WP_URL is not set. Add it to the Vercel project (or .env.local for local dev) and redeploy.',
    'fetch-failed': `Could not reach WordPress at ${process.env.NEXT_PUBLIC_WP_URL}.`,
    'no-page': `No page with slug "${HOME_SLUG}" found on ${process.env.NEXT_PUBLIC_WP_URL}. Create one in wp-admin and add some gcb/* blocks.`,
  };
  return (
    <main className="max-w-2xl mx-auto p-12 font-sans">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-3">
        GCB Lite demo — setup needed
      </h1>
      <p className="text-neutral-700 mb-2">{messages[reason]}</p>
      {detail && (
        <pre className="mt-4 text-xs text-neutral-500 bg-neutral-100 rounded p-3 overflow-auto">
          {detail}
        </pre>
      )}
      <p className="text-sm text-neutral-500 mt-6">
        See{' '}
        <a className="underline" href="https://github.com/wordpress-gcb/gcb-next-starter">
          the README
        </a>{' '}
        for setup steps.
      </p>
    </main>
  );
}
