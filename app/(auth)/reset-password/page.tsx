import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your Bengalot account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetForm />;
}
