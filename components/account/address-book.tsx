"use client";

import {
  Check,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { MAX_SAVED_ADDRESSES } from "@/lib/addresses";
import type { SavedAddress } from "@/lib/types";
import { cn } from "@/lib/utils";

type AddressForm = Omit<SavedAddress, "id"> & { id?: string };

function emptyForm(fullName = "", phone = ""): AddressForm {
  return {
    label: "Home",
    fullName,
    phone,
    address: "",
    city: "",
    district: "",
    isDefault: false,
  };
}

export function AddressBook({
  initial,
  defaultName,
  defaultPhone,
}: {
  initial: SavedAddress[];
  defaultName: string;
  defaultPhone: string;
}) {
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<AddressForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<"idle" | "error" | "saved">("idle");
  const [message, setMessage] = useState("");

  function startNew() {
    setEditing(
      emptyForm(defaultName, defaultPhone),
    );
    setState("idle");
    setMessage("");
  }

  function saveDraft() {
    if (!editing) return;
    const draft = editing;
    if (
      !draft.label.trim() ||
      !draft.fullName.trim() ||
      !draft.phone.trim() ||
      draft.address.trim().length < 8 ||
      !draft.city.trim() ||
      !draft.district.trim()
    ) {
      setState("error");
      setMessage("Fill in the name, phone, address, town and district.");
      return;
    }

    setAddresses((current) => {
      const next = draft.id
        ? current.map((address) =>
            address.id === draft.id ? { ...address, ...draft, id: draft.id! } : address,
          )
        : [...current, { ...draft, id: `addr-${crypto.randomUUID()}` }];
      if (draft.isDefault || next.length === 1) {
        return next.map((address) => ({
          ...address,
          isDefault: address.id === (draft.id ?? next[next.length - 1]?.id),
        }));
      }
      return next;
    });
    setEditing(null);
    setState("idle");
    setMessage("");
  }

  function removeAddress(id: string) {
    setAddresses((current) => {
      const next = current.filter((address) => address.id !== id);
      if (next.length && !next.some((address) => address.isDefault)) {
        const first = next[0];
        if (first) next[0] = { ...first, isDefault: true };
      }
      return next;
    });
    setState("idle");
  }

  function makeDefault(id: string) {
    setAddresses((current) =>
      current.map((address) => ({ ...address, isDefault: address.id === id })),
    );
    setState("idle");
  }

  async function save() {
    setSaving(true);
    setState("idle");
    setMessage("");
    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses }),
      });
      const data = (await response.json()) as {
        message?: string;
        ok?: boolean;
        addresses?: SavedAddress[];
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "The address book could not be saved.");
      }
      setAddresses(data.addresses ?? addresses);
      setState("saved");
      setMessage("Saved. These addresses are ready at checkout.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "The address book could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.62rem] text-muted">
          {addresses.length} of {MAX_SAVED_ADDRESSES} saved
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startNew}
            disabled={addresses.length >= MAX_SAVED_ADDRESSES || Boolean(editing)}
            className="btn btn-outline btn-sm"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add address
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || addresses.length === 0}
            className="btn btn-primary btn-sm"
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : state === "saved" ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Save className="size-3.5" aria-hidden="true" />
            )}
            {saving ? "Saving" : state === "saved" ? "Saved" : "Save addresses"}
          </button>
        </div>
      </div>

      {message ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl border px-4 py-2.5 text-[0.7rem] font-medium",
            state === "error"
              ? "border-coral/30 bg-coral/[0.08] text-coral-deep"
              : "border-teal/20 bg-teal-soft/40 text-teal",
          )}
        >
          {message}
        </div>
      ) : null}

      {editing ? (
        <section className="rounded-[1.2rem] border border-teal/25 bg-teal-soft/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.11em] text-teal">
              {editing.id ? "Edit address" : "New address"}
            </p>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="grid size-7 place-items-center rounded-full border border-line bg-surface text-muted"
              aria-label="Close address form"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="address-label" className="field-label">Label</label>
              <input
                id="address-label"
                value={editing.label}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, label: event.target.value } : current,
                  )
                }
                className="field"
                placeholder="Home, University, Office"
              />
            </div>
            <div>
              <label htmlFor="address-name" className="field-label">Full name</label>
              <input
                id="address-name"
                value={editing.fullName}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, fullName: event.target.value } : current,
                  )
                }
                className="field"
              />
            </div>
            <div>
              <label htmlFor="address-phone" className="field-label">Phone</label>
              <input
                id="address-phone"
                value={editing.phone}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, phone: event.target.value } : current,
                  )
                }
                className="field"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="address-city" className="field-label">Town / area</label>
              <input
                id="address-city"
                value={editing.city}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, city: event.target.value } : current,
                  )
                }
                className="field"
              />
            </div>
            <div>
              <label htmlFor="address-district" className="field-label">District</label>
              <input
                id="address-district"
                value={editing.district}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, district: event.target.value } : current,
                  )
                }
                className="field"
                placeholder="Faridpur"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address-line" className="field-label">Full address</label>
              <textarea
                id="address-line"
                rows={3}
                value={editing.address}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, address: event.target.value } : current,
                  )
                }
                className="field resize-y"
                placeholder="House, road, area"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 text-[0.68rem] font-semibold text-ink sm:col-span-2">
              <input
                type="checkbox"
                checked={editing.isDefault}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, isDefault: event.target.checked } : current,
                  )
                }
                className="size-4 accent-[var(--teal)]"
              />
              Use this as my default address
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="button" onClick={saveDraft} className="btn btn-primary btn-sm">
              <Check className="size-3.5" aria-hidden="true" />
              Add to address book
            </button>
          </div>
        </section>
      ) : null}

      {addresses.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className={cn(
                "rounded-[1.2rem] border bg-cream p-4",
                address.isDefault ? "border-teal/30" : "border-line",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft/50 px-2.5 py-1 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-teal">
                      <MapPin className="size-3" aria-hidden="true" />
                      {address.label}
                    </span>
                    {address.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-butter px-2.5 py-1 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-ink">
                        <Star className="size-2.5" aria-hidden="true" />
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[0.72rem] font-semibold text-ink">{address.fullName}</p>
                  <p className="mt-0.5 text-[0.6rem] text-muted">{address.phone}</p>
                  <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-soft">
                    {address.address}, {address.city}, {address.district}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                {!address.isDefault ? (
                  <button
                    type="button"
                    onClick={() => makeDefault(address.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-ink-soft hover:border-teal hover:text-teal"
                  >
                    <Star className="size-3" aria-hidden="true" />
                    Make default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setEditing({ ...address })}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-ink-soft hover:border-teal hover:text-teal"
                >
                  <Pencil className="size-3" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-muted hover:border-coral/40 hover:text-coral"
                >
                  <Trash2 className="size-3" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.2rem] border border-dashed border-line-strong bg-cream px-6 py-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-soft/50 text-teal">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-xl text-ink">No saved addresses yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-[0.7rem] leading-relaxed text-muted">
            Save a home, university or office address once. At checkout you can
            fill the whole form with one click.
          </p>
          <button type="button" onClick={startNew} className="btn btn-primary btn-sm mt-4">
            <Plus className="size-3.5" aria-hidden="true" />
            Add your first address
          </button>
        </div>
      )}
    </div>
  );
}
