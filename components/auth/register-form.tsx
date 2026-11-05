"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { friendlyAuthError, type FriendlyAuthError } from "@/lib/auth-errors";

export function RegisterForm({
  registrationEnabled = true,
}: {
  registrationEnabled?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<FriendlyAuthError | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const strength =
    form.password.length === 0
      ? 0
      : form.password.length < 8
        ? 1
        : form.password.length < 12
          ? 2
          : 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!registrationEnabled) {
      toast.error("Registration is opening soon.", {
        description: "You can still checkout as a guest. Existing customers can sign in.",
      });
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      toast.error("Please complete the required fields.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Use a password of at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!form.terms) {
      toast.error("Please agree to the terms to continue.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      const friendly = friendlyAuthError("network");
      setFormError(friendly);
      toast.error(friendly.title, { description: friendly.description });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.name.trim(), phone: form.phone.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);
    if (error) {
      const friendly = friendlyAuthError(error.message);
      setFormError(friendly);
      toast.error(friendly.title, { description: friendly.description });
      return;
    }
    if (data.session) {
      toast.success("Welcome to Bengalot", {
        description: "Your account has been created.",
      });
      window.location.assign("/account");
    } else {
      toast.success("Check your inbox", {
        description:
          "Confirm your email address to finish creating the account. It can take a minute — check spam or junk too.",
      });
      window.location.assign("/login");
    }
  };

  return (
    <div>
      <p className="eyebrow text-indigo">Join the house</p>
      <h1 className="display-3 mt-3">Create an account.</h1>
      <p className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
        Save your details, track orders and keep a wishlist across devices. No noise, ever.
      </p>

      {!registrationEnabled && (
        <div className="mt-5 rounded-xl border border-gold/30 bg-gold/[0.06] px-3.5 py-3 text-[0.66rem] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Registration opens soon.</strong> We are
          finishing the email service. You can still checkout as a guest, and existing
          customers can sign in.
        </div>
      )}

      {formError && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rosewood/30 bg-rosewood/[0.06] px-3.5 py-3 text-[0.66rem] leading-relaxed text-muted-foreground"
        >
          <strong className="text-rosewood">{formError.title}.</strong>{" "}
          {formError.description}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="reg-name">Full name *</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="reg-email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="reg-phone">Mobile number *</Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reg-phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, ""))}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              autoComplete="tel"
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="reg-password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className="pl-10 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="reg-confirm">Confirm password *</Label>
            <Input
              id="reg-confirm"
              type={showPassword ? "text" : "password"}
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
        </div>

        {form.password && (
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((level) => (
              <span
                key={level}
                className={`h-1 flex-1 rounded-full ${
                  strength >= level ? "bg-gold" : "bg-[var(--muted)]"
                }`}
              />
            ))}
            <span className="ml-1 text-[0.54rem] uppercase tracking-[0.08em] text-muted-foreground">
              {strength === 1 ? "Fair" : strength === 2 ? "Good" : "Strong"}
            </span>
          </div>
        )}

        <label className="flex cursor-pointer items-start gap-2.5 text-[0.66rem] leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => set("terms", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-saffron)]"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-gold">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-gold">
              privacy policy
            </Link>
            , and would like to hear about new collections. (You can unsubscribe anytime.)
          </span>
        </label>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={loading || !registrationEnabled}
        >
          {!registrationEnabled
            ? "Registration opening soon"
            : loading
              ? "Creating account…"
              : "Create account"}{" "}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-5 text-center text-[0.7rem] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:text-gold hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-center text-[0.52rem] leading-relaxed text-muted-foreground/60">
        {registrationEnabled
          ? "New accounts receive a confirmation email before signing in."
          : "Registration opens once the email service is configured."}
      </p>
    </div>
  );
}
