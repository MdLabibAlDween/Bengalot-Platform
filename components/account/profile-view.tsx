"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AccountHeading } from "./account-heading";
import { useLocale } from "@/lib/providers";
import { initials } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export function ProfileView({
  initial,
}: {
  initial: { name: string; email: string; phone: string; birthday: string };
}) {
  const { locale, setLocale } = useLocale();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <div>
      <AccountHeading
        eyebrow="Your details"
        title="Profile"
        description="Keep your details up to date so deliveries and updates always find you."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-royal to-rosewood font-display text-2xl text-ivory">
                  {initials(form.name)}
                </span>
                <button
                  type="button"
                  onClick={() => toast("Avatar upload will be available in the next phase.")}
                  className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-muted-foreground transition hover:text-gold"
                  aria-label="Change avatar"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                <p className="font-display text-xl">{form.name}</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              const response = await fetch("/api/account/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fullName: form.name,
                  phone: form.phone,
                  birthday: form.birthday,
                }),
              });
              const result = await response.json().catch(() => ({}));
              setSaving(false);
              if (!response.ok) {
                toast.error(result.error ?? "Could not save your profile.");
                return;
              }
              toast.success("Profile updated", {
                description: "Your details have been saved.",
              });
            }}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="profile-phone">Mobile number</Label>
              <Input
                id="profile-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, ""))}
                maxLength={11}
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>
            <div>
              <Label htmlFor="profile-email">Email address</Label>
              <Input
                id="profile-email"
                type="email"
                value={form.email}
                readOnly
                aria-readonly="true"
                autoComplete="email"
              />
              <p className="mt-1 text-[0.55rem] text-muted-foreground">
                Email changes require verification and are coming soon.
              </p>
            </div>
            <div>
              <Label htmlFor="profile-birthday">Birthday (for offers)</Label>
              <Input
                id="profile-birthday"
                type="date"
                value={form.birthday}
                onChange={(e) => set("birthday", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="gold" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Language
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { key: "en" as Locale, label: "English", sub: "Default" },
                { key: "bn" as Locale, label: "বাংলা", sub: "Bengali" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setLocale(item.key);
                    toast.success(item.key === "bn" ? "ভাষা পরিবর্তন হয়েছে" : "Language set to English");
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${
                    locale === item.key
                      ? "border-gold bg-gold/[0.06]"
                      : "border-[var(--border)] hover:border-[var(--line-strong)]"
                  }`}
                >
                  <p className="text-[0.74rem] font-semibold">{item.label}</p>
                  <p className="text-[0.55rem] text-muted-foreground">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Account
            </p>
            <div className="mt-3 space-y-2">
              <Link
                href="/account/security"
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5 text-[0.68rem] transition hover:border-gold"
              >
                <span className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-gold" /> Change password
                </span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link
                href="/account/notifications"
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5 text-[0.68rem] transition hover:border-gold"
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gold" /> Notification preferences
                </span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link
                href="/account/security"
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5 text-[0.68rem] transition hover:border-gold"
              >
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-gold" /> Delete account
                </span>
                <span className="text-muted-foreground">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
