import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  size = 34,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        x="6.2"
        y="8.4"
        width="21"
        height="25"
        rx="4.4"
        transform="rotate(-11 6.2 8.4)"
        fill="#F3C95F"
      />
      <rect
        x="10.2"
        y="6.2"
        width="21"
        height="25"
        rx="4.4"
        transform="rotate(-2 10.2 6.2)"
        fill="#E86147"
      />
      <rect x="14.8" y="9.6" width="20" height="25" rx="4.6" fill="#0D6F6D" />
      <circle cx="24.8" cy="16.2" r="1.55" fill="#ffffff" opacity=".9" />
      <path
        d="M20.5 21.2h8.2M20.5 25.1h5.4"
        stroke="#ffffff"
        strokeWidth="1.45"
        strokeLinecap="round"
        opacity=".82"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  label = "Bengalot home",
  inverted = false,
}: {
  className?: string;
  href?: string;
  label?: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg",
        inverted ? "text-cream" : "text-ink",
        className,
      )}
    >
      <LogoMark className="transition-transform duration-500 ease-out group-hover:-rotate-3 group-hover:scale-[1.04]" />
      <span className="relative">
        <span className="font-display text-[1.6rem] font-semibold leading-none tracking-[-0.045em]">
          Bengalot
        </span>
        <span
          className={cn(
            "absolute -right-2 top-0.5 size-1.5 rounded-full",
            inverted ? "bg-butter" : "bg-coral",
          )}
        />
      </span>
    </Link>
  );
}

