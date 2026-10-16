import Link from "next/link";
import { Lock } from "lucide-react";
import { requireMosqueSession } from "@/lib/auth";
import { getMosqueById, isMosqueExpired } from "@/lib/queries";
import { formatDateID } from "@/lib/format";

export default async function AktifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return null;

  if (!mosque.isDemo && isMosqueExpired(mosque)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Masa aktif panel berakhir
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Masa aktif {mosque.name} berakhir pada{" "}
            {mosque.activeUntil ? formatDateID(mosque.activeUntil.toISOString().slice(0, 10)) : "-"}.
            Halaman publik masjid tetap tayang untuk jamaah — panel pengurus
            terkunci sementara.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Aktifkan kembali dengan infaq aplikasi sukarela. Data Anda tetap
            tersimpan dan langsung bisa diakses setelah infaq diverifikasi.
          </p>
          <Link
            href="/admin/infaq"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Aktifkan Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
