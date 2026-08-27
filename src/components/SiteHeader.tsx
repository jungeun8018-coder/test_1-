"use client";

import { usePathname } from "next/navigation";

import { FullReloadLink } from "@/components/FullReloadLink";

const navigation = [
  { href: "/", label: "Home", active: ["/"] },
  { href: "/about", label: "About", active: ["/about"] },
  { href: "/works", label: "Works", active: ["/works", "/gallery", "/illustration"] },
  { href: "/programs", label: "Programs", active: ["/programs"] },
  { href: "/shop", label: "Shop", active: ["/shop"] },
  { href: "/beyond", label: "Beyond the Canvas", active: ["/beyond", "/journal", "/journey", "/people", "/notes"] },
  { href: "/contact", label: "Contact", active: ["/contact"] }
];

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
          </nav>
        </div>
      </header>
    </>
  );
}
