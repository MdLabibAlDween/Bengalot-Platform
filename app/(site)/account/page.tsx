import type { Metadata } from "next";
import { AccountOverview } from "@/components/account/overview-view";

export const metadata: Metadata = {
  title: "Account overview",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountOverview />;
}
