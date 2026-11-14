import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your Bengalot account and keep your learning tools in one place.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell
      eyebrow="A room of your own"
      title={
        <>
          Make room for{" "}
          <span className="display-italic text-teal">a better week.</span>
        </>
      }
      description="One account for your digital resources, orders and the small tools you return to. No noise, no endless settings."
    >
      <RegisterForm nextPath={next?.startsWith("/") ? next : undefined} />
    </AuthShell>
  );
}
