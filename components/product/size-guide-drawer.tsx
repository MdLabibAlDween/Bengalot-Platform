"use client";

import { useState } from "react";
import { ChevronDown, Ruler, Scissors, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { WHATSAPP_LINK } from "@/lib/constants";
import { getCategory } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Product, SizeGuideTemplate } from "@/lib/types";

type MeasurementUnit = "in" | "cm";

const INCH_TO_CM = 2.54;
const CM_TO_INCH = 1 / 2.54;

function formatNumber(value: number, decimals: number) {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(decimals);
}

function isSkippedColumn(column: string) {
  return /^(size|age|approx\.? age|eu|uk|us men|us women|measure)$/i.test(
    column.trim()
  );
}

function measurementSource(
  value: string,
  column: string,
  guideUnit: string
): MeasurementUnit | null {
  if (isSkippedColumn(column)) return null;

  const hasInches = /"/.test(value) || /\bin\b/i.test(value);
  const hasCentimetres = /\bcm\b/i.test(value) || /\dcm\b/i.test(value);

  if (hasInches && hasCentimetres) return null;
  if (hasInches) return "in";
  if (hasCentimetres) return "cm";
  if (/\bmm\b/i.test(value) || /\bm\b/i.test(value)) return null;
  if (/\(cm\)/i.test(column)) return "cm";
  if (/\(in\)/i.test(column)) return "in";
  if (/^inches$/i.test(guideUnit.trim())) return "in";
  if (/^centimetres$|^centimeters$/i.test(guideUnit.trim())) return "cm";
  return null;
}

