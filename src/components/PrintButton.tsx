"use client";

import { Printer } from "lucide-react";

export function PrintButton({
  label = "Cetak / Simpan PDF",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ||
        "no-print inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      }
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
