import { ArrowLeft, Mail, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminUserAccess } from "@/components/admin/admin-user-access";
import { requireStaff } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Entitlement, Order, OrderItem, Product, Profile } from "@/lib/types";
import { formatDate, formatMoney, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

type OrderWithItems = Order & { order_items: OrderItem[] };
type EntitlementRow = Entitlement & { product: Product | null };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile: viewer } = await requireStaff("/admin/users");
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const [profileResult, ordersResult, entitlementsResult, productsResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("entitlements")
        .select("*")
        .eq("user_id", id)
        .order("granted_at", { ascending: false }),
      supabase
        .from("products")
        .select("id,title,type,slug")
        .order("sort", { ascending: true }),
    ]);

  if (!profileResult.data) notFound();

  const profile = profileResult.data as Profile;
  const orders = (ordersResult.data ?? []) as OrderWithItems[];
  const entitlements = (entitlementsResult.data ?? []) as Entitlement[];
  const products = (productsResult.data ?? []) as Pick<
    Product,
    "id" | "title" | "type" | "slug"
  >[];

  const productIds = entitlements
    .map((item) => item.product_id)
    .filter((productId): productId is string => Boolean(productId));
  let entitlementProducts: Product[] = [];
  if (productIds.length) {
    const { data } = await supabase.from("products").select("*").in("id", productIds);
    entitlementProducts = (data ?? []) as Product[];
  }
  const entitlementRows: EntitlementRow[] = entitlements.map((item) => ({
    ...item,
    product:
      entitlementProducts.find((product) => product.id === item.product_id) ?? null,
  }));

  const spent = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-muted hover:text-teal"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        All users
      </Link>

      <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className="grid size-14 shrink-0 place-items-center rounded-full text-lg font-extrabold text-ink"
            style={{ backgroundColor: `hsl(${profile.avatar_hue} 58% 78%)` }}
            aria-hidden="true"
          >
            {initials(profile.full_name ?? profile.email)}
          </span>
          <div>
            <p className="eyebrow">Customer profile</p>
            <h1 className="mt-1.5 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-ink sm:text-[2.6rem]">
              {profile.full_name ?? profile.email.split("@")[0]}
            </h1>
            <p className="mt-1.5 text-[0.68rem] text-muted">
              {profile.email} · joined {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip capitalize">{profile.role}</span>
          <span className="chip">{entitlements.length} library</span>
          <span className="chip">{orders.length} orders</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-muted">
              Contact
            </p>
            <div className="mt-4 space-y-3 text-[0.7rem] text-ink-soft">
              <p className="flex items-center gap-2">
                <Mail className="size-3.5 text-teal" aria-hidden="true" />
                {profile.email}
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-teal" aria-hidden="true" />
                {profile.phone || "No phone on profile"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 text-teal" aria-hidden="true" />
                {profile.city || "No city on profile"}
              </p>
            </div>
          </section>

          <section className="rounded-[1.2rem] border border-line bg-cream p-5">
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-muted">
              Orders
            </p>
            <div className="mt-4 space-y-2">
              {orders.length ? (
                orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 border-b border-line/70 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-[0.66rem] font-semibold text-ink">{order.order_number}</p>
                      <p className="text-[0.54rem] text-muted">{formatDate(order.created_at)} · {order.status}</p>
                    </div>
                    <p className="price text-[0.68rem] font-semibold text-ink">{formatMoney(order.total)}</p>
                  </div>
                ))
              ) : (
                <p className="text-[0.68rem] text-muted">No orders yet.</p>
              )}
            </div>
            {orders.length ? (
              <p className="mt-3 border-t border-line pt-3 text-[0.6rem] text-muted">
                Lifetime value <span className="price font-semibold text-ink">{formatMoney(spent)}</span>
              </p>
            ) : null}
          </section>
        </div>

        <AdminUserAccess
          userId={profile.id}
          entitlements={entitlementRows}
          products={products}
          canManage={viewer?.role === "owner"}
        />
      </div>
    </div>
  );
}
