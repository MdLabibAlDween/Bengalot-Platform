"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Copy,
  Download,
  Inbox,
  Mail,
  MessageCircle,
  RotateCcw,
  Search,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn, formatBDT } from "@/lib/utils";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  admin_note: string | null;
  created_at: string;
};

type SupportMessage = {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  order_no: string | null;
  status: "new" | "open" | "replied" | "closed";
  admin_note: string | null;
  created_at: string;
};

type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  source: string;
  created_at: string;
};

type ReturnRequest = {
  id: string;
  order_no: string;
  customer_name: string;
  phone: string;
  email: string | null;
  reason: string;
  details: string | null;
  items: { name?: string; qty?: number; price?: number }[] | null;
  status: "requested" | "approved" | "rejected" | "received" | "refunded" | "closed";
  admin_note: string | null;
  created_at: string;
};

type Tab = "contact" | "support" | "returns" | "newsletter";

const tabs: { key: Tab; label: string; icon: typeof Inbox }[] = [
  { key: "contact", label: "Contact", icon: Mail },
  { key: "support", label: "Support", icon: MessageCircle },
  { key: "returns", label: "Returns", icon: RotateCcw },
  { key: "newsletter", label: "Newsletter", icon: Users },
];

const statusTones: Record<string, string> = {
  new: "bg-magenta/10 text-magenta",
  read: "bg-[var(--muted)] text-muted-foreground",
  replied: "bg-jade/10 text-jade",
  closed: "bg-stone/10 text-stone-600",
  open: "bg-indigo/10 text-indigo",
  requested: "bg-saffron/15 text-gold-ink",
  approved: "bg-jade/10 text-jade",
  rejected: "bg-rosewood/10 text-rosewood",
  received: "bg-indigo/10 text-indigo",
  refunded: "bg-teal/10 text-teal",
  subscribed: "bg-jade/10 text-jade",
  unsubscribed: "bg-rosewood/10 text-rosewood",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-[0.46rem] font-bold uppercase tracking-[0.08em]",
        statusTones[status] ?? "bg-[var(--muted)] text-muted-foreground"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function when(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function whatsapp(phone: string | null | undefined) {
  const clean = digits(phone ?? "");
  if (!clean) return null;
  return `https://wa.me/${clean.startsWith("880") ? clean : `88${clean}`}`;
}

export function InboxManager({
  initial,
}: {
  initial: {
    contact: ContactMessage[];
    support: SupportMessage[];
    newsletter: NewsletterSubscriber[];
    returns: ReturnRequest[];
  };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("contact");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.contact[0]?.id ?? null
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const lists = {
    contact: initial.contact,
    support: initial.support,
    returns: initial.returns,
    newsletter: initial.newsletter,
  };

  const newCount = initial.contact.filter((row) => row.status === "new").length;
  const pendingReturns = initial.returns.filter((row) => row.status === "requested").length;
  const subscribers = initial.newsletter.filter((row) => row.status === "subscribed").length;

  const switchTab = (next: Tab) => {
    setTab(next);
    setStatusFilter("all");
    setQuery("");
    const first = lists[next][0];
    setSelectedId(first?.id ?? null);
    setNote("");
  };

  const current = lists[tab];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return current.filter((row) => {
      const status = "status" in row ? row.status : "";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!needle) return true;
      const values =
        tab === "newsletter"
          ? [(row as NewsletterSubscriber).email, (row as NewsletterSubscriber).source]
          : tab === "returns"
            ? [
                (row as ReturnRequest).order_no,
                (row as ReturnRequest).customer_name,
                (row as ReturnRequest).phone,
                (row as ReturnRequest).reason,
              ]
            : [
                (row as ContactMessage).name,
                (row as ContactMessage).email,
                (row as ContactMessage).subject,
                (row as ContactMessage).message,
              ];
      return values.join(" ").toLowerCase().includes(needle);
    });
  }, [current, query, statusFilter, tab]);

  const selected =
    tab === "newsletter"
      ? null
      : (filtered.find((row) => row.id === selectedId) ?? filtered[0] ?? null);

  const update = async (kind: Tab, id: string, status: string, adminNote?: string) => {
    setSaving(true);
    const response = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, status, note: adminNote || note || undefined }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      toast.error(result.error ?? "Could not update the message.");
      return;
    }
    toast.success("Inbox updated");
    setNote("");
    router.refresh();
  };

  const copyEmails = async () => {
    const emails = initial.newsletter
      .filter((row) => row.status === "subscribed")
      .map((row) => row.email);
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      toast.success(`${emails.length} subscriber emails copied`);
    } catch {
      toast.error("Could not copy emails.");
    }
  };

  const exportSubscribers = () => {
    const rows = [
      ["Email", "Status", "Source", "Joined"],
      ...initial.newsletter.map((row) => [
        row.email,
        row.status,
        row.source,
        new Date(row.created_at).toISOString(),
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
    link.download = `bengalot-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedContact = tab === "contact" ? (selected as ContactMessage | null) : null;
  const selectedSupport = tab === "support" ? (selected as SupportMessage | null) : null;
  const selectedReturn = tab === "returns" ? (selected as ReturnRequest | null) : null;
  const selectedEmail = selectedContact?.email ?? selectedSupport?.email ?? "";
  const selectedPhone = selectedContact?.phone ?? selectedSupport?.phone ?? "";
  const mailto = selectedEmail
    ? `mailto:${selectedEmail}?subject=${encodeURIComponent(
        `Re: ${selectedContact?.subject ?? selectedSupport?.subject ?? "Your message"}`
      )}`
    : null;
  const waLink = whatsapp(selectedPhone);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "New messages", value: newCount, helper: "Contact queue", icon: Inbox, tone: "magenta" },
          { label: "Support threads", value: initial.support.filter((row) => row.status === "new").length, helper: "Waiting for a reply", icon: MessageCircle, tone: "indigo" },
          { label: "Return claims", value: pendingReturns, helper: "Requested", icon: RotateCcw, tone: "saffron" },
          { label: "Subscribers", value: subscribers, helper: `${initial.newsletter.length} total signups`, icon: Users, tone: "jade" },
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
                <p className="mt-2 font-display text-[1.8rem] leading-none tabular-nums">{value}</p>
              </div>
              <span
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full",
                  tone === "magenta"
                    ? "bg-magenta/10 text-magenta"
                    : tone === "indigo"
                      ? "bg-indigo/10 text-indigo"
                      : tone === "saffron"
                        ? "bg-saffron/15 text-gold-ink"
                        : "bg-jade/10 text-jade"
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
          <div className="flex flex-wrap gap-1">
            {tabs.map((entry) => {
              const count =
                entry.key === "contact"
                  ? newCount
                  : entry.key === "support"
                    ? initial.support.filter((row) => row.status === "new").length
                    : entry.key === "returns"
                      ? pendingReturns
                      : subscribers;
              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => switchTab(entry.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.08em] transition",
                    tab === entry.key
                      ? "bg-midnight text-ivory"
                      : "text-muted-foreground hover:bg-[var(--muted)]"
                  )}
                >
                  <entry.icon className="h-3.5 w-3.5" />
                  {entry.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[0.44rem]",
                        tab === entry.key ? "bg-ivory/15 text-ivory" : "bg-magenta/10 text-magenta"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search inbox"
                className="h-9 w-[190px] pl-9 text-[0.66rem]"
              />
            </div>
            {tab !== "newsletter" && (
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="field h-9 w-[130px] py-0 text-[0.62rem]"
                aria-label="Filter by status"
              >
                <option value="all">All status</option>
                {tab === "contact" &&
                  ["new", "read", "replied", "closed"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                {tab === "support" &&
                  ["new", "open", "replied", "closed"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                {tab === "returns" &&
                  ["requested", "approved", "rejected", "received", "refunded", "closed"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        {tab === "newsletter" ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
              <p className="text-[0.58rem] text-muted-foreground">
                {subscribers} active subscriber{subscribers === 1 ? "" : "s"} ·{" "}
                {initial.newsletter.length} total
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copyEmails}>
                  <Copy className="h-3.5 w-3.5" /> Copy emails
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={exportSubscribers}>
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-[var(--muted)] text-[0.46rem] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    {["Email", "Status", "Source", "Joined", ""].map((head) => (
                      <th key={head} className="px-4 py-2.5">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-[0.64rem]">
                  {filtered.map((row) => {
                    const subscriber = row as NewsletterSubscriber;
                    return (
                      <tr key={subscriber.id} className="hover:bg-[var(--muted)]/30">
                        <td className="px-4 py-3 font-medium">{subscriber.email}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={subscriber.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{subscriber.source}</td>
                        <td className="px-4 py-3 text-muted-foreground">{when(subscriber.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              update(
                                "newsletter",
                                subscriber.id,
                                subscriber.status === "subscribed" ? "unsubscribed" : "subscribed"
                              )
                            }
                            disabled={saving}
                            className="text-[0.52rem] font-bold uppercase tracking-[0.08em] text-indigo hover:underline"
                          >
                            {subscriber.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[540px] lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="max-h-[680px] divide-y divide-[var(--color-border)] overflow-y-auto border-b border-[var(--color-border)] lg:border-b-0 lg:border-r">
              {filtered.length === 0 ? (
                <div className="grid h-full min-h-[300px] place-items-center p-8 text-center">
                  <div>
                    <Inbox className="mx-auto h-7 w-7 text-muted-foreground/35" />
                    <p className="mt-3 font-display text-xl">No messages here.</p>
                    <p className="mt-1 text-[0.64rem] text-muted-foreground">
                      New {tab} messages will appear in this queue.
                    </p>
                  </div>
                </div>
              ) : (
                filtered.map((row) => {
                  const contact = tab === "contact" ? (row as ContactMessage) : null;
                  const support = tab === "support" ? (row as SupportMessage) : null;
                  const ret = tab === "returns" ? (row as ReturnRequest) : null;
                  const id = row.id;
                  const active = selected?.id === id;
                  const status = contact?.status ?? support?.status ?? ret?.status ?? "";
                  const title = contact?.name ?? support?.name ?? ret?.customer_name ?? "";
                  const subject = contact?.subject ?? support?.subject ?? ret?.reason ?? "";
                  const preview =
                    contact?.message ?? support?.message ?? ret?.details ?? "";
                  const isUnread = status === "new" || status === "requested";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedId(id);
                        setNote("");
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition",
                        active ? "bg-indigo/[0.055]" : "hover:bg-[var(--muted)]/30"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          isUnread ? "bg-magenta" : "bg-[var(--border)]"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[0.7rem] font-semibold">{title}</span>
                          <span className="shrink-0 text-[0.5rem] text-muted-foreground">
                            {new Date(row.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[0.58rem] text-muted-foreground">
                          {subject}
                        </span>
                        <span className="mt-1 block line-clamp-1 text-[0.56rem] text-muted-foreground/75">
                          {preview}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <StatusPill status={status} />
                          {ret && (
                            <span className="font-mono text-[0.5rem] text-muted-foreground">
                              {ret.order_no}
                            </span>
                          )}
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/35" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="max-h-[680px] overflow-y-auto p-5">
              {!selected ? (
                <div className="grid h-full min-h-[280px] place-items-center text-center">
                  <div>
                    <Mail className="mx-auto h-7 w-7 text-muted-foreground/35" />
                    <p className="mt-3 font-display text-xl">Select a message.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusPill
                      status={
                        selectedContact?.status ??
                        selectedSupport?.status ??
                        selectedReturn?.status ??
                        ""
                      }
                    />
                    <span className="text-[0.52rem] text-muted-foreground">
                      {when(selected.created_at)}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl leading-tight">
                    {selectedContact?.name ??
                      selectedSupport?.name ??
                      selectedReturn?.customer_name}
                  </h2>
                  <p className="mt-1 text-[0.66rem] font-semibold text-indigo">
                    {selectedContact?.subject ??
                      selectedSupport?.subject ??
                      selectedReturn?.reason}
                  </p>

                  <div className="mt-3 space-y-1 text-[0.62rem] text-muted-foreground">
                    {selectedEmail && <p>{selectedEmail}</p>}
                    {selectedPhone && <p>{selectedPhone}</p>}
                    {selectedSupport?.order_no && (
                      <p className="font-mono">Order · {selectedSupport.order_no}</p>
                    )}
                    {selectedReturn?.order_no && (
                      <p className="font-mono">Order · {selectedReturn.order_no}</p>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/35 p-3.5 text-[0.68rem] leading-relaxed">
                    {selectedContact?.message ??
                      selectedSupport?.message ??
                      selectedReturn?.details ??
                      "No additional details."}
                  </div>

                  {selectedReturn?.items && selectedReturn.items.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Items
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {selectedReturn.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-[0.6rem]"
                          >
                            <span>
                              {item.qty ?? 1}× {item.name ?? "Item"}
                            </span>
                            {typeof item.price === "number" && (
                              <span className="tabular-nums">{formatBDT(item.price)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mailto && (
                      <Button asChild variant="gold" size="sm">
                        <a href={mailto}>
                          <Send className="h-3.5 w-3.5" /> Reply by email
                        </a>
                      </Button>
                    )}
                    {waLink && (
                      <Button asChild variant="outline" size="sm">
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="mt-5 border-t border-[var(--border)] pt-4">
                    <p className="text-[0.5rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Internal note
                    </p>
                    <Textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Add context for the team…"
                      className="mt-2 min-h-20 text-[0.66rem]"
                    />
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tab === "contact" &&
                        ["read", "replied", "closed"].map((status) => (
                          <Button
                            key={status}
                            type="button"
                            size="sm"
                            variant={status === "replied" ? "gold" : "outline"}
                            disabled={saving}
                            onClick={() => update("contact", selected.id, status)}
                          >
                            Mark {status}
                          </Button>
                        ))}
                      {tab === "support" &&
                        ["open", "replied", "closed"].map((status) => (
                          <Button
                            key={status}
                            type="button"
                            size="sm"
                            variant={status === "replied" ? "gold" : "outline"}
                            disabled={saving}
                            onClick={() => update("support", selected.id, status)}
                          >
                            Mark {status}
                          </Button>
                        ))}
                      {tab === "returns" &&
                        ["approved", "rejected", "received", "refunded", "closed"].map((status) => (
                          <Button
                            key={status}
                            type="button"
                            size="sm"
                            variant={status === "approved" ? "gold" : "outline"}
                            disabled={saving}
                            onClick={() => update("returns", selected.id, status)}
                          >
                            {status}
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
