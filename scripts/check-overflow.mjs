/**
 * Reports pages whose content is wider than the emulated viewport.
 *
 *   node scripts/check-overflow.mjs --width=390
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  }),
);

const width = Number(args.get("width") ?? 390);
const height = Number(args.get("height") ?? 844);
const base = args.get("base") ?? "http://localhost:3000";
const loginEmail = args.get("login-email");
const loginPassword = args.get("login-password");

function envFileValue(key) {
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((row) => row.trim().startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? envFileValue("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? envFileValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const chromePath =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  `--user-data-dir=${process.env.CHROME_PROFILE ?? "C:\\Users\\Hp\\AppData\\Local\\Temp\\opencode\\cdp-profile"}`,
  "--remote-debugging-port=9222",
  "about:blank",
]);

let wsUrl;
await new Promise((resolveReady, rejectReady) => {
  const timer = setTimeout(
    () => rejectReady(new Error("Chrome did not expose a DevTools socket on port 9222.")),
    20000,
  );
  const listen = (data) => {
    const match = /ws:\/\/[^\s]+/.exec(data.toString());
    if (match) {
      wsUrl = match[0];
      clearTimeout(timer);
      resolveReady();
    }
  };
  chrome.stderr.on("data", listen);
  chrome.stdout.on("data", listen);
  chrome.on("exit", (code) => rejectReady(new Error(`Chrome exited early (${code}).`)));

  async function probe() {
    try {
      const version = await fetch("http://127.0.0.1:9222/json/version", {
        method: "GET",
      }).then((response) => response.json());
      if (version.webSocketDebuggerUrl) {
        wsUrl = version.webSocketDebuggerUrl;
        clearTimeout(timer);
        resolveReady();
      }
    } catch {
      // Chrome is still starting.
    }
  }

  const poll = setInterval(probe, 250);
  probe().finally(() => {
    if (!wsUrl) return;
    clearInterval(poll);
  });
});

const socket = new WebSocket(wsUrl);
await new Promise((resolveSocket, rejectSocket) => {
  socket.addEventListener("open", resolveSocket, { once: true });
  socket.addEventListener("error", rejectSocket, { once: true });
});

let nextId = 1;
const pending = new Map();
const sessionReady = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve: resolveMessage, reject: rejectMessage } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) rejectMessage(new Error(message.error.message));
    else resolveMessage(message.result);
    return;
  }
  if (message.method === "Target.attachedToTarget" && message.params.targetInfo.type === "page") {
    sessionReady.set(message.params.targetInfo.targetId, message.params.sessionId);
  }
});

function send(method, params = {}, sessionId) {
  const id = nextId++;
  const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
  return new Promise((resolveSend, rejectSend) => {
    pending.set(id, { resolve: resolveSend, reject: rejectSend });
    socket.send(JSON.stringify(payload));
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
await send("Target.attachToTarget", { targetId, flatten: true });
const sessionId = sessionReady.get(targetId);
if (!sessionId) throw new Error("Could not attach to the new tab.");

await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true }, sessionId);

let cookieHeader = "";
if (loginEmail && loginPassword) {
  const login = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  }).then((response) => response.json());

  const encoded = Buffer.from(
    JSON.stringify({
      provider_token: login.provider_token ?? null,
      provider_refresh_token: login.provider_refresh_token ?? null,
      access_token: login.access_token,
      refresh_token: login.refresh_token,
      token_type: login.token_type,
      expires_in: login.expires_in,
      expires_at: login.expires_at,
      user: login.user,
    }),
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  cookieHeader = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token=base64-${encoded}`;
  await send(
    "Network.setCookie",
    {
      name: cookieHeader.split("=")[0],
      value: cookieHeader.split("=").slice(1).join("="),
      url: new URL(base).origin,
      path: "/",
    },
    sessionId,
  );
}

await send("Page.enable", {}, sessionId);

const paths = args.get("paths")
  ? args.get("paths").split(",")
  : [
      "/",
      "/shop",
      "/shop/notion-templates",
      "/shop/study-cards",
      "/shop/printed-planners",
      "/shop/focus-productivity",
      "/shop/bundles",
      "/product/notion-student-os",
      "/product/english-vocabulary-cards",
      "/product/student-starter-bundle",
      "/journal",
      "/faq",
      "/contact",
      "/about",
      "/privacy",
      "/terms",
      "/login",
      "/register",
      "/account",
      "/account/orders",
      "/account/library",
      "/account/profile",
      "/admin",
      "/admin/products",
      "/admin/orders",
      "/admin/promotions",
      "/admin/promo-codes",
      "/admin/products/notion-student-os",
      "/nope",
    ];

for (const path of paths) {
  const url = `${base}${path}`;
  const loaded = new Promise((resolveLoad) => {
    const handler = (event) => {
      const message = JSON.parse(event.data);
      if (message.method === "Page.loadEventFired" && message.sessionId === sessionId) {
        socket.removeEventListener("message", handler);
        resolveLoad();
      }
    };
    socket.addEventListener("message", handler);
  });
  await send("Page.navigate", { url }, sessionId);
  await loaded;
  await new Promise((resolveWait) => setTimeout(resolveWait, 900));

  const result = await send(
    "Runtime.evaluate",
    {
      expression: `(() => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - window.innerWidth;
        const offenders = Array.from(document.querySelectorAll("body *"))
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > window.innerWidth + 1 && rect.left < 0;
          })
          .slice(0, 4)
          .map((node) => node.tagName.toLowerCase() + "." + String(node.className).split(" ").slice(0, 3).join("."));
        return JSON.stringify({ overflow, offenders });
      })()`,
      returnByValue: true,
    },
    sessionId,
  );
  const data = JSON.parse(result.result.value);
  console.log(
    `${data.overflow > 1 ? "OVERFLOW" : "ok      "} ${path} ${data.overflow}px${data.overflow > 1 ? ` ${JSON.stringify(data.offenders)}` : ""}`,
  );
}

chrome.kill();
process.exit(0);
