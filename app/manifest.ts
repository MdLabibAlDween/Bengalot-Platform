import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bengalot — Premium Fashion from Bengal",
    short_name: "Bengalot",
    description:
      "Premium fashion from Bengal. Heirloom craft, modern silhouettes and honest materials — delivered across Bangladesh.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7EF",
    theme_color: "#FBF7EF",
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
