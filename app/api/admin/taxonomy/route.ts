import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { badRequest, requireAdminRoleApi } from "@/lib/admin/api";
import { writeAuditLog } from "@/lib/admin/auth";

const slug = z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/);

const categorySchema = z.object({
  kind: z.literal("category"),
  action: z.enum(["save", "delete"]),
  id: z.string().uuid().optional(),
  slug: slug.optional(),
  name: z.string().trim().min(2).max(120).optional(),
  nameBn: z.string().trim().max(120).optional(),
  department: z.string().trim().min(2).max(40).optional(),
  icon: z.string().trim().min(1).max(40).optional(),
  tagline: z.string().trim().max(240).optional(),
  imageUrl: z.string().trim().max(2000).optional(),
  status: z.enum(["published", "hidden"]).optional(),
  isDemo: z.boolean().optional(),
  sort: z.number().int().min(0).max(9999).optional(),
});

const collectionSchema = z.object({
  kind: z.literal("collection"),
  action: z.enum(["save", "delete"]),
  id: z.string().uuid().optional(),
  slug: slug.optional(),
  eyebrow: z.string().trim().max(120).optional(),
  title: z.string().trim().min(2).max(120).optional(),
  accent: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1200).optional(),
  palette: z.tuple([z.string().trim().max(80), z.string().trim().max(80)]).optional(),
  note: z.string().trim().max(240).optional(),
  closingTitle: z.string().trim().max(160).optional(),
  closingText: z.string().trim().max(1200).optional(),
  metaTitle: z.string().trim().max(180).optional(),
  metaDescription: z.string().trim().max(320).optional(),
  collectionKind: z.enum(["new", "best", "sale", "royal", "heirloom"]).optional(),
  status: z.enum(["published", "hidden"]).optional(),
  isDemo: z.boolean().optional(),
  sort: z.number().int().min(0).max(9999).optional(),
  productSlugs: z.array(z.string().trim().max(160)).max(200).optional(),
});

const bundleSchema = z.object({
  kind: z.literal("bundle"),
  action: z.enum(["save", "delete"]),
  id: z.string().uuid().optional(),
  slug: slug.optional(),
  name: z.string().trim().min(2).max(160).optional(),
  nameBn: z.string().trim().max(160).optional(),
  department: z.string().trim().min(2).max(40).optional(),
  shortDescription: z.string().trim().max(400).optional(),
  description: z.string().trim().max(4000).optional(),
  coverArt: z.string().trim().min(1).max(40).optional(),
  coverPalette: z.tuple([z.string().trim().max(80), z.string().trim().max(80)]).optional(),
  discountType: z.enum(["none", "percent", "fixed"]).optional(),
  discountValue: z.number().int().min(0).max(1000000).optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
  allowPartialPurchase: z.boolean().optional(),
  items: z
    .array(
      z.object({
        productSlug: z.string().trim().min(1).max(160),
        quantity: z.number().int().min(1).max(50),
        sort: z.number().int().min(0).max(999),
      })
    )
    .max(30)
    .optional(),
  seoTitle: z.string().trim().max(180).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  isDemo: z.boolean().optional(),
  sort: z.number().int().min(0).max(9999).optional(),
});

const schema = z.discriminatedUnion("kind", [categorySchema, collectionSchema, bundleSchema]);

