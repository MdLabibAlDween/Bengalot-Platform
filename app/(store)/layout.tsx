import { AnnouncementBar } from "@/components/site/announcement-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getCatalog } from "@/lib/data/catalog";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [catalog, current] = await Promise.all([getCatalog(), getCurrentUser()]);

  return (
    <div id="top" className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[120] -translate-y-24 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-cream shadow-xl transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <SiteHeader
        categories={catalog.categories}
        products={catalog.products}
        user={
          current?.profile
            ? {
                name: current.profile.full_name ?? current.profile.email,
                role: current.profile.role,
              }
            : null
        }
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter categories={catalog.categories} />
    </div>
  );
}
