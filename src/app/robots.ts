import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/account/", "/api/"],
    },
    sitemap: "https://visionbridge.ai/sitemap.xml",
  };
}
