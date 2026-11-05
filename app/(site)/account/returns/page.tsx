import type { Metadata } from "next";
import { ReturnsView } from "@/components/account/returns-view";

export const metadata: Metadata = {
  title: "Returns & exchanges",
  robots: { index: false, follow: false },
};

export default function ReturnsPage() {
  return <ReturnsView />;
}
