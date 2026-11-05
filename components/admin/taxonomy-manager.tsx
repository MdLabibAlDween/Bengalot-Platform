"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FolderTree,
  ImageIcon,
  Layers,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  department: string;
  icon: string;
  tagline: string;
  image_url: string | null;
  status: "published" | "hidden";
  is_demo: boolean;
  sort: number;
};

type CollectionRow = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  palette: string[] | null;
  note: string | null;
  closing_title: string;
  closing_text: string;
  meta_title: string;
  meta_description: string;
  kind: "new" | "best" | "sale" | "royal" | "heirloom";
  status: "published" | "hidden";
  is_demo: boolean;
  sort: number;
  product_slugs: string[] | null;
};

type BundleRow = {
  id: string;
  slug: string;
  name: string;
  name_bn: string | null;
  department: string;
  short_description: string;
  description: string;
  cover_art: string;
  cover_palette: string[] | null;
  discount_type: "none" | "percent" | "fixed";
  discount_value: number;
  status: "draft" | "published";
  featured: boolean;
  allow_partial_purchase: boolean;
  items: { productSlug: string; quantity: number; sort: number }[] | null;
  seo_title: string;
  seo_description: string;
  is_demo: boolean;
  sort: number;
};

type ProductOption = { slug: string; name: string; department: string };

type Tab = "categories" | "collections" | "bundles";

const departments = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "footwear", label: "Footwear" },
  { value: "bags", label: "Bags" },
  { value: "accessories", label: "Accessories" },
];

const icons = [
  "tshirt", "polo", "shirt", "hoodie", "panjabi", "kurti", "saree", "dress",
  "hijab", "pants", "shorts", "joggers", "jacket", "socks", "innerwear",
  "sneaker", "sandal", "slipper", "formal", "heel", "kids", "onesie",
  "nightwear", "jute", "backpack", "tote", "wallet", "duffel", "cap",
  "watch", "belt", "sunglasses", "jewelry", "perfume", "muffler",
];

const emptyCategory = {
  id: "",
  slug: "",
  name: "",
  nameBn: "",
  department: "men",
  icon: "tshirt",
  tagline: "",
  imageUrl: "",
  status: "published" as "published" | "hidden",
  isDemo: true,
  sort: "0",
};

const emptyCollection = {
  id: "",
  slug: "",
  eyebrow: "",
  title: "",
  accent: "",
  description: "",
  paletteA: "var(--color-indigo)",
  paletteB: "var(--color-magenta)",
  note: "",
  closingTitle: "",
  closingText: "",
  metaTitle: "",
  metaDescription: "",
  kind: "new" as CollectionRow["kind"],
  status: "published" as "published" | "hidden",
  isDemo: true,
  sort: "0",
  productSlugs: [] as string[],
};

const emptyBundle = {
  id: "",
  slug: "",
  name: "",
  nameBn: "",
  department: "men",
  shortDescription: "",
  description: "",
  coverArt: "jacket",
  paletteA: "var(--color-indigo)",
  paletteB: "var(--color-indigo-luminous)",
  discountType: "percent" as "none" | "percent" | "fixed",
  discountValue: "10",
  status: "draft" as "draft" | "published",
  featured: false,
  allowPartialPurchase: false,
  seoTitle: "",
  seoDescription: "",
  isDemo: true,
  sort: "0",
  items: [] as { productSlug: string; quantity: number; sort: number }[],
};

function Pill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-[0.44rem] font-bold uppercase tracking-[0.08em]",
        status === "published" || status === "active"
          ? "bg-jade/10 text-jade"
          : status === "draft"
            ? "bg-saffron/15 text-gold-ink"
            : "bg-[var(--muted)] text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

