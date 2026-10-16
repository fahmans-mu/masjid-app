import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { requireMosqueSession } from "@/lib/auth";
import {
  distinctTransactionPeriods,
  listCategories,
  listExpenses,
} from "@/lib/queries";
import { formatDateID, formatRupiah, monthLabel } from "@/lib/format";
import { deleteExpenseAction } from "./actions";

export const metadata: Metadata = { title: "Pengeluaran" };

export default async function AdminPengeluaranPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; category?: string; page?: string }>;
}) {
  const session = await requireMosqueSession();
  const mosqueId = session.mosqueId;
  const sp = await searchParams;
  const period = sp.period && /^\d{4}-\d{2}$/.test(sp.period) ? sp.period : undefined;
  const categoryId = sp.category ? Number(sp.category) || undefined : undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = listExpenses(mosqueId, { period, categoryId, page });
  const periods = distinctTransactionPeriods(mosqueId);
  const categories = listCategories(mosqueId, "expense");

  const baseParams = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { period, category: sp.category, ...extra };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return p.toString();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengeluaran</h1>
          <p className="mt-1 text-sm text-slate-500">
            Catat semua pengeluaran masjid beserta nota/buktinya.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/export/pengeluaran?${baseParams({})}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
          <Link
            href="/admin/pengeluaran/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Catat Pengeluaran
          </Link>
        </div>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div>
          <label htmlFor="e-period" className="mb-1 block text-xs font-medium text-slate-500">
            Bulan
          </label>
          <select
            id="e-period"
            name="period"
            defaultValue={period ?? ""}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua bulan</option>
            {periods.map((p) => (
              <option key={p} value={p}>
                {monthLabel(p)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="e-cat" className="mb-1 block text-xs font-medium text-slate-500">
            Kategori
          </label>
          <select
            id="e-cat"
            name="category"
            defaultValue={sp.category ?? ""}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Terapkan
        </button>
        {(period || sp.category) && (
          <Link
            href="/admin/pengeluaran"
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Reset filter
          </Link>
        )}
      </form>

      {data.rows.length === 0 ? (
        <EmptyState
          title="Belum ada pengeluaran"
          description="Pengeluaran yang dicatat akan tampil di sini dan otomatis masuk ke laporan bulanan."
        >
          <Link
            href="/admin/pengeluaran/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Catat Pengeluaran
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                    <th className="px-4 py-3 font-semibold">Keterangan</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">
                      Program
                    </th>
                    <th className="px-4 py-3 font-semibold">Kategori</th>
                    <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                    <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((e) => (
                    <tr key={e.id} className="border-b border-slate-100 last:border-0 align-top">
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {formatDateID(e.spentAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">{e.description}</p>
                        {e.createdBy && (
                          <p className="text-xs text-slate-400">dicatat oleh {e.createdBy}</p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3.5 text-slate-500 md:table-cell">
                        {e.programTitle ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge kind="rejected">{e.categoryName ?? "-"}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-slate-900">
                        {formatRupiah(e.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {e.receiptUrl && (
                            <a
                              href={e.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50"
                            >
                              Nota
                            </a>
                          )}
                          <Link
                            href={`/admin/pengeluaran/${e.id}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Edit
                          </Link>
                          <DeleteButton
                            action={deleteExpenseAction}
                            fields={{ id: e.id }}
                            confirmText={`Hapus pengeluaran "${e.description}" sebesar ${formatRupiah(e.amount)}?`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-slate-600">
                      Jumlah {data.total} pengeluaran
                      {period ? ` · ${monthLabel(period)}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {formatRupiah(data.totalAmount)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm">
              <Link
                href={`/admin/pengeluaran?${baseParams({ page: String(page - 1) })}`}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold ${
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
                }`}
              >
                ← Sebelumnya
              </Link>
              <span className="text-slate-500">
                Halaman {data.page} dari {data.totalPages}
              </span>
              <Link
                href={`/admin/pengeluaran?${baseParams({ page: String(page + 1) })}`}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold ${
                  page >= data.totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
                }`}
              >
                Berikutnya →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
