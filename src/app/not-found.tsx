import { FullReloadLink } from "@/components/FullReloadLink";

export default function NotFound() {
  return (
    <main id="main" className="portfolio-page-hero">
      <div className="page-copy">
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>요청하신 페이지가 이동되었거나 존재하지 않습니다.</p>
        <FullReloadLink className="button outline" href="/">Home</FullReloadLink>
      </div>
    </main>
  );
}
