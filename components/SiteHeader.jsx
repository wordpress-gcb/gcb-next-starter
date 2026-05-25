/**
 * SiteHeader — ported from Abstrak's HeaderOne.js (src/common/header/).
 *
 * Stripped to what the GCB demo needs: logo, simple nav (Home / Projects
 * / Docs / Blog), GitHub icon link in the action slot. No mega-menu, no
 * offcanvas — those belong to the multi-page agency demo, not a
 * single-purpose plugin showcase.
 *
 * Sticky behaviour kept (Abstrak's StickyHeader hook reimplemented inline
 * as a tiny scroll listener) so the header pins to the viewport on scroll.
 *
 * Bootstrap is bundled — `.container`, `.d-none.d-lg-block` etc. resolve
 * against the Bootstrap reset loaded in app/layout.jsx.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

export default function SiteHeader() {
  const sticky = useSticky(100);

  return (
    <header className="header axil-header header-style-1">
      <div className={`axil-mainmenu${sticky ? ' axil-sticky' : ''}`}>
        <div className="container">
          <div className="header-navbar">
            <div className="header-logo">
              <Link href="/" aria-label="GCB Lite — home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.svg" alt="GCB Lite" style={{ height: 32 }} />
              </Link>
            </div>

            <div className="header-main-nav">
              <nav className="mainmenu-nav">
                <ul className="mainmenu">
                  <li><Link href="/">Home</Link></li>
                  <li><Link href="/docs">Docs</Link></li>
                  <li><Link href="/#projects">Projects</Link></li>
                  <li><Link href="/#blog">Blog</Link></li>
                </ul>
              </nav>
            </div>

            <div className="header-action">
              <ul className="list-unstyled">
                <li>
                  <a
                    href="https://github.com/wordpress-gcb/gutenberg-control-blocks-lite"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GCB Lite on GitHub"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: 'inherit',
                    }}
                  >
                    <FaGithub size={32} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Re-implementation of Abstrak's StickyHeader hook — toggles a boolean
 * once the scrollY crosses `offset`. Returns a state-driven boolean so
 * the parent re-renders.
 */
function useSticky(offset = 100) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    function onScroll() {
      setStuck(window.scrollY > offset);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return stuck;
}
