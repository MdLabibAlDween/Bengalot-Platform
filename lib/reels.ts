import { SITE } from "./constants";
import { STORE_SETTINGS } from "./settings";
import type { Reel, ReelPlatform } from "./types";

/**
 * Homepage reels.
 *
 * The preview runs on these local records. Once the admin shell is connected,
 * this list should be hydrated from `public.reels` (see
 * supabase/migrations/20261103000100_reels.sql).
 *
 * A reel can be:
 *   - a direct video upload (`platform: "file"`, `videoUrl` = storage URL),
 *   - an Instagram reel/post,
 *   - a YouTube video/Short,
 *   - a TikTok video.
 *
 * To attach a live reel, paste the public post URL into `videoUrl`. The
 * platform is detected from the URL, so `platform` is only a fallback. Keep
 * `watchUrl` pointing at the original post or your profile.
 *
 * Example:
 *   videoUrl: "https://www.instagram.com/reel/ABC123xyz/",
 *   watchUrl: "https://www.instagram.com/p/ABC123xyz/",
 *   productSlug: "midnight-oversized-tee",
 *
 * When `videoUrl` is present the storefront opens an in-page player. Until
 * then, `watchUrl` keeps the card useful by linking to the platform profile.
 */
export const reels: Reel[] = [
  {
    id: "jamdani-in-motion",
    title: "The jamdani, in motion",
    caption: "A heirloom saree, caught mid-step.",
    platform: "instagram",
    watchUrl: SITE.socials.instagram,
    productSlug: "heirloom-jamdani-saree",
    status: "published",
    isDemo: true,
    sort: 10,
  },
  {
    id: "midnight-in-stride",
    title: "Midnight, in stride",
    caption: "The Royal Nocturne panjabi on the move.",
    platform: "youtube",
    watchUrl: SITE.socials.youtube,
    productSlug: "royal-nocturne-panjabi",
    status: "published",
    isDemo: true,
    sort: 20,
  },
  {
    id: "rosewood-in-step",
    title: "Rosewood, in step",
    caption: "Handloom kurti, cut for the everyday.",
    platform: "instagram",
    watchUrl: SITE.socials.instagram,
    productSlug: "rosewood-handloom-kurti",
    status: "published",
    isDemo: true,
    sort: 30,
  },
  {
    id: "golden-hour-carried",
    title: "Golden hour, carried",
    caption: "The jute tote, from Saltha to the city.",
    platform: "tiktok",
    watchUrl: SITE.socials.tiktok,
    productSlug: "golden-hour-jute-tote",
    status: "published",
    isDemo: true,
    sort: 40,
  },
];

export const publishedReels = reels
  .filter((reel) => reel.status === "published")
  .filter((reel) => !STORE_SETTINGS.hideDemoContent || !reel.isDemo)
  .sort((a, b) => a.sort - b.sort);

export type ReelEmbed = {
  kind: "iframe" | "video";
  src: string;
};

const directVideoPattern = /\.(mp4|webm|mov|m4v)(?:\?.*)?$/i;

export function detectReelPlatform(url: string): ReelPlatform | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
    if (host === "youtube.com" || host === "youtu.be" || host.endsWith(".youtube.com")) {
      return "youtube";
    }
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
    if (directVideoPattern.test(url)) return "file";
  } catch {
    /* Fall through to null for pasted share text without a host. */
  }
  return null;
}

function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] || null;
    }
    if (parsed.pathname.startsWith("/live/")) {
      return parsed.pathname.split("/")[2] || null;
    }
    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }
  } catch {
    // Fall through to the regex for pasted share text.
  }

  return (
    url.match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{6,})/)?.[1] ??
    null
  );
}

/**
 * Turns a reel record into something the homepage dialog can render.
 * Returns null when the URL is not a supported embed or direct video.
 */
export function getReelEmbed(reel: Reel): ReelEmbed | null {
  const url = reel.videoUrl?.trim();
  if (!url) return null;

  const platform = detectReelPlatform(url) ?? reel.platform;

  if (platform === "file" || directVideoPattern.test(url)) {
    return { kind: "video", src: url };
  }

  if (platform === "youtube") {
    const id = youtubeId(url);
    return id
      ? {
          kind: "iframe",
          src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        }
      : null;
  }

  if (platform === "instagram") {
    const match = url.match(/instagram\.com\/(reel|reels|p|tv)\/([^/?#]+)/i);
    if (!match) return null;
    const type = match[1].toLowerCase() === "reels" ? "reel" : match[1].toLowerCase();
    return {
      kind: "iframe",
      src: `https://www.instagram.com/${type}/${match[2]}/embed/`,
    };
  }

  if (platform === "tiktok") {
    const match = url.match(/tiktok\.com\/(?:@[^/]+\/video|v)\/(\d+)/i);
    return match
      ? {
          kind: "iframe",
          src: `https://www.tiktok.com/embed/v2/${match[1]}`,
        }
      : null;
  }

  return null;
}
