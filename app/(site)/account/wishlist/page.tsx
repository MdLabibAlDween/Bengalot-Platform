import type { Metadata } from "next";
import { WishlistView } from "@/components/storefront/wishlist-view";

export const metadata: Metadata = {
  title: "My wishlist",
  robots: { index: false, follow: false },
};

export default function AccountWishlistPage() {
  return <WishlistView />;
}
