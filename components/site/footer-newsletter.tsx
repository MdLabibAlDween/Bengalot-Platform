"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Something went wrong");
      setState("done");
      setMessage(data.message ?? "You are on the list.");
      setEmail("");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  return (
    <div>
      <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-cream/75">
        A note worth opening
      </p>
      <p className="mt-3 max-w-xs font-display text-[1.45rem] leading-[1.15] tracking-[-0.025em] text-cream">
        One thoughtful email for a sharper week.
      </p>
      {state === "done" ? (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-butter/30 bg-butter/10 px-4 py-3 text-[0.78rem] text-butter">
          <span className="grid size-5 place-items-center rounded-full bg-butter text-navy">
            <Check className="size-3" aria-hidden="true" />
          </span>
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex items-center gap-2 rounded-full border border-cream/20 bg-cream/[0.06] p-1 pl-4 transition-colors focus-within:border-butter/60">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-9 min-w-0 flex-1 bg-transparent text-[0.82rem] text-cream outline-none placeholder:text-cream/60"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-butter text-navy transition-transform hover:scale-105 disabled:opacity-60"
              aria-label="Subscribe to the Bengalot note"
            >
              {state === "loading" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {state === "error" ? (
            <p className="mt-2 text-[0.7rem] text-butter/90">{message}</p>
          ) : (
            <p className="mt-2 text-[0.64rem] text-cream/60">
              No noise. Unsubscribe whenever you like.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
