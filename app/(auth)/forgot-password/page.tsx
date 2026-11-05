import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/forgot-form";
import { getIntegrationsConfig } from "@/lib/admin/settings";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Bengalot account password.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const integrations = await getIntegrationsConfig();
  return <ForgotForm emailEnabled={integrations.authEmailReady} />;
}
