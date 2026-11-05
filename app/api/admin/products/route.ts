import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";
import {
  aggregateSizesFromVariants,
  normalizeVariants,
  totalVariantStock,
} from "@/lib/variants";

const imageSchema = z.object({
  id: z.string().trim().max(80).optional(),
  url: z.string().trim().url().max(2000),
  alt: z.string().trim().max(200).optional(),
  color: z.string().trim().max(40).optional(),
  sort: z.number().int().min(0).max(999).optional(),
});

const variantSchema = z.object({
  id: z.string().trim().max(80).optional(),
  size: z.string().trim().min(1).max(40),
  color: z.string().trim().min(1).max(40),
  stock: z.number().int().min(0).max(1_000_000),
  sku: z.string().trim().max(80).optional(),
  price: z.number().int().min(0).nullable().optional(),
  compareAt: z.number().int().min(0).nullable().optional(),
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
  department: z.string().trim().min(2),
  category: z.string().trim().min(2),
  audience: z.enum(["men", "women", "kids", "unisex"]).optional(),
  price: z.number().int().min(0),
  compareAt: z.number().int().min(0).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  isDemo: z.boolean().optional(),
  sizes: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        stock: z.number().int().min(0),
      })
    )
    .min(1)
    .max(20)
    .optional(),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
    )
    .min(1)
    .max(20)
    .optional(),
  variants: z.array(variantSchema).max(300).optional(),
  images: z.array(imageSchema).max(20).optional(),
  videoUrl: z.string().trim().max(2000).optional(),
  seoTitle: z.string().trim().max(180).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
  hoverImageUrl: z.string().trim().max(2000).nullable().optional(),
  shortDescription: z.string().trim().max(500).default(""),
  description: z.string().trim().max(8000).default(""),
  materials: z.string().trim().max(1200).default(""),
  care: z.string().trim().max(1200).default(""),
  tags: z.array(z.string().trim().max(60)).max(40).optional(),
  sets: z.array(z.enum(["new", "best", "trending"])).max(3).optional(),
  badge: z.union([z.enum(["New", "Bestseller", "Limited", "Sale"]), z.literal("")]).optional(),
  sku: z.string().trim().max(80).optional(),
  sizeGuideId: z.string().trim().max(60).optional(),
  collectionSlug: z.string().trim().max(160).optional(),
  collectionNote: z.string().trim().max(500).optional(),
  highlights: z.array(z.string().trim().max(300)).max(12).optional(),
  materialLines: z.array(z.string().trim().max(300)).max(20).optional(),
  careLines: z.array(z.string().trim().max(300)).max(20).optional(),
  fitNote: z.string().trim().max(1000).optional(),
});

