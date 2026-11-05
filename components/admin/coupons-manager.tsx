"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn, formatBDT } from "@/lib/utils";

type CouponRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  type: "percent" | "fixed" | "shipping";
  value: number;
  min_spend: number;
  expires_at: string | null;
  status: "active" | "inactive";
  is_demo: boolean;
  product_slugs: string[] | null;
  created_at: string;
};

type ProductOption = {
  slug: string;
  name: string;
  department: string;
  category: string;
  price: number;
  status?: string;
  isDemo?: boolean;
};

const empty = {
  id: "",
  code: "",
  title: "",
  description: "",
  type: "percent" as "percent" | "fixed" | "shipping",
  value: "10",
  minSpend: "0",
  expiresAt: "",
  status: "active" as "active" | "inactive",
  isDemo: false,
  productSlugs: [] as string[],
  scopeLimited: false,
};

export function CouponsManager({
  initial,
  products,
}: {
  initial: CouponRow[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return initial;
    return initial.filter((coupon) =>
      [coupon.code, coupon.title, coupon.description ?? ""].join(" ").toLowerCase().includes(needle)
    );
  }, [initial, query]);

  const filteredProducts = useMemo(() => {
    const needle = productQuery.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.slug, product.name, product.department, product.category]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [productQuery, products]);

  const selectedProducts = useMemo(() => {
    const selected = new Set(form.productSlugs);
    return products.filter((product) => selected.has(product.slug));
  }, [form.productSlugs, products]);

  const startNew = () => {
    setForm(empty);
    setProductQuery("");
    setOpen(true);
  };
  const startEdit = (coupon: CouponRow) => {
    setForm({
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description ?? "",
      type: coupon.type,
      value: String(coupon.value),
      minSpend: String(coupon.min_spend),
      expiresAt: coupon.expires_at?.slice(0, 10) ?? "",
      status: coupon.status,
      isDemo: coupon.is_demo,
      productSlugs: Array.isArray(coupon.product_slugs) ? coupon.product_slugs : [],
      scopeLimited: (coupon.product_slugs?.length ?? 0) > 0,
    });
    setProductQuery("");
    setOpen(true);
  };

  const save = async () => {
    if (form.scopeLimited && form.productSlugs.length === 0) {
      toast.error("Select at least one product, or switch the scope back to all products.");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id || undefined,
        code: form.code,
        title: form.title,
        description: form.description,
        type: form.type,
        value: Number(form.value),
        minSpend: Number(form.minSpend),
        expiresAt: form.expiresAt || undefined,
        status: form.status,
        isDemo: form.isDemo,
        productSlugs: form.scopeLimited ? form.productSlugs : [],
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save the coupon.");
      return;
    }
    toast.success(form.id ? "Coupon updated" : "Coupon created");
    setOpen(false);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    const response = await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete the coupon.");
      return;
    }
    toast.success("Coupon deleted");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active coupons", value: initial.filter((c) => c.status === "active").length },
          { label: "All coupons", value: initial.length },
          { label: "Demo records", value: initial.filter((c) => c.is_demo).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-display text-[1.8rem] leading-none tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search coupons"
              className="h-9 w-[240px] pl-9 text-[0.66rem]"
            />
          </div>
          <Button type="button" size="sm" className="ml-auto" onClick={startNew}>
            <Plus className="h-3.5 w-3.5" /> New coupon
          </Button>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <BadgePercent className="mx-auto h-6 w-6 text-muted-foreground/35" />
            <p className="mt-3 font-display text-xl">No coupons yet.</p>
            <p className="mt-1 text-[0.64rem] text-muted-foreground">
              Create a code and it becomes available at checkout immediately.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Code", "Offer", "Minimum", "Applies to", "Expires", "Status", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {filtered.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold">{coupon.code}</span>
                      {coupon.is_demo && (
                        <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 text-[0.42rem] font-bold uppercase text-gold-ink">Demo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{coupon.title}</p>
                      <p className="text-[0.54rem] text-muted-foreground">
                        {coupon.type === "percent"
                          ? `${coupon.value}% off`
                          : coupon.type === "shipping"
                            ? "Free delivery"
                            : `${formatBDT(coupon.value)} off`}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{coupon.min_spend ? formatBDT(coupon.min_spend) : "None"}</td>
                    <td className="px-4 py-3">
                      {coupon.product_slugs?.length ? (
                        <span className="rounded-full bg-indigo/10 px-2 py-1 text-[0.48rem] font-bold uppercase tracking-[0.06em] text-indigo">
                          {coupon.product_slugs.length} product{coupon.product_slugs.length === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">All products</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No expiry"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]", coupon.status === "active" ? "bg-jade/10 text-jade" : "bg-[var(--muted)] text-muted-foreground")}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => startEdit(coupon)} className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground hover:border-indigo hover:text-indigo" aria-label="Edit coupon">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => remove(coupon.id)} className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood hover:bg-rosewood hover:text-white" aria-label="Delete coupon">
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

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-midnight/55 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Close coupon editor" />
          <div className="relative max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-indigo">{form.id ? "Edit" : "New"}</p>
                <h2 className="mt-1 font-display text-2xl">Coupon builder.</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} placeholder="BENGALOT10" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="10% off your first order" />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-20" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>
                  <option value="percent">Percent off</option>
                  <option value="fixed">Fixed amount off</option>
                  <option value="shipping">Free delivery</option>
                </Select>
              </div>
              <div>
                <Label>{form.type === "percent" ? "Percent" : "Amount (৳)"}</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} disabled={form.type === "shipping"} />
              </div>
              <div>
                <Label>Minimum spend (৳)</Label>
                <Input type="number" value={form.minSpend} onChange={(e) => setForm({ ...form, minSpend: e.target.value })} />
              </div>
              <div>
                <Label>Expires</Label>
                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--muted)]/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] font-semibold">Which products can use this code?</p>
                  <p className="mt-0.5 text-[0.56rem] text-muted-foreground">
                    The discount and minimum spend are calculated only on the selected
                    products.
                  </p>
                </div>
                <div className="flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, scopeLimited: false, productSlugs: [] })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[0.5rem] font-bold uppercase tracking-[0.06em]",
                      !form.scopeLimited
                        ? "bg-indigo text-ivory"
                        : "text-muted-foreground"
                    )}
                  >
                    All products
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, scopeLimited: true })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[0.5rem] font-bold uppercase tracking-[0.06em]",
                      form.scopeLimited
                        ? "bg-indigo text-ivory"
                        : "text-muted-foreground"
                    )}
                  >
                    Selected products
                  </button>
                </div>
              </div>

              {form.scopeLimited && (
                <div className="mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={productQuery}
                      onChange={(event) => setProductQuery(event.target.value)}
                      placeholder="Search products by name, slug or category"
                      className="h-9 flex-1 text-[0.64rem]"
                    />
                    <span className="text-[0.54rem] text-muted-foreground">
                      {form.productSlugs.length} selected
                    </span>
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedProducts.map((product) => (
                        <button
                          key={product.slug}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              productSlugs: form.productSlugs.filter(
                                (slug) => slug !== product.slug
                              ),
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-indigo/10 px-2 py-1 text-[0.5rem] font-semibold text-indigo"
                        >
                          {product.name}
                          <X className="h-2.5 w-2.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--surface)]">
                    {filteredProducts.length === 0 ? (
                      <p className="px-3 py-5 text-center text-[0.58rem] text-muted-foreground">
                        No products match that search.
                      </p>
                    ) : (
                      filteredProducts.map((product) => {
                        const checked = form.productSlugs.includes(product.slug);
                        return (
                          <label
                            key={product.slug}
                            className="flex cursor-pointer items-center gap-2.5 border-b border-[var(--color-border)] px-3 py-2 last:border-b-0 hover:bg-[var(--muted)]/40"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) =>
                                setForm({
                                  ...form,
                                  productSlugs: event.target.checked
                                    ? [...form.productSlugs, product.slug]
                                    : form.productSlugs.filter(
                                        (slug) => slug !== product.slug
                                      ),
                                })
                              }
                              className="h-3.5 w-3.5 accent-[var(--color-indigo)]"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.62rem] font-semibold">
                                {product.name}
                              </span>
                              <span className="block truncate text-[0.5rem] text-muted-foreground">
                                {product.department} / {product.category} · {product.slug}
                              </span>
                            </span>
                            <span className="shrink-0 text-[0.54rem] tabular-nums text-muted-foreground">
                              {formatBDT(product.price)}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          productSlugs: filteredProducts.map((product) => product.slug),
                        })
                      }
                      className="text-[0.5rem] font-bold uppercase tracking-[0.06em] text-indigo hover:underline"
                    >
                      Select visible
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, productSlugs: [] })}
                      className="text-[0.5rem] font-bold uppercase tracking-[0.06em] text-muted-foreground hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[0.62rem] text-muted-foreground">
                <input type="checkbox" checked={form.isDemo} onChange={(e) => setForm({ ...form, isDemo: e.target.checked })} className="h-4 w-4 accent-[var(--color-indigo)]" />
                Demo coupon
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="button" onClick={save} disabled={saving}>
                  <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save coupon"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
