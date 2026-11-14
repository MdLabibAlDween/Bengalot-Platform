import { readFileSync } from "node:fs";

const env = (key) =>
  readFileSync(".env.local", "utf8")
    .split("\n")
    .find((row) => row.trim().startsWith(`${key}=`))
    ?.slice(key.length + 1)
    .trim();

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

const session = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: anon },
  body: JSON.stringify({ email: "admin@bengalot.com", password: "BengalotAdmin!2026" }),
}).then((response) => response.json());

const cookie = `${cookieName}=base64-${b64(
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

async function rest(path) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
    },
  });
  return response.json();
}

async function api(path, options = {}) {
  const response = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: { Cookie: cookie, ...(options.headers ?? {}) },
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text ? JSON.parse(text) : null };
}

const promotions = await rest("promotions?select=*&order=sort");
const original = promotions[0];
console.log("promotion", original.id, original.title);

const file = readFileSync("public/brand/bengalot-mark.png");
const form = new FormData();
form.append("file", new Blob([file], { type: "image/png" }), "promo-check.png");
const upload = await api("/api/admin/uploads", { method: "POST", body: form });
console.log("upload", upload.status, upload.body?.url);
const imageUrl = upload.body?.url;

const payload = {
  id: original.id,
  eyebrow: original.eyebrow,
  title: original.title,
  description: original.description,
  cta_label: original.cta_label,
  cta_href: original.cta_href,
  art_key: original.art_key,
  theme: { ...original.theme, image: imageUrl },
  sort: original.sort,
  is_active: original.is_active,
};

const save = await api("/api/admin/promotions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
console.log("save", save.status, save.body);

const home = await fetch("http://localhost:3000/").then((response) => response.text());
console.log("homepage image", home.includes(imageUrl));
console.log("promotions section", home.includes('id="promotions"'));

const restore = await api("/api/admin/promotions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...payload,
    theme: { ...original.theme, image: null },
  }),
});
console.log("restore", restore.status, restore.body);
