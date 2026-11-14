"use client";

import { ArrowUpRight, Check, Eye, EyeOff, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import type { Product, Promotion } from "@/lib/types";

const artOptions = [
  { value: "semester", label: "Semester edit" },
  { value: "notion", label: "Notion workspace" },
  { value: "cards", label: "Study cards" },
  { value: "planner", label: "Planner spread" },
  { value: "timer", label: "Focus timer" },
  { value: "guide", label: "Guide" },
  { value: "bundle", label: "Bundle" },
];

function PromoEditor({
  promotion,
  products,
}: {
  promotion: Promotion;
  products: Product[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    eyebrow: promotion.eyebrow,
    title: promotion.title,
    description: promotion.description,
    cta_label: promotion.cta_label,
    cta_href: promotion.cta_href,
    art_key: promotion.art_key,
    sort: String(promotion.sort),
    is_active: promotion.is_active,
    surface: promotion.theme?.surface ?? "#0d6f6d",
    ink: promotion.theme?.ink ?? "#ffffff",
    accent: promotion.theme?.accent ?? "#f3c95f",
    image: promotion.theme?.image ?? "",
  });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body });
      const data = (await response.json()) as { url?: string; message?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.message ?? "The image could not be uploaded.");
      }
      update("image", data.url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The image could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: promotion.id,
          eyebrow: form.eyebrow,
          title: form.title,
          description: form.description,
          cta_label: form.cta_label,
          cta_href: form.cta_href,
          art_key: form.art_key,
          theme: {
            surface: form.surface,
            ink: form.ink,
            accent: form.accent,
            from: promotion.theme?.from ?? form.surface,
            to: promotion.theme?.to ?? form.surface,
            image: form.image || null,
          },
          sort: Number(form.sort) || 0,
          is_active: form.is_active,
        }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Could not save.");
      setState("saved");
      setMessage("Banner saved. The homepage is updated.");
      router.refresh();
      window.setTimeout(() => setState("idle"), 2400);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not save.");
    }
  }

  const product =
    products.find((item) => item.art_key === form.art_key) ?? products[0];
  const isLight =
    (() => {
      const clean = form.surface.replace("#", "");
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
    })();

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.3rem] border border-line bg-cream p-5"
    >
      <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-muted">
            Banner {promotion.sort}
          </p>
          <p className="mt-1 font-display text-[1.35rem] tracking-[-0.03em] text-ink">
            {promotion.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.58rem] font-bold text-ink-soft">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => update("is_active", event.target.checked)}
              className="size-3.5 accent-[var(--teal)]"
            />
            {form.is_active ? (
              <Eye className="size-3" aria-hidden="true" />
            ) : (
              <EyeOff className="size-3" aria-hidden="true" />
            )}
            {form.is_active ? "Visible" : "Hidden"}
          </label>
          <button
            type="submit"
            disabled={state === "saving"}
            className="btn btn-primary btn-sm"
          >
            {state === "saving" ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : state === "saved" ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : null}
            {state === "saving" ? "Saving" : state === "saved" ? "Saved" : "Save banner"}
          </button>
        </div>
      </div>

      {message ? (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-[0.64rem] ${
            state === "error" ? "bg-coral/[0.08] text-coral" : "bg-teal-soft/40 text-teal"
          }`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <div>
            <label htmlFor={`${promotion.id}-eyebrow`} className="field-label">
              Eyebrow
            </label>
            <input
              id={`${promotion.id}-eyebrow`}
              value={form.eyebrow}
              onChange={(event) => update("eyebrow", event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor={`${promotion.id}-title`} className="field-label">
              Heading
            </label>
            <input
              id={`${promotion.id}-title`}
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              className="field font-display !text-[1.1rem]"
              required
            />
          </div>
          <div>
            <label htmlFor={`${promotion.id}-copy`} className="field-label">
              Description
            </label>
            <textarea
              id={`${promotion.id}-copy`}
              rows={3}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="field resize-y"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${promotion.id}-cta`} className="field-label">
                CTA label
              </label>
              <input
                id={`${promotion.id}-cta`}
                value={form.cta_label}
                onChange={(event) => update("cta_label", event.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor={`${promotion.id}-href`} className="field-label">
                CTA link
              </label>
              <input
                id={`${promotion.id}-href`}
                value={form.cta_href}
                onChange={(event) => update("cta_href", event.target.value)}
                className="field"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor={`${promotion.id}-art`} className="field-label">
                Background artwork
              </label>
              <select
                id={`${promotion.id}-art`}
                value={form.art_key}
                onChange={(event) => update("art_key", event.target.value)}
                className="field"
              >
                {artOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${promotion.id}-sort`} className="field-label">
                Display order
              </label>
              <input
                id={`${promotion.id}-sort`}
                type="number"
                min="0"
                max="999"
                value={form.sort}
                onChange={(event) => update("sort", event.target.value)}
                className="field !w-24"
              />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-paper p-3">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.11em] text-muted">
              Banner image
            </p>
            <p className="mt-1 text-[0.58rem] leading-relaxed text-muted">
              Optional. When added, this photo replaces the generated artwork on
              the right side of the banner.
            </p>
            {form.image ? (
              <div className="mt-3 flex items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                  <Image
                    src={form.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => update("image", "")}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-muted hover:border-coral/40 hover:text-coral"
                >
                  <X className="size-3" aria-hidden="true" />
                  Remove image
                </button>
              </div>
            ) : (
              <label className="btn btn-outline btn-sm mt-3 inline-flex cursor-pointer">
                {uploading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="size-3.5" aria-hidden="true" />
                )}
                {uploading ? "Uploading" : "Upload banner image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadImage(file);
                    event.target.value = "";
                  }}
                />
              </label>
            )}
            {uploadError ? (
              <p className="mt-2 text-[0.6rem] font-medium text-coral" role="alert">
                {uploadError}
              </p>
            ) : null}
          </div>
          <div>
            <span className="field-label">Accent colours</span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "surface" as const, label: "Background" },
                { key: "ink" as const, label: "Text" },
                { key: "accent" as const, label: "Accent" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5"
                >
                  <input
                    type="color"
                    value={form[item.key]}
                    onChange={(event) => update(item.key, event.target.value)}
                    className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                    aria-label={`${item.label} colour`}
                  />
                  <span className="text-[0.58rem] font-medium text-ink-soft">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.1em] text-muted">
            <span className="size-1.5 rounded-full bg-teal" />
            Live preview
          </p>
          <div
            className="relative min-h-[18rem] overflow-hidden rounded-[1.2rem] border p-5"
            style={{
              backgroundColor: form.surface,
              color: form.ink,
              borderColor: isLight ? "rgba(21,34,50,0.1)" : "rgba(247,241,228,0.12)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              aria-hidden="true"
              style={{
                backgroundImage: `radial-gradient(${form.ink} 0.7px, transparent 0.7px)`,
                backgroundSize: "14px 14px",
              }}
            />
            <p
              className="relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.5rem] font-extrabold uppercase tracking-[0.12em]"
              style={{ borderColor: `${form.ink}30`, backgroundColor: `${form.ink}12` }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: form.accent }} />
              {form.eyebrow || "Eyebrow"}
            </p>
            <h3
              className="relative mt-6 max-w-[9ch] font-display text-[1.9rem] leading-[0.95] tracking-[-0.04em]"
              style={{ color: form.ink }}
            >
              {form.title || "A better way to begin."}
            </h3>
            <p
              className="relative mt-2 max-w-[18ch] text-[0.68rem] leading-relaxed"
              style={{ color: `${form.ink}b0` }}
            >
              {form.description || "A short line about the banner."}
            </p>
            <span
              className="relative mt-5 inline-flex rounded-full px-3 py-2 text-[0.55rem] font-extrabold uppercase tracking-[0.1em]"
              style={{
                backgroundColor: isLight ? "#101c2a" : form.accent,
                color: isLight ? "#ffffff" : "#101c2a",
              }}
            >
              {form.cta_label || "Explore"}
            </span>
            {form.image ? (
              <div className="pointer-events-none absolute -bottom-12 -right-8 h-[68%] w-[46%] rotate-[5deg] overflow-hidden rounded-xl border border-white/20 shadow-xl">
                <Image
                  src={form.image}
                  alt=""
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
            ) : product ? (
              <div className="pointer-events-none absolute -bottom-12 -right-8 h-[68%] w-[46%] rotate-[5deg] overflow-hidden rounded-xl border border-white/20 opacity-95 shadow-xl">
                <ProductArt product={product} showCaption={false} />
              </div>
            ) : null}
          </div>
          <p className="mt-2 text-[0.58rem] leading-relaxed text-muted">
            The actual homepage card uses this exact content and accent palette.
            Lower display numbers appear first.
          </p>
          <a
            href="/#promotions"
            target="_blank"
            className="mt-2 inline-flex items-center gap-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-teal"
          >
            View homepage
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </form>
  );
}

export function PromotionEditor({
  promotions,
  products,
}: {
  promotions: Promotion[];
  products: Product[];
}) {
  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <PromoEditor key={promotion.id} promotion={promotion} products={products} />
      ))}
    </div>
  );
}

