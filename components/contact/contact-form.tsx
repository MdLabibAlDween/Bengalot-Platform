"use client";

import { Check, Loader2, Send } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Message could not be sent.");
      setState("done");
      setMessage(data.message ?? "Thank you. We will be in touch soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Message could not be sent.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-[1.3rem] border border-teal/20 bg-teal-soft/40 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal text-cream">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <h3 className="mt-5 font-display text-2xl tracking-[-0.03em] text-ink">
          Message received.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[0.8rem] leading-relaxed text-ink-soft/75">
          {message}
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="btn btn-outline btn-sm mt-5"
        >
          Send another note
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Your name
          </label>
          <input
            id="contact-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="field"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="field-label">
          What is on your mind?
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="A question about a product, an order, or a custom request."
          className="field resize-y"
          required
        />
      </div>
      {message && state === "error" ? (
        <p className="rounded-lg border border-coral/30 bg-coral/[0.08] px-3 py-2 text-[0.7rem] text-coral-deep" role="alert">
          {message}
        </p>
      ) : null}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary">
        {state === "sending" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {state === "sending" ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
