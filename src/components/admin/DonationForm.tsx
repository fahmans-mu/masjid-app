"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { saveDonationAction } from "@/app/admin/(panel)/(aktif)/donasi/actions";
import type { Donation } from "@/lib/schema";
import { todayISO } from "@/lib/format";

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

export function DonationForm({
  donation,
  programs,
  categories,
}: {
  donation?: Donation;
  programs: { id: number; title: string }[];
  categories: { id: number; name: string }[];
}) {
  return (
    <ActionForm action={saveDonationAction} className="space-y-5">
      {donation && <input type="hidden" name="id" value={donation.id} />}

      {!donation && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Input manual oleh bendahara langsung tercatat sebagai{" "}
          <span className="font-semibold">terverifikasi</span> dan akan muncul di
          laporan publik.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="df-name" className={labelCls}>
            Nama donatur
          </label>
          <input
            id="df-name"
            name="donorName"
            type="text"
            defaultValue={donation?.donorName ?? "Hamba Allah"}
            maxLength={100}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="df-phone" className={labelCls}>
            No. HP / WA <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            id="df-phone"
            name="donorPhone"
            type="tel"
            defaultValue={donation?.donorPhone ?? ""}
            maxLength={30}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="df-amount" className={labelCls}>
            Nominal (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            id="df-amount"
            name="amount"
            type="number"
            min={1000}
            step={1000}
            required
            defaultValue={donation?.amount ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="df-date" className={labelCls}>
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            id="df-date"
            name="donatedAt"
            type="date"
            required
            defaultValue={donation?.donatedAt ?? todayISO()}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="df-method" className={labelCls}>
            Metode
          </label>
          <select
            id="df-method"
            name="method"
            defaultValue={donation?.method ?? "transfer"}
            className={`${inputCls} bg-white`}
          >
            <option value="transfer">Transfer bank</option>
            <option value="qris">QRIS</option>
            <option value="cash">Tunai</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="df-program" className={labelCls}>
            Program donasi
          </label>
          <select
            id="df-program"
            name="programId"
            defaultValue={donation?.programId ? String(donation.programId) : ""}
            className={`${inputCls} bg-white`}
          >
            <option value="">— Tanpa program —</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="df-category" className={labelCls}>
            Kategori pemasukan{" "}
            <span className="font-normal text-slate-400">(untuk donasi umum)</span>
          </label>
          <select
            id="df-category"
            name="categoryId"
            defaultValue={donation?.categoryId ? String(donation.categoryId) : ""}
            className={`${inputCls} bg-white`}
          >
            <option value="">— Tanpa kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Wajib pilih salah satu: program atau kategori.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="df-note" className={labelCls}>
            Keterangan <span className="font-normal text-slate-400">(internal, tidak tampil publik)</span>
          </label>
          <input
            id="df-note"
            name="note"
            type="text"
            maxLength={500}
            defaultValue={donation?.note ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="df-proof" className={labelCls}>
            Bukti transfer <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            id="df-proof"
            name="proof"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
          />
          {donation?.proofUrl && (
            <a
              href={donation.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-block text-xs font-semibold text-emerald-700 hover:underline"
            >
              Lihat bukti saat ini →
            </a>
          )}
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton pendingText="Menyimpan donasi...">
          {donation ? "Simpan Perubahan" : "Simpan Donasi"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
