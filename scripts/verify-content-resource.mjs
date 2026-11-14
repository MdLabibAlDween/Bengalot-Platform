import { readFileSync } from "node:fs";

function env(key) {
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((row) => row.trim().startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : undefined;
}

const base = (process.env.VERIFY_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const url = env("NEXT_PUBLIC_SUPABASE_URL");
const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const service = env("SUPABASE_SERVICE_ROLE_KEY");
const cookieName = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;

function b64(value) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: anon },
  body: JSON.stringify({ email: "admin@bengalot.com", password: "BengalotAdmin!2026" }),
}).then((response) => response.json());

const cookie = `${cookieName}=base64-${b64(
  JSON.stringify({
    provider_token: null,
    provider_refresh_token: null,
    access_token: login.access_token,
    refresh_token: login.refresh_token,
    token_type: login.token_type,
    expires_in: login.expires_in,
    expires_at: login.expires_at,
    user: login.user,
  }),
)}`;

async function app(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { Cookie: cookie, ...(options.headers ?? {}) },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { ok: response.ok, status: response.status, body, text };
}

async function rest(path, options = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: service,
      Authorization: `Bearer ${service}`,
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const results = [];
function check(label, condition, detail = "") {
  results.push(condition);
  console.log(`${condition ? "PASS" : "FAIL"} · ${label}${detail ? ` — ${detail}` : ""}`);
}

let originalRow = null;
let marker = `BENGALOT-CHECK-${Date.now()}`;
let tempProductSlug = null;
let tempOrderNumber = null;
let resourceUrl = null;
let resourcePath = null;

try {
  const beforeRows = await rest("site_settings?key=eq.page_content&select=value");
  originalRow = beforeRows?.[0]?.value ?? null;

  const current = await app("/api/admin/content");
  check("Admin content API loads", current.ok && current.body?.content?.journal, `status ${current.status}`);

  const content = current.body.content;
  const updated = {
    ...content,
    announcement: { ...content.announcement, desktopText: marker },
    journal: { ...content.journal, intro: `${content.journal.intro} ${marker}` },
  };
  const saved = await app("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  check("Admin content API saves", saved.ok && saved.body?.ok, `status ${saved.status}`);

  const home = await fetch(`${base}/`);
  const homeHtml = await home.text();
  check("Announcement updates on storefront", home.ok && homeHtml.includes(marker));

  const journal = await fetch(`${base}/journal`);
  const journalHtml = await journal.text();
  check("Journal page uses saved content", journal.ok && journalHtml.includes(marker));

  for (const path of ["/about", "/faq"]) {
    const page = await fetch(`${base}${path}`);
    check(`${path} renders`, page.ok, `status ${page.status}`);
  }

  // Delivery PDF flow
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF",
    "utf8",
  );
  const form = new FormData();
  form.append("file", new Blob([pdf], { type: "application/pdf" }), "delivery.pdf");
  const upload = await app("/api/admin/resources", { method: "POST", body: form });
  resourceUrl = upload.body?.url;
  check("Admin can upload a delivery PDF", upload.ok && Boolean(resourceUrl), resourceUrl ?? JSON.stringify(upload.body));
  resourcePath = resourceUrl?.split("/storage/v1/object/public/product-resources/")[1];

  const product = await app("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "create",
      title: `Resource Check ${Date.now()}`,
      title_bn: null,
      subtitle: "Temporary product for the delivery PDF check.",
      description: "This product is created by an automated production check and deleted afterwards.",
      sku: `RES-${Date.now()}`,
      category_slug: "notion-templates",
      type: "digital",
      format: "Notion template · PDF guide",
      price: 100,
      compare_at: null,
      stock: 0,
      badge: null,
      featured: false,
      is_published: true,
      art_key: "notion",
      palette: ["#0B4F4A", "#0E7C7B", "#F6D365"],
      includes: ["Notion template", "PDF guide"],
      requirements: ["A free Notion account"],
      specs: [],
      tags: ["check"],
      sort: 999,
      preview: {},
      images: [],
      resource: resourceUrl ? { url: resourceUrl, label: "Download the PDF guide" } : null,
    }),
  });
  tempProductSlug = product.body?.slug;
  check("Product saves with delivery PDF", product.ok && Boolean(tempProductSlug), tempProductSlug ?? JSON.stringify(product.body));

  if (tempProductSlug) {
    const order = await app("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Resource Check",
        email: "support@bengalot.com",
        phone: "01701234567",
        address: "Verification bench, road 12, block C",
        city: "Dhaka",
        district: "Dhaka",
        paymentMethod: "bkash",
        items: [{ slug: tempProductSlug, quantity: 1 }],
      }),
    });
    tempOrderNumber = order.body?.orderNumber;
    check("Digital order is created", order.ok && Boolean(tempOrderNumber), tempOrderNumber ?? JSON.stringify(order.body));

    if (tempOrderNumber) {
      const orderRow = (await rest(`orders?order_number=eq.${tempOrderNumber}&select=id`))?.[0];
      const entitlements = orderRow
        ? await rest(`entitlements?order_id=eq.${orderRow.id}&select=access_url,access_label`)
        : null;
      check(
        "Library entitlement points at the uploaded PDF",
        Array.isArray(entitlements) &&
          entitlements[0]?.access_url === resourceUrl &&
          entitlements[0]?.access_label === "Download the PDF guide",
        JSON.stringify(entitlements ?? {}),
      );
    }
  }

  const adminContent = await fetch(`${base}/admin/content`, {
    headers: { Cookie: cookie },
  });
  check("Admin content page renders", adminContent.ok, `status ${adminContent.status}`);
} finally {
  if (tempOrderNumber) {
    const rows = await rest(`orders?order_number=eq.${tempOrderNumber}&select=id`);
    const id = rows?.[0]?.id;
    if (id) {
      await rest(`entitlements?order_id=eq.${id}`, { method: "DELETE" });
      await rest(`admin_audit?entity_id=eq.${id}`, { method: "DELETE" });
      await rest(`orders?id=eq.${id}`, { method: "DELETE" });
    }
  }
  if (tempProductSlug) {
    await rest(`admin_audit?entity_id=eq.${tempProductSlug}`, { method: "DELETE" });
    await rest(`products?slug=eq.${tempProductSlug}`, { method: "DELETE" });
  }
  if (resourcePath) {
    await fetch(`${url}/storage/v1/object/product-resources/${decodeURIComponent(resourcePath)}`, {
      method: "DELETE",
      headers: { apikey: service, Authorization: `Bearer ${service}` },
    });
  }

  if (originalRow) {
    await rest("site_settings?key=eq.page_content", {
      method: "PATCH",
      body: JSON.stringify({ value: originalRow }),
    });
  } else {
    await rest("site_settings?key=eq.page_content", { method: "DELETE" });
  }
  console.log("Cleanup complete.");
}

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed.`);
if (passed !== results.length) process.exitCode = 1;
