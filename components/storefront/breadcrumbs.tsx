import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({
  items,
  light = false,
  className,
  accentColor,
}: {
  items: { label: string; href?: string }[];
  light?: boolean;
  className?: string;
  accentColor?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em]",
        light ? "text-ivory/45" : "text-muted-foreground",
        className
      )}
    >
      <Link
        href="/"
        className={cn("transition", light ? "hover:text-gold" : "hover:text-foreground")}
      >
        Home
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          <ChevronRight className="h-2.5 w-2.5 opacity-40" />
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "transition",
                light ? "hover:text-gold" : "hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(light ? "text-ivory/75" : "text-foreground")}
              style={accentColor ? { color: accentColor } : undefined}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
