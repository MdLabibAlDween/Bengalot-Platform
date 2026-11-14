import { NextResponse, after } from "next/server";
import { z } from "zod";

import { publicEnv } from "@/lib/env";
import { sendPasswordReset } from "@/lib/mail";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().trim().email().max(200),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const supabase = createSupabaseAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,email")
      .eq("email", email)
      .maybeSingle();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${publicEnv.siteUrl.replace(/\/+$/, "")}/reset-password`,
      },
    });

    if (error || !data?.properties?.action_link) {
      // Do not reveal whether an account exists.
      return NextResponse.json({
        ok: true,
        message:
          "If an account exists for that email, a reset link is on its way.",
      });
    }

    const name =
      profile?.full_name?.split(" ")[0] ||
      email.split("@")[0] ||
      "there";

    after(() =>
      sendPasswordReset({
        email,
        name,
        resetUrl: data.properties.action_link,
      }),
    );

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link is on its way.",
    });
  } catch (error) {
    console.error("Password reset request failed", error);
    return NextResponse.json(
      { message: "We could not send the reset email just now." },
      { status: 500 },
    );
  }
}