function stripUnit(value: string) {
  return value
    .replace(/"/g, "")
    .replace(/\bcm\b/gi, "")
    .replace(/\bin\b/gi, "")
    .replace(/\bcircumference\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function convertNumbers(
  value: string,
  from: MeasurementUnit,
  to: MeasurementUnit
) {
  const numbers = value.match(/\d+(?:\.\d+)?/g);
  if (!numbers) return null;

  const converted = numbers.map((raw) => {
    const number = Number(raw);
    return to === "cm"
      ? formatNumber(
          from === "in" ? number * INCH_TO_CM : number,
          from === "in" ? 0 : 1
        )
      : formatNumber(
          from === "cm" ? number * CM_TO_INCH : number,
          from === "cm" ? 1 : 0
        );
  });

  const range = value.match(/\d+(?:\.\d+)?(\s*[–\-×x]\s*)\d+(?:\.\d+)?/i);
  return converted.join(range?.[1] ?? "–");
}

function formatForUnit(
  value: string,
  column: string,
  guideUnit: string,
  target: MeasurementUnit
) {
  const trimmed = value.trim();
  if (!trimmed || !/\d/.test(trimmed)) return value;

  const source = measurementSource(trimmed, column, guideUnit);
  if (!source) return value;
  if (source === target) return stripUnit(trimmed) || value;

  return convertNumbers(trimmed, source, target) ?? value;
}

function hasConvertibleMeasurements(guide: SizeGuideTemplate) {
  return guide.rows.some((row) =>
    row.some((cell, index) =>
      Boolean(
        measurementSource(cell, guide.columns[index] ?? "", guide.unit)
      )
    )
  );
}

function defaultUnitFor(guide: SizeGuideTemplate): MeasurementUnit {
  for (const row of guide.rows) {
    for (let index = 0; index < row.length; index += 1) {
      const source = measurementSource(
        row[index],
        guide.columns[index] ?? "",
        guide.unit
      );
      if (source) return source;
    }
  }
  return "in";
}

function sizeTableFor(guide: SizeGuideTemplate) {
  if (!/^(size|eu)$/i.test((guide.columns[0] ?? "").trim())) return null;

  return {
    sizeLabels: guide.rows.map((row) => row[0] ?? ""),
    measurementRows: guide.columns.slice(1).map((label, index) => ({
      label,
      values: guide.rows.map((row) => row[index + 1] ?? ""),
    })),
  };
}

function fitMetaFor(product: Product, guide: SizeGuideTemplate) {
  const text = `${guide.id} ${guide.name} ${product.category}`.toLowerCase();
  if (/bags|tote|backpack|duffel|wallet/.test(text)) {
    return { label: "Guide", value: "Dimensions" };
  }
  if (/watches/.test(text)) return { label: "Guide", value: "Case size" };
  if (/jewelry|jewellery/.test(text)) {
    return { label: "Guide", value: "Measurements" };
  }
  if (/caps/.test(text)) return { label: "Fit", value: "Adjustable" };
  if (/belts/.test(text)) return { label: "Fit", value: "Adjustable" };
  if (/saree/.test(text)) return { label: "Fit", value: "Free size" };
  if (/hijab|scarf/.test(text)) return { label: "Fit", value: "One size" };
  if (/footwear|shoe|sandal|heel|sneaker|loafer/.test(text)) {
    return { label: "Fit", value: "True to size" };
  }
  if (/kids|child|baby|junior|onesie|nightwear/.test(text)) {
    return { label: "Fit", value: "Room to grow" };
  }
  if (/bottoms|trouser|chino|palazzo|jogger|shorts/.test(text)) {
    return { label: "Fit", value: "Comfort fit" };
  }
  if (/ethnic|panjabi|kurti|abaya|dress/.test(text)) {
    return { label: "Fit", value: "Relaxed drape" };
  }
  if (/tops|shirt|tee|polo|hoodie|sweatshirt/.test(text)) {
    return { label: "Fit", value: "Relaxed fit" };
  }
  return { label: "Fit", value: "Regular fit" };
}

export function SizeGuideDrawer({
  product,
  guide,
  open,
  onOpenChange,
}: {
  product: Product;
  guide: SizeGuideTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [unit, setUnit] = useState<MeasurementUnit>(() => defaultUnitFor(guide));
  const [showGuide, setShowGuide] = useState(false);

  const category = getCategory(product.department, product.category);
  const title = category?.name ?? guide.name;
  const fitMeta = fitMetaFor(product, guide);
  const table = sizeTableFor(guide);
  const convertible = hasConvertibleMeasurements(guide);
  const unitName = unit === "in" ? "inches" : "centimetres";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" className="max-w-[640px] p-0">
        <DialogTitle className="sr-only">{product.name} size guide</DialogTitle>
        <DialogDescription className="sr-only">
          Measurements and fit guidance for the {product.name}.
        </DialogDescription>

        <div className="flex h-full flex-col bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 pb-5 pt-6 sm:px-8">
            <div className="pr-12">
              <p className="flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.22em] text-gold-ink">
                <span className="h-px w-5 bg-gold" />
                Bengalot · Size &amp; fit
              </p>
              <h2 className="mt-2 font-display text-[2rem] leading-none sm:text-[2.25rem]">
                {title}
              </h2>
              <p className="mt-1.5 text-[0.72rem] text-muted-foreground">
                {product.name} · {guide.name}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {fitMeta.label}
                </span>
                <span className="text-[0.72rem] font-semibold text-foreground">
                  {fitMeta.value}
                </span>
              </div>

              {convertible && (
                <div
                  className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-0.5"
                  role="group"
                  aria-label="Measurement unit"
                >
                  {(["in", "cm"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setUnit(option)}
                      aria-pressed={unit === option}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] transition",
                        unit === option
                          ? "bg-midnight text-ivory shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option === "in" ? "IN" : "CM"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
            <p className="mb-2 text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground sm:hidden">
              Swipe to see the full chart
            </p>
            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              <div className="overflow-x-auto">
                {table ? (
                  <table
                    aria-label={`${product.name} size chart`}
                    className="w-full min-w-[540px] border-collapse text-left text-[0.72rem]"
                  >
                    <thead>
                      <tr className="bg-[var(--surface-2)]">
                        <th className="whitespace-nowrap px-3.5 py-3 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                          Measurement points
                        </th>
                        {table.sizeLabels.map((size, index) => (
                          <th
                            key={`${size}-${index}`}
                            className="whitespace-nowrap px-3 py-3 text-center text-[0.66rem] font-bold uppercase tracking-[0.08em] text-foreground"
                          >
                            {size}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.measurementRows.map((row, rowIndex) => (
                        <tr
                          key={row.label}
                          className={cn(
                            "border-t border-[var(--border)] transition hover:bg-gold/[0.035]",
                            rowIndex % 2 === 1 && "bg-[var(--surface-2)]/45"
                          )}
                        >
                          <th
                            scope="row"
                            className="whitespace-nowrap px-3.5 py-3 text-left text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-foreground/80"
                          >
                            {row.label}
                          </th>
                          {row.values.map((value, index) => (
                            <td
                              key={`${row.label}-${index}`}
                              className="whitespace-nowrap px-3 py-3 text-center tabular-nums text-muted-foreground"
                            >
                              {formatForUnit(
                                value,
                                row.label,
                                guide.unit,
                                unit
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table
                    aria-label={`${product.name} measurements`}
                    className="w-full min-w-[440px] border-collapse text-left text-[0.72rem]"
                  >
                    <thead>
                      <tr className="bg-[var(--surface-2)]">
                        {guide.columns.map((column, index) => (
                          <th
                            key={`${column}-${index}`}
                            className="whitespace-nowrap px-3.5 py-3 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted-foreground"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {guide.rows.map((row, rowIndex) => (
                        <tr
                          key={`${guide.id}-${rowIndex}`}
                          className={cn(
                            "border-t border-[var(--border)] transition hover:bg-gold/[0.035]",
                            rowIndex % 2 === 1 && "bg-[var(--surface-2)]/45"
                          )}
                        >
                          {row.map((cell, index) =>
                            index === 0 ? (
                              <th
                                key={index}
                                scope="row"
                                className="whitespace-nowrap px-3.5 py-3 text-left text-[0.64rem] font-semibold uppercase tracking-[0.08em] text-foreground/80"
                              >
                                {cell}
                              </th>
                            ) : (
                              <td
                                key={index}
                                className="whitespace-normal px-3.5 py-3 align-top tabular-nums text-muted-foreground"
                              >
                                {formatForUnit(
                                  cell,
                                  guide.columns[index] ?? "",
                                  guide.unit,
                                  unit
                                )}
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <p className="mt-3 text-[0.66rem] text-muted-foreground">
              {convertible
                ? `Measurements shown in ${unitName} unless noted.`
                : "Product-specific measurements."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="button"
                onClick={() => setShowGuide((current) => !current)}
                aria-expanded={showGuide}
                className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-gold-ink underline decoration-gold/40 underline-offset-4 transition hover:text-foreground"
              >
                {showGuide ? "Hide measurement guide" : "View measurement guide"}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition",
                    showGuide && "rotate-180"
                  )}
                />
              </button>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-[var(--color-jade)] underline-offset-4 transition hover:underline"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                Ask for fit advice
              </a>
            </div>

            {showGuide && (
              <div className="mt-4 space-y-5 border-t border-[var(--border)] pt-5">
                <p className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-muted-foreground">
                  <Scissors className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                  {guide.note}
                </p>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-gold-ink">
                    <Ruler className="h-3.5 w-3.5" /> How to measure
                  </p>
                  <ol className="mt-3 space-y-3">
                    {guide.howTo.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="font-display text-sm leading-tight text-gold-ink">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      icon: Ruler,
                      title: "Snug, not tight",
                      text: "Keep the tape level and comfortable.",
                    },
                    {
                      icon: Sparkles,
                      title: "Allow for ease",
                      text: "Our cuts include room to move.",
                    },
                  ].map(({ icon: Icon, title: tipTitle, text }) => (
                    <div
                      key={tipTitle}
                      className="rounded-xl border border-[var(--border)] p-3"
                    >
                      <Icon className="h-3.5 w-3.5 text-gold" />
                      <p className="mt-2 text-[0.75rem] font-semibold">
                        {tipTitle}
                      </p>
                      <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
