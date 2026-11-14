/**
 * Checks the Purelymail SMTP credentials and optionally sends a test email.
 *
 *   node scripts/verify-mail.mjs
 *   VERIFY_MAIL_TO=you@example.com node scripts/verify-mail.mjs
 *
 * It never prints the password.
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

const host = process.env.MAIL_HOST ?? envFileValue("MAIL_HOST") ?? "smtp.purelymail.com";
const portValue = process.env.MAIL_PORT ?? envFileValue("MAIL_PORT") ?? "465";
const port = Number(portValue);
const secureValue = process.env.MAIL_SECURE ?? envFileValue("MAIL_SECURE");
const secure = secureValue !== undefined ? secureValue !== "false" : port === 465;
const user = process.env.MAIL_USER ?? envFileValue("MAIL_USER");
const pass = process.env.MAIL_PASS ?? envFileValue("MAIL_PASS");
const from = process.env.MAIL_FROM ?? envFileValue("MAIL_FROM") ?? `Bengalot <${user ?? "support@bengalot.com"}>`;
const testTo = process.env.VERIFY_MAIL_TO;

console.log("Mail configuration");
console.log(`  host:  ${host}:${port} (${secure ? "TLS" : "STARTTLS"})`);
console.log(`  user:  ${user ? `${user.slice(0, 2)}***@${user.split("@")[1] ?? "?"}` : "(not set)"}`);
console.log(`  from:  ${from}`);
console.log("");

if (!user || !pass) {
  console.log("Mail is NOT configured yet.");
  console.log("Add MAIL_USER and MAIL_PASS to .env.local, then run this check again.");
  console.log("The storefront is safe to use without them — sends are skipped.");
  process.exit(0);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log("PASS · SMTP connection and login work.");

  try {
    await transporter.sendMail({
      from,
      to: user,
      subject: "Bengalot mail check",
      text: "SMTP is connected. Order receipts, contact replies and newsletter welcomes can now send.",
      html: "<p>SMTP is connected. Order receipts, contact replies and newsletter welcomes can now send.</p>",
    });
    console.log(`PASS · Test email delivered to ${user}.`);
  } catch (error) {
    console.log(`WARN · Login works, but a test email could not be delivered: ${error.message}`);
  }

  if (testTo) {
    await transporter.sendMail({
      from,
      to: testTo,
      subject: "Bengalot test email",
      text: "This is a test from the Bengalot storefront.",
      html: "<p>This is a test from the Bengalot storefront.</p>",
    });
    console.log(`PASS · Test email delivered to ${testTo}.`);
  } else {
    console.log("Tip: set VERIFY_MAIL_TO=you@example.com to send to another inbox.");
  }
} catch (error) {
  console.error(`FAIL · ${error.message}`);
  console.error("Check MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER and MAIL_PASS in .env.local.");
  process.exitCode = 1;
}
