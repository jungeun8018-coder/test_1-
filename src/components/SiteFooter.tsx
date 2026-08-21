import { FullReloadLink } from "@/components/FullReloadLink";

export function SiteFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <FullReloadLink className="logo" href="/">BellaVi <span>Studio</span></FullReloadLink>
            <p>좋아하는 것을 오래 잃지 않는 삶</p>
            <p>Designed &amp; Illustrated by Park Jungeun</p>
          </div>
          <p>© 2026 BellaVi Studio</p>
        </div>
      </footer>
      <button className="back-to-top" type="button" aria-label="맨 위로 이동">↑</button>
    </>
  );
}
