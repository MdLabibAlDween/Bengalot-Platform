import { Eye, Megaphone } from "lucide-react";
import Link from "next/link";

import { PromotionEditor } from "@/components/admin/promotion-editor";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Product, Promotion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  await requireStaff("/admin/promotions");
  const supabase = createSupabaseAdminClient();
  const [promotionsResult, productsResult] = await Promise.all([
    supabase.from("promotions").select("*").order("sort"),
    supabase.from("products").select("*").order("sort"),
  ]);

  const promotions = (promotionsResult.data ?? []) as Promotion[];
  const products = (productsResult.data ?? []) as Product[];
  const active = promotions.filter((promotion) => promotion.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Promotions</p>
          <h1 className="mt-3 font-display text-[2.3rem] leading-none tracking-[-0.045em] text-ink sm:text-[2.8rem]">
            The homepage{" "}
            <span className="display-italic text-teal">invitations.</span>
          </h1>
          <p className="mt-2 max-w-[38rem] text-[0.76rem] leading-relaxed text-muted">
            Edit the heading, copy, artwork, accent colours and order of every
            promotional banner. Changes appear on the storefront homepage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">
            <span className="size-1.5 rounded-full bg-teal" />
            {active} active
          </span>
          <Link href="/#promotions" target="_blank" className="btn btn-outline btn-sm">
            <Eye className="size-3.5" aria-hidden="true" />
            Preview homepage
          </Link>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-[1.2rem] border border-butter/60 bg-butter-soft/50 p-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-butter text-ink">
          <Megaphone className="size-3.5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[0.7rem] font-bold text-ink">Everything here is live.</p>
          <p className="mt-0.5 text-[0.64rem] leading-relaxed text-ink-soft/75">
            Use the artwork picker to change the visual, or choose a custom
            background, text and accent colour. Hidden banners stay in the
            studio but disappear from the homepage.
          </p>
        </div>
      </div>

      <PromotionEditor promotions={promotions} products={products} />
    </div>
  );
}
