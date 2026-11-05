import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { WishlistView } from "@/components/storefront/wishlist-view";

export const metadata: Metadata = {
  title: "Your wishlist",
  description: "The Bengalot pieces you have saved for later.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <>
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/50">
        <div className="container-luxe py-3">
          <Breadcrumbs items={[{ label: "Wishlist" }]} />
        </div>
      </div>
      <WishlistView />
    </>
  );
}
