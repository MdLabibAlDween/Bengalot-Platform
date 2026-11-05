import Link from "next/link";
import { CreditCard, Gift, ReceiptText } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { GiftCardsManager } from "@/components/admin/gift-cards-manager";
import { AdminSettingsForm } from "@/components/admin/settings-form";
import { getFeatureFlags, getGiftCardSettings } from "@/lib/admin/settings";
import { requireAdminPageRole } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function AdminGiftCardsPage() {
  await requireAdminPageRole(["super_admin", "manager"]);
  const admin = createAdminSupabaseClient();
  const [settings, features, cards, requests, transactions] = await Promise.all([
    getGiftCardSettings(),
    getFeatureFlags(),
    admin ? admin.from("gift_cards").select("*").order("created_at", { ascending: false }).limit(500) : { data: [] },
    admin ? admin.from("gift_card_requests").select("*").order("created_at", { ascending: false }).limit(200) : { data: [] },
    admin ? admin.from("gift_card_transactions").select("*").order("created_at", { ascending: false }).limit(100) : { data: [] },
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Revenue"
        title="Gift cards"
        description="Issue cards, manage requests, track balances and configure how gift cards are sold and delivered."
      >
        <Link
          href="/gift-cards"
          target="_blank"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
        >
          View gift-card page
        </Link>
      </AdminPageHeader>

      <GiftCardsManager
        initial={{
          cards: cards.data ?? [],
          requests: requests.data ?? [],
          transactions: transactions.data ?? [],
        }}
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard
          title="Gift-card product settings"
          description="These values drive the storefront page, home section, checkout field and customer-facing wording."
        >
          <AdminSettingsForm
            settingKey="gift_card_settings"
            initialValue={settings as unknown as Record<string, unknown>}
            fields={[
              {
                path: "enabled",
                label: "Gift cards enabled",
                type: "boolean",
                help: "Turning this off hides the home section, page and checkout field.",
              },
              {
                path: "mode",
                label: "Current mode",
                type: "select",
                options: [
                  { value: "physical", label: "Physical card · Cash on Delivery" },
                  { value: "virtual", label: "Virtual code · pay online first" },
                ],
                help: "Physical is the safe default while COD is the only live payment method.",
              },
              {
                path: "virtualEnabled",
                label: "Allow virtual gift cards",
                type: "boolean",
                help: "Keep off until bKash or another online payment is configured.",
              },
              {
                path: "denominations",
                label: "Preset amounts (৳)",
                type: "list",
                help: "Comma-separated. Example: 1000, 2000, 5000, 10000",
              },
              { path: "minAmount", label: "Minimum custom amount (৳)", type: "number" },
              { path: "maxAmount", label: "Maximum custom amount (৳)", type: "number" },
              { path: "expiryMonths", label: "Validity (months)", type: "number" },
              {
                path: "deliveryMethods",
                label: "Delivery methods",
                type: "list",
                help: "Comma-separated: whatsapp, email. Physical cards can also be collected with the order.",
              },
              { path: "physicalNote", label: "Physical-card note", type: "textarea" },
              { path: "virtualNote", label: "Virtual-card note", type: "textarea" },
            ]}
          />
        </AdminCard>

        <div className="space-y-4">
          <AdminCard title="How the modes behave" description="A quick guardrail for the team.">
            <div className="space-y-3 text-[0.7rem] leading-relaxed text-muted-foreground">
              <div className="rounded-xl border border-jade/20 bg-jade/[0.04] p-3">
                <p className="flex items-center gap-2 font-semibold text-jade">
                  <ReceiptText className="h-4 w-4" /> Physical · COD
                </p>
                <p className="mt-1">
                  The card is prepared and sent with the order. Payment is collected by cash
                  on delivery. The code is issued after the team confirms the order.
                </p>
              </div>
              <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-3">
                <p className="flex items-center gap-2 font-semibold text-gold-ink">
                  <CreditCard className="h-4 w-4" /> Virtual · pay first
                </p>
                <p className="mt-1">
                  Requires bKash or another online gateway. The code is issued only after
                  payment succeeds. Keep this off until the gateway is configured.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] p-3">
                <p className="flex items-center gap-2 font-semibold">
                  <Gift className="h-4 w-4 text-magenta" /> Checkout redemption
                </p>
                <p className="mt-1">
                  The checkout field is shown only when the gift-card feature is on. Gift-card
                  records remain in Supabase and are never listed publicly.
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Feature switch" description="This master switch sits in Pages & features.">
            <div className="rounded-xl bg-[var(--muted)] p-4">
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Storefront
              </p>
              <p className="mt-1 font-display text-2xl">
                {features.giftCards ? "Gift cards are live" : "Gift cards are hidden"}
              </p>
              <Link href="/admin/pages" className="mt-3 inline-block text-[0.62rem] font-bold uppercase tracking-[0.1em] text-indigo">
                Open feature switches →
              </Link>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
