"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { Alert } from "./Alert";
import { createMayarDonationAction } from "@/app/m/[mosque]/program/[slug]/actions";
import { formatRupiah } from "@/lib/format";

const PRESETS = [50_000, 100_000, 250_000, 500_000];

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export function MayarDonateForm({
  mosqueId,
  programId,
  programTitle,
}: {
  mosqueId: number;
  programId: number;
  programTitle: string;
}) {
  const [state, formAction] = useActionState(createMayarDonationAction, null);
  const [amount, setAmount] = useState("100000");

  const numeric = Number(amount.replace(/\D/g, "")) || 0;

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="mosqueId" value={mosqueId} />
      <input type="hidden" name="programId" value={programId} />
      <input type="hidden" name="amount" value={numeric} />

      {state?.error && <Alert kind="error">{state.error}</Alert>}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Pilih nominal</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => {
            const active = numeric === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400"
                }`}
              >
                {formatRupiah(p)}
              </button>
            );
          })}
        </div>
        <label htmlFor="my-amount" className="mt-3 mb-1.5 block text-xs font-medium text-slate-500">
          Nominal lain
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
            Rp
          </span>
          <input
            id="my-amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 12))}
            className={`${inputCls} pl-9`}
            placeholder="100000"
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Tagihan: <span className="font-semibold text-slate-600">{formatRupiah(numeric)}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="my-name" className="mb-1.5 block text-xs font-medium text-slate-500">
            Nama donatur
          </label>
          <input
            id="my-name"
            name="donorName"
            type="text"
            maxLength={100}
            placeholder="Hamba Allah"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="my-phone" className="mb-1.5 block text-xs font-medium text-slate-500">
            No. WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            id="my-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            placeholder="08xxxxxxxxxx"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="my-email" className="mb-1.5 block text-xs font-medium text-slate-500">
          Email <span className="text-slate-400">(opsional, untuk bukti pembayaran)</span>
        </label>
        <input
          id="my-email"
          name="email"
          type="email"
          className={inputCls}
          placeholder="nama@email.com"
        />
      </div>

      <MayarSubmitButton />

      <p className="flex items-start gap-1.5 text-xs text-slate-500">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
        <span>
          Anda akan diarahkan ke halaman pembayaran Mayar. Donasi untuk{" "}
          <span className="font-medium">{programTitle}</span> tercatat otomatis setelah
          pembayaran berhasil.
        </span>
      </p>
    </form>
  );
}

function MayarSubmitButton() {
  // useFormStatus harus dipakai di komponen anak dari <form>
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Mengarahkan ke Mayar...
        </>
      ) : (
        "Bayar Sekarang"
      )}
    </button>
  );
}