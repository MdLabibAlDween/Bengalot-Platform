"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { OfferCampaign } from "@/lib/homepage";
import { cn } from "@/lib/utils";

type CampaignRow = OfferCampaign & { sort?: number };

const themes: { value: OfferCampaign["theme"]; label: string }[] = [
  { value: "royal", label: "Royal indigo" },
  { value: "magenta", label: "Bengal magenta" },
  { value: "gold", label: "Antique gold" },
  { value: "teal", label: "Deep teal" },
];

const empty = {
  id: "",
  eyebrow: "Current offer",
  title: "",
  accentWord: "",
  description: "",
  couponCode: "",
  ctaLabel: "Shop the offer",
  ctaHref: "/collections/sale",
  startAt: "",
  endAt: "",
  status: "draft" as OfferCampaign["status"],
  theme: "royal" as OfferCampaign["theme"],
  sort: "0",
  isDemo: false,
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function campaignState(campaign: CampaignRow) {
  if (campaign.status !== "published") {
    return campaign.status === "draft" ? "Draft" : "Ended";
  }
  const now = Date.now();
  const start = new Date(campaign.startAt).getTime();
  const end = campaign.endAt ? new Date(campaign.endAt).getTime() : Number.POSITIVE_INFINITY;
  if (now < start) return "Scheduled";
  if (now > end) return "Expired";
  return "Live now";
}

export function OfferCampaignsManager({
  initial,
  coupons,
}: {
  initial: CampaignRow[];
  coupons: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(
    () => ({
      live: initial.filter((campaign) => campaignState(campaign) === "Live now").length,
      scheduled: initial.filter((campaign) => campaignState(campaign) === "Scheduled").length,
      draft: initial.filter((campaign) => campaign.status === "draft").length,
    }),
    [initial]
  );

  const startNew = () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setForm({
      ...empty,
      startAt: toLocalInput(start.toISOString()),
      endAt: toLocalInput(end.toISOString()),
    });
    setOpen(true);
  };

  const startEdit = (campaign: CampaignRow) => {
    setForm({
      id: campaign.id,
      eyebrow: campaign.eyebrow,
      title: campaign.title,
      accentWord: campaign.accentWord ?? "",
      description: campaign.description,
      couponCode: campaign.couponCode,
      ctaLabel: campaign.ctaLabel,
      ctaHref: campaign.ctaHref,
      startAt: toLocalInput(campaign.startAt),
      endAt: toLocalInput(campaign.endAt),
      status: campaign.status,
      theme: campaign.theme,
      sort: String(campaign.sort ?? 0),
      isDemo: Boolean(campaign.isDemo),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.couponCode || !form.startAt) {
      toast.error("Title, coupon code and start time are required.");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/admin/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id || undefined,
        eyebrow: form.eyebrow,
        title: form.title,
        accentWord: form.accentWord || undefined,
        description: form.description,
        couponCode: form.couponCode,
        ctaLabel: form.ctaLabel,
        ctaHref: form.ctaHref,
        startAt: toIso(form.startAt),
        endAt: form.endAt ? toIso(form.endAt) : null,
        status: form.status,
        theme: form.theme,
        sort: Number(form.sort) || 0,
        isDemo: form.isDemo,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save the offer campaign.");
      return;
    }
    toast.success(form.id ? "Offer campaign updated" : "Offer campaign created");
    setOpen(false);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this offer campaign?")) return;
    const response = await fetch("/api/admin/offers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete the offer campaign.");
      return;
    }
    toast.success("Offer campaign deleted");
    router.refresh();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.52rem] font-bold uppercase tracking-[0.16em] text-gold">
            Homepage offer timer
          </p>
          <h2 className="mt-1 font-display text-2xl">Campaign & countdown.</h2>
          <p className="mt-1 max-w-2xl text-[0.66rem] leading-relaxed text-muted-foreground">
            Published campaigns inside their start and end window appear on the homepage
            with a live countdown. Times use your browser timezone (Asia/Dhaka).
          </p>
        </div>
        <Button type="button" size="sm" onClick={startNew}>
          <Plus className="h-3.5 w-3.5" /> New campaign
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Live now", value: stats.live },
          { label: "Scheduled", value: stats.scheduled },
          { label: "Drafts", value: stats.draft },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-[1.8rem] leading-none tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {initial.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <CalendarClock className="mx-auto h-6 w-6 text-muted-foreground/35" />
            <p className="mt-3 font-display text-xl">No offer campaigns yet.</p>
            <p className="mt-1 text-[0.64rem] text-muted-foreground">
              Create one to control the homepage countdown and featured code.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Campaign", "Coupon", "Window", "Status", "Theme", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {initial.map((campaign) => {
                  const state = campaignState(campaign);
                  return (
                    <tr key={campaign.id} className="hover:bg-[var(--muted)]/30">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{campaign.title}</p>
                        <p className="text-[0.54rem] text-muted-foreground">
                          {campaign.eyebrow} · sort {campaign.sort ?? 0}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono">{campaign.couponCode}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(campaign.startAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" → "}
                        {campaign.endAt
                          ? new Date(campaign.endAt).toLocaleString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "No end"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
                            state === "Live now"
                              ? "bg-jade/10 text-jade"
                              : state === "Scheduled"
                                ? "bg-indigo/10 text-indigo"
                                : "bg-[var(--muted)] text-muted-foreground"
                          )}
                        >
                          {state}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {campaign.theme}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(campaign)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground hover:border-indigo hover:text-indigo"
                            aria-label="Edit offer campaign"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(campaign.id)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood hover:bg-rosewood hover:text-white"
                            aria-label="Delete offer campaign"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-midnight/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close offer editor"
          />
          <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-indigo">{form.id ? "Edit" : "New"}</p>
                <h2 className="mt-1 font-display text-2xl">Offer campaign.</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="The Gold Hour"
                />
              </div>
              <div>
                <Label>Accent word</Label>
                <Input
                  value={form.accentWord}
                  onChange={(event) => setForm({ ...form, accentWord: event.target.value })}
                  placeholder="Hour"
                />
              </div>
              <div>
                <Label>Eyebrow</Label>
                <Input
                  value={form.eyebrow}
                  onChange={(event) => setForm({ ...form, eyebrow: event.target.value })}
                  placeholder="Current offer"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="min-h-20"
                  placeholder="A seasonal collection with a little extra off."
                />
              </div>
              <div>
                <Label>Coupon code</Label>
                <Select
                  value={form.couponCode}
                  onChange={(event) => setForm({ ...form, couponCode: event.target.value })}
                >
                  <option value="">Select a coupon</option>
                  {coupons.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                  {form.couponCode && !coupons.includes(form.couponCode) && (
                    <option value={form.couponCode}>{form.couponCode}</option>
                  )}
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as OfferCampaign["status"] })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="ended">Ended</option>
                </Select>
              </div>
              <div>
                <Label>Starts at</Label>
                <Input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(event) => setForm({ ...form, startAt: event.target.value })}
                />
              </div>
              <div>
                <Label>Ends at</Label>
                <Input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(event) => setForm({ ...form, endAt: event.target.value })}
                />
                <p className="mt-1 text-[0.52rem] text-muted-foreground">
                  Leave empty to hide the countdown and run without an end date.
                </p>
              </div>
              <div>
                <Label>CTA label</Label>
                <Input
                  value={form.ctaLabel}
                  onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })}
                  placeholder="Shop the offer"
                />
              </div>
              <div>
                <Label>CTA link</Label>
                <Input
                  value={form.ctaHref}
                  onChange={(event) => setForm({ ...form, ctaHref: event.target.value })}
                  placeholder="/collections/sale"
                />
              </div>
              <div>
                <Label>Theme</Label>
                <Select
                  value={form.theme}
                  onChange={(event) =>
                    setForm({ ...form, theme: event.target.value as OfferCampaign["theme"] })
                  }
                >
                  {themes.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Sort</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.sort}
                  onChange={(event) => setForm({ ...form, sort: event.target.value })}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[0.62rem] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.isDemo}
                  onChange={(event) => setForm({ ...form, isDemo: event.target.checked })}
                  className="h-4 w-4 accent-[var(--color-indigo)]"
                />
                Demo campaign
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={save} disabled={saving}>
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save campaign"}
                </Button>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-2 text-[0.56rem] leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
              The homepage banner only appears while a published campaign is inside its
              window and its coupon is active. Product eligibility is controlled on the
              coupon itself.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
