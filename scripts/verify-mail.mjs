/**
 * Checks both Purelymail mailboxes and optionally sends test emails.
 *
 *   node scripts/verify-mail.mjs
 *   VERIFY_MAIL_TO=you@example.com node scripts/verify-mail.mjs
 *
 * It never prints passwords.
 */

import { readFileSync } from "node:fs";

import nodemailer from "nodemailer";

function envFileValue(key) {
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((row) => row.trim().startsWith(`${key}=`));
  if (!line) return undefined;
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^"(.*)"$/, "$1");
}

function value(key) {
  return process.env[key] ?? envFileValue(key);
}

const host = value("MAIL_HOST") ?? "smtp.purelymail.com";
const port = Number(value("MAIL_PORT") ?? "465");
const secureValue = value("MAIL_SECURE");
const secure = secureValue !== undefined ? secureValue !== "false" : port === 465;
const testTo = process.env.VERIFY_MAIL_TO;

const accounts = [
  {
    label: "support",
    user: value("MAIL_SUPPORT_USER") ?? value("MAIL_USER"),
    pass: value("MAIL_SUPPORT_PASS") ?? value("MAIL_PASS"),
    from:
      value("MAIL_SUPPORT_FROM") ??
      value("MAIL_FROM") ??
      "Bengalot Support <support@bengalot.com>",
  },
  {
    label: "info",
    user: value("MAIL_INFO_USER"),
    pass: value("MAIL_INFO_PASS"),
    from: value("MAIL_INFO_FROM") ?? "Bengalot <info@bengalot.com>",
  },
];

function mask(user) {
  if (!user) return "(not set)";
  const [name, domain] = user.split("@");
  return `${name.slice(0, 2)}***@${domain ?? "?"}`;
}

console.log(`SMTP ${host}:${port} (${secure ? "TLS" : "STARTTLS"})`);
console.log("");

let configured = 0;
let failed = false;

for (const account of accounts) {
  console.log(`${account.label.toUpperCase()} mailbox`);
  console.log(`  user: ${mask(account.user)}`);
  console.log(`  from: ${account.from}`);

  if (!account.user || !account.pass) {
    console.log("  status: NOT configured — sends from this mailbox are skipped.");
    console.log("");
    continue;
  }

  configured += 1;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: account.user, pass: account.pass },
  });

  try {
    await transporter.verify();
    console.log("  PASS · SMTP connection and login work.");

    await transporter.sendMail({
      from: account.from,
      to: account.user,
      subject: `Bengalot ${account.label} mail check`,
      text: `SMTP for ${account.label}@ is connected.`,
      html: `<p>SMTP for <strong>${account.label}@</strong> is connected.</p>`,
    });
    console.log(`  PASS · Test email delivered to ${mask(account.user)}.`);

    if (testTo) {
      await transporter.sendMail({
        from: account.from,
        to: testTo,
        subject: `Bengalot ${account.label} test email`,
        text: `This is a test from the Bengalot ${account.label} mailbox.`,
        html: `<p>This is a test from the Bengalot <strong>${account.label}</strong> mailbox.</p>`,
      });
      console.log(`  PASS · Test email delivered to ${testTo}.`);
    }
  } catch (error) {
    failed = true;
    console.error(`  FAIL · ${error.message}`);
  }
  console.log("");
}

if (!configured) {
  console.log("No mailbox credentials found yet.");
  console.log("Add MAIL_SUPPORT_PASS and MAIL_INFO_PASS to .env.local, then run this check again.");
  console.log("The storefront is safe to use without them — sends are skipped.");
} else if (testTo) {
  console.log(`Test emails were sent from ${configured} configured mailbox(es) to ${testTo}.`);
} else {
  console.log("Tip: set VERIFY_MAIL_TO=you@example.com to send to another inbox.");
}

if (failed) process.exitCode = 1;
