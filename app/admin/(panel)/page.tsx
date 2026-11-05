import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CircleAlert,
  Clock3,
  Gift,
  Inbox,
  Package,
  Plus,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { requireAdminPage } from "@/lib/admin/auth";
import {
  getIntegrationsConfig,
  getIntegrationSecretStatus,
} from "@/lib/admin/settings";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { cn, formatBDT } from "@/lib/utils";

type OrderRow = {
  id: string;
  order_no: string;
  status: string;
  payment: string;
  payment_status: string;
  customer: string;
  total: number;
  created_at: string;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  status: string;
  payload: { isDemo?: boolean } | null;
};

const TERMINAL = new Set(["Cancelled", "Returned", "Failed Delivery", "Refunded"]);

function dateKey(value: string) {
  return value.slice(0, 10);
}

function dayLabel(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Delivered"
      ? "bg-jade/10 text-jade"
      : ["Cancelled", "Returned", "Failed Delivery", "Refunded"].includes(status)
        ? "bg-rosewood/10 text-rosewood"
        : ["Handed to Courier", "In Transit"].includes(status)
          ? "bg-teal/10 text-teal"
          : ["Confirmed", "Processing"].includes(status)
            ? "bg-indigo/10 text-indigo"
            : "bg-saffron/15 text-gold-ink";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]", tone)}>
      {status}
    </span>
  );
}

