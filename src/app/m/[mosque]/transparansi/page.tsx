import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import {
  distinctTransactionPeriods,
  getMosqueBySlug,
  publicLedger,
} from "@/lib/queries";
import {
  currentPeriod,
  formatDateID,
  formatRupiah,
  isValidPeriod,
  maskDonorName,
  monthLabel,
} from "@/lib/format";
import { methodLabel } from "@/lib/action-utils";

export const metadata: Metadata = {
  title: "Buku Kas Terbuka",
};

export default async function TransparansiPage({
  params,
  searchParams,
}: {
  params: Promise<{ mosque: string }>;
  searchParams: Promise<{ period?: string; page?: string }>;
}) {
  const { mosque } = await params;
  const m = getMosqueBySlug(mosque);
  if (!m || !m.isActive) notFound();
  const basePath = `/m/${m.slug}`;

  const sp = await searchParams;
  const periods = distinctTransactionPeriods(m.id);
  const current = currentPeriod();

  const period =
    sp.period && isValidPeriod(sp.period)
      ? sp.period
      : periods.includes(current)
        ? current
        : (periods[0] ?? current);

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const ledger = publicLedger(m.id, period, page);
  const showNames = m.showDonorNames ?? true;

  const options = [...new Set([current, ...periods])].sort().reverse();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Buku Kas Terbuka — {m.name}
        </h1>
        <p className="mt-2 text-slate-500">
          Seluruh transaksi yang sudah diverifikasi bendahara, ditampilkan apa
          adanya. Donasi yang masih menunggu verifikasi belum muncul di sini.
        </p>
      </div>

      {/* Filter & ringkasan */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <form className="flex items-center gap-2" method="get">
          <label htmlFor="period" className="text-sm font-medium text-slate-600">
            Bulan:
          </label>
          <select
            id="period"
            name="period"
            defaultValue={period}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            {options.map((p) => (
              <option key={p} value={p}>
                {monthLabel(p)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Tampilkan
          </button>
        </form>

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-xl bg-emerald-50 px-3.5 py-2 font-semibold text-emerald-700">
            Masuk: {formatRupiah(ledger.incomeTotal)}
          </span>
          <span className="rounded-xl bg-red-50 px-3.5 py-2 font-semibold text-red-600">
            Keluar: {formatRupiah(ledger.expenseTotal)}
          </span>
          <span className="rounded-xl bg-slate-100 px-3.5 py-2 font-semibold text-slate-700">
            Selisih: {formatRupiah(ledger.incomeTotal - ledger.expenseTotal)}
          </span>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Program / Kategori
                </th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Metode</th>
                <th className="px-4 py-3 text-right font-semibold">Masuk</th>
                <th className="px-4 py-3 text-right font-semibold">Keluar</th>
              </tr>
            </thead>
            <tbody>
              {ledger.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Belum ada transaksi terverifikasi pada bulan ini.
                  </td>
                </tr>
              ) : (
                ledger.rows.map((r) => (
                  <tr
                    key={`${r.kind}-${r.id}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatDateID(r.date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {r.kind === "income" ? maskDonorName(r.title, showNames) : r.title}
                      </p>
                      <p className="text-xs text-slate-400 sm:hidden">{r.detail}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                      {r.detail}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {r.kind === "income" ? (
                        <Badge kind="verified">{methodLabel(r.method)}</Badge>
                      ) : (
                        <Badge kind="rejected">Pengeluaran</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-600">
                      {r.kind === "income" ? formatRupiah(r.amount) : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-red-500">
                      {r.kind === "expense" ? formatRupiah(r.amount) : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {ledger.rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                  <td colSpan={4} className="px-4 py-3 text-slate-700">
                    Jumlah {monthLabel(period)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-700">
                    {formatRupiah(ledger.incomeTotal)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {formatRupiah(ledger.expenseTotal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {ledger.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <Link
            href={`${basePath}/transparansi?period=${period}&page=${ledger.page - 1}`}
            className={`rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold ${
              ledger.page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
            }`}
          >
            ← Sebelumnya
          </Link>
          <span className="text-slate-500">
            Halaman {ledger.page} dari {ledger.totalPages}
          </span>
          <Link
            href={`${basePath}/transparansi?period=${period}&page=${ledger.page + 1}`}
            className={`rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold ${
              ledger.page >= ledger.totalPages
                ? "pointer-events-none opacity-40"
                : "hover:bg-slate-50"
            }`}
          >
            Berikutnya →
          </Link>
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Total {ledger.total} transaksi terverifikasi pada bulan {monthLabel(period)}.
        Ingin melihat ringkasannya?{" "}
        <Link
          href={`${basePath}/laporan`}
          className="font-semibold text-emerald-700 hover:underline"
        >
          Lihat laporan bulanan
        </Link>
      </p>
    </div>
  );
}
