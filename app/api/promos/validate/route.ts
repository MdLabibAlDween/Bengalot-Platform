import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluatePromoCode, getPromoCodes } from "@/lib/promos";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const itemSchema = z.object({
  slug: z.string().min(1).max(140),
  quantity: z.number().int().min(1).max(20),
});

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  items: z.array(itemSchema).max(30).optional(),
  subtotal: z.number().int().min(0).max(10_000_000).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Enter a promo code and try again." },
        { status: 400 },
      );
    }

    let lines: { slug: string; lineTotal: number }[] = [];

    if (parsed.data.items?.length) {
      const quantities = new Map<string, number>();
      for (const item of parsed.data.items) {
        quantities.set(
          item.slug,
          Math.min((quantities.get(item.slug) ?? 0) + item.quantity, 20),
        );
      }

      const supabase = createSupabaseAdminClient();
      const { data } = await supabase
        .from("products")
        .select("slug,price")
        .in("slug", [...quantities.keys()])
        .eq("is_published", true);

      lines = (data ?? []).map((product) => ({
        slug: product.slug as string,
        lineTotal: Number(product.price) * (quantities.get(product.slug) ?? 0),
      }));
    } else if (parsed.data.subtotal !== undefined) {
      lines = [{ slug: "*", lineTotal: parsed.data.subtotal }];
    }

    const codes = await getPromoCodes();
    const result = evaluatePromoCode(codes, parsed.data.code, lines);

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Promo validation failed", error);
    return NextResponse.json(
      { message: "We could not check that code just now." },
      { status: 500 },
    );
  }
}
