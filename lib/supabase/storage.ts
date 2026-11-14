import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

export const PRODUCT_IMAGE_BUCKET = "product-images";
export const PRODUCT_RESOURCE_BUCKET = "product-resources";

const MAX_BYTES = 6 * 1024 * 1024;
const MAX_RESOURCE_BYTES = 25 * 1024 * 1024;
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function isAllowedImage(file: { type: string; size: number }) {
  return allowedTypes.has(file.type) && file.size > 0 && file.size <= MAX_BYTES;
}

export function isAllowedResource(file: { type: string; size: number }) {
  return (
    file.type === "application/pdf" &&
    file.size > 0 &&
    file.size <= MAX_RESOURCE_BYTES
  );
}

export function productImagePath(extension: string) {
  const id = crypto.randomUUID();
  return `products/${id}.${extension}`;
}

function extensionFor(file: File) {
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

async function ensureBucket({
  bucket,
  maxBytes,
  mimeTypes,
}: {
  bucket: string;
  maxBytes: number;
  mimeTypes: string[];
}) {
  const supabase = createSupabaseAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const existing = buckets?.find((item) => item.name === bucket);
  if (!existing) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: maxBytes,
      allowedMimeTypes: mimeTypes,
    });
    if (createError) throw createError;
    return;
  }

  if (!existing.public) {
    await supabase.storage.updateBucket(bucket, { public: true });
  }
}

export async function uploadProductImage(file: File) {
  if (!isAllowedImage(file)) {
    throw new Error("Upload a JPG, PNG, WebP or AVIF image up to 6MB.");
  }
  await ensureBucket({
    bucket: PRODUCT_IMAGE_BUCKET,
    maxBytes: MAX_BYTES,
    mimeTypes: [...allowedTypes],
  });

  const supabase = createSupabaseAdminClient();
  const path = productImagePath(extensionFor(file));
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) throw new Error("The image could not be published.");
  return data.publicUrl;
}

function pathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export function isProductImage(url: string) {
  const storageHost = new URL(publicEnv.supabaseUrl).hostname;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === storageHost &&
      Boolean(pathFromUrl(parsed.toString()))
    );
  } catch {
    return false;
  }
}

export async function deleteProductImage(url: string) {
  if (!isProductImage(url)) return;
  const path = pathFromUrl(url);
  if (!path) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([path]);
  if (error) throw error;
}

function resourcePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${PRODUCT_RESOURCE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export function isProductResource(url: string) {
  const storageHost = new URL(publicEnv.supabaseUrl).hostname;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === storageHost &&
      Boolean(resourcePathFromUrl(parsed.toString()))
    );
  } catch {
    return false;
  }
}

export async function uploadProductResource(file: File) {
  if (!isAllowedResource(file)) {
    throw new Error("Upload a PDF file up to 25MB.");
  }
  await ensureBucket({
    bucket: PRODUCT_RESOURCE_BUCKET,
    maxBytes: MAX_RESOURCE_BYTES,
    mimeTypes: ["application/pdf"],
  });

  const supabase = createSupabaseAdminClient();
  const path = `products/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from(PRODUCT_RESOURCE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: "application/pdf",
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage
    .from(PRODUCT_RESOURCE_BUCKET)
    .getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("The PDF could not be published.");
  return data.publicUrl;
}

export async function deleteProductResource(url: string) {
  if (!isProductResource(url)) return;
  const path = resourcePathFromUrl(url);
  if (!path) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(PRODUCT_RESOURCE_BUCKET)
    .remove([path]);
  if (error) throw error;
}
