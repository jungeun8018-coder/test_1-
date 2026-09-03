import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegacyPage } from "@/components/LegacyPage";
import { metadataFor, pageDefinitions, type LegacyPageName } from "@/lib/legacy-pages";

const routes: Record<string, LegacyPageName> = {
  "": "index.html",
  about: "about.html",
  artist: "teacher.html",
  works: "works.html",
  gallery: "gallery.html",
  illustration: "illustration.html",
  programs: "programs.html",
  "programs/seasonal": "program-seasonal.html",
  "programs/postcard": "program-postcard.html",
  "programs/calendar": "program-calendar.html",
  "programs/community": "program-community.html",
  shop: "shop.html",
  beyond: "beyond.html",
  journal: "journal.html",
  journey: "journey.html",
  people: "people.html",
  notes: "notes.html",
  contact: "contact.html"
};

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

function pageFromSlug(slug?: string[]): LegacyPageName | undefined {
  return routes[(slug ?? []).join("/")];
}

export function generateStaticParams() {
  return Object.keys(routes).map((route) => ({
    slug: route ? route.split("/") : undefined
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const page = pageFromSlug(slug);
  if (!page) return { title: "페이지를 찾을 수 없습니다. | BellaVi Studio" };

  // canonical / og:url 은 공식 도메인(metadataBase: https://bellavi-studio.com) 기준 절대 URL로 생성됩니다.
  const path = slug && slug.length > 0 ? `/${slug.join("/")}` : "/";
  const { title, description } = pageDefinitions[page];
  const ogImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "BellaVi Studio — Art for a Beautiful Life",
    type: "image/png"
  };

  return {
    ...metadataFor(page),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "BellaVi Studio",
      locale: "ko_KR",
      url: path,
      title,
      description,
      images: [ogImage]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url]
    }
  };
}

export default async function Page({ params }: PageProps) {
  const page = pageFromSlug((await params).slug);
  if (!page) notFound();

  return <LegacyPage page={page} />;
}
