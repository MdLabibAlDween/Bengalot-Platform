"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type AdminField = {
  path: string;
  label: string;
  type?: "text" | "email" | "number" | "boolean" | "textarea" | "select" | "list" | "json";
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
};

function getValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object") return (value as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

function withValue(source: Record<string, unknown>, path: string, value: unknown) {
  const next = structuredClone(source);
  const keys = path.split(".");
  let cursor: Record<string, unknown> = next;
  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = value;
  return next;
}

function displayValue(value: unknown, field: AdminField) {
  if (field.type === "list") return Array.isArray(value) ? value.join(", ") : String(value ?? "");
  if (field.type === "json") return JSON.stringify(value ?? {}, null, 2);
  return value ?? "";
}

export function AdminSettingsForm({
  settingKey,
  initialValue,
  fields,
  submitLabel = "Save changes",
  columns = 2,
}: {
  settingKey: string;
  initialValue: Record<string, unknown>;
  fields: AdminField[];
  submitLabel?: string;
  columns?: 1 | 2 | 3;
}) {
  const router = useRouter();
  const [value, setValue] = useState<Record<string, unknown>>(initialValue);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rawValues, setRawValues] = useState<Record<string, string>>({});

  const gridClass = useMemo(
    () =>
      columns === 1
        ? "grid gap-4"
        : columns === 3
          ? "grid gap-4 md:grid-cols-3"
          : "grid gap-4 md:grid-cols-2",
    [columns]
  );

  const update = (path: string, nextValue: unknown) => {
    setValue((current) => withValue(current, path, nextValue));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: settingKey, value }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save.");
      return;
    }
    setDirty(false);
    toast.success("Saved", { description: "The storefront will pick this up on the next load." });
    router.refresh();
  };

  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)] sm:p-6">
      <div className={gridClass}>
        {fields.map((field) => {
          const fieldValue = getValue(value, field.path);
          if (field.type === "boolean") {
            return (
              <label
                key={field.path}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)] px-3.5 py-3 md:col-span-1"
              >
                <span>
                  <span className="block text-[0.7rem] font-semibold">{field.label}</span>
                  {field.help && (
                    <span className="mt-0.5 block text-[0.6rem] leading-relaxed text-muted-foreground">
                      {field.help}
                    </span>
                  )}
                </span>
                <input
                  type="checkbox"
                  id={`field-${settingKey}-${field.path.replace(/\./g, "-")}`}
                  checked={Boolean(fieldValue)}
                  onChange={(event) => update(field.path, event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-indigo)]"
                />
              </label>
            );
          }

          const raw = rawValues[field.path] ?? String(displayValue(fieldValue, field));
          const common = {
            id: `field-${settingKey}-${field.path.replace(/\./g, "-")}`,
            value: raw,
            placeholder: field.placeholder,
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
              const nextRaw = event.target.value;
              setRawValues((current) => ({ ...current, [field.path]: nextRaw }));
              if (field.type === "list") {
                const numeric = Array.isArray(fieldValue) && fieldValue.every((item) => typeof item === "number");
                const list = nextRaw
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);
                update(field.path, numeric ? list.map(Number).filter((item) => Number.isFinite(item)) : list);
              } else if (field.type === "number") {
                update(field.path, nextRaw === "" ? 0 : Number(nextRaw));
              } else if (field.type === "json") {
                try {
                  update(field.path, JSON.parse(nextRaw));
                } catch {
                  setDirty(true);
                }
              } else {
                update(field.path, nextRaw);
              }
            },
          };

          return (
            <div key={field.path} className={field.type === "textarea" || field.type === "json" ? "md:col-span-2" : ""}>
              <Label htmlFor={common.id}>{field.label}</Label>
              {field.type === "textarea" || field.type === "json" ? (
                <Textarea {...common} className={field.type === "json" ? "min-h-36 font-mono text-[0.68rem]" : ""} />
              ) : field.type === "select" ? (
                <Select {...common}>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  {...common}
                  type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                />
              )}
              {field.help && (
                <p className="mt-1 text-[0.58rem] leading-relaxed text-muted-foreground">{field.help}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <p className="flex items-center gap-1.5 text-[0.6rem] text-muted-foreground">
          {dirty ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-gold-ink" /> Unsaved changes
            </>
          ) : (
            <>
              <Check className="h-3 w-3 text-jade" /> All changes saved
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setValue(initialValue);
              setRawValues({});
              setDirty(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3.5 py-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted-foreground transition hover:border-ink hover:text-ink"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <Button type="button" onClick={save} disabled={saving || !dirty} size="sm">
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
