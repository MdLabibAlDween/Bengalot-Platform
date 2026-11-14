"use client";

import {
  Check,
  Loader2,
  Plus,
  Save,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import type { Product, PromoCode } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

type EditorRow = PromoCode;

const blankPromo: EditorRow = {
  code: "",
  description: "",
  type: "percent",
  value: 10,
  minSubtotal: 0,
  maxDiscount: null,
  active: true,
  expiresAt: null,
  productSlugs: [],
};

function toRows(codes: PromoCode[]): EditorRow[] {
  return codes.map((promo) => ({ ...promo, productSlugs: promo.productSlugs ?? [] }));
}

export function PromoCodeEditor({
  codes,
  products,
}: {
  codes: PromoCode[];
  products: Pick<Product, "id" | "title" | "slug" | "is_published">[];
}) {
  const [rows, setRows] = useState<EditorRow[]>(toRows(codes));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof EditorRow>(
    index: number,
    key: K,
    value: EditorRow[K],
  ) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
    setState("idle");
    setMessage("");
  }

  function addRow() {
    setRows((current) => [...current, { ...blankPromo }]);
    setState("idle");
    setMessage("");
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
    setState("idle");
    setMessage("");
  }

  function toggleProduct(index: number, slug: string) {
    setRows((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        const productSlugs = row.productSlugs.includes(slug)
          ? row.productSlugs.filter((item) => item !== slug)
          : [...row.productSlugs, slug];
        return { ...row, productSlugs };
      }),
    );
    setState("idle");
    setMessage("");
  }

  async function handleSave() {
    setState("saving");
    setMessage("");

    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          rows.map((row) => ({
            ...row,
            code: row.code.trim().toUpperCase(),
            description: row.description.trim(),
            maxDiscount:
              row.type === "percent" && row.maxDiscount
                ? Number(row.maxDiscount)
                : null,
            expiresAt: row.expiresAt || null,
          })),
        ),
      });
      const data = (await response.json()) as {
        message?: string;
        codes?: PromoCode[];
      };
      if (!response.ok) throw new Error(data.message ?? "Could not save.");

      setRows(toRows(data.codes ?? rows));
      setState("saved");
      setMessage("Saved. The checkout can use these codes immediately.");
      window.setTimeout(() => setState("idle"), 2400);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[1.2rem] border border-line bg-cream p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal text-cream">
            <TicketPercent className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.72rem] font-bold text-ink">
              {rows.length} {rows.length === 1 ? "code" : "codes"} configured
            </p>
            <p className="mt-0.5 text-[0.62rem] leading-relaxed text-muted">
              Codes are checked again on the server when the order is placed, so
              a discount cannot be changed in the browser.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={addRow} className="btn btn-outline btn-sm">
            <Plus className="size-3.5" aria-hidden="true" />
            Add code
          </button>
          <button
            type="button"
            onClick={handleSave}
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
            {state === "saving" ? "Saving" : state === "saved" ? "Saved" : "Save codes"}
          </button>
        </div>
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

      {!rows.length ? (
        <div className="rounded-[1.2rem] border border-dashed border-line-strong bg-cream px-6 py-14 text-center">
          <p className="font-display text-xl text-ink">No promo codes yet.</p>
          <p className="mx-auto mt-1 max-w-md text-[0.7rem] leading-relaxed text-muted">
            Add a code to offer a percentage or fixed discount at checkout. Codes
            can have a minimum subtotal, a maximum discount and an expiry date.
          </p>
          <button type="button" onClick={addRow} className="btn btn-primary btn-sm mt-4">
            <Plus className="size-3.5" aria-hidden="true" />
            Create the first code
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((row, index) => (
          <section
            key={index}
            className="rounded-[1.2rem] border border-line bg-cream p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    row.active ? "bg-teal" : "bg-muted/40"
                  }`}
                  aria-hidden="true"
                />
                <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-muted">
                  Code {String(index + 1).padStart(2, "0")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="grid size-7 place-items-center rounded-full border border-line text-muted transition-colors hover:border-coral/40 hover:text-coral"
                aria-label={`Remove promo code ${row.code || index + 1}`}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`promo-code-${index}`} className="field-label">
                  Code
                </label>
                <input
                  id={`promo-code-${index}`}
                  value={row.code}
                  onChange={(event) =>
                    update(index, "code", event.target.value.toUpperCase())
                  }
                  placeholder="WELCOME10"
                  className="field font-mono uppercase"
                  required
                />
              </div>
              <div>
                <label htmlFor={`promo-type-${index}`} className="field-label">
                  Discount type
                </label>
                <select
                  id={`promo-type-${index}`}
                  value={row.type}
                  onChange={(event) =>
                    update(index, "type", event.target.value as EditorRow["type"])
                  }
                  className="field"
                >
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`promo-description-${index}`} className="field-label">
                  Label shown at checkout
                </label>
                <input
                  id={`promo-description-${index}`}
                  value={row.description}
                  onChange={(event) => update(index, "description", event.target.value)}
                  placeholder="10% off the semester reset"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor={`promo-value-${index}`} className="field-label">
                  {row.type === "percent" ? "Percentage (1–100)" : "Amount (৳)"}
                </label>
                <input
                  id={`promo-value-${index}`}
                  type="number"
                  min="1"
                  max={row.type === "percent" ? 100 : undefined}
                  value={row.value}
                  onChange={(event) =>
                    update(index, "value", Number(event.target.value) || 0)
                  }
                  className="field"
                />
              </div>
              <div>
                <label htmlFor={`promo-min-${index}`} className="field-label">
                  Minimum subtotal (৳)
                </label>
                <input
                  id={`promo-min-${index}`}
                  type="number"
                  min="0"
                  value={row.minSubtotal}
                  onChange={(event) =>
                    update(index, "minSubtotal", Number(event.target.value) || 0)
                  }
                  className="field"
                />
              </div>
              {row.type === "percent" ? (
                <div>
                  <label htmlFor={`promo-max-${index}`} className="field-label">
                    Maximum discount (৳)
                  </label>
                  <input
                    id={`promo-max-${index}`}
                    type="number"
                    min="0"
                    value={row.maxDiscount ?? ""}
                    onChange={(event) =>
                      update(
                        index,
                        "maxDiscount",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    placeholder="No cap"
                    className="field"
                  />
                </div>
              ) : null}
              <div>
                <label htmlFor={`promo-expiry-${index}`} className="field-label">
                  Expires
                </label>
                <input
                  id={`promo-expiry-${index}`}
                  type="date"
                  value={row.expiresAt ?? ""}
                  onChange={(event) =>
                    update(index, "expiresAt", event.target.value || null)
                  }
                  className="field"
                />
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-line bg-surface p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.1em] text-muted">
                  Applies to
                </p>
                <span className="text-[0.56rem] font-semibold text-teal">
                  {row.productSlugs.length
                    ? `${row.productSlugs.length} selected product${row.productSlugs.length === 1 ? "" : "s"}`
                    : "All products"}
                </span>
              </div>
              <div className="mt-2 grid max-h-40 gap-1 overflow-y-auto sm:grid-cols-2">
                {products.map((product) => (
                  <label
                    key={product.slug}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 text-[0.6rem] text-ink-soft hover:bg-paper"
                  >
                    <input
                      type="checkbox"
                      checked={row.productSlugs.includes(product.slug)}
                      onChange={() => toggleProduct(index, product.slug)}
                      className="size-3.5 accent-[var(--teal)]"
                    />
                    <span className="truncate">{product.title}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[0.55rem] leading-relaxed text-muted">
                Leave every box empty to apply this code to the whole bag.
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-3.5 py-2.5">
              <p className="text-[0.6rem] leading-relaxed text-muted">
                {row.type === "percent"
                  ? `${row.value}% off${row.maxDiscount ? `, capped at ${formatMoney(row.maxDiscount)}` : ""}${row.minSubtotal ? ` · min. ${formatMoney(row.minSubtotal)}` : ""}`
                  : `${formatMoney(row.value)} off${row.minSubtotal ? ` · min. ${formatMoney(row.minSubtotal)}` : ""}`}
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-[0.62rem] font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={(event) => update(index, "active", event.target.checked)}
                  className="size-3.5 accent-[var(--teal)]"
                />
                Active
              </label>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
