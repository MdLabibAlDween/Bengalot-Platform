"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ImageIcon,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };

const pageTabs = [
  { key: "home", label: "Home", path: ["home"] },
  { key: "about", label: "About", path: ["about"] },
  { key: "contact", label: "Contact", path: ["contact"] },
  { key: "faq", label: "FAQ", path: ["faq"] },
  { key: "lookbook", label: "Lookbook", path: ["lookbook"] },
  { key: "policy-privacy", label: "Privacy", path: ["policies", "privacy"] },
  { key: "policy-shipping", label: "Shipping", path: ["policies", "shipping"] },
  { key: "policy-returns", label: "Returns", path: ["policies", "returns"] },
  { key: "policy-terms", label: "Terms", path: ["policies", "terms"] },
  { key: "footer", label: "Footer", path: ["footer"] },
] as const;

function humanize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function get(source: Json, path: (string | number)[]): Json {
  return path.reduce<Json>((value, key) => {
    if (Array.isArray(value) && typeof key === "number") return value[key] ?? "";
    if (value && typeof value === "object") return (value as JsonObject)[key] ?? "";
    return "";
  }, source);
}

function set(source: Json, path: (string | number)[], nextValue: Json): Json {
  if (path.length === 0) return nextValue;
  const [head, ...rest] = path;
  if (Array.isArray(source)) {
    const clone = structuredClone(source);
    const index = typeof head === "number" ? head : Number(head);
    clone[index] = set(clone[index] ?? "", rest, nextValue);
    return clone;
  }
  const clone = { ...((source as JsonObject) ?? {}) };
  const key = String(head);
  clone[key] = set(clone[key] ?? "", rest, nextValue);
  return clone;
}

function isLongText(key: string, value: string) {
  return (
    value.length > 90 ||
    /description|paragraph|quote|answer|caption|text|note|footer|intro|supporting/i.test(key)
  );
}

function isImageKey(key: string) {
  return /image|poster|artwork|photo/i.test(key);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="mb-1.5">{children}</Label>;
}

function StringField({
  path,
  fieldKey,
  value,
  onChange,
  compact = false,
}: {
  path: (string | number)[];
  fieldKey: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const image = isImageKey(fieldKey);
  const long = isLongText(fieldKey, value);
  return (
    <div className={compact ? "" : "md:col-span-2"}>
      <FieldLabel>{humanize(fieldKey)}</FieldLabel>
      {long ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24 text-[0.8rem]"
        />
      ) : (
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {image && value && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--muted)]/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-12 w-12 rounded-md object-cover" />
          <span className="truncate text-[0.58rem] text-muted-foreground">{value}</span>
        </div>
      )}
    </div>
  );
}

