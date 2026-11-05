"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const shell =
  "w-full rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_30px_70px_-45px_rgba(15,11,30,0.45)] sm:p-8";
const fieldWrap = "relative";
const fieldIcon =
  "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground";

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-[var(--muted)]"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const error = params.get("error");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured) {
      toast.error("Supabase is not configured.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      toast.error(authError.message);
      return;
    }
    toast.success("Welcome back.");
    window.location.assign("/admin");
  };

  return (
    <div className={shell}>
      <p className="eyebrow text-indigo">Control room</p>
      <h1 className="mt-2 font-display text-[2.4rem] leading-none">Welcome back.</h1>
      <p className="mt-2 text-[0.76rem] leading-relaxed text-muted-foreground">
        Sign in with your Bengalot staff account to manage the storefront, content and
        settings.
      </p>

      {error === "not-admin" && (
        <p className="mt-4 rounded-xl border border-rosewood/20 bg-rosewood/[0.05] px-3.5 py-2.5 text-[0.68rem] text-rosewood">
          This account does not have admin access. Ask a super admin to assign a staff role.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="admin-email">Email</Label>
          <div className={fieldWrap}>
            <Mail className={fieldIcon} />
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@bengalot.com"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="admin-password">Password</Label>
          <div className={fieldWrap}>
            <Lock className={fieldIcon} />
            <Input
              id="admin-password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="pl-10 pr-11"
            />
            <PasswordToggle show={show} onToggle={() => setShow((current) => !current)} />
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Enter control room"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[0.64rem] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← Back to storefront
        </Link>
        <Link href="/admin/setup" className="hover:text-foreground">
          First-run setup
        </Link>
      </div>
    </div>
  );
}

export function AdminSetupForm({ configured }: { configured: boolean }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!configured) {
      toast.error("Add the Supabase keys to .env.local first.");
      return;
    }
    if (form.password.length < 10) {
      toast.error("Use at least 10 characters for the password.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("The two passwords do not match.");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setLoading(false);
      toast.error(result.error ?? "Could not create the admin.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (supabase) {
      await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
    }
    setLoading(false);
    toast.success("Super admin created.");
    window.location.assign("/admin");
  };

  return (
    <div className={shell}>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-jade/10 text-jade">
        <Check className="h-5 w-5" />
      </span>
      <p className="eyebrow mt-4 text-indigo">First run</p>
      <h1 className="mt-2 font-display text-[2.35rem] leading-none">Create the first admin.</h1>
      <p className="mt-2 text-[0.76rem] leading-relaxed text-muted-foreground">
        This one-time screen creates the super admin. Once an admin exists, this route locks
        itself.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="setup-name">Full name</Label>
          <div className={fieldWrap}>
            <User className={fieldIcon} />
            <Input
              id="setup-name"
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              placeholder="Owner name"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="setup-email">Email</Label>
          <div className={fieldWrap}>
            <Mail className={fieldIcon} />
            <Input
              id="setup-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="owner@bengalot.com"
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="setup-password">Password</Label>
            <div className={fieldWrap}>
              <Lock className={fieldIcon} />
              <Input
                id="setup-password"
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="10+ characters"
                className="pl-10 pr-11"
              />
              <PasswordToggle show={show} onToggle={() => setShow((current) => !current)} />
            </div>
          </div>
          <div>
            <Label htmlFor="setup-confirm">Confirm password</Label>
            <div className={fieldWrap}>
              <Lock className={fieldIcon} />
              <Input
                id="setup-confirm"
                type={show ? "text" : "password"}
                value={form.confirm}
                onChange={(event) => setForm({ ...form, confirm: event.target.value })}
                placeholder="Repeat password"
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create super admin"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-4 text-[0.6rem] leading-relaxed text-muted-foreground">
        The account is created in Supabase Auth. Manage its email, password and sessions from
        the Supabase Authentication dashboard. The app never stores this password.
      </p>
    </div>
  );
}
