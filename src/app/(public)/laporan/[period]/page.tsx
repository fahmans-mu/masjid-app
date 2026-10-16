import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Landmark } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";
import { getReport, getSettings, parseBreakdown } from "@/lib/queries";
import { formatDateTimeID, formatRupiah, monthLabel } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ period: string }>;
}): Promise<Metadata> {
  const { period } = await params;
  const report = getReport(period);
  return {
    title: report
      ? `Laporan Keuangan ${monthLabel(period)}`
      : "Laporan Keuangan",
  };
}

function BreakdownTable({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: { name: string; amount: number }[];
  tone: "income" | "expense";
}) {
  if (rows.length === 0) return null;
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return (
    <div className="mt-8">
      <h2 className="mb-3 font-bold text-slate-900">{title}</h2>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-slate-100">
              <td className="py-2 pr-4 text-slate-600">{r.name}</td>
              <td className="py-2 text-right font-medium text-slate-800">
                {formatRupiah(r.amount)}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-slate-200">
            <td className="py-2 pr-4 font-semibold text-slate-900">
              Jumlah {tone === "income" ? "pemasukan" : "pengeluaran"}
            </td>
            <td
              className={`py-2 text-right font-bold ${
                tone === "income" ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {formatRupiah(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default async function LaporanDetailPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  const report = getReport(period);
  if (!report || report.status !== "published") notFound();

  const settings = getSettings();
  const breakdown = parseBreakdown(report);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/laporan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Semua laporan
        </Link>
        <PrintButton />
      </div>

      <article className="print-plain rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
        {/* Kop laporan */}
        <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-5">
          {settings?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Landmark className="h-8 w-8" />
            </span>
          )}
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide text-slate-900">
              {settings?.mosqueName ?? "Masjid"}
            </h1>
            {settings?.address && (
              <p className="text-sm text-slate-500">{settings.address}</p>
            )}
            <p className="text-sm text-slate-500">
              {[settings?.phone, settings?.email].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Laporan Keuangan
          </h2>
          <p className="mt-1 text-slate-600">
            Bulan {monthLabel(report.period)}
          </p>
          {report.publishedAt && (
            <p className="mt-1 text-xs text-slate-400">
              Dipublikasikan {formatDateTimeID(report.publishedAt)}
            </p>
          )}
        </div>

        {/* Ringkasan */}
        <table className="mt-8 w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2.5 text-slate-600">Saldo awal bulan</td>
              <td className="py-2.5 text-right font-medium text-slate-800">
                {formatRupiah(report.openingBalance)}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2.5 text-slate-600">
                Pemasukan bulan ini{breakdown ? ` (${breakdown.donationCount} transaksi)` : ""}
              </td>
              <td className="py-2.5 text-right font-medium text-emerald-700">
                + {formatRupiah(report.totalIncome)}
              </td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-2.5 text-slate-600">
                Pengeluaran bulan ini{breakdown ? ` (${breakdown.expenseCount} transaksi)` : ""}
              </td>
              <td className="py-2.5 text-right font-medium text-red-600">
                − {formatRupiah(report.totalExpense)}
              </td>
            </tr>
            <tr className="bg-emerald-50">
              <td className="py-3 pl-2 font-bold text-slate-900">
                Saldo akhir bulan
              </td>
              <td className="py-3 pr-2 text-right text-base font-bold text-emerald-800">
                {formatRupiah(report.closingBalance)}
              </td>
            </tr>
          </tbody>
        </table>

        {breakdown && (
          <>
            <BreakdownTable
              title="Rincian Pemasukan per Kategori"
              rows={breakdown.incomeByCategory}
              tone="income"
            />
            <BreakdownTable
              title="Rincian Pemasukan per Program"
              rows={breakdown.incomeByProgram}
              tone="income"
            />
            <BreakdownTable
              title="Rincian Pengeluaran per Kategori"
              rows={breakdown.expenseByCategory}
              tone="expense"
            />
            <BreakdownTable
              title="Rincian Pengeluaran per Program"
              rows={breakdown.expenseByProgram}
              tone="expense"
            />
          </>
        )}

        {report.summary && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-2 text-sm font-bold text-slate-900">
              Catatan Bendahara
            </p>
            <p className="whitespace-pre-line text-sm text-slate-600">
              {report.summary}
            </p>
          </div>
        )}

        {/* Tanda tangan */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-sm">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-medium text-slate-700">Ketua DKM</p>
            <div className="mt-20 border-t border-slate-300 pt-1 text-slate-500">
              (............................................)
            </div>
          </div>
          <div>
            <p className="text-slate-500">&nbsp;</p>
            <p className="font-medium text-slate-700">Bendahara</p>
            <div className="mt-20 border-t border-slate-300 pt-1 text-slate-500">
              (............................................)
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          Laporan ini dihasilkan dari sistem pencatatan keuangan masjid dan
          dipublikasikan secara terbuka untuk seluruh jamaah.
        </p>
      </article>

      <div className="no-print mt-5 text-center">
        <Link
          href={`/transparansi?period=${report.period}`}
          className="text-sm font-semibold text-emerald-700 hover:underline"
        >
          Lihat rincian transaksi bulan ini di buku kas publik →
        </Link>
      </div>
    </div>
  );
}
