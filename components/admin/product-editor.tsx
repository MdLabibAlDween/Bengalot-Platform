"use client";

import {
  ArrowLeft,
  Check,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import { getBundleComponentSlugs, isBundleProduct } from "@/lib/bundles";
import { productTypeLabel } from "@/lib/catalog-meta";
import type { Category, Product, ProductSpec } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

const artKeys = [
  { value: "notion", label: "Notion workspace" },
  { value: "cards", label: "Study card deck" },
  { value: "planner", label: "Planner spread" },
  { value: "timer", label: "Focus timer" },
  { value: "guide", label: "Guide / book" },
  { value: "bundle", label: "Bundle box" },
];

const typeOptions = ["digital", "physical", "bundle"] as const;

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function tags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function ProductEditor({
  product,
  categories,
  products,
}: {
  product: Product;
  categories: Category[];
  products: Product[];
}) {
  const router = useRouter();
  const isBundle = isBundleProduct(product);
  const existingComponents = getBundleComponentSlugs(product);

  const [form, setForm] = useState({
    title: product.title,
    title_bn: product.title_bn ?? "",
    subtitle: product.subtitle,
    description: product.description,
    sku: product.sku ?? "",
    category_slug: product.category_slug,
    type: product.type,
    format: product.format,
    price: String(product.price),
    compare_at: product.compare_at ? String(product.compare_at) : "",
    stock: String(product.stock),
    badge: product.badge ?? "",
    featured: product.featured,
    is_published: product.is_published,
    art_key: product.art_key,
    palette: [...product.palette],
    includes: product.includes.join("\n"),
    requirements: product.requirements.join("\n"),
    tags: product.tags.join(", "),
    specs: product.specs.map((spec) => ({ ...spec })),
    sort: String(product.sort),
    preview: JSON.stringify(
      Object.fromEntries(
        Object.entries(product.preview ?? {}).filter(
          ([key]) => key !== "productSlugs",
        ),
      ),
      null,
      2,
    ),
  });
  const [bundleComponents, setBundleComponents] =
    useState<string[]>(existingComponents);
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

  function updateSpec(index: number, key: keyof ProductSpec, value: string) {
    setForm((current) => ({
      ...current,
      specs: current.specs.map((spec, specIndex) =>
        specIndex === index ? { ...spec, [key]: value } : spec,
      ),
    }));
    setState("idle");
  }

  function addSpec() {
    setForm((current) => ({
      ...current,
      specs: [...current.specs, { label: "", value: "" }],
    }));
    setState("idle");
  }

  function removeSpec(index: number) {
    setForm((current) => ({
      ...current,
      specs: current.specs.filter((_, specIndex) => specIndex !== index),
    }));
    setState("idle");
  }

  function toggleComponent(slug: string) {
    setBundleComponents((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
    setState("idle");
    setMessage("");
  }

  const bundleCandidates = products.filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      (candidate.type === "digital" || candidate.type === "bundle"),
  );

  const previewObject = useMemo(() => {
    try {
      return JSON.parse(form.preview || "{}") as Record<string, unknown>;
    } catch {
      return product.preview as Record<string, unknown>;
    }
  }, [form.preview, product.preview]);

  const includesList = lines(form.includes);

  const previewProduct: Product = {
    ...product,
    title: form.title || "Untitled product",
    title_bn: form.title_bn || null,
    subtitle: form.subtitle,
    description: form.description,
    category_slug: form.category_slug,
    type: form.type,
    format: form.format,
    price: Number(form.price) || 0,
    compare_at: form.compare_at ? Number(form.compare_at) : null,
    stock: Number(form.stock) || 0,
    badge: form.badge || null,
    featured: form.featured,
    is_published: form.is_published,
    art_key: form.art_key,
    palette: form.palette,
    includes: includesList,
    preview: isBundle
      ? { ...previewObject, productSlugs: bundleComponents }
      : previewObject,
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    let parsedPreview: Record<string, unknown>;
    try {
      parsedPreview = JSON.parse(form.preview || "{}") as Record<string, unknown>;
      if (!parsedPreview || typeof parsedPreview !== "object" || Array.isArray(parsedPreview)) {
        throw new Error("Preview content must be a JSON object.");
      }
    } catch {
      setState("error");
      setMessage("The preview content is not valid JSON. Fix it before saving.");
      return;
    }

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
          sku: form.sku || null,
          category_slug: form.category_slug,
          type: form.type,
          format: form.format,
          price: Number(form.price),
          compare_at: form.compare_at ? Number(form.compare_at) : null,
          stock: Number(form.stock),
          badge: form.badge || null,
          featured: form.featured,
          is_published: form.is_published,
          art_key: form.art_key,
          palette: form.palette,
          includes: includesList,
          requirements: lines(form.requirements),
          specs: form.specs
            .map((spec) => ({
              label: spec.label.trim(),
              value: spec.value.trim(),
            }))
            .filter((spec) => spec.label && spec.value),
          tags: tags(form.tags),
          sort: Number(form.sort) || 0,
          preview: isBundle
            ? { ...parsedPreview, kind: "bundle", productSlugs: bundleComponents }
            : parsedPreview,
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
            The product page, card artwork and bundle access all update from
            here. Nothing changes until you save.
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-category" className="field-label">
                    Collection
                  </label>
                  <select
                    id="product-category"
                    value={form.category_slug}
                    onChange={(event) =>
                      update("category_slug", event.target.value)
                    }
                    className="field"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="product-type" className="field-label">
                    Type
                  </label>
                  <select
                    id="product-type"
                    value={form.type}
                    onChange={(event) =>
                      update("type", event.target.value as typeof form.type)
                    }
                    className="field"
                  >
                    {typeOptions.map((option) => (
                      <option key={option} value={option}>
                        {productTypeLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Price, stock and identity
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
              <div className="sm:col-span-2">
                <label htmlFor="product-format" className="field-label">
                  Format shown on cards
                </label>
                <input
                  id="product-format"
                  value={form.format}
                  onChange={(event) => update("format", event.target.value)}
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="product-sku" className="field-label">
                  SKU
                </label>
                <input
                  id="product-sku"
                  value={form.sku}
                  onChange={(event) => update("sku", event.target.value)}
                  className="field font-mono"
                />
              </div>
              <div className="sm:col-span-2">
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
              <div>
                <label htmlFor="product-sort" className="field-label">
                  Sort order
                </label>
                <input
                  id="product-sort"
                  type="number"
                  min="0"
                  value={form.sort}
                  onChange={(event) => update("sort", event.target.value)}
                  className="field"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Product page content
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="product-includes" className="field-label">
                  What you get
                </label>
                <textarea
                  id="product-includes"
                  rows={5}
                  value={form.includes}
                  onChange={(event) => update("includes", event.target.value)}
                  placeholder="One item per line"
                  className="field resize-y"
                />
              </div>
              <div>
                <label htmlFor="product-requirements" className="field-label">
                  Requirements
                </label>
                <textarea
                  id="product-requirements"
                  rows={3}
                  value={form.requirements}
                  onChange={(event) =>
                    update("requirements", event.target.value)
                  }
                  placeholder="One item per line"
                  className="field resize-y"
                />
              </div>
              <div>
                <label htmlFor="product-tags" className="field-label">
                  Tags
                </label>
                <input
                  id="product-tags"
                  value={form.tags}
                  onChange={(event) => update("tags", event.target.value)}
                  placeholder="planner, exam, printed"
                  className="field"
                />
              </div>
              <div>
                <span className="field-label">Specifications</span>
                <div className="space-y-2">
                  {form.specs.map((spec, index) => (
                    <div
                      key={index}
                      className="grid gap-2 sm:grid-cols-[0.8fr_1.2fr_auto]"
                    >
                      <input
                        value={spec.label}
                        onChange={(event) =>
                          updateSpec(index, "label", event.target.value)
                        }
                        className="field !py-2 !text-[0.72rem]"
                        aria-label={`Specification ${index + 1} label`}
                        placeholder="Label"
                      />
                      <input
                        value={spec.value}
                        onChange={(event) =>
                          updateSpec(index, "value", event.target.value)
                        }
                        className="field !py-2 !text-[0.72rem]"
                        aria-label={`Specification ${index + 1} value`}
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(index)}
                        className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-coral/40 hover:text-coral"
                        aria-label={`Remove specification ${index + 1}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpec}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.6rem] font-bold text-ink-soft transition-colors hover:border-teal hover:text-teal"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Add specification
                  </button>
                </div>
              </div>
            </div>
          </section>

          {isBundle ? (
            <section className="rounded-[1.2rem] border border-teal/20 bg-teal-soft/25 p-5">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-teal text-cream">
                  <Layers className="size-3.5" aria-hidden="true" />
                </span>
                <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-teal">
                  Bundle components
                </p>
              </div>
              <p className="mt-3 text-[0.66rem] leading-relaxed text-ink-soft/85">
                Choose the digital products this bundle unlocks in the
                customer&apos;s library. Printed components are described in
                &ldquo;What you get&rdquo; and ship with the parcel.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {bundleCandidates.map((candidate) => (
                  <label
                    key={candidate.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[0.7rem] font-semibold text-ink">
                        {candidate.title}
                      </span>
                      <span className="mt-0.5 block text-[0.56rem] text-muted">
                        {productTypeLabel(candidate.type)} · {formatMoney(candidate.price)}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={bundleComponents.includes(candidate.slug)}
                      onChange={() => toggleComponent(candidate.slug)}
                      className="size-4 accent-[var(--teal)]"
                    />
                  </label>
                ))}
              </div>
              {!bundleComponents.length ? (
                <p className="mt-3 text-[0.62rem] font-medium text-coral">
                  No digital components selected. Customers will not receive
                  library access with this bundle.
                </p>
              ) : null}
            </section>
          ) : null}

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

          <details className="group rounded-[1.2rem] border border-line bg-cream p-5">
            <summary className="cursor-pointer text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
              Advanced preview content (JSON)
            </summary>
            <p className="mt-3 text-[0.64rem] leading-relaxed text-muted">
              This powers the artwork modules and the flashcard preview. Keep it
              as valid JSON — the page will not save otherwise.
            </p>
            <textarea
              rows={10}
              value={form.preview}
              onChange={(event) => update("preview", event.target.value)}
              className="field mt-3 resize-y font-mono !text-[0.66rem]"
              aria-label="Preview content JSON"
            />
          </details>
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
