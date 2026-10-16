"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { saveExpenseAction } from "@/app/admin/(panel)/pengeluaran/actions";
import type { Expense } from "@/lib/schema";
import { todayISO } from "@/lib/format";

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

export function ExpenseForm({
  expense,
  categories,
  programs,
}: {
  expense?: Expense;
  categories: { id: number; name: string }[];
  programs: { id: number; title: string }[];
}) {
  return (
    <ActionForm action={saveExpenseAction} className="space-y-5">
      {expense && <input type="hidden" name="id" value={expense.id} />}

      <div>
        <label htmlFor="ef-desc" className={labelCls}>
          Keterangan <span className="text-red-500">*</span>
        </label>
        <input
          id="ef-desc"
          name="description"
          type="text"
          required
          maxLength={200}
          defaultValue={expense?.description ?? ""}
          placeholder="cth: Tagihan listrik & PDAM bulan September"
          className={inputCls}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="ef-amount" className={labelCls}>
            Nominal (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            id="ef-amount"
            name="amount"
            type="number"
            min={1000}
            step={1000}
            required
            defaultValue={expense?.amount ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="ef-date" className={labelCls}>
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            id="ef-date"
            name="spentAt"
            type="date"
            required
            defaultValue={expense?.spentAt ?? todayISO()}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="ef-category" className={labelCls}>
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            id="ef-category"
            name="categoryId"
            required
            defaultValue={expense?.categoryId ? String(expense.categoryId) : ""}
            className={`${inputCls} bg-white`}
          >
            <option value="">— Pilih kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ef-program" className={labelCls}>
            Alokasi ke program{" "}
            <span className="font-normal text-slate-400">
              (jika dana campaign tertentu)
            </span>
          </label>
          <select
            id="ef-program"
            name="programId"
            defaultValue={expense?.programId ? String(expense.programId) : ""}
            className={`${inputCls} bg-white`}
          >
            <option value="">— Pengeluaran umum —</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ef-receipt" className={labelCls}>
            Nota / bukti pengeluaran{" "}
            <span className="font-normal text-slate-400">(disarankan)</span>
          </label>
          <input
            id="ef-receipt"
            name="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
          />
          {expense?.receiptUrl && (
            <a
              href={expense.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-block text-xs font-semibold text-emerald-700 hover:underline"
            >
              Lihat nota saat ini →
            </a>
          )}
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton pendingText="Menyimpan pengeluaran...">
          {expense ? "Simpan Perubahan" : "Simpan Pengeluaran"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
