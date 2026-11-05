"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eye,
  ImageIcon,
  Layers,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ProductImageValue = {
  id: string;
  url: string;
  alt: string;
  color: string;
  sort: number;
};

export type ProductVariantValue = {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
  price: number | null;
  compareAt: number | null;
};

export type ProductEditorValue = {
  id?: string;
  name: string;
  slug: string;
  department: string;
  category: string;
  audience: "men" | "women" | "kids" | "unisex";
  price: number;
  compareAt: number | null;
  stock: number;
  status: "draft" | "published" | "scheduled";
  isDemo: boolean;
  sizes: { label: string; stock: number }[];
  colors: { name: string; hex: string }[];
  variants: ProductVariantValue[];
  images: ProductImageValue[];
  seoTitle: string;
  seoDescription: string;
  imageUrl: string;
  hoverImageUrl: string;
  videoUrl: string;
  shortDescription: string;
  description: string;
  materials: string;
  care: string;
  tags: string[];
  sets: ("new" | "best" | "trending")[];
  badge: "" | "New" | "Bestseller" | "Limited" | "Sale";
  sku: string;
  sizeGuideId: string;
  collectionSlug: string;
  collectionNote: string;
  highlights: string[];
  materialLines: string[];
  careLines: string[];
  fitNote: string;
};

type Tab = "details" | "media" | "variants" | "content" | "seo";

const tabs: { key: Tab; label: string; icon: typeof Layers }[] = [
  { key: "details", label: "Details", icon: Layers },
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "variants", label: "Variants & stock", icon: Layers },
  { key: "content", label: "Content", icon: Search },
  { key: "seo", label: "SEO & publishing", icon: Eye },
];

function FieldRow({
  label,
  help,
  children,
  wide = false,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label>{label}</Label>
      {children}
      {help && (
        <p className="mt-1 text-[0.56rem] leading-relaxed text-muted-foreground">{help}</p>
      )}
    </div>
  );
}

