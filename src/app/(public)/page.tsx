import Link from "next/link";
import {
  ArrowRight,
  FileText,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DonationMethods } from "@/components/DonationMethods";
import { EmptyState } from "@/components/EmptyState";
import { ProgramCard } from "@/components/ProgramCard";
import {
  getSettings,
  getSummary,
  listReports,
  programsWithRaised,
} from "@/lib/queries";
import { formatRupiah, monthLabel } from "@/lib/format";

export default async function HomePage() {
  const settings = getSettings();
  const summary = getSummary();
  const campaigns = programsWithRaised({ activeOnly: true, type: "campaign" }).slice(0, 3);
  const rutin = programsWithRaised({ activeOnly: true, type: "rutin" }).slice(0, 3);
  const reports = listReports({ publishedOnly: true }).slice(0, 3);
  const mosqueName = settings?.mosqueName ?? "Masjid";

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
            <Wallet className="h-3.5 w-3.5" />
            Transparansi Keuangan Masjid
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            {mosqueName}
          </h1>
          {settings?.tagline && (
            <p className="mt-3 max-w-xl text-emerald-50">{settings.tagline}</p>
          )}

          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-emerald-100">Saldo kas saat ini</p>
              <p className="mt-1 text-2xl font-bold">
                {formatRupiah(summary.balance)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <p className="flex items-center gap-1.5 text-sm text-emerald-100">
                <TrendingUp className="h-4 w-4" /> Total pemasukan
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatRupiah(summary.totalIncome)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <p className="flex items-center gap-1.5 text-sm text-emerald-100">
                <TrendingDown className="h-4 w-4" /> Total pengeluaran
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatRupiah(summary.totalExpense)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/program"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              <HandCoins className="h-4 w-4" />
              Donasi Sekarang
            </Link>
            <Link
              href="/laporan"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <FileText className="h-4 w-4" />
              Lihat Laporan Keuangan
            </Link>
          </div>
        </div>
      </section>

      {/* Campaign aktif */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Campaign Donasi Aktif
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Setiap rupiah tercatat dan dilaporkan penggunaannya.
            </p>
          </div>
          <Link
            href="/program"
            className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline sm:inline-flex"
          >
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <EmptyState
            title="Belum ada campaign aktif"
            description="Campaign penggalangan dana akan tampil di sini."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </section>

      {/* Donasi rutin */}
      {rutin.length > 0 && (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Program Donasi Rutin
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Dukungan bulanan untuk keberlangsungan masjid dan program sosial.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rutin.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cara donasi */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Cara Berdonasi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Transfer melalui rekening resmi masjid atau scan QRIS, lalu kirim
            konfirmasi agar donasi Anda tercatat.
          </p>
        </div>
        <DonationMethods settings={settings} />
        <div className="mt-6">
          <Link
            href="/donasi/konfirmasi"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Kirim Konfirmasi Donasi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Laporan terbaru */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Laporan Bulanan Terbaru
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pertanggungjawaban keuangan yang dipublikasikan setiap bulan.
              </p>
            </div>
            <Link
              href="/laporan"
              className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline sm:inline-flex"
            >
              Semua laporan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {reports.length === 0 ? (
            <EmptyState
              title="Belum ada laporan dipublikasikan"
              description="Laporan bulanan akan muncul setelah bendahara mempublikasikannya."
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
                      Lihat laporan →
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
