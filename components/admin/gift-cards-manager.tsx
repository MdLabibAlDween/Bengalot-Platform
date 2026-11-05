"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  CreditCard,
  Download,
  Gift,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatGiftCardCode } from "@/lib/gift-cards";
import { cn, formatBDT } from "@/lib/utils";

type GiftCardRow = {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipient_name: string;
  recipient_contact: string;
  sender_name: string;
  message: string | null;
  delivery: "email" | "whatsapp";
  status: "active" | "redeemed" | "expired" | "void";
  expires_at: string;
  created_at: string;
  note: string | null;
  is_demo: boolean;
  source: string;
};

type RequestRow = {
  id: string;
  reference: string;
  amount: number;
  recipient_name: string;
  recipient_contact: string;
  sender_name: string;
  message: string | null;
  delivery: "email" | "whatsapp";
  status: "pending" | "contacted" | "paid" | "issued" | "cancelled";
  admin_note: string | null;
  gift_card_id: string | null;
  created_at: string;
};

type TransactionRow = {
  id: string;
  gift_card_id: string;
  order_no: string | null;
  kind: string;
  amount: number;
  balance_after: number | null;
  note: string | null;
  actor_email: string | null;
  created_at: string;
};

type Tab = "cards" | "requests" | "transactions";

const statusTone: Record<string, string> = {
  active: "bg-jade/10 text-jade",
  redeemed: "bg-[var(--muted)] text-muted-foreground",
  expired: "bg-rosewood/10 text-rosewood",
  void: "bg-rosewood/10 text-rosewood",
  pending: "bg-magenta/10 text-magenta",
  contacted: "bg-saffron/15 text-gold-ink",
  paid: "bg-indigo/10 text-indigo",
  issued: "bg-jade/10 text-jade",
  cancelled: "bg-[var(--muted)] text-muted-foreground",
  issue: "bg-jade/10 text-jade",
  redeem: "bg-magenta/10 text-magenta",
  refund: "bg-indigo/10 text-indigo",
  adjustment: "bg-saffron/15 text-gold-ink",
};

function Pill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
        statusTone[value] ?? "bg-[var(--muted)] text-muted-foreground"
      )}
    >
      {value}
    </span>
  );
}

