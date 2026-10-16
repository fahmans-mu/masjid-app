import Link from "next/link";
import { Landmark } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import type { PlatformSettings } from "@/lib/schema";

export function PlatformFooter({ settings }: { settings: PlatformSettings | null }) {
  const year = new Date().getFullYear();
  return (
    <footer className="no-print border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Landmark className="h-4.5 w-4.5" />
            </span>
            <span className="font-bold text-slate-900">{APP_NAME}</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Platform transparansi keuangan masjid. Gratis untuk setiap masjid —
            laporan terbuka, donasi tercatat, amanah terjaga.
          </p>
        </div>
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Jelajahi</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Link href="/masjid" className="hover:text-emerald-700">
              Daftar masjid
            </Link>
            <Link href="/demo" className="hover:text-emerald-700">
              Coba demo
            </Link>
            <Link href="/daftar" className="hover:text-emerald-700">
              Daftarkan masjid Anda
            </Link>
            <Link href="/infaq" className="hover:text-emerald-700">
              Infaq aplikasi
            </Link>
            <Link href="/admin/login" className="hover:text-emerald-700">
              Login pengurus
            </Link>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Kontak</p>
          {settings?.contactPhone && <p className="mt-2">Telp/WA: {settings.contactPhone}</p>}
          {settings?.contactEmail && <p className="mt-1">{settings.contactEmail}</p>}
          <p className="mt-3 text-xs text-slate-400">
            © {year} {APP_NAME}. Dikelola dengan niat baik untuk kemaslahatan
            umat.
          </p>
        </div>
      </div>
    </footer>
  );
}
