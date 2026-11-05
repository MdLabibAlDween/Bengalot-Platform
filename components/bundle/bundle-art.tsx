import { ArtIconGlyph } from "@/components/brand/product-art";
import { JamdaniField, Sparkle } from "@/components/brand/ornaments";
import { getBundleItems } from "@/lib/bundles";
import { placeholderPalette } from "@/lib/theme";
import type { Bundle } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BundleArt({
  bundle,
  className,
}: {
  bundle: Bundle;
  className?: string;
}) {
  const items = getBundleItems(bundle);
  const icons = items.slice(0, 4);
  const palette = placeholderPalette(bundle.slug);
  const ink = palette.ink;
  const gold = palette.gold;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(145deg, ${palette.from} 0%, ${palette.to} 120%)`,
      }}
      role="img"
      aria-label={`${bundle.name} — outfit illustration`}
    >
      <JamdaniField
        id={`bundle-art-${bundle.slug}`}
        color={gold}
        opacity={0.13}
        size={52}
      />
      <div
        className="pointer-events-none absolute inset-3 rounded-[18px] border sm:inset-4"
        style={{ borderColor: `color-mix(in srgb, ${gold} 34%, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-4 rounded-[14px] border sm:inset-5"
        style={{ borderColor: `color-mix(in srgb, ${gold} 14%, transparent)` }}
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-5 p-6">
        <div
          className={cn(
            "relative grid gap-2 sm:gap-3",
            icons.length === 3 ? "grid-cols-3" : "grid-cols-2"
          )}
        >
          {icons.map(({ product }, index) => (
            <span
              key={`${product.slug}-${index}`}
              className="flex h-14 w-14 items-center justify-center rounded-[16px] border shadow-[0_10px_22px_-16px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:h-16 sm:w-16"
              style={{
                borderColor: `color-mix(in srgb, ${ink} 16%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${ink} 5%, transparent)`,
                color: ink,
              }}
              title={product.name}
            >
              <ArtIconGlyph art={product.art} className="h-[56%] w-[56%]" strokeWidth={2} />
            </span>
          ))}
          {icons.length < 3 && icons.length % 2 === 1 && (
            <span className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-dashed sm:h-16 sm:w-16" style={{ borderColor: `color-mix(in srgb, ${gold} 30%, transparent)`, color: gold }}>
              <Sparkle size={18} color={gold} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
