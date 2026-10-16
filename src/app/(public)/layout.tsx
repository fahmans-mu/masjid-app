import Link from "next/link";
import { Landmark } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { getSettings } from "@/lib/queries";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav
        mosqueName={s?.mosqueName ?? "Masjid"}
        logoUrl={s?.logoUrl ?? null}
      />
      <main className="flex-1">{children}</main>
      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Landmark className="h-4.5 w-4.5" />
              </span>
              <span className="font-bold text-slate-900">
                {s?.mosqueName ?? "Masjid"}
              </span>
            </div>
            {s?.tagline && (
              <p className="mt-3 text-sm text-slate-500">{s.tagline}</p>
            )}
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Sekretariat</p>
            {s?.address && <p className="mt-2">{s.address}</p>}
            {s?.phone && <p className="mt-1">Telp/WA: {s.phone}</p>}
            {s?.email && <p className="mt-1">{s.email}</p>}
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Informasi</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link href="/program" className="hover:text-emerald-700">
                Program donasi
              </Link>
              <Link href="/laporan" className="hover:text-emerald-700">
                Laporan keuangan bulanan
              </Link>
              <Link href="/transparansi" className="hover:text-emerald-700">
                Buku kas terbuka
              </Link>
              <Link href="/admin/login" className="hover:text-emerald-700">
                Login pengurus
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          {s?.mosqueName ?? "Masjid"} · Laporan keuangan dikelola secara
          transparan dan dapat dipertanggungjawabkan
        </div>
      </footer>
    </div>
  );
}
