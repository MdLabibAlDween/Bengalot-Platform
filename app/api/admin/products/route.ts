import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, STAFF_ROLES } from "@/lib/auth";
import {
  deleteProductImage,
  deleteProductResource,
  isProductImage,
  isProductResource,
  PRODUCT_IMAGE_BUCKET,
} from "@/lib/supabase/storage";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const paletteSchema = z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).length(3);

const specSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(200),
});

const previewSchema = z.record(z.string(), z.unknown());

const imageSchema = z
  .string()
  .url()
  .refine((url) => isProductImage(url), {
    message: `Images must be uploaded to the ${PRODUCT_IMAGE_BUCKET} storage bucket first.`,
  });

const resourceSchema = z
  .object({
    url: z
      .string()
      .url()
      .refine((url) => isProductResource(url), {
        message: "The PDF must be uploaded through the studio first.",
      }),
    label: z.string().trim().min(1).max(120),
  })
  .nullable()
  .optional();

const baseFields = {
  title: z.string().trim().min(2).max(160),
  title_bn: z.string().trim().max(200).optional().nullable(),
  subtitle: z.string().trim().min(4).max(300),
  description: z.string().trim().min(10).max(5000),
  sku: z.string().trim().max(60).nullable().optional(),
  category_slug: z.string().min(1).max(120),
  type: z.enum(["digital", "physical", "bundle"]),
  format: z.string().trim().min(2).max(140),
  price: z.number().int().min(0).max(1000000),
  compare_at: z.number().int().min(0).max(1000000).nullable().optional(),
  stock: z.number().int().min(0).max(100000),
  badge: z.string().trim().max(60).nullable().optional(),
  featured: z.boolean(),
  is_published: z.boolean(),
  art_key: z.string().min(1).max(40),
  palette: paletteSchema,
  includes: z.array(z.string().trim().min(1).max(220)).max(40),
  requirements: z.array(z.string().trim().min(1).max(220)).max(40),
  specs: z.array(specSchema).max(20),
  tags: z.array(z.string().trim().min(1).max(60)).max(30),
  sort: z.number().int().min(0).max(9999),
  preview: previewSchema,
  images: z.array(imageSchema).max(12),
  resource: resourceSchema,
};

const updateSchema = z.object({
  mode: z.literal("update").default("update"),
  slug: z.string().min(1).max(160),
  ...baseFields,
});

const createSchema = z.object({
  mode: z.literal("create"),
  slug: z.string().optional(),
  ...baseFields,
});

const schema = z.union([updateSchema, createSchema]);

const categoryArtDefaults: Record<
  string,
  { art_key: string; palette: string[] }
> = {
  "notion-templates": {
    art_key: "notion",
    palette: ["#0B4F4A", "#0E7C7B", "#F6D365"],
  },
  "study-cards": {
    art_key: "cards",
    palette: ["#E05A3F", "#F0755A", "#F6D365"],
  },
  "printed-planners": {
    art_key: "planner",
    palette: ["#2A6F97", "#8ECAE6", "#F6D365"],
  },
  "focus-productivity": {
    art_key: "guide",
    palette: ["#2B2D42", "#4A4E69", "#EF8354"],
  },
  bundles: {
    art_key: "bundle",
    palette: ["#E05A3F", "#0E7C7B", "#F6D365"],
  },
};

