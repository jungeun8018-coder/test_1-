import type { NextConfig } from "next";

const redirects: Record<string, string> = {
  "/index.html": "/",
  "/about.html": "/about",
  "/teacher.html": "/artist",
  "/works.html": "/works",
  "/gallery.html": "/gallery",
  "/illustration.html": "/illustration",
  "/programs.html": "/programs",
  "/program-seasonal.html": "/programs/seasonal",
  "/program-postcard.html": "/programs/postcard",
  "/program-calendar.html": "/programs/calendar",
  "/program-community.html": "/programs/community",
  "/program-adult-drawing.html": "/programs/postcard",
  "/program-art-class.html": "/programs/calendar",
  "/shop.html": "/shop",
  "/beyond.html": "/beyond",
  "/journal.html": "/journal",
  "/journey.html": "/journey",
  "/people.html": "/people",
  "/notes.html": "/notes",
  "/contact.html": "/contact"
};

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    return Object.entries(redirects).map(([source, destination]) => ({
      source,
      destination,
      permanent: true
    }));
  }
};

export default nextConfig;
