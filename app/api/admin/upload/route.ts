import { NextResponse } from "next/server";
import { requireAdminRoleApi } from "@/lib/admin/api";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }
  if (!allowed.has(file.type)) {
    return NextResponse.json({ error: "Use JPG, PNG, WebP, AVIF or GIF." }, { status: 400 });
  }
  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 6 MB." }, { status: 400 });
  }
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  const path = `admin/${Date.now()}-${safeName}`;
  const { error } = await auth.admin.storage.from("site-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data } = auth.admin.storage.from("site-media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
