"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewsletterForm({
  tone = "dark",
  className,
  buttonLabel = "Subscribe",
}: {
  tone?: "dark" | "light";
  className?: string;
  buttonLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const dark = tone === "dark";

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        const subscribed = email.trim();
        if (!subscribed) return;
        setSending(true);
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: subscribed, source: "website", website: "" }),
        });
        const result = await response.json().catch(() => ({}));
        setSending(false);
        if (!response.ok) {
          toast.error(result.error ?? "Could not subscribe you. Try again.");
          return;
        }
        setDone(true);
        setEmail("");
        toast.success("You are subscribed", {
          description: "Look out for our next letter soon.",
        });
      }}
    >
      {/* Honeypot — real implementation validates server-side too */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />
      <div
        className={cn(
          "flex flex-col gap-2 rounded-[22px] border p-2 transition focus-within:border-gold sm:flex-row sm:items-center sm:rounded-full",
          dark
            ? "border-ivory/15 bg-ivory/[0.06]"
            : "border-[var(--border)] bg-[var(--surface)]"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Mail
            className={cn(
              "ml-2 h-4 w-4 shrink-0",
              dark ? "text-ivory/40" : "text-muted-foreground"
            )}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            aria-label="Email address"
            className={cn(
              "h-10 min-w-0 flex-1 bg-transparent text-[0.82rem] outline-none",
              dark
                ? "text-ivory placeholder:text-ivory/35"
                : "text-foreground placeholder:text-muted-foreground/70"
            )}
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="cta-primary flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-[0.1em] disabled:opacity-60 sm:w-auto"
        >
          {done ? (
            <>
              <Check className="h-3.5 w-3.5" /> Subscribed
            </>
          ) : (
            <>
              {sending ? "Joining…" : buttonLabel} <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
      <p
        className={cn(
          "mt-3 text-xs leading-relaxed",
          dark ? "text-ivory/35" : "text-muted-foreground"
        )}
      >
        By subscribing you agree to our privacy policy. Unsubscribe anytime — no hard feelings.
      </p>
    </form>
  );
}
