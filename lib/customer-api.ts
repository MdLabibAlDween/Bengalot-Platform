import "server-only";

import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CustomerContext =
  | { supabase: SupabaseClient; admin: SupabaseClient; user: User }
  | { error: NextResponse };

export async function requireCustomerApi(): Promise<CustomerContext> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      error: NextResponse.json({ error: "Account service is not configured." }, { status: 503 }),
    };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  const admin = createAdminSupabaseClient();
  if (!admin) {
    return { error: NextResponse.json({ error: "Storage is not configured." }, { status: 503 }) };
  }
  return { supabase, admin, user };
}
