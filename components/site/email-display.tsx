"use client";

import { useEffect, useState, type ReactNode } from "react";

const FALLBACK_TEXT = "our support team";

/**
 * Cloudflare email obfuscation rewrites visible addresses in the server HTML.
 * That makes the server markup differ from the React client render and causes
 * hydration errors. Reveal addresses only after hydration so no email pattern
 * exists in the initial HTML.
 */
export function EmailText({
  email,
  fallback = FALLBACK_TEXT,
  className,
}: {
  email: string;
  fallback?: string;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <span className={className}>{ready ? email : fallback}</span>;
}

export function EmailLink({
  email,
  className,
  children,
  fallback = "Email support",
  ariaLabel,
}: {
  email: string;
  className?: string;
  children?: ReactNode;
  fallback?: string;
  ariaLabel?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <a
      href={ready ? `mailto:${email}` : undefined}
      className={className}
      aria-label={ariaLabel ?? (ready ? `Email ${email}` : fallback)}
    >
      {children ?? (ready ? email : fallback)}
    </a>
  );
}
