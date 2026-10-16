import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  FileText,
  Plus,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";
import { requireSession } from "@/lib/auth";
import {
  getReport,
  getSummary,
  listDonations,
  monthlySeries,
  periodTotals,
  programsWithRaised,
} from "@/lib/queries";
import {
  addMonths,
  currentPeriod,
  formatDateID,
  formatRupiah,
  formatRupiahRingkas,
  monthLabel,
  percent,
} from "@/lib/format";
import { methodLabel, statusLabel } from "@/lib/action-utils";
import { rejectDonationAction, verifyDonationAction } from "./donasi/actions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const period = currentPeriod();
  const prevPeriod = addMonths(period, -1);

  const summary = getSummary();
  const thisMonth = periodTotals(period);
  const months = Array.from({ length: 6 }, (_, i) => addMonths(period, i - 5));
  const series = monthlySeries(months);
  const maxValue = Math.max(1, ...series.flatMap((s) => [s.income, s.expense]));

  const pending = listDonations({ status: "pending", perPage: 5 });
  const recent = listDonations({ perPage: 5 });
  const campaigns = programsWithRaised({ activeOnly: true, type: "campaign" }).slice(0, 4);

  const prevReport = getReport(prevPeriod);
  const showReportReminder = !prevReport || prevReport.status !== "published";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Assalamu&apos;alaikum, {session.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan keuangan masjid per {monthLabel(period)}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/donasi/new"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" /> Input Donasi
          </Link>
          <Link
            href="/admin/pengeluaran/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Catat Pengeluaran
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saldo Kas"
          value={formatRupiah(summary.balance)}
          sub="Total pemasukan dikurangi pengeluaran"
          icon={Wallet}
          tone="sky"
        />
        <StatCard
          label={`Pemasukan ${monthLabel(period)}`}
          value={formatRupiah(thisMonth.income)}
          sub={`Seluruh donasi terverifikasi bulan ini`}
          icon={ArrowUpCircle}
          tone="emerald"
        />
        <StatCard
          label={`Pengeluaran ${monthLabel(period)}`}
          value={formatRupiah(thisMonth.expense)}
          sub={`Selisih bulan ini: ${formatRupiah(thisMonth.net)}`}
          icon={ArrowDownCircle}
          tone="red"
        />
        <StatCard
          label="Donasi Menunggu Verifikasi"
          value={String(pending.total)}
          sub={pending.total > 0 ? "Perlu ditindaklanjuti" : "Semua sudah diverifikasi"}
          icon={Clock}
          tone="amber"
        />
      </div>

      {showReportReminder && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              {prevReport
                ? `Laporan ${monthLabel(prevPeriod)} masih berstatus draf dan belum dipublikasikan.`
                : `Laporan ${monthLabel(prevPeriod)} belum dibuat.`}
            </p>
          </div>
          <Link
            href={`/admin/laporan/${prevPeriod}`}
            className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Buka Laporan
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Grafik arus kas */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Arus Kas 6 Bulan Terakhir</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Masuk
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Keluar
              </span>
            </div>
          </div>
          <div className="flex h-48 items-end gap-3 sm:gap-5">
            {series.map((s) => (
              <div key={s.period} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <div className="flex h-36 w-full items-end justify-center gap-1.5">
                  <div
                    className="w-1/3 max-w-6 rounded-t-md bg-emerald-500"
                    style={{ height: `${Math.max(s.income > 0 ? 3 : 0, (s.income / maxValue) * 100)}%` }}
                    title={`Masuk ${formatRupiah(s.income)}`}
                  />
                  <div
                    className="w-1/3 max-w-6 rounded-t-md bg-red-400"
                    style={{ height: `${Math.max(s.expense > 0 ? 3 : 0, (s.expense / maxValue) * 100)}%` }}
                    title={`Keluar ${formatRupiah(s.expense)}`}
                  />
                </div>
                <p className="truncate text-xs font-medium text-slate-500">
                  {monthLabel(s.period).split(" ")[0]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Donasi terbaru */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Donasi Terbaru</h2>
            <Link
              href="/admin/donasi"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Lihat semua
            </Link>
          </div>
          {recent.rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Belum ada donasi.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.rows.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{d.donorName}</p>
                    <p className="truncate text-xs text-slate-400">
                      {formatDateID(d.donatedAt)} · {d.programTitle ?? d.categoryName ?? "Donasi umum"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatRupiah(d.amount)}</p>
                    <Badge kind={d.status}>{statusLabel(d.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Perlu verifikasi */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Perlu Verifikasi</h2>
            {pending.total > 5 && (
              <Link
                href="/admin/donasi?status=pending"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                +{pending.total - 5} lainnya
              </Link>
            )}
          </div>
          {pending.rows.length === 0 ? (
            <div className="py-4">
              <EmptyState
                title="Tidak ada donasi pending"
                description="Semua konfirmasi donasi sudah ditindaklanjuti. Alhamdulillah."
              />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.rows.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {d.donorName}{" "}
                      <span className="font-semibold text-slate-900">{formatRupiah(d.amount)}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateID(d.donatedAt)} · {methodLabel(d.method)} ·{" "}
                      {d.programTitle ?? d.categoryName ?? "Donasi umum"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {d.proofUrl && (
                      <a
                        href={d.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50"
                      >
                        Bukti
                      </a>
                    )}
                    <form action={verifyDonationAction} className="inline">
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Verifikasi
                      </button>
                    </form>
                    <form action={rejectDonationAction} className="inline">
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Tolak
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Progress campaign */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Campaign Aktif</h2>
            <Link
              href="/admin/program"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Kelola
            </Link>
          </div>
          {campaigns.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Belum ada campaign aktif.
            </p>
          ) : (
            <ul className="space-y-4">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                    <Link
                      href={`/admin/program/${c.id}/edit`}
                      className="truncate font-medium text-slate-800 hover:text-emerald-700"
                    >
                      {c.title}
                    </Link>
                    <span className="shrink-0 text-xs font-semibold text-slate-500">
                      {percent(c.raised, Number(c.targetAmount ?? 0))}%
                    </span>
                  </div>
                  <ProgressBar value={c.raised} target={c.targetAmount} tone="emerald" />
                  <p className="mt-1 text-xs text-slate-400">
                    {formatRupiahRingkas(c.raised)} dari{" "}
                    {formatRupiahRingkas(c.targetAmount)} · bulan ini{" "}
                    {formatRupiahRingkas(c.raisedThisMonth)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
