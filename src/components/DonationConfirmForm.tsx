"use client";

import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { confirmDonationAction } from "@/app/(public)/actions";
import { todayISO } from "@/lib/format";

export function DonationConfirmForm({
  programs,
  categories,
  defaultProgramId = null,
}: {
  programs: { id: number; title: string; type: string }[];
  categories: { id: number; name: string }[];
  defaultProgramId?: number | null;
}) {
  return (
    <ActionForm action={confirmDonationAction} className="space-y-4" resetOnSuccess>
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dc-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nama donatur
          </label>
          <input
            id="dc-name"
            name="donorName"
            type="text"
            defaultValue="Hamba Allah"
            maxLength={100}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <p className="mt-1 text-xs text-slate-400">
            Boleh dikosongkan / tulis &ldquo;Hamba Allah&rdquo; jika ingin anonim.
          </p>
        </div>
        <div>
          <label htmlFor="dc-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            No. HP / WhatsApp <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            id="dc-phone"
            name="donorPhone"
            type="tel"
            maxLength={30}
            placeholder="08xx-xxxx-xxxx"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dc-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nominal donasi <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              Rp
            </span>
            <input
              id="dc-amount"
              name="amount"
              type="number"
              min={1000}
              step={1000}
              required
              inputMode="numeric"
              placeholder="100000"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
        <div>
          <label htmlFor="dc-date" className="mb-1.5 block text-sm font-medium text-slate-700">
            Tanggal transfer
          </label>
          <input
            id="dc-date"
            name="donatedAt"
            type="date"
            defaultValue={todayISO()}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dc-method" className="mb-1.5 block text-sm font-medium text-slate-700">
            Metode
          </label>
          <select
            id="dc-method"
            name="method"
            defaultValue="transfer"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="transfer">Transfer bank</option>
            <option value="qris">QRIS</option>
            <option value="cash">Tunai (di masjid)</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
        <div>
          <label htmlFor="dc-program" className="mb-1.5 block text-sm font-medium text-slate-700">
            Program donasi
          </label>
          <select
            id="dc-program"
            name="programId"
            defaultValue={defaultProgramId ? String(defaultProgramId) : ""}
            disabled={defaultProgramId !== null}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">— Untuk donasi umum —</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {defaultProgramId !== null && (
            <input type="hidden" name="programId" value={defaultProgramId} />
          )}
        </div>
      </div>

      <div>
        <label htmlFor="dc-category" className="mb-1.5 block text-sm font-medium text-slate-700">
          Kategori donasi umum <span className="font-normal text-slate-400">(jika tanpa program)</span>
        </label>
        <select
          id="dc-category"
          name="categoryId"
          defaultValue=""
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">— Pilih kategori —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dc-note" className="mb-1.5 block text-sm font-medium text-slate-700">
            Keterangan <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            id="dc-note"
            name="note"
            type="text"
            maxLength={500}
            placeholder="cth: transfer via BSI a.n. Budi"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label htmlFor="dc-proof" className="mb-1.5 block text-sm font-medium text-slate-700">
            Bukti transfer <span className="font-normal text-slate-400">(disarankan)</span>
          </label>
          <input
            id="dc-proof"
            name="proof"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
          />
          <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP, atau PDF. Maks 5MB.</p>
        </div>
      </div>

      <SubmitButton className="w-full sm:w-auto" pendingText="Mengirim konfirmasi...">
        Kirim Konfirmasi Donasi
      </SubmitButton>
    </ActionForm>
  );
}
