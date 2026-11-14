import { revalidatePath } from "next/cache";
import { NextResponse, after } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { sendAccountWelcome, sendPasswordReset } from "@/lib/mail";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";

const roles = ["customer", "staff", "admin", "owner"] as const;

const createSchema = z.object({
  action: z.literal("create"),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(72),
  role: z.enum(roles),
});

const updateSchema = z.object({
  action: z.literal("update"),
  userId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  role: z.enum(roles),
  phone: z.string().trim().max(30).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
});

const resetSchema = z.object({
  action: z.literal("reset"),
  userId: z.string().uuid(),
});

const deleteSchema = z.object({
  action: z.literal("delete"),
  userId: z.string().uuid(),
});

const schema = z.union([createSchema, updateSchema, resetSchema, deleteSchema]);

async function ownerCount(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner");
  return count ?? 0;
}

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || current.profile.role !== "owner") {
    return NextResponse.json(
      { message: "Only the studio owner can manage users." },
      { status: 403 },
    );
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Some user details need another look.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const supabase = createSupabaseAdminClient();

    if (payload.action === "create") {
      const email = payload.email.toLowerCase();
      const { data: created, error } = await supabase.auth.admin.createUser({
        email,
        password: payload.password,
        email_confirm: true,
        user_metadata: { full_name: payload.fullName },
      });

      if (error || !created.user) {
        const message = error?.message.toLowerCase().includes("already")
          ? "An account with this email already exists."
          : error?.message ?? "The account could not be created.";
        return NextResponse.json({ message }, { status: 400 });
      }

      const userId = created.user.id;
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          full_name: payload.fullName,
          role: payload.role,
        },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;

      if (payload.role === "customer") {
        after(() =>
          sendAccountWelcome({
            email,
            name: payload.fullName.split(" ")[0] || "there",
          }),
        );
      }

      await supabase.from("admin_audit").insert({
        actor_id: current.user.id,
        actor_email: current.profile.email,
        action: "user.create",
        entity: "profile",
        entity_id: userId,
        after: { email, full_name: payload.fullName, role: payload.role },
      });

      revalidatePath("/admin/users");
      revalidatePath("/admin");
      return NextResponse.json({ ok: true, userId });
    }

    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", payload.userId)
      .maybeSingle();

    if (targetError) throw targetError;
    if (!target) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const profile = target as Profile;

    if (payload.action === "update") {
      if (profile.id === current.user.id && payload.role !== profile.role) {
        return NextResponse.json(
          { message: "You cannot change your own role." },
          { status: 400 },
        );
      }

      if (profile.role === "owner" && payload.role !== "owner") {
        if ((await ownerCount(supabase)) <= 1) {
          return NextResponse.json(
            { message: "Keep at least one owner account." },
            { status: 409 },
          );
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: payload.fullName,
          role: payload.role,
          phone: payload.phone || null,
          city: payload.city || null,
        })
        .eq("id", profile.id);
      if (error) throw error;

      await supabase.from("admin_audit").insert({
        actor_id: current.user.id,
        actor_email: current.profile.email,
        action: "user.update",
        entity: "profile",
        entity_id: profile.id,
        before: {
          full_name: profile.full_name,
          role: profile.role,
          phone: profile.phone,
          city: profile.city,
        },
        after: payload,
      });

      revalidatePath("/admin/users");
      return NextResponse.json({ ok: true });
    }

    if (payload.action === "reset") {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: profile.email,
        options: {
          redirectTo: `${publicEnv.siteUrl.replace(/\/+$/, "")}/reset-password`,
        },
      });

      if (error || !data?.properties?.action_link) {
        return NextResponse.json(
          { message: "A reset link could not be created." },
          { status: 400 },
        );
      }

      after(() =>
        sendPasswordReset({
          email: profile.email,
          name: profile.full_name?.split(" ")[0] || "there",
          resetUrl: data.properties.action_link,
        }),
      );

      await supabase.from("admin_audit").insert({
        actor_id: current.user.id,
        actor_email: current.profile.email,
        action: "user.password_reset",
        entity: "profile",
        entity_id: profile.id,
        after: { email: profile.email },
      });

      return NextResponse.json({
        ok: true,
        message: `Reset link sent to ${profile.email}.`,
      });
    }

    // delete
    if (profile.id === current.user.id) {
      return NextResponse.json(
        { message: "You cannot delete your own account while signed in." },
        { status: 400 },
      );
    }
    if (profile.role === "owner" && (await ownerCount(supabase)) <= 1) {
      return NextResponse.json(
        { message: "Keep at least one owner account." },
        { status: 409 },
      );
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      profile.id,
    );
    if (deleteError) throw deleteError;

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "user.delete",
      entity: "profile",
      entity_id: profile.id,
      before: {
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("User management failed", error);
    return NextResponse.json(
      { message: "The user action could not be completed." },
      { status: 500 },
    );
  }
}
