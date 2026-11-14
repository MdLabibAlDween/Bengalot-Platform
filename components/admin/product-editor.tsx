"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Layers,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { ProductArt } from "@/components/product/product-art";
import { getBundleComponentSlugs, isBundleProduct } from "@/lib/bundles";
import { productTypeLabel } from "@/lib/catalog-meta";
import { productCoverImage } from "@/lib/product-media";
import type { Category, Product, ProductSpec } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

const artKeys = [
  { value: "notion", label: "Notion workspace" },
  { value: "cards", label: "Study card deck" },
  { value: "planner", label: "Planner spread" },
  { value: "timer", label: "Focus timer" },
  { value: "guide", label: "Guide / book" },
  { value: "bundle", label: "Bundle box" },
];

const typeOptions = ["digital", "physical", "bundle"] as const;

const categoryArtDefaults: Record<string, { art_key: string; palette: string[] }> = {
  "notion-templates": {
    art_key: "notion",
    palette: ["#0B4F4A", "#0E7C7B", "#F6D365"],
  },
  "study-cards": {
    art_key: "cards",
    palette: ["#E05A3F", "#F0755A", "#F6D365"],
  },
  "printed-planners": {
    art_key: "planner",
    palette: ["#2A6F97", "#8ECAE6", "#F6D365"],
  },
  "focus-productivity": {
    art_key: "guide",
    palette: ["#2B2D42", "#4A4E69", "#EF8354"],
  },
  bundles: {
    art_key: "bundle",
    palette: ["#E05A3F", "#0E7C7B", "#F6D365"],
  },
};

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

type Upload = { id: string; name: string };

