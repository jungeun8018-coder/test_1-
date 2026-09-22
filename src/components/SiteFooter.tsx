import { FullReloadLink } from "@/components/FullReloadLink";

export function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <FullReloadLink className="logo" href="/">BellaVi <span>Studio</span></FullReloadLink>
            <p>좋아하는 것을 오래 잃지 않는 삶</p>
            <p className="footer-credit">Designed &amp; Illustrated by Park Jungeun</p>
            <nav className="footer-links" aria-label="연락 및 채널">
              <a className="footer-social-icon" href="https://instagram.com/jungeun__illust" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a className="footer-social-icon" href="https://blog.naver.com/jungeun__art" target="_blank" rel="noopener noreferrer" aria-label="Naver Blog">
                <svg className="footer-blog-badge" viewBox="0 0 32 24" width="30" height="22" fill="none" aria-hidden="true" focusable="false">
                  <rect x="3" y="3" width="26" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <text x="16" y="12.5" textAnchor="middle" dominantBaseline="middle" fill="currentColor">blog</text>
                </svg>
              </a>
            </nav>
          </div>
          <p>© 2026 BellaVi Studio</p>
        </div>
      </footer>
      <button className="back-to-top" type="button" aria-label="맨 위로 이동">↑</button>
    </>
  );
}
