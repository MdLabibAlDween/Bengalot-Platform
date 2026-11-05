import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { getIntegrationsConfig } from "@/lib/admin/settings";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Bengalot account.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const integrations = await getIntegrationsConfig();
  return <LoginForm phoneOtpEnabled={integrations.sms.enabled} />;
}