export function ProductEditor({
  product,
  categories,
  products,
  mode = "edit",
}: {
  product: Product;
  categories: Category[];
  products: Product[];
  mode?: "edit" | "create";
}) {
  const router = useRouter();
  const isCreate = mode === "create";
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
          ([key]) => key !== "images" && key !== "productSlugs",
        ),
      ),
      null,
      2,
    ),
  });
  const [images, setImages] = useState<string[]>(
    Array.isArray((product.preview as { images?: unknown })?.images)
      ? ((product.preview as { images: unknown[] }).images as string[]).filter(
          (url) => typeof url === "string",
        )
      : [],
  );
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [bundleComponents, setBundleComponents] =
    useState<string[]>(existingComponents);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setState("idle");
    setMessage("");
  }

  function updateCategory(slug: string) {
    setForm((current) => {
      if (isCreate) {
        const fallback = categoryArtDefaults[slug];
        if (fallback) {
          return {
            ...current,
            category_slug: slug,
            art_key: fallback.art_key,
            palette: [...fallback.palette],
          };
        }
      }
      return { ...current, category_slug: slug };
    });
    setState("idle");
    setMessage("");
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

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.size > 0);
    if (!files.length) return;

    const capacity = 12 - images.length - uploads.length;
    const accepted = files.slice(0, Math.max(capacity, 0));
    if (!accepted.length) {
      setUploadError("A product can hold up to 12 photos.");
      return;
    }

    setUploadError("");
    const placeholders = accepted.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
    }));
    setUploads((current) => [...current, ...placeholders]);

    for (const [index, file] of accepted.entries()) {
      const placeholder = placeholders[index];
      if (!placeholder) continue;
      try {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/uploads", {
          method: "POST",
          body,
        });
        const data = (await response.json()) as { url?: string; message?: string };
        if (!response.ok || !data.url) {
          throw new Error(data.message ?? "The image could not be uploaded.");
        }
        setImages((current) => [...current, data.url as string]);
        setUploads((current) => current.filter((item) => item.id !== placeholder.id));
      } catch (error) {
        setUploads((current) => current.filter((item) => item.id !== placeholder.id));
        setUploadError(
          error instanceof Error ? error.message : "The image could not be uploaded.",
        );
      }
    }
  }

  function setCover(index: number) {
    setImages((current) => {
      const next = [...current];
      const [cover] = next.splice(index, 1);
      return cover ? [cover, ...next] : next;
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const currentImage = next[index];
      const targetImage = next[target];
      if (!currentImage || !targetImage) return current;
      next[index] = targetImage;
      next[target] = currentImage;
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  const bundleCandidates = products.filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      (candidate.type === "digital" || candidate.type === "bundle"),
  );

  const parsedPreview = useMemo(() => {
    try {
      return JSON.parse(form.preview || "{}") as Record<string, unknown>;
    } catch {
      return {};
    }
  }, [form.preview]);

  const previewInvalid = useMemo(() => {
    try {
      const parsed = JSON.parse(form.preview || "{}");
      return (
        !parsed || typeof parsed !== "object" || Array.isArray(parsed)
      );
    } catch {
      return true;
    }
  }, [form.preview]);

  const mergedPreview = useMemo(() => {
    const next = { ...parsedPreview };
    if (isBundle) {
      next.kind = "bundle";
      next.productSlugs = bundleComponents;
    }
    if (images.length) {
      next.images = images;
    }
    return next;
  }, [parsedPreview, isBundle, bundleComponents, images]);

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
    includes: lines(form.includes),
    preview: mergedPreview,
  };

  const hasPhotos = images.length > 0 || uploads.length > 0;
  const coverImage = productCoverImage(previewProduct);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    if (previewInvalid) {
      setState("error");
      setMessage("The advanced artwork data is not valid JSON. Fix it before saving.");
      return;
    }

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          ...(isCreate ? {} : { slug: product.slug }),
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
          includes: lines(form.includes),
          requirements: lines(form.requirements),
          specs: form.specs
            .map((spec) => ({
              label: spec.label.trim(),
              value: spec.value.trim(),
            }))
            .filter((spec) => spec.label && spec.value),
          tags: tags(form.tags),
          sort: Number(form.sort) || 0,
          preview: parsedPreview,
          images,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        ok?: boolean;
        slug?: string;
      };
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Could not save.");

      if (isCreate && data.slug) {
        router.push(`/admin/products/${data.slug}`);
        router.refresh();
        return;
      }

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
            {isCreate ? (
              <>
                Add a{" "}
                <span className="display-italic text-teal">new product.</span>
              </>
            ) : (
              <>
                Edit:{" "}
                <span className="display-italic text-teal">{product.title}</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-[0.68rem] text-muted">
            {isCreate
              ? "Upload photos, describe the product and publish. The web address is created from the title."
              : "Photos, story, price and bundle access — everything the product page needs. Nothing changes until you save."}
          </p>
        </div>
        <button
          type="submit"
          disabled={state === "saving" || uploads.length > 0}
          className="btn btn-primary btn-sm"
        >
          {state === "saving" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : state === "saved" ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Save className="size-3.5" aria-hidden="true" />
          )}
          {state === "saving"
            ? "Saving"
            : state === "saved"
              ? "Saved"
              : isCreate
                ? "Create product"
                : "Save changes"}
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
            <div className="flex items-center justify-between">
              <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.13em] text-muted">
                Photos
              </p>
              <span className="text-[0.56rem] text-muted">
                {images.length}/12
              </span>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (event.dataTransfer.files.length) {
                  void uploadFiles(event.dataTransfer.files);
                }
              }}
              className={cn(
                "mt-4 rounded-[1rem] border border-dashed px-4 py-5 text-center transition-colors",
                dragging ? "border-teal bg-teal-soft/30" : "border-line-strong bg-paper",
              )}
            >
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-surface shadow-sm">
                <UploadCloud className="size-4.5 text-teal" aria-hidden="true" />
              </span>
              <p className="mt-2 text-[0.72rem] font-semibold text-ink">
                Drag photos here, or
              </p>
              <label
                htmlFor="product-photos"
                className="btn btn-outline btn-sm mt-2 inline-flex cursor-pointer"
              >
                <ImagePlus className="size-3.5" aria-hidden="true" />
                Choose photos
              </label>
              <input
                ref={fileInput}
                id="product-photos"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files?.length) {
                    void uploadFiles(event.target.files);
                  }
                  event.target.value = "";
                }}
              />
              <p className="mt-2 text-[0.58rem] text-muted">
                JPG, PNG, WebP or AVIF · up to 6MB each · the first photo is the cover
              </p>
            </div>

            {uploadError ? (
              <p className="mt-2 text-[0.62rem] font-medium text-coral" role="alert">
                {uploadError}
              </p>
            ) : null}

            {hasPhotos ? (
              <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {images.map((url, index) => (
                  <li
                    key={url}
                    className="group relative overflow-hidden rounded-xl border border-line bg-surface"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`${form.title || "Product"} photo ${index + 1}`}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                    {index === 0 ? (
                      <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-cream backdrop-blur">
                        <Star className="size-2.5" aria-hidden="true" />
                        Cover
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                          className="grid size-6 place-items-center rounded-full bg-white/90 text-ink transition-opacity disabled:opacity-30"
                          aria-label="Move photo earlier"
                        >
                          <ArrowLeft className="size-3" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === images.length - 1}
                          className="grid size-6 place-items-center rounded-full bg-white/90 text-ink transition-opacity disabled:opacity-30"
                          aria-label="Move photo later"
                        >
                          <ArrowRight className="size-3" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        {index !== 0 ? (
                          <button
                            type="button"
                            onClick={() => setCover(index)}
                            className="rounded-full bg-white/90 px-2 py-1 text-[0.52rem] font-bold uppercase tracking-[0.06em] text-ink"
                          >
                            Cover
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="grid size-6 place-items-center rounded-full bg-white/90 text-coral"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="size-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                {uploads.map((upload) => (
                  <li
                    key={upload.id}
                    className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-line bg-paper"
                    title={upload.name}
                  >
                    <Loader2 className="size-5 animate-spin text-teal" aria-hidden="true" />
                    <p className="absolute inset-x-1 bottom-1 truncate text-[0.5rem] text-muted">
                      {upload.name}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}

            {!coverImage ? (
              <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-[0.6rem] leading-relaxed text-muted">
                No photos yet — the storefront shows original Bengalot artwork
                instead. Pick the scene below.
              </p>
            ) : null}

            {!hasPhotos ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-art" className="field-label">
                    Fallback artwork
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
                <p className="self-end rounded-lg bg-paper px-3 py-2 text-[0.58rem] leading-relaxed text-muted">
                  Colours are chosen automatically for the collection — no need
                  to manage them by hand.
                </p>
              </div>
            ) : null}
          </section>

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
                    onChange={(event) => updateCategory(event.target.value)}
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
              Advanced artwork data (JSON) — optional
            </summary>
            <p className="mt-3 text-[0.64rem] leading-relaxed text-muted">
              Powers artwork modules and the flashcard preview. Leave it alone
              unless you need it — keep it valid JSON.
            </p>
            <textarea
              rows={8}
              value={form.preview}
              onChange={(event) => update("preview", event.target.value)}
              className="field mt-3 resize-y font-mono !text-[0.66rem]"
              aria-label="Advanced artwork data JSON"
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
              {coverImage
                ? "Your uploaded cover photo is live on cards, the shop and the product page."
                : "Original SVG artwork is shown until you upload a photo."}
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
