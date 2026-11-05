"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Gift,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccountHeading } from "./account-heading";
import { cn } from "@/lib/utils";

type NotificationKind = "order" | "account" | "offer" | "review" | "reward" | "gift_card" | "system";

type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

type Preferences = {
  order_updates: boolean;
  offers_email: boolean;
  offers_sms: boolean;
  back_in_stock: boolean;
  review_reminders: boolean;
  newsletter: boolean;
};

const typeIcon: Record<NotificationKind, typeof Package> = {
  order: Package,
  account: ShieldCheck,
  offer: Gift,
  review: Star,
  reward: Sparkles,
  gift_card: Gift,
  system: Bell,
};

const typeTone: Record<NotificationKind, string> = {
  order: "bg-indigo/10 text-indigo",
  account: "bg-jade/10 text-jade",
  offer: "bg-magenta/10 text-magenta",
  review: "bg-gold/10 text-gold",
  reward: "bg-gold/10 text-gold",
  gift_card: "bg-rosewood/10 text-rosewood",
  system: "bg-[var(--muted)] text-muted-foreground",
};

function when(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hours ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)} days ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-gold" : "bg-[var(--border)]",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/account/notifications", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        if (data.preferences) {
          setPreferences({
            order_updates: Boolean(data.preferences.order_updates),
            offers_email: Boolean(data.preferences.offers_email),
            offers_sms: Boolean(data.preferences.offers_sms),
            back_in_stock: Boolean(data.preferences.back_in_stock),
            review_reminders: Boolean(data.preferences.review_reminders),
            newsletter: Boolean(data.preferences.newsletter),
          });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const unread = notifications.filter((item) => !item.read_at).length;
  const visible = useMemo(
    () => (filter === "unread" ? notifications.filter((item) => !item.read_at) : notifications),
    [filter, notifications]
  );

  const markAll = async () => {
    setMarking(true);
    const response = await fetch("/api/account/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read_all" }),
    });
    setMarking(false);
    if (!response.ok) {
      toast.error("Could not update your notifications.");
      return;
    }
    setNotifications((current) =>
      current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))
    );
    toast.success("All caught up");
  };

  const markRead = async (notification: Notification) => {
    if (notification.read_at) return;
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, read_at: new Date().toISOString() }
          : item
      )
    );
    await fetch("/api/account/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", id: notification.id }),
    }).catch(() => undefined);
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setSaving(true);
    const response = await fetch("/api/account/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preferences", preferences }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save your preferences.");
      return;
    }
    toast.success("Preferences saved", {
      description: "In-app notifications are live now. Email and SMS delivery need the mail and SMS integrations.",
    });
  };

  const toggle = (key: keyof Preferences) => (value: boolean) =>
    setPreferences((current) => (current ? { ...current, [key]: value } : current));

  return (
    <div>
      <AccountHeading
        eyebrow="Stay in the loop"
        title="Notifications"
        description="Order updates, review notes and reward activity, all in one place. You decide what reaches you."
        action={
          unread > 0 ? (
            <button
              type="button"
              onClick={markAll}
              disabled={marking}
              className="flex items-center gap-1.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> {marking ? "Marking…" : "Mark all read"}
            </button>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4 w-4 text-gold" />
              <h2 className="font-display text-xl">Inbox</h2>
              {unread > 0 && (
                <span className="rounded-full bg-rosewood/10 px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.08em] text-rosewood">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex rounded-full border border-[var(--border)] p-0.5">
              {(["all", "unread"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] transition",
                    filter === key
                      ? "bg-midnight text-ivory"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-20 animate-pulse rounded-xl bg-[var(--muted)]" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Bell className="mx-auto h-7 w-7 text-muted-foreground/35" />
              <p className="mt-3 font-display text-xl">
                {filter === "unread" ? "You are all caught up." : "Nothing here yet."}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[0.66rem] leading-relaxed text-muted-foreground">
                {filter === "unread"
                  ? "New order, review and reward updates will appear here."
                  : "Place an order or submit a review and updates will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {visible.map((notification) => {
                const Icon = typeIcon[notification.kind] ?? Bell;
                const content = (
                  <>
                    <span
                      className={cn(
                        "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                        typeTone[notification.kind] ?? "bg-[var(--muted)] text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className={cn("text-[0.74rem]", !notification.read_at ? "font-semibold" : "font-medium")}>
                          {notification.title}
                        </p>
                        {!notification.read_at && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                        )}
                      </div>
                      {notification.body && (
                        <p className="mt-1 text-[0.66rem] leading-relaxed text-muted-foreground">
                          {notification.body}
                        </p>
                      )}
                      <p className="mt-1.5 text-[0.54rem] uppercase tracking-[0.1em] text-muted-foreground/70">
                        {when(notification.created_at)}
                      </p>
                    </div>
                  </>
                );
                return notification.href ? (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => void markRead(notification)}
                    className={cn(
                      "group flex gap-3.5 px-5 py-4 transition hover:bg-[var(--muted)]/30",
                      !notification.read_at && "bg-gold/[0.025]"
                    )}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void markRead(notification)}
                    className={cn(
                      "flex w-full gap-3.5 px-5 py-4 text-left transition hover:bg-[var(--muted)]/30",
                      !notification.read_at && "bg-gold/[0.025]"
                    )}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="font-display text-xl">Preferences</h2>
            <p className="mt-1 text-[0.62rem] leading-relaxed text-muted-foreground">
              In-app notifications are live. Email and SMS delivery depend on the mail and SMS integrations.
            </p>

            <div className="mt-4 space-y-3">
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Order updates
              </p>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[0.7rem] text-muted-foreground">
                  Order updates <span className="text-[0.52rem] text-muted-foreground/70">(always on)</span>
                </span>
                <Toggle label="Order updates" checked disabled onChange={() => undefined} />
              </div>

              <div className="my-1 h-px bg-[var(--border)]" />
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                From the house
              </p>
              {preferences ? (
                <>
                  {[
                    { key: "offers_email" as const, label: "Private offers by email" },
                    { key: "offers_sms" as const, label: "Offers by SMS" },
                    { key: "back_in_stock" as const, label: "Back-in-stock alerts" },
                    { key: "review_reminders" as const, label: "Review reminders" },
                    { key: "newsletter" as const, label: "Atelier letters" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <span className="text-[0.7rem] text-muted-foreground">{item.label}</span>
                      <Toggle
                        label={item.label}
                        checked={preferences[item.key]}
                        onChange={toggle(item.key)}
                      />
                    </div>
                  ))}
                  <Button
                    variant="gold"
                    className="mt-4 w-full"
                    onClick={savePreferences}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save preferences"}
                  </Button>
                </>
              ) : (
                <div className="h-32 animate-pulse rounded-xl bg-[var(--muted)]" />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <Truck className="h-4 w-4 text-gold" />
            <p className="mt-2 text-[0.72rem] font-semibold">Order updates always matter.</p>
            <p className="mt-1 text-[0.64rem] leading-relaxed text-muted-foreground">
              Even if you turn marketing off, we will contact you about active orders and
              account security. Those messages cannot be disabled.
            </p>
          </div>

          <Link
            href="/account/security"
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[0.68rem] transition hover:border-gold"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Manage account security
            </span>
            <span className="text-muted-foreground">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
