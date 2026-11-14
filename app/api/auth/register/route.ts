import { NextResponse, after } from "next/server";
import { z } from "zod";

import { sendAccountWelcome } from "@/lib/mail";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please check your name, email and password." },
        { status: 400 },
      );
    }

    const { fullName, email, password } = parsed.data;
    const admin = createSupabaseAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !created.user) {
      const message = createError?.message.toLowerCase().includes("already")
        ? "An account with this email already exists. Try signing in."
        : createError?.message ?? "The account could not be created.";
      return NextResponse.json({ message }, { status: 400 });
    }

    // Sign-up always creates a customer profile. Studio roles are assigned
    // only from the owner-only Users screen.
    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: created.user.id,
        email,
        full_name: fullName,
        role: "customer",
      },
      { onConflict: "id" },
    );

    if (profileError) throw profileError;

    after(() =>
      sendAccountWelcome({
        email,
        name: fullName.split(" ")[0] || "there",
      }),
    );

    return NextResponse.json({
      ok: true,
      message: "Your account is ready. Signing you in…",
    });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      { message: "We could not create the account just now." },
      { status: 500 },
    );
  }
}
