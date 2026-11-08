/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServiceRoleKey, publicEnv } from "@/lib/env";

// The admin client intentionally bypasses generated database types. Table
// payloads are validated with Zod in the route handlers before they are used.
let adminClient: ReturnType<typeof createClient<any>> | undefined;

export function createSupabaseAdminClient() {
  if (!adminClient) {
    const client = createClient<any>(publicEnv.supabaseUrl, getServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    adminClient = client;
  }

  return adminClient;
}

