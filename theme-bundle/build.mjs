#!/usr/bin/env node
/**
 * Build the gcb-abstrak theme bundle.
 *
 * Compiles two outputs:
 *   - build/theme.js   — React + the Abstrak View components + the
 *                        hydration scanner. Loaded by the theme on
 *                        every frontend + editor request.
 *   - build/theme.css  — Bootstrap 5.3 + Abstrak SCSS + project
 *                        overrides, concatenated and minified.
 *
 * Output goes to the gcb-lite plugin's example theme directory:
 *   ../gcblitewp/wp-content/plugins/gcb-lite/examples/themes/gcb-abstrak/build/
 *
 * Why outside this repo: the theme zip shipped via the Playground
 * blueprint (and the Kinsta theme deploy) is built from that path. One
 * source of truth, two consumers — Next.js imports the JSX directly for
 * HMR; the theme imports the compiled artifact.
 *
 * Run from repo root:  node theme-bundle/build.mjs
 * Or via npm script:   npm run build:theme
 */

import { build } from 'esbuild';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

// Default output path — relative to this repo's parent, pointing at the
// gcb-lite plugin's theme directory in the parallel checkout. Override
// with GCB_THEME_OUT env var if your layout differs.
const themeOut = process.env.GCB_THEME_OUT || resolve(
  repoRoot,
  '../gcblitewp/wp-content/plugins/gcb-lite/examples/themes/gcb-abstrak/build',
);

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function buildJs() {
  await build({
    entryPoints: [resolve(here, 'entry.jsx')],
    bundle: true,
    minify: true,
    target: 'es2020',
    format: 'iife',
    jsx: 'automatic',
    outfile: resolve(themeOut, 'theme.js'),
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    alias: {
      // Mirror Next.js's @ alias so the components import normally.
      '@': repoRoot,
    },
    logLevel: 'info',
  });
}

async function buildCss() {
  const sass = resolve(repoRoot, 'node_modules/.bin/sass');
  const entry = resolve(here, 'theme.scss');
  const out   = resolve(themeOut, 'theme.css');
  const { stdout, stderr } = await execFileP(sass, [
    '--no-source-map',
    '--style=compressed',
    `--load-path=${resolve(repoRoot, 'node_modules')}`,
    entry,
    out,
  ]);
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

async function main() {
  await ensureDir(themeOut);
  await Promise.all([buildJs(), buildCss()]);

  const [js, css] = await Promise.all([
    stat(resolve(themeOut, 'theme.js')),
    stat(resolve(themeOut, 'theme.css')),
  ]);
  console.log(`✓ theme.js   ${(js.size  / 1024).toFixed(1)} KB`);
  console.log(`✓ theme.css  ${(css.size / 1024).toFixed(1)} KB`);
  console.log(`  → ${themeOut}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
