import { AdminPageHeader } from "@/components/admin/admin-ui";
import { AdminSettingsForm } from "@/components/admin/settings-form";
import { AdminCard } from "@/components/admin/admin-ui";
import { getSeoSettings, getStoreProfile } from "@/lib/admin/settings";
import { requireAdminPageRole } from "@/lib/admin/auth";

export default async function AdminSettingsPage() {
  await requireAdminPageRole(["super_admin", "manager"]);
  const [profile, seo] = await Promise.all([getStoreProfile(), getSeoSettings()]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Store profile"
        title="Settings"
        description="The identity, contact details and delivery defaults that flow through the storefront, invoices and notifications."
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminSettingsForm
          settingKey="store_profile"
          initialValue={profile as unknown as Record<string, unknown>}
          fields={[
            { path: "brandName", label: "Brand name" },
            { path: "legalName", label: "Legal name" },
            { path: "tagline", label: "Tagline" },
            { path: "address", label: "Business address" },
            { path: "whatsapp", label: "WhatsApp number" },
            { path: "supportEmail", label: "Support email", type: "email" },
            { path: "infoEmail", label: "Outgoing email", type: "email" },
            { path: "currency", label: "Currency" },
            { path: "deliveryInside", label: "Faridpur delivery (৳)", type: "number" },
            { path: "deliveryOutside", label: "Outside delivery (৳)", type: "number" },
            { path: "socials.facebook", label: "Facebook URL", type: "text" },
            { path: "socials.instagram", label: "Instagram URL", type: "text" },
            { path: "socials.youtube", label: "YouTube URL", type: "text" },
            { path: "socials.tiktok", label: "TikTok URL", type: "text" },
          ]}
        />

        <div className="space-y-4">
          <AdminCard
            title="SEO defaults"
            description="Used by the root metadata until a page provides its own values."
          >
            <AdminSettingsForm
              settingKey="seo_settings"
              initialValue={seo as unknown as Record<string, unknown>}
              columns={1}
              fields={[
                { path: "title", label: "Meta title" },
                { path: "description", label: "Meta description", type: "textarea" },
                { path: "ogImage", label: "Open Graph image URL" },
                { path: "analyticsId", label: "Analytics ID" },
                { path: "pixelId", label: "Facebook Pixel ID" },
              ]}
            />
          </AdminCard>

          <AdminCard
            title="Connection"
            description="This panel uses the Supabase Cloud project in .env.local. Public keys are safe in the browser; the service key never leaves the server."
          >
            <div className="space-y-2 text-[0.66rem] leading-relaxed text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-jade" />
                Supabase Auth connected
              </p>
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-jade" />
                RLS enabled on settings, media and redirects
              </p>
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-jade" />
                Secret encryption key configured
              </p>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
