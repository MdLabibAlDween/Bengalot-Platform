"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { HomepageControl } from "@/lib/admin/settings";
import { cn } from "@/lib/utils";

const platformOptions = ["instagram", "youtube", "tiktok", "file"] as const;

export function HomepageBuilder({ initial }: { initial: HomepageControl }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial.sections);
  const [reels, setReels] = useState(initial.reels ?? []);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const updateSections = (next: typeof sections) => {
    setSections(next.map((section, index) => ({ ...section, sort: index + 1 })));
    setDirty(true);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    updateSections(next);
  };

  const addReel = () => {
    setReels((current) => [
      ...current,
      {
        id: `reel-${Date.now()}`,
        title: "New model reel",
        caption: "",
        platform: "instagram",
        videoUrl: "",
        watchUrl: "",
        posterUrl: "",
        productSlug: "",
        status: "draft",
        sort: current.length + 1,
      },
    ]);
    setDirty(true);
  };

  const updateReel = (index: number, patch: Record<string, unknown>) => {
    setReels((current) =>
      current.map((reel, itemIndex) => (itemIndex === index ? { ...reel, ...patch } : reel))
    );
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "homepage_control", value: { sections, reels } }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save homepage.");
      return;
    }
    setDirty(false);
    toast.success("Homepage saved");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Section order</h2>
            <p className="mt-1 text-[0.66rem] text-muted-foreground">
              Turn sections on or off and move them up or down. The storefront reads this order.
            </p>
          </div>
          <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {sections.filter((section) => section.enabled).length} visible
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.key}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 transition",
                section.enabled
                  ? "border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)]"
                  : "border-dashed border-[var(--color-border)] bg-transparent opacity-60"
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <span className="w-6 shrink-0 text-center text-[0.55rem] font-bold tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.72rem] font-medium">
                {section.label}
              </span>
              <span className="hidden text-[0.5rem] font-mono uppercase tracking-[0.08em] text-muted-foreground/50 sm:block">
                {section.key}
              </span>
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={(event) =>
                  updateSections(
                    sections.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, enabled: event.target.checked } : item
                    )
                  )
                }
                className="h-4 w-4 accent-[var(--color-indigo)]"
                aria-label={`Show ${section.label}`}
              />
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${section.label} up`}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-[var(--muted)] disabled:opacity-20"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sections.length - 1}
                  aria-label={`Move ${section.label} down`}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-[var(--muted)] disabled:opacity-20"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Model reels</h2>
            <p className="mt-1 text-[0.66rem] text-muted-foreground">
              Paste an Instagram or YouTube link. Platform is detected from the URL.
            </p>
          </div>
          <button
            type="button"
            onClick={addReel}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] transition hover:border-indigo hover:bg-indigo hover:text-ivory"
          >
            <Plus className="h-3.5 w-3.5" /> Add reel
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {reels.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-[0.68rem] text-muted-foreground">
              No reels yet. Add the first Instagram or YouTube link.
            </div>
          )}
          {reels.map((reel, index) => (
            <div key={reel.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.52rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Reel {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReels((current) => current.filter((_, itemIndex) => itemIndex !== index));
                    setDirty(true);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-rosewood/10 hover:text-rosewood"
                  aria-label={`Delete ${reel.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                <Input
                  value={reel.title}
                  onChange={(event) => updateReel(index, { title: event.target.value })}
                  placeholder="Reel title"
                  aria-label="Reel title"
                />
                <Input
                  value={reel.videoUrl ?? ""}
                  onChange={(event) => updateReel(index, { videoUrl: event.target.value })}
                  placeholder="https://instagram.com/reel/… or YouTube URL"
                  aria-label="Reel video URL"
                />
                <Input
                  value={reel.watchUrl ?? ""}
                  onChange={(event) => updateReel(index, { watchUrl: event.target.value })}
                  placeholder="Fallback/original URL"
                  aria-label="Reel fallback URL"
                />
                <Input
                  value={reel.productSlug ?? ""}
                  onChange={(event) => updateReel(index, { productSlug: event.target.value })}
                  placeholder="Product slug (optional)"
                  aria-label="Linked product slug"
                />
                <select
                  value={reel.platform}
                  onChange={(event) => updateReel(index, { platform: event.target.value })}
                  className="field h-11"
                  aria-label="Reel platform"
                >
                  {platformOptions.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                <select
                  value={reel.status}
                  onChange={(event) => updateReel(index, { status: event.target.value })}
                  className="field h-11"
                  aria-label="Reel status"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <Input
                  value={reel.posterUrl ?? ""}
                  onChange={(event) => updateReel(index, { posterUrl: event.target.value })}
                  placeholder="Poster image URL (optional)"
                  aria-label="Reel poster URL"
                />
                <Input
                  value={reel.caption ?? ""}
                  onChange={(event) => updateReel(index, { caption: event.target.value })}
                  placeholder="Caption"
                  aria-label="Reel caption"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
        <p className="text-[0.62rem] text-muted-foreground">
          {dirty ? "Unsaved homepage changes." : "Homepage is up to date."}
        </p>
        <Button type="button" onClick={save} disabled={saving || !dirty}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save homepage"}
        </Button>
      </div>
    </div>
  );
}
