import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegacyPage } from "@/components/LegacyPage";
import { metadataFor, type LegacyPageName } from "@/lib/legacy-pages";

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
  const page = pageFromSlug((await params).slug);
  return page ? metadataFor(page) : { title: "페이지를 찾을 수 없습니다. | BellaVi Studio" };
}

export default async function Page({ params }: PageProps) {
  const page = pageFromSlug((await params).slug);
  if (!page) notFound();

  return <LegacyPage page={page} />;
}
