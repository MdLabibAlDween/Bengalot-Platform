"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImageIcon, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MediaSlot } from "@/lib/admin/settings";
import { cn } from "@/lib/utils";

function slotUsage(slot: MediaSlot) {
  if (slot.slot_key.startsWith("hero-")) return "Homepage hero cards";
  if (slot.slot_key === "gift-card-art") return "Homepage gift-card section";
  if (slot.slot_key.startsWith("lookbook-") || slot.slot_key.startsWith("collection.")) {
    return "Homepage collection cards";
  }
  if (slot.slot_key.startsWith("department")) return "Department cards";
  if (slot.slot_key.startsWith("category")) return "Category circles";
  if (slot.slot_key.startsWith("product.")) return "Product cards";
  if (slot.slot_key === "product-default" || slot.slot_key === "product-hover-default") {
    return "Product-card fallback";
  }
  if (slot.slot_key === "reel-poster-default") return "Reel posters";
  return slot.group_label;
}

export function MediaManager({ initial }: { initial: MediaSlot[] }) {
  const router = useRouter();
  const [slots, setSlots] = useState(initial);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({
    slot_key: "",
    label: "",
    group_label: "Custom",
    url: "",
  });

  const groups = useMemo(() => {
    const map = new Map<string, MediaSlot[]>();
    for (const slot of slots) {
      map.set(slot.group_label, [...(map.get(slot.group_label) ?? []), slot]);
    }
    return [...map.entries()];
  }, [slots]);

  const update = (id: string, patch: Partial<MediaSlot>) => {
    setSlots((current) => current.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  };

  const upload = async (slot: MediaSlot, file: File | undefined) => {
    if (!file) return;
    setUploadingId(slot.id);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const result = await response.json().catch(() => ({}));
    setUploadingId(null);
    if (!response.ok) {
      toast.error(result.error ?? "Upload failed.");
      return;
    }
    setSavingId(slot.id);
    const saveResponse = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        id: slot.id,
        url: result.url,
        alt: slot.alt || slot.label,
        is_active: true,
      }),
    });
    const saveResult = await saveResponse.json().catch(() => ({}));
    setSavingId(null);
    if (!saveResponse.ok) {
      toast.error(saveResult.error ?? "Image uploaded but could not be synced.");
      return;
    }
    update(slot.id, { url: result.url, alt: slot.alt || slot.label, is_active: true });
    toast.success("Image uploaded and synced to the storefront.");
    router.refresh();
  };

  const save = async (slot: MediaSlot) => {
    setSavingId(slot.id);
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        id: slot.id,
        url: slot.url || null,
        alt: slot.alt || null,
        is_active: slot.is_active,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSavingId(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save media.");
      return;
    }
    toast.success("Media slot saved and synced");
    router.refresh();
  };

  const create = async () => {
    if (!newSlot.slot_key || !newSlot.label) {
      toast.error("Give the slot a key and label.");
      return;
    }
    const response = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...newSlot }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not create the slot.");
      return;
    }
    setSlots((current) => [...current, result.media as MediaSlot]);
    setNewSlot({ slot_key: "", label: "", group_label: "Custom", url: "" });
    toast.success("Image slot added");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-indigo/15 bg-indigo/[0.04] p-4 text-[0.66rem] leading-relaxed text-muted-foreground">
        Paste a public image URL — Supabase Storage, your CDN, or any HTTPS image. Leave a slot
        empty to keep the generated Bengalot placeholder. Product and category artwork use these
        slots where the storefront supports image overrides.
      </div>

      {groups.map(([group, groupSlots]) => (
        <section
          key={group}
          className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">{group}</h2>
            <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {groupSlots.length} slots
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {groupSlots.map((slot) => (
              <div
                key={slot.id}
                className={cn(
                  "rounded-xl border p-3",
                  slot.url ? "border-jade/20 bg-jade/[0.02]" : "border-[var(--color-border)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--muted)]">
                    {slot.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slot.url} alt={slot.alt || slot.label} className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-muted-foreground/40">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[0.7rem] font-semibold">{slot.label}</p>
                      <label className="flex items-center gap-1.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={slot.is_active}
                          onChange={(event) => update(slot.id, { is_active: event.target.checked })}
                          className="h-3.5 w-3.5 accent-[var(--color-indigo)]"
                        />
                        Live
                      </label>
                    </div>
                    <p className="mt-0.5 font-mono text-[0.52rem] text-muted-foreground/60">
                      {slot.slot_key}
                    </p>
                    <p className="mt-0.5 text-[0.5rem] font-semibold text-indigo/70">
                      {slotUsage(slot)}
                    </p>
                    <Input
                      value={slot.url ?? ""}
                      onChange={(event) => update(slot.id, { url: event.target.value })}
                      placeholder="https://…"
                      className="mt-2 h-9 py-0 text-[0.66rem]"
                      aria-label={`${slot.label} image URL`}
                    />
                    <Input
                      value={slot.alt ?? ""}
                      onChange={(event) => update(slot.id, { alt: event.target.value })}
                      placeholder="Alt text"
                      className="mt-1.5 h-8 py-0 text-[0.62rem]"
                      aria-label={`${slot.label} alt text`}
                    />
                    <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-indigo">
                      {uploadingId === slot.id ? "Uploading…" : "Upload image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => upload(slot, event.target.files?.[0])} />
                    </label>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => save(slot)}
                    disabled={savingId === slot.id}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full bg-indigo px-3 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-ivory disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" /> {savingId === slot.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <h2 className="font-display text-xl">Add an image slot</h2>
        <p className="mt-1 text-[0.64rem] text-muted-foreground">
          Use a stable key in the form <code>group.name</code>. Existing keys are never overwritten.
        </p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-4">
          <div>
            <Label htmlFor="new-slot-key">Key</Label>
            <Input
              id="new-slot-key"
              value={newSlot.slot_key}
              onChange={(event) => setNewSlot({ ...newSlot, slot_key: event.target.value })}
              placeholder="category.women.hover"
            />
          </div>
          <div>
            <Label htmlFor="new-slot-label">Label</Label>
            <Input
              id="new-slot-label"
              value={newSlot.label}
              onChange={(event) => setNewSlot({ ...newSlot, label: event.target.value })}
              placeholder="Women category hover"
            />
          </div>
          <div>
            <Label htmlFor="new-slot-group">Group</Label>
            <Select
              id="new-slot-group"
              value={newSlot.group_label}
              onChange={(event) => setNewSlot({ ...newSlot, group_label: event.target.value })}
            >
              {["Homepage", "Departments", "Categories", "Products", "Reels", "Custom"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={create} className="w-full">
              <Plus className="h-3.5 w-3.5" /> Add slot
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
