"use client";

import { Loader2, Mail } from "lucide-react";
import { useState } from "react";

export function PasswordReset({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleReset() {
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "The reset email could not be sent.");
      }
      setState("done");
      setMessage(
        data.message ??
          "If an account exists for that email, a reset link is on its way.",
      );
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The reset email could not be sent just now.",
      );
    }
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
