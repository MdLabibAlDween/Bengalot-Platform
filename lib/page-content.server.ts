import "server-only";

import { cache } from "react";

import { normalisePageContent, defaultPageContent } from "@/lib/page-content";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const getPageContent = cache(async () => {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "page_content")
      .maybeSingle();

    if (error) throw error;
    return normalisePageContent(data?.value);
  } catch (error) {
    console.warn("Using default page content:", error);
    return defaultPageContent;
  }
});
