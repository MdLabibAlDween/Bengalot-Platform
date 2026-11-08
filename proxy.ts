import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request, NextResponse.next({ request }));
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
};
