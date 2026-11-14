import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/account/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="bg-cream py-16 sm:py-20">
      <div className="container-wide">
        <div className="mx-auto max-w-[30rem]">
          <Link
            href="/"
            className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-teal"
          >
            Bengalot
          </Link>
          <p className="eyebrow mt-6">Account recovery</p>
          <h1 className="display-lg mt-3 text-ink">
            Choose a new{" "}
            <span className="display-italic text-teal">password.</span>
          </h1>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
            Your library and order history stay attached to the same account.
          </p>
          <div className="mt-7">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
