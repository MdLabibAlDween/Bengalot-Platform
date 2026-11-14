import { NextResponse } from "next/server";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import { deleteProductImage, isProductImage, uploadProductImage } from "@/lib/supabase/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || !STAFF_ROLES.has(current.profile.role)) {
    return NextResponse.json({ message: "Not authorised." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Choose an image to upload." },
        { status: 400 },
      );
    }

    const url = await uploadProductImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "The image could not be uploaded.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || !STAFF_ROLES.has(current.profile.role)) {
    return NextResponse.json({ message: "Not authorised." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { url?: string };
    if (!body.url || !isProductImage(body.url)) {
      return NextResponse.json({ message: "Unknown image." }, { status: 400 });
    }

    await deleteProductImage(body.url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Image delete failed", error);
    return NextResponse.json(
      { message: "The image could not be removed." },
      { status: 500 },
    );
  }
}
