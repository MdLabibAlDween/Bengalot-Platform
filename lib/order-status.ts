import type { OrderStatus } from "@/lib/types";

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; description: string; className: string; step: number }
> = {
  processing: {
    label: "Being prepared",
    description: "We have your order and are checking everything.",
    className: "bg-butter-soft text-[#6b5211]",
    step: 1,
  },
  packed: {
    label: "Packed",
    description: "Your parcel is packed and waiting for the courier.",
    className: "bg-lavender-soft text-[#4b3e6a]",
    step: 2,
  },
  shipped: {
    label: "On the way",
    description: "With the courier. We will keep you posted.",
    className: "bg-teal-soft text-teal",
    step: 3,
  },
  delivered: {
    label: "Delivered",
    description: "Delivered. We hope it earns its place on your desk.",
    className: "bg-teal text-cream",
    step: 4,
  },
  cancelled: {
    label: "Cancelled",
    description: "This order was cancelled. Contact us if that is unexpected.",
    className: "bg-coral/10 text-coral",
    step: 0,
  },
};

export const orderTimeline = [
  "Order placed",
  "Being prepared",
  "With courier",
  "Delivered",
];
