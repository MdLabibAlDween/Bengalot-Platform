import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/checkout", "/api", "/login", "/register"],
      },
    ],
    sitemap: "https://bengalot.com/sitemap.xml",
  };
}
