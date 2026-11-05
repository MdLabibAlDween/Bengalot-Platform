"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { OtpInput } from "./otp-input";
import { cn } from "@/lib/utils";

export function LoginForm({ phoneOtpEnabled = false }: { phoneOtpEnabled?: boolean }) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      toast.error("The account service is not configured.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back", { description: "Signed in to your Bengalot account." });
    window.location.assign("/account");
  };

  const sendOtp = async () => {
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      toast.error("Enter a valid Bangladeshi mobile number.");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      toast.error("The account service is not configured.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: `+88${phone}` });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOtpSent(true);
    toast.success("Code sent", { description: "Check your SMS inbox." });
  };

  const verifyOtp = async (token: string) => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+88${phone}`,
      token,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Phone verified", { description: "Welcome back." });
    window.location.assign("/account");
  };

  return (
    <div>
      <h1 className="display-3">Welcome back.</h1>
      <p className="mt-3 text-[0.82rem] leading-relaxed text-muted-foreground">
        Sign in to see your orders, saved pieces and a checkout that remembers you.
      </p>

      <div className="mt-7 flex rounded-full border border-[var(--border)] bg-[var(--muted)]/50 p-1">
        {[
          { key: "email" as const, label: "Email", icon: Mail },
          ...(phoneOtpEnabled
            ? [{ key: "phone" as const, label: "Phone OTP", icon: Phone }]
            : []),
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setMethod(tab.key);
              setOtpSent(false);
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[0.66rem] font-semibold transition",
              method === tab.key
                ? "bg-[var(--surface)] text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {method === "email" ? (
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="login-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="login-password" className="mb-0">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-[0.58rem] font-semibold text-muted-foreground underline-offset-4 transition hover:text-gold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="pl-10 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-[0.68rem] text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 accent-[var(--color-saffron)]" defaultChecked />
            Keep me signed in on this device
          </label>
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          {!otpSent ? (
            <>
              <div>
                <Label htmlFor="login-phone">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className="pl-10"
                  />
                </div>
                <p className="mt-1.5 text-[0.6rem] text-muted-foreground">
                  We&apos;ll send a 6-digit code by SMS. Standard rates may apply.
                </p>
              </div>
              <Button
                type="button"
                variant="gold"
                size="lg"
                className="w-full"
                onClick={sendOtp}
                disabled={loading}
              >
                Send code <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-[var(--muted)] px-4 py-3 text-[0.7rem] leading-relaxed text-muted-foreground">
                We sent a code to{" "}
                <span className="font-semibold text-foreground">{phone}</span>.{" "}
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="font-semibold underline underline-offset-2 hover:text-gold"
                >
                  Change number
                </button>
              </div>
              <div>
                <Label>One-time password</Label>
                <OtpInput onComplete={(token) => void verifyOtp(token)} />
              </div>
              <Button
                type="button"
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => void sendOtp()}
                disabled={loading}
              >
                {loading ? "Verifying…" : "Verify & sign in"} <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => toast.success("A new code is on its way.")}
                className="w-full text-center text-[0.62rem] font-semibold text-muted-foreground transition hover:text-gold"
              >
                Resend code in 00:30
              </button>
            </>
          )}
        </div>
      )}

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          New here?
        </span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <Button asChild variant="outline" size="lg" className="w-full">
        <Link href="/register">
          Create an account <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.58rem] text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-jade" /> Secure sign-in · Your data stays
        private
      </p>
      <p className="mt-5 text-center text-[0.52rem] leading-relaxed text-muted-foreground/60">
        Secure sign-in with Supabase Auth.
      </p>
    </div>
  );
}
