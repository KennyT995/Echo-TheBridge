import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/account/", "/api/"],
    },
    sitemap: "https://echo-the-bridge.com/sitemap.xml",
  };
}
