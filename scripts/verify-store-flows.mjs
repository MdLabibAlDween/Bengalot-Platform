/**
 * End-to-end verification for the storefront order flows.
 *
 * What it does:
 *  1. Signs in as the demo admin and seeds demo promo codes if none exist.
 *  2. Saves bundle component selection for the Student Starter Bundle.
 *  3. Checks the promo validation endpoint (valid, invalid, below minimum).
 *  4. Places a cash-on-delivery test order (plain product and a bundle).
 *  5. Confirms the order rows, discount, delivery fee and stock decrement.
 *  6. Marks the bundle order delivered, then cancels it to restore stock.
 *  7. Cleans up every test order and restores original stock.
 *
 * Run with the dev or production server running:
 *   node scripts/verify-store-flows.mjs
 *
 * The script only creates and deletes its own test orders. It never touches
 * real customer data. Set VERIFY_BASE_URL to test a deployed URL.
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
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local first.",
  );
}

const adminEmail = process.env.VERIFY_ADMIN_EMAIL ?? "admin@bengalot.com";
const adminPassword = process.env.VERIFY_ADMIN_PASSWORD ?? "BengalotAdmin!2026";

const supabaseRef = new URL(supabaseUrl).hostname.split(".")[0];
const authCookieName = `sb-${supabaseRef}-auth-token`;

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

async function supabase(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text ? JSON.parse(text) : null };
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

async function adminApi(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${authCookieName}=${adminCookieValue}`,
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text ? JSON.parse(text) : null };
}

const session = await supabase("auth/v1/token?grant_type=password", {
  method: "POST",
  body: JSON.stringify({ email: adminEmail, password: adminPassword }),
});
if (!session.ok) {
  throw new Error(`Admin sign-in failed (${session.status}). Check VERIFY_ADMIN_EMAIL/PASSWORD.`);
}

const authSession = session.body;
const adminCookieValue = `base64-${base64Url(
  JSON.stringify({
    provider_token: authSession.provider_token ?? null,
    provider_refresh_token: authSession.provider_refresh_token ?? null,
    access_token: authSession.access_token,
    refresh_token: authSession.refresh_token,
    token_type: authSession.token_type,
    expires_in: authSession.expires_in,
    expires_at: authSession.expires_at,
    user: authSession.user,
  }),
)}`;

const existingCodes = await rest("site_settings?key=eq.promo_codes&select=value");
const storedCodes = Array.isArray(existingCodes.body?.[0]?.value)
  ? existingCodes.body[0].value
  : [];

const wantedCodes = [
  {
    code: "BENGALOT10",
    description: "10% off orders over ৳1,500, capped at ৳400",
    type: "percent",
    value: 10,
    minSubtotal: 1500,
    maxDiscount: 400,
    active: true,
    expiresAt: null,
  },
  {
    code: "STUDENT200",
    description: "৳200 off orders over ৳2,000",
    type: "fixed",
    value: 200,
    minSubtotal: 2000,
    maxDiscount: null,
    active: true,
    expiresAt: null,
  },
];

const codeMap = new Map(storedCodes.map((code) => [code.code, code]));
for (const wanted of wantedCodes) {
  if (!codeMap.has(wanted.code)) codeMap.set(wanted.code, wanted);
}
const mergedCodes = [...codeMap.values()];

const promoSave = await adminApi("/api/admin/promo-codes", mergedCodes);
record(
  "Admin saves promo codes",
  promoSave.ok && Array.isArray(promoSave.body?.codes),
  promoSave.ok ? `${promoSave.body.codes.length} codes` : JSON.stringify(promoSave.body),
);

const studentProduct = await rest("products?slug=eq.student-starter-bundle&select=*");
const student = studentProduct.body?.[0];
if (!student) throw new Error("Student Starter Bundle not found.");

const bundlePayload = {
  slug: student.slug,
  title: student.title,
  title_bn: student.title_bn,
  subtitle: student.subtitle,
  description: student.description,
  sku: student.sku,
  category_slug: student.category_slug,
  type: student.type,
  format: student.format,
  price: student.price,
  compare_at: student.compare_at,
  stock: student.stock,
  badge: student.badge,
  featured: student.featured,
  is_published: student.is_published,
  art_key: student.art_key,
  palette: student.palette,
  includes: student.includes,
  requirements: student.requirements,
  specs: student.specs,
  tags: student.tags,
  sort: student.sort,
  preview: {
    ...student.preview,
    productSlugs: ["notion-student-os", "deep-work-study-guide"],
  },
  images: Array.isArray(student.preview?.images) ? student.preview.images : [],
};

const bundleSave = await adminApi("/api/admin/products", bundlePayload);
record(
  "Admin saves bundle components",
  bundleSave.ok,
  bundleSave.ok ? "preview.productSlugs stored" : JSON.stringify(bundleSave.body),
);

const bundleAfterSave = await rest("products?slug=eq.student-starter-bundle&select=preview");
const savedSlugs = bundleAfterSave.body?.[0]?.preview?.productSlugs ?? [];
record(
  "Bundle digital components persist",
  savedSlugs.includes("notion-student-os") && savedSlugs.includes("deep-work-study-guide"),
  savedSlugs.join(", "),
);

async function validatePromo(code, subtotal) {
  const response = await fetch(`${BASE_URL}/api/promos/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  return { ok: response.ok, status: response.status, body: await response.json() };
}

const validPromo = await validatePromo("bengalot10", 1780);
record(
  "Promo validation accepts a valid code",
  validPromo.ok && validPromo.body.discount === 178,
  `discount ${validPromo.body.discount ?? "none"}`,
);

const cappedPromo = await validatePromo("BENGALOT10", 6000);
record(
  "Promo validation caps percentage discounts",
  cappedPromo.ok && cappedPromo.body.discount === 400,
  `discount ${cappedPromo.body.discount ?? "none"}`,
);

const minimumPromo = await validatePromo("BENGALOT10", 890);
record(
  "Promo validation rejects a low subtotal",
  !minimumPromo.ok,
  minimumPromo.body.message ?? "",
);

const unknownPromo = await validatePromo("NOT-A-CODE", 3000);
record("Promo validation rejects an unknown code", !unknownPromo.ok, unknownPromo.body.message ?? "");

async function stockFor(slug) {
  const { body } = await rest(`products?slug=eq.${slug}&select=stock`);
  return Number(body?.[0]?.stock);
}

const initialStock = {
  "english-vocabulary-cards": await stockFor("english-vocabulary-cards"),
  "student-starter-bundle": await stockFor("student-starter-bundle"),
};

const testEmail = "verify-cod@bengalot.dev";

async function placeOrder(payload) {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { ok: response.ok, status: response.status, body: await response.json() };
}

const orderBase = {
  customerName: "Bengalot Flow Check",
  email: testEmail,
  phone: "01701234567",
  address: "Verification bench, road 12, block C",
  city: "Dhaka",
  district: "Dhaka",
  notes: "Automated verification order",
  paymentMethod: "cod",
};

const plainOrder = await placeOrder({
  ...orderBase,
  items: [{ slug: "english-vocabulary-cards", quantity: 1 }],
});
record(
  "Cash on delivery order is created",
  plainOrder.ok && Boolean(plainOrder.body.orderNumber),
  JSON.stringify(plainOrder.body ?? {}),
);

const bundleOrder = await placeOrder({
  ...orderBase,
  email: testEmail,
  promoCode: "BENGALOT10",
  items: [{ slug: "student-starter-bundle", quantity: 1 }],
});
record(
  "Cash on delivery bundle order with promo is created",
  bundleOrder.ok && bundleOrder.body.discount === 229,
  JSON.stringify(bundleOrder.body ?? {}),
);

const createdOrderNumbers = [
  plainOrder.body?.orderNumber,
  bundleOrder.body?.orderNumber,
].filter(Boolean);

let orderAccessCookie;
for (const number of createdOrderNumbers) {
  const { body } = await rest(`orders?order_number=eq.${number}&select=id,order_number`);
  const orderId = body?.[0]?.id;
  if (orderId) orderAccessCookie ??= orderId;
}

async function orderRow(number) {
  const { body } = await rest(
    `orders?order_number=eq.${number}&select=order_number,subtotal,delivery_fee,discount,total,payment_method,payment_status,status`,
  );
  return body?.[0] ?? null;
}

const plainRow = await orderRow(plainOrder.body?.orderNumber);
record(
  "Plain COD order stores delivery and totals",
  Boolean(plainRow) &&
    plainRow.subtotal === 890 &&
    plainRow.delivery_fee === 130 &&
    plainRow.discount === 0 &&
    plainRow.total === 1020 &&
    plainRow.payment_method === "cod" &&
    plainRow.status === "processing",
  JSON.stringify(plainRow ?? {}),
);

const bundleRow = await orderRow(bundleOrder.body?.orderNumber);
record(
  "Promo bundle order stores discount and total",
  Boolean(bundleRow) &&
    bundleRow.subtotal === 2290 &&
    bundleRow.delivery_fee === 0 &&
    bundleRow.discount === 229 &&
    bundleRow.total === 2061,
  JSON.stringify(bundleRow ?? {}),
);

const stockAfterOrders = await stockFor("student-starter-bundle");
record(
  "Stock decrements for a physical bundle",
  stockAfterOrders === initialStock["student-starter-bundle"] - 1,
  `${initialStock["student-starter-bundle"]} → ${stockAfterOrders}`,
);

const orderId = (
  await rest(`orders?order_number=eq.${bundleOrder.body.orderNumber}&select=id`)
).body?.[0]?.id;

if (orderId) {
  const delivered = await adminApi("/api/admin/orders", {
    id: orderId,
    status: "delivered",
  });
  const deliveredRow = await orderRow(bundleOrder.body.orderNumber);
  record(
    "Delivered COD order is marked paid",
    delivered.ok && deliveredRow.payment_status === "paid",
    JSON.stringify(deliveredRow ?? {}),
  );

  const cancelled = await adminApi("/api/admin/orders", {
    id: orderId,
    status: "cancelled",
  });
  const cancelledRow = await orderRow(bundleOrder.body.orderNumber);
  const stockAfterCancel = await stockFor("student-starter-bundle");
  record(
    "Cancelling a COD order restores stock",
    cancelled.ok &&
      cancelledRow.status === "cancelled" &&
      stockAfterCancel === initialStock["student-starter-bundle"],
    `${initialStock["student-starter-bundle"]} → ${stockAfterCancel}`,
  );
}

const withoutCookie = await fetch(
  `${BASE_URL}/checkout/success?order=${encodeURIComponent(plainOrder.body.orderNumber)}`,
);
record(
  "Order confirmation is blocked without the access cookie",
  withoutCookie.status === 404,
  `status ${withoutCookie.status}`,
);

const withCookie = await fetch(
  `${BASE_URL}/checkout/success?order=${encodeURIComponent(plainOrder.body.orderNumber)}`,
  {
    headers: {
      Cookie: `bengalot-order-access=${orderAccessCookie ?? ""}`,
    },
  },
);
record(
  "Order confirmation opens with the access cookie",
  withCookie.status === 200,
  `status ${withCookie.status}`,
);

const appOrderIds = createdOrderNumbers.length
  ? (
      await rest(
        `orders?order_number=in.(${createdOrderNumbers.join(",")})&select=id`,
      )
    ).body.map((row) => row.id)
  : [];

if (appOrderIds.length) {
  await rest(`orders?id=in.(${appOrderIds.join(",")})`, { method: "DELETE" });
}

for (const [slug, stock] of Object.entries(initialStock)) {
  await rest(`products?slug=eq.${slug}`, {
    method: "PATCH",
    body: JSON.stringify({ stock }),
  });
}

const finalStock = await stockFor("student-starter-bundle");
record(
  "Test orders cleaned up and stock restored",
  finalStock === initialStock["student-starter-bundle"],
  `${finalStock}`,
);

const failures = results.filter((result) => !result.ok);
console.log(`\n${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length) process.exitCode = 1;
