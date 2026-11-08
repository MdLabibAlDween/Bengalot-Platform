import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      const message = createError.message.toLowerCase().includes("already")
        ? "An account with this email already exists. Try signing in."
        : createError.message;
      return NextResponse.json({ message }, { status: 400 });
    }

    const server = await createSupabaseServerClient();
    const { error: signInError } = await server.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        {
          message:
            "Your account was created. Please sign in to continue.",
        },
        { status: 201 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      { message: "We could not create the account just now." },
      { status: 500 },
    );
  }
}
