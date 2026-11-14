import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactAcknowledgement, sendContactNotification } from "@/lib/mail";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(3000),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please complete every field." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    if (error) throw error;

    const supportEmail =
      process.env.MAIL_SUPPORT_EMAIL?.trim() || "support@bengalot.com";
    await Promise.all([
      sendContactAcknowledgement({
        ...parsed.data,
        supportEmail,
      }),
      sendContactNotification(parsed.data),
    ]);

    return NextResponse.json({
      message: "Thank you — we usually reply within one working day.",
    });
  } catch (error) {
    console.error("Contact message failed", error);
    return NextResponse.json(
      { message: "Your message could not be sent. Please try WhatsApp." },
      { status: 500 },
    );
  }
}
