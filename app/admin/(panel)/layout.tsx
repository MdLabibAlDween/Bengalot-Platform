import Link from "next/link";
import { DatabaseZap } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin/auth";
import { getIntegrationSecretStatus, getIntegrationsConfig } from "@/lib/admin/settings";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function ConnectionRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-lg rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 text-center shadow-xl">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-saffron/15 text-gold-ink">
          <DatabaseZap className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-3xl">Connect Supabase first.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Add the four Supabase keys and the application encryption key to{" "}
          <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs">.env.local</code>,
          then reload this page.
        </p>
        <Link
          href="/admin/setup"
          className="cta-primary mt-5 inline-flex h-10 items-center rounded-full px-5 text-xs font-bold uppercase tracking-[0.1em]"
        >
          Go to first-run setup
        </Link>
      </div>
    </div>
  );
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const context = await requireAdminPage();
  if (!context.configured) return <ConnectionRequired />;

  const admin = createAdminSupabaseClient();
  const [integrations, secretStatus, pendingOrders, contactInbox, supportInbox, returnInbox, giftRequests, lowStock] =
    admin
      ? await Promise.all([
          getIntegrationsConfig(),
          getIntegrationSecretStatus(),
          admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
          admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
          admin.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
          admin.from("return_requests").select("id", { count: "exact", head: true }).eq("status", "requested"),
          admin.from("gift_card_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
          admin
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("status", "published")
            .lte("stock", 5),
        ])
      : [
          { enabled: false } as never,
          {
            smtpPassword: false,
            smsApiKey: false,
            steadfastApiKey: false,
            steadfastSecretKey: false,
            steadfastWebhookSecret: false,
          },
          { count: 0 },
          { count: 0 },
          { count: 0 },
          { count: 0 },
          { count: 0 },
          { count: 0 },
        ];

  return (
    <AdminShell
      profile={{
        email: context.user.email ?? context.profile.email,
        full_name: context.profile.full_name,
        role: context.profile.role,
      }}
      badges={{
        orders: pendingOrders.count ?? 0,
        inbox:
          (contactInbox.count ?? 0) +
          (supportInbox.count ?? 0) +
          (returnInbox.count ?? 0),
        giftCards: giftRequests.count ?? 0,
        stock: lowStock.count ?? 0,
      }}
      system={{
        supabase: true,
        discord: Boolean((integrations as { discord?: { enabled?: boolean } }).discord?.enabled),
        smtp: Boolean(
          (integrations as { smtp?: { enabled?: boolean } }).smtp?.enabled &&
            secretStatus.smtpPassword
        ),
        steadfast: Boolean(
          (integrations as { steadfast?: { enabled?: boolean } }).steadfast?.enabled &&
            secretStatus.steadfastApiKey &&
            secretStatus.steadfastSecretKey
        ),
        bkash: Boolean((integrations as { bkash?: { enabled?: boolean } }).bkash?.enabled),
      }}
    >
      {children}
    </AdminShell>
  );
}
