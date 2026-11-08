"use client";

import { Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strongEnough = password.length >= 8;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!accepted) {
      setError("Please accept the terms and privacy policy.");
      return;
    }
    if (!strongEnough) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = (await response.json()) as { message?: string; ok?: boolean };
      if (!response.ok) throw new Error(data.message ?? "Unable to create account.");
      if (!data.ok && data.message) throw new Error(data.message);

      router.refresh();
      router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/account");
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="field-label">
            Full name
          </label>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your name"
              className="field !pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="register-email" className="field-label">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="register-email"
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
          <label htmlFor="register-password" className="field-label">
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="register-password"
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
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={`h-1 flex-1 rounded-full ${
                    password.length === 0
                      ? "bg-sand"
                      : password.length >= 8 && bar < 3
                        ? "bg-teal"
                        : password.length >= 8
                          ? "bg-teal/40"
                          : bar < Math.ceil(password.length / 3)
                            ? "bg-coral/60"
                            : "bg-sand"
                  }`}
                />
              ))}
            </div>
            <span className="text-[0.56rem] text-muted">
              {password.length === 0
                ? "8+ characters"
                : strongEnough
                  ? "Good to go"
                  : "A little longer"}
            </span>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-[0.68rem] leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 size-3.5 shrink-0 accent-[var(--teal)]"
          />
          I agree to the{" "}
          <Link href="/terms" className="font-semibold text-ink underline underline-offset-2">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">
            privacy policy
          </Link>
          .
        </label>

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
          {loading ? "Creating your account" : "Create my account"}
        </button>
      </form>

      <p className="mt-5 text-[0.7rem] text-muted">
        Already have an account?{" "}
        <Link
          href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
          className="font-bold text-teal underline decoration-teal/30 underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
