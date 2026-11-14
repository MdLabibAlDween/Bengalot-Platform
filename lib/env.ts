const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.",
  );
}

export const publicEnv = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }
  return key;
}

export type MailAccountKind = "support" | "info";

export type MailAccount = {
  kind: MailAccountKind;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo: string;
};

function mailSettings(kind: MailAccountKind) {
  const supportUser = process.env.MAIL_SUPPORT_USER?.trim();
  const supportPass = process.env.MAIL_SUPPORT_PASS?.trim();
  const infoUser = process.env.MAIL_INFO_USER?.trim();
  const infoPass = process.env.MAIL_INFO_PASS?.trim();

  if (kind === "support") {
    return {
      user: supportUser || process.env.MAIL_USER?.trim() || "",
      pass: supportPass || process.env.MAIL_PASS?.trim() || "",
      from:
        process.env.MAIL_SUPPORT_FROM?.trim() ||
        process.env.MAIL_FROM?.trim() ||
        "Bengalot Support <support@bengalot.com>",
      replyTo:
        process.env.MAIL_SUPPORT_REPLY_TO?.trim() || "support@bengalot.com",
    };
  }

  return {
    user: infoUser || "",
    pass: infoPass || "",
    from: process.env.MAIL_INFO_FROM?.trim() || "Bengalot <info@bengalot.com>",
    replyTo: process.env.MAIL_INFO_REPLY_TO?.trim() || "info@bengalot.com",
  };
}

/**
 * Purelymail SMTP by default. Two mailboxes are supported:
 *  - support@ — order receipts and contact replies
 *  - info@    — newsletter welcomes and contact notifications
 *
 * Email is optional: an account without a user/password is skipped safely.
 */
export function getMailAccount(kind: MailAccountKind): MailAccount | null {
  const settings = mailSettings(kind);
  if (!settings.user || !settings.pass) return null;

  const port = Number(process.env.MAIL_PORT ?? 465);
  const secure =
    process.env.MAIL_SECURE !== undefined
      ? process.env.MAIL_SECURE !== "false"
      : port === 465;

  return {
    kind,
    host: process.env.MAIL_HOST?.trim() || "smtp.purelymail.com",
    port: Number.isFinite(port) ? port : 465,
    secure,
    user: settings.user,
    pass: settings.pass,
    from: settings.from,
    replyTo: settings.replyTo,
  };
}

export function getMailConfig() {
  return {
    support: getMailAccount("support"),
    info: getMailAccount("info"),
  };
}