function productPayload(
  input: z.infer<typeof productSchema>,
  existing?: Record<string, unknown>
) {
  const variants = normalizeVariants(input.variants ?? existing?.variants);
  const fallbackSizes = Array.isArray(input.sizes)
    ? input.sizes
    : Array.isArray(existing?.sizes)
      ? (existing.sizes as { label: string; stock: number }[])
      : [{ label: "One size", stock: input.stock ?? 0 }];
  const sizes =
    variants.length > 0
      ? aggregateSizesFromVariants(variants, fallbackSizes)
      : fallbackSizes;
  const colors = Array.isArray(input.colors)
    ? input.colors
    : Array.isArray(existing?.colors)
      ? (existing.colors as { name: string; hex: string }[])
      : [{ name: "Default", hex: "#3B2A8C" }];
  const images = (input.images ?? (Array.isArray(existing?.images) ? existing.images : []))
    .map((image, index) => ({
      id: image.id || `image-${index + 1}`,
      url: image.url,
      alt: image.alt || input.name,
      ...(image.color ? { color: image.color } : {}),
      sort: image.sort ?? index + 1,
    }))
    .sort((a, b) => a.sort - b.sort);
  const totalStock = variants.length > 0 ? totalVariantStock(variants) : sizes.reduce(
    (sum, size) => sum + Math.max(0, Number(size.stock)),
    0
  );
  const primaryImage =
    images[0]?.url ?? input.imageUrl ?? (existing?.imageUrl as string | undefined) ?? null;

  return {
    ...(existing ?? {}),
    slug: input.slug,
    name: input.name,
    department: input.department,
    category: input.category,
    audience: input.audience ?? existing?.audience ?? "unisex",
    price: input.price,
    compareAt: input.compareAt ?? undefined,
    stock: totalStock,
    imageUrl: primaryImage ?? undefined,
    isDemo: input.isDemo ?? (existing?.isDemo === true),
    shortDescription: input.shortDescription,
    description: input.description,
    materials: input.materials,
    care: input.care,
    seoTitle: input.seoTitle ?? existing?.seoTitle ?? "",
    seoDescription: input.seoDescription ?? existing?.seoDescription ?? "",
    status: input.status,
    colors,
    sizes,
    variants: variants.length > 0 ? variants : undefined,
    images: images.length > 0 ? images : undefined,
    videoUrl: input.videoUrl ?? existing?.videoUrl ?? "",
    tags: input.tags ?? existing?.tags ?? [],
    sets: input.sets ?? existing?.sets ?? ["new"],
    badge: input.badge || existing?.badge || undefined,
    sku: input.sku || existing?.sku || input.slug.toUpperCase().slice(0, 20),
    sizeGuideId: input.sizeGuideId ?? existing?.sizeGuideId ?? "men-tops",
    collectionSlug: input.collectionSlug ?? existing?.collectionSlug ?? "",
    collectionNote: input.collectionNote ?? existing?.collectionNote ?? "",
    highlights: input.highlights ?? existing?.highlights ?? [],
    materialLines: input.materialLines ?? existing?.materialLines ?? [],
    careLines: input.careLines ?? existing?.careLines ?? [],
    fitNote: input.fitNote ?? existing?.fitNote ?? "",
    art: existing?.art ?? "tshirt",
    palette: existing?.palette ?? ["var(--color-indigo)", "var(--color-magenta)"],
    rating: existing?.rating ?? 0,
    reviewCount: existing?.reviewCount ?? 0,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export async function DELETE(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  const id = z.string().uuid().safeParse(body?.id);
  if (!id.success) return badRequest("Invalid product id.");
  const { error } = await auth.admin.from("products").delete().eq("id", id.data);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await writeAuditLog({
    actorId: auth.context.user.id,
    actorEmail: auth.context.profile.email,
    action: "product_deleted",
    entity: "products",
    entityId: id.data,
  });
  revalidatePath("/admin/catalogue");
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((issue) => issue.message).join(" "));
  }
  const input = parsed.data;

  if (input.id) {
    const { data: existing } = await auth.admin
      .from("products")
      .select("payload")
      .eq("id", input.id)
      .maybeSingle();
    if (!existing) return badRequest("Product not found.");
    const payload = productPayload(input, existing.payload as Record<string, unknown>);
    const stock = Number(payload.stock ?? 0);
    const images = Array.isArray(payload.images) ? payload.images : [];
    const { error } = await auth.admin
      .from("products")
      .update({
        slug: input.slug,
        name: input.name,
        department: input.department,
        category: input.category,
        price: input.price,
        compare_at: input.compareAt ?? null,
        stock,
        status: input.status,
        image_url: images[0]?.url ?? input.imageUrl ?? null,
        hover_image_url:
          input.hoverImageUrl ??
          images[1]?.url ??
          null,
        payload,
      })
      .eq("id", input.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "product_updated",
      entity: "products",
      entityId: input.id,
      after: { name: input.name, slug: input.slug, stock },
    });
  } else {
    const payload = productPayload(input);
    const stock = Number(payload.stock ?? 0);
    const images = Array.isArray(payload.images) ? payload.images : [];
    const { data, error } = await auth.admin
      .from("products")
      .insert({
        slug: input.slug,
        name: input.name,
        department: input.department,
        category: input.category,
        price: input.price,
        compare_at: input.compareAt ?? null,
        stock,
        status: input.status,
        image_url: images[0]?.url ?? input.imageUrl ?? null,
        hover_image_url: input.hoverImageUrl ?? images[1]?.url ?? null,
        payload,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: "product_created",
      entity: "products",
      entityId: data.id,
      after: { name: input.name, slug: input.slug, stock },
    });
  }

  revalidatePath("/admin/catalogue");
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
