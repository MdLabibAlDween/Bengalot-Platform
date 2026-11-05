import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { getIntegrationsConfig } from "@/lib/admin/settings";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Bengalot account.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const integrations = await getIntegrationsConfig();
  // Supabase Auth SMTP is configured on the Supabase server, not by the app SMTP.
  return <RegisterForm registrationEnabled={integrations.authEmailReady} />;
}
