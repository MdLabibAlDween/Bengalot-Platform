import { cn } from "@/lib/utils";

export function JamdaniField({
  id,
  className,
  color = "var(--color-saffron)",
  opacity = 0.12,
  size = 56,
}: {
  id: string;
  className?: string;
  color?: string;
  opacity?: number;
  size?: number;
}) {
  const patternId = id.replace(/[^a-zA-Z0-9_-]/g, "-");
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={patternId}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path
            d={`M${size / 2} 0L${size} ${size / 2} ${size / 2} ${size} 0 ${size / 2}Z`}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            opacity={opacity}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="1.5"
            fill={color}
            opacity={opacity * 1.7}
          />
          <path
            d={`M${size / 2} ${size * 0.32}v${size * 0.36}M${size * 0.32} ${size / 2}h${size * 0.36}`}
            stroke={color}
            strokeWidth="0.5"
            opacity={opacity * 0.6}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function AlponaDivider({
  className,
  color = "var(--color-saffron)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden="true">
      <span
        className="h-px w-16 sm:w-28"
        style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
      />
      <svg width="46" height="16" viewBox="0 0 46 16" fill="none">
        <path d="M1 8h10M35 8h10" stroke={color} strokeWidth="0.8" opacity=".7" />
        <path
          d="M23 1.5c3 3 5 4.5 5 6.5s-2 3.5-5 6.5c-3-3-5-4.5-5-6.5s2-3.5 5-6.5Z"
          stroke={color}
          strokeWidth="0.9"
        />
        <circle cx="23" cy="8" r="1.2" fill={color} />
        <path d="M14 8c1-2 2.5-3 4-3s3 1 4 3M28 8c1-2 2.5-3 4-3s3 1 4 3" stroke={color} strokeWidth="0.6" opacity=".6" />
      </svg>
      <span
        className="h-px w-16 sm:w-28"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
}

export function Sparkle({
  className,
  color = "var(--color-saffron)",
  size = 18,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      <path
        d="M12 1.5c.8 5.6 3.9 8.7 9.5 9.5-5.6.8-8.7 3.9-9.5 9.5-.8-5.6-3.9-8.7-9.5-9.5 5.6-.8 8.7-3.9 9.5-9.5Z"
        fill={color}
      />
    </svg>
  );
}

export function SealStamp({
  className,
  color = "var(--color-saffron)",
  text = "BENGALOT · SALTHA · FARIDPUR · ",
  size = 120,
}: {
  className?: string;
  color?: string;
  text?: string;
  size?: number;
}) {
  const id = `seal-${text.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("pointer-events-none", className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <path
          id={`${id}-circle`}
          d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
        />
      </defs>
      <circle cx="60" cy="60" r="58" stroke={color} strokeWidth="0.7" opacity=".55" />
      <circle cx="60" cy="60" r="35" stroke={color} strokeWidth="0.7" opacity=".35" />
      <circle cx="60" cy="60" r="28" stroke={color} strokeWidth="0.4" opacity=".25" />
      <text fill={color} fontSize="7.2" letterSpacing="2.5" fontFamily="'Plus Jakarta Sans', sans-serif" opacity=".9">
        <textPath href={`#${id}-circle`}>{text}</textPath>
      </text>
      <circle cx="60" cy="58" r="22" fill="var(--color-ivory)" opacity=".94" />
      <circle cx="60" cy="58" r="22" stroke={color} strokeWidth="0.55" opacity=".55" />
      <image
        href="/brand/logo-mark.png"
        x="44"
        y="42"
        width="32"
        height="32"
        preserveAspectRatio="xMidYMid meet"
      />
      <path d="M60 88l1.8 3.6L65.5 93l-2.6 2.4.6 3.6-3.5-1.8-3.5 1.8.6-3.6L54.5 93l3.7-.4Z" fill={color} opacity=".8" />
    </svg>
  );
}

export function PaisleyMotif({
  className,
  color = "var(--color-saffron)",
  opacity = 0.8,
}: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={cn("pointer-events-none", className)}
      fill="none"
      style={{ opacity }}
      aria-hidden="true"
    >
      <path
        d="M60 8c30 0 50 24 50 54 0 38-28 64-44 84-4 5-10 5-14 0C36 126 10 100 10 62 10 32 30 8 60 8Z"
        stroke={color}
        strokeWidth="1"
      />
      <path
        d="M60 24c22 0 36 18 36 40 0 28-20 48-32 64-1.5 2-5 2-6.5 0C45 112 24 92 24 64c0-22 14-40 36-40Z"
        stroke={color}
        strokeWidth="0.6"
        opacity=".55"
      />
      <path
        d="M60 44c12 0 20 9 20 21 0 15-10 26-18 36-1 1-3 1-4 0-8-10-18-21-18-36 0-12 8-21 20-21Z"
        stroke={color}
        strokeWidth="0.6"
        opacity=".4"
      />
      <circle cx="60" cy="64" r="5" stroke={color} strokeWidth="0.8" opacity=".8" />
      <circle cx="60" cy="64" r="1.5" fill={color} opacity=".8" />
    </svg>
  );
}

export function OrnamentalArch({
  className,
  color = "var(--color-saffron)",
  opacity = 0.5,
}: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 400 600"
      preserveAspectRatio="none"
      className={cn("pointer-events-none", className)}
      fill="none"
      style={{ opacity }}
      aria-hidden="true"
    >
      <path d="M16 600V240C16 108 98 16 200 16s184 92 184 224v360" stroke={color} strokeWidth="1" />
      <path d="M32 600V242C32 120 108 32 200 32s168 88 168 210v358" stroke={color} strokeWidth="0.6" opacity=".5" />
      <path d="M200 16v-8M16 240h-8M384 240h-8" stroke={color} strokeWidth="0.8" opacity=".6" />
    </svg>
  );
}

export function Grain({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay",
        className
      )}
      aria-hidden="true"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