function Drawer({
  title,
  eyebrow,
  onClose,
  children,
  footer,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-midnight/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close editor"
      />
      <div className="relative flex h-full w-full max-w-[680px] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="eyebrow text-indigo">{eyebrow}</p>
            <h2 className="mt-1 font-display text-2xl">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="border-t border-[var(--border)] px-5 py-4">{footer}</div>
      </div>
    </div>
  );
}

function SlugInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
}) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      }
      placeholder="lowercase-with-dashes"
    />
  );
}

function ProductPicker({
  products,
  selected,
  onAdd,
}: {
  products: ProductOption[];
  selected: string[];
  onAdd: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .filter((product) => !selected.includes(product.slug))
      .filter((product) =>
        !needle
          ? true
          : `${product.name} ${product.slug} ${product.department}`
              .toLowerCase()
              .includes(needle)
      )
      .slice(0, 12);
  }, [products, query, selected]);
  return (
    <div className="rounded-xl border border-[var(--border)] p-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products to add…"
          className="h-9 pl-9 text-[0.66rem]"
        />
      </div>
      {query.trim() && (
        <div className="mt-1 max-h-44 overflow-y-auto">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-[0.6rem] text-muted-foreground">No products found.</p>
          ) : (
            matches.map((product) => (
              <button
                key={product.slug}
                type="button"
                onClick={() => {
                  onAdd(product.slug);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[0.64rem] hover:bg-[var(--muted)]"
              >
                <span className="min-w-0 truncate">{product.name}</span>
                <span className="shrink-0 text-[0.5rem] uppercase tracking-[0.08em] text-muted-foreground">
                  {product.department}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function TaxonomyManager({
  initialCategories,
  initialCollections,
  initialBundles,
  products,
}: {
  initialCategories: CategoryRow[];
  initialCollections: CollectionRow[];
  initialBundles: BundleRow[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("categories");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState(emptyCategory);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryUploading, setCategoryUploading] = useState(false);
  const [collection, setCollection] = useState(emptyCollection);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [bundle, setBundle] = useState(emptyBundle);
  const [bundleOpen, setBundleOpen] = useState(false);

  const counts = {
    categories: initialCategories.length,
    collections: initialCollections.length,
    bundles: initialBundles.length,
  };

  const filteredCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialCategories.filter((row) =>
      !needle
        ? true
        : `${row.name} ${row.name_bn ?? ""} ${row.slug} ${row.department}`
            .toLowerCase()
            .includes(needle)
    );
  }, [initialCategories, query]);
  const filteredCollections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialCollections.filter((row) =>
      !needle ? true : `${row.title} ${row.slug} ${row.kind}`.toLowerCase().includes(needle)
    );
  }, [initialCollections, query]);
  const filteredBundles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialBundles.filter((row) =>
      !needle
        ? true
        : `${row.name} ${row.slug} ${row.department}`.toLowerCase().includes(needle)
    );
  }, [initialBundles, query]);

  const action = async (payload: Record<string, unknown>, message: string) => {
    setSaving(true);
    const response = await fetch("/api/admin/taxonomy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save the change.");
      return false;
    }
    toast.success(message);
    router.refresh();
    return true;
  };

  const remove = async (kind: Tab, id: string, label: string) => {
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    const apiKind =
      kind === "categories" ? "category" : kind === "collections" ? "collection" : "bundle";
    const ok = await action({ kind: apiKind, action: "delete", id }, "Deleted");
    if (ok) {
      if (kind === "categories") setCategoryOpen(false);
      if (kind === "collections") setCollectionOpen(false);
      if (kind === "bundles") setBundleOpen(false);
    }
  };

  const uploadCategoryImage = async (file: File | undefined) => {
    if (!file) return;
    setCategoryUploading(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    const result = await response.json().catch(() => ({}));
    setCategoryUploading(false);
    if (!response.ok || !result.url) {
      toast.error(result.error ?? "Could not upload the category image.");
      return;
    }
    setCategory((current) => ({ ...current, imageUrl: result.url as string }));
    toast.success("Category image uploaded — press Save category");
  };

  const saveCategory = async () => {
    const ok = await action(
      {
        kind: "category",
        action: "save",
        id: category.id || undefined,
        slug: category.slug,
        name: category.name,
        nameBn: category.nameBn,
        department: category.department,
        icon: category.icon,
        tagline: category.tagline,
        imageUrl: category.imageUrl,
        status: category.status,
        isDemo: category.isDemo,
        sort: Number(category.sort) || 0,
      },
      category.id ? "Category updated" : "Category created"
    );
    if (ok) setCategoryOpen(false);
  };

  const saveCollection = async () => {
    const ok = await action(
      {
        kind: "collection",
        action: "save",
        id: collection.id || undefined,
        slug: collection.slug,
        eyebrow: collection.eyebrow,
        title: collection.title,
        accent: collection.accent,
        description: collection.description,
        palette: [collection.paletteA, collection.paletteB],
        note: collection.note,
        closingTitle: collection.closingTitle,
        closingText: collection.closingText,
        metaTitle: collection.metaTitle,
        metaDescription: collection.metaDescription,
        collectionKind: collection.kind,
        status: collection.status,
        isDemo: collection.isDemo,
        sort: Number(collection.sort) || 0,
        productSlugs: collection.productSlugs,
      },
      collection.id ? "Collection updated" : "Collection created"
    );
    if (ok) setCollectionOpen(false);
  };

  const saveBundle = async () => {
    const ok = await action(
      {
        kind: "bundle",
        action: "save",
        id: bundle.id || undefined,
        slug: bundle.slug,
        name: bundle.name,
        nameBn: bundle.nameBn,
        department: bundle.department,
        shortDescription: bundle.shortDescription,
        description: bundle.description,
        coverArt: bundle.coverArt,
        coverPalette: [bundle.paletteA, bundle.paletteB],
        discountType: bundle.discountType,
        discountValue: Number(bundle.discountValue) || 0,
        status: bundle.status,
        featured: bundle.featured,
        allowPartialPurchase: bundle.allowPartialPurchase,
        seoTitle: bundle.seoTitle,
        seoDescription: bundle.seoDescription,
        isDemo: bundle.isDemo,
        sort: Number(bundle.sort) || 0,
        items: bundle.items,
      },
      bundle.id ? "Bundle updated" : "Bundle created"
    );
    if (ok) setBundleOpen(false);
  };

  const startCategory = (row?: CategoryRow) => {
    setCategory(
      row
        ? {
            id: row.id,
            slug: row.slug,
            name: row.name,
            nameBn: row.name_bn ?? "",
            department: row.department,
            icon: row.icon,
            tagline: row.tagline,
            imageUrl: row.image_url ?? "",
            status: row.status,
            isDemo: row.is_demo,
            sort: String(row.sort),
          }
        : emptyCategory
    );
    setCategoryOpen(true);
  };

  const startCollection = (row?: CollectionRow) => {
    setCollection(
      row
        ? {
            id: row.id,
            slug: row.slug,
            eyebrow: row.eyebrow,
            title: row.title,
            accent: row.accent,
            description: row.description,
            paletteA: row.palette?.[0] ?? "var(--color-indigo)",
            paletteB: row.palette?.[1] ?? "var(--color-magenta)",
            note: row.note ?? "",
            closingTitle: row.closing_title,
            closingText: row.closing_text,
            metaTitle: row.meta_title,
            metaDescription: row.meta_description,
            kind: row.kind,
            status: row.status,
            isDemo: row.is_demo,
            sort: String(row.sort),
            productSlugs: row.product_slugs ?? [],
          }
        : emptyCollection
    );
    setCollectionOpen(true);
  };

  const startBundle = (row?: BundleRow) => {
    setBundle(
      row
        ? {
            id: row.id,
            slug: row.slug,
            name: row.name,
            nameBn: row.name_bn ?? "",
            department: row.department,
            shortDescription: row.short_description,
            description: row.description,
            coverArt: row.cover_art,
            paletteA: row.cover_palette?.[0] ?? "var(--color-indigo)",
            paletteB: row.cover_palette?.[1] ?? "var(--color-indigo-luminous)",
            discountType: row.discount_type,
            discountValue: String(row.discount_value),
            status: row.status,
            featured: row.featured,
            allowPartialPurchase: row.allow_partial_purchase,
            seoTitle: row.seo_title,
            seoDescription: row.seo_description,
            isDemo: row.is_demo,
            sort: String(row.sort),
            items: (row.items ?? []).map((item, index) => ({
              productSlug: item.productSlug,
              quantity: item.quantity,
              sort: item.sort ?? index + 1,
            })),
          }
        : emptyBundle
    );
    setBundleOpen(true);
  };

  const moveBundleItem = (index: number, direction: -1 | 1) => {
    setBundle((current) => {
      const items = [...current.items];
      const target = index + direction;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, items: items.map((item, i) => ({ ...item, sort: i + 1 })) };
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            key: "categories" as Tab,
            label: "Categories",
            value: counts.categories,
            helper: `${initialCategories.filter((row) => row.status === "published").length} published`,
            icon: FolderTree,
            tone: "indigo",
          },
          {
            key: "collections" as Tab,
            label: "Collections",
            value: counts.collections,
            helper: `${initialCollections.filter((row) => row.status === "published").length} published`,
            icon: Layers,
            tone: "magenta",
          },
          {
            key: "bundles" as Tab,
            label: "Bundles",
            value: counts.bundles,
            helper: `${initialBundles.filter((row) => row.status === "published").length} published`,
            icon: Sparkles,
            tone: "saffron",
          },
        ].map(({ key, label, value, helper, icon: Icon, tone }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setQuery("");
            }}
            className={cn(
              "flex items-center gap-3 rounded-[20px] border p-4 text-left transition",
              tab === key
                ? "border-indigo bg-indigo/[0.03]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-indigo/40"
            )}
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                tone === "indigo"
                  ? "bg-indigo/10 text-indigo"
                  : tone === "magenta"
                    ? "bg-magenta/10 text-magenta"
                    : "bg-saffron/15 text-gold-ink"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
              </span>
              <span className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-[1.7rem] leading-none tabular-nums">{value}</span>
                <span className="text-[0.56rem] text-muted-foreground">{helper}</span>
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${tab}`}
              className="h-9 w-[220px] pl-9 text-[0.66rem]"
            />
          </div>
          <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {tab === "categories" ? filteredCategories.length : tab === "collections" ? filteredCollections.length : filteredBundles.length} records
          </span>
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            onClick={() =>
              tab === "categories"
                ? startCategory()
                : tab === "collections"
                  ? startCollection()
                  : startBundle()
            }
          >
            <Plus className="h-3.5 w-3.5" /> New{" "}
            {tab === "categories" ? "category" : tab === "collections" ? "collection" : "bundle"}
          </Button>
        </div>

        {tab === "categories" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Category", "Department", "Slug", "Status", "Sort", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {filteredCategories.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.name}</p>
                      <p className="text-[0.54rem] text-muted-foreground">{row.name_bn || row.tagline}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{row.department}</td>
                    <td className="px-4 py-3 font-mono text-[0.58rem] text-muted-foreground">{row.slug}</td>
                    <td className="px-4 py-3"><Pill status={row.status} /></td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.sort}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startCategory(row)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground hover:border-indigo hover:text-indigo"
                          aria-label="Edit category"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove("categories", row.id, row.name)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood hover:bg-rosewood hover:text-white"
                          aria-label="Delete category"
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

        {tab === "collections" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Collection", "Rule", "Products", "Status", "Sort", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {filteredCollections.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.title}</p>
                      <p className="font-mono text-[0.54rem] text-muted-foreground">{row.slug}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{row.kind}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {row.product_slugs?.length ? `${row.product_slugs.length} selected` : "Automatic"}
                    </td>
                    <td className="px-4 py-3"><Pill status={row.status} /></td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.sort}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startCollection(row)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground hover:border-indigo hover:text-indigo"
                          aria-label="Edit collection"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove("collections", row.id, row.title)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood hover:bg-rosewood hover:text-white"
                          aria-label="Delete collection"
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

        {tab === "bundles" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Bundle", "Department", "Pieces", "Discount", "Status", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {filteredBundles.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.name}</p>
                      <p className="font-mono text-[0.54rem] text-muted-foreground">{row.slug}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{row.department}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{row.items?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      {row.discount_type === "percent"
                        ? `${row.discount_value}%`
                        : row.discount_type === "fixed"
                          ? `৳${row.discount_value}`
                          : "None"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Pill status={row.status} />
                        {row.featured && (
                          <span className="rounded-full bg-gold/15 px-2 py-1 text-[0.42rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => startBundle(row)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground hover:border-indigo hover:text-indigo"
                          aria-label="Edit bundle"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove("bundles", row.id, row.name)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood hover:bg-rosewood hover:text-white"
                          aria-label="Delete bundle"
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
      </div>

      {categoryOpen && (
        <Drawer
          eyebrow={category.id ? "Edit category" : "New category"}
          title="Category details"
          onClose={() => setCategoryOpen(false)}
          footer={
            <div className="flex items-center justify-between gap-2">
              {category.id ? (
                <button
                  type="button"
                  onClick={() => void remove("categories", category.id, category.name)}
                  className="text-[0.54rem] font-bold uppercase tracking-[0.08em] text-rosewood hover:underline"
                >
                  Delete
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCategoryOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={saveCategory} disabled={saving}>
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save category"}
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={category.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setCategory((current) => ({
                    ...current,
                    name,
                    slug:
                      current.id || current.slug
                        ? current.slug
                        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="cat-name-bn">Bengali name</Label>
              <Input
                id="cat-name-bn"
                value={category.nameBn}
                onChange={(event) => setCategory({ ...category, nameBn: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cat-slug">Slug</Label>
              <SlugInput
                id="cat-slug"
                value={category.slug}
                onChange={(slug) => setCategory({ ...category, slug })}
              />
            </div>
            <div>
              <Label htmlFor="cat-dept">Department</Label>
              <Select
                id="cat-dept"
                value={category.department}
                onChange={(event) => setCategory({ ...category, department: event.target.value })}
              >
                {departments.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="cat-icon">Artwork</Label>
              <Select
                id="cat-icon"
                value={category.icon}
                onChange={(event) => setCategory({ ...category, icon: event.target.value })}
              >
                {icons.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="cat-sort">Sort order</Label>
              <Input
                id="cat-sort"
                type="number"
                value={category.sort}
                onChange={(event) => setCategory({ ...category, sort: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="cat-tagline">Tagline</Label>
              <Textarea
                id="cat-tagline"
                value={category.tagline}
                onChange={(event) => setCategory({ ...category, tagline: event.target.value })}
                className="min-h-20"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="cat-image">Category / subcategory image</Label>
              <div className="flex gap-2">
                <Input
                  id="cat-image"
                  value={category.imageUrl}
                  onChange={(event) => setCategory({ ...category, imageUrl: event.target.value })}
                  placeholder="https://... or upload below"
                  className="flex-1"
                />
                <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-indigo px-3.5 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-ivory">
                  <Upload className="h-3 w-3" />
                  {categoryUploading ? "Uploading" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void uploadCategoryImage(event.target.files?.[0])}
                  />
                </label>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--muted)]/25 p-2.5">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--surface)] text-muted-foreground/40">
                  {category.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </span>
                <p className="text-[0.56rem] leading-relaxed text-muted-foreground">
                  Shown on category circles, department category rails and category
                  cards. Leave blank to use the department image or generated artwork.
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="cat-status">Status</Label>
              <Select
                id="cat-status"
                value={category.status}
                onChange={(event) =>
                  setCategory({ ...category, status: event.target.value as typeof category.status })
                }
              >
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-[0.64rem] text-muted-foreground">
              <Checkbox
                checked={category.isDemo}
                onChange={(event) => setCategory({ ...category, isDemo: event.target.checked })}
              />
              Demo category
            </label>
          </div>
        </Drawer>
      )}

      {collectionOpen && (
        <Drawer
          eyebrow={collection.id ? "Edit collection" : "New collection"}
          title="Collection details"
          onClose={() => setCollectionOpen(false)}
          footer={
            <div className="flex items-center justify-between gap-2">
              {collection.id ? (
                <button
                  type="button"
                  onClick={() => void remove("collections", collection.id, collection.title)}
                  className="text-[0.54rem] font-bold uppercase tracking-[0.08em] text-rosewood hover:underline"
                >
                  Delete
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCollectionOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={saveCollection} disabled={saving}>
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save collection"}
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="col-title">Title</Label>
              <Input
                id="col-title"
                value={collection.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setCollection((current) => ({
                    ...current,
                    title,
                    slug:
                      current.id || current.slug
                        ? current.slug
                        : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="col-slug">Slug</Label>
              <SlugInput
                id="col-slug"
                value={collection.slug}
                onChange={(slug) => setCollection({ ...collection, slug })}
              />
            </div>
            <div>
              <Label htmlFor="col-eyebrow">Eyebrow</Label>
              <Input
                id="col-eyebrow"
                value={collection.eyebrow}
                onChange={(event) => setCollection({ ...collection, eyebrow: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="col-accent">Accent word</Label>
              <Input
                id="col-accent"
                value={collection.accent}
                onChange={(event) => setCollection({ ...collection, accent: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="col-kind">Selection rule</Label>
              <Select
                id="col-kind"
                value={collection.kind}
                onChange={(event) =>
                  setCollection({ ...collection, kind: event.target.value as CollectionRow["kind"] })
                }
              >
                <option value="new">New arrivals</option>
                <option value="best">Selected pieces</option>
                <option value="sale">Sale archive</option>
                <option value="royal">Festive / Royal</option>
                <option value="heirloom">Heirloom craft</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="col-sort">Sort order</Label>
              <Input
                id="col-sort"
                type="number"
                value={collection.sort}
                onChange={(event) => setCollection({ ...collection, sort: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="col-description">Description</Label>
              <Textarea
                id="col-description"
                value={collection.description}
                onChange={(event) => setCollection({ ...collection, description: event.target.value })}
                className="min-h-24"
              />
            </div>
            <div>
              <Label htmlFor="col-palette-a">Palette colour A</Label>
              <Input
                id="col-palette-a"
                value={collection.paletteA}
                onChange={(event) => setCollection({ ...collection, paletteA: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="col-palette-b">Palette colour B</Label>
              <Input
                id="col-palette-b"
                value={collection.paletteB}
                onChange={(event) => setCollection({ ...collection, paletteB: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="col-note">Note</Label>
              <Input
                id="col-note"
                value={collection.note}
                onChange={(event) => setCollection({ ...collection, note: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="col-status">Status</Label>
              <Select
                id="col-status"
                value={collection.status}
                onChange={(event) =>
                  setCollection({ ...collection, status: event.target.value as typeof collection.status })
                }
              >
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="col-closing-title">Closing title</Label>
              <Input
                id="col-closing-title"
                value={collection.closingTitle}
                onChange={(event) => setCollection({ ...collection, closingTitle: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="col-meta-title">SEO title</Label>
              <Input
                id="col-meta-title"
                value={collection.metaTitle}
                onChange={(event) => setCollection({ ...collection, metaTitle: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="col-closing-text">Closing text</Label>
              <Textarea
                id="col-closing-text"
                value={collection.closingText}
                onChange={(event) => setCollection({ ...collection, closingText: event.target.value })}
                className="min-h-20"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="col-meta-description">SEO description</Label>
              <Textarea
                id="col-meta-description"
                value={collection.metaDescription}
                onChange={(event) => setCollection({ ...collection, metaDescription: event.target.value })}
                className="min-h-16"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Label className="mb-0">Products</Label>
                <span className="text-[0.54rem] text-muted-foreground">
                  Leave empty to use the selection rule
                </span>
              </div>
              <ProductPicker
                products={products}
                selected={collection.productSlugs}
                onAdd={(productSlug) =>
                  setCollection((current) => ({
                    ...current,
                    productSlugs: [...current.productSlugs, productSlug],
                  }))
                }
              />
              {collection.productSlugs.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {collection.productSlugs.map((productSlug, index) => {
                    const product = products.find((item) => item.slug === productSlug);
                    return (
                      <div
                        key={`${productSlug}-${index}`}
                        className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-[0.62rem]"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {product?.name ?? productSlug}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCollection((current) => ({
                              ...current,
                              productSlugs: current.productSlugs.filter((_, i) => i !== index),
                            }))
                          }
                          className="text-muted-foreground hover:text-rosewood"
                          aria-label="Remove product"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-[0.64rem] text-muted-foreground">
              <Checkbox
                checked={collection.isDemo}
                onChange={(event) => setCollection({ ...collection, isDemo: event.target.checked })}
              />
              Demo collection
            </label>
          </div>
        </Drawer>
      )}

      {bundleOpen && (
        <Drawer
          eyebrow={bundle.id ? "Edit bundle" : "New bundle"}
          title="Bundle details"
          onClose={() => setBundleOpen(false)}
          footer={
            <div className="flex items-center justify-between gap-2">
              {bundle.id ? (
                <button
                  type="button"
                  onClick={() => void remove("bundles", bundle.id, bundle.name)}
                  className="text-[0.54rem] font-bold uppercase tracking-[0.08em] text-rosewood hover:underline"
                >
                  Delete
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setBundleOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={saveBundle} disabled={saving}>
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save bundle"}
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bundle-name">Name</Label>
              <Input
                id="bundle-name"
                value={bundle.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setBundle((current) => ({
                    ...current,
                    name,
                    slug:
                      current.id || current.slug
                        ? current.slug
                        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="bundle-slug">Slug</Label>
              <SlugInput
                id="bundle-slug"
                value={bundle.slug}
                onChange={(slug) => setBundle({ ...bundle, slug })}
              />
            </div>
            <div>
              <Label htmlFor="bundle-name-bn">Bengali name</Label>
              <Input
                id="bundle-name-bn"
                value={bundle.nameBn}
                onChange={(event) => setBundle({ ...bundle, nameBn: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bundle-dept">Department</Label>
              <Select
                id="bundle-dept"
                value={bundle.department}
                onChange={(event) => setBundle({ ...bundle, department: event.target.value })}
              >
                {departments.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="bundle-status">Status</Label>
              <Select
                id="bundle-status"
                value={bundle.status}
                onChange={(event) =>
                  setBundle({ ...bundle, status: event.target.value as typeof bundle.status })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="bundle-sort">Sort order</Label>
              <Input
                id="bundle-sort"
                type="number"
                value={bundle.sort}
                onChange={(event) => setBundle({ ...bundle, sort: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bundle-short">Short description</Label>
              <Textarea
                id="bundle-short"
                value={bundle.shortDescription}
                onChange={(event) => setBundle({ ...bundle, shortDescription: event.target.value })}
                className="min-h-20"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="bundle-description">Description</Label>
              <Textarea
                id="bundle-description"
                value={bundle.description}
                onChange={(event) => setBundle({ ...bundle, description: event.target.value })}
                className="min-h-32"
              />
            </div>
            <div>
              <Label htmlFor="bundle-art">Cover artwork</Label>
              <Select
                id="bundle-art"
                value={bundle.coverArt}
                onChange={(event) => setBundle({ ...bundle, coverArt: event.target.value })}
              >
                {icons.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="bundle-discount">Discount type</Label>
              <Select
                id="bundle-discount"
                value={bundle.discountType}
                onChange={(event) =>
                  setBundle({ ...bundle, discountType: event.target.value as typeof bundle.discountType })
                }
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed ৳</option>
                <option value="none">No discount</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="bundle-value">Discount value</Label>
              <Input
                id="bundle-value"
                type="number"
                value={bundle.discountValue}
                onChange={(event) => setBundle({ ...bundle, discountValue: event.target.value })}
                disabled={bundle.discountType === "none"}
              />
            </div>
            <div>
              <Label htmlFor="bundle-palette-a">Palette colour A</Label>
              <Input
                id="bundle-palette-a"
                value={bundle.paletteA}
                onChange={(event) => setBundle({ ...bundle, paletteA: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bundle-palette-b">Palette colour B</Label>
              <Input
                id="bundle-palette-b"
                value={bundle.paletteB}
                onChange={(event) => setBundle({ ...bundle, paletteB: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bundle-seo-title">SEO title</Label>
              <Input
                id="bundle-seo-title"
                value={bundle.seoTitle}
                onChange={(event) => setBundle({ ...bundle, seoTitle: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bundle-seo-description">SEO description</Label>
              <Input
                id="bundle-seo-description"
                value={bundle.seoDescription}
                onChange={(event) => setBundle({ ...bundle, seoDescription: event.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Label className="mb-0">Bundle pieces</Label>
                <span className="text-[0.54rem] text-muted-foreground">{bundle.items.length} selected</span>
              </div>
              <ProductPicker
                products={products}
                selected={bundle.items.map((item) => item.productSlug)}
                onAdd={(productSlug) =>
                  setBundle((current) => ({
                    ...current,
                    items: [
                      ...current.items,
                      { productSlug, quantity: 1, sort: current.items.length + 1 },
                    ],
                  }))
                }
              />
              {bundle.items.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {bundle.items.map((item, index) => {
                    const product = products.find((row) => row.slug === item.productSlug);
                    return (
                      <div
                        key={`${item.productSlug}-${index}`}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-[0.62rem]"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {product?.name ?? item.productSlug}
                        </span>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            setBundle((current) => ({
                              ...current,
                              items: current.items.map((row, i) =>
                                i === index
                                  ? { ...row, quantity: Math.max(1, Number(event.target.value) || 1) }
                                  : row
                              ),
                            }))
                          }
                          className="h-8 w-16 text-center text-[0.62rem]"
                          aria-label="Quantity"
                        />
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveBundleItem(index, -1)}
                            disabled={index === 0}
                            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                            aria-label="Move up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBundleItem(index, 1)}
                            disabled={index === bundle.items.length - 1}
                            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                            aria-label="Move down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setBundle((current) => ({
                                ...current,
                                items: current.items.filter((_, i) => i !== index),
                              }))
                            }
                            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-rosewood/10 hover:text-rosewood"
                            aria-label="Remove piece"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-[0.64rem] text-muted-foreground">
              <Checkbox
                checked={bundle.featured}
                onChange={(event) => setBundle({ ...bundle, featured: event.target.checked })}
              />
              Feature on the homepage
            </label>
            <label className="flex items-center gap-2 text-[0.64rem] text-muted-foreground">
              <Checkbox
                checked={bundle.isDemo}
                onChange={(event) => setBundle({ ...bundle, isDemo: event.target.checked })}
              />
              Demo bundle
            </label>
          </div>
        </Drawer>
      )}
    </div>
  );
}
