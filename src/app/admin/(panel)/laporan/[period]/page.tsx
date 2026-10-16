import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { ActionForm } from "@/components/ActionForm";
import { Badge } from "@/components/Badge";
import { SubmitButton } from "@/components/SubmitButton";
import {
  computeReport,
  getReport,
  parseBreakdown,
} from "@/lib/queries";
import { formatDateTimeID, formatRupiah, isValidPeriod, monthLabel } from "@/lib/format";
import {
  generateReportAction,
  publishReportAction,
  saveSummaryAction,
  unpublishReportAction,
} from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ period: string }>;
}): Promise<Metadata> {
  const { period } = await params;
  return { title: `Laporan ${isValidPeriod(period) ? monthLabel(period) : ""}` };
}

function MiniTable({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: { name: string; amount: number }[] | undefined;
  tone: "income" | "expense";
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-2 text-sm font-bold text-slate-900">{title}</p>
      <ul className="space-y-1.5 text-sm">
        {rows.map((r) => (
          <li key={r.name} className="flex justify-between gap-3">
            <span className="text-slate-600">{r.name}</span>
            <span
              className={`whitespace-nowrap font-medium ${
                tone === "income" ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {formatRupiah(r.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AdminLaporanDetailPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  if (!isValidPeriod(period)) notFound();

  const report = getReport(period);
  const live = computeReport(period);

  const isStale =
    report?.status === "draft" &&
    (report.totalIncome !== live.totalIncome ||
      report.totalExpense !== live.totalExpense);
  const breakdown = parseBreakdown(report);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/laporan"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar laporan
      </Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">
            Laporan {monthLabel(period)}
          </h1>
          {report &&
            (report.status === "published" ? (
              <Badge kind="published">Dipublikasikan</Badge>
            ) : (
              <Badge kind="draft">Draft</Badge>
            ))}
        </div>
        {report && (
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/export/laporan/${period}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> CSV
            </a>
            {report.status === "published" && (
              <Link
                href={`/laporan/${period}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" /> Halaman publik
              </Link>
            )}
          </div>
        )}
      </div>

      {!report ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="font-semibold text-slate-800">
            Laporan belum dibuat untuk bulan ini
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Sistem akan menghitung otomatis: saldo awal{" "}
            <span className="font-medium">{formatRupiah(live.openingBalance)}</span>,
            pemasukan <span className="font-medium">{formatRupiah(live.totalIncome)}</span>,
            pengeluaran <span className="font-medium">{formatRupiah(live.totalExpense)}</span>,
            saldo akhir <span className="font-medium">{formatRupiah(live.closingBalance)}</span>.
          </p>
          <form action={generateReportAction} className="mt-5">
            <input type="hidden" name="period" value={period} />
            <SubmitButton pendingText="Menghitung...">Buat Laporan Draft</SubmitButton>
          </form>
        </div>
      ) : (
        <>
          {isStale && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Ada transaksi baru sejak draft dibuat (kini: pemasukan{" "}
              {formatRupiah(live.totalIncome)}, pengeluaran{" "}
              {formatRupiah(live.totalExpense)}). Klik{" "}
              <span className="font-semibold">Perbarui Angka</span> agar laporan
              mengikuti data terbaru.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Saldo awal</p>
              <p className="mt-1 font-bold text-slate-900">
                {formatRupiah(report.openingBalance)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">
                Pemasukan{breakdown ? ` (${breakdown.donationCount})` : ""}
              </p>
              <p className="mt-1 font-bold text-emerald-700">
                + {formatRupiah(report.totalIncome)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">
                Pengeluaran{breakdown ? ` (${breakdown.expenseCount})` : ""}
              </p>
              <p className="mt-1 font-bold text-red-600">
                − {formatRupiah(report.totalExpense)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-700">Saldo akhir</p>
              <p className="mt-1 font-bold text-emerald-800">
                {formatRupiah(report.closingBalance)}
              </p>
            </div>
          </div>

          {breakdown && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <MiniTable
                title="Pemasukan per kategori"
                rows={breakdown.incomeByCategory}
                tone="income"
              />
              <MiniTable
                title="Pemasukan per program"
                rows={breakdown.incomeByProgram}
                tone="income"
              />
              <MiniTable
                title="Pengeluaran per kategori"
                rows={breakdown.expenseByCategory}
                tone="expense"
              />
              <MiniTable
                title="Pengeluaran per program"
                rows={breakdown.expenseByProgram}
                tone="expense"
              />
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold text-slate-900">Catatan bendahara</p>
            <p className="mt-1 text-sm text-slate-500">
              Ditampilkan di laporan publik — sampaikan ringkasan, ucapan
              terima kasih, atau penjelasan penggunaan dana.
            </p>
            <div className="mt-4">
              <ActionForm action={saveSummaryAction} className="space-y-3">
                <input type="hidden" name="period" value={period} />
                <textarea
                  name="summary"
                  rows={4}
                  defaultValue={report.summary ?? ""}
                  placeholder="cth: Alhamdulillah, total pemasukan bulan ini Rp... dan telah digunakan untuk..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <SubmitButton variant="secondary" pendingText="Menyimpan...">
                  Simpan Catatan
                </SubmitButton>
              </ActionForm>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-3">
              {report.status === "draft" ? (
                <>
                  <form action={generateReportAction}>
                    <input type="hidden" name="period" value={period} />
                    <SubmitButton variant="secondary" pendingText="Menghitung...">
                      Perbarui Angka
                    </SubmitButton>
                  </form>
                  <form action={publishReportAction}>
                    <input type="hidden" name="period" value={period} />
                    <SubmitButton pendingText="Mempublikasikan...">
                      Publikasikan ke Halaman Publik
                    </SubmitButton>
                  </form>
                </>
              ) : (
                <>
                  <form action={unpublishReportAction}>
                    <input type="hidden" name="period" value={period} />
                    <SubmitButton variant="secondary" pendingText="Memproses...">
                      Batalkan Publikasi
                    </SubmitButton>
                  </form>
                  <p className="text-sm text-slate-500">
                    Dipublikasikan {formatDateTimeID(report.publishedAt)}.
                    Jamaah dapat melihat &amp; mencetak laporan ini.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
