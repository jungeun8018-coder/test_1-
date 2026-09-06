import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_KR } from "next/font/google";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant-garamond",
  display: "swap"
});

const sans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-sans-kr",
  display: "swap"
});

const SITE_URL = "https://bellavi-studio.com";
const SITE_NAME = "BellaVi Studio";
// 브랜드 방향: "좋아하는 것을 오래 잃지 않는 삶"
const SITE_TITLE = "BellaVi Studio | 좋아하는 것을 오래 잃지 않는 삶";
const SITE_DESCRIPTION = "그림을 그리고, 배우고, 함께 나누며 오래 좋아할 것을 발견하는 성인 아트 스튜디오입니다.";
// public/images/illustration-vacation-og.jpg 를 사이트 전체 기본 공유 이미지로 사용합니다. (2:1 가로형)
const OG_IMAGE = {
  url: "/images/illustration-vacation-og.jpg",
  width: 2273,
  height: 1141,
  alt: "BellaVi Studio — Art for a Beautiful Life",
  type: "image/jpeg"
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  authors: [{ name: "Park Jungeun" }],
  creator: "Park Jungeun",
  publisher: SITE_NAME,
  keywords: [
    "BellaVi Studio",
    "벨라비 스튜디오",
    "회화",
    "일러스트",
    "미술교육",
    "박정은",
    "계절 드로잉",
    "취향한점"
  ],
  // 하위 페이지는 [[...slug]]/page.tsx 의 generateMetadata 가 경로별 canonical / og 로 덮어씁니다.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url]
  }
};

// 검색엔진용 구조화 데이터(JSON-LD). 화면에 렌더링되지 않습니다.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      description: SITE_DESCRIPTION,
      founder: { "@type": "Person", name: "Park Jungeun" },
      sameAs: [
        "https://instagram.com/jungeun__illust",
        "https://blog.naver.com/jungeun__art"
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "ko",
      publisher: { "@id": `${SITE_URL}/#organization` }
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${serif.variable} ${sans.variable}`}>
      <body className="portfolio-site">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
        <script src="/site.js" defer />
      </body>
    </html>
  );
}
