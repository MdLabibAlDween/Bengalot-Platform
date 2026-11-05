"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountHeading } from "./account-heading";
import { cn } from "@/lib/utils";

type FactorRow = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
};

type SessionRow = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  user_agent: string | null;
  ip: string | null;
  aal: string | null;
  current: boolean;
};

function describeAgent(userAgent: string | null) {
  const ua = userAgent ?? "";
  const device = /iphone|ipad|android|mobile/i.test(ua) ? "phone" : "laptop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /chrome|crios/i.test(ua)
      ? "Chrome"
      : /firefox|fxios/i.test(ua)
        ? "Firefox"
        : /safari/i.test(ua)
          ? "Safari"
          : "Browser";
  const platform = /iphone/i.test(ua)
    ? "iPhone"
    : /ipad/i.test(ua)
      ? "iPad"
      : /android/i.test(ua)
        ? "Android"
        : /windows/i.test(ua)
          ? "Windows"
          : /mac os/i.test(ua)
            ? "macOS"
            : /linux/i.test(ua)
              ? "Linux"
              : "Device";
  return { device: `${platform} ${device === "phone" ? "phone" : "desktop"}`, browser, icon: device };
}

function when(value: string | null) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SecurityView() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [factors, setFactors] = useState<FactorRow[]>([]);
  const [factorLoading, setFactorLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enroll, setEnroll] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const verifiedFactor = useMemo(
    () => factors.find((factor) => factor.factor_type === "totp" && factor.status === "verified"),
    [factors]
  );

  const loadFactors = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setFactorLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) {
      setFactors(
        (data.all ?? []).map((factor: FactorRow) => ({
          id: factor.id,
          friendly_name: factor.friendly_name,
          factor_type: factor.factor_type,
          status: factor.status,
          created_at: factor.created_at,
        }))
      );
    }
    setFactorLoading(false);
  };

  const loadSessions = async () => {
    const response = await fetch("/api/account/sessions", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (Array.isArray(data.sessions)) setSessions(data.sessions);
    }
    setSessionsLoading(false);
  };

  useEffect(() => {
    void loadFactors();
    void loadSessions();
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) {
      toast.error("Enter your current password.");
      return;
    }
    if (passwords.next.length < 8) {
      toast.error("Use at least 8 characters for the new password.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("The new passwords do not match.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      toast.error("The account service is not configured.");
      return;
    }
    setChangingPassword(true);
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (!email) {
      setChangingPassword(false);
      toast.error("Could not verify your account. Please sign in again.");
      return;
    }
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: passwords.current,
    });
    if (verifyError) {
      setChangingPassword(false);
      toast.error(verifyError.message);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.next });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPasswords({ current: "", next: "", confirm: "" });
    toast.success("Password updated", {
      description: "Use your new password the next time you sign in.",
    });
  };

  const startEnrol = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      toast.error("The account service is not configured.");
      return;
    }
    setEnrolling(true);
    // Remove abandoned, unverified TOTP factors before starting a new one.
    const existing = factors.find(
      (factor) => factor.factor_type === "totp" && factor.status !== "verified"
    );
    if (existing) {
      await supabase.auth.mfa.unenroll({ factorId: existing.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Bengalot authenticator",
    });
    setEnrolling(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not start two-factor setup.");
      return;
    }
    setEnroll({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setCode("");
  };

  const verifyEnrol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enroll || code.replace(/\D/g, "").length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    setVerifying(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enroll.factorId,
    });
    if (challengeError || !challenge) {
      setVerifying(false);
      toast.error(challengeError?.message ?? "Could not verify the code.");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: challenge.id,
      code: code.replace(/\D/g, ""),
    });
    setVerifying(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEnroll(null);
    setCode("");
    toast.success("Two-factor authentication is on", {
      description: "You will need your authenticator app the next time you sign in.",
    });
    await loadFactors();
    await loadSessions();
  };

  const disableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedFactor) return;
    if (disableCode.replace(/\D/g, "").length !== 6) {
      toast.error("Enter a current 6-digit code.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    setDisabling(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: verifiedFactor.id,
    });
    if (challengeError || !challenge) {
      setDisabling(false);
      toast.error(challengeError?.message ?? "Could not verify the code.");
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: verifiedFactor.id,
      challengeId: challenge.id,
      code: disableCode.replace(/\D/g, ""),
    });
    if (verifyError) {
      setDisabling(false);
      toast.error(verifyError.message);
      return;
    }
    const { error } = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
    setDisabling(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDisableOpen(false);
    setDisableCode("");
    toast.success("Two-factor authentication is off");
    await loadFactors();
  };

  const revokeSession = async (session: SessionRow) => {
    if (!window.confirm("Sign out this device? You will need to sign in again there.")) return;
    setRevoking(session.id);
    const response = await fetch("/api/account/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: session.id }),
    });
    const result = await response.json().catch(() => ({}));
    setRevoking(null);
    if (!response.ok) {
      toast.error(result.error ?? "Could not revoke that session.");
      return;
    }
    toast.success("Session signed out");
    await loadSessions();
  };

  const signOutOthers = async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Other sessions signed out");
    await loadSessions();
  };

  const deleteAccount = async () => {
    if (deleteText !== "DELETE" || !deletePassword) return;
    setDeleting(true);
    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: deletePassword, confirm: "DELETE" }),
    });
    const result = await response.json().catch(() => ({}));
    setDeleting(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not delete the account.");
      return;
    }
    toast.success("Account deleted");
    window.location.assign("/");
  };

  return (
    <div>
      <AccountHeading
        eyebrow="Keep it safe"
        title="Security"
        description="Manage your password, two-factor authentication and signed-in devices. If something looks unfamiliar, tell us immediately."
      />

      <div className="mb-4 rounded-xl border border-jade/25 bg-jade/[0.05] px-4 py-3 text-[0.64rem] leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Password, 2FA, sessions and deletion are live.</strong>{" "}
        Email login alerts still need the mail integration. Order and account updates appear in
        your <Link href="/account/notifications" className="text-indigo underline underline-offset-2">account notifications</Link>.
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/10 text-gold">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <h2 className="font-display text-xl">Change password</h2>
          </div>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Your current password"
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-pass">New password</Label>
                <Input
                  id="new-pass"
                  type="password"
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-pass">Confirm new</Label>
                <Input
                  id="confirm-pass"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-midnight px-5 text-[0.58rem] font-bold uppercase tracking-[0.11em] text-ivory transition hover:bg-royal disabled:opacity-50"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {changingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-jade/10 text-jade">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="font-display text-xl">Two-factor authentication</h2>
                <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                  An extra step when signing in on a new device.
                </p>
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
                verifiedFactor ? "bg-jade/10 text-jade" : "bg-[var(--muted)] text-muted-foreground"
              )}
            >
              {factorLoading ? "Checking" : verifiedFactor ? "On" : "Off"}
            </span>
          </div>

          <div
            className={cn(
              "mt-4 rounded-xl border p-3 text-[0.64rem] leading-relaxed",
              verifiedFactor
                ? "border-jade/30 bg-jade/[0.05] text-jade"
                : "border-[var(--border)] bg-[var(--muted)]/40 text-muted-foreground"
            )}
          >
            {verifiedFactor ? (
              <p className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Protected by an authenticator app since {when(verifiedFactor.created_at)}.
              </p>
            ) : (
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                Turn on 2FA for an extra layer of protection, especially if you reuse passwords.
              </p>
            )}
          </div>

          {enroll ? (
            <form onSubmit={verifyEnrol} className="mt-4 rounded-xl border border-[var(--border)] p-4">
              <p className="text-[0.66rem] font-semibold">Scan with your authenticator app</p>
              <div
                className="mx-auto mt-3 w-[180px] rounded-xl bg-white p-3 [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: enroll.qrCode }}
              />
              <p className="mt-3 text-center text-[0.56rem] text-muted-foreground">
                Or enter this secret manually
              </p>
              <p className="mt-1 break-all rounded-lg bg-[var(--muted)] px-2 py-1.5 text-center font-mono text-[0.6rem]">
                {enroll.secret}
              </p>
              <Label htmlFor="totp-code" className="mt-3">
                Verification code
              </Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center font-mono text-lg tracking-[0.3em]"
              />
              <div className="mt-3 flex gap-2">
                <Button type="submit" className="flex-1" disabled={verifying}>
                  {verifying ? "Verifying…" : "Verify and turn on"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEnroll(null);
                    setCode("");
                    void loadFactors();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {verifiedFactor ? (
                <Button type="button" variant="outline" onClick={() => setDisableOpen(true)}>
                  Turn off 2FA
                </Button>
              ) : (
                <Button type="button" variant="gold" onClick={startEnrol} disabled={enrolling || factorLoading}>
                  {enrolling ? "Starting…" : "Set up 2FA"}
                </Button>
              )}
            </div>
          )}

          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Login alerts
            </p>
            <p className="mt-1.5 text-[0.64rem] leading-relaxed text-muted-foreground">
              Email login alerts need the mail integration. Order and account updates are
              delivered in-app now.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-gold">
              Devices
            </p>
            <h2 className="mt-1 font-display text-xl">Active sessions</h2>
          </div>
          <button
            type="button"
            onClick={signOutOthers}
            disabled={sessions.filter((session) => !session.current).length === 0}
            className="flex items-center gap-1.5 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-rosewood disabled:opacity-40"
          >
            <LogOut className="h-3 w-3" /> Sign out others
          </button>
        </div>
        {sessionsLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1].map((key) => (
              <div key={key} className="h-14 animate-pulse rounded-xl bg-[var(--muted)]" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-5 py-10 text-center text-[0.66rem] text-muted-foreground">
            No active sessions were found.
          </p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {sessions.map((session) => {
              const meta = describeAgent(session.user_agent);
              return (
                <div key={session.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--muted)] text-muted-foreground">
                    {meta.icon === "phone" ? (
                      <Smartphone className="h-4 w-4" />
                    ) : (
                      <Laptop className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold">
                      {meta.device}
                      {session.current && (
                        <span className="rounded-full bg-jade/10 px-2 py-0.5 text-[0.42rem] font-bold uppercase tracking-[0.08em] text-jade">
                          This device
                        </span>
                      )}
                      {session.aal === "aal2" && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.42rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                          2FA verified
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[0.55rem] text-muted-foreground">
                      {meta.browser}
                      {session.ip ? ` · ${session.ip}` : ""} · active {when(session.updated_at ?? session.created_at)}
                    </p>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      onClick={() => void revokeSession(session)}
                      disabled={revoking === session.id}
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[0.5rem] font-bold uppercase tracking-[0.08em] transition hover:border-rosewood hover:text-rosewood disabled:opacity-50"
                    >
                      {revoking === session.id ? "Revoking…" : "Revoke"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-rosewood/20 bg-rosewood/[0.025] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-rosewood" />
            <div>
              <p className="text-[0.76rem] font-semibold">Delete your account</p>
              <p className="mt-1 max-w-lg text-[0.64rem] leading-relaxed text-muted-foreground">
                This removes your profile, addresses, notifications and reward points. Order
                records required for tax purposes are kept for seven years, as required by law.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex h-9 items-center rounded-full border border-rosewood/30 px-4 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-rosewood transition hover:bg-rosewood hover:text-white"
          >
            Delete account
          </button>
        </div>
      </div>

      <p className="mt-4 text-[0.58rem] leading-relaxed text-muted-foreground">
        Need help with account security? Email{" "}
        <a href="mailto:support@bengalot.com" className="underline underline-offset-2 hover:text-gold">
          support@bengalot.com
        </a>{" "}
        or read our{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-gold">
          privacy policy
        </Link>
        .
      </p>

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent>
          <DialogTitle>Turn off two-factor authentication?</DialogTitle>
          <DialogDescription>
            Enter a current code from your authenticator app. This removes the extra sign-in
            step from your account.
          </DialogDescription>
          <form onSubmit={disableTwoFactor} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="disable-code">Authenticator code</Label>
              <Input
                id="disable-code"
                inputMode="numeric"
                value={disableCode}
                onChange={(event) =>
                  setDisableCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="text-center font-mono text-lg tracking-[0.3em]"
              />
            </div>
            <Button type="submit" variant="magenta" className="w-full" disabled={disabling}>
              {disabling ? "Turning off…" : "Turn off 2FA"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This is permanent. Your profile, saved addresses, notifications and reward points
            are removed. Order records are kept for tax purposes. Type DELETE and confirm your
            password.
          </DialogDescription>
          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
              <Input
                id="delete-confirm"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div>
              <Label htmlFor="delete-password">Your password</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button
              variant="magenta"
              className="w-full"
              disabled={deleteText !== "DELETE" || !deletePassword || deleting}
              onClick={deleteAccount}
            >
              <Trash2 className="h-4 w-4" /> {deleting ? "Deleting…" : "Permanently delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
