import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/account",
          "/account/",
          "/cart",
          "/checkout",
          "/wishlist",
          "/order-success/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/track",
          "/search",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
