import { AddressBook } from "@/components/account/address-book";
import { requireUser } from "@/lib/auth";
import { normaliseAddresses } from "@/lib/addresses";

export default async function AddressesPage() {
  const { user, profile } = await requireUser("/account/addresses");
  const addresses = normaliseAddresses(user.user_metadata?.addresses);

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-6">
        <p className="eyebrow">Address book</p>
        <h2 className="mt-2 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-ink sm:text-[2.6rem]">
          Where it should arrive.
        </h2>
        <p className="mt-3 max-w-[34rem] text-[0.8rem] leading-[1.7] text-muted">
          Save the places you order to. At checkout, one click fills the whole
          delivery form — name, phone, address, town and district.
        </p>
      </div>

      <AddressBook
        initial={addresses}
        defaultName={profile?.full_name ?? ""}
        defaultPhone={profile?.phone ?? ""}
      />
    </div>
  );
}
