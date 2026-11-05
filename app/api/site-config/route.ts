import { NextResponse } from "next/server";
import { getPublicSiteConfig, getRedirects } from "@/lib/admin/settings";

export async function GET() {
  const [config, redirects] = await Promise.all([getPublicSiteConfig(), getRedirects()]);
  return NextResponse.json(
    {
      ...config,
      redirects: redirects.filter((rule) => rule.enabled),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
