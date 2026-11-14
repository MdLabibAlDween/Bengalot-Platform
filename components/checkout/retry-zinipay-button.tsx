"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

export function RetryZinipayButton({
  orderNumber,
  label = "Pay now",
}: {
  orderNumber: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function retry() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payments/zinipay/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = (await response.json()) as {
        paymentUrl?: string;
        message?: string;
      };
      if (!response.ok || !data.paymentUrl) {
        throw new Error(data.message ?? "The payment page could not open.");
      }
      window.location.assign(data.paymentUrl);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The payment page could not open.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={retry}
        disabled={loading}
        className="btn btn-butter btn-lg"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw className="size-4" aria-hidden="true" />
        )}
        {loading ? "Opening ZiniPay" : label}
      </button>
      {error ? (
        <p className="mt-2 max-w-xs text-[0.66rem] leading-relaxed text-butter/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
