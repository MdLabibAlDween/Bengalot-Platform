import type { Metadata } from "next";

import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the Bengalot tools in your bag.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CartPage />;
}
