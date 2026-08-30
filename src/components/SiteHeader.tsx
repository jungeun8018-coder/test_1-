"use client";

import { usePathname } from "next/navigation";

import { FullReloadLink } from "@/components/FullReloadLink";

const navigation = [
  { href: "/about", label: "About", active: ["/about", "/works", "/gallery", "/illustration", "/artist"] },
  { href: "/programs", label: "Program", active: ["/programs"] },
  { href: "/beyond", label: "Beyond the Canvas", active: ["/beyond", "/journal", "/journey", "/people", "/notes"] },
  { href: "/shop", label: "Shop", active: ["/shop"] }
];

// 모바일 메뉴 하단에만 노출되는 신청 CTA (데스크톱 인라인 내비에서는 CSS로 숨김).
const menuInquiry = { href: "/programs/seasonal#program-inquiry", label: "프로그램 신청 문의" };

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (prefixes: string[]) =>
    prefixes.some((prefix) => prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`));

  return (
    <>
      <a className="skip-link" href="#main">본문으로 바로가기</a>
      <header className="site-header" id="top">
        <div className="header-inner">
          <FullReloadLink className="logo" href="/">BellaVi <span>Studio</span></FullReloadLink>
          <button className="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="메뉴 열기">
            <span /><span /><span />
          </button>
          <nav className="main-nav" id="main-nav" aria-label="주요 메뉴">
            {navigation.map((item) => (
              <FullReloadLink key={item.href} href={item.href} aria-current={isActive(item.active) ? "page" : undefined}>
                {item.label}
              </FullReloadLink>
            ))}
            <FullReloadLink className="main-nav-cta" href={menuInquiry.href}>
              {menuInquiry.label}
            </FullReloadLink>
          </nav>
        </div>
      </header>
    </>
  );
}
