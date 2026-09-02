import type { MetadataRoute } from "next";

/**
 * 검색엔진 크롤러용 robots.txt (App Router 권장 방식: app/robots.ts).
 * https://bellavi-studio.com/robots.txt 로 제공됩니다.
 *
 * - 모든 일반 검색엔진(User-agent: *)의 공개 페이지 크롤링을 허용합니다.
 * - 공개 페이지가 아닌 API 라우트(/api/*)만 크롤링 대상에서 제외합니다.
 * - sitemap 위치를 공식 도메인 기준 절대 URL로 명시합니다.
 */
const SITE_URL = "https://bellavi-studio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/"
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
