/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<any>(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
    );
  }

  return browserClient;
}


