"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Download,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ProductArt } from "@/components/brand/product-art";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/storefront/order-timeline";
import { getProduct } from "@/lib/data";
import { productColorPalette } from "@/lib/theme";
import { getLocalOrder } from "@/lib/order-store";
import { useCart } from "@/lib/providers";
import type { Order } from "@/lib/types";
import { ORDER_STATUS_META, SITE, WHATSAPP_LINK } from "@/lib/constants";
import { cn, formatBDT, formatDate } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function openInvoice(
  order: Order,
  invoice?: {
    senderName: string;
    senderEmail: string;
    replyTo: string;
    footer: string;
  },
  invoiceNumber?: string
) {
  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) {
    toast.error("Please allow pop-ups to download the invoice.");
    return;
  }
  const rows = order.items
    .map(
      (item) => `<tr>
        <td>${item.bundleName ? `<div style="color:var(--color-gold-ink);font-size:10px;text-transform:uppercase;letter-spacing:1px">Bundle: ${escapeHtml(item.bundleName)}</div>` : ""}${escapeHtml(item.name)}<br/><span style="color:#777;font-size:11px">${escapeHtml(item.color)} · ${escapeHtml(item.size)}</span></td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">৳${item.price.toLocaleString("en-US")}</td>
        <td style="text-align:right">৳${(item.price * item.qty).toLocaleString("en-US")}</td>
      </tr>`
    )
    .join("");

  win.document.write(`
    <!doctype html><html><head><title>Invoice ${escapeHtml(order.orderNo)}</title>
    <style>
      body{font-family:Georgia,serif;color:var(--color-ink);padding:48px;max-width:760px;margin:auto}
      header{display:flex;justify-content:space-between;border-bottom:1px solid var(--color-saffron);padding-bottom:24px}
      h1{font-size:32px;margin:0;letter-spacing:4px}
      .muted{color:#6B6578;font-size:11px;text-transform:uppercase;letter-spacing:1.5px}
      table{width:100%;border-collapse:collapse;margin-top:32px;font-family:Arial,sans-serif;font-size:12px}
      th{text-align:left;border-bottom:1px solid #ddd;padding:10px 6px;color:#6B6578;font-size:10px;text-transform:uppercase;letter-spacing:1px}
      td{padding:12px 6px;border-bottom:1px solid #eee;vertical-align:top}
      .totals{margin-left:auto;margin-top:24px;width:260px;font-family:Arial,sans-serif;font-size:12px}
      .totals div{display:flex;justify-content:space-between;padding:7px 0}
      .totals .grand{border-top:1px solid var(--color-ink);font-weight:bold;font-size:15px;margin-top:8px;padding-top:12px}
      footer{margin-top:48px;border-top:1px solid #eee;padding-top:20px;color:#6B6578;font-size:11px;font-family:Arial,sans-serif;line-height:1.7}
    </style></head><body>
      <header>
        <div><h1>BENGALOT</h1><div class="muted">Saltha, Faridpur</div></div>
        <div style="text-align:right"><div class="muted">Invoice</div><div style="font-size:18px;margin-top:4px">${escapeHtml(invoiceNumber ?? order.orderNo)}</div><div style="font-size:11px;color:#777;margin-top:4px">${formatDate(order.date)}</div></div>
      </header>
      <div style="display:flex;gap:48px;margin-top:32px;font-family:Arial,sans-serif;font-size:12px">
        <div><div class="muted">Billed to</div><div style="margin-top:6px;line-height:1.6">${escapeHtml(order.customer)}<br/>${escapeHtml(order.phone)}<br/>${escapeHtml(order.address)}</div></div>
        <div><div class="muted">Payment</div><div style="margin-top:6px;line-height:1.6">${escapeHtml(order.payment)}<br/>${escapeHtml(order.paymentStatus)}</div></div>
      </div>
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals">
        <div><span>Subtotal</span><span>৳${order.subtotal.toLocaleString("en-US")}</span></div>
        ${order.discount ? `<div><span>Discount</span><span>−৳${order.discount.toLocaleString("en-US")}</span></div>` : ""}
        ${(order.bundleSavings ?? 0) > 0 ? `<div><span>Bundle savings</span><span>−৳${(order.bundleSavings ?? 0).toLocaleString("en-US")}</span></div>` : ""}
        ${(order.giftCardAmount ?? 0) > 0 ? `<div><span>Gift card</span><span>−৳${(order.giftCardAmount ?? 0).toLocaleString("en-US")}</span></div>` : ""}
        <div><span>Delivery</span><span>${order.delivery === 0 ? "Complimentary" : `৳${order.delivery.toLocaleString("en-US")}`}</span></div>
        <div class="grand"><span>Total</span><span>৳${order.total.toLocaleString("en-US")}</span></div>
      </div>
      <footer>${escapeHtml(invoice?.footer ?? `Thank you for shopping with Bengalot. Questions? WhatsApp ${SITE.whatsapp} or email ${SITE.email}.`)}<br/>This invoice is generated for the order above. Online-only business · bengalot.com</footer>
      <script>window.onload=function(){setTimeout(function(){window.print()},350)}</script>
    </body></html>`);
  win.document.close();
}

