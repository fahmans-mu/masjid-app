"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { addQurbanDepositAction } from "@/app/admin/(panel)/(aktif)/qurban/actions";

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

export function QurbanDepositForm({
  participantId,
  today,
}: {
  participantId: number;
  today: string;
}) {
  return (
    <ActionForm action={addQurbanDepositAction} className="space-y-4" resetOnSuccess>
      <input type="hidden" name="participantId" value={participantId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="qd-amount" className={labelCls}>
            Nominal setoran (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            id="qd-amount"
            name="amount"
            type="number"
            min={1000}
            step={1000}
            required
            placeholder="500000"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="qd-date" className={labelCls}>
            Tanggal setor <span className="text-red-500">*</span>
          </label>
          <input
            id="qd-date"
            name="depositedAt"
            type="date"
            required
            defaultValue={today}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="qd-method" className={labelCls}>
            Metode
          </label>
          <select id="qd-method" name="method" defaultValue="cash" className={`${inputCls} bg-white`}>
            <option value="cash">Tunai</option>
            <option value="transfer">Transfer Bank</option>
            <option value="qris">QRIS</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="qd-note" className={labelCls}>
          Catatan <span className="font-normal text-slate-400">(opsional)</span>
        </label>
        <input
          id="qd-note"
          name="note"
          type="text"
          maxLength={500}
          placeholder="cth: setoran ke-3, titip lewat pak Ahmad"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="qd-proof" className={labelCls}>
          Bukti setoran <span className="font-normal text-slate-400">(opsional)</span>
        </label>
        <input
          id="qd-proof"
          name="proof"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
        />
        <p className="mt-1 text-xs text-slate-400">JPG/PNG/WEBP maks 5MB.</p>
      </div>

      <SubmitButton pendingText="Menyimpan setoran...">Catat Setoran</SubmitButton>
    </ActionForm>
  );
}
