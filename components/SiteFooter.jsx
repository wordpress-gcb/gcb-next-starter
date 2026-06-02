/**
 * SiteFooter — ported from Saas's FooterOne.js, slimmed for the GCB demo.
 *
 * Dropped from the original: newsletter form (no backend wired), the
 * 9-icon social row (GCB Lite is a code project, not a brand), Services
 * link column (not relevant here). Kept the three-column link layout +
 * bottom copyright bar, repointed at the GCB ecosystem.
 */

import Link from 'next/link';
import { FaGithub, FaTwitter } from 'react-icons/fa';

export default function SiteFooter() {
  return (
    <footer className="footer-area">
      <div className="container">
        <div className="footer-top">
          <div className="footer-social-link">
            <ul className="list-unstyled">
              <li>
                <a href="https://github.com/wordpress-gcb/gutenberg-control-blocks-lite" target="_blank" rel="noopener noreferrer">
                  <FaGithub />
                </a>
              </li>
              <li>
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-main">
          <div className="row">
            <div className="col-xl-6 col-lg-5">
              <div className="footer-widget border-end">
                <div className="footer-newsletter">
                  <h2 className="title">GCB Lite</h2>
                  <p>
                    A WordPress plugin that turns Gutenberg into a typed-field CMS
                    for a headless React frontend. One component renders both the
                    editor preview AND the public site.
                  </p>
                  <a
                    href="https://github.com/wordpress-gcb/gutenberg-control-blocks-lite"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="axil-btn btn-fill-primary"
                  >
                    Star on GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="col-xl-6 col-lg-7">
              <div className="row">
                <div className="col-sm-4">
                  <div className="footer-widget">
                    <h6 className="widget-title">Docs</h6>
                    <div className="footer-menu-link">
                      <ul className="list-unstyled">
                        <li><Link href="/docs/quickstart">Quickstart</Link></li>
                        <li><Link href="/docs/fields">Field reference</Link></li>
                        <li><Link href="/docs/post-fields">Post fields</Link></li>
                        <li><Link href="/docs/headless">Headless rendering</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-sm-4">
                  <div className="footer-widget">
                    <h6 className="widget-title">Project</h6>
                    <div className="footer-menu-link">
                      <ul className="list-unstyled">
                        <li>
                          <a href="https://github.com/wordpress-gcb/gutenberg-control-blocks-lite" target="_blank" rel="noopener noreferrer">
                            GitHub
                          </a>
                        </li>
                        <li>
                          <a href="https://github.com/wordpress-gcb/gutenberg-control-blocks-lite/issues" target="_blank" rel="noopener noreferrer">
                            Issues
                          </a>
                        </li>
                        <li>
                          <a href="https://gutenbergcontrolblocks.com" target="_blank" rel="noopener noreferrer">
                            Homepage
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-sm-4">
                  <div className="footer-widget">
                    <h6 className="widget-title">Resources</h6>
                    <div className="footer-menu-link">
                      <ul className="list-unstyled">
                        <li><Link href="/#projects">Examples</Link></li>
                        <li><Link href="/#blog">Blog</Link></li>
                        <li>
                          <a href="https://wordpress.org/plugins/gcb-lite/" target="_blank" rel="noopener noreferrer">
                            WP.org listing
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="row">
            <div className="col-md-6">
              <div className="footer-copyright">
                <span className="copyright-text">
                  © {new Date().getFullYear()} GCB Lite —
                  {' '}<a href="https://gutenbergcontrolblocks.com">gutenbergcontrolblocks.com</a>.
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-link">
                <ul className="list-unstyled">
                  <li><Link href="/docs">Docs</Link></li>
                  <li>
                    <a href="https://github.com/wordpress-gcb/gutenberg-control-blocks-lite/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
                      License
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
