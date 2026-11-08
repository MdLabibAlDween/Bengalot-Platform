/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";

/**
 * Public catalogue reads never need cookies. A short timeout keeps the
 * storefront rendering quickly even when the database is unreachable, and the
 * local snapshot in lib/data/snapshot.json is used as a fallback.
 */
export function createSupabasePublicClient() {
  return createClient<any>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.timeout(4500),
        }),
    },
  });
}


