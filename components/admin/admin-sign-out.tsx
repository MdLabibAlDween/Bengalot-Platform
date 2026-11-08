"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminSignOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="flex items-center gap-2 text-[0.64rem] font-semibold text-cream/40 transition-colors hover:text-cream disabled:opacity-50"
    >
      <LogOut className="size-3.5" aria-hidden="true" />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
