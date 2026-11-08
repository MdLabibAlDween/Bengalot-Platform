import type { Metadata } from "next";

import { ShopBrowser } from "@/components/shop/shop-browser";
import { ShopHero } from "@/components/shop/shop-hero";
import { getCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Shop all study tools",
  description:
    "Notion templates, printed study cards, printed planners and focus tools from Bengalot. Browse every collection in one place.",
};

export default async function ShopPage() {
  const catalog = await getCatalog();

  return (
    <>
      <ShopHero products={catalog.products} />
      <ShopBrowser
        products={catalog.products}
        categories={catalog.categories}
      />
    </>
  );
}
