"use client";

import { Loader2, Mail } from "lucide-react";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function PasswordReset({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleReset() {
    setState("loading");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setState("error");
      setMessage("The reset email could not be sent just now.");
      return;
    }
    setState("done");
    setMessage("A reset link is on its way to your inbox.");
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleReset}
        disabled={state === "loading"}
        className="btn btn-outline btn-sm"
      >
        {state === "loading" ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Mail className="size-3.5" aria-hidden="true" />
        )}
        {state === "done" ? "Reset email sent" : "Send password reset"}
      </button>
      {message ? (
        <p
          className={`mt-2 text-[0.66rem] ${state === "error" ? "text-coral" : "text-teal"}`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