function when(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function deliveryLink(card: GiftCardRow) {
  const text = [
    `${card.sender_name} sent you a Bengalot gift card.`,
    `Code: ${formatGiftCardCode(card.code)}`,
    `Value: ${formatBDT(card.amount)}`,
    `Expires: ${when(card.expires_at)}`,
    card.message ? `Message: ${card.message}` : "",
    "Redeem it at checkout on bengalot.com.",
  ]
    .filter(Boolean)
    .join("\n");
  if (card.delivery === "whatsapp") {
    const phone = card.recipient_contact.replace(/\D/g, "");
    return `https://wa.me/${phone.startsWith("880") ? phone : `88${phone}`}?text=${encodeURIComponent(text)}`;
  }
  return `mailto:${card.recipient_contact}?subject=${encodeURIComponent("Your Bengalot gift card")}&body=${encodeURIComponent(text)}`;
}

export function GiftCardsManager({
  initial,
}: {
  initial: {
    cards: GiftCardRow[];
    requests: RequestRow[];
    transactions: TransactionRow[];
  };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cards");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueOpen, setIssueOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [issue, setIssue] = useState({
    amount: "2000",
    recipientName: "",
    recipientContact: "",
    senderName: "",
    message: "",
    delivery: "whatsapp" as "email" | "whatsapp",
    expiryMonths: "12",
    note: "",
    isDemo: false,
  });

  const cards = initial.cards;
  const requests = initial.requests;
  const active = cards.filter((card) => card.status === "active");
  const outstanding = active.reduce((sum, card) => sum + card.balance, 0);
  const issued = cards.reduce((sum, card) => sum + card.amount, 0);
  const pending = requests.filter((request) => request.status === "pending");
  const cardByCode = useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards]
  );

  const filteredCards = cards.filter((card) => {
    if (statusFilter !== "all" && card.status !== statusFilter) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [card.code, card.recipient_name, card.recipient_contact, card.sender_name]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [request.reference, request.recipient_name, request.recipient_contact]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const issueCard = async () => {
    setSaving(true);
    const response = await fetch("/api/admin/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "issue",
        amount: Number(issue.amount),
        recipientName: issue.recipientName,
        recipientContact: issue.recipientContact,
        senderName: issue.senderName,
        message: issue.message,
        delivery: issue.delivery,
        expiryMonths: Number(issue.expiryMonths),
        note: issue.note,
        isDemo: issue.isDemo,
      }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not issue the gift card.");
      return;
    }
    toast.success("Gift card issued", {
      description: formatGiftCardCode(result.card.code),
    });
    setIssue({
      amount: "2000",
      recipientName: "",
      recipientContact: "",
      senderName: "",
      message: "",
      delivery: "whatsapp",
      expiryMonths: "12",
      note: "",
      isDemo: false,
    });
    setIssueOpen(false);
    router.refresh();
  };

  const action = async (payload: Record<string, unknown>, message: string) => {
    setSaving(true);
    const response = await fetch("/api/admin/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not update the gift card.");
      return;
    }
    toast.success(message);
    router.refresh();
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(formatGiftCardCode(code));
      setCopied(code);
      toast.success("Gift card code copied");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error(formatGiftCardCode(code));
    }
  };

  const exportCards = () => {
    const rows = [
      ["Code", "Value", "Balance", "Status", "Recipient", "Contact", "Expires", "Created"],
      ...cards.map((card) => [
        formatGiftCardCode(card.code),
        card.amount,
        card.balance,
        card.status,
        card.recipient_name,
        card.recipient_contact,
        card.expires_at,
        card.created_at,
      ]),
    ];
    const content = rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
            return `"${safe.replaceAll('"', '""')}"`;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bengalot-gift-cards-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active cards", value: active.length, helper: `${cards.length} issued total`, icon: Gift, tone: "jade" },
          { label: "Outstanding", value: formatBDT(outstanding), helper: "Balance still redeemable", icon: CreditCard, tone: "indigo" },
          { label: "Issued value", value: formatBDT(issued), helper: "All time", icon: Sparkles, tone: "saffron" },
          { label: "Pending requests", value: pending.length, helper: `${requests.length} requests total`, icon: Send, tone: "magenta" },
        ].map(({ label, value, helper, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_18px_40px_-36px_rgba(15,11,30,0.4)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 font-display text-[1.65rem] leading-none tabular-nums">{value}</p>
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
            <p className="mt-3 text-[0.6rem] text-muted-foreground">{helper}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_18px_44px_-40px_rgba(15,11,30,0.4)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] p-3">
          <div className="flex gap-1">
            {[
              { key: "cards" as Tab, label: "Cards", count: cards.length },
              { key: "requests" as Tab, label: "Requests", count: requests.length },
              { key: "transactions" as Tab, label: "Transactions", count: initial.transactions.length },
            ].map((entry) => (
              <button
                key={entry.key}
                type="button"
                onClick={() => {
                  setTab(entry.key);
                  setStatusFilter("all");
                  setQuery("");
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.08em] transition",
                  tab === entry.key
                    ? "bg-midnight text-ivory"
                    : "text-muted-foreground hover:bg-[var(--muted)]"
                )}
              >
                {entry.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[0.44rem]",
                    tab === entry.key ? "bg-ivory/15 text-ivory" : "bg-[var(--muted)]"
                  )}
                >
                  {entry.count}
                </span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cards or requests"
                className="h-9 w-[200px] pl-9 text-[0.66rem]"
              />
            </div>
            {tab !== "transactions" && (
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="field h-9 w-[130px] py-0 text-[0.62rem]"
                aria-label="Filter gift cards"
              >
                <option value="all">All status</option>
                {(tab === "cards"
                  ? ["active", "redeemed", "expired", "void"]
                  : ["pending", "contacted", "paid", "issued", "cancelled"]
                ).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}
            {tab === "cards" && (
              <>
                <Button type="button" variant="outline" size="sm" onClick={exportCards}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                <Button type="button" size="sm" onClick={() => setIssueOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Issue card
                </Button>
              </>
            )}
          </div>
        </div>

        {tab === "cards" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Code", "Recipient", "Value", "Balance", "Status", "Expires", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.62rem] font-semibold">
                          {formatGiftCardCode(card.code)}
                        </span>
                        <button
                          type="button"
                          onClick={() => copy(card.code)}
                          className="text-muted-foreground hover:text-indigo"
                          aria-label="Copy code"
                        >
                          {copied === card.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      {card.is_demo && (
                        <span className="mt-1 inline-flex rounded bg-gold/15 px-1.5 py-0.5 text-[0.42rem] font-bold uppercase tracking-[0.08em] text-gold-ink">
                          Demo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{card.recipient_name}</p>
                      <p className="text-[0.54rem] text-muted-foreground">{card.recipient_contact}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatBDT(card.amount)}</td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{formatBDT(card.balance)}</td>
                    <td className="px-4 py-3">
                      <Pill value={card.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{when(card.expires_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={deliveryLink(card)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground transition hover:border-indigo hover:text-indigo"
                          aria-label="Send gift card"
                        >
                          {card.delivery === "whatsapp" ? (
                            <MessageCircle className="h-3.5 w-3.5" />
                          ) : (
                            <Mail className="h-3.5 w-3.5" />
                          )}
                        </a>
                        {card.status === "active" && (
                          <button
                            type="button"
                            onClick={() =>
                              action({ action: "void", id: card.id, note: "Voided from admin" }, "Gift card voided")
                            }
                            className="grid h-8 w-8 place-items-center rounded-full border border-rosewood/25 text-rosewood transition hover:bg-rosewood hover:text-white"
                            aria-label="Void gift card"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "requests" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Reference", "Recipient", "Value", "Status", "Requested", ""].map((head) => (
                    <th key={head} className="px-4 py-2.5">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-3 font-mono text-[0.6rem]">{request.reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{request.recipient_name}</p>
                      <p className="text-[0.54rem] text-muted-foreground">
                        {request.delivery} · {request.recipient_contact}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{formatBDT(request.amount)}</td>
                    <td className="px-4 py-3">
                      <Pill value={request.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{when(request.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {request.status !== "issued" && request.status !== "cancelled" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="gold"
                              disabled={saving}
                              onClick={() =>
                                action(
                                  { action: "issue_from_request", requestId: request.id },
                                  "Gift card issued"
                                )
                              }
                            >
                              Issue
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={saving}
                              onClick={() =>
                                action(
                                  {
                                    action: "request_status",
                                    id: request.id,
                                    status: request.status === "pending" ? "contacted" : "paid",
                                  },
                                  "Request updated"
                                )
                              }
                            >
                              {request.status === "pending" ? "Contacted" : "Paid"}
                            </Button>
                          </>
                        )}
                        {request.gift_card_id && cardByCode.get(request.gift_card_id) && (
                          <span className="font-mono text-[0.54rem] text-jade">
                            {formatGiftCardCode(cardByCode.get(request.gift_card_id)!.code)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "transactions" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  {["Date", "Card", "Type", "Amount", "Balance", "Order", "Actor"].map((head) => (
                    <th key={head} className="px-4 py-2.5">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                {initial.transactions.map((transaction) => {
                  const card = cardByCode.get(transaction.gift_card_id);
                  return (
                    <tr key={transaction.id} className="hover:bg-[var(--muted)]/30">
                      <td className="px-4 py-3 text-muted-foreground">{when(transaction.created_at)}</td>
                      <td className="px-4 py-3 font-mono text-[0.58rem]">
                        {card ? formatGiftCardCode(card.code) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Pill value={transaction.kind} />
                      </td>
                      <td className="px-4 py-3 tabular-nums">{formatBDT(transaction.amount)}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {transaction.balance_after == null ? "—" : formatBDT(transaction.balance_after)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[0.56rem] text-muted-foreground">
                        {transaction.order_no ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{transaction.actor_email ?? "system"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {issueOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-midnight/55 backdrop-blur-sm"
            onClick={() => setIssueOpen(false)}
            aria-label="Close issue gift card"
          />
          <div className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-indigo">Issue</p>
                <h2 className="mt-1 font-display text-2xl">A new gift card.</h2>
              </div>
              <button
                type="button"
                onClick={() => setIssueOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Value (৳)</Label>
                <Input
                  type="number"
                  value={issue.amount}
                  onChange={(event) => setIssue({ ...issue, amount: event.target.value })}
                />
              </div>
              <div>
                <Label>Expiry (months)</Label>
                <Input
                  type="number"
                  value={issue.expiryMonths}
                  onChange={(event) => setIssue({ ...issue, expiryMonths: event.target.value })}
                />
              </div>
              <div>
                <Label>Recipient name</Label>
                <Input
                  value={issue.recipientName}
                  onChange={(event) => setIssue({ ...issue, recipientName: event.target.value })}
                />
              </div>
              <div>
                <Label>Delivery</Label>
                <Select
                  value={issue.delivery}
                  onChange={(event) =>
                    setIssue({ ...issue, delivery: event.target.value as "email" | "whatsapp" })
                  }
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Recipient contact</Label>
                <Input
                  value={issue.recipientContact}
                  onChange={(event) => setIssue({ ...issue, recipientContact: event.target.value })}
                  placeholder={issue.delivery === "whatsapp" ? "01XXXXXXXXX" : "name@example.com"}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Sender name</Label>
                <Input
                  value={issue.senderName}
                  onChange={(event) => setIssue({ ...issue, senderName: event.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Message</Label>
                <Textarea
                  value={issue.message}
                  onChange={(event) => setIssue({ ...issue, message: event.target.value })}
                  className="min-h-20"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Internal note</Label>
                <Input
                  value={issue.note}
                  onChange={(event) => setIssue({ ...issue, note: event.target.value })}
                  placeholder="Payment reference, request reference, etc."
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[0.62rem] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={issue.isDemo}
                  onChange={(event) => setIssue({ ...issue, isDemo: event.target.checked })}
                  className="h-4 w-4 accent-[var(--color-indigo)]"
                />
                Demo card
              </label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIssueOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={issueCard} disabled={saving}>
                  {saving ? "Issuing…" : "Issue gift card"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
