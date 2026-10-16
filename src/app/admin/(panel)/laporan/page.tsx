import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { distinctTransactionPeriods, listReports, periodTotals } from "@/lib/queries";
import { addMonths, currentPeriod, formatRupiah, monthLabel } from "@/lib/format";
import { generateReportAction } from "./actions";

export const metadata: Metadata = { title: "Laporan Bulanan" };

export default function AdminLaporanPage() {
  const current = currentPeriod();
  const months: string[] = [];
  for (let i = 0; i < 6; i++) months.push(addMonths(current, -i));

  const periods = [
    ...new Set([...months, current, ...distinctTransactionPeriods()]),
  ].sort().reverse();

  const reports = new Map(listReports().map((r) => [r.period, r]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Laporan Bulanan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Susun pertanggungjawaban keuangan tiap bulan: buat draft → periksa
          angka → publikasikan ke halaman publik.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Bulan</th>
                <th className="px-4 py-3 text-right font-semibold">Pemasukan</th>
                <th className="px-4 py-3 text-right font-semibold">Pengeluaran</th>
                <th className="px-4 py-3 text-right font-semibold">Selisih</th>
                <th className="px-4 py-3 font-semibold">Status Laporan</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => {
                const live = periodTotals(p);
                const report = reports.get(p);
                return (
                  <tr key={p} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                      {monthLabel(p)}
                      {p === current && (
                        <span className="ml-2 text-xs font-normal text-emerald-600">
                          bulan berjalan
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-emerald-700">
                      {formatRupiah(live.income)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-red-600">
                      {formatRupiah(live.expense)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-700">
                      {formatRupiah(live.net)}
                    </td>
                    <td className="px-4 py-4">
                      {report ? (
                        report.status === "published" ? (
                          <Badge kind="published">Dipublikasikan</Badge>
                        ) : (
                          <Badge kind="draft">Draft</Badge>
                        )
                      ) : (
                        <span className="text-slate-400">Belum dibuat</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      {report ? (
                        <Link
                          href={`/admin/laporan/${p}`}
                          className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                        >
                          Buka
                        </Link>
                      ) : (
                        <form action={generateReportAction} className="inline">
                          <input type="hidden" name="period" value={p} />
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Buat Laporan
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-800">
        <p className="font-semibold">Alur pertanggungjawaban bulanan</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Pastikan semua donasi &amp; pengeluaran bulan tersebut sudah dicatat.</li>
          <li>Klik <span className="font-semibold">Buat Laporan</span> — sistem menghitung otomatis saldo awal, pemasukan, pengeluaran, dan saldo akhir.</li>
          <li>Tambahkan catatan bendahara (opsional), lalu <span className="font-semibold">Publikasikan</span>.</li>
          <li>Setelah dipublikasikan, laporan tampil di halaman publik dan bisa dicetak/disimpan sebagai PDF.</li>
        </ol>
      </div>
    </div>
  );
}
