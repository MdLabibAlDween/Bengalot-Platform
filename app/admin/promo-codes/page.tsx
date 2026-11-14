import { TicketPercent } from "lucide-react";

import { PromoCodeEditor } from "@/components/admin/promo-code-editor";
import { requireStaff } from "@/lib/auth";
import { getPromoCodes } from "@/lib/promos";

export const dynamic = "force-dynamic";

export default async function AdminPromoCodesPage() {
  await requireStaff("/admin/promo-codes");
  const codes = await getPromoCodes();
  const active = codes.filter((code) => code.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Promo codes</p>
          <h1 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.045em] text-ink sm:text-[2.8rem]">
            A gentler{" "}
            <span className="display-italic text-teal">yes.</span>
          </h1>
          <p className="mt-2 max-w-[38rem] text-[0.76rem] leading-relaxed text-muted">
            Create discount codes for checkout. Every code is validated on the
            server against the live subtotal before an order is accepted.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">
            <span className="size-1.5 rounded-full bg-teal" />
            {active} active
          </span>
          <span className="chip">
            <TicketPercent className="size-3" aria-hidden="true" />
            {codes.length} total
          </span>
        </div>
      </div>

      <PromoCodeEditor codes={codes} />
    </div>
  );
}
