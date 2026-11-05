"use client";

import { useState } from "react";
import { Check, Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { useSiteConfig } from "@/lib/site-config-provider";

export function ContactForm() {
  const { profile } = useSiteConfig();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General question",
    message: "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please add your name, email and message.");
      return;
    }
    setSending(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, website: "" }),
    });
    const result = await response.json().catch(() => ({}));
    setSending(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not send your message.");
      return;
    }
    setSent(true);
    toast.success("Message received", {
      description: "We will reply within one working day.",
    });
  };

  if (sent) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-jade/30 bg-jade/10 text-jade">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <p className="mt-5 font-display text-3xl">Message received.</p>
        <p className="mx-auto mt-3 max-w-sm text-[0.8rem] leading-relaxed text-muted-foreground">
          Thank you, {form.name.split(" ")[0]}. Our team will reply within one working day.
          For urgent order questions, WhatsApp is fastest.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gold">
            <a href={`mailto:${profile.supportEmail || SITE.email}`}>
              <Mail className="h-4 w-4" /> Email us
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:underline"
        >
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <p className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-indigo">
        Write to us
      </p>
      <h2 className="mt-1 font-display text-2xl">What can we help with?</h2>
      <p className="mt-1.5 text-[0.72rem] leading-relaxed text-muted-foreground">
        Orders, fit advice, exchanges, wholesale — a real person reads every message.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Your name *</Label>
          <Input
            id="contact-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Full name"
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email *</Label>
          <Input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
          />
        </div>
        <div>
          <Label htmlFor="contact-subject">Subject</Label>
          <Select
            id="contact-subject"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
          >
            {[
              "General question",
              "Order status",
              "Fit & sizing",
              "Exchange or return",
              "Wholesale",
              "Something else",
            ].map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="contact-message">Message *</Label>
          <Textarea
            id="contact-message"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Tell us what you need — including your order number if relevant."
            className="min-h-[130px]"
          />
        </div>
        {/* honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-0 w-0 overflow-hidden opacity-0"
        />
      </div>

      <Button
        type="submit"
        variant="gold"
        className="mt-5 w-full sm:w-auto"
        disabled={sending}
      >
        {sending ? "Sending…" : "Send message"} <Send className="h-3.5 w-3.5" />
      </Button>
      <p className="mt-3 text-[0.56rem] leading-relaxed text-muted-foreground">
        Send us a message and we will get back to you. For urgent order questions, WhatsApp is fastest.
      </p>
    </form>
  );
}
