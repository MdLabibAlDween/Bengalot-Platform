import type { Metadata } from "next";
import { OrderSuccessView } from "@/components/storefront/order-success-view";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Thank you for your Bengalot order.",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  return <OrderSuccessView orderNo={orderNo} />;
}
