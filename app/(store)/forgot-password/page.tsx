import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title={
        <>
          Find your way{" "}
          <span className="display-italic text-teal">back in.</span>
        </>
      }
      description="Enter the email on your Bengalot account and we will send a one-time link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
