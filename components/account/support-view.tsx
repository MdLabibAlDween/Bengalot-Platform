"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Send,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { AccountHeading } from "./account-heading";
import { SITE, WHATSAPP_LINK } from "@/lib/constants";
import { EmailLink, EmailText } from "@/components/site/email-display";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { cn } from "@/lib/utils";

type SupportMessage = {
  id: string;
  subject: string;
  message: string;
  order_no: string | null;
  status: "new" | "open" | "replied" | "closed";
  admin_note: string | null;
  created_at: string;
};

const statusTone: Record<string, string> = {
  new: "bg-magenta/10 text-magenta",
  open: "bg-indigo/10 text-indigo",
  replied: "bg-jade/10 text-jade",
  closed: "bg-[var(--muted)] text-muted-foreground",
};

export function SupportView() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [form, setForm] = useState({
    subject: "General question",
    orderNo: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const load = async () => {
    const response = await fetch("/api/account/support", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json().catch(() => ({}));
    if (Array.isArray(data.messages)) setMessages(data.messages);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.message.trim().length < 5) {
      toast.error("Please add a message.");
      return;
    }
    setSending(true);
    const response = await fetch("/api/account/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json().catch(() => ({}));
    setSending(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not send your message.");
      return;
    }
    toast.success("Message sent", {
      description: "Our team will reply within one working day.",
    });
    setForm({ subject: "General question", orderNo: "", message: "" });
    await load();
  };

  return (
    <div>
      <AccountHeading
        eyebrow="We're here"
        title="Support"
        description="A real person reads every message. For urgent questions, WhatsApp is fastest — usually under two hours."
        action={
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[var(--color-jade)] px-4 py-2.5 text-[0.56rem] font-bold uppercase tracking-[0.11em] text-white"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" /> Chat now
          </a>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-gold"
        >
          <WhatsAppIcon className="h-5 w-5 text-[var(--color-jade)]" />
          <p className="mt-3 text-[0.7rem] font-semibold">WhatsApp</p>
          <p className="mt-0.5 text-[0.62rem] text-muted-foreground">{SITE.whatsapp}</p>
          <p className="mt-2 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-gold-ink">
            Fastest
          </p>
        </a>
        <EmailLink
          email={SITE.email}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-gold"
        >
          <Mail className="h-5 w-5 text-gold" />
          <p className="mt-3 text-[0.7rem] font-semibold">Email</p>
          <p className="mt-0.5 truncate text-[0.62rem] text-muted-foreground">
            <EmailText email={SITE.email} fallback="Email support" />
          </p>
          <p className="mt-2 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Reply in 1 day
          </p>
        </EmailLink>
        <Link
          href="/contact"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-gold"
        >
          <MessageCircle className="h-5 w-5 text-indigo" />
          <p className="mt-3 text-[0.7rem] font-semibold">Contact form</p>
          <p className="mt-0.5 text-[0.62rem] text-muted-foreground">Orders, fit and wholesale</p>
          <p className="mt-2 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Inbox
          </p>
        </Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-indigo">
            Send a message
          </p>
          <h2 className="mt-1 font-display text-2xl">How can we help?</h2>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="support-subject">Subject</Label>
              <Select
                id="support-subject"
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
              >
                {[
                  "General question",
                  "Order status",
                  "Fit & sizing",
                  "Exchange or return",
                  "Delivery issue",
                  "Wholesale",
                ].map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="support-order">Order number (optional)</Label>
              <Input
                id="support-order"
                value={form.orderNo}
                onChange={(event) => setForm({ ...form, orderNo: event.target.value.toUpperCase() })}
                placeholder="BG-XXXX-XXXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="Tell us what you need…"
                className="min-h-32"
              />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={sending}>
              {sending ? "Sending…" : "Send message"} <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
                Your messages
              </p>
              <h2 className="mt-1 font-display text-xl">Support history</h2>
            </div>
            <span className="text-[0.52rem] text-muted-foreground">{messages.length} total</span>
          </div>
          {messages.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Ticket className="mx-auto h-6 w-6 text-muted-foreground/35" />
              <p className="mt-3 font-display text-xl">No messages yet.</p>
              <p className="mt-1 text-[0.64rem] text-muted-foreground">
                Send us a note and it will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-[480px] divide-y divide-[var(--border)] overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[0.7rem] font-semibold">{message.subject}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.44rem] font-bold uppercase tracking-[0.08em]",
                        statusTone[message.status]
                      )}
                    >
                      {message.status}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[0.62rem] leading-relaxed text-muted-foreground">
                    {message.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.52rem] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {new Date(message.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {message.order_no && <span className="font-mono">{message.order_no}</span>}
                    {message.status === "replied" && (
                      <span className="flex items-center gap-1 text-jade">
                        <CheckCircle2 className="h-3 w-3" /> Replied
                      </span>
                    )}
                  </div>
                  {message.admin_note && (
                    <p className="mt-2 rounded-lg bg-jade/[0.05] px-3 py-2 text-[0.6rem] text-muted-foreground">
                      {message.admin_note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