export function OrderDetailView({
  orderNo,
  invoice,
  invoiceNumber,
  initialOrder,
}: {
  orderNo: string;
  invoice?: {
    senderName: string;
    senderEmail: string;
    replyTo: string;
    footer: string;
  };
  invoiceNumber?: string;
  initialOrder?: Order;
}) {
  const { addLine, openCart } = useCart();
  const [order, setOrder] = useState<Order | undefined>(initialOrder);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setOrder(getLocalOrder(orderNo) ?? initialOrder);
    setLoaded(true);
  }, [orderNo, initialOrder]);

  const reorder = () => {
    let added = 0;
    let skippedDemo = 0;
    order?.items.forEach((item) => {
      const product = getProduct(item.productSlug);
      if (!product) return;
      if (product.isDemo) {
        skippedDemo += 1;
        return;
      }
      addLine(
        {
          productSlug: item.productSlug,
          size: item.size,
          color: item.color,
          qty: item.qty,
          snapshot: product,
        },
        { silent: true }
      );
      added += 1;
    });
    if (skippedDemo > 0) {
      toast.error("Demo products were skipped", {
        description: "Ordering is disabled for demo listings.",
      });
    }
    if (added > 0) {
      toast.success("Added to your bag");
      openCart();
    }
  };

  if (!loaded) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line-strong)] py-20 text-center">
        <p className="font-display text-3xl">Order not found.</p>
        <p className="mx-auto mt-2 max-w-sm text-[0.78rem] leading-relaxed text-muted-foreground">
          We couldn&apos;t find this order in your account. If you checked out as a guest,
          track it with the order number and phone number used at checkout.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gold">
            <Link href="/track">Track an order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/orders">Back to my orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const meta = ORDER_STATUS_META[order.status];
  const canTrack = ["Pending", "Confirmed", "Processing", "Handed to Courier", "In Transit", "Returning"].includes(
    order.status
  );

  return (
    <div>
      <Link
        href="/account/orders"
        className="mb-5 inline-flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted-foreground transition hover:text-gold"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-indigo">Order details</p>
          <h2 className="display-3 mt-2 flex flex-wrap items-center gap-3">
            {order.orderNo}
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-sans text-[0.48rem] font-bold uppercase tracking-[0.1em]",
                meta?.tone
              )}
            >
              {order.status}
            </span>
          </h2>
          <p className="mt-2 text-[0.66rem] text-muted-foreground">
            Placed {formatDate(order.date)} ·{" "}
            {order.items.reduce((sum, i) => sum + i.qty, 0)}{" "}
            {order.items.reduce((sum, i) => sum + i.qty, 0) === 1 ? "item" : "items"} ·{" "}
            {formatBDT(order.total)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openInvoice(order, invoice, invoiceNumber)}
            className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 text-[0.54rem] font-bold uppercase tracking-[0.1em] transition hover:border-gold hover:text-gold"
          >
            <Download className="h-3.5 w-3.5" /> Invoice
          </button>
          <button
            type="button"
            onClick={reorder}
            className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3.5 text-[0.54rem] font-bold uppercase tracking-[0.1em] transition hover:border-gold hover:text-gold"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reorder
          </button>
          {canTrack && (
            <Link
              href={`/track?order=${encodeURIComponent(order.orderNo)}&phone=${order.phone}`}
              className="flex h-9 items-center gap-1.5 rounded-full bg-midnight px-3.5 text-[0.54rem] font-bold uppercase tracking-[0.1em] text-ivory"
            >
              <Truck className="h-3.5 w-3.5" /> Track
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="space-y-4">
          <OrderTimeline order={order} />

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl">Your pieces</h3>
              <span className="text-[0.54rem] uppercase tracking-[0.1em] text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="mt-3 divide-y divide-[var(--border)]">
              {order.items.map((item, index) => {
                const product = getProduct(item.productSlug);
                const colorHex = product?.colors.find(
                  (color) => color.name === item.color
                )?.hex;
                return (
                  <div key={`${item.productSlug}-${index}`} className="flex flex-wrap gap-3 py-4">
                    <div className="h-[86px] w-[66px] shrink-0 overflow-hidden rounded-lg border border-[var(--border)]">
                      {product && (
                        <ProductArt
                          id={`detail-${order.orderNo}-${index}`}
                          art={product.art}
                          paletteOverride={
                            colorHex ? productColorPalette(colorHex) : undefined
                          }
                          colorName={item.color}
                          showCaption={false}
                          showMonogram={false}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.bundleName && (
                        <p className="mb-0.5 text-[0.48rem] font-bold uppercase tracking-[0.08em] text-gold">
                          Bundle: {item.bundleName}
                        </p>
                      )}
                      {product ? (
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-[0.8rem] font-medium transition hover:text-gold"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <p className="text-[0.8rem] font-medium">{item.name}</p>
                      )}
                      <p className="mt-1 text-[0.58rem] uppercase tracking-[0.08em] text-muted-foreground">
                        {item.color} · {item.size} · Qty {item.qty}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {product && (
                          <Link
                            href={`/product/${product.slug}#reviews`}
                            className="flex items-center gap-1 text-[0.54rem] font-semibold uppercase tracking-[0.08em] text-gold-ink underline-offset-4 hover:underline"
                          >
                            <Star className="h-3 w-3" /> Write a review
                          </Link>
                        )}
                        <Link
                          href="/account/returns"
                          className="text-[0.54rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
                        >
                          Return / exchange
                        </Link>
                      </div>
                    </div>
                    <p className="text-[0.8rem] font-semibold tabular-nums">
                      {formatBDT(item.price * item.qty)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {order.note && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[0.54rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Your note
              </p>
              <p className="mt-1.5 text-[0.74rem] leading-relaxed text-muted-foreground">
                {order.note}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-display text-xl">Summary</h3>
            <div className="mt-3 space-y-2.5 text-[0.72rem]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatBDT(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-jade ">
                  <span>Discount</span>
                  <span className="tabular-nums">−{formatBDT(order.discount)}</span>
                </div>
              )}
              {(order.bundleSavings ?? 0) > 0 && (
                <div className="flex justify-between text-jade ">
                  <span>Bundle savings</span>
                  <span className="tabular-nums">−{formatBDT(order.bundleSavings ?? 0)}</span>
                </div>
              )}
              {(order.giftCardAmount ?? 0) > 0 && (
                <div className="flex justify-between text-indigo">
                  <span>Gift card</span>
                  <span className="tabular-nums">−{formatBDT(order.giftCardAmount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="tabular-nums">
                  {order.delivery === 0 ? "Complimentary" : formatBDT(order.delivery)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3 font-semibold">
                <span>Total</span>
                <span className="text-base tabular-nums">{formatBDT(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="flex items-center gap-1">
                  {order.paymentStatus === "Paid" && (
                    <BadgeCheck className="h-3.5 w-3.5 text-jade" />
                  )}
                  {order.payment}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-display text-xl">Delivered to</h3>
            <p className="mt-2 text-[0.8rem] font-semibold">{order.customer}</p>
            <p className="mt-1 flex items-start gap-2 text-[0.7rem] leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {order.address}
            </p>
            <p className="mt-2 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-gold" /> {order.phone}
            </p>
            {order.trackingCode && (
              <div className="mt-3 rounded-lg bg-[var(--muted)] px-3 py-2 text-[0.62rem]">
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracking</span>
                  <span className="font-mono font-semibold">{order.trackingCode}</span>
                </p>
                {order.courierStatus && (
                  <p className="mt-1 text-[0.54rem] capitalize text-muted-foreground">
                    Steadfast: {order.courierStatus.replace(/_/g, " ")}
                  </p>
                )}
                {order.trackingLink && (
                  <a
                    href={order.trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[0.52rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline"
                  >
                    Open Steadfast tracking <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-gold/35 bg-gold/[0.05] p-5">
            <MessageCircle className="h-5 w-5 text-gold" />
            <p className="mt-2 font-display text-lg">A question about this order?</p>
            <p className="mt-1 text-[0.66rem] leading-relaxed text-muted-foreground">
              Include your order number and we&apos;ll look into it straight away.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[var(--color-jade)] py-2.5 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[var(--color-jade)]"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp support
            </a>
            <Link
              href="/account/support"
              className="mt-2 flex items-center justify-center gap-1.5 py-1 text-[0.54rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition hover:text-gold"
            >
              Message the atelier <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
