import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart-view";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your Bengalot bag and head to a secure checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/50">
        <div className="container-luxe py-3">
          <Breadcrumbs items={[{ label: "Your bag" }]} />
        </div>
      </div>
      <CartView />
    </>
  );
}
