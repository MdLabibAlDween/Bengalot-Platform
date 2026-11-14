"use client";

import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Could not send the link.");
      setState("done");
      setMessage(
        data.message ??
          "If an account exists for that email, a reset link is on its way.",
      );
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Could not send the link.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="forgot-email" className="field-label">
          Email address
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="forgot-email"
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

      {message ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={`rounded-xl border px-3.5 py-2.5 text-[0.72rem] font-medium ${
            state === "error"
              ? "border-coral/30 bg-coral/[0.08] text-coral-deep"
              : "border-teal/20 bg-teal-soft/40 text-teal"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state === "loading"}
        className="btn btn-primary btn-lg w-full"
      >
        {state === "loading" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Mail className="size-4" aria-hidden="true" />
        )}
        {state === "loading" ? "Sending the link" : "Send reset link"}
      </button>

      <p className="text-center text-[0.68rem] text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-bold text-teal underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
