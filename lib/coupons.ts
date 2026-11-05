import type { Coupon } from "./types";

export type CouponScope = Pick<Coupon, "productSlugs">;

/** An empty selection means the coupon is valid across the whole catalogue. */
export function couponAppliesToProduct(
  coupon: CouponScope | null | undefined,
  productSlug: string
) {
  if (!coupon) return false;
  const slugs = coupon.productSlugs ?? [];
  return slugs.length === 0 || slugs.includes(productSlug);
}

export function couponScopeCount(coupon: CouponScope | null | undefined) {
  if (!coupon) return 0;
  return coupon.productSlugs?.length ?? 0;
}

export function couponScopeLabel(coupon: CouponScope | null | undefined) {
  const count = couponScopeCount(coupon);
  if (count === 0) return "All products";
  return `${count} selected product${count === 1 ? "" : "s"}`;
}

export function couponDiscountAmount(
  coupon: Pick<Coupon, "type" | "value"> | null | undefined,
  eligibleSubtotal: number
) {
  if (!coupon || eligibleSubtotal <= 0) return 0;
  if (coupon.type === "percent") {
    return Math.round((eligibleSubtotal * Number(coupon.value)) / 100);
  }
  if (coupon.type === "fixed") {
    return Math.min(eligibleSubtotal, Number(coupon.value));
  }
  return 0;
}
