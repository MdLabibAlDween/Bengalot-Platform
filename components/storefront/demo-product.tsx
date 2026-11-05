import { FlaskConical, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DemoBadge({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-gold/50 bg-gold/15 text-gold-ink", className)}
    >
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      {compact ? "Demo" : "Demo product"}
    </Badge>
  );
}

export function DemoOrderNotice({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-gold/35 bg-gold/[0.07] px-3.5 py-3",
        className
      )}
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" aria-hidden="true" />
      <p
        className={cn(
          "leading-relaxed text-gold-ink",
          compact ? "text-[0.6rem]" : "text-[0.7rem]"
        )}
      >
        <span className="font-bold">Demo product — preview only.</span> This listing
        is a placeholder while the real product is being prepared. Ordering is
        disabled, so nothing will be charged or shipped.
      </p>
    </div>
  );
}
