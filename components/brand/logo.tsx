import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const wordmark = {
  src: "/brand/bengalot-logo.png",
  width: 1573,
  height: 483,
};

const mark = {
  src: "/brand/bengalot-mark.png",
  width: 1024,
  height: 1024,
};

export function LogoMark({
  className,
  size = 34,
  inverted = false,
}: {
  className?: string;
  size?: number;
  inverted?: boolean;
}) {
  return (
    <Image
      src={mark.src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={cn(
        "shrink-0 object-contain",
        inverted && "brightness-0 invert",
        className,
      )}
    />
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
      className={cn("group inline-flex items-center rounded-lg", className)}
    >
      <Image
        src={wordmark.src}
        width={wordmark.width}
        height={wordmark.height}
        alt=""
        className={cn(
          "h-[2.4rem] w-auto transition-transform duration-500 ease-out group-hover:scale-[1.02]",
          inverted && "brightness-0 invert",
        )}
      />
    </Link>
  );
}