function Delta({ value }: { value: number }) {
  if (!Number.isFinite(value) || value === 0) {
    return <span className="text-[0.54rem] text-muted-foreground">No change</span>;
  }
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[0.54rem] font-semibold",
        up ? "text-jade" : "text-rosewood"
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

export default async function AdminDashboardPage() {
  const context = await requireAdminPage();
  const admin = createAdminSupabaseClient();
  const integrations = await getIntegrationsConfig();
  const secretStatus = await getIntegrationSecretStatus();

  const [
    ordersResponse,
    productsResponse,
    customerCount,
    staffCount,
    contactNew,
    supportNew,
    returnsNew,
    newsletterCount,
    cardsResponse,
    requestsPending,
    auditResponse,
  ] = admin
    ? await Promise.all([
        admin
          .from("orders")
          .select("id,order_no,status,payment,payment_status,customer,total,created_at")
          .order("created_at", { ascending: false })
          .limit(1000),
        admin
          .from("products")
          .select("id,name,slug,stock,status,payload")
          .order("stock", { ascending: true })
          .limit(500),
        admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
        admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("role", ["super_admin", "manager", "order_staff", "content_editor", "support"]),
        admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
        admin.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
        admin.from("return_requests").select("id", { count: "exact", head: true }).eq("status", "requested"),
        admin.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("status", "subscribed"),
        admin.from("gift_cards").select("id,amount,balance,status").limit(500),
        admin.from("gift_card_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        admin
          .from("audit_logs")
          .select("id,action,entity,actor_email,created_at")
          .order("created_at", { ascending: false })
          .limit(6),
      ])
    : [
        { data: [] },
        { data: [] },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { data: [] },
        { count: 0 },
        { data: [] },
      ];

  const orders = (ordersResponse.data ?? []) as OrderRow[];
  const products = (productsResponse.data ?? []) as ProductRow[];
  const cards = cardsResponse.data ?? [];
  const audit = auditResponse.data ?? [];

  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 30);
  const start60 = new Date(now);
  start60.setDate(start60.getDate() - 60);
  const inWindow = (order: OrderRow, from: Date, to: Date) => {
    const created = new Date(order.created_at);
    return created >= from && created < to;
  };
  const validOrders = orders.filter((order) => !TERMINAL.has(order.status));
  const currentOrders = validOrders.filter((order) => inWindow(order, start30, now));
  const previousOrders = validOrders.filter((order) => inWindow(order, start60, start30));
  const revenue30 = currentOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const revenuePrev = previousOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const revenueDelta = revenuePrev > 0 ? ((revenue30 - revenuePrev) / revenuePrev) * 100 : 0;
  const ordersDelta =
    previousOrders.length > 0
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
      : 0;
  const aov = currentOrders.length ? Math.round(revenue30 / currentOrders.length) : 0;
  const aovPrev = previousOrders.length
    ? Math.round(revenuePrev / previousOrders.length)
    : 0;
  const aovDelta = aovPrev > 0 ? ((aov - aovPrev) / aovPrev) * 100 : 0;

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, label: dayLabel(key), total: 0, count: 0 };
  });
  for (const order of validOrders) {
    const day = days.find((entry) => entry.key === dateKey(order.created_at));
    if (day) {
      day.total += Number(order.total);
      day.count += 1;
    }
  }
  const maxDay = Math.max(1, ...days.map((day) => day.total));
  const lowStock = products
    .filter((product) => product.status === "published" && Number(product.stock) <= 5)
    .slice(0, 6);
  const demoCount = products.filter((product) => product.payload?.isDemo === true).length;
  const realCount = products.length - demoCount;
  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const revenue7 = validOrders
    .filter((order) => {
      const date = new Date(order.created_at);
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return date >= start;
    })
    .reduce((sum, order) => sum + Number(order.total), 0);
  const activeCards = cards.filter((card) => card.status === "active");
  const outstanding = activeCards.reduce((sum, card) => sum + Number(card.balance), 0);
  const inbox = (contactNew.count ?? 0) + (supportNew.count ?? 0) + (returnsNew.count ?? 0);
  const system = [
    { label: "Supabase", ok: true, note: "Database connected" },
    { label: "Discord", ok: integrations.discord.enabled, note: "Order alerts" },
    { label: "SMTP", ok: integrations.smtp.enabled && secretStatus.smtpPassword, note: "Customer email" },
    { label: "Steadfast", ok: integrations.steadfast.enabled && secretStatus.steadfastApiKey && secretStatus.steadfastSecretKey && secretStatus.steadfastWebhookSecret, note: "Courier & webhooks" },
    { label: "bKash", ok: integrations.bkash.enabled && secretStatus.bkashAppKey, note: "Payments" },
  ];
  const completed = system.filter((entry) => entry.ok).length;
  const name = context.profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Command center"
        title={`Good to see you, ${name}.`}
        description="A live read on revenue, orders, stock, customer care and the services behind the storefront."
      >
        <Link
          href="/admin/catalogue/products/new"
          className="cta-primary inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
        >
          <Plus className="h-3.5 w-3.5" /> Add product
        </Link>
        <Link
          href="/admin/inbox"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-[0.58rem] font-bold uppercase tracking-[0.1em]"
        >
          <Inbox className="h-3.5 w-3.5" /> Inbox
          {inbox > 0 && (
            <span className="rounded-full bg-magenta px-1.5 py-0.5 text-[0.44rem] text-ivory">{inbox}</span>
          )}
        </Link>
      </AdminPageHeader>

      {demoCount === products.length && products.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-gold/30 bg-gold/[0.06] px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-gold-ink" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold">The catalogue is in demo mode.</p>
            <p className="mt-0.5 text-[0.6rem] leading-relaxed text-muted-foreground">
              {demoCount} demo products are visible with ordering disabled. Add real products or
              uncheck Demo on a product to start selling.
            </p>
          </div>
          <Link
            href="/admin/catalogue"
            className="rounded-full bg-midnight px-3.5 py-2 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-ivory"
          >
            Open catalogue
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenue · 30 days",
            value: formatBDT(revenue30),
            helper: `${formatBDT(revenue7)} in the last 7 days`,
            delta: revenueDelta,
            icon: ReceiptText,
            tone: "jade",
          },
          {
            label: "Orders · 30 days",
            value: currentOrders.length,
            helper: `${pendingOrders.length} pending right now`,
            delta: ordersDelta,
            icon: ShoppingBag,
            tone: "indigo",
          },
          {
            label: "Average order",
            value: formatBDT(aov),
            helper: "Across non-cancelled orders",
            delta: aovDelta,
            icon: BarChart3,
            tone: "saffron",
          },
          {
            label: "Customers",
            value: customerCount.count ?? 0,
            helper: `${staffCount.count ?? 0} staff accounts`,
            delta: null,
            icon: Users,
            tone: "magenta",
          },
        ].map(({ label, value, helper, delta, icon: Icon, tone }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_18px_40px_-36px_rgba(15,11,30,0.4)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 font-display text-[1.75rem] leading-none tabular-nums">{value}</p>
                <p className="mt-2 text-[0.6rem] text-muted-foreground">{helper}</p>
              </div>
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full",
                  tone === "jade"
                    ? "bg-jade/10 text-jade"
                    : tone === "indigo"
                      ? "bg-indigo/10 text-indigo"
                      : tone === "saffron"
                        ? "bg-saffron/15 text-gold-ink"
                        : "bg-magenta/10 text-magenta"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            {delta !== null && (
              <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-2.5">
                <Delta value={delta} />
                <span className="text-[0.46rem] uppercase tracking-[0.1em] text-muted-foreground/60">
                  vs prior 30d
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-indigo">
                Revenue trend
              </p>
              <h2 className="mt-1 font-display text-xl">The last 14 days.</h2>
            </div>
            <Link
              href="/admin/reports"
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-muted-foreground transition hover:border-indigo hover:text-indigo"
            >
              Open reports
            </Link>
          </div>
          <div className="mt-5 flex h-[190px] items-end gap-1.5 sm:gap-2">
            {days.map((day) => {
              const height = day.total > 0 ? Math.max(6, Math.round((day.total / maxDay) * 100)) : 2;
              return (
                <div key={day.key} className="group flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo/70 to-magenta/70 transition-all duration-500 group-hover:from-indigo group-hover:to-magenta"
                      style={{ height: `${height}%` }}
                      title={`${day.label}: ${formatBDT(day.total)} · ${day.count} order${day.count === 1 ? "" : "s"}`}
                    />
                  </div>
                  <span className="hidden text-[0.42rem] text-muted-foreground/60 sm:block">
                    {day.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-[0.56rem] text-muted-foreground">
            <span>Hover a bar for the day’s revenue.</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo" /> Non-cancelled orders
            </span>
          </div>
        </section>

        <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
          <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-magenta">
            Today at a glance
          </p>
          <h2 className="mt-1 font-display text-xl">The operation.</h2>
          <div className="mt-4 space-y-2.5">
            {[
              { label: "Pending orders", value: pendingOrders.length, href: "/admin/orders", icon: Clock3, tone: "text-gold-ink" },
              { label: "Customer care", value: inbox, href: "/admin/inbox", icon: Inbox, tone: "text-magenta" },
              { label: "Gift-card requests", value: requestsPending.count ?? 0, href: "/admin/gift-cards", icon: Gift, tone: "text-indigo" },
              { label: "Low-stock products", value: lowStock.length, href: "/admin/catalogue", icon: Package, tone: "text-rosewood" },
              { label: "Newsletter subscribers", value: newsletterCount.count ?? 0, href: "/admin/inbox", icon: Users, tone: "text-teal" },
            ].map(({ label, value, href, icon: Icon, tone }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5 transition hover:border-indigo hover:bg-indigo/[0.03]"
              >
                <Icon className={cn("h-4 w-4 shrink-0", tone)} />
                <span className="min-w-0 flex-1 text-[0.66rem] font-medium">{label}</span>
                <span className="text-[0.78rem] font-semibold tabular-nums">{value}</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground/35" />
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-[var(--muted)]/60 p-3">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Gift-card exposure
            </p>
            <p className="mt-1 font-display text-2xl tabular-nums">{formatBDT(outstanding)}</p>
            <p className="text-[0.56rem] text-muted-foreground">
              {activeCards.length} active card{activeCards.length === 1 ? "" : "s"} · {cards.length} issued
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <div>
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-indigo">Order desk</p>
              <h2 className="mt-1 font-display text-xl">Recent orders.</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-[0.54rem] font-bold uppercase tracking-[0.1em] text-indigo hover:underline"
            >
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <ShoppingBag className="mx-auto h-6 w-6 text-muted-foreground/35" />
              <p className="mt-2 font-display text-xl">No orders yet.</p>
              <p className="mt-1 text-[0.64rem] text-muted-foreground">
                Orders will appear here as soon as a customer checks out.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    {["Order", "Customer", "Total", "Status", "Date"].map((head) => (
                      <th key={head} className="px-4 py-2.5">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--muted)]/30">
                      <td className="px-4 py-3 font-mono text-[0.6rem] font-semibold">{order.order_no}</td>
                      <td className="px-4 py-3">{order.customer}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold">{formatBDT(order.total)}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-rosewood">
                Inventory
              </p>
              <h2 className="mt-1 font-display text-xl">Low stock.</h2>
            </div>
            <Link
              href="/admin/catalogue"
              className="text-[0.52rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline"
            >
              Catalogue
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] p-5 text-center">
              <BadgeCheck className="mx-auto h-5 w-5 text-jade" />
              <p className="mt-2 text-[0.66rem] font-semibold">Everything is healthy.</p>
              <p className="mt-1 text-[0.58rem] text-muted-foreground">No published product is at 5 or fewer units.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {lowStock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/catalogue/products/${product.id}`}
                  className="block rounded-xl border border-[var(--color-border)] p-3 transition hover:border-rosewood/40 hover:bg-rosewood/[0.03]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[0.66rem] font-semibold">{product.name}</p>
                    <span className={cn("text-[0.6rem] font-bold tabular-nums", Number(product.stock) === 0 ? "text-rosewood" : "text-gold-ink")}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className={cn("h-full rounded-full", Number(product.stock) === 0 ? "bg-rosewood" : "bg-saffron")}
                      style={{ width: `${Math.max(4, Math.min(100, (Number(product.stock) / 5) * 100))}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-jade">
                Systems
              </p>
              <h2 className="mt-1 font-display text-xl">Service health.</h2>
            </div>
            <span className="rounded-full bg-jade/10 px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em] text-jade">
              {completed}/{system.length} ready
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {system.map((entry) => (
              <div
                key={entry.label}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2.5"
              >
                <span className={cn("h-2 w-2 rounded-full", entry.ok ? "bg-jade" : "bg-stone/30")} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.66rem] font-semibold">{entry.label}</p>
                  <p className="text-[0.52rem] text-muted-foreground">{entry.note}</p>
                </div>
                <span className={cn("text-[0.5rem] font-bold uppercase tracking-[0.08em]", entry.ok ? "text-jade" : "text-muted-foreground/60")}>
                  {entry.ok ? "Ready" : "Off"}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/integrations"
            className="mt-3 inline-flex text-[0.54rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline"
          >
            Open integrations →
          </Link>
        </section>

        <section className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-indigo">
                Activity
              </p>
              <h2 className="mt-1 font-display text-xl">Recent admin writes.</h2>
            </div>
            <Link href="/admin/audit" className="text-[0.52rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline">
              Audit log
            </Link>
          </div>
          {audit.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center">
              <Activity className="mx-auto h-5 w-5 text-muted-foreground/35" />
              <p className="mt-2 text-[0.66rem] font-semibold">No admin activity yet.</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--color-border)]">
              {audit.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 py-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.64rem] font-medium">{entry.action.replace(/_/g, " ")}</p>
                    <p className="text-[0.52rem] uppercase tracking-[0.06em] text-muted-foreground">
                      {entry.entity} · {entry.actor_email ?? "system"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[0.5rem] text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { href: "/admin/orders", label: "Order desk", text: `${pendingOrders.length} pending`, icon: ShoppingBag },
          { href: "/admin/catalogue", label: "Catalogue", text: `${realCount} real · ${demoCount} demo`, icon: Package },
          { href: "/admin/inbox", label: "Inbox", text: `${inbox} new`, icon: Inbox },
          { href: "/admin/gift-cards", label: "Gift cards", text: `${requestsPending.count ?? 0} requests`, icon: Gift },
          { href: "/admin/reports", label: "Reports", text: "Print & CSV", icon: BarChart3 },
        ].map(({ href, label, text, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition hover:-translate-y-0.5 hover:border-indigo hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--muted)] text-foreground/70">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.68rem] font-semibold">{label}</span>
              <span className="block truncate text-[0.54rem] text-muted-foreground">{text}</span>
            </span>
            <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/35" />
          </Link>
        ))}
      </div>
    </div>
  );
}
