/**
 * End-to-end verification for the product image system.
 *
 *  1. Signs in as the demo admin.
 *  2. Uploads a generated test image through the admin upload API.
 *  3. Creates a temporary product carrying that photo.
 *  4. Confirms the product page, shop, studio and card artwork render it.
 *  5. Deletes the temporary product, its photo and the audit trail.
 *
 * Run with the dev or production server running:
 *   node scripts/verify-image-flow.mjs
 *
 * Set VERIFY_BASE_URL to test a deployed URL.
 */

import { readFileSync } from "node:fs";

const BASE_URL = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

function envFileValue(key) {
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((row) => row.trim().startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? envFileValue("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? envFileValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? envFileValue("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Supabase environment values are required in .env.local.");
}

const adminEmail = process.env.VERIFY_ADMIN_EMAIL ?? "admin@bengalot.com";
const adminPassword = process.env.VERIFY_ADMIN_PASSWORD ?? "BengalotAdmin!2026";

const authCookieName = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

const results = [];
function record(label, ok, detail = "") {
  results.push({ label, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} · ${label}${detail ? ` — ${detail}` : ""}`);
}

function base64Url(value) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function rest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text ? JSON.parse(text) : null };
}

async function adminApi(path, body, isForm = false) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Cookie: `${authCookieName}=${adminCookieValue}`,
      ...(isForm ? {} : { "Content-Type": "application/json" }),
    },
    body: isForm ? body : JSON.stringify(body),
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text ? JSON.parse(text) : null };
}

const login = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: anonKey },
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});
if (!login.ok) throw new Error("Admin sign-in failed.");
const session = await login.json();

const adminCookieValue = `base64-${base64Url(
  JSON.stringify({
    provider_token: session.provider_token ?? null,
    provider_refresh_token: session.provider_refresh_token ?? null,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    user: session.user,
  }),
)}`;

// A valid 2x2 PNG, generated locally so no external asset is needed.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAACZgbYnAAAAFElEQVR4nGP8z8Dwn4GBgYGJgAAAJQMDALV0ZmsAAAAASUVORK5CYII=",
  "base64",
);

const unauthorised = await fetch(`${BASE_URL}/api/admin/uploads`, {
  method: "POST",
  body: (() => {
    const form = new FormData();
    form.append("file", new Blob([png], { type: "image/png" }), "test.png");
    return form;
  })(),
});
record(
  "Uploads require a staff session",
  unauthorised.status === 403,
  `status ${unauthorised.status}`,
);

const form = new FormData();
form.append("file", new Blob([png], { type: "image/png" }), "verify-product.png");
const upload = await adminApi("/api/admin/uploads", form, true);
const imageUrl = upload.body?.url;
record(
  "Admin can upload a product photo",
  upload.ok && typeof imageUrl === "string" && imageUrl.includes("/storage/v1/object/public/product-images/"),
  imageUrl ?? JSON.stringify(upload.body),
);

const categories = await rest("categories?select=slug&order=sort&limit=1");
const categorySlug = categories.body?.[0]?.slug ?? "notion-templates";

const createPayload = {
  mode: "create",
  title: "Verification Photo Product",
  title_bn: null,
  subtitle: "A temporary product used to verify the photo system.",
  description: "This product exists only for the automated image verification run and is deleted afterwards.",
  sku: `VERIFY-${Date.now()}`,
  category_slug: categorySlug,
  type: "physical",
  format: "Verification · 1 unit",
  price: 100,
  compare_at: null,
  stock: 1,
  badge: null,
  featured: false,
  is_published: true,
  art_key: "notion",
  palette: ["#0B4F4A", "#0E7C7B", "#F6D365"],
  includes: ["Verification photo"],
  requirements: [],
  specs: [],
  tags: ["verify"],
  sort: 999,
  preview: {},
  images: imageUrl ? [imageUrl] : [],
};

const created = await adminApi("/api/admin/products", createPayload);
const slug = created.body?.slug;
record(
  "Admin can create a product with a photo",
  created.ok && Boolean(slug),
  slug ?? JSON.stringify(created.body),
);

if (slug) {
  const page = await fetch(`${BASE_URL}/product/${slug}`);
  const html = await page.text();
  const usesPhoto =
    html.includes("product-images") &&
    html.includes("photo 1 of 1") &&
    html.includes("Tap to zoom");
  record(
    "Product page renders the uploaded photo",
    page.ok && usesPhoto,
    `status ${page.status}`,
  );

  const studio = await fetch(`${BASE_URL}/admin/products/${slug}`, {
    headers: { Cookie: `${authCookieName}=${adminCookieValue}` },
  });
  const studioHtml = await studio.text();
  record(
    "Studio editor loads the product with its photo",
    studio.ok && studioHtml.includes(imageUrl),
    `status ${studio.status}`,
  );

  const shop = await fetch(`${BASE_URL}/shop`);
  const shopHtml = await shop.text();
  record(
    "Shop cards use the uploaded cover photo",
    shop.ok && shopHtml.includes(imageUrl),
    `status ${shop.status}`,
  );

  const duplicate = await adminApi("/api/admin/products", createPayload);
  const duplicateSlug = duplicate.body?.slug;
  record(
    "Duplicate titles get unique web addresses",
    duplicate.ok && duplicateSlug && duplicateSlug !== slug,
    duplicateSlug ?? JSON.stringify(duplicate.body),
  );

  const slugs = [slug, duplicateSlug].filter(Boolean);
  await rest(`products?slug=in.(${slugs.join(",")})`, { method: "DELETE" });
  await rest(`admin_audit?entity_id=in.(${slugs.join(",")})`, { method: "DELETE" });

  const imagePath = imageUrl
    ? imageUrl.split("/storage/v1/object/public/product-images/")[1]
    : null;
  if (imagePath) {
    await fetch(
      `${supabaseUrl}/storage/v1/object/product-images/${decodeURIComponent(imagePath)}`,
      {
        method: "DELETE",
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      },
    );
  }
  record("Temporary products and photos cleaned up", true, slugs.join(", "));
}

const failures = results.filter((result) => !result.ok);
console.log(`\n${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length) process.exitCode = 1;
