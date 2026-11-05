import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The compact monogram, used inside the seal/stamp and small brand moments.
 * The artwork is the real Bengalot mark supplied by the brand.
 */
export function BengalotMark({
  className,
}: {
  className?: string;
}) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      width={512}
      height={513}
      aria-hidden="true"
      className={cn("h-10 w-10 object-contain", className)}
    />
  );
}

export function Logo({
  className,
  tone = "auto",
  markClassName,
  priority = false,
}: {
  className?: string;
  tone?: "auto" | "light" | "dark";
  markClassName?: string;
  priority?: boolean;
}) {
  const imageTone =
    tone === "light"
      ? "brightness-0 invert"
      : tone === "dark"
        ? ""
        : "";

  return (
    <span
      className={cn(
        "inline-flex flex-col items-start gap-1 text-foreground",
        className
      )}
    >
      <Image
        src="/brand/logo-full.png"
        alt="Bengalot"
        width={900}
        height={276}
        loading={priority ? "eager" : "lazy"}
        sizes="(min-width: 640px) 150px, 120px"
        className={cn(
          "h-9 w-auto object-contain sm:h-11",
          imageTone,
          markClassName
        )}
      />
    </span>
  );
}
