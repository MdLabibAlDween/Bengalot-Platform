"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        const supabase = createBrowserSupabaseClient();
        if (supabase) await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground transition hover:border-gold hover:text-gold disabled:opacity-50"
    >
      <LogOut className="h-3 w-3" /> {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
