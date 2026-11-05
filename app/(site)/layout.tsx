import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { FloatingActions } from "@/components/site/floating-actions";
import { BottomNav } from "@/components/site/bottom-nav";
import { TawkChat } from "@/components/site/tawk-chat";
import { SiteConfigProvider } from "@/lib/site-config-provider";
import { getPublicSiteConfig } from "@/lib/admin/settings";
import { getSiteContent } from "@/lib/site-content";
import { getCatalogSnapshot } from "@/lib/taxonomy-db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [config, content, catalog] = await Promise.all([
    getPublicSiteConfig(),
    getSiteContent(),
    getCatalogSnapshot(),
  ]);

  return (
    <SiteConfigProvider
      value={{
        ...config,
        content,
        catalog: { ...catalog, loaded: true },
      }}
    >
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <FloatingActions />
      <BottomNav />
      <TawkChat />
    </SiteConfigProvider>
  );
}
