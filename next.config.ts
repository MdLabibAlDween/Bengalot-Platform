import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : "";
  } catch {
    return "";
  }
})();

const productionSecurityHeaders =
  process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com https://embed.tawk.to https://*.tawk.to https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://*.tawk.to",
            `img-src 'self' data: blob: https: https://www.facebook.com https://www.google-analytics.com https://*.tawk.to https://cdn.jsdelivr.net ${supabaseOrigin} https://*.supabase.co`,
            "font-src 'self' data: https://*.tawk.to",
            `connect-src 'self' https://www.facebook.com https://connect.facebook.net https://www.google-analytics.com https://region1.google-analytics.com https://embed.tawk.to https://*.tawk.to wss://*.tawk.to https://cdn.jsdelivr.net ${supabaseOrigin} https://*.supabase.co`,
            `media-src 'self' blob: https: ${supabaseOrigin} https://*.supabase.co`,
            `frame-src 'self' https://www.youtube-nocookie.com https://www.instagram.com https://www.tiktok.com https://*.tawk.to ${supabaseOrigin}`,
            "worker-src 'self' blob:",
            "manifest-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      ]
    : [];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // Serve both /path and /path/ with 200 instead of permanent 308 redirects.
  // This also breaks old cached redirects that could bounce /shop -> /shop/.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...securityHeaders, ...productionSecurityHeaders],
      },
    ];
  },
  async redirects() {
    return [
      // Old collection routes → the new /collections/{slug} structure.
      { source: "/new-arrivals", destination: "/collections/new-arrivals", permanent: true },
      { source: "/best-sellers", destination: "/collections/best-sellers", permanent: true },
      { source: "/sale", destination: "/collections/sale", permanent: true },
      // Safe aliases for any legacy "edit" collection links.
      { source: "/edits/:slug", destination: "/collections/:slug", permanent: true },
      { source: "/edit/:slug", destination: "/collections/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
