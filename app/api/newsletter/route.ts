import { NextResponse, after } from "next/server";
import { z } from "zod";

import { sendNewsletterWelcome } from "@/lib/mail";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().trim().email().max(200),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: "footer" });

    if (error && error.code !== "23505") throw error;
    if (!error) {
      after(() => sendNewsletterWelcome(email));
    }

    return NextResponse.json({
      message:
        error?.code === "23505"
          ? "You are already on the list."
          : "You are on the list. A quieter inbox begins here.",
    });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json(
      { message: "The note could not be sent just now. Please try again." },
      { status: 500 },
    );
  }
}
