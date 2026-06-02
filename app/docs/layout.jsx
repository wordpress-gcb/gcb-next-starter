/**
 * /docs layout — sidebar on the left, content on the right.
 *
 * Bootstrap container/row/col grid (already loaded in app/layout.jsx) does
 * the heavy lifting. Sidebar is just an unordered list grouped by section,
 * driven by docs/manifest.js.
 */

import Link from 'next/link';
import { docsManifest } from './manifest';
import { buildSearchIndex } from '@/lib/docs';
import DocsSearch from '@/components/DocsSearch';

export default function DocsLayout({ children }) {
  // Built once at build time (server component) and handed to the client
  // search box as a plain-JSON prop — no runtime filesystem access.
  const searchIndex = buildSearchIndex();

  // paddingTop clears the sticky header. Once the page is scrolled the header
  // is position:fixed at ~90px tall (15px padding + 60px nav + 15px); 120px
  // here keeps the H1 and sidebar from sliding under it. scroll-margin-top on
  // the heading components (DocsArticle) does the same for #anchor jumps.
  return (
    <div className="container docs-shell" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <div className="row">
        <aside className="col-lg-3" style={{ position: 'sticky', top: 110, alignSelf: 'flex-start' }}>
          <DocsSearch index={searchIndex} />
          <nav aria-label="Docs navigation">
            {docsManifest.map((section) => (
              <div key={section.section} style={{ marginBottom: 28 }}>
                <h6
                  style={{
                    fontSize: 12,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: 'var(--color-gray-1)',
                    marginBottom: 10,
                  }}
                >
                  {section.section}
                </h6>
                <ul className="list-unstyled" style={{ marginBottom: 0 }}>
                  {section.items.map((item) => (
                    <li key={item.href} style={{ marginBottom: 6 }}>
                      <Link href={item.href} style={{ color: 'var(--color-body)', textDecoration: 'none' }}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="col-lg-9 docs-article">
          {children}
        </article>
      </div>
    </div>
  );
}
