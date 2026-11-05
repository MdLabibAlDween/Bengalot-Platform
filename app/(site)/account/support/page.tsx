import type { Metadata } from "next";
import { SupportView } from "@/components/account/support-view";

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false, follow: false },
};

export default function SupportPage() {
  return <SupportView />;
}
