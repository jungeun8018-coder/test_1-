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
const SITE_DESCRIPTION = "회화와 일러스트, 미술교육을 잇는 BellaVi Studio";
// app/opengraph-image.tsx 로 생성되는 기본 공유 이미지 (1200x630).
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "BellaVi Studio — Art for a Beautiful Life",
  type: "image/png"
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: SITE_NAME,
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
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
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
