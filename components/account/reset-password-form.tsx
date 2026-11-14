"use client";

import { Check, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return;
        if (event === "PASSWORD_RECOVERY" || session) {
          setReady(true);
          setChecking(false);
        }
      },
    );

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) setReady(true);
      setChecking(false);
    });

    const timer = window.setTimeout(() => {
      if (!cancelled) setChecking(false);
    }, 2500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      router.refresh();
      router.push("/account");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The password could not be changed. Request a new link.",
      );
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-cream px-6 py-12 text-[0.72rem] text-muted">
        <Loader2 className="size-4 animate-spin text-teal" aria-hidden="true" />
        Checking your reset link…
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-line bg-cream px-6 py-10 text-center">
        <p className="font-display text-2xl text-ink">This link has expired.</p>
        <p className="mx-auto mt-2 max-w-sm text-[0.76rem] leading-relaxed text-muted">
          Reset links can only be used once. Request a fresh link from your
          account page after signing in, or contact support.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/login" className="btn btn-primary btn-sm">
            Back to sign in
          </Link>
          <Link href="/contact" className="btn btn-outline btn-sm">
            Contact support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="field-label">
          New password
        </label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="field !pl-10 !pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="field-label">
          Repeat password
        </label>
        <input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Same password again"
          className="field"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-coral/30 bg-coral/[0.08] px-3.5 py-2.5 text-[0.72rem] font-medium text-coral-deep"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-lg w-full"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="size-4" aria-hidden="true" />
        )}
        {loading ? "Saving your password" : "Save new password"}
      </button>
    </form>
  );
}
