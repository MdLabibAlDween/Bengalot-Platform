/**
 * Small DevTools-driven screenshot helper used for visual verification.
 *
 *   node scripts/screenshot.mjs --url=http://localhost:3000 --out=temp/page.png
 *   node scripts/screenshot.mjs --url=http://localhost:3000/checkout --out=temp/checkout.png --scroll="Promo code"
 *   node scripts/screenshot.mjs --url=http://localhost:3000/admin --out=temp/admin.png --width=1440 --height=900
 *   node scripts/screenshot.mjs --url=http://localhost:3000/admin --out=temp/admin.png --cookie="bengalot-order-access=..."
 *
 * Requires Chrome at the default Windows path. Set CHROME_PATH to override.
 */

import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, "").split("=");
    return [key, rest.join("=")];
  }),
);

const url = args.get("url") ?? "http://localhost:3000";
const out = resolve(args.get("out") ?? "temp/screenshot.png");
const width = Number(args.get("width") ?? 1440);
const height = Number(args.get("height") ?? 900);
const scrollText = args.get("scroll");
const cookieArg = args.get("cookie");
const storageArg = args.get("storage");
const loginEmail = args.get("login-email");
const loginPassword = args.get("login-password");
const chromePath =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function envFileValue(key) {
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((row) => row.trim().startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : undefined;
}

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
  const payload = sessionId
    ? { id, method, params, sessionId }
    : { id, method, params };
  return new Promise((resolveSend, rejectSend) => {
    pending.set(id, { resolve: resolveSend, reject: rejectSend });
    socket.send(JSON.stringify(payload));
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
await send("Target.attachToTarget", { targetId, flatten: true });
const sessionId = sessionReady.get(targetId);
if (!sessionId) throw new Error("Could not attach to the new tab.");

await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false }, sessionId);

if (storageArg) {
  const storagePath = resolve(storageArg);
  const entries = Object.entries(JSON.parse(readFileSync(storagePath, "utf8")));
  const source = `for (const [key, value] of ${JSON.stringify(entries)}) { window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); }`;
  await send("Page.addScriptToEvaluateOnNewDocument", { source }, sessionId);
}

if (cookieArg) {
  for (const pair of cookieArg.split(";")) {
    const [name, ...rest] = pair.trim().split("=");
    if (!name) continue;
    await send(
      "Network.setCookie",
      { name, value: rest.join("="), url: new URL(url).origin, path: "/" },
      sessionId,
    );
  }
}

if (loginEmail && loginPassword) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? envFileValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? envFileValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
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

  await send(
    "Network.setCookie",
    {
      name: `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`,
      value: `base64-${encoded}`,
      url: new URL(url).origin,
      path: "/",
    },
    sessionId,
  );
}

await send("Page.enable", {}, sessionId);
const loaded = new Promise((resolveLoad) => {
  socket.addEventListener("message", function handler(event) {
    const message = JSON.parse(event.data);
    if (message.method === "Page.loadEventFired" && message.sessionId === sessionId) {
      socket.removeEventListener("message", handler);
      resolveLoad();
    }
  });
});
await send("Page.navigate", { url }, sessionId);
await loaded;
await new Promise((resolvePaint) => setTimeout(resolvePaint, 1200));

if (scrollText) {
  await send(
    "Runtime.evaluate",
    {
      expression: `(() => {
        const needle = ${JSON.stringify(scrollText)}.toLowerCase();
        const node = Array.from(document.querySelectorAll("h1,h2,h3,p,span,button,summary,label"))
          .find((item) => item.textContent?.trim().toLowerCase().includes(needle));
        node?.scrollIntoView({ block: "center", behavior: "instant" });
        return Boolean(node);
      })()`,
      returnByValue: true,
    },
    sessionId,
  );
  await new Promise((resolveScroll) => setTimeout(resolveScroll, 2200));
}

const screenshot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(screenshot.data, "base64"));
console.log(out);
chrome.kill();
process.exit(0);
