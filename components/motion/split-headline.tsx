import { cn } from "@/lib/utils";

type Line = {
  text: string;
  accent?: "italic" | "coral" | "butter" | "outline";
};

const accentClass: Record<NonNullable<Line["accent"]>, string> = {
  italic: "display-italic text-coral",
  coral: "text-coral",
  butter: "text-butter",
  outline: "text-transparent [-webkit-text-stroke:1.5px_var(--ink)]",
};

export function SplitHeadline({
  lines,
  className,
}: {
  lines: Line[];
  className?: string;
  delay?: number;
}) {
  return (
    <h1 className={cn("display-hero", className)}>
      {lines.map((line, index) => (
        <span
          key={`${line.text}-${index}`}
          className={cn(
            "block",
            line.accent ? accentClass[line.accent] : undefined,
          )}
        >
          {line.text}
        </span>
      ))}
    </h1>
  );
}