export async function POST(request: Request) {
  const auth = await requireAdminRoleApi(["super_admin", "manager", "content_editor"]);
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map((issue) => issue.message).join(" "));
  }
  const input = parsed.data;

  if (input.action === "delete") {
    if (!input.id) return badRequest("Missing record id.");
    const table =
      input.kind === "category"
        ? "store_categories"
        : input.kind === "collection"
          ? "store_collections"
          : "store_bundles";
    const { error } = await auth.admin.from(table).delete().eq("id", input.id);
    if (error) return badRequest(error.message);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: `${input.kind}_deleted`,
      entity: table,
      entityId: input.id,
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin/taxonomy");
    return NextResponse.json({ ok: true });
  }

  if (input.kind === "category") {
    if (!input.slug || !input.name || !input.department) {
      return badRequest("Category name, slug and department are required.");
    }
    const payload = {
      slug: input.slug,
      name: input.name,
      name_bn: input.nameBn || null,
      department: input.department,
      icon: input.icon || "tshirt",
      tagline: input.tagline || "",
      image_url: input.imageUrl || null,
      status: input.status ?? "published",
      is_demo: input.isDemo ?? true,
      sort: input.sort ?? 0,
    };
    const query = input.id
      ? auth.admin.from("store_categories").update(payload).eq("id", input.id)
      : auth.admin.from("store_categories").insert(payload);
    const { data, error } = await query.select("id").single();
    if (error) return badRequest(error.message);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: input.id ? "category_updated" : "category_created",
      entity: "store_categories",
      entityId: data.id,
      after: { slug: payload.slug, status: payload.status },
    });
    await auth.admin.from("admin_media").upsert(
      {
        slot_key: `category.${payload.department}.${payload.slug}.main`,
        label: `${payload.name} image`,
        group_label: `Categories — ${payload.department.charAt(0).toUpperCase()}${payload.department.slice(1)}`,
        sort: 500,
      },
      { onConflict: "slot_key", ignoreDuplicates: true }
    );
  } else if (input.kind === "collection") {
    if (!input.slug || !input.title) {
      return badRequest("Collection title and slug are required.");
    }
    const payload = {
      slug: input.slug,
      eyebrow: input.eyebrow || "",
      title: input.title,
      accent: input.accent || "",
      description: input.description || "",
      palette: input.palette ?? ["var(--color-indigo)", "var(--color-magenta)"],
      note: input.note || null,
      closing_title: input.closingTitle || "",
      closing_text: input.closingText || "",
      meta_title: input.metaTitle || input.title,
      meta_description: input.metaDescription || input.description || "",
      kind: input.collectionKind ?? "new",
      status: input.status ?? "published",
      is_demo: input.isDemo ?? true,
      sort: input.sort ?? 0,
      product_slugs: (input.productSlugs ?? []).filter(Boolean),
    };
    const query = input.id
      ? auth.admin.from("store_collections").update(payload).eq("id", input.id)
      : auth.admin.from("store_collections").insert(payload);
    const { data, error } = await query.select("id").single();
    if (error) return badRequest(error.message);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: input.id ? "collection_updated" : "collection_created",
      entity: "store_collections",
      entityId: data.id,
      after: { slug: payload.slug, status: payload.status },
    });
  } else {
    if (!input.slug || !input.name || !input.department) {
      return badRequest("Bundle name, slug and department are required.");
    }
    const items = (input.items ?? []).map((item, index) => ({
      productSlug: item.productSlug,
      quantity: item.quantity,
      sort: item.sort || index + 1,
    }));
    const payload = {
      slug: input.slug,
      name: input.name,
      name_bn: input.nameBn || null,
      department: input.department,
      short_description: input.shortDescription || "",
      description: input.description || "",
      cover_art: input.coverArt || "jacket",
      cover_palette: input.coverPalette ?? ["var(--color-indigo)", "var(--color-magenta)"],
      discount_type: input.discountType ?? "percent",
      discount_value: input.discountValue ?? 0,
      status: input.status ?? "draft",
      featured: input.featured ?? false,
      allow_partial_purchase: input.allowPartialPurchase ?? false,
      items,
      seo_title: input.seoTitle || "",
      seo_description: input.seoDescription || "",
      is_demo: input.isDemo ?? true,
      sort: input.sort ?? 0,
    };
    const query = input.id
      ? auth.admin.from("store_bundles").update(payload).eq("id", input.id)
      : auth.admin.from("store_bundles").insert(payload);
    const { data, error } = await query.select("id").single();
    if (error) return badRequest(error.message);
    await writeAuditLog({
      actorId: auth.context.user.id,
      actorEmail: auth.context.profile.email,
      action: input.id ? "bundle_updated" : "bundle_created",
      entity: "store_bundles",
      entityId: data.id,
      after: { slug: payload.slug, status: payload.status },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/taxonomy");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
