"use client";

import {
  ExternalLink,
  KeyRound,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Entitlement, Product } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type EntitlementRow = Entitlement & { product: Product | null };

export function AdminUserAccess({
  userId,
  entitlements,
  products,
  canManage,
}: {
  userId: string;
  entitlements: EntitlementRow[];
  products: Pick<Product, "id" | "title" | "type" | "slug">[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [busy, setBusy] = useState("");
  const [state, setState] = useState<"idle" | "error" | "ok">("idle");
  const [message, setMessage] = useState("");

  async function post(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/users/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { message?: string; ok?: boolean };
    if (!response.ok || !data.ok) {
      throw new Error(data.message ?? "The action could not be completed.");
    }
  }

  async function grant() {
    if (!productId) return;
    setBusy("grant");
    setState("idle");
    try {
      await post({ action: "grant", userId, productId });
      setState("ok");
      setMessage("Library access granted. It is live in their account now.");
      setProductId("");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not grant access.");
    } finally {
      setBusy("");
    }
  }

  async function act(
    action: "revoke" | "refresh",
    entitlementId: string,
  ) {
    setBusy(`${action}-${entitlementId}`);
    setState("idle");
    try {
      await post({ action, userId, entitlementId });
      setState("ok");
      setMessage(
        action === "revoke"
          ? "Access removed from their library."
          : "Access link refreshed from the product delivery file.",
      );
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not update access.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-4">
      {message ? (
        <div
          role={state === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-2.5 text-[0.7rem] font-medium ${
            state === "error"
              ? "border-coral/30 bg-coral/[0.08] text-coral-deep"
              : "border-teal/20 bg-teal-soft/40 text-teal"
          }`}
        >
          {message}
        </div>
      ) : null}

      {canManage ? (
        <div className="rounded-[1.2rem] border border-line bg-cream p-4">
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-muted">
            Grant a product
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="field"
              aria-label="Product to grant"
            >
              <option value="">Choose a product…</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title} · {product.type}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={grant}
              disabled={!productId || busy === "grant"}
              className="btn btn-primary btn-sm shrink-0"
            >
              {busy === "grant" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="size-3.5" aria-hidden="true" />
              )}
              Grant access
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[1.2rem] border border-line bg-cream">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.12em] text-muted">
            Library — {entitlements.length} resource{entitlements.length === 1 ? "" : "s"}
          </p>
        </div>
        {entitlements.length ? (
          <div className="divide-y divide-line">
            {entitlements.map((entitlement) => (
              <div key={entitlement.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.72rem] font-semibold text-ink">
                    {entitlement.title}
                  </p>
                  <p className="mt-0.5 text-[0.58rem] text-muted">
                    {entitlement.access_label} · granted {formatDate(entitlement.granted_at)}
                  </p>
                  {entitlement.access_url ? (
                    <a
                      href={entitlement.access_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-[0.56rem] font-semibold text-teal hover:underline"
                    >
                      <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                      Open delivery link
                    </a>
                  ) : null}
                </div>
                {canManage ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => act("refresh", entitlement.id)}
                      disabled={Boolean(busy)}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-ink-soft hover:border-teal hover:text-teal disabled:opacity-40"
                    >
                      {busy === `refresh-${entitlement.id}` ? (
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                      ) : (
                        <RefreshCw className="size-3" aria-hidden="true" />
                      )}
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => act("revoke", entitlement.id)}
                      disabled={Boolean(busy)}
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[0.55rem] font-bold text-muted hover:border-coral/40 hover:text-coral disabled:opacity-40"
                    >
                      <Trash2 className="size-3" aria-hidden="true" />
                      Revoke
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-10 text-center text-[0.7rem] text-muted">
            No library access yet. Grant a product above.
          </p>
        )}
      </div>
    </div>
  );
}
