import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <p className="flex items-center gap-2.5 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-indigo">
            <span className="h-px w-6 bg-saffron" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-[2.2rem] leading-none md:text-[2.7rem]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[0.76rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function AdminStat({
  label,
  value,
  helper,
  icon: Icon,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "indigo" | "magenta" | "jade" | "saffron" | "teal";
}) {
  const toneClass = {
    indigo: "bg-indigo/10 text-indigo",
    magenta: "bg-magenta/10 text-magenta",
    jade: "bg-jade/10 text-jade",
    saffron: "bg-saffron/15 text-gold-ink",
    teal: "bg-teal/10 text-teal",
  }[tone];

  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_18px_40px_-36px_rgba(15,11,30,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-[1.8rem] leading-none tabular-nums">{value}</p>
        </div>
        <span className={cn("grid h-9 w-9 place-items-center rounded-full", toneClass)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {helper && <p className="mt-3 text-[0.62rem] leading-relaxed text-muted-foreground">{helper}</p>}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl leading-tight">{title}</h2>
          {description && (
            <p className="mt-1 max-w-xl text-[0.68rem] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AdminLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-foreground transition hover:border-indigo hover:bg-indigo hover:text-ivory"
    >
      {children}
      <ChevronLeft className="h-3 w-3 rotate-180" />
    </Link>
  );
}
