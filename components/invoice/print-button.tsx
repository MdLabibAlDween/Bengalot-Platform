"use client";

import { Printer } from "lucide-react";

export function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-midnight px-5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-ivory print:hidden"
    >
      <Printer className="h-4 w-4" /> Print / save PDF
    </button>
  );
}
