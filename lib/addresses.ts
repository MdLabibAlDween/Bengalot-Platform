import type { SavedAddress } from "@/lib/types";

export const MAX_SAVED_ADDRESSES = 5;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function normaliseAddresses(value: unknown): SavedAddress[] {
  if (!Array.isArray(value)) return [];

  const addresses = value
    .map((entry, index): SavedAddress | null => {
      if (!entry || typeof entry !== "object") return null;
      const input = entry as Partial<SavedAddress>;
      const address = {
        id:
          text(input.id, 80) ||
          `address-${index + 1}-${Date.now().toString(36)}`,
        label: text(input.label, 40) || `Address ${index + 1}`,
        fullName: text(input.fullName, 120),
        phone: text(input.phone, 24),
        address: text(input.address, 500),
        city: text(input.city, 120),
        district: text(input.district, 120),
        isDefault: input.isDefault === true,
      };
      if (
        !address.fullName ||
        !address.phone ||
        !address.address ||
        !address.city ||
        !address.district
      ) {
        return null;
      }
      return address;
    })
    .filter((entry): entry is SavedAddress => Boolean(entry))
    .slice(0, MAX_SAVED_ADDRESSES);

  if (addresses.length && !addresses.some((entry) => entry.isDefault)) {
    const first = addresses[0];
    if (first) addresses[0] = { ...first, isDefault: true };
  }

  let defaultSeen = false;
  return addresses.map((entry) => {
    if (entry.isDefault && !defaultSeen) {
      defaultSeen = true;
      return entry;
    }
    return { ...entry, isDefault: false };
  });
}
