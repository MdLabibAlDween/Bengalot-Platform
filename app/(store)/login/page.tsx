import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Bengalot learning library.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const current = await getCurrentUser();
  if (current) redirect(next?.startsWith("/") ? next : "/account");

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={
        <>
          Return to the{" "}
          <span className="display-italic text-teal">quiet part.</span>
        </>
      }
      description="Your digital library, order history and saved details are waiting exactly where you left them."
    >
      <LoginForm nextPath={next?.startsWith("/") ? next : undefined} />
    </AuthShell>
  );
}
