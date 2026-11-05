"use client";

import { useEffect, useState } from "react";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountHeading } from "./account-heading";
import { cn } from "@/lib/utils";
import { DISTRICTS } from "@/lib/constants";

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  district: string;
  thana: string;
  address: string;
  isDefault: boolean;
};

const emptyForm = {
  label: "Home",
  name: "",
  phone: "",
  district: "Dhaka",
  thana: "",
  address: "",
  isDefault: false,
};

export function AddressesView() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const response = await fetch("/api/account/addresses", { cache: "no-store" });
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const result = await response.json().catch(() => ({}));
    setAddresses(Array.isArray(result.addresses) ? result.addresses : []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const startAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (address: Address) => {
    setEditing(address);
    setForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      district: address.district,
      thana: address.thana,
      address: address.address,
      isDefault: address.isDefault,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.thana || !form.address) {
      toast.error("Please complete the address fields.");
      return;
    }
    if (form.address.trim().length < 8) {
      toast.error("Please add a full address.");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing?.id,
        label: form.label,
        recipientName: form.name,
        phone: form.phone,
        district: form.district,
        thana: form.thana,
        address: form.address,
        isDefault: form.isDefault,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not save the address.");
      return;
    }
    toast.success(editing ? "Address updated" : "Address added");
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    const response = await fetch("/api/account/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not remove the address.");
      return;
    }
    toast("Address removed");
    await load();
  };

  const makeDefault = async (address: Address) => {
    const response = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: address.id,
        label: address.label,
        recipientName: address.name,
        phone: address.phone,
        district: address.district,
        thana: address.thana,
        address: address.address,
        isDefault: true,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(result.error ?? "Could not update the default address.");
      return;
    }
    toast.success("Default address updated");
    await load();
  };

  return (
    <div>
      <AccountHeading
        eyebrow="Where it goes"
        title="Saved addresses"
        description="Keep the details we need to deliver your pieces. You can have different addresses for home, office or family."
        action={
          <Button variant="gold" onClick={startAdd}>
            <Plus className="h-4 w-4" /> Add address
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {loading ? (
          <>
            <div className="h-[190px] animate-pulse rounded-2xl bg-[var(--muted)]" />
            <div className="h-[190px] animate-pulse rounded-2xl bg-[var(--muted)]" />
          </>
        ) : addresses.length === 0 ? (
          <div className="sm:col-span-2 rounded-2xl border border-dashed border-[var(--line-strong)] py-14 text-center">
            <MapPin className="mx-auto h-6 w-6 text-muted-foreground/35" />
            <p className="mt-3 font-display text-xl">No saved addresses yet.</p>
            <p className="mt-1 text-[0.66rem] text-muted-foreground">
              Add an address to make checkout faster next time.
            </p>
          </div>
        ) : addresses.map((address) => (
          <div
            key={address.id}
            className={cn(
              "relative rounded-2xl border bg-[var(--surface)] p-5 transition",
              address.isDefault ? "border-gold/50" : "border-[var(--border)]"
            )}
          >
            {address.isDefault && (
              <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-[0.48rem] font-bold uppercase tracking-[0.1em] text-gold">
                <Check className="h-3 w-3" /> Default
              </span>
            )}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--muted)] text-gold">
              <MapPin className="h-4 w-4" />
            </span>
            <p className="mt-3 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {address.label}
            </p>
            <p className="mt-1 font-display text-lg">{address.name}</p>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
              {address.address}
              <br />
              {address.thana}, {address.district}
            </p>
            <p className="mt-2 text-[0.66rem] text-muted-foreground">{address.phone}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-3">
              <button
                type="button"
                onClick={() => startEdit(address)}
                className="flex items-center gap-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-gold"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              {!address.isDefault && (
                <button
                  type="button"
                  onClick={() => makeDefault(address)}
                  className="flex items-center gap-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-gold"
                >
                  <Check className="h-3 w-3" /> Set default
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(address.id)}
                className="ml-auto flex items-center gap-1.5 text-[0.54rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-rosewood"
              >
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={startAdd}
          className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line-strong)] text-muted-foreground transition hover:border-gold hover:text-gold"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-current">
            <Plus className="h-4 w-4" />
          </span>
          <span className="mt-3 text-[0.7rem] font-semibold">Add another address</span>
          <span className="mt-1 text-[0.58rem]">Home, office or a gift address</span>
        </button>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p className="text-[0.66rem] leading-relaxed text-muted-foreground">
          We deliver to all 64 districts with Steadfast. ৳70 inside Faridpur, ৳130
          elsewhere. Addresses are only used for delivery and are never shared with anyone
          else.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{editing ? "Edit address" : "Add a new address"}</DialogTitle>
          <DialogDescription>
            We&apos;ll only use this to deliver your orders.
          </DialogDescription>
          <form onSubmit={save} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-label">Label</Label>
                <Input
                  id="address-label"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home, Office, Family"
                />
              </div>
              <div>
                <Label htmlFor="address-name">Recipient name</Label>
                <Input
                  id="address-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address-phone">Phone</Label>
                <Input
                  id="address-phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, "") })
                  }
                  maxLength={11}
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label htmlFor="address-district">District</Label>
                <Select
                  id="address-district"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="address-thana">Thana / Upazila</Label>
                <Input
                  id="address-thana"
                  value={form.thana}
                  onChange={(e) => setForm({ ...form, thana: e.target.value })}
                  placeholder="e.g. Dhanmondi"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address-full">Full address</Label>
                <Input
                  id="address-full"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House, road, area, landmark"
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 text-[0.7rem] text-muted-foreground">
              <Checkbox
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              Make this my default delivery address
            </label>
            <Button type="submit" variant="gold" className="w-full" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add address"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
