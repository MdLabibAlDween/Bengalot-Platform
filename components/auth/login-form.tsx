"use client";

import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError || !data.user) {
        throw new Error("Email or password not recognised. Please try again.");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const isStaff =
        profile?.role === "staff" ||
        profile?.role === "admin" ||
        profile?.role === "owner";
      const safeNext =
        nextPath && nextPath.startsWith("/") ? nextPath : undefined;
      const destination = safeNext ?? (isStaff ? "/admin" : "/account");

      router.refresh();
      router.push(destination);
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="field-label">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="field !pl-10"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="field-label">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="mb-1.5 text-[0.6rem] font-semibold text-teal underline decoration-teal/30 underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
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
          ) : null}
          {loading ? "Signing you in" : "Sign in"}
        </button>
      </form>

      <div className="mt-5 flex items-center gap-2 text-[0.7rem] text-muted">
        New here?
        <Link
          href={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"}
          className="font-bold text-teal underline decoration-teal/30 underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
