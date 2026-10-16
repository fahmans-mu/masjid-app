"use client";

import { useState } from "react";
import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { submitAppInfaqAction } from "@/app/(platform)/infaq/actions";
import { formatRupiah, monthLabel } from "@/lib/format";

export function AppInfaqForm({
  mosques,
  monthlyAmount,
  lockedMosqueId,
}: {
  mosques: { id: number; name: string; slug: string }[];
  monthlyAmount: number;
  lockedMosqueId?: number;
}) {
  const [months, setMonths] = useState<1 | 6 | 12>(1);
  const amount = monthlyAmount * months;

  return (
    <ActionForm action={submitAppInfaqAction} className="space-y-4" resetOnSuccess>
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {lockedMosqueId ? (
        <input type="hidden" name="mosqueId" value={lockedMosqueId} />
      ) : (
        <div>
          <label htmlFor="if-mosque" className="mb-1.5 block text-sm font-medium text-slate-700">
            Masjid <span className="text-red-500">*</span>
          </label>
          <select
            id="if-mosque"
            name="mosqueId"
            required
            defaultValue=""
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="" disabled>
              — Pilih masjid —
            </option>
            {mosques.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (/m/{m.slug})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Durasi infaq aplikasi
        </span>
        <div className="grid gap-3 sm:grid-cols-3">
          {([1, 6, 12] as const).map((mo) => (
            <label
              key={mo}
              className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                months === mo
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-emerald-300"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="months"
                  value={mo}
                  checked={months === mo}
                  onChange={() => setMonths(mo)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {mo === 1 ? "1 bulan" : mo === 6 ? "6 bulan" : "12 bulan"}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {formatRupiah(monthlyAmount * mo)}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Total transfer: <span className="text-base font-bold">{formatRupiah(amount)}</span>{" "}
        untuk {months} bulan ({monthLabel(new Date().toISOString().slice(0, 7))} dst.)
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="if-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nama pengirim <span className="text-red-500">*</span>
          </label>
          <input
            id="if-name"
            name="senderName"
            type="text"
            required
            maxLength={100}
            placeholder="cth: Bendahara Masjid Al-Ikhlas"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label htmlFor="if-method" className="mb-1.5 block text-sm font-medium text-slate-700">
            Metode
          </label>
          <select
            id="if-method"
            name="method"
            defaultValue="transfer"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="transfer">Transfer bank</option>
            <option value="qris">QRIS</option>
            <option value="cash">Tunai</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="if-note" className="mb-1.5 block text-sm font-medium text-slate-700">
            Catatan <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            id="if-note"
            name="note"
            type="text"
            maxLength={500}
            placeholder="cth: transfer via BCA a.n. Ahmad"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label htmlFor="if-proof" className="mb-1.5 block text-sm font-medium text-slate-700">
            Bukti pembayaran <span className="text-red-500">*</span>
          </label>
          <input
            id="if-proof"
            name="proof"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
          />
          <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP, atau PDF. Maks 5MB.</p>
        </div>
      </div>

      <SubmitButton className="w-full sm:w-auto" pendingText="Mengirim konfirmasi...">
        Kirim Konfirmasi Infaq
      </SubmitButton>
    </ActionForm>
  );
}
