import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Building2,
  FileText,
  HandCoins,
  Landmark,
  PiggyBank,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { listMosques, plazaStats } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";
import { APP_NAME } from "@/lib/constants";

export default function PlatformLandingPage() {
  const stats = plazaStats();
  const mosques = listMosques().slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Gratis untuk setiap masjid
          </span>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            Kelola keuangan masjid dengan{" "}
            <span className="text-emerald-200">amanah & transparan</span>
          </h1>
          <p className="mt-5 max-w-2xl text-emerald-50">
            {APP_NAME} membantu pengurus mencatat donasi, mengelola program,
            menerima tabungan qurban, dan mempublikasikan laporan keuangan —
            sehingga jamaah percaya, masjid lebih berkah.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              <Landmark className="h-4 w-4" />
              Daftarkan Masjid Anda
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <PlayCircle className="h-4 w-4" />
              Coba Demo Dulu
            </Link>
          </div>

          <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-emerald-100">Masjid terdaftar</p>
              <p className="mt-1 text-2xl font-bold">{stats.mosqueCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-emerald-100">Donasi tercatat</p>
              <p className="mt-1 text-2xl font-bold">
                {formatRupiah(stats.donationTotal)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-emerald-100">Laporan dipublikasikan</p>
              <p className="mt-1 text-2xl font-bold">{stats.reportCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Semua yang dibutuhkan pengurus masjid
          </h2>
          <p className="mt-2 text-slate-500">
            Dirancang sederhana — bendahara yang belum terbiasa komputer pun
            bisa langsung memakainya.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: HandCoins,
              title: "Program donasi",
              desc: "Campaign dan donasi rutin dengan progres yang tampil real-time.",
            },
            {
              icon: Wallet,
              title: "Konfirmasi donasi online",
              desc: "Donatur mengirim konfirmasi + bukti transfer, bendahara tinggal verifikasi.",
            },
            {
              icon: PiggyBank,
              title: "Tabungan qurban",
              desc: "Kelola peserta qurban kambing/sapi, setoran bertahap, dan progresnya.",
            },
            {
              icon: FileText,
              title: "Laporan bulanan otomatis",
              desc: "Saldo awal, rincian per kategori, saldo akhir — siap dipublikasikan.",
            },
            {
              icon: ShieldCheck,
              title: "Buku kas terbuka",
              desc: "Setiap transaksi terverifikasi bisa dilihat jamaah secara terbuka.",
            },
            {
              icon: Building2,
              title: "Halaman publik masjid",
              desc: "Satu link untuk seluruh informasi keuangan masjid Anda.",
            },
            {
              icon: Banknote,
              title: "Multi pengurus",
              desc: "Akun untuk ketua, bendahara, dan sekretaris dengan akses panel.",
            },
            {
              icon: Sparkles,
              title: "Gratis, tanpa ribet",
              desc: "Cukup daftar — langsung aktif dan siap dipakai hari ini.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Mulai dalam 3 langkah
            </h2>
            <p className="mt-2 text-slate-500">
              Tidak perlu instalasi, tidak perlu kartu kredit.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Daftarkan masjid",
                desc: "Isi nama masjid dan akun pengurus. Masa uji coba langsung aktif.",
              },
              {
                step: "2",
                title: "Catat & kelola",
                desc: "Input program, donasi, pengeluaran, dan tabungan qurban dari panel.",
              },
              {
                step: "3",
                title: "Publikasikan",
                desc: "Bagikan link halaman masjid agar jamaah bisa ikut memantau.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Masjid terdaftar */}
      {mosques.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Masjid yang sudah bergabung
              </h2>
              <p className="mt-1 text-slate-500">
                Kunjungi halaman publik mereka dan lihat transparansinya.
              </p>
            </div>
            <Link
              href="/masjid"
              className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline sm:inline-flex"
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mosques.map((m) => (
              <Link
                key={m.id}
                href={`/m/${m.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  {m.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.logoUrl}
                      alt={m.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Landmark className="h-6 w-6" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 group-hover:text-emerald-700">
                      {m.name}
                    </p>
                    {m.address && (
                      <p className="truncate text-xs text-slate-500">{m.address}</p>
                    )}
                  </div>
                </div>
                {m.tagline && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">{m.tagline}</p>
                )}
                <p className="mt-4 text-xs font-semibold text-emerald-700 group-hover:underline">
                  Buka halaman masjid →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Donasi Anda tercatat, masjid Anda amanah
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-amber-50">
            Setiap masjid mendapat halaman publik sendiri, panel pengurus, dan
            laporan keuangan yang bisa dipertanggungjawabkan — tanpa biaya
            sepeser pun untuk memulai.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              Daftarkan Masjid Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <PlayCircle className="h-4 w-4" />
              Coba Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
