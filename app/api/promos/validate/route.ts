import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluatePromoCode, getPromoCodes } from "@/lib/promos";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.number().int().min(0).max(10_000_000),
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

    const codes = await getPromoCodes();
    const result = evaluatePromoCode(
      codes,
      parsed.data.code,
      parsed.data.subtotal,
    );

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