function mergePreview(
  preview: Record<string, unknown>,
  images: string[],
  resource: { url: string; label: string } | null | undefined,
): Record<string, unknown> {
  const next = { ...preview };
  if (images.length) {
    next.images = images;
  } else {
    delete next.images;
  }
  if (resource) {
    next.resource = resource;
  } else {
    delete next.resource;
  }
  return next;
}

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current?.profile || !STAFF_ROLES.has(current.profile.role)) {
    return NextResponse.json({ message: "Not authorised." }, { status: 403 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Some product details need another look.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const supabase = createSupabaseAdminClient();

    if (data.sku) {
      const skuQuery = supabase
        .from("products")
        .select("slug")
        .eq("sku", data.sku);
      const { data: duplicate } = await (data.mode === "update"
        ? skuQuery.neq("slug", data.slug)
        : skuQuery
      ).maybeSingle();
      if (duplicate) {
        return NextResponse.json(
          {
            message: "That SKU is already used by another product.",
            fields: { sku: ["This SKU is taken."] },
          },
          { status: 400 },
        );
      }
    }

    if (data.compare_at && data.compare_at <= data.price) {
      return NextResponse.json(
        {
          message: "The compare-at price must be higher than the price.",
          fields: { compare_at: ["Must be higher than the price."] },
        },
        { status: 400 },
      );
    }

    const { data: category } = await supabase
      .from("categories")
      .select("id,slug")
      .eq("slug", data.category_slug)
      .maybeSingle();

    if (!category) {
      return NextResponse.json(
        {
          message: "Choose a collection that exists.",
          fields: { category_slug: ["Unknown collection."] },
        },
        { status: 400 },
      );
    }

    if (data.mode === "create") {
      const baseSlug = slugify(data.slug || data.title);
      if (!baseSlug) {
        return NextResponse.json(
          {
            message: "The product title must include letters or numbers.",
            fields: { title: ["Use a title that can become a web address."] },
          },
          { status: 400 },
        );
      }

      let slug = baseSlug;
      for (let attempt = 1; attempt < 25; attempt += 1) {
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!existing) break;
        slug = `${baseSlug}-${attempt + 1}`;
      }

      const fallback = categoryArtDefaults[category.slug] ?? {
        art_key: data.art_key,
        palette: data.palette,
      };

      const { error: insertError } = await supabase.from("products").insert({
        slug,
        title: data.title,
        title_bn: data.title_bn || null,
        subtitle: data.subtitle,
        description: data.description,
        category_id: category.id,
        category_slug: category.slug,
        type: data.type,
        format: data.format,
        price: data.price,
        compare_at: data.compare_at || null,
        stock: data.stock,
        badge: data.badge || null,
        art_key: data.art_key || fallback.art_key,
        palette: data.palette.length
          ? data.palette
          : (fallback.palette ?? data.palette),
        includes: data.includes,
        requirements: data.requirements,
        specs: data.specs,
        tags: data.tags,
        featured: data.featured,
        is_published: data.is_published,
        sort: data.sort,
        preview: mergePreview(data.preview, data.images, data.resource),
      });

      if (insertError) throw insertError;

      await supabase.from("admin_audit").insert({
        actor_id: current.user.id,
        actor_email: current.profile.email,
        action: "product.create",
        entity: "product",
        entity_id: slug,
        after: { title: data.title, images: data.images },
      });

      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath(`/shop/${category.slug}`);
      revalidatePath(`/product/${slug}`);
      revalidatePath("/admin/products");

      return NextResponse.json({ ok: true, slug, created: true });
    }

    const slug = data.slug;
    const { data: before } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!before) {
      return NextResponse.json(
        { message: "This product no longer exists." },
        { status: 404 },
      );
    }

    const beforeImages = Array.isArray(
      (before.preview as { images?: unknown })?.images,
    )
      ? ((before.preview as { images: unknown[] }).images as string[])
      : [];
    const beforeResource = (
      before.preview as { resource?: { url?: string } } | null
    )?.resource?.url;

    const { error } = await supabase
      .from("products")
      .update({
        title: data.title,
        title_bn: data.title_bn || null,
        subtitle: data.subtitle,
        description: data.description,
        category_id: category.id,
        category_slug: category.slug,
        type: data.type,
        format: data.format,
        price: data.price,
        compare_at: data.compare_at || null,
        stock: data.stock,
        badge: data.badge || null,
        art_key: data.art_key,
        palette: data.palette,
        includes: data.includes,
        requirements: data.requirements,
        specs: data.specs,
        tags: data.tags,
        featured: data.featured,
        is_published: data.is_published,
        sort: data.sort,
        preview: mergePreview(data.preview, data.images, data.resource),
        sku: data.sku || null,
      })
      .eq("slug", slug);

    if (error) throw error;

    // Storage cleanup: images removed in the editor are deleted from the bucket.
    const removedImages = beforeImages.filter(
      (url) => !data.images.includes(url),
    );
    for (const url of removedImages) {
      try {
        await deleteProductImage(url);
      } catch (storageError) {
        console.warn("Could not delete removed product image", storageError);
      }
    }

    if (beforeResource && beforeResource !== data.resource?.url) {
      try {
        await deleteProductResource(beforeResource);
      } catch (storageError) {
        console.warn("Could not delete replaced product PDF", storageError);
      }
    }

    await supabase.from("admin_audit").insert({
      actor_id: current.user.id,
      actor_email: current.profile.email,
      action: "product.update",
      entity: "product",
      entity_id: slug,
      before: { ...before, preview: before.preview },
      after: { ...data, preview: undefined },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/shop/${category.slug}`);
    revalidatePath(`/product/${slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${slug}`);

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    console.error("Product save failed", error);
    return NextResponse.json(
      { message: "The product could not be saved." },
      { status: 500 },
    );
  }
}
