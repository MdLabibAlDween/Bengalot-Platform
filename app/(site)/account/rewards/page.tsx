import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RewardsView } from "@/components/account/rewards-view";
import { getRewardsConfig } from "@/lib/account-db";

export const metadata: Metadata = {
  title: "Rewards",
  robots: { index: false, follow: false },
};

export default async function RewardsPage() {
  const config = await getRewardsConfig();
  if (!config.enabled) notFound();
  return <RewardsView />;
}
