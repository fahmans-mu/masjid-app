import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Building2, Gift, Smartphone } from "lucide-react";
import { AppInfaqForm } from "@/components/AppInfaqForm";
import { CopyButton } from "@/components/CopyButton";
import { getPlatformSettings, listMosques } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Infaq Aplikasi",
};

export default function InfaqPage() {
  const platform = getPlatformSettings();
  const monthlyAmount = platform?.monthlyAmount ?? 50000;
  const mosques = listMosques().map((m) => ({ id: m.id, name: m.name, slug: m.slug }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          <Gift className="h-3.5 w-3.5" />
          Infaq Aplikasi
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Menjaga aplikasi tetap hidup, dengan cara yang berkah
        </h1>
        <p className="mt-3 text-slate-500">
          MasjidAmanah gratis untuk memulai. Agar layanan terus berjalan, setiap
          masjid melanjutkan masa aktif melalui infaq aplikasi sukarela —{" "}
          <span className="font-semibold text-slate-700">
            {formatRupiah(monthlyAmount)}/bulan
          </span>
          . Tidak ada iklan, tidak ada potongan dari donasi jamaah.
        </p>
      </div>

      {/* Paket */}
      <div className="grid gap-5 sm:grid-cols-3">
        {([1, 6, 12] as const).map((mo) => (
          <div
            key={mo}
            className={`rounded-2xl border bg-white p-6 text-center ${
              mo === 6 ? "border-emerald-500 shadow-lg" : "border-slate-200"
            }`}
          >
            {mo === 6 && (
              <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Paling populer
              </span>
            )}
            <p className="text-sm text-slate-500">
              {mo === 1 ? "Bulanan" : mo === 6 ? "6 Bulan" : "Tahunan"}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatRupiah(monthlyAmount * mo)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {mo === 1
                ? "Bayar per bulan"
                : mo === 6
                  ? `${formatRupiah(monthlyAmount)}/bulan · setengah tahun`
                  : `${formatRupiah(monthlyAmount)}/bulan · hemat waktu`}
            </p>
            <ul className="mt-5 space-y-2 text-left text-sm text-slate-600">
              <li>✓ Masa aktif panel pengurus</li>
              <li>✓ Halaman publik masjid tetap tayang</li>
              <li>✓ Semua fitur lengkap (donasi, qurban, laporan)</li>
              <li>✓ Tanpa potongan dari donasi jamaah</li>
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">
        <p>
          <span className="font-semibold">Catatan:</span> jika masa aktif
          habis, halaman publik masjid tetap bisa diakses jamaah — hanya panel
          pengurus yang terkunci sementara sampai infaq diverifikasi.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        {/* Cara bayar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-slate-900">Cara Membayar Infaq</h2>
            <ol className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  1
                </span>
                Transfer sesuai nominal paket ke rekening berikut.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  2
                </span>
                Kirim konfirmasi lewat formulir ini + unggah bukti transfer.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  3
                </span>
                Tim MasjidAmanah memverifikasi maksimal 1×24 jam — masa aktif
                langsung diperpanjang.
              </li>
            </ol>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Rekening Infaq
              </div>
              {platform?.bankName || platform?.bankAccount ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-500">{platform?.bankName}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-lg font-bold tracking-wide text-slate-900">
                      {platform?.bankAccount}
                    </p>
                    {platform?.bankAccount && <CopyButton text={platform.bankAccount} />}
                  </div>
                  {platform?.bankHolder && (
                    <p className="text-sm text-slate-500">a.n. {platform.bankHolder}</p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Info rekening infaq belum diatur. Hubungi tim MasjidAmanah.
                </p>
              )}
              {platform?.infaqNote && (
                <p className="mt-3 text-xs text-slate-500">{platform.infaqNote}</p>
              )}
            </div>

            {platform?.contactPhone && (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Smartphone className="h-4 w-4 text-slate-400" />
                Butuh bantuan? WA: {platform.contactPhone}
              </p>
            )}
          </div>
        </div>

        {/* Form konfirmasi */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="flex items-center gap-2 font-bold text-slate-900">
              <Banknote className="h-5 w-5 text-emerald-600" />
              Konfirmasi Pembayaran Infaq
            </h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Sudah transfer? Isi data berikut agar masa aktif masjid segera
              diperpanjang.
            </p>
            <AppInfaqForm mosques={mosques} monthlyAmount={monthlyAmount} />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Belum mendaftarkan masjid?{" "}
        <Link href="/daftar" className="font-semibold text-emerald-700 hover:underline">
          Daftar gratis di sini
        </Link>
      </p>
    </div>
  );
}
