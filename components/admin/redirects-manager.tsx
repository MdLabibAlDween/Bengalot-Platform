"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RedirectRule } from "@/lib/admin/settings";

const emptyRule = {
  source_path: "",
  destination_url: "",
  status_code: 301,
  enabled: true,
  note: "",
};

export function RedirectsManager({ initial }: { initial: RedirectRule[] }) {
  const router = useRouter();
  const [rules, setRules] = useState(initial);
  const [newRule, setNewRule] = useState(emptyRule);
  const [savingId, setSavingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<RedirectRule>) => {
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const save = async (rule: RedirectRule) => {
    setSavingId(rule.id);
    const response = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", ...rule }),
    });
    const result = await response.json().catch(() => ({}));
    setSavingId(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save the redirect.");
      return;
    }
    toast.success("Redirect saved");
    router.refresh();
  };

  const create = async () => {
    const response = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...newRule }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not create the redirect.");
      return;
    }
    setRules((current) => [...current, result.redirect as RedirectRule]);
    setNewRule(emptyRule);
    toast.success("Redirect created");
    router.refresh();
  };

  const remove = async (rule: RedirectRule) => {
    if (!confirm(`Delete ${rule.source_path}?`)) return;
    const response = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: rule.id }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete the redirect.");
      return;
    }
    setRules((current) => current.filter((item) => item.id !== rule.id));
    toast.success("Redirect deleted");
    router.refresh();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rules.length) return;
    const next = [...rules];
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((rule, itemIndex) => ({ ...rule, sort: itemIndex + 1 }));
    setRules(ordered);
    await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        items: ordered.map((rule) => ({ id: rule.id, sort: rule.sort })),
      }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-indigo/15 bg-indigo/[0.04] p-4 text-[0.66rem] leading-relaxed text-muted-foreground">
        Rules are sorted top to bottom. Use a source path like <code>/old-page</code> and a full
        URL or a relative destination. Enabled rules are exposed through the public site config
        for the redirect gate.
      </div>

      <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl">URL redirector & sorter</h2>
          <span className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {rules.length} rules
          </span>
        </div>

        <div className="space-y-2">
          {rules.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-[0.68rem] text-muted-foreground">
              No redirects yet. Add the first legacy URL below.
            </div>
          )}
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--canvas-soft,#fbf7ef)] p-3"
            >
              <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_110px_70px]">
                <div>
                  <Label htmlFor={`source-${rule.id}`}>Source path</Label>
                  <Input
                    id={`source-${rule.id}`}
                    value={rule.source_path}
                    onChange={(event) => update(rule.id, { source_path: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`destination-${rule.id}`}>Destination</Label>
                  <Input
                    id={`destination-${rule.id}`}
                    value={rule.destination_url}
                    onChange={(event) => update(rule.id, { destination_url: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`status-${rule.id}`}>Status</Label>
                  <Select
                    id={`status-${rule.id}`}
                    value={String(rule.status_code)}
                    onChange={(event) => update(rule.id, { status_code: Number(event.target.value) })}
                  >
                    <option value="301">301</option>
                    <option value="302">302</option>
                    <option value="307">307</option>
                    <option value="308">308</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`enabled-${rule.id}`}>Live</Label>
                  <label className="flex h-11 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3">
                    <input
                      id={`enabled-${rule.id}`}
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(event) => update(rule.id, { enabled: event.target.checked })}
                      className="h-4 w-4 accent-[var(--color-indigo)]"
                    />
                    <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em]">
                      {rule.enabled ? "On" : "Off"}
                    </span>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`note-${rule.id}`}>Note</Label>
                  <Input
                    id={`note-${rule.id}`}
                    value={rule.note ?? ""}
                    onChange={(event) => update(rule.id, { note: event.target.value })}
                    placeholder="Optional context for staff"
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === rules.length - 1}
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-[var(--muted)] disabled:opacity-20"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => remove(rule)}
                    className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:bg-rosewood/10 hover:text-rosewood"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => save(rule)}
                    disabled={savingId === rule.id}
                    className="inline-flex h-7 items-center gap-1 rounded-full bg-indigo px-3 text-[0.5rem] font-bold uppercase tracking-[0.08em] text-ivory disabled:opacity-50"
                  >
                    <Check className="h-3 w-3" /> {savingId === rule.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <h2 className="font-display text-xl">Add a redirect</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-4">
          <div>
            <Label htmlFor="new-source">Source path</Label>
            <Input
              id="new-source"
              value={newRule.source_path}
              onChange={(event) => setNewRule({ ...newRule, source_path: event.target.value })}
              placeholder="/old-page"
            />
          </div>
          <div>
            <Label htmlFor="new-destination">Destination</Label>
            <Input
              id="new-destination"
              value={newRule.destination_url}
              onChange={(event) => setNewRule({ ...newRule, destination_url: event.target.value })}
              placeholder="/new-page"
            />
          </div>
          <div>
            <Label htmlFor="new-status">Status</Label>
            <Select
              id="new-status"
              value={String(newRule.status_code)}
              onChange={(event) => setNewRule({ ...newRule, status_code: Number(event.target.value) })}
            >
              <option value="301">301</option>
              <option value="302">302</option>
              <option value="307">307</option>
              <option value="308">308</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={create} className="w-full">
              <Plus className="h-3.5 w-3.5" /> Add rule
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
