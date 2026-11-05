import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { AccountNav } from "@/components/account/account-nav";
import { SignOutButton } from "@/components/account/sign-out-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My account",
  description: "Your Bengalot account, orders, wishlist and preferences.",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/login");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const admin = createAdminSupabaseClient();
  const { data: profile } = admin
    ? await admin
        .from("profiles")
        .select("full_name,email,phone")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "friend";
  const firstName = name.split(/\s+/)[0];
  const email = profile?.email || user.email || "";
  const phone = profile?.phone || user.user_metadata?.phone || "";
  const ordersCount = admin
    ? (
        await admin
          .from("orders")
          .select("id", { count: "exact", head: true })
          .or(`email.eq.${email || "none"},phone.eq.${phone || "none"}`)
      ).count ?? 0
    : 0;

  return (
    <>
      <section className="border-b border-[var(--border)] bg-[linear-gradient(120deg,var(--background)_0%,var(--color-indigo-tint)_55%,var(--surface-2)_100%)]">
        <div className="container-luxe py-5 md:py-6">
          <Breadcrumbs items={[{ label: "My account" }]} />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 font-display text-base text-indigo">
                {initials(name)}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo">
                  My account
                </p>
                <h1 className="mt-0.5 font-display text-[1.7rem] leading-none">
                  Hello, {firstName}.
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{email}</span>
                  {phone && <span>{phone}</span>}
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold" /> Saltha, Faridpur
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                {ordersCount} {ordersCount === 1 ? "order" : "orders"}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </section>

      <div className="container-luxe py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          <AccountNav />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
}
