import type { MetadataRoute } from "next";

/**
 * Google 검색엔진용 sitemap (App Router 권장 방식: app/sitemap.ts).
 * 빌드 시 정적으로 생성되어 https://bellavi-studio.com/sitemap.xml 로 제공됩니다.
 *
 * 아래 경로는 src/app/[[...slug]]/page.tsx 의 `routes` 맵 및
 * next.config.ts 의 redirects 대상과 1:1로 대응하는 "실제 공개 페이지"입니다.
 * - /api/* (contact 등 API 라우트)와 존재하지 않는 경로, 관리자 경로는 포함하지 않습니다.
 * - 새 공개 페이지를 추가하면 이 목록에도 함께 추가해 주세요.
 */
const SITE_URL = "https://bellavi-studio.com";

type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
};

const PAGES: SitemapEntry[] = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "yearly" },
  { path: "/artist", priority: 0.7, changeFrequency: "yearly" },
  { path: "/works", priority: 0.8, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "monthly" },
  { path: "/illustration", priority: 0.6, changeFrequency: "monthly" },
  { path: "/programs", priority: 0.8, changeFrequency: "monthly" },
  { path: "/programs/seasonal", priority: 0.7, changeFrequency: "yearly" },
  { path: "/programs/postcard", priority: 0.7, changeFrequency: "yearly" },
  { path: "/programs/calendar", priority: 0.7, changeFrequency: "yearly" },
  { path: "/programs/community", priority: 0.7, changeFrequency: "yearly" },
  { path: "/shop", priority: 0.8, changeFrequency: "monthly" },
  { path: "/beyond", priority: 0.7, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.6, changeFrequency: "monthly" },
  { path: "/journey", priority: 0.6, changeFrequency: "monthly" },
  { path: "/people", priority: 0.6, changeFrequency: "monthly" },
  { path: "/notes", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority
  }));
}