function ValueEditor({
  value,
  path,
  fieldKey,
  onChange,
}: {
  value: Json;
  path: (string | number)[];
  fieldKey: string;
  onChange: (value: Json) => void;
}): React.ReactNode {
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)] px-3.5 py-3">
        <span className="text-[0.7rem] font-semibold">{humanize(fieldKey)}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-[var(--color-indigo)]"
        />
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <FieldLabel>{humanize(fieldKey)}</FieldLabel>
        <Input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <StringField
        path={path}
        fieldKey={fieldKey}
        value={value}
        onChange={onChange}
        compact
      />
    );
  }

  if (Array.isArray(value)) {
    const objectArray = value.some((item) => item && typeof item === "object");
    if (!objectArray) {
      return (
        <div className="md:col-span-2">
          <FieldLabel>{humanize(fieldKey)}</FieldLabel>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={String(item ?? "")}
                  onChange={(event) => onChange(set(value, [index], event.target.value))}
                  placeholder={humanize(fieldKey)}
                />
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                  className="grid h-11 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-rosewood/10 hover:text-rosewood"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange([...value, ""])}
            className="mt-2 inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-indigo"
          >
            <Plus className="h-3 w-3" /> Add item
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <FieldLabel>{humanize(fieldKey)}</FieldLabel>
          <button
            type="button"
            onClick={() => {
              const template = value[0];
              const empty = template && typeof template === "object"
                ? Object.fromEntries(
                    Object.entries(template as JsonObject).map(([key, item]) => [
                      key,
                      typeof item === "string" ? "" : item,
                    ])
                  )
                : "";
              onChange([...value, empty as Json]);
            }}
            className="mb-1.5 inline-flex items-center gap-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-indigo"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)] p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {humanize(fieldKey)} {index + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...value];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    onChange(next);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === value.length - 1}
                  onClick={() => {
                    const next = [...value];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    onChange(next);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-rosewood/10 hover:text-rosewood"
                  aria-label="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <ValueEditor
              value={item}
              path={[...path, index]}
              fieldKey={`${fieldKey.replace(/s$/, "")} ${index + 1}`}
              onChange={(nextValue) => onChange(set(value, [index], nextValue))}
            />
          </div>
        ))}
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="md:col-span-2">
        <p className="mb-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {humanize(fieldKey)}
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(value as JsonObject).map(([key, item]) => (
            <ValueEditor
              key={key}
              value={item}
              path={[...path, key]}
              fieldKey={key}
              onChange={(nextValue) => onChange(set(value, [key], nextValue))}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function ContentEditor({ initial }: { initial: Record<string, Json> }) {
  const router = useRouter();
  const [content, setContent] = useState<Json>(initial);
  const [tab, setTab] = useState<(typeof pageTabs)[number]["key"]>("home");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const activeTab = pageTabs.find((item) => item.key === tab) ?? pageTabs[0];
  const page = useMemo(
    () => get(content, [...activeTab.path]),
    [content, activeTab.path]
  );

  const save = async () => {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "site_content", value: content }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save content.");
      return;
    }
    setDirty(false);
    toast.success("Page content saved", {
      description: "The storefront revalidates and shows the new copy on the next load.",
    });
    router.refresh();
  };

  const updatePage = (next: Json) => {
    setContent((current) => set(current, [...activeTab.path], next));
    setDirty(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5">
        {pageTabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full px-3.5 py-2 text-[0.58rem] font-bold uppercase tracking-[0.1em] transition",
              tab === item.key
                ? "bg-indigo text-ivory shadow-sm"
                : "text-muted-foreground hover:bg-[var(--muted)] hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
          <div>
            <h2 className="font-display text-2xl">{pageTabs.find((item) => item.key === tab)?.label} content</h2>
            <p className="mt-1 text-[0.66rem] text-muted-foreground">
              Every visible text block on this page is editable. Arrays (slides, FAQs, paragraphs) can be added, removed and reordered.
            </p>
          </div>
          <span className="rounded-full bg-[var(--muted)] px-3 py-1.5 text-[0.5rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {page && typeof page === "object" ? Object.keys(page).length : 0} groups
          </span>
        </div>

        {page && typeof page === "object" && !Array.isArray(page) ? (
          <div className="space-y-3">
            {Object.entries(page as JsonObject).map(([groupKey, groupValue]) => {
              const open = openGroups[`${tab}.${groupKey}`] ?? true;
              const isObject = groupValue && typeof groupValue === "object";
              return (
                <div key={groupKey} className="rounded-xl border border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((current) => ({
                        ...current,
                        [`${tab}.${groupKey}`]: !open,
                      }))
                    }
                    className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                  >
                    <span className="text-[0.68rem] font-semibold">{humanize(groupKey)}</span>
                    <ChevronDown
                      className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")}
                    />
                  </button>
                  {open && (
                    <div className="border-t border-[var(--color-border)] p-3.5">
                      {isObject ? (
                        <ValueEditor
                          value={groupValue}
                          path={[tab, groupKey]}
                          fieldKey={groupKey}
                          onChange={(nextGroup) => {
                            updatePage(set(page, [groupKey], nextGroup));
                          }}
                        />
                      ) : (
                        <ValueEditor
                          value={groupValue}
                          path={[tab, groupKey]}
                          fieldKey={groupKey}
                          onChange={(nextGroup) => {
                            updatePage(set(page, [groupKey], nextGroup));
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <ValueEditor value={page} path={[...activeTab.path]} fieldKey={activeTab.label} onChange={updatePage} />
        )}
      </div>

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)]/95 px-5 py-4 shadow-lg backdrop-blur">
        <p className="flex items-center gap-2 text-[0.62rem] text-muted-foreground">
          {dirty ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-gold-ink" /> Unsaved content
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 text-jade" /> Content saved
            </>
          )}
        </p>
        <Button type="button" onClick={save} disabled={saving || !dirty}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save page content"}
        </Button>
      </div>
    </div>
  );
}
