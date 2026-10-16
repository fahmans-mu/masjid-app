import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { listReports } from "@/lib/queries";
import { formatDateTimeID, formatRupiah, monthLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Laporan Keuangan",
};

export default function LaporanListPage() {
  const reports = listReports({ publishedOnly: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Laporan Keuangan Bulanan
        </h1>
        <p className="mt-2 text-slate-500">
          Bentuk pertanggungjawaban pengurus kepada seluruh jamaah. Setiap
          laporan memuat saldo awal, rincian pemasukan dan pengeluaran, serta
          saldo akhir bulan — dipublikasikan paling lambat awal bulan
          berikutnya.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="Belum ada laporan dipublikasikan"
          description="Laporan bulanan akan tampil di sini setelah dipublikasikan bendahara."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/laporan/${r.period}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 rounded-xl bg-emerald-50 p-1.5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 group-hover:underline">
                  Buka laporan →
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {monthLabel(r.period)}
              </h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Pemasukan</dt>
                  <dd className="font-semibold text-emerald-600">
                    + {formatRupiah(r.totalIncome)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Pengeluaran</dt>
                  <dd className="font-semibold text-red-500">
                    − {formatRupiah(r.totalExpense)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5">
                  <dt className="font-medium text-slate-700">Saldo akhir</dt>
                  <dd className="font-bold text-slate-900">
                    {formatRupiah(r.closingBalance)}
                  </dd>
                </div>
              </dl>
              {r.publishedAt && (
                <p className="mt-3 text-xs text-slate-400">
                  Dipublikasikan {formatDateTimeID(r.publishedAt)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
