"use client";

import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import type { Category, Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const artKeys = [
  { value: "notion", label: "Notion workspace" },
  { value: "cards", label: "Study card deck" },
  { value: "planner", label: "Planner spread" },
  { value: "timer", label: "Focus timer" },
  { value: "guide", label: "Guide / book" },
  { value: "bundle", label: "Bundle box" },
];

export function ProductEditor({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: product.title,
    title_bn: product.title_bn ?? "",
    subtitle: product.subtitle,
    description: product.description,
    category_slug: product.category_slug,
    price: String(product.price),
    compare_at: product.compare_at ? String(product.compare_at) : "",
    stock: String(product.stock),
    badge: product.badge ?? "",
    featured: product.featured,
    is_published: product.is_published,
    art_key: product.art_key,
    palette: [...product.palette],
  });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle");
    setMessage("");
  }

  function updateColor(index: number, value: string) {
    setForm((current) => {
      const palette = [...current.palette];
      palette[index] = value;
      return { ...current, palette };
    });
    setState("idle");
  }

  const previewProduct: Product = {
    ...product,
    title: form.title || "Untitled product",
    title_bn: form.title_bn || null,
    subtitle: form.subtitle,
    description: form.description,
    category_slug: form.category_slug,
    price: Number(form.price) || 0,
    compare_at: form.compare_at ? Number(form.compare_at) : null,
    stock: Number(form.stock) || 0,
    badge: form.badge || null,
    featured: form.featured,
    is_published: form.is_published,
    art_key: form.art_key,
    palette: form.palette,
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: product.slug,
          title: form.title,
          title_bn: form.title_bn || null,
          subtitle: form.subtitle,
          description: form.description,
          category_slug: form.category_slug,
          price: Number(form.price),
          compare_at: form.compare_at ? Number(form.compare_at) : null,
          stock: Number(form.stock),
          badge: form.badge || null,
          featured: form.featured,
          is_published: form.is_published,
          art_key: form.art_key,
          palette: form.palette,
        }),
      });
      const data = (await response.json()) as { message?: string; ok?: boolean };
      if (!response.ok) throw new Error(data.message ?? "Could not save.");
      setState("saved");
      setMessage("Saved. The storefront will show these changes.");
      router.refresh();
      window.setTimeout(() => setState("idle"), 2400);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted hover:text-teal"
          >
            <ArrowLeft className="size-3" aria-hidden="true" />
            All products
          </Link>
          <h1 className="mt-3 font-display text-[2rem] leading-none tracking-[-0.04em] text-ink sm:text-[2.5rem]">
            Edit: <span className="display-italic text-teal">{product.title}</span>
          </h1>
          <p className="mt-2 text-[0.68rem] text-muted">
            The live preview updates as you type. Nothing changes until you save.
          </p>
        </div>
        <button
          type="submit"
          disabled={state === "saving"}
          className="btn btn-primary btn-sm"
        >
          {state === "saving" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : state === "saved" ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Save className="size-3.5" aria-hidden="true" />
          )}
          {state === "saving" ? "Saving" : state === "saved" ? "Saved" : "Save changes"}
        </button>
      </div>

      {message ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-2.5 text-[0.7rem] font-medium ${
            state === "error"
              ? "border-coral/30 bg-coral/[0.08] text-coral-deep"
              : "border-teal/20 bg-teal-soft/40 text-teal"
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
        <div className="space-y-4">
          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              The story
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="product-title" className="field-label">
                  Product title
                </label>
                <input
                  id="product-title"
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="product-title-bn" className="field-label">
                  Bangla title
                </label>
                <input
                  id="product-title-bn"
                  value={form.title_bn}
                  onChange={(event) => update("title_bn", event.target.value)}
                  className="field font-bangla"
                />
              </div>
              <div>
                <label htmlFor="product-subtitle" className="field-label">
                  Short description
                </label>
                <input
                  id="product-subtitle"
                  value={form.subtitle}
                  onChange={(event) => update("subtitle", event.target.value)}
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="product-description" className="field-label">
                  Full description
                </label>
                <textarea
                  id="product-description"
                  rows={5}
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  className="field resize-y"
                  required
                />
              </div>
              <div>
                <label htmlFor="product-category" className="field-label">
                  Collection
                </label>
                <select
                  id="product-category"
                  value={form.category_slug}
                  onChange={(event) => update("category_slug", event.target.value)}
                  className="field"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Price and stock
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="product-price" className="field-label">
                  Price (৳)
                </label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => update("price", event.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="product-compare" className="field-label">
                  Compare at (৳)
                </label>
                <input
                  id="product-compare"
                  type="number"
                  min="0"
                  value={form.compare_at}
                  onChange={(event) => update("compare_at", event.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="product-stock" className="field-label">
                  Stock
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => update("stock", event.target.value)}
                  className="field"
                />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="product-badge" className="field-label">
                  Badge
                </label>
                <input
                  id="product-badge"
                  value={form.badge}
                  onChange={(event) => update("badge", event.target.value)}
                  placeholder="Bestseller, New, Save 20%…"
                  className="field"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Artwork
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="product-art" className="field-label">
                  Scene
                </label>
                <select
                  id="product-art"
                  value={form.art_key}
                  onChange={(event) => update("art_key", event.target.value)}
                  className="field"
                >
                  {artKeys.map((art) => (
                    <option key={art.value} value={art.value}>
                      {art.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="field-label">Colour palette</span>
                <div className="flex flex-wrap gap-2">
                  {form.palette.map((color, index) => (
                    <label
                      key={`${index}-${color}`}
                      className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5"
                    >
                      <input
                        type="color"
                        value={color}
                        onChange={(event) => updateColor(index, event.target.value)}
                        className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                        aria-label={`Palette colour ${index + 1}`}
                      />
                      <span className="font-mono text-[0.6rem] text-ink-soft">{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Visibility
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-3">
                <span>
                  <span className="block text-[0.7rem] font-semibold text-ink">
                    Published
                  </span>
                  <span className="mt-0.5 block text-[0.58rem] text-muted">
                    Visible in the shop
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) => update("is_published", event.target.checked)}
                  className="size-4 accent-[var(--teal)]"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-3">
                <span>
                  <span className="block text-[0.7rem] font-semibold text-ink">
                    Featured
                  </span>
                  <span className="mt-0.5 block text-[0.58rem] text-muted">
                    On the homepage short list
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => update("featured", event.target.checked)}
                  className="size-4 accent-[var(--teal)]"
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-20">
          <div className="rounded-[1.2rem] border border-line bg-cream p-4">
            <div className="flex items-center justify-between">
              <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                Live storefront preview
              </p>
              <span
                className={`rounded-full px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.06em] ${
                  form.is_published ? "bg-teal-soft/60 text-teal" : "bg-sand text-muted"
                }`}
              >
                {form.is_published ? "Live" : "Hidden"}
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-[1rem] border border-line">
              <div className="aspect-[4/4.9]">
                <ProductArt product={previewProduct} showCaption />
              </div>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.08em] text-muted">
                  {previewProduct.format}
                </p>
                <p className="mt-1 font-display text-[1.15rem] leading-tight tracking-[-0.02em] text-ink">
                  {previewProduct.title}
                </p>
              </div>
              <p className="price shrink-0 font-display text-[1.05rem] font-semibold text-ink">
                {formatMoney(previewProduct.price)}
              </p>
            </div>
            <div className="mt-3 rounded-lg bg-paper px-3 py-2 text-[0.58rem] leading-relaxed text-muted">
              This artwork is original SVG rendered in the browser — no photo
              upload is required.
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