function ImageCard({
  image,
  index,
  total,
  colors,
  onPatch,
  onMove,
  onRemove,
  onPrimary,
  onHover,
}: {
  image: ProductImageValue;
  index: number;
  total: number;
  colors: { name: string }[];
  onPatch: (patch: Partial<ProductImageValue>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onPrimary: () => void;
  onHover: () => void;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {index === 0 ? "Primary image" : `Image ${index + 1}`}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(-1)}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
              aria-label="Move image up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
              aria-label="Move image down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-rosewood/10 hover:text-rosewood"
              aria-label="Remove image"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <Input
          value={image.alt}
          onChange={(event) => onPatch({ alt: event.target.value })}
          placeholder="Alt text for accessibility and SEO"
          className="h-9 text-[0.66rem]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={image.color}
            onChange={(event) => onPatch({ color: event.target.value })}
            className="h-9 w-[170px] py-0 text-[0.62rem]"
            aria-label="Colour for this image"
          >
            <option value="">All colours</option>
            {colors.map((color) => (
              <option key={color.name} value={color.name}>
                {color.name}
              </option>
            ))}
          </Select>
          {index !== 0 && (
            <button
              type="button"
              onClick={onPrimary}
              className="text-[0.5rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline"
            >
              Make primary
            </button>
          )}
          <button
            type="button"
            onClick={onHover}
            className="text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-gold"
          >
            Use as hover image
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductEditor({
  initial,
  departments,
  categories,
  sizeGuides,
}: {
  initial: ProductEditorValue;
  departments: { slug: string; name: string }[];
  categories: { slug: string; name: string; department: string }[];
  sizeGuides: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [tab, setTab] = useState<Tab>("details");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof ProductEditorValue>(
    key: K,
    next: ProductEditorValue[K]
  ) => setValue((current) => ({ ...current, [key]: next }));

  const setList = (key: "tags" | "highlights" | "materialLines" | "careLines", text: string) => {
    set(
      key,
      text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  };

  const filteredCategories = categories.filter(
    (category) => category.department === value.department
  );

  const totalStock = useMemo(() => {
    if (value.variants.length > 0) {
      return value.variants.reduce(
        (sum, variant) => sum + Math.max(0, Number(variant.stock) || 0),
        0
      );
    }
    return value.sizes.reduce(
      (sum, size) => sum + Math.max(0, Number(size.stock) || 0),
      0
    );
  }, [value.sizes, value.variants]);

  const updateSize = (index: number, patch: Partial<{ label: string; stock: number }>) =>
    setValue((current) => ({
      ...current,
      sizes: current.sizes.map((size, sizeIndex) =>
        sizeIndex === index ? { ...size, ...patch } : size
      ),
    }));

  const updateColor = (index: number, patch: Partial<{ name: string; hex: string }>) =>
    setValue((current) => ({
      ...current,
      colors: current.colors.map((color, colorIndex) =>
        colorIndex === index ? { ...color, ...patch } : color
      ),
    }));

  const updateVariant = (index: number, patch: Partial<ProductVariantValue>) =>
    setValue((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      ),
    }));

  const applyPreset = (mode: "single" | "colour" | "size" | "both") => {
    setValue((current) => {
      const totalStock = current.variants.length
        ? current.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0)
        : current.sizes.reduce((sum, size) => sum + Math.max(0, size.stock), 0);
      const oneSize = [{ label: "One size", stock: totalStock }];
      const defaultColour = [{ name: "Default", hex: "#3B2A8C" }];
      if (mode === "single") {
        return { ...current, sizes: oneSize, colors: defaultColour, variants: [] };
      }
      if (mode === "colour") {
        return {
          ...current,
          sizes: oneSize,
          colors: current.colors.length > 0 ? current.colors : defaultColour,
          variants: [],
        };
      }
      if (mode === "size") {
        return { ...current, colors: defaultColour, variants: [] };
      }
      return current;
    });
  };

  const generateVariants = () => {
    const existing = new Map(
      value.variants.map((variant) => [`${variant.size}::${variant.color}`, variant])
    );
    const variants = value.sizes.flatMap((size) =>
      value.colors.map((color) => {
        const key = `${size.label}::${color.name}`;
        const current = existing.get(key);
        return {
          id: current?.id ?? `variant-${size.label}-${color.name}`.replace(/\s+/g, "-").toLowerCase(),
          size: size.label,
          color: color.name,
          stock: current?.stock ?? 0,
          sku:
            current?.sku ||
            [value.sku, size.label, color.name]
              .filter(Boolean)
              .join("-")
              .replace(/\s+/g, "-")
              .toUpperCase(),
          price: current?.price ?? null,
          compareAt: current?.compareAt ?? null,
        };
      })
    );
    set("variants", variants);
    toast.success(`${variants.length} variants generated`);
  };

  const moveVariant = (index: number, direction: -1 | 1) => {
    setValue((current) => {
      const variants = [...current.variants];
      const target = index + direction;
      if (target < 0 || target >= variants.length) return current;
      [variants[index], variants[target]] = [variants[target], variants[index]];
      return { ...current, variants };
    });
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded: ProductImageValue[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.url) {
        uploaded.push({
          id: `image-${Date.now()}-${uploaded.length}`,
          url: result.url,
          alt: value.name || file.name,
          color: "",
          sort: value.images.length + uploaded.length + 1,
        });
      } else {
        toast.error(result.error ?? `Could not upload ${file.name}.`);
      }
    }
    setUploading(false);
    if (uploaded.length === 0) return;
    setValue((current) => ({
      ...current,
      images: [...current.images, ...uploaded],
      imageUrl: current.imageUrl || uploaded[0].url,
      hoverImageUrl: current.hoverImageUrl || uploaded[1]?.url || "",
    }));
    toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
  };

  const patchImage = (index: number, patch: Partial<ProductImageValue>) =>
    setValue((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image
      ),
    }));

  const moveImage = (index: number, direction: -1 | 1) => {
    setValue((current) => {
      const images = [...current.images];
      const target = index + direction;
      if (target < 0 || target >= images.length) return current;
      [images[index], images[target]] = [images[target], images[index]];
      return {
        ...current,
        images: images.map((image, imageIndex) => ({ ...image, sort: imageIndex + 1 })),
      };
    });
  };

  const removeImage = (index: number) => {
    setValue((current) => {
      const images = current.images.filter((_, imageIndex) => imageIndex !== index);
      return {
        ...current,
        images,
        imageUrl: images[0]?.url ?? "",
        hoverImageUrl:
          current.hoverImageUrl === current.images[index]?.url
            ? images[1]?.url ?? ""
            : current.hoverImageUrl,
      };
    });
  };

  const makePrimary = (index: number) => {
    setValue((current) => {
      const images = [...current.images];
      const [picked] = images.splice(index, 1);
      images.unshift(picked);
      return {
        ...current,
        images: images.map((image, imageIndex) => ({ ...image, sort: imageIndex + 1 })),
        imageUrl: picked.url,
      };
    });
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      ...value,
      imageUrl: value.images[0]?.url || value.imageUrl,
      hoverImageUrl: value.hoverImageUrl || value.images[1]?.url || "",
      images: value.images.map((image, index) => ({ ...image, sort: index + 1 })),
    };
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save product.");
      return;
    }
    toast.success(value.id ? "Product updated" : "Product created");
    router.push("/admin/catalogue");
    router.refresh();
  };

  const remove = async () => {
    if (!value.id || !window.confirm(`Delete ${value.name}? This cannot be undone.`)) return;
    const response = await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: value.id }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    toast.success("Product deleted");
    router.push("/admin/catalogue");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-[68px] z-30 -mx-4 border-b border-[var(--color-border)] bg-[var(--color-sand)]/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/catalogue"
              className="inline-flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Catalogue
            </Link>
            <span className="hidden text-[0.62rem] text-muted-foreground sm:inline">
              {totalStock} in stock · {value.variants.length || value.sizes.length} variant
              {(value.variants.length || value.sizes.length) === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {value.slug && (
              <Link
                href={`/product/${value.slug}`}
                target="_blank"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.54rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-indigo hover:text-indigo"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </Link>
            )}
            {value.id && (
              <Button type="button" variant="outline" onClick={remove}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            <Button type="button" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save product"}
            </Button>
          </div>
        </div>
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.58rem] font-bold uppercase tracking-[0.08em] transition",
              tab === item.key
                ? "bg-indigo text-ivory shadow-sm"
                : "text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground"
            )}
          >
            <item.icon className="h-3.5 w-3.5" /> {item.label}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-xl">Product identity</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FieldRow label="Product name" wide>
                <Input
                  value={value.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    setValue((current) => ({
                      ...current,
                      name,
                      slug:
                        current.id || current.slug
                          ? current.slug
                          : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                    }));
                  }}
                  placeholder="Ivory Jamdani Panjabi"
                />
              </FieldRow>
              <FieldRow label="Slug" help="Public URL: /product/your-slug">
                <Input
                  value={value.slug}
                  onChange={(event) =>
                    set(
                      "slug",
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-")
                    )
                  }
                />
              </FieldRow>
              <FieldRow label="Base SKU">
                <Input
                  value={value.sku}
                  onChange={(event) => set("sku", event.target.value.toUpperCase())}
                  placeholder="BGL-PAN-001"
                />
              </FieldRow>
              <FieldRow label="Audience">
                <Select
                  value={value.audience}
                  onChange={(event) =>
                    set("audience", event.target.value as ProductEditorValue["audience"])
                  }
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="kids">Kids</option>
                  <option value="unisex">Unisex</option>
                </Select>
              </FieldRow>
              <FieldRow label="Department">
                <Select
                  value={value.department}
                  onChange={(event) => {
                    const department = event.target.value;
                    const first = categories.find(
                      (category) => category.department === department
                    );
                    setValue((current) => ({
                      ...current,
                      department,
                      category: first?.slug ?? current.category,
                    }));
                  }}
                >
                  {departments.map((department) => (
                    <option key={department.slug} value={department.slug}>
                      {department.name}
                    </option>
                  ))}
                </Select>
              </FieldRow>
              <FieldRow label="Category">
                <Select
                  value={value.category}
                  onChange={(event) => set("category", event.target.value)}
                >
                  {filteredCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FieldRow>
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-display text-xl">Pricing & publishing</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FieldRow label="Price (৳)">
                  <Input
                    type="number"
                    value={value.price}
                    onChange={(event) => set("price", Number(event.target.value))}
                  />
                </FieldRow>
                <FieldRow label="Compare-at (৳)">
                  <Input
                    type="number"
                    value={value.compareAt ?? ""}
                    onChange={(event) =>
                      set("compareAt", event.target.value ? Number(event.target.value) : null)
                    }
                  />
                </FieldRow>
                <FieldRow label="Status">
                  <Select
                    value={value.status}
                    onChange={(event) =>
                      set("status", event.target.value as ProductEditorValue["status"])
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </Select>
                </FieldRow>
                <FieldRow label="Badge">
                  <Select
                    value={value.badge}
                    onChange={(event) =>
                      set("badge", event.target.value as ProductEditorValue["badge"])
                    }
                  >
                    <option value="">No badge</option>
                    <option value="New">New</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Limited">Limited</option>
                    <option value="Sale">Sale</option>
                  </Select>
                </FieldRow>
              </div>
              <label className="mt-4 flex items-start gap-2.5 rounded-xl border border-gold/30 bg-gold/[0.05] p-3 text-[0.62rem] leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={value.isDemo}
                  onChange={(event) => set("isDemo", event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-indigo)]"
                />
                <span>
                  <span className="block font-semibold text-foreground">
                    Demo product — ordering disabled
                  </span>
                  Browsable with a Demo badge, but not purchasable. Uncheck when real
                  photography, pricing and stock are ready.
                </span>
              </label>
            </section>

            <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-display text-xl">Merchandising</h2>
              <div className="mt-4 space-y-3">
                <FieldRow label="Collection slug">
                  <Input
                    value={value.collectionSlug}
                    onChange={(event) => set("collectionSlug", event.target.value)}
                    placeholder="new-arrivals"
                  />
                </FieldRow>
                <FieldRow label="Collection note">
                  <Input
                    value={value.collectionNote}
                    onChange={(event) => set("collectionNote", event.target.value)}
                    placeholder="Part of the festive edit"
                  />
                </FieldRow>
                <div>
                  <Label>Collections</Label>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {(["new", "best", "trending"] as const).map((collectionSet) => (
                      <label key={collectionSet} className="flex items-center gap-2 text-[0.64rem] capitalize">
                        <input
                          type="checkbox"
                          checked={value.sets.includes(collectionSet)}
                          onChange={(event) =>
                            set(
                              "sets",
                              event.target.checked
                                ? [...value.sets, collectionSet]
                                : value.sets.filter((item) => item !== collectionSet)
                            )
                          }
                          className="h-4 w-4 accent-[var(--color-indigo)]"
                        />
                        {collectionSet}
                      </label>
                    ))}
                  </div>
                </div>
                <FieldRow label="Tags" help="One per line: Jamdani, Festive, Gift">
                  <Textarea
                    value={value.tags.join("\n")}
                    onChange={(event) => setList("tags", event.target.value)}
                    className="min-h-20"
                  />
                </FieldRow>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === "media" && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Product gallery</h2>
                <p className="mt-1 text-[0.6rem] text-muted-foreground">
                  Upload multiple images. The first is the card image; the second becomes the
                  hover image unless you choose otherwise.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-indigo px-4 py-2.5 text-[0.54rem] font-bold uppercase tracking-[0.08em] text-ivory">
                <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => void uploadImages(event.target.files)}
                />
              </label>
            </div>

            {value.images.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] px-5 py-12 text-center">
                <ImageIcon className="mx-auto h-7 w-7 text-muted-foreground/35" />
                <p className="mt-3 font-display text-xl">No images yet.</p>
                <p className="mx-auto mt-1 max-w-sm text-[0.64rem] text-muted-foreground">
                  Upload the real photos. Without images the storefront uses the illustrated
                  placeholder.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {value.images.map((image, index) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    index={index}
                    total={value.images.length}
                    colors={value.colors}
                    onPatch={(patch) => patchImage(index, patch)}
                    onMove={(direction) => moveImage(index, direction)}
                    onRemove={() => removeImage(index)}
                    onPrimary={() => makePrimary(index)}
                    onHover={() => set("hoverImageUrl", image.url)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="space-y-4">
            <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-display text-xl">Media settings</h2>
              <div className="mt-4 space-y-3">
                <FieldRow
                  label="Hover image URL"
                  help="Used on product cards when a customer hovers. Defaults to the second gallery image."
                >
                  <Input
                    value={value.hoverImageUrl}
                    onChange={(event) => set("hoverImageUrl", event.target.value)}
                    placeholder="https://…"
                  />
                </FieldRow>
                <FieldRow
                  label="Product video URL"
                  help="Optional MP4 or hosted video shown on the product page."
                >
                  <Input
                    value={value.videoUrl}
                    onChange={(event) => set("videoUrl", event.target.value)}
                    placeholder="https://…"
                  />
                </FieldRow>
              </div>
            </section>
            <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-display text-xl">Image checklist</h2>
              <ul className="mt-3 space-y-2 text-[0.62rem] leading-relaxed text-muted-foreground">
                {[
                  "First image: clean front view on a neutral background.",
                  "Second image: detail, fabric or alternate angle.",
                  "Add alt text that describes the garment, not just the filename.",
                  "Use the same image shape for the whole catalogue.",
                  "Link colour-specific images so the gallery changes with the swatch.",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {tab === "variants" && (
        <div className="space-y-4">
          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Product shape</h2>
                <p className="mt-1 max-w-2xl text-[0.6rem] leading-relaxed text-muted-foreground">
                  Choose a starting point. One size + Default colour hides both selectors
                  on the product page. Colour-only keeps <strong>One size</strong> and adds
                  colours. Size-only keeps <strong>Default</strong> and adds sizes.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {([
                  ["single", "Single product"],
                  ["colour", "Colour only"],
                  ["size", "Size only"],
                  ["both", "Size + colour"],
                ] as const).map(([mode, label]) => (
                  <Button
                    key={mode}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(mode)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">Sizes</h2>
                  <p className="mt-1 text-[0.58rem] text-muted-foreground">
                    Labels shown on the product page.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue((current) => ({
                      ...current,
                      sizes: [...current.sizes, { label: "", stock: 0 }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add size
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {value.sizes.map((size, index) => {
                  const aggregate =
                    value.variants.length > 0
                      ? value.variants
                          .filter((variant) => variant.size === size.label)
                          .reduce((sum, variant) => sum + variant.stock, 0)
                      : size.stock;
                  return (
                    <div key={`size-${index}`} className="flex items-center gap-2">
                      <Input
                        value={size.label}
                        onChange={(event) => updateSize(index, { label: event.target.value })}
                        placeholder="S, M, L, XL, One size"
                        className="flex-1"
                      />
                      {value.variants.length === 0 ? (
                        <Input
                          type="number"
                          min={0}
                          value={size.stock}
                          onChange={(event) =>
                            updateSize(index, {
                              stock: Math.max(0, Number(event.target.value) || 0),
                            })
                          }
                          className="w-24"
                          aria-label={`Stock for size ${size.label || index + 1}`}
                        />
                      ) : (
                        <span className="w-24 rounded-lg bg-[var(--muted)] px-2 py-2 text-center text-[0.62rem] tabular-nums">
                          {aggregate}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="iconSm"
                        disabled={value.sizes.length <= 1}
                        onClick={() =>
                          setValue((current) => ({
                            ...current,
                            sizes: current.sizes.filter((_, i) => i !== index),
                            variants: current.variants.filter(
                              (variant) => variant.size !== current.sizes[index].label
                            ),
                          }))
                        }
                        aria-label="Remove size"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">Colours</h2>
                  <p className="mt-1 text-[0.58rem] text-muted-foreground">
                    Swatches and optional colour-specific images.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue((current) => ({
                      ...current,
                      colors: [...current.colors, { name: "", hex: "#3B2A8C" }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add colour
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {value.colors.map((color, index) => (
                  <div key={`color-${index}`} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(event) => updateColor(index, { hex: event.target.value })}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent p-1"
                      aria-label="Colour swatch"
                    />
                    <Input
                      value={color.name}
                      onChange={(event) => updateColor(index, { name: event.target.value })}
                      placeholder="Midnight, Ivory, Rosewood"
                      className="flex-1"
                    />
                    <Input
                      value={color.hex}
                      onChange={(event) => updateColor(index, { hex: event.target.value })}
                      className="w-24 font-mono text-[0.66rem]"
                      aria-label="Colour hex"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      disabled={value.colors.length <= 1}
                      onClick={() =>
                        setValue((current) => ({
                          ...current,
                          colors: current.colors.filter((_, i) => i !== index),
                          variants: current.variants.filter(
                            (variant) => variant.color !== current.colors[index].name
                          ),
                        }))
                      }
                      aria-label="Remove colour"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">Variant inventory</h2>
                <p className="mt-1 text-[0.6rem] text-muted-foreground">
                  Stock and SKU are tracked per size + colour. Generate the matrix after setting
                  your sizes and colours, then adjust the quantities.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={generateVariants}>
                  <Layers className="h-3.5 w-3.5" /> Generate matrix
                </Button>
                {value.variants.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set("variants", [])}
                  >
                    Clear variants
                  </Button>
                )}
              </div>
            </div>

            {value.variants.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] px-5 py-10 text-center">
                <p className="font-display text-xl">Using size-level stock.</p>
                <p className="mx-auto mt-1 max-w-lg text-[0.64rem] leading-relaxed text-muted-foreground">
                  Generate the variant matrix when you want different stock per colour, or
                  keep size-level stock for simpler products.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      {["Size", "Colour", "Stock", "Price (৳)", "Compare-at", "SKU", ""].map((head) => (
                        <th key={head} className="px-3 py-2.5">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                    {value.variants.map((variant, index) => (
                      <tr key={variant.id}>
                        <td className="px-3 py-2">
                          <Select
                            value={variant.size}
                            onChange={(event) => updateVariant(index, { size: event.target.value })}
                            className="h-9 w-[120px] py-0 text-[0.62rem]"
                          >
                            {value.sizes.map((size) => (
                              <option key={size.label} value={size.label}>{size.label}</option>
                            ))}
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Select
                            value={variant.color}
                            onChange={(event) => updateVariant(index, { color: event.target.value })}
                            className="h-9 w-[150px] py-0 text-[0.62rem]"
                          >
                            {value.colors.map((color) => (
                              <option key={color.name} value={color.name}>{color.name}</option>
                            ))}
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            value={variant.stock}
                            onChange={(event) =>
                              updateVariant(index, {
                                stock: Math.max(0, Number(event.target.value) || 0),
                              })
                            }
                            className="h-9 w-20 text-center text-[0.66rem]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            value={variant.price ?? ""}
                            onChange={(event) =>
                              updateVariant(index, {
                                price: event.target.value ? Number(event.target.value) : null,
                              })
                            }
                            className="h-9 w-24 text-center text-[0.66rem]"
                            placeholder={String(value.price)}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            value={variant.compareAt ?? ""}
                            onChange={(event) =>
                              updateVariant(index, {
                                compareAt: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              })
                            }
                            className="h-9 w-24 text-center text-[0.66rem]"
                            placeholder="—"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            value={variant.sku}
                            onChange={(event) => updateVariant(index, { sku: event.target.value })}
                            className="h-9 min-w-[170px] font-mono text-[0.6rem]"
                            placeholder="SKU"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveVariant(index, -1)}
                              disabled={index === 0}
                              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                              aria-label="Move variant up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVariant(index, 1)}
                              disabled={index === value.variants.length - 1}
                              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                              aria-label="Move variant down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setValue((current) => ({
                                  ...current,
                                  variants: current.variants.filter((_, i) => i !== index),
                                }))
                              }
                              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-rosewood/10 hover:text-rosewood"
                              aria-label="Remove variant"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "content" && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-xl">Product copy</h2>
            <div className="mt-4 space-y-3">
              <FieldRow label="Short description" help="Shown under the product name.">
                <Textarea
                  value={value.shortDescription}
                  onChange={(event) => set("shortDescription", event.target.value)}
                  className="min-h-20"
                />
              </FieldRow>
              <FieldRow label="Full description">
                <Textarea
                  value={value.description}
                  onChange={(event) => set("description", event.target.value)}
                  className="min-h-40"
                />
              </FieldRow>
              <FieldRow label="Highlights" help="One feature per line, e.g. Hand-finished neckline.">
                <Textarea
                  value={value.highlights.join("\n")}
                  onChange={(event) => setList("highlights", event.target.value)}
                  className="min-h-24"
                />
              </FieldRow>
              <FieldRow label="Fit note">
                <Textarea
                  value={value.fitNote}
                  onChange={(event) => set("fitNote", event.target.value)}
                  className="min-h-20"
                />
              </FieldRow>
            </div>
          </section>

          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-xl">Materials & care</h2>
            <div className="mt-4 space-y-3">
              <FieldRow label="Materials summary">
                <Textarea
                  value={value.materials}
                  onChange={(event) => set("materials", event.target.value)}
                  className="min-h-20"
                />
              </FieldRow>
              <FieldRow label="Material lines" help="One per line, shown as bullets.">
                <Textarea
                  value={value.materialLines.join("\n")}
                  onChange={(event) => setList("materialLines", event.target.value)}
                  className="min-h-24"
                />
              </FieldRow>
              <FieldRow label="Care summary">
                <Textarea
                  value={value.care}
                  onChange={(event) => set("care", event.target.value)}
                  className="min-h-20"
                />
              </FieldRow>
              <FieldRow label="Care lines" help="One per line, shown with care icons.">
                <Textarea
                  value={value.careLines.join("\n")}
                  onChange={(event) => setList("careLines", event.target.value)}
                  className="min-h-24"
                />
              </FieldRow>
              <FieldRow label="Size guide">
                <Select
                  value={value.sizeGuideId}
                  onChange={(event) => set("sizeGuideId", event.target.value)}
                >
                  {sizeGuides.map((guide) => (
                    <option key={guide.id} value={guide.id}>{guide.name}</option>
                  ))}
                </Select>
              </FieldRow>
            </div>
          </section>
        </div>
      )}

      {tab === "seo" && (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-xl">Search appearance</h2>
            <div className="mt-4 space-y-3">
              <FieldRow label="SEO title" help="Aim for 50–60 characters.">
                <Input
                  value={value.seoTitle}
                  onChange={(event) => set("seoTitle", event.target.value)}
                  placeholder="Ivory Jamdani Panjabi — Handloom Bengal"
                />
              </FieldRow>
              <FieldRow label="SEO description" help="Aim for 140–160 characters.">
                <Textarea
                  value={value.seoDescription}
                  onChange={(event) => set("seoDescription", event.target.value)}
                  className="min-h-24"
                  placeholder="A hand-finished jamdani panjabi..."
                />
              </FieldRow>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Preview
                </p>
                <p className="mt-2 truncate text-[0.8rem] font-medium text-indigo">
                  {value.seoTitle || `${value.name || "Product"} — Bengalot`}
                </p>
                <p className="text-[0.6rem] text-jade">
                  bengalot.com › product › {value.slug || "your-product"}
                </p>
                <p className="mt-1 line-clamp-2 text-[0.62rem] text-muted-foreground">
                  {value.seoDescription || value.shortDescription || "Add a search description."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-display text-xl">Publishing checklist</h2>
            <ul className="mt-3 space-y-2 text-[0.62rem] leading-relaxed text-muted-foreground">
              {[
                "Slug is lowercase and unique.",
                "At least one real gallery image is uploaded.",
                "Every variant has stock and a SKU.",
                "Price and compare-at price are correct.",
                "Description, materials and care are complete.",
                "SEO title and description are filled.",
                "Demo is unchecked only when the product is truly ready.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl bg-[var(--muted)]/40 p-3 text-[0.62rem] leading-relaxed">
              <p className="font-semibold">Stock summary</p>
              <p className="mt-1 text-muted-foreground">
                {value.variants.length > 0
                  ? `${value.variants.length} variants · ${totalStock} units`
                  : `${value.sizes.length} size options · ${totalStock} units`}
              </p>
            </div>
          </section>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-[0.6rem] text-muted-foreground">
          {value.isDemo
            ? "Demo mode — customers can browse but cannot order."
            : "Live product — visible and orderable when published."}
        </p>
        <Button type="button" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save product"}
        </Button>
      </div>
    </div>
  );
}
