import "server-only";

import { createClient } from "@supabase/supabase-js";

export function hasServiceRole() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createAdminSupabaseClient() {
  if (!hasServiceRole()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Catalogue and settings reads must reflect admin changes immediately.
        // Without this, Next caches Supabase GET responses in the build fetch
        // cache and deleted products can keep appearing on the storefront.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
