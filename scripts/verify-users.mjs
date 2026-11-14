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

function cookieFor(session) {
  return `${cookieName}=base64-${b64(
    JSON.stringify({
      provider_token: null,
      provider_refresh_token: null,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      user: session.user,
    }),
  )}`;
}

const adminSession = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: anon },
  body: JSON.stringify({ email: "admin@bengalot.com", password: "BengalotAdmin!2026" }),
}).then((response) => response.json());
const cookie = cookieFor(adminSession);
const adminId = adminSession.user.id;

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

async function adminAuth(path, options = {}) {
  const response = await fetch(`${url}/auth/v1/admin/${path}`, {
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

let originalContentRow = null;
let tempUserId = null;
let registerUserId = null;
const marker = `CHECK-${Date.now()}`;
const originalMetadata = adminSession.user.user_metadata ?? {};

try {
  // Content + social link
  const beforeRows = await rest("site_settings?key=eq.page_content&select=value");
  originalContentRow = beforeRows?.[0]?.value ?? null;
  const contentResponse = await app("/api/admin/content");
  const content = contentResponse.body.content;
  const savedContent = await app("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...content,
      social: { ...content.social, instagram: `https://instagram.com/${marker}` },
    }),
  });
  check("Content + social links save", savedContent.ok, `status ${savedContent.status}`);
  const home = await fetch(`${base}/`);
  const homeHtml = await home.text();
  check("Footer shows the saved social link", homeHtml.includes(`instagram.com/${marker}`));

  // Addresses
  const addressResponse = await app("/api/account/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addresses: [
        {
          id: "check-address",
          label: "Verification",
          fullName: "Bengalot Check",
          phone: "01701234567",
          address: "House 12, Road 3, Verification Area",
          city: "Dhaka",
          district: "Dhaka",
          isDefault: true,
        },
      ],
    }),
  });
  check("Saved address API works", addressResponse.ok && addressResponse.body?.addresses?.length === 1);
  const addressPage = await app("/account/addresses");
  check("Address page renders the saved address", addressPage.ok && addressPage.text.includes("Verification"));
  const checkoutPage = await app("/checkout");
  check("Checkout receives the saved address", checkoutPage.ok && checkoutPage.text.includes("Verification"));

  // User lifecycle — accounts are created in Supabase Auth, never in the studio.
  const email = `verify-user-${Date.now()}@bengalot.dev`;
  const created = await adminAuth("users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password: "VerifyPass!2026",
      email_confirm: true,
      user_metadata: { full_name: "Verification Customer" },
    }),
  });
  tempUserId = created?.id ?? null;
  check(
    "Supabase Auth creates a customer profile automatically",
    Boolean(tempUserId),
    tempUserId ?? JSON.stringify(created),
  );

  if (tempUserId) {
    const profileRows = await rest(`profiles?id=eq.${tempUserId}&select=role,email`);
    check("New account is a real customer profile", profileRows?.[0]?.role === "customer", JSON.stringify(profileRows));

    const update = await app("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        userId: tempUserId,
        fullName: "Verification Customer",
        role: "staff",
      }),
    });
    const roles = await rest(`profiles?id=eq.${tempUserId}&select=role`);
    check("Admin can change roles", update.ok && roles?.[0]?.role === "staff");

    const product = (await rest("products?slug=eq.notion-student-os&select=id,title"))?.[0];
    const grant = await app("/api/admin/users/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant", userId: tempUserId, productId: product.id }),
    });
    const granted = await rest(`entitlements?user_id=eq.${tempUserId}&select=id,access_url,access_label`);
    check("Admin can grant a product to a user", grant.ok && granted?.length === 1, JSON.stringify(granted));

    if (granted?.[0]?.id) {
      const refresh = await app("/api/admin/users/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "refresh",
          userId: tempUserId,
          entitlementId: granted[0].id,
        }),
      });
      check("Admin can refresh the access link", refresh.ok);

      const revoke = await app("/api/admin/users/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke",
          userId: tempUserId,
          entitlementId: granted[0].id,
        }),
      });
      const afterRevoke = await rest(`entitlements?user_id=eq.${tempUserId}&select=id`);
      check("Admin can revoke access", revoke.ok && afterRevoke?.length === 0);
    }

    const reset = await app("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset", userId: tempUserId }),
    });
    check("Admin can send a password reset", reset.ok);

    const usersPage = await app("/admin/users");
    check("Users page renders", usersPage.ok && usersPage.text.includes("Verification Customer"));
    const detailPage = await app(`/admin/users/${tempUserId}`);
    check("User detail page renders", detailPage.ok && detailPage.text.includes("Library"));

    const removed = await app("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", userId: tempUserId }),
    });
    const gone = await rest(`profiles?id=eq.${tempUserId}&select=id`);
    check("Admin can delete a user", removed.ok && gone?.length === 0);
    tempUserId = null;
  }

  // Public registration
  const registerEmail = `verify-register-${Date.now()}@bengalot.dev`;
  const register = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Verification Register",
      email: registerEmail,
      password: "VerifyPass!2026",
    }),
  });
  const registerData = await register.json();
  const registerProfile = await rest(`profiles?email=eq.${registerEmail}&select=id,role`);
  registerUserId = registerProfile?.[0]?.id ?? null;
  check(
    "Public registration creates a customer account",
    register.ok && registerData.ok && registerProfile?.[0]?.role === "customer",
    JSON.stringify(registerProfile),
  );

  for (const path of ["/login", "/register", "/forgot-password", "/reset-password"]) {
    const page = await fetch(`${base}${path}`);
    check(`${path} renders`, page.ok, `status ${page.status}`);
  }
} finally {
  if (tempUserId) {
    await app("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", userId: tempUserId }),
    });
  }
  if (registerUserId) {
    await adminAuth(`users/${registerUserId}`, { method: "DELETE" });
  }
  await adminAuth(`users/${adminId}`, {
    method: "PUT",
    body: JSON.stringify({
      user_metadata: {
        ...originalMetadata,
        addresses: Array.isArray(originalMetadata.addresses)
          ? originalMetadata.addresses
          : [],
      },
    }),
  });
  if (originalContentRow) {
    await rest("site_settings?key=eq.page_content", {
      method: "PATCH",
      body: JSON.stringify({ value: originalContentRow }),
    });
  } else {
    await rest("site_settings?key=eq.page_content", { method: "DELETE" });
  }
  console.log("Cleanup complete.");
}

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed.`);
if (passed !== results.length) process.exitCode = 1;
