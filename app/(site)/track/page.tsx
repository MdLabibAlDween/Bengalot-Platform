import type { Metadata } from "next";
import { TrackView } from "@/components/storefront/track-view";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Track your Bengalot order with your order number and phone. Live updates from our atelier to your door.",
  alternates: { canonical: "https://bengalot.com/track" },
  robots: { index: false, follow: false },
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; phone?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/50">
        <div className="container-luxe py-3">
          <Breadcrumbs items={[{ label: "Track order" }]} />
        </div>
      </div>
      <TrackView initialOrder={params.order} initialPhone={params.phone} />
    </>
  );
}
