import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAnyAdmin, writeAuditLog } from "@/lib/admin/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(10).max(200),
});

export async function POST(request: Request) {
  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase service role is not configured." },
      { status: 503 }
    );
  }

  if (await hasAnyAdmin()) {
    return NextResponse.json(
      { error: "An admin already exists. This setup screen is locked." },
      { status: 409 }
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Use a full name, valid email and a password of at least 10 characters." },
      { status: 400 }
    );
  }

  const { fullName, email, password } = parsed.data;

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { role: "super_admin" },
  });

  if (error || !created.user) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create the admin account." },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name: fullName,
    role: "super_admin",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => undefined);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  await writeAuditLog({
    actorId: created.user.id,
    actorEmail: email,
    action: "first_admin_created",
    entity: "profiles",
    entityId: created.user.id,
    after: { role: "super_admin", email },
  });

  return NextResponse.json({ ok: true });
}
