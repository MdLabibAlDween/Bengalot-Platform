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

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo: string;
};

/**
 * Purelymail SMTP by default. Email is optional: when MAIL_USER/MAIL_PASS are
 * absent the storefront keeps working and mail calls are skipped safely.
 */
export function getMailConfig(): MailConfig | null {
  const user = process.env.MAIL_USER?.trim();
  const pass = process.env.MAIL_PASS?.trim();
  if (!user || !pass) return null;

  const port = Number(process.env.MAIL_PORT ?? 465);
  const secure =
    process.env.MAIL_SECURE !== undefined
      ? process.env.MAIL_SECURE !== "false"
      : port === 465;

  return {
    host: process.env.MAIL_HOST?.trim() || "smtp.purelymail.com",
    port: Number.isFinite(port) ? port : 465,
    secure,
    user,
    pass,
    from: process.env.MAIL_FROM?.trim() || `Bengalot <${user}>`,
    replyTo: process.env.MAIL_REPLY_TO?.trim() || user,
  };
}
