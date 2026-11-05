import { AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminSettingsForm } from "@/components/admin/settings-form";
import { getFeatureFlags, getPageVisibility } from "@/lib/admin/settings";

const featureLabels: Record<string, string> = {
  giftCards: "Gift cards",
  reels: "Model reels",
  lookbook: "Lookbook",
  offers: "Offers & campaigns",
  reviews: "Customer reviews",
  wishlist: "Wishlist",
  darkMode: "Dark-mode toggle",
  whatsapp: "Floating WhatsApp",
  newsletter: "Newsletter",
  search: "Search dialog",
  trackOrder: "Order tracking",
  account: "Customer account area",
  sizeGuide: "Size guide",
  cod: "Cash on delivery",
  bkash: "bKash checkout",
};

const pageLabels: Record<string, string> = {
  "/": "Home",
  "/shop": "Shop all",
  "/collections": "Collections index",
  "/lookbook": "Lookbook",
  "/offers": "Offers",
  "/gift-cards": "Gift cards",
  "/about": "About",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/track": "Track order",
  "/wishlist": "Wishlist",
  "/search": "Search",
  "/cart": "Cart",
  "/checkout": "Checkout",
};

export default async function AdminPagesPage() {
  const [features, pages] = await Promise.all([getFeatureFlags(), getPageVisibility()]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Storefront"
        title="Pages & features"
        description="Switch off any storefront feature or page without a deploy. Hidden features disappear from navigation and their routes return a tasteful unavailable state."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard
          title="Feature switches"
          description="These are the flags read by the storefront bridge."
        >
          <AdminSettingsForm
            settingKey="feature_flags"
            initialValue={features as unknown as Record<string, unknown>}
            columns={1}
            fields={Object.entries(features).map(([key]) => ({
              path: key,
              label: featureLabels[key] ?? key,
              type: "boolean" as const,
              help:
                key === "giftCards"
                  ? "Hides the gift-card page, home section and checkout redemption field."
                  : key === "bkash"
                    ? "Only enable after configuring bKash credentials in Integrations."
                    : undefined,
            }))}
          />
        </AdminCard>

        <AdminCard
          title="Page visibility"
          description="A hidden page is removed from navigation and protected by the page gate. The home page cannot be disabled while the storefront is live."
        >
          <AdminSettingsForm
            settingKey="page_visibility"
            initialValue={pages as unknown as Record<string, unknown>}
            columns={1}
            fields={Object.entries(pages).map(([path]) => ({
              path,
              label: `${pageLabels[path] ?? path}  ·  ${path}`,
              type: "boolean" as const,
            }))}
          />
        </AdminCard>
      </div>

      <div className="mt-4 rounded-[20px] border border-gold/25 bg-gold/[0.05] p-4 text-[0.66rem] leading-relaxed text-muted-foreground">
        Page visibility is stored in Supabase. The storefront request gate reads the same
        settings and redirects disabled routes to the home page. Keep the home page, cart and
        checkout enabled while accepting orders.
      </div>
    </div>
  );
}
