import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/dashboard/", "/settings/", "/profile/", "/notifications/", "/community/new-thread", "/*?*page=", "/*?*search="] },
      { userAgent: ["GPTBot", "CCBot", "anthropic-ai"], disallow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}