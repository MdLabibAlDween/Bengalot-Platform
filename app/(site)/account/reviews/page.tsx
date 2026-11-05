import type { Metadata } from "next";
import { ReviewsView } from "@/components/account/reviews-view";

export const metadata: Metadata = {
  title: "My reviews",
  robots: { index: false, follow: false },
};

export default function AccountReviewsPage() {
  return <ReviewsView />;
}
