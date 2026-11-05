"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Eye, EyeOff, Lock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { friendlyAuthError, type FriendlyAuthError } from "@/lib/auth-errors";

type LinkState = "checking" | "ready" | "expired";

function ExpiredLink({ message }: { message: string }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold-ink">
        <RotateCcw className="h-7 w-7" strokeWidth={2.2} />
      </span>
      <h1 className="display-3 mt-5">This link has expired.</h1>
      <p className="mx-auto mt-3 max-w-sm text-[0.82rem] leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Button asChild variant="gold" className="mt-6 w-full">
        <Link href="/forgot-password">
          Request a new link <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <Link
        href="/login"
        className="mt-4 inline-flex text-[0.62rem] font-semibold text-muted-foreground transition hover:text-gold"
      >
        Back to sign in
      </Link>
    </div>
  );
}

export function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [linkMessage, setLinkMessage] = useState(
    "Reset links are valid for a limited time and can only be used once. Request a fresh link and try again."
  );
  const [formError, setFormError] = useState<FriendlyAuthError | null>(null);

  useEffect(() => {
    let cancelled = false;

    const prepare = async () => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        if (!cancelled) {
          setLinkMessage("The account service is not configured. Please contact support@bengalot.com.");
          setLinkState("expired");
        }
        return;
      }

      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const errorCode =
        url.searchParams.get("error_code") ||
        hash.get("error_code") ||
        url.searchParams.get("error");
      const errorDescription =
        url.searchParams.get("error_description") || hash.get("error_description");

      if (errorCode || errorDescription) {
        if (!cancelled) {
          setLinkMessage(
            errorCode === "otp_expired" || /expired/i.test(errorDescription ?? "")
              ? "This reset link has expired or was already used. Request a new link below."
              : "This reset link is invalid. Request a new link below."
          );
          setLinkState("expired");
        }
        return;
      }

      const { data: existing } = await supabase.auth.getSession();
      if (cancelled) return;
      if (existing.session) {
        setLinkState("ready");
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (!error) {
          url.searchParams.delete("code");
          window.history.replaceState({}, "", `${url.pathname}${url.search}`);
          setLinkState("ready");
          return;
        }
      }

      const { data: after } = await supabase.auth.getSession();
      if (cancelled) return;
      if (after.session) {
        setLinkState("ready");
        return;
      }
      setLinkMessage(
        "This reset link has expired or was already used. Request a new link below."
      );
      setLinkState("expired");
    };

    void prepare();
    return () => {
      cancelled = true;
    };
  }, []);

  if (linkState === "checking") {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-indigo/20 bg-indigo/[0.06] text-indigo">
          <Lock className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <h1 className="display-3 mt-5">Checking your link.</h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.82rem] leading-relaxed text-muted-foreground">
          One moment while we verify this password-reset link.
        </p>
      </div>
    );
  }

  if (linkState === "expired") {
    return <ExpiredLink message={linkMessage} />;
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-jade/30 bg-jade/10 text-jade">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="display-3 mt-5">Password updated.</h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.82rem] leading-relaxed text-muted-foreground">
          Your new password is set. Sign in and pick up where you left off.
        </p>
        <Button asChild variant="gold" className="mt-6 w-full">
          <Link href="/login">
            Sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow text-indigo">A fresh start</p>
      <h1 className="display-3 mt-3">Set a new password.</h1>
      <p className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
        Choose something memorable and secure. At least 8 characters is best.
      </p>

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
          if (password.length < 8) {
            toast.error("Use at least 8 characters.");
            return;
          }
          if (password !== confirm) {
            toast.error("The passwords do not match.");
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
          const { error } = await supabase.auth.updateUser({ password });
          setLoading(false);
          if (error) {
            const friendly = friendlyAuthError(error.message);
            if (/session|expired|jwt|token/i.test(error.message)) {
              setLinkMessage(friendly.description);
              setLinkState("expired");
            } else {
              setFormError(friendly);
              toast.error(friendly.title, { description: friendly.description });
            }
            return;
          }
          setDone(true);
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
          {loading ? "Updating…" : "Update password"} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
