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

export const metadata: Metadata = {
  metadataBase: new URL("https://bellavi-studio.com"),
  title: "BellaVi Studio",
  description: "회화와 일러스트, 미술교육을 잇는 BellaVi Studio"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${serif.variable} ${sans.variable}`}>
      <body className="portfolio-site">
        <SiteHeader />
        {children}
        <SiteFooter />
        <script src="/site.js" defer />
      </body>
    </html>
  );
}
