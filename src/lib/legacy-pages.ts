import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

export type LegacyPageName =
  | "index.html"
  | "about.html"
  | "teacher.html"
  | "works.html"
  | "gallery.html"
  | "illustration.html"
  | "programs.html"
  | "program-seasonal.html"
  | "program-postcard.html"
  | "program-calendar.html"
  | "program-community.html"
  | "shop.html"
  | "beyond.html"
  | "journal.html"
  | "journey.html"
  | "people.html"
  | "notes.html"
  | "contact.html";

type PageDefinition = {
  title: string;
  description: string;
  bodyClass: string;
};

export const pageDefinitions: Record<LegacyPageName, PageDefinition> = {
  "index.html": {
    title: "BellaVi Studio | 좋아하는 것을 오래 잃지 않는 삶",
    description: "좋아하는 것을 발견하고, 오래 품으며 자신만의 모습으로 살아가는 시간을 함께합니다.",
    bodyClass: "portfolio-site"
  },
  "about.html": {
    title: "About | BellaVi Studio",
    description: "BellaVi Studio가 예술을 통해 이어가는 철학과 방향을 소개합니다.",
    bodyClass: "portfolio-site"
  },
  "teacher.html": {
    title: "Artist | BellaVi Studio",
    description: "예술가이자 미술교육가 박정은의 작품과 미술교육 활동을 소개합니다.",
    bodyClass: "portfolio-site"
  },
  "works.html": {
    title: "Works | BellaVi Studio",
    description: "BellaVi Studio의 Fine Art, Illustration, Art & Education 포트폴리오",
    bodyClass: "portfolio-site works-page"
  },
  "gallery.html": {
    title: "Gallery | BellaVi Studio",
    description: "박정은 작가의 순수회화와 개인 작품",
    bodyClass: "portfolio-site"
  },
  "illustration.html": {
    title: "Illustration | BellaVi Studio",
    description: "BellaVi Studio 일러스트 포트폴리오와 작업 문의",
    bodyClass: "portfolio-site"
  },
  "programs.html": {
    title: "Programs | BellaVi Studio",
    description: "계절과 그림, 삶의 취향을 천천히 발견하고 나의 그림으로 결과물을 만드는 BellaVi Studio 프로그램",
    bodyClass: "portfolio-site programs-site"
  },
  "program-seasonal.html": {
    title: "계절 드로잉 — 취향한점 | BellaVi Studio",
    description: "일상과 계절 속에서 나만의 취향을 발견하고 기록하는 BellaVi Studio의 계절 드로잉 — 취향한점",
    bodyClass: "portfolio-site program-detail-site"
  },
  "program-postcard.html": {
    title: "나의 그림으로 만드는 엽서 | BellaVi Studio",
    description: "참여자가 직접 그린 자신의 그림을 실제 엽서로 완성하는 BellaVi Studio 3개월 프로그램",
    bodyClass: "portfolio-site program-detail-site"
  },
  "program-calendar.html": {
    title: "나의 그림으로 만드는 캘린더 | BellaVi Studio",
    description: "참여자가 직접 그린 계절의 그림을 모아 자신만의 탁상용 캘린더를 만드는 BellaVi Studio 6개월 프로그램",
    bodyClass: "portfolio-site program-detail-site"
  },
  "program-community.html": {
    title: "Community | BellaVi Studio",
    description: "계절의 경험과 서로의 그림을 1년 동안 함께 이어가는 BellaVi Studio 커뮤니티",
    bodyClass: "portfolio-site program-detail-site community-site"
  },
  "shop.html": {
    title: "Shop | BellaVi Studio",
    description: "BellaVi Studio의 그림과 계절을 일상 가까이에서 만나는 작은 아트숍",
    bodyClass: "portfolio-site shop-site"
  },
  "beyond.html": {
    title: "Beyond the Canvas | BellaVi Studio",
    description: "예술과 일상에서 발견한 생각과 이야기를 기록하는 BellaVi Studio의 아카이브",
    bodyClass: "portfolio-site beyond-page"
  },
  "journal.html": {
    title: "Journal | BellaVi Studio",
    description: "책과 영화, 공연과 음악에서 오래 마음에 남은 것을 기록하는 BellaVi Journal",
    bodyClass: "portfolio-site journal-page"
  },
  "journey.html": {
    title: "Art Journey | BellaVi Studio",
    description: "여행과 전시, 일상에서 오래 마음에 남은 장면을 담는 BellaVi Studio 사진 아카이브",
    bodyClass: "portfolio-site journey-page"
  },
  "people.html": {
    title: "People | BellaVi Studio",
    description: "수업과 강연, 함께 만드는 자리에서 사람을 만나며 발견한 이야기를 기록하는 BellaVi People",
    bodyClass: "portfolio-site people-page"
  },
  "notes.html": {
    title: "Notes | BellaVi Studio",
    description: "미술수업과 사람들, 삶에서 발견한 이야기를 기록하는 BellaVi Notes",
    bodyClass: "portfolio-site notes-page"
  },
  "contact.html": {
    title: "Contact | BellaVi Studio",
    description: "BellaVi Studio 작업 및 협업 문의",
    bodyClass: "portfolio-site"
  }
};

const routeMap: Record<string, string> = {
  "index.html": "/",
  "about.html": "/about",
  "teacher.html": "/artist",
  "works.html": "/works",
  "gallery.html": "/gallery",
  "illustration.html": "/illustration",
  "programs.html": "/programs",
  "program-seasonal.html": "/programs/seasonal",
  "program-postcard.html": "/programs/postcard",
  "program-calendar.html": "/programs/calendar",
  "program-community.html": "/programs/community",
  "program-adult-drawing.html": "/programs/postcard",
  "program-art-class.html": "/programs/calendar",
  "shop.html": "/shop",
  "beyond.html": "/beyond",
  "journal.html": "/journal",
  "journey.html": "/journey",
  "people.html": "/people",
  "notes.html": "/notes",
  "contact.html": "/contact"
};

function mapHref(href: string): string {
  if (href === "about.html#artist-educator") return "/artist#artist-practice";
  if (href.startsWith("#") || /^(?:https?:|mailto:|tel:)/.test(href)) return href;

  const [pathname, fragment] = href.split("#", 2);
  const destination = routeMap[pathname];
  if (!destination) return href;
  return fragment ? `${destination}#${fragment}` : destination;
}

export function getLegacyMain(page: LegacyPageName): string {
  const filePath = join(process.cwd(), "src", "content", "legacy-pages", page);
  const source = readFileSync(filePath, "utf8");
  const main = source.match(/<main\b[\s\S]*?<\/main>/i)?.[0];

  if (!main) throw new Error(`Could not find <main> in ${page}`);

  return main
    .replace(/href="([^"]+)"/g, (_, href: string) => `href="${mapHref(href)}"`)
    .replace(/(src|data-lightbox)="images\//g, '$1="/images/');
}

export function metadataFor(page: LegacyPageName): Metadata {
  const { title, description } = pageDefinitions[page];
  return { title, description };
}
