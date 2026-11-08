"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim(), city: city.trim() })
      .eq("id", profile.id);

    if (error) {
      setState("error");
      setMessage("Your profile could not be saved. Please try again.");
      return;
    }

    setState("saved");
    setMessage("Saved. Your details are up to date.");
    window.setTimeout(() => setState("idle"), 2200);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="field-label">
            Full name
          </label>
          <input
            id="profile-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="field-label">
            Email
          </label>
          <input
            id="profile-email"
            value={profile.email}
            disabled
            className="field cursor-not-allowed opacity-60"
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className="field-label">
            Mobile
          </label>
          <input
            id="profile-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01XXXXXXXXX"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="profile-city" className="field-label">
            City / town
          </label>
          <input
            id="profile-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Dhaka"
            className="field"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state === "saving"}
          className="btn btn-primary"
        >
          {state === "saving" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : state === "saved" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : null}
          {state === "saving" ? "Saving" : state === "saved" ? "Saved" : "Save changes"}
        </button>
        {message ? (
          <p
            className={`text-[0.7rem] font-medium ${state === "error" ? "text-coral" : "text-teal"}`}
            role={state === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
