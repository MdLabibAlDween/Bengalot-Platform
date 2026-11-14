import { NextResponse } from "next/server";
import { z } from "zod";

import { normaliseAddresses } from "@/lib/addresses";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const addressSchema = z.object({
  id: z.string().trim().max(80).optional(),
  label: z.string().trim().max(40),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(24),
  address: z.string().trim().min(8).max(500),
  city: z.string().trim().min(2).max(120),
  district: z.string().trim().min(2).max(120),
  isDefault: z.boolean(),
});

const schema = z.object({
  addresses: z.array(addressSchema).max(5),
});

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.user) {
    return NextResponse.json({ message: "Please sign in." }, { status: 401 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Some address details need another look." },
        { status: 400 },
      );
    }

    const addresses = normaliseAddresses(parsed.data.addresses);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(current.user.id, {
      user_metadata: {
        ...(current.user.user_metadata ?? {}),
        addresses,
      },
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, addresses });
  } catch (error) {
    console.error("Address save failed", error);
    return NextResponse.json(
      { message: "The address book could not be saved." },
      { status: 500 },
    );
  }
}
