import type { Metadata } from "next";
import Link from "next/link";
import {
  Ban,
  Building2,
  Gift,
  Hourglass,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { StatCard } from "@/components/StatCard";
import {
  listAppInfaqs,
  listMosquesForAdmin,
  mosqueStatus,
  superSummary,
} from "@/lib/queries";
import { formatDateID, formatDateTimeID, formatRupiah } from "@/lib/format";
import { methodLabel } from "@/lib/action-utils";

export const metadata: Metadata = { title: "Ringkasan Platform" };

const STATUS_UI: Record<string, { kind: string; label: string }> = {
  aktif: { kind: "aktif", label: "Aktif" },
  "tak-terbatas": { kind: "campaign", label: "Tanpa Batas" },
  kadaluarsa: { kind: "rejected", label: "Kadaluarsa" },
  nonaktif: { kind: "selesai", label: "Nonaktif" },
};

export default function SuperadminHomePage() {
  const summary = superSummary();
  const pendingInfaqs = listAppInfaqs("pending").slice(0, 5);
  const latestMosques = listMosquesForAdmin().slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Ringkasan Platform</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau masjid terdaftar, masa aktif, dan infaq aplikasi yang menunggu
          verifikasi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Masjid"
          value={String(summary.total)}
          sub={`${summary.aktif} aktif · ${summary.nonaktif} nonaktif`}
          icon={Building2}
          tone="sky"
        />
        <StatCard
          label="Masa Aktif Terbatas"
          value={String(summary.trial)}
          sub="Masjid dengan tanggal berakhir"
          icon={Hourglass}
          tone="amber"
        />
        <StatCard
          label="Kadaluarsa"
          value={String(summary.kadaluarsa)}
          sub="Panel terkunci, halaman publik tetap tayang"
          icon={Ban}
          tone="red"
        />
        <StatCard
          label="Infaq Menunggu"
          value={String(summary.pendingInfaq)}
          sub="Perlu diverifikasi"
          icon={Gift}
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Infaq Menunggu Verifikasi</h2>
            <Link
              href="/superadmin/infaq"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Kelola
            </Link>
          </div>
          {pendingInfaqs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Tidak ada infaq yang menunggu. Alhamdulillah.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingInfaqs.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {f.mosqueName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {f.months} bulan · {methodLabel(f.method)} ·{" "}
                      {formatDateTimeID(f.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">
                    {formatRupiah(f.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Masjid Terbaru</h2>
            <Link
              href="/superadmin/masjid"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Lihat semua
            </Link>
          </div>
          {latestMosques.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Belum ada masjid terdaftar.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {latestMosques.map((m) => {
                const st = STATUS_UI[mosqueStatus(m)];
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {m.name}
                        {m.isDemo && (
                          <span className="ml-2">
                            <Badge kind="campaign">Demo</Badge>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        /m/{m.slug} · daftar {formatDateID(m.createdAt.toISOString().slice(0, 10))}
                      </p>
                    </div>
                    <Badge kind={st.kind}>{st.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-sm text-indigo-900">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" /> Cara kerja verifikasi infaq
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Masjid mengirim infaq aplikasi + bukti transfer dari halaman /infaq.</li>
          <li>Anda verifikasi di menu Infaq Aplikasi — masa aktif masjid otomatis diperpanjang sesuai paket (1/6/12 bulan).</li>
          <li>Jika masa aktif habis, panel masjid terkunci tetapi halaman publik tetap tayang sampai infaq berikutnya.</li>
        </ol>
      </div>
    </div>
  );
}
