"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { friendlyAuthError, type FriendlyAuthError } from "@/lib/auth-errors";

export function ForgotForm({ emailEnabled = true }: { emailEnabled?: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<FriendlyAuthError | null>(null);
  const [resendError, setResendError] = useState<FriendlyAuthError | null>(null);

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-jade/30 bg-jade/10 text-jade">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="display-3 mt-5">Check your inbox.</h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.82rem] leading-relaxed text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>,
          we have sent a secure reset link. It expires in 30 minutes. Check spam or junk if
          it has not arrived within a minute.
        </p>
        {resendError && (
          <p role="alert" className="mx-auto mt-3 max-w-sm rounded-lg border border-rosewood/25 bg-rosewood/[0.05] px-3 py-2 text-[0.62rem] leading-relaxed text-muted-foreground">
            <strong className="text-rosewood">{resendError.title}.</strong>{" "}
            {resendError.description}
          </p>
        )}
        <Button asChild variant="gold" className="mt-6 w-full">
          <Link href="/login">
            Back to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <button
          type="button"
          onClick={async () => {
            setResendError(null);
            const supabase = createBrowserSupabaseClient();
            if (!supabase) {
              const friendly = friendlyAuthError("network");
              setResendError(friendly);
              toast.error(friendly.title, { description: friendly.description });
              return;
            }
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) {
              const friendly = friendlyAuthError(error.message);
              setResendError(friendly);
              toast.error(friendly.title, { description: friendly.description });
            } else {
              toast.success("Reset link sent again", {
                description: "Check your inbox, spam and junk folder.",
              });
            }
          }}
          className="mt-3 text-[0.62rem] font-semibold text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
        >
          Didn&apos;t receive it? Send again
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow text-indigo">Password help</p>
      <h1 className="display-3 mt-3">Forgot password?</h1>
      <p className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
        Enter the email on your account and we&apos;ll send a secure link to choose a new
        password.
      </p>

      {!emailEnabled && (
        <div className="mt-5 rounded-xl border border-gold/30 bg-gold/[0.06] px-3.5 py-3 text-[0.66rem] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Password reset opens soon.</strong> We are
          finishing the email service. Please contact support@bengalot.com if you need help
          signing in.
        </div>
      )}

      {formError && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rosewood/30 bg-rosewood/[0.06] px-3.5 py-3 text-[0.66rem] leading-relaxed text-muted-foreground"
        >
          <strong className="text-rosewood">{formError.title}.</strong>{" "}
          {formError.description}
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setFormError(null);
          if (!emailEnabled) {
            toast.error("Password reset is opening soon.", {
              description: "Please contact support@bengalot.com for help signing in.",
            });
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
          }
          const supabase = createBrowserSupabaseClient();
          if (!supabase) {
            const friendly = friendlyAuthError("network");
            setFormError(friendly);
            toast.error(friendly.title, { description: friendly.description });
            return;
          }
          setLoading(true);
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          setLoading(false);
          if (error) {
            const friendly = friendlyAuthError(error.message);
            setFormError(friendly);
            toast.error(friendly.title, { description: friendly.description });
            return;
          }
          setSent(true);
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <Label htmlFor="forgot-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10"
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={loading || !emailEnabled}
        >
          {!emailEnabled
            ? "Password reset opening soon"
            : loading
              ? "Sending…"
              : "Send reset link"}{" "}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-5 flex items-center justify-center gap-2 text-[0.62rem] font-semibold text-muted-foreground transition hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>
    </div>
  );
}
